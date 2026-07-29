"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  OPERATIONAL_PRIMARY_GROUP_LABEL,
  OPERATIONAL_VIEW_IDS,
  OPERATIONAL_VIEW_LABEL,
  operationalViewCounts,
  type OperationalReviewProjection,
  type OperationalReviewRecord,
  type OperationalViewId,
} from "../lib/operational-review-projection";
import {
  APPLICABILITY_LABEL,
  OUTCOME_LABEL,
} from "../lib/workspace-v2/view-model";
import styles from "./operational.module.css";

const RISK_LABEL: Record<OperationalReviewRecord["riskLevel"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export function formatOperationalTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Timestamp unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date) + " UTC";
}

export function DemoBoundary({ empty = false }: { empty?: boolean }) {
  return (
    <div className={styles.demoBoundary} role="note">
      <strong>Controlled demonstration</strong>
      <span>
        {empty ? "Empty sample state." : "Sample fixture records."} Counts are isolated from real
        browser-local history. No organisation analytics, live monitoring, authoritative user
        activity, shared assignment state or external writes.
      </span>
    </div>
  );
}

export function LocalBoundary({ projection }: { projection: OperationalReviewProjection }) {
  if (projection.mode === "demo") return null;
  return (
    <p className={styles.localBoundary}>
      Browser-local reports on this device · maximum 10 retained · no organisation telemetry,
      live monitoring, team activity feed or shared assignments.
    </p>
  );
}

export function ProjectionLimitations({
  limitations,
}: {
  limitations: string[];
}) {
  if (limitations.length === 0) return null;
  return (
    <div className={styles.partialBoundary} role="status">
      <strong>Partial local history</strong>
      <ul>
        {limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
      </ul>
    </div>
  );
}

export function OperationalViews({
  records,
  activeView,
  demo,
  compact = false,
}: {
  records: OperationalReviewRecord[];
  activeView?: OperationalViewId;
  demo: boolean;
  compact?: boolean;
}) {
  const counts = operationalViewCounts(records);
  const viewLinksRef = useRef<HTMLDivElement | null>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);

  function revealViewLink(link: HTMLAnchorElement) {
    const strip = viewLinksRef.current;
    if (!strip) return;
    const left = link.offsetLeft;
    const right = left + link.offsetWidth;
    const visibleLeft = strip.scrollLeft;
    const visibleRight = visibleLeft + strip.clientWidth;
    if (left < visibleLeft) {
      strip.scrollTo({ left: Math.max(0, left - 4), behavior: "auto" });
    } else if (right > visibleRight) {
      strip.scrollTo({ left: right - strip.clientWidth + 4, behavior: "auto" });
    }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (activeLinkRef.current) revealViewLink(activeLinkRef.current);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeView]);

  return (
    <nav
      className={`${styles.views} ${compact ? styles.viewsCompact : ""}`}
      aria-label="Operational views"
    >
      <span className={styles.viewsLabel}>Views</span>
      <div className={styles.viewLinks} ref={viewLinksRef}>
        {OPERATIONAL_VIEW_IDS.map((view) => {
          const params = new URLSearchParams();
          if (view !== "all") params.set("view", view);
          if (demo) params.set("demo", "1");
          const href = `/review-operations${params.size ? `?${params.toString()}` : ""}`;
          return (
            <Link
              key={view}
              href={href}
              ref={activeView === view ? activeLinkRef : undefined}
              className={activeView === view ? styles.viewActive : undefined}
              aria-current={activeView === view ? "page" : undefined}
              onFocus={(event) => revealViewLink(event.currentTarget)}
            >
              <span>{OPERATIONAL_VIEW_LABEL[view]}</span>
              <strong>{counts[view]}</strong>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function recommendationTone(record: OperationalReviewRecord): string {
  if (record.recommendation === "APPROVE") return styles.toneReady;
  if (record.recommendation === "BLOCK") return styles.toneBlocking;
  if (record.recommendation === "TESTS_REQUIRED") return styles.toneProof;
  return styles.toneReview;
}

function decisionOutcomeTone(
  outcome: OperationalReviewRecord["decision"]["outcome"],
): string {
  switch (outcome) {
    case "approve":
      return styles.toneReady;
    case "approve-with-accepted-risk":
    case "tests-required":
      return styles.toneProof;
    case "review-required":
      return styles.toneReview;
    case "request-changes":
    case "blocked":
      return styles.toneBlocking;
    case "defer":
    case null:
      return styles.toneNeutral;
  }
}

function decisionApplicabilityTone(
  applicability: OperationalReviewRecord["decision"]["applicability"],
): string {
  if (
    applicability === "predates-current-head" ||
    applicability === "unbound" ||
    applicability === "current-head-unavailable" ||
    applicability === "unavailable"
  ) {
    return styles.toneProof;
  }
  return styles.toneNeutral;
}

export function RecommendationState({ record }: { record: OperationalReviewRecord }) {
  return (
    <span className={`${styles.stateText} ${recommendationTone(record)}`}>
      {record.recommendationLabel}
    </span>
  );
}

export function DecisionState({ record }: { record: OperationalReviewRecord }) {
  if (!record.decision.outcome) {
    return (
      <span className={`${styles.stateText} ${styles.toneNeutral}`}>
        {record.decision.label}
      </span>
    );
  }

  const applicability = record.decision.applicability;
  return (
    <span className={styles.decisionState}>
      <span className={`${styles.stateText} ${decisionOutcomeTone(record.decision.outcome)}`}>
        {OUTCOME_LABEL[record.decision.outcome]}
      </span>
      {applicability && (
        <small className={`${styles.decisionApplicability} ${decisionApplicabilityTone(applicability)}`}>
          {APPLICABILITY_LABEL[applicability]}
        </small>
      )}
    </span>
  );
}

export function RiskState({ record }: { record: OperationalReviewRecord }) {
  const tone =
    record.riskLevel === "CRITICAL"
      ? styles.toneBlocking
      : record.riskLevel === "HIGH"
        ? styles.toneReview
        : record.riskLevel === "MEDIUM"
          ? styles.toneProof
          : styles.toneNeutral;
  return (
    <span className={`${styles.stateText} ${tone}`}>
      {record.riskScore} · {RISK_LABEL[record.riskLevel]}
    </span>
  );
}

export function CompactReviewList({
  records,
  demo,
  changed = false,
}: {
  records: OperationalReviewRecord[];
  demo: boolean;
  changed?: boolean;
}) {
  return (
    <ul className={styles.compactRecords}>
      {records.map((record) => {
        const params = new URLSearchParams();
        params.set("selected", record.reportId);
        if (demo) params.set("demo", "1");
        const href =
          !demo && record.workspaceHref
            ? record.workspaceHref
            : `/review-operations?${params.toString()}`;
        return (
          <li key={record.caseId}>
            <Link href={href}>
              <span className={styles.compactRecordMain}>
                <strong title={record.title}>{record.title}</strong>
                <code title={`${record.repository}${record.pullRequestNumber ? ` · PR #${record.pullRequestNumber}` : ""}`}>
                  {record.repository}
                  {record.pullRequestNumber ? ` · PR #${record.pullRequestNumber}` : ""}
                </code>
              </span>
              <span className={styles.compactRecordState}>
                <RecommendationState record={record} />
                <small>
                  {changed && record.changeSummary
                    ? record.changeSummary
                    : OPERATIONAL_PRIMARY_GROUP_LABEL[record.primaryGroup]}
                </small>
                <time dateTime={changed ? record.changeAt ?? record.updatedAt : record.updatedAt}>
                  {formatOperationalTimestamp(changed ? record.changeAt ?? record.updatedAt : record.updatedAt)}
                </time>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SelectedRecordSummary({
  record,
  requestedId,
  demo,
  onBack,
}: {
  record: OperationalReviewRecord | null;
  requestedId: string | null;
  demo: boolean;
  onBack: () => void;
}) {
  if (!requestedId) {
    return (
      <aside className={styles.selectionPanel} aria-label="Selected review">
        <div className={styles.selectionPlaceholder}>
          <strong>No record selected</strong>
          <p>Select a review record to inspect its cross-review readiness summary.</p>
        </div>
      </aside>
    );
  }
  if (!record) {
    return (
      <aside className={styles.selectionPanel} aria-labelledby="unavailable-selection-title">
        <button type="button" className={styles.mobileBack} onClick={onBack}>
          Back to records
        </button>
        <div className={styles.selectionUnavailable}>
          <span>Requested record unavailable</span>
          <h2 id="unavailable-selection-title">The selected review no longer resolves</h2>
          <code title={requestedId}>{requestedId}</code>
          <p>No other record was selected in its place. Clear the selection or use Browser Back.</p>
          <button type="button" className={styles.secondaryAction} onClick={onBack}>
            Clear selection
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.selectionPanel} aria-labelledby="selected-record-title">
      <button type="button" className={styles.mobileBack} onClick={onBack}>
        Back to records
      </button>
      <div className={styles.selectionHeader}>
        <span>{OPERATIONAL_PRIMARY_GROUP_LABEL[record.primaryGroup]}</span>
        <h2 id="selected-record-title">{record.title}</h2>
        <code
          title={`${record.repository}${record.pullRequestNumber ? ` · PR #${record.pullRequestNumber}` : ""}`}
        >
          {record.repository}
          {record.pullRequestNumber ? ` · PR #${record.pullRequestNumber}` : ""}
        </code>
      </div>
      <dl className={styles.selectionFacts}>
        <div><dt>Lintel recommendation</dt><dd><RecommendationState record={record} /></dd></div>
        <div><dt>Risk</dt><dd><RiskState record={record} /></dd></div>
        <div><dt>Open blockers</dt><dd>{record.blockerCount}</dd></div>
        <div><dt>Missing / unverified proof</dt><dd>{record.missingProofCount}</dd></div>
        <div><dt>Stale evidence / requirements</dt><dd>{record.staleEvidenceCount} / {record.staleRequirementCount}</dd></div>
        <div><dt>Human Decision</dt><dd><DecisionState record={record} /></dd></div>
        <div><dt>Current run</dt><dd><code title={record.runId ?? "Not recorded"}>{record.runId ?? "Not recorded"}</code></dd></div>
        <div><dt>Current head</dt><dd><code title={record.headSha ?? "Not recorded"}>{record.headSha ?? "Not recorded"}</code></dd></div>
        <div><dt>Source</dt><dd>{record.sourceLabel} · {record.analysisLabel}</dd></div>
        <div><dt>Updated</dt><dd><time dateTime={record.updatedAt}>{formatOperationalTimestamp(record.updatedAt)}</time></dd></div>
      </dl>
      {record.attentionReasons.length > 0 && (
        <div className={styles.attentionReasons}>
          <strong>Current attention signals</strong>
          <ul>{record.attentionReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
      )}
      {record.changeSummary && (
        <div className={styles.changeNote}>
          <strong>Recently changed</strong>
          <span>{record.changeSummary}</span>
        </div>
      )}
      {demo ? (
        <p className={styles.actionBoundary}>
          Demonstration records have no durable report identity, so exact Workspace and Case File
          actions are withheld.
        </p>
      ) : (
        <div className={styles.selectionActions}>
          {record.workspaceHref && <Link className={styles.primaryAction} href={record.workspaceHref}>Open in Workspace</Link>}
          {record.caseFileHref && <Link className={styles.secondaryAction} href={record.caseFileHref}>Open Case File</Link>}
        </div>
      )}
      <p className={styles.actionBoundary}>
        Selection is an operational summary only. Investigation and Human Decision remain in
        Workspace; the durable record remains in Case File.
      </p>
    </aside>
  );
}
