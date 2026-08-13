import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createCanonicalReviewRunManifest } from "../../canonical-review-run";
import { HUMAN_DECISION_LEDGER_STORAGE_KEY } from "../../human-decision-ledger";
import { generateReport, type ReportInput } from "../../report-generator";
import { addReportToHistory } from "../../report-history";
import {
  createInitialWorkstationState,
  decisionSubjectIdFromCapability,
  dispatchAction,
  indexReviews,
  reviewIdFromOpaqueToken,
  type DecisionDraftContext,
  type ReviewId,
} from "../../r6c/index";
import { HUMAN_DECISION_DRAFT_STORAGE_KEY } from "../../r6c/human-decision-draft-boundary";
import { R6D_BOUND_ACTION_IDS } from "../../r6d/controller-contract";
import { WORKSTATION_BOUND_ACTION_IDS } from "../../r6e/action-registry";
import { projectHumanDecision } from "../../r6f/human-decision-orientation";
import { createWorkspaceDecisionService } from "../../workspace-v2/decision-mutations";
import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import { createRealWorkspaceAdapter } from "../../workspace-v2/real-adapter";
import {
  DECISION_OUTCOMES,
  OUTCOME_LABEL,
  OUTCOME_MEANING,
  RECOMMENDATION_LABEL,
  type CaseDetail,
  type DecisionRecordedView,
} from "../../workspace-v2/view-model";
import {
  MAX_HUMAN_DECISION_DRAFTS,
  DEFAULT_DECISION_OUTCOMES,
  MORE_DECISION_OUTCOMES,
  R6K_DRAFT_SCHEMA_VERSION,
  HumanDecisionDraftStore,
  acknowledgeDecisionDraftReconciliation,
  buildHumanDecisionCommand,
  canonicalOutcomeAllowsRetry,
  canonicalOutcomeClearsDraft,
  compareDecisionBasis,
  createDecisionDraftBinding,
  createEmptyHumanDecisionDraft,
  decisionSubmittability,
  derivePrimaryAction,
  humanDecisionDraftFreshness,
  humanDecisionDraftIntegrity,
  normalizeCanonicalRationale,
  primaryActionLabel,
  riskReferenceOptions,
  type DecisionBasisSnapshot,
  type HumanDecisionDraftRecord,
} from "../index";

type Test = { name: string; run: () => void | Promise<void> };
const tests: Test[] = [];
const test = (name: string, run: () => void | Promise<void>): void => { tests.push({ name, run }); };
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) throw new Error(`${message}: ${String(actual)} !== ${String(expected)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  equal(JSON.stringify(actual), JSON.stringify(expected), message);
}

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  writes: string[] = [];
  failDraftWrites = false;
  quotaDraftWrites = false;
  dropLedgerWrites = false;
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) {
    this.writes.push(key);
    if (key === HUMAN_DECISION_DRAFT_STORAGE_KEY && this.failDraftWrites) throw new Error("storage unavailable");
    if (key === HUMAN_DECISION_DRAFT_STORAGE_KEY && this.quotaDraftWrites) {
      const error = new Error("Quota exceeded");
      error.name = "QuotaExceededError";
      throw error;
    }
    if (key === HUMAN_DECISION_LEDGER_STORAGE_KEY && this.dropLedgerWrites) return;
    this.values.set(key, String(value));
  }
}

const fixture = buildFixtureSnapshot("default");
assert(fixture.status === "ready", "ready fixture required");
const fixtureCase = fixture.cases[0]!;

function context(
  reviewId: ReviewId,
  overrides: Partial<{ subject: string | null; caseId: string; runId: string | null; headSha: string | null }> = {},
): DecisionDraftContext {
  const subject = overrides.subject === undefined ? "subject-a" : overrides.subject;
  return {
    reviewId,
    decisionSubject: subject === null
      ? { status: "unavailable", reason: "subject unavailable" }
      : { status: "available", decisionSubjectId: decisionSubjectIdFromCapability(subject) },
    basis: {
      caseId: overrides.caseId ?? "case-a",
      runId: overrides.runId === undefined ? "run-a" : overrides.runId,
      headSha: overrides.headSha === undefined ? "head-a" : overrides.headSha,
    },
  };
}

function draftFor(
  reviewId: ReviewId,
  current = context(reviewId),
  overrides: Partial<HumanDecisionDraftRecord> = {},
): HumanDecisionDraftRecord {
  return {
    ...createEmptyHumanDecisionDraft(reviewId, current, null, "2026-08-13T10:00:00.000Z"),
    selectedOutcome: "tests-required",
    rationale: "Run the boundary suite before merge.",
    updatedAt: "2026-08-13T10:01:00.000Z",
    ...overrides,
  };
}

function envelope(drafts: Record<string, unknown>): string {
  return JSON.stringify({ schemaVersion: R6K_DRAFT_SCHEMA_VERSION, drafts });
}

function mutableCase(source: CaseDetail, decision = source.decision): CaseDetail {
  const effectiveEntryId = decision.status === "recorded" ? decision.effectiveEntryId ?? "entry-current" : null;
  return {
    ...source,
    decision,
    decisionMutation: {
      kind: "available",
      caseId: source.caseId,
      effectiveEntryId,
      effectiveOutcome: decision.status === "recorded" ? decision.outcome : null,
      currentHeadSha: source.run?.headSha ?? source.github.headSha,
      headRecorded: true,
      openBlockingRequirements: source.requirements.filter(
        (item) => item.importance === "blocking" && item.status === "open",
      ).length,
    },
  };
}

function contextForCase(reviewId: ReviewId, detail: CaseDetail): DecisionDraftContext {
  assert(detail.decisionMutation.kind === "available", "mutable case required");
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

function reportInput(title = "R6K validation report"): ReportInput {
  return {
    title,
    repository: "lintel/r6k-validation",
    technology: "TypeScript",
    diff: "diff --git a/src/r6k.ts b/src/r6k.ts\nindex 1111111..2222222 100644\n--- a/src/r6k.ts\n+++ b/src/r6k.ts\n@@ -1 +1 @@\n-export const state = 'old';\n+export const state = 'new';",
    inputSource: "github-pr",
    pullRequestNumber: 641,
  };
}

function seedReport(storage: Storage, title = "R6K validation report") {
  const input = reportInput(title);
  const report = generateReport(input);
  const canonicalRun = createCanonicalReviewRunManifest({
    input,
    report,
    analysisSource: "deterministic",
    runId: `run-${title.replace(/\W+/g, "-").toLowerCase()}`,
    pullRequestNumber: 641,
    baseSha: "base-r6k-validation",
    headSha: "head-r6k-validation",
  });
  addReportToHistory(storage, report, "deterministic", canonicalRun);
}

async function realDetail(storage: Storage): Promise<CaseDetail> {
  const snapshot = await createRealWorkspaceAdapter(storage).loadSnapshot({ scenario: "default", reportId: null });
  assert(snapshot.status === "ready" && snapshot.cases.length > 0, "real detail projects");
  return snapshot.cases[0]!;
}

test("1. draft write, read and update round-trip only the minimal R6K record", () => {
  const storage = new MemoryStorage();
  const reviewId = reviewIdFromOpaqueToken("draft-round-trip");
  const store = new HumanDecisionDraftStore(storage);
  const first = draftFor(reviewId);
  assert(store.write(reviewId, first).persisted, "initial write persists");
  deepEqual(store.read(reviewId), { status: "valid", draft: first }, "read returns exact draft");
  const updated = { ...first, rationale: "Updated rationale", updatedAt: "2026-08-13T10:02:00.000Z" };
  assert(store.write(reviewId, updated).persisted, "existing draft updates");
  const raw = JSON.parse(storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY)!) as { drafts: Record<string, object> };
  deepEqual(Object.keys(raw.drafts[reviewId]!).sort(), [
    "acceptedRiskReferenceIds", "binding", "rationale", "recordedEntryId", "schemaVersion", "selectedOutcome", "updatedAt",
  ], "record contains no derived or display state");
});

test("2. restart restoration and per-Review isolation preserve authored bytes", () => {
  const storage = new MemoryStorage();
  const a = reviewIdFromOpaqueToken("restart-a");
  const b = reviewIdFromOpaqueToken("restart-b");
  const draftA = draftFor(a);
  const draftB = draftFor(b, context(b), { rationale: "Review B rationale" });
  const firstSession = new HumanDecisionDraftStore(storage);
  firstSession.write(a, draftA);
  firstSession.write(b, draftB);
  const restarted = new HumanDecisionDraftStore(storage);
  deepEqual(restarted.read(a), { status: "valid", draft: draftA }, "A restores exactly");
  deepEqual(restarted.read(b), { status: "valid", draft: draftB }, "B restores exactly");
  assert(restarted.removeValid(a).removed, "A removes explicitly");
  equal(restarted.read(a).status, "absent", "A absent");
  deepEqual(restarted.read(b), { status: "valid", draft: draftB }, "B remains untouched");
});

test("3. case, run, head and decision-subject changes independently stale the draft", () => {
  const reviewId = reviewIdFromOpaqueToken("freshness-dimensions");
  const original = context(reviewId);
  const draft = draftFor(reviewId, original);
  equal(humanDecisionDraftFreshness(draft, original, null).stale, false, "unchanged basis fresh");
  for (const [label, changed] of [
    ["case", context(reviewId, { caseId: "case-b" })],
    ["run", context(reviewId, { runId: "run-b" })],
    ["head", context(reviewId, { headSha: "head-b" })],
    ["subject", context(reviewId, { subject: "subject-b" })],
  ] as const) assert(humanDecisionDraftFreshness(draft, changed, null).stale, `${label} change stale`);
});

test("4. recorded-entry change and indeterminate basis block submission and command construction", () => {
  const reviewId = reviewIdFromOpaqueToken("freshness-recorded");
  const original = context(reviewId);
  const draft = draftFor(reviewId, original);
  assert(humanDecisionDraftFreshness(draft, original, "entry-new").reasons.includes("recorded-decision-changed"), "recorded entry dimension stale");
  for (const unavailable of [context(reviewId, { runId: null }), context(reviewId, { headSha: null }), context(reviewId, { subject: null })]) {
    assert(humanDecisionDraftFreshness(draft, unavailable, null).stale, "indeterminate basis stale");
  }
  const detail = mutableCase(fixtureCase, { ...fixtureCase.decision, status: "empty" } as CaseDetail["decision"]);
  equal(buildHumanDecisionCommand(draft, detail, contextForCase(reviewId, detail)), null, "stale draft produces no command");
});

test("5. Reconcile preserves authored content, requires acknowledgement and refuses a moving basis", () => {
  const reviewId = reviewIdFromOpaqueToken("reconcile");
  const original = context(reviewId);
  const draft = draftFor(reviewId, original, { acceptedRiskReferenceIds: ["risk-a"] });
  const reviewed: DecisionBasisSnapshot = { context: context(reviewId, { runId: "run-b", headSha: "head-b" }), recordedEntryId: "entry-b" };
  assert(compareDecisionBasis(draft, reviewed).length === 3, "comparison lists run, head and recorded decision");
  deepEqual(draft.binding, createDecisionDraftBinding(reviewId, original, draft.binding.authoredAt), "viewing comparison does not rebind");
  const moved = acknowledgeDecisionDraftReconciliation(draft, reviewed, { ...reviewed, recordedEntryId: "entry-c" }, "2026-08-13T11:00:00.000Z");
  equal(moved.status, "moved-again", "movement during acknowledgement refused");
  const rebound = acknowledgeDecisionDraftReconciliation(draft, reviewed, reviewed, "2026-08-13T11:00:00.000Z");
  assert(rebound.status === "rebound", "explicit acknowledgement rebinds");
  equal(rebound.draft.selectedOutcome, draft.selectedOutcome, "outcome preserved");
  equal(rebound.draft.rationale, draft.rationale, "rationale preserved");
  deepEqual(rebound.draft.acceptedRiskReferenceIds, draft.acceptedRiskReferenceIds, "risk refs preserved");
});

test("6. explicit discard removes only the intended Review and failed discard never reports success", () => {
  const storage = new MemoryStorage();
  const a = reviewIdFromOpaqueToken("discard-a");
  const b = reviewIdFromOpaqueToken("discard-b");
  const store = new HumanDecisionDraftStore(storage);
  store.write(a, draftFor(a));
  store.write(b, draftFor(b));
  storage.failDraftWrites = true;
  equal(store.removeValid(a).removed, false, "failed durable removal not reported removed");
  equal(store.read(a).status, "valid", "failed removal retains A");
  storage.failDraftWrites = false;
  assert(store.removeValid(a).removed, "confirmed explicit discard succeeds");
  equal(store.read(a).status, "absent", "A removed");
  equal(store.read(b).status, "valid", "B remains");
});

test("7. only persisted clears automatically; unchanged and all canonical failures retain and retry truthfully", () => {
  for (const outcome of ["unchanged", "stale-command", "failed", "unavailable", "verification-mismatch"] as const) {
    equal(canonicalOutcomeClearsDraft(outcome), false, `${outcome} retains draft`);
  }
  equal(canonicalOutcomeClearsDraft("persisted"), true, "persisted clears automatically");
  equal(canonicalOutcomeAllowsRetry("failed"), true, "failed is retryable");
  for (const outcome of ["unavailable", "verification-mismatch", "stale-command", "unchanged"] as const) {
    equal(canonicalOutcomeAllowsRetry(outcome), false, `${outcome} has no meaningless retry`);
  }
});

test("8. record-level quarantine is opaque across other writes and implicit removal", () => {
  const storage = new MemoryStorage();
  const quarantined = reviewIdFromOpaqueToken("quarantine-record");
  const healthy = reviewIdFromOpaqueToken("quarantine-healthy");
  const opaque = { schemaVersion: 91, future: { exact: [1, 2, 3] } };
  storage.setItem(HUMAN_DECISION_DRAFT_STORAGE_KEY, envelope({ [quarantined]: opaque }));
  const store = new HumanDecisionDraftStore(storage);
  equal(store.read(quarantined).status, "quarantined", "record quarantined lazily");
  assert(store.write(healthy, draftFor(healthy)).persisted, "other Review persists");
  const after = JSON.parse(storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY)!) as { drafts: Record<string, unknown> };
  deepEqual(after.drafts[quarantined], opaque, "opaque record re-emitted unchanged");
  equal(store.write(quarantined, draftFor(quarantined)).persisted, false, "edit cannot assign quarantined slot");
  equal(store.removeValid(quarantined).removed, false, "canonical-success clear cannot remove quarantined slot");
});

test("9. Discard unreadable draft is the sole record-quarantine replacement path", () => {
  const storage = new MemoryStorage();
  const reviewId = reviewIdFromOpaqueToken("quarantine-replace");
  storage.setItem(HUMAN_DECISION_DRAFT_STORAGE_KEY, envelope({ [reviewId]: { bad: true } }));
  const store = new HumanDecisionDraftStore(storage);
  const draft = draftFor(reviewId);
  equal(store.write(reviewId, draft).persisted, false, "ordinary write refused");
  equal(store.removeValid(reviewId).removed, false, "ordinary removal refused");
  assert(store.replaceUnreadable(reviewId, draft).persisted, "explicit unreadable replacement persists");
  deepEqual(store.read(reviewId), { status: "valid", draft }, "slot becomes valid only after explicit replacement");
});

test("10. envelope quarantine performs zero draft-key writes for the session", () => {
  for (const malformed of ["{", "[]", JSON.stringify({ schemaVersion: 2, drafts: {} }), JSON.stringify({ schemaVersion: 1, drafts: [] })]) {
    const storage = new MemoryStorage();
    storage.values.set(HUMAN_DECISION_DRAFT_STORAGE_KEY, malformed);
    const before = storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY);
    const store = new HumanDecisionDraftStore(storage);
    const reviewId = reviewIdFromOpaqueToken(`envelope-${malformed.length}`);
    equal(store.storeDurability()?.category, "unavailable", "envelope unavailable");
    equal(store.write(reviewId, draftFor(reviewId)).persisted, false, "write refused");
    equal(store.removeValid(reviewId).removed, false, "remove refused");
    equal(store.replaceUnreadable(reviewId, draftFor(reviewId)).persisted, false, "repair refused");
    equal(storage.writes.filter((key) => key === HUMAN_DECISION_DRAFT_STORAGE_KEY).length, 0, "draft key never written");
    equal(storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY), before, "quarantined bytes untouched");
  }
});

test("11. the 65th slot is refused without eviction while an existing slot updates", () => {
  const storage = new MemoryStorage();
  const store = new HumanDecisionDraftStore(storage);
  for (let index = 0; index < MAX_HUMAN_DECISION_DRAFTS; index += 1) {
    const reviewId = reviewIdFromOpaqueToken(`capacity-${index}`);
    assert(store.write(reviewId, draftFor(reviewId)).persisted, `slot ${index + 1} persists`);
  }
  equal(store.occupiedSlots(), 64, "64 occupied slots");
  const before = JSON.parse(storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY)!) as { drafts: Record<string, unknown> };
  const bytesBefore = Object.fromEntries(Object.entries(before.drafts).map(([key, value]) => [key, JSON.stringify(value)]));
  const sixtyFifth = reviewIdFromOpaqueToken("capacity-64");
  const refused = store.write(sixtyFifth, draftFor(sixtyFifth));
  equal(refused.persisted, false, "65th refused");
  assert(refused.durability.category === "not-saved" && refused.durability.reason === "device-draft-limit-reached", "limit reason exact");
  const after = JSON.parse(storage.getItem(HUMAN_DECISION_DRAFT_STORAGE_KEY)!) as { drafts: Record<string, unknown> };
  deepEqual(Object.fromEntries(Object.entries(after.drafts).map(([key, value]) => [key, JSON.stringify(value)])), bytesBefore, "all 64 record bytes unchanged");
  const existing = reviewIdFromOpaqueToken("capacity-7");
  assert(store.write(existing, draftFor(existing, context(existing), { rationale: "Updated at capacity" })).persisted, "existing slot updates at capacity");
});

test("12. quota and unavailable writes never produce Draft saved", () => {
  for (const kind of ["quota", "unavailable"] as const) {
    const storage = new MemoryStorage();
    storage.quotaDraftWrites = kind === "quota";
    storage.failDraftWrites = kind === "unavailable";
    const reviewId = reviewIdFromOpaqueToken(`failure-${kind}`);
    const result = new HumanDecisionDraftStore(storage).write(reviewId, draftFor(reviewId));
    equal(result.persisted, false, `${kind} not persisted`);
    equal(result.durability.category, "not-saved", `${kind} not saved category`);
    assert(result.durability.category !== "saved", "Draft saved never follows persisted false");
  }
});

test("13. provider-style session cache survives failed A to B to A flushes", () => {
  const storage = new MemoryStorage();
  storage.failDraftWrites = true;
  const store = new HumanDecisionDraftStore(storage);
  const cache = new Map<ReviewId, HumanDecisionDraftRecord>();
  const a = reviewIdFromOpaqueToken("session-a");
  const b = reviewIdFromOpaqueToken("session-b");
  const authored = draftFor(a, context(a), { rationale: "The last keystroke remains here." });
  cache.set(a, authored);
  equal(store.write(a, authored).persisted, false, "A synchronous flush fails non-fatally");
  cache.set(b, draftFor(b));
  equal(cache.get(a), authored, "A remains identical after switching to B");
  equal(cache.get(a)?.rationale, "The last keystroke remains here.", "return to A restores exact content");
  assert(cache.get(a) !== cache.get(b), "cache remains isolated by ReviewId");
});

test("14. durability categories are exclusive and carry only reconciled vocabulary", () => {
  const available = new HumanDecisionDraftStore(new MemoryStorage());
  equal(available.storeDurability(), null, "healthy empty store has no false saved claim");
  const unreadableStorage = new MemoryStorage();
  unreadableStorage.values.set(HUMAN_DECISION_DRAFT_STORAGE_KEY, "{");
  const unavailable = new HumanDecisionDraftStore(unreadableStorage).storeDurability();
  assert(unavailable?.category === "unavailable" && unavailable.label === "Drafts unavailable on this device", "envelope category exact");
  const savedStorage = new MemoryStorage();
  const reviewId = reviewIdFromOpaqueToken("durability-saved");
  const saved = new HumanDecisionDraftStore(savedStorage).write(reviewId, draftFor(reviewId)).durability;
  equal(saved.category, "saved", "confirmed write saved only");
  const raw = JSON.stringify([unavailable, saved]);
  assert(raw.includes("Drafts unavailable on this device") && raw.includes("Draft saved"), "categories retain distinct labels");
});

test("15. exact outcome integrity, rationale authority and whitespace comparison are frozen", () => {
  deepEqual(DECISION_OUTCOMES, ["approve", "approve-with-accepted-risk", "tests-required", "review-required", "request-changes", "blocked", "defer"], "seven canonical outcomes exact");
  deepEqual(DEFAULT_DECISION_OUTCOMES, ["approve", "tests-required", "review-required", "request-changes", "blocked"], "default presentation grouping exact");
  deepEqual(MORE_DECISION_OUTCOMES, ["approve-with-accepted-risk", "defer"], "More outcomes presentation grouping exact");
  equal(new Set(DECISION_OUTCOMES).size, 7, "no duplicate outcome");
  for (const outcome of DECISION_OUTCOMES) assert(OUTCOME_LABEL[outcome] && OUTCOME_MEANING[outcome], `${outcome} uses canonical label and meaning`);
  equal(normalizeCanonicalRationale("  same\n\t rationale  "), "same rationale", "canonical whitespace normalized");
  equal(normalizeCanonicalRationale("x".repeat(701)).length, 700, "canonical comparison bound is 700");
  const reviewId = reviewIdFromOpaqueToken("rationale-integrity");
  equal(humanDecisionDraftIntegrity({ ...draftFor(reviewId), rationale: "x".repeat(701) }).status, "quarantined", "durable record refuses rationale over authority");
});

test("16. accepted risk requires current resolved references", () => {
  const reviewId = reviewIdFromOpaqueToken("accepted-risk");
  const detail = mutableCase(fixtureCase);
  const current = context(reviewId, { subject: detail.caseId, caseId: detail.caseId });
  const empty = draftFor(reviewId, current, {
    recordedEntryId: detail.decisionMutation.kind === "available" ? detail.decisionMutation.effectiveEntryId : null,
    selectedOutcome: "approve-with-accepted-risk",
    acceptedRiskReferenceIds: [],
  });
  equal(decisionSubmittability(empty, detail, current).submittable, false, "zero refs not submittable");
  const unresolved = { ...empty, acceptedRiskReferenceIds: ["missing-reference"] };
  equal(decisionSubmittability(unresolved, detail, current).submittable, false, "unresolved ref refused");
  const options = riskReferenceOptions(detail);
  if (options[0]) {
    const valid = { ...empty, acceptedRiskReferenceIds: [options[0].id] };
    const status = decisionSubmittability(valid, detail, current);
    assert(buildHumanDecisionCommand(valid, detail, current) !== null, `resolved ref constructs command: ${JSON.stringify(status)}`);
  }
});

test("17. primary labels route record, reaffirm and replace without typed confirmation", () => {
  const reviewId = reviewIdFromOpaqueToken("primary-routing");
  const emptyDetail = mutableCase(fixtureCase, { ...fixtureCase.decision, status: "empty" } as CaseDetail["decision"]);
  const emptyContext = contextForCase(reviewId, emptyDetail);
  const recordDraft = draftFor(reviewId, emptyContext);
  equal(derivePrimaryAction(recordDraft, emptyDetail), "record", "empty records");

  const recorded = fixture.cases.find((item) => item.decision.status === "recorded")?.decision;
  assert(recorded?.status === "recorded", "recorded fixture required");
  const predating: DecisionRecordedView = { ...recorded, applicability: "predates-current-head", effectiveEntryId: recorded.effectiveEntryId ?? "entry-primary" };
  const recordedDetail = mutableCase(fixtureCase, predating);
  const recordedContext = contextForCase(reviewId, recordedDetail);
  const reaffirmDraft = draftFor(reviewId, recordedContext, {
    recordedEntryId: predating.effectiveEntryId!,
    selectedOutcome: predating.outcome,
    rationale: predating.rationale ?? "",
  });
  equal(derivePrimaryAction(reaffirmDraft, recordedDetail), "reaffirm", "predating identical decision reaffirms");
  equal(derivePrimaryAction({ ...reaffirmDraft, rationale: `${reaffirmDraft.rationale} changed` }, recordedDetail), "replace", "authored difference replaces");
  deepEqual([primaryActionLabel("record"), primaryActionLabel("reaffirm"), primaryActionLabel("replace")], ["Record decision", "Reaffirm decision", "Replace decision"], "labels exact");
  const source = readFileSync(join(process.cwd(), "app", "(workstation)", "HumanDecisionComposer.tsx"), "utf8");
  assert(!/typed confirmation|type to confirm|confirm by typing/i.test(source), "no typed-confirm requirement");
});

test("18. overlay semantics bind exactly thirteen production actions while R6D stays four", () => {
  const state = createInitialWorkstationState();
  const actionContext = { reviewIndex: indexReviews(fixture.cases), cases: fixture.cases };
  const opened = dispatchAction(state, { id: "overlay/open", overlayId: "human-decision-composer" }, actionContext, { source: "visible-ui" });
  equal(opened.status, "applied", "overlay opens");
  equal(opened.state.overlayStack.length, 1, "one overlay entry");
  equal(dispatchAction(opened.state, { id: "overlay/open", overlayId: "human-decision-composer" }, actionContext, { source: "visible-ui" }).status, "noop", "redundant open noops");
  equal(dispatchAction(opened.state, { id: "overlay/close", overlayId: "other" }, actionContext, { source: "visible-ui" }).status, "unavailable", "non-top close refused");
  equal(dispatchAction(opened.state, { id: "overlay/close", overlayId: "human-decision-composer" }, actionContext, { source: "visible-ui" }).state.overlayStack.length, 0, "exact close pops");
  equal(WORKSTATION_BOUND_ACTION_IDS.length, 13, "production registry thirteen");
  assert(WORKSTATION_BOUND_ACTION_IDS.includes("overlay/open") && WORKSTATION_BOUND_ACTION_IDS.includes("overlay/close"), "overlay actions bound");
  for (const id of ["escape/unwind", "focus/set", "inspector/replace-context"] as const) assert(!WORKSTATION_BOUND_ACTION_IDS.includes(id as never), `${id} unbound`);
  equal(R6D_BOUND_ACTION_IDS.length, 4, "R6D bound count remains four");
});

test("19. WorkstationState and registry contain no draft-edit actions or content", () => {
  const stateSource = readFileSync(join(process.cwd(), "lib", "r6c", "state-model.ts"), "utf8");
  assert(!/HumanDecisionDraftRecord|acceptedRiskReferenceIds|selectedOutcome|rationale/.test(stateSource), "WorkstationState has no draft content");
  for (const forbidden of ["outcome/select", "rationale/edit", "draft/discard", "decision/submit", "decision/reconcile"]) {
    assert(!WORKSTATION_BOUND_ACTION_IDS.includes(forbidden as never), `${forbidden} absent from registry`);
  }
  const providerSource = readFileSync(join(process.cwd(), "app", "(workstation)", "WorkstationProvider.tsx"), "utf8");
  assert(providerSource.includes("useRef(new Map<ReviewId, HumanDecisionDraftRecord>())"), "provider owns per-Review session cache outside reducer");
  assert(providerSource.includes("draftCache.current.set(reviewId, draft)"), "cache updates synchronously before debounce");
});

test("20. composer structurally implements the C5 geometry and accessibility contract", () => {
  const component = readFileSync(join(process.cwd(), "app", "(workstation)", "HumanDecisionComposer.tsx"), "utf8");
  const css = readFileSync(join(process.cwd(), "app", "(workstation)", "human-decision.module.css"), "utf8");
  for (const token of ['role="dialog"', 'aria-modal="true"', 'role="radiogroup"', 'role="radio"', "aria-checked", "aria-live=\"polite\"", "role=\"alert\""]) assert(component.includes(token), `accessibility token present: ${token}`);
  for (const token of ["width: 480px", "top: 76px", "border-radius: 12px", "rgba(0, 0, 0, .4)", "#efefef", "#fefce8", "min-height: 64px", "gap: 12px", "150ms ease-out"]) assert(css.includes(token), `C5 token present: ${token}`);
  assert(component.includes("More outcomes") && component.includes("Currently recorded"), "disclosure and canonical context present");
  assert(component.includes("recordedMarker") && component.includes("recordedOutcome === outcome"), "Recorded marker remains canonical independent of selection");
  for (const forbidden of ["toast", "snackbar", "wizard", "outcome-colored", "dangerouslySetInnerHTML"]) assert(!component.toLowerCase().includes(forbidden.toLowerCase()), `avoidable divergence absent: ${forbidden}`);
});

test("21. canonical service enforces no-overwrite, verification and recommendation independence", async () => {
  const storage = new MemoryStorage();
  seedReport(storage, "canonical-service");
  const before = await realDetail(storage);
  assert(before.decisionMutation.kind === "available", "decision mutable");
  const recommendation = before.recommendation;
  const service = createWorkspaceDecisionService(storage);
  const command = {
    kind: "record" as const,
    caseId: before.decisionMutation.caseId,
    expectedHeadSha: before.decisionMutation.currentHeadSha,
    outcome: "tests-required" as const,
    rationale: "Run the canonical service boundary suite.",
    references: [],
    acceptedRiskReferences: [],
  };
  const persisted = service.recordDecision(command);
  equal(persisted.outcome, "persisted", "verified record persists");
  const ledgerAfter = storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY);
  const conflict = service.recordDecision({ ...command, outcome: "blocked", rationale: "A different blind overwrite." });
  equal(conflict.outcome, "stale-command", "conflicting record refused");
  equal(storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY), ledgerAfter, "conflict appends nothing");
  const after = await realDetail(storage);
  equal(after.recommendation, recommendation, "Lintel recommendation unchanged");
  assert(after.decision.status === "recorded" && after.decision.outcome === "tests-required", "Human Decision projects independently");
  assert(projectHumanDecision(after).statement !== RECOMMENDATION_LABEL[after.recommendation], "decision statement remains distinct from recommendation");

  const mismatchStorage = new MemoryStorage();
  seedReport(mismatchStorage, "verification-mismatch");
  const mismatchDetail = await realDetail(mismatchStorage);
  assert(mismatchDetail.decisionMutation.kind === "available", "mismatch case mutable");
  mismatchStorage.dropLedgerWrites = true;
  const mismatch = createWorkspaceDecisionService(mismatchStorage).recordDecision({
    ...command,
    caseId: mismatchDetail.decisionMutation.caseId,
    expectedHeadSha: mismatchDetail.decisionMutation.currentHeadSha,
  });
  equal(mismatch.outcome, "verification-mismatch", "read-back mismatch never success");
  equal(canonicalOutcomeAllowsRetry(mismatch.outcome), false, "mismatch not retryable");
});

test("22. identical logical command is idempotent and unresolved accepted risk is refused", async () => {
  const storage = new MemoryStorage();
  seedReport(storage, "idempotency");
  const detail = await realDetail(storage);
  assert(detail.decisionMutation.kind === "available", "case mutable");
  const service = createWorkspaceDecisionService(storage);
  const command = {
    kind: "record" as const,
    caseId: detail.decisionMutation.caseId,
    expectedHeadSha: detail.decisionMutation.currentHeadSha,
    outcome: "review-required" as const,
    rationale: "Specialist review remains required.",
    references: [],
    acceptedRiskReferences: [],
  };
  const first = service.recordDecision(command);
  assert(first.outcome === "persisted" && first.effectiveEntryId, "first command persists");
  const withdrawn = service.withdrawDecision({
    kind: "withdraw",
    caseId: command.caseId,
    expectedHeadSha: command.expectedHeadSha,
    expectedEffectiveEntryId: first.effectiveEntryId,
    rationale: "Withdraw only to exercise deterministic logical identity.",
  });
  equal(withdrawn.outcome, "persisted", "intervening audited withdrawal persists");
  const beforeRepeat = storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY);
  const repeated = service.recordDecision(command);
  equal(repeated.outcome, "unchanged", "identical logical command unchanged across time");
  equal(storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY), beforeRepeat, "unchanged appends nothing");

  const riskStorage = new MemoryStorage();
  seedReport(riskStorage, "unresolved-risk");
  const riskDetail = await realDetail(riskStorage);
  assert(riskDetail.decisionMutation.kind === "available", "risk case mutable");
  const refused = createWorkspaceDecisionService(riskStorage).recordDecision({
    kind: "record",
    caseId: riskDetail.decisionMutation.caseId,
    expectedHeadSha: riskDetail.decisionMutation.currentHeadSha,
    outcome: "approve-with-accepted-risk",
    rationale: "Accept only a named current residual risk.",
    references: [],
    acceptedRiskReferences: [{ id: "unresolved-risk-id", kind: "evidence" }],
  });
  equal(refused.outcome, "unavailable", "unresolved accepted-risk reference refused");
});

test("23. canonical submission remains available under all three draft durability categories", async () => {
  const scenarios = ["saved", "not-saved", "unavailable"] as const;
  for (const scenario of scenarios) {
    const storage = new MemoryStorage();
    seedReport(storage, `durability-${scenario}`);
    const detail = await realDetail(storage);
    assert(detail.decisionMutation.kind === "available", `${scenario} case mutable`);
    if (scenario === "unavailable") storage.values.set(HUMAN_DECISION_DRAFT_STORAGE_KEY, "{");
    if (scenario === "not-saved") storage.failDraftWrites = true;
    const reviewId = reviewIdFromOpaqueToken(`canonical-${scenario}`);
    const store = new HumanDecisionDraftStore(storage);
    if (scenario !== "unavailable") store.write(reviewId, draftFor(reviewId));
    const result = createWorkspaceDecisionService(storage).recordDecision({
      kind: "record",
      caseId: detail.decisionMutation.caseId,
      expectedHeadSha: detail.decisionMutation.currentHeadSha,
      outcome: "tests-required",
      rationale: `Canonical submit under ${scenario} draft durability.`,
      references: [],
      acceptedRiskReferences: [],
    });
    equal(result.outcome, "persisted", `canonical submission persists under ${scenario}`);
  }
});

test("24. source boundaries prohibit eviction, expiry, MAX_REVIEW_CONTEXTS and protected writer bypass", () => {
  const draftSource = readFileSync(join(process.cwd(), "lib", "r6k", "decision-draft.ts"), "utf8");
  const composerStateSource = readFileSync(join(process.cwd(), "lib", "r6k", "composer-state.ts"), "utf8");
  const providerSource = readFileSync(join(process.cwd(), "app", "(workstation)", "WorkstationProvider.tsx"), "utf8");
  assert(!draftSource.includes("MAX_REVIEW_CONTEXTS"), "R6K draft store never imports report-history capacity");
  for (const token of ["evict", "expire", "prune", "oldest updatedAt"]) assert(!draftSource.toLowerCase().includes(token.toLowerCase()), `no ${token} path`);
  equal((draftSource.match(/delete next\[reviewId\]/g) ?? []).length, 1, "one explicit durable removal implementation");
  assert(providerSource.includes("createWorkspaceDecisionService(browserStorage.current)"), "provider constructs the sole canonical service once from writable storage");
  assert(providerSource.includes("service.reaffirmDecision(command)"), "reaffirmation routes directly to reaffirmDecision");
  assert(!providerSource.includes("recommendationDivergence("), "ledger divergence stub is never called");
  assert(composerStateSource.includes("detail.decision.divergence") === false, "composer state does not derive a second recommendation relationship");
});

let passed = 0;
for (const item of tests) {
  try {
    await item.run();
    passed += 1;
  } catch (error) {
    process.stderr.write(`R6K validation failed: ${item.name}\n${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
    break;
  }
}
if (passed === tests.length) process.stdout.write(`R6K validation: ${passed}/${tests.length} grouped checks passed\n`);
