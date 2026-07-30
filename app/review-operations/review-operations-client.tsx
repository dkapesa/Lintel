"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  OPERATIONAL_VIEW_IDS,
  OPERATIONAL_VIEW_LABEL,
  compareOperationalRecords,
  recordMatchesOperationalView,
  type OperationalAnalysis,
  type OperationalDemoMode,
  type OperationalDecisionState,
  type OperationalReviewRecord,
  type OperationalSortId,
  type OperationalSource,
  type OperationalViewId,
} from "../../lib/operational-review-projection";
import AppShell from "../app-shell";
import styles from "../operational.module.css";
import {
  DecisionState,
  DemoBoundary,
  formatOperationalTimestamp,
  LocalBoundary,
  OperationalViews,
  ProjectionLimitations,
  RecommendationState,
  RiskState,
  SelectedRecordSummary,
} from "../operational-ui";
import { useOperationalProjection } from "../use-operational-projection";

const SORT_IDS = new Set<OperationalSortId>([
  "recent",
  "oldest",
  "risk-high",
  "risk-low",
  "blockers",
  "title",
  "repository",
  "decision",
]);

const SORT_LABEL: Record<OperationalSortId, string> = {
  recent: "Most recently recorded",
  oldest: "Oldest recorded",
  "risk-high": "Highest risk",
  "risk-low": "Lowest risk",
  blockers: "Most blockers",
  title: "Review title",
  repository: "Repository / PR",
  decision: "Human Decision state",
};

type ProofFilter = "all" | "missing" | "complete";
type BlockerFilter = "all" | "present" | "none";
type DecisionFilter = "all" | OperationalDecisionState["kind"];

const PROOF_FILTERS = new Set<ProofFilter>(["all", "missing", "complete"]);
const BLOCKER_FILTERS = new Set<BlockerFilter>(["all", "present", "none"]);
const DECISION_FILTERS = new Set<DecisionFilter>([
  "all",
  "none",
  "applicable",
  "stale",
  "unavailable",
]);

function demoModeFromQuery(value: string | null): OperationalDemoMode {
  if (value === "1") return "records";
  if (value === "empty") return "empty";
  return "none";
}

function enumValue<T extends string>(value: string | null, allowed: Set<T>, fallback: T): T {
  return value && allowed.has(value as T) ? value as T : fallback;
}

function parseView(value: string | null): OperationalViewId {
  return value && (OPERATIONAL_VIEW_IDS as readonly string[]).includes(value)
    ? value as OperationalViewId
    : "all";
}

function parseSort(value: string | null): OperationalSortId {
  return enumValue(value, SORT_IDS, "recent");
}

function uniqueValues<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right)) as T[];
}

function useCompactFilters() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1199px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return compact;
}

function isolateDialogBackground(dialog: HTMLElement) {
  const changed: Array<{ element: HTMLElement; inert: boolean }> = [];
  let current: HTMLElement | null = dialog;
  while (current?.parentElement) {
    const parentElement: HTMLElement = current.parentElement;
    for (const sibling of Array.from(parentElement.children)) {
      if (!(sibling instanceof HTMLElement) || sibling === current || sibling.hasAttribute("data-modal-scrim")) continue;
      changed.push({ element: sibling, inert: sibling.inert });
      sibling.inert = true;
    }
    current = parentElement;
    if (parentElement === document.body) break;
  }
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    for (const { element, inert } of changed) element.inert = inert;
    document.body.style.overflow = previousOverflow;
  };
}

function useFilterDialog(
  open: boolean,
  compact: boolean,
  onClose: () => void,
  dialogRef: RefObject<HTMLDivElement | null>,
  triggerRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!open || !compact) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const restoreBackground = isolateDialogBackground(dialog);
    const focusableSelector =
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
    const frame = window.requestAnimationFrame(() => {
      dialog.querySelector<HTMLElement>(focusableSelector)?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      restoreBackground();
      triggerRef.current?.focus();
    };
  }, [compact, dialogRef, onClose, open, triggerRef]);
}

function sortAria(
  sort: OperationalSortId,
  column: "title" | "repository" | "risk" | "blockers" | "decision" | "updated",
): "ascending" | "descending" | "none" {
  if (column === "title" && sort === "title") return "ascending";
  if (column === "repository" && sort === "repository") return "ascending";
  if (column === "risk" && sort === "risk-high") return "descending";
  if (column === "risk" && sort === "risk-low") return "ascending";
  if (column === "blockers" && sort === "blockers") return "descending";
  if (column === "decision" && sort === "decision") return "ascending";
  if (column === "updated" && sort === "recent") return "descending";
  if (column === "updated" && sort === "oldest") return "ascending";
  return "none";
}

export default function ReviewOperationsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const demoMode = demoModeFromQuery(searchParams.get("demo"));
  const demo = demoMode !== "none";
  const [retrySignal, setRetrySignal] = useState(0);
  const state = useOperationalProjection(demoMode, retrySignal);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const compactFilters = useCompactFilters();
  const filterDialogRef = useRef<HTMLDivElement | null>(null);
  const filterTriggerRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const queryUpdateRef = useRef<number | null>(null);

  const view = parseView(searchParams.get("view"));
  const sort = parseSort(searchParams.get("sort"));
  const queryParam = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryParam);
  const recommendation = searchParams.get("recommendation") ?? "all";
  const risk = searchParams.get("risk") ?? "all";
  const blockers = enumValue(searchParams.get("blockers"), BLOCKER_FILTERS, "all");
  const proof = enumValue(searchParams.get("proof"), PROOF_FILTERS, "all");
  const decision = enumValue(searchParams.get("decision"), DECISION_FILTERS, "all");
  const source = searchParams.get("source") ?? "all";
  const analysis = searchParams.get("analysis") ?? "all";
  const requestedId = searchParams.get("selected");

  const closeFilters = () => setFiltersOpen(false);
  useFilterDialog(filtersOpen, compactFilters, closeFilters, filterDialogRef, filterTriggerRef);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => () => {
    if (queryUpdateRef.current) window.clearTimeout(queryUpdateRef.current);
  }, []);

  const projection = state.kind === "resolved" ? state.projection : null;
  const records = projection?.status === "ready" ? projection.records : [];
  const recommendations = useMemo(
    () => uniqueValues(records.map((record) => record.recommendation)),
    [records],
  );
  const risks = useMemo(() => uniqueValues(records.map((record) => record.riskLevel)), [records]);
  const sources = useMemo(() => uniqueValues(records.map((record) => record.source)), [records]);
  const analyses = useMemo(() => uniqueValues(records.map((record) => record.analysis)), [records]);

  const currentRecommendation = recommendation === "all" || recommendations.includes(recommendation as OperationalReviewRecord["recommendation"])
    ? recommendation
    : "all";
  const currentRisk = risk === "all" || risks.includes(risk as OperationalReviewRecord["riskLevel"])
    ? risk
    : "all";
  const currentSource = source === "all" || sources.includes(source as OperationalSource) ? source : "all";
  const currentAnalysis = analysis === "all" || analyses.includes(analysis as OperationalAnalysis) ? analysis : "all";

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en-GB");
    return records
      .filter((record) => recordMatchesOperationalView(record, view))
      .filter((record) => !normalizedQuery || record.searchText.includes(normalizedQuery))
      .filter((record) => currentRecommendation === "all" || record.recommendation === currentRecommendation)
      .filter((record) => currentRisk === "all" || record.riskLevel === currentRisk)
      .filter((record) => blockers === "all" || (blockers === "present" ? record.blockerCount > 0 : record.blockerCount === 0))
      .filter((record) => proof === "all" || (proof === "missing" ? record.missingProofCount > 0 : record.missingProofCount === 0))
      .filter((record) => decision === "all" || record.decision.kind === decision)
      .filter((record) => currentSource === "all" || record.source === currentSource)
      .filter((record) => currentAnalysis === "all" || record.analysis === currentAnalysis)
      .sort(compareOperationalRecords(sort));
  }, [
    analysis,
    blockers,
    currentAnalysis,
    currentRecommendation,
    currentRisk,
    currentSource,
    decision,
    proof,
    query,
    records,
    sort,
    view,
  ]);

  const selected = requestedId
    ? records.find((record) => record.reportId === requestedId) ?? null
    : null;

  function updateQuery(
    updates: Record<string, string | null>,
    navigation: "push" | "replace" = "push",
  ) {
    const next = new URLSearchParams(searchParams.toString());
    if (!Object.prototype.hasOwnProperty.call(updates, "q")) {
      if (query.trim()) next.set("q", query);
      else next.delete("q");
    }
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all" || (key === "sort" && value === "recent")) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    const href = `${pathname}${next.size ? `?${next.toString()}` : ""}`;
    if (navigation === "replace") {
      router.replace(href, { scroll: false });
    } else {
      router.push(href, { scroll: false });
    }
  }

  function updateSearchQuery(value: string) {
    setQuery(value);
    if (queryUpdateRef.current) window.clearTimeout(queryUpdateRef.current);
    queryUpdateRef.current = window.setTimeout(() => {
      queryUpdateRef.current = null;
      updateQuery({ q: value || null, selected: null }, "replace");
    }, 150);
  }

  function clearSelection() {
    updateQuery({ selected: null }, "push");
  }

  function resetFilters() {
    if (queryUpdateRef.current) {
      window.clearTimeout(queryUpdateRef.current);
      queryUpdateRef.current = null;
    }
    setQuery("");
    updateQuery({
      q: null,
      recommendation: null,
      risk: null,
      blockers: null,
      proof: null,
      decision: null,
      source: null,
      analysis: null,
      sort: null,
      selected: null,
    });
    setFiltersOpen(false);
    window.requestAnimationFrame(() => {
      if (!compactFilters) searchInputRef.current?.focus();
    });
  }

  const filtersActive =
    query.trim().length > 0 ||
    currentRecommendation !== "all" ||
    currentRisk !== "all" ||
    blockers !== "all" ||
    proof !== "all" ||
    decision !== "all" ||
    currentSource !== "all" ||
    currentAnalysis !== "all" ||
    sort !== "recent";

  useEffect(() => {
    if (!requestedId || !selected) return;
    if (filtered.some((record) => record.reportId === requestedId)) return;
    const next = new URLSearchParams(searchParams.toString());
    if (query.trim()) next.set("q", query);
    else next.delete("q");
    next.delete("selected");
    setSelectionAnnouncement("The selected record was cleared because it is outside the current view or filters.");
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
  }, [filtered, pathname, query, requestedId, router, searchParams, selected]);

  function sortFromHeader(column: "title" | "repository" | "risk" | "blockers" | "decision" | "updated") {
    const next: OperationalSortId =
      column === "title"
        ? "title"
        : column === "repository"
          ? "repository"
          : column === "risk"
            ? sort === "risk-high" ? "risk-low" : "risk-high"
            : column === "blockers"
              ? "blockers"
              : column === "decision"
                ? "decision"
                : sort === "recent" ? "oldest" : "recent";
    updateQuery({ sort: next });
  }

  return (
    <AppShell>
      <div
        className={styles.page}
        data-review-operations
        data-selection-open={requestedId ? "true" : "false"}
      >
        <header className={styles.operationsHeader}>
          <div>
            <span className={styles.eyebrow}>Cross-review engineering records</span>
            <h1>Inspect review records</h1>
            <p>
              Search, filter, compare and route across browser-local reviews without duplicating
              the selected-review Workspace Queue.
            </p>
          </div>
          <a className={styles.primaryAction} href="/new">New Review</a>
        </header>

        {demo && <DemoBoundary empty={demoMode === "empty"} />}

        {state.kind === "loading" && (
          <section className={styles.statePanel} aria-labelledby="operations-loading-title">
            <span className={styles.stateKicker}>Canonical projection</span>
            <h2 id="operations-loading-title">Reading browser-local review records</h2>
            <p>Counts and rows are withheld until the current projection resolves.</p>
          </section>
        )}

        {projection?.status === "unavailable" && (
          <section className={styles.statePanel} aria-labelledby="operations-unavailable-title">
            <span className={styles.stateKicker}>Storage unavailable</span>
            <h2 id="operations-unavailable-title">Report history cannot be read</h2>
            <p>{projection.unavailableReason ?? "No current operational records can be shown."}</p>
            <div className={styles.stateActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => setRetrySignal((value) => value + 1)}
              >
                Retry local read
              </button>
              <a className={styles.primaryAction} href="/new">New Review</a>
            </div>
          </section>
        )}

        {projection?.status === "empty" && (
          <>
            <OperationalViews records={[]} activeView={view} demo={demo} />
            <section className={styles.statePanel} aria-labelledby="operations-empty-title">
              <span className={styles.stateKicker}>Browser-local reviews</span>
              <h2 id="operations-empty-title">No review records are stored in this browser</h2>
              <p>
                Complete a durable New Review to populate this surface. Real mode never loads
                sample records automatically.
              </p>
            </section>
          </>
        )}

        {projection?.status === "ready" && (
          <>
            <ProjectionLimitations limitations={projection.limitations} />
            <OperationalViews records={records} activeView={view} demo={demo} />

            <section className={styles.toolRegion} aria-label="Search, filters and sort">
              <div className={styles.searchRow}>
                <div className={styles.searchField}>
                  <label htmlFor="review-operations-search">Search review records</label>
                  <div>
                    <input
                      id="review-operations-search"
                      ref={searchInputRef}
                      type="search"
                      value={query}
                      onChange={(event) => updateSearchQuery(event.target.value)}
                      placeholder="Title, repository, PR, report, run, head or decision"
                    />
                    {query && (
                      <button type="button" onClick={() => updateSearchQuery("")}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <label className={styles.sortField}>
                  <span>Sort</span>
                  <select value={sort} onChange={(event) => updateQuery({ sort: event.target.value })}>
                    {(Object.keys(SORT_LABEL) as OperationalSortId[]).map((id) => (
                      <option key={id} value={id}>{SORT_LABEL[id]}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={styles.filterTrigger}
                  ref={filterTriggerRef}
                  aria-expanded={filtersOpen}
                  aria-controls="operational-filter-panel"
                  onClick={() => setFiltersOpen(true)}
                >
                  Filters{filtersActive ? " · active" : ""}
                </button>
              </div>

              {compactFilters && filtersOpen && (
                <button
                  type="button"
                  className={styles.filterScrim}
                  aria-label="Close filters"
                  tabIndex={-1}
                  data-modal-scrim
                  onClick={closeFilters}
                />
              )}
              <div
                id="operational-filter-panel"
                className={`${styles.filterPanel} ${filtersOpen ? styles.filterPanelOpen : ""}`}
                ref={filterDialogRef}
                role={compactFilters ? "dialog" : "region"}
                aria-modal={compactFilters ? true : undefined}
                aria-label="Review Operations filters"
              >
                <div className={styles.filterPanelHeader}>
                  <strong>Filters</strong>
                  <button type="button" onClick={closeFilters}>Close</button>
                </div>
                <div className={styles.filterGrid}>
                  <label>
                    <span>Recommendation</span>
                    <select value={currentRecommendation} onChange={(event) => updateQuery({ recommendation: event.target.value, selected: null })}>
                      <option value="all">Any recommendation</option>
                      {recommendations.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Risk</span>
                    <select value={currentRisk} onChange={(event) => updateQuery({ risk: event.target.value, selected: null })}>
                      <option value="all">Any risk</option>
                      {risks.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Blockers</span>
                    <select value={blockers} onChange={(event) => updateQuery({ blockers: event.target.value, selected: null })}>
                      <option value="all">Any blocker state</option>
                      <option value="present">Open blockers</option>
                      <option value="none">No open blockers</option>
                    </select>
                  </label>
                  <label>
                    <span>Proof</span>
                    <select value={proof} onChange={(event) => updateQuery({ proof: event.target.value, selected: null })}>
                      <option value="all">Any proof state</option>
                      <option value="missing">Missing / unverified</option>
                      <option value="complete">No proof gaps</option>
                    </select>
                  </label>
                  <label>
                    <span>Human Decision</span>
                    <select value={decision} onChange={(event) => updateQuery({ decision: event.target.value, selected: null })}>
                      <option value="all">Any decision state</option>
                      <option value="none">No decision</option>
                      <option value="applicable">Applicable</option>
                      <option value="stale">Stale</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </label>
                  <label>
                    <span>Source</span>
                    <select value={currentSource} onChange={(event) => updateQuery({ source: event.target.value, selected: null })}>
                      <option value="all">Any source</option>
                      {sources.map((value) => <option key={value} value={value}>{records.find((record) => record.source === value)?.sourceLabel ?? value}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Analysis</span>
                    <select value={currentAnalysis} onChange={(event) => updateQuery({ analysis: event.target.value, selected: null })}>
                      <option value="all">Any analysis path</option>
                      {analyses.map((value) => <option key={value} value={value}>{records.find((record) => record.analysis === value)?.analysisLabel ?? value}</option>)}
                    </select>
                  </label>
                </div>
                {(filtersActive || compactFilters) && (
                  <div className={styles.filterActions}>
                    {filtersActive && <button type="button" className={styles.secondaryAction} onClick={resetFilters}>Reset filters</button>}
                    {compactFilters && <button type="button" className={styles.primaryAction} onClick={closeFilters}>Show {filtered.length} records</button>}
                  </div>
                )}
              </div>

              <div className={styles.resultBar}>
                <p aria-live="polite" role="status">
                  <strong>{filtered.length}</strong> of {records.length} records · {OPERATIONAL_VIEW_LABEL[view]}
                  {filtersActive ? " · filters applied" : ""}
                </p>
              </div>
            </section>

            <div className={styles.recordsLayout}>
              <section className={styles.recordsPanel} aria-labelledby="operations-results-title">
                <h2 id="operations-results-title" className={styles.visuallyHidden}>Operational review records</h2>
                {filtered.length > 0 ? (
                  <div className={styles.tableViewport}>
                    <table className={styles.recordsTable}>
                      <thead>
                        <tr>
                          <th aria-sort={sortAria(sort, "title")}><button type="button" onClick={() => sortFromHeader("title")}>Review</button></th>
                          <th aria-sort={sortAria(sort, "repository")}><button type="button" onClick={() => sortFromHeader("repository")}>Repository / PR</button></th>
                          <th>Recommendation</th>
                          <th aria-sort={sortAria(sort, "risk")}><button type="button" onClick={() => sortFromHeader("risk")}>Risk</button></th>
                          <th aria-sort={sortAria(sort, "blockers")}><button type="button" onClick={() => sortFromHeader("blockers")}>Blockers / proof</button></th>
                          <th aria-sort={sortAria(sort, "decision")}><button type="button" onClick={() => sortFromHeader("decision")}>Human Decision</button></th>
                          <th>Run / head</th>
                          <th aria-sort={sortAria(sort, "updated")}><button type="button" onClick={() => sortFromHeader("updated")}>Updated</button></th>
                          <th className={styles.sourceColumn}>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((record) => (
                          <tr
                            key={record.caseId}
                            className={requestedId === record.reportId ? styles.recordSelected : undefined}
                          >
                            <td data-label="Review">
                              <button
                                type="button"
                                className={styles.recordSelector}
                                aria-pressed={requestedId === record.reportId}
                                onClick={() => updateQuery({ selected: record.reportId })}
                              >
                                <strong title={record.title}>{record.title}</strong>
                                <span>{record.primaryGroup.replaceAll("-", " ")}</span>
                              </button>
                            </td>
                            <td data-label="Repository / PR">
                              <code title={`${record.repository}${record.pullRequestNumber ? ` · PR #${record.pullRequestNumber}` : ""}`}>
                                {record.repository}
                                {record.pullRequestNumber ? ` · #${record.pullRequestNumber}` : ""}
                              </code>
                            </td>
                            <td data-label="Recommendation"><RecommendationState record={record} /></td>
                            <td data-label="Risk"><RiskState record={record} /></td>
                            <td data-label="Blockers / proof">
                              <span>{record.blockerCount} blockers</span>
                              <small>{record.missingProofCount} missing / unverified</small>
                            </td>
                            <td data-label="Human Decision"><DecisionState record={record} /></td>
                            <td data-label="Run / head">
                              <code title={record.runId ?? "Run not recorded"}>{record.runId ?? "Run unavailable"}</code>
                              <small><code title={record.headSha ?? "Head not recorded"}>{record.headSha ?? "Head unavailable"}</code></small>
                            </td>
                            <td data-label="Updated">
                              <time dateTime={record.updatedAt}>{formatOperationalTimestamp(record.updatedAt)}</time>
                            </td>
                            <td data-label="Source" className={styles.sourceColumn}>
                              <span>{record.source === "demo" ? "Demo fixture" : record.sourceLabel}</span>
                              <small>{record.analysis === "demo" ? "Fixture" : record.analysisLabel}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.filteredEmpty}>
                    <span>No matching records</span>
                    <h2>No reviews match the current view, search and filters</h2>
                    <p>
                      {records.length} valid browser-local record{records.length === 1 ? " exists" : "s exist"};
                      storage is not empty.
                    </p>
                  </div>
                )}
              </section>

              <SelectedRecordSummary
                record={selected}
                requestedId={requestedId}
                demo={demo}
                onBack={clearSelection}
              />
            </div>

            <p className={styles.selectionAnnouncement} aria-live="polite" role="status">
              {selectionAnnouncement}
            </p>
            <LocalBoundary projection={projection} />
          </>
        )}
      </div>
    </AppShell>
  );
}
