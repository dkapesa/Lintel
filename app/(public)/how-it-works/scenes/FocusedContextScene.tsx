import {
  SemanticStatus,
  TechnicalExcerpt,
} from "../../../_public/primitives";
import { STEP_03 } from "../how-it-works-content";
import styles from "../how-it-works.module.css";

export function FocusedContextScene() {
  return (
    <div className={styles.focusedContext} role="group" aria-label="Focused finding context">
      <SemanticStatus
        tone="blocking"
        label={`${STEP_03.finding.severity} · ${STEP_03.finding.category}`}
        detail={STEP_03.finding.provenance}
      />
      <TechnicalExcerpt label="Observed finding context">
        {`${STEP_03.finding.file}\n${STEP_03.finding.recordKey}\n${STEP_03.finding.statement}`}
      </TechnicalExcerpt>
    </div>
  );
}
