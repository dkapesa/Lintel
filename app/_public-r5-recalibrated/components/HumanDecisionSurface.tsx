"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type RefObject } from "react";
import styles from "../public-r5-recalibrated.module.css";
import {
  CANONICAL_REVIEW,
  DECISION_DIALOG_COPY,
  DECISION_OUTCOMES,
  DECISION_READINESS,
  DECISION_SURFACE_LABEL,
  READINESS,
} from "../canonical-review";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/* R5E.1D — the shared, presentational Human Decision content. Rendered
   identically inside the non-modal guided preview and the manually
   activated dialog (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §12a: both
   surfaces "render every outcome unselected, keep the read-only boundary
   explicit, and record nothing"). All seven outcomes are the frozen
   product's own DECISION_OUTCOMES, rendered as truthful non-interactive
   records — never a disabled radio input — because selection is not
   implemented here and a disabled form control would misrepresent that
   (docs/r5/R5E1D task brief §8: "Do not use disabled radio buttons when
   that would create a misleading form"). Nothing here is a route, a form,
   or capable of recording, submitting or writing anything. */
function HumanDecisionContent() {
  return (
    <div className={styles.decisionContent}>
      <p className={styles.decisionEyebrow}>{DECISION_DIALOG_COPY.eyebrow}</p>
      <p className={styles.decisionStatement}>{DECISION_DIALOG_COPY.statement}</p>

      <div className={styles.decisionContextCard}>
        <p className={styles.decisionContextRepo}>
          {CANONICAL_REVIEW.repository} · {CANONICAL_REVIEW.pullRequestLabel}
        </p>
        <p className={styles.decisionContextTitle}>{CANONICAL_REVIEW.title}</p>
        <div className={styles.decisionReadinessRow}>
          <span>
            <strong>{CANONICAL_REVIEW.recommendation}</strong>
          </span>
          <span>{CANONICAL_REVIEW.riskLabel}</span>
          <span>{CANONICAL_REVIEW.requirementsSummary}</span>
          <span>{READINESS.headline}</span>
        </div>
        <p className={styles.decisionPriorNote}>{DECISION_READINESS.priorDecision}</p>
        <p className={styles.decisionAppliesTo}>{DECISION_READINESS.appliesTo}</p>
      </div>

      <p className={styles.decisionOutcomeIntro}>{DECISION_READINESS.outcomeSelected}</p>

      <ul className={styles.decisionOutcomeList}>
        {DECISION_OUTCOMES.map((item) => (
          <li key={item.recordKey} className={styles.decisionOutcomeRow}>
            <span className={styles.decisionOutcomeMarker} aria-hidden="true" />
            <span className={styles.decisionOutcomeText}>
              <strong>{item.label}</strong>
              <small>{item.meaning}</small>
            </span>
            <span className={styles.decisionOutcomeTag}>Not selected</span>
          </li>
        ))}
      </ul>

      <div className={styles.decisionWarning}>
        <strong>{DECISION_DIALOG_COPY.readOnlyLabel}</strong>
        <p>{DECISION_DIALOG_COPY.readOnlyBody}</p>
      </div>
    </div>
  );
}

/* R5E.1D — the guided preview. Reached only by scroll
   (`decisionSurfaceOrigin === "guided"`). Ordinary in-page content: no
   `role="dialog"`, no `aria-modal`, no focus movement, no keydown handling,
   no inert background — the page remains scrollable and operable, per
   docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §12a. It is positioned as a
   non-modal visual layer above the live stage with restrained dimming
   behind it, which `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §7
   explicitly permits, while remaining ordinary content: `.decisionLayer`
   carries no ARIA role and its scrim is `aria-hidden` and
   `pointer-events: none`, so it neither traps focus nor blocks scrolling or
   pointer interaction with anything beneath it. */
export function HumanDecisionPreview({ onOpenDialog }: { onOpenDialog: () => void }) {
  return (
    <div className={styles.decisionLayer} data-decision-origin="guided">
      <div className={styles.decisionScrim} aria-hidden="true" />
      <div className={styles.decisionCard}>
        <p className={styles.decisionPreviewLabel}>{DECISION_SURFACE_LABEL.guided}</p>
        <HumanDecisionContent />
        <div className={styles.workspaceActions}>
          <button type="button" className={styles.workspaceActionBtn} onClick={onOpenDialog}>
            Open Human Decision
          </button>
        </div>
      </div>
    </div>
  );
}

/* R5E.1D — the manually activated dialog. Full dialog semantics:
   `role="dialog"`, `aria-modal="true"`, labelled by its own heading,
   deliberate initial focus, contained focus (Tab/Shift+Tab cycle inside the
   panel, the same `FOCUSABLE` containment pattern
   app/workspace/HumanDecisionDialog.tsx already uses), `Escape` closes,
   focus returns to the triggering control on close
   (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §12a). No outcome can be
   selected, no rationale can be entered, and there is no submission-capable
   action anywhere in this component — only a genuine `Close` control.

   R5E.1D human-review correction: the overline label above
   HumanDecisionContent reads DECISION_SURFACE_LABEL.manual
   ("Read-only Human Decision"), never the guided preview's own
   "scroll to continue, or open it directly" wording — the visitor has
   already opened this dialog directly, so a label that invites further
   scrolling or opening would be false. The distinction is carried by
   component identity alone (this function only ever renders the manual
   label; HumanDecisionPreview only ever renders the guided label), so no
   new prop or state was introduced. */
export function HumanDecisionDialog({
  onClose,
  triggerRef,
}: {
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const trigger = triggerRef.current;
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (trigger && document.contains(trigger)) trigger.focus();
    };
  }, [triggerRef]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
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

  return (
    <div className={styles.dialogLayer} onKeyDown={handleKeyDown}>
      <button type="button" className={styles.dialogScrimButton} aria-label="Close Human Decision" onClick={onClose} />
      <div
        ref={panelRef}
        className={styles.decisionDialogPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <header className={styles.decisionDialogHeader}>
          <div>
            <span className={styles.decisionEyebrow}>{DECISION_DIALOG_COPY.eyebrow}</span>
            <h2 id={headingId} ref={headingRef} tabIndex={-1} className={styles.decisionDialogHeading}>
              {DECISION_DIALOG_COPY.heading}
            </h2>
            <p id={descriptionId} className={styles.decisionDialogDescription}>
              {DECISION_DIALOG_COPY.statement}
            </p>
          </div>
          <button type="button" className={styles.iconCloseButton} onClick={onClose} aria-label="Close Human Decision">
            ×
          </button>
        </header>

        <div className={styles.decisionDialogBody}>
          <p className={styles.decisionPreviewLabel}>{DECISION_SURFACE_LABEL.manual}</p>
          <HumanDecisionContent />
        </div>

        <footer className={styles.decisionDialogFooter}>
          <button type="button" className={styles.workspaceActionBtn} onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
