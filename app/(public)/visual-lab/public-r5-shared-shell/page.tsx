import type { Metadata } from "next";
import { buildPrivateLabMetadata } from "../../../_public/metadata";
import { PUBLIC_ROUTE_REGISTRY } from "../../../_public/routes";
import styles from "./shell-lab.module.css";

export const metadata: Metadata = buildPrivateLabMetadata({
  title: "Shared public shell laboratory",
  description:
    "Private, noindex Phase 8B laboratory for the shared Lintel public header, navigation states, page canvas and footer.",
});

export default function SharedPublicShellLabPage() {
  return (
    <div className={styles.page} data-private-shell-lab>
      <section className={styles.opening} aria-labelledby="shell-lab-heading">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Private shell laboratory</p>
          <h1 id="shell-lab-heading">Shared public shell</h1>
          <p className={styles.lead}>
            A bounded Phase 8B specimen for the real public header, route states, white editorial
            canvas and footer. It is not a marketing route and does not transfer the accepted
            homepage reconstruction onto production.
          </p>
          <p className={styles.notice}>
            This private laboratory is not a primary public destination, so no primary navigation
            item is current here. Future routes remain read-only “Not available” states and cannot
            navigate to a 404.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="route-state-heading">
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Registry evidence</p>
            <h2 id="route-state-heading">One activation decision</h2>
            <p>
              Header, footer, robots and sitemap consume the same typed state. Only Home is live in
              Phase 8B; later routes activate after their own acceptance gate.
            </p>
          </div>
          <dl className={styles.routeGrid}>
            {PUBLIC_ROUTE_REGISTRY.map((route) => (
              <div key={route.id}>
                <dt>{route.label}</dt>
                <dd>
                  <code>{route.pathname}</code>
                  <span>{route.state === "live" ? "Live" : "Not available"}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="mobile-gate-heading">
        <div className={styles.wrap}>
          <div className={styles.reviewGrid}>
            <div>
              <p className={styles.eyebrow}>Responsive navigation</p>
              <h2 id="mobile-gate-heading">Disclosure waits for a genuine second route</h2>
              <p>
                At 767px and below, the current shell truthfully keeps identity and the sample
                action. The real button, focus containment, Escape closure, focus restoration and
                route-change closure are implemented but remain non-rendered until two primary
                routes are live.
              </p>
            </div>
            <div className={styles.factPanel} aria-label="Mobile disclosure activation state">
              <p>Current activation condition</p>
              <strong>1 live primary route</strong>
              <span>Disclosure not rendered</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="scope-heading">
        <div className={styles.wrap}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Protected scope</p>
            <h2 id="scope-heading">Shell only</h2>
            <p>
              No Hero, product scene, production homepage content, logged-in route or older visual
              experiment is rendered or changed by this specimen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
