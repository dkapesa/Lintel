"use client";

import { useEffect, useId, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { projectCommandCatalog, type Command } from "../../lib/r6l/command-catalog";
import { COMMANDS_OVERLAY_ID } from "./WorkstationProvider";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./commands.module.css";

function kindIcon(kind: Command["kind"]): string {
  return kind === "review" ? "◌" : kind === "contextual" ? "↳" : "›";
}

function navigates(command: Command): boolean {
  return command.action.id === "route/navigate" || command.action.id === "review/select" || command.action.id === "mode/activate";
}

export default function CommandsPalette() {
  const { state, snapshot, reviewIndex, leftPresentation, dispatchBound, commands } = useWorkstation();
  const open = state.overlayStack.at(-1) === COMMANDS_OVERLAY_ID;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const queueVisible = state.destination === "reviews" && leftPresentation !== "hidden-focus" && leftPresentation !== "hidden-narrow";
  const sections = useMemo(() => projectCommandCatalog({ state, snapshot, reviewIndex, queueVisible }, query), [query, queueVisible, reviewIndex, snapshot, state]);
  const results = useMemo(() => sections.flatMap((section) => section.commands), [sections]);
  const active = results[activeIndex] ?? null;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(results.length - 1, 0)));
  }, [results.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (surfaceRef.current?.contains(event.target as Node)) return;
      commands.close("outside-pointer");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [commands, open]);

  if (!open || typeof document === "undefined") return null;

  const execute = (command: Command) => {
    const result = dispatchBound(command.action, "commands");
    if (result.status === "unavailable") return;
    const establishesFocusDestination = command.action.id === "focus/set" && command.action.active;
    commands.close(navigates(command) || establishesFocusDestination ? "navigation" : "execution");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      commands.close("escape");
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length);
      return;
    }
    if (event.key === "Enter" && active) {
      event.preventDefault();
      execute(active);
    }
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && surfaceRef.current?.contains(next)) return;
    commands.close("tab");
  };

  return createPortal(
    <div className={styles.layer} aria-label="Commands">
      <div className={styles.surface} ref={surfaceRef}>
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            id="lintel-commands-input"
            className={styles.input}
            type="text"
            role="combobox"
            aria-label="Search commands"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded="true"
            aria-activedescendant={active ? `lintel-command-${active.id}` : undefined}
            aria-describedby={results.length === 0 ? "lintel-commands-empty" : undefined}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            placeholder="Search commands…"
          />
        </div>
        <div id={listboxId} className={styles.results} role="listbox" aria-label="Commands">
          {sections.map((section) => (
            <section className={styles.section} key={section.id} aria-labelledby={`lintel-commands-${section.id}`}>
              <h2 id={`lintel-commands-${section.id}`}>{section.label}</h2>
              {section.commands.map((command) => {
                const index = results.indexOf(command);
                const selected = index === activeIndex;
                return (
                  <button
                    className={`${styles.result}${selected ? ` ${styles.active}` : ""}`}
                    id={`lintel-command-${command.id}`}
                    key={command.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => execute(command)}
                    onMouseMove={() => setActiveIndex(index)}
                  >
                    <span className={styles.resultIcon} aria-hidden="true">{kindIcon(command.kind)}</span>
                    <span className={styles.resultCopy}>
                      <span>{command.label}</span>
                      {command.detail && <small>{command.detail}</small>}
                    </span>
                  </button>
                );
              })}
            </section>
          ))}
          {results.length === 0 && <p className={styles.empty} id="lintel-commands-empty">No matching commands or Reviews.</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
