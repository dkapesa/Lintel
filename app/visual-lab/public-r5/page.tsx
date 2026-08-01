import type { Metadata } from "next";
import { PublicR5Page } from "../../_public-r5/PublicR5Page";

/* R5D — private visual laboratory route.

   Thin route wrapper around the shared app/_public-r5/PublicR5Page
   implementation (see docs/r5/R5D_PRODUCTION_HOMEPAGE_TRANSFER.md). This
   route stays private and unlinked, following the existing precedent set by
   app/visual-lab/landing-v3 and app/visual-lab/workspace-r4: noindex,
   nofollow metadata, no AppShell, not registered in app/nav-config.tsx, not
   imported by any production route, and never added to a sitemap. */

export const metadata: Metadata = {
  title: "Public R5 visual lab — Lintel",
  description: "Private R5C visual laboratory for the accepted public homepage direction.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PublicR5LabPage() {
  return <PublicR5Page />;
}
