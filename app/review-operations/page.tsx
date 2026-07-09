"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { reportConditions } from "../../lib/condition-progress";
import { report as demoReport, type Recommendation, type Report } from "../../lib/mock-report";
import { readReportHistory, type ReportHistoryEntry } from "../../lib/report-history";
import { pruneUnsupportedReviewerFocus } from "../../lib/report-quality";
import { reviewProfileLabel } from "../../lib/review-profiles";

const recommendationBuckets: Array<{ label: string; value: Recommendation; tone: string }> = [
  { label: "Ready to merge", value: "APPROVE", tone: "ready" },
  { label: "Tests required", value: "TESTS_REQUIRED", tone: "tests" },
  { label: "Review required", value: "REVIEW_REQUIRED", tone: "review" },
  { label: "Blocked", value: "BLOCK", tone: "blocked" },
];

const demoEntry: ReportHistoryEntry = {
  report: demoReport,
  source: "deterministic",
  inputLabel: "Demo report",
  createdAt: "2026-01-01T00:00:00.000Z",
  metadata: {
    title: demoReport.pr.title,
    repository: demoReport.pr.repository,
    recommendation: demoReport.verdict.recommendation,
    riskScore: demoReport.verdict.riskScore,
    reviewProfile: reviewProfileLabel(demoReport.pr.reviewProfile),
  },
};

function sourceLabel(source: ReportHistoryEntry["source"]) {
  return source === "ai" ? "Baseline + model-assisted" : "Baseline only";
}

function isHighRisk(report: Report) {
  return report.verdict.riskLevel === "HIGH" || report.verdict.riskLevel === "CRITICAL";
}

function hasOperationalRisk(report: Report) {
  return report.operationalReadiness?.status === "ATTENTION"
    || report.reviews.security.status === "ATTENTION"
    || report.reviews.reliability.status === "ATTENTION"
    || isHighRisk(report);
}

function countValues(values: string[]) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

function percent(count: number, total: number) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

function missingEvidence(report: Report) {
  return [
    ...report.missingTests.map((test) => `Missing test: ${test}`),
    ...reportConditions(report).map((condition) => `Merge condition: ${condition}`),
  ];
}

function operationalAttention(report: Report) {
  const items: string[] = [];

  if (report.operationalReadiness?.status === "ATTENTION") {
    items.push(...report.operationalReadiness.failureModes.map((item) => `Failure mode: ${item}`));
    items.push(...report.operationalReadiness.observabilityGaps.map((item) => `Observability gap: ${item}`));
    items.push(...report.operationalReadiness.recoveryOrRollback.map((item) => `Recovery/rollback: ${item}`));
    items.push(...report.operationalReadiness.customerOrDataImpact.map((item) => `Impact: ${item}`));
  }

  if (report.reviews.security.status === "ATTENTION") items.push(`Security attention: ${report.reviews.security.summary}`);
  if (report.reviews.reliability.status === "ATTENTION") items.push(`Reliability attention: ${report.reviews.reliability.summary}`);

  return items;
}

function recurringBlockers(report: Report) {
  return [
    ...reportConditions(report),
    ...report.missingTests,
    ...report.findings.map((finding) => finding.title),
  ];
}

function processSignals({
  totalReports,
  readyCount,
  testsRequiredCount,
  operationalRiskCount,
  highRiskCount,
  topMissingEvidence,
  topReviewerFocus,
}: {
  totalReports: number;
  readyCount: number;
  testsRequiredCount: number;
  operationalRiskCount: number;
  highRiskCount: number;
  topMissingEvidence: Array<{ label: string; count: number }>;
  topReviewerFocus: Array<{ label: string; count: number }>;
}) {
  const signals: string[] = [];

  if (testsRequiredCount > 0 && topMissingEvidence.length > 0) {
    signals.push("Test coverage is the most common merge-readiness blocker in the available reports.");
  }

  if (operationalRiskCount > 0) {
    signals.push("Operational readiness is recurring enough to review failure modes, detection and rollback earlier.");
  }

  if (topReviewerFocus[0]) {
    signals.push(`${topReviewerFocus[0].label} is the most common reviewer focus area in this local workspace.`);
  }

  if (highRiskCount > 0) {
    signals.push("High-risk reports should be treated as merge-contract work, not general code review feedback.");
  }

  if (totalReports > 0 && readyCount === totalReports) {
    signals.push("All available reports are ready to merge; continue normal human review and CI checks.");
  }

  return signals.length > 0 ? signals : ["Generate more real reports to identify recurring merge-readiness patterns."];
}

function analyseReports(entries: ReportHistoryEntry[]) {
  const totalReports = entries.length;
  const readyCount = entries.filter((entry) => entry.report.verdict.recommendation === "APPROVE").length;
  const testsRequiredCount = entries.filter((entry) => entry.report.verdict.recommendation === "TESTS_REQUIRED").length;
  const reviewRequiredCount = entries.filter((entry) => entry.report.verdict.recommendation === "REVIEW_REQUIRED").length;
  const operationalRiskCount = entries.filter((entry) => hasOperationalRisk(entry.report)).length;
  const highRiskCount = entries.filter((entry) => isHighRisk(entry.report)).length;
  const topMissingEvidence = countValues(entries.flatMap((entry) => missingEvidence(entry.report))).slice(0, 5);
  const topReviewerFocus = countValues(entries.flatMap((entry) => (
    pruneUnsupportedReviewerFocus(entry.report)?.map((item) => item.area) ?? []
  ))).slice(0, 5);
  const topOperationalAttention = countValues(entries.flatMap((entry) => operationalAttention(entry.report))).slice(0, 5);
  const topRecurringBlockers = countValues(entries.flatMap((entry) => recurringBlockers(entry.report))).slice(0, 6);

  return {
    totalReports,
    readyCount,
    testsRequiredCount,
    reviewRequiredCount,
    operationalRiskCount,
    highRiskCount,
    topMissingEvidence,
    topReviewerFocus,
    topOperationalAttention,
    topRecurringBlockers,
    processSignals: processSignals({
      totalReports,
      readyCount,
      testsRequiredCount,
      operationalRiskCount,
      highRiskCount,
      topMissingEvidence,
      topReviewerFocus,
    }),
  };
}

export default function ReviewOperationsPage() {
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setHistory(readReportHistory(window.localStorage));
    } catch {
      setHistory([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const entries = history.length > 0 ? history : [demoEntry];
  const showingDemo = loaded && history.length === 0;
  const metrics = useMemo(() => analyseReports(entries), [entries]);
  const latest = entries[0];

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
          <Link className="nav-item workspace-nav-item" href="/workspace">Risk inbox</Link>
          <Link className="nav-item workspace-nav-item nav-item--active" href="/review-operations" aria-current="page">Review operations</Link>
          <Link className="nav-item workspace-nav-item" href="/report">Reports</Link>
          <span className="workspace-nav-label">System</span>
          <Link className="nav-item workspace-nav-item" href="/review-policies">Review policies</Link>
          <Link className="nav-item workspace-nav-item" href="/settings">Analysis settings</Link>
          <Link className="nav-item workspace-nav-item" href="/github-action">GitHub Action</Link>
          <Link className="nav-item workspace-nav-item" href="/slack-handoff">Slack handoff</Link>
          <span className="workspace-nav-label">Evidence</span>
          <Link className="nav-item workspace-nav-item" href="/docs/evaluation-results.md">Evaluation</Link>
          <Link className="nav-item workspace-nav-item" href="/docs/security-model.md">Security model</Link>
        </nav>
        <div className="workspace-sidebar-panel">
          <span>Review operations</span>
          <p>Local patterns across reports. Useful for spotting recurring merge blockers without sending data to analytics.</p>
        </div>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Local patterns</span></div>
        </div>
      </aside>

      <main className="workspace-main operations-main">
        <header className="workspace-header workspace-header--app operations-header">
          <div className="workspace-header-copy">
            <span className="eyebrow">LOCAL REVIEW OPERATIONS</span>
            <h1>What keeps blocking merge readiness?</h1>
            <p>Aggregate local Lintel reports into practical reviewer signals: readiness distribution, missing-test trends, recurring blockers and operational risk patterns.</p>
            <span className="workspace-header-note">Local prototype / based on reports on this device / not production analytics</span>
          </div>
          <div className="workspace-header-actions">
            <Link className="workspace-secondary-action" href="/workspace">Risk inbox</Link>
            <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
          </div>
        </header>

        {showingDemo && (
          <section className="operations-demo-note" aria-label="Demo data notice">
            <strong>Demo pattern shown.</strong>
            <span>Generate real reports to replace this with local workspace history.</span>
          </section>
        )}

        <section className="operations-metric-grid" aria-label="Review operations summary">
          <article><span>Total reports</span><strong>{metrics.totalReports}</strong></article>
          <article><span>Ready to merge</span><strong>{metrics.readyCount}</strong></article>
          <article><span>Tests required</span><strong>{metrics.testsRequiredCount}</strong></article>
          <article><span>Review required</span><strong>{metrics.reviewRequiredCount}</strong></article>
          <article><span>Operational risk</span><strong>{metrics.operationalRiskCount}</strong></article>
          <article><span>High-risk reports</span><strong>{metrics.highRiskCount}</strong></article>
        </section>

        <section className="operations-layout">
          <div className="operations-main-column">
            <section className="operations-panel" aria-labelledby="readiness-distribution-title">
              <div className="section-heading">
                <div>
                  <span className="card-kicker">READINESS DISTRIBUTION</span>
                  <h2 id="readiness-distribution-title">Merge state across available reports</h2>
                </div>
              </div>
              <div className="operations-distribution">
                {recommendationBuckets.map((bucket) => {
                  const count = entries.filter((entry) => entry.report.verdict.recommendation === bucket.value).length;
                  const width = percent(count, metrics.totalReports);

                  return (
                    <article key={bucket.value}>
                      <div>
                        <strong>{bucket.label}</strong>
                        <span>{count} reports / {width}%</span>
                      </div>
                      <div className="operations-bar" aria-hidden="true">
                        <span className={`operations-bar-fill operations-bar-fill--${bucket.tone}`} style={{ width: `${width}%` }} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="operations-panel" aria-labelledby="recurring-blockers-title">
              <div className="section-heading">
                <div>
                  <span className="card-kicker">RECURRING BLOCKERS</span>
                  <h2 id="recurring-blockers-title">What appears most often</h2>
                </div>
              </div>
              {metrics.topRecurringBlockers.length > 0 ? (
                <ol className="operations-ranked-list">
                  {metrics.topRecurringBlockers.map((item) => (
                    <li key={item.label}>
                      <span>{item.count}</span>
                      <p>{item.label}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="operations-empty">No recurring blockers detected yet.</p>
              )}
            </section>

            <section className="operations-panel" aria-labelledby="process-signals-title">
              <div className="section-heading">
                <div>
                  <span className="card-kicker">TEAM / PROCESS SIGNAL</span>
                  <h2 id="process-signals-title">What the local pattern suggests</h2>
                </div>
              </div>
              <ul className="operations-signal-list">
                {metrics.processSignals.map((signal) => <li key={signal}>{signal}</li>)}
              </ul>
            </section>
          </div>

          <aside className="operations-side-column" aria-label="Local pattern detail">
            <section className="operations-panel">
              <span className="card-kicker">MISSING EVIDENCE</span>
              <h2>Missing tests and proof</h2>
              {metrics.topMissingEvidence.length > 0 ? (
                <ul className="operations-compact-list">
                  {metrics.topMissingEvidence.map((item) => <li key={item.label}><strong>{item.count}x</strong><span>{item.label}</span></li>)}
                </ul>
              ) : (
                <p className="operations-empty">No missing evidence detected.</p>
              )}
            </section>

            <section className="operations-panel">
              <span className="card-kicker">REVIEWER FOCUS</span>
              <h2>Common review lanes</h2>
              {metrics.topReviewerFocus.length > 0 ? (
                <ul className="operations-compact-list">
                  {metrics.topReviewerFocus.map((item) => <li key={item.label}><strong>{item.count}x</strong><span>{item.label}</span></li>)}
                </ul>
              ) : (
                <p className="operations-empty">No specialist reviewer focus detected.</p>
              )}
            </section>

            <section className="operations-panel">
              <span className="card-kicker">OPERATIONS / SECURITY</span>
              <h2>Attention patterns</h2>
              {metrics.topOperationalAttention.length > 0 ? (
                <ul className="operations-compact-list">
                  {metrics.topOperationalAttention.map((item) => <li key={item.label}><strong>{item.count}x</strong><span>{item.label}</span></li>)}
                </ul>
              ) : (
                <p className="operations-empty">No recurring operational or security attention detected.</p>
              )}
            </section>

            <section className="operations-panel operations-latest-panel">
              <span className="card-kicker">LATEST REPORT</span>
              <h2>{latest.metadata.title}</h2>
              <p>{latest.metadata.repository}</p>
              <dl>
                <div><dt>Recommendation</dt><dd>{latest.metadata.recommendation.replaceAll("_", " ")}</dd></div>
                <div><dt>Risk</dt><dd>{latest.report.verdict.riskLevel} / {latest.report.verdict.riskScore}</dd></div>
                <div><dt>Source</dt><dd>{sourceLabel(latest.source)}</dd></div>
                <div><dt>Profile</dt><dd>{latest.metadata.reviewProfile}</dd></div>
              </dl>
              <div className="operations-link-row">
                <Link href="/workspace">Open risk inbox</Link>
                <Link href="/report">Open report</Link>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
