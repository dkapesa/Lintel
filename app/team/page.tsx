"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../app-shell";
import ConsequentialDialog from "../consequential-dialog";
import styles from "../administrative-document.module.css";
import { readReportHistory, type ReportHistoryEntry } from "../../lib/report-history";
import { defaultReviewState, readReviewStates } from "../../lib/review-state";
import { readOnlyStorage } from "../../lib/workspace-v2/read-only-storage";
import {
  buildOperationsCases,
  type OperationsCase,
} from "../../lib/operations-projection";
import {
  activeWorkspace,
  archiveWorkspace,
  createLocalWorkspace,
  ensureWorkspaceStore,
  DEFAULT_WORKSPACE_ID,
  renameWorkspace,
  reportWorkspaceKey,
  SAMPLE_WORKSPACE_ID,
  setActiveWorkspace,
  setWorkspaceMemberStatus,
  upsertWorkspaceMember,
  workspaceIdForReportEntry,
  workspaceScopedReviewKey,
  WORKSPACE_CHANGED_EVENT,
  type TeamMember,
  type TeamWorkspace,
  type WorkspaceMemberRole,
  type WorkspaceStore,
} from "../../lib/team-workspace";

const ROLE_OPTIONS: WorkspaceMemberRole[] = ["admin", "maintainer", "reviewer", "observer"];

function isSampleWorkspace(workspace: TeamWorkspace) {
  return workspace.workspaceId === SAMPLE_WORKSPACE_ID;
}

/* Team-scoped review-state resolver: prefer the workspace-scoped key, fall back
   to the unscoped key, and only report `recorded` when a genuinely stored state
   with an `updatedAt` is unambiguous for this exact entry. */
function scopedReviewResolver(entries: ReportHistoryEntry[], storage: Storage, workspaceId: string) {
  const raw = readReviewStates(readOnlyStorage(storage));
  const keyCounts = new Map<string, number>();
  for (const entry of entries) {
    const key = reportWorkspaceKey(entry);
    keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
  }
  return (entry: ReportHistoryEntry) => {
    const key = reportWorkspaceKey(entry);
    const stored = raw[workspaceScopedReviewKey(workspaceId, key)] ?? raw[key];
    const ambiguous = (keyCounts.get(key) ?? 0) > 1;
    if (stored && stored.updatedAt && !ambiguous) {
      return { state: stored, recorded: true };
    }
    return { state: stored ?? defaultReviewState(entry.report), recorded: false };
  };
}

function MemberInitials({ member }: { member: TeamMember }) {
  return <span className={styles.teamInitials} aria-hidden="true">{member.initials}</span>;
}

export default function TeamWorkspacePage() {
  const [store, setStore] = useState<WorkspaceStore | null>(null);
  const [cases, setCases] = useState<OperationsCase[]>([]);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<WorkspaceMemberRole>("reviewer");
  const [renameValue, setRenameValue] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const archiveButtonRef = useRef<HTMLButtonElement | null>(null);

  function load() {
    const allHistory = readReportHistory(readOnlyStorage(window.localStorage));
    const nextStore = ensureWorkspaceStore(window.localStorage, allHistory);
    const workspaceId = nextStore.activeWorkspaceId;
    const scopedHistory = allHistory.filter((entry) => workspaceIdForReportEntry(entry, nextStore) === workspaceId);
    const resolver = scopedReviewResolver(scopedHistory, window.localStorage, workspaceId);
    setStore(nextStore);
    setCases(buildOperationsCases(scopedHistory, window.localStorage, resolver));
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
  const sample = workspace ? isSampleWorkspace(workspace) : false;
  const activeWorkspaces = store?.workspaces.filter((item) => item.status === "active") ?? [];

  const assignedCases = cases.filter((item) => item.ownerAssigned);
  const unassignedCases = cases.filter((item) => !item.ownerAssigned);

  function refreshAfter(nextStore: WorkspaceStore) {
    setStore(nextStore);
    window.dispatchEvent(new Event(WORKSPACE_CHANGED_EVENT));
    load();
  }

  function switchWorkspace(workspaceId: string) {
    try {
      refreshAfter(setActiveWorkspace(window.localStorage, workspaceId));
      setError(null);
    } catch {
      setError("Local workspace could not be switched.");
    }
  }

  function addMember() {
    if (!workspace) return;
    try {
      refreshAfter(upsertWorkspaceMember(window.localStorage, workspace.workspaceId, { displayName: memberName, role: memberRole }));
      setMemberName("");
      setMemberRole("reviewer");
      setError(null);
    } catch {
      setError("Local reviewer could not be saved.");
    }
  }

  function updateMember(member: TeamMember, role: WorkspaceMemberRole) {
    if (!workspace) return;
    try {
      refreshAfter(upsertWorkspaceMember(window.localStorage, workspace.workspaceId, { memberId: member.memberId, displayName: member.displayName, role }));
    } catch {
      setError("Local reviewer role could not be updated.");
    }
  }

  function toggleMember(member: TeamMember) {
    if (!workspace) return;
    try {
      refreshAfter(setWorkspaceMemberStatus(window.localStorage, workspace.workspaceId, member.memberId, member.status === "active" ? "inactive" : "active"));
    } catch {
      setError("Local reviewer status could not be updated.");
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
    if (!workspace) return false;
    try {
      refreshAfter(archiveWorkspace(window.localStorage, workspace.workspaceId));
      setArchiveError(null);
      return true;
    } catch {
      setArchiveError("Workspace could not be archived. No local workspace state was changed.");
      return false;
    }
  }

  function memberAssigned(member: TeamMember) {
    return cases.filter((item) => item.ownerLabel === member.displayName).length;
  }

  const shellContext = workspace ? (sample ? "Sample workspace" : "Local workspace") : "Local workspace";

  return (
    <AppShell title="Team boundaries" context={shellContext}>
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>Team</h1>
            <p>The local workspace and review-ownership surface. It records which reviewers and assignments genuinely exist on this device — not accounts, invitations, presence or shared cloud state.</p>
            <div className={styles.statusLine}>
              {workspace
                ? `${workspace.name} · ${sample ? "sample data" : "stored on this device"}`
                : "Loading local workspace context."}
            </div>
          </header>

          {error && <p className={styles.errorMessage} role="alert">{error}</p>}

          {workspace && (
            <>
              {sample && (
                <div className={styles.teamSampleBanner} role="note">
                  <strong>Sample workspace</strong>
                  <span>This is demo data stored on this device. The reviewers below are fixtures, not real people, and carry no authenticated identity, presence or activity.</span>
                </div>
              )}

              <nav className={styles.sectionNav} aria-label="Team sections">
                <a href="#team-workspace">Local workspace</a>
                <a href="#team-reviewers">Local reviewers</a>
                <a href="#team-ownership">Review ownership</a>
                <a href="#team-boundary">Collaboration boundary</a>
              </nav>

              <section className={styles.section} id="team-workspace" aria-labelledby="team-workspace-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-workspace-title">Local workspace</h2>
                  <p>The workspace selected on this device. Switching, renaming or creating a workspace changes local records only; nothing is synced or shared.</p>
                </div>

                <dl className={styles.operationsLedger} aria-label="Local workspace summary">
                  <div><dt>Active workspace</dt><dd>{workspace.name}</dd></div>
                  <div><dt>Stored Case Files</dt><dd>{cases.length}</dd></div>
                  <div><dt>Local reviewers</dt><dd>{workspace.members.length}</dd></div>
                  <div><dt>With ownership</dt><dd>{assignedCases.length}</dd></div>
                  <div><dt>Unassigned</dt><dd>{unassignedCases.length}</dd></div>
                </dl>

                <div className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h3>Workspace selection</h3>
                    <p>Switch between local workspaces on this device, or define another. Identifier: <span className={styles.technicalInline}>{workspace.workspaceId}</span></p>
                  </div>
                  <div className={styles.formBody}>
                    <div className={styles.fieldGrid}>
                      <label className={styles.field}>
                        <span>Active local workspace</span>
                        <select value={workspace.workspaceId} onChange={(event) => switchWorkspace(event.target.value)}>
                          {activeWorkspaces.map((item) => (
                            <option key={item.workspaceId} value={item.workspaceId}>
                              {item.name}{isSampleWorkspace(item) ? " (sample)" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.field}>
                        <span>Rename active workspace</span>
                        <input value={renameValue} maxLength={80} onChange={(event) => setRenameValue(event.target.value)} />
                      </label>
                      <label className={styles.field}>
                        <span>Create local workspace</span>
                        <input value={newWorkspaceName} maxLength={80} onChange={(event) => setNewWorkspaceName(event.target.value)} placeholder="Payments review" />
                      </label>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.secondaryAction} type="button" onClick={renameActiveWorkspace}>Rename workspace</button>
                      <button className={styles.secondaryAction} type="button" onClick={createWorkspace}>Create workspace</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.section} id="team-reviewers" aria-labelledby="team-reviewers-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-reviewers-title">Local reviewers</h2>
                  <p>Reviewer records stored for this workspace. A record is local responsibility metadata: adding one does not create an account, send an invitation or grant access.</p>
                </div>
                <div className={styles.groupStack}>
                  <div className={styles.group}>
                    <div className={styles.groupHeader}>
                      <h3>Add a local reviewer</h3>
                      <p>Record a display name and a responsibility role for this workspace only.</p>
                    </div>
                    <div className={styles.formBody}>
                      <div className={styles.fieldGrid}>
                        <label className={styles.field}>
                          <span>Reviewer name</span>
                          <input value={memberName} maxLength={80} onChange={(event) => setMemberName(event.target.value)} placeholder="Reviewer name" />
                        </label>
                        <label className={styles.field}>
                          <span>Responsibility role</span>
                          <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as WorkspaceMemberRole)}>
                            {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className={styles.formActions}>
                        <button className={styles.primaryAction} type="button" onClick={addMember}>Add local reviewer</button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.group}>
                    <div className={styles.groupHeader}>
                      <h3>Reviewer records</h3>
                      <p>Roles express local review responsibility, not authenticated permissions. Initials are a neutral glyph, not a photo or presence indicator.</p>
                    </div>
                    {workspace.members.length > 0 ? (
                      <div className={styles.tableWrap}>
                        <table className={styles.adminTable}>
                          <thead><tr><th>Reviewer</th><th>Responsibility</th><th>Assigned cases</th><th>State</th><th>Action</th></tr></thead>
                          <tbody>
                            {workspace.members.map((member) => (
                              <tr key={member.memberId}>
                                <td data-label="Reviewer">
                                  <span className={styles.teamMember}>
                                    <MemberInitials member={member} />
                                    <span className={styles.teamMemberText}>
                                      <span className={styles.rowTitle}>{member.displayName}</span>
                                      <span className={styles.rowSupport}>{member.source === "sample" ? "Sample record" : `${member.source} record`}</span>
                                    </span>
                                  </span>
                                </td>
                                <td data-label="Responsibility">
                                  <select className={styles.tableControl} value={member.role} onChange={(event) => updateMember(member, event.target.value as WorkspaceMemberRole)} aria-label={`Role for ${member.displayName}`}>
                                    {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                                  </select>
                                </td>
                                <td data-label="Assigned cases">{memberAssigned(member)}</td>
                                <td data-label="State">{member.status}</td>
                                <td data-label="Action"><button className={styles.secondaryAction} type="button" onClick={() => toggleMember(member)}>{member.status === "active" ? "Deactivate" : "Reactivate"}</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className={styles.emptyState}>No local reviewers recorded.</p>}
                  </div>
                </div>
              </section>

              <section className={styles.section} id="team-ownership" aria-labelledby="team-ownership-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-ownership-title">Review ownership</h2>
                  <p>Assignment is local coordination metadata over durable Case Files. It does not record a human decision, clear a blocker or change a recommendation.</p>
                </div>

                <dl className={styles.operationsLedger} aria-label="Assignment coverage">
                  <div><dt>Durable Case Files</dt><dd>{cases.length}</dd></div>
                  <div><dt>With ownership</dt><dd>{assignedCases.length}</dd></div>
                  <div><dt>Unassigned</dt><dd>{unassignedCases.length}</dd></div>
                </dl>

                <div className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h3>Ownership by case</h3>
                    <p>Cases scoped to this workspace, newest first. Open the exact Case File to inspect or record ownership.</p>
                  </div>
                  {cases.length > 0 ? (
                    <div className={styles.tableWrap}>
                      <table className={styles.adminTable}>
                        <thead><tr><th>Case</th><th>Repository</th><th>Group</th><th>Owner</th><th>Human decision</th><th>Case File</th></tr></thead>
                        <tbody>
                          {[...cases].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map((item) => (
                            <tr key={item.reportId}>
                              <td data-label="Case"><span className={styles.rowTitle}>{item.title}</span><span className={styles.rowSupport}>{item.changeLabel}</span></td>
                              <td data-label="Repository">{item.repository}</td>
                              <td data-label="Group">{item.group === "attention" ? "Needs attention" : item.group === "review" ? "Review" : item.group === "ready" ? "Ready" : "Reviewed"}</td>
                              <td data-label="Owner">{item.ownerAssigned ? item.ownerLabel : <span className={styles.stateNeutral}>Unassigned</span>}</td>
                              <td data-label="Human decision">{item.decision.kind === "none" ? <span className={styles.stateNeutral}>None recorded</span> : item.decision.kind === "stale" ? <span className={styles.stateAttention}>Stale</span> : item.acceptedRisk ? <span className={styles.stateAttention}>Accepted risk</span> : <span className={styles.statePositive}>Recorded</span>}</td>
                              <td data-label="Case File"><Link className={styles.recordLink} href={item.caseFileHref}>Open Case File</Link></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className={styles.emptyState}>No durable Case Files are scoped to this workspace yet.</p>}
                </div>
              </section>

              <section className={styles.section} id="team-boundary" aria-labelledby="team-boundary-title">
                <div className={styles.sectionHeader}>
                  <h2 id="team-boundary-title">Local collaboration boundary</h2>
                  <p>What this workspace is, and what Lintel deliberately does not provide.</p>
                </div>
                <div className={`${styles.group} ${styles.limitationGroup}`}>
                  <ul className={styles.boundaryList}>
                    {workspace.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                    <li>No authentication, invitations, accounts, presence, messaging or cloud sync are provided.</li>
                    <li>Reviewers and roles are local responsibility metadata, not access control.</li>
                    <li>Human decisions remain final and separate from Lintel recommendations.</li>
                  </ul>
                  {workspace.workspaceId !== DEFAULT_WORKSPACE_ID && (
                    <div className={styles.destructiveBody}>
                      <p>Archiving removes this local workspace from the active set on this device.</p>
                      <button
                        className={styles.dangerAction}
                        type="button"
                        ref={archiveButtonRef}
                        onClick={() => {
                          setArchiveError(null);
                          setArchiveDialogOpen(true);
                        }}
                      >
                        Archive this workspace
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      {workspace && (
        <ConsequentialDialog
          open={archiveDialogOpen}
          title="Archive local workspace"
          affectedObject={`${workspace.name} · ${workspace.workspaceId}`}
          currentState="Active on this device"
          proposedState="Archived on this device"
          consequence="The workspace will be removed from the active workspace set in this browser. Existing Case Files and Human Decision records are not rewritten."
          unresolvedConditions={[
            "This action affects only the current browser.",
            "Archiving does not delete stored Case Files or create an organisation-level audit event.",
          ]}
          confirmLabel="Archive workspace"
          error={archiveError}
          returnFocusRef={archiveButtonRef}
          onConfirm={archiveCurrentWorkspace}
          onCancel={() => setArchiveDialogOpen(false)}
        />
      )}
    </AppShell>
  );
}
