"use client";

import { useMemo, useState } from "react";
import { Glyph } from "../icons";
import type { ReviewFixture, ReviewGroup, RiskBand } from "../types";
import styles from "../workspace-r4.module.css";

const GROUPS: ReviewGroup[] = ["Needs attention", "In review", "Ready", "Reviewed"];

function riskClass(band: RiskBand) {
  if (band === "CRITICAL" || band === "HIGH") return styles.toneBlocking;
  if (band === "MEDIUM") return styles.toneProof;
  return styles.toneCleared;
}

function QueueRow({
  review,
  selected,
  onSelect,
  onScope,
}: {
  review: ReviewFixture;
  selected: boolean;
  onSelect: (id: string) => void;
  onScope: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.queueRow} ${selected ? styles.queueRowSelected : ""}`}
      aria-pressed={selected}
      data-queue-row
      data-review-id={review.id}
      onFocus={onScope}
      onPointerDown={onScope}
      onClick={() => onSelect(review.id)}
    >
      <span className={styles.queueIdentity} title={`${review.repository} · PR #${review.pr}`}>
        <span className={styles.queueRepo}>{review.repository}</span>
        <span className={styles.queuePr}>PR #{review.pr}</span>
      </span>
      <span className={styles.queueTitle} title={review.title}>{review.title}</span>
      <span className={styles.queueMeta}>
        <span className={review.recommendation === "APPROVE" ? styles.toneCleared : styles.toneProof}>{review.recommendation}</span>
        <span className={riskClass(review.riskBand)}>{review.riskBand}{review.riskScore ? ` ${review.riskScore}` : ""}</span>
        <span className={review.blockingRequirements > 0 ? styles.toneBlocking : styles.toneMuted}>{review.blockingRequirements}B</span>
      </span>
      <span className={styles.queueSubmeta}>
        <span>{review.movement === "unavailable" ? "comparison unavailable" : review.movement}</span>
        <span>{review.owner ?? review.updated}</span>
      </span>
    </button>
  );
}

export function ReviewQueue({
  reviews,
  selectedId,
  collapsed,
  collapsedGroups,
  onToggleCollapsed,
  onToggleGroup,
  onSelect,
  onRegroup,
  onScope,
  forcedSelectedOut = false,
}: {
  reviews: ReviewFixture[];
  selectedId: string;
  collapsed: boolean;
  collapsedGroups: Set<ReviewGroup>;
  onToggleCollapsed: () => void;
  onToggleGroup: (group: ReviewGroup) => void;
  onSelect: (id: string) => void;
  onRegroup: () => void;
  onScope: () => void;
  forcedSelectedOut?: boolean;
}) {
  const [query, setQuery] = useState(forcedSelectedOut ? "checkout" : "");
  const [risk, setRisk] = useState<"all" | RiskBand>("all");
  const [visibleByGroup, setVisibleByGroup] = useState<Record<ReviewGroup, number>>({
    "Needs attention": 6,
    "In review": 6,
    Ready: 6,
    Reviewed: 6,
  });

  const selected = reviews.find((review) => review.id === selectedId) ?? reviews[0];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const text = `${review.repository} ${review.pr} ${review.title} ${review.id} ${review.owner ?? ""}`.toLowerCase();
      return (!term || text.includes(term)) && (risk === "all" || review.riskBand === risk);
    });
  }, [query, reviews, risk]);
  const selectedOutside = Boolean(selected && !filtered.some((review) => review.id === selected.id));

  if (collapsed) {
    return (
      <aside className={styles.queueCompact} aria-label="Review queue collapsed">
        <button type="button" className={styles.iconButton} onClick={onToggleCollapsed} aria-label="Restore review queue" title="Restore review queue ([)">
          <Glyph name="panel-left" size={18} />
        </button>
        <span className={styles.compactPr}>{selected.pr}</span>
        <span className={styles.compactRecommendation} aria-label={selected.recommendation}>{selected.recommendation === "TESTS REQUIRED" ? "T" : selected.recommendation.slice(0, 1)}</span>
        <span className={styles.compactBlockers}>{selected.blockingRequirements}B</span>
        <span className={styles.compactCount}>{filtered.length}/{reviews.length}</span>
      </aside>
    );
  }

  return (
    <aside className={styles.queue} aria-label="Review queue">
      <div className={styles.queueHeader}>
        <div>
          <span className={styles.eyebrow}>Reviews</span>
          <h2>Review queue</h2>
        </div>
        <button type="button" className={styles.iconButton} onClick={onToggleCollapsed} aria-label="Collapse review queue" title="Collapse review queue ([)">
          <Glyph name="panel-left" size={18} />
        </button>
      </div>
      <div className={styles.queueToolbar}>
        <label className={styles.searchControl}>
          <span className={styles.srOnly}>Search reviews</span>
          <Glyph name="search" size={16} />
          <input
            type="search"
            value={query}
            placeholder="Search reviews"
            onChange={(event) => setQuery(event.target.value)}
            onFocus={onScope}
          />
        </label>
        <label className={styles.compactSelect}>
          <span className={styles.srOnly}>Filter by risk</span>
          <Glyph name="filter" size={14} />
          <select value={risk} onChange={(event) => setRisk(event.target.value as "all" | RiskBand)} onFocus={onScope}>
            <option value="all">All risk</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </label>
      </div>

      {selectedOutside ? (
        <div className={styles.selectedOutside} role="status">
          <span className={styles.eyebrow}>Selected outside filters</span>
          <button type="button" onFocus={onScope} onClick={() => onSelect(selected.id)}>
            <span>{selected.repository} · PR #{selected.pr}</span>
            <span>{selected.recommendation} · {selected.blockingRequirements} blocking</span>
          </button>
          <div>
            <button type="button" onClick={() => { setQuery(""); setRisk("all"); }}>Clear filters</button>
            <button type="button" onClick={() => setQuery(selected.repository)}>Return to result</button>
          </div>
        </div>
      ) : null}

      <div className={styles.queueList} onFocus={onScope}>
        {GROUPS.map((group) => {
          const items = filtered.filter((review) => review.group === group);
          const groupCollapsed = collapsedGroups.has(group);
          const selectedInGroup = selected.group === group;
          const visible = items.slice(0, visibleByGroup[group]);
          return (
            <section key={group} className={styles.queueGroup} aria-labelledby={`queue-${group.replaceAll(" ", "-")}`}>
              <button
                type="button"
                id={`queue-${group.replaceAll(" ", "-")}`}
                className={styles.queueGroupButton}
                aria-expanded={!groupCollapsed}
                onClick={() => onToggleGroup(group)}
                onFocus={onScope}
              >
                <Glyph name="chevron-down" size={14} />
                <span>{group}</span>
                <span>{items.length}</span>
              </button>
              {groupCollapsed && selectedInGroup ? (
                <div className={styles.pinnedSelected}>
                  <span>Selected review retained</span>
                  <QueueRow review={selected} selected onSelect={onSelect} onScope={onScope} />
                </div>
              ) : null}
              {!groupCollapsed ? (
                <div className={styles.queueRows}>
                  {visible.map((review) => (
                    <QueueRow key={review.id} review={review} selected={review.id === selectedId} onSelect={onSelect} onScope={onScope} />
                  ))}
                  {visible.length < items.length ? (
                    <button
                      type="button"
                      className={styles.revealButton}
                      onClick={() => setVisibleByGroup((current) => ({ ...current, [group]: Math.min(items.length, current[group] + 6) }))}
                    >
                      Show {Math.min(6, items.length - visible.length)} more · {items.length - visible.length} remaining
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
      <div className={styles.queueFooter}>
        <span>{reviews.length} controlled reviews</span>
        <button type="button" onClick={onRegroup} title="Move the selected review while preserving selection">Regroup selected</button>
      </div>
    </aside>
  );
}
