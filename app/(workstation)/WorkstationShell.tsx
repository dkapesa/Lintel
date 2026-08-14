"use client";

import type { ReactNode } from "react";
import InspectorHost from "./InspectorHost";
import CommandsPalette from "./CommandsPalette";
import SupportingLeft from "./SupportingLeft";
import { useWorkstationKeyboard } from "./useWorkstationKeyboard";
import WorkspaceHost from "./WorkspaceHost";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export default function WorkstationShell({ children }: { children: ReactNode }) {
  const { state, announcement, leftPresentation, layout, inspectorActive, band, dispatchBound, commands } = useWorkstation();
  useWorkstationKeyboard({ state, band, dispatchBound, commands });
  return (
    <div
      className={styles.workstation}
      data-destination={state.destination}
      data-left-presentation={leftPresentation}
      data-inspector={inspectorActive ? layout.inspectorPresentation : "closed"}
    >
      <a className={styles.skipLink} href="#workspace-primary">Skip to Workspace</a>
      <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">{announcement}</p>
      <SupportingLeft />
      <WorkspaceHost>{children}</WorkspaceHost>
      <InspectorHost />
      <CommandsPalette />
    </div>
  );
}
