import styles from "../public-r5-recalibrated.module.css";
import { CANONICAL_REVIEW, PRIMARY_FINDING, REVIEW_OVERVIEW } from "../canonical-review";
import type { DemoStage } from "../demo-reducer";

interface ContextualInspectorProps {
  stage: DemoStage;
}

/* R5E.1B — Contextual Inspector.
   Follows the state-to-surface mapping in
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §9: "queue" shows
   review-level next-inspection guidance, "overview" shows review-level
   context, "finding" shows finding detail and its explicit relationships.
   All three panels present facts already stated in the canonical module —
   no new fact is introduced here. */
export function ContextualInspector({ stage }: ContextualInspectorProps) {
  if (stage === "finding") {
    return (
      <div className={styles.inspector}>
        <p className={styles.inspectorHeading}>Finding detail</p>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Provenance</span>
          <span className={styles.inspectorValue}>{PRIMARY_FINDING.provenance}</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Affected surface</span>
          <span className={`${styles.inspectorValue} ${styles.inspectorMono}`}>{PRIMARY_FINDING.file}</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Related requirement</span>
          <span className={styles.inspectorValue}>
            {PRIMARY_FINDING.relatedRequirement.title} · {PRIMARY_FINDING.relatedRequirement.state}
          </span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Supported by</span>
          <span className={styles.inspectorValue}>{PRIMARY_FINDING.supportingEvidence.length} evidence records</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Provenance identity</span>
          <span className={`${styles.inspectorValue} ${styles.inspectorMono}`}>
            Head {CANONICAL_REVIEW.headSha} · {CANONICAL_REVIEW.branch}
          </span>
        </div>
      </div>
    );
  }

  if (stage === "overview") {
    return (
      <div className={styles.inspector}>
        <p className={styles.inspectorHeading}>Review-level context</p>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Confidence</span>
          <span className={styles.inspectorValue}>{CANONICAL_REVIEW.confidence}</span>
        </div>
        {REVIEW_OVERVIEW.reviewerFocus.map((item) => (
          <div className={styles.inspectorRow} key={item}>
            <span className={styles.inspectorLabel}>Reviewer focus</span>
            <span className={styles.inspectorValue}>{item}</span>
          </div>
        ))}
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Limitation</span>
          <span className={styles.inspectorValue}>{REVIEW_OVERVIEW.limitation}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inspector}>
      <p className={styles.inspectorHeading}>Next inspection</p>
      <div className={styles.inspectorRow}>
        <span className={styles.inspectorLabel}>Missing proof</span>
        <span className={styles.inspectorValue}>{REVIEW_OVERVIEW.nextInspection}</span>
      </div>
      <div className={styles.inspectorRow}>
        <span className={styles.inspectorLabel}>Evidence boundary</span>
        <span className={styles.inspectorValue}>{REVIEW_OVERVIEW.evidenceBoundary}</span>
      </div>
      <div className={styles.inspectorRow}>
        <span className={styles.inspectorLabel}>Provenance</span>
        <span className={`${styles.inspectorValue} ${styles.inspectorMono}`}>
          Head {CANONICAL_REVIEW.headSha} · {CANONICAL_REVIEW.branch}
        </span>
      </div>
    </div>
  );
}
