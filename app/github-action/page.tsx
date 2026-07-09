import Link from "next/link";

const workflowSteps = [
  [
    "Pull request event",
    "A future workflow runs on pull_request events only. It avoids pull_request_target for the first version.",
  ],
  [
    "CLI runs in CI",
    "A thin Action wrapper checks out the PR context and runs the Lintel CLI inside the user's GitHub Actions runner.",
  ],
  [
    "Baseline first",
    "Deterministic checks run by default. Optional model-assisted synthesis runs only when explicitly configured.",
  ],
  [
    "Report generated",
    "Lintel creates a structured merge-readiness report with recommendation, evidence, tests and conditions.",
  ],
  [
    "One comment updated",
    "The Action posts or updates one PR summary comment using a stable marker instead of noisy inline comments.",
  ],
] as const;

const commentSections = [
  ["Recommendation", "TESTS_REQUIRED"],
  ["Risk band", "HIGH risk / 78/100"],
  ["Review state", "CI preview / conditions open"],
  ["Top blocker", "Retry fallback may duplicate a customer-facing redemption side effect."],
  ["Next action", "Prove retry/idempotency behavior before merge."],
] as const;

const conditions = [
  "Prove retries cannot create duplicate redemptions or issue duplicate discount codes",
  "Verify provider handling for 5xx response, timeout and unavailable states",
  "Confirm the frontend-safe API error contract remains stable",
  "Confirm identifier logging is intentional, hashed or redacted",
] as const;

const missingTests = [
  "test_provider_timeout_does_not_issue_duplicate_code",
  "test_provider_5xx_returns_retryable_error",
  "test_retryable_error_contract_is_stable_for_clients",
] as const;

const reviewerFocus = [
  "Backend reliability",
  "API contract",
  "Security/privacy",
  "Payments/domain logic",
] as const;

const trustBoundaries = [
  "No hosted Lintel server is required for the initial architecture.",
  "Customer code stays inside the user's repository and CI environment.",
  "Raw diffs should not be stored as durable Lintel app data.",
  "The first version should avoid pull_request_target.",
  "One PR comment is updated in place using a stable marker.",
  "No noisy inline comments by default.",
  "No merge blocking by default in v1.",
] as const;

const yamlSnippet = [
  "name: Lintel merge readiness",
  "",
  "on:",
  "  pull_request:",
  "    types: [opened, synchronize, reopened]",
  "",
  "permissions:",
  "  contents: read",
  "  pull-requests: write",
  "  # checks: write # only if a neutral check-run is added later",
  "",
  "jobs:",
  "  lintel:",
  "    runs-on: ubuntu-latest",
  "    steps:",
  "      - uses: actions/checkout@v4",
  "",
  "      - name: Generate merge-readiness report",
  "        run: |",
  "          npx lintel review \\",
  "            --base \"${{ github.event.pull_request.base.sha }}\" \\",
  "            --head \"${{ github.event.pull_request.head.sha }}\" \\",
  "            --profile standard \\",
  "            --format markdown \\",
  "            --output lintel-report.md",
  "",
  "      - name: Upsert one PR comment",
  "        run: |",
  "          # Prototype blueprint only.",
  "          # Future thin wrapper updates one <!-- lintel-report --> comment.",
  "          echo \"Would update the Lintel PR comment here.\"",
].join("\n");

export default function GitHubActionPrototypePage() {
  return (
    <div className="app-shell workspace-shell">
      <aside className="sidebar workspace-sidebar">
        <Link className="brand workspace-brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lintel</span>
        </Link>
        <nav className="side-nav workspace-side-nav" aria-label="Primary navigation">
          <span className="workspace-nav-label">Workspace</span>
          <Link className="nav-item workspace-nav-item" href="/new">New report</Link>
          <Link className="nav-item workspace-nav-item" href="/workspace">Risk inbox</Link>
          <Link className="nav-item workspace-nav-item" href="/review-operations">Review operations</Link>
          <Link className="nav-item workspace-nav-item" href="/report">Reports</Link>
          <span className="workspace-nav-label">System</span>
          <Link className="nav-item workspace-nav-item" href="/review-policies">Review policies</Link>
          <Link className="nav-item workspace-nav-item" href="/settings">Analysis settings</Link>
          <Link className="nav-item workspace-nav-item nav-item--active" href="/github-action" aria-current="page">GitHub Action</Link>
          <Link className="nav-item workspace-nav-item" href="/slack-handoff">Slack handoff</Link>
          <span className="workspace-nav-label">Evidence</span>
          <Link className="nav-item workspace-nav-item" href="/docs/evaluation-results.md">Evaluation</Link>
          <Link className="nav-item workspace-nav-item" href="/docs/security-model.md">Security model</Link>
        </nav>
        <div className="workspace-sidebar-panel">
          <span>CLI-first direction</span>
          <p>A future thin Action wrapper should run Lintel inside CI and update one merge-readiness PR comment.</p>
        </div>
        <div className="sidebar-footer">
          <div className="workspace-avatar">N</div>
          <div><strong>Demo Workspace</strong><span>Action concept</span></div>
        </div>
      </aside>

      <main className="workspace-main action-main">
        <header className="workspace-header workspace-header--app action-header">
          <div className="workspace-header-copy">
            <span className="eyebrow">GITHUB ACTION BLUEPRINT</span>
            <h1>PR comment prototype</h1>
            <p>Lintel can move from local handoff to the pull request workflow by running a CLI inside GitHub Actions and updating one concise merge-readiness comment.</p>
            <span className="workspace-header-note">Prototype only / no GitHub posting / no pull_request_target / <Link href="/docs/security-model.md">Security model</Link></span>
          </div>
          <div className="workspace-header-actions">
            <Link className="workspace-secondary-action" href="/settings">Analysis settings</Link>
            <Link className="workspace-primary-action" href="/new">Check a pull request</Link>
          </div>
        </header>

        <section className="action-hero" aria-label="GitHub PR comment preview">
          <article className="action-comment-card">
            <div className="action-comment-top">
              <span>Future PR comment</span>
              <strong>Updated in place</strong>
            </div>
            <div className="action-comment-title">
              <span aria-hidden="true" />
              <div>
                <h2>Lintel merge-readiness</h2>
                <p>Prototype preview. This page does not post to GitHub.</p>
              </div>
            </div>
            <dl className="action-comment-metadata">
              {commentSections.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <section className="action-comment-section">
              <h3>Conditions before merge</h3>
              <ul>
                {conditions.map((condition) => <li key={condition}>[ ] {condition}</li>)}
              </ul>
            </section>
            <section className="action-comment-section">
              <h3>Missing tests</h3>
              <ul>
                {missingTests.map((test) => <li key={test}>{test}</li>)}
              </ul>
            </section>
            <section className="action-comment-section action-comment-section--inline">
              <h3>Reviewer focus</h3>
              <div>
                {reviewerFocus.map((focus) => <span key={focus}>{focus}</span>)}
              </div>
            </section>
            <p className="action-comment-disclaimer">Generated by a future CLI-first Action. Deterministic checks run by default; model-assisted analysis requires explicit configuration.</p>
          </article>

          <article className="action-explanation-card">
            <span className="card-kicker">WHY ONE COMMENT</span>
            <h2>A checklist, not a lecture.</h2>
            <p>Lintel should reduce review noise. The future Action should not spray inline comments across a PR. It should update one structured merge-readiness summary that focuses reviewers on the decision: what is blocked, what needs tests, and what conditions must be cleared before merge.</p>
            <div className="action-mini-grid">
              <div><strong>One marker</strong><span>&lt;!-- lintel-report --&gt;</span></div>
              <div><strong>No default blocking</strong><span>Comment first, enforcement later</span></div>
              <div><strong>No inline noise</strong><span>Decision summary over annotation spam</span></div>
            </div>
          </article>
        </section>

        <section className="settings-section" aria-labelledby="action-workflow-title">
          <div className="section-heading">
            <div>
              <span className="card-kicker">WORKFLOW</span>
              <h2 id="action-workflow-title">CLI-first, thin Action wrapper</h2>
            </div>
          </div>
          <ol className="action-workflow-list">
            {workflowSteps.map(([title, description]) => (
              <li key={title}>
                <strong>{title}</strong>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="settings-section action-yaml-section" aria-labelledby="action-yaml-title">
          <div className="section-heading">
            <div>
              <span className="card-kicker">ILLUSTRATIVE YAML</span>
              <h2 id="action-yaml-title">Prototype workflow shape</h2>
            </div>
          </div>
          <p>This snippet is documentation only. It shows the intended direction, not a working published Action.</p>
          <pre className="action-yaml-preview" aria-label="Illustrative GitHub Actions YAML"><code>{yamlSnippet}</code></pre>
        </section>

        <section className="settings-section action-trust-section" aria-labelledby="action-trust-title">
          <div>
            <span className="card-kicker">TRUST BOUNDARIES</span>
            <h2 id="action-trust-title">CI-safe by design</h2>
          </div>
          <ul>
            {trustBoundaries.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="settings-doc-links">
            <Link href="/settings">Analysis settings</Link>
            <Link href="/slack-handoff">Slack handoff concept</Link>
            <Link href="/docs/security-model.md">Security model</Link>
            <Link href="/docs/cli-github-action-blueprint.md">CLI / GitHub Action blueprint</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
