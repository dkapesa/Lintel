"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./landing.module.css";
import { DARK_TONE_CLASS } from "./landing-primitives";
import type { LandingRecord, LandingScenario, LandingTone } from "../../lib/landing-theatre-fixtures";

/* R3D — interactive product theatre.

   A landing-page simulation. It receives only the compact serialisable shape
   produced at build time by lib/landing-theatre-fixtures. It makes no network
   request, reads and writes no storage key, touches no report history,
   decision ledger or review state, and exposes no control that would merge,
   approve, block or record a decision.

   Interaction proved here:
     - scenario switching (radio group, arrow keys, Home/End)
     - stage switching (tab list, arrow keys, Home/End)
     - preceding/following record navigation from the context rail
     - one introductory sequence, once, ~5.5s, stopped permanently by any
       visitor interaction, absent entirely under reduced motion
     - mobile: the spine scrolls horizontally, every stage is tappable, and
       recommendation / open requirements / decision state stay visible. */

const STEP_MS = 1100; // 5 stages × 1100ms = 5.5s, within the R3B 5–7s window.

function DarkChip({ tone = "neutral", children }: { tone?: LandingTone; children: React.ReactNode }) {
  return <span className={`${styles.chipDark} ${DARK_TONE_CLASS[tone]}`}>{children}</span>;
}

function DarkRecord({ record }: { record: LandingRecord }) {
  return (
    <article className={styles.dRecord}>
      <div className={styles.dRecordHead}>
        {record.id ? <span className={styles.dRecordId}>{record.id}</span> : null}
        <span className={styles.dRecordKind}>{record.kind}</span>
        {record.state ? <DarkChip tone={record.tone}>{record.state}</DarkChip> : null}
      </div>
      <h4 className={styles.dRecordTitle}>{record.title}</h4>
      {record.detail ? <p className={styles.dRecordDetail}>{record.detail}</p> : null}
      {record.lines?.length ? (
        <div className={styles.dWell}>
          {record.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      ) : null}
      {record.meta?.length ? (
        <dl className={styles.dMeta}>
          {record.meta.map((entry) => (
            <div key={entry.label}>
              <dt>{entry.label}</dt>
              <dd>{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

export default function LandingTheatre({ scenarios }: { scenarios: LandingScenario[] }) {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [stageIndex, setStageIndex] = useState(0);
  /* `front` is how far the introductory sequence has walked the chain. It
     starts complete so the server-rendered and pre-hydration states are the
     full record; the sequence only ever lowers it deliberately. */
  const [front, setFront] = useState(5);
  const sequenceDone = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const spineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scenarioRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const stages = scenario.stages;
  const stage = stages[Math.min(stageIndex, stages.length - 1)];

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  /* Any visitor interaction stops the sequence permanently and jumps to the
     complete final state. It never leaves a partial state behind. */
  const stopSequence = useCallback(() => {
    if (sequenceDone.current) return;
    sequenceDone.current = true;
    clearTimers();
    setFront(5);
    setStageIndex(stages.length - 1);
  }, [clearTimers, stages.length]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sequenceDone.current = true;
      return;
    }
    if (!("IntersectionObserver" in window)) {
      sequenceDone.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (sequenceDone.current) return;

        setFront(1);
        setStageIndex(0);
        for (let stepIndex = 1; stepIndex < 5; stepIndex += 1) {
          timers.current.push(
            window.setTimeout(() => {
              setFront(stepIndex + 1);
              setStageIndex(stepIndex);
              if (stepIndex === 4) sequenceDone.current = true;
            }, STEP_MS * stepIndex),
          );
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(panel);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [clearTimers]);

  // Timers never survive unmount.
  useEffect(() => () => clearTimers(), [clearTimers]);

  const selectStage = (index: number) => {
    stopSequence();
    setStageIndex(index);
  };

  const selectScenario = (id: string) => {
    stopSequence();
    setScenarioId(id);
    setStageIndex(0);
  };

  const onSpineKeyDown = (event: React.KeyboardEvent, index: number) => {
    const map: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: stages.length - 1,
    };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const bounded = Math.max(0, Math.min(stages.length - 1, next));
    selectStage(bounded);
    spineRefs.current[bounded]?.focus();
  };

  const onScenarioKeyDown = (event: React.KeyboardEvent, index: number) => {
    const map: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: scenarios.length - 1,
    };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const bounded = (next + scenarios.length) % scenarios.length;
    selectScenario(scenarios[bounded].id);
    scenarioRefs.current[bounded]?.focus();
  };

  const previous = stageIndex > 0 ? stages[stageIndex - 1] : null;
  const following = stageIndex < stages.length - 1 ? stages[stageIndex + 1] : null;

  return (
    <div
      className={styles.panel}
      ref={panelRef}
      onPointerDown={stopSequence}
      onFocusCapture={stopSequence}
      onKeyDownCapture={stopSequence}
    >
      <div className={styles.panelHead}>
        <div className={styles.panelIdentity}>
          <div className={styles.panelRepo}>
            <b>{scenario.repository}</b>
            {scenario.pullRequest ? (
              <>
                <em>·</em>
                <b>{scenario.pullRequest}</b>
              </>
            ) : null}
            <em>·</em>
            <em>{scenario.branch}</em>
            <em>·</em>
            <em>run {scenario.runId}</em>
          </div>
          <p className={styles.panelTitle}>{scenario.title}</p>
        </div>
        <div className={styles.panelVerdict}>
          <div className={styles.verdictBlock}>
            <span className={styles.verdictLabel}>Lintel recommends</span>
            <DarkChip tone={scenario.recommendationTone}>{scenario.recommendation}</DarkChip>
          </div>
          <div className={styles.verdictBlock}>
            <span className={styles.verdictLabel}>Risk</span>
            <span className={styles.verdictValue}>
              {scenario.riskScore}/100 {scenario.riskBand}
            </span>
          </div>
          <div className={styles.verdictBlock}>
            <span className={styles.verdictLabel}>Human Decision</span>
            <DarkChip tone="neutral">PENDING</DarkChip>
          </div>
        </div>
      </div>

      <div className={styles.scenarioBar}>
        <div className={styles.scenarioGroup} role="radiogroup" aria-label="Scenario">
          {scenarios.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                scenarioRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={item.id === scenarioId}
              tabIndex={item.id === scenarioId ? 0 : -1}
              className={`${styles.scenarioBtn} ${item.id === scenarioId ? styles.scenarioBtnOn : ""}`}
              onClick={() => selectScenario(item.id)}
              onKeyDown={(event) => onScenarioKeyDown(event, index)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className={styles.scenarioNote}>{scenario.summary}</p>
      </div>

      <div className={styles.spine} role="tablist" aria-label="Verification stage">
        {stages.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              spineRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`lnd-stage-tab-${item.id}`}
            aria-selected={index === stageIndex}
            aria-controls="lnd-stage-panel"
            tabIndex={index === stageIndex ? 0 : -1}
            className={[
              styles.spineBtn,
              index === stageIndex ? styles.spineOn : "",
              index < stageIndex ? styles.spineDone : "",
              index >= front ? styles.spineIdle : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => selectStage(index)}
            onKeyDown={(event) => onSpineKeyDown(event, index)}
          >
            <span className={styles.spineIndex}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.spineName}>{item.label}</span>
          </button>
        ))}
      </div>

      <div
        className={styles.stageBody}
        id="lnd-stage-panel"
        role="tabpanel"
        aria-labelledby={`lnd-stage-tab-${stage.id}`}
        tabIndex={-1}
      >
        <div className={styles.stageMain}>
          <div key={`${scenario.id}-${stage.id}`} className={styles.stagePane}>
            <p className={styles.stageCaption}>{stage.caption}</p>
            <div className={styles.stageRecords}>
              {stage.records.map((record, index) => (
                <DarkRecord key={`${record.id ?? record.kind}-${index}`} record={record} />
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.stageAside} aria-label="Chain context">
          <div className={styles.asideBlock}>
            <span className={styles.asideLabel}>Comes from</span>
            {previous ? (
              <button type="button" className={styles.asideLink} onClick={() => selectStage(stageIndex - 1)}>
                <b>{previous.label}</b>
                <span>{previous.caption}</span>
              </button>
            ) : (
              <p className={styles.asideNone}>The chain starts here — this is the change itself.</p>
            )}
          </div>

          <div className={styles.asideBlock}>
            <span className={styles.asideLabel}>Leads to</span>
            {following ? (
              <button type="button" className={styles.asideLink} onClick={() => selectStage(stageIndex + 1)}>
                <b>{following.label}</b>
                <span>{following.caption}</span>
              </button>
            ) : (
              <p className={styles.asideNone}>
                The chain ends with a person. Lintel offers no control that records a decision.
              </p>
            )}
          </div>

          <div className={styles.asideCounts}>
            <div className={styles.asideCount}>
              <span>Open requirements</span>
              <b>{scenario.openRequirements}</b>
            </div>
            <div className={styles.asideCount}>
              <span>Blocking</span>
              <b>{scenario.blockingRequirements}</b>
            </div>
            <div className={styles.asideCount}>
              <span>Missing proof</span>
              <b>{scenario.missingProof}</b>
            </div>
            <div className={styles.asideCount}>
              <span>Decision</span>
              <b>PENDING</b>
            </div>
          </div>
        </aside>
      </div>

      <div className={styles.panelFoot}>
        <span className={`${styles.sample} ${styles.sampleDark}`}>Sample data</span>
        <span>A landing demonstration. It does not read or write real review history.</span>
      </div>
    </div>
  );
}
