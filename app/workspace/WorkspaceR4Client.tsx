"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ArtifactKind,
  CaseDetail,
  DecisionReference,
  EvidenceView,
  FindingView,
  QueueCaseSummary,
  QueueGroup,
  RelationshipState,
  RequirementView,
  RiskLevel,
  RunView,
  WorkspaceReadySnapshot,
  WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";
import {
  APPLICABILITY_LABEL,
  OUTCOME_LABEL,
  RECOMMENDATION_LABEL,
} from "../../lib/workspace-v2/view-model";
import type {
  WorkspacePersistence,
  MutationResult,
} from "../../lib/workspace-v2/persistence";
import type {
  DecisionMutationResult,
  DecisionReferenceInput,
  WorkspaceDecisionService,
} from "../../lib/workspace-v2/decision-mutations";
import type { R4ReloadOutcome } from "./RealWorkspaceR4Bootstrap";
import HumanDecisionDialog, { type DecisionSubmit } from "./HumanDecisionDialog";
import { Icon, type IconName } from "./icons";
import styles from "./workspace-r4.module.css";

type Mode = "overview" | "change" | "evidence" | "requirements" | "history";
type Selection = { kind: ArtifactKind | "run"; id: string } | null;
type MobileView = "list" | "review" | "record";
type GitHubState = "checking" | "connected" | "available" | "unavailable";

const DRAWER_FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const MODES: Array<{ id: Mode; label: string; shortcut?: string }> = [
  { id: "overview", label: "Overview" },
  { id: "change", label: "Change" },
  { id: "evidence", label: "Evidence", shortcut: "E" },
  { id: "requirements", label: "Requirements", shortcut: "R" },
  { id: "history", label: "History", shortcut: "H" },
];

const RAIL: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Reviews", href: "/workspace", icon: "reviews" },
  { label: "Operations", href: "/review-operations", icon: "operations" },
  { label: "Governance", href: "/review-policies", icon: "governance" },
  { label: "Integrations", href: "/github-action", icon: "integrations" },
  { label: "System", href: "/settings", icon: "system" },
];

function riskClass(level: RiskLevel) {
  if (level === "CRITICAL" || level === "HIGH") return styles.toneBlocking;
  if (level === "MEDIUM") return styles.toneProof;
  return styles.toneCleared;
}

function severityClass(severity: FindingView["severity"]) {
  if (severity === "CRITICAL" || severity === "HIGH") return styles.toneBlocking;
  if (severity === "MEDIUM") return styles.toneProof;
  return styles.toneMuted;
}

function recommendationClass(recommendation: CaseDetail["recommendation"]) {
  if (recommendation === "APPROVE") return styles.toneCleared;
  if (recommendation === "TESTS_REQUIRED") return styles.toneProof;
  if (recommendation === "REVIEW_REQUIRED") return styles.toneReview;
  return styles.toneBlocking;
}

function short(value: string | null | undefined, size = 12) {
  if (!value) return "Not recorded";
  return value.length > size ? `${value.slice(0, size)}…` : value;
}

function openRequirements(detail: CaseDetail) {
  return detail.requirements.filter((item) => !["satisfied", "accepted", "invalidated", "superseded"].includes(item.status));
}

function blockingRequirements(detail: CaseDetail) {
  return openRequirements(detail).filter((item) => item.importance === "blocking");
}

function incompleteEvidence(detail: CaseDetail) {
  return detail.evidence.filter((item) => item.status === "missing" || item.status === "unverified");
}

function formatTime(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value || "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function relationshipItems(state: RelationshipState) {
  return state.status === "linked" ? state.related : [];
}

function relationshipSummary(state: RelationshipState) {
  if (state.status === "linked") {
    const unresolved = state.unresolved.length ? ` · ${state.unresolved.length} unresolved` : "";
    return `${state.related.length} direct${unresolved}`;
  }
  if (state.status === "none") return "None recorded";
  if (state.status === "unresolved") return `${state.unresolved.length} unresolved stored reference${state.unresolved.length === 1 ? "" : "s"}`;
  return `Unavailable — ${state.reason}`;
}

function titleMap(snapshot: WorkspaceReadySnapshot) {
  return new Map(snapshot.groups.flatMap((group) => group.cases.map((item) => [item.caseId, item.title])));
}

function Rail() {
  return (
    <nav className={styles.rail} aria-label="Product areas">
      <Link href="/" className={styles.brand} aria-label="Lintel home"><span>L</span></Link>
      <div className={styles.railLinks}>
        {RAIL.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={index === 0 ? styles.railActive : styles.railLink}
            aria-current={index === 0 ? "page" : undefined}
            aria-label={item.label}
            title={item.label === "Integrations" ? "Integrations · supporting routes; primary area arrives in R4F" : item.label}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      <Link href="/team" className={styles.localLink} aria-label="Local workspace metadata" title="Local browser workspace"><span>LC</span></Link>
    </nav>
  );
}

function StatusShell({ snapshot }: { snapshot: Exclude<WorkspaceSnapshot, WorkspaceReadySnapshot> }) {
  const loading = snapshot.status === "loading";
  return (
    <div className={styles.page} data-status={snapshot.status}>
      <a className={styles.skipLink} href="#workspace-primary">Skip to Workspace</a>
      <div className={styles.shell}>
        <Rail />
        <aside className={styles.queue} aria-label="Review queue">
          <div className={styles.queueHeader}>
            <div><span className={styles.eyebrow}>Reviews</span><h2>Review queue</h2></div>
          </div>
          <div className={styles.queueState} aria-live="polite">
            {loading ? <><span className={styles.skeletonLine} /><span className={styles.skeletonLineShort} /><p>Loading stored reviews…</p></> : null}
            {snapshot.status === "empty" ? <><h3>No reviews are stored in this browser.</h3><p>Run a review to create a real browser-local record. Fixture content is never selected automatically.</p><Link href="/new" className={styles.secondaryButton}>Check a pull request</Link></> : null}
            {snapshot.status === "unavailable" ? <><h3>Stored review unavailable</h3><p>{snapshot.reason}</p><Link href="/workspace" className={styles.secondaryButton}>Return to review list</Link></> : null}
          </div>
        </aside>
        <main id="workspace-primary" className={styles.workspaceState} tabIndex={-1}>
          <span className={styles.sourceBadge}>{snapshot.provenance.label}</span>
          {loading ? (
            <><span className={styles.eyebrow}>Selected review</span><h1>Loading selected review…</h1><p>Known source identity is retained. Recommendation, risk, blockers, readiness and Human Decision authority are withheld until the current projection verifies.</p><div className={styles.stateSkeleton}><span /><span /><span /></div></>
          ) : snapshot.status === "empty" ? (
            <><span className={styles.eyebrow}>Workspace</span><h1>Select or create a review</h1><p>The queue is truthfully empty for this browser. Nothing from the accepted laboratory has been substituted.</p></>
          ) : (
            <><span className={styles.eyebrow}>Requested review</span><h1>This stored review is no longer available.</h1><p>{snapshot.reason}</p><p>No substitute review is selected and no live Inspector or Human Decision action is shown.</p></>
          )}
        </main>
      </div>
    </div>
  );
}

function QueueRow({
  item,
  detail,
  selected,
  onSelect,
}: {
  item: QueueCaseSummary;
  detail: CaseDetail | undefined;
  selected: boolean;
  onSelect: () => void;
}) {
  const open = detail ? openRequirements(detail).length : null;
  const blockers = detail ? blockingRequirements(detail).length : null;
  return (
    <button
      type="button"
      className={selected ? styles.queueRowSelected : styles.queueRow}
      aria-pressed={selected}
      onClick={onSelect}
      data-review-id={item.caseId}
    >
      <span className={styles.queueIdentity} title={`${item.repository} · PR #${item.pullRequestNumber}`}>
        <span>{item.repository}</span><strong>PR #{item.pullRequestNumber}</strong>
      </span>
      <span className={styles.queueTitle} title={item.title}>{item.title}</span>
      <span className={styles.queueMeta}>
        <span className={recommendationClass(item.recommendation)}>{RECOMMENDATION_LABEL[item.recommendation]}</span>
        <span className={riskClass(item.riskLevel)}>{item.riskLevel}{detail ? ` ${detail.riskScore}` : ""}</span>
        <span className={blockers ? styles.toneBlocking : styles.toneMuted}>{blockers ?? "?"}B</span>
      </span>
      <span className={styles.queueSubmeta}>
        <span>{detail?.readiness.available ? detail.readiness.readiness.classification : "comparison unavailable"}</span>
        <span>{open === null ? "requirements unavailable" : `${open} open`}</span>
      </span>
    </button>
  );
}

function ReviewQueue({
  snapshot,
  selectedId,
  collapsedGroups,
  onToggleGroup,
  onSelect,
  onClose,
}: {
  snapshot: WorkspaceReadySnapshot;
  selectedId: string;
  collapsedGroups: Set<string>;
  onToggleGroup: (id: string) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<"all" | RiskLevel>("all");
  const cases = useMemo(() => new Map(snapshot.cases.map((item) => [item.caseId, item])), [snapshot.cases]);
  const selectedSummary = snapshot.groups.flatMap((group) => group.cases).find((item) => item.caseId === selectedId);
  const term = query.trim().toLowerCase();
  const filteredGroups = snapshot.groups.map((group) => ({
    ...group,
    cases: group.cases.filter((item) => {
      const text = `${item.repository} ${item.pullRequestNumber} ${item.title} ${item.caseId}`.toLowerCase();
      return (!term || text.includes(term)) && (risk === "all" || item.riskLevel === risk);
    }),
  }));
  const selectedOutside = selectedSummary && !filteredGroups.some((group) => group.cases.some((item) => item.caseId === selectedId));

  return (
    <aside className={styles.queue} aria-label="Review queue" id="review-queue">
      <div className={styles.queueHeader}>
        <div><span className={styles.eyebrow}>Reviews</span><h2>Review queue</h2></div>
        <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Close review queue"><Icon name="close" /></button>
      </div>
      <div className={styles.queueToolbar}>
        <label className={styles.searchControl}>
          <span className={styles.srOnly}>Search reviews</span><Icon name="search" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reviews" />
        </label>
        <label className={styles.filterControl}>
          <span className={styles.srOnly}>Filter by risk</span><Icon name="filter" size={14} />
          <select value={risk} onChange={(event) => setRisk(event.target.value as "all" | RiskLevel)}>
            <option value="all">All risk</option>
            <option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
          </select>
        </label>
      </div>
      {snapshot.limitations?.length ? <div className={styles.limitationBanner} role="status"><strong>Partial local history</strong>{snapshot.limitations.map((item) => <p key={item}>{item}</p>)}</div> : null}
      {selectedOutside && selectedSummary ? (
        <div className={styles.selectedOutside} role="status">
          <strong>Selected outside filters</strong><span>{selectedSummary.repository} · PR #{selectedSummary.pullRequestNumber}</span>
          <button type="button" onClick={() => { setQuery(""); setRisk("all"); }}>Clear filters</button>
        </div>
      ) : null}
      <div className={styles.queueList}>
        {filteredGroups.map((group) => {
          const collapsed = collapsedGroups.has(group.id);
          const selectedInGroup = group.cases.some((item) => item.caseId === selectedId);
          return (
            <section key={group.id} className={styles.queueGroup} aria-labelledby={`queue-group-${group.id}`}>
              <button type="button" id={`queue-group-${group.id}`} className={styles.queueGroupButton} aria-expanded={!collapsed} onClick={() => onToggleGroup(group.id)}>
                <Icon name="chevron" size={14} /><span>{group.label}</span><span>{group.cases.length}</span>
              </button>
              {collapsed && selectedInGroup && selectedSummary ? <div className={styles.pinnedSelected}><span>Selected review retained</span><QueueRow item={selectedSummary} detail={cases.get(selectedSummary.caseId)} selected onSelect={() => onSelect(selectedSummary.caseId)} /></div> : null}
              {!collapsed ? <div className={styles.queueRows}>{group.cases.map((item) => <QueueRow key={item.caseId} item={item} detail={cases.get(item.caseId)} selected={item.caseId === selectedId} onSelect={() => onSelect(item.caseId)} />)}</div> : null}
              {!collapsed && group.cases.length === 0 ? <p className={styles.emptyGroup}>No matching reviews in this group.</p> : null}
            </section>
          );
        })}
      </div>
      <div className={styles.queueFooter}><span>{snapshot.cases.length} local review{snapshot.cases.length === 1 ? "" : "s"}</span><span>Browser-local · maximum 10</span></div>
    </aside>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return <div className={styles.meta}><span>{label}</span><strong>{children}</strong></div>;
}

function RelationshipList({ state, onSelect }: { state: RelationshipState; onSelect: (selection: Selection) => void }) {
  const related = relationshipItems(state);
  return (
    <div className={styles.relationshipList}>
      <p>{relationshipSummary(state)}</p>
      {related.map((item) => (
        <button key={`${item.kind}-${item.id}`} type="button" onClick={() => onSelect({ kind: item.kind, id: item.id })}>
          <span>{item.kind}</span><strong>{item.label}</strong><small>{item.detail ?? item.id}</small>
        </button>
      ))}
    </div>
  );
}

function RecordButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className={selected ? styles.recordSelected : styles.record} aria-pressed={selected} onClick={onClick}>{children}</button>;
}

function Overview({ detail, onSelect, onMode }: { detail: CaseDetail; onSelect: (value: Selection) => void; onMode: (mode: Mode) => void }) {
  const topFinding = [...detail.findings].sort((a, b) => ["CRITICAL", "HIGH", "MEDIUM", "LOW"].indexOf(a.severity) - ["CRITICAL", "HIGH", "MEDIUM", "LOW"].indexOf(b.severity))[0];
  const gaps = incompleteEvidence(detail);
  const open = openRequirements(detail);
  const blockers = blockingRequirements(detail);
  return (
    <div className={styles.modeContent}>
      <section className={styles.overviewVerdict}>
        <div><span className={styles.eyebrow}>Lintel recommendation</span><h2 className={recommendationClass(detail.recommendation)}>{RECOMMENDATION_LABEL[detail.recommendation]}</h2><p>{detail.executiveSummary}</p></div>
        <div className={styles.overviewMetrics}><Meta label="Risk">{detail.riskScore}/100 {detail.riskLevel}</Meta><Meta label="Confidence">{detail.confidence}</Meta></div>
      </section>
      <section className={styles.primaryFinding}>
        <span className={styles.index}>01</span>
        {topFinding ? <div><span className={`${styles.stateLabel} ${severityClass(topFinding.severity)}`}>{topFinding.severity} · primary finding</span><h2>{topFinding.title}</h2><p>{topFinding.statement}</p><button type="button" className={styles.textButton} onClick={() => { onMode("evidence"); onSelect({ kind: "finding", id: topFinding.findingId }); }}>Inspect finding →</button></div> : <div><h2>No findings recorded</h2><p>No finding was recorded for this run. This does not assert that the change is safe.</p></div>}
      </section>
      <div className={styles.overviewColumns}>
        <section><span className={styles.eyebrow}>Proof</span><h2>Evidence boundary</h2><p>{detail.evidence.length} canonical evidence records. {gaps.length} missing or unverified; {detail.evidence.filter((item) => item.stale).length} stale.</p><p className={styles.truthNote}>Missing-proof presentation is derived from canonical evidence status; no dedicated stored missing-proof object is claimed.</p><button type="button" className={styles.textButton} onClick={() => onMode("evidence")}>Inspect evidence</button></section>
        <section><span className={styles.eyebrow}>Conditions</span><h2>Requirements</h2><p>{open.length} open · {blockers.length} blocking. Exact canonical conditions may support progress; derived requirements remain read-only.</p><button type="button" className={styles.textButton} onClick={() => onMode("requirements")}>Inspect requirements</button></section>
      </div>
      <section className={styles.movementSection}><span className={styles.eyebrow}>Movement</span><h2>{detail.readiness.available ? `${detail.readiness.readiness.classification} since previous run` : "No usable run comparison"}</h2><p>{detail.readiness.available ? detail.readiness.readiness.note : detail.readiness.reason}</p><button type="button" className={styles.textButton} onClick={() => onMode("history")}>Open History</button></section>
    </div>
  );
}

function ChangeMode({ detail, selection, onSelect }: { detail: CaseDetail; selection: Selection; onSelect: (value: Selection) => void }) {
  return (
    <div className={styles.modeContent}>
      <div className={styles.modeIntro}><span className={styles.eyebrow}>Change</span><h2>Changed files and recorded surfaces</h2><p>Focused raw diff context is shown only when the stored report provides it. This view does not claim to be a complete diff viewer.</p></div>
      <div className={styles.recordList}>
        {detail.changedFiles.length ? detail.changedFiles.map((file) => (
          <RecordButton key={file.artifactId} selected={selection?.kind === "change" && selection.id === file.artifactId} onClick={() => onSelect({ kind: "change", id: file.artifactId })}>
            <Icon name="file" /><span className={styles.recordMain}><strong className={styles.mono} title={file.path}>{file.path}</strong><small>Focused diff context unavailable in the durable Report projection</small></span><span className={styles.recordState}>{file.additions === null ? "+?" : `+${file.additions}`} · {file.deletions === null ? "−?" : `−${file.deletions}`}</span>
          </RecordButton>
        )) : <div className={styles.emptyMode}><h3>No changed-file records are available for this review.</h3><p>Inspect the stored report provenance for its source limitation.</p></div>}
      </div>
    </div>
  );
}

function EvidenceMode({ detail, selection, onSelect }: { detail: CaseDetail; selection: Selection; onSelect: (value: Selection) => void }) {
  const gaps = incompleteEvidence(detail);
  return (
    <div className={styles.modeContent}>
      <div className={styles.modeIntro}><span className={styles.eyebrow}>Evidence</span><h2>What supports or weakens the recommendation?</h2><p>Findings, canonical evidence and derived missing/unverified proof remain distinct records.</p></div>
      {gaps.length ? <section className={styles.derivedProof}><span className={styles.stateLabel}>Derived presentation · canonical evidence status</span><h3>Missing or unverified proof</h3>{gaps.map((item) => <button key={item.evidenceId} type="button" onClick={() => onSelect({ kind: "evidence", id: item.evidenceId })}><strong>{item.title}</strong><span>{item.status} · {item.evidenceClass} · source <span className={styles.mono}>{item.evidenceId}</span></span></button>)}</section> : null}
      <section className={styles.collection}><div className={styles.collectionHeading}><h3>Findings</h3><span>{detail.findings.length}</span></div><div className={styles.recordList}>{detail.findings.length ? detail.findings.map((finding) => <RecordButton key={finding.findingId} selected={selection?.kind === "finding" && selection.id === finding.findingId} onClick={() => onSelect({ kind: "finding", id: finding.findingId })}><span className={`${styles.severityMarker} ${severityClass(finding.severity)}`}>{finding.severity.slice(0, 1)}</span><span className={styles.recordMain}><strong>{finding.title}</strong><small>{finding.category} · {finding.provenance} · {finding.file}</small></span><span className={styles.recordState}>{finding.severity}</span></RecordButton>) : <p>No findings were recorded for this run. This does not mean no risk.</p>}</div></section>
      <section className={styles.collection}><div className={styles.collectionHeading}><h3>Evidence records</h3><span>{detail.evidence.length}</span></div><div className={styles.recordList}>{detail.evidence.length ? detail.evidence.map((evidence) => <RecordButton key={evidence.evidenceId} selected={selection?.kind === "evidence" && selection.id === evidence.evidenceId} onClick={() => onSelect({ kind: "evidence", id: evidence.evidenceId })}><Icon name="evidence" /><span className={styles.recordMain}><strong>{evidence.title}</strong><small>{evidence.evidenceClass} · {evidence.provenance}</small></span><span className={styles.recordState}>{evidence.status}{evidence.stale ? " · stale" : ""}</span></RecordButton>) : <p>No evidence records are available. Missing proof is not inferred from an empty collection.</p>}</div></section>
    </div>
  );
}

function RequirementsMode({ detail, selection, onSelect }: { detail: CaseDetail; selection: Selection; onSelect: (value: Selection) => void }) {
  const ordered = [...detail.requirements].sort((a, b) => Number(b.importance === "blocking") - Number(a.importance === "blocking"));
  return (
    <div className={styles.modeContent}>
      <div className={styles.modeIntro}><span className={styles.eyebrow}>Requirements</span><h2>What must be proved or acted on?</h2><p>Task progress is separate from proof, requirement resolution, acknowledgement, waiver and accepted risk.</p></div>
      <div className={styles.recordList}>{ordered.length ? ordered.map((requirement) => <RecordButton key={requirement.requirementId} selected={selection?.kind === "requirement" && selection.id === requirement.requirementId} onClick={() => onSelect({ kind: "requirement", id: requirement.requirementId })}><Icon name="requirement" /><span className={styles.recordMain}><strong>{requirement.title}</strong><small>{requirement.evidenceRequired}</small></span><span className={styles.recordState}>{requirement.importance} · {requirement.status}</span></RecordButton>) : <div className={styles.emptyMode}><h3>No requirements were recorded for this run.</h3><p>This does not assert merge readiness.</p></div>}</div>
    </div>
  );
}

function RunIdentity({ run, label }: { run: RunView; label: string }) {
  return <div className={styles.runIdentity}><span className={styles.eyebrow}>{label}</span><strong className={styles.mono} title={run.runId}>{run.runId}</strong><span className={styles.mono} title={run.headSha ?? "Head not recorded"}>head {short(run.headSha, 14)}</span><span>{run.analysisSource} · {run.reproducibility}</span><small>{formatTime(run.completedAt ?? run.createdAt)}</small></div>;
}

function HistoryMode({ detail, selection, onSelect }: { detail: CaseDetail; selection: Selection; onSelect: (value: Selection) => void }) {
  const history = detail.history;
  if (history?.status === "comparison") {
    const changes = [...history.changes].sort((a, b) => Number(a.status === "unchanged") - Number(b.status === "unchanged"));
    return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>Current versus previous applicable run</h2><p>Readiness Delta owns direction. Review Diff owns inspectable changed records.</p></div><div className={styles.runPair}><button type="button" className={selection?.kind === "run" && selection.id === history.current.runId ? styles.runSelected : styles.runButton} onClick={() => onSelect({ kind: "run", id: history.current.runId })}><RunIdentity run={history.current} label="Current" /></button><button type="button" className={selection?.kind === "run" && selection.id === history.previous.runId ? styles.runSelected : styles.runButton} onClick={() => onSelect({ kind: "run", id: history.previous.runId })}><RunIdentity run={history.previous} label="Previous" /></button></div><section className={styles.deltaPanel}><span className={styles.eyebrow}>Readiness Delta</span><h3>{history.readiness.classification}</h3><div><span>Risk score {history.readiness.previousScore} → {history.readiness.currentScore}</span><span>{history.readiness.openedCount} opened</span><span>{history.readiness.clearedCount} cleared</span><span>{history.readiness.becameStaleCount} stale evidence</span></div><p>{history.readiness.note}</p>{history.limitation ? <p className={styles.truthNote}>{history.limitation}</p> : null}</section><section className={styles.collection}><div className={styles.collectionHeading}><h3>Review Diff</h3><span>{changes.filter((item) => item.status !== "unchanged").length} changed</span></div><div className={styles.diffList}>{changes.slice(0, 36).map((item) => <div key={`${item.category}-${item.key}`} className={styles.diffRow}><span className={styles.stateLabel}>{item.status}</span><div><strong>{item.title}</strong><small>{item.category} · <span className={styles.mono}>{item.key}</span></small></div><span>{item.previousState ?? "—"} → {item.currentState ?? "—"}</span></div>)}</div></section></div>;
  }
  if (history?.status === "initial") return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>Initial run</h2><p>{history.reason}</p></div><RunIdentity run={history.current} label="Current run" /></div>;
  if (history?.status === "unavailable") return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>No usable run comparison</h2><p>{history.reason}</p></div>{history.current ? <RunIdentity run={history.current} label="Current run" /> : null}</div>;
  if (detail.readiness.available) return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History · explicit sample</span><h2>{detail.readiness.readiness.classification} comparison</h2><p>{detail.readiness.readiness.note}</p></div><section className={styles.deltaPanel}><span className={styles.eyebrow}>Readiness Delta</span><h3>{detail.readiness.readiness.classification}</h3><div><span>Score {detail.readiness.readiness.previousScore} → {detail.readiness.readiness.currentScore}</span><span>{detail.readiness.readiness.openedCount} opened</span><span>{detail.readiness.readiness.clearedCount} cleared</span></div><p className={styles.truthNote}>This comparison belongs to the explicitly selected read-only sample source. No production history was substituted.</p></section></div>;
  return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>No usable run comparison</h2><p>{detail.readiness.reason}</p></div></div>;
}

function Inspector({
  detail,
  selection,
  open,
  githubState,
  mutationPending,
  mutationResult,
  onClose,
  onSelect,
  onCondition,
}: {
  detail: CaseDetail;
  selection: Selection;
  open: boolean;
  githubState: GitHubState;
  mutationPending: boolean;
  mutationResult: MutationResult | null;
  onClose: () => void;
  onSelect: (selection: Selection) => void;
  onCondition: (requirement: RequirementView) => void;
}) {
  const finding = selection?.kind === "finding" ? detail.findings.find((item) => item.findingId === selection.id) : null;
  const evidence = selection?.kind === "evidence" ? detail.evidence.find((item) => item.evidenceId === selection.id) : null;
  const requirement = selection?.kind === "requirement" ? detail.requirements.find((item) => item.requirementId === selection.id) : null;
  const change = selection?.kind === "change" ? detail.changedFiles.find((item) => item.artifactId === selection.id) : null;
  const run = selection?.kind === "run" ? [detail.history?.status === "comparison" ? detail.history.current : detail.run, detail.history?.status === "comparison" ? detail.history.previous : null].find((item) => item?.runId === selection.id) : null;
  const openItems = blockingRequirements(detail);
  const gaps = incompleteEvidence(detail);
  const stale = detail.evidence.filter((item) => item.stale).length;

  return (
    <aside className={open ? styles.inspector : styles.inspectorCollapsed} aria-label="Contextual Inspector">
      <div className={styles.inspectorHeader}><div><span className={styles.eyebrow}>Context</span><h2 tabIndex={-1}>Inspector</h2></div><button type="button" className={styles.iconButton} onClick={onClose} aria-label="Collapse Contextual Inspector"><Icon name={open ? "close" : "inspector"} /></button></div>
      {open ? <div className={styles.inspectorBody}>
        {finding ? <><span className={`${styles.stateLabel} ${severityClass(finding.severity)}`}>Finding · {finding.severity}</span><h3>{finding.title}</h3><p>{finding.statement}</p><dl><dt>Why it matters</dt><dd>{finding.action}</dd><dt>Provenance</dt><dd>{finding.provenance}</dd><dt>Affected surface</dt><dd className={styles.mono}>{finding.file}</dd></dl><h4>Supporting evidence</h4><RelationshipList state={finding.supportingEvidence} onSelect={onSelect} /><h4>Requirements</h4><RelationshipList state={finding.relatedRequirements} onSelect={onSelect} /></> : null}
        {evidence ? <><span className={styles.stateLabel}>Evidence · {evidence.status}</span><h3>{evidence.title}</h3><p>{evidence.statement}</p><dl><dt>Class</dt><dd>{evidence.evidenceClass}</dd><dt>Provenance</dt><dd>{evidence.provenance}</dd><dt>Source</dt><dd>{evidence.source}</dd><dt>Observed</dt><dd>{formatTime(evidence.observedAt)}</dd><dt>Applicability</dt><dd>{evidence.stale ? "Stale" : "Current projection"}</dd></dl><h4>Supported findings</h4><RelationshipList state={evidence.supportsFindings} onSelect={onSelect} /><h4>Requirements</h4><RelationshipList state={evidence.supportsRequirements} onSelect={onSelect} /></> : null}
        {requirement ? <><span className={requirement.importance === "blocking" ? `${styles.stateLabel} ${styles.toneBlocking}` : styles.stateLabel}>Requirement · {requirement.importance}</span><h3>{requirement.title}</h3><p>{requirement.statement}</p><dl><dt>Status</dt><dd>{requirement.status}</dd><dt>Required proof</dt><dd>{requirement.evidenceRequired}</dd><dt>Source identifier</dt><dd className={styles.mono}>{requirement.requirementId}</dd></dl><div className={styles.capabilityBox}>{requirement.conditionProgress.kind === "available" ? <><strong>Exact canonical condition</strong><p>Persisted clear/reopen is available. This records progress only; it does not prove evidence, record an actor/rationale, acknowledge or waive risk.</p><button type="button" className={styles.secondaryButton} onClick={() => onCondition(requirement)} disabled={mutationPending}>{mutationPending ? "Saving…" : requirement.conditionProgress.cleared ? "Reopen condition" : "Clear condition"}</button></> : <><strong>Read-only requirement</strong><p>{requirement.conditionProgress.kind === "read-only" ? requirement.conditionProgress.reason : "Sample data is read-only. Only exact real Conditions before merge support persisted clear/reopen."}</p><p>Requirement acknowledgement and waiver are not supported. Named accepted risk belongs only to Human Decision.</p></>}</div>{mutationResult ? <p className={mutationResult.outcome === "persisted" || mutationResult.outcome === "unchanged" ? styles.noticeInlineSuccess : styles.noticeInlineError} role="status">{mutationResult.message}</p> : null}<h4>Supporting evidence</h4><RelationshipList state={requirement.supportingEvidence} onSelect={onSelect} /></> : null}
        {change ? <><span className={styles.stateLabel}>Affected file</span><h3 className={styles.mono} title={change.path}>{change.path}</h3><p>Focused diff context is unavailable in the durable Report projection. The file identity and canonical relationships remain inspectable.</p><dl><dt>Additions</dt><dd>{change.additions ?? "Unknown"}</dd><dt>Deletions</dt><dd>{change.deletions ?? "Unknown"}</dd><dt>Recorded risk</dt><dd>{change.risk ?? "Unknown"}</dd></dl><h4>Findings</h4><RelationshipList state={change.observations} onSelect={onSelect} /><h4>Evidence</h4><RelationshipList state={change.evidence} onSelect={onSelect} /></> : null}
        {run ? <><span className={styles.stateLabel}>Canonical run</span><h3 className={styles.mono}>{run.runId}</h3><dl><dt>Head</dt><dd className={styles.mono}>{run.headSha ?? "Not recorded"}</dd><dt>Base</dt><dd className={styles.mono}>{run.baseSha ?? "Not recorded"}</dd><dt>Analysis</dt><dd>{run.analysisSource}{run.provider ? ` · ${run.provider}` : ""}{run.model ? ` / ${run.model}` : ""}</dd><dt>Reproducibility</dt><dd>{run.reproducibility}</dd><dt>Input fingerprint</dt><dd className={styles.mono}>{run.inputFingerprint}</dd><dt>Configuration fingerprint</dt><dd className={styles.mono}>{run.configurationFingerprint}</dd><dt>Result fingerprint</dt><dd className={styles.mono}>{run.resultFingerprint}</dd></dl>{run.reproducibilityLimitation ? <p className={styles.truthNote}>{run.reproducibilityLimitation}</p> : null}</> : null}
        {!selection ? <><span className={styles.stateLabel}>Decision readiness · not a decision</span><h3>{openItems.length ? "Not ready for accountable action" : "Ready for engineer assessment"}</h3><dl><dt>Lintel recommendation</dt><dd>{RECOMMENDATION_LABEL[detail.recommendation]}</dd><dt>Risk</dt><dd>{detail.riskScore}/100 {detail.riskLevel}</dd><dt>Open blockers</dt><dd>{openItems.length}</dd><dt>Missing/unverified proof</dt><dd>{gaps.length}</dd><dt>Stale evidence</dt><dd>{stale}</dd><dt>Current run</dt><dd className={styles.mono}>{detail.run?.runId ?? "Not recorded"}</dd><dt>Current head</dt><dd className={styles.mono}>{detail.github.headSha ?? "Not recorded"}</dd><dt>Owner</dt><dd>No owner recorded</dd></dl><div className={styles.handoffList}><div><strong>GitHub App</strong><span>{githubState === "checking" ? "Checking" : githubState === "connected" ? "Connected" : githubState === "available" ? "Available" : "Unavailable"}</span><small>{githubState === "connected" ? "Configured automated analysis comment only; Human Decision is not published through it." : githubState === "available" ? "Implemented capability is not configured for this environment." : githubState === "unavailable" ? "Capability status could not be verified as available." : "Checking real environment status."}</small></div><div><strong>GitHub Action</strong><span>Blueprint</span><small>Does not install, execute, connect or post.</small></div><div><strong>Slack handoff</strong><span>Export-only</span><small>Copies or downloads; it does not send.</small></div></div><div className={styles.nextAction}><span>Next accountable action</span><strong>{openItems[0] ? `Inspect blocker: ${openItems[0].title}` : gaps[0] ? `Inspect proof: ${gaps[0].title}` : "Assess the Human Decision entry below"}</strong></div></> : null}
      </div> : <div className={styles.inspectorCompactContent}><Icon name="inspector" /><span>{selection ? selection.kind : "readiness"}</span></div>}
    </aside>
  );
}

export default function WorkspaceR4Client({
  snapshot,
  persistence = null,
  decisionService = null,
  reload = null,
}: {
  snapshot: WorkspaceSnapshot;
  persistence?: WorkspacePersistence | null;
  decisionService?: WorkspaceDecisionService | null;
  reload?: (() => Promise<R4ReloadOutcome>) | null;
}) {
  if (snapshot.status !== "ready") return <StatusShell snapshot={snapshot} />;
  return <ReadyWorkspace snapshot={snapshot} persistence={persistence} decisionService={decisionService} reload={reload} />;
}

function ReadyWorkspace({
  snapshot,
  persistence,
  decisionService,
  reload,
}: {
  snapshot: WorkspaceReadySnapshot;
  persistence: WorkspacePersistence | null;
  decisionService: WorkspaceDecisionService | null;
  reload: (() => Promise<R4ReloadOutcome>) | null;
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(snapshot.defaultCaseId);
  const [mode, setMode] = useState<Mode>("overview");
  const [selection, setSelection] = useState<Selection>(null);
  const [queueCollapsed, setQueueCollapsed] = useState(false);
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("review");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [viewportWidth, setViewportWidth] = useState(1600);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [decisionPending, setDecisionPending] = useState(false);
  const [decisionResult, setDecisionResult] = useState<DecisionMutationResult | null>(null);
  const [mutationPending, setMutationPending] = useState(false);
  const [mutationResult, setMutationResult] = useState<MutationResult | null>(null);
  const [githubState, setGithubState] = useState<GitHubState>("checking");
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const decisionTriggerRef = useRef<HTMLElement | null>(null);
  const queueTriggerRef = useRef<HTMLButtonElement | null>(null);
  const inspectorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const queueDrawerRef = useRef<HTMLDivElement | null>(null);
  const inspectorDrawerRef = useRef<HTMLDivElement | null>(null);
  const initialResponsive = useRef(false);

  const cases = useMemo(() => new Map(snapshot.cases.map((item) => [item.caseId, item])), [snapshot.cases]);
  const titles = useMemo(() => titleMap(snapshot), [snapshot]);
  const activeCase = cases.get(selectedCaseId) ?? cases.get(snapshot.defaultCaseId) ?? snapshot.cases[0];
  const activeTitle = titles.get(activeCase.caseId) ?? "Stored review";
  const inspectorDrawerActive = viewportWidth < 1360 && inspectorOpen;

  useEffect(() => {
    if (cases.has(selectedCaseId)) return;
    setSelectedCaseId(snapshot.defaultCaseId);
    setSelection(null);
  }, [cases, selectedCaseId, snapshot.defaultCaseId]);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      setViewportWidth(width);
      if (!initialResponsive.current) {
        setMobileView(width < 640 ? "list" : "review");
        setInspectorOpen(width >= 1360);
        setQueueCollapsed(width < 1280);
        initialResponsive.current = true;
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const container = queueDrawerOpen ? queueDrawerRef.current : inspectorDrawerActive ? inspectorDrawerRef.current : null;
    if (!container) return;
    const focusable = () => Array.from(container.querySelectorAll<HTMLElement>(DRAWER_FOCUSABLE)).filter((item) => item.offsetParent !== null);
    const frame = window.requestAnimationFrame(() => focusable()[0]?.focus());
    function containDrawerFocus(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (queueDrawerOpen) {
          setQueueDrawerOpen(false);
          window.requestAnimationFrame(() => queueTriggerRef.current?.focus());
        } else {
          setInspectorOpen(false);
          window.requestAnimationFrame(() => inspectorTriggerRef.current?.focus());
        }
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    container.addEventListener("keydown", containDrawerFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      container.removeEventListener("keydown", containDrawerFocus);
    };
  }, [inspectorDrawerActive, queueDrawerOpen]);

  useEffect(() => {
    let active = true;
    async function readStatus() {
      try {
        const response = await fetch("/api/github-app?view=status", { cache: "no-store" });
        const payload = await response.json() as { configured?: boolean; authenticated?: boolean };
        if (!active) return;
        setGithubState(payload.configured && payload.authenticated ? "connected" : payload.configured ? "unavailable" : "available");
      } catch {
        if (active) setGithubState("unavailable");
      }
    }
    void readStatus();
    return () => { active = false; };
  }, []);

  const announce = useCallback((message: string, urgent = false) => {
    if (urgent) { setAssertive(""); window.requestAnimationFrame(() => setAssertive(message)); }
    else { setPolite(""); window.requestAnimationFrame(() => setPolite(message)); }
  }, []);

  function selectReview(id: string) {
    const next = cases.get(id);
    if (!next) return;
    setSelectedCaseId(id); setMode("overview"); setSelection(null); setMutationResult(null); setDecisionResult(null); setQueueDrawerOpen(false); setMobileView("review");
    announce(`${next.github.repository}, PR ${next.github.pullRequestNumber}, ${titles.get(id) ?? "stored review"}, ${RECOMMENDATION_LABEL[next.recommendation]}.`);
  }

  function selectObject(next: Selection) {
    setSelection(next);
    if (viewportWidth < 640 && next) setMobileView("record");
    if (next) announce(`${next.kind} selected.`);
  }

  function switchMode(next: Mode) {
    setMode(next); setSelection(null); setMobileView("review");
    announce(`${MODES.find((item) => item.id === next)?.label ?? next} mode.`);
  }

  async function applyCondition(requirement: RequirementView) {
    const capability = requirement.conditionProgress;
    if (capability.kind !== "available" || !persistence || !reload) {
      setMutationResult({ outcome: "unavailable", message: capability.kind === "read-only" ? capability.reason : "Only exact real canonical conditions support persisted clear/reopen." });
      return;
    }
    setMutationPending(true); setMutationResult(null);
    const result = persistence.applyConditionProgress({ kind: "condition-progress", caseId: capability.caseId, conditionKey: capability.conditionKey, intent: capability.cleared ? "reopen" : "clear" });
    if (result.outcome === "persisted") {
      const refreshed = await reload();
      if (!refreshed.ok) setMutationResult({ outcome: "failed", message: `${result.message} The write is stored locally, but the Workspace could not be refreshed.` });
      else setMutationResult(result);
    } else setMutationResult(result);
    setMutationPending(false);
    announce(result.message, !["persisted", "unchanged"].includes(result.outcome));
  }

  async function submitDecision(submission: DecisionSubmit) {
    const capability = activeCase.decisionMutation;
    if (!decisionService || !reload || capability.kind !== "available") {
      setDecisionResult({ outcome: "unavailable", message: snapshot.provenance.isSample ? "This explicit sample is read-only. No Human Decision was written." : capability.kind === "unavailable" ? capability.reason : "Human Decision storage is unavailable for this review." });
      return;
    }
    const refs = submission.references.map<DecisionReferenceInput>((item) => ({ id: item.id, kind: item.kind }));
    const risks = submission.acceptedRiskReferences.map<DecisionReferenceInput>((item) => ({ id: item.id, kind: item.kind }));
    setDecisionPending(true); setDecisionResult(null);
    let result: DecisionMutationResult;
    if (submission.intent === "reaffirm") {
      result = capability.effectiveEntryId ? decisionService.reaffirmDecision({ kind: "reaffirm", caseId: capability.caseId, expectedHeadSha: capability.currentHeadSha, expectedEffectiveEntryId: capability.effectiveEntryId, rationale: submission.rationale }) : { outcome: "stale-command", message: "The effective decision changed. Reload current context." };
    } else if (submission.intent === "withdraw") {
      result = capability.effectiveEntryId ? decisionService.withdrawDecision({ kind: "withdraw", caseId: capability.caseId, expectedHeadSha: capability.currentHeadSha, expectedEffectiveEntryId: capability.effectiveEntryId, rationale: submission.rationale }) : { outcome: "stale-command", message: "The effective decision changed. Reload current context." };
    } else if (submission.outcome && capability.effectiveEntryId) {
      result = decisionService.supersedeDecision({ kind: "supersede", caseId: capability.caseId, expectedHeadSha: capability.currentHeadSha, expectedEffectiveEntryId: capability.effectiveEntryId, outcome: submission.outcome, rationale: submission.rationale, references: refs, acceptedRiskReferences: risks });
    } else if (submission.outcome) {
      result = decisionService.recordDecision({ kind: "record", caseId: capability.caseId, expectedHeadSha: capability.currentHeadSha, outcome: submission.outcome, rationale: submission.rationale, references: refs, acceptedRiskReferences: risks });
    } else {
      result = { outcome: "unavailable", message: "Select one Human Decision outcome." };
    }
    if (result.outcome === "persisted") {
      const refreshed = await reload();
      if (refreshed.ok) {
        setDecisionResult(result); setDialogOpen(false); announce(result.message);
      } else {
        setDecisionResult({ outcome: "persisted-refresh-failed", message: `${result.message} The decision is stored locally, but the Workspace could not be refreshed.` });
      }
    } else {
      setDecisionResult(result); announce(result.message, !["unchanged"].includes(result.outcome));
    }
    setDecisionPending(false);
  }

  async function reloadContext() {
    if (!reload) return;
    const result = await reload();
    if (result.ok) { setDecisionResult(null); announce("Workspace context reloaded."); }
    else announce("Workspace context could not be reloaded.", true);
  }

  function openDecision(event: React.MouseEvent<HTMLElement>) {
    decisionTriggerRef.current = event.currentTarget;
    setDecisionResult(null); setDialogOpen(true);
  }

  const decision = activeCase.decision;
  const decisionText = decision.status === "recorded" ? `${OUTCOME_LABEL[decision.outcome]} · ${APPLICABILITY_LABEL[decision.applicability]}` : decision.status === "unavailable" ? "Human Decision unavailable" : "Human Decision pending";
  const blockers = blockingRequirements(activeCase);
  const gaps = incompleteEvidence(activeCase);
  return (
    <div className={styles.page} data-queue-collapsed={queueCollapsed ? "true" : "false"} data-queue-drawer={queueDrawerOpen ? "open" : "closed"} data-inspector-open={inspectorOpen ? "true" : "false"} data-inspector-drawer={inspectorDrawerActive ? "open" : "closed"} data-focus-mode={focusMode ? "true" : "false"} data-mobile-view={mobileView}>
      <a className={styles.skipLink} href="#workspace-primary">Skip to Workspace</a><a className={styles.skipQueue} href="#review-queue">Skip to review queue</a>
      <div className={styles.mobileBar}><button type="button" className={styles.iconButton} onClick={() => setQueueDrawerOpen(true)} aria-label="Open review list"><Icon name="queue" /></button><strong>Reviews</strong><span>{activeCase.github.repository} · #{activeCase.github.pullRequestNumber}</span></div>
      <div className={styles.shell} inert={dialogOpen ? true : undefined} aria-hidden={dialogOpen ? true : undefined}>
        <Rail />
        <div className={styles.queueStrip}><button ref={queueTriggerRef} type="button" onClick={() => setQueueDrawerOpen(true)} aria-label="Open review queue"><Icon name="queue" /><strong>{activeCase.github.pullRequestNumber}</strong><span>{blockers.length}B</span></button></div>
        <div ref={queueDrawerRef} className={styles.queueAnchor}><ReviewQueue snapshot={snapshot} selectedId={activeCase.caseId} collapsedGroups={collapsedGroups} onToggleGroup={(id) => setCollapsedGroups((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} onSelect={selectReview} onClose={() => { setQueueDrawerOpen(false); queueTriggerRef.current?.focus(); }} /></div>
        <main className={styles.workspace} id="workspace-primary" tabIndex={-1}>
          <header className={styles.workspaceHeader}>
            <div className={styles.workspaceIdentity}><div><span className={styles.eyebrow}>Selected review · {snapshot.provenance.isSample ? "read-only sample" : "browser-local report"}</span><span className={styles.repoLine}>{activeCase.github.repository} · PR #{activeCase.github.pullRequestNumber}</span><h1 title={activeTitle}>{activeTitle}</h1></div><div className={styles.workspaceControls}><button type="button" className={styles.iconButton} onClick={() => { setQueueCollapsed((value) => !value); if (viewportWidth < 1280) setQueueDrawerOpen(true); }} aria-label="Open review queue" title="Review queue"><Icon name="queue" /></button><button ref={inspectorTriggerRef} type="button" className={styles.iconButton} onClick={() => setInspectorOpen((value) => !value)} aria-label={inspectorOpen ? "Collapse Contextual Inspector" : "Open Contextual Inspector"} title="Contextual Inspector"><Icon name="inspector" /></button><button type="button" className={styles.iconButton} onClick={() => setFocusMode((value) => !value)} aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"} title="Focus mode"><Icon name="focus" /></button></div></div>
            <div className={styles.verdictBand}><Meta label="Lintel recommendation"><span className={recommendationClass(activeCase.recommendation)}>{RECOMMENDATION_LABEL[activeCase.recommendation]}</span></Meta><Meta label="Risk"><span className={riskClass(activeCase.riskLevel)}>{activeCase.riskScore}/100 {activeCase.riskLevel}</span></Meta><Meta label="Requirements"><span className={blockers.length ? styles.toneBlocking : styles.toneCleared}>{openRequirements(activeCase).length} open · {blockers.length} blocking</span></Meta><Meta label="Human Decision">{decisionText}</Meta></div>
            <div className={styles.technicalLine}><span className={styles.sourceBadge}>{snapshot.provenance.label}{snapshot.provenance.isSample ? " · explicit fixture" : " · stored on this device"}</span><span className={styles.mono} title={activeCase.run?.runId ?? "Run not recorded"}>Run {short(activeCase.run?.runId, 20)}</span><span className={styles.mono} title={activeCase.github.headSha ?? "Head not recorded"}>Head {short(activeCase.github.headSha, 14)}</span><span className={styles.mono} title={activeCase.github.branch}>Branch {activeCase.github.branch}</span></div>
            {focusMode ? <div className={styles.focusBar}><span>Focus mode</span><strong>{activeCase.github.repository} · #{activeCase.github.pullRequestNumber}</strong><span>{RECOMMENDATION_LABEL[activeCase.recommendation]} · {blockers.length}B · {decisionText}</span><button type="button" onClick={() => setFocusMode(false)}>Exit focus mode</button></div> : null}
            <nav className={styles.modeNav} aria-label="Workspace modes">{MODES.map((item) => <button key={item.id} type="button" className={mode === item.id ? styles.modeActive : styles.modeButton} aria-current={mode === item.id ? "page" : undefined} onClick={() => switchMode(item.id)}>{item.label}{item.shortcut ? <kbd>{item.shortcut}</kbd> : null}</button>)}</nav>
          </header>
          <div className={styles.workspaceScroll}>
            {mode === "overview" ? <Overview detail={activeCase} onSelect={selectObject} onMode={switchMode} /> : null}
            {mode === "change" ? <ChangeMode detail={activeCase} selection={selection} onSelect={selectObject} /> : null}
            {mode === "evidence" ? <EvidenceMode detail={activeCase} selection={selection} onSelect={selectObject} /> : null}
            {mode === "requirements" ? <RequirementsMode detail={activeCase} selection={selection} onSelect={selectObject} /> : null}
            {mode === "history" ? <HistoryMode detail={activeCase} selection={selection} onSelect={selectObject} /> : null}
          </div>
          <div className={styles.readinessBar}><div><span className={blockers.length ? styles.readinessDotBlocking : styles.readinessDotReady} /><strong>{blockers.length ? "Not ready for Human Decision" : "Ready for engineer assessment"}</strong></div><span>{blockers.length} blockers · {gaps.length} missing/unverified · {activeCase.evidence.filter((item) => item.stale).length} stale</span><span>{decisionText}</span><button type="button" className={styles.primaryButton} onClick={openDecision}>{snapshot.provenance.isSample ? "Preview decision flow" : "Record Human Decision"}</button></div>
        </main>
        <div ref={inspectorDrawerRef} className={styles.inspectorAnchor}><Inspector detail={activeCase} selection={selection} open={inspectorOpen} githubState={githubState} mutationPending={mutationPending} mutationResult={mutationResult} onClose={() => { setInspectorOpen(false); window.requestAnimationFrame(() => inspectorTriggerRef.current?.focus()); }} onSelect={selectObject} onCondition={applyCondition} /></div>
        {mobileView === "record" && selection ? <div className={styles.mobileRecord}><button type="button" className={styles.backButton} onClick={() => { setMobileView("review"); setInspectorOpen(false); }}><Icon name="back" /> Back to {mode}</button><Inspector detail={activeCase} selection={selection} open githubState={githubState} mutationPending={mutationPending} mutationResult={mutationResult} onClose={() => setMobileView("review")} onSelect={selectObject} onCondition={applyCondition} /></div> : null}
        {queueDrawerOpen || inspectorDrawerActive ? <button type="button" className={styles.drawerScrim} aria-label={queueDrawerOpen ? "Close review queue" : "Close Contextual Inspector"} onClick={() => { if (queueDrawerOpen) { setQueueDrawerOpen(false); queueTriggerRef.current?.focus(); } else { setInspectorOpen(false); inspectorTriggerRef.current?.focus(); } }} /> : null}
      </div>
      <HumanDecisionDialog open={dialogOpen} detail={activeCase} title={activeTitle} pending={decisionPending} result={decisionResult} onSubmit={submitDecision} onClose={() => setDialogOpen(false)} onReload={reloadContext} returnFocusRef={decisionTriggerRef} readOnlyReason={snapshot.provenance.isSample ? "The explicit fixture source is read-only. Use a real browser-local report to record an authoritative Human Decision." : null} />
      <div className={styles.livePolite} aria-live="polite" aria-atomic="true">{polite}</div><div className={styles.liveAssertive} role="alert" aria-atomic="true">{assertive}</div>
    </div>
  );
}
