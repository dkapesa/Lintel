"use client";

import { useReducer } from "react";
import styles from "../public-r5-recalibrated.module.css";
import { CANONICAL_REVIEW, PRIMARY_FINDING } from "../canonical-review";
import { INITIAL_DEMO_STATE, demoReducer } from "../demo-reducer";
import { GlobalRail } from "./GlobalRail";
import { ReviewQueue } from "./ReviewQueue";
import { VerificationWorkspace } from "./VerificationWorkspace";
import { ContextualInspector } from "./ContextualInspector";
import { VerificationSpine } from "./VerificationSpine";

/* R5E.1B — the one small client-owned product stage
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §13). It owns the single
   reducer specified in
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §4, wired for
   "queue", "overview" and "finding" only. Next.js server-renders this
   component like any other, so its initial markup — PR #482 selected, the
   Overview resolved, all canonical values legible, Human Decision pending —
   is present and truthful without JavaScript; interaction here is
   progressive enhancement over that resting state (§8b). */
export function LiveReviewStage() {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_DEMO_STATE);

  const announcement =
    state.stage === "finding"
      ? `Finding focused: ${PRIMARY_FINDING.title}`
      : state.stage === "overview"
        ? "Overview shown"
        : null;

  return (
    <div className={styles.stageWrap}>
      <div className={styles.stageGrid}>
        <GlobalRail />
        <ReviewQueue onSelectReview={() => dispatch({ type: "SELECT_REVIEW", source: "manual" })} />
        <VerificationWorkspace
          stage={state.stage}
          onFocusFinding={() =>
            dispatch({ type: "FOCUS_FINDING", source: "manual", recordId: PRIMARY_FINDING.recordKey })
          }
          onShowOverview={() => dispatch({ type: "SHOW_OVERVIEW", source: "manual" })}
        />
        <ContextualInspector stage={state.stage} />
      </div>
      <VerificationSpine
        stage={state.stage}
        onShowOverview={() => dispatch({ type: "SHOW_OVERVIEW", source: "manual" })}
        onFocusFinding={() =>
          dispatch({ type: "FOCUS_FINDING", source: "manual", recordId: PRIMARY_FINDING.recordKey })
        }
      />
      <div className={styles.stageFooter}>
        <span className={styles.stageFooterNote}>
          Interactive sample · {CANONICAL_REVIEW.repository} {CANONICAL_REVIEW.pullRequestLabel} · read-only
        </span>
        <button type="button" className={styles.resetButton} onClick={() => dispatch({ type: "RESET_DEMO" })}>
          Reset sample
        </button>
      </div>
      <p aria-live="polite" className={styles.visuallyHidden}>
        {announcement}
      </p>
    </div>
  );
}
