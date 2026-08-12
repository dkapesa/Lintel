import type { EvidenceClass, EvidenceStatus } from "../workspace-v2/view-model";

export const EVIDENCE_STATUS_LABELS = {
  present: "Present",
  missing: "Missing",
  unverified: "Unverified",
  confirmed: "Confirmed",
  stale: "Stale",
  "not-applicable": "Not applicable",
} as const satisfies Readonly<Record<EvidenceStatus, string>>;

export const EVIDENCE_CLASS_LABELS = {
  "externally-verified": "Externally verified",
  "directly-observed": "Directly observed",
  "human-confirmed": "Human confirmed",
  "builder-declared": "Builder declared",
  "model-inferred": "Model inferred",
  assumption: "Assumption",
  unknown: "Unknown",
} as const satisfies Readonly<Record<EvidenceClass, string>>;

export function evidenceStatusLabel(status: EvidenceStatus, stale: boolean): string {
  const label = EVIDENCE_STATUS_LABELS[status];
  return stale && status !== "stale" ? `${label} · stale` : label;
}
