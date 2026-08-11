"use client";

import styles from "./review-collection.module.css";

type ReviewSearchProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
}>;

export default function ReviewSearch({ value, onChange }: ReviewSearchProps) {
  return (
    <label className={styles.search}>
      <span>Search reviews</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Title or repository"
      />
    </label>
  );
}
