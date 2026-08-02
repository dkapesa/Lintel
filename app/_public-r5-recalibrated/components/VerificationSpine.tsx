import styles from "../public-r5-recalibrated.module.css";
import { VERIFICATION_STAGES } from "../canonical-review";
import type { DemoStage } from "../demo-reducer";

interface VerificationSpineProps {
  stage: DemoStage;
  onShowOverview: () => void;
  onFocusFinding: () => void;
}

/* R5E.1B — initial verification spine treatment.
   All eight stages render as truthful orientation, per
   docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §7. Only "01 Change" (mapped
   to the truthful Overview content this phase builds) and "02 Finding" are
   interactive, per docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md §2; stages 03–08
   remain visible but are not styled or exposed as controls. No completion
   tick, no green: docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §7's colour
   rules and §3's "stage 08 renders neutral and pending, never complete". */
export function VerificationSpine({ stage, onShowOverview, onFocusFinding }: VerificationSpineProps) {
  const activeNo = stage === "finding" ? "02" : "01";

  return (
    <div className={styles.spineWrap}>
      <ol className={styles.spineList}>
        {VERIFICATION_STAGES.map((item) => {
          const isActive = item.no === activeNo;
          const isInteractive = item.no === "01" || item.no === "02";

          if (!isInteractive) {
            return (
              <li key={item.no} className={styles.spineItem} aria-hidden="true">
                <span className={styles.spineNo}>{item.no}</span>
                <span className={styles.spineName}>{item.name}</span>
              </li>
            );
          }

          return (
            <li key={item.no} className={`${styles.spineItem} ${isActive ? styles.spineItemActive : ""}`}>
              <button
                type="button"
                className={styles.spineButton}
                aria-pressed={isActive}
                onClick={item.no === "01" ? onShowOverview : onFocusFinding}
              >
                <span className={styles.spineNo}>{item.no}</span>
                <span className={styles.spineName}>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className={styles.spineCompact}>
        <strong>
          {activeNo} of {String(VERIFICATION_STAGES.length).padStart(2, "0")}
        </strong>
        {VERIFICATION_STAGES.find((item) => item.no === activeNo)?.name}
      </p>
    </div>
  );
}
