import Link from "next/link";

const workflow = [
  [
    "Provide the change",
    "Paste a diff, import a public GitHub PR, or load a sample. Pick a review mode for fast triage, deep review, security, tests, operations or generated-code review.",
  ],
  [
    "Lintel analyses it",
    "Deterministic checks read the diff for failure modes, missing coverage, contract stability and sensitive-data handling. Model-assisted analysis can add synthesis on top while preserving baseline findings.",
  ],
  [
    "Get the decision",
    "A recommendation, risks with evidence, a test plan, reviewer routing, and the conditions to meet before merge. Copy it into the PR conversation or export Markdown.",
  ],
] as const;

const capabilities = [
  ["Conditions before merge", "A concrete list of what must be proven before this change ships. Paste it straight into the PR thread."],
  ["Operational readiness", "Failure modes, detection signals, recovery paths and customer impact, assessed before merge."],
  ["Risk-specific test plan", "Not \"add more tests.\" Named test cases for the exact failure paths the change introduces, like proving a retry cannot duplicate a redemption."],
  ["Reviewer focus", "Routes attention to the disciplines that matter for this change, such as backend reliability, API contract or security, with one primary focus."],
  ["Evidence and provenance", "Findings include concise evidence and provenance labels such as Rule detected or Model assisted."],
  ["Local-first workspace", "Reports live on your machine. Raw diffs are not saved in local report history. No account is required to run a report."],
] as const;

const evaluationStats = [
  ["4/4", "evaluation scenarios correct"],
  ["0", "invented findings on clean changes"],
  ["0", "false payment flags on frontend PRs"],
  ["0", "raw diff markers observed in generated reports"],
] as const;

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
          <Link href="/docs/security-model.md">Security model</Link>
          <Link className="landing-button landing-button--small" href="/new">Check a pull request</Link>
        </div>
      </header>

      <section className="landing-hero landing-hero--decision">
        <div className="landing-hero-copy">
          <span className="eyebrow">MERGE READINESS FOR PULL REQUESTS</span>
          <h1>Decide what is ready to merge.</h1>
          <p>Lintel analyses a pull request and produces a merge-readiness report: a clear recommendation, the risks with evidence, the tests that are missing, and the conditions to meet before merge. Clean changes get approved. Risky ones get a checklist, not a lecture.</p>
          <div className="landing-actions">
            <Link className="landing-button" href="/new">Check a pull request <span aria-hidden="true">-&gt;</span></Link>
            <Link className="landing-button landing-button--secondary" href="/report">See a full report</Link>
          </div>
          <div className="landing-trust-links" aria-label="Trust and privacy notes">
            <span>Local-first workspace</span>
            <span>Raw-diff-free history</span>
            <Link href="/docs/security-model.md">Read security model</Link>
          </div>
        </div>
        <article className="landing-hero-report" aria-label="Example TESTS_REQUIRED merge-readiness report">
          <div className="landing-hero-report-top">
            <span>MERGE DECISION</span>
            <strong>TESTS REQUIRED</strong>
          </div>
          <div className="landing-hero-report-risk">
            <strong>HIGH RISK</strong>
            <span>Merge is not ready</span>
          </div>
          <div className="landing-hero-condition">
            <span>Top condition</span>
            <p>Prove retries cannot create duplicate redemptions or issue duplicate discount codes</p>
          </div>
          <dl className="landing-hero-report-stats">
            <div><dt>5</dt><dd>findings</dd></div>
            <div><dt>7</dt><dd>missing tests</dd></div>
          </dl>
          <div className="landing-hero-report-footer">
            <span>Provenance: Rule detected</span>
            <Link href="/report">See full report</Link>
          </div>
        </article>
      </section>

      <section className="landing-section landing-output" aria-labelledby="landing-output-title">
        <div className="landing-section-heading landing-section-heading--wide">
          <span className="eyebrow">THE OUTPUT</span>
          <h2 id="landing-output-title">One report. Two very different answers.</h2>
          <p>Lintel does not find something to say about every change. A well-tested utility change gets approved and the report stays quiet. A retry path that could duplicate a customer side effect gets a high-risk recommendation, the missing tests, and the conditions to clear before merge.</p>
        </div>
        <div className="landing-output-grid">
          <article className="landing-output-card landing-output-card--approve">
            <div className="landing-output-verdict"><strong>APPROVE</strong><span>Low risk</span></div>
            <h3>Format display names consistently</h3>
            <code>acme/profile-api</code>
            <p className="landing-output-metrics">0 findings / 0 missing tests / No conditions before merge</p>
            <blockquote>&quot;Formatting utility with matching tests. Nothing to block on.&quot;</blockquote>
          </article>
          <article className="landing-output-card landing-output-card--tests">
            <div className="landing-output-verdict"><strong>TESTS REQUIRED</strong><span>High risk</span></div>
            <h3>Add fallback handling for failed discount-code retrieval</h3>
            <code>acme/redemption-api</code>
            <p className="landing-output-risk"><span>Top risk</span>Retry behaviour may duplicate customer-facing side effects</p>
            <p className="landing-output-metrics">7 missing tests / 5 conditions before merge</p>
            <blockquote>&quot;Do not approve until repeated retries are proven safe.&quot;</blockquote>
          </article>
        </div>
        <p className="landing-output-caption">A tool that only ever raises flags is not judging readiness. Lintel is built to tell the difference.</p>
      </section>

      <section className="landing-context-band" aria-label="Why Lintel exists">
        <p>Agents create code. Lintel decides what is ready to merge.</p>
      </section>

      <section className="landing-section" aria-labelledby="how-lintel-works">
        <div className="landing-section-heading">
          <span className="eyebrow">WORKFLOW</span>
          <h2 id="how-lintel-works">From pull request to a defensible merge decision.</h2>
        </div>
        <ol className="landing-steps">
          {workflow.map(([title, description], index) => (
            <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>
          ))}
        </ol>
      </section>

      <section className="landing-section" aria-labelledby="lintel-capabilities">
        <div className="landing-section-heading">
          <span className="eyebrow">CAPABILITIES</span>
          <h2 id="lintel-capabilities">Built around the merge decision.</h2>
        </div>
        <div className="landing-capabilities landing-capabilities--decision">
          {capabilities.map(([title, description]) => (
            <article key={title}><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-analysis" aria-labelledby="analysis-title">
        <div className="landing-section-heading">
          <span className="eyebrow">HOW ANALYSIS WORKS</span>
          <h2 id="analysis-title">Deterministic first. Model-assisted second.</h2>
        </div>
        <div className="landing-analysis-copy">
          <p>Lintel starts with deterministic checks over the pull request diff: failure paths, retry boundaries, missing coverage, contract changes and sensitive-data handling. That baseline gives the report concrete local signals.</p>
          <p>Model-assisted analysis can enrich the report by improving synthesis, wording and prioritisation. The deterministic baseline is preserved, and findings can show provenance so reviewers know what they are looking at.</p>
        </div>
      </section>

      <section className="landing-positioning">
        <span className="eyebrow">POSITIONING</span>
        <h2>Code review tells you what to change. Lintel tells you whether it is ready.</h2>
        <div>
          <p>Review tools annotate code: style, structure, suggestions and line-by-line comments. That is useful, and it is not what Lintel is trying to replace.</p>
          <p>Lintel answers the question review comments do not always settle: is this change safe, tested and operationally ready to merge? One recommendation. The evidence behind it. The conditions to clear if it is not ready. Use it alongside whatever review workflow you already have.</p>
        </div>
      </section>

      <section className="landing-section landing-evidence" aria-labelledby="evidence-title">
        <div className="landing-section-heading landing-section-heading--wide">
          <span className="eyebrow">EVIDENCE</span>
          <h2 id="evidence-title">Tested against real scenarios, including the ones where the right answer is approve.</h2>
          <p>Lintel is evaluated against representative pull request scenarios: clean utility changes, risky provider-retry paths, imported public PRs and frontend/API changes. The checks look for both escalation and restraint: risky changes should surface blockers, and clean changes should not accumulate invented findings.</p>
        </div>
        <dl className="landing-evidence-stats">
          {evaluationStats.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}
        </dl>
        <a className="landing-text-link" href="/docs/evaluation-results.md">Read the evaluation results <span aria-hidden="true">-&gt;</span></a>
      </section>

      <section className="landing-limitations" id="scope">
        <div>
          <span className="eyebrow">SCOPE</span>
          <h2>What Lintel does not do yet.</h2>
        </div>
        <div className="landing-limitations-copy">
          <p>Lintel is in public pilot preparation. It currently supports pasted diffs, public GitHub PR imports and local report history. It does not support private repositories, a GitHub App, CI integration, team dashboards, authentication or billing yet.</p>
          <p>Reports are local to your browser. Raw diffs are not saved in local report history. The planned private-repo path is a GitHub Action that runs inside customer CI.</p>
          <p><Link href="/docs/security-model.md">Read the security model</Link> for current privacy guarantees, model-assisted mode and the planned GitHub Action direction.</p>
        </div>
      </section>

      <section className="landing-final-cta">
        <div><span className="eyebrow">CHECK THE NEXT PR</span><h2>Run it on a pull request you are unsure about.</h2></div>
        <div className="landing-actions">
          <Link className="landing-button landing-button--light" href="/new">Check a pull request <span aria-hidden="true">-&gt;</span></Link>
          <Link className="landing-button landing-button--ghost" href="/report">See a full report</Link>
        </div>
      </section>
    </main>
  );
}
