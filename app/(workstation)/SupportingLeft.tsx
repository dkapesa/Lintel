"use client";

import Link from "next/link";
import DestinationNav from "./DestinationNav";
import QueueRegion, { REVIEW_QUEUE_REGION_ID } from "./QueueRegion";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export default function SupportingLeft() {
  const { state, onDestinationClick, dispatchBound, leftPresentation } = useWorkstation();
  const reviews = state.destination === "reviews";
  const expanded = leftPresentation === "expanded" || leftPresentation === "narrow-queue";
  const compact = state.queue.manualPreference === "compact";

  return (
    <div className={styles.supportingLeft} data-region="supporting-left">
      <div className={styles.globalRegion}>
        <Link
          className={styles.productIdentity}
          href="/reviews"
          onClick={(event) => onDestinationClick(event, { id: "route/navigate", destination: "reviews" })}
        >
          <span className={styles.productMark} aria-hidden="true">L</span>
          <span className={styles.productName}>Lintel</span>
        </Link>
        <DestinationNav />
      </div>

      {reviews && (
        <>
          <div className={styles.insetDivider} aria-hidden="true" />
          <QueueRegion />
          <div className={styles.queueControlRegion}>
            <button
              className={styles.queueControl}
              type="button"
              aria-expanded={expanded}
              aria-controls={REVIEW_QUEUE_REGION_ID}
              onClick={() => dispatchBound({
                id: "queue/set-manual-preference",
                preference: compact ? "expanded" : "compact",
              }, "visible-ui")}
            >
              <span aria-hidden="true">{compact ? "›" : "‹"}</span>
              <span>{compact ? "Expand Queue" : "Compact Queue"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
