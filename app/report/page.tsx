"use client";

import { useEffect, useRef, useState } from "react";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import { conditionsToMarkdown, findingProvenanceLabel, reportMarkdownFilename, reportToMarkdown, type ReportSourceLabel } from "../../lib/report-markdown";
import type { FindingSeverity, Recommendation, Report, ReviewArea, RiskLevel } from "../../lib/mock-report";
import { report as demoReport } from "../../lib/mock-report";
import { decisionConditions, deduplicateReportItems, pruneUnsupportedReviewerFocus } from "../../lib/report-quality";
import { reviewProfileLabel } from "../../lib/review-profiles";

type GeneratedReportSource = "ai" | "deterministic";
type ReportSource = GeneratedReportSource | "demo";
type CopyState = "idle" | "copied" | "failed";
type DownloadState = "idle" | "downloaded" | "failed";

type StoredReport = {
  report: Report;
  source: GeneratedReportSource;
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

function SourceBadge({ source }: { source: ReportSource }) {
  return <span className={`source-badge source-badge--${source}`}>{sourceLabels[source]}</span>;
}

export default function ReportPage() {
  const [displayedReport, setDisplayedReport] = useState<{ report: Report; source: ReportSource }>({
    report: demoReport,
    source: "demo",
  });
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [conditionsCopyState, setConditionsCopyState] = useState<CopyState>("idle");
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conditionsCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") return;

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
    if (conditionsCopyResetTimer.current) clearTimeout(conditionsCopyResetTimer.current);
    if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
  }, []);

  const { report, source } = displayedReport;
  const { pr, verdict } = report;
  const supportedReviewerFocus = pruneUnsupportedReviewerFocus(report);
  const displayedConditions = verdict.recommendation === "APPROVE"
    ? []
    : decisionConditions(report.conditionsBeforeMerge);
  const findingTitles = report.findings.map((finding) => finding.title);
  const cleanApprove = verdict.recommendation === "APPROVE"
    && report.findings.length === 0
    && report.missingTests.length === 0
    && report.suggestedTests.length === 0
    && report.operationalReadiness?.status === "CLEAR";
  const displayedReviewerChecklist = cleanApprove ? [] : report.reviewerChecklist;

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

  function handleDownloadMarkdown() {
    const markdown = reportToMarkdown(report, sourceLabels[source]);
    const downloaded = downloadMarkdown(markdown, reportMarkdownFilename(report));
    setDownloadState(downloaded ? "downloaded" : "failed");

    if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
    downloadResetTimer.current = setTimeout(() => setDownloadState("idle"), 2_000);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true">◢</span>
          <span>Lintel</span>
        </a>
        <nav className="side-nav" aria-label="Primary navigation">
          <a className="nav-item" href="/new"><span aria-hidden="true">＋</span>New report</a>
          <a className={`nav-item${source !== "demo" ? " nav-item--active" : ""}`} href="/workspace"><span aria-hidden="true">▦</span>Reports workspace</a>
          <a className={`nav-item${source === "demo" ? " nav-item--active" : ""}`} href="/report?demo=1"><span aria-hidden="true">◇</span>Demo report</a>
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
            <button
              className={`download-markdown-button download-markdown-button--${downloadState}`}
              type="button"
              onClick={handleDownloadMarkdown}
              aria-live="polite"
            >
              {downloadLabels[downloadState]}
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
                <span>{pr.repository}</span><span className="meta-separator">•</span><span>{inputSourceLabel(pr.branch)}</span><span className="meta-separator">•</span><span>Profile: {reviewProfileLabel(pr.reviewProfile)}</span><span className="meta-separator">•</span><span>{pr.language}</span><span className="meta-separator">•</span><span>{pr.framework}</span>
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
                <span className="risk-score-detail">Score detail: {verdict.riskScore}/100</span>
              </div>
            </article>
            <article className="summary-card">
              <div className="section-heading"><div><span className="card-kicker">EXECUTIVE SUMMARY</span><h2>{recommendationHeadings[verdict.recommendation]}</h2></div><span className="confidence">Confidence: {verdict.confidence}</span></div>
              <p>{verdict.summary}</p>
            </article>
          </section>

          <section className="merge-conditions" aria-labelledby="merge-conditions-title">
            <div className="section-heading">
              <div><span className="card-kicker">DECISION GATE</span><h2 id="merge-conditions-title">Conditions before merge</h2></div>
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
            {displayedConditions.length > 0 ? (
              <ol>{displayedConditions.map((condition) => <li key={condition}>{condition}</li>)}</ol>
            ) : <p className="merge-conditions-clear">No merge conditions detected.</p>}
          </section>

          <section className="section-block report-findings">
            <div className="section-heading"><div><span className="card-kicker">PRIORITY ITEMS</span><h2>Risk findings</h2></div><span className="section-count">{report.findings.length} findings</span></div>
            {report.findings.length > 0 ? <div className="findings-list">
              {report.findings.map((finding, index) => (
                <article className="finding" key={finding.title}>
                  <div className="finding-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="finding-content"><div className="finding-title"><SeverityTag severity={finding.severity} /><h3>{finding.title}</h3>{finding.provenance && <span className={`finding-provenance finding-provenance--${findingProvenanceLabel(finding.provenance).toLowerCase().replaceAll(" ", "-")}`}>{findingProvenanceLabel(finding.provenance)}</span>}</div><p><strong>Evidence:</strong> {finding.evidence}</p><p><strong>Action:</strong> {finding.action}</p>{finding.file && <code>{finding.file}</code>}</div>
                  <span className="finding-category">{finding.category}</span>
                </article>
              ))}
            </div> : <p className="section-empty">No risk findings detected.</p>}
          </section>

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

          <section className="final-recommendation final-recommendation--compact">
            <div className="final-intro"><span className="card-kicker">CLOSING SUMMARY</span><h2>{recommendationHeadings[verdict.recommendation]}</h2></div>
            <p>{closingRecommendations[verdict.recommendation]}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
