import {
  resolveFocusReturn,
  type FocusOriginRecord,
  type FocusRegionId,
  type FocusValidity,
} from "../../lib/r6c/focus";
import {
  resolveCommandsFocusReturn,
  type CommandsFocusOrigin,
  type CommandsFocusRegistry,
} from "../../lib/r6l/command-focus";
import { isElementRendered } from "../../lib/r6m/focus-visibility";
import { FocusRegistry, type RegisteredFocusRegion } from "./FocusRegistry";

type FocusableValidity = FocusValidity<HTMLElement> & Readonly<{
  focusRegion: (region: RegisteredFocusRegion) => boolean;
}>;

function focusElement(element: HTMLElement): boolean {
  if (!isElementRendered(element)) return false;
  element.focus({ preventScroll: true });
  return document.activeElement === element;
}

/**
 * Decorates the frozen connectedness registry with rendered visibility.
 * Zero-track, visibility-hidden, and opacity-hidden regions are invalid at
 * every focus-return rung even while their DOM nodes remain mounted.
 */
export class RenderedFocusValidity implements CommandsFocusRegistry, FocusableValidity {
  private readonly regions = new Map<RegisteredFocusRegion, HTMLElement>();

  constructor(private readonly registry: FocusRegistry) {}

  register(region: RegisteredFocusRegion, element: HTMLElement | null): void {
    this.registry.register(region, element);
    if (element) this.regions.set(region, element);
    else this.regions.delete(region);
  }

  isOriginRestorable(origin: FocusOriginRecord<HTMLElement>): boolean {
    return this.registry.isOriginRestorable(origin) && isElementRendered(origin.handle);
  }

  isRegionRegistered(region: FocusRegionId): boolean {
    const element = this.regions.get(region);
    return this.registry.isRegionRegistered(region) && isElementRendered(element ?? null);
  }

  isElementConnected(element: HTMLElement): boolean {
    return this.registry.isElementConnected(element) && isElementRendered(element);
  }

  focusRegion(region: RegisteredFocusRegion): boolean {
    if (!this.isRegionRegistered(region)) return false;
    return this.registry.focusRegion(region);
  }
}

export function restoreRenderedFocus(
  origin: FocusOriginRecord<HTMLElement> | null,
  registeredOriginRegion: FocusRegionId | null,
  validity: RenderedFocusValidity,
): boolean {
  let exact = origin;
  let originRegion = registeredOriginRegion;
  const failedRegions = new Set<FocusRegionId>();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const target = resolveFocusReturn(exact, originRegion, {
      isOriginRestorable: (candidate) => validity.isOriginRestorable(candidate),
      isRegionRegistered: (region) => !failedRegions.has(region) && validity.isRegionRegistered(region),
    });
    if (target.kind === "none") return false;
    if (target.kind === "recorded-origin") {
      if (focusElement(target.handle)) return true;
      exact = null;
      continue;
    }
    if (validity.focusRegion(target.region)) return true;
    failedRegions.add(target.region);
    if (originRegion === target.region) originRegion = null;
  }
  return false;
}

export function restoreRenderedCommandsFocus(
  origin: CommandsFocusOrigin | null,
  validity: RenderedFocusValidity,
): boolean {
  const target = resolveCommandsFocusReturn(origin, validity);
  if (target.kind === "outside-origin" && focusElement(target.element)) return true;
  const recorded = origin?.region ? {
    handle: origin.element,
    region: origin.region,
    scope: origin.scope,
  } : null;
  return restoreRenderedFocus(recorded, origin?.region ?? null, validity);
}
