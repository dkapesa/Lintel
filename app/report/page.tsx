"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import AppShell from "../app-shell";
import { useGuidedTour } from "../guided-tour";
import { compareChangePassport, passportHandoffSummary, type ChangePassport, type ChangePassportComparison } from "../../lib/change-passport";
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
  REVIEW_STATUSES,
  reviewStateKeyForReport,
  type ReportReviewState,
  type ReviewStatus,
  writeReviewState,
} from "../../lib/review-state";

type GeneratedReportSource = "ai" | "deterministic";
type ReportSource = GeneratedReportSource | "demo";
type CopyState = "idle" | "copied" | "failed";
type DownloadState = "idle" | "downloaded" | "failed";
type QuickActionMessageState = "success" | "failed";
type ReportTab = "overview" | "actions" | "timeline" | "review-diff" | "evidence" | "blast-radius" | "findings" | "tests" | "operations" | "review-focus" | "changed-files" | "export";
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

type StoredReport = {
  report: Report;
  source: GeneratedReportSource;
  readinessDelta?: ReadinessDelta;
  reviewDiff?: ReviewDiff;
  canonicalRun?: CanonicalReviewRunManifest;
  changePassport?: ChangePassport;
  verificationTarget?: { pullRequestId: string; runId: string };
  initialTab?: ReportTab;
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
  let url: string | null = null;
  let link: HTMLAnchorElement | null = null;

  try {
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
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

function timelineTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
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
    relatedItem: deltaRecommendationMovement(delta),
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
}: {
  report: Report;
  ownerLabel: string;
  conditions: string[];
  actionProgress: ActionProgress;
  humanDecision?: string;
  passportSummary?: string;
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
            </li>
          ))}
        </ul>
      ) : <p>{empty}</p>}
    </article>
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
  const [verificationTarget, setVerificationTarget] = useState<{ pullRequestId: string; runId: string } | null>(null);
  const [verificationResult, setVerificationResult] = useState<CanonicalRunVerificationRecord | null>(null);
  const [isVerifyingRun, setIsVerifyingRun] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [conditionsCopyState, setConditionsCopyState] = useState<CopyState>("idle");
  const [mergeSummaryCopyState, setMergeSummaryCopyState] = useState<CopyState>("idle");
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [clearedConditionKeys, setClearedConditionKeys] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>("All");
  const [reviewDiffFilter, setReviewDiffFilter] = useState<(typeof reviewDiffFilters)[number]>("All");
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>(null);
  const [studioDecision, setStudioDecision] = useState<StudioHumanDecision>("Review required");
  const [acceptedRiskReason, setAcceptedRiskReason] = useState("");
  const [studioDecisionState, setStudioDecisionState] = useState<CopyState>("idle");
  const [includeLocalNoteInMergeSummary, setIncludeLocalNoteInMergeSummary] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [quickActionMessage, setQuickActionMessage] = useState<{ state: QuickActionMessageState; text: string } | null>(null);
  const [reviewState, setReviewState] = useState<ReportReviewState>(() => defaultReviewState(demoReport));
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryEvent[]>(() => initialDecisionHistory(demoReport));
  const [actionStatusOverrides, setActionStatusOverrides] = useState<Record<string, ReviewActionStatus>>({});
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conditionsCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergeSummaryCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quickActionResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const studioDecisionResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteHistoryBaselineRef = useRef("");

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
        setVerificationTarget(isVerificationTarget(parsedReport.verificationTarget) ? parsedReport.verificationTarget : null);
        setVerificationResult(null);
        if (parsedReport.initialTab === "review-diff") setActiveTab("review-diff");
        return;
      }

      if (isReport(parsedReport)) {
        setDisplayedReport({ report: parsedReport, source: "deterministic" });
        setReadinessDelta(null);
        setReviewDiff(null);
        setCanonicalRun(historicalCanonicalRunManifest(parsedReport, "manual"));
        setChangePassport(null);
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
      if (selectedFindingIndex !== null) setSelectedFindingIndex(null);
      if (selectedTimelineEventId !== null) setSelectedTimelineEventId(null);
    }

    window.addEventListener("keydown", handleReportEscape);
    return () => window.removeEventListener("keydown", handleReportEscape);
  }, [selectedFindingIndex, selectedTimelineEventId]);

  useEffect(() => {
    function handleTourTab(event: Event) {
      const tab = (event as CustomEvent<string>).detail;
      if (["overview", "actions", "timeline", "review-diff", "evidence", "blast-radius", "findings", "tests", "operations", "review-focus", "changed-files", "export"].includes(tab)) {
        setActiveTab(tab as ReportTab);
      }
    }

    window.addEventListener("lintel:tour-tab", handleTourTab);
    return () => window.removeEventListener("lintel:tour-tab", handleTourTab);
  }, []);

  const { report, source } = displayedReport;
  const { pr, verdict } = report;
  const supportedReviewerFocus = pruneUnsupportedReviewerFocus(report);
  const activePolicy = reviewPolicyForProfile(pr.reviewProfile);
  const activePolicyStatus = policyStatusForReport(report, activePolicy);
  const decisionHistoryKey = decisionHistoryKeyForReport(report);
  const displayedConditions = reportConditions(report);
  const selectedFinding = selectedFindingIndex !== null ? report.findings[selectedFindingIndex] : undefined;
  const selectedFindingFiles = selectedFinding ? affectedFilesForFinding(report, selectedFinding) : [];
  const selectedFindingMissingTest = selectedFinding ? bestRelatedText(selectedFinding, report.missingTests) : null;
  const selectedFindingCondition = selectedFinding ? bestRelatedText(selectedFinding, displayedConditions) : null;
  const selectedFindingReviewerFocus = selectedFinding && supportedReviewerFocus
    ? reviewerFocusForFinding(selectedFinding, supportedReviewerFocus)
    : null;
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
  const suggestedOwners = suggestedReviewerOwners(report);
  const displayedOwner = ownerDisplay(reviewState.owner, suggestedOwners);
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

  const readinessTimeline = readinessDelta
    ? [deltaTimelineEvent(readinessDelta), ...baseReadinessTimeline]
    : baseReadinessTimeline;
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
  });
  const mergeSummaryMarkdown = mergeSummaryToMarkdown(report, {
    sourceLabel: sourceLabels[source],
    reviewState: studioReviewState,
    includeLocalNote: includeLocalNoteInMergeSummary,
    actionProgress: `${reviewActionProgress.openBlockers} open blockers; ${reviewActionProgress.requiredResolved}/${reviewActionProgress.requiredTotal} required actions resolved. Human decision: ${studioDecisionText}. ${reviewActionProgress.readinessConclusion}`,
    passportSummary,
  });
  const blockerSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Blocker").length;
  const confirmationSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Attention" || surface.status === "Watch").length;
  const primaryAffectedSurface = affectedSurfaces[0]?.name ?? "No affected surface detected";
  const readinessConclusion = displayedConditions.length === 0
    ? "No merge conditions detected. Complete normal human review and CI checks."
    : openConditionCount === 0
      ? "All merge contract conditions are locally marked cleared. Recommendation is not changed automatically."
      : `${openConditionCount} ${openConditionCount === 1 ? "merge condition remains" : "merge conditions remain"} open before this report is ready to clear.`;
  const reportTabs: Array<{ id: ReportTab; label: string; indicator: string }> = [
    { id: "overview", label: "Overview", indicator: `${displayedConditions.length}` },
    { id: "actions", label: "Actions", indicator: `${reviewActionProgress.openBlockers}` },
    { id: "timeline", label: "Timeline", indicator: `${readinessTimeline.length}` },
    { id: "review-diff", label: "Review Diff", indicator: reviewDiff ? `${reviewDiffChangedCount(reviewDiff)}` : "—" },
    { id: "evidence", label: "Evidence", indicator: `${evidenceLedger.missing.length}` },
    { id: "blast-radius", label: "Surfaces", indicator: `${affectedSurfaces.length}` },
    { id: "findings", label: "Findings", indicator: `${report.findings.length}` },
    { id: "tests", label: "Tests", indicator: `${report.missingTests.length}` },
    { id: "operations", label: "Operations", indicator: operationalStatus === "ATTENTION" ? "Attention" : "Clear" },
    { id: "review-focus", label: "Review focus", indicator: supportedReviewerFocus ? `${supportedReviewerFocus.length}` : "Legacy" },
    { id: "changed-files", label: "Changed files", indicator: `${report.changedFiles.length}` },
    { id: "export", label: "Export", indicator: "MD" },
  ];

  useEffect(() => {
    try {
      setClearedConditionKeys(readConditionProgress(window.localStorage, report, displayedConditions));
    } catch {
      setClearedConditionKeys(new Set());
    }
  }, [report, displayedConditionSignature]);

  useEffect(() => {
    setSelectedFindingIndex((current) => (
      current !== null && current >= report.findings.length ? null : current
    ));
  }, [report]);

  useEffect(() => {
    try {
      const savedState = readReviewState(window.localStorage, report);
      setReviewState(savedState);
      setStudioDecision(studioDecisionFromReviewState(savedState.status));
      setAcceptedRiskReason("");
      noteHistoryBaselineRef.current = savedState.note;
    } catch {
      const fallbackState = defaultReviewState(report);
      setReviewState(fallbackState);
      setStudioDecision(studioDecisionFromReviewState(fallbackState.status));
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

  function updateReviewState(nextState: ReportReviewState) {
    try {
      const savedState = writeReviewState(window.localStorage, reviewStateKeyForReport(report), nextState);
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

  function focusReportTab(tab: ReportTab) {
    window.requestAnimationFrame(() => {
      document.getElementById(`report-tab-${tab}`)?.focus();
    });
  }

  function quickJumpTo(tab: ReportTab, label: string, targetId?: string) {
    setActiveTab(tab);
    window.setTimeout(() => {
      if (targetId) {
        document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    }, 0);
    showQuickActionMessage("success", `Jumped to ${label}.`);
  }

  function openDecisionStudio() {
    quickJumpTo("export", "Decision Studio", "decision-studio-title");
  }

  function handleReportTabKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLElement) || event.target.getAttribute("role") !== "tab") return;

    const currentIndex = reportTabs.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % reportTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + reportTabs.length) % reportTabs.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = reportTabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      const nextTab = reportTabs[nextIndex].id;
      setActiveTab(nextTab);
      focusReportTab(nextTab);
    }
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
    if (studioDecision === "Approved with accepted risk" && acceptedRiskReason.trim().length === 0) {
      setStudioDecisionState("failed");
      if (studioDecisionResetTimer.current) clearTimeout(studioDecisionResetTimer.current);
      studioDecisionResetTimer.current = setTimeout(() => setStudioDecisionState("idle"), 2_000);
      return;
    }

    const previousStatus = reviewState.status;
    updateReviewState(studioReviewState);

    recordDecisionEvent({
      type: studioDecision === "Approved with accepted risk" ? "accepted-risk-recorded" : "human-decision-recorded",
      title: studioDecision === "Approved with accepted risk" ? "Accepted risk recorded" : "Human decision recorded",
      detail: studioDecision === "Approved with accepted risk"
        ? `Approved with accepted risk. Reason: ${acceptedRiskReason.trim()}`
        : `Human decision recorded in Decision Studio: ${studioDecision}.`,
      previousState: previousStatus,
      nextState: studioDecision,
      label: "Local",
    });

    setStudioDecisionState("copied");
    if (studioDecisionResetTimer.current) clearTimeout(studioDecisionResetTimer.current);
    studioDecisionResetTimer.current = setTimeout(() => setStudioDecisionState("idle"), 2_000);
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
            Quick actions <span>Ctrl/Cmd K</span>
          </button>
          <button
            className={`copy-summary-button copy-summary-button--${copyState}`}
            type="button"
            onClick={handleCopySummary}
            aria-live="polite"
          >
            {copyLabels[copyState]}
          </button>
          <button
            className={`download-markdown-button download-markdown-button--${downloadState}`}
            type="button"
            onClick={handleDownloadMarkdown}
            aria-live="polite"
          >
            {downloadLabels[downloadState]}
          </button>
          <span className="sync-status"><i /> Analysed {pr.updatedAt}</span>
        </>
      }
    >
      <div className="main-content report-surface" id="report">
        {quickActionsOpen && (
          <section className="quick-actions-panel" id="report-quick-actions" aria-label="Report quick actions">
            <div className="quick-actions-header">
              <div>
                <span className="card-kicker">QUICK ACTIONS</span>
                <h2>Move the review forward</h2>
                <p>Local actions only. No GitHub, Slack or backend updates are sent.</p>
              </div>
              {quickActionMessage && (
                <span className={`quick-actions-status quick-actions-status--${quickActionMessage.state}`} role="status">
                  {quickActionMessage.text}
                </span>
              )}
            </div>
            <div className="quick-actions-grid">
              <button type="button" onClick={() => { window.location.assign("/workspace"); }}>
                <strong>Go to Risk inbox</strong>
                <span>Return to queue</span>
              </button>
              <button type="button" onClick={() => guidedTour?.startTour()}>
                <strong>Start guided tour</strong>
                <span>Explore workflow</span>
              </button>
              <button type="button" onClick={() => quickSetReviewStatus("Ready to merge")}>
                <strong>Ready to merge</strong>
                <span>Mark local state</span>
              </button>
              <button type="button" onClick={() => quickSetReviewStatus("Tests requested")}>
                <strong>Tests requested</strong>
                <span>Mark local state</span>
              </button>
              <button type="button" onClick={() => quickSetReviewStatus("Blocked")}>
                <strong>Blocked</strong>
                <span>Mark local state</span>
              </button>
              <button type="button" onClick={handleQuickCopyMergeSummary}>
                <strong>Copy merge summary</strong>
                <span>PR-ready Markdown</span>
              </button>
              <button type="button" onClick={handleQuickCopySlackHandoff}>
                <strong>Copy Slack handoff</strong>
                <span>Channel-friendly text</span>
              </button>
              <button type="button" onClick={() => quickJumpTo("evidence", "Evidence")}>
                <strong>Jump to Evidence</strong>
                <span>Ledger and contract</span>
              </button>
              <button type="button" onClick={() => quickJumpTo("actions", "Actions")}>
                <strong>Jump to Actions</strong>
                <span>Blockers board</span>
              </button>
              <button type="button" onClick={() => quickJumpTo("timeline", "Timeline")}>
                <strong>Jump to Timeline</strong>
                <span>Decision history</span>
              </button>
              <button type="button" onClick={() => quickJumpTo("findings", "Findings")}>
                <strong>Jump to Findings</strong>
                <span>Evidence-backed risks</span>
              </button>
              <button type="button" onClick={() => quickJumpTo("evidence", "Merge contract", "merge-contract-title")}>
                <strong>Jump to Merge contract</strong>
                <span>Conditions before merge</span>
              </button>
              <button type="button" onClick={() => quickJumpTo("blast-radius", "Blast radius")}>
                <strong>Jump to Blast radius</strong>
                <span>Affected surfaces</span>
              </button>
              <button type="button" onClick={() => quickJumpTo("export", "Export")}>
                <strong>Jump to Export</strong>
                <span>Copy and download</span>
              </button>
              <button type="button" onClick={openDecisionStudio}>
                <strong>Open Decision Studio</strong>
                <span>Final decision</span>
              </button>
            </div>
          </section>
        )}

        <div className="report-working-layout">
          <div className="report-content">
          <nav className="report-tabs" aria-label="Report sections" role="tablist" onKeyDown={handleReportTabKeyDown}>
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                id={`report-tab-${tab.id}`}
                className={activeTab === tab.id ? "report-tab report-tab--active" : "report-tab"}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`report-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <strong>{tab.indicator}</strong>
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <div
              className="report-tab-panel report-tab-panel--overview"
              id="report-panel-overview"
              role="tabpanel"
              aria-labelledby="report-tab-overview"
            >
          <section className="report-header" id="overview">
            <div className="header-copy">
              <div className="header-overline"><span className="pull-request-mark">↗</span> PULL REQUEST #{pr.number}</div>
              <h1>{pr.title}</h1>
              <div className="report-meta">
                <span>{pr.repository}</span><span className="meta-separator">•</span><span>{inputSourceLabel(pr.branch)}</span><span className="meta-separator">•</span><span>Mode: {reviewProfileLabel(pr.reviewProfile)}</span><span className="meta-separator">•</span><span>{pr.language}</span><span className="meta-separator">•</span><span>{pr.framework}</span>
              </div>
              <div className="report-header-state" aria-label="Local review state summary">
                <span className="report-header-chip report-header-chip--state">{reviewState.status}</span>
                <span className="report-header-chip report-header-chip--owner">{displayedOwner}</span>
                <span className="report-header-chip">{conditionProgressLabel}</span>
              </div>
            </div>
            <div className="header-verdict">
              <RecommendationBadge recommendation={verdict.recommendation} />
              <span className="verdict-caption">Merge recommendation</span>
            </div>
          </section>

          <section className="overview-grid" aria-label="Report overview">
            <article className="score-card">
              <div>
                <span className="card-kicker">RISK BAND</span>
                <strong className={`risk-band risk-band--${verdict.riskLevel.toLowerCase()}`}>{verdict.riskLevel} RISK</strong>
                <span className="risk-score-detail">Risk score: {verdict.riskScore}/100</span>
              </div>
            </article>
            <article className="summary-card">
              <div className="section-heading"><div><span className="card-kicker">EXECUTIVE SUMMARY</span><h2>{recommendationHeadings[verdict.recommendation]}</h2></div><span className="confidence">Confidence: {verdict.confidence}</span></div>
              <p>{verdict.summary}</p>
            </article>
          </section>

          <section className="section-block report-score-breakdown" aria-labelledby="score-breakdown-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">READINESS SCORE</span>
                <h2 id="score-breakdown-title">Why this score looks the way it does</h2>
              </div>
              <span className="section-count">Heuristic / not production-calibrated</span>
            </div>

            <div className="score-breakdown-summary" aria-label="Readiness score summary">
              <article>
                <span>Current score</span>
                <strong>{verdict.riskLevel} · {verdict.riskScore}/100</strong>
              </article>
              <article>
                <span>Strongest positive signal</span>
                <strong>{readinessScoreBreakdown.strongestPositiveSignal}</strong>
              </article>
              <article>
                <span>Biggest score drag</span>
                <strong>{readinessScoreBreakdown.biggestScoreDrag}</strong>
              </article>
              <article>
                <span>Next readiness action</span>
                <strong>{readinessScoreBreakdown.nextAction}</strong>
              </article>
            </div>

            <div className="score-breakdown-components">
              {readinessScoreBreakdown.components.map((component) => (
                <article className={`score-component score-component--${component.status.toLowerCase()}`} key={component.label}>
                  <div className="score-component-header">
                    <h3>{component.label}</h3>
                    <span>{component.status}</span>
                  </div>
                  <p>{component.explanation}</p>
                  <dl>
                    <div>
                      <dt>Improves with</dt>
                      <dd>{component.improvesWith}</dd>
                    </div>
                    <div>
                      <dt>Related evidence</dt>
                      <dd>{component.relatedEvidence}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          {readinessDelta && (
            <section className={`section-block readiness-delta readiness-delta--${readinessDelta.classification}`} aria-labelledby="readiness-delta-title">
              <div className="section-heading">
                <div>
                  <span className="card-kicker">READINESS DELTA</span>
                  <h2 id="readiness-delta-title">
                    {readinessDelta.classification === "initial" ? "Initial readiness baseline" : "Since previous analysis"}
                  </h2>
                </div>
                <div className="readiness-delta-heading-actions">
                  {reviewDiff && <button type="button" onClick={() => setActiveTab("review-diff")}>View Review Diff</button>}
                </div>
              </div>

              {staleDecisionNotice}

              {readinessDelta.deltaFailureCategory && (
                <p className="delta-failure-note" role="status">
                  Comparison incomplete — {readinessDelta.deltaFailureCategory.replaceAll("_", " ")}. The current report remains available.
                </p>
              )}

              <DeltaEvolutionHeader source={readinessDelta} />

              {readinessDelta.classification !== "initial" ? (
                <>
                  <div className="delta-count-row" aria-label="Movement since previous analysis">
                    <span className={readinessDelta.clearedMergeConditions.length > 0 ? "delta-count delta-count--good" : "delta-count"}>
                      <strong>{readinessDelta.clearedMergeConditions.length}</strong> Cleared
                    </span>
                    <span className={readinessDelta.openedMergeConditions.length > 0 ? "delta-count delta-count--bad" : "delta-count"}>
                      <strong>{readinessDelta.openedMergeConditions.length}</strong> Opened
                    </span>
                    {readinessDelta.reopenedMergeConditions.length > 0 && (
                      <span className="delta-count delta-count--bad">
                        <strong>{readinessDelta.reopenedMergeConditions.length}</strong> Reopened
                      </span>
                    )}
                    <span className={readinessDelta.unchangedOpenMergeConditions.length > 0 ? "delta-count delta-count--warn" : "delta-count"}>
                      <strong>{readinessDelta.unchangedOpenMergeConditions.length}</strong> Still open
                    </span>
                    <span className={readinessDelta.addedBlockers.length > 0 ? "delta-count delta-count--bad" : readinessDelta.clearedBlockers.length > 0 ? "delta-count delta-count--good" : "delta-count"}>
                      <strong>+{readinessDelta.addedBlockers.length} / −{readinessDelta.clearedBlockers.length}</strong> Blockers
                    </span>
                    <span className={readinessDelta.addedTestOrEvidenceGaps.length > 0 ? "delta-count delta-count--bad" : readinessDelta.clearedTestOrEvidenceGaps.length > 0 ? "delta-count delta-count--good" : "delta-count"}>
                      <strong>+{readinessDelta.addedTestOrEvidenceGaps.length} / −{readinessDelta.clearedTestOrEvidenceGaps.length}</strong> Test / evidence gaps
                    </span>
                  </div>

                  {readinessDelta.classification === "unchanged" && (
                    <p className="readiness-delta-note">New commit analysed — no material change to the merge decision.</p>
                  )}

                  <div className="readiness-delta-lists">
                    <article>
                      <h3>Cleared</h3>
                      {readinessDelta.clearedMergeConditions.length > 0 ? (
                        <>
                          <ul>{readinessDelta.clearedMergeConditions.slice(0, 3).map((condition) => <li key={condition}>{condition}</li>)}</ul>
                          {readinessDelta.clearedMergeConditions.length > 3 && (
                            reviewDiff
                              ? <button className="readiness-delta-more" type="button" onClick={() => setActiveTab("review-diff")}>+{readinessDelta.clearedMergeConditions.length - 3} more in Review Diff</button>
                              : <p>+{readinessDelta.clearedMergeConditions.length - 3} more</p>
                          )}
                        </>
                      ) : <p>No cleared merge conditions.</p>}
                    </article>
                    <article>
                      <h3>Opened or reopened</h3>
                      {[...readinessDelta.openedMergeConditions, ...readinessDelta.reopenedMergeConditions].length > 0 ? (
                        <>
                          <ul>{[...readinessDelta.openedMergeConditions, ...readinessDelta.reopenedMergeConditions].slice(0, 3).map((condition) => <li key={condition}>{condition}</li>)}</ul>
                          {[...readinessDelta.openedMergeConditions, ...readinessDelta.reopenedMergeConditions].length > 3 && (
                            reviewDiff
                              ? <button className="readiness-delta-more" type="button" onClick={() => setActiveTab("review-diff")}>+{[...readinessDelta.openedMergeConditions, ...readinessDelta.reopenedMergeConditions].length - 3} more in Review Diff</button>
                              : <p>+{[...readinessDelta.openedMergeConditions, ...readinessDelta.reopenedMergeConditions].length - 3} more</p>
                          )}
                        </>
                      ) : <p>No new merge conditions.</p>}
                    </article>
                    <article>
                      <h3>Blocker movement</h3>
                      {readinessDelta.addedBlockers.length > 0 || readinessDelta.clearedBlockers.length > 0 ? (
                        <ul>
                          {readinessDelta.clearedBlockers.slice(0, 2).map((blocker) => <li key={`cleared-${blocker}`}>Cleared: {blocker}</li>)}
                          {readinessDelta.addedBlockers.slice(0, 2).map((blocker) => <li key={`added-${blocker}`}>Added: {blocker}</li>)}
                        </ul>
                      ) : <p>No blocker movement.</p>}
                    </article>
                  </div>
                </>
              ) : (
                <p className="readiness-delta-note">
                  This is the first completed automated analysis for this pull request. Review Diff becomes available after the next
                  completed head-SHA analysis, and this section will then show improved, regressed, mixed or unchanged movement.
                </p>
              )}
            </section>
          )}

          <section className="section-block change-passport" aria-labelledby="change-passport-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">DECLARED CONTEXT</span>
                <h2 id="change-passport-title">Change Passport</h2>
                <p>Builder-declared context. Lintel does not treat these claims as verified evidence.</p>
              </div>
              <span className="section-count">{changePassport ? changePassport.completeness : "Absent"}</span>
            </div>

            {changePassport ? (
              <>
                <div className="passport-summary-grid">
                  <article><span>Producer</span><strong>{changePassport.producerType}</strong></article>
                  <article><span>Tool / model</span><strong>{[changePassport.producer?.tool, changePassport.producer?.model].filter(Boolean).join(" / ") || "Not supplied"}</strong></article>
                  <article><span>Source</span><strong>{changePassport.source}</strong></article>
                  <article><span>Validation claims</span><strong>{changePassport.claimedValidation.length + changePassport.claimedTests.length}</strong></article>
                  <article><span>Assumptions</span><strong>{changePassport.assumptions.length}</strong></article>
                  <article><span>Uncertainty</span><strong>{changePassport.unresolvedUncertainty.length}</strong></article>
                </div>

                <div className="passport-callout">
                  <strong>{changePassport.taskIntent ?? "No task intent supplied."}</strong>
                  <span>{passportComparison.summary}</span>
                </div>

                <details className="passport-details">
                  <summary>Inspect declared context and Lintel observations</summary>
                  <div className="passport-detail-grid">
                    <PassportList title="Change summary" items={changePassport.changeSummary ? [changePassport.changeSummary] : []} empty="No change summary supplied." />
                    <PassportList title="Claimed files and surfaces" items={[...changePassport.claimedFiles, ...changePassport.claimedSurfaces]} empty="No files or affected surfaces declared." />
                    <PassportList title="Tests and validation" items={[...changePassport.claimedTests, ...changePassport.claimedValidation]} empty="No validation declared." />
                    <PassportList title="Assumptions and constraints" items={[...changePassport.assumptions, ...changePassport.constraints]} empty="No assumptions or constraints declared." />
                    <PassportList title="Known limitations" items={changePassport.knownLimitations} empty="No known limitations declared." />
                    <PassportList title="Unresolved uncertainty" items={changePassport.unresolvedUncertainty} empty="No unresolved uncertainty declared." />
                    <PassportList title="Reviewer handoff" items={changePassport.handoffNotes ? [changePassport.handoffNotes] : []} empty="No reviewer handoff note supplied." />
                    <PassportObservations title="Supported declarations" items={passportComparison.supportedDeclarations} empty="No declarations were directly supported by structured report signals." />
                    <PassportObservations title="Unverified declarations" items={passportComparison.unverifiedDeclarations} empty="No unverified declarations recorded." />
                    <PassportObservations title="Observed but not declared" items={passportComparison.observedButUndeclared} empty="No undeclared concerns observed by Lintel." />
                  </div>
                </details>
              </>
            ) : (
              <div className="passport-empty">
                <strong>No Change Passport was supplied for this change.</strong>
                <p>Passport absence is not automatic proof of risk. It only means the builder did not provide structured intent, validation, assumptions or uncertainty for this review.</p>
              </div>
            )}
          </section>

          {canonicalRun && (
            <section className="section-block run-provenance" aria-labelledby="run-provenance-title">
              <div className="section-heading">
                <div>
                  <span className="card-kicker">RUN PROVENANCE</span>
                  <h2 id="run-provenance-title">Canonical review run</h2>
                </div>
                <span className="section-count">{reproducibilityLabel(canonicalRun.reproducibility)}</span>
              </div>

              <div className="run-provenance-grid">
                <article><span>Run ID</span><strong>{fingerprintPrefix(canonicalRun.runId)}</strong></article>
                <article><span>Source</span><strong>{canonicalRun.sourceType}</strong></article>
                <article><span>Head SHA</span><strong>{shortSha(canonicalRun.headSha)}</strong></article>
                <article><span>Review mode</span><strong>{reviewProfileLabel(canonicalRun.reviewMode)}</strong></article>
                <article><span>Analysis source</span><strong>{canonicalRun.analysisSource}</strong></article>
                <article><span>Ruleset / generator</span><strong>{canonicalRun.deterministicRulesetVersion} / {canonicalRun.generatorVersion}</strong></article>
                <article><span>Provider / model</span><strong>{canonicalRun.provider || canonicalRun.model ? `${canonicalRun.provider ?? "provider"} / ${canonicalRun.model ?? "model"}` : "Not used"}</strong></article>
                <article><span>Completed</span><strong>{canonicalRun.completedAt ? timelineTime(canonicalRun.completedAt) : "Unknown"}</strong></article>
              </div>

              <dl className="run-fingerprint-grid" aria-label="Canonical run fingerprints">
                <div><dt>Input</dt><dd>{fingerprintPrefix(canonicalRun.inputFingerprint)}</dd></div>
                <div><dt>Configuration</dt><dd>{fingerprintPrefix(canonicalRun.configurationFingerprint)}</dd></div>
                <div><dt>Result</dt><dd>{fingerprintPrefix(canonicalRun.resultFingerprint)}</dd></div>
                <div><dt>Previous run</dt><dd>{fingerprintPrefix(canonicalRun.previousRunId)}</dd></div>
              </dl>

              {canonicalRun.reproducibilityLimitation && <p className="run-provenance-note">{canonicalRun.reproducibilityLimitation}</p>}

              <div className="run-provenance-actions">
                <button type="button" onClick={handleVerifyRun} disabled={!verificationTarget || isVerifyingRun}>
                  {isVerifyingRun ? "Verifying..." : verificationTarget ? "Verify run" : "Verification unavailable"}
                </button>
                <span>{verificationTarget ? "Server-side deterministic replay is available for this GitHub App run." : "This run can be traced, but cannot be replayed from retained source in the browser."}</span>
              </div>

              {verificationResult && (
                <div className={`run-verification-result run-verification-result--${verificationResult.reproducibility}`}>
                  <div>
                    <span className="card-kicker">VERIFICATION RESULT</span>
                    <strong>{reproducibilityLabel(verificationResult.reproducibility)}</strong>
                  </div>
                  <dl>
                    <div><dt>Source</dt><dd>{verificationLabel(verificationResult.sourceMatched)}</dd></div>
                    <div><dt>Configuration</dt><dd>{verificationLabel(verificationResult.configurationMatched)}</dd></div>
                    <div><dt>Result</dt><dd>{verificationLabel(verificationResult.resultMatched)}</dd></div>
                    <div><dt>Checked</dt><dd>{timelineTime(verificationResult.createdAt)}</dd></div>
                  </dl>
                  <p>{verificationResult.details}</p>
                  {verificationResult.failureCategory && <p>Failure category: {verificationResult.failureCategory.replaceAll("_", " ")}</p>}
                </div>
              )}
            </section>
          )}

          <section className="merge-conditions" aria-labelledby="merge-conditions-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">DECISION GATE</span>
                <h2 id="merge-conditions-title">Conditions before merge</h2>
                {conditionTrackingEnabled && <span className="condition-progress">{conditionProgressSummary(clearedConditionCount, displayedConditions.length)}</span>}
              </div>
              <div className="merge-conditions-actions">
                <RecommendationBadge recommendation={verdict.recommendation} />
                <button
                  className={`copy-conditions-button copy-conditions-button--${conditionsCopyState}`}
                  type="button"
                  onClick={handleCopyConditions}
                  aria-live="polite"
                >
                  {copyConditionsLabels[conditionsCopyState]}
                </button>
              </div>
            </div>
            {conditionTrackingEnabled ? (
              <>
                <ul className="condition-checklist">
                  {displayedConditions.map((condition) => {
                    const key = conditionKey(condition);
                    const checked = clearedConditionKeys.has(key);

                    return (
                      <li key={condition}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => toggleCondition(condition, event.target.checked)}
                          />
                          <span>{condition}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className="condition-local-note">Track locally. Condition progress is stored on this device.</p>
              </>
            ) : displayedConditions.length > 0 ? (
              <ol>{displayedConditions.map((condition) => <li key={condition}>{condition}</li>)}</ol>
            ) : <p className="merge-conditions-clear">No merge conditions detected.</p>}
          </section>

          <section className="section-block report-ownership-cues">
            <div className="section-heading">
              <div><span className="card-kicker">LOCAL OWNERSHIP</span><h2>Who should look next?</h2></div>
              <span className="section-count">Stored locally</span>
            </div>
            <div className="ownership-cue-grid">
              <article>
                <span>Selected owner</span>
                <strong>{reviewState.owner}</strong>
                <p>This is a local cue only. Lintel is not assigning a real person or notifying a team.</p>
              </article>
              <article>
                <span>Suggested owner cues</span>
                <strong>{suggestedOwners.length > 0 ? suggestedOwners.join(" / ") : "No specialist cue"}</strong>
                <p>Derived from findings, missing tests, operational readiness, reviewer focus and affected surfaces.</p>
              </article>
            </div>
          </section>
            </div>
          )}

          {activeTab === "actions" && (
            <div
              className="report-tab-panel"
              id="report-panel-actions"
              data-tour="review-actions"
              role="tabpanel"
              aria-labelledby="report-tab-actions"
            >
          <section className="section-block report-action-board" aria-labelledby="review-actions-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">BLOCKER RESOLUTION</span>
                <h2 id="review-actions-title">Review actions</h2>
              </div>
              <span className="section-count">Stored locally on this device</span>
            </div>

            <div className="action-progress-grid" aria-label="Review action progress">
              <article>
                <span>Open blockers</span>
                <strong>{reviewActionProgress.openBlockers}</strong>
              </article>
              <article>
                <span>Required resolved</span>
                <strong>{reviewActionProgress.requiredResolved}/{reviewActionProgress.requiredTotal}</strong>
              </article>
              <article>
                <span>Optional actions</span>
                <strong>{reviewActionProgress.optionalActions}</strong>
              </article>
              <article>
                <span>Readiness conclusion</span>
                <p>{reviewActionProgress.readinessConclusion}</p>
              </article>
            </div>

            {reviewActions.length > 0 ? (
              <div className="review-action-list">
                {reviewActions.map((action) => (
                  <article
                    className={`review-action-card review-action-card--${action.priority.toLowerCase().replaceAll(" ", "-")} review-action-card--status-${action.status.toLowerCase().replaceAll(" ", "-")}`}
                    key={action.key}
                  >
                    <div className="review-action-card-header">
                      <div>
                        <span>{action.source}</span>
                        <h3>{action.title}</h3>
                      </div>
                      <strong>{action.priority}</strong>
                    </div>
                    <p>{action.reason}</p>
                    <div className="review-action-meta">
                      <div>
                        <span>Suggested owner</span>
                        <strong>{action.suggestedOwner}</strong>
                      </div>
                      <label>
                        <span>Status</span>
                        <select
                          value={action.status}
                          onChange={(event) => updateReviewActionStatus(action, event.target.value as ReviewActionStatus)}
                        >
                          {REVIEW_ACTION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="section-empty section-empty--positive">No blocker or review actions generated. Complete normal human review and CI checks.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "timeline" && (
            <div
              className="report-tab-panel"
              id="report-panel-timeline"
              role="tabpanel"
              aria-labelledby="report-tab-timeline"
            >
          <section className="section-block report-decision-history" aria-labelledby="decision-history-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">LOCAL DECISION HISTORY</span>
                <h2 id="decision-history-title">PR readiness timeline</h2>
              </div>
              <span className="section-count">Stored locally on this device</span>
            </div>

            <div className="timeline-summary-grid" aria-label="Readiness timeline summary">
              <article>
                <span>Current review state</span>
                <strong>{reviewState.status}</strong>
              </article>
              <article>
                <span>Local owner</span>
                <strong>{displayedOwner}</strong>
              </article>
              <article>
                <span>Conditions cleared</span>
                <strong>{displayedConditions.length === 0 ? "None needed" : `${clearedConditionCount}/${displayedConditions.length}`}</strong>
              </article>
              <article>
                <span>Open conditions</span>
                <strong>{openConditionCount}</strong>
              </article>
              <article>
                <span>Last local update</span>
                <strong>{lastDecisionUpdate ? timelineTime(lastDecisionUpdate) : "No local changes yet"}</strong>
              </article>
              <article>
                <span>Timeline events</span>
                <strong>{readinessTimeline.length}</strong>
              </article>
            </div>

            <p className="timeline-local-note">This is local-only decision history for the current browser. It is not team audit logging and is not sent to an API.</p>

            <div className="timeline-filter-bar" aria-label="Timeline filters">
              {timelineFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={timelineFilter === filter ? "timeline-filter timeline-filter--active" : "timeline-filter"}
                  aria-pressed={timelineFilter === filter}
                  onClick={() => {
                    setTimelineFilter(filter);
                    setSelectedTimelineEventId(null);
                  }}
                >
                  {filter}
                  <span>{filter === "All" ? readinessTimeline.length : readinessTimeline.filter((event) => event.category === filter).length}</span>
                </button>
              ))}
            </div>

            <div className="decision-timeline-workspace">
            <ol className="decision-timeline" aria-label="Readiness evolution events">
              {filteredTimeline.map((event) => (
                <li className={event.current ? "decision-timeline-item decision-timeline-item--current" : "decision-timeline-item"} key={event.id}>
                  <div className="decision-timeline-marker" aria-hidden="true" />
                  <button
                    className={selectedTimelineEventId === event.id ? "decision-timeline-event decision-timeline-event--selected" : "decision-timeline-event"}
                    type="button"
                    aria-pressed={selectedTimelineEventId === event.id}
                    onClick={() => setSelectedTimelineEventId(event.id)}
                  >
                    <div className="decision-timeline-header">
                      <div>
                        <h3>{event.title}</h3>
                        <time dateTime={event.timestamp}>{timelineTime(event.timestamp)}</time>
                      </div>
                      <span>{event.provenance}</span>
                    </div>
                    <div className="decision-timeline-meta">
                      <span>{event.category}</span>
                      <span>{event.actor}</span>
                      {event.movement && <strong>{event.movement}</strong>}
                    </div>
                    {(event.previousState || event.nextState) && (
                      <div className="decision-timeline-state">
                        {event.previousState && <span>{event.previousState}</span>}
                        {event.previousState && event.nextState && <strong>→</strong>}
                        {event.nextState && <span>{event.nextState}</span>}
                      </div>
                    )}
                    <p>{event.summary}</p>
                  </button>
                </li>
              ))}
            </ol>
              <aside className="timeline-event-inspector" aria-label="Timeline event details">
                {selectedTimelineEvent ? (
                  <>
                    <div className="timeline-event-inspector-header">
                      <div>
                        <span className="card-kicker">EVENT INSPECTOR</span>
                        <h3>{selectedTimelineEvent.title}</h3>
                      </div>
                      <button type="button" onClick={() => setSelectedTimelineEventId(null)}>Close</button>
                    </div>
                    <dl className="timeline-event-detail-grid">
                      <div><dt>Timestamp</dt><dd><time dateTime={selectedTimelineEvent.timestamp}>{timelineTime(selectedTimelineEvent.timestamp)}</time></dd></div>
                      <div><dt>Actor / source</dt><dd>{selectedTimelineEvent.actor}</dd></div>
                      <div><dt>Provenance</dt><dd>{selectedTimelineEvent.provenance}</dd></div>
                      <div><dt>Report area</dt><dd>{selectedTimelineEvent.area}</dd></div>
                      <div><dt>Previous state</dt><dd>{selectedTimelineEvent.previousState ?? "Not recorded"}</dd></div>
                      <div><dt>New state</dt><dd>{selectedTimelineEvent.nextState ?? "Not recorded"}</dd></div>
                      <div><dt>Decision impact</dt><dd>{selectedTimelineEvent.movement ?? "Context recorded"}</dd></div>
                    </dl>
                    <div className="timeline-event-explanation">
                      <span>Explanation</span>
                      <p>{selectedTimelineEvent.summary}</p>
                    </div>
                    <div className="timeline-event-explanation">
                      <span>Related item</span>
                      <p>{selectedTimelineEvent.relatedItem ?? "No directly related condition, finding, test or reviewer was recorded."}</p>
                    </div>
                    {reviewDiff && selectedTimelineEvent.area === "Readiness Delta" && (
                      <button className="timeline-review-diff-button" type="button" onClick={() => setActiveTab("review-diff")}>
                        View Review Diff
                      </button>
                    )}
                  </>
                ) : (
                  <div className="timeline-event-empty">
                    <span className="card-kicker">EVENT INSPECTOR</span>
                    <h3>Select a timeline event</h3>
                    <p>Inspect the event source, state movement, related report area and why it matters to the current merge-readiness decision.</p>
                  </div>
                )}
              </aside>
            </div>
          </section>
            </div>
          )}

          {activeTab === "review-diff" && (
            <div
              className="report-tab-panel"
              id="report-panel-review-diff"
              role="tabpanel"
              aria-labelledby="report-tab-review-diff"
            >
          <section className="section-block report-review-diff" aria-labelledby="review-diff-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">COMMIT-AWARE REVIEW</span>
                <h2 id="review-diff-title">Review Diff</h2>
              </div>
              <span className="section-count">{reviewDiff ? classificationLabel(reviewDiff.classification) : "Unavailable"}</span>
            </div>

            {reviewDiff ? (
              <>
                {staleDecisionNotice}

                {reviewDiff.failureCategory && (
                  <p className="delta-failure-note" role="status">
                    Comparison incomplete — {reviewDiff.failureCategory.replaceAll("_", " ")}. Items below may not reflect the full change.
                  </p>
                )}

                <DeltaEvolutionHeader source={reviewDiff} />

                <div className="review-diff-filter-bar" aria-label="Review Diff filters">
                  {reviewDiffActiveFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={reviewDiffFilter === filter ? "review-diff-filter review-diff-filter--active" : "review-diff-filter"}
                      aria-pressed={reviewDiffFilter === filter}
                      onClick={() => setReviewDiffFilter(filter)}
                    >
                      {filter}
                      <span>{filter === "All" ? reviewDiffAllItems.length : reviewDiffAllItems.filter((item) => reviewDiffFilterMatches(item, filter)).length}</span>
                    </button>
                  ))}
                </div>

                {reviewDiffVisibleCount === 0 ? (
                  <p className="section-empty section-empty--positive">No structured Review Diff items match this filter.</p>
                ) : (
                  <div className="review-diff-sections">
                    <ReviewDiffSection title="Findings" items={reviewDiff.findings} filter={reviewDiffFilter} />
                    <ReviewDiffSection title="Evidence" items={reviewDiff.evidence} filter={reviewDiffFilter} />
                    <ReviewDiffSection title="Tests" items={reviewDiff.testGaps} filter={reviewDiffFilter} />
                    <ReviewDiffSection title="Merge conditions" items={reviewDiff.mergeConditions} filter={reviewDiffFilter} />
                  </div>
                )}
              </>
            ) : readinessDelta?.classification === "initial" ? (
              <div className="review-diff-placeholder">
                <DeltaEvolutionHeader source={readinessDelta} />
                <p className="section-empty">This is the initial readiness baseline. Review Diff becomes available after the next completed head-SHA analysis for the same pull request.</p>
              </div>
            ) : readinessDelta ? (
              <div className="review-diff-placeholder">
                <DeltaEvolutionHeader source={readinessDelta} />
                <p className="section-empty">Readiness Delta is available, but the detailed item comparison was not stored for this run — this can happen for older records. The current report remains available.</p>
              </div>
            ) : (
              <p className="section-empty">No automated run history is attached to this report. Review Diff is available for GitHub App automated re-analyses.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "evidence" && (
            <div
              className="report-tab-panel"
              id="report-panel-evidence"
              role="tabpanel"
              aria-labelledby="report-tab-evidence"
            >
          <section className="section-block report-evidence-ledger" aria-labelledby="evidence-ledger-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">EXPLAINABILITY</span>
                <h2 id="evidence-ledger-title">Evidence ledger</h2>
              </div>
              <span className="section-count">{evidenceLedger.found.length} found / {evidenceLedger.missing.length} missing</span>
            </div>

            <div className="evidence-summary-grid" aria-label="Evidence summary">
              <article>
                <span>Evidence found</span>
                <strong>{evidenceLedger.found.length}</strong>
              </article>
              <article>
                <span>Missing evidence</span>
                <strong>{evidenceLedger.missing.length}</strong>
              </article>
              <article>
                <span>Open conditions</span>
                <strong>{openConditionCount}</strong>
              </article>
              <article>
                <span>Readiness conclusion</span>
                <p>{readinessConclusion}</p>
              </article>
            </div>

            <div className="evidence-ledger-grid">
              <section className="evidence-ledger-column" aria-labelledby="evidence-found-title">
                <div className="evidence-ledger-column-heading">
                  <h3 id="evidence-found-title">Evidence found</h3>
                  <span>Supports the current decision</span>
                </div>
                {evidenceLedger.found.length > 0 ? (
                  <div className="evidence-ledger-list">
                    {evidenceLedger.found.map((item) => <EvidenceLedgerCard item={item} key={`${item.label}-${item.detail}`} />)}
                  </div>
                ) : (
                  <p className="section-empty">No supporting evidence was identified in this legacy report.</p>
                )}
              </section>

              <section className="evidence-ledger-column" aria-labelledby="evidence-missing-title">
                <div className="evidence-ledger-column-heading">
                  <h3 id="evidence-missing-title">Evidence missing</h3>
                  <span>Blocks or needs confirmation before merge</span>
                </div>
                {evidenceLedger.missing.length > 0 ? (
                  <div className="evidence-ledger-list">
                    {evidenceLedger.missing.map((item) => <EvidenceLedgerCard item={item} key={`${item.label}-${item.detail}`} />)}
                  </div>
                ) : (
                  <p className="section-empty section-empty--positive">No missing evidence detected.</p>
                )}
              </section>
            </div>
          </section>

          <section className="section-block report-merge-contract" aria-labelledby="merge-contract-title" data-tour="merge-contract">
            <div className="section-heading">
              <div>
                <span className="card-kicker">MERGE CONTRACT</span>
                <h2 id="merge-contract-title">What must be true before merge</h2>
                {conditionTrackingEnabled && <span className="condition-progress">{conditionProgressLabel}</span>}
              </div>
              <RecommendationBadge recommendation={verdict.recommendation} />
            </div>

            {conditionTrackingEnabled ? (
              <>
                <ul className="merge-contract-list">
                  {displayedConditions.map((condition) => {
                    const key = conditionKey(condition);
                    const checked = clearedConditionKeys.has(key);

                    return (
                      <li key={condition}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => toggleCondition(condition, event.target.checked)}
                          />
                          <span>{condition}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className="condition-local-note">Stored locally on this device. Clearing every item does not automatically change the recommendation.</p>
              </>
            ) : displayedConditions.length > 0 ? (
              <ol className="merge-contract-list merge-contract-list--static">
                {displayedConditions.map((condition) => <li key={condition}>{condition}</li>)}
              </ol>
            ) : (
              <p className="merge-contract-clear">No merge conditions detected.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "blast-radius" && (
            <div
              className="report-tab-panel"
              id="report-panel-blast-radius"
              role="tabpanel"
              aria-labelledby="report-tab-blast-radius"
            >
          <section className="section-block report-blast-radius" aria-labelledby="blast-radius-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">BLAST RADIUS</span>
                <h2 id="blast-radius-title">Affected surfaces</h2>
              </div>
              <span className="section-count">{affectedSurfaces.length} surfaces</span>
            </div>

            <div className="surface-summary-grid" aria-label="Blast radius summary">
              <article>
                <span>Affected surfaces</span>
                <strong>{affectedSurfaces.length}</strong>
              </article>
              <article>
                <span>Blocker surfaces</span>
                <strong>{blockerSurfaceCount}</strong>
              </article>
              <article>
                <span>Need confirmation</span>
                <strong>{confirmationSurfaceCount}</strong>
              </article>
              <article>
                <span>Primary review area</span>
                <p>{primaryAffectedSurface}</p>
              </article>
            </div>

            {affectedSurfaces.length > 0 ? (
              <div className="affected-surfaces-grid">
                {affectedSurfaces.map((surface) => (
                  <AffectedSurfaceCard surface={surface} key={`${surface.name}-${surface.status}-${surface.evidence}`} />
                ))}
              </div>
            ) : (
              <p className="section-empty section-empty--positive">No affected surface detected beyond normal human review and CI checks.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "findings" && (
            <div
              className="report-tab-panel"
              id="report-panel-findings"
              data-tour="report-findings"
              role="tabpanel"
              aria-labelledby="report-tab-findings"
            >
          <section className="section-block report-findings">
            <div className="section-heading"><div><span className="card-kicker">PRIORITY ITEMS</span><h2>Risk findings</h2></div><span className="section-count">{report.findings.length} findings</span></div>
            {report.findings.length > 0 ? (
              <div className="findings-workspace">
                <div className="findings-list" aria-label="Selectable findings">
                  {report.findings.map((finding, index) => {
                    const selected = selectedFindingIndex === index;

                    return (
                      <article
                        className={selected ? "finding finding--selectable finding--selected" : "finding finding--selectable"}
                        key={`${finding.title}-${index}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        aria-label={`Inspect finding: ${finding.title}`}
                        onClick={() => setSelectedFindingIndex(index)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedFindingIndex(index);
                          }
                        }}
                      >
                        <div className="finding-index">{String(index + 1).padStart(2, "0")}</div>
                        <div className="finding-content">
                          <div className="finding-title">
                            <SeverityTag severity={finding.severity} />
                            <h3>{finding.title}</h3>
                            {finding.provenance && <span className={`finding-provenance finding-provenance--${findingProvenanceLabel(finding.provenance).toLowerCase().replaceAll(" ", "-")}`}>{findingProvenanceLabel(finding.provenance)}</span>}
                          </div>
                          <p><strong>Evidence:</strong> {finding.evidence}</p>
                          <p><strong>Action:</strong> {finding.action}</p>
                          {finding.file && <code>{finding.file}</code>}
                          <span className="finding-inspect-hint">{selected ? "Selected" : "Inspect evidence"}</span>
                        </div>
                        <span className="finding-category">{finding.category}</span>
                      </article>
                    );
                  })}
                </div>

                <aside className="finding-detail-panel" aria-label="Finding evidence panel">
                  {selectedFinding ? (
                    <>
                      <div className="finding-detail-header">
                        <div>
                          <span className="card-kicker">EVIDENCE PANEL</span>
                          <h3>{selectedFinding.title}</h3>
                        </div>
                        <button type="button" onClick={() => setSelectedFindingIndex(null)}>Close</button>
                      </div>

                      <div className="finding-detail-tags">
                        <SeverityTag severity={selectedFinding.severity} />
                        <span>{selectedFinding.category}</span>
                        {selectedFinding.provenance && <span>{findingProvenanceLabel(selectedFinding.provenance)}</span>}
                      </div>

                      <section>
                        <h4>Why this matters</h4>
                        <p>{selectedFinding.evidence}</p>
                      </section>

                      <section>
                        <h4>Recommended reviewer action</h4>
                        <p>{selectedFinding.action}</p>
                      </section>

                      <div className="finding-detail-grid">
                        <section>
                          <h4>Affected files or areas</h4>
                          {selectedFindingFiles.length > 0 ? (
                            <ul>{selectedFindingFiles.map((file) => <li key={file}><code>{file}</code></li>)}</ul>
                          ) : (
                            <p>No specific file was attached to this finding.</p>
                          )}
                        </section>

                        <section>
                          <h4>Related missing test</h4>
                          <p>{selectedFindingMissingTest ?? "No directly related missing test was identified."}</p>
                        </section>

                        <section>
                          <h4>Related merge condition</h4>
                          <p>{selectedFindingCondition ?? "No directly related merge condition was identified."}</p>
                        </section>

                        <section>
                          <h4>Reviewer focus</h4>
                          {selectedFindingReviewerFocus ? (
                            <p><strong>{selectedFindingReviewerFocus.area}:</strong> {selectedFindingReviewerFocus.reason}</p>
                          ) : (
                            <p>No specialist reviewer focus was matched to this finding.</p>
                          )}
                        </section>
                      </div>
                    </>
                  ) : (
                    <div className="finding-detail-empty">
                      <span className="card-kicker">EVIDENCE PANEL</span>
                      <h3>Select a finding to inspect the evidence.</h3>
                      <p>Evidence, recommended action, affected files, related tests and merge conditions for the selected finding — without leaving this tab.</p>
                    </div>
                  )}
                </aside>
              </div>
            ) : <p className="section-empty">No risk findings detected.</p>}
          </section>
            </div>
          )}

          {activeTab === "tests" && (
            <div
              className="report-tab-panel"
              id="report-panel-tests"
              data-tour="report-tests"
              role="tabpanel"
              aria-labelledby="report-tab-tests"
            >
          <section className="section-block report-test-plan">
            <div className="section-heading"><div><span className="card-kicker">VERIFICATION</span><h2>Test plan</h2></div><span className="section-count">{report.missingTests.length} gaps · {report.suggestedTests.length} tests</span></div>
            <div className="test-plan-grid">
              <article className="test-plan-panel">
                <h3>Missing coverage</h3>
                {report.missingTests.length > 0 ? (
                  <ol className="numbered-list">
                    {report.missingTests.map((test, index) => <li key={test}><span>{String(index + 1).padStart(2, "0")}</span>{test}</li>)}
                  </ol>
                ) : <p className="missing-tests-empty">{cleanApprove || source === "ai" ? "No missing test gaps detected." : "No missing test gaps detected by local rules."}</p>}
              </article>
              <article className="test-plan-panel">
                <h3>Suggested tests</h3>
                {report.suggestedTests.length > 0 ? (
                  <div className="suggested-tests">
                    {report.suggestedTests.map((test) => <article className="suggested-test" key={test.title}>{test.priority && <span className={`test-priority test-priority--${test.priority.toLowerCase()}`}>{test.priority}</span>}<h3>{test.title}</h3>{test.description && <p>{test.description}</p>}</article>)}
                  </div>
                ) : <p className="section-empty">No additional tests suggested.</p>}
              </article>
              {cleanApprove ? (
                <article className="test-plan-panel test-plan-panel--checklist">
                  <h3>Reviewer checklist</h3>
                  <p className="section-empty">No reviewer checklist items required.</p>
                </article>
              ) : displayedReviewerChecklist.length > 0 && (
                <article className="test-plan-panel test-plan-panel--checklist">
                  <h3>Reviewer checklist</h3>
                  <ul className="checklist">
                    {displayedReviewerChecklist.map((item) => <li key={item.label}><span className={`check-icon check-icon--${item.status.toLowerCase()}`}>{item.status === "COMPLETE" ? "✓" : "!"}</span><span>{item.label}</span></li>)}
                  </ul>
                </article>
              )}
            </div>
          </section>
            </div>
          )}

          {activeTab === "operations" && (
            <div
              className="report-tab-panel"
              id="report-panel-operations"
              role="tabpanel"
              aria-labelledby="report-tab-operations"
            >
          <section className="section-block report-operational-readiness">
            <div className="section-heading"><div><span className="card-kicker">OPERATIONS</span><h2>Operational readiness</h2></div></div>
            {report.operationalReadiness ? (
              <div className="operational-panel">
                <div className="operational-overview">
                  <p>{report.operationalReadiness.summary}</p>
                  <span className={`review-status review-status--${report.operationalReadiness.status.toLowerCase()}`}>{report.operationalReadiness.status}</span>
                </div>
                <div className="operational-grid">
                  <OperationalArea title="Failure modes" items={deduplicateReportItems(report.operationalReadiness.failureModes)} emptyCopy="No explicit failure mode detected." />
                  <OperationalArea title="Detection signals" items={deduplicateReportItems(report.operationalReadiness.detectionSignals)} emptyCopy="No explicit detection signal required by detected rules." />
                  <OperationalArea title="Observability gaps" items={deduplicateReportItems(report.operationalReadiness.observabilityGaps)} emptyCopy="No observability gap detected." />
                  <OperationalArea title="Recovery or rollback" items={deduplicateReportItems(report.operationalReadiness.recoveryOrRollback)} emptyCopy="No recovery or rollback gap detected." />
                  <OperationalArea title="Customer or data impact" items={deduplicateReportItems(report.operationalReadiness.customerOrDataImpact)} emptyCopy="No customer or data impact detected." />
                  <OperationalArea title="Owner or reviewer focus" items={deduplicateReportItems(report.operationalReadiness.ownerOrReviewerFocus)} emptyCopy="No additional operational reviewer focus detected." />
                </div>
              </div>
            ) : (
              <div className="operational-legacy">
                <span className="operational-status-legacy">NOT ASSESSED</span>
                <p>Not assessed — regenerate this report</p>
              </div>
            )}
          </section>
            </div>
          )}

          {activeTab === "review-focus" && (
            <div
              className="report-tab-panel"
              id="report-panel-review-focus"
              role="tabpanel"
              aria-labelledby="report-tab-review-focus"
            >
          <section className="section-block report-reviewer-focus">
            <div className="section-heading">
              <div><span className="card-kicker">REVIEW ROUTING</span><h2>Reviewer focus</h2></div>
              {supportedReviewerFocus && <span className="section-count">{supportedReviewerFocus.length} areas</span>}
            </div>
            {supportedReviewerFocus ? (
              supportedReviewerFocus.length > 0 ? (
                <div className="reviewer-focus-list">
                  {supportedReviewerFocus.map((item) => (
                    <article className="reviewer-focus-item" key={item.area}>
                      <div>
                        <h3>{item.area}</h3>
                        <p>{item.reason}</p>
                      </div>
                      <span className={`reviewer-priority reviewer-priority--${item.priority.toLowerCase()}`}>{item.priority}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="reviewer-focus-empty">No specialist reviewer focus detected by current rules.</p>
              )
            ) : (
              <p className="reviewer-focus-legacy">Reviewer focus was not assessed — regenerate this report.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "changed-files" && (
            <div
              className="report-tab-panel"
              id="report-panel-changed-files"
              role="tabpanel"
              aria-labelledby="report-tab-changed-files"
            >
          <section className="section-block report-changed-files">
            <div className="section-heading"><div><span className="card-kicker">CHANGESET</span><h2>Changed files</h2></div><span className="section-count">{report.changedFiles.length} files</span></div>
            <div className="file-list">
              {report.changedFiles.map((file) => (
                <div className="file-row" key={file.path}>
                  <span className="file-icon" aria-hidden="true">▱</span><code>{file.path}</code>{(file.additions !== undefined || file.deletions !== undefined || file.risk) && <div className="file-stats">{file.additions !== undefined && <span className="additions">+{file.additions}</span>}{file.deletions !== undefined && <span className="deletions">−{file.deletions}</span>}{file.risk && <RiskBadge risk={file.risk} />}</div>}
                </div>
              ))}
            </div>
          </section>
            </div>
          )}

          {activeTab === "review-focus" && (
            <div className="report-tab-panel report-tab-panel--continued">
          <section className="section-block report-engineering-review">
            <div className="section-heading"><div><span className="card-kicker">ENGINEERING REVIEW</span><h2>Change quality</h2></div></div>
            <div className="review-grid">
              <ReviewCard title="Security review" review={report.reviews.security} findingTitles={findingTitles} calmSummary={cleanApprove ? "No security attention signal detected." : undefined} />
              <ReviewCard title="Reliability review" review={report.reviews.reliability} findingTitles={findingTitles} calmSummary={cleanApprove ? "No reliability attention signal detected." : undefined} />
              <ReviewCard title="Maintainability review" review={report.reviews.maintainability} findingTitles={findingTitles} calmSummary={cleanApprove ? "No maintainability attention signal detected." : undefined} />
            </div>
          </section>

          <section className="report-quality-compact" aria-label="Report quality">
            <div><span className="card-kicker">REPORT QUALITY</span><strong>{report.reportQuality?.status === "PASS" ? "Checks passed" : report.reportQuality?.status === "WARNING" ? "Review warnings" : "Not assessed"}</strong></div>
            {report.reportQuality ? (
              report.reportQuality.status === "PASS" ? <p>Internally consistent and safe to share.</p> : (
                <ul>{report.reportQuality.checks.filter((check) => check.status === "WARNING").map((check) => <li key={check.label}><strong>{check.label}:</strong> {check.detail}</li>)}</ul>
              )
            ) : <p>Regenerate this legacy report to run quality checks.</p>}
            <span className={`quality-status quality-status--${report.reportQuality?.status.toLowerCase() ?? "legacy"}`}>{report.reportQuality?.status ?? "NOT ASSESSED"}</span>
          </section>
            </div>
          )}

          {activeTab === "export" && (
            <div
              className="report-tab-panel"
              id="report-panel-export"
              data-tour="report-export"
              role="tabpanel"
              aria-labelledby="report-tab-export"
            >
          <section className="section-block report-export-actions" aria-labelledby="report-export-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">HANDOFF</span>
                <h2 id="report-export-title">Export and next steps</h2>
              </div>
              <SourceBadge source={source} />
            </div>

            <section className="decision-studio" aria-labelledby="decision-studio-title">
              <div className="decision-studio-header">
                <div>
                  <span className="card-kicker">FINAL DECISION</span>
                  <h3 id="decision-studio-title">Merge Decision Studio</h3>
                  <p>Record the local human decision before copying a GitHub or Slack handoff. This stays on this device.</p>
                </div>
                <span className={`review-status review-status--${studioReviewState.status.toLowerCase().replaceAll(" ", "-")}`}>{studioDecision}</span>
              </div>

              <div className="decision-studio-grid">
                <article>
                  <span>Recommendation</span>
                  <strong>{verdict.recommendation.replaceAll("_", " ")}</strong>
                </article>
                <article>
                  <span>Readiness score</span>
                  <strong>{verdict.riskScore}/100</strong>
                </article>
                <article>
                  <span>Risk level</span>
                  <strong>{verdict.riskLevel}</strong>
                </article>
                <article>
                  <span>Reviewer owner</span>
                  <strong>{displayedOwner}</strong>
                </article>
                <article>
                  <span>Open conditions</span>
                  <strong>{openConditionCount}</strong>
                </article>
                <article>
                  <span>Cleared conditions</span>
                  <strong>{clearedConditionCount}</strong>
                </article>
              </div>

              <div className="decision-studio-context">
                <article>
                  <span>Top blocker</span>
                  <p>{reportTopBlocker}</p>
                </article>
                <article>
                  <span>Next action</span>
                  <p>{reportNextDecisionAction}</p>
                </article>
              </div>

              {readinessDelta && readinessDelta.classification !== "initial" && (
                <p className="decision-studio-delta-note">
                  Latest automated re-analysis is for head {shortSha(readinessDelta.currentHeadSha)}. Local human decisions remain local and should be re-confirmed when the PR head changes.
                </p>
              )}

              <div className="decision-studio-controls">
                <fieldset>
                  <legend>Human decision</legend>
                  <div className="decision-studio-options">
                    {studioDecisionOptions.map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name="studio-decision"
                          value={option}
                          checked={studioDecision === option}
                          onChange={() => setStudioDecision(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {studioDecision === "Approved with accepted risk" && (
                  <label className="decision-studio-reason">
                    <span>Accepted risk reason</span>
                    <textarea
                      value={acceptedRiskReason}
                      rows={3}
                      maxLength={700}
                      required
                      onChange={(event) => setAcceptedRiskReason(event.target.value)}
                      placeholder="Explain what risk is being accepted and why it is acceptable for this merge."
                    />
                  </label>
                )}

                <div className="decision-studio-actions">
                  <button
                    type="button"
                    onClick={saveStudioDecision}
                    disabled={studioDecision === "Approved with accepted risk" && acceptedRiskReason.trim().length === 0}
                  >
                    {studioDecisionState === "copied" ? "Decision saved" : studioDecisionState === "failed" ? "Reason required" : "Save human decision"}
                  </button>
                  <p>GitHub and Slack previews below reflect: <strong>{studioDecisionText}</strong></p>
                </div>
              </div>
            </section>

            <div className="report-export-grid">
              <article>
                <h3>Copy conditions</h3>
                <p>Copy only the merge conditions as PR-ready Markdown.</p>
                <button
                  className={`copy-conditions-button copy-conditions-button--${conditionsCopyState}`}
                  type="button"
                  onClick={handleCopyConditions}
                  aria-live="polite"
                >
                  {copyConditionsLabels[conditionsCopyState]}
                </button>
              </article>
              <article>
                <h3>Copy summary</h3>
                <p>Copy a concise Markdown report for review handoff or validation.</p>
                <button
                  className={`copy-summary-button copy-summary-button--${copyState}`}
                  type="button"
                  onClick={handleCopySummary}
                  aria-live="polite"
                >
                  {copyLabels[copyState]}
                </button>
              </article>
              <article>
                <h3>Download Markdown</h3>
                <p>Save the current report as a local Markdown artifact.</p>
                <button
                  className={`download-markdown-button download-markdown-button--${downloadState}`}
                  type="button"
                  onClick={handleDownloadMarkdown}
                  aria-live="polite"
                >
                  {downloadLabels[downloadState]}
                </button>
              </article>
              <article>
                <h3>Navigate</h3>
                <p>Return to the local risk inbox or check another pull request.</p>
                <div className="report-export-links">
                  <a href="/workspace">Back to workspace</a>
                  <a href="/new">Check another pull request</a>
                  <a href="/review-policies">Review policies</a>
                  <button type="button" onClick={() => setActiveTab("evidence")}>Evidence ledger</button>
                  <button type="button" onClick={() => setActiveTab("blast-radius")}>Affected surfaces</button>
                  <a href="/github-action">GitHub Action prototype</a>
                  <a href="/slack-handoff">Slack handoff concept</a>
                  <a href="/docs/security-model.md">Security model</a>
                </div>
              </article>
            </div>

            <div className="merge-summary-builder" aria-label="GitHub comment builder">
              <div className="merge-summary-builder-header">
                <div>
                  <span className="card-kicker">PR COMMENT BUILDER</span>
                  <h3>Merge-readiness handoff</h3>
                  <p>Preview a concise Markdown comment you can paste into a GitHub PR. This is local/export only; Lintel does not post to GitHub.</p>
                </div>
                <button
                  className={`copy-summary-button copy-summary-button--${mergeSummaryCopyState}`}
                  type="button"
                  onClick={handleCopyMergeSummary}
                  aria-live="polite"
                >
                  {copyMergeSummaryLabels[mergeSummaryCopyState]}
                </button>
              </div>

              <div className="merge-summary-options">
                <span>{verdict.recommendation.replaceAll("_", " ")} · {verdict.riskLevel} risk · {reviewState.status}</span>
                {reviewState.note.trim().length > 0 ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={includeLocalNoteInMergeSummary}
                      onChange={(event) => setIncludeLocalNoteInMergeSummary(event.target.checked)}
                    />
                    <span>Include local reviewer note</span>
                  </label>
                ) : (
                  <span>Local reviewer note is empty.</span>
                )}
              </div>

              <pre className="merge-summary-preview" aria-label="Generated merge-readiness Markdown preview">{mergeSummaryMarkdown}</pre>
            </div>

            <div className="merge-summary-builder" aria-label="Slack handoff builder">
              <div className="merge-summary-builder-header">
                <div>
                  <span className="card-kicker">SLACK HANDOFF</span>
                  <h3>Team-channel handoff</h3>
                  <p>Preview the same final decision in a concise Slack-ready format. This is copy/export only.</p>
                </div>
                <button
                  className="copy-summary-button"
                  type="button"
                  onClick={handleQuickCopySlackHandoff}
                  aria-live="polite"
                >
                  Copy Slack handoff
                </button>
              </div>
              <pre className="merge-summary-preview" aria-label="Generated Slack handoff preview">{slackHandoffText}</pre>
            </div>
          </section>

          <section className="final-recommendation final-recommendation--compact">
            <div className="final-intro"><span className="card-kicker">CLOSING SUMMARY</span><h2>{recommendationHeadings[verdict.recommendation]}</h2></div>
            <p>{closingRecommendations[verdict.recommendation]}</p>
          </section>
            </div>
          )}
          </div>

          <aside className="report-decision-panel" aria-label="Merge-readiness decision panel">
            <div className="report-decision-panel-header">
              <span className="card-kicker">DECISION</span>
              <RecommendationBadge recommendation={verdict.recommendation} />
            </div>

            <div className="report-decision-panel-title">
              <h2>{pr.title}</h2>
              <p>{pr.repository}</p>
            </div>

            <div className="report-decision-panel-risk">
              <strong className={`risk-band risk-band--${verdict.riskLevel.toLowerCase()}`}>{verdict.riskLevel} RISK</strong>
              <span>Risk score: {verdict.riskScore}/100</span>
            </div>

            <dl className="report-decision-panel-snapshot" aria-label="Report at a glance">
              <div><dt>{displayedConditions.length}</dt><dd>conditions</dd></div>
              <div><dt>{report.missingTests.length}</dt><dd>missing tests</dd></div>
              <div className={reviewActionProgress.openBlockers > 0 ? "snapshot-stat--attention" : undefined}><dt>{reviewActionProgress.openBlockers}</dt><dd>open blockers</dd></div>
            </dl>

            <section className="report-decision-panel-next" aria-label="Next action">
              <span>Next action</span>
              <strong>
                {displayedConditions.length > 0
                  ? "Clear merge conditions"
                  : report.missingTests.length > 0
                    ? "Add focused tests"
                    : operationalStatus === "ATTENTION"
                      ? "Review operational readiness"
                      : report.findings.length > 0
                        ? "Complete focused review"
                        : "Complete normal review"}
              </strong>
            </section>

            <dl className="report-decision-panel-meta">
              <div><dt>Review mode</dt><dd>{reviewProfileLabel(pr.reviewProfile)}</dd></div>
              <div><dt>Policy</dt><dd>{activePolicy.label}</dd></div>
              <div><dt>Input</dt><dd>{decisionPanelInputLabel(pr.branch)}</dd></div>
              <div><dt>Mode</dt><dd>{sourceLabels[source]}</dd></div>
              <div><dt>Operations</dt><dd>{operationalStatus}</dd></div>
              <div><dt>Quality</dt><dd>{qualityStatus}</dd></div>
              <div><dt>Reviewer focus</dt><dd>{reviewerFocusSummary}</dd></div>
              <div><dt>Owner</dt><dd>{displayedOwner}</dd></div>
            </dl>

            <section className="report-policy-gates" aria-label="Active merge policy">
              <div>
                <span>Active policy</span>
                <strong>{activePolicyStatus.label}</strong>
              </div>
              <p>{activePolicy.label}: {policyGateSummary(activePolicy)}. {activePolicyStatus.detail}</p>
              <a href="/review-policies">View merge gates</a>
            </section>

            <section className="report-decision-panel-conditions" aria-label="Condition progress">
              <span>Conditions cleared</span>
              <strong>{conditionProgressLabel}</strong>
            </section>

            <section className="report-local-review-state" aria-label="Local review state">
              <div className="report-local-review-heading">
                <span>Local review state</span>
                <strong>{reviewState.status}</strong>
              </div>
              <label>
                <span>Status</span>
                <select value={reviewState.status} onChange={(event) => updateReviewStatus(event.target.value as ReviewStatus)}>
                  {REVIEW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label>
                <span>Owner</span>
                <select value={reviewState.owner} onChange={(event) => updateReviewOwner(event.target.value as ReviewerOwner)}>
                  {REVIEW_OWNER_OPTIONS.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                </select>
              </label>
              <p>Suggested owner cue: {suggestedOwners.length > 0 ? suggestedOwners.join(" / ") : "No specialist owner cue detected."}</p>
              <label>
                <span>Reviewer note</span>
                <textarea
                  value={reviewState.note}
                  maxLength={1000}
                  rows={4}
                  onChange={(event) => updateReviewNote(event.target.value)}
                  onBlur={handleReviewNoteBlur}
                  placeholder="Local/private note for this device. Do not paste raw diffs or secrets."
                />
              </label>
              <p>{reviewState.updatedAt ? `Review state saved locally ${new Date(reviewState.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.` : "Review state is stored locally on this device."}</p>
            </section>

            <div className="report-decision-panel-actions">
              <button
                type="button"
                onClick={openDecisionStudio}
              >
                Open Decision Studio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("export")}
              >
                Build PR comment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("actions")}
              >
                Review actions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
              >
                Decision history
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("evidence")}
              >
                Evidence ledger
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("blast-radius")}
              >
                Affected surfaces
              </button>
              <button
                className={`copy-conditions-button copy-conditions-button--${conditionsCopyState}`}
                type="button"
                onClick={handleCopyConditions}
                aria-live="polite"
              >
                {copyConditionsLabels[conditionsCopyState]}
              </button>
              <button
                className={`copy-summary-button copy-summary-button--${copyState}`}
                type="button"
                onClick={handleCopySummary}
                aria-live="polite"
              >
                {copyLabels[copyState]}
              </button>
              <button
                className={`download-markdown-button download-markdown-button--${downloadState}`}
                type="button"
                onClick={handleDownloadMarkdown}
                aria-live="polite"
              >
                {downloadLabels[downloadState]}
              </button>
              <a href="/workspace">Back to workspace</a>
              <a href="/new">Check another pull request</a>
              <a href="/docs/security-model.md">Security model</a>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
