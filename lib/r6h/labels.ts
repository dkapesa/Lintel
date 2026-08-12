import type { RequirementImportance, RequirementStatus } from "../workspace-v2/view-model";

export const REQUIREMENT_STATUS_LABELS = {
  open: "Open",
  satisfied: "Satisfied",
  accepted: "Accepted",
  invalidated: "Invalidated",
  superseded: "Superseded",
  stale: "Stale",
  unavailable: "Unavailable",
} as const satisfies Readonly<Record<RequirementStatus, string>>;

export const REQUIREMENT_IMPORTANCE_LABELS = {
  blocking: "Blocking",
  advisory: "Advisory",
} as const satisfies Readonly<Record<RequirementImportance, string>>;

export function requirementStatusLabel(status: RequirementStatus, stale: boolean): string {
  const label = REQUIREMENT_STATUS_LABELS[status];
  return stale && status !== "stale" ? `${label} · stale` : label;
}
