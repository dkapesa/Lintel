"use client";

import {
  CHANGES,
  CURRENT_HEAD,
  EVIDENCE,
  FINDINGS,
  MISSING_PROOF,
  RELATIONSHIPS,
  REQUIREMENTS,
  RUNS,
  recordLabel,
} from "../fixtures";
import { Glyph } from "../icons";
import type { FixtureVariant, RecordKind, RequirementRecord, SelectedObject } from "../types";
import styles from "../workspace-r4.module.css";

function kindFor(id: string): RecordKind | null {
  if (FINDINGS.some((item) => item.id === id)) return "finding";
  if (EVIDENCE.some((item) => item.id === id)) return "evidence";
  if (MISSING_PROOF.some((item) => item.id === id)) return "proof";
  if (REQUIREMENTS.some((item) => item.id === id)) return "requirement";
  if (CHANGES.some((item) => item.id === id)) return "change";
  if (RUNS.some((item) => item.id === id)) return "run";
  if (id.startsWith("readiness-")) return "readiness";
  if (id.startsWith("diff-")) return "diff";
  return null;
}

function MetaGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <section className={styles.inspectorGroup}><span className={styles.eyebrow}>{label}</span>{children}</section>;
}

function Identity({ kind, id, state }: { kind: string; id: string; state: string }) {
  return <div className={styles.inspectorIdentity}><span>{kind}</span><code title={id}>{id}</code><strong>{state}</strong></div>;
}

function RelationshipList({ selected, onSelect }: { selected: SelectedObject; onSelect: (selection: SelectedObject) => void }) {
  if (!selected) return null;
  const edges = RELATIONSHIPS.filter((edge) => edge.from === selected.id);
  if (edges.length === 0) return <p className={styles.inspectorEmpty}>None recorded — the source asserts no adjacent relationship.</p>;
  return (
    <ol className={styles.adjacencyList}>
      {edges.map((edge, index) => {
        const kind = kindFor(edge.to);
        return (
          <li key={`${edge.to}-${index}`}>
            {kind && edge.state === "Direct" ? (
              <button type="button" onClick={() => onSelect({ kind, id: edge.to })}>
                <span><Glyph name="link" size={14} />{recordLabel(edge.to)}</span>
                <small>{kind} · {edge.state}</small>
              </button>
            ) : (
              <div>
                <span><Glyph name="warning" size={14} />{edge.to === "none" ? "No relationship recorded" : edge.to}</span>
                <small>{edge.state}{edge.reason ? ` · ${edge.reason}` : ""}</small>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function FindingDetail({ id }: { id: string }) {
  const record = FINDINGS.find((item) => item.id === id);
  if (!record) return null;
  return (
    <>
      <Identity kind="Finding" id={record.id} state={`${record.severity}${record.blocking ? " · blocking" : " · advisory"}`} />
      <h2>{record.title}</h2>
      <p className={styles.inspectorLead}>{record.statement}</p>
      <MetaGroup label="Why it matters"><p>{record.blocking ? "This observation blocks readiness until its current missing proof is produced or the accountable engineer records a distinct Human Decision." : "This observation changes review attention but is not a canonical blocker."}</p></MetaGroup>
      <MetaGroup label="Provenance and applicability"><dl className={styles.inspectorFacts}><div><dt>Source</dt><dd>{record.provenance}</dd></div><div><dt>Category</dt><dd>{record.category}</dd></div><div><dt>Run</dt><dd><code>run_482_03</code></dd></div><div><dt>Head</dt><dd><code title={CURRENT_HEAD}>8ac41de…6a102</code></dd></div></dl></MetaGroup>
    </>
  );
}

function EvidenceDetail({ id }: { id: string }) {
  const record = EVIDENCE.find((item) => item.id === id);
  if (!record) return null;
  return (
    <>
      <Identity kind="Evidence" id={record.id} state={`${record.evidenceClass} · ${record.status}`} />
      <h2>{record.title}</h2>
      <p className={styles.inspectorLead}>{record.statement}</p>
      <MetaGroup label="Provenance"><dl className={styles.inspectorFacts}><div><dt>Class</dt><dd>{record.evidenceClass}</dd></div><div><dt>State</dt><dd>{record.status}</dd></div><div><dt>Source</dt><dd><code title={record.source}>{record.source}</code></dd></div><div><dt>Run</dt><dd><code>{record.runId}</code></dd></div><div><dt>Head</dt><dd><code title={record.head}>{record.head ? `${record.head.slice(0, 8)}…${record.head.slice(-5)}` : "Not recorded"}</code></dd></div></dl></MetaGroup>
      <MetaGroup label="Readiness consequence"><p>{record.status === "stale" ? "This proof cannot establish current applicability." : record.status === "unverified" ? "This inference is not direct proof and leaves the linked requirement open." : "This record directly supports the linked finding, but does not replace missing integration proof."}</p></MetaGroup>
    </>
  );
}

function ProofDetail({ id }: { id: string }) {
  const record = MISSING_PROOF.find((item) => item.id === id);
  if (!record) return null;
  return (
    <>
      <Identity kind="Missing proof" id={record.id} state={`${record.state} · ${record.importance}`} />
      <h2>{record.title}</h2>
      <p className={styles.inspectorLead}>{record.sought}</p>
      <MetaGroup label="Why it matters"><p>{record.why}</p></MetaGroup>
      <MetaGroup label="Proof-producing action"><div className={styles.nextAction}><Glyph name="arrow-right" size={16} /><p>{record.nextAction}</p></div></MetaGroup>
      <MetaGroup label="Record boundary"><p>Planned R4 record · controlled fixture. This laboratory does not claim the dedicated object exists in current production data.</p></MetaGroup>
    </>
  );
}

function RequirementDetail({
  id,
  status,
  taskStatus,
  stateSlug,
  onToggle,
  onTask,
}: {
  id: string;
  status?: RequirementRecord["status"];
  taskStatus?: RequirementRecord["taskStatus"];
  stateSlug: string;
  onToggle: (id: string) => void;
  onTask: (id: string, task: RequirementRecord["taskStatus"]) => void;
}) {
  const base = REQUIREMENTS.find((item) => item.id === id);
  if (!base) return null;
  const currentStatus = status ?? base.status;
  const failure = stateSlug === "condition-write-failure";
  const refreshFailure = stateSlug === "condition-refresh-failure";
  return (
    <>
      <Identity kind="Requirement" id={base.id} state={`${currentStatus} · ${base.importance}`} />
      <h2>{base.title}</h2>
      <p className={styles.inspectorLead}>{base.statement}</p>
      <MetaGroup label="Required proof"><p>{base.requiredProof}</p></MetaGroup>
      <MetaGroup label="Capability">
        {base.capability === "condition" ? (
          <div className={styles.capabilityAction}>
            <p>Exact canonical condition <code>{base.conditionKey}</code>. This action records condition progress only; it does not claim proof or a Human Decision.</p>
            <button type="button" onClick={() => onToggle(base.id)}>{currentStatus === "cleared" ? "Reopen condition" : "Clear condition"}</button>
            {failure ? <p className={styles.inlineError} role="alert">Condition progress was not saved. The prior open state remains visible. Retry is safe.</p> : null}
            {refreshFailure ? <p className={styles.inlineError} role="alert">Condition progress is stored locally, but the controlled projection did not refresh. Reopen the review; do not repeat the write automatically.</p> : null}
          </div>
        ) : (
          <div className={styles.readOnlyBoundary}><strong>Read-only derived requirement</strong><p>Only exact Conditions before merge support persisted clear/reopen. Requirement acknowledgement and waiver are not supported by the current durable contract.</p></div>
        )}
      </MetaGroup>
      <MetaGroup label="Local task progress · separate record">
        <label className={styles.taskControl}><span>Task status</span><select value={taskStatus ?? base.taskStatus} onChange={(event) => onTask(base.id, event.target.value as RequirementRecord["taskStatus"])}><option>Open</option><option>In progress</option><option>Done</option><option>Not needed</option></select></label>
        <p className={styles.inspectorEmpty}>Task progress does not clear proof, resolve this requirement, acknowledge it, or waive risk.</p>
      </MetaGroup>
    </>
  );
}

function ChangeDetail({ id }: { id: string }) {
  const record = CHANGES.find((item) => item.id === id);
  if (!record) return null;
  return (
    <>
      <Identity kind={record.kind === "file" ? "Affected file" : "Affected surface"} id={record.id} state={record.contextAvailable ? "focused context available" : "context unavailable"} />
      <h2 title={record.path}>{record.path}</h2>
      <p className={styles.inspectorLead}>This context is in scope because explicit finding and requirement relationships point to it.</p>
      <MetaGroup label="Technical metadata"><dl className={styles.inspectorFacts}><div><dt>Change</dt><dd>{record.additions == null ? "Unknown" : `+${record.additions} / −${record.deletions ?? 0}`}</dd></div><div><dt>Risk</dt><dd>{record.risk ?? "Unknown"}</dd></div><div><dt>Context</dt><dd>{record.contextAvailable ? "Available" : "Focused diff context unavailable"}</dd></div></dl></MetaGroup>
      <MetaGroup label="Boundary"><p>This is focused fixture context, not a complete raw diff viewer.</p></MetaGroup>
    </>
  );
}

function RunDetail({ id }: { id: string }) {
  const run = RUNS.find((item) => item.id === id);
  if (!run) return null;
  return (
    <>
      <Identity kind="Run" id={run.id} state={`${run.source} · ${run.reproducibility}`} />
      <h2>{run.id === "run_482_03" ? "Current analysis run" : "Comparison analysis run"}</h2>
      <p className={styles.inspectorLead}>{run.limitation}</p>
      <MetaGroup label="Identity and provenance"><dl className={styles.inspectorFacts}><div><dt>Head</dt><dd><code title={run.head}>{run.head ?? "Not recorded"}</code></dd></div><div><dt>Base</dt><dd><code title={run.base}>{run.base}</code></dd></div><div><dt>Result</dt><dd><code>{run.resultFingerprint}</code></dd></div><div><dt>Configuration</dt><dd><code>{run.configurationFingerprint}</code></dd></div><div><dt>Recorded</dt><dd>{run.recordedAt}</dd></div></dl></MetaGroup>
      <MetaGroup label="Decision applicability"><p>The prior Approve decision is bound to <code>631fb20…81a14</code> and is stale against the current head.</p></MetaGroup>
    </>
  );
}

function AuthorityBoundary({ loading }: { loading: boolean }) {
  return (
    <div className={styles.inspectorAuthorityBoundary} aria-busy={loading || undefined}>
      <Glyph name={loading ? "history" : "warning"} size={18} />
      <h2>{loading ? "Current detail is loading" : "Current detail is unavailable"}</h2>
      <p>{loading ? "Review identity is retained, but recommendation, risk, blockers, run, head, readiness, and Human Decision facts are withheld until the authoritative projection completes." : "The requested stored review has no current authoritative detail. No substitute review is selected, and no readiness or Human Decision claim is available."}</p>
    </div>
  );
}

function ReadinessDetail({ variant }: { variant: FixtureVariant }) {
  const github = variant === "github-connected" ? "Connected" : variant === "github-unavailable" ? "Unavailable" : "Available";
  return (
    <>
      <Identity kind="Decision readiness" id="readiness-blocker-01" state="not ready" />
      <h2>Human judgment remains required</h2>
      <p className={styles.inspectorLead}>Lintel recommends Tests required at 46/100 Medium risk. This is not a Human Decision.</p>
      <MetaGroup label="Unresolved conditions"><ul className={styles.inspectorList}><li><strong>4</strong> open blocking requirements</li><li><strong>2</strong> blocking missing-proof records</li><li><strong>1</strong> stale evidence record</li><li>Prior Approve decision predates the current head</li></ul></MetaGroup>
      <MetaGroup label="Run and authority"><dl className={styles.inspectorFacts}><div><dt>Current run</dt><dd><code>run_482_03</code></dd></div><div><dt>Current head</dt><dd><code title={CURRENT_HEAD}>8ac41de…6a102</code></dd></div><div><dt>Owner</dt><dd>No owner recorded</dd></div><div><dt>Human Decision</dt><dd>{variant === "stale-decision" ? "Stale prior Approve" : variant === "unbound-decision" ? "Unbound" : "Pending"}</dd></div></dl></MetaGroup>
      <MetaGroup label="Handoff capabilities"><div className={styles.handoffList}><div><strong>GitHub App</strong><span>{github}</span><small>{github === "Connected" ? "Configured automated analysis comment only; it does not publish the Human Decision." : github === "Available" ? "Implemented capability is not configured in this fixture." : "Configured capability is unavailable; no post occurred."}</small></div><div><strong>GitHub Action</strong><span>Blueprint</span><small>Does not install, execute, connect or post.</small></div><div><strong>Slack handoff</strong><span>Export-only</span><small>Copies or downloads; it does not send.</small></div></div></MetaGroup>
      <MetaGroup label="Next accountable action"><div className={styles.nextAction}><Glyph name="arrow-right" size={16} /><p>Inspect the first blocker. The persistent Workspace readiness bar is the primary place to record the accountable Human Decision.</p></div></MetaGroup>
    </>
  );
}

export function ContextualInspector({
  open,
  selected,
  returnToken,
  variant,
  stateSlug,
  requirementStatuses,
  taskStatuses,
  onClose,
  onSelect,
  onBack,
  onToggleRequirement,
  onTaskStatus,
}: {
  open: boolean;
  selected: SelectedObject;
  returnToken: SelectedObject;
  variant: FixtureVariant;
  stateSlug: string;
  requirementStatuses: Record<string, RequirementRecord["status"]>;
  taskStatuses: Record<string, RequirementRecord["taskStatus"]>;
  onClose: () => void;
  onSelect: (selection: SelectedObject) => void;
  onBack: () => void;
  onToggleRequirement: (id: string) => void;
  onTaskStatus: (id: string, task: RequirementRecord["taskStatus"]) => void;
}) {
  const authorityLoading = stateSlug === "loading";
  const authorityUnavailable = variant === "unavailable";
  const authorityWithheld = authorityLoading || authorityUnavailable;
  if (!open) {
    return (
      <aside className={styles.inspectorCompact} aria-label="Contextual Inspector collapsed">
        <button type="button" onClick={onClose} aria-label="Restore Contextual Inspector" title="Restore Inspector (])"><Glyph name="panel-right" size={18} /></button>
        <span>{authorityLoading ? "Loading" : authorityUnavailable ? "Unavailable" : selected ? selected.kind : "Next"}</span>
        <code title={authorityWithheld ? undefined : selected?.id}>{authorityWithheld ? "withheld" : selected?.id?.replace(/^(finding|evidence|requirement|proof)-/, "") ?? "ready"}</code>
      </aside>
    );
  }
  return (
    <aside className={styles.inspector} aria-label="Contextual Inspector" aria-live="off">
      <div className={styles.inspectorHeader}>
        <div><span className={styles.eyebrow}>Contextual Inspector</span><strong>{authorityLoading ? "Projection loading" : authorityUnavailable ? "No current detail" : selected ? recordLabel(selected.id) : "Next inspection"}</strong></div>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Collapse or close Contextual Inspector"><Glyph name="close" size={16} /></button>
      </div>
      <div className={styles.inspectorScroll} tabIndex={-1}>
        {authorityWithheld ? <AuthorityBoundary loading={authorityLoading} /> : null}
        {!authorityWithheld && returnToken ? <button type="button" className={styles.contextBack} onClick={onBack}><Glyph name="chevron-left" size={14} />Back to {recordLabel(returnToken.id)}</button> : null}
        {!authorityWithheld && !selected ? <ReadinessDetail variant={variant} /> : null}
        {!authorityWithheld && selected?.kind === "finding" ? <FindingDetail id={selected.id} /> : null}
        {!authorityWithheld && selected?.kind === "evidence" ? <EvidenceDetail id={selected.id} /> : null}
        {!authorityWithheld && selected?.kind === "proof" ? <ProofDetail id={selected.id} /> : null}
        {!authorityWithheld && selected?.kind === "requirement" ? <RequirementDetail id={selected.id} status={requirementStatuses[selected.id]} taskStatus={taskStatuses[selected.id]} stateSlug={stateSlug} onToggle={onToggleRequirement} onTask={onTaskStatus} /> : null}
        {!authorityWithheld && selected?.kind === "change" ? <ChangeDetail id={selected.id} /> : null}
        {!authorityWithheld && selected?.kind === "run" ? <RunDetail id={selected.id} /> : null}
        {!authorityWithheld && selected?.kind === "readiness" ? <ReadinessDetail variant={variant} /> : null}
        {selected?.kind === "diff" ? <><Identity kind="Review Diff" id={selected.id} state="reopened" /><h2>Requirement reopened in the current run</h2><p className={styles.inspectorLead}>Previously cleared; current configuration movement requires proof again.</p><MetaGroup label="Before and current"><dl className={styles.inspectorFacts}><div><dt>Previous</dt><dd>Cleared · run_482_02</dd></div><div><dt>Current</dt><dd>Open · blocking · run_482_03</dd></div></dl></MetaGroup></> : null}
        {!authorityWithheld && selected ? <MetaGroup label="Explicit relationships"><RelationshipList selected={selected} onSelect={onSelect} /></MetaGroup> : null}
        {!authorityWithheld && selected ? <MetaGroup label="Readiness consequence"><p>{selected.kind === "requirement" || selected.kind === "proof" || selected.kind === "finding" ? "This record contributes to the four open blockers and prevents a ready signal." : "This context informs readiness but does not record Human authority."}</p></MetaGroup> : null}
      </div>
    </aside>
  );
}
