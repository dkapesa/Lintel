import type { Metadata } from "next";
import { R5RecalibratedPrototype } from "../../_public-r5-recalibrated/R5RecalibratedPrototype";

/* R5E.1E — private route for the assembled recalibrated public direction.

   Thin route wrapper around the shared app/_public-r5-recalibrated
   implementation, following the app/visual-lab/public-r5 precedent: private
   and unlinked, noindex/nofollow metadata, no AppShell, not registered in
   app/nav-config.tsx, not imported by any production route, never added to
   a sitemap. See docs/r5/R5E1E_FULL_PRIVATE_PUBLIC_ASSEMBLY.md. */

export const metadata: Metadata = {
  title: "Public R5 recalibrated visual lab — Lintel",
  description:
    "Private visual laboratory: the assembled recalibrated public homepage direction, from selected review through verification record to accountable decision.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PublicR5RecalibratedLabPage() {
  return <R5RecalibratedPrototype />;
}
