"use client";

import type { ReactNode } from "react";
import InspectorHost from "./InspectorHost";
import SupportingLeft from "./SupportingLeft";
import WorkspaceHost from "./WorkspaceHost";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export default function WorkstationShell({ children }: { children: ReactNode }) {
  const { state, announcement, leftPresentation, layout, inspectorActive } = useWorkstation();
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
    </div>
  );
}
