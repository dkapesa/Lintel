"use client";

import { useMemo, useState } from "react";
import {
  CHANGES,
  CURRENT_HEAD,
  EVIDENCE,
  FINDINGS,
  LONG_BRANCH,
  MISSING_PROOF,
  PREVIOUS_HEAD,
  REQUIREMENTS,
  RUNS,
  recordLabel,
} from "../fixtures";
import { Glyph } from "../icons";
import type {
  FixtureVariant,
  RecordKind,
  RequirementRecord,
  ReviewFixture,
  SelectedObject,
  WorkspaceMode,
} from "../types";
import styles from "../workspace-r4.module.css";

const MODES: { id: WorkspaceMode; label: string; shortcut?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "change", label: "Change" },
  { id: "evidence", label: "Evidence", shortcut: "E" },
  { id: "requirements", label: "Requirements", shortcut: "R" },
  { id: "history", label: "History", shortcut: "H" },
];

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "proof" | "blocking" | "cleared" | "observed" | "provenance" | "attention" }) {
  return <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}>{children}</span>;
}

function Technical({ children, title }: { children: React.ReactNode; title?: string }) {
  return <span className={styles.technical} title={title}>{children}</span>;
}

function SectionHeading({ eyebrow, title, supporting }: { eyebrow?: string; title: string; supporting?: string }) {
  return (
    <header className={styles.sectionHeading}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h2>{title}</h2>
      {supporting ? <p>{supporting}</p> : null}
    </header>
  );
}

function RecordButton({
  selected,
  kind,
  id,
  children,
  onSelect,
  onScope,
}: {
  selected: boolean;
  kind: RecordKind;
  id: string;
  children: React.ReactNode;
  onSelect: (selection: SelectedObject) => void;
  onScope: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.recordRow} ${selected ? styles.recordRowSelected : ""}`}
      aria-pressed={selected}
      data-workspace-record
      data-record-kind={kind}
      data-record-id={id}
      onFocus={onScope}
      onPointerDown={onScope}
      onClick={() => onSelect({ kind, id })}
    >
      {children}
    </button>
  );
}

function RelationshipStrip({ selected, onSelect }: { selected: SelectedObject; onSelect: (selection: SelectedObject) => void }) {
  if (!selected) return null;
  const trace = [
    { kind: "finding" as const, id: "finding-fallback-retrieval", label: "Finding" },
    { kind: "evidence" as const, id: "evidence-error-path-observed", label: "Evidence" },
    { kind: "proof" as const, id: "proof-retry-integration", label: "Missing proof" },
    { kind: "requirement" as const, id: "requirement-fallback-proof", label: "Requirement" },
    { kind: "change" as const, id: "file-retrieve-test-ts", label: "Affected context" },
    { kind: "readiness" as const, id: "readiness-blocker-01", label: "Readiness" },
  ];
  return (
    <nav className={styles.relationshipStrip} aria-label="Explicit relationship trace">
      <span className={styles.relationshipLabel}>Direct relationship trace</span>
      <ol>
        {trace.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className={selected.id === item.id ? styles.relationshipActive : ""}
              aria-current={selected.id === item.id ? "step" : undefined}
              onClick={() => onSelect({ kind: item.kind, id: item.id })}
            >
              <span>{item.label}</span>
              <small>{recordLabel(item.id)}</small>
            </button>
            {index < trace.length - 1 ? <Glyph name="arrow-right" size={14} /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function OverviewMode({
  variant,
  onSelect,
  onMode,
  onReadiness,
}: {
  variant: FixtureVariant;
  onSelect: (selection: SelectedObject) => void;
  onMode: (mode: WorkspaceMode) => void;
  onReadiness: () => void;
}) {
  const decision = variant === "stale-decision" ? "STALE · prior Approve predates current head" : variant === "unbound-decision" ? "UNBOUND · applicability cannot be proven" : "PENDING";
  return (
    <div className={styles.overview}>
      {variant === "partial" ? (
        <div className={styles.limitationBanner} role="status">
          <Glyph name="warning" size={16} />
          <div><strong>Partial projection</strong><span>Three historical evidence records were omitted after validation. Current review facts remain available.</span></div>
          <button type="button">Inspect limitation</button>
        </div>
      ) : null}
      <section className={styles.verdictBand} aria-labelledby="overview-verdict">
        <div>
          <span className={styles.eyebrow}>Lintel recommendation</span>
          <h2 id="overview-verdict">Tests required</h2>
          <p>The fallback can hide provider failure, and current-head integration proof has not been recorded.</p>
        </div>
        <dl className={styles.verdictFacts}>
          <div><dt>Risk</dt><dd><strong>46</strong>/100 <span>Medium</span></dd></div>
          <div><dt>Confidence</dt><dd><strong>Limited</strong><span>Missing runtime proof</span></dd></div>
        </dl>
      </section>

      <section className={styles.primaryBlocker}>
        <div className={styles.blockerIndex}>01</div>
        <div>
          <div className={styles.blockerHeading}>
            <Badge tone="blocking">High · blocking</Badge>
            <span>Primary blocker</span>
          </div>
          <h2>Fallback masks discount retrieval failure</h2>
          <p>The changed catch path returns an empty result, but no current-head integration run proves retry exhaustion and caller behaviour.</p>
          <button type="button" className={styles.inlineAction} onClick={() => { onMode("evidence"); onSelect({ kind: "finding", id: "finding-fallback-retrieval" }); }}>
            Inspect finding <Glyph name="arrow-right" size={14} />
          </button>
        </div>
      </section>

      <div className={styles.overviewGrid}>
        <section className={styles.overviewSection}>
          <SectionHeading eyebrow="Proof" title="Evidence boundary" supporting="What supports the recommendation and what remains absent." />
          <div className={styles.denseFacts}>
            <button type="button" onClick={() => { onMode("evidence"); onSelect({ kind: "evidence", id: "evidence-error-path-observed" }); }}>
              <span><Badge tone="observed">Directly observed</Badge> Fallback return path in changed source</span><strong>1 current</strong>
            </button>
            <button type="button" onClick={() => { onMode("evidence"); onSelect({ kind: "proof", id: "proof-retry-integration" }); }}>
              <span><Badge tone="proof">Missing proof</Badge> Retry and failure-path integration test</span><strong>2 blocking</strong>
            </button>
            <button type="button" onClick={() => { onMode("evidence"); onSelect({ kind: "evidence", id: "evidence-prior-test" }); }}>
              <span><Badge tone="attention">Stale</Badge> Prior-head integration suite</span><strong>1 stale</strong>
            </button>
          </div>
        </section>
        <section className={styles.overviewSection}>
          <SectionHeading eyebrow="Conditions" title="Requirements" supporting="Canonical default: four open requirements, all blocking." />
          <button type="button" className={styles.requirementSummary} onClick={() => { onMode("requirements"); onSelect({ kind: "requirement", id: "requirement-fallback-proof" }); }}>
            <span><strong>4</strong> open</span><span><strong>4</strong> blocking</span><span>2 exact conditions · 2 read-only derived</span>
          </button>
          <p className={styles.truthNote}>Task progress remains separate from proof and requirement resolution.</p>
        </section>
      </div>

      <section className={styles.movementBand}>
        <div><span className={styles.eyebrow}>Readiness Delta</span><strong className={styles.toneBlocking}>Regressed</strong></div>
        <p>Risk moved <strong>38 Low → 46 Medium</strong>; two findings were added and one requirement reopened.</p>
        <button type="button" onClick={() => onMode("history")}>Inspect Review Diff <Glyph name="arrow-right" size={14} /></button>
      </section>

      <section className={styles.humanBand}>
        <div>
          <span className={styles.eyebrow}>Human Decision</span>
          <h2>{decision}</h2>
          <p>{variant === "stale-decision" ? "An Approve decision is bound to the previous head and is not current authority." : variant === "unbound-decision" ? "The recorded decision has no head binding; stale-decision detection is limited." : "Lintel recommends. The accountable engineer decides."}</p>
        </div>
        <button type="button" className={styles.inlineAction} onClick={onReadiness}>Assess decision readiness <Glyph name="arrow-right" size={14} /></button>
      </section>
    </div>
  );
}

function ChangeMode({ selected, onSelect, onScope }: { selected: SelectedObject; onSelect: (selection: SelectedObject) => void; onScope: () => void }) {
  const [shown, setShown] = useState(7);
  return (
    <div>
      <SectionHeading title="Changed files and affected surfaces" supporting="Ordered by linked blocking risk. Focused context is shown only where the controlled record provides it." />
      <div className={styles.tableHeader} aria-hidden="true"><span>Path or surface</span><span>Change</span><span>Risk</span><span>Context</span></div>
      <div className={styles.recordTable} role="list" aria-label="Changed files and affected surfaces">
        {CHANGES.slice(0, shown).map((record) => (
          <RecordButton key={record.id} kind="change" id={record.id} selected={selected?.id === record.id} onSelect={onSelect} onScope={onScope}>
            <span className={styles.recordIdentity}><Glyph name="file" size={14} /><Technical title={record.path}>{record.path}</Technical></span>
            <span>{record.additions == null ? "Unknown" : `+${record.additions} −${record.deletions ?? 0}`}</span>
            <span>{record.risk ?? "Unknown"}</span>
            <span>{record.contextAvailable ? "Focused context available" : "Unavailable"}</span>
          </RecordButton>
        ))}
      </div>
      {shown < CHANGES.length ? <button type="button" className={styles.revealButtonWide} onClick={() => setShown((value) => Math.min(CHANGES.length, value + 7))}>Show 7 more · {CHANGES.length - shown} remaining</button> : null}
      {selected?.kind === "change" ? (
        <section className={styles.focusedContext}>
          <span className={styles.eyebrow}>Focused change context</span>
          <h3>{recordLabel(selected.id)}</h3>
          {CHANGES.find((item) => item.id === selected.id)?.contextAvailable ? (
            <pre><code>{`try {\n  return await provider.retrieve(code)\n} catch (error) {\n  return fallback.emptyResult(error)\n}`}</code></pre>
          ) : (
            <div className={styles.emptyInline}><Glyph name="warning" size={16} /><span>Focused diff context unavailable. Exact line mapping was not recorded for this fixture.</span></div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function EvidenceMode({ selected, onSelect, onScope, removed }: { selected: SelectedObject; onSelect: (selection: SelectedObject) => void; onScope: () => void; removed: boolean }) {
  const [findingShown, setFindingShown] = useState(8);
  const [evidenceShown, setEvidenceShown] = useState(8);
  const findings = removed ? FINDINGS.filter((item) => item.id !== "finding-fallback-retrieval") : FINDINGS;
  return (
    <div>
      <SectionHeading title="Evidence and verification gaps" supporting="Blocking missing proof and stale blocker evidence precede supporting records. Every relationship is fixture-explicit." />
      {removed ? <div className={styles.limitationBanner} role="status"><Glyph name="warning" size={16} /><div><strong>Finding is no longer present after the update.</strong><span>Selection cleared; the Evidence collection and scroll anchor remain available.</span></div></div> : null}
      <section className={styles.recordSection}>
        <div className={styles.collectionHeading}><h3>Missing proof</h3><span>{MISSING_PROOF.length} records · 2 blocking</span></div>
        <div className={styles.recordTable} role="list" aria-label="Missing proof records">
          {MISSING_PROOF.map((record) => (
            <RecordButton key={record.id} kind="proof" id={record.id} selected={selected?.id === record.id} onSelect={onSelect} onScope={onScope}>
              <span className={styles.recordPrimary}><Badge tone={record.importance === "blocking" ? "blocking" : "proof"}>{record.importance}</Badge><strong>{record.title}</strong><small>{record.sought}</small></span>
              <span>{record.state}</span><span>{record.relationshipIds.length} direct</span><span>Open</span>
            </RecordButton>
          ))}
        </div>
      </section>
      <section className={styles.recordSection}>
        <div className={styles.collectionHeading}><h3>Findings</h3><span>{FINDINGS.length} total · 4 blocking/high</span></div>
        <div className={styles.recordTable} role="list" aria-label="Findings">
          {findings.slice(0, findingShown).map((record) => (
            <RecordButton key={record.id} kind="finding" id={record.id} selected={selected?.id === record.id} onSelect={onSelect} onScope={onScope}>
              <span className={styles.recordPrimary}><Badge tone={record.blocking ? "blocking" : record.severity === "MEDIUM" ? "attention" : "neutral"}>{record.severity}{record.blocking ? " · blocking" : ""}</Badge><strong>{record.title}</strong><small>{record.statement}</small></span>
              <span>{record.category}</span><span>{record.provenance}</span><span>{record.relationshipIds.length} links</span>
            </RecordButton>
          ))}
        </div>
        {findingShown < findings.length ? <button type="button" className={styles.revealButtonWide} onClick={() => setFindingShown((value) => Math.min(findings.length, value + 8))}>Show 8 more findings · {findings.length - findingShown} remaining</button> : null}
      </section>
      <section className={styles.recordSection}>
        <div className={styles.collectionHeading}><h3>Evidence records</h3><span>{EVIDENCE.length} total · 7 classes</span></div>
        <div className={styles.recordTable} role="list" aria-label="Evidence records">
          {EVIDENCE.slice(0, evidenceShown).map((record) => (
            <RecordButton key={record.id} kind="evidence" id={record.id} selected={selected?.id === record.id} onSelect={onSelect} onScope={onScope}>
              <span className={styles.recordPrimary}><Badge tone={record.evidenceClass === "directly observed" ? "observed" : record.evidenceClass === "model inferred" ? "provenance" : record.status === "stale" ? "attention" : "neutral"}>{record.evidenceClass}</Badge><strong>{record.title}</strong><small>{record.statement}</small></span>
              <span>{record.status}</span><span><Technical>{record.runId}</Technical></span><span>{record.relationshipIds.length} links</span>
            </RecordButton>
          ))}
        </div>
        {evidenceShown < EVIDENCE.length ? <button type="button" className={styles.revealButtonWide} onClick={() => setEvidenceShown((value) => Math.min(EVIDENCE.length, value + 8))}>Show 8 more evidence records · {EVIDENCE.length - evidenceShown} remaining</button> : null}
      </section>
    </div>
  );
}

function activeRequirements(variant: FixtureVariant, statuses: Record<string, RequirementRecord["status"]>) {
  let result = REQUIREMENTS.filter((item) => item.activeByDefault);
  const idByVariant: Partial<Record<FixtureVariant, string>> = {
    "reopened-requirement": "requirement-timeout-test",
    "advisory-requirement": "requirement-cache-review",
    "cleared-requirement": "requirement-cleared-contract",
    "stale-requirement": "requirement-stale-observer",
    "unavailable-requirement": "requirement-unavailable-source",
  };
  if (idByVariant[variant]) result = [REQUIREMENTS.find((item) => item.id === idByVariant[variant])!];
  return result.map((item) => ({ ...item, status: statuses[item.id] ?? item.status }));
}

function RequirementsMode({ variant, statuses, selected, onSelect, onScope }: { variant: FixtureVariant; statuses: Record<string, RequirementRecord["status"]>; selected: SelectedObject; onSelect: (selection: SelectedObject) => void; onScope: () => void }) {
  const records = activeRequirements(variant, statuses);
  const open = records.filter((item) => item.status === "open" || item.status === "reopened").length;
  const blocking = records.filter((item) => item.importance === "blocking" && (item.status === "open" || item.status === "reopened" || item.status === "stale")).length;
  return (
    <div>
      <SectionHeading title="Requirements" supporting={`${open} open · ${blocking} blocking in this controlled projection. Canonical default remains 4 open / 4 blocking.`} />
      <div className={styles.requirementLegend}><span>Exactly 2 catalogue identities are writable exact conditions.</span><span>9 identities are read-only derived requirements.</span></div>
      <div className={styles.tableHeaderRequirements} aria-hidden="true"><span>Requirement</span><span>Status</span><span>Proof</span><span>Capability</span><span>Task</span></div>
      <div className={styles.recordTable} role="list" aria-label="Requirements">
        {records.map((record) => (
          <RecordButton key={record.id} kind="requirement" id={record.id} selected={selected?.id === record.id} onSelect={onSelect} onScope={onScope}>
            <span className={styles.recordPrimary}><Badge tone={record.importance === "blocking" ? "blocking" : "neutral"}>{record.importance}</Badge><strong>{record.title}</strong><small>{record.statement}</small></span>
            <span>{record.status}</span><span>{record.requiredProof}</span><span>{record.capability === "condition" ? "Clear / reopen" : "Read-only derived"}</span><span>{record.taskStatus}</span>
          </RecordButton>
        ))}
      </div>
      <div className={styles.truthBoundary}>
        <strong>Capability boundary</strong>
        <span>Local task progress does not clear proof, resolve a requirement, acknowledge it, or waive risk.</span>
      </div>
    </div>
  );
}

function HistoryMode({ variant, selected, onSelect, onScope }: { variant: FixtureVariant; selected: SelectedObject; onSelect: (selection: SelectedObject) => void; onScope: () => void }) {
  const [shown, setShown] = useState(6);
  if (variant === "invalid-history") {
    return (
      <div><SectionHeading title="History unavailable" supporting="Stored history could not be read as valid report history." /><div className={styles.errorState} role="alert"><Glyph name="warning" size={18} /><h3>Invalid prior history</h3><p>The current run remains intact. Delta and Diff claims are disabled for this pair.</p><button type="button">Select another prior run</button></div></div>
    );
  }
  if (variant === "initial") {
    return (
      <div><SectionHeading title="Run history" supporting="Initial run — no previous comparison." /><div className={styles.runIdentity}><div><span>Current run</span><Technical>run_482_03</Technical></div><div><span>Head</span><Technical title={CURRENT_HEAD}>{CURRENT_HEAD}</Technical></div></div><div className={styles.emptyInline}>No prior run history is available for this controlled variant.</div></div>
    );
  }
  return (
    <div>
      <SectionHeading title="Readiness movement" supporting="Current run is fixed. Comparison uses the immediately previous applicable run." />
      <div className={styles.runPair}>
        <div><span>Current</span><Technical>run_482_03</Technical><small title={CURRENT_HEAD}>8ac41de…6a102</small></div>
        <Glyph name="arrow-right" size={18} />
        <div><span>Previous</span><Technical>run_482_02</Technical><small title={PREVIOUS_HEAD}>631fb20…81a14</small></div>
      </div>
      <section className={styles.deltaSection}>
        <div><span className={styles.eyebrow}>Readiness Delta</span><h3 className={styles.toneBlocking}>Regressed</h3></div>
        <dl>
          <div><dt>Recommendation</dt><dd>Tests required → Tests required</dd></div>
          <div><dt>Risk</dt><dd>38 Low → 46 Medium</dd></div>
          <div><dt>Findings</dt><dd><button type="button">2 added</button> · 1 cleared · 1 changed</dd></div>
          <div><dt>Requirements</dt><dd><button type="button">2 opened</button> · 1 cleared · 1 reopened</dd></div>
          <div><dt>Evidence</dt><dd>3 new · 1 stale</dd></div>
        </dl>
      </section>
      <section className={styles.recordSection}>
        <div className={styles.collectionHeading}><h3>Review Diff</h3><span>Inspectable record movement</span></div>
        <div className={styles.recordTable} role="list" aria-label="Review Diff">
          {[
            ["diff-requirement-fallback-proof", "reopened", "Requirement · Prove fallback failure path", "Open in current run"],
            ["diff-finding-error-classification", "added", "Finding · Provider error classification", "High · blocking"],
            ["diff-evidence-prior-test", "changed", "Evidence · Prior-head integration suite", "Present → stale"],
            ["diff-finding-cleared", "cleared", "Finding · Unbounded retry loop", "No longer present"],
          ].map(([id, status, title, current]) => (
            <RecordButton key={id} kind="diff" id={id} selected={selected?.id === id} onSelect={onSelect} onScope={onScope}>
              <span className={styles.recordPrimary}><Badge tone={status === "cleared" ? "cleared" : status === "reopened" ? "blocking" : "attention"}>{status}</Badge><strong>{title}</strong><small>{current}</small></span>
              <span>Previous</span><span>Current</span><span>Inspect</span>
            </RecordButton>
          ))}
        </div>
      </section>
      <section className={styles.recordSection}>
        <div className={styles.collectionHeading}><h3>Runs</h3><span>12 planned long-history records · current local history remains capped at 10</span></div>
        <div className={styles.recordTable} role="list" aria-label="Run history">
          {RUNS.slice(0, shown).map((run, index) => (
            <RecordButton key={run.id} kind="run" id={run.id} selected={selected?.id === run.id} onSelect={onSelect} onScope={onScope}>
              <span className={styles.recordPrimary}><Badge tone={index === 0 ? "observed" : "neutral"}>{index === 0 ? "current" : index === 1 ? "previous" : "historical"}</Badge><Technical>{run.id}</Technical><small title={run.head}>{run.head ? `${run.head.slice(0, 8)}…${run.head.slice(-5)}` : "Head not recorded"}</small></span>
              <span>{run.source}</span><span>{run.reproducibility}</span><span>{run.recordedAt}</span>
            </RecordButton>
          ))}
        </div>
        {shown < RUNS.length ? <button type="button" className={styles.revealButtonWide} onClick={() => setShown(RUNS.length)}>Show 6 more runs</button> : null}
      </section>
    </div>
  );
}

function DecisionReadinessBar({ variant, onOpen, onInspect }: { variant: FixtureVariant; onOpen: () => void; onInspect: () => void }) {
  const stale = variant === "stale-decision";
  const unbound = variant === "unbound-decision";
  return (
    <section className={styles.readinessBar} aria-label="Decision readiness">
      <button type="button" className={styles.readinessSummary} onClick={onInspect}>
        <span className={styles.readinessState}><span className={styles.statusDot} />Not ready for Human Decision</span>
        <span>4 blockers · 2 missing proof · 1 stale evidence</span>
        <span>{stale ? "Earlier Approve is stale" : unbound ? "Earlier decision is unbound" : "Human Decision pending"}</span>
      </button>
      <button type="button" className={styles.primaryButton} onClick={onOpen}>Record Human Decision</button>
    </section>
  );
}

function LoadingReadinessBar() {
  return (
    <section className={`${styles.readinessBar} ${styles.readinessWithheld}`} aria-label="Decision readiness loading" aria-busy="true">
      <span className={styles.readinessState}><span className={styles.loadingDot} />Decision readiness withheld</span>
      <span>Waiting for the authoritative review projection. Human Decision is unavailable.</span>
    </section>
  );
}

export function WorkspaceSurface({
  review,
  mode,
  selected,
  variant,
  stateSlug,
  focusMode,
  inspectorOpen,
  removed,
  requirementStatuses,
  onMode,
  onSelect,
  onOpenDecision,
  onReadiness,
  onToggleQueue,
  onToggleInspector,
  onToggleFocus,
  onShowQueue,
  onShowInspector,
  onBackToList,
  onRetryUnavailable,
  onScope,
  scrollRef,
  onScroll,
}: {
  review: ReviewFixture;
  mode: WorkspaceMode;
  selected: SelectedObject;
  variant: FixtureVariant;
  stateSlug: string;
  focusMode: boolean;
  inspectorOpen: boolean;
  removed: boolean;
  requirementStatuses: Record<string, RequirementRecord["status"]>;
  onMode: (mode: WorkspaceMode) => void;
  onSelect: (selection: SelectedObject) => void;
  onOpenDecision: () => void;
  onReadiness: () => void;
  onToggleQueue: () => void;
  onToggleInspector: () => void;
  onToggleFocus: () => void;
  onShowQueue: () => void;
  onShowInspector: () => void;
  onBackToList: () => void;
  onRetryUnavailable: () => void;
  onScope: () => void;
  scrollRef: React.RefObject<HTMLElement | null>;
  onScroll: () => void;
}) {
  const currentMode = MODES.find((item) => item.id === mode)!;
  const decisionState = variant === "stale-decision" ? "STALE" : variant === "unbound-decision" ? "UNBOUND" : "PENDING";
  const headingId = `workspace-${mode}-heading`;
  const loading = stateSlug === "loading";
  const unavailable = variant === "unavailable";
  const authorityWithheld = loading || unavailable;
  const exactHead = variant === "unbound-decision" ? undefined : review.head;

  const modeContent = useMemo(() => {
    if (variant === "empty") return <div className={styles.emptyState}><h2 id={headingId}>Select a review to begin verification.</h2><p>No review is selected in this controlled empty state.</p><button type="button" onClick={onBackToList}>Open review list</button></div>;
    if (unavailable) return <div className={styles.unavailableState} role="alert"><span className={styles.eyebrow}>Requested stored identity · report-2026-redemption-legacy</span><h2 id={headingId}>This stored review is no longer available.</h2><p>Current recommendation, risk, blockers, run, head, readiness, and Human Decision detail are withheld. No substitute review has been selected.</p><div><button type="button" onClick={onBackToList}>Return to review list</button><button type="button" onClick={onRetryUnavailable}>Retry requested review</button></div></div>;
    if (loading) return <div className={styles.loadingState} aria-busy="true"><h2 id={headingId}>Loading selected review…</h2><div /><div /><div /><p>Review identity is retained. No stale detail is claimed.</p></div>;
    if (mode === "overview") return <OverviewMode variant={variant} onSelect={onSelect} onMode={onMode} onReadiness={onReadiness} />;
    if (mode === "change") return <ChangeMode selected={selected} onSelect={onSelect} onScope={onScope} />;
    if (mode === "evidence") return <EvidenceMode selected={selected} onSelect={onSelect} onScope={onScope} removed={removed} />;
    if (mode === "requirements") return <RequirementsMode variant={variant} statuses={requirementStatuses} selected={selected} onSelect={onSelect} onScope={onScope} />;
    return <HistoryMode variant={variant} selected={selected} onSelect={onSelect} onScope={onScope} />;
  }, [headingId, loading, mode, onBackToList, onMode, onReadiness, onRetryUnavailable, onScope, onSelect, removed, requirementStatuses, selected, unavailable, variant]);

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);
    const index = tabs.indexOf(event.currentTarget);
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    tabs[next]?.focus();
  }

  return (
    <main id="workspace-primary" className={styles.workspace} aria-label="Verification Workspace" tabIndex={-1} data-readiness={loading ? "loading" : unavailable || variant === "empty" ? "none" : "active"}>
      <div className={styles.workspaceSticky}>
        <div className={styles.mobileOrientation}>
          <button type="button" onClick={onBackToList}><Glyph name="chevron-left" size={16} />Reviews</button>
          <span>{unavailable ? "Requested stored review · report-2026-redemption-legacy" : <><Technical>{review.repository}</Technical> · PR #{review.pr}</>}</span>
        </div>
        {focusMode && !authorityWithheld ? (
          <div className={styles.focusOrientation}>
            <span><Technical>{review.repository}</Technical> · PR #{review.pr}</span>
            <span>TESTS REQUIRED · 46 MEDIUM · 4 blocking · {decisionState}</span>
            <span>{currentMode.label}{selected ? ` · ${recordLabel(selected.id)}` : ""}</span>
            <div><button type="button" onClick={onToggleFocus}>Exit focus mode</button><button type="button" onClick={onShowQueue}>Show queue</button><button type="button" onClick={onShowInspector}>Show Inspector</button></div>
          </div>
        ) : unavailable ? (
          <header className={`${styles.reviewHeader} ${styles.authorityHeader}`}>
            <div className={styles.reviewIdentity}>
              <span className={styles.eyebrow}>Requested stored review · no current authority</span>
              <div className={styles.reviewTitleLine}><Technical>report-2026-redemption-legacy</Technical></div>
              <h1>Requested review unavailable</h1>
            </div>
            <div className={styles.authorityNotice} role="status"><Glyph name="warning" size={18} /><div><strong>No current review detail</strong><span>Recommendation, risk, blockers, run, head, readiness, and Human Decision are withheld.</span></div></div>
          </header>
        ) : loading ? (
          <header className={`${styles.reviewHeader} ${styles.authorityHeader}`} aria-busy="true">
            <div className={styles.reviewIdentity}>
              <span className={styles.eyebrow}>Selected review identity · projection loading</span>
              <div className={styles.reviewTitleLine}><Technical title={review.repository}>{review.repository}</Technical><span>PR #{review.pr}</span></div>
              <h1>{review.title}</h1>
            </div>
            <div className={styles.authorityNotice}><span className={styles.loadingDot} /><div><strong>Current detail withheld</strong><span>Waiting for an authoritative recommendation, risk, blockers, run, head, and decision-readiness projection.</span></div></div>
          </header>
        ) : (
          <header className={styles.reviewHeader}>
            <div className={styles.reviewIdentity}>
              <span className={styles.eyebrow}>Selected review · local planned fixture</span>
              <div className={styles.reviewTitleLine}><Technical title={review.repository}>{review.repository}</Technical><span>PR #{review.pr}</span></div>
              <h1>{review.title}</h1>
            </div>
            <div className={styles.reviewVerdict}>
              <div><span>Lintel recommendation</span><strong className={styles.toneProof}>{review.recommendation}</strong></div>
              <div><span>Risk</span><strong>{review.riskScore}/100 {review.riskBand}</strong></div>
              <div><span>Requirements</span><strong className={styles.toneBlocking}>4 open · 4 blocking</strong></div>
              <div><span>Human Decision</span><strong>{decisionState}</strong></div>
            </div>
            <div className={styles.reviewTechnical}>
              <span>Run <Technical>{review.runId}</Technical></span>
              <span>Head <Technical title={exactHead}>{exactHead ? `${exactHead.slice(0, 8)}…${exactHead.slice(-5)}` : "Not recorded"}</Technical></span>
              <span>Branch <Technical title={LONG_BRANCH}>{LONG_BRANCH}</Technical></span>
              <button type="button" className={styles.iconButton} onClick={onToggleFocus} aria-label="Enter focus mode" title="Enter focus mode"><Glyph name="focus" size={18} /></button>
              <button type="button" className={styles.inspectorDisclosure} onClick={onToggleInspector} aria-expanded={inspectorOpen}><Glyph name="panel-right" size={16} />{inspectorOpen ? "Close detail" : "Open detail"}</button>
            </div>
          </header>
        )}
        <div className={styles.modeRow}>
          <div className={styles.modeTabs} role="tablist" aria-label="Workspace modes">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`workspace-tab-${item.id}`}
                aria-selected={mode === item.id}
                aria-controls={`workspace-panel-${item.id}`}
                aria-disabled={authorityWithheld || undefined}
                disabled={authorityWithheld}
                tabIndex={mode === item.id ? 0 : -1}
                onClick={() => onMode(item.id)}
                onKeyDown={onTabKeyDown}
                onFocus={onScope}
              >
                {item.label}{item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
              </button>
            ))}
          </div>
          <label className={styles.mobileModeSelect}>
            <span>Mode</span>
            <select value={mode} disabled={authorityWithheld} onChange={(event) => onMode(event.target.value as WorkspaceMode)}>
              {MODES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <button type="button" className={styles.queueOverlayButton} onClick={onToggleQueue}><Glyph name="panel-left" size={16} />Review queue</button>
        </div>
      </div>

      <section
        ref={scrollRef}
        className={styles.workspaceScroll}
        onScroll={onScroll}
        role="tabpanel"
        id={`workspace-panel-${mode}`}
        aria-labelledby={`workspace-tab-${mode}`}
        tabIndex={-1}
      >
        <h2 id={headingId} className={styles.srOnly}>{currentMode.label}</h2>
        <RelationshipStrip selected={selected} onSelect={onSelect} />
        {stateSlug === "reduced-motion" ? (
          <section className={styles.validationEvidence} aria-labelledby="reduced-motion-evidence">
            <span className={styles.eyebrow}>Validation evidence</span>
            <h2 id="reduced-motion-evidence">Reduced motion is honoured</h2>
            <p>No essential state change depends on animation. The reduced-motion media query removes smooth scrolling and suppresses all transition and animation duration.</p>
            <dl>
              <div><dt>Preference</dt><dd>reduce</dd></div>
              <div><dt>Essential animation</dt><dd>None</dd></div>
              <div><dt>State visibility</dt><dd>Immediate</dd></div>
            </dl>
          </section>
        ) : null}
        {modeContent}
        <div className={styles.workspaceEnd} aria-hidden="true">End of {currentMode.label}</div>
      </section>
      {loading ? <LoadingReadinessBar /> : variant !== "empty" && !unavailable ? <DecisionReadinessBar variant={variant} onOpen={onOpenDecision} onInspect={onReadiness} /> : null}
    </main>
  );
}
