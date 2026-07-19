"use client";

/* R1B.0 — Production Workspace V2 · Verification Canvas plane.

   The dominant plane. Three grid rows: a fixed case header, the single
   scrollable body carrying the Change / Observation / Evidence / Requirement
   stages, and the terminal Decision Plate row. Focus is a projection of the
   route-level `focusedArtifact` ref passed in; the canvas owns no selection
   state. A single focused artifact elevates while its siblings recede. */

import { type RefObject } from "react";
import styles from "../workspace-v2.module.css";
import { ArtifactMarker, ProvenanceBadge, StrengthMeter } from "./atoms";
import { DecisionPlateBoundary } from "./DecisionPlateBoundary";
import {
  evidenceStatusTone,
  recommendationTone,
  requirementStatusTone,
  riskTone,
  severityRankClass,
  severityTone,
} from "./presentation";
import { evidenceComposition, evidenceRank, isStrongEvidence, openBlockingCount } from "../../../lib/workspace-v2/projections";
import {
  RECOMMENDATION_LABEL,
  type ArtifactKind,
  type ArtifactRef,
  type CaseDetail,
  type DecisionPlateViewModel,
  type EvidenceView,
  type FindingView,
  type RequirementView,
} from "../../../lib/workspace-v2/view-model";

export function VerificationCanvas({
  detail,
  caseTitle,
  provenanceLabel,
  focus,
  onToggleFocus,
  bodyRef,
  decision,
  plateCurrent,
  onViewDecisionContext,
}: {
  detail: CaseDetail;
  caseTitle: string;
  provenanceLabel: string;
  focus: ArtifactRef | null;
  onToggleFocus: (kind: ArtifactKind, id: string) => void;
  bodyRef: RefObject<HTMLDivElement | null>;
  decision: DecisionPlateViewModel;
  plateCurrent: boolean;
  onViewDecisionContext: (trigger: HTMLElement) => void;
}) {
  const composition = evidenceComposition(detail);
  const isFocused = (kind: ArtifactKind, id: string) =>
    focus !== null && focus.kind === kind && focus.id === id;

  return (
    <section className={styles.canvas} aria-label="Verification canvas">
      {/* Row 1 — case header */}
      <header className={styles.caseHeader}>
        <div className={styles.caseIdentity}>
          <div className={styles.caseEyebrow}>
            <span className={styles.caseEyebrowLabel}>Workspace V2</span>
            <ProvenanceBadge label={provenanceLabel} />
          </div>
          <h1 className={styles.caseTitle}>{caseTitle}</h1>
          <div className={styles.caseMeta}>
            <span className={styles.caseMetaItem}>{detail.github.repository}</span>
            <span className={styles.caseMetaItem}>#{detail.github.pullRequestNumber}</span>
            <span className={styles.caseMetaItem}>{detail.github.branch}</span>
            <span className={styles.caseMetaItem}>{detail.github.headSha ?? "head not recorded"}</span>
            <span className={`${styles.caseMetaItem} ${styles.metaAuthor}`}>
              {detail.github.author}
            </span>
          </div>
        </div>

        <div className={styles.caseVerdict}>
          <span className={`${styles.verdictMark} ${recommendationTone(detail.recommendation)}`}>
            {RECOMMENDATION_LABEL[detail.recommendation]}
          </span>
          <span className={styles.verdictFacts}>
            <span className={riskTone(detail.riskLevel)}>{detail.riskLevel}</span>
            <span className={styles.metaDot}>·</span>
            <span>score {detail.riskScore}</span>
            <span className={styles.metaDot}>·</span>
            <span>confidence {detail.confidence}</span>
          </span>
        </div>
      </header>

      {/* Row 2 — the only canvas scroll region */}
      <div className={styles.canvasBody} id="wsv2-canvas-body" ref={bodyRef} tabIndex={-1}>
        <div className={`${styles.canvasInner} ${focus ? styles.canvasInnerFocusing : ""}`}>
          {/* Stage 1 — Change */}
          <section className={styles.stage} id="wsv2-stage-change">
            <StageHeading index="1" title="Change" meta={`${detail.changedFiles.length} files`} />
            <div className={styles.fileList}>
              {detail.changedFiles.map((file) => (
                <div key={file.path} className={styles.fileRow}>
                  <span className={styles.filePath}>{file.path}</span>
                  <span className={styles.fileStats}>
                    <span className={styles.additions}>+{file.additions}</span>
                    <span className={styles.deletions}>−{file.deletions}</span>
                    <span className={`${styles.fileRisk} ${riskTone(file.risk)}`}>{file.risk}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Stage 2 — Observation */}
          <section className={styles.stage} id="wsv2-stage-observation">
            <StageHeading index="2" title="Observation" meta={`${detail.findings.length} recorded`} />
            {detail.findings.length === 0 ? (
              <p className={styles.emptyState}>No observations recorded on this head.</p>
            ) : (
              <div className={styles.recordList}>
                {detail.findings.map((finding) => (
                  <FindingRecord
                    key={finding.findingId}
                    finding={finding}
                    focused={isFocused("finding", finding.findingId)}
                    onFocus={() => onToggleFocus("finding", finding.findingId)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Stage 3 — Evidence */}
          <section className={styles.stage} id="wsv2-stage-evidence">
            <StageHeading
              index="3"
              title="Evidence"
              meta={`${detail.evidence.length} records · ${composition.strong} strong`}
            />
            {detail.evidence.length === 0 ? (
              <p className={styles.emptyState}>No evidence recorded on this head.</p>
            ) : (
              <div className={styles.recordList}>
                {detail.evidence.map((record) => (
                  <EvidenceRecord
                    key={record.evidenceId}
                    record={record}
                    focused={isFocused("evidence", record.evidenceId)}
                    onFocus={() => onToggleFocus("evidence", record.evidenceId)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Stage 4 — Requirement */}
          <section className={styles.stage} id="wsv2-stage-requirement">
            <StageHeading
              index="4"
              title="Requirement"
              meta={`${openBlockingCount(detail)} blocking open · ${detail.requirements.length} total`}
            />
            {detail.requirements.length === 0 ? (
              <p className={styles.emptyState}>No requirements recorded on this head.</p>
            ) : (
              <div className={styles.recordList}>
                {detail.requirements.map((requirement) => (
                  <RequirementRecord
                    key={requirement.requirementId}
                    requirement={requirement}
                    focused={isFocused("requirement", requirement.requirementId)}
                    onFocus={() => onToggleFocus("requirement", requirement.requirementId)}
                  />
                ))}
              </div>
            )}

            <Movement detail={detail} />
          </section>
        </div>
      </div>

      {/* Row 3 — terminal act */}
      <DecisionPlateBoundary
        decision={decision}
        current={plateCurrent}
        onViewContext={onViewDecisionContext}
      />
    </section>
  );
}

function Movement({ detail }: { detail: CaseDetail }) {
  if (!detail.readiness.available) {
    return (
      <p className={styles.movementUnavailable}>
        Movement since a previous head is unavailable: {detail.readiness.reason}
      </p>
    );
  }
  const readiness = detail.readiness.readiness;
  return (
    <div className={styles.movement}>
      <span className={styles.movementLabel}>Movement since previous head</span>
      <span className={styles.movementFacts}>
        <span>
          score {readiness.previousScore} → {readiness.currentScore}
        </span>
        <span className={styles.metaDot}>·</span>
        <span>{readiness.clearedCount} cleared</span>
        <span className={styles.metaDot}>·</span>
        <span>{readiness.openedCount} opened</span>
        <span className={styles.metaDot}>·</span>
        <span>{readiness.becameStaleCount} became stale</span>
      </span>
      <p className={styles.movementNote}>{readiness.note}</p>
    </div>
  );
}

function StageHeading({ index, title, meta }: { index: string; title: string; meta: string }) {
  return (
    <div className={styles.stageHeading}>
      <span className={styles.stageIndex}>{index}</span>
      <h2 className={styles.stageTitle}>{title}</h2>
      <span className={styles.stageMeta}>{meta}</span>
    </div>
  );
}

function FindingRecord({
  finding,
  focused,
  onFocus,
}: {
  finding: FindingView;
  focused: boolean;
  onFocus: () => void;
}) {
  return (
    <article
      className={`${styles.record} ${styles.focusable} ${styles.recordFinding} ${severityRankClass(
        finding.severity,
      )} ${focused ? styles.recordFocused : ""}`}
    >
      <button type="button" className={styles.recordButton} onClick={onFocus} aria-pressed={focused}>
        <span className={styles.recordTop}>
          <span className={styles.recordTitle}>{finding.title}</span>
          <span className={`${styles.recordSeverity} ${severityTone(finding.severity)}`}>
            {finding.severity}
          </span>
        </span>
        <span className={styles.recordStatement}>{finding.statement}</span>
        {!focused ? (
          <span className={styles.recordFoot}>
            <span className={styles.technical}>{finding.file}</span>
            <span className={styles.metaDot}>·</span>
            <span>{finding.category}</span>
            {finding.provenance === "Model assisted" ? (
              <>
                <span className={styles.metaDot}>·</span>
                <span className={styles.toneProvenance}>model assisted</span>
              </>
            ) : null}
          </span>
        ) : null}
      </button>

      {focused ? (
        <div className={styles.recordExpansion}>
          <ArtifactMarker kind="Finding" id={finding.findingId} accent={severityTone(finding.severity)} />
          <p className={styles.proofBlock}>
            <span className={styles.proofLabel}>Required action</span>
            {finding.action}
          </p>
          <div className={styles.recordFoot}>
            <span className={styles.technical}>{finding.file}</span>
            <span className={styles.metaDot}>·</span>
            <span>{finding.category}</span>
            <span className={styles.metaDot}>·</span>
            <span>{finding.provenance}</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function EvidenceRecord({
  record,
  focused,
  onFocus,
}: {
  record: EvidenceView;
  focused: boolean;
  onFocus: () => void;
}) {
  const strong = isStrongEvidence(record.evidenceClass);
  return (
    <article
      className={`${styles.record} ${styles.focusable} ${styles.recordEvidence} ${
        strong ? styles.evStrong : styles.evWeak
      } ${record.stale ? styles.evStale : ""} ${
        record.status === "missing" ? styles.evMissing : ""
      } ${focused ? styles.recordFocused : ""}`}
    >
      <button type="button" className={styles.recordButton} onClick={onFocus} aria-pressed={focused}>
        <span className={styles.recordTop}>
          <span className={styles.recordTitle}>{record.title}</span>
          <span className={styles.evidenceState}>
            <StrengthMeter rank={evidenceRank(record.evidenceClass)} />
            <span className={`${styles.evidenceStatus} ${evidenceStatusTone(record.status)}`}>
              {record.status}
            </span>
          </span>
        </span>
        <span className={styles.recordStatement}>{record.statement}</span>
        <span className={styles.recordFoot}>
          <span className={styles.evidenceClass}>{record.evidenceClass}</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.technical}>{record.source}</span>
          {record.stale ? <span className={styles.staleFlag}>stale · {record.observedAt}</span> : null}
        </span>
      </button>

      {focused ? (
        <div className={styles.recordExpansion}>
          <ArtifactMarker kind="Evidence" id={record.evidenceId} accent={evidenceStatusTone(record.status)} />
          <div className={styles.recordFoot}>
            <span>{record.provenance}</span>
            <span className={styles.metaDot}>·</span>
            <span>observed {record.observedAt}</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function RequirementRecord({
  requirement,
  focused,
  onFocus,
}: {
  requirement: RequirementView;
  focused: boolean;
  onFocus: () => void;
}) {
  const blocking = requirement.importance === "blocking";
  return (
    <article
      className={`${styles.record} ${styles.focusable} ${styles.recordRequirement} ${
        blocking ? styles.reqBlocking : styles.reqAdvisory
      } ${requirement.status === "satisfied" ? styles.reqSatisfied : ""} ${
        requirement.stale ? styles.reqStale : ""
      } ${focused ? styles.recordFocused : ""}`}
    >
      <button type="button" className={styles.recordButton} onClick={onFocus} aria-pressed={focused}>
        <span className={styles.recordTop}>
          <span className={styles.recordTitle}>{requirement.title}</span>
          <span className={styles.reqState}>
            {blocking ? <span className={styles.reqBlockingFlag}>blocking</span> : null}
            <span className={`${styles.reqStatus} ${requirementStatusTone(requirement.status)}`}>
              {requirement.status}
            </span>
          </span>
        </span>
        <span className={styles.recordStatement}>{requirement.statement}</span>
      </button>

      {focused ? (
        <div className={styles.recordExpansion}>
          <ArtifactMarker
            kind="Requirement"
            id={requirement.requirementId}
            accent={requirementStatusTone(requirement.status)}
          />
          <p className={styles.proofBlock}>
            <span className={styles.proofLabel}>Proof required</span>
            {requirement.evidenceRequired}
          </p>
        </div>
      ) : null}
    </article>
  );
}
