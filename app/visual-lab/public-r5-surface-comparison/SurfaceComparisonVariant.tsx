import { R5ReferenceReconstruction } from "../../_public-r5-reference-reconstruction/R5ReferenceReconstruction";
import { LabStatusStrip } from "./LabStatusStrip";
import styles from "./surface-comparison.module.css";
import type { SurfaceVariant } from "./variants";

const surfaceClassNames = {
  control: styles.control,
  extendedNeutral: `${styles.extendedSurface} ${styles.extendedNeutral}`,
  b2Diagnostic: `${styles.extendedSurface} ${styles.b2Diagnostic}`,
  c2Diagnostic: `${styles.extendedSurface} ${styles.c2Diagnostic}`,
} satisfies Record<SurfaceVariant["surfaceClass"], string>;

/* Private Phase 7.1C wrapper only. The accepted reconstruction is imported as
   one unchanged component. The wrapper changes only the Hero scene's outer
   presentation paint; its product frame, content, interaction and the rest of
   the accepted page remain owned by the accepted implementation. */
export function SurfaceComparisonVariant({ variant }: { variant: SurfaceVariant }) {
  return (
    <div
      className={`${styles.variantShell} ${surfaceClassNames[variant.surfaceClass]}`}
      data-surface-variant={variant.id}
    >
      <LabStatusStrip variant={variant} />
      <div className={styles.publicExperience}>
        <R5ReferenceReconstruction />
      </div>
    </div>
  );
}

