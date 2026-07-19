import type { Metadata } from "next";
import WorkspaceV2Client from "./WorkspaceV2Client";
import RealWorkspaceBootstrap from "./RealWorkspaceBootstrap";
import { parseScenario, parseSource } from "../../lib/workspace-v2/adapter";
import { createFixtureWorkspaceAdapter } from "../../lib/workspace-v2/fixture-adapter";

/* R1B.0/R1B.1 — Production Workspace V2 · server route entry.

   A server component so metadata (including robots noindex) is emitted
   statically. It resolves the source and scaffold scenario from the query
   string and dispatches to the matching adapter path. No interactivity,
   persistence or data mutation lives here.

   Source selection (R1B.1):
     • default / ?source=fixture — the deterministic sample source. Loaded on
       the server via the fixture adapter and passed straight into the client
       boundary, exactly as in R1B.0.
     • ?source=real[&reportId=<stable-id>] — the read-only real Report adapter.
       The production Report source is browser-only, so the real snapshot is
       built in a narrow client bootstrap (`RealWorkspaceBootstrap`) that reads
       `localStorage` and runs the adapter; the server cannot read it.

   An invalid `source` falls back safely to the fixture path; it never triggers
   a real read. A failed real load renders a truthful empty / unavailable state
   inside the bootstrap and never falls back to fixture content.

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

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WorkspaceV2Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string | string[]; source?: string | string[]; reportId?: string | string[] }>;
}) {
  const params = await searchParams;
  const source = parseSource(firstParam(params.source));

  if (source === "real") {
    /* Real data lives in the browser; hand off to the client bootstrap. */
    const reportId = firstParam(params.reportId) ?? null;
    return <RealWorkspaceBootstrap reportId={reportId} />;
  }

  const scenario = parseScenario(firstParam(params.scenario));
  const adapter = createFixtureWorkspaceAdapter();
  const snapshot = await adapter.loadSnapshot({ scenario });

  return <WorkspaceV2Client snapshot={snapshot} />;
}
