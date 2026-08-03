import styles from "../reference-reconstruction.module.css";
import { SceneMotion } from "./SceneMotion";
import {
  CANONICAL_REVIEW,
  MISSING_PROOF_RECORDS,
  READINESS,
} from "../../_public-r5-recalibrated/canonical-review";

/* R5E.1E.2A/B — Missing proof → Blocking requirement.

   docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md §15. The visitor must
   immediately see which proof is absent, what requirement stays open, why the
   review cannot clear, and that nothing has been resolved.

   R5E.1E.2B refinement (task brief §4): this public scene now renders only the
   primary relationship — ev_coverage_gap ("Provider failure cases absent from
   test suite") is genuinely *missing* and leaves req_test_provider_failure
   *blocking*. The second, advisory record (ev_error_shape_inferred, model
   assisted) is deliberately not rendered here so the scene carries one
   principal relationship instead of two. It is not deleted from canonical
   data or from the actual product — MISSING_PROOF_RECORDS still holds both,
   and app/_public-r5-recalibrated is untouched — and nothing here implies it
   has been resolved; it simply is not this scene's subject. The reduced
   height this leaves is used for section balance against its copy column,
   not filled with a substitute.

   Provenance colour follows the frozen semantic tokens: amber for missing
   proof and unresolved requirements. Green appears nowhere; this case never
   resolves. */

const PRIMARY_MISSING_PROOF = MISSING_PROOF_RECORDS[0];

export function MissingProofRequirementScene() {
  const blocking = PRIMARY_MISSING_PROOF.affectsRequirement.state.startsWith("blocking");

  return (
    <SceneMotion className={styles.scene}>
      <div className={styles.scenePlate}>
        <div className={styles.sceneFrame}>
          <div className={styles.sceneChrome}>
            <span className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</span>
            <span className={styles.sceneChromeTail}>Missing proof</span>
          </div>

          <div className={`${styles.relationBody} ${styles.relationBodyCompact}`}>
            {/* Step 1: missing proof is established — visible at rest. */}
            <div className={styles.proofPair} data-blocking={blocking ? "true" : undefined}>
              <div className={styles.recordCard}>
                <p className={styles.recordTags}>
                  <span className={styles.tagStatus} data-status={PRIMARY_MISSING_PROOF.status}>
                    {PRIMARY_MISSING_PROOF.status}
                  </span>
                  <span
                    className={styles.tagProvenance}
                    data-provenance={PRIMARY_MISSING_PROOF.provenance}
                  >
                    {PRIMARY_MISSING_PROOF.provenance}
                  </span>
                </p>
                <h3 className={styles.recordSubtitle}>{PRIMARY_MISSING_PROOF.title}</h3>
                <p className={styles.recordStatement}>{PRIMARY_MISSING_PROOF.statement}</p>
                <p className={styles.recordSource}>
                  <code className={styles.mono}>{PRIMARY_MISSING_PROOF.source}</code>
                </p>
              </div>

              {/* Step 2: the requirement becomes visibly connected. */}
              <p className={styles.relationEdge} data-step="2">
                <span className={styles.relationEdgeRule} aria-hidden="true" />
                <span className={styles.relationEdgeLabel}>Leaves open</span>
              </p>

              <div className={styles.requirementCard} data-step="2">
                <p className={styles.recordTags}>
                  <span className={styles.tagState} data-blocking={blocking ? "true" : undefined}>
                    {PRIMARY_MISSING_PROOF.affectsRequirement.state}
                  </span>
                </p>
                <h4 className={styles.recordSubtitle}>
                  {PRIMARY_MISSING_PROOF.affectsRequirement.title}
                </h4>
              </div>
            </div>

            {/* Step 3: unresolved status remains visible. */}
            <p className={styles.unresolvedBar} data-step="3">
              <span className={styles.unresolvedHeadline}>{READINESS.headline}</span>
              <span className={styles.unresolvedDetail}>
                {CANONICAL_REVIEW.requirementsSummary} · Human Decision{" "}
                {CANONICAL_REVIEW.humanDecision}
              </span>
            </p>
          </div>
        </div>
      </div>
    </SceneMotion>
  );
}
