export const LAYOUT_BANDS = ["spacious", "standard", "compact", "constrained", "narrow"] as const;
export type LayoutBand = (typeof LAYOUT_BANDS)[number];

export type QueueManualPreference = "expanded" | "compact";
export type NarrowSurface = "queue" | "workspace" | "inspector";
export type InspectorPresentation = "pane" | "sheet" | "sequential";

export interface LayoutPolicy<Band extends string = LayoutBand> {
  isNarrow(band: Band): boolean;
  inspectorPresentation(band: Band): InspectorPresentation;
  shouldYieldQueue(input: Readonly<{
    band: Band;
    inspectorOpen: boolean;
    inspectorPresentation: InspectorPresentation;
  }>): boolean;
}

export type EffectiveQueue =
  | { kind: "narrow-queue"; visible: true }
  | { kind: "hidden-narrow"; visible: false }
  | { kind: "hidden-focus"; visible: false }
  | { kind: "yielded-context"; visible: false }
  | { kind: "compact"; visible: true }
  | { kind: "expanded"; visible: true };

export type EffectiveLayout = Readonly<{
  queue: EffectiveQueue;
  inspectorPresentation: InspectorPresentation;
}>;

/**
 * Derivation only: no returned value can be written back as a manual Queue
 * preference. Priority is Narrow, Focus, contextual pressure, then manual.
 */
export function effectiveQueue<Band extends string>(input: Readonly<{
  band: Band;
  policy: LayoutPolicy<Band>;
  manualPreference: QueueManualPreference;
  focusActive: boolean;
  inspectorOpen: boolean;
  narrowSurface: NarrowSurface;
}>): EffectiveQueue {
  if (input.policy.isNarrow(input.band)) {
    return input.narrowSurface === "queue"
      ? { kind: "narrow-queue", visible: true }
      : { kind: "hidden-narrow", visible: false };
  }
  if (input.focusActive) return { kind: "hidden-focus", visible: false };

  const presentation = input.policy.inspectorPresentation(input.band);
  if (input.policy.shouldYieldQueue({
    band: input.band,
    inspectorOpen: input.inspectorOpen,
    inspectorPresentation: presentation,
  })) {
    return { kind: "yielded-context", visible: false };
  }

  return input.manualPreference === "compact"
    ? { kind: "compact", visible: true }
    : { kind: "expanded", visible: true };
}

export function effectiveLayout<Band extends string>(input: Readonly<{
  band: Band;
  policy: LayoutPolicy<Band>;
  manualPreference: QueueManualPreference;
  focusActive: boolean;
  inspectorOpen: boolean;
  narrowSurface: NarrowSurface;
}>): EffectiveLayout {
  return {
    queue: effectiveQueue(input),
    inspectorPresentation: input.policy.inspectorPresentation(input.band),
  };
}
