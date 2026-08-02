/* R5E.1B — canonical read-only data module for the recalibrated public
   prototype at /visual-lab/public-r5-recalibrated.

   One typed, read-only source for every PR #482 fixture value the prototype
   renders. Cross-checked against the frozen fixture
   lib/workspace-v2/fixture-adapter.ts (case482, the canonical primary case)
   on 2026-08-02. Where the two could disagree the frozen fixture wins; no
   disagreement was found for the fields used here.

   This module is a separate, cross-checked snapshot, not an import of
   server-only application code, per
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §8a. It follows the
   same shape as app/_public-r5/content.ts but is not that file: R5E.1A §8a.4
   forbids editing the accepted production content source, and this is a
   distinct recalibrated implementation.

   Locked values (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §5,
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §2) never change in
   any state or at any viewport. No sequential identifier scheme is invented
   here (§2c.i) — the only identifiers shown are the genuine stage numbers
   01–08 and the fixture's own internal keys, used as state keys and,
   where the frozen product itself displays them, as content. */

export const CANONICAL_REVIEW = {
  repository: "example/b2b-redemption-api",
  pullRequestNumber: 482,
  pullRequestLabel: "PR #482",
  title: "Add fallback handling for failed discount-code retrieval",
  branch: "fix/discount-code-retrieval-fallback",
  headSha: "9c41af2",
  recommendation: "Tests required",
  riskLabel: "46/100 · MEDIUM",
  riskScore: 46,
  riskLevel: "MEDIUM",
  confidence: "MEDIUM",
  requirementsSummary: "4 open · 2 blocking",
  requirementsOpen: 4,
  requirementsBlocking: 2,
  humanDecision: "PENDING",
  selectedReviewLabel: "SELECTED REVIEW · READ-ONLY SAMPLE",
  reviewKey: "case-482",
} as const;

/* The primary finding, taken verbatim from case482.findings[0]
   (findingId: "finding_retry_idempotency") in the frozen fixture. */
export const PRIMARY_FINDING = {
  recordKey: "finding_retry_idempotency",
  severity: "HIGH",
  category: "Reliability",
  provenance: "Rule detected",
  title: "Retry behaviour may create duplicate redemption risk",
  statement:
    "The redemption flow retries after failed discount-code retrieval, but there is no confirmed idempotency guard around repeated redemption attempts. A partner timeout followed by a successful retry can issue two codes for one request.",
  action: "Add idempotency checks and tests proving retries cannot issue duplicate codes.",
  file: "app/services/redemption_service.py:118",
  supportingEvidence: [
    {
      recordKey: "ev_retry_path",
      title: "Retry path observed in redemption service",
      status: "confirmed",
    },
    {
      recordKey: "ev_no_idempotency_key",
      title: "No idempotency key present on redemption write",
      status: "present",
    },
  ],
  relatedRequirement: {
    recordKey: "req_test_idempotency",
    title: "Idempotency proven under retry",
    state: "blocking · open",
  },
} as const;

/* Review-level next inspection and evidence-boundary summary, both taken
   verbatim from the frozen fixture's evidence array (5 records for case482:
   ev_retry_path confirmed, ev_no_idempotency_key present, ev_coverage_gap
   missing, ev_error_shape_inferred unverified, ev_prior_load_test stale). */
export const REVIEW_OVERVIEW = {
  nextInspection: "Provider failure cases absent from test suite",
  evidenceBoundary: "5 canonical evidence records. 2 missing or unverified; 1 stale.",
  reviewerFocus: [
    "Whether a retried redemption can issue two codes",
    "Whether provider failure modes are all reachable and tested",
    "Whether the client error contract is stable",
  ],
  limitation: "The error contract finding is model assisted and unverified.",
} as const;

/* The eight product verification stages, in the product's own order and
   numbering (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §7). R5E.1B wires
   interactive controls only for 01 and 02; 03–08 remain truthful orientation
   labels, per docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md §2. */
export const VERIFICATION_STAGES = [
  { no: "01", name: "Change", body: "What was changed, with its branch, head and files." },
  { no: "02", name: "Finding", body: "What in that change may matter, with severity and provenance." },
  { no: "03", name: "Evidence", body: "Canonical records that support or weaken the finding." },
  { no: "04", name: "Missing proof", body: "Where canonical evidence is missing, unverified or stale." },
  { no: "05", name: "Requirement", body: "What must be proven before the change can progress." },
  { no: "06", name: "Affected context", body: "The surfaces and concerns the change reaches." },
  { no: "07", name: "Readiness", body: "The current blocking state of the review." },
  { no: "08", name: "Human Decision", body: "The outcome reserved for the accountable engineer." },
] as const;

/* Two genuine, inert context rows for the Review Queue. Titles, recommendations
   and risk are taken verbatim from case489 and case471 in the frozen fixture.
   They render as non-interactive context only (docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md
   §3.11) and never imply a second working demo case. */
export const QUEUE_CONTEXT_ROWS = [
  {
    reviewKey: "case-489",
    repository: "example/b2b-redemption-api",
    pullRequestLabel: "PR #489",
    title: "Cache partner credentials in redemption worker",
    recommendation: "Blocked",
    riskLabel: "84/100 · CRITICAL",
  },
  {
    reviewKey: "case-471",
    repository: "example/b2b-redemption-api",
    pullRequestLabel: "PR #471",
    title: "Correct timezone handling in redemption expiry window",
    recommendation: "Approve",
    riskLabel: "11/100 · LOW",
  },
] as const;

export const GLOBAL_RAIL_AREAS = [
  { label: "Reviews", active: true },
  { label: "Operations", active: false },
  { label: "Governance", active: false },
  { label: "Integrations", active: false },
  { label: "System", active: false },
] as const;

/* R5E.1C additions below. Same rules as above: one typed, read-only source,
   cross-checked against lib/workspace-v2/fixture-adapter.ts (case482) on
   2026-08-02, no invented identifier scheme, no value the frozen product
   does not itself carry. */

/* Full evidence detail for the two records supporting the primary finding
   (case482.evidence[0..1]). PRIMARY_FINDING.supportingEvidence above
   carries only the title/status pair the Finding panel needs; the Evidence
   state needs the fuller record. */
export const PRIMARY_EVIDENCE = [
  {
    recordKey: "ev_retry_path",
    title: "Retry path observed in redemption service",
    statement:
      "A retry wrapper is applied to partner code retrieval with three attempts and exponential backoff.",
    status: "confirmed",
    provenance: "Rule detected",
    source: "app/services/redemption_service.py:118",
    supports: "Retry behaviour may create duplicate redemption risk",
  },
  {
    recordKey: "ev_no_idempotency_key",
    title: "No idempotency key present on redemption write",
    statement:
      "The redemption write path does not pass an idempotency key to the partner client, so the provider cannot deduplicate repeated attempts.",
    status: "present",
    provenance: "Rule detected",
    source: "app/clients/partner_code_client.py:64",
    supports: "Retry behaviour may create duplicate redemption risk",
  },
] as const;

/* The review's derived missing-or-unverified-proof records, taken verbatim
   from case482.evidence (ev_coverage_gap, ev_error_shape_inferred), locked
   by docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §9 as the two
   records the missing-proof stage renders. Each carries the genuine
   requirement it affects, taken from the frozen fixture's requirement
   supportingEvidenceIds relationship — not an invented link to the primary
   finding's own requirement, which is a separate, still-open gap (see
   BLOCKING_REQUIREMENT.evidenceRequired below). */
export const MISSING_PROOF_RECORDS = [
  {
    recordKey: "ev_coverage_gap",
    title: "Provider failure cases absent from test suite",
    statement:
      "No test exercises timeout, 5xx, malformed or empty responses from the partner provider.",
    status: "missing",
    provenance: "Lintel missing coverage signal",
    source: "tests/test_redemption_service.py",
    relatedFindingTitle: "External provider failure states need fuller coverage",
    affectsRequirement: {
      recordKey: "req_test_provider_failure",
      title: "Provider failure states covered",
      state: "blocking · open",
    },
  },
  {
    recordKey: "ev_error_shape_inferred",
    title: "Client-facing error shape inferred, not verified",
    statement:
      "The error contract was inferred from handler structure and has not been confirmed against a consumer.",
    status: "unverified",
    provenance: "Model assisted",
    source: "app/api/redemptions.py:41",
    relatedFindingTitle: "API error contract may be unclear for clients",
    affectsRequirement: {
      recordKey: "req_api_error_contract",
      title: "Error contract defined for clients",
      state: "advisory · open",
    },
  },
] as const;

/* Prior load-test evidence, stale relative to the current head
   (case482.evidence[4], ev_prior_load_test). Supplies the evidence
   boundary's "1 stale" and the readiness state's staleness context. */
export const STALE_EVIDENCE = {
  recordKey: "ev_prior_load_test",
  title: "Prior load test result for redemption endpoint",
  statement:
    "A load test from the previous head recorded p99 latency within budget under retry pressure. It has not been re-run against the current head.",
  status: "stale",
  provenance: "CI artefact",
  source: "run 8841 · sha 3ba07e1",
  affectsRequirement: {
    recordKey: "req_latency_budget",
    title: "Latency budget held under retry",
    state: "advisory · stale",
  },
} as const;

/* The genuine blocking requirement tied to the primary finding
   (case482.requirements[0], req_test_idempotency). Its own
   supportingEvidenceIds is empty in the frozen fixture: no evidence yet
   proves idempotency under retry, which is itself why it remains open and
   blocking. This is the "Requirement" canonical value
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §5). */
export const BLOCKING_REQUIREMENT = {
  recordKey: "req_test_idempotency",
  title: "Idempotency proven under retry",
  statement:
    "Repeated redemption attempts for the same request must not issue duplicate discount codes.",
  importance: "blocking",
  status: "open",
  evidenceRequired:
    "A passing test that replays a retried redemption and asserts a single code issue.",
  contributingFindingKey: PRIMARY_FINDING.recordKey,
  contributingFindingTitle: PRIMARY_FINDING.title,
} as const;

/* The change's affected files, taken verbatim from case482.changedFiles.
   No deployment impact, customer impact or service dependency is claimed —
   only file path, change size and the product's own per-file risk level. */
export const AFFECTED_FILES = [
  { path: "app/services/redemption_service.py", additions: 74, deletions: 12, risk: "HIGH" },
  { path: "app/clients/partner_code_client.py", additions: 41, deletions: 8, risk: "MEDIUM" },
  { path: "app/api/redemptions.py", additions: 23, deletions: 5, risk: "MEDIUM" },
  { path: "tests/test_redemption_service.py", additions: 58, deletions: 0, risk: "LOW" },
] as const;

export const AFFECTED_CONTEXT_SUMMARY = {
  intro:
    "The change reaches the redemption write path, the partner discount-code client and the public redemption API, with new test coverage alongside them.",
  concerns: [
    "The redemption service carries the retry behaviour the primary finding observed.",
    "The partner code client carries the missing idempotency key and the untested provider-failure branch.",
    "The public API layer carries the inferred, unverified error contract.",
  ],
} as const;

/* Readiness summary, taken verbatim from case482.readiness in the frozen
   fixture. Recommendation, risk and requirement counts are never
   recalculated here — they are the same CANONICAL_REVIEW values rendered
   throughout every state; this record adds only the change-over-time
   context the frozen product itself carries. */
export const READINESS = {
  headline: "Merge readiness blocked",
  blockers: 2,
  missingOrUnverified: 2,
  stale: 1,
  classification: "improved",
  previousScore: 58,
  currentScore: 46,
  scoreChange: -12,
  clearedCount: 2,
  becameStaleCount: 1,
  note:
    "Two blocking requirements cleared since the previous head. One latency requirement became stale because the load test has not been re-run.",
  decisionContext: "Review decision context · Human Decision pending",
} as const;
