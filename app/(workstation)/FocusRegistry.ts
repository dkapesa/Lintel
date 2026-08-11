import type {
  FocusOriginRecord,
  FocusRegionId,
  FocusValidity,
} from "../../lib/r6c/focus";

export type R6DRegisteredFocusRegion = Exclude<FocusRegionId, "inspector">;

/** Mounted DOM registry for the focus-validity seam supplied by R6C. */
export class FocusRegistry implements FocusValidity<HTMLElement> {
  private readonly regions = new Map<R6DRegisteredFocusRegion, HTMLElement>();

  register(region: R6DRegisteredFocusRegion, element: HTMLElement | null): void {
    if (element) this.regions.set(region, element);
    else this.regions.delete(region);
  }

  isOriginRestorable(origin: FocusOriginRecord<HTMLElement>): boolean {
    const element = origin.handle;
    if (!(element instanceof HTMLElement) || !element.isConnected) return false;
    if (origin.region === "inspector") return false;
    const region = this.regions.get(origin.region);
    return region === element || region?.contains(element) === true;
  }

  isRegionRegistered(region: FocusRegionId): boolean {
    return region !== "inspector" && this.regions.get(region)?.isConnected === true;
  }

  focusRegion(region: R6DRegisteredFocusRegion): boolean {
    const element = this.regions.get(region);
    if (!element?.isConnected) return false;
    element.focus();
    return document.activeElement === element;
  }
}
