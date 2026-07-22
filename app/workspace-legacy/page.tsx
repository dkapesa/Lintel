"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const SELECTED_CASE_SURFACE_QUERY = "(max-width: 1179px)";
const SELECTED_CASE_SPATIAL_EXIT_MS = 240;

type WorkspaceQueue = (typeof QUEUES)[number][0];
type CopyFeedback = { key: string; state: "copied" | "failed" } | null;

type WorkspaceGroup = {
  key: string;
  latest: ReportHistoryEntry;
  entries: ReportHistoryEntry[];
  reviewState: ReportReviewState;
};

type SelectedCaseView = "canvas" | "inspector";
type SelectOptions = { focusRow?: boolean; openSelectedCase?: boolean };

const WORKSPACE_CANVAS_MODES = ["overview", "findings", "requirements", "decision"] as const;

type WorkspaceCanvasMode = (typeof WORKSPACE_CANVAS_MODES)[number];

type WorkspaceArtifactType = "case" | "finding" | "evidence" | "requirement" | "human-decision";

type WorkspaceFocus = {
  reportKey: string;
  artifactType: WorkspaceArtifactType;
  artifactId?: string;
};

const WORKSPACE_CANVAS_MODE_LABELS: Record<WorkspaceCanvasMode, string> = {
  overview: "Overview",
  findings: "Findings & evidence",
  requirements: "Requirements",
  decision: "Human decision",
};

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
      onClick={() => onSelect(group, { openSelectedCase: true })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onSelect(group, { openSelectedCase: true });
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

function InspectorBlock({ label, aside, children, section }: { label: string; aside?: ReactNode; children: ReactNode; section?: string }) {
  return (
    <section className="workspace-inspector-block" data-inspector-section={section}>
      <div className="workspace-inspector-block-head">
        <h3>{label}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function WorkspaceInspectorArtifact({
  entry,
  group,
  focus,
  conditionProgressLabel,
}: {
  entry: ReportHistoryEntry;
  group: WorkspaceGroup;
  focus: WorkspaceFocus;
  conditionProgressLabel: string;
}) {
  const report = entry.report;
  const evidenceRecords = entry.verificationPack?.evidence.records.items ?? [];
  const clauses = entry.mergeContract?.clauses ?? [];
  const conditions = reportConditions(report);
  const missingProof = evidenceGapSummary(entry)?.gaps.map((record) => record.title) ?? report.missingTests;
  const caseIdentity = [entry.metadata.repository, report.pr.number > 0 ? `#${report.pr.number}` : null, report.pr.branch].filter(Boolean).join(" · ");
  const findingIndex = report.findings.findIndex((_, index) => `finding-${index}` === focus.artifactId);
  const finding = findingIndex >= 0 ? report.findings[findingIndex] : undefined;
  const evidence = evidenceRecords.find((record) => record.evidenceId === focus.artifactId);
  const requirement = clauses.find((clause) => clause.clauseId === focus.artifactId)
    ?? (clauses.length === 0 ? conditions.map((statement, index) => ({ id: `condition-${index}`, statement })).find((item) => item.id === focus.artifactId) : undefined);
  const relatedFindingIndexes = requirement && "relatedFindingIds" in requirement
    ? requirement.relatedFindingIds.map((findingId) => report.findings.findIndex((_, index) => `finding-${index}` === findingId)).filter((index) => index >= 0)
    : [];

  if (focus.artifactType === "finding" && finding) {
    const attachedEvidence = evidenceRecords.filter((record) => record.relatedFindingIds.includes(`finding-${findingIndex}`));
    const relatedRequirement = clauses.find((clause) => clause.relatedFindingIds.includes(`finding-${findingIndex}`));
    return <>
      <div className="workspace-inspector-headline"><h2>{finding.title}</h2><p className="workspace-inspector-identity">{caseIdentity}</p></div>
      <InspectorBlock label="Observed finding" aside={<span className="workspace-inspector-tag">{finding.severity}</span>} section="finding">
        <dl className="workspace-inspector-meta"><div><dt>Identifier</dt><dd>F{findingIndex + 1}</dd></div><div><dt>Interpretation</dt><dd>{finding.category}</dd></div><div><dt>Provenance</dt><dd>{finding.provenance ?? "Not recorded"}</dd></div><div><dt>Affected surface</dt><dd>{finding.file ?? "Not recorded"}</dd></div></dl>
        <p>{finding.evidence}</p>
      </InspectorBlock>
      <InspectorBlock label="Attached evidence" section="evidence">
        {attachedEvidence.length ? <ul className="workspace-inspector-evidence">{attachedEvidence.map((record) => <li key={record.evidenceId}><strong>{record.evidenceId} · {record.title}</strong><span>{record.statement}</span></li>)}</ul> : <p>No attached evidence record was captured for this finding.</p>}
      </InspectorBlock>
      <InspectorBlock label="Requirement influence" section="requirement"><p>{relatedRequirement ? `C${clauses.indexOf(relatedRequirement) + 1} · ${relatedRequirement.title}` : "No related requirement was recorded."}</p></InspectorBlock>
      <InspectorBlock label="Next reviewer action" section="next-action"><p>{finding.action || "No next action was recorded for this finding."}</p></InspectorBlock>
    </>;
  }

  if (focus.artifactType === "evidence" && evidence) {
    const relatedFindingIndexes = evidence.relatedFindingIds.map((findingId) => report.findings.findIndex((_, index) => `finding-${index}` === findingId)).filter((index) => index >= 0);
    const relatedRequirement = clauses.find((clause) => clause.relatedEvidenceIds.includes(evidence.evidenceId));
    return <>
      <div className="workspace-inspector-headline"><h2>{evidence.title}</h2><p className="workspace-inspector-identity">{caseIdentity}</p></div>
      <InspectorBlock label="Observed proof" aside={<span className="workspace-inspector-tag">{evidence.status}</span>} section="evidence">
        <dl className="workspace-inspector-meta"><div><dt>Identifier</dt><dd>{evidence.evidenceId}</dd></div><div><dt>Evidence class</dt><dd>{evidence.class.replaceAll("-", " ")}</dd></div><div><dt>Provenance</dt><dd>{evidence.provenance || "Not recorded"}</dd></div><div><dt>Technical source</dt><dd>{evidence.source || "Not recorded"}</dd></div></dl>
        <p>{evidence.statement}</p>
      </InspectorBlock>
      <InspectorBlock label="Related records" section="related"><p>{relatedFindingIndexes.length ? `Supports ${relatedFindingIndexes.map((index) => `F${index + 1}`).join(" · ")}.` : "No related finding was recorded."}</p><p>{relatedRequirement ? `Related requirement: C${clauses.indexOf(relatedRequirement) + 1} · ${relatedRequirement.title}` : "No related requirement was recorded."}</p></InspectorBlock>
      <InspectorBlock label="Clearance context" section="next-action"><p>{relatedRequirement ? (relatedRequirement.currentSupportingEvidenceIds.includes(evidence.evidenceId) ? "This evidence is listed as current supporting evidence; review the requirement state before treating it as cleared." : "This evidence is not listed as current supporting evidence for the related requirement.") : "No requirement clearance relationship was recorded."}</p></InspectorBlock>
    </>;
  }

  if (focus.artifactType === "requirement" && requirement) {
    const canonical = "clauseId" in requirement;
    const requirementIndex = canonical ? clauses.indexOf(requirement) : -1;
    const relatedEvidence = canonical ? evidenceRecords.filter((record) => requirement.relatedEvidenceIds.includes(record.evidenceId)) : [];
    return <>
      <div className="workspace-inspector-headline"><h2>{canonical ? requirement.title : requirement.statement}</h2><p className="workspace-inspector-identity">{caseIdentity}</p></div>
      <InspectorBlock label={canonical ? `Requirement C${requirementIndex + 1}` : "Report merge condition"} aside={<span className="workspace-inspector-tag">{canonical ? requirement.status : conditionProgressLabel}</span>} section="requirement">
        {canonical ? <><dl className="workspace-inspector-meta"><div><dt>Importance</dt><dd>{requirement.importance}</dd></div><div><dt>Owner cue</dt><dd>{requirement.ownerCue ?? "Not recorded"}</dd></div></dl><p>{requirement.statement}</p><p><strong>Clearance evidence:</strong> {requirement.evidenceRequired || "No exact clearance evidence was recorded."}</p></> : <><p>No canonical Merge Contract is available. This is a report merge condition, shown without a C identifier or owner cue.</p><p>{requirement.statement}</p></>}
      </InspectorBlock>
      <InspectorBlock label="Related findings and evidence" section="related"><p>{relatedFindingIndexes.length ? `Related findings: ${relatedFindingIndexes.map((index) => `F${index + 1}`).join(" · ")}` : "No related finding was recorded."}</p><p>{relatedEvidence.length ? `Evidence: ${relatedEvidence.map((record) => record.evidenceId).join(" · ")}` : "No related evidence was recorded."}</p></InspectorBlock>
      <InspectorBlock label="Next reviewer action" section="next-action"><p>{canonical ? (requirement.status === "open" ? "Examine the recorded clearance evidence and confirm the requirement state." : "Review the recorded requirement state in the Case File.") : "Examine this report condition and record progress only through the existing local workflow."}</p></InspectorBlock>
    </>;
  }

  const ledger = entry.verificationPack?.humanDecisionLedger;
  const currentDecision = ledger?.currentDecision;
  const currentEntry = ledger?.recentEntries.items[0];
  return <>
    <div className="workspace-inspector-headline"><h2>Human decision</h2><p className="workspace-inspector-identity">{caseIdentity}</p></div>
    <InspectorBlock label="Decision alignment" section="decision"><dl className="workspace-inspector-meta"><div><dt>Lintel recommendation</dt><dd>{recommendationLabel(entry.metadata.recommendation)}</dd></div><div><dt>Canonical decision</dt><dd>{currentDecision ?? "No engineer decision has been recorded."}</dd></div><div><dt>Actor</dt><dd>{currentEntry?.actor ?? "Not recorded"}</dd></div><div><dt>Timestamp</dt><dd>{currentEntry?.recordedAt ? createdTime(currentEntry.recordedAt) : "Not recorded"}</dd></div></dl><p>{ledger?.summary ?? "No decision alignment is available to compare."}</p></InspectorBlock>
    <InspectorBlock label="Open proof and requirements" section="requirements"><p>{missingProof.length ? `Open proof: ${missingProof.join(" · ")}` : "No missing proof is captured in the latest local report."}</p><p>{conditions.length ? `${conditions.length} report merge condition${conditions.length === 1 ? " remains" : "s remain"} recorded.` : "No report merge condition is recorded."}</p></InspectorBlock>
    <InspectorBlock label="Local workflow metadata" section="local-state"><p>Local review state: {group.reviewState.status}. This local workflow metadata is not a final canonical merge decision.</p></InspectorBlock>
    <InspectorBlock label="Next reviewer action" section="next-action"><p>{nextAction(entry)}. Use the complete Human Decision Ledger in the Case File for full context.</p></InspectorBlock>
  </>;
}

function WorkspaceCanvas({
  group,
  conditionProgressLabel,
  onOpen,
  onFocusChange,
}: {
  group: WorkspaceGroup | null;
  conditionProgressLabel: string;
  onOpen: (entry: ReportHistoryEntry) => void;
  onFocusChange: (focus: WorkspaceFocus | null) => void;
}) {
  const initialReport = group?.latest.report;
  const initialClauses = group?.latest.mergeContract?.clauses ?? [];
  const initialConditions = initialReport ? reportConditions(initialReport) : [];
  const defaultFindingIndex = initialReport
    ? initialReport.findings.findIndex((finding) => finding.severity === "CRITICAL" || finding.severity === "HIGH")
    : -1;
  const defaultFindingId = initialReport?.findings.length
    ? `finding-${defaultFindingIndex >= 0 ? defaultFindingIndex : 0}`
    : null;
  const defaultRequirementId = initialClauses.length > 0
    ? (initialClauses.find((clause) => clause.status === "open" && clause.importance === "blocking")
      ?? initialClauses.find((clause) => clause.status === "open")
      ?? initialClauses[0]).clauseId
    : initialConditions[0] ? "condition-0" : null;
  const [mode, setMode] = useState<WorkspaceCanvasMode>("overview");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(defaultFindingId);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(defaultRequirementId);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  useEffect(() => {
    setMode("overview");
    setSelectedFindingId(defaultFindingId);
    setSelectedRequirementId(defaultRequirementId);
    setSelectedEvidenceId(null);
  }, [group?.key, defaultFindingId, defaultRequirementId]);

  const setWorkingMode = (nextMode: WorkspaceCanvasMode) => {
    setMode(nextMode);
    setSelectedEvidenceId(null);
  };

  const evidenceRecords = group?.latest.verificationPack?.evidence.records.items ?? [];
  const activeEvidence = evidenceRecords.find((record) => record.evidenceId === selectedEvidenceId);

  useEffect(() => {
    if (!group) {
      onFocusChange(null);
      return;
    }

    if (mode === "overview") onFocusChange({ reportKey: group.key, artifactType: "case" });
    else if (mode === "decision") onFocusChange({ reportKey: group.key, artifactType: "human-decision" });
    else if (mode === "findings" && activeEvidence) onFocusChange({ reportKey: group.key, artifactType: "evidence", artifactId: activeEvidence.evidenceId });
    else if (mode === "findings" && selectedFindingId) onFocusChange({ reportKey: group.key, artifactType: "finding", artifactId: selectedFindingId });
    else if (mode === "requirements" && selectedRequirementId) onFocusChange({ reportKey: group.key, artifactType: "requirement", artifactId: selectedRequirementId });
    else onFocusChange({ reportKey: group.key, artifactType: "case" });
  }, [activeEvidence, group, mode, onFocusChange, selectedFindingId, selectedRequirementId]);

  if (!group) {
    return (
      <section id="workspace-selected-case-canvas" className="workspace-canvas workspace-canvas--empty" aria-label="Selected verification case">
        <div className="workspace-plane-header"><span>Working canvas</span><span>Awaiting selection</span></div>
        <div className="workspace-canvas-empty-body">
          <h2>Select a verification case</h2>
          <p>The active case will connect its observed change, evidence, requirements and local human-decision state here.</p>
        </div>
      </section>
    );
  }

  const entry = group.latest;
  const report = entry.report;
  const clauseSummary = contractClauseSummary(entry);
  const evidenceGaps = evidenceGapSummary(entry);
  const conditions = reportConditions(report);
  const missingProof = evidenceGaps?.gaps.map((record) => record.title) ?? report.missingTests;
  const canonicalClauses = entry.mergeContract?.clauses ?? [];
  const fallbackRequirements = canonicalClauses.length === 0
    ? conditions.map((statement, index) => ({ id: `condition-${index}`, statement }))
    : [];
  const requirements = canonicalClauses.length > 0 ? canonicalClauses : fallbackRequirements;

  const selectedFindingIndex = Math.max(report.findings.findIndex((_, index) => `finding-${index}` === selectedFindingId), 0);
  const selectedFinding = report.findings[selectedFindingIndex];
  const selectedRequirement = canonicalClauses.length > 0
    ? canonicalClauses.find((clause) => clause.clauseId === selectedRequirementId) ?? canonicalClauses[0]
    : fallbackRequirements.find((requirement) => requirement.id === selectedRequirementId) ?? fallbackRequirements[0];
  const focusLabel = mode === "overview" ? "Case overview"
    : mode === "decision" ? "Human decision"
      : mode === "findings" && selectedFinding ? `Finding F${selectedFindingIndex + 1}`
        : mode === "requirements" && selectedRequirement
          ? ("clauseId" in selectedRequirement ? `Requirement C${canonicalClauses.indexOf(selectedRequirement) + 1}` : "Merge condition")
          : WORKSPACE_CANVAS_MODE_LABELS[mode];
  const trace = [
    { label: "Change", value: `${report.changedFiles.length} files`, state: "known" },
    { label: "Observation", value: `${report.findings.length} findings`, state: "known" },
    { label: "Evidence", value: evidenceGaps ? `${evidenceGaps.gaps.length} gaps` : "Captured", state: evidenceGaps ? "attention" : "known" },
    { label: "Requirement", value: requirements.length ? `${requirements.length} recorded` : "No open requirement", state: requirements.length ? "attention" : "known" },
    { label: "Human decision", value: group.reviewState.status, state: "decision" },
  ];
  return (
    <section id="workspace-selected-case-canvas" className="workspace-canvas" aria-label="Selected verification case" data-tour="workspace-canvas">
      <div className="workspace-plane-header"><span>Active verification</span><span>{focusLabel}</span></div>
      <div className="workspace-canvas-modebar" role="tablist" aria-label="Selected case working modes">
        {WORKSPACE_CANVAS_MODES.map((value, index) => (
          <button
            key={value}
            id={`workspace-canvas-mode-${value}`}
            className={`workspace-canvas-mode${mode === value ? " workspace-canvas-mode--active" : ""}`}
            type="button"
            role="tab"
            aria-selected={mode === value}
            aria-controls="workspace-canvas-mode-panel"
            tabIndex={mode === value ? 0 : -1}
            onClick={() => setWorkingMode(value)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % WORKSPACE_CANVAS_MODES.length;
              else if (event.key === "ArrowLeft") next = (index - 1 + WORKSPACE_CANVAS_MODES.length) % WORKSPACE_CANVAS_MODES.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = WORKSPACE_CANVAS_MODES.length - 1;
              else return;
              event.preventDefault();
              setWorkingMode(WORKSPACE_CANVAS_MODES[next]);
              document.getElementById(`workspace-canvas-mode-${WORKSPACE_CANVAS_MODES[next]}`)?.focus();
            }}
          >{WORKSPACE_CANVAS_MODE_LABELS[value]}</button>
        ))}
      </div>
      <div className="workspace-canvas-scroll">
        <div key={`${group.key}-${mode}`} id="workspace-canvas-mode-panel" role="tabpanel" aria-labelledby={`workspace-canvas-mode-${mode}`} className="workspace-canvas-mode-panel workspace-motion-replace">
        <header className="workspace-canvas-headline">
          <div>
            <p className="workspace-canvas-kicker">Selected case</p>
            <h2>{entry.metadata.title}</h2>
            <p className="workspace-canvas-identity">
              {[entry.metadata.repository, report.pr.number > 0 ? `#${report.pr.number}` : null, report.pr.branch].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button className="workspace-canvas-case-link" type="button" onClick={() => onOpen(entry)}>Open Case File</button>
        </header>

        {mode === "overview" && <>
        <ol className="workspace-verification-trace workspace-verification-trace--canvas" aria-label="Verification trace">
          {trace.map((step) => (
            <li key={step.label} className={`workspace-trace-step workspace-trace-step--${step.state}`}>
              <span className="workspace-trace-mark" aria-hidden="true" />
              <span className="workspace-trace-label">{step.label}</span>
              <strong>{step.value}</strong>
            </li>
          ))}
        </ol>

        <section className="workspace-canvas-verdict">
          <div>
            <span className="workspace-canvas-label">Lintel recommendation</span>
            <strong className={`workspace-recommendation-text workspace-recommendation-text--${entry.metadata.recommendation.toLowerCase()}`}>
              {recommendationLabel(entry.metadata.recommendation)}
            </strong>
          </div>
          <div>
            <span className="workspace-canvas-label">Risk</span>
            <strong className={`workspace-risk-text${elevatedRisk(report.verdict.riskLevel) ? " workspace-risk-text--elevated" : ""}`}>
              {report.verdict.riskLevel} · {entry.metadata.riskScore}/100
            </strong>
          </div>
          <p>{conciseBecause(entry)}</p>
        </section>

        <div className="workspace-canvas-ledgers">
          <section className="workspace-canvas-ledger" aria-labelledby="workspace-observation-heading">
            <div className="workspace-canvas-section-head"><h3 id="workspace-observation-heading">Observation and evidence</h3><span>{report.findings.length}</span></div>
            {report.findings.length > 0 ? (
              <ol className="workspace-canvas-records">
                {report.findings.slice(0, 3).map((finding, index) => (
                  <li key={`${finding.title}-${index}`}>
                    <span className="workspace-canvas-record-id">F{index + 1}</span>
                    <div><strong>{finding.title}</strong><p>{finding.evidence}</p></div>
                  </li>
                ))}
              </ol>
            ) : <p className="workspace-canvas-empty-copy">No finding is captured in this local report.</p>}
          </section>

          <section className="workspace-canvas-ledger" aria-labelledby="workspace-requirement-heading">
            <div className="workspace-canvas-section-head"><h3 id="workspace-requirement-heading">Requirements and proof</h3><span>{conditionProgressLabel}</span></div>
            {requirements.length > 0 ? (
              <ol className="workspace-canvas-records workspace-canvas-records--requirements">
                {requirements.slice(0, 4).map((requirement, index) => <li key={"clauseId" in requirement ? requirement.clauseId : requirement.id}><span className="workspace-canvas-record-id">{"clauseId" in requirement ? `C${index + 1}` : "Condition"}</span><div><strong>{"clauseId" in requirement ? requirement.title : requirement.statement}</strong></div></li>)}
              </ol>
            ) : <p className="workspace-canvas-empty-copy">No open requirement is captured in this local report.</p>}
            {missingProof.length > 0 && <p className="workspace-canvas-proof">Missing proof: {missingProof.slice(0, 2).join(" · ")}</p>}
          </section>
        </div>

        <section className="workspace-canvas-decision" aria-label="Current local decision state">
          <div><span>Human decision</span><strong>{group.reviewState.status}</strong></div>
          <div><span>Next reviewer action</span><strong>{nextAction(entry)}</strong></div>
          <p>{group.reviewState.owner === "Unassigned" ? "No local owner recorded." : `Local owner: ${group.reviewState.owner}.`}</p>
        </section>
        </>}

        {mode === "findings" && <section className="workspace-canvas-worklist" aria-labelledby="workspace-findings-heading">
          <div className="workspace-canvas-worklist-head"><div><p className="workspace-canvas-kicker">Working records</p><h3 id="workspace-findings-heading">Findings and evidence</h3></div><span>{report.findings.length} findings</span></div>
          {report.findings.length === 0 ? <p className="workspace-canvas-empty-copy">No findings were recorded for this report.</p> : <ol className="workspace-canvas-focus-list">
            {report.findings.map((finding, index) => {
              const findingId = `finding-${index}`;
              const active = findingId === selectedFindingId;
              const evidence = entry.verificationPack?.evidence.records.items.filter((record) => record.relatedFindingIds.includes(findingId)) ?? [];
              const relatedClause = canonicalClauses.find((clause) => clause.relatedFindingIds.includes(findingId));
              return <li key={findingId} className={active ? "workspace-canvas-focus-record workspace-canvas-focus-record--active" : "workspace-canvas-focus-record"}>
                <button type="button" aria-pressed={active} onClick={() => { setSelectedFindingId(findingId); setSelectedEvidenceId(null); }}>
                  <span className="workspace-canvas-record-id">F{index + 1}</span><span><strong>{finding.title}</strong><small>{finding.severity} · {finding.category}{finding.file ? ` · ${finding.file}` : ""}</small></span><span className="workspace-canvas-record-state">{evidence.length ? `${evidence.length} evidence` : "No attached evidence"}</span>
                </button>
                {active && <div key={`finding-detail-${findingId}`} className="workspace-canvas-focus-detail workspace-motion-replace">
                  <p>{finding.evidence}</p><p><span>Provenance</span>{finding.provenance ?? "Not recorded"}</p><p><span>Affected surface</span>{finding.file ?? finding.category}</p><p><span>Next action</span>{finding.action}</p>
                  {evidence.length > 0 ? <ol className="workspace-canvas-attached-records">{evidence.map((record) => <li key={record.evidenceId}><button type="button" aria-pressed={selectedEvidenceId === record.evidenceId} onClick={() => setSelectedEvidenceId(record.evidenceId)}><span className="workspace-canvas-record-id">{record.evidenceId}</span><span><strong>{record.title}</strong><p>{record.statement}</p><small>{record.status} · {record.provenance}</small></span></button></li>)}</ol> : <p className="workspace-canvas-proof">No evidence records are attached.</p>}
                  {relatedClause && <p className="workspace-canvas-related">Related requirement: C{canonicalClauses.indexOf(relatedClause) + 1} · {relatedClause.title}</p>}
                </div>}
              </li>;
            })}
          </ol>}
        </section>}

        {mode === "requirements" && <section className="workspace-canvas-worklist" aria-labelledby="workspace-requirements-heading">
          <div className="workspace-canvas-worklist-head"><div><p className="workspace-canvas-kicker">Merge conditions</p><h3 id="workspace-requirements-heading">Requirements and clearance</h3></div><span>{canonicalClauses.length ? "Merge Contract" : "Report conditions"}</span></div>
          {requirements.length === 0 ? <p className="workspace-canvas-empty-copy">{canonicalClauses.length === 0 ? "No canonical Merge Contract is available, and no merge conditions were recorded." : "No requirements were recorded in the Merge Contract."}</p> : <>
            {canonicalClauses.length === 0 && <p className="workspace-canvas-limitation">No canonical Merge Contract is available. Report merge conditions are shown without C identifiers or owner cues.</p>}
            <ol className="workspace-canvas-focus-list">{requirements.map((requirement, index) => {
              const canonical = "clauseId" in requirement;
              const id = canonical ? requirement.clauseId : requirement.id;
              const active = id === selectedRequirementId;
              const relatedFindings = canonical ? requirement.relatedFindingIds.map((findingId) => report.findings.findIndex((_, findingIndex) => findingId === `finding-${findingIndex}`)).filter((findingIndex) => findingIndex >= 0) : [];
              return <li key={id} className={active ? "workspace-canvas-focus-record workspace-canvas-focus-record--active" : "workspace-canvas-focus-record"}><button type="button" aria-pressed={active} onClick={() => setSelectedRequirementId(id)}><span className="workspace-canvas-record-id">{canonical ? `C${index + 1}` : "Condition"}</span><span><strong>{canonical ? requirement.title : requirement.statement}</strong><small>{canonical ? `${requirement.importance} · ${requirement.status}` : conditionProgressLabel}</small></span><span className="workspace-canvas-record-state">{canonical && requirement.importance === "blocking" ? "Blocking" : "Review condition"}</span></button>
                {active && <div key={`requirement-detail-${id}`} className="workspace-canvas-focus-detail workspace-motion-replace">{canonical ? <><p>{requirement.statement}</p><p><span>Clearance evidence</span>{requirement.currentSupportingEvidenceIds.length ? requirement.currentSupportingEvidenceIds.join(" · ") : requirement.evidenceRequired || "No clearance evidence recorded."}</p><p><span>Owner</span>{requirement.ownerCue ?? "No owner cue recorded."}</p>{relatedFindings.length > 0 && <p className="workspace-canvas-related">Related findings: {relatedFindings.map((findingIndex) => `F${findingIndex + 1}`).join(" · ")}</p>}</> : <><p><span>Local condition state</span>{conditionProgressLabel}</p><p>No clause-level clearance evidence is recorded for this report condition.</p></>}</div>}</li>;
            })}</ol>
          </>}
        </section>}

        {mode === "decision" && <section className="workspace-canvas-decision-view" aria-labelledby="workspace-decision-heading"><p className="workspace-canvas-kicker">Decision record</p><h3 id="workspace-decision-heading">Human decision</h3><div className="workspace-canvas-decision-ledger"><div><span>Lintel recommendation</span><strong className={`workspace-recommendation-text workspace-recommendation-text--${entry.metadata.recommendation.toLowerCase()}`}>{recommendationLabel(entry.metadata.recommendation)}</strong></div><div><span>Canonical decision</span><strong>{entry.verificationPack?.humanDecisionLedger?.currentDecision ?? "No engineer decision has been recorded."}</strong></div><div><span>Local review state</span><strong>{group.reviewState.status}</strong></div><div><span>Next bounded action</span><strong>{nextAction(entry)}</strong></div></div><p className="workspace-canvas-decision-note">{entry.verificationPack?.humanDecisionLedger?.summary ?? "The local review state is not a recorded merge decision."}</p>{missingProof.length > 0 && <p className="workspace-canvas-proof">Open proof: {missingProof.join(" · ")}</p>}{requirements.length > 0 && <p className="workspace-canvas-related">Open requirements: {requirements.filter((requirement) => !("status" in requirement) || requirement.status === "open").length}</p>}</section>}
        </div>
      </div>
    </section>
  );
}

function WorkspaceInspector({
  group,
  activeFocus,
  copyFeedback,
  conditionProgressLabel,
  workspace,
  onOpen,
  onCopyConditions,
  onDeleteGroup,
  onStatusChange,
  onOwnerChange,
}: {
  group: WorkspaceGroup | null;
  activeFocus: WorkspaceFocus | null;
  copyFeedback: CopyFeedback;
  conditionProgressLabel: string;
  workspace: TeamWorkspace | null;
  onOpen: (entry: ReportHistoryEntry) => void;
  onCopyConditions: (group: WorkspaceGroup) => void;
  onDeleteGroup: (group: WorkspaceGroup) => void;
  onStatusChange: (group: WorkspaceGroup, status: ReviewStatus) => void;
  onOwnerChange: (group: WorkspaceGroup, owner: ReviewerOwner) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeFocus?.artifactId, activeFocus?.artifactType, group?.key]);

  if (!group) {
    return (
      <aside
        id="workspace-selected-case-inspector"
        className="workspace-inspector workspace-inspector--empty"
        aria-label="Selected report detail"
      >
        <div className="workspace-inspector-topbar">
          <span className="workspace-inspector-kicker">Decision</span>
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
  const resolvedFocus = activeFocus?.reportKey === group.key ? activeFocus : { reportKey: group.key, artifactType: "case" as const };
  const recommendation = entry.metadata.recommendation.toLowerCase();
  const conditions = reportConditions(report);
  const reviewerFocus = pruneUnsupportedReviewerFocus(report) ?? [];
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
  const focusedClauseIndex = (entry.mergeContract?.clauses ?? []).findIndex((clause) => clause.clauseId === resolvedFocus.artifactId);
  const focusTopLabel = resolvedFocus.artifactType === "case" ? "Selected case"
    : resolvedFocus.artifactType === "finding" ? `Finding / F${report.findings.findIndex((_, index) => `finding-${index}` === resolvedFocus.artifactId) + 1}`
      : resolvedFocus.artifactType === "evidence" ? `Evidence / ${resolvedFocus.artifactId ?? "record"}`
        : resolvedFocus.artifactType === "requirement" ? `Requirement / ${focusedClauseIndex >= 0 ? `C${focusedClauseIndex + 1}` : "condition"}`
          : "Human decision";

  return (
    <aside
      id="workspace-selected-case-inspector"
      className="workspace-inspector"
      aria-label={`${focusTopLabel} inspector`}
      data-tour="selected-pr"
    >
      <div className="workspace-inspector-topbar">
        <span className="workspace-inspector-kicker" aria-live="polite" aria-atomic="true">{focusTopLabel}</span>
      </div>

      <div className="workspace-inspector-scroll" ref={scrollRef}>
        <div key={`${group.key}-${resolvedFocus.artifactType}-${resolvedFocus.artifactId ?? "case"}`} className="workspace-inspector-projection workspace-motion-replace">
        {resolvedFocus.artifactType === "case" ? <>
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
          section="recommendation"
          aside={<span className={`workspace-recommendation-text workspace-recommendation-text--${recommendation}`}>{recommendationLabel(entry.metadata.recommendation)}</span>}
        >
          <p>Risk: {report.verdict.riskLevel}</p>
          <p>{conciseBecause(entry)}</p>
        </InspectorBlock>

        <InspectorBlock
          label="Open requirements"
          section="requirements"
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
          section="proof"
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

        <InspectorBlock label="Required next action" section="next-action" aside={<span className="workspace-inspector-tag">{action}</span>}>
          <p>{topConditionOrRisk(entry)}</p>
        </InspectorBlock>

        <InspectorBlock label="Owner and local review state" section="decision">
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
              {reviewerFocus.length > 0 && (
                <div className="workspace-inspector-focus">
                  {reviewerFocus.slice(0, 4).map((item) => <span key={`${item.area}-${item.priority}`}>{item.priority}: {item.area}</span>)}
                </div>
              )}
            </div>
          </div>
        </details>
        </> : <WorkspaceInspectorArtifact entry={entry} group={group} focus={resolvedFocus} conditionProgressLabel={conditionProgressLabel} />}
        </div>
      </div>

      <div className="workspace-inspector-actions">
        <button className="workspace-inspector-primary" type="button" onClick={() => onOpen(entry)}>Open Case File</button>
        {resolvedFocus.artifactType === "case" && <button type="button" onClick={() => onCopyConditions(group)}>
          {feedback === "copied" ? "Copied" : feedback === "failed" ? "Copy failed" : "Copy conditions"}
        </button>}
        {resolvedFocus.artifactType === "case" && <button className="workspace-inspector-delete" type="button" onClick={() => onDeleteGroup(group)}>Delete reports</button>}
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
  const [activeFocus, setActiveFocus] = useState<WorkspaceFocus | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [selectedCaseOpen, setSelectedCaseOpen] = useState(false);
  const [selectedCaseView, setSelectedCaseView] = useState<SelectedCaseView>("canvas");
  const [selectedCaseMotion, setSelectedCaseMotion] = useState<"closed" | "open" | "closing">("closed");
  const [selectedCaseSurfaceViewport, setSelectedCaseSurfaceViewport] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    const closeForShellNavigation = () => {
      setSelectedCaseOpen(false);
      setSelectedCaseMotion("closed");
    };
    window.addEventListener(SHELL_NAVIGATION_OPEN_EVENT, closeForShellNavigation);
    return () => window.removeEventListener(SHELL_NAVIGATION_OPEN_EVENT, closeForShellNavigation);
  }, []);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const selectedCaseMatchRef = useRef<MediaQueryList | null>(null);
  const selectedCaseNodeRef = useRef<HTMLElement | null>(null);
  const selectedCaseCloseNodeRef = useRef<HTMLButtonElement | null>(null);
  const selectedGroupKeyRef = useRef<string | null>(null);
  const selectedCaseCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (selectedCaseCloseTimer.current) clearTimeout(selectedCaseCloseTimer.current);
  }, []);

  useEffect(() => {
    setMotionReady(true);
  }, []);

  /* Desktop retains the persistent three-plane workbench. Below it, a selected
     case becomes one bounded surface with Canvas and Inspector views. */
  useEffect(() => {
    const query = window.matchMedia(SELECTED_CASE_SURFACE_QUERY);
    selectedCaseMatchRef.current = query;
    const reconcileSelectedCaseViewport = (matches = query.matches) => {
      setSelectedCaseSurfaceViewport(matches);
      if (!matches) {
        if (selectedCaseCloseTimer.current) clearTimeout(selectedCaseCloseTimer.current);
        setSelectedCaseOpen(false);
        setSelectedCaseMotion("closed");
      }
    };
    reconcileSelectedCaseViewport();
    const onChange = (event: MediaQueryListEvent) => reconcileSelectedCaseViewport(event.matches);
    const onResize = () => reconcileSelectedCaseViewport();
    query.addEventListener("change", onChange);
    window.addEventListener("resize", onResize);
    return () => {
      query.removeEventListener("change", onChange);
      window.removeEventListener("resize", onResize);
    };
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
  const handleFocusChange = useCallback((nextFocus: WorkspaceFocus | null) => {
    setActiveFocus((currentFocus) => (
      currentFocus?.reportKey === nextFocus?.reportKey
      && currentFocus?.artifactType === nextFocus?.artifactType
      && currentFocus?.artifactId === nextFocus?.artifactId
        ? currentFocus
        : nextFocus
    ));
  }, []);
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

  /* Keep the selected-case surface from lingering once its report is gone. */
  useEffect(() => {
    if (selectedCaseOpen && !selectedGroupKey) closeSelectedCase(false);
  }, [selectedCaseOpen, selectedGroupKey]);

  /* The responsive selected-case surface owns its modal focus, Escape behavior,
     background lock and safe restoration to its originating queue record. */
  useEffect(() => {
    if (!selectedCaseOpen) return;
    const node = selectedCaseNodeRef.current;
    if (!node) return;

    (selectedCaseCloseNodeRef.current ?? node).focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeSelectedCase();
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
  }, [selectedCaseOpen]);

  useEffect(() => {
    if (!selectedCaseOpen) return;
    const shellBackground = Array.from(document.querySelectorAll<HTMLElement>(
      ".shell-global-rail, .shell-context-navigation, .shell-command-bar",
    ));
    const previous = shellBackground.map((element) => ({
      element,
      ariaHidden: element.getAttribute("aria-hidden"),
      inert: element.hasAttribute("inert"),
    }));
    for (const { element } of previous) {
      element.setAttribute("aria-hidden", "true");
      element.setAttribute("inert", "");
    }
    return () => {
      for (const { element, ariaHidden, inert } of previous) {
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
        if (!inert) element.removeAttribute("inert");
      }
    };
  }, [selectedCaseOpen]);

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
    const { focusRow = false, openSelectedCase = false } = options;
    setSelectedGroupKey(group.key);

    try {
      window.localStorage.setItem(selectedStorageKey(), group.key);
    } catch {
      // Local selection persistence is optional.
    }

    if (openSelectedCase && selectedCaseMatchRef.current?.matches) {
      if (selectedCaseCloseTimer.current) clearTimeout(selectedCaseCloseTimer.current);
      setSelectedCaseView("canvas");
      setSelectedCaseMotion("open");
      setSelectedCaseOpen(true);
    }
    if (focusRow) focusWorkspaceCard(group.key);
  }

  function closeSelectedCase(restoreFocus = true) {
    if (!selectedCaseOpen) return;
    setSelectedCaseOpen(false);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSelectedCaseMotion(reducedMotion ? "closed" : "closing");
    if (selectedCaseCloseTimer.current) clearTimeout(selectedCaseCloseTimer.current);
    selectedCaseCloseTimer.current = setTimeout(() => {
      setSelectedCaseMotion("closed");
      if (restoreFocus) {
        const key = selectedGroupKeyRef.current;
        if (key) focusWorkspaceCard(key);
      }
    }, reducedMotion ? 0 : SELECTED_CASE_SPATIAL_EXIT_MS);
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
      setSelectedCaseOpen(false);
      setSelectedCaseMotion("closed");
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
      setSelectedCaseOpen(false);
      setSelectedCaseMotion("closed");
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
      <div className={styles.root} data-tour="risk-inbox" data-motion-ready={motionReady ? "true" : undefined}>
        <header className="workspace-context" aria-hidden={selectedCaseOpen ? true : undefined} inert={selectedCaseOpen ? true : undefined}>
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
            <div className="workspace-inbox-controls" aria-hidden={selectedCaseOpen ? true : undefined} inert={selectedCaseOpen ? true : undefined}>
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
                aria-hidden={selectedCaseOpen ? true : undefined}
                inert={selectedCaseOpen ? true : undefined}
              >
                <div className="workspace-queue-surface">
                  <div className="workspace-plane-header workspace-queue-header"><span>Verification queue</span><span>{visibleGroups.length} in view</span></div>

                  <div className="workspace-queue-scroll">
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
              </div>

              <section
                className="workspace-case-surface"
                data-motion-state={selectedCaseMotion}
                data-view={selectedCaseView}
                role={selectedCaseOpen ? "dialog" : undefined}
                aria-modal={selectedCaseOpen ? true : undefined}
                aria-hidden={selectedCaseSurfaceViewport && !selectedCaseOpen ? true : undefined}
                inert={selectedCaseSurfaceViewport && !selectedCaseOpen}
                aria-labelledby="workspace-selected-case-title"
                ref={(element) => { selectedCaseNodeRef.current = element; }}
              >
                <header className="workspace-case-surface-bar">
                  <div className="workspace-case-surface-identity">
                    <span>Selected case</span>
                    <strong id="workspace-selected-case-title">{selectedGroup?.latest.metadata.title ?? "Verification case"}</strong>
                  </div>
                  <div className="workspace-case-surface-actions">
                    <div className="workspace-case-view-tabs" aria-label="Selected case detail view">
                      <button type="button" aria-pressed={selectedCaseView === "canvas"} aria-controls="workspace-selected-case-canvas" onClick={() => setSelectedCaseView("canvas")}>Canvas</button>
                      <button type="button" aria-pressed={selectedCaseView === "inspector"} aria-controls="workspace-selected-case-inspector" onClick={() => setSelectedCaseView("inspector")}>Inspector</button>
                    </div>
                    <button className="workspace-case-surface-close" type="button" ref={(element) => { selectedCaseCloseNodeRef.current = element; }} onClick={() => closeSelectedCase()} aria-label="Close selected case">
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                    </button>
                  </div>
                </header>

                <WorkspaceCanvas
                  group={selectedGroup}
                  conditionProgressLabel={selectedGroup ? conditionProgressByGroup[selectedGroup.key] ?? "No merge conditions" : "No merge conditions"}
                  onOpen={openReport}
                  onFocusChange={handleFocusChange}
                />

                <WorkspaceInspector
                  group={selectedGroup}
                  activeFocus={activeFocus}
                  copyFeedback={copyFeedback}
                  conditionProgressLabel={selectedGroup ? conditionProgressByGroup[selectedGroup.key] ?? "No merge conditions" : "No merge conditions"}
                  workspace={currentWorkspace}
                  onOpen={openReport}
                  onCopyConditions={copyConditions}
                  onDeleteGroup={deleteGroup}
                  onStatusChange={updateLocalStatus}
                  onOwnerChange={updateLocalOwner}
                />
              </section>
            </div>

            {selectedCaseOpen && (
              <button
                className="workspace-case-surface-backdrop"
                type="button"
                aria-label="Close selected case"
                tabIndex={-1}
                onClick={() => closeSelectedCase()}
              />
            )}
          </section>
        ) : (
          <section className="workspace-workbench workspace-workbench--empty" aria-label="Empty verification workbench">
            <div className="workspace-empty-pane workspace-empty-queue">
              <div className="workspace-plane-header"><span>Verification queue</span><span>Local</span></div>
              <p>Reports checked in this browser appear here as an ordered verification queue.</p>
            </div>
            <div className="workspace-empty-pane workspace-empty-canvas">
              <div className="workspace-plane-header"><span>Working canvas</span><span>Case flow</span></div>
              <h2>Start with a change that needs judgment</h2>
              <p>Selecting a stored report keeps the change, observed evidence, requirements and current human-decision state together.</p>
              <div className="workspace-empty-actions">
                <Link className="workspace-primary-action" href="/new">New Review</Link>
                <Link className="workspace-secondary-action" href="/report?demo=1">Sample Case File</Link>
              </div>
            </div>
            <div className="workspace-empty-pane workspace-empty-inspector">
              <div className="workspace-plane-header"><span>Context inspector</span><span>Selection</span></div>
              <p>When a case is selected, this plane holds its provenance, requirements, clearance context and local ownership.</p>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
