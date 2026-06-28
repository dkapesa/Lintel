"use client";

import { useEffect, useRef, useState } from "react";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import { reportToMarkdown, type ReportSourceLabel } from "../../lib/report-markdown";
import type { FindingSeverity, Recommendation, Report, ReviewArea, RiskLevel } from "../../lib/mock-report";
import { report as demoReport } from "../../lib/mock-report";

type GeneratedReportSource = "ai" | "deterministic";
type ReportSource = GeneratedReportSource | "demo";
type CopyState = "idle" | "copied" | "failed";

type StoredReport = {
  report: Report;
  source: GeneratedReportSource;
};

const sourceLabels: Record<ReportSource, ReportSourceLabel> = {
  ai: "AI generated",
  deterministic: "Local fallback",
  demo: "Demo report",
};

const copyLabels: Record<CopyState, string> = {
  idle: "Copy summary",
  copied: "Copied",
  failed: "Copy failed",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReport(value: unknown): value is Report {
  return isRecord(value)
    && isRecord(value.pr)
    && typeof value.pr.title === "string"
    && isRecord(value.verdict)
    && typeof value.verdict.recommendation === "string"
    && Array.isArray(value.findings);
}

function isStoredReport(value: unknown): value is StoredReport {
  return isRecord(value)
    && (value.source === "ai" || value.source === "deterministic")
    && isReport(value.report);
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

function displayLabel(value: string) {
  return value.replaceAll("_", " ");
}

const recommendationHeadings: Record<Recommendation, string> = {
  APPROVE: "Ready for final review",
  REVIEW_REQUIRED: "Review required before merge",
  TESTS_REQUIRED: "Tests required before merge",
  BLOCK: "Do not merge",
};

function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  return <span className={`recommendation recommendation--${recommendation.toLowerCase()}`}>{displayLabel(recommendation)}</span>;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-badge risk-badge--${risk.toLowerCase()}`}>{risk}</span>;
}

function ReviewCard({ title, review }: { title: string; review: ReviewArea }) {
  return (
    <article className="review-card">
      <div className="section-heading section-heading--compact">
        <h3>{title}</h3>
        <span className={`review-status review-status--${review.status.toLowerCase()}`}>{review.status}</span>
      </div>
      <p>{review.summary}</p>
      <ul className="review-points">
        {review.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </article>
  );
}

function SeverityTag({ severity }: { severity: FindingSeverity }) {
  return <span className={`severity severity--${severity.toLowerCase()}`}>{severity}</span>;
}

function SourceBadge({ source }: { source: ReportSource }) {
  return <span className={`source-badge source-badge--${source}`}>{sourceLabels[source]}</span>;
}

export default function ReportPage() {
  const [displayedReport, setDisplayedReport] = useState<{ report: Report; source: ReportSource }>({
    report: demoReport,
    source: "demo",
  });
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedReport = sessionStorage.getItem(GENERATED_REPORT_STORAGE_KEY);

    if (!storedReport) return;

    try {
      const parsedReport: unknown = JSON.parse(storedReport);

      if (isStoredReport(parsedReport)) {
        setDisplayedReport(parsedReport);
        return;
      }

      if (isReport(parsedReport)) {
        setDisplayedReport({ report: parsedReport, source: "deterministic" });
        return;
      }

      sessionStorage.removeItem(GENERATED_REPORT_STORAGE_KEY);
    } catch {
      sessionStorage.removeItem(GENERATED_REPORT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
  }, []);

  const { report, source } = displayedReport;
  const { pr, verdict } = report;

  async function handleCopySummary() {
    const copied = await writeToClipboard(reportToMarkdown(report, sourceLabels[source]));
    setCopyState(copied ? "copied" : "failed");

    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    copyResetTimer.current = setTimeout(() => setCopyState("idle"), 2_000);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true">◢</span>
          <span>Lintel</span>
        </a>
        <nav className="side-nav" aria-label="Primary navigation">
          <a className="nav-item" href="/new"><span aria-hidden="true">⌘</span>New report</a>
          <a className="nav-item nav-item--active" href="#report"><span aria-hidden="true">◈</span>Reports</a>
          <a className="nav-item" href="#repository"><span aria-hidden="true">□</span>Repositories</a>
        </nav>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Engineering</span></div>
          <span aria-hidden="true">⌄</span>
        </div>
      </aside>

      <main className="main-content" id="report">
        <header className="topbar">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a href="#repository">{pr.project}</a><span>/</span><a href="#overview">Reports</a><span>/</span><strong>PR #{pr.number}</strong>
          </nav>
          <div className="topbar-actions">
            <SourceBadge source={source} />
            <button
              className={`copy-summary-button copy-summary-button--${copyState}`}
              type="button"
              onClick={handleCopySummary}
              aria-live="polite"
            >
              {copyLabels[copyState]}
            </button>
            <span className="sync-status"><i /> Analysed {pr.updatedAt}</span>
            <button className="icon-button" aria-label="More report actions">•••</button>
          </div>
        </header>

        <div className="report-content">
          <section className="report-header" id="overview">
            <div className="header-copy">
              <div className="header-overline"><span className="pull-request-mark">↗</span> PULL REQUEST #{pr.number}</div>
              <h1>{pr.title}</h1>
              <div className="report-meta">
                <span>{pr.repository}</span><span className="meta-separator">•</span><span>{pr.branch}</span><span className="meta-separator">•</span><span>{pr.language}</span><span className="meta-separator">•</span><span>{pr.framework}</span>
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
                <span className="card-kicker">RISK SCORE</span>
                <div className="score-row"><strong>{verdict.riskScore}</strong><span>/100</span></div>
                <div className="risk-line"><span className="risk-dot" /><span>{verdict.riskLevel} RISK</span></div>
              </div>
              <div className="score-gauge" aria-label={`Risk score ${verdict.riskScore} out of 100`}><span>{verdict.riskScore}</span></div>
            </article>
            <article className="summary-card">
              <div className="section-heading"><div><span className="card-kicker">EXECUTIVE SUMMARY</span><h2>What needs attention</h2></div><span className="confidence">Confidence: {verdict.confidence}</span></div>
              <p>{verdict.summary}</p>
            </article>
          </section>

          <section className="section-block">
            <div className="section-heading"><div><span className="card-kicker">CHANGESET</span><h2>Changed files</h2></div><span className="section-count">{report.changedFiles.length} files</span></div>
            <div className="file-list">
              {report.changedFiles.map((file) => (
                <div className="file-row" key={file.path}>
                  <span className="file-icon" aria-hidden="true">▱</span><code>{file.path}</code>{(file.additions !== undefined || file.deletions !== undefined || file.risk) && <div className="file-stats">{file.additions !== undefined && <span className="additions">+{file.additions}</span>}{file.deletions !== undefined && <span className="deletions">−{file.deletions}</span>}{file.risk && <RiskBadge risk={file.risk} />}</div>}
                </div>
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading"><div><span className="card-kicker">PRIORITY ITEMS</span><h2>Risk findings</h2></div><span className="section-count">{report.findings.length} findings</span></div>
            <div className="findings-list">
              {report.findings.map((finding, index) => (
                <article className="finding" key={finding.title}>
                  <div className="finding-index">0{index + 1}</div>
                  <div className="finding-content"><div className="finding-title"><SeverityTag severity={finding.severity} /><h3>{finding.title}</h3></div><p><strong>Evidence:</strong> {finding.evidence}</p><p><strong>Action:</strong> {finding.action}</p>{finding.file && <code>{finding.file}</code>}</div>
                  <span className="finding-category">{finding.category}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading"><div><span className="card-kicker">ENGINEERING REVIEW</span><h2>Change quality</h2></div></div>
            <div className="review-grid">
              <ReviewCard title="Security review" review={report.reviews.security} />
              <ReviewCard title="Reliability review" review={report.reviews.reliability} />
              <ReviewCard title="Maintainability review" review={report.reviews.maintainability} />
            </div>
          </section>

          <div className="two-column-section">
            <section className="section-block section-block--inset">
              <div className="section-heading"><div><span className="card-kicker">GAPS</span><h2>Missing tests</h2></div></div>
              {report.missingTests.length > 0 ? (
                <ol className="numbered-list">
                  {report.missingTests.map((test, index) => <li key={test}><span>{String(index + 1).padStart(2, "0")}</span>{test}</li>)}
                </ol>
              ) : (
                <p className="missing-tests-empty">
                  {source === "ai" ? "No missing test gaps detected." : "No missing test gaps detected by local rules."}
                </p>
              )}
            </section>
            <section className="section-block section-block--inset">
              <div className="section-heading"><div><span className="card-kicker">REVIEW PROGRESS</span><h2>Reviewer checklist</h2></div></div>
              <ul className="checklist">
                {report.reviewerChecklist.map((item) => <li key={item.label}><span className={`check-icon check-icon--${item.status.toLowerCase()}`}>{item.status === "COMPLETE" ? "✓" : "!"}</span><span>{item.label}</span></li>)}
              </ul>
            </section>
          </div>

          <section className="section-block">
            <div className="section-heading"><div><span className="card-kicker">TEST PLAN</span><h2>Suggested tests</h2></div></div>
            <div className="suggested-tests">
              {report.suggestedTests.map((test) => <article className="suggested-test" key={test.title}>{test.priority && <span className={`test-priority test-priority--${test.priority.toLowerCase()}`}>{test.priority}</span>}<h3>{test.title}</h3>{test.description && <p>{test.description}</p>}</article>)}
            </div>
          </section>

          <section className={`final-recommendation${report.conditionsBeforeMerge.length === 0 ? " final-recommendation--single" : ""}`}>
            <div className="final-intro"><span className="card-kicker">FINAL RECOMMENDATION</span><h2>{recommendationHeadings[verdict.recommendation]}</h2><p>{report.finalRecommendation}</p></div>
            {report.conditionsBeforeMerge.length > 0 && <div className="conditions"><h3>Conditions before merge</h3><ol>{report.conditionsBeforeMerge.map((condition) => <li key={condition}>{condition}</li>)}</ol></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
