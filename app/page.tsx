import Link from "next/link";

const workflow = [
  [
    "Analyze a pull request",
    "Paste a diff or import a public GitHub PR. Deterministic checks read the change for risky paths, missing tests and contract changes.",
  ],
  [
    "Inspect the evidence",
    "Every finding carries concise evidence and a provenance label — rule detected or model assisted — so you can see why it was raised.",
  ],
  [
    "Clear the merge contract",
    "Risky changes get a short list of conditions to meet before merge. A checklist, not a lecture.",
  ],
  [
    "Share the decision",
    "Copy a ready-to-paste GitHub PR comment or a Slack-style handoff so the decision travels with the change.",
  ],
  [
    "Track readiness patterns",
    "The review operations dashboard shows how decisions, risk levels and blockers accumulate across your local reports.",
  ],
] as const;

const features = [
  {
    tag: "INBOX",
    title: "Risk inbox",
    description: "Every analysed pull request lands in one queue, ranked by risk, with review states your team controls.",
    href: "/workspace",
    cta: "Open the inbox",
  },
  {
    tag: "LEDGER",
    title: "Evidence ledger",
    description: "Findings are backed by concrete evidence and provenance labels, so reviewers know what produced each one.",
    href: "/report",
    cta: "See it in a report",
  },
  {
    tag: "CONTRACT",
    title: "Merge contract",
    description: "The conditions a change must meet before merge, tracked as an explicit checklist instead of a comment thread.",
    href: "/report",
    cta: "See it in a report",
  },
  {
    tag: "BLAST RADIUS",
    title: "Blast radius",
    description: "A map of the surfaces a change touches — payments, auth, APIs — so reviewers see how far a mistake could travel.",
    href: "/report",
    cta: "See it in a report",
  },
  {
    tag: "POLICY",
    title: "Review policies & merge gates",
    description: "Policy profiles define what your team blocks on, and apply it consistently to every report.",
    href: "/review-policies",
    cta: "Browse policies",
  },
  {
    tag: "OWNERSHIP",
    title: "Reviewer ownership",
    description: "Each report routes attention to the discipline that should look at it, with one clear primary owner.",
    href: "/report",
    cta: "See it in a report",
  },
  {
    tag: "GITHUB",
    title: "GitHub PR comment",
    description: "One structured comment for the pull request conversation. No line-by-line noise.",
    href: "/github-action",
    cta: "Preview the comment",
  },
  {
    tag: "SLACK",
    title: "Slack handoff",
    description: "A compact, copy-ready summary for the channel where the merge decision actually gets made.",
    href: "/slack-handoff",
    cta: "Preview the handoff",
  },
  {
    tag: "OPERATIONS",
    title: "Review operations",
    description: "A dashboard of decisions, risk trends and readiness patterns across your local report history.",
    href: "/review-operations",
    cta: "Open the dashboard",
  },
] as const;

const trustPoints = [
  [
    "Local-first by design",
    "Reports are generated and stored on your machine. No account, no upload, no server-side history in the current prototype.",
  ],
  [
    "Deterministic baseline",
    "Every report starts from deterministic checks over the diff. The same input produces the same baseline findings.",
  ],
  [
    "Model-assisted, optionally",
    "Model analysis can improve synthesis and wording on top of the baseline. Findings keep their provenance labels either way.",
  ],
  [
    "Raw-diff-free history",
    "Local report history stores decisions and findings, not raw diffs. Your code does not linger in a report archive.",
  ],
  [
    "CI-safe by architecture",
    "The planned private-repo path is a GitHub Action that runs inside your CI, so diffs never leave your infrastructure.",
  ],
] as const;

const actionYaml: ReadonlyArray<{ text: string; comment?: boolean }> = [
  { text: "# .github/workflows/lintel.yml", comment: true },
  { text: "name: lintel-merge-readiness" },
  { text: "on: [pull_request]" },
  { text: "" },
  { text: "jobs:" },
  { text: "  readiness:" },
  { text: "    runs-on: ubuntu-latest" },
  { text: "    steps:" },
  { text: "      - uses: actions/checkout@v4" },
  { text: "      - name: Lintel readiness report" },
  { text: "        uses: lintel/readiness-action@v1" },
  { text: "        with:" },
  { text: "          comment: single        # one comment, updated in place" },
  { text: "          inline-comments: off   # no line-by-line noise" },
  { text: "          block-merge: false     # advisory by default in v1" },
];

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" href="/" aria-label="Lintel home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lintel</span>
        </Link>
        <div className="landing-nav-actions">
          <Link href="/workspace">Risk inbox</Link>
          <Link href="/github-action">GitHub Action</Link>
          <Link href="/docs/security-model.md">Security model</Link>
          <Link className="landing-button landing-button--small" href="/new">Check a pull request</Link>
        </div>
      </header>

      <section className="landing-hero-v5">
        <span className="eyebrow">LOCAL-FIRST MERGE-READINESS WORKSPACE</span>
        <h1>Decide what’s ready to merge.</h1>
        <p>
          Lintel turns a pull request into a clear merge-readiness decision: the risks, the missing tests, the
          evidence behind them, and the conditions to clear before merge. Plain language for the team. Full depth
          for the reviewer.
        </p>
        <div className="landing-actions">
          <Link className="landing-button" href="/workspace">Open risk inbox <span aria-hidden="true">-&gt;</span></Link>
          <Link className="landing-button landing-button--secondary" href="/new">Check a pull request</Link>
        </div>
        <div className="landing-trust-links landing-trust-links--center" aria-label="Trust and privacy notes">
          <span>Local-first workspace</span>
          <span>Raw-diff-free history</span>
          <Link href="/docs/security-model.md">Read security model</Link>
        </div>
      </section>

      <section className="hero-mockup-wrap" aria-label="Preview of the Lintel workspace: risk inbox, readiness report, evidence ledger, merge contract and PR comment">
        <div className="hero-mockup">
          <div className="hero-mockup-titlebar">
            <span className="hero-mockup-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="hero-mockup-title">lintel — risk inbox</span>
            <span className="hero-mockup-env">LOCAL WORKSPACE</span>
          </div>
          <div className="hero-mockup-body">
            <aside className="hero-mockup-inbox">
              <div className="hero-mockup-inbox-head">
                <strong>Risk inbox</strong>
                <span>3 open</span>
              </div>
              <div className="hero-mockup-pr hero-mockup-pr--active">
                <code>PR #482</code>
                <p>Add fallback for failed discount-code retrieval</p>
                <span className="mockup-risk mockup-risk--high">HIGH</span>
              </div>
              <div className="hero-mockup-pr">
                <code>PR #479</code>
                <p>Rotate webhook signing secrets</p>
                <span className="mockup-risk mockup-risk--medium">MEDIUM</span>
              </div>
              <div className="hero-mockup-pr">
                <code>PR #477</code>
                <p>Format display names consistently</p>
                <span className="mockup-risk mockup-risk--low">LOW</span>
              </div>
            </aside>
            <div className="hero-mockup-report">
              <div className="hero-mockup-tabs" aria-hidden="true">
                <span className="hero-mockup-tab hero-mockup-tab--active">Overview</span>
                <span className="hero-mockup-tab">Evidence ledger</span>
                <span className="hero-mockup-tab">Merge contract</span>
                <span className="hero-mockup-tab">Blast radius</span>
              </div>
              <div className="hero-mockup-headline">
                <div>
                  <code>acme/redemption-api · PR #482</code>
                  <h2>Add fallback handling for failed discount-code retrieval</h2>
                </div>
                <div className="hero-mockup-score">
                  <strong>62<span>/100</span></strong>
                  <em>TESTS REQUIRED</em>
                </div>
              </div>
              <div className="hero-mockup-columns">
                <div className="hero-mockup-panel">
                  <h3>Evidence ledger</h3>
                  <ul>
                    <li>
                      <p>Retry path can re-trigger customer-facing side effects</p>
                      <span>RULE DETECTED</span>
                    </li>
                    <li>
                      <p>No test covers a duplicate redemption on retry</p>
                      <span>RULE DETECTED</span>
                    </li>
                    <li>
                      <p>Fallback masks the upstream failure signal</p>
                      <span>MODEL ASSISTED</span>
                    </li>
                  </ul>
                </div>
                <div className="hero-mockup-panel">
                  <h3>Merge contract</h3>
                  <ul className="hero-mockup-contract">
                    <li className="hero-mockup-contract--open">
                      <i aria-hidden="true" />
                      <p>Prove retries cannot create duplicate redemptions</p>
                    </li>
                    <li className="hero-mockup-contract--open">
                      <i aria-hidden="true" />
                      <p>Add a test for discount-code retrieval failure</p>
                    </li>
                    <li className="hero-mockup-contract--done">
                      <i aria-hidden="true" />
                      <p>Confirm rollback path for the new fallback</p>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="hero-mockup-comment">
                <span>PR COMMENT PREVIEW</span>
                <code>### Lintel merge-readiness report</code>
                <code>**Recommendation:** TESTS_REQUIRED · High risk</code>
                <code>2 conditions open before merge · evidence attached</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-problem landing-problem--v5" aria-labelledby="landing-problem-title">
        <div>
          <span className="eyebrow">THE PROBLEM</span>
        </div>
        <div>
          <h2 id="landing-problem-title">Code is getting easier to write. Merging it is still a judgment call.</h2>
          <p>
            AI coding tools create more changes, faster, than teams can carefully review. Every one of those changes
            still ends in the same question: is this safe to merge? That decision still needs engineering judgment —
            Lintel exists to give that judgment structure, not to replace the people making it.
          </p>
          <p>
            A green CI run means the checks that exist passed. It says nothing about the tests that were never
            written, the failure modes nobody considered, or what happens when a retry fires twice in production.
            Passing CI is not the same as being ready to merge.
          </p>
          <p className="landing-problem-tagline">Agents create code. Lintel decides what is ready to merge.</p>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="how-lintel-works">
        <div className="landing-section-heading">
          <span className="eyebrow">WORKFLOW</span>
          <h2 id="how-lintel-works">From pull request to a defensible merge decision.</h2>
        </div>
        <ol className="landing-flow">
          {workflow.map(([title, description], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section" aria-labelledby="lintel-features">
        <div className="landing-section-heading">
          <span className="eyebrow">WHAT IS IN THE WORKSPACE</span>
          <h2 id="lintel-features">Everything is built around the merge decision.</h2>
        </div>
        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article key={feature.title}>
              <span className="landing-feature-tag">{feature.tag}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link href={feature.href}>{feature.cta} <span aria-hidden="true">-&gt;</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" aria-labelledby="trust-title">
        <div className="landing-section-heading landing-section-heading--wide">
          <span className="eyebrow">TRUST &amp; SECURITY</span>
          <h2 id="trust-title">Built local-first, so trying it costs nothing.</h2>
          <p>
            Lintel is an early-stage prototype and says so. What it promises today is deliberately narrow — and
            deliberately verifiable.
          </p>
        </div>
        <div className="landing-trust-grid">
          {trustPoints.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
          <article className="landing-trust-more">
            <h3>Read the details</h3>
            <p>The security model spells out what the prototype does — and does not — promise. Analysis settings show exactly what runs where.</p>
            <div>
              <Link className="landing-text-link" href="/docs/security-model.md">Security model <span aria-hidden="true">-&gt;</span></Link>
              <Link className="landing-text-link" href="/settings">Analysis settings <span aria-hidden="true">-&gt;</span></Link>
            </div>
          </article>
        </div>
      </section>

      <section className="landing-section landing-action" aria-labelledby="action-title">
        <div className="landing-action-copy">
          <span className="eyebrow">IN YOUR CI</span>
          <h2 id="action-title">One comment per pull request. Nothing louder.</h2>
          <p>
            The planned GitHub Action posts a single merge-readiness comment on the pull request and updates it in
            place. No inline comment spam across the diff, and no merge blocking by default in v1 — the decision
            stays with your team.
          </p>
          <p className="landing-action-note">
            The Action is a prototype blueprint: the comment format and workflow are real, the published action is
            not live yet.
          </p>
          <div className="landing-action-links">
            <Link className="landing-text-link" href="/github-action">Preview the PR comment <span aria-hidden="true">-&gt;</span></Link>
            <Link className="landing-text-link" href="/docs/cli-github-action-blueprint.md">Read the blueprint <span aria-hidden="true">-&gt;</span></Link>
          </div>
        </div>
        <pre className="landing-action-yaml"><code>{actionYaml.map((line, index) => (
          <span key={index} className={line.comment ? "yaml-comment" : undefined}>{line.text}{"\n"}</span>
        ))}</code></pre>
      </section>

      <section className="landing-final-cta">
        <div>
          <span className="eyebrow">CHECK THE NEXT PR</span>
          <h2>Start with one PR. Leave with a merge decision.</h2>
          <p>Run Lintel on a pull request you are unsure about, or explore a full sample report first.</p>
        </div>
        <div className="landing-actions">
          <Link className="landing-button landing-button--light" href="/new">Check a pull request <span aria-hidden="true">-&gt;</span></Link>
          <Link className="landing-button landing-button--ghost" href="/report">See a full report</Link>
        </div>
      </section>
    </main>
  );
}
