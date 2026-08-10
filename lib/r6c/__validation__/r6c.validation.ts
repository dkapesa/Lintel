import { buildFixtureSnapshot } from "../../workspace-v2/fixture-adapter";
import type {
  CaseDetail,
  RunView,
  WorkspaceReadySnapshot,
  WorkspaceSnapshot,
} from "../../workspace-v2/view-model";
import * as publicR6c from "../index";
import {
  HUMAN_DECISION_DRAFT_STORAGE_KEY,
  decisionDraftApplicability,
  decisionDraftOwner,
  decisionSubjectIdFromCapability,
  draftBindingIntegrity,
  type DecisionDraftBinding,
  type DecisionDraftContext,
  type DecisionSubjectCapability,
} from "../human-decision-draft-boundary";
import {
  MAX_REVIEW_CONTEXTS,
  REVIEW_CONTEXT_STORAGE_KEY,
  WORKSTATION_UI_STORAGE_KEY,
  clearUiState,
  defaultWorkstationPersistence,
  readCollectionPreference,
  readReviewContext,
  readWorkstationPersistence,
  writeCollectionPreference,
  writeReviewContext,
  writeWorkstationPersistence,
  type StorageLike,
} from "../persistence";
import { effectiveQueue, type LayoutPolicy } from "../queue-layout";
import { reconcile } from "../reconciliation";
import { reduceWorkstationState } from "../reducer";
import { restoreInitialState } from "../restoration";
import {
  conservativeReviewIdentityProvider,
  indexReviews,
  reviewIdFromOpaqueToken,
  type ReviewId,
  type ReviewIdentityProvider,
} from "../review-identity";
import { formatRoute, parseRoute } from "../route-contract";
import {
  R6C_SCHEMA_VERSION,
  createInitialWorkstationState,
  type ReviewContextRecord,
  type WorkstationState,
} from "../state-model";
import { dispatchAction } from "../dispatch";
import { resolveFocusReturn } from "../focus";
import type { ContextRef } from "../context-identity";

type Test = { name: string; run: () => void };
const tests: Test[] = [];
function test(name: string, run: () => void): void { tests.push({ name, run }); }

function fail(message: string): never { throw new Error(message); }
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}
function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) fail(`${message}: expected ${String(expected)}, received ${String(actual)}`);
}
function deepEqual(actual: unknown, expected: unknown, message: string): void {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) fail(`${message}: expected ${right}, received ${left}`);
}

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  readonly reads: string[] = [];
  readonly writes: string[] = [];
  readonly removals: string[] = [];
  throwGet = false;
  throwSet = false;
  throwRemove = false;

  getItem(key: string): string | null {
    this.reads.push(key);
    if (this.throwGet) throw new Error("get unavailable");
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.writes.push(key);
    if (this.throwSet) throw new Error("set unavailable");
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.removals.push(key);
    if (this.throwRemove) throw new Error("remove unavailable");
    this.values.delete(key);
  }
}

const CAPTURED_AT = "2026-08-10T12:00:00.000Z";
const fixture = buildFixtureSnapshot("default");
assert(fixture.status === "ready", "fixture must be ready");
const fixtureReady: WorkspaceReadySnapshot = fixture;
const fixtureCase = fixtureReady.cases.find((item) => item.caseId === fixtureReady.defaultCaseId)
  ?? fixtureReady.cases[0];
assert(fixtureCase, "fixture case must exist");

const SUBJECT_A = decisionSubjectIdFromCapability("decision-subject-a");
const SUBJECT_B = decisionSubjectIdFromCapability("decision-subject-b");
const fixedSubject = (): DecisionSubjectCapability => ({ status: "available", decisionSubjectId: SUBJECT_A });

const layoutPolicy: LayoutPolicy<"wide" | "pressure" | "narrow"> = {
  isNarrow: (band) => band === "narrow",
  inspectorPresentation: (band) => band === "narrow" ? "sequential" : band === "pressure" ? "sheet" : "pane",
  shouldYieldQueue: ({ band, inspectorOpen }) => band === "pressure" && inspectorOpen,
};

function runView(
  runId: string,
  createdAt: string,
  sourceType: RunView["sourceType"] = "github-pr",
  headSha = `${runId}-head`,
): RunView {
  return {
    runId,
    headSha,
    baseSha: "base-sha",
    createdAt,
    completedAt: createdAt,
    analysisSource: "deterministic",
    sourceType,
    provider: null,
    model: null,
    reproducibility: "exact",
    reproducibilityLimitation: null,
    inputFingerprint: `${runId}-input`,
    configurationFingerprint: `${runId}-config`,
    resultFingerprint: `${runId}-result`,
    generatorVersion: "validation",
    deterministicRulesetVersion: "validation",
    reportSchemaVersion: "validation",
  };
}

function clonedCase(
  source: CaseDetail,
  options: Partial<{
    caseId: string;
    repository: string;
    pullRequestNumber: number;
    run: RunView | null;
    headSha: string | null;
  }> = {},
): CaseDetail {
  const clone = structuredClone(source) as CaseDetail;
  return {
    ...clone,
    caseId: options.caseId ?? clone.caseId,
    github: {
      ...clone.github,
      repository: options.repository ?? clone.github.repository,
      pullRequestNumber: options.pullRequestNumber ?? clone.github.pullRequestNumber,
      headSha: options.headSha === undefined ? clone.github.headSha : options.headSha,
    },
    run: options.run === undefined ? clone.run : options.run,
  };
}

function readyWith(cases: readonly CaseDetail[]): WorkspaceReadySnapshot {
  return { ...fixtureReady, cases: [...cases], defaultCaseId: cases[0]?.caseId ?? fixtureReady.defaultCaseId };
}

function contextRefFor(caseDetail: CaseDetail, kind: "evidence" | "finding" | "requirement" = "evidence"): ContextRef {
  if (kind === "evidence") {
    const item = caseDetail.evidence[0];
    assert(item, "fixture evidence required");
    return { kind, id: item.evidenceId };
  }
  if (kind === "finding") {
    const item = caseDetail.findings[0];
    assert(item, "fixture finding required");
    return { kind, id: item.findingId };
  }
  const item = caseDetail.requirements[0];
  assert(item, "fixture requirement required");
  return { kind, id: item.requirementId };
}

function recordFor(
  reviewId: ReviewId,
  overrides: Partial<ReviewContextRecord> = {},
): ReviewContextRecord {
  return {
    schemaVersion: R6C_SCHEMA_VERSION,
    reviewId,
    mode: "overview",
    primarySelection: null,
    inspector: { open: false, context: null },
    comparisonRunId: null,
    lastKnownCaseId: null,
    modeAnchors: {},
    capturedAt: CAPTURED_AT,
    ...overrides,
  };
}

function restore(
  pathname: string,
  snapshot: WorkspaceSnapshot,
  storage = new MemoryStorage(),
) {
  return restoreInitialState({
    pathname,
    storage,
    authoritativeSnapshot: snapshot,
    capturedAt: CAPTURED_AT,
    layout: { band: "wide" as const, policy: layoutPolicy },
    decisionSubjectResolver: fixedSubject,
  });
}

function selectedState(caseDetail: CaseDetail, reviewId: ReviewId): WorkstationState {
  const base = createInitialWorkstationState();
  return {
    ...base,
    routePath: formatRoute({ destination: "reviews", reviewId, mode: "overview" }),
    selectedReview: { status: "available", reviewId, currentCaseId: caseDetail.caseId },
    lastKnownCaseId: caseDetail.caseId,
  };
}

function actionContext(
  cases: readonly CaseDetail[],
  provider: ReviewIdentityProvider = conservativeReviewIdentityProvider,
) {
  return { reviewIndex: indexReviews(cases, provider), cases };
}

const fixtureReviewId = conservativeReviewIdentityProvider.reviewIdFor(fixtureCase);

test("A — first visit", () => {
  const storage = new MemoryStorage();
  writeReviewContext(storage, recordFor(fixtureReviewId, { mode: "history" }));
  const idle = restore("/reviews", fixtureReady, storage);
  equal(idle.state.selectedReview.status, "none", "bare Reviews remains idle");
  equal(idle.state.inspector.open, false, "bare Reviews keeps Inspector closed");
  equal(idle.state.routePath, "/reviews", "bare Reviews route remains unchanged");
  equal(idle.routeEffect.kind, "none", "bare Reviews does not replace to a Review route");

  const result = restore(formatRoute({ destination: "reviews", reviewId: fixtureReviewId, mode: null }), fixtureReady);
  equal(result.state.selectedReview.status, "available", "direct Review route still resolves");
  equal(result.state.mode, "overview", "first visit mode");
  equal(result.state.inspector.open, false, "first visit Inspector");
  equal(result.state.primarySelection, null, "first visit selection");
  equal(result.routeEffect.kind, "replace", "omitted mode canonicalises with replace");
});

test("B — valid revisit", () => {
  const storage = new MemoryStorage();
  const ref = contextRefFor(fixtureCase);
  const write = writeReviewContext(storage, recordFor(fixtureReviewId, {
    mode: "evidence",
    primarySelection: ref,
    inspector: { open: true, context: ref },
    lastKnownCaseId: fixtureCase.caseId,
  }));
  assert(write.persisted, "valid revisit record must persist");
  const result = restore(formatRoute({ destination: "reviews", reviewId: fixtureReviewId, mode: null }), fixtureReady, storage);
  equal(result.state.mode, "evidence", "stored mode restores");
  deepEqual(result.state.primarySelection, ref, "selection restores by identity");
  equal(result.state.inspector.open, true, "Inspector restores only with valid context");
});

test("C — invalid restored object is locally discarded", () => {
  const storage = new MemoryStorage();
  const validInspector = contextRefFor(fixtureCase, "requirement");
  writeReviewContext(storage, recordFor(fixtureReviewId, {
    mode: "evidence",
    primarySelection: { kind: "evidence", id: "missing-evidence" },
    inspector: { open: true, context: validInspector },
  }));
  const result = restore(formatRoute({ destination: "reviews", reviewId: fixtureReviewId, mode: null }), fixtureReady, storage);
  equal(result.state.mode, "evidence", "bad child does not discard mode");
  equal(result.state.primarySelection, null, "bad selection discarded");
  equal(result.state.inspector.open, true, "valid Inspector child survives");
});

test("D — Review A → B → A preserves scope and target restoration", () => {
  const [caseA, caseB] = fixtureReady.cases;
  assert(caseA && caseB, "two fixture cases required");
  const reviewA = conservativeReviewIdentityProvider.reviewIdFor(caseA);
  const reviewB = conservativeReviewIdentityProvider.reviewIdFor(caseB);
  let state = selectedState(caseA, reviewA);
  state = { ...state, inspector: { ...state.inspector, open: true, context: contextRefFor(caseA), unavailableContext: null } };
  const toB = dispatchAction(state, { id: "review/select", reviewId: reviewB }, actionContext([caseA, caseB]), { source: "visible-ui" });
  equal(toB.state.inspector.open, false, "switch clears Inspector scope");
  const toA = dispatchAction(toB.state, { id: "review/select", reviewId: reviewA }, actionContext([caseA, caseB]), { source: "visible-ui" });
  equal(toA.state.selectedReview.status, "available", "A is selected again");
  equal(toA.routeEffect.kind, "push", "Review selection is durable navigation");
});

test("E — same title with different id never rebinds", () => {
  const oldRef = contextRefFor(fixtureCase);
  const next = clonedCase(fixtureCase);
  const old = next.evidence[0];
  assert(old, "evidence required");
  next.evidence = [{ ...old, evidenceId: "replacement-id" }, ...next.evidence.slice(1)];
  const state = { ...selectedState(fixtureCase, fixtureReviewId), primarySelection: oldRef };
  const result = reconcile(state, readyWith([next]), { capturedAt: CAPTURED_AT, decisionSubjectResolver: fixedSubject });
  equal(result.state.primarySelection, null, "same title replacement is not selected");
});

const oldRun = runView("run-old", "2026-08-09T10:00:00.000Z", "github-pr", "head-old");
const newRun = runView("run-new", "2026-08-10T10:00:00.000Z", "github-pr", "head-new");
const oldVerification = clonedCase(fixtureCase, { caseId: "case-old", run: oldRun, headSha: oldRun.headSha });
const newVerification = clonedCase(fixtureCase, { caseId: "case-new", run: newRun, headSha: newRun.headSha });
const durableReviewId = reviewIdFromOpaqueToken("trusted-provider:shared-review");
const durableProvider: ReviewIdentityProvider = {
  reviewIdFor(caseDetail) {
    return caseDetail.caseId === oldVerification.caseId || caseDetail.caseId === newVerification.caseId
      ? durableReviewId
      : conservativeReviewIdentityProvider.reviewIdFor(caseDetail);
  },
};

test("F — same Review receives new verification while Inspector is open", () => {
  const injectedIndex = indexReviews([newVerification, oldVerification], durableProvider);
  equal(injectedIndex.byReviewId.size, 1, "injected provider intentionally groups one durable Review");
  equal(injectedIndex.byReviewId.get(durableReviewId)?.currentCaseId, newVerification.caseId, "injected provider advances to newer Case");
  const ref = contextRefFor(oldVerification);
  const state: WorkstationState = {
    ...selectedState(oldVerification, durableReviewId),
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: ref },
  };
  const result = reconcile(state, readyWith([newVerification, oldVerification]), {
    capturedAt: CAPTURED_AT,
    decisionSubjectResolver: fixedSubject,
    reviewIdentityProvider: durableProvider,
  });
  assert(result.state.selectedReview.status === "available", "Review remains selected");
  equal(result.state.selectedReview.currentCaseId, "case-new", "current Case advances");
  equal(result.state.inspector.open, true, "Inspector remains open");
  deepEqual(result.state.inspector.context, ref, "Inspector identity is re-proved");
  equal(result.state.routePath, state.routePath, "Review route identity does not change");
});

test("G — same Review new verification makes existing draft basis stale", () => {
  const binding: DecisionDraftBinding = {
    schemaVersion: 1,
    reviewId: durableReviewId,
    decisionSubject: SUBJECT_A,
    caseId: oldVerification.caseId,
    runId: oldRun.runId,
    headSha: oldRun.headSha,
    authoredAt: CAPTURED_AT,
  };
  const state = selectedState(oldVerification, durableReviewId);
  const refreshed = reconcile(state, readyWith([newVerification, oldVerification]), {
    capturedAt: CAPTURED_AT,
    decisionSubjectResolver: fixedSubject,
    reviewIdentityProvider: durableProvider,
  });
  assert(refreshed.decisionDraftContext.status === "available", "current draft context required");
  const applicability = decisionDraftApplicability(binding, refreshed.decisionDraftContext.context);
  equal(applicability.verdict, "stale-verification-basis", "basis change is stale");
  equal(applicability.blocksSubmission, true, "stale draft blocks submission");
  equal(decisionDraftOwner(binding), durableReviewId, "draft stays discoverable by ReviewId");
});

test("H — manual Compact → temporary yield → Compact", () => {
  const input = { band: "pressure" as const, policy: layoutPolicy, manualPreference: "compact" as const, focusActive: false, inspectorOpen: true, narrowSurface: "workspace" as const };
  equal(effectiveQueue(input).kind, "yielded-context", "Inspector pressure yields Queue");
  equal(effectiveQueue({ ...input, inspectorOpen: false }).kind, "compact", "manual Compact returns");
  equal(input.manualPreference, "compact", "derivation does not mutate preference");
});

test("I — manual Expanded → temporary adaptation → Expanded", () => {
  const input = { band: "wide" as const, policy: layoutPolicy, manualPreference: "expanded" as const, focusActive: true, inspectorOpen: false, narrowSurface: "workspace" as const };
  equal(effectiveQueue(input).kind, "hidden-focus", "Focus hides Queue");
  equal(effectiveQueue({ ...input, focusActive: false }).kind, "expanded", "Expanded returns");
});

test("J — Narrow sequential navigation state", () => {
  const input = { band: "narrow" as const, policy: layoutPolicy, manualPreference: "compact" as const, focusActive: true, inspectorOpen: true, narrowSurface: "queue" as const };
  equal(effectiveQueue(input).kind, "narrow-queue", "Narrow queue is a full sequential surface");
  equal(effectiveQueue({ ...input, narrowSurface: "workspace" }).kind, "hidden-narrow", "Workspace is independently primary");
});

test("K — Browser Back affects durable navigation only", () => {
  const context = actionContext([oldVerification], durableProvider);
  let state = selectedState(oldVerification, durableReviewId);
  const mode = dispatchAction(state, { id: "mode/activate", mode: "evidence" }, context, { source: "visible-ui" });
  equal(mode.routeEffect.kind, "push", "mode activation pushes");
  const ref = contextRefFor(oldVerification);
  const selection = dispatchAction(mode.state, { id: "selection/set", context: ref }, context, { source: "visible-ui" });
  equal(selection.routeEffect.kind, "none", "object selection has no history effect");
  const back = dispatchAction(selection.state, { id: "route/apply", intent: { destination: "reviews", reviewId: durableReviewId, mode: "overview" } }, context, { source: "browser" });
  equal(back.routeEffect.kind, "none", "popstate application does not add history");
  equal(back.state.mode, "overview", "Back changes durable mode");
});

test("L — relationship trail has no browser-history effect", () => {
  const context = actionContext([oldVerification], durableProvider);
  const first = contextRefFor(oldVerification, "evidence");
  const second = contextRefFor(oldVerification, "requirement");
  const opened = dispatchAction(selectedState(oldVerification, durableReviewId), { id: "inspector/open", context: first }, context, { source: "visible-ui" });
  const traversed = dispatchAction(opened.state, { id: "inspector/traverse-relationship", context: second }, context, { source: "visible-ui" });
  equal(traversed.routeEffect.kind, "none", "relationship traversal has no route effect");
  equal(traversed.state.inspector.relationshipTrail.length, 1, "trail remains in memory");
});

test("M — overlay survives canonical refresh", () => {
  const state = reduceWorkstationState(selectedState(oldVerification, durableReviewId), { type: "overlay-open", overlayId: "decision" });
  const result = reconcile(state, readyWith([newVerification, oldVerification]), {
    capturedAt: CAPTURED_AT,
    decisionSubjectResolver: fixedSubject,
    reviewIdentityProvider: durableProvider,
  });
  deepEqual(result.state.overlayStack, ["decision"], "overlay survives refresh");
});

test("N — Review disappearance differs from historical-run pruning", () => {
  const disappeared = reconcile(selectedState(oldVerification, durableReviewId), readyWith(fixtureReady.cases.filter((item) => item.caseId !== oldVerification.caseId)), {
    capturedAt: CAPTURED_AT,
    decisionSubjectResolver: fixedSubject,
    reviewIdentityProvider: durableProvider,
  });
  equal(disappeared.state.selectedReview.status, "unavailable", "missing Review is explicit");
  equal(disappeared.discardReviewContext, durableReviewId, "missing Review convenience is discarded");

  const state = { ...selectedState(newVerification, durableReviewId), comparisonRunId: "pruned-run" };
  const pruned = reconcile(state, readyWith([newVerification]), {
    capturedAt: CAPTURED_AT,
    decisionSubjectResolver: fixedSubject,
    reviewIdentityProvider: durableProvider,
  });
  equal(pruned.state.selectedReview.status, "available", "historical pruning keeps Review");
  equal(pruned.state.comparisonRunId, null, "only pruned comparison is discarded");
});

test("O — storage unavailable and write failure are truthful", () => {
  const storage = new MemoryStorage();
  storage.throwGet = true;
  equal(readWorkstationPersistence(storage).status, "unavailable", "getItem throw is unavailable");
  storage.throwGet = false;
  storage.throwSet = true;
  equal(writeWorkstationPersistence(storage, defaultWorkstationPersistence()).persisted, false, "setItem throw is not persisted");

  const retained = new MemoryStorage();
  writeReviewContext(retained, recordFor(fixtureReviewId, { mode: "history" }));
  const unavailableSnapshot = buildFixtureSnapshot("unavailable");
  const unresolved = restore(formatRoute({ destination: "reviews", reviewId: fixtureReviewId, mode: null }), unavailableSnapshot, retained);
  equal(unresolved.writeBack.discardReviewContext, null, "projection failure cannot prove Review disappearance");
  assert(readReviewContext(retained, fixtureReviewId).value !== null, "convenience survives projection failure");
});

test("P — corrupt convenience state fails locally", () => {
  const storage = new MemoryStorage();
  storage.values.set(WORKSTATION_UI_STORAGE_KEY, "{bad-json");
  equal(readWorkstationPersistence(storage).status, "invalid", "malformed JSON invalidates workstation only");
  storage.values.set(REVIEW_CONTEXT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, contexts: { slot: { ...recordFor(fixtureReviewId), reviewId: "different" } } }));
  const result = readReviewContext(storage, fixtureReviewId);
  equal(result.value, null, "mismatched record is rejected");
  assert(result.discarded.includes("review:slot"), "mismatch is reported");
});

test("Q — same action meaning across invocation sources", () => {
  const state = selectedState(oldVerification, durableReviewId);
  const context = actionContext([oldVerification], durableProvider);
  const action = { id: "mode/activate", mode: "evidence" } as const;
  const visible = dispatchAction(state, action, context, { source: "visible-ui" });
  const keyboard = dispatchAction(state, action, context, { source: "keyboard" });
  const commands = dispatchAction(state, action, context, { source: "commands" });
  deepEqual(visible, keyboard, "visible and keyboard results match");
  deepEqual(visible, commands, "visible and Commands results match");
});

test("R — missing focus origin uses registered fallback order", () => {
  const target = resolveFocusReturn(null, "queue", {
    isOriginRestorable: () => false,
    isRegionRegistered: (region) => region === "workspacePrimary" || region === "destinationMain",
  });
  deepEqual(target, { kind: "region", region: "workspacePrimary" }, "Workspace primary precedes destination main");
  const finalTarget = resolveFocusReturn(null, null, {
    isOriginRestorable: () => false,
    isRegionRegistered: (region) => region === "destinationMain",
  });
  deepEqual(finalTarget, { kind: "region", region: "destinationMain" }, "destination main is final fallback");
});

test("S — same Review changed DecisionSubjectId", () => {
  const binding: DecisionDraftBinding = {
    schemaVersion: 1,
    reviewId: durableReviewId,
    decisionSubject: SUBJECT_A,
    caseId: newVerification.caseId,
    runId: newRun.runId,
    headSha: newRun.headSha,
    authoredAt: CAPTURED_AT,
  };
  const current: DecisionDraftContext = {
    reviewId: durableReviewId,
    decisionSubject: { status: "available", decisionSubjectId: SUBJECT_B },
    basis: { caseId: newVerification.caseId, runId: newRun.runId, headSha: newRun.headSha },
  };
  equal(decisionDraftApplicability(binding, current).verdict, "changed-decision-subject", "subject change is distinct");
});

test("T — colliding DecisionSubjectIds remain isolated by ReviewId", () => {
  const reviewA = reviewIdFromOpaqueToken("review-a");
  const reviewB = reviewIdFromOpaqueToken("review-b");
  const make = (reviewId: ReviewId): DecisionDraftBinding => ({
    schemaVersion: 1, reviewId, decisionSubject: SUBJECT_A, caseId: "case", runId: "run", headSha: "head", authoredAt: CAPTURED_AT,
  });
  const slots = new Map<ReviewId, DecisionDraftBinding>([[reviewA, make(reviewA)], [reviewB, make(reviewB)]]);
  equal(slots.size, 2, "colliding subjects do not collide draft ownership");
  equal(decisionDraftOwner(slots.get(reviewA)!), reviewA, "owner remains Review A");
  equal(decisionDraftOwner(slots.get(reviewB)!), reviewB, "owner remains Review B");
});

test("I1/I5 — restored refs survive only exact resolution; never rebind", () => {
  const storage = new MemoryStorage();
  const refs: ContextRef[] = [
    { kind: "evidence", id: "absent" },
    { kind: "finding", id: "absent" },
    { kind: "requirement", id: "absent" },
    { kind: "change", id: "absent" },
  ];
  for (const ref of refs) {
    writeReviewContext(storage, recordFor(fixtureReviewId, { primarySelection: ref }));
    equal(restore(formatRoute({ destination: "reviews", reviewId: fixtureReviewId, mode: null }), fixtureReady, storage).state.primarySelection, null, `${ref.kind} must discard`);
  }
});

test("I2 — effectiveQueue never mutates manual preference", () => {
  for (const manualPreference of ["expanded", "compact"] as const) {
    for (const band of ["wide", "pressure", "narrow"] as const) {
      const input = { band, policy: layoutPolicy, manualPreference, focusActive: true, inspectorOpen: true, narrowSurface: "workspace" as const };
      effectiveQueue(input);
      equal(input.manualPreference, manualPreference, `${band}/${manualPreference} remains unchanged`);
    }
  }
});

test("I3 — invocation metadata cannot affect ActionResult", () => {
  const state = selectedState(oldVerification, durableReviewId);
  const context = actionContext([oldVerification], durableProvider);
  const sources = ["visible-ui", "keyboard", "commands", "system"] as const;
  const results = sources.map((source) => dispatchAction(state, { id: "focus/set", active: true }, context, { source }));
  for (const result of results.slice(1)) deepEqual(result, results[0], "source-independent action result");
});

test("I4 — only explicit user Queue preference transition changes manual preference", () => {
  const base = selectedState(oldVerification, durableReviewId);
  const transitions = [
    { type: "selection", context: contextRefFor(oldVerification) } as const,
    { type: "focus", active: true } as const,
    { type: "overlay-open", overlayId: "x" } as const,
    { type: "narrow-surface", surface: "queue" } as const,
    { type: "escape" } as const,
  ];
  for (const transition of transitions) {
    equal(reduceWorkstationState(base, transition).queue.manualPreference, "expanded", `${transition.type} cannot change preference`);
  }
  equal(reduceWorkstationState(base, { type: "queue-user-preference", preference: "compact" }).queue.manualPreference, "compact", "explicit preference action changes it");
});

test("I6 — Escape preserves route, Review, mode, Focus and Queue preference", () => {
  const ref = contextRefFor(oldVerification);
  const base: WorkstationState = {
    ...selectedState(oldVerification, durableReviewId),
    mode: "evidence",
    queue: { manualPreference: "compact" },
    focus: { active: true, origin: null },
    primarySelection: ref,
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: ref },
    overlayStack: ["one", "two"],
  };
  let state = base;
  const durable = { route: state.routePath, selection: state.selectedReview, mode: state.mode, queue: state.queue, focus: state.focus.active };
  for (let index = 0; index < 4; index += 1) {
    state = reduceWorkstationState(state, { type: "escape" });
    deepEqual({ route: state.routePath, selection: state.selectedReview, mode: state.mode, queue: state.queue, focus: state.focus.active }, durable, `Escape ${index + 1} preserves durable state`);
  }
  equal(state.overlayStack.length, 0, "two overlays unwind first");
  equal(state.inspector.open, false, "Inspector unwinds next");
  equal(state.primarySelection, null, "selection unwinds fourth");
});

test("I7/I8 — Review map scope matches and is addressed by ReviewId", () => {
  const storage = new MemoryStorage();
  const record = recordFor(fixtureReviewId, { lastKnownCaseId: fixtureCase.caseId });
  writeReviewContext(storage, record);
  const raw = storage.values.get(REVIEW_CONTEXT_STORAGE_KEY);
  assert(raw, "Review context envelope exists");
  const parsed = JSON.parse(raw) as { contexts: Record<string, ReviewContextRecord> };
  assert(parsed.contexts[fixtureReviewId], "ReviewId is the map key");
  assert(!parsed.contexts[fixtureCase.caseId], "CaseId is not the map key");

  storage.values.set(REVIEW_CONTEXT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, contexts: { [fixtureReviewId]: { ...record, reviewId: "wrong" } } }));
  equal(readReviewContext(storage, fixtureReviewId).value, null, "embedded mismatch rejects whole record");
});

test("I9 — advancement leaves no ref unique to superseded Case", () => {
  const oldOnly: ContextRef = { kind: "evidence", id: oldVerification.evidence[0]!.evidenceId };
  const next = clonedCase(newVerification);
  next.evidence = next.evidence.map((item, index) => index === 0 ? { ...item, evidenceId: "new-only-id" } : item);
  const state: WorkstationState = {
    ...selectedState(oldVerification, durableReviewId),
    primarySelection: oldOnly,
    inspector: { ...createInitialWorkstationState().inspector, open: true, context: oldOnly, relationshipTrail: [oldOnly] },
  };
  const result = reconcile(state, readyWith([next, oldVerification]), {
    capturedAt: CAPTURED_AT,
    decisionSubjectResolver: fixedSubject,
    reviewIdentityProvider: durableProvider,
  });
  equal(result.state.primarySelection, null, "old primary is gone");
  equal(result.state.inspector.context, null, "old Inspector context is not rebound");
  deepEqual(result.state.inspector.unavailableContext, oldOnly, "discarded Inspector identity is named");
  equal(result.state.inspector.relationshipTrail.length, 0, "old trail is pruned");
});

test("I10/I13 — unavailable proof blocks and verdict precedence is exhaustive", () => {
  const reviewId = reviewIdFromOpaqueToken("precedence-review");
  const subjectStates = ["match", "changed", "unavailable"] as const;
  const caseStates = ["match", "changed"] as const;
  const optionalStates = ["match", "changed", "unavailable"] as const;
  for (const subjectState of subjectStates) for (const caseState of caseStates) for (const runState of optionalStates) for (const headState of optionalStates) {
    const binding: DecisionDraftBinding = {
      schemaVersion: 1,
      reviewId,
      decisionSubject: subjectState === "unavailable" ? null : SUBJECT_A,
      caseId: "case-a",
      runId: runState === "unavailable" ? null : "run-a",
      headSha: headState === "unavailable" ? null : "head-a",
      authoredAt: CAPTURED_AT,
    };
    const current: DecisionDraftContext = {
      reviewId,
      decisionSubject: subjectState === "changed"
        ? { status: "available", decisionSubjectId: SUBJECT_B }
        : { status: "available", decisionSubjectId: SUBJECT_A },
      basis: {
        caseId: caseState === "changed" ? "case-b" : "case-a",
        runId: runState === "changed" ? "run-b" : runState === "unavailable" ? "run-a" : "run-a",
        headSha: headState === "changed" ? "head-b" : headState === "unavailable" ? "head-a" : "head-a",
      },
    };
    const result = decisionDraftApplicability(binding, current);
    const anyUnavailable = subjectState === "unavailable" || runState === "unavailable" || headState === "unavailable";
    const expected = anyUnavailable
      ? "indeterminate"
      : subjectState === "changed"
        ? "changed-decision-subject"
        : caseState === "changed" || runState === "changed" || headState === "changed"
          ? "stale-verification-basis"
          : "applicable";
    equal(result.verdict, expected, `precedence ${subjectState}/${caseState}/${runState}/${headState}`);
    if (anyUnavailable) assert(result.verdict !== "applicable" && result.blocksSubmission, "unavailable proof cannot apply");
  }
});

test("I11 — draft ownership type remains ReviewId under subject collision", () => {
  const a = reviewIdFromOpaqueToken("i11-a");
  const b = reviewIdFromOpaqueToken("i11-b");
  const bindings = [a, b].map((reviewId) => ({ schemaVersion: 1 as const, reviewId, decisionSubject: SUBJECT_A, caseId: "case", runId: "run", headSha: "head", authoredAt: CAPTURED_AT }));
  deepEqual(bindings.map(decisionDraftOwner), [a, b], "ownership ignores colliding DecisionSubjectId");
});

test("I12 — UI persistence cannot touch reserved draft namespace", () => {
  const storage = new MemoryStorage();
  const bytes = "{\"private\":\"byte-identical\"}";
  storage.values.set(HUMAN_DECISION_DRAFT_STORAGE_KEY, bytes);
  storage.values.set(WORKSTATION_UI_STORAGE_KEY, "ui");
  storage.values.set(REVIEW_CONTEXT_STORAGE_KEY, "context");
  const result = clearUiState(storage);
  equal(result.draftsPreserved, true, "clear reports draft preservation");
  equal(storage.values.get(HUMAN_DECISION_DRAFT_STORAGE_KEY), bytes, "draft bytes survive");
  assert(!storage.reads.includes(HUMAN_DECISION_DRAFT_STORAGE_KEY), "draft key is never read");
  assert(!storage.writes.includes(HUMAN_DECISION_DRAFT_STORAGE_KEY), "draft key is never written");
  assert(!storage.removals.includes(HUMAN_DECISION_DRAFT_STORAGE_KEY), "draft key is never cleared");
  assert(!("HUMAN_DECISION_DRAFT_STORAGE_KEY" in publicR6c), "generic barrel does not export draft key");
});

test("I14 — malformed draft binding quarantines without mutation", () => {
  const storage = new MemoryStorage();
  const raw = "{malformed-private-binding";
  storage.values.set(HUMAN_DECISION_DRAFT_STORAGE_KEY, raw);
  const result = draftBindingIntegrity({ schemaVersion: 999, reviewId: "", authoredAt: "bad" });
  equal(result.status, "quarantine", "malformed binding quarantines");
  equal(storage.values.get(HUMAN_DECISION_DRAFT_STORAGE_KEY), raw, "quarantine path does not mutate bytes");
  equal(storage.writes.length, 0, "no writer exists in integrity path");
  equal(storage.removals.length, 0, "no delete exists in integrity path");
});

test("Collection preference corruption and version boundaries stay local", () => {
  const storage = new MemoryStorage();
  assert(writeCollectionPreference(storage, "reviews", 1, { opaque: "later-r6e-schema" }, CAPTURED_AT).persisted, "collection preference writes");
  const valid = readCollectionPreference(storage, "reviews", 1, (value): value is { opaque: string } => typeof value === "object" && value !== null && (value as { opaque?: unknown }).opaque === "later-r6e-schema");
  equal(valid.status, "available", "opaque collection preference reads");
  equal(readCollectionPreference(storage, "reviews", 2, (_value): _value is unknown => true).status, "invalid", "wrong collection version is local");

  const current = JSON.parse(storage.values.get(WORKSTATION_UI_STORAGE_KEY)!) as { collections: Record<string, unknown> };
  current.collections.bad = { version: 1, capturedAt: "not-a-date", value: {} };
  storage.values.set(WORKSTATION_UI_STORAGE_KEY, JSON.stringify(current));
  const workstation = readWorkstationPersistence(storage);
  equal(workstation.status, "ok", "bad child does not invalidate workstation");
  assert(workstation.discarded.includes("collection:bad"), "bad collection slot is isolated");
});

test("Review-context map is deterministically bounded", () => {
  const storage = new MemoryStorage();
  const contexts: Record<string, ReviewContextRecord> = {};
  for (let index = 0; index < MAX_REVIEW_CONTEXTS + 3; index += 1) {
    const reviewId = reviewIdFromOpaqueToken(`bounded-${index}`);
    contexts[reviewId] = recordFor(reviewId, { capturedAt: new Date(Date.parse(CAPTURED_AT) + index).toISOString() });
  }
  storage.values.set(REVIEW_CONTEXT_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, contexts }));
  const newest = reviewIdFromOpaqueToken(`bounded-${MAX_REVIEW_CONTEXTS + 2}`);
  const result = readReviewContext(storage, newest);
  assert(result.value !== null, "newest deterministic context survives bound");
  equal(result.discarded.filter((item) => item.endsWith(":over-bound")).length, 3, "exact excess is evicted");
});

test("Production-shaped placeholder PR identities never merge by default", () => {
  const repository = "example/placeholder-number-regression";
  const caseA = clonedCase(fixtureCase, {
    caseId: "placeholder-pr-case-a",
    repository,
    pullRequestNumber: 1,
    run: runView("placeholder-run-a", "2026-08-09T00:00:00.000Z", "github-pr"),
  });
  const caseB = clonedCase(fixtureCase, {
    caseId: "placeholder-pr-case-b",
    repository,
    pullRequestNumber: 1,
    run: runView("placeholder-run-b", "2026-08-10T00:00:00.000Z", "github-pr"),
  });
  const reviewA = conservativeReviewIdentityProvider.reviewIdFor(caseA);
  const reviewB = conservativeReviewIdentityProvider.reviewIdFor(caseB);
  assert(reviewA !== reviewB, "same repository/placeholder PR/GitHub source remains separated");

  const indexed = indexReviews([caseB, caseA]);
  equal(indexed.byReviewId.size, 2, "default index contains two Reviews");
  equal(indexed.byReviewId.get(reviewA)?.currentCaseId, caseA.caseId, "Case A cannot replace Case B");
  equal(indexed.byReviewId.get(reviewB)?.currentCaseId, caseB.caseId, "Case B cannot replace Case A");

  const storage = new MemoryStorage();
  assert(writeReviewContext(storage, recordFor(reviewA, { mode: "evidence" })).persisted, "Review A context persists");
  assert(writeReviewContext(storage, recordFor(reviewB, { mode: "history" })).persisted, "Review B context persists");
  const raw = JSON.parse(storage.values.get(REVIEW_CONTEXT_STORAGE_KEY)!) as { contexts: Record<string, ReviewContextRecord> };
  equal(Object.keys(raw.contexts).length, 2, "placeholder Cases cannot share one persistence scope");
  equal(raw.contexts[reviewA]?.mode, "evidence", "Review A scope remains independent");
  equal(raw.contexts[reviewB]?.mode, "history", "Review B scope remains independent");
});

test("Review identity is conservative and chronology/fallback are deterministic", () => {
  const manualA = clonedCase(oldVerification, { caseId: "manual-a", run: runView("manual-a", "2026-08-10T00:00:00.000Z", "manual") });
  const manualB = clonedCase(oldVerification, { caseId: "manual-b", run: runView("manual-b", "2026-08-11T00:00:00.000Z", "manual") });
  assert(conservativeReviewIdentityProvider.reviewIdFor(manualA) !== conservativeReviewIdentityProvider.reviewIdFor(manualB), "untrusted source never merges");
  assert(conservativeReviewIdentityProvider.reviewIdFor(oldVerification) !== conservativeReviewIdentityProvider.reviewIdFor(newVerification), "GitHub-labelled source does not override singleton default");
  equal(indexReviews([oldVerification, newVerification]).byReviewId.size, 2, "default provider always separates Cases");
  const forcedReview = reviewIdFromOpaqueToken("forced-review");
  const forcedProvider: ReviewIdentityProvider = { reviewIdFor: () => forcedReview };
  equal(indexReviews([oldVerification, newVerification], forcedProvider).byReviewId.get(forcedReview)?.currentCaseId, newVerification.caseId, "injected durable provider uses run chronology");
  const noRunA = clonedCase(fixtureCase, { caseId: "first", run: null });
  const noRunB = clonedCase(fixtureCase, { caseId: "second", run: null });
  equal(indexReviews([noRunA, noRunB], forcedProvider).byReviewId.get(forcedReview)?.currentCaseId, "first", "first snapshot occurrence is fallback");
});

test("Route grammar percent-encodes ReviewId and explicit mode is authoritative", () => {
  const opaque = reviewIdFromOpaqueToken("opaque/with % delimiters");
  const path = formatRoute({ destination: "reviews", reviewId: opaque, mode: "evidence" });
  assert(path.includes("%2F") && path.includes("%25"), "opaque token is one encoded segment");
  const parsed = parseRoute(path);
  assert(parsed.status === "valid" && parsed.intent.destination === "reviews", "encoded route parses");
  equal(parsed.intent.reviewId, opaque, "token round trips without internal parsing");

  const storage = new MemoryStorage();
  writeReviewContext(storage, recordFor(fixtureReviewId, { mode: "history" }));
  const explicit = restore(formatRoute({ destination: "reviews", reviewId: fixtureReviewId, mode: "evidence" }), fixtureReady, storage);
  equal(explicit.state.mode, "evidence", "URL mode overrides stored mode");
  equal(explicit.routeEffect.kind, "none", "explicit canonical route needs no replacement");
});

let passed = 0;
for (const item of tests) {
  try {
    item.run();
    passed += 1;
    console.log(`PASS ${item.name}`);
  } catch (error) {
    console.error(`FAIL ${item.name}`);
    throw error;
  }
}
console.log(`R6C validation: ${passed}/${tests.length} passed`);
