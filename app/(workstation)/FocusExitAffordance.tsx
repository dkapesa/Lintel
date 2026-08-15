"use client";

import { EXIT_FOCUS_MODE_ACTION } from "../../lib/r6m/actions";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export default function FocusExitAffordance() {
  const { state, band, dispatchBound } = useWorkstation();
  if (state.destination !== "reviews" || !state.focus.active || band === "narrow") return null;
  return (
    <button
      className={styles.focusExitAffordance}
      type="button"
      aria-label="Exit Focus Mode"
      title="Exit Focus Mode"
      onClick={() => dispatchBound(EXIT_FOCUS_MODE_ACTION, "visible-ui")}
    >
      <span aria-hidden="true">›</span>
    </button>
  );
}
