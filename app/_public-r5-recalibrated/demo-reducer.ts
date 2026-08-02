/* R5E.1B — limited prototype state model.

   One explicit reducer for the recalibrated public prototype, matching the
   state shape and event set frozen in
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §4, wired for the
   subset this phase builds: "queue", "overview" and "finding". Stages
   "evidence" through "human-decision" remain part of the typed shape so
   R5E.1C can extend this reducer without rebuilding it, but no event in this
   file can reach them — see docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md §2
   ("Does not build").

   No event here writes to storage, network, or any surface outside the
   demonstration (invariant 7, contract §4d). The seven/five canonical values
   are never derived from `stage` and never change (invariant 1). */

import { CANONICAL_REVIEW, PRIMARY_FINDING } from "./canonical-review";

export type DemoStage =
  | "queue"
  | "overview"
  | "finding"
  | "evidence"
  | "missing-proof"
  | "requirement"
  | "affected-context"
  | "readiness"
  | "human-decision";

export type DemoMode = "guided" | "manual";

export type DecisionSurface = "closed" | "open";

export interface DemoState {
  stage: DemoStage;
  mode: DemoMode;
  decisionSurface: DecisionSurface;
  decisionSurfaceOrigin: "guided" | "manual" | null;
  activeRecordId: string | null;
  lastManualStage: DemoStage | null;
}

export type EventSource = "guided" | "manual";

export type DemoEvent =
  | { type: "SELECT_REVIEW"; source: EventSource }
  | { type: "SHOW_OVERVIEW"; source: EventSource }
  | { type: "FOCUS_FINDING"; source: EventSource; recordId: string }
  | { type: "RESET_DEMO" };

export const INITIAL_DEMO_STATE: DemoState = {
  stage: "queue",
  mode: "guided",
  decisionSurface: "closed",
  decisionSurfaceOrigin: null,
  activeRecordId: null,
  lastManualStage: null,
};

export function demoReducer(state: DemoState, event: DemoEvent): DemoState {
  switch (event.type) {
    case "SELECT_REVIEW":
      return {
        ...state,
        stage: "queue",
        mode: "manual",
        activeRecordId: CANONICAL_REVIEW.reviewKey,
        lastManualStage: "queue",
      };
    case "SHOW_OVERVIEW":
      return {
        ...state,
        stage: "overview",
        mode: "manual",
        activeRecordId: CANONICAL_REVIEW.reviewKey,
        lastManualStage: "overview",
      };
    case "FOCUS_FINDING":
      return {
        ...state,
        stage: "finding",
        mode: "manual",
        activeRecordId: event.recordId,
        lastManualStage: "finding",
      };
    case "RESET_DEMO":
      return INITIAL_DEMO_STATE;
    default:
      return state;
  }
}

export function focusPrimaryFindingEvent(source: EventSource): DemoEvent {
  return { type: "FOCUS_FINDING", source, recordId: PRIMARY_FINDING.recordKey };
}
