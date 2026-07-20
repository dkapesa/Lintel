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
import { evidenceStatusTone, requirementStatusTone, riskTone, severityTone } from "./presentation";
import { evidenceRank } from "../../../lib/workspace-v2/projections";
import {
  APPLICABILITY_LABEL,
  type ArtifactRef,
  type CaseContextView,
  type ChangedFileView,
  type DecisionPlateViewModel,
  type EvidenceComposition,
  type EvidenceView,
  type FindingView,
  type InspectorProjection,
  type RelationshipState,
  type RequirementView,
} from "../../../lib/workspace-v2/view-model";

const ARTIFACT_KIND_LABEL: Record<ArtifactRef["kind"], string> = {
  change: "Change",
  finding: "Observation",
  evidence: "Evidence",
  requirement: "Requirement",
};

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
  onActivate,
}: {
  projection: InspectorProjection;
  canClear: boolean;
  onClear: () => void;
  onActivate: (ref: ArtifactRef) => void;
}) {
  return (
    <aside className={styles.inspector} aria-label="Inspector">
      <div className={styles.planeHeader}>
        <span className={styles.planeLabel}>{inspectorLabel(projection.mode)}</span>
        {canClear ? (
          <button
            type="button"
            className={styles.inspectorClear}
            onClick={onClear}
            aria-label="Clear focus (Escape)"
            title="Clear focus (Escape)"
          >
            <span aria-hidden="true">Esc</span>
          </button>
        ) : null}
      </div>

      <div className={styles.inspectorBody}>
        {projection.mode === "change" ? (
          <ChangeInspector changedFile={projection.changedFile} onActivate={onActivate} />
        ) : null}
        {projection.mode === "finding" ? (
          <FindingInspector finding={projection.finding} onActivate={onActivate} />
        ) : null}
        {projection.mode === "evidence" ? (
          <EvidenceInspector record={projection.evidence} onActivate={onActivate} />
        ) : null}
        {projection.mode === "requirement" ? (
          <RequirementInspector requirement={projection.requirement} onActivate={onActivate} />
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

/* Truthful rendering of one relationship edge. Every state prints explanatory
   copy — an empty section is never shown blank (R1B.3 Inspector causality):
     linked      → activatable buttons to each related artifact, plus any
                   partially-unresolved stored references;
     none        → the neutral "no relationship recorded" copy;
     unavailable → the exact reason the edge is not derivable;
     unresolved  → the "could not be resolved" copy and the dangling ids. */
function RelationshipSection({
  label,
  state,
  onActivate,
  emptyLabel,
  unresolvedLabel,
}: {
  label: string;
  state: RelationshipState;
  onActivate: (ref: ArtifactRef) => void;
  emptyLabel: string;
  unresolvedLabel: string;
}) {
  return (
    <InspectorGroup label={label}>
      {state.status === "unavailable" ? (
        <p className={styles.inspectorEmpty}>{state.reason}</p>
      ) : state.status === "none" ? (
        <p className={styles.inspectorEmpty}>{emptyLabel}</p>
      ) : state.status === "unresolved" ? (
        <>
          <p className={styles.inspectorEmpty}>{unresolvedLabel}</p>
          <div className={styles.refList}>
            {state.unresolved.map((id) => (
              <span key={id} className={styles.ref}>
                {id}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles.relatedList}>
            {state.related.map((artifact) => (
              <button
                key={`${artifact.kind}:${artifact.id}`}
                type="button"
                className={styles.relatedButton}
                onClick={() => onActivate({ kind: artifact.kind, id: artifact.id })}
              >
                <span className={styles.relatedKind}>{ARTIFACT_KIND_LABEL[artifact.kind]}</span>
                <span className={styles.relatedLabel}>{artifact.label}</span>
                {artifact.detail ? (
                  <span className={styles.relatedDetail}>{artifact.detail}</span>
                ) : null}
              </button>
            ))}
          </div>
          {state.unresolved.length > 0 ? (
            <p className={styles.inspectorEmpty}>
              {unresolvedLabel}: {state.unresolved.join(", ")}
            </p>
          ) : null}
        </>
      )}
    </InspectorGroup>
  );
}

function ChangeInspector({
  changedFile,
  onActivate,
}: {
  changedFile: ChangedFileView;
  onActivate: (ref: ArtifactRef) => void;
}) {
  return (
    <>
      <ArtifactMarker kind="Change" id={changedFile.artifactId} accent={styles.toneMuted} />
      <h2 className={styles.inspectorTitle}>{changedFile.path}</h2>

      <InspectorGroup label="File change">
        <p className={styles.inspectorText}>
          {changedFile.additions === null ? "+—" : `+${changedFile.additions}`}
          {" · "}
          {changedFile.deletions === null ? "−—" : `−${changedFile.deletions}`}
          {" · "}
          {changedFile.risk === null ? (
            "risk not recorded"
          ) : (
            <span className={riskTone(changedFile.risk)}>{changedFile.risk} risk</span>
          )}
        </p>
      </InspectorGroup>

      <RelationshipSection
        label="Observations affecting this change"
        state={changedFile.observations}
        onActivate={onActivate}
        emptyLabel="No observation references this change"
        unresolvedLabel="Observation reference could not be resolved"
      />

      <RelationshipSection
        label="Direct evidence"
        state={changedFile.evidence}
        onActivate={onActivate}
        emptyLabel="No evidence directly identifies this change. Evidence remains reachable through the observations above."
        unresolvedLabel="Evidence reference could not be resolved"
      />
    </>
  );
}

function FindingInspector({
  finding,
  onActivate,
}: {
  finding: FindingView;
  onActivate: (ref: ArtifactRef) => void;
}) {
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

      {/* Change → Observation, then the two distinct outward edges: evidence
          supports the observation; requirements are what it opens. */}
      <RelationshipSection
        label="Affected change"
        state={finding.affectedChange}
        onActivate={onActivate}
        emptyLabel="No affected change recorded"
        unresolvedLabel="Affected change could not be resolved"
      />

      <RelationshipSection
        label="Supporting evidence"
        state={finding.supportingEvidence}
        onActivate={onActivate}
        emptyLabel="No explicit supporting evidence recorded"
        unresolvedLabel="Evidence reference could not be resolved"
      />

      <RelationshipSection
        label="Related requirements"
        state={finding.relatedRequirements}
        onActivate={onActivate}
        emptyLabel="No explicit requirement relationship recorded"
        unresolvedLabel="Requirement reference could not be resolved"
      />
    </>
  );
}

function EvidenceInspector({
  record,
  onActivate,
}: {
  record: EvidenceView;
  onActivate: (ref: ArtifactRef) => void;
}) {
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

      <RelationshipSection
        label="Supports observations"
        state={record.supportsFindings}
        onActivate={onActivate}
        emptyLabel="No explicit observation relationship recorded"
        unresolvedLabel="Observation reference could not be resolved"
      />

      <RelationshipSection
        label="Supports requirements"
        state={record.supportsRequirements}
        onActivate={onActivate}
        emptyLabel="No explicit requirement relationship recorded"
        unresolvedLabel="Requirement reference could not be resolved"
      />

      <RelationshipSection
        label="Changed file"
        state={record.relatedChanges}
        onActivate={onActivate}
        emptyLabel="No changed file directly identified by this evidence"
        unresolvedLabel="Changed file reference could not be resolved"
      />
    </>
  );
}

function RequirementInspector({
  requirement,
  onActivate,
}: {
  requirement: RequirementView;
  onActivate: (ref: ArtifactRef) => void;
}) {
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

      <RelationshipSection
        label="Current supporting evidence"
        state={requirement.supportingEvidence}
        onActivate={onActivate}
        emptyLabel="No current supporting evidence recorded"
        unresolvedLabel="Supporting evidence reference could not be resolved"
      />

      <RelationshipSection
        label="Related observations"
        state={requirement.relatedFindings}
        onActivate={onActivate}
        emptyLabel="No explicit observation relationship recorded"
        unresolvedLabel="Observation reference could not be resolved"
      />
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
