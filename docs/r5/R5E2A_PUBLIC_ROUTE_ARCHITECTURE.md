# R5E.2A — Public Route Architecture

**Status: ACCEPTED AND COMPLETE**

Companion to `R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT.md`.
Authoritative for which public routes exist, what each one is for, and what
does not belong on it.

Documentation only. No route was created, no navigation changed, no component
or style written.

---

## 1. Principle

A route exists because a genuine visitor question has no other home, and
because Lintel has genuine product truth that answers it. A route is not added
because another SaaS website has one, and a route is not created before there
is something true to put on it.

Six routes are approved. Ten candidates were evaluated and rejected or
deferred, each with its reason recorded in §4.

---

## 2. Approved routes

### 2.1 `/` — Home

| Attribute | Value |
| --- | --- |
| **Route path** | `/` |
| **Route name** | Home |
| **Primary audience** | An engineer or engineering lead arriving cold, plus a technical recruiter or reviewer evaluating the work |
| **Single primary purpose** | Show what a Lintel verification record is, by making one real review inspectable in place |
| **Visitor question answered** | "What is this, and what does it actually produce?" |
| **Key product truth** | The verification model — Change → Finding → Evidence → Missing proof → Requirement → Readiness → Human Decision — applied to PR #482, which stays unresolved |
| **Primary action** | `Open the sample review` → `/workspace?source=fixture` |
| **Secondary action** | `Start a review` → `/new` |
| **Required sections** | Hero copy and actions; Hero product scene in the Extended Neutral band; Finding and Evidence; Missing Proof and Requirement; Readiness and Human Decision; Trust boundary; unresolved-case handoff |
| **Product-scene types** | Framed product window; change summary; evidence sequence; missing-proof relationship; Readiness and Human Decision boundary |
| **Interaction allowance** | The accepted three interactive scenes — Hero (Overview/Finding/Readiness), Finding and Evidence (two records), Readiness (Readiness/Decision). Missing Proof stays choreography-only. This is the frozen composition and the sole exception to the one-interactive-scene-per-route rule |
| **Proof requirements** | Every canonical value visible outside every changing panel; the case stays unresolved; no outcome selected |
| **Does not belong here** | Deep workflow explanation (that is How it works); methodology and data boundaries beyond the compact trust statement (that is Trust); documents (Resources); availability detail (Trust) |
| **Current implementation status** | Implemented and accepted at the private route `/visual-lab/public-r5-reference-reconstruction`. Production `/` still renders the **superseded** `app/_public-r5/` build |
| **Planned implementation phase** | **8B.1** — transfer onto production `/` under the new shell |

### 2.2 `/product` — Product

| Attribute | Value |
| --- | --- |
| **Route path** | `/product` |
| **Route name** | Product |
| **Primary audience** | An engineer who has read Home and wants the whole surface, not the summary |
| **Single primary purpose** | Show what Lintel presents across the complete verification record, in depth |
| **Visitor question answered** | "What do I actually get to look at, and how much of the record is real?" |
| **Key product truth** | Findings with provenance; missing and unverified proof states; explicit uncertainty; merge requirements; recommendation and risk; Readiness Delta and Review Diff in the GitHub App persistence path; **Agent Change Passport declaration boundary**; local decision ledger; Case File |
| **Primary action** | `Open the sample review` → `/workspace?source=fixture` |
| **Secondary action** | `How it works` → `/how-it-works` |
| **Required sections** | The record in one view; the review queue; finding and evidence depth; requirements and readiness; Readiness Delta and Review Diff (with their persistence-path boundary stated); **the Agent Change Passport declaration boundary**; Case File and decision history; a concise availability notice pointing to Trust; a pointer to model provenance on Trust |
| **Product-scene types** | Framed product window; change summary; operational review queue (route-specific); evidence sequence; Readiness Delta (route-specific); Review Diff (route-specific); **Agent Change Passport declaration boundary (route-specific, family 15)**; technical metadata group |
| **Interaction allowance** | At most one interactive scene, using the accepted tab grammar. Everything else static or choreography-only |
| **Proof requirements** | Readiness Delta and Review Diff must state that they exist in the GitHub App persistence path; the queue must not imply shared or hosted state; no organisation analytics |
| **Does not belong here** | The verification model as a taught sequence (How it works); provenance methodology and data boundaries (Trust); availability or commercial content (Trust); any adoption or customer claim |
| **Current implementation status** | Does not exist |
| **Planned implementation phase** | 8D |

### 2.3 `/how-it-works` — How it works

| Attribute | Value |
| --- | --- |
| **Route path** | `/how-it-works` |
| **Route name** | How it works |
| **Primary audience** | An engineer deciding whether the model is sound, and a reviewer assessing product thinking |
| **Single primary purpose** | Explain the seven-step verification model as a sequence, each step backed by a real excerpt |
| **Visitor question answered** | "How does a change become a decision, step by step?" |
| **Key product truth** | The seven steps exactly as the product implements them; deterministic analysis as the baseline; model assistance as optional and identified; the human as the decision authority |
| **Primary action** | `Open the sample review` → `/workspace?source=fixture` |
| **Secondary action** | `Start a review` → `/new` |
| **Required sections** | One section per step (Change, Finding, Evidence, Missing proof, Requirement, Readiness, Human Decision), plus a closing that names what the model does not do |
| **Product-scene types** | Compact technical excerpt per step; focused code or diff context (route-specific); relationship or affected-context view (route-specific); one framed product window at the Readiness step; Readiness and Human Decision boundary |
| **Interaction allowance** | At most one interactive scene, at the Readiness step if anywhere |
| **Proof requirements** | Every step's excerpt comes from genuine canonical data; the closing states plainly that Lintel can miss or misclassify risk and does not prove safety |
| **Does not belong here** | Feature enumeration (Product); provenance and data boundaries in depth (Trust); marketing narrative; any claim that the model guarantees an outcome |
| **Current implementation status** | Does not exist as a route. The accepted Home carries a compressed version at `#how-it-works` |
| **Planned implementation phase** | 8D |

### 2.4 `/trust` — Trust

| Attribute | Value |
| --- | --- |
| **Route path** | `/trust` |
| **Route name** | Trust |
| **Primary audience** | An engineer or engineering lead assessing whether the conclusions can be relied on, and where their data goes |
| **Single primary purpose** | State what is deterministic, what is model-assisted, where data goes, what Lintel cannot do, and how a reader can run it |
| **Visitor question answered** | "Where does each conclusion come from, what happens to my code, and what are the limits?" |
| **Key product truth** | Deterministic analysis is the baseline and does not require model access; model assistance is optional, environment-configured, structurally constrained and always identified through provenance; the canonical run manifest records input, configuration and result fingerprints with a reproducibility classification; exact replay is not claimed for traceable model output; model-assisted analysis may send submitted content to the configured provider |
| **Primary action** | `Read the security model` → the security-model document |
| **Secondary action** | `Open the sample review` → `/workspace?source=fixture` |
| **Required sections** | Deterministic baseline; model-assisted analysis and provenance (the Models subsection, §3); run provenance and reproducibility; data boundaries and what leaves the machine; integration boundaries (GitHub App prototype, GitHub Action blueprint, Slack export-only); **Availability** (§4.1); limitations and what Lintel cannot do |
| **Product-scene types** | Canonical run / provenance view (route-specific); integration status (route-specific); technical metadata group; compact technical excerpt. No framed hero window |
| **Interaction allowance** | None. Every scene static |
| **Proof requirements** | Every capability statement traceable to the root README capability tables or the R4A label vocabulary; every limitation from the README's own limitations list; no enforcement, hosted, organisation or delivery claim |
| **Does not belong here** | Feature depth (Product); the taught model (How it works); pricing, plans or trials (none exist); any certification, compliance or audit claim |
| **Current implementation status** | Does not exist as a route. The accepted Home carries a four-record compact trust boundary at `#trust` |
| **Planned implementation phase** | 8E |

### 2.5 `/resources` — Resources

| Attribute | Value |
| --- | --- |
| **Route path** | `/resources` |
| **Route name** | Resources |
| **Primary audience** | A reader who wants the underlying documents rather than the presented summary |
| **Single primary purpose** | Index the **curated, approved** public documents |
| **Visitor question answered** | "Where is the detail behind all of this?" |
| **Key product truth** | Candidate sources exist in the repository — a case study, a security model, an evaluation workflow, evaluation results and a CLI/GitHub Action blueprint. **Candidacy is not publication**: each must pass the §6 curation gate before it appears |
| **Primary action** | Open a document |
| **Secondary action** | `Trust` → `/trust` |
| **Required sections** | Title and one line; the curated document list with title, one-line description, kind and destination; one filter over document kind |
| **Product-scene types** | None. Technical metadata group only |
| **Interaction allowance** | The single kind filter, which must work without JavaScript (as links or a `<form>` with a `GET`) or not render |
| **Proof requirements** | Every listed document has passed the curation gate; the list is explicit and hand-maintained, **never a directory scan**; no "coming soon" entry; the blueprint is labelled as a blueprint |
| **Does not belong here** | Marketing collateral; a blog; internal R4/R5 milestone contracts; human-review, evidence or acceptance packages; anything not deliberately authored and approved for a public audience |
| **Current implementation status** | Does not exist |
| **Planned implementation phase** | 8F |

### 2.6 `/docs/[slug]` — Documentation

| Attribute | Value |
| --- | --- |
| **Route path** | `/docs/[slug]` |
| **Route name** | Documentation |
| **Primary audience** | A reader following a link from Resources or Trust |
| **Single primary purpose** | Render **curated, approved** public documents as readable long-form pages |
| **Visitor question answered** | "Show me the actual document." |
| **Key product truth** | The document's own content. It may derive from a repository source or be authored for the public audience; either way it carries an explicit content decision, audience, owner, product-truth review and publication status |
| **Primary action** | None. Reading is the purpose |
| **Secondary action** | Previous / next document |
| **Required sections** | Document title; one metadata row (source, kind); content; previous/next |
| **Product-scene types** | Compact technical excerpt only |
| **Interaction allowance** | None |
| **Proof requirements** | The document is on the curated list. If it derives from a repository source, the route states whether it is verbatim or an adaptation and links the source. **No route may be produced by scanning a directory** |
| **Does not belong here** | Any document that has not passed the curation gate; internal milestone contracts; evidence or review packages; any call to action inside the document body |
| **Current implementation status** | Does not exist as a route. Three markdown files sit in `public/docs/` and are served statically — **their presence is not a publication decision** and each must pass the curation gate in 8F |
| **Planned implementation phase** | 8F |

---

## 3. The Models decision

**Decision: model-assisted analysis gets no independent public route. It is a
subsection of `/trust`, with a single pointer from `/product`.**

The four options were evaluated as follows.

| Option | Assessment |
| --- | --- |
| An independent public route | **Rejected.** It would give model assistance more public surface than it has product weight. The root README records deterministic analysis as the baseline and model assistance as optional and environment-configured. A dedicated route reads as the claim that Lintel is a model product; it is not, and the whole visual system deliberately refuses "AI" flourish |
| A subsection of Product | **Rejected as the primary home.** Product answers "what do I get to look at". Model provenance is not a feature to enumerate; it is a boundary to state. A pointer from Product is correct; ownership is not |
| A subsection of Trust | **Accepted.** The visitor's real question is "how much of this came from a model, and how do I tell?" — a provenance and boundary question, which is exactly Trust's subject. Violet is already restricted to explicit model provenance, so the visual vocabulary is already Trust's |
| No immediate route | **Rejected.** The question is genuine and unavoidable for an engineering audience; leaving it unanswered would be a product-truth gap, not restraint |

Supporting constraint: `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §6 permits
a navigation group only when at least two genuine supporting pages exist
beneath it. Model provenance is one subject, not two.

**Revisit trigger.** A `/trust/models` child route may be proposed under a
separate human decision if all three become true: model-assisted analysis
gains its own public configuration surface; evaluation results specific to
model assistance are published publicly; and the provenance vocabulary grows
beyond what one Trust section can hold.

---

## 4. Commercial and availability

### 4.1 No `/pricing` route

The repository has no plan, no price, no hosted availability, no trial, no
organisation feature and no billing. The root README states hosted deployment
is **"Not claimed"** and lists hosted persistence, shared team workflows,
private repository support and production access control as **planned**.

A pricing route would therefore contain either an invented commercial offer —
prohibited by the product-truth contract — or a single negative statement,
which is a placeholder destination that navigation would have to carry.

**Decision: no `/pricing` route.** `/trust` carries one **Availability**
section stating truthfully:

1. Lintel runs locally from this repository;
2. there is no hosted service, no account, no sign-up, no trial;
3. there are no plans and no prices;
4. GitHub App capability is an environment-configured prototype using local
   filesystem persistence;
5. what a reader can do today: run the fixed sample review, or analyse a
   public pull request or a pasted diff locally.

`/pricing` is created only when a genuine commercial offer exists, under a
separate human decision, using the commercial route template already defined
in the primary contract §15f.

### 4.1.1 Availability ownership across routes

Refined so a visitor never has to discover Trust before learning whether
Lintel can currently be used.

| Route | Availability responsibility |
| --- | --- |
| `/trust` | **Owns the complete canonical Availability section** — current run mode, no hosted service, no plans, no trial, no billing, no commercial commitment. The single source of commercial status |
| `/product` | Carries a **concise availability notice or pointer** — one or two sentences plus a link to Trust. States the run mode and the absence of a hosted service; does not restate plans, trial or billing detail |
| `/docs/*` | **May** explain local setup and evaluation. **Must not** become the canonical commercial-status source; any commercial statement links to Trust rather than restating it |
| `/` | **May** link to the sample review and the start-review flow without implying hosted availability. Makes no commercial statement |

Where two routes state the same fact, Trust is authoritative and the other
route's wording must be a strict subset of it. No route invents a commercial
offering.

### 4.2 Legal, status and contact

| Destination | Decision | Trigger for revisiting |
| --- | --- | --- |
| `/legal/privacy`, `/legal/terms` | Deferred. The public site collects no data, sets no analytics, sets no non-essential cookie and offers no account | **Required** on the first of: a hosted service, any account or sign-in, any analytics or third-party script, any visitor-input form, or any commercial offer |
| `/status` | Not created. There is no hosted service to report status for | A hosted service ships |
| `/contact` | Deferred. The root README already carries genuine author links; a contact route with no staffed destination is a placeholder | A monitored contact destination genuinely exists |

The legal-route composition template is defined in advance (primary contract
§15g) so the trigger can be satisfied without reopening the design system.

---

## 5. Routes evaluated and not created

| Candidate | Decision | Reason |
| --- | --- | --- |
| Pricing | Deferred | §4.1 |
| Models | Not a route | §3 |
| Changelog | Not created | No public release history exists to publish |
| Customers / case studies / testimonials | Not created, prohibited | No customer exists. Publishing one would violate the product-truth contract |
| Careers | Not created | No hiring exists |
| About | Not created | The root README's author section already carries this truthfully; a route would duplicate it with no added truth |
| Blog | Not created | No content exists, and none answers a visitor question the six routes leave open |
| Status | Not created | §4.2 |
| Contact | Deferred | §4.2 |
| Legal | Deferred with a named trigger | §4.2 |
| Security | Not a route | Superseded by `Trust` in `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §1. The content is a Trust section; `docs/security-model.md` is a Documentation page |
| Integrations (public) | Not created | `/integrations` already exists as a product route. A public duplicate would claim more integration capability than the prototype supports |
| Sign in / Sign up / Account | Not created, prohibited | No hosted account exists. `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §2 already records these as absent |
| Book a demo / Request access / Contact sales | Not created, prohibited | No sales motion, no demo capacity, no access programme exists |
| Newsletter | Not created | No list exists, and a capture form would be the public system's only visitor-input surface |
| Search | Not created | Six routes do not justify search. A search box with nothing behind it is a placeholder |

---

## 5.1 Public documentation curation boundary

**Binding on `/resources`, `/docs/*` and Phase 8F.**

1. `/resources` and `/docs/*` expose **only deliberately authored and approved
   public-facing material.**
2. Internal R4 and R5 milestone contracts are **not** public documentation by
   default. `docs/r4/**` and `docs/r5/**` are internal decision records,
   including this document.
3. Human-review packages, visual-evaluation packages, browser evidence,
   acceptance records and implementation scratch material are **not** public
   resources — every `*_PACKAGE/` and `*_EVIDENCE/` directory is excluded.
4. Existing repository documents **may inform** public writing, but are **not**
   automatically rendered, linked, indexed or mapped to routes.
5. Every public document requires an explicit content decision, a named
   audience, a named owner, a product-truth review and a publication status.
6. Phase 8F builds **curated public content**, not a generic repository
   document browser.
7. **No filesystem-driven automatic publication is authorised** — no glob, no
   directory scan, no "render everything under `docs/`".

### The curation gate

A document becomes public only after all six are recorded:

| # | Gate | Recorded in |
| --- | --- | --- |
| 1 | Content decision — the explicit decision to publish | The 8F milestone record |
| 2 | Audience | Same |
| 3 | Owner | Same |
| 4 | Product-truth review against the capability tables and R4A vocabulary | Same |
| 5 | Publication status — `published` / `draft` / `internal`; only `published` renders | The curated list |
| 6 | Source — the repository document it derives from, if any, and whether it is verbatim or an adaptation | The curated list |

The three files already sitting in `public/docs/` are **candidates, not
publications.** Their presence predates this contract and carries no
publication decision. Each passes the gate in 8F or it does not render.

Consequence for indexing: the sitemap is generated from the curated list and
the navigation data, never from the filesystem, so an unpublished document
cannot leak into it by existing on disk.

## 6. Navigation consequence

Navigation stays flat and unchanged in shape:

```
Lintel

Product
How it works
Trust

Open the sample review
```

Three changes follow from this architecture, all of them anticipated by the
accepted navigation contract:

1. **The three labels become route destinations** (`/product`,
   `/how-it-works`, `/trust`) once 8D and 8E ship, rather than in-page anchors.
   `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §7.4 already required the
   navigation component to be able to express "current page" as well as
   "current section", precisely for this moment.
2. **A mobile disclosure menu becomes necessary** at ≤767px, under the eight
   strict conditions in the primary contract §7e. It is built in 8B and
   populated in 8D. Until a second route exists, the mobile header keeps the
   accepted identity-plus-action form.
3. **Resources and Documentation live in the footer**, not in primary
   navigation, until they justify promotion.

No dropdown is introduced. The future-dropdown rule — a group requires at
least two genuine supporting pages beneath it — stays in force. Under this
architecture, Trust would be the first candidate to earn one, if a
`/trust/models` child route is ever approved alongside a second Trust child.

---

## 7. Route-purpose matrix

One row per approved route, across all fifteen required attributes. Read with
§2, which carries the same attributes in full sentences.

| # | Path | Name | Audience | Purpose | Question | Key truth | Primary action | Secondary action | Sections | Scene types | Interaction | Proof | Excluded | Status | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/` | Home | Engineer arriving cold; technical reviewer | Make one real review inspectable | "What is this and what does it produce?" | The seven-step model on PR #482, unresolved | Open the sample review | Start a review | 7 | 5 families | 3 accepted scenes (frozen) | Canonical values outside panels; case unresolved | Deep workflow; methodology; documents | Accepted, private only | **8B.1** |
| 2 | `/product` | Product | Engineer wanting the full surface | Show the complete record in depth | "What do I get to look at?" | Findings, provenance, missing proof, requirements, Delta, Diff, **Change Passport boundary**, Case File | Open the sample review | How it works | 8 | 8 families | ≤1 scene | Delta/Diff persistence-path boundary stated; passport declarations never called verified | Taught model; provenance depth; canonical commercial status | Does not exist | 8D |
| 3 | `/how-it-works` | How it works | Engineer judging the model | Teach the seven-step sequence | "How does a change become a decision?" | The seven steps as implemented | Open the sample review | Start a review | 8 | 5 families | ≤1 scene | Real excerpts; states what the model cannot do | Feature enumeration; boundaries depth | Does not exist | 8D |
| 4 | `/trust` | Trust | Engineer assessing reliability and data flow | State provenance, boundaries, limits, availability | "Where does this come from and what are the limits?" | Deterministic baseline; optional identified model assistance; run provenance; no exact replay | Read the security model | Open the sample review | 7 | 4 families | None | Every claim traced to README or R4A | Feature depth; taught model; pricing | Does not exist | 8E |
| 5 | `/resources` | Resources | Reader wanting source documents | Index **curated, approved** documents | "Where is the detail?" | A hand-maintained curated list | Open a document | Trust | 3 | Metadata only | 1 filter | Every document passed the curation gate; never a directory scan | Marketing collateral; internal contracts; evidence packages | Does not exist | 8F |
| 6 | `/docs/[slug]` | Documentation | Reader following a link | Render **curated** documents | "Show me the document." | The document's own content, with source and adaptation stated | None | Previous / next | 4 | Excerpt only | None | On the curated list; verbatim or adaptation declared | Anything not through the gate | Candidates only, in `public/docs/` | 8F |

---

## 8. Acceptance checklist

1. Six routes are approved, and each has exactly one primary purpose. ☑
2. Every route answers a genuine visitor question no other route answers. ☑
3. No route was added because another SaaS website has it. ☑
4. Models is a Trust subsection, and the decision is explained. ☑
5. No `/pricing` route exists; availability is truthful and lives on Trust. ☑
6. Legal, status and contact are deferred with named triggers. ☑
7. Every destination in the architecture resolves to something real; no
   placeholder exists. ☑
8. Navigation stays flat, and the future-dropdown rule holds. ☑
9. Home's frozen composition and interaction are unchanged. ☑
10. No route was created, and no navigation was modified, by this document. ☑
11. The documentation curation boundary is binding: no filesystem-driven
    publication, and internal contracts and evidence packages are excluded. ☑
12. Availability ownership is clear — Trust canonical, Product a pointer,
    Documentation not canonical, Home silent on commercial status. ☑
13. The Agent Change Passport is classified as implemented but bounded, and
    appears on Product as scene family 15. ☑

Final human acceptance closed this checklist on 6 August 2026. Phase 8A is
**ACCEPTED AND COMPLETE**; no route implementation was performed.
