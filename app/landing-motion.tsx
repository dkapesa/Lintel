"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./landing/landing.module.css";

/* R3D — the public landing root and its motion controller.

   This keeps the architecture the previous landing established — an
   IntersectionObserver assigns `data-motion-state` to each
   `[data-motion-section]`, there is no loop, no rAF and an authored
   reduced-motion branch — and extends it with the two things R3C proved were
   necessary:

     1. It owns the public scope class. Every pinned --lnd-* token is declared
        on this element, so nothing above it — the application theme bootstrap
        on <html>, or an OS colour-scheme preference — can alter the landing.

     2. A failsafe. The server-rendered DOM is already the complete final
        state, and the reveal only ever runs once the controller has declared
        itself ready; but if the observer exists and never delivers (a
        non-compositing or heavily throttled context) every section is
        revealed anyway after 1.6s. Content wins over motion.

   `html { scroll-behavior: smooth }` is global and sits outside this scope,
   so the reduced-motion branch neutralises it here for the landing's lifetime
   and restores it on unmount. */

export default function LandingMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-section]"));
    const documentElement = document.documentElement;
    const inlineScrollBehaviour = documentElement.style.scrollBehavior;

    const activate = () => {
      root.dataset.motionReady = "true";

      if (reduced.matches) {
        root.dataset.reducedMotion = "true";
        documentElement.style.scrollBehavior = "auto";
        sections.forEach((section) => (section.dataset.motionState = "revealed"));
        return () => undefined;
      }

      root.dataset.reducedMotion = "false";
      documentElement.style.scrollBehavior = inlineScrollBehaviour;
      sections.forEach((section) => (section.dataset.motionState = "not-yet-owned"));

      // A browser without IntersectionObserver keeps the complete static state
      // rather than risking an exception or a partial narrative.
      if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => (section.dataset.motionState = "revealed"));
        return () => undefined;
      }

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
    const onPreferenceChange = () => {
      cleanup();
      cleanup = activate();
    };
    reduced.addEventListener("change", onPreferenceChange);

    return () => {
      cleanup();
      reduced.removeEventListener("change", onPreferenceChange);
      documentElement.style.scrollBehavior = inlineScrollBehaviour;
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
