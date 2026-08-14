"use client";

import Link from "next/link";
import type { FocusEvent, MouseEvent } from "react";
import type { ReviewId } from "../../lib/r6c/review-identity";
import { formatRoute } from "../../lib/r6c/route-contract";
import type { ReviewRowViewModel } from "../../lib/r6e/collection-projection";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./review-collection.module.css";

type ReviewRowProps = Readonly<{ row: ReviewRowViewModel; onReviewFocus?: (reviewId: ReviewId) => void }>;

function isPlainPrimaryClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function recencyLabel(value: string | null): string | null {
  if (value === null) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export default function ReviewRow({ row, onReviewFocus }: ReviewRowProps) {
  const { state, band, dispatchBound } = useWorkstation();
  const selected = state.selectedReview.status === "available" && state.selectedReview.reviewId === row.reviewId;
  const href = formatRoute({ destination: "reviews", reviewId: row.reviewId, mode: "overview" });
  const recency = recencyLabel(row.lastActivityAt);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainPrimaryClick(event)) return;
    event.preventDefault();
    const result = dispatchBound({ id: "review/select", reviewId: row.reviewId }, "visible-ui");
    if (result.status !== "unavailable" && band === "narrow") {
      dispatchBound({ id: "queue/show-narrow-surface", surface: "workspace" }, "system");
    }
  };

  const onFocus = (_event: FocusEvent<HTMLAnchorElement>) => onReviewFocus?.(row.reviewId);

  return (
    <li className={styles.rowItem}>
      <Link
        className={`${styles.row}${selected ? ` ${styles.rowSelected}` : ""}`}
        href={href}
        data-review-row
        aria-current={selected ? "page" : undefined}
        onClick={onClick}
        onFocus={onFocus}
      >
        <span className={styles.rowMain}>
          <span className={styles.rowTitle}>{row.title}</span>
          <span className={styles.rowMetadata}>
            <span className={styles.rowRepository}>{row.repository}</span>
            {recency && <span className={styles.rowRecency}>{recency}</span>}
          </span>
        </span>
        <span className={styles.rowState}>{row.triageState}</span>
      </Link>
    </li>
  );
}
