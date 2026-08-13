import type { ContextRef } from "./context-identity";
import type { FocusOriginRecord } from "./focus";
import type { QueueManualPreference, NarrowSurface } from "./queue-layout";
import type { Destination, ReviewMode, RouteIntent, RouteEffect } from "./route-contract";
import type { ReviewId, ReviewIndex } from "./review-identity";
import type { WorkstationState } from "./state-model";
import type { CaseDetail } from "../workspace-v2/view-model";

export const ACTION_IDS = [
  "route/navigate",
  "route/apply",
  "review/select",
  "mode/activate",
  "selection/set",
  "queue/set-manual-preference",
  "queue/show-narrow-surface",
  "inspector/open",
  "inspector/replace-context",
  "inspector/traverse-relationship",
  "inspector/close",
  "focus/set",
  "overlay/open",
  "overlay/close",
  "escape/unwind",
  "history/set-comparison",
] as const;

export type ActionId = (typeof ACTION_IDS)[number];

export type ApplicationAction =
  | { id: "route/navigate"; destination: Destination }
  | { id: "route/apply"; intent: RouteIntent }
  | { id: "review/select"; reviewId: ReviewId }
  | { id: "mode/activate"; mode: ReviewMode }
  | { id: "selection/set"; context: ContextRef | null }
  | { id: "queue/set-manual-preference"; preference: QueueManualPreference }
  | { id: "queue/show-narrow-surface"; surface: NarrowSurface }
  | { id: "inspector/open"; context: ContextRef; origin?: FocusOriginRecord }
  | { id: "inspector/replace-context"; context: ContextRef }
  | { id: "inspector/traverse-relationship"; context: ContextRef }
  | { id: "inspector/close" }
  | { id: "focus/set"; active: boolean }
  | { id: "overlay/open"; overlayId: string }
  | { id: "overlay/close"; overlayId: string }
  | { id: "escape/unwind" }
  | { id: "history/set-comparison"; runId: string | null };

export type InvocationSource = "visible-ui" | "keyboard" | "commands" | "browser" | "system";
export type ActionInvocation = Readonly<{ source: InvocationSource }>;

export type ActionDefinition = Readonly<{
  id: ActionId;
  description: string;
  durableNavigation: boolean;
}>;

const DEFINITIONS: Record<ActionId, ActionDefinition> = {
  "route/navigate": { id: "route/navigate", description: "Navigate to an application destination", durableNavigation: true },
  "route/apply": { id: "route/apply", description: "Apply an existing browser route", durableNavigation: true },
  "review/select": { id: "review/select", description: "Select a durable Review", durableNavigation: true },
  "mode/activate": { id: "mode/activate", description: "Commit a selected Review mode", durableNavigation: true },
  "selection/set": { id: "selection/set", description: "Select or clear a Workspace object", durableNavigation: false },
  "queue/set-manual-preference": { id: "queue/set-manual-preference", description: "Set the engineer's Queue layout preference", durableNavigation: false },
  "queue/show-narrow-surface": { id: "queue/show-narrow-surface", description: "Choose the current Narrow sequential surface", durableNavigation: false },
  "inspector/open": { id: "inspector/open", description: "Explicitly open the Inspector for an exact context", durableNavigation: false },
  "inspector/replace-context": { id: "inspector/replace-context", description: "Replace the context in the existing Inspector", durableNavigation: false },
  "inspector/traverse-relationship": { id: "inspector/traverse-relationship", description: "Traverse one exact relationship in local Inspector history", durableNavigation: false },
  "inspector/close": { id: "inspector/close", description: "Close the Inspector", durableNavigation: false },
  "focus/set": { id: "focus/set", description: "Enter or leave persistent Workspace Focus", durableNavigation: false },
  "overlay/open": { id: "overlay/open", description: "Open one transient overlay", durableNavigation: false },
  "overlay/close": { id: "overlay/close", description: "Close the exact top transient overlay", durableNavigation: false },
  "escape/unwind": { id: "escape/unwind", description: "Unwind one applicable transient layer", durableNavigation: false },
  "history/set-comparison": { id: "history/set-comparison", description: "Select a stored analysis for comparison", durableNavigation: false },
};

export function actionDefinition(actionId: ActionId): ActionDefinition {
  return DEFINITIONS[actionId];
}

export type ActionContext = Readonly<{
  reviewIndex: ReviewIndex;
  cases: readonly CaseDetail[];
}>;

export type ActionAvailability =
  | { available: true }
  | { available: false; reason: string };

export type FocusEffect =
  | { kind: "none" }
  | { kind: "region"; region: "workspacePrimary" | "inspector" | "destinationMain" }
  | { kind: "return-from-inspector" };

export type ActionResult = Readonly<{
  status: "applied" | "noop" | "unavailable";
  state: WorkstationState;
  routeEffect: RouteEffect;
  focusEffect: FocusEffect;
  announcement?: string;
  unavailableReason?: string;
}>;
