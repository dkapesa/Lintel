import type { Metadata } from "next";
import { renderWorkspaceRoute, type WorkspaceRouteSearchParams } from "./WorkspaceRouteEntry";

/* R1B.7 — QA / compatibility Workspace route.

   After the cut-over the canonical production Workspace is `/workspace`. This
   route is retained deliberately for QA and compatibility: it renders the SAME
   production Workspace implementation via the shared `renderWorkspaceRoute`
   entry (no duplicated client, adapter, persistence, decision or projection
   code), and only differs by keeping the historical demonstration default —
   `source` absent resolves to `fixture` here, whereas on canonical `/workspace`
   it resolves to real stored history.

   `?source=real[&reportId=<stable-id>]` still exercises the real path here for
   compatibility checks. The route stays out of primary navigation and out of
   the search index. It is not a second, competing Workspace: it mounts one
   Workspace tree through the one shared entry, exactly like `/workspace`. */

export const metadata: Metadata = {
  title: "Workspace V2 (QA) — Lintel",
  description: "QA/compatibility view of the production Workspace (fixture default).",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function WorkspaceV2Page({
  searchParams,
}: {
  searchParams: Promise<WorkspaceRouteSearchParams>;
}) {
  const params = await searchParams;
  return renderWorkspaceRoute(params, "fixture");
}
