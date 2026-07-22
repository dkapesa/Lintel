"use client";

/* R1B.0 / R1D.2 — Production Workspace V2 · Queue plane.

   A compact, operational engineering inbox. The Queue is a pure projection of
   the snapshot's grouped case summaries plus a small set of callbacks; the
   authoritative selected case is owned by the route-level state owner, never
   here. Roving keyboard navigation keeps the rendered case rows a single tab
   stop.

   R1D.2 adds scalable navigation and a focus mode WITHOUT changing grouping,
   recommendation, storage or routing:
     • the whole Queue collapses to a compact orientation rail (route-owned
       flag) so the Canvas reclaims horizontal space during deep review;
     • operational group headers are sticky, real buttons that can be collapsed
       individually (presentation-only, Queue-local, resets on refresh);
     • selection truth survives every collapse and regroup — a collapsed group
       that owns the selected case keeps a clear cue, and a selection that lands
       in a collapsed group auto-expands it rather than silently selecting a
       neighbour;
     • focus is managed deterministically after render (no timer chains) so
       collapsing from within the Queue returns focus to the toggle and never
       drops to <body>, and hidden rows are never focusable (they are not
       rendered at all). */

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../workspace-v2.module.css";
import { recommendationTone, rovingKeyDown, toneClass, outcomeTone } from "./presentation";
import {
  OUTCOME_LABEL,
  RECOMMENDATION_LABEL,
  type DecisionMarker,
  type QueueCaseSummary,
  type QueueGroup,
  type QueueGroupId,
} from "../../../lib/workspace-v2/view-model";

/* The four operational groups in their fixed precedence order, each with a
   compact rail short-label. The full label here is a presentation fallback used
   ONLY by the compact rail to represent an operational group that currently has
   zero cases (such a group is never present in the `groups` prop, which carries
   only non-empty groups). Whenever a group IS present its model-supplied label
   is preferred, so the queue-grouping contract stays the single source of truth.
   This introduces no new Queue category and no new grouping logic. */
const CANONICAL_GROUPS: ReadonlyArray<{ id: QueueGroupId; label: string; short: string }> = [
  { id: "attention", label: "Needs attention", short: "ATTN" },
  { id: "review", label: "Review", short: "REVIEW" },
  { id: "ready", label: "Ready", short: "READY" },
  { id: "reviewed", label: "Reviewed", short: "DONE" },
];

/* Reduced-motion-aware scroll behaviour, matching the route owner's policy so no
   essential orientation move depends on animation. */
function scrollBehavior(): ScrollBehavior {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/* A single deterministic post-render focus/scroll intent, consumed exactly once
   after the commit that changed the Queue's shape. No arbitrary timeouts. */
type QueueIntent =
  | { kind: "toggle" }
  | { kind: "group"; id: QueueGroupId; focus: "heading" | "toggle" };

export function WorkspaceQueue({
  groups,
  selectedCaseId,
  onSelectCase,
  collapsed,
  onSetCollapsed,
  limitations,
}: {
  groups: QueueGroup[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  /* Route-owned Queue collapse (focus mode). Changing it narrows the first grid
     track; it never touches selection, storage, routing or domain state. */
  collapsed: boolean;
  onSetCollapsed: (next: boolean) => void;
  /* Restrained, truthful notes about how the queue was projected (e.g. some
     stored reports could not be read). Optional; absent in fixture mode. */
  limitations?: string[];
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const groupHeadingRefs = useRef(new Map<QueueGroupId, HTMLButtonElement | null>());

  /* Presentation-only: which operational groups are collapsed. Local to the
     Queue (it affects no other plane), defaults to all-expanded, and resets on
     refresh. No storage, no persistence key, no context. */
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<QueueGroupId>>(
    () => new Set<QueueGroupId>(),
  );
  const [intent, setIntent] = useState<QueueIntent | null>(null);

  /* Empty groups are never present in the projection; the filter is belt-and-
     braces so an accidental empty group introduces no header and no dead tab
     stop (view-model §16.5). */
  const visibleGroups = groups.filter((group) => group.cases.length > 0);
  const totalCases = visibleGroups.reduce((sum, group) => sum + group.cases.length, 0);
  const notes = limitations?.filter((note) => note.trim().length > 0) ?? [];

  const groupById = new Map(visibleGroups.map((group) => [group.id, group] as const));
  const caseGroup = new Map<string, QueueGroupId>();
  for (const group of visibleGroups) {
    for (const item of group.cases) caseGroup.set(item.caseId, group.id);
  }
  const selectedGroupId = caseGroup.get(selectedCaseId) ?? null;
  const selectedGroupOpen = selectedGroupId ? !collapsedGroups.has(selectedGroupId) : true;

  /* Rows are rendered only for open groups, so a hidden row is never in the DOM
     and never focusable. Exactly one row is tabbable — the selected row when it
     is rendered, otherwise the first rendered row — so the widget never drops
     out of the tab order even while the selected case sits in a collapsed
     group. */
  const renderedCases = visibleGroups
    .filter((group) => !collapsedGroups.has(group.id))
    .flatMap((group) => group.cases);
  const firstRenderedId = renderedCases[0]?.caseId ?? null;
  const selectionRendered = renderedCases.some((item) => item.caseId === selectedCaseId);
  const tabbableCaseId = selectionRendered ? selectedCaseId : firstRenderedId;

  const toggleGroup = useCallback((id: QueueGroupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* Collapse / expand the whole Queue. Collapsing always returns focus to the
     (now rail) toggle so focus can never drop to <body>; expanding via the
     toggle keeps focus on the toggle. Selection is never touched here. */
  const collapseQueue = useCallback(() => {
    onSetCollapsed(true);
    setIntent({ kind: "toggle" });
  }, [onSetCollapsed]);

  const expandQueue = useCallback(() => {
    onSetCollapsed(false);
    setIntent({ kind: "toggle" });
  }, [onSetCollapsed]);

  /* Compact-rail group activation: expand the Queue, ensure the target group is
     open, then (post-render) scroll its heading into view. Keyboard activation
     moves focus to the group heading; pointer activation does not steal focus to
     the heading but still lands focus on the (now expanded) toggle rather than
     dropping to <body> — because the rail chip that was clicked has unmounted.
     Never changes the selected case, the route or the reportId. */
  const activateRailGroup = useCallback(
    (id: QueueGroupId, keyboard: boolean) => {
      onSetCollapsed(false);
      setCollapsedGroups((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setIntent({ kind: "group", id, focus: keyboard ? "heading" : "toggle" });
    },
    [onSetCollapsed],
  );

  /* Deterministic post-render focus / scroll. Runs after the commit that changed
     collapse or group state, so the target already matches the new DOM. */
  useEffect(() => {
    if (!intent) return;
    if (intent.kind === "toggle") {
      toggleRef.current?.focus();
    } else {
      const heading = groupHeadingRefs.current.get(intent.id);
      if (heading) heading.scrollIntoView({ behavior: scrollBehavior(), block: "nearest" });
      if (intent.focus === "heading") heading?.focus({ preventScroll: true });
      else toggleRef.current?.focus();
    }
    setIntent(null);
  }, [intent, collapsed]);

  /* Selected-case truth across regrouping and navigation. If the selected case's
     group is collapsed when selection changes, or the case is regrouped into a
     collapsed group, auto-expand that group so the selection is never hidden and
     no neighbour is silently selected. This keys on the case/group identity, not
     on the collapsed set, so a MANUAL collapse of the selected group is
     preserved (it does not immediately re-expand). */
  useEffect(() => {
    if (!selectedGroupId) return;
    setCollapsedGroups((prev) => {
      if (!prev.has(selectedGroupId)) return prev;
      const next = new Set(prev);
      next.delete(selectedGroupId);
      return next;
    });
  }, [selectedCaseId, selectedGroupId]);

  /* Bring the selected row into view with minimal (nearest) scrolling when it is
     selected, regrouped, or revealed by expanding the Queue or its group. A row
     already fully visible is left in place, and the scroll is confined to the
     Queue's own scroll container, so no other plane moves. */
  useEffect(() => {
    if (collapsed) return;
    const list = listRef.current;
    if (!list) return;
    const row = Array.from(list.querySelectorAll<HTMLElement>("[data-case-id]")).find(
      (element) => element.dataset.caseId === selectedCaseId,
    );
    row?.scrollIntoView({ behavior: scrollBehavior(), block: "nearest" });
  }, [selectedCaseId, selectedGroupId, selectedGroupOpen, collapsed]);

  /* ---- Collapsed: compact orientation rail --------------------------- */
  if (collapsed) {
    return (
      <aside
        className={`${styles.queue} ${styles.queueCollapsed}`}
        aria-label="Case queue"
        data-tour="risk-inbox"
      >
        <div className={styles.queueRail}>
          <button
            type="button"
            ref={toggleRef}
            className={styles.queueRailToggle}
            aria-label="Expand case queue"
            aria-expanded={false}
            title="Expand case queue"
            onClick={expandQueue}
          >
            <ChevronRight />
          </button>
          <div
            className={styles.queueRailCount}
            aria-label={`${totalCases} ${totalCases === 1 ? "case" : "cases"} in queue`}
          >
            <span aria-hidden="true">{totalCases}</span>
          </div>
          <div className={styles.queueRailGroups} role="group" aria-label="Operational groups">
            {CANONICAL_GROUPS.map((canonical) => {
              const group = groupById.get(canonical.id);
              const count = group?.cases.length ?? 0;
              const label = group?.label ?? canonical.label;
              const containsSelected = selectedGroupId === canonical.id;
              const empty = count === 0;
              return (
                <button
                  key={canonical.id}
                  type="button"
                  className={`${styles.queueRailGroup} ${
                    containsSelected ? styles.queueRailGroupSelected : ""
                  }`}
                  aria-label={`${label}, ${count} ${count === 1 ? "case" : "cases"}${
                    containsSelected ? ", contains current case" : ""
                  }`}
                  title={label}
                  disabled={empty}
                  onClick={(event) => {
                    if (!empty) activateRailGroup(canonical.id, event.detail === 0);
                  }}
                >
                  <span className={styles.queueRailGroupShort} aria-hidden="true">
                    {canonical.short}
                  </span>
                  <span className={styles.queueRailGroupCount} aria-hidden="true">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          {notes.length > 0 ? (
            <div
              className={styles.queueRailNote}
              role="note"
              aria-label={notes.join(" ")}
              title={notes.join(" ")}
            >
              <span aria-hidden="true">i</span>
            </div>
          ) : null}
        </div>
      </aside>
    );
  }

  /* ---- Expanded: full operational queue ------------------------------ */
  return (
    <aside className={styles.queue} aria-label="Case queue" data-tour="risk-inbox">
      <div className={styles.planeHeader}>
        <span className={styles.planeLabel}>Queue</span>
        <span className={styles.queueHeaderControls}>
          <span className={styles.planeHeaderCount} aria-hidden="true">
            {totalCases}
          </span>
          <button
            type="button"
            ref={toggleRef}
            className={styles.queueCollapseToggle}
            aria-label="Collapse case queue"
            aria-expanded={true}
            aria-controls="wsv2-queue-list"
            title="Collapse case queue"
            onClick={collapseQueue}
          >
            <ChevronLeft />
          </button>
        </span>
      </div>
      <div
        id="wsv2-queue-list"
        className={styles.queueList}
        ref={listRef}
        onKeyDown={(event) => {
          /* Roving is confined to the case rows: arrow keys only move focus when
             a row is focused, so the group-heading buttons keep ordinary button
             behaviour and never hijack the arrows. */
          if ((event.target as HTMLElement).getAttribute("data-roving") === "true") {
            rovingKeyDown(event, listRef.current);
          }
        }}
      >
        {visibleGroups.map((group) => {
          const groupCollapsed = collapsedGroups.has(group.id);
          const containsSelected = selectedGroupId === group.id;
          const count = group.cases.length;
          const rowsId = `wsv2-queue-group-${group.id}`;
          return (
            <section key={group.id} className={styles.queueGroup}>
              <button
                type="button"
                ref={(element) => {
                  groupHeadingRefs.current.set(group.id, element);
                }}
                className={styles.queueGroupHeader}
                aria-expanded={!groupCollapsed}
                aria-controls={rowsId}
                aria-label={`${group.label}, ${count} ${count === 1 ? "case" : "cases"}${
                  groupCollapsed && containsSelected ? ", contains current case" : ""
                }`}
                onClick={() => toggleGroup(group.id)}
              >
                <span className={styles.queueGroupChevron} aria-hidden="true">
                  <ChevronDown />
                </span>
                <span className={styles.queueGroupLabel} aria-hidden="true">
                  {group.label}
                </span>
                {groupCollapsed && containsSelected ? (
                  <span className={styles.queueGroupSelectedCue} aria-hidden="true" />
                ) : null}
                <span className={styles.queueGroupCount} aria-hidden="true">
                  {count}
                </span>
              </button>
              <div
                id={rowsId}
                className={styles.queueGroupRows}
                role="group"
                aria-label={group.label}
                hidden={groupCollapsed}
              >
                {groupCollapsed
                  ? null
                  : group.cases.map((item) => (
                      <QueueRow
                        key={item.caseId}
                        item={item}
                        selected={item.caseId === selectedCaseId}
                        tabbable={item.caseId === tabbableCaseId}
                        onSelect={() => onSelectCase(item.caseId)}
                      />
                    ))}
              </div>
            </section>
          );
        })}
      </div>
      <div className={styles.queueFooter}>
        <p className={styles.queueFooterSummary}>
          <span className={styles.queueFooterCount} aria-hidden="true">
            {totalCases}
          </span>
          <span className={styles.queueFooterLabel}>
            {totalCases === 1 ? "case in queue" : "cases in queue"}
          </span>
        </p>
        {notes.length > 0 ? (
          <div className={styles.queueLimitations} role="note">
            {notes.map((note, index) => (
              <p key={index} className={styles.queueLimitationLine}>
                {note}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function QueueRow({
  item,
  selected,
  tabbable,
  onSelect,
}: {
  item: QueueCaseSummary;
  selected: boolean;
  tabbable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-roving="true"
      data-case-id={item.caseId}
      tabIndex={tabbable ? 0 : -1}
      aria-current={selected ? "true" : undefined}
      aria-label={queueRowLabel(item, selected)}
      className={`${styles.queueRow} ${selected ? styles.queueRowSelected : ""}`}
      onClick={onSelect}
    >
      {/* The individual spans are aria-hidden: the composed aria-label above is
          the single, ordered announcement so the row is not read as a run of
          disconnected tokens. */}
      <span className={styles.queueRef} aria-hidden="true">
        #{item.pullRequestNumber}
      </span>
      <span className={styles.queueTitle} aria-hidden="true">
        {item.title}
      </span>
      {item.provenanceHint ? (
        <span className={styles.queueProvenanceHint} aria-hidden="true">
          {item.provenanceHint}
        </span>
      ) : null}
      <span className={styles.queueState} aria-hidden="true">
        <span className={`${styles.queueRec} ${recommendationTone(item.recommendation)}`}>
          {RECOMMENDATION_LABEL[item.recommendation]}
        </span>
        <span className={styles.queueRisk}>{item.riskLevel}</span>
        <QueueDecisionMarker marker={item.decisionMarker} />
      </span>
    </button>
  );
}

/* One ordered, human-readable announcement for a queue row: identity, title,
   recommendation, risk, then — only when genuinely recorded — the decision
   marker, and finally the restrained same-PR provenance hint. Selection is
   already exposed through aria-current, so it is not repeated here. */
function queueRowLabel(item: QueueCaseSummary, selected: boolean): string {
  const parts = [
    `Pull request ${item.pullRequestNumber}`,
    item.title,
    `${RECOMMENDATION_LABEL[item.recommendation]}, ${item.riskLevel.toLowerCase()} risk`,
  ];
  if (item.decisionMarker.kind === "recorded") {
    const prefix = item.decisionMarker.isSample ? "Sample decision" : "Decision";
    parts.push(
      `${prefix} recorded: ${OUTCOME_LABEL[item.decisionMarker.outcome]}${
        item.decisionMarker.needsReaffirmation ? ", needs reaffirmation" : ""
      }`,
    );
  }
  if (item.provenanceHint) parts.push(item.provenanceHint);
  const label = parts.join(". ");
  return selected ? `${label}. Current case` : label;
}

/* One restrained glyph, shown only when a decision is genuinely recorded.
   Never renders for an absent or unavailable decision (r0b2 §15, RISK-B). */
function QueueDecisionMarker({ marker }: { marker: DecisionMarker }) {
  if (marker.kind !== "recorded") return null;
  /* Real recorded decisions must not carry the fixture-era "Sample" prefix. */
  const prefix = marker.isSample ? "Sample decision recorded" : "Decision recorded";
  const label = `${prefix}: ${OUTCOME_LABEL[marker.outcome]}${
    marker.needsReaffirmation ? ", needs reaffirmation" : ""
  }`;
  return (
    <span
      className={`${styles.queueDecisionMark} ${
        marker.needsReaffirmation ? styles.queueDecisionStale : ""
      }`}
      title={label}
      aria-label={label}
    >
      <span className={`${styles.queueDecisionDot} ${toneClass(outcomeTone(marker.outcome))}`} />
    </span>
  );
}

/* Small, decorative disclosure / direction glyphs. All are aria-hidden: the
   surrounding controls carry the accessible name and, for the group headers,
   aria-expanded carries the open/closed state. */
function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path
        d="M2.75 4.5 6 7.75 9.25 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path
        d="M7.5 2.75 4.25 6 7.5 9.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path
        d="M4.5 2.75 7.75 6 4.5 9.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
