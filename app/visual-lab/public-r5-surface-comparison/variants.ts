export const SURFACE_VARIANTS = [
  {
    id: "neutral-26",
    name: "Neutral 26",
    status: "ACCEPTED PHASE 7 CONTROL",
    summary: "The accepted Phase 7 neutral plate with its existing responsive inset.",
    surfaceClass: "control",
  },
  {
    id: "neutral-extended",
    name: "Extended neutral",
    status: "LEADING GATE 1 DIRECTION — DIMENSIONS NOT FROZEN",
    summary:
      "The accepted neutral plate colour presented with the Phase 7.1A extended laboratory band.",
    surfaceClass: "extendedNeutral",
  },
  {
    id: "b2-diagnostic",
    name: "B2 diagnostic",
    status: "EXPERIMENTAL — PRIVATE — NON-SHIPPABLE",
    summary:
      "The retained B2 wide master, shown only as a private hue and atmosphere diagnostic.",
    surfaceClass: "b2Diagnostic",
  },
  {
    id: "c2-diagnostic",
    name: "C2 diagnostic",
    status: "CONDITIONAL DIAGNOSTIC — NOT SELECTED",
    summary:
      "The retained C2 wide master, shown conditionally and without selection or production approval.",
    surfaceClass: "c2Diagnostic",
  },
] as const;

export type SurfaceVariant = (typeof SURFACE_VARIANTS)[number];
export type SurfaceVariantId = SurfaceVariant["id"];

export const SURFACE_COMPARISON_BASE = "/visual-lab/public-r5-surface-comparison";

export function surfaceVariantHref(id: SurfaceVariantId) {
  return `${SURFACE_COMPARISON_BASE}/${id}`;
}

