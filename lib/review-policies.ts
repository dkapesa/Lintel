import type { Report } from "./mock-report";
import type { ReviewProfile } from "./review-profiles";

export type GateLevel = "Required" | "Recommended" | "Optional";

export type ReviewPolicyGate = {
  label: string;
  level: GateLevel;
  description: string;
};

export type ReviewPolicyProfile = {
  id: string;
  label: string;
  description: string;
  bestFor: string;
  gates: ReviewPolicyGate[];
};

const gateDescriptions: Record<string, string> = {
  "Tests present": "The change has focused tests for the behavior it introduces or changes.",
  "Failure paths covered": "Timeouts, retries, malformed responses and other failure branches are explicitly tested or reviewed.",
  "API contract stable": "Client-facing responses, status codes and compatibility expectations are stable.",
  "Observability/logging checked": "Logs, metrics or alerts are useful without exposing sensitive data.",
  "Rollback/recovery path documented": "There is a clear way to recover or roll back if the change fails in production.",
  "Security/privacy reviewed": "Auth, permissions, identifiers, tokens and sensitive-data exposure have been reviewed.",
  "Data/migration safety checked": "Data writes, schema changes, migrations and rollback paths are safe.",
  "Human reviewer assigned": "A human reviewer with the right context is expected to review before merge.",
};

function gate(label: keyof typeof gateDescriptions, level: GateLevel): ReviewPolicyGate {
  return {
    label,
    level,
    description: gateDescriptions[label],
  };
}

export const REVIEW_POLICY_PROFILES: ReviewPolicyProfile[] = [
  {
    id: "standard-readiness",
    label: "Standard readiness",
    description: "Default merge-readiness policy for normal product and service changes.",
    bestFor: "Most pull requests where safety, tests and maintainability all matter.",
    gates: [
      gate("Tests present", "Required"),
      gate("Failure paths covered", "Recommended"),
      gate("API contract stable", "Recommended"),
      gate("Observability/logging checked", "Recommended"),
      gate("Human reviewer assigned", "Required"),
      gate("Rollback/recovery path documented", "Optional"),
      gate("Security/privacy reviewed", "Optional"),
      gate("Data/migration safety checked", "Optional"),
    ],
  },
  {
    id: "low-risk-change",
    label: "Low-risk change",
    description: "Lightweight policy for small, well-tested copy, docs or utility changes.",
    bestFor: "Formatting, documentation, small utility changes and low-blast-radius updates.",
    gates: [
      gate("Tests present", "Recommended"),
      gate("Human reviewer assigned", "Required"),
      gate("API contract stable", "Optional"),
      gate("Failure paths covered", "Optional"),
      gate("Observability/logging checked", "Optional"),
      gate("Rollback/recovery path documented", "Optional"),
      gate("Security/privacy reviewed", "Optional"),
      gate("Data/migration safety checked", "Optional"),
    ],
  },
  {
    id: "backend-api-change",
    label: "Backend/API change",
    description: "Stricter gates for service logic, API routes, clients, providers and contracts.",
    bestFor: "Backend services, public/internal API routes, retry logic and external clients.",
    gates: [
      gate("Tests present", "Required"),
      gate("Failure paths covered", "Required"),
      gate("API contract stable", "Required"),
      gate("Observability/logging checked", "Recommended"),
      gate("Human reviewer assigned", "Required"),
      gate("Rollback/recovery path documented", "Recommended"),
      gate("Security/privacy reviewed", "Recommended"),
      gate("Data/migration safety checked", "Optional"),
    ],
  },
  {
    id: "security-sensitive-change",
    label: "Security-sensitive change",
    description: "Security-first gates for auth, sessions, identifiers, secrets and sensitive data.",
    bestFor: "Auth/session changes, permission changes, logging changes and sensitive-data handling.",
    gates: [
      gate("Security/privacy reviewed", "Required"),
      gate("Tests present", "Required"),
      gate("Failure paths covered", "Required"),
      gate("Observability/logging checked", "Required"),
      gate("Human reviewer assigned", "Required"),
      gate("API contract stable", "Recommended"),
      gate("Rollback/recovery path documented", "Recommended"),
      gate("Data/migration safety checked", "Optional"),
    ],
  },
  {
    id: "database-data-migration",
    label: "Database/data migration",
    description: "Data-safety gates for migrations, schema changes and durable writes.",
    bestFor: "Schema migrations, backfills, data model changes and data-write path changes.",
    gates: [
      gate("Data/migration safety checked", "Required"),
      gate("Rollback/recovery path documented", "Required"),
      gate("Tests present", "Required"),
      gate("Failure paths covered", "Recommended"),
      gate("Observability/logging checked", "Recommended"),
      gate("Human reviewer assigned", "Required"),
      gate("Security/privacy reviewed", "Recommended"),
      gate("API contract stable", "Optional"),
    ],
  },
  {
    id: "operational-infra-change",
    label: "Operational/infra change",
    description: "Production-readiness gates for operational behavior, infra and recovery paths.",
    bestFor: "Infra, queues, workers, retries, deployment behavior and production failure modes.",
    gates: [
      gate("Rollback/recovery path documented", "Required"),
      gate("Observability/logging checked", "Required"),
      gate("Failure paths covered", "Required"),
      gate("Tests present", "Required"),
      gate("Human reviewer assigned", "Required"),
      gate("Security/privacy reviewed", "Recommended"),
      gate("API contract stable", "Recommended"),
      gate("Data/migration safety checked", "Optional"),
    ],
  },
  {
    id: "ai-generated-code-review",
    label: "AI-generated code review",
    description: "Assumption-checking gates for PRs produced or heavily modified by coding agents.",
    bestFor: "Agent-generated or agent-assisted PRs where hidden assumptions and missing tests are likely.",
    gates: [
      gate("Tests present", "Required"),
      gate("Failure paths covered", "Required"),
      gate("Human reviewer assigned", "Required"),
      gate("API contract stable", "Recommended"),
      gate("Observability/logging checked", "Recommended"),
      gate("Security/privacy reviewed", "Recommended"),
      gate("Rollback/recovery path documented", "Recommended"),
      gate("Data/migration safety checked", "Optional"),
    ],
  },
];

export function reviewPolicyForProfile(profile: ReviewProfile | string | undefined): ReviewPolicyProfile {
  if (profile === "fast-triage") return policyById("low-risk-change");
  if (profile === "deep-review") return policyById("backend-api-change");
  if (profile === "security-sensitive" || profile === "auth-security") return policyById("security-sensitive-change");
  if (profile === "operational-readiness" || profile === "data-migrations") return policyById("operational-infra-change");
  if (profile === "ai-generated-code") return policyById("ai-generated-code-review");
  if (profile === "high-assurance" || profile === "payments-refunds") return policyById("backend-api-change");
  if (profile === "test-coverage") return policyById("standard-readiness");
  return policyById("standard-readiness");
}

export function policyById(id: string) {
  return REVIEW_POLICY_PROFILES.find((policy) => policy.id === id) ?? REVIEW_POLICY_PROFILES[0];
}

export function gatesByLevel(policy: ReviewPolicyProfile, level: GateLevel) {
  return policy.gates.filter((gateItem) => gateItem.level === level);
}

export function policyGateSummary(policy: ReviewPolicyProfile) {
  const required = gatesByLevel(policy, "Required").length;
  const recommended = gatesByLevel(policy, "Recommended").length;
  const optional = gatesByLevel(policy, "Optional").length;

  return `${required} required / ${recommended} recommended / ${optional} optional`;
}

export function policyStatusForReport(report: Report, policy: ReviewPolicyProfile) {
  const requiredCount = gatesByLevel(policy, "Required").length;

  if (report.verdict.recommendation === "APPROVE") {
    return {
      label: "No open policy blockers",
      detail: `${requiredCount} required gates expected; report has no merge blockers.`,
    };
  }

  if (report.verdict.recommendation === "TESTS_REQUIRED") {
    return {
      label: "Required gates open",
      detail: "Missing test evidence must be resolved before this policy can be treated as clear.",
    };
  }

  if (report.verdict.recommendation === "REVIEW_REQUIRED") {
    return {
      label: "Human confirmation needed",
      detail: "Focused review gates remain open before this report should be treated as clear.",
    };
  }

  return {
    label: "Do not merge",
    detail: "Blocking risk remains open under this policy.",
  };
}
