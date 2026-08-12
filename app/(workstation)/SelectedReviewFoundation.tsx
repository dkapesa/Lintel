"use client";

import type { ReviewMode } from "../../lib/r6c/index";
import type { ReadySelectedReview } from "../../lib/r6f/index";
import ChangeMode from "./ChangeMode";
import EvidenceMode from "./EvidenceMode";
import RequirementsMode from "./RequirementsMode";
import ReviewModeNav from "./ReviewModeNav";
import ReviewModeUnavailable from "./ReviewModeUnavailable";
import ReviewOverview from "./ReviewOverview";
import styles from "./selected-review.module.css";

export default function SelectedReviewFoundation({
  review,
  onModeActivate,
}: {
  review: ReadySelectedReview;
  onModeActivate: (mode: ReviewMode) => void;
}) {
  return (
    <article className={styles.selectedReview}>
      <header className={styles.identityHeader}>
        {review.identity.repository && <p className={styles.eyebrow}>{review.identity.repository}</p>}
        <h1>{review.identity.title}</h1>
        {review.identity.context.length > 0 && (
          <p className={styles.identityContext}>{review.identity.context.join(" · ")}</p>
        )}
      </header>
      <ReviewModeNav links={review.modes} onActivate={onModeActivate} />
      <div className={styles.modeOutlet}>
        {review.mode === "overview"
          ? <ReviewOverview review={review} onModeActivate={onModeActivate} />
          : review.mode === "evidence"
            ? <EvidenceMode review={review} />
            : review.mode === "requirements"
              ? <RequirementsMode review={review} />
              : review.mode === "change"
                ? <ChangeMode review={review} />
            : <ReviewModeUnavailable mode={review.mode} />}
      </div>
    </article>
  );
}
