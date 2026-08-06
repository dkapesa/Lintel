import Link from "next/link";
import { footerPublicRouteGroups, getPublicRoute } from "../routes";
import styles from "./public-shell.module.css";

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerIdentity}>
          <Link className={styles.brand} href="/" aria-label="Lintel home">
            <span className={styles.brandMark} aria-hidden="true" />
            <span>Lintel</span>
          </Link>
          <p>
            Lintel connects a software change to the record an engineer needs to decide on it.
          </p>
        </div>

        <div className={styles.footerGroups}>
          {footerPublicRouteGroups.map((group) => (
            <section key={group.label} className={styles.footerGroup} aria-labelledby={`footer-${group.label.toLowerCase().replaceAll(" ", "-")}`}>
              <h2 id={`footer-${group.label.toLowerCase().replaceAll(" ", "-")}`}>{group.label}</h2>
              <ul>
                {group.routeIds.map((routeId) => {
                  const route = getPublicRoute(routeId);
                  return (
                    <li key={route.id}>
                      {route.state === "live" ? (
                        <Link href={route.pathname}>{route.label}</Link>
                      ) : (
                        <span className={styles.footerUnavailable}>
                          <span>{route.label}</span>
                          <span>Not available</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className={styles.footerBoundary}>
          <span>© Lintel</span>
          <span>Read-only sample available. No hosted service is claimed.</span>
        </div>
      </div>
    </footer>
  );
}
