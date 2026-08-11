"use client";

import { useId, useState } from "react";
import type { ReviewCollectionFilter, ReviewCollectionGrouping } from "../../lib/r6e/collection-preferences";
import styles from "./review-collection.module.css";

type ReviewCollectionControlsProps = Readonly<{
  grouping: ReviewCollectionGrouping;
  filter: ReviewCollectionFilter;
  onGroupingChange: (grouping: ReviewCollectionGrouping) => void;
  onFilterChange: (filter: ReviewCollectionFilter) => void;
}>;

export default function ReviewCollectionControls({
  grouping,
  filter,
  onGroupingChange,
  onFilterChange,
}: ReviewCollectionControlsProps) {
  const [open, setOpen] = useState(false);
  const controlsId = useId();
  return (
    <div className={styles.controls}>
      <button
        className={styles.disclosure}
        type="button"
        aria-expanded={open}
        aria-controls={controlsId}
        onClick={() => setOpen((current) => !current)}
      >
        View options
      </button>
      {open && (
        <div id={controlsId} className={styles.controlPanel}>
          <label>
            <span>Group</span>
            <select value={grouping} onChange={(event) => onGroupingChange(event.target.value as ReviewCollectionGrouping)}>
              <option value="semantic">Verification state</option>
              <option value="none">None</option>
            </select>
          </label>
          <label>
            <span>State</span>
            <select value={filter} onChange={(event) => onFilterChange(event.target.value as ReviewCollectionFilter)}>
              <option value="all">All</option>
              <option value="attention">Needs attention</option>
              <option value="review">Review</option>
              <option value="ready">Ready</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
