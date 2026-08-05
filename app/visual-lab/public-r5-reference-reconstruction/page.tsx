import type { Metadata } from "next";
import { R5ReferenceReconstruction } from "../../_public-r5-reference-reconstruction/R5ReferenceReconstruction";

/* R5E.1E.2A — private route for the reference-led public reconstruction.

   Thin wrapper around the shared app/_public-r5-reference-reconstruction
   implementation, following the app/visual-lab/public-r5 and
   app/visual-lab/public-r5-recalibrated precedent: private and unlinked,
   noindex/nofollow, no AppShell, not registered in app/nav-config.tsx, not
   imported by any production route, never added to a sitemap.

   /visual-lab/public-r5-recalibrated is untouched and remains available for
   direct comparison. See docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md and
   docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md.

   First composition gate: the page ends after Missing Proof and Requirement.
   No analytics, no external write, no model call, no persistence. */

export const metadata: Metadata = {
  title: "Public R5 reference reconstruction — Lintel",
  description:
    "Private visual laboratory: reference-led public reconstruction in normal document flow. First composition gate — navigation, hero, hero product scene, Finding and Evidence, Missing Proof and Requirement.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PublicR5ReferenceReconstructionLabPage() {
  return <R5ReferenceReconstruction heroPresentation="extended-neutral" />;
}
