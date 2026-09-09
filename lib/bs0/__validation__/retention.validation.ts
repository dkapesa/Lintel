import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createCanonicalReviewRunManifest,
  type CanonicalReviewRunManifest,
} from "../../canonical-review-run";
import {
  CONDITION_PROGRESS_STORAGE_KEY,
  conditionKey,
  conditionProgressReportKey,
  readConditionProgress,
  reportConditions,
} from "../../condition-progress";
import { DECISION_HISTORY_STORAGE_KEY } from "../../decision-history";
import { GITHUB_APP_ANALYSIS_RUN_RETENTION } from "../../github-app-store";
import {
  HUMAN_DECISION_LEDGER_ENTRY_LIMIT,
  HUMAN_DECISION_LEDGER_STORAGE_KEY,
  appendHumanDecisionLedgerEntryToStorage,
  createEmptyHumanDecisionLedger,
  humanDecisionLedgerKeyForReport,
  readHumanDecisionLedger,
  type HumanDecisionLedgerContext,
} from "../../human-decision-ledger";
import type { Report } from "../../mock-report";
import {
  GENERATED_REPORT_STORAGE_KEY,
  generateReport,
  type ReportInput,
} from "../../report-generator";
import {
  MAX_REPORT_HISTORY,
  REPORT_HISTORY_STORAGE_KEY,
  addReportToHistory,
  clearReportHistory,
  deleteReportFromHistory,
  readReportHistory,
  type ReportHistoryEntry,
} from "../../report-history";
import {
  conservativeReviewIdentityProvider,
  decisionSubjectIdFromCapability,
  indexReviews,
  reviewIdFromOpaqueToken,
  type DecisionDraftContext,
  type ReviewId,
} from "../../r6c/index";
import { HUMAN_DECISION_DRAFT_STORAGE_KEY } from "../../r6c/human-decision-draft-boundary";
import { MAX_REVIEW_CONTEXTS } from "../../r6c/persistence";
import {
  HumanDecisionDraftStore,
  MAX_HUMAN_DECISION_DRAFTS,
  createEmptyHumanDecisionDraft,
} from "../../r6k/index";
import {
  LEGACY_WORKSPACE_STATUS_STORAGE_KEY,
  REVIEW_STATE_STORAGE_KEY,
  readReviewState,
  readReviewStates,
  reviewStateKeyForReport,
} from "../../review-state";
import { REVIEW_ACTION_STATUS_STORAGE_KEY } from "../../review-actions";
import { ACTIVE_WORKSPACE_STORAGE_KEY, TEAM_WORKSPACE_STORAGE_KEY } from "../../team-workspace";
import { createWorkspaceDecisionService } from "../../workspace-v2/decision-mutations";
import { createWorkspacePersistence } from "../../workspace-v2/persistence";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import type { CaseDetail, WorkspaceSnapshot } from "../../workspace-v2/view-model";

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
  readonly removals: string[] = [];
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.removals.push(key); this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

class UnavailableStorage implements Storage {
  get length(): number { throw new Error("storage unavailable"); }
  clear(): void { throw new Error("storage unavailable"); }
  getItem(_key: string): string | null { throw new Error("storage unavailable"); }
  key(_index: number): string | null { throw new Error("storage unavailable"); }
  removeItem(_key: string): void { throw new Error("storage unavailable"); }
  setItem(_key: string, _value: string): void { throw new Error("storage unavailable"); }
}

const REPOSITORY = "lintel/bs0-retention";
const TARGET_TITLE = "Characterize retained review state";
const BASE_SHA = "base-bs0-retention";
const HEAD_SHA = "head-bs0-retention";
const CREATED = "2026-09-09T10:00:00.000Z";
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
  "-Old retention note.",
  "+New retention note.",
].join("\n");

type Derived = {
  input: ReportInput;
  report: Report;
  canonicalRun: CanonicalReviewRunManifest;
  context: HumanDecisionLedgerContext;
};

function derive(options: {
  title?: string;
  pullRequestNumber?: number;
  diff?: string;
  headSha?: string;
  runId?: string;
} = {}): Derived {
  const pullRequestNumber = options.pullRequestNumber ?? 707;
  const title = options.title ?? TARGET_TITLE;
  const input: ReportInput = {
    title,
    repository: REPOSITORY,
    technology: "TypeScript",
    diff: options.diff ?? RISKY_DIFF,
    inputSource: "github-pr",
    pullRequestNumber,
    reviewProfile: "standard",
  };
  const report = generateReport(input);
  const canonicalRun = createCanonicalReviewRunManifest({
    input,
    report,
    analysisSource: "deterministic",
    sourceType: "github-pr",
    runId: options.runId ?? `run-bs0-retention-${pullRequestNumber}-${title.replace(/\W+/g, "-").toLowerCase()}`,
    pullRequestNumber,
    baseSha: BASE_SHA,
    headSha: options.headSha ?? HEAD_SHA,
    createdAt: CREATED,
    completedAt: CREATED,
  });
  return {
    input,
    report,
    canonicalRun,
    context: { report, canonicalRun, currentHeadSha: canonicalRun.headSha },
  };
}

function withNow<T>(iso: string, run: () => T): T {
  const NativeDate = globalThis.Date;
  class FixedDate extends NativeDate {
    constructor() { super(iso); }
    static now() { return Date.parse(iso); }
  }
  globalThis.Date = FixedDate as DateConstructor;
  try {
    return run();
  } finally {
    globalThis.Date = NativeDate;
  }
}

function addAt(storage: Storage, derived: Derived, createdAt: string): ReportHistoryEntry {
  const entries = withNow(createdAt, () => addReportToHistory(
    storage,
    derived.report,
    "deterministic",
    derived.canonicalRun,
  ));
  const entry = entries.find((item) => item.canonicalRun?.runId === derived.canonicalRun.runId);
  assert(entry, `history append must retain ${derived.canonicalRun.runId}`);
  return entry;
}

function filler(index: number, prefix: string): Derived {
  return derive({
    title: `${prefix} filler ${index}`,
    pullRequestNumber: 8000 + index,
    diff: index % 2 === 0 ? RISKY_DIFF : DOCS_DIFF,
    headSha: `head-${prefix}-${index}`,
    runId: `run-${prefix}-${index}`,
  });
}

function timeAt(offset: number): string {
  return new Date(Date.parse("2030-01-01T00:00:00.000Z") + offset * 60_000).toISOString();
}

function evictByCapacity(storage: Storage, prefix: string, startOffset = 100): void {
  for (let index = 0; index < MAX_REPORT_HISTORY; index += 1) {
    addAt(storage, filler(index, prefix), timeAt(startOffset + index));
  }
}

async function load(storage: Storage, reportId: string | null = null): Promise<WorkspaceSnapshot> {
  return createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId });
}

async function ready(storage: Storage): Promise<Extract<WorkspaceSnapshot, { status: "ready" }>> {
  const snapshot = await load(storage);
  assert(snapshot.status === "ready", "Workspace projection must be ready");
  return snapshot;
}

async function detailFor(storage: Storage, caseId: string): Promise<CaseDetail> {
  const snapshot = await ready(storage);
  const detail = snapshot.cases.find((item) => item.caseId === caseId);
  assert(detail, `Case ${caseId} must project`);
  return detail;
}

function reviewIdFor(detail: CaseDetail): ReviewId {
  return conservativeReviewIdentityProvider.reviewIdFor(detail);
}

function draftContext(reviewId: ReviewId, detail: CaseDetail): DecisionDraftContext {
  assert(detail.decisionMutation.kind === "available", "mutable decision context required");
  return {
    reviewId,
    decisionSubject: {
      status: "available",
      decisionSubjectId: decisionSubjectIdFromCapability(detail.decisionMutation.caseId),
    },
    basis: {
      caseId: detail.caseId,
      runId: detail.run?.runId ?? null,
      headSha: detail.run?.headSha ?? detail.github.headSha,
    },
  };
}

function recordDecision(storage: Storage, detail: CaseDetail): string {
  assert(detail.decisionMutation.kind === "available", "decision mutation must be available");
  const result = createWorkspaceDecisionService(storage).recordDecision({
    kind: "record",
    caseId: detail.decisionMutation.caseId,
    expectedHeadSha: detail.decisionMutation.currentHeadSha,
    outcome: "approve",
    rationale: "Retain the accountable decision across the history boundary.",
    references: [],
    acceptedRiskReferences: [],
  });
  equal(result.outcome, "persisted", "Human Decision production service persists");
  assert(result.effectiveEntryId, "persisted decision exposes its effective entry id");
  return result.effectiveEntryId;
}

function source(path: string): string {
  return readFileSync(join(process.cwd(), ...path.split("/")), "utf8");
}

const evidence = {
  capacityNoCascade: false,
  explicitDeleteNoCascade: false,
  clearNoCascade: false,
  workflowReattached: false,
  decisionReattached: false,
  progressReattached: false,
  draftStayedOrphaned: false,
};

type Cell = "YES" | "NO" | "NOT_APPLICABLE" | "UNKNOWN" | "NOT_IMPLEMENTED";
const lifecycleRows = [
  "Report history",
  "Projected Case",
  "Default ReviewId/index",
  "Workflow/review state",
  "Human Decision ledger",
  "Condition progress",
  "Human Decision draft",
  "GitHub App canonical verification history",
] as const;
const lifecycleColumns = [
  "removed by capacity eviction",
  "removed by explicit history deletion",
  "removed by history clear",
  "has direct store limit",
  "physically survives without Report",
  "normally reachable without Report",
  "naturally reattaches when matching identity returns",
] as const;
type LifecycleRow = typeof lifecycleRows[number];
type LifecycleColumn = typeof lifecycleColumns[number];

const lifecycleMatrix = Object.fromEntries(lifecycleRows.map((row) => [
  row,
  Object.fromEntries(lifecycleColumns.map((column) => [column, "UNKNOWN"])) as Record<LifecycleColumn, Cell>,
])) as Record<LifecycleRow, Record<LifecycleColumn, Cell>>;

function observeLifecycle(
  row: LifecycleRow,
  column: LifecycleColumn,
  value: "YES" | "NO",
): void {
  const current = lifecycleMatrix[row][column];
  if (current !== "UNKNOWN" && current !== value) {
    fail(`conflicting lifecycle observation for ${row}/${column}: ${current} then ${value}`);
  }
  lifecycleMatrix[row][column] = value;
}

function markNotApplicable(row: LifecycleRow, column: LifecycleColumn): void {
  const current = lifecycleMatrix[row][column];
  if (current !== "UNKNOWN" && current !== "NOT_APPLICABLE") {
    fail(`conflicting lifecycle applicability for ${row}/${column}: ${current}`);
  }
  lifecycleMatrix[row][column] = "NOT_APPLICABLE";
}

/* Validation-local inventory: documentation metadata only, never a production abstraction. */
const retentionSurface = [
  { store: "Report history", key: REPORT_HISTORY_STORAGE_KEY, address: "createdAt / report-<createdAt>", limit: MAX_REPORT_HISTORY, delete: "deleteReportFromHistory", clear: "clearReportHistory", projectionNeedsReport: true, evidence: "executable" },
  { store: "Workflow/review state", key: REVIEW_STATE_STORAGE_KEY, address: "repository + title + input label", limit: null, delete: "removeReviewState", clear: "clearReviewStates", projectionNeedsReport: true, evidence: "executable + source-contract" },
  { store: "Legacy workspace status", key: LEGACY_WORKSPACE_STATUS_STORAGE_KEY, address: "legacy review-state key", limit: null, delete: "clear only", clear: "clearReviewStates", projectionNeedsReport: true, evidence: "source-contract" },
  { store: "Human Decision ledger envelope", key: HUMAN_DECISION_LEDGER_STORAGE_KEY, address: "workflow key; intrinsic ledger/entry ids inside", limit: HUMAN_DECISION_LEDGER_ENTRY_LIMIT, delete: "none exported", clear: "none exported", projectionNeedsReport: true, evidence: "executable + source-contract" },
  { store: "Condition progress", key: CONDITION_PROGRESS_STORAGE_KEY, address: "conditionProgressReportKey(report) then conditionKey", limit: null, delete: "none exported", clear: "none exported", projectionNeedsReport: true, evidence: "executable + source-contract" },
  { store: "Human Decision drafts", key: HUMAN_DECISION_DRAFT_STORAGE_KEY, address: "ReviewId", limit: MAX_HUMAN_DECISION_DRAFTS, delete: "removeValid(ReviewId)", clear: "none exported", projectionNeedsReport: false, evidence: "executable + source-contract" },
  { store: "Decision history", key: DECISION_HISTORY_STORAGE_KEY, address: "workflow key then event id", limit: 60, delete: "removeDecisionHistory", clear: "clearDecisionHistory", projectionNeedsReport: true, evidence: "source-contract" },
  { store: "Review action progress", key: REVIEW_ACTION_STATUS_STORAGE_KEY, address: "report hash then action hash", limit: null, delete: "removeReviewActionStatuses", clear: "clearReviewActionStatuses", projectionNeedsReport: true, evidence: "source-contract" },
  { store: "Generated report handoff", key: GENERATED_REPORT_STORAGE_KEY, address: "one session key", limit: null, delete: "session replacement", clear: "none exported", projectionNeedsReport: false, evidence: "source-contract" },
  { store: "Team workspace/report association", key: `${TEAM_WORKSPACE_STORAGE_KEY} + ${ACTIVE_WORKSPACE_STORAGE_KEY}`, address: "reportHistoryEntryKey(entry) to workspaceId", limit: null, delete: "none for report association", clear: "none exported", projectionNeedsReport: true, evidence: "source-contract" },
  { store: "R6C review contexts", key: "lintel.r6.reviewContext.v1", address: "ReviewId", limit: MAX_REVIEW_CONTEXTS, delete: "bounded write eviction", clear: "clearWorkstationPersistence", projectionNeedsReport: false, evidence: "source-contract" },
  { store: "GitHub App analysis runs", key: ".lintel-data/github-app-store.json", address: "pull-request record then runId", limit: GITHUB_APP_ANALYSIS_RUN_RETENTION, delete: "none characterized", clear: "none characterized", projectionNeedsReport: false, evidence: "source-contract" },
  { store: "GitHub App run verifications", key: ".lintel-data/github-app-store.json", address: "pull-request record + runId; newest-first record array", limit: 20, delete: "none characterized", clear: "none characterized", projectionNeedsReport: false, evidence: "source-contract" },
] as const;

test("R1 - Report history retains the ten newest insertions, not the greatest timestamps", () => {
  equal(MAX_REPORT_HISTORY, 10, "current production Report history limit");
  const storage = new MemoryStorage();
  const first = derive({ title: "R1 first insertion", runId: "run-r1-first" });
  const firstEntry = addAt(storage, first, "2040-01-01T00:00:00.000Z");
  const inserted: string[] = [];
  for (let index = 0; index < MAX_REPORT_HISTORY; index += 1) {
    const item = filler(index, "r1");
    inserted.push(item.report.pr.title);
    addAt(storage, item, `2020-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`);
  }
  const retained = readReportHistory(storage);
  equal(retained.length, MAX_REPORT_HISTORY, "exact retained count");
  deepEqual(retained.map((entry) => entry.report.pr.title), [...inserted].reverse(), "newest insertion is first");
  assert(!retained.some((entry) => entry.createdAt === firstEntry.createdAt), "first insertion is evicted");
  assert(retained.every((entry) => Date.parse(entry.createdAt) < Date.parse(firstEntry.createdAt)), "greater timestamp does not protect an older insertion");
  observeLifecycle("Report history", "removed by capacity eviction", "YES");
  observeLifecycle("Report history", "has direct store limit", "YES");
  markNotApplicable("Report history", "physically survives without Report");
  markNotApplicable("Report history", "normally reachable without Report");
  markNotApplicable("Report history", "naturally reattaches when matching identity returns");
});

test("R2 - capacity eviction removes Case, ReviewId and comparison reachability", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R2 projected target", runId: "run-r2-target" });
  const entry = addAt(storage, target, timeAt(1));
  const before = await detailFor(storage, `report-${entry.createdAt}`);
  const oldReviewId = reviewIdFor(before);
  evictByCapacity(storage, "r2");
  const after = await ready(storage);
  assert(!after.cases.some((item) => item.caseId === before.caseId), "evicted Case disappears");
  assert(!indexReviews(after.cases).byReviewId.has(oldReviewId), "evicted default ReviewId disappears from fresh index");
  assert(!after.cases.some((item) => item.history?.status === "comparison" && (item.history.comparisons?.some((comparison) => comparison.target.runId === target.canonicalRun.runId) ?? false)), "comparison projection does not expose evicted run");
  const explicit = await load(storage, before.caseId);
  assert(explicit.status === "unavailable", "normal explicit lookup cannot reach evicted report");
  observeLifecycle("Projected Case", "removed by capacity eviction", "YES");
  observeLifecycle("Projected Case", "normally reachable without Report", "NO");
  markNotApplicable("Projected Case", "has direct store limit");
  markNotApplicable("Projected Case", "physically survives without Report");
  observeLifecycle("Default ReviewId/index", "removed by capacity eviction", "YES");
  observeLifecycle("Default ReviewId/index", "normally reachable without Report", "NO");
  markNotApplicable("Default ReviewId/index", "has direct store limit");
  markNotApplicable("Default ReviewId/index", "physically survives without Report");
});

test("R3 - workflow state survives eviction, becomes unreachable, then reattaches by workflow key", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R3 workflow target", runId: "run-r3-target" });
  const entry = addAt(storage, target, timeAt(2));
  const before = await detailFor(storage, `report-${entry.createdAt}`);
  const result = createWorkspacePersistence(storage).applyReviewStatus({ kind: "review-status", caseId: before.caseId, status: "Reviewed" });
  equal(result.outcome, "persisted", "workflow production service persists");
  const key = reviewStateKeyForReport(target.report);
  assert(readReviewStates(storage)[key], "workflow state is directly addressable before eviction");
  evictByCapacity(storage, "r3");
  const envelope = JSON.parse(storage.getItem(REVIEW_STATE_STORAGE_KEY)!) as Record<string, unknown>;
  assert(Object.prototype.hasOwnProperty.call(envelope, key), "workflow bytes remain physically retained");
  equal(readReviewState(storage, target.report).status, "Reviewed", "workflow state remains addressable by legacy key");
  assert(!(await ready(storage)).cases.some((item) => item.caseId === before.caseId), "workflow state is unreachable without its Case");
  const replacement = addAt(storage, target, timeAt(500));
  const reattached = await detailFor(storage, `report-${replacement.createdAt}`);
  equal(reattached.reviewStatus, "Reviewed", "matching workflow key reattaches retained state");
  observeLifecycle("Workflow/review state", "removed by capacity eviction", "NO");
  observeLifecycle("Workflow/review state", "physically survives without Report", "YES");
  observeLifecycle("Workflow/review state", "normally reachable without Report", "NO");
  observeLifecycle("Workflow/review state", "naturally reattaches when matching identity returns", "YES");
  evidence.workflowReattached = true;
});

test("R4 - Human Decision ledger survives Report eviction without a cascade", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R4 decision target", runId: "run-r4-target" });
  const entry = addAt(storage, target, timeAt(3));
  const before = await detailFor(storage, `report-${entry.createdAt}`);
  const entryId = recordDecision(storage, before);
  const projected = await detailFor(storage, before.caseId);
  assert(projected.decision.status === "recorded", "decision projects while Report exists");
  evictByCapacity(storage, "r4");
  const key = humanDecisionLedgerKeyForReport(target.report);
  const envelope = JSON.parse(storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY)!) as Record<string, unknown>;
  assert(Object.prototype.hasOwnProperty.call(envelope, key), "ledger remains physically retained");
  assert(readHumanDecisionLedger(storage, key, target.context).entries.some((item) => item.entryId === entryId), "ledger remains directly addressable");
  assert(!(await ready(storage)).cases.some((item) => item.caseId === before.caseId), "decision is unreachable after its Case disappears");
  observeLifecycle("Human Decision ledger", "removed by capacity eviction", "NO");
  observeLifecycle("Human Decision ledger", "physically survives without Report", "YES");
  observeLifecycle("Human Decision ledger", "normally reachable without Report", "NO");
  evidence.capacityNoCascade = true;
});

test("R5 - surviving Human Decision reattaches to a distinct PR with the matching real legacy key", async () => {
  const storage = new MemoryStorage();
  const original = derive({ title: "R5 shared title", pullRequestNumber: 751, runId: "run-r5-original" });
  const originalEntry = addAt(storage, original, timeAt(4));
  const originalDetail = await detailFor(storage, `report-${originalEntry.createdAt}`);
  const entryId = recordDecision(storage, originalDetail);
  const storedBefore = readHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(original.report), original.context);
  evictByCapacity(storage, "r5");
  const later = derive({ title: original.report.pr.title, pullRequestNumber: 752, diff: DOCS_DIFF, headSha: HEAD_SHA, runId: "run-r5-later" });
  equal(humanDecisionLedgerKeyForReport(later.report), humanDecisionLedgerKeyForReport(original.report), "production key builder produces the matching outer key");
  const laterEntry = addAt(storage, later, timeAt(501));
  const laterDetail = await detailFor(storage, `report-${laterEntry.createdAt}`);
  assert(laterDetail.decision.status === "recorded", "surviving decision becomes visible on later Case");
  equal(laterDetail.decision.effectiveEntryId, entryId, "reattached projection retains original entry identity");
  const reread = readHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(later.report), later.context);
  equal(reread.ledgerId, storedBefore.ledgerId, "intrinsic original ledger identity survives reattachment");
  equal(reread.entries[0]?.pullRequestNumber, 751, "intrinsic entry ownership remains the original PR");
  equal(laterDetail.github.pullRequestNumber, 752, "new Case belongs to the distinct later PR");
  observeLifecycle("Human Decision ledger", "naturally reattaches when matching identity returns", "YES");
  evidence.decisionReattached = true;
});

test("R6 - condition progress survives eviction and reattaches when its actual progress identity returns", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R6 progress target", runId: "run-r6-target" });
  const conditions = reportConditions(target.report);
  assert(conditions[0], "controlled report must expose a production merge condition");
  const progressIdentity = conditionProgressReportKey(target.report, conditions);
  const conditionIdentity = conditionKey(conditions[0]);
  const entry = addAt(storage, target, timeAt(5));
  const detail = await detailFor(storage, `report-${entry.createdAt}`);
  const result = createWorkspacePersistence(storage).applyConditionProgress({ kind: "condition-progress", caseId: detail.caseId, conditionKey: conditionIdentity, intent: "clear" });
  equal(result.outcome, "persisted", "condition progress production service persists");
  evictByCapacity(storage, "r6");
  assert(storage.getItem(CONDITION_PROGRESS_STORAGE_KEY)?.includes(progressIdentity), "progress remains physically retained");
  assert(readConditionProgress(storage, target.report, conditions).has(conditionIdentity), "progress remains directly addressable");
  assert(!(await ready(storage)).cases.some((item) => item.caseId === detail.caseId), "progress is unreachable without its Case");
  const replacement = addAt(storage, target, timeAt(502));
  const reattached = await detailFor(storage, `report-${replacement.createdAt}`);
  const capability = reattached.requirements.map((item) => item.conditionProgress).find((item) => item.kind === "available" && item.conditionKey === conditionIdentity);
  assert(capability?.kind === "available" && capability.cleared, "matching progress identity reuses retained cleared state");
  observeLifecycle("Condition progress", "removed by capacity eviction", "NO");
  observeLifecycle("Condition progress", "physically survives without Report", "YES");
  observeLifecycle("Condition progress", "normally reachable without Report", "NO");
  observeLifecycle("Condition progress", "naturally reattaches when matching identity returns", "YES");
  evidence.progressReattached = true;
});

test("R7 - ReviewId-keyed draft survives while timestamp-derived ReviewId reachability does not", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R7 draft target", runId: "run-r7-target" });
  const entry = addAt(storage, target, timeAt(6));
  const originalCase = await detailFor(storage, `report-${entry.createdAt}`);
  const originalReviewId = reviewIdFor(originalCase);
  const context = draftContext(originalReviewId, originalCase);
  const draftStore = new HumanDecisionDraftStore(storage);
  const draft = { ...createEmptyHumanDecisionDraft(originalReviewId, context, null, CREATED), rationale: "Retained draft rationale." };
  assert(draftStore.write(originalReviewId, draft).persisted, "draft persists through production store");
  evictByCapacity(storage, "r7");
  assert(storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY)?.includes(originalReviewId), "draft remains physically retained");
  equal(draftStore.read(originalReviewId).status, "valid", "draft remains directly addressable by old ReviewId");
  assert(!indexReviews((await ready(storage)).cases).byReviewId.has(originalReviewId), "fresh index does not expose old ReviewId");
  const replacement = addAt(storage, target, timeAt(503));
  const replacementCase = await detailFor(storage, `report-${replacement.createdAt}`);
  const replacementReviewId = reviewIdFor(replacementCase);
  notEqual(replacementReviewId, originalReviewId, "new history timestamp creates a different default ReviewId");
  assert(!indexReviews((await ready(storage)).cases).byReviewId.has(originalReviewId), "old draft owner is not naturally indexed again");
  equal(draftStore.read(originalReviewId).status, "valid", "old draft stays addressable but unreachable");
  equal(draftStore.read(replacementReviewId).status, "absent", "replacement ReviewId does not acquire old draft");
  observeLifecycle("Human Decision draft", "removed by capacity eviction", "NO");
  observeLifecycle("Human Decision draft", "physically survives without Report", "YES");
  observeLifecycle("Human Decision draft", "normally reachable without Report", "NO");
  observeLifecycle("Human Decision draft", "naturally reattaches when matching identity returns", "NO");
  observeLifecycle("Projected Case", "naturally reattaches when matching identity returns", "NO");
  observeLifecycle("Default ReviewId/index", "naturally reattaches when matching identity returns", "NO");
  evidence.draftStayedOrphaned = true;
});

test("R8 - explicit history deletion has the same no-cascade orphan boundary as capacity eviction", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R8 explicit delete target", runId: "run-r8-target" });
  const entry = addAt(storage, target, timeAt(7));
  const detail = await detailFor(storage, `report-${entry.createdAt}`);
  createWorkspacePersistence(storage).applyReviewStatus({ kind: "review-status", caseId: detail.caseId, status: "Reviewed" });
  recordDecision(storage, detail);
  const beforeReview = storage.getItem(REVIEW_STATE_STORAGE_KEY);
  const beforeDecision = storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY);
  deleteReportFromHistory(storage, entry.createdAt);
  equal(readReportHistory(storage).length, 0, "explicit production deletion removes history entry");
  equal(storage.getItem(REVIEW_STATE_STORAGE_KEY), beforeReview, "explicit deletion does not touch workflow bytes");
  equal(storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY), beforeDecision, "explicit deletion does not touch decision bytes");
  equal((await load(storage)).status, "empty", "deleted Case is no longer projected");
  observeLifecycle("Report history", "removed by explicit history deletion", "YES");
  observeLifecycle("Projected Case", "removed by explicit history deletion", "YES");
  observeLifecycle("Workflow/review state", "removed by explicit history deletion", "NO");
  observeLifecycle("Human Decision ledger", "removed by explicit history deletion", "NO");
  evidence.explicitDeleteNoCascade = true;
});

test("R9 - clearReportHistory clears only the Report history key", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R9 clear target", runId: "run-r9-target" });
  const entry = addAt(storage, target, timeAt(8));
  const detail = await detailFor(storage, `report-${entry.createdAt}`);
  createWorkspacePersistence(storage).applyReviewStatus({ kind: "review-status", caseId: detail.caseId, status: "Reviewed" });
  recordDecision(storage, detail);
  const conditions = reportConditions(target.report);
  assert(conditions[0], "controlled report has condition progress");
  createWorkspacePersistence(storage).applyConditionProgress({ kind: "condition-progress", caseId: detail.caseId, conditionKey: conditionKey(conditions[0]), intent: "clear" });
  const reviewId = reviewIdFor(detail);
  const drafts = new HumanDecisionDraftStore(storage);
  assert(drafts.write(reviewId, createEmptyHumanDecisionDraft(reviewId, draftContext(reviewId, detail), null, CREATED)).persisted, "draft seeded");
  const relatedKeys = [REVIEW_STATE_STORAGE_KEY, HUMAN_DECISION_LEDGER_STORAGE_KEY, CONDITION_PROGRESS_STORAGE_KEY, HUMAN_DECISION_DRAFT_STORAGE_KEY] as const;
  const before = new Map(relatedKeys.map((key) => [key, storage.getItem(key)]));
  clearReportHistory(storage);
  equal(storage.getItem(REPORT_HISTORY_STORAGE_KEY), null, "clear operation removes history key");
  for (const key of relatedKeys) equal(storage.getItem(key), before.get(key), `${key} survives history clear byte-for-byte`);
  deepEqual(storage.removals, [REPORT_HISTORY_STORAGE_KEY], "history clear removes no other key");
  equal((await load(storage)).status, "empty", "history clear removes normal Case reachability");
  observeLifecycle("Report history", "removed by history clear", "YES");
  observeLifecycle("Projected Case", "removed by history clear", "YES");
  observeLifecycle("Workflow/review state", "removed by history clear", "NO");
  observeLifecycle("Human Decision ledger", "removed by history clear", "NO");
  observeLifecycle("Condition progress", "removed by history clear", "NO");
  observeLifecycle("Human Decision draft", "removed by history clear", "NO");
  evidence.clearNoCascade = true;
});

test("R10 - production limits are exact; ledger drops oldest entries and full draft store refuses a new owner", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R10 bounded ledger", runId: "run-r10-target" });
  const key = humanDecisionLedgerKeyForReport(target.report);
  let ledger = createEmptyHumanDecisionLedger(target.context, timeAt(0));
  for (let index = 0; index < HUMAN_DECISION_LEDGER_ENTRY_LIMIT + 2; index += 1) {
    ledger = appendHumanDecisionLedgerEntryToStorage(storage, key, ledger, target.context, {
      eventType: "note-recorded",
      reason: `bounded ledger event ${index}`,
      recordedAt: timeAt(1000 + index),
      source: "local",
    });
  }
  const retained = readHumanDecisionLedger(storage, key, target.context);
  equal(retained.entries.length, HUMAN_DECISION_LEDGER_ENTRY_LIMIT, "ledger exact retained count");
  equal(retained.entries[0]?.reason, "bounded ledger event 2", "ledger evicts oldest entries");
  equal(retained.entries.at(-1)?.reason, `bounded ledger event ${HUMAN_DECISION_LEDGER_ENTRY_LIMIT + 1}`, "ledger retains newest entry at chronological tail");

  const drafts = new HumanDecisionDraftStore(storage);
  let firstReviewId: ReviewId | null = null;
  for (let index = 0; index < MAX_HUMAN_DECISION_DRAFTS; index += 1) {
    const reviewId = reviewIdFromOpaqueToken(`r10-draft-${index}`);
    firstReviewId ??= reviewId;
    const context: DecisionDraftContext = {
      reviewId,
      decisionSubject: { status: "available", decisionSubjectId: decisionSubjectIdFromCapability(`r10-subject-${index}`) },
      basis: { caseId: `r10-case-${index}`, runId: `r10-run-${index}`, headSha: `r10-head-${index}` },
    };
    assert(drafts.write(reviewId, createEmptyHumanDecisionDraft(reviewId, context, null, timeAt(2000 + index))).persisted, `draft slot ${index} persists`);
  }
  const rejectedId = reviewIdFromOpaqueToken("r10-draft-over-limit");
  const rejectedContext: DecisionDraftContext = {
    reviewId: rejectedId,
    decisionSubject: { status: "available", decisionSubjectId: decisionSubjectIdFromCapability("r10-subject-over-limit") },
    basis: { caseId: "r10-case-over-limit", runId: "r10-run-over-limit", headSha: "r10-head-over-limit" },
  };
  const rejected = drafts.write(rejectedId, createEmptyHumanDecisionDraft(rejectedId, rejectedContext, null, timeAt(3000)));
  assert(!rejected.persisted && rejected.durability.category === "not-saved" && rejected.durability.reason === "device-draft-limit-reached", "draft store refuses the sixty-fifth owner without eviction");
  equal(drafts.occupiedSlots(), MAX_HUMAN_DECISION_DRAFTS, "draft count remains capped");
  assert(firstReviewId && drafts.read(firstReviewId).status === "valid", "oldest draft remains; limit is refusal, not eviction");

  const decisionHistorySource = source("lib/decision-history.ts");
  const githubStoreSource = source("lib/github-app-store.ts");
  equal(GITHUB_APP_ANALYSIS_RUN_RETENTION, 20, "GitHub App run retention source contract");
  assert(githubStoreSource.includes("run.verifications = [verification, ...(run.verifications ?? [])].slice(0, 20)"), "GitHub App verification history is newest-first and capped at twenty");
  assert(decisionHistorySource.includes("const MAX_DECISION_HISTORY_EVENTS = 60") && decisionHistorySource.includes("[nextEvent, ...existing].slice(0, MAX_DECISION_HISTORY_EVENTS)"), "decision history is newest-first and capped at sixty per workflow key");
  observeLifecycle("Human Decision ledger", "has direct store limit", "YES");
  observeLifecycle("Human Decision draft", "has direct store limit", "YES");
  observeLifecycle("GitHub App canonical verification history", "has direct store limit", "YES");
});

test("R11 - unequal real retention horizons leave associated state retained but unreachable", async () => {
  const storage = new MemoryStorage();
  const target = derive({ title: "R11 unequal horizon", runId: "run-r11-target" });
  const entry = addAt(storage, target, timeAt(9));
  const detail = await detailFor(storage, `report-${entry.createdAt}`);
  createWorkspacePersistence(storage).applyReviewStatus({ kind: "review-status", caseId: detail.caseId, status: "Reviewed" });
  recordDecision(storage, detail);
  const conditions = reportConditions(target.report);
  assert(conditions[0], "controlled report has a condition");
  createWorkspacePersistence(storage).applyConditionProgress({ kind: "condition-progress", caseId: detail.caseId, conditionKey: conditionKey(conditions[0]), intent: "clear" });
  evictByCapacity(storage, "r11");
  assert(!readReportHistory(storage).some((item) => item.createdAt === entry.createdAt), "Report identity reaches ten-entry horizon and disappears");
  assert(readReviewStates(storage)[reviewStateKeyForReport(target.report)], "workflow survives and is addressable");
  assert(readHumanDecisionLedger(storage, humanDecisionLedgerKeyForReport(target.report), target.context).entries.length > 0, "Human Decision survives and is addressable");
  assert(readConditionProgress(storage, target.report, conditions).has(conditionKey(conditions[0])), "condition progress survives and is addressable");
  const snapshot = await ready(storage);
  assert(!snapshot.cases.some((item) => item.caseId === detail.caseId), "all surviving associated state is unreachable from normal projection");
});

test("R12 - history has no eviction marker; availability distinctions vary by production reader", async () => {
  const absentStorage = new MemoryStorage();
  equal((await load(absentStorage)).status, "empty", "absent history key projects empty");

  const storage = new MemoryStorage();
  const target = derive({ title: "R12 evicted target", runId: "run-r12-target" });
  const entry = addAt(storage, target, timeAt(10));
  evictByCapacity(storage, "r12");
  const evicted = await load(storage, `report-${entry.createdAt}`);
  const neverExisted = await load(storage, "report-1900-01-01T00:00:00.000Z");
  assert(evicted.status === "unavailable" && neverExisted.status === "unavailable", "unknown explicit histories are unavailable");
  equal(evicted.reason, neverExisted.reason, "history projection cannot distinguish evicted from never-existing identity");
  assert(!storage.getItem(REPORT_HISTORY_STORAGE_KEY)?.includes(entry.createdAt), "no eviction tombstone is persisted");

  const unavailable = new UnavailableStorage();
  const unavailableProjection = await load(unavailable);
  assert(unavailableProjection.status === "unavailable" && unavailableProjection.reason.includes("storage unavailable"), "Workspace distinguishes unavailable storage from empty history");
  deepEqual(readReviewStates(unavailable), {}, "review-state reader collapses unavailable store to no records");
  equal(readConditionProgress(unavailable, target.report).size, 0, "condition reader collapses unavailable store to empty progress");
  equal(readHumanDecisionLedger(unavailable, humanDecisionLedgerKeyForReport(target.report), target.context).entries.length, 0, "ledger reader collapses unavailable store to an empty ledger");
  const unavailableDrafts = new HumanDecisionDraftStore(unavailable);
  assert(unavailableDrafts.storeDurability()?.category === "unavailable", "draft store separately exposes unavailable durability");
  equal(unavailableDrafts.read(reviewIdFromOpaqueToken("r12-absent" )).status, "absent", "draft read alone collapses unavailable store to absent");
});

test("R13 - retention/orphan lifecycle matrix contains only exercised or explicit unknown cells", () => {
  const expectedRows = {
    "Report history":                            ["YES", "YES", "YES", "YES", "NOT_APPLICABLE", "NOT_APPLICABLE", "NOT_APPLICABLE"],
    "Projected Case":                            ["YES", "YES", "YES", "NOT_APPLICABLE", "NOT_APPLICABLE", "NO", "NO"],
    "Default ReviewId/index":                    ["YES", "UNKNOWN", "UNKNOWN", "NOT_APPLICABLE", "NOT_APPLICABLE", "NO", "NO"],
    "Workflow/review state":                     ["NO", "NO", "NO", "UNKNOWN", "YES", "NO", "YES"],
    "Human Decision ledger":                     ["NO", "NO", "NO", "YES", "YES", "NO", "YES"],
    "Condition progress":                        ["NO", "UNKNOWN", "NO", "UNKNOWN", "YES", "NO", "YES"],
    "Human Decision draft":                      ["NO", "UNKNOWN", "NO", "YES", "YES", "NO", "NO"],
    "GitHub App canonical verification history": ["UNKNOWN", "UNKNOWN", "UNKNOWN", "YES", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
  } satisfies Record<LifecycleRow, readonly Cell[]>;
  const expectedMatrix = Object.fromEntries(lifecycleRows.map((row) => [
    row,
    Object.fromEntries(lifecycleColumns.map((column, index) => [column, expectedRows[row][index]])),
  ]));

  equal(lifecycleColumns.length, 7, "matrix column count");
  equal(Object.keys(lifecycleMatrix).length, 8, "matrix row count");
  for (const [row, cells] of Object.entries(lifecycleMatrix)) {
    equal(Object.keys(cells).length, lifecycleColumns.length, `${row} column coverage`);
    assert(Object.values(cells).every((cell) => ["YES", "NO", "NOT_APPLICABLE", "UNKNOWN", "NOT_IMPLEMENTED"].includes(cell)), `${row} uses bounded vocabulary`);
  }
  deepEqual(lifecycleMatrix, expectedMatrix, "matrix is populated by preceding executable and narrow source-contract observations");
  equal(retentionSurface.length, 13, "validation-local inventory covers the directly relevant stores");
});

test("R14 - no characterized production lifecycle owner cascades across the independent stores", () => {
  const keys = new Set([
    REPORT_HISTORY_STORAGE_KEY,
    REVIEW_STATE_STORAGE_KEY,
    HUMAN_DECISION_LEDGER_STORAGE_KEY,
    CONDITION_PROGRESS_STORAGE_KEY,
    HUMAN_DECISION_DRAFT_STORAGE_KEY,
    DECISION_HISTORY_STORAGE_KEY,
    REVIEW_ACTION_STATUS_STORAGE_KEY,
  ]);
  equal(keys.size, 7, "characterized lifecycle planes use distinct storage keys");
  assert(evidence.capacityNoCascade, "capacity eviction leaves associated stores physically retained");
  assert(evidence.explicitDeleteNoCascade, "explicit deletion leaves associated stores physically retained");
  assert(evidence.clearNoCascade, "history clear leaves associated stores physically retained");
  equal(new Set<number>([MAX_REPORT_HISTORY, HUMAN_DECISION_LEDGER_ENTRY_LIMIT, MAX_HUMAN_DECISION_DRAFTS]).size, 3, "independent stores have unequal horizons");
});

let passed = 0;
for (const item of tests) {
  try {
    await item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`BS0.7 retention validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`BS0.7 retention validation: ${passed}/${tests.length} grouped checks passed\n`);
