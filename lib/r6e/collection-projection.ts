import type { ReviewId, ReviewIndex } from "../r6c/review-identity";
import { GROUP_LABEL, GROUP_ORDER } from "../workspace-v2/queue-projection";
import type { QueueCaseSummary, QueueGroupId, ReviewStatus, WorkspaceSnapshot } from "../workspace-v2/view-model";
import type { ReviewCollectionFilter, ReviewCollectionGrouping } from "./collection-preferences";

export type ReviewRowViewModel = Readonly<{
  reviewId: ReviewId;
  currentCaseId: string;
  title: string;
  repository: string;
  triageState: ReviewStatus;
  groupId: QueueGroupId;
  lastActivityAt: string | null;
}>;

export type ReviewCollectionGroup = Readonly<{
  groupId: QueueGroupId;
  label: string;
  rows: readonly ReviewRowViewModel[];
}>;

export type ReviewCollectionProjection = Readonly<{
  groups: readonly ReviewCollectionGroup[];
  rows: readonly ReviewRowViewModel[];
}>;

export type ReviewCollectionView = Readonly<{
  grouping: ReviewCollectionGrouping;
  filter: ReviewCollectionFilter;
  search: string;
}>;

function validChronology(value: string | null | undefined): string | null {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : null;
}

function compareRows(left: ReviewRowViewModel, right: ReviewRowViewModel): number {
  const leftTime = left.lastActivityAt === null ? null : Date.parse(left.lastActivityAt);
  const rightTime = right.lastActivityAt === null ? null : Date.parse(right.lastActivityAt);
  if (leftTime !== null && rightTime !== null && leftTime !== rightTime) return rightTime - leftTime;
  if (leftTime !== null && rightTime === null) return -1;
  if (leftTime === null && rightTime !== null) return 1;
  return left.reviewId.localeCompare(right.reviewId);
}

function rowFor(
  summary: QueueCaseSummary,
  snapshot: Extract<WorkspaceSnapshot, { status: "ready" }>,
  reviewIndex: ReviewIndex,
): ReviewRowViewModel | null {
  const detail = snapshot.cases.find((item) => item.caseId === summary.caseId);
  const reviewId = reviewIndex.reviewIdByCaseId.get(summary.caseId);
  if (!detail || !reviewId) return null;
  return {
    reviewId,
    currentCaseId: summary.caseId,
    title: summary.title.trim() || "(untitled review)",
    repository: summary.repository.trim() || "—",
    triageState: summary.reviewStatus,
    groupId: summary.groupId,
    lastActivityAt: validChronology(detail.run?.createdAt),
  };
}

function matchesView(row: ReviewRowViewModel, view: ReviewCollectionView): boolean {
  if (view.filter !== "all" && row.groupId !== view.filter) return false;
  const query = view.search.trim().toLocaleLowerCase();
  return query.length === 0 || row.title.toLocaleLowerCase().includes(query) ||
    row.repository.toLocaleLowerCase().includes(query);
}

/**
 * Produces R6E's deliberately narrow Queue projection. Only a row joined to
 * both the authoritative group summary/case and the ReviewIndex is emitted.
 */
export function projectReviewCollection(
  snapshot: WorkspaceSnapshot,
  reviewIndex: ReviewIndex,
  view: ReviewCollectionView,
): ReviewCollectionProjection {
  if (snapshot.status !== "ready") return { groups: [], rows: [] };

  const groups: ReviewCollectionGroup[] = [];
  for (const groupId of GROUP_ORDER) {
    const source = snapshot.groups.find((group) => group.id === groupId);
    if (!source) continue;
    const rows = source.cases
      .map((summary) => rowFor(summary, snapshot, reviewIndex))
      .filter((row): row is ReviewRowViewModel => row !== null)
      .filter((row) => matchesView(row, view))
      .sort(compareRows);
    if (rows.length > 0) groups.push({ groupId, label: GROUP_LABEL[groupId], rows });
  }

  const rows = groups.flatMap((group) => group.rows);
  return view.grouping === "semantic" ? { groups, rows } : { groups: [], rows };
}
