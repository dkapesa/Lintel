"use client";

import { useEffect, useRef, useState } from "react";
import {
  conditionKey,
  conditionProgressSummary,
  readConditionProgress,
  reportConditions,
  writeConditionProgress,
} from "../../lib/condition-progress";
import {
  appendDecisionHistoryEvent,
  decisionHistoryKeyForReport,
  ensureDecisionHistory,
  initialDecisionHistory,
  ownershipChangeEvent,
  readDecisionHistory,
  reviewStatusChangeEvent,
  type DecisionHistoryEvent,
} from "../../lib/decision-history";
import { mergeSummaryToMarkdown } from "../../lib/merge-summary";
import { GENERATED_REPORT_STORAGE_KEY } from "../../lib/report-generator";
import { conditionsToMarkdown, findingProvenanceLabel, reportMarkdownFilename, reportToMarkdown, type ReportSourceLabel } from "../../lib/report-markdown";
import type { FindingSeverity, Recommendation, Report, ReviewArea, RiskLevel } from "../../lib/mock-report";
import { report as demoReport } from "../../lib/mock-report";
import { deduplicateReportItems, pruneUnsupportedReviewerFocus } from "../../lib/report-quality";
import { policyGateSummary, policyStatusForReport, reviewPolicyForProfile } from "../../lib/review-policies";
import { reviewProfileLabel } from "../../lib/review-profiles";
import { ownerDisplay, REVIEW_OWNER_OPTIONS, suggestedReviewerOwners, type ReviewerOwner } from "../../lib/reviewer-ownership";
import {
  defaultReviewState,
  readReviewState,
  REVIEW_STATUSES,
  reviewStateKeyForReport,
  type ReportReviewState,
  type ReviewStatus,
  writeReviewState,
} from "../../lib/review-state";

type GeneratedReportSource = "ai" | "deterministic";
type ReportSource = GeneratedReportSource | "demo";
type CopyState = "idle" | "copied" | "failed";
type DownloadState = "idle" | "downloaded" | "failed";
type ReportTab = "overview" | "timeline" | "evidence" | "blast-radius" | "findings" | "tests" | "operations" | "review-focus" | "changed-files" | "export";
type Finding = Report["findings"][number];
type ReviewerFocus = NonNullable<Report["reviewerFocus"]>[number];
type EvidenceLedgerItem = {
  label: string;
  detail: string;
  impact: "Supports decision" | "Missing evidence" | "Blocks merge" | "Needs human confirmation" | "Ready signal";
  relation: string;
};
type SurfaceStatus = "Clear" | "Watch" | "Attention" | "Blocker";
type AffectedSurface = {
  name: string;
  status: SurfaceStatus;
  reason: string;
  evidence: string;
  action: string;
};
type ScoreComponentStatus = "Strong" | "Watch" | "Drag";
type ScoreBreakdownComponent = {
  label: string;
  status: ScoreComponentStatus;
  explanation: string;
  improvesWith: string;
  relatedEvidence: string;
};
type ScoreBreakdown = {
  strongestPositiveSignal: string;
  biggestScoreDrag: string;
  nextAction: string;
  components: ScoreBreakdownComponent[];
};

type StoredReport = {
  report: Report;
  source: GeneratedReportSource;
};

const sourceLabels: Record<ReportSource, ReportSourceLabel> = {
  ai: "Baseline + model-assisted",
  deterministic: "Baseline only",
  demo: "Demo report",
};

const copyLabels: Record<CopyState, string> = {
  idle: "Copy summary",
  copied: "Copied",
  failed: "Copy failed",
};

const downloadLabels: Record<DownloadState, string> = {
  idle: "Download Markdown",
  downloaded: "Downloaded",
  failed: "Download failed",
};

const copyConditionsLabels: Record<CopyState, string> = {
  idle: "Copy conditions",
  copied: "Conditions copied",
  failed: "Copy failed",
};

const copyMergeSummaryLabels: Record<CopyState, string> = {
  idle: "Copy PR comment",
  copied: "PR comment copied",
  failed: "Copy failed",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReport(value: unknown): value is Report {
  return isRecord(value)
    && isRecord(value.pr)
    && typeof value.pr.title === "string"
    && isRecord(value.verdict)
    && typeof value.verdict.recommendation === "string"
    && Array.isArray(value.findings)
    && !/diff --git|@@|(?:^|\\n)(?:--- a\/|\+\+\+ b\/)/m.test(JSON.stringify(value));
}

function isStoredReport(value: unknown): value is StoredReport {
  return isRecord(value)
    && (value.source === "ai" || value.source === "deterministic")
    && isReport(value.report);
}

async function writeToClipboard(value: string) {
  let clipboardTimeout: ReturnType<typeof setTimeout> | null = null;

  try {
    await new Promise<void>((resolve, reject) => {
      clipboardTimeout = setTimeout(() => reject(new Error("Clipboard write timed out")), 1_000);
      navigator.clipboard.writeText(value).then(resolve, reject);
    });
    return true;
  } catch {
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.setAttribute("aria-hidden", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
      activeElement?.focus();
    }
  } finally {
    if (clipboardTimeout) clearTimeout(clipboardTimeout);
  }
}

function downloadMarkdown(value: string, filename: string) {
  let url: string | null = null;
  let link: HTMLAnchorElement | null = null;

  try {
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    url = URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    return true;
  } catch {
    return false;
  } finally {
    link?.remove();

    if (url) {
      const objectUrl = url;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    }
  }
}

function displayLabel(value: string) {
  return value.replaceAll("_", " ");
}

const recommendationHeadings: Record<Recommendation, string> = {
  APPROVE: "Ready to merge",
  REVIEW_REQUIRED: "Needs focused review",
  TESTS_REQUIRED: "What needs attention",
  BLOCK: "Do not merge",
};

const closingRecommendations: Record<Recommendation, string> = {
  APPROVE: "No merge blockers remain in this report. Complete normal human review and CI checks.",
  REVIEW_REQUIRED: "Resolve or explicitly accept the focused review items above before merge.",
  TESTS_REQUIRED: "Resolve the conditions above and verify the focused test plan before merge.",
  BLOCK: "Do not merge until the blocking risks above are resolved.",
};

function inputSourceLabel(value: string) {
  if (value === "github-pr") return "GitHub PR import";
  if (value === "sample") return "Sample";
  if (value === "pasted-diff") return "Pasted diff";
  return value;
}

function decisionPanelInputLabel(value: string) {
  if (value === "github-pr") return "GitHub import";
  if (value === "sample") return "Sample";
  if (value === "pasted-diff") return "Manual";
  return inputSourceLabel(value);
}

function timelineTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  return <span className={`recommendation recommendation--${recommendation.toLowerCase()}`}>{displayLabel(recommendation)}</span>;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-badge risk-badge--${risk.toLowerCase()}`}>{risk}</span>;
}

function reviewTextKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function ReviewCard({ title, review, findingTitles, calmSummary }: { title: string; review: ReviewArea; findingTitles: string[]; calmSummary?: string }) {
  const findingKeys = new Set(findingTitles.map(reviewTextKey));
  const summary = calmSummary ?? review.summary;
  const showSummary = !findingKeys.has(reviewTextKey(summary));
  const points = calmSummary ? [] : deduplicateReportItems(review.points)
    .filter((point) => !findingKeys.has(reviewTextKey(point)))
    .slice(0, 2);

  return (
    <article className="review-card">
      <div className="section-heading section-heading--compact">
        <h3>{title}</h3>
        <span className={`review-status review-status--${review.status.toLowerCase()}`}>{review.status}</span>
      </div>
      {showSummary && <p>{summary}</p>}
      {points.length > 0 && <ul className="review-points">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>}
    </article>
  );
}

function OperationalArea({ title, items, emptyCopy }: { title: string; items: string[]; emptyCopy: string }) {
  return (
    <article className="operational-area">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      ) : (
        <p>{emptyCopy}</p>
      )}
    </article>
  );
}

function SeverityTag({ severity }: { severity: FindingSeverity }) {
  return <span className={`severity severity--${severity.toLowerCase()}`}>{severity}</span>;
}

const relatedStopWords = new Set([
  "and",
  "are",
  "before",
  "change",
  "changes",
  "confirm",
  "detected",
  "does",
  "each",
  "from",
  "handling",
  "into",
  "needs",
  "path",
  "risk",
  "should",
  "that",
  "the",
  "this",
  "with",
]);

function relatedTokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9_/-]+/g)
      ?.filter((token) => token.length > 2 && !relatedStopWords.has(token)) ?? [],
  );
}

function relatedScore(source: string, candidate: string) {
  const sourceTokens = relatedTokens(source);
  const candidateTokens = relatedTokens(candidate);
  let score = 0;

  for (const token of sourceTokens) {
    if (candidateTokens.has(token)) score += 1;
  }

  return score;
}

function findingContext(finding: Finding) {
  return [
    finding.title,
    finding.category,
    finding.evidence,
    finding.action,
    finding.file ?? "",
  ].join(" ");
}

function affectedFilesForFinding(report: Report, finding: Finding) {
  const context = findingContext(finding).toLowerCase();
  const files = new Set<string>();

  if (finding.file) files.add(finding.file);

  for (const file of report.changedFiles) {
    const path = file.path.toLowerCase();
    const pathParts = path.split("/");
    const basename = pathParts[pathParts.length - 1] ?? path;

    if (context.includes(path) || context.includes(basename)) {
      files.add(file.path);
    }
  }

  return [...files];
}

function bestRelatedText(finding: Finding, items: string[]) {
  const context = findingContext(finding);
  let best: { item: string; score: number } | null = null;

  for (const item of items) {
    const score = relatedScore(context, item);
    if (score > (best?.score ?? 0)) best = { item, score };
  }

  return best && best.score > 0 ? best.item : null;
}

function reviewerFocusForFinding(finding: Finding, focusItems: ReviewerFocus[]) {
  const context = findingContext(finding);
  let best: { item: ReviewerFocus; score: number } | null = null;

  for (const item of focusItems) {
    const score = relatedScore(context, `${item.area} ${item.reason}`);
    const categoryBoost = finding.category === "Security" && item.area === "Security/privacy"
      ? 2
      : finding.category === "API contract" && item.area === "API contract"
        ? 2
        : finding.category === "Reliability" && item.area === "Backend reliability"
          ? 2
          : 0;
    const totalScore = score + categoryBoost;
    if (totalScore > (best?.score ?? 0)) best = { item, score: totalScore };
  }

  return best && best.score > 0 ? best.item : null;
}

function buildEvidenceLedger(report: Report, conditions: string[], focusItems: ReviewerFocus[] | null | undefined) {
  const found: EvidenceLedgerItem[] = [];
  const missing: EvidenceLedgerItem[] = [];

  if (report.findings.length > 0) {
    for (const finding of report.findings) {
      found.push({
        label: finding.title,
        detail: finding.evidence,
        impact: finding.severity === "HIGH" || finding.severity === "CRITICAL" ? "Blocks merge" : "Supports decision",
        relation: finding.file ? `Finding / ${finding.file}` : `Finding / ${finding.category}`,
      });
    }
  }

  if (report.changedFiles.length > 0) {
    found.push({
      label: "Changed file scope identified",
      detail: `${report.changedFiles.length} changed ${report.changedFiles.length === 1 ? "file" : "files"} used to frame the merge-readiness decision.`,
      impact: "Supports decision",
      relation: "Changed files",
    });
  }

  if (report.operationalReadiness) {
    const detectionSignals = deduplicateReportItems(report.operationalReadiness.detectionSignals);
    const observabilityGaps = deduplicateReportItems(report.operationalReadiness.observabilityGaps);
    const recoveryGaps = deduplicateReportItems(report.operationalReadiness.recoveryOrRollback);
    const impactItems = deduplicateReportItems(report.operationalReadiness.customerOrDataImpact);

    if (detectionSignals.length > 0) {
      found.push({
        label: "Detection signals identified",
        detail: detectionSignals.slice(0, 2).join("; "),
        impact: "Supports decision",
        relation: "Operational readiness",
      });
    }

    for (const gap of observabilityGaps.slice(0, 3)) {
      missing.push({
        label: "Observability evidence missing",
        detail: gap,
        impact: "Missing evidence",
        relation: "Operational readiness",
      });
    }

    for (const gap of recoveryGaps.slice(0, 3)) {
      missing.push({
        label: "Recovery evidence needs confirmation",
        detail: gap,
        impact: "Needs human confirmation",
        relation: "Operational readiness",
      });
    }

    if (impactItems.length > 0 && report.operationalReadiness.status === "ATTENTION") {
      missing.push({
        label: "Customer or data impact needs review",
        detail: impactItems.slice(0, 2).join("; "),
        impact: "Needs human confirmation",
        relation: "Operational readiness",
      });
    }
  }

  for (const missingTest of report.missingTests.slice(0, 6)) {
    missing.push({
      label: "Test evidence missing",
      detail: missingTest,
      impact: "Missing evidence",
      relation: "Test plan",
    });
  }

  for (const condition of conditions) {
    missing.push({
      label: "Merge contract condition open",
      detail: condition,
      impact: "Blocks merge",
      relation: "Conditions before merge",
    });
  }

  if (focusItems && focusItems.length > 0) {
    found.push({
      label: "Reviewer focus identified",
      detail: focusItems.map((item) => item.area).slice(0, 4).join(", "),
      impact: "Needs human confirmation",
      relation: "Reviewer focus",
    });
  }

  if (report.reportQuality?.status === "PASS") {
    found.push({
      label: "Report quality checks passed",
      detail: "The generated report is internally consistent and raw-diff-free according to current quality checks.",
      impact: "Ready signal",
      relation: "Report quality",
    });
  } else if (report.reportQuality?.status === "WARNING") {
    missing.push({
      label: "Report quality warning",
      detail: "Review report quality warnings before sharing this report outside the local workspace.",
      impact: "Needs human confirmation",
      relation: "Report quality",
    });
  }

  if (report.verdict.recommendation === "APPROVE" && conditions.length === 0 && report.findings.length === 0 && report.missingTests.length === 0) {
    found.push({
      label: "No merge blockers detected",
      detail: "The report has no risk findings, missing tests or merge conditions.",
      impact: "Ready signal",
      relation: "Merge contract",
    });
  }

  return { found: deduplicateEvidenceItems(found), missing: deduplicateEvidenceItems(missing) };
}

function deduplicateEvidenceItems(items: EvidenceLedgerItem[]) {
  const seen = new Set<string>();
  const deduped: EvidenceLedgerItem[] = [];

  for (const item of items) {
    const key = `${item.label} ${item.detail} ${item.relation}`.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

function textMatches(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function surfaceEvidenceText(report: Report, conditions: string[], focusItems: ReviewerFocus[] | null | undefined) {
  return [
    ...report.changedFiles.map((file) => file.path),
    ...report.findings.flatMap((finding) => [finding.title, finding.category, finding.evidence, finding.action, finding.file ?? ""]),
    ...report.missingTests,
    ...report.suggestedTests.flatMap((test) => [test.title, test.description ?? ""]),
    ...conditions,
    ...report.reviewerChecklist.map((item) => item.label),
    ...(focusItems?.flatMap((item) => [item.area, item.reason]) ?? []),
    report.reviews.security.summary,
    report.reviews.reliability.summary,
    report.reviews.maintainability.summary,
    ...report.reviews.security.points,
    ...report.reviews.reliability.points,
    ...report.reviews.maintainability.points,
    report.operationalReadiness?.summary ?? "",
    ...(report.operationalReadiness?.failureModes ?? []),
    ...(report.operationalReadiness?.detectionSignals ?? []),
    ...(report.operationalReadiness?.observabilityGaps ?? []),
    ...(report.operationalReadiness?.recoveryOrRollback ?? []),
    ...(report.operationalReadiness?.customerOrDataImpact ?? []),
    ...(report.operationalReadiness?.ownerOrReviewerFocus ?? []),
  ].join(" ").toLowerCase();
}

function strongestSurfaceStatus(options: {
  report: Report;
  relatedFindings: Finding[];
  relatedConditions: string[];
  relatedMissingTests: string[];
  attention: boolean;
  readySignal?: boolean;
}): SurfaceStatus {
  const hasSevereFinding = options.relatedFindings.some((finding) => finding.severity === "HIGH" || finding.severity === "CRITICAL");

  if (options.relatedConditions.length > 0 || hasSevereFinding) return "Blocker";
  if (options.relatedMissingTests.length > 0 && options.report.verdict.recommendation === "TESTS_REQUIRED") return "Blocker";
  if (options.relatedFindings.length > 0 || options.relatedMissingTests.length > 0 || options.attention) return "Attention";
  if (options.readySignal) return "Clear";
  return "Watch";
}

function surfaceRelation(surface: AffectedSurface) {
  return `${surface.name} ${surface.reason} ${surface.evidence}`.toLowerCase().replace(/\s+/g, " ").trim();
}

function deduplicateSurfaces(surfaces: AffectedSurface[]) {
  const seen = new Set<string>();
  const deduped: AffectedSurface[] = [];

  for (const surface of surfaces) {
    const key = surfaceRelation(surface);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(surface);
  }

  return deduped;
}

function buildAffectedSurfaces(report: Report, conditions: string[], focusItems: ReviewerFocus[] | null | undefined) {
  const evidenceText = surfaceEvidenceText(report, conditions, focusItems);
  const changedFiles = report.changedFiles.map((file) => file.path);
  const surfaceDefinitions: Array<{
    name: string;
    patterns: RegExp[];
    focusAreas: string[];
    categories: string[];
    action: string;
    attention?: boolean;
    readySignal?: boolean;
  }> = [
    {
      name: "API contract",
      patterns: [/\bapi\b/, /\broute\b/, /\bendpoint\b/, /\bstatus_?code\b/, /\bjsonresponse\b/, /\bresponse shape\b/, /\berror contract\b/, /\bopenapi\b/, /\bclient-facing\b/, /\bfrontend-safe\b/],
      focusAreas: ["API contract", "Docs/API consumer review"],
      categories: ["API contract"],
      action: "Confirm client-facing response shape, status semantics and contract stability.",
    },
    {
      name: "Backend/domain logic",
      patterns: [/\bservice\b/, /\brepository\b/, /\bcontroller\b/, /\bworker\b/, /\bqueue\b/, /\bredemption\b/, /\brefund\b/, /\bpayment\b/, /\bbilling\b/, /\border\b/, /\bcheckout\b/, /\bbackend\b/, /\bserver\b/, /app\/services/, /app\/clients/],
      focusAreas: ["Payments/domain logic"],
      categories: [],
      action: "Review side effects, ownership boundaries, retry behaviour and idempotency assumptions.",
    },
    {
      name: "Data/model/migration",
      patterns: [/\bdatabase\b/, /\bmigration\b/, /\bschema\b/, /\bdata write\b/, /\bdata-write\b/, /\bmodel\b/, /\bprisma\b/, /\bsql\b/, /\brollback\b/, /migrations?\//],
      focusAreas: ["Data/migration"],
      categories: [],
      action: "Confirm migration safety, rollback path, data writes and compatibility with existing records.",
    },
    {
      name: "Auth/session",
      patterns: [/\bauth\b/, /\bauthori[sz]ation\b/, /\bpermission\b/, /\bsession\b/, /\btoken\b/, /\bjwt\b/, /\blogin\b/, /\bcredential\b/],
      focusAreas: ["Security/privacy"],
      categories: ["Security"],
      action: "Review authentication, permissions, token handling and session boundary changes.",
    },
    {
      name: "External providers",
      patterns: [/\bprovider\b/, /\bpartner\b/, /\bexternal\b/, /\bhttp\b/, /\b5xx\b/, /\btimeout\b/, /\bunavailable\b/, /\bfallback\b/],
      focusAreas: [],
      categories: [],
      action: "Verify provider failure handling, timeout behavior, retries and safe fallback boundaries.",
    },
    {
      name: "Operational readiness",
      patterns: [/\boperational\b/, /\bfailure mode\b/, /\brecovery\b/, /\brollback\b/, /\btimeout\b/, /\bretry\b/, /\bunavailable\b/, /\bincident\b/],
      focusAreas: ["Platform/observability"],
      categories: ["Reliability"],
      action: "Confirm failure modes, detection signals, recovery path and customer impact before merge.",
      attention: report.operationalReadiness?.status === "ATTENTION",
      readySignal: report.operationalReadiness?.status === "CLEAR",
    },
    {
      name: "Observability/logging",
      patterns: [/\blogger\b/, /\blogging\b/, /\blog\b/, /\bmetric\b/, /\balert\b/, /\btrace\b/, /\bmonitoring\b/, /\bobservability\b/],
      focusAreas: ["Platform/observability", "Security/privacy"],
      categories: ["Security", "Reliability"],
      action: "Check logs, metrics and alerts are useful without exposing sensitive identifiers or codes.",
    },
    {
      name: "Security/privacy",
      patterns: [/\bsecurity\b/, /\bprivacy\b/, /\buser_id\b/, /\bpartner_id\b/, /\bcustomer_id\b/, /\baccount_id\b/, /\btoken\b/, /\bsecret\b/, /\bcredential\b/, /\bpii\b/, /\bsensitive\b/, /\bexposure\b/],
      focusAreas: ["Security/privacy"],
      categories: ["Security"],
      action: "Confirm sensitive data, identifiers, credentials and error/log exposure are handled safely.",
      attention: report.reviews.security.status === "ATTENTION",
    },
    {
      name: "Frontend/client behavior",
      patterns: [/\bfrontend\b/, /\bbrowser\b/, /\breact\b/, /\bnext\.?js\b/, /\bui\b/, /\banalytics\b/, /\bsendgaevent\b/, /\.tsx\b/, /\.jsx\b/, /app\/.*page\./],
      focusAreas: ["Frontend integration"],
      categories: [],
      action: "Confirm user-facing behavior, browser compatibility, analytics semantics and consumer expectations.",
    },
    {
      name: "Tests/coverage",
      patterns: [/\btest\b/, /\bcoverage\b/, /\bmissing test\b/, /\bsuggested test\b/, /tests?\//, /\.test\./, /\.spec\./],
      focusAreas: ["Backend reliability", "Frontend integration", "API contract"],
      categories: ["Missing tests"],
      action: "Verify focused tests cover the risky behavior and merge contract conditions.",
      readySignal: report.missingTests.length === 0 && report.suggestedTests.length === 0 && changedFiles.some((file) => /tests?\//.test(file.toLowerCase()) || /\.(test|spec)\./.test(file.toLowerCase())),
    },
  ];

  const surfaces = surfaceDefinitions.flatMap((definition): AffectedSurface[] => {
    const focusMatches = focusItems?.filter((item) => definition.focusAreas.includes(item.area)) ?? [];
    const relatedFindings = report.findings.filter((finding) => (
      definition.categories.includes(finding.category)
      || textMatches(findingContext(finding).toLowerCase(), definition.patterns)
    ));
    const relatedConditions = conditions.filter((condition) => textMatches(condition.toLowerCase(), definition.patterns));
    const relatedMissingTests = report.missingTests.filter((test) => textMatches(test.toLowerCase(), definition.patterns));
    const relatedFiles = changedFiles.filter((file) => textMatches(file.toLowerCase(), definition.patterns));
    const hasSignal = textMatches(evidenceText, definition.patterns)
      || focusMatches.length > 0
      || relatedFindings.length > 0
      || relatedConditions.length > 0
      || relatedMissingTests.length > 0
      || relatedFiles.length > 0
      || Boolean(definition.readySignal);

    if (!hasSignal) return [];

    const status = strongestSurfaceStatus({
      report,
      relatedFindings,
      relatedConditions,
      relatedMissingTests,
      attention: Boolean(definition.attention),
      readySignal: definition.readySignal,
    });
    const evidence = relatedConditions[0]
      ? `Merge condition: ${relatedConditions[0]}`
      : relatedFindings[0]
        ? `${relatedFindings[0].category} finding: ${relatedFindings[0].title}`
        : relatedMissingTests[0]
          ? `Missing test: ${relatedMissingTests[0]}`
          : relatedFiles.length > 0
            ? `Changed files: ${relatedFiles.slice(0, 3).join(", ")}`
            : focusMatches[0]
              ? `Reviewer focus: ${focusMatches[0].area}`
              : definition.readySignal
                ? "No missing test gaps or open conditions detected for this surface."
                : "Signal detected in report context.";
    const reason = relatedConditions.length > 0
      ? "Included because an open merge condition touches this surface."
      : relatedFindings.length > 0
        ? "Included because a risk finding touches this surface."
        : relatedMissingTests.length > 0
          ? "Included because missing test evidence touches this surface."
          : relatedFiles.length > 0
            ? "Included because changed files suggest this surface may be affected."
            : focusMatches.length > 0
              ? "Included because reviewer focus routes attention here."
              : definition.readySignal
                ? "Included as a ready signal for the changed surface."
                : "Included because report signals reference this surface.";

    return [{
      name: definition.name,
      status,
      reason,
      evidence,
      action: definition.action,
    }];
  });

  return deduplicateSurfaces(surfaces).sort((a, b) => {
    const rank: Record<SurfaceStatus, number> = { Blocker: 4, Attention: 3, Watch: 2, Clear: 1 };
    return rank[b.status] - rank[a.status] || a.name.localeCompare(b.name);
  });
}

function SourceBadge({ source }: { source: ReportSource }) {
  return <span className={`source-badge source-badge--${source}`}>{sourceLabels[source]}</span>;
}

function firstOrFallback(items: string[], fallback: string) {
  return items.find((item) => item.trim().length > 0) ?? fallback;
}

function componentRank(status: ScoreComponentStatus) {
  if (status === "Drag") return 3;
  if (status === "Watch") return 2;
  return 1;
}

function buildReadinessScoreBreakdown({
  report,
  conditions,
  evidenceLedger,
  affectedSurfaces,
  openConditionCount,
  ownerLabel,
}: {
  report: Report;
  conditions: string[];
  evidenceLedger: ReturnType<typeof buildEvidenceLedger>;
  affectedSurfaces: AffectedSurface[];
  openConditionCount: number;
  ownerLabel: string;
}): ScoreBreakdown {
  const securityFinding = report.findings.find((finding) => finding.category === "Security");
  const securityAttention = report.reviews.security.status === "ATTENTION" || Boolean(securityFinding);
  const blockerSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Blocker").length;
  const attentionSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Attention").length;
  const watchSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Watch").length;
  const missingEvidenceCount = evidenceLedger.missing.length;
  const hasAssignedOwner = !ownerLabel.startsWith("Suggested:") && ownerLabel !== "Unassigned";

  const components: ScoreBreakdownComponent[] = [
    {
      label: "Test coverage",
      status: report.missingTests.length > 0 ? "Drag" : report.suggestedTests.length > 0 ? "Watch" : "Strong",
      explanation: report.missingTests.length > 0
        ? `${report.missingTests.length} missing coverage ${report.missingTests.length === 1 ? "gap is" : "gaps are"} still part of the merge decision.`
        : report.suggestedTests.length > 0
          ? `${report.suggestedTests.length} suggested tests remain useful before merge.`
          : "No missing test gaps are present in this report.",
      improvesWith: report.missingTests.length > 0
        ? "Add the missing focused tests and regenerate or re-check the report."
        : report.suggestedTests.length > 0
          ? "Add or consciously accept the suggested tests based on review judgment."
          : "Keep focused tests passing through CI.",
      relatedEvidence: firstOrFallback(report.missingTests, report.suggestedTests[0]?.title ?? "No missing test evidence detected."),
    },
    {
      label: "Operational readiness",
      status: report.operationalReadiness?.status === "ATTENTION" ? "Drag" : report.operationalReadiness ? "Strong" : "Watch",
      explanation: report.operationalReadiness
        ? report.operationalReadiness.summary
        : "Operational readiness was not assessed on this legacy report.",
      improvesWith: report.operationalReadiness?.status === "ATTENTION"
        ? "Document or verify detection, recovery and rollback paths for the risky behavior."
        : "Keep operational assumptions explicit during final review.",
      relatedEvidence: report.operationalReadiness
        ? firstOrFallback([
          ...report.operationalReadiness.observabilityGaps,
          ...report.operationalReadiness.recoveryOrRollback,
          ...report.operationalReadiness.failureModes,
        ], "No operational gap detected.")
        : "Regenerate the report to assess operational readiness.",
    },
    {
      label: "Security/privacy",
      status: securityAttention ? "Drag" : "Strong",
      explanation: securityAttention
        ? report.reviews.security.summary
        : "No security/privacy attention state is present in this report.",
      improvesWith: securityAttention
        ? "Confirm sensitive data, permissions, identifiers and logging are safe before merge."
        : "Keep normal security review and CI checks in place.",
      relatedEvidence: securityFinding?.title ?? firstOrFallback(report.reviews.security.points, "No security/privacy finding detected."),
    },
    {
      label: "Blast radius",
      status: blockerSurfaceCount > 0 ? "Drag" : attentionSurfaceCount > 0 || watchSurfaceCount > 2 ? "Watch" : "Strong",
      explanation: affectedSurfaces.length > 0
        ? `${affectedSurfaces.length} affected ${affectedSurfaces.length === 1 ? "surface is" : "surfaces are"} identified; ${blockerSurfaceCount} blocker and ${attentionSurfaceCount} attention surfaces.`
        : "No affected surface beyond normal review was identified.",
      improvesWith: blockerSurfaceCount > 0 || attentionSurfaceCount > 0
        ? "Resolve blocker or attention surfaces and confirm the primary review area."
        : "Keep review focused on the listed affected surfaces.",
      relatedEvidence: affectedSurfaces[0]?.evidence ?? "No affected surface evidence detected.",
    },
    {
      label: "Merge conditions",
      status: openConditionCount > 0 ? "Drag" : conditions.length > 0 ? "Watch" : "Strong",
      explanation: openConditionCount > 0
        ? `${openConditionCount} ${openConditionCount === 1 ? "condition remains" : "conditions remain"} open before this report is ready to clear.`
        : conditions.length > 0
          ? "All conditions are locally marked cleared; the recommendation is not changed automatically."
          : "No merge conditions are present.",
      improvesWith: openConditionCount > 0
        ? "Clear or explicitly resolve the remaining merge conditions."
        : "Complete normal human review and CI checks.",
      relatedEvidence: firstOrFallback(conditions, "No merge conditions detected."),
    },
    {
      label: "Evidence quality",
      status: missingEvidenceCount > 2 ? "Drag" : missingEvidenceCount > 0 ? "Watch" : "Strong",
      explanation: missingEvidenceCount > 0
        ? `${missingEvidenceCount} missing evidence ${missingEvidenceCount === 1 ? "item needs" : "items need"} confirmation in the evidence ledger.`
        : "Evidence ledger has no missing evidence items.",
      improvesWith: missingEvidenceCount > 0
        ? "Add the missing proof through tests, review confirmation or documented operational controls."
        : "Keep evidence linked to findings, tests and conditions.",
      relatedEvidence: evidenceLedger.missing[0]?.detail ?? evidenceLedger.found[0]?.detail ?? "No evidence ledger item available.",
    },
    {
      label: "Reviewer confidence",
      status: report.verdict.confidence === "LOW" ? "Drag" : hasAssignedOwner || report.verdict.confidence === "HIGH" ? "Strong" : "Watch",
      explanation: hasAssignedOwner
        ? `${ownerLabel} is selected as the local owner cue. Report confidence is ${report.verdict.confidence}.`
        : `Report confidence is ${report.verdict.confidence}; owner routing is still a local cue.`,
      improvesWith: hasAssignedOwner
        ? "Have the selected owner complete the focused review and update local state."
        : "Assign a local owner cue and complete the focused review path.",
      relatedEvidence: ownerLabel,
    },
  ];

  const strongestPositiveSignal = components.find((component) => component.status === "Strong")?.label ?? "No strong positive signal detected";
  const biggestScoreDrag = [...components].sort((a, b) => componentRank(b.status) - componentRank(a.status))[0];
  const nextAction = components.find((component) => component.status === "Drag")?.improvesWith
    ?? components.find((component) => component.status === "Watch")?.improvesWith
    ?? "Complete normal human review and CI checks.";

  return {
    strongestPositiveSignal,
    biggestScoreDrag: biggestScoreDrag ? `${biggestScoreDrag.label}: ${biggestScoreDrag.explanation}` : "No major score drag detected.",
    nextAction,
    components,
  };
}

function EvidenceLedgerCard({ item }: { item: EvidenceLedgerItem }) {
  return (
    <article className="evidence-ledger-card">
      <div className="evidence-ledger-card-header">
        <span className={`evidence-impact evidence-impact--${item.impact.toLowerCase().replaceAll(" ", "-")}`}>{item.impact}</span>
        <span>{item.relation}</span>
      </div>
      <h3>{item.label}</h3>
      <p>{item.detail}</p>
    </article>
  );
}

function AffectedSurfaceCard({ surface }: { surface: AffectedSurface }) {
  return (
    <article className="affected-surface-card">
      <div className="affected-surface-card-header">
        <h3>{surface.name}</h3>
        <span className={`surface-status surface-status--${surface.status.toLowerCase()}`}>{surface.status}</span>
      </div>
      <p>{surface.reason}</p>
      <div className="affected-surface-evidence">
        <span>Evidence</span>
        <strong>{surface.evidence}</strong>
      </div>
      <div className="affected-surface-action">
        <span>Reviewer action</span>
        <p>{surface.action}</p>
      </div>
    </article>
  );
}

export default function ReportPage() {
  const [displayedReport, setDisplayedReport] = useState<{ report: Report; source: ReportSource }>({
    report: demoReport,
    source: "demo",
  });
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [conditionsCopyState, setConditionsCopyState] = useState<CopyState>("idle");
  const [mergeSummaryCopyState, setMergeSummaryCopyState] = useState<CopyState>("idle");
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [clearedConditionKeys, setClearedConditionKeys] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(null);
  const [includeLocalNoteInMergeSummary, setIncludeLocalNoteInMergeSummary] = useState(false);
  const [reviewState, setReviewState] = useState<ReportReviewState>(() => defaultReviewState(demoReport));
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryEvent[]>(() => initialDecisionHistory(demoReport));
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conditionsCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergeSummaryCopyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteHistoryBaselineRef = useRef("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") === "1") return;

    const storedReport = sessionStorage.getItem(GENERATED_REPORT_STORAGE_KEY);

    if (!storedReport) return;

    try {
      const parsedReport: unknown = JSON.parse(storedReport);

      if (isStoredReport(parsedReport)) {
        setDisplayedReport(parsedReport);
        return;
      }

      if (isReport(parsedReport)) {
        setDisplayedReport({ report: parsedReport, source: "deterministic" });
        return;
      }

      sessionStorage.removeItem(GENERATED_REPORT_STORAGE_KEY);
    } catch {
      sessionStorage.removeItem(GENERATED_REPORT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => () => {
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    if (conditionsCopyResetTimer.current) clearTimeout(conditionsCopyResetTimer.current);
    if (mergeSummaryCopyResetTimer.current) clearTimeout(mergeSummaryCopyResetTimer.current);
    if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
  }, []);

  const { report, source } = displayedReport;
  const { pr, verdict } = report;
  const supportedReviewerFocus = pruneUnsupportedReviewerFocus(report);
  const activePolicy = reviewPolicyForProfile(pr.reviewProfile);
  const activePolicyStatus = policyStatusForReport(report, activePolicy);
  const decisionHistoryKey = decisionHistoryKeyForReport(report);
  const displayedConditions = reportConditions(report);
  const selectedFinding = selectedFindingIndex !== null ? report.findings[selectedFindingIndex] : undefined;
  const selectedFindingFiles = selectedFinding ? affectedFilesForFinding(report, selectedFinding) : [];
  const selectedFindingMissingTest = selectedFinding ? bestRelatedText(selectedFinding, report.missingTests) : null;
  const selectedFindingCondition = selectedFinding ? bestRelatedText(selectedFinding, displayedConditions) : null;
  const selectedFindingReviewerFocus = selectedFinding && supportedReviewerFocus
    ? reviewerFocusForFinding(selectedFinding, supportedReviewerFocus)
    : null;
  const displayedConditionSignature = displayedConditions.join("\n");
  const conditionTrackingEnabled = (verdict.recommendation === "TESTS_REQUIRED" || verdict.recommendation === "REVIEW_REQUIRED")
    && displayedConditions.length > 0;
  const clearedConditionCount = displayedConditions.filter((condition) => clearedConditionKeys.has(conditionKey(condition))).length;
  const findingTitles = report.findings.map((finding) => finding.title);
  const cleanApprove = verdict.recommendation === "APPROVE"
    && report.findings.length === 0
    && report.missingTests.length === 0
    && report.suggestedTests.length === 0
    && report.operationalReadiness?.status === "CLEAR";
  const displayedReviewerChecklist = cleanApprove ? [] : report.reviewerChecklist;
  const conditionProgressLabel = conditionProgressSummary(clearedConditionCount, displayedConditions.length);
  const openConditionCount = Math.max(displayedConditions.length - clearedConditionCount, 0);
  const lastDecisionUpdate = decisionHistory[0]?.timestamp ?? reviewState.updatedAt;
  const operationalStatus = report.operationalReadiness?.status ?? "Not assessed";
  const qualityStatus = report.reportQuality?.status ?? "Not assessed";
  const suggestedOwners = suggestedReviewerOwners(report);
  const displayedOwner = ownerDisplay(reviewState.owner, suggestedOwners);
  const reviewerFocusSummary = supportedReviewerFocus
    ? supportedReviewerFocus.length > 0
      ? `${supportedReviewerFocus.length} ${supportedReviewerFocus.length === 1 ? "area" : "areas"} / ${supportedReviewerFocus[0].area}`
      : "No specialist focus"
    : "Not assessed";
  const mergeSummaryMarkdown = mergeSummaryToMarkdown(report, {
    sourceLabel: sourceLabels[source],
    reviewState,
    includeLocalNote: includeLocalNoteInMergeSummary,
  });
  const evidenceLedger = buildEvidenceLedger(report, displayedConditions, supportedReviewerFocus);
  const affectedSurfaces = buildAffectedSurfaces(report, displayedConditions, supportedReviewerFocus);
  const readinessScoreBreakdown = buildReadinessScoreBreakdown({
    report,
    conditions: displayedConditions,
    evidenceLedger,
    affectedSurfaces,
    openConditionCount,
    ownerLabel: displayedOwner,
  });
  const blockerSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Blocker").length;
  const confirmationSurfaceCount = affectedSurfaces.filter((surface) => surface.status === "Attention" || surface.status === "Watch").length;
  const primaryAffectedSurface = affectedSurfaces[0]?.name ?? "No affected surface detected";
  const readinessConclusion = displayedConditions.length === 0
    ? "No merge conditions detected. Complete normal human review and CI checks."
    : openConditionCount === 0
      ? "All merge contract conditions are locally marked cleared. Recommendation is not changed automatically."
      : `${openConditionCount} ${openConditionCount === 1 ? "merge condition remains" : "merge conditions remain"} open before this report is ready to clear.`;
  const reportTabs: Array<{ id: ReportTab; label: string; indicator: string }> = [
    { id: "overview", label: "Overview", indicator: `${displayedConditions.length}` },
    { id: "timeline", label: "Timeline", indicator: `${decisionHistory.length}` },
    { id: "evidence", label: "Evidence", indicator: `${evidenceLedger.missing.length}` },
    { id: "blast-radius", label: "Surfaces", indicator: `${affectedSurfaces.length}` },
    { id: "findings", label: "Findings", indicator: `${report.findings.length}` },
    { id: "tests", label: "Tests", indicator: `${report.missingTests.length}` },
    { id: "operations", label: "Operations", indicator: operationalStatus === "ATTENTION" ? "Attention" : "Clear" },
    { id: "review-focus", label: "Review focus", indicator: supportedReviewerFocus ? `${supportedReviewerFocus.length}` : "Legacy" },
    { id: "changed-files", label: "Changed files", indicator: `${report.changedFiles.length}` },
    { id: "export", label: "Export", indicator: "MD" },
  ];

  useEffect(() => {
    try {
      setClearedConditionKeys(readConditionProgress(window.localStorage, report, displayedConditions));
    } catch {
      setClearedConditionKeys(new Set());
    }
  }, [report, displayedConditionSignature]);

  useEffect(() => {
    setSelectedFindingIndex((current) => (
      current !== null && current >= report.findings.length ? null : current
    ));
  }, [report]);

  useEffect(() => {
    try {
      const savedState = readReviewState(window.localStorage, report);
      setReviewState(savedState);
      noteHistoryBaselineRef.current = savedState.note;
    } catch {
      const fallbackState = defaultReviewState(report);
      setReviewState(fallbackState);
      noteHistoryBaselineRef.current = fallbackState.note;
    }
  }, [report]);

  useEffect(() => {
    try {
      setDecisionHistory(ensureDecisionHistory(window.localStorage, decisionHistoryKey, report));
    } catch {
      setDecisionHistory(initialDecisionHistory(report));
    }
  }, [report, decisionHistoryKey]);

  function recordDecisionEvent(event: Parameters<typeof appendDecisionHistoryEvent>[2]) {
    try {
      setDecisionHistory(appendDecisionHistoryEvent(window.localStorage, decisionHistoryKey, event));
    } catch {
      setDecisionHistory((current) => [{
        id: `local-${Date.now()}`,
        type: event.type,
        title: event.title,
        timestamp: event.timestamp ?? new Date().toISOString(),
        detail: event.detail,
        previousState: event.previousState,
        nextState: event.nextState,
        label: event.label ?? "Local",
      }, ...current].slice(0, 60));
    }
  }

  function updateReviewState(nextState: ReportReviewState) {
    try {
      const savedState = writeReviewState(window.localStorage, reviewStateKeyForReport(report), nextState);
      setReviewState(savedState);
      return savedState;
    } catch {
      setReviewState(nextState);
      return nextState;
    }
  }

  function updateReviewStatus(status: ReviewStatus) {
    const previousStatus = reviewState.status;
    const savedState = updateReviewState({ ...reviewState, status });

    if (previousStatus !== savedState.status) {
      recordDecisionEvent(reviewStatusChangeEvent(previousStatus, savedState.status));
    }
  }

  function updateReviewOwner(owner: ReviewerOwner) {
    const previousOwner = reviewState.owner;
    const savedState = updateReviewState({ ...reviewState, owner });

    if (previousOwner !== savedState.owner) {
      recordDecisionEvent(ownershipChangeEvent(previousOwner, savedState.owner));
    }
  }

  function updateReviewNote(note: string) {
    updateReviewState({ ...reviewState, note });
  }

  function handleReviewNoteBlur() {
    const previousNote = noteHistoryBaselineRef.current.trim();
    const nextNote = reviewState.note.trim();
    if (previousNote === nextNote) return;

    noteHistoryBaselineRef.current = reviewState.note;
    recordDecisionEvent({
      type: "reviewer-note-updated",
      title: "Local reviewer note updated",
      detail: nextNote.length > 0
        ? "A private reviewer note was updated locally on this device."
        : "The local reviewer note was cleared.",
      label: "Local",
    });
  }

  function toggleCondition(condition: string, checked: boolean) {
    const nextConditionKeys = new Set(clearedConditionKeys);
    const key = conditionKey(condition);

    if (checked) {
      nextConditionKeys.add(key);
    } else {
      nextConditionKeys.delete(key);
    }

    setClearedConditionKeys(nextConditionKeys);

    try {
      writeConditionProgress(window.localStorage, report, displayedConditions, nextConditionKeys);
    } catch {
      // Condition tracking is local-only and should not affect report rendering.
    }

    recordDecisionEvent({
      type: checked ? "condition-cleared" : "condition-reopened",
      title: checked ? "Condition cleared" : "Condition reopened",
      detail: condition,
      previousState: checked ? "Open" : "Cleared",
      nextState: checked ? "Cleared" : "Open",
      label: "Local",
    });
  }

  async function handleCopySummary() {
    const copied = await writeToClipboard(reportToMarkdown(report, sourceLabels[source]));
    setCopyState(copied ? "copied" : "failed");

    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    copyResetTimer.current = setTimeout(() => setCopyState("idle"), 2_000);
  }

  async function handleCopyConditions() {
    const copied = await writeToClipboard(conditionsToMarkdown(report));
    setConditionsCopyState(copied ? "copied" : "failed");

    if (conditionsCopyResetTimer.current) clearTimeout(conditionsCopyResetTimer.current);
    conditionsCopyResetTimer.current = setTimeout(() => setConditionsCopyState("idle"), 2_000);
  }

  async function handleCopyMergeSummary() {
    const copied = await writeToClipboard(mergeSummaryMarkdown);
    setMergeSummaryCopyState(copied ? "copied" : "failed");

    if (copied) {
      recordDecisionEvent({
        type: "merge-summary-copied",
        title: "Merge summary copied",
        detail: "PR-ready merge-readiness Markdown was copied locally for handoff.",
        label: "Local",
      });
    }

    if (mergeSummaryCopyResetTimer.current) clearTimeout(mergeSummaryCopyResetTimer.current);
    mergeSummaryCopyResetTimer.current = setTimeout(() => setMergeSummaryCopyState("idle"), 2_000);
  }

  function handleDownloadMarkdown() {
    const markdown = reportToMarkdown(report, sourceLabels[source]);
    const downloaded = downloadMarkdown(markdown, reportMarkdownFilename(report));
    setDownloadState(downloaded ? "downloaded" : "failed");

    if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
    downloadResetTimer.current = setTimeout(() => setDownloadState("idle"), 2_000);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true">◢</span>
          <span>Lintel</span>
        </a>
        <nav className="side-nav report-side-nav-clean" aria-label="Primary navigation">
          <a className="nav-item" href="/new">New report</a>
          <a className={`nav-item${source !== "demo" ? " nav-item--active" : ""}`} href="/workspace">Risk inbox</a>
          <a className="nav-item" href="/review-operations">Review operations</a>
          <a className={`nav-item${source === "demo" ? " nav-item--active" : ""}`} href="/report?demo=1">Demo report</a>
          <a className="nav-item" href="/review-policies">Review policies</a>
          <a className="nav-item" href="/settings">Analysis settings</a>
          <a className="nav-item" href="/github-action">GitHub Action</a>
          <a className="nav-item" href="/slack-handoff">Slack handoff</a>
          <a className="nav-item" href="/docs/security-model.md">Security model</a>
        </nav>
        <nav className="side-nav report-side-nav-legacy" aria-label="Legacy navigation">
          <a className="nav-item" href="/new"><span aria-hidden="true">＋</span>New report</a>
          <a className={`nav-item${source !== "demo" ? " nav-item--active" : ""}`} href="/workspace"><span aria-hidden="true">▦</span>Reports workspace</a>
          <a className={`nav-item${source === "demo" ? " nav-item--active" : ""}`} href="/report?demo=1"><span aria-hidden="true">◇</span>Demo report</a>
        </nav>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Engineering</span></div>
          <span aria-hidden="true">⌄</span>
        </div>
      </aside>

      <main className="main-content report-surface" id="report">
        <header className="topbar">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a href="#repository">{pr.project}</a><span>/</span><a href="#overview">Reports</a><span>/</span><strong>PR #{pr.number}</strong>
          </nav>
          <div className="topbar-actions">
            <SourceBadge source={source} />
            <button
              className={`copy-summary-button copy-summary-button--${copyState}`}
              type="button"
              onClick={handleCopySummary}
              aria-live="polite"
            >
              {copyLabels[copyState]}
            </button>
            <button
              className={`download-markdown-button download-markdown-button--${downloadState}`}
              type="button"
              onClick={handleDownloadMarkdown}
              aria-live="polite"
            >
              {downloadLabels[downloadState]}
            </button>
            <span className="sync-status"><i /> Analysed {pr.updatedAt}</span>
            <button className="icon-button" aria-label="More report actions">•••</button>
          </div>
        </header>

        <div className="report-working-layout">
          <div className="report-content">
          <nav className="report-tabs" aria-label="Report sections" role="tablist">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                id={`report-tab-${tab.id}`}
                className={activeTab === tab.id ? "report-tab report-tab--active" : "report-tab"}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`report-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <strong>{tab.indicator}</strong>
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <div
              className="report-tab-panel report-tab-panel--overview"
              id="report-panel-overview"
              role="tabpanel"
              aria-labelledby="report-tab-overview"
            >
          <section className="report-header" id="overview">
            <div className="header-copy">
              <div className="header-overline"><span className="pull-request-mark">↗</span> PULL REQUEST #{pr.number}</div>
              <h1>{pr.title}</h1>
              <div className="report-meta">
                <span>{pr.repository}</span><span className="meta-separator">•</span><span>{inputSourceLabel(pr.branch)}</span><span className="meta-separator">•</span><span>Mode: {reviewProfileLabel(pr.reviewProfile)}</span><span className="meta-separator">•</span><span>{pr.language}</span><span className="meta-separator">•</span><span>{pr.framework}</span>
              </div>
            </div>
            <div className="header-verdict">
              <RecommendationBadge recommendation={verdict.recommendation} />
              <span className="verdict-caption">Merge recommendation</span>
            </div>
          </section>

          <section className="overview-grid" aria-label="Report overview">
            <article className="score-card">
              <div>
                <span className="card-kicker">RISK BAND</span>
                <strong className={`risk-band risk-band--${verdict.riskLevel.toLowerCase()}`}>{verdict.riskLevel} RISK</strong>
                <span className="risk-score-detail">Score detail: {verdict.riskScore}/100</span>
              </div>
            </article>
            <article className="summary-card">
              <div className="section-heading"><div><span className="card-kicker">EXECUTIVE SUMMARY</span><h2>{recommendationHeadings[verdict.recommendation]}</h2></div><span className="confidence">Confidence: {verdict.confidence}</span></div>
              <p>{verdict.summary}</p>
            </article>
          </section>

          <section className="section-block report-score-breakdown" aria-labelledby="score-breakdown-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">READINESS SCORE</span>
                <h2 id="score-breakdown-title">Why this score looks the way it does</h2>
              </div>
              <span className="section-count">Heuristic / not production-calibrated</span>
            </div>

            <div className="score-breakdown-summary" aria-label="Readiness score summary">
              <article>
                <span>Current score</span>
                <strong>{verdict.riskLevel} · {verdict.riskScore}/100</strong>
              </article>
              <article>
                <span>Strongest positive signal</span>
                <strong>{readinessScoreBreakdown.strongestPositiveSignal}</strong>
              </article>
              <article>
                <span>Biggest score drag</span>
                <strong>{readinessScoreBreakdown.biggestScoreDrag}</strong>
              </article>
              <article>
                <span>Next readiness action</span>
                <strong>{readinessScoreBreakdown.nextAction}</strong>
              </article>
            </div>

            <div className="score-breakdown-components">
              {readinessScoreBreakdown.components.map((component) => (
                <article className={`score-component score-component--${component.status.toLowerCase()}`} key={component.label}>
                  <div className="score-component-header">
                    <h3>{component.label}</h3>
                    <span>{component.status}</span>
                  </div>
                  <p>{component.explanation}</p>
                  <dl>
                    <div>
                      <dt>Improves with</dt>
                      <dd>{component.improvesWith}</dd>
                    </div>
                    <div>
                      <dt>Related evidence</dt>
                      <dd>{component.relatedEvidence}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="merge-conditions" aria-labelledby="merge-conditions-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">DECISION GATE</span>
                <h2 id="merge-conditions-title">Conditions before merge</h2>
                {conditionTrackingEnabled && <span className="condition-progress">{conditionProgressSummary(clearedConditionCount, displayedConditions.length)}</span>}
              </div>
              <div className="merge-conditions-actions">
                <RecommendationBadge recommendation={verdict.recommendation} />
                <button
                  className={`copy-conditions-button copy-conditions-button--${conditionsCopyState}`}
                  type="button"
                  onClick={handleCopyConditions}
                  aria-live="polite"
                >
                  {copyConditionsLabels[conditionsCopyState]}
                </button>
              </div>
            </div>
            {conditionTrackingEnabled ? (
              <>
                <ul className="condition-checklist">
                  {displayedConditions.map((condition) => {
                    const key = conditionKey(condition);
                    const checked = clearedConditionKeys.has(key);

                    return (
                      <li key={condition}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => toggleCondition(condition, event.target.checked)}
                          />
                          <span>{condition}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className="condition-local-note">Track locally. Condition progress is stored on this device.</p>
              </>
            ) : displayedConditions.length > 0 ? (
              <ol>{displayedConditions.map((condition) => <li key={condition}>{condition}</li>)}</ol>
            ) : <p className="merge-conditions-clear">No merge conditions detected.</p>}
          </section>

          <section className="section-block report-ownership-cues">
            <div className="section-heading">
              <div><span className="card-kicker">LOCAL OWNERSHIP</span><h2>Who should look next?</h2></div>
              <span className="section-count">Stored locally</span>
            </div>
            <div className="ownership-cue-grid">
              <article>
                <span>Selected owner</span>
                <strong>{reviewState.owner}</strong>
                <p>This is a local cue only. Lintel is not assigning a real person or notifying a team.</p>
              </article>
              <article>
                <span>Suggested owner cues</span>
                <strong>{suggestedOwners.length > 0 ? suggestedOwners.join(" / ") : "No specialist cue"}</strong>
                <p>Derived from findings, missing tests, operational readiness, reviewer focus and affected surfaces.</p>
              </article>
            </div>
          </section>
            </div>
          )}

          {activeTab === "timeline" && (
            <div
              className="report-tab-panel"
              id="report-panel-timeline"
              role="tabpanel"
              aria-labelledby="report-tab-timeline"
            >
          <section className="section-block report-decision-history" aria-labelledby="decision-history-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">LOCAL DECISION HISTORY</span>
                <h2 id="decision-history-title">PR readiness timeline</h2>
              </div>
              <span className="section-count">Stored locally on this device</span>
            </div>

            <div className="timeline-summary-grid" aria-label="Readiness timeline summary">
              <article>
                <span>Current review state</span>
                <strong>{reviewState.status}</strong>
              </article>
              <article>
                <span>Local owner</span>
                <strong>{displayedOwner}</strong>
              </article>
              <article>
                <span>Conditions cleared</span>
                <strong>{displayedConditions.length === 0 ? "None needed" : `${clearedConditionCount}/${displayedConditions.length}`}</strong>
              </article>
              <article>
                <span>Open conditions</span>
                <strong>{openConditionCount}</strong>
              </article>
              <article>
                <span>Last local update</span>
                <strong>{lastDecisionUpdate ? timelineTime(lastDecisionUpdate) : "No local changes yet"}</strong>
              </article>
            </div>

            <p className="timeline-local-note">This is local-only decision history for the current browser. It is not team audit logging and is not sent to an API.</p>

            <ol className="decision-timeline">
              {decisionHistory.map((event) => (
                <li key={event.id}>
                  <div className="decision-timeline-marker" aria-hidden="true" />
                  <article>
                    <div className="decision-timeline-header">
                      <div>
                        <h3>{event.title}</h3>
                        <time dateTime={event.timestamp}>{timelineTime(event.timestamp)}</time>
                      </div>
                      <span>{event.label}</span>
                    </div>
                    {(event.previousState || event.nextState) && (
                      <div className="decision-timeline-state">
                        {event.previousState && <span>{event.previousState}</span>}
                        {event.previousState && event.nextState && <strong>→</strong>}
                        {event.nextState && <span>{event.nextState}</span>}
                      </div>
                    )}
                    <p>{event.detail}</p>
                  </article>
                </li>
              ))}
            </ol>
          </section>
            </div>
          )}

          {activeTab === "evidence" && (
            <div
              className="report-tab-panel"
              id="report-panel-evidence"
              role="tabpanel"
              aria-labelledby="report-tab-evidence"
            >
          <section className="section-block report-evidence-ledger" aria-labelledby="evidence-ledger-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">EXPLAINABILITY</span>
                <h2 id="evidence-ledger-title">Evidence ledger</h2>
              </div>
              <span className="section-count">{evidenceLedger.found.length} found / {evidenceLedger.missing.length} missing</span>
            </div>

            <div className="evidence-summary-grid" aria-label="Evidence summary">
              <article>
                <span>Evidence found</span>
                <strong>{evidenceLedger.found.length}</strong>
              </article>
              <article>
                <span>Missing evidence</span>
                <strong>{evidenceLedger.missing.length}</strong>
              </article>
              <article>
                <span>Open conditions</span>
                <strong>{openConditionCount}</strong>
              </article>
              <article>
                <span>Readiness conclusion</span>
                <p>{readinessConclusion}</p>
              </article>
            </div>

            <div className="evidence-ledger-grid">
              <section className="evidence-ledger-column" aria-labelledby="evidence-found-title">
                <div className="evidence-ledger-column-heading">
                  <h3 id="evidence-found-title">Evidence found</h3>
                  <span>Supports the current decision</span>
                </div>
                {evidenceLedger.found.length > 0 ? (
                  <div className="evidence-ledger-list">
                    {evidenceLedger.found.map((item) => <EvidenceLedgerCard item={item} key={`${item.label}-${item.detail}`} />)}
                  </div>
                ) : (
                  <p className="section-empty">No supporting evidence was identified in this legacy report.</p>
                )}
              </section>

              <section className="evidence-ledger-column" aria-labelledby="evidence-missing-title">
                <div className="evidence-ledger-column-heading">
                  <h3 id="evidence-missing-title">Evidence missing</h3>
                  <span>Blocks or needs confirmation before merge</span>
                </div>
                {evidenceLedger.missing.length > 0 ? (
                  <div className="evidence-ledger-list">
                    {evidenceLedger.missing.map((item) => <EvidenceLedgerCard item={item} key={`${item.label}-${item.detail}`} />)}
                  </div>
                ) : (
                  <p className="section-empty section-empty--positive">No missing evidence detected.</p>
                )}
              </section>
            </div>
          </section>

          <section className="section-block report-merge-contract" aria-labelledby="merge-contract-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">MERGE CONTRACT</span>
                <h2 id="merge-contract-title">What must be true before merge</h2>
                {conditionTrackingEnabled && <span className="condition-progress">{conditionProgressLabel}</span>}
              </div>
              <RecommendationBadge recommendation={verdict.recommendation} />
            </div>

            {conditionTrackingEnabled ? (
              <>
                <ul className="merge-contract-list">
                  {displayedConditions.map((condition) => {
                    const key = conditionKey(condition);
                    const checked = clearedConditionKeys.has(key);

                    return (
                      <li key={condition}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => toggleCondition(condition, event.target.checked)}
                          />
                          <span>{condition}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <p className="condition-local-note">Stored locally on this device. Clearing every item does not automatically change the recommendation.</p>
              </>
            ) : displayedConditions.length > 0 ? (
              <ol className="merge-contract-list merge-contract-list--static">
                {displayedConditions.map((condition) => <li key={condition}>{condition}</li>)}
              </ol>
            ) : (
              <p className="merge-contract-clear">No merge conditions detected.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "blast-radius" && (
            <div
              className="report-tab-panel"
              id="report-panel-blast-radius"
              role="tabpanel"
              aria-labelledby="report-tab-blast-radius"
            >
          <section className="section-block report-blast-radius" aria-labelledby="blast-radius-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">BLAST RADIUS</span>
                <h2 id="blast-radius-title">Affected surfaces</h2>
              </div>
              <span className="section-count">{affectedSurfaces.length} surfaces</span>
            </div>

            <div className="surface-summary-grid" aria-label="Blast radius summary">
              <article>
                <span>Affected surfaces</span>
                <strong>{affectedSurfaces.length}</strong>
              </article>
              <article>
                <span>Blocker surfaces</span>
                <strong>{blockerSurfaceCount}</strong>
              </article>
              <article>
                <span>Need confirmation</span>
                <strong>{confirmationSurfaceCount}</strong>
              </article>
              <article>
                <span>Primary review area</span>
                <p>{primaryAffectedSurface}</p>
              </article>
            </div>

            {affectedSurfaces.length > 0 ? (
              <div className="affected-surfaces-grid">
                {affectedSurfaces.map((surface) => (
                  <AffectedSurfaceCard surface={surface} key={`${surface.name}-${surface.status}-${surface.evidence}`} />
                ))}
              </div>
            ) : (
              <p className="section-empty section-empty--positive">No affected surface detected beyond normal human review and CI checks.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "findings" && (
            <div
              className="report-tab-panel"
              id="report-panel-findings"
              role="tabpanel"
              aria-labelledby="report-tab-findings"
            >
          <section className="section-block report-findings">
            <div className="section-heading"><div><span className="card-kicker">PRIORITY ITEMS</span><h2>Risk findings</h2></div><span className="section-count">{report.findings.length} findings</span></div>
            {report.findings.length > 0 ? (
              <div className="findings-workspace">
                <div className="findings-list" aria-label="Selectable findings">
                  {report.findings.map((finding, index) => {
                    const selected = selectedFindingIndex === index;

                    return (
                      <article
                        className={selected ? "finding finding--selectable finding--selected" : "finding finding--selectable"}
                        key={`${finding.title}-${index}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        aria-label={`Inspect finding: ${finding.title}`}
                        onClick={() => setSelectedFindingIndex(index)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedFindingIndex(index);
                          }
                        }}
                      >
                        <div className="finding-index">{String(index + 1).padStart(2, "0")}</div>
                        <div className="finding-content">
                          <div className="finding-title">
                            <SeverityTag severity={finding.severity} />
                            <h3>{finding.title}</h3>
                            {finding.provenance && <span className={`finding-provenance finding-provenance--${findingProvenanceLabel(finding.provenance).toLowerCase().replaceAll(" ", "-")}`}>{findingProvenanceLabel(finding.provenance)}</span>}
                          </div>
                          <p><strong>Evidence:</strong> {finding.evidence}</p>
                          <p><strong>Action:</strong> {finding.action}</p>
                          {finding.file && <code>{finding.file}</code>}
                          <span className="finding-inspect-hint">{selected ? "Selected" : "Inspect evidence"}</span>
                        </div>
                        <span className="finding-category">{finding.category}</span>
                      </article>
                    );
                  })}
                </div>

                <aside className="finding-detail-panel" aria-label="Finding evidence panel">
                  {selectedFinding ? (
                    <>
                      <div className="finding-detail-header">
                        <div>
                          <span className="card-kicker">EVIDENCE PANEL</span>
                          <h3>{selectedFinding.title}</h3>
                        </div>
                        <button type="button" onClick={() => setSelectedFindingIndex(null)}>Close</button>
                      </div>

                      <div className="finding-detail-tags">
                        <SeverityTag severity={selectedFinding.severity} />
                        <span>{selectedFinding.category}</span>
                        {selectedFinding.provenance && <span>{findingProvenanceLabel(selectedFinding.provenance)}</span>}
                      </div>

                      <section>
                        <h4>Why this matters</h4>
                        <p>{selectedFinding.evidence}</p>
                      </section>

                      <section>
                        <h4>Recommended reviewer action</h4>
                        <p>{selectedFinding.action}</p>
                      </section>

                      <div className="finding-detail-grid">
                        <section>
                          <h4>Affected files or areas</h4>
                          {selectedFindingFiles.length > 0 ? (
                            <ul>{selectedFindingFiles.map((file) => <li key={file}><code>{file}</code></li>)}</ul>
                          ) : (
                            <p>No specific file was attached to this finding.</p>
                          )}
                        </section>

                        <section>
                          <h4>Related missing test</h4>
                          <p>{selectedFindingMissingTest ?? "No directly related missing test was identified."}</p>
                        </section>

                        <section>
                          <h4>Related merge condition</h4>
                          <p>{selectedFindingCondition ?? "No directly related merge condition was identified."}</p>
                        </section>

                        <section>
                          <h4>Reviewer focus</h4>
                          {selectedFindingReviewerFocus ? (
                            <p><strong>{selectedFindingReviewerFocus.area}:</strong> {selectedFindingReviewerFocus.reason}</p>
                          ) : (
                            <p>No specialist reviewer focus was matched to this finding.</p>
                          )}
                        </section>
                      </div>
                    </>
                  ) : (
                    <div className="finding-detail-empty">
                      <span className="card-kicker">EVIDENCE PANEL</span>
                      <h3>Select a finding to inspect the evidence.</h3>
                      <p>Use this panel to review the finding evidence, recommended action, affected files, related tests, merge conditions and reviewer focus without leaving the Findings tab.</p>
                    </div>
                  )}
                </aside>
              </div>
            ) : <p className="section-empty">No risk findings detected.</p>}
          </section>
            </div>
          )}

          {activeTab === "tests" && (
            <div
              className="report-tab-panel"
              id="report-panel-tests"
              role="tabpanel"
              aria-labelledby="report-tab-tests"
            >
          <section className="section-block report-test-plan">
            <div className="section-heading"><div><span className="card-kicker">VERIFICATION</span><h2>Test plan</h2></div><span className="section-count">{report.missingTests.length} gaps · {report.suggestedTests.length} tests</span></div>
            <div className="test-plan-grid">
              <article className="test-plan-panel">
                <h3>Missing coverage</h3>
                {report.missingTests.length > 0 ? (
                  <ol className="numbered-list">
                    {report.missingTests.map((test, index) => <li key={test}><span>{String(index + 1).padStart(2, "0")}</span>{test}</li>)}
                  </ol>
                ) : <p className="missing-tests-empty">{cleanApprove || source === "ai" ? "No missing test gaps detected." : "No missing test gaps detected by local rules."}</p>}
              </article>
              <article className="test-plan-panel">
                <h3>Suggested tests</h3>
                {report.suggestedTests.length > 0 ? (
                  <div className="suggested-tests">
                    {report.suggestedTests.map((test) => <article className="suggested-test" key={test.title}>{test.priority && <span className={`test-priority test-priority--${test.priority.toLowerCase()}`}>{test.priority}</span>}<h3>{test.title}</h3>{test.description && <p>{test.description}</p>}</article>)}
                  </div>
                ) : <p className="section-empty">No additional tests suggested.</p>}
              </article>
              {cleanApprove ? (
                <article className="test-plan-panel test-plan-panel--checklist">
                  <h3>Reviewer checklist</h3>
                  <p className="section-empty">No reviewer checklist items required.</p>
                </article>
              ) : displayedReviewerChecklist.length > 0 && (
                <article className="test-plan-panel test-plan-panel--checklist">
                  <h3>Reviewer checklist</h3>
                  <ul className="checklist">
                    {displayedReviewerChecklist.map((item) => <li key={item.label}><span className={`check-icon check-icon--${item.status.toLowerCase()}`}>{item.status === "COMPLETE" ? "✓" : "!"}</span><span>{item.label}</span></li>)}
                  </ul>
                </article>
              )}
            </div>
          </section>
            </div>
          )}

          {activeTab === "operations" && (
            <div
              className="report-tab-panel"
              id="report-panel-operations"
              role="tabpanel"
              aria-labelledby="report-tab-operations"
            >
          <section className="section-block report-operational-readiness">
            <div className="section-heading"><div><span className="card-kicker">OPERATIONS</span><h2>Operational readiness</h2></div></div>
            {report.operationalReadiness ? (
              <div className="operational-panel">
                <div className="operational-overview">
                  <p>{report.operationalReadiness.summary}</p>
                  <span className={`review-status review-status--${report.operationalReadiness.status.toLowerCase()}`}>{report.operationalReadiness.status}</span>
                </div>
                <div className="operational-grid">
                  <OperationalArea title="Failure modes" items={deduplicateReportItems(report.operationalReadiness.failureModes)} emptyCopy="No explicit failure mode detected." />
                  <OperationalArea title="Detection signals" items={deduplicateReportItems(report.operationalReadiness.detectionSignals)} emptyCopy="No explicit detection signal required by detected rules." />
                  <OperationalArea title="Observability gaps" items={deduplicateReportItems(report.operationalReadiness.observabilityGaps)} emptyCopy="No observability gap detected." />
                  <OperationalArea title="Recovery or rollback" items={deduplicateReportItems(report.operationalReadiness.recoveryOrRollback)} emptyCopy="No recovery or rollback gap detected." />
                  <OperationalArea title="Customer or data impact" items={deduplicateReportItems(report.operationalReadiness.customerOrDataImpact)} emptyCopy="No customer or data impact detected." />
                  <OperationalArea title="Owner or reviewer focus" items={deduplicateReportItems(report.operationalReadiness.ownerOrReviewerFocus)} emptyCopy="No additional operational reviewer focus detected." />
                </div>
              </div>
            ) : (
              <div className="operational-legacy">
                <span className="operational-status-legacy">NOT ASSESSED</span>
                <p>Not assessed — regenerate this report</p>
              </div>
            )}
          </section>
            </div>
          )}

          {activeTab === "review-focus" && (
            <div
              className="report-tab-panel"
              id="report-panel-review-focus"
              role="tabpanel"
              aria-labelledby="report-tab-review-focus"
            >
          <section className="section-block report-reviewer-focus">
            <div className="section-heading">
              <div><span className="card-kicker">REVIEW ROUTING</span><h2>Reviewer focus</h2></div>
              {supportedReviewerFocus && <span className="section-count">{supportedReviewerFocus.length} areas</span>}
            </div>
            {supportedReviewerFocus ? (
              supportedReviewerFocus.length > 0 ? (
                <div className="reviewer-focus-list">
                  {supportedReviewerFocus.map((item) => (
                    <article className="reviewer-focus-item" key={item.area}>
                      <div>
                        <h3>{item.area}</h3>
                        <p>{item.reason}</p>
                      </div>
                      <span className={`reviewer-priority reviewer-priority--${item.priority.toLowerCase()}`}>{item.priority}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="reviewer-focus-empty">No specialist reviewer focus detected by current rules.</p>
              )
            ) : (
              <p className="reviewer-focus-legacy">Reviewer focus was not assessed — regenerate this report.</p>
            )}
          </section>
            </div>
          )}

          {activeTab === "changed-files" && (
            <div
              className="report-tab-panel"
              id="report-panel-changed-files"
              role="tabpanel"
              aria-labelledby="report-tab-changed-files"
            >
          <section className="section-block report-changed-files">
            <div className="section-heading"><div><span className="card-kicker">CHANGESET</span><h2>Changed files</h2></div><span className="section-count">{report.changedFiles.length} files</span></div>
            <div className="file-list">
              {report.changedFiles.map((file) => (
                <div className="file-row" key={file.path}>
                  <span className="file-icon" aria-hidden="true">▱</span><code>{file.path}</code>{(file.additions !== undefined || file.deletions !== undefined || file.risk) && <div className="file-stats">{file.additions !== undefined && <span className="additions">+{file.additions}</span>}{file.deletions !== undefined && <span className="deletions">−{file.deletions}</span>}{file.risk && <RiskBadge risk={file.risk} />}</div>}
                </div>
              ))}
            </div>
          </section>
            </div>
          )}

          {activeTab === "review-focus" && (
            <div className="report-tab-panel report-tab-panel--continued">
          <section className="section-block report-engineering-review">
            <div className="section-heading"><div><span className="card-kicker">ENGINEERING REVIEW</span><h2>Change quality</h2></div></div>
            <div className="review-grid">
              <ReviewCard title="Security review" review={report.reviews.security} findingTitles={findingTitles} calmSummary={cleanApprove ? "No security attention signal detected." : undefined} />
              <ReviewCard title="Reliability review" review={report.reviews.reliability} findingTitles={findingTitles} calmSummary={cleanApprove ? "No reliability attention signal detected." : undefined} />
              <ReviewCard title="Maintainability review" review={report.reviews.maintainability} findingTitles={findingTitles} calmSummary={cleanApprove ? "No maintainability attention signal detected." : undefined} />
            </div>
          </section>

          <section className="report-quality-compact" aria-label="Report quality">
            <div><span className="card-kicker">REPORT QUALITY</span><strong>{report.reportQuality?.status === "PASS" ? "Checks passed" : report.reportQuality?.status === "WARNING" ? "Review warnings" : "Not assessed"}</strong></div>
            {report.reportQuality ? (
              report.reportQuality.status === "PASS" ? <p>Internally consistent and safe to share.</p> : (
                <ul>{report.reportQuality.checks.filter((check) => check.status === "WARNING").map((check) => <li key={check.label}><strong>{check.label}:</strong> {check.detail}</li>)}</ul>
              )
            ) : <p>Regenerate this legacy report to run quality checks.</p>}
            <span className={`quality-status quality-status--${report.reportQuality?.status.toLowerCase() ?? "legacy"}`}>{report.reportQuality?.status ?? "NOT ASSESSED"}</span>
          </section>
            </div>
          )}

          {activeTab === "export" && (
            <div
              className="report-tab-panel"
              id="report-panel-export"
              role="tabpanel"
              aria-labelledby="report-tab-export"
            >
          <section className="section-block report-export-actions" aria-labelledby="report-export-title">
            <div className="section-heading">
              <div>
                <span className="card-kicker">HANDOFF</span>
                <h2 id="report-export-title">Export and next steps</h2>
              </div>
              <SourceBadge source={source} />
            </div>
            <div className="report-export-grid">
              <article>
                <h3>Copy conditions</h3>
                <p>Copy only the merge conditions as PR-ready Markdown.</p>
                <button
                  className={`copy-conditions-button copy-conditions-button--${conditionsCopyState}`}
                  type="button"
                  onClick={handleCopyConditions}
                  aria-live="polite"
                >
                  {copyConditionsLabels[conditionsCopyState]}
                </button>
              </article>
              <article>
                <h3>Copy summary</h3>
                <p>Copy a concise Markdown report for review handoff or validation.</p>
                <button
                  className={`copy-summary-button copy-summary-button--${copyState}`}
                  type="button"
                  onClick={handleCopySummary}
                  aria-live="polite"
                >
                  {copyLabels[copyState]}
                </button>
              </article>
              <article>
                <h3>Download Markdown</h3>
                <p>Save the current report as a local Markdown artifact.</p>
                <button
                  className={`download-markdown-button download-markdown-button--${downloadState}`}
                  type="button"
                  onClick={handleDownloadMarkdown}
                  aria-live="polite"
                >
                  {downloadLabels[downloadState]}
                </button>
              </article>
              <article>
                <h3>Navigate</h3>
                <p>Return to the local risk inbox or check another pull request.</p>
                <div className="report-export-links">
                  <a href="/workspace">Back to workspace</a>
                  <a href="/new">Check another pull request</a>
                  <a href="/review-policies">Review policies</a>
                  <button type="button" onClick={() => setActiveTab("evidence")}>Evidence ledger</button>
                  <button type="button" onClick={() => setActiveTab("blast-radius")}>Affected surfaces</button>
                  <a href="/github-action">GitHub Action prototype</a>
                  <a href="/slack-handoff">Slack handoff concept</a>
                  <a href="/docs/security-model.md">Security model</a>
                </div>
              </article>
            </div>

            <div className="merge-summary-builder" aria-label="GitHub comment builder">
              <div className="merge-summary-builder-header">
                <div>
                  <span className="card-kicker">PR COMMENT BUILDER</span>
                  <h3>Merge-readiness handoff</h3>
                  <p>Preview a concise Markdown comment you can paste into a GitHub PR. This is local/export only; Lintel does not post to GitHub.</p>
                </div>
                <button
                  className={`copy-summary-button copy-summary-button--${mergeSummaryCopyState}`}
                  type="button"
                  onClick={handleCopyMergeSummary}
                  aria-live="polite"
                >
                  {copyMergeSummaryLabels[mergeSummaryCopyState]}
                </button>
              </div>

              <div className="merge-summary-options">
                <span>{verdict.recommendation.replaceAll("_", " ")} · {verdict.riskLevel} risk · {reviewState.status}</span>
                {reviewState.note.trim().length > 0 ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={includeLocalNoteInMergeSummary}
                      onChange={(event) => setIncludeLocalNoteInMergeSummary(event.target.checked)}
                    />
                    <span>Include local reviewer note</span>
                  </label>
                ) : (
                  <span>Local reviewer note is empty.</span>
                )}
              </div>

              <pre className="merge-summary-preview" aria-label="Generated merge-readiness Markdown preview">{mergeSummaryMarkdown}</pre>
            </div>
          </section>

          <section className="final-recommendation final-recommendation--compact">
            <div className="final-intro"><span className="card-kicker">CLOSING SUMMARY</span><h2>{recommendationHeadings[verdict.recommendation]}</h2></div>
            <p>{closingRecommendations[verdict.recommendation]}</p>
          </section>
            </div>
          )}
          </div>

          <aside className="report-decision-panel" aria-label="Merge-readiness decision panel">
            <div className="report-decision-panel-header">
              <span className="card-kicker">DECISION</span>
              <RecommendationBadge recommendation={verdict.recommendation} />
            </div>

            <div className="report-decision-panel-title">
              <h2>{pr.title}</h2>
              <p>{pr.repository}</p>
            </div>

            <div className="report-decision-panel-risk">
              <strong className={`risk-band risk-band--${verdict.riskLevel.toLowerCase()}`}>{verdict.riskLevel} RISK</strong>
              <span>Score detail: {verdict.riskScore}/100</span>
            </div>

            <dl className="report-decision-panel-snapshot" aria-label="Report at a glance">
              <div><dt>{displayedConditions.length}</dt><dd>conditions</dd></div>
              <div><dt>{report.missingTests.length}</dt><dd>missing tests</dd></div>
              <div><dt>{report.findings.length}</dt><dd>findings</dd></div>
            </dl>

            <dl className="report-decision-panel-meta">
              <div><dt>Review mode</dt><dd>{reviewProfileLabel(pr.reviewProfile)}</dd></div>
              <div><dt>Policy</dt><dd>{activePolicy.label}</dd></div>
              <div><dt>Input</dt><dd>{decisionPanelInputLabel(pr.branch)}</dd></div>
              <div><dt>Mode</dt><dd>{sourceLabels[source]}</dd></div>
              <div><dt>Operations</dt><dd>{operationalStatus}</dd></div>
              <div><dt>Quality</dt><dd>{qualityStatus}</dd></div>
              <div><dt>Reviewer focus</dt><dd>{reviewerFocusSummary}</dd></div>
              <div><dt>Owner</dt><dd>{displayedOwner}</dd></div>
            </dl>

            <section className="report-policy-gates" aria-label="Active merge policy">
              <div>
                <span>Active policy</span>
                <strong>{activePolicyStatus.label}</strong>
              </div>
              <p>{activePolicy.label}: {policyGateSummary(activePolicy)}. {activePolicyStatus.detail}</p>
              <a href="/review-policies">View merge gates</a>
            </section>

            <section className="report-decision-panel-conditions" aria-label="Condition progress">
              <span>Conditions cleared</span>
              <strong>{conditionProgressLabel}</strong>
            </section>

            <section className="report-local-review-state" aria-label="Local review state">
              <div className="report-local-review-heading">
                <span>Local review state</span>
                <strong>{reviewState.status}</strong>
              </div>
              <label>
                <span>Status</span>
                <select value={reviewState.status} onChange={(event) => updateReviewStatus(event.target.value as ReviewStatus)}>
                  {REVIEW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label>
                <span>Owner</span>
                <select value={reviewState.owner} onChange={(event) => updateReviewOwner(event.target.value as ReviewerOwner)}>
                  {REVIEW_OWNER_OPTIONS.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                </select>
              </label>
              <p>Suggested owner cue: {suggestedOwners.length > 0 ? suggestedOwners.join(" / ") : "No specialist owner cue detected."}</p>
              <label>
                <span>Reviewer note</span>
                <textarea
                  value={reviewState.note}
                  maxLength={1000}
                  rows={4}
                  onChange={(event) => updateReviewNote(event.target.value)}
                  onBlur={handleReviewNoteBlur}
                  placeholder="Local/private note for this device. Do not paste raw diffs or secrets."
                />
              </label>
              <p>{reviewState.updatedAt ? `Review state saved locally ${new Date(reviewState.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.` : "Review state is stored locally on this device."}</p>
            </section>

            <div className="report-decision-panel-actions">
              <button
                type="button"
                onClick={() => setActiveTab("export")}
              >
                Build PR comment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
              >
                Decision history
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("evidence")}
              >
                Evidence ledger
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("blast-radius")}
              >
                Affected surfaces
              </button>
              <button
                className={`copy-conditions-button copy-conditions-button--${conditionsCopyState}`}
                type="button"
                onClick={handleCopyConditions}
                aria-live="polite"
              >
                {copyConditionsLabels[conditionsCopyState]}
              </button>
              <button
                className={`copy-summary-button copy-summary-button--${copyState}`}
                type="button"
                onClick={handleCopySummary}
                aria-live="polite"
              >
                {copyLabels[copyState]}
              </button>
              <button
                className={`download-markdown-button download-markdown-button--${downloadState}`}
                type="button"
                onClick={handleDownloadMarkdown}
                aria-live="polite"
              >
                {downloadLabels[downloadState]}
              </button>
              <a href="/workspace">Back to workspace</a>
              <a href="/new">Check another pull request</a>
              <a href="/docs/security-model.md">Security model</a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
