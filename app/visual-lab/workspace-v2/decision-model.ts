/* R0B.2B — Workspace V2 recorded Human Decision · lab-local model.

   This file is the lab's self-contained decision domain. Like `fixtures.ts`
   it deliberately does NOT import from `lib/`. Every union below is
   transcribed to stay value-identical with the verified production sources
   named in the R0B.2 design contract, but no production code, storage key,
   schema, mutation function or `localStorage` is imported here.

     HumanDecisionOutcome        → lib/human-decision-ledger.ts §2.5
     HumanDecisionApplicability  → lib/human-decision-ledger.ts §2.6 (reconciled)
     RecommendationDivergence    → lib/human-decision-ledger.ts §2.7
     HumanDecisionEventType      → lib/human-decision-ledger.ts §2.4
     HumanDecisionActor.source   → lib/human-decision-ledger.ts §2.3

   Everything in this module is a pure function or a plain type. All mutation
   in the lab happens against route-local React state (see WorkspaceV2Client);
   the helpers here only compute deterministic identity, fingerprints and the
   view projection the Plate/Inspector render.

   NORMATIVE LOCKS honoured here (contract §24):
     · seven first-class outcomes, semantically distinct (§24.3–24.4)
     · live top-level applicability = applicable | predates-current-head |
       withdrawn | unavailable; partially-applicable deferred; superseded is
       lineage only (§24.5–24.7)
     · absent (A) ≠ unavailable (I) — distinct view-model status (§24.13–24.14)
     · divergence needs a Report; omitted otherwise (§24.15)
     · deterministic idempotency, no Date.now() in identity (§24.9–24.11)
     · fingerprint is attested, never signed (§17.11) */

import type { Recommendation } from "./fixtures";

/* --- Outcomes (§5) ---------------------------------------------------- */

export type DecisionOutcome =
  | "approve"
  | "approve-with-accepted-risk"
  | "tests-required"
  | "review-required"
  | "request-changes"
  | "blocked"
  | "defer";

export const DECISION_OUTCOMES: DecisionOutcome[] = [
  "approve",
  "approve-with-accepted-risk",
  "tests-required",
  "review-required",
  "request-changes",
  "blocked",
  "defer",
];

/* Studio label (the dominant token) per §5. */
export const OUTCOME_LABEL: Record<DecisionOutcome, string> = {
  approve: "Approve",
  "approve-with-accepted-risk": "Approve with accepted risk",
  "tests-required": "Tests required",
  "review-required": "Review required",
  "request-changes": "Request changes",
  blocked: "Blocked",
  defer: "Defer decision",
};

/* Normative meaning (§5, §24.4) — surfaced as the selectable option help
   text so the seven outcomes never read as interchangeable. */
export const OUTCOME_MEANING: Record<DecisionOutcome, string> = {
  approve: "Engineer approves merge.",
  "approve-with-accepted-risk":
    "Approve, and the engineer — not Lintel — explicitly accepts named residual risks.",
  "tests-required": "Test evidence is missing.",
  "review-required": "Further specialist or accountable-human review is required.",
  "request-changes": "Implementation changes are required.",
  blocked: "Stop: a critical unresolved issue prevents progress.",
  defer: "The engineer cannot responsibly decide yet — this is not approval.",
};

export type ToneKey = "success" | "warning" | "danger" | "information" | "muted";

/* Semantic tone only (final palette calibration deferred to R1C, §24.18). */
export function outcomeTone(outcome: DecisionOutcome): ToneKey {
  switch (outcome) {
    case "approve":
      return "success";
    case "approve-with-accepted-risk":
      return "warning";
    case "tests-required":
      return "warning";
    case "review-required":
      return "information";
    case "request-changes":
      return "information";
    case "blocked":
      return "danger";
    case "defer":
      return "muted";
  }
}

/* Coarse ranking used only for divergence comparison (§7). Higher = stricter. */
function outcomeRank(outcome: DecisionOutcome): number {
  switch (outcome) {
    case "approve":
      return 0;
    case "approve-with-accepted-risk":
      return 1;
    case "tests-required":
      return 2;
    case "review-required":
      return 2;
    case "request-changes":
      return 3;
    case "defer":
      return 3;
    case "blocked":
      return 4;
  }
}

function recommendationRank(recommendation: Recommendation): number {
  switch (recommendation) {
    case "APPROVE":
      return 0;
    case "TESTS_REQUIRED":
      return 2;
    case "REVIEW_REQUIRED":
      return 2;
    case "BLOCK":
      return 4;
  }
}

/* --- Applicability (§6, reconciled per §24.12) ------------------------ */

export type DecisionApplicability =
  | "applicable"
  | "predates-current-head"
  | "withdrawn"
  | "unavailable";
/* `partially-applicable` (state D) is deferred (§24.5) and `superseded`
   (state G) is lineage-only (§24.6); neither is a top-level applicability. */

export const APPLICABILITY_LABEL: Record<DecisionApplicability, string> = {
  applicable: "Applies to current head",
  "predates-current-head": "Predates current head",
  withdrawn: "Withdrawn",
  unavailable: "Unavailable",
};

/* --- Divergence (§7) -------------------------------------------------- */

export type DecisionDivergence =
  | "aligned"
  | "human-more-conservative"
  | "human-accepted-additional-risk"
  | "materially-different";

export const DIVERGENCE_LABEL: Record<DecisionDivergence, string> = {
  aligned: "Matches Lintel",
  "human-more-conservative": "More conservative",
  "human-accepted-additional-risk": "Accepted risk",
  "materially-different": "Differs from Lintel",
};

export const DIVERGENCE_MEANING: Record<DecisionDivergence, string> = {
  aligned: "Human decision matches the recommendation.",
  "human-more-conservative": "Engineer chose a stricter outcome than Lintel.",
  "human-accepted-additional-risk": "Engineer accepted referenced risks Lintel flagged.",
  "materially-different": "Human outcome differs materially from the recommendation.",
};

export function divergenceTone(divergence: DecisionDivergence): ToneKey {
  switch (divergence) {
    case "aligned":
      return "success";
    case "human-more-conservative":
      return "information";
    case "human-accepted-additional-risk":
      return "warning";
    case "materially-different":
      return "warning";
  }
}

/* The real comparator (mirrors recommendationDivergenceForReport, §2.7).
   Only ever called when a Report is present (§24.15). */
export function computeDivergence(
  recommendation: Recommendation,
  outcome: DecisionOutcome,
): DecisionDivergence {
  if (outcome === "approve-with-accepted-risk") return "human-accepted-additional-risk";
  const human = outcomeRank(outcome);
  const rec = recommendationRank(recommendation);
  if (human === rec) return "aligned";
  if (human > rec) return "human-more-conservative";
  return "materially-different";
}

/* --- Event types & actor (§2.3–2.4) ---------------------------------- */

export type DecisionEventType =
  | "decision-recorded"
  | "decision-reaffirmed"
  | "decision-superseded"
  | "decision-withdrawn"
  | "risk-accepted"
  | "risk-acceptance-revoked"
  | "note-recorded";

export const EVENT_TITLE: Record<DecisionEventType, string> = {
  "decision-recorded": "Decision recorded",
  "decision-reaffirmed": "Decision reaffirmed",
  "decision-superseded": "Decision superseded",
  "decision-withdrawn": "Decision withdrawn",
  "risk-accepted": "Risk accepted",
  "risk-acceptance-revoked": "Risk acceptance revoked",
  "note-recorded": "Note recorded",
};

export type DecisionActorSource = "local" | "github" | "imported" | "unknown";

export type DecisionActor = {
  displayLabel: string;
  source: DecisionActorSource;
  role?: string;
};

export const UNKNOWN_ACTOR: DecisionActor = {
  displayLabel: "Unknown actor",
  source: "unknown",
};

/* --- References ------------------------------------------------------- */

export type DecisionReferenceKind = "clause" | "assumption" | "evidence";

export type DecisionReference = {
  id: string;
  kind: DecisionReferenceKind;
  label: string;
  /* false → the reference can no longer be resolved (§17.9). Never dropped. */
  available: boolean;
  stale?: boolean;
  /* carry the "model assisted" marker from the observation (§17.8). */
  modelAssisted?: boolean;
};

/* --- History event ---------------------------------------------------- */

export type DecisionHistoryEvent = {
  eventId: string;
  eventType: DecisionEventType;
  outcome?: DecisionOutcome;
  actor: DecisionActor;
  /* Fixed sample strings in seed data; a display string may be generated
     after a successful local sample event (§11) — never used as identity. */
  recordedAt: string;
  headSha?: string;
  rationale?: string;
  fingerprint: string;
  references: DecisionReference[];
  acceptedRiskReferences: DecisionReference[];
  supersedesEventId?: string;
  reaffirmsEventId?: string;
  withdrawsEventId?: string;
  note?: string;
  /* Every lab entry is sample data (§17.12). */
  isSample: true;
};

/* --- Record (the per-case local state) -------------------------------- */

/* status distinguishes A (empty, read succeeded) from I (error) — §24.13. */
export type DecisionRecordStatus = "recorded" | "empty" | "error";

export type DecisionRecord = {
  status: DecisionRecordStatus;
  /* Present only when status === "error" (state I). Distinct copy, never A. */
  readError?: string;
  applicability: DecisionApplicability;
  /* The effective decision. Absent for empty (A) and error (I). */
  effective?: DecisionHistoryEvent;
  /* Whether a Report is available for this case (§24.15). */
  reportPresent: boolean;
  recommendation: Recommendation;
  currentHeadSha?: string;
  /* The head the effective entry was recorded against, when it predates. */
  priorHeadSha?: string;
  openBlockingRequirements: number;
  /* Full lineage, newest last. Includes superseded / withdrawn entries. */
  history: DecisionHistoryEvent[];
  /* Set true after a write-failure fallback (§24.16). */
  isSessionOnly?: boolean;
  /* Human-readable label for a loaded sample scenario (lab affordance). */
  scenarioLabel?: string;
};

/* --- View model (§20) ------------------------------------------------- */

export type DecisionReaffirmation = {
  required: boolean;
  priorHeadSha?: string;
  currentHeadSha?: string;
};

export type DecisionPlateViewModel = {
  status: DecisionRecordStatus;
  applicability: DecisionApplicability;
  outcome?: DecisionOutcome;
  actor?: DecisionActor;
  recordedAt?: string;
  applicableHeadSha?: string;
  headRecorded: boolean;
  fingerprint?: string;
  divergence?: DecisionDivergence;
  rationale?: string;
  references: DecisionReference[];
  acceptedRiskReferences: DecisionReference[];
  reaffirmation: DecisionReaffirmation;
  isSample: boolean;
  isSessionOnly: boolean;
  readError?: string;
  recommendation: Recommendation;
  openBlockingRequirements: number;
  effectiveEventType?: DecisionEventType;
  historyCount: number;
  scenarioLabel?: string;
};

/* Projection: derive the Plate/Inspector view model from a record.
   Divergence is computed only when a Report is present AND there is an
   effective outcome (§24.15). Absent (A) vs error (I) is preserved. */
export function projectDecision(record: DecisionRecord): DecisionPlateViewModel {
  const effective = record.effective;
  const reaffirmationRequired =
    record.status === "recorded" && record.applicability === "predates-current-head";

  let divergence: DecisionDivergence | undefined;
  if (
    record.status === "recorded" &&
    record.reportPresent &&
    effective &&
    effective.outcome &&
    record.applicability !== "withdrawn"
  ) {
    divergence = computeDivergence(record.recommendation, effective.outcome);
  }

  return {
    status: record.status,
    applicability: record.applicability,
    outcome: effective?.outcome,
    actor: effective?.actor,
    recordedAt: effective?.recordedAt,
    applicableHeadSha: effective?.headSha,
    headRecorded: Boolean(effective?.headSha),
    fingerprint: effective?.fingerprint,
    divergence,
    rationale: effective?.rationale,
    references: effective?.references ?? [],
    acceptedRiskReferences: effective?.acceptedRiskReferences ?? [],
    reaffirmation: {
      required: reaffirmationRequired,
      priorHeadSha: record.priorHeadSha ?? effective?.headSha,
      currentHeadSha: record.currentHeadSha,
    },
    isSample: Boolean(effective?.isSample),
    isSessionOnly: Boolean(record.isSessionOnly),
    readError: record.readError,
    recommendation: record.recommendation,
    openBlockingRequirements: record.openBlockingRequirements,
    effectiveEventType: effective?.eventType,
    historyCount: record.history.length,
    scenarioLabel: record.scenarioLabel,
  };
}

/* --- Deterministic identity & fingerprint (§24.9–24.11, §17.11) ------ */

/* Deterministic FNV-1a-based content hash over a stable string. This is a
   content fingerprint — attested, NOT a cryptographic signature. No key,
   no identity assurance. Two passes widen the digest for a plausible
   prefix; it is fully determined by its input (never a timestamp). */
export function sampleFingerprint(input: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  let h2 = 0x811c9dc5 ^ 0x9e3779b9;
  for (let i = input.length - 1; i >= 0; i -= 1) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x01000193);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return hex1 + hex2;
}

export function fingerprintPrefix(fingerprint: string): string {
  return fingerprint.slice(0, 8);
}

export type DecisionIdentityInput = {
  outcome: DecisionOutcome;
  headSha?: string;
  predecessorId?: string;
  rationale: string;
  referenceIds: string[];
  acceptedRiskIds: string[];
  actorLabel: string;
};

/* Stable identity for dedup. Excludes any fresh timestamp (§24.11). */
export function decisionIdentity(input: DecisionIdentityInput): string {
  return JSON.stringify({
    outcome: input.outcome,
    head: input.headSha ?? "",
    predecessor: input.predecessorId ?? "",
    rationale: input.rationale.trim(),
    refs: [...input.referenceIds].sort(),
    risk: [...input.acceptedRiskIds].sort(),
    actor: input.actorLabel,
  });
}

export function identityFingerprint(input: DecisionIdentityInput): string {
  return sampleFingerprint(decisionIdentity(input));
}

export function eventIdFromFingerprint(fingerprint: string): string {
  return `hde_${fingerprint.slice(0, 14)}`;
}

/* Pure event factory shared by fixtures and the route owner. The fingerprint
   and eventId are deterministic functions of the event's identity; a display
   `recordedAt` may be generated after a successful local sample event and is
   never part of that identity (§11, §24.11). */
export function createDecisionEvent(input: {
  eventType: DecisionEventType;
  outcome?: DecisionOutcome;
  actor: DecisionActor;
  recordedAt: string;
  headSha?: string;
  rationale?: string;
  references?: DecisionReference[];
  acceptedRiskReferences?: DecisionReference[];
  supersedesEventId?: string;
  reaffirmsEventId?: string;
  withdrawsEventId?: string;
  note?: string;
}): DecisionHistoryEvent {
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
    actorLabel: input.actor.displayLabel,
  });
  return {
    eventId: eventIdFromFingerprint(fingerprint),
    fingerprint,
    eventType: input.eventType,
    outcome: input.outcome,
    actor: input.actor,
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

/* Headline label for an effective event that carries no outcome — the
   withdrawal and revocation terminal events. */
export function terminalEventLabel(eventType: DecisionEventType): string {
  if (eventType === "decision-withdrawn") return "Decision withdrawn";
  if (eventType === "risk-acceptance-revoked") return "Risk acceptance revoked";
  return EVENT_TITLE[eventType];
}

export type SubmissionClass = "no-op" | "reaffirm" | "supersede" | "record";

/* Classify a submission against the current effective entry (§24.9–24.10).
   · no effective entry            → record
   · identical identity            → no-op
   · same outcome + same head      → reaffirm (predates) or supersede (material)
   · anything else                 → supersede */
export function classifySubmission(
  input: DecisionIdentityInput,
  effective: DecisionHistoryEvent | undefined,
  applicability: DecisionApplicability,
): SubmissionClass {
  if (!effective || !effective.outcome) return "record";

  const nextIdentity = decisionIdentity(input);
  const prevIdentity = decisionIdentity({
    outcome: effective.outcome,
    headSha: effective.headSha,
    predecessorId: input.predecessorId,
    rationale: effective.rationale ?? "",
    referenceIds: effective.references.map((reference) => reference.id),
    acceptedRiskIds: effective.acceptedRiskReferences.map((reference) => reference.id),
    actorLabel: effective.actor.displayLabel,
  });

  if (nextIdentity === prevIdentity) return "no-op";

  const sameOutcome = effective.outcome === input.outcome;
  const sameHead = (effective.headSha ?? "") === (input.headSha ?? "");
  if (sameOutcome && sameHead) {
    return applicability === "predates-current-head" ? "reaffirm" : "supersede";
  }
  return "supersede";
}

/* --- Reference helpers ------------------------------------------------ */

export function referenceCountByKind(references: DecisionReference[]) {
  return {
    clause: references.filter((reference) => reference.kind === "clause").length,
    assumption: references.filter((reference) => reference.kind === "assumption").length,
    evidence: references.filter((reference) => reference.kind === "evidence").length,
  };
}

/* --- Spine stage-5 projection (§15) ----------------------------------- */

export function decisionStageLabel(view: DecisionPlateViewModel): string {
  if (view.status === "error") return "unavailable";
  if (view.status === "empty") return "not recorded";
  if (view.applicability === "withdrawn") return "withdrawn";
  if (view.reaffirmation.required) return "needs reaffirmation";
  if (view.outcome) return OUTCOME_LABEL[view.outcome].toLowerCase();
  /* Recorded terminal event without a standing outcome — a revocation is
     not the same truth as "not recorded" (R0B.2C edge-state QA). */
  if (view.effectiveEventType === "risk-acceptance-revoked") return "risk revoked";
  return "not recorded";
}

export type SpineStageState = "complete" | "attention" | "pending";

export function decisionStageState(view: DecisionPlateViewModel): SpineStageState {
  if (view.status === "error") return "attention";
  if (view.status === "empty") return "attention";
  if (view.applicability === "withdrawn") return "attention";
  if (view.reaffirmation.required) return "attention";
  /* A revoked risk acceptance leaves no standing outcome — the case needs a
     fresh decision, which is attention, not mere pending. */
  if (!view.outcome && view.effectiveEventType === "risk-acceptance-revoked") return "attention";
  if (view.outcome === "approve" || view.outcome === "approve-with-accepted-risk") {
    return "complete";
  }
  return "pending";
}

/* Footer note wording, distinguishing A from I (§15, §24.13). */
export function decisionFooterNote(view: DecisionPlateViewModel): {
  text: string;
  tone: ToneKey;
} {
  if (view.status === "error") return { text: "Decision state unavailable", tone: "danger" };
  if (view.status === "empty") return { text: "Decision not recorded", tone: "warning" };
  if (view.applicability === "withdrawn") return { text: "Decision withdrawn", tone: "warning" };
  if (view.reaffirmation.required) {
    return { text: "Decision needs reaffirmation", tone: "warning" };
  }
  /* Stage 5's sublabel already names the outcome; repeating it in the same
     plane's footer duplicated the sentence (R0B.2C §2). */
  if (view.outcome) {
    return { text: "Decision recorded", tone: "muted" };
  }
  if (view.effectiveEventType === "risk-acceptance-revoked") {
    return { text: "Risk acceptance revoked", tone: "warning" };
  }
  return { text: "Decision not recorded", tone: "warning" };
}
