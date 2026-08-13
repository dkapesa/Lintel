import type { ApplicationAction } from "../r6c/actions";
import { R6D_BOUND_ACTION_IDS } from "../r6d/controller-contract";

/** The current production UI action boundary. R6D's historical boundary stays frozen. */
export const WORKSTATION_BOUND_ACTION_IDS = [
  ...R6D_BOUND_ACTION_IDS,
  "review/select",
  "mode/activate",
  "selection/set",
  "inspector/open",
  "inspector/close",
  "inspector/traverse-relationship",
  "history/set-comparison",
  "overlay/open",
  "overlay/close",
] as const satisfies readonly ApplicationAction["id"][];

export type WorkstationBoundActionId = (typeof WORKSTATION_BOUND_ACTION_IDS)[number];
export type WorkstationBoundAction = Extract<ApplicationAction, { id: WorkstationBoundActionId }>;

export function isWorkstationBoundAction(action: ApplicationAction): action is WorkstationBoundAction {
  return (WORKSTATION_BOUND_ACTION_IDS as readonly string[]).includes(action.id);
}
