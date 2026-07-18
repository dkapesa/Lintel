/* R0B.1 — Workspace V2 visual lab fixtures.

   Lab-local view types only. This file deliberately does NOT import from
   `lib/` so the lab carries zero production coupling. Every union below is
   transcribed from a verified production source and must stay value-identical:

     Recommendation, RiskLevel, Confidence, FindingSeverity  → lib/mock-report.ts
     ReviewStatus                                            → lib/review-state.ts
     EvidenceClass, EvidenceStatus                           → lib/evidence-hierarchy.ts
     RequirementStatus, RequirementImportance                → lib/merge-contract.ts
     ReadinessClassification                                 → lib/readiness-delta.ts

   Production has no `ReviewStage` enum. The Evidence Spine stage chain
   defined here is a lab-local navigation construct, not a production enum.

   R0B.1 SCOPE — UNSIGNED DECISION ONLY.
   No recorded Human Decision exists in this fixture: no outcome, actor,
   role, recordedAt, applicable SHA, fingerprint, attestation state or
   rationale history. Recorded-decision design is deferred to R0B.2. */

export type Recommendation = "APPROVE" | "REVIEW_REQUIRED" | "TESTS_REQUIRED" | "BLOCK";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ReviewStatus =
  | "Needs work"
  | "Tests requested"
  | "Review required"
  | "Blocked"
  | "Ready to merge"
  | "Reviewed"
  | "Archived";

export type EvidenceClass =
  | "externally-verified"
  | "directly-observed"
  | "human-confirmed"
  | "builder-declared"
  | "model-inferred"
  | "assumption"
  | "unknown";

export type EvidenceStatus =
  | "present"
  | "missing"
  | "unverified"
  | "confirmed"
  | "stale"
  | "not-applicable";

export type RequirementStatus =
  | "open"
  | "satisfied"
  | "accepted"
  | "invalidated"
  | "superseded"
  | "stale"
  | "unavailable";

export type RequirementImportance = "blocking" | "advisory";

export type ReadinessClassification =
  | "initial"
  | "improved"
  | "regressed"
  | "mixed"
  | "unchanged";

export type FindingProvenance = "Rule detected" | "Model assisted" | "Baseline preserved";

export type FindingCategory =
  | "Security"
  | "Reliability"
  | "Maintainability"
  | "Missing tests"
  | "API contract";

/* --- Evidence Spine — canonical visible stage chain -------------------- */

export type StageId = "change" | "observation" | "evidence" | "requirement" | "decision";

export type StageState = "complete" | "current" | "attention" | "pending";

export type StageDefinition = {
  id: StageId;
  label: string;
  domId: string;
  /* The decision stage terminates at the Decision Plate rather than at a
     scrollable canvas section. */
  terminal?: boolean;
};

export const WORKSPACE_V2_STAGES: StageDefinition[] = [
  { id: "change", label: "Change", domId: "wsv2-stage-change" },
  { id: "observation", label: "Observation", domId: "wsv2-stage-observation" },
  { id: "evidence", label: "Evidence", domId: "wsv2-stage-evidence" },
  { id: "requirement", label: "Requirement", domId: "wsv2-stage-requirement" },
  { id: "decision", label: "Human decision", domId: "wsv2-decision-plate", terminal: true },
];

/* --- Focus model ------------------------------------------------------ */

export type ArtifactKind = "finding" | "evidence" | "requirement";

export type FocusedArtifact = {
  kind: ArtifactKind;
  id: string;
} | null;

/* --- View models ------------------------------------------------------ */

export type ChangedFileView = {
  path: string;
  additions: number;
  deletions: number;
  risk: RiskLevel;
};

export type FindingView = {
  findingId: string;
  severity: FindingSeverity;
  title: string;
  statement: string;
  action: string;
  file: string;
  provenance: FindingProvenance;
  category: FindingCategory;
  supportingEvidenceIds: string[];
  relatedRequirementIds: string[];
};

export type EvidenceView = {
  evidenceId: string;
  title: string;
  statement: string;
  evidenceClass: EvidenceClass;
  status: EvidenceStatus;
  provenance: string;
  source: string;
  observedAt: string;
  stale: boolean;
  supportsFindingIds: string[];
};

export type RequirementView = {
  requirementId: string;
  title: string;
  statement: string;
  importance: RequirementImportance;
  status: RequirementStatus;
  evidenceRequired: string;
  supportingEvidenceIds: string[];
  stale: boolean;
};

export type ReadinessView = {
  classification: ReadinessClassification;
  previousScore: number;
  currentScore: number;
  scoreChange: number;
  previousRecommendation: Recommendation;
  currentRecommendation: Recommendation;
  clearedCount: number;
  openedCount: number;
  becameStaleCount: number;
  note: string;
};

export type CaseContextView = {
  summary: string;
  reviewerFocus: string[];
  limitations: string[];
};

/* R0B.1 unsigned decision state. No recorded-decision fields exist here by
   design. There is no mutation path and no persistence. */
export type UnsignedDecisionView = {
  recorded: false;
  recommendation: Recommendation;
  openBlockingRequirements: number;
};

export type CaseFixture = {
  caseId: string;
  repository: string;
  pullRequestNumber: number;
  title: string;
  branch: string;
  headSha: string;
  author: string;
  updatedAt: string;
  reviewStatus: ReviewStatus;
  recommendation: Recommendation;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: Confidence;
  changedFiles: ChangedFileView[];
  findings: FindingView[];
  evidence: EvidenceView[];
  requirements: RequirementView[];
  readiness: ReadinessView;
  context: CaseContextView;
  decision: UnsignedDecisionView;
};

/* --- Case 1 — PR #482 · TESTS_REQUIRED · dense default ---------------- */

const case482: CaseFixture = {
  caseId: "case-482",
  repository: "example/b2b-redemption-api",
  pullRequestNumber: 482,
  title: "Add fallback handling for failed discount-code retrieval",
  branch: "fix/discount-code-retrieval-fallback",
  headSha: "9c41af2",
  author: "Maya Chen",
  updatedAt: "Today, 10:42",
  reviewStatus: "Tests requested",
  recommendation: "TESTS_REQUIRED",
  riskLevel: "MEDIUM",
  riskScore: 46,
  confidence: "MEDIUM",

  changedFiles: [
    { path: "app/services/redemption_service.py", additions: 74, deletions: 12, risk: "HIGH" },
    { path: "app/clients/partner_code_client.py", additions: 41, deletions: 8, risk: "MEDIUM" },
    { path: "app/api/redemptions.py", additions: 23, deletions: 5, risk: "MEDIUM" },
    { path: "tests/test_redemption_service.py", additions: 58, deletions: 0, risk: "LOW" },
  ],

  findings: [
    {
      findingId: "finding_retry_idempotency",
      severity: "HIGH",
      title: "Retry behaviour may create duplicate redemption risk",
      statement:
        "The redemption flow retries after failed discount-code retrieval, but there is no confirmed idempotency guard around repeated redemption attempts. A partner timeout followed by a successful retry can issue two codes for one request.",
      action: "Add idempotency checks and tests proving retries cannot issue duplicate codes.",
      file: "app/services/redemption_service.py:118",
      provenance: "Rule detected",
      category: "Reliability",
      supportingEvidenceIds: ["ev_retry_path", "ev_no_idempotency_key"],
      relatedRequirementIds: ["req_test_idempotency"],
    },
    {
      findingId: "finding_provider_failure_coverage",
      severity: "MEDIUM",
      title: "External provider failure states need fuller coverage",
      statement:
        "Timeout, 5xx, malformed response and empty response cases are each reachable through the new fallback branch but none are exercised by the test suite.",
      action: "Add provider failure tests for all four cases.",
      file: "app/clients/partner_code_client.py:64",
      provenance: "Rule detected",
      category: "Missing tests",
      supportingEvidenceIds: ["ev_coverage_gap"],
      relatedRequirementIds: ["req_test_provider_failure"],
    },
    {
      findingId: "finding_error_contract",
      severity: "MEDIUM",
      title: "API error contract may be unclear for clients",
      statement:
        "Failed discount-code retrieval needs a stable client-facing error shape. The current handler returns a generic 502 without distinguishing retryable from terminal failure.",
      action: "Define retryable and non-retryable error responses and add a contract test.",
      file: "app/api/redemptions.py:41",
      provenance: "Model assisted",
      category: "API contract",
      supportingEvidenceIds: ["ev_error_shape_inferred"],
      relatedRequirementIds: ["req_api_error_contract"],
    },
  ],

  evidence: [
    {
      evidenceId: "ev_retry_path",
      title: "Retry path observed in redemption service",
      statement:
        "A retry wrapper is applied to partner code retrieval with three attempts and exponential backoff.",
      evidenceClass: "directly-observed",
      status: "confirmed",
      provenance: "Rule detected",
      source: "app/services/redemption_service.py:118",
      observedAt: "Today, 10:42",
      stale: false,
      supportsFindingIds: ["finding_retry_idempotency"],
    },
    {
      evidenceId: "ev_no_idempotency_key",
      title: "No idempotency key present on redemption write",
      statement:
        "The redemption write path does not pass an idempotency key to the partner client, so the provider cannot deduplicate repeated attempts.",
      evidenceClass: "directly-observed",
      status: "present",
      provenance: "Rule detected",
      source: "app/clients/partner_code_client.py:64",
      observedAt: "Today, 10:42",
      stale: false,
      supportsFindingIds: ["finding_retry_idempotency"],
    },
    {
      evidenceId: "ev_coverage_gap",
      title: "Provider failure cases absent from test suite",
      statement:
        "No test exercises timeout, 5xx, malformed or empty responses from the partner provider.",
      evidenceClass: "directly-observed",
      status: "missing",
      provenance: "Lintel missing coverage signal",
      source: "tests/test_redemption_service.py",
      observedAt: "Today, 10:42",
      stale: false,
      supportsFindingIds: ["finding_provider_failure_coverage"],
    },
    {
      evidenceId: "ev_error_shape_inferred",
      title: "Client-facing error shape inferred, not verified",
      statement:
        "The error contract was inferred from handler structure and has not been confirmed against a consumer.",
      evidenceClass: "model-inferred",
      status: "unverified",
      provenance: "Model assisted",
      source: "app/api/redemptions.py:41",
      observedAt: "Today, 10:42",
      stale: false,
      supportsFindingIds: ["finding_error_contract"],
    },
    {
      evidenceId: "ev_prior_load_test",
      title: "Prior load test result for redemption endpoint",
      statement:
        "A load test from the previous head recorded p99 latency within budget under retry pressure. It has not been re-run against the current head.",
      evidenceClass: "externally-verified",
      status: "stale",
      provenance: "CI artefact",
      source: "run 8841 · sha 3ba07e1",
      observedAt: "2 runs ago",
      stale: true,
      supportsFindingIds: [],
    },
  ],

  requirements: [
    {
      requirementId: "req_test_idempotency",
      title: "Idempotency proven under retry",
      statement:
        "Repeated redemption attempts for the same request must not issue duplicate discount codes.",
      importance: "blocking",
      status: "open",
      evidenceRequired:
        "A passing test that replays a retried redemption and asserts a single code issue.",
      supportingEvidenceIds: [],
      stale: false,
    },
    {
      requirementId: "req_test_provider_failure",
      title: "Provider failure states covered",
      statement:
        "Timeout, 5xx, malformed and empty provider responses each have explicit test coverage.",
      importance: "blocking",
      status: "open",
      evidenceRequired: "Four passing tests, one per failure mode.",
      supportingEvidenceIds: ["ev_coverage_gap"],
      stale: false,
    },
    {
      requirementId: "req_api_error_contract",
      title: "Error contract defined for clients",
      statement: "Retryable and non-retryable error responses are documented and asserted.",
      importance: "advisory",
      status: "open",
      evidenceRequired: "A contract test asserting the documented error shape.",
      supportingEvidenceIds: ["ev_error_shape_inferred"],
      stale: false,
    },
    {
      requirementId: "req_rollback_path",
      title: "Rollback path unchanged",
      statement: "The change does not alter the documented rollback procedure for redemptions.",
      importance: "advisory",
      status: "satisfied",
      evidenceRequired: "Confirmation that no migration or state change was introduced.",
      supportingEvidenceIds: ["ev_retry_path"],
      stale: false,
    },
    {
      requirementId: "req_latency_budget",
      title: "Latency budget held under retry",
      statement: "Retry behaviour keeps p99 latency for the redemption endpoint within budget.",
      importance: "advisory",
      status: "stale",
      evidenceRequired: "A load test result recorded against the current head.",
      supportingEvidenceIds: ["ev_prior_load_test"],
      stale: true,
    },
  ],

  readiness: {
    classification: "improved",
    previousScore: 58,
    currentScore: 46,
    scoreChange: -12,
    previousRecommendation: "BLOCK",
    currentRecommendation: "TESTS_REQUIRED",
    clearedCount: 2,
    openedCount: 0,
    becameStaleCount: 1,
    note: "Two blocking requirements cleared since the previous head. One latency requirement became stale because the load test has not been re-run.",
  },

  context: {
    summary:
      "A fallback path was added around partner discount-code retrieval. The retry behaviour is the material change; everything else is supporting structure.",
    reviewerFocus: [
      "Whether a retried redemption can issue two codes",
      "Whether provider failure modes are all reachable and tested",
      "Whether the client error contract is stable",
    ],
    limitations: [
      "The error contract finding is model assisted and unverified",
      "Latency evidence predates the current head",
    ],
  },

  decision: {
    recorded: false,
    recommendation: "TESTS_REQUIRED",
    openBlockingRequirements: 2,
  },
};

/* --- Case 2 — PR #476 · REVIEW_REQUIRED ------------------------------- */

const case476: CaseFixture = {
  caseId: "case-476",
  repository: "example/b2b-redemption-api",
  pullRequestNumber: 476,
  title: "Introduce partner rate-limit budget per tenant",
  branch: "feat/tenant-rate-limit-budget",
  headSha: "1d70b3c",
  author: "Ade Okonkwo",
  updatedAt: "Today, 09:15",
  reviewStatus: "Review required",
  recommendation: "REVIEW_REQUIRED",
  riskLevel: "MEDIUM",
  riskScore: 39,
  confidence: "LOW",

  changedFiles: [
    { path: "app/limits/tenant_budget.py", additions: 96, deletions: 3, risk: "MEDIUM" },
    { path: "app/api/redemptions.py", additions: 14, deletions: 2, risk: "LOW" },
  ],

  findings: [
    {
      findingId: "finding_tenant_isolation",
      severity: "MEDIUM",
      title: "Tenant budget sharing may not be isolated under burst",
      statement:
        "The budget counter is keyed per tenant but shares a process-local cache. Under multi-worker deployment two tenants may observe inconsistent remaining budget.",
      action: "Confirm the deployment topology and decide whether a shared store is required.",
      file: "app/limits/tenant_budget.py:52",
      provenance: "Model assisted",
      category: "Reliability",
      supportingEvidenceIds: ["ev_cache_scope", "ev_topology_unknown"],
      relatedRequirementIds: ["req_topology_confirmed"],
    },
  ],

  evidence: [
    {
      evidenceId: "ev_cache_scope",
      title: "Budget cache is process-local",
      statement:
        "The budget cache is instantiated at module scope with no shared backend configured.",
      evidenceClass: "directly-observed",
      status: "confirmed",
      provenance: "Rule detected",
      source: "app/limits/tenant_budget.py:52",
      observedAt: "Today, 09:15",
      stale: false,
      supportsFindingIds: ["finding_tenant_isolation"],
    },
    {
      evidenceId: "ev_topology_unknown",
      title: "Deployment worker count not determinable",
      statement:
        "Lintel cannot determine the production worker topology from the repository alone.",
      evidenceClass: "assumption",
      status: "unverified",
      provenance: "Lintel deterministic input",
      source: "no deployment manifest in repository",
      observedAt: "Today, 09:15",
      stale: false,
      supportsFindingIds: ["finding_tenant_isolation"],
    },
  ],

  requirements: [
    {
      requirementId: "req_topology_confirmed",
      title: "Deployment topology confirmed by a human",
      statement:
        "An engineer confirms whether the service runs multi-worker in production before this merges.",
      importance: "blocking",
      status: "open",
      evidenceRequired: "Human confirmation of worker topology.",
      supportingEvidenceIds: ["ev_topology_unknown"],
      stale: false,
    },
  ],

  readiness: {
    classification: "initial",
    previousScore: 39,
    currentScore: 39,
    scoreChange: 0,
    previousRecommendation: "REVIEW_REQUIRED",
    currentRecommendation: "REVIEW_REQUIRED",
    clearedCount: 0,
    openedCount: 1,
    becameStaleCount: 0,
    note: "First analysed head. One requirement opened that only a human can close.",
  },

  context: {
    summary:
      "A per-tenant rate-limit budget was introduced. The open question is deployment topology, which the repository does not answer.",
    reviewerFocus: ["Whether production runs multi-worker", "Whether a shared store is warranted"],
    limitations: ["No deployment manifest is present in the repository"],
  },

  decision: {
    recorded: false,
    recommendation: "REVIEW_REQUIRED",
    openBlockingRequirements: 1,
  },
};

/* --- Case 3 — PR #471 · APPROVE --------------------------------------- */

const case471: CaseFixture = {
  caseId: "case-471",
  repository: "example/b2b-redemption-api",
  pullRequestNumber: 471,
  title: "Correct timezone handling in redemption expiry window",
  branch: "fix/expiry-timezone",
  headSha: "5ea9d10",
  author: "Priya Raman",
  updatedAt: "Yesterday, 17:04",
  reviewStatus: "Ready to merge",
  recommendation: "APPROVE",
  riskLevel: "LOW",
  riskScore: 11,
  confidence: "HIGH",

  changedFiles: [
    { path: "app/domain/expiry.py", additions: 9, deletions: 6, risk: "LOW" },
    { path: "tests/test_expiry.py", additions: 34, deletions: 0, risk: "LOW" },
  ],

  findings: [],

  evidence: [
    {
      evidenceId: "ev_expiry_tests",
      title: "Expiry boundary tests pass across timezones",
      statement:
        "Parameterised tests cover UTC, positive and negative offsets, and a DST boundary case.",
      evidenceClass: "externally-verified",
      status: "confirmed",
      provenance: "CI artefact",
      source: "run 8903 · sha 5ea9d10",
      observedAt: "Yesterday, 17:04",
      stale: false,
      supportsFindingIds: [],
    },
  ],

  requirements: [
    {
      requirementId: "req_expiry_covered",
      title: "Timezone boundaries covered",
      statement: "Expiry evaluation is correct across offsets and DST transitions.",
      importance: "blocking",
      status: "satisfied",
      evidenceRequired: "Passing parameterised boundary tests.",
      supportingEvidenceIds: ["ev_expiry_tests"],
      stale: false,
    },
  ],

  readiness: {
    classification: "improved",
    previousScore: 24,
    currentScore: 11,
    scoreChange: -13,
    previousRecommendation: "TESTS_REQUIRED",
    currentRecommendation: "APPROVE",
    clearedCount: 1,
    openedCount: 0,
    becameStaleCount: 0,
    note: "The single blocking requirement was satisfied by new boundary tests on this head.",
  },

  context: {
    summary:
      "A narrow correctness fix to expiry evaluation, accompanied by tests that close the only requirement.",
    reviewerFocus: ["Whether the DST boundary case matches product intent"],
    limitations: [],
  },

  decision: {
    recorded: false,
    recommendation: "APPROVE",
    openBlockingRequirements: 0,
  },
};

/* --- Case 4 — PR #489 · BLOCK ----------------------------------------- */

const case489: CaseFixture = {
  caseId: "case-489",
  repository: "example/b2b-redemption-api",
  pullRequestNumber: 489,
  title: "Cache partner credentials in redemption worker",
  branch: "perf/cache-partner-credentials",
  headSha: "b02f7ae",
  author: "Tom Vasquez",
  updatedAt: "Today, 11:58",
  reviewStatus: "Blocked",
  recommendation: "BLOCK",
  riskLevel: "CRITICAL",
  riskScore: 84,
  confidence: "HIGH",

  changedFiles: [
    { path: "app/workers/redemption_worker.py", additions: 62, deletions: 4, risk: "CRITICAL" },
    { path: "app/clients/partner_code_client.py", additions: 18, deletions: 2, risk: "HIGH" },
  ],

  findings: [
    {
      findingId: "finding_credential_cache",
      severity: "CRITICAL",
      title: "Partner credentials written to a shared unencrypted cache",
      statement:
        "Partner API credentials are serialised into the shared Redis cache without encryption and with no TTL, making them readable by any service sharing the instance.",
      action: "Remove credential caching or move to an encrypted secret store with a bounded TTL.",
      file: "app/workers/redemption_worker.py:88",
      provenance: "Rule detected",
      category: "Security",
      supportingEvidenceIds: ["ev_credential_write"],
      relatedRequirementIds: ["req_no_plaintext_credentials"],
    },
  ],

  evidence: [
    {
      evidenceId: "ev_credential_write",
      title: "Credential serialisation to shared cache observed",
      statement:
        "The worker writes the partner credential object to Redis with no encryption and no expiry argument.",
      evidenceClass: "directly-observed",
      status: "confirmed",
      provenance: "Rule detected",
      source: "app/workers/redemption_worker.py:88",
      observedAt: "Today, 11:58",
      stale: false,
      supportsFindingIds: ["finding_credential_cache"],
    },
  ],

  requirements: [
    {
      requirementId: "req_no_plaintext_credentials",
      title: "No plaintext credentials in shared storage",
      statement: "Partner credentials must not be persisted unencrypted to shared infrastructure.",
      importance: "blocking",
      status: "open",
      evidenceRequired: "Removal of the write path, or proof of encryption plus bounded TTL.",
      supportingEvidenceIds: ["ev_credential_write"],
      stale: false,
    },
  ],

  readiness: {
    classification: "regressed",
    previousScore: 31,
    currentScore: 84,
    scoreChange: 53,
    previousRecommendation: "REVIEW_REQUIRED",
    currentRecommendation: "BLOCK",
    clearedCount: 0,
    openedCount: 1,
    becameStaleCount: 0,
    note: "A critical security requirement opened on this head. Risk score rose sharply from the previous run.",
  },

  context: {
    summary:
      "A performance change introduced credential caching. The caching mechanism, not the performance goal, is what blocks this case.",
    reviewerFocus: [
      "Whether credential caching is needed at all",
      "Whether a secret store is available",
    ],
    limitations: [],
  },

  decision: {
    recorded: false,
    recommendation: "BLOCK",
    openBlockingRequirements: 1,
  },
};

/* --- Queue ------------------------------------------------------------ */

export const WORKSPACE_V2_CASES: CaseFixture[] = [case489, case482, case476, case471];

export const WORKSPACE_V2_DEFAULT_CASE_ID = case482.caseId;

export type QueueGroupId = "attention" | "review" | "ready";

export type QueueGroup = {
  id: QueueGroupId;
  label: string;
  recommendations: Recommendation[];
};

/* Groups are operational, not decorative: they describe what the queue is
   asking of the engineer. Ordering inside a group follows severity. */
export const WORKSPACE_V2_QUEUE_GROUPS: QueueGroup[] = [
  { id: "attention", label: "Needs attention", recommendations: ["BLOCK", "TESTS_REQUIRED"] },
  { id: "review", label: "Review", recommendations: ["REVIEW_REQUIRED"] },
  { id: "ready", label: "Ready", recommendations: ["APPROVE"] },
];

export function casesForGroup(group: QueueGroup): CaseFixture[] {
  return group.recommendations.flatMap((recommendation) =>
    WORKSPACE_V2_CASES.filter((item) => item.recommendation === recommendation),
  );
}

export function findCase(caseId: string): CaseFixture {
  return WORKSPACE_V2_CASES.find((item) => item.caseId === caseId) ?? case482;
}

/* --- Derived stage projections ---------------------------------------- */

export function stageCount(fixture: CaseFixture, stage: StageId): number {
  if (stage === "change") return fixture.changedFiles.length;
  if (stage === "observation") return fixture.findings.length;
  if (stage === "evidence") return fixture.evidence.length;
  if (stage === "requirement") return fixture.requirements.length;
  /* R0B.1 records no decisions, so this count is always zero by design. */
  return 0;
}

export function stageState(fixture: CaseFixture, stage: StageId): StageState {
  if (stage === "change") {
    const severe = fixture.changedFiles.some(
      (item) => item.risk === "HIGH" || item.risk === "CRITICAL",
    );
    return severe ? "attention" : "complete";
  }

  if (stage === "observation") {
    if (fixture.findings.length === 0) return "complete";
    const severe = fixture.findings.some(
      (item) => item.severity === "HIGH" || item.severity === "CRITICAL",
    );
    return severe ? "attention" : "pending";
  }

  if (stage === "evidence") {
    const weak = fixture.evidence.some(
      (item) => item.stale || item.status === "missing" || item.status === "unverified",
    );
    return weak ? "attention" : "complete";
  }

  if (stage === "requirement") {
    const openBlocking = fixture.requirements.some(
      (item) => item.importance === "blocking" && item.status === "open",
    );
    if (openBlocking) return "attention";
    const anyOpen = fixture.requirements.some((item) => item.status === "open");
    return anyOpen ? "pending" : "complete";
  }

  /* No decision is recorded in R0B.1, so the terminal stage is always
     outstanding. */
  return "attention";
}

/* --- Derived evidence projections ------------------------------------- */

/* Rank on the production evidence ladder, collapsed to four visible steps
   for the strength meter. Higher is stronger. */
export function evidenceRank(evidenceClass: EvidenceClass): number {
  if (evidenceClass === "externally-verified") return 4;
  if (evidenceClass === "directly-observed") return 3;
  if (evidenceClass === "human-confirmed") return 3;
  if (evidenceClass === "builder-declared") return 2;
  if (evidenceClass === "model-inferred") return 1;
  if (evidenceClass === "assumption") return 1;
  return 0;
}

export function isStrongEvidence(evidenceClass: EvidenceClass): boolean {
  return evidenceRank(evidenceClass) >= 3;
}

export type EvidenceComposition = {
  strong: number;
  inferred: number;
  incomplete: number;
  stale: number;
  total: number;
};

/* Composition is a plain count of this case's own records. It is not a
   benchmark and implies no comparison to any other case or to "normal". */
export function evidenceComposition(fixture: CaseFixture): EvidenceComposition {
  const records = fixture.evidence;
  return {
    strong: records.filter((item) => isStrongEvidence(item.evidenceClass) && !item.stale).length,
    inferred: records.filter((item) => !isStrongEvidence(item.evidenceClass)).length,
    incomplete: records.filter(
      (item) => item.status === "missing" || item.status === "unverified",
    ).length,
    stale: records.filter((item) => item.stale).length,
    total: records.length,
  };
}

export function confirmedEvidenceCount(fixture: CaseFixture): number {
  return fixture.evidence.filter(
    (item) => (item.status === "confirmed" || item.status === "present") && !item.stale,
  ).length;
}

export function staleEvidenceCount(fixture: CaseFixture): number {
  return fixture.evidence.filter((item) => item.stale).length;
}

export function openBlockingCount(fixture: CaseFixture): number {
  return fixture.requirements.filter(
    (item) => item.importance === "blocking" && item.status === "open",
  ).length;
}
