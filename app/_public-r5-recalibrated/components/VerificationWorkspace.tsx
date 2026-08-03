import styles from "../public-r5-recalibrated.module.css";
import {
  AFFECTED_CONTEXT_SUMMARY,
  AFFECTED_FILES,
  BLOCKING_REQUIREMENT,
  CANONICAL_REVIEW,
  DECISION_SURFACE_LABEL,
  MISSING_PROOF_RECORDS,
  PRIMARY_EVIDENCE,
  PRIMARY_FINDING,
  READINESS,
  REVIEW_OVERVIEW,
  STALE_EVIDENCE,
} from "../canonical-review";
import type { DemoStage } from "../demo-reducer";
import type { WorkingStage } from "../demo-reducer";
import { HumanDecisionContent } from "./HumanDecisionSurface";

interface VerificationWorkspaceProps {
  stage: DemoStage;
  onNavigate: (stage: WorkingStage) => void;
  onOpenDecision: () => void;
  animateEntrance: boolean;
}

/* R5E.1B/C — Verification Workspace, the dominant region of the shell
   (docs/r4/R4A_WORKSPACE_SHELL_CONTRACT.md "Verification Workspace
   anatomy"). Renders the genuine record for the active stage. The
   canonical values in the band below are identical across every panel —
   only the focused record changes
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §6: "Only the active
   record, Workspace focus and Inspector content change"). Each panel is
   re-keyed by stage so its entrance transition (public-r5-recalibrated
   .module.css `.panelEnter`, 200ms, the locked easing) plays once per
   activation without animating layout dimensions. */
export function VerificationWorkspace({ stage, onNavigate, onOpenDecision, animateEntrance }: VerificationWorkspaceProps) {
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

      <div key={stage} className={animateEntrance ? styles.panelEnter : undefined}>
        {stage === "finding" ? (
          <FindingPanel onNavigate={onNavigate} />
        ) : stage === "evidence" ? (
          <EvidencePanel onNavigate={onNavigate} />
        ) : stage === "missing-proof" ? (
          <MissingProofPanel onNavigate={onNavigate} />
        ) : stage === "requirement" ? (
          <RequirementPanel onNavigate={onNavigate} />
        ) : stage === "affected-context" ? (
          <AffectedContextPanel onNavigate={onNavigate} />
        ) : stage === "readiness" ? (
          <ReadinessPanel onOpenDecision={onOpenDecision} />
        ) : stage === "human-decision" ? (
          <HumanDecisionPanel onNavigate={onNavigate} onOpenDecision={onOpenDecision} />
        ) : (
          <OverviewPanel onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}

interface PanelProps {
  onNavigate: (stage: WorkingStage) => void;
}

function OverviewPanel({ onNavigate }: PanelProps) {
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
          <span className={styles.findingSeverityTag}>{PRIMARY_FINDING.severity}</span>
          <span>{PRIMARY_FINDING.category}</span>
        </div>
        <p className={styles.findingTitle}>{PRIMARY_FINDING.title}</p>
        <span className={styles.findingFile}>{PRIMARY_FINDING.file}</span>
      </div>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={() => onNavigate("finding")}>
          Inspect finding
        </button>
      </div>
    </div>
  );
}

function FindingPanel({ onNavigate }: PanelProps) {
  return (
    <div>
      <button type="button" className={styles.backButton} onClick={() => onNavigate("overview")}>
        ← Back to overview
      </button>

      <p className={`${styles.panelHeading} ${styles.panelHeadingSpaced}`}>Finding</p>

      <div className={styles.findingCard}>
        <div className={styles.findingMeta}>
          <span className={styles.findingSeverityTag}>{PRIMARY_FINDING.severity}</span>
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

      <p className={styles.panelNote}>
        The review remains unresolved. The next step is the canonical evidence behind this finding.
      </p>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={() => onNavigate("evidence")}>
          Inspect evidence
        </button>
      </div>
    </div>
  );
}

function EvidencePanel({ onNavigate }: PanelProps) {
  return (
    <div>
      <button type="button" className={styles.backButton} onClick={() => onNavigate("finding")}>
        ← Back to finding
      </button>

      <p className={`${styles.panelHeading} ${styles.panelHeadingSpaced}`}>Evidence</p>
      <p className={styles.panelNote}>
        Canonical evidence already on record for {PRIMARY_FINDING.title.toLowerCase()}. Nothing here was just
        collected, and no requirement has cleared.
      </p>

      <ul className={styles.recordList}>
        {PRIMARY_EVIDENCE.map((evidence) => (
          <li key={evidence.recordKey} className={styles.recordCard}>
            <div className={styles.recordCardHeader}>
              <span className={styles.evidenceStatus}>{evidence.status}</span>
              <span className={styles.recordCardProvenance}>{evidence.provenance}</span>
            </div>
            <p className={styles.recordCardTitle}>{evidence.title}</p>
            <p className={styles.recordCardStatement}>{evidence.statement}</p>
            <span className={styles.findingFile}>{evidence.source}</span>
          </li>
        ))}
      </ul>

      <p className={styles.evidenceBoundaryLine}>{REVIEW_OVERVIEW.evidenceBoundary}</p>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={() => onNavigate("missing-proof")}>
          Inspect missing proof
        </button>
      </div>
    </div>
  );
}

function MissingProofPanel({ onNavigate }: PanelProps) {
  return (
    <div>
      <button type="button" className={styles.backButton} onClick={() => onNavigate("evidence")}>
        ← Back to evidence
      </button>

      <p className={`${styles.panelHeading} ${styles.panelHeadingSpaced}`}>Missing proof</p>
      <p className={styles.panelNote}>
        Canonical evidence the review still lacks or has not verified. The gap is derived from evidence status, not
        newly generated, and remains unresolved.
      </p>

      <ul className={styles.recordList}>
        {MISSING_PROOF_RECORDS.map((record) => (
          <li key={record.recordKey} className={`${styles.recordCard} ${styles.recordCardWarning}`}>
            <div className={styles.recordCardHeader}>
              <span className={styles.evidenceStatusWarning}>{record.status}</span>
              <span className={styles.derivedTag}>Derived · not persisted</span>
            </div>
            <p className={styles.recordCardTitle}>{record.title}</p>
            <p className={styles.recordCardStatement}>{record.statement}</p>
            <p className={styles.recordCardRelation}>
              Affects <strong>{record.affectsRequirement.title}</strong> · {record.affectsRequirement.state}
            </p>
          </li>
        ))}
      </ul>

      <div className={styles.availableEvidenceNote}>
        <span className={styles.panelSubheading}>Evidence that remains available</span>
        <ul className={styles.inlineRecordList}>
          {PRIMARY_EVIDENCE.map((evidence) => (
            <li key={evidence.recordKey}>
              <span className={styles.evidenceStatus}>{evidence.status}</span> {evidence.title}
            </li>
          ))}
          <li>
            <span className={styles.evidenceStatusStale}>{STALE_EVIDENCE.status}</span> {STALE_EVIDENCE.title}
          </li>
        </ul>
      </div>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={() => onNavigate("requirement")}>
          Inspect requirement
        </button>
      </div>
    </div>
  );
}

function RequirementPanel({ onNavigate }: PanelProps) {
  return (
    <div>
      <button type="button" className={styles.backButton} onClick={() => onNavigate("missing-proof")}>
        ← Back to missing proof
      </button>

      <p className={`${styles.panelHeading} ${styles.panelHeadingSpaced}`}>Requirement</p>

      <div className={`${styles.recordCard} ${styles.recordCardBlocking}`}>
        <div className={styles.recordCardHeader}>
          <span className={styles.requirementBadge}>
            {BLOCKING_REQUIREMENT.importance} · {BLOCKING_REQUIREMENT.status}
          </span>
        </div>
        <p className={styles.recordCardTitle}>{BLOCKING_REQUIREMENT.title}</p>
        <p className={styles.recordCardStatement}>{BLOCKING_REQUIREMENT.statement}</p>
        <p className={styles.recordCardRelation}>
          Follows from <strong>{BLOCKING_REQUIREMENT.contributingFindingTitle}</strong>
        </p>
        <p className={styles.recordCardRelation}>Evidence required: {BLOCKING_REQUIREMENT.evidenceRequired}</p>
      </div>

      <p className={styles.panelNote}>
        This requirement remains open. No automated completion occurs here — the recommendation and risk shown above
        are unchanged.
      </p>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={() => onNavigate("affected-context")}>
          Inspect affected context
        </button>
      </div>
    </div>
  );
}

function AffectedContextPanel({ onNavigate }: PanelProps) {
  return (
    <div>
      <button type="button" className={styles.backButton} onClick={() => onNavigate("requirement")}>
        ← Back to requirement
      </button>

      <p className={`${styles.panelHeading} ${styles.panelHeadingSpaced}`}>Affected context</p>
      <p className={styles.panelNote}>{AFFECTED_CONTEXT_SUMMARY.intro}</p>

      <ul className={styles.affectedFileList}>
        {AFFECTED_FILES.map((file) => (
          <li key={file.path} className={styles.affectedFileRow}>
            <span className={styles.findingFile}>{file.path}</span>
            <span className={styles.affectedFileMeta}>
              +{file.additions} / -{file.deletions} · {file.risk}
            </span>
          </li>
        ))}
      </ul>

      <ul className={styles.concernList}>
        {AFFECTED_CONTEXT_SUMMARY.concerns.map((concern) => (
          <li key={concern}>{concern}</li>
        ))}
      </ul>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={() => onNavigate("readiness")}>
          Inspect readiness
        </button>
      </div>
    </div>
  );
}

function ReadinessPanel({ onOpenDecision }: { onOpenDecision: () => void }) {
  return (
    <div>
      <p className={styles.panelHeading}>Readiness</p>

      <div className={styles.readinessCard}>
        <p className={styles.readinessHeadline}>{READINESS.headline}</p>
        <p className={styles.readinessStats}>
          {READINESS.blockers} blockers · {READINESS.missingOrUnverified} missing/unverified · {READINESS.stale}{" "}
          stale
        </p>
        <p className={styles.recordCardStatement}>{READINESS.note}</p>
        <p className={styles.panelNote}>
          Risk moved from {READINESS.previousScore} to {READINESS.currentScore} since the previous head. This
          summary is read from the review's existing record, not recalculated for this transition.
        </p>
      </div>

      <p className={styles.panelNote}>{READINESS.decisionContext}</p>

      <p className={styles.humanDecisionOrientation}>
        The analysis and evidence record above are complete enough to inspect. Unresolved requirements remain, so
        readiness stays advisory — the accountable engineer retains <strong>08 Human Decision</strong>. Opening it
        selects nothing and submits nothing.
      </p>

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={onOpenDecision}>
          Open Human Decision
        </button>
      </div>
    </div>
  );
}

/* R5E.1E.1 correction — Human Decision is now the eighth embedded state of
   this same Workspace, exactly like Finding, Evidence, Missing proof,
   Requirement, Affected context and Readiness before it: reached whether by
   guided scroll or manual activation, it renders inline inside the
   Workspace's own content area — the same central boundaries, the same
   `.wrap`/`.panelEnter` treatment every other panel gets from the parent —
   never as a floating card over a dimmed shell. There is no separate
   "guided preview" component or layer any more; this panel and the manual
   dialog (HumanDecisionSurface.tsx) both render the one shared
   `HumanDecisionContent`, so nothing here duplicates or reinvents that
   content ("Preserve one shared Human Decision content model. Do not create
   two unrelated implementations."). The manual dialog remains the only
   genuinely elevated, scrimmed overlay — reached only by explicitly
   activating `onOpenDecision` below (or the spine's "08" button, or the
   Readiness panel's own button), never automatically. */
function HumanDecisionPanel({ onNavigate, onOpenDecision }: PanelProps & { onOpenDecision: () => void }) {
  return (
    <div>
      <button type="button" className={styles.backButton} onClick={() => onNavigate("readiness")}>
        ← Back to readiness
      </button>

      <p className={`${styles.panelHeading} ${styles.panelHeadingSpaced}`}>Human Decision</p>
      <p className={styles.decisionPreviewLabel}>{DECISION_SURFACE_LABEL.guided}</p>

      <HumanDecisionContent />

      <div className={styles.workspaceActions}>
        <button type="button" className={styles.workspaceActionBtn} onClick={onOpenDecision}>
          Open Human Decision
        </button>
      </div>
    </div>
  );
}
