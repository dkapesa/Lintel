"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./landing-v3.module.css";
import { SCENARIOS, type LabRecord, type LabScenario, type ScenarioId, type Tone } from "./fixtures";

/* R3C — interactive product theatre lab (R3B §7.5, §8).

   A landing-page simulation. It reads only the lab fixture in ./fixtures.ts.
   It makes no network request, reads and writes no storage key, and exposes
   no control that would merge, approve, block, post or record a decision.

   Interaction proved here:
     - scenario switching (radio group, arrow keys, Home/End)
     - stage switching (tab list, arrow keys, Home/End)
     - preceding/following record navigation from the context rail
     - one introductory sequence, once, ~5.5s, stopped permanently by any
       visitor interaction, absent entirely under reduced motion
     - mobile: the spine scrolls horizontally, every stage is tappable, and
       recommendation / open requirements / decision state stay visible. */

const DARK_TONE: Record<Tone, string> = {
  neutral: styles.dNeutral,
  warning: styles.dWarning,
  danger: styles.dDanger,
  success: styles.dSuccess,
  info: styles.dInfo,
  provenance: styles.dProvenance,
};

const STEP_MS = 1100; // 5 stages × 1100ms = 5.5s, within R3B's 5–7s sequence.

function DarkChip({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`${styles.chipDark} ${DARK_TONE[tone]}`}>{children}</span>;
}

function DarkRecord({ record }: { record: LabRecord }) {
  return (
    <article className={styles.dRecord}>
      <div className={styles.dRecordHead}>
        {record.id ? <span className={styles.dRecordId}>{record.id}</span> : null}
        <span className={styles.dRecordKind}>{record.kind}</span>
        {record.state ? <DarkChip tone={record.tone}>{record.state}</DarkChip> : null}
      </div>
      <h4 className={styles.dRecordTitle}>{record.title}</h4>
      {record.detail ? <p className={styles.dRecordDetail}>{record.detail}</p> : null}
      {record.lines ? (
        <div className={styles.dWell}>
          {record.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      ) : null}
      {record.meta ? (
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

export default function LabTheatre() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("missing-tests");
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

  const scenario: LabScenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];
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
    setStageIndex(4);
  }, [clearTimers]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
        for (let step = 1; step < 5; step += 1) {
          timers.current.push(
            window.setTimeout(() => {
              setFront(step + 1);
              setStageIndex(step);
              if (step === 4) sequenceDone.current = true;
            }, STEP_MS * step),
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

  useEffect(() => () => clearTimers(), [clearTimers]);

  const selectStage = (index: number) => {
    stopSequence();
    setStageIndex(index);
  };

  const selectScenario = (id: ScenarioId) => {
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
      End: SCENARIOS.length - 1,
    };
    const next = map[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const bounded = (next + SCENARIOS.length) % SCENARIOS.length;
    selectScenario(SCENARIOS[bounded].id);
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
            <em>·</em>
            <b>{scenario.pullRequest}</b>
            <em>·</em>
            <em>{scenario.branch}</em>
            <em>·</em>
            <em>{scenario.headSha}</em>
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
          {SCENARIOS.map((item, index) => (
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
            id={`lv3-stage-tab-${item.id}`}
            aria-selected={index === stageIndex}
            aria-controls="lv3-stage-panel"
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
        id="lv3-stage-panel"
        role="tabpanel"
        aria-labelledby={`lv3-stage-tab-${stage.id}`}
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
