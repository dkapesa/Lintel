"use client";

import { useEffect } from "react";
import type { InvocationSource, LayoutBand, WorkstationState } from "../../lib/r6c/index";
import type { R6LBoundAction } from "../../lib/r6l/action-registry";
import { COMMANDS_OVERLAY_ID, HUMAN_DECISION_OVERLAY_ID, type CommandsController } from "./WorkstationProvider";

type KeyboardInput = Readonly<{
  state: WorkstationState;
  band: LayoutBand;
  dispatchBound: (action: R6LBoundAction, source: InvocationSource) => { status: string };
  commands: CommandsController;
}>;

/** The sole global workstation shortcut owner. Local overlays stop Escape first. */
export function useWorkstationKeyboard({ state, band, dispatchBound, commands }: KeyboardInput): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "k") {
        if (state.overlayStack.at(-1) === HUMAN_DECISION_OVERLAY_ID) return;
        event.preventDefault();
        commands.open();
        return;
      }
      if (event.key !== "Escape" || event.defaultPrevented || state.overlayStack.length > 0) return;
      const closingInspector = state.inspector.open;
      const result = dispatchBound({ id: "escape/unwind" }, "keyboard");
      if (closingInspector && result.status === "applied" && band === "narrow") {
        dispatchBound({ id: "queue/show-narrow-surface", surface: "workspace" }, "system");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [band, commands, dispatchBound, state]);
}
