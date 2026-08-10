import type { ContextRef } from "./context-identity";
import type { FocusOriginRecord } from "./focus";
import type { NarrowSurface, QueueManualPreference } from "./queue-layout";
import type { Destination, ReviewMode } from "./route-contract";
import type { CaseId, ReviewId } from "./review-identity";
import type { ReviewSelection, WorkstationState } from "./state-model";

export type WorkstationTransition =
  | { type: "route"; destination: Destination; routePath: string; selection: ReviewSelection; mode: ReviewMode }
  | { type: "review"; reviewId: ReviewId; currentCaseId: CaseId; routePath: string }
  | { type: "mode"; mode: ReviewMode; routePath: string }
  | { type: "selection"; context: ContextRef | null }
  | { type: "queue-user-preference"; preference: QueueManualPreference }
  | { type: "narrow-surface"; surface: NarrowSurface }
  | { type: "inspector-open"; context: ContextRef; origin: FocusOriginRecord | null }
  | { type: "inspector-replace"; context: ContextRef; addToTrail: boolean }
  | { type: "inspector-close" }
  | { type: "focus"; active: boolean }
  | { type: "overlay-open"; overlayId: string }
  | { type: "overlay-close" }
  | { type: "escape" };

function closedInspector(state: WorkstationState): WorkstationState["inspector"] {
  return {
    ...state.inspector,
    open: false,
    context: null,
    unavailableContext: null,
    relationshipTrail: [],
    focusOrigin: null,
  };
}

/** The sole pure transition owner for non-canonical workstation state. */
export function reduceWorkstationState(
  state: WorkstationState,
  transition: WorkstationTransition,
): WorkstationState {
  switch (transition.type) {
    case "route": {
      const previousReviewId = state.selectedReview.status === "none"
        ? null
        : state.selectedReview.reviewId;
      const nextReviewId = transition.selection.status === "none"
        ? null
        : transition.selection.reviewId;
      const reviewChanged = previousReviewId !== nextReviewId;
      return {
        ...state,
        destination: transition.destination,
        routePath: transition.routePath,
        selectedReview: transition.selection,
        mode: transition.mode,
        primarySelection: reviewChanged ? null : state.primarySelection,
        inspector: reviewChanged ? closedInspector(state) : state.inspector,
        comparisonRunId: reviewChanged ? null : state.comparisonRunId,
        lastKnownCaseId: transition.selection.status === "available"
          ? transition.selection.currentCaseId
          : null,
        modeAnchor: reviewChanged ? { kind: "top" } : state.modeAnchor,
        focus: reviewChanged ? { ...state.focus, origin: null } : state.focus,
      };
    }
    case "review":
      return {
        ...state,
        destination: "reviews",
        routePath: transition.routePath,
        selectedReview: {
          status: "available",
          reviewId: transition.reviewId,
          currentCaseId: transition.currentCaseId,
        },
        mode: "overview",
        primarySelection: null,
        inspector: closedInspector(state),
        comparisonRunId: null,
        lastKnownCaseId: transition.currentCaseId,
        modeAnchor: { kind: "top" },
        focus: { ...state.focus, origin: null },
      };
    case "mode":
      return { ...state, mode: transition.mode, routePath: transition.routePath };
    case "selection":
      return { ...state, primarySelection: transition.context };
    case "queue-user-preference":
      return { ...state, queue: { manualPreference: transition.preference } };
    case "narrow-surface":
      return { ...state, narrowSurface: transition.surface };
    case "inspector-open":
      return {
        ...state,
        inspector: {
          open: true,
          context: transition.context,
          unavailableContext: null,
          relationshipTrail: [],
          focusOrigin: transition.origin,
        },
      };
    case "inspector-replace": {
      const trail = transition.addToTrail && state.inspector.context
        ? [...state.inspector.relationshipTrail, state.inspector.context]
        : state.inspector.relationshipTrail;
      return {
        ...state,
        inspector: {
          ...state.inspector,
          context: transition.context,
          unavailableContext: null,
          relationshipTrail: trail,
        },
      };
    }
    case "inspector-close":
      return { ...state, inspector: closedInspector(state) };
    case "focus":
      return { ...state, focus: { ...state.focus, active: transition.active } };
    case "overlay-open":
      return { ...state, overlayStack: [...state.overlayStack, transition.overlayId] };
    case "overlay-close":
      return { ...state, overlayStack: state.overlayStack.slice(0, -1) };
    case "escape":
      if (state.overlayStack.length > 0) {
        return { ...state, overlayStack: state.overlayStack.slice(0, -1) };
      }
      if (state.inspector.open) return { ...state, inspector: closedInspector(state) };
      if (state.primarySelection) return { ...state, primarySelection: null };
      return state;
  }
}
