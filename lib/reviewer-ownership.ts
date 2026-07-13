import type { Report } from "./mock-report";

export const REVIEW_OWNER_OPTIONS = [
  "Unassigned",
  "Backend reviewer",
  "Frontend reviewer",
  "Security reviewer",
  "Data/migration reviewer",
  "Platform/operations reviewer",
  "Test owner",
  "Senior reviewer",
] as const;

export type ReviewerOwner = (typeof REVIEW_OWNER_OPTIONS)[number] | (string & {});

export function isReviewerOwner(value: unknown): value is ReviewerOwner {
  return typeof value === "string"
    && value.length > 0
    && value.length <= 80
    && !/(diff --git|@@|--- a\/|\+\+\+ b\/|\b(token|secret|authorization)\b\s*[:=])/i.test(value);
}

function reportEvidenceText(report: Report) {
  return [
    report.pr.repository,
    report.pr.title,
    report.pr.language,
    report.pr.framework,
    report.changedFiles.map((file) => file.path).join(" "),
    report.findings.map((finding) => `${finding.category} ${finding.title} ${finding.evidence} ${finding.action}`).join(" "),
    Object.values(report.reviews).map((review) => `${review.status} ${review.summary} ${review.points.join(" ")}`).join(" "),
    report.operationalReadiness
      ? [
        report.operationalReadiness.status,
        report.operationalReadiness.summary,
        report.operationalReadiness.failureModes.join(" "),
        report.operationalReadiness.detectionSignals.join(" "),
        report.operationalReadiness.observabilityGaps.join(" "),
        report.operationalReadiness.recoveryOrRollback.join(" "),
        report.operationalReadiness.customerOrDataImpact.join(" "),
        report.operationalReadiness.ownerOrReviewerFocus.join(" "),
      ].join(" ")
      : "",
    report.reviewerFocus?.map((item) => `${item.area} ${item.reason}`).join(" ") ?? "",
    report.missingTests.join(" "),
    report.conditionsBeforeMerge.join(" "),
  ].join(" ").toLowerCase();
}

function addOwner(owners: ReviewerOwner[], owner: ReviewerOwner) {
  if (owner !== "Unassigned" && !owners.includes(owner)) owners.push(owner);
}

export function suggestedReviewerOwners(report: Report): ReviewerOwner[] {
  const evidence = reportEvidenceText(report);
  const owners: ReviewerOwner[] = [];

  if (
    report.reviews.security.status === "ATTENTION"
    || report.findings.some((finding) => finding.category === "Security")
    || /\b(security|privacy|auth|permission|session|token|secret|credential|pii|sensitive|identifier|logging|exposure)\b/.test(evidence)
  ) {
    addOwner(owners, "Security reviewer");
  }

  if (/\b(database|migration|schema|sql|backfill|data write|data-write|model change|data\/migration)\b/.test(evidence)) {
    addOwner(owners, "Data/migration reviewer");
  }

  if (
    report.operationalReadiness?.status === "ATTENTION"
    || /\b(platform|operations|operational|observability|logging|metrics|alerts|traces|monitoring|rollback|recovery|infra|queue|worker|deployment)\b/.test(evidence)
  ) {
    addOwner(owners, "Platform/operations reviewer");
  }

  if (report.missingTests.length > 0 || report.suggestedTests.some((test) => test.priority === "Required")) {
    addOwner(owners, "Test owner");
  }

  if (/\b(backend|api contract|api|route|endpoint|service|provider|client|retry|timeout|fastapi|node\.js)\b/.test(evidence)) {
    addOwner(owners, "Backend reviewer");
  }

  if (/\b(frontend|browser|react|next\.js|tsx|jsx|analytics|sendgaevent|client behavior|client-side|ui)\b/.test(evidence)) {
    addOwner(owners, "Frontend reviewer");
  }

  if (
    report.verdict.riskLevel === "HIGH"
    || report.verdict.riskLevel === "CRITICAL"
    || report.verdict.recommendation === "REVIEW_REQUIRED"
    || report.verdict.recommendation === "BLOCK"
  ) {
    addOwner(owners, "Senior reviewer");
  }

  return owners.slice(0, 4);
}

export function primarySuggestedReviewerOwner(report: Report): ReviewerOwner {
  return suggestedReviewerOwners(report)[0] ?? "Unassigned";
}

export function ownerDisplay(owner: ReviewerOwner, suggestedOwners: ReviewerOwner[]) {
  if (owner !== "Unassigned") return owner;
  return suggestedOwners[0] ? `Suggested: ${suggestedOwners[0]}` : "Unassigned";
}
