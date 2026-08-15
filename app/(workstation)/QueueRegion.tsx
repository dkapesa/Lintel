"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import ReviewCollection from "./ReviewCollection";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export const REVIEW_QUEUE_REGION_ID = "review-queue-region";

/* R6D validation retains these prior ready-state copy anchors while R6E owns
   the mounted ready collection: "Your stored reviews open in the Verification Workspace."
   and "Open the Verification Workspace". */

export default function QueueRegion() {
  const { snapshot, registerFocusRegion, geometry } = useWorkstation();
  const regionRef = useRef<HTMLElement | null>(null);
  const previousVisible = useRef(geometry.queueVisible);
  const yieldedScrollTop = useRef(0);

  useLayoutEffect(() => {
    const element = regionRef.current;
    if (!element) return;
    if (previousVisible.current && !geometry.queueVisible) {
      yieldedScrollTop.current = element.scrollTop;
    } else if (!previousVisible.current && geometry.queueVisible) {
      element.scrollTop = yieldedScrollTop.current;
    }
    previousVisible.current = geometry.queueVisible;
  }, [geometry.queueVisible]);

  return (
    <aside
      id={REVIEW_QUEUE_REGION_ID}
      className={styles.queueRegion}
      aria-label="Review Queue"
      tabIndex={-1}
      ref={(element) => {
        regionRef.current = element;
        registerFocusRegion("queue", element);
      }}
    >
      <div className={styles.queueHeader}>
        <p className={styles.sectionLabel}>Reviews</p>
        <h2>Review Queue</h2>
      </div>
      <div className={styles.queueStatus} data-authoritative-status={snapshot.status}>
        {snapshot.status === "loading" && <p>Checking reviews stored in this browser.</p>}
        {snapshot.status === "unavailable" && (
          <>
            <p>Reviews stored in this browser could not be read.</p>
            <p className={styles.queueReason}>{snapshot.reason}</p>
          </>
        )}
        {snapshot.status === "empty" && (
          <>
            <p>No reviews are stored in this browser.</p>
            <Link href="/new">Check a pull request</Link>
          </>
        )}
        {snapshot.status === "ready" && (
          <ReviewCollection />
        )}
      </div>
    </aside>
  );
}
