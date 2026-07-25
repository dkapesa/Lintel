"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../app-shell";
import styles from "../administrative-document.module.css";
import {
  decisionSummary,
  groupOperationsCases,
  OPERATIONS_GROUP_LABEL,
  OPERATIONS_GROUP_ORDER,
  readOperationsProjection,
  type OperationsCase,
  type OperationsGroupId,
  type OperationsProjectionStatus,
} from "../../lib/operations-projection";

type LoadState = "loading" | OperationsProjectionStatus;

type Filters = {
  group: OperationsGroupId | "all";
  recommendation: string;
  riskLevel: string;
  repository: string;
  provenance: string;
  decision: "all" | "none" | "applicable" | "stale";
  ownership: "all" | "assigned" | "unassigned";
};

const EMPTY_FILTERS: Filters = {
  group: "all",
  recommendation: "all",
  riskLevel: "all",
  repository: "all",
  provenance: "all",
  decision: "all",
  ownership: "all",
};

const RISK_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function recommendationClass(value: OperationsCase["recommendation"]) {
  return value === "APPROVE" ? styles.statePositive : styles.stateAttention;
}

/* State text plus a semantic class — never colour alone. */
function DecisionState({ case: item }: { case: OperationsCase }) {
  if (item.decision.kind === "none") {
    return <span className={styles.stateNeutral}>No decision recorded</span>;
  }
  if (item.decision.kind === "stale") {
    return <span className={styles.stateAttention}>{decisionSummary(item.decision)}</span>;
  }
  /* applicable — accepted risk stays cautionary, never a clean approval. */
  if (item.acceptedRisk) {
    return <span className={styles.stateAttention}>{decisionSummary(item.decision)}</span>;
  }
  return <span className={styles.statePositive}>{decisionSummary(item.decision)}</span>;
}

function OwnerState({ case: item }: { case: OperationsCase }) {
  return item.ownerAssigned
    ? <span className={styles.stateNeutral}>{item.ownerLabel}</span>
    : <span className={styles.stateNeutral}>Unassigned</span>;
}

function ProvenanceTag({ case: item }: { case: OperationsCase }) {
  const className = item.provenance === "sample" ? styles.opsProvenanceSample : styles.opsProvenance;
  return <span className={className}>{item.provenanceLabel}</span>;
}

function CaseRow({
  case: item,
  selected,
  onSelect,
}: {
  case: OperationsCase;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={`${styles.opsRow} ${selected ? styles.opsRowSelected : ""}`}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <span className={styles.opsRowMain}>
          <span className={styles.rowTitle}>{item.title}</span>
          <span className={styles.opsRowIdentity}>
            {item.repository}{item.pullRequestNumber ? ` · PR #${item.pullRequestNumber}` : ""}
          </span>
        </span>
        <span className={styles.opsRowSignals}>
          <span className={recommendationClass(item.recommendation)}>{item.recommendationLabel}</span>
          <span className={styles.opsMetric}>Risk {item.riskScore} · {RISK_LABEL[item.riskLevel] ?? item.riskLevel}</span>
          {item.blockingRequirementCount > 0 && (
            <span className={styles.stateAttention}>{item.blockingRequirementCount} blocking</span>
          )}
          {item.missingProofCount > 0 && (
            <span className={styles.stateAttention}>{item.missingProofCount} missing proof</span>
          )}
        </span>
        <span className={styles.opsRowState}>
          <DecisionState case={item} />
          <span className={styles.opsRowSub}><OwnerState case={item} /> · <ProvenanceTag case={item} /></span>
        </span>
      </button>
    </li>
  );
}

function Inspector({ case: item }: { case: OperationsCase | null }) {
  if (!item) {
    return (
      <aside className={styles.opsInspector} aria-label="Selected case">
        <p className={styles.opsInspectorHint}>Select a case to inspect its verification state and open the exact Case File.</p>
      </aside>
    );
  }
  return (
    <aside className={styles.opsInspector} aria-label={`Selected case: ${item.title}`}>
      <div className={styles.opsInspectorHead}>
        <h3>{item.title}</h3>
        <p className={styles.opsInspectorIdentity}>
          {item.repository}{item.pullRequestNumber ? ` · PR #${item.pullRequestNumber}` : ` · ${item.changeLabel}`}
        </p>
      </div>
      <dl className={styles.opsInspectorFacts}>
        <div><dt>Operational group</dt><dd>{OPERATIONS_GROUP_LABEL[item.group]}</dd></div>
        <div><dt>Lintel recommendation</dt><dd className={recommendationClass(item.recommendation)}>{item.recommendationLabel}</dd></div>
        <div><dt>Risk</dt><dd>{item.riskScore} · {RISK_LABEL[item.riskLevel] ?? item.riskLevel}</dd></div>
        <div><dt>Blocking requirements</dt><dd>{item.blockingRequirementCount}</dd></div>
        <div><dt>Missing required proof</dt><dd>{item.missingProofCount}</dd></div>
        <div><dt>Merge conditions</dt><dd>{item.conditionsTotal === 0 ? "None" : `${item.conditionsCleared}/${item.conditionsTotal} cleared`}</dd></div>
        <div><dt>Human decision</dt><dd><DecisionState case={item} /></dd></div>
        <div><dt>Review ownership</dt><dd><OwnerState case={item} /></dd></div>
        <div><dt>Provenance</dt><dd><ProvenanceTag case={item} /> · {item.sourceLabel}</dd></div>
        <div><dt>Created</dt><dd><time dateTime={item.createdAt}>{formatTimestamp(item.createdAt)}</time></dd></div>
      </dl>
      <div className={styles.opsInspectorActions}>
        <Link className={styles.primaryAction} href={item.caseFileHref}>Open Case File</Link>
        <Link className={styles.secondaryAction} href={item.workspaceHref}>Open in Workspace</Link>
      </div>
      <p className={styles.opsInspectorNote}>Both actions preserve this case&rsquo;s exact durable identity. A recommendation is not a human decision.</p>
    </aside>
  );
}

export default function ReviewOperationsPage() {
  const [cases, setCases] = useState<OperationsCase[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const projection = readOperationsProjection(window.localStorage);
      setCases(projection.cases);
      setLoadState(projection.status);
    } catch {
      setCases([]);
      setLoadState("unavailable");
    }
  }, []);

  const counts = useMemo(() => {
    const by = (group: OperationsGroupId) => cases.filter((item) => item.group === group).length;
    return {
      total: cases.length,
      attention: by("attention"),
      review: by("review"),
      ready: by("ready"),
      reviewed: by("reviewed"),
    };
  }, [cases]);

  const repositories = useMemo(
    () => [...new Set(cases.filter((item) => item.repositoryKnown).map((item) => item.repository))].sort((a, b) => a.localeCompare(b)),
    [cases],
  );
  const recommendations = useMemo(
    () => [...new Set(cases.map((item) => item.recommendation))],
    [cases],
  );
  const riskLevels = useMemo(
    () => [...new Set(cases.map((item) => item.riskLevel))],
    [cases],
  );
  const provenances = useMemo(
    () => [...new Set(cases.map((item) => item.provenance))],
    [cases],
  );
  const hasDecisions = cases.some((item) => item.decision.kind !== "none");
  const hasOwnership = cases.some((item) => item.ownerAssigned);

  const filtered = useMemo(() => cases.filter((item) => {
    if (filters.group !== "all" && item.group !== filters.group) return false;
    if (filters.recommendation !== "all" && item.recommendation !== filters.recommendation) return false;
    if (filters.riskLevel !== "all" && item.riskLevel !== filters.riskLevel) return false;
    if (filters.repository !== "all" && item.repository !== filters.repository) return false;
    if (filters.provenance !== "all" && item.provenance !== filters.provenance) return false;
    if (filters.decision !== "all" && item.decision.kind !== filters.decision) return false;
    if (filters.ownership === "assigned" && !item.ownerAssigned) return false;
    if (filters.ownership === "unassigned" && item.ownerAssigned) return false;
    return true;
  }), [cases, filters]);

  const groups = useMemo(() => groupOperationsCases(filtered), [filtered]);
  const filtersActive = useMemo(
    () => (Object.keys(EMPTY_FILTERS) as Array<keyof Filters>).some((key) => filters[key] !== EMPTY_FILTERS[key]),
    [filters],
  );
  const selected = filtered.find((item) => item.reportId === selectedId)
    ?? cases.find((item) => item.reportId === selectedId)
    ?? null;

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const boundaryText = loadState === "loading"
    ? "Reading Case Files stored on this device"
    : loadState === "local"
      ? `${counts.total} Case ${counts.total === 1 ? "File" : "Files"} stored on this device · not hosted organisation analytics`
      : loadState === "unavailable"
        ? "Local report history could not be read · no Case Files can be shown"
        : "No Case Files stored on this device yet · not an organisation activity feed";

  return (
    <AppShell>
      <div className={styles.page} data-tour="review-operations">
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>Review Operations</h1>
            <p>A local operational view over the Case Files stored on this device: which need attention, which are ready for a human decision, and which already have one.</p>
            <div className={styles.statusLine}>{boundaryText}</div>
          </header>

          {loadState === "unavailable" && (
            <section className={`${styles.group} ${styles.limitationGroup}`} aria-labelledby="ops-unavailable-title">
              <div className={styles.groupHeader}>
                <h2 id="ops-unavailable-title">Local report history is unavailable</h2>
                <p>Report history is present on this device but could not be read as valid Case Files. Nothing has been altered or recovered automatically, and no sample data is shown in its place.</p>
              </div>
              <ul className={styles.boundaryList}>
                <li>This is not the same as an empty device: existing storage was found but is unreadable or malformed.</li>
                <li>Generating a new review from a durable input will write fresh, valid history.</li>
              </ul>
              <div className={styles.opsEmptyActions}>
                <Link className={styles.primaryAction} href="/new">New Review</Link>
              </div>
            </section>
          )}

          {loadState === "empty" && (
            <section className={`${styles.group} ${styles.opsEmpty}`} aria-labelledby="ops-empty-title">
              <div className={styles.groupHeader}>
                <h2 id="ops-empty-title">No Case Files yet</h2>
                <p>Review Operations reads Case Files stored on this device. Once you generate a review, its recommendation, requirements, missing proof and any human decision appear here.</p>
              </div>
              <div className={styles.opsEmptyActions}>
                <Link className={styles.primaryAction} href="/new">New Review</Link>
                <Link className={styles.secondaryAction} href="/workspace">Open Workspace</Link>
              </div>
            </section>
          )}

          {loadState === "local" && (
            <>
              <dl className={styles.operationsLedger} aria-label="Operational summary">
                <div><dt>Stored Case Files</dt><dd>{counts.total}</dd></div>
                <div><dt>Needs attention</dt><dd>{counts.attention}</dd></div>
                <div><dt>Awaiting review</dt><dd>{counts.review}</dd></div>
                <div><dt>Ready for decision</dt><dd>{counts.ready}</dd></div>
                <div><dt>Reviewed</dt><dd>{counts.reviewed}</dd></div>
              </dl>

              <section className={styles.opsFilters} aria-label="Filters and scope">
                <div className={styles.opsFilterFields}>
                  <label className={styles.opsFilterField}>
                    <span>Group</span>
                    <select value={filters.group} onChange={(event) => update("group", event.target.value as Filters["group"])}>
                      <option value="all">All groups</option>
                      {OPERATIONS_GROUP_ORDER.filter((id) => cases.some((item) => item.group === id)).map((id) => (
                        <option key={id} value={id}>{OPERATIONS_GROUP_LABEL[id]}</option>
                      ))}
                    </select>
                  </label>

                  {recommendations.length > 1 && (
                    <label className={styles.opsFilterField}>
                      <span>Recommendation</span>
                      <select value={filters.recommendation} onChange={(event) => update("recommendation", event.target.value)}>
                        <option value="all">Any</option>
                        {recommendations.map((value) => (
                          <option key={value} value={value}>{cases.find((item) => item.recommendation === value)?.recommendationLabel ?? value}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {riskLevels.length > 1 && (
                    <label className={styles.opsFilterField}>
                      <span>Risk band</span>
                      <select value={filters.riskLevel} onChange={(event) => update("riskLevel", event.target.value)}>
                        <option value="all">Any</option>
                        {riskLevels.map((value) => (
                          <option key={value} value={value}>{RISK_LABEL[value] ?? value}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {repositories.length > 1 && (
                    <label className={styles.opsFilterField}>
                      <span>Repository</span>
                      <select value={filters.repository} onChange={(event) => update("repository", event.target.value)}>
                        <option value="all">All repositories</option>
                        {repositories.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {provenances.length > 1 && (
                    <label className={styles.opsFilterField}>
                      <span>Provenance</span>
                      <select value={filters.provenance} onChange={(event) => update("provenance", event.target.value)}>
                        <option value="all">Any</option>
                        {provenances.map((value) => (
                          <option key={value} value={value}>{cases.find((item) => item.provenance === value)?.provenanceLabel ?? value}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {hasDecisions && (
                    <label className={styles.opsFilterField}>
                      <span>Decision state</span>
                      <select value={filters.decision} onChange={(event) => update("decision", event.target.value as Filters["decision"])}>
                        <option value="all">Any</option>
                        <option value="applicable">Applicable decision</option>
                        <option value="stale">Stale or withdrawn</option>
                        <option value="none">No decision</option>
                      </select>
                    </label>
                  )}

                  {hasOwnership && (
                    <label className={styles.opsFilterField}>
                      <span>Ownership</span>
                      <select value={filters.ownership} onChange={(event) => update("ownership", event.target.value as Filters["ownership"])}>
                        <option value="all">Any</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                      </select>
                    </label>
                  )}
                </div>

                <div className={styles.opsFilterStatus} role="status">
                  <span>{filtered.length} of {counts.total} shown</span>
                  {filtersActive && (
                    <button type="button" className={styles.secondaryAction} onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
                  )}
                </div>
              </section>

              <div className={styles.opsLayout}>
                <div className={styles.opsList}>
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <section key={group.id} className={styles.opsGroup} aria-labelledby={`ops-group-${group.id}`}>
                        <h2 id={`ops-group-${group.id}`} className={styles.opsGroupHeading}>
                          {group.label}<span className={styles.opsGroupCount}>{group.cases.length}</span>
                        </h2>
                        <ul className={styles.opsRows}>
                          {group.cases.map((item) => (
                            <CaseRow
                              key={item.reportId}
                              case={item}
                              selected={item.reportId === selectedId}
                              onSelect={() => setSelectedId((current) => current === item.reportId ? null : item.reportId)}
                            />
                          ))}
                        </ul>
                      </section>
                    ))
                  ) : (
                    <section className={`${styles.group} ${styles.opsFilteredEmpty}`} aria-labelledby="ops-filtered-title">
                      <div className={styles.groupHeader}>
                        <h2 id="ops-filtered-title">No cases match the active filters</h2>
                        <p>{counts.total} Case {counts.total === 1 ? "File is" : "Files are"} stored on this device, but none match the current filter scope. Storage is not empty.</p>
                      </div>
                      <div className={styles.opsEmptyActions}>
                        <button type="button" className={styles.secondaryAction} onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
                      </div>
                    </section>
                  )}
                </div>

                <Inspector case={selected} />
              </div>
            </>
          )}

          <section className={styles.section} aria-labelledby="ops-boundary-title">
            <div className={styles.sectionHeader}>
              <h2 id="ops-boundary-title">Local operational boundary</h2>
              <p>Review Operations projects state that already exists on this device. It adds no monitoring, ranking or collaboration.</p>
            </div>
            <div className={`${styles.group} ${styles.limitationGroup}`}>
              <ul className={styles.boundaryList}>
                <li>Case Files are limited to reports retained on this device; this is not organisation-wide telemetry.</li>
                <li>Groups and counts are derived truthfully; no trends, velocities, scores or SLA metrics are calculated.</li>
                <li>A Lintel recommendation is never presented as a human decision, and an accepted risk is never presented as a clean approval.</li>
                <li>Each action preserves a case&rsquo;s exact durable identity; unknown identity is never guessed.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
