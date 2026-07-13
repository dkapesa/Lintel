"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../app-shell";
import { readReportHistory, type ReportHistoryEntry } from "../../lib/report-history";
import { defaultReviewState, readReviewStates, type ReportReviewState } from "../../lib/review-state";
import { ownerDisplay, suggestedReviewerOwners } from "../../lib/reviewer-ownership";
import {
  activeWorkspace,
  archiveWorkspace,
  createLocalWorkspace,
  deriveWorkspaceActivity,
  ensureWorkspaceStore,
  DEFAULT_WORKSPACE_ID,
  renameWorkspace,
  reportWorkspaceKey,
  SAMPLE_WORKSPACE_ID,
  setWorkspaceMemberStatus,
  upsertWorkspaceMember,
  workspaceIdForReportEntry,
  workspaceLabel,
  workspaceScopedReviewKey,
  WORKSPACE_CHANGED_EVENT,
  type TeamMember,
  type TeamWorkspace,
  type WorkspaceActivityEvent,
  type WorkspaceMemberRole,
  type WorkspaceStore,
} from "../../lib/team-workspace";

const ROLE_OPTIONS: WorkspaceMemberRole[] = ["admin", "maintainer", "reviewer", "observer"];

type ReviewRow = {
  entry: ReportHistoryEntry;
  reviewState: ReportReviewState;
  ownerLabel: string;
  openBlocking: number;
};

function formatTime(value?: string) {
  if (!value) return "No activity";
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

function attentionNeeded(entry: ReportHistoryEntry, state: ReportReviewState) {
  return state.status === "Blocked"
    || state.status === "Tests requested"
    || state.status === "Review required"
    || entry.report.verdict.recommendation !== "APPROVE"
    || entry.report.conditionsBeforeMerge.length > 0
    || (entry.mergeContract?.clauses ?? []).some((clause) => clause.importance === "blocking" && clause.status === "open");
}

function scopedReviewStates(storage: Storage, entries: ReportHistoryEntry[], workspaceId: string) {
  const raw = readReviewStates(storage);
  const states = new Map<string, ReportReviewState>();
  for (const entry of entries) {
    const key = reportWorkspaceKey(entry);
    states.set(key, raw[workspaceScopedReviewKey(workspaceId, key)] ?? raw[key] ?? defaultReviewState(entry.report));
  }
  return states;
}

function reviewRows(entries: ReportHistoryEntry[], states: Map<string, ReportReviewState>): ReviewRow[] {
  return entries.map((entry) => {
    const state = states.get(reportWorkspaceKey(entry)) ?? defaultReviewState(entry.report);
    const ownerLabel = ownerDisplay(state.owner, suggestedReviewerOwners(entry.report));
    return {
      entry,
      reviewState: state,
      ownerLabel,
      openBlocking: (entry.mergeContract?.clauses ?? []).filter((clause) => clause.importance === "blocking" && clause.status === "open").length,
    };
  }).sort((a, b) => Date.parse(b.entry.createdAt) - Date.parse(a.entry.createdAt));
}

function memberAssignedCount(member: TeamMember, rows: ReviewRow[]) {
  return rows.filter((row) => row.reviewState.owner === member.displayName).length;
}

function latestForRepository(repository: string, entries: ReportHistoryEntry[]) {
  return entries
    .filter((entry) => entry.metadata.repository === repository)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

function sampleActivity(workspace: TeamWorkspace): WorkspaceActivityEvent[] {
  const timestamp = new Date().toISOString();
  return [
    {
      eventId: "wa_sample_recheck",
      schemaVersion: "1.0",
      workspaceId: workspace.workspaceId,
      type: "contract-recheck-completed",
      actorLabel: "Lintel",
      repository: "acme/billing-service",
      title: "Contract re-check completed",
      summary: "Mixed · one clause newly satisfied, one accepted risk stale",
      timestamp,
      source: "sample",
      fingerprint: "sample-recheck",
    },
    {
      eventId: "wa_sample_risk",
      schemaVersion: "1.0",
      workspaceId: workspace.workspaceId,
      type: "risk-accepted",
      actorLabel: "Maya Chen",
      repository: "acme/redemption-api",
      title: "Risk accepted",
      summary: "Accepted one advisory operational requirement for the current local demo.",
      timestamp,
      source: "sample",
      fingerprint: "sample-risk",
    },
  ];
}

function WorkspaceModeNote({ workspace }: { workspace: TeamWorkspace }) {
  return (
    <p className="team-mode-note">
      {workspaceLabel(workspace)} · data stored on this device. Roles and membership are responsibility metadata, not authenticated access control.
    </p>
  );
}

export default function TeamWorkspacePage() {
  const [store, setStore] = useState<WorkspaceStore | null>(null);
  const [history, setHistory] = useState<ReportHistoryEntry[]>([]);
  const [reviewStates, setReviewStates] = useState<Map<string, ReportReviewState>>(new Map());
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<WorkspaceMemberRole>("reviewer");
  const [renameValue, setRenameValue] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    const allHistory = readReportHistory(window.localStorage);
    const nextStore = ensureWorkspaceStore(window.localStorage, allHistory);
    const workspaceId = nextStore.activeWorkspaceId;
    const scopedHistory = allHistory.filter((entry) => workspaceIdForReportEntry(entry, nextStore) === workspaceId);
    setStore(nextStore);
    setHistory(scopedHistory);
    setReviewStates(scopedReviewStates(window.localStorage, scopedHistory, workspaceId));
    setRenameValue(activeWorkspace(nextStore)?.name ?? "");
  }

  useEffect(() => {
    try {
      load();
    } catch {
      setError("Team workspace data could not be read from local storage.");
    }
    const onWorkspaceChange = () => {
      try {
        load();
      } catch {
        setError("Team workspace data could not be refreshed.");
      }
    };
    window.addEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChange);
    return () => window.removeEventListener(WORKSPACE_CHANGED_EVENT, onWorkspaceChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const workspace = store ? activeWorkspace(store) : null;
  const rows = useMemo(() => reviewRows(history, reviewStates), [history, reviewStates]);
  const needsAttention = rows.filter((row) => attentionNeeded(row.entry, row.reviewState));
  const assignedRows = rows.filter((row) => row.reviewState.owner !== "Unassigned");
  const activeMembers = workspace?.members.filter((member) => member.status === "active") ?? [];
  const derivedActivity = workspace ? deriveWorkspaceActivity({ workspace, history }) : [];
  const activity = workspace
    ? (derivedActivity.length > 0 ? derivedActivity : workspace.workspaceId === SAMPLE_WORKSPACE_ID ? sampleActivity(workspace) : [])
    : [];

  function refreshAfter(nextStore: WorkspaceStore) {
    setStore(nextStore);
    window.dispatchEvent(new Event(WORKSPACE_CHANGED_EVENT));
    load();
  }

  function addMember() {
    if (!workspace) return;
    try {
      refreshAfter(upsertWorkspaceMember(window.localStorage, workspace.workspaceId, { displayName: memberName, role: memberRole }));
      setMemberName("");
      setMemberRole("reviewer");
      setError(null);
    } catch {
      setError("Local member could not be saved.");
    }
  }

  function updateMember(member: TeamMember, role: WorkspaceMemberRole) {
    if (!workspace) return;
    try {
      refreshAfter(upsertWorkspaceMember(window.localStorage, workspace.workspaceId, { memberId: member.memberId, displayName: member.displayName, role }));
    } catch {
      setError("Local member role could not be updated.");
    }
  }

  function toggleMember(member: TeamMember) {
    if (!workspace) return;
    try {
      refreshAfter(setWorkspaceMemberStatus(window.localStorage, workspace.workspaceId, member.memberId, member.status === "active" ? "inactive" : "active"));
    } catch {
      setError("Local member status could not be updated.");
    }
  }

  function renameActiveWorkspace() {
    if (!workspace) return;
    try {
      refreshAfter(renameWorkspace(window.localStorage, workspace.workspaceId, renameValue));
    } catch {
      setError("Workspace name could not be saved.");
    }
  }

  function createWorkspace() {
    try {
      refreshAfter(createLocalWorkspace(window.localStorage, newWorkspaceName));
      setNewWorkspaceName("");
    } catch {
      setError("Local workspace could not be created.");
    }
  }

  function archiveCurrentWorkspace() {
    if (!workspace) return;
    try {
      refreshAfter(archiveWorkspace(window.localStorage, workspace.workspaceId));
    } catch {
      setError("Workspace could not be archived.");
    }
  }

  const shellContext = workspace ? `${workspace.name} · ${workspaceLabel(workspace)}` : "Local workspace";

  return (
    <AppShell title="Team workspace" context={shellContext}>
      <div className="workspace-main team-main">
        <header className="team-hero">
          <div>
            <span className="eyebrow">Shared team foundation</span>
            <h1>{workspace?.name ?? "Team workspace"}</h1>
            {workspace ? <WorkspaceModeNote workspace={workspace} /> : <p className="team-mode-note">Loading local workspace context.</p>}
          </div>
          <div className="team-hero-actions">
            <Link className="workspace-secondary-action" href="/workspace">Risk inbox</Link>
            <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
          </div>
        </header>

        {error && <p className="workspace-error" role="alert">{error}</p>}

        {workspace && (
          <>
            <section className="team-overview" aria-label="Workspace overview">
              <article><span>Repositories</span><strong>{workspace.repositories.length}</strong><p>Observed in this workspace.</p></article>
              <article><span>Active members</span><strong>{activeMembers.length}</strong><p>Local responsibility profiles.</p></article>
              <article><span>Needs attention</span><strong>{needsAttention.length}</strong><p>Reviews with unresolved action.</p></article>
              <article><span>Assigned reviews</span><strong>{assignedRows.length}</strong><p>Owned by a member or reviewer cue.</p></article>
            </section>

            <section className="team-surface" aria-labelledby="workspace-settings-title">
              <div className="team-section-head">
                <div>
                  <h2 id="workspace-settings-title">Workspace definition</h2>
                  <p>Local workspaces organise reports and ownership on this device. They are structured for a future shared backend without claiming live collaboration today.</p>
                </div>
              </div>
              <div className="team-form-grid">
                <label>
                  <span>Workspace name</span>
                  <input value={renameValue} maxLength={80} onChange={(event) => setRenameValue(event.target.value)} />
                </label>
                <button className="workspace-secondary-action" type="button" onClick={renameActiveWorkspace}>Rename local workspace</button>
                <label>
                  <span>Create local workspace</span>
                  <input value={newWorkspaceName} maxLength={80} onChange={(event) => setNewWorkspaceName(event.target.value)} placeholder="Payments review" />
                </label>
                <button className="workspace-secondary-action" type="button" onClick={createWorkspace}>Create workspace</button>
                {workspace.workspaceId !== DEFAULT_WORKSPACE_ID && (
                  <button className="workspace-inspector-delete" type="button" onClick={archiveCurrentWorkspace}>Archive this workspace</button>
                )}
              </div>
            </section>

            <section className="team-surface" aria-labelledby="members-title">
              <div className="team-section-head">
                <div>
                  <h2 id="members-title">Members</h2>
                  <p>Members are local responsibility profiles. Adding one does not create an account or send an invitation.</p>
                </div>
              </div>
              <div className="team-member-form">
                <label>
                  <span>Add workspace member</span>
                  <input value={memberName} maxLength={80} onChange={(event) => setMemberName(event.target.value)} placeholder="Maya Chen" />
                </label>
                <label>
                  <span>Responsibility role</span>
                  <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as WorkspaceMemberRole)}>
                    {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </label>
                <button className="workspace-primary-action" type="button" onClick={addMember}>Add local member</button>
              </div>
              <div className="team-rows">
                {workspace.members.map((member) => (
                  <article className="team-row team-row--member" key={member.memberId}>
                    <div className="team-avatar" aria-hidden="true">{member.initials}</div>
                    <div>
                      <strong>{member.displayName}</strong>
                      <span>{member.status} · {member.source} · {memberAssignedCount(member, rows)} assigned reviews</span>
                    </div>
                    <select value={member.role} onChange={(event) => updateMember(member, event.target.value as WorkspaceMemberRole)} aria-label={`Role for ${member.displayName}`}>
                      {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <button className="workspace-secondary-action" type="button" onClick={() => toggleMember(member)}>
                      {member.status === "active" ? "Deactivate" : "Reactivate"}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="team-surface" aria-labelledby="repositories-title">
              <div className="team-section-head">
                <div>
                  <h2 id="repositories-title">Repositories</h2>
                  <p>Repository membership is derived from local report history and known GitHub connection records.</p>
                </div>
              </div>
              <div className="team-table" role="table" aria-label="Workspace repositories">
                <div role="row" className="team-table-head"><span>Repository</span><span>Reviews</span><span>Attention</span><span>Latest review</span></div>
                {workspace.repositories.length > 0 ? workspace.repositories.map((repo) => {
                  const latest = latestForRepository(repo.repository, history);
                  return (
                    <div role="row" className="team-table-row" key={repo.repositoryId}>
                      <span>{repo.repository}</span>
                      <span>{repo.reviewCount}</span>
                      <span>{repo.attentionCount}</span>
                      <span>{latest ? formatTime(latest.createdAt) : "No local review yet"}</span>
                    </div>
                  );
                }) : <p className="team-empty">No repositories observed yet. Generate a report in this workspace to add one.</p>}
              </div>
            </section>

            <section className="team-surface" aria-labelledby="ownership-title">
              <div className="team-section-head">
                <div>
                  <h2 id="ownership-title">Review ownership</h2>
                  <p>Current assigned changes in the active workspace. Ownership does not alter score or recommendation.</p>
                </div>
              </div>
              <div className="team-rows">
                {rows.length > 0 ? rows.slice(0, 8).map((row) => (
                  <article className="team-row" key={row.entry.createdAt}>
                    <div>
                      <strong>{row.entry.metadata.title}</strong>
                      <span>{row.entry.metadata.repository} · {row.entry.metadata.recommendation.replaceAll("_", " ").toLowerCase()}</span>
                    </div>
                    <div><span>Owner</span><strong>{row.ownerLabel}</strong></div>
                    <div><span>Blocking clauses</span><strong>{row.openBlocking}</strong></div>
                    <div><span>Decision</span><strong>{row.entry.verificationPack?.humanDecisionLedger?.applicability ?? row.reviewState.status}</strong></div>
                  </article>
                )) : <p className="team-empty">No reviews in this workspace yet.</p>}
              </div>
            </section>

            <section className="team-surface" aria-labelledby="activity-title">
              <div className="team-section-head">
                <div>
                  <h2 id="activity-title">Recent team activity</h2>
                  <p>Bounded local events derived from generated reviews, decisions and contract re-checks. No raw diffs or long notes are shown.</p>
                </div>
              </div>
              <ol className="team-activity">
                {activity.length > 0 ? activity.slice(0, 12).map((event) => (
                  <li key={event.eventId}>
                    <span>{formatTime(event.timestamp)}</span>
                    <strong>{event.title}</strong>
                    <p>{event.summary}</p>
                    <em>{event.actorLabel ?? event.source}{event.repository ? ` · ${event.repository}` : ""}</em>
                  </li>
                )) : <li><strong>No activity yet</strong><p>Generate or update a review to create workspace activity.</p></li>}
              </ol>
            </section>

            <section className="team-surface team-surface--limitations" aria-label="Workspace limitations">
              <h2>Local/shared boundary</h2>
              <ul>
                {workspace.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                <li>No live collaboration, invitations or authenticated permissions are enabled in this milestone.</li>
                <li>Human decisions remain final and separate from Lintel recommendations.</li>
              </ul>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
