"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SectionState = "not-yet-owned" | "active" | "revealed";

const SECTION_SELECTOR = "[data-motion-section]";

/**
 * Landing-only narrative ownership. It never controls scrolling or hides a
 * record: the server-rendered document is the complete, readable final state.
 */
export default function LandingMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(root.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
    const visible = new Map<HTMLElement, IntersectionObserverEntry>();

    const setSectionState = (section: HTMLElement, state: SectionState) => {
      section.dataset.motionState = state;
    };

    const renderReducedMotion = () => {
      root.dataset.motionReady = "true";
      root.dataset.reducedMotion = "true";
      root.removeAttribute("data-active-section");
      sections.forEach((section) => setSectionState(section, "revealed"));
    };

    const updateOwnership = () => {
      const candidates = Array.from(visible.values()).filter((entry) => entry.isIntersecting);
      const owned = candidates.length
        ? candidates.sort((left, right) => {
        const leftDistance = Math.abs(left.boundingClientRect.top + left.boundingClientRect.height / 2 - window.innerHeight * 0.48);
        const rightDistance = Math.abs(right.boundingClientRect.top + right.boundingClientRect.height / 2 - window.innerHeight * 0.48);
        return leftDistance - rightDistance;
          })[0].target as HTMLElement
        : sections.reduce((closest, section) => {
          const closestRect = closest.getBoundingClientRect();
          const sectionRect = section.getBoundingClientRect();
          const closestDistance = Math.abs(closestRect.top + closestRect.height / 2 - window.innerHeight * 0.48);
          const sectionDistance = Math.abs(sectionRect.top + sectionRect.height / 2 - window.innerHeight * 0.48);
          return sectionDistance < closestDistance ? section : closest;
        });

      sections.forEach((section) => {
        setSectionState(section, section === owned ? "active" : section.dataset.motionState === "not-yet-owned" ? "not-yet-owned" : "revealed");
      });
      root.dataset.activeSection = owned.dataset.motionSection ?? "";
    };

    const activate = () => {
      if (reducedMotion.matches) {
        renderReducedMotion();
        return () => undefined;
      }

      root.dataset.motionReady = "true";
      root.dataset.reducedMotion = "false";
      sections.forEach((section) => setSectionState(section, "not-yet-owned"));

      // A browser without IntersectionObserver retains the complete static
      // reading state rather than risking an exception or partial narrative.
      if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => setSectionState(section, "revealed"));
        return () => undefined;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const section = entry.target as HTMLElement;
            visible.set(section, entry);
            if (entry.isIntersecting) setSectionState(section, "revealed");
          });
          updateOwnership();
        },
        { rootMargin: "-30% 0px -35% 0px", threshold: 0 },
      );

      sections.forEach((section) => observer.observe(section));
      return () => observer.disconnect();
    };

    let cleanup = activate();
    const onPreferenceChange = () => {
      cleanup();
      visible.clear();
      cleanup = activate();
    };
    reducedMotion.addEventListener("change", onPreferenceChange);

    return () => {
      cleanup();
      reducedMotion.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  return <div ref={rootRef} className="lp-motion">{children}</div>;
}
