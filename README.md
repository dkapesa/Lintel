# Lintel

**Software change verification for human and agent-produced code.**

Lintel helps engineers establish what is actually supported about a software change before they accept it. It connects the change, the engineering propositions that need to be verified, the Evidence that supports or contradicts them, what remains unproven, how verification changes across revisions, and the accountable Human Decision.

> **Agents produce. Lintel verifies. Humans decide.**

Lintel is not a generic AI code review chatbot. It does not treat passing checks, model conclusions or producer claims as proof simply because they exist.

The goal is to reduce the amount of software change an accountable engineer must manually reconstruct while keeping Evidence, uncertainty, provenance and human authority explicit.

---

## Current project status

Lintel currently has a working verification product with deterministic analysis, optional guarded model-assisted analysis, GitHub App processing, provenance and reproducibility controls, review evolution, Human Decision support, and a logged-in verification Workspace.

A major first-principles redesign of Lintel's verification model and workstation architecture was completed in August 2026.

That programme produced:

- **Verification Model v2**
- a persistent Review model designed to survive multiple revisions
- versioned Verification Contracts
- proposition-level Verification Obligations
- proposition-relative Evidence
- explicit Evidence Standards and Scope
- established versus candidate verification state
- Verification Delta
- basis-bound Human Decisions
- a new authenticated application architecture
- a complete interaction and responsive model
- a frozen visual system
- an incremental migration plan
- implementation acceptance, validation and cutover contracts

The resulting **Converged Verification Workstation is fully specified but has not yet been implemented**.

The next major engineering programme is the controlled implementation of that workstation over the existing product while preserving validated verification, GitHub, provenance, persistence and Decision foundations already present in the repository.

---

## Current implemented product

The screenshots below show the currently implemented Lintel product.

They are not mockups of the upcoming Converged Verification Workstation. The existing interface will remain the working baseline until the replacement workstation has been implemented and validated.

![Lintel Workspace showing pull request 482 with a tests required recommendation, medium risk, open blocking requirements, and a pending Human Decision.](docs/assets/readme/lintel-workspace-overview.png)

**The current Workspace keeps change analysis, evidence, open proof, requirements and accountable Human Decision visible within one verification surface.**

![Lintel evidence view showing a duplicate redemption finding, supporting evidence provenance, missing proof, and an open idempotency requirement.](docs/assets/readme/lintel-evidence-and-missing-proof.jpg)

**Evidence, provenance and missing proof remain connected and inspectable rather than being collapsed into a single model conclusion.**

![Lintel Human Decision dialog for pull request 482 showing tests required, medium risk, open blockers, and no outcome selected.](docs/assets/readme/lintel-readiness-human-decision.png)

**The current product already separates automated analysis from accountable engineer authority.**

---

# Implemented engineering foundation

## Verification and analysis

Lintel currently implements:

- deterministic analysis for missing tests, retry and idempotency risks, provider failure handling, API contract concerns, logging and privacy issues
- optional model-assisted analysis normalised into typed structures before use
- validation and deterministic fallback around model-assisted results
- explicit provenance and uncertainty rather than relying only on model confidence
- connections between findings, supporting evidence, missing proof and review requirements
- separation between model-derived output and deterministic analysis

The existing implementation provides the engineering foundation that the next-generation verification model will build upon rather than replace wholesale.

---

## GitHub workflow

Lintel implements:

- GitHub App authentication using signed JWTs and short-lived installation tokens
- HMAC SHA256 webhook verification with timing-safe comparison
- idempotent processing of supported installation, repository and pull request events
- automated pull request analysis
- one persistent GitHub analysis comment that can be updated by later successful analyses
- failure isolation so later failed work does not destroy the last valid Review state

Credentials, installation tokens, webhook secrets and authorisation headers remain outside browser state.

---

## Reproducibility and review evolution

Lintel implements:

- versioned canonical review manifests
- source and commit identity
- ruleset and generator provenance
- stable input, configuration and result fingerprints
- deterministic serialisation
- server-side replay verification for deterministic GitHub analyses
- commit-aware **Readiness Delta**
- deterministic **Review Diff**
- comparison across findings, evidence, tests and readiness conditions
- exclusion of failed analyses from valid comparison baselines

These foundations remain important in the next workstation because verification truth must remain attributable to the exact software and verification basis that produced it.

---

## Agent Change Passport

Lintel can capture structured producer context from machine-readable pull request content, including:

- builder intent
- producer identity
- claimed tests
- assumptions
- constraints
- known limitations
- unresolved uncertainty

Producer declarations remain **claims** until independently supported by Evidence.

Lintel can distinguish information that is:

- declared and supported
- declared but unverified
- observed but undeclared

This distinction becomes increasingly important as software implementation is delegated to coding agents.

---

## Human Decision

The current product already implements an explicit distinction between automated analysis and accountable engineer authority.

Implemented capabilities include:

- Human Decision as a separate authority concept
- local Decision history
- Review history
- Markdown and summary handoff
- separation between automated recommendation and engineer action

The redesigned workstation strengthens this boundary further through basis-bound Decision Drafts and explicit authoritative persistence.

---

## Public product system

Lintel currently includes a shared Next.js and TypeScript public product system across:

- Product
- How it works
- Trust
- Resources
- curated technical documentation

The current public system implements:

- responsive navigation
- accessible interaction
- keyboard support
- reduced-motion behaviour
- shared typography and layout
- deliberate distinction between implemented behaviour, limitations and future work

The existing public website remains separate from the upcoming Workstation implementation.

A future public website redesign will be carried out after the new workstation exists so that the website can present authentic product states rather than invented marketing UI.

---

# Product surfaces

Current repository surfaces include:

| Surface | Purpose |
| --- | --- |
| `/workspace?source=fixture` | Current read-only canonical product demonstration |
| `/new` | Create a Review from a sample, public pull request or pasted diff |
| `/workspace` | Current logged-in verification Workspace |
| `/report` | Secondary Case File surface |
| `/` | Public product overview |
| `/product` | Product explanation |
| `/how-it-works` | Verification workflow |
| `/trust` | Product truth, boundaries and limitations |
| `/resources` | Curated resources and documentation |

These routes describe the **currently implemented application**.

The target authenticated route architecture for the Converged Verification Workstation is described later and will be introduced incrementally rather than assumed to exist today.

---

# Verification Model v2

The next-generation Lintel verification architecture treats a Review as an **evolving verification record for a software change**, rather than as a disposable analysis result.

Conceptually:

```text
Review
│
├── Change
│   └── immutable Revisions
│
├── Verification Contract history
│   └── Verification Obligations
│
├── Evidence
│   ├── Sources
│   ├── Observations / Attestations
│   └── proposition-relative relationships
│
├── Verification Attempts
│
├── Established Verification Snapshots
│
├── Verification Delta
│
└── Human Decision history
```

The model is designed for software that may change repeatedly while an accountable engineer is reviewing it.

---

## Verification Contract

A **Verification Contract** is the versioned set of change-specific engineering propositions that need to be established for the Review.

Those propositions are represented as **Verification Obligations**.

An Obligation is a bounded engineering proposition whose evidential state materially affects verification readiness.

Each Obligation has:

- stable identity while its meaning remains unchanged
- an explicit proposition
- lifecycle state
- `REQUIRED` or `ADVISORY` authority
- an Evidence Standard
- applicable Verification Scope
- current Evidence Basis
- Missing Proof when required
- current evidential state

The canonical evidential states are:

- `SUPPORTED`
- `UNRESOLVED`
- `CONTRADICTED`
- `CONFLICTING`

These are not severity levels.

They describe different conditions in what can currently be established.

---

## Evidence is proposition-relative

Lintel's verification model treats Evidence as meaningful only in relation to the proposition it is being used to establish.

Conceptually:

```text
Source
   ↓
Observation / Attestation
   ↓
SUPPORTS / CONTRADICTS
   ↓
Verification Obligation
```

A passing test is not automatically proof of the engineering question currently under review.

For example:

```text
discount-provider.timeout.test.ts

Execution · PASS

Establishes O2

Does not establish O3
```

The execution result is real.

The relationship to the current proposition is a separate question.

This produces several important trust rules:

> **Claims are not observations.**

> **Model inference is not Evidence.**

> **PASS is not SUPPORTED.**

> **Green CI is not semantic readiness.**

> **Evidence requires provenance and sufficiency.**

> **Support is bounded to inspectable Scope.**

> **Contradiction prevents support.**

> **Unknown is preferable to fabricated certainty.**

> **False support is the most dangerous product failure.**

---

## Missing Proof

When an Obligation remains unresolved, Lintel should explain **why the existing Evidence fails to establish it**.

Missing Proof is therefore not simply:

> add more tests

or:

> insufficient coverage

It identifies the specific evidential gap.

For example:

> No deterministic execution currently reproduces explicit HTTP 503 after eligibility validation and observes the complete caller-facing response. Existing timeout Evidence establishes timeout fallback behaviour but does not establish explicit HTTP 503 behaviour.

Missing Proof is treated as engineering reasoning, not as a generic application warning.

---

# Canonical verification scenario

The upcoming workstation implementation uses a deterministic Review fixture centred on pull request `#482`.

| Field | Value |
| --- | --- |
| Repository | `payments-api` |
| Pull request | `#482` |
| Change | Handle discount provider HTTP 503 responses through the existing fallback path |
| Initial revision | `a91c42e` |
| Verification Contract | `VC-482-v1` |
| Required Obligations | `4` |
| Supported | `3` |
| Unresolved | `1` |
| Readiness | `NOT_READY` |

The primary unresolved Obligation is:

> When the discount provider responds with HTTP 503 after the request has passed eligibility validation but before a discount code is returned, the service activates the configured fallback path and preserves the existing caller-facing response contract without exposing the upstream provider failure.

The initial established verification state is:

```text
O1 · SUPPORTED
O2 · SUPPORTED
O3 · UNRESOLVED
O4 · SUPPORTED

3 supported · 1 unresolved
NOT_READY
```

Existing timeout Evidence passes:

```text
discount-provider.timeout.test.ts

Execution · PASS

Establishes O2

Does not establish O3
```

The timeout execution establishes timeout fallback behaviour.

It does **not** establish explicit HTTP 503 behaviour.

A later revision:

```text
b73fd80
```

adds:

```text
discount-provider.503.test.ts
```

The new deterministic execution passes.

However:

```text
candidate PASS
≠
established support
```

The current Obligation remains `UNRESOLVED` until provenance, applicability, Scope, Evidence Standard, observation and conflicts are coherently evaluated and a new Verification Snapshot is committed.

Only then does the established truth move:

```text
O3

UNRESOLVED → SUPPORTED
```

and the Review becomes:

```text
4 supported
READY_FOR_DECISION
```

`READY_FOR_DECISION` never means automatically approved.

The accountable engineer still decides.

---

# Verification through revisions

Software may continue changing while verification is being performed.

Lintel therefore distinguishes:

```text
Current software head

Candidate verification process

Last established verification basis

Current evidential state

Human authority
```

For example:

```text
Current head
b73fd80

VERIFYING

Last established basis
a91c42e

O3
UNRESOLVED
```

The arrival of a new revision does not erase the last established truth.

A passing candidate execution also does not optimistically rewrite current evidential state.

The governing rule is:

> **The last established truth remains authoritative while new truth is being established.**

---

## Verification Delta

When verification meaning changes across established snapshots, Lintel can represent that change as **Verification Delta**.

For example:

```text
Verification Delta

O3
UNRESOLVED → SUPPORTED

Now established by
discount-provider.503.test.ts

Readiness
NOT_READY → READY_FOR_DECISION
```

Delta communicates **changed verification meaning**, rather than replaying every action that occurred while the engineer was away.

It can also represent negative change, including:

```text
SUPPORTED → UNRESOLVED
```

or:

```text
SUPPORTED → CONFLICTING
```

Verification Delta is therefore not a progress animation or activity feed.

---

# Readiness and Human Decision

The target readiness model is:

- `VERIFICATION_INCOMPLETE`
- `NOT_READY`
- `NEEDS_JUDGEMENT`
- `READY_FOR_DECISION`

The most important boundary is:

> **READY_FOR_DECISION is not APPROVED.**

Readiness describes whether a coherent verification basis exists for accountable human judgement.

Human Decision remains an independent authority.

Canonical Decision outcomes remain:

- `approve`
- `approve-with-accepted-risk`
- `tests-required`
- `review-required`
- `request-changes`
- `blocked`
- `defer`

The target Decision sequence is:

```text
Decision Basis
      ↓
Engineer selects outcome
      ↓
DRAFT
      ↓
Commit decision
      ↓
Canonical persistence
      ↓
Authoritative read-back
      ↓
COMMITTED
```

A Decision Draft remains:

- private
- device-local
- durable
- unrecorded
- bound to the exact verification basis against which it was authored

If the software, Verification Contract or established verification basis materially changes, the Draft becomes stale.

Lintel never silently rebases human authority.

---

# Converged Verification Workstation

A major product and interaction redesign of the logged-in application is complete.

The redesign did not begin from the assumption that the existing Workspace simply needed to look better.

It re-examined:

- the verification model
- information architecture
- work selection
- technical investigation
- temporal behaviour
- Review identity
- asynchronous state
- restoration
- responsive behaviour
- visual hierarchy
- Human Decision
- migration and acceptance strategy

The resulting workstation is fully specified.

**Implementation has not yet started.**

---

## Target authenticated application

The target application converges around:

```text
Lintel

Reviews

Controls
  Verification Expectations
  Connections
  Capability

Settings
```

The central rule is:

> **Reviews owns the workspace when the engineer is choosing work. The current verification question owns the workspace when the engineer is doing work.**

There is no generic authenticated dashboard.

There is no permanent Review Queue beside every active Review.

There is no permanent Inspector.

There is no five-mode Review navigation.

---

## Reviews Home

Reviews Home is a technical work collection rather than a metrics dashboard.

Its purpose is to help an accountable engineer answer:

> **Which software changes currently deserve my attention, and why?**

A Review should be selectable through meaningful verification context rather than a collection of risk scores or AI recommendations.

Conceptually:

```text
Preserve fallback response semantics when provider returns HTTP 503

HTTP 503 fallback remains unverified

payments-api · PR #482
```

---

## Progressive Verification Workstream

A selected Review is organised around the current engineering question.

The target workstream progresses through:

```text
Current Obligation

↓

State

↓

Why

↓

Evidence Basis

↓

Remaining proof

↓

Other Reviewer Focus

↓

Settled work
```

There is no generic `Overview` mode.

The engineering proposition currently being verified becomes the semantic and visual centre of the workstation.

---

## Technical investigation

Technical depth is progressive rather than a permanent peer mode.

The investigation path is:

```text
Obligation
    ↓
Evidence
    ↓
Observation / Execution
    ↓
Source
```

Lintel supports three spatial expressions:

### Progressive

A single verification workstream.

### Relational

Current verification task and technical artefact appear together when seeing both simultaneously genuinely reduces reconstruction.

### Dominant Technical

Source or another technical artefact can take most of the available space while a compact semantic anchor preserves:

- the Review
- current Obligation
- current state
- why the artefact matters
- relevant revision or basis

The governing principle is:

> **Technical content may gain spatial authority while the verification proposition retains semantic authority.**

---

## Review switching and restoration

The target application includes a dedicated **Review Switcher**.

It is designed to be:

- transient
- searchable
- compact
- keyboard-accessible
- reversible
- context-preserving

Opening the Switcher does not immediately navigate away from current work.

The existing Review remains stable until the requested destination is coherently available.

Cancellation leaves the engineer exactly where they were.

Each Review can preserve its own investigation context.

For example:

```text
#482
O3 → Evidence E2 → source

#479
O2 → execution

#917
O5 → conflicting Evidence
```

If nothing meaningful changed, returning to a Review can restore that investigation.

If verification meaning changed while the engineer was away, Verification Delta may take precedence over blind restoration.

The goal is to restore engineering context rather than old pixels.

---

## Asynchronous behaviour

The target workstation deliberately separates:

```text
navigation request

source request

Verification Attempt

canonical Verification Snapshot commit

Human Decision transaction
```

Background machine activity must not silently change the engineer's working context.

A late result cannot:

- navigate the application
- replace a newer source selection
- change the selected Obligation
- steal keyboard focus
- optimistically rewrite established verification truth

The interaction principle is:

> **Stable under machine activity. Responsive under human intent.**

---

# Visual and interaction system

The frozen visual thesis is:

> **Lintel is a calm, precise verification workstation in which visual emphasis follows epistemic importance.**

Its intended character is:

> **Calm. Precise. Evidential. Technical. Accountable.**

The visual shorthand is:

> **Compact and explicit locally. Calm and quiet globally.**

The target system uses:

- a light warm/off-white canvas
- low-contrast boundaries
- restrained semantic colour
- thin separators
- minimal elevation
- limited use of surface framing
- text-led engineering reasoning
- selective technical density
- progressive disclosure
- bounded content measure

The workstation deliberately avoids:

- card-heavy dashboards
- large success surfaces
- giant warning boxes
- recommendation and risk-score hierarchy
- badge-heavy status UI
- generic AI-chat presentation
- AI-thinking animation
- IDE imitation
- permanent shortcut clutter

---

## Typography

The visual system uses:

**Geist Sans**

for engineering meaning, propositions, reasoning and interface language.

**Geist Mono**

for exact technical identity, including:

- revisions
- source paths
- code
- identifiers
- raw technical output

Typography is intended to create hierarchy through measure, weight, alignment and spacing rather than large display text.

---

## State presentation

Semantic state uses language first and colour second.

The target state families include:

- restrained green for `SUPPORTED`
- restrained ochre for `UNRESOLVED`
- brick for `CONTRADICTED`
- restrained violet/plum for `CONFLICTING`
- cool neutral treatment for `VERIFYING`

`READY_FOR_DECISION` remains visually neutral.

Human authority is not represented through a large green approval surface.

Selection, keyboard focus and semantic truth remain three separate visual systems.

---

# Responsive workstation

The target workstation is designed for several engineering postures:

```text
Wide
≥ 1440px

Laptop
1000–1439px

Companion
640–999px

Narrow
< 640px
```

The same verification meaning must survive all of them.

A particularly important usage posture is Lintel beside an implementation environment:

```text
┌─────────────────────────────┬─────────────────────────────┐
│                             │                             │
│ Cursor / agent / terminal   │ Lintel                      │
│                             │                             │
│ software production         │ verification meaning        │
│                             │ Evidence                    │
│                             │ Missing Proof               │
│                             │ Decision                    │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
```

The principle is:

> **Surrender simultaneity before surrendering verification meaning.**

Narrow Lintel becomes a deliberate sequence rather than a miniature desktop interface.

---

# Upcoming implementation programme

The Converged Verification Workstation will be implemented as an incremental replacement programme rather than a rewrite.

The frozen future sequence is:

1. **Baseline + migration boundary**  
   Reproduce the accepted repository baseline and establish an isolated target boundary.

2. **Canonical Review Model v2 + fixture family**  
   Introduce Review, Revision, Verification Contract, Obligation, Evidence, Observation, Snapshot and Attempt contracts together with deterministic #482 fixtures.

3. **Stable Review identity + revision persistence**  
   Establish durable Review identity across multiple software revisions.

4. **Target shell + routes + state ownership + visual foundation**  
   Build the real target authenticated shell and application-state architecture.

5. **Reviews Home + Review Switcher + New Review handoff**  
   Implement work selection and cheap context switching.

6. **Progressive Verification Workstream**  
   Implement Active Review, entry resolution, Reviewer Focus, Missing Proof and Evidence Basis.

7. **Evidence relationships + technical investigation**  
   Implement proposition-relative Evidence, execution inspection and progressive technical depth.

8. **Temporal verification + Verification Delta**  
   Implement current-head versus established-basis behaviour, candidate verification, async reconciliation and changed verification meaning.

9. **Human Decision migration**  
   Move the target interface onto the preserved canonical Decision authority path.

10. **Controls + Settings**  
    Implement Verification Expectations, Connections, Capability and supporting configuration.

11. **Whole-workstation convergence**  
    Validate typography, colour, layout, responsive behaviour, keyboard interaction, accessibility, performance and adversarial fixtures.

12. **Production route cutover**  
    Move canonical authenticated routes to the accepted target workstation after replacement coverage is proven.

13. **Legacy presentation retirement**  
    Remove superseded Queue, modes, Inspector, Focus Mode, old shell composition and obsolete presentation persistence.

Existing deterministic verification, provenance, GitHub processing, manifests, fingerprints, replay and Decision services are preserved rather than recreated inside the new UI.

---

# Engineering workflow

I use AI systems as constrained engineering collaborators while retaining responsibility for architecture, product decisions, technical boundaries, evidence requirements and final integration.

For the upcoming workstation implementation, the planned workflow is:

### ChatGPT

Product, interaction and implementation specification authority.

Responsibilities include:

- preserving the frozen verification model
- defining bounded implementation slices
- protecting visual and interaction constraints
- adversarial product critique
- evaluating rendered and interaction evidence
- accepting or rejecting completed slices

### Cursor Pro+

Planned primary repository-native implementation environment.

Expected responsibilities include:

- Next.js and React implementation
- TypeScript refactoring
- CSS and responsive layout
- multi-file engineering changes
- browser debugging
- interaction implementation
- visual refinement

### Codex

Independent engineering verification and challenge.

Expected responsibilities include:

- repository diff review
- state ownership analysis
- asynchronous race analysis
- persistence correctness
- test coverage
- regression detection
- debugging
- architectural duplication checks
- adversarial engineering review

The implementation agent is deliberately not the sole verifier of its own work.

Each implementation slice follows:

```text
Contract
   ↓
Implementation
   ↓
Automated validation
   ↓
Visual evidence
   ↓
Interaction evidence
   ↓
Independent engineering review
   ↓
Adversarial review
   ↓
Accept or revise
   ↓
Freeze
```

A successful TypeScript compile or production build is necessary but not sufficient for acceptance.

---

# Architecture

## Current implemented path

```text
Pull request or diff
        ↓
Deterministic analysis
        ↓
Optional guarded model assistance
        ↓
Typed review structures
        ↓
Evidence, missing proof and readiness information
        ↓
Human Decision support
```

## Target verification architecture

```text
Software change
        ↓
Persistent Review
        ↓
Immutable Revisions
        ↓
Verification Contract
        ↓
Verification Obligations
        ↓
Evidence + Observations
        ↓
Established Verification Snapshot
        ↓
Verification Delta
        ↓
Readiness
        ↓
Accountable Human Decision
```

The target architecture above is fully specified for the upcoming workstation implementation.

It should not be read as already shipped functionality.

---

# Security and trust boundaries

Credentials, installation tokens, webhook secrets and authorisation headers remain outside browser state.

Raw webhook payloads, credentials and security-sensitive request material are excluded from persisted Review records where appropriate.

Model-assisted analysis may send submitted content to the configured model provider.

Lintel does not claim that model-assisted review is local or exactly reproducible.

Producer claims do not become Evidence merely because they are machine-readable or model-generated.

The GitHub App path remains a prototype using local filesystem persistence.

The repository does not claim:

- a hosted production service
- paying customers
- production customer adoption
- shared hosted team accounts
- production enterprise deployment

---

# Technology

| Area | Technology |
| --- | --- |
| Application | Next.js App Router |
| Language | TypeScript |
| Interface | React, CSS, CSS Modules |
| Typography | Geist Sans, Geist Mono |
| Model integration | OpenAI Responses API |
| GitHub integration | GitHub App authentication, REST API, webhooks |
| Local application state | Browser storage |
| Prototype integration state | Local filesystem persistence |
| Package management | npm |

---

# Run the current canonical sample locally

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/workspace?source=fixture
```

The current fixture is read-only.

It does not make external network requests, clear requirements or record a Human Decision.

Optional model and GitHub configuration is documented in `.env.example` and the repository documentation.

---

# Current limitations

- Lintel remains a prototype and can miss or misclassify engineering concerns.
- Current implemented analysis supports engineering judgement. It does not prove that arbitrary software changes are safe.
- Lintel does not replace tests, continuous integration, static analysis, security review or human engineering judgement.
- The current GitHub App implementation uses local filesystem persistence rather than a hosted shared production service.
- The repository does not claim hosted user accounts, paying customers, shared production team collaboration or active customer deployment.
- Model-assisted analysis depends on the configured provider and may send submitted content outside the local application.
- The next-generation Verification Model v2 and Converged Verification Workstation are fully specified but are not yet implemented.
- The target persistent multi-revision Review model is upcoming implementation work rather than current repository behaviour.
- Future concepts such as Deep Verification, Preflight Verification, hosted collaboration, enterprise controls and expanded verification capabilities are exploratory product direction rather than current repository functionality.

---

# What I designed and built

I designed and built Lintel as a long-running product and engineering project spanning:

- product architecture
- frontend engineering
- deterministic verification
- model integration
- GitHub security and automation
- idempotent event processing
- provenance
- reproducibility
- failure isolation
- review evolution
- responsive interaction
- Human Decision support
- technical product documentation

After building the existing product, I completed a first-principles redesign of its verification model and logged-in workstation.

That work introduced the architecture for:

- persistent Review identity across revisions
- versioned Verification Contracts
- proposition-level Verification Obligations
- Evidence Standards and Scope
- proposition-relative Evidence
- established versus candidate verification state
- Verification Delta
- basis-bound Human Decisions
- explicit application-state ownership
- semantic navigation and restoration
- asynchronous race handling
- responsive task geometry
- progressive technical investigation
- a complete visual and interaction system
- incremental production migration
- objective implementation acceptance and cutover gates

The next engineering stage is turning that frozen architecture into the working Converged Verification Workstation while preserving the validated engineering foundations already implemented in the repository.

The project also demonstrates how I use AI-assisted engineering while retaining responsibility for product architecture, technical constraints, evidence requirements, adversarial review and final integration decisions.

---

# Product direction

Lintel is being developed around a broader engineering problem:

> **Software production capacity is increasing faster than human verification capacity.**

As implementation becomes increasingly delegated to coding agents, engineers can become accountable for software they did not personally construct line by line.

Lintel is designed for that condition:

> **accountability without complete authorship.**

Its long-term role is not to become another code-producing agent.

It is to help engineers determine:

- what needs to be established
- what is currently supported
- why
- what remains unproven
- what changed
- where human judgement is required

The optimisation target is:

> **minimum unnecessary reconstruction → maximum decision-relevant understanding and proof.**

---

# Further reading

- [Case study](docs/case-study.md)
- [Security model](docs/security-model.md)
- [Evaluation workflow](docs/evaluation.md)
- [Evaluation results](docs/evaluation-results.md)
- [Command line and GitHub Action blueprint](docs/cli-github-action-blueprint.md)

---

# Author

Built by [Denis Kapesa](https://github.com/dkapesa).

[LinkedIn](https://www.linkedin.com/in/denis-kapesa) · [GitHub](https://github.com/dkapesa)
