"use client";

import { createPortal } from "react-dom";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  decisionDraftContextFor,
  decisionSubjectIdFromCapability,
  type DecisionDraftContext,
  type ReviewId,
} from "../../lib/r6c/index";
import type {
  DecisionMutationCommand,
  DecisionMutationResult,
} from "../../lib/workspace-v2/decision-mutations";
import type { CaseDetail, DecisionOutcome } from "../../lib/workspace-v2/view-model";
import {
  APPLICABILITY_LABEL,
  DEFAULT_DECISION_OUTCOMES,
  DRAFT_DURABILITY_REASON_LABEL,
  HUMAN_DECISION_COMPOSER_DESCRIPTION,
  HUMAN_DECISION_COMPOSER_TITLE,
  HUMAN_DECISION_RATIONALE_MAX_LENGTH,
  MORE_DECISION_OUTCOMES,
  OUTCOME_LABEL,
  OUTCOME_MEANING,
  buildHumanDecisionCommand,
  compareDecisionBasis,
  currentEffectiveEntryId,
  decisionSubmittability,
  humanDecisionDraftFreshness,
  primaryActionLabel,
  riskReferenceOptions,
  staleReasonLabel,
  type DecisionBasisSnapshot,
  type DraftDurability,
  type DraftRemovalResult,
  type DraftWriteResult,
  type HumanDecisionDraftRecord,
} from "../../lib/r6k/index";
import styles from "./human-decision.module.css";

const MORE_OUTCOMES = new Set<DecisionOutcome>(MORE_DECISION_OUTCOMES);

export type HumanDecisionComposerProps = Readonly<{
  open: boolean;
  reviewId: ReviewId | null;
  detail: CaseDetail | null;
  draft: HumanDecisionDraftRecord | null;
  durability: DraftDurability | null;
  recordQuarantined: boolean;
  onClose: () => void;
  onUpdateDraft: (draft: HumanDecisionDraftRecord) => void;
  onDiscardDraft: () => DraftRemovalResult;
  onDiscardUnreadableDraft: () => DraftWriteResult;
  onAcknowledgeReconcile: (
    reviewedBasis: DecisionBasisSnapshot,
  ) => Readonly<{ status: "rebound"; draft: HumanDecisionDraftRecord }>
    | Readonly<{ status: "moved-again" }>;
  onSubmit: (command: DecisionMutationCommand) => Promise<DecisionMutationResult>;
}>;

function contextFor(reviewId: ReviewId, detail: CaseDetail): DecisionDraftContext {
  return decisionDraftContextFor(reviewId, detail, (_id, currentCase) => {
    if (currentCase.decisionMutation.kind !== "available") {
      return {
        status: "unavailable",
        reason: currentCase.decisionMutation.kind === "unavailable"
          ? currentCase.decisionMutation.reason
          : "Sample review decisions are read-only.",
      };
    }
    return {
      status: "available",
      decisionSubjectId: decisionSubjectIdFromCapability(currentCase.decisionMutation.caseId),
    };
  });
}

function formatRecordedTime(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(parsed));
}

function durabilityExplanation(durability: DraftDurability): string {
  if (durability.category === "saved") return "This draft survives a browser restart.";
  if (durability.category === "not-saved") return DRAFT_DURABILITY_REASON_LABEL[durability.reason];
  return durability.reason === "store-unreadable"
    ? "Stored draft data could not be read and was not overwritten. Nothing from this session can persist across a restart."
    : "Draft storage cannot be read or written in this browser. Nothing from this session can persist across a restart.";
}

function focusableElements(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element.getAttribute("aria-hidden") !== "true");
}

export default function HumanDecisionComposer(props: HumanDecisionComposerProps) {
  const {
    open,
    reviewId,
    detail,
    draft,
    durability,
    recordQuarantined,
    onClose,
    onUpdateDraft,
    onDiscardDraft,
    onDiscardUnreadableDraft,
    onAcknowledgeReconcile,
    onSubmit,
  } = props;
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serviceResult, setServiceResult] = useState<DecisionMutationResult | null>(null);
  const [reviewedBasis, setReviewedBasis] = useState<DecisionBasisSnapshot | null>(null);
  const [discardKind, setDiscardKind] = useState<"valid" | "unreadable" | null>(null);
  const [discardError, setDiscardError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef(new Map<DecisionOutcome, HTMLButtonElement>());
  const keepDraftRef = useRef<HTMLButtonElement | null>(null);

  const context = useMemo(
    () => reviewId && detail ? contextFor(reviewId, detail) : null,
    [detail, reviewId],
  );
  const basis = useMemo<DecisionBasisSnapshot | null>(
    () => context && detail ? { context, recordedEntryId: currentEffectiveEntryId(detail) } : null,
    [context, detail],
  );
  const freshness = draft && context && detail
    ? humanDecisionDraftFreshness(draft, context, currentEffectiveEntryId(detail))
    : { stale: false, reasons: [] as const };
  const referenceOptions = detail ? riskReferenceOptions(detail) : [];
  const submittability = draft && detail && context
    ? decisionSubmittability(draft, detail, context)
    : { submittable: false, reason: "This Review is unavailable.", action: null };
  const capabilityReason = detail?.decisionMutation.kind === "unavailable"
    ? detail.decisionMutation.reason
    : detail?.decisionMutation.kind === "sample"
      ? "Sample review decisions are read-only."
      : null;
  const inReconcile = reviewedBasis !== null;
  const staleReadOnly = freshness.stale && !inReconcile;
  const controlsReadOnly = submitting || staleReadOnly || capabilityReason !== null;
  const visibleOutcomes: readonly DecisionOutcome[] = moreExpanded
    ? [...DEFAULT_DECISION_OUTCOMES, ...MORE_DECISION_OUTCOMES]
    : DEFAULT_DECISION_OUTCOMES;

  useEffect(() => {
    if (!open) return;
    setSubmitting(false);
    setServiceResult(null);
    setReviewedBasis(null);
    setDiscardKind(null);
    setDiscardError(null);
  }, [open, reviewId]);

  useEffect(() => {
    if (
      (draft?.selectedOutcome && MORE_OUTCOMES.has(draft.selectedOutcome))
      || (detail?.decision.status === "recorded" && MORE_OUTCOMES.has(detail.decision.outcome))
    ) setMoreExpanded(true);
  }, [detail?.decision, draft?.selectedOutcome]);

  useEffect(() => {
    if (!open) return;
    const background = document.querySelector<HTMLElement>("[data-destination]");
    const previousHidden = background?.getAttribute("aria-hidden");
    if (background) {
      background.inert = true;
      background.setAttribute("aria-hidden", "true");
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (background) {
        background.inert = false;
        if (previousHidden == null) background.removeAttribute("aria-hidden");
        else background.setAttribute("aria-hidden", previousHidden);
      }
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !draft || !detail) return;
    const recorded = detail.decision.status === "recorded" ? detail.decision.outcome : null;
    const initial = draft.selectedOutcome ?? recorded ?? "approve";
    requestAnimationFrame(() => rowRefs.current.get(initial)?.focus());
  }, [detail, draft?.binding.reviewId, open]);

  useLayoutEffect(() => {
    if (discardKind) requestAnimationFrame(() => keepDraftRef.current?.focus());
  }, [discardKind]);

  if (!open || !reviewId || !detail || !draft || !context || !basis || typeof document === "undefined") return null;

  const update = (changes: Partial<HumanDecisionDraftRecord>) => {
    onUpdateDraft({ ...draft, ...changes, updatedAt: new Date().toISOString() });
    setServiceResult(null);
    setDiscardError(null);
  };

  const selectOutcome = (outcome: DecisionOutcome) => {
    if (controlsReadOnly) return;
    update({ selectedOutcome: outcome });
  };

  const moveRadio = (event: KeyboardEvent<HTMLButtonElement>, outcome: DecisionOutcome) => {
    if (!(["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"] as string[]).includes(event.key)) return;
    event.preventDefault();
    if (controlsReadOnly) return;
    const index = visibleOutcomes.indexOf(outcome);
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const next = visibleOutcomes[(index + direction + visibleOutcomes.length) % visibleOutcomes.length]!;
    selectOutcome(next);
    requestAnimationFrame(() => rowRefs.current.get(next)?.focus());
  };

  const close = () => {
    if (!submitting) onClose();
  };

  const keyDownDialog = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = focusableElements(dialogRef.current);
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const backdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close();
  };

  const beginReconcile = () => {
    setReviewedBasis(basis);
    setServiceResult(null);
    setDiscardError(null);
  };

  const acknowledge = () => {
    if (!reviewedBasis) return;
    const result = onAcknowledgeReconcile(reviewedBasis);
    if (result.status === "moved-again") {
      setReviewedBasis(null);
      setServiceResult({
        outcome: "stale-command",
        message: "The Review basis moved again before acknowledgement. Review the newest changes and reconcile again.",
      });
      return;
    }
    setReviewedBasis(null);
    setServiceResult(null);
  };

  const submit = async () => {
    const command = buildHumanDecisionCommand(draft, detail, context);
    if (!command || submitting) return;
    setSubmitting(true);
    setServiceResult(null);
    const result = await onSubmit(command);
    setSubmitting(false);
    if (result.outcome !== "persisted" && result.outcome !== "persisted-refresh-failed") {
      setServiceResult(result);
    }
  };

  const confirmDiscard = () => {
    if (discardKind === "unreadable") {
      const result = onDiscardUnreadableDraft();
      if (!result.persisted) {
        setDiscardError(`${result.durability.label}. ${durabilityExplanation(result.durability)}`);
        return;
      }
    } else {
      const result = onDiscardDraft();
      if (!result.removed) {
        setDiscardError(`${result.durability.label}. ${durabilityExplanation(result.durability)}`);
        return;
      }
    }
    setDiscardKind(null);
    setDiscardError(null);
    setReviewedBasis(null);
    setServiceResult(null);
  };

  const recordedOutcome = detail.decision.status === "recorded" ? detail.decision.outcome : null;
  const consequence = draft.selectedOutcome === "approve-with-accepted-risk"
    ? "accepted-risk"
    : draft.selectedOutcome === "approve"
      && detail.decisionMutation.kind === "available"
      && detail.decisionMutation.openBlockingRequirements > 0
      ? "approve-with-blockers"
      : null;
  const basisChanges = reviewedBasis ? compareDecisionBasis(draft, reviewedBasis) : [];

  return createPortal(
    <div className={styles.backdrop} onMouseDown={backdropMouseDown}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="human-decision-title"
        aria-describedby="human-decision-description"
        onKeyDown={keyDownDialog}
      >
        <header className={styles.header}>
          <div>
            <h2 id="human-decision-title">{HUMAN_DECISION_COMPOSER_TITLE}</h2>
            <p id="human-decision-description">{HUMAN_DECISION_COMPOSER_DESCRIPTION}</p>
          </div>
          <button
            className={styles.close}
            type="button"
            aria-label="Close Human Decision"
            disabled={submitting}
            onClick={close}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className={styles.body}>
          {detail.decision.status === "recorded" && (
            <section className={styles.currentlyRecorded} aria-labelledby="currently-recorded-title">
              <h3 id="currently-recorded-title">Currently recorded</h3>
              <p className={styles.currentOutcome}>{OUTCOME_LABEL[detail.decision.outcome]}</p>
              <p>Local reviewer · this device · {formatRecordedTime(detail.decision.recordedAt)}</p>
              <p>{APPLICABILITY_LABEL[detail.decision.applicability]}</p>
              {detail.decision.rationale && <p className={styles.recordedRationale}>{detail.decision.rationale}</p>}
            </section>
          )}

          {capabilityReason && <p className={styles.capabilityReason} id="decision-capability-reason">{capabilityReason}</p>}

          {freshness.stale && !inReconcile && (
            <section className={styles.staleNotice} aria-live="polite">
              <h3>This draft was formed against an earlier state of this Review.</h3>
              <ul>
                {freshness.reasons.map((reason) => <li key={reason}>{staleReasonLabel(reason)}</li>)}
              </ul>
            </section>
          )}

          {reviewedBasis && (
            <section className={styles.reconcile} aria-live="polite">
              <h3>Review what changed</h3>
              <p>Your outcome, rationale and risk references are preserved. Acknowledgement re-binds only this private draft.</p>
              <dl>
                {basisChanges.map((change) => (
                  <div key={change.dimension}>
                    <dt>{change.label}</dt>
                    <dd><span>{change.was}</span><span aria-hidden="true">→</span><span>{change.is}</span></dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className={styles.choiceSection} aria-labelledby="decision-outcomes-title">
            <h3 id="decision-outcomes-title">Outcome</h3>
            <div
              className={styles.radioGroup}
              role="radiogroup"
              aria-labelledby="decision-outcomes-title"
              aria-disabled={controlsReadOnly}
              aria-describedby={capabilityReason ? "decision-capability-reason" : undefined}
            >
              {visibleOutcomes.map((outcome) => {
                const selected = draft.selectedOutcome === outcome;
                const recorded = recordedOutcome === outcome;
                const tabStop = selected
                  || (!draft.selectedOutcome && recorded)
                  || (!draft.selectedOutcome && !recorded && outcome === "approve");
                return (
                  <button
                    key={outcome}
                    ref={(element) => {
                      if (element) rowRefs.current.set(outcome, element);
                      else rowRefs.current.delete(outcome);
                    }}
                    className={`${styles.optionRow} ${selected ? styles.optionSelected : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-disabled={controlsReadOnly}
                    aria-describedby={`decision-outcome-meaning-${outcome}`}
                    tabIndex={tabStop ? 0 : -1}
                    onClick={() => selectOutcome(outcome)}
                    onKeyDown={(event) => moveRadio(event, outcome)}
                  >
                    <span className={styles.optionCopy}>
                      <span className={styles.optionTitle}>
                        {OUTCOME_LABEL[outcome]}
                        {recorded && <span className={styles.recordedMarker}>Recorded</span>}
                      </span>
                      <span id={`decision-outcome-meaning-${outcome}`} className={styles.optionMeaning}>
                        {OUTCOME_MEANING[outcome]}
                      </span>
                    </span>
                    {selected && <span className={styles.selectionCheck} aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
            <button
              className={styles.moreToggle}
              type="button"
              aria-expanded={moreExpanded}
              onClick={() => setMoreExpanded((expanded) => !expanded)}
            >
              <span>More outcomes</span>
              <span aria-hidden="true">{moreExpanded ? "⌃" : "⌄"}</span>
            </button>
          </section>

          {consequence && (
            <>
              <div className={styles.separator} />
              <section className={styles.consequence} aria-live="polite" aria-labelledby="decision-consequence-title">
                {consequence === "approve-with-blockers" ? (
                  <>
                    <h3 id="decision-consequence-title">Approve with unresolved blockers</h3>
                    <p>
                      {detail.decisionMutation.kind === "available" ? detail.decisionMutation.openBlockingRequirements : 0} unresolved blocking requirement{detail.decisionMutation.kind === "available" && detail.decisionMutation.openBlockingRequirements === 1 ? " remains" : "s remain"}. This decision does not close or resolve them.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 id="decision-consequence-title">Approve with accepted risk</h3>
                    <p>You are explicitly accepting named residual risks. Select at least one current reference.</p>
                    <fieldset className={styles.riskReferences} disabled={controlsReadOnly}>
                      <legend>Risk references <span aria-hidden="true">*</span></legend>
                      {referenceOptions.length === 0 ? (
                        <p>No current open blocking requirement or evidence reference is available.</p>
                      ) : referenceOptions.map((option) => {
                        const checked = draft.acceptedRiskReferenceIds.includes(option.id);
                        return (
                          <label key={`${option.kind}-${option.id}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => update({
                                acceptedRiskReferenceIds: checked
                                  ? draft.acceptedRiskReferenceIds.filter((id) => id !== option.id)
                                  : [...draft.acceptedRiskReferenceIds, option.id],
                              })}
                            />
                            <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                          </label>
                        );
                      })}
                    </fieldset>
                  </>
                )}
              </section>
            </>
          )}

          <section className={styles.rationale} aria-labelledby="decision-rationale-title">
            <div className={styles.fieldHeading}>
              <label id="decision-rationale-title" htmlFor="human-decision-rationale">Rationale</label>
              {draft.rationale.length >= HUMAN_DECISION_RATIONALE_MAX_LENGTH - 100 && (
                <span>{draft.rationale.length}/{HUMAN_DECISION_RATIONALE_MAX_LENGTH}</span>
              )}
            </div>
            <textarea
              id="human-decision-rationale"
              value={draft.rationale}
              maxLength={HUMAN_DECISION_RATIONALE_MAX_LENGTH}
              rows={4}
              readOnly={controlsReadOnly}
              aria-required="true"
              onChange={(event) => update({ rationale: event.target.value })}
            />
            <p>Required for every Human Decision.</p>
          </section>

          {durability && (
            <section className={styles.durability} aria-live="polite">
              <p><strong>{durability.label}</strong> {durabilityExplanation(durability)}</p>
              {recordQuarantined && discardKind === null && (
                <button type="button" onClick={() => setDiscardKind("unreadable")}>Discard unreadable draft</button>
              )}
            </section>
          )}

          {serviceResult && (
            <p className={serviceResult.outcome === "unchanged" ? styles.neutralNotice : styles.errorNotice} role={serviceResult.outcome === "unchanged" ? "status" : "alert"}>
              {serviceResult.message}
            </p>
          )}
          {discardError && <p className={styles.errorNotice} role="alert">{discardError}</p>}
        </div>

        <footer className={styles.footer}>
          {discardKind ? (
            <div className={styles.discardConfirm}>
              <p>{discardKind === "unreadable" ? "Discard the unreadable stored draft?" : "Discard this draft? Your selection and rationale will be lost."}</p>
              <div className={styles.actions}>
                <button className={styles.secondary} type="button" onClick={confirmDiscard}>Discard</button>
                <button ref={keepDraftRef} className={styles.primary} type="button" onClick={() => setDiscardKind(null)}>Keep draft</button>
              </div>
            </div>
          ) : reviewedBasis ? (
            <div className={styles.actions}>
              <button className={styles.secondary} type="button" onClick={() => setReviewedBasis(null)}>Back</button>
              <button className={styles.primary} type="button" onClick={acknowledge}>Acknowledge and continue</button>
            </div>
          ) : freshness.stale ? (
            <div className={styles.actions}>
              <button className={styles.secondary} type="button" onClick={() => setDiscardKind("valid")}>Discard draft</button>
              <button className={styles.primary} type="button" onClick={beginReconcile}>Reconcile</button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button className={styles.secondary} type="button" disabled={submitting} onClick={close}>Cancel</button>
              {serviceResult?.outcome === "failed" && (
                <button className={styles.secondary} type="button" disabled={submitting} onClick={() => void submit()}>Retry</button>
              )}
              <button
                className={styles.primary}
                type="button"
                disabled={!submittability.submittable || submitting}
                aria-describedby={!submittability.submittable && submittability.reason ? "decision-primary-reason" : undefined}
                onClick={() => void submit()}
              >
                {submitting ? "Recording…" : primaryActionLabel(submittability.action)}
              </button>
              {!submittability.submittable && submittability.reason && (
                <span className={styles.visuallyHidden} id="decision-primary-reason">{submittability.reason}</span>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
