import styles from "../reference-reconstruction.module.css";
import { SceneMotion } from "./SceneMotion";
import {
  CANONICAL_REVIEW,
  PRIMARY_FINDING,
  QUEUE_CONTEXT_ROWS,
  REVIEW_OVERVIEW,
} from "../../_public-r5-recalibrated/canonical-review";

/* R5E.1E.2A — hero product scene.

   Purpose-designed for the public page, not a reuse of the complete Workspace
   shell. docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md §13 rejects the
   sticky four-column reproduction the current recalibrated route ships; §17
   fixes what replaces it.

   The scene answers exactly four questions in its first read:
     1. which PR is being reviewed,
     2. what Lintel recommends,
     3. why attention is required,
     4. that Human Decision remains pending.

   Composition follows the reference proportion rather than the application's:
   a narrow review-context column and one dominant selected-review area. The
   Rail, Queue, Workspace, Inspector and eight stages are deliberately not
   given equal weight, and the eight-stage spine does not appear at all.

   Every value is imported from the frozen typed module. Nothing is restated,
   recalculated or invented. The two context rows are genuine fixture cases and
   are rendered as inert text, never as a second working demo.

   No fixed height, no overflow scrolling, no internal scrollbar: the record
   count is fixed at author time, so the content composes to fit. */
export function HeroReviewScene() {
  return (
    <SceneMotion className={styles.scene}>
      <div className={styles.scenePlate}>
        <div className={styles.sceneFrame}>
          <div className={styles.sceneChrome}>
            <span className={styles.mono}>{CANONICAL_REVIEW.repository}</span>
            <span className={styles.sceneChromeDot} aria-hidden="true" />
            <span className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</span>
            <span className={styles.sceneChromeTail}>{CANONICAL_REVIEW.selectedReviewLabel}</span>
          </div>

          <div className={styles.heroSceneBody}>
            <aside className={styles.heroSceneAside} aria-label="Review context">
              <p className={styles.microLabel}>Needs attention</p>

              <div className={styles.contextCardSelected}>
                <p className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</p>
                <p className={styles.contextCardTitle}>{CANONICAL_REVIEW.title}</p>
                <p className={styles.contextCardMeta}>
                  {CANONICAL_REVIEW.recommendation} · {CANONICAL_REVIEW.riskLabel}
                </p>
                <p className={styles.contextCardState}>Selected</p>
              </div>

              <p className={styles.asideNote}>Context only — not inspectable here.</p>

              <ul className={styles.contextList}>
                {QUEUE_CONTEXT_ROWS.map((row) => (
                  <li key={row.reviewKey} className={styles.contextCard}>
                    <p className={styles.mono}>{row.pullRequestLabel}</p>
                    <p className={styles.contextCardTitle}>{row.title}</p>
                    <p className={styles.contextCardMeta}>
                      {row.recommendation} · {row.riskLabel}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>

            <div className={styles.heroSceneMain}>
              <p className={styles.sceneTitle}>{CANONICAL_REVIEW.title}</p>
              <p className={styles.sceneSub}>
                <span className={styles.mono}>{CANONICAL_REVIEW.branch}</span>
                <span className={styles.sceneChromeDot} aria-hidden="true" />
                <span className={styles.mono}>head {CANONICAL_REVIEW.headSha}</span>
              </p>

              {/* Step 2 of the hero sequence: readiness facts receive restrained
                  emphasis. A definition list, not a table — these are four
                  labelled values, not tabular data. */}
              <dl className={styles.factRow} data-step="2">
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
                <div className={styles.fact}>
                  <dt className={styles.microLabel}>Human Decision</dt>
                  <dd className={`${styles.factValue} ${styles.factPending}`}>
                    {CANONICAL_REVIEW.humanDecision}
                  </dd>
                </div>
              </dl>

              {/* Step 3: the attention record becomes prominent. */}
              <article className={styles.attentionRecord} data-step="3">
                <p className={styles.recordTags}>
                  <span className={styles.tagSeverity}>{PRIMARY_FINDING.severity}</span>
                  <span className={styles.tagPlain}>{PRIMARY_FINDING.category}</span>
                  <span className={styles.tagPlain}>{PRIMARY_FINDING.provenance}</span>
                </p>
                <h3 className={styles.recordTitle}>{PRIMARY_FINDING.title}</h3>
                <p className={styles.recordSource}>
                  <code className={styles.mono}>{PRIMARY_FINDING.file}</code>
                </p>
              </article>

              <p className={styles.sceneFootnote}>
                <span className={styles.microLabel}>Next inspection</span>
                {REVIEW_OVERVIEW.nextInspection}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SceneMotion>
  );
}
