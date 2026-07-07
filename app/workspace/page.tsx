"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import {
  clearReportHistory,
  deleteReportFromHistory,
  readReportHistory,
  type ReportHistoryEntry,
} from "../../lib/report-history";
import { conditionsToMarkdown } from "../../lib/report-markdown";
import { decisionConditions, pruneUnsupportedReviewerFocus } from "../../lib/report-quality";

const WORKSPACE_STATUS_STORAGE_KEY = "lintel.workspaceStatus.v1";

const LOCAL_STATUSES = ["Needs work", "Conditions met", "Merged", "Dismissed"] as const;
const FILTERS = [
  ["all", "All"],
  ["attention", "Needs attention"],
  ["tests", "Tests required"],
  ["review", "Review required"],
  ["ready", "Ready"],
] as const;

type LocalStatus = (typeof LOCAL_STATUSES)[number];
type WorkspaceFilter = (typeof FILTERS)[number][0];
type CopyFeedback = { key: string; state: "copied" | "failed" } | null;

type WorkspaceGroup = {
  key: string;
  latest: ReportHistoryEntry;
  entries: ReportHistoryEntry[];
  status: LocalStatus;
};

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

function isLocalStatus(value: unknown): value is LocalStatus {
  return typeof value === "string" && (LOCAL_STATUSES as readonly string[]).includes(value);
}

function defaultStatus(entry: ReportHistoryEntry): LocalStatus {
  return entry.metadata.recommendation === "APPROVE" ? "Conditions met" : "Needs work";
}

function groupIdentity(entry: ReportHistoryEntry) {
  return [
    entry.metadata.repository,
    entry.metadata.title,
    entry.inputLabel,
  ].map((value) => value.trim().toLowerCase().replace(/\s+/g, " ")).join("\u001f");
}

function readWorkspaceStatuses(storage: Storage) {
  try {
    const stored = storage.getItem(WORKSPACE_STATUS_STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isLocalStatus(value)),
    ) as Record<string, LocalStatus>;
  } catch {
    return {};
  }
}

function writeWorkspaceStatuses(storage: Storage, statuses: Record<string, LocalStatus>) {
  storage.setItem(WORKSPACE_STATUS_STORAGE_KEY, JSON.stringify(statuses));
}

function groupHistory(entries: ReportHistoryEntry[], statuses: Record<string, LocalStatus>): WorkspaceGroup[] {
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
      status: statuses[key] ?? defaultStatus(latest),
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

function groupMatchesFilter(group: WorkspaceGroup, filter: WorkspaceFilter) {
  const recommendation = group.latest.metadata.recommendation;

  if (filter === "all") return true;
  if (filter === "attention") return recommendation === "TESTS_REQUIRED" || recommendation === "REVIEW_REQUIRED" || recommendation === "BLOCK";
  if (filter === "tests") return recommendation === "TESTS_REQUIRED";
  if (filter === "review") return recommendation === "REVIEW_REQUIRED";
  if (filter === "ready") return recommendation === "APPROVE";
  return true;
}

function topConditionOrRisk(entry: ReportHistoryEntry) {
  const report = entry.report;
  const conditions = report.verdict.recommendation === "APPROVE"
    ? []
    : decisionConditions(report.conditionsBeforeMerge);

  if (conditions.length > 0) return conditions[0];
  if (report.findings.length > 0) return report.findings[0].title;
  return "No merge conditions detected.";
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
  onOpen,
  onCopyConditions,
  onDeleteGroup,
  onStatusChange,
}: {
  group: WorkspaceGroup;
  copyFeedback: CopyFeedback;
  onOpen: (entry: ReportHistoryEntry) => void;
  onCopyConditions: (group: WorkspaceGroup) => void;
  onDeleteGroup: (group: WorkspaceGroup) => void;
  onStatusChange: (group: WorkspaceGroup, status: LocalStatus) => void;
}) {
  const entry = group.latest;
  const report = entry.report;
  const focus = pruneUnsupportedReviewerFocus(report) ?? [];
  const focusLabel = focus.length > 0
    ? focus.slice(0, 2).map((item) => item.area).join(" · ")
    : "No specialist focus";
  const feedback = copyFeedback?.key === group.key ? copyFeedback.state : null;

  return (
    <article className={`workspace-inbox-card workspace-inbox-card--${entry.metadata.recommendation.toLowerCase()}`}>
      <div className="workspace-inbox-main">
        <div>
          <div className="workspace-card-overline">
            <span>{entry.metadata.repository}</span>
            {group.entries.length > 1 && <strong>{group.entries.length} runs</strong>}
          </div>
          <h3>{entry.metadata.title}</h3>
          <p>{topConditionOrRisk(entry)}</p>
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
        <span>{focus.length} {focus.length === 1 ? "focus area" : "focus areas"} / {focusLabel}</span>
        <time dateTime={entry.createdAt}>Latest {createdTime(entry.createdAt)}</time>
      </div>

      <div className="workspace-card-footer">
        <label className="workspace-local-status">
          <span>Local status</span>
          <select value={group.status} onChange={(event) => onStatusChange(group, event.target.value as LocalStatus)}>
            {LOCAL_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <div className="workspace-row-actions">
          <button type="button" onClick={() => onOpen(entry)}>Open</button>
          <button type="button" onClick={() => onCopyConditions(group)}>
            {feedback === "copied" ? "Copied" : feedback === "failed" ? "Copy failed" : "Copy conditions"}
          </button>
          <button
            className="workspace-delete"
            type="button"
            onClick={() => onDeleteGroup(group)}
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
  onOpen: (entry: ReportHistoryEntry) => void;
  onCopyConditions: (group: WorkspaceGroup) => void;
  onDeleteGroup: (group: WorkspaceGroup) => void;
  onStatusChange: (group: WorkspaceGroup, status: LocalStatus) => void;
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

export default function ReportsWorkspacePage() {
  const router = useRouter();
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [statuses, setStatuses] = useState<Record<string, LocalStatus>>({});
  const [activeFilter, setActiveFilter] = useState<WorkspaceFilter>("all");
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>(null);
  const [error, setError] = useState<string | null>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      setHistory(readReportHistory(window.localStorage));
      setStatuses(readWorkspaceStatuses(window.localStorage));
    } catch {
      setHistory([]);
      setStatuses({});
      setError("Local report history is unavailable in this browser.");
    }
  }, []);

  useEffect(() => () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
  }, []);

  const groups = useMemo(() => groupHistory(history, statuses), [history, statuses]);
  const filteredGroups = groups.filter((group) => groupMatchesFilter(group, activeFilter));
  const needsAttention = sortByRiskThenRecency(filteredGroups.filter((group) => (
    group.latest.metadata.recommendation === "TESTS_REQUIRED"
    || group.latest.metadata.recommendation === "REVIEW_REQUIRED"
    || group.latest.metadata.recommendation === "BLOCK"
  )));
  const ready = filteredGroups
    .filter((group) => group.latest.metadata.recommendation === "APPROVE")
    .sort((a, b) => Date.parse(b.latest.createdAt) - Date.parse(a.latest.createdAt));
  const trackedCount = groups.length;
  const needsAttentionCount = groups.filter((group) => group.latest.metadata.recommendation !== "APPROVE").length;
  const testsRequiredCount = groups.filter((group) => group.latest.metadata.recommendation === "TESTS_REQUIRED").length;
  const readyCount = groups.filter((group) => group.latest.metadata.recommendation === "APPROVE").length;

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

  function updateLocalStatus(group: WorkspaceGroup, status: LocalStatus) {
    const nextStatuses = { ...statuses, [group.key]: status };
    setStatuses(nextStatuses);

    try {
      writeWorkspaceStatuses(window.localStorage, nextStatuses);
      setError(null);
    } catch {
      setError("Local status could not be saved in this browser.");
    }
  }

  function deleteGroup(group: WorkspaceGroup) {
    try {
      let nextHistory = history;

      for (const entry of group.entries) {
        nextHistory = deleteReportFromHistory(window.localStorage, entry.createdAt);
      }

      const nextStatuses = { ...statuses };
      delete nextStatuses[group.key];
      setHistory(nextHistory);
      setStatuses(nextStatuses);
      writeWorkspaceStatuses(window.localStorage, nextStatuses);
      setError(null);
    } catch {
      setError("This report group could not be deleted.");
    }
  }

  function clearHistory() {
    try {
      setHistory(clearReportHistory(window.localStorage));
      setStatuses({});
      window.localStorage.removeItem(WORKSPACE_STATUS_STORAGE_KEY);
      setError(null);
    } catch {
      setError("Report history could not be cleared.");
    }
  }

  return (
    <div className="app-shell workspace-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lintel</span>
        </Link>
        <nav className="side-nav" aria-label="Primary navigation">
          <Link className="nav-item" href="/new">New report</Link>
          <Link className="nav-item nav-item--active" href="/workspace" aria-current="page">Reports workspace</Link>
          <Link className="nav-item" href="/report?demo=1">Demo report</Link>
        </nav>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Local reports</span></div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">LOCAL MERGE READINESS</span>
            <h1>Risk inbox</h1>
            <p>Track local pull request reports by readiness state. Reports stay on this device and raw diffs are not saved in local history.</p>
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
              <article><span>Ready</span><strong>{readyCount}</strong></article>
              <article><span>Tracked PRs</span><strong>{trackedCount}</strong></article>
            </div>

            <div className="workspace-filters" aria-label="Filter reports">
              {FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  className={activeFilter === value ? "workspace-filter workspace-filter--active" : "workspace-filter"}
                  type="button"
                  onClick={() => setActiveFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <WorkspaceSection
              title="Needs attention"
              description="Reports with tests required, focused review, or blocking risk."
              groups={needsAttention}
              emptyCopy="No blocked or attention-required PRs match this filter."
              copyFeedback={copyFeedback}
              onOpen={openReport}
              onCopyConditions={copyConditions}
              onDeleteGroup={deleteGroup}
              onStatusChange={updateLocalStatus}
            />

            <WorkspaceSection
              title="Ready / cleared"
              description="Reports currently approved by the latest local merge-readiness run."
              groups={ready}
              emptyCopy="No ready PRs match this filter yet."
              copyFeedback={copyFeedback}
              onOpen={openReport}
              onCopyConditions={copyConditions}
              onDeleteGroup={deleteGroup}
              onStatusChange={updateLocalStatus}
            />
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
