import type { Report, ReportQuality, ReportQualityCheck, RiskLevel } from "./mock-report";

function riskLevelForScore(score: number): RiskLevel {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 31) return "MEDIUM";
  return "LOW";
}

function reportEvidence(report: Report) {
  const operational = report.operationalReadiness;

  return [
    ...report.changedFiles.map((file) => file.path),
    ...report.findings.flatMap((finding) => [finding.title, finding.category, finding.evidence, finding.action, finding.file ?? ""]),
    ...(operational
      ? [
          operational.summary,
          ...operational.failureModes,
          ...operational.detectionSignals,
          ...operational.observabilityGaps,
          ...operational.recoveryOrRollback,
          ...operational.customerOrDataImpact,
          ...operational.ownerOrReviewerFocus,
        ]
      : []),
  ].join("\n").toLowerCase();
}

function paymentDomainSupported(report: Report, evidence: string) {
  const changedPaths = report.changedFiles.map((file) => file.path).join("\n");
  const paymentPath = /(^|[\/_-])(payments?|billing|refunds?|redemptions?|discounts?|checkout|invoices?|subscriptions?|orders?|charges?)([\/_.-]|$)/i.test(changedPaths);
  const explicitPaymentTerms = /\bpayments?\b|\bbilling\b|\brefunds?\b|\bredemptions?\b|\bdiscount(?:[_ -]?codes?)?\b|\bcheckout\b|\binvoices?\b|\bsubscriptions?\b|\border[_ -]?(?:id|items?|status|total)\b|\b(?:create|place|cancel|fulfil|fulfill|update)[_ -]?orders?\b|\bcharges?\b/.test(evidence);
  return paymentPath || explicitPaymentTerms;
}

function reviewerAreaSupported(area: string, evidence: string, report: Report) {
  if (area === "Backend reliability") {
    return report.missingTests.length > 0 || /\bproviders?\b|\bretr(?:y|ies|ied|ying)\b|\btime[ _-]?outs?\b|\bduplicates?\b|\bidempoten(?:t|cy)\b|\bfailures?\b/.test(evidence);
  }
  if (area === "API contract") {
    return /\bapi\b|\bendpoints?\b|\broutes?\b|\bresponse[ _-]?shapes?\b|\bstatus[_ ]codes?\b|\berror[ _-]?contracts?\b|\bopenapi\b|\bpublic[ _-]?(?:api|contract)\b/.test(evidence);
  }
  if (area === "Security/privacy") {
    return /\bauth(?:entication|orisation|orization)?\b|\bpermissions?\b|\btokens?\b|\bsecrets?\b|\bcredentials?\b|\bidentifiers?\b|\b(?:user|partner|customer|account|tenant)_id\b|\bpii\b|\bsensitive[ _-]?data\b|\blogg(?:er|ing)\b|\bexpos(?:e|ed|ure)\b/.test(evidence);
  }
  if (area === "Data/migration") {
    return /\bdatabases?\b|\bmigrations?\b|\bschemas?\b|\bdata[ _-]?(?:write|update|delete|insert)\b/.test(evidence);
  }
  if (area === "Payments/domain logic") {
    return paymentDomainSupported(report, evidence);
  }
  if (area === "Platform/observability") {
    return report.operationalReadiness?.status === "ATTENTION" || /\blogs?\b|\bmetrics?\b|\balerts?\b|\btraces?\b|\bmonitor(?:ing|ed)?\b|\broll[ _-]?back\b|\brecovery\b|\boperational[ _-]?gaps?\b/.test(evidence);
  }
  if (area === "Frontend integration") {
    return /\bfrontend\b|\bbrowser\b|\banalytics\b|\bui\b|\.(?:tsx|jsx|css|scss)(?:\b|$)/.test(evidence);
  }
  if (area === "Docs/API consumer review") {
    return /(?:^|\/)docs?(?:\/|\.|$)|(?:^|\/)(?:readme|openapi|swagger)(?:\.|$)|\bpublic[ _-]?api[ _-]?docs?\b/m.test(evidence);
  }
  return false;
}

export function pruneUnsupportedReviewerFocus(report: Report): Report["reviewerFocus"] {
  if (!report.reviewerFocus) return undefined;
  const evidence = reportEvidence(report);
  const seen = new Set<string>();
  const supported = report.reviewerFocus.filter((item) => {
    const key = item.area.trim().toLowerCase();
    if (seen.has(key) || !reviewerAreaSupported(item.area, evidence, report)) return false;
    seen.add(key);
    return true;
  });
  const primaryIndex = supported.findIndex((item) => item.priority === "PRIMARY");
  const ordered = primaryIndex > 0
    ? [supported[primaryIndex], ...supported.filter((_, index) => index !== primaryIndex)]
    : supported;

  return ordered.map((item, index) => ({
    ...item,
    priority: index === 0 ? "PRIMARY" : "SECONDARY",
  }));
}

export function deduplicateReportItems(items: string[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.trim().toLowerCase().replace(/\s+/g, " ");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function decisionConditions(items: string[]) {
  const conditions = deduplicateReportItems(items);

  return conditions.filter((condition, index) => {
    const normalized = condition.toLowerCase();
    const alternatives = conditions.filter((_, alternativeIndex) => alternativeIndex !== index);
    const genericCondition = /implement the necessary test coverage for all newly introduced behaviou?rs and edge cases|conduct a thorough review of the operational impacts of retries and ensure that safe boundaries are defined|complete implementation of missing risk-specific tests before merge|confirm operational readiness and address attention states regarding reliability and security|all high-risk behaviou?rs must have appropriate tests implemented before merge|address operational readiness findings before merging/.test(normalized);
    const genericComprehensiveTests = /add comprehensive tests covering success and failure scenarios/.test(normalized);
    const genericAlternative = (item: string) => /implement the necessary test coverage for all newly introduced behaviou?rs and edge cases|conduct a thorough review of the operational impacts of retries and ensure that safe boundaries are defined|complete implementation of missing risk-specific tests before merge|confirm operational readiness and address attention states regarding reliability and security|all high-risk behaviou?rs must have appropriate tests implemented before merge|address operational readiness findings before merging|add comprehensive tests covering success and failure scenarios|complete focused review of the detected sensitive change area|resolve or explicitly accept each operational readiness gap|provide focused test evidence for every changed behaviou?r path|confirm operational detection signals/i.test(item);
    const hasSpecificAlternative = alternatives.some((item) => !genericAlternative(item));
    const hasSpecificTestCondition = alternatives.some((item) => (
      /\b(?:test|coverage|prove|verify)\b/i.test(item)
      && !/risk-specific tests listed|focused test evidence for every changed behavio(?:u)?r path/i.test(item)
    ));
    const hasSpecificDetectionCondition = alternatives.some((item) => (
      /\b(?:detection|observability|logging|monitoring|alert)\b/i.test(item)
      && !/operational readiness gap/i.test(item)
    ));
    const hasSpecificOperationalCondition = hasSpecificDetectionCondition || alternatives.some((item) => (
      /\b(?:recovery|rollback)\b/i.test(item)
      && !/operational readiness gap/i.test(item)
    ));
    const hasSpecificCondition = alternatives.some((item) => !(
      /complete focused review of the detected sensitive change area|resolve or explicitly accept each operational readiness gap/i.test(item)
    ));
    const hasSpecificProvableCondition = alternatives.some((item) => !(
      /complete implementation of missing risk-specific tests before merge|confirm operational readiness and address attention states|all high-risk behaviou?rs must have appropriate tests implemented before merge|address operational readiness findings before merging|complete focused review of the detected sensitive change area|resolve or explicitly accept each operational readiness gap|provide focused test evidence for every changed behavio(?:u)?r path|confirm operational detection signals/i.test(item)
    ));
    const isGenericTestCondition = /complete implementation of missing risk-specific tests before merge|all high-risk behaviou?rs must have appropriate tests implemented before merge|risk-specific tests listed|focused test evidence for every changed behavio(?:u)?r path/.test(normalized);
    const isGenericOperationalCondition = /confirm operational readiness and address attention states|address operational readiness findings before merging|resolve or explicitly accept each operational readiness gap/.test(normalized);

    if (genericCondition) {
      return false;
    }
    if (genericComprehensiveTests) {
      return !hasSpecificTestCondition && !hasSpecificAlternative;
    }
    if (isGenericTestCondition) {
      return !hasSpecificTestCondition;
    }
    if (isGenericOperationalCondition) {
      return !hasSpecificOperationalCondition && !hasSpecificProvableCondition;
    }
    if (/complete focused review of the detected sensitive change area/.test(normalized)) {
      return !hasSpecificCondition;
    }
    if (/confirm operational detection signals/.test(normalized)) {
      return !hasSpecificDetectionCondition;
    }
    if (/resolve or explicitly accept each operational readiness gap/.test(normalized)) {
      return !hasSpecificOperationalCondition;
    }
    return true;
  });
}

function check(label: string, passes: boolean, passDetail: string, warningDetail: string): ReportQualityCheck {
  return {
    label,
    status: passes ? "PASS" : "WARNING",
    detail: passes ? passDetail : warningDetail,
  };
}

export function assessReportQuality(report: Report): ReportQuality {
  const expectedRiskLevel = riskLevelForScore(report.verdict.riskScore);
  const testsRequiredHasEvidence = report.verdict.recommendation !== "TESTS_REQUIRED"
    || report.missingTests.length > 0
    || report.suggestedTests.length > 0;
  const approveIsClear = report.verdict.recommendation !== "APPROVE"
    || (
      report.findings.length === 0
      && report.missingTests.length === 0
      && report.suggestedTests.length === 0
      && report.conditionsBeforeMerge.length === 0
    );
  const operationalIsConsistent = report.operationalReadiness?.status !== "ATTENTION"
    || report.verdict.recommendation !== "APPROVE";
  const evidence = reportEvidence(report);
  const unsupportedFocus = (report.reviewerFocus ?? [])
    .filter((item) => !reviewerAreaSupported(item.area, evidence, report))
    .map((item) => item.area);
  const hasSensitivePath = report.changedFiles.some((file) => /(^|\/)(auth|sessions?|payments?|billing|refunds?|logging?|logs?)(\/|[._-]|$)/i.test(file.path));
  const sensitiveRiskIsNotLow = !hasSensitivePath || report.verdict.riskLevel !== "LOW";
  const hasSecurityOrPrivacyFinding = report.findings.some((finding) => (
    finding.category === "Security"
    || /\bsensitive logging\b|\bprivacy\b|\bpii\b|\bcredentials?\b|\btokens?\b|\bsecrets?\b/.test(`${finding.title} ${finding.evidence} ${finding.action}`.toLowerCase())
  ));
  const securityIsConsistent = report.reviews.security.status !== "CLEAR" || !hasSecurityOrPrivacyFinding;
  const shareableReport: Report = { ...report };
  delete shareableReport.reportQuality;
  const containsRawDiff = /diff --git|@@/.test(JSON.stringify(shareableReport));

  const checks: ReportQualityCheck[] = [
    check("Risk level matches risk score", report.verdict.riskLevel === expectedRiskLevel, "Risk level matches the configured score thresholds.", `Expected ${expectedRiskLevel} for a score of ${report.verdict.riskScore}.`),
    check("Tests-required evidence", testsRequiredHasEvidence, "The recommendation includes sufficient test evidence.", "TESTS_REQUIRED has no missing or suggested tests."),
    check("Approve consistency", approveIsClear, "Approval has no unresolved findings, tests or conditions.", "APPROVE conflicts with findings, missing tests, suggested tests or merge conditions."),
    check("Operational recommendation consistency", operationalIsConsistent, "Operational attention does not result in approval.", "Operational ATTENTION conflicts with APPROVE."),
    check("Reviewer focus evidence", unsupportedFocus.length === 0, "Reviewer focus areas are supported by report evidence.", `Unsupported reviewer focus: ${unsupportedFocus.join(", ")}.`),
    check("Sensitive-path risk floor", sensitiveRiskIsNotLow, "Sensitive changed paths are not classified as low risk.", "A sensitive payment, refund, authentication or logging path remains LOW risk."),
    check("Security review consistency", securityIsConsistent, "The security review does not conflict with security or privacy findings.", "Security is CLEAR despite a sensitive logging, privacy or security finding."),
    check("Shareable fields exclude patch markers", !containsRawDiff, "No raw patch markers appear in shareable report fields.", "Raw patch markers appear in a shareable report field."),
  ];

  return {
    status: checks.some((item) => item.status === "WARNING") ? "WARNING" : "PASS",
    checks,
  };
}
