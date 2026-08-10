import type { CaseDetail } from "../workspace-v2/view-model";

declare const reviewIdBrand: unique symbol;

/** Durable Review identity. Consumers must treat the string as an opaque token. */
export type ReviewId = string & { readonly [reviewIdBrand]: "ReviewId" };
export type CaseId = CaseDetail["caseId"];

export interface ReviewIdentityProvider {
  reviewIdFor(caseDetail: CaseDetail): ReviewId;
}

function singletonCaseIdentity(caseId: CaseId): ReviewId {
  return `case:${caseId.length}:${caseId}` as ReviewId;
}

/**
 * Brands a route/storage token without interpreting its contents. Semantic
 * validity is established later by looking it up in a fresh ReviewIndex.
 */
export function reviewIdFromOpaqueToken(value: string): ReviewId {
  if (value.length === 0) throw new Error("ReviewId must not be empty");
  return value as ReviewId;
}

/**
 * Conservative by design: today's CaseDetail projection cannot independently
 * prove a durable upstream PR identity because its PR number may be a
 * placeholder even for GitHub-labelled runs. The built-in provider therefore
 * never joins Cases. A later integration may inject a stronger provider once
 * its input exposes a source-verified durable identity.
 */
export const conservativeReviewIdentityProvider: ReviewIdentityProvider = {
  reviewIdFor(caseDetail) {
    return singletonCaseIdentity(caseDetail.caseId);
  },
};

export type ReviewIndexEntry = Readonly<{
  reviewId: ReviewId;
  caseIds: readonly CaseId[];
  currentCaseId: CaseId;
}>;

export type ReviewIndex = Readonly<{
  byReviewId: ReadonlyMap<ReviewId, ReviewIndexEntry>;
  reviewIdByCaseId: ReadonlyMap<CaseId, ReviewId>;
}>;

type MutableIndexEntry = {
  reviewId: ReviewId;
  caseIds: CaseId[];
  currentCaseId: CaseId;
  currentSnapshotIndex: number;
  currentChronology: number | null;
};

function reliableChronology(caseDetail: CaseDetail): number | null {
  const createdAt = caseDetail.run?.createdAt;
  if (!createdAt) return null;
  const value = Date.parse(createdAt);
  return Number.isFinite(value) ? value : null;
}

function shouldBecomeCurrent(
  current: MutableIndexEntry,
  candidateChronology: number | null,
  candidateSnapshotIndex: number,
): boolean {
  if (current.currentChronology !== null && candidateChronology !== null) {
    if (candidateChronology !== current.currentChronology) {
      return candidateChronology > current.currentChronology;
    }
  }

  // The authoritative Workspace projection is deterministic and newest-first.
  // When chronology is absent or tied, first snapshot appearance wins.
  return candidateSnapshotIndex < current.currentSnapshotIndex;
}

/** Build a fresh, pure Review index from one authoritative Case snapshot. */
export function indexReviews(
  cases: readonly CaseDetail[],
  provider: ReviewIdentityProvider = conservativeReviewIdentityProvider,
): ReviewIndex {
  const mutable = new Map<ReviewId, MutableIndexEntry>();
  const reviewIdByCaseId = new Map<CaseId, ReviewId>();

  cases.forEach((caseDetail, snapshotIndex) => {
    const reviewId = provider.reviewIdFor(caseDetail);
    reviewIdByCaseId.set(caseDetail.caseId, reviewId);
    const chronology = reliableChronology(caseDetail);
    const existing = mutable.get(reviewId);

    if (!existing) {
      mutable.set(reviewId, {
        reviewId,
        caseIds: [caseDetail.caseId],
        currentCaseId: caseDetail.caseId,
        currentSnapshotIndex: snapshotIndex,
        currentChronology: chronology,
      });
      return;
    }

    if (!existing.caseIds.includes(caseDetail.caseId)) {
      existing.caseIds.push(caseDetail.caseId);
    }
    if (shouldBecomeCurrent(existing, chronology, snapshotIndex)) {
      existing.currentCaseId = caseDetail.caseId;
      existing.currentSnapshotIndex = snapshotIndex;
      existing.currentChronology = chronology;
    }
  });

  const byReviewId = new Map<ReviewId, ReviewIndexEntry>();
  for (const [reviewId, entry] of mutable) {
    byReviewId.set(reviewId, {
      reviewId,
      caseIds: [...entry.caseIds],
      currentCaseId: entry.currentCaseId,
    });
  }

  return { byReviewId, reviewIdByCaseId };
}

/** Resolve through the index, then retrieve the exact Case from fresh data. */
export function resolveCurrentCase(
  index: ReviewIndex,
  reviewId: ReviewId,
  cases: readonly CaseDetail[],
): CaseDetail | null {
  const indexed = index.byReviewId.get(reviewId);
  if (!indexed) return null;
  return cases.find((caseDetail) => caseDetail.caseId === indexed.currentCaseId) ?? null;
}
