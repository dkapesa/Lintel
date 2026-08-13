import {
  type ActionContext,
  type ActionAvailability,
  type ActionInvocation,
  type ActionResult,
  type ApplicationAction,
  type FocusEffect,
} from "./actions";
import { contextRefEqual, resolveContext } from "./context-identity";
import { reduceWorkstationState, type WorkstationTransition } from "./reducer";
import { formatRoute, type ReviewMode, type RouteEffect } from "./route-contract";
import { resolveCurrentCase } from "./review-identity";
import type { ReviewSelection, WorkstationState } from "./state-model";

function unavailable(state: WorkstationState, reason: string): ActionResult {
  return {
    status: "unavailable",
    state,
    routeEffect: { kind: "none" },
    focusEffect: { kind: "none" },
    unavailableReason: reason,
  };
}

function noop(state: WorkstationState): ActionResult {
  return {
    status: "noop",
    state,
    routeEffect: { kind: "none" },
    focusEffect: { kind: "none" },
  };
}

function resultFor(
  previous: WorkstationState,
  transition: WorkstationTransition,
  routeEffect: RouteEffect = { kind: "none" },
  focusEffect: FocusEffect = { kind: "none" },
): ActionResult {
  const state = reduceWorkstationState(previous, transition);
  return {
    status: state === previous ? "noop" : "applied",
    state,
    routeEffect: state === previous ? { kind: "none" } : routeEffect,
    focusEffect: state === previous ? { kind: "none" } : focusEffect,
  };
}

function currentCase(state: WorkstationState, context: ActionContext) {
  return state.selectedReview.status === "available"
    ? resolveCurrentCase(context.reviewIndex, state.selectedReview.reviewId, context.cases)
    : null;
}

/** Invocation metadata is intentionally ignored: an ActionId has one meaning. */
export function dispatchAction(
  state: WorkstationState,
  action: ApplicationAction,
  context: ActionContext,
  _invocation: ActionInvocation,
): ActionResult {
  if (action.id === "route/navigate") {
    const intent = action.destination === "reviews"
      ? ({ destination: "reviews", reviewId: null, mode: null } as const)
      : ({ destination: action.destination, reviewId: null, mode: null } as const);
    const path = formatRoute(intent);
    if (state.routePath === path) return noop(state);
    return resultFor(
      state,
      { type: "route", destination: action.destination, routePath: path, selection: { status: "none" }, mode: "overview" },
      { kind: "push", path },
      { kind: "region", region: "destinationMain" },
    );
  }

  if (action.id === "route/apply") {
    const path = formatRoute(action.intent);
    let selection: ReviewSelection = { status: "none" };
    let mode: ReviewMode = "overview";
    if (action.intent.destination === "reviews" && action.intent.reviewId) {
      const resolved = resolveCurrentCase(context.reviewIndex, action.intent.reviewId, context.cases);
      selection = resolved
        ? { status: "available", reviewId: action.intent.reviewId, currentCaseId: resolved.caseId }
        : { status: "unavailable", reviewId: action.intent.reviewId };
      mode = action.intent.mode ?? "overview";
    }
    return resultFor(
      state,
      { type: "route", destination: action.intent.destination, routePath: path, selection, mode },
      { kind: "none" },
      { kind: "region", region: action.intent.destination === "reviews" ? "workspacePrimary" : "destinationMain" },
    );
  }

  if (action.id === "review/select") {
    const target = resolveCurrentCase(context.reviewIndex, action.reviewId, context.cases);
    if (!target) return unavailable(state, "The requested Review is not present in current authoritative data.");
    if (state.selectedReview.status === "available" && state.selectedReview.reviewId === action.reviewId) {
      return noop(state);
    }
    const path = formatRoute({ destination: "reviews", reviewId: action.reviewId, mode: "overview" });
    return resultFor(
      state,
      { type: "review", reviewId: action.reviewId, currentCaseId: target.caseId, routePath: path },
      { kind: "push", path },
      { kind: "region", region: "workspacePrimary" },
    );
  }

  if (action.id === "mode/activate") {
    if (state.selectedReview.status !== "available") {
      return unavailable(state, "A Review mode cannot be activated without an available selected Review.");
    }
    if (state.mode === action.mode) return noop(state);
    const path = formatRoute({
      destination: "reviews",
      reviewId: state.selectedReview.reviewId,
      mode: action.mode,
    });
    return resultFor(
      state,
      { type: "mode", mode: action.mode, routePath: path },
      { kind: "push", path },
      { kind: "region", region: "workspacePrimary" },
    );
  }

  if (action.id === "selection/set") {
    if (action.context === null) {
      if (state.primarySelection === null) return noop(state);
      return resultFor(state, { type: "selection", context: null });
    }
    const selectedCase = currentCase(state, context);
    if (!selectedCase || resolveContext(selectedCase, action.context).status !== "resolved") {
      return unavailable(state, "The requested object no longer exists in the current Case.");
    }
    if (contextRefEqual(state.primarySelection, action.context)) return noop(state);
    return resultFor(state, { type: "selection", context: action.context });
  }

  if (action.id === "queue/set-manual-preference") {
    if (state.queue.manualPreference === action.preference) return noop(state);
    return resultFor(state, { type: "queue-user-preference", preference: action.preference });
  }

  if (action.id === "queue/show-narrow-surface") {
    if (state.narrowSurface === action.surface) return noop(state);
    return resultFor(state, { type: "narrow-surface", surface: action.surface });
  }

  if (action.id === "inspector/open" || action.id === "inspector/replace-context" || action.id === "inspector/traverse-relationship") {
    const selectedCase = currentCase(state, context);
    if (!selectedCase || resolveContext(selectedCase, action.context).status !== "resolved") {
      return unavailable(state, "The requested Inspector context is stale or unavailable in the current Case.");
    }
    if (action.id !== "inspector/open" && !state.inspector.open) {
      return unavailable(state, "The Inspector is not open.");
    }
    if (state.inspector.open && contextRefEqual(state.inspector.context, action.context)) {
      return noop(state);
    }
    if (action.id === "inspector/open") {
      return resultFor(
        state,
        { type: "inspector-open", context: action.context, origin: action.origin ?? null },
        { kind: "none" },
        { kind: "region", region: "inspector" },
      );
    }
    return resultFor(state, {
      type: "inspector-replace",
      context: action.context,
      addToTrail: action.id === "inspector/traverse-relationship",
    });
  }

  if (action.id === "inspector/close") {
    if (!state.inspector.open) return noop(state);
    return resultFor(state, { type: "inspector-close" }, { kind: "none" }, { kind: "return-from-inspector" });
  }

  if (action.id === "focus/set") {
    if (state.focus.active === action.active) return noop(state);
    return resultFor(state, { type: "focus", active: action.active });
  }

  if (action.id === "overlay/open") {
    if (action.overlayId.length === 0) return unavailable(state, "Overlay identity must not be empty.");
    if (state.overlayStack.at(-1) === action.overlayId) return noop(state);
    return resultFor(state, { type: "overlay-open", overlayId: action.overlayId });
  }

  if (action.id === "overlay/close") {
    if (state.overlayStack.at(-1) !== action.overlayId) {
      return unavailable(state, "The requested overlay is not the current top transient layer.");
    }
    return resultFor(state, { type: "overlay-close" });
  }

  if (action.id === "history/set-comparison") {
    const selectedCase = currentCase(state, context);
    const available = new Set<string>();
    if (selectedCase?.history?.status === "comparison") {
      available.add(selectedCase.history.previous.runId);
      for (const comparison of selectedCase.history.comparisons ?? []) available.add(comparison.target.runId);
    }
    if (action.runId !== null && !available.has(action.runId)) {
      return unavailable(state, "The requested comparison analysis is no longer available.");
    }
    if (state.comparisonRunId === action.runId) return noop(state);
    return resultFor(state, { type: "comparison", runId: action.runId });
  }

  const hadOverlay = state.overlayStack.length > 0;
  const hadInspector = state.inspector.open;
  const result = resultFor(
    state,
    { type: "escape" },
    { kind: "none" },
    !hadOverlay && hadInspector ? { kind: "return-from-inspector" } : { kind: "none" },
  );
  return result;
}

/** Pure preflight for controls/menus/Commands; execution re-runs the same proof. */
export function actionAvailability(
  state: WorkstationState,
  action: ApplicationAction,
  context: ActionContext,
): ActionAvailability {
  const result = dispatchAction(state, action, context, { source: "system" });
  return result.status === "unavailable"
    ? { available: false, reason: result.unavailableReason ?? "Action is unavailable." }
    : { available: true };
}
