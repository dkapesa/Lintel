/* R5E.1B/C — prototype state model.

   One explicit reducer for the recalibrated public prototype, matching the
   state shape and event set frozen in
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §4. R5E.1B wired
   "queue", "overview" and "finding" only, all sourced "manual". R5E.1C wires
   the full working stage set — "evidence" through "readiness" — and the
   guided/manual precedence rule (§4c, §6): guided events are discarded
   outright while mode is "manual"; manual events set mode to "manual" and
   record lastManualStage; RESUME_GUIDED restores guided mode.

   "human-decision" remains part of the typed stage shape so R5E.1D can
   extend this reducer without rebuilding it, but no event in this file can
   reach it — per docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md §3 ("Does not
   build": the Human Decision surface in either form).

   No event here writes to storage, network, or any surface outside the
   demonstration (invariant 7, contract §4d). The canonical values are never
   derived from `stage` and never change (invariant 1). */

import {
  CANONICAL_REVIEW,
  PRIMARY_FINDING,
  PRIMARY_EVIDENCE,
  MISSING_PROOF_RECORDS,
  BLOCKING_REQUIREMENT,
} from "./canonical-review";

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

/* Per docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §4b, EventSource
   is exactly "guided" | "manual". RESUME_GUIDED and RESET_DEMO carry no
   source field — they are always visitor-initiated. R5E.1C's own brief
   additionally names a third "system" origin; that is not part of the
   frozen R5E.1A contract and is not implemented here (see
   docs/r5/R5E1C_VERIFICATION_JOURNEY_PROTOTYPE.md "Event origin model" for
   the recorded resolution in favour of the frozen contract). */
export type EventSource = "guided" | "manual";

export type DemoEvent =
  | { type: "SELECT_REVIEW"; source: EventSource }
  | { type: "SHOW_OVERVIEW"; source: EventSource }
  | { type: "FOCUS_FINDING"; source: EventSource; recordId: string }
  | { type: "OPEN_EVIDENCE"; source: EventSource; recordId: string }
  | { type: "OPEN_MISSING_PROOF"; source: EventSource; recordId: string }
  | { type: "OPEN_REQUIREMENT"; source: EventSource; recordId: string }
  | { type: "OPEN_AFFECTED_CONTEXT"; source: EventSource }
  | { type: "SHOW_READINESS"; source: EventSource }
  | { type: "RESUME_GUIDED" }
  | { type: "RESET_DEMO" };

export const INITIAL_DEMO_STATE: DemoState = {
  stage: "queue",
  mode: "guided",
  decisionSurface: "closed",
  decisionSurfaceOrigin: null,
  activeRecordId: null,
  lastManualStage: null,
};

type StageEvent = Exclude<DemoEvent, { type: "RESUME_GUIDED" } | { type: "RESET_DEMO" }>;

function applyStageEvent(state: DemoState, event: StageEvent): DemoState {
  switch (event.type) {
    case "SELECT_REVIEW":
      return { ...state, stage: "queue", activeRecordId: CANONICAL_REVIEW.reviewKey };
    case "SHOW_OVERVIEW":
      return { ...state, stage: "overview", activeRecordId: CANONICAL_REVIEW.reviewKey };
    case "FOCUS_FINDING":
      return { ...state, stage: "finding", activeRecordId: event.recordId };
    case "OPEN_EVIDENCE":
      return { ...state, stage: "evidence", activeRecordId: event.recordId };
    case "OPEN_MISSING_PROOF":
      return { ...state, stage: "missing-proof", activeRecordId: event.recordId };
    case "OPEN_REQUIREMENT":
      return { ...state, stage: "requirement", activeRecordId: event.recordId };
    case "OPEN_AFFECTED_CONTEXT":
      return { ...state, stage: "affected-context", activeRecordId: null };
    case "SHOW_READINESS":
      return { ...state, stage: "readiness", activeRecordId: null };
    default:
      return state;
  }
}

/* docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §4c, two rules that
   apply to every stage-moving row:
     1. Manual events set `mode` to "manual" and record `lastManualStage`.
     2. Guided events are ignored entirely while `mode === "manual"`. They
        are not queued, not deferred, and not applied later. */
export function demoReducer(state: DemoState, event: DemoEvent): DemoState {
  if (event.type === "RESUME_GUIDED") {
    return { ...state, mode: "guided", lastManualStage: null };
  }

  if (event.type === "RESET_DEMO") {
    return INITIAL_DEMO_STATE;
  }

  if (event.source === "guided" && state.mode === "manual") {
    return state;
  }

  const next = applyStageEvent(state, event);

  if (event.source === "manual") {
    return { ...next, mode: "manual", lastManualStage: next.stage };
  }

  return next;
}

/* The seven working stages this phase builds interaction for, in the
   canonical investigation order
   (docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §5). "queue" is the
   PR-selection resting state reached via SELECT_REVIEW/RESET_DEMO, not a
   guided-scroll destination in its own right, so it is not part of this
   list. "human-decision" is out of scope for R5E.1C. */
export const WORKING_STAGE_ORDER = [
  "overview",
  "finding",
  "evidence",
  "missing-proof",
  "requirement",
  "affected-context",
  "readiness",
] as const;

export type WorkingStage = (typeof WORKING_STAGE_ORDER)[number];

/* Builds the correct typed event for a given working stage and origin, so
   the guided controller, the verification spine and the mobile
   previous/next control all dispatch identically shaped events for
   identical intent (docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md
   §6a.5: "Activation by keyboard and by pointer produce identical state").
   Record ids are the same canonical keys the state-to-surface mapping in
   §9 locks; none is invented. */
export function eventForWorkingStage(stage: WorkingStage, source: EventSource): DemoEvent {
  switch (stage) {
    case "overview":
      return { type: "SHOW_OVERVIEW", source };
    case "finding":
      return { type: "FOCUS_FINDING", source, recordId: PRIMARY_FINDING.recordKey };
    case "evidence":
      return { type: "OPEN_EVIDENCE", source, recordId: PRIMARY_EVIDENCE[0].recordKey };
    case "missing-proof":
      return { type: "OPEN_MISSING_PROOF", source, recordId: MISSING_PROOF_RECORDS[0].recordKey };
    case "requirement":
      return { type: "OPEN_REQUIREMENT", source, recordId: BLOCKING_REQUIREMENT.recordKey };
    case "affected-context":
      return { type: "OPEN_AFFECTED_CONTEXT", source };
    case "readiness":
      return { type: "SHOW_READINESS", source };
    default: {
      const _exhaustive: never = stage;
      return _exhaustive;
    }
  }
}

/* Maps a DemoStage back to its WorkingStage for controllers that observe
   `state.stage` (e.g. the spine's active-item highlight). Returns null for
   "queue" and "human-decision", which have no working-stage control. */
export function workingStageFor(stage: DemoStage): WorkingStage | null {
  return (WORKING_STAGE_ORDER as readonly string[]).includes(stage) ? (stage as WorkingStage) : null;
}
