"use client";

/* R1B.6 — Production Workspace V2 · Decision Plate boundary.

   The terminal Canvas row and the production presentation boundary for the
   recorded Human Decision. It renders the approved resting shapes — empty (A),
   unavailable (I) and resting recorded (B/C/F/H) — per the r0b2 contract, and
   in real mode wires the primary action to the route owner's decision flow
   (record / change / reaffirm / retry). The Plate communicates the effective
   current state only; full lineage lives in Decision Context (§8, §14).

   The Plate never calls storage and never holds decision state. When the case's
   decision cannot be mutated (fixture sample, or a malformed / unreadable
   ledger), the primary action is rendered as genuinely unavailable with an
   explicit, non-colour-only reason — never a control that silently does nothing
   and never a fake successful write. No `window.confirm`. */

import styles from "../workspace-v2.module.css";
import {
  DecisionActorProvenance,
  DecisionApplicabilityChip,
  DecisionDivergenceChip,
  DecisionFingerprintChip,
  DecisionOutcomeToken,
  DecisionRationaleSummary,
  DecisionReferenceCounts,
  SampleBadge,
} from "./atoms";
import { recommendationTone } from "./presentation";
import {
  RECOMMENDATION_LABEL,
  type DecisionMutationCapability,
  type DecisionPlateViewModel,
  type DecisionRecordedView,
  type DecisionEmptyView,
  type DecisionUnavailableView,
} from "../../../lib/workspace-v2/view-model";

/* The plate's primary actions. `withdraw` is not a plate action — it lives in
   Decision Context (§14). */
export type PlateAction = "record" | "change" | "reaffirm" | "retry";

/* Interactive decision handlers from the route owner. Absent (null) in fixture
   mode, when the mutation capability is a sample, or when the ledger is
   unavailable — the plate then renders the action as unavailable. */
export type PlateDecisionHandlers = {
  pending: boolean;
  onAction: (action: PlateAction, trigger: HTMLElement) => void;
};

export function DecisionPlateBoundary({
  decision,
  mutation,
  current,
  handlers,
  onViewContext,
}: {
  decision: DecisionPlateViewModel;
  mutation: DecisionMutationCapability;
  current: boolean;
  handlers: PlateDecisionHandlers | null;
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
    /* A plain container, not a <footer>: at this position a <footer> would be
       exposed as a stray `contentinfo` landmark. The terminal Decision Plate is
       content within the Verification Canvas <main>, not a page-level landmark. */
    <div className={plateClass} id="wsv2-decision-plate">
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

        <PlateActions
          decision={decision}
          mutation={mutation}
          handlers={handlers}
          onViewContext={onViewContext}
        />
      </div>

      {decision.status === "recorded" ? <RecordedSecondRow view={decision} /> : null}
    </div>
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
      {view.fingerprint ? <DecisionFingerprintChip fingerprint={view.fingerprint} /> : null}
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

/* The effective primary action for the current decision state. */
function primaryActionFor(decision: DecisionPlateViewModel): { action: PlateAction; label: string } {
  if (decision.status === "unavailable") return { action: "retry", label: "Retry" };
  if (decision.status === "empty") return { action: "record", label: "Record decision" };
  if (decision.applicability === "withdrawn") return { action: "record", label: "Record new decision" };
  if (decision.needsReaffirmation) return { action: "reaffirm", label: "Reaffirm" };
  return { action: "change", label: "Change decision" };
}

function PlateActions({
  decision,
  mutation,
  handlers,
  onViewContext,
}: {
  decision: DecisionPlateViewModel;
  mutation: DecisionMutationCapability;
  handlers: PlateDecisionHandlers | null;
  onViewContext: (trigger: HTMLElement) => void;
}) {
  const viewLabel = decision.status === "empty" ? "View reasoning" : "View decision context";
  const { action, label } = primaryActionFor(decision);
  /* The action is live only when there are interactive handlers AND the ledger
     is actually mutable (available). Retry (state I) is always offered when
     handlers exist, since it re-reads rather than writes. */
  const canAct =
    handlers !== null && (action === "retry" || mutation.kind === "available");

  return (
    <div className={styles.plateActionGroup}>
      <button
        type="button"
        className={styles.plateActionSecondary}
        onClick={(event) => onViewContext(event.currentTarget)}
      >
        {viewLabel}
      </button>
      {canAct && handlers ? (
        <button
          type="button"
          className={styles.plateActionPrimary}
          data-mutation-control="decision"
          aria-disabled={handlers.pending}
          onClick={(event) => {
            if (handlers.pending) return;
            handlers.onAction(action, event.currentTarget);
          }}
        >
          {handlers.pending ? "Working…" : label}
        </button>
      ) : (
        <UnavailableAction label={label} mutation={mutation} interactive={handlers !== null} />
      )}
    </div>
  );
}

/* A disabled control with an explicit, non-colour-only reason (§19). Distinct
   from a functional button that does nothing. */
function UnavailableAction({
  label,
  mutation,
  interactive,
}: {
  label: string;
  mutation: DecisionMutationCapability;
  interactive: boolean;
}) {
  const reason =
    mutation.kind === "sample"
      ? `${label} is demonstrative on sample data and never writes to this browser.`
      : mutation.kind === "unavailable"
        ? `${label} is unavailable: ${mutation.reason}`
        : !interactive
          ? `${label} cannot be saved in this browser right now.`
          : `${label} is unavailable.`;
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
        {mutation.kind === "sample" ? "Sample" : "Unavailable"}
      </span>
      <span className={styles.visuallyHidden}>{reason}</span>
    </button>
  );
}
