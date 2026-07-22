import type { Metadata } from "next";
import {
  renderWorkspaceRoute,
  type WorkspaceRouteSearchParams,
} from "../workspace-v2/WorkspaceRouteEntry";

/* R1B.7 — CANONICAL production Workspace route.

   This is the primary engineering workstation and the single Workspace shown in
   navigation. It renders the production Workspace implementation through the
   shared `renderWorkspaceRoute` entry — the same client, adapters, persistence,
   decision services and projections used by the QA/compatibility `/workspace-v2`
   route. There is no duplicated Workspace tree; the routes differ only in their
   default source.

   Canonical default behaviour:
     • /workspace                       → real stored Report history (never
                                          fixture): truthful loading, then ready
                                          / empty / unavailable.
     • /workspace?reportId=<stable-id>  → the full real Queue with the requested
                                          case selected; an unknown id renders
                                          unavailable and never silently selects
                                          another case.
     • /workspace?source=fixture        → the explicit, intentional sample path.
     • any unsupported ?source value    → resolves to the real default (the
                                          smallest truthful handling); it never
                                          silently shows fixture data.

   The previous `/workspace` implementation now lives at `/workspace-legacy` as a
   temporary, non-primary rollback route. All existing production storage keys
   and stable `reportId` conventions are reused unchanged. */

export const metadata: Metadata = {
  title: "Workspace — Lintel",
  description:
    "The primary engineering workstation: real stored Report history, evidence, conditions and recorded human decisions.",
};

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<WorkspaceRouteSearchParams>;
}) {
  const params = await searchParams;
  return renderWorkspaceRoute(params, "real");
}
