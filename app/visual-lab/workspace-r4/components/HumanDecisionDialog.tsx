"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CURRENT_HEAD, OUTCOME_HELP, OUTCOME_LABELS } from "../fixtures";
import { Glyph } from "../icons";
import type { DecisionOutcome, DecisionTransaction, FixtureVariant, ReviewFixture } from "../types";
import styles from "../workspace-r4.module.css";

const OUTCOMES = Object.keys(OUTCOME_LABELS) as DecisionOutcome[];
const FOCUSABLE = [
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function transactionDefaults(transaction: DecisionTransaction | undefined, initialOutcome?: DecisionOutcome) {
  const valid = ["valid", "enabled", "discard-warning", "saving", "head-conflict", "decision-conflict", "storage-failure", "readback-mismatch", "duplicate"].includes(transaction ?? "");
  const accepted = initialOutcome === "approve-with-accepted-risk";
  return {
    rationale: valid ? "Current-head integration proof is still missing; preserve the blocker until the failure path is verified." : "",
    evidenceRefs: transaction === "valid" || transaction === "enabled" || accepted,
    riskRef: transaction === "enabled" || transaction === "accepted-risk-unacknowledged",
    riskAck: transaction === "enabled",
    blockerAck: transaction === "enabled",
    missingHeadAck: transaction === "enabled",
  };
}

export function HumanDecisionDialog({
  open,
  review,
  variant,
  capture,
  initialOutcome,
  transaction,
  onClose,
  onSuccess,
  onAnnounce,
  returnFocusRef,
}: {
  open: boolean;
  review: ReviewFixture;
  variant: FixtureVariant;
  capture: boolean;
  initialOutcome?: DecisionOutcome;
  transaction?: DecisionTransaction;
  onClose: () => void;
  onSuccess: (outcome: DecisionOutcome) => void;
  onAnnounce: (message: string, assertive?: boolean) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const defaults = useMemo(() => transactionDefaults(transaction, initialOutcome), [transaction, initialOutcome]);
  const [outcome, setOutcome] = useState<DecisionOutcome | null>(initialOutcome ?? null);
  const [rationale, setRationale] = useState(defaults.rationale);
  const [evidenceRefs, setEvidenceRefs] = useState(defaults.evidenceRefs);
  const [riskRef, setRiskRef] = useState(defaults.riskRef);
  const [riskAck, setRiskAck] = useState(defaults.riskAck);
  const [blockerAck, setBlockerAck] = useState(defaults.blockerAck);
  const [missingHeadAck, setMissingHeadAck] = useState(defaults.missingHeadAck);
  const [discardOpen, setDiscardOpen] = useState(transaction === "discard-warning");
  const [localTransaction, setLocalTransaction] = useState<DecisionTransaction>(transaction ?? "pristine");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rationaleRef = useRef<HTMLTextAreaElement | null>(null);
  const firstOutcomeRef = useRef<HTMLInputElement | null>(null);
  const headingId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const noHead = variant === "unbound-decision";
  const approval = outcome === "approve" || outcome === "approve-with-accepted-risk";
  const acceptedRisk = outcome === "approve-with-accepted-risk";
  const dirty = Boolean(outcome || rationale.trim() || evidenceRefs || riskRef || riskAck || blockerAck || missingHeadAck);
  const saving = localTransaction === "saving";

  useEffect(() => {
    if (!open) return;
    const returnTarget = returnFocusRef.current;
    const frame = window.requestAnimationFrame(() => firstOutcomeRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      if (returnTarget && document.contains(returnTarget)) returnTarget.focus();
      else document.getElementById("r4c-decision-entry")?.focus();
    };
  }, [open, returnFocusRef]);

  const valid = Boolean(
    outcome &&
      rationale.trim() &&
      (!acceptedRisk || (riskRef && riskAck)) &&
      (!approval || blockerAck) &&
      (!noHead || missingHeadAck),
  );

  const requestClose = useCallback(() => {
    if (saving) {
      onAnnounce("Saving decision. Dismissal is unavailable until verification completes.");
      return;
    }
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  }, [dirty, onAnnounce, onClose, saving]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (discardOpen) {
        setDiscardOpen(false);
        return;
      }
      requestClose();
      return;
    }
    if (event.key !== "Tab") return;
    const owner = discardOpen ? panelRef.current?.querySelector<HTMLElement>(`[data-discard-dialog]`) : panelRef.current;
    if (!owner) return;
    const items = Array.from(owner.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((item) => item.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function confirm() {
    if (!valid) {
      setLocalTransaction("validation-error");
      onAnnounce("Human Decision is incomplete. Complete the first required field.", true);
      if (!outcome) firstOutcomeRef.current?.focus();
      else rationaleRef.current?.focus();
      return;
    }
    if (!outcome) return;
    if (["head-conflict", "decision-conflict", "storage-failure", "readback-mismatch", "duplicate"].includes(transaction ?? "")) {
      setLocalTransaction(transaction!);
      onAnnounce(
        transaction === "duplicate"
          ? "No change. An identical decision is already recorded."
          : transaction === "storage-failure"
            ? "Decision was not saved. The draft is preserved."
            : transaction === "readback-mismatch"
              ? "Decision read-back did not match. The draft is preserved."
              : "Review context changed while the decision was open. The stale write was refused.",
        transaction !== "duplicate",
      );
      return;
    }
    setLocalTransaction("saving");
    onAnnounce("Saving decision.");
    if (capture) return;
    window.setTimeout(() => {
      setLocalTransaction("success");
      onSuccess(outcome);
    }, 420);
  }

  if (!open) return null;

  const errorMessage =
    localTransaction === "head-conflict"
      ? "Review head changed while this decision was open. The stale write was refused; reload current context before deliberate reapplication."
      : localTransaction === "decision-conflict"
        ? "The effective Human Decision changed while this draft was open. The draft remains available for copy or deliberate reconciliation."
        : localTransaction === "storage-failure"
          ? "Decision was not saved because controlled local storage is unavailable. All fields are preserved."
          : localTransaction === "readback-mismatch"
            ? "The written event could not be verified by read-back. No successful Human Decision is claimed."
            : localTransaction === "duplicate"
              ? "No change — an identical Human Decision is already recorded. No event was appended."
              : localTransaction === "validation-error"
                ? "Complete the required outcome, rationale and outcome-specific acknowledgements."
                : null;

  return (
    <div className={styles.dialogLayer} onKeyDown={onKeyDown}>
      <button type="button" className={styles.dialogScrim} tabIndex={-1} aria-label="Close Human Decision" onClick={requestClose} />
      <div
        ref={panelRef}
        className={styles.decisionDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <header className={styles.dialogHeader}>
          <div className={styles.dialogTitleRow}>
            <div className={styles.dialogTitleBlock}>
              <span className={styles.eyebrow}>Consequential action · sample lab-local event</span>
              <h2 id={headingId}>Record Human Decision</h2>
            </div>
            <button type="button" className={styles.iconButton} onClick={requestClose} disabled={saving} aria-label="Cancel Human Decision"><Glyph name="close" size={18} /></button>
          </div>
          <p id={descriptionId}>Lintel recommends. The accountable engineer decides. This event never writes to the production Human Decision ledger.</p>
          <div className={styles.dialogReviewIdentity}>
            <span>Review</span>
            <strong><code>{review.repository}</code> · PR #{review.pr}</strong>
          </div>
          <div className={styles.dialogContext}>
            <span>Run <code>{review.runId}</code></span>
            <span>Head <code title={noHead ? undefined : CURRENT_HEAD}>{noHead ? "Not recorded" : "8ac41de…6a102"}</code></span>
            <span className={styles.toneProof}>Lintel · TESTS REQUIRED · 46 MEDIUM</span>
            <span className={styles.toneBlocking}>4 open blockers</span>
            <span>Prior Approve · stale</span>
          </div>
        </header>

        <div className={styles.dialogBody}>
          {errorMessage ? (
            <div id={errorId} className={localTransaction === "duplicate" ? styles.dialogNotice : styles.dialogError} role={localTransaction === "duplicate" ? "status" : "alert"} tabIndex={-1}>
              <Glyph name={localTransaction === "duplicate" ? "check" : "warning"} size={18} />
              <div><strong>{localTransaction === "duplicate" ? "Unchanged result" : "Decision not recorded"}</strong><p>{errorMessage}</p><div><button type="button" onClick={() => setLocalTransaction("valid")}>{localTransaction.includes("conflict") ? "Reload current context" : "Try again"}</button></div></div>
            </div>
          ) : null}

          <fieldset className={styles.outcomeFieldset}>
            <legend>Outcome <span>Required · none is selected from Lintel’s recommendation</span></legend>
            <div className={styles.outcomeGrid}>
              {OUTCOMES.map((item, index) => (
                <label key={item} className={outcome === item ? styles.outcomeSelected : ""}>
                  <input
                    ref={index === 0 ? firstOutcomeRef : undefined}
                    type="radio"
                    name="decision-outcome"
                    value={item}
                    checked={outcome === item}
                    onChange={() => setOutcome(item)}
                    disabled={saving}
                  />
                  <span><strong>{OUTCOME_LABELS[item]}</strong><small>{OUTCOME_HELP[item]}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.dialogField}>
            <span>Rationale <strong>Required</strong></span>
            <small>State the engineering judgment and what evidence or uncertainty informed it.</small>
            <textarea
              ref={rationaleRef}
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              rows={4}
              disabled={saving}
              aria-invalid={localTransaction === "validation-error" && !rationale.trim()}
            />
          </label>

          <fieldset className={styles.referenceFieldset}>
            <legend>Referenced evidence and requirements <span>Optional for this outcome</span></legend>
            <label><input type="checkbox" checked={evidenceRefs} onChange={(event) => setEvidenceRefs(event.target.checked)} disabled={saving} /><span><strong>proof-retry-integration</strong><small>Missing current-head retry and failure-path integration proof</small></span></label>
            <label><input type="checkbox" checked={evidenceRefs} onChange={(event) => setEvidenceRefs(event.target.checked)} disabled={saving} /><span><strong>requirement-fallback-proof</strong><small>Open blocking exact condition</small></span></label>
          </fieldset>

          {acceptedRisk ? (
            <fieldset className={styles.referenceFieldset}>
              <legend>Accepted-risk references <span>At least one required</span></legend>
              <label><input type="checkbox" checked={riskRef} onChange={(event) => setRiskRef(event.target.checked)} disabled={saving} /><span><strong>risk-fallback-masks-failure</strong><small>Caller may treat a provider failure as an empty successful result.</small></span></label>
              <label className={styles.acknowledgement}><input type="checkbox" checked={riskAck} onChange={(event) => setRiskAck(event.target.checked)} disabled={saving} /><span>I, the accountable engineer—not Lintel—accept this named residual risk.</span></label>
            </fieldset>
          ) : null}

          {approval ? (
            <label className={styles.acknowledgementBlock}>
              <input type="checkbox" checked={blockerAck} onChange={(event) => setBlockerAck(event.target.checked)} disabled={saving} />
              <span><strong>Open blockers remain.</strong>I understand that four blocking requirements and two blocking proof gaps remain unresolved.</span>
            </label>
          ) : null}

          {noHead ? (
            <label className={styles.acknowledgementBlock}>
              <input type="checkbox" checked={missingHeadAck} onChange={(event) => setMissingHeadAck(event.target.checked)} disabled={saving} />
              <span><strong>Head identity is not recorded.</strong>I understand that current applicability and stale-decision detection cannot be proven.</span>
            </label>
          ) : null}

          <div className={styles.persistenceStatement}>
            <Glyph name="history" size={16} />
            <p>This controlled save appends one lab-local in-memory event bound to <code>{review.runId}</code>{noHead ? " without a head binding" : " and the current head"}. Earlier events remain in sample history.</p>
          </div>
        </div>

        <footer className={styles.dialogFooter}>
          <span>{saving ? "Saving decision…" : valid ? "All required fields are complete." : "Complete the required fields to confirm."}</span>
          <div><button type="button" className={styles.secondaryButton} onClick={requestClose} disabled={saving}>Cancel</button><button type="button" className={styles.primaryButton} onClick={confirm} disabled={!valid || saving}>{saving ? "Saving…" : outcome ? `Confirm ${OUTCOME_LABELS[outcome]}` : "Confirm decision"}</button></div>
        </footer>

        {discardOpen ? (
          <div className={styles.discardLayer} data-discard-dialog role="alertdialog" aria-modal="true" aria-labelledby={`${headingId}-discard`}>
            <div>
              <span className={styles.eyebrow}>Unsaved Human Decision</span>
              <h3 id={`${headingId}-discard`}>Discard this draft?</h3>
              <p>The selected outcome, rationale, references and acknowledgements will be lost.</p>
              <div><button type="button" autoFocus onClick={() => setDiscardOpen(false)}>Keep editing</button><button type="button" className={styles.destructiveButton} onClick={onClose}>Discard draft</button></div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
