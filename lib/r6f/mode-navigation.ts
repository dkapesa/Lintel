import {
  REVIEW_MODES,
  formatRoute,
  type ReviewId,
  type ReviewMode,
} from "../r6c/index";

const MODE_LABELS: Record<ReviewMode, string> = {
  overview: "Overview",
  change: "Change",
  evidence: "Evidence",
  requirements: "Requirements",
  history: "History",
};

export type ReviewModeLink = Readonly<{
  mode: ReviewMode;
  label: string;
  href: string;
  current: boolean;
}>;

export function modeLabel(mode: ReviewMode): string {
  return MODE_LABELS[mode];
}

export function projectReviewModeLinks(
  reviewId: ReviewId,
  currentMode: ReviewMode,
): readonly ReviewModeLink[] {
  return REVIEW_MODES.map((mode) => ({
    mode,
    label: modeLabel(mode),
    href: formatRoute({ destination: "reviews", reviewId, mode }),
    current: mode === currentMode,
  }));
}
