import type { ReactElement } from "react";
import WorkspaceV2Client from "./WorkspaceV2Client";
import RealWorkspaceBootstrap from "./RealWorkspaceBootstrap";
import {
  parseScenario,
  resolveWorkspaceSource,
  type WorkspaceSource,
} from "../../lib/workspace-v2/adapter";
import { createFixtureWorkspaceAdapter } from "../../lib/workspace-v2/fixture-adapter";

/* R1B.7 — shared Workspace route entry (the single cut-over boundary).

   The canonical production route (`app/workspace`) and the QA/compatibility
   route (`app/workspace-v2`) are two entry points onto ONE Workspace
   implementation. To avoid a duplicated state tree — no copied client, adapter,
   persistence, decision, projection or component code — both server routes
   delegate their entire body to this function. The only per-route difference is
   the declared default source:

     • /workspace     → defaultSource "real"  (canonical: stored Report history)
     • /workspace-v2  → defaultSource "fixture" (intentional demonstration path)

   Dispatch is identical to the pre-cutover route body, preserving the read-only
   adapter boundaries, the single client state owner, and the truthful
   loading / ready / empty / unavailable states. There is exactly one route-level
   state owner per mounted Workspace, and never two Workspace trees at once.

   `real` mode hands off to the browser-only `RealWorkspaceBootstrap` (the only
   place real storage is read and the writable persistence/decision services are
   built). `fixture` mode loads the deterministic sample snapshot on the server.
   A route that resolves to `real` never falls back to fixture content, and a
   route that resolves to `fixture` never triggers a real read. */

export type WorkspaceRouteSearchParams = {
  scenario?: string | string[];
  source?: string | string[];
  reportId?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function renderWorkspaceRoute(
  params: WorkspaceRouteSearchParams,
  defaultSource: WorkspaceSource,
): Promise<ReactElement> {
  const source = resolveWorkspaceSource(firstParam(params.source), defaultSource);

  if (source === "real") {
    /* Real data lives in the browser; hand off to the client bootstrap. A
       stable `reportId` selects the exact case; its absence selects the most
       recent stored Report; an unknown id resolves to unavailable, never to
       another case and never to fixture content. */
    const reportId = firstParam(params.reportId) ?? null;
    return <RealWorkspaceBootstrap reportId={reportId} />;
  }

  const scenario = parseScenario(firstParam(params.scenario));
  const adapter = createFixtureWorkspaceAdapter();
  const snapshot = await adapter.loadSnapshot({ scenario });

  return <WorkspaceV2Client snapshot={snapshot} />;
}
