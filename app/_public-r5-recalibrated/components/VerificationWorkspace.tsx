import styles from "../public-r5-recalibrated.module.css";
import { CANONICAL_REVIEW, PRIMARY_FINDING, REVIEW_OVERVIEW } from "../canonical-review";
import type { DemoStage } from "../demo-reducer";

interface VerificationWorkspaceProps {
  stage: DemoStage;
  onFocusFinding: () => void;
  onShowOverview: () => void;
}

/* R5E.1B — Verification Workspace, the dominant region of the shell
   (docs/r4/R4A_WORKSPACE_SHELL_CONTRACT.md "Verification Workspace
   anatomy"). Renders the genuine Overview record for "queue" and
   "overview" stages, and the genuine primary finding for "finding". The
   seven/five canonical values are identical across both panels — only the
   focused record changes (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §6:
   "Only the active record, Workspace focus and Inspector content change"). */
export function VerificationWorkspace({ stage, onFocusFinding, onShowOverview }: VerificationWorkspaceProps) {
  return (
    <div className={styles.workspace}>
      <div className={styles.workspaceHeader}>
        <span className={styles.workspaceRepoLine}>
          {CANONICAL_REVIEW.repository} · {CANONICAL_REVIEW.pullRequestLabel}
        </span>
        <p className={styles.workspaceTitle}>{CANONICAL_REVIEW.title}</p>
        <span className={styles.selectedTag}>{CANONICAL_REVIEW.selectedReviewLabel}</span>
      </div>

      <div className={styles.band}>
        <div className={styles.bandCell}>
          <span className={styles.bandCellLabel}>Recommendation</span>
          <span className={styles.bandCellValue}>{CANONICAL_REVIEW.recommendation}</span>
        </div>
        <div className={styles.bandCell}>
          <span className={styles.bandCellLabel}>Risk</span>
          <span className={styles.bandCellValue}>{CANONICAL_REVIEW.riskLabel}</span>
        </div>
        <div className={styles.bandCell}>
          <span className={styles.bandCellLabel}>Requirements</span>
          <span className={styles.bandCellValue}>{CANONICAL_REVIEW.requirementsSummary}</span>
        </div>
        <div className={styles.bandCell}>
          <span className={styles.bandCellLabel}>Human Decision</span>
          <span className={styles.bandCellValue}>{CANONICAL_REVIEW.humanDecision}</span>
        </div>
      </div>

      {stage === "finding" ? (
        <FindingPanel onShowOverview={onShowOverview} />
      ) : (
        <OverviewPanel onFocusFinding={onFocusFinding} />
      )}
    </div>
  );
}

function OverviewPanel({ onFocusFinding }: { onFocusFinding: () => void }) {
  return (
    <div>
      <p className={styles.panelHeading}>Overview</p>

      <div className={styles.nextInspectionBanner}>
        <strong>Next inspection</strong>
        {REVIEW_OVERVIEW.nextInspection}
      </div>

      <p className={styles.evidenceBoundaryLine}>{REVIEW_OVERVIEW.evidenceBoundary}</p>

      <div className={styles.findingCard}>
        <div className={styles.findingMeta}>
          <span>{PRIMARY_FINDING.severity}</span>
          <span>{PRIMARY_FINDING.category}</span>
        </div>
        <p className={styles.findingTitle}>{PRIMARY_FINDING.title}</p>
        <span className={styles.findingFile}>{PRIMARY_FINDING.file}</span>
      </div>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={onFocusFinding}>
          Inspect finding
        </button>
      </div>
    </div>
  );
}

function FindingPanel({ onShowOverview }: { onShowOverview: () => void }) {
  return (
    <div>
      <button type="button" className={styles.backButton} onClick={onShowOverview}>
        ← Back to overview
      </button>

      <p className={`${styles.panelHeading} ${styles.panelHeadingSpaced}`}>Finding</p>

      <div className={styles.findingCard}>
        <div className={styles.findingMeta}>
          <span>{PRIMARY_FINDING.severity}</span>
          <span>{PRIMARY_FINDING.category}</span>
          <span>{PRIMARY_FINDING.provenance}</span>
        </div>
        <p className={styles.findingTitle}>{PRIMARY_FINDING.title}</p>
        <p className={styles.findingStatement}>{PRIMARY_FINDING.statement}</p>
        <span className={styles.findingFile}>{PRIMARY_FINDING.file}</span>

        <ul className={styles.evidenceList}>
          {PRIMARY_FINDING.supportingEvidence.map((evidence) => (
            <li key={evidence.recordKey} className={styles.evidenceRow}>
              <span className={styles.evidenceStatus}>{evidence.status}</span>
              <span>{evidence.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
