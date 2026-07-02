import type { Report } from "./mock-report";

export type ReportSourceLabel = "AI generated" | "Local fallback" | "Demo report";

const MAX_SECTION_ITEMS = 5;

function safeMarkdownText(value: string) {
  const withoutRawDiff = /(?:^|\n)(?:diff --git|@@|--- a\/|\+\+\+ b\/)/m.test(value)
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

export function reportToMarkdown(report: Report, source: ReportSourceLabel) {
  const recommendation = report.verdict.recommendation.replaceAll("_", " ");
  const findings = limitedList(
    report.findings,
    (finding) => `${finding.severity} · ${safeMarkdownText(finding.category)}: ${safeMarkdownText(finding.title)} — ${safeMarkdownText(finding.action)}`,
  );
  const suggestedTests = limitedList(
    report.suggestedTests,
    (test) => safeMarkdownText(test.title),
  );
  const conditions = limitedList(
    report.conditionsBeforeMerge,
    (condition) => safeMarkdownText(condition),
  );
  const operationalReadiness = report.operationalReadiness
    ? [
        `**Status:** ${report.operationalReadiness.status}`,
        safeMarkdownText(report.operationalReadiness.summary),
        `- **Failure modes:** ${limitedInlineList(report.operationalReadiness.failureModes)}`,
        `- **Detection signals:** ${limitedInlineList(report.operationalReadiness.detectionSignals)}`,
        `- **Observability gaps:** ${limitedInlineList(report.operationalReadiness.observabilityGaps)}`,
        `- **Recovery or rollback:** ${limitedInlineList(report.operationalReadiness.recoveryOrRollback)}`,
        `- **Customer or data impact:** ${limitedInlineList(report.operationalReadiness.customerOrDataImpact)}`,
        `- **Owner or reviewer focus:** ${limitedInlineList(report.operationalReadiness.ownerOrReviewerFocus)}`,
      ].join("\n")
    : "**Status:** NOT ASSESSED\nNot assessed — regenerate this report";

  return [
    "# Lintel merge-readiness report",
    "",
    `**PR:** ${safeMarkdownText(report.pr.title)}`,
    `**Repository:** ${safeMarkdownText(report.pr.repository)}`,
    `**Source:** ${source}`,
    `**Recommendation:** ${recommendation}`,
    `**Risk:** ${report.verdict.riskScore}/100 — ${report.verdict.riskLevel}`,
    "",
    "## Executive summary",
    safeMarkdownText(report.verdict.summary),
    "",
    "## Key findings",
    findings,
    "",
    "## Operational readiness",
    operationalReadiness,
    "",
    "## Suggested tests",
    suggestedTests,
    "",
    "## Conditions before merge",
    conditions,
  ].join("\n");
}
