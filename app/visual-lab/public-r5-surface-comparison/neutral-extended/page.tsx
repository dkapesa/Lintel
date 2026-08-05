import type { Metadata } from "next";
import { SurfaceComparisonVariant } from "../SurfaceComparisonVariant";
import { SURFACE_VARIANTS } from "../variants";

export const metadata: Metadata = {
  title: "Extended neutral — private surface laboratory — Lintel",
  robots: { index: false, follow: false },
};

export default function NeutralExtendedSurfaceComparisonPage() {
  return <SurfaceComparisonVariant variant={SURFACE_VARIANTS[1]} />;
}

