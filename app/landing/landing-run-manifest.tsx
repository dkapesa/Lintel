"use client";

import { useId, useRef, useState } from "react";
import type { LandingRunManifest } from "../../lib/landing-theatre-fixtures";
import styles from "./landing.module.css";

type ManifestMode = LandingRunManifest["mode"];

const MODES: { id: ManifestMode; label: string }[] = [
  { id: "deterministic", label: "Deterministic analysis" },
  { id: "model", label: "Model-assisted analysis" },
];

function Fingerprint({
  label,
  value,
}: {
  label: string;
  value: LandingRunManifest["inputFingerprint"];
}) {
  return (
    <div className={styles.manifestFingerprint}>
      <dt>{label}</dt>
      <dd title={value.full} aria-label={`${label}: ${value.full}`}>
        {value.short}
      </dd>
    </div>
  );
}

export default function LandingRunManifest({
  manifests,
}: {
  manifests: Record<ManifestMode, LandingRunManifest>;
}) {
  const [mode, setMode] = useState<ManifestMode>("deterministic");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const manifest = manifests[mode];

  function selectByIndex(index: number) {
    const next = (index + MODES.length) % MODES.length;
    setMode(MODES[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className={styles.manifestPlate} aria-labelledby={`${baseId}-title`}>
      <header className={styles.manifestHead}>
        <div>
          <p className={styles.manifestKicker}>Canonical run</p>
          <h3 id={`${baseId}-title`} className={styles.manifestIdentity}>
            {manifest.runId}
          </h3>
        </div>
        <span className={styles.sample}>Sample data</span>
      </header>

      <div className={styles.manifestTabs} role="tablist" aria-label="Canonical run analysis source">
        {MODES.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            id={`${baseId}-${item.id}-tab`}
            className={styles.manifestTab}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            aria-controls={`${baseId}-panel`}
            tabIndex={mode === item.id ? 0 : -1}
            onClick={() => setMode(item.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                selectByIndex(index + 1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                selectByIndex(index - 1);
              } else if (event.key === "Home") {
                event.preventDefault();
                selectByIndex(0);
              } else if (event.key === "End") {
                event.preventDefault();
                selectByIndex(MODES.length - 1);
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        id={`${baseId}-panel`}
        className={styles.manifestPanel}
        role="tabpanel"
        aria-labelledby={`${baseId}-${mode}-tab`}
      >
        <div className={styles.manifestState}>
          <div>
            <span>Analysis source</span>
            <strong>{manifest.analysisSource}</strong>
          </div>
          <div>
            <span>Reproducibility</span>
            <strong data-classification={manifest.reproducibility}>{manifest.reproducibility}</strong>
          </div>
        </div>

        <dl className={styles.manifestFields}>
          <div>
            <dt>Manifest schema</dt>
            <dd>{manifest.schemaVersion}</dd>
          </div>
          <div>
            <dt>Report schema</dt>
            <dd>{manifest.reportSchemaVersion}</dd>
          </div>
          <div>
            <dt>Generator</dt>
            <dd>{manifest.generatorVersion}</dd>
          </div>
          <div>
            <dt>Ruleset</dt>
            <dd>{manifest.deterministicRulesetVersion}</dd>
          </div>
          <div>
            <dt>Review mode</dt>
            <dd>{manifest.reviewMode}</dd>
          </div>
          <div>
            <dt>Source type</dt>
            <dd>{manifest.sourceType}</dd>
          </div>
        </dl>

        <dl className={styles.manifestFingerprints}>
          <Fingerprint label="Input fingerprint" value={manifest.inputFingerprint} />
          <Fingerprint label="Configuration" value={manifest.configurationFingerprint} />
          <Fingerprint label="Result fingerprint" value={manifest.resultFingerprint} />
        </dl>

        <p className={styles.manifestLimitation}>{manifest.limitation}</p>
      </div>
    </section>
  );
}
