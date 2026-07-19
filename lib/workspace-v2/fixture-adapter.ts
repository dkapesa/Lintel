/* R1B.0 — Production Workspace V2 · fixture adapter.

   The only `WorkspaceAdapter` implementation shipped in R1B.0. It is entirely
   deterministic: fixed sample values, no `localStorage`, no API calls, no
   import of any production ledger / domain / persistence module, no fresh
   timestamps. Given the same request it returns the same snapshot.

   Every snapshot it produces is marked sample data via
   `WorkspaceProvenance.source = "sample-fixture"` and `isSample: true`, and
   every recorded decision carries `isSample: true`. The canonical primary case
   is PR #482 (r1a). The four operational groups (Needs attention / Review /
   Ready / Reviewed, r1a §16.5) are preserved; Reviewed is genuinely empty in
   this fixture rather than padded with fabricated activity.

   Sample identities (e.g. "Dana Ortiz") are fixed sample values, always shown
   with a Sample badge — never presented as real organisational activity. */

import {
  type WorkspaceAdapter,
  type WorkspaceSnapshotRequest,
} from "./adapter";
import { decisionMarkerFor } from "./projections";
import {
  type CaseDetail,
  type DecisionActor,
  type DecisionPlateViewModel,
  type QueueCaseSummary,
  type QueueGroup,
  type QueueGroupId,
  type Recommendation,
  type WorkspaceProvenance,
  type WorkspaceScenario,
  type WorkspaceSnapshot,
} from "./view-model";

const WORKSPACE_ID = "sample-workspace";
const REPOSITORY = "example/b2b-redemption-api";

/* Fixed sample reviewer. A clearly-badged sample identity, never a claim of
   real organisational activity (r0b2 §17.12, §24.18). */
const SAMPLE_REVIEWER: DecisionActor = {
  displayLabel: "Dana Ortiz",
  source: "local",
  role: "Accountable engineer",
};

/* --- Case 482 — TESTS_REQUIRED · canonical primary case --------------- */

const case482: CaseDetail = {
  caseId: "case-482",
  github: {
    repository: REPOSITORY,
    pullRequestNumber: 482,
    branch: "fix/discount-code-retrieval-fallback",
    headSha: "9c41af2",
    author: "Maya Chen",
    updatedAt: "Today, 10:42",
  },
  recommendation: "TESTS_REQUIRED",
  riskLevel: "MEDIUM",
  riskScore: 46,
  confidence: "MEDIUM",
  reviewStatus: "Tests requested",
  executiveSummary:
    "A fallback path was added around partner discount-code retrieval. The retry behaviour is the material change; everything else is supporting structure.",
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
    available: true,
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
  },
  /* State A — read succeeded, no engineer decision recorded. Matches the
     approved resting four-plane baseline for the canonical case. */
  decision: {
    status: "empty",
    recommendation: "TESTS_REQUIRED",
    openBlockingRequirements: 2,
    isSample: true,
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
};

/* --- Case 476 — REVIEW_REQUIRED · recorded, predates head ------------- */

const case476: CaseDetail = {
  caseId: "case-476",
  github: {
    repository: REPOSITORY,
    pullRequestNumber: 476,
    branch: "feat/tenant-rate-limit-budget",
    headSha: "1d70b3c",
    author: "Ade Okonkwo",
    updatedAt: "Today, 09:15",
  },
  recommendation: "REVIEW_REQUIRED",
  riskLevel: "MEDIUM",
  riskScore: 39,
  confidence: "LOW",
  reviewStatus: "Review required",
  executiveSummary:
    "A per-tenant rate-limit budget was introduced. The open question is deployment topology, which the repository does not answer.",
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
    available: true,
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
  },
  /* State C — a recorded decision that predates the current head and needs
     reaffirmation. Clearly sample data. */
  decision: {
    status: "recorded",
    outcome: "review-required",
    actor: SAMPLE_REVIEWER,
    recordedAt: "17 Jul 2026 · 16:20 · sample",
    applicability: "predates-current-head",
    applicableHeadSha: "7b3e0c9",
    currentHeadSha: "1d70b3c",
    priorHeadSha: "7b3e0c9",
    divergence: "aligned",
    rationale:
      "Holding for a human to confirm production worker topology before this can be approved.",
    references: [
      {
        id: "req_topology_confirmed",
        kind: "clause",
        label: "Deployment topology confirmed by a human",
        available: true,
        stale: false,
        modelAssisted: false,
      },
    ],
    acceptedRiskReferences: [],
    needsReaffirmation: true,
    isSample: true,
  },
  context: {
    summary:
      "A per-tenant rate-limit budget was introduced. The open question is deployment topology, which the repository does not answer.",
    reviewerFocus: ["Whether production runs multi-worker", "Whether a shared store is warranted"],
    limitations: ["No deployment manifest is present in the repository"],
  },
};

/* --- Case 471 — APPROVE · recorded, applicable ------------------------ */

const case471: CaseDetail = {
  caseId: "case-471",
  github: {
    repository: REPOSITORY,
    pullRequestNumber: 471,
    branch: "fix/expiry-timezone",
    headSha: "5ea9d10",
    author: "Priya Raman",
    updatedAt: "Yesterday, 17:04",
  },
  recommendation: "APPROVE",
  riskLevel: "LOW",
  riskScore: 11,
  confidence: "HIGH",
  reviewStatus: "Ready to merge",
  executiveSummary:
    "A narrow correctness fix to expiry evaluation, accompanied by tests that close the only requirement.",
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
    available: true,
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
  },
  /* State B — a recorded decision that applies to the current head. Matches
     the approved "applicable recorded Human Decision" baseline. Sample data. */
  decision: {
    status: "recorded",
    outcome: "approve",
    actor: SAMPLE_REVIEWER,
    recordedAt: "Yesterday, 17:20 · sample",
    applicability: "applicable",
    applicableHeadSha: "5ea9d10",
    currentHeadSha: "5ea9d10",
    priorHeadSha: null,
    divergence: "aligned",
    rationale:
      "Boundary tests close the only requirement; the timezone fix matches product intent for the DST case.",
    references: [
      {
        id: "req_expiry_covered",
        kind: "clause",
        label: "Timezone boundaries covered",
        available: true,
        stale: false,
        modelAssisted: false,
      },
      {
        id: "ev_expiry_tests",
        kind: "evidence",
        label: "Expiry boundary tests pass across timezones",
        available: true,
        stale: false,
        modelAssisted: false,
      },
    ],
    acceptedRiskReferences: [],
    needsReaffirmation: false,
    isSample: true,
  },
  context: {
    summary:
      "A narrow correctness fix to expiry evaluation, accompanied by tests that close the only requirement.",
    reviewerFocus: ["Whether the DST boundary case matches product intent"],
    limitations: [],
  },
};

/* --- Case 489 — BLOCK · recorded, applicable -------------------------- */

const case489: CaseDetail = {
  caseId: "case-489",
  github: {
    repository: REPOSITORY,
    pullRequestNumber: 489,
    branch: "perf/cache-partner-credentials",
    headSha: "b02f7ae",
    author: "Tom Vasquez",
    updatedAt: "Today, 11:58",
  },
  recommendation: "BLOCK",
  riskLevel: "CRITICAL",
  riskScore: 84,
  confidence: "HIGH",
  reviewStatus: "Blocked",
  executiveSummary:
    "A performance change introduced credential caching. The caching mechanism, not the performance goal, is what blocks this case.",
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
    available: true,
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
  },
  /* State B — a recorded blocking decision that applies to the current head.
     Aligned with the recommendation. Sample data. */
  decision: {
    status: "recorded",
    outcome: "blocked",
    actor: SAMPLE_REVIEWER,
    recordedAt: "Today, 12:05 · sample",
    applicability: "applicable",
    applicableHeadSha: "b02f7ae",
    currentHeadSha: "b02f7ae",
    priorHeadSha: null,
    divergence: "aligned",
    rationale:
      "Credential caching writes plaintext secrets to shared storage. Blocking until the write path is removed or encrypted with a bounded TTL.",
    references: [
      {
        id: "req_no_plaintext_credentials",
        kind: "clause",
        label: "No plaintext credentials in shared storage",
        available: true,
        stale: false,
        modelAssisted: false,
      },
    ],
    acceptedRiskReferences: [],
    needsReaffirmation: false,
    isSample: true,
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
};

/* --- Case ordering & grouping ----------------------------------------- */

/* Deterministic case order (canonical primary case surfaces first via the
   default selection below; queue order follows operational severity). */
const CASES: CaseDetail[] = [case489, case482, case476, case471];

const DEFAULT_CASE_ID = case482.caseId;

/* All four operational groups are declared. Assignment is by review status
   first (Reviewed / Archived → Reviewed), then by recommendation. Reviewed is
   genuinely empty in this fixture. */
const GROUP_DEFINITIONS: { id: QueueGroupId; label: string; recommendations: Recommendation[] }[] =
  [
    { id: "attention", label: "Needs attention", recommendations: ["BLOCK", "TESTS_REQUIRED"] },
    { id: "review", label: "Review", recommendations: ["REVIEW_REQUIRED"] },
    { id: "ready", label: "Ready", recommendations: ["APPROVE"] },
    { id: "reviewed", label: "Reviewed", recommendations: [] },
  ];

function groupIdForCase(detail: CaseDetail): QueueGroupId {
  if (detail.reviewStatus === "Reviewed" || detail.reviewStatus === "Archived") {
    return "reviewed";
  }
  const match = GROUP_DEFINITIONS.find((group) =>
    group.recommendations.includes(detail.recommendation),
  );
  return match ? match.id : "review";
}

/* Human-readable case titles for the queue (the diff-summary headline), kept
   separate from the branch so both are available to the header and queue. */
const CASE_TITLE: Record<string, string> = {
  "case-482": "Add fallback handling for failed discount-code retrieval",
  "case-476": "Introduce partner rate-limit budget per tenant",
  "case-471": "Correct timezone handling in redemption expiry window",
  "case-489": "Cache partner credentials in redemption worker",
};

function summaryForCase(detail: CaseDetail): QueueCaseSummary {
  return {
    caseId: detail.caseId,
    pullRequestNumber: detail.github.pullRequestNumber,
    title: CASE_TITLE[detail.caseId] ?? detail.github.branch,
    repository: detail.github.repository,
    recommendation: detail.recommendation,
    riskLevel: detail.riskLevel,
    groupId: groupIdForCase(detail),
    reviewStatus: detail.reviewStatus,
    decisionMarker: decisionMarkerFor(detail.decision),
    currentHeadSha: detail.github.headSha,
  };
}

function buildGroups(): QueueGroup[] {
  return GROUP_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    cases: CASES.filter((detail) => groupIdForCase(detail) === definition.id).map(summaryForCase),
  }));
}

/* --- Provenance ------------------------------------------------------- */

function provenanceFor(scenario: WorkspaceScenario): WorkspaceProvenance {
  return {
    source: "sample-fixture",
    isSample: true,
    label: "Sample fixture data",
    scenario,
  };
}

const IDENTITY = {
  workspaceId: WORKSPACE_ID,
  repository: REPOSITORY,
  label: "Sample workspace",
};

/* --- The adapter ------------------------------------------------------ */

export function createFixtureWorkspaceAdapter(): WorkspaceAdapter {
  return {
    async loadSnapshot(request: WorkspaceSnapshotRequest): Promise<WorkspaceSnapshot> {
      return buildFixtureSnapshot(request.scenario);
    },
  };
}

export function buildFixtureSnapshot(scenario: WorkspaceScenario): WorkspaceSnapshot {
  const provenance = provenanceFor(scenario);

  if (scenario === "empty") {
    return { status: "empty", identity: IDENTITY, provenance };
  }

  if (scenario === "loading") {
    return { status: "loading", identity: IDENTITY, provenance };
  }

  if (scenario === "unavailable") {
    return {
      status: "unavailable",
      identity: IDENTITY,
      provenance,
      reason:
        "The workspace projection could not be built. This is a sample unavailable state; no review data was read.",
    };
  }

  return {
    status: "ready",
    identity: IDENTITY,
    provenance,
    groups: buildGroups().filter((group) => group.cases.length > 0),
    cases: CASES,
    defaultCaseId: DEFAULT_CASE_ID,
  };
}
