import type {
  ChangeRecord,
  DecisionOutcome,
  EvidenceRecord,
  FindingRecord,
  LabStateDefinition,
  MissingProofRecord,
  RelationshipEdge,
  RequirementRecord,
  ReviewFixture,
  ReviewGroup,
  RunRecord,
} from "./types";

export const FIXTURE_LABEL = "Controlled R4C fixture — planned R4 behaviour";
export const LAB_STORAGE_KEY = "lintel.r4c.lab.preferences";

export const CURRENT_HEAD = "8ac41de9f2b47a31c4d9be00f3a55d3281f6a102";
export const PREVIOUS_HEAD = "631fb20a6b76d115c9830f71ce738f2b32c81a14";
export const LONG_BRANCH =
  "feature/redemption-fallback-and-provider-timeout-observability-with-cross-region-retry-validation-and-deterministic-recovery";
export const LONG_PATH =
  "packages/redemption-service/src/modules/discounts/providers/remote/retrieval/fallback/observability/validation/provider-timeout-and-retry-contract-with-deterministic-recovery-and-auditable-proof-context.ts";

const GROUP_TOTALS: Record<ReviewGroup, number> = {
  "Needs attention": 12,
  "In review": 8,
  Ready: 17,
  Reviewed: 21,
};

const groupOrder: ReviewGroup[] = ["Needs attention", "In review", "Ready", "Reviewed"];
const repoNames = [
  "acme/checkout-edge",
  "acme/identity-broker",
  "acme/promotion-engine",
  "acme/order-events",
  "acme/mobile-contracts",
  "acme/reporting-pipeline",
  "acme/customer-api",
  "acme/warehouse-sync",
];

const reviewTitles = [
  "Preserve retry metadata when upstream requests time out",
  "Harden webhook signature verification for rotated keys",
  "Replace cache warming with bounded background refresh",
  "Record delivery failure provenance in the event envelope",
  "Validate locale fallback before rendering discount labels",
  "Separate retry exhaustion from provider unavailability",
  "Add response-shape guards for older account records",
  "Keep reconciliation cursors stable across partial batches",
];

function generatedReview(group: ReviewGroup, index: number, globalIndex: number): ReviewFixture {
  const riskBands = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
  const movements = ["regressed", "mixed", "unavailable", "unchanged", "improved"] as const;
  const riskBand = riskBands[globalIndex % riskBands.length];
  const ready = group === "Ready";
  const reviewed = group === "Reviewed";
  return {
    id: `review-${group.toLowerCase().replaceAll(" ", "-")}-${String(index + 1).padStart(2, "0")}`,
    repository:
      globalIndex === 9
        ? "acme/merchant-redemption-and-fulfilment-orchestration-platform-with-regional-provider-failover"
        : repoNames[globalIndex % repoNames.length],
    pr: 500 + globalIndex,
    title:
      globalIndex === 9
        ? "Keep provider recovery deterministic when a long-running redemption crosses retry, cache, region and reconciliation boundaries without losing the original failure provenance"
        : reviewTitles[globalIndex % reviewTitles.length],
    group,
    recommendation: ready || reviewed ? "APPROVE" : globalIndex % 3 === 0 ? "REVIEW REQUIRED" : "TESTS REQUIRED",
    riskScore: ready ? 12 + (globalIndex % 14) : reviewed ? 8 + (globalIndex % 30) : 36 + (globalIndex % 48),
    riskBand: ready ? "LOW" : riskBand,
    openRequirements: ready || reviewed ? 0 : 1 + (globalIndex % 5),
    blockingRequirements: ready || reviewed ? 0 : globalIndex % 4,
    movement: movements[globalIndex % movements.length],
    decision: reviewed
      ? (["APPROVE", "STALE", "WITHDRAWN", "SUPERSEDED", "UNBOUND"] as const)[globalIndex % 5]
      : ready && globalIndex % 2 === 0
        ? "APPROVE"
        : "PENDING",
    owner: group === "In review" && globalIndex % 2 === 0 ? "A. Rivera · local" : undefined,
    updated: `2026-07-${String(28 - (globalIndex % 18)).padStart(2, "0")} 10:${String(globalIndex % 60).padStart(2, "0")} UTC`,
    runId: `run_${500 + globalIndex}_0${(globalIndex % 4) + 1}`,
    head: globalIndex % 7 === 0 ? undefined : `${String(globalIndex).padStart(2, "0")}b41de9f2b47a31c4d9be00f3a55d3281f6a1`.slice(0, 40),
  };
}

export const CANONICAL_REVIEW: ReviewFixture = {
  id: "review-acme-redemption-api-482",
  repository: "acme/redemption-api",
  pr: 482,
  title: "Add fallback handling for failed discount-code retrieval",
  group: "Needs attention",
  recommendation: "TESTS REQUIRED",
  riskScore: 46,
  riskBand: "MEDIUM",
  openRequirements: 4,
  blockingRequirements: 4,
  movement: "regressed",
  decision: "PENDING",
  owner: undefined,
  updated: "2026-07-28 09:42 UTC",
  runId: "run_482_03",
  head: CURRENT_HEAD,
};

export const REVIEWS: ReviewFixture[] = (() => {
  const result: ReviewFixture[] = [];
  let globalIndex = 0;
  for (const group of groupOrder) {
    const count = GROUP_TOTALS[group];
    for (let index = 0; index < count; index += 1) {
      if (group === "Needs attention" && index === 0) result.push(CANONICAL_REVIEW);
      else result.push(generatedReview(group, index, globalIndex));
      globalIndex += 1;
    }
  }
  return result;
})();

const baseFindings: FindingRecord[] = [
  {
    id: "finding-fallback-retrieval",
    title: "Fallback masks discount retrieval failure",
    statement: "The new fallback returns an empty discount result after provider failure without proving the retry and failure-path contract.",
    severity: "HIGH",
    category: "Reliability",
    provenance: "Rule detected",
    blocking: true,
    relationshipIds: [
      "evidence-error-path-observed",
      "evidence-model-timeout",
      "proof-retry-integration",
      "requirement-fallback-proof",
      "file-retrieve-ts",
    ],
  },
  {
    id: "finding-cache-staleness",
    title: "Cached fallback may outlive provider recovery",
    statement: "The fallback cache has no directly observed expiry proof for the provider-recovery boundary.",
    severity: "MEDIUM",
    category: "State consistency",
    provenance: "Model assisted",
    blocking: false,
    relationshipIds: ["evidence-model-timeout", "surface-discount-cache"],
  },
  {
    id: "finding-error-classification",
    title: "Provider failures share one public error class",
    statement: "Timeout, authorization and malformed-response failures are flattened before the caller can distinguish recovery behaviour.",
    severity: "HIGH",
    category: "Error handling",
    provenance: "Rule detected",
    blocking: true,
    relationshipIds: ["evidence-error-path-observed", "requirement-error-taxonomy", "file-retrieve-ts"],
  },
  {
    id: "finding-metrics-gap",
    title: "Fallback activation lacks a bounded counter",
    statement: "The changed path does not expose a stable count for fallback activation by provider outcome.",
    severity: "HIGH",
    category: "Observability",
    provenance: "Rule detected",
    blocking: true,
    relationshipIds: ["proof-fallback-metric", "requirement-observability", "surface-provider-metrics"],
  },
];

export const FINDINGS: FindingRecord[] = [
  ...baseFindings,
  ...Array.from({ length: 20 }, (_, index): FindingRecord => ({
    id: `finding-${String(index + 5).padStart(2, "0")}`,
    title: [
      "Retry budget is inherited implicitly",
      "Builder declaration lacks runtime confirmation",
      "Cache key omits provider generation",
      "Recovery note is absent from the run manifest",
      "Timeout boundary is inferred from the client default",
    ][index % 5],
    statement: `Controlled finding ${index + 5} preserves a stable identity for progressive-rendering and keyboard validation.`,
    severity: index < 8 ? "MEDIUM" : "LOW",
    category: ["Reliability", "Verification", "State consistency", "Provenance"][index % 4],
    provenance: index % 3 === 0 ? "Model assisted" : index % 3 === 1 ? "Rule detected" : "Baseline preserved",
    blocking: false,
    relationshipIds: index === 0 ? ["unresolved-evidence-legacy"] : [],
  })),
];

const evidenceSeeds: EvidenceRecord[] = [
  {
    id: "evidence-error-path-observed",
    title: "Fallback return path observed in changed source",
    statement: "The catch path converts provider failure into an empty discount collection.",
    evidenceClass: "directly observed",
    status: "present",
    source: "src/discounts/retrieve.ts:88–104",
    runId: "run_482_03",
    head: CURRENT_HEAD,
    relationshipIds: ["finding-fallback-retrieval", "requirement-fallback-proof", "file-retrieve-ts"],
  },
  {
    id: "evidence-model-timeout",
    title: "Timeout behaviour inferred from client configuration",
    statement: "Model-assisted analysis infers that the provider client can exhaust retries before the fallback is returned.",
    evidenceClass: "model inferred",
    status: "unverified",
    source: "model:lintel-verifier-2026-07",
    runId: "run_482_03",
    head: CURRENT_HEAD,
    relationshipIds: ["finding-fallback-retrieval", "finding-cache-staleness"],
  },
  {
    id: "evidence-prior-test",
    title: "Prior-head integration suite passed",
    statement: "The previous run recorded a passing retry test, but that proof predates the current head.",
    evidenceClass: "externally verified",
    status: "stale",
    source: "ci/integration-discounts#1841",
    runId: "run_482_02",
    head: PREVIOUS_HEAD,
    relationshipIds: ["proof-retry-integration", "requirement-fallback-proof", "run_482_02"],
  },
];

const evidenceClasses: EvidenceRecord["evidenceClass"][] = [
  "externally verified",
  "directly observed",
  "human confirmed",
  "builder declared",
  "model inferred",
  "assumption",
  "unknown",
];
const evidenceStatuses: EvidenceRecord["status"][] = [
  "present",
  "missing",
  "unverified",
  "confirmed",
  "stale",
  "not applicable",
];

export const EVIDENCE: EvidenceRecord[] = [
  ...evidenceSeeds,
  ...Array.from({ length: 28 }, (_, index): EvidenceRecord => ({
    id: `evidence-${String(index + 4).padStart(2, "0")}`,
    title: [
      "Provider response contract",
      "Retry configuration declaration",
      "Cache invalidation observation",
      "Caller fallback expectation",
      "Telemetry event shape",
      "Historical result fragment",
      "Unknown verification record",
    ][index % 7],
    statement: `Controlled evidence record ${index + 4} exercises class, status, provenance and collection density.`,
    evidenceClass: evidenceClasses[index % evidenceClasses.length],
    status: evidenceStatuses[index % evidenceStatuses.length],
    source: index % 4 === 0 ? `ci/discount-contract#${1900 + index}` : `fixture/evidence/${index + 4}`,
    runId: index % 5 === 0 ? "run_482_02" : "run_482_03",
    head: index % 5 === 0 ? PREVIOUS_HEAD : CURRENT_HEAD,
    relationshipIds: index === 0 ? ["finding-error-classification", "missing-record-legacy"] : [],
  })),
];

export const MISSING_PROOF: MissingProofRecord[] = [
  {
    id: "proof-retry-integration",
    title: "Retry and failure-path integration test",
    sought: "A current-head integration result covering provider failure, retry exhaustion and the returned fallback.",
    why: "Without current proof, the new fallback can hide a provider regression while appearing successful to the caller.",
    state: "missing",
    importance: "blocking",
    nextAction: "Run the discount retrieval integration suite against the current head and attach the result.",
    relationshipIds: ["finding-fallback-retrieval", "requirement-fallback-proof", "file-retrieve-test-ts", "readiness-blocker-01"],
  },
  {
    id: "proof-fallback-metric",
    title: "Fallback activation counter proof",
    sought: "A directly observed counter or event for each provider failure category.",
    why: "The fallback path cannot be verified operationally without a bounded activation signal.",
    state: "missing",
    importance: "blocking",
    nextAction: "Capture a current-run event for timeout, authorization and malformed response outcomes.",
    relationshipIds: ["finding-metrics-gap", "requirement-observability", "surface-provider-metrics"],
  },
  {
    id: "proof-timeout-boundary",
    title: "Provider timeout boundary",
    sought: "A result proving the client timeout and retry budget at the fallback boundary.",
    why: "The current model inference is not direct proof of runtime behaviour.",
    state: "unverified",
    importance: "advisory",
    nextAction: "Record the configured timeout and one controlled retry-exhaustion trace.",
    relationshipIds: ["finding-cache-staleness", "surface-provider-timeout"],
  },
  {
    id: "proof-cache-expiry",
    title: "Current cache-expiry observation",
    sought: "Current-head evidence that the fallback cache expires after provider recovery.",
    why: "The previous observation predates the changed cache key.",
    state: "stale",
    importance: "advisory",
    nextAction: "Observe one recovery cycle against the current head.",
    relationshipIds: ["finding-cache-staleness", "surface-discount-cache"],
  },
  {
    id: "proof-error-taxonomy",
    title: "Public error taxonomy verification",
    sought: "A consumer-level assertion for the public failure categories.",
    why: "Callers otherwise cannot select the correct recovery behaviour.",
    state: "stale",
    importance: "blocking",
    nextAction: "Update the contract test and record its current-head result.",
    relationshipIds: ["finding-error-classification", "requirement-error-taxonomy"],
  },
  {
    id: "proof-doc-example",
    title: "Fallback documentation example",
    sought: "A reviewed example showing caller behaviour when fallback activates.",
    why: "The change affects operator interpretation but does not block verification.",
    state: "unverified",
    importance: "advisory",
    nextAction: "Add the example to the redemption integration guide.",
    relationshipIds: [],
  },
];

export const REQUIREMENTS: RequirementRecord[] = [
  {
    id: "requirement-fallback-proof",
    title: "Prove the fallback failure path",
    statement: "Attach current-head integration evidence covering provider failure, retry exhaustion and fallback return.",
    status: "open",
    importance: "blocking",
    requiredProof: "Passing current-head integration result with the provider failure asserted.",
    capability: "condition",
    conditionKey: "condition-fallback-proof",
    taskStatus: "In progress",
    relationshipIds: ["proof-retry-integration", "evidence-error-path-observed", "finding-fallback-retrieval", "file-retrieve-test-ts"],
    activeByDefault: true,
  },
  {
    id: "requirement-observability",
    title: "Record fallback activation by provider outcome",
    statement: "Expose directly observed activation evidence for each failure category.",
    status: "open",
    importance: "blocking",
    requiredProof: "Current-run telemetry showing bounded fallback activation.",
    capability: "condition",
    conditionKey: "condition-fallback-observability",
    taskStatus: "Open",
    relationshipIds: ["proof-fallback-metric", "finding-metrics-gap", "surface-provider-metrics"],
    activeByDefault: true,
  },
  {
    id: "requirement-error-taxonomy",
    title: "Preserve actionable provider failure categories",
    statement: "Keep timeout, authorization and malformed-response outcomes distinguishable to callers.",
    status: "open",
    importance: "blocking",
    requiredProof: "Consumer contract evidence for each public error category.",
    capability: "derived",
    taskStatus: "Done",
    relationshipIds: ["finding-error-classification", "proof-error-taxonomy", "file-retrieve-ts"],
    activeByDefault: true,
  },
  {
    id: "requirement-current-head",
    title: "Bind verification proof to the current head",
    statement: "Replace prior-head proof with evidence applicable to run_482_03 and the current commit.",
    status: "open",
    importance: "blocking",
    requiredProof: "Evidence carrying current run and head identity.",
    capability: "derived",
    taskStatus: "Not needed",
    relationshipIds: ["evidence-prior-test", "run_482_03"],
    activeByDefault: true,
  },
  {
    id: "requirement-timeout-test",
    title: "Re-run timeout-boundary verification",
    statement: "The timeout requirement reopened after the client configuration changed.",
    status: "reopened",
    importance: "blocking",
    requiredProof: "A current configured timeout and retry-exhaustion trace.",
    capability: "derived",
    taskStatus: "Open",
    relationshipIds: ["proof-timeout-boundary", "evidence-model-timeout", "finding-fallback-retrieval", "file-retrieve-test-ts"],
    activeByDefault: false,
  },
  {
    id: "requirement-cache-review",
    title: "Review fallback cache recovery",
    statement: "Inspect cache expiry after provider recovery.",
    status: "open",
    importance: "advisory",
    requiredProof: "One current recovery observation.",
    capability: "derived",
    taskStatus: "In progress",
    relationshipIds: ["finding-cache-staleness", "surface-discount-cache"],
    activeByDefault: false,
  },
  ...(["cleared-contract", "stale-observer", "unavailable-source", "advisory-docs", "cleared-cache"] as const).map(
    (suffix, index): RequirementRecord => ({
      id: `requirement-${suffix}`,
      title: [
        "Retain response-shape compatibility",
        "Refresh the operator recovery note",
        "Establish the legacy provider source",
        "Document caller fallback semantics",
        "Confirm cache-key stability",
      ][index],
      statement: `Controlled ${suffix.replaceAll("-", " ")} requirement identity for the complete catalogue.`,
      status: (["cleared", "stale", "unavailable", "open", "cleared"] as const)[index],
      importance: index === 1 || index === 2 ? "blocking" : "advisory",
      requiredProof: "Exact supporting proof remains described without creating a writable condition.",
      capability: "derived",
      taskStatus: (["Done", "Open", "Open", "Not needed", "Done"] as const)[index],
      relationshipIds: [],
      activeByDefault: false,
    }),
  ),
];

const canonicalChanges: ChangeRecord[] = [
  {
    id: "file-retrieve-ts",
    kind: "file",
    path: "src/discounts/retrieve.ts",
    additions: 38,
    deletions: 12,
    risk: "HIGH",
    contextAvailable: true,
    relationshipIds: ["finding-fallback-retrieval", "evidence-error-path-observed", "requirement-fallback-proof"],
  },
  {
    id: "file-retrieve-test-ts",
    kind: "file",
    path: "tests/discounts/retrieve.integration.test.ts",
    risk: "MEDIUM",
    contextAvailable: false,
    relationshipIds: ["proof-retry-integration", "requirement-fallback-proof"],
  },
];

export const CHANGES: ChangeRecord[] = [
  ...canonicalChanges,
  ...Array.from({ length: 12 }, (_, index): ChangeRecord => ({
    id: `file-change-${String(index + 3).padStart(2, "0")}`,
    kind: "file",
    path: index === 11 ? LONG_PATH : `src/discounts/${["client", "cache", "errors", "metrics"][index % 4]}/${index + 3}.ts`,
    additions: index % 4 === 0 ? undefined : 4 + index * 2,
    deletions: index % 4 === 0 ? undefined : index + 1,
    risk: index % 3 === 0 ? undefined : index % 3 === 1 ? "MEDIUM" : "LOW",
    contextAvailable: index % 3 !== 0,
    relationshipIds: [],
  })),
  {
    id: "surface-discount-cache",
    kind: "surface",
    path: "Runtime surface · discount fallback cache",
    risk: "MEDIUM",
    contextAvailable: true,
    relationshipIds: ["finding-cache-staleness", "proof-cache-expiry"],
  },
  {
    id: "surface-provider-timeout",
    kind: "surface",
    path: "Configuration surface · provider timeout boundary",
    contextAvailable: false,
    relationshipIds: ["proof-timeout-boundary"],
  },
  {
    id: "surface-provider-metrics",
    kind: "surface",
    path: "Operational surface · provider outcome telemetry",
    risk: "HIGH",
    contextAvailable: false,
    relationshipIds: ["finding-metrics-gap", "proof-fallback-metric", "requirement-observability"],
  },
];

export const RUNS: RunRecord[] = Array.from({ length: 12 }, (_, index): RunRecord => {
  const number = 3 - index;
  const current = index === 0;
  const previous = index === 1;
  return {
    id: current ? "run_482_03" : previous ? "run_482_02" : `run_482_${number >= 0 ? String(number).padStart(2, "0") : `h${Math.abs(number)}`}`,
    head: current ? CURRENT_HEAD : previous ? PREVIOUS_HEAD : index === 5 ? undefined : `${String(90 - index)}1fb20a6b76d115c9830f71ce738f2b32c81a1`.slice(0, 40),
    base: "16bba52dd9ba2ea60c10f320b4ec7ab132e5f132",
    source: current ? "model-assisted" : previous ? "deterministic" : index === 5 ? "historical-schema" : index === 8 ? "fallback" : "deterministic",
    recordedAt: `2026-07-${String(28 - index).padStart(2, "0")} ${String(9 + (index % 8)).padStart(2, "0")}:42 UTC`,
    reproducibility: current ? "traceable" : previous ? "exact" : index === 5 ? "historical" : index === 8 ? "unavailable" : "exact",
    resultFingerprint: `sha256:${String(index + 1).repeat(8)}a4f12ce8d0b42b59`,
    configurationFingerprint: current ? "sha256:model-7d09cc2e" : "sha256:deterministic-291c46ad",
    limitation: current
      ? "Model-assisted and traceable; exact model replay is not promised."
      : previous
        ? "Deterministic projection with exact fixture inputs."
        : index === 5
          ? "Historical schema omits complete configuration identity."
          : "Controlled historical run.",
  };
});

export const DECISION_HISTORY = Array.from({ length: 80 }, (_, index) => ({
  id: `decision-event-${String(index + 1).padStart(3, "0")}`,
  outcome: (["approve", "tests-required", "review-required", "request-changes", "blocked", "defer"] as const)[index % 6],
  head: index === 79 ? PREVIOUS_HEAD : RUNS[(index + 2) % RUNS.length].head,
  recordedAt: `2026-${String(1 + Math.floor(index / 12)).padStart(2, "0")}-${String(1 + (index % 27)).padStart(2, "0")} 12:00 UTC`,
}));

export const RELATIONSHIPS: RelationshipEdge[] = [
  ...FINDINGS.flatMap((record) => record.relationshipIds.map((to) => ({ from: record.id, to, state: "Direct" as const }))),
  ...EVIDENCE.slice(0, 3).flatMap((record) => record.relationshipIds.map((to) => ({ from: record.id, to, state: "Direct" as const }))),
  ...MISSING_PROOF.flatMap((record) => record.relationshipIds.map((to) => ({ from: record.id, to, state: "Direct" as const }))),
  ...REQUIREMENTS.flatMap((record) => record.relationshipIds.map((to) => ({ from: record.id, to, state: "Direct" as const }))),
  ...CHANGES.filter((record) => ["file-retrieve-ts", "file-retrieve-test-ts"].includes(record.id)).flatMap((record) =>
    record.relationshipIds.map((to) => ({ from: record.id, to, state: "Direct" as const })),
  ),
  { from: "finding-05", to: "unresolved-evidence-legacy", state: "Unresolved", reason: "Stored legacy evidence ID does not resolve in the current fixture version." },
  { from: "evidence-04", to: "missing-record-legacy", state: "Unresolved", reason: "One of two stored relationship IDs is not available in this projection." },
  { from: "proof-doc-example", to: "documentation-owner", state: "Unavailable", reason: "No accountable documentation owner is recorded." },
  { from: "requirement-advisory-docs", to: "none", state: "None recorded", reason: "The source explicitly records no supporting evidence relationship." },
];

export const OUTCOME_LABELS: Record<DecisionOutcome, string> = {
  approve: "Approve",
  "approve-with-accepted-risk": "Approve with accepted risk",
  "tests-required": "Tests required",
  "review-required": "Review required",
  "request-changes": "Request changes",
  blocked: "Blocked",
  defer: "Defer decision",
};

export const OUTCOME_HELP: Record<DecisionOutcome, string> = {
  approve: "Engineer judges the change ready without accepting named residual risk.",
  "approve-with-accepted-risk": "Engineer approves while explicitly accepting named residual risk.",
  "tests-required": "Engineer requires specified test proof before readiness.",
  "review-required": "Engineer requires another specialist or accountable review.",
  "request-changes": "Engineer requires code or configuration changes.",
  blocked: "Engineer records that progress cannot continue under current conditions.",
  defer: "Engineer intentionally makes no current merge decision.",
};

const state = (definition: LabStateDefinition) => definition;

export const LAB_STATES: LabStateDefinition[] = [
  state({ slug: "overview", label: "Wide default Overview", category: "Atlas", mode: "overview" }),
  state({ slug: "queue-groups", label: "Queue with multiple groups", category: "Atlas", mode: "overview", focusedControl: "queue-unselected" }),
  state({ slug: "queue-collapsed", label: "Queue compact / collapsed", category: "Atlas", layout: "queue-collapsed" }),
  state({ slug: "finding-selected", label: "Finding selected", category: "Atlas", mode: "evidence", selected: { kind: "finding", id: "finding-fallback-retrieval" } }),
  state({ slug: "evidence-selected", label: "Evidence selected", category: "Atlas", mode: "evidence", selected: { kind: "evidence", id: "evidence-error-path-observed" } }),
  state({ slug: "missing-proof-selected", label: "Missing proof selected", category: "Atlas", mode: "evidence", selected: { kind: "proof", id: "proof-retry-integration" } }),
  state({ slug: "requirement-selected", label: "Writable requirement selected", category: "Atlas", mode: "requirements", selected: { kind: "requirement", id: "requirement-fallback-proof" } }),
  state({ slug: "file-selected", label: "Affected file selected", category: "Atlas", mode: "change", selected: { kind: "change", id: "file-retrieve-test-ts" } }),
  state({ slug: "history", label: "History mode", category: "Atlas", mode: "history", variant: "stale-decision" }),
  state({ slug: "run-selected", label: "Run selected", category: "Atlas", mode: "history", selected: { kind: "run", id: "run_482_02" } }),
  state({ slug: "readiness-diff", label: "Readiness Delta and Review Diff", category: "Atlas", mode: "history", selected: { kind: "diff", id: "diff-requirement-fallback-proof" } }),
  state({ slug: "decision-readiness", label: "Decision readiness", category: "Atlas", selected: { kind: "readiness", id: "readiness-blocker-01" }, variant: "stale-decision" }),
  state({ slug: "decision-modal", label: "Human Decision · standard height", category: "Atlas", modal: true, transaction: "pristine" }),
  state({ slug: "decision-modal-short", label: "Human Decision · short height", category: "Atlas", modal: true, transaction: "enabled", outcome: "approve-with-accepted-risk" }),
  state({ slug: "inspector-collapsed", label: "Inspector collapsed", category: "Atlas", mode: "evidence", selected: { kind: "finding", id: "finding-fallback-retrieval" }, layout: "inspector-collapsed", inspectorOpen: false }),
  state({ slug: "focus-mode", label: "Focus mode", category: "Atlas", mode: "evidence", selected: { kind: "finding", id: "finding-fallback-retrieval" }, layout: "focus" }),
  state({ slug: "loading", label: "Loading state", category: "Atlas", variant: "partial" }),
  state({ slug: "unavailable-review", label: "Unavailable requested review", category: "Atlas", variant: "unavailable" }),
  state({ slug: "narrow", label: "Narrow laptop", category: "Atlas", mode: "evidence", selected: { kind: "finding", id: "finding-fallback-retrieval" }, layout: "narrow", inspectorOpen: false }),
  state({ slug: "tablet", label: "Tablet selected review", category: "Atlas", layout: "tablet" }),
  state({ slug: "mobile-review-list", label: "Mobile review list", category: "Atlas", layout: "mobile-list" }),
  state({ slug: "mobile-selected-review", label: "Mobile selected review", category: "Atlas", layout: "mobile-review" }),
  state({ slug: "mobile-selected-record", label: "Mobile selected record", category: "Atlas", mode: "evidence", selected: { kind: "finding", id: "finding-fallback-retrieval" }, layout: "mobile-record" }),
  state({ slug: "mobile-decision", label: "Mobile Human Decision", category: "Atlas", layout: "mobile-decision", modal: true, transaction: "pristine" }),

  state({ slug: "normal-laptop", label: "Normal laptop", category: "Supplementary" }),
  state({ slug: "inspector-no-selection", label: "No explicit Inspector selection", category: "Supplementary" }),
  state({ slug: "queue-selected-group-collapsed", label: "Selected Queue group collapsed", category: "Supplementary", queueGroupCollapsed: true }),
  state({ slug: "both-panels-collapsed", label: "Both supporting regions collapsed", category: "Supplementary", layout: "both-collapsed" }),
  state({ slug: "partial-projection", label: "Partial projection", category: "Supplementary", variant: "partial" }),
  state({ slug: "empty-workspace", label: "Empty Workspace", category: "Supplementary", variant: "empty" }),
  state({ slug: "initial-run", label: "Initial run", category: "Supplementary", mode: "history", variant: "initial" }),
  state({ slug: "invalid-history", label: "Invalid history", category: "Supplementary", mode: "history", variant: "invalid-history" }),
  state({ slug: "stale-decision", label: "Stale Human Decision", category: "Supplementary", variant: "stale-decision" }),
  state({ slug: "unbound-decision", label: "Unbound Human Decision", category: "Supplementary", variant: "unbound-decision" }),
  state({ slug: "selected-outside-filters", label: "Selected review outside filters", category: "Supplementary", filtersSelectedOut: true }),
  state({ slug: "selected-object-removed", label: "Selected object removed", category: "Supplementary", mode: "evidence" }),
  state({ slug: "unresolved-relationship", label: "Unresolved relationship", category: "Supplementary", mode: "evidence", selected: { kind: "finding", id: "finding-05" } }),
  state({ slug: "slow-detail", label: "Slow detail loading", category: "Supplementary", mode: "change", selected: { kind: "change", id: "file-retrieve-ts" } }),

  state({ slug: "condition-write-failure", label: "Condition write failure", category: "Capability", mode: "requirements", selected: { kind: "requirement", id: "requirement-fallback-proof" } }),
  state({ slug: "condition-refresh-failure", label: "Condition saved, refresh failed", category: "Capability", mode: "requirements", selected: { kind: "requirement", id: "requirement-observability" } }),
  state({ slug: "derived-requirement", label: "Read-only derived requirement", category: "Capability", mode: "requirements", selected: { kind: "requirement", id: "requirement-error-taxonomy" } }),
  state({ slug: "requirement-reopened", label: "Reopened requirement variant", category: "Capability", mode: "requirements", variant: "reopened-requirement", selected: { kind: "requirement", id: "requirement-timeout-test" } }),
  state({ slug: "requirement-advisory", label: "Advisory requirement variant", category: "Capability", mode: "requirements", variant: "advisory-requirement", selected: { kind: "requirement", id: "requirement-cache-review" } }),
  state({ slug: "requirement-cleared", label: "Cleared requirement variant", category: "Capability", mode: "requirements", variant: "cleared-requirement", selected: { kind: "requirement", id: "requirement-cleared-contract" } }),
  state({ slug: "requirement-stale", label: "Stale requirement variant", category: "Capability", mode: "requirements", variant: "stale-requirement", selected: { kind: "requirement", id: "requirement-stale-observer" } }),
  state({ slug: "requirement-unavailable", label: "Unavailable requirement variant", category: "Capability", mode: "requirements", variant: "unavailable-requirement", selected: { kind: "requirement", id: "requirement-unavailable-source" } }),
  state({ slug: "github-connected", label: "GitHub App connected", category: "Capability", variant: "github-connected", selected: { kind: "readiness", id: "readiness-blocker-01" } }),
  state({ slug: "github-unavailable", label: "GitHub App unavailable", category: "Capability", variant: "github-unavailable", selected: { kind: "readiness", id: "readiness-blocker-01" } }),

  ...(
    [
      "approve",
      "approve-with-accepted-risk",
      "tests-required",
      "review-required",
      "request-changes",
      "blocked",
      "defer",
    ] as DecisionOutcome[]
  ).map((outcome) =>
    state({
      slug: `decision-outcome-${outcome}`,
      label: `Outcome · ${OUTCOME_LABELS[outcome]}`,
      category: "Decision",
      modal: true,
      outcome,
      transaction: "empty-rationale",
    }),
  ),
  state({ slug: "decision-valid-rationale", label: "Decision valid rationale", category: "Decision", modal: true, outcome: "tests-required", transaction: "valid" }),
  state({ slug: "decision-references", label: "Decision references selected", category: "Decision", modal: true, outcome: "tests-required", transaction: "valid" }),
  state({ slug: "decision-accepted-risk-no-reference", label: "Accepted risk · no reference", category: "Decision", modal: true, outcome: "approve-with-accepted-risk", transaction: "accepted-risk-no-reference" }),
  state({ slug: "decision-accepted-risk-unchecked", label: "Accepted risk · acknowledgement unchecked", category: "Decision", modal: true, outcome: "approve-with-accepted-risk", transaction: "accepted-risk-unacknowledged" }),
  state({ slug: "decision-blocker-acknowledgement", label: "Open blocker acknowledgement", category: "Decision", modal: true, outcome: "approve", transaction: "blocker-acknowledgement" }),
  state({ slug: "decision-missing-head", label: "Missing head acknowledgement", category: "Decision", modal: true, outcome: "approve", transaction: "missing-head-acknowledgement", variant: "unbound-decision" }),
  state({ slug: "decision-confirm-enabled", label: "Decision Confirm enabled", category: "Decision", modal: true, outcome: "approve-with-accepted-risk", transaction: "enabled" }),
  state({ slug: "decision-discard-warning", label: "Dirty discard warning", category: "Decision", modal: true, outcome: "tests-required", transaction: "discard-warning" }),
  state({ slug: "decision-saving", label: "Decision saving", category: "Decision", modal: true, outcome: "tests-required", transaction: "saving" }),
  state({ slug: "decision-validation", label: "Decision validation error", category: "Decision", modal: true, outcome: "tests-required", transaction: "validation-error" }),
  state({ slug: "decision-head-conflict", label: "Decision stale-head conflict", category: "Decision", modal: true, outcome: "tests-required", transaction: "head-conflict" }),
  state({ slug: "decision-conflict", label: "Decision effective-record conflict", category: "Decision", modal: true, outcome: "request-changes", transaction: "decision-conflict" }),
  state({ slug: "decision-write-failure", label: "Decision storage failure", category: "Decision", modal: true, outcome: "tests-required", transaction: "storage-failure" }),
  state({ slug: "decision-readback-mismatch", label: "Decision read-back mismatch", category: "Decision", modal: true, outcome: "tests-required", transaction: "readback-mismatch" }),
  state({ slug: "decision-duplicate", label: "Decision duplicate no-op", category: "Decision", modal: true, outcome: "tests-required", transaction: "duplicate" }),
  state({ slug: "decision-success", label: "Decision verified success", category: "Decision", transaction: "success" }),
  state({ slug: "decision-reaffirm", label: "Stale decision reaffirmation", category: "Decision", variant: "stale-decision", selected: { kind: "readiness", id: "readiness-blocker-01" } }),
  state({ slug: "decision-supersede", label: "Decision supersession", category: "Decision", variant: "stale-decision", selected: { kind: "readiness", id: "readiness-blocker-01" } }),
  state({ slug: "decision-withdrawal", label: "Decision withdrawal", category: "Decision", variant: "stale-decision", selected: { kind: "readiness", id: "readiness-blocker-01" } }),

  state({ slug: "stress", label: "Complete stress catalogue", category: "Stress", variant: "stress", mode: "evidence" }),
  state({ slug: "reduced-motion", label: "Reduced-motion validation", category: "Stress", variant: "stress" }),
];

export function labState(slug: string | null | undefined): LabStateDefinition {
  return LAB_STATES.find((item) => item.slug === slug) ?? LAB_STATES[0];
}

export function recordLabel(id: string): string {
  return (
    FINDINGS.find((item) => item.id === id)?.title ??
    EVIDENCE.find((item) => item.id === id)?.title ??
    MISSING_PROOF.find((item) => item.id === id)?.title ??
    REQUIREMENTS.find((item) => item.id === id)?.title ??
    CHANGES.find((item) => item.id === id)?.path ??
    RUNS.find((item) => item.id === id)?.id ??
    (id === "readiness-blocker-01" ? "Decision readiness" : id)
  );
}
