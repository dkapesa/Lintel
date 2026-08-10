import type { ContextRef } from "./context-identity";
import type { FocusOriginRecord } from "./focus";
import type { NarrowSurface, QueueManualPreference } from "./queue-layout";
import type { Destination, ReviewMode } from "./route-contract";
import type { CaseId, ReviewId } from "./review-identity";

export const R6C_SCHEMA_VERSION = 1 as const;

export type ModeAnchor =
  | Readonly<{ kind: "top" }>
  | Readonly<{ kind: "context"; context: ContextRef }>;

export type ReviewContextRecord = Readonly<{
  schemaVersion: typeof R6C_SCHEMA_VERSION;
  reviewId: ReviewId;
  mode: ReviewMode;
  primarySelection: ContextRef | null;
  inspector: Readonly<{ open: boolean; context: ContextRef | null }>;
  comparisonRunId: string | null;
  lastKnownCaseId: CaseId | null;
  modeAnchors: Readonly<Partial<Record<ReviewMode, ModeAnchor>>>;
  capturedAt: string;
}>;

export type DevicePreferences = Readonly<{
  queue: Readonly<{
    manualPreference: QueueManualPreference;
    preferredWidth: Readonly<{ expanded: number | null; compact: number | null }>;
  }>;
  inspector: Readonly<{ preferredWidth: number | null }>;
}>;

export const DEFAULT_DEVICE_PREFERENCES: DevicePreferences = {
  queue: {
    manualPreference: "expanded",
    preferredWidth: { expanded: null, compact: null },
  },
  inspector: { preferredWidth: null },
};

export type ReviewSelection =
  | Readonly<{ status: "none" }>
  | Readonly<{ status: "available"; reviewId: ReviewId; currentCaseId: CaseId }>
  | Readonly<{ status: "unavailable"; reviewId: ReviewId }>;

export type InspectorState = Readonly<{
  open: boolean;
  context: ContextRef | null;
  unavailableContext: ContextRef | null;
  relationshipTrail: readonly ContextRef[];
  focusOrigin: FocusOriginRecord | null;
}>;

export type WorkstationState = Readonly<{
  destination: Destination;
  routePath: string;
  selectedReview: ReviewSelection;
  mode: ReviewMode;
  primarySelection: ContextRef | null;
  inspector: InspectorState;
  comparisonRunId: string | null;
  lastKnownCaseId: CaseId | null;
  modeAnchor: ModeAnchor;
  queue: Readonly<{ manualPreference: QueueManualPreference }>;
  focus: Readonly<{ active: boolean; origin: FocusOriginRecord | null }>;
  overlayStack: readonly string[];
  notices: readonly string[];
  announcements: readonly string[];
  narrowSurface: NarrowSurface;
}>;

export function createInitialWorkstationState(
  preferences: DevicePreferences = DEFAULT_DEVICE_PREFERENCES,
): WorkstationState {
  return {
    destination: "reviews",
    routePath: "/reviews",
    selectedReview: { status: "none" },
    mode: "overview",
    primarySelection: null,
    inspector: {
      open: false,
      context: null,
      unavailableContext: null,
      relationshipTrail: [],
      focusOrigin: null,
    },
    comparisonRunId: null,
    lastKnownCaseId: null,
    modeAnchor: { kind: "top" },
    queue: { manualPreference: preferences.queue.manualPreference },
    focus: { active: false, origin: null },
    overlayStack: [],
    notices: [],
    announcements: [],
    narrowSurface: "workspace",
  };
}
