import type { RiskLevel } from "../workspace-v2/view-model";

export const CHANGED_CONTENT_UNAVAILABLE_MODE = "Lintel records the changed paths for this analysis. Changed file content is not part of the stored analysis, so no diff is available here.";

export const CHANGED_CONTENT_UNAVAILABLE_FILE = "No file content is stored for this analysis, so this change cannot be read line by line here.";

export function lineCountLabel(additions: number | null, deletions: number | null): string {
  if (additions === null && deletions === null) return "Lines not recorded";
  if (additions === null) return `Additions not recorded · −${deletions}`;
  if (deletions === null) return `+${additions} · deletions not recorded`;
  return `+${additions} · −${deletions}`;
}

export function riskLabel(risk: RiskLevel | null): string {
  return risk ?? "Risk not recorded";
}

export function recordedLocationCountLabel(count: number): string {
  if (count === 0) return "None recorded";
  return count === 1 ? "1 recorded location" : `${count} recorded locations`;
}

export function recordedLocationLabel(startLine: number, endLine: number): string {
  return startLine === endLine ? `Line ${startLine}` : `Lines ${startLine}–${endLine}`;
}
