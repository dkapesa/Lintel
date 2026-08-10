import type { Destination } from "./route-contract";
import type { ReviewId } from "./review-identity";

export const FOCUS_REGION_IDS = [
  "queue",
  "workspacePrimary",
  "inspector",
  "destinationMain",
] as const;

export type FocusRegionId = (typeof FOCUS_REGION_IDS)[number];

export type FocusScope = Readonly<{
  destination: Destination;
  reviewId: ReviewId | null;
}>;

/** The handle is opaque and in-memory only; DOM validity is injected. */
export type FocusOriginRecord<Handle = unknown> = Readonly<{
  handle: Handle;
  region: FocusRegionId;
  scope: FocusScope;
}>;

export type FocusReturnTarget<Handle = unknown> =
  | { kind: "recorded-origin"; handle: Handle }
  | { kind: "region"; region: FocusRegionId }
  | { kind: "none" };

export interface FocusValidity<Handle = unknown> {
  isOriginRestorable(origin: FocusOriginRecord<Handle>): boolean;
  isRegionRegistered(region: FocusRegionId): boolean;
}

export function resolveFocusReturn<Handle>(
  origin: FocusOriginRecord<Handle> | null,
  registeredOriginRegion: FocusRegionId | null,
  validity: FocusValidity<Handle>,
): FocusReturnTarget<Handle> {
  if (origin && validity.isOriginRestorable(origin)) {
    return { kind: "recorded-origin", handle: origin.handle };
  }
  if (registeredOriginRegion && validity.isRegionRegistered(registeredOriginRegion)) {
    return { kind: "region", region: registeredOriginRegion };
  }
  if (validity.isRegionRegistered("workspacePrimary")) {
    return { kind: "region", region: "workspacePrimary" };
  }
  if (validity.isRegionRegistered("destinationMain")) {
    return { kind: "region", region: "destinationMain" };
  }
  return { kind: "none" };
}

export function invalidateFocusOriginForTransition<Handle>(
  origin: FocusOriginRecord<Handle> | null,
  nextScope: FocusScope,
): FocusOriginRecord<Handle> | null {
  if (!origin) return null;
  return origin.scope.destination === nextScope.destination &&
    origin.scope.reviewId === nextScope.reviewId
    ? origin
    : null;
}
