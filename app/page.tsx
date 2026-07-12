import Link from "next/link";
import LandingNav from "./landing-nav";

/* W1 landing. Lintel's signature motif: repository and evidence paths
   converging on a single decision node. Decorative only — semantic colour
   stays inside product frames. */
function Topology({ variant }: { variant: "hero" | "cta" }) {
  return (
    <svg
      className={`lp-topology lp-topology--${variant}`}
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.25">
        <path d="M-40 110 C 300 130, 660 210, 1046 314" opacity="0.55" />
        <path d="M-40 318 C 340 306, 700 314, 1044 322" opacity="0.8" />
        <path d="M-40 560 C 320 544, 720 430, 1046 330" />
        <path d="M-40 716 C 380 700, 780 520, 1050 340" opacity="0.65" />
        <path d="M220 -40 C 470 90, 820 210, 1042 310" opacity="0.45" />
        <path d="M1076 320 C 1200 322, 1320 326, 1480 328" opacity="0.7" />
        <path d="M1074 314 C 1180 268, 1300 224, 1480 190" opacity="0.45" />
        <path d="M1074 330 C 1180 380, 1300 428, 1480 462" opacity="0.4" />
      </g>
      <g fill="currentColor">
        <circle cx="520" cy="186" r="3" opacity="0.7" />
        <circle cx="560" cy="310" r="2.5" opacity="0.8" />
        <circle cx="640" cy="470" r="3" opacity="0.8" />
        <circle cx="812" cy="238" r="2.5" opacity="0.6" />
        <circle cx="880" cy="560" r="2.5" opacity="0.55" />
        <circle cx="1240" cy="324" r="2.5" opacity="0.6" />
        <circle cx="1300" cy="224" r="2" opacity="0.45" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1049" y="311" width="22" height="22" transform="rotate(45 1060 322)" />
        <rect x="1055" y="317" width="10" height="10" transform="rotate(45 1060 322)" opacity="0.6" />
      </g>
    </svg>
  );
}

const failureModes = [
  {
    id: "01",
    title: "The dangerous path was never tested",
    detail: "The happy path is covered. The retry that fires twice against a payment provider is not.",
  },
  {
    id: "02",
    title: "Operational recovery remains unverified",
    detail: "Rollback, timeout and failure handling are assumed to work — nothing in the change proves they do.",
  },
  {
    id: "03",
    title: "Assumptions were declared but not supported",
    detail: "The builder states the change is safe under load. No evidence in the diff supports the claim.",
  },
  {
    id: "04",
    title: "The code changed after a previous approval",
    detail: "A new commit landed after review. The earlier approval silently covers code nobody has read.",
  },
  {
    id: "05",
    title: "Unresolved conditions were lost across iterations",
    detail: "Conditions raised in round one disappear into the comment thread by round three.",
  },
] as const;

const workflowSteps = [
  {
    id: "01",
    title: "Connect GitHub",
    detail: "Connect once. Credentials stay server-side; the browser never holds a token.",
  },
  {
    id: "02",
    title: "Choose a pull request",
    detail: "Pick from live repositories and open pull requests instead of describing them.",
  },
  {
    id: "03",
    title: "Inspect its context",
    detail: "Title, branches, changed files and builder declarations arrive with the selection.",
  },
  {
    id: "04",
    title: "Run a readiness review",
    detail: "Deterministic checks always run. Model assistance is optional and labelled.",
  },
] as const;

const inspectables = [
  ["Score explanation", "Why 67 and not 90: which findings and gaps move the readiness score."],
  ["Findings and evidence", "Each finding carries concrete evidence and a provenance label — rule-detected or model-assisted."],
  ["Readiness conditions", "What must happen before merge, tracked as explicit conditions instead of a comment thread."],
  ["Reviewer focus", "Where a human reviewer should spend attention first, and why."],
] as const;

const trustPoints = [
  ["Credentials stay server-side", "GitHub credentials are held by the server integration. The browser never receives a token."],
  ["Raw diffs are processed transiently", "Diffs are read to produce a report, then discarded. The report is the stored artifact."],
  ["No raw diffs in local history", "Local report history keeps findings, conditions and decisions — not your code."],
  ["Deterministic fallback", "If model analysis is unavailable or declined, the deterministic ruleset still produces a full report."],
  ["Model provenance is visible", "Every finding is labelled rule-detected or model-assisted. Nothing hides its origin."],
  ["Human decisions are explicit", "Recorded outcomes and reasoned overrides — never a silent automatic approval."],
] as const;

const decisionOutcomes = [
  { label: "Ready to merge", note: "Conditions cleared, evidence supports the change." },
  { label: "Tests required", note: "Specific coverage must exist before this moves forward.", selected: true },
  { label: "Review required", note: "A named discipline needs to look before any decision." },
  { label: "Blocked", note: "An unresolved risk stops the change where it stands." },
  { label: "Approved with accepted risk", note: "Explicit override — requires a written reason that stays with the decision." },
] as const;

export default function Home() {
  return (
    <main className="lp">
      <a className="lp-skip" href="#lp-main">Skip to content</a>
      <LandingNav />

      <div id="lp-main">
        {/* 1 — Hero: product-forward split. The decision console is the proof. */}
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <Topology variant="hero" />
          <div className="lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">Engineering verification for human and agent code</p>
              <h1 id="lp-hero-title" className="lp-serif">
                Agents create code.<br />
                Lintel verifies what is ready.
              </h1>
              <p className="lp-lede">
                Lintel turns a pull request into inspectable evidence, unresolved conditions and a clear
                engineering decision — before a risky change moves forward.
              </p>
              <div className="lp-actions">
                <Link className="lp-btn lp-btn--primary" href="/new">Review a pull request</Link>
                <Link className="lp-btn lp-btn--ghost" href="/workspace">Explore the workspace</Link>
              </div>
            </div>

            <div
              className="lp-console"
              role="img"
              aria-label="Lintel readiness review with sample data: pull request 482 selected, recommendation tests required, readiness score 67 of 100 up from 48 since the previous head, one blocker, one cleared condition, a next action, and an awaiting human decision state"
            >
              <div className="lp-console-bar">
                <span className="lp-console-dots" aria-hidden="true"><i /><i /><i /></span>
                <code>lintel — readiness review</code>
                <span className="lp-console-run"><code>run_0918</code> · SAMPLE DATA</span>
              </div>
              <div className="lp-console-main" aria-hidden="true">
                <div className="lp-console-pr-line">
                  <code>hollis/checkout-service · PR #482 · head 8d04f2a</code>
                  <span className="lp-chip lp-chip--blue">SELECTED</span>
                </div>
                <h2>Add retry handling for failed refund submissions</h2>
                <div className="lp-console-verdict-row">
                  <span className="lp-chip lp-chip--amber">TESTS REQUIRED</span>
                  <div className="lp-console-delta">
                    <span className="lp-delta-score"><s>48</s> <i aria-hidden="true">→</i> 67</span>
                    <span className="lp-chip lp-chip--green">IMPROVED</span>
                  </div>
                  <strong>67<span>/100</span></strong>
                </div>
                <ul className="lp-console-rows">
                  <li className="lp-row--blocker">
                    <span className="lp-chip lp-chip--red">BLOCKER</span>
                    <p>Refund retry can submit duplicate provider requests</p>
                  </li>
                  <li className="lp-row--cleared">
                    <span className="lp-chip lp-chip--green">CLEARED</span>
                    <p>Timeout-path coverage added at head 8d04f2a</p>
                  </li>
                  <li>
                    <span className="lp-chip">NEXT ACTION</span>
                    <p>Prove refund retries are idempotent before merge</p>
                  </li>
                </ul>
                <div className="lp-console-foot">
                  <span>HUMAN DECISION</span>
                  <p>Awaiting engineer — record it in the Decision Studio</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2 — The verification problem */}
        <section className="lp-problem" aria-labelledby="lp-problem-title">
          <div className="lp-problem-copy">
            <p className="lp-eyebrow">The verification problem</p>
            <h2 id="lp-problem-title" className="lp-serif">CI green does not mean the change is ready.</h2>
            <p>
              Coding agents and faster tooling produce more change than teams can carefully read. A passing
              pipeline confirms the checks that exist — it says nothing about the checks that were never
              written, the failure modes nobody considered, or the conditions that quietly went unresolved.
            </p>
            <p>
              Verification and engineering judgment have to keep pace with creation. Lintel gives that
              judgment structure without taking it away from the engineer.
            </p>
          </div>
          <ol className="lp-failures">
            {failureModes.map((mode) => (
              <li key={mode.id}>
                <code>{mode.id}</code>
                <div>
                  <h3>{mode.title}</h3>
                  <p>{mode.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 3 — Connected workflow */}
        <section className="lp-workflow" aria-labelledby="lp-workflow-title">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Connected workflow</p>
            <h2 id="lp-workflow-title">Start with the pull request, not a blank prompt.</h2>
            <p>
              Lintel connects to GitHub and retrieves the context a review needs — repository, branches,
              changed files, builder declarations — so you never re-paste and re-explain a change to get an
              opinion on it.
            </p>
          </div>
          <div
            className="lp-workbench"
            role="img"
            aria-label="The connected review workbench with sample data: a repositories pane, a pull requests pane with one selected, and a change brief with a run readiness review action"
          >
            <div className="lp-workbench-pane" aria-hidden="true">
              <h3>Repositories</h3>
              <div className="lp-workbench-item"><code>hollis/checkout-service</code><span className="lp-chip lp-chip--blue">CONNECTED</span></div>
              <div className="lp-workbench-item"><code>hollis/session-api</code></div>
              <div className="lp-workbench-item"><code>hollis/notifications</code></div>
            </div>
            <div className="lp-workbench-pane" aria-hidden="true">
              <h3>Pull requests</h3>
              <div className="lp-workbench-item lp-workbench-item--active">
                <code>#482</code>
                <p>Add retry handling for failed refund submissions</p>
              </div>
              <div className="lp-workbench-item"><code>#486</code><p>Rotate webhook signing secrets</p></div>
            </div>
            <div className="lp-workbench-pane lp-workbench-pane--brief" aria-hidden="true">
              <h3>Change brief</h3>
              <dl>
                <div><dt>Branches</dt><dd><code>retry-refunds → main</code></dd></div>
                <div><dt>Changed files</dt><dd><code>6 files · +214 −38</code></dd></div>
                <div><dt>Producer</dt><dd><code>agent-assisted · declared</code></dd></div>
              </dl>
              <span className="lp-workbench-cta">Run readiness review</span>
            </div>
          </div>
          <ol className="lp-steps">
            {workflowSteps.map((step) => (
              <li key={step.id}>
                <code>{step.id}</code>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 4 — Inspectable decision */}
        <section className="lp-inspect" aria-labelledby="lp-inspect-title">
          <div className="lp-inspect-copy">
            <p className="lp-eyebrow">Inspectable decision</p>
            <h2 id="lp-inspect-title">A recommendation you can inspect.</h2>
            <p>
              Lintel does not return a bare approve-or-reject answer. The recommendation sits on top of an
              inspectable structure — open any part of it and see what produced it.
            </p>
            <ul className="lp-inspect-list">
              {inspectables.map(([term, detail]) => (
                <li key={term}>
                  <strong>{term}</strong>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="lp-report"
            role="img"
            aria-label="A readiness report excerpt with sample data: recommendation tests required with score explanation, a finding with evidence and a rule-detected provenance label, a missing test, affected surfaces, readiness conditions and reviewer focus"
          >
            <div className="lp-report-head" aria-hidden="true">
              <div>
                <span className="lp-kicker">RECOMMENDATION</span>
                <strong>TESTS REQUIRED</strong>
              </div>
              <p>Score 67/100 — held back by one unresolved blocker and one missing test on the retry path.</p>
            </div>
            <div className="lp-report-block" aria-hidden="true">
              <span className="lp-kicker">FINDING</span>
              <h3>Refund retry can submit duplicate provider requests</h3>
              <p className="lp-report-evidence">
                <code>refund_worker.py</code> retries <code>submit_refund()</code> without an idempotency
                key; the provider treats each attempt as a new submission.
              </p>
              <div className="lp-report-tags">
                <span className="lp-chip">RULE DETECTED</span>
                <span className="lp-chip lp-chip--red">HIGH IMPACT</span>
              </div>
            </div>
            <div className="lp-report-block" aria-hidden="true">
              <span className="lp-kicker">MISSING TEST</span>
              <p>Duplicate-submission test for a retried refund against a slow provider response.</p>
            </div>
            <div className="lp-report-block" aria-hidden="true">
              <span className="lp-kicker">AFFECTED SURFACES</span>
              <div className="lp-report-tags">
                <span className="lp-chip lp-chip--red">PAYMENTS</span>
                <span className="lp-chip lp-chip--amber">PROVIDER API</span>
                <span className="lp-chip">RETRY PATH</span>
              </div>
            </div>
            <div className="lp-report-block" aria-hidden="true">
              <span className="lp-kicker">READINESS CONDITIONS</span>
              <ul className="lp-conditions">
                <li className="lp-condition--open"><i aria-hidden="true" /><p>Prove refund retries are idempotent</p></li>
                <li className="lp-condition--done"><i aria-hidden="true" /><p>Cover the provider-timeout path</p></li>
              </ul>
            </div>
            <div className="lp-report-block lp-report-block--split" aria-hidden="true">
              <div>
                <span className="lp-kicker">REVIEWER FOCUS</span>
                <p>Backend reliability — retry semantics first.</p>
              </div>
              <div>
                <span className="lp-kicker">NEXT ACTION</span>
                <p>Add the idempotency test, then re-run.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5 — Change over time */}
        <section className="lp-delta" aria-labelledby="lp-delta-title">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-eyebrow">Readiness Delta</p>
            <h2 id="lp-delta-title" className="lp-serif">See what changed after every commit.</h2>
            <p>
              Every new commit re-opens the question. The Readiness Delta and Review Diff show exactly what a
              push cleared, what it opened, and what still blocks — so conditions never get lost between
              iterations.
            </p>
          </div>
          <div
            className="lp-delta-board"
            role="img"
            aria-label="Readiness Delta with sample data: score improved from 48 to 67. Cleared: timeout-path coverage and recovery evidence. Opened: API contract concern. Still blocking: retry idempotency."
          >
            <div className="lp-delta-score-row" aria-hidden="true">
              <span className="lp-delta-big"><s>48</s><i>→</i><em>67</em></span>
              <span className="lp-chip lp-chip--green">IMPROVED</span>
              <code>3f2c41e → 8d04f2a · run_0917 → run_0918</code>
            </div>
            <div className="lp-delta-cols" aria-hidden="true">
              <div className="lp-delta-col lp-delta-col--cleared">
                <h3><span className="lp-dot lp-dot--green" />Cleared</h3>
                <ul>
                  <li>Timeout-path coverage</li>
                  <li>Recovery evidence</li>
                </ul>
              </div>
              <div className="lp-delta-col lp-delta-col--opened">
                <h3><span className="lp-dot lp-dot--red" />Opened</h3>
                <ul>
                  <li>API contract concern</li>
                </ul>
              </div>
              <div className="lp-delta-col lp-delta-col--blocking">
                <h3><span className="lp-dot lp-dot--amber" />Still blocking</h3>
                <ul>
                  <li>Retry idempotency</li>
                </ul>
              </div>
            </div>
            <p className="lp-delta-note" aria-hidden="true">
              A recommendation that changed after approval is a signal, not a footnote. Lintel re-analyses on
              every head change and shows the difference as a structured Review Diff.
            </p>
          </div>
        </section>

        {/* 6 — Change Passport */}
        <section className="lp-passport" aria-labelledby="lp-passport-title">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Change Passport</p>
            <h2 id="lp-passport-title">
              Know what the builder claimed.<br />Verify what the change actually proves.
            </h2>
            <p>
              Human- and agent-produced changes arrive with declarations: intent, claimed validation,
              assumptions, known limitations. Lintel records them — and checks them against what the change
              itself shows. Declarations are never trusted automatically.
            </p>
          </div>
          <div className="lp-passport-compare">
            <div className="lp-passport-panel">
              <h3><span className="lp-kicker">DECLARED BY BUILDER</span><code>agent-assisted · imported from PR body</code></h3>
              <ul>
                <li><span>Task intent</span><p>Make failed refund submissions retry safely.</p></li>
                <li><span>Claimed validation</span><p>“Unit tests added for the retry wrapper.”</p></li>
                <li><span>Assumption</span><p>“Provider API tolerates repeated submissions.”</p></li>
                <li><span>Known limitation</span><p>Batch refunds are out of scope for this change.</p></li>
                <li><span>Unresolved uncertainty</span><p>Behaviour under provider rate-limiting is untested.</p></li>
              </ul>
            </div>
            <div className="lp-passport-panel lp-passport-panel--observed">
              <h3><span className="lp-kicker">OBSERVED BY LINTEL</span><code>compared against the diff</code></h3>
              <ul>
                <li>
                  <span className="lp-chip lp-chip--green">SUPPORTED</span>
                  <p>Retry-wrapper unit tests exist and exercise the failure path.</p>
                </li>
                <li>
                  <span className="lp-chip lp-chip--amber">UNVERIFIED</span>
                  <p>Nothing in the change supports the repeated-submission assumption.</p>
                </li>
                <li>
                  <span className="lp-chip lp-chip--amber">UNDECLARED</span>
                  <p>The change also touches the reconciliation report surface.</p>
                </li>
                <li>
                  <span className="lp-chip lp-chip--red">UNRESOLVED</span>
                  <p>Rate-limiting uncertainty matches an open readiness condition.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7 — Decision provenance */}
        <section className="lp-provenance" aria-labelledby="lp-provenance-title">
          <div className="lp-provenance-head">
            <p className="lp-eyebrow">Canonical review run</p>
            <h2 id="lp-provenance-title">Every decision has provenance.</h2>
            <p>
              Each review is recorded as a canonical run — source, configuration and result, all
              fingerprinted — so “where did this decision come from?” always has an answer.
            </p>
          </div>
          <dl className="lp-manifest">
            <div><dt>source</dt><dd><code>github-app · hollis/checkout-service#482</code></dd></div>
            <div><dt>commits</dt><dd><code>base 41c09a2 → head 8d04f2a</code></dd></div>
            <div><dt>review mode</dt><dd><code>standard</code></dd></div>
            <div><dt>ruleset / generator</dt><dd><code>6.3 / 6.4</code></dd></div>
            <div>
              <dt>analysis source</dt>
              <dd><span className="lp-chip lp-chip--violet">MODEL-ASSISTED</span> <code>deterministic baseline always runs</code></dd>
            </div>
            <div><dt>fingerprints</dt><dd><code>input 9c41…7e2 · config 77ab…c09 · result 5f0e…9c4</code></dd></div>
            <div><dt>reproducibility</dt><dd><span className="lp-chip lp-chip--green">EXACT</span> <code>same input, same baseline result</code></dd></div>
          </dl>
        </section>

        {/* 8 — Human authority */}
        <section className="lp-authority" aria-labelledby="lp-authority-title">
          <div className="lp-authority-copy">
            <p className="lp-eyebrow">Human authority</p>
            <h2 id="lp-authority-title" className="lp-serif">
              Lintel presents the evidence.<br />Engineers make the decision.
            </h2>
            <p>
              The final call is recorded by a person, in the Decision Studio, with the evidence in front of
              them. Overrides are allowed — and they are explicit: accepting a risk requires a written reason
              that stays attached to the decision.
            </p>
          </div>
          <div
            className="lp-studio"
            role="img"
            aria-label="Decision Studio outcomes with sample data: ready to merge, tests required which is selected, review required, blocked, and approved with accepted risk which requires a written reason"
          >
            <div className="lp-studio-head" aria-hidden="true">
              <span className="lp-kicker">FINAL DECISION</span>
              <code>recorded by the engineer</code>
            </div>
            <ul aria-hidden="true">
              {decisionOutcomes.map((outcome) => (
                <li key={outcome.label} className={"selected" in outcome && outcome.selected ? "lp-studio-option lp-studio-option--selected" : "lp-studio-option"}>
                  <i aria-hidden="true" />
                  <div>
                    <strong>{outcome.label}</strong>
                    <p>{outcome.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9 — Trust and data handling */}
        <section className="lp-trust" aria-labelledby="lp-trust-title">
          <div className="lp-section-head">
            <p className="lp-eyebrow">Trust and data handling</p>
            <h2 id="lp-trust-title">Narrow claims, all of them checkable.</h2>
            <p>
              Lintel is an early-stage product and describes itself precisely. These are the current
              implementation facts — the <Link className="lp-link" href="/docs/security-model.md">security model</Link> spells
              out the rest.
            </p>
          </div>
          <ul className="lp-trust-list">
            {trustPoints.map(([title, detail]) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{detail}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 10 — Final action */}
        <section className="lp-final" aria-labelledby="lp-final-title">
          <Topology variant="cta" />
          <p className="lp-eyebrow">Next step</p>
          <h2 id="lp-final-title" className="lp-serif">Review your next pull request with more confidence.</h2>
          <p>
            Bring a change you are unsure about. Leave with evidence, unresolved conditions and a decision
            you can stand behind.
          </p>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn--primary" href="/new">Review a pull request</Link>
            <Link className="lp-btn lp-btn--ghost" href="/workspace">Explore the workspace</Link>
          </div>
        </section>
      </div>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lintel</span>
          <p>Engineering verification for human- and agent-produced change. Early-stage prototype.</p>
        </div>
        <nav aria-label="Product">
          <h3>Product</h3>
          <Link href="/new">New review</Link>
          <Link href="/workspace">Risk inbox</Link>
          <Link href="/review-operations">Review operations</Link>
          <Link href="/review-policies">Review policies</Link>
        </nav>
        <nav aria-label="Integrations and documentation">
          <h3>Reference</h3>
          <Link href="/github-action">GitHub Action</Link>
          <Link href="/slack-handoff">Slack handoff</Link>
          <Link href="/settings">Analysis settings</Link>
          <Link href="/docs/security-model.md">Security model</Link>
        </nav>
      </footer>
    </main>
  );
}
