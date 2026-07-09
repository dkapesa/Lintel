import type { Report } from "./mock-report";
import { reviewStateKeyForReport, type ReviewStatus } from "./review-state";

export const DECISION_HISTORY_STORAGE_KEY = "lintel.decisionHistory.v1";
const MAX_DECISION_HISTORY_EVENTS = 60;

export type DecisionHistoryEventType =
  | "report-generated"
  | "recommendation-assigned"
  | "review-state-changed"
  | "condition-cleared"
  | "condition-reopened"
  | "merge-summary-copied"
  | "reviewer-note-updated"
  | "ownership-changed";

export type DecisionHistoryEvent = {
  id: string;
  type: DecisionHistoryEventType;
  title: string;
  timestamp: string;
  detail: string;
  previousState?: string;
  nextState?: string;
  label: "Local" | "Report";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeText(value: string) {
  return value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function eventId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseEvent(value: unknown): DecisionHistoryEvent | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.title !== "string" || typeof value.timestamp !== "string") return null;
  if (typeof value.detail !== "string" || Number.isNaN(Date.parse(value.timestamp))) return null;

  return {
    id: value.id,
    type: typeof value.type === "string" ? value.type as DecisionHistoryEventType : "report-generated",
    title: sanitizeText(value.title),
    timestamp: value.timestamp,
    detail: sanitizeText(value.detail),
    previousState: typeof value.previousState === "string" ? sanitizeText(value.previousState) : undefined,
    nextState: typeof value.nextState === "string" ? sanitizeText(value.nextState) : undefined,
    label: value.label === "Report" ? "Report" : "Local",
  };
}

function readAllDecisionHistory(storage: Storage) {
  try {
    const stored = storage.getItem(DECISION_HISTORY_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeAllDecisionHistory(storage: Storage, value: Record<string, unknown>) {
  storage.setItem(DECISION_HISTORY_STORAGE_KEY, JSON.stringify(value));
}

export function decisionHistoryKeyForReport(report: Report) {
  return reviewStateKeyForReport(report);
}

export function initialDecisionHistory(report: Report, timestamp = new Date().toISOString()): DecisionHistoryEvent[] {
  return [
    {
      id: `${timestamp}-recommendation`,
      type: "recommendation-assigned",
      title: "Recommendation assigned",
      timestamp,
      detail: `${report.verdict.recommendation.replaceAll("_", " ")} with ${report.verdict.riskLevel} risk and ${report.conditionsBeforeMerge.length} merge conditions.`,
      nextState: report.verdict.recommendation,
      label: "Report",
    },
    {
      id: `${timestamp}-generated`,
      type: "report-generated",
      title: "Report generated",
      timestamp,
      detail: "Lintel created a merge-readiness report from the current PR input. Raw diff content is not stored in this history.",
      label: "Report",
    },
  ];
}

export function readDecisionHistory(storage: Storage, key: string) {
  const parsed = readAllDecisionHistory(storage);
  const value = parsed[key];
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((item) => {
      const event = parseEvent(item);
      return event ? [event] : [];
    })
    .slice(0, MAX_DECISION_HISTORY_EVENTS);
}

export function ensureDecisionHistory(storage: Storage, key: string, report: Report) {
  const existing = readDecisionHistory(storage, key);
  if (existing.length > 0) return existing;

  const seeded = initialDecisionHistory(report);
  const parsed = readAllDecisionHistory(storage);
  parsed[key] = seeded;
  writeAllDecisionHistory(storage, parsed);
  return seeded;
}

export function appendDecisionHistoryEvent(
  storage: Storage,
  key: string,
  event: Omit<DecisionHistoryEvent, "id" | "timestamp" | "label"> & {
    timestamp?: string;
    label?: DecisionHistoryEvent["label"];
  },
) {
  const parsed = readAllDecisionHistory(storage);
  const existing = readDecisionHistory(storage, key);
  const nextEvent: DecisionHistoryEvent = {
    id: eventId(),
    type: event.type,
    title: sanitizeText(event.title),
    timestamp: event.timestamp ?? new Date().toISOString(),
    detail: sanitizeText(event.detail),
    previousState: event.previousState ? sanitizeText(event.previousState) : undefined,
    nextState: event.nextState ? sanitizeText(event.nextState) : undefined,
    label: event.label ?? "Local",
  };

  parsed[key] = [nextEvent, ...existing].slice(0, MAX_DECISION_HISTORY_EVENTS);
  writeAllDecisionHistory(storage, parsed);
  return parsed[key] as DecisionHistoryEvent[];
}

export function reviewStatusChangeEvent(previousState: ReviewStatus, nextState: ReviewStatus) {
  return {
    type: "review-state-changed" as const,
    title: "Local review state changed",
    detail: `Reviewer state changed from ${previousState} to ${nextState}.`,
    previousState,
    nextState,
  };
}

export function ownershipChangeEvent(previousOwner: string, nextOwner: string) {
  return {
    type: "ownership-changed" as const,
    title: "Local owner changed",
    detail: `Local ownership changed from ${previousOwner} to ${nextOwner}.`,
    previousState: previousOwner,
    nextState: nextOwner,
  };
}

export function removeDecisionHistory(storage: Storage, key: string) {
  const parsed = readAllDecisionHistory(storage);
  delete parsed[key];
  writeAllDecisionHistory(storage, parsed);
}

export function clearDecisionHistory(storage: Storage) {
  storage.removeItem(DECISION_HISTORY_STORAGE_KEY);
}
