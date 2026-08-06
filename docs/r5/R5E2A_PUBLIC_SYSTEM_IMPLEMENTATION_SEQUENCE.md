# R5E.2A — Public System Implementation Sequence

**Status: ACCEPTED AND COMPLETE**

Companion to `R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT.md` and
`R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md`. Defines Phase 8B through Phase 8H.

Documentation only. **No implementation milestone has begun.** Final human
acceptance has closed Phase 8A, and Phase 8B is authorised next.

---

## 1. Sequence

| Milestone | Objective | Lead |
| --- | --- | --- |
| 8B | Global public shell | Claude Code |
| **8B.1** | **Production homepage transfer** | Claude Code |
| 8C | Shared public primitives | Codex |
| 8D | Product and How it works routes | Codex |
| 8E | Trust and verification methodology | Claude Code |
| 8F | Resources, Documentation and truthful commercial foundations | Codex |
| 8G | Cross-route responsive, accessibility, product-truth and performance review | Claude Code |
| 8H | Final public design-system freeze | Claude Code |

Each milestone has an explicit human gate. No milestone may begin before the
preceding gate closes.

### 1.1 Why 8B.1 exists

The original Phase 8 outline did not contain a homepage transfer. The
inventory established that production `/` still renders the superseded
`app/_public-r5/` build — image-led, dependent on ~1.5MB of screenshots, and
still carrying the `Security` navigation label that
`R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` §1 formally superseded with
`Trust`. The accepted Phase 7/7.1 direction exists only at a private route,
and R5E.1F (the transfer milestone) is recorded as "not started".

Building three new routes against a homepage that is not live would mean
every later route is designed against an implementation the public cannot see,
and would leave the superseded build in production through the whole of
Phase 8. Placing the transfer immediately after the shell makes Home the
reference implementation every later route composes against.

### 1.2 Lead recommendation rationale

The split follows the character of the work, not a preference.

**Claude Code leads** milestones whose risk is *judgment against a frozen
contract*: the shell (8B) and the transfer (8B.1) touch production and the
accepted Hero, where the cost of a silent deviation is highest; Trust (8E) is
almost entirely product-truth calibration against the README and R4A
vocabulary, where a plausible-sounding sentence can be a product-truth
violation; 8G is adversarial review across every route; 8H is a freeze
requiring the same evidence discipline that closed Phase 7.1F.

**Codex leads** milestones whose risk is *volume of consistent construction*:
8C builds a broad primitive layer from an existing accepted stylesheet;
8D builds two routes from a fixed template and fixed content sources; 8F
builds an index and a document renderer. These are large, patterned and
mechanically verifiable, which is where Codex is strongest.

Either tool may execute any milestone; the recommendation is about which one
should lead and own the evidence.

---

## 2. Phase 8B — Global public shell

**Objective.** One shared public shell — header, footer, skip link, mobile
disclosure, tokens, typography roles, accessibility utilities, navigation and
footer data, route metadata, robots and sitemap — replacing the three-way
duplication recorded in the inventory.

**8B owns the public route-metadata architecture.** This is a named
ownership, not an open gate: the canonical URL policy, the `metadataBase`
decision, the `robots` policy and the sitemap contract are all decided and
recorded here. The sitemap is generated from `app/_public/navigation.ts` and
the curated documentation list — **never from the filesystem** — so an
unpublished document cannot enter it by existing on disk. Private visual-lab
routes remain `noindex, nofollow` permanently.

8B **may apply metadata only within its authorised public scope**; it may not
edit the logged-in routes. Adding `noindex` to those routes is a **named
pre-deployment safety task** with no Phase 8 owner under the current
authorisation, and 8B records it as such rather than silently absorbing it or
leaving it ownerless.

**Authorised scope.**
1. Create `app/_public/` with `public-tokens.css`, `public-type.css`,
   `a11y.css`, `navigation.ts`, `metadata.ts`.
2. Create the shell components: `PublicShell`, `PublicHeader`, `PublicFooter`,
   `SkipLink`, `MobileNav`.
3. Validate the `app/(public)/` route-group recommendation against Next 16
   behaviour, and adopt the per-route wrapper fallback if it conflicts.
4. Create `app/robots.ts` and `app/sitemap.ts`.
5. Mount the shell on **no production route yet** — prove it at one private
   verification route.

**Protected scope.** `app/page.tsx`; every existing public family; every
logged-in route; `lib/**`; `public/**`; `package.json` and lockfiles;
`.claude/launch.json`; the root README; every accepted document. No dependency
added. The accepted Hero is not touched by this milestone.

**Dependencies.** Phase 8A acceptance.

**Expected implementation tool.** Claude Code. The shell sets the contract
every later milestone inherits, and its riskiest requirements — the
no-layout-movement sticky header, the eight mobile-disclosure conditions, and
truthful no-JavaScript degradation — are judgment against the frozen contract
rather than volume.

**Evidence required.**
1. Production-build browser capture of the shell at all five breakpoint tiers.
2. Keyboard traversal: skip → identity → labels → action → main → footer.
3. Mobile disclosure: open, focus containment, Escape, focus restoration,
   route-change close.
4. JavaScript-disabled capture proving every destination resolves and the
   disclosure control is absent rather than dead.
5. Forced-colours and reduced-motion captures.
6. Proof of no layout movement on sticky state change (measured box
   dimensions in both states).
7. `robots.ts` and `sitemap.ts` output.

**Human gate.** The human owner accepts the shell's visual restraint, the
mobile disclosure behaviour, the navigation and footer destinations, and the
route-metadata architecture — including the recorded status of the logged-in
`noindex` safety task.

**Exit criteria.** The shell exists, is proven at every tier and special
state, changes no production route, adds no dependency, and introduces no
placeholder destination. `app/robots.ts` and `app/sitemap.ts` exist and state
policy explicitly; the sitemap draws only from curated data; the canonical-URL
and `metadataBase` policy is written, with implementation recorded as blocked
on a real production origin; the logged-in `noindex` task is recorded with its
status.

---

## 3. Phase 8B.1 — Production homepage transfer

**Objective.** Render the accepted Phase 7/7.1 reconstruction at production
`/`, under the Phase 8B shell, with no redesign.

**Authorised scope.**
1. Point `app/page.tsx` at the accepted implementation.
2. Replace the reconstruction's own header and footer with the shared shell.
3. Preserve the Extended Neutral Hero, the frozen matrix, all four scenes,
   all interaction, all motion and all canonical values **byte-for-byte in
   behaviour**.
4. Update production route metadata (title, description, robots, and
   `metadataBase` only if a real origin exists).
5. Keep `/visual-lab/public-r5-reference-reconstruction` rendering the same
   implementation, as the private comparison route.

**Protected scope.** The accepted Hero hierarchy, matrix, materials,
choreography and canonical values — none may change. No scene may be
redesigned. `app/_public-r5/` and `app/_public-r5-recalibrated/` are left in
place; deletion is a separate human decision. `public/r5/scenes/*` is left in
place. No logged-in route, no `lib/**`, no dependency.

**Dependencies.** Phase 8B gate closed.

**Expected implementation tool.** Claude Code. This milestone touches
production and the frozen Hero simultaneously; the entire task is proving that
nothing accepted changed.

**Evidence required.**
1. Side-by-side captures of `/` and the private route at all five tiers,
   proving visual identity of the Hero band, matrix and frame.
2. Measured Hero band dimensions at each tier against the frozen matrix
   (88/56/64, 80/48/56, 72/40/48, 64/32/40, 56/20/40, 12/12/12).
3. Interaction proof: H1–H3, manual authority, interruption, reload reset,
   scroll-away/return preservation.
4. Reduced-motion, no-JavaScript, forced-colours and keyboard captures at `/`.
5. Cache-disabled production navigation measurement of `/` under the new
   shell, recorded as the **per-route performance baseline** for §9.3 of the
   primary contract.
6. Proof of zero image requests and zero external requests at `/`.
7. Confirmation that `public/r5/scenes/*` is now unreferenced by `/`.

**Human gate.** The human owner confirms the frozen Hero is unchanged, the
shell integration introduced no drift, the canonical values are intact, and
production `/` is now the accepted direction.

**Exit criteria.** `/` renders the accepted page under the shared shell; the
frozen matrix is measured and matches; no accepted behaviour changed; the
per-route performance baseline is recorded.

---

## 4. Phase 8C — Shared public primitives

**Objective.** Promote the accepted implementation's primitives into the
shared layer: layout primitives, the Section 9 typography roles, the action
grammar, the metadata grammar, motion utilities, and shared product-scene
families 1–7.

**Authorised scope.**
1. `app/_public/layout/` — `PageWrap`, `Section`, `SplitSection`,
   `ProseColumn`.
2. `app/_public/controls/` — `Action`, `TextLink`, `ExternalLink`.
3. `app/_public/metadata-ui/` — `FactRow`, `CompactRow`, `Identifier`.
4. `app/_public/motion/` — `SceneMotion` and the motion token CSS, relocated
   without behaviour change.
5. `app/_public/scenes/` — shared families 1–7 only.
6. Refactor Home to consume the shared primitives, with **zero visual or
   behavioural change**.

**Protected scope.** Route-specific families 8–14 stay out of the shared
layer. No new token, no new type role, no new motion value, no dependency. The
accepted Hero behaviour is unchanged. Nothing enters the shared layer without
two genuine routes needing it — during 8C the second consumer is the 8D route
scaffold, which must be demonstrated, not assumed.

**Dependencies.** Phase 8B.1 gate closed.

**Expected implementation tool.** Codex. This is broad, patterned extraction
from a 1,984-line accepted stylesheet into a primitive layer — high volume,
mechanically verifiable, low judgment.

**Evidence required.**
1. Before/after captures of `/` at all five tiers proving pixel identity after
   the refactor.
2. Interaction and motion regression proof at `/`.
3. A primitive inventory listing every promoted primitive and the two genuine
   consumers that justify it.
4. Cache-disabled measurement of `/` showing the shared-primitive delta
   against the 8B.1 baseline.

**Human gate.** The human owner confirms Home is unchanged and the promoted
set contains no premature abstraction.

**Exit criteria.** Primitives exist and are consumed; Home is pixel- and
behaviour-identical; nothing shared lacks two genuine consumers.

---

## 5. Phase 8D — Product and How it works routes

**Objective.** Build the first two genuinely new public routes, and promote
navigation from in-page anchors to route destinations.

**Authorised scope.**
1. `/product` and `/how-it-works` per the route architecture §2.2 and §2.3.
2. Route-specific scene families 8, 10, 11, **15** (Product) and 13, 14 (How it
   works). Family 15 is the **Agent Change Passport declaration boundary**,
   reading `lib/change-passport.ts` read-only.
3. Product's concise availability notice pointing to Trust.
3. Navigation labels become route destinations; the mobile disclosure is
   populated.
4. Route-level active state (`aria-current="page"`).
5. Home's `#product`, `#how-it-works` anchors resolved: either retained as
   in-page sections with the navigation now pointing at the routes, or
   removed — decided with evidence, not by default.

**Protected scope.** Home's composition, interaction and canonical values. The
frozen Hero. The Extended Neutral band does not appear on either new route.
Trust content stays on Trust. No pricing, no commercial content, no adoption
claim. At most one interactive scene per route.

**Dependencies.** Phase 8C gate closed.

**Expected implementation tool.** Codex. Two routes from a fixed template,
fixed content sources and an existing primitive layer — high volume, patterned.

**Evidence required.**
1. Both routes at all five tiers.
2. Keyboard, reduced-motion, no-JavaScript, forced-colours captures per route.
3. Mobile disclosure with three real destinations.
4. Product-truth review of every claim on both routes against the README
   capability tables — specifically the Readiness Delta and Review Diff
   persistence-path boundary.
4a. **Agent Change Passport claims traced to `lib/change-passport.ts`
   directly**, because the root README capability tables omit the passport
   entirely. Proof that no copy calls a declaration "verified", that the
   passport is presented as optional with `absent` a first-class state, and
   that producer type is described as declared rather than detected.
4b. Proof that `unverified` and `observed but undeclared` render in orange
   attention with their own text labels, not in amber or red and not by
   colour alone.
5. Per-route cache-disabled measurement.
6. Proof that no scene invents a canonical value.

**Human gate.** The human owner accepts both routes' purpose separation, scene
grounding, and product-truth accuracy.

**Exit criteria.** Two routes ship; navigation is route-level; no route
duplicates another's purpose; every claim is traceable.

---

## 6. Phase 8E — Trust and verification methodology

**Objective.** Build `/trust`, including the Models subsection and the
Availability section, as the route where product truth is stated most
explicitly.

**Authorised scope.**
1. `/trust` per route architecture §2.4.
2. Route-specific scene families 9 (canonical run / provenance) and 12
   (integration status).
3. The Models subsection (route architecture §3).
4. The Availability section (route architecture §4.1).
5. The limitations section, drawn from the README's own limitations list.

**Protected scope.** No pricing, no plan, no trial, no hosted claim, no
certification or compliance claim, no enforcement claim. No interactive scene.
No Extended Neutral band. Slack stays export-only; the GitHub Action stays a
blueprint; the GitHub App stays a prototype with local filesystem persistence.
Exact stochastic replay is not claimed.

**Dependencies.** Phase 8D gate closed.

**Expected implementation tool.** Claude Code. Almost the entire milestone is
product-truth calibration against the README and the R4A label vocabulary,
where a fluent sentence can quietly become an over-claim.

**Evidence required.**
1. A claim-by-claim trace table: every sentence on `/trust` mapped to its
   source line in the root README or `R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md`.
2. The route at all five tiers, with table adaptation proven at ≤767px.
3. Keyboard, reduced-motion, no-JavaScript, forced-colours captures.
4. Explicit confirmation that no prohibited implication (primary contract
   §21b) appears.
5. Per-route cache-disabled measurement.

**Human gate.** The human owner accepts every product-truth statement, the
Models placement, and the Availability wording.

**Exit criteria.** `/trust` ships; every claim is traced; no prohibited
implication appears; the Models decision is visibly implemented as a
subsection.

---

## 7. Phase 8F — Resources, Documentation and truthful commercial foundations

**Objective.** Build `/resources` and `/docs/[slug]`, and lay the truthful
commercial foundations without creating a commercial route.

**Authorised scope.**
1. **Run the curation gate** (route architecture §5.1) over every candidate
   document, recording content decision, audience, owner, product-truth review,
   publication status and source for each. The three files already in
   `public/docs/` are candidates, **not** publications, and pass the gate or do
   not render.
2. Build the explicit, hand-maintained curated list.
3. `/resources` per route architecture §2.5, indexing that list, with one kind
   filter that works without JavaScript or is not rendered.
4. `/docs/[slug]` per §2.6, rendering only curated entries and declaring
   verbatim-or-adaptation per document.
5. Footer promotion of Resources and Documentation.
6. Documentation **may** explain local setup and evaluation; any commercial
   statement links to Trust rather than restating it.
7. Record the commercial-route template as ready, with the trigger restated —
   **no `/pricing` route is created**.

**Protected scope.** No pricing route. No plan, price, trial or billing
content anywhere, and Documentation never becomes the canonical
commercial-status source. **No filesystem-driven publication** — no glob, no
directory scan, no route generated by walking `docs/` or `public/docs/`. No
internal R4/R5 milestone contract, human-review package, evidence package or
acceptance record is published. No document listed that has not passed the
gate. No "coming soon" entry. No call to action inside a document body. No
search.

**Dependencies.** Phase 8E gate closed.

**Expected implementation tool.** Codex. An index plus a document renderer is
patterned construction with a well-defined content source.

**Evidence required.**
1. Both routes at all five tiers.
2. The completed curation record — six gate fields per published document —
   and proof that the route list is explicit data, not a directory scan.
3. Proof that no internal contract, review package or evidence package is
   reachable, linked or in the sitemap.
4. Filter behaviour with JavaScript disabled.
4. Long-form reading measure verified at 68–72ch.
5. Keyboard, reduced-motion, forced-colours captures.
6. Per-route cache-disabled measurement.

**Human gate.** The human owner accepts the curated document set, each
document's gate record, and the absence of a commercial route.

**Exit criteria.** Both routes ship; every published document passed the six-part
curation gate; publication is data-driven and not filesystem-driven; no
internal or evidence material is reachable; no commercial claim appears
outside Trust's canonical section.

---

## 8. Phase 8G — Cross-route responsive, accessibility, product-truth and performance review

**Objective.** Review the complete six-route public system as one system, and
set the site-wide performance budget from measured evidence.

**Authorised scope.**
1. Adversarial review across every route: responsive matrix, accessibility,
   keyboard, reduced motion, no JavaScript, forced colours, 200% zoom, 320px.
2. Cross-route product-truth audit against the primary contract §21.
3. Cross-route consistency audit: type roles, spacing steps, colour use
   (including correct amber / orange / red separation), control grammar,
   metadata grammar.
4. **Metadata and indexing validation** — route metadata, canonical links,
   `robots` behaviour, sitemap membership, and an explicit accidental-indexing
   check proving no private lab route, draft document or evidence package is
   indexable or in the sitemap.
5. Set the site-wide performance budget from the per-route measurements
   collected in 8B.1 through 8F.
6. Bounded corrections only — defects, not redesign.

**Protected scope.** No redesign. No new route. No new primitive. No change to
the frozen Hero. Any finding that requires redesign is recorded and deferred,
not fixed inside this milestone.

**Dependencies.** Phase 8F gate closed.

**Expected implementation tool.** Claude Code. This is the same adversarial
evidence discipline that closed Phase 7 at R5E.1E.4D — finding and classifying
defects across a whole system rather than building.

**Evidence required.**
1. The complete matrix: six routes × five tiers × six special states.
2. An accessibility-tree capture per route.
3. Complete keyboard traversal per route.
4. A cross-route product-truth trace table.
5. The measured per-route resource and byte distribution, and the site-wide
   budget derived from it.
6. A defect list classified as: corrected here / deferred with an owner /
   rejected.

**Human gate.** The human owner accepts the review, the corrections applied,
and the budget.

**Exit criteria.** Every route passes every required state; the site-wide
budget is evidence-based; every remaining defect is classified and owned.

---

## 9. Phase 8H — Final public design-system freeze

**Objective.** Freeze the public design system, in the form Phase 7.1F froze
the Hero.

**Authorised scope.**
1. A freeze document recording: the final route set; the shell; grid,
   typography, spacing, colour, control, metadata and scene contracts as
   implemented; motion; accessibility; responsive; the measured performance
   budget; product-truth boundaries; and the future-revision gates.
2. A bounded `docs/r5/README.md` update.
3. An untracked freeze package.

**Protected scope.** No implementation change of any kind. The frozen Hero
remains as Phase 7.1F recorded it. No route added or removed.

**Dependencies.** Phase 8G gate closed.

**Expected implementation tool.** Claude Code, for continuity with the
Phase 7.1F freeze discipline.

**Evidence required.** The complete accepted evidence from 8B through 8G,
referenced rather than regenerated — exactly as Phase 7.1F referenced
Phase 7.1E rather than re-capturing it.

**Human gate.** Explicit human freeze acceptance, on the Phase 7.1F model.

**Exit criteria.** The public design system is frozen; future changes require a
scoped revision, evidence, regression testing and explicit human acceptance.

**Binding constraint.** Phase 8H **may not describe the public system as
launch-ready** while the logged-in route indexing decision remains unresolved.
The freeze may still be recorded — the design system can be frozen while a
deployment safety task is open — but the freeze document must state the task's
status explicitly and must not imply readiness to deploy.

---

## 10. Sequence rules

1. No milestone begins before the preceding gate closes.
2. **Phase 8A is accepted and complete; Phase 8B is authorised next.**
3. No milestone may silently alter the frozen Hero hierarchy, matrix,
   materials, choreography or canonical values.
4. No milestone may add a dependency without an explicit, separately accepted
   justification.
5. No milestone may create a placeholder destination.
6. No milestone may assert a site-wide performance budget before 8G has
   measured one.
7. Each milestone produces a tracked record document and an untracked evidence
   package, following the established R5 pattern.
8. Any finding that requires reopening visual strategy stops the milestone and
   returns to a contract revision — it is not absorbed silently.

---

## 11. Deferred to after Phase 8H

| Concern | Note |
| --- | --- |
| Deleting `app/_public-r5/`, `app/_public-r5-recalibrated/`, the surface-comparison laboratory, and `public/r5/scenes/*` | Separate human decision; deletion is never bundled into a design milestone |
| `metadataBase` and canonical URLs | Policy owned by 8B; implementation requires a real production origin |
| Logged-in route `noindex` | **Named pre-deployment safety task.** Recorded by 8B, validated as unresolved by 8G, and an explicit constraint on 8H's launch-readiness language. No Phase 8 milestone may perform it unless separately authorised to modify those protected routes |
| Root `README.md` capability tables omitting the Agent Change Passport | Recorded in the contract §21b.1. The root README is protected scope; updating it needs a separate decision |
| `/pricing`, `/legal/*`, `/status`, `/contact` | Blocked on their named triggers |
| Logged-in Workspace, Queue and Inspector redesign | A separate phase entirely |

The Agent Change Passport is **no longer deferred**. Its data and verification
capability is implemented; its public product-scene presentation is built in
8D as scene family 15.
