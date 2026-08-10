import type { CaseDetail, WorkspaceSnapshot } from "../workspace-v2/view-model";
import { resolveContext, type ContextRef } from "./context-identity";
import {
  decisionDraftContextFor,
  type DecisionDraftContextResult,
  type DecisionSubjectResolver,
} from "./human-decision-draft-boundary";
import {
  conservativeReviewIdentityProvider,
  indexReviews,
  resolveCurrentCase,
  type ReviewId,
  type ReviewIdentityProvider,
} from "./review-identity";
import {
  R6C_SCHEMA_VERSION,
  type ModeAnchor,
  type ReviewContextRecord,
  type WorkstationState,
} from "./state-model";

export type ReconciliationDiscardCode =
  | "selected-review-unavailable"
  | "primary-selection-unavailable"
  | "inspector-context-unavailable"
  | "relationship-context-unavailable"
  | "comparison-run-unavailable"
  | "mode-anchor-unavailable";

export type ReconciliationDiscard = Readonly<{
  code: ReconciliationDiscardCode;
  identity: string;
}>;

export type ReconciliationContext = Readonly<{
  capturedAt: string;
  decisionSubjectResolver: DecisionSubjectResolver;
  reviewIdentityProvider?: ReviewIdentityProvider;
}>;

export type ReconciliationResult = Readonly<{
  state: WorkstationState;
  discarded: readonly ReconciliationDiscard[];
  announcements: readonly string[];
  verificationAdvanced: boolean;
  decisionDraftContext: DecisionDraftContextResult;
  reviewContextWriteBack: ReviewContextRecord | null;
  discardReviewContext: ReviewId | null;
  authoritativeSnapshotAccepted: boolean;
}>;

function exactContext(caseDetail: CaseDetail, ref: ContextRef | null): ContextRef | null {
  if (!ref) return null;
  return resolveContext(caseDetail, ref).status === "resolved" ? ref : null;
}

function comparisonIds(caseDetail: CaseDetail): ReadonlySet<string> {
  const ids = new Set<string>();
  if (caseDetail.history?.status === "comparison") {
    ids.add(caseDetail.history.previous.runId);
    for (const comparison of caseDetail.history.comparisons ?? []) ids.add(comparison.target.runId);
  }
  return ids;
}

function consolidatedAnnouncement(
  advanced: boolean,
  previousCaseId: string | null,
  currentCaseId: string,
  discarded: readonly ReconciliationDiscard[],
): string[] {
  if (!advanced && discarded.length === 0) return [];
  const details: string[] = [];
  if (advanced) details.push(`verification advanced from ${previousCaseId ?? "an unknown Case"} to ${currentCaseId}`);
  if (discarded.length > 0) details.push(`${discarded.length} stale reference${discarded.length === 1 ? "" : "s"} discarded`);
  return [`Review refreshed: ${details.join("; ")}.`];
}

function writeBackFor(
  state: WorkstationState,
  reviewId: ReviewId,
  currentCase: CaseDetail,
  capturedAt: string,
): ReviewContextRecord {
  const inspectorContext = state.inspector.open ? state.inspector.context : null;
  return {
    schemaVersion: R6C_SCHEMA_VERSION,
    reviewId,
    mode: state.mode,
    primarySelection: state.primarySelection,
    inspector: { open: inspectorContext !== null, context: inspectorContext },
    comparisonRunId: state.comparisonRunId,
    lastKnownCaseId: currentCase.caseId,
    modeAnchors: { [state.mode]: state.modeAnchor },
    capturedAt,
  };
}

/** Rebuild identity and re-prove every semantic reference on canonical refresh. */
export function reconcile(
  state: WorkstationState,
  nextSnapshot: WorkspaceSnapshot,
  context: ReconciliationContext,
): ReconciliationResult {
  if (nextSnapshot.status === "loading" || nextSnapshot.status === "unavailable") {
    return {
      state,
      discarded: [],
      announcements: [],
      verificationAdvanced: false,
      decisionDraftContext: { status: "unavailable", reason: "authoritative-snapshot-unavailable" },
      reviewContextWriteBack: null,
      discardReviewContext: null,
      authoritativeSnapshotAccepted: false,
    };
  }

  const provider = context.reviewIdentityProvider ?? conservativeReviewIdentityProvider;
  const cases = nextSnapshot.status === "ready" ? nextSnapshot.cases : [];
  const index = indexReviews(cases, provider);
  if (state.selectedReview.status === "none") {
    return {
      state,
      discarded: [],
      announcements: [],
      verificationAdvanced: false,
      decisionDraftContext: { status: "unavailable", reason: "no-selected-review" },
      reviewContextWriteBack: null,
      discardReviewContext: null,
      authoritativeSnapshotAccepted: true,
    };
  }

  const reviewId = state.selectedReview.reviewId;
  const currentCase = resolveCurrentCase(index, reviewId, cases);
  if (!currentCase) {
    const discarded: ReconciliationDiscard[] = [
      { code: "selected-review-unavailable", identity: reviewId },
    ];
    const announcement = "The selected Review is unavailable in the current authoritative snapshot; no substitute was selected.";
    return {
      state: {
        ...state,
        selectedReview: { status: "unavailable", reviewId },
        primarySelection: null,
        inspector: {
          open: false,
          context: null,
          unavailableContext: null,
          relationshipTrail: [],
          focusOrigin: null,
        },
        comparisonRunId: null,
        lastKnownCaseId: null,
        modeAnchor: { kind: "top" },
        focus: { ...state.focus, origin: null },
        announcements: [announcement],
      },
      discarded,
      announcements: [announcement],
      verificationAdvanced: false,
      decisionDraftContext: { status: "unavailable", reason: "selected-review-unavailable" },
      reviewContextWriteBack: null,
      discardReviewContext: reviewId,
      authoritativeSnapshotAccepted: true,
    };
  }

  const previousCaseId = state.selectedReview.status === "available"
    ? state.selectedReview.currentCaseId
    : state.lastKnownCaseId;
  const verificationAdvanced = previousCaseId !== null && previousCaseId !== currentCase.caseId;
  const discarded: ReconciliationDiscard[] = [];

  const primarySelection = exactContext(currentCase, state.primarySelection);
  if (state.primarySelection && !primarySelection) {
    discarded.push({ code: "primary-selection-unavailable", identity: state.primarySelection.id });
  }

  const inspectorCandidate = state.inspector.context ?? state.inspector.unavailableContext;
  const inspectorContext = exactContext(currentCase, inspectorCandidate);
  let unavailableContext: ContextRef | null = null;
  if (state.inspector.open && inspectorCandidate && !inspectorContext) {
    unavailableContext = inspectorCandidate;
    discarded.push({ code: "inspector-context-unavailable", identity: inspectorCandidate.id });
  }

  const relationshipTrail: ContextRef[] = [];
  for (const ref of state.inspector.relationshipTrail) {
    if (resolveContext(currentCase, ref).status === "resolved") relationshipTrail.push(ref);
    else discarded.push({ code: "relationship-context-unavailable", identity: ref.id });
  }

  const comparisonRunId = state.comparisonRunId && comparisonIds(currentCase).has(state.comparisonRunId)
    ? state.comparisonRunId
    : null;
  if (state.comparisonRunId && !comparisonRunId) {
    discarded.push({ code: "comparison-run-unavailable", identity: state.comparisonRunId });
  }

  let modeAnchor: ModeAnchor = state.modeAnchor;
  if (
    state.modeAnchor.kind === "context" &&
    resolveContext(currentCase, state.modeAnchor.context).status !== "resolved"
  ) {
    discarded.push({ code: "mode-anchor-unavailable", identity: state.modeAnchor.context.id });
    const anchorContext = primarySelection ?? inspectorContext;
    modeAnchor = anchorContext ? { kind: "context", context: anchorContext } : { kind: "top" };
  }

  const announcements = consolidatedAnnouncement(
    verificationAdvanced,
    previousCaseId,
    currentCase.caseId,
    discarded,
  );
  const nextState: WorkstationState = {
    ...state,
    selectedReview: { status: "available", reviewId, currentCaseId: currentCase.caseId },
    primarySelection,
    inspector: {
      ...state.inspector,
      context: state.inspector.open ? inspectorContext : null,
      unavailableContext: state.inspector.open ? unavailableContext : null,
      relationshipTrail,
    },
    comparisonRunId,
    lastKnownCaseId: currentCase.caseId,
    modeAnchor,
    announcements,
  };

  return {
    state: nextState,
    discarded,
    announcements,
    verificationAdvanced,
    decisionDraftContext: {
      status: "available",
      context: decisionDraftContextFor(reviewId, currentCase, context.decisionSubjectResolver),
    },
    reviewContextWriteBack: writeBackFor(nextState, reviewId, currentCase, context.capturedAt),
    discardReviewContext: null,
    authoritativeSnapshotAccepted: true,
  };
}
