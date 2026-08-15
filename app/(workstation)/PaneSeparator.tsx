"use client";

import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import {
  isSeparatorResizeKey,
  keyboardResizeCandidate,
  pointerResizeCandidate,
  type ResizablePane,
} from "../../lib/r6m/resize-interaction";
import { REVIEW_QUEUE_REGION_ID } from "./QueueRegion";
import { useWorkstation, type ActivePaneResize } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

const INSPECTOR_REGION_ID = "contextual-inspector";

type PointerSession = Readonly<{
  pointerId: number;
  target: HTMLDivElement;
  resize: ActivePaneResize;
}>;

export default function PaneSeparator({ pane }: { pane: ResizablePane }) {
  const {
    geometry,
    resizeBounds,
    beginPaneResize,
    commitKeyboardPaneWidth,
  } = useWorkstation();
  const sessionRef = useRef<PointerSession | null>(null);
  const current = pane === "queue" ? geometry.queueTrack : geometry.inspectorTrack;
  const bounds = resizeBounds[pane];

  const cancel = () => {
    const session = sessionRef.current;
    if (!session) return;
    sessionRef.current = null;
    session.resize.cancel();
    if (session.target.hasPointerCapture(session.pointerId)) {
      session.target.releasePointerCapture(session.pointerId);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !sessionRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      cancel();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      cancel();
    };
  }, []);

  if (!bounds) return null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || sessionRef.current) return;
    const resize = beginPaneResize(pane, event.clientX);
    if (!resize) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    sessionRef.current = { pointerId: event.pointerId, target: event.currentTarget, resize };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const candidate = pointerResizeCandidate({
      pane,
      startX: session.resize.startX,
      currentX: event.clientX,
      startWidth: session.resize.startWidth,
      bounds: session.resize.bounds,
    });
    session.resize.preview(candidate);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const candidate = pointerResizeCandidate({
      pane,
      startX: session.resize.startX,
      currentX: event.clientX,
      startWidth: session.resize.startWidth,
      bounds: session.resize.bounds,
    });
    sessionRef.current = null;
    session.resize.commit(candidate);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isSeparatorResizeKey(event.key)) return;
    event.preventDefault();
    commitKeyboardPaneWidth(pane, keyboardResizeCandidate({
      key: event.key,
      currentWidth: current,
      shiftKey: event.shiftKey,
      bounds,
    }));
  };

  return (
    <div
      className={`${styles.paneSeparator} ${pane === "queue" ? styles.queueSeparator : styles.inspectorSeparator}`}
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      aria-valuenow={Math.round(current)}
      aria-valuemin={bounds.minimum}
      aria-valuemax={bounds.maximum}
      aria-label={pane === "queue" ? "Resize Review Queue" : "Resize Contextual Inspector"}
      aria-controls={pane === "queue" ? REVIEW_QUEUE_REGION_ID : INSPECTOR_REGION_ID}
      data-pane={pane}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onKeyDown={onKeyDown}
    />
  );
}

export { INSPECTOR_REGION_ID };
