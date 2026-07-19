import type { Metadata } from "next";
import WorkspaceV2Client from "./WorkspaceV2Client";
import { parseScenario } from "../../lib/workspace-v2/adapter";
import { createFixtureWorkspaceAdapter } from "../../lib/workspace-v2/fixture-adapter";

/* R1B.0 — Production Workspace V2 · server route entry.

   A server component so metadata (including robots noindex) is emitted
   statically. It resolves the scaffold scenario from the query string, asks
   the adapter for a serialisable Workspace snapshot, and passes it into the
   single route-local client boundary. No interactivity, persistence or data
   mutation lives here.

   R1B.0 is fixture-fed: the adapter is the fixture adapter. R1B.1 swaps in a
   real adapter behind the same contract without changing this route's shape.

   Kept as a parallel route: /workspace and /report are untouched, this route
   is deliberately not registered in navigation, and the whole surface is
   reversible by deleting app/workspace-v2/** and lib/workspace-v2/**. */

export const metadata: Metadata = {
  title: "Workspace V2 — Lintel",
  description: "Production Workspace V2 scaffold (R1B.0, fixture-fed).",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function WorkspaceV2Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawScenario = Array.isArray(params.scenario) ? params.scenario[0] : params.scenario;
  const scenario = parseScenario(rawScenario);

  const adapter = createFixtureWorkspaceAdapter();
  const snapshot = await adapter.loadSnapshot({ scenario });

  return <WorkspaceV2Client snapshot={snapshot} />;
}
