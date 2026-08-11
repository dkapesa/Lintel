"use client";

import { useMemo, useState } from "react";
import { projectReviewCollection } from "../../lib/r6e/collection-projection";
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

  return (
    <div className={styles.collection}>
      {snapshot.status === "ready" && snapshot.limitations && snapshot.limitations.length > 0 && (
        <p className={styles.limitations}>Partial local history — {snapshot.limitations.join(" ")}</p>
      )}
      <div className={styles.collectionTools}>
        <ReviewSearch value={search} onChange={setSearch} />
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
        <div className={styles.groups}>{projection.groups.map((group) => <ReviewGroup key={group.groupId} group={group} />)}</div>
      ) : (
        <ul className={styles.rows}>{projection.rows.map((row) => <ReviewRow key={row.reviewId} row={row} />)}</ul>
      )}
    </div>
  );
}
