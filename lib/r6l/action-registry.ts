import type { ApplicationAction } from "../r6c/actions";
import { WORKSTATION_BOUND_ACTION_IDS } from "../r6e/action-registry";

/** R6L adds only Focus and canonical Escape activation to the frozen UI boundary. */
export const R6L_BOUND_ACTION_IDS = [
  ...WORKSTATION_BOUND_ACTION_IDS,
  "focus/set",
  "escape/unwind",
] as const satisfies readonly ApplicationAction["id"][];

export type R6LBoundActionId = (typeof R6L_BOUND_ACTION_IDS)[number];
export type R6LBoundAction = Extract<ApplicationAction, { id: R6LBoundActionId }>;

export function isR6LBoundAction(action: ApplicationAction): action is R6LBoundAction {
  return (R6L_BOUND_ACTION_IDS as readonly string[]).includes(action.id);
}
