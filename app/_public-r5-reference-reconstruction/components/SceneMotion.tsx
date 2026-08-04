"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* R5E.1E.2A — the only motion controller on this route.

   docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md §4 and §19. Frame evidence
   (Cursor probe_19.0s vs probe_27.0s: identical scroll thumb, identical text
   baseline, different scene interior) proves the references animate a scene
   while the page is stationary. Scroll position never maps to product state.

   This component therefore does exactly one thing: it tells one scene, once,
   that it has entered the viewport. It does not pin anything, does not read a
   scroll offset, does not write global state, and disconnects after firing.

   Progressive enhancement, in order of precedence:

   1. No JavaScript      — nothing runs, `data-motion` is never set, and the
                           stylesheet's default is the final state.
   2. Reduced motion     — the pre-state is never armed, so the final state
                           renders immediately and no transition occurs.
   3. Otherwise          — `useLayoutEffect` arms the pre-state before the
                           browser paints (so there is no flash of the final
                           state), then the observer reveals it.

   Only bounded container, border, decorative-rule and local-transform
   treatments animate, on elements whose boxes are already laid out, so no
   sequence can produce layout shift and meaningful text never fades. */

/* threshold 0, not a ratio. A ratio would make the reveal depend on how much
   of the scene fits on screen: at 320px a scene is ~1270px tall in a 568px
   viewport, so a 0.25 threshold can never be met and the later steps would
   stay invisible forever. "Has entered the viewport" is the whole contract
   (lock §19), so any intersection is the trigger. The negative bottom margin
   only delays the reveal until the scene is meaningfully in view; a scene
   taller than the viewport still triggers as soon as its top crosses.

   R5E.1E.2D (task brief §12): a full-resolution frame pair from the
   R5E.1E.2C recording proved the previous fixed -80px margin fired the
   sequence while a scene was still ~82% below the fold — at 6.65s the
   Readiness scene's chrome bar sat at y≈922 of a 1140px-tall capture with
   its first two steps already revealed. A percentage margin scales with
   viewport height instead of a fixed pixel offset, so the sequence now
   begins once a scene's top has entered the lower ~78% of the viewport —
   meaningfully in view — at every viewport size, and still completes during
   an ordinary 3–5s visitor dwell rather than mostly off-screen.
   R5E1E2C_HUMAN_REVIEW_PACKAGE/MOTION_FIDELITY.md and
   R5E1E2C_HUMAN_REVIEW_PACKAGE/R5E1E2D_IMPLEMENTATION_BRIEF.md §13. */
const REVEAL_THRESHOLD = 0;
const REVEAL_ROOT_MARGIN = "0px 0px -22% 0px";

/* useLayoutEffect warns when it runs during server rendering. This component is
   a client boundary, but Next still renders it once on the server, so fall back
   to useEffect there. The fallback never actually executes — the server does
   not run effects — it only keeps the module free of the warning. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function SceneMotion({
  children,
  className,
  onEnteredViewport,
  settled = false,
}: {
  children: ReactNode;
  className?: string;
  onEnteredViewport?: () => void;
  settled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "armed" | "revealed">("static");

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setState("armed");
  }, []);

  useEffect(() => {
    if (state !== "armed" || settled) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setState("revealed");
          onEnteredViewport?.();
          observer.disconnect();
          return;
        }
      },
      { threshold: REVEAL_THRESHOLD, rootMargin: REVEAL_ROOT_MARGIN },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onEnteredViewport, settled, state]);

  return (
    <div
      ref={ref}
      className={className}
      data-motion={settled ? "settled" : state === "static" ? undefined : state}
    >
      {children}
    </div>
  );
}
