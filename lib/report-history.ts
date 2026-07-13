import type { CanonicalReviewRunManifest } from "./canonical-review-run";
import type { ChangePassport } from "./change-passport";
import type { MergeContract } from "./merge-contract";
import type { VerificationPack } from "./verification-pack";
import type { Report } from "./mock-report";
import { reviewProfileLabel } from "./review-profiles";

export const REPORT_HISTORY_STORAGE_KEY = "lintel.reportHistory.v1";
export const MAX_REPORT_HISTORY = 10;

export type ReportHistorySource = "ai" | "deterministic";

export type ReportHistoryEntry = {
  report: Report;
  source: ReportHistorySource;
  canonicalRun?: CanonicalReviewRunManifest;
  changePassport?: ChangePassport;
  mergeContract?: MergeContract;
  verificationPack?: VerificationPack;
  inputLabel: string;
  createdAt: string;
  metadata: {
    title: string;
    repository: string;
    recommendation: Report["verdict"]["recommendation"];
    riskScore: number;
    reviewProfile: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReport(value: unknown): value is Report {
  if (!isRecord(value) || !isRecord(value.pr) || !isRecord(value.verdict) || !isRecord(value.reviews)) return false;
  return typeof value.pr.title === "string"
    && typeof value.pr.repository === "string"
    && typeof value.pr.branch === "string"
    && typeof value.verdict.recommendation === "string"
    && typeof value.verdict.riskScore === "number"
    && Array.isArray(value.changedFiles)
    && Array.isArray(value.findings)
    && Array.isArray(value.missingTests)
    && Array.isArray(value.suggestedTests)
    && Array.isArray(value.reviewerChecklist)
    && Array.isArray(value.conditionsBeforeMerge);
}

function hasRawDiff(report: Report) {
  return /diff --git|@@|(?:^|\\n)(?:--- a\/|\+\+\+ b\/)/m.test(JSON.stringify(report));
}

export function reportInputLabel(report: Report) {
  if (report.pr.branch === "github-pr") return "GitHub PR import";
  if (report.pr.branch === "sample") return "Sample";
  if (report.pr.branch === "pasted-diff") return "Pasted diff";
  return report.pr.branch || "Legacy report";
}

function historyEntry(value: unknown): ReportHistoryEntry | null {
  if (!isRecord(value) || !isReport(value.report) || hasRawDiff(value.report)) return null;
  if (value.source !== "ai" && value.source !== "deterministic") return null;
  if (typeof value.createdAt !== "string" || Number.isNaN(Date.parse(value.createdAt))) return null;

  return {
    report: value.report,
    source: value.source,
    canonicalRun: isRecord(value.canonicalRun) ? value.canonicalRun as CanonicalReviewRunManifest : undefined,
    changePassport: isRecord(value.changePassport) ? value.changePassport as ChangePassport : undefined,
    mergeContract: isRecord(value.mergeContract) ? value.mergeContract as MergeContract : undefined,
    verificationPack: isRecord(value.verificationPack) ? value.verificationPack as VerificationPack : undefined,
    inputLabel: reportInputLabel(value.report),
    createdAt: value.createdAt,
    metadata: {
      title: value.report.pr.title,
      repository: value.report.pr.repository,
      recommendation: value.report.verdict.recommendation,
      riskScore: value.report.verdict.riskScore,
      reviewProfile: reviewProfileLabel(value.report.pr.reviewProfile),
    },
  };
}

function writeReportHistory(storage: Storage, entries: ReportHistoryEntry[]) {
  storage.setItem(REPORT_HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_REPORT_HISTORY)));
  return entries.slice(0, MAX_REPORT_HISTORY);
}

export function readReportHistory(storage: Storage): ReportHistoryEntry[] {
  try {
    const stored = storage.getItem(REPORT_HISTORY_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Invalid history");

    const entries = parsed.flatMap((item) => {
      const entry = historyEntry(item);
      return entry ? [entry] : [];
    }).slice(0, MAX_REPORT_HISTORY);

    if (entries.length !== parsed.length) writeReportHistory(storage, entries);
    return entries;
  } catch {
    storage.removeItem(REPORT_HISTORY_STORAGE_KEY);
    return [];
  }
}

export function addReportToHistory(
  storage: Storage,
  report: Report,
  source: ReportHistorySource,
  canonicalRun?: CanonicalReviewRunManifest,
  changePassport?: ChangePassport,
  mergeContract?: MergeContract,
  verificationPack?: VerificationPack,
) {
  const existing = readReportHistory(storage);
  if (hasRawDiff(report)) return existing;
  let createdAt = new Date().toISOString();
  while (existing.some((entry) => entry.createdAt === createdAt)) {
    createdAt = new Date(Date.parse(createdAt) + 1).toISOString();
  }

  const entry: ReportHistoryEntry = {
    report,
    source,
    canonicalRun,
    changePassport,
    mergeContract,
    verificationPack,
    inputLabel: reportInputLabel(report),
    createdAt,
    metadata: {
      title: report.pr.title,
      repository: report.pr.repository,
      recommendation: report.verdict.recommendation,
      riskScore: report.verdict.riskScore,
      reviewProfile: reviewProfileLabel(report.pr.reviewProfile),
    },
  };

  try {
    return writeReportHistory(storage, [entry, ...existing]);
  } catch {
    return existing;
  }
}

export function deleteReportFromHistory(storage: Storage, createdAt: string) {
  const entries = readReportHistory(storage).filter((entry) => entry.createdAt !== createdAt);
  try {
    return writeReportHistory(storage, entries);
  } catch {
    return entries;
  }
}

export function clearReportHistory(storage: Storage) {
  try {
    storage.removeItem(REPORT_HISTORY_STORAGE_KEY);
  } catch {
    // Browser storage can be unavailable in restricted modes.
  }
  return [];
}
