import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./landing/landing.module.css";
import LandingMotion from "./landing-motion";
import LandingNav from "./landing-nav";
import LandingEvolution from "./landing/landing-evolution";
import LandingTheatre from "./landing/landing-theatre";
import { FooterSceneNarrow, FooterSceneWide } from "./landing/landing-footer-scene";
import { Chip, Coordinate, EDGE, Sample, step } from "./landing/landing-primitives";
import {
  LANDING_AUDIENCE,
  LANDING_CHAIN,
  LANDING_COMMENT,
  LANDING_EVOLUTION,
  LANDING_HERO_FRAGMENTS,
  LANDING_HERO_PROVENANCE,
  LANDING_RECOMMENDATION_ENTRIES,
  LANDING_RECOMMENDATION_STATE,
  LANDING_SCENARIOS,
  LANDING_TRUST_PRINCIPLES,
  LANDING_WORKFLOW_BOUNDARY,
  LANDING_WORKFLOW_CAPABILITIES,
  LANDING_WORKFLOW_STEPS,
  type LandingFragmentRole,
} from "../lib/landing-theatre-fixtures";

/* R3D — the production landing page.

   Server-rendered apart from three client boundaries: the navigation, the
   motion controller / public root, and the two interactive product surfaces
   (theatre and review evolution). Every product value on the page is derived
   at build time by lib/landing-theatre-fixtures from the canonical sample
   report and the real evidence-hierarchy and merge-contract builders.

   The route destinations are real: `/new` and `/workspace?source=fixture`. */

const FRAGMENT_ROLE: Record<LandingFragmentRole, string> = {
  anchor: styles.fragAnchor,
  principal: styles.fragPrincipal,
  support: styles.fragSupport,
  terminal: styles.fragTerminal,
};

const REVIEW_HREF = "/new";
const WORKSPACE_HREF = "/workspace?source=fixture";

export default function LandingPage() {
  return (
    <LandingMotion>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      {/* ---------------------------------------------------- 1 · NAVIGATION */}
      <LandingNav />

      <main id="main">
        {/* ------------------------------------------------------- 2 · HERO */}
        <section className={styles.hero} data-motion-section="hero" aria-labelledby="hero-title">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={`${styles.micro} ${styles.heroEyebrow}`} data-reveal style={step(0)}>
                Engineering verification
              </p>
              <h1 id="hero-title" className={`${styles.display} ${styles.heroTitle}`} data-reveal style={step(1)}>
                <span>Agents create code.</span>
                <span>Lintel verifies what is ready.</span>
              </h1>
              <p className={`${styles.lede} ${styles.heroLede}`} data-reveal style={step(2)}>
                Inspect the evidence behind a change, identify missing proof, see what must be resolved before merge,
                and record the final human decision.
              </p>
              <div className={`${styles.actions} ${styles.heroActions}`} data-reveal style={step(3)}>
                <Link className={`${styles.btn} ${styles.btnPrimary}`} href={REVIEW_HREF}>
                  Review a pull request
                </Link>
                <Link className={`${styles.btn} ${styles.btnSecondary}`} href={WORKSPACE_HREF}>
                  Explore the sample Workspace
                </Link>
              </div>
              <div className={styles.heroNote} data-reveal style={step(4)}>
                <Sample />
                <span className={styles.support}>
                  One change, moving through five stages. Nothing here has been decided.
                </span>
              </div>
            </div>

            <div className={styles.heroField}>
              <div className={styles.fieldGrid} aria-hidden="true" />
              <div className={styles.heroRail} aria-hidden="true" />
              <ol className={styles.heroFragments} aria-label="One verification chain, in order">
                {LANDING_HERO_FRAGMENTS.map((fragment, index) => (
                  <li
                    key={`${fragment.kind}-${index}`}
                    className={[
                      styles.heroFragment,
                      FRAGMENT_ROLE[fragment.role],
                      fragment.mobile ? "" : styles.heroFragmentDesktopOnly,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={
                      {
                        "--lnd-indent": `${fragment.indent}px`,
                        "--lnd-frag-w": fragment.width,
                        "--lnd-edge": EDGE[fragment.tone ?? "neutral"],
                      } as CSSProperties
                    }
                  >
                    <div className={styles.heroFragmentIn} data-reveal style={step(index + 2)}>
                      <div className={styles.fragHead}>
                        {fragment.id ? <span className={styles.recordId}>{fragment.id}</span> : null}
                        <span className={styles.recordKind}>{fragment.kind}</span>
                      </div>
                      <p className={styles.fragTitle}>{fragment.title}</p>
                      {fragment.detail ? <p className={styles.fragDetail}>{fragment.detail}</p> : null}
                      {fragment.state ? (
                        <p className={styles.fragState}>
                          <Chip tone={fragment.tone}>{fragment.state}</Chip>
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
              <div className={styles.heroFieldFoot}>
                <Sample />
                <span className={styles.monoMicro} style={{ color: "var(--lnd-ink-4)" }}>
                  {LANDING_HERO_PROVENANCE}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------- 3 · VERIFICATION GAP */}
        <section className={`${styles.shell} ${styles.sectionMajor}`} data-motion-section="gap" aria-labelledby="gap-title">
          <Coordinate section="01" of="The verification gap" />
          <div className={styles.gapGrid}>
            <h2 id="gap-title" className={`${styles.editorial} ${styles.gapStatement}`} data-reveal style={step(0)}>
              Software can now be created faster than teams can verify it.
            </h2>
            <div className={styles.gapSupport} data-reveal style={step(1)}>
              <p className={styles.body}>
                A passing build does not show that a change is understood, that the important failure paths were
                tested, or that the evidence behind it is strong enough to merge. Verification, not creation, is where
                the time now goes.
              </p>
            </div>
          </div>

          <ul className={styles.distinctions}>
            {[
              {
                left: "Created quickly",
                right: "understood",
                note: "Speed of authorship says nothing about whether anyone has read the failure paths.",
              },
              {
                left: "Tests passed",
                right: "sufficient proof",
                note: "A green pipeline proves the tests that exist passed. It does not name the ones that are missing.",
              },
              {
                left: "Recommendation",
                right: "Human Decision",
                note: "Lintel reaches a recommendation. Only an accountable engineer reaches a decision.",
              },
            ].map((row, index) => (
              <li key={row.left} className={styles.distinction} data-reveal style={step(index)}>
                <p className={styles.distinctionClaim}>
                  <span>{row.left}</span>
                  <span className={styles.notEqual}>≠</span>
                  <em>{row.right}</em>
                </p>
                <p className={styles.distinctionNote}>{row.note}</p>
              </li>
            ))}
          </ul>

          {/* One focal proof scene: what passed, and what passing does not prove. */}
          <div className={styles.gapContrast}>
            <div className={styles.gapPipeline} data-reveal style={step(0)}>
              <div className={styles.recordHead} style={{ marginBottom: 0 }}>
                <span className={styles.recordKind}>Pipeline record</span>
                <Chip tone="success">ALL CHECKS PASSED</Chip>
              </div>
              <ul>
                <li>lint</li>
                <li>type-check</li>
                <li>unit</li>
                <li>build</li>
              </ul>
              <p className={styles.support} style={{ marginTop: 13 }}>
                <Sample />
              </p>
            </div>
            <ul className={styles.unresolved}>
              {[
                ["F1 · RELIABILITY", "A retry after a provider timeout can issue a second discount code."],
                ["F2 · MISSING TESTS", "Provider timeout, 5xx, malformed and empty responses have no explicit test."],
                ["F3 · API CONTRACT", "Clients have no stable shape to distinguish a retryable failure from a permanent one."],
              ].map(([label, text], index) => (
                <li key={label} data-reveal style={step(index)}>
                  <span>{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --------------------------------------------- 4 · EVIDENCE CHAIN */}
        <section
          id="how-it-works"
          className={`${styles.shell} ${styles.section}`}
          data-motion-section="chain"
          aria-labelledby="chain-title"
        >
          <Coordinate section="02" of="How it works" note="Change → Human Decision" />
          <div className={styles.chainHeader}>
            <h2 id="chain-title" className={styles.heading} data-reveal style={step(0)}>
              One record, five stages.
            </h2>
            <p className={styles.body} data-reveal style={step(1)}>
              Lintel does not produce a stream of remarks. It produces one structure in which every finding carries its
              proof, everything unproved becomes an explicit condition, and the last stage belongs to a person.
            </p>
          </div>

          <div className={styles.chainRegisterHead}>
            <p className={styles.micro}>The same record, carried through every stage</p>
            <Sample />
          </div>

          <div className={styles.chain}>
            <div className={styles.fieldGrid} aria-hidden="true" />
            <div className={styles.chainLine} aria-hidden="true" />
            <ol className={styles.chainStations}>
              {LANDING_CHAIN.map((stage, index) => (
                <li
                  key={stage.id}
                  className={`${styles.station} ${index === LANDING_CHAIN.length - 1 ? styles.stationLast : ""}`}
                  data-reveal
                  style={step(index)}
                >
                  <span className={styles.stationIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.stationMark} aria-hidden="true" />
                  <h3 className={styles.stationName}>{stage.label}</h3>
                  <p className={styles.stationDef}>{stage.definition}</p>
                  <div className={styles.stationRecord} style={{ "--lnd-edge": EDGE[stage.exampleTone] } as CSSProperties}>
                    <span className={styles.stationRecordId}>{stage.exampleId}</span>
                    <p className={styles.stationRecordTitle}>{stage.exampleTitle}</p>
                    <p className={styles.stationRecordState}>
                      <Chip tone={stage.exampleTone}>{stage.exampleState}</Chip>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.chainBridge}>
            <p className={styles.body}>That is the model. The next section is the instrument — you drive it.</p>
            <a className={styles.textLink} href="#product">
              Open the product ↓
            </a>
          </div>
        </section>

        {/* ------------------------------------- 5 · INTERACTIVE PRODUCT THEATRE
            The page's only full-width dark band. */}
        <section id="product" className={styles.theatre} aria-labelledby="theatre-title">
          <div className={styles.theatreGround} aria-hidden="true" />
          <div className={styles.theatreInner}>
            <div className={styles.theatreCopy}>
              <p className={`${styles.micro} ${styles.theatreEyebrow}`}>Product</p>
              <h2 id="theatre-title" className={styles.theatreHeading}>
                Drive one verification record.
              </h2>
              <p className={styles.theatreLede}>
                Change the scenario. Move along the chain. Every stage holds real product structure — findings,
                evidence classes, requirement states, and a decision that stays pending.
              </p>
              <p className={styles.theatreBoundary}>
                This is a landing demonstration built on sample data. It does not read or write review history, and it
                offers no control that would merge, approve, block or record a decision.
              </p>
            </div>
            <LandingTheatre scenarios={LANDING_SCENARIOS} />
          </div>
        </section>

        {/* -------------------------------------------- 6 · REVIEW EVOLUTION */}
        <section
          className={`${styles.shell} ${styles.section}`}
          data-motion-section="evolution"
          aria-labelledby="evolution-title"
        >
          <Coordinate section="03" of="Review evolution" note="acme/redemption-api · #482" />
          <div className={styles.evoHeader}>
            <h2 id="evolution-title" className={styles.heading} data-reveal style={step(0)}>
              The next run changes the record, not just the score.
            </h2>
            <p className={styles.body} data-reveal style={step(1)}>
              A review is not a one-off opinion. When the change moves, the record is re-read and you can see exactly
              what moved — including proof that no longer applies.
            </p>
          </div>
          <div data-reveal style={step(2)}>
            <LandingEvolution
              previous={LANDING_EVOLUTION.previous}
              current={LANDING_EVOLUTION.current}
              movements={LANDING_EVOLUTION.movements}
              headNote={LANDING_EVOLUTION.headNote}
            />
          </div>
        </section>

        {/* -------------------------- 7 · RECOMMENDATION VS HUMAN DECISION */}
        <section
          id="principles"
          className={`${styles.shell} ${styles.sectionMajor}`}
          data-motion-section="authority"
          aria-labelledby="authority-title"
        >
          <Coordinate section="04" of="Principles" note="Where analysis ends" />
          <div className={styles.rvdIntro}>
            <h2 id="authority-title" className={`${styles.editorial} ${styles.rvdStatement}`} data-reveal style={step(0)}>
              <span>Lintel recommends.</span>
              <span>The engineer decides.</span>
            </h2>
            <p className={styles.body} data-reveal style={step(1)}>
              These are two different kinds of record, and the page refuses to draw them as equals. One is analysis.
              The other is accountability, and it is authored by a person who is answerable for it.
            </p>
          </div>

          <div className={styles.rvdColumns}>
            {/* Denser, technical, mono-heavy. */}
            <section className={styles.rvdSide} aria-labelledby="recommendation-title" data-reveal style={step(0)}>
              <header className={styles.rvdSideHead}>
                <h3 id="recommendation-title" className={styles.rvdSideName}>
                  Lintel recommendation
                </h3>
                <Chip tone={LANDING_RECOMMENDATION_STATE.tone}>{LANDING_RECOMMENDATION_STATE.label}</Chip>
              </header>
              <div className={styles.rvdDense}>
                {LANDING_RECOMMENDATION_ENTRIES.map((entry, index) => (
                  <div key={`${entry.id}-${index}`} className={styles.rvdEntry}>
                    <span className={styles.rvdEntryId}>{entry.id}</span>
                    <span className={styles.rvdEntryLabel}>{entry.label}</span>
                    <span className={styles.rvdEntryValue}>{entry.value}</span>
                  </div>
                ))}
              </div>
              <ul className={styles.rvdLimits}>
                <li>A recommendation is not an approval and carries no authority.</li>
                <li>Lintel does not run tests, enforce policy or gate a merge.</li>
                <li>Exact reproduction of optional model output is not claimed.</li>
                <li>Requirements clear when a person supplies proof — never by Lintel.</li>
              </ul>
              <p className={styles.support} style={{ marginTop: 16 }}>
                <Sample />
              </p>
            </section>

            {/* Calmer, more air, visibly authored. */}
            <section className={styles.rvdSide} aria-labelledby="decision-title" data-reveal style={step(1)}>
              <header className={styles.rvdSideHead}>
                <h3 id="decision-title" className={styles.rvdSideName}>
                  Human Decision
                </h3>
                <Chip tone="neutral">PENDING</Chip>
              </header>
              <div className={styles.rvdAuthored}>
                <div className={styles.rvdField}>
                  <span className={styles.rvdFieldLabel}>Decision</span>
                  <p className={styles.rvdPending}>No engineer decision recorded</p>
                </div>
                <div className={styles.rvdField}>
                  <span className={styles.rvdFieldLabel}>Rationale</span>
                  <p className={styles.rvdFieldValue} style={{ color: "var(--lnd-ink-3)" }}>
                    Written by the person who decides, in their words.
                  </p>
                </div>
                <div className={styles.rvdField}>
                  <span className={styles.rvdFieldLabel}>Accepted risk</span>
                  <p className={styles.rvdFieldValue} style={{ color: "var(--lnd-ink-3)" }}>
                    Explicit, referenced, and never inferred from a recommendation.
                  </p>
                </div>
                <div className={styles.rvdField}>
                  <span className={styles.rvdFieldLabel}>Applicability</span>
                  <p className={styles.rvdFieldValue} style={{ color: "var(--lnd-ink-3)" }}>
                    Tied to the exact commit, where the head is available. It can go stale as the change moves on.
                  </p>
                </div>
              </div>

              <div className={styles.rvdRecorded}>
                <div className={styles.recordHead} style={{ marginBottom: 0 }}>
                  <span className={styles.recordKind}>What a recorded decision contains</span>
                  <Chip tone="neutral">EXAMPLE</Chip>
                </div>
                <dl className={styles.rvdRecordedRows}>
                  {[
                    ["Outcome", "Approve with accepted risk"],
                    ["Actor", "The accountable engineer"],
                    ["Rationale", "Written by that person, in their words."],
                    ["Accepted risk", "An explicit, referenced clause"],
                    ["Recorded", "At the moment the person recorded it"],
                    ["Applies to", "The head commit, where one is available"],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.rvdRecordedRow}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className={styles.support} style={{ marginTop: 14 }}>
                  This is the shape of a recorded decision, not a decision on the pending record above. Lintel never
                  authors one.
                </p>
              </div>

              <p className={`${styles.support} ${styles.rvdNote}`}>
                A decision can later be reaffirmed, superseded or withdrawn. Lintel records that lineage; it never
                authors it.
              </p>
            </section>
          </div>
        </section>

        {/* --------------------------------------------- 8 · GITHUB WORKFLOW */}
        <section
          id="github"
          className={`${styles.shell} ${styles.section}`}
          data-motion-section="github"
          aria-labelledby="github-title"
        >
          <Coordinate section="05" of="GitHub" />
          <div className={styles.flowHeader}>
            <h2 id="github-title" className={styles.heading} data-reveal style={step(0)}>
              A pull request goes in. One updated decision comment comes out.
            </h2>
            <p className={styles.body} data-reveal style={step(1)}>
              The whole integration resolves to a single comment per pull request, rewritten in place as the change
              moves — never a thread that grows every time analysis runs.
            </p>
          </div>

          <div className={styles.flowScene}>
            <div>
              <ol className={styles.flowSteps}>
                {LANDING_WORKFLOW_STEPS.map((item, index) => (
                  <li
                    key={item.id}
                    className={`${styles.flowStep} ${index === LANDING_WORKFLOW_STEPS.length - 1 ? styles.flowStepLast : ""}`}
                    data-reveal
                    style={step(index)}
                  >
                    <div className={styles.flowStepHead}>
                      <span className={styles.flowIndex}>{item.id}</span>
                      <h3 className={styles.flowLabel}>{item.label}</h3>
                    </div>
                    <p className={styles.flowDetail}>{item.detail}</p>
                  </li>
                ))}
              </ol>

              <p className={styles.flowCapabilities} data-reveal style={step(0)}>
                {LANDING_WORKFLOW_CAPABILITIES.join("  ·  ")}
              </p>
              <p className={styles.flowNote} data-reveal style={step(1)}>
                {LANDING_WORKFLOW_BOUNDARY}
              </p>
            </div>

            <div data-reveal style={step(1)}>
              <div className={styles.wellDark}>
                <div className={styles.wellDarkHead}>
                  <span>Webhook verification</span>
                  <span>raw body · timing-safe</span>
                </div>
                <div className={styles.wellDarkBody}>
                  <div>
                    <em>POST</em> /api/github-app/webhook
                  </div>
                  <div>
                    <em>x-github-event:</em> pull_request
                  </div>
                  <div>
                    <em>x-hub-signature-256:</em> sha256=<b>…</b>
                  </div>
                  <div>
                    <em>verify:</em> <b>HMAC SHA-256 over the raw body</b>
                  </div>
                  <div>
                    <em>compare:</em> <b>timing-safe</b>
                  </div>
                </div>
              </div>

              <div className={styles.comment}>
                <div className={styles.commentHead}>
                  <span className={styles.commentAvatar} aria-hidden="true" />
                  <span className={styles.commentAuthor}>Lintel</span>
                  <span className={styles.commentEdited}>updated in place · one comment per pull request</span>
                  <span className={styles.sample} style={{ marginLeft: "auto" }}>
                    Sample
                  </span>
                </div>
                <div className={styles.commentBody}>
                  <p className={styles.commentTitle}>Lintel recommends: {LANDING_COMMENT.recommendation}</p>
                  <p className={styles.commentRow}>
                    {LANDING_COMMENT.meta.map((entry, index) => (
                      <span key={entry}>
                        {index > 0 ? <span aria-hidden="true">· </span> : null}
                        {entry}
                      </span>
                    ))}
                  </p>
                  <ul className={styles.commentList}>
                    {LANDING_COMMENT.clauses.map((clause) => (
                      <li key={clause.id}>
                        <code>{clause.id}</code>
                        <span>{clause.statement}</span>
                      </li>
                    ))}
                  </ul>
                  <p className={styles.commentFoot}>
                    No engineer decision recorded. Lintel does not merge, block or approve this pull request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------- 9 · TRUST AND ARCHITECTURE */}
        <section className={`${styles.shell} ${styles.section}`} data-motion-section="trust" aria-labelledby="trust-title">
          <Coordinate section="06" of="Trust and architecture" />
          <h2 id="trust-title" className={styles.heading} data-reveal style={step(0)}>
            Deterministic first, model optional, results traceable, boundaries explicit.
          </h2>

          <ol className={styles.principles}>
            {LANDING_TRUST_PRINCIPLES.map((principle, index) => (
              <li key={principle.id} className={styles.principle} data-reveal style={step(index)}>
                <span className={styles.principleIndex}>{principle.id}</span>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <div className={styles.principleBody}>
                  <p style={{ color: "var(--lnd-ink)" }}>{principle.lead}</p>
                  <p className={styles.support}>{principle.note}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.principleFoot}>
            <p className={styles.micro}>Provenance appears on every finding</p>
            <div className={styles.provChips}>
              <Chip tone="info">RULE DETECTED</Chip>
              <Chip tone="provenance">MODEL ASSISTED</Chip>
              <Chip tone="warning">MISSING · UNVERIFIED</Chip>
              <Chip tone="neutral">INFERRED</Chip>
            </div>
          </div>
        </section>

        {/* ------------------------------------------ 10 · WHO LINTEL IS FOR */}
        <section
          className={`${styles.shell} ${styles.sectionTight}`}
          data-motion-section="audience"
          aria-labelledby="audience-title"
        >
          <Coordinate section="07" of="Who Lintel is for" />
          <h2 id="audience-title" className={styles.heading} data-reveal style={step(0)}>
            For the engineers answerable for what merges.
          </h2>
          <ul className={styles.audienceRegister}>
            {LANDING_AUDIENCE.map((line, index) => (
              <li key={line} className={styles.audienceItem} data-reveal style={step(index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{line}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------- 11 · FINAL CTA */}
        <section className={`${styles.shell} ${styles.final}`} data-motion-section="final" aria-labelledby="final-title">
          <h2 id="final-title" className={`${styles.display} ${styles.finalStatement}`} data-reveal style={step(0)}>
            <span>Move from generated code</span>
            <span>to an accountable merge decision.</span>
          </h2>
          <p className={`${styles.lede} ${styles.finalLede}`} data-reveal style={step(1)}>
            Bring one pull request into Lintel and inspect what changed, what evidence exists, what proof is missing,
            and what must happen next.
          </p>
          <div className={`${styles.actions} ${styles.finalActions}`} data-reveal style={step(2)}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href={REVIEW_HREF}>
              Review a pull request
            </Link>
            <Link className={`${styles.btn} ${styles.btnSecondary}`} href={WORKSPACE_HREF}>
              Explore the sample Workspace
            </Link>
          </div>
        </section>
      </main>

      {/* ------------------------------------------ 12 · ILLUSTRATED FOOTER */}
      <footer className={`${styles.shellWide} ${styles.footer}`}>
        <div className={styles.footerTop}>
          <div>
            <span className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true" />
              <span>Lintel</span>
            </span>
            <p className={styles.footerBrandLine}>
              Engineering verification for pull requests. Lintel recommends; the accountable engineer decides.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h2>Product</h2>
            <Link href={REVIEW_HREF}>Review a pull request</Link>
            <Link href={WORKSPACE_HREF}>Sample Workspace</Link>
          </div>
          <div className={styles.footerCol}>
            <h2>Reference</h2>
            <a href="#how-it-works">How it works</a>
            <a href="#principles">Principles</a>
            <a href="#github">GitHub</a>
          </div>
          <div className={styles.footerAction}>
            <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} href={REVIEW_HREF}>
              Review a pull request
            </Link>
          </div>
        </div>

        <div className={styles.footerScene}>
          <FooterSceneWide />
          <FooterSceneNarrow />
        </div>

        <div className={styles.footerBase}>
          <span>© Lintel</span>
          <span>Review history is stored on your device by default.</span>
          <span className={styles.monoMicro}>Lintel does not replace human review, CI, tests or security review.</span>
        </div>
      </footer>
    </LandingMotion>
  );
}
