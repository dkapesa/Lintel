import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createCanonicalReviewRunManifest,
  type CanonicalReviewRunManifest,
} from "../../canonical-review-run";
import {
  conditionProgressReportKey,
  reportConditions,
} from "../../condition-progress";
import {
  createEmptyHumanDecisionLedger,
  humanDecisionLedgerKeyForReport,
} from "../../human-decision-ledger";
import { pullRequestKey } from "../../github-app-store";
import { buildMergeContract } from "../../merge-contract";
import type { Report } from "../../mock-report";
import { generateReport, type ReportInput, type ReportInputSource } from "../../report-generator";
import {
  REPORT_HISTORY_STORAGE_KEY,
  reportInputLabel,
  type ReportHistoryEntry,
} from "../../report-history";
import { reviewStateKeyForReport } from "../../review-state";
import {
  conservativeReviewIdentityProvider,
  decisionDraftApplicability,
  decisionDraftOwner,
  decisionSubjectIdFromCapability,
  indexReviews,
  type DecisionDraftContext,
  type ReviewId,
} from "../../r6c/index";
import {
  HumanDecisionDraftStore,
  createDecisionDraftBinding,
  createEmptyHumanDecisionDraft,
} from "../../r6k/index";
import { reportHistoryEntryKey, reportWorkspaceKey } from "../../team-workspace";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import type { CaseDetail } from "../../workspace-v2/view-model";

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

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

const REPOSITORY = "lintel/bs0-identity";
const TITLE = "Characterize identity boundaries";
const CREATED_A = "2026-09-09T08:00:00.000Z";
const CREATED_B = "2026-09-09T09:00:00.000Z";
const HEAD_A = "head-bs0-identity-a";
const HEAD_B = "head-bs0-identity-b";
const BASE = "base-bs0-identity";
const RISKY_DIFF = [
  "diff --git a/src/payments.ts b/src/payments.ts",
  "index 1111111..2222222 100644",
  "--- a/src/payments.ts",
  "+++ b/src/payments.ts",
  "@@ -1 +1 @@",
  "-export const charge = once;",
  "+export const charge = retryPaymentWithoutIdempotency;",
].join("\n");
const DOCS_DIFF = [
  "diff --git a/docs/review.md b/docs/review.md",
  "index 3333333..4444444 100644",
  "--- a/docs/review.md",
  "+++ b/docs/review.md",
  "@@ -1 +1 @@",
  "-Old review note.",
  "+Clarify the reviewer instructions.",
].join("\n");

type Derived = {
  input: ReportInput;
  report: Report;
  canonicalRun: CanonicalReviewRunManifest;
};

function derive(options: {
  repository?: string;
  pullRequestNumber?: number;
  title?: string;
  diff?: string;
  inputSource?: ReportInputSource;
  reviewProfile?: ReportInput["reviewProfile"];
  headSha?: string;
  baseSha?: string;
  runId?: string;
  createdAt?: string;
  reportTransform?: (report: Report) => Report;
} = {}): Derived {
  const input: ReportInput = {
    title: options.title ?? TITLE,
    repository: options.repository ?? REPOSITORY,
    technology: "TypeScript",
    diff: options.diff ?? RISKY_DIFF,
    inputSource: options.inputSource ?? "github-pr",
    pullRequestNumber: options.pullRequestNumber ?? 701,
    reviewProfile: options.reviewProfile ?? "standard",
  };
  const generated = generateReport(input);
  const report = options.reportTransform ? options.reportTransform(generated) : generated;
  const createdAt = options.createdAt ?? CREATED_A;
  const canonicalRun = createCanonicalReviewRunManifest({
    input,
    report,
    analysisSource: "deterministic",
    ...(options.runId === undefined ? {} : { runId: options.runId }),
    pullRequestNumber: input.pullRequestNumber,
    baseSha: options.baseSha ?? BASE,
    headSha: options.headSha ?? HEAD_A,
    createdAt,
    completedAt: createdAt,
  });
  return { input, report, canonicalRun };
}

function historyEntry(derived: Derived, createdAt: string): ReportHistoryEntry {
  return {
    report: derived.report,
    source: "deterministic",
    canonicalRun: derived.canonicalRun,
    inputLabel: reportInputLabel(derived.report),
    createdAt,
    metadata: {
      title: derived.report.pr.title,
      repository: derived.report.pr.repository,
      recommendation: derived.report.verdict.recommendation,
      riskScore: derived.report.verdict.riskScore,
      reviewProfile: derived.canonicalRun.reviewMode,
    },
  };
}

async function project(entries: ReportHistoryEntry[]) {
  const storage = new MemoryStorage();
  storage.setItem(REPORT_HISTORY_STORAGE_KEY, JSON.stringify(entries));
  const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: null });
  assert(snapshot.status === "ready", "real Workspace projection must be ready");
  return { storage, snapshot };
}

async function projectOne(derived: Derived, createdAt = CREATED_A): Promise<CaseDetail> {
  const { snapshot } = await project([historyEntry(derived, createdAt)]);
  assert(snapshot.cases[0], "single history entry must project one Case");
  return snapshot.cases[0];
}

async function historyJoins(newer: Derived, older: Derived): Promise<boolean> {
  const newerEntry = historyEntry(newer, CREATED_B);
  const olderEntry = historyEntry(older, CREATED_A);
  const { snapshot } = await project([newerEntry, olderEntry]);
  const current = snapshot.cases.find((item) => item.caseId === `report-${CREATED_B}`);
  assert(current, "newer Case must be present");
  assert(current.history, "canonical history projection must be present");
  return current.history.status === "comparison";
}

function reviewIdFor(detail: CaseDetail): ReviewId {
  return conservativeReviewIdentityProvider.reviewIdFor(detail);
}

type Cell = "MERGES" | "SPLITS" | "NOT_APPLICABLE" | "UNKNOWN";
const systems = [
  "report history entry key",
  "workflow/review-state key",
  "Human Decision outer key",
  "Human Decision intrinsic ledger ID",
  "merge-contract report ID",
  "projected Case ID",
  "conservative ReviewId",
  "PR-aware history comparison",
  "canonical input fingerprint",
  "canonical configuration fingerprint",
  "canonical result fingerprint",
  "canonical run ID",
  "condition/progress report key",
  "draft ReviewId owner",
  "draft binding",
  "GitHub App PR key",
] as const;
const dimensions = [
  "PR number",
  "title",
  "input/source label",
  "history timestamp",
  "controlled analysis basis (diff + profile)",
  "head SHA",
  "condition set",
  "installation ID",
  "repository ID",
] as const;
type System = typeof systems[number];
type Dimension = typeof dimensions[number];
const matrix = Object.fromEntries(systems.map((system) => [
  system,
  Object.fromEntries(dimensions.map((dimension) => [dimension, "UNKNOWN"])) as Record<Dimension, Cell>,
])) as Record<System, Record<Dimension, Cell>>;

function observe(system: System, dimension: Dimension, left: unknown, right: unknown): void {
  const cell: Cell = left === right ? "MERGES" : "SPLITS";
  const current = matrix[system][dimension];
  if (current !== "UNKNOWN" && current !== cell) fail(`conflicting matrix evidence for ${system}/${dimension}`);
  matrix[system][dimension] = cell;
}

function markNotApplicable(system: System, dimension: Dimension): void {
  equal(matrix[system][dimension], "UNKNOWN", `N/A cell ${system}/${dimension} was not already observed`);
  matrix[system][dimension] = "NOT_APPLICABLE";
}

function observeCoreKeys(dimension: Dimension, left: Derived, right: Derived, leftEntry: ReportHistoryEntry, rightEntry: ReportHistoryEntry): void {
  observe("report history entry key", dimension, reportHistoryEntryKey(leftEntry), reportHistoryEntryKey(rightEntry));
  observe("workflow/review-state key", dimension, reviewStateKeyForReport(left.report), reviewStateKeyForReport(right.report));
  observe("Human Decision outer key", dimension, humanDecisionLedgerKeyForReport(left.report), humanDecisionLedgerKeyForReport(right.report));
  observe(
    "Human Decision intrinsic ledger ID",
    dimension,
    createEmptyHumanDecisionLedger({ report: left.report, canonicalRun: left.canonicalRun }, CREATED_A).ledgerId,
    createEmptyHumanDecisionLedger({ report: right.report, canonicalRun: right.canonicalRun }, CREATED_A).ledgerId,
  );
  observe(
    "merge-contract report ID",
    dimension,
    buildMergeContract({ report: left.report, canonicalRunId: left.canonicalRun.runId, headSha: left.canonicalRun.headSha, createdAt: CREATED_A }).reportId,
    buildMergeContract({ report: right.report, canonicalRunId: right.canonicalRun.runId, headSha: right.canonicalRun.headSha, createdAt: CREATED_A }).reportId,
  );
  observe("canonical input fingerprint", dimension, left.canonicalRun.inputFingerprint, right.canonicalRun.inputFingerprint);
  observe("canonical configuration fingerprint", dimension, left.canonicalRun.configurationFingerprint, right.canonicalRun.configurationFingerprint);
  observe("canonical result fingerprint", dimension, left.canonicalRun.resultFingerprint, right.canonicalRun.resultFingerprint);
  observe("canonical run ID", dimension, left.canonicalRun.runId, right.canonicalRun.runId);
  observe("condition/progress report key", dimension, conditionProgressReportKey(left.report), conditionProgressReportKey(right.report));
}

function source(path: string): string {
  return readFileSync(join(process.cwd(), ...path.split("/")), "utf8");
}

test("I1 - same repository/title/input label with different PR numbers", async () => {
  const left = derive({ pullRequestNumber: 701 });
  const right = derive({ pullRequestNumber: 702 });
  const leftEntry = historyEntry(left, CREATED_A);
  const rightEntry = historyEntry(right, CREATED_A);
  observeCoreKeys("PR number", left, right, leftEntry, rightEntry);
  const leftCase = await projectOne(left);
  const rightCase = await projectOne(right);
  observe("projected Case ID", "PR number", leftCase.caseId, rightCase.caseId);
  observe("conservative ReviewId", "PR number", reviewIdFor(leftCase), reviewIdFor(rightCase));
  observe("PR-aware history comparison", "PR number", await historyJoins(left, left), await historyJoins(right, left));
  observe("GitHub App PR key", "PR number", pullRequestKey(11, 22, 701), pullRequestKey(11, 22, 702));

  equal(matrix["workflow/review-state key"]["PR number"], "MERGES", "workflow omits PR number");
  equal(matrix["Human Decision outer key"]["PR number"], "MERGES", "decision outer key omits PR number");
  equal(matrix["Human Decision intrinsic ledger ID"]["PR number"], "SPLITS", "intrinsic ledger includes PR number");
  equal(matrix["PR-aware history comparison"]["PR number"], "SPLITS", "history grouping includes PR number");
});

test("I2 - same repository and PR with different title", async () => {
  const left = derive({ title: "Identity title A" });
  const right = derive({ title: "Identity title B" });
  observeCoreKeys("title", left, right, historyEntry(left, CREATED_A), historyEntry(right, CREATED_A));
  const leftCase = await projectOne(left);
  const rightCase = await projectOne(right);
  observe("projected Case ID", "title", leftCase.caseId, rightCase.caseId);
  observe("conservative ReviewId", "title", reviewIdFor(leftCase), reviewIdFor(rightCase));
  observe("PR-aware history comparison", "title", true, await historyJoins(left, right));
  equal(matrix["PR-aware history comparison"].title, "MERGES", "PR-aware comparison ignores title");
  equal(matrix["workflow/review-state key"].title, "SPLITS", "workflow includes title");
  equal(matrix["Human Decision intrinsic ledger ID"].title, "SPLITS", "intrinsic ledger includes title");
});

test("I3 - same repository/PR/title with different production input labels", async () => {
  const left = derive({ inputSource: "github-pr" });
  const right = derive({ inputSource: "pasted-diff" });
  notEqual(reportInputLabel(left.report), reportInputLabel(right.report), "production input labels differ");
  observeCoreKeys("input/source label", left, right, historyEntry(left, CREATED_A), historyEntry(right, CREATED_A));
  const leftCase = await projectOne(left);
  const rightCase = await projectOne(right);
  observe("projected Case ID", "input/source label", leftCase.caseId, rightCase.caseId);
  observe("conservative ReviewId", "input/source label", reviewIdFor(leftCase), reviewIdFor(rightCase));
  observe("PR-aware history comparison", "input/source label", true, await historyJoins(left, right));
  equal(matrix["workflow/review-state key"]["input/source label"], "SPLITS", "workflow includes derived input label");
  equal(matrix["Human Decision intrinsic ledger ID"]["input/source label"], "MERGES", "intrinsic ledger excludes input label");
  equal(matrix["PR-aware history comparison"]["input/source label"], "MERGES", "PR comparison ignores label");
});

test("I4 - same logical change at different history timestamps", async () => {
  const derived = derive({ runId: "run-bs0-identity-timestamp" });
  const entryA = historyEntry(derived, CREATED_A);
  const entryB = historyEntry(derived, CREATED_B);
  observeCoreKeys("history timestamp", derived, derived, entryA, entryB);
  const caseA = await projectOne(derived, CREATED_A);
  const caseB = await projectOne(derived, CREATED_B);
  observe("projected Case ID", "history timestamp", caseA.caseId, caseB.caseId);
  observe("conservative ReviewId", "history timestamp", reviewIdFor(caseA), reviewIdFor(caseB));
  observe("PR-aware history comparison", "history timestamp", true, await historyJoins(derived, derived));
  equal(matrix["report history entry key"]["history timestamp"], "SPLITS", "history entry key includes createdAt");
  equal(matrix["projected Case ID"]["history timestamp"], "SPLITS", "Case ID includes createdAt");
  equal(matrix["conservative ReviewId"]["history timestamp"], "SPLITS", "default ReviewId follows Case ID");
  equal(matrix["workflow/review-state key"]["history timestamp"], "MERGES", "workflow excludes history timestamp");
});

test("I5 - same PR/head with a controlled analysis basis change (diff + profile)", async () => {
  const left = derive({ diff: RISKY_DIFF, reviewProfile: "standard" });
  const right = derive({ diff: DOCS_DIFF, reviewProfile: "security-sensitive" });
  const dimension = "controlled analysis basis (diff + profile)";
  observeCoreKeys(dimension, left, right, historyEntry(left, CREATED_A), historyEntry(right, CREATED_A));
  observe("PR-aware history comparison", dimension, true, await historyJoins(left, right));
  equal(left.canonicalRun.headSha, right.canonicalRun.headSha, "controlled head remains equal");
  equal(matrix["workflow/review-state key"][dimension], "MERGES", "workflow omits the controlled diff/profile basis");
  equal(matrix["canonical input fingerprint"][dimension], "SPLITS", "input fingerprint changes");
  equal(matrix["canonical configuration fingerprint"][dimension], "SPLITS", "configuration fingerprint changes");
  equal(matrix["canonical result fingerprint"][dimension], "SPLITS", "result fingerprint changes");
  equal(matrix["canonical run ID"][dimension], "SPLITS", "derived run identity changes");
});

test("I6 - same workflow dimensions with a different head SHA", async () => {
  const left = derive({ headSha: HEAD_A });
  const right = derive({ headSha: HEAD_B });
  observeCoreKeys("head SHA", left, right, historyEntry(left, CREATED_A), historyEntry(right, CREATED_A));
  observe("PR-aware history comparison", "head SHA", true, await historyJoins(left, right));
  equal(matrix["workflow/review-state key"]["head SHA"], "MERGES", "workflow omits head");
  equal(matrix["condition/progress report key"]["head SHA"], "MERGES", "condition progress omits head");
  equal(matrix["canonical input fingerprint"]["head SHA"], "SPLITS", "canonical input includes head");
  equal(matrix["canonical run ID"]["head SHA"], "SPLITS", "derived run ID changes with head-sensitive input fingerprint");
});

test("I7 - condition/progress identity includes conditions but excludes head", () => {
  const left = derive();
  const right = derive({
    reportTransform: (report) => ({ ...report, conditionsBeforeMerge: [...report.conditionsBeforeMerge, "Obtain explicit identity review"] }),
  });
  assert(reportConditions(right.report).length > reportConditions(left.report).length, "controlled condition set changes");
  observeCoreKeys("condition set", left, right, historyEntry(left, CREATED_A), historyEntry(right, CREATED_A));
  equal(matrix["canonical input fingerprint"]["condition set"], "MERGES", "condition-only Report change leaves input fingerprint unchanged");
  equal(matrix["canonical configuration fingerprint"]["condition set"], "MERGES", "condition-only Report change leaves configuration fingerprint unchanged");
  equal(matrix["canonical result fingerprint"]["condition set"], "SPLITS", "condition-only Report change changes result fingerprint");
  equal(matrix["canonical run ID"]["condition set"], "SPLITS", "default derived run identity follows the changed result fingerprint");
  equal(matrix["condition/progress report key"]["condition set"], "SPLITS", "condition set participates in progress key");
  equal(matrix["workflow/review-state key"]["condition set"], "MERGES", "workflow excludes conditions");
  equal(matrix["Human Decision intrinsic ledger ID"]["condition set"], "MERGES", "intrinsic ledger excludes conditions");
  equal(matrix["condition/progress report key"]["head SHA"], "MERGES", "I6 established head omission");

  const explicitLeft = derive({ runId: "run-bs0-condition-override" });
  const explicitRight = derive({
    runId: "run-bs0-condition-override",
    reportTransform: (report) => ({ ...report, conditionsBeforeMerge: [...report.conditionsBeforeMerge, "Obtain explicit identity review"] }),
  });
  notEqual(explicitLeft.canonicalRun.resultFingerprint, explicitRight.canonicalRun.resultFingerprint, "explicit-run control still changes result identity");
  equal(explicitLeft.canonicalRun.runId, explicitRight.canonicalRun.runId, "explicit runId overrides default derived run identity outside the matrix");
});

test("I8 - draft ReviewId ownership isolates PR, history timestamp and head dimensions", async () => {
  const subject = decisionSubjectIdFromCapability("subject-bs0-identity-draft");
  const context = (
    reviewId: ReviewId,
    detail: CaseDetail,
    runId = detail.run?.runId ?? null,
    headSha = detail.run?.headSha ?? detail.github.headSha,
  ): DecisionDraftContext => ({
    reviewId,
    decisionSubject: { status: "available", decisionSubjectId: subject },
    basis: { caseId: detail.caseId, runId, headSha },
  });

  /* I8A: PR number is the only changed context dimension. Both projections use
     the same history timestamp and decision subject. */
  const prLeft = derive({ pullRequestNumber: 801 });
  const prRight = derive({ pullRequestNumber: 802 });
  const prLeftCase = await projectOne(prLeft, CREATED_A);
  const prRightCase = await projectOne(prRight, CREATED_A);
  const prLeftReviewId = reviewIdFor(prLeftCase);
  const prRightReviewId = reviewIdFor(prRightCase);
  equal(prLeftReviewId, prRightReviewId, "PR-only change leaves timestamp-derived default ReviewId equal");
  equal(reviewStateKeyForReport(prLeft.report), reviewStateKeyForReport(prRight.report), "workflow identities collide across PR-only change");
  equal(humanDecisionLedgerKeyForReport(prLeft.report), humanDecisionLedgerKeyForReport(prRight.report), "Human Decision outer identities collide across PR-only change");
  const prContextA = context(prLeftReviewId, prLeftCase);
  const prContextB = context(prRightReviewId, prRightCase);
  const prBindingA = createDecisionDraftBinding(prLeftReviewId, prContextA, CREATED_A);
  const prBindingB = createDecisionDraftBinding(prRightReviewId, prContextB, CREATED_A);
  observe("draft ReviewId owner", "PR number", decisionDraftOwner(prBindingA), decisionDraftOwner(prBindingB));
  observe("draft binding", "PR number", JSON.stringify(prBindingA), JSON.stringify(prBindingB));
  const prApplicability = decisionDraftApplicability(prBindingA, prContextB);
  equal(prApplicability.verdict, "stale-verification-basis", "PR-sensitive default run split stales the otherwise equal draft context");
  deepEqual(prApplicability.reasonCodes, ["run-changed"], "PR-only binding disagreement is isolated to canonical run identity");

  /* I8B: one logical change and canonical run, represented at two history
     timestamps. The timestamp changes Case and therefore default ReviewId. */
  const timestampDerived = derive();
  const timestampCaseA = await projectOne(timestampDerived, CREATED_A);
  const timestampCaseB = await projectOne(timestampDerived, CREATED_B);
  const timestampReviewIdA = reviewIdFor(timestampCaseA);
  const timestampReviewIdB = reviewIdFor(timestampCaseB);
  notEqual(timestampReviewIdA, timestampReviewIdB, "history timestamp changes the default ReviewId");
  const timestampContextA = context(timestampReviewIdA, timestampCaseA);
  const timestampContextB = context(timestampReviewIdB, timestampCaseB);
  const timestampBindingA = createDecisionDraftBinding(timestampReviewIdA, timestampContextA, CREATED_A);
  const timestampBindingB = createDecisionDraftBinding(timestampReviewIdB, timestampContextB, CREATED_A);
  observe("draft ReviewId owner", "history timestamp", decisionDraftOwner(timestampBindingA), decisionDraftOwner(timestampBindingB));
  observe("draft binding", "history timestamp", JSON.stringify(timestampBindingA), JSON.stringify(timestampBindingB));
  const storage = new MemoryStorage();
  const store = new HumanDecisionDraftStore(storage);
  assert(store.write(timestampReviewIdA, createEmptyHumanDecisionDraft(timestampReviewIdA, timestampContextA, null, CREATED_A)).persisted, "first timestamp-owned draft persists");
  assert(store.write(timestampReviewIdB, createEmptyHumanDecisionDraft(timestampReviewIdB, timestampContextB, null, CREATED_A)).persisted, "second timestamp-owned draft persists");
  equal(store.occupiedSlots(), 2, "timestamp-derived ReviewIds own two draft slots");

  /* I8C: ReviewId, Case, run and decision subject stay equal; only head moves. */
  const sameRunA = context(timestampReviewIdA, timestampCaseA, "fixed-run", HEAD_A);
  const sameRunB = context(timestampReviewIdA, timestampCaseA, "fixed-run", HEAD_B);
  const headBindingA = createDecisionDraftBinding(timestampReviewIdA, sameRunA, CREATED_A);
  const headBindingB = createDecisionDraftBinding(timestampReviewIdA, sameRunB, CREATED_A);
  observe("draft ReviewId owner", "head SHA", decisionDraftOwner(headBindingA), decisionDraftOwner(headBindingB));
  observe("draft binding", "head SHA", JSON.stringify(headBindingA), JSON.stringify(headBindingB));
  equal(decisionDraftApplicability(headBindingA, sameRunB).verdict, "stale-verification-basis", "head change stales draft binding");
});

test("I9 - GitHub App PR identity varies by installation, repository ID and PR", () => {
  const base = pullRequestKey(11, 22, 33);
  observe("GitHub App PR key", "installation ID", base, pullRequestKey(12, 22, 33));
  observe("GitHub App PR key", "repository ID", base, pullRequestKey(11, 23, 33));
  equal(matrix["GitHub App PR key"]["PR number"], "SPLITS", "I1 established App PR dimension");
  equal(matrix["GitHub App PR key"]["installation ID"], "SPLITS", "installation participates");
  equal(matrix["GitHub App PR key"]["repository ID"], "SPLITS", "repository ID participates");
  for (const system of systems.filter((item) => item !== "GitHub App PR key")) {
    markNotApplicable(system, "installation ID");
    markNotApplicable(system, "repository ID");
  }
});

test("I10 - browser and GitHub App persistence expose no shared canonical key", () => {
  const browser = derive({ pullRequestNumber: 33 });
  const workflowKey = reviewStateKeyForReport(browser.report);
  const appKey = pullRequestKey(11, 22, 33);
  notEqual(workflowKey, appKey, "browser workflow and App PR key formats differ");
  const appSource = source("lib/github-app-store.ts");
  const reviewIdentitySource = source("lib/r6c/review-identity.ts");
  assert(!appSource.includes("ReviewId") && !appSource.includes("review-identity"), "App store has no ReviewId dependency");
  assert(!reviewIdentitySource.includes("github-app-store") && !reviewIdentitySource.includes("pullRequestKey"), "ReviewId provider has no App key dependency");
  assert(appSource.includes("return `${installationId}:${repositoryId}:${number}`"), "App key source contract is exact");
  assert(workflowKey.includes(REPOSITORY.toLowerCase()), "browser key carries repository name");
  assert(!appKey.includes(REPOSITORY), "App key carries repository ID rather than repository name");
});

test("I11 - PR-aware comparison joins while workflow key splits", async () => {
  const left = derive({ title: "Comparison title A" });
  const right = derive({ title: "Comparison title B" });
  assert(await historyJoins(left, right), "real adapter joins same repository + positive PR for comparison");
  notEqual(reviewStateKeyForReport(left.report), reviewStateKeyForReport(right.report), "real workflow builder splits titles");
  equal(reportWorkspaceKey(historyEntry(left, CREATED_A)), reviewStateKeyForReport(left.report), "workspace report key delegates to workflow key dimensions");
});

test("I12 - deterministic merge/split matrix is backed by prior observations", () => {
  const expectedRow = (...cells: Cell[]): Record<Dimension, Cell> => {
    equal(cells.length, dimensions.length, "expected matrix row covers every controlled dimension");
    return Object.fromEntries(dimensions.map((dimension, index) => [dimension, cells[index]])) as Record<Dimension, Cell>;
  };
  const expected: Record<System, Record<Dimension, Cell>> = {
    "report history entry key": expectedRow("MERGES", "SPLITS", "SPLITS", "SPLITS", "MERGES", "MERGES", "MERGES", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "workflow/review-state key": expectedRow("MERGES", "SPLITS", "SPLITS", "MERGES", "MERGES", "MERGES", "MERGES", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "Human Decision outer key": expectedRow("MERGES", "SPLITS", "SPLITS", "MERGES", "MERGES", "MERGES", "MERGES", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "Human Decision intrinsic ledger ID": expectedRow("SPLITS", "SPLITS", "MERGES", "MERGES", "MERGES", "MERGES", "MERGES", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "merge-contract report ID": expectedRow("MERGES", "SPLITS", "MERGES", "MERGES", "SPLITS", "MERGES", "MERGES", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "projected Case ID": expectedRow("MERGES", "MERGES", "MERGES", "SPLITS", "UNKNOWN", "UNKNOWN", "UNKNOWN", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "conservative ReviewId": expectedRow("MERGES", "MERGES", "MERGES", "SPLITS", "UNKNOWN", "UNKNOWN", "UNKNOWN", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "PR-aware history comparison": expectedRow("SPLITS", "MERGES", "MERGES", "MERGES", "MERGES", "MERGES", "UNKNOWN", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "canonical input fingerprint": expectedRow("SPLITS", "SPLITS", "SPLITS", "MERGES", "SPLITS", "SPLITS", "MERGES", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "canonical configuration fingerprint": expectedRow("MERGES", "MERGES", "MERGES", "MERGES", "SPLITS", "MERGES", "MERGES", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "canonical result fingerprint": expectedRow("SPLITS", "SPLITS", "SPLITS", "MERGES", "SPLITS", "MERGES", "SPLITS", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "canonical run ID": expectedRow("SPLITS", "SPLITS", "SPLITS", "MERGES", "SPLITS", "SPLITS", "SPLITS", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "condition/progress report key": expectedRow("SPLITS", "SPLITS", "SPLITS", "MERGES", "SPLITS", "MERGES", "SPLITS", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "draft ReviewId owner": expectedRow("MERGES", "UNKNOWN", "UNKNOWN", "SPLITS", "UNKNOWN", "MERGES", "UNKNOWN", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "draft binding": expectedRow("SPLITS", "UNKNOWN", "UNKNOWN", "SPLITS", "UNKNOWN", "SPLITS", "UNKNOWN", "NOT_APPLICABLE", "NOT_APPLICABLE"),
    "GitHub App PR key": expectedRow("SPLITS", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "SPLITS", "SPLITS"),
  };
  deepEqual(matrix, expected, "matrix matches executable observations and explicit N/A boundaries");
});

test("I13 - current tracked source has no single persistent Review identity owner", () => {
  const reviewIdentitySource = source("lib/r6c/review-identity.ts");
  const adapterSource = source("lib/workspace-v2/real-adapter.ts");
  const historySource = source("lib/report-history.ts");
  const appSource = source("lib/github-app-store.ts");
  assert(reviewIdentitySource.includes("return singletonCaseIdentity(caseDetail.caseId)"), "default ReviewId is Case-owned");
  assert(adapterSource.includes("const caseId = `report-${entry.createdAt}`"), "projected Case identity is history-timestamp-owned");
  assert(adapterSource.includes("left.report.pr.number > 0") && adapterSource.includes("left.report.pr.repository === right.report.pr.repository"), "comparison has its separate PR-aware identity contract");
  assert(historySource.includes("createdAt: string"), "history entry exposes timestamp identity");
  assert(!appSource.includes("ReviewId") && !appSource.includes("reviewId"), "GitHub App persistence does not carry current ReviewId");
  equal(matrix["workflow/review-state key"]["PR number"], "MERGES", "workflow collision evidence remains present");
  equal(matrix["Human Decision intrinsic ledger ID"]["PR number"], "SPLITS", "intrinsic ledger disagreement remains present");
  equal(matrix["PR-aware history comparison"].title, "MERGES", "comparison title merge remains present");
  equal(matrix["workflow/review-state key"].title, "SPLITS", "workflow title split remains present");
});

let passed = 0;
for (const item of tests) {
  try {
    await item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`BS0.6 identity validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`BS0.6 identity validation: ${passed}/${tests.length} grouped checks passed\n`);
