import styles from "../reference-reconstruction.module.css";
import { CANONICAL_REVIEW } from "../../_public-r5-recalibrated/canonical-review";
import { ACTIONS, HANDOFF, NEW_REVIEW_HREF, SAMPLE_REVIEW_HREF } from "../reconstruction-content";

/* R5E.1E.2B/D — the unresolved-case handoff.

   Task brief §9. The next operation in the same case, not a repeated hero:
   the hero states what Lintel does, this states that the case is still open
   and offers the same two genuine destinations. No pricing, contact sales,
   sign-in, demo request, account creation or new claim.

   R5E.1E.2D (task brief §11): the canonical values previously rendered as one
   line of 13px grey caption text, which read as editorial copy rather than as
   a product record. Replaced with a structured record reusing the exact
   .fact/.factValue/.microLabel primitives the hero scene's fact row already
   establishes — the same product grammar, not a new one. The first cell
   carries the review's identity (repository, PR, title); the remaining four
   mirror the hero scene's Recommendation/Risk/Requirements/Human Decision
   cells exactly. No value changed. */
export function HandoffSection() {
  return (
    <section className={styles.plainSection} aria-labelledby="handoff-heading">
      <div className={styles.wrap}>
        <p className={styles.microLabel}>{HANDOFF.eyebrow}</p>
        <h2 id="handoff-heading" className={styles.sectionHeadline}>
          {HANDOFF.headline}
        </h2>
        <p className={styles.sectionSupporting}>{HANDOFF.supporting}</p>

        <div className={styles.handoffGrid}>
          <div className={styles.fact}>
            <p className={styles.microLabel}>Review</p>
            <p className={styles.factValue}>
              <span className={styles.mono}>{CANONICAL_REVIEW.repository}</span>
            </p>
            <p className={styles.handoffGridTitle}>
              <span className={styles.mono}>{CANONICAL_REVIEW.pullRequestLabel}</span> —{" "}
              {CANONICAL_REVIEW.title}
            </p>
          </div>
          <div className={styles.fact}>
            <p className={styles.microLabel}>Recommendation</p>
            <p className={styles.factValue}>{CANONICAL_REVIEW.recommendation}</p>
          </div>
          <div className={styles.fact}>
            <p className={styles.microLabel}>Risk</p>
            <p className={styles.factValue}>{CANONICAL_REVIEW.riskLabel}</p>
          </div>
          <div className={styles.fact}>
            <p className={styles.microLabel}>Requirements</p>
            <p className={styles.factValue}>{CANONICAL_REVIEW.requirementsSummary}</p>
          </div>
          <div className={styles.fact}>
            <p className={styles.microLabel}>Human Decision</p>
            <p className={`${styles.factValue} ${styles.factPending}`}>
              {CANONICAL_REVIEW.humanDecision}
            </p>
          </div>
        </div>

        <p className={styles.heroActions}>
          <a className={`${styles.btn} ${styles.btnPrimary} ${styles.btnRegular}`} href={SAMPLE_REVIEW_HREF}>
            {ACTIONS.primary}
          </a>
          <a className={`${styles.btn} ${styles.btnSecondary} ${styles.btnRegular}`} href={NEW_REVIEW_HREF}>
            {ACTIONS.secondary}
          </a>
        </p>
      </div>
    </section>
  );
}
