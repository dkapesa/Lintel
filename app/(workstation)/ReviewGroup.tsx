"use client";

import type { ReviewCollectionGroup } from "../../lib/r6e/collection-projection";
import type { ReviewId } from "../../lib/r6c/review-identity";
import ReviewRow from "./ReviewRow";
import styles from "./review-collection.module.css";

type ReviewGroupProps = Readonly<{ group: ReviewCollectionGroup; onReviewFocus: (reviewId: ReviewId) => void }>;

export default function ReviewGroup({ group, onReviewFocus }: ReviewGroupProps) {
  return (
    <section className={styles.group} aria-labelledby={`review-group-${group.groupId}`}>
      <h3 id={`review-group-${group.groupId}`}>{group.label}</h3>
      <ul className={styles.rows}>
        {group.rows.map((row) => <ReviewRow key={row.reviewId} row={row} onReviewFocus={onReviewFocus} />)}
      </ul>
    </section>
  );
}
