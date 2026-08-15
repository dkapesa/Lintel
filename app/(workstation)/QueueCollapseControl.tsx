"use client";

import { REVIEW_QUEUE_REGION_ID } from "./QueueRegion";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export default function QueueCollapseControl() {
  const { queueCollapsed, setQueueCollapsed, band, state } = useWorkstation();
  if (state.destination !== "reviews" || band === "narrow") return null;
  const label = queueCollapsed ? "Show Review Queue" : "Hide Review Queue";
  return (
    <button
      className={styles.queueCollapseControl}
      type="button"
      aria-label={label}
      title={label}
      aria-expanded={!queueCollapsed}
      aria-controls={REVIEW_QUEUE_REGION_ID}
      onClick={() => setQueueCollapsed(!queueCollapsed)}
    >
      <span aria-hidden="true">{queueCollapsed ? "›" : "‹"}</span>
    </button>
  );
}
