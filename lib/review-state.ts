import type { Report } from "./mock-report";

export const REVIEW_STATE_STORAGE_KEY = "lintel.reviewState.v1";
export const LEGACY_WORKSPACE_STATUS_STORAGE_KEY = "lintel.workspaceStatus.v1";

export const REVIEW_STATUSES = [
  "Needs work",
  "Tests requested",
  "Review required",
  "Blocked",
  "Ready to merge",
  "Reviewed",
  "Archived",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReportReviewState = {
  status: ReviewStatus;
  note: string;
  updatedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && (REVIEW_STATUSES as readonly string[]).includes(value);
}

function normalizeKeyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function reportInputLabel(report: Report) {
  if (report.pr.branch === "github-pr") return "GitHub PR import";
  if (report.pr.branch === "sample") return "Sample";
  if (report.pr.branch === "pasted-diff") return "Pasted diff";
  return report.pr.branch || "Legacy report";
}

function legacyStatus(value: unknown): ReviewStatus | null {
  if (value === "Needs work") return "Needs work";
  if (value === "Conditions met") return "Ready to merge";
  if (value === "Merged") return "Reviewed";
  if (value === "Dismissed") return "Archived";
  return null;
}

function sanitizeNote(value: string) {
  return value
    .split(/\r?\n/)
    .filter((line) => !/(diff --git|@@|--- a\/|\+\+\+ b\/)/.test(line))
    .join("\n")
    .slice(0, 1000);
}

export function reviewStateKey(repository: string, title: string, inputLabel: string) {
  return [repository, title, inputLabel].map(normalizeKeyPart).join("\u001f");
}

export function reviewStateKeyForReport(report: Report) {
  return reviewStateKey(report.pr.repository, report.pr.title, reportInputLabel(report));
}

export function defaultReviewStatus(report: Report): ReviewStatus {
  if (report.verdict.recommendation === "APPROVE") return "Ready to merge";
  if (report.verdict.recommendation === "TESTS_REQUIRED") return "Tests requested";
  if (report.verdict.recommendation === "REVIEW_REQUIRED") return "Review required";
  if (report.verdict.recommendation === "BLOCK") return "Blocked";
  return "Needs work";
}

export function defaultReviewState(report: Report): ReportReviewState {
  return {
    status: defaultReviewStatus(report),
    note: "",
    updatedAt: null,
  };
}

function parseReviewState(value: unknown): ReportReviewState | null {
  if (!isRecord(value) || !isReviewStatus(value.status)) return null;

  return {
    status: value.status,
    note: typeof value.note === "string" ? sanitizeNote(value.note) : "",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export function readReviewStates(storage: Storage) {
  const states: Record<string, ReportReviewState> = {};

  try {
    const stored = storage.getItem(REVIEW_STATE_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};

    if (isRecord(parsed)) {
      for (const [key, value] of Object.entries(parsed)) {
        const state = parseReviewState(value);
        if (state) states[key] = state;
      }
    }
  } catch {
    // Ignore invalid local workflow state.
  }

  try {
    const legacyStored = storage.getItem(LEGACY_WORKSPACE_STATUS_STORAGE_KEY);
    const legacyParsed: unknown = legacyStored ? JSON.parse(legacyStored) : {};

    if (isRecord(legacyParsed)) {
      for (const [key, value] of Object.entries(legacyParsed)) {
        if (states[key]) continue;
        const status = legacyStatus(value);
        if (status) states[key] = { status, note: "", updatedAt: null };
      }
    }
  } catch {
    // Ignore invalid legacy state.
  }

  return states;
}

export function readReviewState(storage: Storage, report: Report) {
  return readReviewStates(storage)[reviewStateKeyForReport(report)] ?? defaultReviewState(report);
}

export function writeReviewState(storage: Storage, key: string, state: ReportReviewState) {
  const current = readReviewStates(storage);
  const nextState: ReportReviewState = {
    status: state.status,
    note: sanitizeNote(state.note),
    updatedAt: new Date().toISOString(),
  };

  current[key] = nextState;
  storage.setItem(REVIEW_STATE_STORAGE_KEY, JSON.stringify(current));
  return nextState;
}

export function removeReviewState(storage: Storage, key: string) {
  const current = readReviewStates(storage);
  delete current[key];
  storage.setItem(REVIEW_STATE_STORAGE_KEY, JSON.stringify(current));
}

export function clearReviewStates(storage: Storage) {
  storage.removeItem(REVIEW_STATE_STORAGE_KEY);
  storage.removeItem(LEGACY_WORKSPACE_STATUS_STORAGE_KEY);
}
