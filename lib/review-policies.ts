import type { Report } from "./mock-report";
import type { ReviewProfile } from "./review-profiles";

export type GateLevel = "Required" | "Recommended" | "Optional";

export type PolicyCategory =
  | "General readiness"
  | "Security-sensitive changes"
  | "Operational readiness"
  | "AI-generated code"
  | "Evidence and proof";

export type PolicyExecutionType = "Deterministic" | "Model-assisted" | "Mixed";
export type PolicyCapability = "Available at intake" | "Preview only" | "Unavailable";
export type PolicyApplicability = "future-reviews" | "current-review" | "repository-scoped" | "preview-only";

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
  category: PolicyCategory;
  version: string;
  provenance: string;
  executionType: PolicyExecutionType;
  capability: PolicyCapability;
  intakeProfileIds: string[];
  applicability: PolicyApplicability[];
  reviewIntent: string;
  modelAssistedContribution: string;
  evidenceExpectations: string[];
  requirementEffect: string;
  mergeGateEffect: string;
  repositoryApplicability: string;
  currentReviewScope: string;
  futureReviewScope: string;
  persistenceBoundary: string;
  enforcementBoundary: string;
  humanDecisionBoundary: string;
  unsupportedCapabilities: string[];
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

const COMMON_UNSUPPORTED_CAPABILITIES = [
  "No repository policy assignment or ownership record.",
  "No organisation-wide deployment, synchronisation or analytics.",
  "No reviewer assignment, approval chain or role-based access control.",
  "No GitHub status publication, merge protection or other external enforcement.",
  "No retroactive change to an existing Case File or Human Decision.",
];

const COMMON_POLICY_BOUNDARY = {
  provenance: "Lintel bundled review-policy profile",
  requirementEffect: "Could introduce a canonical requirement only when analysis records a condition, evidence gap or supported finding. Previewing this policy creates nothing.",
  mergeGateEffect: "Required, recommended and optional gates frame merge-readiness inspection; they do not block a repository merge.",
  repositoryApplicability: "Any repository or manual review context accepted by New Review. No repository assignment or ownership match is stored.",
  currentReviewScope: "No effect on the open review or any existing record.",
  futureReviewScope: "Available only when a mapped review profile is selected for a future New Review.",
  persistenceBoundary: "The selected review profile is recorded with the future canonical run. This policy browser stores no selection or deployment state.",
  enforcementBoundary: "Lintel can inspect and describe these gates; it cannot enforce them in a repository or hosted organisation.",
  humanDecisionBoundary: "Human Decision remains separate accountable-engineer authority. A policy cannot choose, approve, publish or replace it.",
};

export const REVIEW_POLICY_PROFILES: ReviewPolicyProfile[] = [
  {
    id: "standard-readiness",
    label: "Standard readiness",
    description: "Default merge-readiness policy for normal product and service changes.",
    bestFor: "Most pull requests where safety, tests and maintainability all matter.",
    category: "General readiness",
    version: "1.0",
    provenance: COMMON_POLICY_BOUNDARY.provenance,
    executionType: "Mixed",
    capability: "Available at intake",
    intakeProfileIds: ["standard", "test-coverage"],
    applicability: ["future-reviews"],
    reviewIntent: "Establish the ordinary readiness baseline across tests, contracts, operations, human review and optional higher-risk checks.",
    modelAssistedContribution: "The profile shapes deterministic baseline analysis. If model assistance is separately selected and configured in New Review, it may enrich synthesis but cannot satisfy a gate or make a decision.",
    evidenceExpectations: ["Changed-test structure or externally verified test results", "Direct or bounded evidence for any recorded merge condition", "Accountable engineer review before Human Decision"],
    requirementEffect: COMMON_POLICY_BOUNDARY.requirementEffect,
    mergeGateEffect: COMMON_POLICY_BOUNDARY.mergeGateEffect,
    repositoryApplicability: COMMON_POLICY_BOUNDARY.repositoryApplicability,
    currentReviewScope: COMMON_POLICY_BOUNDARY.currentReviewScope,
    futureReviewScope: COMMON_POLICY_BOUNDARY.futureReviewScope,
    persistenceBoundary: COMMON_POLICY_BOUNDARY.persistenceBoundary,
    enforcementBoundary: COMMON_POLICY_BOUNDARY.enforcementBoundary,
    humanDecisionBoundary: COMMON_POLICY_BOUNDARY.humanDecisionBoundary,
    unsupportedCapabilities: [...COMMON_UNSUPPORTED_CAPABILITIES],
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
    category: "General readiness",
    version: "1.0",
    provenance: COMMON_POLICY_BOUNDARY.provenance,
    executionType: "Mixed",
    capability: "Available at intake",
    intakeProfileIds: ["fast-triage"],
    applicability: ["future-reviews"],
    reviewIntent: "Keep human review required while reducing default expectations for evidence that is unlikely to be material to a bounded low-risk change.",
    modelAssistedContribution: "Fast triage shapes deterministic prioritisation. Optional model assistance remains a separate execution choice and does not turn this into an automated approval policy.",
    evidenceExpectations: ["Focused evidence proportionate to the change", "Tests where behaviour changes", "Human review before a decision"],
    requirementEffect: COMMON_POLICY_BOUNDARY.requirementEffect,
    mergeGateEffect: COMMON_POLICY_BOUNDARY.mergeGateEffect,
    repositoryApplicability: COMMON_POLICY_BOUNDARY.repositoryApplicability,
    currentReviewScope: COMMON_POLICY_BOUNDARY.currentReviewScope,
    futureReviewScope: COMMON_POLICY_BOUNDARY.futureReviewScope,
    persistenceBoundary: COMMON_POLICY_BOUNDARY.persistenceBoundary,
    enforcementBoundary: COMMON_POLICY_BOUNDARY.enforcementBoundary,
    humanDecisionBoundary: COMMON_POLICY_BOUNDARY.humanDecisionBoundary,
    unsupportedCapabilities: [...COMMON_UNSUPPORTED_CAPABILITIES],
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
    category: "Evidence and proof",
    version: "1.0",
    provenance: COMMON_POLICY_BOUNDARY.provenance,
    executionType: "Mixed",
    capability: "Available at intake",
    intakeProfileIds: ["deep-review"],
    applicability: ["future-reviews"],
    reviewIntent: "Increase attention to failure paths, API stability and evidence for complex or high-impact service changes.",
    modelAssistedContribution: "Deep review affects deterministic attention signals. A separately selected model may enrich wording and prioritisation; canonical evidence and requirements remain bounded by the deterministic record.",
    evidenceExpectations: ["Focused tests for changed behaviour and failure paths", "API contract evidence", "Operational evidence where external clients or providers are involved"],
    requirementEffect: COMMON_POLICY_BOUNDARY.requirementEffect,
    mergeGateEffect: COMMON_POLICY_BOUNDARY.mergeGateEffect,
    repositoryApplicability: COMMON_POLICY_BOUNDARY.repositoryApplicability,
    currentReviewScope: COMMON_POLICY_BOUNDARY.currentReviewScope,
    futureReviewScope: COMMON_POLICY_BOUNDARY.futureReviewScope,
    persistenceBoundary: COMMON_POLICY_BOUNDARY.persistenceBoundary,
    enforcementBoundary: COMMON_POLICY_BOUNDARY.enforcementBoundary,
    humanDecisionBoundary: COMMON_POLICY_BOUNDARY.humanDecisionBoundary,
    unsupportedCapabilities: [...COMMON_UNSUPPORTED_CAPABILITIES],
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
    category: "Security-sensitive changes",
    version: "1.0",
    provenance: COMMON_POLICY_BOUNDARY.provenance,
    executionType: "Mixed",
    capability: "Available at intake",
    intakeProfileIds: ["security-sensitive"],
    applicability: ["future-reviews"],
    reviewIntent: "Put security and privacy review first when the submitted change contains supported sensitive-path signals.",
    modelAssistedContribution: "The security-sensitive profile adds deterministic attention when supported signals exist. Optional model synthesis remains advisory and cannot establish secure handling or approve the change.",
    evidenceExpectations: ["Direct evidence for authentication, permission or sensitive-data behaviour", "Failure-path tests", "Logging review that proves sensitive material is not exposed"],
    requirementEffect: COMMON_POLICY_BOUNDARY.requirementEffect,
    mergeGateEffect: COMMON_POLICY_BOUNDARY.mergeGateEffect,
    repositoryApplicability: COMMON_POLICY_BOUNDARY.repositoryApplicability,
    currentReviewScope: COMMON_POLICY_BOUNDARY.currentReviewScope,
    futureReviewScope: COMMON_POLICY_BOUNDARY.futureReviewScope,
    persistenceBoundary: COMMON_POLICY_BOUNDARY.persistenceBoundary,
    enforcementBoundary: COMMON_POLICY_BOUNDARY.enforcementBoundary,
    humanDecisionBoundary: COMMON_POLICY_BOUNDARY.humanDecisionBoundary,
    unsupportedCapabilities: [...COMMON_UNSUPPORTED_CAPABILITIES],
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
    category: "Operational readiness",
    version: "1.0",
    provenance: "Lintel bundled preview-only policy template",
    executionType: "Deterministic",
    capability: "Preview only",
    intakeProfileIds: [],
    applicability: ["preview-only"],
    reviewIntent: "Describe the evidence and recovery expectations that would matter for a data migration without claiming a selectable policy or deployment.",
    modelAssistedContribution: "No current New Review profile maps to this template. It does not select a model path or execute analysis.",
    evidenceExpectations: ["Migration and durable-write safety evidence", "Rollback or recovery plan", "Focused test evidence for the changed data path"],
    requirementEffect: "None from this preview. Canonical analysis may independently create supported requirements from the submitted review evidence.",
    mergeGateEffect: "The listed gates are inspectable template clauses only; they are not selected, persisted or externally enforced.",
    repositoryApplicability: "No repository or review is assigned to this preview-only template.",
    currentReviewScope: "No effect on the open review or any existing record.",
    futureReviewScope: "Not currently selectable in New Review. A supported intake mapping would require an explicit future product contract.",
    persistenceBoundary: "No persistence. Inspecting this record stores no policy state.",
    enforcementBoundary: COMMON_POLICY_BOUNDARY.enforcementBoundary,
    humanDecisionBoundary: COMMON_POLICY_BOUNDARY.humanDecisionBoundary,
    unsupportedCapabilities: [...COMMON_UNSUPPORTED_CAPABILITIES, "No current New Review profile selects this template."],
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
    category: "Operational readiness",
    version: "1.0",
    provenance: COMMON_POLICY_BOUNDARY.provenance,
    executionType: "Mixed",
    capability: "Available at intake",
    intakeProfileIds: ["operational-readiness"],
    applicability: ["future-reviews"],
    reviewIntent: "Surface supported operational attention around failure modes, detection, rollback and recovery.",
    modelAssistedContribution: "Operational readiness changes deterministic attention when the structured operational record needs review. Optional model synthesis remains advisory and separately selected.",
    evidenceExpectations: ["Rollback or recovery evidence", "Detection, logging, metrics or alert context", "Tests for failure and retry paths"],
    requirementEffect: COMMON_POLICY_BOUNDARY.requirementEffect,
    mergeGateEffect: COMMON_POLICY_BOUNDARY.mergeGateEffect,
    repositoryApplicability: COMMON_POLICY_BOUNDARY.repositoryApplicability,
    currentReviewScope: COMMON_POLICY_BOUNDARY.currentReviewScope,
    futureReviewScope: COMMON_POLICY_BOUNDARY.futureReviewScope,
    persistenceBoundary: COMMON_POLICY_BOUNDARY.persistenceBoundary,
    enforcementBoundary: COMMON_POLICY_BOUNDARY.enforcementBoundary,
    humanDecisionBoundary: COMMON_POLICY_BOUNDARY.humanDecisionBoundary,
    unsupportedCapabilities: [...COMMON_UNSUPPORTED_CAPABILITIES],
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
    category: "AI-generated code",
    version: "1.0",
    provenance: COMMON_POLICY_BOUNDARY.provenance,
    executionType: "Mixed",
    capability: "Available at intake",
    intakeProfileIds: ["ai-generated-code"],
    applicability: ["future-reviews"],
    reviewIntent: "Increase deterministic attention to unsupported assumptions, missing tests and operational gaps in agent-assisted changes.",
    modelAssistedContribution: "The intake profile is independent of analysis provider. If model assistance is separately selected, builder/verifier provenance remains inspectable and shared context can create an advisory review clause.",
    evidenceExpectations: ["Direct tests for changed behaviour and failure paths", "Evidence that builder claims are independently supported", "Human confirmation where builder and verifier context may overlap"],
    requirementEffect: COMMON_POLICY_BOUNDARY.requirementEffect,
    mergeGateEffect: COMMON_POLICY_BOUNDARY.mergeGateEffect,
    repositoryApplicability: COMMON_POLICY_BOUNDARY.repositoryApplicability,
    currentReviewScope: COMMON_POLICY_BOUNDARY.currentReviewScope,
    futureReviewScope: COMMON_POLICY_BOUNDARY.futureReviewScope,
    persistenceBoundary: COMMON_POLICY_BOUNDARY.persistenceBoundary,
    enforcementBoundary: COMMON_POLICY_BOUNDARY.enforcementBoundary,
    humanDecisionBoundary: COMMON_POLICY_BOUNDARY.humanDecisionBoundary,
    unsupportedCapabilities: [...COMMON_UNSUPPORTED_CAPABILITIES],
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
