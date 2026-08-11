import type { ActionContext, ActionResult, ApplicationAction } from "../r6c/actions";
import { dispatchAction } from "../r6c/dispatch";
import type { RestorationResult } from "../r6c/restoration";
import type { ParsedRoute, RouteIntent } from "../r6c/route-contract";
import type { WorkspaceSnapshot } from "../workspace-v2/view-model";
import { narrowSurfaceForPathname } from "./first-paint";

export const R6D_BOUND_ACTION_IDS = [
  "route/navigate",
  "route/apply",
  "queue/set-manual-preference",
  "queue/show-narrow-surface",
] as const satisfies readonly ApplicationAction["id"][];

export type R6DBoundActionId = (typeof R6D_BOUND_ACTION_IDS)[number];

export function isR6DBoundAction(action: ApplicationAction): action is Extract<
  ApplicationAction,
  { id: R6DBoundActionId }
> {
  return (R6D_BOUND_ACTION_IDS as readonly string[]).includes(action.id);
}

export function isReviewBearingIntent(intent: RouteIntent): boolean {
  return intent.destination === "reviews" && intent.reviewId !== null;
}

export function shouldGateRouteIntent(
  intent: RouteIntent,
  authoritativeStatus: WorkspaceSnapshot["status"],
): boolean {
  return authoritativeStatus === "loading" && isReviewBearingIntent(intent);
}

export type PendingRouteGate = Readonly<{ pending: RouteIntent | null }>;

export function receiveRouteIntent(
  gate: PendingRouteGate,
  intent: RouteIntent,
  authoritativeStatus: WorkspaceSnapshot["status"],
): Readonly<{ gate: PendingRouteGate; apply: RouteIntent | null }> {
  if (shouldGateRouteIntent(intent, authoritativeStatus)) {
    return { gate: { pending: intent }, apply: null };
  }
  return { gate: { pending: null }, apply: intent };
}

export function releasePendingRouteIntent(
  gate: PendingRouteGate,
  authoritativeStatus: WorkspaceSnapshot["status"],
): Readonly<{ gate: PendingRouteGate; apply: RouteIntent | null }> {
  if (authoritativeStatus === "loading" || gate.pending === null) {
    return { gate, apply: null };
  }
  return { gate: { pending: null }, apply: gate.pending };
}

export function shouldApplyParsedPathname(
  parsed: ParsedRoute,
  currentRoutePath: string,
): parsed is Extract<ParsedRoute, { status: "valid" }> {
  return parsed.status === "valid" && parsed.canonicalPath !== currentRoutePath;
}

/**
 * Reconciles Narrow presentation from restoration's accepted route rather
 * than from the rejected browser pathname. This is deliberately expressed by
 * the existing presentation-only action, so it cannot add a history effect.
 */
export function reconcileRestoredNarrowPresentation(
  restoration: RestorationResult,
  context: ActionContext,
): ActionResult {
  return dispatchAction(
    restoration.state,
    {
      id: "queue/show-narrow-surface",
      surface: narrowSurfaceForPathname(restoration.state.routePath),
    },
    context,
    { source: "system" },
  );
}

export type SemanticRestorationGate = Readonly<{
  sealed: boolean;
  phaseBCalls: number;
  unavailableObserved: boolean;
}>;

export const INITIAL_SEMANTIC_RESTORATION_GATE: SemanticRestorationGate = {
  sealed: false,
  phaseBCalls: 0,
  unavailableObserved: false,
};

export function semanticRestorationStep(
  gate: SemanticRestorationGate,
  authoritativeStatus: WorkspaceSnapshot["status"],
): Readonly<{ gate: SemanticRestorationGate; restore: boolean }> {
  if (gate.sealed || authoritativeStatus === "loading") return { gate, restore: false };
  if (authoritativeStatus === "unavailable") {
    if (gate.unavailableObserved) return { gate, restore: false };
    return {
      restore: true,
      gate: {
        sealed: false,
        phaseBCalls: gate.phaseBCalls + 1,
        unavailableObserved: true,
      },
    };
  }
  return {
    restore: true,
    gate: {
      sealed: true,
      phaseBCalls: gate.phaseBCalls + 1,
      unavailableObserved: gate.unavailableObserved,
    },
  };
}
