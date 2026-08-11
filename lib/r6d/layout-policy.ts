import {
  type EffectiveQueue,
  type LayoutBand,
  type LayoutPolicy,
} from "../r6c/queue-layout";
import type { Destination } from "../r6c/route-contract";

/**
 * Provisional workstation geometry. R6M owns final widths, breakpoints,
 * continuous resizing, and stored-width restoration; every value here expires
 * when that work lands.
 */
export const R6D_PROVISIONAL_GEOMETRY = {
  supportingLeft: {
    expanded: 300,
    compact: 232,
    navigationOnly: 88,
    yielded: 0,
  },
  workspaceUsefulMinimum: 720,
  inspector: {
    minimum: 300,
    provisional: 336,
  },
  breakpoints: {
    spacious: 1600,
    standard: 1360,
    compact: 1100,
    constrained: 900,
  },
} as const;

export function layoutBandForWidth(width: number): LayoutBand {
  if (width >= R6D_PROVISIONAL_GEOMETRY.breakpoints.spacious) return "spacious";
  if (width >= R6D_PROVISIONAL_GEOMETRY.breakpoints.standard) return "standard";
  if (width >= R6D_PROVISIONAL_GEOMETRY.breakpoints.compact) return "compact";
  if (width >= R6D_PROVISIONAL_GEOMETRY.breakpoints.constrained) return "constrained";
  return "narrow";
}

/** R6C LayoutPolicy implementation; intentionally provisional until R6M. */
export const R6D_LAYOUT_POLICY: LayoutPolicy<LayoutBand> = {
  isNarrow: (band) => band === "narrow",
  inspectorPresentation: (band) => {
    if (band === "narrow") return "sequential";
    if (band === "constrained") return "sheet";
    return "pane";
  },
  shouldYieldQueue: ({ band, inspectorOpen }) =>
    inspectorOpen && (band === "compact" || band === "constrained"),
};

export type SupportingLeftPresentation = EffectiveQueue["kind"] | "navigation-only";

export function supportingLeftPresentation(
  destination: Destination,
  queue: EffectiveQueue,
): SupportingLeftPresentation {
  return destination === "reviews" ? queue.kind : "navigation-only";
}

export function supportingLeftWidth(
  presentation: SupportingLeftPresentation,
): number | null {
  switch (presentation) {
    case "expanded":
      return R6D_PROVISIONAL_GEOMETRY.supportingLeft.expanded;
    case "compact":
      return R6D_PROVISIONAL_GEOMETRY.supportingLeft.compact;
    case "navigation-only":
      return R6D_PROVISIONAL_GEOMETRY.supportingLeft.navigationOnly;
    case "yielded-context":
    case "hidden-focus":
    case "hidden-narrow":
      return R6D_PROVISIONAL_GEOMETRY.supportingLeft.yielded;
    case "narrow-queue":
      return null;
  }
}
