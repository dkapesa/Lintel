import type { FindingSeverity, Report, RiskLevel } from "./mock-report";
import { assessReportQuality, pruneUnsupportedReviewerFocus } from "./report-quality";
import type { ReviewProfile } from "./review-profiles";

export const GENERATED_REPORT_STORAGE_KEY = "lintel.generatedReport.v1";

export type ReportInputSource = "pasted-diff" | "github-pr" | "sample";

export type ReportInput = {
  title: string;
  repository: string;
  technology: string;
  diff: string;
  inputSource?: ReportInputSource;
  reviewProfile?: ReviewProfile;
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
  hasDataMigrationTerms: boolean;
  hasPaymentDomainTerms: boolean;
  hasProviderReviewTerms: boolean;
  hasApiReviewTerms: boolean;
  hasSensitiveReviewTerms: boolean;
  hasFrontendTerms: boolean;
  hasDocsTerms: boolean;
  duplicateSideEffect: RiskSignal;
  providerFailure: RiskSignal;
  apiContract: RiskSignal;
  sensitiveLogging: RiskSignal;
  detectionControls: RiskSignal;
  recoveryControls: RiskSignal;
  impactSignals: RiskSignal;
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

  const detectionControls: RiskSignal = {
    detected: false,
    terms: matchTerms(text, [
      { label: "logging", pattern: /\blogger\b|\blogging\b|\blog\.(?:debug|info|warning|error|exception)\b/ },
      { label: "structured events", pattern: /\bstructured (?:log|event)s?\b|\bextra\s*[=:]/ },
      { label: "metrics", pattern: /\bmetrics?\b|\bcounter\b|\bhistogram\b|\bgauge\b/ },
      { label: "alerts", pattern: /\balerts?|paging|pagerduty\b/ },
      { label: "tracing", pattern: /\btraces?|tracing|spans?\b/ },
      { label: "monitoring", pattern: /\bmonitor(?:ing|ed)?\b/ },
      { label: "health checks", pattern: /\bhealth[ _-]?checks?\b|\breadiness\b|\bliveness\b/ },
      { label: "status or error codes", pattern: /\bstatus[_ ]code\b|\berror[_ ]code\b/ },
    ]),
    paths: matchingPaths(productionPaths, /observ|monitor|metric|health|telemetry|tracing|logging/i),
  };
  detectionControls.detected = detectionControls.terms.length > 0;

  const recoveryControls: RiskSignal = {
    detected: false,
    terms: matchTerms(text, [
      { label: "idempotency", pattern: /\bidempoten(?:t|cy)\b/ },
      { label: "rollback", pattern: /\broll[ _-]?back\b|\brevert\b/ },
      { label: "feature flag", pattern: /\bfeature[ _-]?flags?\b/ },
      { label: "kill switch", pattern: /\bkill[ _-]?switch\b/ },
      { label: "restore", pattern: /\brestore\b|\brecovery\b/ },
      { label: "compensation", pattern: /\bcompensat(?:e|ed|ing|ion|ory)\b/ },
      { label: "circuit breaker", pattern: /\bcircuit[ _-]?breaker\b/ },
      { label: "backoff", pattern: /\bback[ _-]?off\b/ },
    ]),
    paths: matchingPaths(productionPaths, /rollback|recovery|restore|feature|migration/i),
  };
  recoveryControls.detected = recoveryControls.terms.length > 0;

  const impactSignals: RiskSignal = {
    detected: false,
    terms: matchTerms(text, [
      { label: "customer or user data", pattern: /\bcustomer_id\b|\buser_id\b|\baccount_id\b|\btenant_id\b/ },
      { label: "payments or transactions", pattern: /\bpayments?\b|\btransactions?\b|\bbilling\b/ },
      { label: "redemptions or discount codes", pattern: /\bredemptions?\b|\bdiscount[_ -]?codes?\b/ },
      { label: "database or migration data", pattern: /\bdatabases?\b|\bmigrations?\b|\bdelete\b|\bupdate\b|\binsert\b/ },
      { label: "access or permissions", pattern: /\bauth(?:entication|orisation|orization)?\b|\bpermissions?\b/ },
    ]),
    paths: matchingPaths(productionPaths, /customer|user|account|payment|billing|redempt|database|migration|permission|auth/i),
  };
  impactSignals.detected = impactSignals.terms.length > 0 || impactSignals.paths.length > 0;

  return {
    hasChangedBehavior: diff.trim().length > 0,
    hasTests: testPaths.length > 0,
    testPaths,
    hasRiskyPath: productionPaths.some((path) => RISKY_PATH.test(path)),
    hasOtherSensitiveTerms: /\bauth(?:entication|orisation|orization)?\b|\bpermission\b|\bpayment\b|\bbilling\b|\bdatabase\b|\bmigration\b|\btransaction\b/.test(text),
    hasConfigTerms: /\bconfig(?:uration)?\b|\benvironment\b|\bfeature flag\b/.test(text),
    hasDataMigrationTerms: productionPaths.some((path) => /(^|\/)(database|db|migrations?|schemas?|models?)(\/|\.|$)/i.test(path))
      || /\bdatabases?\b|\bmigrations?\b|\bschemas?\b|\bdata[ _-]?(?:write|update|delete|insert)\b/.test(text),
    hasPaymentDomainTerms: productionPaths.some((path) => /(^|[\/_-])(payments?|billing|refunds?|redemptions?|discounts?|checkout|invoices?|subscriptions?|orders?|charges?|purchases?)([\/_.-]|$)/i.test(path))
      || /\bpayments?\b|\bbilling\b|\brefunds?\b|\bredemptions?\b|\bdiscount(?:[_ -]?codes?)?\b|\bcheckout\b|\binvoices?\b|\bsubscriptions?\b|\border[_ -]?(?:id|items?|status|total)\b|\b(?:create|place|cancel|fulfill|update)[_ -]?orders?\b|\bcharges?\b|\bpurchases?\b/.test(text),
    hasProviderReviewTerms: productionPaths.some((path) => /(^|[\/_-])(providers?|partners?|external[ _-]?services?|redemptions?)([\/_.-]|$)/i.test(path))
      || /\bproviders?\b|\bpartner[ _-]?services?\b|\bexternal[ _-]?services?\b|\bretr(?:y|ies|ied|ying)\b|\btime[ _-]?outs?\b|\bduplicates?\b|\bidempoten(?:t|cy)\b|\bredemptions?\b|\bdiscount[_ -]?codes?\b/.test(text),
    hasApiReviewTerms: productionPaths.some((path) => /(^|\/)(api|routes?|endpoints?|openapi|swagger)(\/|\.|$)/i.test(path))
      || /\bapi\b|\bstatus[_ ]code\b|\berror[ _-]?contracts?\b|\bresponse[ _-]?shapes?\b|\bendpoints?\b|\bopenapi\b|\bswagger\b|\broutes?\b/.test(text),
    hasSensitiveReviewTerms: productionPaths.some((path) => /(^|\/)(auth|security|permissions?|tokens?|privacy|pii|logging?)(\/|\.|$)/i.test(path))
      || /\blogger\b|\blogging\b|\blog\.(?:debug|info|warning|error|exception)\b|\b(?:user|partner|customer|account|tenant)_id\b|\bauth(?:entication|orisation|orization)?\b|\bpermissions?\b|\btokens?\b|\bsecrets?\b|\bcredentials?\b|\bpii\b|\bsensitive[ _-]?data\b/.test(text),
    hasFrontendTerms: productionPaths.some((path) => /(^|\/)(frontend|ui|components?|browser|web|analytics)(\/|\.|$)|\.(?:tsx|jsx|css|scss)$/i.test(path))
      || /\bfrontend\b|\bbrowser\b|\banalytics\b|\bui component\b/.test(text),
    hasDocsTerms: paths.some((path) => /(^|\/)(docs?|api-docs)(\/|\.|$)|(^|\/)(readme|openapi|swagger)(\.|$)/i.test(path))
      || /\bpublic api docs?\b|\bopenapi\b|\bswagger\b/.test(text),
    duplicateSideEffect,
    providerFailure,
    apiContract,
    sensitiveLogging,
    detectionControls,
    recoveryControls,
    impactSignals,
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

function profileRiskAdjustment(profile: ReviewProfile, signals: Signals) {
  const operationalAttention = signals.duplicateSideEffect.detected
    || signals.providerFailure.detected
    || signals.apiContract.detected
    || signals.sensitiveLogging.detected
    || signals.hasOtherSensitiveTerms
    || signals.hasRiskyPath
    || signals.hasConfigTerms;

  if (profile === "high-assurance") {
    return (!signals.hasTests ? 8 : 0) + (operationalAttention ? 6 : 0);
  }
  if (profile === "payments-refunds" && signals.hasPaymentDomainTerms) return 6;
  if (profile === "auth-security" && signals.hasSensitiveReviewTerms) return 6;
  if (profile === "data-migrations" && signals.hasDataMigrationTerms) return 6;
  if (profile === "frontend-api-consumer" && (signals.hasFrontendTerms || signals.hasDocsTerms || signals.apiContract.detected)) return 6;
  return 0;
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

function describeEvidence(signal: RiskSignal, theme: "duplicate" | "provider" | "api" | "logging") {
  const location = signal.paths.length > 0 ? ` in ${formatList(signal.paths)}` : " in the submitted change";

  if (theme === "duplicate") {
    const sideEffect = signal.terms.some((term) => /discount|redeem|redemption/.test(term))
      ? "retry and discount-code or redemption side-effect signals"
      : "retry and repeated side-effect signals";
    return `Detected ${sideEffect}${location}.`;
  }
  if (theme === "provider") return `Detected external provider failure-handling signals${location}.`;
  if (theme === "api") return `Detected client-facing response and error-contract changes${location}.`;

  const contexts = unique(signal.terms.filter((term) => (
    LOG_IDENTIFIER_TERMS.includes(term)
    || LOG_SECRET_TERMS.includes(term)
    || term === "discount code"
  )).map((term) => term.replaceAll("_", " ")));
  const context = contexts.length > 0 ? ` near ${formatList(contexts)} context` : " near potentially sensitive context";
  return `Detected structured logging${context}${location}.`;
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
  file?: string,
): Report["findings"][number] {
  return { severity, title, evidence, action, category, provenance: "Rule detected", ...(file ? { file } : {}) };
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

function operationalReadiness(signals: Signals): NonNullable<Report["operationalReadiness"]> {
  const failureModes = unique([
    ...(signals.duplicateSideEffect.detected
      ? ["Retries or repeated requests may create duplicate redemptions or issue duplicate discount codes."]
      : []),
    ...(signals.providerFailure.detected
      ? ["External provider timeout, 5xx, malformed, empty or unavailable responses may interrupt the changed operation."]
      : []),
    ...(signals.apiContract.detected
      ? ["Unstable status codes or retryable error fields may cause clients to handle failures incorrectly."]
      : []),
    ...(signals.sensitiveLogging.detected
      ? ["Failure-path logging may expose identifiers, discount codes or detected sensitive values."]
      : []),
    ...(signals.hasOtherSensitiveTerms || signals.hasRiskyPath
      ? ["Authentication, payment, transaction or data-path changes may create unintended access or data side effects."]
      : []),
    ...(signals.hasConfigTerms
      ? ["Configuration or feature-flag changes may introduce unsafe rollout defaults."]
      : []),
  ]);

  const detectionCopy: Record<string, string> = {
    logging: "Logging is present in the changed failure path.",
    "structured events": "Structured event context is present in the changed code.",
    metrics: "Metric instrumentation is present in the changed code.",
    alerts: "Alerting behavior is referenced in the changed code.",
    tracing: "Tracing or span instrumentation is present in the changed code.",
    monitoring: "Monitoring behavior is referenced in the changed code.",
    "health checks": "Health or readiness checks are referenced in the changed code.",
    "status or error codes": "Status or error codes provide a client-visible failure signal.",
  };
  const detectionSignals = failureModes.length > 0
    ? signals.detectionControls.terms.map((term) => detectionCopy[term]).filter(Boolean)
    : [];
  const strongDetection = signals.detectionControls.terms.some((term) => ["metrics", "alerts", "tracing", "monitoring", "health checks"].includes(term));
  const observabilityGaps = unique([
    ...(failureModes.length > 0 && !signals.detectionControls.detected
      ? ["No explicit log, metric, alert, trace or health signal is visible for the detected failure modes."]
      : []),
    ...((signals.duplicateSideEffect.detected || signals.providerFailure.detected) && !strongDetection
      ? ["No metric, alert, trace or monitor is visible for provider failures or repeated side-effect attempts."]
      : []),
  ]);

  const recoveryOrRollback = unique([
    ...(failureModes.length > 0
      ? signals.recoveryControls.terms.map((term) => `The changed code includes evidence of ${term}.`)
      : []),
    ...(signals.duplicateSideEffect.detected && !signals.recoveryControls.terms.some((term) => ["idempotency", "compensation"].includes(term))
      ? ["No idempotency or compensation control is visible for repeated side effects."]
      : []),
    ...(failureModes.length > 0 && !signals.recoveryControls.detected
      ? ["No explicit rollback, feature-flag, restore or compensation path is visible."]
      : []),
  ]);

  const customerOrDataImpact = unique([
    ...(signals.duplicateSideEffect.detected
      ? ["Repeated attempts may create duplicate redemption records or issue duplicate discount codes."]
      : []),
    ...(signals.providerFailure.detected || signals.apiContract.detected
      ? ["Callers may receive unavailable or ambiguous retry behavior during provider failures."]
      : []),
    ...(signals.sensitiveLogging.detected
      ? ["Identifiers or sensitive values may be exposed through failure-path logs."]
      : []),
    ...((signals.hasOtherSensitiveTerms || signals.hasRiskyPath) && signals.impactSignals.detected
      ? [`Potential impact involves ${formatList(signals.impactSignals.terms.length > 0 ? signals.impactSignals.terms : ["sensitive data or access paths"])}.`]
      : []),
  ]);

  const ownerOrReviewerFocus = unique([
    ...(signals.duplicateSideEffect.detected || signals.providerFailure.detected
      ? ["Reliability review should verify bounded retries, detection and safe recovery."]
      : []),
    ...(signals.apiContract.detected
      ? ["API review should confirm stable status codes and retry semantics."]
      : []),
    ...(signals.sensitiveLogging.detected
      ? ["Security review should confirm sensitive fields are omitted or redacted."]
      : []),
    ...(signals.hasOtherSensitiveTerms || signals.hasRiskyPath
      ? ["The reviewer responsible for the affected access, payment or data path should confirm impact and rollback expectations."]
      : []),
    ...(signals.hasConfigTerms
      ? ["The rollout reviewer should confirm safe defaults and a disable or rollback path."]
      : []),
  ]);

  const status = failureModes.length > 0 ? "ATTENTION" : "CLEAR";
  return {
    status,
    summary: status === "ATTENTION"
      ? `${failureModes.length} operational failure mode${failureModes.length === 1 ? "" : "s"} need detection, recovery and impact review before merge.`
      : "No explicit operational failure mode was detected by the prototype rules.",
    failureModes,
    detectionSignals,
    observabilityGaps,
    recoveryOrRollback,
    customerOrDataImpact,
    ownerOrReviewerFocus,
  };
}

function reviewerFocus(
  signals: Signals,
  missingTests: string[],
  operational: NonNullable<Report["operationalReadiness"]>,
): NonNullable<Report["reviewerFocus"]> {
  const items: NonNullable<Report["reviewerFocus"]> = [];

  if (missingTests.length > 0 || signals.duplicateSideEffect.detected || signals.providerFailure.detected) {
    items.push({
      area: "Backend reliability",
      priority: "PRIMARY",
      reason: signals.duplicateSideEffect.detected || signals.providerFailure.detected
        ? "Review retry behavior, provider failures, bounded execution and safe repeated side effects."
        : "Missing focused test coverage requires reliability review of the changed behavior.",
    });
  }

  if (signals.apiContract.detected || signals.hasApiReviewTerms) {
    items.push({
      area: "API contract",
      priority: signals.apiContract.detected ? "PRIMARY" : "SECONDARY",
      reason: "Confirm status codes, error fields, retry semantics and client-facing response stability.",
    });
  }

  if (signals.sensitiveLogging.detected || signals.hasSensitiveReviewTerms) {
    items.push({
      area: "Security/privacy",
      priority: signals.sensitiveLogging.detected ? "PRIMARY" : "SECONDARY",
      reason: "Review identifiers, logging, access controls, permissions and sensitive-data handling where detected.",
    });
  }

  if (signals.hasDataMigrationTerms) {
    items.push({
      area: "Data/migration",
      priority: "PRIMARY",
      reason: "Review schema compatibility, data writes, migration safety and recovery expectations.",
    });
  }

  if (signals.hasPaymentDomainTerms || signals.duplicateSideEffect.detected) {
    items.push({
      area: "Payments/domain logic",
      priority: signals.duplicateSideEffect.detected ? "PRIMARY" : "SECONDARY",
      reason: "Confirm payment, redemption, billing, refund or other domain side effects remain correct and repeat-safe.",
    });
  }

  if (
    operational.observabilityGaps.length > 0
    || operational.recoveryOrRollback.length > 0
    || operational.detectionSignals.length > 0
  ) {
    items.push({
      area: "Platform/observability",
      priority: operational.observabilityGaps.length > 0 ? "PRIMARY" : "SECONDARY",
      reason: "Review operational detection, logs, metrics, alerts, traces and recovery or rollback expectations.",
    });
  }

  if (signals.hasFrontendTerms) {
    items.push({
      area: "Frontend integration",
      priority: "SECONDARY",
      reason: "Review UI, browser, frontend contract or analytics behavior affected by the change.",
    });
  }

  if (signals.hasDocsTerms) {
    items.push({
      area: "Docs/API consumer review",
      priority: "SECONDARY",
      reason: "Confirm public documentation and API consumer guidance match the changed behavior.",
    });
  }

  return items;
}

export function generateReport(input: ReportInput): Report {
  const paths = parseChangedFiles(input.diff);
  const signals = detectSignals(input.diff, paths);
  const reviewProfile = input.reviewProfile ?? "standard";
  const paymentProfileAttention = reviewProfile === "payments-refunds" && signals.hasPaymentDomainTerms;
  const authProfileAttention = reviewProfile === "auth-security" && signals.hasSensitiveReviewTerms;
  const dataProfileAttention = reviewProfile === "data-migrations" && signals.hasDataMigrationTerms;
  const frontendProfileAttention = reviewProfile === "frontend-api-consumer"
    && (signals.hasFrontendTerms || signals.hasDocsTerms || signals.apiContract.detected);
  const riskScore = Math.min(100, calculateRiskScore(signals) + profileRiskAdjustment(reviewProfile, signals));
  const riskLevel = riskLevelForScore(riskScore);
  const technology = parseTechnology(input.technology);
  const operational = operationalReadiness(signals);
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
      describeEvidence(signals.duplicateSideEffect, "duplicate"),
      "Confirm an idempotency boundary exists around redemption and code issuance, then prove repeated attempts cannot duplicate the side effect.",
      "Reliability",
      signals.duplicateSideEffect.paths[0],
    ));
  }

  if (signals.providerFailure.detected) {
    findings.push(makeFinding(
      "MEDIUM",
      "External provider failure states need explicit handling.",
      describeEvidence(signals.providerFailure, "provider"),
      "Verify timeout, 5xx, malformed, empty and unavailable provider responses fail safely and produce intentional retry behaviour.",
      "Reliability",
      signals.providerFailure.paths[0],
    ));
  }

  if (signals.apiContract.detected) {
    findings.push(makeFinding(
      "MEDIUM",
      "The client-facing API error contract may be unstable.",
      describeEvidence(signals.apiContract, "api"),
      "Define stable status codes, response fields and retryable semantics for frontend and partner clients.",
      "API contract",
      signals.apiContract.paths[0],
    ));
  }

  if (signals.sensitiveLogging.detected) {
    findings.push(makeFinding(
      signals.sensitiveLogging.terms.some((term) => ["token", "credential", "secret"].includes(term)) ? "HIGH" : "MEDIUM",
      sensitiveLoggingTitle(signals.sensitiveLogging),
      describeEvidence(signals.sensitiveLogging, "logging"),
      sensitiveLoggingAction(signals.sensitiveLogging),
      "Security",
      signals.sensitiveLogging.paths[0],
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

  if (paymentProfileAttention && !signals.duplicateSideEffect.detected) {
    findings.push(makeFinding(
      "MEDIUM",
      "Payment or refund side effects need repeat-safety review.",
      "The selected Payments/refunds profile is supported by payment, refund, billing or transaction evidence in the change.",
      "Confirm idempotency, retry boundaries and recovery behavior before merge.",
      "Reliability",
    ));
  }

  if (authProfileAttention && !signals.sensitiveLogging.detected) {
    findings.push(makeFinding(
      "MEDIUM",
      "Authentication or sensitive-data behavior needs focused review.",
      "The selected Auth/security profile is supported by authentication, session, permission, token, identifier or logging evidence.",
      "Verify access controls, session handling, redaction and failure behavior.",
      "Security",
    ));
  }

  if (dataProfileAttention) {
    findings.push(makeFinding(
      "MEDIUM",
      "Migration or data-write safety needs focused review.",
      "The selected Data/migrations profile is supported by migration, schema, database or data-write evidence.",
      "Confirm compatibility, forward execution, rollback and recovery expectations.",
      "Maintainability",
    ));
  }

  if (frontendProfileAttention && !signals.apiContract.detected) {
    findings.push(makeFinding(
      "MEDIUM",
      "Consumer-facing behavior needs compatibility review.",
      "The selected Frontend/API consumer profile is supported by frontend, browser, analytics or documentation evidence.",
      "Confirm browser behavior, public guidance and consumer compatibility remain intentional.",
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
  const focusItems = reviewerFocus(signals, missingTests, operational);
  const reviewerChecklist: Report["reviewerChecklist"] = [
    { label: "Confirm the change matches the stated PR intent", status: "ATTENTION" },
    { label: "Verify changed behaviour has focused test coverage", status: signals.hasTests ? "COMPLETE" : "ATTENTION" },
    ...(signals.hasProviderReviewTerms || signals.duplicateSideEffect.detected || signals.providerFailure.detected
      ? [{
          label: "Review provider failures and duplicate side effects",
          status: signals.duplicateSideEffect.detected || signals.providerFailure.detected ? "ATTENTION" as const : "COMPLETE" as const,
        }]
      : []),
    ...(signals.hasApiReviewTerms || signals.apiContract.detected
      ? [{
          label: "Review client-facing error contracts",
          status: signals.apiContract.detected ? "ATTENTION" as const : "COMPLETE" as const,
        }]
      : []),
    ...(signals.hasSensitiveReviewTerms || signals.sensitiveLogging.detected
      ? [{
          label: "Review sensitive logging fields",
          status: signals.sensitiveLogging.detected ? "ATTENTION" as const : "COMPLETE" as const,
        }]
      : []),
    ...(operational.status === "ATTENTION"
      ? [{ label: "Review operational detection, recovery and impact", status: "ATTENTION" as const }]
      : []),
  ];
  const suggestedTestTitles = unique([
    ...suggestedTests(signals),
    ...(reviewProfile === "high-assurance" && !signals.hasTests ? ["test_all_changed_behaviour_paths_have_focused_coverage"] : []),
    ...(reviewProfile === "high-assurance" && operational.status === "ATTENTION" ? ["test_operational_failure_paths_are_detectable_and_recoverable"] : []),
    ...(paymentProfileAttention ? ["test_payment_or_refund_retries_are_idempotent"] : []),
    ...(authProfileAttention ? ["test_session_access_and_sensitive_fields_are_protected"] : []),
    ...(dataProfileAttention ? ["test_migration_forward_and_rollback_paths"] : []),
    ...(frontendProfileAttention ? ["test_public_contract_and_browser_behavior_remain_compatible"] : []),
  ]);
  const hasAttentionSignals = signals.duplicateSideEffect.detected
    || signals.providerFailure.detected
    || signals.apiContract.detected
    || signals.sensitiveLogging.detected
    || signals.hasOtherSensitiveTerms
    || signals.hasRiskyPath
    || signals.hasConfigTerms
    || signals.changedLines > 200
    || operational.status === "ATTENTION";

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
    ...(operational.observabilityGaps.length > 0
      ? ["Confirm operational detection signals for the identified failure modes"]
      : []),
    ...(operational.status === "ATTENTION" && !signals.recoveryControls.detected
      ? ["Document a safe recovery or rollback path for the identified operational risks"]
      : []),
    ...(reviewProfile === "high-assurance" && missingTests.length > 0
      ? ["Provide focused test evidence for every changed behavior path"]
      : []),
    ...(reviewProfile === "high-assurance" && operational.status === "ATTENTION"
      ? ["Resolve or explicitly accept each operational readiness gap"]
      : []),
    ...(paymentProfileAttention ? ["Confirm payment or refund retries are idempotent and recoverable"] : []),
    ...(authProfileAttention ? ["Confirm access, session, token and sensitive-data controls"] : []),
    ...(dataProfileAttention ? ["Confirm migration compatibility, rollback and recovery"] : []),
    ...(frontendProfileAttention ? ["Confirm browser behavior and public consumer contracts"] : []),
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

  const generatedReport: Report = {
    pr: {
      number: 1,
      title: input.title.trim(),
      repository: input.repository.trim(),
      project: input.repository.trim(),
      branch: input.inputSource ?? "pasted-diff",
      language: technology.language,
      framework: technology.framework,
      author: "Local prototype",
      updatedAt: "Just now",
      reviewProfile,
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
        status: signals.sensitiveLogging.detected || signals.hasOtherSensitiveTerms || authProfileAttention ? "ATTENTION" : "CLEAR",
        summary: signals.sensitiveLogging.detected
          ? "Logging statements and sensitive fields appear together in the changed code."
            : signals.hasOtherSensitiveTerms || authProfileAttention
            ? "Authentication, payment or data-sensitive behaviour needs human review."
            : "No direct security signal was detected by the prototype rules.",
        points: [signals.sensitiveLogging.detected
          ? sensitiveLoggingAction(signals.sensitiveLogging)
          : signals.hasOtherSensitiveTerms || authProfileAttention
            ? "Confirm access control and sensitive data handling remain intentional."
            : "Confirm the change does not expose sensitive data through logs, errors or responses."],
      },
      reliability: {
        status: signals.duplicateSideEffect.detected || signals.providerFailure.detected || paymentProfileAttention ? "ATTENTION" : "CLEAR",
        summary: signals.duplicateSideEffect.detected
          ? "Retry behaviour and a redemption side effect appear together in the diff."
          : signals.providerFailure.detected
            ? "External provider failure states need focused review."
            : paymentProfileAttention
              ? "Payment or refund side effects need repeat-safety and recovery review."
            : "No explicit failure-handling, provider or duplicate-side-effect signal was detected.",
        points: [signals.duplicateSideEffect.detected || signals.providerFailure.detected || paymentProfileAttention
          ? "Verify failure paths are bounded, observable, idempotent and safe to repeat."
          : "Confirm the changed behaviour is covered by focused tests."],
      },
      maintainability: {
        status: signals.apiContract.detected || signals.hasConfigTerms || signals.changedLines > 200 || dataProfileAttention || frontendProfileAttention ? "ATTENTION" : "CLEAR",
        summary: signals.apiContract.detected
          ? "Client-facing response construction needs focused review."
          : dataProfileAttention
            ? "Migration, schema or data-write behavior needs compatibility and rollback review."
            : frontendProfileAttention
              ? "Frontend or API-consumer behavior needs compatibility review."
              : signals.changedLines > 200
            ? "The diff size increases review and maintenance risk."
            : signals.hasConfigTerms
              ? "Configuration behaviour and defaults need focused review."
              : "The change is within the prototype’s normal maintenance signals.",
        points: [signals.apiContract.detected
          ? "Confirm provider-specific logic remains isolated from API response formatting."
          : signals.hasConfigTerms || signals.changedLines > 200 || dataProfileAttention || frontendProfileAttention
            ? "Confirm the change scope remains cohesive and responsibilities stay clear."
            : "Confirm responsibilities remain clear and the implementation stays easy to review."],
      },
    },
    operationalReadiness: operational,
    reviewerFocus: focusItems,
    missingTests,
    suggestedTests: recommendation === "APPROVE" ? [] : suggestedTestTitles.map((title) => ({ title })),
    reviewerChecklist: recommendation === "APPROVE" ? [] : reviewerChecklist,
    finalRecommendation: recommendation === "APPROVE"
      ? "No unresolved test, reliability, security or maintainability signals remain. Complete normal human review before approval."
      : recommendation === "REVIEW_REQUIRED"
        ? `Tests are present, but ${reviewFocus} require focused human review before merge.`
        : recommendation === "TESTS_REQUIRED"
          ? "Do not approve until the risk-specific tests cover the changed behaviour and detected failure paths."
          : "Do not merge until all blocking findings have been resolved.",
    conditionsBeforeMerge: conditions,
  };

  const prunedReport: Report = {
    ...generatedReport,
    reviewerFocus: pruneUnsupportedReviewerFocus(generatedReport),
  };

  return {
    ...prunedReport,
    reportQuality: assessReportQuality(prunedReport),
  };
}
