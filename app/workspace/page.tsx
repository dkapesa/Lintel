"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  conditionKey,
  readConditionProgress,
  reportConditions,
  workspaceConditionProgressSummary,
} from "../../lib/condition-progress";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import {
  clearReportHistory,
  deleteReportFromHistory,
  readReportHistory,
  type ReportHistoryEntry,
} from "../../lib/report-history";
import { conditionsToMarkdown } from "../../lib/report-markdown";
import { pruneUnsupportedReviewerFocus } from "../../lib/report-quality";
import {
  clearReviewStates,
  defaultReviewState,
  readReviewStates,
  removeReviewState,
  REVIEW_STATUSES,
  reviewStateKey,
  type ReportReviewState,
  type ReviewStatus,
  writeReviewState,
} from "../../lib/review-state";

const QUEUES = [
  ["inbox", "Inbox"],
  ["needs-tests", "Needs tests"],
  ["needs-review", "Needs review"],
  ["operational-risk", "Operational risk"],
  ["ready", "Ready to merge"],
  ["reviewed", "Reviewed"],
] as const;

type WorkspaceQueue = (typeof QUEUES)[number][0];
type CopyFeedback = { key: string; state: "copied" | "failed" } | null;

type WorkspaceGroup = {
  key: string;
  latest: ReportHistoryEntry;
  entries: ReportHistoryEntry[];
  reviewState: ReportReviewState;
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

function WorkspaceReportCard({
  group,
  copyFeedback,
  conditionProgressLabel,
  isSelected,
  onSelect,
  onOpen,
  onCopyConditions,
  onDeleteGroup,
  onStatusChange,
}: {
  group: WorkspaceGroup;
  copyFeedback: CopyFeedback;
  conditionProgressLabel: string;
  isSelected: boolean;
  onSelect: (group: WorkspaceGroup) => void;
  onOpen: (entry: ReportHistoryEntry) => void;
  onCopyConditions: (group: WorkspaceGroup) => void;
  onDeleteGroup: (group: WorkspaceGroup) => void;
  onStatusChange: (group: WorkspaceGroup, status: ReviewStatus) => void;
}) {
  const entry = group.latest;
  const report = entry.report;
  const focus = pruneUnsupportedReviewerFocus(report) ?? [];
  const focusLabel = focus.length > 0
    ? focus.slice(0, 2).map((item) => item.area).join(" / ")
    : "No specialist focus";
  const feedback = copyFeedback?.key === group.key ? copyFeedback.state : null;
  const action = nextAction(entry);

  return (
    <article
      className={`workspace-inbox-card workspace-inbox-card--${entry.metadata.recommendation.toLowerCase()}${isSelected ? " workspace-inbox-card--selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Preview ${entry.metadata.title}`}
      aria-selected={isSelected}
      onClick={() => onSelect(group)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(group);
        }
      }}
    >
      <div className="workspace-inbox-main">
        <div>
          <div className="workspace-card-overline">
            <span>{entry.metadata.repository}</span>
            {group.entries.length > 1 && <strong>{group.entries.length} runs</strong>}
          </div>
          <h3>{entry.metadata.title}</h3>
          <p>{topConditionOrRisk(entry)}</p>
          <div className="workspace-next-action">
            <span>Next action</span>
            <strong>{action}</strong>
          </div>
        </div>
        <div className="workspace-card-decision">
          <span className={`workspace-recommendation workspace-recommendation--${entry.metadata.recommendation.toLowerCase()}`}>
            {recommendationLabel(entry.metadata.recommendation)}
          </span>
          <strong>{report.verdict.riskLevel} risk</strong>
          <span>{entry.metadata.riskScore}/100</span>
        </div>
      </div>

      <div className="workspace-card-meta">
        <span>{entry.inputLabel}</span>
        <span>{sourceLabel(entry.source)}</span>
        <span>Profile: {entry.metadata.reviewProfile}</span>
        <span className="workspace-condition-progress">{conditionProgressLabel}</span>
        <span className={entry.report.missingTests.length > 0 ? "workspace-signal workspace-signal--attention" : "workspace-signal"}>{testSignal(entry)}</span>
        <span className={hasOperationalRisk(entry) ? "workspace-signal workspace-signal--attention" : "workspace-signal"}>{operationalSignal(entry)}</span>
        <span className="workspace-review-state">{group.reviewState.status}</span>
        {group.reviewState.note.trim().length > 0 && <span>Local note</span>}
        {group.reviewState.updatedAt && <time dateTime={group.reviewState.updatedAt}>State saved {createdTime(group.reviewState.updatedAt)}</time>}
        <span>{focus.length} {focus.length === 1 ? "focus area" : "focus areas"} / {focusLabel}</span>
        <time dateTime={entry.createdAt}>Latest {createdTime(entry.createdAt)}</time>
      </div>

      <div className="workspace-card-footer">
        <label className="workspace-local-status" onClick={(event) => event.stopPropagation()}>
          <span>Review state</span>
          <select value={group.reviewState.status} onChange={(event) => onStatusChange(group, event.target.value as ReviewStatus)}>
            {REVIEW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <div className="workspace-row-actions">
          <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(entry); }}>Open</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); onCopyConditions(group); }}>
            {feedback === "copied" ? "Copied" : feedback === "failed" ? "Copy failed" : "Copy conditions"}
          </button>
          <button
            className="workspace-delete"
            type="button"
            onClick={(event) => { event.stopPropagation(); onDeleteGroup(group); }}
            aria-label={`Delete all local runs for ${entry.metadata.title}`}
          >
            Delete reports
          </button>
        </div>
      </div>
    </article>
  );
}

function WorkspaceSection({
  title,
  description,
  groups,
  emptyCopy,
  copyFeedback,
  conditionProgressByGroup,
  selectedGroupKey,
  onSelect,
  onOpen,
  onCopyConditions,
  onDeleteGroup,
  onStatusChange,
}: {
  title: string;
  description: string;
  groups: WorkspaceGroup[];
  emptyCopy: string;
  copyFeedback: CopyFeedback;
  conditionProgressByGroup: Record<string, string>;
  selectedGroupKey: string | null;
  onSelect: (group: WorkspaceGroup) => void;
  onOpen: (entry: ReportHistoryEntry) => void;
  onCopyConditions: (group: WorkspaceGroup) => void;
  onDeleteGroup: (group: WorkspaceGroup) => void;
  onStatusChange: (group: WorkspaceGroup, status: ReviewStatus) => void;
}) {
  return (
    <section className="workspace-inbox-section" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-title`}>
      <div className="workspace-section-heading">
        <div>
          <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        <span>{groups.length} {groups.length === 1 ? "PR" : "PRs"}</span>
      </div>

      {groups.length > 0 ? (
        <div className="workspace-inbox-list">
          {groups.map((group) => (
            <WorkspaceReportCard
              key={group.key}
              group={group}
              copyFeedback={copyFeedback}
              conditionProgressLabel={conditionProgressByGroup[group.key] ?? "No merge conditions detected."}
              isSelected={selectedGroupKey === group.key}
              onSelect={onSelect}
              onOpen={onOpen}
              onCopyConditions={onCopyConditions}
              onDeleteGroup={onDeleteGroup}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <p className="workspace-section-empty">{emptyCopy}</p>
      )}
    </section>
  );
}

function WorkspacePreviewPanel({
  group,
  copyFeedback,
  conditionProgressLabel,
  onOpen,
  onCopyConditions,
  onDeleteGroup,
}: {
  group: WorkspaceGroup | null;
  copyFeedback: CopyFeedback;
  conditionProgressLabel: string;
  onOpen: (entry: ReportHistoryEntry) => void;
  onCopyConditions: (group: WorkspaceGroup) => void;
  onDeleteGroup: (group: WorkspaceGroup) => void;
}) {
  if (!group) {
    return (
      <aside className="workspace-preview workspace-preview--empty" aria-label="Selected report preview">
        <span className="workspace-preview-kicker">Decision preview</span>
        <h2>No report selected</h2>
        <p>Select a report row to preview its merge-readiness decision without leaving the risk inbox.</p>
      </aside>
    );
  }

  const entry = group.latest;
  const report = entry.report;
  const conditions = reportConditions(report);
  const visibleConditions = conditions.slice(0, 4);
  const focus = pruneUnsupportedReviewerFocus(report) ?? [];
  const qualityStatus = report.reportQuality?.status ?? "Not assessed";
  const operationalStatus = report.operationalReadiness?.status ?? "Not assessed";
  const topRisk = report.findings[0]?.title ?? topConditionOrRisk(entry);
  const feedback = copyFeedback?.key === group.key ? copyFeedback.state : null;
  const action = nextAction(entry);

  return (
    <aside className="workspace-preview" aria-label="Selected report preview">
      <div className="workspace-preview-header">
        <span className="workspace-preview-kicker">Decision preview</span>
        <span className={`workspace-recommendation workspace-recommendation--${entry.metadata.recommendation.toLowerCase()}`}>
          {recommendationLabel(entry.metadata.recommendation)}
        </span>
      </div>

      <h2>{entry.metadata.title}</h2>
      <p className="workspace-preview-repo">{entry.metadata.repository}</p>

      <div className="workspace-preview-risk">
        <strong>{report.verdict.riskLevel} risk</strong>
        <span>{entry.metadata.riskScore}/100 score detail</span>
      </div>

      <dl className="workspace-preview-meta">
        <div><dt>Profile</dt><dd>{entry.metadata.reviewProfile}</dd></div>
        <div><dt>Review state</dt><dd>{group.reviewState.status}</dd></div>
        <div><dt>Input</dt><dd>{inputPreviewLabel(entry)}</dd></div>
        <div><dt>Mode</dt><dd>{sourceLabel(entry.source)}</dd></div>
        <div><dt>Latest</dt><dd><time dateTime={entry.createdAt}>{createdTime(entry.createdAt)}</time></dd></div>
        <div><dt>Local update</dt><dd>{group.reviewState.updatedAt ? createdTime(group.reviewState.updatedAt) : "Not saved yet"}</dd></div>
      </dl>

      <section className="workspace-preview-block">
        <div className="workspace-preview-block-heading">
          <h3>Next action</h3>
          <span>{action}</span>
        </div>
        <p>{topConditionOrRisk(entry)}</p>
      </section>

      <section className="workspace-preview-block">
        <div className="workspace-preview-block-heading">
          <h3>Conditions before merge</h3>
          <span>{conditionProgressLabel}</span>
        </div>
        {conditions.length > 0 ? (
          <>
            <ol className="workspace-preview-conditions">
              {visibleConditions.map((condition) => <li key={condition}>{condition}</li>)}
            </ol>
            {conditions.length > visibleConditions.length && (
              <p className="workspace-preview-more">+{conditions.length - visibleConditions.length} more conditions</p>
            )}
          </>
        ) : (
          <p>No merge conditions detected.</p>
        )}
      </section>

      <section className="workspace-preview-block">
        <h3>Top risk</h3>
        <p>{topRisk}</p>
      </section>

      <div className="workspace-preview-stats" aria-label="Selected report status">
        <div><span>Test signal</span><strong>{testSignal(entry)}</strong></div>
        <div><span>Operations</span><strong>{operationalStatus}</strong></div>
        <div><span>Quality</span><strong>{qualityStatus}</strong></div>
      </div>

      <section className="workspace-preview-block">
        <h3>Reviewer focus</h3>
        {focus.length > 0 ? (
          <div className="workspace-preview-focus">
            {focus.slice(0, 4).map((item) => <span key={`${item.area}-${item.priority}`}>{item.priority}: {item.area}</span>)}
          </div>
        ) : (
          <p>No specialist focus detected.</p>
        )}
      </section>

      <section className="workspace-preview-block">
        <h3>Local reviewer note</h3>
        <p>{group.reviewState.note.trim() || "No local note saved for this report."}</p>
      </section>

      <div className="workspace-preview-actions">
        <button type="button" onClick={() => onOpen(entry)}>Open full report</button>
        <button type="button" onClick={() => onCopyConditions(group)}>
          {feedback === "copied" ? "Copied" : feedback === "failed" ? "Copy failed" : "Copy conditions"}
        </button>
        <button className="workspace-delete" type="button" onClick={() => onDeleteGroup(group)}>Delete reports</button>
      </div>
    </aside>
  );
}

export default function ReportsWorkspacePage() {
  const router = useRouter();
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [reviewStates, setReviewStates] = useState<Record<string, ReportReviewState>>({});
  const [conditionProgressByGroup, setConditionProgressByGroup] = useState<Record<string, string>>({});
  const [activeQueue, setActiveQueue] = useState<WorkspaceQueue>("inbox");
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>(null);
  const [error, setError] = useState<string | null>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      setHistory(readReportHistory(window.localStorage));
      setReviewStates(readReviewStates(window.localStorage));
    } catch {
      setHistory([]);
      setReviewStates({});
      setError("Local report history is unavailable in this browser.");
    }
  }, []);

  useEffect(() => () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
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

    setSelectedGroupKey((current) => (
      current && visibleGroups.some((group) => group.key === current)
        ? current
        : visibleGroups[0].key
    ));
  }, [visibleGroups]);

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
      const nextState = writeReviewState(window.localStorage, group.key, {
        ...group.reviewState,
        status,
      });
      setReviewStates((current) => ({ ...current, [group.key]: nextState }));
      setError(null);
    } catch {
      setError("Local review state could not be saved in this browser.");
    }
  }

  function deleteGroup(group: WorkspaceGroup) {
    try {
      let nextHistory = history;

      for (const entry of group.entries) {
        nextHistory = deleteReportFromHistory(window.localStorage, entry.createdAt);
      }

      setHistory(nextHistory);
      setReviewStates((current) => {
        const nextStates = { ...current };
        delete nextStates[group.key];
        return nextStates;
      });
      removeReviewState(window.localStorage, group.key);
      setError(null);
    } catch {
      setError("This report group could not be deleted.");
    }
  }

  function clearHistory() {
    try {
      setHistory(clearReportHistory(window.localStorage));
      setReviewStates({});
      clearReviewStates(window.localStorage);
      setError(null);
    } catch {
      setError("Report history could not be cleared.");
    }
  }

  return (
    <div className="app-shell workspace-shell">
      <aside className="sidebar workspace-sidebar">
        <Link className="brand workspace-brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lintel</span>
        </Link>
        <nav className="side-nav workspace-side-nav" aria-label="Primary navigation">
          <span className="workspace-nav-label">Workspace</span>
          <Link className="nav-item workspace-nav-item" href="/new">New report</Link>
          <Link className="nav-item workspace-nav-item nav-item--active" href="/workspace" aria-current="page">Risk inbox</Link>
          <Link className="nav-item workspace-nav-item" href="/report">Reports</Link>
          <span className="workspace-nav-label">Evidence</span>
          <Link className="nav-item workspace-nav-item" href="/docs/evaluation-results.md">Evaluation</Link>
          <Link className="nav-item workspace-nav-item" href="/docs/security-model.md">Security model</Link>
        </nav>
        <div className="workspace-sidebar-panel">
          <span>Risk inbox</span>
          <p>Track merge conditions, reviewer focus and PR readiness locally. Raw diffs are not saved in history.</p>
        </div>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Local reports</span></div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-header workspace-header--app">
          <div className="workspace-header-copy">
            <span className="eyebrow">LOCAL MERGE READINESS</span>
            <h1>Risk inbox</h1>
            <p>Review what is blocked, waiting on tests, or ready to merge. Reports stay on this device and raw diffs are not saved in local history.</p>
            <span className="workspace-header-note">Local-first / raw-diff-free history / <Link href="/docs/security-model.md">Security model</Link></span>
          </div>
          <div className="workspace-header-actions">
            {history.length > 0 && <button type="button" onClick={clearHistory}>Clear history</button>}
            <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
          </div>
        </header>

        {error && <p className="workspace-error" role="alert">{error}</p>}

        {history.length > 0 ? (
          <section className="workspace-inbox" aria-label="Local merge-readiness inbox">
            <div className="workspace-triage-strip" aria-label="Workspace summary">
              <article><span>Needs attention</span><strong>{needsAttentionCount}</strong></article>
              <article><span>Tests required</span><strong>{testsRequiredCount}</strong></article>
              <article><span>Operational risk</span><strong>{operationalRiskCount}</strong></article>
              <article><span>Ready</span><strong>{readyCount}</strong></article>
            </div>

            <div className="workspace-queue-tabs" aria-label="Review queues">
              {QUEUES.map(([value, label]) => (
                <button
                  key={value}
                  className={activeQueue === value ? "workspace-queue-tab workspace-queue-tab--active" : "workspace-queue-tab"}
                  type="button"
                  onClick={() => setActiveQueue(value)}
                >
                  <span>{label}</span>
                  <strong>{queueCounts[value]}</strong>
                </button>
              ))}
            </div>

            <div className="workspace-split-view">
              <div className="workspace-list-pane">
                <WorkspaceSection
              title="Needs attention"
              description="Reports with tests required, focused review, unresolved conditions or blocking risk."
                  groups={needsAttention}
                  emptyCopy="No blocked or attention-required PRs match this filter."
                  copyFeedback={copyFeedback}
                  conditionProgressByGroup={conditionProgressByGroup}
                  selectedGroupKey={selectedGroupKey}
                  onSelect={(group) => setSelectedGroupKey(group.key)}
                  onOpen={openReport}
                  onCopyConditions={copyConditions}
                  onDeleteGroup={deleteGroup}
                  onStatusChange={updateLocalStatus}
                />

                <WorkspaceSection
                  title="Ready / reviewed"
                  description="Reports marked ready, reviewed, archived or currently approved by the latest local run."
                  groups={ready}
                  emptyCopy="No ready PRs match this filter yet."
                  copyFeedback={copyFeedback}
                  conditionProgressByGroup={conditionProgressByGroup}
                  selectedGroupKey={selectedGroupKey}
                  onSelect={(group) => setSelectedGroupKey(group.key)}
                  onOpen={openReport}
                  onCopyConditions={copyConditions}
                  onDeleteGroup={deleteGroup}
                  onStatusChange={updateLocalStatus}
                />
              </div>

              <WorkspacePreviewPanel
                group={selectedGroup}
                copyFeedback={copyFeedback}
                conditionProgressLabel={selectedGroup ? conditionProgressByGroup[selectedGroup.key] ?? "No merge conditions detected." : "No merge conditions detected."}
                onOpen={openReport}
                onCopyConditions={copyConditions}
                onDeleteGroup={deleteGroup}
              />
            </div>
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
      </main>
    </div>
  );
}
