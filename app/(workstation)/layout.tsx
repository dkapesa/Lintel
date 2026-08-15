import type { ReactNode } from "react";
import { buildWorkstationFirstPaintScript } from "../../lib/r6d/first-paint";
import { buildR6MFirstPaintGeometryScript } from "../../lib/r6m/first-paint-widths";
import WorkstationProvider from "./WorkstationProvider";
import WorkstationShell from "./WorkstationShell";

export default function WorkstationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: buildWorkstationFirstPaintScript() }} />
      <script dangerouslySetInnerHTML={{ __html: buildR6MFirstPaintGeometryScript() }} />
      <WorkstationProvider>
        <WorkstationShell>{children}</WorkstationShell>
      </WorkstationProvider>
    </>
  );
}
