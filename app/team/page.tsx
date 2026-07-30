"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AppShell from "../app-shell";
import styles from "../r4f5-governance.module.css";
import { HUMAN_DECISION_LEDGER_STORAGE_KEY } from "../../lib/human-decision-ledger";
import { REPORT_HISTORY_STORAGE_KEY } from "../../lib/report-history";
import { REVIEW_STATE_STORAGE_KEY } from "../../lib/review-state";
import {
  TEAM_WORKSPACE_SCHEMA_VERSION,
  TEAM_WORKSPACE_STORAGE_KEY,
} from "../../lib/team-workspace";

type LocalBoundaryState = "checking" | "present" | "absent" | "partial" | "unavailable";

type BoundaryRecord = {
  capability: string;
  state: string;
  scope: string;
  source: string;
  behavior: string;
  authority: string;
  unavailable: string;
  foundation: string;
};

const CURRENT_BOUNDARIES: BoundaryRecord[] = [
  {
    capability: "Workspace partition metadata",
    state: "Browser-local",
    scope: "Current browser profile",
    source: TEAM_WORKSPACE_STORAGE_KEY,
    behavior: "Existing local workflows can associate stored review identities with a workspace identifier.",
    authority: "Organisation and navigation metadata only; it is not an account, tenancy boundary or access-control list.",
    unavailable: "Authenticated membership, shared workspace state and remote recovery.",
    foundation: "Hosted identity, organisation tenancy, server persistence and a migration contract.",
  },
  {
    capability: "Review ownership cues",
    state: "Browser-local",
    scope: "One locally stored review",
    source: REVIEW_STATE_STORAGE_KEY,
    behavior: "A bounded local owner label may exist alongside review status and notes.",
    authority: "Responsibility cue only. It does not assign a person, notify anyone, grant access or prove acceptance.",
    unavailable: "Reviewer assignment workflow, presence, notifications and workload coordination.",
    foundation: "Authenticated identities, shared assignment state, delivery and audit semantics.",
  },
  {
    capability: "Case File history",
    state: "Browser-local",
    scope: "At most ten valid records in this browser",
    source: REPORT_HISTORY_STORAGE_KEY,
    behavior: "Canonical review records can be read by Workspace, Case File and operational projections.",
    authority: "Review evidence and provenance only; local history is not organisation activity or team analytics.",
    unavailable: "Shared history, organisation reporting, monitoring and collaboration telemetry.",
    foundation: "Hosted persistence, authenticated scope, retention policy and auditable aggregation.",
  },
  {
    capability: "Human Decision ledger",
    state: "Available locally",
    scope: "Exact browser-local review identity where supported",
    source: HUMAN_DECISION_LEDGER_STORAGE_KEY,
    behavior: "Workspace can append and verify an accountable engineer's decision through the accepted mutation contract.",
    authority: "The decision belongs to the accountable engineer. It is not a team vote, approval chain or policy outcome.",
    unavailable: "Shared approvers, delegated authority, required-reviewer chains and external publication.",
    foundation: "Authenticated actor identity, shared audit log, authorisation and publication contracts.",
  },
  {
    capability: "Review policy templates",
    state: "Read-only inspection",
    scope: "Bundled definitions and future New Review intake",
    source: "lib/review-policies.ts and lib/review-profiles.ts",
    behavior: "Policies can be browsed and previewed; mapped profiles can be selected when creating a future review.",
    authority: "A policy can frame Lintel analysis. It cannot own a team, approve a pull request or override Human Decision.",
    unavailable: "Shared policy ownership, deployment, assignment, synchronisation and hosted enforcement.",
    foundation: "Approved policy persistence, version deployment, scoped assignment and enforcement contracts.",
  },
  {
    capability: "Repository identity",
    state: "Observed or environment-gated read",
    scope: "One submitted review or configured source read",
    source: "Canonical review input and existing GitHub capability status",
    behavior: "Lintel may retain a repository label or read one repository through an explicit configured source path.",
    authority: "Repository identity is not repository ownership, team ownership or administrative control.",
    unavailable: "Ownership directory, protected-repository inventory and automatic policy matching.",
    foundation: "Verified repository installation scope, ownership model and synchronised administration.",
  },
];

const UNAVAILABLE_CAPABILITIES = [
  { name: "Authenticated organisation", requirement: "Identity, organisation tenancy, authenticated sessions and server-side membership." },
  { name: "Shared accounts and membership", requirement: "Account lifecycle, invitation acceptance, identity verification and shared persistence." },
  { name: "Roles and permissions", requirement: "Authorisation model, permission evaluation, audit events and fail-closed server enforcement." },
  { name: "Reviewer assignments", requirement: "Shared assignment identity, notifications, acceptance state and conflict-safe updates." },
  { name: "Invitations", requirement: "Authenticated recipients, delivery, expiry, acceptance and revocation contracts." },
  { name: "Approval chains", requirement: "Ordered authority, reviewer eligibility, quorum rules and durable auditable outcomes." },
  { name: "Organisation activity and analytics", requirement: "Consented event collection, organisation scope, retention and aggregation semantics." },
  { name: "Repository ownership directory", requirement: "Verified installation scope, ownership sources and synchronisation guarantees." },
  { name: "Shared policy authority", requirement: "Hosted policy versions, scoped assignment, deployment, rollback and enforcement evidence." },
  { name: "External team synchronisation", requirement: "Authenticated provider contracts, reconciliation, failure recovery and audit history." },
];

function inspectStoredBoundary(): LocalBoundaryState {
  try {
    const stored = window.localStorage.getItem(TEAM_WORKSPACE_STORAGE_KEY);
    if (!stored) return "absent";
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== "object" || Array.isArray(value)) return "partial";
    const record = value as Record<string, unknown>;
    if (record.schemaVersion !== TEAM_WORKSPACE_SCHEMA_VERSION || !Array.isArray(record.workspaces)) return "partial";
    return "present";
  } catch (error) {
    return error instanceof SyntaxError ? "partial" : "unavailable";
  }
}

function localBoundaryCopy(state: LocalBoundaryState) {
  if (state === "present") return {
    title: "A browser-local workspace metadata record is present",
    detail: "Lintel does not interpret or display that record as authenticated team membership. No people, roles or assignments are asserted here.",
    label: "Browser-local record",
  };
  if (state === "absent") return {
    title: "No local workspace metadata record is established",
    detail: "This is not a hosted team with zero members. There is no authenticated organisation or shared membership source to inspect.",
    label: "Not established",
  };
  if (state === "partial") return {
    title: "A local workspace record is unresolved",
    detail: "The stored value does not resolve against the current workspace schema. Its identities and capabilities are withheld rather than normalised into authority.",
    label: "Partial",
  };
  if (state === "unavailable") return {
    title: "Browser-local workspace storage is unavailable",
    detail: "Static technical boundaries remain inspectable, but current local record presence is withheld. No fixture or substitute state was loaded.",
    label: "Unavailable",
  };
  return {
    title: "Checking the current browser boundary",
    detail: "Member-like records, counts and authority remain withheld while the single local read resolves.",
    label: "Checking",
  };
}

export default function TeamBoundariesPage() {
  const [localBoundary, setLocalBoundary] = useState<LocalBoundaryState>("checking");
  const inspect = useCallback(() => setLocalBoundary(inspectStoredBoundary()), []);

  useEffect(() => {
    inspect();
  }, [inspect]);

  const boundaryCopy = localBoundaryCopy(localBoundary);

  return (
    <AppShell title="Team boundaries" context="Current browser">
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <span className={styles.eyebrow}>Governance boundary</span>
            <h1>Team boundaries</h1>
            <p>A capability map of where review responsibility lives today. This is not a member directory, organisation console, invitation flow or access-control surface.</p>
          </header>

          <div className={styles.boundaryBanner} role="status">
            <div>
              <strong>{boundaryCopy.title}</strong>
              <p>{boundaryCopy.detail}</p>
            </div>
            <div className={styles.bannerActions}>
              <span className={styles.stateBadge} data-state={localBoundary}>{boundaryCopy.label}</span>
              {(localBoundary === "partial" || localBoundary === "unavailable") ? <button type="button" className={styles.secondaryAction} onClick={inspect}>Retry local read</button> : null}
            </div>
          </div>

          <nav className={styles.sectionNav} aria-label="Team boundary sections">
            <a href="#current-boundary">Current boundary</a>
            <a href="#local-authority">Local authority</a>
            <a href="#unavailable-collaboration">Unavailable collaboration</a>
            <a href="#policy-decision-boundary">Policy and decision boundary</a>
          </nav>

          <section className={styles.pageSection} id="current-boundary" aria-labelledby="current-boundary-title">
            <div className={styles.sectionHeader}>
              <h2 id="current-boundary-title">Current boundary</h2>
              <p>“Team” currently means browser-local responsibility metadata and review context. It does not identify people or grant authority.</p>
            </div>
            <dl className={styles.summaryGrid}>
              <div><dt>Execution</dt><dd>Current browser and server environment</dd><p>No shared runtime or background synchronisation.</p></div>
              <div><dt>Storage</dt><dd>Browser-local records</dd><p>Bounded local keys; no organisation database.</p></div>
              <div><dt>Identity</dt><dd>Not authenticated</dd><p>No account, member or role identity is established.</p></div>
              <div><dt>External authority</dt><dd>None</dd><p>No repository ownership, merge control or policy deployment.</p></div>
            </dl>
            <div className={styles.noMembersState}>
              <span className={styles.eyebrow}>Intentionally no member table</span>
              <h3>No authenticated team source exists.</h3>
              <p>Lintel does not turn local labels or controlled sample identities into people, team counts, roles, invitations, presence or activity.</p>
            </div>
          </section>

          <section className={styles.pageSection} id="local-authority" aria-labelledby="local-authority-title">
            <div className={styles.sectionHeader}>
              <h2 id="local-authority-title">Local authority and supported ownership concepts</h2>
              <p>Each record names what exists, its exact source and the line beyond which Lintel has no authority.</p>
            </div>
            <div className={styles.boundaryRecords}>
              {CURRENT_BOUNDARIES.map((record) => (
                <article className={styles.boundaryRecord} key={record.capability}>
                  <header>
                    <div><span className={styles.eyebrow}>Capability</span><h3>{record.capability}</h3></div>
                    <span className={styles.neutralBadge}>{record.state}</span>
                  </header>
                  <dl className={styles.factList}>
                    <div><dt>Scope</dt><dd>{record.scope}</dd></div>
                    <div><dt>Source of truth</dt><dd className={styles.technical}>{record.source}</dd></div>
                    <div><dt>Read / write behaviour</dt><dd>{record.behavior}</dd></div>
                    <div><dt>Authority boundary</dt><dd>{record.authority}</dd></div>
                    <div><dt>Unavailable now</dt><dd>{record.unavailable}</dd></div>
                    <div><dt>Required foundation</dt><dd>{record.foundation}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.pageSection} id="unavailable-collaboration" aria-labelledby="unavailable-collaboration-title">
            <div className={styles.sectionHeader}>
              <h2 id="unavailable-collaboration-title">Unavailable collaboration and organisation capabilities</h2>
              <p>These are technically unavailable, not merely empty or waiting for the first member.</p>
            </div>
            <ul className={styles.unavailableList}>
              {UNAVAILABLE_CAPABILITIES.map((capability) => (
                <li key={capability.name}>
                  <div><strong>{capability.name}</strong><p>{capability.requirement}</p></div>
                  <span className={styles.stateBadge} data-state="unavailable">Unavailable</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.pageSection} id="policy-decision-boundary" aria-labelledby="policy-decision-boundary-title">
            <div className={styles.sectionHeader}>
              <h2 id="policy-decision-boundary-title">Policy and Human Decision authority</h2>
              <p>Governance context flows forward without becoming team authority or external enforcement.</p>
            </div>
            <ol className={styles.authoritySequence}>
              <li><span>1</span><div><strong>Policy definition</strong><p>A bundled definition describes review intent, gates, evidence expectations and applicability.</p></div></li>
              <li><span>2</span><div><strong>Review profile at intake</strong><p>A mapped profile may be chosen for a future New Review. No team-wide default is stored.</p></div></li>
              <li><span>3</span><div><strong>Lintel analysis</strong><p>Deterministic analysis, with optional separately configured model assistance, produces a recommendation and supported review records.</p></div></li>
              <li><span>4</span><div><strong>Accountable engineer</strong><p>Human Decision remains separate local authority. It is not a policy result, role permission, vote or approval-chain outcome.</p></div></li>
            </ol>
            <div className={styles.authorityCallout}>
              <strong>No external consequence</strong>
              <p>Nothing on this route assigns a reviewer, approves a pull request, publishes a status, protects a repository, deploys a policy or changes an existing Case File.</p>
            </div>
            <div className={styles.inlineActions}>
              <Link className={styles.primaryAction} href="/review-policies">Inspect review policies</Link>
              <Link className={styles.secondaryLink} href="/new">Open New Review</Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
