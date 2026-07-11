"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const TOUR_STORAGE_KEY = "lintel.guided-tour.v1";

type TourStep = {
  title: string;
  description: string;
  route: string;
  target: string;
  tab?: string;
};

const TOUR_STEPS: TourStep[] = [
  { title: "Risk inbox", description: "Start with the inbox: it prioritises pull requests by merge-readiness risk and the action needed next.", route: "/workspace", target: "risk-inbox" },
  { title: "Selected pull request", description: "Open a PR preview to scan its recommendation, readiness score, risk band and next action before reading the full report.", route: "/workspace", target: "selected-pr" },
  { title: "Findings and evidence", description: "Findings connect risk to evidence, affected files and realistic failure modes. Select one to inspect the review context.", route: "/report", target: "report-findings", tab: "findings" },
  { title: "Missing tests and affected surfaces", description: "Use the test plan to identify missing proof, then inspect affected surfaces to understand the possible blast radius.", route: "/report", target: "report-tests", tab: "tests" },
  { title: "Merge contract", description: "The merge contract is the checklist for readiness: the conditions that must be true before this PR can safely merge.", route: "/report", target: "merge-contract", tab: "evidence" },
  { title: "Reviewer ownership and actions", description: "Lintel keeps the next decision practical: identify the local owner, work through blockers, and record action progress on this device.", route: "/report", target: "review-actions", tab: "actions" },
  { title: "Decision handoff", description: "Export one clear decision for the PR or team channel. The GitHub-ready summary and Slack handoff reduce noisy review commentary.", route: "/report", target: "report-export", tab: "export" },
  { title: "Review operations", description: "Finish in review operations, where local reports reveal recurring blockers, missing-test trends and PRs that need attention.", route: "/review-operations", target: "review-operations" },
];

type TourContextValue = { startTour: () => void; hasSeenTour: boolean };
const TourContext = createContext<TourContextValue | null>(null);

export function GuidedTourStartButton({ className }: { className?: string }) {
  const context = useContext(TourContext);
  if (!context) return null;
  return <button className={className} type="button" onClick={context.startTour}>{context.hasSeenTour ? "Restart guided tour" : "Explore demo"}</button>;
}

export default function GuidedTour({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const step = stepIndex === null ? null : TOUR_STEPS[stepIndex];
  const displayStepIndex = stepIndex ?? 0;

  useEffect(() => {
    try { setHasSeenTour(window.localStorage.getItem(TOUR_STORAGE_KEY) !== null); } catch { /* Storage is optional. */ }
  }, []);

  const finishTour = useCallback((state: "completed" | "skipped") => {
    try { window.localStorage.setItem(TOUR_STORAGE_KEY, state); setHasSeenTour(true); } catch { /* Storage is optional. */ }
    setStepIndex(null);
    setTargetRect(null);
    window.setTimeout(() => previouslyFocused.current?.focus(), 0);
  }, []);

  const startTour = useCallback(() => {
    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setStepIndex(0);
  }, []);

  useEffect(() => {
    if (!step) return;
    if (pathname !== step.route) {
      router.push(step.route);
      return;
    }
    const revealTarget = () => {
      const target = document.querySelector<HTMLElement>("[data-tour='" + step.target + "']");
      if (!target) { setTargetRect(null); return; }
      target.scrollIntoView({ block: "center", behavior: "auto" });
      setTargetRect(target.getBoundingClientRect());
    };
    const timer = window.setTimeout(() => {
      if (step.tab) {
        window.dispatchEvent(new CustomEvent("lintel:tour-tab", { detail: step.tab }));
        window.setTimeout(revealTarget, 80);
        return;
      }
      revealTarget();
    }, 120);
    const updateTarget = () => {
      const target = document.querySelector<HTMLElement>("[data-tour='" + step.target + "']");
      setTargetRect(target ? target.getBoundingClientRect() : null);
    };
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [pathname, router, step]);

  useEffect(() => {
    if (!step) return;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") finishTour("skipped"); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finishTour, step]);

  const move = (direction: -1 | 1) => {
    if (stepIndex === null) return;
    const next = stepIndex + direction;
    if (next < 0) return;
    if (next >= TOUR_STEPS.length) { finishTour("completed"); return; }
    setStepIndex(next);
  };

  const spotlightStyle = targetRect ? {
    "--tour-top": String(Math.max(targetRect.top - 8, 8)) + "px",
    "--tour-left": String(Math.max(targetRect.left - 8, 8)) + "px",
    "--tour-width": String(Math.min(targetRect.width + 16, window.innerWidth - 16)) + "px",
    "--tour-height": String(Math.min(targetRect.height + 16, window.innerHeight - 16)) + "px",
  } as CSSProperties : undefined;

  return (
    <TourContext.Provider value={{ startTour, hasSeenTour }}>
      {children}
      {step && (
        <div className="guided-tour-layer" aria-live="polite">
          {targetRect && <div className="guided-tour-spotlight" style={spotlightStyle} aria-hidden="true" />}
          <div className={targetRect ? "guided-tour-card" : "guided-tour-card guided-tour-card--centred"} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="guided-tour-title" aria-describedby="guided-tour-description" tabIndex={-1}>
            <div className="guided-tour-card-header"><span>GUIDED DEMO</span><button type="button" onClick={() => finishTour("skipped")} aria-label="Close guided tour">Close</button></div>
            <p className="guided-tour-progress">Step {displayStepIndex + 1} of {TOUR_STEPS.length}</p>
            <h2 id="guided-tour-title">{step.title}</h2>
            <p id="guided-tour-description">{step.description}</p>
            {!targetRect && <p className="guided-tour-fallback">This area is not available in the current view. Continue to the next part of the workflow.</p>}
            <div className="guided-tour-actions">
              <button type="button" onClick={() => move(-1)} disabled={displayStepIndex === 0}>Back</button>
              <button type="button" onClick={() => finishTour("skipped")}>Skip tour</button>
              <button type="button" className="guided-tour-primary" onClick={() => move(1)}>{displayStepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}</button>
            </div>
          </div>
        </div>
      )}
    </TourContext.Provider>
  );
}
