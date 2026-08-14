"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ReviewId } from "../../lib/r6c/review-identity";
import { projectReviewCollection } from "../../lib/r6e/collection-projection";
import { focusedQueueReviewWasRemoved } from "../../lib/r6l/queue-focus";
import type { ReviewCollectionFilter, ReviewCollectionGrouping } from "../../lib/r6e/collection-preferences";
import { useWorkstation } from "./WorkstationProvider";
import ReviewCollectionControls from "./ReviewCollectionControls";
import ReviewGroup from "./ReviewGroup";
import ReviewRow from "./ReviewRow";
import ReviewSearch from "./ReviewSearch";
import styles from "./review-collection.module.css";

export default function ReviewCollection() {
  const { snapshot, reviewIndex, state, collectionPreferences, setCollectionPreferences } = useWorkstation();
  const [search, setSearch] = useState("");
  const collectionRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const focusedReviewId = useRef<ReviewId | null>(null);
  const projection = useMemo(() => projectReviewCollection(snapshot, reviewIndex, {
    grouping: collectionPreferences.grouping,
    filter: collectionPreferences.filter,
    search,
  }), [collectionPreferences, reviewIndex, search, snapshot]);
  const selectedReviewId = state.selectedReview.status === "available" ? state.selectedReview.reviewId : null;
  const selectedHidden = selectedReviewId !== null &&
    !projection.rows.some((row) => row.reviewId === selectedReviewId);
  const hasRows = projection.rows.length > 0;

  const setGrouping = (grouping: ReviewCollectionGrouping) => {
    setCollectionPreferences({ ...collectionPreferences, grouping });
  };
  const setFilter = (filter: ReviewCollectionFilter) => {
    setCollectionPreferences({ ...collectionPreferences, filter });
  };
  const clearView = () => {
    setSearch("");
    setFilter("all");
  };

  useEffect(() => {
    const clearWhenFocusLeavesRows = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof HTMLAnchorElement && target.matches("[data-review-row]")) return;
      focusedReviewId.current = null;
    };
    document.addEventListener("focusin", clearWhenFocusLeavesRows);
    return () => document.removeEventListener("focusin", clearWhenFocusLeavesRows);
  }, []);

  useLayoutEffect(() => {
    const previous = focusedReviewId.current;
    if (!focusedQueueReviewWasRemoved(previous, projection.rows)) return;
    focusedReviewId.current = null;
    searchRef.current?.focus();
  }, [projection.rows]);

  const captureFocusedReview = (reviewId: ReviewId) => {
    focusedReviewId.current = reviewId;
  };

  const moveQueueFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement) || !target.matches("[data-review-row]")) return;
    if (!(["ArrowDown", "ArrowUp", "Home", "End"] as string[]).includes(event.key)) return;
    const rows = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[data-review-row]"));
    const current = rows.indexOf(target);
    if (current < 0 || rows.length === 0) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 :
      (current + (event.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length;
    const next = rows[nextIndex]!;
    next.focus();
    next.scrollIntoView({ block: "nearest" });
  };

  return (
    <div className={styles.collection} ref={collectionRef} onKeyDown={moveQueueFocus}>
      {snapshot.status === "ready" && snapshot.limitations && snapshot.limitations.length > 0 && (
        <p className={styles.limitations}>Partial local history — {snapshot.limitations.join(" ")}</p>
      )}
      <div className={styles.collectionTools}>
        <ReviewSearch value={search} onChange={setSearch} inputRef={searchRef} />
        <ReviewCollectionControls
          grouping={collectionPreferences.grouping}
          filter={collectionPreferences.filter}
          onGroupingChange={setGrouping}
          onFilterChange={setFilter}
        />
      </div>
      <p className={styles.feedback} aria-live="polite" aria-atomic="true">
        {selectedHidden ? "Selected review is hidden by the current view." : !hasRows ? "No reviews match this view." : ""}
      </p>
      {!hasRows && (
        <button className={styles.reset} type="button" onClick={clearView}>Clear view</button>
      )}
      {collectionPreferences.grouping === "semantic" ? (
        <div className={styles.groups}>{projection.groups.map((group) => <ReviewGroup key={group.groupId} group={group} onReviewFocus={captureFocusedReview} />)}</div>
      ) : (
        <ul className={styles.rows}>{projection.rows.map((row) => <ReviewRow key={row.reviewId} row={row} onReviewFocus={captureFocusedReview} />)}</ul>
      )}
    </div>
  );
}
