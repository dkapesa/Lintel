import type { CSSProperties, ReactNode } from "react";
import styles from "./landing.module.css";
import type { LandingTone } from "../../lib/landing-theatre-fixtures";

/* R3D — shared public atoms.

   Server-renderable. These are the visual-language primitives recorded in
   R3C §11: the state chip, the provenance mark, the section coordinate, and
   the semantic left edge a record carries. */

export const TONE_CLASS: Record<LandingTone, string> = {
  neutral: styles.toneNeutral,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  success: styles.toneSuccess,
  info: styles.toneInfo,
  provenance: styles.toneProvenance,
};

/** The semantic colour a record carries on its left rule. */
export const EDGE: Record<LandingTone, string> = {
  neutral: "var(--lnd-rule-strong)",
  warning: "var(--lnd-warning)",
  danger: "var(--lnd-danger)",
  success: "var(--lnd-success)",
  info: "var(--lnd-info)",
  provenance: "var(--lnd-provenance)",
};

export const DARK_TONE_CLASS: Record<LandingTone, string> = {
  neutral: styles.dNeutral,
  warning: styles.dWarning,
  danger: styles.dDanger,
  success: styles.dSuccess,
  info: styles.dInfo,
  provenance: styles.dProvenance,
};

export function Chip({ tone = "neutral", children }: { tone?: LandingTone; children: ReactNode }) {
  return <span className={`${styles.chip} ${TONE_CLASS[tone]}`}>{children}</span>;
}

export function DarkChip({ tone = "neutral", children }: { tone?: LandingTone; children: ReactNode }) {
  return <span className={`${styles.chipDark} ${DARK_TONE_CLASS[tone]}`}>{children}</span>;
}

export function Sample({ children = "Sample data" }: { children?: string }) {
  return <span className={styles.sample}>{children}</span>;
}

export function Coordinate({ section, of, note }: { section: string; of: string; note?: string }) {
  return (
    <div className={styles.coordinate}>
      <b>{section}</b>
      <span>{of}</span>
      {note ? <span>{note}</span> : null}
    </div>
  );
}

/** Reveal step ordering for the one-time section entrance. */
export function step(index: number): CSSProperties {
  return { "--lnd-reveal-step": index } as CSSProperties;
}
