"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Glyph } from "../icons";
import type { ReviewFixture, WorkspaceMode } from "../types";
import styles from "../workspace-r4.module.css";

export function CommandPalette({
  open,
  reviews,
  onClose,
  onReview,
  onMode,
  onQueue,
  onInspector,
  onFocus,
  onReadiness,
  returnFocusRef,
}: {
  open: boolean;
  reviews: ReviewFixture[];
  onClose: () => void;
  onReview: (id: string) => void;
  onMode: (mode: WorkspaceMode) => void;
  onQueue: () => void;
  onInspector: () => void;
  onFocus: () => void;
  onReadiness: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const filtered = useMemo(() => reviews.filter((review) => `${review.repository} ${review.pr} ${review.title}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [query, reviews]);

  useEffect(() => {
    if (!open) return;
    const returnTarget = returnFocusRef.current;
    inputRef.current?.focus();
    return () => { if (returnTarget && document.contains(returnTarget)) returnTarget.focus(); };
  }, [open, returnFocusRef]);

  if (!open) return null;
  const run = (action: () => void) => { action(); onClose(); };

  return (
    <div className={styles.paletteLayer} onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled])') ?? []);
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
      <button type="button" className={styles.dialogScrim} tabIndex={-1} aria-label="Close command palette" onClick={onClose} />
      <div ref={panelRef} className={styles.commandPalette} role="dialog" aria-modal="true" aria-label="Workspace commands">
        <label><Glyph name="search" size={18} /><span className={styles.srOnly}>Search commands and reviews</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search commands or reviews" /></label>
        <section><span className={styles.eyebrow}>Workspace modes</span><div>{(["overview", "change", "evidence", "requirements", "history"] as WorkspaceMode[]).map((mode) => <button type="button" key={mode} onClick={() => run(() => onMode(mode))}><span>{mode[0].toUpperCase() + mode.slice(1)}</span><kbd>{mode === "evidence" ? "E" : mode === "requirements" ? "R" : mode === "history" ? "H" : ""}</kbd></button>)}</div></section>
        <section><span className={styles.eyebrow}>Layout and readiness</span><div><button type="button" onClick={() => run(onQueue)}>Toggle review queue <kbd>[</kbd></button><button type="button" onClick={() => run(onInspector)}>Toggle Inspector <kbd>]</kbd></button><button type="button" onClick={() => run(onFocus)}>Toggle focus mode</button><button type="button" onClick={() => run(onReadiness)}>Open decision readiness <kbd>D</kbd></button></div></section>
        {query ? <section><span className={styles.eyebrow}>Loaded reviews</span><div>{filtered.map((review) => <button type="button" key={review.id} onClick={() => run(() => onReview(review.id))}><span>{review.repository} · PR #{review.pr}<small>{review.title}</small></span></button>)}</div></section> : null}
        <footer><span>Mutation commands are intentionally absent.</span><kbd>Esc</kbd></footer>
      </div>
    </div>
  );
}
