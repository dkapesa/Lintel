"use client";

/* R0B.2B — Workspace V2 recorded Human Decision · shared presentational atoms
   and the accessible dialog primitive.

   These are pure presentational parts plus one focus-managed modal shell.
   They hold no decision state; every value is passed in. The dialog shell is
   the single in-product confirmation surface that replaces window.confirm
   throughout the lab (§24.17, §19). */

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./workspace-v2.module.css";
import {
  APPLICABILITY_LABEL,
  DIVERGENCE_LABEL,
  DIVERGENCE_MEANING,
  OUTCOME_LABEL,
  divergenceTone,
  fingerprintPrefix,
  outcomeTone,
  referenceCountByKind,
  type DecisionActor,
  type DecisionApplicability,
  type DecisionDivergence,
  type DecisionOutcome,
  type DecisionReference,
  type ToneKey,
} from "./decision-model";

export function toneClassName(tone: ToneKey): string {
  switch (tone) {
    case "success":
      return styles.toneSuccess;
    case "warning":
      return styles.toneWarning;
    case "danger":
      return styles.toneDanger;
    case "information":
      return styles.toneInformation;
    case "muted":
      return styles.toneMuted;
  }
}

/* --- Sample badge (§17.12) -------------------------------------------- */

export function SampleBadge({ label }: { label?: string }) {
  return (
    <span className={styles.sampleBadge}>
      <span className={styles.sampleDot} aria-hidden="true" />
      {label ?? "Sample"}
    </span>
  );
}

/* --- Outcome token — the dominant decision token (§8.1, §16) ---------- */

export function DecisionOutcomeToken({
  outcome,
  size = "plate",
}: {
  outcome: DecisionOutcome;
  size?: "plate" | "inline";
}) {
  const tone = outcomeTone(outcome);
  return (
    <span
      className={`${styles.outcomeToken} ${
        size === "plate" ? styles.outcomeTokenPlate : styles.outcomeTokenInline
      } ${toneClassName(tone)}`}
    >
      <span className={`${styles.outcomeTokenDot} ${toneClassName(tone)}`} aria-hidden="true" />
      {OUTCOME_LABEL[outcome]}
    </span>
  );
}

/* --- Applicability chip (§6, §8.1) ------------------------------------ */

export function DecisionApplicabilityChip({
  applicability,
  priorHeadSha,
  currentHeadSha,
  headRecorded,
}: {
  applicability: DecisionApplicability;
  priorHeadSha?: string;
  currentHeadSha?: string;
  headRecorded: boolean;
}) {
  let tone: ToneKey = "muted";
  let detail = "";
  if (applicability === "applicable") {
    tone = "success";
    detail = headRecorded ? `Applies to current head ${currentHeadSha ?? ""}`.trim() : "Head not recorded";
  } else if (applicability === "predates-current-head") {
    tone = "warning";
    detail = `Recorded at ${priorHeadSha ?? "unknown"}; head is now ${currentHeadSha ?? "unknown"}`;
  } else if (applicability === "withdrawn") {
    tone = "warning";
    detail = "Withdrawn; history retained";
  } else {
    tone = "danger";
    detail = "Decision record could not be read";
  }
  return (
    <span className={`${styles.decisionChip} ${toneClassName(tone)}`} title={detail}>
      <span className={styles.decisionChipKind}>Applicability</span>
      {APPLICABILITY_LABEL[applicability]}
    </span>
  );
}

/* --- Divergence chip — only rendered when a Report is present (§7) ----- */

export function DecisionDivergenceChip({ divergence }: { divergence: DecisionDivergence }) {
  const tone = divergenceTone(divergence);
  return (
    <span
      className={`${styles.decisionChip} ${toneClassName(tone)}`}
      title={DIVERGENCE_MEANING[divergence]}
    >
      <span className={styles.decisionChipKind}>vs Lintel</span>
      {DIVERGENCE_LABEL[divergence]}
    </span>
  );
}

/* --- Fingerprint chip — attested, never signed (§17.11) --------------- */

export function DecisionFingerprintChip({ fingerprint }: { fingerprint: string }) {
  const help = "Content fingerprint — attested, not cryptographically signed.";
  return (
    <span className={styles.fingerprintChip} title={help} aria-label={`Fingerprint ${fingerprintPrefix(fingerprint)}. ${help}`}>
      fp:{fingerprintPrefix(fingerprint)}
    </span>
  );
}

/* --- Actor + truthful source (§8.1, §17.2) ---------------------------- */

export function DecisionActorProvenance({
  actor,
  recordedAt,
}: {
  actor?: DecisionActor;
  recordedAt?: string;
}) {
  const label = actor?.displayLabel ?? "Unknown actor";
  const source = actor?.source ?? "unknown";
  const showSource = source === "github" || source === "imported" || source === "unknown";
  return (
    <span className={styles.decisionProvenance}>
      <span className={styles.decisionActor}>{label}</span>
      {showSource ? <span className={styles.decisionSource}>{source}</span> : null}
      <span className={styles.decisionTime}>{recordedAt ?? "Timestamp unavailable"}</span>
    </span>
  );
}

/* --- Reference chips (§8.1, §17.8–17.9) ------------------------------- */

export function DecisionReferenceCounts({
  references,
  acceptedRiskReferences,
}: {
  references: DecisionReference[];
  acceptedRiskReferences: DecisionReference[];
}) {
  const counts = referenceCountByKind(references);
  const parts: string[] = [];
  if (counts.clause > 0) parts.push(`${counts.clause} clause`);
  if (counts.assumption > 0) parts.push(`${counts.assumption} assumption`);
  if (counts.evidence > 0) parts.push(`${counts.evidence} evidence`);
  if (acceptedRiskReferences.length > 0) parts.push(`${acceptedRiskReferences.length} accepted risk`);
  if (parts.length === 0) {
    return <span className={styles.decisionRefCount}>No references</span>;
  }
  return (
    <span className={styles.decisionRefCount}>
      {parts.map((part) => (
        <span key={part} className={styles.decisionRefCountItem}>
          {part}
        </span>
      ))}
    </span>
  );
}

export function DecisionReferenceList({
  references,
  emptyLabel = "No references recorded",
}: {
  references: DecisionReference[];
  emptyLabel?: string;
}) {
  if (references.length === 0) {
    return <p className={styles.inspectorEmpty}>{emptyLabel}</p>;
  }
  return (
    <ul className={styles.referenceList}>
      {references.map((reference) => (
        <li
          key={reference.id}
          className={`${styles.referenceRow} ${reference.available ? "" : styles.referenceGone}`}
        >
          <span className={styles.referenceKind}>{reference.kind}</span>
          <span className={styles.referenceLabel}>
            {reference.available ? reference.label : "Reference no longer available"}
          </span>
          <span className={styles.referenceFlags}>
            {reference.stale ? <span className={styles.referenceStale}>stale</span> : null}
            {reference.modelAssisted ? (
              <span className={styles.referenceModel}>model assisted</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* --- Rationale summary (§8.1, §17.4) ---------------------------------- */

export function DecisionRationaleSummary({ rationale }: { rationale?: string }) {
  if (!rationale || rationale.trim().length === 0) {
    return <span className={styles.decisionRationaleEmpty}>No rationale recorded</span>;
  }
  return <span className={styles.decisionRationale}>{rationale}</span>;
}

/* --- Live region (§19) ------------------------------------------------ */

export function DecisionLiveRegion({
  politeMessage,
  assertiveMessage,
}: {
  politeMessage: string;
  assertiveMessage: string;
}) {
  return (
    <>
      <div className={styles.visuallyHidden} role="status" aria-live="polite">
        {politeMessage}
      </div>
      <div className={styles.visuallyHidden} role="alert" aria-live="assertive">
        {assertiveMessage}
      </div>
    </>
  );
}

/* --- Accessible dialog primitive (§19, §24.17) ------------------------ */

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
  labelId,
  descriptionId,
  children,
  footer,
  returnFocusRef,
}: {
  title: string;
  description?: ReactNode;
  tone?: "neutral" | "destructive";
  onCancel: () => void;
  labelId?: string;
  descriptionId?: string;
  children: ReactNode;
  footer: ReactNode;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const autoLabelId = useId();
  const autoDescId = useId();
  const headingId = labelId ?? autoLabelId;
  const descId = description ? descriptionId ?? autoDescId : undefined;

  const focusFirst = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = focusables[0];
    if (target) target.focus();
    else panel.focus();
  }, []);

  useEffect(() => {
    focusFirst();
    const returnTarget = returnFocusRef?.current ?? null;
    return () => {
      /* Focus restoration to the triggering control (§19). */
      if (returnTarget && document.contains(returnTarget)) {
        returnTarget.focus();
      }
    };
  }, [focusFirst, returnFocusRef]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCancel();
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
    [onCancel],
  );

  return (
    <div className={styles.dialogOverlay} onKeyDown={onKeyDown}>
      {/* Inert backdrop; clicking it cancels, matching Escape. */}
      <div className={styles.dialogScrim} onClick={onCancel} aria-hidden="true" />
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
          <SampleBadge label="Visual-lab sample" />
        </div>
        {description ? (
          <div id={descId} className={styles.dialogDescription}>
            {description}
          </div>
        ) : null}
        <div className={styles.dialogBody}>{children}</div>
        <div className={styles.dialogFooter}>{footer}</div>
      </div>
    </div>
  );
}

export { fingerprintPrefix };
