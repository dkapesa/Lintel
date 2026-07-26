import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./landing/landing.module.css";
import LandingMotion from "./landing-motion";
import LandingNav from "./landing-nav";
import Act from "./landing/landing-act";
import LandingEvolution from "./landing/landing-evolution";
import LandingTheatre from "./landing/landing-theatre";
import { FooterSceneNarrow, FooterSceneWide } from "./landing/landing-footer-scene";
import { Chip, Coordinate, CoordinateFoot, EDGE, OperationalHead, Sample, step } from "./landing/landing-primitives";
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

/* R3E.1 — the production landing page, re-authored as five acts.

   Structure: server-rendered apart from three client boundaries — the
   navigation, the motion controller / public root, and the two interactive
   product surfaces (theatre and review evolution). Every product value is
   derived at build time by lib/landing-theatre-fixtures from the canonical
   sample report and the real evidence-hierarchy and merge-contract builders.

   Pacing: the five `Act` wrappers own the page's vertical reserve. Sections
   no longer carry their own symmetric padding, so an act boundary reads as an
   arrival and a section boundary inside an act reads as a continuation.

   Entries: four types, assigned once, never mixed, and no two consecutive
   light sections share one.

     A  artifact arrival    hero, theatre
     B  editorial thesis    verification gap, recommendation vs decision, CTA
     C  structural register five-stage register, trust
     D  operational artifact review evolution, GitHub

   Frozen by R3E.1: the theatre component, the evolution component, the footer
   scene, and every fixture. */

const FRAGMENT_ROLE: Record<LandingFragmentRole, string> = {
  anchor: styles.fragAnchor,
  principal: styles.fragPrincipal,
  support: styles.fragSupport,
  terminal: styles.fragTerminal,
};

const REVIEW_HREF = "/new";
const WORKSPACE_HREF = "/workspace?source=fixture";

/* The provenance vocabulary the page already uses, given a home. This is the
   interim right column of Act V's trust register: real, truthful and useful on
   its own, occupying the geometry R3E.3's canonical run manifest will take. */
const PROVENANCE_VOCABULARY = [
  { label: "RULE DETECTED", tone: "info" as const, gloss: "Produced by the deterministic ruleset." },
  { label: "MODEL ASSISTED", tone: "provenance" as const, gloss: "Enriched by a configured model, where one is configured." },
  { label: "INFERRED", tone: "neutral" as const, gloss: "Read from the shape of the change, not confirmed by a test." },
  { label: "MISSING · UNVERIFIED", tone: "warning" as const, gloss: "No record supports this yet." },
];

export default function LandingPage() {
  return (
    <LandingMotion>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      {/* ---------------------------------------------------- 1 · NAVIGATION */}
      <LandingNav />

      <main id="main">
        {/* ============================================ ACT I — THE PROMISE */}
        <Act n={1}>
          {/* ----------------------------------------- 2 · HERO — entry A
              Preserved verbatim pending R3E.2, which owns the Case File
              plate, the raking-light field and the right-edge bleed. */}
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
        </Act>

        {/* =================================== ACT II — THE VERIFICATION GAP */}
        <Act n={2}>
          {/* --------------------------- 3 · VERIFICATION GAP — entry B
              The statement opens; the coordinate closes. */}
          <section className={styles.shell} data-motion-section="gap" aria-labelledby="gap-title">
            <div className={styles.gapGrid}>
              <h2 id="gap-title" className={`${styles.editorial} ${styles.gapStatement}`} data-reveal style={step(0)}>
                Software can now be created faster than teams can verify it.
              </h2>
              <div className={styles.gapSupport} data-reveal style={step(1)}>
                <p className={styles.body}>
                  A passing build does not show that a change is understood, that the important failure paths were
                  tested, or that the evidence behind it is strong enough to merge.
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

            <CoordinateFoot section="01" of="The verification gap" />
          </section>
        </Act>

        {/* ======================================== ACT III — THE PRODUCT */}
        <Act n={3}>
          {/* ------------------- 4 · FIVE-STAGE REGISTER — entry C
              The evidence-chain section, compressed into one register that
              runs directly into the dark edge. The model is now stated once
              on the page, at the door of the instrument. */}
          <section
            id="how-it-works"
            className={styles.shell}
            data-motion-section="chain"
            aria-labelledby="chain-title"
          >
            <Coordinate section="02" of="How it works" note="Change → Human Decision" />
            <div className={styles.registerHead}>
              <h2 id="chain-title" className={styles.registerTitle} data-reveal style={step(0)}>
                One record, five stages.
              </h2>
              <p className={styles.registerNote} data-reveal style={step(1)}>
                Every finding carries its proof, everything unproved becomes an explicit condition, and the last stage
                belongs to a person. Below, one real record carried through all five.
              </p>
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

            <div className={styles.chainFoot}>
              <Sample />
              <a className={styles.textLink} href="#product">
                Drive this record ↓
              </a>
            </div>
          </section>

          {/* --------------- 5 · INTERACTIVE PRODUCT THEATRE — entry A
              The page's only full-width dark band. Frozen. */}
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
        </Act>

        {/* ============================== ACT IV — ACCOUNTABLE DECISIONS */}
        <Act n={4}>
          {/* --------------------------- 6 · REVIEW EVOLUTION — entry D
              A caption strip, then the artifact. */}
          <section className={styles.shell} data-motion-section="evolution" aria-labelledby="evolution-title">
            <OperationalHead
              coordinate="03"
              label="Review evolution · acme/redemption-api · #482"
              titleId="evolution-title"
              title="The next run changes the record, not just the score."
              note="When the change moves, the record is re-read and you can see exactly what moved — including proof that no longer applies."
            />
            <div data-reveal style={step(0)}>
              <LandingEvolution
                previous={LANDING_EVOLUTION.previous}
                current={LANDING_EVOLUTION.current}
                movements={LANDING_EVOLUTION.movements}
                headNote={LANDING_EVOLUTION.headNote}
              />
            </div>
          </section>

          {/* ------------- 7 · RECOMMENDATION VS HUMAN DECISION — entry B
              The page's moral centre. Kept at full authority. */}
          <section id="principles" className={styles.shell} data-motion-section="authority" aria-labelledby="authority-title">
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
                {/* The model-reproducibility boundary lives in Act V, where it
                    belongs to the trust principles; it is not repeated here. */}
                <ul className={styles.rvdLimits}>
                  <li>A recommendation is not an approval and carries no authority.</li>
                  <li>Lintel does not run tests, enforce policy or gate a merge.</li>
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
                    The shape of a recorded decision, not a decision on the pending record above. Lintel never authors
                    one; it can later be reaffirmed, superseded or withdrawn.
                  </p>
                </div>
              </section>
            </div>

            <CoordinateFoot section="04" of="Principles" note="Where analysis ends" />
          </section>

          {/* --------------------------- 8 · GITHUB WORKFLOW — entry D
              A caption strip, then the stem resolving into one artifact. */}
          <section id="github" className={styles.shell} data-motion-section="github" aria-labelledby="github-title">
            <OperationalHead
              coordinate="05"
              label="GitHub"
              titleId="github-title"
              title="A pull request goes in. One updated decision comment comes out."
              note="The whole integration resolves to a single comment per pull request, rewritten in place as the change moves — never a thread that grows every time analysis runs."
            />

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
                    {/* The decision state travels as data on the artifact rather
                        than as another sentence of prose. */}
                    <p className={styles.commentRow}>
                      {LANDING_COMMENT.meta.map((entry, index) => (
                        <span key={entry}>
                          {index > 0 ? <span aria-hidden="true">· </span> : null}
                          {entry}
                        </span>
                      ))}
                      <Chip tone="neutral">DECISION PENDING</Chip>
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
                      Lintel does not merge, block or approve this pull request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Act>

        {/* ================================ ACT V — TRUST AND ACTION */}
        <Act n={5}>
          {/* --------------------- 9 · TRUST AND ARCHITECTURE — entry C
              Two columns. R3E.3 replaces the right one with the canonical
              run manifest; the geometry is already the one it will occupy. */}
          <section className={styles.shell} data-motion-section="trust" aria-labelledby="trust-title">
            <Coordinate section="06" of="Trust and architecture" />
            <h2 id="trust-title" className={styles.registerTitle} data-reveal style={step(0)}>
              Deterministic first, model optional, results traceable, boundaries explicit.
            </h2>

            <div className={styles.trustGrid}>
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

              <div data-reveal style={step(1)}>
                <p className={styles.micro} style={{ marginBottom: 16 }}>
                  Provenance appears on every finding
                </p>
                <ul className={styles.provenanceRegister}>
                  {PROVENANCE_VOCABULARY.map((entry) => (
                    <li key={entry.label} className={styles.provenanceRow}>
                      <Chip tone={entry.tone}>{entry.label}</Chip>
                      <span className={styles.provenanceGloss}>{entry.gloss}</span>
                    </li>
                  ))}
                </ul>
                <p className={`${styles.support} ${styles.provenanceNote}`}>
                  Deterministic results reproduce run to run. Model-assisted output is traceable by its provenance;
                  exact replay is not promised.
                </p>
              </div>
            </div>
          </section>

          {/* ------------ 10 · FINAL CTA, with the audience folded in — entry B
              The audience is no longer a standalone chapter: it names the
              reader immediately before the ask. */}
          <section className={`${styles.shell} ${styles.final}`} data-motion-section="final" aria-labelledby="final-title">
            <div className={styles.audienceLead} data-reveal style={step(0)}>
              <p className={styles.audienceLeadTitle}>For the engineers answerable for what merges.</p>
              <ul className={styles.audienceRegister}>
                {LANDING_AUDIENCE.map((line) => (
                  <li key={line} className={styles.audienceItem}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.finalStatementBlock}>
              <h2 id="final-title" className={`${styles.display} ${styles.finalStatement}`} data-reveal style={step(1)}>
                <span>Move from generated code</span>
                <span>to an accountable merge decision.</span>
              </h2>
              <p className={`${styles.lede} ${styles.finalLede}`} data-reveal style={step(2)}>
                Bring one pull request into Lintel and inspect what changed, what evidence exists, what proof is
                missing, and what must happen next.
              </p>
              <div className={`${styles.actions} ${styles.finalActions}`} data-reveal style={step(3)}>
                <Link className={`${styles.btn} ${styles.btnPrimary}`} href={REVIEW_HREF}>
                  Review a pull request
                </Link>
                <Link className={`${styles.btn} ${styles.btnSecondary}`} href={WORKSPACE_HREF}>
                  Explore the sample Workspace
                </Link>
              </div>
            </div>
          </section>
        </Act>
      </main>

      {/* ---------------------- 11 · ILLUSTRATED FOOTER — Act V's resolution */}
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
