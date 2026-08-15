import type {
  InspectorPresentation,
  LayoutBand,
  LayoutPolicy,
  NarrowSurface,
  QueueManualPreference,
} from "../r6c/queue-layout";
import type { Destination } from "../r6c/route-contract";
import { layoutBandForWidth, type SupportingLeftPresentation } from "../r6d/layout-policy";

export const QUEUE_MIN = 240;
export const QUEUE_DEFAULT = 280;
export const QUEUE_MAX = 400;
export const QUEUE_NAV_ONLY = 88;

export const INSPECTOR_MIN = 320;
export const INSPECTOR_DEFAULT = 384;
export const INSPECTOR_MAX = 480;

export const WORKSPACE_MIN = 640;
export const WORKSPACE_COMFORTABLE = 720;
export const INSPECTOR_SHEET_EDGE_CLEARANCE = 72;

export type WorkstationGeometryInput = Readonly<{
  viewportWidth: number;
  destination: Destination;
  queueDensity: QueueManualPreference;
  preferredQueueWidth: number | null | undefined;
  preferredInspectorWidth: number | null | undefined;
  queueCollapsed: boolean;
  focusActive: boolean;
  inspectorOpen: boolean;
  narrowSurface: NarrowSurface;
}>;

export type ResolvedGeometry = Readonly<{
  viewportWidth: number;
  band: LayoutBand;
  queueTrack: number;
  queueCeiling: number;
  queuePresentation: SupportingLeftPresentation;
  queueVisible: boolean;
  queueResizable: boolean;
  inspectorPresentation: InspectorPresentation;
  inspectorTrack: number;
  inspectorSize: number;
  inspectorResizable: boolean;
  workspaceTrack: number;
  workspaceMeetsMinimum: boolean;
}>;

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function preferredQueueWidth(value: number | null | undefined): number {
  return clamp(
    typeof value === "number" && Number.isFinite(value) ? value : QUEUE_DEFAULT,
    QUEUE_MIN,
    QUEUE_MAX,
  );
}

export function preferredInspectorWidth(value: number | null | undefined): number {
  return clamp(
    typeof value === "number" && Number.isFinite(value) ? value : INSPECTOR_DEFAULT,
    INSPECTOR_MIN,
    INSPECTOR_MAX,
  );
}

export function inspectorPresentationForBand(band: LayoutBand): InspectorPresentation {
  if (band === "narrow") return "sequential";
  if (band === "constrained") return "sheet";
  return "pane";
}

function visibleQueuePresentation(
  density: QueueManualPreference,
): Extract<SupportingLeftPresentation, "expanded" | "compact"> {
  return density;
}

/**
 * R6M's sole geometry authority. It is pure: no DOM, storage, dispatch, or
 * hysteresis is involved in deriving any effective track.
 */
export function resolveWorkstationGeometry(input: WorkstationGeometryInput): ResolvedGeometry {
  const viewportWidth = finiteNonNegative(input.viewportWidth);
  const band = layoutBandForWidth(viewportWidth);
  const inspectorPresentation = inspectorPresentationForBand(band);
  const reviews = input.destination === "reviews";
  const narrow = reviews && band === "narrow";
  const focus = reviews && !narrow && input.focusActive;
  const collapsedRail = reviews && !narrow && !focus && input.queueCollapsed
    ? QUEUE_NAV_ONLY
    : 0;

  let inspectorTrack = 0;
  let inspectorSize = 0;
  if (reviews && input.inspectorOpen) {
    const preferred = preferredInspectorWidth(input.preferredInspectorWidth);
    if (inspectorPresentation === "pane") {
      const available = Math.max(0, viewportWidth - collapsedRail - WORKSPACE_MIN);
      inspectorTrack = Math.min(preferred, available);
      inspectorSize = inspectorTrack;
    } else if (inspectorPresentation === "sheet") {
      inspectorSize = Math.min(
        preferred,
        Math.max(0, viewportWidth - INSPECTOR_SHEET_EDGE_CLEARANCE),
      );
    }
  }

  let queueTrack = 0;
  let queueCeiling = 0;
  let queuePresentation: SupportingLeftPresentation;

  if (!reviews) {
    queueTrack = QUEUE_NAV_ONLY;
    queuePresentation = "navigation-only";
  } else if (narrow) {
    queuePresentation = input.narrowSurface === "queue" ? "narrow-queue" : "hidden-narrow";
  } else if (focus) {
    queuePresentation = "hidden-focus";
  } else if (input.queueCollapsed) {
    queueTrack = QUEUE_NAV_ONLY;
    queuePresentation = "navigation-only";
  } else if (input.inspectorOpen && inspectorPresentation === "sheet") {
    queuePresentation = "yielded-context";
  } else {
    queueCeiling = Math.max(0, viewportWidth - inspectorTrack - WORKSPACE_MIN);
    if (queueCeiling >= QUEUE_MIN) {
      queueTrack = clamp(
        preferredQueueWidth(input.preferredQueueWidth),
        QUEUE_MIN,
        Math.min(QUEUE_MAX, queueCeiling),
      );
      queuePresentation = visibleQueuePresentation(input.queueDensity);
    } else {
      queuePresentation = "yielded-context";
    }
  }

  const workspaceTrack = Math.max(0, viewportWidth - queueTrack - inspectorTrack);
  const queueVisible = queuePresentation === "expanded"
    || queuePresentation === "compact"
    || queuePresentation === "narrow-queue";

  return {
    viewportWidth,
    band,
    queueTrack,
    queueCeiling,
    queuePresentation,
    queueVisible,
    queueResizable: reviews
      && band !== "narrow"
      && (queuePresentation === "expanded" || queuePresentation === "compact"),
    inspectorPresentation,
    inspectorTrack,
    inspectorSize,
    inspectorResizable: reviews
      && input.inspectorOpen
      && inspectorPresentation === "pane"
      && inspectorTrack > 0,
    workspaceTrack,
    workspaceMeetsMinimum: narrow || !reviews || workspaceTrack >= WORKSPACE_MIN,
  };
}

export type R6MLayoutPolicyInput = Readonly<{
  viewportWidth: number;
  destination: Destination;
  preferredQueueWidth: number | null | undefined;
  preferredInspectorWidth: number | null | undefined;
  queueCollapsed: boolean;
}>;

/**
 * Adapter for the frozen R6C LayoutPolicy seam. R6C continues to own semantic
 * restoration while R6M supplies the spatial-yield decision.
 */
export function createR6MLayoutPolicy(input: R6MLayoutPolicyInput): LayoutPolicy<LayoutBand> {
  return {
    isNarrow: (band) => band === "narrow",
    inspectorPresentation: inspectorPresentationForBand,
    shouldYieldQueue: ({ band, inspectorOpen }) => {
      if (band === "narrow" || input.destination !== "reviews" || input.queueCollapsed) return false;
      return resolveWorkstationGeometry({
        viewportWidth: input.viewportWidth,
        destination: input.destination,
        queueDensity: "expanded",
        preferredQueueWidth: input.preferredQueueWidth,
        preferredInspectorWidth: input.preferredInspectorWidth,
        queueCollapsed: input.queueCollapsed,
        focusActive: false,
        inspectorOpen,
        narrowSurface: "workspace",
      }).queuePresentation === "yielded-context";
    },
  };
}

export interface ResolvedGeometryTarget {
  readonly style: Readonly<{ setProperty(property: string, value: string): void }>;
  setAttribute(name: string, value: string): void;
}

/** The only hydrated writer of effective workstation geometry. */
export function applyResolvedGeometry(
  geometry: ResolvedGeometry,
  target: ResolvedGeometryTarget = document.documentElement,
): void {
  target.style.setProperty("--queue-track", `${geometry.queueTrack}px`);
  target.style.setProperty("--inspector-track", `${geometry.inspectorTrack}px`);
  target.style.setProperty("--inspector-size", `${geometry.inspectorSize}px`);
  target.setAttribute("data-band", geometry.band);
  target.setAttribute("data-queue", geometry.queuePresentation);
}
