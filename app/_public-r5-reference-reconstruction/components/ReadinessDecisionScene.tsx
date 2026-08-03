import styles from "../reference-reconstruction.module.css";
import { SceneMotion } from "./SceneMotion";
import {
  CANONICAL_REVIEW,
  DECISION_OUTCOMES,
  DECISION_READINESS,
  READINESS,
} from "../../_public-r5-recalibrated/canonical-review";
import { DECISION_AUTHORITY_STATEMENT, DECISION_OUTCOMES_NOTE } from "../reconstruction-content";

/* R5E.1E.2B — Readiness and Human Decision.

   docs/r5/R5E1E2B task brief §6–§7. This is the authority-boundary
   demonstration, not the interactive decision surface — that remains in the
   sample Workspace at /workspace?source=fixture. This scene is read-only in
   the same sense every other public scene is: no outcome is selectable, no
   submission exists, and nothing here writes anywhere.

   Every value is imported from the frozen typed module. DECISION_OUTCOMES is
   transcribed verbatim from lib/workspace-v2/view-model.ts's own
   OUTCOME_LABEL/OUTCOME_MEANING (verified against that file directly), so the
   seven labels rendered here are the product's genuine outcomes, not a
   simplified or renamed set.

   All seven are shown, not a subset: a subset would risk implying the others
   do not exist. None carries a selected state — there is no CSS class or
   attribute anywhere in this file that marks any outcome as chosen — and none
   is a <button>, <input type="radio"> or <input type="checkbox">; they are
   plain <li> text, because this scene demonstrates that outcomes exist and
   are unselected, not a control a visitor could operate. */
export function ReadinessDecisionScene() {
  return (
    <SceneMotion className={styles.scene}>
      <div className={styles.scenePlate}>
        <div className={styles.sceneFrame}>
          <div className={styles.sceneChrome}>
            <span className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</span>
            <span className={styles.sceneChromeTail}>Readiness</span>
          </div>

          <div className={styles.relationBody}>
            {/* Step 1: readiness facts are established — visible at rest. */}
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

            {/* Step 2: open blockers, and the proof still missing or unverified,
                receive restrained emphasis. */}
            <p className={styles.recordTags} data-step="2">
              <span className={styles.tagState} data-blocking="true">
                {READINESS.blockers} blocking
              </span>
              <span className={styles.tagStatus} data-status="unverified">
                {READINESS.missingOrUnverified} missing or unverified
              </span>
              <span className={styles.tagPlain}>{READINESS.stale} stale</span>
            </p>
            <p className={styles.readinessNote} data-step="2">
              {READINESS.note}
            </p>

            {/* Step 3: Human Decision PENDING becomes visually prominent. */}
            <div className={styles.decisionPendingBlock} data-step="3">
              <p className={styles.microLabel}>Human Decision</p>
              <p className={styles.decisionPendingValue}>{CANONICAL_REVIEW.humanDecision}</p>
              <p className={styles.recordStatement}>{DECISION_READINESS.priorDecision}</p>
              <p className={styles.recordSource}>
                <code className={styles.mono}>{DECISION_READINESS.appliesTo}</code>
              </p>
            </div>

            {/* Step 4: the authority statement, and a restrained, complete,
                non-interactive preview of the outcome set. */}
            <div data-step="4">
              <p className={styles.authorityStatement}>{DECISION_AUTHORITY_STATEMENT}</p>
              <ul
                className={styles.outcomeChipList}
                aria-label="Available decision outcomes, all unselected"
              >
                {DECISION_OUTCOMES.map((outcome) => (
                  <li key={outcome.recordKey} className={styles.outcomeChip}>
                    {outcome.label}
                  </li>
                ))}
              </ul>
              <p className={styles.outcomeNote}>{DECISION_OUTCOMES_NOTE}</p>
            </div>
          </div>
        </div>
      </div>
    </SceneMotion>
  );
}
