import { WORKSTATION_UI_STORAGE_KEY } from "../r6c/persistence";
import type { LayoutBand, QueueManualPreference } from "../r6c/queue-layout";
import { parseRoute } from "../r6c/route-contract";
import { layoutBandForWidth, type SupportingLeftPresentation } from "./layout-policy";

export type FirstPaintAttributes = Readonly<{
  band: LayoutBand;
  queue: SupportingLeftPresentation;
  narrowSurface: "queue" | "workspace";
}>;

export function storedQueuePreferenceFromRaw(raw: string | null): QueueManualPreference {
  if (!raw) return "expanded";
  try {
    const value = JSON.parse(raw) as {
      devicePreferences?: { queue?: { manualPreference?: unknown } };
    };
    return value.devicePreferences?.queue?.manualPreference === "compact"
      ? "compact"
      : "expanded";
  } catch {
    return "expanded";
  }
}

export function narrowSurfaceForPathname(pathname: string): "queue" | "workspace" {
  const parsed = parseRoute(pathname);
  return parsed.status === "valid" &&
    parsed.intent.destination === "reviews" &&
    parsed.intent.reviewId === null
    ? "queue"
    : "workspace";
}

export function deriveFirstPaintAttributes(
  pathname: string,
  viewportWidth: number,
  storedPreference: QueueManualPreference,
): FirstPaintAttributes {
  const band = layoutBandForWidth(viewportWidth);
  const parsed = parseRoute(pathname);
  const isReviews = parsed.status === "valid" && parsed.intent.destination === "reviews";
  const narrowSurface = narrowSurfaceForPathname(pathname);
  const queue: SupportingLeftPresentation = !isReviews
    ? "navigation-only"
    : band === "narrow"
      ? narrowSurface === "queue" ? "narrow-queue" : "hidden-narrow"
      : storedPreference;
  return { band, queue, narrowSurface };
}

/**
 * Workstation-route-only pre-paint builder. The generated script sets exactly
 * the three geometry attributes and treats R6C storage as a tolerant read-only
 * hint; it never writes, removes, migrates, or enumerates storage.
 */
export function buildWorkstationFirstPaintScript(): string {
  return `(() => {
  var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  var band = width >= 1600 ? "spacious" : width >= 1360 ? "standard" : width >= 1100 ? "compact" : width >= 900 ? "constrained" : "narrow";
  var pathname = window.location.pathname;
  var pieces = pathname.split("/").filter(Boolean);
  var reviews = pieces[0] === "reviews";
  var idleReviews = reviews && pieces.length === 1;
  var narrowSurface = idleReviews ? "queue" : "workspace";
  var preference = "expanded";
  try {
    var raw = window.localStorage.getItem(${JSON.stringify(WORKSTATION_UI_STORAGE_KEY)});
    if (raw) {
      var stored = JSON.parse(raw);
      if (stored && stored.devicePreferences && stored.devicePreferences.queue && stored.devicePreferences.queue.manualPreference === "compact") preference = "compact";
    }
  } catch (e) {}
  var queue = !reviews ? "navigation-only" : band === "narrow" ? (narrowSurface === "queue" ? "narrow-queue" : "hidden-narrow") : preference;
  document.documentElement.setAttribute("data-band", band);
  document.documentElement.setAttribute("data-queue", queue);
  document.documentElement.setAttribute("data-narrow-surface", narrowSurface);
})();`;
}
