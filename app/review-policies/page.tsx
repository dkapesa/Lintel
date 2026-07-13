import Link from "next/link";
import AppShell from "../app-shell";
import { gatesByLevel, policyGateSummary, REVIEW_POLICY_PROFILES, type GateLevel } from "../../lib/review-policies";

const gateLevels: GateLevel[] = ["Required", "Recommended", "Optional"];

const levelCopy: Record<GateLevel, string> = {
  Required: "Must be satisfied or explicitly resolved before merge.",
  Recommended: "Expected for this type of change unless intentionally accepted.",
  Optional: "Useful context when applicable, not a default blocker.",
};

export default function ReviewPoliciesPage() {
  return (
    <AppShell>
      <div className="workspace-main policies-main">
        <header className="workspace-header workspace-header--app policies-header">
          <div className="workspace-header-copy">
            <span className="eyebrow">REVIEW POLICIES</span>
            <h1>What ready to merge means depends on the PR.</h1>
            <p>Lintel can make merge gates explicit for different change types: low-risk changes, backend/API work, security-sensitive changes, data migrations, operational changes and AI-generated code.</p>
            <span className="workspace-header-note">Local prototype / structured gates / not an enterprise policy engine</span>
          </div>
          <div className="workspace-header-actions">
            <Link className="workspace-secondary-action" href="/workspace">Risk inbox</Link>
            <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
          </div>
        </header>

        <section className="policy-levels" aria-label="Gate level definitions">
          {gateLevels.map((level) => (
            <article key={level}>
              <span className={`policy-gate-level policy-gate-level--${level.toLowerCase()}`}>{level}</span>
              <p>{levelCopy[level]}</p>
            </article>
          ))}
        </section>

        <section className="policies-grid" aria-label="Review policy profiles">
          {REVIEW_POLICY_PROFILES.map((policy) => (
            <article className="policy-card" key={policy.id}>
              <div className="policy-card-header">
                <div>
                  <span className="card-kicker">{policyGateSummary(policy)}</span>
                  <h2>{policy.label}</h2>
                </div>
              </div>
              <p>{policy.description}</p>
              <div className="policy-best-for">
                <span>Best for</span>
                <strong>{policy.bestFor}</strong>
              </div>
              <div className="policy-gate-groups">
                {gateLevels.map((level) => {
                  const gates = gatesByLevel(policy, level);

                  return (
                    <section key={level}>
                      <h3><span className={`policy-gate-level policy-gate-level--${level.toLowerCase()}`}>{level}</span></h3>
                      {gates.length > 0 ? (
                        <ul>
                          {gates.map((gate) => (
                            <li key={gate.label}>
                              <strong>{gate.label}</strong>
                              <span>{gate.description}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No gates at this level.</p>
                      )}
                    </section>
                  );
                })}
              </div>
            </article>
          ))}
        </section>

        <section className="policy-note">
          <div>
            <span className="card-kicker">CURRENT BOUNDARY</span>
            <h2>Practical policy, not enterprise bloat.</h2>
          </div>
          <p>These profiles do not enforce repository rules, block merges, sync across teams or save organization settings. They make the expected readiness checks visible so reviewers can decide what must be true before merge.</p>
          <div className="settings-doc-links">
            <Link href="/settings">Analysis settings</Link>
            <Link href="/review-operations">Review operations</Link>
            <Link href="/docs/security-model.md">Security model</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
