import { buildBuilderVerifierAssessment } from "../../builder-verifier-boundary";
import {
  createCanonicalReviewRunManifest,
  reportFingerprint,
  type CanonicalRunSourceType,
} from "../../canonical-review-run";
import { normalizeChangePassport, type ChangePassport } from "../../change-passport";
import { buildEvidenceHierarchy } from "../../evidence-hierarchy";
import { buildMergeContract } from "../../merge-contract";
import { generateReport, type ReportInput } from "../../report-generator";
import { RISKY_TESTS_REQUIRED_SAMPLE } from "../../sample-pr-input";
import { buildVerificationPack } from "../../verification-pack";

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

const CREATED_AT = "2026-09-08T12:00:00.000Z";
const BASE_SHA = "base-bs0-analysis";
const HEAD_SHA = "head-bs0-analysis";

type DerivationOptions = {
  sourceType?: CanonicalRunSourceType;
  pullRequestNumber?: number;
  baseSha?: string;
  headSha?: string;
};

function manualInput(): ReportInput {
  return {
    ...RISKY_TESTS_REQUIRED_SAMPLE,
    inputSource: "pasted-diff",
  };
}

function derive(input: ReportInput, options: DerivationOptions = {}) {
  const report = generateReport(input);
  const canonicalRun = createCanonicalReviewRunManifest({
    input,
    report,
    sourceType: options.sourceType,
    analysisSource: "deterministic",
    pullRequestNumber: options.pullRequestNumber,
    baseSha: options.baseSha,
    headSha: options.headSha,
    createdAt: CREATED_AT,
    completedAt: CREATED_AT,
  });
  const evidenceHierarchy = buildEvidenceHierarchy(report, input.changePassport, {
    runId: canonicalRun.runId,
    headSha: canonicalRun.headSha,
    createdAt: CREATED_AT,
  });
  const builderVerifier = buildBuilderVerifierAssessment({
    passport: input.changePassport,
    repository: input.repository,
    pullRequestNumber: options.pullRequestNumber,
    headSha: canonicalRun.headSha,
    canonicalRunId: canonicalRun.runId,
    analysisSource: canonicalRun.analysisSource,
    provider: canonicalRun.provider,
    model: canonicalRun.model,
    generatorVersion: canonicalRun.generatorVersion,
    deterministicRulesetVersion: canonicalRun.deterministicRulesetVersion,
    createdAt: CREATED_AT,
  });
  const mergeContract = buildMergeContract({
    report,
    changePassport: input.changePassport,
    evidenceHierarchy,
    builderVerifier,
    canonicalRunId: canonicalRun.runId,
    baseSha: canonicalRun.baseSha,
    headSha: canonicalRun.headSha,
    sourceType: canonicalRun.sourceType,
    reviewMode: canonicalRun.reviewMode,
    createdAt: CREATED_AT,
  });
  const verificationPack = buildVerificationPack({
    report,
    canonicalRun,
    changePassport: input.changePassport,
    evidenceHierarchy,
    builderVerifier,
    mergeContract,
    createdAt: CREATED_AT,
  });

  return {
    report,
    canonicalRun,
    evidenceHierarchy,
    builderVerifier,
    mergeContract,
    verificationPack,
  };
}

function deterministicPassport(): ChangePassport {
  const normalized = normalizeChangePassport({
    producerType: "agent",
    taskIntent: "Add safe retry handling for partner discount-code retrieval.",
    changeSummary: "Adds a second provider attempt after a timeout.",
    producer: {
      tool: "Cursor",
      provider: "Example provider",
      model: "example-builder-model",
      externalRunId: "builder-run-bs0",
    },
    claimedFiles: ["app/services/redemption_service.py"],
    claimedSurfaces: ["External provider boundary"],
    claimedTests: ["test_provider_timeout_is_idempotent"],
    claimedValidation: ["pytest tests/test_redemption_service.py"],
    assumptions: ["The provider honours an idempotency key."],
    constraints: ["Do not change the public API response shape."],
    knownLimitations: ["No provider sandbox result is attached."],
    unresolvedUncertainty: ["A timeout may occur after provider acceptance."],
    handoffNotes: "Review duplicate side-effect handling.",
  }, "api");
  assert(normalized, "deterministic Change Passport must normalize");
  return {
    ...normalized,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

test("D1 - normal deterministic manual input preserves current derivation authority", () => {
  const input = manualInput();
  const result = derive(input);

  equal(result.report.pr.repository, input.repository, "Report repository comes from ReportInput");
  equal(result.report.pr.number, 0, "manual Report has the current zero PR sentinel");
  equal(result.canonicalRun.repository, input.repository, "canonical repository comes from ReportInput");
  equal(result.canonicalRun.pullRequestNumber, undefined, "canonical manual run has no external PR");
  equal(result.canonicalRun.baseSha, undefined, "manual run has no invented base SHA");
  equal(result.canonicalRun.headSha, undefined, "manual run has no invented head SHA");
  equal(result.canonicalRun.resultFingerprint, reportFingerprint(result.report), "canonical result identity fingerprints the Report");

  assert(result.evidenceHierarchy.records.length > 0, "Report produces structured evidence");
  assert(
    result.evidenceHierarchy.records.every((record) =>
      record.repository === result.report.pr.repository && record.pullRequestNumber === result.report.pr.number),
    "evidence identity follows Report identity",
  );
  equal(result.mergeContract.repository, result.report.pr.repository, "contract repository follows Report");
  equal(result.mergeContract.pullRequestNumber, result.report.pr.number, "contract PR follows Report");
  equal(result.mergeContract.canonicalRunId, result.canonicalRun.runId, "contract binds the canonical run");
  equal(result.verificationPack.reportId, result.mergeContract.reportId, "pack and contract share report identity");
  equal(result.verificationPack.canonicalRunId, result.canonicalRun.runId, "pack binds the canonical run");
  equal(result.verificationPack.changeIdentity.repository, result.report.pr.repository, "pack repository follows Report");
  equal(result.verificationPack.changeIdentity.pullRequestNumber, result.report.pr.number, "pack PR follows Report");
  equal(result.verificationPack.provenance.resultFingerprint, result.canonicalRun.resultFingerprint, "pack retains canonical result identity");
  equal(result.canonicalRun.evidenceHierarchy?.evidenceFingerprint, result.evidenceHierarchy.evidenceFingerprint, "explicit and canonical evidence identities agree");
  equal(result.canonicalRun.mergeContract?.contractFingerprint, result.mergeContract.contractFingerprint, "explicit and canonical contract identities agree");
  equal(result.verificationPack.generationStatus, "partial", "missing Passport makes the current pack partial");
});

test("D2 - an explicit positive PR number propagates through Report-derived artifacts", () => {
  const pullRequestNumber = 482;
  const input: ReportInput = {
    ...RISKY_TESTS_REQUIRED_SAMPLE,
    inputSource: "github-pr",
    pullRequestNumber,
  };
  const result = derive(input, {
    sourceType: "github-pr",
    pullRequestNumber,
    baseSha: BASE_SHA,
    headSha: HEAD_SHA,
  });

  equal(result.report.pr.number, pullRequestNumber, "Report retains explicit positive PR");
  equal(result.canonicalRun.pullRequestNumber, pullRequestNumber, "canonical run retains explicit positive PR");
  equal(result.mergeContract.pullRequestNumber, pullRequestNumber, "contract receives positive PR from Report");
  equal(result.verificationPack.changeIdentity.pullRequestNumber, pullRequestNumber, "pack receives positive PR from Report");
  assert(
    result.evidenceHierarchy.records.every((record) => record.pullRequestNumber === pullRequestNumber),
    "evidence records retain the positive Report PR",
  );
  equal(result.canonicalRun.baseSha, BASE_SHA, "canonical run retains base SHA");
  equal(result.canonicalRun.headSha, HEAD_SHA, "canonical run retains head SHA");
  equal(result.mergeContract.baseSha, BASE_SHA, "contract retains base SHA");
  equal(result.mergeContract.headSha, HEAD_SHA, "contract retains head SHA");
  equal(result.verificationPack.changeIdentity.baseSha, BASE_SHA, "pack retains base SHA");
  equal(result.verificationPack.changeIdentity.headSha, HEAD_SHA, "pack retains head SHA");
});

test("D3 - GitHub App external PR identity currently splits from Report-derived identity", () => {
  const externalPullRequestNumber = 913;
  const input: ReportInput = {
    ...RISKY_TESTS_REQUIRED_SAMPLE,
    inputSource: "github-pr",
  };
  assert(!("pullRequestNumber" in input), "GitHub-App-style ReportInput omits pullRequestNumber");

  const result = derive(input, {
    sourceType: "github-app",
    pullRequestNumber: externalPullRequestNumber,
    baseSha: BASE_SHA,
    headSha: HEAD_SHA,
  });

  equal(result.report.pr.number, 0, "Report uses zero when ReportInput PR is omitted");
  equal(result.evidenceHierarchy.records[0]?.pullRequestNumber, 0, "Report-derived evidence uses zero");
  equal(result.mergeContract.pullRequestNumber, 0, "Report-derived contract uses zero");
  equal(result.verificationPack.changeIdentity.pullRequestNumber, 0, "Report-derived pack identity uses zero");
  equal(result.canonicalRun.pullRequestNumber, externalPullRequestNumber, "canonical manifest retains external App PR");
  equal(result.builderVerifier.pullRequestNumber, externalPullRequestNumber, "builder/verifier metadata retains external App PR");
  equal(result.canonicalRun.sourceType, "github-app", "canonical source remains GitHub App");
  equal(result.mergeContract.sourceType, "github-app", "contract source remains GitHub App despite PR split");
});

test("D4 - Change Passport affects verification artifacts but not generated Report semantics", () => {
  const passport = deterministicPassport();
  const input = { ...manualInput(), changePassport: passport };
  const withPassport = derive(input);
  const withoutPassportReport = generateReport(manualInput());

  deepEqual(withPassport.report, withoutPassportReport, "generateReport does not consume Passport content");
  equal(reportFingerprint(withPassport.report), reportFingerprint(withoutPassportReport), "Report identity is Passport-independent");
  assert(!("changePassport" in withPassport.report), "Report stores no Change Passport");

  deepEqual(Object.keys(withPassport.canonicalRun.changePassport ?? {}).sort(), [
    "completeness", "fingerprint", "passportId", "producerType", "schemaVersion", "source",
  ], "canonical manifest retains only the current Passport identity summary");
  equal(withPassport.canonicalRun.changePassport?.passportId, passport.passportId, "canonical manifest retains Passport identity");
  equal(withPassport.canonicalRun.changePassport?.fingerprint, passport.fingerprint, "canonical manifest retains Passport fingerprint");

  const declaredEvidence = withPassport.evidenceHierarchy.records.filter((record) => record.class === "builder-declared");
  assert(declaredEvidence.length > 0, "Passport declarations become builder-declared evidence");
  assert(declaredEvidence.every((record) => record.supportingReference === passport.passportId), "declared evidence references Passport identity");
  assert(
    withPassport.evidenceHierarchy.assumptions.some((assumption) => assumption.source.startsWith("Change Passport")),
    "Passport assumptions enter the Assumption Registry",
  );
  assert(
    withPassport.mergeContract.clauses.some((clause) => clause.source === "Change Passport"),
    "claimed Passport validation creates a contract clause",
  );
  assert(
    withPassport.mergeContract.clauses.some((clause) => clause.relatedAssumptionIds.length > 0),
    "Passport-derived assumptions affect contract construction",
  );

  equal(withPassport.verificationPack.generationStatus, "complete", "current pack with Passport is complete");
  equal(withPassport.verificationPack.builderDeclaration.present, true, "pack retains a builder declaration");
  equal(withPassport.verificationPack.builderDeclaration.passportId, passport.passportId, "pack retains Passport identity");
  equal(withPassport.verificationPack.builderDeclaration.intent, passport.taskIntent, "pack retains bounded task intent");
  equal(withPassport.verificationPack.builderDeclaration.changeSummary, passport.changeSummary, "pack retains bounded change summary");
  equal(withPassport.verificationPack.builderDeclaration.claimedValidation.total, 2, "pack combines claimed validation and tests");
  equal(withPassport.verificationPack.builderDeclaration.assumptions.total, passport.assumptions.length, "pack retains bounded assumptions");
  equal(withPassport.verificationPack.builderDeclaration.limitations.total, passport.knownLimitations.length, "pack retains bounded limitations");
  equal(withPassport.verificationPack.builderDeclaration.unresolvedUncertainty.total, passport.unresolvedUncertainty.length, "pack retains bounded uncertainty");
});

test("D5 - equivalent Reports do not reconstruct Passport-dependent artifact identity", () => {
  const passport = deterministicPassport();
  const withPassport = derive({ ...manualInput(), changePassport: passport });
  const withoutPassport = derive(manualInput());

  deepEqual(withPassport.report, withoutPassport.report, "equivalent analysis inputs produce the same Report");
  equal(withPassport.canonicalRun.resultFingerprint, withoutPassport.canonicalRun.resultFingerprint, "result fingerprint remains Report-derived");
  equal(withPassport.canonicalRun.configurationFingerprint, withoutPassport.canonicalRun.configurationFingerprint, "configuration fingerprint is Passport-independent");
  notEqual(withPassport.canonicalRun.inputFingerprint, withoutPassport.canonicalRun.inputFingerprint, "input fingerprint includes Passport identity");
  notEqual(withPassport.canonicalRun.runId, withoutPassport.canonicalRun.runId, "derived canonical run identity changes with Passport input");
  notEqual(withPassport.evidenceHierarchy.evidenceFingerprint, withoutPassport.evidenceHierarchy.evidenceFingerprint, "evidence identity changes with Passport declarations");
  notEqual(withPassport.evidenceHierarchy.assumptionRegistryFingerprint, withoutPassport.evidenceHierarchy.assumptionRegistryFingerprint, "assumption identity changes with Passport context");
  notEqual(withPassport.mergeContract.contractFingerprint, withoutPassport.mergeContract.contractFingerprint, "contract identity changes with Passport context");
  notEqual(withPassport.verificationPack.packFingerprint, withoutPassport.verificationPack.packFingerprint, "pack identity changes with Passport context");
  equal(withPassport.verificationPack.sectionFingerprints.reviewResult, withoutPassport.verificationPack.sectionFingerprints.reviewResult, "Report-derived review result remains equal");
  equal(withPassport.verificationPack.builderDeclaration.present, true, "original pack identifies Passport presence");
  equal(withoutPassport.verificationPack.builderDeclaration.present, false, "reconstruction without Passport records absence");
});

test("D6 - a stored Report is independent of immutable downstream verification artifacts", () => {
  const passport = deterministicPassport();
  const original = derive({ ...manualInput(), changePassport: passport });
  const storedReport = structuredClone(original.report);

  deepEqual(storedReport, original.report, "stored Report preserves Report semantics");
  assert(!("changePassport" in storedReport), "stored Report contains no Passport");
  assert(!("mergeContract" in storedReport), "stored Report contains no Merge Contract");
  assert(!("verificationPack" in storedReport), "stored Report contains no Verification Pack");

  const rebuiltEvidence = buildEvidenceHierarchy(storedReport, null, {
    runId: original.canonicalRun.runId,
    headSha: original.canonicalRun.headSha,
    createdAt: CREATED_AT,
  });
  const rebuiltBoundary = buildBuilderVerifierAssessment({
    passport: null,
    repository: storedReport.pr.repository,
    pullRequestNumber: original.canonicalRun.pullRequestNumber,
    headSha: original.canonicalRun.headSha,
    canonicalRunId: original.canonicalRun.runId,
    analysisSource: original.canonicalRun.analysisSource,
    provider: original.canonicalRun.provider,
    model: original.canonicalRun.model,
    generatorVersion: original.canonicalRun.generatorVersion,
    deterministicRulesetVersion: original.canonicalRun.deterministicRulesetVersion,
    createdAt: CREATED_AT,
  });
  const rebuiltContract = buildMergeContract({
    report: storedReport,
    changePassport: null,
    evidenceHierarchy: rebuiltEvidence,
    builderVerifier: rebuiltBoundary,
    canonicalRunId: original.canonicalRun.runId,
    baseSha: original.canonicalRun.baseSha,
    headSha: original.canonicalRun.headSha,
    sourceType: original.canonicalRun.sourceType,
    reviewMode: original.canonicalRun.reviewMode,
    createdAt: CREATED_AT,
  });
  const rebuiltPack = buildVerificationPack({
    report: storedReport,
    canonicalRun: original.canonicalRun,
    changePassport: null,
    evidenceHierarchy: rebuiltEvidence,
    builderVerifier: rebuiltBoundary,
    mergeContract: rebuiltContract,
    createdAt: CREATED_AT,
  });

  equal(reportFingerprint(storedReport), original.canonicalRun.resultFingerprint, "stored Report still matches canonical result identity");
  notEqual(rebuiltContract.contractFingerprint, original.mergeContract.contractFingerprint, "fresh contract derivation without Passport differs");
  notEqual(rebuiltPack.packFingerprint, original.verificationPack.packFingerprint, "fresh pack derivation without Passport differs");
  equal(rebuiltPack.builderDeclaration.present, false, "fresh pack cannot recover the original builder declaration");
  equal(rebuiltPack.generationStatus, "partial", "fresh pack truthfully records missing Passport context");
  equal(rebuiltPack.reportId, original.verificationPack.reportId, "Report identity survives independent downstream derivation");
});

let passed = 0;
for (const item of tests) {
  try {
    item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`BS0 validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`BS0 validation: ${passed}/${tests.length} passed\n`);
