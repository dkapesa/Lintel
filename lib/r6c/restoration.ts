import type { CaseDetail, WorkspaceSnapshot } from "../workspace-v2/view-model";
import { resolveContext, type ContextRef } from "./context-identity";
import {
  decisionDraftContextFor,
  type DecisionDraftContextResult,
  type DecisionSubjectResolver,
} from "./human-decision-draft-boundary";
import {
  readReviewContext,
  readWorkstationPersistence,
  type PersistenceRead,
  type StorageLike,
  type WorkstationPersistence,
} from "./persistence";
import { effectiveLayout, type EffectiveLayout, type LayoutPolicy } from "./queue-layout";
import { formatRoute, parseRoute, type RouteEffect, type ReviewMode } from "./route-contract";
import {
  conservativeReviewIdentityProvider,
  indexReviews,
  resolveCurrentCase,
  type ReviewId,
  type ReviewIdentityProvider,
} from "./review-identity";
import {
  R6C_SCHEMA_VERSION,
  createInitialWorkstationState,
  type ModeAnchor,
  type ReviewContextRecord,
  type WorkstationState,
} from "./state-model";

export type RestorationDiscardCode =
  | "invalid-route"
  | "workstation-state-invalid"
  | "review-context-invalid"
  | "stored-review-unavailable"
  | "selected-review-unavailable"
  | "primary-selection-unavailable"
  | "inspector-context-unavailable"
  | "comparison-run-unavailable"
  | "mode-anchor-unavailable";

export type RestorationDiscard = Readonly<{
  code: RestorationDiscardCode;
  identity?: string;
}>;

export type RestorationWriteBack = Readonly<{
  workstation: WorkstationPersistence;
  reviewContext: ReviewContextRecord | null;
  discardReviewContext: ReviewId | null;
}>;

export type RestorationResult = Readonly<{
  state: WorkstationState;
  routeEffect: RouteEffect;
  discarded: readonly RestorationDiscard[];
  announcements: readonly string[];
  verificationAdvanced: boolean;
  effectiveLayout: EffectiveLayout;
  decisionDraftContext: DecisionDraftContextResult;
  writeBack: RestorationWriteBack;
  authoritativeStatus: WorkspaceSnapshot["status"];
}>;

export type RestorationInput<Band extends string> = Readonly<{
  pathname: string;
  storage: StorageLike;
  authoritativeSnapshot: WorkspaceSnapshot;
  capturedAt: string;
  layout: Readonly<{ band: Band; policy: LayoutPolicy<Band> }>;
  decisionSubjectResolver: DecisionSubjectResolver;
  reviewIdentityProvider?: ReviewIdentityProvider;
}>;

function casesFrom(snapshot: WorkspaceSnapshot): readonly CaseDetail[] {
  return snapshot.status === "ready" ? snapshot.cases : [];
}

function validContext(caseDetail: CaseDetail, ref: ContextRef | null): ContextRef | null {
  if (!ref) return null;
  return resolveContext(caseDetail, ref).status === "resolved" ? ref : null;
}

function availableComparisonRunIds(caseDetail: CaseDetail): ReadonlySet<string> {
  const result = new Set<string>();
  const history = caseDetail.history;
  if (history?.status === "comparison") {
    result.add(history.previous.runId);
    for (const comparison of history.comparisons ?? []) result.add(comparison.target.runId);
  }
  return result;
}

function semanticDefaultAnchor(
  primarySelection: ContextRef | null,
  inspectorContext: ContextRef | null,
): ModeAnchor {
  const context = primarySelection ?? inspectorContext;
  return context ? { kind: "context", context } : { kind: "top" };
}

function restoredAnchor(
  record: ReviewContextRecord | null,
  mode: ReviewMode,
  caseDetail: CaseDetail,
  primarySelection: ContextRef | null,
  inspectorContext: ContextRef | null,
  discarded: RestorationDiscard[],
): ModeAnchor {
  const candidate = record?.modeAnchors[mode];
  if (!candidate) return semanticDefaultAnchor(primarySelection, inspectorContext);
  if (candidate.kind === "top") return candidate;
  if (resolveContext(caseDetail, candidate.context).status === "resolved") return candidate;
  discarded.push({ code: "mode-anchor-unavailable", identity: candidate.context.id });
  return semanticDefaultAnchor(primarySelection, inspectorContext);
}

function persistenceDiscard(
  result: PersistenceRead<unknown>,
  code: "workstation-state-invalid" | "review-context-invalid",
  discarded: RestorationDiscard[],
): void {
  if (result.status === "invalid" || result.status === "unavailable") {
    discarded.push({ code, identity: result.reason });
  }
  for (const child of result.discarded) discarded.push({ code, identity: child });
}

function announcementFor(advanced: boolean, discarded: readonly RestorationDiscard[]): string[] {
  if (!advanced && discarded.length === 0) return [];
  const parts: string[] = [];
  if (advanced) parts.push("The current verification advanced");
  if (discarded.length > 0) parts.push(`${discarded.length} stale convenience reference${discarded.length === 1 ? " was" : "s were"} discarded`);
  return [`${parts.join("; ")}.`];
}

/**
 * Deterministic R0–R9 restoration. Semantic references are not resolved until
 * after the freshly supplied snapshot has been accepted and indexed.
 */
export function restoreInitialState<Band extends string>(input: RestorationInput<Band>): RestorationResult {
  // R0 and R1 contain syntax/structure only; neither asserts semantic meaning.
  const parsed = parseRoute(input.pathname);
  const workstationRead = readWorkstationPersistence(input.storage);
  const discarded: RestorationDiscard[] = [];
  persistenceDiscard(workstationRead, "workstation-state-invalid", discarded);
  if (parsed.status === "invalid") discarded.push({ code: "invalid-route", identity: parsed.reason });

  const stateBase = createInitialWorkstationState(workstationRead.value.devicePreferences);
  const provider = input.reviewIdentityProvider ?? conservativeReviewIdentityProvider;
  const cases = casesFrom(input.authoritativeSnapshot); // R2
  const index = indexReviews(cases, provider); // R3
  const routeIntent = parsed.status === "valid"
    ? parsed.intent
    : ({ destination: "reviews", reviewId: null, mode: null } as const);

  if (routeIntent.destination !== "reviews") {
    const path = formatRoute(routeIntent);
    const state: WorkstationState = { ...stateBase, destination: routeIntent.destination, routePath: path };
    return {
      state,
      routeEffect: parsed.status === "invalid" || parsed.canonicalPath !== path
        ? { kind: "replace", path }
        : { kind: "none" },
      discarded,
      announcements: announcementFor(false, discarded),
      verificationAdvanced: false,
      effectiveLayout: effectiveLayout({
        ...input.layout,
        manualPreference: state.queue.manualPreference,
        focusActive: state.focus.active,
        inspectorOpen: state.inspector.open,
        narrowSurface: state.narrowSurface,
      }),
      decisionDraftContext: { status: "unavailable", reason: "no-selected-review" },
      writeBack: {
        workstation: workstationRead.value,
        reviewContext: null,
        discardReviewContext: null,
      },
      authoritativeStatus: input.authoritativeSnapshot.status,
    };
  }

  // A loading/projection-failure snapshot cannot prove that any Review is
  // absent. Preserve an explicit route token, but do not consume or destroy
  // Review-scoped convenience state until authoritative data is available.
  if (
    input.authoritativeSnapshot.status === "loading" ||
    input.authoritativeSnapshot.status === "unavailable"
  ) {
    const explicitReviewId = routeIntent.reviewId;
    const routePath = formatRoute(routeIntent);
    const state: WorkstationState = {
      ...stateBase,
      routePath,
      selectedReview: explicitReviewId
        ? { status: "unavailable", reviewId: explicitReviewId }
        : { status: "none" },
      mode: routeIntent.mode ?? "overview",
    };
    return {
      state,
      routeEffect: parsed.status === "invalid" || parsed.canonicalPath !== routePath
        ? { kind: "replace", path: routePath }
        : { kind: "none" },
      discarded,
      announcements: [],
      verificationAdvanced: false,
      effectiveLayout: effectiveLayout({
        ...input.layout,
        manualPreference: state.queue.manualPreference,
        focusActive: state.focus.active,
        inspectorOpen: false,
        narrowSurface: state.narrowSurface,
      }),
      decisionDraftContext: { status: "unavailable", reason: "authoritative-snapshot-unavailable" },
      writeBack: {
        workstation: workstationRead.value,
        reviewContext: null,
        discardReviewContext: null,
      },
      authoritativeStatus: input.authoritativeSnapshot.status,
    };
  }

  const requestedReviewId = routeIntent.reviewId;
  if (!requestedReviewId) {
    const state: WorkstationState = { ...stateBase, routePath: "/reviews" };
    return {
      state,
      routeEffect: parsed.status === "invalid" || parsed.canonicalPath !== "/reviews"
        ? { kind: "replace", path: "/reviews" }
        : { kind: "none" },
      discarded,
      announcements: announcementFor(false, discarded),
      verificationAdvanced: false,
      effectiveLayout: effectiveLayout({
        ...input.layout,
        manualPreference: state.queue.manualPreference,
        focusActive: state.focus.active,
        inspectorOpen: state.inspector.open,
        narrowSurface: state.narrowSurface,
      }),
      decisionDraftContext: { status: "unavailable", reason: "no-selected-review" },
      writeBack: { workstation: workstationRead.value, reviewContext: null, discardReviewContext: null },
      authoritativeStatus: input.authoritativeSnapshot.status,
    };
  }

  const currentCase = resolveCurrentCase(index, requestedReviewId, cases);
  if (!currentCase) {
    discarded.push({
      code: routeIntent.reviewId ? "selected-review-unavailable" : "stored-review-unavailable",
      identity: requestedReviewId,
    });
    const mode = routeIntent.mode ?? "overview";
    const routePath = formatRoute({ destination: "reviews", reviewId: requestedReviewId, mode: routeIntent.mode });
    const state: WorkstationState = {
      ...stateBase,
      routePath,
      selectedReview: { status: "unavailable", reviewId: requestedReviewId },
      mode,
    };
    return {
      state,
      routeEffect: parsed.status === "invalid" || parsed.canonicalPath !== routePath
        ? { kind: "replace", path: routePath }
        : { kind: "none" },
      discarded,
      announcements: announcementFor(false, discarded),
      verificationAdvanced: false,
      effectiveLayout: effectiveLayout({
        ...input.layout,
        manualPreference: state.queue.manualPreference,
        focusActive: state.focus.active,
        inspectorOpen: false,
        narrowSurface: state.narrowSurface,
      }),
      decisionDraftContext: { status: "unavailable", reason: "selected-review-unavailable" },
      writeBack: {
        workstation: workstationRead.value,
        reviewContext: null,
        discardReviewContext: requestedReviewId,
      },
      authoritativeStatus: input.authoritativeSnapshot.status,
    };
  }

  const contextRead = readReviewContext(input.storage, requestedReviewId);
  persistenceDiscard(contextRead, "review-context-invalid", discarded);
  const stored = contextRead.value;

  // R4: explicit URL mode has precedence over a structurally valid record.
  const mode = routeIntent.mode ?? stored?.mode ?? "overview";

  // R5: every child reference is independently re-proved against current data.
  const primarySelection = validContext(currentCase, stored?.primarySelection ?? null);
  if (stored?.primarySelection && !primarySelection) {
    discarded.push({ code: "primary-selection-unavailable", identity: stored.primarySelection.id });
  }
  const inspectorContext = validContext(currentCase, stored?.inspector.context ?? null);
  if (stored?.inspector.context && !inspectorContext) {
    discarded.push({ code: "inspector-context-unavailable", identity: stored.inspector.context.id });
  }
  const inspectorOpen = stored?.inspector.open === true && inspectorContext !== null;
  const comparisons = availableComparisonRunIds(currentCase);
  const comparisonRunId = stored?.comparisonRunId && comparisons.has(stored.comparisonRunId)
    ? stored.comparisonRunId
    : null;
  if (stored?.comparisonRunId && !comparisonRunId) {
    discarded.push({ code: "comparison-run-unavailable", identity: stored.comparisonRunId });
  }

  // R5b: metadata detects advancement but never resolves or pins identity.
  const verificationAdvanced = stored?.lastKnownCaseId !== null &&
    stored?.lastKnownCaseId !== undefined &&
    stored.lastKnownCaseId !== currentCase.caseId;
  const modeAnchor = restoredAnchor(
    stored,
    mode,
    currentCase,
    primarySelection,
    inspectorContext,
    discarded,
  );
  const routePath = formatRoute({ destination: "reviews", reviewId: requestedReviewId, mode });
  const state: WorkstationState = {
    ...stateBase,
    routePath,
    selectedReview: { status: "available", reviewId: requestedReviewId, currentCaseId: currentCase.caseId },
    mode,
    primarySelection,
    inspector: {
      ...stateBase.inspector,
      open: inspectorOpen,
      context: inspectorOpen ? inspectorContext : null,
    },
    comparisonRunId,
    lastKnownCaseId: currentCase.caseId,
    modeAnchor,
  };
  const reviewContext: ReviewContextRecord = {
    schemaVersion: R6C_SCHEMA_VERSION,
    reviewId: requestedReviewId,
    mode,
    primarySelection,
    inspector: { open: inspectorOpen, context: inspectorOpen ? inspectorContext : null },
    comparisonRunId,
    lastKnownCaseId: currentCase.caseId,
    modeAnchors: { ...(stored?.modeAnchors ?? {}), [mode]: modeAnchor },
    capturedAt: input.capturedAt,
  };
  const announcements = announcementFor(verificationAdvanced, discarded);

  return {
    state: { ...state, announcements },
    routeEffect: parsed.status === "invalid" || parsed.canonicalPath !== routePath
      ? { kind: "replace", path: routePath }
      : { kind: "none" },
    discarded,
    announcements,
    verificationAdvanced,
    effectiveLayout: effectiveLayout({
      ...input.layout,
      manualPreference: state.queue.manualPreference,
      focusActive: state.focus.active,
      inspectorOpen: state.inspector.open,
      narrowSurface: state.narrowSurface,
    }),
    decisionDraftContext: {
      status: "available",
      context: decisionDraftContextFor(requestedReviewId, currentCase, input.decisionSubjectResolver),
    },
    writeBack: {
      workstation: workstationRead.value,
      reviewContext,
      discardReviewContext: null,
    },
    authoritativeStatus: input.authoritativeSnapshot.status,
  };
}
