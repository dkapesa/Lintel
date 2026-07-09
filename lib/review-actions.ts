export const REVIEW_ACTION_STATUS_STORAGE_KEY = "lintel.reviewActionStatus.v1";

export const REVIEW_ACTION_STATUSES = ["Open", "In progress", "Done", "Not needed"] as const;

export type ReviewActionStatus = (typeof REVIEW_ACTION_STATUSES)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReviewActionStatus(value: unknown): value is ReviewActionStatus {
  return typeof value === "string" && (REVIEW_ACTION_STATUSES as readonly string[]).includes(value);
}

function stableHash(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function normalise(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function readAllActionStatuses(storage: Storage) {
  try {
    const stored = storage.getItem(REVIEW_ACTION_STATUS_STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function reviewActionKey(...parts: string[]) {
  return stableHash(parts.map(normalise).join("\n"));
}

export function readReviewActionStatuses(storage: Storage, reportKey: string) {
  const parsed = readAllActionStatuses(storage);
  const value = parsed[reportKey];
  const statuses: Record<string, ReviewActionStatus> = {};

  if (!isRecord(value)) return statuses;

  for (const [key, status] of Object.entries(value)) {
    if (isReviewActionStatus(status)) statuses[key] = status;
  }

  return statuses;
}

export function writeReviewActionStatus(
  storage: Storage,
  reportKey: string,
  actionKey: string,
  status: ReviewActionStatus,
) {
  const parsed = readAllActionStatuses(storage);
  const current = isRecord(parsed[reportKey]) ? { ...parsed[reportKey] } : {};
  current[actionKey] = status;
  parsed[reportKey] = current;
  storage.setItem(REVIEW_ACTION_STATUS_STORAGE_KEY, JSON.stringify(parsed));
  return readReviewActionStatuses(storage, reportKey);
}

export function removeReviewActionStatuses(storage: Storage, reportKey: string) {
  const parsed = readAllActionStatuses(storage);
  delete parsed[reportKey];
  storage.setItem(REVIEW_ACTION_STATUS_STORAGE_KEY, JSON.stringify(parsed));
}

export function clearReviewActionStatuses(storage: Storage) {
  storage.removeItem(REVIEW_ACTION_STATUS_STORAGE_KEY);
}
