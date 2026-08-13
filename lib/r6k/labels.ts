export {
  APPLICABILITY_LABEL,
  DECISION_OUTCOMES,
  DIVERGENCE_LABEL,
  OUTCOME_LABEL,
  OUTCOME_MEANING,
} from "../workspace-v2/view-model";

export const HUMAN_DECISION_COMPOSER_TITLE = "Human Decision";
export const HUMAN_DECISION_COMPOSER_DESCRIPTION = "Record the accountable engineering decision for this Review.";

export const DEFAULT_DECISION_OUTCOMES = [
  "approve",
  "tests-required",
  "review-required",
  "request-changes",
  "blocked",
] as const;

export const MORE_DECISION_OUTCOMES = [
  "approve-with-accepted-risk",
  "defer",
] as const;

export const DRAFT_DURABILITY_REASON_LABEL = {
  "storage-full": "Device storage is full.",
  "device-draft-limit-reached": "The device draft limit was reached. Record or discard a draft on another Review.",
  "unreadable-review-draft": "An unreadable stored draft for this Review was left in place.",
  "storage-unavailable": "Draft storage is unavailable.",
} as const;
