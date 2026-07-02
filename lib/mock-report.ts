export type Recommendation = "APPROVE" | "REVIEW_REQUIRED" | "TESTS_REQUIRED" | "BLOCK";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ReviewArea = {
  summary: string;
  status: "CLEAR" | "ATTENTION";
  points: string[];
};

export type OperationalReadiness = {
  status: "CLEAR" | "ATTENTION";
  summary: string;
  failureModes: string[];
  detectionSignals: string[];
  observabilityGaps: string[];
  recoveryOrRollback: string[];
  customerOrDataImpact: string[];
  ownerOrReviewerFocus: string[];
};

export type Report = {
  pr: {
    number: number;
    title: string;
    repository: string;
    project: string;
    branch: string;
    language: string;
    framework: string;
    author: string;
    updatedAt: string;
  };
  verdict: {
    recommendation: Recommendation;
    riskScore: number;
    riskLevel: RiskLevel;
    confidence: Confidence;
    summary: string;
  };
  changedFiles: Array<{
    path: string;
    additions?: number;
    deletions?: number;
    risk?: RiskLevel;
  }>;
  findings: Array<{
    severity: FindingSeverity;
    title: string;
    evidence: string;
    action: string;
    file?: string;
    category: "Security" | "Reliability" | "Maintainability" | "Missing tests" | "API contract";
  }>;
  reviews: {
    security: ReviewArea;
    reliability: ReviewArea;
    maintainability: ReviewArea;
  };
  operationalReadiness?: OperationalReadiness;
  missingTests: string[];
  suggestedTests: Array<{
    title: string;
    description?: string;
    priority?: "Required" | "Recommended";
  }>;
  reviewerChecklist: Array<{
    label: string;
    status: "COMPLETE" | "ATTENTION";
  }>;
  finalRecommendation: string;
  conditionsBeforeMerge: string[];
};

export const report: Report = {
  pr: {
    number: 482,
    title: "Add fallback handling for failed discount-code retrieval",
    repository: "Example B2B redemption API",
    project: "Example B2B redemption API",
    branch: "fix/discount-code-retrieval-fallback",
    language: "Python",
    framework: "FastAPI",
    author: "Maya Chen",
    updatedAt: "Today, 10:42",
  },
  verdict: {
    recommendation: "TESTS_REQUIRED",
    riskScore: 46,
    riskLevel: "MEDIUM",
    confidence: "MEDIUM",
    summary:
      "Retry behaviour may create duplicate redemption risk. Add idempotency and external provider failure tests before approving this PR.",
  },
  changedFiles: [
    { path: "app/services/redemption_service.py" },
    { path: "app/clients/partner_code_client.py" },
    { path: "app/api/redemptions.py" },
    { path: "tests/test_redemption_service.py" },
  ],
  findings: [
    {
      severity: "HIGH",
      title: "Retry behaviour may create duplicate redemption risk.",
      evidence:
        "The redemption flow retries after failed discount-code retrieval, but there is no confirmed idempotency guard around repeated redemption attempts.",
      action: "Add idempotency checks and tests proving retries cannot issue duplicate codes.",
      category: "Reliability",
    },
    {
      severity: "MEDIUM",
      title: "External provider failure states need fuller coverage.",
      evidence: "Timeout, 5xx, malformed response and empty response cases need explicit tests.",
      action: "Add provider failure tests for these cases.",
      category: "Missing tests",
    },
    {
      severity: "MEDIUM",
      title: "API error contract may be unclear for clients.",
      evidence: "Failed discount-code retrieval needs a stable client-facing error shape.",
      action: "Define retryable and non-retryable error responses and add tests.",
      category: "API contract",
    },
  ],
  reviews: {
    security: {
      status: "CLEAR",
      summary: "No direct auth or authorisation change is visible.",
      points: ["Ensure fallback errors and logs do not expose discount codes, partner credentials or sensitive identifiers."],
    },
    reliability: {
      status: "ATTENTION",
      summary: "The main concern is duplicate redemption during retry or timeout scenarios.",
      points: ["Provider failure handling should be tested across timeout, 5xx, malformed and empty-response paths."],
    },
    maintainability: {
      status: "ATTENTION",
      summary: "Fallback logic should remain explicit inside the redemption service.",
      points: ["Provider-specific error handling should be isolated from API response formatting."],
    },
  },
  operationalReadiness: {
    status: "ATTENTION",
    summary: "Provider failures and retries need explicit detection, recovery and impact review before merge.",
    failureModes: [
      "A provider timeout can trigger a second discount-code fetch and duplicate redemption side effects.",
      "Provider 5xx, malformed or empty responses can make redemption unavailable.",
    ],
    detectionSignals: [
      "Warning logs capture provider timeout context.",
      "The API exposes provider unavailability through a retryable 503 response.",
    ],
    observabilityGaps: [
      "No metric, alert or trace is visible for provider failures or repeated redemption attempts.",
    ],
    recoveryOrRollback: [
      "No confirmed idempotency, compensation or duplicate-code recovery path is visible.",
    ],
    customerOrDataImpact: [
      "Repeated attempts may issue duplicate discount codes or create duplicate redemption records.",
    ],
    ownerOrReviewerFocus: [
      "Reliability review should verify idempotency and provider failure handling.",
      "API review should confirm retryable error semantics.",
      "Security review should confirm identifiers and discount codes are redacted from logs.",
    ],
  },
  missingTests: [
    "Repeated retry after provider timeout does not issue duplicate discount codes",
    "Provider returns malformed response body",
    "Frontend-safe retryable error contract",
  ],
  suggestedTests: [
    { title: "test_provider_timeout_does_not_issue_duplicate_code" },
    { title: "test_provider_5xx_returns_retryable_error" },
    { title: "test_malformed_provider_response_returns_safe_error" },
    { title: "test_empty_provider_response_returns_safe_error" },
    { title: "test_retryable_error_contract_is_stable_for_clients" },
  ],
  reviewerChecklist: [
    { label: "Confirm idempotency exists around redemption attempts", status: "ATTENTION" },
    { label: "Check whether retry behaviour can issue duplicate codes", status: "ATTENTION" },
    { label: "Review API error shape for frontend and partner clients", status: "ATTENTION" },
    { label: "Verify provider failure tests cover timeout, 5xx, malformed and empty responses", status: "ATTENTION" },
    { label: "Check logs for useful failure context without sensitive data leakage", status: "ATTENTION" },
  ],
  finalRecommendation:
    "Do not approve this PR until duplicate redemption risk, provider failure states and frontend-safe error contracts are covered by tests.",
  conditionsBeforeMerge: [
    "Prove retries cannot issue duplicate discount codes",
    "Add timeout, 5xx, malformed response and empty response tests",
    "Define a frontend-safe API error contract",
    "Add structured logging for provider failure paths",
  ],
};
