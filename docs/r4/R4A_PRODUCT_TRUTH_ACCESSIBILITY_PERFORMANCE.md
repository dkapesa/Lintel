# R4A Product Truth, Accessibility, and Performance Contract

> **Milestone:** R4A — Engineer Workflow and Reference Lock
> **Status:** Binding R4A contract pending human acceptance
> **Scope:** Repository-grounded capability boundaries, provenance safeguards, Human Decision and requirement truth, accessibility principles, and performance limits.
> **Authoritative inputs:** The binding R4A task prompt; authoritative R4 continuity brief; current Lintel screenshots 11–15; targeted route, adapter, persistence, evidence, run, history, decision, and GitHub repository contracts; accepted R1–R3 documentation.
> **Excluded scope:** New schemas, persistence, backend capability, production code, library selection, final modal layout, and tested shortcut assignment.
> **Next owning milestone:** R4B — Workspace Information and Interaction Architecture.

## Product-truth rule

Interface prominence cannot upgrade capability. Every visible fact and action must be traceable to a current repository record, a clearly labelled fixture, or a clearly labelled planned R4 requirement.

The following labels remain distinct:

- **Durable/local:** stored in validated browser-local history or a keyed local ledger; survives refresh on that device only.
- **Session:** available for the current browser session and not durable.
- **Fixture/demo/sample:** intentional example data; read-only unless a contract explicitly says otherwise.
- **Configured real capability:** implemented but dependent on valid environment configuration or credentials.
- **Conceptual/blueprint:** describes intended behaviour and performs no corresponding integration action.
- **Export-only:** produces copy or a file but does not deliver it to an external service.
- **Unavailable/partial:** a source or capability could not be established; no silent substitute.
- **Inferred/model-assisted:** provenance, not direct observation.
- **Stale:** associated with an earlier applicable head/run or otherwise no longer current.

## Verified current capabilities

| Capability | Verified current contract | R4 presentation requirement |
| --- | --- | --- |
| Canonical Workspace source | `/workspace` delegates to the shared Workspace v2 entry with real stored Report history as its default. Explicit fixture source remains available; an unknown report identity is unavailable, not substituted. | Default to truthful real/empty/unavailable states and visibly badge explicit fixtures. |
| Local history | Valid reports are retained in `lintel.reportHistory.v1`, currently capped at 10 entries. Raw diff content is rejected from durable history. | Describe current history as browser-local and bounded; do not claim hosted durability or unlimited run history. |
| Evidence and requirements | Evidence hierarchy and merge requirements are recomputed from stored reports and related canonical records; evidence contains class, strength, provenance, status, run/head identity, and staleness fields. | Keep observed, inferred, missing/unverified, confirmed, stale, and unavailable states distinct. |
| Requirement progress | Only exact canonical report conditions have persisted clear/reopen capability. Other derived requirements are read-only. | Render a real capability state per requirement; do not offer disabled-looking fictional actions. |
| Review actions | Local action tracking supports `Open`, `In progress`, `Done`, and `Not needed`. | Describe this as task progress only, not requirement resolution or proof. |
| Human Decision ledger | Append-only events support seven outcomes, accepted-risk references, actor/rationale, run/head/report identity, applicability, staleness, divergence, reaffirmation, supersession, withdrawal, and risk revocation. | Keep Human Decision distinct from recommendation and local review status; expose limitations when head identity is absent. |
| Readiness movement | `ReadinessDelta` and `ReviewDiff` compare runs and identify added, changed, cleared, reopened, and unchanged records plus higher-level classification. | Present records and identities, not only aggregate counts. |
| Canonical run provenance | Run manifest records input/configuration/result fingerprints, source, versions, provider/model where relevant, previous run, head/base SHA where available, and reproducibility classification. | Provide exact technical identity and limitation language; do not imply exact replay for traceable model output. |
| Case File provenance | `/report` supports durable, session, and demo modes. Durable records use local storage; session/demo are non-durable/read-only for durable decision storage. | Preserve the provenance badge and different action language. |
| GitHub App | Environment-gated code can analyse supported PR events and create or update one marked pull-request comment. | Show configured/unavailable state. Do not imply universal connection or external endorsement. |
| GitHub Action | `/github-action` and its blueprint document describe future architecture only. | Label as blueprint; it does not install, run, connect, or post. |
| Slack handoff | `/slack-handoff` copies/exports formatted text. | Label export-only; it does not send, authenticate, schedule, or connect. |
| Operations and Team | Both project browser-local data; Team ownership and roles are local responsibility metadata. | Do not describe organisation analytics, authenticated people, presence, RBAC, or shared state. |
| Policies and settings | Review-policy profiles and settings currently contain prototype/conceptual, largely read-only records. | Do not claim enforcement, repository assignment, saved provider configuration, or organisational policy. |

## Planned R4 capabilities

The following desired R4 behaviours are not established as complete current capabilities. R4B specifies their information and interaction architecture; R4D implements the core light Workspace; R4E implements deep interaction and approved supporting contracts; R4F propagates the product system to supporting routes; R4G owns final adversarial acceptance.

- the full light Workspace and logged-in route system;
- the locked Rail/Queue/Workspace/Inspector shell and responsive collapse;
- a dedicated missing-proof object and complete finding-to-proof-to-requirement traversal where schemas do not yet expose it;
- one coherent five-mode Workspace with Overview, Change, Evidence, Requirements, and History;
- exact object-selection transitions and Inspector fallback state;
- full long-history navigation beyond the current local history bound;
- decision-readiness composition in the primary Workspace;
- a general requirement acknowledgement or waiver capability, if approved and backed by new schema/persistence;
- integrations management with truthful Connected versus Available data;
- searchable policy/profile/onboarding templates with preview and clone/apply behaviour;
- cross-route light convergence and final route responsibility in R4F;
- any hosted, shared, authenticated, organisation-wide, enforcement, or live delivery capability.

Planned capabilities must be labelled as implementation requirements, never described in present tense as existing product behaviour.

## Screenshot-only evidence and canonical scenario

Screenshots 11–15 provide current visual and interaction evidence: dark four-plane proportions, grouped Queue, evidence spine, finding/evidence selection, supporting Inspector, decision context, and a tall seven-outcome decision modal. Their sample values are not the R4C data authority.

The R4C laboratory uses:

- repository `acme/redemption-api`;
- pull request `#482`;
- title `Add fallback handling for failed discount-code retrieval`;
- recommendation `TESTS REQUIRED`;
- risk `46/100 MEDIUM`;
- requirements `4 open, 4 blocking`;
- Human Decision `PENDING`.

PR `#1`, risk score `78 HIGH`, `23` blocking requirements, and other values visible in screenshots are screenshot-only examples. Production schemas and current capabilities remain repository-authoritative.

## Repository conflict and superseding direction

Accepted R2 documentation and current shell code deliberately lock logged-in AppShell routes dark, and the current production Workspace owns a dark private palette. R4 explicitly supersedes that product-experience direction with a light operational Workspace and logged-in system. This is a planned product rebuild, not a claim about the current implementation.

The current root layout loads Geist Sans, Geist Mono, and Newsreader, with Newsreader scoped for the public landing. R4 keeps Newsreader on the public landing only and uses Geist Sans and Geist Mono throughout the logged-in application.

The current Workspace's evidence-spine stage names and internal plane arrangement are implementation evidence, not the final R4 five-mode architecture. R4B must map or replace them without losing current behaviour.

## Human Decision safeguards

The modal is a consequential action surface, not a quick status selector. It must:

- name the selected repository, PR, current run, and current head when available;
- state that Lintel recommends and the engineer decides;
- expose all seven outcomes without preselecting the recommendation;
- explain each outcome in plain language;
- require a non-whitespace rationale;
- disclose open blocking requirements and missing/unverified proof;
- require accepted-risk references and an explicit engineer-accepts acknowledgement;
- require acknowledgement before approval over blockers;
- require acknowledgement when recording without a head binding;
- preserve entered rationale and selections through recoverable validation or write errors;
- record one append-only event only after verified persistence;
- make Cancel and Confirm distinct, reachable, and unambiguous;
- retain a visible heading and decision context in short viewports;
- provide contained scrolling and a reachable action footer;
- warn before Escape or another dismissal discards entered rationale;
- restore focus to the invoking control after close;
- support keyboard operation, modal focus containment, and 200% zoom.

R4A does not choose the exact modal width, field order, sticky regions, reference selector, mobile presentation, or scroll composition. R4B resolves and tests them.

## Requirement-action safeguards

`Resolved` means the product has current proof or an exact supported persisted condition-progress record, according to a defined schema. `Reopened` means a previously cleared exact condition is open again. `Acknowledged` means a named accountable actor has recorded awareness under a dedicated contract. `Waived` or `accepted risk` means an accountable engineer has explicitly accepted named residual risk under an applicable Human Decision.

These terms are not synonyms:

- marking a local task `Done` does not satisfy evidence;
- marking a task `Not needed` is not a waiver;
- clearing a condition does not rewrite the analysis or delete a requirement;
- a Lintel recommendation cannot acknowledge or waive anything;
- accepted risk is not clean approval and does not turn missing evidence into present evidence;
- a stale decision or stale risk acceptance is not current authorization;
- unsupported actions render as read-only explanations, not fake controls.

## Keyboard and focus principles

All core workflows must be keyboard-complete. R4A locks principles, not untested key bindings.

- Tab order follows Rail → Queue → Workspace mode/header → active Workspace records → Inspector → decision entry, adjusted when regions are collapsed.
- A skip mechanism moves directly to the selected review's primary work surface.
- Arrow-key or roving-focus behaviour may be used inside a true composite widget only after R4B defines its semantics and testing; ordinary lists must not acquire bespoke shortcuts by assumption.
- Enter and Space activate controls according to native semantics. Enter must not accidentally confirm a consequential decision from a multiline field or generic modal region.
- Visible focus is immediate, high contrast, and separate from selection.
- Moving to a related object moves DOM focus predictably to the new primary record and announces the context change where the eye could miss it.
- Collapsing a region restores focus to its disclosure control; reopening makes the selected context reachable without resetting selection.
- Dialog focus is contained, initial focus is deliberate, and closing restores focus to the invoking control or a documented safe fallback.
- Escape closes a non-destructive overlay. If entered rationale or another consequential draft would be lost, Escape triggers a discard warning or leaves the dialog open.
- No core action depends on hover, drag, pointer precision, a command palette, or a memorised shortcut.
- Exact shortcuts and command-palette scope are tested and locked only in R4B.

## Accessibility requirements

R4 must provide:

- complete keyboard operation and logical focus order;
- visible focus for every interactive element;
- modal focus containment and restoration;
- explicit Escape behaviour;
- text, icon, and/or structural state cues so colour is never the only signal;
- meaningful compact text at `color.text.important-secondary` (`#6F6F6F`) or a darker contrast-tested equivalent; `color.text.secondary` and `color.text.tertiary` are restricted to non-essential, disabled, placeholder, or structurally redundant content and never carry essential metadata, status, instructions, or actions at compact sizes;
- minimum usable hit targets appropriate to dense desktop software: 32px minimum control dimension in dense rows, with 40px preferred for standalone and touch-facing controls; adjacent targets require sufficient separation;
- screen-reader names for icon-only controls;
- labelled regions, tables, collections, modes, dialogs, status messages, and live updates;
- 200% browser zoom without loss of content or action access;
- reduced-motion support with no essential state change dependent on animation;
- no critical information available only on hover;
- functional narrow-laptop, tablet, and mobile workflows;
- readable technical identifiers and meaningful pronunciation or labels where raw hashes are insufficient;
- truncation with accessible full-value access;
- error identification, recovery guidance, and preservation of consequential input;
- appropriate announcement of selection, unavailable data, save success, save failure, and stale conflicts;
- no core workflow dependent on simultaneous panels or pointer precision.

R4C must test representative controlled-fixture contrast, target size, focus visibility, screen-reader behaviour, reflow, and modal operation sufficiently to approve the laboratory. R4G must perform exhaustive production accessibility, keyboard, responsive, performance, and stress acceptance rather than inferring compliance from token values or laboratory coverage alone.

## Performance boundaries

R4 is designed for at least:

- 50+ reviews in the Queue;
- 20+ findings in a selected review;
- many evidence records and requirements;
- multiple analysis runs and long Human Decision history.

The experience must meet these boundaries:

- do not render every large collection at once when it is outside the active mode or visible window;
- preserve selection by stable identity when records load, filter, reorder, regroup, or update;
- preserve scroll position where doing so does not hide changed priority;
- keep Rail, Queue, Workspace, Inspector, and modal scroll ownership controlled and observable;
- avoid a graph or relationship view requiring expensive free-form layout;
- use fixed or ordered relationship representations and render only relevant adjacent records;
- avoid unnecessary animation in persistent engineering surfaces;
- do not duplicate the full Workspace DOM for desktop, drawers, tablet, and mobile;
- do not preload complete diff bodies or every historical detail merely to render summary state;
- load exact technical detail on demand while keeping selection stable and limitations visible;
- avoid layout shifts when counts, scrollbars, and asynchronous states change;
- keep deterministic ordering so updates do not make review priority appear random;
- add no production dependency for R4A documentation or for speculative future visual effects;
- prescribe no implementation library in R4A.

The current 10-entry local history limit is current product truth, not the R4 performance target. If R4E expands history, it must define storage, paging, migration, and failure behaviour explicitly.

## Truth and quality acceptance

The R4 experience is unacceptable if it implies hosted durability, shared teams, enforced policy, executed tests, a live GitHub Action, Slack delivery, direct observation for model inference, current applicability for a stale decision, or Human authority for a Lintel recommendation. It is also unacceptable if an engineer cannot complete the core review and decision workflow with keyboard, zoom, reduced motion, a narrow viewport, or large record collections.
