import type { Metadata } from "next";
import type { ReactNode } from "react";

/* R1B.7 — TEMPORARY ROLLBACK ROUTE.  DO NOT ADD FEATURES OR REDESIGN.

   `app/workspace-legacy/**` is the previous (pre-cutover) `/workspace`
   implementation, relocated verbatim from `app/workspace/**` at the R1B.7
   cut-over. It exists solely so the cut-over is reversible: if the canonical
   Workspace must be rolled back during R1C–R1E or early whole-product
   convergence, the previous surface is already running and the rollback is a
   one-line route change (see the R1B.7 final report, "Exact rollback
   procedure"). It shares no state with the canonical route.

   Constraints for this route while it exists:
     • no primary navigation entry and no automatic redirect points here;
     • it reads the SAME production storage keys as the canonical route — no
       migration, no V2 namespace, no schema change;
     • no new features and no visual redesign are added here;
     • it is not canonical and must not be presented as equally canonical.

   This layout only carries route-level documentation and a `noindex` so the
   rollback surface stays out of the search index; it wraps the relocated client
   page unchanged (a client component cannot itself export metadata). Retire the
   whole `app/workspace-legacy/` directory once the canonical Workspace has
   soaked with no regressions. */

export const metadata: Metadata = {
  title: "Workspace (legacy rollback) — Lintel",
  description: "Temporary pre-cutover Workspace, retained only for rollback coverage.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function WorkspaceLegacyLayout({ children }: { children: ReactNode }) {
  return children;
}
