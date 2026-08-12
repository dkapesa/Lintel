import { resolveCurrentCase, type ContextRef, type ReviewId, type ReviewIndex } from "../r6c/index";
import type { CaseDetail, RequirementStatus } from "../workspace-v2/view-model";
import { REQUIREMENT_IMPORTANCE_LABELS, requirementStatusLabel } from "./labels";

export const REQUIREMENT_GROUPS = [
  { key: "remaining", label: "Remaining" },
  { key: "stale", label: "Stale" },
  { key: "satisfied", label: "Satisfied" },
  { key: "inactive-or-unavailable", label: "Inactive or unavailable" },
] as const;

export type RequirementGroupKey = (typeof REQUIREMENT_GROUPS)[number]["key"];

export type RequirementRegisterRow = Readonly<{
  context: ContextRef;
  sourceIndex: number;
  title: string;
  statement: string;
  statusLabel: string;
  importanceLabel: string;
  evidenceRequired: string;
}>;

export type RequirementRegisterProjection =
  | Readonly<{ status: "unavailable" }>
  | Readonly<{
      status: "ready";
      recordCount: number;
      excludedDuplicateIdentityCount: number;
      groups: readonly Readonly<{ key: RequirementGroupKey; label: string; rows: readonly RequirementRegisterRow[] }>[];
    }>;

function groupFor(status: RequirementStatus, stale: boolean): RequirementGroupKey {
  if (status === "open") return "remaining";
  if (stale || status === "stale") return "stale";
  if (status === "satisfied" || status === "accepted") return "satisfied";
  return "inactive-or-unavailable";
}

export function projectRequirementRegisterFromCase(detail: CaseDetail): Extract<RequirementRegisterProjection, { status: "ready" }> {
  const seen = new Set<string>();
  let excludedDuplicateIdentityCount = 0;
  const rowsByGroup = new Map<RequirementGroupKey, RequirementRegisterRow[]>(
    REQUIREMENT_GROUPS.map((group) => [group.key, []]),
  );

  detail.requirements.forEach((requirement, sourceIndex) => {
    if (seen.has(requirement.requirementId)) {
      excludedDuplicateIdentityCount += 1;
      return;
    }
    seen.add(requirement.requirementId);
    rowsByGroup.get(groupFor(requirement.status, requirement.stale))?.push({
      context: { kind: "requirement", id: requirement.requirementId },
      sourceIndex,
      title: requirement.title,
      statement: requirement.statement,
      statusLabel: requirementStatusLabel(requirement.status, requirement.stale),
      importanceLabel: REQUIREMENT_IMPORTANCE_LABELS[requirement.importance],
      evidenceRequired: requirement.evidenceRequired,
    });
  });

  const groups = REQUIREMENT_GROUPS.flatMap((group) => {
    const rows = rowsByGroup.get(group.key) ?? [];
    return rows.length > 0 ? [{ ...group, rows }] : [];
  });
  return {
    status: "ready",
    recordCount: groups.reduce((total, group) => total + group.rows.length, 0),
    excludedDuplicateIdentityCount,
    groups,
  };
}

export function projectRequirementRegister(
  reviewIndex: ReviewIndex,
  reviewId: ReviewId,
  cases: readonly CaseDetail[],
): RequirementRegisterProjection {
  const detail = resolveCurrentCase(reviewIndex, reviewId, cases);
  return detail ? projectRequirementRegisterFromCase(detail) : { status: "unavailable" };
}
