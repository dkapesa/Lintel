import styles from "../public-r5-recalibrated.module.css";
import {
  AFFECTED_FILES,
  BLOCKING_REQUIREMENT,
  CANONICAL_REVIEW,
  MISSING_PROOF_RECORDS,
  PRIMARY_EVIDENCE,
  PRIMARY_FINDING,
  READINESS,
  REVIEW_OVERVIEW,
} from "../canonical-review";
import type { DemoStage } from "../demo-reducer";

interface ContextualInspectorProps {
  stage: DemoStage;
  animateEntrance: boolean;
}

const PROVENANCE_ROW = (
  <div className={styles.inspectorRow}>
    <span className={styles.inspectorLabel}>Provenance identity</span>
    <span className={`${styles.inspectorValue} ${styles.inspectorMono}`}>
      Head {CANONICAL_REVIEW.headSha} · {CANONICAL_REVIEW.branch}
    </span>
  </div>
);

/* R5E.1B/C — Contextual Inspector.
   Follows the state-to-surface mapping in
   docs/r5/R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md §9: each stage's
   Inspector column presents facts already stated in the canonical module —
   no new fact is introduced here, and every essential value stays at
   primary/secondary text weight (tertiary text carries only supplementary
   provenance, never an essential value alone). */
export function ContextualInspector({ stage, animateEntrance }: ContextualInspectorProps) {
  const inspectorClass = animateEntrance ? `${styles.inspector} ${styles.panelEnter}` : styles.inspector;

  if (stage === "finding") {
    return (
      <div key={stage} className={inspectorClass}>
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
        {PROVENANCE_ROW}
      </div>
    );
  }

  if (stage === "evidence") {
    return (
      <div key={stage} className={inspectorClass}>
        <p className={styles.inspectorHeading}>Evidence detail</p>
        {PRIMARY_EVIDENCE.map((evidence) => (
          <div className={styles.inspectorRow} key={evidence.recordKey}>
            <span className={styles.inspectorLabel}>{evidence.status}</span>
            <span className={styles.inspectorValue}>
              Supports <strong>{evidence.supports}</strong>
            </span>
          </div>
        ))}
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Evidence boundary</span>
          <span className={styles.inspectorValue}>{REVIEW_OVERVIEW.evidenceBoundary}</span>
        </div>
        {PROVENANCE_ROW}
      </div>
    );
  }

  if (stage === "missing-proof") {
    return (
      <div key={stage} className={inspectorClass}>
        <p className={styles.inspectorHeading}>Why the gap matters</p>
        {MISSING_PROOF_RECORDS.map((record) => (
          <div className={styles.inspectorRow} key={record.recordKey}>
            <span className={styles.inspectorLabel}>{record.status}</span>
            <span className={styles.inspectorValue}>
              Blocks progress on <strong>{record.affectsRequirement.title}</strong> ({record.affectsRequirement.state}
              ), related to {record.relatedFindingTitle.toLowerCase()}
            </span>
          </div>
        ))}
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Still available</span>
          <span className={styles.inspectorValue}>
            {PRIMARY_EVIDENCE.length} confirmed/present evidence records for the primary finding are unaffected by
            this gap.
          </span>
        </div>
      </div>
    );
  }

  if (stage === "requirement") {
    return (
      <div key={stage} className={inspectorClass}>
        <p className={styles.inspectorHeading}>Requirement definition</p>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Required proof</span>
          <span className={styles.inspectorValue}>{BLOCKING_REQUIREMENT.evidenceRequired}</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Contributing finding</span>
          <span className={styles.inspectorValue}>{BLOCKING_REQUIREMENT.contributingFindingTitle}</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Review condition</span>
          <span className={styles.inspectorValue}>
            {CANONICAL_REVIEW.requirementsSummary} — this requirement is one of the two blocking.
          </span>
        </div>
        {PROVENANCE_ROW}
      </div>
    );
  }

  if (stage === "affected-context") {
    return (
      <div key={stage} className={inspectorClass}>
        <p className={styles.inspectorHeading}>Relationship detail</p>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Primary surface</span>
          <span className={`${styles.inspectorValue} ${styles.inspectorMono}`}>{PRIMARY_FINDING.file}</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Files reached</span>
          <span className={styles.inspectorValue}>{AFFECTED_FILES.length} changed files in this review</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Highest risk file</span>
          <span className={styles.inspectorValue}>
            {AFFECTED_FILES[0].path} · {AFFECTED_FILES[0].risk}
          </span>
        </div>
        {PROVENANCE_ROW}
      </div>
    );
  }

  if (stage === "readiness") {
    return (
      <div key={stage} className={inspectorClass}>
        <p className={styles.inspectorHeading}>Decision-readiness context</p>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Classification</span>
          <span className={styles.inspectorValue}>{READINESS.classification} since the previous head</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Cleared since previous head</span>
          <span className={styles.inspectorValue}>{READINESS.clearedCount} requirements</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Became stale</span>
          <span className={styles.inspectorValue}>{READINESS.becameStaleCount} requirement</span>
        </div>
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorLabel}>Explicitly not a decision</span>
          <span className={styles.inspectorValue}>{READINESS.decisionContext}</span>
        </div>
      </div>
    );
  }

  if (stage === "overview") {
    return (
      <div key={stage} className={inspectorClass}>
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
    <div key={stage} className={`${styles.inspector} ${styles.panelEnter}`}>
      <p className={styles.inspectorHeading}>Next inspection</p>
      <div className={styles.inspectorRow}>
        <span className={styles.inspectorLabel}>Missing proof</span>
        <span className={styles.inspectorValue}>{REVIEW_OVERVIEW.nextInspection}</span>
      </div>
      <div className={styles.inspectorRow}>
        <span className={styles.inspectorLabel}>Evidence boundary</span>
        <span className={styles.inspectorValue}>{REVIEW_OVERVIEW.evidenceBoundary}</span>
      </div>
      {PROVENANCE_ROW}
    </div>
  );
}
