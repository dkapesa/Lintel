"use client";

/* R0B.2B — Workspace V2 recorded Human Decision · the Decision Plate.

   Presentational only. Four shapes (§8): empty (A), error (I), and the
   resting recorded plate (B/C/F/H). It receives a view model plus typed
   action callbacks and decides which controls to show. It never mutates
   state and never exceeds two logical rows at rest (§8.2, §22.2).

   Action callbacks receive the triggering element so the owner can restore
   focus to it when a dialog closes (§19). */

import styles from "./workspace-v2.module.css";
import {
  RECOMMENDATION_LABEL,
  recommendationToneClass,
} from "./decision-shared";
import {
  DecisionActorProvenance,
  DecisionApplicabilityChip,
  DecisionDivergenceChip,
  DecisionFingerprintChip,
  DecisionOutcomeToken,
  DecisionRationaleSummary,
  DecisionReferenceCounts,
  SampleBadge,
} from "./decision-atoms";
import { terminalEventLabel, type DecisionPlateViewModel } from "./decision-model";

export type DecisionPlateActions = {
  onRecord: (trigger: HTMLElement) => void;
  onChange: (trigger: HTMLElement) => void;
  onReaffirm: (trigger: HTMLElement) => void;
  onSupersede: (trigger: HTMLElement) => void;
  onWithdraw: (trigger: HTMLElement) => void;
  onRevokeRisk: (trigger: HTMLElement) => void;
  onViewContext: (trigger: HTMLElement) => void;
  onRetry: (trigger: HTMLElement) => void;
};

export function DecisionPlate({
  view,
  current,
  actions,
}: {
  view: DecisionPlateViewModel;
  current: boolean;
  actions: DecisionPlateActions;
}) {
  const plateClass = [
    styles.plate,
    current ? styles.plateCurrent : "",
    view.status === "error" ? styles.plateError : "",
    view.status === "recorded" ? styles.plateRecorded : "",
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

          {view.status === "empty" ? <EmptyHeadline view={view} /> : null}
          {view.status === "error" ? <ErrorHeadline view={view} /> : null}
          {view.status === "recorded" ? <RecordedHeadline view={view} /> : null}
        </div>

        <PlateActions view={view} actions={actions} />
      </div>

      {view.status === "recorded" ? <RecordedSecondRow view={view} /> : null}
      {view.isSessionOnly ? (
        <p className={styles.sessionOnlyNote}>Saved for this session only — not persisted.</p>
      ) : null}
    </footer>
  );
}

/* --- State A — no decision recorded ----------------------------------- */

function EmptyHeadline({ view }: { view: DecisionPlateViewModel }) {
  return (
    <>
      <span className={styles.plateHeadline}>No engineer decision recorded</span>
      <span className={styles.plateDetail}>
        Lintel recommends{" "}
        <span className={`${styles.plateRec} ${recommendationToneClass(view.recommendation)}`}>
          {RECOMMENDATION_LABEL[view.recommendation].toUpperCase()}
        </span>
        <span className={styles.metaDot}>·</span>
        <span className={styles.plateBlocking}>{view.openBlockingRequirements}</span> blocking
        requirement{view.openBlockingRequirements === 1 ? "" : "s"} open
      </span>
    </>
  );
}

/* --- State I — decision state unavailable (distinct from A, §24.13) --- */

function ErrorHeadline({ view }: { view: DecisionPlateViewModel }) {
  return (
    <>
      <span className={`${styles.plateHeadline} ${styles.toneDanger}`}>
        Decision state unavailable
      </span>
      <span className={styles.plateDetail}>
        <span className={styles.plateErrorFlag}>Read error</span>
        {view.readError ?? "The decision record could not be read."}
      </span>
    </>
  );
}

/* --- States B/C/F/H — resting recorded plate -------------------------- */

function RecordedHeadline({ view }: { view: DecisionPlateViewModel }) {
  const outcome = view.outcome;
  const terminalLabel =
    !outcome && view.effectiveEventType ? terminalEventLabel(view.effectiveEventType) : null;
  return (
    <div className={styles.plateRecordedTop}>
      {outcome ? <DecisionOutcomeToken outcome={outcome} /> : null}
      {terminalLabel ? (
        <span className={`${styles.plateTerminalLabel} ${styles.toneWarning}`}>{terminalLabel}</span>
      ) : null}
      {view.reaffirmation.required ? (
        <span className={styles.plateNeedsReaffirm}>needs reaffirmation</span>
      ) : null}
      <DecisionActorProvenance actor={view.actor} recordedAt={view.recordedAt} />
      {view.applicableHeadSha ? (
        <span className={styles.plateHead}>{view.applicableHeadSha}</span>
      ) : (
        <span className={styles.plateHeadUnknown}>Head not recorded</span>
      )}
      {view.fingerprint ? <DecisionFingerprintChip fingerprint={view.fingerprint} /> : null}
      {view.isSample ? <SampleBadge /> : null}
    </div>
  );
}

function RecordedSecondRow({ view }: { view: DecisionPlateViewModel }) {
  return (
    <div className={styles.plateRecordedBottom}>
      <DecisionApplicabilityChip
        applicability={view.applicability}
        priorHeadSha={view.reaffirmation.priorHeadSha}
        currentHeadSha={view.reaffirmation.currentHeadSha}
        headRecorded={view.headRecorded}
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

/* --- Actions ---------------------------------------------------------- */

function PlateActions({
  view,
  actions,
}: {
  view: DecisionPlateViewModel;
  actions: DecisionPlateActions;
}) {
  if (view.status === "empty") {
    return (
      <div className={styles.plateActionGroup}>
        <button
          type="button"
          className={styles.plateActionSecondary}
          onClick={(event) => actions.onViewContext(event.currentTarget)}
        >
          View reasoning
        </button>
        <button
          type="button"
          className={styles.plateAction}
          onClick={(event) => actions.onRecord(event.currentTarget)}
        >
          Record decision
        </button>
      </div>
    );
  }

  if (view.status === "error") {
    return (
      <div className={styles.plateActionGroup}>
        <button
          type="button"
          className={styles.plateActionSecondary}
          onClick={(event) => actions.onViewContext(event.currentTarget)}
        >
          View raw
        </button>
        <button
          type="button"
          className={styles.plateAction}
          onClick={(event) => actions.onRetry(event.currentTarget)}
        >
          Retry
        </button>
      </div>
    );
  }

  /* Recorded but no standing outcome — a withdrawal or revocation is the
     effective event, so the next act is a fresh decision. */
  if (view.applicability === "withdrawn" || (!view.outcome && view.status === "recorded")) {
    return (
      <div className={styles.plateActionGroup}>
        <button
          type="button"
          className={styles.plateActionSecondary}
          onClick={(event) => actions.onViewContext(event.currentTarget)}
        >
          View decision context
        </button>
        <button
          type="button"
          className={styles.plateAction}
          onClick={(event) => actions.onRecord(event.currentTarget)}
        >
          Record new decision
        </button>
      </div>
    );
  }

  if (view.reaffirmation.required) {
    return (
      <div className={styles.plateActionGroup}>
        <button
          type="button"
          className={styles.plateActionSecondary}
          onClick={(event) => actions.onSupersede(event.currentTarget)}
        >
          Supersede
        </button>
        <button
          type="button"
          className={styles.plateAction}
          onClick={(event) => actions.onReaffirm(event.currentTarget)}
        >
          Reaffirm
        </button>
      </div>
    );
  }

  return (
    <div className={styles.plateActionGroup}>
      <button
        type="button"
        className={styles.plateActionSecondary}
        onClick={(event) => actions.onViewContext(event.currentTarget)}
      >
        View decision context
      </button>
      <button
        type="button"
        className={styles.plateAction}
        onClick={(event) => actions.onChange(event.currentTarget)}
      >
        Change decision
      </button>
    </div>
  );
}
