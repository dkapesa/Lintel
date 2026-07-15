"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../app-shell";
import styles from "../administrative-document.module.css";
import {
  conditionKey,
  readConditionProgress,
  reportConditions,
} from "../../lib/condition-progress";
import {
  decisionHistoryKeyForReport,
  readDecisionHistory,
  type DecisionHistoryEvent,
} from "../../lib/decision-history";
import {
  humanDecisionLedgerKeyForReport,
  projectHumanDecisionLedger,
  readHumanDecisionLedger,
  type HumanDecisionLedgerEntry,
  type HumanDecisionOutcome,
} from "../../lib/human-decision-ledger";
import { report as demoReport, type Report } from "../../lib/mock-report";
import { readReportHistory, type ReportHistoryEntry } from "../../lib/report-history";
import { readReviewState } from "../../lib/review-state";
import { reviewProfileLabel } from "../../lib/review-profiles";

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

type LoadState = "loading" | "local" | "demo" | "unavailable";

type OperationalRecord = {
  entry: ReportHistoryEntry;
  clearedConditionKeys: Set<string>;
  decisionHistory: DecisionHistoryEvent[];
  humanDecisions: HumanDecisionLedgerEntry[];
  latestHumanDecision?: HumanDecisionLedgerEntry;
  reaffirmationRequired: boolean;
};

type BlockerOccurrence = {
  record: OperationalRecord;
  kind: "Merge condition" | "Missing test" | "Finding";
  label: string;
  state: "Cleared locally" | "Open when recorded" | "Recorded finding";
};

type BlockerRecord = {
  key: string;
  label: string;
  kinds: string[];
  occurrences: BlockerOccurrence[];
  changes: string[];
  repositories: string[];
  latest: BlockerOccurrence;
};

type RepositoryRecord = {
  key: string;
  identity: string;
  reviews: number;
  openRequirements: number;
  latest: OperationalRecord;
  latestDecision?: HumanDecisionLedgerEntry;
};

type HistoryRecord = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  repository: string;
  pullRequestNumber?: number;
  actor?: string;
  technicalId?: string;
  caseFileHref?: string;
  state: string;
};

function normalizeEvidenceLabel(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function repositoryIdentity(report: Report) {
  return report.pr.repository.trim() || "Repository unavailable";
}

function changeIdentity(report: Report) {
  return `${repositoryIdentity(report)}\u001f${report.pr.number}\u001f${report.pr.title}`;
}

function sourceLabel(entry: ReportHistoryEntry) {
  return entry.source === "ai" ? "Baseline + model-assisted" : "Baseline only";
}

function recommendationLabel(value: Report["verdict"]["recommendation"]) {
  if (value === "APPROVE") return "Ready to merge";
  if (value === "TESTS_REQUIRED") return "Tests required";
  if (value === "REVIEW_REQUIRED") return "Review required";
  return "Blocked";
}

function decisionOutcomeLabel(value?: HumanDecisionOutcome) {
  if (!value) return "Decision recorded";
  if (value === "approve") return "Approved";
  if (value === "approve-with-accepted-risk") return "Approved with accepted risk";
  if (value === "request-changes") return "Changes requested";
  if (value === "tests-required") return "Tests required";
  if (value === "review-required") return "Review required";
  if (value === "blocked") return "Blocked";
  return "Deferred";
}

function humanEventTitle(entry: HumanDecisionLedgerEntry) {
  const labels: Record<HumanDecisionLedgerEntry["eventType"], string> = {
    "decision-recorded": "Human decision recorded",
    "decision-reaffirmed": "Human decision reaffirmed",
    "decision-superseded": "Human decision superseded",
    "decision-withdrawn": "Human decision withdrawn",
    "risk-accepted": "Accepted risk recorded",
    "risk-acceptance-revoked": "Accepted risk revoked",
    "note-recorded": "Decision note recorded",
  };
  return labels[entry.eventType];
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Timestamp unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function shortIdentifier(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function blockerEvidence(record: OperationalRecord): BlockerOccurrence[] {
  const evidence = new Map<string, BlockerOccurrence>();

  for (const condition of reportConditions(record.entry.report)) {
    const label = condition.trim();
    if (!label) continue;
    const key = normalizeEvidenceLabel(label);
    evidence.set(key, {
      record,
      kind: "Merge condition",
      label,
      state: record.clearedConditionKeys.has(conditionKey(condition)) ? "Cleared locally" : "Open when recorded",
    });
  }

  for (const missingTest of record.entry.report.missingTests) {
    const label = missingTest.trim();
    if (!label) continue;
    const key = normalizeEvidenceLabel(label);
    if (!evidence.has(key)) {
      evidence.set(key, { record, kind: "Missing test", label, state: "Open when recorded" });
    }
  }

  for (const finding of record.entry.report.findings) {
    const label = finding.title.trim();
    if (!label) continue;
    const key = normalizeEvidenceLabel(label);
    if (!evidence.has(key)) {
      evidence.set(key, { record, kind: "Finding", label, state: "Recorded finding" });
    }
  }

  return [...evidence.values()];
}

function buildBlockerRecords(records: OperationalRecord[]) {
  const grouped = new Map<string, BlockerOccurrence[]>();

  for (const record of records) {
    for (const occurrence of blockerEvidence(record)) {
      const key = normalizeEvidenceLabel(occurrence.label);
      grouped.set(key, [...(grouped.get(key) ?? []), occurrence]);
    }
  }

  return [...grouped.entries()].map(([key, occurrences]): BlockerRecord => {
    const sortedOccurrences = [...occurrences].sort((a, b) => Date.parse(b.record.entry.createdAt) - Date.parse(a.record.entry.createdAt));
    const changes = [...new Set(occurrences.map((item) => changeIdentity(item.record.entry.report)))];
    const repositories = [...new Set(occurrences.map((item) => repositoryIdentity(item.record.entry.report)))];
    return {
      key,
      label: sortedOccurrences[0].label,
      kinds: [...new Set(occurrences.map((item) => item.kind))],
      occurrences,
      changes,
      repositories,
      latest: sortedOccurrences[0],
    };
  }).sort((a, b) => (
    b.occurrences.length - a.occurrences.length
    || Date.parse(b.latest.record.entry.createdAt) - Date.parse(a.latest.record.entry.createdAt)
    || a.label.localeCompare(b.label)
  ));
}

function openRequirementCount(report: Report) {
  return new Set([
    ...reportConditions(report),
    ...report.missingTests,
  ].map(normalizeEvidenceLabel).filter(Boolean)).size;
}

function buildRepositoryRecords(records: OperationalRecord[]) {
  const grouped = new Map<string, OperationalRecord[]>();

  for (const record of records) {
    const identity = repositoryIdentity(record.entry.report);
    grouped.set(identity, [...(grouped.get(identity) ?? []), record]);
  }

  return [...grouped.entries()].map(([identity, repositoryRecords]): RepositoryRecord => {
    const sorted = [...repositoryRecords].sort((a, b) => Date.parse(b.entry.createdAt) - Date.parse(a.entry.createdAt));
    const decisions = sorted
      .flatMap((record) => record.latestHumanDecision ? [record.latestHumanDecision] : [])
      .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt));
    return {
      key: identity,
      identity,
      reviews: repositoryRecords.length,
      openRequirements: openRequirementCount(sorted[0].entry.report),
      latest: sorted[0],
      latestDecision: decisions[0],
    };
  }).sort((a, b) => Date.parse(b.latest.entry.createdAt) - Date.parse(a.latest.entry.createdAt));
}

function includeDecisionHistoryEvent(event: DecisionHistoryEvent) {
  return ![
    "report-generated",
    "recommendation-assigned",
    "human-decision-recorded",
    "accepted-risk-recorded",
  ].includes(event.type);
}

function stableEventIdentity(parts: Array<string | number | undefined>) {
  return parts.map((part) => encodeURIComponent(String(part ?? "unavailable"))).join(":");
}

function buildHistoryRecords(records: OperationalRecord[], demo: boolean) {
  const events: HistoryRecord[] = [];

  records.forEach((record, recordIndex) => {
    const report = record.entry.report;
    const repository = repositoryIdentity(report);
    const caseFileHref = demo ? "/report?demo=1" : recordIndex === 0 ? "/report" : undefined;
    const reportRecordIdentity = stableEventIdentity([
      record.entry.canonicalRun?.runId,
      record.entry.createdAt,
      repository,
      report.pr.number,
      report.pr.title,
      record.entry.inputLabel,
      recordIndex,
    ]);

    events.push({
      id: `report:${record.entry.createdAt}:${repository}:${report.pr.number}`,
      timestamp: record.entry.createdAt,
      title: "Report generated",
      detail: `${recommendationLabel(report.verdict.recommendation)} · ${sourceLabel(record.entry)} · ${record.entry.metadata.reviewProfile}`,
      repository,
      pullRequestNumber: report.pr.number,
      technicalId: record.entry.canonicalRun?.runId,
      caseFileHref,
      state: recommendationLabel(report.verdict.recommendation),
    });

    record.decisionHistory.filter(includeDecisionHistoryEvent).forEach((event, eventIndex) => {
      events.push({
        id: stableEventIdentity([
          "history",
          reportRecordIdentity,
          event.id,
          event.type,
          event.timestamp,
          eventIndex,
        ]),
        timestamp: event.timestamp,
        title: event.title,
        detail: event.detail,
        repository,
        pullRequestNumber: report.pr.number,
        technicalId: record.entry.canonicalRun?.runId,
        state: event.nextState ?? event.label,
      });
    });

    record.humanDecisions.forEach((entry, decisionIndex) => {
      events.push({
        id: stableEventIdentity([
          "human",
          reportRecordIdentity,
          entry.entryId,
          entry.eventType,
          entry.recordedAt,
          decisionIndex,
        ]),
        timestamp: entry.recordedAt,
        title: humanEventTitle(entry),
        detail: entry.reason ?? decisionOutcomeLabel(entry.outcome),
        repository: entry.repository || repository,
        pullRequestNumber: entry.pullRequestNumber ?? report.pr.number,
        actor: entry.actor.displayLabel,
        technicalId: entry.canonicalRunId ?? entry.applicableHeadSha,
        state: decisionOutcomeLabel(entry.outcome),
      });
    });
  });

  return events.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

function recommendationClass(value: Report["verdict"]["recommendation"]) {
  return value === "APPROVE" ? styles.statePositive : styles.stateAttention;
}

export default function ReviewOperationsPage() {
  const [records, setRecords] = useState<OperationalRecord[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    try {
      const history = readReportHistory(window.localStorage);
      if (history.length === 0) {
        setRecords([]);
        setLoadState("demo");
        return;
      }

      setRecords(history.map((entry) => {
        const reviewState = readReviewState(window.localStorage, entry.report);
        const context = {
          report: entry.report,
          canonicalRun: entry.canonicalRun,
          mergeContract: entry.mergeContract,
          contractRecheck: entry.contractRecheck,
          verificationPackId: entry.verificationPack?.packId,
          currentHeadSha: entry.canonicalRun?.headSha,
        };
        const ledger = readHumanDecisionLedger(
          window.localStorage,
          humanDecisionLedgerKeyForReport(entry.report),
          context,
          reviewState,
        );
        const projection = projectHumanDecisionLedger(ledger, context.currentHeadSha);

        return {
          entry,
          clearedConditionKeys: readConditionProgress(window.localStorage, entry.report),
          decisionHistory: readDecisionHistory(window.localStorage, decisionHistoryKeyForReport(entry.report)),
          humanDecisions: ledger.entries,
          latestHumanDecision: projection.latestEffectiveEntry,
          reaffirmationRequired: projection.reaffirmationRequired,
        };
      }));
      setLoadState("local");
    } catch {
      setRecords([]);
      setLoadState("unavailable");
    }
  }, []);

  const showingDemo = loadState !== "local";
  const displayRecords = useMemo<OperationalRecord[]>(() => (
    records.length > 0 ? records : [{
      entry: demoEntry,
      clearedConditionKeys: new Set<string>(),
      decisionHistory: [],
      humanDecisions: [],
      latestHumanDecision: undefined,
      reaffirmationRequired: false,
    }]
  ), [records]);
  const blockers = useMemo(() => buildBlockerRecords(displayRecords), [displayRecords]);
  const repositories = useMemo(() => buildRepositoryRecords(displayRecords), [displayRecords]);
  const history = useMemo(() => buildHistoryRecords(displayRecords, showingDemo), [displayRecords, showingDemo]);
  const attentionCount = displayRecords.filter((record) => record.entry.report.verdict.recommendation !== "APPROVE").length;
  const recurringCount = blockers.filter((blocker) => blocker.occurrences.length > 1).length;
  const decisionCount = displayRecords.reduce((total, record) => total + record.humanDecisions.filter((entry) => entry.outcome).length, 0);
  const reaffirmationCount = displayRecords.filter((record) => record.reaffirmationRequired).length;
  const activeRepositoryCount = repositories.filter((repository) => repository.identity !== "Repository unavailable").length;

  const boundaryText = loadState === "loading"
    ? "Loading local report history · demo evidence shown temporarily · not hosted analytics"
    : loadState === "local"
      ? `${records.length} local ${records.length === 1 ? "report" : "reports"} stored on this device · not hosted organisation analytics`
      : loadState === "unavailable"
        ? "Local storage unavailable · demo report shown · no organisation telemetry"
        : "Demo report shown · generate a local report to replace it · not organisation analytics";

  return (
    <AppShell>
      <div className={styles.page} data-tour="review-operations">
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>Review operations</h1>
            <p>Review recurring requirements, repository activity and recorded verification decisions from reports stored in this workspace.</p>
            <div className={styles.statusLine}>{boundaryText}</div>
          </header>

          <ul className={`${styles.summaryStrip} ${styles.operationsSummaryStrip}`} aria-label="Review operations summary">
            <li><span>Reviews needing attention</span><strong>{attentionCount}</strong></li>
            <li><span>Recurring blockers</span><strong>{recurringCount}</strong></li>
            <li><span>Active repositories</span><strong>{activeRepositoryCount}</strong></li>
            <li><span>Decisions recorded</span><strong>{decisionCount}</strong></li>
            <li><span>Reaffirmation required</span><strong>{reaffirmationCount}</strong></li>
          </ul>

          <nav className={`${styles.sectionNav} ${styles.operationsSectionNav}`} aria-label="Review operations sections">
            <a href="#recurring-blockers">Recurring blockers</a>
            <a href="#repository-activity">Repository activity</a>
            <a href="#decision-history">Decision history</a>
            <a href="#operations-limitations">Limitations</a>
          </nav>

          <section className={styles.section} id="recurring-blockers" aria-labelledby="recurring-blockers-title">
            <div className={styles.sectionHeader}>
              <h2 id="recurring-blockers-title">Recurring blockers</h2>
              <p>Repeated evidence is grouped by normalized requirement text. Single-report requirements remain visible without being presented as a trend.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>Requirement relationships</h3>
                <p>Occurrences are counted once per report. Cleared state appears only when local condition progress records it.</p>
              </div>
              {blockers.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={`${styles.adminTable} ${styles.operationsBlockerTable}`}>
                    <thead>
                      <tr>
                        <th scope="col">Requirement or blocker</th>
                        <th scope="col">Occurrences</th>
                        <th scope="col">Changes</th>
                        <th scope="col">Repositories</th>
                        <th scope="col">Latest seen</th>
                        <th scope="col">Recorded state</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockers.map((blocker) => (
                        <tr key={blocker.key}>
                          <td data-label="Requirement or blocker">
                            <span className={styles.rowTitle}>{blocker.label}</span>
                            <span className={styles.rowSupport}>{blocker.kinds.join(" · ")}</span>
                          </td>
                          <td data-label="Occurrences">{blocker.occurrences.length}</td>
                          <td data-label="Changes">{blocker.changes.length}</td>
                          <td data-label="Repositories">
                            {blocker.repositories.length}
                            <span className={styles.rowSupport}>{blocker.repositories.join(", ")}</span>
                          </td>
                          <td data-label="Latest seen">
                            <time className={styles.humanTime} dateTime={blocker.latest.record.entry.createdAt}>{formatTimestamp(blocker.latest.record.entry.createdAt)}</time>
                          </td>
                          <td data-label="Recorded state">
                            <span className={blocker.latest.state === "Cleared locally" ? styles.statePositive : blocker.latest.state === "Open when recorded" ? styles.stateAttention : styles.stateNeutral}>{blocker.latest.state}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className={styles.emptyState}>No requirement or blocker evidence is present in the available reports.</p>}
            </div>
          </section>

          <section className={styles.section} id="repository-activity" aria-labelledby="repository-activity-title">
            <div className={styles.sectionHeader}>
              <h2 id="repository-activity-title">Repository verification activity</h2>
              <p>Repository records connect stored reviews with the latest open requirements, recommendation, activity and recorded human decision.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>Repository records</h3>
                <p>Open requirements are taken from each repository’s latest available report. No repository score is calculated.</p>
              </div>
              {repositories.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={`${styles.adminTable} ${styles.operationsRepositoryTable}`}>
                    <thead>
                      <tr>
                        <th scope="col">Repository</th>
                        <th scope="col">Reviews</th>
                        <th scope="col">Open requirements</th>
                        <th scope="col">Latest recommendation</th>
                        <th scope="col">Latest activity</th>
                        <th scope="col">Latest human decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repositories.map((repository) => (
                        <tr key={repository.key}>
                          <td data-label="Repository">
                            <span className={styles.rowTitle}>{repository.identity}</span>
                            <span className={styles.rowSupport}>PR #{repository.latest.entry.report.pr.number} · {repository.latest.entry.metadata.title}</span>
                          </td>
                          <td data-label="Reviews">{repository.reviews}</td>
                          <td data-label="Open requirements">{repository.openRequirements}</td>
                          <td data-label="Latest recommendation">
                            <span className={recommendationClass(repository.latest.entry.report.verdict.recommendation)}>{recommendationLabel(repository.latest.entry.report.verdict.recommendation)}</span>
                          </td>
                          <td data-label="Latest activity">
                            <time className={styles.humanTime} dateTime={repository.latest.entry.createdAt}>{formatTimestamp(repository.latest.entry.createdAt)}</time>
                            <span className={styles.rowSupport}>{sourceLabel(repository.latest.entry)}</span>
                          </td>
                          <td data-label="Latest human decision">
                            {repository.latestDecision ? decisionOutcomeLabel(repository.latestDecision.outcome) : <span className={styles.stateNeutral}>No decision recorded</span>}
                            {repository.latestDecision && <span className={styles.rowSupport}>{repository.latestDecision.actor.displayLabel}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className={styles.emptyState}>No repository identity is available. Generate a local report to create repository activity.</p>}
            </div>
          </section>

          <section className={styles.section} id="decision-history" aria-labelledby="decision-history-title">
            <div className={styles.sectionHeader}>
              <h2 id="decision-history-title">Decision and readiness history</h2>
              <p>Newest-first events combine stored report timestamps with existing local workflow events and Human Decision Ledger entries.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>Recorded chronology</h3>
                <p>Actors and run identifiers appear only when the underlying record contains them.</p>
              </div>
              {decisionCount === 0 && <p className={styles.operationsDecisionEmpty}>No human decisions are recorded. Report and local readiness activity remains visible below.</p>}
              {history.length > 0 ? (
                <ol className={styles.operationsHistoryList}>
                  {history.map((event) => (
                    <li key={event.id}>
                      <time className={styles.operationsHistoryTime} dateTime={event.timestamp}>{formatTimestamp(event.timestamp)}</time>
                      <div className={styles.operationsHistoryEvent}>
                        <span className={styles.rowTitle}>{event.title}</span>
                        <p>{event.detail}</p>
                        <span className={styles.rowSupport}>
                          {event.repository}{event.pullRequestNumber ? ` · PR #${event.pullRequestNumber}` : ""}
                          {event.actor ? ` · ${event.actor}` : ""}
                        </span>
                      </div>
                      <div className={styles.operationsHistoryState}>
                        <span>{event.state}</span>
                        {event.technicalId && <code title={event.technicalId}>{shortIdentifier(event.technicalId)}</code>}
                        {event.caseFileHref && <Link className={styles.recordLink} href={event.caseFileHref}>Open Case File</Link>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <p className={styles.emptyState}>No recorded review or decision history is available.</p>}
            </div>
          </section>

          <section className={styles.section} id="operations-limitations" aria-labelledby="operations-limitations-title">
            <div className={styles.sectionHeader}>
              <h2 id="operations-limitations-title">Local evidence boundary</h2>
              <p>This surface organizes evidence already stored by the local prototype. It does not introduce monitoring or collaboration.</p>
            </div>
            <div className={`${styles.group} ${styles.limitationGroup}`}>
              <ul className={styles.boundaryList}>
                {showingDemo && <li>The displayed records come from the existing demo report because no usable local report history is available.</li>}
                <li>Report history is limited to the reports retained on this device; it is not organisation-wide telemetry.</li>
                <li>Archived reports do not have stable per-report URLs. The Case File link opens the current session report or the explicitly labelled demo.</li>
                <li>Missing timestamps, repository identities and human decisions remain unavailable rather than being inferred.</li>
                <li>Review status, condition progress and human decisions remain owned by their existing local workflows.</li>
              </ul>
              {showingDemo && (
                <div className={styles.artifactActions}>
                  <p>Generate a report to replace the demo evidence with local workspace history.</p>
                  <Link className={styles.secondaryAction} href="/new">Check a pull request</Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
