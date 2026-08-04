import styles from "../reference-reconstruction.module.css";
import { PublicSceneViews } from "./PublicSceneViews";
import {
  CANONICAL_REVIEW,
  DECISION_OUTCOMES,
  DECISION_READINESS,
  READINESS,
} from "../../_public-r5-recalibrated/canonical-review";
import { DECISION_AUTHORITY_STATEMENT, DECISION_OUTCOMES_NOTE } from "../reconstruction-content";

const DEFAULT_READINESS_VIEW = "readiness" as const;
const READINESS_SEQUENCE_DURATION = 5420;

function ReadinessPersistentContent() {
  return (
    <>
      <dl className={`${styles.factRow} ${styles.factRowThree}`}>
        <div className={styles.fact}>
          <dt className={styles.microLabel}>Recommendation</dt>
          <dd className={styles.factValue}>{CANONICAL_REVIEW.recommendation}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.microLabel}>Risk</dt>
          <dd className={styles.factValue}>{CANONICAL_REVIEW.riskLabel}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.microLabel}>Requirements</dt>
          <dd className={styles.factValue}>{CANONICAL_REVIEW.requirementsSummary}</dd>
        </div>
      </dl>

      <div className={styles.decisionPendingBlock} data-readiness-step="r3">
        <p className={styles.microLabel}>Human Decision</p>
        <p className={styles.decisionPendingValue}>{CANONICAL_REVIEW.humanDecision}</p>
      </div>
    </>
  );
}

function ReadinessPanel() {
  return (
    <div className={styles.readinessPanel}>
      <div className={styles.readinessBreakdown} data-readiness-step="r1">
        <p className={styles.recordTags}>
          <span className={styles.tagState} data-blocking="true">
            {READINESS.blockers} blocking
          </span>
          <span className={styles.tagStatus} data-status="unverified">
            {READINESS.missingOrUnverified} missing or unverified
          </span>
          <span className={styles.tagPlain}>{READINESS.stale} stale</span>
        </p>
      </div>
      <p className={`${styles.readinessNote} ${styles.readinessChangeNote}`} data-readiness-step="r2">
        {READINESS.note}
      </p>
    </div>
  );
}

function DecisionBoundaryPanel() {
  return (
    <div className={styles.decisionBoundaryPanel}>
      <p className={styles.heroPriorDecision}>{DECISION_READINESS.priorDecision}</p>
      <p className={styles.recordSource}>
        <code className={styles.mono}>{DECISION_READINESS.appliesTo}</code>
      </p>
      <p className={styles.authorityStatement}>{DECISION_AUTHORITY_STATEMENT}</p>
      <p className={styles.decisionSelectionState}>{DECISION_READINESS.outcomeSelected}</p>
    </div>
  );
}

function ReadinessOutcomes() {
  return (
    <div className={styles.outcomeBoundary} data-readiness-step="r4">
      <ul className={styles.outcomeChipList} aria-label="Available decision outcomes, all unselected">
        {DECISION_OUTCOMES.map((outcome) => (
          <li key={outcome.recordKey} className={styles.outcomeChip}>
            {outcome.label}
          </li>
        ))}
      </ul>
      <p className={styles.outcomeNote}>{DECISION_OUTCOMES_NOTE}</p>
    </div>
  );
}

/* R5E.1E.4C — two inspectable readiness views. The recommendation, risk,
   requirements, PENDING state and all seven outcomes remain persistent and
   unchanged; the outcome chips remain plain non-focusable list items. */
export function ReadinessDecisionScene() {
  const views = [
    {
      key: "readiness",
      label: "Readiness",
      control: <span>Readiness</span>,
      panel: <ReadinessPanel />,
    },
    {
      key: "decision-boundary",
      label: "Decision boundary",
      control: <span>Decision boundary</span>,
      panel: <DecisionBoundaryPanel />,
    },
  ] as const;

  return (
    <PublicSceneViews
      idPrefix="readiness-decision"
      classNames={{
        scene: `${styles.scene} ${styles.readinessInteractionScene}`,
        interaction: styles.publicSceneInteraction,
        plate: styles.scenePlate,
        frame: styles.sceneFrame,
        body: styles.relationBody,
        controls: `${styles.publicSceneSwitchControls} ${styles.readinessViewControls}`,
        staticControls: `${styles.publicSceneStaticLabel} ${styles.readinessViewControls}`,
        tab: styles.publicSceneSwitchTab,
        panelStack: `${styles.publicScenePanelStack} ${styles.readinessPanelStack}`,
        panel: styles.publicScenePanel,
      }}
      defaultKey={DEFAULT_READINESS_VIEW}
      groupLabel="Readiness views"
      introductionDuration={READINESS_SEQUENCE_DURATION}
      orientation="horizontal"
      staticPanelLabel="Readiness"
      chrome={
        <div className={styles.sceneChrome}>
          <span className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</span>
          <span className={styles.sceneChromeTail}>Readiness</span>
        </div>
      }
      persistent={<ReadinessPersistentContent />}
      trailing={<ReadinessOutcomes />}
      views={views}
    />
  );
}
