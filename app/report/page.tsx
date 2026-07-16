"use client";

import { useEffect, useRef, useState } from "react";
import AppShell, { SHELL_NAVIGATION_OPEN_EVENT } from "../app-shell";
import { useGuidedTour } from "../guided-tour";
import { compareChangePassport, passportHandoffSummary, type ChangePassport, type ChangePassportComparison } from "../../lib/change-passport";
import { buildBuilderVerifierAssessment, builderVerifierHandoffSummary, type BuilderVerifierAssessment } from "../../lib/builder-verifier-boundary";
import {
  assumptionHandoffSummary,
  buildEvidenceHierarchy,
  evidenceClassLabels,
  evidenceClassOrder,
  evidenceHandoffSummary,
  type AssumptionRecord,
  type AssumptionStatus,
  type EvidenceRecord,
} from "../../lib/evidence-hierarchy";
import {
  conditionKey,
  conditionProgressSummary,
  readConditionProgress,
  reportConditions,
  writeConditionProgress,
} from "../../lib/condition-progress";
import {
  fingerprintPrefix,
  historicalCanonicalRunManifest,
  type CanonicalReviewRunManifest,
  type CanonicalRunVerificationRecord,
} from "../../lib/canonical-review-run";
import {
  appendDecisionHistoryEvent,
  decisionHistoryKeyForReport,
  ensureDecisionHistory,
  initialDecisionHistory,
  ownershipChangeEvent,
  readDecisionHistory,
  reviewStatusChangeEvent,
  type DecisionHistoryEvent,
} from "../../lib/decision-history";
import { mergeSummaryToMarkdown } from "../../lib/merge-summary";
import {
  buildMergeContract,
  mergeContractSummary,
  safeMergeContractJson,
  type MergeContract,
  type MergeContractClause,
  type MergeContractClauseStatus,
} from "../../lib/merge-contract";
import {
  buildVerificationPack,
  verificationPackFilename,
  verificationPackHandoffSummary,
  verificationPackJson,
  verificationPackToMarkdown,
  type VerificationPack,
} from "../../lib/verification-pack";
import {
  contractRecheckSummary,
  type ContractRecheckRecord,
  type ContractRecheckClauseEvaluation,
} from "../../lib/contract-recheck";
import {
  appendHumanDecisionLedgerEntryToStorage,
  appendHumanDecisionLedgerEntry,
  createEmptyHumanDecisionLedger,
  humanDecisionLedgerKeyForReport,
  humanDecisionLedgerSummary,
  projectHumanDecisionLedger,
  readHumanDecisionLedger,
  recommendationDivergenceForReport,
  writeHumanDecisionLedger,
  type HumanDecisionLedger,
  type HumanDecisionLedgerEntry,
  type HumanDecisionOutcome,
  type HumanDecisionEventType,
} from "../../lib/human-decision-ledger";
import { shortSha, type ReadinessDelta, type ReviewDiff, type ReviewDiffItem, type ReviewDiffStatus } from "../../lib/readiness-delta";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import { conditionsToMarkdown, findingProvenanceLabel, reportMarkdownFilename, reportToMarkdown, type ReportSourceLabel } from "../../lib/report-markdown";
import type { FindingSeverity, Recommendation, Report, ReviewArea, RiskLevel } from "../../lib/mock-report";
import { report as demoReport } from "../../lib/mock-report";
import { deduplicateReportItems, pruneUnsupportedReviewerFocus } from "../../lib/report-quality";
import {
  gatesByLevel,
  policyGateSummary,
  policyStatusForReport,
  reviewPolicyForProfile,
} from "../../lib/review-policies";
import { reviewProfileLabel } from "../../lib/review-profiles";
import { ownerDisplay, REVIEW_OWNER_OPTIONS, suggestedReviewerOwners, type ReviewerOwner } from "../../lib/reviewer-ownership";
import {
  readReviewActionStatuses,
  REVIEW_ACTION_STATUSES,
  reviewActionKey,
  type ReviewActionStatus,
  writeReviewActionStatus,
} from "../../lib/review-actions";
import {
  defaultReviewState,
  readReviewState,
  readReviewStates,
  REVIEW_STATUSES,
  reviewStateKeyForReport,
  type ReportReviewState,
  type ReviewStatus,
  writeReviewState,
} from "../../lib/review-state";
import {
  activeAssignableMembers,
  activeWorkspace,
  ensureWorkspaceStore,
  findMemberByOwnerLabel,
  workspaceScopedReviewKey,
  type TeamWorkspace,
  type WorkspaceStore,
} from "../../lib/team-workspace";

type GeneratedReportSource = "ai" | "deterministic";
type ReportSource = GeneratedReportSource | "demo";
type CopyState = "idle" | "copied" | "failed";
type DownloadState = "idle" | "downloaded" | "failed";
type QuickActionMessageState = "success" | "failed";
type DossierSectionId = "what-changed" | "observed" | "uncertain" | "merge-contract" | "appendix";
type VerificationTraceState = "open" | "satisfied" | "partial" | "unavailable";
type Finding = Report["findings"][number];
type ReviewerFocus = NonNullable<Report["reviewerFocus"]>[number];
type EvidenceLedgerItem = {
  label: string;
  detail: string;
  impact: "Supports decision" | "Missing evidence" | "Blocks merge" | "Needs human confirmation" | "Ready signal";
  relation: string;
};
type SurfaceStatus = "Clear" | "Watch" | "Attention" | "Blocker";
type AffectedSurface = {
  name: string;
  status: SurfaceStatus;
  reason: string;
  evidence: string;
  action: string;
};
type ScoreComponentStatus = "Strong" | "Watch" | "Drag";
type ScoreBreakdownComponent = {
  label: string;
  status: ScoreComponentStatus;
  explanation: string;
  improvesWith: string;
  relatedEvidence: string;
};
type ScoreBreakdown = {
  strongestPositiveSignal: string;
  biggestScoreDrag: string;
  nextAction: string;
  components: ScoreBreakdownComponent[];
};
type ReviewActionPriority = "Blocker" | "Required" | "Recommended" | "Optional";
type ReviewActionSource = "Missing test" | "Merge condition" | "Finding" | "Evidence gap" | "Policy gate" | "Operational/security" | "Readiness score";
type ReviewActionItem = {
  key: string;
  title: string;
  source: ReviewActionSource;
  priority: ReviewActionPriority;
  suggestedOwner: ReviewerOwner;
  defaultStatus: ReviewActionStatus;
  reason: string;
};
type ActionProgress = ReturnType<typeof actionProgressSummary>;
type TimelineEventCategory = "Decision" | "Evidence" | "Tests" | "Ownership" | "Human actions";
type TimelineFilter = "All" | TimelineEventCategory;
type TimelineProvenance = "Deterministic analysis" | "Model-assisted analysis" | "Human reviewer" | "Local user action" | "CI or test evidence";
type ReadinessMovement = "Readiness increased" | "Readiness decreased" | "Recommendation changed" | "Condition cleared" | "Condition reopened" | "Evidence strengthened" | "Evidence weakened" | "Ownership changed" | "Current state";
type ReadinessTimelineEvent = {
  id: string;
  title: string;
  timestamp: string;
  actor: string;
  provenance: TimelineProvenance;
  category: TimelineEventCategory;
  summary: string;
  area: string;
  previousState?: string;
  nextState?: string;
  movement?: ReadinessMovement;
  relatedItem?: string;
  current?: boolean;
};
type StudioHumanDecision = "Ready to merge" | "Tests required" | "Review required" | "Blocked" | "Approved with accepted risk";
type LocalAssumptionOverride = {
  status: Extract<AssumptionStatus, "open" | "supported" | "accepted" | "invalidated">;
  note?: string;
  timestamp: string;
  headSha?: string;
};
type LocalClauseOverride = {
  status: Extract<MergeContractClauseStatus, "open" | "satisfied" | "accepted" | "invalidated" | "superseded">;
  reason?: string;
  timestamp: string;
  headSha?: string;
};

type StoredReport = {
  report: Report;
  source: GeneratedReportSource;
  readinessDelta?: ReadinessDelta;
  reviewDiff?: ReviewDiff;
  canonicalRun?: CanonicalReviewRunManifest;
  changePassport?: ChangePassport;
  mergeContract?: MergeContract;
  verificationPack?: VerificationPack;
  contractRecheck?: ContractRecheckRecord;
  verificationTarget?: { pullRequestId: string; runId: string };
  initialTab?: string;
};

const sourceLabels: Record<ReportSource, ReportSourceLabel> = {
  ai: "Baseline + model-assisted",
  deterministic: "Baseline only",
  demo: "Demo report",
};

const copyLabels: Record<CopyState, string> = {
  idle: "Copy summary",
  copied: "Copied",
  failed: "Copy failed",
};

const downloadLabels: Record<DownloadState, string> = {
  idle: "Download Markdown",
  downloaded: "Downloaded",
  failed: "Download failed",
};

const copyConditionsLabels: Record<CopyState, string> = {
  idle: "Copy conditions",
  copied: "Conditions copied",
  failed: "Copy failed",
};

const copyMergeSummaryLabels: Record<CopyState, string> = {
  idle: "Copy PR comment",
  copied: "PR comment copied",
  failed: "Copy failed",
};

const timelineFilters: TimelineFilter[] = ["All", "Decision", "Evidence", "Tests", "Ownership", "Human actions"];
const studioDecisionOptions: StudioHumanDecision[] = ["Ready to merge", "Tests required", "Review required", "Blocked", "Approved with accepted risk"];
const reviewDiffFilters: Array<"All" | "Added" | "Cleared" | "Changed" | "Still open" | "Reopened"> = ["All", "Added", "Cleared", "Changed", "Still open", "Reopened"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReport(value: unknown): value is Report {
  return isRecord(value)
    && isRecord(value.pr)
    && typeof value.pr.title === "string"
    && isRecord(value.verdict)
    && typeof value.verdict.recommendation === "string"
    && Array.isArray(value.findings)
    && !/diff --git|@@|(?:^|\\n)(?:--- a\/|\+\+\+ b\/)/m.test(JSON.stringify(value));
}

function isStoredReport(value: unknown): value is StoredReport {
  return isRecord(value)
    && (value.source === "ai" || value.source === "deterministic")
    && isReport(value.report);
}

function isReadinessDelta(value: unknown): value is ReadinessDelta {
  return isRecord(value)
    && typeof value.currentRunId === "string"
    && typeof value.currentHeadSha === "string"
    && typeof value.currentScore === "number"
    && typeof value.currentRecommendation === "string"
    && typeof value.currentRiskLevel === "string"
    && typeof value.classification === "string";
}

function isReviewDiff(value: unknown): value is ReviewDiff {
  return isRecord(value)
    && typeof value.currentRunId === "string"
    && typeof value.currentHeadSha === "string"
    && typeof value.currentScore === "number"
    && Array.isArray(value.findings)
    && Array.isArray(value.evidence)
    && Array.isArray(value.testGaps)
    && Array.isArray(value.mergeConditions);
}

function isCanonicalRun(value: unknown): value is CanonicalReviewRunManifest {
  return isRecord(value)
    && typeof value.runId === "string"
    && typeof value.schemaVersion === "string"
    && typeof value.sourceType === "string"
    && typeof value.repository === "string"
    && typeof value.inputFingerprint === "string"
    && typeof value.configurationFingerprint === "string"
    && typeof value.resultFingerprint === "string"
    && typeof value.analysisSource === "string"
    && typeof value.reproducibility === "string";
}

function isChangePassport(value: unknown): value is ChangePassport {
  return isRecord(value)
    && typeof value.passportId === "string"
    && typeof value.schemaVersion === "string"
    && typeof value.producerType === "string"
    && typeof value.source === "string"
    && typeof value.completeness === "string"
    && typeof value.fingerprint === "string";
}

function isMergeContract(value: unknown): value is MergeContract {
  return isRecord(value)
    && typeof value.contractId === "string"
    && typeof value.schemaVersion === "string"
    && typeof value.state === "string"
    && Array.isArray(value.clauses);
}

function isVerificationPack(value: unknown): value is VerificationPack {
  return isRecord(value)
    && typeof value.packId === "string"
    && typeof value.schemaVersion === "string"
    && typeof value.packFingerprint === "string";
}

function isContractRecheck(value: unknown): value is ContractRecheckRecord {
  return isRecord(value)
    && typeof value.recheckId === "string"
    && typeof value.schemaVersion === "string"
    && typeof value.previousContractId === "string"
    && typeof value.currentContractId === "string"
    && typeof value.fingerprint === "string";
}

function isVerificationTarget(value: unknown): value is { pullRequestId: string; runId: string } {
  return isRecord(value)
    && typeof value.pullRequestId === "string"
    && typeof value.runId === "string";
}

function isVerificationRecord(value: unknown): value is CanonicalRunVerificationRecord {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.runId === "string"
    && typeof value.createdAt === "string"
    && typeof value.sourceMatched === "boolean"
    && typeof value.configurationMatched === "boolean"
    && typeof value.reproducibility === "string";
}

function assumptionStateKey(report: Report, runId?: string) {
  const base = `${report.pr.repository}:${report.pr.title}:${runId ?? report.pr.updatedAt ?? "local"}`;
  return `lintel.assumptionRegistry.v1:${base.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function isAssumptionOverride(value: unknown): value is LocalAssumptionOverride {
  return isRecord(value)
    && (value.status === "open" || value.status === "supported" || value.status === "accepted" || value.status === "invalidated")
    && typeof value.timestamp === "string";
}

function readAssumptionOverrides(storage: Storage, key: string) {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "{}");
    if (!isRecord(parsed)) return {};
    return Object.entries(parsed).reduce<Record<string, LocalAssumptionOverride>>((result, [id, value]) => {
      if (isAssumptionOverride(value)) result[id] = value;
      return result;
    }, {});
  } catch {
    return {};
  }
}

function writeAssumptionOverride(storage: Storage, key: string, assumptionId: string, value: LocalAssumptionOverride) {
  const current = readAssumptionOverrides(storage, key);
  current[assumptionId] = value;
  storage.setItem(key, JSON.stringify(current));
  return current;
}

function assumptionDisplayStatus(assumption: AssumptionRecord, override?: LocalAssumptionOverride, currentHeadSha?: string) {
  if (!override) return assumption.status;
  if (override.headSha && currentHeadSha && override.headSha !== currentHeadSha) return "stale";
  return override.status;
}

function contractStateKey(contract: MergeContract) {
  return `lintel.mergeContract.v1:${contract.contractId}:${contract.headSha ?? "local"}`;
}

function isClauseOverride(value: unknown): value is LocalClauseOverride {
  return isRecord(value)
    && (value.status === "open" || value.status === "satisfied" || value.status === "accepted" || value.status === "invalidated" || value.status === "superseded")
    && typeof value.timestamp === "string";
}

function readClauseOverrides(storage: Storage, key: string) {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "{}");
    if (!isRecord(parsed)) return {};
    return Object.entries(parsed).reduce<Record<string, LocalClauseOverride>>((result, [id, value]) => {
      if (isClauseOverride(value)) result[id] = value;
      return result;
    }, {});
  } catch {
    return {};
  }
}

function writeClauseOverride(storage: Storage, key: string, clauseId: string, value: LocalClauseOverride) {
  const current = readClauseOverrides(storage, key);
  current[clauseId] = value;
  storage.setItem(key, JSON.stringify(current));
  return current;
}

function clauseDisplayStatus(clause: MergeContractClause, override?: LocalClauseOverride, currentHeadSha?: string): MergeContractClauseStatus {
  if (!override) return clause.status;
  if (override.headSha && currentHeadSha && override.headSha !== currentHeadSha) return "stale";
  return override.status;
}

async function writeToClipboard(value: string) {
  let clipboardTimeout: ReturnType<typeof setTimeout> | null = null;

  try {
    await new Promise<void>((resolve, reject) => {
      clipboardTimeout = setTimeout(() => reject(new Error("Clipboard write timed out")), 1_000);
      navigator.clipboard.writeText(value).then(resolve, reject);
    });
    return true;
  } catch {
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.setAttribute("aria-hidden", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
      activeElement?.focus();
    }
  } finally {
    if (clipboardTimeout) clearTimeout(clipboardTimeout);
  }
}

function isReportTextEntry(target: EventTarget | null) {
  return target instanceof HTMLElement
    && !!target.closest("input, textarea, select, button, a, [contenteditable='true']");
}

function downloadMarkdown(value: string, filename: string) {
  return downloadText(value, filename, "text/markdown;charset=utf-8");
}

function downloadText(value: string, filename: string, type: string) {
  let url: string | null = null;
  let link: HTMLAnchorElement | null = null;

  try {
    const blob = new Blob([value], { type });
    url = URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    return true;
  } catch {
    return false;
  } finally {
    link?.remove();

    if (url) {
      const objectUrl = url;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    }
  }
}

function displayLabel(value: string) {
  return value.replaceAll("_", " ");
}

const recommendationHeadings: Record<Recommendation, string> = {
  APPROVE: "Ready to merge",
  REVIEW_REQUIRED: "Needs focused review",
  TESTS_REQUIRED: "What needs attention",
  BLOCK: "Do not merge",
};

const closingRecommendations: Record<Recommendation, string> = {
  APPROVE: "No merge blockers remain in this report. Complete normal human review and CI checks.",
  REVIEW_REQUIRED: "Resolve or explicitly accept the focused review items above before merge.",
  TESTS_REQUIRED: "Resolve the conditions above and verify the focused test plan before merge.",
  BLOCK: "Do not merge until the blocking risks above are resolved.",
};

function inputSourceLabel(value: string) {
  if (value === "github-pr") return "GitHub PR import";
  if (value === "sample") return "Sample";
  if (value === "pasted-diff") return "Pasted diff";
  return value;
}

function decisionPanelInputLabel(value: string) {
  if (value === "github-pr") return "GitHub import";
  if (value === "sample") return "Sample";
  if (value === "pasted-diff") return "Manual";
  return inputSourceLabel(value);
}

function studioDecisionFromReviewState(status: ReviewStatus): StudioHumanDecision {
  if (status === "Ready to merge" || status === "Reviewed") return "Ready to merge";
  if (status === "Tests requested") return "Tests required";
  if (status === "Review required") return "Review required";
  if (status === "Blocked") return "Blocked";
  return "Review required";
}

function reviewStatusFromStudioDecision(decision: StudioHumanDecision): ReviewStatus {
  if (decision === "Ready to merge" || decision === "Approved with accepted risk") return "Ready to merge";
  if (decision === "Tests required") return "Tests requested";
  if (decision === "Review required") return "Review required";
  if (decision === "Blocked") return "Blocked";
  return "Needs work";
}

function humanDecisionOutcomeFromStudio(decision: StudioHumanDecision): HumanDecisionOutcome {
  if (decision === "Ready to merge") return "approve";
  if (decision === "Approved with accepted risk") return "approve-with-accepted-risk";
  if (decision === "Tests required") return "tests-required";
  if (decision === "Review required") return "review-required";
  if (decision === "Blocked") return "blocked";
  return "request-changes";
}

function humanDecisionOutcomeLabel(outcome?: HumanDecisionOutcome) {
  if (!outcome) return "No decision";
  return outcome.replaceAll("-", " ");
}

function studioDecisionLabel(decision: StudioHumanDecision, acceptedRiskReason: string) {
  if (decision !== "Approved with accepted risk") return decision;
  const reason = acceptedRiskReason.trim();
  return reason ? `${decision}: ${reason}` : decision;
}

function studioDecisionNote(reviewState: ReportReviewState, decision: StudioHumanDecision, acceptedRiskReason: string) {
  if (decision !== "Approved with accepted risk") return reviewState.note;

  const reason = acceptedRiskReason.trim();
  if (!reason) return reviewState.note;

  const acceptedRiskLine = `Accepted risk reason: ${reason}`;
  const currentNote = reviewState.note.trim();
  if (currentNote.includes(acceptedRiskLine)) return reviewState.note;

  return `${currentNote}${currentNote ? "\n\n" : ""}${acceptedRiskLine}`;
}

function reportNextAction(report: Report, conditions: string[], operationalStatus: string) {
  if (conditions.length > 0) return "Clear merge conditions";
  if (report.missingTests.length > 0) return "Add focused tests";
  if (operationalStatus === "ATTENTION") return "Review operational readiness";
  if (report.findings.length > 0) return "Complete focused review";
  return "Complete normal review";
}

function studioDecisionMatchesRecommendation(decision: StudioHumanDecision, recommendation: Recommendation) {
  if (decision === "Approved with accepted risk") return false;
  if (recommendation === "APPROVE") return decision === "Ready to merge";
  if (recommendation === "TESTS_REQUIRED") return decision === "Tests required";
  if (recommendation === "REVIEW_REQUIRED") return decision === "Review required";
  if (recommendation === "BLOCK") return decision === "Blocked";
  return false;
}

function normalizedRecordKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

function uncertaintyStateLabel(status: AssumptionStatus) {
  if (status === "open" || status === "stale") return "ASSUMED";
  if (status === "accepted") return "ACCEPTED";
  if (status === "invalidated" || status === "superseded") return "INVALIDATED";
  return "SUPPORTED";
}

function dossierSectionForLegacyTarget(target: string): DossierSectionId {
  if (["what-changed", "observed", "uncertain", "merge-contract", "appendix"].includes(target)) return target as DossierSectionId;
  if (["overview", "blast-radius", "changed-files"].includes(target)) return "what-changed";
  if (["findings", "operations"].includes(target)) return "observed";
  if (["tests", "evidence", "review-focus"].includes(target)) return "uncertain";
  if (target === "actions") return "merge-contract";
  return "appendix";
}

function reportScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function recommendationBecauseClause({
  report,
  blockingClauses,
  missingProof,
  openAssumptions,
}: {
  report: Report;
  blockingClauses: number;
  missingProof: number;
  openAssumptions: number;
}) {
  const recommendation = recommendationHeadings[report.verdict.recommendation];

  if (blockingClauses > 0 && missingProof > 0) {
    return `${recommendation} because ${blockingClauses} blocking ${blockingClauses === 1 ? "requirement remains" : "requirements remain"} open and ${missingProof} named ${missingProof === 1 ? "proof item is" : "proof items are"} missing.`;
  }
  if (blockingClauses > 0) {
    return `${recommendation} because ${blockingClauses} blocking ${blockingClauses === 1 ? "requirement remains" : "requirements remain"} open.`;
  }
  if (openAssumptions > 0) {
    return `${recommendation} because ${openAssumptions} ${openAssumptions === 1 ? "assumption remains" : "assumptions remain"} unsupported.`;
  }
  if (missingProof > 0) {
    return `${recommendation} because ${missingProof} named ${missingProof === 1 ? "test or evidence item remains" : "test or evidence items remain"} missing.`;
  }
  if (report.findings.length > 0) {
    return `${recommendation} because ${report.findings.length} structured ${report.findings.length === 1 ? "finding requires" : "findings require"} human review.`;
  }
  return report.verdict.summary;
}

function timelineTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
}

function deltaScoreMovement(delta: ReadinessDelta) {
  if (delta.scoreChange === undefined) return "Initial baseline";
  if (delta.scoreChange === 0) return "No score movement";
  return `${delta.scoreChange > 0 ? "+" : ""}${delta.scoreChange}`;
}

function classificationLabel(classification: string) {
  if (classification === "initial") return "Initial analysis";
  if (classification === "unchanged") return "No material change";
  return classification.charAt(0).toUpperCase() + classification.slice(1);
}

function deltaClassificationLabel(delta: ReadinessDelta) {
  return classificationLabel(delta.classification);
}

function deltaRecommendationMovement(delta: ReadinessDelta) {
  if (!delta.previousRecommendation || !delta.recommendationChanged) return delta.currentRecommendation.replaceAll("_", " ");
  return `${delta.previousRecommendation.replaceAll("_", " ")} → ${delta.currentRecommendation.replaceAll("_", " ")}`;
}

/* Higher rank = closer to merge. Used only for presentation direction, not classification. */
const evolutionRecommendationRank: Record<Recommendation, number> = { BLOCK: 0, TESTS_REQUIRED: 1, REVIEW_REQUIRED: 2, APPROVE: 3 };
const evolutionRiskRank: Record<RiskLevel, number> = { CRITICAL: -1, HIGH: 0, MEDIUM: 1, LOW: 2 };

type EvolutionDirection = "better" | "worse" | "same";

function evolutionDirection(previous: number | undefined, current: number): EvolutionDirection {
  if (previous === undefined || previous === current) return "same";
  return current > previous ? "better" : "worse";
}

type DeltaEvolutionSource = Pick<
  ReadinessDelta,
  "previousHeadSha" | "currentHeadSha" | "previousScore" | "currentScore"
  | "previousRecommendation" | "currentRecommendation" | "previousRiskLevel" | "currentRiskLevel"
  | "classification" | "generatedAt"
>;

function EvolutionMovement({ label, previous, current, direction, changeChip }: {
  label: string;
  previous?: string;
  current: string;
  direction: EvolutionDirection;
  changeChip?: string;
}) {
  return (
    <div className={`delta-movement delta-movement--${direction}`}>
      <dt>{label}</dt>
      <dd>
        {previous !== undefined && previous !== current && (
          <>
            <span className="delta-before">{previous}</span>
            <span aria-hidden="true">→</span>
          </>
        )}
        <strong>{current}</strong>
        {changeChip && <span className="delta-change-chip">{changeChip}</span>}
      </dd>
    </div>
  );
}

function DeltaEvolutionHeader({ source }: { source: DeltaEvolutionSource }) {
  const scoreChange = source.previousScore === undefined ? undefined : source.currentScore - source.previousScore;

  return (
    <div className={`delta-evolution delta-evolution--${source.classification}`}>
      <div className="delta-evolution-lead">
        <span className={`delta-classification delta-classification--${source.classification}`}>
          {classificationLabel(source.classification)}
        </span>
        <span className="delta-evolution-sha">
          {source.previousHeadSha
            ? <>{shortSha(source.previousHeadSha)} <span aria-hidden="true">→</span> {shortSha(source.currentHeadSha)}</>
            : shortSha(source.currentHeadSha)}
        </span>
        <time dateTime={source.generatedAt}>Analysed {timelineTime(source.generatedAt)}</time>
      </div>
      <dl className="delta-evolution-movements">
        <EvolutionMovement
          label="Score"
          previous={source.previousScore === undefined ? undefined : String(source.previousScore)}
          current={source.previousScore === undefined ? `${source.currentScore}/100` : String(source.currentScore)}
          direction={evolutionDirection(source.previousScore, source.currentScore)}
          changeChip={scoreChange !== undefined && scoreChange !== 0 ? `${scoreChange > 0 ? "+" : ""}${scoreChange}` : undefined}
        />
        <EvolutionMovement
          label="Recommendation"
          previous={source.previousRecommendation?.replaceAll("_", " ")}
          current={source.currentRecommendation.replaceAll("_", " ")}
          direction={evolutionDirection(
            source.previousRecommendation ? evolutionRecommendationRank[source.previousRecommendation] : undefined,
            evolutionRecommendationRank[source.currentRecommendation],
          )}
        />
        <EvolutionMovement
          label="Risk"
          previous={source.previousRiskLevel}
          current={source.currentRiskLevel}
          direction={evolutionDirection(
            source.previousRiskLevel ? evolutionRiskRank[source.previousRiskLevel] : undefined,
            evolutionRiskRank[source.currentRiskLevel],
          )}
        />
      </dl>
    </div>
  );
}

function reviewDiffItems(diff: ReviewDiff) {
  return [...diff.findings, ...diff.evidence, ...diff.testGaps, ...diff.mergeConditions];
}

function reviewDiffStatusLabel(status: ReviewDiffStatus) {
  if (status === "unchanged") return "Still open";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function reviewDiffFilterMatches(item: ReviewDiffItem, filter: (typeof reviewDiffFilters)[number]) {
  if (filter === "All") return true;
  if (filter === "Added") return item.status === "added";
  if (filter === "Cleared") return item.status === "cleared";
  if (filter === "Changed") return item.status === "changed";
  if (filter === "Still open") return item.status === "unchanged";
  if (filter === "Reopened") return item.status === "reopened";
  return true;
}

function reviewDiffCount(diff: ReviewDiff, status: ReviewDiffStatus) {
  return reviewDiffItems(diff).filter((item) => item.status === status).length;
}

function reviewDiffChangedCount(diff: ReviewDiff) {
  return reviewDiffItems(diff).filter((item) => item.status === "changed").length;
}

function reproducibilityLabel(value: string) {
  return value.replaceAll("-", " ");
}

function verificationLabel(value: boolean | undefined) {
  if (value === undefined) return "Not checked";
  return value ? "Matched" : "Changed";
}

function reviewDiffSectionItems(items: ReviewDiffItem[], filter: (typeof reviewDiffFilters)[number]) {
  return items.filter((item) => reviewDiffFilterMatches(item, filter));
}

const reviewDiffFieldLabels: Record<string, string> = {
  severity: "Severity",
  blockerState: "Blocking state",
  evidence: "Evidence",
  action: "Action",
  file: "File",
  provenance: "Provenance",
  status: "Status",
  state: "State",
  priority: "Priority",
  detail: "Detail",
  clearanceRequirement: "Clearance requirement",
};

function reviewDiffFieldLabel(field: string) {
  return reviewDiffFieldLabels[field] ?? field;
}

function ReviewDiffRow({ item }: { item: ReviewDiffItem }) {
  const [expanded, setExpanded] = useState(false);
  const changes = item.changes ?? [];
  const expandable = changes.length > 0;
  const stateMoved = Boolean(item.previousState && item.currentState && item.previousState !== item.currentState);

  const rowBody = (
    <>
      <span className={`review-diff-status review-diff-status--${item.status}`}>{reviewDiffStatusLabel(item.status)}</span>
      <span className="review-diff-row-main">
        <strong>{item.title}</strong>
        <span className="review-diff-row-meta">
          {item.category}
          {expandable && ` · ${changes.length} field ${changes.length === 1 ? "change" : "changes"}`}
        </span>
      </span>
      <span className="review-diff-row-state">
        {stateMoved ? (
          <>
            <span className="review-diff-before">{item.previousState}</span>
            <span aria-hidden="true">→</span>
            <strong>{item.currentState}</strong>
          </>
        ) : (
          <strong>{item.currentState ?? item.previousState ?? "—"}</strong>
        )}
      </span>
      <span className="review-diff-row-chevron" aria-hidden="true">{expandable ? (expanded ? "▾" : "▸") : ""}</span>
    </>
  );

  return (
    <li className={expanded ? "review-diff-row review-diff-row--expanded" : "review-diff-row"}>
      {expandable ? (
        <button
          type="button"
          className="review-diff-row-line"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {rowBody}
        </button>
      ) : (
        <div className="review-diff-row-line">{rowBody}</div>
      )}
      {expandable && expanded && (
        <dl className="review-diff-row-changes">
          {changes.map((change) => (
            <div key={change.field}>
              <dt>{reviewDiffFieldLabel(change.field)}</dt>
              <dd className={change.field === "file" ? "review-diff-code" : undefined}>
                <span className="review-diff-before">{change.previous ?? "Not present"}</span>
                <span aria-hidden="true">→</span>
                <strong>{change.current ?? "Not present"}</strong>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}

function reviewDiffStatusBreakdown(items: ReviewDiffItem[]) {
  const order: ReviewDiffStatus[] = ["reopened", "added", "changed", "cleared", "unchanged"];
  return order
    .map((status) => ({ status, count: items.filter((item) => item.status === status).length }))
    .filter((entry) => entry.count > 0);
}

function ReviewDiffSection({ title, items, filter }: { title: string; items: ReviewDiffItem[]; filter: (typeof reviewDiffFilters)[number] }) {
  const visibleItems = reviewDiffSectionItems(items, filter);
  const breakdown = reviewDiffStatusBreakdown(items);

  return (
    <section className="review-diff-section" aria-labelledby={`review-diff-${title.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="review-diff-section-header">
        <h3 id={`review-diff-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h3>
        <span className="review-diff-section-counts">
          {breakdown.length === 0
            ? "No items"
            : breakdown.map((entry) => `${entry.count} ${reviewDiffStatusLabel(entry.status).toLowerCase()}`).join(" · ")}
          {filter !== "All" && ` · ${visibleItems.length} shown`}
        </span>
      </div>
      {visibleItems.length > 0 ? (
        <ul className="review-diff-rows">
          {visibleItems.map((item) => <ReviewDiffRow item={item} key={item.key} />)}
        </ul>
      ) : (
        <p className="section-empty">No {title.toLowerCase()} items match this filter.</p>
      )}
    </section>
  );
}

function deltaTimelineEvent(delta: ReadinessDelta): ReadinessTimelineEvent {
  const movement: ReadinessMovement = delta.classification === "improved"
    ? "Readiness increased"
    : delta.classification === "regressed"
      ? "Readiness decreased"
      : delta.recommendationChanged
        ? "Recommendation changed"
        : "Current state";
  const openedCount = delta.openedMergeConditions.length + delta.reopenedMergeConditions.length;
  const contractMovement = delta.mergeContractMovement
    ? `${delta.mergeContractMovement.clausesOpened} contract clauses opened / ${delta.mergeContractMovement.clausesSatisfied} satisfied`
    : "";

  return {
    id: `commit-readiness-delta-${delta.currentRunId}`,
    title: delta.classification === "initial" ? "Initial readiness baseline" : "Commit re-analysis completed",
    timestamp: delta.generatedAt,
    actor: "GitHub App automated analysis",
    provenance: "Deterministic analysis",
    category: "Decision",
    summary: delta.classification === "initial"
      ? `Initial automated baseline at ${shortSha(delta.currentHeadSha)}. Review Diff becomes available after the next completed analysis.`
      : `${deltaClassificationLabel(delta)} since ${shortSha(delta.previousHeadSha)}: score ${delta.previousScore ?? "—"} → ${delta.currentScore}, ${delta.clearedMergeConditions.length} cleared, ${openedCount} opened or reopened. Recommendation ${deltaRecommendationMovement(delta)}.`,
    area: "Readiness Delta",
    previousState: delta.previousHeadSha ? `${shortSha(delta.previousHeadSha)} / ${delta.previousScore ?? "unknown"}` : "No previous completed run",
    nextState: `${shortSha(delta.currentHeadSha)} / ${delta.currentScore}`,
    movement,
    relatedItem: contractMovement || deltaRecommendationMovement(delta),
  };
}

function contractRecheckTimelineEvent(recheck: ContractRecheckRecord): ReadinessTimelineEvent {
  const newlySatisfied = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "newly-satisfied").length;
  const reopened = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "reopened").length;
  const stillOpen = recheck.clauseEvaluations.filter((item) => item.evaluationStatus === "still-open").length;
  const movement: ReadinessMovement = recheck.classification === "improved" || recheck.classification === "fully-satisfied"
    ? "Readiness increased"
    : recheck.classification === "regressed"
      ? "Readiness decreased"
      : "Current state";

  return {
    id: `contract-recheck-${recheck.recheckId}`,
    title: "Contract re-check completed",
    timestamp: recheck.triggeredAt,
    actor: recheck.source === "api" ? "Local re-check action" : "GitHub App automated analysis",
    provenance: recheck.source === "api" ? "Local user action" : "Deterministic analysis",
    category: "Evidence",
    summary: `${recheck.classification.replaceAll("-", " ")} contract movement: ${newlySatisfied} newly satisfied, ${reopened} reopened, ${stillOpen} still open, ${recheck.newClauses.length} new requirements.`,
    area: "Contract re-check",
    previousState: recheck.previousHeadSha ? shortSha(recheck.previousHeadSha) : "Previous contract",
    nextState: recheck.currentHeadSha ? shortSha(recheck.currentHeadSha) : "Current contract",
    movement,
    relatedItem: recheck.humanDecisionApplicability.state === "predates-current-head"
      ? "Human decision predates current head"
      : `${recheck.previousContractId} -> ${recheck.currentContractId}`,
  };
}

function humanLedgerTimelineEvent(entry: HumanDecisionLedgerEntry): ReadinessTimelineEvent {
  const title = entry.eventType === "risk-accepted"
    ? "Accepted risk recorded"
    : entry.eventType === "risk-acceptance-revoked"
      ? "Accepted risk revoked"
      : entry.eventType === "decision-withdrawn"
        ? "Human decision withdrawn"
        : entry.eventType === "decision-reaffirmed"
          ? "Human decision reaffirmed"
          : entry.eventType === "decision-superseded"
            ? "Human decision superseded"
            : "Human decision recorded";

  return {
    id: `human-ledger-${entry.entryId}`,
    title,
    timestamp: entry.recordedAt,
    actor: entry.actor.displayLabel,
    provenance: "Human reviewer",
    category: "Human actions",
    summary: `${entry.eventType.replaceAll("-", " ")}${entry.outcome ? `: ${humanDecisionOutcomeLabel(entry.outcome)}` : ""}. ${entry.reason ?? "No reason recorded."}`,
    area: "Human Decision Ledger",
    previousState: entry.supersedesEntryId ?? entry.withdrawsEntryId,
    nextState: entry.outcome,
    movement: entry.eventType === "decision-withdrawn" || entry.eventType === "risk-acceptance-revoked" ? "Readiness decreased" : "Current state",
    relatedItem: entry.applicableHeadSha ? `Applies to ${shortSha(entry.applicableHeadSha)}` : "Head SHA unavailable",
  };
}

function timelineBaseTimestamp(history: DecisionHistoryEvent[]) {
  return history.find((event) => event.type === "report-generated")?.timestamp
    ?? history[history.length - 1]?.timestamp
    ?? new Date().toISOString();
}

function timelineProvenanceForSource(source: ReportSource): TimelineProvenance {
  if (source === "ai") return "Model-assisted analysis";
  return "Deterministic analysis";
}

function timelineCategoryForStoredEvent(event: DecisionHistoryEvent): TimelineEventCategory {
  if (event.type === "condition-cleared" || event.type === "condition-reopened") return "Evidence";
  if (event.type === "ownership-changed") return "Ownership";
  if (event.type === "review-state-changed" || event.type === "recommendation-assigned" || event.type === "human-decision-recorded" || event.type === "accepted-risk-recorded") return "Decision";
  if (event.type === "review-action-updated" || event.type === "merge-summary-copied" || event.type === "reviewer-note-updated") return "Human actions";
  return "Decision";
}

function timelineMovementForStoredEvent(event: DecisionHistoryEvent): ReadinessMovement | undefined {
  if (event.type === "condition-cleared") return "Condition cleared";
  if (event.type === "condition-reopened") return "Condition reopened";
  if (event.type === "ownership-changed") return "Ownership changed";
  if (event.type === "review-state-changed" || event.type === "recommendation-assigned" || event.type === "human-decision-recorded") return "Recommendation changed";
  if (event.type === "accepted-risk-recorded") return "Readiness increased";
  if (event.type === "review-action-updated") {
    if (event.nextState === "Done" || event.nextState === "Not needed") return "Readiness increased";
    if (event.nextState === "Open" || event.nextState === "In progress") return "Readiness decreased";
  }
  return undefined;
}

function timelineAreaForStoredEvent(event: DecisionHistoryEvent) {
  if (event.type === "condition-cleared" || event.type === "condition-reopened") return "Merge contract";
  if (event.type === "ownership-changed") return "Reviewer ownership";
  if (event.type === "review-action-updated") return "Review actions";
  if (event.type === "merge-summary-copied") return "Decision handoff";
  if (event.type === "human-decision-recorded" || event.type === "accepted-risk-recorded") return "Decision Studio";
  if (event.type === "reviewer-note-updated") return "Reviewer note";
  return "Decision";
}

function humaniseStoredTimelineTitle(event: DecisionHistoryEvent) {
  if (event.type === "condition-cleared") return "Merge condition cleared";
  if (event.type === "condition-reopened") return "Merge condition reopened";
  if (event.type === "ownership-changed") return "Reviewer ownership changed";
  if (event.type === "review-action-updated") return "Review action updated";
  if (event.type === "review-state-changed") return "Human decision recorded";
  if (event.type === "human-decision-recorded") return "Human decision recorded";
  if (event.type === "accepted-risk-recorded") return "Accepted risk recorded";
  return event.title;
}

function buildReadinessTimeline({
  report,
  source,
  history,
  conditions,
  clearedConditionCount,
  openConditionCount,
  evidenceLedger,
  reviewActions,
  ownerLabel,
}: {
  report: Report;
  source: ReportSource;
  history: DecisionHistoryEvent[];
  conditions: string[];
  clearedConditionCount: number;
  openConditionCount: number;
  evidenceLedger: ReturnType<typeof buildEvidenceLedger>;
  reviewActions: Array<ReviewActionItem & { status: ReviewActionStatus }>;
  ownerLabel: string;
}): ReadinessTimelineEvent[] {
  const baseTimestamp = timelineBaseTimestamp(history);
  const analysisProvenance = timelineProvenanceForSource(source);
  const actor = source === "ai"
    ? "Baseline + model-assisted analysis"
    : source === "demo"
      ? "Demo report"
      : "Baseline analysis";
  const events: ReadinessTimelineEvent[] = [
    {
      id: "current-decision",
      title: "Current merge-readiness state",
      timestamp: history[0]?.timestamp ?? baseTimestamp,
      actor: "Lintel workspace",
      provenance: "Local user action",
      category: "Decision",
      summary: `${report.verdict.recommendation.replaceAll("_", " ")} with ${report.verdict.riskLevel} risk, ${openConditionCount} open conditions and ${ownerLabel} as the current owner cue.`,
      area: "Current decision",
      previousState: `${conditions.length} total conditions`,
      nextState: `${openConditionCount} open / ${clearedConditionCount} cleared`,
      movement: "Current state",
      relatedItem: report.pr.title,
      current: true,
    },
    {
      id: "analysis-generated",
      title: "Initial analysis generated",
      timestamp: baseTimestamp,
      actor,
      provenance: analysisProvenance,
      category: "Decision",
      summary: "Lintel created the initial merge-readiness decision from the available PR input. Raw diff content is not stored in this history.",
      area: "Report generation",
      nextState: report.verdict.recommendation.replaceAll("_", " "),
      movement: "Recommendation changed",
      relatedItem: report.pr.repository,
    },
    {
      id: "readiness-score-assigned",
      title: "Readiness score assigned",
      timestamp: baseTimestamp,
      actor,
      provenance: analysisProvenance,
      category: "Decision",
      summary: `${report.verdict.riskLevel} risk was assigned from the current findings, missing evidence, conditions and operational readiness signals.`,
      area: "Readiness score",
      previousState: "Not assessed",
      nextState: `${report.verdict.riskScore}/100`,
      movement: report.verdict.riskLevel === "LOW" ? "Readiness increased" : "Readiness decreased",
      relatedItem: report.verdict.summary,
    },
  ];

  for (const finding of report.findings.slice(0, 8)) {
    events.push({
      id: `finding-${finding.title}`,
      title: "Finding opened",
      timestamp: baseTimestamp,
      actor,
      provenance: finding.provenance === "Model assisted" ? "Model-assisted analysis" : analysisProvenance,
      category: "Evidence",
      summary: finding.evidence,
      area: finding.category,
      nextState: finding.severity,
      movement: "Readiness decreased",
      relatedItem: finding.title,
    });
  }

  for (const condition of conditions.slice(0, 8)) {
    events.push({
      id: `condition-opened-${condition}`,
      title: "Merge condition opened",
      timestamp: baseTimestamp,
      actor,
      provenance: analysisProvenance,
      category: "Evidence",
      summary: condition,
      area: "Merge contract",
      previousState: "No condition",
      nextState: "Open",
      movement: "Readiness decreased",
      relatedItem: condition,
    });
  }

  for (const missingTest of report.missingTests.slice(0, 8)) {
    events.push({
      id: `missing-test-${missingTest}`,
      title: "Missing test added",
      timestamp: baseTimestamp,
      actor,
      provenance: "CI or test evidence",
      category: "Tests",
      summary: missingTest,
      area: "Test plan",
      previousState: "Not covered",
      nextState: "Missing evidence",
      movement: "Evidence weakened",
      relatedItem: missingTest,
    });
  }

  for (const evidence of evidenceLedger.found.slice(0, 5)) {
    events.push({
      id: `evidence-found-${evidence.label}`,
      title: "Evidence added",
      timestamp: baseTimestamp,
      actor,
      provenance: analysisProvenance,
      category: "Evidence",
      summary: evidence.detail,
      area: evidence.relation,
      nextState: evidence.impact,
      movement: "Evidence strengthened",
      relatedItem: evidence.label,
    });
  }

  for (const evidence of evidenceLedger.missing.slice(0, 5)) {
    events.push({
      id: `evidence-missing-${evidence.label}-${evidence.detail}`,
      title: "Evidence gap identified",
      timestamp: baseTimestamp,
      actor,
      provenance: analysisProvenance,
      category: evidence.relation === "Test plan" ? "Tests" : "Evidence",
      summary: evidence.detail,
      area: evidence.relation,
      nextState: evidence.impact,
      movement: "Evidence weakened",
      relatedItem: evidence.label,
    });
  }

  for (const action of reviewActions.filter((item) => actionIsResolved(item.status)).slice(0, 6)) {
    events.push({
      id: `action-resolved-${action.key}`,
      title: "Action completed",
      timestamp: baseTimestamp,
      actor: "Local reviewer",
      provenance: "Local user action",
      category: "Human actions",
      summary: action.reason,
      area: action.source,
      previousState: "Open",
      nextState: action.status,
      movement: "Readiness increased",
      relatedItem: action.title,
    });
  }

  for (const event of history) {
    events.push({
      id: `stored-${event.id}`,
      title: humaniseStoredTimelineTitle(event),
      timestamp: event.timestamp,
      actor: event.label === "Report" ? actor : "Local reviewer",
      provenance: event.label === "Report" ? analysisProvenance : "Local user action",
      category: timelineCategoryForStoredEvent(event),
      summary: event.detail,
      area: timelineAreaForStoredEvent(event),
      previousState: event.previousState,
      nextState: event.nextState,
      movement: timelineMovementForStoredEvent(event),
      relatedItem: event.detail,
    });
  }

  const seen = new Set<string>();
  return events
    .filter((event) => {
      const key = `${event.title}|${event.timestamp}|${event.area}|${event.summary}|${event.previousState ?? ""}|${event.nextState ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      if (a.current) return -1;
      if (b.current) return 1;
      return Date.parse(b.timestamp) - Date.parse(a.timestamp);
    });
}

function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  return <span className={`recommendation recommendation--${recommendation.toLowerCase()}`}>{displayLabel(recommendation)}</span>;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-badge risk-badge--${risk.toLowerCase()}`}>{risk}</span>;
}

function reviewTextKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function ReviewCard({ title, review, findingTitles, calmSummary }: { title: string; review: ReviewArea; findingTitles: string[]; calmSummary?: string }) {
  const findingKeys = new Set(findingTitles.map(reviewTextKey));
  const summary = calmSummary ?? review.summary;
  const showSummary = !findingKeys.has(reviewTextKey(summary));
  const points = calmSummary ? [] : deduplicateReportItems(review.points)
    .filter((point) => !findingKeys.has(reviewTextKey(point)))
    .slice(0, 2);

  return (
    <article className="review-card">
      <div className="section-heading section-heading--compact">
        <h3>{title}</h3>
        <span className={`review-status review-status--${review.status.toLowerCase()}`}>{review.status}</span>
      </div>
      {showSummary && <p>{summary}</p>}
      {points.length > 0 && <ul className="review-points">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>}
    </article>
  );
}

function OperationalArea({ title, items, emptyCopy }: { title: string; items: string[]; emptyCopy: string }) {
  return (
    <article className="operational-area">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      ) : (
        <p>{emptyCopy}</p>
      )}
    </article>
  );
}

function SeverityTag({ severity }: { severity: FindingSeverity }) {
  return <span className={`severity severity--${severity.toLowerCase()}`}>{severity}</span>;
}

const relatedStopWords = new Set([
  "and",
  "are",
  "before",
  "change",
  "changes",
  "confirm",
  "detected",
  "does",
  "each",
  "from",
  "handling",
  "into",
  "needs",
  "path",
  "risk",
  "should",
  "that",
  "the",
  "this",
  "with",
]);

function relatedTokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9_/-]+/g)
      ?.filter((token) => token.length > 2 && !relatedStopWords.has(token)) ?? [],
  );
}

function relatedScore(source: string, candidate: string) {
  const sourceTokens = relatedTokens(source);
  const candidateTokens = relatedTokens(candidate);
  let score = 0;

  for (const token of sourceTokens) {
    if (candidateTokens.has(token)) score += 1;
  }

  return score;
}

function findingContext(finding: Finding) {
  return [
    finding.title,
    finding.category,
    finding.evidence,
    finding.action,
    finding.file ?? "",
  ].join(" ");
}

function affectedFilesForFinding(report: Report, finding: Finding) {
  const context = findingContext(finding).toLowerCase();
  const files = new Set<string>();

  if (finding.file) files.add(finding.file);

  for (const file of report.changedFiles) {
    const path = file.path.toLowerCase();
    const pathParts = path.split("/");
    const basename = pathParts[pathParts.length - 1] ?? path;

    if (context.includes(path) || context.includes(basename)) {
      files.add(file.path);
    }
  }

  return [...files];
}

function bestRelatedText(finding: Finding, items: string[]) {
  const context = findingContext(finding);
  let best: { item: string; score: number } | null = null;

  for (const item of items) {
    const score = relatedScore(context, item);
    if (score > (best?.score ?? 0)) best = { item, score };
  }

  return best && best.score > 0 ? best.item : null;
}

function reviewerFocusForFinding(finding: Finding, focusItems: ReviewerFocus[]) {
  const context = findingContext(finding);
  let best: { item: ReviewerFocus; score: number } | null = null;

  for (const item of focusItems) {
    const score = relatedScore(context, `${item.area} ${item.reason}`);
    const categoryBoost = finding.category === "Security" && item.area === "Security/privacy"
      ? 2
      : finding.category === "API contract" && item.area === "API contract"
        ? 2
        : finding.category === "Reliability" && item.area === "Backend reliability"
          ? 2
          : 0;
    const totalScore = score + categoryBoost;
    if (totalScore > (best?.score ?? 0)) best = { item, score: totalScore };
  }

  return best && best.score > 0 ? best.item : null;
}

function buildEvidenceLedger(report: Report, conditions: string[], focusItems: ReviewerFocus[] | null | undefined) {
  const found: EvidenceLedgerItem[] = [];
  const missing: EvidenceLedgerItem[] = [];

  if (report.findings.length > 0) {
    for (const finding of report.findings) {
      found.push({
        label: finding.title,
        detail: finding.evidence,
        impact: finding.severity === "HIGH" || finding.severity === "CRITICAL" ? "Blocks merge" : "Supports decision",
        relation: finding.file ? `Finding / ${finding.file}` : `Finding / ${finding.category}`,
      });
    }
  }

  if (report.changedFiles.length > 0) {
    found.push({
      label: "Changed file scope identified",
      detail: `${report.changedFiles.length} changed ${report.changedFiles.length === 1 ? "file" : "files"} used to frame the merge-readiness decision.`,
      impact: "Supports decision",
      relation: "Changed files",
    });
  }

  if (report.operationalReadiness) {
    const detectionSignals = deduplicateReportItems(report.operationalReadiness.detectionSignals);
    const observabilityGaps = deduplicateReportItems(report.operationalReadiness.observabilityGaps);
    const recoveryGaps = deduplicateReportItems(report.operationalReadiness.recoveryOrRollback);
    const impactItems = deduplicateReportItems(report.operationalReadiness.customerOrDataImpact);

    if (detectionSignals.length > 0) {
      found.push({
        label: "Detection signals identified",
        detail: detectionSignals.slice(0, 2).join("; "),
        impact: "Supports decision",
        relation: "Operational readiness",
      });
    }

    for (const gap of observabilityGaps.slice(0, 3)) {
      missing.push({
        label: "Observability evidence missing",
        detail: gap,
        impact: "Missing evidence",
        relation: "Operational readiness",
      });
    }

    for (const gap of recoveryGaps.slice(0, 3)) {
      missing.push({
        label: "Recovery evidence needs confirmation",
        detail: gap,
        impact: "Needs human confirmation",
        relation: "Operational readiness",
      });
    }

    if (impactItems.length > 0 && report.operationalReadiness.status === "ATTENTION") {
      missing.push({
        label: "Customer or data impact needs review",
        detail: impactItems.slice(0, 2).join("; "),
        impact: "Needs human confirmation",
        relation: "Operational readiness",
      });
    }
  }

  for (const missingTest of report.missingTests.slice(0, 6)) {
    missing.push({
      label: "Test evidence missing",
      detail: missingTest,
      impact: "Missing evidence",
      relation: "Test plan",
    });
  }

  for (const condition of conditions) {
    missing.push({
      label: "Merge contract condition open",
      detail: condition,
      impact: "Blocks merge",
      relation: "Conditions before merge",
    });
  }

  if (focusItems && focusItems.length > 0) {
    found.push({
      label: "Reviewer focus identified",
      detail: focusItems.map((item) => item.area).slice(0, 4).join(", "),
      impact: "Needs human confirmation",
      relation: "Reviewer focus",
    });
  }

  if (report.reportQuality?.status === "PASS") {
    found.push({
      label: "Report quality checks passed",
      detail: "The generated report is internally consistent and raw-diff-free according to current quality checks.",
      impact: "Ready signal",
      relation: "Report quality",
    });
  } else if (report.reportQuality?.status === "WARNING") {
    missing.push({
      label: "Report quality warning",
      detail: "Review report quality warnings before sharing this report outside the local workspace.",
      impact: "Needs human confirmation",
      relation: "Report quality",
    });
  }

  if (report.verdict.recommendation === "APPROVE" && conditions.length === 0 && report.findings.length === 0 && report.missingTests.length === 0) {
    found.push({
      label: "No merge blockers detected",
      detail: "The report has no risk findings, missing tests or merge conditions.",
      impact: "Ready signal",
      relation: "Merge contract",
    });
  }

  return { found: deduplicateEvidenceItems(found), missing: deduplicateEvidenceItems(missing) };
}

function deduplicateEvidenceItems(items: EvidenceLedgerItem[]) {
  const seen = new Set<string>();
  const deduped: EvidenceLedgerItem[] = [];

  for (const item of items) {
    const key = `${item.label} ${item.detail} ${item.relation}`.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

function textMatches(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function surfaceEvidenceText(report: Report, conditions: string[], focusItems: ReviewerFocus[] | null | undefined) {
  return [
    ...report.changedFiles.map((file) => file.path),
    ...report.findings.flatMap((finding) => [finding.title, finding.category, finding.evidence, finding.action, finding.file ?? ""]),
    ...report.missingTests,
    ...report.suggestedTests.flatMap((test) => [test.title, test.description ?? ""]),
    ...conditions,
    ...report.reviewerChecklist.map((item) => item.label),
    ...(focusItems?.flatMap((item) => [item.area, item.reason]) ?? []),
    report.reviews.security.summary,
    report.reviews.reliability.summary,
    report.reviews.maintainability.summary,
    ...report.reviews.security.points,
    ...report.reviews.reliability.points,
    ...report.reviews.maintainability.points,
    report.operationalReadiness?.summary ?? "",
    ...(report.operationalReadiness?.failureModes ?? []),
    ...(report.operationalReadiness?.detectionSignals ?? []),
    ...(report.operationalReadiness?.observabilityGaps ?? []),
    ...(report.operationalReadiness?.recoveryOrRollback ?? []),
    ...(report.operationalReadiness?.customerOrDataImpact ?? []),
    ...(report.operationalReadiness?.ownerOrReviewerFocus ?? []),
  ].join(" ").toLowerCase();
}

function strongestSurfaceStatus(options: {
  report: Report;
  relatedFindings: Finding[];
  relatedConditions: string[];
  relatedMissingTests: string[];
  attention: boolean;
  readySignal?: boolean;
}): SurfaceStatus {
  const hasSevereFinding = options.relatedFindings.some((finding) => finding.severity === "HIGH" || finding.severity === "CRITICAL");

  if (options.relatedConditions.length > 0 || hasSevereFinding) return "Blocker";
  if (options.relatedMissingTests.length > 0 && options.report.verdict.recommendation === "TESTS_REQUIRED") return "Blocker";
  if (options.relatedFindings.length > 0 || options.relatedMissingTests.length > 0 || options.attention) return "Attention";
  if (options.readySignal) return "Clear";
  return "Watch";
}

function surfaceRelation(surface: AffectedSurface) {
  return `${surface.name} ${surface.reason} ${surface.evidence}`.toLowerCase().replace(/\s+/g, " ").trim();
}

function deduplicateSurfaces(surfaces: AffectedSurface[]) {
  const seen = new Set<string>();
  const deduped: AffectedSurface[] = [];

  for (const surface of surfaces) {
    const key = surfaceRelation(surface);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(surface);
  }

  return deduped;
}

function buildAffectedSurfaces(report: Report, conditions: string[], focusItems: ReviewerFocus[] | null | undefined) {
  const evidenceText = surfaceEvidenceText(report, conditions, focusItems);
  const changedFiles = report.changedFiles.map((file) => file.path);
  const surfaceDefinitions: Array<{
    name: string;
    patterns: RegExp[];
    focusAreas: string[];
    categories: string[];
    action: string;
    attention?: boolean;
    readySignal?: boolean;
  }> = [
    {
      name: "API contract",
      patterns: [/\bapi\b/, /\broute\b/, /\bendpoint\b/, /\bstatus_?code\b/, /\bjsonresponse\b/, /\bresponse shape\b/, /\berror contract\b/, /\bopenapi\b/, /\bclient-facing\b/, /\bfrontend-safe\b/],
      focusAreas: ["API contract", "Docs/API consumer review"],
      categories: ["API contract"],
      action: "Confirm client-facing response shape, status semantics and contract stability.",
    },
    {
      name: "Backend/domain logic",
      patterns: [/\bservice\b/, /\brepository\b/, /\bcontroller\b/, /\bworker\b/, /\bqueue\b/, /\bredemption\b/, /\brefund\b/, /\bpayment\b/, /\bbilling\b/, /\border\b/, /\bcheckout\b/, /\bbackend\b/, /\bserver\b/, /app\/services/, /app\/clients/],
      focusAreas: ["Payments/domain logic"],
      categories: [],
      action: "Review side effects, ownership boundaries, retry behaviour and idempotency assumptions.",
    },
    {
      name: "Data/model/migration",
      patterns: [/\bdatabase\b/, /\bmigration\b/, /\bschema\b/, /\bdata write\b/, /\bdata-write\b/, /\bmodel\b/, /\bprisma\b/, /\bsql\b/, /\brollback\b/, /migrations?\//],
      focusAreas: ["Data/migration"],
      categories: [],
      action: "Confirm migration safety, rollback path, data writes and compatibility with existing records.",
    },
    {
      name: "Auth/session",
      patterns: [/\bauth\b/, /\bauthori[sz]ation\b/, /\bpermission\b/, /\bsession\b/, /\btoken\b/, /\bjwt\b/, /\blogin\b/, /\bcredential\b/],
      focusAreas: ["Security/privacy"],
      categories: ["Security"],
      action: "Review authentication, permissions, token handling and session boundary changes.",
    },
    {
      name: "External providers",
      patterns: [/\bprovider\b/, /\bpartner\b/, /\bexternal\b/, /\bhttp\b/, /\b5xx\b/, /\btimeout\b/, /\bunavailable\b/, /\bfallback\b/],
      focusAreas: [],
      categories: [],
      action: "Verify provider failure handling, timeout behavior, retries and safe fallback boundaries.",
    },
    {
      name: "Operational readiness",
      patterns: [/\boperational\b/, /\bfailure mode\b/, /\brecovery\b/, /\brollback\b/, /\btimeout\b/, /\bretry\b/, /\bunavailable\b/, /\bincident\b/],
      focusAreas: ["Platform/observability"],
      categories: ["Reliability"],
      action: "Confirm failure modes, detection signals, recovery path and customer impact before merge.",
      attention: report.operationalReadiness?.status === "ATTENTION",
      readySignal: report.operationalReadiness?.status === "CLEAR",
    },
    {
      name: "Observability/logging",
      patterns: [/\blogger\b/, /\blogging\b/, /\blog\b/, /\bmetric\b/, /\balert\b/, /\btrace\b/, /\bmonitoring\b/, /\bobservability\b/],
      focusAreas: ["Platform/observability", "Security/privacy"],
      categories: ["Security", "Reliability"],
      action: "Check logs, metrics and alerts are useful without exposing sensitive identifiers or codes.",
    },
    {
      name: "Security/privacy",
      patterns: [/\bsecurity\b/, /\bprivacy\b/, /\buser_id\b/, /\bpartner_id\b/, /\bcustomer_id\b/, /\baccount_id\b/, /\btoken\b/, /\bsecret\b/, /\bcredential\b/, /\bpii\b/, /\bsensitive\b/, /\bexposure\b/],
      focusAreas: ["Security/privacy"],
      categories: ["Security"],
      action: "Confirm sensitive data, identifiers, credentials and error/log exposure are handled safely.",
      attention: report.reviews.security.status === "ATTENTION",
    },
    {
      name: "Frontend/client behavior",
      patterns: [/\bfrontend\b/, /\bbrowser\b/, /\breact\b/, /\bnext\.?js\b/, /\bui\b/, /\banalytics\b/, /\bsendgaevent\b/, /\.tsx\b/, /\.jsx\b/, /app\/.*page\./],
      focusAreas: ["Frontend integration"],
      categories: [],
      action: "Confirm user-facing behavior, browser compatibility, analytics semantics and consumer expectations.",
    },
    {
      name: "Tests/coverage",
      patterns: [/\btest\b/, /\bcoverage\b/, /\bmissing test\b/, /\bsuggested test\b/, /tests?\//, /\.test\./, /\.spec\./],
      focusAreas: ["Backend reliability", "Frontend integration", "API contract"],
      categories: ["Missing tests"],
      action: "Verify focused tests cover the risky behavior and merge contract conditions.",
      readySignal: report.missingTests.length === 0 && report.suggestedTests.length === 0 && changedFiles.some((file) => /tests?\//.test(file.toLowerCase()) || /\.(test|spec)\./.test(file.toLowerCase())),
    },
  ];

  const surfaces = surfaceDefinitions.flatMap((definition): AffectedSurface[] => {
    const focusMatches = focusItems?.filter((item) => definition.focusAreas.includes(item.area)) ?? [];
    const relatedFindings = report.findings.filter((finding) => (
      definition.categories.includes(finding.category)
      || textMatches(findingContext(finding).toLowerCase(), definition.patterns)
    ));
    const relatedConditions = conditions.filter((condition) => textMatches(condition.toLowerCase(), definition.patterns));
    const relatedMissingTests = report.missingTests.filter((test) => textMatches(test.toLowerCase(), definition.patterns));
    const relatedFiles = changedFiles.filter((file) => textMatches(file.toLowerCase(), definition.patterns));
    const hasSignal = textMatches(evidenceText, definition.patterns)
      || focusMatches.length > 0
      || relatedFindings.length > 0
      || relatedConditions.length > 0
      || relatedMissingTests.length > 0
      || relatedFiles.length > 0
      || Boolean(definition.readySignal);

    if (!hasSignal) return [];

    const status = strongestSurfaceStatus({
      report,
      relatedFindings,
      relatedConditions,
      relatedMissingTests,
      attention: Boolean(definition.attention),
      readySignal: definition.readySignal,
    });
    const evidence = relatedConditions[0]
      ? `Merge condition: ${relatedConditions[0]}`
      : relatedFindings[0]
        ? `${relatedFindings[0].category} finding: ${relatedFindings[0].title}`
        : relatedMissingTests[0]
          ? `Missing test: ${relatedMissingTests[0]}`
          : relatedFiles.length > 0
            ? `Changed files: ${relatedFiles.slice(0, 3).join(", ")}`
            : focusMatches[0]
              ? `Reviewer focus: ${focusMatches[0].area}`
              : definition.readySignal
                ? "No missing test gaps or open conditions detected for this surface."
                : "Signal detected in report context.";
    const reason = relatedConditions.length > 0
      ? "Included because an open merge condition touches this surface."
      : relatedFindings.length > 0
        ? "Included because a risk finding touches this surface."
        : relatedMissingTests.length > 0
          ? "Included because missing test evidence touches this surface."
          : relatedFiles.length > 0
            ? "Included because changed files suggest this surface may be affected."
            : focusMatches.length > 0
              ? "Included because reviewer focus routes attention here."
              : definition.readySignal
                ? "Included as a ready signal for the changed surface."
                : "Included because report signals reference this surface.";

    return [{
      name: definition.name,
      status,
      reason,
      evidence,
      action: definition.action,
    }];
  });

  return deduplicateSurfaces(surfaces).sort((a, b) => {
    const rank: Record<SurfaceStatus, number> = { Blocker: 4, Attention: 3, Watch: 2, Clear: 1 };
    return rank[b.status] - rank[a.status] || a.name.localeCompare(b.name);
  });
}

function SourceBadge({ source }: { source: ReportSource }) {
  return <span className={`source-badge source-badge--${source}`}>{sourceLabels[source]}</span>;
}

function firstOrFallback(items: string[], fallback: string) {
  return items.find((item) => item.trim().length > 0) ?? fallback;
}

function componentRank(status: ScoreComponentStatus) {
  if (status === "Drag") return 3;
  if (status === "Watch") return 2;
  return 1;
}

function buildReadinessScoreBreakdown({
  report,
  conditions,
  evidenceLedger,
  affectedSurfaces,
  openConditionCount,
  ownerLabel,
}: {
  report: Report;
  conditions: string[];
  evidenceLedger: ReturnType<typeof buildEvidenceLedger>;
  affectedSurfaces: AffectedSurface[];
  openConditionCount: number;
  ownerLabel: string;
}): ScoreBreakdown {
  const securityFinding = report.findings.find((finding) => finding.category === "Security");
  const securityAttention = report.reviews.security.status === "ATTENTION" || Boolean(securityFinding);
  const blockerSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Blocker").length;
  const attentionSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Attention").length;
  const watchSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Watch").length;
  const missingEvidenceCount = evidenceLedger.missing.length;
  const hasAssignedOwner = !ownerLabel.startsWith("Suggested:") && ownerLabel !== "Unassigned";

  const components: ScoreBreakdownComponent[] = [
    {
      label: "Test coverage",
      status: report.missingTests.length > 0 ? "Drag" : report.suggestedTests.length > 0 ? "Watch" : "Strong",
      explanation: report.missingTests.length > 0
        ? `${report.missingTests.length} missing coverage ${report.missingTests.length === 1 ? "gap is" : "gaps are"} still part of the merge decision.`
        : report.suggestedTests.length > 0
          ? `${report.suggestedTests.length} suggested tests remain useful before merge.`
          : "No missing test gaps are present in this report.",
      improvesWith: report.missingTests.length > 0
        ? "Add the missing focused tests and regenerate or re-check the report."
        : report.suggestedTests.length > 0
          ? "Add or consciously accept the suggested tests based on review judgment."
          : "Keep focused tests passing through CI.",
      relatedEvidence: firstOrFallback(report.missingTests, report.suggestedTests[0]?.title ?? "No missing test evidence detected."),
    },
    {
      label: "Operational readiness",
      status: report.operationalReadiness?.status === "ATTENTION" ? "Drag" : report.operationalReadiness ? "Strong" : "Watch",
      explanation: report.operationalReadiness
        ? report.operationalReadiness.summary
        : "Operational readiness was not assessed on this legacy report.",
      improvesWith: report.operationalReadiness?.status === "ATTENTION"
        ? "Document or verify detection, recovery and rollback paths for the risky behavior."
        : "Keep operational assumptions explicit during final review.",
      relatedEvidence: report.operationalReadiness
        ? firstOrFallback([
          ...report.operationalReadiness.observabilityGaps,
          ...report.operationalReadiness.recoveryOrRollback,
          ...report.operationalReadiness.failureModes,
        ], "No operational gap detected.")
        : "Regenerate the report to assess operational readiness.",
    },
    {
      label: "Security/privacy",
      status: securityAttention ? "Drag" : "Strong",
      explanation: securityAttention
        ? report.reviews.security.summary
        : "No security/privacy attention state is present in this report.",
      improvesWith: securityAttention
        ? "Confirm sensitive data, permissions, identifiers and logging are safe before merge."
        : "Keep normal security review and CI checks in place.",
      relatedEvidence: securityFinding?.title ?? firstOrFallback(report.reviews.security.points, "No security/privacy finding detected."),
    },
    {
      label: "Blast radius",
      status: blockerSurfaceCount > 0 ? "Drag" : attentionSurfaceCount > 0 || watchSurfaceCount > 2 ? "Watch" : "Strong",
      explanation: affectedSurfaces.length > 0
        ? `${affectedSurfaces.length} affected ${affectedSurfaces.length === 1 ? "surface is" : "surfaces are"} identified; ${blockerSurfaceCount} blocker and ${attentionSurfaceCount} attention surfaces.`
        : "No affected surface beyond normal review was identified.",
      improvesWith: blockerSurfaceCount > 0 || attentionSurfaceCount > 0
        ? "Resolve blocker or attention surfaces and confirm the primary review area."
        : "Keep review focused on the listed affected surfaces.",
      relatedEvidence: affectedSurfaces[0]?.evidence ?? "No affected surface evidence detected.",
    },
    {
      label: "Merge conditions",
      status: openConditionCount > 0 ? "Drag" : conditions.length > 0 ? "Watch" : "Strong",
      explanation: openConditionCount > 0
        ? `${openConditionCount} ${openConditionCount === 1 ? "condition remains" : "conditions remain"} open before this report is ready to clear.`
        : conditions.length > 0
          ? "All conditions are locally marked cleared; the recommendation is not changed automatically."
          : "No merge conditions are present.",
      improvesWith: openConditionCount > 0
        ? "Clear or explicitly resolve the remaining merge conditions."
        : "Complete normal human review and CI checks.",
      relatedEvidence: firstOrFallback(conditions, "No merge conditions detected."),
    },
    {
      label: "Evidence quality",
      status: missingEvidenceCount > 2 ? "Drag" : missingEvidenceCount > 0 ? "Watch" : "Strong",
      explanation: missingEvidenceCount > 0
        ? `${missingEvidenceCount} missing evidence ${missingEvidenceCount === 1 ? "item needs" : "items need"} confirmation in the evidence ledger.`
        : "Evidence ledger has no missing evidence items.",
      improvesWith: missingEvidenceCount > 0
        ? "Add the missing proof through tests, review confirmation or documented operational controls."
        : "Keep evidence linked to findings, tests and conditions.",
      relatedEvidence: evidenceLedger.missing[0]?.detail ?? evidenceLedger.found[0]?.detail ?? "No evidence ledger item available.",
    },
    {
      label: "Reviewer confidence",
      status: report.verdict.confidence === "LOW" ? "Drag" : hasAssignedOwner || report.verdict.confidence === "HIGH" ? "Strong" : "Watch",
      explanation: hasAssignedOwner
        ? `${ownerLabel} is selected as the local owner cue. Report confidence is ${report.verdict.confidence}.`
        : `Report confidence is ${report.verdict.confidence}; owner routing is still a local cue.`,
      improvesWith: hasAssignedOwner
        ? "Have the selected owner complete the focused review and update local state."
        : "Assign a local owner cue and complete the focused review path.",
      relatedEvidence: ownerLabel,
    },
  ];

  const strongestPositiveSignal = components.find((component) => component.status === "Strong")?.label ?? "No strong positive signal detected";
  const biggestScoreDrag = [...components].sort((a, b) => componentRank(b.status) - componentRank(a.status))[0];
  const nextAction = components.find((component) => component.status === "Drag")?.improvesWith
    ?? components.find((component) => component.status === "Watch")?.improvesWith
    ?? "Complete normal human review and CI checks.";

  return {
    strongestPositiveSignal,
    biggestScoreDrag: biggestScoreDrag ? `${biggestScoreDrag.label}: ${biggestScoreDrag.explanation}` : "No major score drag detected.",
    nextAction,
    components,
  };
}

function actionOwnerForFinding(finding: Finding, suggestedOwners: ReviewerOwner[]): ReviewerOwner {
  if (finding.category === "Security") return "Security reviewer";
  if (finding.category === "Missing tests") return "Test owner";
  if (finding.category === "API contract") return "Backend reviewer";
  if (finding.category === "Reliability") return suggestedOwners.includes("Platform/operations reviewer") ? "Platform/operations reviewer" : "Backend reviewer";
  return suggestedOwners[0] ?? "Senior reviewer";
}

function actionOwnerForGate(label: string, suggestedOwners: ReviewerOwner[]): ReviewerOwner {
  if (/test/i.test(label)) return "Test owner";
  if (/security|privacy/i.test(label)) return "Security reviewer";
  if (/data|migration/i.test(label)) return "Data/migration reviewer";
  if (/observability|logging|rollback|recovery|failure/i.test(label)) return "Platform/operations reviewer";
  if (/api|contract/i.test(label)) return "Backend reviewer";
  if (/human reviewer/i.test(label)) return suggestedOwners[0] ?? "Senior reviewer";
  return suggestedOwners[0] ?? "Senior reviewer";
}

function addReviewAction(actions: ReviewActionItem[], action: Omit<ReviewActionItem, "key">) {
  const key = reviewActionKey(action.source, action.title);
  if (actions.some((item) => item.key === key)) return;
  actions.push({ ...action, key });
}

function buildReviewActions({
  report,
  conditions,
  evidenceLedger,
  activePolicy,
  readinessScoreBreakdown,
  suggestedOwners,
  clearedConditionKeys,
}: {
  report: Report;
  conditions: string[];
  evidenceLedger: ReturnType<typeof buildEvidenceLedger>;
  activePolicy: ReturnType<typeof reviewPolicyForProfile>;
  readinessScoreBreakdown: ScoreBreakdown;
  suggestedOwners: ReviewerOwner[];
  clearedConditionKeys: Set<string>;
}): ReviewActionItem[] {
  const actions: ReviewActionItem[] = [];
  const defaultOwner = suggestedOwners[0] ?? "Senior reviewer";

  for (const test of report.missingTests.slice(0, 8)) {
    addReviewAction(actions, {
      title: test,
      source: "Missing test",
      priority: report.verdict.recommendation === "TESTS_REQUIRED" ? "Blocker" : "Required",
      suggestedOwner: "Test owner",
      defaultStatus: "Open",
      reason: "Missing test evidence is part of the current merge-readiness decision.",
    });
  }

  for (const condition of conditions) {
    addReviewAction(actions, {
      title: condition,
      source: "Merge condition",
      priority: "Blocker",
      suggestedOwner: defaultOwner,
      defaultStatus: clearedConditionKeys.has(conditionKey(condition)) ? "Done" : "Open",
      reason: "This condition must be resolved or explicitly accepted before merge.",
    });
  }

  for (const finding of report.findings.slice(0, 8)) {
    addReviewAction(actions, {
      title: finding.title,
      source: "Finding",
      priority: finding.severity === "CRITICAL" || finding.severity === "HIGH" ? "Required" : "Recommended",
      suggestedOwner: actionOwnerForFinding(finding, suggestedOwners),
      defaultStatus: "Open",
      reason: finding.action,
    });
  }

  for (const item of evidenceLedger.missing.slice(0, 6)) {
    addReviewAction(actions, {
      title: item.label,
      source: "Evidence gap",
      priority: item.impact === "Blocks merge" ? "Required" : "Recommended",
      suggestedOwner: defaultOwner,
      defaultStatus: "Open",
      reason: item.detail,
    });
  }

  if (report.verdict.recommendation !== "APPROVE") {
    for (const gate of gatesByLevel(activePolicy, "Required")) {
      addReviewAction(actions, {
        title: `Satisfy policy gate: ${gate.label}`,
        source: "Policy gate",
        priority: "Required",
        suggestedOwner: actionOwnerForGate(gate.label, suggestedOwners),
        defaultStatus: "Open",
        reason: gate.description,
      });
    }
  }

  if (report.operationalReadiness?.status === "ATTENTION") {
    addReviewAction(actions, {
      title: "Resolve operational readiness attention",
      source: "Operational/security",
      priority: "Required",
      suggestedOwner: suggestedOwners.includes("Platform/operations reviewer") ? "Platform/operations reviewer" : defaultOwner,
      defaultStatus: "Open",
      reason: report.operationalReadiness.summary,
    });
  }

  if (report.reviews.security.status === "ATTENTION") {
    addReviewAction(actions, {
      title: "Resolve security/privacy attention",
      source: "Operational/security",
      priority: "Required",
      suggestedOwner: "Security reviewer",
      defaultStatus: "Open",
      reason: report.reviews.security.summary,
    });
  }

  if (actions.length > 0 && !/^No major score drag detected/i.test(readinessScoreBreakdown.biggestScoreDrag)) {
    addReviewAction(actions, {
      title: readinessScoreBreakdown.nextAction,
      source: "Readiness score",
      priority: "Recommended",
      suggestedOwner: defaultOwner,
      defaultStatus: "Open",
      reason: readinessScoreBreakdown.biggestScoreDrag,
    });
  }

  const priorityRank: Record<ReviewActionPriority, number> = { Blocker: 4, Required: 3, Recommended: 2, Optional: 1 };
  return actions.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority] || a.title.localeCompare(b.title));
}

function actionIsResolved(status: ReviewActionStatus) {
  return status === "Done" || status === "Not needed";
}

function actionProgressSummary(actions: Array<ReviewActionItem & { status: ReviewActionStatus }>) {
  const openBlockers = actions.filter((action) => action.priority === "Blocker" && !actionIsResolved(action.status)).length;
  const requiredActions = actions.filter((action) => action.priority === "Blocker" || action.priority === "Required");
  const requiredResolved = requiredActions.filter((action) => actionIsResolved(action.status)).length;
  const optionalActions = actions.filter((action) => action.priority === "Recommended" || action.priority === "Optional").length;
  const readinessConclusion = actions.length === 0
    ? "No review actions generated. Complete normal human review and CI checks."
    : openBlockers > 0
      ? `${openBlockers} blocker ${openBlockers === 1 ? "action remains" : "actions remain"} before this report is ready to clear.`
      : requiredResolved < requiredActions.length
        ? `${requiredActions.length - requiredResolved} required ${requiredActions.length - requiredResolved === 1 ? "action remains" : "actions remain"} before merge readiness is clear.`
        : "Required review actions are locally resolved. Complete normal human review and CI checks.";

  return {
    openBlockers,
    requiredResolved,
    requiredTotal: requiredActions.length,
    optionalActions,
    readinessConclusion,
  };
}

function slackHandoffToText({
  report,
  ownerLabel,
  conditions,
  actionProgress,
  humanDecision,
  passportSummary,
  evidenceSummary,
  assumptionSummary,
  builderVerifierSummary,
  mergeContractSummary,
  contractRecheckSummary,
  verificationPackSummary,
  humanDecisionLedgerSummary,
}: {
  report: Report;
  ownerLabel: string;
  conditions: string[];
  actionProgress: ActionProgress;
  humanDecision?: string;
  passportSummary?: string;
  evidenceSummary?: string;
  assumptionSummary?: string;
  builderVerifierSummary?: string;
  mergeContractSummary?: string;
  contractRecheckSummary?: string;
  verificationPackSummary?: string;
  humanDecisionLedgerSummary?: string;
}) {
  const topBlocker = conditions[0]
    ?? report.findings[0]?.title
    ?? "No merge conditions detected.";
  const missingTests = report.missingTests.length > 0
    ? `${report.missingTests.length} missing ${report.missingTests.length === 1 ? "test" : "tests"}`
    : "No missing test gaps detected";
  const reviewerFocus = pruneUnsupportedReviewerFocus(report)?.slice(0, 3).map((focus) => focus.area).join(" / ")
    || "No specialist reviewer focus detected";
  const operationalAttention = report.operationalReadiness?.status === "ATTENTION" || report.reviews.security.status === "ATTENTION"
    ? "Operational/security attention present"
    : "No operational/security attention flagged";

  return [
    `Lintel handoff: ${displayLabel(report.verdict.recommendation)} / ${report.verdict.riskLevel} risk (${report.verdict.riskScore}/100)`,
    `PR: ${report.pr.title}`,
    `Repo: ${report.pr.repository}`,
    `Owner cue: ${ownerLabel}`,
    `Top blocker: ${topBlocker}`,
    `Test signal: ${missingTests}`,
    `Operational signal: ${operationalAttention}`,
    `Reviewer focus: ${reviewerFocus}`,
    `Action progress: ${actionProgress.openBlockers} open blockers; ${actionProgress.requiredResolved}/${actionProgress.requiredTotal} required actions resolved`,
    ...(passportSummary ? [`Change Passport: ${passportSummary}`] : []),
    ...(evidenceSummary ? [`Evidence: ${evidenceSummary}`] : []),
    ...(assumptionSummary ? [`Assumptions: ${assumptionSummary}`] : []),
    ...(builderVerifierSummary ? [`Verification boundary: ${builderVerifierSummary}`] : []),
    ...(mergeContractSummary ? [`Merge Contract: ${mergeContractSummary}`] : []),
    ...(contractRecheckSummary ? [`Contract re-check: ${contractRecheckSummary}`] : []),
    ...(verificationPackSummary ? [`Verification Pack: ${verificationPackSummary}`] : []),
    ...(humanDecisionLedgerSummary ? [`Human decision: ${humanDecisionLedgerSummary}`] : []),
    ...(humanDecision ? [`Human decision: ${humanDecision}`] : []),
    `Next action: ${actionProgress.readinessConclusion}`,
    "",
    "Copy/export only. Lintel did not post this to Slack.",
  ].join("\n");
}

function PassportList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <article>
      <h3>{title}</h3>
      {items.length > 0 ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{empty}</p>}
    </article>
  );
}

function PassportObservations({ title, items, empty }: { title: string; items: ChangePassportComparison["supportedDeclarations"]; empty: string }) {
  return (
    <article>
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={`${item.state}-${item.label}-${item.detail}`}>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
              {(item.evidenceClass || item.provenance) && (
                <small>{[item.evidenceClass, item.provenance].filter(Boolean).join(" · ")}</small>
              )}
            </li>
          ))}
        </ul>
      ) : <p>{empty}</p>}
    </article>
  );
}

function BuilderVerifierBoundarySection({ assessment }: { assessment: BuilderVerifierAssessment }) {
  const sharedCritical = assessment.dimensions.some((item) => item.status === "shared" && (item.key === "provider" || item.key === "model" || item.key === "execution"));
  const unknownCritical = assessment.dimensions.some((item) => item.status === "unknown" && (item.key === "provider" || item.key === "model" || item.key === "execution"));

  return (
    <section className={`section-block builder-verifier-boundary builder-verifier-boundary--${assessment.classification.replaceAll(" ", "-")}`} aria-labelledby="builder-verifier-title">
      <div className="section-heading">
        <div>
          <span className="card-kicker">VERIFICATION BOUNDARY</span>
          <h2 id="builder-verifier-title">Builder–Verifier Boundary</h2>
          <p>Builder declarations are context. Lintel verification is shown separately and does not change the score here.</p>
        </div>
        <span className="section-count">{assessment.classification}</span>
      </div>

      {(sharedCritical || unknownCritical) && (
        <p className={sharedCritical ? "boundary-warning boundary-warning--shared" : "boundary-warning"}>
          {sharedCritical
            ? "Same-context verification may be present. The deterministic baseline still ran where recorded."
            : "Verification separation is not established from available metadata. Unknown remains unknown."}
        </p>
      )}

      <div className="boundary-context-grid">
        <article>
          <span>Builder declared</span>
          <strong>{assessment.builder.producerType}</strong>
          <p>{[assessment.builder.tool, assessment.builder.provider, assessment.builder.model].filter(Boolean).join(" / ") || "No builder tool, provider or model supplied."}</p>
        </article>
        <article>
          <span>Verified by Lintel</span>
          <strong>{assessment.verifier.verifierTypes.filter((item) => item !== "mixed").join(" / ")}</strong>
          <p>{assessment.verifier.deterministicBaselineApplied ? "Deterministic baseline applied." : "Deterministic baseline unknown."}</p>
        </article>
        <article>
          <span>Run / head</span>
          <strong>{assessment.canonicalRunId ? fingerprintPrefix(assessment.canonicalRunId) : "local"}</strong>
          <p>{assessment.headSha ? `Head ${shortSha(assessment.headSha)}` : "Head SHA unavailable."}</p>
        </article>
      </div>

      <p className="boundary-rationale">{assessment.rationale}</p>

      <details className="boundary-details">
        <summary>Inspect separation dimensions</summary>
        <div className="boundary-dimension-grid">
          {assessment.dimensions.map((dimension) => (
            <article key={dimension.key} className={`boundary-dimension boundary-dimension--${dimension.status}`}>
              <span>{dimension.status}</span>
              <strong>{dimension.label}</strong>
              <p>{dimension.rationale}</p>
            </article>
          ))}
        </div>
        {assessment.knownLimitations.length > 0 && (
          <ul className="boundary-limitations">
            {assessment.knownLimitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        )}
      </details>
    </section>
  );
}

function EvidenceLedgerCard({ item }: { item: EvidenceLedgerItem }) {
  return (
    <article className="evidence-ledger-card">
      <div className="evidence-ledger-card-header">
        <span className={`evidence-impact evidence-impact--${item.impact.toLowerCase().replaceAll(" ", "-")}`}>{item.impact}</span>
        <span>{item.relation}</span>
      </div>
      <h3>{item.label}</h3>
      <p>{item.detail}</p>
    </article>
  );
}

function EvidenceHierarchyRow({ record, reference }: { record: EvidenceRecord; reference: string }) {
  const technicalReference = record.supportingReference ?? (record.headSha ? shortSha(record.headSha) : "Not recorded");
  return (
    <details className={`evidence-register-row evidence-register-row--${record.class}`}>
      <summary>
        <code>{reference}</code>
        <span>{evidenceClassLabels[record.class]}</span>
        <strong>{record.title}</strong>
        <span className="evidence-register-state">{record.stale ? "STALE" : record.status.replaceAll("-", " ").toUpperCase()}</span>
      </summary>
      <div className="evidence-register-detail">
        <p>{record.statement}</p>
        <dl>
          <div><dt>Provenance</dt><dd>{record.provenance}</dd></div>
          <div><dt>Source</dt><dd>{record.source}</dd></div>
          <div><dt>Supports</dt><dd>{record.relatedSurfaces.slice(0, 3).join(", ") || "Review context"}</dd></div>
          <div><dt>Technical reference</dt><dd><code>{technicalReference}</code></dd></div>
        </dl>
      </div>
    </details>
  );
}

function AssumptionRegistryRow({
  assumption,
  reference,
  override,
  status,
  onUpdate,
}: {
  assumption: AssumptionRecord;
  reference: string;
  override?: LocalAssumptionOverride;
  status: AssumptionStatus;
  onUpdate: (status: LocalAssumptionOverride["status"]) => void;
}) {
  return (
    <details className={`uncertainty-record assumption-registry-row uncertainty-record--${status}`}>
      <summary>
        <span className="uncertainty-record-state"><code>{reference}</code><span>{uncertaintyStateLabel(status)}</span></span>
        <span className="assumption-registry-main">
          <strong>{assumption.statement}</strong>
          <small>{assumption.importance} · {assumption.source} · {assumption.introducedHeadSha ? shortSha(assumption.introducedHeadSha) : "Local report"}</small>
        </span>
        <span className="assumption-importance">{assumption.importance}</span>
      </summary>
      <div className="assumption-registry-detail">
        <p><strong>Evidence required:</strong> {assumption.evidenceRequired}</p>
        <dl>
          <div><dt>Owner cue</dt><dd>{assumption.ownerCue ?? "Not assigned"}</dd></div>
          <div><dt>Local note</dt><dd>{override?.note ?? "None"}</dd></div>
        </dl>
        <div className="assumption-registry-actions" aria-label={`Actions for ${assumption.statement}`}>
          <button type="button" onClick={() => onUpdate("supported")}>Confirm support</button>
          <button type="button" onClick={() => onUpdate("accepted")}>Accept uncertainty</button>
          <button type="button" onClick={() => onUpdate("invalidated")}>Invalidate</button>
          <button type="button" onClick={() => onUpdate("open")}>Reopen</button>
        </div>
      </div>
    </details>
  );
}

function MergeContractClauseRow({
  clause,
  reference,
  relatedReferences,
  recheckEvaluation,
  status,
  override,
  onUpdate,
  isOpen,
  onDisclosureChange,
}: {
  clause: MergeContractClause;
  reference: string;
  relatedReferences: string[];
  recheckEvaluation?: ContractRecheckClauseEvaluation;
  status: MergeContractClauseStatus;
  override?: LocalClauseOverride;
  onUpdate: (status: LocalClauseOverride["status"]) => void;
  isOpen: boolean;
  onDisclosureChange: (isOpen: boolean) => void;
}) {
  return (
    <details
      className={`merge-contract-clause contract-ledger-row contract-ledger-row--${clause.importance} contract-ledger-row--${status}`}
      open={isOpen}
      onToggle={(event) => onDisclosureChange(event.currentTarget.open)}
    >
      <summary>
        <span className="contract-ledger-reference"><code>{reference}</code></span>
        <span className="merge-contract-clause-main"><strong>{clause.statement}</strong></span>
        <span className="contract-ledger-importance">{clause.importance}</span>
        <span className="contract-ledger-state">{status === "accepted" ? "ACCEPTED RISK" : status.toUpperCase()}</span>
      </summary>
      <div className="contract-ledger-expanded">
        <p className="contract-clause-rationale">{clause.rationale}</p>
      <dl className="contract-ledger-links">
        <div><dt>Clears with</dt><dd>{clause.evidenceRequired}</dd></div>
        <div><dt>Evidence</dt><dd>{clause.currentSupportingEvidenceIds.length > 0 ? `${clause.currentSupportingEvidenceIds.length} supporting record(s)` : "Stronger evidence required"}</dd></div>
        <div><dt>Assumptions</dt><dd>{clause.relatedAssumptionIds.length > 0 ? clause.relatedAssumptionIds.length : "None linked"}</dd></div>
        <div><dt>Related records</dt><dd>{relatedReferences.length > 0 ? relatedReferences.join(", ") : "None linked"}</dd></div>
        <div><dt>Owner cue</dt><dd>{clause.ownerCue ?? "Not assigned"}</dd></div>
        <div><dt>Local reason</dt><dd>{override?.reason ?? "None"}</dd></div>
      </dl>
      {recheckEvaluation && <p className={`contract-recheck-annotation contract-recheck-annotation--${recheckEvaluation.evaluationStatus}`}><strong>{recheckEvaluation.evaluationStatus.replaceAll("-", " ")}</strong> · {recheckEvaluation.explanation}</p>}
      <details className="merge-contract-clause-details">
        <summary>Inspect machine-readable requirements</summary>
        <ul>
          {clause.requirements.map((requirement) => (
            <li key={requirement.requirementId}>
              <strong>{requirement.type}</strong>
              <span>{requirement.description}</span>
              <small>{requirement.currentResult}{requirement.limitation ? ` Â· ${requirement.limitation}` : ""}</small>
            </li>
          ))}
        </ul>
      </details>
      <div className="merge-contract-clause-actions" aria-label={`Actions for ${clause.title}`}>
        <button type="button" onClick={() => onUpdate("satisfied")}>Mark satisfied</button>
        <button type="button" onClick={() => onUpdate("accepted")}>Accept risk</button>
        <button type="button" onClick={() => onUpdate("superseded")}>Supersede</button>
        <button type="button" onClick={() => onUpdate("open")}>Reopen</button>
      </div>
      </div>
    </details>
  );
}

function AffectedSurfaceCard({ surface }: { surface: AffectedSurface }) {
  return (
    <article className="affected-surface-card">
      <div className="affected-surface-card-header">
        <h3>{surface.name}</h3>
        <span className={`surface-status surface-status--${surface.status.toLowerCase()}`}>{surface.status}</span>
      </div>
      <p>{surface.reason}</p>
      <div className="affected-surface-evidence">
        <span>Evidence</span>
        <strong>{surface.evidence}</strong>
      </div>
      <div className="affected-surface-action">
        <span>Reviewer action</span>
        <p>{surface.action}</p>
      </div>
    </article>
  );
}

function ContractRecheckRow({ evaluation }: { evaluation: ContractRecheckClauseEvaluation }) {
  return (
    <details className="contract-recheck-row">
      <summary>
        <span className={`contract-recheck-status contract-recheck-status--${evaluation.evaluationStatus}`}>{evaluation.evaluationStatus.replaceAll("-", " ")}</span>
        <strong>{evaluation.title}</strong>
        <span>{evaluation.importance}</span>
      </summary>
      <div className="contract-recheck-row-detail">
        <p>{evaluation.explanation}</p>
        <dl>
          <div><dt>Previous</dt><dd>{evaluation.previousStatus}</dd></div>
          <div><dt>Current</dt><dd>{evaluation.currentStatus ?? "Unavailable"}</dd></div>
          <div><dt>Action</dt><dd>{evaluation.actionRequired ? "Action required" : "No immediate action from this clause"}</dd></div>
        </dl>
        {evaluation.requirementEvaluations.length > 0 && (
          <ul>
            {evaluation.requirementEvaluations.slice(0, 3).map((requirement) => (
              <li key={requirement.requirementId}>
                <strong>{requirement.currentResult}</strong> · {requirement.explanation}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

function HumanDecisionLedgerRow({ entry, currentHeadSha }: { entry: HumanDecisionLedgerEntry; currentHeadSha?: string }) {
  const applicability = entry.applicableHeadSha && currentHeadSha && entry.applicableHeadSha !== currentHeadSha
    ? "predates current commit"
    : "applies to current commit";
  return (
    <details className="human-ledger-row">
      <summary>
        <span>{entry.eventType.replaceAll("-", " ")}</span>
        <strong>{humanDecisionOutcomeLabel(entry.outcome)}</strong>
        <time dateTime={entry.recordedAt}>{timelineTime(entry.recordedAt)}</time>
      </summary>
      <div className="human-ledger-row-detail">
        <dl>
          <div><dt>Actor</dt><dd>{entry.actor.displayLabel}</dd></div>
          {entry.applicableHeadSha && <div><dt>Commit</dt><dd>{shortSha(entry.applicableHeadSha)}</dd></div>}
          <div><dt>Applicability</dt><dd>{applicability}</dd></div>
        </dl>
        {entry.reason && <p>{entry.reason}</p>}
        {(entry.referencedClauseIds.length > 0 || entry.referencedAssumptionIds.length > 0) && (
          <p>References: {[...entry.referencedClauseIds, ...entry.referencedAssumptionIds].map(fingerprintPrefix).join(", ")}</p>
        )}
        {(entry.supersedesEntryId || entry.reaffirmsEntryId || entry.withdrawsEntryId) && (
          <p>
            {entry.supersedesEntryId && <>Supersedes {fingerprintPrefix(entry.supersedesEntryId)}. </>}
            {entry.reaffirmsEntryId && <>Reaffirms {fingerprintPrefix(entry.reaffirmsEntryId)}. </>}
            {entry.withdrawsEntryId && <>Withdraws/revokes {fingerprintPrefix(entry.withdrawsEntryId)}.</>}
          </p>
        )}
      </div>
    </details>
  );
}

export default function ReportPage() {
  const guidedTour = useGuidedTour();
  const [displayedReport, setDisplayedReport] = useState<{ report: Report; source: ReportSource }>({
    report: demoReport,
    source: "demo",
  });
  const [readinessDelta, setReadinessDelta] = useState<ReadinessDelta | null>(null);
  const [reviewDiff, setReviewDiff] = useState<ReviewDiff | null>(null);
  const [canonicalRun, setCanonicalRun] = useState<CanonicalReviewRunManifest | null>(historicalCanonicalRunManifest(demoReport, "demo"));
  const [changePassport, setChangePassport] = useState<ChangePassport | null>(null);
  const [storedMergeContract, setStoredMergeContract] = useState<MergeContract | null>(null);
  const [storedVerificationPack, setStoredVerificationPack] = useState<VerificationPack | null>(null);
  const [storedContractRecheck, setStoredContractRecheck] = useState<ContractRecheckRecord | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<{ pullRequestId: string; runId: string } | null>(null);
  const [verificationResult, setVerificationResult] = useState<CanonicalRunVerificationRecord | null>(null);
  const [isVerifyingRun, setIsVerifyingRun] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [conditionsCopyState, setConditionsCopyState] = useState<CopyState>("idle");
  const [mergeSummaryCopyState, setMergeSummaryCopyState] = useState<CopyState>("idle");
  const [mergeContractCopyState, setMergeContractCopyState] = useState<CopyState>("idle");
  const [verificationPackJsonCopyState, setVerificationPackJsonCopyState] = useState<CopyState>("idle");
  const [verificationPackMarkdownCopyState, setVerificationPackMarkdownCopyState] = useState<CopyState>("idle");
  const [verificationPackDownloadState, setVerificationPackDownloadState] = useState<DownloadState>("idle");
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [clearedConditionKeys, setClearedConditionKeys] = useState<Set<string>>(new Set());
  const [activeDossierSection, setActiveDossierSection] = useState<DossierSectionId>("what-changed");
  const [decisionSheetOpen, setDecisionSheetOpen] = useState(false);

  useEffect(() => {
    const closeForShellNavigation = () => setDecisionSheetOpen(false);
    window.addEventListener(SHELL_NAVIGATION_OPEN_EVENT, closeForShellNavigation);
    return () => window.removeEventListener(SHELL_NAVIGATION_OPEN_EVENT, closeForShellNavigation);
  }, []);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("All");
  const [reviewDiffFilter, setReviewDiffFilter] = useState<(typeof reviewDiffFilters)[number]>("All");
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>(null);
  const [studioDecision, setStudioDecision] = useState<StudioHumanDecision>("Review required");
  const [decisionStudioExpanded, setDecisionStudioExpanded] = useState(false);
  const [acceptedRiskReason, setAcceptedRiskReason] = useState("");
  const [studioDecisionState, setStudioDecisionState] = useState<CopyState>("idle");
  const [includeLocalNoteInMergeSummary, setIncludeLocalNoteInMergeSummary] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [quickActionMessage, setQuickActionMessage] = useState<{ state: QuickActionMessageState; text: string } | null>(null);
  const [reviewState, setReviewState] = useState<ReportReviewState>(() => defaultReviewState(demoReport));
  const [workspaceStore, setWorkspaceStore] = useState<WorkspaceStore | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryEvent[]>(() => initialDecisionHistory(demoReport, demoReport.pr.updatedAt));
  const [humanDecisionLedger, setHumanDecisionLedger] = useState<HumanDecisionLedger>(() => createEmptyHumanDecisionLedger(
    { report: demoReport, canonicalRun: historicalCanonicalRunManifest(demoReport, "demo") },
    demoReport.pr.updatedAt,
  ));
  const [actionStatusOverrides, setActionStatusOverrides] = useState<Record<string, ReviewActionStatus>>({});
  const [assumptionOverrides, setAssumptionOverrides] = useState<Record<string, LocalAssumptionOverride>>({});
  const [clauseOverrides, setClauseOverrides] = useState<Record<string, LocalClauseOverride>>({});
  const [openContractClauseIds, setOpenContractClauseIds] = useState<Set<string>>(new Set());
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conditionsCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergeSummaryCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergeContractCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verificationPackJsonCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verificationPackMarkdownCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verificationPackDownloadResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickActionResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const studioDecisionResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteHistoryBaselineRef = useRef("");
  const decisionRailRef = useRef<HTMLElement | null>(null);
  const decisionSheetTriggerRef = useRef<HTMLButtonElement | null>(null);
  const decisionSheetReturnFocusRef = useRef<HTMLElement | null>(null);
  const contractDisclosureKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") return;

    const storedReport = sessionStorage.getItem(GENERATED_REPORT_STORAGE_KEY);

    if (!storedReport) return;

    try {
      const parsedReport: unknown = JSON.parse(storedReport);

      if (isStoredReport(parsedReport)) {
        setDisplayedReport(parsedReport);
        setReadinessDelta(isReadinessDelta(parsedReport.readinessDelta) ? parsedReport.readinessDelta : null);
        setReviewDiff(isReviewDiff(parsedReport.reviewDiff) ? parsedReport.reviewDiff : null);
        setCanonicalRun(isCanonicalRun(parsedReport.canonicalRun) ? parsedReport.canonicalRun : historicalCanonicalRunManifest(parsedReport.report, "github-pr"));
        setChangePassport(isChangePassport(parsedReport.changePassport) ? parsedReport.changePassport : null);
        setStoredMergeContract(isMergeContract(parsedReport.mergeContract) ? parsedReport.mergeContract : null);
        setStoredVerificationPack(isVerificationPack(parsedReport.verificationPack) ? parsedReport.verificationPack : null);
        setStoredContractRecheck(isContractRecheck(parsedReport.contractRecheck) ? parsedReport.contractRecheck : null);
        setVerificationTarget(isVerificationTarget(parsedReport.verificationTarget) ? parsedReport.verificationTarget : null);
        setVerificationResult(null);
        if (parsedReport.initialTab === "review-diff") setActiveDossierSection("appendix");
        return;
      }

      if (isReport(parsedReport)) {
        setDisplayedReport({ report: parsedReport, source: "deterministic" });
        setReadinessDelta(null);
        setReviewDiff(null);
        setCanonicalRun(historicalCanonicalRunManifest(parsedReport, "manual"));
        setChangePassport(null);
        setStoredMergeContract(null);
        setStoredVerificationPack(null);
        setStoredContractRecheck(null);
        setVerificationTarget(null);
        setVerificationResult(null);
        return;
      }

      sessionStorage.removeItem(GENERATED_REPORT_STORAGE_KEY);
    } catch {
      sessionStorage.removeItem(GENERATED_REPORT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    if (conditionsCopyResetTimer.current) clearTimeout(conditionsCopyResetTimer.current);
    if (mergeSummaryCopyResetTimer.current) clearTimeout(mergeSummaryCopyResetTimer.current);
    if (mergeContractCopyResetTimer.current) clearTimeout(mergeContractCopyResetTimer.current);
    if (verificationPackJsonCopyResetTimer.current) clearTimeout(verificationPackJsonCopyResetTimer.current);
    if (verificationPackMarkdownCopyResetTimer.current) clearTimeout(verificationPackMarkdownCopyResetTimer.current);
    if (verificationPackDownloadResetTimer.current) clearTimeout(verificationPackDownloadResetTimer.current);
    if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
    if (quickActionResetTimer.current) clearTimeout(quickActionResetTimer.current);
    if (studioDecisionResetTimer.current) clearTimeout(studioDecisionResetTimer.current);
  }, []);

  useEffect(() => {
    function handleQuickActionShortcut(event: globalThis.KeyboardEvent) {
      const isQuickActionShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isTextEntry = isReportTextEntry(event.target);

      if (isQuickActionShortcut && !isTextEntry) {
        event.preventDefault();
        setQuickActionsOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setQuickActionsOpen(false);
      }
    }

    window.addEventListener("keydown", handleQuickActionShortcut);
    return () => window.removeEventListener("keydown", handleQuickActionShortcut);
  }, []);

  useEffect(() => {
    function handleReportEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape" || isReportTextEntry(event.target)) return;
      if (selectedTimelineEventId !== null) setSelectedTimelineEventId(null);
    }

    window.addEventListener("keydown", handleReportEscape);
    return () => window.removeEventListener("keydown", handleReportEscape);
  }, [selectedTimelineEventId]);

  useEffect(() => {
    function handleTourTab(event: Event) {
      const target = (event as CustomEvent<string>).detail;
      const section = dossierSectionForLegacyTarget(target);
      setActiveDossierSection(section);
      window.setTimeout(() => document.getElementById(`dossier-${section}`)?.scrollIntoView({ block: "start" }), 0);
    }

    window.addEventListener("lintel:tour-tab", handleTourTab);
    return () => window.removeEventListener("lintel:tour-tab", handleTourTab);
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-dossier-section]"));
    if (sections.length === 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      const section = visible?.target.getAttribute("data-dossier-section") as DossierSectionId | null;
      if (section) setActiveDossierSection(section);
    }, { rootMargin: "-112px 0px -58% 0px", threshold: [0.05, 0.25, 0.6] });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [displayedReport.report]);

  useEffect(() => {
    if (!decisionSheetOpen || !window.matchMedia("(max-width: 900px)").matches) return;
    const rail = decisionRailRef.current;
    if (!rail) return;

    const focusable = Array.from(rail.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled]), input:not([disabled]), details > summary"))
      .filter((element) => element.offsetParent !== null);
    const focusFrame = window.requestAnimationFrame(() => focusable[0]?.focus());

    function handleSheetKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setDecisionSheetOpen(false);
        window.setTimeout(() => (decisionSheetReturnFocusRef.current ?? decisionSheetTriggerRef.current)?.focus(), 0);
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleSheetKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleSheetKeyDown);
    };
  }, [decisionSheetOpen]);

  const { report, source } = displayedReport;
  const { pr, verdict } = report;
  const reportRenderTimestamp = canonicalRun?.completedAt ?? canonicalRun?.createdAt ?? report.pr.updatedAt;
  const supportedReviewerFocus = pruneUnsupportedReviewerFocus(report);
  const activePolicy = reviewPolicyForProfile(pr.reviewProfile);
  const activePolicyStatus = policyStatusForReport(report, activePolicy);
  const decisionHistoryKey = decisionHistoryKeyForReport(report);
  const humanDecisionLedgerKey = humanDecisionLedgerKeyForReport(report);
  const displayedConditions = reportConditions(report);
  const displayedConditionSignature = displayedConditions.join("\n");
  const conditionTrackingEnabled = (verdict.recommendation === "TESTS_REQUIRED" || verdict.recommendation === "REVIEW_REQUIRED")
    && displayedConditions.length > 0;
  const clearedConditionCount = displayedConditions.filter((condition) => clearedConditionKeys.has(conditionKey(condition))).length;
  const findingTitles = report.findings.map((finding) => finding.title);
  const cleanApprove = verdict.recommendation === "APPROVE"
    && report.findings.length === 0
    && report.missingTests.length === 0
    && report.suggestedTests.length === 0
    && report.operationalReadiness?.status === "CLEAR";
  const displayedReviewerChecklist = cleanApprove ? [] : report.reviewerChecklist;
  const conditionProgressLabel = conditionProgressSummary(clearedConditionCount, displayedConditions.length);
  const openConditionCount = Math.max(displayedConditions.length - clearedConditionCount, 0);
  const lastDecisionUpdate = decisionHistory[0]?.timestamp ?? reviewState.updatedAt;
  const operationalStatus = report.operationalReadiness?.status ?? "Not assessed";
  const qualityStatus = report.reportQuality?.status ?? "Not assessed";
  const currentWorkspace: TeamWorkspace | null = workspaceStore ? activeWorkspace(workspaceStore) : null;
  const suggestedOwners = suggestedReviewerOwners(report);
  const displayedOwner = ownerDisplay(reviewState.owner, suggestedOwners);
  const actorMember = findMemberByOwnerLabel(currentWorkspace, reviewState.owner);
  const reportOwnerOptions = [
    "Unassigned",
    ...(currentWorkspace ? activeAssignableMembers(currentWorkspace).map((member) => member.displayName) : []),
    ...REVIEW_OWNER_OPTIONS.filter((owner) => owner !== "Unassigned"),
  ].filter((owner, index, values) => values.indexOf(owner) === index);
  const reportOwnerIsHistorical = reviewState.owner !== "Unassigned" && !reportOwnerOptions.includes(reviewState.owner);
  const studioDecisionText = studioDecisionLabel(studioDecision, acceptedRiskReason);
  const studioReviewState: ReportReviewState = {
    ...reviewState,
    status: reviewStatusFromStudioDecision(studioDecision),
    note: studioDecisionNote(reviewState, studioDecision, acceptedRiskReason),
  };
  const reviewerFocusSummary = supportedReviewerFocus
    ? supportedReviewerFocus.length > 0
      ? `${supportedReviewerFocus.length} ${supportedReviewerFocus.length === 1 ? "area" : "areas"} / ${supportedReviewerFocus[0].area}`
      : "No specialist focus"
    : "Not assessed";
  const evidenceLedger = buildEvidenceLedger(report, displayedConditions, supportedReviewerFocus);
  const evidenceHierarchy = buildEvidenceHierarchy(report, changePassport, {
    runId: canonicalRun?.runId,
    headSha: canonicalRun?.headSha,
    createdAt: reportRenderTimestamp,
  });
  const evidenceSummary = evidenceHandoffSummary(evidenceHierarchy);
  const assumptionSummary = assumptionHandoffSummary(evidenceHierarchy);
  const currentAssumptionStateKey = assumptionStateKey(report, canonicalRun?.runId);
  const displayedAssumptions = evidenceHierarchy.assumptions.map((assumption) => {
    const override = assumptionOverrides[assumption.assumptionId];
    const status = assumptionDisplayStatus(assumption, override, canonicalRun?.headSha);
    return { assumption, override, status };
  });
  const affectedSurfaces = buildAffectedSurfaces(report, displayedConditions, supportedReviewerFocus);
  const readinessScoreBreakdown = buildReadinessScoreBreakdown({
    report,
    conditions: displayedConditions,
    evidenceLedger,
    affectedSurfaces,
    openConditionCount,
    ownerLabel: displayedOwner,
  });
  const baseReviewActions = buildReviewActions({
    report,
    conditions: displayedConditions,
    evidenceLedger,
    activePolicy,
    readinessScoreBreakdown,
    suggestedOwners,
    clearedConditionKeys,
  });
  const actionSignature = baseReviewActions.map((action) => action.key).join("\n");
  const reviewActions = baseReviewActions.map((action) => ({
    ...action,
    status: actionStatusOverrides[action.key] ?? action.defaultStatus,
  }));
  const reviewActionProgress = actionProgressSummary(reviewActions);
  const reportTopBlocker = displayedConditions[0] ?? report.findings[0]?.title ?? "No merge conditions detected.";
  const reportNextDecisionAction = reportNextAction(report, displayedConditions, operationalStatus);
  const baseReadinessTimeline = buildReadinessTimeline({
    report,
    source,
    history: decisionHistory,
    conditions: displayedConditions,
    clearedConditionCount,
    openConditionCount,
    evidenceLedger,
    reviewActions,
    ownerLabel: displayedOwner,
  });
  const latestHumanDecisionEvent = decisionHistory.find((event) => (
    event.type === "human-decision-recorded" || event.type === "accepted-risk-recorded"
  ));
  const staleHumanDecision = latestHumanDecisionEvent
    && readinessDelta
    && readinessDelta.classification !== "initial"
    && Date.parse(latestHumanDecisionEvent.timestamp) < Date.parse(readinessDelta.generatedAt)
    ? latestHumanDecisionEvent
    : null;
  const staleDecisionNotice = staleHumanDecision && readinessDelta ? (
    <p className="delta-stale-warning" role="status">
      <strong>Decision predates latest commit.</strong> “{staleHumanDecision.title}” was recorded {timelineTime(staleHumanDecision.timestamp)},
      before the analysis at <code>{shortSha(readinessDelta.currentHeadSha)}</code>. Re-confirm it against the current head.
    </p>
  ) : null;
  const builderVerifierAssessment = buildBuilderVerifierAssessment({
    passport: changePassport,
    repository: report.pr.repository,
    pullRequestNumber: report.pr.number,
    headSha: canonicalRun?.headSha,
    canonicalRunId: canonicalRun?.runId,
    analysisSource: canonicalRun?.analysisSource ?? (source === "demo" ? "demo" : "deterministic"),
    provider: canonicalRun?.provider,
    model: canonicalRun?.model,
    generatorVersion: canonicalRun?.generatorVersion ?? "historical",
    deterministicRulesetVersion: canonicalRun?.deterministicRulesetVersion ?? "historical",
    humanDecisionPresent: !!latestHumanDecisionEvent,
    createdAt: reportRenderTimestamp,
  });
  const builderVerifierSummary = builderVerifierHandoffSummary(builderVerifierAssessment);
  const generatedMergeContract = buildMergeContract({
    report,
    changePassport,
    evidenceHierarchy,
    builderVerifier: builderVerifierAssessment,
    canonicalRunId: canonicalRun?.runId,
    baseSha: canonicalRun?.baseSha,
    headSha: canonicalRun?.headSha,
    sourceType: canonicalRun?.sourceType ?? source,
    reviewMode: canonicalRun?.reviewMode ?? pr.reviewProfile ?? "standard",
    createdAt: reportRenderTimestamp,
  });
  const mergeContract = storedMergeContract ?? generatedMergeContract;
  const mergeContractStateKey = contractStateKey(mergeContract);
  const displayedContractClauses = mergeContract.clauses.map((clause) => {
    const override = clauseOverrides[clause.clauseId];
    return { clause, override, status: clauseDisplayStatus(clause, override, canonicalRun?.headSha) };
  });
  const mergeContractBlockingOpen = displayedContractClauses.filter(({ clause, status }) => clause.importance === "blocking" && status === "open").length;
  const openBlockingClauseIds = displayedContractClauses
    .filter(({ clause, status }) => clause.importance === "blocking" && status === "open")
    .map(({ clause }) => clause.clauseId);
  const initialOpenContractClauseId = openBlockingClauseIds[0];
  const allOpenBlockersExpanded = openBlockingClauseIds.length > 0
    && openBlockingClauseIds.every((clauseId) => openContractClauseIds.has(clauseId));
  const mergeContractAdvisoryOpen = displayedContractClauses.filter(({ clause, status }) => clause.importance === "advisory" && status === "open").length;
  const mergeContractSatisfied = displayedContractClauses.filter(({ status }) => status === "satisfied").length;
  const mergeContractAccepted = displayedContractClauses.filter(({ status }) => status === "accepted").length;
  const mergeContractSummaryText = mergeContractSummary(mergeContract);
  const contractRecheck = storedContractRecheck;
  const contractRecheckSummaryText = contractRecheckSummary(contractRecheck);
  const contractRecheckNewlySatisfied = contractRecheck?.clauseEvaluations.filter((item) => item.evaluationStatus === "newly-satisfied").length ?? 0;
  const contractRecheckReopened = contractRecheck?.clauseEvaluations.filter((item) => item.evaluationStatus === "reopened").length ?? 0;
  const contractRecheckStillOpen = contractRecheck?.clauseEvaluations.filter((item) => item.evaluationStatus === "still-open").length ?? 0;
  const contractRecheckStaleEvidenceOrAssumptions = contractRecheck
    ? contractRecheck.evidenceChanges.evidenceBecameStale + contractRecheck.assumptionChanges.stale + contractRecheck.assumptionChanges.acceptedStale
    : 0;
  const humanDecisionLedgerContext = {
    report,
    canonicalRun,
    mergeContract,
    contractRecheck,
    currentHeadSha: canonicalRun?.headSha ?? readinessDelta?.currentHeadSha,
  };
  const humanDecisionProjection = projectHumanDecisionLedger(humanDecisionLedger, humanDecisionLedgerContext.currentHeadSha);
  const humanDecisionDivergence = recommendationDivergenceForReport(report, humanDecisionProjection.latestEffectiveEntry);
  const humanDecisionLedgerSummaryText = humanDecisionLedgerSummary(humanDecisionLedger, report, humanDecisionLedgerContext.currentHeadSha);
  const verificationPack = buildVerificationPack({
    report,
    canonicalRun,
    changePassport,
    evidenceHierarchy,
    builderVerifier: builderVerifierAssessment,
    mergeContract,
    readinessDelta,
    reviewDiff,
    contractRecheck,
    humanDecisionLedger,
    reviewState: studioReviewState,
    decisionHistory,
    sourceType: canonicalRun?.sourceType ?? source,
    sourceUrl: storedVerificationPack?.changeIdentity.sourceUrl,
    createdAt: reportRenderTimestamp,
  });
  const verificationPackSummary = verificationPackHandoffSummary(verificationPack);
  const verificationPackMarkdown = verificationPackToMarkdown(verificationPack);
  const verificationPackJsonText = verificationPackJson(verificationPack);

  const readinessTimeline = [
    ...[...humanDecisionLedger.entries].reverse().slice(0, 6).map(humanLedgerTimelineEvent),
    ...(contractRecheck ? [contractRecheckTimelineEvent(contractRecheck)] : []),
    ...(readinessDelta ? [deltaTimelineEvent(readinessDelta)] : []),
    ...baseReadinessTimeline,
  ];
  const reviewDiffAllItems = reviewDiff ? reviewDiffItems(reviewDiff) : [];
  const reviewDiffActiveFilters = reviewDiff && reviewDiff.mergeConditions.some((item) => item.status === "reopened")
    ? reviewDiffFilters
    : reviewDiffFilters.filter((filter) => filter !== "Reopened");
  const reviewDiffVisibleCount = reviewDiff ? reviewDiffAllItems.filter((item) => reviewDiffFilterMatches(item, reviewDiffFilter)).length : 0;
  const filteredTimeline = readinessTimeline.filter((event) => timelineFilter === "All" || event.category === timelineFilter);
  const selectedTimelineEvent = readinessTimeline.find((event) => event.id === selectedTimelineEventId) ?? null;
  const readinessTimelineSignature = readinessTimeline.map((event) => event.id).join("\n");
  const passportComparison = compareChangePassport(changePassport, report);
  const passportSummary = passportHandoffSummary(changePassport, passportComparison);
  const slackHandoffText = slackHandoffToText({
    report,
    ownerLabel: displayedOwner,
    conditions: displayedConditions,
    actionProgress: reviewActionProgress,
    humanDecision: studioDecisionText,
    passportSummary,
    evidenceSummary,
    assumptionSummary,
    builderVerifierSummary,
    mergeContractSummary: mergeContractSummaryText,
    contractRecheckSummary: contractRecheck ? contractRecheckSummaryText : undefined,
    verificationPackSummary,
    humanDecisionLedgerSummary: humanDecisionLedgerSummaryText,
  });
  const mergeSummaryMarkdown = mergeSummaryToMarkdown(report, {
    sourceLabel: sourceLabels[source],
    reviewState: studioReviewState,
    includeLocalNote: includeLocalNoteInMergeSummary,
    actionProgress: `${reviewActionProgress.openBlockers} open blockers; ${reviewActionProgress.requiredResolved}/${reviewActionProgress.requiredTotal} required actions resolved. Human decision: ${studioDecisionText}. ${reviewActionProgress.readinessConclusion}`,
    passportSummary,
    evidenceSummary,
    assumptionSummary,
    builderVerifierSummary,
    mergeContractSummary: mergeContractSummaryText,
    contractRecheckSummary: contractRecheck ? contractRecheckSummaryText : undefined,
    verificationPackSummary,
    humanDecisionLedgerSummary: humanDecisionLedgerSummaryText,
  });
  const blockerSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Blocker").length;
  const confirmationSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Attention" || surface.status === "Watch").length;
  const primaryAffectedSurface = affectedSurfaces[0]?.name ?? "No affected surface detected";
  const readinessConclusion = displayedConditions.length === 0
    ? "No merge conditions detected. Complete normal human review and CI checks."
    : openConditionCount === 0
      ? "All merge contract conditions are locally marked cleared. Recommendation is not changed automatically."
      : `${openConditionCount} ${openConditionCount === 1 ? "merge condition remains" : "merge conditions remain"} open before this report is ready to clear.`;
  const missingProofCount = Math.max(report.missingTests.length, evidenceLedger.missing.length);
  const dossierSections: Array<{ id: DossierSectionId; label: string; count?: string }> = [
    { id: "what-changed", label: "What changed", count: `${report.changedFiles.length}` },
    { id: "observed", label: "What Lintel observed", count: `${report.findings.length}` },
    { id: "uncertain", label: "Uncertain or missing", count: `${missingProofCount}` },
    { id: "merge-contract", label: "Merge Contract", count: `${mergeContractBlockingOpen}` },
    { id: "appendix", label: "Appendix" },
  ];
  const becauseClause = mergeContractBlockingOpen === 0 && missingProofCount === 0
    ? "No open blocking requirements or missing proofs are recorded."
    : `Held back by ${mergeContractBlockingOpen === 1 ? "1 open blocking requirement" : `${mergeContractBlockingOpen} open blocking requirements`} and ${missingProofCount === 1 ? "1 missing proof" : `${missingProofCount} missing proofs`}.`;
  const evidenceReferenceById = new Map(evidenceHierarchy.records.map((record, index) => [record.evidenceId, `E${index + 1}`]));
  const assumptionReferenceById = new Map(displayedAssumptions.map(({ assumption }, index) => [assumption.assumptionId, `A${index + 1}`]));
  const findingReferenceById = new Map<string, string>();
  report.findings.forEach((finding, index) => {
    findingReferenceById.set(`finding-${index}`, `F${index + 1}`);
    findingReferenceById.set(`finding-${normalizedRecordKey(finding.title)}`, `F${index + 1}`);
  });
  const testReferenceById = new Map(report.missingTests.map((test, index) => [`test-gap-${index}`, `M${index + 1}`]));
  const contractRecheckByClauseId = new Map((contractRecheck?.clauseEvaluations ?? []).map((evaluation) => [evaluation.clauseId, evaluation]));
  const contractRelatedReferencesById = new Map(displayedContractClauses.map(({ clause }) => [
    clause.clauseId,
    [...new Set([
      ...clause.relatedFindingIds.flatMap((id) => findingReferenceById.get(id) ?? []),
      ...clause.relatedTestGapIds.flatMap((id) => testReferenceById.get(id) ?? []),
      ...clause.relatedEvidenceIds.flatMap((id) => evidenceReferenceById.get(id) ?? []),
      ...clause.relatedAssumptionIds.flatMap((id) => assumptionReferenceById.get(id) ?? []),
    ])],
  ]));
  const findingRelatedContractReferences = report.findings.map((finding, findingIndex) => {
    const relatedFindingIds = new Set([
      `finding-${findingIndex}`,
      `finding-${normalizedRecordKey(finding.title)}`,
    ]);
    return displayedContractClauses.flatMap(({ clause }, clauseIndex) => (
      clause.relatedFindingIds.some((id) => relatedFindingIds.has(id)) ? [`C${clauseIndex + 1}`] : []
    ));
  });
  const findingEvidenceRecords = report.findings.map((finding, index) => evidenceHierarchy.records.filter((record) => (
    record.relatedFindingIds.includes(`finding-${index}`)
    || record.relatedFindingIds.includes(`finding-${normalizedRecordKey(finding.title)}`)
  )));
  const traceNodes: Array<{ label: string; href: string; state: VerificationTraceState; decision?: boolean }> = [
    { label: "Change", href: "#dossier-what-changed", state: report.changedFiles.length > 0 ? "satisfied" : (pr.title || pr.repository) ? "partial" : "unavailable" },
    { label: "Observation", href: "#dossier-observed", state: report.findings.length > 0 || report.operationalReadiness || canonicalRun ? "satisfied" : "partial" },
    {
      label: "Evidence",
      href: "#dossier-evidence-register",
      state: evidenceHierarchy.records.length === 0
        ? "unavailable"
        : evidenceHierarchy.records.some((record) => record.status === "missing" || record.status === "unverified" || record.stale)
          ? "partial"
          : "satisfied",
    },
    {
      label: "Requirement",
      href: "#dossier-merge-contract",
      state: displayedContractClauses.length === 0
        ? displayedConditions.length > 0 ? "partial" : "unavailable"
        : mergeContractBlockingOpen > 0
          ? mergeContractSatisfied > 0 ? "partial" : "open"
          : mergeContractAccepted > 0 ? "partial" : "satisfied",
    },
    {
      label: "Human decision",
      href: "#human-decision-record",
      decision: true,
      state: !humanDecisionProjection.latestEffectiveEntry
        ? "open"
        : humanDecisionProjection.applicability === "applicable" ? "satisfied" : "partial",
    },
  ];
  const deltaSummary = readinessDelta?.previousHeadSha
    ? `Since ${shortSha(readinessDelta.previousHeadSha)}: ${readinessDelta.openedMergeConditions.length} opened · ${readinessDelta.clearedMergeConditions.length} cleared · score ${readinessDelta.previousScore ?? "—"} → ${readinessDelta.currentScore}`
    : null;
  const studioDecisionDiverges = !studioDecisionMatchesRecommendation(studioDecision, verdict.recommendation);
  const studioDecisionReasonRequired = studioDecisionDiverges || studioDecision === "Approved with accepted risk";
  const currentHumanDecision = humanDecisionProjection.latestEffectiveEntry;

  useEffect(() => {
    try {
      setClearedConditionKeys(readConditionProgress(window.localStorage, report, displayedConditions));
    } catch {
      setClearedConditionKeys(new Set());
    }
  }, [report, displayedConditionSignature]);

  useEffect(() => {
    try {
      setAssumptionOverrides(readAssumptionOverrides(window.localStorage, currentAssumptionStateKey));
    } catch {
      setAssumptionOverrides({});
    }
  }, [currentAssumptionStateKey]);

  useEffect(() => {
    try {
      setClauseOverrides(readClauseOverrides(window.localStorage, mergeContractStateKey));
    } catch {
      setClauseOverrides({});
    }
  }, [mergeContractStateKey]);

  useEffect(() => {
    if (contractDisclosureKeyRef.current === mergeContract.contractId) return;
    contractDisclosureKeyRef.current = mergeContract.contractId;
    setOpenContractClauseIds(new Set(initialOpenContractClauseId ? [initialOpenContractClauseId] : []));
  }, [mergeContract.contractId, initialOpenContractClauseId]);

  useEffect(() => {
    try {
      setHumanDecisionLedger(readHumanDecisionLedger(window.localStorage, humanDecisionLedgerKey, humanDecisionLedgerContext, reviewState));
    } catch {
      setHumanDecisionLedger(createEmptyHumanDecisionLedger(humanDecisionLedgerContext));
    }
  }, [humanDecisionLedgerKey, canonicalRun?.runId, canonicalRun?.headSha, mergeContract.contractId, contractRecheck?.recheckId, reviewState.updatedAt]);

  useEffect(() => {
    try {
      setWorkspaceStore(ensureWorkspaceStore(window.localStorage));
    } catch {
      setWorkspaceStore(null);
    }
  }, []);

  useEffect(() => {
    try {
      const store = ensureWorkspaceStore(window.localStorage);
      setWorkspaceStore(store);
      const key = workspaceScopedReviewKey(store.activeWorkspaceId, reviewStateKeyForReport(report));
      const allStates = readReviewStates(window.localStorage);
      const savedState = allStates[key] ?? readReviewState(window.localStorage, report);
      setReviewState(savedState);
      setStudioDecision(studioDecisionFromReviewState(savedState.status));
      setDecisionStudioExpanded(false);
      setAcceptedRiskReason("");
      noteHistoryBaselineRef.current = savedState.note;
    } catch {
      const fallbackState = defaultReviewState(report);
      setReviewState(fallbackState);
      setStudioDecision(studioDecisionFromReviewState(fallbackState.status));
      setDecisionStudioExpanded(false);
      setAcceptedRiskReason("");
      noteHistoryBaselineRef.current = fallbackState.note;
    }
  }, [report]);

  useEffect(() => {
    try {
      setDecisionHistory(ensureDecisionHistory(window.localStorage, decisionHistoryKey, report));
    } catch {
      setDecisionHistory(initialDecisionHistory(report));
    }
  }, [report, decisionHistoryKey]);

  useEffect(() => {
    try {
      setActionStatusOverrides(readReviewActionStatuses(window.localStorage, decisionHistoryKey));
    } catch {
      setActionStatusOverrides({});
    }
  }, [decisionHistoryKey, actionSignature]);

  useEffect(() => {
    const eventIds = new Set(readinessTimelineSignature.split("\n").filter(Boolean));
    setSelectedTimelineEventId((current) => (
      current && eventIds.has(current) ? current : null
    ));
  }, [readinessTimelineSignature]);

  function recordDecisionEvent(event: Parameters<typeof appendDecisionHistoryEvent>[2]) {
    try {
      setDecisionHistory(appendDecisionHistoryEvent(window.localStorage, decisionHistoryKey, event));
    } catch {
      setDecisionHistory((current) => [{
        id: `local-${Date.now()}`,
        type: event.type,
        title: event.title,
        timestamp: event.timestamp ?? new Date().toISOString(),
        detail: event.detail,
        previousState: event.previousState,
        nextState: event.nextState,
        label: event.label ?? "Local",
      }, ...current].slice(0, 60));
    }
  }

  function appendLedgerEntry(input: {
    eventType: HumanDecisionEventType;
    outcome?: HumanDecisionOutcome;
    reason?: string;
    referencedClauseIds?: string[];
    referencedAssumptionIds?: string[];
    referencedEvidenceIds?: string[];
    acceptedRiskReferences?: string[];
    supersedesEntryId?: string;
    reaffirmsEntryId?: string;
    withdrawsEntryId?: string;
    source?: "decision-studio" | "merge-contract" | "assumption-registry" | "legacy" | "api" | "local";
    idempotencyKey?: string;
  }) {
    const actorLabel = actorMember?.displayName
      ?? (reviewState.owner !== "Unassigned" && !reviewState.owner.startsWith("Suggested:") ? reviewState.owner : "Local engineer");
    const actor = {
      displayLabel: actorLabel,
      source: "local" as const,
      workspaceId: currentWorkspace?.workspaceId,
      memberId: actorMember?.memberId,
      role: actorMember?.role,
    };
    try {
      const next = appendHumanDecisionLedgerEntryToStorage(
        window.localStorage,
        humanDecisionLedgerKey,
        humanDecisionLedger,
        humanDecisionLedgerContext,
        {
          ...input,
          actor,
        },
      );
      setHumanDecisionLedger(next);
      return next;
    } catch {
      const next = appendHumanDecisionLedgerEntry(humanDecisionLedger, humanDecisionLedgerContext, {
        ...input,
        actor,
      });
      setHumanDecisionLedger(next);
      return next;
    }
  }

  function updateContractDisclosure(clauseId: string, isOpen: boolean) {
    setOpenContractClauseIds((current) => {
      const next = new Set(current);
      if (isOpen) next.add(clauseId);
      else next.delete(clauseId);
      return next;
    });
  }

  function toggleOpenBlockerDisclosures() {
    setOpenContractClauseIds((current) => {
      const next = new Set(current);
      if (allOpenBlockersExpanded) openBlockingClauseIds.forEach((clauseId) => next.delete(clauseId));
      else openBlockingClauseIds.forEach((clauseId) => next.add(clauseId));
      return next;
    });
  }

  function updateReviewState(nextState: ReportReviewState) {
    try {
      const store = ensureWorkspaceStore(window.localStorage);
      setWorkspaceStore(store);
      const savedState = writeReviewState(window.localStorage, workspaceScopedReviewKey(store.activeWorkspaceId, reviewStateKeyForReport(report)), nextState);
      setReviewState(savedState);
      return savedState;
    } catch {
      setReviewState(nextState);
      return nextState;
    }
  }

  function updateReviewStatus(status: ReviewStatus) {
    const previousStatus = reviewState.status;
    const savedState = updateReviewState({ ...reviewState, status });

    if (previousStatus !== savedState.status) {
      recordDecisionEvent(reviewStatusChangeEvent(previousStatus, savedState.status));
    }
  }

  function updateReviewActionStatus(action: ReviewActionItem & { status: ReviewActionStatus }, status: ReviewActionStatus) {
    const previousStatus = action.status;
    try {
      setActionStatusOverrides(writeReviewActionStatus(window.localStorage, decisionHistoryKey, action.key, status));
    } catch {
      setActionStatusOverrides((current) => ({ ...current, [action.key]: status }));
    }

    if (previousStatus !== status) {
      recordDecisionEvent({
        type: "review-action-updated",
        title: "Review action status changed",
        detail: action.title,
        previousState: previousStatus,
        nextState: status,
        label: "Local",
      });
    }
  }

  function updateAssumptionStatus(assumption: AssumptionRecord, status: LocalAssumptionOverride["status"]) {
    const note = status === "open"
      ? ""
      : window.prompt(
        status === "accepted"
          ? "Record why this uncertainty is accepted locally. This does not prove the assumption or clear merge conditions."
          : status === "supported"
            ? "Record the bounded evidence or confirmation supporting this assumption."
            : "Record why this assumption is locally invalidated.",
        "",
      );
    if (status !== "open" && note === null) return;

    const nextOverride: LocalAssumptionOverride = {
      status,
      note: note ? note.slice(0, 220) : undefined,
      timestamp: new Date().toISOString(),
      headSha: canonicalRun?.headSha,
    };

    try {
      setAssumptionOverrides(writeAssumptionOverride(window.localStorage, currentAssumptionStateKey, assumption.assumptionId, nextOverride));
    } catch {
      setAssumptionOverrides((current) => ({ ...current, [assumption.assumptionId]: nextOverride }));
    }

    recordDecisionEvent({
      type: status === "accepted" ? "accepted-risk-recorded" : "human-decision-recorded",
      title: status === "accepted" ? "Assumption accepted locally" : "Assumption status updated",
      detail: assumption.statement,
      previousState: assumption.status,
      nextState: status,
      label: "Local",
    });

    if (status === "accepted") {
      appendLedgerEntry({
        eventType: "risk-accepted",
        outcome: "approve-with-accepted-risk",
        reason: note || `Accepted uncertainty: ${assumption.statement}`,
        referencedAssumptionIds: [assumption.assumptionId],
        acceptedRiskReferences: [assumption.assumptionId],
        source: "assumption-registry",
        idempotencyKey: `assumption:${assumption.assumptionId}:${nextOverride.timestamp}:accepted`,
      });
    }
  }

  function updateContractClauseStatus(clause: MergeContractClause, status: LocalClauseOverride["status"]) {
    const reason = status === "open"
      ? ""
      : window.prompt(
        status === "accepted"
          ? "Record why this unresolved requirement is accepted as risk. This does not satisfy the clause."
          : status === "satisfied"
            ? "Record the bounded supporting evidence or confirmation for this clause."
            : status === "superseded"
              ? "Record why this clause is superseded by a newer requirement."
              : "Record why this clause is no longer applicable.",
        "",
      );
    if (status !== "open" && reason === null) return;

    const nextOverride: LocalClauseOverride = {
      status,
      reason: reason ? reason.slice(0, 240) : undefined,
      timestamp: new Date().toISOString(),
      headSha: canonicalRun?.headSha,
    };

    try {
      setClauseOverrides(writeClauseOverride(window.localStorage, mergeContractStateKey, clause.clauseId, nextOverride));
    } catch {
      setClauseOverrides((current) => ({ ...current, [clause.clauseId]: nextOverride }));
    }

    recordDecisionEvent({
      type: status === "accepted" ? "accepted-risk-recorded" : "human-decision-recorded",
      title: status === "accepted" ? "Merge contract risk accepted" : "Merge contract clause updated",
      detail: clause.statement,
      previousState: clause.status,
      nextState: status,
      label: "Local",
    });

    if (status === "accepted") {
      appendLedgerEntry({
        eventType: "risk-accepted",
        outcome: "approve-with-accepted-risk",
        reason: reason || `Accepted unresolved contract clause: ${clause.statement}`,
        referencedClauseIds: [clause.clauseId],
        acceptedRiskReferences: [clause.clauseId],
        source: "merge-contract",
        idempotencyKey: `clause:${clause.clauseId}:${nextOverride.timestamp}:accepted`,
      });
    }
  }

  function updateReviewOwner(owner: ReviewerOwner) {
    const previousOwner = reviewState.owner;
    const savedState = updateReviewState({ ...reviewState, owner });

    if (previousOwner !== savedState.owner) {
      recordDecisionEvent(ownershipChangeEvent(previousOwner, savedState.owner));
    }
  }

  function updateReviewNote(note: string) {
    updateReviewState({ ...reviewState, note });
  }

  function handleReviewNoteBlur() {
    const previousNote = noteHistoryBaselineRef.current.trim();
    const nextNote = reviewState.note.trim();
    if (previousNote === nextNote) return;

    noteHistoryBaselineRef.current = reviewState.note;
    recordDecisionEvent({
      type: "reviewer-note-updated",
      title: "Local reviewer note updated",
      detail: nextNote.length > 0
        ? "A private reviewer note was updated locally on this device."
        : "The local reviewer note was cleared.",
      label: "Local",
    });
  }

  function toggleCondition(condition: string, checked: boolean) {
    const nextConditionKeys = new Set(clearedConditionKeys);
    const key = conditionKey(condition);

    if (checked) {
      nextConditionKeys.add(key);
    } else {
      nextConditionKeys.delete(key);
    }

    setClearedConditionKeys(nextConditionKeys);

    try {
      writeConditionProgress(window.localStorage, report, displayedConditions, nextConditionKeys);
    } catch {
      // Condition tracking is local-only and should not affect report rendering.
    }

    recordDecisionEvent({
      type: checked ? "condition-cleared" : "condition-reopened",
      title: checked ? "Condition cleared" : "Condition reopened",
      detail: condition,
      previousState: checked ? "Open" : "Cleared",
      nextState: checked ? "Cleared" : "Open",
      label: "Local",
    });
  }

  function showQuickActionMessage(state: QuickActionMessageState, text: string) {
    setQuickActionMessage({ state, text });

    if (quickActionResetTimer.current) clearTimeout(quickActionResetTimer.current);
    quickActionResetTimer.current = setTimeout(() => setQuickActionMessage(null), 2_000);
  }

  function quickSetReviewStatus(status: ReviewStatus) {
    updateReviewStatus(status);
    showQuickActionMessage("success", `Marked ${status}.`);
  }

  function quickJumpTo(target: string, label: string, targetId?: string) {
    const section = dossierSectionForLegacyTarget(target);
    setActiveDossierSection(section);
    window.setTimeout(() => {
      document.getElementById(targetId ?? `dossier-${section}`)?.scrollIntoView({ block: "start", behavior: reportScrollBehavior() });
    }, 0);
    showQuickActionMessage("success", `Jumped to ${label}.`);
  }

  function openDecisionStudio() {
    if (window.matchMedia("(max-width: 900px)").matches) {
      setDecisionSheetOpen(true);
      return;
    }
    document.getElementById("decision-studio-title")?.scrollIntoView({ block: "start", behavior: reportScrollBehavior() });
  }

  async function handleCopySummary() {
    const copied = await writeToClipboard(reportToMarkdown(report, sourceLabels[source]));
    setCopyState(copied ? "copied" : "failed");

    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    copyResetTimer.current = setTimeout(() => setCopyState("idle"), 2_000);
  }

  async function handleCopyConditions() {
    const copied = await writeToClipboard(conditionsToMarkdown(report));
    setConditionsCopyState(copied ? "copied" : "failed");

    if (conditionsCopyResetTimer.current) clearTimeout(conditionsCopyResetTimer.current);
    conditionsCopyResetTimer.current = setTimeout(() => setConditionsCopyState("idle"), 2_000);
  }

  async function handleCopyMergeSummary() {
    const copied = await writeToClipboard(mergeSummaryMarkdown);
    setMergeSummaryCopyState(copied ? "copied" : "failed");

    if (copied) {
      recordDecisionEvent({
        type: "merge-summary-copied",
        title: "Merge summary copied",
        detail: "PR-ready merge-readiness Markdown was copied locally for handoff.",
        label: "Local",
      });
    }

    if (mergeSummaryCopyResetTimer.current) clearTimeout(mergeSummaryCopyResetTimer.current);
    mergeSummaryCopyResetTimer.current = setTimeout(() => setMergeSummaryCopyState("idle"), 2_000);

    return copied;
  }

  async function handleCopyMergeContractJson() {
    const copied = await writeToClipboard(safeMergeContractJson(mergeContract));
    setMergeContractCopyState(copied ? "copied" : "failed");

    if (mergeContractCopyResetTimer.current) clearTimeout(mergeContractCopyResetTimer.current);
    mergeContractCopyResetTimer.current = setTimeout(() => setMergeContractCopyState("idle"), 2_000);

    return copied;
  }

  async function handleCopyVerificationPackJson() {
    const copied = await writeToClipboard(verificationPackJsonText);
    setVerificationPackJsonCopyState(copied ? "copied" : "failed");

    if (verificationPackJsonCopyResetTimer.current) clearTimeout(verificationPackJsonCopyResetTimer.current);
    verificationPackJsonCopyResetTimer.current = setTimeout(() => setVerificationPackJsonCopyState("idle"), 2_000);
  }

  async function handleCopyVerificationPackMarkdown() {
    const copied = await writeToClipboard(verificationPackMarkdown);
    setVerificationPackMarkdownCopyState(copied ? "copied" : "failed");

    if (verificationPackMarkdownCopyResetTimer.current) clearTimeout(verificationPackMarkdownCopyResetTimer.current);
    verificationPackMarkdownCopyResetTimer.current = setTimeout(() => setVerificationPackMarkdownCopyState("idle"), 2_000);
  }

  function handleDownloadVerificationPack(format: "json" | "md") {
    const value = format === "json" ? verificationPackJsonText : verificationPackMarkdown;
    const mime = format === "json" ? "application/json;charset=utf-8" : "text/markdown;charset=utf-8";
    const downloaded = downloadText(value, verificationPackFilename(verificationPack, format), mime);
    setVerificationPackDownloadState(downloaded ? "downloaded" : "failed");

    if (verificationPackDownloadResetTimer.current) clearTimeout(verificationPackDownloadResetTimer.current);
    verificationPackDownloadResetTimer.current = setTimeout(() => setVerificationPackDownloadState("idle"), 2_000);
  }

  async function handleQuickCopyMergeSummary() {
    const copied = await handleCopyMergeSummary();
    showQuickActionMessage(copied ? "success" : "failed", copied ? "Merge summary copied." : "Copy failed.");
  }

  async function handleQuickCopySlackHandoff() {
    const copied = await writeToClipboard(slackHandoffText);
    showQuickActionMessage(copied ? "success" : "failed", copied ? "Slack handoff copied." : "Copy failed.");
  }

  async function handleVerifyRun() {
    if (!verificationTarget || isVerifyingRun) return;
    setIsVerifyingRun(true);

    try {
      const response = await fetch("/api/github-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-run",
          pullRequestId: verificationTarget.pullRequestId,
          runId: verificationTarget.runId,
        }),
      });
      const payload: unknown = await response.json();
      const verification = isRecord(payload) && isVerificationRecord(payload.verification)
        ? payload.verification
        : null;
      if (!response.ok || !verification) throw new Error("verification_failed");

      setVerificationResult(verification);
      recordDecisionEvent({
        type: verification.reproducibility === "drift-detected" ? "review-action-updated" : "human-decision-recorded",
        title: verification.reproducibility === "drift-detected" ? "Run drift detected" : "Canonical run verified",
        detail: verification.details,
        previousState: "Unverified",
        nextState: verification.reproducibility,
        label: "Local",
      });
    } catch {
      const failed: CanonicalRunVerificationRecord = {
        id: `verify_failed_${Date.now().toString(36)}`,
        runId: verificationTarget.runId,
        createdAt: new Date().toISOString(),
        sourceMatched: false,
        configurationMatched: false,
        reproducibility: "failed",
        failureCategory: "verification_request_failed",
        details: "Run verification could not be completed from this browser session.",
      };
      setVerificationResult(failed);
    } finally {
      setIsVerifyingRun(false);
    }
  }

  function saveStudioDecision() {
    if (studioDecisionReasonRequired && acceptedRiskReason.trim().length === 0) {
      setStudioDecisionState("failed");
      if (studioDecisionResetTimer.current) clearTimeout(studioDecisionResetTimer.current);
      studioDecisionResetTimer.current = setTimeout(() => setStudioDecisionState("idle"), 2_000);
      return;
    }

    const previousStatus = reviewState.status;
    const outcome = humanDecisionOutcomeFromStudio(studioDecision);
    const previousEntry = humanDecisionProjection.latestEffectiveEntry;
    const isReaffirmation = previousEntry?.outcome === outcome && humanDecisionProjection.applicability === "predates-current-head";
    const isSupersession = !!previousEntry && previousEntry.outcome !== outcome;
    const openBlockingClauseIds = displayedContractClauses
      .filter(({ clause, status }) => clause.importance === "blocking" && status === "open")
      .map(({ clause }) => clause.clauseId)
      .slice(0, 8);
    const openAssumptionIds = evidenceHierarchy.assumptions
      .filter((assumption) => assumption.importance === "blocking" && assumption.status === "open")
      .map((assumption) => assumption.assumptionId)
      .slice(0, 8);

    updateReviewState(studioReviewState);

    appendLedgerEntry({
      eventType: studioDecision === "Approved with accepted risk"
        ? "risk-accepted"
        : isReaffirmation
          ? "decision-reaffirmed"
          : isSupersession
            ? "decision-superseded"
            : "decision-recorded",
      outcome,
      reason: acceptedRiskReason.trim() || `Decision Studio recorded: ${studioDecision}.`,
      referencedClauseIds: studioDecision === "Approved with accepted risk" ? openBlockingClauseIds : [],
      referencedAssumptionIds: studioDecision === "Approved with accepted risk" ? openAssumptionIds : [],
      acceptedRiskReferences: studioDecision === "Approved with accepted risk" ? [...openBlockingClauseIds, ...openAssumptionIds] : [],
      supersedesEntryId: isSupersession ? previousEntry?.entryId : undefined,
      reaffirmsEntryId: isReaffirmation ? previousEntry?.entryId : undefined,
      source: "decision-studio",
      idempotencyKey: `studio:${outcome}:${canonicalRun?.headSha ?? "local"}:${Date.now()}`,
    });

    recordDecisionEvent({
      type: studioDecision === "Approved with accepted risk" ? "accepted-risk-recorded" : "human-decision-recorded",
      title: studioDecision === "Approved with accepted risk" ? "Accepted risk recorded" : "Human decision recorded",
      detail: studioDecision === "Approved with accepted risk"
        ? `Approved with accepted risk. Reason: ${acceptedRiskReason.trim()}`
        : `Human decision recorded in Decision Studio: ${studioDecision}.${acceptedRiskReason.trim() ? ` Reason: ${acceptedRiskReason.trim()}` : ""}`,
      previousState: previousStatus,
      nextState: studioDecision,
      label: "Local",
    });

    setStudioDecisionState("copied");
    setDecisionStudioExpanded(false);
    if (studioDecisionResetTimer.current) clearTimeout(studioDecisionResetTimer.current);
    studioDecisionResetTimer.current = setTimeout(() => setStudioDecisionState("idle"), 2_000);
  }

  function withdrawCurrentHumanDecision() {
    const current = humanDecisionProjection.latestEffectiveEntry;
    if (!current) return;
    const confirmed = window.confirm("Withdraw the current human decision? This appends a ledger event and keeps the original decision intact.");
    if (!confirmed) return;

    appendLedgerEntry({
      eventType: "decision-withdrawn",
      reason: "Current human decision withdrawn locally.",
      withdrawsEntryId: current.entryId,
      source: "decision-studio",
      idempotencyKey: `withdraw:${current.entryId}:${Date.now()}`,
    });
    recordDecisionEvent({
      type: "human-decision-recorded",
      title: "Human decision withdrawn",
      detail: "A local withdrawal event was appended to the Human Decision Ledger. The original decision remains in history.",
      previousState: current.outcome,
      nextState: "withdrawn",
      label: "Local",
    });
  }

  function revokeAcceptedRisk(entry: HumanDecisionLedgerEntry) {
    const confirmed = window.confirm("Revoke this accepted-risk entry? This appends a ledger event and keeps the original acceptance intact.");
    if (!confirmed) return;

    appendLedgerEntry({
      eventType: "risk-acceptance-revoked",
      reason: "Accepted risk revoked locally.",
      withdrawsEntryId: entry.entryId,
      acceptedRiskReferences: [entry.entryId, ...entry.acceptedRiskReferences],
      source: "decision-studio",
      idempotencyKey: `revoke-risk:${entry.entryId}:${Date.now()}`,
    });
    recordDecisionEvent({
      type: "accepted-risk-recorded",
      title: "Accepted risk revoked",
      detail: "A local accepted-risk revocation event was appended to the Human Decision Ledger.",
      previousState: entry.outcome,
      nextState: "risk acceptance revoked",
      label: "Local",
    });
  }

  function handleDownloadMarkdown() {
    const markdown = reportToMarkdown(report, sourceLabels[source]);
    const downloaded = downloadMarkdown(markdown, reportMarkdownFilename(report));
    setDownloadState(downloaded ? "downloaded" : "failed");

    if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
    downloadResetTimer.current = setTimeout(() => setDownloadState("idle"), 2_000);
  }

  return (
    <AppShell
      context={<>{pr.project} · PR #{pr.number}</>}
      contextTone="technical"
      actions={
        <>
          <SourceBadge source={source} />
          <button
            className={quickActionsOpen ? "quick-actions-trigger quick-actions-trigger--active" : "quick-actions-trigger"}
            type="button"
            onClick={() => setQuickActionsOpen((current) => !current)}
            aria-expanded={quickActionsOpen}
            aria-controls="report-quick-actions"
          >
            Actions <span>Ctrl/Cmd K</span>
          </button>
          <button className={`copy-summary-button copy-summary-button--${copyState}`} type="button" onClick={handleCopySummary} aria-live="polite">
            {copyLabels[copyState]}
          </button>
          <button className={`download-markdown-button download-markdown-button--${downloadState}`} type="button" onClick={handleDownloadMarkdown} aria-live="polite">
            {downloadLabels[downloadState]}
          </button>
        </>
      }
    >
      <div className="main-content report-surface report-case-file" id="report">
        {quickActionsOpen && (
          <section className="quick-actions-panel quick-actions-panel--case-file" id="report-quick-actions" aria-label="Report quick actions">
            <div className="quick-actions-header">
              <div>
                <span className="card-kicker">QUICK ACTIONS</span>
                <h2>Move the review forward</h2>
                <p>Local navigation and handoff actions. Nothing is posted externally.</p>
              </div>
              {quickActionMessage && <span className={`quick-actions-status quick-actions-status--${quickActionMessage.state}`} role="status">{quickActionMessage.text}</span>}
            </div>
            <div className="case-file-action-list">
              <button type="button" onClick={() => window.location.assign("/workspace")}>Risk inbox</button>
              <button type="button" onClick={() => guidedTour?.startTour()}>Start guided tour</button>
              <button type="button" onClick={() => quickSetReviewStatus("Ready to merge")}>Mark ready</button>
              <button type="button" onClick={() => quickSetReviewStatus("Tests requested")}>Request tests</button>
              <button type="button" onClick={() => quickSetReviewStatus("Blocked")}>Mark blocked</button>
              <button type="button" onClick={handleQuickCopyMergeSummary}>Copy PR summary</button>
              <button type="button" onClick={handleQuickCopySlackHandoff}>Copy Slack handoff</button>
              {dossierSections.map((section) => (
                <button type="button" key={section.id} onClick={() => quickJumpTo(section.id, section.label)}>{section.label}</button>
              ))}
              <button type="button" onClick={openDecisionStudio}>Open Decision Studio</button>
            </div>
          </section>
        )}

        <header className="case-file-header" id="overview">
          <div className="case-file-header-main">
            <span className="case-file-eyebrow">Pull request #{pr.number}</span>
            <h1>{pr.title}</h1>
            <p>{pr.repository} · {pr.branch}</p>
          </div>
          <dl className="case-file-identity" aria-label="Review identity">
            <div><dt>Author / source</dt><dd>{pr.author || sourceLabels[source]}</dd></div>
            <div><dt>Head</dt><dd><code>{shortSha(canonicalRun?.headSha)}</code></dd></div>
            <div><dt>Run</dt><dd><code>{canonicalRun ? fingerprintPrefix(canonicalRun.runId) : "Historical"}</code></dd></div>
            <div><dt>Analysis</dt><dd>{canonicalRun?.analysisSource ?? sourceLabels[source]}</dd></div>
          </dl>
          <nav className="case-file-trace" aria-label="Verification trace">
            {traceNodes.map((node, index) => (
              <div className="case-file-trace-step" key={node.label}>
                <a className={`case-file-trace-node case-file-trace-node--${node.state}${node.decision ? " case-file-trace-node--decision" : ""}`} href={node.href} aria-label={`${node.label}: ${node.state}`} onClick={(event) => {
                  if (node.decision && window.matchMedia("(max-width: 900px)").matches) {
                    event.preventDefault();
                    decisionSheetReturnFocusRef.current = event.currentTarget;
                    setDecisionSheetOpen(true);
                  }
                }}>
                  <span aria-hidden="true" />
                  <strong>{node.label}</strong>
                  <small>{node.state}</small>
                </a>
                {index < traceNodes.length - 1 && <i aria-hidden="true" />}
              </div>
            ))}
          </nav>
          {deltaSummary && <p className="case-file-delta-summary">{deltaSummary}</p>}
          {readinessDelta?.previousHeadSha && (
            <details className="case-file-run-trace">
              <summary>Compare two review checkpoints</summary>
              <div>
                <article><span>Previous review</span><code>{shortSha(readinessDelta.previousHeadSha)}</code><strong>{readinessDelta.previousScore ?? "Score unavailable"}</strong><small>{readinessDelta.previousRecommendation ?? "Recommendation unavailable"}</small></article>
                <i aria-hidden="true" />
                <article><span>Current review</span><code>{shortSha(readinessDelta.currentHeadSha)}</code><strong>{readinessDelta.currentScore}</strong><small>{readinessDelta.currentRecommendation}</small></article>
              </div>
            </details>
          )}
          <p className="case-file-trace-note">
            {canonicalRun ? `${reproducibilityLabel(canonicalRun.reproducibility)} · ${canonicalRun.generatorVersion} · ${canonicalRun.deterministicRulesetVersion}` : "Historical report · full verification trace unavailable"}
          </p>
        </header>

        <div className="case-file-grid">
          <nav className="case-file-outline" aria-label="Report dossier sections">
            <span className="case-file-outline-label">Case file</span>
            <div className="case-file-outline-links">
              {dossierSections.map((section, index) => (
                <a
                  href={`#dossier-${section.id}`}
                  key={section.id}
                  aria-current={activeDossierSection === section.id ? "location" : undefined}
                  onClick={() => setActiveDossierSection(section.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.label}
                  {section.count !== undefined && <small>{section.count}</small>}
                </a>
              ))}
            </div>
            <label className="case-file-jump">
              <span>Jump to section</span>
              <select
                value={activeDossierSection}
                onChange={(event) => {
                  const section = event.target.value as DossierSectionId;
                  setActiveDossierSection(section);
                  document.getElementById(`dossier-${section}`)?.scrollIntoView({ block: "start", behavior: reportScrollBehavior() });
                }}
              >
                {dossierSections.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}
              </select>
            </label>
          </nav>

          <article className="case-file-dossier" aria-label="Merge-readiness verification dossier">
            <section className="dossier-section" id="dossier-what-changed" data-dossier-section="what-changed" aria-labelledby="dossier-what-changed-title">
              <header className="dossier-section-header">
                <span>01</span>
                <div><p>Change identity</p><h2 id="dossier-what-changed-title">What changed</h2></div>
                <strong>{report.changedFiles.length} files</strong>
              </header>
              <div className="dossier-lede">
                <p>{changePassport?.changeSummary ?? `Lintel reviewed ${report.changedFiles.length} changed ${report.changedFiles.length === 1 ? "file" : "files"} for ${pr.title}.`}</p>
                <dl>
                  <div><dt>Repository</dt><dd>{pr.repository}</dd></div>
                  <div><dt>Branch</dt><dd><code>{pr.branch}</code></dd></div>
                  <div><dt>Review mode</dt><dd>{reviewProfileLabel(pr.reviewProfile)}</dd></div>
                </dl>
              </div>
              <div className="dossier-file-list" aria-label="Changed files">
                {report.changedFiles.map((file) => (
                  <div className="dossier-file-row" key={file.path}>
                    <code>{file.path}</code>
                    <span>{file.additions !== undefined ? `+${file.additions}` : ""} {file.deletions !== undefined ? `−${file.deletions}` : ""}</span>
                    {file.risk && <RiskBadge risk={file.risk} />}
                  </div>
                ))}
              </div>
              <details className="dossier-record" open={affectedSurfaces.length <= 4}>
                <summary><span>Affected surfaces</span><strong>{affectedSurfaces.length}</strong></summary>
                <div className="affected-surfaces-grid affected-surfaces-grid--dossier">
                  {affectedSurfaces.length > 0 ? affectedSurfaces.map((surface) => <AffectedSurfaceCard surface={surface} key={`${surface.name}-${surface.status}-${surface.evidence}`} />) : <p className="section-empty">No affected surface was detected beyond normal review.</p>}
                </div>
              </details>
              <details className="dossier-record change-passport-record">
                <summary><span>Change Passport</span><strong>{changePassport?.completeness ?? "Absent"}</strong></summary>
                {changePassport ? (
                  <div className="dossier-detail-stack">
                    <p><strong>Declared by builder:</strong> {changePassport.taskIntent ?? "No task intent supplied."}</p>
                    <p>{passportComparison.summary}</p>
                    <PassportList title="Claimed files and surfaces" items={[...changePassport.claimedFiles, ...changePassport.claimedSurfaces]} empty="No files or surfaces declared." />
                    <PassportList title="Claimed validation" items={[...changePassport.claimedTests, ...changePassport.claimedValidation]} empty="No validation declared." />
                    <PassportList title="Assumptions and constraints" items={[...changePassport.assumptions, ...changePassport.constraints]} empty="No assumptions or constraints declared." />
                    <PassportList title="Known limitations" items={changePassport.knownLimitations} empty="No limitations declared." />
                    <PassportList title="Unresolved uncertainty" items={changePassport.unresolvedUncertainty} empty="No uncertainty declared." />
                    <PassportList title="Reviewer handoff" items={changePassport.handoffNotes ? [changePassport.handoffNotes] : []} empty="No reviewer handoff supplied." />
                    <PassportObservations title="Supported declarations" items={passportComparison.supportedDeclarations} empty="No declarations have structured support." />
                    <PassportObservations title="Unverified declarations" items={passportComparison.unverifiedDeclarations} empty="No unverified declarations recorded." />
                    <PassportObservations title="Observed but not declared" items={passportComparison.observedButUndeclared} empty="No undeclared concerns observed." />
                  </div>
                ) : <p className="section-empty">No Change Passport was supplied. Absence is context, not automatic proof of risk.</p>}
              </details>
            </section>

            <section className="dossier-section" id="dossier-observed" data-dossier-section="observed" aria-labelledby="dossier-observed-title" data-tour="report-findings">
              <header className="dossier-section-header">
                <span>02</span>
                <div><p>Independent analysis</p><h2 id="dossier-observed-title">What Lintel observed</h2></div>
                <strong>{report.findings.length} findings</strong>
              </header>
              <div className="dossier-summary-record">
                <RecommendationBadge recommendation={verdict.recommendation} />
                <p>{verdict.summary}</p>
              </div>
              <div className="dossier-finding-list" aria-label="Report findings">
                {report.findings.length > 0 ? report.findings.map((finding, index) => {
                  const relatedEvidence = findingEvidenceRecords[index] ?? [];
                  const relatedRequirements = findingRelatedContractReferences[index] ?? [];
                  const relatedFiles = affectedFilesForFinding(report, finding);
                  const relatedCondition = bestRelatedText(finding, displayedConditions);
                  const matchingClauseIndex = relatedCondition
                    ? displayedContractClauses.findIndex(({ clause }) => normalizedRecordKey(clause.statement) === normalizedRecordKey(relatedCondition))
                    : -1;
                  const relatedRequirement = matchingClauseIndex >= 0 ? `C${matchingClauseIndex + 1}` : relatedRequirements[0];
                  const relatedMissingTest = bestRelatedText(finding, report.missingTests);
                  const movement = reviewDiff?.findings.find((item) => normalizedRecordKey(item.title) === normalizedRecordKey(finding.title));
                  return (
                    <article className={`dossier-finding dossier-finding--${finding.severity.toLowerCase()}`} key={`${finding.title}-${index}`}>
                      <header className="dossier-finding-header">
                        <code>F{index + 1}</code>
                        <SeverityTag severity={finding.severity} />
                        <div><strong>{finding.title}</strong><span>{finding.category} · {findingProvenanceLabel(finding.provenance ?? "Rule detected")}</span></div>
                        {movement && <small>{movement.status.replaceAll("-", " ")}</small>}
                      </header>
                      <p className="dossier-finding-explanation">{finding.evidence}</p>
                      {relatedFiles.length > 0 && <p className="dossier-finding-technical"><span>Surface / file</span><code>{relatedFiles.join(", ")}</code></p>}
                      <div className="finding-evidence-links" aria-label={`Supporting evidence for F${index + 1}`}>
                        <span>Supporting evidence</span>
                        {relatedEvidence.length > 0 ? relatedEvidence.map((record) => (
                          <details key={record.evidenceId}>
                            <summary><code>{evidenceReferenceById.get(record.evidenceId)}</code><span>{record.title}</span></summary>
                            <p>{record.statement}</p>
                            <small>{evidenceClassLabels[record.class]} · {record.provenance}{record.stale ? " · stale for current commit" : ""}</small>
                          </details>
                        )) : <p>No attached structured evidence reference. The finding explanation remains the observed record.</p>}
                      </div>
                      {relatedCondition && <p className="dossier-finding-related"><span>Related requirement {relatedRequirement && <code>{relatedRequirement}</code>}</span>{relatedCondition}</p>}
                      {relatedMissingTest && <p className="dossier-finding-related"><span>Related missing test</span>{relatedMissingTest}</p>}
                      <p className="dossier-finding-action"><span>Required action</span>{finding.action}</p>
                    </article>
                  );
                }) : <p className="section-empty section-empty--positive">No risk findings detected.</p>}
              </div>
              <details className="dossier-record evidence-register" id="dossier-evidence-register">
                <summary><span>Evidence register</span><strong>{evidenceHierarchy.records.length} records</strong></summary>
                <div className="evidence-class-distribution" aria-label="Evidence classes">
                  {evidenceClassOrder.map((evidenceClass) => <span key={evidenceClass}><strong>{evidenceHierarchy.countsByClass[evidenceClass]}</strong> {evidenceClassLabels[evidenceClass]}</span>)}
                </div>
                <div className="evidence-register-list">
                  {evidenceHierarchy.records.length > 0 ? evidenceHierarchy.records.map((record, index) => <EvidenceHierarchyRow key={record.evidenceId} record={record} reference={`E${index + 1}`} />) : <p className="section-empty">Structured evidence provenance is unavailable for this report.</p>}
                </div>
              </details>
              <details className="dossier-record">
                <summary><span>Operational observations</span><strong>{operationalStatus}</strong></summary>
                {report.operationalReadiness ? (
                  <div className="dossier-detail-stack">
                    <p>{report.operationalReadiness.summary}</p>
                    <OperationalArea title="Failure modes" items={deduplicateReportItems(report.operationalReadiness.failureModes)} emptyCopy="No explicit failure mode detected." />
                    <OperationalArea title="Detection and observability" items={deduplicateReportItems([...report.operationalReadiness.detectionSignals, ...report.operationalReadiness.observabilityGaps])} emptyCopy="No structured detection signal or observability gap recorded." />
                    <OperationalArea title="Recovery and impact" items={deduplicateReportItems([...report.operationalReadiness.recoveryOrRollback, ...report.operationalReadiness.customerOrDataImpact])} emptyCopy="No recovery or impact item recorded." />
                  </div>
                ) : <p className="section-empty">Operational readiness was not assessed for this historical report.</p>}
              </details>
            </section>

            <section className="dossier-section" id="dossier-uncertain" data-dossier-section="uncertain" aria-labelledby="dossier-uncertain-title" data-tour="report-tests">
              <header className="dossier-section-header">
                <span>03</span>
                <div><p>Proof still required</p><h2 id="dossier-uncertain-title">Uncertain or missing</h2></div>
                <strong>{missingProofCount} items</strong>
              </header>
              <div className="uncertainty-register" aria-label="Missing proof and reviewer needs">
                {report.missingTests.map((test, index) => (
                  <article className="uncertainty-record uncertainty-record--missing" key={test}>
                    <div className="uncertainty-record-state"><code>M{index + 1}</code><span>MISSING</span></div>
                    <div><strong>{test}</strong><p>Named test proof is not present in the current review record.</p></div>
                    <small>Tests / coverage</small>
                  </article>
                ))}
                {report.suggestedTests.map((test, index) => (
                  <article className="uncertainty-record uncertainty-record--review" key={test.title}>
                    <div className="uncertainty-record-state"><code>M{report.missingTests.length + index + 1}</code><span>MISSING</span></div>
                    <div><strong>{test.title}</strong><p>{test.description ?? "Reviewer verification remains useful before the decision."}</p></div>
                    <small>{test.priority ?? "Suggested"} verification</small>
                  </article>
                ))}
                {report.missingTests.length === 0 && report.suggestedTests.length === 0 && <p className="section-empty section-empty--positive">No missing test or reviewer-verification records detected.</p>}
              </div>
              {displayedReviewerChecklist.length > 0 && (
                <details className="dossier-record">
                  <summary><span>Reviewer checklist</span><strong>{displayedReviewerChecklist.length}</strong></summary>
                  <ul className="checklist">{displayedReviewerChecklist.map((item) => <li key={item.label}><span className={`check-icon check-icon--${item.status.toLowerCase()}`}>{item.status === "COMPLETE" ? "✓" : "!"}</span><span>{item.label}</span></li>)}</ul>
                </details>
              )}
              <details className="dossier-record" open={displayedAssumptions.length > 0}>
                <summary><span>Assumption Registry</span><strong>{evidenceHierarchy.openBlockingAssumptions} blocking · {evidenceHierarchy.openAdvisoryAssumptions} advisory</strong></summary>
                <div className="assumption-registry-list">
                  {displayedAssumptions.length > 0 ? displayedAssumptions.map(({ assumption, override, status }, index) => (
                    <AssumptionRegistryRow key={assumption.assumptionId} reference={`A${index + 1}`} assumption={assumption} override={override} status={status} onUpdate={(nextStatus) => updateAssumptionStatus(assumption, nextStatus)} />
                  )) : <p className="section-empty section-empty--positive">No assumptions were registered.</p>}
                </div>
              </details>
              <details className="dossier-record" open={evidenceLedger.missing.length > 0}>
                <summary><span>Evidence gaps</span><strong>{evidenceLedger.missing.length}</strong></summary>
                <div className="uncertainty-register">{evidenceLedger.missing.map((item, index) => <article className="uncertainty-record uncertainty-record--missing" key={`${item.label}-${item.detail}`}><div className="uncertainty-record-state"><code>M{report.missingTests.length + report.suggestedTests.length + index + 1}</code><span>MISSING</span></div><div><strong>{item.label}</strong><p>{item.detail}</p></div><small>{item.relation}</small></article>)}</div>
              </details>
              <details className="dossier-record">
                <summary><span>Reviewer focus</span><strong>{supportedReviewerFocus ? supportedReviewerFocus.length : "Historical"}</strong></summary>
                {supportedReviewerFocus ? <div className="reviewer-focus-list">{supportedReviewerFocus.map((item) => <article className="reviewer-focus-item" key={item.area}><div><h3>{item.area}</h3><p>{item.reason}</p></div><span>{item.priority}</span></article>)}</div> : <p className="section-empty">Reviewer focus was not assessed for this historical report.</p>}
              </details>
            </section>

            <section className="dossier-section" id="dossier-merge-contract" data-dossier-section="merge-contract" data-tour="merge-contract" aria-labelledby="merge-contract-title">
              <header className="dossier-section-header">
                <span>04</span>
                <div><p>Requirements before merge</p><h2 id="merge-contract-title">Merge Contract</h2></div>
                <strong>{mergeContract.state}</strong>
              </header>
              <p className="dossier-contract-introduction">{mergeContractSummaryText}</p>
              <dl className="dossier-contract-summary">
                <div><dt>Blocking open</dt><dd>{mergeContractBlockingOpen}</dd></div>
                <div><dt>Advisory open</dt><dd>{mergeContractAdvisoryOpen}</dd></div>
                <div><dt>Satisfied</dt><dd>{mergeContractSatisfied}</dd></div>
                <div><dt>Accepted risk</dt><dd>{mergeContractAccepted}</dd></div>
              </dl>
              {displayedContractClauses.length > 0 ? <div className="merge-contract-clause-list">
                {openBlockingClauseIds.length > 1 && <div className="contract-disclosure-control"><span>{openBlockingClauseIds.length} blocking requirements remain open</span><button type="button" onClick={toggleOpenBlockerDisclosures}>{allOpenBlockersExpanded ? "Collapse open blockers" : "Expand open blockers"}</button></div>}
                {displayedContractClauses.map(({ clause, override, status }, index) => (
                  <MergeContractClauseRow key={clause.clauseId} clause={clause} reference={`C${index + 1}`} relatedReferences={contractRelatedReferencesById.get(clause.clauseId) ?? []} recheckEvaluation={contractRecheckByClauseId.get(clause.clauseId)} override={override} status={status} onUpdate={(nextStatus) => updateContractClauseStatus(clause, nextStatus)} isOpen={openContractClauseIds.has(clause.clauseId)} onDisclosureChange={(isOpen) => updateContractDisclosure(clause.clauseId, isOpen)} />
                ))}
              </div> : (
                <div className="dossier-historical-contract">
                  <p>{displayedConditions.length > 0 ? "This historical report has merge conditions but no complete machine-readable contract." : "No merge requirements were generated."}</p>
                  {displayedConditions.length > 0 && <ol>{displayedConditions.map((condition) => <li key={condition}>{condition}</li>)}</ol>}
                </div>
              )}
              {conditionTrackingEnabled && (
                <details className="dossier-record" open>
                  <summary><span>Local condition progress</span><strong>{conditionProgressLabel}</strong></summary>
                  <div className="condition-tracker-list">{displayedConditions.map((condition) => {
                    const checked = clearedConditionKeys.has(conditionKey(condition));
                    return <label className={checked ? "condition-tracker-item condition-tracker-item--cleared" : "condition-tracker-item"} key={condition}><input type="checkbox" checked={checked} onChange={(event) => toggleCondition(condition, event.target.checked)} /><span>{condition}</span></label>;
                  })}</div>
                </details>
              )}
              <details className="dossier-record">
                <summary><span>Contract re-check</span><strong>{contractRecheck?.classification ?? "Unavailable"}</strong></summary>
                {contractRecheck ? <div className="contract-recheck-rows">{contractRecheck.clauseEvaluations.slice(0, 8).map((evaluation) => <ContractRecheckRow evaluation={evaluation} key={evaluation.clauseId} />)}</div> : <p className="section-empty">No previous completed contract is attached to this report.</p>}
              </details>
              <details className="dossier-record" data-tour="review-actions">
                <summary><span>What must happen next</span><strong>{reviewActionProgress.openBlockers} blockers</strong></summary>
                <p className="dossier-action-conclusion">{reviewActionProgress.readinessConclusion}</p>
                <div className="review-action-list review-action-list--dossier">{reviewActions.map((action) => (
                  <article className={`review-action-card review-action-card--${action.priority.toLowerCase()}`} key={action.key}>
                    <div><span>{action.source} · {action.priority}</span><h3>{action.title}</h3><p>{action.reason}</p></div>
                    <label><span>Status</span><select value={action.status} onChange={(event) => updateReviewActionStatus(action, event.target.value as ReviewActionStatus)}>{REVIEW_ACTION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                  </article>
                ))}</div>
              </details>
              <div className="dossier-machine-row">
                <span>Contract {fingerprintPrefix(mergeContract.contractId)} · schema {mergeContract.schemaVersion}</span>
                <button type="button" onClick={handleCopyMergeContractJson}>{mergeContractCopyState === "copied" ? "JSON copied" : mergeContractCopyState === "failed" ? "Copy failed" : "Copy machine-readable JSON"}</button>
              </div>
            </section>

            <section className="dossier-section dossier-section--appendix" id="dossier-appendix" data-dossier-section="appendix" aria-labelledby="dossier-appendix-title" data-tour="report-export">
              <header className="dossier-section-header">
                <span>05</span>
                <div><p>Technical record</p><h2 id="dossier-appendix-title">Appendix</h2></div>
              </header>
              <details className="dossier-record">
                <summary><span>Canonical run and provenance</span><strong>{canonicalRun ? fingerprintPrefix(canonicalRun.runId) : "Historical"}</strong></summary>
                {canonicalRun ? (
                  <div className="appendix-provenance">
                    <dl>
                      <div><dt>Source</dt><dd>{canonicalRun.sourceType}</dd></div><div><dt>Head</dt><dd><code>{shortSha(canonicalRun.headSha)}</code></dd></div>
                      <div><dt>Review mode</dt><dd>{reviewProfileLabel(canonicalRun.reviewMode)}</dd></div><div><dt>Analysis</dt><dd>{canonicalRun.analysisSource}</dd></div>
                      <div><dt>Ruleset</dt><dd>{canonicalRun.deterministicRulesetVersion}</dd></div><div><dt>Generator</dt><dd>{canonicalRun.generatorVersion}</dd></div>
                      <div><dt>Reproducibility</dt><dd>{reproducibilityLabel(canonicalRun.reproducibility)}</dd></div><div><dt>Completed</dt><dd>{canonicalRun.completedAt ? timelineTime(canonicalRun.completedAt) : "Unknown"}</dd></div>
                    </dl>
                    <div className="run-fingerprint-grid"><div><dt>Input</dt><dd>{fingerprintPrefix(canonicalRun.inputFingerprint)}</dd></div><div><dt>Configuration</dt><dd>{fingerprintPrefix(canonicalRun.configurationFingerprint)}</dd></div><div><dt>Result</dt><dd>{fingerprintPrefix(canonicalRun.resultFingerprint)}</dd></div></div>
                    {verificationTarget && <button type="button" onClick={handleVerifyRun} disabled={isVerifyingRun}>{isVerifyingRun ? "Verifying…" : "Verify run"}</button>}
                    {verificationResult && <p className="condition-local-note">{verificationResult.details}</p>}
                  </div>
                ) : <p className="section-empty">Canonical run provenance is unavailable for this historical report.</p>}
              </details>
              <details className="dossier-record">
                <summary><span>Builder–Verifier Boundary</span><strong>{builderVerifierAssessment.classification}</strong></summary>
                <BuilderVerifierBoundarySection assessment={builderVerifierAssessment} />
              </details>
              <details className="dossier-record">
                <summary><span>Verification Pack</span><strong>{verificationPack.generationStatus}</strong></summary>
                <div className="verification-pack-summary-grid"><article><span>Pack</span><strong>{fingerprintPrefix(verificationPack.packId)}</strong></article><article><span>Head</span><strong>{shortSha(verificationPack.changeIdentity.headSha)}</strong></article><article><span>Fingerprint</span><strong>{fingerprintPrefix(verificationPack.packFingerprint)}</strong></article></div>
                {verificationPack.unavailableSections.length > 0 && <p>Limited sections: {verificationPack.unavailableSections.join(", ")}</p>}
                <div className="verification-pack-actions">
                  <button type="button" onClick={handleCopyVerificationPackJson}>{verificationPackJsonCopyState === "copied" ? "JSON copied" : "Copy JSON"}</button>
                  <button type="button" onClick={() => handleDownloadVerificationPack("json")}>Download JSON</button>
                  <button type="button" onClick={handleCopyVerificationPackMarkdown}>{verificationPackMarkdownCopyState === "copied" ? "Markdown copied" : "Copy Markdown"}</button>
                  <button type="button" onClick={() => handleDownloadVerificationPack("md")}>Download Markdown</button>
                </div>
              </details>
              <details className="dossier-record">
                <summary><span>Readiness evolution and Review Diff</span><strong>{readinessDelta ? classificationLabel(readinessDelta.classification) : "Initial"}</strong></summary>
                {readinessDelta ? <DeltaEvolutionHeader source={reviewDiff ?? readinessDelta} /> : <p className="section-empty">No previous completed run is attached.</p>}
                {readinessDelta && readinessDelta.classification !== "initial" && (
                  <div className="dossier-delta-summary">
                    <p>Conditions: {readinessDelta.clearedMergeConditions.length} cleared · {readinessDelta.openedMergeConditions.length} opened · {readinessDelta.reopenedMergeConditions.length} reopened · {readinessDelta.unchangedOpenMergeConditions.length} still open.</p>
                    <p>Blockers: {readinessDelta.clearedBlockers.length} cleared · {readinessDelta.addedBlockers.length} added.</p>
                    <p>Tests or evidence gaps: {readinessDelta.clearedTestOrEvidenceGaps.length} cleared · {readinessDelta.addedTestOrEvidenceGaps.length} added.</p>
                  </div>
                )}
                {reviewDiff && (
                  <>
                    <div className="review-diff-filter-bar" aria-label="Review Diff filters">{reviewDiffActiveFilters.map((filter) => <button type="button" key={filter} className={reviewDiffFilter === filter ? "review-diff-filter review-diff-filter--active" : "review-diff-filter"} aria-pressed={reviewDiffFilter === filter} onClick={() => setReviewDiffFilter(filter)}>{filter}</button>)}</div>
                    {reviewDiffVisibleCount > 0 ? <div className="review-diff-sections"><ReviewDiffSection title="Findings" items={reviewDiff.findings} filter={reviewDiffFilter} /><ReviewDiffSection title="Evidence" items={reviewDiff.evidence} filter={reviewDiffFilter} /><ReviewDiffSection title="Tests" items={reviewDiff.testGaps} filter={reviewDiffFilter} /><ReviewDiffSection title="Merge conditions" items={reviewDiff.mergeConditions} filter={reviewDiffFilter} /></div> : <p className="section-empty">No Review Diff items match this filter.</p>}
                  </>
                )}
              </details>
              <details className="dossier-record">
                <summary><span>Decision timeline</span><strong>{readinessTimeline.length} events</strong></summary>
                <div className="timeline-filter-bar">{timelineFilters.map((filter) => <button type="button" key={filter} className={timelineFilter === filter ? "timeline-filter timeline-filter--active" : "timeline-filter"} aria-pressed={timelineFilter === filter} onClick={() => setTimelineFilter(filter)}>{filter}</button>)}</div>
                <ol className="decision-timeline decision-timeline--appendix">{filteredTimeline.map((event) => <li key={event.id} className={event.current ? "decision-timeline-item decision-timeline-item--current" : "decision-timeline-item"}><div className="decision-timeline-marker" aria-hidden="true" /><button type="button" className="decision-timeline-event" onClick={() => setSelectedTimelineEventId(selectedTimelineEventId === event.id ? null : event.id)}><div className="decision-timeline-header"><div><h3>{event.title}</h3><time dateTime={event.timestamp}>{timelineTime(event.timestamp)}</time></div><span>{event.provenance}</span></div><p>{event.summary}</p>{selectedTimelineEventId === event.id && <div className="timeline-inline-detail"><strong>{event.movement ?? "Context recorded"}</strong><span>{event.previousState ?? "Not recorded"} → {event.nextState ?? "Not recorded"}</span><span>{event.relatedItem ?? event.area}</span></div>}</button></li>)}</ol>
              </details>
              <details className="dossier-record">
                <summary><span>Engineering review and score factors</span><strong>{qualityStatus}</strong></summary>
                <div className="review-grid"><ReviewCard title="Security review" review={report.reviews.security} findingTitles={findingTitles} /><ReviewCard title="Reliability review" review={report.reviews.reliability} findingTitles={findingTitles} /><ReviewCard title="Maintainability review" review={report.reviews.maintainability} findingTitles={findingTitles} /></div>
                <div className="score-breakdown-list">{readinessScoreBreakdown.components.map((component) => <article key={component.label}><div><h3>{component.label}</h3><span>{component.status}</span></div><p>{component.explanation}</p><small>Improves with: {component.improvesWith}</small><small>Related evidence: {component.relatedEvidence}</small></article>)}</div>
                {report.reportQuality ? <div className="dossier-quality-record"><strong>Report quality: {report.reportQuality.status}</strong>{report.reportQuality.checks.map((check) => <p key={check.label}>{check.label}: {check.status} · {check.detail}</p>)}</div> : <p className="section-empty">Report quality was not assessed for this historical report.</p>}
              </details>
              <details className="dossier-record" id="report-export-title">
                <summary><span>Copy, export and handoff</span><strong>Local only</strong></summary>
                <div className="case-file-export-actions">
                  <button type="button" onClick={handleCopyConditions}>{copyConditionsLabels[conditionsCopyState]}</button>
                  <button type="button" onClick={handleCopySummary}>{copyLabels[copyState]}</button>
                  <button type="button" onClick={handleDownloadMarkdown}>{downloadLabels[downloadState]}</button>
                  <button type="button" onClick={handleCopyMergeSummary}>{copyMergeSummaryLabels[mergeSummaryCopyState]}</button>
                  <button type="button" onClick={handleQuickCopySlackHandoff}>Copy Slack handoff</button>
                </div>
                {reviewState.note.trim().length > 0 && <label className="case-file-note-option"><input type="checkbox" checked={includeLocalNoteInMergeSummary} onChange={(event) => setIncludeLocalNoteInMergeSummary(event.target.checked)} /><span>Include the local reviewer note in the PR-ready summary</span></label>}
                <details className="handoff-preview"><summary>GitHub-ready Markdown preview</summary><pre>{mergeSummaryMarkdown}</pre></details>
                <details className="handoff-preview"><summary>Slack-ready handoff preview</summary><pre>{slackHandoffText}</pre></details>
                <nav className="case-file-related-links" aria-label="Related report actions"><a href="/workspace">Back to Risk inbox</a><a href="/new">Check another pull request</a><a href="/review-policies">Review policies</a><a href="/docs/security-model.md">Security model</a></nav>
              </details>
            </section>
          </article>

          {decisionSheetOpen && <button className="verdict-sheet-scrim" type="button" aria-label="Close decision details" onClick={() => { setDecisionSheetOpen(false); window.setTimeout(() => (decisionSheetReturnFocusRef.current ?? decisionSheetTriggerRef.current)?.focus(), 0); }} />}
          <aside
            className={decisionSheetOpen ? "report-verdict-rail report-verdict-rail--open" : "report-verdict-rail"}
            aria-label="Merge-readiness verdict and human decision"
            aria-modal={decisionSheetOpen ? true : undefined}
            role={decisionSheetOpen ? "dialog" : "complementary"}
            ref={decisionRailRef}
          >
            <div className="verdict-rail-compact">
              <div><RecommendationBadge recommendation={verdict.recommendation} /><span>{verdict.riskScore}/100 · {verdict.riskLevel}</span></div>
              <button ref={decisionSheetTriggerRef} type="button" onClick={(event) => { decisionSheetReturnFocusRef.current = event.currentTarget; setDecisionSheetOpen(true); }}>Review decision</button>
            </div>
            <div className="verdict-rail-body">
              <div className="verdict-rail-sheet-header"><span>Decision record</span><button type="button" onClick={() => { setDecisionSheetOpen(false); window.setTimeout(() => (decisionSheetReturnFocusRef.current ?? decisionSheetTriggerRef.current)?.focus(), 0); }}>Close</button></div>
              <section className="verdict-rail-recommendation">
                <span className="card-kicker">LINTEL RECOMMENDATION</span>
                <strong>{verdict.recommendation.replaceAll("_", " ")}</strong>
                <p>{becauseClause}</p>
                <dl><div><dt>Risk score</dt><dd>{verdict.riskScore}/100</dd></div><div><dt>Risk band</dt><dd>{verdict.riskLevel}</dd></div></dl>
              </section>
              <section className="verdict-rail-requirements">
                <dl><div><dt>Blocking open</dt><dd>{mergeContractBlockingOpen}</dd></div><div><dt>Conditions cleared</dt><dd>{clearedConditionCount}</dd></div><div><dt>Missing proof</dt><dd>{missingProofCount}</dd></div><div><dt>Open actions</dt><dd>{reviewActionProgress.openBlockers}</dd></div></dl>
                <div><span>Immediate next action</span><strong>{reportNextDecisionAction}</strong></div>
                <p>{activePolicy.label} · {activePolicyStatus.label}. {policyGateSummary(activePolicy)}.</p>
              </section>
              <section className="decision-studio decision-studio--rail" id="human-decision-record" aria-labelledby="decision-studio-title">
                <div className="decision-studio-header"><div><span className="card-kicker" id="decision-studio-title">HUMAN DECISION</span><p>Final authority remains human. This does not change Lintel’s analysis.</p></div></div>
                {staleDecisionNotice}
                {currentHumanDecision ? (
                  <div className="current-human-decision">
                    <span className="current-decision-lintel">Lintel recommended: {verdict.recommendation.replaceAll("_", " ")}</span>
                    <div className="current-decision-outcome"><span>Engineer decided</span><strong>{humanDecisionOutcomeLabel(currentHumanDecision.outcome)}</strong></div>
                    <dl><div><dt>Actor</dt><dd>{currentHumanDecision.actor.displayLabel}</dd></div><div><dt>Recorded</dt><dd><time dateTime={currentHumanDecision.recordedAt}>{timelineTime(currentHumanDecision.recordedAt)}</time></dd></div>{currentHumanDecision.applicableHeadSha && <div><dt>Applies to</dt><dd><code>{shortSha(currentHumanDecision.applicableHeadSha)}</code></dd></div>}</dl>
                    {currentHumanDecision.reason && <p>{currentHumanDecision.reason}</p>}
                    <span className="current-decision-alignment">{humanDecisionDivergence.replaceAll("-", " ")}</span>
                  </div>
                ) : <div className="decision-awaiting"><strong>Engineer decision pending.</strong><p>Record the next bounded decision after reviewing open proof and requirements.</p></div>}
                {!decisionStudioExpanded ? <button className="decision-studio-save" type="button" onClick={() => setDecisionStudioExpanded(true)}>{currentHumanDecision ? "Record new decision" : "Record decision"}</button> : <>
                  <fieldset><legend>Record decision for {humanDecisionLedgerContext.currentHeadSha ? <code>{shortSha(humanDecisionLedgerContext.currentHeadSha)}</code> : "this review"}</legend><div className="decision-studio-options">{studioDecisionOptions.map((option) => <label key={option}><input type="radio" name="studio-decision-case-file" value={option} checked={studioDecision === option} onChange={() => { setStudioDecision(option); setAcceptedRiskReason(""); }} /><span>{option}</span></label>)}</div></fieldset>
                  {studioDecisionDiverges && <p className="decision-divergence-preview" role="status"><strong>Differs from Lintel's recommendation</strong> — reason required. Lintel remains {verdict.recommendation.replaceAll("_", " ").toLowerCase()}.</p>}
                  {studioDecisionReasonRequired && <label className="decision-studio-reason"><span>{studioDecision === "Approved with accepted risk" ? "Accepted risk reason" : "Decision reason"}</span><textarea value={acceptedRiskReason} rows={3} maxLength={700} required onChange={(event) => setAcceptedRiskReason(event.target.value)} placeholder={studioDecision === "Approved with accepted risk" ? "State the risk and why proceeding is acceptable." : "Explain why the human decision differs from Lintel's recommendation."} /></label>}
                  <div className="decision-studio-form-actions"><button className="decision-studio-save" type="button" onClick={saveStudioDecision} disabled={studioDecisionReasonRequired && acceptedRiskReason.trim().length === 0}>{studioDecisionState === "copied" ? "Decision recorded" : studioDecisionState === "failed" ? "Reason required" : "Record decision"}</button><button type="button" onClick={() => setDecisionStudioExpanded(false)}>Cancel</button></div>
                  <p className="decision-studio-impact">Current handoff: <strong>{studioDecisionText}</strong></p>
                </>}
              </section>
              <details className="verdict-rail-local-state" aria-label="Local review state">
                <summary>Local review state and owner</summary>
                <div className="verdict-rail-local-state-fields">
                  <label><span>Review state</span><select value={reviewState.status} onChange={(event) => updateReviewStatus(event.target.value as ReviewStatus)}>{REVIEW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                  <label><span>Review owner</span><select value={reviewState.owner} onChange={(event) => updateReviewOwner(event.target.value as ReviewerOwner)}>{reportOwnerOptions.map((owner) => <option key={owner} value={owner}>{owner}</option>)}{reportOwnerIsHistorical && <option value={reviewState.owner}>{reviewState.owner} (historical)</option>}</select></label>
                  <label><span>Private reviewer note</span><textarea value={reviewState.note} maxLength={1000} rows={3} onChange={(event) => updateReviewNote(event.target.value)} onBlur={handleReviewNoteBlur} placeholder="Stored locally on this device." /></label>
                </div>
              </details>
              <details className="verdict-ledger" open={humanDecisionProjection.reaffirmationRequired}>
                <summary><span>Human Decision Ledger</span><strong>{humanDecisionLedger.entries.length}</strong></summary>
                <dl className="verdict-ledger-summary"><div><dt>Current</dt><dd>{humanDecisionOutcomeLabel(humanDecisionProjection.latestEffectiveEntry?.outcome)}</dd></div><div><dt>Alignment</dt><dd>{humanDecisionDivergence.replaceAll("-", " ")}</dd></div><div><dt>Applicability</dt><dd>{humanDecisionProjection.applicability.replaceAll("-", " ")}</dd></div></dl>
                {humanDecisionProjection.reaffirmationRequired && <p className="decision-studio-delta-note">Decision predates the current head. Reaffirmation is required.</p>}
                <div className="human-ledger-actions"><button type="button" onClick={withdrawCurrentHumanDecision} disabled={!humanDecisionProjection.latestEffectiveEntry}>Withdraw current decision</button>{humanDecisionProjection.activeAcceptedRisks.slice(0, 2).map((entry) => <button type="button" key={entry.entryId} onClick={() => revokeAcceptedRisk(entry)}>Revoke risk {fingerprintPrefix(entry.entryId)}</button>)}</div>
                <div className="human-ledger-rows">{[...humanDecisionLedger.entries].reverse().slice(0, 10).map((entry) => <HumanDecisionLedgerRow entry={entry} currentHeadSha={humanDecisionLedgerContext.currentHeadSha} key={entry.entryId} />)}</div>
              </details>
              <div className="verdict-rail-footer-actions"><button type="button" onClick={handleCopyMergeSummary}>{copyMergeSummaryLabels[mergeSummaryCopyState]}</button><button type="button" onClick={handleDownloadMarkdown}>{downloadLabels[downloadState]}</button><button type="button" onClick={() => quickJumpTo("merge-contract", "Merge Contract")}>View contract</button></div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );

}
