import {
  readCollectionPreference,
  writeCollectionPreference,
  type CollectionPreferenceRead,
  type PersistenceWrite,
  type StorageLike,
} from "../r6c/persistence";
import type { QueueGroupId } from "../workspace-v2/view-model";

export const REVIEWS_QUEUE_COLLECTION_ID = "reviews-queue";
export const REVIEWS_QUEUE_COLLECTION_VERSION = 1;

export type ReviewCollectionGrouping = "semantic" | "none";
export type ReviewCollectionFilter = "all" | QueueGroupId;

export type ReviewCollectionPreferences = Readonly<{
  schemaVersion: 1;
  grouping: ReviewCollectionGrouping;
  filter: ReviewCollectionFilter;
}>;

export const DEFAULT_REVIEW_COLLECTION_PREFERENCES: ReviewCollectionPreferences = {
  schemaVersion: 1,
  grouping: "semantic",
  filter: "all",
};

export function isReviewCollectionPreferences(value: unknown): value is ReviewCollectionPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.schemaVersion === 1 &&
    (candidate.grouping === "semantic" || candidate.grouping === "none") &&
    (candidate.filter === "all" || candidate.filter === "attention" || candidate.filter === "review" ||
      candidate.filter === "ready" || candidate.filter === "reviewed");
}

export type ReviewCollectionPreferenceRead =
  | { status: "available"; preferences: ReviewCollectionPreferences }
  | { status: "missing" | "invalid" | "unavailable"; preferences: ReviewCollectionPreferences };

/** Reads through the R6C-owned collection slot and always supplies usable defaults. */
export function readReviewCollectionPreferences(storage: StorageLike): ReviewCollectionPreferenceRead {
  const result: CollectionPreferenceRead<ReviewCollectionPreferences> = readCollectionPreference(
    storage,
    REVIEWS_QUEUE_COLLECTION_ID,
    REVIEWS_QUEUE_COLLECTION_VERSION,
    isReviewCollectionPreferences,
  );
  if (result.status === "available") return { status: "available", preferences: result.value };
  return { status: result.status, preferences: DEFAULT_REVIEW_COLLECTION_PREFERENCES };
}

export function writeReviewCollectionPreferences(
  storage: StorageLike,
  preferences: ReviewCollectionPreferences,
  capturedAt: string,
): PersistenceWrite {
  if (!isReviewCollectionPreferences(preferences)) return { persisted: false, reason: "invalid-input" };
  return writeCollectionPreference(
    storage,
    REVIEWS_QUEUE_COLLECTION_ID,
    REVIEWS_QUEUE_COLLECTION_VERSION,
    preferences,
    capturedAt,
  );
}
