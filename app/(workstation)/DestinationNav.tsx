"use client";

import Link from "next/link";
import { WORKSTATION_DESTINATIONS } from "../../lib/r6d/navigation";
import { ShellIcon } from "../nav-config";
import { useWorkstation } from "./WorkstationProvider";
import styles from "./workstation-shell.module.css";

export default function DestinationNav() {
  const { state, onDestinationClick } = useWorkstation();
  return (
    <nav className={styles.destinationNav} aria-label="Application destinations">
      {WORKSTATION_DESTINATIONS.map((destination) => {
        const active = state.destination === destination.id;
        return (
          <Link
            className={active ? `${styles.destinationLink} ${styles.destinationLinkActive}` : styles.destinationLink}
            href={destination.href}
            aria-current={active ? "page" : undefined}
            key={destination.id}
            onClick={(event) => onDestinationClick(event, {
              id: "route/navigate",
              destination: destination.id,
            })}
          >
            <span className={styles.destinationIcon} aria-hidden="true">
              <ShellIcon name={destination.icon} />
            </span>
            <span className={styles.destinationLabel}>{destination.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
