"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { projectSelectedReview } from "../../lib/r6f/index";
import SelectedReviewFoundation from "./SelectedReviewFoundation";
import { useWorkstation } from "./WorkstationProvider";
import selectedStyles from "./selected-review.module.css";
import styles from "./workstation-shell.module.css";

const OVERVIEW_SECTION_LABELS = [
  "Lintel recommendation",
  "Human Decision",
  "Verification standing",
  "Next step",
  "Analysis basis",
] as const;

function ReviewWorkspace() {
  const {
    state,
    snapshot,
    reviewIndex,
    band,
    dispatchBound,
  } = useWorkstation();
  const selectedReview = projectSelectedReview(state, snapshot, reviewIndex);
  const requestedReview = selectedReview.status !== "none";
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

      {selectedReview.status === "none" && (
        <section className={styles.idleWorkspace}>
          <h1>Select a review to begin</h1>
          <p>Reviews you have checked are stored in this browser.</p>
          <div className={styles.workspaceLinks}>
            <Link href="/workspace">Open the Verification Workspace</Link>
            <Link href="/new">Check a pull request</Link>
          </div>
        </section>
      )}

      {selectedReview.status === "resolving" && (
        <section className={selectedStyles.resolving}>
          <h1>Resolving this review</h1>
          <div className={selectedStyles.resolvingLabels}>
            {OVERVIEW_SECTION_LABELS.map((label) => (
              <section className={selectedStyles.resolvingSection} key={label}>
                <h2>{label}</h2>
                <div className={selectedStyles.skeleton} aria-hidden="true" />
                <div className={`${selectedStyles.skeleton} ${selectedStyles.skeletonShort}`} aria-hidden="true" />
              </section>
            ))}
          </div>
        </section>
      )}

      {selectedReview.status === "store-unavailable" && (
        <section className={selectedStyles.stateMessage}>
          <h1>Reviews stored in this browser could not be read.</h1>
          <p>{selectedReview.reason}</p>
        </section>
      )}

      {selectedReview.status === "review-unavailable" && (
        <section className={selectedStyles.stateMessage}>
          <h1>This review is no longer stored in this browser</h1>
          <p>No replacement Review was silently selected. The Review Queue remains available.</p>
          <Link href="/reviews">Back to Reviews</Link>
        </section>
      )}

      {selectedReview.status === "ready" && (
        <SelectedReviewFoundation
          review={selectedReview}
          onModeActivate={(mode) => dispatchBound({ id: "mode/activate", mode }, "visible-ui")}
        />
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
