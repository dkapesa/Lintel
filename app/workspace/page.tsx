import type { Metadata } from "next";
import WorkspaceR4Client from "./WorkspaceR4Client";
import RealWorkspaceR4Bootstrap from "./RealWorkspaceR4Bootstrap";
import {
  parseScenario,
  resolveWorkspaceSource,
} from "../../lib/workspace-v2/adapter";
import { createFixtureWorkspaceAdapter } from "../../lib/workspace-v2/fixture-adapter";

export const metadata: Metadata = {
  title: "Workspace — Lintel",
  description:
    "The Lintel engineering verification workstation for real stored reviews, evidence, requirements and accountable Human Decisions.",
};

type SearchParams = {
  scenario?: string | string[];
  source?: string | string[];
  reportId?: string | string[];
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/* R4D canonical route. Real validated browser-local history remains the
   default. The pre-existing fixture source is retained only as an explicit,
   labelled QA/sample path; it never becomes a real-data fallback. */
export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const source = resolveWorkspaceSource(first(params.source), "real");
  if (source === "real") {
    return <RealWorkspaceR4Bootstrap reportId={first(params.reportId) ?? null} />;
  }

  const adapter = createFixtureWorkspaceAdapter();
  const snapshot = await adapter.loadSnapshot({ scenario: parseScenario(first(params.scenario)) });
  return <WorkspaceR4Client snapshot={snapshot} />;
}
