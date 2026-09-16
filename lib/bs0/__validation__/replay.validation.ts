import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DETERMINISTIC_RULESET_VERSION,
  REPORT_GENERATOR_VERSION,
  REPORT_SCHEMA_VERSION,
  createCanonicalReviewRunManifest,
  reportFingerprint,
  reviewConfigurationFingerprint,
  reviewInputFingerprint,
  stableSerialize,
  type CanonicalRunVerificationRecord,
} from "../../canonical-review-run";
import { normalizeChangePassport, type ChangePassport } from "../../change-passport";
import { buildEvidenceHierarchy } from "../../evidence-hierarchy";
import { buildMergeContract } from "../../merge-contract";
import { generateReport, type ReportInput } from "../../report-generator";
import { RISKY_TESTS_REQUIRED_SAMPLE } from "../../sample-pr-input";

type Test = { name: string; run: () => void };
const tests: Test[] = [];
const test = (name: string, run: () => void): void => { tests.push({ name, run }); };

function fail(message: string): never { throw new Error(message); }
function assert(value: unknown, message: string): asserts value {
  if (!value) fail(message);
}
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) fail(`${message}: expected ${String(expected)}, received ${String(actual)}`);
}
function notEqual<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) fail(`${message}: both values were ${String(actual)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) fail(`${message}: expected ${right}, received ${left}`);
}

const CREATED_AT = "2026-09-08T18:00:00.000Z";
const LATER_CREATED_AT = "2026-09-09T18:00:00.000Z";
const BASE_SHA = "base-bs0-replay";
const HEAD_SHA = "head-bs0-replay";
const PULL_REQUEST_NUMBER = 482;
const SOURCE_URL = "https://github.com/acme/redemption-api/pull/482";

const routeSource = readFileSync(
  join(process.cwd(), "app", "api", "github-app", "route.ts"),
  "utf8",
);
const canonicalSource = readFileSync(
  join(process.cwd(), "lib", "canonical-review-run.ts"),
  "utf8",
);
const storeSource = readFileSync(
  join(process.cwd(), "lib", "github-app-store.ts"),
  "utf8",
);

function sourceSlice(source: string, startToken: string, endToken: string, label: string): string {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start + startToken.length);
  assert(start >= 0 && end > start, `${label} source boundary must exist`);
  return source.slice(start, end);
}

const verifyRunSource = sourceSlice(
  routeSource,
  'if (record.action === "verify-run") {',
  'if (record.action === "contract-recheck") {',
  "verify-run",
);
const configurationFunctionSource = sourceSlice(
  canonicalSource,
  "export function reviewConfigurationFingerprint",
  "export function reportFingerprint",
  "configuration fingerprint",
);
const verificationRecordTypeSource = sourceSlice(
  canonicalSource,
  "export type CanonicalRunVerificationRecord",
  "function normaliseValue",
  "verification record type",
);

function githubInput(passport?: ChangePassport): ReportInput {
  return {
    ...RISKY_TESTS_REQUIRED_SAMPLE,
    inputSource: "github-pr",
    reviewProfile: "standard",
    ...(passport ? { changePassport: passport } : {}),
  };
}

function manifest(input: ReportInput, options: {
  createdAt?: string;
  sourceUrl?: string;
} = {}) {
  const report = generateReport(input);
  const canonicalRun = createCanonicalReviewRunManifest({
    input,
    report,
    sourceType: "github-app",
    analysisSource: "deterministic",
    sourceUrl: options.sourceUrl,
    baseSha: BASE_SHA,
    headSha: HEAD_SHA,
    pullRequestNumber: PULL_REQUEST_NUMBER,
    createdAt: options.createdAt ?? CREATED_AT,
    completedAt: options.createdAt ?? CREATED_AT,
  });
  return { report, canonicalRun };
}

function deterministicPassport(): ChangePassport {
  const passport = normalizeChangePassport({
    producerType: "agent",
    taskIntent: "Add safe retry handling for partner discount-code retrieval.",
    changeSummary: "Adds a second provider attempt after a timeout.",
    producer: {
      tool: "Cursor",
      provider: "Example provider",
      model: "example-builder-model",
      externalRunId: "builder-run-replay",
    },
    claimedFiles: ["app/services/redemption_service.py"],
    claimedSurfaces: ["External provider boundary"],
    claimedValidation: ["pytest tests/test_redemption_service.py"],
    assumptions: ["The provider honours an idempotency key."],
    unresolvedUncertainty: ["A timeout may occur after provider acceptance."],
  }, "github-pr-body");
  assert(passport, "deterministic Change Passport must normalize");
  return {
    ...passport,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

test("R1 - identical deterministic reconstruction preserves all current identities", () => {
  const input = githubInput();
  const first = manifest(input, { createdAt: CREATED_AT, sourceUrl: SOURCE_URL });
  const second = manifest(structuredClone(input), {
    createdAt: LATER_CREATED_AT,
    sourceUrl: SOURCE_URL,
  });

  deepEqual(first.report, second.report, "deterministic Reports are equal");
  equal(reportFingerprint(first.report), reportFingerprint(second.report), "Report fingerprints are equal");
  equal(first.canonicalRun.inputFingerprint, second.canonicalRun.inputFingerprint, "input fingerprints are equal");
  equal(first.canonicalRun.configurationFingerprint, second.canonicalRun.configurationFingerprint, "configuration fingerprints are equal");
  equal(first.canonicalRun.resultFingerprint, second.canonicalRun.resultFingerprint, "result fingerprints are equal");
  equal(first.canonicalRun.runId, second.canonicalRun.runId, "derived run identities are equal");
  notEqual(first.canonicalRun.createdAt, second.canonicalRun.createdAt, "fixture timestamps differ");
  equal(first.canonicalRun.reproducibility, "exact", "deterministic GitHub App manifest is classified exact");
});

test("R2 - replay-style Passport omission preserves Report result but changes verification basis", () => {
  const passport = deterministicPassport();
  const originalInput = githubInput(passport);
  const replayInput = githubInput();
  const original = manifest(originalInput);
  const replay = manifest(replayInput);

  deepEqual(original.report, replay.report, "Passport omission does not change generated Report");
  notEqual(original.canonicalRun.inputFingerprint, replay.canonicalRun.inputFingerprint, "Passport omission changes input fingerprint");
  equal(original.canonicalRun.configurationFingerprint, replay.canonicalRun.configurationFingerprint, "Passport omission does not change configuration fingerprint");
  equal(original.canonicalRun.resultFingerprint, replay.canonicalRun.resultFingerprint, "Passport omission does not change result fingerprint");
  equal(reportFingerprint(original.report), reportFingerprint(replay.report), "Report fingerprints remain equal");
  notEqual(original.canonicalRun.runId, replay.canonicalRun.runId, "Passport omission changes derived run identity");
  notEqual(
    original.canonicalRun.evidenceHierarchy?.evidenceFingerprint,
    replay.canonicalRun.evidenceHierarchy?.evidenceFingerprint,
    "Passport omission changes Evidence identity",
  );
  notEqual(
    original.canonicalRun.mergeContract?.contractFingerprint,
    replay.canonicalRun.mergeContract?.contractFingerprint,
    "Passport omission changes Contract identity",
  );
  assert(!("changePassport" in replayInput), "replay-style input omits the Passport");
});

test("R3 - source URL contributes only to canonical input identity in this reconstruction", () => {
  const input = githubInput();
  const original = manifest(input, { sourceUrl: SOURCE_URL });
  const replay = manifest(input);

  equal(original.canonicalRun.sourceUrl, SOURCE_URL, "original manifest retains source URL");
  equal(replay.canonicalRun.sourceUrl, undefined, "replay-style manifest omits source URL");
  deepEqual(original.report, replay.report, "source URL omission does not change Report");
  notEqual(original.canonicalRun.inputFingerprint, replay.canonicalRun.inputFingerprint, "source URL omission changes input fingerprint");
  equal(original.canonicalRun.configurationFingerprint, replay.canonicalRun.configurationFingerprint, "source URL omission does not change configuration fingerprint");
  equal(original.canonicalRun.resultFingerprint, replay.canonicalRun.resultFingerprint, "source URL omission does not change result fingerprint");
  notEqual(original.canonicalRun.runId, replay.canonicalRun.runId, "source URL omission changes derived run identity");
  assert(!verifyRunSource.includes("sourceUrl"), "production verify-run does not restore source URL");
});

test("R4 - canonical string serialization collapses whitespace before input fingerprinting", () => {
  const spaced = githubInput();
  const canonical = githubInput();
  spaced.title = "  Add   fallback\n\thandling for failed discount-code retrieval  ";
  canonical.title = "Add fallback handling for failed discount-code retrieval";

  notEqual(spaced.title, canonical.title, "surface strings differ");
  equal(stableSerialize({ title: spaced.title }), stableSerialize({ title: canonical.title }), "stable serialization collapses and trims string whitespace");
  equal(
    reviewInputFingerprint(spaced, {
      sourceType: "github-app",
      baseSha: BASE_SHA,
      headSha: HEAD_SHA,
      pullRequestNumber: PULL_REQUEST_NUMBER,
    }),
    reviewInputFingerprint(canonical, {
      sourceType: "github-app",
      baseSha: BASE_SHA,
      headSha: HEAD_SHA,
      pullRequestNumber: PULL_REQUEST_NUMBER,
    }),
    "canonicalized title whitespace produces the same input fingerprint",
  );
});

test("R5 - configuration fingerprint covers declared configuration, not implementation source", () => {
  const implicitStandard: Pick<ReportInput, "reviewProfile"> = {};
  const explicitStandard: Pick<ReportInput, "reviewProfile"> = { reviewProfile: "standard" };
  const deepReview: Pick<ReportInput, "reviewProfile"> = { reviewProfile: "deep-review" };

  equal(
    reviewConfigurationFingerprint(implicitStandard, "deterministic"),
    reviewConfigurationFingerprint(explicitStandard, "deterministic"),
    "implicit and explicit standard profile are equivalent",
  );
  notEqual(
    reviewConfigurationFingerprint(explicitStandard, "deterministic"),
    reviewConfigurationFingerprint(deepReview, "deterministic"),
    "review profile affects configuration identity",
  );
  notEqual(
    reviewConfigurationFingerprint(explicitStandard, "deterministic"),
    reviewConfigurationFingerprint(explicitStandard, "fallback"),
    "analysis source affects configuration identity",
  );
  notEqual(
    reviewConfigurationFingerprint(explicitStandard, "deterministic"),
    reviewConfigurationFingerprint(explicitStandard, "deterministic", "provider-a", "model-a"),
    "provider and model metadata affect configuration identity",
  );

  for (const token of [
    "generatorVersion: REPORT_GENERATOR_VERSION",
    "deterministicRulesetVersion: DETERMINISTIC_RULESET_VERSION",
    "reportSchemaVersion: REPORT_SCHEMA_VERSION",
    "analysisSource",
    "provider",
    "model",
  ]) {
    assert(configurationFunctionSource.includes(token), `configuration source includes ${token}`);
  }
  assert(!configurationFunctionSource.includes("generateReport"), "configuration fingerprint does not hash generator implementation source");
  assert(!configurationFunctionSource.includes("prompt"), "configuration fingerprint does not hash prompt implementation");
  assert(REPORT_GENERATOR_VERSION.length > 0 && DETERMINISTIC_RULESET_VERSION.length > 0 && REPORT_SCHEMA_VERSION.length > 0, "recorded version constants are populated");
});

test("R6 - verify-run invokes current builders without archived-version dispatch", () => {
  const stored = manifest(githubInput()).canonicalRun;
  equal(stored.generatorVersion, REPORT_GENERATOR_VERSION, "canonical run records current generator version");
  equal(stored.deterministicRulesetVersion, DETERMINISTIC_RULESET_VERSION, "canonical run records current ruleset version");
  assert(verifyRunSource.includes("const reproducedReport = generateReport(input);"), "verify-run calls current generateReport");
  assert(verifyRunSource.includes("const reproducedManifest = createCanonicalReviewRunManifest({"), "verify-run calls current canonical manifest builder");
  assert(!verifyRunSource.includes("run.canonicalRun.generatorVersion"), "verify-run does not select by stored generator version");
  assert(!verifyRunSource.includes("run.canonicalRun.deterministicRulesetVersion"), "verify-run does not select by stored ruleset version");
  assert(!verifyRunSource.includes("import("), "verify-run contains no archived implementation dispatch");
  assert(!verifyRunSource.includes("historicalCanonicalRunManifest"), "verify-run does not invoke a historical generator path");
});

test("R7 - verify-run compares head applicability, configuration and Report result only", () => {
  assert(verifyRunSource.includes("const sourceMatched = metadata.head?.sha === run.headSha;"), "verify-run compares current and stored head SHA");
  assert(
    verifyRunSource.includes("const configurationMatched = configurationFingerprint === run.canonicalRun.configurationFingerprint;"),
    "verify-run compares configuration fingerprint",
  );
  assert(
    verifyRunSource.includes("const resultMatched = reproducedManifest.resultFingerprint === run.canonicalRun.resultFingerprint;"),
    "verify-run compares Report-result fingerprint",
  );
  assert(!verifyRunSource.includes("reproducedManifest.inputFingerprint === run.canonicalRun.inputFingerprint"), "verify-run does not compare input fingerprint");
  assert(!verifyRunSource.includes("changePassport.fingerprint"), "verify-run does not compare Passport fingerprint");
  assert(!verifyRunSource.includes("evidenceFingerprint ==="), "verify-run does not compare Evidence fingerprint");
  assert(!verifyRunSource.includes("contractFingerprint ==="), "verify-run does not compare Contract fingerprint");
});

test("R8 - persisted replay provenance retains bounded outcomes, not reconstructed artifacts", () => {
  const verification: CanonicalRunVerificationRecord = {
    id: "verify_bs0",
    runId: "run_bs0",
    createdAt: CREATED_AT,
    sourceMatched: true,
    configurationMatched: true,
    resultMatched: true,
    reproducibility: "exact",
    details: "Characterization fixture.",
  };
  deepEqual(Object.keys(verification).sort(), [
    "configurationMatched",
    "createdAt",
    "details",
    "id",
    "reproducibility",
    "resultMatched",
    "runId",
    "sourceMatched",
  ], "successful verification record has the bounded persisted shape");

  const failedVerification: CanonicalRunVerificationRecord = {
    id: "verify_bs0_failed",
    runId: "run_bs0",
    createdAt: CREATED_AT,
    sourceMatched: true,
    configurationMatched: false,
    resultMatched: false,
    reproducibility: "drift-detected",
    failureCategory: "fingerprint_mismatch",
    details: "Compared result or configuration did not match.",
  };
  equal(failedVerification.failureCategory, "fingerprint_mismatch", "failed verification retains failure category");
  equal(failedVerification.details, "Compared result or configuration did not match.", "failed verification retains bounded details");
  equal(failedVerification.resultMatched, false, "failed verification retains comparison outcome");

  for (const field of [
    "id",
    "runId",
    "createdAt",
    "sourceMatched",
    "configurationMatched",
    "resultMatched",
    "reproducibility",
    "failureCategory",
    "details",
  ]) {
    assert(verificationRecordTypeSource.includes(field), `verification record schema includes ${field}`);
  }
  for (const absent of [
    "reproducedReport",
    "reproducedManifest",
    "inputFingerprint",
    "configurationFingerprint",
    "resultFingerprint",
    "diff",
    "changePassport",
    "evidenceFingerprint",
    "contractFingerprint",
  ]) {
    assert(!verificationRecordTypeSource.includes(absent), `verification record schema excludes ${absent}`);
  }
  assert(
    storeSource.includes("run.verifications = [verification, ...(run.verifications ?? [])].slice(0, 20);"),
    "store persists the verification record directly with retention twenty",
  );
});

test("R9 - current exact replay means the implemented verify-run comparisons succeeded", () => {
  const sourceCheck = verifyRunSource.indexOf("if (!sourceMatched)");
  const resultCheck = verifyRunSource.indexOf("const resultMatched =");
  const exactClassification = verifyRunSource.indexOf(
    'reproducibility: configurationMatched && resultMatched ? "exact" : "drift-detected"',
  );
  assert(sourceCheck >= 0 && resultCheck > sourceCheck && exactClassification > resultCheck, "exact classification occurs only after source/head applicability");
  assert(
    verifyRunSource.includes('failureCategory: configurationMatched && resultMatched ? undefined : "fingerprint_mismatch"'),
    "successful implemented comparisons have no failure category",
  );
  assert(
    verifyRunSource.includes("This verifies deterministic replay for the stored source and configuration, not broader correctness."),
    "production details bound exact replay away from broader correctness",
  );
  assert(!verifyRunSource.includes("reproducedManifest.runId === run.canonicalRun.runId"), "exact replay does not require canonical run identity equality");
  assert(!verifyRunSource.includes("reproducedManifest.inputFingerprint === run.canonicalRun.inputFingerprint"), "exact replay does not require complete input identity");
});

let passed = 0;
for (const item of tests) {
  try {
    item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`BS0 replay validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`BS0 replay validation: ${passed}/${tests.length} passed\n`);
