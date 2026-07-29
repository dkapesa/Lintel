"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  HistoryChangeView,
  QueueCaseSummary,
  QueueGroup,
  RelationshipState,
  RequirementView,
  RiskLevel,
  RunView,
  RunComparisonView,
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
type InvestigationKind =
  | ArtifactKind
  | "missing-proof"
  | "run"
  | "history-change"
  | "decision-readiness"
  | "decision-event";
type Selection = { kind: InvestigationKind; id: string } | null;
type OriginContext = {
  selection: NonNullable<Selection>;
  mode: Mode;
  scrollTop: number;
  label: string;
} | null;
type MobileView = "list" | "review" | "record";
type GitHubState = "checking" | "connected" | "available" | "unavailable";
type NextInspection = {
  selection: NonNullable<Selection> | null;
  mode: Mode;
  title: string;
  why: string;
  unavailable?: boolean;
};

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

function selectionMode(selection: NonNullable<Selection>): Mode {
  if (selection.kind === "change") return "change";
  if (["finding", "evidence", "missing-proof"].includes(selection.kind)) return "evidence";
  if (selection.kind === "requirement") return "requirements";
  if (["run", "history-change", "decision-event"].includes(selection.kind)) return "history";
  return "overview";
}

function selectionLabel(detail: CaseDetail, selection: NonNullable<Selection>): string {
  if (selection.kind === "finding") return detail.findings.find((item) => item.findingId === selection.id)?.title ?? "finding";
  if (selection.kind === "evidence" || selection.kind === "missing-proof") return detail.evidence.find((item) => item.evidenceId === selection.id)?.title ?? (selection.kind === "missing-proof" ? "missing proof" : "evidence");
  if (selection.kind === "requirement") return detail.requirements.find((item) => item.requirementId === selection.id)?.title ?? "requirement";
  if (selection.kind === "change") return detail.changedFiles.find((item) => item.artifactId === selection.id)?.path ?? "affected context";
  if (selection.kind === "run") return selection.id;
  if (selection.kind === "history-change") return `readiness change ${selection.id}`;
  if (selection.kind === "decision-event") return `Human Decision event ${selection.id}`;
  return "decision readiness";
}

function selectionExists(detail: CaseDetail, selection: Selection): boolean {
  if (!selection) return true;
  if (selection.kind === "finding") return detail.findings.some((item) => item.findingId === selection.id);
  if (selection.kind === "evidence") return detail.evidence.some((item) => item.evidenceId === selection.id);
  if (selection.kind === "missing-proof") return detail.evidence.some((item) => item.evidenceId === selection.id && ["missing", "unverified"].includes(item.status));
  if (selection.kind === "requirement") return detail.requirements.some((item) => item.requirementId === selection.id);
  if (selection.kind === "change") return detail.changedFiles.some((item) => item.artifactId === selection.id);
  if (selection.kind === "run") {
    if (detail.run?.runId === selection.id) return true;
    return detail.history?.status === "comparison" && [detail.history.current, detail.history.previous, ...(detail.history.comparisons ?? []).map((item) => item.target)].some((item) => item.runId === selection.id);
  }
  if (selection.kind === "history-change") {
    if (detail.history?.status !== "comparison") return false;
    return [detail.history.changes, ...(detail.history.comparisons ?? []).map((item) => item.changes)]
      .flat()
      .some((item) => historyChangeId(item) === selection.id);
  }
  if (selection.kind === "decision-event") return detail.decision.status === "recorded" && Boolean(detail.decision.history?.some((item) => item.entryId === selection.id));
  return true;
}

function deriveNextInspection(detail: CaseDetail): NextInspection {
  const blockers = blockingRequirements(detail);
  const gaps = incompleteEvidence(detail);
  const blockerGap = gaps.find((evidence) =>
    relationshipItems(evidence.supportsRequirements).some((related) =>
      blockers.some((requirement) => requirement.requirementId === related.id),
    ),
  );
  if (blockerGap) {
    const blockedCount = relationshipItems(blockerGap.supportsRequirements).filter((related) =>
      blockers.some((requirement) => requirement.requirementId === related.id),
    ).length;
    return {
      selection: { kind: "missing-proof", id: blockerGap.evidenceId },
      mode: "evidence",
      title: blockerGap.title,
      why: `This derived missing or unverified proof blocks ${blockedCount || "a current"} requirement${blockedCount === 1 ? "" : "s"} and is not current verified evidence.`,
    };
  }
  if (gaps[0]) return { selection: { kind: "missing-proof", id: gaps[0].evidenceId }, mode: "evidence", title: gaps[0].title, why: "This is the highest-priority missing or unverified canonical evidence record still affecting the review." };
  const staleEvidence = detail.evidence.find((item) => item.stale);
  if (staleEvidence) return { selection: { kind: "evidence", id: staleEvidence.evidenceId }, mode: "evidence", title: staleEvidence.title, why: "This evidence is recorded but stale for the current review context." };
  const reopened = blockers.find((item) => item.status === "open" && item.stale);
  if (reopened) return { selection: { kind: "requirement", id: reopened.requirementId }, mode: "requirements", title: reopened.title, why: "This blocking requirement remains open and its supporting proof is stale." };
  if (blockers[0]) return { selection: { kind: "requirement", id: blockers[0].requirementId }, mode: "requirements", title: blockers[0].title, why: "This is the first deterministically ordered blocking requirement still open." };
  if (detail.decision.status === "recorded" && detail.decision.needsReaffirmation) return { selection: { kind: "decision-readiness", id: "decision-readiness" }, mode: "overview", title: "Reassess the stale Human Decision", why: "The prior Human Decision does not apply cleanly to the current recorded head." };
  if (detail.history?.status === "unavailable" && detail.run) return { selection: { kind: "run", id: detail.run.runId }, mode: "history", title: "Inspect unavailable run comparison", why: detail.history.reason };
  if (detail.history?.status === "unavailable") return { selection: null, mode: "history", title: "Run comparison unavailable", why: detail.history.reason, unavailable: true };
  return { selection: null, mode: "overview", title: "Next inspection unavailable", why: "No unresolved blocking, missing, stale, decision-applicability, or comparison target is available in the current canonical projection.", unavailable: true };
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
  tabIndex,
  onFocus,
  onKeyDown,
}: {
  item: QueueCaseSummary;
  detail: CaseDetail | undefined;
  selected: boolean;
  onSelect: () => void;
  tabIndex: number;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
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
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
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
  const [focusedReviewId, setFocusedReviewId] = useState(selectedId);
  const queueListRef = useRef<HTMLDivElement | null>(null);
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
  const visibleReviewIds = filteredGroups.flatMap((group) => collapsedGroups.has(group.id) ? (group.cases.some((item) => item.caseId === selectedId) ? [selectedId] : []) : group.cases.map((item) => item.caseId));
  const rovingReviewId = visibleReviewIds.includes(focusedReviewId)
    ? focusedReviewId
    : visibleReviewIds.includes(selectedId)
      ? selectedId
      : visibleReviewIds[0];

  function handleQueueKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const key = event.key.toLowerCase();
    const delta = key === "arrowdown" || key === "j" ? 1 : key === "arrowup" || key === "k" ? -1 : 0;
    if (!delta && key !== "home" && key !== "end") return;
    if ((key === "j" || key === "k") && (event.altKey || event.ctrlKey || event.metaKey)) return;
    const rows = Array.from(queueListRef.current?.querySelectorAll<HTMLButtonElement>("[data-review-id]") ?? []);
    if (!rows.length) return;
    event.preventDefault();
    const current = Math.max(0, rows.indexOf(event.currentTarget));
    const nextIndex = key === "home" ? 0 : key === "end" ? rows.length - 1 : Math.min(rows.length - 1, Math.max(0, current + delta));
    const next = rows[nextIndex];
    setFocusedReviewId(next.dataset.reviewId ?? selectedId);
    next.focus();
  }

  const queueRow = (item: QueueCaseSummary, selected: boolean) => (
    <QueueRow
      key={item.caseId}
      item={item}
      detail={cases.get(item.caseId)}
      selected={selected}
      onSelect={() => onSelect(item.caseId)}
      tabIndex={item.caseId === rovingReviewId ? 0 : -1}
      onFocus={() => setFocusedReviewId(item.caseId)}
      onKeyDown={handleQueueKeyDown}
    />
  );

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
      <div className={styles.queueList} ref={queueListRef} aria-label="Loaded reviews">
        {filteredGroups.map((group) => {
          const collapsed = collapsedGroups.has(group.id);
          const selectedInGroup = group.cases.some((item) => item.caseId === selectedId);
          return (
            <section key={group.id} className={styles.queueGroup} aria-labelledby={`queue-group-${group.id}`}>
              <button type="button" id={`queue-group-${group.id}`} className={styles.queueGroupButton} aria-expanded={!collapsed} onClick={() => onToggleGroup(group.id)}>
                <Icon name="chevron" size={14} /><span>{group.label}</span><span>{group.cases.length}</span>
              </button>
              {collapsed && selectedInGroup && selectedSummary ? <div className={styles.pinnedSelected}><span>Selected review retained</span>{queueRow(selectedSummary, true)}</div> : null}
              {!collapsed ? <div className={styles.queueRows}>{group.cases.map((item) => queueRow(item, item.caseId === selectedId))}</div> : null}
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

function RelationshipList({
  state,
  relation,
  provenance,
  onSelect,
}: {
  state: RelationshipState;
  relation: string;
  provenance: "Explicit stored relationship" | "Deterministic derived relationship";
  onSelect: (selection: Selection) => void;
}) {
  const related = relationshipItems(state);
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    const owner = event.currentTarget.closest('[data-relationship-list="true"]');
    const nodes = Array.from(owner?.querySelectorAll<HTMLButtonElement>("[data-related-record]") ?? []);
    const index = nodes.indexOf(event.currentTarget);
    if (index < 0) return;
    event.preventDefault();
    nodes[Math.min(nodes.length - 1, Math.max(0, index + delta))]?.focus();
  }
  return (
    <div className={styles.relationshipList} data-relationship-list="true" aria-label={`${relation} relationships`}>
      <p><strong>{relation}</strong> Â· {relationshipSummary(state)}</p>
      <small className={styles.relationshipProvenance}>
        {state.status === "unavailable" ? "Unavailable relationship" : state.status === "none" ? "None recorded" : state.status === "unresolved" ? "Stored relationship does not resolve" : provenance}
      </small>
      {related.map((item) => (
        <button key={`${item.kind}-${item.id}`} type="button" data-related-record={`${item.kind}:${item.id}`} onKeyDown={handleKeyDown} onClick={() => onSelect({ kind: item.kind, id: item.id })}>
          <span>{relation} Â· {item.kind}</span><strong>{item.label}</strong><small>{item.detail ?? item.id}</small>
        </button>
      ))}
    </div>
  );
}

function handleRecordArrowKey(event: React.KeyboardEvent<HTMLButtonElement>) {
  const delta = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
  if (!delta && event.key !== "Home" && event.key !== "End") return;
  const owner = event.currentTarget.closest('[data-record-list="true"]');
  const records = Array.from(owner?.querySelectorAll<HTMLButtonElement>("[data-record-id]") ?? []);
  if (!records.length) return;
  event.preventDefault();
  const current = Math.max(0, records.indexOf(event.currentTarget));
  const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? records.length - 1 : Math.min(records.length - 1, Math.max(0, current + delta));
  records[nextIndex]?.focus();
}

function RecordButton({ recordId, selected, onClick, children }: { recordId: string; selected: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" data-record-id={recordId} className={selected ? styles.recordSelected : styles.record} aria-pressed={selected} onKeyDown={handleRecordArrowKey} onClick={onClick}>{children}</button>;
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

function ChangeMode({ detail, selection, onSelect, onRelated }: { detail: CaseDetail; selection: Selection; onSelect: (value: Selection) => void; onRelated: (value: Selection) => void }) {
  const selectedFile = selection?.kind === "change" ? detail.changedFiles.find((item) => item.artifactId === selection.id) : null;
  return (
    <div className={styles.modeContent}>
      <div className={styles.modeIntro}><span className={styles.eyebrow}>Change</span><h2>Changed files and recorded surfaces</h2><p>Focused raw diff context is shown only when the stored report provides it. This view does not claim to be a complete diff viewer.</p></div>
      <div className={styles.recordList} data-record-list="true">
        {detail.changedFiles.length ? detail.changedFiles.map((file) => (
          <RecordButton key={file.artifactId} recordId={`change:${file.artifactId}`} selected={selection?.kind === "change" && selection.id === file.artifactId} onClick={() => onSelect({ kind: "change", id: file.artifactId })}>
            <Icon name="file" /><span className={styles.recordMain}><strong className={styles.mono} title={file.path}>{file.path}</strong><small>{file.focusedRegions.length ? `Exact recorded line ${file.focusedRegions[0].startLine} available` : "File relationship available; exact line unavailable"}</small></span><span className={styles.recordState}>{file.additions === null ? "+?" : `+${file.additions}`} · {file.deletions === null ? "−?" : `−${file.deletions}`}</span>
          </RecordButton>
        )) : <div className={styles.emptyMode}><h3>No changed-file records are available for this review.</h3><p>Inspect the stored report provenance for its source limitation.</p></div>}
      </div>
      {selectedFile ? (
        <article className={styles.codeContext} aria-labelledby="focused-code-context-heading">
          <div className={styles.codeContextHeader}>
            <div><span className={styles.eyebrow}>Focused affected context</span><h3 id="focused-code-context-heading" className={styles.mono}>{selectedFile.path}</h3></div>
            <span className={selectedFile.focusedRegions.length ? styles.contextExact : styles.contextUnavailable}>{selectedFile.focusedRegions.length ? "Exact line anchor" : "File-only relationship"}</span>
          </div>
          <dl className={styles.codeMeta}>
            <dt>Change status</dt><dd>Changed file recorded; finer status not stored</dd>
            <dt>Changed lines</dt><dd>{selectedFile.additions === null && selectedFile.deletions === null ? "Counts unavailable" : `${selectedFile.additions ?? "?"} additions · ${selectedFile.deletions ?? "?"} deletions`}</dd>
            <dt>Language / framework</dt><dd>{detail.technicalContext ? `${detail.technicalContext.language} · ${detail.technicalContext.framework}` : "Not stored for this source"}</dd>
            <dt>Current applicability</dt><dd>{detail.github.headSha ? <>Current recorded head <span className={styles.mono}>{short(detail.github.headSha, 14)}</span></> : "Head not recorded; applicability cannot be proven"}</dd>
          </dl>
          {selectedFile.focusedRegions.length ? (
            <div className={styles.codeViewport} tabIndex={0} aria-label={`Recorded focused regions for ${selectedFile.path}`}>
              {selectedFile.focusedRegions.slice(0, 8).map((region) => (
                <button key={`${region.sourceFindingId}-${region.startLine}`} type="button" onClick={() => onRelated({ kind: "finding", id: region.sourceFindingId })}>
                  <span className={styles.codeLineNumber}>{region.startLine}</span>
                  <code>Exact line anchor from finding: {region.sourceLabel}</code>
                </button>
              ))}
              <p>Source text and surrounding raw diff are not retained in durable Report history, so no code is reconstructed here.</p>
            </div>
          ) : (
            <div className={styles.codeUnavailable}><strong>Exact changed region unavailable</strong><p>The canonical record relates this file to the review, but stores no exact numeric location. Raw diff is unavailable in durable history.</p></div>
          )}
          <div className={styles.codeRelationships}>
            <div><h4>Explained by findings</h4><RelationshipList state={selectedFile.observations} relation="explained by" provenance="Deterministic derived relationship" onSelect={onRelated} /></div>
            <div><h4>Supported by evidence</h4><RelationshipList state={selectedFile.evidence} relation="supported by" provenance="Deterministic derived relationship" onSelect={onRelated} /></div>
          </div>
        </article>
      ) : null}
    </div>
  );
}

function EvidenceMode({ detail, selection, onSelect }: { detail: CaseDetail; selection: Selection; onSelect: (value: Selection) => void }) {
  const gaps = incompleteEvidence(detail);
  return (
    <div className={styles.modeContent}>
      <div className={styles.modeIntro}><span className={styles.eyebrow}>Evidence</span><h2>What supports or weakens the recommendation?</h2><p>Findings, canonical evidence and derived missing/unverified proof remain distinct records.</p></div>
      {gaps.length ? <section className={styles.derivedProof}><span className={styles.stateLabel}>Derived presentation · canonical evidence status</span><h3>Missing or unverified proof</h3>{gaps.map((item) => <button key={item.evidenceId} type="button" aria-pressed={selection?.kind === "missing-proof" && selection.id === item.evidenceId} onClick={() => onSelect({ kind: "missing-proof", id: item.evidenceId })}><strong>{item.title}</strong><span>{item.status} · {item.evidenceClass} · source <span className={styles.mono}>{item.evidenceId}</span></span></button>)}</section> : null}
      <section className={styles.collection}><div className={styles.collectionHeading}><h3>Findings</h3><span>{detail.findings.length}</span></div><div className={styles.recordList} data-record-list="true">{detail.findings.length ? detail.findings.map((finding) => <RecordButton key={finding.findingId} recordId={`finding:${finding.findingId}`} selected={selection?.kind === "finding" && selection.id === finding.findingId} onClick={() => onSelect({ kind: "finding", id: finding.findingId })}><span className={`${styles.severityMarker} ${severityClass(finding.severity)}`}>{finding.severity.slice(0, 1)}</span><span className={styles.recordMain}><strong>{finding.title}</strong><small>{finding.category} · {finding.provenance} · {finding.file}</small></span><span className={styles.recordState}>{finding.severity}</span></RecordButton>) : <p>No findings were recorded for this run. This does not mean no risk.</p>}</div></section>
      <section className={styles.collection}><div className={styles.collectionHeading}><h3>Evidence records</h3><span>{detail.evidence.length}</span></div><div className={styles.recordList} data-record-list="true">{detail.evidence.length ? detail.evidence.map((evidence) => <RecordButton key={evidence.evidenceId} recordId={`evidence:${evidence.evidenceId}`} selected={selection?.kind === "evidence" && selection.id === evidence.evidenceId} onClick={() => onSelect({ kind: "evidence", id: evidence.evidenceId })}><Icon name="evidence" /><span className={styles.recordMain}><strong>{evidence.title}</strong><small>{evidence.evidenceClass} · {evidence.provenance}</small></span><span className={styles.recordState}>{evidence.status}{evidence.stale ? " · stale" : ""}</span></RecordButton>) : <p>No evidence records are available. Missing proof is not inferred from an empty collection.</p>}</div></section>
    </div>
  );
}

function RequirementsMode({ detail, selection, onSelect }: { detail: CaseDetail; selection: Selection; onSelect: (value: Selection) => void }) {
  const ordered = [...detail.requirements].sort((a, b) => Number(b.importance === "blocking") - Number(a.importance === "blocking"));
  return (
    <div className={styles.modeContent}>
      <div className={styles.modeIntro}><span className={styles.eyebrow}>Requirements</span><h2>What must be proved or acted on?</h2><p>Task progress is separate from proof, requirement resolution, acknowledgement, waiver and accepted risk.</p></div>
      <div className={styles.recordList} data-record-list="true">{ordered.length ? ordered.map((requirement) => <RecordButton key={requirement.requirementId} recordId={`requirement:${requirement.requirementId}`} selected={selection?.kind === "requirement" && selection.id === requirement.requirementId} onClick={() => onSelect({ kind: "requirement", id: requirement.requirementId })}><Icon name="requirement" /><span className={styles.recordMain}><strong>{requirement.title}</strong><small>{requirement.evidenceRequired}</small></span><span className={styles.recordState}>{requirement.importance} · {requirement.status}{requirement.stale ? " · stale" : ""}</span></RecordButton>) : <div className={styles.emptyMode}><h3>No requirements were recorded for this run.</h3><p>This does not assert merge readiness.</p></div>}</div>
    </div>
  );
}

function RunIdentity({ run, label }: { run: RunView; label: string }) {
  return <div className={styles.runIdentity}><span className={styles.eyebrow}>{label}</span><strong className={styles.mono} title={run.runId}>{run.runId}</strong><span className={styles.mono} title={run.headSha ?? "Head not recorded"}>head {short(run.headSha, 14)}</span><span>{run.analysisSource} · {run.reproducibility}</span><small>{formatTime(run.completedAt ?? run.createdAt)}</small></div>;
}

function historyChangeId(change: HistoryChangeView) {
  return `${change.category}:${change.key}`;
}

function HistoryMode({ detail, selection, comparisonRunId, onCompare, onSelect }: { detail: CaseDetail; selection: Selection; comparisonRunId: string | null; onCompare: (runId: string) => void; onSelect: (value: Selection) => void }) {
  const history = detail.history;
  if (history?.status === "comparison") {
    const fallbackComparison: RunComparisonView = { target: history.previous, readiness: history.readiness, changes: history.changes, limitation: history.limitation };
    const comparisons = history.comparisons?.length ? history.comparisons : [fallbackComparison];
    const comparison = comparisons.find((item) => item.target.runId === comparisonRunId) ?? comparisons.find((item) => item.target.runId === history.previous.runId) ?? comparisons[0];
    const changes = [...comparison.changes].sort((a, b) => Number(a.status === "unchanged") - Number(b.status === "unchanged"));
    const decision = detail.decision.status === "recorded" ? detail.decision : null;
    return <div className={styles.modeContent}>
      <div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>Current versus stored run</h2><p>Readiness Delta owns direction. Review Diff owns inspectable changed records. Raw source diff is not retained.</p></div>
      <label className={styles.comparisonControl}><span>Comparison target</span><select value={comparison.target.runId} onChange={(event) => onCompare(event.target.value)}>{comparisons.map((item) => <option key={item.target.runId} value={item.target.runId}>{item.target.runId}{item.target.runId === history.previous.runId ? " · previous applicable" : ""}</option>)}</select><small>{comparisons.length > 1 ? `${comparisons.length} compatible stored targets` : "Only the immediately previous valid run is available."}</small></label>
      <div className={styles.runPair}><button type="button" className={selection?.kind === "run" && selection.id === history.current.runId ? styles.runSelected : styles.runButton} onClick={() => onSelect({ kind: "run", id: history.current.runId })}><RunIdentity run={history.current} label="Current" /></button><button type="button" className={selection?.kind === "run" && selection.id === comparison.target.runId ? styles.runSelected : styles.runButton} onClick={() => onSelect({ kind: "run", id: comparison.target.runId })}><RunIdentity run={comparison.target} label="Comparison" /></button></div>
      <section className={styles.deltaPanel}><span className={styles.eyebrow}>Readiness Delta</span><h3>{comparison.readiness.classification}</h3><div><span>Risk score {comparison.readiness.previousScore} → {comparison.readiness.currentScore}</span><span>{comparison.readiness.openedCount} opened</span><span>{comparison.readiness.clearedCount} cleared</span><span>{comparison.readiness.becameStaleCount} newly stale evidence</span></div><p>{comparison.readiness.note}</p>{comparison.limitation ? <p className={styles.truthNote}>{comparison.limitation}</p> : null}</section>
      <section className={styles.collection}><div className={styles.collectionHeading}><h3>Review Diff</h3><span>{changes.filter((item) => item.status !== "unchanged").length} changed</span></div><div className={styles.diffList} data-record-list="true">{changes.slice(0, 36).map((item) => <button type="button" key={`${item.category}-${item.key}`} data-record-id={historyChangeId(item)} className={selection?.kind === "history-change" && selection.id === historyChangeId(item) ? styles.diffRowSelected : styles.diffRow} onKeyDown={handleRecordArrowKey} onClick={() => onSelect({ kind: "history-change", id: historyChangeId(item) })}><span className={styles.stateLabel}>{item.status}</span><div><strong>{item.title}</strong><small>{item.category} · <span className={styles.mono}>{item.key}</span></small></div><span>{item.previousState ?? "—"} → {item.currentState ?? "—"}</span></button>)}</div></section>
      <section className={styles.decisionHistory}><span className={styles.eyebrow}>Human Decision applicability</span><h3>{decision ? `${OUTCOME_LABEL[decision.outcome]} · ${APPLICABILITY_LABEL[decision.applicability]}` : "No Human Decision recorded"}</h3><p>{decision?.needsReaffirmation ? "The prior decision does not apply cleanly to the current head and requires engineer reassessment." : decision ? "Inspect the recorded lineage and current applicability; this history does not replace engineer judgment." : "Decision authority remains pending."}</p>{decision?.history?.length ? <div data-record-list="true">{decision.history.slice(0, 12).map((event) => <button type="button" key={event.entryId} data-record-id={`decision-event:${event.entryId}`} onKeyDown={handleRecordArrowKey} onClick={() => onSelect({ kind: "decision-event", id: event.entryId })}><strong>{event.outcome ? OUTCOME_LABEL[event.outcome] : event.eventType}</strong><span>{event.role} · {formatTime(event.recordedAt)}</span></button>)}</div> : null}</section>
    </div>;
  }
  if (history?.status === "initial") return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>Initial run</h2><p>{history.reason}</p></div><RunIdentity run={history.current} label="Current run" /></div>;
  if (history?.status === "unavailable") return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>No usable run comparison</h2><p>{history.reason}</p></div>{history.current ? <RunIdentity run={history.current} label="Current run" /> : null}</div>;
  if (detail.readiness.available) return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History · explicit sample</span><h2>{detail.readiness.readiness.classification} comparison</h2><p>{detail.readiness.readiness.note}</p></div><section className={styles.deltaPanel}><span className={styles.eyebrow}>Readiness Delta</span><h3>{detail.readiness.readiness.classification}</h3><div><span>Score {detail.readiness.readiness.previousScore} → {detail.readiness.readiness.currentScore}</span><span>{detail.readiness.readiness.openedCount} opened</span><span>{detail.readiness.readiness.clearedCount} cleared</span></div><p className={styles.truthNote}>This comparison belongs to the explicitly selected read-only sample source. No production history was substituted.</p></section></div>;
  return <div className={styles.modeContent}><div className={styles.modeIntro}><span className={styles.eyebrow}>History</span><h2>No usable run comparison</h2><p>{detail.readiness.reason}</p></div></div>;
}

function Inspector({ detail, selection, origin, comparisonRunId, nextInspection, open, githubState, mutationPending, mutationResult, onClose, onSelect, onReturn, onOpenNext, onCondition }: {
  detail: CaseDetail;
  selection: Selection;
  origin: OriginContext;
  comparisonRunId: string | null;
  nextInspection: NextInspection;
  open: boolean;
  githubState: GitHubState;
  mutationPending: boolean;
  mutationResult: MutationResult | null;
  onClose: () => void;
  onSelect: (selection: Selection) => void;
  onReturn: () => void;
  onOpenNext: () => void;
  onCondition: (requirement: RequirementView) => void;
}) {
  const [conditionConfirmationId, setConditionConfirmationId] = useState<string | null>(null);
  const finding = selection?.kind === "finding" ? detail.findings.find((item) => item.findingId === selection.id) : null;
  const evidence = selection?.kind === "evidence" ? detail.evidence.find((item) => item.evidenceId === selection.id) : null;
  const missingProof = selection?.kind === "missing-proof" ? detail.evidence.find((item) => item.evidenceId === selection.id) : null;
  const requirement = selection?.kind === "requirement" ? detail.requirements.find((item) => item.requirementId === selection.id) : null;
  const change = selection?.kind === "change" ? detail.changedFiles.find((item) => item.artifactId === selection.id) : null;
  const comparisons = detail.history?.status === "comparison" ? detail.history.comparisons ?? [] : [];
  const activeComparison = detail.history?.status === "comparison" ? comparisons.find((item) => item.target.runId === comparisonRunId) ?? { target: detail.history.previous, readiness: detail.history.readiness, changes: detail.history.changes, limitation: detail.history.limitation } : null;
  const runCandidates = detail.history?.status === "comparison" ? [detail.history.current, ...comparisons.map((item) => item.target), detail.history.previous] : [detail.run];
  const run = selection?.kind === "run" ? runCandidates.find((item) => item?.runId === selection.id) : null;
  const historyChange = selection?.kind === "history-change" ? activeComparison?.changes.find((item) => historyChangeId(item) === selection.id) : null;
  const decisionEvent = selection?.kind === "decision-event" && detail.decision.status === "recorded" ? detail.decision.history?.find((item) => item.entryId === selection.id) : null;
  const readinessSelected = !selection || selection.kind === "decision-readiness";
  const openItems = blockingRequirements(detail);
  const gaps = incompleteEvidence(detail);
  const stale = detail.evidence.filter((item) => item.stale).length;
  const decision = detail.decision.status === "recorded" ? detail.decision : null;

  return (
    <aside className={open ? styles.inspector : styles.inspectorCollapsed} aria-label="Contextual Inspector">
      <div className={styles.inspectorHeader}><div><span className={styles.eyebrow}>Context</span><h2 tabIndex={-1}>Inspector</h2></div><button type="button" className={styles.iconButton} onClick={onClose} aria-label="Collapse Contextual Inspector"><Icon name={open ? "close" : "inspector"} /></button></div>
      {open ? <div className={styles.inspectorBody}>
        {origin ? <button type="button" className={styles.contextBack} onClick={onReturn}><Icon name="back" /> {origin.label}</button> : null}
        {finding ? <><span className={`${styles.stateLabel} ${severityClass(finding.severity)}`}>Finding · {finding.severity}</span><h3>{finding.title}</h3><p>{finding.statement}</p><dl><dt>Category</dt><dd>{finding.category}</dd><dt>Why it matters</dt><dd>{finding.action}</dd><dt>Provenance</dt><dd>{finding.provenance}</dd><dt>Current applicability</dt><dd>{detail.github.headSha ? `Current projection · ${short(detail.github.headSha, 14)}` : "Head not recorded"}</dd><dt>Affected surface</dt><dd className={styles.mono}>{finding.file}</dd></dl><h4>Affected context</h4><RelationshipList state={finding.affectedChange} relation="affects" provenance="Deterministic derived relationship" onSelect={onSelect} /><h4>Supporting evidence</h4><RelationshipList state={finding.supportingEvidence} relation="supported by" provenance="Explicit stored relationship" onSelect={onSelect} /><h4>Requirements</h4><RelationshipList state={finding.relatedRequirements} relation="contributes to" provenance="Explicit stored relationship" onSelect={onSelect} />{relationshipItems(finding.supportingEvidence).some((item) => gaps.some((gap) => gap.evidenceId === item.id)) ? <div className={styles.missingProofLinks}><strong>Derived missing proof</strong>{relationshipItems(finding.supportingEvidence).filter((item) => gaps.some((gap) => gap.evidenceId === item.id)).map((item) => <button type="button" key={item.id} onClick={() => onSelect({ kind: "missing-proof", id: item.id })}>Open {item.label}</button>)}</div> : null}</> : null}
        {evidence ? <><span className={styles.stateLabel}>Evidence · {evidence.status}</span><h3>{evidence.title}</h3><p>{evidence.statement}</p><dl><dt>Class</dt><dd>{evidence.evidenceClass}</dd><dt>Status</dt><dd>{evidence.status}{evidence.stale ? " · stale" : ""}</dd><dt>Provenance</dt><dd>{evidence.provenance}</dd><dt>Source</dt><dd>{evidence.source}</dd><dt>Observed</dt><dd>{formatTime(evidence.observedAt)}</dd><dt>Applicability</dt><dd>{evidence.stale ? "Historical/stale for current projection" : "Current projection"}</dd></dl><h4>Findings</h4><RelationshipList state={evidence.supportsFindings} relation="supports" provenance="Explicit stored relationship" onSelect={onSelect} /><h4>Requirements</h4><RelationshipList state={evidence.supportsRequirements} relation="contributes to" provenance="Deterministic derived relationship" onSelect={onSelect} /><h4>Affected context</h4><RelationshipList state={evidence.relatedChanges} relation="affects" provenance="Explicit stored relationship" onSelect={onSelect} /></> : null}
        {missingProof ? <><span className={`${styles.stateLabel} ${styles.toneProof}`}>Derived missing proof · {missingProof.status}</span><h3>{missingProof.title}</h3><p>This is a derived presentation of canonical evidence state, not a dedicated persisted missing-proof object.</p><dl><dt>Proof sought</dt><dd>{missingProof.statement}</dd><dt>Why it matters</dt><dd>{relationshipItems(missingProof.supportsRequirements).length ? `It blocks or weakens ${relationshipItems(missingProof.supportsRequirements).length} related requirement${relationshipItems(missingProof.supportsRequirements).length === 1 ? "" : "s"}.` : "No blocking requirement relationship is recorded."}</dd><dt>Verification state</dt><dd>{missingProof.status}</dd><dt>Canonical source</dt><dd className={styles.mono}>{missingProof.evidenceId}</dd><dt>Current-head proof</dt><dd>{detail.github.headSha ? "Not verified for the current recorded head" : "Head unavailable; current applicability cannot be proven"}</dd></dl><h4>Blocks or weakens</h4><RelationshipList state={missingProof.supportsRequirements} relation="blocks" provenance="Deterministic derived relationship" onSelect={onSelect} /><h4>Affects findings</h4><RelationshipList state={missingProof.supportsFindings} relation="lacks proof for" provenance="Explicit stored relationship" onSelect={onSelect} /><h4>Affected context</h4><RelationshipList state={missingProof.relatedChanges} relation="affects" provenance="Explicit stored relationship" onSelect={onSelect} /></> : null}
        {requirement ? <><span className={requirement.importance === "blocking" ? `${styles.stateLabel} ${styles.toneBlocking}` : styles.stateLabel}>Requirement · {requirement.importance}</span><h3>{requirement.title}</h3><p>{requirement.statement}</p><dl><dt>Status</dt><dd>{requirement.status}{requirement.stale ? " · stale" : ""}</dd><dt>Required proof</dt><dd>{requirement.evidenceRequired}</dd><dt>Source identifier</dt><dd className={styles.mono}>{requirement.requirementId}</dd></dl><div className={styles.capabilityBox}>{requirement.conditionProgress.kind === "available" ? <><strong>Exact canonical condition</strong><p>Persisted clear/reopen is available. This records condition progress only; it does not prove evidence, record an actor/rationale, acknowledge or waive risk.</p>{conditionConfirmationId === requirement.requirementId ? <div className={styles.inlineConfirmation}><p>Confirm this browser-local condition progress change. The authoritative projection will be read back before success is shown.</p><button type="button" className={styles.secondaryButton} onClick={() => { setConditionConfirmationId(null); void onCondition(requirement); }} disabled={mutationPending}>{mutationPending ? "Saving…" : requirement.conditionProgress.cleared ? "Confirm reopen" : "Confirm clear"}</button><button type="button" className={styles.textButton} onClick={() => setConditionConfirmationId(null)} disabled={mutationPending}>Cancel</button></div> : <button type="button" className={styles.secondaryButton} onClick={() => setConditionConfirmationId(requirement.requirementId)} disabled={mutationPending}>{requirement.conditionProgress.cleared ? "Review reopen condition" : "Review clear condition"}</button>}</> : <><strong>Derived requirement · read-only</strong><p>{requirement.conditionProgress.kind === "read-only" ? requirement.conditionProgress.reason : "Sample data is read-only. Only exact real Conditions before merge support persisted clear/reopen."}</p><p>A writable capability would require an exact persisted canonical condition identity. Acknowledgement and waiver are not supported; accepted risk belongs only to Human Decision.</p></>}</div>{mutationResult ? <p className={mutationResult.outcome === "persisted" || mutationResult.outcome === "unchanged" ? styles.noticeInlineSuccess : styles.noticeInlineError} role="status">{mutationResult.message}</p> : null}<h4>Supporting evidence</h4><RelationshipList state={requirement.supportingEvidence} relation="supported by" provenance="Explicit stored relationship" onSelect={onSelect} /><h4>Source findings</h4><RelationshipList state={requirement.relatedFindings} relation="contributed to by" provenance="Deterministic derived relationship" onSelect={onSelect} /></> : null}
        {change ? <><span className={styles.stateLabel}>Affected file</span><h3 className={styles.mono} title={change.path}>{change.path}</h3><p>{change.focusedRegions.length ? `Exact numeric location is recorded at line ${change.focusedRegions[0].startLine}; source text is not retained.` : "A file relationship is available, but exact line context is not recorded."}</p><dl><dt>Additions</dt><dd>{change.additions ?? "Unknown"}</dd><dt>Deletions</dt><dd>{change.deletions ?? "Unknown"}</dd><dt>Recorded risk</dt><dd>{change.risk ?? "Unknown"}</dd><dt>Raw diff</dt><dd>Unavailable in durable history</dd></dl><h4>Findings</h4><RelationshipList state={change.observations} relation="explained by" provenance="Deterministic derived relationship" onSelect={onSelect} /><h4>Evidence</h4><RelationshipList state={change.evidence} relation="supported by" provenance="Deterministic derived relationship" onSelect={onSelect} /></> : null}
        {run ? <><span className={styles.stateLabel}>Canonical run</span><h3 className={styles.mono}>{run.runId}</h3><dl><dt>Head</dt><dd className={styles.mono}>{run.headSha ?? "Not recorded"}</dd><dt>Base</dt><dd className={styles.mono}>{run.baseSha ?? "Not recorded"}</dd><dt>Analysis</dt><dd>{run.analysisSource}{run.provider ? ` · ${run.provider}` : ""}{run.model ? ` / ${run.model}` : ""}</dd><dt>Reproducibility</dt><dd>{run.reproducibility}</dd><dt>Input fingerprint</dt><dd className={styles.mono}>{run.inputFingerprint}</dd><dt>Configuration fingerprint</dt><dd className={styles.mono}>{run.configurationFingerprint}</dd><dt>Result fingerprint</dt><dd className={styles.mono}>{run.resultFingerprint}</dd></dl>{run.reproducibilityLimitation ? <p className={styles.truthNote}>{run.reproducibilityLimitation}</p> : null}</> : null}
        {historyChange ? <><span className={styles.stateLabel}>Readiness movement · {historyChange.status}</span><h3>{historyChange.title}</h3><dl><dt>Category</dt><dd>{historyChange.category}</dd><dt>Previous</dt><dd>{historyChange.previousState ?? "Not recorded"}</dd><dt>Current</dt><dd>{historyChange.currentState ?? "Not recorded"}</dd><dt>Changed by</dt><dd className={styles.mono}>{activeComparison ? `${activeComparison.target.runId} → ${detail.history?.status === "comparison" ? detail.history.current.runId : "current"}` : "Comparison unavailable"}</dd></dl><p>This is an inspectable Review Diff record. It does not replace the directional Readiness Delta.</p></> : null}
        {decisionEvent ? <><span className={styles.stateLabel}>Human Decision event · historical</span><h3>{decisionEvent.outcome ? OUTCOME_LABEL[decisionEvent.outcome] : decisionEvent.eventType}</h3><dl><dt>Role</dt><dd>{decisionEvent.role}</dd><dt>Actor</dt><dd>{decisionEvent.actor.displayLabel} · {decisionEvent.actor.source}</dd><dt>Recorded</dt><dd>{formatTime(decisionEvent.recordedAt)}</dd><dt>Applicable head</dt><dd className={styles.mono}>{decisionEvent.applicableHeadSha ?? "Not recorded"}</dd><dt>Event identity</dt><dd className={styles.mono}>{decisionEvent.entryId}</dd></dl>{decisionEvent.rationale ? <p>{decisionEvent.rationale}</p> : <p>No rationale is stored on this event.</p>}</> : null}
        {readinessSelected ? <><span className={styles.stateLabel}>Decision readiness · not a decision</span><h3>{openItems.length || gaps.length ? "Human Decision requires unresolved-context review" : decision?.needsReaffirmation ? "Prior Human Decision is stale" : decision ? "Current decision context is available" : "Ready for engineer decision"}</h3><dl><dt>Lintel recommendation</dt><dd>{RECOMMENDATION_LABEL[detail.recommendation]}</dd><dt>Why</dt><dd>{detail.executiveSummary}</dd><dt>Open blockers</dt><dd>{openItems.length}</dd><dt>Missing/unverified proof</dt><dd>{gaps.length}</dd><dt>Stale evidence</dt><dd>{stale}</dd><dt>Current run</dt><dd className={styles.mono}>{detail.run?.runId ?? "Not recorded"}</dd><dt>Current head</dt><dd className={styles.mono}>{detail.github.headSha ?? "Not recorded"}</dd><dt>Prior Human Decision</dt><dd>{decision ? `${OUTCOME_LABEL[decision.outcome]} · ${APPLICABILITY_LABEL[decision.applicability]}` : detail.decision.status === "unavailable" ? "Authority unavailable" : "None recorded"}</dd><dt>What changed</dt><dd>{detail.readiness.available ? detail.readiness.readiness.note : detail.readiness.reason}</dd><dt>New decision applies to</dt><dd>{detail.github.headSha ? <>Current head <span className={styles.mono}>{short(detail.github.headSha, 14)}</span></> : "Unbound review; acknowledgement required"}</dd></dl><div className={styles.handoffList}><div><strong>GitHub App</strong><span>{githubState === "checking" ? "Checking" : githubState === "connected" ? "Connected" : githubState === "available" ? "Available" : "Unavailable"}</span><small>{githubState === "connected" ? "Configured automated analysis comment only; Human Decision is not published through it." : githubState === "available" ? "Implemented capability is not configured for this environment." : githubState === "unavailable" ? "Capability status could not be verified as available." : "Checking real environment status."}</small></div><div><strong>GitHub Action</strong><span>Blueprint</span><small>Does not install, execute, connect or post.</small></div><div><strong>Slack handoff</strong><span>Export-only</span><small>Copies or downloads; it does not send.</small></div></div><div className={styles.nextAction}><span>Next inspection</span><strong>{nextInspection.title}</strong><p>{nextInspection.why}</p>{nextInspection.selection ? <button type="button" onClick={onOpenNext}>Open next inspection</button> : <span>Unavailable in the current projection</span>}</div></> : null}
      </div> : <div className={styles.inspectorCompactContent}><Icon name="inspector" /><span>{selection ? selection.kind : "readiness"}</span></div>}
    </aside>
  );
}

type TraceNode = {
  key: string;
  relation: string;
  label: string;
  detail: string;
  selection: NonNullable<Selection> | null;
  state: "available" | "unavailable" | "none" | "unresolved";
  provenance: string;
};

function relationshipTraceNodes(detail: CaseDetail, selection: Selection): TraceNode[] {
  if (!selection) return [];
  const nodes: TraceNode[] = [];
  const addState = (state: RelationshipState, relation: string, provenance: string) => {
    if (state.status === "linked") {
      for (const item of state.related) nodes.push({ key: `${relation}:${item.kind}:${item.id}`, relation, label: item.label, detail: item.detail ?? item.id, selection: { kind: item.kind, id: item.id }, state: "available", provenance });
      for (const unresolved of state.unresolved) nodes.push({ key: `${relation}:unresolved:${unresolved}`, relation, label: unresolved, detail: "Stored reference does not resolve in this review", selection: null, state: "unresolved", provenance: "Stored unresolved reference" });
    } else if (state.status === "unavailable") nodes.push({ key: `${relation}:unavailable`, relation, label: "Relationship unavailable", detail: state.reason, selection: null, state: "unavailable", provenance: "Unavailable relationship" });
    else if (state.status === "unresolved") for (const unresolved of state.unresolved) nodes.push({ key: `${relation}:unresolved:${unresolved}`, relation, label: unresolved, detail: "Stored reference does not resolve in this review", selection: null, state: "unresolved", provenance: "Stored unresolved reference" });
    else nodes.push({ key: `${relation}:none`, relation, label: "None recorded", detail: "The source records no relationship of this kind.", selection: null, state: "none", provenance: "None recorded" });
  };
  if (selection.kind === "finding") {
    const finding = detail.findings.find((item) => item.findingId === selection.id);
    if (finding) {
      addState(finding.supportingEvidence, "supported by", "Explicit stored relationship");
      for (const related of relationshipItems(finding.supportingEvidence).filter((item) => incompleteEvidence(detail).some((gap) => gap.evidenceId === item.id))) nodes.push({ key: `missing:${related.id}`, relation: "lacks proof for", label: related.label, detail: "Derived from canonical missing/unverified evidence status", selection: { kind: "missing-proof", id: related.id }, state: "available", provenance: "Deterministic derived presentation" });
      addState(finding.relatedRequirements, "contributes to", "Explicit stored relationship");
      addState(finding.affectedChange, "affects", "Deterministic exact-path mapping");
    }
  } else if (selection.kind === "evidence" || selection.kind === "missing-proof") {
    const evidence = detail.evidence.find((item) => item.evidenceId === selection.id);
    if (evidence) {
      addState(evidence.supportsFindings, selection.kind === "missing-proof" ? "lacks proof for" : "supports", "Explicit stored evidence references");
      addState(evidence.supportsRequirements, selection.kind === "missing-proof" ? "blocks" : "contributes to", "Deterministic inverse of requirement evidence references");
      addState(evidence.relatedChanges, "affects", "Explicit exact-path evidence source");
    }
  } else if (selection.kind === "requirement") {
    const requirement = detail.requirements.find((item) => item.requirementId === selection.id);
    if (requirement) {
      addState(requirement.supportingEvidence, "supported by", "Explicit stored requirement evidence references");
      addState(requirement.relatedFindings, "contributed to by", "Deterministic finding-to-requirement mapping");
    }
  } else if (selection.kind === "change") {
    const change = detail.changedFiles.find((item) => item.artifactId === selection.id);
    if (change) {
      addState(change.observations, "changed by", "Deterministic exact-path mapping");
      addState(change.evidence, "supported by", "Deterministic inverse of explicit path references");
    }
  }
  return nodes.slice(0, 10);
}

function InvestigationTrace({ detail, selection, origin, onSelect, onReturn }: { detail: CaseDetail; selection: Selection; origin: OriginContext; onSelect: (selection: Selection) => void; onReturn: () => void }) {
  if (!selection || selection.kind === "decision-readiness") return null;
  const nodes = relationshipTraceNodes(detail, selection);
  function move(event: React.KeyboardEvent<HTMLButtonElement>) {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    const owner = event.currentTarget.closest('[data-trace="true"]');
    const controls = Array.from(owner?.querySelectorAll<HTMLButtonElement>("[data-trace-node]") ?? []);
    const index = controls.indexOf(event.currentTarget);
    if (index < 0) return;
    event.preventDefault();
    controls[Math.min(controls.length - 1, Math.max(0, index + delta))]?.focus();
  }
  return <section className={styles.investigationTrace} aria-label="Investigation relationship trace" data-trace="true">
    <div className={styles.traceHeading}><div><span className={styles.eyebrow}>Investigation trail</span><strong>{selectionLabel(detail, selection)}</strong></div>{origin ? <button type="button" className={styles.contextBack} onClick={onReturn}><Icon name="back" /> {origin.label}</button> : null}</div>
    <div className={styles.traceScroller}>
      <div className={styles.traceCurrent}><span>Current · {selection.kind}</span><strong>{selectionLabel(detail, selection)}</strong></div>
      {nodes.length ? nodes.map((node) => <div className={styles.traceEdge} key={node.key}><span>{node.relation} →</span>{node.selection ? <button type="button" data-trace-node={node.key} onKeyDown={move} onClick={() => onSelect(node.selection)}><strong>{node.label}</strong><small>{node.detail}</small><em>{node.provenance}</em></button> : <div data-state={node.state}><strong>{node.label}</strong><small>{node.detail}</small><em>{node.provenance}</em></div>}</div>) : <div className={styles.traceEmpty}><strong>No adjacent relationship is available.</strong><span>The selected record remains current; no relation is inferred from proximity.</span></div>}
    </div>
  </section>;
}

function NextInspectionCard({ next, onOpen }: { next: NextInspection; onOpen: () => void }) {
  return <section className={styles.nextInspection} aria-labelledby="next-inspection-heading"><div><span className={styles.eyebrow}>Next inspection</span><h2 id="next-inspection-heading">{next.title}</h2><p><strong>Why</strong> {next.why}</p></div>{next.selection ? <button type="button" className={styles.secondaryButton} onClick={onOpen}>Open next inspection</button> : <span className={styles.contextUnavailable}>Unavailable</span>}</section>;
}

type PaletteCommand = { id: string; group: string; label: string; detail: string; keywords?: string; disabled?: boolean; action: () => void };

function CommandPalette({ open, commands, onClose, returnFocusRef }: { open: boolean; commands: PaletteCommand[]; onClose: () => void; returnFocusRef: React.RefObject<HTMLButtonElement | null> }) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const filtered = commands.filter((command) => `${command.label} ${command.detail} ${command.keywords ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const enabled = filtered.filter((command) => !command.disabled);
  const active = enabled.find((command) => command.id === activeId) ?? enabled[0] ?? null;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveId(commands.find((command) => !command.disabled)?.id ?? null);
    const target = returnFocusRef.current;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => { window.cancelAnimationFrame(frame); if (target && document.contains(target)) target.focus(); };
  }, [open, returnFocusRef]);

  if (!open) return null;
  function execute(command: PaletteCommand | null) {
    if (!command || command.disabled) return;
    onClose();
    command.action();
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!enabled.length) return;
      const current = Math.max(0, enabled.findIndex((command) => command.id === active?.id));
      const next = event.key === "ArrowDown" ? Math.min(enabled.length - 1, current + 1) : Math.max(0, current - 1);
      setActiveId(enabled[next].id);
      panelRef.current?.querySelector<HTMLButtonElement>(`[data-command-id="${CSS.escape(enabled[next].id)}"]`)?.focus();
      return;
    }
    if (event.key === "Enter") { event.preventDefault(); execute(active); return; }
    if (event.key !== "Tab") return;
    const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(DRAWER_FOCUSABLE) ?? []).filter((item) => item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  const groups = [...new Set(filtered.map((command) => command.group))];
  return <div className={styles.paletteLayer} onKeyDown={onKeyDown}><button type="button" className={styles.paletteScrim} aria-label="Close command palette" onClick={onClose} /><div ref={panelRef} className={styles.commandPalette} role="dialog" aria-modal="true" aria-label="Workspace command palette"><header><span className={styles.eyebrow}>Workspace commands</span><strong>Go to a record or action</strong><kbd>Esc</kbd></header><label><Icon name="search" /><span className={styles.srOnly}>Search commands</span><input ref={inputRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setActiveId(null); }} placeholder="Search reviews, modes and actions" /></label><div className={styles.commandResults}>{groups.map((group) => <section key={group}><h3>{group}</h3>{filtered.filter((command) => command.group === group).map((command) => <button key={command.id} type="button" data-command-id={command.id} className={active?.id === command.id ? styles.commandActive : styles.commandRow} aria-disabled={command.disabled || undefined} disabled={command.disabled} onFocus={() => !command.disabled && setActiveId(command.id)} onClick={() => execute(command)}><span>{command.label}</span><small>{command.detail}</small></button>)}</section>)}{!filtered.length ? <p>No matching command is available in the current review context.</p> : null}</div></div></div>;
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
  const [origin, setOrigin] = useState<OriginContext>(null);
  const [comparisonRunId, setComparisonRunId] = useState<string | null>(null);
  const [queueCollapsed, setQueueCollapsed] = useState(false);
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("review");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [viewportWidth, setViewportWidth] = useState(1600);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [decisionPending, setDecisionPending] = useState(false);
  const [decisionResult, setDecisionResult] = useState<DecisionMutationResult | null>(null);
  const [mutationPending, setMutationPending] = useState(false);
  const [mutationResult, setMutationResult] = useState<MutationResult | null>(null);
  const [githubState, setGithubState] = useState<GitHubState>("checking");
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const decisionTriggerRef = useRef<HTMLElement | null>(null);
  const paletteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const queueTriggerRef = useRef<HTMLButtonElement | null>(null);
  const inspectorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const queueDrawerRef = useRef<HTMLDivElement | null>(null);
  const inspectorDrawerRef = useRef<HTMLDivElement | null>(null);
  const workspaceRootRef = useRef<HTMLDivElement | null>(null);
  const workspaceScrollRef = useRef<HTMLDivElement | null>(null);
  const modeScrollPositions = useRef(new Map<string, number>());
  const preFocusPanels = useRef({ queueCollapsed: false, inspectorOpen: true });
  const initialResponsive = useRef(false);

  const announce = useCallback((message: string, urgent = false) => {
    if (urgent) { setAssertive(""); window.requestAnimationFrame(() => setAssertive(message)); }
    else { setPolite(""); window.requestAnimationFrame(() => setPolite(message)); }
  }, []);

  const cases = useMemo(() => new Map(snapshot.cases.map((item) => [item.caseId, item])), [snapshot.cases]);
  const titles = useMemo(() => titleMap(snapshot), [snapshot]);
  const activeCase = cases.get(selectedCaseId) ?? cases.get(snapshot.defaultCaseId) ?? snapshot.cases[0];
  const activeTitle = titles.get(activeCase.caseId) ?? "Stored review";
  const inspectorDrawerActive = (viewportWidth < 1360 || focusMode) && inspectorOpen;
  const nextInspection = useMemo(() => deriveNextInspection(activeCase), [activeCase]);

  const scrollKey = useCallback((caseId: string, targetMode: Mode) => `${caseId}:${targetMode}`, []);
  const rememberScroll = useCallback(() => {
    if (workspaceScrollRef.current) modeScrollPositions.current.set(scrollKey(activeCase.caseId, mode), workspaceScrollRef.current.scrollTop);
  }, [activeCase.caseId, mode, scrollKey]);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (workspaceScrollRef.current) workspaceScrollRef.current.scrollTop = modeScrollPositions.current.get(scrollKey(activeCase.caseId, mode)) ?? 0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeCase.caseId, mode, scrollKey]);

  useEffect(() => {
    if (cases.has(selectedCaseId)) return;
    setSelectedCaseId(snapshot.defaultCaseId);
    setSelection(null);
    setOrigin(null);
    announce("The selected review is no longer available. The default surviving review is now selected.", true);
  }, [announce, cases, selectedCaseId, snapshot.defaultCaseId]);

  useEffect(() => {
    if (selectionExists(activeCase, selection)) return;
    const removed = selection ? selectionLabel(activeCase, selection) : "record";
    setSelection(null);
    setOrigin(null);
    announce(`${removed} is no longer present after the authoritative refresh. Selection was cleared.`, true);
  }, [activeCase, announce, selection]);

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
        event.stopPropagation();
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

  function selectReview(id: string) {
    const next = cases.get(id);
    if (!next) return;
    rememberScroll();
    const rememberedMode = modeScrollPositions.current.has(scrollKey(id, mode)) ? mode : "overview";
    setSelectedCaseId(id); setMode(rememberedMode); setSelection(null); setOrigin(null); setComparisonRunId(next.history?.status === "comparison" ? next.history.previous.runId : null); setMutationResult(null); setDecisionResult(null); setQueueDrawerOpen(false); setMobileView("review");
    announce(`${next.github.repository}, PR ${next.github.pullRequestNumber}, ${titles.get(id) ?? "stored review"}, ${RECOMMENDATION_LABEL[next.recommendation]}.`);
  }

  function selectObject(next: Selection, retainOrigin = false) {
    if (!next) { setSelection(null); setOrigin(null); setMobileView("review"); return; }
    if (retainOrigin && selection && (selection.kind !== next.kind || selection.id !== next.id)) {
      setOrigin({ selection, mode, scrollTop: workspaceScrollRef.current?.scrollTop ?? 0, label: `Back to ${selection.kind === "history-change" ? "readiness change" : selection.kind}` });
    } else if (!retainOrigin) {
      setOrigin(null);
    }
    const targetMode = selectionMode(next);
    if (targetMode !== mode) rememberScroll();
    setMode(targetMode);
    setSelection(next);
    setInspectorOpen(viewportWidth >= 640);
    if (viewportWidth < 640 && next) setMobileView("record");
    announce(`${next.kind}, ${selectionLabel(activeCase, next)}, selected in ${MODES.find((item) => item.id === targetMode)?.label ?? targetMode}.`);
  }

  function selectRelated(next: Selection) {
    selectObject(next, true);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    rememberScroll();
    setMode(next); setMobileView("review");
    announce(`${MODES.find((item) => item.id === next)?.label ?? next} mode. ${selection ? `${selection.kind} selection retained.` : "No primary record selected."}`);
  }

  function returnToOrigin() {
    if (!origin) return;
    modeScrollPositions.current.set(scrollKey(activeCase.caseId, origin.mode), origin.scrollTop);
    setMode(origin.mode);
    setSelection(origin.selection);
    setOrigin(null);
    setInspectorOpen(viewportWidth >= 640);
    if (viewportWidth < 640) setMobileView("record");
    announce(`Returned to ${origin.selection.kind}, ${selectionLabel(activeCase, origin.selection)}.`);
  }

  function openNextInspection() {
    if (!nextInspection.selection) { announce(nextInspection.why); return; }
    selectObject(nextInspection.selection);
  }

  function compareRun(runId: string) {
    rememberScroll();
    setComparisonRunId(runId);
    setMode("history");
    setSelection({ kind: "run", id: runId });
    announce(`Current run compared with ${runId}.`);
  }

  function enterFocusMode() {
    preFocusPanels.current = { queueCollapsed, inspectorOpen };
    setFocusMode(true);
    setQueueDrawerOpen(false);
    setInspectorOpen(false);
    announce("Focus mode entered. Queue and Inspector are available on demand.");
  }

  function exitFocusMode() {
    setFocusMode(false);
    setQueueCollapsed(preFocusPanels.current.queueCollapsed);
    setInspectorOpen(preFocusPanels.current.inspectorOpen);
    setQueueDrawerOpen(false);
    announce("Focus mode exited. Prior Queue and Inspector preferences restored.");
  }

  function showInspectorContext() {
    if (viewportWidth < 640) {
      if (selection) setMobileView("record");
      else selectObject({ kind: "decision-readiness", id: "decision-readiness" });
      return;
    }
    setInspectorOpen(true);
  }

  function toggleInspectorContext() {
    if (viewportWidth < 640) {
      if (mobileView === "record") setMobileView("review");
      else showInspectorContext();
      return;
    }
    setInspectorOpen((value) => !value);
  }

  function copyTechnicalIdentifier() {
    const identifier = selection?.id ?? activeCase.run?.runId ?? activeCase.caseId;
    void navigator.clipboard.writeText(identifier).then(() => announce(`Copied technical identifier ${identifier}.`)).catch(() => announce("The technical identifier could not be copied.", true));
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

  function showDecision(trigger: HTMLElement | null) {
    decisionTriggerRef.current = trigger;
    setDecisionResult(null); setDialogOpen(true);
  }

  function openDecision(event: React.MouseEvent<HTMLElement>) {
    showDecision(event.currentTarget);
  }

  function handleModeKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const current = MODES.findIndex((item) => item.id === event.currentTarget.dataset.modeId);
    if (current < 0) return;
    const nextIndex = event.key === "ArrowRight" ? Math.min(MODES.length - 1, current + 1) : event.key === "ArrowLeft" ? Math.max(0, current - 1) : event.key === "Home" ? 0 : event.key === "End" ? MODES.length - 1 : -1;
    if (nextIndex < 0) return;
    event.preventDefault();
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-mode-id="${MODES[nextIndex].id}"]`)?.focus();
  }

  const decision = activeCase.decision;
  const decisionText = decision.status === "recorded" ? `${OUTCOME_LABEL[decision.outcome]} · ${APPLICABILITY_LABEL[decision.applicability]}` : decision.status === "unavailable" ? "Human Decision unavailable" : "Human Decision pending";
  const blockers = blockingRequirements(activeCase);
  const gaps = incompleteEvidence(activeCase);
  const inspectorVisible = viewportWidth < 640 ? mobileView === "record" : inspectorOpen;
  const traceCommands = relationshipTraceNodes(activeCase, selection).filter((item) => item.selection).slice(0, 8);
  const historyComparisons = activeCase.history?.status === "comparison" ? activeCase.history.comparisons ?? [{ target: activeCase.history.previous, readiness: activeCase.history.readiness, changes: activeCase.history.changes, limitation: activeCase.history.limitation }] : [];
  const currentRequirement = selection?.kind === "requirement" ? activeCase.requirements.find((item) => item.requirementId === selection.id) : blockers[0];
  const paletteCommands: PaletteCommand[] = [
    ...MODES.map((item) => ({ id: `mode-${item.id}`, group: "Workspace modes", label: `Open ${item.label}`, detail: item.shortcut ? `Shortcut ${item.shortcut}` : "Switch mode", action: () => switchMode(item.id) })),
    { id: "panel-queue", group: "Workspace layout", label: queueDrawerOpen ? "Close Review Queue" : "Open Review Queue", detail: focusMode ? "Opens above Focus mode" : "Preserves Workspace position", action: () => setQueueDrawerOpen((value) => !value) },
    { id: "panel-inspector", group: "Workspace layout", label: inspectorVisible ? "Hide Inspector" : "Show Inspector", detail: selection ? `Current ${selection.kind} context is retained` : "Decision-readiness context", action: toggleInspectorContext },
    { id: "layout-focus", group: "Workspace layout", label: focusMode ? "Exit Focus mode" : "Enter Focus mode", detail: focusMode ? "Restore prior Queue and Inspector preferences" : "Keep the selected review, mode and record", action: () => focusMode ? exitFocusMode() : enterFocusMode() },
    ...snapshot.groups.flatMap((group) => group.cases.map((item) => ({ id: `review-${item.caseId}`, group: "Reviews", label: `${item.repository} · PR #${item.pullRequestNumber}`, detail: item.title, keywords: `${group.label} ${item.caseId}`, action: () => selectReview(item.caseId) }))),
    ...(nextInspection.selection ? [{ id: "next-inspection", group: "Investigation", label: `Open next inspection: ${nextInspection.title}`, detail: nextInspection.why, action: openNextInspection }] : [{ id: "next-inspection-unavailable", group: "Investigation", label: "Next inspection unavailable", detail: nextInspection.why, disabled: true, action: () => undefined }]),
    ...(selection?.kind === "finding" ? [{ id: "selected-finding", group: "Investigation", label: "Open selected finding", detail: selectionLabel(activeCase, selection), action: () => selectObject(selection) }] : []),
    ...(currentRequirement ? [{ id: "current-requirement", group: "Investigation", label: "Open current requirement", detail: currentRequirement.title, action: () => selectObject({ kind: "requirement", id: currentRequirement.requirementId }) }] : []),
    ...traceCommands.map((node) => ({ id: `related-${node.key}`, group: "Related records", label: `${node.relation}: ${node.label}`, detail: node.provenance, action: () => selectRelated(node.selection) })),
    ...(origin ? [{ id: "return-origin", group: "Investigation", label: origin.label, detail: selectionLabel(activeCase, origin.selection), action: returnToOrigin }] : []),
    { id: "decision-readiness", group: "Decision", label: "Review decision readiness", detail: `${blockers.length} blockers · ${gaps.length} missing/unverified · ${decisionText}`, action: () => selectObject({ kind: "decision-readiness", id: "decision-readiness" }) },
    { id: "human-decision", group: "Decision", label: snapshot.provenance.isSample ? "Preview Human Decision" : "Open Human Decision", detail: "All seven outcomes remain unselected", action: () => showDecision(paletteTriggerRef.current) },
    ...historyComparisons.map((comparison) => ({ id: `compare-${comparison.target.runId}`, group: "History", label: `Compare with ${comparison.target.runId}`, detail: comparison.target.runId === (activeCase.history?.status === "comparison" ? activeCase.history.previous.runId : "") ? "Immediately previous applicable run" : "Compatible stored run", action: () => compareRun(comparison.target.runId) })),
    ...(historyComparisons.length ? [] : [{ id: "compare-unavailable", group: "History", label: "Run comparison unavailable", detail: activeCase.history?.status === "unavailable" ? activeCase.history.reason : "No compatible prior run is stored.", disabled: true, action: () => undefined }]),
    { id: "copy-identifier", group: "Utilities", label: "Copy technical identifier", detail: selection?.id ?? activeCase.run?.runId ?? activeCase.caseId, action: copyTechnicalIdentifier },
    { id: "keyboard-help", group: "Utilities", label: "Keyboard guide", detail: "Arrows move composite records · Enter/Space open · Esc returns · Ctrl/⌘ K opens this palette", disabled: true, action: () => undefined },
  ];

  useEffect(() => {
    function handleWorkspaceKey(event: KeyboardEvent) {
      if (dialogOpen || paletteOpen) return;
      const target = event.target as HTMLElement | null;
      const typing = Boolean(target?.closest('input, textarea, select, [contenteditable="true"]'));
      const inside = workspaceRootRef.current?.contains(document.activeElement) || document.activeElement === document.body;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        if (typing || !inside) return;
        event.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (typing || !inside) return;
      if (event.key === "Escape") {
        if (queueDrawerOpen) { event.preventDefault(); setQueueDrawerOpen(false); queueTriggerRef.current?.focus(); return; }
        if (inspectorDrawerActive) { event.preventDefault(); setInspectorOpen(false); inspectorTriggerRef.current?.focus(); return; }
        if (origin) { event.preventDefault(); returnToOrigin(); return; }
        if (selection) { event.preventDefault(); setSelection(null); setMobileView("review"); announce("Primary record selection cleared."); return; }
        if (focusMode) { event.preventDefault(); exitFocusMode(); }
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const key = event.key.toLowerCase();
      if (["e", "r", "h"].includes(key)) { event.preventDefault(); switchMode(key === "e" ? "evidence" : key === "r" ? "requirements" : "history"); }
      else if (key === "d") { event.preventDefault(); selectObject({ kind: "decision-readiness", id: "decision-readiness" }); }
      else if (event.key === "[") { event.preventDefault(); if (viewportWidth < 1280 || focusMode) setQueueDrawerOpen((value) => !value); else setQueueCollapsed((value) => !value); }
      else if (event.key === "]") { event.preventDefault(); toggleInspectorContext(); }
    }
    window.addEventListener("keydown", handleWorkspaceKey);
    return () => window.removeEventListener("keydown", handleWorkspaceKey);
  }, [activeCase.caseId, announce, dialogOpen, focusMode, inspectorDrawerActive, mobileView, mode, origin, paletteOpen, queueDrawerOpen, selection, viewportWidth]);
  return (
    <div ref={workspaceRootRef} className={styles.page} data-queue-collapsed={queueCollapsed ? "true" : "false"} data-queue-drawer={queueDrawerOpen ? "open" : "closed"} data-inspector-open={inspectorOpen ? "true" : "false"} data-inspector-drawer={inspectorDrawerActive ? "open" : "closed"} data-focus-mode={focusMode ? "true" : "false"} data-mobile-view={mobileView}>
      <a className={styles.skipLink} href="#workspace-primary">Skip to Workspace</a><a className={styles.skipQueue} href="#review-queue">Skip to review queue</a>
      <div className={styles.mobileBar}><button type="button" className={styles.iconButton} onClick={() => setQueueDrawerOpen(true)} aria-label="Open review list"><Icon name="queue" /></button><strong>Reviews</strong><span>{activeCase.github.repository} · #{activeCase.github.pullRequestNumber}</span></div>
      <div className={styles.shell} inert={dialogOpen || paletteOpen ? true : undefined} aria-hidden={dialogOpen || paletteOpen ? true : undefined}>
        <Rail />
        <div className={styles.queueStrip}><button ref={queueTriggerRef} type="button" onClick={() => setQueueDrawerOpen(true)} aria-label="Open review queue"><Icon name="queue" /><strong>{activeCase.github.pullRequestNumber}</strong><span>{blockers.length}B</span></button></div>
        <div ref={queueDrawerRef} className={styles.queueAnchor}><ReviewQueue snapshot={snapshot} selectedId={activeCase.caseId} collapsedGroups={collapsedGroups} onToggleGroup={(id) => setCollapsedGroups((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} onSelect={selectReview} onClose={() => { setQueueDrawerOpen(false); queueTriggerRef.current?.focus(); }} /></div>
        <main className={styles.workspace} id="workspace-primary" tabIndex={-1}>
          <header className={styles.workspaceHeader}>
            <div className={styles.workspaceIdentity}><div><span className={styles.eyebrow}>Selected review · {snapshot.provenance.isSample ? "read-only sample" : "browser-local report"}</span><span className={styles.repoLine}>{activeCase.github.repository} · PR #{activeCase.github.pullRequestNumber}</span><h1 title={activeTitle}>{activeTitle}</h1></div><div className={styles.workspaceControls}><button ref={paletteTriggerRef} type="button" className={styles.commandTrigger} onClick={() => setPaletteOpen(true)} aria-label="Open Workspace command palette"><Icon name="search" /><span>Commands</span><kbd>Ctrl K</kbd></button><button type="button" className={styles.iconButton} onClick={() => { if (viewportWidth < 1280 || focusMode) setQueueDrawerOpen(true); else setQueueCollapsed((value) => !value); }} aria-label={queueDrawerOpen ? "Close review queue" : "Open review queue"} title="Review queue"><Icon name="queue" /></button><button ref={inspectorTriggerRef} type="button" className={styles.iconButton} onClick={toggleInspectorContext} aria-label={viewportWidth < 640 ? mobileView === "record" ? "Close Contextual Inspector" : "Open Contextual Inspector" : inspectorOpen ? "Collapse Contextual Inspector" : "Open Contextual Inspector"} title="Contextual Inspector"><Icon name="inspector" /></button><button type="button" className={styles.iconButton} onClick={() => focusMode ? exitFocusMode() : enterFocusMode()} aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"} title="Focus mode"><Icon name="focus" /></button></div></div>
            <div className={styles.verdictBand}><Meta label="Lintel recommendation"><span className={recommendationClass(activeCase.recommendation)}>{RECOMMENDATION_LABEL[activeCase.recommendation]}</span></Meta><Meta label="Risk"><span className={riskClass(activeCase.riskLevel)}>{activeCase.riskScore}/100 {activeCase.riskLevel}</span></Meta><Meta label="Requirements"><span className={blockers.length ? styles.toneBlocking : styles.toneCleared}>{openRequirements(activeCase).length} open · {blockers.length} blocking</span></Meta><Meta label="Human Decision">{decisionText}</Meta></div>
            <div className={styles.technicalLine}><span className={styles.sourceBadge}>{snapshot.provenance.label}{snapshot.provenance.isSample ? " · explicit fixture" : " · stored on this device"}</span><span className={styles.mono} title={activeCase.run?.runId ?? "Run not recorded"}>Run {short(activeCase.run?.runId, 20)}</span><span className={styles.mono} title={activeCase.github.headSha ?? "Head not recorded"}>Head {short(activeCase.github.headSha, 14)}</span><span className={styles.mono} title={activeCase.github.branch}>Branch {activeCase.github.branch}</span></div>
            {focusMode ? <div className={styles.focusBar}><span>Focus mode</span><strong>{activeCase.github.repository} · #{activeCase.github.pullRequestNumber}</strong><span>{MODES.find((item) => item.id === mode)?.label} · {selection ? selectionLabel(activeCase, selection) : "No record selected"} · {decisionText}</span><div><button type="button" onClick={() => setQueueDrawerOpen(true)}>Show Queue</button><button type="button" onClick={showInspectorContext}>Show Inspector</button><button type="button" onClick={() => setPaletteOpen(true)}>Commands</button><button type="button" onClick={exitFocusMode}>Exit focus mode</button></div></div> : null}
            <nav className={styles.modeNav} aria-label="Workspace modes" role="tablist">{MODES.map((item) => <button key={item.id} type="button" role="tab" data-mode-id={item.id} className={mode === item.id ? styles.modeActive : styles.modeButton} aria-selected={mode === item.id} tabIndex={mode === item.id ? 0 : -1} onKeyDown={handleModeKeyDown} onClick={() => switchMode(item.id)}>{item.label}{item.shortcut ? <kbd>{item.shortcut}</kbd> : null}</button>)}</nav>
          </header>
          <div className={styles.workspaceScroll} ref={workspaceScrollRef}>
            <NextInspectionCard next={nextInspection} onOpen={openNextInspection} />
            <InvestigationTrace detail={activeCase} selection={selection} origin={origin} onSelect={selectRelated} onReturn={returnToOrigin} />
            {mode === "overview" ? <Overview detail={activeCase} onSelect={selectObject} onMode={switchMode} /> : null}
            {mode === "change" ? <ChangeMode detail={activeCase} selection={selection} onSelect={selectObject} onRelated={selectRelated} /> : null}
            {mode === "evidence" ? <EvidenceMode detail={activeCase} selection={selection} onSelect={selectObject} /> : null}
            {mode === "requirements" ? <RequirementsMode detail={activeCase} selection={selection} onSelect={selectObject} /> : null}
            {mode === "history" ? <HistoryMode detail={activeCase} selection={selection} comparisonRunId={comparisonRunId} onCompare={compareRun} onSelect={selectObject} /> : null}
          </div>
          <div className={styles.readinessBar}><div><span className={blockers.length ? styles.readinessDotBlocking : styles.readinessDotReady} /><strong>{blockers.length || gaps.length ? "Merge readiness blocked" : "Merge recommendation ready for assessment"}</strong></div><span>{blockers.length} blockers · {gaps.length} missing/unverified · {activeCase.evidence.filter((item) => item.stale).length} stale</span><button type="button" className={styles.readinessContextButton} onClick={() => selectObject({ kind: "decision-readiness", id: "decision-readiness" })}>Review decision context · {decisionText}</button><button type="button" className={styles.primaryButton} onClick={openDecision}>{snapshot.provenance.isSample ? "Preview decision flow" : "Record Human Decision"}</button></div>
        </main>
        <div ref={inspectorDrawerRef} className={styles.inspectorAnchor}><Inspector detail={activeCase} selection={selection} origin={origin} comparisonRunId={comparisonRunId} nextInspection={nextInspection} open={inspectorOpen} githubState={githubState} mutationPending={mutationPending} mutationResult={mutationResult} onClose={() => { setInspectorOpen(false); window.requestAnimationFrame(() => inspectorTriggerRef.current?.focus()); }} onSelect={selectRelated} onReturn={returnToOrigin} onOpenNext={openNextInspection} onCondition={applyCondition} /></div>
        {mobileView === "record" && selection ? <div className={styles.mobileRecord}><button type="button" className={styles.backButton} onClick={() => { setMobileView("review"); setInspectorOpen(false); }}><Icon name="back" /> Back to {mode}</button><Inspector detail={activeCase} selection={selection} origin={origin} comparisonRunId={comparisonRunId} nextInspection={nextInspection} open githubState={githubState} mutationPending={mutationPending} mutationResult={mutationResult} onClose={() => setMobileView("review")} onSelect={selectRelated} onReturn={returnToOrigin} onOpenNext={openNextInspection} onCondition={applyCondition} /></div> : null}
        {queueDrawerOpen || inspectorDrawerActive ? <button type="button" className={styles.drawerScrim} aria-label={queueDrawerOpen ? "Close review queue" : "Close Contextual Inspector"} onClick={() => { if (queueDrawerOpen) { setQueueDrawerOpen(false); queueTriggerRef.current?.focus(); } else { setInspectorOpen(false); inspectorTriggerRef.current?.focus(); } }} /> : null}
      </div>
      <CommandPalette open={paletteOpen} commands={paletteCommands} onClose={() => setPaletteOpen(false)} returnFocusRef={paletteTriggerRef} />
      <HumanDecisionDialog open={dialogOpen} detail={activeCase} title={activeTitle} pending={decisionPending} result={decisionResult} onSubmit={submitDecision} onClose={() => setDialogOpen(false)} onReload={reloadContext} returnFocusRef={decisionTriggerRef} readOnlyReason={snapshot.provenance.isSample ? "The explicit fixture source is read-only. Use a real browser-local report to record an authoritative Human Decision." : null} />
      <div className={styles.livePolite} aria-live="polite" aria-atomic="true">{polite}</div><div className={styles.liveAssertive} role="alert" aria-atomic="true">{assertive}</div>
    </div>
  );
}
