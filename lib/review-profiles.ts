export const REVIEW_PROFILES = [
  { id: "standard", label: "Standard" },
  { id: "high-assurance", label: "High assurance" },
  { id: "payments-refunds", label: "Payments/refunds" },
  { id: "auth-security", label: "Auth/security" },
  { id: "data-migrations", label: "Data/migrations" },
  { id: "frontend-api-consumer", label: "Frontend/API consumer" },
] as const;

export type ReviewProfile = typeof REVIEW_PROFILES[number]["id"];

export function isReviewProfile(value: unknown): value is ReviewProfile {
  return typeof value === "string" && REVIEW_PROFILES.some((profile) => profile.id === value);
}

export function reviewProfileLabel(value: ReviewProfile | undefined) {
  return REVIEW_PROFILES.find((profile) => profile.id === value)?.label ?? "Standard";
}
