"use client";

import type { RefObject } from "react";
import styles from "./review-collection.module.css";

type ReviewSearchProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}>;

export default function ReviewSearch({ value, onChange, inputRef }: ReviewSearchProps) {
  return (
    <label className={styles.search}>
      <span>Search reviews</span>
      <input
        type="search"
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Title or repository"
      />
    </label>
  );
}
