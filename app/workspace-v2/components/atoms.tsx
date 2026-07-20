"use client";

/* R1B.0 — Production Workspace V2 · shared presentational atoms.

   Pure, stateless presentation parts shared by the Canvas, Inspector and
   Decision Plate. They hold no state; every value is passed in. Semantic
   colour is limited to the outcome token and the applicability / divergence
   chips (final palette calibration deferred to R1C). */

import styles from "../workspace-v2.module.css";
import { divergenceTone, outcomeTone, toneClass } from "./presentation";
import {
  APPLICABILITY_LABEL,
  DIVERGENCE_LABEL,
  DIVERGENCE_MEANING,
  OUTCOME_LABEL,
  type DecisionActor,
  type DecisionApplicability,
  type DecisionDivergence,
  type DecisionOutcome,
  type DecisionReference,
} from "../../../lib/workspace-v2/view-model";

/* Four-step strength meter reading the production evidence ladder. */
export function StrengthMeter({ rank }: { rank: number }) {
  return (
    <span className={styles.meter} aria-hidden="true">
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={`${styles.meterTick} ${step <= rank ? styles.meterTickOn : ""}`}
        />
      ))}
    </span>
  );
}

/* The shared cue that ties a focused canvas object to the Inspector. */
export function ArtifactMarker({
  kind,
  id,
  accent,
}: {
  kind: string;
  id: string;
  accent?: string;
}) {
  return (
    <span className={styles.marker}>
      <span className={`${styles.markerBar} ${accent ?? styles.toneMuted}`} />
      <span className={styles.markerKind}>{kind}</span>
      <span className={styles.markerId}>{id}</span>
    </span>
  );
}

export function SampleBadge({ label = "Sample" }: { label?: string }) {
  return (
    <span className={styles.sampleBadge}>
      <span className={styles.sampleDot} aria-hidden="true" />
      {label}
    </span>
  );
}

export function ProvenanceBadge({ label }: { label: string }) {
  return (
    <span className={styles.provenanceBadge}>
      <span className={styles.sampleDot} aria-hidden="true" />
      {label}
    </span>
  );
}

/* Shown only under the practical minimum width via CSS (≤ 1023px), where the
   dense four-plane workstation cannot be presented truthfully. It replaces the
   grid with a restrained explanation rather than a clipped interface, and is
   inert (display:none) at every supported width. Shared by the ready
   workstation and the loading / empty / unavailable shell states so no
   supported width ever renders an empty root. */
export function WorkstationMinWidthNotice() {
  return (
    <div className={styles.minWidthNotice} role="note">
      <div className={styles.minWidthInner}>
        <h2 className={styles.minWidthHeadline}>Wider viewport required</h2>
        <p className={styles.minWidthDetail}>
          The verification workstation is calibrated for a desktop width of 1024 pixels or more.
          Widen this window to return to the queue, evidence spine, canvas and inspector.
        </p>
      </div>
    </div>
  );
}

export function DecisionOutcomeToken({ outcome }: { outcome: DecisionOutcome }) {
  const tone = outcomeTone(outcome);
  return (
    <span className={`${styles.outcomeToken} ${toneClass(tone)}`}>
      <span className={`${styles.outcomeTokenDot} ${toneClass(tone)}`} aria-hidden="true" />
      {OUTCOME_LABEL[outcome]}
    </span>
  );
}

export function DecisionApplicabilityChip({
  applicability,
  priorHeadSha,
  currentHeadSha,
  headRecorded,
}: {
  applicability: DecisionApplicability;
  priorHeadSha: string | null;
  currentHeadSha: string | null;
  headRecorded: boolean;
}) {
  let tone: Parameters<typeof toneClass>[0] = "muted";
  let detail = "";
  if (applicability === "applicable") {
    tone = "success";
    detail = headRecorded
      ? `Applies to current head ${currentHeadSha ?? ""}`.trim()
      : "Head not recorded";
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
    <span className={`${styles.decisionChip} ${toneClass(tone)}`} title={detail}>
      {APPLICABILITY_LABEL[applicability]}
    </span>
  );
}

export function DecisionDivergenceChip({ divergence }: { divergence: DecisionDivergence }) {
  return (
    <span
      className={`${styles.decisionChip} ${toneClass(divergenceTone(divergence))}`}
      title={DIVERGENCE_MEANING[divergence]}
    >
      <span className={styles.decisionChipKind}>vs Lintel</span>
      {DIVERGENCE_LABEL[divergence]}
    </span>
  );
}

/* Actor + truthful source. Never invents a name; an unknown source is shown
   as such (r0b2 §17.2). */
export function DecisionActorProvenance({
  actor,
  recordedAt,
}: {
  actor: DecisionActor | null;
  recordedAt: string | null;
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

/* Compact reference count. Accepted-risk references stay a separate, visible
   count — they are semantically loaded and must not fold into a total. */
export function DecisionReferenceCounts({
  references,
  acceptedRiskReferences,
}: {
  references: DecisionReference[];
  acceptedRiskReferences: DecisionReference[];
}) {
  const parts: string[] = [];
  if (references.length > 0) {
    parts.push(`${references.length} reference${references.length === 1 ? "" : "s"}`);
  }
  if (acceptedRiskReferences.length > 0) {
    parts.push(
      `${acceptedRiskReferences.length} accepted risk${
        acceptedRiskReferences.length === 1 ? "" : "s"
      }`,
    );
  }
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

export function DecisionRationaleSummary({ rationale }: { rationale: string | null }) {
  if (!rationale || rationale.trim().length === 0) {
    return <span className={styles.decisionRationaleEmpty}>No rationale recorded</span>;
  }
  return <span className={styles.decisionRationale}>{rationale}</span>;
}
