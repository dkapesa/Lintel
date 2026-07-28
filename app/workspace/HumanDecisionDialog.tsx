"use client";

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import type {
  CaseDetail,
  DecisionOutcome,
  DecisionReference,
} from "../../lib/workspace-v2/view-model";
import {
  DECISION_OUTCOMES,
  OUTCOME_LABEL,
  OUTCOME_MEANING,
  RECOMMENDATION_LABEL,
} from "../../lib/workspace-v2/view-model";
import type { DecisionMutationResult } from "../../lib/workspace-v2/decision-mutations";
import { Icon } from "./icons";
import styles from "./workspace-r4.module.css";

export type DecisionSubmit = {
  intent: "record" | "reaffirm" | "withdraw";
  outcome: DecisionOutcome | null;
  rationale: string;
  references: DecisionReference[];
  acceptedRiskReferences: DecisionReference[];
};

const FOCUSABLE =
  'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export default function HumanDecisionDialog({
  open,
  detail,
  title,
  pending,
  result,
  onSubmit,
  onClose,
  onReload,
  returnFocusRef,
  readOnlyReason = null,
}: {
  open: boolean;
  detail: CaseDetail;
  title: string;
  pending: boolean;
  result: DecisionMutationResult | null;
  onSubmit: (submission: DecisionSubmit) => void;
  onClose: () => void;
  onReload: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  readOnlyReason?: string | null;
}) {
  const [outcome, setOutcome] = useState<DecisionOutcome | null>(null);
  const [rationale, setRationale] = useState("");
  const [referenceIds, setReferenceIds] = useState<Set<string>>(new Set());
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [blockersAcknowledged, setBlockersAcknowledged] = useState(false);
  const [unboundAcknowledged, setUnboundAcknowledged] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstOutcomeRef = useRef<HTMLInputElement | null>(null);
  const rationaleRef = useRef<HTMLTextAreaElement | null>(null);
  const headingId = useId();
  const descriptionId = useId();

  const references = useMemo<DecisionReference[]>(() => {
    const requirements = detail.requirements.map((item) => ({
      id: item.requirementId,
      kind: "clause" as const,
      label: item.title,
      available: item.status !== "unavailable",
      stale: item.stale,
      modelAssisted: false,
    }));
    const evidence = detail.evidence.map((item) => ({
      id: item.evidenceId,
      kind: "evidence" as const,
      label: item.title,
      available: item.status !== "not-applicable",
      stale: item.stale,
      modelAssisted: item.evidenceClass === "model-inferred",
    }));
    return [...requirements, ...evidence].slice(0, 20);
  }, [detail.evidence, detail.requirements]);

  const blockers = detail.requirements.filter(
    (item) => item.importance === "blocking" && !["satisfied", "accepted", "invalidated", "superseded"].includes(item.status),
  ).length;
  const acceptedRisk = outcome === "approve-with-accepted-risk";
  const approval = outcome === "approve" || acceptedRisk;
  const noHead = !detail.github.headSha;
  const selectedReferences = references.filter((item) => referenceIds.has(item.id));
  const dirty = Boolean(
    outcome ||
      rationale.trim() ||
      referenceIds.size ||
      riskAcknowledged ||
      blockersAcknowledged ||
      unboundAcknowledged,
  );
  const valid = Boolean(
    outcome &&
      rationale.trim() &&
      (!acceptedRisk || (selectedReferences.length > 0 && riskAcknowledged)) &&
      (!approval || blockers === 0 || blockersAcknowledged) &&
      (!noHead || unboundAcknowledged),
  );
  const existing = detail.decision.status === "recorded" ? detail.decision : null;
  const canReaffirm = Boolean(
    existing?.needsReaffirmation && detail.github.headSha && detail.decisionMutation.kind === "available",
  );
  const conflict = result?.outcome === "stale-command";

  useEffect(() => {
    if (!open) return;
    const returnTarget = returnFocusRef.current;
    const frame = window.requestAnimationFrame(() => firstOutcomeRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (returnTarget && document.contains(returnTarget)) returnTarget.focus();
    };
  }, [open, returnFocusRef]);

  if (!open) return null;

  function requestClose() {
    if (pending) return;
    if (dirty) setDiscardOpen(true);
    else onClose();
  }

  function containFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (discardOpen) setDiscardOpen(false);
      else requestClose();
      return;
    }
    if (event.key !== "Tab") return;
    const owner = discardOpen
      ? panelRef.current?.querySelector<HTMLElement>("[data-discard-dialog]")
      : panelRef.current;
    const focusable = Array.from(owner?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (item) => item.offsetParent !== null,
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function toggleReference(id: string) {
    setReferenceIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit(intent: DecisionSubmit["intent"]) {
    if (!rationale.trim()) {
      rationaleRef.current?.focus();
      return;
    }
    if (intent === "record" && !valid) {
      if (!outcome) firstOutcomeRef.current?.focus();
      return;
    }
    onSubmit({
      intent,
      outcome,
      rationale,
      references: selectedReferences,
      acceptedRiskReferences: acceptedRisk ? selectedReferences : [],
    });
  }

  return (
    <div className={styles.dialogLayer} onKeyDown={containFocus}>
      <button
        type="button"
        className={styles.dialogScrim}
        aria-label="Close Human Decision"
        onClick={requestClose}
        disabled={pending}
      />
      <div
        ref={panelRef}
        className={styles.decisionDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <header className={styles.dialogHeader}>
          <div>
            <span className={styles.eyebrow}>Accountable engineer action</span>
            <h2 id={headingId}>{readOnlyReason ? "Preview decision flow" : "Record Human Decision"}</h2>
            <p id={descriptionId}>Lintel recommends. The accountable engineer decides.</p>
          </div>
          <button type="button" className={styles.iconButton} onClick={requestClose} aria-label="Close Human Decision" disabled={pending}>
            <Icon name="close" />
          </button>
          <div className={styles.dialogContext}>
            <span title={`${detail.github.repository} PR #${detail.github.pullRequestNumber}`}>
              {detail.github.repository} · PR #{detail.github.pullRequestNumber}
            </span>
            <strong title={title}>{title}</strong>
            <span className={styles.mono} title={detail.run?.runId ?? "Run not recorded"}>
              {detail.run?.runId ?? "Run not recorded"}
            </span>
            <span className={styles.mono} title={detail.github.headSha ?? "Head not recorded"}>
              {detail.github.headSha ?? "Head not recorded"}
            </span>
          </div>
          <div className={styles.dialogVerdict}>
            <span>Lintel: <strong>{RECOMMENDATION_LABEL[detail.recommendation]}</strong></span>
            <span>Risk <strong>{detail.riskScore}/100 {detail.riskLevel}</strong></span>
            <span><strong>{blockers}</strong> open blockers</span>
            <span>{existing ? `Prior: ${OUTCOME_LABEL[existing.outcome]} · ${existing.applicability}` : "Human Decision pending"}</span>
          </div>
        </header>

        <div className={styles.dialogBody}>
          {readOnlyReason ? (
            <div className={styles.noticeError} role="status">
              <strong>Read-only sample</strong>
              <p>{readOnlyReason}</p>
            </div>
          ) : null}
          {result ? (
            <div className={result.outcome === "persisted" || result.outcome === "unchanged" ? styles.noticeSuccess : styles.noticeError} role={conflict ? "alert" : "status"}>
              <strong>{conflict ? "Decision context changed" : "Decision result"}</strong>
              <p>{result.message}</p>
              {conflict ? <button type="button" className={styles.secondaryButton} onClick={onReload}>Reload current context</button> : null}
            </div>
          ) : null}

          <fieldset className={styles.outcomeFieldset} disabled={pending}>
            <legend>Outcome <span aria-hidden="true">*</span></legend>
            <p>No outcome is selected from Lintel&apos;s recommendation.</p>
            <div className={styles.outcomeGrid}>
              {DECISION_OUTCOMES.map((item, index) => (
                <label key={item} className={outcome === item ? styles.outcomeSelected : styles.outcomeOption}>
                  <input
                    ref={index === 0 ? firstOutcomeRef : undefined}
                    type="radio"
                    name="human-decision-outcome"
                    value={item}
                    checked={outcome === item}
                    onChange={() => setOutcome(item)}
                  />
                  <span><strong>{OUTCOME_LABEL[item]}</strong><small>{OUTCOME_MEANING[item]}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.fieldLabel}>
            <span>Rationale <strong aria-hidden="true">*</strong></span>
            <textarea
              ref={rationaleRef}
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              rows={5}
              maxLength={700}
              disabled={pending}
              placeholder="State the engineering judgment, unresolved proof, and why this outcome is accountable."
            />
            <small>{rationale.length}/700 · required for every recorded action</small>
          </label>

          <fieldset className={styles.referenceFieldset} disabled={pending}>
            <legend>{acceptedRisk ? "Accepted-risk references" : "Evidence and requirement references"}</legend>
            <p>{acceptedRisk ? "Select at least one current named risk. The engineer accepts it; Lintel does not." : "Optional references remain bound to stored canonical identifiers."}</p>
            <div className={styles.referenceList}>
              {references.length > 0 ? references.map((reference) => (
                <label key={`${reference.kind}-${reference.id}`}>
                  <input
                    type="checkbox"
                    checked={referenceIds.has(reference.id)}
                    onChange={() => toggleReference(reference.id)}
                    disabled={!reference.available || pending}
                  />
                  <span>
                    <strong>{reference.label}</strong>
                    <small>{reference.kind} · <span className={styles.mono}>{reference.id}</span>{reference.stale ? " · stale" : ""}{reference.modelAssisted ? <> · <span className={styles.toneModel}>model assisted</span></> : ""}</small>
                  </span>
                </label>
              )) : <p>No current references are available for this review.</p>}
            </div>
          </fieldset>

          <div className={styles.acknowledgements}>
            {acceptedRisk ? (
              <label>
                <input type="checkbox" checked={riskAcknowledged} onChange={(event) => setRiskAcknowledged(event.target.checked)} disabled={pending} />
                <span>I, the accountable engineer, accept the selected residual risk. Lintel does not accept it for me.</span>
              </label>
            ) : null}
            {approval && blockers > 0 ? (
              <label>
                <input type="checkbox" checked={blockersAcknowledged} onChange={(event) => setBlockersAcknowledged(event.target.checked)} disabled={pending} />
                <span>I understand that {blockers} blocking requirement{blockers === 1 ? " remains" : "s remain"} open.</span>
              </label>
            ) : null}
            {noHead ? (
              <label>
                <input type="checkbox" checked={unboundAcknowledged} onChange={(event) => setUnboundAcknowledged(event.target.checked)} disabled={pending} />
                <span>I understand this decision cannot be bound to a recorded head, so current applicability cannot be proven.</span>
              </label>
            ) : null}
          </div>

          <p className={styles.persistenceNote}>
            {readOnlyReason
              ? "This preview does not write to the browser-local Human Decision ledger or publish through any integration."
              : "This action appends to the browser-local Human Decision ledger. It does not publish through the automated GitHub analysis comment."}
          </p>
        </div>

        <footer className={styles.dialogFooter}>
          <div className={styles.dialogSecondaryActions}>
            {canReaffirm ? <button type="button" className={styles.secondaryButton} onClick={() => submit("reaffirm")} disabled={pending || !rationale.trim()}>Reaffirm existing outcome</button> : null}
            {existing && existing.applicability !== "withdrawn" ? <button type="button" className={styles.textDangerButton} onClick={() => submit("withdraw")} disabled={pending || !rationale.trim()}>Withdraw decision</button> : null}
          </div>
          <button type="button" className={styles.secondaryButton} onClick={requestClose} disabled={pending}>Cancel</button>
          <button type="button" className={styles.primaryButton} onClick={() => submit("record")} disabled={!valid || pending || Boolean(readOnlyReason)}>
            {readOnlyReason ? "Read-only sample" : pending ? "Saving and verifying…" : existing ? "Record replacement" : "Record Human Decision"}
          </button>
        </footer>

        {discardOpen ? (
          <div className={styles.discardLayer}>
            <div className={styles.discardDialog} role="alertdialog" aria-modal="true" aria-labelledby={`${headingId}-discard`} data-discard-dialog>
              <Icon name="warning" size={20} />
              <h3 id={`${headingId}-discard`}>Discard this decision draft?</h3>
              <p>The outcome, rationale, references and acknowledgements have not been recorded.</p>
              <div>
                <button type="button" className={styles.secondaryButton} autoFocus onClick={() => setDiscardOpen(false)}>Keep editing</button>
                <button type="button" className={styles.textDangerButton} onClick={onClose}>Discard draft</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
