import {
  INSPECTOR_MAX,
  INSPECTOR_MIN,
  QUEUE_MAX,
  QUEUE_MIN,
  clamp,
  resolveWorkstationGeometry,
  type ResolvedGeometry,
  type WorkstationGeometryInput,
} from "./geometry";

export type ResizablePane = "queue" | "inspector";

export type ResizeBounds = Readonly<{ minimum: number; maximum: number }>;

export const RESIZE_BOUNDS: Readonly<Record<ResizablePane, ResizeBounds>> = {
  queue: { minimum: QUEUE_MIN, maximum: QUEUE_MAX },
  inspector: { minimum: INSPECTOR_MIN, maximum: INSPECTOR_MAX },
};

/**
 * Derives the range a rendered separator can visibly achieve in its current
 * workstation geometry. The resolver remains the sole owner of spatial math;
 * pointer, keyboard, and ARIA consumers all receive this same range.
 */
export function resizeBoundsForGeometry(
  input: WorkstationGeometryInput,
  geometry: ResolvedGeometry,
  pane: ResizablePane,
): ResizeBounds | null {
  const resizable = pane === "queue" ? geometry.queueResizable : geometry.inspectorResizable;
  if (!resizable) return null;

  const tokenBounds = RESIZE_BOUNDS[pane];
  let maximum = tokenBounds.minimum;
  for (let candidate = tokenBounds.maximum; candidate >= tokenBounds.minimum; candidate -= 1) {
    const nextInput: WorkstationGeometryInput = pane === "queue"
      ? { ...input, preferredQueueWidth: candidate }
      : { ...input, preferredInspectorWidth: candidate };
    const resolved = resolveWorkstationGeometry(nextInput);
    const effective = pane === "queue" ? resolved.queueTrack : resolved.inspectorTrack;
    const remainsResizable = pane === "queue" ? resolved.queueResizable : resolved.inspectorResizable;
    if (remainsResizable && effective === candidate) {
      maximum = candidate;
      break;
    }
  }
  return { minimum: tokenBounds.minimum, maximum };
}

export function pointerResizeCandidate(input: Readonly<{
  pane: ResizablePane;
  startX: number;
  currentX: number;
  startWidth: number;
  bounds: ResizeBounds;
}>): number {
  const direction = input.pane === "queue" ? 1 : -1;
  const candidate = input.startWidth + ((input.currentX - input.startX) * direction);
  return clamp(candidate, input.bounds.minimum, input.bounds.maximum);
}

export type SeparatorResizeKey = "ArrowLeft" | "ArrowRight" | "Home" | "End";

export function isSeparatorResizeKey(key: string): key is SeparatorResizeKey {
  return key === "ArrowLeft" || key === "ArrowRight" || key === "Home" || key === "End";
}

export function keyboardResizeCandidate(input: Readonly<{
  key: SeparatorResizeKey;
  currentWidth: number;
  shiftKey: boolean;
  bounds: ResizeBounds;
}>): number {
  if (input.key === "Home") return input.bounds.minimum;
  if (input.key === "End") return input.bounds.maximum;
  const step = input.shiftKey ? 64 : 16;
  const direction = input.key === "ArrowRight" ? 1 : -1;
  return clamp(
    input.currentWidth + (step * direction),
    input.bounds.minimum,
    input.bounds.maximum,
  );
}
