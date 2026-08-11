"use client";

import type { MouseEvent } from "react";
import type { ReviewMode } from "../../lib/r6c/index";
import type { ReviewModeLink } from "../../lib/r6f/index";
import styles from "./selected-review.module.css";

function isPlainPrimaryClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey;
}

export default function ReviewModeNav({
  links,
  onActivate,
}: {
  links: readonly ReviewModeLink[];
  onActivate: (mode: ReviewMode) => void;
}) {
  return (
    <nav className={styles.modeNav} aria-label="Review modes">
      <ul>
        {links.map((link) => (
          <li key={link.mode}>
            <a
              className={link.current ? styles.modeLinkCurrent : styles.modeLink}
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              onClick={(event) => {
                if (!isPlainPrimaryClick(event)) return;
                event.preventDefault();
                onActivate(link.mode);
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
