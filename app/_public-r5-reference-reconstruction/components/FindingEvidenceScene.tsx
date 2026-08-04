import styles from "../reference-reconstruction.module.css";
import { PRIMARY_EVIDENCE, PRIMARY_FINDING } from "../../_public-r5-recalibrated/canonical-review";
import { PublicSceneViews } from "./PublicSceneViews";

const DEFAULT_EVIDENCE_KEY = "ev_retry_path" as const;
const FINDING_EVIDENCE_SEQUENCE_DURATION = 4860;

function EvidenceRecord({ evidence }: { evidence: (typeof PRIMARY_EVIDENCE)[number] }) {
  return (
    <span className={styles.evidenceRecordContent}>
      <span className={styles.recordTags}>
        <span className={styles.tagStatus} data-status={evidence.status}>
          {evidence.status}
        </span>
        <span className={styles.tagProvenance}>{evidence.provenance}</span>
      </span>
      <span className={styles.recordSubtitle}>{evidence.title}</span>
      <span className={styles.recordStatement}>{evidence.statement}</span>
      <span className={styles.recordSource}>
        <code className={styles.mono}>{evidence.source}</code>
      </span>
    </span>
  );
}

function EvidenceTrace({ evidence }: { evidence: (typeof PRIMARY_EVIDENCE)[number] }) {
  return (
    <div className={styles.evidenceTraceSurface}>
      <p className={styles.microLabel}>Provenance and source</p>
      <p className={styles.evidenceTraceTitle}>{evidence.title}</p>
      <dl className={styles.evidenceTraceFacts}>
        <div>
          <dt>Provenance</dt>
          <dd>{evidence.provenance}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            <code className={styles.mono}>{evidence.source}</code>
          </dd>
        </div>
        <div>
          <dt>Supports</dt>
          <dd>{evidence.supports}</dd>
        </div>
        <div>
          <dt>Inspection implication</dt>
          <dd>{evidence.statement}</dd>
        </div>
      </dl>
    </div>
  );
}

/* R5E.1E.4B â€” the first bounded interaction gate.

   The finding is persistent and fixed. The two selectable records are exactly
   PRIMARY_FINDING.supportingEvidence, verified against case482 in the frozen
   fixture. Selection changes inspection focus only; it never changes a product
   value or performs work. PublicSceneViews adds the accepted vertical-tab
   semantics after hydration while preserving this complete server-rendered
   default. */
export function FindingEvidenceScene() {
  const views = PRIMARY_EVIDENCE.map((evidence) => ({
    key: evidence.recordKey,
    label: evidence.title,
    control: <EvidenceRecord evidence={evidence} />,
    panel: <EvidenceTrace evidence={evidence} />,
  }));

  return (
    <PublicSceneViews
      idPrefix="finding-evidence"
      classNames={{
        scene: `${styles.scene} ${styles.findingEvidenceScene}`,
        interaction: styles.publicSceneInteraction,
        plate: styles.scenePlate,
        frame: styles.sceneFrame,
        body: styles.relationBody,
        controls: styles.evidenceRecordList,
        staticControls: styles.evidenceRecordList,
        tab: styles.evidenceRecordTab,
        panelStack: styles.publicScenePanelStack,
        panel: styles.publicScenePanel,
      }}
      defaultKey={DEFAULT_EVIDENCE_KEY}
      groupLabel="Supporting evidence records"
      introductionDuration={FINDING_EVIDENCE_SEQUENCE_DURATION}
      orientation="vertical"
      staticControlPresentation="views"
      staticPanelLabel="Provenance and source"
      chrome={
        <div className={styles.sceneChrome}>
          <span className={styles.mono}>{PRIMARY_FINDING.recordKey}</span>
          <span className={styles.sceneChromeTail}>Finding record</span>
        </div>
      }
      persistent={
        <>
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

          <p className={`${styles.relationEdge} ${styles.evidenceRelationEdge}`}>
            <span className={styles.relationEdgeRule} aria-hidden="true" />
            <span className={styles.relationEdgeLabel}>
              Supported by {PRIMARY_EVIDENCE.length} canonical evidence records
            </span>
          </p>
        </>
      }
      views={views}
    />
  );
}
