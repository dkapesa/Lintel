import type { Report } from "./mock-report";
import { decisionConditions, deduplicateReportItems, pruneUnsupportedReviewerFocus } from "./report-quality";
import { reviewProfileLabel } from "./review-profiles";

export type ReportSourceLabel = "AI generated" | "Local fallback" | "Demo report";

const MAX_SECTION_ITEMS = 5;

function safeMarkdownText(value: string) {
  const withoutRawDiff = /diff --git|@@|(?:^|\n)(?:--- a\/|\+\+\+ b\/)/m.test(value)
    ? "[Raw diff omitted]"
    : value;

  return withoutRawDiff
    .replace(/\bsk-[a-z0-9_-]{8,}\b/gi, "[REDACTED]")
    .replace(/\bBearer\s+[a-z0-9._~-]{8,}\b/gi, "Bearer [REDACTED]")
    .replace(/((?:openai_api_key|api[_-]?key|token|password|secret|credential)\s*[:=]\s*)[^\s,;}]+/gi, "$1[REDACTED]")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/([\\`*_[\]<>])/g, "\\$1");
}

function limitedList<T>(items: T[], formatItem: (item: T) => string) {
  if (items.length === 0) return "None detected";

  const lines = items.slice(0, MAX_SECTION_ITEMS).map((item) => `- ${formatItem(item)}`);
  const remaining = items.length - MAX_SECTION_ITEMS;

  if (remaining > 0) lines.push(`- ...and ${remaining} more`);
  return lines.join("\n");
}

function limitedInlineList(items: string[]) {
  if (items.length === 0) return "None detected";
  const values = items.slice(0, 3).map(safeMarkdownText);
  if (items.length > 3) values.push(`...and ${items.length - 3} more`);
  return values.join("; ");
}

function inputSourceLabel(value: string) {
  if (value === "github-pr") return "GitHub PR import";
  if (value === "sample") return "Sample";
  if (value === "pasted-diff") return "Pasted diff";
  return value;
}

function inputSourceMarkdown(value: string) {
  const knownInputSource = value === "github-pr" || value === "sample" || value === "pasted-diff";
  return `**${knownInputSource ? "Input source" : "Branch"}:** ${safeMarkdownText(inputSourceLabel(value))}`;
}

function filenameSlug(value: string, fallback: string, maxLength: number) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug || fallback;
}

export function reportMarkdownFilename(report: Report) {
  const repository = filenameSlug(report.pr.repository, "repository", 50);
  const title = filenameSlug(report.pr.title, "pull-request", 80);
  return `lintel-report-${repository}-${title}.md`;
}

export function reportToMarkdown(report: Report, source: ReportSourceLabel) {
  const recommendation = report.verdict.recommendation.replaceAll("_", " ");
  const findings = report.findings.length > 0
    ? [
        ...report.findings.slice(0, MAX_SECTION_ITEMS).map((finding, index) => [
          `**${index + 1}. ${safeMarkdownText(finding.title)}**`,
          `- **Severity:** ${finding.severity}`,
          `- **Category:** ${safeMarkdownText(finding.category)}`,
          ...(finding.provenance ? [`- **Provenance:** ${safeMarkdownText(finding.provenance)}`] : []),
          `- **Evidence:** ${safeMarkdownText(finding.evidence)}`,
          `- **Action:** ${safeMarkdownText(finding.action)}`,
          ...(finding.file ? [`- **File:** ${safeMarkdownText(finding.file)}`] : []),
        ].join("\n")),
        ...(report.findings.length > MAX_SECTION_ITEMS ? [`...and ${report.findings.length - MAX_SECTION_ITEMS} more`] : []),
      ].join("\n\n")
    : "None detected";
  const suggestedTests = limitedList(
    report.suggestedTests,
    (test) => `${safeMarkdownText(test.title)}${test.priority ? ` (${safeMarkdownText(test.priority)})` : ""}${test.description ? ` — ${safeMarkdownText(test.description)}` : ""}`,
  );
  const missingTests = limitedList(
    report.missingTests,
    (test) => safeMarkdownText(test),
  );
  const displayedConditions = report.verdict.recommendation === "APPROVE"
    ? []
    : decisionConditions(report.conditionsBeforeMerge);
  const conditions = displayedConditions.length > 0
    ? limitedList(displayedConditions, (condition) => safeMarkdownText(condition))
    : "No merge conditions detected.";
  const cleanApprove = report.verdict.recommendation === "APPROVE"
    && report.findings.length === 0
    && report.missingTests.length === 0
    && report.suggestedTests.length === 0
    && report.operationalReadiness?.status === "CLEAR";
  const reviewerChecklist = cleanApprove ? [] : report.reviewerChecklist;
  const checklist = reviewerChecklist.length > 0
    ? limitedList(reviewerChecklist, (item) => `${item.status} · ${safeMarkdownText(item.label)}`)
    : "No reviewer checklist items required.";
  const missingCoverage = report.missingTests.length > 0 ? missingTests : "No missing test gaps detected.";
  const suggestedTestPlan = report.suggestedTests.length > 0 ? suggestedTests : "No additional tests suggested.";
  const operationalReadiness = report.operationalReadiness
    ? [
        `**Status:** ${report.operationalReadiness.status}`,
        safeMarkdownText(report.operationalReadiness.summary),
        `- **Failure modes:** ${limitedInlineList(deduplicateReportItems(report.operationalReadiness.failureModes))}`,
        `- **Detection signals:** ${limitedInlineList(deduplicateReportItems(report.operationalReadiness.detectionSignals))}`,
        `- **Observability gaps:** ${limitedInlineList(deduplicateReportItems(report.operationalReadiness.observabilityGaps))}`,
        `- **Recovery or rollback:** ${limitedInlineList(deduplicateReportItems(report.operationalReadiness.recoveryOrRollback))}`,
        `- **Customer or data impact:** ${limitedInlineList(deduplicateReportItems(report.operationalReadiness.customerOrDataImpact))}`,
        `- **Owner or reviewer focus:** ${limitedInlineList(deduplicateReportItems(report.operationalReadiness.ownerOrReviewerFocus))}`,
      ].join("\n")
    : "**Status:** NOT ASSESSED\nNot assessed — regenerate this report";
  const supportedReviewerFocus = pruneUnsupportedReviewerFocus(report);
  const reviewerFocus = supportedReviewerFocus
    ? limitedList(
        supportedReviewerFocus,
        (item) => `${item.priority} · ${safeMarkdownText(item.area)}: ${safeMarkdownText(item.reason)}`,
      )
    : "Reviewer focus was not assessed — regenerate this report";

  const reportQuality = report.reportQuality
    ? [
        `**Status:** ${report.reportQuality.status}`,
        report.reportQuality.status === "PASS"
          ? "Checks passed"
          : limitedList(
              report.reportQuality.checks.filter((check) => check.status === "WARNING"),
              (check) => `${safeMarkdownText(check.label)}: ${safeMarkdownText(check.detail)}`,
            ),
      ].join("\n")
    : "**Status:** NOT ASSESSED\nNot assessed — regenerate this report";

  const closingSummary = report.verdict.recommendation === "APPROVE"
    ? "No merge blockers remain in this report. Complete normal human review and CI checks."
    : report.verdict.recommendation === "REVIEW_REQUIRED" || report.verdict.recommendation === "TESTS_REQUIRED"
      ? "Resolve the conditions above and verify the focused test plan before merge."
      : "Do not merge until the blocking risks above are resolved.";

  return [
    "# Lintel merge-readiness report",
    "",
    `**PR:** ${safeMarkdownText(report.pr.title)}`,
    `**Repository:** ${safeMarkdownText(report.pr.repository)}`,
    `**Source:** ${source}`,
    inputSourceMarkdown(report.pr.branch),
    `**Review profile:** ${safeMarkdownText(reviewProfileLabel(report.pr.reviewProfile))}`,
    `**Recommendation:** ${recommendation}`,
    `**Risk band:** ${report.verdict.riskLevel}`,
    `**Score detail:** ${report.verdict.riskScore}/100`,
    "",
    "## Executive summary",
    safeMarkdownText(report.verdict.summary),
    "",
    "## Conditions before merge",
    conditions,
    "",
    "## Risk findings",
    findings,
    "",
    "## Test plan",
    "### Missing coverage",
    missingCoverage,
    "",
    "### Suggested tests",
    suggestedTestPlan,
    "",
    "### Reviewer checklist",
    checklist,
    "",
    "## Operational readiness",
    operationalReadiness,
    "",
    "## Reviewer focus",
    reviewerFocus,
    "",
    "## Report quality",
    reportQuality,
    "",
    "## Closing summary",
    closingSummary,
  ].join("\n");
}
