import styles from "../public-r5-recalibrated.module.css";
import { CANONICAL_REVIEW, QUEUE_CONTEXT_ROWS } from "../canonical-review";

interface ReviewQueueProps {
  onSelectReview: () => void;
}

/* R5E.1B — Review Queue.
   PR #482 is the one genuine working control
   (docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §6a.1): a semantic
   <button>, precisely selected, with a non-colour cue in addition to its
   selected fill. The two context rows are genuine fixture titles rendered
   as inert text — not buttons, not links, not focusable — per §3.11. */
export function ReviewQueue({ onSelectReview }: ReviewQueueProps) {
  return (
    <div className={styles.queue}>
      <p className={styles.queueHeading}>Needs attention</p>
      <ul className={styles.queueList}>
        <li>
          <button
            type="button"
            className={`${styles.queueRow} ${styles.queueRowSelected}`}
            aria-pressed="true"
            onClick={onSelectReview}
          >
            <span className={styles.queueRowRepo}>
              {CANONICAL_REVIEW.repository} · {CANONICAL_REVIEW.pullRequestLabel}
            </span>
            <span className={styles.queueRowTitle}>{CANONICAL_REVIEW.title}</span>
            <span className={styles.queueRowMeta}>
              <span>{CANONICAL_REVIEW.recommendation}</span>
              <span>{CANONICAL_REVIEW.riskLabel}</span>
              <span>{CANONICAL_REVIEW.requirementsSummary}</span>
            </span>
            <span className={styles.queueSelectedTag}>Selected · inspectable in this sample</span>
          </button>
        </li>
      </ul>

      <p className={styles.queueContextNote}>
        Other reviews are shown for context only and are not inspectable in this sample.
      </p>
      <ul className={styles.queueList} aria-hidden="true">
        {QUEUE_CONTEXT_ROWS.map((row) => (
          <li key={row.reviewKey} className={styles.queueContextRow}>
            <span className={styles.queueRowRepo}>
              {row.repository} · {row.pullRequestLabel}
            </span>
            <span className={styles.queueRowTitle}>{row.title}</span>
            <span className={styles.queueRowMeta}>
              <span>{row.recommendation}</span>
              <span>{row.riskLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
