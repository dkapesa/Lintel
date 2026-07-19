"use client";

/* R0B.2B — Workspace V2 recorded Human Decision · Decision Context Inspector
   and the full-history surface.

   The Decision Context Inspector is a peer inspector mode to Case Context /
   Finding / Evidence / Requirement (§14). It shows the latest effective
   decision and the latest five history events inline; older events open in
   the dedicated full-history surface. It stays within the existing inspector
   density — it is not a permanent dossier. */

import type { ReactNode } from "react";
import styles from "./workspace-v2.module.css";
import {
  DecisionActorProvenance,
  DecisionApplicabilityChip,
  DecisionDivergenceChip,
  DecisionDialog,
  DecisionReferenceList,
  SampleBadge,
  fingerprintPrefix,
  toneClassName,
} from "./decision-atoms";
import {
  EVENT_TITLE,
  OUTCOME_LABEL,
  outcomeTone,
  type DecisionHistoryEvent,
  type DecisionPlateViewModel,
  type DecisionRecord,
} from "./decision-model";

const INLINE_HISTORY_LIMIT = 5;

function InspectorGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={styles.inspectorGroup}>
      <span className={styles.inspectorGroupLabel}>{label}</span>
      {children}
    </section>
  );
}

/* --- Decision Context Inspector --------------------------------------- */

export function DecisionContextInspector({
  record,
  view,
  onViewHistory,
  onWithdraw,
  onRevokeRisk,
}: {
  record: DecisionRecord;
  view: DecisionPlateViewModel;
  onViewHistory: (trigger: HTMLElement) => void;
  onWithdraw: (trigger: HTMLElement) => void;
  onRevokeRisk: (trigger: HTMLElement) => void;
}) {
  const effective = record.effective;
  /* Newest first for reading. */
  const ordered = [...record.history].reverse();
  const inline = ordered.slice(0, INLINE_HISTORY_LIMIT);
  const hasMore = ordered.length > INLINE_HISTORY_LIMIT;

  return (
    <>
      <span className={styles.marker}>
        <span className={`${styles.markerBar} ${styles.toneInformation}`} />
        <span className={styles.markerKind}>Decision context</span>
        <span className={styles.markerId}>stage 5</span>
      </span>

      {view.status === "empty" ? (
        <>
          <h2 className={styles.inspectorTitle}>No engineer decision recorded</h2>
          <p className={styles.inspectorLead}>
            The decision ledger is readable and empty. Lintel recommends{" "}
            {view.recommendation}. Recording a decision is the terminal act for this case.
          </p>
        </>
      ) : null}

      {view.status === "error" ? (
        <>
          <h2 className={`${styles.inspectorTitle} ${styles.toneDanger}`}>
            Decision state unavailable
          </h2>
          <p className={styles.inspectorLead}>
            {view.readError ??
              "The decision record could not be read or projected. This is distinct from an empty ledger."}
          </p>
        </>
      ) : null}

      {view.status === "recorded" && effective ? (
        <>
          {/* R0B.2C decision-first hierarchy: what was decided (tone-carrying
              title), by whom and when, whether it still applies, why — then
              the head binding, the referenced basis, quiet provenance, and
              last the destructive actions. The former duplicate inline
              outcome token and the standalone "Actor & source" dossier group
              are folded into this head. */}
          <h2
            className={`${styles.inspectorTitle} ${
              effective.outcome ? toneClassName(outcomeTone(effective.outcome)) : ""
            }`}
          >
            {effective.outcome ? OUTCOME_LABEL[effective.outcome] : EVENT_TITLE[effective.eventType]}
          </h2>
          <div className={styles.inspectorDecisionHead}>
            <DecisionActorProvenance actor={effective.actor} recordedAt={effective.recordedAt} />
            {view.isSample ? <SampleBadge /> : null}
          </div>

          <InspectorGroup label="Applicability">
            <div className={styles.chipRow}>
              <DecisionApplicabilityChip
                applicability={view.applicability}
                priorHeadSha={view.reaffirmation.priorHeadSha}
                currentHeadSha={view.reaffirmation.currentHeadSha}
                headRecorded={view.headRecorded}
              />
              {view.divergence ? (
                <DecisionDivergenceChip divergence={view.divergence} />
              ) : (
                <span className={styles.divergenceOmitted}>Divergence omitted — no Report</span>
              )}
            </div>
            {view.reaffirmation.required ? (
              <p className={`${styles.inspectorText} ${styles.toneWarning}`}>
                Recorded at {view.reaffirmation.priorHeadSha ?? "unknown"}; head is now{" "}
                {view.reaffirmation.currentHeadSha ?? "unknown"}. Reaffirmation required.
              </p>
            ) : null}
          </InspectorGroup>

          <InspectorGroup label="Rationale">
            {effective.rationale && effective.rationale.trim().length > 0 ? (
              <p className={styles.inspectorText}>{effective.rationale}</p>
            ) : (
              <p className={styles.inspectorEmpty}>No rationale recorded</p>
            )}
          </InspectorGroup>

          <InspectorGroup label="Applicable head">
            <p className={styles.inspectorMono}>
              {effective.headSha ?? "Head not recorded"}
            </p>
          </InspectorGroup>

          <InspectorGroup label="References">
            <DecisionReferenceList references={effective.references} emptyLabel="No references recorded" />
          </InspectorGroup>

          {effective.acceptedRiskReferences.length > 0 ? (
            <InspectorGroup label="Accepted risks">
              <DecisionReferenceList
                references={effective.acceptedRiskReferences}
                emptyLabel="No accepted risks"
              />
            </InspectorGroup>
          ) : null}

          <InspectorGroup label="Provenance">
            <p className={styles.inspectorMono}>fp:{effective.fingerprint}</p>
            <p className={styles.inspectorQuiet}>
              Content fingerprint — attested, not cryptographically signed.
            </p>
            {effective.actor.role ? (
              <p className={styles.inspectorQuiet}>{effective.actor.role}</p>
            ) : null}
          </InspectorGroup>

          {view.applicability !== "withdrawn" && effective.outcome ? (
            <InspectorGroup label="Actions">
              <div className={styles.inspectorActions}>
                {effective.outcome === "approve-with-accepted-risk" ? (
                  <button
                    type="button"
                    className={styles.inspectorActionDestructive}
                    onClick={(event) => onRevokeRisk(event.currentTarget)}
                  >
                    Revoke risk acceptance
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.inspectorActionDestructive}
                  onClick={(event) => onWithdraw(event.currentTarget)}
                >
                  Withdraw decision
                </button>
              </div>
            </InspectorGroup>
          ) : null}
        </>
      ) : null}

      <InspectorGroup label={`History · latest ${Math.min(inline.length, INLINE_HISTORY_LIMIT)}`}>
        {inline.length === 0 ? (
          <p className={styles.inspectorEmpty}>No history events recorded</p>
        ) : (
          <ol className={styles.historyList}>
            {inline.map((event) => (
              <HistoryRow key={event.eventId} event={event} />
            ))}
          </ol>
        )}
        {hasMore ? (
          <button
            type="button"
            className={styles.historyMoreButton}
            onClick={(event) => onViewHistory(event.currentTarget)}
          >
            View full history ({ordered.length} events)
          </button>
        ) : null}
      </InspectorGroup>
    </>
  );
}

/* --- Shared history row ----------------------------------------------- */

function HistoryRow({ event, expanded = false }: { event: DecisionHistoryEvent; expanded?: boolean }) {
  const tone = event.outcome ? outcomeTone(event.outcome) : "muted";
  const lineage =
    event.supersedesEventId
      ? "supersedes a prior decision"
      : event.reaffirmsEventId
        ? "reaffirms a prior decision"
        : event.withdrawsEventId
          ? "acts on a prior decision"
          : null;
  return (
    <li className={`${styles.historyRow} ${expanded ? styles.historyRowExpanded : ""}`}>
      <span className={styles.historyMark} aria-hidden="true">
        <span className={`${styles.historyMarkDot} ${toneClassName(tone)}`} />
      </span>
      <span className={styles.historyContent}>
        <span className={styles.historyTop}>
          <span className={`${styles.historyTitle} ${toneClassName(tone)}`}>
            {EVENT_TITLE[event.eventType]}
          </span>
          {event.outcome ? (
            <span className={styles.historyOutcome}>{OUTCOME_LABEL[event.outcome]}</span>
          ) : null}
        </span>
        <span className={styles.historyMeta}>
          <span>{event.actor.displayLabel}</span>
          <span className={styles.metaDot}>·</span>
          <span>{event.recordedAt}</span>
          {event.headSha ? (
            <>
              <span className={styles.metaDot}>·</span>
              <span className={styles.historyHead}>{event.headSha}</span>
            </>
          ) : null}
        </span>
        {lineage ? <span className={styles.historyLineage}>{lineage}</span> : null}
        {expanded && event.rationale ? (
          <span className={styles.historyRationale}>{event.rationale}</span>
        ) : null}
        {expanded ? (
          <span className={styles.historyFingerprint}>fp:{fingerprintPrefix(event.fingerprint)}</span>
        ) : null}
      </span>
    </li>
  );
}

/* --- Full history surface (§14) --------------------------------------- */

export function DecisionHistorySurface({
  history,
  onClose,
  returnFocusRef,
}: {
  history: DecisionHistoryEvent[];
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const ordered = [...history].reverse();
  return (
    <DecisionDialog
      title="Full decision history"
      description="Every recorded sample event for this case, newest first. History is retained; superseded and withdrawn events are never deleted."
      onCancel={onClose}
      returnFocusRef={returnFocusRef}
      footer={
        <button type="button" className={styles.dialogPrimary} onClick={onClose}>
          Close
        </button>
      }
    >
      <ol className={`${styles.historyList} ${styles.historyListFull}`}>
        {ordered.map((event) => (
          <HistoryRow key={event.eventId} event={event} expanded />
        ))}
      </ol>
    </DecisionDialog>
  );
}
