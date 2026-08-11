"use client";

import type { ReviewCollectionGroup } from "../../lib/r6e/collection-projection";
import ReviewRow from "./ReviewRow";
import styles from "./review-collection.module.css";

type ReviewGroupProps = Readonly<{ group: ReviewCollectionGroup }>;

export default function ReviewGroup({ group }: ReviewGroupProps) {
  return (
    <section className={styles.group} aria-labelledby={`review-group-${group.groupId}`}>
      <h3 id={`review-group-${group.groupId}`}>{group.label}</h3>
      <ul className={styles.rows}>
        {group.rows.map((row) => <ReviewRow key={row.reviewId} row={row} />)}
      </ul>
    </section>
  );
}
