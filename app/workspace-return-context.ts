export const WORKSPACE_RETURN_CONTEXT_KEY = "lintel.r4f.workspaceReturnContext.v1";

export type WorkspaceReturnMode =
  | "overview"
  | "change"
  | "evidence"
  | "requirements"
  | "history";

export type WorkspaceReturnSelection = {
  kind:
    | "change"
    | "finding"
    | "evidence"
    | "missing-proof"
    | "requirement"
    | "run"
    | "history-change"
    | "decision-readiness"
    | "decision-event";
  id: string;
};

export type WorkspaceReturnContext = {
  version: 1;
  source: "real" | "fixture";
  caseId: string;
  mode: WorkspaceReturnMode;
  selection: WorkspaceReturnSelection | null;
  comparisonRunId: string | null;
  queueCollapsed: boolean;
  collapsedGroups: string[];
  inspectorOpen: boolean;
  focusMode: boolean;
  scrollTop: number;
  capturedAt: string;
};

const MODES = new Set<WorkspaceReturnMode>([
  "overview",
  "change",
  "evidence",
  "requirements",
  "history",
]);

const SELECTION_KINDS = new Set<WorkspaceReturnSelection["kind"]>([
  "change",
  "finding",
  "evidence",
  "missing-proof",
  "requirement",
  "run",
  "history-change",
  "decision-readiness",
  "decision-event",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseSelection(value: unknown): WorkspaceReturnSelection | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  if (typeof value.kind !== "string" || !SELECTION_KINDS.has(value.kind as WorkspaceReturnSelection["kind"])) return undefined;
  if (typeof value.id !== "string" || value.id.length === 0 || value.id.length > 512) return undefined;
  return { kind: value.kind as WorkspaceReturnSelection["kind"], id: value.id };
}

export function readWorkspaceReturnContext(storage: Storage): WorkspaceReturnContext | null {
  try {
    const raw = storage.getItem(WORKSPACE_RETURN_CONTEXT_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1) return null;
    if (value.source !== "real" && value.source !== "fixture") return null;
    if (typeof value.caseId !== "string" || value.caseId.length === 0 || value.caseId.length > 512) return null;
    if (typeof value.mode !== "string" || !MODES.has(value.mode as WorkspaceReturnMode)) return null;
    const selection = parseSelection(value.selection);
    if (selection === undefined) return null;
    if (value.comparisonRunId !== null && (typeof value.comparisonRunId !== "string" || value.comparisonRunId.length > 512)) return null;
    if (typeof value.queueCollapsed !== "boolean" || typeof value.inspectorOpen !== "boolean" || typeof value.focusMode !== "boolean") return null;
    if (!Array.isArray(value.collapsedGroups) || value.collapsedGroups.some((item) => typeof item !== "string" || item.length > 128)) return null;
    if (typeof value.scrollTop !== "number" || !Number.isFinite(value.scrollTop) || value.scrollTop < 0) return null;
    if (typeof value.capturedAt !== "string" || Number.isNaN(Date.parse(value.capturedAt))) return null;

    return {
      version: 1,
      source: value.source,
      caseId: value.caseId,
      mode: value.mode as WorkspaceReturnMode,
      selection,
      comparisonRunId: value.comparisonRunId as string | null,
      queueCollapsed: value.queueCollapsed,
      collapsedGroups: value.collapsedGroups as string[],
      inspectorOpen: value.inspectorOpen,
      focusMode: value.focusMode,
      scrollTop: Math.min(value.scrollTop, 10_000_000),
      capturedAt: value.capturedAt,
    };
  } catch {
    return null;
  }
}

export function writeWorkspaceReturnContext(storage: Storage, context: WorkspaceReturnContext) {
  storage.setItem(WORKSPACE_RETURN_CONTEXT_KEY, JSON.stringify(context));
}

export function clearWorkspaceReturnContext(storage: Storage) {
  storage.removeItem(WORKSPACE_RETURN_CONTEXT_KEY);
}

export function workspaceReturnHref(context: WorkspaceReturnContext | null) {
  if (!context) return "/workspace";
  return context.source === "fixture"
    ? "/workspace?source=fixture&restore=1"
    : "/workspace?restore=1";
}
