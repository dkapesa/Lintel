import Link from "next/link";
import AppShell from "../app-shell";

const analysisModes = [
  {
    name: "Deterministic-only",
    status: "Available now",
    boundary: "Runs through Lintel's local rule baseline. No external model call is required.",
    use: "Use when teams need repeatable merge-readiness checks, fallback behavior, or a raw-diff-minimizing local flow.",
  },
  {
    name: "Baseline + model-assisted",
    status: "Prototype",
    boundary: "The deterministic baseline is created first. Model-assisted synthesis can enrich wording and prioritization when configured.",
    use: "Use when a configured provider is acceptable and reviewers want more synthesis without losing baseline guardrails.",
  },
  {
    name: "Future BYO provider",
    status: "Planned",
    boundary: "Customer-provided keys would run under user control, ideally inside CI or a future controlled execution path.",
    use: "Use when teams need model-assisted analysis but want their own provider account and policy boundary.",
  },
  {
    name: "Future internal/local model",
    status: "Concept",
    boundary: "Execution would stay inside the customer's environment. No hosted Lintel server would need to process code.",
    use: "Use for higher-sensitivity teams that want model assistance without external provider data flow.",
  },
] as const;

const providerPaths = [
  {
    path: "OpenAI",
    status: "Prototype route when env vars are configured",
    boundary: "Server-side call from the local prototype route. No key is exposed client-side.",
    use: "Optional model-assisted synthesis during prototype evaluation.",
  },
  {
    path: "Anthropic",
    status: "Future provider path",
    boundary: "Not integrated. Would require BYO key and explicit enablement.",
    use: "Potential alternative provider for teams already standardized on Anthropic.",
  },
  {
    path: "Local/internal model",
    status: "Future private execution path",
    boundary: "Not integrated. Intended to keep code inside customer-controlled infrastructure.",
    use: "Sensitive repos, internal codebases, or environments with strict data controls.",
  },
  {
    path: "Custom endpoint",
    status: "Future adapter concept",
    boundary: "Not integrated. Would require explicit configuration, timeout and fallback rules.",
    use: "Teams with a gateway, proxy, internal LLM service or custom evaluation harness.",
  },
] as const;

const trustItems = [
  "Deterministic checks work without external model calls.",
  "Model-assisted analysis should be explicit and guarded by the deterministic baseline.",
  "Future BYO keys should run under user control, not as hidden Lintel-owned provider configuration.",
  "Raw diffs should not be stored as durable app data or local report history.",
  "This prototype does not claim SOC 2, SSO, RBAC, audit logs or enterprise compliance.",
] as const;

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="workspace-main settings-main">
        <header className="workspace-header workspace-header--app settings-header">
          <div className="workspace-header-copy">
            <span className="eyebrow">SYSTEM CONCEPT</span>
            <h1>Analysis settings</h1>
            <p>Lintel separates the review job from the execution path. Review modes describe what engineers want checked; analysis modes describe how Lintel runs the check.</p>
            <span className="workspace-header-note">Read-only prototype / no provider keys stored / <Link href="/docs/security-model.md">Security model</Link></span>
          </div>
          <div className="workspace-header-actions">
            <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
          </div>
        </header>

        <section className="settings-overview" aria-label="Current prototype mode">
          <article className="settings-current-card">
            <span className="card-kicker">CURRENT PROTOTYPE</span>
            <h2>Deterministic baseline first. Model-assisted only when configured.</h2>
            <p>Lintel always creates a deterministic merge-readiness baseline before optional model-assisted synthesis. Missing provider configuration, timeout, malformed output or failed normalization falls back to the baseline.</p>
            <dl>
              <div><dt>Review choice</dt><dd>Review mode</dd></div>
              <div><dt>Execution path</dt><dd>Baseline + optional model-assisted</dd></div>
              <div><dt>Provider keys</dt><dd>Environment variables only in this prototype</dd></div>
              <div><dt>Raw diff storage</dt><dd>Not saved in local report history</dd></div>
            </dl>
          </article>
          <article className="settings-principle-card">
            <span>Product principle</span>
            <strong>Users choose the review job. Lintel handles the intelligence path.</strong>
            <p>This page is a concept surface, not a live provider settings screen. It does not save API keys, switch models, or post to GitHub.</p>
          </article>
        </section>

        <section className="settings-section" aria-labelledby="analysis-modes-title">
          <div className="section-heading">
            <div>
              <span className="card-kicker">ANALYSIS MODES</span>
              <h2 id="analysis-modes-title">How Lintel can run the review</h2>
            </div>
          </div>
          <div className="settings-mode-grid">
            {analysisModes.map((mode) => (
              <article className="settings-mode-card" key={mode.name}>
                <div>
                  <h3>{mode.name}</h3>
                  <span>{mode.status}</span>
                </div>
                <dl>
                  <div><dt>Code/data boundary</dt><dd>{mode.boundary}</dd></div>
                  <div><dt>When to use</dt><dd>{mode.use}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="settings-section" aria-labelledby="provider-paths-title">
          <div className="section-heading">
            <div>
              <span className="card-kicker">PROVIDER PATHS</span>
              <h2 id="provider-paths-title">Future execution options, not a model selector</h2>
            </div>
          </div>
          <div className="settings-provider-table" role="table" aria-label="Provider execution paths">
            <div role="row" className="settings-provider-row settings-provider-row--head">
              <span role="columnheader">Path</span>
              <span role="columnheader">Current status</span>
              <span role="columnheader">Code/data boundary</span>
              <span role="columnheader">When to use</span>
            </div>
            {providerPaths.map((provider) => (
              <div role="row" className="settings-provider-row" key={provider.path}>
                <strong role="cell">{provider.path}</strong>
                <span role="cell">{provider.status}</span>
                <span role="cell">{provider.boundary}</span>
                <span role="cell">{provider.use}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section settings-trust-section" aria-labelledby="trust-boundaries-title">
          <div>
            <span className="card-kicker">TRUST BOUNDARIES</span>
            <h2 id="trust-boundaries-title">What this page is making explicit</h2>
          </div>
          <ul>
            {trustItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="settings-doc-links">
            <Link href="/review-policies">View review policies</Link>
            <Link href="/github-action">View GitHub Action prototype</Link>
            <Link href="/slack-handoff">View Slack handoff concept</Link>
            <Link href="/docs/security-model.md">Read security model</Link>
            <Link href="/docs/cli-github-action-blueprint.md">Read CLI / GitHub Action blueprint</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
