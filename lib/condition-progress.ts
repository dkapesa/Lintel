import type { Report } from "./mock-report";
import { decisionConditions } from "./report-quality";

export const CONDITION_PROGRESS_STORAGE_KEY = "lintel.conditionProgress.v1";

function stableHash(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function normalized(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function reportConditions(report: Report) {
  return report.verdict.recommendation === "APPROVE" ? [] : decisionConditions(report.conditionsBeforeMerge);
}

export function conditionProgressReportKey(report: Report, conditions = reportConditions(report)) {
  return stableHash([
    report.pr.repository,
    report.pr.title,
    report.pr.branch,
    String(report.pr.number),
    report.pr.reviewProfile ?? "standard",
    conditions.map(normalized).join("|"),
  ].join("\n"));
}

export function conditionKey(condition: string) {
  return stableHash(normalized(condition));
}

export function readConditionProgress(storage: Storage, report: Report, conditions = reportConditions(report)) {
  try {
    const stored = storage.getItem(CONDITION_PROGRESS_STORAGE_KEY);
    if (!stored) return new Set<string>();
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return new Set<string>();
    const reportKey = conditionProgressReportKey(report, conditions);
    const value = parsed[reportKey];
    if (!Array.isArray(value)) return new Set<string>();

    return new Set(value.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set<string>();
  }
}

export function writeConditionProgress(
  storage: Storage,
  report: Report,
  conditions: string[],
  clearedConditionKeys: Set<string>,
) {
  const stored = storage.getItem(CONDITION_PROGRESS_STORAGE_KEY);
  let parsed: Record<string, unknown> = {};

  try {
    const value: unknown = stored ? JSON.parse(stored) : {};
    if (isRecord(value)) parsed = value;
  } catch {
    parsed = {};
  }

  parsed[conditionProgressReportKey(report, conditions)] = [...clearedConditionKeys];
  storage.setItem(CONDITION_PROGRESS_STORAGE_KEY, JSON.stringify(parsed));
}

export function conditionProgressSummary(clearedCount: number, totalCount: number) {
  if (totalCount === 0) return "No merge conditions detected.";
  if (clearedCount === totalCount) return "All conditions cleared";
  return `${clearedCount}/${totalCount} cleared`;
}

export function workspaceConditionProgressSummary(clearedCount: number, totalCount: number) {
  if (totalCount === 0) return "No merge conditions detected.";
  const remaining = totalCount - clearedCount;
  if (remaining === 0) return "All conditions cleared";
  if (clearedCount === 0) return `0/${totalCount} conditions cleared`;
  return `${remaining} ${remaining === 1 ? "condition" : "conditions"} remaining`;
}
