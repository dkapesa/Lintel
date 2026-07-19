/* R0B.2B — Workspace V2 recorded Human Decision · sample fixtures.

   Every decision here is SAMPLE data (contract §17.12). Nothing is a real
   engineer decision, nothing is persisted, and no production ledger is read.
   Timestamps are fixed, obviously-sample absolute strings so they never read
   as live activity.

   Two things live here:
     1. Twelve named sample decision states, each individually loadable so the
        lab can demonstrate all twelve required states (contract goal §"IMPL").
     2. A per-case seed mapping the four queue cases to a natural starting
        state. Case #482 seeds to the empty state (A) to match the approved
        visual baseline exactly.

   Scenario builders take a small context derived from the active case so a
   loaded state stays coherent with the case on screen; divergence-focused
   states additionally pin their own recommendation so the divergence axis is
   deterministic regardless of which case is open. */

import type { Recommendation } from "./fixtures";
import {
  eventIdFromFingerprint,
  identityFingerprint,
  type DecisionActor,
  type DecisionHistoryEvent,
  type DecisionOutcome,
  type DecisionRecord,
  type DecisionReference,
} from "./decision-model";

/* --- Sample actors ---------------------------------------------------- */

const REVIEWER: DecisionActor = {
  displayLabel: "Dana Ortiz",
  source: "local",
  role: "Accountable engineer",
};

const IMPORTED_REVIEWER: DecisionActor = {
  displayLabel: "J. Ba (imported)",
  source: "imported",
  role: "Engineer",
};

/* --- Sample references ------------------------------------------------ */

const refIdempotency: DecisionReference = {
  id: "req_test_idempotency",
  kind: "clause",
  label: "Idempotency proven under retry",
  available: true,
};

const refProviderFailure: DecisionReference = {
  id: "req_test_provider_failure",
  kind: "clause",
  label: "Provider failure states covered",
  available: true,
};

const refRetryEvidence: DecisionReference = {
  id: "ev_retry_path",
  kind: "evidence",
  label: "Retry path observed in redemption service",
  available: true,
};

const refStaleLoad: DecisionReference = {
  id: "ev_prior_load_test",
  kind: "evidence",
  label: "Prior load test result",
  available: true,
  stale: true,
};

const refModelAssisted: DecisionReference = {
  id: "ev_error_shape_inferred",
  kind: "evidence",
  label: "Client-facing error shape inferred",
  available: true,
  modelAssisted: true,
};

const refTopologyAssumption: DecisionReference = {
  id: "as_topology_single_worker",
  kind: "assumption",
  label: "Deployment assumed single-worker",
  available: true,
};

const refGone: DecisionReference = {
  id: "req_withdrawn_clause",
  kind: "clause",
  label: "Reference no longer available",
  available: false,
};

/* --- Event builder ---------------------------------------------------- */

type EventInput = {
  eventType: DecisionHistoryEvent["eventType"];
  outcome?: DecisionOutcome;
  actor?: DecisionActor;
  recordedAt: string;
  headSha?: string;
  rationale?: string;
  references?: DecisionReference[];
  acceptedRiskReferences?: DecisionReference[];
  supersedesEventId?: string;
  reaffirmsEventId?: string;
  withdrawsEventId?: string;
  note?: string;
};

function makeEvent(input: EventInput): DecisionHistoryEvent {
  const actor = input.actor ?? REVIEWER;
  const references = input.references ?? [];
  const acceptedRiskReferences = input.acceptedRiskReferences ?? [];
  const predecessorId =
    input.supersedesEventId ?? input.reaffirmsEventId ?? input.withdrawsEventId;
  const fingerprint = identityFingerprint({
    outcome: input.outcome ?? "defer",
    headSha: input.headSha,
    predecessorId,
    rationale: input.rationale ?? "",
    referenceIds: references.map((reference) => reference.id),
    acceptedRiskIds: acceptedRiskReferences.map((reference) => reference.id),
    actorLabel: actor.displayLabel,
  });
  return {
    eventId: eventIdFromFingerprint(fingerprint),
    fingerprint,
    eventType: input.eventType,
    outcome: input.outcome,
    actor,
    recordedAt: input.recordedAt,
    headSha: input.headSha,
    rationale: input.rationale,
    references,
    acceptedRiskReferences,
    supersedesEventId: input.supersedesEventId,
    reaffirmsEventId: input.reaffirmsEventId,
    withdrawsEventId: input.withdrawsEventId,
    note: input.note,
    isSample: true,
  };
}

/* --- Scenario context ------------------------------------------------- */

export type ScenarioContext = {
  recommendation: Recommendation;
  headSha: string;
  priorHeadSha: string;
  openBlockingRequirements: number;
};

export type DecisionScenarioId =
  | "no-decision"
  | "applicable"
  | "predates-head"
  | "reaffirmed"
  | "superseded"
  | "withdrawn"
  | "accepted-risk"
  | "unavailable"
  | "aligned"
  | "more-conservative"
  | "accepted-additional-risk"
  | "materially-different";

export type DecisionScenarioMeta = {
  id: DecisionScenarioId;
  index: number;
  label: string;
  taxonomy: string;
  build: (context: ScenarioContext) => DecisionRecord;
};

/* Fixed sample timestamps (§14). */
const T0 = "12 Jul 2026 · 09:20";
const T1 = "16 Jul 2026 · 11:05";
const T2 = "18 Jul 2026 · 14:20";
const T3 = "18 Jul 2026 · 16:48";

/* --- The twelve states ------------------------------------------------ */

export const DECISION_SCENARIOS: DecisionScenarioMeta[] = [
  {
    id: "no-decision",
    index: 1,
    label: "No engineer decision recorded",
    taxonomy: "State A · empty",
    build: (context) => ({
      status: "empty",
      applicability: "unavailable",
      reportPresent: true,
      recommendation: context.recommendation,
      currentHeadSha: context.headSha,
      openBlockingRequirements: context.openBlockingRequirements,
      history: [],
      scenarioLabel: "Sample · no decision recorded",
    }),
  },
  {
    id: "applicable",
    index: 2,
    label: "Applicable current decision",
    taxonomy: "State B · applicable",
    build: (context) => {
      const effective = makeEvent({
        eventType: "decision-recorded",
        outcome: "tests-required",
        recordedAt: T2,
        headSha: context.headSha,
        rationale:
          "Idempotency guard is unproven under retry. Recording tests-required until a replay test asserts a single code issue.",
        references: [refIdempotency, refRetryEvidence],
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective,
        reportPresent: true,
        recommendation: "TESTS_REQUIRED",
        currentHeadSha: context.headSha,
        openBlockingRequirements: context.openBlockingRequirements,
        history: [effective],
        scenarioLabel: "Sample · applicable decision",
      };
    },
  },
  {
    id: "predates-head",
    index: 3,
    label: "Decision predating current head",
    taxonomy: "State C · predates-current-head",
    build: (context) => {
      const effective = makeEvent({
        eventType: "decision-recorded",
        outcome: "review-required",
        recordedAt: T1,
        headSha: context.priorHeadSha,
        rationale:
          "Topology could not be confirmed from the repository; asked for specialist review before merge.",
        references: [refTopologyAssumption, refStaleLoad],
      });
      return {
        status: "recorded",
        applicability: "predates-current-head",
        effective,
        /* No Report here — demonstrates divergence omission (§24.15). */
        reportPresent: false,
        recommendation: context.recommendation,
        currentHeadSha: context.headSha,
        priorHeadSha: context.priorHeadSha,
        openBlockingRequirements: context.openBlockingRequirements,
        history: [effective],
        scenarioLabel: "Sample · predates current head",
      };
    },
  },
  {
    id: "reaffirmed",
    index: 4,
    label: "Reaffirmed decision",
    taxonomy: "State F · reaffirmed",
    build: (context) => {
      const original = makeEvent({
        eventType: "decision-recorded",
        outcome: "approve",
        recordedAt: T1,
        headSha: context.priorHeadSha,
        rationale: "Boundary tests close the only requirement; approving.",
        references: [refRetryEvidence],
      });
      const reaffirmed = makeEvent({
        eventType: "decision-reaffirmed",
        outcome: "approve",
        recordedAt: T2,
        headSha: context.headSha,
        rationale:
          "Re-checked against the current head. Referenced tests still pass and nothing material changed.",
        references: [refRetryEvidence],
        reaffirmsEventId: original.eventId,
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective: reaffirmed,
        reportPresent: true,
        recommendation: "APPROVE",
        currentHeadSha: context.headSha,
        openBlockingRequirements: 0,
        history: [original, reaffirmed],
        scenarioLabel: "Sample · reaffirmed decision",
      };
    },
  },
  {
    id: "superseded",
    index: 5,
    label: "Superseded decision in history",
    taxonomy: "State G · lineage (effective is current)",
    build: (context) => {
      const original = makeEvent({
        eventType: "decision-recorded",
        outcome: "review-required",
        recordedAt: T1,
        headSha: context.headSha,
        rationale: "Initial read asked for review while the error contract was unclear.",
        references: [refModelAssisted],
      });
      const superseding = makeEvent({
        eventType: "decision-superseded",
        outcome: "tests-required",
        recordedAt: T2,
        headSha: context.headSha,
        rationale:
          "Error contract clarified; the remaining gap is missing tests, not review. Superseding the earlier review-required decision.",
        references: [refIdempotency, refProviderFailure],
        supersedesEventId: original.eventId,
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective: superseding,
        reportPresent: true,
        recommendation: "TESTS_REQUIRED",
        currentHeadSha: context.headSha,
        openBlockingRequirements: context.openBlockingRequirements,
        history: [original, superseding],
        scenarioLabel: "Sample · superseded in history",
      };
    },
  },
  {
    id: "withdrawn",
    index: 6,
    label: "Withdrawn decision",
    taxonomy: "State H · withdrawn",
    build: (context) => {
      const original = makeEvent({
        eventType: "decision-recorded",
        outcome: "approve",
        recordedAt: T1,
        headSha: context.priorHeadSha,
        rationale: "Approved on the earlier head before the credential-cache finding was raised.",
        references: [refRetryEvidence],
      });
      const withdrawal = makeEvent({
        eventType: "decision-withdrawn",
        recordedAt: T2,
        headSha: context.headSha,
        rationale:
          "New head introduced a credential-cache finding. Withdrawing the approval; the original remains in history.",
        references: [refGone],
        withdrawsEventId: original.eventId,
      });
      return {
        status: "recorded",
        applicability: "withdrawn",
        effective: withdrawal,
        /* No Report projected while withdrawn (§7). */
        reportPresent: false,
        recommendation: context.recommendation,
        currentHeadSha: context.headSha,
        openBlockingRequirements: context.openBlockingRequirements,
        history: [original, withdrawal],
        scenarioLabel: "Sample · withdrawn decision",
      };
    },
  },
  {
    id: "accepted-risk",
    index: 7,
    label: "Approved with accepted risk",
    taxonomy: "State L · approve-with-accepted-risk",
    build: (context) => {
      const effective = makeEvent({
        eventType: "risk-accepted",
        outcome: "approve-with-accepted-risk",
        recordedAt: T2,
        headSha: context.headSha,
        rationale:
          "Shipping ahead of the load-test re-run. The engineer — not Lintel — accepts the two referenced residual risks for this release.",
        references: [refRetryEvidence],
        acceptedRiskReferences: [refIdempotency, refStaleLoad],
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective,
        reportPresent: true,
        recommendation: "TESTS_REQUIRED",
        currentHeadSha: context.headSha,
        openBlockingRequirements: 2,
        history: [effective],
        scenarioLabel: "Sample · approved with accepted risk",
      };
    },
  },
  {
    id: "unavailable",
    index: 8,
    label: "Decision state unavailable",
    taxonomy: "State I · read/projection failure",
    build: (context) => ({
      status: "error",
      applicability: "unavailable",
      readError: "The decision record could not be read (malformed sample ledger).",
      reportPresent: true,
      recommendation: context.recommendation,
      currentHeadSha: context.headSha,
      openBlockingRequirements: context.openBlockingRequirements,
      history: [],
      scenarioLabel: "Sample · decision state unavailable",
    }),
  },
  {
    id: "aligned",
    index: 9,
    label: "Decision aligned with Lintel",
    taxonomy: "State J · divergence aligned",
    build: (context) => {
      const effective = makeEvent({
        eventType: "decision-recorded",
        outcome: "tests-required",
        recordedAt: T2,
        headSha: context.headSha,
        rationale: "Agrees with the recommendation: test evidence is missing before merge.",
        references: [refIdempotency],
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective,
        reportPresent: true,
        recommendation: "TESTS_REQUIRED",
        currentHeadSha: context.headSha,
        openBlockingRequirements: context.openBlockingRequirements,
        history: [effective],
        scenarioLabel: "Sample · aligned with Lintel",
      };
    },
  },
  {
    id: "more-conservative",
    index: 10,
    label: "More conservative than Lintel",
    taxonomy: "State K · human-more-conservative",
    build: (context) => {
      const effective = makeEvent({
        eventType: "decision-recorded",
        outcome: "blocked",
        recordedAt: T2,
        headSha: context.headSha,
        rationale:
          "Stricter than the recommendation: blocking until the idempotency risk is fully resolved, not merely tested.",
        references: [refIdempotency, refProviderFailure],
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective,
        reportPresent: true,
        recommendation: "TESTS_REQUIRED",
        currentHeadSha: context.headSha,
        openBlockingRequirements: context.openBlockingRequirements,
        history: [effective],
        scenarioLabel: "Sample · more conservative than Lintel",
      };
    },
  },
  {
    id: "accepted-additional-risk",
    index: 11,
    label: "Accepted additional risk vs Lintel",
    taxonomy: "State L · human-accepted-additional-risk",
    build: (context) => {
      const effective = makeEvent({
        eventType: "risk-accepted",
        outcome: "approve-with-accepted-risk",
        recordedAt: T3,
        headSha: context.headSha,
        rationale:
          "Merging over a Lintel block. The engineer accepts the named residual risk; Lintel did not approve it.",
        references: [refRetryEvidence],
        acceptedRiskReferences: [refIdempotency],
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective,
        reportPresent: true,
        recommendation: "BLOCK",
        currentHeadSha: context.headSha,
        openBlockingRequirements: 1,
        history: [effective],
        scenarioLabel: "Sample · accepted additional risk",
      };
    },
  },
  {
    id: "materially-different",
    index: 12,
    label: "Materially different from Lintel",
    taxonomy: "State M · materially-different",
    build: (context) => {
      const effective = makeEvent({
        eventType: "decision-recorded",
        outcome: "approve",
        recordedAt: T3,
        headSha: context.headSha,
        rationale:
          "Approving despite a Lintel block: the flagged path is unreachable in this deployment. Outcome differs materially from the recommendation.",
        references: [refRetryEvidence, refModelAssisted],
      });
      return {
        status: "recorded",
        applicability: "applicable",
        effective,
        reportPresent: true,
        recommendation: "BLOCK",
        currentHeadSha: context.headSha,
        openBlockingRequirements: context.openBlockingRequirements,
        history: [effective],
        scenarioLabel: "Sample · materially different",
      };
    },
  },
];

export function scenarioById(id: DecisionScenarioId): DecisionScenarioMeta {
  return DECISION_SCENARIOS.find((scenario) => scenario.id === id) ?? DECISION_SCENARIOS[0];
}

/* --- Per-case seed ---------------------------------------------------- */

/* Case #482 seeds to state A to match the approved visual baseline exactly.
   The others seed to a spread of recorded states so the resting workspace
   already exercises the projection across cases. */
export const CASE_DECISION_SEED: Record<string, DecisionScenarioId> = {
  "case-482": "no-decision",
  "case-476": "applicable",
  "case-471": "reaffirmed",
  "case-489": "predates-head",
};

export function seedScenarioFor(caseId: string): DecisionScenarioId {
  return CASE_DECISION_SEED[caseId] ?? "no-decision";
}

/* A longer sample history used to demonstrate the full-history surface
   beyond the inline five (§14). Newest last. */
export function sampleFullHistory(context: ScenarioContext): DecisionHistoryEvent[] {
  const e1 = makeEvent({
    eventType: "decision-recorded",
    outcome: "review-required",
    recordedAt: T0,
    headSha: context.priorHeadSha,
    rationale: "First read: asked for specialist review of the retry path.",
    references: [refModelAssisted],
  });
  const e2 = makeEvent({
    eventType: "note-recorded",
    recordedAt: T0,
    rationale: "Noted the load test predates this head and should be re-run.",
    actor: IMPORTED_REVIEWER,
  });
  const e3 = makeEvent({
    eventType: "decision-superseded",
    outcome: "tests-required",
    recordedAt: T1,
    headSha: context.priorHeadSha,
    rationale: "Review resolved; remaining gap is missing tests. Superseding.",
    references: [refIdempotency],
    supersedesEventId: e1.eventId,
  });
  const e4 = makeEvent({
    eventType: "risk-accepted",
    outcome: "approve-with-accepted-risk",
    recordedAt: T1,
    headSha: context.priorHeadSha,
    rationale: "Accepted the load-test staleness risk to unblock a hotfix.",
    references: [refRetryEvidence],
    acceptedRiskReferences: [refStaleLoad],
    supersedesEventId: e3.eventId,
  });
  const e5 = makeEvent({
    eventType: "risk-acceptance-revoked",
    recordedAt: T2,
    headSha: context.priorHeadSha,
    rationale: "Load test re-run scheduled; the earlier risk acceptance is no longer effective.",
    acceptedRiskReferences: [refStaleLoad],
    withdrawsEventId: e4.eventId,
  });
  const e6 = makeEvent({
    eventType: "decision-recorded",
    outcome: "tests-required",
    recordedAt: T2,
    headSha: context.headSha,
    rationale: "Recorded tests-required against the current head pending the replay test.",
    references: [refIdempotency, refProviderFailure],
  });
  const e7 = makeEvent({
    eventType: "decision-reaffirmed",
    outcome: "tests-required",
    recordedAt: T3,
    headSha: context.headSha,
    rationale: "Reaffirmed against the current head; the referenced gap still stands.",
    references: [refIdempotency, refProviderFailure],
    reaffirmsEventId: e6.eventId,
  });
  return [e1, e2, e3, e4, e5, e6, e7];
}
