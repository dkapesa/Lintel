import styles from "../public-r5-recalibrated.module.css";
import { GLOBAL_RAIL_AREAS } from "../canonical-review";

/* R5E.1B — Global Rail, restrained per
   docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §6 and §11 of the navigation
   requirements: represents the genuine product hierarchy (R4A Rail anatomy:
   Reviews, Operations, Governance, Integrations, System) but none of these
   areas navigates anywhere from this prototype, so none is interactive.
   Only "Reviews" carries the active, non-colour marker. */
export function GlobalRail() {
  return (
    <div className={styles.rail} aria-hidden="true">
      {GLOBAL_RAIL_AREAS.map((area) => (
        <span
          key={area.label}
          className={`${styles.railArea} ${area.active ? styles.railAreaActive : ""}`}
          title={area.label}
        >
          <span className={styles.railDot} />
        </span>
      ))}
    </div>
  );
}
