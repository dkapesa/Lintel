import type { PersistenceWrite, StorageLike } from "../r6c/persistence";

export const R6M_LAYOUT_STORAGE_KEY = "lintel.r6m.layout.v1";

export type R6MLayoutPreference = Readonly<{ queueCollapsed: boolean }>;

export const DEFAULT_R6M_LAYOUT_PREFERENCE: R6MLayoutPreference = {
  queueCollapsed: false,
};

function parsedQueueCollapsed(value: unknown): boolean {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && (value as Record<string, unknown>).queueCollapsed === true;
}

export function queueCollapsedFromRaw(raw: string | null): boolean {
  if (!raw) return false;
  try {
    return parsedQueueCollapsed(JSON.parse(raw) as unknown);
  } catch {
    return false;
  }
}

export function readR6MLayoutPreference(storage: StorageLike): R6MLayoutPreference {
  try {
    return { queueCollapsed: queueCollapsedFromRaw(storage.getItem(R6M_LAYOUT_STORAGE_KEY)) };
  } catch {
    return DEFAULT_R6M_LAYOUT_PREFERENCE;
  }
}

export function writeR6MLayoutPreference(
  storage: StorageLike,
  preference: R6MLayoutPreference,
): PersistenceWrite {
  if (typeof preference.queueCollapsed !== "boolean") {
    return { persisted: false, reason: "invalid-input" };
  }
  try {
    storage.setItem(R6M_LAYOUT_STORAGE_KEY, JSON.stringify({
      queueCollapsed: preference.queueCollapsed,
    }));
    return { persisted: true };
  } catch {
    return { persisted: false, reason: "write-unavailable" };
  }
}
