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

/* Both the Queue and the Evidence Spine are single-axis vertical widgets, so
   only the vertical arrows rove. Left/Right are intentionally ignored so the
   horizontal arrows stay free for the browser (caret, horizontal scroll) and
   never compete with the vertical sequence. */
const VERTICAL_ROVING_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

/* Roving-focus navigation across the `[data-roving="true"]` controls inside a
   container. Focus moves; activation stays on Enter/Space (native button), so
   arrowing never activates a case or a stage. The container keeps exactly one
   control tabbable (tabIndex 0) so the whole widget is a single tab stop.

   Group boundaries: the items are collected in DOM order across every group in
   the container, so Arrow Up/Down traverse one continuous logical sequence and
   DO cross group boundaries. This is deliberate and consistent for both the
   Queue and the Spine.

   Ends: arrows clamp at the first and last item (no wrap-around), which is the
   predictable behaviour for a linear list; Home/End jump to the absolute
   first/last selectable control. */
export function rovingKeyDown(event: KeyboardEvent<HTMLElement>, container: HTMLElement | null): void {
  if (!container || !VERTICAL_ROVING_KEYS.includes(event.key)) return;
  const items = Array.from(
    container.querySelectorAll<HTMLElement>('[data-roving="true"]'),
  ).filter((element) => element.getAttribute("aria-disabled") !== "true");
  if (items.length === 0) return;

  const currentIndex = items.findIndex((element) => element === document.activeElement);
  let nextIndex = currentIndex;

  if (event.key === "ArrowDown") {
    /* Clamp at the last item; from "no roving item focused" enter at the top. */
    nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, items.length - 1);
  } else if (event.key === "ArrowUp") {
    nextIndex = currentIndex < 0 ? items.length - 1 : Math.max(currentIndex - 1, 0);
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
