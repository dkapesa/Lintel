"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import styles from "../public-r5-recalibrated.module.css";
import { CANONICAL_REVIEW, PRIMARY_FINDING } from "../canonical-review";
import {
  INITIAL_DEMO_STATE,
  demoReducer,
  eventForWorkingStage,
  workingStageFor,
} from "../demo-reducer";
import type { WorkingStage } from "../demo-reducer";
import { GlobalRail } from "./GlobalRail";
import { ReviewQueue } from "./ReviewQueue";
import { VerificationWorkspace } from "./VerificationWorkspace";
import { ContextualInspector } from "./ContextualInspector";
import { VerificationSpine } from "./VerificationSpine";

const STAGE_ANNOUNCEMENT: Record<WorkingStage, string> = {
  overview: "Overview shown",
  finding: `Finding focused: ${PRIMARY_FINDING.title}`,
  evidence: "Evidence opened",
  "missing-proof": "Missing proof opened",
  requirement: "Requirement opened",
  "affected-context": "Affected context opened",
  readiness: "Readiness shown",
};

/* R5E.1C — the one small client-owned product stage
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §13). Owns the single
   reducer specified in
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §4, now wired for
   every working stage. Server-rendered like any other Next.js client
   component, so its initial markup — PR #482 selected, Overview resolved,
   every canonical value legible, Human Decision pending — is present and
   truthful without JavaScript; interaction here, guided or manual, is
   progressive enhancement over that resting state (§8b). */
export function LiveReviewStage() {
  const [state, dispatch] = useReducer(demoReducer, INITIAL_DEMO_STATE);
  const seenStagesRef = useRef<Set<WorkingStage>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);

  const navigateManual = useCallback((target: WorkingStage) => {
    dispatch(eventForWorkingStage(target, "manual"));
  }, []);

  const selectReview = useCallback(() => dispatch({ type: "SELECT_REVIEW", source: "manual" }), []);
  const resumeGuided = useCallback(() => dispatch({ type: "RESUME_GUIDED" }), []);
  const resetDemo = useCallback(() => {
    seenStagesRef.current.clear();
    dispatch({ type: "RESET_DEMO" });
  }, []);

  /* Reduced motion, second independent layer. The CSS
     `@media (prefers-reduced-motion: reduce)` rule in
     public-r5-recalibrated.module.css is the primary contract and disables
     every transition/animation duration outright; this JS-side matchMedia
     check additionally strips the panel-entrance class so no animation is
     even requested, per the two-layer pattern in
     docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §8c.7. */
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* Guided scroll advancement
     (docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §5). One
     IntersectionObserver watches the working-stage narrative anchors
     rendered elsewhere on the page (server-rendered content, located by
     `data-verification-stage`, the same document-query pattern
     PublicPrototypeHeader.tsx already uses for its own active-section
     tracking — no continuous scroll listener). The guided stage is a
     deterministic function of scroll position: whichever anchor is most
     intersecting the trigger band drives the stage. Guided events
     dispatched here are discarded by the reducer itself while
     `mode === "manual"` (contract §4c), so this effect does not need to
     check mode before dispatching — manual precedence is enforced in one
     place, the reducer, not duplicated here. */
  useEffect(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-verification-stage]"));
    if (anchors.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const target = visible.target.getAttribute("data-verification-stage") as WorkingStage | null;
        if (!target) return;
        dispatch(eventForWorkingStage(target, "guided"));
      },
      /* Trigger band: roughly the vertical middle of the viewport, offset
         for the sticky header. A narrative block "arrives" once it crosses
         into this band, which keeps the observer from firing on brief
         edge-of-viewport intersections while scrolling past quickly, and
         lets scrolling back up move back through the same states rather
         than resetting (§5.1). */
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    anchors.forEach((anchor) => observer.observe(anchor));
    return () => observer.disconnect();
  }, []);

  const activeWorkingStage = workingStageFor(state.stage);
  const isFirstVisit = activeWorkingStage ? !seenStagesRef.current.has(activeWorkingStage) : false;

  useEffect(() => {
    if (activeWorkingStage) seenStagesRef.current.add(activeWorkingStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage]);

  const animateEntrance = isFirstVisit && !reducedMotion;
  const announcement = state.mode === "manual" && activeWorkingStage ? STAGE_ANNOUNCEMENT[activeWorkingStage] : null;

  return (
    <div className={styles.stageWrap} data-reduced-motion={reducedMotion ? "true" : undefined}>
      <div className={styles.stageGrid}>
        <GlobalRail />
        <ReviewQueue onSelectReview={selectReview} />
        <VerificationWorkspace stage={state.stage} onNavigate={navigateManual} animateEntrance={animateEntrance} />
        <ContextualInspector stage={state.stage} animateEntrance={animateEntrance} />
      </div>
      <VerificationSpine
        stage={state.stage}
        mode={state.mode}
        onNavigate={navigateManual}
        onResumeGuided={resumeGuided}
      />
      <div className={styles.stageFooter}>
        <span className={styles.stageFooterNote}>
          Interactive sample · {CANONICAL_REVIEW.repository} {CANONICAL_REVIEW.pullRequestLabel} · read-only
        </span>
        <button type="button" className={styles.resetButton} onClick={resetDemo}>
          Reset sample
        </button>
      </div>
      <p aria-live="polite" className={styles.visuallyHidden}>
        {announcement}
      </p>
    </div>
  );
}
