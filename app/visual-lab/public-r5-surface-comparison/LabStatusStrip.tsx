import styles from "./surface-comparison.module.css";
import {
  SURFACE_COMPARISON_BASE,
  SURFACE_VARIANTS,
  surfaceVariantHref,
  type SurfaceVariant,
} from "./variants";

export function LabStatusStrip({ variant }: { variant: SurfaceVariant }) {
  return (
    <aside className={styles.statusStrip} aria-label="Private surface comparison status">
      <div className={styles.statusIdentity}>
        <p className={styles.statusKicker}>Private comparison laboratory</p>
        <p className={styles.statusCurrent}>
          <span>{variant.name}</span>
          <strong>{variant.status}</strong>
        </p>
      </div>

      <nav className={styles.statusNav} aria-label="Surface comparison variants">
        <a href={SURFACE_COMPARISON_BASE}>Index</a>
        {SURFACE_VARIANTS.map((item) => (
          <a
            key={item.id}
            href={surfaceVariantHref(item.id)}
            aria-current={item.id === variant.id ? "page" : undefined}
          >
            {item.name}
          </a>
        ))}
      </nav>
    </aside>
  );
}

