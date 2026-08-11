"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

const MODE_LABEL = {
  overview: "Overview",
  change: "Change",
  evidence: "Evidence",
  requirements: "Requirements",
  history: "History",
} as const;

function ReviewWorkspace() {
  const {
    state,
    snapshot,
    selectedCase,
    selectedCaseTitle,
    band,
    dispatchBound,
  } = useWorkstation();
  const requestedReview = state.selectedReview.status !== "none";
  const showQueueReturn = band === "narrow" && requestedReview && state.narrowSurface === "workspace";

  return (
    <div className={styles.workspaceDocument}>
      {showQueueReturn && (
        <button
          className={styles.queueReturn}
          type="button"
          onClick={() => dispatchBound({ id: "queue/show-narrow-surface", surface: "queue" }, "visible-ui")}
        >
          <span aria-hidden="true">←</span>
          Review Queue
        </button>
      )}

      {!requestedReview && (
        <section className={styles.idleWorkspace}>
          <h1>Select a review to begin</h1>
          <p>Reviews you have checked are stored in this browser.</p>
          <div className={styles.workspaceLinks}>
            <Link href="/workspace">Open the Verification Workspace</Link>
            <Link href="/new">Check a pull request</Link>
          </div>
        </section>
      )}

      {requestedReview && snapshot.status === "loading" && (
        <section className={styles.reviewMessage} aria-live="polite">
          <p>Resolving this review.</p>
        </section>
      )}

      {requestedReview && snapshot.status === "unavailable" && (
        <section className={styles.reviewMessage}>
          <h1>Reviews stored in this browser could not be read.</h1>
          <p>{snapshot.reason}</p>
        </section>
      )}

      {requestedReview && (snapshot.status === "ready" || snapshot.status === "empty") && !selectedCase && (
        <section className={styles.reviewMessage}>
          <h1>This review is no longer stored in this browser</h1>
          <p>No other review was selected in its place.</p>
          <Link href="/reviews">Back to Reviews</Link>
        </section>
      )}

      {requestedReview && snapshot.status === "ready" && selectedCase && (
        <article className={styles.selectedReview}>
          <header>
            <p className={styles.eyebrow}>Selected review</p>
            <p className={styles.reviewIdentity}>
              {selectedCase.github.repository} · PR #{selectedCase.github.pullRequestNumber}
            </p>
            <h1>{selectedCaseTitle ?? selectedCase.github.branch}</h1>
            <p className={styles.committedMode}>{MODE_LABEL[state.mode]}</p>
          </header>
          <Link href={`/workspace?reportId=${encodeURIComponent(selectedCase.caseId)}`}>
            Open in the Verification Workspace
          </Link>
        </article>
      )}
    </div>
  );
}

export default function WorkspaceHost({ children }: { children: ReactNode }) {
  const { state, registerFocusRegion } = useWorkstation();
  return (
    <main
      id="workspace-primary"
      data-region="workspace"
      className={styles.workspace}
      tabIndex={-1}
      ref={(element) => {
        registerFocusRegion("workspacePrimary", element);
        registerFocusRegion("destinationMain", element);
      }}
    >
      {state.destination === "reviews" ? <ReviewWorkspace /> : children}
    </main>
  );
}
