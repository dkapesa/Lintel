"use client";

/* R0B.2B — Workspace V2 recorded Human Decision · interaction dialogs.

   Local, fixture-backed flows for visual and accessibility review (§9–§13).
   Each dialog collects input and hands a structured draft to the owner, which
   applies the change to route-local React state only. Nothing here persists,
   calls an API, or touches production storage.

   Every dialog uses the DecisionDialog shell for focus entry, focus trap,
   Escape cancellation and focus restoration. Confirmation happens only from
   the explicit confirm control — no dialog is a <form>, so Enter in a field
   never submits. Rationale is required and non-whitespace for every flow
   (§24.1). Accepted-risk requires explicit references and an acknowledgement
   that begins unselected (§24.2). */

import { useId, useMemo, useState } from "react";
import styles from "./workspace-v2.module.css";
import { DecisionDialog, DecisionReferenceList } from "./decision-atoms";
import {
  DECISION_OUTCOMES,
  OUTCOME_LABEL,
  OUTCOME_MEANING,
  type DecisionOutcome,
  type DecisionReference,
} from "./decision-model";
import type { Recommendation } from "./fixtures";

export type DecisionDraft = {
  outcome: DecisionOutcome;
  rationale: string;
  references: DecisionReference[];
  acceptedRiskReferences: DecisionReference[];
};

function defaultOutcome(recommendation: Recommendation): DecisionOutcome {
  switch (recommendation) {
    case "APPROVE":
      return "approve";
    case "TESTS_REQUIRED":
      return "tests-required";
    case "REVIEW_REQUIRED":
      return "review-required";
    case "BLOCK":
      return "blocked";
  }
}

/* --- Shared field parts ----------------------------------------------- */

function OutcomeRadioGroup({
  value,
  onChange,
  groupId,
}: {
  value: DecisionOutcome;
  onChange: (outcome: DecisionOutcome) => void;
  groupId: string;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.fieldLegend}>Outcome</legend>
      <div className={styles.outcomeOptions} role="radiogroup" aria-label="Decision outcome">
        {DECISION_OUTCOMES.map((outcome) => {
          const id = `${groupId}-${outcome}`;
          const selected = value === outcome;
          return (
            <label
              key={outcome}
              htmlFor={id}
              className={`${styles.outcomeOption} ${selected ? styles.outcomeOptionSelected : ""}`}
            >
              <input
                id={id}
                type="radio"
                name={groupId}
                className={styles.outcomeRadio}
                checked={selected}
                onChange={() => onChange(outcome)}
              />
              <span className={styles.outcomeOptionBody}>
                <span className={styles.outcomeOptionLabel}>{OUTCOME_LABEL[outcome]}</span>
                <span className={styles.outcomeOptionMeaning}>{OUTCOME_MEANING[outcome]}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function RationaleField({
  value,
  onChange,
  fieldId,
  describedById,
  invalid,
  label = "Rationale",
  hint = "Required. Explain the decision in your own words.",
}: {
  value: string;
  onChange: (value: string) => void;
  fieldId: string;
  describedById: string;
  invalid: boolean;
  label?: string;
  hint?: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        {label}
      </label>
      <p id={describedById} className={styles.fieldHint}>
        {hint}
      </p>
      <textarea
        id={fieldId}
        className={`${styles.textarea} ${invalid ? styles.fieldInvalid : ""}`}
        value={value}
        aria-describedby={describedById}
        aria-invalid={invalid}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ErrorNote({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className={styles.dialogError} role="alert">
      {message}
    </p>
  );
}

/* --- Creation / Change / Supersede (§9, §11, §13) --------------------- */

export function DecisionCreationDialog({
  mode,
  headSha,
  headRecorded,
  recommendation,
  openBlockingRequirements,
  carriedReferences,
  candidateRiskReferences,
  onSubmit,
  onCancel,
  returnFocusRef,
}: {
  mode: "record" | "change" | "supersede";
  headSha?: string;
  headRecorded: boolean;
  recommendation: Recommendation;
  openBlockingRequirements: number;
  carriedReferences: DecisionReference[];
  candidateRiskReferences: DecisionReference[];
  onSubmit: (draft: DecisionDraft) => void;
  onCancel: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  const [outcome, setOutcome] = useState<DecisionOutcome>(defaultOutcome(recommendation));
  const [rationale, setRationale] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<Set<string>>(new Set());
  const [riskAck, setRiskAck] = useState(false);
  const [noHeadAck, setNoHeadAck] = useState(false);
  const [blockersAck, setBlockersAck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAcceptedRisk = outcome === "approve-with-accepted-risk";
  const isApproval = outcome === "approve" || outcome === "approve-with-accepted-risk";
  const chosenRisk = useMemo(
    () => candidateRiskReferences.filter((reference) => selectedRisk.has(reference.id)),
    [candidateRiskReferences, selectedRisk],
  );

  const title =
    mode === "record"
      ? "Record decision"
      : mode === "supersede"
        ? "Supersede decision"
        : "Change decision";

  function validate(): string | null {
    if (rationale.trim().length === 0) return "Enter a rationale before confirming.";
    if (isAcceptedRisk && chosenRisk.length === 0) {
      return "Select at least one risk to accept.";
    }
    if (isAcceptedRisk && !riskAck) {
      return "Acknowledge that you — not Lintel — accept the referenced risk.";
    }
    if (!headRecorded && !noHeadAck) {
      return "Acknowledge recording without a head binding.";
    }
    if (isApproval && openBlockingRequirements > 0 && !blockersAck) {
      return `Acknowledge approving over ${openBlockingRequirements} open blocking requirement${
        openBlockingRequirements === 1 ? "" : "s"
      }.`;
    }
    return null;
  }

  const validationMessage = validate();
  const valid = validationMessage === null;

  function confirm() {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    onSubmit({
      outcome,
      rationale: rationale.trim(),
      references: carriedReferences,
      acceptedRiskReferences: isAcceptedRisk ? chosenRisk : [],
    });
  }

  const rationaleDescId = `${baseId}-rationale-hint`;
  const errorId = `${baseId}-error`;

  return (
    <DecisionDialog
      title={title}
      description={
        mode === "supersede"
          ? "This records a new effective decision. The prior decision is retained in history as superseded."
          : "Recording is the terminal act for this case. Lintel recommends; the accountable engineer decides."
      }
      onCancel={onCancel}
      returnFocusRef={returnFocusRef}
      footer={
        <>
          <button type="button" className={styles.dialogSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dialogPrimary}
            aria-disabled={!valid}
            aria-describedby={error ? errorId : undefined}
            onClick={confirm}
          >
            {mode === "supersede" ? "Supersede decision" : "Confirm decision"}
          </button>
        </>
      }
    >
      <OutcomeRadioGroup value={outcome} onChange={(next) => { setOutcome(next); setError(null); }} groupId={`${baseId}-outcome`} />

      <RationaleField
        value={rationale}
        onChange={(next) => { setRationale(next); setError(null); }}
        fieldId={`${baseId}-rationale`}
        describedById={rationaleDescId}
        invalid={Boolean(error) && rationale.trim().length === 0}
      />

      {isAcceptedRisk ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Accepted risks</span>
          <p className={styles.fieldHint}>
            Select the residual risks you accept. These reference open blocking requirements.
          </p>
          {candidateRiskReferences.length === 0 ? (
            <p className={styles.inspectorEmpty}>No open blocking risks to reference.</p>
          ) : (
            <ul className={styles.riskOptions}>
              {candidateRiskReferences.map((reference) => {
                const id = `${baseId}-risk-${reference.id}`;
                const checked = selectedRisk.has(reference.id);
                return (
                  <li key={reference.id}>
                    <label htmlFor={id} className={styles.riskOption}>
                      <input
                        id={id}
                        type="checkbox"
                        className={styles.checkbox}
                        checked={checked}
                        onChange={() => {
                          setSelectedRisk((current) => {
                            const next = new Set(current);
                            if (next.has(reference.id)) next.delete(reference.id);
                            else next.add(reference.id);
                            return next;
                          });
                          setError(null);
                        }}
                      />
                      <span className={styles.riskOptionBody}>
                        <span className={styles.riskOptionKind}>{reference.kind}</span>
                        <span>{reference.label}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <label htmlFor={`${baseId}-riskack`} className={styles.ackRow}>
            <input
              id={`${baseId}-riskack`}
              type="checkbox"
              className={styles.checkbox}
              checked={riskAck}
              onChange={() => { setRiskAck((value) => !value); setError(null); }}
            />
            <span>
              I accept the referenced residual risk. The engineer — not Lintel — accepts this risk.
            </span>
          </label>
        </div>
      ) : null}

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Head binding</span>
        {headRecorded ? (
          <p className={styles.fieldHint}>
            Bound to current head <span className={styles.inlineMono}>{headSha}</span>.
          </p>
        ) : (
          <label htmlFor={`${baseId}-nohead`} className={styles.ackRow}>
            <input
              id={`${baseId}-nohead`}
              type="checkbox"
              className={styles.checkbox}
              checked={noHeadAck}
              onChange={() => { setNoHeadAck((value) => !value); setError(null); }}
            />
            <span>Head not recorded. Record without a head binding; stale detection is disabled.</span>
          </label>
        )}
      </div>

      {carriedReferences.length > 0 ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Referenced requirements & evidence carried</span>
          <DecisionReferenceList references={carriedReferences} />
        </div>
      ) : null}

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Blocking requirements</span>
        {openBlockingRequirements > 0 ? (
          isApproval ? (
            <label htmlFor={`${baseId}-blockack`} className={styles.ackRow}>
              <input
                id={`${baseId}-blockack`}
                type="checkbox"
                className={styles.checkbox}
                checked={blockersAck}
                onChange={() => { setBlockersAck((value) => !value); setError(null); }}
              />
              <span>
                {openBlockingRequirements} blocking requirement
                {openBlockingRequirements === 1 ? "" : "s"} still open. Acknowledge approving over
                {openBlockingRequirements === 1 ? " it" : " them"}.
              </span>
            </label>
          ) : (
            <p className={styles.fieldHint}>
              {openBlockingRequirements} blocking requirement
              {openBlockingRequirements === 1 ? "" : "s"} still open.
            </p>
          )
        ) : (
          <p className={styles.fieldHint}>No blocking requirements open.</p>
        )}
      </div>

      <ErrorNote id={errorId} message={error} />
    </DecisionDialog>
  );
}

/* --- Reaffirmation (§10) ---------------------------------------------- */

export function DecisionReaffirmDialog({
  outcome,
  priorHeadSha,
  currentHeadSha,
  priorRationale,
  survivingReferences,
  staleReferences,
  onSubmit,
  onCancel,
  returnFocusRef,
}: {
  outcome: DecisionOutcome;
  priorHeadSha?: string;
  currentHeadSha?: string;
  priorRationale?: string;
  survivingReferences: DecisionReference[];
  staleReferences: DecisionReference[];
  onSubmit: (rationale: string) => void;
  onCancel: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  const [rationale, setRationale] = useState(priorRationale ?? "");
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    if (rationale.trim().length === 0) {
      setError("Enter a rationale before reaffirming.");
      return;
    }
    onSubmit(rationale.trim());
  }

  const errorId = `${baseId}-error`;

  return (
    <DecisionDialog
      title="Reaffirm decision"
      description={`Reaffirming ${OUTCOME_LABEL[outcome]} against the current head. The new event links to the prior decision.`}
      onCancel={onCancel}
      returnFocusRef={returnFocusRef}
      footer={
        <>
          <button type="button" className={styles.dialogSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dialogPrimary}
            aria-disabled={rationale.trim().length === 0}
            onClick={confirm}
          >
            Reaffirm decision
          </button>
        </>
      }
    >
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Head change</span>
        <p className={styles.fieldHint}>
          Recorded at <span className={styles.inlineMono}>{priorHeadSha ?? "unknown"}</span>; head is
          now <span className={styles.inlineMono}>{currentHeadSha ?? "unknown"}</span>.
        </p>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>References that remain</span>
        <DecisionReferenceList
          references={survivingReferences}
          emptyLabel="No references carried forward"
        />
      </div>

      {staleReferences.length > 0 ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>References to re-evaluate</span>
          <DecisionReferenceList references={staleReferences} />
        </div>
      ) : null}

      <RationaleField
        value={rationale}
        onChange={(next) => { setRationale(next); setError(null); }}
        fieldId={`${baseId}-rationale`}
        describedById={`${baseId}-hint`}
        invalid={Boolean(error) && rationale.trim().length === 0}
        label="Rationale"
        hint="Required. Prior rationale is reused and editable."
      />

      <ErrorNote id={errorId} message={error} />
    </DecisionDialog>
  );
}

/* --- Withdrawal (§12) — destructive ----------------------------------- */

export function DecisionWithdrawDialog({
  onSubmit,
  onCancel,
  returnFocusRef,
}: {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    if (reason.trim().length === 0) {
      setError("Enter a reason before withdrawing.");
      return;
    }
    onSubmit(reason.trim());
  }

  return (
    <DecisionDialog
      title="Withdraw decision"
      tone="destructive"
      description="Withdrawing removes this decision as the effective decision. History is retained; this cannot un-record the original."
      onCancel={onCancel}
      returnFocusRef={returnFocusRef}
      footer={
        <>
          <button type="button" className={styles.dialogSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dialogDestructiveButton}
            aria-disabled={reason.trim().length === 0}
            onClick={confirm}
          >
            Withdraw decision
          </button>
        </>
      }
    >
      <RationaleField
        value={reason}
        onChange={(next) => { setReason(next); setError(null); }}
        fieldId={`${baseId}-reason`}
        describedById={`${baseId}-hint`}
        invalid={Boolean(error) && reason.trim().length === 0}
        label="Reason for withdrawal"
        hint="Required. Explain why this decision is being withdrawn."
      />
      <ErrorNote id={`${baseId}-error`} message={error} />
    </DecisionDialog>
  );
}

/* --- Risk revocation (§13) — destructive ------------------------------ */

export function DecisionRevokeRiskDialog({
  onSubmit,
  onCancel,
  returnFocusRef,
}: {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    if (reason.trim().length === 0) {
      setError("Enter a reason before revoking.");
      return;
    }
    onSubmit(reason.trim());
  }

  return (
    <DecisionDialog
      title="Revoke risk acceptance"
      tone="destructive"
      description="The accepted-risk event is retained in history. The risk acceptance is no longer effective."
      onCancel={onCancel}
      returnFocusRef={returnFocusRef}
      footer={
        <>
          <button type="button" className={styles.dialogSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dialogDestructiveButton}
            aria-disabled={reason.trim().length === 0}
            onClick={confirm}
          >
            Revoke acceptance
          </button>
        </>
      }
    >
      <RationaleField
        value={reason}
        onChange={(next) => { setReason(next); setError(null); }}
        fieldId={`${baseId}-reason`}
        describedById={`${baseId}-hint`}
        invalid={Boolean(error) && reason.trim().length === 0}
        label="Reason for revocation"
        hint="Required. Explain why the risk acceptance is being revoked."
      />
      <ErrorNote id={`${baseId}-error`} message={error} />
    </DecisionDialog>
  );
}
