import type { ReactNode } from "react";
import { buildWorkstationFirstPaintScript } from "../../lib/r6d/first-paint";
import WorkstationProvider from "./WorkstationProvider";
import WorkstationShell from "./WorkstationShell";

export default function WorkstationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: buildWorkstationFirstPaintScript() }} />
      <WorkstationProvider>
        <WorkstationShell>{children}</WorkstationShell>
      </WorkstationProvider>
    </>
  );
}
