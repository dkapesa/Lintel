import type { Metadata } from "next";
import Link from "next/link";
import { report } from "../../../lib/mock-report";
import { ThemeControl } from "../../theme-provider";
import styles from "./typography-proof.module.css";

export const metadata: Metadata = {
  title: "LVOS typography proof — Lintel",
  description: "Internal LVOS v1.0 typography proof for Lintel.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const finding = report.findings[0];
const blockingClause = report.conditionsBeforeMerge[0];

function Technical({ children }: { children: React.ReactNode }) {
  return <span className={styles.technical}>{children}</span>;
}

function SpecimenHeader({
  number,
  title,
  description,
  id,
}: {
  number: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <header className={styles.specimenHeader}>
      <span className={styles.specimenNumber}>Specimen {number}</span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

export default function TypographyProofPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#typography-proof-content">Skip to typography proof</a>

      <header className={styles.proofBar}>
        <div className={styles.proofIdentity}>
          <span className={styles.proofMark} aria-hidden="true">L</span>
          <div>
            <strong>Lintel</strong>
            <span>LVOS internal proof · not a product route</span>
          </div>
        </div>
        <ThemeControl />
      </header>

      <main id="typography-proof-content" className={styles.main}>
        <header className={styles.introduction}>
          <span className={styles.eyebrow}>LVOS 1 · typography system</span>
          <h1>Typography before containers</h1>
          <p>
            One controlled proof of the hierarchy used to operate verification work,
            read technical evidence and present Lintel publicly. No live route adopts
            these roles in this milestone.
          </p>
          <dl className={styles.proofFacts}>
            <div><dt>Application</dt><dd>Geist Sans</dd></div>
            <div><dt>Technical</dt><dd>Geist Mono</dd></div>
            <div><dt>Public narrative</dt><dd>Newsreader</dd></div>
            <div><dt>Review status</dt><dd>Approved</dd></div>
          </dl>
        </header>

        <section className={styles.specimen} aria-labelledby="specimen-shell-title">
          <SpecimenHeader
            number="01"
            id="specimen-shell-title"
            title="Application shell typography"
            description="Tests destination, contextual navigation, breadcrumb, object and command roles without implementing the LVOS-2 shell."
          />
          <div className={styles.shellProof} aria-label="Static application shell typography excerpt">
            <div className={styles.shellRail}>
              <span className={styles.railMark} aria-hidden="true">L</span>
              <div className={styles.railDestination}>
                <span className={styles.railGlyph} aria-hidden="true">W</span>
                <strong>Workspace</strong>
              </div>
              <span className={styles.railGlyph} aria-hidden="true">R</span>
              <span className={styles.railGlyph} aria-hidden="true">O</span>
            </div>
            <div className={styles.contextNavigation}>
              <span className={styles.microLabel}>Review work</span>
              <div className={styles.contextRowActive}>
                <span>Risk Inbox</span>
                <Technical>06</Technical>
              </div>
              <div className={styles.contextRow}>
                <span>Assigned to me</span>
                <Technical>02</Technical>
              </div>
              <div className={styles.contextRow}>
                <span>Recent reviews</span>
              </div>
            </div>
            <div className={styles.shellWorkingSurface}>
              <div className={styles.commandBar}>
                <div className={styles.breadcrumb}>
                  <span>Workspace</span>
                  <span aria-hidden="true">/</span>
                  <strong>Risk Inbox</strong>
                </div>
                <span className={styles.commandText}>Search or run a command</span>
                <Technical>⌘ K</Technical>
                <span className={styles.commandAction}>Check pull request</span>
              </div>
              <div className={styles.shellCanvas}>
                <span className={styles.microLabel}>Current object</span>
                <h3>Verification queue</h3>
                <p>Changes waiting for proof, requirements or a recorded engineer decision.</p>
              </div>
            </div>
          </div>
          <p className={styles.annotation}>
            <strong>Roles:</strong> micro-label, record title, secondary/support and technical metadata. Placement and rules carry the hierarchy; weight remains at or below 600.
          </p>
        </section>

        <section className={styles.specimen} aria-labelledby="specimen-queue-title">
          <SpecimenHeader
            number="02"
            id="specimen-queue-title"
            title="Workspace queue record"
            description="Tests aligned operational density, long and short identities, selection, counts and unavailable ownership."
          />
          <div className={styles.queue} role="table" aria-label="Static verification queue records">
            <div className={styles.queueHeader} role="row">
              <span role="columnheader">State</span>
              <span role="columnheader">Pull request</span>
              <span role="columnheader">Recommendation</span>
              <span role="columnheader">Open</span>
              <span role="columnheader">Owner</span>
              <span role="columnheader">Updated</span>
            </div>
            <div className={`${styles.queueRow} ${styles.queueRowSelected}`} role="row" aria-selected="true">
              <span role="cell"><span className={styles.statusChip}>Needs proof</span></span>
              <div className={styles.queueIdentity} role="cell">
                <span><Technical>{report.pr.repository} · #{report.pr.number}</Technical></span>
                <strong>{report.pr.title}</strong>
              </div>
              <div className={styles.queueRecommendation} role="cell">
                <strong>Tests required</strong>
                <span>Retry path remains unproven</span>
              </div>
              <span role="cell" className={styles.tabular}>04</span>
              <span role="cell">Maya Chen</span>
              <span role="cell"><Technical>10:42</Technical></span>
            </div>
            <div className={styles.queueRow} role="row">
              <span role="cell"><span className={styles.stateText}>Unavailable</span></span>
              <div className={styles.queueIdentity} role="cell">
                <span><Technical>Lintel</Technical> · PR unavailable</span>
                <strong>Provider metadata unavailable</strong>
              </div>
              <div className={`${styles.queueRecommendation} ${styles.queueRecommendationNeutral}`} role="cell">
                <strong>Not evaluated</strong>
                <span>No report metadata was returned</span>
              </div>
              <span role="cell" className={styles.tabular}>—</span>
              <span role="cell" className={styles.mutedValue}>Unassigned</span>
              <span role="cell" className={styles.mutedValue}>Unavailable</span>
            </div>
          </div>
          <p className={styles.annotation}>
            <strong>Roles:</strong> one status chip, record-title emphasis, 12px support copy and tabular technical values. The selected rule is stronger than the selected text weight.
          </p>
        </section>

        <section className={styles.specimen} aria-labelledby="specimen-inspector-title">
          <SpecimenHeader
            number="03"
            id="specimen-inspector-title"
            title="Selected-case inspector"
            description="Tests a 390px information plane with short reading measures and the approved decision hierarchy."
          />
          <div className={styles.inspectorStage}>
            <div className={styles.inspectorContext}>
              <span className={styles.microLabel}>Inspector measure</span>
              <p>Support copy stays within roughly 35–50 characters so evidence remains readable without turning the inspector into nested cards.</p>
            </div>
            <aside className={styles.inspector} aria-label="Static selected case inspector">
              <header className={styles.inspectorHeader}>
                <Technical>{report.pr.repository} · #{report.pr.number}</Technical>
                <h3>{report.pr.title}</h3>
              </header>
              <ol className={styles.trace} aria-label="Verification trace">
                <li data-state="complete"><span aria-hidden="true">●</span>Change</li>
                <li data-state="complete"><span aria-hidden="true">●</span>Observation</li>
                <li data-state="partial"><span aria-hidden="true">◐</span>Evidence</li>
                <li data-state="open"><span aria-hidden="true">○</span>Requirement</li>
                <li data-state="open"><span aria-hidden="true">◇</span>Human decision</li>
              </ol>
              <section className={styles.inspectorBlock}>
                <span className={styles.microLabel}>Lintel recommendation</span>
                <strong className={styles.recommendationText}>Tests required</strong>
                <p>Held back because one blocking retry-path requirement remains open and its evidence is missing.</p>
              </section>
              <dl className={styles.inspectorDefinitions}>
                <div>
                  <dt>Open requirement</dt>
                  <dd><Technical>C1</Technical> {blockingClause}</dd>
                </div>
                <div>
                  <dt>Missing proof</dt>
                  <dd>{report.missingTests[0]}</dd>
                </div>
                <div>
                  <dt>Next action</dt>
                  <dd>Add an idempotency guard and retry-twice test.</dd>
                </div>
                <div>
                  <dt>Owner · state</dt>
                  <dd>Maya Chen · Engineer decision pending</dd>
                </div>
              </dl>
              <div className={styles.actions}>
                <Link className={styles.primaryAction} href="/report">Open Case File</Link>
                <button className={styles.secondaryAction} type="button" disabled title="Static typography proof">Copy conditions</button>
              </div>
            </aside>
          </div>
          <p className={styles.annotation}>
            <strong>Roles:</strong> record title, verification micro-label, primary body and mono references. The because-clause is a sentence, not a cluster of badges.
          </p>
        </section>

        <section className={styles.specimen} aria-labelledby="specimen-finding-title">
          <SpecimenHeader
            number="04"
            id="specimen-finding-title"
            title="Finding and evidence record"
            description="Tests dossier reading measure and the direct relationship from claim to evidence, requirement and action."
          />
          <article className={styles.findingRecord}>
            <div className={styles.recordReference}><Technical>F1</Technical></div>
            <div className={styles.findingBody}>
              <header className={styles.findingHeader}>
                <div>
                  <span className={styles.severity}>High severity</span>
                  <h3>{finding.title}</h3>
                </div>
                <span className={styles.provenance}>{finding.provenance}</span>
              </header>
              <p className={styles.documentCopy}>{finding.evidence}</p>
              <div className={styles.evidenceAttachment}>
                <div className={styles.attachmentHeader}>
                  <Technical>E1</Technical>
                  <span>Attached evidence</span>
                </div>
                <p>{report.changedFiles[0].path} adds retry handling without a confirmed idempotency boundary around the repeated redemption attempt.</p>
                <span className={styles.technicalPath}>{report.changedFiles[0].path}</span>
              </div>
              <dl className={styles.recordLinks}>
                <div><dt>Related requirement</dt><dd><Technical>C1</Technical> {blockingClause}</dd></div>
                <div><dt>Required action</dt><dd>{finding.action}</dd></div>
              </dl>
            </div>
          </article>
          <p className={styles.annotation}>
            <strong>Roles:</strong> technical references identify records; 13px dossier copy carries the explanation; evidence is attached by alignment and a single rule rather than a separate card.
          </p>
        </section>

        <section className={styles.specimen} aria-labelledby="specimen-contract-title">
          <SpecimenHeader
            number="05"
            id="specimen-contract-title"
            title="Merge Contract clause"
            description="Tests the same clause as a compact ledger row and an expanded blocking requirement."
          />
          <div className={styles.contractComposition}>
            <article className={styles.clauseCollapsed}>
              <span className={styles.microLabel}>Collapsed hierarchy</span>
              <div className={styles.clauseSummary}>
                <Technical>C1</Technical>
                <h3>{blockingClause}</h3>
                <span className={styles.blockingText}>Blocking</span>
                <span className={styles.openText}>Open</span>
              </div>
              <p>Compact supporting metadata: <Technical>F1 · E1</Technical> · owner unavailable</p>
            </article>
            <article className={styles.clauseExpanded}>
              <header>
                <div>
                  <span className={styles.microLabel}>Expanded hierarchy</span>
                  <h3><Technical>C1</Technical> {blockingClause}</h3>
                </div>
                <span className={styles.openState}>Open · blocking</span>
              </header>
              <dl>
                <div><dt>Related records</dt><dd><Technical>F1 · E1</Technical></dd></div>
                <div><dt>Clearance criteria</dt><dd>Show that two consecutive retry attempts cannot issue duplicate discount codes.</dd></div>
                <div><dt>Owner cue</dt><dd>Backend reliability reviewer · unassigned</dd></div>
                <div><dt>Re-check</dt><dd>Not run · evidence unavailable</dd></div>
              </dl>
            </article>
          </div>
          <p className={styles.annotation}>
            <strong>Roles:</strong> compact and expanded states share one ledger grammar. Status words remain explicit; casing and colour support meaning without becoming the hierarchy.
          </p>
        </section>

        <section className={styles.specimen} aria-labelledby="specimen-settings-title">
          <SpecimenHeader
            number="06"
            id="specimen-settings-title"
            title="Administrative settings row"
            description="Tests quiet group hierarchy, explanatory copy, read-only truth and a separated sensitive action."
          />
          <section className={styles.settingsGroup} aria-labelledby="analysis-settings-group-title">
            <header>
              <div>
                <h3 id="analysis-settings-group-title">Analysis and data handling</h3>
                <p>Lintel creates a deterministic baseline before any optional model-assisted synthesis.</p>
              </div>
              <span className={styles.readOnlyState}>Read-only proof</span>
            </header>
            <div className={styles.settingRows}>
              <div className={styles.settingRow}>
                <div><strong>Deterministic analysis</strong><p>Runs through Lintel’s local rule baseline without an external model call.</p></div>
                <span className={styles.settingValue}>Available</span>
              </div>
              <div className={styles.settingRow}>
                <div><strong>Model-assisted analysis</strong><p>Optional synthesis follows the baseline only when a provider is configured.</p></div>
                <span className={styles.settingValue}>Environment controlled</span>
              </div>
              <div className={styles.settingRow}>
                <div><strong>Raw diff retention</strong><p>Raw diffs are not saved in local report history.</p></div>
                <span className={styles.settingValue}>Not retained</span>
              </div>
              <div className={`${styles.settingRow} ${styles.settingRowUnavailable}`}>
                <div><strong>Bring-your-own provider</strong><p>No provider account or key can be configured on this prototype surface.</p></div>
                <span className={styles.settingValue}>Unavailable</span>
              </div>
              <div className={`${styles.settingRow} ${styles.settingRowSensitive}`}>
                <div><strong>Clear local report history</strong><p>Destructive controls remain visually separate from analysis choices.</p></div>
                <button type="button" disabled title="Static typography proof">Clear history</button>
              </div>
            </div>
          </section>
          <p className={styles.annotation}>
            <strong>Roles:</strong> 14px group heading, 13px row labels, 12px support copy and sentence-case action text. Unavailable state is written, not encoded by opacity alone.
          </p>
        </section>

        <section className={`${styles.specimen} ${styles.websiteSpecimen}`} aria-labelledby="specimen-website-title">
          <SpecimenHeader
            number="07"
            id="specimen-website-title"
            title="Website hero"
            description="Tests the single approved serif role beside public sans copy and a small application excerpt."
          />
          <div className={styles.websiteHero}>
            <div className={styles.websiteNarrative}>
              <span className={styles.websiteEyebrow}>Engineering verification</span>
              <h3 className={styles.websiteHeadline}>Agents create code.<br />Lintel verifies what is ready.</h3>
              <p className={styles.websiteLede}>Turn a pull request into inspectable evidence, explicit requirements and a recorded human decision.</p>
              <div className={styles.websiteActions}>
                <Link className={styles.primaryAction} href="/new">Check a pull request</Link>
                <Link className={styles.secondaryLink} href="/report">View the sample report</Link>
              </div>
            </div>
            <article className={styles.websiteProductExcerpt} aria-label="Small Lintel product excerpt">
              <header>
                <div>
                  <span className={styles.microLabel}>Selected verification case</span>
                  <h4>{report.pr.title}</h4>
                </div>
                <Technical>run_2026-07-15_1042</Technical>
              </header>
              <div className={styles.productExcerptRecommendation}>
                <span>Lintel recommendation</span>
                <strong>Tests required</strong>
                <p>Held back by <span className={styles.tabular}>01</span> open blocking requirement and missing retry-path proof.</p>
              </div>
              <div className={styles.productExcerptClause}>
                <Technical>C1</Technical>
                <span>{blockingClause}</span>
                <strong>Open</strong>
              </div>
            </article>
          </div>
          <p className={styles.annotation}>
            <strong>Roles:</strong> Newsreader appears only in the public headline. The eyebrow, lede, actions and embedded product proof remain in Geist Sans; identifiers remain in Geist Mono.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>LVOS v1.0 · retained visual-QA reference through LVOS-7</span>
        <span>Migration decision: staged adoption approved</span>
      </footer>
    </div>
  );
}
