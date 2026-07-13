import type { Report } from "./mock-report";
import { decisionConditions, deduplicateReportItems, pruneUnsupportedReviewerFocus } from "./report-quality";
import { policyGateSummary, policyStatusForReport, reviewPolicyForProfile } from "./review-policies";
import { reviewProfileLabel } from "./review-profiles";
import { ownerDisplay, suggestedReviewerOwners } from "./reviewer-ownership";
import type { ReportReviewState } from "./review-state";

type MergeSummaryOptions = {
  sourceLabel: string;
  reviewState: ReportReviewState;
  includeLocalNote: boolean;
  actionProgress?: string;
  passportSummary?: string;
  evidenceSummary?: string;
  assumptionSummary?: string;
  builderVerifierSummary?: string;
};

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

function bulletList(items: string[], emptyCopy: string, limit = 5) {
  const safeItems = deduplicateReportItems(items).slice(0, limit);
  if (safeItems.length === 0) return emptyCopy;
  return safeItems.map((item) => `- ${safeMarkdownText(item)}`).join("\n");
}

function topBlockers(report: Report) {
  const blockers: string[] = [];

  for (const condition of decisionConditions(report.conditionsBeforeMerge)) {
    blockers.push(condition);
  }

  for (const finding of report.findings) {
    blockers.push(`${finding.severity} ${finding.category}: ${finding.title}`);
  }

  return blockers;
}

function operationalAttention(report: Report) {
  const attention: string[] = [];

  if (report.operationalReadiness?.status === "ATTENTION") {
    attention.push(`Operational readiness: ${report.operationalReadiness.summary}`);
  }

  if (report.reviews.security.status === "ATTENTION") {
    attention.push(`Security: ${report.reviews.security.summary}`);
  }

  if (report.reviews.reliability.status === "ATTENTION") {
    attention.push(`Reliability: ${report.reviews.reliability.summary}`);
  }

  return attention;
}

function nextAction(report: Report) {
  if (report.verdict.recommendation === "APPROVE") {
    return "Complete normal human review and CI checks.";
  }

  if (report.missingTests.length > 0) {
    return "Add the missing focused tests, then re-check merge readiness.";
  }

  if (decisionConditions(report.conditionsBeforeMerge).length > 0) {
    return "Resolve the merge conditions above before approving.";
  }

  if (report.findings.length > 0) {
    return "Complete focused engineering review on the findings above.";
  }

  return "Review the report and resolve any remaining local review state before merge.";
}

export function mergeSummaryToMarkdown(report: Report, options: MergeSummaryOptions) {
  const recommendation = report.verdict.recommendation.replaceAll("_", " ");
  const displayedConditions = report.verdict.recommendation === "APPROVE"
    ? []
    : decisionConditions(report.conditionsBeforeMerge);
  const supportedReviewerFocus = pruneUnsupportedReviewerFocus(report);
  const focusItems = supportedReviewerFocus?.map((item) => `${item.priority}: ${item.area} — ${item.reason}`) ?? [];
  const localNote = options.reviewState.note.trim();
  const policy = reviewPolicyForProfile(report.pr.reviewProfile);
  const policyStatus = policyStatusForReport(report, policy);
  const suggestedOwners = suggestedReviewerOwners(report);

  return [
    "## Lintel merge-readiness summary",
    "",
    `**Recommendation:** ${recommendation}`,
    `**Risk:** ${report.verdict.riskLevel} (${report.verdict.riskScore}/100)`,
    `**Local review state:** ${safeMarkdownText(options.reviewState.status)}`,
    `**Local owner:** ${safeMarkdownText(ownerDisplay(options.reviewState.owner, suggestedOwners))}`,
    `**Source:** ${safeMarkdownText(options.sourceLabel)}`,
    `**Review mode:** ${safeMarkdownText(reviewProfileLabel(report.pr.reviewProfile))}`,
    `**Review policy:** ${safeMarkdownText(policy.label)} (${safeMarkdownText(policyGateSummary(policy))})`,
    ...(options.passportSummary ? [`**Change Passport:** ${safeMarkdownText(options.passportSummary)}`] : []),
    ...(options.evidenceSummary ? [`**Evidence:** ${safeMarkdownText(options.evidenceSummary)}`] : []),
    ...(options.assumptionSummary ? [`**Assumptions:** ${safeMarkdownText(options.assumptionSummary)}`] : []),
    ...(options.builderVerifierSummary ? [`**Verification boundary:** ${safeMarkdownText(options.builderVerifierSummary)}`] : []),
    "",
    "### Top blockers",
    bulletList(topBlockers(report), "No blockers detected.", 4),
    "",
    "### Conditions before merge",
    displayedConditions.length > 0
      ? bulletList(displayedConditions, "No merge conditions detected.", displayedConditions.length)
      : "No merge conditions detected.",
    "",
    "### Missing tests",
    bulletList(report.missingTests, "No missing test gaps detected.", 5),
    "",
    "### Reviewer focus",
    supportedReviewerFocus
      ? bulletList(focusItems, "No specialist reviewer focus detected.", 4)
      : "Reviewer focus was not assessed — regenerate this report.",
    "",
    "### Ownership cue",
    suggestedOwners.length > 0
      ? bulletList(suggestedOwners, "No specialist owner cue detected.", suggestedOwners.length)
      : "No specialist owner cue detected.",
    "",
    "### Operational / security attention",
    bulletList(operationalAttention(report), "No operational or security attention state detected.", 4),
    "",
    "### Merge gates",
    `${safeMarkdownText(policyStatus.label)} - ${safeMarkdownText(policyStatus.detail)}`,
    ...(options.actionProgress ? [
      "",
      "### Review action progress",
      safeMarkdownText(options.actionProgress),
    ] : []),
    "",
    "### Next action",
    safeMarkdownText(nextAction(report)),
    ...(options.includeLocalNote && localNote.length > 0 ? [
      "",
      "### Local reviewer note",
      safeMarkdownText(localNote),
    ] : []),
    "",
    "_Prepared locally in Lintel. This is a copyable draft, not an automatic GitHub post._",
  ].join("\n");
}
