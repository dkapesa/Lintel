"use client";

/* R1B.6 — Production Workspace V2 · Human Decision interaction dialogs.

   The accessible, focus-managed in-product surfaces (r0b2 §9–§13, §19, §24.17)
   for recording, changing/superseding, reaffirming and withdrawing a real
   engineer decision. Each dialog only collects input and hands a structured
   draft to the route owner, which drives the narrow mutation service and
   reprojects the Workspace after a verified persist. Nothing here touches
   storage, and no dialog is a `<form>`, so Enter in a field never submits —
   confirmation happens only from the explicit confirm control.

   Rationale is required and non-whitespace for every flow (§24.1). Accepted
   risk requires explicit references and an acknowledgement that begins
   unselected (§24.2). No `window.confirm`, `alert` or `prompt`. While a write
   is pending the dialog cannot be cancelled or closed, so Escape can never
   cancel a decision mid-write (§ escape precedence). */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "../workspace-v2.module.css";
import {
  DECISION_OUTCOMES,
  OUTCOME_LABEL,
  OUTCOME_MEANING,
  type DecisionOutcome,
  type DecisionReference,
  type Recommendation,
} from "../../../lib/workspace-v2/view-model";

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

/* --- Accessible dialog shell (§19, §24.17) ---------------------------- */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function DecisionDialog({
  title,
  description,
  tone = "neutral",
  onCancel,
  blockClose,
  children,
  notice,
  footer,
  returnFocusRef,
}: {
  title: string;
  description?: ReactNode;
  tone?: "neutral" | "destructive";
  onCancel: () => void;
  /* While a write is pending, Escape and the scrim must not close the dialog. */
  blockClose: boolean;
  children: ReactNode;
  notice?: ReactNode;
  footer: ReactNode;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();
  const autoDescId = useId();
  const descId = description ? autoDescId : undefined;

  const focusFirst = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = focusables[0];
    if (target instanceof HTMLInputElement && target.type === "radio" && !target.checked) {
      const checked = panel.querySelector<HTMLElement>('input[type="radio"]:checked');
      if (checked) {
        checked.focus();
        return;
      }
    }
    if (target) target.focus();
    else panel.focus();
  }, []);

  useEffect(() => {
    focusFirst();
    const returnTarget = returnFocusRef.current;
    return () => {
      /* Focus restoration to the triggering control (§19). If the trigger no
         longer exists — e.g. "Record decision" was replaced by the recorded
         plate — fall back to the Decision Plate's first control, never <body>. */
      if (returnTarget && document.contains(returnTarget)) {
        returnTarget.focus();
        return;
      }
      const plate = document.getElementById("wsv2-decision-plate");
      const fallback = plate?.querySelector<HTMLElement>("button");
      fallback?.focus();
    };
  }, [focusFirst, returnFocusRef]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        /* Swallow Escape so the route-level listener never fires while a dialog
           is open. A pending write refuses to close. */
        event.stopPropagation();
        if (!blockClose) onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null || element === document.activeElement);
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onCancel, blockClose],
  );

  return (
    <div className={styles.dialogOverlay} onKeyDown={onKeyDown} role="presentation">
      <div
        className={styles.dialogScrim}
        onClick={() => {
          if (!blockClose) onCancel();
        }}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`${styles.dialogPanel} ${tone === "destructive" ? styles.dialogDestructive : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <div className={styles.dialogHead}>
          <h2 id={headingId} className={styles.dialogTitle}>
            {title}
          </h2>
        </div>
        {description ? (
          <div id={descId} className={styles.dialogDescription}>
            {description}
          </div>
        ) : null}
        <div className={styles.dialogBody}>{children}</div>
        {notice ? <div className={styles.dialogNotice}>{notice}</div> : null}
        <div className={styles.dialogFooter}>{footer}</div>
      </div>
    </div>
  );
}

/* --- Shared field parts ----------------------------------------------- */

function OutcomeRadioGroup({
  value,
  onChange,
  groupId,
  disabled,
}: {
  value: DecisionOutcome;
  onChange: (outcome: DecisionOutcome) => void;
  groupId: string;
  disabled: boolean;
}) {
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
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
  disabled,
  label = "Rationale",
  hint = "Required. Explain the decision in your own words.",
}: {
  value: string;
  onChange: (value: string) => void;
  fieldId: string;
  describedById: string;
  invalid: boolean;
  disabled: boolean;
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
        className={`${styles.dialogTextarea} ${invalid ? styles.fieldInvalid : ""}`}
        value={value}
        aria-describedby={describedById}
        aria-invalid={invalid}
        rows={3}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ReferenceCheckList({
  references,
  selected,
  onToggle,
  disabled,
  idPrefix,
  emptyLabel,
}: {
  references: DecisionReference[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  disabled: boolean;
  idPrefix: string;
  emptyLabel: string;
}) {
  if (references.length === 0) {
    return <p className={styles.inspectorEmpty}>{emptyLabel}</p>;
  }
  return (
    <ul className={styles.riskOptions}>
      {references.map((reference) => {
        const id = `${idPrefix}-${reference.id}`;
        return (
          <li key={reference.id}>
            <label htmlFor={id} className={styles.riskOption}>
              <input
                id={id}
                type="checkbox"
                className={styles.checkbox}
                checked={selected.has(reference.id)}
                disabled={disabled || !reference.available}
                onChange={() => onToggle(reference.id)}
              />
              <span className={styles.riskOptionBody}>
                <span className={styles.riskOptionKind}>{reference.kind}</span>
                <span>{reference.available ? reference.label : "Reference no longer available"}</span>
                {reference.stale ? <span className={styles.referenceStale}>stale</span> : null}
                {reference.modelAssisted ? (
                  <span className={styles.referenceModel}>model assisted</span>
                ) : null}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
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
  candidateReferences,
  candidateRiskReferences,
  pending,
  submitError = null,
  onSubmit,
  onCancel,
  returnFocusRef,
}: {
  mode: "record" | "change";
  headSha: string | null;
  headRecorded: boolean;
  recommendation: Recommendation;
  openBlockingRequirements: number;
  candidateReferences: DecisionReference[];
  candidateRiskReferences: DecisionReference[];
  pending: boolean;
  /* A retryable mutation failure (failed / verification-mismatch) surfaced
     inline; the dialog stays open and all entered state is preserved. */
  submitError?: string | null;
  onSubmit: (draft: DecisionDraft) => void;
  onCancel: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  const [outcome, setOutcome] = useState<DecisionOutcome>(defaultOutcome(recommendation));
  const [rationale, setRationale] = useState("");
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [selectedRisk, setSelectedRisk] = useState<Set<string>>(new Set());
  const [riskAck, setRiskAck] = useState(false);
  const [noHeadAck, setNoHeadAck] = useState(false);
  const [blockersAck, setBlockersAck] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAcceptedRisk = outcome === "approve-with-accepted-risk";
  const isApproval = outcome === "approve" || outcome === "approve-with-accepted-risk";
  const availableRisk = useMemo(
    () => candidateRiskReferences.filter((reference) => reference.available),
    [candidateRiskReferences],
  );
  const chosenRisk = useMemo(
    () => candidateRiskReferences.filter((reference) => selectedRisk.has(reference.id)),
    [candidateRiskReferences, selectedRisk],
  );
  const chosenRefs = useMemo(
    () => candidateReferences.filter((reference) => selectedRefs.has(reference.id)),
    [candidateReferences, selectedRefs],
  );

  const title = mode === "record" ? "Record decision" : "Change decision";

  const validate = useCallback((): string | null => {
    if (rationale.trim().length === 0) return "Enter a rationale before confirming.";
    if (isAcceptedRisk && chosenRisk.length === 0) return "Select at least one risk to accept.";
    if (isAcceptedRisk && !riskAck) {
      return "Acknowledge that you — not Lintel — accept the referenced risk.";
    }
    if (!headRecorded && !noHeadAck) return "Acknowledge recording without a head binding.";
    if (isApproval && openBlockingRequirements > 0 && !blockersAck) {
      return `Acknowledge approving over ${openBlockingRequirements} open blocking requirement${
        openBlockingRequirements === 1 ? "" : "s"
      }.`;
    }
    return null;
  }, [
    rationale,
    isAcceptedRisk,
    chosenRisk.length,
    riskAck,
    headRecorded,
    noHeadAck,
    isApproval,
    openBlockingRequirements,
    blockersAck,
  ]);

  const valid = validate() === null;

  function confirm() {
    if (pending) return;
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    onSubmit({
      outcome,
      rationale: rationale.trim(),
      references: chosenRefs,
      acceptedRiskReferences: isAcceptedRisk ? chosenRisk : [],
    });
  }

  const rationaleDescId = `${baseId}-rationale-hint`;
  const errorId = `${baseId}-error`;
  const shownError = error ?? submitError ?? null;

  return (
    <DecisionDialog
      title={title}
      description={
        mode === "change"
          ? "Recording a different or materially changed decision supersedes the current one. The prior decision is retained in history."
          : "Recording is the terminal act for this case. Lintel recommends; the accountable engineer decides."
      }
      onCancel={onCancel}
      blockClose={pending}
      returnFocusRef={returnFocusRef}
      notice={shownError ? <ErrorNote id={errorId} message={shownError} /> : null}
      footer={
        <>
          <button type="button" className={styles.dialogSecondary} onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dialogPrimary}
            data-mutation-control="decision"
            aria-disabled={!valid || pending}
            aria-describedby={shownError ? errorId : undefined}
            onClick={confirm}
          >
            {pending ? "Saving…" : mode === "change" ? "Record replacement" : "Confirm decision"}
          </button>
        </>
      }
    >
      <OutcomeRadioGroup
        value={outcome}
        onChange={(next) => {
          setOutcome(next);
          setError(null);
        }}
        groupId={`${baseId}-outcome`}
        disabled={pending}
      />

      <RationaleField
        value={rationale}
        onChange={(next) => {
          setRationale(next);
          setError(null);
        }}
        fieldId={`${baseId}-rationale`}
        describedById={rationaleDescId}
        invalid={Boolean(error) && rationale.trim().length === 0}
        disabled={pending}
      />

      {isAcceptedRisk ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Accepted risks</span>
          <p className={styles.fieldHint}>
            Select the residual risks you accept. These reference open blocking requirements Lintel
            flagged.
          </p>
          <ReferenceCheckList
            references={availableRisk}
            selected={selectedRisk}
            disabled={pending}
            idPrefix={`${baseId}-risk`}
            emptyLabel="No open blocking risks to reference."
            onToggle={(id) => {
              setSelectedRisk((current) => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
              setError(null);
            }}
          />
          <label htmlFor={`${baseId}-riskack`} className={styles.ackRow}>
            <input
              id={`${baseId}-riskack`}
              type="checkbox"
              className={styles.checkbox}
              checked={riskAck}
              disabled={pending}
              onChange={() => {
                setRiskAck((value) => !value);
                setError(null);
              }}
            />
            <span>
              I accept the referenced residual risk. The engineer — not Lintel — accepts this risk.
            </span>
          </label>
        </div>
      ) : null}

      {candidateReferences.length > 0 ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Referenced requirements &amp; evidence (optional)</span>
          <p className={styles.fieldHint}>
            Attach the current-case requirements or evidence this decision rests on.
          </p>
          <ReferenceCheckList
            references={candidateReferences}
            selected={selectedRefs}
            disabled={pending}
            idPrefix={`${baseId}-ref`}
            emptyLabel="No referenceable artifacts in this case."
            onToggle={(id) => {
              setSelectedRefs((current) => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
              setError(null);
            }}
          />
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
              disabled={pending}
              onChange={() => {
                setNoHeadAck((value) => !value);
                setError(null);
              }}
            />
            <span>Head not recorded. Record without a head binding; stale detection is disabled.</span>
          </label>
        )}
      </div>

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
                disabled={pending}
                onChange={() => {
                  setBlockersAck((value) => !value);
                  setError(null);
                }}
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
  pending,
  submitError = null,
  onSubmit,
  onCancel,
  returnFocusRef,
}: {
  outcome: DecisionOutcome;
  priorHeadSha: string | null;
  currentHeadSha: string | null;
  priorRationale: string | null;
  survivingReferences: DecisionReference[];
  staleReferences: DecisionReference[];
  pending: boolean;
  submitError?: string | null;
  onSubmit: (rationale: string) => void;
  onCancel: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  /* Reaffirmation is a new accountable action against a changed head: the new
     rationale ALWAYS begins blank and must be entered deliberately. The prior
     rationale is shown below only as read-only historical context and never
     populates this field (r0b2 §10, §24.1). */
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    if (pending) return;
    if (rationale.trim().length === 0) {
      setError("Enter new reasoning for the current head before reaffirming.");
      return;
    }
    onSubmit(rationale.trim());
  }

  const errorId = `${baseId}-error`;
  const shownError = error ?? submitError ?? null;

  return (
    <DecisionDialog
      title="Reaffirm decision"
      description={`Reaffirming ${OUTCOME_LABEL[outcome]} against the current head. The new event links to the prior decision and binds the current head.`}
      onCancel={onCancel}
      blockClose={pending}
      returnFocusRef={returnFocusRef}
      notice={shownError ? <ErrorNote id={errorId} message={shownError} /> : null}
      footer={
        <>
          <button type="button" className={styles.dialogSecondary} onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dialogPrimary}
            data-mutation-control="decision"
            aria-disabled={rationale.trim().length === 0 || pending}
            aria-describedby={shownError ? errorId : undefined}
            onClick={confirm}
          >
            {pending ? "Saving…" : "Reaffirm decision"}
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
        <ReferenceCheckList
          references={survivingReferences}
          selected={new Set(survivingReferences.map((reference) => reference.id))}
          onToggle={() => undefined}
          disabled
          idPrefix={`${baseId}-keep`}
          emptyLabel="No references carried forward."
        />
      </div>

      {staleReferences.length > 0 ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>References to re-evaluate</span>
          <ReferenceCheckList
            references={staleReferences}
            selected={new Set()}
            onToggle={() => undefined}
            disabled
            idPrefix={`${baseId}-stale`}
            emptyLabel="None."
          />
        </div>
      ) : null}

      {/* Read-only historical context. Never populates the new rationale field. */}
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Prior rationale (historical)</span>
        {priorRationale && priorRationale.trim().length > 0 ? (
          <p className={styles.fieldHint}>{priorRationale}</p>
        ) : (
          <p className={styles.inspectorEmpty}>No prior rationale recorded.</p>
        )}
      </div>

      <RationaleField
        value={rationale}
        onChange={(next) => {
          setRationale(next);
          setError(null);
        }}
        fieldId={`${baseId}-rationale`}
        describedById={`${baseId}-hint`}
        invalid={Boolean(error) && rationale.trim().length === 0}
        disabled={pending}
        label="New rationale"
        hint="Required. Enter new reasoning for the current head; the prior rationale is not reused."
      />
    </DecisionDialog>
  );
}

/* --- Withdrawal (§12) — destructive ----------------------------------- */

export function DecisionWithdrawDialog({
  pending,
  submitError = null,
  onSubmit,
  onCancel,
  returnFocusRef,
}: {
  pending: boolean;
  submitError?: string | null;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    if (pending) return;
    if (reason.trim().length === 0) {
      setError("Enter a reason before withdrawing.");
      return;
    }
    onSubmit(reason.trim());
  }

  const errorId = `${baseId}-error`;
  const shownError = error ?? submitError ?? null;

  return (
    <DecisionDialog
      title="Withdraw decision"
      tone="destructive"
      description="Withdrawing removes this decision as the effective decision. History is retained; this cannot un-record the original. It does not change the Lintel recommendation, review status, merge conditions, findings or evidence."
      onCancel={onCancel}
      blockClose={pending}
      returnFocusRef={returnFocusRef}
      notice={shownError ? <ErrorNote id={errorId} message={shownError} /> : null}
      footer={
        <>
          <button type="button" className={styles.dialogSecondary} onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.dialogDestructiveButton}
            data-mutation-control="decision"
            aria-disabled={reason.trim().length === 0 || pending}
            aria-describedby={shownError ? errorId : undefined}
            onClick={confirm}
          >
            {pending ? "Withdrawing…" : "Withdraw decision"}
          </button>
        </>
      }
    >
      <RationaleField
        value={reason}
        onChange={(next) => {
          setReason(next);
          setError(null);
        }}
        fieldId={`${baseId}-reason`}
        describedById={`${baseId}-hint`}
        invalid={Boolean(error) && reason.trim().length === 0}
        disabled={pending}
        label="Reason for withdrawal"
        hint="Required. Explain why this decision is being withdrawn."
      />
    </DecisionDialog>
  );
}
