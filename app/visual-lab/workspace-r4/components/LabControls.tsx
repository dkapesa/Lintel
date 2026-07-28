"use client";

import { useMemo, useState } from "react";
import { LAB_STATES } from "../fixtures";
import { Glyph } from "../icons";
import type { FixtureVariant, LabStateDefinition } from "../types";
import styles from "../workspace-r4.module.css";

const VARIANTS: { value: FixtureVariant; label: string }[] = [
  { value: "canonical", label: "Canonical default" },
  { value: "partial", label: "Partial projection" },
  { value: "empty", label: "Empty Workspace" },
  { value: "unavailable", label: "Unavailable review" },
  { value: "initial", label: "Initial run" },
  { value: "invalid-history", label: "Invalid history" },
  { value: "stale-decision", label: "Stale decision" },
  { value: "unbound-decision", label: "Unbound decision" },
  { value: "reopened-requirement", label: "Reopened requirement" },
  { value: "advisory-requirement", label: "Advisory requirement" },
  { value: "cleared-requirement", label: "Cleared requirement" },
  { value: "stale-requirement", label: "Stale requirement" },
  { value: "unavailable-requirement", label: "Unavailable requirement" },
  { value: "stress", label: "Stress catalogue" },
  { value: "github-connected", label: "GitHub App · Connected" },
  { value: "github-unavailable", label: "GitHub App · Unavailable" },
];

export function LabControls({
  current,
  variant,
  onState,
  onVariant,
  onReset,
}: {
  current: LabStateDefinition;
  variant: FixtureVariant;
  onState: (slug: string) => void;
  onVariant: (variant: FixtureVariant) => void;
  onReset: () => void;
}) {
  const [copyState, setCopyState] = useState("Copy link");
  const groups = useMemo(() => {
    const map = new Map<string, LabStateDefinition[]>();
    for (const item of LAB_STATES) {
      const values = map.get(item.category) ?? [];
      values.push(item);
      map.set(item.category, values);
    }
    return [...map.entries()];
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState("Copy link"), 1200);
    } catch {
      setCopyState("Copy unavailable");
    }
  }

  return (
    <details className={styles.labControls}>
      <summary>
        <span>Laboratory controls</span>
        <span className={styles.labStateSlug}>{current.slug}</span>
      </summary>
      <div className={styles.labControlsBody}>
        <label className={styles.labField}>
          <span>Controlled state</span>
          <select value={current.slug} onChange={(event) => onState(event.target.value)}>
            {groups.map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className={styles.labField}>
          <span>Fixture variant</span>
          <select value={variant} onChange={(event) => onVariant(event.target.value as FixtureVariant)}>
            {VARIANTS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <dl className={styles.labGuidance}>
          <div><dt>Viewport</dt><dd>Wide ≥1440 · Normal 1280 · Narrow 960 · Tablet 640 · Mobile &lt;640</dd></div>
          <div><dt>State slug</dt><dd><code>{current.slug}</code></dd></div>
        </dl>
        <div className={styles.labActions}>
          <button type="button" onClick={copyLink}><Glyph name="copy" size={14} />{copyState}</button>
          <button type="button" onClick={onReset}><Glyph name="reset" size={14} />Reset laboratory</button>
        </div>
      </div>
    </details>
  );
}
