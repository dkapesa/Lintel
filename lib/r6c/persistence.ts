import { MAX_REPORT_HISTORY } from "../report-history";
import { isContextRef } from "./context-identity";
import { isReviewMode } from "./route-contract";
import { reviewIdFromOpaqueToken, type ReviewId } from "./review-identity";
import {
  DEFAULT_DEVICE_PREFERENCES,
  R6C_SCHEMA_VERSION,
  type DevicePreferences,
  type ModeAnchor,
  type ReviewContextRecord,
} from "./state-model";

export const WORKSTATION_UI_STORAGE_KEY = "lintel.r6.workstation.v1";
export const REVIEW_CONTEXT_STORAGE_KEY = "lintel.r6.reviewContext.v1";

export const MAX_REVIEW_CONTEXTS = MAX_REPORT_HISTORY;
export const MAX_COLLECTION_PREFERENCES = 32;
const MAX_COLLECTION_VALUE_CHARACTERS = 32_768;
const MAX_PREFERENCE_WIDTH = 100_000;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type CollectionPreferenceSlot = Readonly<{
  version: number;
  capturedAt: string;
  value: unknown;
}>;

export type WorkstationPersistence = Readonly<{
  schemaVersion: typeof R6C_SCHEMA_VERSION;
  devicePreferences: DevicePreferences;
  collections: Readonly<Record<string, CollectionPreferenceSlot>>;
}>;

export type PersistenceRead<T> =
  | { status: "ok"; value: T; discarded: readonly string[] }
  | { status: "missing"; value: T; discarded: readonly string[] }
  | { status: "invalid"; value: T; discarded: readonly string[]; reason: string }
  | { status: "unavailable"; value: T; discarded: readonly string[]; reason: string };

export type PersistenceWrite = Readonly<{
  persisted: boolean;
  reason?: "read-unavailable" | "write-unavailable" | "invalid-input";
}>;

type ReviewContextEnvelope = Readonly<{
  schemaVersion: typeof R6C_SCHEMA_VERSION;
  contexts: Readonly<Record<string, ReviewContextRecord>>;
}>;

function emptyCollections(): Record<string, CollectionPreferenceSlot> {
  return Object.create(null) as Record<string, CollectionPreferenceSlot>;
}

export function defaultWorkstationPersistence(): WorkstationPersistence {
  return {
    schemaVersion: R6C_SCHEMA_VERSION,
    devicePreferences: DEFAULT_DEVICE_PREFERENCES,
    collections: emptyCollections(),
  };
}

function emptyReviewContexts(): ReviewContextEnvelope {
  return {
    schemaVersion: R6C_SCHEMA_VERSION,
    contexts: Object.create(null) as Record<string, ReviewContextRecord>,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function nullableWidth(value: unknown): value is number | null {
  return value === null || (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= MAX_PREFERENCE_WIDTH
  );
}

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function validDevicePreferences(value: unknown): value is DevicePreferences {
  if (!isRecord(value) || !isRecord(value.queue) || !isRecord(value.inspector)) return false;
  if (value.queue.manualPreference !== "expanded" && value.queue.manualPreference !== "compact") {
    return false;
  }
  if (!isRecord(value.queue.preferredWidth)) return false;
  return nullableWidth(value.queue.preferredWidth.expanded) &&
    nullableWidth(value.queue.preferredWidth.compact) &&
    nullableWidth(value.inspector.preferredWidth);
}

function validCollectionSlot(value: unknown): value is CollectionPreferenceSlot {
  if (!isRecord(value)) return false;
  if (!Number.isSafeInteger(value.version) || (value.version as number) < 1) return false;
  if (!validTimestamp(value.capturedAt)) return false;
  try {
    return JSON.stringify(value.value).length <= MAX_COLLECTION_VALUE_CHARACTERS;
  } catch {
    return false;
  }
}

function parseJson(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

export function readWorkstationPersistence(storage: StorageLike): PersistenceRead<WorkstationPersistence> {
  const fallback = defaultWorkstationPersistence();
  let raw: string | null;
  try {
    raw = storage.getItem(WORKSTATION_UI_STORAGE_KEY);
  } catch {
    return { status: "unavailable", value: fallback, discarded: [], reason: "get-item-threw" };
  }
  if (raw === null) return { status: "missing", value: fallback, discarded: [] };

  let parsed: unknown;
  try {
    parsed = parseJson(raw);
  } catch {
    return { status: "invalid", value: fallback, discarded: [], reason: "malformed-json" };
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== R6C_SCHEMA_VERSION) {
    return { status: "invalid", value: fallback, discarded: [], reason: "schema-version" };
  }
  if (!validDevicePreferences(parsed.devicePreferences)) {
    return { status: "invalid", value: fallback, discarded: [], reason: "device-preferences" };
  }
  if (!isRecord(parsed.collections)) {
    return { status: "invalid", value: fallback, discarded: [], reason: "collections" };
  }

  const collections = emptyCollections();
  const discarded: string[] = [];
  const entries = Object.entries(parsed.collections)
    .sort(([left], [right]) => left.localeCompare(right));
  for (const [collectionId, slot] of entries) {
    if (
      !nonEmptyString(collectionId) ||
      collectionId.length > 200 ||
      !validCollectionSlot(slot)
    ) {
      discarded.push(`collection:${collectionId}`);
      continue;
    }
    collections[collectionId] = slot;
  }

  if (Object.keys(collections).length > MAX_COLLECTION_PREFERENCES) {
    const ordered = Object.entries(collections).sort((left, right) =>
      Date.parse(right[1].capturedAt) - Date.parse(left[1].capturedAt) || left[0].localeCompare(right[0]),
    );
    for (const [collectionId] of ordered.slice(MAX_COLLECTION_PREFERENCES)) {
      delete collections[collectionId];
      discarded.push(`collection:${collectionId}:over-bound`);
    }
  }

  return {
    status: "ok",
    value: {
      schemaVersion: R6C_SCHEMA_VERSION,
      devicePreferences: parsed.devicePreferences,
      collections,
    },
    discarded,
  };
}

export function writeWorkstationPersistence(
  storage: StorageLike,
  value: WorkstationPersistence,
): PersistenceWrite {
  if (
    value.schemaVersion !== R6C_SCHEMA_VERSION ||
    !validDevicePreferences(value.devicePreferences)
  ) {
    return { persisted: false, reason: "invalid-input" };
  }
  try {
    storage.setItem(WORKSTATION_UI_STORAGE_KEY, JSON.stringify(value));
    return { persisted: true };
  } catch {
    return { persisted: false, reason: "write-unavailable" };
  }
}

function validModeAnchor(value: unknown): value is ModeAnchor {
  if (!isRecord(value)) return false;
  if (value.kind === "top") return true;
  return value.kind === "context" && isContextRef(value.context);
}

function parseReviewContext(key: string, value: unknown): ReviewContextRecord | null {
  if (!isRecord(value) || value.schemaVersion !== R6C_SCHEMA_VERSION) return null;
  if (!nonEmptyString(value.reviewId) || value.reviewId !== key) return null;
  if (!isReviewMode(value.mode)) return null;
  if (value.primarySelection !== null && !isContextRef(value.primarySelection)) return null;
  if (!isRecord(value.inspector) || typeof value.inspector.open !== "boolean") return null;
  if (value.inspector.context !== null && !isContextRef(value.inspector.context)) return null;
  if (value.inspector.open !== (value.inspector.context !== null)) return null;
  if (value.comparisonRunId !== null && !nonEmptyString(value.comparisonRunId)) return null;
  if (value.lastKnownCaseId !== null && !nonEmptyString(value.lastKnownCaseId)) return null;
  if (!isRecord(value.modeAnchors)) return null;
  for (const [mode, anchor] of Object.entries(value.modeAnchors)) {
    if (!isReviewMode(mode) || !validModeAnchor(anchor)) return null;
  }
  if (!validTimestamp(value.capturedAt)) return null;
  return value as ReviewContextRecord;
}

function boundedContexts(
  contexts: Readonly<Record<string, ReviewContextRecord>>,
): { contexts: Record<string, ReviewContextRecord>; evicted: string[] } {
  const ordered = Object.entries(contexts).sort((left, right) =>
    Date.parse(right[1].capturedAt) - Date.parse(left[1].capturedAt) || left[0].localeCompare(right[0]),
  );
  const bounded = Object.create(null) as Record<string, ReviewContextRecord>;
  for (const [key, record] of ordered.slice(0, MAX_REVIEW_CONTEXTS)) bounded[key] = record;
  return { contexts: bounded, evicted: ordered.slice(MAX_REVIEW_CONTEXTS).map(([key]) => key) };
}

function readReviewContextEnvelope(storage: StorageLike): PersistenceRead<ReviewContextEnvelope> {
  const fallback = emptyReviewContexts();
  let raw: string | null;
  try {
    raw = storage.getItem(REVIEW_CONTEXT_STORAGE_KEY);
  } catch {
    return { status: "unavailable", value: fallback, discarded: [], reason: "get-item-threw" };
  }
  if (raw === null) return { status: "missing", value: fallback, discarded: [] };

  let parsed: unknown;
  try {
    parsed = parseJson(raw);
  } catch {
    return { status: "invalid", value: fallback, discarded: [], reason: "malformed-json" };
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== R6C_SCHEMA_VERSION || !isRecord(parsed.contexts)) {
    return { status: "invalid", value: fallback, discarded: [], reason: "schema-or-shape" };
  }

  const contexts = Object.create(null) as Record<string, ReviewContextRecord>;
  const discarded: string[] = [];
  for (const [key, candidate] of Object.entries(parsed.contexts)) {
    const record = parseReviewContext(key, candidate);
    if (record) contexts[key] = record;
    else discarded.push(`review:${key}`);
  }
  const bounded = boundedContexts(contexts);
  discarded.push(...bounded.evicted.map((key) => `review:${key}:over-bound`));
  return {
    status: "ok",
    value: { schemaVersion: R6C_SCHEMA_VERSION, contexts: bounded.contexts },
    discarded,
  };
}

export function readReviewContext(
  storage: StorageLike,
  reviewId: ReviewId,
): PersistenceRead<ReviewContextRecord | null> {
  const envelope = readReviewContextEnvelope(storage);
  return {
    ...envelope,
    value: envelope.value.contexts[reviewId] ?? null,
  };
}

export function writeReviewContext(
  storage: StorageLike,
  record: ReviewContextRecord,
): PersistenceWrite & { evicted: readonly ReviewId[] } {
  if (parseReviewContext(record.reviewId, record) === null) {
    return { persisted: false, reason: "invalid-input", evicted: [] };
  }
  const existing = readReviewContextEnvelope(storage);
  if (existing.status === "unavailable") {
    return { persisted: false, reason: "read-unavailable", evicted: [] };
  }
  const merged = Object.assign(Object.create(null) as Record<string, ReviewContextRecord>, existing.value.contexts);
  merged[record.reviewId] = record;
  const bounded = boundedContexts(merged);
  try {
    storage.setItem(REVIEW_CONTEXT_STORAGE_KEY, JSON.stringify({
      schemaVersion: R6C_SCHEMA_VERSION,
      contexts: bounded.contexts,
    }));
    return {
      persisted: true,
      evicted: bounded.evicted.map(reviewIdFromOpaqueToken),
    };
  } catch {
    return { persisted: false, reason: "write-unavailable", evicted: [] };
  }
}

export function removeReviewContext(storage: StorageLike, reviewId: ReviewId): PersistenceWrite {
  const existing = readReviewContextEnvelope(storage);
  if (existing.status === "unavailable") return { persisted: false, reason: "read-unavailable" };
  const next = Object.assign(Object.create(null) as Record<string, ReviewContextRecord>, existing.value.contexts);
  delete next[reviewId];
  try {
    storage.setItem(REVIEW_CONTEXT_STORAGE_KEY, JSON.stringify({
      schemaVersion: R6C_SCHEMA_VERSION,
      contexts: next,
    }));
    return { persisted: true };
  } catch {
    return { persisted: false, reason: "write-unavailable" };
  }
}

export type CollectionPreferenceRead<T> =
  | { status: "available"; value: T; capturedAt: string }
  | { status: "missing" }
  | { status: "invalid"; reason: "version" | "value" | "workstation" }
  | { status: "unavailable" };

export function readCollectionPreference<T>(
  storage: StorageLike,
  collectionId: string,
  version: number,
  validate: (value: unknown) => value is T,
): CollectionPreferenceRead<T> {
  const workstation = readWorkstationPersistence(storage);
  if (workstation.status === "unavailable") return { status: "unavailable" };
  if (workstation.status === "invalid") return { status: "invalid", reason: "workstation" };
  if (workstation.discarded.includes(`collection:${collectionId}`)) {
    return { status: "invalid", reason: "value" };
  }
  const slot = workstation.value.collections[collectionId];
  if (!slot) return { status: "missing" };
  if (slot.version !== version) return { status: "invalid", reason: "version" };
  if (!validate(slot.value)) return { status: "invalid", reason: "value" };
  return { status: "available", value: slot.value, capturedAt: slot.capturedAt };
}

export function writeCollectionPreference(
  storage: StorageLike,
  collectionId: string,
  version: number,
  value: unknown,
  capturedAt: string,
): PersistenceWrite {
  if (
    !nonEmptyString(collectionId) ||
    collectionId.length > 200 ||
    !Number.isSafeInteger(version) ||
    version < 1 ||
    !validTimestamp(capturedAt) ||
    !validCollectionSlot({ version, capturedAt, value })
  ) {
    return { persisted: false, reason: "invalid-input" };
  }
  const current = readWorkstationPersistence(storage);
  if (current.status === "unavailable") return { persisted: false, reason: "read-unavailable" };
  const collections = Object.assign(emptyCollections(), current.value.collections);
  collections[collectionId] = { version, capturedAt, value };
  const ordered = Object.entries(collections).sort((left, right) =>
    Date.parse(right[1].capturedAt) - Date.parse(left[1].capturedAt) || left[0].localeCompare(right[0]),
  );
  const bounded = emptyCollections();
  for (const [id, slot] of ordered.slice(0, MAX_COLLECTION_PREFERENCES)) bounded[id] = slot;
  return writeWorkstationPersistence(storage, { ...current.value, collections: bounded });
}

export function clearCollectionPreference(
  storage: StorageLike,
  collectionId: string,
): PersistenceWrite {
  const current = readWorkstationPersistence(storage);
  if (current.status === "unavailable") return { persisted: false, reason: "read-unavailable" };
  const collections = Object.assign(emptyCollections(), current.value.collections);
  delete collections[collectionId];
  return writeWorkstationPersistence(storage, { ...current.value, collections });
}

export function clearUiState(storage: StorageLike): {
  cleared: readonly string[];
  failed: readonly string[];
  draftsPreserved: true;
} {
  const cleared: string[] = [];
  const failed: string[] = [];
  for (const key of [WORKSTATION_UI_STORAGE_KEY, REVIEW_CONTEXT_STORAGE_KEY] as const) {
    try {
      storage.removeItem(key);
      cleared.push(key);
    } catch {
      failed.push(key);
    }
  }
  return { cleared, failed, draftsPreserved: true };
}
