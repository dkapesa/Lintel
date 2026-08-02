import styles from "../public-r5-recalibrated.module.css";
import { VERIFICATION_STAGES } from "../canonical-review";
import { WORKING_STAGE_ORDER, workingStageFor } from "../demo-reducer";
import type { DemoMode, DemoStage, WorkingStage } from "../demo-reducer";

interface VerificationSpineProps {
  stage: DemoStage;
  mode: DemoMode;
  onNavigate: (stage: WorkingStage) => void;
  onResumeGuided: () => void;
}

/* Maps the product's own stage numbers to this prototype's working stages.
   "08 Human Decision" maps to null: it stays a meaningful, visible,
   non-interactive orientation item, per
   docs/r5/R5E1A_IMPLEMENTATION_HANDOFF.md §3 ("Does not build: the Human
   Decision surface in either form") — never a disabled button, never
   removed from the accessibility tree. */
const STAGE_TARGET: Record<string, WorkingStage | null> = {
  "01": "overview",
  "02": "finding",
  "03": "evidence",
  "04": "missing-proof",
  "05": "requirement",
  "06": "affected-context",
  "07": "readiness",
  "08": null,
};

/* R5E.1C — the complete verification spine. All eight product stages
   render with their genuine names and numbers
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §7). Stages 01–07 are
   semantic <button>s, each an independent tab stop with aria-pressed
   reflecting the active stage — the same simple-native-button pattern
   R5E.1B used for 01–02, deliberately not a roving-focus composite, per
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §6a.2's preference
   for simple buttons unless a composite gives a clear accessibility
   benefit. No completion tick, no green, no checkout-stepper affordance:
   only the single active stage carries a non-colour emphasis marker. */
export function VerificationSpine({ stage, mode, onNavigate, onResumeGuided }: VerificationSpineProps) {
  const activeWorkingStage = workingStageFor(stage) ?? "overview";
  const activeNo = VERIFICATION_STAGES.find((item) => STAGE_TARGET[item.no] === activeWorkingStage)?.no ?? "01";
  const activeStageMeta = VERIFICATION_STAGES.find((item) => item.no === activeNo);
  const activeIndex = WORKING_STAGE_ORDER.indexOf(activeWorkingStage);
  const previousStage = activeIndex > 0 ? WORKING_STAGE_ORDER[activeIndex - 1] : null;
  const nextStage = activeIndex < WORKING_STAGE_ORDER.length - 1 ? WORKING_STAGE_ORDER[activeIndex + 1] : null;

  return (
    <div className={styles.spineWrap}>
      <ol className={styles.spineList}>
        {VERIFICATION_STAGES.map((item) => {
          const target = STAGE_TARGET[item.no];
          const isActive = item.no === activeNo;

          if (!target) {
            return (
              <li key={item.no} className={`${styles.spineItem} ${styles.spineItemPending}`}>
                <span className={styles.spineNo}>{item.no}</span>
                <span className={styles.spineName}>{item.name}</span>
                <span className={styles.spinePendingTag}>Pending</span>
              </li>
            );
          }

          return (
            <li key={item.no} className={`${styles.spineItem} ${isActive ? styles.spineItemActive : ""}`}>
              <button
                type="button"
                className={styles.spineButton}
                aria-pressed={isActive}
                onClick={() => onNavigate(target)}
              >
                <span className={styles.spineNo}>{item.no}</span>
                <span className={styles.spineName}>{item.name}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className={styles.spineCompactBar}>
        <button
          type="button"
          className={styles.spineCompactNav}
          onClick={() => previousStage && onNavigate(previousStage)}
          disabled={!previousStage}
          aria-label="Previous stage"
        >
          ← Previous
        </button>
        <p className={styles.spineCompact}>
          <strong>
            {activeNo} of {String(VERIFICATION_STAGES.length).padStart(2, "0")}
          </strong>
          {activeStageMeta?.name}
        </p>
        <button
          type="button"
          className={styles.spineCompactNav}
          onClick={() => nextStage && onNavigate(nextStage)}
          disabled={!nextStage}
          aria-label="Next stage"
        >
          Next →
        </button>
      </div>

      {mode === "manual" ? (
        <div className={styles.resumeGuidedRow}>
          <p className={styles.resumeGuidedNote}>Guided scrolling is paused because you chose a stage directly.</p>
          <button type="button" className={styles.resumeGuidedButton} onClick={onResumeGuided}>
            Resume guided tour
          </button>
        </div>
      ) : null}
    </div>
  );
}
