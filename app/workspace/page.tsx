"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../app-shell";
import { GuidedTourStartButton } from "../guided-tour";
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
  ["needs-tests", "Needs tests"],
  ["needs-review", "Needs review"],
  ["operational-risk", "Operational risk"],
  ["ready", "Ready to merge"],
  ["reviewed", "Reviewed"],
] as const;

const SELECTED_WORKSPACE_GROUP_STORAGE_KEY = "lintel.workspaceSelectedGroup.v1";
const COMPACT_INSPECTOR_QUERY = "(max-width: 900px)";

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

function groupMatchesQueue(group: WorkspaceGroup, queue: WorkspaceQueue) {
  const status = group.reviewState.status;

  if (queue === "inbox") return true;
  if (queue === "needs-tests") return status === "Tests requested";
  if (queue === "needs-review") return status === "Review required" || status === "Blocked";
  if (queue === "operational-risk") return hasOperationalRisk(group.latest);
  if (queue === "ready") return status === "Ready to merge";
  if (queue === "reviewed") return status === "Reviewed" || status === "Archived";
  return true;
}

function groupNeedsAttention(group: WorkspaceGroup) {
  return ["Needs work", "Tests requested", "Review required", "Blocked"].includes(group.reviewState.status);
}

const ATTENTION_EMPTY_COPY: Record<WorkspaceQueue, string> = {
  inbox: "Nothing needs attention right now. New reports land in the inbox automatically when you check a pull request.",
  "needs-tests": "No PRs are waiting on tests. Set a report's review state to “Tests requested” to queue it here.",
  "needs-review": "No PRs are waiting on focused review. Reports marked “Review required” or “Blocked” queue here.",
  "operational-risk": "No PRs carry operational, security or reliability attention right now.",
  ready: "Ready PRs never need attention — they are listed under Ready / reviewed below.",
  reviewed: "Reviewed PRs never need attention — they are listed under Ready / reviewed below.",
};

const READY_EMPTY_COPY: Record<WorkspaceQueue, string> = {
  inbox: "No PRs are marked ready or reviewed yet. Clear a report's merge conditions, then set its review state to “Ready to merge”.",
  "needs-tests": "PRs stay in the list above while they wait on test evidence.",
  "needs-review": "PRs stay in the list above until their focused review completes.",
  "operational-risk": "PRs stay in the list above until their operational signals clear.",
  ready: "Nothing is marked “Ready to merge” yet. Clear conditions and update the review state to move a PR here.",
  reviewed: "Nothing is marked “Reviewed” or “Archived” yet. Reviewed PRs are kept here for reference.",
};

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
  tracked,
  needsAttention,
  needsTests,
  highRisk,
  ready,
}: {
  tracked: number;
  needsAttention: number;
  needsTests: number;
  highRisk: number;
  ready: number;
}) {
  const cells: Array<{ label: string; value: number; tone?: "attention" | "tests" | "risk" | "ready" }> = [
    { label: "Tracked", value: tracked },
    { label: "Needs attention", value: needsAttention, tone: "attention" },
    { label: "Needs tests", value: needsTests, tone: "tests" },
    { label: "High risk", value: highRisk, tone: "risk" },
    { label: "Ready", value: ready, tone: "ready" },
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

function WorkspaceToolbar({
  activeQueue,
  queueCounts,
  onSelectQueue,
}: {
  activeQueue: WorkspaceQueue;
  queueCounts: Record<WorkspaceQueue, number>;
  onSelectQueue: (queue: WorkspaceQueue) => void;
}) {
  return (
    <div className="workspace-toolbar" role="tablist" aria-label="Review queues">
      {QUEUES.map(([value, label]) => {
        const active = activeQueue === value;
        return (
          <button
            key={value}
            className={`workspace-segment workspace-segment--${value}${active ? " workspace-segment--active" : ""}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelectQueue(value)}
          >
            <span className="workspace-segment-label">{label}</span>
            <span className="workspace-segment-count">{queueCounts[value]}</span>
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
  const missingTests = report.missingTests.length > 0;
  const operational = hasOperationalRisk(entry);

  return (
    <article
      className={`workspace-row workspace-row--${recommendation}${isSelected ? " workspace-row--selected" : ""}`}
      role="button"
      tabIndex={0}
      ref={(element) => setCardRef(group.key, element)}
      data-workspace-group-key={group.key}
      aria-label={`Preview ${entry.metadata.title}`}
      aria-selected={isSelected}
      aria-current={isSelected ? "true" : undefined}
      onClick={() => onSelect(group, { openInspector: true })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(group, { openInspector: true });
        }
      }}
    >
      <div className="workspace-row-main">
        <h3 className="workspace-row-title">{entry.metadata.title}</h3>
        <div className="workspace-row-sub">
          <span className="workspace-row-repo">{entry.metadata.repository}</span>
          {group.entries.length > 1 && <span className="workspace-row-runs">{group.entries.length} runs</span>}
          <span className="workspace-row-state">{group.reviewState.status}</span>
        </div>
        <p className="workspace-row-blocker">{topConditionOrRisk(entry)}</p>
      </div>

      <div className="workspace-row-signals" aria-hidden={false}>
        <span className="workspace-row-signal">{conditionProgressLabel}</span>
        {missingTests && <span className="workspace-row-signal workspace-row-signal--attention">{testSignal(entry)}</span>}
        {operational && <span className="workspace-row-signal workspace-row-signal--attention">{operationalSignal(entry)}</span>}
        {group.reviewState.note.trim().length > 0 && <span className="workspace-row-signal">Local note</span>}
      </div>

      <div className="workspace-row-decision">
        <span className={`workspace-recommendation workspace-recommendation--${recommendation}`}>
          {recommendationLabel(entry.metadata.recommendation)}
        </span>
        <span className={`workspace-row-risk${elevatedRisk(report.verdict.riskLevel) ? " workspace-row-risk--elevated" : ""}`}>
          {report.verdict.riskLevel} · {entry.metadata.riskScore}/100
        </span>
        <time className="workspace-row-time" dateTime={entry.createdAt}>{createdTime(entry.createdAt)}</time>
        {isSelected && <span className="workspace-row-current">Selected</span>}
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
        <div className="workspace-queue-list">
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
  const riskLevel = report.verdict.riskLevel.toLowerCase();
  const conditions = reportConditions(report);
  const visibleConditions = conditions.slice(0, 4);
  const focus = pruneUnsupportedReviewerFocus(report) ?? [];
  const qualityStatus = report.reportQuality?.status ?? "Not assessed";
  const operationalStatus = report.operationalReadiness?.status ?? "Not assessed";
  const topRisk = report.findings[0]?.title ?? topConditionOrRisk(entry);
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
        <span className="workspace-inspector-kicker">Decision</span>
        <div className="workspace-inspector-topbar-end">
          <span className={`workspace-recommendation workspace-recommendation--${recommendation}`}>
            {recommendationLabel(entry.metadata.recommendation)}
          </span>
          {closeButton}
        </div>
      </div>

      <div className="workspace-inspector-scroll">
        <div className="workspace-inspector-headline">
          <h2>{entry.metadata.title}</h2>
          <p className="workspace-inspector-repo">{entry.metadata.repository}</p>
        </div>

        <div className={`workspace-inspector-risk workspace-inspector-risk--${riskLevel}`}>
          <strong>{report.verdict.riskLevel} risk</strong>
          <span>Risk score: {entry.metadata.riskScore}/100</span>
        </div>

        <InspectorBlock label="Next action" aside={<span className="workspace-inspector-tag">{action}</span>}>
          <p>{topConditionOrRisk(entry)}</p>
        </InspectorBlock>

        <InspectorBlock label="Why it is not ready">
          <p>{topRisk}</p>
        </InspectorBlock>

        <InspectorBlock
          label="Conditions before merge"
          aside={<span className="workspace-inspector-tag">{conditionProgressLabel}</span>}
        >
          {conditions.length > 0 ? (
            <>
              <ol className="workspace-inspector-conditions">
                {visibleConditions.map((condition) => <li key={condition}>{condition}</li>)}
              </ol>
              {conditions.length > visibleConditions.length && (
                <p className="workspace-inspector-more">+{conditions.length - visibleConditions.length} more conditions</p>
              )}
            </>
          ) : (
            <p>No merge conditions detected.</p>
          )}
          {clauseSummary && (
            <p className="workspace-inspector-note">
              Merge contract: {clauseSummary.total} clauses · {clauseSummary.open.length} open
              {clauseSummary.blockingOpenCount > 0 && ` (${clauseSummary.blockingOpenCount} blocking)`}
            </p>
          )}
        </InspectorBlock>

        {clauseSummary && clauseSummary.open.length > 0 && (
          <InspectorBlock label="Open merge-contract clauses">
            <ul className="workspace-inspector-clauses">
              {clauseSummary.open.slice(0, 4).map((clause) => (
                <li key={clause.clauseId} className={clause.importance === "blocking" ? "workspace-inspector-clause--blocking" : undefined}>
                  <span className="workspace-inspector-clause-title">{clause.title}</span>
                  <span className="workspace-inspector-clause-meta">{clause.importance}{clause.ownerCue ? ` · ${clause.ownerCue}` : ""}</span>
                </li>
              ))}
            </ul>
          </InspectorBlock>
        )}

        {evidenceGaps && (
          <InspectorBlock
            label="Evidence gaps"
            aside={<span className="workspace-inspector-tag">{evidenceGaps.gaps.length} of {evidenceGaps.total}</span>}
          >
            <ul className="workspace-inspector-evidence">
              {evidenceGaps.gaps.slice(0, 4).map((record) => (
                <li key={record.evidenceId}>
                  <span className="workspace-inspector-evidence-title">{record.title}</span>
                  <span className="workspace-inspector-evidence-status">{record.status}</span>
                </li>
              ))}
            </ul>
          </InspectorBlock>
        )}

        {assumptions && (
          <InspectorBlock
            label="Open assumptions"
            aside={<span className="workspace-inspector-tag">{assumptions.openBlocking} blocking · {assumptions.openAdvisory} advisory</span>}
          >
            {assumptions.open.length > 0 ? (
              <ul className="workspace-inspector-assumptions">
                {assumptions.open.slice(0, 3).map((record) => (
                  <li key={record.assumptionId}>{record.statement}</li>
                ))}
              </ul>
            ) : (
              <p>No open assumption statements captured.</p>
            )}
          </InspectorBlock>
        )}

        {evolution && (
          <InspectorBlock label="Latest readiness delta">
            <div className="workspace-inspector-delta">
              {evolution.recommendationMovement && <span>{evolution.recommendationMovement}</span>}
              {evolution.riskMovement && <span>{evolution.riskMovement}</span>}
              {evolution.scoreMovement && <span>{evolution.scoreMovement}</span>}
            </div>
            <p className="workspace-inspector-note">
              {evolution.clearedConditions} cleared · {evolution.openedConditions} opened · {evolution.stillOpenConditions} still open
            </p>
          </InspectorBlock>
        )}

        <div className="workspace-inspector-stats" aria-label="Selected report status">
          <div><span>Test signal</span><strong>{testSignal(entry)}</strong></div>
          <div><span>Operations</span><strong>{operationalStatus}</strong></div>
          <div><span>Quality</span><strong>{qualityStatus}</strong></div>
        </div>

        <InspectorBlock label="Human decision">
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
              Owner choices use active members in {workspace.name}; roles are responsibility metadata, not access control.
            </p>
          )}
          {group.reviewState.owner === "Unassigned" && (
            <p className="workspace-inspector-note">{displayedOwner}</p>
          )}
          {humanSignal && (
            <p className="workspace-inspector-note">Decision {humanSignal.applicability} · {humanSignal.divergence}</p>
          )}
          <p className="workspace-inspector-decision-note">{group.reviewState.note.trim() || "No local note saved for this report."}</p>
        </InspectorBlock>

        <details className="workspace-inspector-provenance">
          <summary>Provenance &amp; metadata</summary>
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
        </details>
      </div>

      <div className="workspace-inspector-actions">
        <button className="workspace-inspector-primary" type="button" onClick={() => onOpen(entry)}>Open full report</button>
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
  const testsRequiredCount = groups.filter((group) => groupMatchesQueue(group, "needs-tests")).length;
  const operationalRiskCount = groups.filter((group) => hasOperationalRisk(group.latest)).length;
  const readyCount = groups.filter((group) => groupMatchesQueue(group, "ready")).length;
  const highRiskCount = groups.filter((group) => riskRank(group.latest.report.verdict.riskLevel) >= 3).length;
  const queueCounts: Record<WorkspaceQueue, number> = {
    inbox: groups.length,
    "needs-tests": groups.filter((group) => groupMatchesQueue(group, "needs-tests")).length,
    "needs-review": groups.filter((group) => groupMatchesQueue(group, "needs-review")).length,
    "operational-risk": operationalRiskCount,
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
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.documentElement.style.overflow = previousOverflow;
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
      <GuidedTourStartButton className="workspace-shell-action" />
      {hasHistory && (
        <button className="workspace-shell-action" type="button" onClick={clearHistory}>Clear history</button>
      )}
      <Link className="workspace-shell-action workspace-shell-action--primary" href="/new">Check a pull request</Link>
    </>
  );

  return (
    <AppShell context={shellContext} actions={shellActions}>
      <div className="workspace-main" data-tour="risk-inbox">
        <p className="workspace-context">
          {currentWorkspace ? `${currentWorkspace.name} · ${workspaceLabel(currentWorkspace)} · data stored on this device` : "Local merge-readiness triage"} ·{" "}
          <Link href="/docs/security-model.md">Security model</Link>
        </p>

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
            <WorkspaceSummaryStrip
              tracked={groups.length}
              needsAttention={needsAttentionCount}
              needsTests={testsRequiredCount}
              highRisk={highRiskCount}
              ready={readyCount}
            />

            <WorkspaceToolbar activeQueue={activeQueue} queueCounts={queueCounts} onSelectQueue={setActiveQueue} />

            <div className="workspace-workbench">
              <div className="workspace-queue">
                <WorkspaceQueueGroup
                  title="Needs attention"
                  description="Tests required, focused review, unresolved conditions or blocking risk."
                  groups={needsAttention}
                  emptyCopy={ATTENTION_EMPTY_COPY[activeQueue]}
                  conditionProgressByGroup={conditionProgressByGroup}
                  selectedGroupKey={selectedGroupKey}
                  setCardRef={setCardRef}
                  onSelect={selectWorkspaceGroup}
                />

                <WorkspaceQueueGroup
                  title="Ready / reviewed"
                  description="Marked ready, reviewed or archived — plus changes the latest local run approved."
                  groups={ready}
                  emptyCopy={READY_EMPTY_COPY[activeQueue]}
                  conditionProgressByGroup={conditionProgressByGroup}
                  selectedGroupKey={selectedGroupKey}
                  setCardRef={setCardRef}
                  onSelect={selectWorkspaceGroup}
                />
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
            <span className="workspace-empty-mark" aria-hidden="true" />
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
