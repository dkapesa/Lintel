import { reviewIdFromOpaqueToken, type ReviewId } from "./review-identity";

export const REVIEW_MODES = [
  "overview",
  "change",
  "evidence",
  "requirements",
  "history",
] as const;

export type ReviewMode = (typeof REVIEW_MODES)[number];
export type Destination = "reviews" | "policies" | "integrations" | "settings";

export type RouteIntent =
  | { destination: "reviews"; reviewId: ReviewId | null; mode: ReviewMode | null }
  | { destination: Exclude<Destination, "reviews">; reviewId: null; mode: null };

export type ParsedRoute =
  | { status: "valid"; intent: RouteIntent; canonicalPath: string }
  | { status: "invalid"; reason: "malformed-path" | "unsupported-route" };

export type RouteEffect =
  | { kind: "none" }
  | { kind: "push"; path: string }
  | { kind: "replace"; path: string };

export function isReviewMode(value: unknown): value is ReviewMode {
  return typeof value === "string" && (REVIEW_MODES as readonly string[]).includes(value);
}

function decodeOpaqueSegment(segment: string): ReviewId | null {
  try {
    const decoded = decodeURIComponent(segment);
    return decoded.length > 0 ? reviewIdFromOpaqueToken(decoded) : null;
  } catch {
    return null;
  }
}

export function formatRoute(intent: RouteIntent): string {
  if (intent.destination !== "reviews") return `/${intent.destination}`;
  if (!intent.reviewId) return "/reviews";
  const reviewSegment = encodeURIComponent(intent.reviewId);
  return intent.mode
    ? `/reviews/${reviewSegment}/${intent.mode}`
    : `/reviews/${reviewSegment}`;
}

/** Parse only the declared durable grammar; ReviewId contents stay opaque. */
export function parseRoute(pathname: string): ParsedRoute {
  const pathOnly = pathname.split(/[?#]/, 1)[0] ?? "";
  if (!pathOnly.startsWith("/") || pathOnly.includes("//")) {
    return { status: "invalid", reason: "malformed-path" };
  }

  const segments = pathOnly.split("/").slice(1);
  if (segments.at(-1) === "") segments.pop();

  if (segments.length === 1) {
    const destination = segments[0];
    if (
      destination === "reviews" ||
      destination === "policies" ||
      destination === "integrations" ||
      destination === "settings"
    ) {
      const intent = destination === "reviews"
        ? ({ destination, reviewId: null, mode: null } as const)
        : ({ destination, reviewId: null, mode: null } as RouteIntent);
      return { status: "valid", intent, canonicalPath: formatRoute(intent) };
    }
  }

  if (segments[0] === "reviews" && (segments.length === 2 || segments.length === 3)) {
    const reviewId = decodeOpaqueSegment(segments[1]);
    if (!reviewId) return { status: "invalid", reason: "malformed-path" };
    const mode = segments.length === 3 ? segments[2] : null;
    if (mode !== null && !isReviewMode(mode)) {
      return { status: "invalid", reason: "unsupported-route" };
    }
    const intent: RouteIntent = { destination: "reviews", reviewId, mode };
    return { status: "valid", intent, canonicalPath: formatRoute(intent) };
  }

  return { status: "invalid", reason: "unsupported-route" };
}
