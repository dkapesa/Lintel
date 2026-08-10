import type { CaseDetail } from "../workspace-v2/view-model";
import type { CaseId, ReviewId } from "./review-identity";

declare const decisionSubjectIdBrand: unique symbol;
export type DecisionSubjectId = string & {
  readonly [decisionSubjectIdBrand]: "DecisionSubjectId";
};

export const HUMAN_DECISION_DRAFT_STORAGE_KEY = "lintel.r6.humanDecisionDraft.v1";
export const DECISION_DRAFT_BINDING_SCHEMA_VERSION = 1 as const;

export function decisionSubjectIdFromCapability(value: string): DecisionSubjectId {
  if (value.length === 0) throw new Error("DecisionSubjectId must not be empty");
  return value as DecisionSubjectId;
}

export type DecisionSubjectCapability =
  | Readonly<{ status: "available"; decisionSubjectId: DecisionSubjectId }>
  | Readonly<{ status: "unavailable"; reason: string }>;

export type DecisionDraftBinding = Readonly<{
  schemaVersion: typeof DECISION_DRAFT_BINDING_SCHEMA_VERSION;
  reviewId: ReviewId;
  decisionSubject: DecisionSubjectId | null;
  caseId: CaseId;
  runId: string | null;
  headSha: string | null;
  authoredAt: string;
}>;

export type DecisionDraftContext = Readonly<{
  reviewId: ReviewId;
  decisionSubject: DecisionSubjectCapability;
  basis: Readonly<{
    caseId: CaseId;
    runId: string | null;
    headSha: string | null;
  }>;
}>;

export type DecisionDraftContextResult =
  | { status: "available"; context: DecisionDraftContext }
  | { status: "unavailable"; reason: string };

export type DecisionSubjectResolver = (
  reviewId: ReviewId,
  currentCase: CaseDetail,
) => DecisionSubjectCapability;

export function decisionDraftContextFor(
  reviewId: ReviewId,
  currentCase: CaseDetail,
  resolveDecisionSubject: DecisionSubjectResolver,
): DecisionDraftContext {
  return {
    reviewId,
    decisionSubject: resolveDecisionSubject(reviewId, currentCase),
    basis: {
      caseId: currentCase.caseId,
      runId: currentCase.run?.runId ?? null,
      headSha: currentCase.run?.headSha ?? currentCase.github.headSha,
    },
  };
}

export type SubjectApplicability = "match" | "changed" | "unavailable";
export type CaseApplicability = "match" | "changed";
export type OptionalBasisApplicability = "match" | "changed" | "unavailable";
export type DecisionDraftVerdict =
  | "applicable"
  | "changed-decision-subject"
  | "stale-verification-basis"
  | "indeterminate";

export type DraftApplicabilityReasonCode =
  | "subject-unavailable"
  | "subject-changed"
  | "case-changed"
  | "run-unavailable"
  | "run-changed"
  | "head-unavailable"
  | "head-changed";

export type DecisionDraftApplicability = Readonly<{
  verdict: DecisionDraftVerdict;
  blocksSubmission: boolean;
  dimensions: Readonly<{
    subject: SubjectApplicability;
    basis: Readonly<{
      case: CaseApplicability;
      run: OptionalBasisApplicability;
      head: OptionalBasisApplicability;
    }>;
  }>;
  reasonCodes: readonly DraftApplicabilityReasonCode[];
}>;

function optionalDimension(
  authored: string | null,
  current: string | null,
): OptionalBasisApplicability {
  if (authored === null || current === null) return "unavailable";
  return authored === current ? "match" : "changed";
}

export function decisionDraftApplicability(
  binding: DecisionDraftBinding,
  current: DecisionDraftContext,
): DecisionDraftApplicability {
  const subject: SubjectApplicability =
    binding.decisionSubject === null || current.decisionSubject.status === "unavailable"
      ? "unavailable"
      : binding.decisionSubject === current.decisionSubject.decisionSubjectId
        ? "match"
        : "changed";
  const basis = {
    case: binding.caseId === current.basis.caseId ? "match" : "changed",
    run: optionalDimension(binding.runId, current.basis.runId),
    head: optionalDimension(binding.headSha, current.basis.headSha),
  } as const;

  const reasonCodes: DraftApplicabilityReasonCode[] = [];
  if (subject === "unavailable") reasonCodes.push("subject-unavailable");
  if (subject === "changed") reasonCodes.push("subject-changed");
  if (basis.case === "changed") reasonCodes.push("case-changed");
  if (basis.run === "unavailable") reasonCodes.push("run-unavailable");
  if (basis.run === "changed") reasonCodes.push("run-changed");
  if (basis.head === "unavailable") reasonCodes.push("head-unavailable");
  if (basis.head === "changed") reasonCodes.push("head-changed");

  const verdict: DecisionDraftVerdict =
    subject === "unavailable" || basis.run === "unavailable" || basis.head === "unavailable"
      ? "indeterminate"
      : subject === "changed"
        ? "changed-decision-subject"
        : basis.case === "changed" || basis.run === "changed" || basis.head === "changed"
          ? "stale-verification-basis"
          : "applicable";

  return {
    verdict,
    blocksSubmission: verdict !== "applicable",
    dimensions: { subject, basis },
    reasonCodes,
  };
}

export type DraftBindingIntegrity =
  | { status: "ok"; binding: DecisionDraftBinding }
  | { status: "quarantine"; reasonCodes: readonly string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function nullableNonEmptyString(value: unknown): value is string | null {
  return value === null || nonEmptyString(value);
}

/** Malformed private bindings are quarantined; R6C never discards them. */
export function draftBindingIntegrity(value: unknown): DraftBindingIntegrity {
  const reasons: string[] = [];
  if (!isRecord(value)) return { status: "quarantine", reasonCodes: ["not-an-object"] };
  if (value.schemaVersion !== DECISION_DRAFT_BINDING_SCHEMA_VERSION) reasons.push("schema-version");
  if (!nonEmptyString(value.reviewId)) reasons.push("review-id");
  if (!nullableNonEmptyString(value.decisionSubject)) reasons.push("decision-subject");
  if (!nonEmptyString(value.caseId)) reasons.push("case-id");
  if (!nullableNonEmptyString(value.runId)) reasons.push("run-id");
  if (!nullableNonEmptyString(value.headSha)) reasons.push("head-sha");
  if (!nonEmptyString(value.authoredAt) || !Number.isFinite(Date.parse(value.authoredAt as string))) {
    reasons.push("authored-at");
  }
  return reasons.length > 0
    ? { status: "quarantine", reasonCodes: reasons }
    : { status: "ok", binding: value as DecisionDraftBinding };
}

/** Draft ownership is exactly one ReviewId, never DecisionSubjectId. */
export function decisionDraftOwner(binding: DecisionDraftBinding): ReviewId {
  return binding.reviewId;
}
