import { WORKSTATION_UI_STORAGE_KEY } from "../r6c/persistence";
import { parseRoute } from "../r6c/route-contract";
import { narrowSurfaceForPathname } from "../r6d/first-paint";
import {
  INSPECTOR_SHEET_EDGE_CLEARANCE,
  QUEUE_DEFAULT,
  QUEUE_MAX,
  QUEUE_MIN,
  QUEUE_NAV_ONLY,
  WORKSPACE_MIN,
  resolveWorkstationGeometry,
} from "./geometry";
import { R6M_LAYOUT_STORAGE_KEY, queueCollapsedFromRaw } from "./layout-preference";

export type R6MFirstPaintGeometry = Readonly<{
  queueTrack: number;
  inspectorTrack: 0;
  inspectorSize: 0;
  queuePresentationOverride: "navigation-only" | null;
}>;

export function storedPreferredQueueWidthFromRaw(raw: string | null): number {
  if (!raw) return QUEUE_DEFAULT;
  try {
    const value = JSON.parse(raw) as {
      devicePreferences?: { queue?: { preferredWidth?: { expanded?: unknown } } };
    };
    const candidate = value.devicePreferences?.queue?.preferredWidth?.expanded;
    return typeof candidate === "number" && Number.isFinite(candidate)
      ? Math.min(Math.max(candidate, QUEUE_MIN), QUEUE_MAX)
      : QUEUE_DEFAULT;
  } catch {
    return QUEUE_DEFAULT;
  }
}

export function deriveR6MFirstPaintGeometry(input: Readonly<{
  pathname: string;
  viewportWidth: number;
  workstationRaw: string | null;
  layoutRaw: string | null;
}>): R6MFirstPaintGeometry {
  const parsed = parseRoute(input.pathname);
  const destination = parsed.status === "valid" ? parsed.intent.destination : "reviews";
  const collapsed = queueCollapsedFromRaw(input.layoutRaw);
  const geometry = resolveWorkstationGeometry({
    viewportWidth: input.viewportWidth,
    destination,
    queueDensity: "expanded",
    preferredQueueWidth: storedPreferredQueueWidthFromRaw(input.workstationRaw),
    preferredInspectorWidth: null,
    queueCollapsed: collapsed,
    focusActive: false,
    inspectorOpen: false,
    narrowSurface: narrowSurfaceForPathname(input.pathname),
  });
  return {
    queueTrack: geometry.queueTrack,
    inspectorTrack: 0,
    inspectorSize: 0,
    queuePresentationOverride: destination === "reviews"
      && geometry.band !== "narrow"
      && collapsed
      ? "navigation-only"
      : null,
  };
}

/**
 * Read-only, workstation-route pre-paint geometry. Numeric branches are
 * interpolated from the same exported R6M tokens used by the resolver.
 */
export function buildR6MFirstPaintGeometryScript(): string {
  return `(() => {
  var root = document.documentElement;
  var width = Math.max(root.clientWidth || 0, window.innerWidth || 0);
  var pieces = window.location.pathname.split("/").filter(Boolean);
  var reviews = pieces.length === 0 || pieces[0] === "reviews";
  var narrow = reviews && width < 900;
  var preferred = ${QUEUE_DEFAULT};
  var collapsed = false;
  try {
    var workstationRaw = window.localStorage.getItem(${JSON.stringify(WORKSTATION_UI_STORAGE_KEY)});
    if (workstationRaw) {
      var workstation = JSON.parse(workstationRaw);
      var candidate = workstation && workstation.devicePreferences && workstation.devicePreferences.queue && workstation.devicePreferences.queue.preferredWidth && workstation.devicePreferences.queue.preferredWidth.expanded;
      if (typeof candidate === "number" && isFinite(candidate)) preferred = Math.min(Math.max(candidate, ${QUEUE_MIN}), ${QUEUE_MAX});
    }
  } catch (e) {}
  try {
    var layoutRaw = window.localStorage.getItem(${JSON.stringify(R6M_LAYOUT_STORAGE_KEY)});
    if (layoutRaw) {
      var layout = JSON.parse(layoutRaw);
      collapsed = !!(layout && layout.queueCollapsed === true);
    }
  } catch (e) {}
  var queueTrack = !reviews ? ${QUEUE_NAV_ONLY} : narrow ? 0 : collapsed ? ${QUEUE_NAV_ONLY} : Math.min(preferred, ${QUEUE_MAX}, Math.max(0, width - ${WORKSPACE_MIN}));
  if (reviews && !narrow && !collapsed && width - ${WORKSPACE_MIN} < ${QUEUE_MIN}) queueTrack = 0;
  root.style.setProperty("--queue-track", queueTrack + "px");
  root.style.setProperty("--inspector-track", "0px");
  root.style.setProperty("--inspector-size", "0px");
  if (reviews && !narrow && collapsed) root.setAttribute("data-queue", "navigation-only");
})();`;
}

// Retain the accepted sheet clearance in this source-of-truth module so a
// bootstrap edit cannot silently invent an Inspector pre-paint assertion.
void INSPECTOR_SHEET_EDGE_CLEARANCE;
