import { modeLabel } from "../../lib/r6f/index";
import type { ReviewMode } from "../../lib/r6c/index";
import styles from "./selected-review.module.css";

export default function ReviewModeUnavailable({ mode }: { mode: Exclude<ReviewMode, "overview" | "evidence" | "requirements" | "change" | "history"> }) {
  const label = modeLabel(mode);
  return (
    <section className={styles.unavailableMode} aria-labelledby={`review-mode-${mode}`}>
      <h2 id={`review-mode-${mode}`}>{label}</h2>
      <p>{label} is not available in this build of Lintel.</p>
    </section>
  );
}
