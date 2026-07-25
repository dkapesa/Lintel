/* R2F — shared operations projection.

   ONE typed, strictly read-only projection over the real local Case Files
   (`lintel.reportHistory.v1`) consumed by both Review Operations (/review-
   operations) and Team (/team). It derives operational facts from existing
   domain readers only — it never parses reports itself, never re-interprets a
   Human Decision, and never writes storage.

   Truthfulness contract:
     • exact durable identity is `ReportHistoryEntry.createdAt`; the exact Case
       File and Workspace links are built only from it (never from title,
       repository/PR, list position or the current clock);
     • Human Decision interpretation is delegated wholesale to
       `projectHumanDecisionLedger` — this module only reads its result;
     • operational grouping mirrors the authoritative Workspace precedence in
       `lib/workspace-v2/queue-projection.ts` (Needs attention → Review → Ready
       → Reviewed) and reuses its labels/order so the two never diverge;
     • every read is wrapped once in the existing `readOnlyStorage` guard, so a
       self-healing read helper (report history pruning, ledger normalisation)
       can never persist during an ordinary operations read;
     • a recommendation is never treated as a Human Decision; an accepted-risk
       decision is flagged, never presented as a clean approval;
     • present-but-unreadable history is reported as `unavailable`, distinct
       from a genuinely empty device; no fixture is ever substituted. */

import {
  conditionKey,
  readConditionProgress,
  reportConditions,
} from "./condition-progress";
import {
  humanDecisionLedgerKeyForReport,
  projectHumanDecisionLedger,
  readHumanDecisionLedger,
  type HumanDecisionLedgerContext,
  type HumanDecisionOutcome,
} from "./human-decision-ledger";
import type { Report } from "./mock-report";
import {
  readReportHistory,
  REPORT_HISTORY_STORAGE_KEY,
  type ReportHistoryEntry,
} from "./report-history";
import {
  defaultReviewState,
  readReviewStates,
  reviewStateKeyForReport,
  type ReportReviewState,
  type ReviewStatus,
} from "./review-state";
import {
  GROUP_LABEL,
  GROUP_ORDER,
} from "./workspace-v2/queue-projection";
import type { QueueGroupId } from "./workspace-v2/view-model";
import { readOnlyStorage } from "./workspace-v2/read-only-storage";

/* The four operational groups are exactly the Workspace's four groups. */
export type OperationsGroupId = QueueGroupId;
export const OPERATIONS_GROUP_ORDER: readonly OperationsGroupId[] = GROUP_ORDER;
export const OPERATIONS_GROUP_LABEL: Record<OperationsGroupId, string> = GROUP_LABEL;

export type OperationsGroupBasis =
  | "review-state"
  | "human-decision"
  | "blocking-state"
  | "recommendation-fallback";

export type OperationsProvenance =
  | "github-pr"
  | "pasted-diff"
  | "sample"
  | "local";

/* The current, head-applicable Human Decision as it should be shown next to a
   case. `none` = no effective decision; `applicable` = an effective decision
   that still binds the current head; `stale` = an effective decision that no
   longer authoritatively describes the current head (predates it, was
   withdrawn, or is awaiting reaffirmation). A recommendation is NEVER mapped
   into this type. */
export type OperationsDecisionState =
  | { kind: "none" }
  | {
      kind: "applicable";
      outcome: HumanDecisionOutcome;
      acceptedRisk: boolean;
      actorLabel: string;
      recordedAt: string;
    }
  | {
      kind: "stale";
      reason: "predates-current-head" | "withdrawn";
      outcome?: HumanDecisionOutcome;
      actorLabel?: string;
      recordedAt?: string;
    };

/* One durable, classifiable Case File. */
export type OperationsCase = {
  /* exact durable identity (`ReportHistoryEntry.createdAt`) — the list key. */
  reportId: string;
  caseFileHref: string;
  workspaceHref: string;
  title: string;
  repository: string;
  repositoryKnown: boolean;
  pullRequestNumber?: number;
  changeLabel: string;
  recommendation: Report["verdict"]["recommendation"];
  recommendationLabel: string;
  riskScore: number;
  riskLevel: Report["verdict"]["riskLevel"];
  blockingRequirementCount: number;
  missingProofCount: number;
  conditionsTotal: number;
  conditionsCleared: number;
  unresolvedConditions: number;
  reviewStatus: ReviewStatus;
  reviewStateRecorded: boolean;
  ownerLabel: string;
  ownerAssigned: boolean;
  decision: OperationsDecisionState;
  acceptedRisk: boolean;
  provenance: OperationsProvenance;
  provenanceLabel: string;
  sourceLabel: string;
  reviewProfile: string;
  createdAt: string;
  group: OperationsGroupId;
  groupBasis: OperationsGroupBasis;
};

export type OperationsProjectionStatus = "empty" | "local" | "unavailable";

export type OperationsProjection = {
  status: OperationsProjectionStatus;
  cases: OperationsCase[];
};

/* How a caller resolves the review state for one entry. Review Operations reads
   the global review-state store; Team reads its workspace-scoped variant. Both
   report whether the resolved state was genuinely recorded (not a
   recommendation-derived default) and unambiguous for this exact entry. */
export type ReviewStateResolution = {
  state: ReportReviewState;
  recorded: boolean;
};

export type ReviewStateResolver = (entry: ReportHistoryEntry) => ReviewStateResolution;

function recommendationLabel(value: Report["verdict"]["recommendation"]) {
  if (value === "APPROVE") return "Ready to merge";
  if (value === "TESTS_REQUIRED") return "Tests required";
  if (value === "REVIEW_REQUIRED") return "Review required";
  return "Blocked";
}

function provenanceOf(report: Report): { provenance: OperationsProvenance; label: string } {
  if (report.pr.branch === "sample") return { provenance: "sample", label: "Sample data" };
  if (report.pr.branch === "github-pr") return { provenance: "github-pr", label: "GitHub PR import" };
  if (report.pr.branch === "pasted-diff") return { provenance: "pasted-diff", label: "Pasted diff" };
  return { provenance: "local", label: "Local report" };
}

function sourceLabel(entry: ReportHistoryEntry) {
  return entry.source === "ai" ? "Baseline + model-assisted" : "Baseline only";
}

function openBlockingRequirements(entry: ReportHistoryEntry) {
  return (entry.mergeContract?.clauses ?? []).filter(
    (clause) => clause.importance === "blocking" && clause.status === "open",
  ).length;
}

function reviewStateGroup(status: ReviewStatus): OperationsGroupId {
  if (status === "Reviewed" || status === "Archived") return "reviewed";
  if (status === "Ready to merge") return "ready";
  if (status === "Review required") return "review";
  /* "Needs work" | "Tests requested" | "Blocked" */
  return "attention";
}

function decisionGroup(outcome: HumanDecisionOutcome): OperationsGroupId {
  switch (outcome) {
    case "approve":
    case "approve-with-accepted-risk":
      return "reviewed";
    case "request-changes":
    case "blocked":
    case "tests-required":
      return "attention";
    case "review-required":
    case "defer":
      return "review";
  }
}

/* Central grouping — mirrors the four-tier precedence documented in
   `lib/workspace-v2/queue-projection.ts` (groupForCase). Only the FIRST
   authoritative signal wins. Human Decision interpretation is not repeated
   here: `decision` is already the resolved, head-applicable projection. */
function classify(input: {
  recommendation: Report["verdict"]["recommendation"];
  reviewStatus: ReviewStatus;
  reviewRecorded: boolean;
  decision: OperationsDecisionState;
  openBlockingRequirements: number;
  unresolvedConditions: number;
}): { group: OperationsGroupId; basis: OperationsGroupBasis } {
  /* Tier 1 — explicit recorded review/completion state. */
  if (input.reviewRecorded) {
    return { group: reviewStateGroup(input.reviewStatus), basis: "review-state" };
  }
  /* Tier 2 — effective, head-applicable Human Decision. */
  if (input.decision.kind === "applicable") {
    return { group: decisionGroup(input.decision.outcome), basis: "human-decision" };
  }
  /* Tier 3 — open blocking state on the current report. */
  if (
    input.recommendation === "BLOCK" ||
    input.recommendation === "TESTS_REQUIRED" ||
    input.openBlockingRequirements > 0 ||
    input.unresolvedConditions > 0
  ) {
    return { group: "attention", basis: "blocking-state" };
  }
  /* Tier 4 — recommendation fallback (never persisted workflow state). */
  if (input.recommendation === "APPROVE") {
    return { group: "ready", basis: "recommendation-fallback" };
  }
  return { group: "review", basis: "recommendation-fallback" };
}

/* Resolve a single durable case. `storage` is already the read-only guard. */
function buildCase(
  entry: ReportHistoryEntry,
  storage: Storage,
  review: ReviewStateResolution,
): OperationsCase {
  const report = entry.report;
  const reportId = entry.createdAt;

  const conditions = reportConditions(report);
  const cleared = readConditionProgress(storage, report, conditions);
  const conditionsCleared = conditions.filter((condition) => cleared.has(conditionKey(condition))).length;
  const unresolvedConditions = Math.max(0, conditions.length - conditionsCleared);
  const blockingRequirementCount = openBlockingRequirements(entry);
  const missingProofCount = report.missingTests.length;

  const context: HumanDecisionLedgerContext = {
    report,
    canonicalRun: entry.canonicalRun,
    mergeContract: entry.mergeContract,
    contractRecheck: entry.contractRecheck,
    verificationPackId: entry.verificationPack?.packId,
    currentHeadSha: entry.canonicalRun?.headSha,
  };
  const ledger = readHumanDecisionLedger(
    storage,
    humanDecisionLedgerKeyForReport(report),
    context,
    review.state,
  );
  const projection = projectHumanDecisionLedger(ledger, context.currentHeadSha);
  const effective = projection.latestEffectiveEntry;

  let decision: OperationsDecisionState;
  if (!effective || !effective.outcome) {
    decision = { kind: "none" };
  } else if (projection.applicability === "applicable") {
    decision = {
      kind: "applicable",
      outcome: effective.outcome,
      acceptedRisk:
        effective.outcome === "approve-with-accepted-risk" || projection.activeAcceptedRisks.length > 0,
      actorLabel: effective.actor.displayLabel,
      recordedAt: effective.recordedAt,
    };
  } else {
    decision = {
      kind: "stale",
      reason: projection.applicability === "withdrawn" ? "withdrawn" : "predates-current-head",
      outcome: effective.outcome,
      actorLabel: effective.actor.displayLabel,
      recordedAt: effective.recordedAt,
    };
  }

  const acceptedRisk =
    projection.activeAcceptedRisks.length > 0 ||
    (decision.kind === "applicable" && decision.acceptedRisk);

  const repository = report.pr.repository.trim();
  const pullRequestNumber = Number.isFinite(report.pr.number) && report.pr.number > 0 ? report.pr.number : undefined;
  const { provenance, label: provenanceLabel } = provenanceOf(report);

  const { group, basis } = classify({
    recommendation: report.verdict.recommendation,
    reviewStatus: review.state.status,
    reviewRecorded: review.recorded,
    decision,
    openBlockingRequirements: blockingRequirementCount,
    unresolvedConditions,
  });

  return {
    reportId,
    caseFileHref: `/report?reportId=${encodeURIComponent(reportId)}`,
    workspaceHref: `/workspace?reportId=${encodeURIComponent(reportId)}`,
    title: report.pr.title.trim() || "Untitled review",
    repository: repository || "Repository unavailable",
    repositoryKnown: repository.length > 0,
    pullRequestNumber,
    changeLabel: pullRequestNumber ? `PR #${pullRequestNumber}` : "Change identity unavailable",
    recommendation: report.verdict.recommendation,
    recommendationLabel: recommendationLabel(report.verdict.recommendation),
    riskScore: report.verdict.riskScore,
    riskLevel: report.verdict.riskLevel,
    blockingRequirementCount,
    missingProofCount,
    conditionsTotal: conditions.length,
    conditionsCleared,
    unresolvedConditions,
    reviewStatus: review.state.status,
    reviewStateRecorded: review.recorded,
    ownerLabel: review.state.owner,
    ownerAssigned: review.state.owner !== "Unassigned",
    decision,
    acceptedRisk,
    provenance,
    provenanceLabel,
    sourceLabel: sourceLabel(entry),
    reviewProfile: entry.metadata.reviewProfile,
    createdAt: reportId,
    group,
    groupBasis: basis,
  };
}

/* Build the projection for a caller-supplied set of entries (Review Operations
   passes all durable entries; Team passes its workspace-scoped subset). Reads
   are non-mutating: `storage` is wrapped once in the read-only guard here. The
   caller is responsible only for choosing the entries and how a review state is
   resolved for each. */
export function buildOperationsCases(
  entries: ReportHistoryEntry[],
  storage: Storage,
  resolveReviewState: ReviewStateResolver,
): OperationsCase[] {
  const guarded = readOnlyStorage(storage);
  return entries.map((entry) => buildCase(entry, guarded, resolveReviewState(entry)));
}

/* Standard global review-state resolver for Review Operations. A state is only
   `recorded` when it exists in the store with a non-null `updatedAt` AND its
   key is unambiguous across the entry set (mirrors queue-projection's
   `ReviewStateSignal`). */
export function globalReviewStateResolver(
  entries: ReportHistoryEntry[],
  storage: Storage,
): ReviewStateResolver {
  const states = readReviewStates(readOnlyStorage(storage));
  const keyCounts = new Map<string, number>();
  for (const entry of entries) {
    const key = reviewStateKeyForReport(entry.report);
    keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
  }
  return (entry: ReportHistoryEntry) => {
    const key = reviewStateKeyForReport(entry.report);
    const stored = states[key];
    const ambiguous = (keyCounts.get(key) ?? 0) > 1;
    if (stored && stored.updatedAt && !ambiguous) {
      return { state: stored, recorded: true };
    }
    return { state: stored ?? defaultReviewState(entry.report), recorded: false };
  };
}

/* Read the durable Case Files from local storage and classify them, telling
   `empty` (no history stored) apart from `unavailable` (history present but
   unreadable / malformed). No fixture is ever substituted. */
export function readOperationsProjection(
  storage: Storage,
  resolveReviewState?: (entries: ReportHistoryEntry[]) => ReviewStateResolver,
): OperationsProjection {
  const guarded = readOnlyStorage(storage);
  let raw: string | null = null;
  try {
    raw = guarded.getItem(REPORT_HISTORY_STORAGE_KEY);
  } catch {
    return { status: "unavailable", cases: [] };
  }

  const entries = readReportHistory(guarded);
  if (entries.length === 0) {
    const present = typeof raw === "string" && raw.trim().length > 0 && raw.trim() !== "[]";
    return { status: present ? "unavailable" : "empty", cases: [] };
  }

  const resolver = resolveReviewState
    ? resolveReviewState(entries)
    : globalReviewStateResolver(entries, storage);
  return { status: "local", cases: buildOperationsCases(entries, storage, resolver) };
}

/* Ordered, non-empty groups for a list of cases, in the fixed Workspace order.
   Within a group, cases are ordered newest-first by exact durable identity
   (createdAt is unique), with a stable id tie-break so order never depends on
   array position. */
export type OperationsGroup = {
  id: OperationsGroupId;
  label: string;
  cases: OperationsCase[];
};

export function groupOperationsCases(cases: OperationsCase[]): OperationsGroup[] {
  const byGroup = new Map<OperationsGroupId, OperationsCase[]>();
  for (const item of cases) {
    const list = byGroup.get(item.group) ?? [];
    list.push(item);
    byGroup.set(item.group, list);
  }
  const groups: OperationsGroup[] = [];
  for (const id of OPERATIONS_GROUP_ORDER) {
    const list = byGroup.get(id);
    if (!list || list.length === 0) continue;
    const ordered = [...list].sort((a, b) => {
      const delta = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (delta !== 0) return delta;
      return a.reportId.localeCompare(b.reportId);
    });
    groups.push({ id, label: OPERATIONS_GROUP_LABEL[id], cases: ordered });
  }
  return groups;
}

export function decisionOutcomeLabel(outcome: HumanDecisionOutcome): string {
  switch (outcome) {
    case "approve":
      return "Approved";
    case "approve-with-accepted-risk":
      return "Approved with accepted risk";
    case "request-changes":
      return "Changes requested";
    case "tests-required":
      return "Tests required";
    case "review-required":
      return "Review required";
    case "blocked":
      return "Blocked";
    case "defer":
      return "Deferred";
  }
}

/* One-line, truthful description of the current Human Decision for a case. */
export function decisionSummary(decision: OperationsDecisionState): string {
  if (decision.kind === "none") return "No decision recorded";
  if (decision.kind === "applicable") return decisionOutcomeLabel(decision.outcome);
  const base = decision.outcome ? decisionOutcomeLabel(decision.outcome) : "Recorded decision";
  return decision.reason === "withdrawn"
    ? `${base} · withdrawn`
    : `${base} · awaiting reaffirmation`;
}
