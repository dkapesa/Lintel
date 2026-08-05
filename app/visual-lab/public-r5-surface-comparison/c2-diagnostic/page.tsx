import type { Metadata } from "next";
import { SurfaceComparisonVariant } from "../SurfaceComparisonVariant";
import { SURFACE_VARIANTS } from "../variants";

export const metadata: Metadata = {
  title: "C2 diagnostic — private surface laboratory — Lintel",
  robots: { index: false, follow: false },
};

export default function C2SurfaceComparisonPage() {
  return <SurfaceComparisonVariant variant={SURFACE_VARIANTS[3]} />;
}

