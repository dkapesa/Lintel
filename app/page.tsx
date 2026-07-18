import Link from "next/link";
import { historicalCanonicalRunManifest } from "../lib/canonical-review-run";
import { buildEvidenceHierarchy } from "../lib/evidence-hierarchy";
import { buildMergeContract } from "../lib/merge-contract";
import { report } from "../lib/mock-report";
import LandingMotion from "./landing-motion";
import LandingNav from "./landing-nav";

const run = historicalCanonicalRunManifest(report, "demo");
const evidence = buildEvidenceHierarchy(report, null, {
  runId: run.runId,
  createdAt: run.completedAt,
});
const contract = buildMergeContract({
  report,
  evidenceHierarchy: evidence,
  canonicalRunId: run.runId,
  sourceType: run.sourceType,
  reviewMode: run.reviewMode,
  createdAt: run.completedAt,
});

const openConditions = report.conditionsBeforeMerge.length;
const openBlockingClauses = contract.clauses.filter(
  (clause) => clause.importance === "blocking" && clause.status === "open",
).length;
const advisoryOpenClauses = contract.clauses.filter(
  (clause) => clause.importance === "advisory" && clause.status === "open",
).length;
const satisfiedClauses = contract.clauses.filter((clause) => clause.status === "satisfied").length;
const finding = report.findings[0];
const findingEvidence = evidence.records.find((record) => record.relatedFindingIds.includes("finding-0"));
const expandedClause = contract.clauses[0];
const collapsedClauses = contract.clauses.slice(1, 3);

const verificationTrace = [
  { label: "Change", detail: "Diff received", state: "satisfied" },
  { label: "Observation", detail: "Behaviour mapped", state: "satisfied" },
  { label: "Evidence", detail: "Proof attached", state: "partial" },
  { label: "Requirement", detail: "Clause remains open", state: "partial" },
  { label: "Human decision", detail: "Engineer accountable", state: "open" },
] as const;

const failureModes = [
  {
    reference: "01",
    title: "A retry can duplicate a redemption.",
    detail: report.operationalReadiness?.failureModes[0] ?? finding.evidence,
  },
  {
    reference: "02",
    title: "Provider failure states remain unproved.",
    detail: report.findings[1].evidence,
  },
  {
    reference: "03",
    title: "The client-facing error contract is unclear.",
    detail: report.findings[2].evidence,
  },
] as const;

const trustRecords = [
  {
    title: "Credentials stay server-side",
    detail: "GitHub credentials are held by the server integration; the browser never receives a token.",
  },
  {
    title: "Diffs are processed transiently",
    detail: "Raw diffs are analysed transiently and are not stored in local report history.",
  },
  {
    title: "Deterministic analysis remains available",
    detail: "The deterministic baseline is the safety floor and deterministic-only mode remains first-class.",
  },
  {
    title: "Findings label their provenance",
    detail: "Every finding exposes its origin, including Rule detected and Model assisted.",
  },
] as const;

function SampleData() {
  return <span className="lp-sample">SAMPLE DATA</span>;
}

function Status({ tone, children }: { tone: "warning" | "danger" | "success" | "info"; children: React.ReactNode }) {
  return <span className={`lp-status lp-status--${tone}`}>{children}</span>;
}

function Trace({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={compact ? "lp-trace lp-trace--compact" : "lp-trace"} aria-label="Verification trace">
      {verificationTrace.map((stage, index) => (
        <li className={`lp-trace-node lp-trace-node--${stage.state}`} key={stage.label}>
          <span className="lp-trace-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <span>{stage.label}</span>
        </li>
      ))}
    </ol>
  );
}

function CaseTraceSegment({ stages, label }: { stages: readonly number[]; label: string }) {
  return (
    <ol className="lp-case-segment" aria-label={label}>
      {stages.map((index) => {
        const stage = verificationTrace[index];
        return (
          <li className={`lp-case-segment-node lp-case-segment-node--${stage.state}`} key={stage.label}>
            <span className="lp-case-segment-mark" aria-hidden="true" />
            <span>{stage.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function CaseCoordinate({ section }: { section: string }) {
  return (
    <div className="lp-case-coordinate" aria-label={`Case coordinate ${section}`}>
      <span>{section}</span>
      <code>#{report.pr.number}</code>
      <code>{run.runId}</code>
    </div>
  );
}

function FrameHeader({ label }: { label: string }) {
  return (
    <div className="lp-frame-header" aria-hidden="true">
      <span>{label}</span>
      <SampleData />
    </div>
  );
}

export default function Home() {
  return (
    <main className="lp">
      <LandingMotion>
      <a className="lp-skip" href="#lp-main">Skip to content</a>
      <LandingNav />

      <div id="lp-main">
        <section className="lp-hero" data-motion-section="hero" aria-labelledby="lp-hero-title">
          <div className="lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">Engineering verification workspace</p>
              <h1 id="lp-hero-title" className="lp-serif">
                Agents create code.<br />
                Lintel verifies what is ready.
              </h1>
              <p className="lp-lede">
                Lintel analyses pull-request changes, connects findings to evidence, and turns missing proof into explicit merge requirements. The final decision remains with the engineer accountable for it.
              </p>
              <div className="lp-actions">
                <Link className="lp-btn lp-btn--primary" href="/new">Check a pull request</Link>
                <Link className="lp-btn lp-btn--secondary" href="/report?demo=1">View the sample report</Link>
              </div>
            </div>

            <div
              id="case-file"
              className="lp-frame lp-frame--hero"
              role="img"
              aria-label={`Sample Lintel Case File for ${report.pr.repository} pull request ${report.pr.number}, ${report.pr.title}. Run ${run.runId}. The verification trace shows change and observation satisfied, evidence and requirement partial, and human decision open. Lintel recommends tests required with medium risk ${report.verdict.riskScore} out of 100, ${openBlockingClauses} blocking requirements open, and ${openConditions} report conditions open. Finding F1 is linked to evidence E1 and open blocking Merge Contract clause C1. The human engineer decision is pending.`}
            >
              <FrameHeader label="Case File / verification dossier" />
              <div className="lp-case-body" aria-hidden="true">
                <aside className="lp-case-outline">
                  <span className="lp-ui-label">Case File</span>
                  <span><code>01</code> What changed</span>
                  <span><code>02</code> What Lintel observed</span>
                  <span><code>03</code> Uncertain or missing</span>
                  <span><code>04</code> Merge Contract</span>
                  <span><code>05</code> Human decision</span>
                </aside>
                <div className="lp-case-main">
              <div className="lp-case-identity">
                <div>
                  <span className="lp-ui-label">Report identity</span>
                  <code>{run.runId}</code>
                </div>
                <div className="lp-case-number">
                  <span className="lp-ui-label">Pull request</span>
                  <strong>#{report.pr.number}</strong>
                </div>
              </div>
              <div className="lp-case-title">
                <code>{report.pr.repository}</code>
                <h2>{report.pr.title}</h2>
                <span>{report.pr.branch}</span>
              </div>
              <Trace compact />
              <div className="lp-case-verdict">
                <div>
                  <span className="lp-ui-label">Lintel recommendation</span>
                  <Status tone="warning">TESTS REQUIRED</Status>
                </div>
                <dl>
                  <div><dt>Risk record</dt><dd><strong>{report.verdict.riskScore}</strong><span>/100 · {report.verdict.riskLevel}</span></dd></div>
                  <div><dt>Requirements</dt><dd><strong>{openBlockingClauses}</strong><span>blocking open</span></dd></div>
                  <div><dt>Conditions</dt><dd><strong>{openConditions}</strong><span>open</span></dd></div>
                </dl>
              </div>
              <div className="lp-hero-records">
                <article className="lp-hero-finding">
                  <header>
                    <code>F1</code>
                    <div><strong>{finding.title}</strong><span>{finding.category} · {finding.provenance}</span></div>
                  </header>
                  <p>{finding.evidence}</p>
                  <div className="lp-hero-evidence">
                    <code>E1</code>
                    <div><strong>{findingEvidence?.title}</strong><span>{findingEvidence?.statement}</span></div>
                  </div>
                </article>
                <aside className="lp-hero-decision">
                  <div className="lp-hero-clause"><code>C1</code><span>OPEN · BLOCKING</span><strong>{expandedClause.statement}</strong></div>
                  <div className="lp-hero-pending"><span className="lp-ui-label">Human decision</span><strong>Pending engineer decision</strong><p>Open proof and requirements remain.</p></div>
                </aside>
              </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-problem lp-case-movement lp-case-movement--readiness" data-motion-section="readiness" aria-labelledby="lp-problem-title">
          <div className="lp-movement-spine" aria-hidden="true">
            <CaseCoordinate section="01 / readiness" />
            <CaseTraceSegment stages={[0, 1]} label="Readiness trace: change to observation" />
          </div>
          <div className="lp-problem-copy">
            <p className="lp-eyebrow">The readiness gap</p>
            <h2 id="lp-problem-title">CI green does not mean the change is ready.</h2>
            <p>
              A passing pipeline can still leave retry behaviour, failure handling and client contracts unverified. Lintel keeps those gaps as explicit records.
            </p>
          </div>
          <div className="lp-readiness-diagnostic">
            <div className="lp-readiness-context" data-motion-focus="ci">
              <span className="lp-ui-label">Pipeline record</span>
              <strong>CI passed</strong>
              <p>Merge readiness remains unresolved.</p>
            </div>
            <ol className="lp-failures" data-motion-focus="observations">
              {failureModes.map((mode) => (
                <li key={mode.reference}>
                  <code>{mode.reference}</code>
                  <div><h3>{mode.title}</h3><p>{mode.detail}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-exhibit lp-exhibit--finding lp-case-movement" data-motion-section="finding" aria-labelledby="lp-finding-title">
          <div className="lp-exhibit-copy">
            <div className="lp-movement-heading-record">
              <CaseCoordinate section="02 / finding" />
              <CaseTraceSegment stages={[1, 2]} label="Finding trace: observation to evidence" />
            </div>
            <p className="lp-eyebrow">Exhibit I · Finding and evidence</p>
            <h2 id="lp-finding-title">A finding is only useful when the proof travels with it.</h2>
            <p>
              The ledger binds the observed risk to its provenance, supporting record, related condition and required action.
            </p>
          </div>
          <div
            className="lp-frame lp-frame--finding"
            role="img"
            aria-label={`Sample finding F1, high severity: ${finding.title} Reliability, rule detected. Supporting evidence E1 says ${findingEvidence?.statement}. Related condition: ${report.conditionsBeforeMerge[0]}. Required action: ${finding.action}. The evidence register contains ${evidence.records.length} records.`}
          >
            <FrameHeader label="Finding record / F1" />
            <article className="lp-finding-record" data-motion-focus="finding" aria-hidden="true">
              <header>
                <code>F1</code>
                <Status tone="danger">{finding.severity}</Status>
                <div><h3>{finding.title}</h3><span>{finding.category} · {finding.provenance}</span></div>
              </header>
              <p className="lp-finding-explanation">{finding.evidence}</p>
              <div className="lp-evidence-record" data-motion-focus="evidence">
                <div><code>E1</code><strong>{findingEvidence?.title}</strong><Status tone="info">DIRECTLY OBSERVED</Status></div>
                <p>{findingEvidence?.statement}</p>
                <small>{findingEvidence?.source} · {findingEvidence?.provenance} · <code>{findingEvidence?.evidenceId}</code></small>
              </div>
              <dl className="lp-record-links">
                <div><dt>Related requirement</dt><dd><code>C1 · OPEN · BLOCKING</code><span>{report.conditionsBeforeMerge[0]}</span></dd></div>
                <div><dt>Required action</dt><dd>{finding.action}</dd></div>
              </dl>
              <p className="lp-register-count">
                Evidence register <strong>{evidence.records.length} records</strong> · {evidence.countsByClass["directly-observed"]} directly observed · {evidence.countsByClass.unknown} unknown
              </p>
            </article>
          </div>
        </section>

        <section className="lp-exhibit lp-exhibit--contract lp-case-movement" data-motion-section="contract" aria-labelledby="lp-contract-title">
          <div
            className="lp-frame lp-frame--contract"
            role="img"
            aria-label={`Sample Merge Contract ${contract.contractId}, open. ${openBlockingClauses} blocking clauses open, ${advisoryOpenClauses} advisory open, ${satisfiedClauses} satisfied. Clause C1 is open and blocking: ${expandedClause.statement}. It clears with ${expandedClause.evidenceRequired}. Related records E1, E3 and A2. Clauses C2 and C3 are shown collapsed.`}
          >
            <FrameHeader label="Evidence-backed Merge Contract" />
            <div className="lp-contract-summary" aria-hidden="true">
              <div><span className="lp-ui-label">Contract identity</span><code>{contract.contractId}</code></div>
              <div className="lp-contract-trace"><CaseTraceSegment stages={[2, 3]} label="Contract trace: evidence to requirement" /></div>
              <dl>
                <div><dt>Blocking open</dt><dd>{openBlockingClauses}</dd></div>
                <div><dt>Advisory open</dt><dd>{advisoryOpenClauses}</dd></div>
                <div><dt>Satisfied</dt><dd>{satisfiedClauses}</dd></div>
              </dl>
            </div>
            <article className="lp-clause lp-clause--expanded" data-motion-focus="clause" aria-hidden="true">
              <header><code>C1</code><strong>{expandedClause.statement}</strong><Status tone="warning">OPEN · BLOCKING</Status></header>
              <p>{expandedClause.rationale}</p>
              <dl>
                <div><dt>Clears with</dt><dd>{expandedClause.evidenceRequired}</dd></div>
                <div><dt>Current evidence</dt><dd><code>E1</code> · DIRECTLY OBSERVED</dd></div>
                <div><dt>Related records</dt><dd><code>E1, E3, A2</code></dd></div>
                <div><dt>Owner cue</dt><dd>{expandedClause.ownerCue}</dd></div>
              </dl>
            </article>
            <div className="lp-collapsed-clauses" aria-hidden="true">
              {collapsedClauses.map((clause, index) => (
                <div key={clause.clauseId}><code>C{index + 2}</code><strong>{clause.statement}</strong><span>OPEN</span></div>
              ))}
            </div>
          </div>
          <div className="lp-exhibit-copy">
            <div className="lp-movement-heading-record">
              <CaseCoordinate section="03 / contract" />
            </div>
            <p className="lp-eyebrow">Exhibit II · Merge Contract</p>
            <h2 id="lp-contract-title">Requirements stay open until stronger evidence clears them.</h2>
            <p>
              The contract turns report conditions into durable clauses, with named proof, related records and an owner cue.
            </p>
          </div>
        </section>

        <section className="lp-thesis lp-case-movement lp-case-movement--ledger" data-motion-section="ledger" aria-labelledby="lp-thesis-title">
          <div className="lp-ledger-intro">
            <CaseCoordinate section="04 / verification ledger" />
            <CaseTraceSegment stages={[3, 4]} label="Ledger trace: requirement to human decision" />
          </div>
          <p className="lp-eyebrow">Verification ledger</p>
          <h2 id="lp-thesis-title" className="lp-serif">A quiet ledger of evidence, moving toward a human decision.</h2>
          <p>Each record keeps its meaning, source and state without pretending that analysis is authority.</p>
          <ul className="lp-trust-records">
            {trustRecords.map((record) => (
              <li key={record.title}><h3>{record.title}</h3><p>{record.detail}</p></li>
            ))}
          </ul>
          <p className="lp-ledger-bridge">The case now reaches the decision ledger. Its engineer decision remains pending.</p>
          <Link className="lp-text-link" href="/docs/security-model.md">Read the security model <span aria-hidden="true">→</span></Link>
        </section>

        <section className="lp-decision" data-motion-section="decision" aria-labelledby="lp-decision-title">
          <div className="lp-decision-arrival" aria-hidden="true">
            <CaseCoordinate section="05 / human authority" />
            <CaseTraceSegment stages={[3, 4]} label="Decision trace: requirement to human decision" />
          </div>
          <div className="lp-decision-heading">
            <p className="lp-eyebrow">Exhibit III · Human authority</p>
            <h2 id="lp-decision-title">The analysis ends where accountable judgment begins.</h2>
            <p>Lintel has reached a recommendation. The case now waits for the engineer who will record the decision.</p>
          </div>
          <div
            className="lp-frame lp-frame--decision"
            role="img"
            aria-label={`Sample human decision exhibit for ${report.pr.repository} pull request ${report.pr.number}. Lintel recommends tests required with medium risk ${report.verdict.riskScore} out of 100. ${openBlockingClauses} blocking requirements and ${openConditions} report conditions remain open. The current Human Decision Ledger has no entry, so the engineer decision is pending, with no actor or timestamp available and no recommendation divergence recorded.`}
          >
            <FrameHeader label="Decision record / Human Decision Ledger" />
            <div className="lp-decision-context" data-motion-focus="recommendation" aria-hidden="true">
              <div>
                <span className="lp-ui-label">Lintel analysis / recommendation</span>
                <strong>#{report.pr.number} · {report.pr.title}</strong>
                <code>{report.pr.repository} · {run.runId}</code>
              </div>
              <dl>
                <div><dt>Lintel recommendation</dt><dd><Status tone="warning">TESTS REQUIRED</Status></dd></div>
                <div><dt>Risk record</dt><dd><strong>{report.verdict.riskScore}/100</strong><span>{report.verdict.riskLevel}</span></dd></div>
                <div><dt>Requirements</dt><dd><strong>{openBlockingClauses}</strong><span>blocking open</span></dd></div>
                <div><dt>Conditions</dt><dd><strong>{openConditions}</strong><span>open</span></dd></div>
              </dl>
            </div>
            <div className="lp-human-record" data-motion-focus="human-decision" aria-hidden="true">
              <div className="lp-human-record-heading">
                <span className="lp-ui-label">Current human decision</span>
                <span className="lp-decision-state"><span aria-hidden="true" /> Pending</span>
              </div>
              <strong>Engineer decision pending</strong>
              <p>Review the open proof and requirements, then record the accountable decision in the ledger.</p>
              <dl>
                <div><dt>Actor</dt><dd>Not recorded</dd></div>
                <div><dt>Timestamp</dt><dd>Not recorded</dd></div>
                <div><dt>Recommendation alignment</dt><dd>No decision to compare</dd></div>
              </dl>
            </div>
          </div>
          <div className="lp-decision-conclusion">
            <p><span>Verification boundary</span>Evidence remains provenance-linked; raw diffs are processed transiently.</p>
            <Link className="lp-decision-report-link" href="/report?demo=1">Open the sample report to review the decision ledger <span aria-hidden="true">→</span></Link>
            <Link className="lp-text-link" href="/docs/security-model.md">Read the security model <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="lp-final" data-motion-section="final" aria-labelledby="lp-final-title">
          <div className="lp-final-record">
            <CaseCoordinate section="case close / next review" />
            <span>Example case remains open</span>
          </div>
          <Trace compact />
          <h2 id="lp-final-title" className="lp-serif">Bring the change you’re unsure about.</h2>
          <p>This sample remains pending. Inspect its full Case File, or start the next verification case with your change.</p>
          <div className="lp-actions">
            <Link className="lp-btn lp-btn--primary" href="/new">Check a pull request</Link>
            <Link className="lp-btn lp-btn--secondary" href="/report?demo=1">View the sample report</Link>
          </div>
          <code className="lp-run-reference">SAMPLE DATA · {run.runId}</code>
        </section>
      </div>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>Lintel</span>
          <p>Engineering verification for human- and agent-produced change.</p>
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
      </LandingMotion>
    </main>
  );
}
