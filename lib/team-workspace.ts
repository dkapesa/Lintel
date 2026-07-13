import { stableFingerprint } from "./canonical-review-run";
import type { HumanDecisionLedger } from "./human-decision-ledger";
import type { Report } from "./mock-report";
import type { ReportHistoryEntry } from "./report-history";
import { reviewStateKey } from "./review-state";

export const TEAM_WORKSPACE_SCHEMA_VERSION = "1.0";
export const WORKSPACE_MEMBER_SCHEMA_VERSION = "1.0";
export const WORKSPACE_ACTIVITY_SCHEMA_VERSION = "1.0";
export const TEAM_WORKSPACE_STORAGE_KEY = "lintel.teamWorkspaces.v1";
export const ACTIVE_WORKSPACE_STORAGE_KEY = "lintel.activeTeamWorkspace.v1";
export const WORKSPACE_CHANGED_EVENT = "lintel:workspace-changed";
export const DEFAULT_WORKSPACE_ID = "tw_local_default";
export const SAMPLE_WORKSPACE_ID = "tw_platform_sample";
export const WORKSPACE_ACTIVITY_LIMIT = 80;

export type WorkspaceMode = "local" | "connected";
export type WorkspaceStatus = "active" | "archived";
export type WorkspaceMemberRole = "admin" | "maintainer" | "reviewer" | "observer";
export type WorkspaceMembershipStatus = "active" | "inactive";
export type WorkspaceMemberSource = "local" | "sample" | "github" | "unknown";

export type TeamMember = {
  memberId: string;
  schemaVersion: typeof WORKSPACE_MEMBER_SCHEMA_VERSION;
  workspaceId: string;
  displayName: string;
  safeIdentifier?: string;
  role: WorkspaceMemberRole;
  status: WorkspaceMembershipStatus;
  source: WorkspaceMemberSource;
  initials: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceRepositoryRef = {
  repositoryId: string;
  repository: string;
  owner?: string;
  name?: string;
  source: "report-history" | "github-app" | "sample" | "manual";
  connectionState: "observed" | "connected" | "unknown";
  firstObservedAt: string;
  latestObservedAt: string;
  reviewCount: number;
  attentionCount: number;
  status: "active" | "archived";
};

export type WorkspaceActivityType =
  | "review-generated"
  | "owner-changed"
  | "human-decision-recorded"
  | "decision-reaffirmed"
  | "decision-superseded"
  | "risk-accepted"
  | "risk-revoked"
  | "contract-recheck-completed"
  | "history-cleared";

export type WorkspaceActivityEvent = {
  eventId: string;
  schemaVersion: typeof WORKSPACE_ACTIVITY_SCHEMA_VERSION;
  workspaceId: string;
  type: WorkspaceActivityType;
  actorMemberId?: string;
  actorLabel?: string;
  repository?: string;
  pullRequestNumber?: number;
  reportKey?: string;
  runId?: string;
  title: string;
  summary: string;
  timestamp: string;
  source: "report-history" | "review-state" | "human-decision-ledger" | "contract-recheck" | "local" | "sample";
  fingerprint: string;
};

export type TeamWorkspace = {
  workspaceId: string;
  schemaVersion: typeof TEAM_WORKSPACE_SCHEMA_VERSION;
  name: string;
  slug: string;
  description?: string;
  mode: WorkspaceMode;
  status: WorkspaceStatus;
  repositories: WorkspaceRepositoryRef[];
  members: TeamMember[];
  settings: {
    defaultReviewOwner?: string;
    localOnly: boolean;
  };
  createdAt: string;
  updatedAt: string;
  fingerprint: string;
  limitations: string[];
};

export type WorkspaceStore = {
  schemaVersion: typeof TEAM_WORKSPACE_SCHEMA_VERSION;
  activeWorkspaceId: string;
  workspaces: TeamWorkspace[];
  reportWorkspaceIndex: Record<string, string>;
  migratedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, limit: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit)
    : "";
}

function slugify(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return slug || "workspace";
}

function initials(value: string) {
  const parts = boundedText(value, 80).split(" ").filter(Boolean);
  const label = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : (parts[0]?.slice(0, 2) ?? "LW");
  return label.toUpperCase();
}

function nowIso() {
  return new Date().toISOString();
}

function memberId(workspaceId: string, displayName: string) {
  return `wm_${stableFingerprint({ workspaceId, displayName: boundedText(displayName, 80).toLowerCase() }).slice(0, 12)}`;
}

function repositoryId(repository: string) {
  return `wr_${stableFingerprint(boundedText(repository, 120).toLowerCase()).slice(0, 12)}`;
}

function workspaceFingerprint(workspace: Omit<TeamWorkspace, "fingerprint">) {
  return stableFingerprint({
    workspaceId: workspace.workspaceId,
    schemaVersion: workspace.schemaVersion,
    name: workspace.name,
    slug: workspace.slug,
    mode: workspace.mode,
    status: workspace.status,
    repositories: workspace.repositories.map((repo) => ({
      repositoryId: repo.repositoryId,
      repository: repo.repository,
      status: repo.status,
      reviewCount: repo.reviewCount,
      attentionCount: repo.attentionCount,
    })),
    members: workspace.members.map((member) => ({
      memberId: member.memberId,
      displayName: member.displayName,
      role: member.role,
      status: member.status,
      source: member.source,
    })),
    settings: workspace.settings,
    limitations: workspace.limitations,
  });
}

function withWorkspaceFingerprint(workspace: Omit<TeamWorkspace, "fingerprint">): TeamWorkspace {
  return { ...workspace, fingerprint: workspaceFingerprint(workspace) };
}

export function createWorkspaceMember(input: {
  workspaceId: string;
  displayName: string;
  role: WorkspaceMemberRole;
  status?: WorkspaceMembershipStatus;
  source?: WorkspaceMemberSource;
  safeIdentifier?: string;
  createdAt?: string;
}): TeamMember {
  const displayName = boundedText(input.displayName, 80) || "Local reviewer";
  const createdAt = input.createdAt ?? nowIso();
  return {
    memberId: memberId(input.workspaceId, displayName),
    schemaVersion: WORKSPACE_MEMBER_SCHEMA_VERSION,
    workspaceId: input.workspaceId,
    displayName,
    safeIdentifier: input.safeIdentifier ? boundedText(input.safeIdentifier, 120) : undefined,
    role: input.role,
    status: input.status ?? "active",
    source: input.source ?? "local",
    initials: initials(displayName),
    createdAt,
    updatedAt: createdAt,
  };
}

export function createDefaultWorkspace(createdAt = nowIso()): TeamWorkspace {
  const base: Omit<TeamWorkspace, "fingerprint"> = {
    workspaceId: DEFAULT_WORKSPACE_ID,
    schemaVersion: TEAM_WORKSPACE_SCHEMA_VERSION,
    name: "Local Review Workspace",
    slug: "local-review-workspace",
    description: "Default local workspace for reviews stored on this device.",
    mode: "local",
    status: "active",
    repositories: [],
    members: [
      createWorkspaceMember({
        workspaceId: DEFAULT_WORKSPACE_ID,
        displayName: "Local reviewer",
        role: "admin",
        source: "local",
        createdAt,
      }),
    ],
    settings: { localOnly: true },
    createdAt,
    updatedAt: createdAt,
    limitations: [
      "Local workspace: data is stored on this device.",
      "Roles describe review responsibilities; they are not authenticated access controls.",
      "No live collaboration is enabled without a shared persistence layer.",
    ],
  };
  return withWorkspaceFingerprint(base);
}

export function createSampleWorkspace(createdAt = nowIso()): TeamWorkspace {
  const members = [
    createWorkspaceMember({ workspaceId: SAMPLE_WORKSPACE_ID, displayName: "Maya Chen", role: "admin", source: "sample", createdAt }),
    createWorkspaceMember({ workspaceId: SAMPLE_WORKSPACE_ID, displayName: "Amira Patel", role: "maintainer", source: "sample", createdAt }),
    createWorkspaceMember({ workspaceId: SAMPLE_WORKSPACE_ID, displayName: "Owen Brooks", role: "reviewer", source: "sample", createdAt }),
    createWorkspaceMember({ workspaceId: SAMPLE_WORKSPACE_ID, displayName: "Jules Rivera", role: "observer", source: "sample", createdAt }),
  ];
  const repositories: WorkspaceRepositoryRef[] = [
    workspaceRepositoryFromName("acme/billing-service", createdAt, "sample"),
    workspaceRepositoryFromName("acme/redemption-api", createdAt, "sample"),
    workspaceRepositoryFromName("acme/customer-portal", createdAt, "sample"),
  ];
  const base: Omit<TeamWorkspace, "fingerprint"> = {
    workspaceId: SAMPLE_WORKSPACE_ID,
    schemaVersion: TEAM_WORKSPACE_SCHEMA_VERSION,
    name: "Platform Engineering",
    slug: "platform-engineering",
    description: "Sample local workspace showing shared review ownership without live collaboration.",
    mode: "local",
    status: "active",
    repositories,
    members,
    settings: { defaultReviewOwner: members[0]?.memberId, localOnly: true },
    createdAt,
    updatedAt: createdAt,
    limitations: [
      "Sample local workspace: data is stored on this device.",
      "Membership is responsibility metadata, not authenticated access control.",
    ],
  };
  return withWorkspaceFingerprint(base);
}

function workspaceRepositoryFromName(repository: string, timestamp: string, source: WorkspaceRepositoryRef["source"], reviewCount = 0, attentionCount = 0): WorkspaceRepositoryRef {
  const normalized = boundedText(repository, 120) || "unknown/repository";
  const [owner, ...rest] = normalized.split("/");
  const name = rest.join("/") || normalized;
  return {
    repositoryId: repositoryId(normalized),
    repository: normalized,
    owner: rest.length > 0 ? owner : undefined,
    name: rest.length > 0 ? name : undefined,
    source,
    connectionState: source === "github-app" ? "connected" : "observed",
    firstObservedAt: timestamp,
    latestObservedAt: timestamp,
    reviewCount,
    attentionCount,
    status: "active",
  };
}

export function reportHistoryEntryKey(entry: ReportHistoryEntry) {
  return `history:${entry.createdAt}:${stableFingerprint({
    repository: entry.metadata.repository,
    title: entry.metadata.title,
    inputLabel: entry.inputLabel,
  }).slice(0, 10)}`;
}

export function reportWorkspaceKey(entry: ReportHistoryEntry) {
  return reviewStateKey(entry.metadata.repository, entry.metadata.title, entry.inputLabel);
}

export function workspaceScopedReviewKey(workspaceId: string, key: string) {
  return `${workspaceId}\u001f${key}`;
}

function parseMember(value: unknown, workspaceId: string): TeamMember | null {
  if (!isRecord(value)) return null;
  const displayName = boundedText(value.displayName, 80);
  if (!displayName) return null;
  const role = ["admin", "maintainer", "reviewer", "observer"].includes(String(value.role)) ? value.role as WorkspaceMemberRole : "reviewer";
  const status = value.status === "inactive" ? "inactive" : "active";
  const source = ["local", "sample", "github", "unknown"].includes(String(value.source)) ? value.source as WorkspaceMemberSource : "unknown";
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : nowIso();
  return {
    memberId: typeof value.memberId === "string" ? boundedText(value.memberId, 80) : memberId(workspaceId, displayName),
    schemaVersion: WORKSPACE_MEMBER_SCHEMA_VERSION,
    workspaceId,
    displayName,
    safeIdentifier: typeof value.safeIdentifier === "string" ? boundedText(value.safeIdentifier, 120) : undefined,
    role,
    status,
    source,
    initials: typeof value.initials === "string" ? boundedText(value.initials, 4).toUpperCase() || initials(displayName) : initials(displayName),
    createdAt,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : createdAt,
  };
}

function parseRepository(value: unknown): WorkspaceRepositoryRef | null {
  if (!isRecord(value)) return null;
  const repository = boundedText(value.repository, 120);
  if (!repository) return null;
  const createdAt = typeof value.firstObservedAt === "string" ? value.firstObservedAt : nowIso();
  return {
    repositoryId: typeof value.repositoryId === "string" ? boundedText(value.repositoryId, 80) : repositoryId(repository),
    repository,
    owner: typeof value.owner === "string" ? boundedText(value.owner, 80) : undefined,
    name: typeof value.name === "string" ? boundedText(value.name, 80) : undefined,
    source: ["report-history", "github-app", "sample", "manual"].includes(String(value.source)) ? value.source as WorkspaceRepositoryRef["source"] : "manual",
    connectionState: ["observed", "connected", "unknown"].includes(String(value.connectionState)) ? value.connectionState as WorkspaceRepositoryRef["connectionState"] : "observed",
    firstObservedAt: createdAt,
    latestObservedAt: typeof value.latestObservedAt === "string" ? value.latestObservedAt : createdAt,
    reviewCount: typeof value.reviewCount === "number" ? Math.max(0, Math.min(value.reviewCount, 999)) : 0,
    attentionCount: typeof value.attentionCount === "number" ? Math.max(0, Math.min(value.attentionCount, 999)) : 0,
    status: value.status === "archived" ? "archived" : "active",
  };
}

function parseWorkspace(value: unknown): TeamWorkspace | null {
  if (!isRecord(value)) return null;
  const workspaceId = boundedText(value.workspaceId, 80);
  const name = boundedText(value.name, 80);
  if (!workspaceId || !name) return null;
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : nowIso();
  const members = Array.isArray(value.members) ? value.members.flatMap((item) => {
    const member = parseMember(item, workspaceId);
    return member ? [member] : [];
  }) : [];
  const repositories = Array.isArray(value.repositories) ? value.repositories.flatMap((item) => {
    const repository = parseRepository(item);
    return repository ? [repository] : [];
  }) : [];
  const base: Omit<TeamWorkspace, "fingerprint"> = {
    workspaceId,
    schemaVersion: TEAM_WORKSPACE_SCHEMA_VERSION,
    name,
    slug: typeof value.slug === "string" ? boundedText(value.slug, 64) || slugify(name) : slugify(name),
    description: typeof value.description === "string" ? boundedText(value.description, 200) : undefined,
    mode: value.mode === "connected" ? "connected" : "local",
    status: value.status === "archived" ? "archived" : "active",
    repositories,
    members: members.length > 0 ? members : [createWorkspaceMember({ workspaceId, displayName: "Local reviewer", role: "admin", source: "local", createdAt })],
    settings: {
      defaultReviewOwner: isRecord(value.settings) && typeof value.settings.defaultReviewOwner === "string"
        ? boundedText(value.settings.defaultReviewOwner, 80)
        : undefined,
      localOnly: !(value.mode === "connected"),
    },
    createdAt,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : createdAt,
    limitations: Array.isArray(value.limitations)
      ? value.limitations.flatMap((item) => typeof item === "string" ? [boundedText(item, 160)] : []).slice(0, 6)
      : ["Local workspace: data is stored on this device."],
  };
  return withWorkspaceFingerprint(base);
}

function readRawStore(storage: Storage): WorkspaceStore | null {
  try {
    const stored = storage.getItem(TEAM_WORKSPACE_STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return null;
    const workspaces = Array.isArray(parsed.workspaces) ? parsed.workspaces.flatMap((item) => {
      const workspace = parseWorkspace(item);
      return workspace ? [workspace] : [];
    }) : [];
    if (workspaces.length === 0) return null;
    const index = isRecord(parsed.reportWorkspaceIndex)
      ? Object.entries(parsed.reportWorkspaceIndex).reduce<Record<string, string>>((result, [key, value]) => {
        if (typeof value === "string") result[boundedText(key, 180)] = boundedText(value, 80);
        return result;
      }, {})
      : {};
    const activeWorkspaceId = typeof parsed.activeWorkspaceId === "string" ? boundedText(parsed.activeWorkspaceId, 80) : DEFAULT_WORKSPACE_ID;
    return {
      schemaVersion: TEAM_WORKSPACE_SCHEMA_VERSION,
      activeWorkspaceId,
      workspaces,
      reportWorkspaceIndex: index,
      migratedAt: typeof parsed.migratedAt === "string" ? parsed.migratedAt : nowIso(),
    };
  } catch {
    return null;
  }
}

function writeStore(storage: Storage, store: WorkspaceStore) {
  storage.setItem(TEAM_WORKSPACE_STORAGE_KEY, JSON.stringify(store));
  storage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, store.activeWorkspaceId);
  return store;
}

function reportNeedsAttention(report: Report) {
  return report.verdict.recommendation !== "APPROVE"
    || report.missingTests.length > 0
    || report.conditionsBeforeMerge.length > 0
    || report.verdict.riskLevel === "HIGH"
    || report.verdict.riskLevel === "CRITICAL";
}

function mergeRepositories(workspace: TeamWorkspace, entries: ReportHistoryEntry[]) {
  const byId = new Map(workspace.repositories
    .filter((repo) => repo.source !== "report-history")
    .map((repo) => [repo.repositoryId, repo]));
  for (const entry of entries) {
    const timestamp = entry.createdAt;
    const id = repositoryId(entry.metadata.repository);
    const existing = byId.get(id);
    if (existing) {
      byId.set(id, {
        ...existing,
        latestObservedAt: Date.parse(timestamp) > Date.parse(existing.latestObservedAt) ? timestamp : existing.latestObservedAt,
        firstObservedAt: Date.parse(timestamp) < Date.parse(existing.firstObservedAt) ? timestamp : existing.firstObservedAt,
        reviewCount: existing.reviewCount + 1,
        attentionCount: existing.attentionCount + (reportNeedsAttention(entry.report) ? 1 : 0),
      });
    } else {
      byId.set(id, workspaceRepositoryFromName(entry.metadata.repository, timestamp, "report-history", 1, reportNeedsAttention(entry.report) ? 1 : 0));
    }
  }
  return [...byId.values()].sort((a, b) => a.repository.localeCompare(b.repository));
}

export function ensureWorkspaceStore(storage: Storage, history: ReportHistoryEntry[] = []): WorkspaceStore {
  const timestamp = nowIso();
  const existing = readRawStore(storage);
  const workspaces = existing?.workspaces.length ? [...existing.workspaces] : [createDefaultWorkspace(timestamp), createSampleWorkspace(timestamp)];
  if (!workspaces.some((workspace) => workspace.workspaceId === DEFAULT_WORKSPACE_ID)) {
    workspaces.unshift(createDefaultWorkspace(timestamp));
  }
  if (!workspaces.some((workspace) => workspace.workspaceId === SAMPLE_WORKSPACE_ID)) {
    workspaces.push(createSampleWorkspace(timestamp));
  }

  const reportWorkspaceIndex = { ...(existing?.reportWorkspaceIndex ?? {}) };
  for (const entry of history) {
    const key = reportHistoryEntryKey(entry);
    if (!reportWorkspaceIndex[key]) reportWorkspaceIndex[key] = DEFAULT_WORKSPACE_ID;
  }

  const defaultEntries = history.filter((entry) => reportWorkspaceIndex[reportHistoryEntryKey(entry)] === DEFAULT_WORKSPACE_ID);
  const nextWorkspaces = workspaces.map((workspace) => {
    if (workspace.workspaceId !== DEFAULT_WORKSPACE_ID) return workspace;
    const base: Omit<TeamWorkspace, "fingerprint"> = {
      ...workspace,
      repositories: mergeRepositories(workspace, defaultEntries),
      updatedAt: timestamp,
    };
    return withWorkspaceFingerprint(base);
  });
  const storedActive = existing?.activeWorkspaceId
    ?? (() => {
      try {
        return storage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY) ?? DEFAULT_WORKSPACE_ID;
      } catch {
        return DEFAULT_WORKSPACE_ID;
      }
    })();
  const activeWorkspaceId = nextWorkspaces.some((workspace) => workspace.workspaceId === storedActive && workspace.status === "active")
    ? storedActive
    : DEFAULT_WORKSPACE_ID;

  return writeStore(storage, {
    schemaVersion: TEAM_WORKSPACE_SCHEMA_VERSION,
    activeWorkspaceId,
    workspaces: nextWorkspaces,
    reportWorkspaceIndex,
    migratedAt: existing?.migratedAt ?? timestamp,
  });
}

export function readWorkspaceStore(storage: Storage, history: ReportHistoryEntry[] = []) {
  return ensureWorkspaceStore(storage, history);
}

export function setActiveWorkspace(storage: Storage, workspaceId: string, history: ReportHistoryEntry[] = []) {
  const store = ensureWorkspaceStore(storage, history);
  const nextId = store.workspaces.some((workspace) => workspace.workspaceId === workspaceId && workspace.status === "active")
    ? workspaceId
    : store.activeWorkspaceId;
  return writeStore(storage, { ...store, activeWorkspaceId: nextId });
}

export function activeWorkspace(store: WorkspaceStore) {
  return store.workspaces.find((workspace) => workspace.workspaceId === store.activeWorkspaceId)
    ?? store.workspaces.find((workspace) => workspace.workspaceId === DEFAULT_WORKSPACE_ID)
    ?? store.workspaces[0];
}

export function associateReportWithWorkspace(storage: Storage, entry: ReportHistoryEntry, workspaceId?: string) {
  const store = ensureWorkspaceStore(storage, [entry]);
  const target = workspaceId && store.workspaces.some((workspace) => workspace.workspaceId === workspaceId)
    ? workspaceId
    : store.activeWorkspaceId;
  const next = {
    ...store,
    reportWorkspaceIndex: {
      ...store.reportWorkspaceIndex,
      [reportHistoryEntryKey(entry)]: target,
    },
  };
  return writeStore(storage, next);
}

export function workspaceIdForReportEntry(entry: ReportHistoryEntry, store: WorkspaceStore) {
  return store.reportWorkspaceIndex[reportHistoryEntryKey(entry)] ?? DEFAULT_WORKSPACE_ID;
}

export function createLocalWorkspace(storage: Storage, name: string) {
  const store = ensureWorkspaceStore(storage);
  const timestamp = nowIso();
  const workspaceId = `tw_${stableFingerprint({ name: boundedText(name, 80), timestamp }).slice(0, 12)}`;
  const base: Omit<TeamWorkspace, "fingerprint"> = {
    workspaceId,
    schemaVersion: TEAM_WORKSPACE_SCHEMA_VERSION,
    name: boundedText(name, 80) || "Local workspace",
    slug: slugify(name),
    mode: "local",
    status: "active",
    repositories: [],
    members: [createWorkspaceMember({ workspaceId, displayName: "Local reviewer", role: "admin", source: "local", createdAt: timestamp })],
    settings: { localOnly: true },
    createdAt: timestamp,
    updatedAt: timestamp,
    limitations: ["Local workspace: data is stored on this device.", "Roles are responsibility metadata, not authenticated access controls."],
  };
  const workspace = withWorkspaceFingerprint(base);
  return writeStore(storage, { ...store, activeWorkspaceId: workspaceId, workspaces: [...store.workspaces, workspace] });
}

export function renameWorkspace(storage: Storage, workspaceId: string, name: string) {
  const store = ensureWorkspaceStore(storage);
  const timestamp = nowIso();
  return writeStore(storage, {
    ...store,
    workspaces: store.workspaces.map((workspace) => {
      if (workspace.workspaceId !== workspaceId || workspace.workspaceId === DEFAULT_WORKSPACE_ID && !boundedText(name, 80)) return workspace;
      const base: Omit<TeamWorkspace, "fingerprint"> = {
        ...workspace,
        name: boundedText(name, 80) || workspace.name,
        slug: slugify(name || workspace.name),
        updatedAt: timestamp,
      };
      return withWorkspaceFingerprint(base);
    }),
  });
}

export function archiveWorkspace(storage: Storage, workspaceId: string) {
  const store = ensureWorkspaceStore(storage);
  if (workspaceId === DEFAULT_WORKSPACE_ID) return store;
  const timestamp = nowIso();
  const nextWorkspaces = store.workspaces.map((workspace) => {
    if (workspace.workspaceId !== workspaceId) return workspace;
    const base: Omit<TeamWorkspace, "fingerprint"> = { ...workspace, status: "archived", updatedAt: timestamp };
    return withWorkspaceFingerprint(base);
  });
  const nextActive = store.activeWorkspaceId === workspaceId ? DEFAULT_WORKSPACE_ID : store.activeWorkspaceId;
  return writeStore(storage, { ...store, activeWorkspaceId: nextActive, workspaces: nextWorkspaces });
}

export function upsertWorkspaceMember(storage: Storage, workspaceId: string, input: { displayName: string; role: WorkspaceMemberRole; memberId?: string }) {
  const store = ensureWorkspaceStore(storage);
  const timestamp = nowIso();
  return writeStore(storage, {
    ...store,
    workspaces: store.workspaces.map((workspace) => {
      if (workspace.workspaceId !== workspaceId || workspace.mode !== "local") return workspace;
      const displayName = boundedText(input.displayName, 80);
      if (!displayName) return workspace;
      const nextMember = input.memberId
        ? workspace.members.map((member) => member.memberId === input.memberId ? { ...member, displayName, role: input.role, initials: initials(displayName), updatedAt: timestamp } : member)
        : [...workspace.members, createWorkspaceMember({ workspaceId, displayName, role: input.role, source: "local", createdAt: timestamp })];
      const base: Omit<TeamWorkspace, "fingerprint"> = { ...workspace, members: nextMember, updatedAt: timestamp };
      return withWorkspaceFingerprint(base);
    }),
  });
}

export function setWorkspaceMemberStatus(storage: Storage, workspaceId: string, memberId: string, status: WorkspaceMembershipStatus) {
  const store = ensureWorkspaceStore(storage);
  const timestamp = nowIso();
  return writeStore(storage, {
    ...store,
    workspaces: store.workspaces.map((workspace) => {
      if (workspace.workspaceId !== workspaceId || workspace.mode !== "local") return workspace;
      const activeAdmins = workspace.members.filter((member) => member.status === "active" && member.role === "admin");
      const target = workspace.members.find((member) => member.memberId === memberId);
      if (target?.role === "admin" && status === "inactive" && activeAdmins.length <= 1) return workspace;
      const base: Omit<TeamWorkspace, "fingerprint"> = {
        ...workspace,
        members: workspace.members.map((member) => member.memberId === memberId ? { ...member, status, updatedAt: timestamp } : member),
        updatedAt: timestamp,
      };
      return withWorkspaceFingerprint(base);
    }),
  });
}

export function activeAssignableMembers(workspace: TeamWorkspace) {
  return workspace.members.filter((member) => member.status === "active" && member.role !== "observer");
}

export function findMemberByOwnerLabel(workspace: TeamWorkspace | null | undefined, label: string) {
  if (!workspace) return null;
  return workspace.members.find((member) => member.displayName === label) ?? null;
}

function activityFingerprint(value: Omit<WorkspaceActivityEvent, "fingerprint">) {
  return stableFingerprint({
    type: value.type,
    workspaceId: value.workspaceId,
    reportKey: value.reportKey,
    runId: value.runId,
    title: value.title,
    timestamp: value.timestamp,
    actorLabel: value.actorLabel,
  });
}

function createActivityEvent(value: Omit<WorkspaceActivityEvent, "schemaVersion" | "fingerprint" | "eventId"> & { eventId?: string }): WorkspaceActivityEvent {
  const base: Omit<WorkspaceActivityEvent, "fingerprint"> = {
    ...value,
    eventId: value.eventId ?? `wa_${stableFingerprint(value).slice(0, 14)}`,
    schemaVersion: WORKSPACE_ACTIVITY_SCHEMA_VERSION,
  };
  return { ...base, fingerprint: activityFingerprint(base) };
}

export function deriveWorkspaceActivity(input: {
  workspace: TeamWorkspace;
  history: ReportHistoryEntry[];
  ledgers?: HumanDecisionLedger[];
}): WorkspaceActivityEvent[] {
  const events: WorkspaceActivityEvent[] = [];
  for (const entry of input.history) {
    events.push(createActivityEvent({
      workspaceId: input.workspace.workspaceId,
      type: "review-generated",
      repository: entry.metadata.repository,
      reportKey: reportHistoryEntryKey(entry),
      runId: entry.canonicalRun?.runId,
      title: "Review generated",
      summary: `${entry.metadata.title} · ${entry.metadata.recommendation.replaceAll("_", " ").toLowerCase()}`,
      timestamp: entry.createdAt,
      source: "report-history",
    }));
    if (entry.contractRecheck) {
      events.push(createActivityEvent({
        workspaceId: input.workspace.workspaceId,
        type: "contract-recheck-completed",
        repository: entry.metadata.repository,
        reportKey: reportHistoryEntryKey(entry),
        runId: entry.canonicalRun?.runId,
        title: "Contract re-check completed",
        summary: `${entry.contractRecheck.classification} · ${entry.contractRecheck.previousHeadSha?.slice(0, 7) ?? "previous"} → ${entry.contractRecheck.currentHeadSha?.slice(0, 7) ?? "current"}`,
        timestamp: entry.contractRecheck.triggeredAt,
        source: "contract-recheck",
      }));
    }
  }
  for (const ledger of input.ledgers ?? []) {
    for (const entry of ledger.entries.slice(-12)) {
      events.push(createActivityEvent({
        workspaceId: input.workspace.workspaceId,
        type: entry.eventType === "risk-accepted" ? "risk-accepted" : entry.eventType === "risk-acceptance-revoked" ? "risk-revoked" : "human-decision-recorded",
        actorLabel: entry.actor.displayLabel,
        actorMemberId: entry.actor.memberId,
        repository: entry.repository,
        runId: entry.canonicalRunId,
        title: entry.eventType.replaceAll("-", " "),
        summary: entry.outcome ? `${entry.outcome.replaceAll("-", " ")} · ${entry.reason ?? "No reason recorded"}` : entry.reason ?? "Ledger event recorded",
        timestamp: entry.recordedAt,
        source: "human-decision-ledger",
      }));
    }
  }
  const byId = new Map(events.map((event) => [event.eventId, event]));
  return [...byId.values()]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, WORKSPACE_ACTIVITY_LIMIT);
}

export function workspaceLabel(workspace: TeamWorkspace | null | undefined) {
  if (!workspace) return "Local workspace";
  return workspace.mode === "connected" ? "Connected workspace" : "Local workspace";
}
