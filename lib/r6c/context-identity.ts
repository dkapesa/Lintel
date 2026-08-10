import type {
  CaseDetail,
  ChangedFileView,
  EvidenceView,
  FindingView,
  RequirementView,
} from "../workspace-v2/view-model";

export const CONTEXT_KINDS = [
  "change",
  "finding",
  "evidence",
  "requirement",
  "case",
  "decision",
] as const;

export type ContextKind = (typeof CONTEXT_KINDS)[number];
export type ContextRef = Readonly<{ kind: ContextKind; id: string }>;

export type ResolvedContext =
  | { kind: "change"; ref: ContextRef; value: ChangedFileView }
  | { kind: "finding"; ref: ContextRef; value: FindingView }
  | { kind: "evidence"; ref: ContextRef; value: EvidenceView }
  | { kind: "requirement"; ref: ContextRef; value: RequirementView }
  | { kind: "case"; ref: ContextRef; value: CaseDetail["context"] }
  | { kind: "decision"; ref: ContextRef; value: CaseDetail["decision"] };

export type ContextResolution =
  | { status: "resolved"; context: ResolvedContext }
  | {
      status: "discarded";
      ref: ContextRef;
      reason: "identity-not-found" | "case-identity-changed";
    };

export function isContextKind(value: unknown): value is ContextKind {
  return typeof value === "string" && (CONTEXT_KINDS as readonly string[]).includes(value);
}

export function isContextRef(value: unknown): value is ContextRef {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return isContextKind(candidate.kind) && typeof candidate.id === "string" && candidate.id.length > 0;
}

export function contextRefEqual(left: ContextRef | null, right: ContextRef | null): boolean {
  return left === right || (
    left !== null &&
    right !== null &&
    left.kind === right.kind &&
    left.id === right.id
  );
}

/** Resolve by exact semantic identity. There is intentionally no fallback input. */
export function resolveContext(caseDetail: CaseDetail, ref: ContextRef): ContextResolution {
  if (ref.kind === "case" || ref.kind === "decision") {
    if (ref.id !== caseDetail.caseId) {
      return { status: "discarded", ref, reason: "case-identity-changed" };
    }
    return ref.kind === "case"
      ? { status: "resolved", context: { kind: "case", ref, value: caseDetail.context } }
      : { status: "resolved", context: { kind: "decision", ref, value: caseDetail.decision } };
  }

  if (ref.kind === "change") {
    const value = caseDetail.changedFiles.find((item) => item.artifactId === ref.id);
    return value
      ? { status: "resolved", context: { kind: "change", ref, value } }
      : { status: "discarded", ref, reason: "identity-not-found" };
  }
  if (ref.kind === "finding") {
    const value = caseDetail.findings.find((item) => item.findingId === ref.id);
    return value
      ? { status: "resolved", context: { kind: "finding", ref, value } }
      : { status: "discarded", ref, reason: "identity-not-found" };
  }
  if (ref.kind === "evidence") {
    const value = caseDetail.evidence.find((item) => item.evidenceId === ref.id);
    return value
      ? { status: "resolved", context: { kind: "evidence", ref, value } }
      : { status: "discarded", ref, reason: "identity-not-found" };
  }
  const value = caseDetail.requirements.find((item) => item.requirementId === ref.id);
  return value
    ? { status: "resolved", context: { kind: "requirement", ref, value } }
    : { status: "discarded", ref, reason: "identity-not-found" };
}
