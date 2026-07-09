export const REVIEW_PROFILES = [
  {
    id: "fast-triage",
    label: "Fast triage",
    description: "Quickly identify obvious blockers, missing tests and the next reviewer action.",
  },
  {
    id: "standard",
    label: "Standard readiness",
    description: "Balanced merge-readiness review for safety, tests, maintainability and operations.",
  },
  {
    id: "deep-review",
    label: "Deep review",
    description: "Stricter review for complex or high-impact changes where missing tests and operational gaps matter more.",
  },
  {
    id: "security-sensitive",
    label: "Security-sensitive",
    description: "Focus on auth, permissions, identifiers, sensitive data, logging and exposure risk.",
  },
  {
    id: "test-coverage",
    label: "Test coverage review",
    description: "Focus on missing coverage, risky branches, failure paths and named suggested tests.",
  },
  {
    id: "operational-readiness",
    label: "Operational readiness",
    description: "Focus on failure modes, observability, rollback, recovery and production impact.",
  },
  {
    id: "ai-generated-code",
    label: "AI-generated code review",
    description: "Focus on hidden assumptions, missing tests and unsafe patterns common in generated code.",
  },
] as const;

export type ReviewProfile = typeof REVIEW_PROFILES[number]["id"];

export function isReviewProfile(value: unknown): value is ReviewProfile {
  return typeof value === "string" && REVIEW_PROFILES.some((profile) => profile.id === value);
}

export function reviewProfileLabel(value: ReviewProfile | string | undefined) {
  return REVIEW_PROFILES.find((profile) => profile.id === value)?.label
    ?? legacyReviewProfileLabel(value)
    ?? "Standard readiness";
}

export function reviewProfileDescription(value: ReviewProfile | string | undefined) {
  return REVIEW_PROFILES.find((profile) => profile.id === value)?.description
    ?? "Balanced merge-readiness review for safety, tests, maintainability and operations.";
}

function legacyReviewProfileLabel(value: string | undefined) {
  if (value === "high-assurance") return "Deep review";
  if (value === "payments-refunds") return "Deep review";
  if (value === "auth-security") return "Security-sensitive";
  if (value === "data-migrations") return "Operational readiness";
  if (value === "frontend-api-consumer") return "Standard readiness";
  return null;
}
