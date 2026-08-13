import {
  DECISION_DRAFT_BINDING_SCHEMA_VERSION,
  decisionDraftApplicability,
  type DecisionDraftBinding,
  type DecisionDraftContext,
  type DecisionSubjectId,
  type DraftApplicabilityReasonCode,
  type ReviewId,
} from "../r6c/index";
import type {
  DecisionMutationCommand,
  DecisionMutationOutcome,
  DecisionReferenceInput,
} from "../workspace-v2/decision-mutations";
import type {
  CaseDetail,
  DecisionOutcome,
  DecisionRecordedView,
} from "../workspace-v2/view-model";
import {
  R6K_DRAFT_SCHEMA_VERSION,
  type HumanDecisionDraftRecord,
} from "./decision-draft";

export const HUMAN_DECISION_RATIONALE_MAX_LENGTH = 700;

export type HumanDecisionStaleReason = DraftApplicabilityReasonCode | "recorded-decision-changed";

export type HumanDecisionDraftFreshness = Readonly<{
  stale: boolean;
  reasons: readonly HumanDecisionStaleReason[];
}>;

export type DecisionBasisSnapshot = Readonly<{
  context: DecisionDraftContext;
  recordedEntryId: string | null;
}>;

export type BasisChange = Readonly<{
  dimension: "decision-subject" | "case" | "run" | "head" | "recorded-decision";
  label: string;
  was: string;
  is: string;
}>;

export type RiskReferenceOption = Readonly<{
  id: string;
  kind: "clause" | "evidence";
  label: string;
  detail: string;
}>;

export type PrimaryAction = "record" | "reaffirm" | "replace";

export type Submittability = Readonly<{
  submittable: boolean;
  reason: string | null;
  action: PrimaryAction | null;
}>;

function subjectValue(context: DecisionDraftContext): DecisionSubjectId | null {
  return context.decisionSubject.status === "available"
    ? context.decisionSubject.decisionSubjectId
    : null;
}

export function currentEffectiveEntryId(detail: CaseDetail): string | null {
  if (detail.decisionMutation.kind === "available") return detail.decisionMutation.effectiveEntryId;
  return detail.decision.status === "recorded" ? detail.decision.effectiveEntryId ?? null : null;
}

export function createDecisionDraftBinding(
  reviewId: ReviewId,
  context: DecisionDraftContext,
  authoredAt: string,
): DecisionDraftBinding {
  return {
    schemaVersion: DECISION_DRAFT_BINDING_SCHEMA_VERSION,
    reviewId,
    decisionSubject: subjectValue(context),
    caseId: context.basis.caseId,
    runId: context.basis.runId,
    headSha: context.basis.headSha,
    authoredAt,
  };
}

export function createEmptyHumanDecisionDraft(
  reviewId: ReviewId,
  context: DecisionDraftContext,
  recordedEntryId: string | null,
  now: string,
): HumanDecisionDraftRecord {
  return {
    schemaVersion: R6K_DRAFT_SCHEMA_VERSION,
    binding: createDecisionDraftBinding(reviewId, context, now),
    recordedEntryId,
    selectedOutcome: null,
    rationale: "",
    acceptedRiskReferenceIds: [],
    updatedAt: now,
  };
}

export function humanDecisionDraftFreshness(
  draft: HumanDecisionDraftRecord,
  context: DecisionDraftContext,
  recordedEntryId: string | null,
): HumanDecisionDraftFreshness {
  const applicability = decisionDraftApplicability(draft.binding, context);
  const reasons: HumanDecisionStaleReason[] = [...applicability.reasonCodes];
  if (draft.recordedEntryId !== recordedEntryId) reasons.push("recorded-decision-changed");
  return {
    stale: applicability.blocksSubmission || draft.recordedEntryId !== recordedEntryId,
    reasons,
  };
}

function shown(value: string | null, unavailable = "Unavailable"): string {
  return value === null ? unavailable : value;
}

function shortHead(value: string | null): string {
  return value === null ? "Unavailable" : value.slice(0, 7);
}

function recordedValue(value: string | null): string {
  return value === null ? "No recorded decision" : "Recorded decision present";
}

export function compareDecisionBasis(
  draft: HumanDecisionDraftRecord,
  current: DecisionBasisSnapshot,
): readonly BasisChange[] {
  const changes: BasisChange[] = [];
  const currentSubject = subjectValue(current.context);
  if (draft.binding.decisionSubject !== currentSubject) changes.push({
    dimension: "decision-subject",
    label: "Decision subject",
    was: shown(draft.binding.decisionSubject),
    is: shown(currentSubject),
  });
  if (draft.binding.caseId !== current.context.basis.caseId) changes.push({
    dimension: "case",
    label: "Case",
    was: draft.binding.caseId,
    is: current.context.basis.caseId,
  });
  if (draft.binding.runId !== current.context.basis.runId) changes.push({
    dimension: "run",
    label: "Analysis run",
    was: shown(draft.binding.runId),
    is: shown(current.context.basis.runId),
  });
  if (draft.binding.headSha !== current.context.basis.headSha) changes.push({
    dimension: "head",
    label: "Head commit",
    was: shortHead(draft.binding.headSha),
    is: shortHead(current.context.basis.headSha),
  });
  if (draft.recordedEntryId !== current.recordedEntryId) changes.push({
    dimension: "recorded-decision",
    label: "Recorded decision",
    was: recordedValue(draft.recordedEntryId),
    is: recordedValue(current.recordedEntryId),
  });
  return changes;
}

function basisSignature(basis: DecisionBasisSnapshot): string {
  return JSON.stringify({
    reviewId: basis.context.reviewId,
    subject: subjectValue(basis.context),
    caseId: basis.context.basis.caseId,
    runId: basis.context.basis.runId,
    headSha: basis.context.basis.headSha,
    recordedEntryId: basis.recordedEntryId,
  });
}

export function acknowledgeDecisionDraftReconciliation(
  draft: HumanDecisionDraftRecord,
  reviewedBasis: DecisionBasisSnapshot,
  currentBasis: DecisionBasisSnapshot,
  now: string,
): Readonly<{ status: "rebound"; draft: HumanDecisionDraftRecord }>
  | Readonly<{ status: "moved-again" }> {
  if (basisSignature(reviewedBasis) !== basisSignature(currentBasis)) return { status: "moved-again" };
  return {
    status: "rebound",
    draft: {
      ...draft,
      binding: createDecisionDraftBinding(draft.binding.reviewId, currentBasis.context, now),
      recordedEntryId: currentBasis.recordedEntryId,
      updatedAt: now,
    },
  };
}

export function normalizeCanonicalRationale(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, HUMAN_DECISION_RATIONALE_MAX_LENGTH);
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function recordedDecisionDiffers(
  draft: HumanDecisionDraftRecord,
  recorded: DecisionRecordedView,
): boolean {
  if (draft.selectedOutcome !== recorded.outcome) return true;
  if (normalizeCanonicalRationale(draft.rationale) !== normalizeCanonicalRationale(recorded.rationale ?? "")) return true;
  if (draft.selectedOutcome === "approve-with-accepted-risk") {
    return !sameIds(
      draft.acceptedRiskReferenceIds,
      recorded.acceptedRiskReferences.filter((reference) => reference.available).map((reference) => reference.id),
    );
  }
  return false;
}

export function derivePrimaryAction(
  draft: HumanDecisionDraftRecord,
  detail: CaseDetail,
): PrimaryAction {
  if (detail.decision.status !== "recorded") return "record";
  const reaffirm = detail.decision.applicability === "predates-current-head"
    && draft.selectedOutcome === detail.decision.outcome
    && normalizeCanonicalRationale(draft.rationale) === normalizeCanonicalRationale(detail.decision.rationale ?? "");
  return reaffirm ? "reaffirm" : "replace";
}

export function riskReferenceOptions(detail: CaseDetail): readonly RiskReferenceOption[] {
  const requirements = detail.requirements
    .filter((requirement) => requirement.importance === "blocking" && requirement.status === "open")
    .map((requirement) => ({
      id: requirement.requirementId,
      kind: "clause" as const,
      label: requirement.title,
      detail: requirement.statement,
    }));
  const evidence = detail.evidence.map((record) => ({
    id: record.evidenceId,
    kind: "evidence" as const,
    label: record.title,
    detail: record.statement,
  }));
  return [...requirements, ...evidence];
}

export function decisionSubmittability(
  draft: HumanDecisionDraftRecord,
  detail: CaseDetail,
  context: DecisionDraftContext,
): Submittability {
  const freshness = humanDecisionDraftFreshness(draft, context, currentEffectiveEntryId(detail));
  if (freshness.stale) return { submittable: false, reason: "Reconcile this draft with the current Review first.", action: null };
  if (detail.decisionMutation.kind !== "available") {
    return {
      submittable: false,
      reason: detail.decisionMutation.kind === "unavailable"
        ? detail.decisionMutation.reason
        : "Sample review decisions are read-only.",
      action: null,
    };
  }
  const action = derivePrimaryAction(draft, detail);
  if (draft.selectedOutcome === null) return { submittable: false, reason: "Select an outcome.", action };
  if (draft.rationale.trim().length === 0) return { submittable: false, reason: "A rationale is required.", action };
  if (draft.rationale.length > HUMAN_DECISION_RATIONALE_MAX_LENGTH) {
    return { submittable: false, reason: "The rationale must be 700 characters or fewer.", action };
  }
  if (draft.selectedOutcome === "approve-with-accepted-risk") {
    if (draft.acceptedRiskReferenceIds.length === 0) {
      return { submittable: false, reason: "Select at least one accepted risk reference.", action };
    }
    const valid = new Set(riskReferenceOptions(detail).map((option) => option.id));
    if (draft.acceptedRiskReferenceIds.some((id) => !valid.has(id))) {
      return { submittable: false, reason: "One or more accepted risk references are no longer available.", action };
    }
  }
  if (detail.decision.status === "recorded" && action === "replace" && !recordedDecisionDiffers(draft, detail.decision)) {
    return { submittable: false, reason: "Change the recorded outcome or rationale before replacing it.", action };
  }
  return { submittable: true, reason: null, action };
}

function selectedRiskInputs(
  draft: HumanDecisionDraftRecord,
  detail: CaseDetail,
): DecisionReferenceInput[] | null {
  if (draft.selectedOutcome !== "approve-with-accepted-risk") return [];
  const options = new Map(riskReferenceOptions(detail).map((option) => [option.id, option]));
  const result: DecisionReferenceInput[] = [];
  for (const id of draft.acceptedRiskReferenceIds) {
    const option = options.get(id);
    if (!option) return null;
    result.push({ id, kind: option.kind });
  }
  return result;
}

export function buildHumanDecisionCommand(
  draft: HumanDecisionDraftRecord,
  detail: CaseDetail,
  context: DecisionDraftContext,
): DecisionMutationCommand | null {
  const submittability = decisionSubmittability(draft, detail, context);
  if (!submittability.submittable || !submittability.action || detail.decisionMutation.kind !== "available") return null;
  const acceptedRiskReferences = selectedRiskInputs(draft, detail);
  if (!acceptedRiskReferences || !draft.selectedOutcome) return null;
  const target = {
    caseId: detail.decisionMutation.caseId,
    expectedHeadSha: draft.binding.headSha,
  };
  if (submittability.action === "record") {
    return {
      kind: "record",
      ...target,
      outcome: draft.selectedOutcome,
      rationale: draft.rationale,
      references: [],
      acceptedRiskReferences,
    };
  }
  const expectedEffectiveEntryId = detail.decisionMutation.effectiveEntryId;
  if (!expectedEffectiveEntryId) return null;
  if (submittability.action === "reaffirm") {
    return {
      kind: "reaffirm",
      ...target,
      expectedEffectiveEntryId,
      rationale: draft.rationale,
    };
  }
  return {
    kind: "supersede",
    ...target,
    expectedEffectiveEntryId,
    outcome: draft.selectedOutcome,
    rationale: draft.rationale,
    references: [],
    acceptedRiskReferences,
  };
}

export function primaryActionLabel(action: PrimaryAction | null): string {
  if (action === "reaffirm") return "Reaffirm decision";
  if (action === "replace") return "Replace decision";
  return "Record decision";
}

export function canonicalOutcomeClearsDraft(outcome: DecisionMutationOutcome): boolean {
  return outcome === "persisted";
}

export function canonicalOutcomeAllowsRetry(outcome: DecisionMutationOutcome): boolean {
  return outcome === "failed";
}

export function staleReasonLabel(reason: HumanDecisionStaleReason): string {
  const labels: Record<HumanDecisionStaleReason, string> = {
    "subject-unavailable": "The decision subject cannot be established.",
    "subject-changed": "The decision subject changed.",
    "case-changed": "The case changed.",
    "run-unavailable": "The analysis run cannot be established.",
    "run-changed": "The analysis run changed.",
    "head-unavailable": "The head commit cannot be established.",
    "head-changed": "The head commit changed.",
    "recorded-decision-changed": "The recorded decision changed.",
  };
  return labels[reason];
}
