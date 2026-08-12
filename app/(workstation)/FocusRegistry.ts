import type {
  FocusOriginRecord,
  FocusRegionId,
  FocusValidity,
} from "../../lib/r6c/focus";

export type RegisteredFocusRegion = FocusRegionId;

/** Mounted DOM registry for the focus-validity seam supplied by R6C. */
export class FocusRegistry implements FocusValidity<HTMLElement> {
  private readonly regions = new Map<RegisteredFocusRegion, HTMLElement>();

  register(region: RegisteredFocusRegion, element: HTMLElement | null): void {
    if (element) this.regions.set(region, element);
    else this.regions.delete(region);
  }

  isOriginRestorable(origin: FocusOriginRecord<HTMLElement>): boolean {
    const element = origin.handle;
    if (!(element instanceof HTMLElement) || !element.isConnected) return false;
    const region = this.regions.get(origin.region);
    return region === element || region?.contains(element) === true;
  }

  isRegionRegistered(region: FocusRegionId): boolean {
    return this.regions.get(region)?.isConnected === true;
  }

  focusRegion(region: RegisteredFocusRegion): boolean {
    const element = this.regions.get(region);
    if (!element?.isConnected) return false;
    element.focus();
    return document.activeElement === element;
  }
}
