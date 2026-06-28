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
    "## Suggested tests",
    suggestedTests,
    "",
    "## Conditions before merge",
    conditions,
  ].join("\n");
}
