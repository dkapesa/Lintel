/* R1B.0 — Production Workspace V2 · presentation helpers.

   Pure mapping from semantic view-model values to CSS-module class names, plus
   a small roving-keyboard utility shared by the Queue and Evidence Spine. No
   state, no side effects beyond moving DOM focus in response to arrow keys. */

import type { KeyboardEvent } from "react";
import styles from "../workspace-v2.module.css";
import {
  type DecisionDivergence,
  type DecisionOutcome,
  type Recommendation,
  type ToneKey,
} from "../../../lib/workspace-v2/view-model";

export function toneClass(tone: ToneKey): string {
  switch (tone) {
    case "success":
      return styles.toneSuccess;
    case "warning":
      return styles.toneWarning;
    case "danger":
      return styles.toneDanger;
    case "information":
      return styles.toneInformation;
    case "provenance":
      return styles.toneProvenance;
    case "muted":
      return styles.toneMuted;
  }
}

export function recommendationTone(value: Recommendation): string {
  if (value === "APPROVE") return styles.toneSuccess;
  if (value === "BLOCK") return styles.toneDanger;
  if (value === "TESTS_REQUIRED") return styles.toneWarning;
  return styles.toneInformation;
}

export function riskTone(value: string): string {
  if (value === "LOW") return styles.toneSuccess;
  if (value === "MEDIUM") return styles.toneWarning;
  return styles.toneDanger;
}

export function severityRankClass(value: string): string {
  if (value === "CRITICAL") return styles.sevCritical;
  if (value === "HIGH") return styles.sevHigh;
  if (value === "MEDIUM") return styles.sevMedium;
  return styles.sevLow;
}

export function severityTone(value: string): string {
  if (value === "LOW") return styles.toneMuted;
  if (value === "MEDIUM") return styles.toneWarning;
  return styles.toneDanger;
}

export function evidenceStatusTone(value: string): string {
  if (value === "confirmed" || value === "present") return styles.toneSuccess;
  if (value === "missing") return styles.toneDanger;
  if (value === "stale" || value === "unverified") return styles.toneWarning;
  return styles.toneMuted;
}

export function requirementStatusTone(value: string): string {
  if (value === "satisfied") return styles.toneSuccess;
  if (value === "accepted") return styles.toneInformation;
  if (value === "stale") return styles.toneWarning;
  if (value === "invalidated") return styles.toneDanger;
  return styles.toneMuted;
}

export function outcomeTone(outcome: DecisionOutcome): ToneKey {
  switch (outcome) {
    case "approve":
      return "success";
    case "approve-with-accepted-risk":
      return "warning";
    case "tests-required":
      return "warning";
    case "review-required":
      return "information";
    case "request-changes":
      return "information";
    case "blocked":
      return "danger";
    case "defer":
      return "muted";
  }
}

export function divergenceTone(divergence: DecisionDivergence): ToneKey {
  switch (divergence) {
    case "aligned":
      return "success";
    case "human-more-conservative":
      return "information";
    case "human-accepted-additional-risk":
      return "warning";
    case "materially-different":
      return "warning";
  }
}

const ROVING_KEYS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"];

/* Roving-focus navigation across the `[data-roving="true"]` controls inside a
   container. Focus moves; activation stays on Enter/Space (native button).
   The container keeps exactly one control tabbable (tabIndex 0) so the widget
   is a single tab stop. */
export function rovingKeyDown(event: KeyboardEvent<HTMLElement>, container: HTMLElement | null): void {
  if (!container || !ROVING_KEYS.includes(event.key)) return;
  const items = Array.from(
    container.querySelectorAll<HTMLElement>('[data-roving="true"]'),
  );
  if (items.length === 0) return;

  const currentIndex = items.findIndex((element) => element === document.activeElement);
  let nextIndex = currentIndex;

  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = items.length - 1;
  }

  const next = items[nextIndex];
  if (next && nextIndex !== currentIndex) {
    event.preventDefault();
    next.focus();
  }
}
