import { createHmac } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { buildEvidenceHierarchy } from "../../evidence-hierarchy";
import { parseChangePassportBlock } from "../../change-passport";
import type { CanonicalRunVerificationRecord } from "../../canonical-review-run";
import {
  normaliseGitHubWebhookDelivery,
  verifyGitHubWebhookSignature,
} from "../../github-app-webhook";
import type {
  GitHubAnalysisRunRecord,
  GitHubPullRequestRecord,
  GitHubWebhookEnvelope,
} from "../../github-app-store";
import type { Report } from "../../mock-report";
import { generateReport, type ReportInput } from "../../report-generator";
import { RISKY_TESTS_REQUIRED_SAMPLE } from "../../sample-pr-input";

type Test = { name: string; run: () => void | Promise<void> };
const tests: Test[] = [];
const test = (name: string, run: () => void | Promise<void>): void => { tests.push({ name, run }); };

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

const WORKSPACE = process.cwd();
const source = async (path: string) => readFile(join(WORKSPACE, ...path.split("/")), "utf8");
const [webhookRouteSource, appRouteSource, storeSource, webhookSource, authSource, commentsSource] = await Promise.all([
  source("app/api/github-app/webhook/route.ts"),
  source("app/api/github-app/route.ts"),
  source("lib/github-app-store.ts"),
  source("lib/github-app-webhook.ts"),
  source("lib/github-app-auth.ts"),
  source("lib/github-app-comments.ts"),
]);

function sourceSlice(text: string, startToken: string, endToken: string, label: string): string {
  const start = text.indexOf(startToken);
  const end = text.indexOf(endToken, start + startToken.length);
  assert(start >= 0 && end > start, `${label} source boundary must exist`);
  return text.slice(start, end);
}

const appAnalysisInputSource = sourceSlice(
  webhookRouteSource,
  "const input: ReportInput = {",
  "const report = generateReport(input);",
  "GitHub App ReportInput",
);
const appCompletionSource = sourceSlice(
  storeSource,
  "function completedRunFromReport(",
  "type CompleteAnalysisOptions",
  "GitHub App completed run construction",
);
const completeAnalysisSource = sourceSlice(
  storeSource,
  "export async function completePullRequestAnalysis",
  "export async function addRunVerification",
  "GitHub App analysis completion",
);
const commentPublishStart = commentsSource.indexOf("export async function publishGitHubDecisionComment");
assert(commentPublishStart >= 0, "GitHub decision comment publishing source boundary must exist");
const commentPublishSource = commentsSource.slice(commentPublishStart);

type Cell = "YES" | "NO" | "NOT_APPLICABLE" | "UNKNOWN";
const matrixRows = [
  "App PR record",
  "Webhook delivery record",
  "ReportInput",
  "Report",
  "Canonical run",
  "App analysis run",
  "Change Passport",
  "Decision comment state",
] as const;
const matrixColumns = [
  "keyed by App PR identity",
  "stores explicit head SHA",
  "stores explicit delivery ID",
  "mutable after creation",
  "contains full normalized Passport",
  "stores explicit real PR number",
  "owns duplicate-delivery dedupe",
  "owns same-head analysis-run reuse",
] as const;
type MatrixRow = typeof matrixRows[number];
type MatrixColumn = typeof matrixColumns[number];
const behaviourMatrix = Object.fromEntries(matrixRows.map((row) => [
  row,
  Object.fromEntries(matrixColumns.map((column) => [column, "UNKNOWN"])) as Record<MatrixColumn, Cell>,
])) as Record<MatrixRow, Record<MatrixColumn, Cell>>;

function observe(row: MatrixRow, column: MatrixColumn, value: Exclude<Cell, "UNKNOWN">): void {
  const existing = behaviourMatrix[row][column];
  if (existing !== "UNKNOWN" && existing !== value) {
    fail(`conflicting matrix observation for ${row}/${column}: ${existing} then ${value}`);
  }
  behaviourMatrix[row][column] = value;
}

const tempRoot = await mkdtemp(join(tmpdir(), "lintel-bs0-github-app-"));
const storeWorkingDirectory = resolve(tempRoot, "isolated-store");
const resolvedTempRoot = resolve(tempRoot);
assert(storeWorkingDirectory.startsWith(`${resolvedTempRoot}${sep}`), "isolated store must remain inside its temporary root");
await mkdir(storeWorkingDirectory, { recursive: true });
process.chdir(storeWorkingDirectory);

type StoreModule = typeof import("../../github-app-store");
const store = await import(`${pathToFileURL(join(WORKSPACE, "lib", "github-app-store.ts")).href}?bs0_8` ) as StoreModule;

const RECEIVED_AT = "2026-09-11T10:00:00.000Z";
const REAL_PR_NUMBER = 808;
const BASE_A = "base-bs0-github-app-a";
const HEAD_A = "head-bs0-github-app-a";
const BASE_B = "base-bs0-github-app-b";
const HEAD_B = "head-bs0-github-app-b";

function envelope(options: Partial<GitHubWebhookEnvelope> & { deliveryId: string }): GitHubWebhookEnvelope {
  return {
    event: "pull_request",
    action: "synchronize",
    installationId: 100,
    repositoryId: 200,
    repositoryOwner: "acme",
    repositoryName: "redemption-api",
    repositoryVisibility: "private",
    pullRequestNumber: REAL_PR_NUMBER,
    baseSha: BASE_A,
    headSha: HEAD_A,
    receivedAt: RECEIVED_AT,
    ...options,
  };
}

function pullRequestPayload(action: string, options: {
  installationId?: number;
  repositoryId?: number;
  owner?: string;
  repository?: string;
  number?: number;
  baseSha?: string;
  headSha?: string;
} = {}) {
  return {
    action,
    installation: { id: options.installationId ?? 100 },
    repository: {
      id: options.repositoryId ?? 200,
      name: options.repository ?? "redemption-api",
      owner: { login: options.owner ?? "acme" },
      private: true,
    },
    pull_request: {
      number: options.number ?? REAL_PR_NUMBER,
      base: { sha: options.baseSha ?? BASE_A },
      head: { sha: options.headSha ?? HEAD_A },
    },
  };
}

function appRouteShapedInput(title: string, changePassport?: ReportInput["changePassport"]): ReportInput {
  return {
    ...RISKY_TESTS_REQUIRED_SAMPLE,
    title,
    repository: "acme/redemption-api",
    inputSource: "github-pr",
    reviewProfile: "standard",
    ...(changePassport ? { changePassport } : {}),
  };
}

async function start(envelopeValue: GitHubWebhookEnvelope): Promise<GitHubPullRequestRecord> {
  const record = await store.markPullRequestProcessing(envelopeValue);
  assert(record, "valid App PR envelope must create a processing record");
  return record;
}

async function complete(record: GitHubPullRequestRecord, input: ReportInput, report = generateReport(input)) {
  const completed = await store.completePullRequestAnalysis(record.id, report, {
    input,
    sourceType: "github-app",
    analysisSource: "deterministic",
    sourceUrl: `https://github.com/acme/redemption-api/pull/${record.number}`,
  });
  assert(completed, "existing App PR record must complete");
  return completed;
}

function latestRun(record: GitHubPullRequestRecord): GitHubAnalysisRunRecord {
  const run = record.analysisRuns?.[0];
  assert(run, "completed App PR record must retain its latest run");
  return run;
}

let appFlowRecord: GitHubPullRequestRecord | undefined;
let appFlowInput: ReportInput | undefined;
let appFlowReport: Report | undefined;

test("G1 - App PR identity uses installation, repository and PR number independently", async () => {
  const before = Object.keys((await store.readGitHubAppStore()).pullRequests).length;
  const fixtures = [
    envelope({ deliveryId: "g1-base", installationId: 111, repositoryId: 211, pullRequestNumber: 311 }),
    envelope({ deliveryId: "g1-installation", installationId: 112, repositoryId: 211, pullRequestNumber: 311 }),
    envelope({ deliveryId: "g1-repository", installationId: 111, repositoryId: 212, pullRequestNumber: 311 }),
    envelope({ deliveryId: "g1-number", installationId: 111, repositoryId: 211, pullRequestNumber: 312 }),
  ];
  const records = await Promise.all(fixtures.map(start));
  deepEqual(records.map((item) => item.id), ["111:211:311", "112:211:311", "111:212:311", "111:211:312"], "production App PR keys");
  equal(new Set(records.map((item) => item.id)).size, 4, "each independent identity dimension splits records");
  const after = await store.readGitHubAppStore();
  equal(Object.keys(after.pullRequests).length, before + 4, "four independently keyed lifecycle records persist");
  equal(store.pullRequestKey(111, 211, 311), records[0].id, "exported key builder owns record identity");
  equal(records[0].headSha, HEAD_A, "App PR record stores explicit head SHA");
  equal(records[0].latestDeliveryId, "g1-base", "App PR record stores explicit latest delivery ID");
  equal(records[0].number, 311, "App PR record stores explicit real PR number");
  observe("App PR record", "keyed by App PR identity", "YES");
  observe("App PR record", "stores explicit head SHA", "YES");
  observe("App PR record", "stores explicit delivery ID", "YES");
  observe("App PR record", "mutable after creation", "YES");
  observe("App PR record", "stores explicit real PR number", "YES");
});

test("G2 - webhook signature verification authenticates exact raw text with HMAC-SHA256", () => {
  const secret = "bs0.8-deterministic-secret";
  const raw = '{"action":"opened","spacing":"preserved"}';
  const signature = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  equal(verifyGitHubWebhookSignature(raw, signature, secret), true, "correct signature is accepted");
  equal(verifyGitHubWebhookSignature(raw, signature.replace(/.$/, "0"), secret), false, "incorrect signature is rejected");
  equal(verifyGitHubWebhookSignature(raw, "sha1=malformed", secret), false, "wrong signature scheme is rejected");
  equal(verifyGitHubWebhookSignature(raw, "sha256=short", secret), false, "wrong-length signature is rejected before comparison");
  equal(verifyGitHubWebhookSignature(raw, null, secret), false, "missing signature is rejected");
  equal(verifyGitHubWebhookSignature(raw, signature, ""), false, "missing secret is rejected");
  equal(verifyGitHubWebhookSignature(JSON.stringify(JSON.parse(raw), null, 2), signature, secret), false, "re-serialized JSON does not authenticate as the original raw body");
  assert(webhookSource.includes('createHmac("sha256", webhookSecret).update(rawBody)'), "production helper must HMAC the rawBody argument with SHA-256");
  assert(webhookSource.includes("timingSafeEqual(receivedBuffer, expectedBuffer)"), "production helper must use timingSafeEqual after its length guard");
  assert(webhookRouteSource.indexOf("verifyGitHubWebhookSignature(rawBody, signature)") < webhookRouteSource.indexOf("JSON.parse(rawBody)"), "route must verify raw body before JSON parsing");
});

test("G3 - delivery idempotency is delivery-keyed and independent from PR identity", async () => {
  const firstEnvelope = envelope({ deliveryId: "g3-delivery-one", installationId: 120, repositoryId: 220, pullRequestNumber: 320 });
  const first = await store.recordDelivery(firstEnvelope, "received");
  const duplicate = await store.recordDelivery({ ...firstEnvelope, headSha: HEAD_B }, "processing");
  equal(first.duplicate, false, "first delivery is registered");
  equal(duplicate.duplicate, true, "same delivery ID is acknowledged as duplicate");
  equal(duplicate.delivery.state, "received", "duplicate registration returns the original delivery state");
  const second = await store.recordDelivery({ ...firstEnvelope, deliveryId: "g3-delivery-two" }, "received");
  equal(second.duplicate, false, "new delivery ID is registered for the same PR identity");
  const data = await store.readGitHubAppStore();
  assert(data.deliveries["g3-delivery-one"] && data.deliveries["g3-delivery-two"], "both independent delivery records persist");
  assert(!("headSha" in first.delivery), "delivery record does not store explicit head SHA");
  assert(!("pullRequestNumber" in first.delivery), "delivery record does not store explicit PR number");
  observe("Webhook delivery record", "keyed by App PR identity", "NO");
  observe("Webhook delivery record", "stores explicit head SHA", "NO");
  observe("Webhook delivery record", "stores explicit delivery ID", "YES");
  observe("Webhook delivery record", "mutable after creation", "YES");
  observe("Webhook delivery record", "contains full normalized Passport", "NOT_APPLICABLE");
  observe("Webhook delivery record", "stores explicit real PR number", "NO");
  observe("Webhook delivery record", "owns duplicate-delivery dedupe", "YES");
  observe("Webhook delivery record", "owns same-head analysis-run reuse", "NOT_APPLICABLE");
});

test("G4 - webhook normalization freezes supported event and action boundaries", () => {
  for (const action of ["opened", "reopened", "synchronize", "ready_for_review"]) {
    const result = normaliseGitHubWebhookDelivery({ deliveryId: `g4-${action}`, event: "pull_request", payload: pullRequestPayload(action) });
    assert(result.accepted && result.envelope.event === "pull_request", `${action} must be accepted as a PR delivery`);
  }
  const closed = normaliseGitHubWebhookDelivery({ deliveryId: "g4-closed", event: "pull_request", payload: pullRequestPayload("closed") });
  assert(!closed.accepted && closed.reason === "ignored", "unsupported PR action is ignored");
  const push = normaliseGitHubWebhookDelivery({ deliveryId: "g4-push", event: "push", payload: pullRequestPayload("opened") });
  assert(!push.accepted && push.reason === "ignored", "non-supported event is ignored");
  const ping = normaliseGitHubWebhookDelivery({ deliveryId: "g4-ping", event: "ping", payload: {} });
  assert(ping.accepted && ping.envelope.event === "ping", "ping is accepted");
  for (const event of ["installation", "installation_repositories"]) {
    const result = normaliseGitHubWebhookDelivery({ deliveryId: `g4-${event}`, event, payload: { installation: { id: 123 } } });
    assert(result.accepted && result.envelope.event === event, `${event} is accepted with an installation ID`);
  }
  for (const action of ["created", "deleted", "suspend", "unsuspend"]) {
    const result = normaliseGitHubWebhookDelivery({ deliveryId: `g4-installation-${action}`, event: "installation", payload: { action, installation: { id: 123 } } });
    assert(result.accepted && result.envelope.action === action, `installation action ${action} reaches installation handling`);
  }
  const malformed = normaliseGitHubWebhookDelivery({ deliveryId: "g4-malformed", event: "pull_request", payload: pullRequestPayload("opened", { headSha: "" }) });
  assert(!malformed.accepted && malformed.reason === "malformed", "supported action with missing required PR identity is malformed");
  assert(webhookRouteSource.includes('if (event === "installation") return handleInstallationEvent(payload, deliveryId);'), "installation route dispatch exists");
  assert(webhookRouteSource.includes('if (event === "installation_repositories") return handleInstallationRepositoriesEvent(payload, deliveryId);'), "installation-repositories route dispatch exists");
  assert(webhookRouteSource.includes('if (event === "pull_request") return processPullRequest(payload, deliveryId);'), "only the PR dispatch enters PR analysis");
  assert(webhookRouteSource.includes('const active = action !== "deleted" && action !== "suspend";'), "installation deletion and suspension deactivate installation records");
  assert(webhookRouteSource.includes('event: event === "installation" || event === "installation_repositories" || event === "pull_request" || event === "ping" ? event : "ping"'), "unsupported events are recorded under the delivery schema's ping fallback");
});

test("G5 - App PR intake mutates current state while preserving lifecycle history and comment identity", async () => {
  const firstEnvelope = envelope({ deliveryId: "g5-first", installationId: 130, repositoryId: 230, pullRequestNumber: 330 });
  await store.upsertRepository({ installationId: 130, repositoryId: 230, owner: "acme", name: "redemption-api", visibility: "private" });
  await store.setRepositoryEnabled(130, 230, false);
  const started = await start(firstEnvelope);
  const firstInput = appRouteShapedInput("G5 original title");
  const firstCompleted = await complete(started, firstInput);
  await store.completeCommentPublishing(firstCompleted.id, { commentId: 5300, htmlUrl: "https://github.invalid/comment/5300", headSha: HEAD_A });
  const later = await start(envelope({
    deliveryId: "g5-later",
    action: "reopened",
    installationId: 130,
    repositoryId: 230,
    repositoryOwner: "renamed-owner",
    repositoryName: "renamed-repository",
    repositoryVisibility: "public",
    pullRequestNumber: 330,
    baseSha: BASE_B,
    headSha: HEAD_B,
  }));
  equal(later.id, started.id, "same App PR identity updates one record");
  equal(later.state, "processing", "later intake overwrites processing state");
  equal(later.headSha, HEAD_B, "later intake overwrites head SHA");
  equal(later.baseSha, BASE_B, "later intake overwrites base SHA");
  equal(later.owner, "renamed-owner", "later intake overwrites owner metadata");
  equal(later.repository, "renamed-repository", "later intake overwrites repository-name metadata");
  equal(later.latestDeliveryId, "g5-later", "later intake overwrites latest delivery pointer");
  equal(later.title, "G5 original title", "title is preserved until completion supplies a report title");
  equal(later.analysisRuns?.length, 1, "completed run history is preserved during later intake");
  equal(later.githubCommentId, 5300, "comment pointer is preserved during later intake");
  equal(later.createdAt, started.createdAt, "record creation timestamp is preserved");
  assert(!("action" in later), "PR record does not persist webhook action metadata");
  const repository = await store.upsertRepository({ installationId: 130, repositoryId: 230, owner: "renamed-owner", name: "renamed-repository", visibility: "public" });
  equal(repository.enabled, false, "repository metadata update preserves the independent enabled flag");
  equal(repository.owner, "renamed-owner", "repository metadata is mutable at its installation/repository key");
  observe("Decision comment state", "keyed by App PR identity", "YES");
  observe("Decision comment state", "stores explicit head SHA", "YES");
  observe("Decision comment state", "stores explicit delivery ID", "NO");
  observe("Decision comment state", "mutable after creation", "YES");
});

test("G6 - App route source omits pullRequestNumber and production generation maps the omission to PR zero", async () => {
  const passportBody = [
    "Change declaration:",
    "```lintel-change-passport",
    JSON.stringify({
      producerType: "agent",
      taskIntent: "Characterize GitHub App analysis continuity.",
      changeSummary: "Adds deterministic lifecycle coverage.",
      producer: { tool: "BS0 harness", provider: "local", model: "none", externalRunId: "g6-passport" },
      claimedFiles: ["lib/github-app-store.ts"],
      claimedSurfaces: ["GitHub App lifecycle"],
      claimedTests: ["node github-app.validation.ts"],
      claimedValidation: ["deterministic store lifecycle"],
      assumptions: ["The App PR identity remains installation/repository/number."],
      constraints: ["No network access."],
      knownLimitations: ["No real GitHub comment call."],
      unresolvedUncertainty: ["External delivery timing is not reproduced."],
      handoffNotes: "Retain the bounded normalized declaration.",
    }),
    "```",
  ].join("\n");
  const passport = parseChangePassportBlock(passportBody);
  assert(passport, "real PR-body parser must normalize the deterministic Passport block");
  const started = await start(envelope({ deliveryId: "g6", installationId: 140, repositoryId: 240, pullRequestNumber: 340 }));
  appFlowInput = appRouteShapedInput("G6 App-route-shaped analysis", passport);
  assert(!("pullRequestNumber" in appFlowInput), "App-route-shaped ReportInput omits pullRequestNumber");
  assert(!("headSha" in appFlowInput), "App-route-shaped ReportInput stores no explicit head SHA");
  assert(!("deliveryId" in appFlowInput), "App-route-shaped ReportInput stores no explicit delivery ID");
  deepEqual(appFlowInput.changePassport, passport, "App-route-shaped ReportInput contains the normalized Change Passport");
  appFlowReport = generateReport(appFlowInput);
  equal(appFlowReport.pr.number, 0, "production generator applies zero sentinel to omitted PR number");
  assert(!("headSha" in appFlowReport), "Report stores no explicit App head SHA");
  assert(!("deliveryId" in appFlowReport), "Report stores no explicit delivery ID");
  assert(!("changePassport" in appFlowReport), "Report stores no Change Passport");
  appFlowRecord = await complete(started, appFlowInput, appFlowReport);
  equal(appFlowRecord.number, 340, "App PR record retains the external PR number");
  assert(!appAnalysisInputSource.includes("pullRequestNumber"), "actual network-bound App input construction omits pullRequestNumber");
  assert(appAnalysisInputSource.includes("changePassport"), "actual App input construction includes parsed Change Passport");
  observe("ReportInput", "keyed by App PR identity", "NO");
  observe("ReportInput", "stores explicit head SHA", "NO");
  observe("ReportInput", "stores explicit delivery ID", "NO");
  observe("ReportInput", "mutable after creation", "NOT_APPLICABLE");
  observe("ReportInput", "contains full normalized Passport", "YES");
  observe("ReportInput", "stores explicit real PR number", "NO");
  observe("ReportInput", "owns duplicate-delivery dedupe", "NOT_APPLICABLE");
  observe("ReportInput", "owns same-head analysis-run reuse", "NOT_APPLICABLE");
  observe("Report", "keyed by App PR identity", "NO");
  observe("Report", "stores explicit head SHA", "NO");
  observe("Report", "stores explicit delivery ID", "NO");
  observe("Report", "contains full normalized Passport", "NO");
  observe("Report", "stores explicit real PR number", "NO");
  observe("Report", "owns duplicate-delivery dedupe", "NOT_APPLICABLE");
  observe("Report", "owns same-head analysis-run reuse", "NOT_APPLICABLE");
});

test("G7 - App completion preserves external PR identity while Report-derived artifacts carry zero", () => {
  assert(appFlowRecord && appFlowInput && appFlowReport, "G6 App flow must be available");
  const run = latestRun(appFlowRecord);
  assert(run.canonicalRun && run.mergeContract && run.verificationPack, "App run must contain canonical and downstream artifacts");
  const evidence = buildEvidenceHierarchy(run.report, run.changePassport, { runId: run.runId, headSha: run.headSha });
  equal(appFlowRecord.number, 340, "App PR record number is external identity");
  equal(run.pullRequestNumber, 340, "App analysis run number is copied from App PR record");
  equal(run.canonicalRun.pullRequestNumber, 340, "canonical manifest number is explicitly supplied from App PR record");
  equal(run.report.pr.number, 0, "Report number remains the generator zero sentinel");
  assert(evidence.records.length > 0 && evidence.records.every((item) => item.pullRequestNumber === 0), "Evidence records derive PR zero from Report");
  equal(run.mergeContract.pullRequestNumber, 0, "Merge Contract derives PR zero from Report");
  equal(run.verificationPack.changeIdentity.pullRequestNumber, 0, "Verification Pack derives PR zero from Report");
  assert(appCompletionSource.includes("pullRequestNumber: record.number"), "completed run and canonical construction use the current App record number");
  assert(!("deliveryId" in run.canonicalRun), "canonical run stores no explicit delivery ID");
  assert(!("deliveryId" in run), "App analysis run stores no explicit delivery ID");
  observe("Canonical run", "keyed by App PR identity", "YES");
  observe("Canonical run", "stores explicit head SHA", "YES");
  observe("Canonical run", "stores explicit delivery ID", "NO");
  observe("Canonical run", "mutable after creation", "NO");
  observe("Canonical run", "contains full normalized Passport", "NO");
  observe("Canonical run", "stores explicit real PR number", "YES");
  observe("Canonical run", "owns duplicate-delivery dedupe", "NOT_APPLICABLE");
  observe("App analysis run", "keyed by App PR identity", "YES");
  observe("App analysis run", "stores explicit head SHA", "YES");
  observe("App analysis run", "stores explicit delivery ID", "NO");
  observe("App analysis run", "stores explicit real PR number", "YES");
  observe("App analysis run", "owns duplicate-delivery dedupe", "NOT_APPLICABLE");
});

test("G8 - normalized full Change Passport persists on App run while bounded derivations persist elsewhere", () => {
  assert(appFlowRecord && appFlowInput?.changePassport, "G6 Passport-bearing App flow must be available");
  const run = latestRun(appFlowRecord);
  assert(run.changePassport && run.canonicalRun?.changePassport && run.mergeContract && run.verificationPack, "Passport-bearing run artifacts must exist");
  deepEqual(run.changePassport, appFlowInput.changePassport, "App analysis run persists the full normalized bounded Passport");
  deepEqual(Object.keys(run.canonicalRun.changePassport).sort(), [
    "completeness", "fingerprint", "passportId", "producerType", "schemaVersion", "source",
  ], "canonical manifest persists only Passport identity summary fields");
  const reportWithoutPassport = generateReport({ ...appFlowInput, changePassport: undefined });
  deepEqual(run.report, reportWithoutPassport, "generateReport output is independent of Passport content");
  assert(!("changePassport" in run.report), "Report does not persist Passport");
  assert(run.mergeContract.clauses.some((clause) => clause.source === "Change Passport"), "Merge Contract consumes Passport declarations");
  equal(run.verificationPack.builderDeclaration.present, true, "Verification Pack records Passport presence");
  equal(run.verificationPack.builderDeclaration.passportId, run.changePassport.passportId, "Verification Pack retains Passport identity");
  equal(run.verificationPack.builderDeclaration.intent, run.changePassport.taskIntent, "Verification Pack retains bounded intent summary");
  observe("App PR record", "contains full normalized Passport", "YES"); // Via nested analysisRuns only; no top-level PR Passport field exists.
  observe("App analysis run", "contains full normalized Passport", "YES");
  observe("Change Passport", "keyed by App PR identity", "NO");
  observe("Change Passport", "stores explicit head SHA", "NO");
  observe("Change Passport", "stores explicit delivery ID", "NO");
  observe("Change Passport", "mutable after creation", "NO");
  observe("Change Passport", "contains full normalized Passport", "YES");
  observe("Change Passport", "stores explicit real PR number", "NOT_APPLICABLE");
  observe("Change Passport", "owns duplicate-delivery dedupe", "NOT_APPLICABLE");
  observe("Change Passport", "owns same-head analysis-run reuse", "NOT_APPLICABLE");
});

test("G9 - processing and failure live on the mutable PR record; completed runs are created only at completion", async () => {
  const started = await start(envelope({ deliveryId: "g9-start", installationId: 150, repositoryId: 250, pullRequestNumber: 350 }));
  equal(started.state, "processing", "analysis start marks PR processing");
  equal(started.analysisRuns, undefined, "analysis start does not create a pending/running run object");
  assert(Date.parse(started.createdAt) > 0 && Date.parse(started.updatedAt) > 0, "processing record has timestamps");
  const input = appRouteShapedInput("G9 completion lifecycle");
  const completed = await complete(started, input);
  const run = latestRun(completed);
  equal(completed.state, "completed", "normal completion marks PR completed");
  equal(run.runId, `${completed.id}:${HEAD_A}`, "stored run ID is App PR key plus current head SHA");
  equal(run.baseSha, BASE_A, "run binds current base SHA");
  equal(run.headSha, HEAD_A, "run binds current head SHA");
  assert(Date.parse(run.completedAt) > 0, "completed run has completion timestamp");
  equal(run.canonicalRun?.processingState, "completed", "canonical run is completed");
  equal(run.canonicalRun?.startedAt, undefined, "App completion does not supply a canonical startedAt timestamp");
  const verification: CanonicalRunVerificationRecord = {
    id: "g9-verification",
    runId: run.runId,
    createdAt: "2026-09-11T10:10:00.000Z",
    sourceMatched: true,
    configurationMatched: true,
    resultMatched: true,
    reproducibility: "exact",
    details: "Deterministic validation-local attachment.",
  };
  const augmented = await store.addRunVerification(completed.id, run.runId, verification);
  assert(augmented, "completed App run accepts a verification attachment");
  equal(augmented.runId, run.runId, "verification attachment preserves run identity");
  equal(augmented.verifications?.[0]?.id, verification.id, "verification is attached to the addressed run");
  observe("App analysis run", "mutable after creation", "YES");
  const failedStart = await start(envelope({ deliveryId: "g9-fail", installationId: 151, repositoryId: 251, pullRequestNumber: 351 }));
  const failed = await store.failPullRequestAnalysis(failedStart.id, "g9_expected_failure");
  assert(failed, "existing processing record may be marked failed");
  equal(failed.state, "failed", "failure state is stored on PR record");
  equal(failed.failureCategory, "g9_expected_failure", "failure category is retained");
  equal(failed.analysisRuns, undefined, "failure does not create an analysis run");
});

test("G10 - same-head completion and route preflight reuse one stored analysis run", async () => {
  const started = await start(envelope({ deliveryId: "g10-first", installationId: 160, repositoryId: 260, pullRequestNumber: 360 }));
  const firstInput = appRouteShapedInput("G10 first report");
  const first = await complete(started, firstInput);
  const firstRun = latestRun(first);
  const secondInput = appRouteShapedInput("G10 second report for same head");
  const second = await complete(first, secondInput);
  const secondRun = latestRun(second);
  equal(second.analysisRuns?.length, 1, "same-head completion retains one run");
  equal(secondRun.runId, firstRun.runId, "same-head run ID is reused");
  deepEqual(secondRun.report, firstRun.report, "same-head duplicate retains original stored report");
  equal(second.latestReport?.pr.title, "G10 first report", "latest report remains the original duplicate-head report");
  equal(second.title, "G10 second report for same head", "mutable PR title is nevertheless overwritten by duplicate completion input");
  const found = await store.findCompletedAnalysis(160, 260, 360, HEAD_A);
  assert(found?.id === first.id, "route preflight helper finds an already completed head");
  assert(webhookRouteSource.includes("duplicate_head_sha"), "route acknowledges completed same-head delivery without rerunning analysis");
  observe("Report", "mutable after creation", "NO");
  observe("Canonical run", "owns same-head analysis-run reuse", "NOT_APPLICABLE");
  observe("App analysis run", "owns same-head analysis-run reuse", "NOT_APPLICABLE");
  observe("App PR record", "owns same-head analysis-run reuse", "YES");
});

test("G11 - completion after a head update binds App run metadata to the current mutable PR record", async () => {
  const startedA = await start(envelope({
    deliveryId: "g11-a",
    installationId: 170,
    repositoryId: 270,
    pullRequestNumber: 370,
    repositoryOwner: "owner-a",
    repositoryName: "repository-a",
    baseSha: BASE_A,
    headSha: HEAD_A,
  }));
  const inputA = { ...appRouteShapedInput("G11 report produced for HEAD_A"), repository: "owner-a/repository-a" };
  const reportA = generateReport(inputA);
  const currentB = await start(envelope({
    deliveryId: "g11-b",
    installationId: 170,
    repositoryId: 270,
    pullRequestNumber: 370,
    repositoryOwner: "owner-b",
    repositoryName: "repository-b",
    baseSha: BASE_B,
    headSha: HEAD_B,
  }));
  equal(currentB.id, startedA.id, "head update targets the same mutable PR record");
  const completed = await complete(startedA, inputA, reportA);
  const run = latestRun(completed);
  assert(run.canonicalRun, "race-boundary run must contain canonical metadata");
  equal(run.runId, `${startedA.id}:${HEAD_B}`, "run identity uses current HEAD_B rather than started HEAD_A");
  equal(run.headSha, HEAD_B, "run head comes from current mutable PR record");
  equal(run.baseSha, BASE_B, "run base comes from current mutable PR record");
  equal(run.owner, "owner-b", "run owner comes from current mutable PR record");
  equal(run.repository, "repository-b", "run repository name comes from current mutable PR record");
  equal(run.pullRequestNumber, 370, "run PR number comes from current mutable PR record identity");
  equal(run.report.pr.title, "G11 report produced for HEAD_A", "stored Report comes from started analysis completion input");
  equal(run.report.pr.repository, "owner-a/repository-a", "stored Report repository comes from started analysis input");
  equal(run.canonicalRun.repository, "owner-a/repository-a", "canonical repository comes from started analysis input");
  equal(run.canonicalRun.headSha, HEAD_B, "canonical head comes from current mutable PR record");
  equal(run.canonicalRun.baseSha, BASE_B, "canonical base comes from current mutable PR record");
  assert(!completeAnalysisSource.includes("expectedHead"), "completion has no expected-head guard");
  assert(webhookRouteSource.includes("completedRecord.latestPublishedHeadSha !== envelope.headSha"), "post-completion comment decision compares against the started delivery envelope head");
  assert(webhookRouteSource.includes("headSha: envelope.headSha"), "comment completion stores the started delivery envelope head rather than re-reading current PR head");
});

test("G12 - two same-head analyses can be admitted before completion; completing both retains one stored run", async () => {
  const inflightEnvelope = envelope({ deliveryId: "g12-inflight-first", installationId: 181, repositoryId: 281, pullRequestNumber: 381 });
  await store.recordDelivery(inflightEnvelope, "received");
  const inflightFirst = await start(inflightEnvelope);
  const inflightNewDelivery = await store.recordDelivery({ ...inflightEnvelope, deliveryId: "g12-inflight-second" }, "received");
  equal(inflightNewDelivery.duplicate, false, "new in-flight delivery ID is independently accepted");
  equal(await store.findCompletedAnalysis(181, 281, 381, HEAD_A), null, "processing same-head record is not found by completed-head preflight");
  const inflightSecond = await start({ ...inflightEnvelope, deliveryId: "g12-inflight-second" });
  equal(inflightSecond.id, inflightFirst.id, "second in-flight analysis attempt targets the same mutable PR record");
  const inflightCompletedFirst = await complete(inflightFirst, appRouteShapedInput("G12 first admitted analysis result"));
  const inflightCompletedSecond = await complete(inflightSecond, appRouteShapedInput("G12 second admitted analysis result"));
  equal(inflightCompletedSecond.analysisRuns?.length, 1, "subsequent completion of both admitted same-head analyses persists one run");
  equal(latestRun(inflightCompletedSecond).runId, latestRun(inflightCompletedFirst).runId, "subsequent same-head completions reuse stored run identity");

  const firstEnvelope = envelope({ deliveryId: "g12-first", installationId: 180, repositoryId: 280, pullRequestNumber: 380 });
  const registered = await store.recordDelivery(firstEnvelope, "received");
  equal(registered.duplicate, false, "first delivery is unique");
  const started = await start(firstEnvelope);
  const completed = await complete(started, appRouteShapedInput("G12 completed head"));
  const newDelivery = await store.recordDelivery({ ...firstEnvelope, deliveryId: "g12-new-delivery" }, "received");
  equal(newDelivery.duplicate, false, "new delivery ID is not delivery-deduplicated");
  const sameHead = await store.findCompletedAnalysis(180, 280, 380, HEAD_A);
  equal(sameHead?.id, completed.id, "independent completed-head lookup deduplicates analysis preflight");
  const differentHead = await store.findCompletedAnalysis(180, 280, 380, HEAD_B);
  equal(differentHead, null, "same PR with a new head is not analysis-deduplicated");
  observe("App PR record", "owns duplicate-delivery dedupe", "NO");
});

test("G13 - decision comment pointer is PR-owned and later publishing prefers update over create", async () => {
  const started = await start(envelope({ deliveryId: "g13", installationId: 190, repositoryId: 290, pullRequestNumber: 390 }));
  equal(started.githubCommentId, undefined, "new PR record has no comment pointer");
  const publishing = await store.markCommentPublishing(started.id);
  equal(publishing?.commentPublishingState, "publishing", "pure store transition marks comment publishing");
  const completed = await store.completeCommentPublishing(started.id, {
    commentId: 1390,
    htmlUrl: "https://github.invalid/comment/1390",
    headSha: HEAD_A,
  });
  assert(completed, "comment completion updates existing PR record");
  equal(completed.githubCommentId, 1390, "comment ID persists on App PR record");
  equal(completed.latestPublishedHeadSha, HEAD_A, "published head persists beside comment pointer");
  equal(completed.commentPublishingState, "completed", "comment publishing completion state persists");
  assert(commentPublishSource.includes("if (storedCommentId)"), "publisher first considers stored comment ID");
  assert(commentPublishSource.includes("readComment(owner, repo, storedCommentId, token)"), "publisher validates stored comment through GitHub API");
  assert(commentPublishSource.includes("updateComment(owner, repo, storedCommentId, token, body)"), "valid marked stored comment is updated");
  assert(commentPublishSource.includes("listComments(owner, repo, number, token)"), "absent/unusable pointer falls back to PR comment listing");
  assert(commentPublishSource.includes("createComment(owner, repo, number, token, body)"), "publisher creates only when no marked comment is found");
  const commentState = {
    githubCommentId: completed.githubCommentId,
    githubCommentHtmlUrl: completed.githubCommentHtmlUrl,
    latestPublishedHeadSha: completed.latestPublishedHeadSha,
    latestPublishedAt: completed.latestPublishedAt,
    commentPublishingState: completed.commentPublishingState,
    commentFailureCategory: completed.commentFailureCategory,
  };
  assert(!("number" in commentState), "PR-owned decision comment state has no explicit PR-number field");
  observe("Decision comment state", "contains full normalized Passport", "NOT_APPLICABLE");
  observe("Decision comment state", "stores explicit real PR number", "NO");
  observe("Decision comment state", "owns duplicate-delivery dedupe", "NOT_APPLICABLE");
  observe("Decision comment state", "owns same-head analysis-run reuse", "NOT_APPLICABLE");
});

test("G14 - GitHub App persistence does not write browser review authorities", async () => {
  const combinedAppSource = [webhookRouteSource, appRouteSource, storeSource].join("\n");
  for (const browserAuthority of [
    "report-history",
    "review-state",
    "human-decision-ledger",
    "condition-progress",
    "human-decision-draft-boundary",
    "workspace-v2/persistence",
  ]) {
    assert(!combinedAppSource.includes(browserAuthority), `App call chain must not import ${browserAuthority}`);
  }
  const data = await store.readGitHubAppStore();
  deepEqual(Object.keys(data).sort(), ["deliveries", "installations", "pullRequests", "repositories"], "actual App store has only server-side App persistence maps");
  assert(storeSource.includes('path.join(process.cwd(), ".lintel-data")'), "App persistence is filesystem-backed rather than browser Storage-backed");
  assert(!storeSource.includes("localStorage") && !storeSource.includes("Storage"), "App store has no browser Storage dependency");
});

test("G15 - observation-backed GitHub App behaviour matrix is complete and bounded", () => {
  const expected: Record<MatrixRow, Record<MatrixColumn, Cell>> = {
    "App PR record": {
      "keyed by App PR identity": "YES", "stores explicit head SHA": "YES", "stores explicit delivery ID": "YES", "mutable after creation": "YES",
      "contains full normalized Passport": "YES", "stores explicit real PR number": "YES", "owns duplicate-delivery dedupe": "NO", "owns same-head analysis-run reuse": "YES",
    },
    "Webhook delivery record": {
      "keyed by App PR identity": "NO", "stores explicit head SHA": "NO", "stores explicit delivery ID": "YES", "mutable after creation": "YES",
      "contains full normalized Passport": "NOT_APPLICABLE", "stores explicit real PR number": "NO", "owns duplicate-delivery dedupe": "YES", "owns same-head analysis-run reuse": "NOT_APPLICABLE",
    },
    "ReportInput": {
      "keyed by App PR identity": "NO", "stores explicit head SHA": "NO", "stores explicit delivery ID": "NO", "mutable after creation": "NOT_APPLICABLE",
      "contains full normalized Passport": "YES", "stores explicit real PR number": "NO", "owns duplicate-delivery dedupe": "NOT_APPLICABLE", "owns same-head analysis-run reuse": "NOT_APPLICABLE",
    },
    "Report": {
      "keyed by App PR identity": "NO", "stores explicit head SHA": "NO", "stores explicit delivery ID": "NO", "mutable after creation": "NO",
      "contains full normalized Passport": "NO", "stores explicit real PR number": "NO", "owns duplicate-delivery dedupe": "NOT_APPLICABLE", "owns same-head analysis-run reuse": "NOT_APPLICABLE",
    },
    "Canonical run": {
      "keyed by App PR identity": "YES", "stores explicit head SHA": "YES", "stores explicit delivery ID": "NO", "mutable after creation": "NO",
      "contains full normalized Passport": "NO", "stores explicit real PR number": "YES", "owns duplicate-delivery dedupe": "NOT_APPLICABLE", "owns same-head analysis-run reuse": "NOT_APPLICABLE",
    },
    "App analysis run": {
      "keyed by App PR identity": "YES", "stores explicit head SHA": "YES", "stores explicit delivery ID": "NO", "mutable after creation": "YES",
      "contains full normalized Passport": "YES", "stores explicit real PR number": "YES", "owns duplicate-delivery dedupe": "NOT_APPLICABLE", "owns same-head analysis-run reuse": "NOT_APPLICABLE",
    },
    "Change Passport": {
      "keyed by App PR identity": "NO", "stores explicit head SHA": "NO", "stores explicit delivery ID": "NO", "mutable after creation": "NO",
      "contains full normalized Passport": "YES", "stores explicit real PR number": "NOT_APPLICABLE", "owns duplicate-delivery dedupe": "NOT_APPLICABLE", "owns same-head analysis-run reuse": "NOT_APPLICABLE",
    },
    "Decision comment state": {
      "keyed by App PR identity": "YES", "stores explicit head SHA": "YES", "stores explicit delivery ID": "NO", "mutable after creation": "YES",
      "contains full normalized Passport": "NOT_APPLICABLE", "stores explicit real PR number": "NO", "owns duplicate-delivery dedupe": "NOT_APPLICABLE", "owns same-head analysis-run reuse": "NOT_APPLICABLE",
    },
  };
  deepEqual(behaviourMatrix, expected, "matrix must be populated only by preceding observations");
  assert(Object.values(behaviourMatrix).every((row) => Object.values(row).every((cell) => ["YES", "NO", "NOT_APPLICABLE", "UNKNOWN"].includes(cell))), "matrix vocabulary remains bounded");
});

test("G16 - current App authority is bounded to GitHub identity/state, App runs, Passport and comment pointer", () => {
  assert(storeSource.includes("deliveries: Record<string, GitHubDeliveryRecord>"), "App store authoritatively retains delivery state");
  assert(storeSource.includes("pullRequests: Record<string, GitHubPullRequestRecord>"), "App store authoritatively retains current PR state");
  assert(storeSource.includes("analysisRuns?: GitHubAnalysisRunRecord[]"), "App PR records own analysis run history");
  assert(storeSource.includes("changePassport?: ChangePassport"), "App run may own full normalized Passport");
  assert(storeSource.includes("githubCommentId?: number"), "App PR record owns comment identity pointer");
  assert(authSource.includes("GITHUB_APP_ID") && authSource.includes("GITHUB_APP_PRIVATE_KEY"), "App credentials are the JWT authority boundary");
  assert(authSource.includes("/app/installations/${installationId}/access_tokens"), "installation token authority is installation-scoped");
  assert(webhookRouteSource.includes("createInstallationToken(envelope.installationId)"), "PR acquisition uses installation authority");
  assert(webhookRouteSource.includes("application/vnd.github.v3.diff"), "App analysis acquires diff through GitHub installation fetch");
  assert(!appRouteSource.includes("canonical Review") && !storeSource.includes("ReviewId"), "App persistence does not claim shared canonical Review identity");
});

let passed = 0;
try {
  for (const item of tests) {
    try {
      await item.run();
      passed += 1;
    } catch (error) {
      process.stderr.write(`BS0.8 GitHub App validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
      process.exitCode = 1;
      break;
    }
  }
  if (passed === tests.length) process.stdout.write(`BS0.8 GitHub App validation: ${passed}/${tests.length} grouped checks passed\n`);
} finally {
  process.chdir(WORKSPACE);
  const resolvedForRemoval = resolve(tempRoot);
  assert(resolvedForRemoval.startsWith(`${resolve(tmpdir())}${sep}`), "temporary cleanup target must remain below OS temp");
  await rm(resolvedForRemoval, { recursive: true, force: true });
}
