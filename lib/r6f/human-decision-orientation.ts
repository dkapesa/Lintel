import {
  APPLICABILITY_LABEL,
  DIVERGENCE_LABEL,
  OUTCOME_LABEL,
  type CaseDetail,
} from "../workspace-v2/view-model";

export type HumanDecisionOrientation =
  | Readonly<{ status: "unavailable"; statement: "Human Decision unavailable."; details: readonly string[] }>
  | Readonly<{ status: "pending"; statement: "Human Decision pending."; details: readonly string[] }>
  | Readonly<{ status: "recorded"; statement: string; details: readonly string[] }>;

function formatRecordedTime(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(parsed));
}

export function projectHumanDecision(detail: CaseDetail): HumanDecisionOrientation {
  const decision = detail.decision;
  if (decision.status === "unavailable") {
    return { status: "unavailable", statement: "Human Decision unavailable.", details: [] };
  }
  if (decision.status === "empty") {
    return {
      status: "pending",
      statement: "Human Decision pending.",
      details: decision.isSample ? ["Sample data."] : [],
    };
  }

  const withdrawn = decision.applicability === "withdrawn" || decision.withdrawn === true;
  const details = [
    `Actor: ${decision.actor.displayLabel}`,
    `Recorded: ${formatRecordedTime(decision.recordedAt)}`,
    APPLICABILITY_LABEL[decision.applicability],
  ];
  if (decision.needsReaffirmation) details.push("Reaffirmation is needed for the current head.");
  if (decision.divergence) details.push(`Relationship to Lintel: ${DIVERGENCE_LABEL[decision.divergence]}.`);
  if (decision.isSample) details.push("Sample data.");

  return {
    status: "recorded",
    statement: withdrawn
      ? `Human Decision withdrawn: ${OUTCOME_LABEL[decision.outcome]}.`
      : `Human Decision recorded: ${OUTCOME_LABEL[decision.outcome]}.`,
    details,
  };
}
