# R4A Engineer Workflow Contract

> **Milestone:** R4A — Engineer Workflow and Reference Lock
> **Status:** Binding R4A contract pending human acceptance
> **Scope:** The end-to-end engineer review workflow, information ownership, requirement actions, and accountable Human Decision principles.
> **Authoritative inputs:** The binding R4A task prompt; authoritative R4 continuity brief; current Lintel screenshots 11–15; targeted Workspace, Case File, evidence, requirement, history, run, and Human Decision repository contracts.
> **Excluded scope:** Exact R4B interaction composition, tested shortcuts, production implementation, and R4C visual execution.
> **Next owning milestone:** R4B — Workspace Information and Interaction Architecture.

## Product-experience objective

R4 makes review readiness legible as an evidence-backed engineering judgment. It starts from the selected change, not from aggregate metrics. The engineer must be able to move through `Change → Observation → Evidence → Requirement → Human Decision` without losing review identity, selection, run context, or the distinction between machine recommendation and human authority.

The Workspace must answer:

- Which pull requests need attention?
- Why is the selected pull request not ready?
- What does Lintel recommend, and at what risk?
- What evidence supports that recommendation?
- What proof is missing or unverified?
- Which requirements remain open or blocking?
- What moved between the current and previous analysis runs?
- Has an earlier Human Decision become stale?
- What should be inspected next?
- What accountable Human Decision remains?

## Entry points and first-five-second contract

The primary entry is `/workspace`, opening real stored Report history by default. A durable review identity may select an exact case. An unknown identity must produce an unavailable state, never a silent substitution. Fixture content is permitted only through an explicit sample path and must be visibly labelled.

Secondary entry points may return an engineer to the same selected review from New Review, Case File, Review Operations, a configured GitHub workflow, or another truthful contextual link. They must preserve a stable local review identity when one exists.

Within five seconds, the default Workspace exposes:

| Question | Required visible answer |
| --- | --- |
| What am I reviewing? | Repository, PR number, concise title, and current run or head identity when available. |
| What is Lintel saying? | Recommendation as a recommendation, plus risk band and score when the record contains both. |
| Why? | Highest-impact finding or strongest ready signal, with its severity and evidence state. |
| What is missing? | Missing-proof statement and open/blocking requirement counts. |
| What changed? | Changed-since-last-run signal when comparison data exists; otherwise an explicit initial-run or unavailable state. |
| What did a human decide? | Pending, applicable outcome, stale, withdrawn, superseded, unbound, or unavailable. |
| What next? | One specific inspection target or accountable action derived from the current review. |

The initial view must not require a generic overview dashboard, charts, hover, hidden tabs, or a modal to answer these questions.

## Complete engineer review workflow

### 1. Open work requiring attention

The Queue groups reviews by `Needs attention`, `In review`, `Ready`, and `Reviewed`. Selection updates the Workspace and contextual Inspector as one coherent state. The selected row remains identifiable while its detail is open and when the Queue is compact.

### 2. Establish recommendation and risk

The selected review header states Lintel's recommendation, risk, analysis confidence or limitations, and current run identity. Recommendation language must not imply approval, rejection, or a recorded Human Decision.

### 3. Find the highest-impact observation

The default view ranks blocking and high-impact findings before secondary findings. Severity, blocking effect, missing-proof effect, affected surface, and evidence strength determine priority. Ordering must be deterministic and explainable; decorative prominence is not priority.

### 4. Inspect supporting evidence

Selecting a finding focuses its directly related evidence. Evidence records expose class, state, strength, provenance, run and head binding when available, affected files or surfaces, and the exact relationship being asserted. Direct observation, model inference, missing/unverified proof, and stale evidence remain distinct.

### 5. Understand missing proof

Missing proof is a first-class record, not an empty evidence card. It states what was sought, why it matters, which finding or requirement it affects, its verification state, and the next proof-producing action. R4B must resolve its exact schema and interaction when repository data does not yet expose a dedicated object.

### 6. Inspect affected code context

The engineer can move from the selected record to affected files, surfaces, and focused diff context only when present in the data. R4 does not fabricate line mappings or claim a complete diff viewer. Technical paths and identifiers use Geist Mono and provide their full accessible value when visually truncated.

### 7. Inspect resulting requirements

Each requirement states its text, importance, status, required evidence, supporting evidence, source, affected finding or change, run/head applicability, and action capability. Blocking requirements precede advisory requirements; reopened and stale requirements precede unchanged open requirements.

### 8. Act only through supported contracts

Current repository truth supports clear/reopen progress only for canonical merge conditions with an exact persisted condition identity. Derived requirements without that identity are read-only. Local review-action statuses (`Open`, `In progress`, `Done`, `Not needed`) are task-tracking metadata and are not proof, resolution, acknowledgement, or waiver.

The repository does not establish a general requirement-level acknowledgement or waiver record. R4 must not present one as current capability. Explicit risk acceptance belongs to the seven-outcome Human Decision contract and must name available risk references. R4B/R4E may add requirement action contracts only with corresponding schema, persistence, provenance, and reopening semantics.

### 9. Compare runs

The History mode compares the current run with the immediately previous applicable run. The comparison identifies run IDs, head SHAs, timestamps, analysis source, configuration where available, and limitations.

### 10. Understand movement

Readiness Delta and Review Diff distinguish initial, improved, regressed, mixed, and unchanged states, and added, cleared, changed, unchanged, and reopened records. The comparison covers recommendation, risk, findings, evidence, missing proof, requirements, and decision applicability only where the underlying data provides those comparisons. Counts never replace inspectable records.

### 11. Assess decision readiness

Decision readiness summarises open blockers, missing/unverified proof, stale records, run/head availability, the relationship to any earlier Human Decision, and any required acknowledgement. It is a readiness assessment, not a Human Decision.

### 12. Record the Human Decision

The accountable engineer chooses one of the repository's seven outcomes:

- Approve;
- Approve with accepted risk;
- Tests required;
- Review required;
- Request changes;
- Blocked;
- Defer decision.

Every outcome requires the engineer's rationale. Accepted risk additionally requires explicit available risk references and an explicit acknowledgement control that is unchecked by default and states that the engineer—not Lintel—accepts the risk. Approval over open blockers requires explicit awareness. Recommendation context stays visible, but no outcome is preselected merely because it matches Lintel.

### 13. Preserve applicability

The decision record preserves actor, outcome, rationale, referenced evidence or requirements, accepted risks, timestamp, report identity, canonical run ID, and applicable head SHA when available. If no head is recorded, the engineer must explicitly acknowledge an unbound decision; the interface must state that stale-decision detection is disabled or limited. Reaffirmation, supersession, withdrawal, and risk-acceptance revocation append history rather than rewriting the original act.

### 14. Communicate truthfully through GitHub

The implemented, environment-gated GitHub App can create or update one marked pull-request comment containing the current automated analysis, run identity, requirements, evidence summary, and Readiness Delta. It is not evidence that a Human Decision was posted unless the relevant code path explicitly publishes that decision record. The separate GitHub Action route remains a blueprint and does not execute or post. R4 must label configured, unavailable, conceptual, and export-only states explicitly.

## Persistent versus contextual ownership

| Information | Persistent owner | Contextual owner | Rule |
| --- | --- | --- | --- |
| Global product area | Global Rail | None | Persists across logged-in routes; never becomes review detail. |
| Review grouping and ordering | Review Queue | Queue row | Persists while a Workspace review is open; compact state retains orientation. |
| Selected repository/PR/title | Workspace header | Queue selected row | Workspace is authoritative; Queue carries abbreviated orientation only. |
| Recommendation and risk | Workspace header/default view | Queue summary; Inspector decision context | Workspace owns explanation; Queue owns triage shorthand; Inspector must not duplicate the whole verdict. |
| Run/head/provenance | Workspace header and History mode | Inspector for selected run or record | Exact technical identity lives in Workspace; contextual applicability lives in Inspector. |
| Findings and missing proof | Workspace modes | Inspector for selected object | Workspace owns collections and ordering; Inspector owns one selected object's detail. |
| Evidence and requirements | Workspace modes | Inspector for relationships and actions | Workspace owns primary records; Inspector explains links and available action capability. |
| Human Decision | Workspace decision-readiness region and History | Inspector readiness context; modal during recording | The recorded decision remains distinct from recommendation and review status. |
| Ownership/reviewer | Queue when useful; Workspace header | Inspector | Show only real local ownership; fixture people are labelled and never imply authenticated collaboration. |
| Global route actions | App-wide route shell | Route surface | Workspace-specific actions do not become permanent global navigation. |

## Information and selection ownership

There is one selected review and at most one primary selected object within it. Queue selection owns review identity. Workspace mode owns the primary collection being read. Inspector selection owns contextual detail, not a second copy of the record.

When a user selects an object, the primary target and contextual relationships are:

| Selected object | Workspace primary focus | Inspector first responsibility | Secondary links, in order |
| --- | --- | --- | --- |
| Finding | Finding record | Why it matters and evidence state | Supporting evidence → missing proof → requirements → affected files. |
| Evidence record | Evidence record | Provenance, strength, state, applicability | Supported findings → requirements → files/run. |
| Missing-proof record | Missing-proof record | What is absent and how to prove it | Affected finding → requirement → suggested verification surface. |
| Requirement | Requirement record | Status, blocker effect, required proof, available action | Supporting evidence → source finding/change → run history. |
| Affected file | File/change record | Why it is in scope and linked risk | Findings → evidence → requirements. |
| Run | Run/history record | Identity, provenance, comparison limitations | Delta → Review Diff → stale decisions and records. |

An explicit user selection outranks inferred relevance. Within related objects, blocking outranks advisory; missing/unverified or stale outranks present/current; direct relationships outrank text similarity; current-run records outrank historical records unless History mode is active. When no explicit selection exists, the Inspector shows concise decision readiness and next-inspection context, not a duplicate Overview.

## Human Decision interaction principles

The interaction is consequential and deliberate:

- the heading and selected review context remain visible;
- all seven outcomes are available and explained;
- recommendation is visible but non-authoritative;
- rationale is required and preserved on recoverable errors;
- unresolved blockers and missing head identity are disclosed before confirmation;
- accepted risk names what is accepted and who accepts it;
- Cancel is visually available and semantically distinct from Confirm;
- confirmation is enabled only after outcome-specific requirements are met;
- success records an append-only event against the applicable review identity;
- retry or conflict states prevent duplicate or stale writes;
- modal scrolling, exact field order, and compact composition remain R4B decisions.

## Acceptance criteria

This workflow contract is satisfied when an engineer can traverse the complete evidence chain, understand current and historical state, act only through truthful capabilities, and record a distinct accountable Human Decision without losing review, run, commit, selection, focus, or provenance context.
