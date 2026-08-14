import {
  resolveFocusReturn,
  type FocusOriginRecord,
  type FocusRegionId,
  type FocusValidity,
} from "../r6c/focus";

export type CommandsFocusOrigin = Readonly<{
  element: HTMLElement;
  region: FocusRegionId | null;
  scope: FocusOriginRecord<HTMLElement>["scope"];
}>;

export type CommandsFocusRegistry = FocusValidity<HTMLElement> & Readonly<{
  isElementConnected: (element: HTMLElement) => boolean;
}>;

export type CommandsFocusReturn =
  | { kind: "outside-origin"; element: HTMLElement }
  | ReturnType<typeof resolveFocusReturn<HTMLElement>>;

/**
 * Commands may restore a truthful outside-region trigger exactly, without
 * weakening R6C's strict registered-region validation for all other origins.
 */
export function resolveCommandsFocusReturn(
  origin: CommandsFocusOrigin | null,
  registry: CommandsFocusRegistry,
): CommandsFocusReturn {
  if (origin?.region === null && registry.isElementConnected(origin.element)) {
    return { kind: "outside-origin", element: origin.element };
  }
  const recorded = origin?.region === null || !origin ? null : {
    handle: origin.element,
    region: origin.region,
    scope: origin.scope,
  };
  return resolveFocusReturn(recorded, origin?.region ?? null, registry);
}
