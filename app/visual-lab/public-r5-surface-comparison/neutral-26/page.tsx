import type { Metadata } from "next";
import { SurfaceComparisonVariant } from "../SurfaceComparisonVariant";
import { SURFACE_VARIANTS } from "../variants";

export const metadata: Metadata = {
  title: "Neutral 26 control — private surface laboratory — Lintel",
  robots: { index: false, follow: false },
};

export default function Neutral26SurfaceComparisonPage() {
  return <SurfaceComparisonVariant variant={SURFACE_VARIANTS[0]} />;
}

