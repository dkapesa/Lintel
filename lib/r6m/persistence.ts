import {
  R6C_SCHEMA_VERSION,
  readWorkstationPersistence,
  writeWorkstationPersistence,
  type PersistenceWrite,
  type StorageLike,
} from "../r6c/index";
import {
  INSPECTOR_DEFAULT,
  preferredInspectorWidth,
  preferredQueueWidth,
  QUEUE_DEFAULT,
} from "./geometry";

export type R6MPreferredWidths = Readonly<{
  queue: number;
  inspector: number;
}>;

export function readR6MPreferredWidths(storage: StorageLike): R6MPreferredWidths {
  const persisted = readWorkstationPersistence(storage).value.devicePreferences;
  return {
    queue: persisted.queue.preferredWidth.expanded === null
      ? QUEUE_DEFAULT
      : preferredQueueWidth(persisted.queue.preferredWidth.expanded),
    inspector: persisted.inspector.preferredWidth === null
      ? INSPECTOR_DEFAULT
      : preferredInspectorWidth(persisted.inspector.preferredWidth),
  };
}

export function writePreferredQueueWidth(storage: StorageLike, width: number): PersistenceWrite {
  const current = readWorkstationPersistence(storage);
  if (current.status === "unavailable") return { persisted: false, reason: "read-unavailable" };
  const normalized = preferredQueueWidth(width);
  return writeWorkstationPersistence(storage, {
    ...current.value,
    schemaVersion: R6C_SCHEMA_VERSION,
    devicePreferences: {
      ...current.value.devicePreferences,
      queue: {
        ...current.value.devicePreferences.queue,
        preferredWidth: {
          ...current.value.devicePreferences.queue.preferredWidth,
          expanded: normalized,
        },
      },
    },
  });
}

export function writePreferredInspectorWidth(storage: StorageLike, width: number): PersistenceWrite {
  const current = readWorkstationPersistence(storage);
  if (current.status === "unavailable") return { persisted: false, reason: "read-unavailable" };
  const normalized = preferredInspectorWidth(width);
  return writeWorkstationPersistence(storage, {
    ...current.value,
    schemaVersion: R6C_SCHEMA_VERSION,
    devicePreferences: {
      ...current.value.devicePreferences,
      inspector: { preferredWidth: normalized },
    },
  });
}
