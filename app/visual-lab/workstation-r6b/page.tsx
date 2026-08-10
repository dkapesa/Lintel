import type { Metadata } from "next";
import { buildFixtureSnapshot } from "../../../lib/workspace-v2/fixture-adapter";
import R6BLabClient from "./R6BLabClient";

export const metadata: Metadata = {
  title: "R6B workstation laboratory — Lintel",
  description: "Private R6B visual and interaction laboratory. Not production authority.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

type LabPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function R6BWorkstationLabPage({ searchParams }: LabPageProps) {
  const params = await searchParams;
  const snapshot = buildFixtureSnapshot("default");
  if (snapshot.status !== "ready") return null;

  return (
    <R6BLabClient
      snapshot={snapshot}
      initialState={first(params.state)}
      initialCandidate={first(params.candidate)}
      initialQ1={first(params.q1)}
      initialQ2={first(params.q2)}
      initialQ3={first(params.q3)}
      initialViewport={first(params.viewport)}
      capture={first(params.capture) === "1"}
    />
  );
}
