"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../app-shell";
import styles from "../administrative-document.module.css";
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
    <div className={styles.statusLine}>
      {workspaceLabel(workspace)} · data stored on this device · roles and membership are responsibility metadata, not authenticated access control
    </div>
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
  const unresolvedOwnership = rows.filter((row) => row.reviewState.owner === "Unassigned");
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
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>{workspace?.name ?? "Team workspace"}</h1>
            <p>Local workspace records organise review responsibility, repository evidence and recent verification activity without claiming live collaboration.</p>
            {workspace ? <WorkspaceModeNote workspace={workspace} /> : <div className={styles.statusLine}>Loading local workspace context.</div>}
            <div className={styles.pageActions}>
              <Link className={styles.secondaryAction} href="/workspace">Risk inbox</Link>
              <Link className={styles.secondaryAction} href="/new">Check a pull request</Link>
            </div>
          </header>

          {error && <p className={styles.errorMessage} role="alert">{error}</p>}

          {workspace && (
            <>
              <nav className={styles.sectionNav} aria-label="Team workspace sections">
                <a href="#team-overview">Overview</a>
                <a href="#team-members">Members</a>
                <a href="#team-repositories">Repositories</a>
                <a href="#team-ownership">Ownership</a>
                <a href="#team-activity">Activity</a>
              </nav>

              <section className={styles.section} id="team-overview" aria-labelledby="team-overview-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-overview-title">Overview</h2>
                  <p>{needsAttention.length} reviews need attention; {assignedRows.length} currently have recorded ownership in this workspace.</p>
                </div>
                <ul className={styles.summaryStrip} aria-label="Local workspace summary">
                  <li><span>Active members</span><strong>{activeMembers.length}</strong><p>Local responsibility profiles</p></li>
                  <li><span>Repositories</span><strong>{workspace.repositories.length}</strong><p>Observed workspace records</p></li>
                  <li><span>Unresolved ownership</span><strong>{unresolvedOwnership.length}</strong><p>Reviews without an owner</p></li>
                  <li><span>Recent activity</span><strong>{activity.length}</strong><p>Derived local events</p></li>
                </ul>

                <div className={styles.groupStack}>
                  <div className={styles.group}>
                    <div className={styles.groupHeader}>
                      <h3>Workspace definition</h3>
                      <p>Rename the active local record or create another workspace on this device. Neither action creates an organisation or shared server state.</p>
                    </div>
                    <div className={styles.formBody}>
                      <div className={styles.fieldGrid}>
                        <label className={styles.field}>
                          <span>Workspace name</span>
                          <input value={renameValue} maxLength={80} onChange={(event) => setRenameValue(event.target.value)} />
                        </label>
                        <label className={styles.field}>
                          <span>Create local workspace</span>
                          <input value={newWorkspaceName} maxLength={80} onChange={(event) => setNewWorkspaceName(event.target.value)} placeholder="Payments review" />
                        </label>
                      </div>
                      <div className={styles.formActions}>
                        <button className={styles.secondaryAction} type="button" onClick={renameActiveWorkspace}>Rename local workspace</button>
                        <button className={styles.secondaryAction} type="button" onClick={createWorkspace}>Create workspace</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.section} id="team-members" aria-labelledby="team-members-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-members-title">Members</h2>
                  <p>Members are local responsibility profiles. Adding one does not create an account or send an invitation.</p>
                </div>
                <div className={styles.groupStack}>
                  <div className={styles.group}>
                    <div className={styles.groupHeader}>
                      <h3>Add a local member</h3>
                      <p>Record a display name and responsibility role for this workspace only.</p>
                    </div>
                    <div className={styles.formBody}>
                      <div className={styles.fieldGrid}>
                        <label className={styles.field}>
                          <span>Member name</span>
                          <input value={memberName} maxLength={80} onChange={(event) => setMemberName(event.target.value)} placeholder="Maya Chen" />
                        </label>
                        <label className={styles.field}>
                          <span>Responsibility role</span>
                          <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as WorkspaceMemberRole)}>
                            {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className={styles.formActions}>
                        <button className={styles.primaryAction} type="button" onClick={addMember}>Add local member</button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.group}>
                    <div className={styles.groupHeader}>
                      <h3>Member records</h3>
                      <p>Roles express local review responsibility, not authenticated permissions or enterprise membership.</p>
                    </div>
                    <div className={styles.tableWrap}>
                      <table className={styles.adminTable}>
                        <thead><tr><th>Member</th><th>Responsibility</th><th>Assigned reviews</th><th>State</th><th>Action</th></tr></thead>
                        <tbody>
                          {workspace.members.map((member) => (
                            <tr key={member.memberId}>
                              <td data-label="Member"><span className={styles.rowTitle}>{member.displayName}</span><span className={styles.rowSupport}>{member.source} record</span></td>
                              <td data-label="Responsibility">
                                <select className={styles.tableControl} value={member.role} onChange={(event) => updateMember(member, event.target.value as WorkspaceMemberRole)} aria-label={`Role for ${member.displayName}`}>
                                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                                </select>
                              </td>
                              <td data-label="Assigned reviews">{memberAssignedCount(member, rows)}</td>
                              <td data-label="State">{member.status}</td>
                              <td data-label="Action"><button className={styles.secondaryAction} type="button" onClick={() => toggleMember(member)}>{member.status === "active" ? "Deactivate" : "Reactivate"}</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.section} id="team-repositories" aria-labelledby="team-repositories-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-repositories-title">Repositories</h2>
                  <p>Repository membership is derived from local report history and known GitHub connection records.</p>
                </div>
                <div className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h3>Repository records</h3>
                    <p>Ownership and connection wording reflects only the metadata currently recorded for this workspace.</p>
                  </div>
                  {workspace.repositories.length > 0 ? (
                    <div className={styles.tableWrap}>
                      <table className={styles.adminTable}>
                        <thead><tr><th>Repository</th><th>Ownership</th><th>Open responsibility</th><th>Verification activity</th><th>State</th></tr></thead>
                        <tbody>
                          {workspace.repositories.map((repo) => {
                            const latest = latestForRepository(repo.repository, history);
                            return (
                              <tr key={repo.repositoryId}>
                                <td data-label="Repository"><span className={styles.rowTitle}>{repo.repository}</span><span className={styles.rowSupport}>{repo.source}</span></td>
                                <td data-label="Ownership">{repo.owner ?? "No owner recorded"}</td>
                                <td data-label="Open responsibility">{repo.attentionCount} needing attention</td>
                                <td data-label="Verification activity">{repo.reviewCount} reviews<span className={styles.rowSupport}>{latest ? formatTime(latest.createdAt) : "No local review yet"}</span></td>
                                <td data-label="State">{repo.connectionState} · {repo.status}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className={styles.emptyState}>No repositories observed yet. Generate a report in this workspace to add one.</p>}
                </div>
              </section>

              <section className={styles.section} id="team-ownership" aria-labelledby="team-ownership-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-ownership-title">Ownership</h2>
                  <p>Current assigned changes in the active workspace. Ownership does not alter score or recommendation.</p>
                </div>
                <div className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h3>Review responsibility</h3>
                    <p>These records remain local review metadata. Human decisions remain final.</p>
                  </div>
                  {rows.length > 0 ? (
                    <div className={styles.tableWrap}>
                      <table className={styles.adminTable}>
                        <thead><tr><th>Change</th><th>Responsible engineer</th><th>Scope</th><th>Blocking clauses</th><th>Current status</th></tr></thead>
                        <tbody>
                          {rows.slice(0, 8).map((row) => (
                            <tr key={row.entry.createdAt}>
                              <td data-label="Change"><span className={styles.rowTitle}>{row.entry.metadata.title}</span><span className={styles.rowSupport}>{row.entry.metadata.recommendation.replaceAll("_", " ").toLowerCase()}</span></td>
                              <td data-label="Responsible engineer">{row.ownerLabel}</td>
                              <td data-label="Scope">{row.entry.metadata.repository}</td>
                              <td data-label="Blocking clauses">{row.openBlocking}</td>
                              <td data-label="Current status">{row.entry.verificationPack?.humanDecisionLedger?.applicability ?? row.reviewState.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className={styles.emptyState}>No reviews in this workspace yet.</p>}
                </div>
              </section>

              <section className={styles.section} id="team-activity" aria-labelledby="team-activity-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-activity-title">Activity</h2>
                  <p>Bounded local events derived from generated reviews, decisions and contract re-checks. No raw diffs or long notes are shown.</p>
                </div>
                <div className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h3>Recent team activity</h3>
                    <p>Newest local verification and responsibility events appear first.</p>
                  </div>
                  {activity.length > 0 ? (
                    <ol className={styles.activityList}>
                      {activity.slice(0, 12).map((event) => (
                        <li key={event.eventId}>
                          <time className={styles.activityTime} dateTime={event.timestamp}>{formatTime(event.timestamp)}</time>
                          <div><span className={styles.activityTitle}>{event.title}</span><p className={styles.activityBody}>{event.summary}</p><span className={styles.activityMeta}>{event.actorLabel ?? event.source}{event.repository ? ` · ${event.repository}` : ""}</span></div>
                          <span className={styles.activityState}>{event.type.replaceAll("-", " ")}</span>
                        </li>
                      ))}
                    </ol>
                  ) : <p className={styles.emptyState}>No activity yet. Generate or update a review to create workspace activity.</p>}
                </div>
              </section>

              <section className={styles.section} aria-labelledby="team-boundary-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-boundary-title">Local/shared boundary</h2>
                  <p>The final record states the prototype limits and keeps the destructive workspace action separate.</p>
                </div>
                <div className={`${styles.group} ${styles.limitationGroup}`}>
                  <ul className={styles.boundaryList}>
                    {workspace.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                    <li>No live collaboration, invitations or authenticated permissions are enabled in this milestone.</li>
                    <li>Human decisions remain final and separate from Lintel recommendations.</li>
                  </ul>
                  {workspace.workspaceId !== DEFAULT_WORKSPACE_ID && (
                    <div className={styles.destructiveBody}>
                      <p>Archiving removes this local workspace from the active set on this device.</p>
                      <button className={styles.dangerAction} type="button" onClick={archiveCurrentWorkspace}>Archive this workspace</button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
