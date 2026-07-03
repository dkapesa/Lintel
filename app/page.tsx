import Link from "next/link";

const capabilities = [
  ["Public GitHub PR import", "Fetch a public pull request diff, then review and edit the context before analysis."],
  ["Guardrailed AI reports", "AI enriches a deterministic baseline instead of replacing concrete local safety signals."],
  ["Operational readiness", "Assess failure modes, detection, observability, recovery, rollback and potential impact."],
  ["Reviewer focus", "Route attention to relevant engineering disciplines using evidence from the change."],
  ["Report quality checks", "Verify recommendation, risk, evidence and shareability are internally consistent."],
  ["Local report history", "Revisit the 10 most recent reports without an account or server-side database."],
  ["Markdown export", "Copy or download a concise, raw-diff-free report for review handoff."],
] as const;

const limitations = [
  "Public GitHub pull requests or pasted diffs only",
  "No private repository access yet",
  "No GitHub App or automatic PR comments yet",
  "Does not replace human review, CI, security review or tests",
] as const;

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true">◇</span>
          <span>Lintel</span>
        </Link>
        <div className="landing-nav-actions">
          <Link href="/report">Demo report</Link>
          <Link className="landing-button landing-button--small" href="/new">Start new report</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="eyebrow">MERGE READINESS FOR AI-ASSISTED CODE</span>
          <h1>Verify risky AI-assisted PRs before merge.</h1>
          <p>Lintel checks whether pull requests are safe, tested, observable, recoverable and ready to merge.</p>
          <div className="landing-actions">
            <Link className="landing-button" href="/new">Start new report <span aria-hidden="true">→</span></Link>
            <Link className="landing-button landing-button--secondary" href="/report">View demo report</Link>
          </div>
        </div>

        <aside className="landing-report-preview" aria-label="Example Lintel report outcome">
          <div className="landing-preview-topline"><span>MERGE READINESS</span><strong>TESTS REQUIRED</strong></div>
          <h2>Provider retry may duplicate a customer-facing side effect.</h2>
          <div className="landing-preview-score"><strong>78</strong><span>/100 · HIGH RISK</span></div>
          <ul>
            <li><span>Test coverage</span><strong>Missing risk-specific tests</strong></li>
            <li><span>Operational readiness</span><strong>Attention required</strong></li>
            <li><span>Reviewer focus</span><strong>Backend reliability · API contract</strong></li>
            <li><span>Report quality</span><strong>Checks passed</strong></li>
          </ul>
        </aside>
      </section>

      <section className="landing-problem">
        <span className="eyebrow">THE REVIEW GAP</span>
        <div>
          <h2>AI coding increases PR volume. Review confidence does not automatically scale.</h2>
          <p>Fast code generation can move uncertainty downstream into review. Lintel turns that uncertainty into an explicit recommendation, evidence-backed risks, missing tests and conditions before merge.</p>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="how-lintel-works">
        <div className="landing-section-heading">
          <span className="eyebrow">WORKFLOW</span>
          <h2 id="how-lintel-works">From pull request to a defensible merge decision.</h2>
        </div>
        <ol className="landing-steps">
          <li><span>01</span><h3>Provide the change</h3><p>Paste a unified diff, load a sample, or import a public GitHub PR URL.</p></li>
          <li><span>02</span><h3>Generate the report</h3><p>Lintel creates a deterministic baseline and optionally enriches it with guardrailed AI analysis.</p></li>
          <li><span>03</span><h3>Review merge readiness</h3><p>Inspect the recommendation, risks, tests, operational readiness, reviewer focus and merge conditions.</p></li>
        </ol>
      </section>

      <section className="landing-section" aria-labelledby="lintel-capabilities">
        <div className="landing-section-heading">
          <span className="eyebrow">CAPABILITIES</span>
          <h2 id="lintel-capabilities">Built around verification, not generic code commentary.</h2>
        </div>
        <div className="landing-capabilities">
          {capabilities.map(([title, description]) => (
            <article key={title}><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className="landing-limitations">
        <div>
          <span className="eyebrow">CURRENT LIMITATIONS</span>
          <h2>Deliberately small while the workflow is validated.</h2>
        </div>
        <ul>{limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
      </section>

      <section className="landing-final-cta">
        <div><span className="eyebrow">CHECK THE NEXT PR</span><h2>Make merge readiness explicit.</h2><p>Start with a built-in sample, a public pull request, or an anonymised diff.</p></div>
        <div className="landing-actions">
          <Link className="landing-button landing-button--light" href="/new">Start new report <span aria-hidden="true">→</span></Link>
          <Link className="landing-button landing-button--ghost" href="/report">View demo report</Link>
        </div>
      </section>
    </main>
  );
}
