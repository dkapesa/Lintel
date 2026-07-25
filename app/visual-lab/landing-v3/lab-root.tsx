"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./landing-v3.module.css";

/* R3C — Landing V3 lab root.

   Owns exactly two things:

   1. The public scope class. Every pinned --lv3-* token is declared on this
      element, so nothing above it (application theme state, OS colour-scheme
      preference) can alter the lab.

   2. The one-time section reveal. This mirrors the architecture of the
      production `app/landing-motion.tsx` — IntersectionObserver assigns a
      `data-motion-state` to each `[data-motion-section]`, there is no loop, no
      rAF, and an authored reduced-motion branch. The server-rendered DOM is
      already the complete final state: the reveal is only permitted to run
      once the controller has explicitly declared itself ready, so a visitor
      with JavaScript disabled sees everything. */

export default function LabRoot({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-section]"));

    const activate = () => {
      root.dataset.motionReady = "true";

      if (reduced.matches) {
        root.dataset.reducedMotion = "true";
        sections.forEach((section) => (section.dataset.motionState = "revealed"));
        return () => undefined;
      }

      root.dataset.reducedMotion = "false";
      sections.forEach((section) => (section.dataset.motionState = "not-yet-owned"));

      if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => (section.dataset.motionState = "revealed"));
        return () => undefined;
      }

      /* Content wins over motion. If the observer is present but never
         delivers — a headless or non-compositing context, an aggressively
         throttled tab — every section is revealed anyway. The reveal is a
         nicety; the argument being readable is not. */
      const revealAll = () => sections.forEach((section) => (section.dataset.motionState = "revealed"));
      const failsafe = window.setTimeout(revealAll, 1600);

      const observer = new IntersectionObserver(
        (entries) => {
          window.clearTimeout(failsafe);
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const section = entry.target as HTMLElement;
            section.dataset.motionState = "revealed";
            observer.unobserve(section);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0 },
      );

      sections.forEach((section) => observer.observe(section));
      return () => {
        window.clearTimeout(failsafe);
        observer.disconnect();
      };
    };

    let cleanup = activate();
    const onChange = () => {
      cleanup();
      cleanup = activate();
    };
    reduced.addEventListener("change", onChange);

    return () => {
      cleanup();
      reduced.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.paper} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.page}>{children}</div>
    </div>
  );
}
