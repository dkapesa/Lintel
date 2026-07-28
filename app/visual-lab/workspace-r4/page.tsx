import type { Metadata } from "next";
import WorkspaceR4Lab from "./WorkspaceR4Lab";
import type { FixtureVariant } from "./types";

export const metadata: Metadata = {
  title: "R4C Workspace Reconstruction Lab — Lintel",
  description: "Private controlled visual laboratory for the planned R4 Workspace system.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function WorkspaceR4LabPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const state = typeof params.state === "string" ? params.state : "overview";
  const variant = typeof params.variant === "string" ? (params.variant as FixtureVariant) : undefined;
  const capture = params.capture === "1";
  return <WorkspaceR4Lab initialStateSlug={state} initialVariant={variant} capture={capture} />;
}
