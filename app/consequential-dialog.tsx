"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

type ConsequentialDialogProps = {
  open: boolean;
  title: string;
  affectedObject: string;
  currentState: string;
  proposedState: string;
  consequence: string;
  unresolvedConditions?: string[];
  confirmLabel: string;
  error?: string | null;
  returnFocusRef: RefObject<HTMLElement | null>;
  onConfirm: () => boolean | void;
  onCancel: () => void;
  eyebrow?: string;
  confirmTone?: "neutral" | "destructive";
};

export default function ConsequentialDialog({
  open,
  title,
  affectedObject,
  currentState,
  proposedState,
  consequence,
  unresolvedConditions = [],
  confirmLabel,
  error = null,
  returnFocusRef,
  onConfirm,
  onCancel,
  eyebrow = "Consequential administrative action",
  confirmTone = "destructive",
}: ConsequentialDialogProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const cancelHandlerRef = useRef(onCancel);
  cancelHandlerRef.current = onCancel;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const shell = document.querySelector<HTMLElement>(".r4-product-shell");
    shell?.setAttribute("inert", "");
    shell?.setAttribute("aria-hidden", "true");
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => cancelRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      const panel = panelRef.current;
      if (!panel) return;
      if (event.key === "Escape") {
        event.preventDefault();
        cancelHandlerRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((item) => item.offsetParent !== null);
      if (!focusable.length) return;
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

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      shell?.removeAttribute("inert");
      shell?.removeAttribute("aria-hidden");
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [open, returnFocusRef]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="r4-consequence-layer">
      <div className="r4-consequence-scrim" aria-hidden="true" />
      <div
        className="r4-consequence-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        ref={panelRef}
      >
        <header className="r4-consequence-header">
          <span>{eyebrow}</span>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{consequence}</p>
        </header>
        <div className="r4-consequence-body">
          <dl className="r4-consequence-facts">
            <div><dt>Affected scope</dt><dd>{affectedObject}</dd></div>
            <div><dt>Current state</dt><dd>{currentState}</dd></div>
            <div><dt>Proposed state</dt><dd>{proposedState}</dd></div>
          </dl>
          {unresolvedConditions.length > 0 && (
            <section aria-labelledby={`${titleId}-conditions`}>
              <h3 id={`${titleId}-conditions`}>Unresolved conditions</h3>
              <ul>{unresolvedConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
            </section>
          )}
          {error && <p className="r4-consequence-error" role="alert">{error}</p>}
        </div>
        <footer className="r4-consequence-actions">
          <button type="button" ref={cancelRef} onClick={onCancel}>Cancel</button>
          <button
            className={confirmTone === "neutral" ? "r4-consequence-confirm r4-consequence-confirm--neutral" : "r4-consequence-confirm"}
            type="button"
            onClick={() => {
              const confirmed = onConfirm();
              if (confirmed !== false) onCancel();
            }}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
