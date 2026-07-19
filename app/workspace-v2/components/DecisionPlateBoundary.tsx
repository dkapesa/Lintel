"use client";

/* R1B.0 — Production Workspace V2 · Decision Plate boundary.

   The terminal Canvas row and the production presentation boundary for the
   recorded Human Decision. It renders fixture-backed decision projections in
   three shapes — empty (A), unavailable (I) and resting recorded (B/C) — per
   the r0b2 contract.

   R1B.0 scope: no ledger writes, no persistence, no import of any decision
   mutation code. The only wired action is "View decision context / reasoning",
   which is pure UI state. Every mutating action (record / change / reaffirm /
   retry) is presented as genuinely unavailable and labelled pending production
   integration — never as a control that silently does nothing, and never as a
   fake successful write. */

import styles from "../workspace-v2.module.css";
import {
  DecisionActorProvenance,
  DecisionApplicabilityChip,
  DecisionDivergenceChip,
  DecisionOutcomeToken,
  DecisionRationaleSummary,
  DecisionReferenceCounts,
  SampleBadge,
} from "./atoms";
import { recommendationTone } from "./presentation";
import {
  RECOMMENDATION_LABEL,
  type DecisionPlateViewModel,
  type DecisionRecordedView,
  type DecisionEmptyView,
  type DecisionUnavailableView,
} from "../../../lib/workspace-v2/view-model";

export function DecisionPlateBoundary({
  decision,
  current,
  onViewContext,
}: {
  decision: DecisionPlateViewModel;
  current: boolean;
  onViewContext: (trigger: HTMLElement) => void;
}) {
  const plateClass = [
    styles.plate,
    current ? styles.plateCurrent : "",
    decision.status === "unavailable" ? styles.plateError : "",
    decision.status === "recorded" ? styles.plateRecorded : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={plateClass} id="wsv2-decision-plate">
      <div className={styles.plateMain}>
        <div className={styles.plateState}>
          <span className={styles.plateLabel}>
            <span className={styles.plateStep}>5</span>
            Human decision
          </span>

          {decision.status === "empty" ? <EmptyHeadline view={decision} /> : null}
          {decision.status === "unavailable" ? <UnavailableHeadline view={decision} /> : null}
          {decision.status === "recorded" ? <RecordedHeadline view={decision} /> : null}
        </div>

        <PlateActions decision={decision} onViewContext={onViewContext} />
      </div>

      {decision.status === "recorded" ? <RecordedSecondRow view={decision} /> : null}
    </footer>
  );
}

function EmptyHeadline({ view }: { view: DecisionEmptyView }) {
  return (
    <>
      <span className={styles.plateHeadline}>No engineer decision recorded</span>
      <span className={styles.plateDetail}>
        Lintel recommends{" "}
        <span className={`${styles.plateRec} ${recommendationTone(view.recommendation)}`}>
          {RECOMMENDATION_LABEL[view.recommendation].toUpperCase()}
        </span>
        <span className={styles.metaDot}>·</span>
        <span className={styles.plateBlocking}>{view.openBlockingRequirements}</span> blocking
        requirement{view.openBlockingRequirements === 1 ? "" : "s"} open
      </span>
    </>
  );
}

function UnavailableHeadline({ view }: { view: DecisionUnavailableView }) {
  return (
    <>
      <span className={`${styles.plateHeadline} ${styles.toneDanger}`}>
        Decision state unavailable
      </span>
      <span className={styles.plateDetail}>
        <span className={styles.plateErrorFlag}>Read error</span>
        {view.readError}
      </span>
    </>
  );
}

function RecordedHeadline({ view }: { view: DecisionRecordedView }) {
  return (
    <div className={styles.plateRecordedTop}>
      <DecisionOutcomeToken outcome={view.outcome} />
      <DecisionActorProvenance actor={view.actor} recordedAt={view.recordedAt} />
      {view.applicableHeadSha ? (
        <span className={styles.plateHead}>{view.applicableHeadSha}</span>
      ) : (
        <span className={styles.plateHeadUnknown}>Head not recorded</span>
      )}
      {view.isSample ? <SampleBadge /> : null}
    </div>
  );
}

function RecordedSecondRow({ view }: { view: DecisionRecordedView }) {
  return (
    <div className={styles.plateRecordedBottom}>
      <DecisionApplicabilityChip
        applicability={view.applicability}
        priorHeadSha={view.priorHeadSha}
        currentHeadSha={view.currentHeadSha}
        headRecorded={view.applicableHeadSha !== null}
      />
      {view.divergence ? <DecisionDivergenceChip divergence={view.divergence} /> : null}
      <DecisionReferenceCounts
        references={view.references}
        acceptedRiskReferences={view.acceptedRiskReferences}
      />
      <span className={styles.plateRationaleSummary}>
        <DecisionRationaleSummary rationale={view.rationale} />
      </span>
    </div>
  );
}

/* Actions. "View …" is wired (pure UI state). The mutating primary action is
   rendered as genuinely unavailable — R1B.1 wires it to the real ledger. */
function PlateActions({
  decision,
  onViewContext,
}: {
  decision: DecisionPlateViewModel;
  onViewContext: (trigger: HTMLElement) => void;
}) {
  const viewLabel = decision.status === "empty" ? "View reasoning" : "View decision context";
  const pendingLabel = pendingActionLabel(decision);

  return (
    <div className={styles.plateActionGroup}>
      <button
        type="button"
        className={styles.plateActionSecondary}
        onClick={(event) => onViewContext(event.currentTarget)}
      >
        {viewLabel}
      </button>
      <PendingAction label={pendingLabel} />
    </div>
  );
}

function pendingActionLabel(decision: DecisionPlateViewModel): string {
  if (decision.status === "unavailable") return "Retry";
  if (decision.status === "empty") return "Record decision";
  if (decision.applicability === "withdrawn") return "Record new decision";
  if (decision.needsReaffirmation) return "Reaffirm";
  return "Change decision";
}

/* A disabled control with an explicit, non-colour-only reason. Distinct from a
   functional button that does nothing. */
function PendingAction({ label }: { label: string }) {
  const reason = `${label} is not wired in this scaffold — pending production integration (R1B.1).`;
  return (
    <button
      type="button"
      className={styles.plateActionPending}
      aria-disabled="true"
      title={reason}
      onClick={(event) => event.preventDefault()}
    >
      {label}
      <span className={styles.pendingTag} aria-hidden="true">
        Pending
      </span>
      <span className={styles.visuallyHidden}>{reason}</span>
    </button>
  );
}
