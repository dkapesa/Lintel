import type { ReviewId } from "../r6c/review-identity";
import type { ReviewRowViewModel } from "../r6e/collection-projection";

/** True only when a previously focused Queue row has been removed by reprojection. */
export function focusedQueueReviewWasRemoved(
  focusedReviewId: ReviewId | null,
  rows: readonly ReviewRowViewModel[],
): boolean {
  return focusedReviewId !== null && !rows.some((row) => row.reviewId === focusedReviewId);
}
