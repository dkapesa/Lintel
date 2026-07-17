"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import AppShell, { SHELL_NAVIGATION_OPEN_EVENT } from "../app-shell";
import { GuidedTourStartButton } from "../guided-tour";
import styles from "./workspace.module.css";
import {
  conditionKey,
  readConditionProgress,
  reportConditions,
  workspaceConditionProgressSummary,
} from "../../lib/condition-progress";
import {
  appendDecisionHistoryEvent,
  clearDecisionHistory,
  removeDecisionHistory,
  reviewStatusChangeEvent,
} from "../../lib/decision-history";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import {
  deleteReportFromHistory,
  readReportHistory,
  type ReportHistoryEntry,
} from "../../lib/report-history";
import { conditionsToMarkdown } from "../../lib/report-markdown";
import { pruneUnsupportedReviewerFocus } from "../../lib/report-quality";
import { ownerDisplay, REVIEW_OWNER_OPTIONS, suggestedReviewerOwners, type ReviewerOwner } from "../../lib/reviewer-ownership";
import {
  defaultReviewState,
  readReviewStates,
  removeReviewState,
  REVIEW_STATUSES,
  reviewStateKey,
  type ReportReviewState,
  type ReviewStatus,
  writeReviewState,
} from "../../lib/review-state";
import {
  activeAssignableMembers,
  activeWorkspace,
  ensureWorkspaceStore,
  workspaceIdForReportEntry,
  workspaceLabel,
  workspaceScopedReviewKey,
  WORKSPACE_CHANGED_EVENT,
  type TeamWorkspace,
  type WorkspaceStore,
} from "../../lib/team-workspace";

const QUEUES = [
  ["inbox", "Inbox"],
  ["assigned", "Assigned locally"],
  ["awaiting-evidence", "Awaiting evidence"],
  ["ready", "Ready"],
  ["reviewed", "Reviewed"],
] as const;

const SELECTED_WORKSPACE_GROUP_STORAGE_KEY = "lintel.workspaceSelectedGroup.v1";
const COMPACT_INSPECTOR_QUERY = "(max-width: 1179px)";

type WorkspaceQueue = (typeof QUEUES)[number][0];
type CopyFeedback = { key: string; state: "copied" | "failed" } | null;

type WorkspaceGroup = {
  key: string;
  latest: ReportHistoryEntry;
  entries: ReportHistoryEntry[];
  reviewState: ReportReviewState;
};

type SelectOptions = { focusRow?: boolean; openInspector?: boolean };

function inputPreviewLabel(entry: ReportHistoryEntry) {
  if (entry.inputLabel === "GitHub PR import") return "GitHub import";
  if (entry.inputLabel === "Pasted diff") return "Manual";
  return entry.inputLabel;
}

function sourceLabel(source: ReportHistoryEntry["source"]) {
  return source === "ai" ? "Baseline + model-assisted" : "Baseline only";
}

function createdTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function recommendationLabel(value: ReportHistoryEntry["metadata"]["recommendation"]) {
  return value.replaceAll("_", " ");
}

function groupIdentity(entry: ReportHistoryEntry) {
  return reviewStateKey(entry.metadata.repository, entry.metadata.title, entry.inputLabel);
}

function groupHistory(entries: ReportHistoryEntry[], reviewStates: Record<string, ReportReviewState>): WorkspaceGroup[] {
  const grouped = new Map<string, ReportHistoryEntry[]>();

  for (const entry of entries) {
    const key = groupIdentity(entry);
    grouped.set(key, [...(grouped.get(key) ?? []), entry]);
  }

  return [...grouped.entries()].map(([key, groupEntries]) => {
    const sortedEntries = [...groupEntries].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const latest = sortedEntries[0];

    return {
      key,
      latest,
      entries: sortedEntries,
      reviewState: reviewStates[key] ?? defaultReviewState(latest.report),
    };
  }).sort((a, b) => Date.parse(b.latest.createdAt) - Date.parse(a.latest.createdAt));
}

function riskRank(value: ReportHistoryEntry["report"]["verdict"]["riskLevel"]) {
  if (value === "CRITICAL") return 4;
  if (value === "HIGH") return 3;
  if (value === "MEDIUM") return 2;
  return 1;
}

function elevatedRisk(value: ReportHistoryEntry["report"]["verdict"]["riskLevel"]) {
  return value === "HIGH" || value === "CRITICAL";
}

function sortByRiskThenRecency(groups: WorkspaceGroup[]) {
  return [...groups].sort((a, b) => {
    const riskDifference = riskRank(b.latest.report.verdict.riskLevel) - riskRank(a.latest.report.verdict.riskLevel);
    if (riskDifference !== 0) return riskDifference;
    return Date.parse(b.latest.createdAt) - Date.parse(a.latest.createdAt);
  });
}

function hasOperationalRisk(entry: ReportHistoryEntry) {
  const report = entry.report;
  return report.operationalReadiness?.status === "ATTENTION"
    || report.reviews.security.status === "ATTENTION"
    || report.reviews.reliability.status === "ATTENTION"
    || report.verdict.riskLevel === "HIGH"
    || report.verdict.riskLevel === "CRITICAL";
}

function groupAwaitingEvidence(group: WorkspaceGroup) {
  const report = group.latest.report;
  return group.reviewState.status === "Tests requested"
    || report.missingTests.length > 0
    || evidenceGapSummary(group.latest) !== null;
}

function groupHasBlockingRequirements(group: WorkspaceGroup, conditionProgressLabel?: string) {
  const contract = contractClauseSummary(group.latest);
  return (reportConditions(group.latest.report).length > 0 && conditionProgressLabel !== "All conditions cleared")
    || (contract?.blockingOpenCount ?? 0) > 0;
}

function groupNeedsReaffirmation(group: WorkspaceGroup) {
  const pack = group.latest.verificationPack;
  return pack?.humanDecision.stale === true
    || pack?.contractRecheck?.humanDecisionApplicability === "predates-current-head"
    || pack?.humanDecisionLedger?.applicability === "predates-current-head"
    || (pack?.evidence.records.items.some((record) => record.status === "stale" || record.stale) ?? false);
}

function groupMatchesQueue(group: WorkspaceGroup, queue: WorkspaceQueue) {
  const status = group.reviewState.status;

  if (queue === "inbox") return true;
  if (queue === "assigned") return group.reviewState.owner !== "Unassigned";
  if (queue === "awaiting-evidence") return groupAwaitingEvidence(group);
  if (queue === "ready") return status === "Ready to merge";
  if (queue === "reviewed") return status === "Reviewed" || status === "Archived";
  return true;
}

function groupNeedsAttention(group: WorkspaceGroup) {
  return ["Needs work", "Tests requested", "Review required", "Blocked"].includes(group.reviewState.status);
}

const ATTENTION_EMPTY_COPY: Record<WorkspaceQueue, string> = {
  inbox: "Nothing needs attention right now. New reports land in the inbox automatically when you check a pull request.",
  assigned: "No locally owned reports need attention in this workspace.",
  "awaiting-evidence": "No reports are waiting on missing test or verification evidence.",
  ready: "Ready reports are listed in the completed section below.",
  reviewed: "Reviewed reports are listed in the completed section below.",
};

const READY_EMPTY_COPY: Record<WorkspaceQueue, string> = {
  inbox: "No PRs are marked ready or reviewed yet. Clear a report's merge conditions, then set its review state to “Ready to merge”.",
  assigned: "No locally owned reports are ready or reviewed.",
  "awaiting-evidence": "Reports waiting on evidence remain in the attention section above.",
  ready: "Nothing is marked “Ready to merge” yet. Clear conditions and update the review state to move a PR here.",
  reviewed: "Nothing is marked “Reviewed” or “Archived” yet. Reviewed PRs are kept here for reference.",
};

const VIEW_EMPTY_COPY: Record<WorkspaceQueue, string> = {
  inbox: "No reports are stored in this local workspace.",
  assigned: "No reports have a local owner in this workspace. Inbox continues to show every stored report.",
  "awaiting-evidence": "No reports are waiting on test or verification evidence. Inbox continues to show every stored report.",
  ready: "No reports are locally marked Ready to merge. Inbox continues to show every stored report.",
  reviewed: "No reports are locally marked Reviewed or Archived. Inbox continues to show every stored report.",
};

function conciseBecause(entry: ReportHistoryEntry) {
  const summary = entry.report.verdict.summary.trim();
  return summary || topConditionOrRisk(entry);
}

function primaryRequirement(entry: ReportHistoryEntry, conditionProgressLabel: string) {
  const contract = contractClauseSummary(entry);
  if ((contract?.blockingOpenCount ?? 0) > 0) return `${contract?.blockingOpenCount} blocking`;
  if (reportConditions(entry.report).length > 0) return conditionProgressLabel;
  if (entry.report.missingTests.length > 0) return `${entry.report.missingTests.length} proof gaps`;
  return "No open requirement";
}

function topConditionOrRisk(entry: ReportHistoryEntry) {
  const report = entry.report;
  const conditions = reportConditions(report);

  if (conditions.length > 0) return conditions[0];
  if (report.findings.length > 0) return report.findings[0].title;
  return "No merge conditions detected.";
}

function nextAction(entry: ReportHistoryEntry) {
  const report = entry.report;

  if (report.conditionsBeforeMerge.length > 0) return "Clear merge conditions";
  if (report.missingTests.length > 0) return "Add focused tests";
  if (report.operationalReadiness?.status === "ATTENTION") return "Review operational readiness";
  if (report.reviews.security.status === "ATTENTION") return "Review security/privacy";
  if (report.findings.length > 0) return "Complete focused review";
  return "Complete normal review";
}

function testSignal(entry: ReportHistoryEntry) {
  const { report } = entry;
  if (report.missingTests.length > 0) return `${report.missingTests.length} missing tests`;
  if (report.suggestedTests.length > 0) return `${report.suggestedTests.length} suggested tests`;
  return "No missing test gaps";
}

function operationalSignal(entry: ReportHistoryEntry) {
  const { report } = entry;
  if (report.operationalReadiness?.status === "ATTENTION") return "Operational attention";
  if (report.reviews.security.status === "ATTENTION") return "Security attention";
  if (report.reviews.reliability.status === "ATTENTION") return "Reliability attention";
  return "No operational blocker";
}

/* Progressive disclosure — these read optional fields the entry may carry when
   a merge contract or verification pack was captured. They return null when the
   data is absent so the inspector renders nothing rather than an empty shell. */

function contractClauseSummary(entry: ReportHistoryEntry) {
  const clauses = entry.mergeContract?.clauses;
  if (!clauses || clauses.length === 0) return null;
  const open = clauses.filter((clause) => clause.status === "open");
  const blockingOpen = open.filter((clause) => clause.importance === "blocking");
  return { total: clauses.length, open, blockingOpenCount: blockingOpen.length };
}

function evidenceGapSummary(entry: ReportHistoryEntry) {
  const evidence = entry.verificationPack?.evidence;
  if (!evidence) return null;
  const gaps = evidence.records.items.filter(
    (record) => record.status === "missing" || record.status === "unverified" || record.status === "stale",
  );
  if (gaps.length === 0) return null;
  return { gaps, total: evidence.records.total, truncated: evidence.records.truncated };
}

function openAssumptionSummary(entry: ReportHistoryEntry) {
  const assumptions = entry.verificationPack?.assumptions;
  if (!assumptions) return null;
  const open = assumptions.records.items.filter((record) => record.status === "open");
  if (assumptions.openBlocking === 0 && assumptions.openAdvisory === 0 && open.length === 0) return null;
  return { open, openBlocking: assumptions.openBlocking, openAdvisory: assumptions.openAdvisory };
}

function reviewEvolutionSummary(entry: ReportHistoryEntry) {
  const evolution = entry.verificationPack?.reviewEvolution;
  if (!evolution || !evolution.available) return null;
  return evolution;
}

function humanDecisionSignal(entry: ReportHistoryEntry) {
  const ledger = entry.verificationPack?.humanDecisionLedger;
  if (!ledger) return null;
  return { applicability: ledger.applicability, divergence: ledger.divergence };
}

async function writeToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
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
  }
}

function isWorkspaceTextEntry(target: EventTarget | null) {
  return target instanceof HTMLElement
    && !!target.closest("input, textarea, select, button, a, [contenteditable='true']");
}

function WorkspaceSummaryStrip({
  needsAttention,
  awaitingEvidence,
  blockingRequirements,
  ready,
  needsReaffirmation,
}: {
  needsAttention: number;
  awaitingEvidence: number;
  blockingRequirements: number;
  ready: number;
  needsReaffirmation: number;
}) {
  const cells: Array<{ label: string; value: number; tone?: "attention" | "ready" | "stale" }> = [
    { label: "Needs attention", value: needsAttention, tone: "attention" },
    { label: "Awaiting evidence", value: awaitingEvidence, tone: "attention" },
    { label: "Blocking requirements", value: blockingRequirements, tone: "attention" },
    { label: "Ready", value: ready, tone: "ready" },
    { label: "Reaffirmation", value: needsReaffirmation, tone: "stale" },
  ];

  return (
    <div className="workspace-summary" aria-label="Workspace summary">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={cell.tone && cell.value > 0 ? `workspace-summary-cell workspace-summary-cell--${cell.tone}` : "workspace-summary-cell"}
        >
          <span className="workspace-summary-value">{cell.value}</span>
          <span className="workspace-summary-label">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}

function WorkspaceViewTabs({
  activeQueue,
  queueCounts,
  onSelectQueue,
}: {
  activeQueue: WorkspaceQueue;
  queueCounts: Record<WorkspaceQueue, number>;
  onSelectQueue: (queue: WorkspaceQueue) => void;
}) {
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % QUEUES.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + QUEUES.length) % QUEUES.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = QUEUES.length - 1;
    else return;

    event.preventDefault();
    const queue = QUEUES[nextIndex][0];
    onSelectQueue(queue);
    document.getElementById(`workspace-view-${queue}`)?.focus();
  }

  return (
    <div className="workspace-view-tabs" role="tablist" aria-label="Verification queue views">
      {QUEUES.map(([value, label], index) => {
        const active = activeQueue === value;
        return (
          <button
            key={value}
            id={`workspace-view-${value}`}
            className={`workspace-view-tab${active ? " workspace-view-tab--active" : ""}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="workspace-queue-panel"
            tabIndex={active ? 0 : -1}
            onClick={() => onSelectQueue(value)}
            onKeyDown={(event) => moveFocus(event, index)}
          >
            <span>{label}</span>
            <span className="workspace-view-count">{queueCounts[value]}</span>
          </button>
        );
      })}
    </div>
  );
}

function WorkspaceQueueRow({
  group,
  conditionProgressLabel,
  isSelected,
  setCardRef,
  onSelect,
}: {
  group: WorkspaceGroup;
  conditionProgressLabel: string;
  isSelected: boolean;
  setCardRef: (key: string, element: HTMLElement | null) => void;
  onSelect: (group: WorkspaceGroup, options?: SelectOptions) => void;
}) {
  const entry = group.latest;
  const report = entry.report;
  const recommendation = entry.metadata.recommendation.toLowerCase();
  const conditions = reportConditions(report);
  const primary = primaryRequirement(entry, conditionProgressLabel);
  const subordinate = conditions[0]
    ?? report.missingTests[0]
    ?? (hasOperationalRisk(entry) ? operationalSignal(entry) : null);
  const prNumber = report.pr.number > 0 ? `#${report.pr.number}` : null;
  const branch = report.pr.branch && !["sample", "pasted-diff", "github-pr"].includes(report.pr.branch)
    ? report.pr.branch
    : null;
  const stale = groupNeedsReaffirmation(group);
  const stateTone = stale
    ? "stale"
    : group.reviewState.status === "Ready to merge"
      ? "ready"
      : group.reviewState.status === "Reviewed" || group.reviewState.status === "Archived"
        ? "reviewed"
        : groupNeedsAttention(group) ? "attention" : "neutral";

  return (
    <article
      className={`workspace-row${isSelected ? " workspace-row--selected" : ""}`}
      role="option"
      tabIndex={0}
      ref={(element) => setCardRef(group.key, element)}
      data-workspace-group-key={group.key}
      aria-label={`${isSelected ? "Selected" : "Select"} ${entry.metadata.title}`}
      aria-selected={isSelected}
      onClick={() => onSelect(group, { openInspector: true })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelect(group, { openInspector: true });
        }
      }}
    >
      <div className="workspace-row-state-cell" data-label="State">
        <span className={`workspace-state-chip workspace-state-chip--${stateTone}`}>
          {stale ? "Reaffirm" : group.reviewState.status}
        </span>
      </div>

      <div className="workspace-row-identity" data-label="Pull request">
        <h3 className="workspace-row-title">{entry.metadata.title}</h3>
        <p className="workspace-row-repo">{entry.metadata.repository}</p>
        {(prNumber || branch || group.entries.length > 1) && (
          <p className="workspace-row-technical">
            {[prNumber, branch, group.entries.length > 1 ? `${group.entries.length} runs` : null].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <div className="workspace-row-recommendation" data-label="Recommendation">
        <strong className={`workspace-recommendation-text workspace-recommendation-text--${recommendation}`}>
          {recommendationLabel(entry.metadata.recommendation)}
        </strong>
        <p>{conciseBecause(entry)}</p>
      </div>

      <div className="workspace-row-requirements" data-label="Requirements">
        <strong>{primary}</strong>
        {subordinate && <p>{subordinate}</p>}
      </div>

      <div className="workspace-row-next-action" data-label="Next action">
        <span>{nextAction(entry)}</span>
      </div>

      <div className="workspace-row-owner" data-label="Owner">
        <span>{group.reviewState.owner === "Unassigned" ? "Unassigned" : group.reviewState.owner}</span>
        {group.reviewState.note.trim() && <small>Local note</small>}
      </div>

      <div className="workspace-row-updated" data-label="Updated">
        <time dateTime={entry.createdAt}>{createdTime(entry.createdAt)}</time>
        <span className={elevatedRisk(report.verdict.riskLevel) ? "workspace-risk-text workspace-risk-text--elevated" : "workspace-risk-text"}>
          {report.verdict.riskLevel} · {entry.metadata.riskScore}/100
        </span>
      </div>
    </article>
  );
}

function WorkspaceQueueGroup({
  title,
  description,
  groups,
  emptyCopy,
  conditionProgressByGroup,
  selectedGroupKey,
  setCardRef,
  onSelect,
}: {
  title: string;
  description: string;
  groups: WorkspaceGroup[];
  emptyCopy: string;
  conditionProgressByGroup: Record<string, string>;
  selectedGroupKey: string | null;
  setCardRef: (key: string, element: HTMLElement | null) => void;
  onSelect: (group: WorkspaceGroup, options?: SelectOptions) => void;
}) {
  const headingId = `${title.toLowerCase().replaceAll(" ", "-").replaceAll("/", "")}-title`;

  return (
    <section className="workspace-queue-group" aria-labelledby={headingId}>
      <div className="workspace-queue-group-heading">
        <h2 id={headingId}>{title}</h2>
        <span className="workspace-queue-group-count">{groups.length}</span>
      </div>
      <p className="workspace-queue-group-desc">{description}</p>

      {groups.length > 0 ? (
        <div className="workspace-queue-list" role="listbox" aria-label={`${title} reports`}>
          {groups.map((group) => (
            <WorkspaceQueueRow
              key={group.key}
              group={group}
              conditionProgressLabel={conditionProgressByGroup[group.key] ?? "No merge conditions"}
              isSelected={selectedGroupKey === group.key}
              setCardRef={setCardRef}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <p className="workspace-queue-empty">{emptyCopy}</p>
      )}
    </section>
  );
}

function InspectorBlock({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="workspace-inspector-block">
      <div className="workspace-inspector-block-head">
        <h3>{label}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function WorkspaceInspector({
  group,
  copyFeedback,
  conditionProgressLabel,
  workspace,
  open,
  containerRef,
  closeRef,
  onClose,
  onOpen,
  onCopyConditions,
  onDeleteGroup,
  onStatusChange,
  onOwnerChange,
}: {
  group: WorkspaceGroup | null;
  copyFeedback: CopyFeedback;
  conditionProgressLabel: string;
  workspace: TeamWorkspace | null;
  open: boolean;
  containerRef: (element: HTMLElement | null) => void;
  closeRef: (element: HTMLButtonElement | null) => void;
  onClose: () => void;
  onOpen: (entry: ReportHistoryEntry) => void;
  onCopyConditions: (group: WorkspaceGroup) => void;
  onDeleteGroup: (group: WorkspaceGroup) => void;
  onStatusChange: (group: WorkspaceGroup, status: ReviewStatus) => void;
  onOwnerChange: (group: WorkspaceGroup, owner: ReviewerOwner) => void;
}) {
  const closeButton = (
    <button
      className="workspace-inspector-close"
      type="button"
      ref={closeRef}
      onClick={onClose}
      aria-label="Close report detail"
    >
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );

  if (!group) {
    return (
      <aside
        className="workspace-inspector workspace-inspector--empty"
        data-open={open ? "true" : undefined}
        aria-label="Selected report detail"
        ref={containerRef}
      >
        <div className="workspace-inspector-topbar">
          <span className="workspace-inspector-kicker">Decision</span>
          {closeButton}
        </div>
        <div className="workspace-inspector-empty-body">
          <h2>No report selected</h2>
          <p>Select a report row to review its merge-readiness decision without leaving the risk inbox.</p>
        </div>
      </aside>
    );
  }

  const entry = group.latest;
  const report = entry.report;
  const recommendation = entry.metadata.recommendation.toLowerCase();
  const conditions = reportConditions(report);
  const focus = pruneUnsupportedReviewerFocus(report) ?? [];
  const qualityStatus = report.reportQuality?.status ?? "Not assessed";
  const operationalStatus = report.operationalReadiness?.status ?? "Not assessed";
  const feedback = copyFeedback?.key === group.key ? copyFeedback.state : null;
  const action = nextAction(entry);
  const suggestedOwners = suggestedReviewerOwners(report);
  const displayedOwner = ownerDisplay(group.reviewState.owner, suggestedOwners);
  const assignableMembers = workspace ? activeAssignableMembers(workspace) : [];
  const ownerOptions = [
    "Unassigned",
    ...assignableMembers.map((member) => member.displayName),
    ...REVIEW_OWNER_OPTIONS.filter((owner) => owner !== "Unassigned"),
  ].filter((owner, index, values) => values.indexOf(owner) === index);
  const historicalOwner = group.reviewState.owner !== "Unassigned" && !ownerOptions.includes(group.reviewState.owner);

  const clauseSummary = contractClauseSummary(entry);
  const evidenceGaps = evidenceGapSummary(entry);
  const assumptions = openAssumptionSummary(entry);
  const evolution = reviewEvolutionSummary(entry);
  const humanSignal = humanDecisionSignal(entry);
  const evidenceTotal = entry.verificationPack?.evidence.records.total;
  const visibleRequirements = [
    ...conditions,
    ...(clauseSummary?.open.map((clause) => clause.title) ?? []),
  ].filter((value, index, values) => values.indexOf(value) === index).slice(0, 4);
  const missingProof = evidenceGaps?.gaps.map((record) => record.title)
    ?? (report.missingTests.length > 0 ? report.missingTests : []);
  const trace = [
    { label: "Change", value: `${report.changedFiles.length} files`, state: "known" },
    { label: "Observation", value: `${report.findings.length} findings`, state: "known" },
    { label: "Evidence", value: evidenceTotal === undefined ? "Unknown" : `${evidenceTotal} records`, state: evidenceTotal === undefined ? "unknown" : evidenceGaps ? "attention" : "known" },
    { label: "Requirement", value: visibleRequirements.length > 0 ? `${visibleRequirements.length} open` : "None open", state: visibleRequirements.length > 0 ? "attention" : "known" },
    { label: "Human decision", value: group.reviewState.status, state: "decision" },
  ];

  return (
    <aside
      className="workspace-inspector"
      data-open={open ? "true" : undefined}
      aria-label="Selected report detail"
      data-tour="selected-pr"
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      ref={containerRef}
    >
      <div className="workspace-inspector-topbar">
        <span className="workspace-inspector-kicker">Selected case</span>
        <div className="workspace-inspector-topbar-end">
          {closeButton}
        </div>
      </div>

      <div className="workspace-inspector-scroll">
        <div className="workspace-inspector-headline">
          <h2>{entry.metadata.title}</h2>
          <p className="workspace-inspector-repo">{entry.metadata.repository}</p>
          <p className="workspace-inspector-identity">
            {[report.pr.number > 0 ? `#${report.pr.number}` : null, report.pr.branch, `${group.entries.length} run${group.entries.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}
          </p>
        </div>

        <ol className="workspace-verification-trace" aria-label="Verification trace">
          {trace.map((step) => (
            <li key={step.label} className={`workspace-trace-step workspace-trace-step--${step.state}`}>
              <span className="workspace-trace-mark" aria-hidden="true" />
              <span className="workspace-trace-label">{step.label}</span>
              <strong>{step.value}</strong>
            </li>
          ))}
        </ol>

        <InspectorBlock
          label="Recommendation"
          aside={<span className={`workspace-recommendation-text workspace-recommendation-text--${recommendation}`}>{recommendationLabel(entry.metadata.recommendation)}</span>}
        >
          <p>{conciseBecause(entry)}</p>
        </InspectorBlock>

        <InspectorBlock
          label="Open requirements"
          aside={<span className="workspace-inspector-tag">{conditionProgressLabel}</span>}
        >
          {visibleRequirements.length > 0 ? (
            <>
              <ol className="workspace-inspector-conditions">
                {visibleRequirements.map((condition) => <li key={condition}>{condition}</li>)}
              </ol>
              {conditions.length + (clauseSummary?.open.length ?? 0) > visibleRequirements.length && (
                <p className="workspace-inspector-more">Additional requirements are available in the Case File.</p>
              )}
            </>
          ) : (
            <p>No open requirement is captured in the latest local report.</p>
          )}
        </InspectorBlock>

        <InspectorBlock
          label="Missing proof"
          aside={missingProof.length > 0 ? <span className="workspace-inspector-tag">{missingProof.length} open</span> : undefined}
        >
          {missingProof.length > 0 ? (
            <ul className="workspace-inspector-evidence">
              {missingProof.slice(0, 3).map((proof, index) => <li key={`${proof}-${index}`}><span>{proof}</span></li>)}
            </ul>
          ) : (
            <p>No missing proof is captured in the latest local report.</p>
          )}
        </InspectorBlock>

        <InspectorBlock label="Required next action" aside={<span className="workspace-inspector-tag">{action}</span>}>
          <p>{topConditionOrRisk(entry)}</p>
        </InspectorBlock>

        <InspectorBlock label="Owner and local review state">
          <div className="workspace-inspector-controls">
            <label className="workspace-inspector-field">
              <span>Review state</span>
              <select value={group.reviewState.status} onChange={(event) => onStatusChange(group, event.target.value as ReviewStatus)}>
                {REVIEW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="workspace-inspector-field">
              <span>Owner</span>
              <select value={group.reviewState.owner} onChange={(event) => onOwnerChange(group, event.target.value as ReviewerOwner)}>
                {ownerOptions.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                {historicalOwner && <option value={group.reviewState.owner}>{group.reviewState.owner} (inactive or historical)</option>}
              </select>
            </label>
          </div>
          {workspace && (
            <p className="workspace-inspector-note">
              Owners are local responsibility metadata in {workspace.name}, not access control.
            </p>
          )}
          {group.reviewState.owner === "Unassigned" && <p className="workspace-inspector-note">{displayedOwner}</p>}
          {humanSignal && <p className="workspace-inspector-note">Decision {humanSignal.applicability} · {humanSignal.divergence}</p>}
          <p className="workspace-inspector-decision-note">{group.reviewState.note.trim() || "No local note saved for this report."}</p>
        </InspectorBlock>

        <details className="workspace-inspector-details">
          <summary>Progressive details</summary>
          <div className="workspace-inspector-details-body">
            <dl className="workspace-inspector-status-list">
              <div><dt>Tests</dt><dd>{testSignal(entry)}</dd></div>
              <div><dt>Operations</dt><dd>{operationalStatus}</dd></div>
              <div><dt>Quality</dt><dd>{qualityStatus}</dd></div>
              <div><dt>Risk</dt><dd>{report.verdict.riskLevel} · {entry.metadata.riskScore}/100</dd></div>
            </dl>

            {clauseSummary && clauseSummary.open.length > 0 && (
              <div className="workspace-inspector-detail-section">
                <h3>Merge-contract clauses</h3>
                <ul className="workspace-inspector-clauses">
                  {clauseSummary.open.slice(0, 4).map((clause) => (
                    <li key={clause.clauseId} className={clause.importance === "blocking" ? "workspace-inspector-clause--blocking" : undefined}>
                      <span className="workspace-inspector-clause-title">{clause.title}</span>
                      <span className="workspace-inspector-clause-meta">{clause.importance}{clause.ownerCue ? ` · ${clause.ownerCue}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assumptions && (
              <div className="workspace-inspector-detail-section">
                <h3>Open assumptions</h3>
                <p>{assumptions.openBlocking} blocking · {assumptions.openAdvisory} advisory</p>
                {assumptions.open.length > 0 && (
                  <ul className="workspace-inspector-assumptions">
                    {assumptions.open.slice(0, 3).map((record) => <li key={record.assumptionId}>{record.statement}</li>)}
                  </ul>
                )}
              </div>
            )}

            {evolution && (
              <div className="workspace-inspector-detail-section">
                <h3>Latest readiness delta</h3>
                <div className="workspace-inspector-delta">
                  {evolution.recommendationMovement && <span>{evolution.recommendationMovement}</span>}
                  {evolution.riskMovement && <span>{evolution.riskMovement}</span>}
                  {evolution.scoreMovement && <span>{evolution.scoreMovement}</span>}
                </div>
                <p>{evolution.clearedConditions} cleared · {evolution.openedConditions} opened · {evolution.stillOpenConditions} still open</p>
              </div>
            )}

            <div className="workspace-inspector-detail-section">
              <h3>Provenance and metadata</h3>
              <dl className="workspace-inspector-meta">
                <div><dt>Review mode</dt><dd>{entry.metadata.reviewProfile}</dd></div>
                <div><dt>Analysis</dt><dd>{sourceLabel(entry.source)}</dd></div>
                <div><dt>Input</dt><dd>{inputPreviewLabel(entry)}</dd></div>
                <div><dt>Runs</dt><dd>{group.entries.length}</dd></div>
                <div><dt>Latest</dt><dd><time dateTime={entry.createdAt}>{createdTime(entry.createdAt)}</time></dd></div>
                <div><dt>Local update</dt><dd>{group.reviewState.updatedAt ? createdTime(group.reviewState.updatedAt) : "Not saved yet"}</dd></div>
              </dl>
              {focus.length > 0 && (
                <div className="workspace-inspector-focus">
                  {focus.slice(0, 4).map((item) => <span key={`${item.area}-${item.priority}`}>{item.priority}: {item.area}</span>)}
                </div>
              )}
            </div>
          </div>
        </details>
      </div>

      <div className="workspace-inspector-actions">
        <button className="workspace-inspector-primary" type="button" onClick={() => onOpen(entry)}>Open Case File</button>
        <button type="button" onClick={() => onCopyConditions(group)}>
          {feedback === "copied" ? "Copied" : feedback === "failed" ? "Copy failed" : "Copy conditions"}
        </button>
        <button className="workspace-inspector-delete" type="button" onClick={() => onDeleteGroup(group)}>Delete reports</button>
      </div>
    </aside>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="workspace-skeleton" aria-busy="true" aria-label="Loading risk inbox">
      <div className="workspace-skeleton-summary">
        {[0, 1, 2, 3, 4].map((cell) => <span key={cell} className="workspace-skeleton-cell" />)}
      </div>
      <div className="workspace-skeleton-toolbar" />
      <div className="workspace-skeleton-rows">
        {[0, 1, 2, 3].map((row) => <span key={row} className="workspace-skeleton-row" />)}
      </div>
    </div>
  );
}

export default function ReportsWorkspacePage() {
  const router = useRouter();
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [reviewStates, setReviewStates] = useState<Record<string, ReportReviewState>>({});
  const [workspaceStore, setWorkspaceStore] = useState<WorkspaceStore | null>(null);
  const [conditionProgressByGroup, setConditionProgressByGroup] = useState<Record<string, string>>({});
  const [activeQueue, setActiveQueue] = useState<WorkspaceQueue>("inbox");
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    const closeForShellNavigation = () => setInspectorOpen(false);
    window.addEventListener(SHELL_NAVIGATION_OPEN_EVENT, closeForShellNavigation);
    return () => window.removeEventListener(SHELL_NAVIGATION_OPEN_EVENT, closeForShellNavigation);
  }, []);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const compactMatchRef = useRef<MediaQueryList | null>(null);
  const inspectorNodeRef = useRef<HTMLElement | null>(null);
  const inspectorCloseNodeRef = useRef<HTMLButtonElement | null>(null);
  const selectedGroupKeyRef = useRef<string | null>(null);
  selectedGroupKeyRef.current = selectedGroupKey;

  const currentWorkspace = workspaceStore ? activeWorkspace(workspaceStore) : null;
  const activeWorkspaceId = currentWorkspace?.workspaceId ?? workspaceStore?.activeWorkspaceId ?? null;

  function selectedStorageKey(workspaceId: string | null = activeWorkspaceId) {
    return workspaceId ? `${SELECTED_WORKSPACE_GROUP_STORAGE_KEY}.${workspaceId}` : SELECTED_WORKSPACE_GROUP_STORAGE_KEY;
  }

  function workspaceReviewStates(storage: Storage, entries: ReportHistoryEntry[], workspaceId: string) {
    const rawStates = readReviewStates(storage);
    const states: Record<string, ReportReviewState> = {};
    for (const entry of entries) {
      const key = groupIdentity(entry);
      const scopedKey = workspaceScopedReviewKey(workspaceId, key);
      states[key] = rawStates[scopedKey] ?? rawStates[key] ?? defaultReviewState(entry.report);
    }
    return states;
  }

  function loadWorkspaceData() {
    const allHistory = readReportHistory(window.localStorage);
    const store = ensureWorkspaceStore(window.localStorage, allHistory);
    const workspaceId = store.activeWorkspaceId;
    const scopedHistory = allHistory.filter((entry) => workspaceIdForReportEntry(entry, store) === workspaceId);
    setWorkspaceStore(store);
    setHistory(scopedHistory);
    setReviewStates(workspaceReviewStates(window.localStorage, scopedHistory, workspaceId));
    return { store, scopedHistory };
  }

  useEffect(() => {
    try {
      loadWorkspaceData();
    } catch {
      setHistory([]);
      setReviewStates({});
      setError("Local report history is unavailable in this browser.");
    } finally {
      setHydrated(true);
    }

    const onWorkspaceChange = () => {
      try {
        loadWorkspaceData();
      } catch {
        setError("Workspace data could not be loaded from this browser.");
      }
    };
    window.addEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChange);
    return () => window.removeEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
  }, []);

  /* The inspector is a persistent pane on desktop and a slide-over drawer at
     compact widths; the media query decides which and closes the drawer when
     the viewport grows back to a two-pane width. */
  useEffect(() => {
    const query = window.matchMedia(COMPACT_INSPECTOR_QUERY);
    compactMatchRef.current = query;
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setInspectorOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const groups = useMemo(() => groupHistory(history, reviewStates), [history, reviewStates]);
  const filteredGroups = useMemo(
    () => groups.filter((group) => groupMatchesQueue(group, activeQueue)),
    [activeQueue, groups],
  );
  const needsAttention = useMemo(() => sortByRiskThenRecency(filteredGroups.filter((group) => (
    groupNeedsAttention(group)
  ))), [filteredGroups]);
  const ready = useMemo(() => filteredGroups
    .filter((group) => !groupNeedsAttention(group))
    .sort((a, b) => Date.parse(b.latest.createdAt) - Date.parse(a.latest.createdAt)), [filteredGroups]);
  const visibleGroups = useMemo(() => [...needsAttention, ...ready], [needsAttention, ready]);
  const selectedGroup = visibleGroups.find((group) => group.key === selectedGroupKey) ?? null;
  const needsAttentionCount = groups.filter(groupNeedsAttention).length;
  const awaitingEvidenceCount = groups.filter(groupAwaitingEvidence).length;
  const blockingRequirementsCount = groups.filter((group) => (
    groupHasBlockingRequirements(group, conditionProgressByGroup[group.key])
  )).length;
  const reaffirmationCount = groups.filter(groupNeedsReaffirmation).length;
  const readyCount = groups.filter((group) => groupMatchesQueue(group, "ready")).length;
  const queueCounts: Record<WorkspaceQueue, number> = {
    inbox: groups.length,
    assigned: groups.filter((group) => groupMatchesQueue(group, "assigned")).length,
    "awaiting-evidence": awaitingEvidenceCount,
    ready: readyCount,
    reviewed: groups.filter((group) => groupMatchesQueue(group, "reviewed")).length,
  };

  useEffect(() => {
    try {
      const nextProgress: Record<string, string> = {};

      for (const group of groups) {
        const conditions = reportConditions(group.latest.report);
        const cleared = readConditionProgress(window.localStorage, group.latest.report, conditions);
        const clearedCount = conditions.filter((condition) => cleared.has(conditionKey(condition))).length;
        nextProgress[group.key] = workspaceConditionProgressSummary(clearedCount, conditions.length);
      }

      setConditionProgressByGroup(nextProgress);
    } catch {
      setConditionProgressByGroup({});
    }
  }, [groups]);

  useEffect(() => {
    if (visibleGroups.length === 0) {
      setSelectedGroupKey(null);
      return;
    }

    setSelectedGroupKey((current) => {
      if (current && visibleGroups.some((group) => group.key === current)) return current;

      try {
        const stored = window.localStorage.getItem(selectedStorageKey());
        if (stored && visibleGroups.some((group) => group.key === stored)) return stored;
      } catch {
        // Local selection persistence is optional.
      }

      return visibleGroups[0].key;
    });
  }, [visibleGroups]);

  /* Keep the compact drawer from lingering once its report is gone. */
  useEffect(() => {
    if (inspectorOpen && !selectedGroupKey) setInspectorOpen(false);
  }, [inspectorOpen, selectedGroupKey]);

  /* Focus management for the compact inspector drawer: focus the close control
     on open, trap Tab within the drawer, close on Escape, lock body scroll, and
     return focus to the originating row on close. */
  useEffect(() => {
    if (!inspectorOpen) return;
    const node = inspectorNodeRef.current;
    if (!node) return;

    (inspectorCloseNodeRef.current ?? node).focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setInspectorOpen(false);
        const key = selectedGroupKeyRef.current;
        if (key) focusWorkspaceCard(key);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = node.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), select, textarea, input, summary, [tabindex]:not([tabindex='-1'])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectorOpen]);

  function setCardRef(key: string, element: HTMLElement | null) {
    cardRefs.current[key] = element;
  }

  function focusWorkspaceCard(key: string) {
    window.requestAnimationFrame(() => {
      const card = cardRefs.current[key];
      if (!card) return;
      card.focus({ preventScroll: true });
      card.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function selectWorkspaceGroup(group: WorkspaceGroup, options: SelectOptions = {}) {
    const { focusRow = false, openInspector = false } = options;
    setSelectedGroupKey(group.key);

    try {
      window.localStorage.setItem(selectedStorageKey(), group.key);
    } catch {
      // Local selection persistence is optional.
    }

    if (openInspector && compactMatchRef.current?.matches) setInspectorOpen(true);
    if (focusRow) focusWorkspaceCard(group.key);
  }

  function closeInspector() {
    setInspectorOpen(false);
    const key = selectedGroupKeyRef.current;
    if (key) focusWorkspaceCard(key);
  }

  function handleWorkspaceInboxKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isWorkspaceTextEntry(event.target)) return;
    if (visibleGroups.length === 0) return;

    const currentIndex = Math.max(visibleGroups.findIndex((group) => group.key === selectedGroupKey), 0);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), visibleGroups.length - 1);
      selectWorkspaceGroup(visibleGroups[nextIndex], { focusRow: true });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      openReport(visibleGroups[currentIndex].latest);
      return;
    }

    if (event.key === "Escape") {
      if (copyFeedback) setCopyFeedback(null);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }
  }

  function openReport(entry: ReportHistoryEntry) {
    try {
      window.sessionStorage.setItem(
        GENERATED_REPORT_STORAGE_KEY,
        JSON.stringify({ report: entry.report, source: entry.source }),
      );
      router.push("/report");
    } catch {
      setError("This saved report could not be opened.");
    }
  }

  async function copyConditions(group: WorkspaceGroup) {
    const copied = await writeToClipboard(conditionsToMarkdown(group.latest.report));
    setCopyFeedback({ key: group.key, state: copied ? "copied" : "failed" });

    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    copyResetTimer.current = setTimeout(() => setCopyFeedback(null), 2_000);
  }

  function updateLocalStatus(group: WorkspaceGroup, status: ReviewStatus) {
    try {
      const stateKey = workspaceScopedReviewKey(activeWorkspaceId ?? "local", group.key);
      const nextState = writeReviewState(window.localStorage, stateKey, {
        ...group.reviewState,
        status,
      });
      setReviewStates((current) => ({ ...current, [group.key]: nextState }));

      if (group.reviewState.status !== nextState.status) {
        try {
          appendDecisionHistoryEvent(
            window.localStorage,
            group.key,
            reviewStatusChangeEvent(group.reviewState.status, nextState.status),
          );
        } catch {
          // Decision history is local-only and should not block status changes.
        }
      }

      setError(null);
    } catch {
      setError("Local review state could not be saved in this browser.");
    }
  }

  function updateLocalOwner(group: WorkspaceGroup, owner: ReviewerOwner) {
    try {
      const stateKey = workspaceScopedReviewKey(activeWorkspaceId ?? "local", group.key);
      const nextState = writeReviewState(window.localStorage, stateKey, {
        ...group.reviewState,
        owner,
      });
      setReviewStates((current) => ({ ...current, [group.key]: nextState }));

      if (group.reviewState.owner !== nextState.owner) {
        try {
          appendDecisionHistoryEvent(window.localStorage, group.key, {
            type: "ownership-changed",
            title: "Local owner changed",
            detail: `Local ownership changed from ${group.reviewState.owner} to ${nextState.owner}.`,
            previousState: group.reviewState.owner,
            nextState: nextState.owner,
          });
        } catch {
          // Decision history is local-only and should not block owner changes.
        }
      }

      setError(null);
    } catch {
      setError("Local ownership could not be saved in this browser.");
    }
  }

  function deleteGroup(group: WorkspaceGroup) {
    try {
      for (const entry of group.entries) {
        deleteReportFromHistory(window.localStorage, entry.createdAt);
      }

      loadWorkspaceData();
      setReviewStates((current) => {
        const nextStates = { ...current };
        delete nextStates[group.key];
        return nextStates;
      });
      removeReviewState(window.localStorage, workspaceScopedReviewKey(activeWorkspaceId ?? "local", group.key));
      removeReviewState(window.localStorage, group.key);
      removeDecisionHistory(window.localStorage, group.key);
      try {
        if (window.localStorage.getItem(selectedStorageKey()) === group.key) {
          window.localStorage.removeItem(selectedStorageKey());
        }
      } catch {
        // Local selection persistence is optional.
      }
      setInspectorOpen(false);
      setError(null);
    } catch {
      setError("This report group could not be deleted.");
    }
  }

  function clearHistory() {
    try {
      for (const group of groups) {
        for (const entry of group.entries) {
          deleteReportFromHistory(window.localStorage, entry.createdAt);
        }
      }
      loadWorkspaceData();
      setReviewStates({});
      for (const group of groups) {
        removeReviewState(window.localStorage, workspaceScopedReviewKey(activeWorkspaceId ?? "local", group.key));
        removeReviewState(window.localStorage, group.key);
        removeDecisionHistory(window.localStorage, group.key);
      }
      window.localStorage.removeItem(selectedStorageKey());
      setInspectorOpen(false);
      setError(null);
    } catch {
      setError("Report history could not be cleared.");
    }
  }

  const hasHistory = history.length > 0;
  const shellContext = hasHistory
    ? `${currentWorkspace?.name ?? "Local workspace"} · ${groups.length} tracked · ${needsAttentionCount} to act`
    : currentWorkspace ? `${currentWorkspace.name} · ${workspaceLabel(currentWorkspace)}` : undefined;
  const shellActions = (
    <>
      <GuidedTourStartButton className={styles.shellAction} />
      {hasHistory && (
        <button className={styles.shellAction} type="button" onClick={clearHistory}>Clear history</button>
      )}
    </>
  );

  return (
    <AppShell context={shellContext} actions={shellActions}>
      <div className={styles.root} data-tour="risk-inbox">
        <header className="workspace-context">
          <div>
            <span className="workspace-context-kicker">Local verification queue</span>
            <h1>Risk inbox</h1>
            <p>What requires engineering attention now, based on reports stored in this browser.</p>
          </div>
          <p className="workspace-context-scope">
            {currentWorkspace ? `${currentWorkspace.name} · ${workspaceLabel(currentWorkspace)}` : "Local merge-readiness triage"} ·{" "}
            <Link href="/docs/security-model.md">Security boundary</Link>
          </p>
        </header>

        {error && <p className="workspace-error" role="alert">{error}</p>}

        {!hydrated ? (
          <WorkspaceSkeleton />
        ) : hasHistory ? (
          <section
            className="workspace-inbox"
            aria-label="Local merge-readiness inbox"
            tabIndex={0}
            onKeyDown={handleWorkspaceInboxKeyDown}
          >
            <div className="workspace-inbox-controls" aria-hidden={inspectorOpen ? true : undefined} inert={inspectorOpen ? true : undefined}>
              <WorkspaceSummaryStrip
                needsAttention={needsAttentionCount}
                awaitingEvidence={awaitingEvidenceCount}
                blockingRequirements={blockingRequirementsCount}
                ready={readyCount}
                needsReaffirmation={reaffirmationCount}
              />

              <WorkspaceViewTabs activeQueue={activeQueue} queueCounts={queueCounts} onSelectQueue={setActiveQueue} />
            </div>

            <div className="workspace-workbench">
              <div
                className="workspace-queue"
                id="workspace-queue-panel"
                role="tabpanel"
                aria-labelledby={`workspace-view-${activeQueue}`}
                aria-hidden={inspectorOpen ? true : undefined}
                inert={inspectorOpen ? true : undefined}
              >
                <div className="workspace-queue-surface">
                  <div className="workspace-queue-columns" aria-hidden="true">
                    <span>State</span><span>PR identity</span><span>Recommendation</span><span>Requirements</span><span>Owner</span><span>Updated</span>
                  </div>

                  {visibleGroups.length === 0 ? (
                    <p className="workspace-queue-empty workspace-queue-empty--view">{VIEW_EMPTY_COPY[activeQueue]}</p>
                  ) : (
                    <>
                      <WorkspaceQueueGroup
                        title="Needs attention"
                        description="Tests, focused review, unresolved requirements or blocking risk."
                        groups={needsAttention}
                        emptyCopy={ATTENTION_EMPTY_COPY[activeQueue]}
                        conditionProgressByGroup={conditionProgressByGroup}
                        selectedGroupKey={selectedGroupKey}
                        setCardRef={setCardRef}
                        onSelect={selectWorkspaceGroup}
                      />

                      <WorkspaceQueueGroup
                        title="Ready / reviewed"
                        description="Locally ready, reviewed or archived — plus latest runs without an attention state."
                        groups={ready}
                        emptyCopy={READY_EMPTY_COPY[activeQueue]}
                        conditionProgressByGroup={conditionProgressByGroup}
                        selectedGroupKey={selectedGroupKey}
                        setCardRef={setCardRef}
                        onSelect={selectWorkspaceGroup}
                      />
                    </>
                  )}
                </div>
              </div>

              <WorkspaceInspector
                group={selectedGroup}
                copyFeedback={copyFeedback}
                conditionProgressLabel={selectedGroup ? conditionProgressByGroup[selectedGroup.key] ?? "No merge conditions" : "No merge conditions"}
                workspace={currentWorkspace}
                open={inspectorOpen}
                containerRef={(element) => { inspectorNodeRef.current = element; }}
                closeRef={(element) => { inspectorCloseNodeRef.current = element; }}
                onClose={closeInspector}
                onOpen={openReport}
                onCopyConditions={copyConditions}
                onDeleteGroup={deleteGroup}
                onStatusChange={updateLocalStatus}
                onOwnerChange={updateLocalOwner}
              />
            </div>

            {inspectorOpen && (
              <button
                className="workspace-inspector-backdrop"
                type="button"
                aria-label="Close report detail"
                tabIndex={-1}
                onClick={closeInspector}
              />
            )}
          </section>
        ) : (
          <section className="workspace-empty">
            <h2>No tracked pull requests yet</h2>
            <p>Check a PR, review the merge-readiness decision, then return here to track what is blocked, waiting on tests, or ready to merge.</p>
            <div className="workspace-empty-actions">
              <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
              <Link className="workspace-secondary-action" href="/report?demo=1">Load demo report</Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
