import { resolveCurrentCase, type ContextRef, type ReviewId, type ReviewIndex } from "../r6c/index";
import type { CaseDetail, EvidenceStatus } from "../workspace-v2/view-model";
import { EVIDENCE_CLASS_LABELS, evidenceStatusLabel } from "./labels";

export const EVIDENCE_GROUPS = [
  { key: "missing-proof", label: "Missing proof" },
  { key: "stale-evidence", label: "Stale evidence" },
  { key: "available-evidence", label: "Available evidence" },
  { key: "not-applicable", label: "Not applicable" },
] as const;

export type EvidenceGroupKey = (typeof EVIDENCE_GROUPS)[number]["key"];

export type EvidenceRegisterRow = Readonly<{
  context: ContextRef;
  sourceIndex: number;
  title: string;
  statement: string;
  status: EvidenceStatus;
  statusLabel: string;
  evidenceClassLabel: string;
  source: string;
}>;

export type EvidenceRegisterProjection =
  | Readonly<{ status: "unavailable" }>
  | Readonly<{
      status: "ready";
      recordCount: number;
      excludedDuplicateIdentityCount: number;
      groups: readonly Readonly<{
        key: EvidenceGroupKey;
        label: string;
        rows: readonly EvidenceRegisterRow[];
      }>[];
    }>;

function groupFor(status: EvidenceStatus, stale: boolean): EvidenceGroupKey {
  if (status === "missing" || status === "unverified") return "missing-proof";
  if (stale || status === "stale") return "stale-evidence";
  if (status === "present" || status === "confirmed") return "available-evidence";
  return "not-applicable";
}

export function projectEvidenceRegisterFromCase(detail: CaseDetail): Extract<EvidenceRegisterProjection, { status: "ready" }> {
  const seen = new Set<string>();
  let excludedDuplicateIdentityCount = 0;
  const rowsByGroup = new Map<EvidenceGroupKey, EvidenceRegisterRow[]>(
    EVIDENCE_GROUPS.map((group) => [group.key, []]),
  );

  detail.evidence.forEach((record, sourceIndex) => {
    if (seen.has(record.evidenceId)) {
      excludedDuplicateIdentityCount += 1;
      return;
    }
    seen.add(record.evidenceId);
    rowsByGroup.get(groupFor(record.status, record.stale))?.push({
      context: { kind: "evidence", id: record.evidenceId },
      sourceIndex,
      title: record.title,
      statement: record.statement,
      status: record.status,
      statusLabel: evidenceStatusLabel(record.status, record.stale),
      evidenceClassLabel: EVIDENCE_CLASS_LABELS[record.evidenceClass],
      source: record.source,
    });
  });

  const groups = EVIDENCE_GROUPS.flatMap((group) => {
    const rows = rowsByGroup.get(group.key) ?? [];
    return rows.length > 0 ? [{ ...group, rows }] : [];
  });
  return {
    status: "ready",
    recordCount: groups.reduce((count, group) => count + group.rows.length, 0),
    excludedDuplicateIdentityCount,
    groups,
  };
}

export function projectEvidenceRegister(
  reviewIndex: ReviewIndex,
  reviewId: ReviewId,
  cases: readonly CaseDetail[],
): EvidenceRegisterProjection {
  const detail = resolveCurrentCase(reviewIndex, reviewId, cases);
  return detail ? projectEvidenceRegisterFromCase(detail) : { status: "unavailable" };
}
