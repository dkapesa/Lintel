"use client";

/* R1B.0 — Production Workspace V2 · Inspector plane.

   A pure projection of the current Workspace state. It never holds its own
   copy of the selected case or focused artifact: the route owner resolves the
   single `InspectorProjection` and passes it in. Unknown / absent data renders
   honestly rather than as an empty string. */

import styles from "../workspace-v2.module.css";
import {
  ArtifactMarker,
  DecisionActorProvenance,
  DecisionApplicabilityChip,
  DecisionDivergenceChip,
  DecisionOutcomeToken,
  SampleBadge,
  StrengthMeter,
} from "./atoms";
import { evidenceStatusTone, requirementStatusTone, severityTone } from "./presentation";
import { evidenceRank } from "../../../lib/workspace-v2/projections";
import {
  APPLICABILITY_LABEL,
  type CaseContextView,
  type DecisionPlateViewModel,
  type EvidenceComposition,
  type EvidenceView,
  type FindingView,
  type InspectorProjection,
  type RequirementView,
} from "../../../lib/workspace-v2/view-model";

/* The header label reflects which projection mode is active. */
function inspectorLabel(mode: InspectorProjection["mode"]): string {
  if (mode === "decision-context") return "Decision context";
  if (mode === "case-context") return "Case context";
  return "Artifact detail";
}

export function WorkspaceInspector({
  projection,
  canClear,
  onClear,
}: {
  projection: InspectorProjection;
  canClear: boolean;
  onClear: () => void;
}) {
  return (
    <aside className={styles.inspector} aria-label="Inspector">
      <div className={styles.planeHeader}>
        <span className={styles.planeLabel}>{inspectorLabel(projection.mode)}</span>
        {canClear ? (
          <button type="button" className={styles.inspectorClear} onClick={onClear}>
            Esc
          </button>
        ) : null}
      </div>

      <div className={styles.inspectorBody}>
        {projection.mode === "finding" ? <FindingInspector finding={projection.finding} /> : null}
        {projection.mode === "evidence" ? <EvidenceInspector record={projection.evidence} /> : null}
        {projection.mode === "requirement" ? (
          <RequirementInspector requirement={projection.requirement} />
        ) : null}
        {projection.mode === "decision-context" ? (
          <DecisionContextInspector decision={projection.decision} caseTitle={projection.caseTitle} />
        ) : null}
        {projection.mode === "case-context" ? (
          <CaseContextInspector
            title={projection.title}
            context={projection.context}
            composition={projection.composition}
            headSha={projection.headSha}
            updatedAt={projection.updatedAt}
          />
        ) : null}
      </div>
    </aside>
  );
}

function InspectorGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className={styles.inspectorGroup}>
      <span className={styles.inspectorGroupLabel}>{label}</span>
      {children}
    </section>
  );
}

function RefList({ ids, emptyLabel }: { ids: string[]; emptyLabel: string }) {
  if (ids.length === 0) {
    return <p className={styles.inspectorEmpty}>{emptyLabel}</p>;
  }
  return (
    <div className={styles.refList}>
      {ids.map((id) => (
        <span key={id} className={styles.ref}>
          {id}
        </span>
      ))}
    </div>
  );
}

function FindingInspector({ finding }: { finding: FindingView }) {
  return (
    <>
      <ArtifactMarker kind="Finding" id={finding.findingId} accent={severityTone(finding.severity)} />
      <h2 className={styles.inspectorTitle}>{finding.title}</h2>
      <p className={styles.inspectorLead}>{finding.statement}</p>

      <InspectorGroup label="Required action">
        <p className={styles.inspectorText}>{finding.action}</p>
      </InspectorGroup>

      <InspectorGroup label="Origin">
        <p className={styles.inspectorMono}>{finding.file}</p>
        <p className={styles.inspectorText}>
          {finding.category} · {finding.provenance}
        </p>
      </InspectorGroup>

      {/* Evidence supports the observation; requirements are what it opens.
          They are different relationships and never share one heading. */}
      <InspectorGroup label="Supporting evidence">
        <RefList ids={finding.supportingEvidenceIds} emptyLabel="No supporting evidence recorded" />
      </InspectorGroup>

      <InspectorGroup label="Related requirements">
        <RefList
          ids={finding.relatedRequirementIds}
          emptyLabel="No requirement opened by this observation"
        />
      </InspectorGroup>
    </>
  );
}

function EvidenceInspector({ record }: { record: EvidenceView }) {
  return (
    <>
      <ArtifactMarker kind="Evidence" id={record.evidenceId} accent={evidenceStatusTone(record.status)} />
      <h2 className={styles.inspectorTitle}>{record.title}</h2>
      <p className={styles.inspectorLead}>{record.statement}</p>

      <InspectorGroup label="Strength">
        <div className={styles.inspectorStrength}>
          <StrengthMeter rank={evidenceRank(record.evidenceClass)} />
          <span className={styles.inspectorText}>{record.evidenceClass}</span>
        </div>
        <p className={`${styles.inspectorText} ${evidenceStatusTone(record.status)}`}>
          {record.status}
          {record.stale ? " · stale" : ""}
        </p>
      </InspectorGroup>

      <InspectorGroup label="Origin">
        <p className={styles.inspectorMono}>{record.source}</p>
        <p className={styles.inspectorText}>
          {record.provenance} · observed {record.observedAt}
        </p>
      </InspectorGroup>

      <InspectorGroup label="Supports observations">
        <RefList ids={record.supportsFindingIds} emptyLabel="Not linked to an observation" />
      </InspectorGroup>
    </>
  );
}

function RequirementInspector({ requirement }: { requirement: RequirementView }) {
  return (
    <>
      <ArtifactMarker
        kind="Requirement"
        id={requirement.requirementId}
        accent={requirementStatusTone(requirement.status)}
      />
      <h2 className={styles.inspectorTitle}>{requirement.title}</h2>
      <p className={styles.inspectorLead}>{requirement.statement}</p>

      <InspectorGroup label="Proof required">
        <p className={styles.inspectorText}>{requirement.evidenceRequired}</p>
      </InspectorGroup>

      <InspectorGroup label="State">
        <p className={`${styles.inspectorText} ${requirementStatusTone(requirement.status)}`}>
          {requirement.importance} · {requirement.status}
          {requirement.stale ? " · stale" : ""}
        </p>
      </InspectorGroup>

      <InspectorGroup label="Satisfied by">
        <RefList ids={requirement.supportingEvidenceIds} emptyLabel="No evidence recorded yet" />
      </InspectorGroup>
    </>
  );
}

/* Decision Context. Read-only projection for R1B.0: latest decision summary,
   applicability, divergence (only when supplied), rationale and references.
   Terminology fixed to recorded / reaffirmed / withdrawn — never "signed". */
function DecisionContextInspector({
  decision,
  caseTitle,
}: {
  decision: DecisionPlateViewModel;
  caseTitle: string;
}) {
  if (decision.status === "empty") {
    return (
      <>
        <h2 className={styles.inspectorTitle}>No engineer decision recorded</h2>
        <p className={styles.inspectorLead}>
          The decision record for “{caseTitle}” was read successfully and is empty. Lintel
          recommends {decision.recommendation} with {decision.openBlockingRequirements} blocking
          requirement{decision.openBlockingRequirements === 1 ? "" : "s"} open.
        </p>
        <p className={styles.pendingNote}>
          Recording a decision is not wired in this scaffold. The record flow arrives with R1B.1
          production integration.
        </p>
      </>
    );
  }

  if (decision.status === "unavailable") {
    return (
      <>
        <h2 className={`${styles.inspectorTitle} ${styles.toneDanger}`}>Decision state unavailable</h2>
        <p className={styles.inspectorLead}>{decision.readError}</p>
        <p className={styles.pendingNote}>
          This is a read / projection failure, distinct from an empty record. Retry is not wired in
          this scaffold.
        </p>
      </>
    );
  }

  return (
    <>
      <div className={styles.inspectorDecisionHead}>
        <DecisionOutcomeToken outcome={decision.outcome} />
        {decision.isSample ? <SampleBadge /> : null}
      </div>
      <DecisionActorProvenance actor={decision.actor} recordedAt={decision.recordedAt} />

      <InspectorGroup label="Applicability">
        <div className={styles.inspectorDecisionHead}>
          <DecisionApplicabilityChip
            applicability={decision.applicability}
            priorHeadSha={decision.priorHeadSha}
            currentHeadSha={decision.currentHeadSha}
            headRecorded={decision.applicableHeadSha !== null}
          />
          {decision.divergence ? <DecisionDivergenceChip divergence={decision.divergence} /> : null}
        </div>
        <p className={styles.inspectorText}>{APPLICABILITY_LABEL[decision.applicability]}</p>
      </InspectorGroup>

      <InspectorGroup label="Rationale">
        {decision.rationale && decision.rationale.trim().length > 0 ? (
          <p className={styles.inspectorText}>{decision.rationale}</p>
        ) : (
          <p className={styles.inspectorEmpty}>No rationale recorded</p>
        )}
      </InspectorGroup>

      <InspectorGroup label="References">
        {decision.references.length === 0 ? (
          <p className={styles.inspectorEmpty}>No references recorded</p>
        ) : (
          <ul className={styles.referenceList}>
            {decision.references.map((reference) => (
              <li
                key={reference.id}
                className={`${styles.referenceRow} ${reference.available ? "" : styles.referenceGone}`}
              >
                <span className={styles.referenceKind}>{reference.kind}</span>
                <span className={styles.referenceLabel}>
                  {reference.available ? reference.label : "Reference no longer available"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </InspectorGroup>

      <InspectorGroup label="Commit binding">
        {decision.applicableHeadSha ? (
          <p className={styles.inspectorMono}>{decision.applicableHeadSha}</p>
        ) : (
          <p className={styles.inspectorEmpty}>Head not recorded</p>
        )}
      </InspectorGroup>

      <p className={styles.pendingNote}>
        Change, reaffirm and withdraw are not wired in this scaffold. Full history and the recorded
        decision flow arrive with R1B.1.
      </p>
    </>
  );
}

function CaseContextInspector({
  title,
  context,
  composition,
  headSha,
  updatedAt,
}: {
  title: string;
  context: CaseContextView;
  composition: EvidenceComposition;
  headSha: string | null;
  updatedAt: string;
}) {
  return (
    <>
      <h2 className={styles.inspectorTitle}>{title}</h2>
      <p className={styles.inspectorLead}>{context.summary}</p>

      <InspectorGroup label="Reviewer focus">
        <ul className={styles.inspectorPoints}>
          {context.reviewerFocus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </InspectorGroup>

      {/* Counts describe this case's own evidence only. No comparison,
          benchmark or organisational metric is implied. */}
      <InspectorGroup label={`Evidence composition · ${composition.total} records`}>
        <div className={styles.composition}>
          <CompositionRow label="Observed or verified" value={composition.strong} rank={4} />
          <CompositionRow label="Inferred or assumed" value={composition.inferred} rank={1} />
          <CompositionRow label="Missing or unverified" value={composition.incomplete} rank={0} />
          <CompositionRow label="Stale" value={composition.stale} rank={0} />
        </div>
      </InspectorGroup>

      {context.limitations.length > 0 ? (
        <InspectorGroup label="Limitations">
          <ul className={styles.inspectorPoints}>
            {context.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InspectorGroup>
      ) : null}

      <InspectorGroup label="Head">
        {headSha ? (
          <p className={styles.inspectorMono}>{headSha}</p>
        ) : (
          <p className={styles.inspectorEmpty}>Head not recorded</p>
        )}
        <p className={styles.inspectorText}>Updated {updatedAt}</p>
      </InspectorGroup>
    </>
  );
}

function CompositionRow({ label, value, rank }: { label: string; value: number; rank: number }) {
  return (
    <div className={styles.compositionRow}>
      <StrengthMeter rank={value === 0 ? 0 : rank} />
      <span className={styles.compositionLabel}>{label}</span>
      <span className={styles.compositionValue}>{value}</span>
    </div>
  );
}
