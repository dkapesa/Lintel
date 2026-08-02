"use client";

import { useEffect } from "react";

/* R5E — Public Motion System controller.

   The single, isolated client boundary for the three accepted motion
   moments (queue-entry, evidence-to-requirement, decision-surface-open).
   Renders nothing; it only arms and reveals the three data-motion-slot
   scenes that PublicR5Page already renders, server-side, in their complete
   and readable final state.

   Progressive enhancement contract:
   - No slot is hidden by default. Every heading, paragraph, action and
     product scene is present in the server-rendered HTML with no motion
     attribute at all, which is fully visible under the stylesheet's default
     rules. This effect only ever adds a `data-motion-state` attribute; it
     never removes content or classes another element depends on.
   - If prefers-reduced-motion is set, IntersectionObserver is unavailable,
     or this effect never runs (JS disabled, JS still loading), no slot is
     ever armed and the page reads exactly as its server-rendered, fully
     visible, unanimated state — which is also each moment's reduced-motion
     resting state.
   - Each slot is armed (set to its hidden entrance state) and observed at
     most once per mount. The observer unobserves a target the instant it
     fires, so a moment cannot replay while scrolling, and the whole
     observer disconnects once all three owned moments have fired.
   - Mobile motion is not gated here: public-r5.module.css unconditionally
     forces the visible resting state below 768px regardless of this
     effect's state, per R5E §9's mobile simplification allowance.

   See docs/r5/R5E_PUBLIC_MOTION_SYSTEM.md for the full contract, trigger
   thresholds and duration/easing table. */

export function MotionController() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-motion-slot]"));
    if (targets.length === 0) return;

    const arm = (el: HTMLElement) => {
      el.setAttribute("data-motion-state", "armed");
      el.querySelectorAll<HTMLElement>("[data-motion-part]").forEach((part) => {
        part.setAttribute("data-motion-state", "armed");
      });
    };

    const reveal = (el: HTMLElement) => {
      el.setAttribute("data-motion-state", "revealed");
      el.querySelectorAll<HTMLElement>("[data-motion-part]").forEach((part) => {
        part.setAttribute("data-motion-state", "revealed");
      });
    };

    let firedCount = 0;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          obs.unobserve(el);
          reveal(el);
          firedCount += 1;
        }
        if (firedCount >= targets.length) obs.disconnect();
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
    );

    targets.forEach((el) => {
      arm(el);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
