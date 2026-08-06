# R5E.2A — Cross-route Public Design-System Contract

## 1. Status

**Status: ACCEPTED AND COMPLETE**

**Branch:** `r5e2-cross-route-public-design-system-contract`

**Milestone:** Phase 8A — Cross-route Public Design-System Contract.

**Preceding milestone:** Phase 7.1F
(`R5E1E5F_FINAL_SURFACE_PUBLIC_VISUAL_FREEZE.md`), **ACCEPTED AND COMPLETE**.
Phase 7.1 is formally closed.

This is a contract and architecture milestone only. No design system was
implemented, no public route created, no navigation changed, no production
homepage touched, no accepted Hero altered, no logged-in Workspace modified,
and no component, CSS file, asset or dependency added. Nothing was staged,
committed, pushed or merged.

Final human acceptance closed Phase 8A on 6 August 2026. Section 26 records
the binding decision. Phase 8B — the shared public shell — is authorised next.

## 2. Purpose

Phase 7 and Phase 7.1 produced one accepted public page. It exists at exactly
one private route. There is no second public route, no shared public shell, no
shared public token layer, and three separate public implementation families
that each own a private copy of the same header, footer, token set and
stylesheet.

Phase 8A defines one coherent public design system for all genuine Lintel
public routes, in enough detail that Phase 8B–8H can implement without
reopening broad visual strategy.

The contract answers twelve questions:

1. what is globally shared (Sections 7–13, 16–19);
2. what may vary by route (Section 15);
3. which public routes should exist (Section 6, and
   `R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md`);
4. what purpose each route serves (same);
5. what public shell every route uses (Section 7);
6. how technical product information is presented (Section 13);
7. which product-scene types are genuinely reusable (Section 14);
8. how responsive behaviour works (Section 18);
9. how motion, accessibility and fallbacks work (Sections 16, 17);
10. what implementation sequence follows (Section 23, and
    `R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`);
11. what is frozen and cannot be silently changed (Sections 4, 24);
12. what remains intentionally deferred (Section 25).

This is not a page-design exercise. It produces no route mockup, no visual
mini-site, and no screenshot.

## 3. Authoritative inputs

### 3a. Accepted decision records

1. `docs/r5/R5E1E5F_FINAL_SURFACE_PUBLIC_VISUAL_FREEZE.md` — the binding
   Phase 7.1 freeze and the Phase 8 handoff.
2. `docs/r5/R5E1E5E_ACCEPTED_SURFACE_HIERARCHY_PROPAGATION.md` — the accepted
   propagation and its evidence.
3. `docs/r5/R5E1E5D_HUMAN_AND_CLAUDE_VISUAL_EVALUATION.md` — the human
   decision selecting Extended Neutral (72/75), and the recorded lesson that
   the transferable Cursor quality is staging, spacing and scale rather than
   imagery.
4. `docs/r5/R5E1E5A_SURFACE_HIERARCHY_VISUAL_DIRECTION_CONTRACT.md` — the
   four-tier surface grammar (S0 editorial white, S1 neutral technical plate,
   S2 companion presentation surface, S3 primary presentation surface).
5. `docs/r5/R5E1E4D_FINAL_INTERACTION_REVIEW.md` — the closed Phase 7
   interaction, responsive and accessibility gate.
6. `docs/r5/R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` — the single
   public token registry, contrast obligations, semantic colour, typography
   rules, image policy, reference boundary, originality tests, and the
   Phase 7.1F zero-image reconciliation addendum.
7. `docs/r5/R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` — navigation
   destinations, header and footer contracts, the future-dropdown rule and
   navigation accessibility.
8. `docs/r5/R5E1E4A_PREMIUM_INTERACTION_ARCHITECTURE_CONTRACT.md` and
   `docs/r5/R5E1E4A2_MOTION_CHOREOGRAPHY_CONTRACT.md` — the accepted control
   grammar and exact motion vocabulary.
9. `docs/r5/README.md` — milestone status and authority order.

### 3b. Accepted implementation

10. `app/_public-r5-reference-reconstruction/` — the accepted implementation.
11. `app/visual-lab/public-r5-reference-reconstruction/` — the accepted
    private route, rendering `heroPresentation="extended-neutral"`.

### 3c. Current public implementation families

12. `app/page.tsx` — the production homepage, which currently renders the
    superseded `app/_public-r5/` build.
13. `app/_public-r5/` — the R5D/R5E image-led public implementation.
14. `app/_public-r5-recalibrated/` — the rejected sticky-Workspace
    architecture, retained for comparison.
15. The private visual-lab routes under `app/visual-lab/`.

### 3d. Product truth

16. Root `README.md` — implemented capability, prototype capability, planned
    capability and current limitations. Used only to establish what may
    truthfully be claimed.
17. `docs/r4/R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md` — the binding
    product-truth label vocabulary, Human Decision safeguards,
    requirement-action safeguards, and keyboard and focus principles.
18. `docs/r4/R4B_ROUTE_OWNERSHIP_AND_CAPABILITY_MATRIX.md` — logged-in route
    ownership, referenced only where a public route points at a real product
    surface.

### 3e. Bounded supporting evidence

19. `R5E1E5F_FINAL_SURFACE_PUBLIC_VISUAL_FREEZE_PACKAGE/PHASE_8_HANDOFF.md`,
    `FROZEN_SURFACE_HIERARCHY.md`, `FROZEN_DIMENSION_MATRIX.md`,
    `ACCESSIBILITY_FALLBACK_FREEZE.md`, `PERFORMANCE_FREEZE.md`,
    `PRODUCT_TRUTH_BOUNDARIES.md`, `FUTURE_REVISION_RULES.md`.

No recording was reanalysed. No rejected imagery or retired surface candidate
was reopened. No audit of backend or logged-in implementation was conducted
beyond what public product truth requires.

### 3f. Reference responsibilities

Preserved exactly as accepted. References inform operating quality; none
authorises copying assets, proprietary layouts, brand language or route
structures.

| Reference | Responsibility |
| --- | --- |
| Cursor | Premium product-led composition, scale, spacing, staging, public consistency, restrained motion |
| Skybase | White-canvas implementation discipline, restrained presentation framing |
| incident.io | Consequential-action clarity, trust communication, operational credibility |
| Attio | Structured metadata, relationships, categorisation, compact information clarity |
| Vercel | Technical tables, filters, identifiers, versions, engineering metadata |
| GitHub | Pull-request vocabulary and familiar repository terminology only |
| Lintel | All verification semantics, evidence relationships, product truth, Readiness Delta, Review Diff, Agent Change Passport, Human Decision authority |

`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §6c previously excluded
Vercel and bounded Attio. The Phase 8 task brief reintroduces Vercel under one
narrow responsibility — technical tables, filters, identifiers, versions and
engineering metadata — and this contract adopts that bound and no more. Vercel
contributes nothing to the outer visual identity, navigation, colour, brand
language or route structure.

## 4. Frozen Phase 7.1 inputs

These are binding on every Phase 8 milestone. Phase 8 may reuse them. It may
not silently alter them.

### 4a. Hero hierarchy

White editorial page canvas → Extended Neutral presentation band → opaque
white product frame. The band surrounds only the Hero product scene. Hero copy
and actions remain on the white editorial canvas. The product frame remains
dominant. Both band and frame are opaque.

The band is decorative and non-semantic, absent from the accessibility tree,
static, asset-free, in normal document flow, and creates no internal
scrolling. **It is not a generic cross-route decorative container** and may
not become one without explicit, separately accepted Phase 8 justification.

### 4b. Frozen Hero dimension matrix

Visible space from the product-frame edge to the outer band edge.

| Viewport width | Top | Left/right | Bottom | Treatment |
| --- | ---: | ---: | ---: | --- |
| At least 1440px | 88px | 56px | 64px | Extended Neutral |
| 1280–1439px | 80px | 48px | 56px | Extended Neutral |
| 1025–1279px | 72px | 40px | 48px | Extended Neutral |
| 768–1024px | 64px | 32px | 40px | Extended Neutral |
| 360–767px | 56px | 20px | 40px | Extended Neutral |
| Below 360px | 12px | 12px | 12px | Compact neutral fallback |

**This matrix belongs to the Hero primitive only.** It is explicitly not the
default spacing rule for other product scenes, and Section 10 defines the
separate cross-route spacing scale that governs them.

### 4c. Frozen Hero material policy

No image, texture, gradient, glow, glass, backdrop blur, heavy shadow,
background animation, video, grain, procedural noise, or runtime surface
asset. The band is opaque CSS paint. The frame is opaque white.

### 4d. Frozen downstream hierarchy

Finding and Evidence remains neutral and technical. Missing Proof and
Requirement remains neutral. Readiness and Human Decision remains neutral and
receives no companion image or extended decorative surface. Trust, the
unresolved-case handoff and the footer remain on the white editorial canvas.
No full-width coloured or dark section is introduced. All public scenes remain
in normal document flow.

### 4e. Frozen interaction model

The accepted Hero controls remain Overview / Finding / Readiness. The bounded
one-shot H1–H3 automatic sequence remains. Manual visitor intent becomes and
stays authoritative; automatic behaviour never reclaims authority after
interaction. Selected-state reactivation, Arrow keys, Home, End, visible
focus, reload reset to the accepted initial state, and scroll-away/return
preservation of manual intent remain required. There is no scroll-controlled
global state, sticky product Workspace, background surface motion, fake
analysis execution or decorative interaction.

### 4f. Frozen resilience requirements

Reduced motion, no JavaScript, forced colours, keyboard operation, the
responsive matrix and 200% zoom reflow remain binding exactly as recorded in
`R5E1E5F` §10–§15.

### 4g. Frozen Hero performance budget

Zero image requests, zero external requests, zero runtime surface
transformation, zero background video, zero background-animation library, zero
layout-measurement script, zero model call, zero surface-driven hydration
dependency, no product delay caused by presentation, and no layout shift
caused by the neutral band.

### 4h. Future revision gate

Any change to the frozen Hero treatment or matrix requires a scoped
visual-system revision, responsive evidence, accessibility regression testing
and explicit human acceptance. Future imagery additionally requires a new
explicit image-policy amendment. Historical candidate authority cannot be
reused implicitly.

## 5. Current-state inventory

Recorded from the repository on 6 August 2026. No file was modified during the
inventory. Full detail is in
`R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT_PACKAGE/CURRENT_PUBLIC_INVENTORY.md`.

### 5a. Preflight

Branch `r5e2-cross-route-public-design-system-contract`. Nothing staged.
`git diff --check` clean. `git diff` against `app`, `lib`, `public`,
`package.json`, the lockfile and `.claude/launch.json` all empty — zero
tracked implementation drift. History carries `981dc75` and `bf75709`
(Phase 7.1F freeze) and `d653f78` (main/origin reconciliation). The working
tree holds only the twenty-seven historical untracked review packages, all
untouched. No Phase 8 implementation exists.

### 5b. Public routes

| Route | Renders | Indexing | Status |
| --- | --- | --- | --- |
| `/` | `app/_public-r5/PublicR5Page` | `index: true` | Production, but renders the **superseded** image-led build |
| `/visual-lab/public-r5` | same shared `app/_public-r5/` | noindex | Private historical lab |
| `/visual-lab/public-r5-recalibrated` | `app/_public-r5-recalibrated/` | noindex | Private, rejected architecture, retained for comparison |
| `/visual-lab/public-r5-reference-reconstruction` | `app/_public-r5-reference-reconstruction/`, `heroPresentation="extended-neutral"` | noindex | **The accepted public direction** |
| `/visual-lab/public-r5-surface-comparison` and its four variants | `SurfaceComparisonVariant` | noindex | Private Phase 7.1C diagnostic laboratory |
| `/visual-lab/landing-v3`, `/visual-lab/workspace-v2`, `/visual-lab/workspace-r4` | lab implementations | noindex | Private historical labs |
| `/lvos/typography-proof` | typography proof | noindex | Private |

The single most consequential inventory fact: **the accepted public direction
is not what the public sees.** Production `/` still renders the R5D/R5E
image-led build. R5E.1F, the transfer milestone, is recorded in
`docs/r5/README.md` as "not started".

### 5c. Logged-in and product routes

`/workspace`, `/workspace-v2`, `/workspace-legacy`, `/new`, `/report`,
`/home`, `/review-operations`, `/review-policies`, `/team`, `/integrations`,
`/github-action`, `/slack-handoff`, `/settings`, and the API routes under
`app/api/`. These are outside Phase 8's authorised scope except as truthful
destinations of a public action.

### 5d. Route metadata

`app/page.tsx` sets `robots: { index: true, follow: true }` and a truthful
title and description, and deliberately leaves `metadataBase` and the
canonical URL unset because no production origin is configured. Every
`visual-lab` and `lvos` route sets explicit `noindex, nofollow`.

**Gap:** the logged-in product routes set no `robots` metadata at all, so they
default to indexable. There is no `app/robots.ts`, no `app/sitemap.ts`, and no
`next.config.*` in the repository. Phase 8 must resolve public indexing
policy deliberately rather than by omission.

### 5e. Public navigation destinations

| Implementation | Labels | Destinations |
| --- | --- | --- |
| `app/_public-r5/content.ts` (production `/`) | Product, How it works, **Security** | `#investigation-workspace`, `#verification-model`, `#trust-architecture` |
| `app/_public-r5-reference-reconstruction/reconstruction-content.ts` (accepted) | Product, How it works, Trust | `#product`, `#how-it-works`, `#trust` |

Production still carries the `Security` label that
`R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §1 formally superseded with
`Trust`. Public actions are `Open the sample review` →
`/workspace?source=fixture` (primary) and `Start a review` → `/new`
(secondary). No public route today has a route-level destination other than
`/`; every navigation label resolves to an in-page anchor.

### 5f. Footer destinations

The accepted footer carries identity, one purpose line, the same three in-page
links, a copyright line, and a private-laboratory boundary note. There is no
legal page, no status page, no contact destination, no newsletter and no
social link anywhere in the public system.

### 5g. Shared and duplicated public components

Nothing is shared. Three families each own a complete private copy:

| Responsibility | `_public-r5` | `_public-r5-recalibrated` | `_public-r5-reference-reconstruction` |
| --- | --- | --- | --- |
| Header | `PublicR5Header.tsx` | `PublicPrototypeHeader.tsx` | `PublicHeader.tsx` |
| Footer | `PublicR5Footer.tsx` | (in prototype root) | `PublicFooter.tsx` |
| Tokens + stylesheet | `public-r5.module.css` | `public-r5-recalibrated.module.css` | `reference-reconstruction.module.css` (1,984 lines) |
| Content | `content.ts` | `prototype-content.ts` | `reconstruction-content.ts` |
| Canonical product data | (local) | `canonical-review.ts` | imports `canonical-review.ts` |

Each stylesheet declares its own copy of the public token family. The accepted
stylesheet states explicitly that no class or custom property in it is shared
with the other two families, so that deleting the directory leaves every other
route byte-identical. That isolation was correct for a laboratory. It is the
precise thing Phase 8 must replace with one owned shared layer.

The only genuine cross-family sharing today is `canonical-review.ts`, imported
rather than restated — which is the pattern the shared system should extend.

### 5h. Typography definitions

`app/layout.tsx` loads Geist Sans (`--font-geist`), Geist Mono
(`--font-geist-mono`) and Newsreader (`--font-newsreader`). Newsreader is
scoped to the historical `.lp` landing only and has no role in the accepted
public direction. The accepted stylesheet uses `var(--font-geist)` and
`var(--font-geist-mono)` exclusively.

Accepted values measured from the accepted stylesheet: hero headline
`clamp(34px, 4.2vw, 52px)` / 1.06 / -0.02em / 620; section headline
`clamp(26px, 2.4vw, 34px)` / 1.14 / -0.018em / 620; hero supporting 17px /
1.55 at 62ch; section supporting 16px / 1.6 at 46ch; scene caption 13px /
1.55 at 62ch; navigation 13px; button 13px / 600; brand 15px / 600 /
-0.01em; mono 12.5px / -0.01em; micro label 12px / 600 / 0.06em uppercase.

### 5i. Layout containers and grid

`--pub-max: 1300px`; `--pub-gutter: 32px` desktop, 24px at ≤1024px, 20px at
≤767px; `--section-pad: 88px`, 72px at ≤1279px, 56px at ≤1024px, 40px at
≤767px; `--split-gap: 56px`, 44px at ≤1279px, 32px on collapse;
`--header-h: 62px`; split grid `minmax(0, 360px) minmax(0, 1fr)` (340px at
≤1279px), reversed by grid placement rather than DOM order;
`--scene-plate-inset: 26px` desktop, 20px at ≤1279px, 18px at ≤1024px, 12px at
≤767px.

### 5j. Responsive breakpoints

Five accepted tiers: ≥1280px, 1025–1279px, 768–1024px (the split collapses at
≤1024px, corrected in R5E.1E.3 from 1023px on genuine 1024×768 evidence),
360–767px, and ≤359px compact fallback. Special-state blocks exist for
`prefers-reduced-motion: reduce` and `forced-colors: active`.

### 5k. Button and link patterns

One button primitive: `.btn` + `.btnPrimary` (black fill, white label) or
`.btnSecondary` (transparent, hairline border) + `.btnCompact` (8/14px) or
`.btnRegular` (11/18px), 6px radius, 13px/600 label, `min-height: 44px` below
768px. One navigation link pattern: 13px secondary text, primary on hover, and
a bottom border plus `aria-current` when active. Focus is a global
`2px solid var(--pub-focus)` at `outline-offset: 2px`.

### 5l. Product-scene patterns

Four accepted scenes exist: `HeroReviewScene`, `FindingEvidenceScene`,
`MissingProofRequirementScene`, `ReadinessDecisionScene`, plus the shared
`PublicScenePanel`, `PublicSceneTab`, `PublicSceneViews` and `SceneMotion`
primitives, and the `.scenePlate` / `.sceneFrame` / `.sceneChrome` shell.
Three of the four scenes are interactive; Missing Proof is choreography-only
by accepted decision.

### 5m. Accessibility utilities

`.skip` skip link, `.visuallyHidden`, the global focus-visible rule, one H1
per page with an ordered H2 descent, `aria-labelledby` on every section,
`role="group"` with `aria-label` on split scenes, `aria-current` for active
navigation, and `scroll-margin-top: var(--header-h)` on anchor targets.

### 5n. Motion utilities

`SceneMotion.tsx` is the only motion client boundary: an `IntersectionObserver`
arms a `data-motion` attribute and CSS `transition-delay` drives the rest,
with one timer per scene. Tokens: 90 / 140 / 260 / 300 / 380 / 420ms
durations; 760 / 980 / 1220ms reading pauses; standard
`cubic-bezier(0.2, 0.8, 0.2, 1)`, panel `(0.4, 0, 0.2, 1)`, selection
`(0, 0, 0.2, 1)`; 8px enter travel (4px below 768px), 4px panel travel (2px
below 768px). No animation library, no `will-change`, no live region.

### 5o. Dependencies and assets

`package.json` declares exactly `next`, `react` and `react-dom`, with
TypeScript and type packages in development. There is no animation library, no
UI library, no CSS framework, and no test or lint script.

`lib/` **does exist**, with 43 tracked files including `change-passport.ts`,
`canonical-review-run.ts`, `evidence-hierarchy.ts`, `readiness-delta.ts`,
`merge-contract.ts`, `verification-pack.ts`, `builder-verifier-boundary.ts`,
`human-decision-ledger.ts` and the GitHub App modules. This corrects an error
in the first issue of this document, which recorded `lib/` as absent on the
strength of a directory listing that returned no output. The correction is
material: `lib/` is where the product truth this contract governs actually
lives, and Section 22 depends on it.

`public/` holds `public/r5/scenes/` — ten screenshot assets totalling
approximately 1.5MB, used only by the superseded `app/_public-r5/` build — and
`public/docs/` with three genuine markdown documents (`security-model.md`,
`evaluation-results.md`, `cli-github-action-blueprint.md`).

### 5p. Truthful and placeholder destinations

Every destination in the accepted implementation resolves to something real:
`/`, `#product`, `#how-it-works`, `#trust`, `/workspace?source=fixture`,
`/new`. Nothing is disabled, greyed or labelled "coming soon". There are no
placeholder destinations anywhere in the public system, and Phase 8 must not
introduce any.

## 6. Public information architecture

The complete route-purpose matrix — path, name, audience, single purpose,
visitor question, key product truth, primary and secondary action, required
sections, scene types, interaction allowance, proof requirements, excluded
content, implementation status and planned phase — is in
`R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md`. This section records the decisions.

### 6a. Approved public routes

| Path | Name | Purpose in one line | Phase |
| --- | --- | --- | --- |
| `/` | Home | Show the verification record and make one review inspectable | 8B.1 (transfer of the accepted page) |
| `/product` | Product | Show what Lintel presents across the whole record, in depth | 8D |
| `/how-it-works` | How it works | Explain the seven-step verification model as a sequence | 8D |
| `/trust` | Trust | State what is deterministic, what is model-assisted, where data goes, what Lintel cannot do, and how to run it | 8E |
| `/resources` | Resources | Index the genuine documents that already exist | 8F |
| `/docs/[slug]` | Documentation | Render the real repository documents as long-form public pages | 8F |

Four of these are navigation destinations: Home, Product, How it works, Trust.
Resources and Documentation are reachable from the footer and from Trust, not
from primary navigation, until they justify promotion.

### 6b. Routes evaluated and not created

| Candidate | Decision | Reason |
| --- | --- | --- |
| Pricing | **Not created.** Deferred. | No plan, price, hosted service, trial, billing or organisation feature exists. The root README states hosted deployment is "Not claimed". A truthful availability statement lives on Trust instead. Section 6d. |
| Models / Model-assisted analysis | **Not an independent route.** A Trust subsection, with a pointer from Product. | Section 6c. |
| Changelog | Not created. | No public release history exists to publish. |
| Customers, case studies, testimonials | Not created, and prohibited. | No customer exists. Section 22. |
| Careers, About, Blog | Not created. | No content exists and none serves the visitor question. |
| Status | Not created. | No hosted service exists to report status for. Revisit only if a hosted service ships. |
| Contact | Deferred, not created. | The root README already carries genuine author links. A contact route with no staffed destination would be a placeholder. |
| Legal (privacy, terms) | Deferred with a named trigger. | No data is collected by the public site today. Section 6e. |
| Security | Not created as a route. | Superseded by `Trust` in `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §1; the security content is a Trust section, and `docs/security-model.md` is a Documentation page. |
| Integrations (public) | Not created. | `/integrations` already exists as a product route. A public duplicate would claim more integration capability than the prototype supports. |

No route is added because another SaaS website has it. Each approved route
exists because a genuine visitor question has no other home.

### 6c. The Models decision

**Model-assisted analysis does not get an independent public route. It is a
subsection of Trust, with a single pointer from Product.**

Three reasons, in order of weight:

1. **Product truth.** The root README records deterministic analysis as the
   baseline and model assistance as *optional, environment-configured*
   capability. `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §3 restricts
   violet to explicit model provenance and prohibits it as an "AI" flourish.
   A dedicated route would give model assistance more public surface than it
   has product weight, and would read as the claim that Lintel is a
   model product. It is not.
2. **Visitor question.** The question a visitor actually asks is not "what
   models do you use" but "how much of this conclusion came from a model, and
   how do I tell?" That is a provenance and boundary question, and provenance
   and boundaries are Trust's subject.
3. **Route discipline.** `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §6
   permits a navigation group only when at least two genuine supporting pages
   exist beneath it. Model provenance is one subject, not two.

The trigger for revisiting: if model-assisted analysis gains its own
configuration surface, its own evaluation results published publicly, and its
own provenance vocabulary that Trust cannot hold in one section, then a
`/trust/models` child route may be proposed under a separate decision.

### 6d. Pricing and availability

No `/pricing` route is created, and none is placed in navigation. Instead
Trust carries one **Availability** section stating truthfully:

1. Lintel runs locally from this repository;
2. there is no hosted service, no account, no sign-up and no trial;
3. there are no plans and no prices;
4. GitHub App capability is an environment-configured prototype with local
   filesystem persistence;
5. what a reader can do today is run the sample review and analyse their own
   public pull request or pasted diff locally.

`/pricing` is created only when a real commercial offer exists, under a
separate human decision. Until then an empty or negative pricing route would
be a placeholder destination, which Section 5p prohibits.

**Availability ownership**, refined so a visitor never has to find Trust before
learning whether Lintel can be used:

| Route | Availability responsibility |
| --- | --- |
| `/trust` | **Owns the complete canonical Availability section**: current run mode, no hosted service, no plans, no trial, no billing, no commercial commitment. This is the single source of commercial status |
| `/product` | Carries a **concise availability notice or pointer** — one or two sentences and a link to Trust. It states the run mode and that there is no hosted service; it does not restate plans, trial or billing detail |
| `/docs/*` | **May** explain local setup and evaluation. **Must not** become the canonical commercial-status source; any commercial statement links to Trust rather than restating it |
| `/` | **May** link to the sample review and the start-review flow without implying hosted availability. It makes no commercial statement |

Where two routes state the same fact, Trust is authoritative and the other
route's wording must be a strict subset. No route invents a commercial
offering.

### 6e. Legal and policy trigger

No legal route is created in Phase 8, because the public site collects no
data, sets no analytics, sets no non-essential cookie and offers no account.
A `/legal/privacy` and `/legal/terms` pair becomes **required** on the first
of: a hosted service, any account or sign-in, any analytics or third-party
script, any form that accepts visitor input, or any commercial offer.
Section 15 defines the legal-route composition template in advance so that the
trigger can be satisfied without reopening the design system.

### 6e.1 Public documentation curation boundary

**Binding, and the single most important constraint on `/resources` and
`/docs/*`.**

1. `/resources` and `/docs/*` expose **only deliberately authored and approved
   public-facing material.**
2. Internal R4 and R5 milestone contracts are **not** public documentation by
   default. `docs/r4/**` and `docs/r5/**` are internal decision records.
3. Human-review packages, visual-evaluation packages, browser evidence,
   acceptance records and implementation scratch material are **not** public
   resources. This includes every `*_PACKAGE/` and `*_EVIDENCE/` directory.
4. Existing repository documents **may inform** public writing, but they are
   **not** automatically rendered, linked, indexed or mapped to routes.
5. Every public document requires an explicit content decision, a named
   audience, a named owner, a product-truth review and a publication status.
6. Phase 8F builds **curated public content**, not a generic repository
   document browser.
7. **No filesystem-driven automatic publication is authorised.** No glob, no
   directory scan, no "render everything under `docs/`" route.

The consequence for Section 5o's inventory: `public/docs/` currently serves
three markdown files statically. Their presence in `public/` is **not** a
publication decision — it predates this contract. Each must pass the same
five-part gate in 8F before it becomes a `/docs/*` route, and any that does not
pass stays where it is or is withdrawn.

The `/resources` route therefore indexes an **explicit, hand-maintained list**,
not a directory. Its "kind" filter filters that list.

### 6f. Navigation consequence

Navigation stays flat: `Lintel` · Product · How it works · Trust ·
`Open the sample review`. The three labels become **route** destinations
rather than in-page anchors once 8D and 8E ship, which is the change
`R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §7.4 anticipated when it required
the navigation component to be able to express "current page" as well as
"current section". No dropdown is introduced; the future-dropdown rule stays
in force.

## 7. Global public shell contract

One shell serves every public route. No route invents its own navigation or
footer.

### 7a. Structure

1. Skip link (first focusable control, targets `#main`).
2. Header: identity, route navigation, one primary action.
3. `<main id="main">` — route content.
4. Footer: identity, purpose line, grouped destinations, legal line.

### 7b. Navigation destinations and hierarchy

One flat tier. Identity → `/`. Labels: Product → `/product`, How it works →
`/how-it-works`, Trust → `/trust`. Primary action: `Open the sample review` →
`/workspace?source=fixture`. Secondary action `Start a review` → `/new`
remains a page-level action in the Hero and the closing handoff, and is **not**
added to the header.

Footer destinations are grouped and may exceed navigation, because the footer
is where genuine secondary destinations belong: Product group (Product, How it
works), Trust group (Trust, Documentation, Resources), and a boundary line.
Every footer destination must resolve to a real route or a real in-page
section; none may be a placeholder.

### 7c. Active-route treatment

Route-level active state uses `aria-current="page"` plus the accepted quiet
visual treatment: a colour step from secondary to primary text and a fine
bottom border that does not change the label's box. In-page section state,
where a route uses anchors, uses `aria-current="true"` exactly as the accepted
header does. No pill, no filled background, no sliding marker. Colour is never
the only signal.

### 7d. Desktop behaviour

White background, the same 1300px grid and gutter as the page, 62px high,
sticky, never a floating capsule, a hairline lower border that appears on
scroll **without changing any box dimension**, and no layout movement when the
sticky state changes. The header carries no product value — no
recommendation, risk, requirement count or Human Decision state.

### 7e. Mobile behaviour

Below 768px the accepted implementation removes the section links entirely and
keeps identity plus one compact action. That was correct when the labels were
in-page anchors on a single page.

**From 8D onward it is not**, because three genuine routes will exist and a
mobile visitor must be able to reach them. Phase 8B therefore introduces a
disclosure menu under strict conditions:

1. it appears only at ≤767px;
2. it is a `<button aria-expanded aria-controls>` that toggles a panel in
   normal document flow — not an overlay, not a full-screen takeover, not a
   drawer that traps the page;
3. it contains exactly the real destinations, never a placeholder;
4. without JavaScript the button is not rendered and the destinations are
   rendered as a plain list, so no control exists that cannot work;
5. focus moves into the panel on open, is contained while open, returns to the
   toggle on close;
6. Escape closes it and returns focus;
7. it closes on route change;
8. the page beneath does not scroll-lock, and no content is removed from the
   accessibility tree.

Until 8D ships a second route, the mobile header keeps the accepted
identity-plus-action form. The menu is built in 8B and populated in 8D.

### 7f. Keyboard, focus and Escape

Source and tab order: skip link → identity → navigation labels in visual order
→ primary action → main content → footer. Visible focus on every control. No
hover-only destination. No disabled or inert link. Focus is never moved by
scroll position. Escape closes the mobile menu and nothing else, because the
public shell has no other dismissible surface.

### 7g. Logo, actions and signed-in treatment

Identity always links to `/` and is always the wordmark plus the accepted 16px
mark. There is no sign-in, no account menu and no signed-in state in the
public shell, because no hosted account exists. `Open the sample review` points
at the real read-only Workspace and must remain visually distinguishable from
any in-scene control, so a visitor can tell inspecting-in-place from leaving
the page.

### 7h. Footer structure

Identity and one purpose line; grouped destinations as in 7b; a legal line
carrying copyright and, where applicable, the route's truthful boundary note.
No newsletter, no social proof, no sitemap of pages that do not exist, no
status or uptime claim, no organisation or enterprise language, no control for
a capability that does not exist.

### 7i. Width, metadata and indexing ownership

The shell uses `--pub-max: 1300px` and the page gutter at every viewport, so
header, content and footer share one alignment.

**Phase 8B owns the public route-metadata architecture** — this is a named
owner, not an open gate:

| Responsibility | Owner | Exit condition |
| --- | --- | --- |
| Public route-metadata architecture | **8B** | Every public route has a truthful title, description and explicit `robots`, produced through one shared helper |
| Canonical URL policy and `metadataBase` decision | **8B** | The policy is written and the decision recorded. Implementation is blocked until a real production origin exists; 8B records the blocker rather than fabricating an origin |
| `robots` policy | **8B** | `app/robots.ts` exists and states the policy explicitly |
| Sitemap contract | **8B** | `app/sitemap.ts` exists, generated from `app/_public/navigation.ts` — never from the filesystem |
| Logged-in route `noindex` | **Named pre-deployment safety task.** Not owned by 8B | See below |
| Cross-route metadata validation | **8G** | Metadata, canonical links, `robots` behaviour, sitemap membership and accidental indexing all validated |
| Launch-readiness statement | **8H** | Cannot be made while the logged-in indexing decision is unresolved |

Binding rules:

1. **8B may apply metadata only within its authorised public scope.** It may
   not edit the logged-in routes.
2. **Private visual-lab routes remain `noindex, nofollow`**, permanently, and
   never enter the sitemap.
3. **A public route may become indexable only when its product truth and
   content are accepted** — that is, at its own milestone gate, not when its
   file is created. A route under construction ships `noindex` and is
   promoted deliberately.
4. **Logged-in route `noindex` is a named pre-deployment safety task.** The
   logged-in routes are protected scope for every Phase 8 milestone as
   currently authorised, so no Phase 8 milestone may change them unless a
   later milestone is *explicitly* authorised to modify those protected
   routes. Until then the task is recorded, owned and unresolved — not
   silently absorbed.
5. **Phase 8H may not describe the public system as launch-ready** while the
   logged-in indexing decision remains unresolved. This is an explicit exit
   condition on 8H, not a caveat.
6. **Documentation drafts and private evidence packages never enter the
   sitemap.** The sitemap is generated from the curated navigation and
   documentation lists (Section 6e.1), so an unpublished document cannot leak
   into it by existing on disk.

### 7j. No-JavaScript behaviour

The complete shell renders server-side. Without JavaScript: every destination
resolves, the primary action works, the skip link works, the footer is
complete. The only losses are the scrolled hairline, the active-state mark and
the mobile disclosure control — each of which degrades to a truthful static
state, never to a dead control.

## 8. Grid, width and layout contract

| Property | ≥1280px | 1025–1279px | 768–1024px | 360–767px | ≤359px |
| --- | --- | --- | --- | --- | --- |
| Max page width | 1300px | 1300px | — | — | — |
| Viewport gutter | 32px | 32px | 24px | 20px | 16px |
| Section padding | 88px | 72px | 56px | 40px | 32px |
| Split gap | 56px | 44px | 32px (stacked) | 32px (stacked) | 24px |
| Copy column | 360px | 340px | full | full | full |
| Scene plate inset | 26px | 20px | 18px | 12px | 12px |

Widths:

1. **Editorial copy width** — 62ch for lead and body prose; 46ch for the
   supporting paragraph beside a scene at ≥1025px, relaxing to 62ch once the
   split collapses.
2. **Wide product-scene width** — the full content band inside the gutter.
3. **Compact product-scene width** — the 1fr track beside a 360/340px copy
   column, and full width once stacked.
4. **Technical-table width** — full content band, with the table itself
   allowed its own `overflow-x: auto` container **only** when a genuine
   identifier column cannot wrap. This is the single permitted exception to
   the internal-scroller prohibition, and it must carry a visible boundary and
   a keyboard-focusable scroll container.

Grids: desktop is a two-track split (copy / scene) with `align-items: center`
and reversal by grid placement, never by DOM reorder; tablet at ≤1024px
collapses to one column, copy first; mobile is a single column throughout.

Sections are constrained to the 1300px band by default. Full-bleed is
permitted only for a hairline section rule and for the header and footer
background — never for a coloured, dark or decorative field.

Route opening patterns are defined per category in Section 15. Section spacing
uses `--section-pad`; intra-section spacing uses the Section 10 scale; the
closing rhythm is a handoff section followed by the footer, with no second
conversion panel.

Sticky is permitted for the header only. `position: fixed` is prohibited
across the public system. Prohibited: any internal page scroller other than
the bounded technical-table exception above; any scroll-driven global state;
any sticky product scene. Everything is normal document flow.

The frozen Hero matrix (Section 4b) is preserved separately and governs only
the Hero presentation band.

## 9. Typography contract

Geist Sans (`--font-geist`) and Geist Mono (`--font-geist-mono`) only. No third
family. Newsreader stays scoped to the historical `.lp` landing and has no
public role. Monospace is restricted to provenance, identifiers, technical
metadata, code and stage numbers; it is prohibited for headlines, body prose,
marketing labels, navigation and buttons.

| Role | Family | Size | Line height | Weight | Tracking | Responsive | Max width |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| Display heading | Sans | `clamp(34px, 4.2vw, 52px)` | 1.06 | 620 | -0.02em | fluid | 780px |
| Route title | Sans | `clamp(30px, 3.2vw, 42px)` | 1.10 | 620 | -0.02em | fluid | 780px |
| Section title | Sans | `clamp(26px, 2.4vw, 34px)` | 1.14 | 620 | -0.018em | fluid | 46ch beside a scene |
| Subsection title | Sans | 20px | 1.25 | 600 | -0.01em | 18px ≤767px | 62ch |
| Supporting lead | Sans | 17px | 1.55 | 400 | — | 16px ≤767px | 62ch |
| Body copy | Sans | 16px | 1.60 | 400 | — | 15px ≤767px | 62ch |
| Technical body | Sans | 14px | 1.55 | 400 | — | — | 68ch |
| Compact body | Sans | 13px | 1.55 | 400 | — | — | 62ch |
| Label | Sans | 12px | 1.30 | 600 | — | — | — |
| Eyebrow | Sans | 12px | 1.30 | 600 | 0.06em, uppercase | — | — |
| Navigation | Sans | 13px | 1.20 | 400 | — | — | — |
| Button | Sans | 13px | 1.20 | 600 | — | — | — |
| Metadata | Sans | 12px | 1.40 | 500 | — | — | — |
| Identifier | Mono | 12.5px | 1.40 | 400 | -0.01em | — | — |
| Code | Mono | 13px | 1.60 | 400 | -0.01em | 12.5px ≤767px | full band |
| Table text | Sans | 13px | 1.45 | 400 | — | — | — |
| Caption | Sans | 13px | 1.55 | 400 | — | — | 62ch |
| Legal / tertiary | Sans | 12px | 1.50 | 400 | — | — | 62ch |

Rules that bind every role:

1. **Display heading is Home only.** Every other route opens with the route
   title. Oversized marketing typography is not the default route identity.
2. Hierarchy comes from optical size and colour, not from many weights. Four
   weights total: 400, 500, 600, 620.
3. Uppercase tracking is permitted only on the eyebrow role.
4. No letterspaced headlines, no italic flourishes, no display font.
5. Tertiary text colour may never carry the identifier, metadata, label or
   table-text role, because those are essential (Section 11).
6. Prohibited: monospace headlines or body prose; a fifth type size invented
   at route level; any role duplicated at a route-specific size.

## 10. Spacing and section rhythm

One 4px rhythm, shared by every route.

| Step | Value | Use |
| --- | ---: | --- |
| 1 | 4px | Icon-to-label, chip internals |
| 2 | 8px | Control internals, tight label pairs |
| 3 | 12px | Compact row padding, metadata rows |
| 4 | 16px | Control spacing, list gaps |
| 5 | 20px | Card padding, scene chrome |
| 6 | 24px | Content block spacing |
| 7 | 32px | Component spacing, collapsed split gap |
| 8 | 40px | Small section padding (≤767px) |
| 9 | 56px | Section padding (≤1024px), split gap (≥1280px) |
| 10 | 72px | Section padding (1025–1279px) |
| 11 | 88px | Section padding (≥1280px) |

Applied rules:

1. **Control spacing** — 8px inside a control, 16px between sibling controls,
   14px between paired page actions (10px ≤767px).
2. **Content spacing** — 16px heading to lead, 24px between content blocks,
   18px scene to caption.
3. **Component spacing** — 32px between components inside one section.
4. **Section spacing** — `--section-pad`, applied top and bottom, with a
   hairline `--pub-border-subtle` rule between sections.
5. **Route opening** — 72px above the route title at ≥1280px, 40px at ≤767px,
   matching the accepted Hero's opening.
6. **Route closing** — one handoff section at full section padding, then the
   footer. No second conversion panel, no repeated hero copy.
7. **Reductions** — 88 → 72 → 56 → 40 → 32 across the five tiers; split gap
   56 → 44 → 32; gutters 32 → 24 → 20 → 16.
8. **Exceptions** — the frozen Hero band matrix (Section 4b) and the
   documentation reading rhythm (Section 15e) are the only two.
9. **Optical adjustment** is permitted only where a rendered cap-height or a
   hairline rule makes the arithmetic value visibly wrong, must not exceed one
   step, and must carry a comment naming the measured reason.

The scale exists to stop two failures: a cramped technical dashboard, and an
oversized empty marketing page. A route that needs more than one step of
deviation to feel right has a composition problem, not a spacing problem.

## 11. Colour, surface and border contract

Values are those already accepted in
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §2 and implemented in the
accepted stylesheet. **No new token is introduced by Phase 8A.**

| Role | Token | Value |
| --- | --- | --- |
| Editorial canvas | `--pub-canvas` | `#ffffff` |
| Primary surface | `--pub-surface` | `#ffffff` |
| Secondary neutral surface | `--pub-surface-2` | `#fafaf9` |
| Tertiary surface | `--pub-selected` | `#f3f3f1` |
| Strong divider | `--pub-border` | `#e1e1de` |
| Subtle divider | `--pub-border-subtle` | `#ececea` |
| Focus | `--pub-focus` | `#2563eb` |
| Primary text | `--pub-text` | `#181818` |
| Secondary text | `--pub-text-2` | `#6e6e6a` |
| Tertiary text | `--pub-text-3` | `#8a8a85` |
| Product frame surface | `--prod-surface` | `#ffffff` |
| Product frame border | `--prod-border` | `#dededc` |
| Product secondary surface | `--prod-surface-2` | `#fafaf9` |
| Product subtle border | `--prod-border-subtle` | `#eaeae8` |
| Product selected | `--prod-selected` | `#eeeeec` |
| Product primary text | `--prod-text` | `#1c1c1c` |
| Product important text | `--prod-text-important` | `#656565` |
| Product secondary text | `--prod-text-2` | `#767676` |

The Extended Neutral presentation band is `--pub-surface-2` with a
`--pub-border` hairline, at the Section 4b matrix. It is a Hero primitive.

**Locked rule, carried from the token registry:** where a public page renders a
product surface it uses the product's own `--prod-*` values, not a near-miss
public approximation. Public chrome outside a product scene uses `--pub-*`.

Hover surface is `--pub-selected` for a quiet public control and
`--prod-selected` inside a product scene. Selected surface is the same, and
**selection always carries a second non-colour cue** — a structural marker, a
text state, or `aria-pressed` / `aria-selected`. Focus is
`2px solid var(--pub-focus)` at `outline-offset: 2px`, always visible, never
removed, never expressed as a colour change alone.

Text hierarchy: primary for headings and essential values; secondary for body,
metadata and captions; **tertiary only for non-essential, disabled,
placeholder or structurally redundant content**, because it measures ≈3.5:1 on
white and fails AA for normal text.

Semantic colour, sparse, and six meanings — not five:

| Colour | Token | Meaning — and nothing else |
| --- | --- | --- |
| Blue | `--prod-observed` `#2563eb` | Selection and observed evidence |
| Amber | `--prod-warning` `#94600a` on `#fff7e3` | Tests, missing proof, unresolved requirement |
| **Orange** | `--status-review` `#b43d0b` on `#fff1eb` | **Review attention and non-blocking operational urgency** |
| Red | `--prod-blocking` `#b42318` on `#fff0ed` | Genuinely blocking or failed |
| Green | `--status-success` `#2f855a` | Genuinely cleared **only** |
| Violet | `--prod-model` `#7040c7` | Explicit model provenance **only** |

**Orange is restored as an accepted semantic.** The first issue of this
document stated that "orange is not a Lintel semantic colour and is not
introduced", reasoning that amber already owned the warning meaning. That was
wrong, and the correction is recorded rather than made silently:

1. `docs/r4/R4A_REFERENCE_AND_VISUAL_SYSTEM_LOCK.md` defines
   `color.semantic.attention` as "Review attention and non-blocking
   operational urgency".
2. `docs/r4/R4F1_SHARED_LOGGED_IN_PRODUCT_SYSTEM.md` and
   `docs/r4/R4F3_OPERATIONAL_HOME_AND_REVIEW_OPERATIONS.md` both state
   "orange for review attention" as part of the accepted six-colour system.
3. The frozen product implements it as `--status-review: #b43d0b` and
   `--status-review-soft: #fff1eb` in `app/workspace/workspace-r4.module.css`.
4. `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §3 enumerates five public
   meanings and omits orange, but its §1 supersession table does **not** record
   orange as superseded. The omission is a gap, not an explicit supersession,
   and cannot be read as a prohibition.

The R4A lock specifies `#C2410C`; the frozen implementation resolved to
`#b43d0b`. Under the locked rule below — a public page rendering a product
surface uses the product's own values — **`#b43d0b` is authoritative** and
`#C2410C` is the superseded specification value.

Attention is a genuinely distinct product state, not a shade of amber or red.
The repository asserts it directly: `operationalReadiness.status`,
`reviews.security.status` and `reviews.reliability.status` each carry a literal
`"ATTENTION"` value in `lib/mock-report.ts`; `Needs attention` is one of the
four accepted Queue groups; and `REVIEW_REQUIRED` is one of the three
recommendations.

| State | Colour | Means |
| --- | --- | --- |
| Tests or proof required | Amber | Evidence is missing, stale or unverified |
| Review attention | **Orange** | A human must look; nothing is blocking and no proof is missing |
| Blocking | Red | Merge is genuinely blocked, or something failed |

Collapsing attention into amber would claim a proof or test gap that does not
exist. Collapsing it into red would claim a blocker that does not exist. Both
are product-truth errors, not aesthetic ones.

Because amber `#94600a` (≈5.3:1 on white) and orange `#b43d0b` (≈5.8:1) are
adjacent hues, **attention is never distinguished by colour alone**: every
attention state carries its own text label, as the general no-colour-alone rule
already requires.

Green must not appear anywhere in the canonical PR #482 story, because the case
never resolves. Green is permitted on other routes only against a genuinely
cleared product state. Violet appears only against genuine model provenance,
never as an "AI" flourish. **Orange is prohibited decoratively:** it may not
open a section, tint a surface, mark a callout, or draw the eye to copy. It
appears only where the product itself asserts an attention state. Semantic
colour communicates product meaning; it never decorates a section.

Disabled state: `--pub-text-3` label on `--pub-surface-2` with a
`--pub-border-subtle` boundary, plus an explanatory text state — and only for
a control that genuinely exists and is genuinely unavailable right now.
**Unavailable capability renders as a read-only explanation, not as a
disabled-looking fake control** (`R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md`).

Code surfaces use `--pub-surface-2` with a `--pub-border` hairline. Table
surfaces use `--pub-surface` with `--pub-border-subtle` row rules and a
`--pub-surface-2` header row. Navigation and footer surfaces are
`--pub-canvas` with a `--pub-border` hairline boundary.

The public site must not introduce: a default dark full-width section; a
gradient; a glow; glass or backdrop blur; a decorative colour field; a heavy
shadow; or a translucent product window. Structure comes from fine borders,
not from shadows and large radii.

## 12. Action, link and control contract

One control grammar, shared. No route-specific button invention.

| Control | Hierarchy | Size | Label | Notes |
| --- | --- | --- | --- | --- |
| Primary action | 1 | 11/18px regular, 8/14px compact | 13px/600 | Black fill, white label, 6px radius |
| Secondary action | 2 | same | 13px/600 | Transparent, `--pub-border` hairline |
| Quiet action | 3 | 8/12px | 13px/500 | No border until hover |
| Consequential action | — | — | — | **Public routes carry none.** Every consequential action lives in the product. A public control may only navigate to it. |
| Inline text link | — | inherits | inherits | Underlined, primary text, offset 2px |
| Technical link | — | inherits | mono 12.5px | Underlined on hover only, inside metadata rows |
| Navigation link | — | 13px | 13px/400 | `aria-current`, quiet active treatment |
| External link | — | inherits | inherits | Trailing 12px glyph, accessible name states the destination; `rel="noopener"` |
| Disabled action | — | — | — | Only for a real, genuinely unavailable control; never a placeholder |
| Unavailable capability | — | — | — | Read-only explanation, no control rendered |
| Loading action | — | — | — | Permitted only for a real asynchronous product action; public routes have none |
| Icon-only action | — | 32px box | — | Only the mobile menu toggle; always has an accessible name |
| Tabs / segmented control | — | 12px/600 | — | The accepted scene-switch grammar: roving tabindex, automatic activation, Arrow/Home/End, no live region |
| Filter control | — | 13px | — | Permitted only on Resources and only over genuine document metadata |
| Search | — | — | — | **Not introduced.** Six routes do not justify search, and a search box with nothing behind it is a placeholder. |

State rules that apply to every control:

1. **Minimum target** 44 × 44px at ≤767px; 32px minimum height on desktop with
   at least 8px of separation.
2. **Hover** — background or border step only; no movement, no scale, no
   shadow.
3. **Active** — one further tone step; no depression effect.
4. **Focus** — the global focus ring; identical on mouse and keyboard paths
   via `:focus-visible`.
5. **Icon placement** — leading for meaning, trailing for direction. Icons are
   `aria-hidden` and never the sole label.
6. **Mobile** — page actions may grow to `flex: 1 1 auto` with a 156px
   minimum; they never become full-bleed bars.
7. **No-JavaScript truthfulness** — every action is an `<a>` or a `<form>`
   that works without hydration, or it is not rendered at all. No control may
   exist whose only behaviour is client-side and whose static state is a lie.

## 13. Technical metadata contract

Structured technical metadata is intended to be one of Lintel's strongest
recognisable visual qualities. Attio informs the relationship and
categorisation clarity; Vercel informs the table, identifier and version
treatment; GitHub supplies only familiar repository vocabulary.

### 13a. Presentation per fact

| Fact | Typography | Colour | Notes |
| --- | --- | --- | --- |
| Repository | Mono 12.5px | Primary | `owner/name`, never abbreviated |
| Pull request | Mono 12.5px | Primary | `#482` retains the hash |
| Commit | Mono 12.5px | Secondary | 7-char short SHA, full SHA as accessible name |
| Branch | Mono 12.5px | Secondary | Never truncated mid-segment |
| Recommendation | Sans 12px/600 | Semantic | `Tests required` — sentence case, never invented |
| Risk score | Mono 12.5px | Primary | `46/100` |
| Risk level | Sans 12px/600 uppercase | Semantic | `MEDIUM` |
| Requirement count | Sans 13px | Primary, blocking count in red | `4 open · 2 blocking` |
| Finding severity | Sans 12px/600 | Semantic | Text label, never a bare colour dot |
| Evidence identity | Mono 12.5px | Secondary | `ev_retry_path` — the product's own grammar |
| Test status | Sans 12px/600 | Semantic | Amber for missing, never green in the canonical story |
| Human Decision | Sans 12px/600 uppercase | Primary | `PENDING`; never styled as an outcome |
| Model provenance | Sans 12px/600 | Violet | Only where provenance is genuinely model-assisted |
| Analysis source | Sans 12px | Secondary | `Deterministic` / `Model-assisted` |
| Version | Mono 12.5px | Secondary | Exact string, never "latest" |
| Timestamp | Mono 12.5px | Secondary | ISO-8601 in the accessible name; readable form visible |
| Integration status | Sans 12px/600 | Semantic | `Configured` / `Unavailable` / `Blueprint` / `Export-only` |
| Policy or profile | Sans 13px | Primary | Named exactly as the product names it |
| Reviewer | Sans 13px | Primary | Role, never an invented person |
| Operational state | Sans 12px/600 | Semantic | From the R4A label vocabulary only |
| Passport producer | Sans 12px/600 | Primary | `human` / `agent` / `mixed` / `unknown` — the product's own values |
| Passport completeness | Sans 12px/600 | Semantic | `absent` / `partial` / `complete`. `partial` and `absent` are orange attention |
| Passport declaration state | Sans 12px/600 | Semantic | `supported` blue, `unverified` **orange**, `observed but undeclared` **orange**, declared uncertainty neutral |
| Passport identity | Mono 12.5px | Secondary | `passport_<12-char fingerprint>`; schema version alongside |

### 13b. Structure

1. **Compact row** — a label/value pair on one line: label in the 12px label
   role at secondary colour, value in its own role at primary colour, 12px
   vertical padding, `--pub-border-subtle` rule between rows.
2. **Fact row** — a horizontal group of two to four label/value cells on
   `--pub-surface-2`, collapsing to two columns at ≤1024px and one at ≤767px.
   A three-cell row uses three equal columns rather than wrapping, so no empty
   cell shows the row background through the gap.
3. **Separator** — the middle dot `·` between inline facts, a hairline rule
   between stacked rows. Never a pipe, never a slash except inside a value
   that genuinely contains one.
4. **Wrapping** — labels wrap, identifiers do not. An identifier that cannot
   fit gets its own row rather than a mid-token break.
5. **Truncation** — permitted only for a commit SHA (to 7 characters) and a
   file path (leading ellipsis, never trailing). Every truncated value carries
   the full value as its accessible name. No other value is ever truncated.
6. **Mobile reduction** — a fact row reduces its cell count, never its
   values. A value may move to its own row; it may not disappear. Canonical
   facts are never behind a disclosure.
7. **Accessible names** — every metadata group is a `<dl>` or a list with a
   programmatic label/value relationship. A value is never conveyed by
   position or colour alone.
8. **Copy behaviour** — a copy control is permitted beside an identifier only
   if it genuinely copies; it announces the result through a status message,
   not a tooltip; and without JavaScript it is not rendered, with the value
   remaining selectable text.

## 14. Product-scene primitive inventory

A product scene represents a real Lintel concept from real product data.
Decorative mockups that do not represent a genuine concept are rejected. Not
every homepage scene becomes a shared component: a scene is promoted to the
shared layer only when at least two genuine routes need the same
responsibility.

Full detail per family is in the package's `PRODUCT_SCENE_INVENTORY.md`.

### 14a. Accepted shared families

| # | Family | Purpose | Routes | Shared? |
| --- | --- | --- | --- | --- |
| 1 | Framed product window | The opaque white frame + chrome that stages any product scene | all | Shared |
| 2 | Compact technical excerpt | A small bounded excerpt of a real product surface inside body flow | Product, How it works, Trust, Docs | Shared |
| 3 | Evidence sequence | Finding → evidence records → provenance | Home, Product, How it works | Shared |
| 4 | Missing-proof relationship | Missing proof → the requirement it blocks | Home, Product, How it works | Shared |
| 5 | Readiness and Human Decision boundary | Recommendation vs authority, seven unselected outcomes | Home, Product, How it works, Trust | Shared |
| 6 | Change summary | Repository, PR, title, files, recommendation | Home, Product, How it works | Shared |
| 7 | Technical metadata group | The Section 13 fact row and compact row | all | Shared |

### 14b. Accepted route-specific families

| # | Family | Purpose | Routes | Shared? |
| --- | --- | --- | --- | --- |
| 8 | Operational review queue | Grouped queue rows | Product only | Route-specific |
| 9 | Canonical run / provenance view | Run manifest identity and reproducibility classification | Trust only | Route-specific |
| 10 | Readiness Delta | Added / changed / cleared / reopened records between runs | Product only | Route-specific |
| 11 | Review Diff | Structured record-level comparison | Product only | Route-specific |
| 12 | Integration status | Configured / unavailable / blueprint / export-only | Trust only | Route-specific |
| 13 | Focused code or diff context | A real excerpt supporting a finding | How it works only | Route-specific |
| 14 | Relationship / affected-context view | What else a change touches | How it works only | Route-specific |
| 15 | **Agent Change Passport declaration boundary** | Builder declaration versus independently verified evidence | Product primary; Trust pointer | Route-specific |

### 14b.1 The Agent Change Passport scene

Family 15 presents the implemented passport comparison: what the producing
agent or engineer **declared**, and what Lintel **independently verified**.

| Attribute | Value |
| --- | --- |
| Purpose | Show that a builder declaration remains a claim until independently evidenced |
| Routes | `/product` primary; `/trust` carries a short provenance pointer |
| Product-truth source | `lib/change-passport.ts` — `ChangePassport`, `ChangePassportComparison` |
| Framing | Family 1, neutral |
| Density | Medium |
| Interaction | None |
| States shown | `supported`, `unverified`, `observed but undeclared`, declared uncertainty |
| Responsive | The four state groups stack; counts never truncate |
| No-JS | Fully rendered |
| Reduced motion | Static |
| Accessibility | Each state group is a labelled list; state is never colour-only |
| Semantic colour | `unverified` and `observed but undeclared` are **orange** attention — a human must look, but nothing is blocking and no proof is claimed missing. Neither is amber, because no test or proof gap is asserted; neither is red, because neither blocks |
| Must not be used | To imply Lintel validated a declaration it only recorded |

This is the clearest case in the system for the restored orange semantic: an
unverified declaration is precisely "review attention, non-blocking".

### 14c. Rejected and deferred families

| Candidate | Decision | Reason |
| --- | --- | --- |
| Verification manifest | Folded into family 9. | The run manifest already carries input, configuration, result fingerprints, versions and reproducibility classification. A second manifest scene would duplicate it. |
| Dashboard / analytics scene | Rejected. | Implies organisation-wide analytics that do not exist. |
| Timeline / activity feed | Rejected. | Implies multi-actor collaboration that does not exist. |
| Logo wall, metrics counter, testimonial card | Rejected. | No customer, no adoption metric, no testimonial exists. |

### 14d. Rules binding every accepted family

1. **Product truth source** — every value comes from `canonical-review.ts` or
   another genuine repository record, imported and never restated. A scene may
   not invent a value.
2. **Framing** — family 1 always; the Extended Neutral band only on the Home
   Hero.
3. **Density** — a public scene is a *reduced* view of a product surface, not
   a full replica of the Workspace.
4. **Interaction allowance** — at most **one** interactive scene per route,
   using the accepted tab grammar; every other scene is static or
   choreography-only. This carries forward the Phase 7 finding that Cursor
   makes nothing in its product scenes operable, which is why the accepted
   page caps interaction rather than spreading it.
5. **Responsive simplification** — a scene recomposes rather than shrinks:
   internal side-by-side tracks become stacked bands, an aside becomes a
   leading band, and a scene that cannot recompose below a stated width
   renders its static simplified form instead.
6. **No-JavaScript state** — the server emits the complete settled scene with
   a plain panel label in a fixed-height control row and no control at all.
   Every canonical value is present.
7. **Reduced motion** — the settled complete state, no required automatic
   motion, no content loss.
8. **Accessibility semantics** — `role="group"` with an accessible name; tabs
   use the accepted roving-tabindex pattern; no live region; every panel of a
   scene shares one CSS grid cell so scene height cannot change on selection
   or at hydration.
9. **Performance** — zero image requests, zero external requests, no layout
   measurement, no animation library, and no hydration required to read the
   scene.
10. **When a family must not be used** — never to fill space, never as a
    decorative section break, never where prose is clearer, and never on a
    route whose purpose the scene does not serve.

## 15. Route composition contract

Seven categories. Routes share one system without becoming identical
templates: the shared parts are the shell, the grid, the type roles, the
spacing scale and the primitives; the varying parts are the opening, the proof
type, the scene hierarchy and the closing.

### 15a. Flagship product-led route (Home)

Opening: display heading, supporting lead, two actions, on the white canvas.
Primary proof: the Hero product scene inside the Extended Neutral band —
the only place the band appears. Scene hierarchy: Hero, then three alternating
split sections (copy/scene, scene/copy, copy/scene). Metadata density: high
inside scenes, low in chrome. Interaction: the accepted three interactive
scenes — Home is the sole exception to the one-scene rule in 14d.4, because
that composition is frozen. Closing: Trust boundary → unresolved-case handoff
→ footer. Mobile: single column, copy always before its scene.

### 15b. Workflow explanation route (How it works)

Opening: route title, one lead paragraph, no scene above the fold. Primary
proof: a step sequence where each of the seven model steps carries one compact
technical excerpt. Scene hierarchy: excerpt-per-step, with at most one full
framed window at the readiness step. Metadata: medium. Interaction: at most
one interactive scene. Closing: a pointer to the sample review. Mobile: steps
stack; the step index remains visible.

### 15c. Trust or methodology route (Trust)

Opening: route title, lead, then immediately the boundary statement — no
staging delay before the substance. Primary proof: the provenance view and
the integration-status family. Scene hierarchy: low; prose and metadata carry
this route. Metadata: high. Interaction: none. Sections: determinism,
model-assisted provenance, data boundaries, what Lintel cannot do,
availability, limitations. Closing: a pointer to the security-model document.
Mobile: prose-first, tables adapt per Section 18.

### 15d. Resource index (Resources)

Opening: route title and one line. Body: a list of genuine documents, each
with title, one-line description, kind and a truthful destination. One filter
control over document kind, permitted only because the metadata is real.
Scenes: none. Closing: footer directly. Mobile: single column list.

### 15e. Long-form documentation (`/docs/[slug]`)

Opening: document title, one metadata row (source, last updated), then
content. Body: prose at 68–72ch with a persistent-but-not-sticky in-page
contents list at ≥1025px. Reading rhythm is the documented exception to the
Section 10 section scale: 32px between top-level headings rather than
`--section-pad`. Scenes: compact excerpts only. Interaction: none. Closing:
previous/next document links. Mobile: contents list collapses above the
content as a plain list.

### 15f. Commercial or availability route

**No such route exists in Phase 8.** The template is defined so that the
trigger in Section 6d can be met later without reopening the system: route
title, one truthful availability statement, a comparison table only if two or
more genuine offers exist, no scene, no countdown, no social proof, and a
closing that points at the real way to start.

### 15g. Legal or policy route

**No such route exists in Phase 8.** Template for the Section 6e trigger:
route title, effective date, prose at 68ch, numbered sections, an ordered
heading descent, no scene, no action other than a contact destination that
genuinely exists.

## 16. Motion and interaction contract

Phase 7 principles carry forward unchanged: restrained one-shot motion;
progressive enhancement; a truthful no-JavaScript state; manual visitor intent
becomes authoritative; automatic behaviour never reclaims control;
reduced motion presents a settled state; no scroll-controlled global
narrative; no sticky Workspace storytelling; no fake analysis execution; no
continuous background movement; no decorative loading simulation.

### 16a. Where motion is permitted

1. One bounded entry choreography per product scene, armed once when the scene
   is meaningfully in view, driven by CSS `transition-delay` with one timer.
2. Control state transitions — hover, focus, selection.
3. Panel transitions inside an accepted tab scene.
4. The mobile menu's open and close.

### 16b. Where scenes must remain static

Every scene on Trust, Resources and Documentation. Every compact technical
excerpt. Every table. Every metadata group. Any scene beyond the first on a
route.

### 16c. Values

Durations 90 / 140 / 260 / 300 / 380 / 420ms; reading pauses 760 / 980 /
1220ms; easings standard `cubic-bezier(0.2, 0.8, 0.2, 1)`, panel
`(0.4, 0, 0.2, 1)`, selection `(0, 0, 0.2, 1)`, none overshooting. Movement is
capped at 8px vertical (4px at ≤767px); nothing moves horizontally. Meaningful
text is never faded: choreography works through container background, border,
rule and a restrained settle. Only an `aria-hidden` decorative rule may begin
absent.

### 16d. Route-shell motion

The header's hairline appears and disappears with a colour transition only,
changing no box dimension. There is no page transition, no route-change
animation, no view-transition API usage, and no scroll-linked shell behaviour.

### 16e. Requirements and prohibitions

Layout stability is absolute: no motion may cause layout shift, and every
panel of a scene shares one grid cell so height cannot change on selection or
at hydration. Reduced motion substitutes the settled complete state and never
removes content. Controls never participate in choreography. No animation
library, no `will-change`, no live region.

The frozen Hero choreography (H1–H3, and the Finding, Missing Proof and
Readiness sequences on Home) is not changed by Phase 8.

## 17. Accessibility and resilience contract

Binding, not a later QA appendix.

1. **Landmarks** — one `<header>`, one `<nav aria-label>` per navigation, one
   `<main id="main">`, one `<footer>` per route.
2. **One H1 per route**, naming the route's subject.
3. **Heading order** descends without skipping; a visually silent section
   carries a visually-hidden heading rather than none.
4. **Skip navigation** is the first focusable control and targets `#main`.
5. **Keyboard operation** is complete for every route: no action requires
   hover, drag, pointer precision or a memorised shortcut.
6. **Focus order** follows source order: skip → identity → navigation →
   primary action → main → footer.
7. **Focus visibility** — 2px `--pub-focus` outline at 2px offset, never
   removed, never colour-change-only.
8. **Target sizes** — 44 × 44px at ≤767px; 32px minimum with 8px separation on
   desktop.
9. **Reduced motion** — settled complete state, no content loss.
10. **Forced colours** — decorative surfaces resolve to `Canvas`, boundaries
    use system colours, the product frame stays distinguishable, focus stays
    visible, selection keeps its non-colour geometry via `Highlight`.
11. **No JavaScript** — every route is complete, every destination resolves,
    no fake control is rendered.
12. **Screen-reader semantics** — metadata uses real label/value
    relationships; tabs use the accepted pattern; no live region; images, if
    any ever ship, carry genuine alternative text.
13. **Decorative surfaces** stay out of the accessibility tree.
14. **Error states** — the public routes have no form, so the only error state
    is a 404, which uses the shell and offers real destinations.
15. **Unavailable states** render as read-only explanations, never as disabled
    fake controls.
16. **Responsive reflow** — no horizontal page scrolling at any width down to
    320px.
17. **200% zoom** — the page remains understandable and complete.
18. **High text scaling** — layouts use relative measures for text containers
    so a 200% text-only increase does not clip content.
19. **Tables** — real `<table>` with `<caption>`, scoped headers, and the
    Section 18 adaptation rather than a shrunken grid.
20. **Code and technical content** — `<pre><code>`, keyboard-focusable if
    scrollable, with a programmatic label.
21. **Mobile navigation** — the Section 7e conditions, in full.
22. **Modal or drawer** — none is permitted in the public system. The mobile
    menu is a disclosure in normal flow, not a modal.
23. **Focus containment and restoration** — containment while the mobile
    disclosure is open; restoration to the toggle on close.
24. **Escape** — closes the mobile disclosure and returns focus; no other
    public surface consumes it.
25. **Content persistence** — no public interaction may hide a canonical
    value; every canonical fact stays outside every changing panel.

## 18. Responsive contract

Five approved breakpoint families, unchanged: ≥1280px, 1025–1279px,
768–1024px, 360–767px, ≤359px. The ≤1024px collapse boundary is the
R5E.1E.3-corrected value and must not move without new evidence.

| Concern | Behaviour |
| --- | --- |
| Gutters | 32 / 32 / 24 / 20 / 16px |
| Navigation | Full labels ≥768px; disclosure menu ≤767px (Section 7e) |
| Typography | Fluid `clamp()` on headings; one step down for lead and body at ≤767px; no role below 12px |
| Section spacing | 88 / 72 / 56 / 40 / 32px |
| Product-scene reflow | Split collapses at ≤1024px, copy first; scene internals stack at ≤767px |
| Metadata | Fact rows 4 → 2 → 1 cells; values never removed |
| Tables | ≥768px a real table; ≤767px each row becomes a stacked label/value group, preserving header association |
| Control stacking | Page actions wrap at ≤767px with a 156px minimum; never full-bleed |
| Action order | Primary always first in source and in view |
| Mobile disclosure | Only navigation. Content is never placed behind a disclosure. |
| Static fallback | Below 360px scenes drop to their static simplified form; the Hero band uses the 12px compact fallback |
| Simplification rule | A complex scene **recomposes**; it does not merely shrink |
| Horizontal scrolling | Prohibited on the page at every width down to 320px; permitted only inside the bounded technical-table container of Section 8 |
| 320px | Every route complete, no clipped frame, no clipped action, no overflow |
| Tablet | 768–1024px uses the stacked pattern, full width, not a compressed desktop |
| 200% zoom | Equivalent to the ≈640px reflow tier; must remain understandable and complete |

The frozen Hero matrix is unchanged by this section.

## 19. Performance and asset governance

### 19a. Cross-route expectations

1. **JavaScript** — server components by default. A client boundary requires a
   named reason, and the reason must be an interaction that cannot be
   expressed statically.
2. **Hydration** — no route depends on hydration to be readable, complete or
   navigable.
3. **Product-scene assets** — zero. Scenes are HTML and CSS.
4. **Images** — the public system currently ships none in the accepted
   direction. Any future image must satisfy the image policy's allowed
   categories and earns-its-place tests, and must carry intrinsic dimensions,
   a responsive source set where genuinely needed, an explicit provenance
   note, and licence clearance.
5. **Fonts** — Geist Sans and Geist Mono via `next/font`, self-hosted, already
   loaded once in the root layout. No third family, no additional weight
   loaded without a named role that needs it.
6. **External requests** — zero on every public route. No CDN, no analytics,
   no third-party script, no external font, no embedded media.
7. **Layout stability** — no route may shift on load, on hydration, or on any
   accepted interaction.
8. **Interaction readiness** — every control is either functional at first
   paint or not rendered until it is.
9. **Animation libraries** — none. CSS transitions only.
10. **Route loading** — no spinner, no skeleton; a public route is static and
    complete on arrival.
11. **Below-fold content** — server-rendered in full; no lazy content
    boundary that hides a canonical value.
12. **Code examples** — plain `<pre><code>` with CSS-only presentation; no
    syntax-highlighting library.
13. **Media dimensions** — any future media declares intrinsic width and
    height.
14. **Responsive sources** — only where a measured aspect change justifies
    art direction, which the accepted zero-image direction currently makes
    moot.
15. **Provenance** — every asset records where it came from.
16. **Licensing** — every asset records its licence; no asset ships without
    one.
17. **Fallback** — every asset has a truthful fallback that does not degrade
    meaning.
18. **Review and approval** — any new asset class requires explicit human
    acceptance before implementation.

### 19a.1 Content governance

Content is governed exactly as assets are. Every public document carries a
record before it is published:

| Field | Requirement |
| --- | --- |
| Content decision | The explicit decision to publish this document publicly |
| Audience | Who it is for |
| Owner | Who maintains it |
| Product-truth review | Which milestone reviewed its claims, and against what |
| Publication status | `published`, `draft` or `internal` — only `published` renders |
| Source | The repository document it derives from, if any |

**No filesystem-driven publication.** `/resources` and `/docs/*` are generated
from an explicit curated list, never from a directory scan. A document that
exists on disk and is not on the list does not render, is not linked, is not
indexed and does not enter the sitemap.

### 19b. Frozen Hero budget, preserved

Zero image requests; zero external requests; zero runtime surface
transformation; zero background animation; zero presentation-driven hydration.

### 19c. Budgets are measured, not invented

Phase 7.1E recorded a cache-disabled production navigation at 16 route
resources and 327,025 transferred bytes with zero surface and external
requests, and no layout-shift or long-task entry in the bounded window. That
is accepted evidence for one route, **not** a site-wide budget.

Phase 8 establishes site-wide budgets by measurement, in this order: 8B.1
measures the transferred Home under the new shell and records it as the
per-route baseline; 8C records the shared-primitive delta; each route
milestone records its own cache-disabled production measurement; 8G sets the
site-wide budget from the measured distribution and records it in the Phase 8H
freeze. No numeric site-wide budget is asserted before 8G has evidence.

## 20. Content and voice contract

Precise, concise, engineering-literate, evidence-led, calm, explicit about
uncertainty, clear about human authority, free of generic AI hype, free of
inflated enterprise claims, and free of excessive stylistic dashes.

Prefer clean sentences, short paragraphs, descriptive headings, concrete
product vocabulary, direct action labels and truthful status language. Avoid
superlatives, avoid "seamless", "effortless", "powerful", "revolutionary",
"enterprise-grade", and avoid any sentence that would be equally true of a CRM.

### 20a. Naming and capitalisation

| Term | Form | Note |
| --- | --- | --- |
| Lintel | `Lintel` | Never `LINTEL`, never lowercase |
| Human Decision | `Human Decision` | Both words capitalised; it is a product object |
| Case File | `Case File` | Both words capitalised |
| Readiness Delta | `Readiness Delta` | Both words capitalised |
| Review Diff | `Review Diff` | Both words capitalised |
| Agent Change Passport | `Agent Change Passport` | All three capitalised. Implemented; usable publicly. `Change Passport` is acceptable on second reference within a section |
| declared | lowercase | What the builder asserted. Never "verified" |
| supported | lowercase | A declaration Lintel independently matched |
| unverified | lowercase | A declaration Lintel recorded but could not match. **Never** "false", "wrong" or "failed" |
| observed but undeclared | lowercase | Lintel found a concern the passport did not declare |
| Finding | `Finding` when the object, `finding` in prose | Capitalised as a product object |
| Evidence | `Evidence` when the object, `evidence` in prose | Same rule |
| Missing proof | `Missing proof` | Sentence case; only the first word capitalised |
| Requirement | `Requirement` when the object, `requirement` in prose | Same rule as Finding |
| Readiness | `Readiness` | Capitalised as a product state |
| model-assisted analysis | lowercase | Never `AI-powered`, never `Model Assisted` |
| deterministic analysis | lowercase | The baseline; named plainly |

### 20b. Sentence-level rules

1. State the limitation in the same paragraph as the claim, not in a footnote.
2. Name the actor: "the engineer decides", not "decisions are made".
3. Use the product's own vocabulary, not a synonym invented for the public
   page.
4. One message per section. A section that needs two messages is two sections.
5. Never write a sentence whose truth depends on a capability that does not
   exist.

## 21. Product-truth contract

Every public route must distinguish five states, using the R4A vocabulary.

| State | Public language |
| --- | --- |
| Implemented capability | "Lintel does X." |
| Controlled sample | "This sample is read-only and does not change PR #482." |
| Documented direction | "Designed to support X." |
| Future capability | "Planned." |
| Unavailable capability | "Not available." / "Not claimed." |

### 21a. Approved language

| Claim class | Approved wording |
| --- | --- |
| Implemented | "Implemented." — for capability the README records as implemented |
| Validated locally | "Validated locally." — browser-local behaviour proven in development |
| Production-build tested | "Verified against a production build." |
| Controlled sample | "Read-only sample." / "Fixed sample review." |
| Designed to support | "Designed to support …" — for documented direction with no shipped capability |
| Planned | "Planned." — for the README's planned list |
| Unavailable | "Not available." / "Not claimed." — never "coming soon" |
| Prototype | "Prototype." — for GitHub App capability, always with its local-persistence boundary |

### 21b. Prohibited implications

No public route may imply: paying customers; broad organisational adoption;
production scale not achieved; guaranteed pull-request safety; complete defect
detection; autonomous approval or merging; hosted collaboration; live Slack
integration; organisation-wide analytics; enforced repository policy; exact
stochastic replay; public deployment unless true; or plans and pricing that do
not exist.

### 21b.1 Agent Change Passport — implemented but bounded

Verified against the repository on 6 August 2026. The capability **is
implemented**, and the first issue of this contract wrongly classified it as
deferred-because-unimplemented.

| Claimed capability | Verified at |
| --- | --- |
| Versioned passport structure | `CHANGE_PASSPORT_SCHEMA_VERSION = "1.0"`, `schemaVersion` field |
| Producer identity and task intent | `producerType`, `producer.{tool,provider,model,externalRunId}`, `taskIntent` |
| Claimed tests and validation | `claimedTests`, `claimedValidation` |
| Assumptions, constraints, known limitations | `assumptions`, `constraints`, `knownLimitations` |
| Unresolved uncertainty | `unresolvedUncertainty` |
| Bounded parsing of machine-readable blocks from PR descriptions | `parseChangePassportBlock`, matching a fenced `lintel-change-passport` block |
| Validation, size limits, failure isolation | `MAX_TEXT` 900, `MAX_SHORT_TEXT` 160, `MAX_ITEMS` 12, `MAX_BLOCK` 8,000; `try/catch` returning `null`; secret redaction; raw-diff omission |
| Supported / unverified / observed-but-undeclared states | `DeclarationState`, `compareChangePassport` |
| Provenance and fingerprints in canonical runs | `provenance`, `fingerprint` via `stableFingerprint`, carried into `canonical-review-run.ts` |
| Declarations remain claims until independently evidenced | `unverified` detail: "retained as builder context, but was not independently matched" |

Wired through `/new`, `/api/generate-report`, `/api/fetch-pr-diff`,
`/api/github-workspace`, `/api/github-app`, `/api/github-app/webhook`,
`lib/evidence-hierarchy.ts`, `lib/builder-verifier-boundary.ts` and
`lib/verification-pack.ts`, with a logged-in presentation block in
`app/globals.css`.

**The bound.** Public statements must distinguish two things:

1. **Implemented** — the passport structure, the bounded PR-body parsing, the
   validation and size limits, the four declaration states, and the
   provenance and fingerprint carried into canonical runs.
2. **Not yet built** — any *public product-scene presentation* of it. Scene
   family 15 is specified in Section 14b.1 and implemented in Phase 8D.

Approved public language: "Lintel reads a machine-readable Change Passport
from a pull request description when one is present, and separates what the
builder declared from what Lintel independently verified."

Prohibited: implying Lintel validates declarations (it matches them, and
records the rest as unverified); implying a passport is required (it is
optional, and `absent` is a first-class state); implying agent detection
(producer type is **declared**, not inferred).

**One gap, recorded not fixed.** The root `README.md` capability tables do not
mention the Agent Change Passport at all. The root README is protected scope
for Phase 8A, so this is recorded as a human gate rather than corrected here.
It matters because the README is one of this contract's product-truth sources,
and its silence is what produced the original misclassification. Until it is
updated, Phase 8D must trace passport claims to `lib/change-passport.ts`
directly rather than to the README.

### 21b.2 The three that bind hardest

Three prohibitions bind particularly hard against the natural marketing
instinct:

1. Lintel **can miss or misclassify** engineering risk. Reports support
   judgment; they do not prove a pull request is safe.
2. The GitHub App is an environment-configured prototype with local filesystem
   persistence. It is not a hosted service.
3. Slack handoff is **export-only** and the GitHub Action is a **blueprint**
   that does not install, run, connect or post.

### 21c. Canonical values

Repository `example/b2b-redemption-api`, PR `#482`, title `Add fallback
handling for failed discount-code retrieval`, recommendation `Tests required`,
risk `46/100 · MEDIUM`, requirements `4 open · 2 blocking`, Human Decision
`PENDING`, and all seven genuine unselected outcomes. No public presentation
may alter a canonical value, imply clearance, fake analysis, select an outcome,
write data, or modify the Workspace.

## 22. Technical implementation architecture

Recommended, not implemented. Based on the actual repository structure: Next.js
App Router, React 19, TypeScript, CSS Modules, no CSS framework, no additional
dependency, and a substantial `lib/` layer of 43 tracked files.

**`lib/` is the product-truth layer** and is protected scope for every Phase 8
milestone. Public routes **import from it read-only** — exactly as the accepted
implementation already imports `canonical-review.ts` rather than restating it.
No Phase 8 milestone may modify `lib/`; a public presentation need that would
require changing `lib/` is a product change, and belongs to a product
milestone, not a design one.

Modules a public route may read: `change-passport.ts`, `canonical-review-run.ts`,
`evidence-hierarchy.ts`, `readiness-delta.ts`, `merge-contract.ts`,
`verification-pack.ts`, `builder-verifier-boundary.ts`, `mock-report.ts`.

### 22a. Ownership

| Responsibility | Proposed owner | Note |
| --- | --- | --- |
| Shared public shell | `app/_public/shell/` — `PublicShell`, `PublicHeader`, `PublicFooter`, `SkipLink`, `MobileNav` | Server components; `MobileNav` is the only client boundary |
| Route metadata | Per-route `metadata` export + a shared `buildPublicMetadata()` helper in `app/_public/metadata.ts` | Keeps titles and robots consistent without hiding them |
| Navigation data | `app/_public/navigation.ts` — one typed array, single source for header, footer and sitemap | Mirrors the existing `nav-config.tsx` discipline for the logged-in shell |
| Footer data | Same file, separate export | Grouped destinations |
| Tokens | `app/_public/public-tokens.css`, imported once by the shell | Ends the three-way token duplication |
| Typography | `app/_public/public-type.css` — one class per Section 9 role | No route-level type sizes |
| Layout primitives | `app/_public/layout/` — `PageWrap`, `Section`, `SplitSection`, `ProseColumn` | Thin; each wraps a grid rule, not a design decision |
| Action primitives | `app/_public/controls/` — `Action`, `TextLink`, `ExternalLink` | One button grammar |
| Metadata primitives | `app/_public/metadata-ui/` — `FactRow`, `CompactRow`, `Identifier` | The Section 13 grammar |
| Product scenes | `app/_public/scenes/` for shared families 1–7; route folders for families 8–14 | Section 14 |
| Motion utilities | `app/_public/motion/SceneMotion.tsx` + `public-motion.css` | Promoted from the accepted implementation unchanged |
| Accessibility utilities | `app/_public/a11y.css` — skip link, visually-hidden, focus ring | One definition |
| Route composition | `app/(public)/product/page.tsx` etc. | Composition only; no new primitive |
| CSS architecture | CSS Modules per component + three shared plain-CSS files imported once by the shell | Matches the repository; no framework introduced |
| Server/client boundary | Server by default. Client only for `MobileNav`, `SceneMotion`, and the accepted scene tab controllers | Three boundaries total |
| No-JavaScript strategy | Server-static-first: the server emits the settled state and no control that requires hydration | Carried from the accepted contract |

`app/(public)/` as a route group lets the public routes share a layout that
mounts the shell once, while `/` keeps its path. This is the one structural
recommendation Phase 8B must validate against Next 16 behaviour before
adopting; if the route group conflicts with the existing root layout, the
fallback is an explicit `PublicShell` wrapper per route, which costs one line
per route and no behaviour.

### 22b. Avoiding premature abstraction

Nothing enters the shared layer unless **at least two genuine routes need the
same responsibility.** Families 8–14 in Section 14 stay route-local for
exactly this reason. If a second route later needs one, it is promoted then —
with the promotion recorded — not pre-emptively.

### 22c. Classification of existing code

| Item | Classification |
| --- | --- |
| `app/_public-r5-reference-reconstruction/` | **Migrate.** It is the accepted direction and becomes the source of the shared shell, tokens, primitives, scenes and motion. |
| `canonical-review.ts` | **Preserve.** Already the shared product-truth source; the pattern extends. |
| Accepted scene components and `SceneMotion` | **Preserve, relocate.** Move into the shared layer without behaviour change. |
| The three duplicated header/footer/token sets | **Consolidate** into one shell and one token file. |
| `app/_public-r5/` | **Deprecate after 8B.1.** It is the superseded build; it stops being production the moment the transfer lands. |
| `public/r5/scenes/*` (≈1.5MB) | **Separate human decision.** Only `_public-r5` uses them; they become unreferenced after 8B.1, but deleting assets is outside this contract. |
| `app/_public-r5-recalibrated/` | **Archive-later.** Rejected architecture, retained as history. |
| `app/visual-lab/**` | **Remains private.** Never linked, never indexed, never promoted. |
| `app/visual-lab/public-r5-surface-comparison/**` | **Archive-later.** Closed Phase 7.1C diagnostic laboratory. |
| Logged-in routes, `app/api/**`, `app/workspace*` | **Untouched.** Outside Phase 8 entirely. |

### 22d. Items requiring a separate human decision

1. Deleting or retaining `public/r5/scenes/*` after 8B.1.
2. Deleting or retaining `app/_public-r5/`, `app/_public-r5-recalibrated/` and
   the closed comparison laboratory.
3. Adding `noindex` to the logged-in product routes — a **named
   pre-deployment safety task** (Section 7i), and an explicit exit condition
   on Phase 8H.
4. Setting `metadataBase` and a canonical origin, which requires a real
   deployment target. Policy is owned by 8B; implementation is blocked.
5. Which curated documents `/docs/*` publishes, and whether each renders from
   a repository source or is authored separately — decided per document under
   the Section 6e.1 curation gate, never by directory scan.
6. Updating the root `README.md` capability tables to record the Agent Change
   Passport, which they currently omit (Section 21b.1).

## 23. Phase 8 implementation sequence

Defined in full, with objective, authorised scope, protected scope,
dependencies, expected tool, evidence, human gate and exit criteria per
milestone, in `R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`. Summary:

| Milestone | Objective |
| --- | --- |
| 8B | Global public shell, tokens, navigation data, metadata, robots and sitemap |
| **8B.1** | **Transfer the accepted Home onto production `/` under the new shell** |
| 8C | Shared public primitives: layout, type roles, actions, metadata, scenes 1–7 |
| 8D | Product and How it works routes |
| 8E | Trust and verification methodology, including availability |
| 8F | Resources, Documentation and truthful commercial foundations |
| 8G | Cross-route responsive, accessibility, product-truth and performance review |
| 8H | Final public design-system freeze |

8B.1 exists because the accepted public direction is currently invisible to
the public (Section 5b). Transferring Home immediately after the shell makes
the accepted page the reference implementation every later route composes
against, and stops the superseded image-led build from being what visitors
see. No milestone may begin before the preceding gate closes. **8B cannot
begin before this contract is accepted.**

## 24. Protected scope

Phase 8A did not, and no Phase 8A work may, modify: `app/**`, `lib/**`,
`public/**`, `package.json`, any lockfile, `.claude/launch.json`, the root
`README.md`, frozen R4 documentation, accepted Phase 7 documentation, accepted
Phase 7.1 documentation, previous evidence packages, `docs/assets/**`,
diagnostic assets, or production and private visual-lab routes.

Permitted tracked changes are exactly: this document,
`R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md`,
`R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`, and a bounded
`docs/r5/README.md` update. Permitted untracked change is exactly
`R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT_PACKAGE/**`. Nothing else.

Nothing was staged, committed, pushed or merged, and no branch was switched.

## 25. Deferred work

| Deferred concern | Where it belongs later |
| --- | --- |
| Logged-in dashboard redesign | A separate logged-in phase; not Phase 8 |
| Workspace visual redesign | Same; explicitly excluded by the Phase 8 handoff |
| Queue and Inspector restructuring | Same |
| Hosted account architecture | Product architecture phase, before any public account claim |
| Production persistence architecture | Product architecture phase; a precondition for any hosted claim |
| Public deployment | Infrastructure phase; a precondition for `metadataBase`, canonical URLs and a sitemap origin |
| Organisation collaboration | Product phase; prohibited as a public claim until implemented |
| Real-time presence | Product phase; prohibited as a public claim |
| Billing implementation | Commercial phase; the trigger for `/pricing` (Section 6d) |
| Live Slack integration | Product phase; Slack stays export-only publicly |
| Production observability | Infrastructure phase; the trigger for a status route |
| External beta operations | Commercial/product phase |
| Agent Change Passport **product-scene presentation** | 8D, as scene family 15. The data and verification capability is implemented; only the public presentation is unbuilt |
| Legal routes | Blocked on the Section 6e trigger |

## 26. Final human acceptance

**Binding decision: Phase 8A is ACCEPTED AND COMPLETE.**

On 6 August 2026, the human owner accepted:

1. the six-route architecture: `/`, `/product`, `/how-it-works`, `/trust`,
   `/resources`, and `/docs/[slug]`;
2. flat primary navigation: Home, Product, How it works, and Trust, with
   Resources and curated Documentation as supporting destinations;
3. Phase 8B as the shared public-shell milestone, followed immediately by
   Phase 8B.1 transferring the accepted Phase 7.1 reconstruction onto
   production `/`;
4. no `/pricing` route until a real commercial model exists;
5. Trust as canonical owner of Availability: current run mode, no hosted
   service, no plans, no trial, no billing, and no commercial commitment;
   Product carries a concise availability notice and Trust pointer;
6. Models remaining a Trust subsection with a Product pointer;
7. Agent Change Passport as implemented but bounded: an implemented data
   structure with bounded parsing and validation, declared-versus-observed
   states, provenance and canonical fingerprints; declarations remain claims
   until evidenced, and no public scene presentation exists yet;
8. Agent Change Passport receiving a route-specific Product presentation in
   Phase 8D, with provenance context in Trust and no standalone route;
9. the semantic meanings: blue for selection and evidence, amber for tests
   and missing proof, orange for review attention, red for blocking and
   failure, green for cleared, and violet for model provenance; orange is
   prohibited as decoration;
10. the public-documentation curation boundary: deliberately authored and
    approved public content only; no automatic publication of internal R4/R5
    contracts, evidence packages, or acceptance packages; no filesystem-driven
    document browser; and explicit audience, owner, product-truth review, and
    publication status;
11. Phase 8B ownership of public metadata architecture, canonical URLs, the
    `metadataBase` decision, robots policy, and sitemap contract; private
    visual-lab routes remain `noindex`; public routes enter the sitemap only
    after route-level acceptance; logged-in route `noindex` remains a named
    pre-deployment safety task;
12. the accepted sequence: 8B shared public shell; 8B.1 accepted homepage
    transfer; 8C shared public primitives; 8D Product and How it works; 8E
    Trust and verification methodology; 8F Resources, curated Documentation,
    and truthful availability; 8G cross-route review; 8H final public
    design-system freeze;
13. every frozen Phase 7.1 input, including the unchanged Hero; and
14. Phase 8A having performed no implementation.

The later gates in Section 25 and the package's `OPEN_GATES.md` remain open;
they are not Phase 8A blockers. Protected scope in Section 24 remains binding
and was not modified. This acceptance does not accept any implementation,
deployment, deletion, canonical origin, or change to the frozen Hero.

**Phase 8B is authorised next. Phase 8B.1 follows immediately after the Phase
8B gate closes. No Phase 8 implementation has begun.**
