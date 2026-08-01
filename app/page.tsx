import type { Metadata } from "next";
import { PublicR5Page } from "./_public-r5/PublicR5Page";

/* R5D — production homepage transfer.

   Renders the shared, accepted R5 public experience
   (app/_public-r5/PublicR5Page) implemented and proven at the private
   `/visual-lab/public-r5` route in R5C. This route and the private
   laboratory route render the same implementation; they differ only in
   metadata and indexing rules below. See
   docs/r5/R5D_PRODUCTION_HOMEPAGE_TRANSFER.md.

   The prior R3E.1 homepage (five-act landing implementation under
   ./landing/*, ./landing-motion.tsx, ./landing-nav.tsx) is superseded by
   this transfer. Its files are left in place per this milestone's scope
   (no broad legacy deletion); git history is the record of the prior
   implementation. */

const TITLE = "Lintel | Engineering verification for pull requests";
const DESCRIPTION =
  "Lintel connects changes, findings, evidence, missing proof and requirements so engineers can understand readiness and record an accountable Human Decision.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Lintel",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
  // No metadataBase / canonical production origin is configured anywhere in
  // this repository (checked: no next.config canonical setting, no env var,
  // no existing metadataBase export). Per R5D §5, the canonical URL is left
  // deferred rather than fabricated; it should be set here once a real
  // production origin is configured.
};

export default function HomePage() {
  return <PublicR5Page />;
}
