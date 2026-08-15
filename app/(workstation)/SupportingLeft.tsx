"use client";

import Link from "next/link";
import DestinationNav from "./DestinationNav";
import QueueCollapseControl from "./QueueCollapseControl";
import QueueRegion from "./QueueRegion";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export default function SupportingLeft() {
  const { state, onDestinationClick, dispatchBound, commands } = useWorkstation();
  const reviews = state.destination === "reviews";
  const compact = state.queue.manualPreference === "compact";

  return (
    <div className={styles.supportingLeft} data-region="supporting-left">
      <div className={styles.globalRegion}>
        <div className={styles.globalHeader}>
          <Link
            className={styles.productIdentity}
            href="/reviews"
            onClick={(event) => onDestinationClick(event, { id: "route/navigate", destination: "reviews" })}
          >
            <span className={styles.productMark} aria-hidden="true">L</span>
            <span className={styles.productName}>Lintel</span>
          </Link>
          {reviews && <QueueCollapseControl />}
        </div>
        <button
          className={styles.commandsTrigger}
          type="button"
          aria-label="Open Commands"
          aria-keyshortcuts="Meta+K Control+K"
          title="Open Commands (⌘K / Ctrl+K)"
          onClick={() => commands.open()}
        >
          <span aria-hidden="true">⌕</span>
          <span className={styles.commandsHint} aria-hidden="true">⌘K</span>
        </button>
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
