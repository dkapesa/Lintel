"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import {
  clearReportHistory,
  deleteReportFromHistory,
  readReportHistory,
  type ReportHistoryEntry,
} from "../../lib/report-history";
import { pruneUnsupportedReviewerFocus } from "../../lib/report-quality";

function sourceLabel(source: ReportHistoryEntry["source"]) {
  return source === "ai" ? "AI generated" : "Local fallback";
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

export default function ReportsWorkspacePage() {
  const router = useRouter();
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setHistory(readReportHistory(window.localStorage));
    } catch {
      setHistory([]);
      setError("Local report history is unavailable in this browser.");
    }
  }, []);

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

  function deleteReport(entry: ReportHistoryEntry) {
    try {
      setHistory(deleteReportFromHistory(window.localStorage, entry.createdAt));
      setError(null);
    } catch {
      setError("This saved report could not be deleted.");
    }
  }

  function clearHistory() {
    try {
      setHistory(clearReportHistory(window.localStorage));
      setError(null);
    } catch {
      setError("Report history could not be cleared.");
    }
  }

  return (
    <div className="app-shell workspace-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true">◢</span>
          <span>Lintel</span>
        </Link>
        <nav className="side-nav" aria-label="Primary navigation">
          <Link className="nav-item" href="/new"><span aria-hidden="true">＋</span>New report</Link>
          <Link className="nav-item nav-item--active" href="/workspace" aria-current="page"><span aria-hidden="true">▦</span>Reports workspace</Link>
          <Link className="nav-item" href="/report?demo=1"><span aria-hidden="true">◇</span>Demo report</Link>
        </nav>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Local reports</span></div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">LOCAL WORKSPACE</span>
            <h1>Recent reports</h1>
            <p>Browse the last 10 reports generated in this browser.</p>
          </div>
          <div className="workspace-header-actions">
            {history.length > 0 && <button type="button" onClick={clearHistory}>Clear history</button>}
            <Link className="workspace-primary-action" href="/new">New report</Link>
          </div>
        </header>

        {error && <p className="workspace-error" role="alert">{error}</p>}

        {history.length > 0 ? (
          <section className="workspace-reports" aria-label="Recent reports">
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead>
                  <tr>
                    <th scope="col">Pull request</th>
                    <th scope="col">Decision</th>
                    <th scope="col">Readiness</th>
                    <th scope="col">Review routing</th>
                    <th scope="col">Context</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => {
                    const report = entry.report;
                    const focus = pruneUnsupportedReviewerFocus(report) ?? [];
                    const focusLabel = focus.length > 0
                      ? focus.slice(0, 2).map((item) => item.area).join(" · ")
                      : "No specialist focus";

                    return (
                      <tr key={entry.createdAt}>
                        <td data-label="Pull request">
                          <strong className="workspace-report-title">{entry.metadata.title}</strong>
                          <span className="workspace-report-repository">{entry.metadata.repository}</span>
                          <time dateTime={entry.createdAt}>{createdTime(entry.createdAt)}</time>
                        </td>
                        <td data-label="Decision">
                          <span className={`workspace-recommendation workspace-recommendation--${entry.metadata.recommendation.toLowerCase()}`}>
                            {recommendationLabel(entry.metadata.recommendation)}
                          </span>
                          <span className="workspace-risk">{entry.metadata.riskScore}/100 · {report.verdict.riskLevel}</span>
                        </td>
                        <td data-label="Readiness">
                          <span className={`workspace-status workspace-status--${report.operationalReadiness?.status.toLowerCase() ?? "legacy"}`}>
                            Operations: {report.operationalReadiness?.status ?? "Not assessed"}
                          </span>
                          <span className={`workspace-status workspace-status--${report.reportQuality?.status.toLowerCase() ?? "legacy"}`}>
                            Quality: {report.reportQuality?.status ?? "Not assessed"}
                          </span>
                        </td>
                        <td data-label="Review routing">
                          <strong>{focus.length} {focus.length === 1 ? "area" : "areas"}</strong>
                          <span>{focusLabel}</span>
                        </td>
                        <td data-label="Context">
                          <strong>{entry.metadata.reviewProfile}</strong>
                          <span>{entry.inputLabel} · {sourceLabel(entry.source)}</span>
                        </td>
                        <td className="workspace-row-actions" data-label="Actions">
                          <button type="button" onClick={() => openReport(entry)}>Open</button>
                          <button className="workspace-delete" type="button" onClick={() => deleteReport(entry)} aria-label={`Delete ${entry.metadata.title}`}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="workspace-empty">
            <span aria-hidden="true">◇</span>
            <h2>No reports yet</h2>
            <p>Generate a report from a pasted diff, built-in sample, or public GitHub pull request. It will appear here on this browser.</p>
            <Link className="workspace-primary-action" href="/new">Start new report</Link>
          </section>
        )}
      </main>
    </div>
  );
}
