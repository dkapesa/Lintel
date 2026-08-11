import {
  resolveCurrentCase,
  type ReviewId,
  type ReviewIndex,
  type ReviewMode,
  type WorkstationState,
} from "../r6c/index";
import type { CaseDetail, WorkspaceSnapshot } from "../workspace-v2/view-model";
import { projectHumanDecision, type HumanDecisionOrientation } from "./human-decision-orientation";
import { projectReviewModeLinks, type ReviewModeLink } from "./mode-navigation";
import { projectRecommendation, type RecommendationOrientation } from "./recommendation";
import { projectVerificationStanding, type VerificationStanding } from "./verification-standing";

export type NextStep = Readonly<{
  statement: string;
  target: ReviewModeLink | null;
}>;

export type AnalysisBasis = Readonly<{
  items: readonly Readonly<{ label: "Analysed" | "Head" | "Source" | "Updated"; value: string }>[];
  limitation: string | null;
  movement: string | null;
}>;

export type ReadySelectedReview = Readonly<{
  status: "ready";
  reviewId: ReviewId;
  mode: ReviewMode;
  identity: Readonly<{
    repository: string;
    title: string;
    context: readonly string[];
  }>;
  modes: readonly ReviewModeLink[];
  overview: Readonly<{
    recommendation: RecommendationOrientation;
    humanDecision: HumanDecisionOrientation;
    verification: VerificationStanding;
    nextStep: NextStep;
    analysisBasis: AnalysisBasis;
  }>;
}>;

export type SelectedReviewProjection =
  | Readonly<{ status: "none" }>
  | Readonly<{ status: "resolving" }>
  | Readonly<{ status: "store-unavailable"; reason: string }>
  | Readonly<{ status: "review-unavailable"; reviewId: ReviewId }>
  | ReadySelectedReview;

function titleFor(snapshot: Extract<WorkspaceSnapshot, { status: "ready" }>, detail: CaseDetail): string {
  for (const group of snapshot.groups) {
    const summary = group.cases.find((item) => item.caseId === detail.caseId);
    if (summary?.title.trim()) return summary.title;
  }
  return detail.github.branch;
}

function targetFor(modes: readonly ReviewModeLink[], mode: ReviewMode): ReviewModeLink {
  const target = modes.find((item) => item.mode === mode);
  if (!target) throw new Error(`Review mode ${mode} is not in the canonical mode projection.`);
  return target;
}

export function projectNextStep(
  detail: CaseDetail,
  verification: VerificationStanding,
  modes: readonly ReviewModeLink[],
): NextStep {
  if (detail.decision.status === "unavailable") {
    return { statement: "Human Decision standing is unavailable; verification context remains read-only.", target: null };
  }
  if (verification.blockingRequirements > 0) {
    return {
      statement: `${verification.blockingRequirements} blocking requirement${verification.blockingRequirements === 1 ? " needs" : "s need"} attention.`,
      target: targetFor(modes, "requirements"),
    };
  }
  if (verification.missingProof > 0) {
    return {
      statement: `${verification.missingProof} evidence record${verification.missingProof === 1 ? " is" : "s are"} missing or unverified.`,
      target: targetFor(modes, "evidence"),
    };
  }
  if (verification.staleEvidence > 0) {
    return {
      statement: `${verification.staleEvidence} evidence record${verification.staleEvidence === 1 ? " is" : "s are"} stale.`,
      target: targetFor(modes, "evidence"),
    };
  }
  if (verification.severeFindings > 0) {
    return {
      statement: `${verification.severeFindings} high-severity finding${verification.severeFindings === 1 ? " is" : "s are"} recorded.`,
      target: targetFor(modes, "change"),
    };
  }
  if (
    detail.decision.status === "recorded"
    && (detail.decision.applicability !== "applicable" || detail.decision.needsReaffirmation)
  ) {
    return {
      statement: "The recorded Human Decision is not current for this review.",
      target: detail.history?.status === "comparison" ? targetFor(modes, "history") : null,
    };
  }
  if (detail.decision.status === "empty") {
    return { statement: "Verification is complete. Human Decision remains pending.", target: null };
  }
  return { statement: "Verification is complete and a current Human Decision is recorded.", target: null };
}

const SOURCE_LABELS: Readonly<Record<NonNullable<CaseDetail["run"]>["sourceType"], string>> = {
  "github-app": "GitHub App",
  "github-pr": "GitHub pull request",
  manual: "Manual input",
  sample: "Sample",
  demo: "Demo",
};

function formatAnalysedAt(value: string): string | null {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(parsed));
}

export function projectAnalysisBasis(detail: CaseDetail): AnalysisBasis {
  const movement = detail.readiness.available
    ? detail.readiness.readiness.note
    : detail.readiness.reason;
  if (!detail.run) {
    return {
      items: detail.github.updatedAt.trim()
        ? [{ label: "Updated", value: detail.github.updatedAt }]
        : [],
      limitation: null,
      movement,
    };
  }

  const items: Array<{ label: "Analysed" | "Head" | "Source"; value: string }> = [];
  const analysedAt = formatAnalysedAt(detail.run.createdAt);
  if (analysedAt) items.push({ label: "Analysed", value: analysedAt });
  const head = detail.run.headSha ?? detail.github.headSha;
  if (head) items.push({ label: "Head", value: head.slice(0, 7) });
  items.push({ label: "Source", value: SOURCE_LABELS[detail.run.sourceType] });
  return {
    items,
    limitation: detail.run.reproducibilityLimitation,
    movement,
  };
}

export function projectSelectedReview(
  state: WorkstationState,
  snapshot: WorkspaceSnapshot,
  reviewIndex: ReviewIndex,
): SelectedReviewProjection {
  if (state.selectedReview.status === "none") return { status: "none" };
  if (snapshot.status === "loading") return { status: "resolving" };
  if (snapshot.status === "unavailable") {
    return { status: "store-unavailable", reason: snapshot.reason };
  }

  const reviewId = state.selectedReview.reviewId;
  if (snapshot.status !== "ready") return { status: "review-unavailable", reviewId };
  const detail = resolveCurrentCase(reviewIndex, reviewId, snapshot.cases);
  if (!detail) return { status: "review-unavailable", reviewId };

  const modes = projectReviewModeLinks(reviewId, state.mode);
  const verification = projectVerificationStanding(detail);
  const context = [
    detail.github.branch,
    detail.github.author,
    detail.github.updatedAt.trim() ? `Updated ${detail.github.updatedAt}` : "",
  ].filter((item) => item.trim().length > 0);

  return {
    status: "ready",
    reviewId,
    mode: state.mode,
    identity: {
      repository: detail.github.repository,
      title: titleFor(snapshot, detail),
      context,
    },
    modes,
    overview: {
      recommendation: projectRecommendation(detail),
      humanDecision: projectHumanDecision(detail),
      verification,
      nextStep: projectNextStep(detail, verification, modes),
      analysisBasis: projectAnalysisBasis(detail),
    },
  };
}
