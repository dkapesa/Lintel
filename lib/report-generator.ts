import type { FindingSeverity, Report, RiskLevel } from "./mock-report";

export const GENERATED_REPORT_STORAGE_KEY = "lintel.generatedReport.v1";

export type ReportInput = {
  title: string;
  repository: string;
  technology: string;
  diff: string;
};

type RiskSignal = {
  detected: boolean;
  terms: string[];
  paths: string[];
};

type Signals = {
  hasChangedBehavior: boolean;
  hasTests: boolean;
  testPaths: string[];
  hasRiskyPath: boolean;
  hasOtherSensitiveTerms: boolean;
  hasConfigTerms: boolean;
  duplicateSideEffect: RiskSignal;
  providerFailure: RiskSignal;
  apiContract: RiskSignal;
  sensitiveLogging: RiskSignal;
  changedLines: number;
};

type TermRule = {
  label: string;
  pattern: RegExp;
};

const TEST_PATH = /(^|\/)(tests?|__tests__)(\/|$)|\.(test|spec)\./i;
const RISKY_PATH = /(^|\/)(auth|security|payments?|billing|database|migrations?|config|permissions?|tokens?)(\/|\.|$)/i;

function unique(values: string[]) {
  return [...new Set(values)];
}

function matchTerms(text: string, rules: TermRule[]) {
  return rules.filter((rule) => rule.pattern.test(text)).map((rule) => rule.label);
}

function matchingPaths(paths: string[], pattern: RegExp) {
  return paths.filter((path) => pattern.test(path));
}

function parseChangedFiles(diff: string) {
  const gitPaths = [...diff.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map((match) => match[2].trim());
  const addedPaths = [...diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1].trim());

  return unique([...gitPaths, ...addedPaths].filter((path) => path !== "/dev/null"));
}

function addedDiffText(diff: string) {
  const addedLines = diff
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1));

  return (addedLines.length > 0 ? addedLines.join("\n") : diff).toLowerCase();
}

function loggingContextText(text: string) {
  const lines = text.split("\n");
  const contextLines: string[] = [];

  lines.forEach((line, index) => {
    if (/\blogger\b|\blogging\b|\blog\.(?:debug|info|warning|error|exception)\b|\bextra\s*[=:]/.test(line)) {
      contextLines.push(...lines.slice(Math.max(0, index - 1), index + 6));
    }
  });

  return unique(contextLines).join("\n");
}

function parseTechnology(value: string) {
  const [language, ...frameworkParts] = value.split(/\s*[/·,]\s*/).filter(Boolean);

  return {
    language: language || value,
    framework: frameworkParts.join(" / ") || "Not specified",
  };
}

function riskForPath(path: string): RiskLevel {
  if (RISKY_PATH.test(path)) return "HIGH";
  if (TEST_PATH.test(path)) return "LOW";
  return "MEDIUM";
}

function detectSignals(diff: string, paths: string[]): Signals {
  const text = addedDiffText(diff);
  const changedLines = diff.split("\n").filter((line) => (/^[+-]/.test(line) && !/^\+\+\+|^---/.test(line))).length;
  const testPaths = paths.filter((path) => TEST_PATH.test(path));
  const productionPaths = paths.filter((path) => !TEST_PATH.test(path));

  const redemptionTerms = matchTerms(text, [
    { label: "create_redemption", pattern: /\bcreate_redemption\b/ },
    { label: "redeem", pattern: /\bredeem(?:ed|ing|s)?\b/ },
    { label: "redemption", pattern: /\bredemptions?\b/ },
    { label: "discount code", pattern: /\bdiscount[_ -]?codes?\b/ },
  ]);
  const repeatTerms = matchTerms(text, [
    { label: "retry", pattern: /\bretr(?:y|ies|ied|ying)\b/ },
    { label: "timeout", pattern: /\btime[ _-]?outs?\b/ },
    { label: "fallback", pattern: /\bfallback\b/ },
    { label: "provider timeout", pattern: /\bprovider.{0,30}time[ _-]?out|time[ _-]?out.{0,30}provider\b/ },
    { label: "second fetch", pattern: /\bsecond fetch(?: call)?\b/ },
  ]);
  const fetchCallCount = [...text.matchAll(/\b(?:fetch|get_discount_code|retrieve_discount_code|fetch_discount_code)\s*\(/g)].length;
  if (fetchCallCount >= 2) repeatTerms.push("repeated fetch calls");
  const duplicatePaths = matchingPaths(productionPaths, /redempt|discount|code|provider|partner/i);
  const duplicateSideEffect: RiskSignal = {
    detected: redemptionTerms.length > 0 && repeatTerms.length > 0,
    terms: unique([...redemptionTerms, ...repeatTerms]),
    paths: duplicatePaths,
  };

  const providerTerms = matchTerms(text, [
    { label: "provider", pattern: /\bprovider\b/ },
    { label: "partner client", pattern: /\bpartner[_ ](?:code[_ ])?client\b/ },
    { label: "external client", pattern: /\bexternal[_ ]client\b/ },
    { label: "client call", pattern: /\bclient\s*\.|\bclient\.(?:get|post|fetch)\b/ },
  ]);
  const providerFailureTerms = matchTerms(text, [
    { label: "5xx response", pattern: /\b5xx\b|\b5\d\d\b/ },
    { label: "timeout", pattern: /\btime[ _-]?outs?\b/ },
    { label: "malformed response", pattern: /\bmalformed(?: response| body)?\b/ },
    { label: "empty response", pattern: /\bempty response\b|\bresponse\s+(?:is\s+)?none\b/ },
    { label: "fallback", pattern: /\bfallback\b/ },
    { label: "unavailable", pattern: /\bunavailable\b/ },
  ]);
  const providerPaths = matchingPaths(productionPaths, /provider|partner|client/i);
  const providerFailure: RiskSignal = {
    detected: (providerTerms.length > 0 || providerPaths.length > 0) && providerFailureTerms.length > 0,
    terms: unique([...providerTerms, ...providerFailureTerms]),
    paths: providerPaths,
  };

  const apiContractTerms = matchTerms(text, [
    { label: "JSONResponse", pattern: /\bjsonresponse\b/ },
    { label: "error code", pattern: /\berror[_ ]code\b/ },
    { label: "retryable", pattern: /\bretryable\b/ },
    { label: "status_code", pattern: /\bstatus[_ ]code\b/ },
    { label: "response shape", pattern: /\b(?:frontend|client)[ -]?(?:safe )?response(?: shape)?\b|\bresponse shape\b/ },
  ]);
  const apiPaths = matchingPaths(productionPaths, /(^|\/)(api|routes?|controllers?|endpoints?)(\/|\.|$)/i);
  const hasApiResponseHandling = /\bresponse\b|\berror\b|\bstatus\b/.test(text);
  const apiContract: RiskSignal = {
    detected: apiContractTerms.length > 0 || (apiPaths.length > 0 && hasApiResponseHandling),
    terms: unique([
      ...apiContractTerms,
      ...(apiPaths.length > 0 && hasApiResponseHandling ? ["API route response handling"] : []),
    ]),
    paths: apiPaths,
  };

  const loggingTerms = matchTerms(text, [
    { label: "logger", pattern: /\blogger\b|\blogging\b|\blog\.(?:debug|info|warning|error|exception)\b/ },
    { label: "structured log extra", pattern: /\bextra\s*[=:]/ },
  ]);
  const loggingContext = loggingContextText(text);
  const sensitiveLogTerms = matchTerms(loggingContext, [
    { label: "user_id", pattern: /\buser_id\b/ },
    { label: "partner_id", pattern: /\bpartner_id\b/ },
    { label: "customer_id", pattern: /\bcustomer_id\b/ },
    { label: "account_id", pattern: /\baccount_id\b/ },
    { label: "tenant_id", pattern: /\btenant_id\b/ },
    { label: "discount code", pattern: /\bdiscount[_ ]?code\b|["']code["']\s*:/ },
    { label: "token", pattern: /\btoken\b/ },
    { label: "credential", pattern: /\bcredentials?\b/ },
    { label: "secret", pattern: /\bsecret\b/ },
  ]);
  const loggingPaths = matchingPaths(productionPaths, /log|service|client|api/i);
  const sensitiveLogging: RiskSignal = {
    detected: loggingTerms.length > 0 && sensitiveLogTerms.length > 0,
    terms: unique([...loggingTerms, ...sensitiveLogTerms]),
    paths: loggingPaths,
  };

  return {
    hasChangedBehavior: diff.trim().length > 0,
    hasTests: testPaths.length > 0,
    testPaths,
    hasRiskyPath: productionPaths.some((path) => RISKY_PATH.test(path)),
    hasOtherSensitiveTerms: /\bauth(?:entication|orisation|orization)?\b|\bpermission\b|\bpayment\b|\bbilling\b|\bdatabase\b|\bmigration\b|\btransaction\b/.test(text),
    hasConfigTerms: /\bconfig(?:uration)?\b|\benvironment\b|\bfeature flag\b/.test(text),
    duplicateSideEffect,
    providerFailure,
    apiContract,
    sensitiveLogging,
    changedLines,
  };
}

function calculateRiskScore(signals: Signals) {
  let score = 22;

  if (!signals.hasTests) score += 14;
  if (signals.duplicateSideEffect.detected) score += 14;
  if (signals.providerFailure.detected) score += 10;
  if (signals.apiContract.detected) score += 8;
  if (signals.sensitiveLogging.detected) score += 10;
  if (signals.hasRiskyPath || signals.hasOtherSensitiveTerms) score += 8;
  if (signals.hasConfigTerms) score += 6;
  if (signals.changedLines > 200) score += 10;
  else if (signals.changedLines > 80) score += 5;

  return Math.min(score, 92);
}

function riskLevelForScore(score: number): RiskLevel {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 31) return "MEDIUM";
  return "LOW";
}

function formatList(values: string[]) {
  if (values.length === 1) return values[0];
  if (values.length === 2) return values.join(" and ");
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function describeEvidence(signal: RiskSignal) {
  const evidence: string[] = [];

  if (signal.terms.length > 0) evidence.push(`Matched ${formatList(signal.terms.map((term) => `“${term}”`))}`);
  if (signal.paths.length > 0) evidence.push(`Relevant files: ${signal.paths.join(", ")}`);

  return `${evidence.join(". ")}.`;
}

const LOG_IDENTIFIER_TERMS = ["user_id", "partner_id", "customer_id", "account_id", "tenant_id"];
const LOG_SECRET_TERMS = ["token", "credential", "secret"];

function loggingIdentifierTerms(signal: RiskSignal) {
  return signal.terms.filter((term) => LOG_IDENTIFIER_TERMS.includes(term));
}

function loggingSecretTerms(signal: RiskSignal) {
  return signal.terms.filter((term) => LOG_SECRET_TERMS.includes(term));
}

function sensitiveLoggingTitle(signal: RiskSignal) {
  if (loggingSecretTerms(signal).length > 0) return "Structured logs may expose sensitive authentication material.";
  if (signal.terms.includes("discount code")) return "Structured logs may expose discount codes.";
  return "Structured logs include user, partner or account identifiers.";
}

function sensitiveLoggingAction(signal: RiskSignal) {
  const actions: string[] = [];
  const secretTerms = loggingSecretTerms(signal);

  if (loggingIdentifierTerms(signal).length > 0) {
    actions.push("Review whether user, partner or account identifiers should be logged, hashed or redacted.");
  }
  if (signal.terms.includes("discount code")) {
    actions.push("Confirm discount codes are omitted or redacted before log emission.");
  }
  if (secretTerms.length > 0) {
    actions.push(`Remove or redact detected ${formatList(secretTerms)} values before log emission.`);
  }

  return actions.join(" ");
}

function sensitiveLoggingTestGaps(signal: RiskSignal) {
  return unique([
    ...(loggingIdentifierTerms(signal).length > 0
      ? ["Logging policy for user, partner and account identifiers"]
      : []),
    ...(signal.terms.includes("discount code") ? ["Failure logs omit or redact discount codes"] : []),
    ...(loggingSecretTerms(signal).length > 0
      ? [`Failure logs omit or redact detected ${formatList(loggingSecretTerms(signal))} values`]
      : []),
  ]);
}

function sensitiveLoggingConditions(signal: RiskSignal) {
  return unique([
    ...(loggingIdentifierTerms(signal).length > 0
      ? ["Confirm identifier logging is intentional, hashed or redacted"]
      : []),
    ...(signal.terms.includes("discount code") ? ["Confirm discount codes are not emitted in logs"] : []),
    ...(loggingSecretTerms(signal).length > 0
      ? [`Confirm detected ${formatList(loggingSecretTerms(signal))} values are not emitted in logs`]
      : []),
  ]);
}

function makeFinding(
  severity: FindingSeverity,
  title: string,
  evidence: string,
  action: string,
  category: Report["findings"][number]["category"],
): Report["findings"][number] {
  return { severity, title, evidence, action, category };
}

function specificMissingTests(signals: Signals) {
  return unique([
    "Happy-path coverage for the changed behaviour",
    "Failure-path coverage for invalid inputs and unexpected errors",
    ...(signals.duplicateSideEffect.detected
      ? ["Repeated retry after provider timeout does not issue duplicate redemptions or discount codes"]
      : []),
    ...(signals.providerFailure.detected
      ? ["Provider timeout, 5xx, malformed response, empty response and unavailable states"]
      : []),
    ...(signals.apiContract.detected
      ? ["Stable retryable and non-retryable client error responses"]
      : []),
    ...(signals.sensitiveLogging.detected
      ? sensitiveLoggingTestGaps(signals.sensitiveLogging)
      : []),
  ]);
}

function suggestedTests(signals: Signals) {
  return unique([
    "test_changed_behavior_happy_path",
    ...(!signals.hasTests ? ["test_changed_behavior_regression"] : []),
    ...(signals.duplicateSideEffect.detected
      ? [
          "test_retry_after_provider_timeout_does_not_create_duplicate_redemption",
          "test_repeated_discount_code_fetch_is_idempotent",
        ]
      : []),
    ...(signals.providerFailure.detected && signals.providerFailure.terms.includes("timeout")
      ? ["test_provider_timeout_returns_safe_retryable_error"]
      : []),
    ...(signals.providerFailure.detected && signals.providerFailure.terms.includes("5xx response")
      ? ["test_provider_5xx_returns_safe_retryable_error"]
      : []),
    ...(signals.providerFailure.detected && signals.providerFailure.terms.includes("malformed response")
      ? ["test_malformed_provider_response_returns_safe_error"]
      : []),
    ...(signals.providerFailure.detected && signals.providerFailure.terms.includes("empty response")
      ? ["test_empty_provider_response_returns_safe_error"]
      : []),
    ...(signals.providerFailure.detected && (signals.providerFailure.terms.includes("fallback") || signals.providerFailure.terms.includes("unavailable"))
      ? ["test_provider_unavailable_uses_safe_fallback"]
      : []),
    ...(signals.apiContract.detected
      ? ["test_retryable_error_contract_is_stable_for_clients", "test_api_route_maps_provider_failures_consistently"]
      : []),
    ...(signals.sensitiveLogging.detected
      ? ["test_provider_failure_logs_redact_sensitive_fields"]
      : []),
    ...(signals.hasConfigTerms ? ["test_invalid_configuration_fails_safely"] : []),
  ]);
}

export function generateReport(input: ReportInput): Report {
  const paths = parseChangedFiles(input.diff);
  const signals = detectSignals(input.diff, paths);
  const riskScore = calculateRiskScore(signals);
  const riskLevel = riskLevelForScore(riskScore);
  const technology = parseTechnology(input.technology);
  const findings: Report["findings"] = [];

  if (!signals.hasTests && signals.hasChangedBehavior) {
    const detectedRisks = unique([
      ...(signals.duplicateSideEffect.detected ? ["duplicate side effects"] : []),
      ...(signals.providerFailure.detected ? ["provider failures"] : []),
      ...(signals.apiContract.detected ? ["API error contracts"] : []),
      ...(signals.sensitiveLogging.detected ? ["sensitive logging"] : []),
    ]);

    findings.push(makeFinding(
      detectedRisks.length > 0 ? "HIGH" : "MEDIUM",
      detectedRisks.length > 0 ? "Risk-specific test coverage is missing." : "No changed test files were detected.",
      detectedRisks.length > 0
        ? `No recognisable test file was found for ${formatList(detectedRisks)}.`
        : "The pasted diff does not include a recognisable test path.",
      "Add focused tests for the changed behaviour and detected failure paths before merge.",
      "Missing tests",
    ));
  }

  if (signals.duplicateSideEffect.detected) {
    findings.push(makeFinding(
      "HIGH",
      "Retry behaviour may create duplicate redemptions or discount codes.",
      describeEvidence(signals.duplicateSideEffect),
      "Confirm an idempotency boundary exists around redemption and code issuance, then prove repeated attempts cannot duplicate the side effect.",
      "Reliability",
    ));
  }

  if (signals.providerFailure.detected) {
    findings.push(makeFinding(
      "MEDIUM",
      "External provider failure states need explicit handling.",
      describeEvidence(signals.providerFailure),
      "Verify timeout, 5xx, malformed, empty and unavailable provider responses fail safely and produce intentional retry behaviour.",
      "Reliability",
    ));
  }

  if (signals.apiContract.detected) {
    findings.push(makeFinding(
      "MEDIUM",
      "The client-facing API error contract may be unstable.",
      describeEvidence(signals.apiContract),
      "Define stable status codes, response fields and retryable semantics for frontend and partner clients.",
      "API contract",
    ));
  }

  if (signals.sensitiveLogging.detected) {
    findings.push(makeFinding(
      signals.sensitiveLogging.terms.some((term) => ["token", "credential", "secret"].includes(term)) ? "HIGH" : "MEDIUM",
      sensitiveLoggingTitle(signals.sensitiveLogging),
      describeEvidence(signals.sensitiveLogging),
      sensitiveLoggingAction(signals.sensitiveLogging),
      "Security",
    ));
  }

  if (signals.hasOtherSensitiveTerms || signals.hasRiskyPath) {
    const sensitivePaths = matchingPaths(paths.filter((path) => !TEST_PATH.test(path)), RISKY_PATH);
    findings.push(makeFinding(
      "MEDIUM",
      "A sensitive authentication, payment or data path needs review.",
      sensitivePaths.length > 0
        ? `Relevant files: ${sensitivePaths.join(", ")}.`
        : "The changed code references authentication, permissions, payments, transactions or database behaviour.",
      "Require focused review of access control, transaction safety and unintended data side effects.",
      "Maintainability",
    ));
  }

  if (signals.changedLines > 200) {
    findings.push(makeFinding(
      "MEDIUM",
      "The change is large for a single review pass.",
      `The pasted diff contains approximately ${signals.changedLines} changed lines.`,
      "Confirm the scope is cohesive and consider splitting unrelated changes.",
      "Maintainability",
    ));
  }

  const missingTests = !signals.hasTests && signals.hasChangedBehavior ? specificMissingTests(signals) : [];
  const suggestedTestTitles = suggestedTests(signals);
  const hasAttentionSignals = signals.duplicateSideEffect.detected
    || signals.providerFailure.detected
    || signals.apiContract.detected
    || signals.sensitiveLogging.detected
    || signals.hasOtherSensitiveTerms
    || signals.hasRiskyPath
    || signals.hasConfigTerms
    || signals.changedLines > 200;

  const reviewConditions = unique([
    ...(signals.duplicateSideEffect.detected
      ? ["Prove retries cannot create duplicate redemptions or issue duplicate discount codes"]
      : []),
    ...(signals.providerFailure.detected
      ? [`Verify provider handling for ${formatList(signals.providerFailure.terms.filter((term) => !["provider", "partner client", "external client", "client call"].includes(term)))}`]
      : []),
    ...(signals.apiContract.detected ? ["Confirm the frontend-safe API error contract remains stable"] : []),
    ...(signals.sensitiveLogging.detected ? sensitiveLoggingConditions(signals.sensitiveLogging) : []),
    ...(signals.hasOtherSensitiveTerms || signals.hasRiskyPath
      ? ["Complete focused review of the detected sensitive change area"]
      : []),
    ...(signals.hasConfigTerms ? ["Review configuration behaviour and safe defaults"] : []),
    ...(signals.changedLines > 200 ? ["Confirm the change scope is cohesive and reviewable"] : []),
  ]);

  const recommendation: Report["verdict"]["recommendation"] = missingTests.length > 0
    ? "TESTS_REQUIRED"
    : findings.length > 0 || hasAttentionSignals
      ? "REVIEW_REQUIRED"
      : "APPROVE";

  const conditions = recommendation === "APPROVE"
    ? []
    : unique([
        ...(recommendation === "TESTS_REQUIRED" ? ["Add the risk-specific tests listed in this report"] : []),
        ...reviewConditions,
      ]);

  const attentionCategories = unique([
    ...(signals.duplicateSideEffect.detected || signals.providerFailure.detected ? ["reliability"] : []),
    ...(signals.apiContract.detected ? ["API contract"] : []),
    ...(signals.sensitiveLogging.detected ? ["security"] : []),
    ...(signals.hasOtherSensitiveTerms || signals.hasRiskyPath || signals.hasConfigTerms || signals.changedLines > 200
      ? ["maintainability"]
      : []),
  ]);
  const reviewFocus = attentionCategories.length > 0
    ? `signals in ${formatList(attentionCategories)}`
    : "the remaining findings";

  return {
    pr: {
      number: 1,
      title: input.title.trim(),
      repository: input.repository.trim(),
      project: input.repository.trim(),
      branch: "pasted-diff",
      language: technology.language,
      framework: technology.framework,
      author: "Local prototype",
      updatedAt: "Just now",
    },
    verdict: {
      recommendation,
      riskScore,
      riskLevel,
      confidence: "MEDIUM",
      summary: `${paths.length || "No"} changed file${paths.length === 1 ? "" : "s"} detected. ${findings.length} review finding${findings.length === 1 ? "" : "s"} generated using Lintel's local prototype rules.`,
    },
    changedFiles: paths.map((path) => ({ path, risk: riskForPath(path) })),
    findings,
    reviews: {
      security: {
        status: signals.sensitiveLogging.detected || signals.hasOtherSensitiveTerms ? "ATTENTION" : "CLEAR",
        summary: signals.sensitiveLogging.detected
          ? "Logging statements and sensitive fields appear together in the changed code."
          : signals.hasOtherSensitiveTerms
            ? "Authentication, payment or data-sensitive behaviour needs human review."
            : "No direct security signal was detected by the prototype rules.",
        points: [signals.sensitiveLogging.detected
          ? sensitiveLoggingAction(signals.sensitiveLogging)
          : signals.hasOtherSensitiveTerms
            ? "Confirm access control and sensitive data handling remain intentional."
            : "Confirm the change does not expose sensitive data through logs, errors or responses."],
      },
      reliability: {
        status: signals.duplicateSideEffect.detected || signals.providerFailure.detected ? "ATTENTION" : "CLEAR",
        summary: signals.duplicateSideEffect.detected
          ? "Retry behaviour and a redemption side effect appear together in the diff."
          : signals.providerFailure.detected
            ? "External provider failure states need focused review."
            : "No explicit failure-handling, provider or duplicate-side-effect signal was detected.",
        points: [signals.duplicateSideEffect.detected || signals.providerFailure.detected
          ? "Verify failure paths are bounded, observable, idempotent and safe to repeat."
          : "Confirm the changed behaviour is covered by focused tests."],
      },
      maintainability: {
        status: signals.apiContract.detected || signals.hasConfigTerms || signals.changedLines > 200 ? "ATTENTION" : "CLEAR",
        summary: signals.apiContract.detected
          ? "Client-facing response construction needs focused review."
          : signals.changedLines > 200
            ? "The diff size increases review and maintenance risk."
            : signals.hasConfigTerms
              ? "Configuration behaviour and defaults need focused review."
              : "The change is within the prototype’s normal maintenance signals.",
        points: [signals.apiContract.detected
          ? "Confirm provider-specific logic remains isolated from API response formatting."
          : signals.hasConfigTerms || signals.changedLines > 200
            ? "Confirm the change scope remains cohesive and responsibilities stay clear."
            : "Confirm responsibilities remain clear and the implementation stays easy to review."],
      },
    },
    missingTests,
    suggestedTests: suggestedTestTitles.map((title) => ({ title })),
    reviewerChecklist: [
      { label: "Confirm the change matches the stated PR intent", status: "ATTENTION" },
      { label: "Verify changed behaviour has focused test coverage", status: signals.hasTests ? "COMPLETE" : "ATTENTION" },
      { label: "Review provider failures and duplicate side effects", status: signals.duplicateSideEffect.detected || signals.providerFailure.detected ? "ATTENTION" : "COMPLETE" },
      { label: "Review client-facing error contracts", status: signals.apiContract.detected ? "ATTENTION" : "COMPLETE" },
      { label: "Review sensitive logging fields", status: signals.sensitiveLogging.detected ? "ATTENTION" : "COMPLETE" },
    ],
    finalRecommendation: recommendation === "APPROVE"
      ? "No unresolved test, reliability, security or maintainability signals remain. Complete normal human review before approval."
      : recommendation === "REVIEW_REQUIRED"
        ? `Tests are present, but ${reviewFocus} require focused human review before merge.`
        : recommendation === "TESTS_REQUIRED"
          ? "Do not approve until the risk-specific tests cover the changed behaviour and detected failure paths."
          : "Do not merge until all blocking findings have been resolved.",
    conditionsBeforeMerge: conditions,
  };
}
