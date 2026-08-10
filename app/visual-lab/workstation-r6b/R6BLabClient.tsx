"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { RISKY_TESTS_REQUIRED_SAMPLE } from "../../../lib/sample-pr-input";
import {
  DECISION_OUTCOMES,
  OUTCOME_LABEL,
  OUTCOME_MEANING,
  RECOMMENDATION_LABEL,
  type ArtifactKind,
  type CaseDetail,
  type DecisionOutcome,
  type EvidenceView,
  type QueueCaseSummary,
  type RelationshipState,
  type RequirementView,
  type WorkspaceReadySnapshot,
} from "../../../lib/workspace-v2/view-model";
import { GROUP_LABEL, GROUP_ORDER } from "../../../lib/workspace-v2/queue-projection";
import styles from "./workstation-r6b.module.css";

type Mode = "overview" | "change" | "evidence" | "requirements" | "history";
type QueuePreference = "expanded" | "compact";
type Q1Candidate = "q1a" | "q1b";
type Q2Candidate = "q2a" | "q2b";
type Q3Candidate = "q3a" | "q3b";
type Candidate = Q1Candidate | Q2Candidate | Q3Candidate;
type CandidateConfiguration = { q1: Q1Candidate; q2: Q2Candidate; q3: Q3Candidate; density: boolean };
type LabViewport = "auto" | "spacious" | "standard" | "compact" | "constrained" | "narrow";
type Selection = { kind: ArtifactKind; id: string };
type LabPreset = {
  id: string;
  label: string;
  mode: Mode;
  selected: boolean;
  inspector?: boolean;
  focus?: boolean;
  commands?: boolean;
  decision?: boolean;
  stale?: boolean;
  queue?: QueuePreference;
  viewport?: LabViewport;
};

const PRESETS: LabPreset[] = [
  { id: "L1", label: "Reviews idle", mode: "overview", selected: false },
  { id: "L2", label: "Selected Review / Overview", mode: "overview", selected: true },
  { id: "L3", label: "Evidence", mode: "evidence", selected: true },
  { id: "L4", label: "Evidence + Inspector", mode: "evidence", selected: true, inspector: true },
  { id: "L5", label: "Requirements", mode: "requirements", selected: true },
  { id: "L6", label: "Change focus", mode: "change", selected: true, focus: true },
  { id: "L7", label: "Human Decision", mode: "overview", selected: true, decision: true },
  { id: "L8", label: "Commands", mode: "overview", selected: true, commands: true },
  { id: "L9", label: "Compact", mode: "overview", selected: true, queue: "compact", viewport: "compact" },
  { id: "L10", label: "Narrow", mode: "overview", selected: true, viewport: "narrow" },
  { id: "L11", label: "Restored", mode: "evidence", selected: true, inspector: true, queue: "compact" },
  { id: "L12", label: "Verification changed while deciding", mode: "overview", selected: true, decision: true, stale: true },
];

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "change", label: "Change" },
  { id: "evidence", label: "Evidence" },
  { id: "requirements", label: "Requirements" },
  { id: "history", label: "History" },
];

const Q1_CANDIDATES: Array<{ value: Q1Candidate; label: string }> = [
  { value: "q1a", label: "A · linear + Inspector" },
  { value: "q1b", label: "B · bounded inline" },
];

const Q2_CANDIDATES: Array<{ value: Q2Candidate; label: string }> = [
  { value: "q2a", label: "A · surface + rule" },
  { value: "q2b", label: "B · type emphasis" },
];

const Q3_CANDIDATES: Array<{ value: Q3Candidate; label: string }> = [
  { value: "q3a", label: "A · persistent full verdict" },
  { value: "q3b", label: "B · contextual verdict" },
];

const ACCEPTED_CANDIDATES: CandidateConfiguration = { q1: "q1b", q2: "q2a", q3: "q3b", density: true };

const VIEWPORTS: LabViewport[] = ["auto", "spacious", "standard", "compact", "constrained", "narrow"];

const icon: Record<string, string> = {
  reviews: "R",
  policies: "P",
  integrations: "I",
  settings: "S",
  search: "⌕",
  filter: "≡",
  queue: "☷",
  inspect: "→",
  close: "×",
  focus: "⛶",
  command: "⌘",
  back: "←",
};

function presetFor(value?: string) {
  return PRESETS.find((item) => item.id.toLowerCase() === value?.toLowerCase()) ?? PRESETS[1];
}

function candidateConfigurationFor(value?: string, q1?: string, q2?: string, q3?: string): CandidateConfiguration {
  const configuration: CandidateConfiguration = value === "accepted"
    ? { ...ACCEPTED_CANDIDATES }
    : { q1: "q1a", q2: "q2a", q3: "q3a", density: value === "q2a" || value === "q2b" };

  if (value === "q1a" || value === "q1b") configuration.q1 = value;
  if (value === "q2a" || value === "q2b") configuration.q2 = value;
  if (value === "q3a" || value === "q3b") configuration.q3 = value;
  if (q1 === "q1a" || q1 === "q1b") configuration.q1 = q1;
  if (q2 === "q2a" || q2 === "q2b") { configuration.q2 = q2; configuration.density = true; }
  if (q3 === "q3a" || q3 === "q3b") configuration.q3 = q3;
  return configuration;
}

function viewportFor(value?: string): LabViewport {
  return VIEWPORTS.includes(value as LabViewport) ? (value as LabViewport) : "auto";
}

function titleFor(snapshot: WorkspaceReadySnapshot, caseId: string) {
  for (const group of snapshot.groups) {
    const found = group.cases.find((item) => item.caseId === caseId);
    if (found) return found.title;
  }
  return "Selected Review";
}

function updateQuery(values: Record<string, string | null>) {
  const url = new URL(window.location.href);
  Object.entries(values).forEach(([key, value]) => {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  });
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function groupRows(snapshot: WorkspaceReadySnapshot, density: boolean) {
  if (!density) return snapshot.groups;
  return GROUP_ORDER.map((id) => {
    const source = snapshot.groups.find((group) => group.id === id);
    if (!source) return { id, label: GROUP_LABEL[id], cases: [] };
    return {
      ...source,
      cases: source.cases.flatMap((item, index) =>
        [0, 1, 2].map((echo) => ({
          ...item,
          caseId: echo === 0 ? item.caseId : `${item.caseId}-density-${echo}`,
          pullRequestNumber: item.pullRequestNumber + echo * 100,
          title: echo === 0 ? item.title : `${item.title} — density sample ${echo}`,
        })),
      ),
    };
  }).filter((group) => group.cases.length > 0);
}

function useViewportBand(forced: LabViewport) {
  const [width, setWidth] = useState(1440);
  useEffect(() => {
    const sync = () => setWidth(window.innerWidth);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  if (forced !== "auto") return { band: forced, width };
  const band: Exclude<LabViewport, "auto"> = width >= 1600 ? "spacious" : width >= 1360 ? "standard" : width >= 1100 ? "compact" : width >= 900 ? "constrained" : "narrow";
  return { band, width };
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className={styles.fieldLabel}>{children}</span>;
}

function Relationship({ label, state, onOpen }: { label: string; state: RelationshipState; onOpen: (selection: Selection, label: string) => void }) {
  return (
    <div className={styles.relationship}>
      <strong>{label}</strong>
      {state.status === "linked" ? (
        <div>
          {state.related.map((item) => <button key={`${item.kind}-${item.id}`} type="button" onClick={() => onOpen({ kind: item.kind, id: item.id }, item.label)}>{item.label} <span aria-hidden="true">→</span></button>)}
          {state.unresolved.length > 0 ? <p>Unresolved references: <code>{state.unresolved.join(", ")}</code></p> : null}
        </div>
      ) : state.status === "none" ? <p>None recorded.</p> : state.status === "unavailable" ? <p>Unavailable — {state.reason}</p> : <p>Unresolved — <code>{state.unresolved.join(", ")}</code></p>}
    </div>
  );
}

function QueueRow({ item, selected, variant, compact, buttonRef, onSelect, onKeyDown }: { item: QueueCaseSummary; selected: boolean; variant: Q2Candidate; compact: boolean; buttonRef: (node: HTMLButtonElement | null) => void; onSelect: () => void; onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      ref={buttonRef}
      className={styles.queueRow}
      data-selected={selected || undefined}
      data-selection-variant={variant === "q2b" ? "type" : "rule"}
      aria-current={selected ? "page" : undefined}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      title={`PR #${item.pullRequestNumber} · ${item.title}`}
    >
      <span className={styles.queueRowMeta}><b>#{item.pullRequestNumber}</b><span>{item.riskLevel.toLowerCase()}</span></span>
      <strong>{item.title}</strong>
      <span className={styles.queueRowFoot}>{RECOMMENDATION_LABEL[item.recommendation]}{compact ? "" : ` · ${item.repository}`}</span>
    </button>
  );
}

function GlobalNavigation({ narrow }: { narrow: boolean }) {
  return (
    <nav className={styles.globalNav} aria-label="Application">
      <a className={styles.brand} href="#workspace" aria-label="Lintel laboratory"><span aria-hidden="true">⌁</span><b>Lintel</b></a>
      <div className={styles.globalLinks}>
        {["Reviews", "Policies", "Integrations", "Settings"].map((label) => <button key={label} type="button" className={label === "Reviews" ? styles.globalActive : undefined} aria-current={label === "Reviews" ? "page" : undefined}><span aria-hidden="true">{icon[label.toLowerCase()]}</span><b>{label}</b></button>)}
      </div>
      {!narrow ? <span className={styles.labMark}>Private<br />R6B lab</span> : null}
    </nav>
  );
}

function ReviewQueue({ snapshot, selected, compact, density, variant, activeFilter, filterOpen, hidden, selectedButtonRef, onFilterOpen, onActiveFilter, onSelect }: {
  snapshot: WorkspaceReadySnapshot;
  selected: boolean;
  compact: boolean;
  density: boolean;
  variant: Q2Candidate;
  activeFilter: boolean;
  filterOpen: boolean;
  hidden: boolean;
  selectedButtonRef: React.RefObject<HTMLButtonElement | null>;
  onFilterOpen: () => void;
  onActiveFilter: (value: boolean) => void;
  onSelect: () => void;
}) {
  const groups = groupRows(snapshot, density);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const [query, setQuery] = useState("");
  const all = groups.flatMap((group) => group.cases);
  const visibleGroups = groups.map((group) => ({ ...group, cases: group.cases.filter((item) => `${item.title} ${item.pullRequestNumber}`.toLowerCase().includes(query.toLowerCase())) }));
  function move(event: KeyboardEvent<HTMLButtonElement>, item: QueueCaseSummary) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const index = all.findIndex((entry) => entry.caseId === item.caseId);
    const next = (index + (event.key === "ArrowDown" ? 1 : -1) + all.length) % all.length;
    buttons.current[next]?.focus();
  }
  let rowIndex = -1;
  return (
    <aside className={styles.queue} aria-label="Review Queue" data-compact={compact || undefined} hidden={hidden}>
      <div className={styles.queueHeading}><div><strong>Review Queue</strong><span>{all.length} reviews</span></div></div>
      <div className={styles.queueSearch}>
        <span aria-hidden="true">{icon.search}</span><input aria-label="Search Review Queue" placeholder="Search reviews" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="button" aria-label="Reveal Queue filters" aria-expanded={filterOpen} onClick={onFilterOpen}>{icon.filter}</button>
      </div>
      {filterOpen ? <div className={styles.filterPanel}><label><input type="checkbox" checked={activeFilter} onChange={(event) => onActiveFilter(event.target.checked)} /> Blocking only</label><p>Filters this Queue only. Commands do not read it.</p></div> : null}
      {activeFilter ? <p className={styles.filterDisclosure}>Filter active · blocking only</p> : null}
      <div className={styles.queueScroll}>
        {visibleGroups.map((group) => <section key={group.id} className={styles.queueGroup} aria-labelledby={`r6b-group-${group.id}`}><h2 id={`r6b-group-${group.id}`}><span>{group.label}</span><b>{group.cases.length}</b></h2>{group.cases.map((item) => { rowIndex += 1; const thisIndex = rowIndex; const isSelected = selected && item.caseId === "case-482"; return <QueueRow key={item.caseId} item={item} selected={isSelected} compact={compact} variant={variant} buttonRef={(node) => { buttons.current[thisIndex] = node; if (isSelected) selectedButtonRef.current = node; }} onSelect={onSelect} onKeyDown={(event) => move(event, item)} />; })}</section>)}
      </div>
      <p className={styles.queueLimit}>{density ? "Canonical groups · 12 synthetic density rows" : "Read-only sample projection · fallback is not recorded state"}</p>
    </aside>
  );
}

function IdentityChrome({ detail, title, mode, q3, onMode, onCommands, onQueue, onInspector, onFocus, focus }: {
  detail: CaseDetail; title: string; mode: Mode; q3: Q3Candidate; onMode: (mode: Mode) => void; onCommands: (origin: HTMLElement) => void; onQueue: () => void; onInspector: (origin: HTMLElement) => void; onFocus: () => void; focus: boolean;
}) {
  const nav = useRef<HTMLElement | null>(null);
  function modeKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? MODES.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + MODES.length) % MODES.length;
    onMode(MODES[next].id);
    (nav.current?.querySelectorAll("button")[next] as HTMLButtonElement | undefined)?.focus();
  }
  const full = q3 !== "q3b" || mode === "overview";
  const openRequirements = detail.requirements.filter((requirement) => requirement.status === "open" || requirement.status === "stale").length;
  const blockingRequirements = detail.requirements.filter((requirement) => requirement.importance === "blocking" && requirement.status === "open").length;
  const riskLabel = `${detail.riskScore}/100 ${detail.riskLevel[0] + detail.riskLevel.slice(1).toLowerCase()}`;
  return (
    <header className={styles.workspaceChrome} data-r6b-workspace-chrome>
      <div className={styles.identityRow}>
        <div className={styles.reviewIdentity}>
          <span><code>{detail.github.repository}</code> · PR #{detail.github.pullRequestNumber}</span>
          <h1 title={title}>{title}</h1>
        </div>
        <div className={styles.verdictLine} data-full={full || undefined} aria-label="Current Review state">
          <p className={styles.verdictStatement}>
            <span className={`${styles.verdictClause} ${styles.verdictMandatory}`}>Lintel recommends <strong>{RECOMMENDATION_LABEL[detail.recommendation]}</strong></span>
            {full ? <span className={`${styles.verdictClause} ${styles.verdictOptional} ${styles.verdictRisk}`}>Risk <strong>{riskLabel}</strong></span> : null}
            {full ? <span className={`${styles.verdictClause} ${styles.verdictOptional} ${styles.verdictRequirements}`}><strong>{openRequirements}</strong> requirements open, <strong>{blockingRequirements}</strong> blocking</span> : null}
            <span className={`${styles.verdictClause} ${styles.verdictMandatory}`}>Human Decision <strong>pending</strong></span>
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={(event) => onCommands(event.currentTarget)}><span aria-hidden="true">{icon.command}</span><b>Commands</b></button>
          <button type="button" onClick={onQueue} aria-label="Toggle manual Queue preference">{icon.queue}</button>
          <button type="button" onClick={(event) => onInspector(event.currentTarget)} aria-label="Open contextual Inspector">▥</button>
          <button type="button" onClick={onFocus} aria-pressed={focus} aria-label={focus ? "Exit Focus" : "Enter Focus"}>{icon.focus}</button>
        </div>
      </div>
      <nav ref={nav} className={styles.modeNav} aria-label="Selected Review modes" role="tablist">{MODES.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} tabIndex={mode === item.id ? 0 : -1} onClick={() => onMode(item.id)} onKeyDown={(event) => modeKeys(event, index)}>{item.label}</button>)}</nav>
    </header>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className={styles.documentSection}><header><span>{number}</span><h2>{title}</h2></header>{children}</section>;
}

function Overview({ detail, onInspect, onDecision }: { detail: CaseDetail; onInspect: (selection: Selection, label: string, origin: HTMLElement) => void; onDecision: (origin: HTMLElement) => void }) {
  const blocking = detail.requirements.filter((item) => item.importance === "blocking" && item.status === "open");
  const stale = detail.evidence.filter((item) => item.stale);
  const readiness = detail.readiness;
  return <article className={styles.document}>
    <Section number="01" title="What changed"><p className={styles.lede}>{detail.executiveSummary}</p><ul className={styles.fileSummary}>{detail.changedFiles.map((file) => <li key={file.artifactId}><code>{file.path}</code><span>{file.additions === null ? "additions unknown" : `+${file.additions}`} · {file.deletions === null ? "deletions unknown" : `−${file.deletions}`}</span></li>)}</ul></Section>
    <Section number="02" title="What Lintel observed"><div className={styles.statementList}>{detail.findings.map((finding) => <button type="button" key={finding.findingId} onClick={(event) => onInspect({ kind: "finding", id: finding.findingId }, finding.title, event.currentTarget)}><span>{finding.severity[0] + finding.severity.slice(1).toLowerCase()} · {finding.category}</span><strong>{finding.title}</strong><p>{finding.statement}</p></button>)}</div></Section>
    <Section number="03" title="Evidence and missing proof"><p>{detail.evidence.length} evidence records are available. {stale.length} is stale; missing proof remains explicit in the blocking requirements.</p><button className={styles.textAction} type="button" onClick={(event) => onInspect({ kind: "evidence", id: detail.evidence[0].evidenceId }, detail.evidence[0].title, event.currentTarget)}>Inspect first evidence relationship <span aria-hidden="true">→</span></button></Section>
    <Section number="04" title="Requirements remaining"><p><strong>{blocking.length} blocking requirements</strong> remain. Condition progress is read-only in this laboratory.</p>{blocking.map((item) => <p key={item.requirementId}>{item.title} — {item.evidenceRequired}</p>)}</Section>
    <Section number="05" title="Affected context"><p>{detail.context.summary}</p><ul>{detail.context.reviewerFocus.map((item) => <li key={item}>{item}</li>)}</ul></Section>
    <Section number="06" title="Readiness">{readiness.available ? <p>{readiness.readiness.note} Current score <strong>{readiness.readiness.currentScore}/100</strong>; prior score {readiness.readiness.previousScore}/100.</p> : <p>Unavailable — {"reason" in readiness ? readiness.reason : "Readiness could not be projected."}</p>}</Section>
    <Section number="07" title="Human Decision"><div className={styles.decisionTerminal}><div><FieldLabel>Current Human Decision</FieldLabel><strong>Pending</strong><p>Lintel recommends <b>{RECOMMENDATION_LABEL[detail.recommendation]}</b>. {blocking.length} current blockers require accountable human judgement.</p><span className={styles.privateDraft}>Private draft · not recorded · this device only</span></div><button type="button" onClick={(event) => onDecision(event.currentTarget)}>Record Human Decision</button></div></Section>
    <Section number="08" title="Provenance"><p className={styles.provenance}>Sample fixture · deterministic projection · head <code>{detail.github.headSha ?? "unknown"}</code> · relationships preserve linked, none, unavailable, and unresolved states.</p></Section>
  </article>;
}

function EvidenceMode({ detail, candidate, selected, onSelect, onInspect }: { detail: CaseDetail; candidate: Q1Candidate; selected: Selection | null; onSelect: (selection: Selection) => void; onInspect: (selection: Selection, label: string, origin: HTMLElement) => void }) {
  const boundedInline = candidate === "q1b";
  return <article className={styles.modeDocument}><div className={styles.modeIntro}><div><FieldLabel>Verification record</FieldLabel><h2>Evidence</h2><p>{boundedInline ? "Bounded inline detail keeps the statement in the list; the Inspector traverses relationships." : "A linear register keeps density high; deliberate inspection opens full detail and relationships."}</p></div><span>{detail.evidence.length} records</span></div><div className={styles.evidenceList}>{detail.evidence.map((item, index) => { const active = selected?.kind === "evidence" && selected.id === item.evidenceId; return <section className={styles.evidenceRow} data-selected={active || undefined} key={item.evidenceId}><button type="button" className={styles.evidenceSelect} onClick={() => onSelect({ kind: "evidence", id: item.evidenceId })}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><p><code>{item.evidenceId}</code> · {item.status.replace("-", " ")} · {item.observedAt}</p></div></button>{boundedInline && active ? <div className={styles.inlineDetail}><p>{item.statement}</p><code>{item.source}</code></div> : null}<button className={styles.inspectAction} type="button" onClick={(event) => onInspect({ kind: "evidence", id: item.evidenceId }, item.title, event.currentTarget)} aria-label={`Inspect relationships for ${item.title}`}>{boundedInline ? "Relationships" : "Inspect"} <span aria-hidden="true">→</span></button></section>; })}</div></article>;
}

function RequirementsMode({ detail, onInspect }: { detail: CaseDetail; onInspect: (selection: Selection, label: string, origin: HTMLElement) => void }) {
  const sections = [{ title: "Blocking", values: detail.requirements.filter((item) => item.importance === "blocking") }, { title: "Advisory", values: detail.requirements.filter((item) => item.importance === "advisory") }];
  return <article className={styles.modeDocument}><div className={styles.modeIntro}><div><FieldLabel>Merge contract</FieldLabel><h2>Requirements</h2><p>Read-only capability. Stale and satisfied remain distinct in text and shape.</p></div></div>{sections.map((section) => <section className={styles.requirementSection} key={section.title}><header><h3>{section.title}</h3><span>{section.values.length}</span></header>{section.values.map((item) => <RequirementRow key={item.requirementId} item={item} onInspect={onInspect} dense={section.title === "Advisory"} />)}</section>)}</article>;
}

function RequirementRow({ item, onInspect, dense }: { item: RequirementView; onInspect: (selection: Selection, label: string, origin: HTMLElement) => void; dense: boolean }) {
  return <div className={styles.requirementRow} data-dense={dense || undefined} data-status={item.status}><div><span className={styles.statusText}>{item.status === "stale" ? "△ Stale" : item.status === "satisfied" ? "✓ Satisfied" : `○ ${item.status[0].toUpperCase()}${item.status.slice(1)}`}</span><strong>{item.title}</strong><p>{item.statement}</p>{!dense ? <p><b>Required / missing proof:</b> {item.evidenceRequired}</p> : null}</div><button type="button" onClick={(event) => onInspect({ kind: "requirement", id: item.requirementId }, item.title, event.currentTarget)}>Inspect <span aria-hidden="true">→</span></button></div>;
}

function ChangeMode({ detail }: { detail: CaseDetail }) {
  const lines = RISKY_TESTS_REQUIRED_SAMPLE.diff.split("\n");
  return <article className={styles.changeSurface}><div className={styles.modeIntro}><div><FieldLabel>Canonical sample source</FieldLabel><h2>Change</h2><p>Paths, hunk headers, line numbers, and source lines come from the accepted risky sample input. File totals come from the #482 projection.</p></div><span>{detail.changedFiles.length} files</span></div><div className={styles.diff}><div className={styles.diffFiles}>{detail.changedFiles.map((file) => <div key={file.artifactId}><code>{file.path}</code><span className={styles.added}>+ Added {file.additions ?? "unknown"}</span><span className={styles.removed}>− Removed {file.deletions ?? "unknown"}</span><span>{file.risk ? `${file.risk[0]}${file.risk.slice(1).toLowerCase()} risk` : "Risk unknown"}</span></div>)}</div><pre aria-label="Canonical sample diff">{lines.map((line, index) => <span key={`${index}-${line}`} data-line-kind={line.startsWith("+") && !line.startsWith("+++") ? "added" : line.startsWith("-") && !line.startsWith("---") ? "removed" : line.startsWith("@@") ? "hunk" : "context"}><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b><code>{line || " "}</code></span>)}</pre></div></article>;
}

function HistoryMode({ detail }: { detail: CaseDetail }) {
  return <article className={styles.modeDocument}><div className={styles.modeIntro}><div><FieldLabel>Read-only lineage</FieldLabel><h2>History</h2><p>Run comparison remains contextual. This lab adds no history or persistence semantics.</p></div></div><div className={styles.historyLine}><span>Current head</span><code>{detail.github.headSha ?? "Unavailable"}</code><strong>{RECOMMENDATION_LABEL[detail.recommendation]}</strong></div>{detail.readiness.available ? <div className={styles.historyLine}><span>Readiness movement</span><b>{detail.readiness.readiness.scoreChange}</b><p>{detail.readiness.readiness.note}</p></div> : null}</article>;
}

function Inspector({ detail, selection, historyLength, onBack, onOpen, onClose, closeRef, narrow }: { detail: CaseDetail; selection: Selection; historyLength: number; onBack: () => void; onOpen: (selection: Selection, label: string) => void; onClose: () => void; closeRef: React.RefObject<HTMLButtonElement | null>; narrow: boolean }) {
  const object = selection.kind === "evidence" ? detail.evidence.find((item) => item.evidenceId === selection.id) : selection.kind === "finding" ? detail.findings.find((item) => item.findingId === selection.id) : selection.kind === "requirement" ? detail.requirements.find((item) => item.requirementId === selection.id) : detail.changedFiles.find((item) => item.artifactId === selection.id);
  if (!object) return null;
  const title = "title" in object ? object.title : object.path;
  return <aside className={styles.inspector} aria-label="Contextual Inspector" data-narrow={narrow || undefined}><header><div><FieldLabel>{selection.kind} context</FieldLabel><h2>{title}</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Close Inspector">{icon.close}</button></header>{historyLength > 0 ? <button type="button" className={styles.inspectorBack} onClick={onBack}>{icon.back} Back to previous context</button> : null}<div className={styles.inspectorBody}>{selection.kind === "evidence" ? <EvidenceInspector item={object as EvidenceView} onOpen={onOpen} /> : selection.kind === "requirement" ? <RequirementInspector item={object as RequirementView} onOpen={onOpen} /> : selection.kind === "finding" ? <><p>{(object as CaseDetail["findings"][number]).statement}</p><code>{(object as CaseDetail["findings"][number]).file}</code><Relationship label="Supporting evidence" state={(object as CaseDetail["findings"][number]).supportingEvidence} onOpen={onOpen} /><Relationship label="Requirements" state={(object as CaseDetail["findings"][number]).relatedRequirements} onOpen={onOpen} /></> : <><code>{(object as CaseDetail["changedFiles"][number]).path}</code><Relationship label="Observations" state={(object as CaseDetail["changedFiles"][number]).observations} onOpen={onOpen} /><Relationship label="Evidence" state={(object as CaseDetail["changedFiles"][number]).evidence} onOpen={onOpen} /></>}</div>{narrow ? <footer><button type="button" onClick={onClose}>Back to {selection.kind === "evidence" ? "Evidence" : "Workspace"}</button></footer> : null}</aside>;
}

function EvidenceInspector({ item, onOpen }: { item: EvidenceView; onOpen: (selection: Selection, label: string) => void }) {
  return <><p>{item.statement}</p><dl className={styles.inspectorFacts}><div><dt>Status</dt><dd>{item.status}</dd></div><div><dt>Observed</dt><dd>{item.observedAt}</dd></div><div><dt>Source</dt><dd><code>{item.source}</code></dd></div></dl><Relationship label="Findings" state={item.supportsFindings} onOpen={onOpen} /><Relationship label="Requirements" state={item.supportsRequirements} onOpen={onOpen} /><Relationship label="Changed files" state={item.relatedChanges} onOpen={onOpen} /></>;
}

function RequirementInspector({ item, onOpen }: { item: RequirementView; onOpen: (selection: Selection, label: string) => void }) {
  return <><p>{item.statement}</p><p><strong>Required / missing proof</strong><br />{item.evidenceRequired}</p><p className={styles.readOnly}>Condition progress · read-only sample</p><Relationship label="Evidence" state={item.supportingEvidence} onOpen={onOpen} /><Relationship label="Findings" state={item.relatedFindings} onOpen={onOpen} /></>;
}

function Commands({ inputRef, onClose, onMode, onFocus, onDecision }: { inputRef: React.RefObject<HTMLInputElement | null>; onClose: () => void; onMode: (mode: Mode) => void; onFocus: () => void; onDecision: () => void }) {
  const [query, setQuery] = useState("");
  const actions = [{ label: "Go to Evidence", hint: "Selected Review mode", run: () => onMode("evidence") }, { label: "Enter Change Focus", hint: "Workspace layout", run: onFocus }, { label: "Record Human Decision", hint: "Private lab dialog", run: onDecision }].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  return <div className={styles.commandScrim} role="presentation"><section className={styles.commands} role="dialog" aria-modal="true" aria-labelledby="r6b-commands-title"><header><h2 id="r6b-commands-title">Commands</h2><button type="button" onClick={onClose} aria-label="Close Commands">{icon.close}</button></header><label><span aria-hidden="true">{icon.search}</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Navigate or invoke an action" aria-label="Search Commands" /></label><div>{actions.map((item) => <button key={item.label} type="button" onClick={() => { item.run(); onClose(); }}><strong>{item.label}</strong><span>{item.hint}</span></button>)}</div><footer>Queue search and filters remain locally owned.</footer></section></div>;
}

function DecisionDialog({ stale, draftOutcome, rationale, notice, inputRef, onOutcome, onRationale, onSimulateChange, onReconcile, onDiscard, onSubmit, onClose }: { stale: boolean; draftOutcome: DecisionOutcome | null; rationale: string; notice: string; inputRef: React.RefObject<HTMLTextAreaElement | null>; onOutcome: (value: DecisionOutcome) => void; onRationale: (value: string) => void; onSimulateChange: () => void; onReconcile: () => void; onDiscard: () => void; onSubmit: () => void; onClose: () => void }) {
  return <div className={styles.modalScrim}><section className={styles.decisionDialog} role="dialog" aria-modal="true" aria-labelledby="r6b-decision-title"><header><div><FieldLabel>Human Decision · lab simulation</FieldLabel><h2 id="r6b-decision-title">Record accountable judgement</h2></div><button type="button" onClick={onClose} aria-label="Close Human Decision">{icon.close}</button></header><div className={styles.decisionContext}><span>Current Human Decision <strong>Pending</strong></span><span>Lintel recommendation <strong>Tests required</strong></span><span>Current blockers <strong>2</strong></span></div><p className={styles.privateDraft}>Private draft · not recorded · this device only</p>{stale ? <div className={styles.staleNotice} role="alert"><strong>Verification changed while this draft exists</strong><p>Basis changed from head <code>9c41af2</code> / run <code>run-482-07</code> to head <code>d7f20bc</code> / run <code>run-482-08</code>. Provider failure coverage changed; your entered text is preserved. Submission is blocked until reconciliation.</p><div><button type="button" onClick={onReconcile}>Review change and reconcile</button><button type="button" onClick={onDiscard}>Discard private draft</button></div></div> : null}<fieldset><legend>Choose one outcome <span>· no preselection</span></legend><div className={styles.outcomeList}>{DECISION_OUTCOMES.map((outcome) => <label key={outcome} data-selected={draftOutcome === outcome || undefined}><input type="radio" name="r6b-outcome" checked={draftOutcome === outcome} onChange={() => onOutcome(outcome)} /><span><strong>{OUTCOME_LABEL[outcome]}</strong><small>{OUTCOME_MEANING[outcome]}</small></span></label>)}</div></fieldset><label className={styles.rationale}><span>Engineer rationale</span><textarea ref={inputRef} value={rationale} onChange={(event) => onRationale(event.target.value)} placeholder="Record the reasoning behind this accountable decision." /></label>{notice ? <p className={styles.dialogNotice} role="status">{notice}</p> : null}<footer><button type="button" onClick={onSimulateChange} disabled={stale}>Simulate basis change</button><span /><button type="button" onClick={onClose}>Close · keep draft</button><button type="button" className={styles.primaryAction} disabled={stale || !draftOutcome || !rationale.trim()} onClick={onSubmit}>{stale ? "Submit blocked · basis changed" : "Record decision (lab only)"}</button></footer></section></div>;
}

function LabControls({ preset, candidates, viewport, onPreset, onQ1, onQ2, onQ3, onViewport }: { preset: LabPreset; candidates: CandidateConfiguration; viewport: LabViewport; onPreset: (value: string) => void; onQ1: (value: Q1Candidate) => void; onQ2: (value: Q2Candidate) => void; onQ3: (value: Q3Candidate) => void; onViewport: (value: LabViewport) => void }) {
  return <details className={styles.labControls}><summary>R6B controls <span>{preset.id} · {candidates.q1.toUpperCase()} + {candidates.q2.toUpperCase()} + {candidates.q3.toUpperCase()}</span></summary><div><label>State<select value={preset.id} onChange={(event) => onPreset(event.target.value)}>{PRESETS.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.label}</option>)}</select></label><label>Q1 · Evidence composition<select value={candidates.q1} onChange={(event) => onQ1(event.target.value as Q1Candidate)}>{Q1_CANDIDATES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label>Q2 · Queue selection<select value={candidates.q2} onChange={(event) => onQ2(event.target.value as Q2Candidate)}>{Q2_CANDIDATES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label>Q3 · Verdict treatment<select value={candidates.q3} onChange={(event) => onQ3(event.target.value as Q3Candidate)}>{Q3_CANDIDATES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label>Layout behaviour<select value={viewport} onChange={(event) => onViewport(event.target.value as LabViewport)}>{VIEWPORTS.map((item) => <option value={item} key={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label><p>Private prototype controls · geometry-neutral overlay · query state only</p></div></details>;
}

export default function R6BLabClient({ snapshot, initialState, initialCandidate, initialQ1, initialQ2, initialQ3, initialViewport, capture }: { snapshot: WorkspaceReadySnapshot; initialState?: string; initialCandidate?: string; initialQ1?: string; initialQ2?: string; initialQ3?: string; initialViewport?: string; capture: boolean }) {
  const initialPreset = presetFor(initialState);
  const [preset, setPreset] = useState(initialPreset);
  const [candidates, setCandidates] = useState<CandidateConfiguration>(() => candidateConfigurationFor(initialCandidate, initialQ1, initialQ2, initialQ3));
  const [forcedViewport, setForcedViewport] = useState<LabViewport>(viewportFor(initialViewport) === "auto" && initialPreset.viewport ? initialPreset.viewport : viewportFor(initialViewport));
  const [selected, setSelected] = useState(initialPreset.selected);
  const [mode, setMode] = useState<Mode>(initialPreset.mode);
  const [manualQueue, setManualQueue] = useState<QueuePreference>(initialPreset.queue ?? "expanded");
  const [focus, setFocus] = useState(Boolean(initialPreset.focus));
  const [inspectorOpen, setInspectorOpen] = useState(Boolean(initialPreset.inspector));
  const [selection, setSelection] = useState<Selection>({ kind: "evidence", id: snapshot.cases.find((item) => item.caseId === "case-482")!.evidence[0].evidenceId });
  const [selectionHistory, setSelectionHistory] = useState<Selection[]>([]);
  const [commandsOpen, setCommandsOpen] = useState(Boolean(initialPreset.commands));
  const [decisionOpen, setDecisionOpen] = useState(Boolean(initialPreset.decision));
  const [draftStale, setDraftStale] = useState(Boolean(initialPreset.stale));
  const [draftOutcome, setDraftOutcome] = useState<DecisionOutcome | null>(initialPreset.stale ? "tests-required" : null);
  const [rationale, setRationale] = useState(initialPreset.stale ? "I need the provider failure tests before this change can merge." : "");
  const [notice, setNotice] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [narrowSurface, setNarrowSurface] = useState<"queue" | "workspace">(initialPreset.selected ? "workspace" : "queue");
  const [announcement, setAnnouncement] = useState(initialPreset.id === "L11" ? "Restored Evidence for PR 482. Invalid saved context evidence with id ev_removed was discarded; no same-title object was substituted. Review and compact Queue preference restored." : "");
  const { band, width } = useViewportBand(forcedViewport);
  const detail = snapshot.cases.find((item) => item.caseId === "case-482") ?? snapshot.cases[0];
  const title = titleFor(snapshot, detail.caseId);
  const commandInput = useRef<HTMLInputElement>(null);
  const decisionInput = useRef<HTMLTextAreaElement>(null);
  const inspectorClose = useRef<HTMLButtonElement>(null);
  const commandOrigin = useRef<HTMLElement | null>(null);
  const decisionOrigin = useRef<HTMLElement | null>(null);
  const inspectorOrigin = useRef<HTMLElement | null>(null);
  const workspaceFallback = useRef<HTMLElement>(null);
  const selectedReviewButton = useRef<HTMLButtonElement>(null);
  const isNarrow = band === "narrow";
  const pressureYield = inspectorOpen && !isNarrow && (band === "compact" || band === "constrained" || (band === "standard" && width < 1440));
  const queueHidden = focus;
  const queueCompact = !queueHidden && !isNarrow && manualQueue === "compact";
  const queueLayout = pressureYield ? "yielded" : queueHidden ? "hidden" : queueCompact ? "compact" : "expanded";

  const closeCommands = useCallback(() => { setCommandsOpen(false); requestAnimationFrame(() => commandOrigin.current?.focus()); }, []);
  const closeDecision = useCallback(() => { setDecisionOpen(false); requestAnimationFrame(() => decisionOrigin.current?.focus()); }, []);
  const closeInspector = useCallback(() => { setInspectorOpen(false); setSelectionHistory([]); requestAnimationFrame(() => (inspectorOrigin.current?.isConnected ? inspectorOrigin.current : workspaceFallback.current)?.focus()); }, []);

  useEffect(() => {
    if (commandsOpen) requestAnimationFrame(() => commandInput.current?.focus());
  }, [commandsOpen]);
  useEffect(() => {
    if (decisionOpen) requestAnimationFrame(() => decisionInput.current?.focus({ preventScroll: true }));
  }, [decisionOpen]);
  useEffect(() => {
    if (isNarrow && narrowSurface === "queue") requestAnimationFrame(() => selectedReviewButton.current?.focus({ preventScroll: true }));
  }, [isNarrow, narrowSurface]);
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); commandOrigin.current = document.activeElement as HTMLElement; setCommandsOpen(true); return; }
      if (event.key !== "Escape") return;
      if (commandsOpen) { event.preventDefault(); closeCommands(); }
      else if (decisionOpen) { event.preventDefault(); closeDecision(); }
      else if (inspectorOpen) { event.preventDefault(); closeInspector(); }
      // Persistent Focus is intentionally not part of the Escape unwind.
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandsOpen, decisionOpen, inspectorOpen, closeCommands, closeDecision, closeInspector]);

  function applyPreset(id: string) {
    const next = presetFor(id);
    setPreset(next); setSelected(next.selected); setMode(next.mode); setManualQueue(next.queue ?? "expanded"); setFocus(Boolean(next.focus)); setInspectorOpen(Boolean(next.inspector)); setCommandsOpen(Boolean(next.commands)); setDecisionOpen(Boolean(next.decision)); setDraftStale(Boolean(next.stale)); setDraftOutcome(next.stale ? "tests-required" : null); setRationale(next.stale ? "I need the provider failure tests before this change can merge." : ""); setSelectionHistory([]); setForcedViewport(next.viewport ?? "auto"); setNarrowSurface(next.selected ? "workspace" : "queue"); setNotice("");
    setAnnouncement(next.id === "L11" ? "Restored Evidence for PR 482. Invalid saved context evidence with id ev_removed was discarded; no same-title object was substituted. Review and compact Queue preference restored." : `${next.id}: ${next.label}`);
    updateQuery({ state: next.id, viewport: next.viewport ?? null });
  }
  function openCommands(origin?: HTMLElement) { commandOrigin.current = origin ?? document.activeElement as HTMLElement; setCommandsOpen(true); }
  function openDecision(origin?: HTMLElement) { decisionOrigin.current = origin ?? document.activeElement as HTMLElement; setDecisionOpen(true); }
  function openInspector(next: Selection, label: string, origin?: HTMLElement) { if (inspectorOpen && (selection.kind !== next.kind || selection.id !== next.id)) setSelectionHistory((items) => [...items, selection]); if (origin) inspectorOrigin.current = origin; setSelection(next); setInspectorOpen(true); setAnnouncement(`Inspector: ${label}`); requestAnimationFrame(() => inspectorClose.current?.focus()); }
  function backInspector() { const prior = selectionHistory.at(-1); if (!prior) return; setSelection(prior); setSelectionHistory((items) => items.slice(0, -1)); }
  function switchMode(next: Mode) { setMode(next); if (next === "change" && focus) return; setAnnouncement(`${MODES.find((item) => item.id === next)?.label} mode`); }
  function chooseCandidates(next: Partial<Pick<CandidateConfiguration, "q1" | "q2" | "q3">>) {
    const updated = { ...candidates, ...next, density: next.q2 ? true : candidates.density };
    setCandidates(updated);
    updateQuery({ candidate: null, q1: updated.q1, q2: updated.q2, q3: updated.q3 });
  }

  const content = useMemo(() => {
    if (!selected) return <div className={styles.idleState}><FieldLabel>Reviews</FieldLabel><h1>Select a Review to begin</h1><p>The Queue supports the work; the Workspace remains quiet until a Review is selected.</p></div>;
    if (mode === "overview") return <Overview detail={detail} onInspect={openInspector} onDecision={openDecision} />;
    if (mode === "evidence") return <EvidenceMode detail={detail} candidate={candidates.q1} selected={selection} onSelect={setSelection} onInspect={openInspector} />;
    if (mode === "requirements") return <RequirementsMode detail={detail} onInspect={openInspector} />;
    if (mode === "change") return <ChangeMode detail={detail} />;
    return <HistoryMode detail={detail} />;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, mode, detail, candidates.q1, selection]);

  function selectReview() {
    setSelected(true);
    setMode("overview");
    if (isNarrow) {
      setNarrowSurface("workspace");
      setAnnouncement("PR 482 selected. Overview Workspace.");
      requestAnimationFrame(() => workspaceFallback.current?.focus());
    }
  }

  function returnToNarrowQueue() {
    setNarrowSurface("queue");
    setAnnouncement("Review Queue. PR 482 remains selected.");
  }

  return <main className={styles.lab} data-band={band} data-focus={focus || undefined} data-inspector={inspectorOpen || undefined} data-queue={queueLayout} data-candidate={`${candidates.q1}+${candidates.q2}+${candidates.q3}`} data-narrow-surface={isNarrow ? narrowSurface : undefined}>
    {!capture ? <LabControls preset={preset} candidates={candidates} viewport={forcedViewport} onPreset={applyPreset} onQ1={(value) => chooseCandidates({ q1: value })} onQ2={(value) => chooseCandidates({ q2: value })} onQ3={(value) => chooseCandidates({ q3: value })} onViewport={(value) => { setForcedViewport(value); updateQuery({ viewport: value === "auto" ? null : value }); }} /> : null}
    <p className={styles.srOnly} aria-live="polite">{announcement}</p>
    <div className={styles.supportingLeft}>
      <GlobalNavigation narrow={isNarrow} />
      {!queueHidden ? <ReviewQueue snapshot={snapshot} selected={selected} compact={queueCompact} density={candidates.density} variant={candidates.q2} activeFilter={activeFilter} filterOpen={filterOpen} hidden={isNarrow && narrowSurface !== "queue"} selectedButtonRef={selectedReviewButton} onFilterOpen={() => setFilterOpen((value) => !value)} onActiveFilter={setActiveFilter} onSelect={selectReview} /> : null}
    </div>
    <section id="workspace" className={styles.workspace} ref={workspaceFallback} tabIndex={-1} aria-label="Review Workspace" hidden={isNarrow && narrowSurface !== "workspace"}>
      {selected ? <IdentityChrome detail={detail} title={title} mode={mode} q3={candidates.q3} onMode={switchMode} onCommands={openCommands} onQueue={() => setManualQueue((value) => value === "expanded" ? "compact" : "expanded")} onInspector={(origin) => openInspector(selection, "Current context", origin)} onFocus={() => { setFocus((value) => !value); if (!focus) setInspectorOpen(false); }} focus={focus} /> : null}
      {isNarrow && selected ? <button className={styles.narrowBack} type="button" onClick={returnToNarrowQueue}>← Back to Review Queue</button> : null}
      <div className={styles.workspaceScroll}>{content}</div>
      {focus ? <div className={styles.focusExit}><span>Focus · Queue hidden</span><button type="button" onClick={() => setFocus(false)}>Exit Focus</button></div> : null}
    </section>
    {selected && inspectorOpen ? <Inspector detail={detail} selection={selection} historyLength={selectionHistory.length} onBack={backInspector} onOpen={(next, label) => openInspector(next, label)} onClose={closeInspector} closeRef={inspectorClose} narrow={isNarrow} /> : null}
    {commandsOpen ? <Commands inputRef={commandInput} onClose={closeCommands} onMode={switchMode} onFocus={() => { setFocus(true); setInspectorOpen(false); setMode("change"); setNarrowSurface("workspace"); }} onDecision={() => openDecision()} /> : null}
    {decisionOpen ? <DecisionDialog stale={draftStale} draftOutcome={draftOutcome} rationale={rationale} notice={notice} inputRef={decisionInput} onOutcome={setDraftOutcome} onRationale={setRationale} onSimulateChange={() => setDraftStale(true)} onReconcile={() => { setDraftStale(false); setNotice("Draft basis reconciled to head d7f20bc. Entered text was preserved; review it before recording."); }} onDiscard={() => { setDraftOutcome(null); setRationale(""); setDraftStale(false); setNotice("Private draft discarded. No canonical record changed."); }} onSubmit={() => setNotice("Laboratory simulation only — no Human Decision was recorded.")} onClose={closeDecision} /> : null}
    {!capture ? <div className={styles.labTelemetry} aria-hidden="true"><span>{band} · {width}px viewport</span>{pressureYield ? <span>Supporting-left temporarily yielded · manual Queue preference remains {manualQueue}</span> : null}</div> : null}
  </main>;
}
