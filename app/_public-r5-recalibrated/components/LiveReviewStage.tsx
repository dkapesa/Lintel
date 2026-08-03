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
import { HumanDecisionDialog } from "./HumanDecisionSurface";

const STAGE_ANNOUNCEMENT: Record<WorkingStage, string> = {
  overview: "Overview shown",
  finding: `Finding focused: ${PRIMARY_FINDING.title}`,
  evidence: "Evidence opened",
  "missing-proof": "Missing proof opened",
  requirement: "Requirement opened",
  "affected-context": "Affected context opened",
  readiness: "Readiness shown",
  "human-decision": "Human Decision opened",
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
  /* The element that manually opened the Human Decision dialog, so closing
     it can restore focus there — the same returnFocusRef pattern
     app/workspace/HumanDecisionDialog.tsx already uses. Captured from
     document.activeElement at the moment of a manual "human-decision"
     navigation: every trigger (the spine's "08" button, the Readiness and
     Human Decision panels' own "Open Human Decision" buttons) is a native
     <button>, so by the time its onClick fires the browser has already
     focused it. */
  const decisionTriggerRef = useRef<HTMLElement | null>(null);

  const navigateManual = useCallback((target: WorkingStage) => {
    if (target === "human-decision") {
      decisionTriggerRef.current = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
    }
    dispatch(eventForWorkingStage(target, "manual"));
  }, []);

  const openDecisionManual = useCallback(() => navigateManual("human-decision"), [navigateManual]);
  const closeDecision = useCallback(() => dispatch({ type: "CLOSE_DECISION", source: "manual" }), []);

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
      /* Trigger band, offset for the sticky header and the sticky live
         stage above the narrative. At >=1024px the shell itself occupies
         roughly the top half of the viewport while it is pinned
         (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §10, movement three),
         so the band is shifted down and narrowed to sit inside the space
         that is actually visible below the shell, rather than assuming the
         full viewport height is available for the narrative — this was the
         mismatch behind headings "arriving" too close to the shell's own
         bottom edge (R5E.1E review finding, R5E.1E.1 task brief §7). A
         narrative block "arrives" once it crosses into this band; scrolling
         back up moves back through the same states rather than resetting
         (§5.1). */
      { rootMargin: "-45% 0px -35% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
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

  /* R5E.1E.1 correction: Human Decision is reached the same way every other
     working stage is — `state.stage === "human-decision"` drives
     VerificationWorkspace's own panel switch, whether that stage was
     reached by guided scroll or manual activation (docs/r5/R5E1E1
     correction-pass task brief §1: "render as the eighth embedded state of
     the existing live Workspace"). Only the manual dialog remains a
     genuinely separate, elevated layer — gated strictly on
     `decisionSurfaceOrigin === "manual"`, unchanged from R5E.1D. */
  const showManualDialog = state.decisionSurface === "open" && state.decisionSurfaceOrigin === "manual";

  return (
    <div className={styles.stageWrap} data-reduced-motion={reducedMotion ? "true" : undefined}>
      <div className={styles.stageGrid}>
        <GlobalRail />
        <ReviewQueue onSelectReview={selectReview} />
        <VerificationWorkspace
          stage={state.stage}
          onNavigate={navigateManual}
          onOpenDecision={openDecisionManual}
          animateEntrance={animateEntrance}
        />
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
      {showManualDialog ? <HumanDecisionDialog onClose={closeDecision} triggerRef={decisionTriggerRef} /> : null}
    </div>
  );
}
