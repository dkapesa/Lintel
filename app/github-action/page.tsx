import Link from "next/link";
import AppShell from "../app-shell";
import styles from "../administrative-document.module.css";

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
    <AppShell>
      <div className={styles.page}>
        <div className={styles.document}>
          <header className={styles.pageHeader}>
            <h1>GitHub Action blueprint</h1>
            <p>Lintel can move from local handoff to a pull request workflow by running a CLI inside GitHub Actions and updating one concise merge-readiness comment.</p>
            <div className={styles.statusLine}>Prototype only · no GitHub posting · no <span className={styles.technicalInline}>pull_request_target</span> · <Link href="/docs/security-model.md">Security model</Link></div>
            <div className={styles.pageActions}>
              <Link className={styles.secondaryAction} href="/settings">Analysis settings</Link>
              <Link className={styles.secondaryAction} href="/new">Check a pull request</Link>
            </div>
          </header>

          <nav className={styles.sectionNav} aria-label="GitHub Action blueprint sections">
            <a href="#action-status">Current status</a>
            <a href="#action-workflow">Intended workflow</a>
            <a href="#action-configuration">Workflow configuration</a>
            <a href="#action-comment">Decision-comment contract</a>
            <a href="#action-security">Security boundaries</a>
            <a href="#action-setup">Setup references</a>
          </nav>

          <section className={styles.section} id="action-status" aria-labelledby="action-status-title">
            <div className={styles.sectionHeader}>
              <h2 id="action-status-title">Current status and limitation</h2>
              <p>This route documents an intended integration shape. It does not install an Action, connect a repository or execute a check.</p>
            </div>
            <ul className={styles.summaryStrip} aria-label="GitHub Action blueprint status">
              <li><span>Implementation</span><strong>Prototype</strong><p>Documentation blueprint only</p></li>
              <li><span>Posting</span><strong>Does not post</strong><p>No GitHub API behavior</p></li>
              <li><span>Enforcement</span><strong>Non-blocking</strong><p>Default intended direction</p></li>
              <li><span>Execution</span><strong>Planned</strong><p>User-controlled CI runner</p></li>
            </ul>
          </section>

          <section className={styles.section} id="action-workflow" aria-labelledby="action-workflow-title">
            <div className={styles.sectionHeader}>
              <h2 id="action-workflow-title">Intended workflow</h2>
              <p>The sequence is planned architecture, not evidence that checks are currently executing.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>CLI-first, thin Action wrapper</h3>
                <p>Deterministic review remains first; optional synthesis and the one-comment update remain explicit.</p>
              </div>
              <ol className={styles.workflowList}>
                {workflowSteps.map(([title, description]) => (
                  <li key={title}><strong>{title}</strong><p>{description}</p></li>
                ))}
              </ol>
            </div>
          </section>

          <section className={styles.section} id="action-configuration" aria-labelledby="action-configuration-title">
            <div className={styles.sectionHeader}>
              <h2 id="action-configuration-title">Workflow configuration</h2>
              <p>Selectable YAML is retained as technical evidence, without terminal chrome or a simulated GitHub interface.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>Illustrative YAML</h3>
                <p>This snippet is documentation only. It shows the intended direction, not a working published Action.</p>
              </div>
              <pre className={styles.codeBlock} aria-label="Illustrative GitHub Actions YAML"><code>{yamlSnippet}</code></pre>
            </div>
          </section>

          <section className={styles.section} id="action-comment" aria-labelledby="action-comment-title">
            <div className={styles.sectionHeader}>
              <h2 id="action-comment-title">Decision-comment contract</h2>
              <p>A checklist, not a lecture. The intended output is one structured merge-readiness record, not a full GitHub application preview.</p>
            </div>
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <h3>Lintel merge-readiness</h3>
                <p>Prototype preview. This page does not post to GitHub. A future wrapper would update one marked comment instead of adding noisy inline comments.</p>
              </div>
              <dl className={styles.definitionList}>
                {commentSections.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
              <div className={styles.evidenceColumns}>
                <section aria-labelledby="action-conditions-title">
                  <h4 id="action-conditions-title">Conditions before merge</h4>
                  <ul className={styles.evidenceList}>{conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
                </section>
                <section aria-labelledby="action-tests-title">
                  <h4 id="action-tests-title">Missing tests</h4>
                  <ul className={styles.evidenceList}>{missingTests.map((test) => <li className={styles.technicalInline} key={test}>{test}</li>)}</ul>
                </section>
              </div>
              <div className={styles.evidenceColumns}>
                <section aria-labelledby="action-reviewer-focus-title">
                  <h4 id="action-reviewer-focus-title">Reviewer focus</h4>
                  <ul className={styles.evidenceList}>{reviewerFocus.map((focus) => <li key={focus}>{focus}</li>)}</ul>
                </section>
                <section aria-labelledby="action-comment-strategy-title">
                  <h4 id="action-comment-strategy-title">Comment strategy</h4>
                  <ul className={styles.evidenceList}>
                    <li>One marker: <span className={styles.technicalInline}>&lt;!-- lintel-report --&gt;</span></li>
                    <li>No default blocking: comment first, enforcement later.</li>
                    <li>No inline noise: decision summary over annotation spam.</li>
                  </ul>
                </section>
              </div>
              <div className={styles.artifactActions}>
                <p>Generated by a future CLI-first Action. Deterministic checks run by default; model-assisted analysis requires explicit configuration.</p>
              </div>
            </div>
          </section>

          <section className={styles.section} id="action-security" aria-labelledby="action-security-title">
            <div className={styles.sectionHeader}>
              <h2 id="action-security-title">Security and trust boundaries</h2>
              <p>Current page behavior and planned CI architecture remain distinctly worded.</p>
            </div>
            <div className={`${styles.group} ${styles.limitationGroup}`}>
              <div className={styles.groupHeader}>
                <h3>CI-safe by design</h3>
                <p>This page stores no credentials and has no repository access. The remaining statements describe the intended first-version architecture.</p>
              </div>
              <ul className={styles.boundaryList}>{trustBoundaries.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </section>

          <section className={styles.section} id="action-setup" aria-labelledby="action-setup-title">
            <div className={styles.sectionHeader}>
              <h2 id="action-setup-title">Setup and export references</h2>
              <p>These links document the prototype and adjacent export surface; they do not install or enable an integration.</p>
            </div>
            <div className={styles.group}>
              <nav className={styles.routeLinks} aria-label="GitHub Action setup and related references">
                <Link href="/settings">Analysis settings</Link>
                <Link href="/slack-handoff">Slack handoff concept</Link>
                <Link href="/docs/security-model.md">Security model</Link>
                <Link href="/docs/cli-github-action-blueprint.md">CLI / GitHub Action blueprint</Link>
              </nav>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
