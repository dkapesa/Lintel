# R5E.2G — Cross-route Public Review

**Status: ACCEPTED AND COMPLETE**

**Branch:** `r5e2g-cross-route-public-review`
**Milestone:** Phase 8G

## 1. Purpose

Phase 8G adds no new public product surface. It reviews the complete accepted
public system — five public page routes, three curated public documents, and
one live documentation namespace with deliberately no `/docs` index —
adversarially across responsive behaviour, accessibility, cross-route
composition, product truth, navigation and information architecture,
metadata/indexing, accidental publication, performance and resilience.

Per the Section 13 review-first policy, code was changed only for a
demonstrated Category C bounded defect. **The review found none.** No
application, style, content or configuration file was modified.

## 2. Authoritative inputs

Read in full before review: `R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT.md`,
`R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md`, `R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`,
`R5E2B_SHARED_PUBLIC_SHELL.md`, `R5E2B1_PRODUCTION_HOMEPAGE_TRANSFER.md`,
`R5E2C_SHARED_PUBLIC_PRIMITIVES.md`, `R5E2D_PRODUCT_AND_HOW_IT_WORKS.md`,
`R5E2E_TRUST.md`, `R5E2F_RESOURCES_AND_CURATED_DOCUMENTATION.md`, and
`docs/r5/README.md`. No historical visual-analysis package was reread; no
regression required consulting one.

## 3. Preflight

Branch `r5e2g-cross-route-public-review`. Nothing staged. `git diff --check`
clean. No diff against `package.json`, any lockfile, `README.md`,
`docs/assets`, `.claude/launch.json`, `app/workspace`, `app/report` or
`app/new`. `git log --oneline -14` shows the Phase 8F merge (`7bd5f42`) at
`HEAD` with the complete 8B→8F history beneath it. All thirty-four historical
untracked evidence packages remain present and untouched. Generated-file
hashes recorded before and after all build/tsc runs:

| File | SHA-256 |
| --- | --- |
| `next-env.d.ts` | `4e4da12aa061aac172fb1bcb48e9b6e4b293080d2f494327925fdba8f39632ac` |
| `tsconfig.tsbuildinfo` | `6882f72e36c3a9a6bbcae2d1c03fa5d303cbefe23decfe4cbd5cab34ca72be81` |

Both hashes were identical before the review, after `npx tsc --noEmit
--incremental false`, after two full `npm run build` runs (one with a
temporary test origin), and at final validation. All eight accepted public
reading surfaces exist and return 200. Phase 8H has not begun; no
`R5E2H*` document or package exists.

## 4. Public-system inventory

Five public page routes (`/`, `/product`, `/how-it-works`, `/trust`,
`/resources`), three curated public documents (`/docs/run-lintel-locally`,
`/docs/data-boundaries`, `/docs/github-app-prototype`), and one live
documentation namespace (`/docs`) with deliberately no index route. This is
the Phase 8F-accepted description and is used throughout this review; "six
public page routes" is not used.

Also validated: `/docs/security-model.md` issues an HTTP 308 permanent
redirect to `/docs/data-boundaries`; `/docs/does-not-exist` returns a genuine
404; `public/docs/cli-github-action-blueprint.md` remains reachable as a
static file and remains `robots.txt`-disallowed; the deleted
`public/docs/evaluation-results.md` returns 404; every `/visual-lab/**` and
`/lvos/**` route remains `noindex, nofollow`; no route, component or import
anywhere in `app/**` references `docs/r4/**`, `docs/r5/**`, or any
`*_PACKAGE/`/`*_EVIDENCE/` directory as a live link (comment-only citations
of milestone documents were found and are not reachable content).

## 5. Cross-route visual verdict

**ACCEPTED — no defect.** The five routes and three documents read as one
system: shared shell (header/footer/tokens/type/spacing/focus), shared
primitives (`RouteIntroduction`, `SectionHeading`, `MetadataGrid`,
`SemanticStatus`, `NeutralPlate`, `ProductFrame`, `TechnicalExcerpt`), and one
control grammar, while each route keeps a distinct responsibility: Home
demonstrates via the frozen interactive Hero and three alternating sections;
Product is prose-plus-scene depth (thirteen H2 sections, four route-local
scenes); How it works is a numbered nine-step procedure; Trust is
prose-and-metadata-first with two static scenes and no `ProductFrame`;
Resources is a plain curated index with no scenes; the three documents are
long-form reading surfaces with a contents list and pager. No visual outlier
was found — no route reintroduces the Extended Neutral band, no route adds a
second interactive scene, no route invents a control not in the shared
grammar. See `VISUAL_CONSISTENCY_REVIEW.md`.

## 6. Route-specific visual findings

None requiring correction. `ROUTE_MATRIX.md` and `VISUAL_CONSISTENCY_REVIEW.md`
record composition detail per route.

## 7. Responsive verdict

**ACCEPTED — no defect.** All eight surfaces were measured at 1920, 1440,
1280, 1024, 768, 430, 390, 375, 360 and 320 CSS-pixel widths, plus a 640px
200%-zoom-equivalent width, using same-origin iframe measurement (the
Browser pane's compositing surface did not display this session — see
§13). Horizontal overflow (`scrollWidth − clientWidth`) was `0` at every
width on every route. Exactly one `<header>`, one `<main>`, and one
`<footer>` were present at every width on every route. No `<pre>` element
required internal scrolling at 640px on any route, so no code block was
found to need (and lack) `tabindex`/an accessible name. The frozen Hero
matrix was not re-measured pixel-by-pixel because no diff exists anywhere
under `app/_public-r5-reference-reconstruction/**` since Phase 8B.1's
accepted measurement — the file is provably unchanged, not merely assumed
unchanged. See `RESPONSIVE_MATRIX.md`.

## 8. Navigation verdict

**ACCEPTED — no defect.** Desktop primary navigation is exactly Home,
Product, How it works, Trust, with `aria-current="page"` correctly following
the current route on all four (verified directly, one at a time). Resources
is reachable only from the footer and from Trust/Resources cross-links, never
from primary navigation, matching the accepted architecture. No Pricing, no
Models, no Documentation primary item, no `/docs` index, no mega-menu, no
dropdown exists anywhere. The mobile disclosure (now live, because four
primary routes exist) was exercised on two routes (`/product` and `/trust`):
it exposes exactly four real destinations (Resources correctly excluded);
Enter/click opens it and moves focus to the first link; the toggle button is
included in the keyboard trap (five focusable elements: toggle + four links);
Tab from the last link wraps to the toggle, Shift+Tab from the toggle wraps
to the last link; Escape closes it, restores `aria-expanded="false"`, and
removes the panel from the DOM; an outside pointer-down closes it; clicking a
destination link closes it and navigates; the toggle and every mobile link
measure exactly 44×44/44px. One item could not be exercised — see §13.
No-JavaScript navigation was independently verified by raw SSR inspection:
the toggle button ships with a literal `hidden=""` attribute and a
`<noscript>` fallback list renders the same four real links, so no dead
control is ever present. See `NAVIGATION_REVIEW.md` and `KEYBOARD_REVIEW.md`.

## 9. Accessibility verdict

**ACCEPTED — no defect.** Every route has exactly one `<h1>`, one `<main
id="main">`, one `<header>`/banner, one primary `<nav aria-label="Primary
navigation">`, one `<footer>`, zero duplicate `id` values, and zero heading-
level skips across the full descent (checked programmatically on all eight
surfaces at 1440px). The skip link (`href="#main"`, text "Skip to content")
is the first focusable control on every route. No public route contains a
`<table>` element, so no table-adaptation defect is possible; metadata uses
`<dl>`-equivalent `MetadataGrid`/`MetadataItem` relationships throughout.
Semantic-colour spot checks confirm the six-meaning system is used correctly
and narrowly: the `model` tone (`#7040c7`, violet) appears exactly once in
`trust-content.ts`, attached only to the model-assisted-analysis provenance
row; the `review` tone (orange, `#b43d0b`) is used for the Change Passport
`unverified`/`observed but undeclared` states on both Product
(`ChangePassportBoundaryScene.tsx`) and Trust, and nowhere decoratively; no
`status-success` (green) token or `APPROVE`-as-achieved-state rendering
appears outside vocabulary prose. See `ACCESSIBILITY_REVIEW.md`.

## 10. Keyboard verdict

**ACCEPTED — no defect**, with one item recorded as an environment
limitation rather than a finding (§13). Full traversal order (skip → identity
→ navigation → primary action → main → footer) and the mobile-disclosure
trap were verified as described in §8. See `KEYBOARD_REVIEW.md`.

## 11. No-JavaScript verdict

**ACCEPTED — no defect.** Raw SSR HTML was fetched directly (bypassing the
browser entirely) for `/`, `/product`, `/how-it-works`, `/trust`,
`/resources` and `/docs/run-lintel-locally`. Every route ships: the skip
link; the complete desktop navigation; the mobile toggle hidden via a
literal `hidden` attribute (not CSS-only, so it is absent from the
accessibility tree pre-hydration exactly as required); a `<noscript>`
fallback navigation list with the same four real destinations; and a
complete `<footer>`. No control exists whose only behaviour is client-side
with a lying static state. See `NO_JAVASCRIPT_REVIEW.md`.

## 12. Reduced-motion verdict

**ACCEPTED — no defect**, verified by source review rather than live media
emulation (§13). `prefers-reduced-motion` rules exist in the shell, the
primitive layer, the docs module, and the Home-only motion components
(`SceneMotion.tsx`, `PublicSceneViews.tsx`, `reference-reconstruction.module.css`).
No route outside Home contains `@keyframes`, `transition-delay`, or a
`data-motion` attribute, confirming the contract's "every scene on Trust,
Resources and Documentation remains static" is true in practice, not only in
policy — there is no automatic motion on Product, How it works, Trust,
Resources or the three documents to suppress in the first place. See
`REDUCED_MOTION_REVIEW.md`.

## 13. Forced-colours verdict

**ACCEPTED — no defect**, verified by source review (§13). `forced-colors`
rules exist in the shell, the primitive layer, and every route-specific
module (`product.module.css`, `how-it-works.module.css`, `trust.module.css`,
`resources.module.css`, `docs.module.css`) plus the reconstruction module.
See `FORCED_COLOURS_REVIEW.md`.

### Environment limitation (binding on §9–§13)

The Browser pane's compositing surface did not display in this session — an
identical limitation to the one `R5E2E_TRUST.md` and
`R5E2F_HUMAN_REVIEW_PACKAGE/README.md` already recorded for their own
sessions. `document.hidden` was `true` and `document.visibilityState` was
`"hidden"` throughout, which per the Page Visibility API suspends
`requestAnimationFrame` callbacks. This blocked exactly one check: live
confirmation that closing the mobile disclosure with Escape visibly moves
focus back to the toggle button, because `closeAndRestore()` in
`PublicHeader.tsx` schedules that focus move inside a `requestAnimationFrame`
callback. Every other effect of `closeAndRestore()` — `aria-expanded`
flipping to `false` and the panel unmounting — was confirmed. This is
recorded as an environment limitation, not a finding: the `rAF`-deferred
focus restoration is unchanged source code, byte-identical to the
implementation Phase 8B and 8D already accepted with real, visible-browser
evidence. Live pixel screenshots, true browser-chrome 200% zoom, and native
OS-level reduced-motion/forced-colours emulation were substituted with raw
HTTP inspection, same-origin iframe layout measurement, direct DOM/CSSOM
inspection, and source-level CSS-rule audit, consistent with the prior
sessions' own documented substitution.

## 14. 200% zoom verdict

**ACCEPTED — no defect.** The accepted 640 CSS-pixel equivalent (derived from
a 1280px-wide viewport at 200%) was measured on all eight surfaces: zero
horizontal overflow, one `<h1>`/`<main>`/`<footer>` each, and no `<pre>`
element requiring internal scroll. See `ZOOM_200_REVIEW.md`.

## 15. Product-truth consistency

**ACCEPTED — no defect.** A dedicated pass cross-checked twelve product-truth
dimensions (deterministic baseline and optional model assistance; the
`api.openai.com` provider boundary; `store: false` wording; the GitHub App's
deterministic-only/prototype/local-filesystem status; JWT/HMAC wording
against `lib/github-app-auth.ts`; absence of any hosted-database or
multi-user implication; Change Passport declaration vocabulary; the
non-cryptographic run-fingerprint boundary; the Readiness Delta/Review Diff
persistence-path scoping; Human Decision authority and PR #482's unresolved
`PENDING` state; the full list of prohibited implications in §21b of the
design-system contract; and the canonical PR #482 fact set) across Home,
Product, How it works, Trust, Resources and all three documents. All twelve
passed with no broadened or contradictory claim found anywhere. Every value
Trust designates canonical is imported or paraphrased as a strict subset
elsewhere, never restated more broadly. Full detail in
`PRODUCT_TRUTH_MATRIX.md`.

## 16. Metadata/indexing verdict

**ACCEPTED — no defect.** With no configured origin, `sitemap.xml` is a
valid empty urlset and `robots.txt` carries no `Host`/`Sitemap` line, exactly
as designed. With a bounded temporary valid HTTPS test origin
(`https://phase8g-test.example`, applied only for one build and immediately
reverted), the sitemap contains exactly the eight accepted canonical paths in
the expected order, with no dead `/docs` entry, no draft path, and no
private-lab path; `robots.txt` correctly emits the matching `Host` and
`Sitemap` lines and continues to disallow `/visual-lab/`, `/lvos/` and the
retained `cli-github-action-blueprint.md`. The unconfigured build state was
restored and the generated-file hashes confirmed unchanged (§3). See
`INDEXING_AND_PUBLICATION_REVIEW.md`.

## 17. Accidental-publication verdict

**ACCEPTED — no defect.** No component or route under `app/**` imports,
links to, or fetches any path under `docs/r4/**`, `docs/r5/**`, or any
`*_PACKAGE/`/`*_EVIDENCE/` directory; the only matches found were source-code
comments citing milestone documents for provenance, which are not part of
any rendered page or the accessibility tree. `public/` contains exactly the
one retained, robots-disallowed blueprint file and the ten legacy
`public/r5/scenes/*` images (unreferenced by any live route since Phase
8B.1). See `ACCIDENTAL_PUBLICATION_REVIEW.md`.

## 18. Performance matrix

**ACCEPTED — no defect; measured, not invented.** Uncompressed HTML response
bytes, measured against a temporary production build on a separate port:
Home 97,989; Product 109,087; How it works 87,480; Trust 116,326; Resources
32,813; Run Lintel locally 44,908; Data boundaries 48,561; GitHub App
prototype 48,763 — consistent with the per-milestone baselines each route
already recorded at its own acceptance gate. Shared JavaScript across
Product/How it works/Trust/Resources/Docs measures 647,789 bytes across nine
files (matching the 647,79{1,2} bytes recorded at Phase 8D/8E/8F); Home adds
one additional frozen-Hero chunk for 664,646 bytes across ten files. CSS on
`/product` totals 276,418 bytes across five chunks. Zero `<img>` elements and
zero external request origins were found on any route. Three self-hosted
Geist/Geist Mono `woff2` font files are shared across the whole site,
matching the "already loaded once in the root layout" contract clause. No
site-wide numeric budget is newly asserted here; this table is the measured
distribution the contract's §19c anticipated 8G would collect. See
`PERFORMANCE_MATRIX.md`.

## 19. Layout-stability verdict

**ACCEPTED — no defect.** No route contains an automatically-animating
element outside Home; Home's choreography is the already-frozen, already-
measured Phase 7.1/8B.1 behaviour, unchanged (§7). No client component
exists on Product, How it works, Trust, Resources or the three documents
(confirmed by a `"use client"` search scoped to their directories returning
zero results), so none of them can shift on hydration. See
`LAYOUT_STABILITY_REVIEW.md`.

## 20. Findings register

**Zero Category C (bounded defect) findings.** See `FINDINGS_REGISTER.md` for
the full classification of every item considered, including the six items
classified A (accepted, no defect) or already-carried polish/deployment
items classified under §21.

## 21. Carried gates (re-evaluated, not resolved)

None of the following are new; all were already named by 8B–8F. Re-evaluated
here and reclassified per the Section 10/13 taxonomy:

| Gate | Classification | Status |
| --- | --- | --- |
| Logged-in product routes have no `robots` metadata (default indexable) | Blocks deployment | Unresolved; no Phase 8 milestone is authorised to touch protected logged-in routes |
| Production origin / `metadataBase` / canonical configuration | Blocks deployment | Unresolved; policy correct and origin-gated, implementation requires a real host |
| Missing `/favicon.ico` | Non-blocking polish | Unresolved; Chrome's automatic `/favicon.ico` request 404s but is invisible to the rendered page |
| Root `README.md` omits the Agent Change Passport | Repository-documentation debt | Unresolved; root README remains protected scope |
| `public/docs/cli-github-action-blueprint.md` remains uncurated, static, robots-disallowed | Non-blocking polish | Correctly mitigated, not defective |
| Resources kind-filter trigger (8+ documents across 3+ genuine kinds) | Future scale trigger | Not yet met — 3 published documents across 2 kinds (Setup, Reference); grouped headings remain correct |

**Binding statement, per §10 of this milestone's instructions and §7i.5 of
the design-system contract:** Phase 8H may not describe the public system as
launch-ready while the logged-in-route indexing decision and the production-
origin/canonical decision remain unresolved. Both remain unresolved after
this review.

## 22. Bounded corrections made

**None.** The review found no genuine bounded defect meeting the Category C
bar (objectively demonstrated, narrowly scoped, preserves accepted product
truth and visual contracts, no redesign, no new public surface, no logged-in
change). No file under `app/**`, `lib/**`, `public/**`, or any CSS/content
module was modified during this milestone.

## 23. Human review requirements

The human owner was asked to accept:

1. that the adversarial review found no bounded defect requiring correction;
2. the cross-route visual, responsive, navigation, accessibility, keyboard,
   no-JavaScript, product-truth, indexing and performance verdicts recorded
   above;
3. the environment-limitation substitution described in §13, consistent with
   the identical substitution already accepted at Phase 8E and 8F;
4. that the six carried gates in §21 remain correctly classified and
   unresolved, and that none blocks Phase 8G's own acceptance (they are
   deployment/documentation gates, not Phase 8G defects);
5. that Phase 8H may proceed to a freeze but may not describe the system as
   launch-ready while the two deployment-blocking gates remain open.

## 24. Final human acceptance

**Binding decision: Phase 8G is ACCEPTED AND COMPLETE.**

The human owner confirmed all twenty-five points of the closeout instruction,
in full agreement with this document's own recorded verdicts:

1. the complete public system is visually coherent across Home, Product, How
   it works, Trust, Resources and the curated documentation;
2. each route retains its distinct responsibility without visual-system
   drift;
3. desktop, tablet, mobile, 320px and 200% zoom are accepted;
4. navigation and active-route semantics are accepted;
5. the four-destination mobile disclosure is accepted;
6. Escape closes the mobile disclosure and restores focus correctly — the
   human owner's acceptance resolves the §13 environment limitation in the
   product's favour: the `requestAnimationFrame`-scheduled restoration is
   unchanged, already-accepted Phase 8B/8D code, and this review's inability
   to observe it fire in a hidden document is confirmed as a tooling
   limitation, not a live defect;
7. keyboard behaviour is accepted;
8. JavaScript-disabled behaviour is accepted;
9. reduced-motion behaviour is accepted;
10. forced-colours behaviour is accepted;
11. product-truth consistency across all public surfaces is accepted;
12. Trust remains canonical for availability and product-truth boundaries;
13. metadata, robots and sitemap behaviour are accepted;
14. no internal R4/R5/package/evidence/planning material is accidentally
    published or indexable;
15. performance and layout-stability evidence is accepted;
16. zero Category C defects were found;
17. zero Category D architectural conflicts were found;
18. no application correction is required;
19. logged-in-route `noindex` remains a deployment blocker;
20. production-origin/canonical configuration remains a deployment blocker;
21. the missing favicon and other public-identity polish remain non-blocking
    polish debt;
22. the root README's Agent Change Passport omission remains
    repository-documentation debt;
23. the retained, uncurated CLI/GitHub Action blueprint remains intentionally
    `robots.txt`-disallowed;
24. Resources filtering remains a future scale trigger at 8+ curated
    documents across 3+ genuine kinds;
25. Phase 8H is authorised next.

This acceptance closes only Phase 8G. It does not resolve the two carried
deployment blockers (§21, points 19–20 above), does not authorise any
application, style, metadata, routing, dependency or asset change, and does
not itself begin Phase 8H.

## 25. Status

**ACCEPTED AND COMPLETE.** Phase 8H is authorised next but has not begun.
Nothing was staged, committed, pushed or merged during this closeout.
