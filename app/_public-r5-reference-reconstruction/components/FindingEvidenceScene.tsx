import styles from "../reference-reconstruction.module.css";
import { SceneMotion } from "./SceneMotion";
import { PRIMARY_EVIDENCE, PRIMARY_FINDING } from "../../_public-r5-recalibrated/canonical-review";

/* R5E.1E.2A — Finding → Evidence → Provenance.

   One relationship only, per docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md
   §3 and §15. No requirements, no readiness, no queue, no Workspace: this
   scene shows a finding and the two canonical records that support it, each
   carrying its own provenance and source.

   Records come verbatim from PRIMARY_FINDING and PRIMARY_EVIDENCE — the same
   two case482 evidence records the frozen product renders. Status words
   ("confirmed", "present") are the fixture's own; they are never upgraded to
   an implied clearance, and green never appears in this canonical story
   (R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md §3).

   Both evidence records fit at author time, so the scene composes to fit with
   no fixed height and no internal scrolling. */
export function FindingEvidenceScene() {
  return (
    <SceneMotion className={styles.scene}>
      <div className={styles.scenePlate}>
        <div className={styles.sceneFrame}>
          <div className={styles.sceneChrome}>
            <span className={styles.mono}>{PRIMARY_FINDING.recordKey}</span>
            <span className={styles.sceneChromeTail}>Finding record</span>
          </div>

          <div className={styles.relationBody}>
            {/* Step 1: the finding is established — visible at rest. */}
            <article className={styles.relationHead}>
              <p className={styles.recordTags}>
                <span className={styles.tagSeverity}>{PRIMARY_FINDING.severity}</span>
                <span className={styles.tagPlain}>{PRIMARY_FINDING.category}</span>
                <span className={styles.tagPlain}>{PRIMARY_FINDING.provenance}</span>
              </p>
              <h3 className={styles.recordTitle}>{PRIMARY_FINDING.title}</h3>
              <p className={styles.recordStatement}>{PRIMARY_FINDING.statement}</p>
              <p className={styles.recordSource}>
                <code className={styles.mono}>{PRIMARY_FINDING.file}</code>
              </p>
            </article>

            {/* Step 2: the evidence relationship becomes visible. */}
            <p className={styles.relationEdge} data-step="2">
              <span className={styles.relationEdgeRule} aria-hidden="true" />
              <span className={styles.relationEdgeLabel}>
                Supported by {PRIMARY_EVIDENCE.length} canonical evidence records
              </span>
            </p>

            <ul className={styles.recordList} data-step="2">
              {PRIMARY_EVIDENCE.map((evidence) => (
                <li key={evidence.recordKey} className={styles.recordCard}>
                  <p className={styles.recordTags}>
                    <span className={styles.tagStatus} data-status={evidence.status}>
                      {evidence.status}
                    </span>
                    {/* Step 3: provenance receives restrained emphasis. */}
                    <span className={styles.tagProvenance} data-step="3">
                      {evidence.provenance}
                    </span>
                  </p>
                  <h4 className={styles.recordSubtitle}>{evidence.title}</h4>
                  <p className={styles.recordStatement}>{evidence.statement}</p>
                  <p className={styles.recordSource} data-step="3">
                    <code className={styles.mono}>{evidence.source}</code>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SceneMotion>
  );
}
