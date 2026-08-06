import type { ReactNode } from "react";
import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";
import styles from "./public-shell.module.css";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <PublicHeader />
      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
