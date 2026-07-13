import { fingerprintPrefix, stableFingerprint, type CanonicalReviewRunManifest } from "./canonical-review-run";
import type { ContractRecheckRecord } from "./contract-recheck";
import type { MergeContract } from "./merge-contract";
import type { Report } from "./mock-report";
import { reviewStateKeyForReport, type ReportReviewState } from "./review-state";

export const HUMAN_DECISION_LEDGER_SCHEMA_VERSION = "1.0";
export const HUMAN_DECISION_LEDGER_ENTRY_SCHEMA_VERSION = "1.0";
export const HUMAN_DECISION_LEDGER_STORAGE_KEY = "lintel.humanDecisionLedger.v1";
export const HUMAN_DECISION_LEDGER_ENTRY_LIMIT = 80;

export type HumanDecisionEventType =
  | "decision-recorded"
  | "decision-reaffirmed"
  | "decision-superseded"
  | "decision-withdrawn"
  | "risk-accepted"
  | "risk-acceptance-revoked"
  | "note-recorded";

export type HumanDecisionOutcome =
  | "approve"
  | "approve-with-accepted-risk"
  | "request-changes"
  | "tests-required"
  | "review-required"
  | "blocked"
  | "defer";

export type HumanDecisionApplicability =
  | "applicable"
  | "predates-current-head"
  | "partially-applicable"
  | "superseded"
  | "withdrawn"
  | "unavailable";

export type RecommendationDivergence =
  | "aligned"
  | "human-more-conservative"
  | "human-accepted-additional-risk"
  | "materially-different"
  | "unavailable";

export type HumanDecisionActor = {
  displayLabel: string;
  source: "local" | "github" | "imported" | "unknown";
  workspaceId?: string;
  memberId?: string;
  externalId?: string;
  role?: string;
};

export type HumanDecisionLedgerEntry = {
  entryId: string;
  schemaVersion: typeof HUMAN_DECISION_LEDGER_ENTRY_SCHEMA_VERSION;
  ledgerId: string;
  eventType: HumanDecisionEventType;
  outcome?: HumanDecisionOutcome;
  actor: HumanDecisionActor;
  reason?: string;
  repository: string;
  pullRequestNumber?: number;
  applicableHeadSha?: string;
  canonicalRunId?: string;
  reportId?: string;
  verificationPackId?: string;
  mergeContractId?: string;
  contractRecheckId?: string;
  referencedClauseIds: string[];
  referencedAssumptionIds: string[];
  referencedEvidenceIds: string[];
  acceptedRiskReferences: string[];
  supersedesEntryId?: string;
  reaffirmsEntryId?: string;
  withdrawsEntryId?: string;
  recordedAt: string;
  source: "decision-studio" | "merge-contract" | "assumption-registry" | "legacy" | "api" | "local";
  fingerprint: string;
};

export type HumanDecisionLedger = {
  ledgerId: string;
  schemaVersion: typeof HUMAN_DECISION_LEDGER_SCHEMA_VERSION;
  repository: string;
  pullRequestNumber?: number;
  reportLineage: {
    title: string;
    reportId?: string;
    canonicalRunId?: string;
    headSha?: string;
  };
  entries: HumanDecisionLedgerEntry[];
  latestEffectiveEntryId?: string;
  currentApplicability: HumanDecisionApplicability;
  createdAt: string;
  updatedAt: string;
  fingerprint: string;
  limitations: string[];
};

export type HumanDecisionProjection = {
  latestEffectiveEntry?: HumanDecisionLedgerEntry;
  currentApplicableEntry?: HumanDecisionLedgerEntry;
  activeAcceptedRisks: HumanDecisionLedgerEntry[];
  supersededEntryIds: string[];
  withdrawnEntryIds: string[];
  staleEntryIds: string[];
  latestActor?: HumanDecisionActor;
  latestTimestamp?: string;
  applicability: HumanDecisionApplicability;
  divergence: RecommendationDivergence;
  reaffirmationRequired: boolean;
};

export type HumanDecisionLedgerContext = {
  report: Report;
  canonicalRun?: CanonicalReviewRunManifest | null;
  mergeContract?: MergeContract | null;
  contractRecheck?: ContractRecheckRecord | null;
  verificationPackId?: string;
  currentHeadSha?: string;
};

export type HumanDecisionLedgerAppendInput = {
  eventType: HumanDecisionEventType;
  outcome?: HumanDecisionOutcome;
  actor?: Partial<HumanDecisionActor>;
  reason?: string;
  referencedClauseIds?: string[];
  referencedAssumptionIds?: string[];
  referencedEvidenceIds?: string[];
  acceptedRiskReferences?: string[];
  supersedesEntryId?: string;
  reaffirmsEntryId?: string;
  withdrawsEntryId?: string;
  source?: HumanDecisionLedgerEntry["source"];
  idempotencyKey?: string;
  recordedAt?: string;
};

function safeText(value: string | undefined | null, limit = 600) {
  if (!value) return undefined;
  const cleaned = value
    .replace(/diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/gm, "[raw diff omitted]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/\bsk-[a-z0-9_-]{8,}\b/gi, "[REDACTED]")
    .replace(/((?:openai_api_key|api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, limit) : undefined;
}

function boundedIds(values: string[] | undefined, limit = 20) {
  return [...new Set((values ?? []).flatMap((value) => {
    const cleaned = safeText(value, 140);
    return cleaned ? [cleaned] : [];
  }))].slice(0, limit);
}

function defaultActor(input?: Partial<HumanDecisionActor>): HumanDecisionActor {
  return {
    displayLabel: safeText(input?.displayLabel, 80) ?? "Local reviewer",
    source: input?.source === "github" || input?.source === "imported" || input?.source === "unknown" ? input.source : "local",
    workspaceId: safeText(input?.workspaceId, 120),
    memberId: safeText(input?.memberId, 120),
    externalId: safeText(input?.externalId, 120),
    role: safeText(input?.role, 80),
  };
}

export function humanDecisionLedgerKeyForReport(report: Report) {
  return reviewStateKeyForReport(report);
}

function ledgerIdFor(report: Report) {
  return `hdl_${stableFingerprint({
    repository: report.pr.repository,
    pullRequestNumber: report.pr.number,
    title: report.pr.title,
  }).slice(0, 14)}`;
}

function entryFingerprintBase(entry: Omit<HumanDecisionLedgerEntry, "entryId" | "fingerprint">) {
  return {
    schemaVersion: entry.schemaVersion,
    ledgerId: entry.ledgerId,
    eventType: entry.eventType,
    outcome: entry.outcome,
    actor: entry.actor,
    reason: entry.reason,
    repository: entry.repository,
    pullRequestNumber: entry.pullRequestNumber,
    applicableHeadSha: entry.applicableHeadSha,
    canonicalRunId: entry.canonicalRunId,
    reportId: entry.reportId,
    verificationPackId: entry.verificationPackId,
    mergeContractId: entry.mergeContractId,
    contractRecheckId: entry.contractRecheckId,
    referencedClauseIds: entry.referencedClauseIds,
    referencedAssumptionIds: entry.referencedAssumptionIds,
    referencedEvidenceIds: entry.referencedEvidenceIds,
    acceptedRiskReferences: entry.acceptedRiskReferences,
    supersedesEntryId: entry.supersedesEntryId,
    reaffirmsEntryId: entry.reaffirmsEntryId,
    withdrawsEntryId: entry.withdrawsEntryId,
    recordedAt: entry.recordedAt,
    source: entry.source,
  };
}

function createEntry(
  ledger: HumanDecisionLedger,
  context: HumanDecisionLedgerContext,
  input: HumanDecisionLedgerAppendInput,
): HumanDecisionLedgerEntry {
  const timestamp = input.recordedAt ?? new Date().toISOString();
  const base: Omit<HumanDecisionLedgerEntry, "entryId" | "fingerprint"> = {
    schemaVersion: HUMAN_DECISION_LEDGER_ENTRY_SCHEMA_VERSION,
    ledgerId: ledger.ledgerId,
    eventType: input.eventType,
    outcome: input.outcome,
    actor: defaultActor(input.actor),
    reason: safeText(input.reason, 700),
    repository: context.report.pr.repository,
    pullRequestNumber: context.report.pr.number,
    applicableHeadSha: context.currentHeadSha ?? context.canonicalRun?.headSha,
    canonicalRunId: context.canonicalRun?.runId,
    reportId: context.mergeContract?.reportId,
    verificationPackId: context.verificationPackId,
    mergeContractId: context.mergeContract?.contractId,
    contractRecheckId: context.contractRecheck?.recheckId,
    referencedClauseIds: boundedIds(input.referencedClauseIds),
    referencedAssumptionIds: boundedIds(input.referencedAssumptionIds),
    referencedEvidenceIds: boundedIds(input.referencedEvidenceIds),
    acceptedRiskReferences: boundedIds(input.acceptedRiskReferences),
    supersedesEntryId: safeText(input.supersedesEntryId, 120),
    reaffirmsEntryId: safeText(input.reaffirmsEntryId, 120),
    withdrawsEntryId: safeText(input.withdrawsEntryId, 120),
    recordedAt: timestamp,
    source: input.source ?? "decision-studio",
  };
  const fingerprint = stableFingerprint({ ...entryFingerprintBase(base), idempotencyKey: input.idempotencyKey });
  return {
    ...base,
    entryId: `hde_${fingerprint.slice(0, 14)}`,
    fingerprint,
  };
}

function fingerprintLedger(ledger: Omit<HumanDecisionLedger, "fingerprint">) {
  return stableFingerprint({
    schemaVersion: ledger.schemaVersion,
    ledgerId: ledger.ledgerId,
    repository: ledger.repository,
    pullRequestNumber: ledger.pullRequestNumber,
    reportLineage: ledger.reportLineage,
    entries: ledger.entries.map((entry) => entry.fingerprint),
    latestEffectiveEntryId: ledger.latestEffectiveEntryId,
    currentApplicability: ledger.currentApplicability,
    createdAt: ledger.createdAt,
    updatedAt: ledger.updatedAt,
    limitations: ledger.limitations,
  });
}

export function createEmptyHumanDecisionLedger(context: HumanDecisionLedgerContext, createdAt = new Date().toISOString()): HumanDecisionLedger {
  const base: Omit<HumanDecisionLedger, "fingerprint"> = {
    ledgerId: ledgerIdFor(context.report),
    schemaVersion: HUMAN_DECISION_LEDGER_SCHEMA_VERSION,
    repository: context.report.pr.repository,
    pullRequestNumber: context.report.pr.number,
    reportLineage: {
      title: safeText(context.report.pr.title, 180) ?? context.report.pr.title,
      reportId: context.mergeContract?.reportId,
      canonicalRunId: context.canonicalRun?.runId,
      headSha: context.currentHeadSha ?? context.canonicalRun?.headSha,
    },
    entries: [],
    latestEffectiveEntryId: undefined,
    currentApplicability: "unavailable",
    createdAt,
    updatedAt: createdAt,
    limitations: [],
  };
  return { ...base, fingerprint: fingerprintLedger(base) };
}

function normalizeLedger(ledger: HumanDecisionLedger, currentHeadSha?: string): HumanDecisionLedger {
  const projection = projectHumanDecisionLedger(ledger, currentHeadSha);
  const updated: Omit<HumanDecisionLedger, "fingerprint"> = {
    ...ledger,
    entries: [...ledger.entries]
      .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt))
      .slice(-HUMAN_DECISION_LEDGER_ENTRY_LIMIT),
    latestEffectiveEntryId: projection.latestEffectiveEntry?.entryId,
    currentApplicability: projection.applicability,
    limitations: ledger.limitations,
  };
  return { ...updated, fingerprint: fingerprintLedger(updated) };
}

export function appendHumanDecisionLedgerEntry(
  ledger: HumanDecisionLedger,
  context: HumanDecisionLedgerContext,
  input: HumanDecisionLedgerAppendInput,
) {
  const entry = createEntry(ledger, context, input);
  if (ledger.entries.some((existing) => existing.fingerprint === entry.fingerprint || existing.entryId === entry.entryId)) {
    return normalizeLedger(ledger, context.currentHeadSha ?? context.canonicalRun?.headSha);
  }
  const updated: HumanDecisionLedger = {
    ...ledger,
    entries: [...ledger.entries, entry].slice(-HUMAN_DECISION_LEDGER_ENTRY_LIMIT),
    updatedAt: entry.recordedAt,
  };
  return normalizeLedger(updated, context.currentHeadSha ?? context.canonicalRun?.headSha);
}

export function outcomeFromReviewState(state: ReportReviewState): HumanDecisionOutcome {
  if (state.status === "Ready to merge" || state.status === "Reviewed") return "approve";
  if (state.status === "Tests requested") return "tests-required";
  if (state.status === "Review required") return "review-required";
  if (state.status === "Blocked") return "blocked";
  return "request-changes";
}

export function historicalLedgerFromReviewState(context: HumanDecisionLedgerContext, state?: ReportReviewState | null) {
  const ledger = createEmptyHumanDecisionLedger(context);
  if (!state?.updatedAt) return ledger;
  return appendHumanDecisionLedgerEntry(ledger, context, {
    eventType: "decision-recorded",
    outcome: outcomeFromReviewState(state),
    reason: state.note || "Historical local review state normalized into the Human Decision Ledger.",
    actor: { displayLabel: state.owner === "Unassigned" ? "Unknown reviewer" : state.owner, source: "local" },
    source: "legacy",
    recordedAt: state.updatedAt,
    idempotencyKey: `legacy:${state.updatedAt}:${state.status}:${state.owner}`,
  });
}

export function projectHumanDecisionLedger(ledger: HumanDecisionLedger, currentHeadSha?: string): HumanDecisionProjection {
  const superseded = new Set<string>();
  const withdrawn = new Set<string>();
  const revokedRisks = new Set<string>();
  const sorted = [...ledger.entries].sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));

  for (const entry of sorted) {
    if (entry.supersedesEntryId) superseded.add(entry.supersedesEntryId);
    if (entry.eventType === "decision-withdrawn" && entry.withdrawsEntryId) withdrawn.add(entry.withdrawsEntryId);
    if (entry.eventType === "risk-acceptance-revoked") {
      for (const reference of entry.acceptedRiskReferences) revokedRisks.add(reference);
      if (entry.withdrawsEntryId) revokedRisks.add(entry.withdrawsEntryId);
    }
  }

  const decisionEntries = sorted.filter((entry) => (
    (entry.eventType === "decision-recorded" || entry.eventType === "decision-reaffirmed" || entry.eventType === "decision-superseded" || entry.eventType === "risk-accepted")
    && !superseded.has(entry.entryId)
    && !withdrawn.has(entry.entryId)
  ));
  const latestEffectiveEntry = decisionEntries[decisionEntries.length - 1];
  const currentApplicableEntry = latestEffectiveEntry && (!latestEffectiveEntry.applicableHeadSha || !currentHeadSha || latestEffectiveEntry.applicableHeadSha === currentHeadSha)
    ? latestEffectiveEntry
    : undefined;
  const staleEntryIds = sorted
    .filter((entry) => entry.applicableHeadSha && currentHeadSha && entry.applicableHeadSha !== currentHeadSha)
    .map((entry) => entry.entryId);
  const activeAcceptedRisks = sorted.filter((entry) => (
    entry.eventType === "risk-accepted"
    && !superseded.has(entry.entryId)
    && !withdrawn.has(entry.entryId)
    && !revokedRisks.has(entry.entryId)
    && (!entry.applicableHeadSha || !currentHeadSha || entry.applicableHeadSha === currentHeadSha)
  ));

  const applicability: HumanDecisionApplicability = !latestEffectiveEntry
    ? "unavailable"
    : withdrawn.has(latestEffectiveEntry.entryId)
      ? "withdrawn"
      : latestEffectiveEntry.applicableHeadSha && currentHeadSha && latestEffectiveEntry.applicableHeadSha !== currentHeadSha
        ? "predates-current-head"
        : "applicable";

  return {
    latestEffectiveEntry,
    currentApplicableEntry,
    activeAcceptedRisks,
    supersededEntryIds: [...superseded],
    withdrawnEntryIds: [...withdrawn],
    staleEntryIds,
    latestActor: sorted[sorted.length - 1]?.actor,
    latestTimestamp: sorted[sorted.length - 1]?.recordedAt,
    applicability,
    divergence: recommendationDivergence(ledger, latestEffectiveEntry),
    reaffirmationRequired: applicability === "predates-current-head",
  };
}

function recommendationRank(recommendation: Report["verdict"]["recommendation"]) {
  if (recommendation === "APPROVE") return 1;
  if (recommendation === "TESTS_REQUIRED") return 2;
  if (recommendation === "REVIEW_REQUIRED") return 3;
  if (recommendation === "BLOCK") return 4;
  return 3;
}

function outcomeRank(outcome?: HumanDecisionOutcome) {
  if (!outcome) return 0;
  if (outcome === "approve") return 1;
  if (outcome === "approve-with-accepted-risk") return 1;
  if (outcome === "tests-required") return 2;
  if (outcome === "review-required" || outcome === "request-changes") return 3;
  if (outcome === "blocked" || outcome === "defer") return 4;
  return 3;
}

export function recommendationDivergence(ledger: HumanDecisionLedger, entry?: HumanDecisionLedgerEntry): RecommendationDivergence {
  if (!entry?.outcome) return "unavailable";
  if (entry.outcome === "approve-with-accepted-risk") return "human-accepted-additional-risk";
  const recommendation = ledger.reportLineage.title ? undefined : undefined;
  void recommendation;
  return "unavailable";
}

export function recommendationDivergenceForReport(report: Report, entry?: HumanDecisionLedgerEntry): RecommendationDivergence {
  if (!entry?.outcome) return "unavailable";
  if (entry.outcome === "approve-with-accepted-risk") return "human-accepted-additional-risk";
  const recRank = recommendationRank(report.verdict.recommendation);
  const humanRank = outcomeRank(entry.outcome);
  const aligned =
    (report.verdict.recommendation === "APPROVE" && entry.outcome === "approve")
    || (report.verdict.recommendation === "TESTS_REQUIRED" && entry.outcome === "tests-required")
    || (report.verdict.recommendation === "REVIEW_REQUIRED" && (entry.outcome === "review-required" || entry.outcome === "request-changes"))
    || (report.verdict.recommendation === "BLOCK" && entry.outcome === "blocked");
  if (aligned) return "aligned";
  if (humanRank > recRank) return "human-more-conservative";
  return "materially-different";
}

function parseActor(value: unknown): HumanDecisionActor {
  if (!value || typeof value !== "object") return defaultActor({ source: "unknown", displayLabel: "Unknown actor" });
  const record = value as Record<string, unknown>;
  return defaultActor({
    displayLabel: typeof record.displayLabel === "string" ? record.displayLabel : "Unknown actor",
    source: record.source === "local" || record.source === "github" || record.source === "imported" || record.source === "unknown" ? record.source : "unknown",
    workspaceId: typeof record.workspaceId === "string" ? record.workspaceId : undefined,
    memberId: typeof record.memberId === "string" ? record.memberId : undefined,
    externalId: typeof record.externalId === "string" ? record.externalId : undefined,
    role: typeof record.role === "string" ? record.role : undefined,
  });
}

function parseEntry(value: unknown): HumanDecisionLedgerEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.entryId !== "string" || typeof record.ledgerId !== "string" || typeof record.recordedAt !== "string") return null;
  if (Number.isNaN(Date.parse(record.recordedAt))) return null;
  const eventType = typeof record.eventType === "string" ? record.eventType as HumanDecisionEventType : null;
  if (!eventType) return null;
  return {
    entryId: safeText(record.entryId, 140) ?? record.entryId,
    schemaVersion: HUMAN_DECISION_LEDGER_ENTRY_SCHEMA_VERSION,
    ledgerId: safeText(record.ledgerId, 140) ?? record.ledgerId,
    eventType,
    outcome: typeof record.outcome === "string" ? record.outcome as HumanDecisionOutcome : undefined,
    actor: parseActor(record.actor),
    reason: typeof record.reason === "string" ? safeText(record.reason, 700) : undefined,
    repository: typeof record.repository === "string" ? safeText(record.repository, 140) ?? record.repository : "unknown",
    pullRequestNumber: typeof record.pullRequestNumber === "number" ? record.pullRequestNumber : undefined,
    applicableHeadSha: typeof record.applicableHeadSha === "string" ? safeText(record.applicableHeadSha, 80) : undefined,
    canonicalRunId: typeof record.canonicalRunId === "string" ? safeText(record.canonicalRunId, 140) : undefined,
    reportId: typeof record.reportId === "string" ? safeText(record.reportId, 140) : undefined,
    verificationPackId: typeof record.verificationPackId === "string" ? safeText(record.verificationPackId, 140) : undefined,
    mergeContractId: typeof record.mergeContractId === "string" ? safeText(record.mergeContractId, 140) : undefined,
    contractRecheckId: typeof record.contractRecheckId === "string" ? safeText(record.contractRecheckId, 140) : undefined,
    referencedClauseIds: Array.isArray(record.referencedClauseIds) ? boundedIds(record.referencedClauseIds.filter((item): item is string => typeof item === "string")) : [],
    referencedAssumptionIds: Array.isArray(record.referencedAssumptionIds) ? boundedIds(record.referencedAssumptionIds.filter((item): item is string => typeof item === "string")) : [],
    referencedEvidenceIds: Array.isArray(record.referencedEvidenceIds) ? boundedIds(record.referencedEvidenceIds.filter((item): item is string => typeof item === "string")) : [],
    acceptedRiskReferences: Array.isArray(record.acceptedRiskReferences) ? boundedIds(record.acceptedRiskReferences.filter((item): item is string => typeof item === "string")) : [],
    supersedesEntryId: typeof record.supersedesEntryId === "string" ? safeText(record.supersedesEntryId, 140) : undefined,
    reaffirmsEntryId: typeof record.reaffirmsEntryId === "string" ? safeText(record.reaffirmsEntryId, 140) : undefined,
    withdrawsEntryId: typeof record.withdrawsEntryId === "string" ? safeText(record.withdrawsEntryId, 140) : undefined,
    recordedAt: record.recordedAt,
    source: record.source === "decision-studio" || record.source === "merge-contract" || record.source === "assumption-registry" || record.source === "legacy" || record.source === "api" || record.source === "local" ? record.source : "local",
    fingerprint: typeof record.fingerprint === "string" ? record.fingerprint : stableFingerprint(record),
  };
}

function parseLedger(value: unknown, context: HumanDecisionLedgerContext): HumanDecisionLedger | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.ledgerId !== "string" || !Array.isArray(record.entries)) return null;
  const entries = record.entries.flatMap((item) => {
    const parsed = parseEntry(item);
    return parsed ? [parsed] : [];
  });
  const createdAt = typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString();
  const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : createdAt;
  const base: HumanDecisionLedger = {
    ledgerId: record.ledgerId,
    schemaVersion: HUMAN_DECISION_LEDGER_SCHEMA_VERSION,
    repository: typeof record.repository === "string" ? record.repository : context.report.pr.repository,
    pullRequestNumber: typeof record.pullRequestNumber === "number" ? record.pullRequestNumber : context.report.pr.number,
    reportLineage: {
      title: typeof (record.reportLineage as { title?: unknown } | undefined)?.title === "string" ? (record.reportLineage as { title: string }).title : context.report.pr.title,
      reportId: context.mergeContract?.reportId,
      canonicalRunId: context.canonicalRun?.runId,
      headSha: context.currentHeadSha ?? context.canonicalRun?.headSha,
    },
    entries,
    latestEffectiveEntryId: typeof record.latestEffectiveEntryId === "string" ? record.latestEffectiveEntryId : undefined,
    currentApplicability: "unavailable",
    createdAt,
    updatedAt,
    limitations: Array.isArray(record.limitations) ? record.limitations.filter((item): item is string => typeof item === "string").map((item) => safeText(item, 220) ?? item).slice(0, 8) : [],
    fingerprint: typeof record.fingerprint === "string" ? record.fingerprint : "",
  };
  return normalizeLedger(base, context.currentHeadSha ?? context.canonicalRun?.headSha);
}

function readAllLedgers(storage: Storage) {
  try {
    const stored = storage.getItem(HUMAN_DECISION_LEDGER_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function writeAllLedgers(storage: Storage, value: Record<string, unknown>) {
  storage.setItem(HUMAN_DECISION_LEDGER_STORAGE_KEY, JSON.stringify(value));
}

export function readHumanDecisionLedger(storage: Storage, key: string, context: HumanDecisionLedgerContext, reviewState?: ReportReviewState | null) {
  const ledgers = readAllLedgers(storage);
  const parsed = parseLedger(ledgers[key], context);
  if (parsed) return parsed;
  return historicalLedgerFromReviewState(context, reviewState);
}

export function writeHumanDecisionLedger(storage: Storage, key: string, ledger: HumanDecisionLedger) {
  const ledgers = readAllLedgers(storage);
  ledgers[key] = ledger;
  writeAllLedgers(storage, ledgers);
  return ledger;
}

export function appendHumanDecisionLedgerEntryToStorage(
  storage: Storage,
  key: string,
  ledger: HumanDecisionLedger,
  context: HumanDecisionLedgerContext,
  input: HumanDecisionLedgerAppendInput,
) {
  const updated = appendHumanDecisionLedgerEntry(ledger, context, input);
  return writeHumanDecisionLedger(storage, key, updated);
}

export function humanDecisionLedgerSummary(ledger: HumanDecisionLedger, report: Report, currentHeadSha?: string) {
  const projection = projectHumanDecisionLedger(ledger, currentHeadSha);
  const divergence = recommendationDivergenceForReport(report, projection.latestEffectiveEntry);
  if (!projection.latestEffectiveEntry) return "No human decision recorded.";
  return `Decision ${projection.latestEffectiveEntry.outcome?.replaceAll("-", " ") ?? "unknown"}; applies to ${fingerprintPrefix(projection.latestEffectiveEntry.applicableHeadSha)}; ${projection.applicability.replaceAll("-", " ")}; divergence ${divergence.replaceAll("-", " ")}.`;
}

