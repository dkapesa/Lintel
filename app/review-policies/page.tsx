import Link from "next/link";
import AppShell from "../app-shell";
import styles from "../administrative-document.module.css";
import { policyGateSummary, REVIEW_POLICY_PROFILES, type GateLevel } from "../../lib/review-policies";

const gateLevels: GateLevel[] = ["Required", "Recommended", "Optional"];

const levelCopy: Record<GateLevel, string> = {
  Required: "Must be satisfied or explicitly resolved before merge.",
  Recommended: "Expected for this type of change unless intentionally accepted.",
  Optional: "Useful context when applicable, not a default blocker.",
};

export default function ReviewPoliciesPage() {
  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>Review policies</h1>
            <p>Policy profiles make merge-readiness gates explicit for the kind of pull request under review.</p>
            <div className={styles.statusLine}>Local prototype · structured gates · not an enterprise policy engine</div>
          </header>

          <div>
            <section className={styles.section} aria-labelledby="policy-levels-title">
              <div className={styles.sectionHeader}>
                <h2 id="policy-levels-title">Policy levels</h2>
                <p>Levels communicate reviewer expectations; written labels remain the source of meaning.</p>
              </div>
              <div className={styles.group}>
                <ul className={styles.levelSummary}>
                  {gateLevels.map((level) => (
                    <li key={level}>
                      <span className={styles.levelName}>{level}</span>
                      <p>{levelCopy[level]}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="profiles-title">
              <div className={styles.sectionHeader}>
                <h2 id="profiles-title">Policy profiles</h2>
                <p>Each record retains its current gate set and review relationship. Open a record to inspect its clauses in place.</p>
              </div>
              <div className={styles.group}>
                <div className={styles.policyColumns} aria-hidden="true">
                  <span className={styles.columnHeading}>Policy</span>
                  <span className={styles.columnHeading}>Levels</span>
                  <span className={styles.columnHeading}>Scope or trigger</span>
                  <span className={styles.columnHeading}>State</span>
                </div>
                <ul className={styles.policyList}>
                  {REVIEW_POLICY_PROFILES.map((policy) => (
                    <li className={styles.policyRecord} key={policy.id}>
                      <details>
                        <summary className={styles.policySummary}>
                          <div className={styles.policyIdentity}>
                            <strong>{policy.label}</strong>
                            <span>{policy.description}</span>
                          </div>
                          <div className={styles.policyValue}>{policyGateSummary(policy)}</div>
                          <div className={styles.policyValue}>{policy.bestFor}</div>
                          <div className={styles.policyValue}>Local-only</div>
                        </summary>
                        <div className={styles.policyDetails}>
                          <div className={styles.policyDetailsHeader} aria-hidden="true">
                            <span className={styles.columnHeading}>Gate</span>
                            <span className={styles.columnHeading}>Level</span>
                            <span className={styles.columnHeading}>Requirement</span>
                          </div>
                          <ul className={styles.gateList} aria-label={`${policy.label} gates`}>
                            {policy.gates.map((gate) => (
                              <li key={gate.label}>
                                <span className={styles.gateTitle}>{gate.label}</span>
                                <span className={`${styles.gateLevel} ${styles[`gateLevel--${gate.level.toLowerCase()}`]}`}>{gate.level}</span>
                                <span className={styles.gateDescription}>{gate.description}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="policy-limitations-title">
              <div className={styles.sectionHeader}>
                <h2 id="policy-limitations-title">Prototype limitations</h2>
                <p>Profiles make expected readiness checks visible; reviewers remain responsible for the decision.</p>
              </div>
              <div className={`${styles.group} ${styles.limitationGroup}`}>
                <ul className={styles.recordList}>
                  <li className={styles.record}>
                    <div>
                      <span className={styles.recordTitle}>Policy enforcement</span>
                      <span className={styles.recordSupport}>Profiles do not enforce repository rules, block merges, sync across teams or save organisation settings.</span>
                    </div>
                    <span className={`${styles.recordValue} ${styles["recordValue--muted"]}`}>Unavailable</span>
                  </li>
                  <li className={styles.record}>
                    <div>
                      <span className={styles.recordTitle}>Repository assignment</span>
                      <span className={styles.recordSupport}>No repository-specific policy assignment is represented by this local prototype.</span>
                    </div>
                    <span className={`${styles.recordValue} ${styles["recordValue--muted"]}`}>Unavailable</span>
                  </li>
                </ul>
                <nav className={styles.routeLinks} aria-label="Related policy resources">
                  <Link href="/settings">Analysis settings</Link>
                  <Link href="/review-operations">Review operations</Link>
                  <Link href="/docs/security-model.md">Security model</Link>
                </nav>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
