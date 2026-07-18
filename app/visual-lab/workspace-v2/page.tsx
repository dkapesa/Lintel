import type { Metadata } from "next";
import WorkspaceV2Client from "./WorkspaceV2Client";

/* R0B.1 — Workspace V2 visual lab route entry.

   Kept as a server component so metadata (including robots noindex) is
   emitted statically. All interactivity lives in the single route-local
   client boundary, WorkspaceV2Client.

   Contained entirely under app/visual-lab/workspace-v2/. Deliberately does
   not render AppShell and is not registered in app/nav-config.tsx, matching
   the app/lvos/typography-proof precedent for an internal, unlinked
   surface. */

export const metadata: Metadata = {
  title: "Workspace V2 visual lab — Lintel",
  description: "Internal R0B.1 visual lab for the Workspace V2 desktop canvas.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function WorkspaceV2LabPage() {
  return <WorkspaceV2Client />;
}
