/* R1B.0 — Production Workspace V2 · pure projections.

   Deterministic, side-effect-free functions over the view models. No React,
   no DOM, no storage. These are the projections the fixture scaffold needs
   and the same ones a future R1B.1 real adapter will reuse, so both the
   fixture path and the real path compute Spine states, evidence composition
   and inspector modes identically. */

import {
  type CaseDetail,
  type DecisionMarker,
  type DecisionOutcome,
  type DecisionPlateViewModel,
  type EvidenceClass,
  type EvidenceComposition,
  type InspectorProjection,
  type ArtifactRef,
  type StageId,
  type StageState,
  type ToneKey,
} from "./view-model";

/* --- Stage projections ------------------------------------------------ */

export function stageCount(detail: CaseDetail, stage: StageId): number {
  if (stage === "change") return detail.changedFiles.length;
  if (stage === "observation") return detail.findings.length;
  if (stage === "evidence") return detail.evidence.length;
  if (stage === "requirement") return detail.requirements.length;
  /* Terminal decision stage carries an effective-decision count (0 or 1). */
  return detail.decision.status === "recorded" ? 1 : 0;
}

export function canvasStageState(detail: CaseDetail, stage: StageId): StageState {
  if (stage === "change") {
    const severe = detail.changedFiles.some(
      (item) => item.risk === "HIGH" || item.risk === "CRITICAL",
    );
    return severe ? "attention" : "complete";
  }

  if (stage === "observation") {
    if (detail.findings.length === 0) return "complete";
    const severe = detail.findings.some(
      (item) => item.severity === "HIGH" || item.severity === "CRITICAL",
    );
    return severe ? "attention" : "pending";
  }

  if (stage === "evidence") {
    const weak = detail.evidence.some(
      (item) => item.stale || item.status === "missing" || item.status === "unverified",
    );
    return weak ? "attention" : "complete";
  }

  if (stage === "requirement") {
    const openBlocking = detail.requirements.some(
      (item) => item.importance === "blocking" && item.status === "open",
    );
    if (openBlocking) return "attention";
    const anyOpen = detail.requirements.some((item) => item.status === "open");
    return anyOpen ? "pending" : "complete";
  }

  return decisionStageState(detail.decision);
}

/* --- Decision Spine / footer projections (r0b2 §15) ------------------- */

export function decisionStageState(decision: DecisionPlateViewModel): StageState {
  if (decision.status === "unavailable") return "attention";
  if (decision.status === "empty") return "attention";
  if (decision.applicability === "withdrawn") return "attention";
  if (decision.needsReaffirmation) return "attention";
  if (decision.outcome === "approve" || decision.outcome === "approve-with-accepted-risk") {
    return "complete";
  }
  return "pending";
}

export function decisionStageLabel(decision: DecisionPlateViewModel): string {
  if (decision.status === "unavailable") return "unavailable";
  if (decision.status === "empty") return "not recorded";
  if (decision.applicability === "withdrawn") return "withdrawn";
  if (decision.needsReaffirmation) return "needs reaffirmation";
  return OUTCOME_STAGE_LABEL[decision.outcome];
}

const OUTCOME_STAGE_LABEL: Record<DecisionOutcome, string> = {
  approve: "approve",
  "approve-with-accepted-risk": "approve with accepted risk",
  "tests-required": "tests required",
  "review-required": "review required",
  "request-changes": "request changes",
  blocked: "blocked",
  defer: "defer decision",
};

export type DecisionFooterNote = { text: string; tone: ToneKey };

export function decisionFooterNote(decision: DecisionPlateViewModel): DecisionFooterNote {
  if (decision.status === "unavailable") {
    return { text: "Decision state unavailable", tone: "danger" };
  }
  if (decision.status === "empty") {
    return { text: "Decision not recorded", tone: "warning" };
  }
  if (decision.applicability === "withdrawn") {
    return { text: "Decision withdrawn", tone: "warning" };
  }
  if (decision.needsReaffirmation) {
    return { text: "Decision needs reaffirmation", tone: "warning" };
  }
  return { text: "Decision recorded", tone: "muted" };
}

export function decisionMarkerFor(decision: DecisionPlateViewModel): DecisionMarker {
  if (decision.status !== "recorded") return { kind: "none" };
  if (decision.applicability === "withdrawn") return { kind: "none" };
  return {
    kind: "recorded",
    outcome: decision.outcome,
    needsReaffirmation: decision.needsReaffirmation,
    /* Carried so the queue marker can label a real recorded decision without
       the fixture-era "Sample" prefix (r1b1 provenance truthfulness). */
    isSample: decision.isSample,
  };
}

/* --- Evidence projections --------------------------------------------- */

/* Rank on the production evidence ladder, collapsed to four visible steps for
   the strength meter. Higher is stronger. */
export function evidenceRank(evidenceClass: EvidenceClass): number {
  if (evidenceClass === "externally-verified") return 4;
  if (evidenceClass === "directly-observed") return 3;
  if (evidenceClass === "human-confirmed") return 3;
  if (evidenceClass === "builder-declared") return 2;
  if (evidenceClass === "model-inferred") return 1;
  if (evidenceClass === "assumption") return 1;
  return 0;
}

export function isStrongEvidence(evidenceClass: EvidenceClass): boolean {
  return evidenceRank(evidenceClass) >= 3;
}

/* Composition is a plain count of this case's own records. It is not a
   benchmark and implies no comparison to any other case or to "normal". */
export function evidenceComposition(detail: CaseDetail): EvidenceComposition {
  const records = detail.evidence;
  return {
    strong: records.filter((item) => isStrongEvidence(item.evidenceClass) && !item.stale).length,
    inferred: records.filter((item) => !isStrongEvidence(item.evidenceClass)).length,
    incomplete: records.filter(
      (item) => item.status === "missing" || item.status === "unverified",
    ).length,
    stale: records.filter((item) => item.stale).length,
    total: records.length,
  };
}

export function confirmedEvidenceCount(detail: CaseDetail): number {
  return detail.evidence.filter(
    (item) => (item.status === "confirmed" || item.status === "present") && !item.stale,
  ).length;
}

export function staleEvidenceCount(detail: CaseDetail): number {
  return detail.evidence.filter((item) => item.stale).length;
}

export function openBlockingCount(detail: CaseDetail): number {
  return detail.requirements.filter(
    (item) => item.importance === "blocking" && item.status === "open",
  ).length;
}

/* --- Focus resolution ------------------------------------------------- */

/* Resolve a focus ref against the active case. Returns null when the ref does
   not match anything in the case (e.g. stale focus after a case change),
   which the caller treats as "no focus". */
export function resolveArtifactRef(
  detail: CaseDetail,
  ref: ArtifactRef | null,
): InspectorProjection | null {
  if (!ref) return null;
  if (ref.kind === "finding") {
    const finding = detail.findings.find((item) => item.findingId === ref.id);
    return finding ? { mode: "finding", finding } : null;
  }
  if (ref.kind === "evidence") {
    const evidence = detail.evidence.find((item) => item.evidenceId === ref.id);
    return evidence ? { mode: "evidence", evidence } : null;
  }
  const requirement = detail.requirements.find((item) => item.requirementId === ref.id);
  return requirement ? { mode: "requirement", requirement } : null;
}

/* Single source of the Inspector projection. Priority: an open Decision
   Context, then a focused artifact, otherwise the resting Case Context. The
   Inspector never holds its own copy of the selection — it is derived here. */
export function resolveInspector(
  detail: CaseDetail,
  focus: ArtifactRef | null,
  decisionFocused: boolean,
  caseTitle: string,
): InspectorProjection {
  if (decisionFocused) {
    return { mode: "decision-context", decision: detail.decision, caseTitle };
  }
  const artifact = resolveArtifactRef(detail, focus);
  if (artifact) return artifact;
  return {
    mode: "case-context",
    title: detail.reviewStatus,
    context: detail.context,
    composition: evidenceComposition(detail),
    headSha: detail.github.headSha,
    updatedAt: detail.github.updatedAt,
  };
}
