"use client";

/* R1B.0 — Production Workspace V2 · restrained shell states.

   Loading, empty and unavailable states that preserve the four-plane
   geometry: the same four columns render, with a calm message in the canvas
   region. No fake queue rows, no fabricated metrics, no decorative skeleton
   animation (reduced-motion safe by construction — nothing animates). These
   are scaffolding shell states, not production data loading. */

import styles from "../workspace-v2.module.css";
import { ProvenanceBadge } from "./atoms";
import {
  type WorkspaceEmptySnapshot,
  type WorkspaceLoadingSnapshot,
  type WorkspaceUnavailableSnapshot,
} from "../../../lib/workspace-v2/view-model";

type ShellSnapshot =
  | WorkspaceLoadingSnapshot
  | WorkspaceEmptySnapshot
  | WorkspaceUnavailableSnapshot;

export function WorkspaceShellState({ snapshot }: { snapshot: ShellSnapshot }) {
  return (
    <div className={styles.root}>
      <a className={styles.skipLink} href="#wsv2-shell-message">
        Skip to workspace status
      </a>

      <aside
        className={`${styles.shellPlanePlaceholder} ${styles.shellQueue}`}
        aria-label="Case queue"
      >
        <div className={styles.planeHeader}>
          <span className={styles.planeLabel}>Queue</span>
        </div>
      </aside>

      <nav
        className={`${styles.shellPlanePlaceholder} ${styles.shellSpine}`}
        aria-label="Evidence spine"
      >
        <div className={styles.planeHeader}>
          <span className={styles.planeLabel}>Spine</span>
        </div>
      </nav>

      <section className={styles.shellCanvas} aria-label="Verification canvas">
        <header className={styles.caseHeader}>
          <div className={styles.caseIdentity}>
            <div className={styles.caseEyebrow}>
              <span className={styles.caseEyebrowLabel}>Workspace V2</span>
              <ProvenanceBadge label={snapshot.provenance.label} />
            </div>
            <h1 className={styles.caseTitle}>{snapshot.identity.label}</h1>
          </div>
        </header>
        <div
          className={styles.shellBody}
          id="wsv2-shell-message"
          tabIndex={-1}
          aria-busy={snapshot.status === "loading" ? true : undefined}
        >
          <ShellMessage snapshot={snapshot} />
        </div>
      </section>

      <aside
        className={`${styles.shellPlanePlaceholder} ${styles.shellInspector}`}
        aria-label="Inspector"
      >
        <div className={styles.planeHeader}>
          <span className={styles.planeLabel}>Case context</span>
        </div>
      </aside>
    </div>
  );
}

function ShellMessage({ snapshot }: { snapshot: ShellSnapshot }) {
  if (snapshot.status === "loading") {
    return (
      <div className={styles.shellMessage} role="status" aria-live="polite">
        <div className={styles.shellLoadingBar} aria-hidden="true" />
        <h2 className={styles.shellHeadline}>Loading workspace</h2>
        <p className={styles.shellDetail}>
          Preparing the verification workstation. Plane geometry is held while the workspace
          resolves.
        </p>
      </div>
    );
  }

  if (snapshot.status === "empty") {
    return (
      <div className={styles.shellMessage}>
        <h2 className={styles.shellHeadline}>No review cases available</h2>
        <p className={styles.shellDetail}>
          There are no cases in this workspace to review. When cases are available they appear in
          the queue, grouped by what they ask of the engineer.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.shellMessage} role="alert">
      <span className={styles.shellFlag}>Projection failure</span>
      <h2 className={`${styles.shellHeadline} ${styles.shellHeadlineError}`}>
        Workspace unavailable
      </h2>
      <p className={styles.shellDetail}>{snapshot.reason}</p>
      <p className={styles.shellDetail}>
        This is a projection failure, not an empty queue: it does not mean the repository contains
        no cases.
      </p>
    </div>
  );
}
