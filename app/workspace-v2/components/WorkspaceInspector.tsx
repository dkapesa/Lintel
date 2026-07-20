"use client";

/* R1B.0 — Production Workspace V2 · Inspector plane.

   A pure projection of the current Workspace state. It never holds its own
   copy of the selected case or focused artifact: the route owner resolves the
   single `InspectorProjection` and passes it in. Unknown / absent data renders
   honestly rather than as an empty string. */

import { useState } from "react";
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
import type { MutationResult } from "../../../lib/workspace-v2/persistence";
import {
  APPLICABILITY_LABEL,
  type ArtifactRef,
  type CaseContextView,
  type ChangedFileView,
  type ConditionProgressCapability,
  type DecisionPlateViewModel,
  type EvidenceComposition,
  type EvidenceView,
  type FindingView,
  type InspectorProjection,
  type RelationshipState,
  type RequirementView,
  type ReviewStateMutationCapability,
  type ReviewStatus,
} from "../../../lib/workspace-v2/view-model";

/* The only condition capability shape the controls act on. */
type AvailableCondition = Extract<ConditionProgressCapability, { kind: "available" }>;

/* The interactive persistence bundle passed from the route owner. Present only
   in real mode; when null the Inspector renders read-only copy from capabilities
   alone. `busy` is true whenever ANY command is in flight, so every control is
   disabled to prevent a concurrent or duplicate write; `pending`/
   `pendingConditionKey` mark the exact in-flight command for its own control. */
export type InspectorMutations = {
  review: {
    pending: boolean;
    busy: boolean;
    result: MutationResult | null;
    onApply: (status: ReviewStatus) => void;
  };
  condition: {
    pendingConditionKey: string | null;
    busy: boolean;
    result: { conditionKey: string; result: MutationResult } | null;
    onToggle: (capability: AvailableCondition, intent: "clear" | "reopen") => void;
  };
};

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
  reviewStateMutation,
  mutations,
}: {
  projection: InspectorProjection;
  canClear: boolean;
  onClear: () => void;
  onActivate: (ref: ArtifactRef) => void;
  /* Case-level review-status capability (from the active case). */
  reviewStateMutation: ReviewStateMutationCapability;
  /* Interactive persistence handlers, or null in read-only / fixture mode. */
  mutations: InspectorMutations | null;
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
          <RequirementInspector
            requirement={projection.requirement}
            onActivate={onActivate}
            conditionMutations={mutations?.condition ?? null}
          />
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
            reviewStateMutation={reviewStateMutation}
            reviewMutations={mutations?.review ?? null}
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
  conditionMutations,
}: {
  requirement: RequirementView;
  onActivate: (ref: ArtifactRef) => void;
  conditionMutations: InspectorMutations["condition"] | null;
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

      <ConditionProgressControl
        capability={requirement.conditionProgress}
        mutations={conditionMutations}
      />

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

/* --- Persistence controls (R1B.5) ------------------------------------- */

/* Restrained inline mutation status. Text — never colour alone — carries the
   outcome; the tone class is supplementary. This is NOT a live region: the route
   owner announces the same message once via its polite region, so putting a live
   role here too would double-speak and announce on every render. */
function MutationStatus({ result }: { result: MutationResult }) {
  const tone =
    result.outcome === "persisted"
      ? styles.toneSuccess
      : result.outcome === "unchanged"
        ? styles.toneMuted
        : result.outcome === "unavailable"
          ? styles.toneWarning
          : styles.toneDanger;
  return <p className={`${styles.mutationStatus} ${tone}`}>{result.message}</p>;
}

/* Clear / reopen an exact persisted merge condition. Only rendered as an active
   control when the requirement maps to a canonical condition (`available`);
   otherwise it explains, truthfully, why progress cannot be persisted here. */
function ConditionProgressControl({
  capability,
  mutations,
}: {
  capability: ConditionProgressCapability;
  mutations: InspectorMutations["condition"] | null;
}) {
  if (capability.kind === "read-only-sample") {
    return (
      <InspectorGroup label="Condition progress">
        <p className={styles.inspectorEmpty}>
          Sample condition. Progress is demonstrative here and is never written to this browser.
        </p>
      </InspectorGroup>
    );
  }

  if (capability.kind === "read-only") {
    return (
      <InspectorGroup label="Condition progress">
        <p className={styles.inspectorEmpty}>{capability.reason}</p>
      </InspectorGroup>
    );
  }

  /* Available identity but no interactive handler (e.g. the mutation service
     could not be created in this browser): explain rather than show a bare
     disabled control. */
  if (mutations === null) {
    return (
      <InspectorGroup label="Condition progress">
        <p className={styles.inspectorText}>
          Recorded as <strong>{capability.cleared ? "cleared" : "open"}</strong>.
        </p>
        <p className={styles.inspectorEmpty}>
          Changes cannot be saved in this browser right now, so condition progress is read-only.
        </p>
      </InspectorGroup>
    );
  }

  const pending = mutations.pendingConditionKey === capability.conditionKey;
  const disabled = mutations.busy;
  const intent: "clear" | "reopen" = capability.cleared ? "reopen" : "clear";
  const label = capability.cleared ? "Reopen condition" : "Mark cleared";
  const result =
    mutations.result && mutations.result.conditionKey === capability.conditionKey
      ? mutations.result.result
      : null;

  return (
    <InspectorGroup label="Condition progress">
      <p className={styles.inspectorText}>
        {capability.cleared ? (
          <>
            Recorded as <strong>cleared</strong>. This tracks progress only — it does not verify the
            evidence, resolve the finding, record a Human Decision, or make the merge safe.
          </>
        ) : (
          <>
            Recorded as <strong>open</strong>. Clearing records progress only; it is not evidence
            verification or a decision.
          </>
        )}
      </p>
      <button
        type="button"
        className={styles.mutationButton}
        data-mutation-control={`condition:${capability.conditionKey}`}
        aria-disabled={disabled}
        onClick={() => {
          if (disabled) return;
          mutations.onToggle(capability, intent);
        }}
      >
        {pending ? "Saving…" : label}
      </button>
      {result ? <MutationStatus result={result} /> : null}
    </InspectorGroup>
  );
}

/* Review-status control. Rendered only on the resting Case Context surface. Uses
   native controls (a <select> plus an explicit Apply button); moving through the
   select with arrow keys changes only local UI state and never persists. */
function ReviewStatusControl({
  capability,
  mutations,
}: {
  capability: ReviewStateMutationCapability;
  mutations: InspectorMutations["review"] | null;
}) {
  if (capability.kind === "read-only-sample") {
    return (
      <InspectorGroup label="Review status">
        <p className={styles.inspectorEmpty}>
          Sample review status. It is demonstrative here and is never written to this browser.
        </p>
      </InspectorGroup>
    );
  }

  if (capability.kind === "unavailable" || capability.kind === "storage-unavailable") {
    return (
      <InspectorGroup label="Review status">
        <p className={styles.inspectorEmpty}>{capability.reason}</p>
      </InspectorGroup>
    );
  }

  /* Available identity but no interactive handler: explain rather than show a
     bare disabled control. */
  if (mutations === null) {
    return (
      <InspectorGroup label="Review status">
        <p className={styles.inspectorText}>
          {capability.recorded ? "Recorded status" : "Provisional status"}:{" "}
          <strong>{capability.currentStatus}</strong>
        </p>
        <p className={styles.inspectorEmpty}>
          Changes cannot be saved in this browser right now, so the status is read-only.
        </p>
      </InspectorGroup>
    );
  }

  /* Keyed by caseId so the local select resets to the new case's status when the
     selected case changes, but persists across an in-place reprojection. */
  return <ReviewStatusForm key={capability.caseId} capability={capability} mutations={mutations} />;
}

function ReviewStatusForm({
  capability,
  mutations,
}: {
  capability: Extract<ReviewStateMutationCapability, { kind: "available" }>;
  mutations: InspectorMutations["review"];
}) {
  const [selected, setSelected] = useState<ReviewStatus>(capability.currentStatus);
  const pending = mutations.pending;
  const disabled = mutations.busy;
  const result = mutations.result;

  return (
    <InspectorGroup label="Review status">
      <p className={styles.inspectorText}>
        {capability.recorded ? (
          <>
            Recorded status: <strong>{capability.currentStatus}</strong>
          </>
        ) : (
          <>
            No recorded review status yet. Showing the provisional status derived from the
            recommendation: <strong>{capability.currentStatus}</strong>. Applying records it for
            this case; it is not a Human Decision.
          </>
        )}
      </p>
      <div className={styles.mutationRow}>
        <label className={styles.visuallyHidden} htmlFor="wsv2-review-status-select">
          Review status
        </label>
        <select
          id="wsv2-review-status-select"
          className={styles.mutationSelect}
          value={selected}
          disabled={disabled}
          onChange={(event) => setSelected(event.target.value as ReviewStatus)}
        >
          {capability.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.mutationButton}
          data-mutation-control="review"
          aria-disabled={disabled}
          onClick={() => {
            if (disabled) return;
            mutations.onApply(selected);
          }}
        >
          {pending ? "Saving…" : "Apply"}
        </button>
      </div>
      {result ? <MutationStatus result={result} /> : null}
    </InspectorGroup>
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
  reviewStateMutation,
  reviewMutations,
}: {
  title: string;
  context: CaseContextView;
  composition: EvidenceComposition;
  headSha: string | null;
  updatedAt: string;
  reviewStateMutation: ReviewStateMutationCapability;
  reviewMutations: InspectorMutations["review"] | null;
}) {
  return (
    <>
      <h2 className={styles.inspectorTitle}>{title}</h2>
      <p className={styles.inspectorLead}>{context.summary}</p>

      <ReviewStatusControl capability={reviewStateMutation} mutations={reviewMutations} />

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
