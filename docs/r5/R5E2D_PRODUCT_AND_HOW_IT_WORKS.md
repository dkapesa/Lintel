# R5E2D — Product and How it works

**Status:** ACCEPTED AND COMPLETE  
**Branch:** `r5e2d-product-how-it-works`  
**Implementation base:** `bbe1eae`

## 1. Outcome

Phase 8D implements `/product` and `/how-it-works` as complete static,
server-rendered public routes. Final human acceptance closes the visual,
responsive, accessibility, keyboard, reduced-motion, forced-colours,
no-JavaScript, product-truth and Home-regression gates. The production Home
content and frozen Hero are unchanged.

The implementation follows
`plan-phase-8d-product-synchronous-meerkat.md` sections 1–18 plus the binding
human amendments. Both content modules were authored before route composition.

## 2. Route composition

### Product

`/product` contains P0 followed by P1–P13 in the required order: one H1 route
introduction and thirteen H2 sections. It uses the accepted public primitives
without modifying them. Four product-only scenes remain route-local:

- `ReviewQueueScene`
- `ReadinessDeltaScene`
- `ReviewDiffScene`
- `ChangePassportBoundaryScene`

### How it works

`/how-it-works` contains H0 followed by H1–H10 in the required order. The nine
steps are direct children of a real ordered list and display indexes 01–09.
Exactly one `ProductFrame` appears on the route, at Step 07. Three supporting
scenes remain route-local:

- `StepSection`
- `FocusedContextScene`
- `AffectedContextScene`

Neither route adds a client boundary, tabs, motion infrastructure, scene
controls, internal scrolling, imagery, gradients, glow, glass, heavy shadows,
generic cards or green status treatment.

## 3. Product-truth sourcing

Literal product claims were constrained to the named sources in the approved
plan. Runtime canonical review data is imported only from
`app/_public-r5-recalibrated/canonical-review.ts`. Types from `lib/` are imported
with `import type`; there is no new runtime import from `lib/`.

The implemented claim families trace to:

- deterministic analysis, optional model assistance, findings, provenance,
  evidence, missing proof, requirements, recommendations, risk and limitations:
  root `README.md` and the named `lib/` modules in the approved traceability
  matrix;
- GitHub App delivery, deduplication, persistence and comment behaviour:
  `docs/github-app-local-setup.md` and its named implementation modules;
- readiness movement and classifications: `lib/readiness-delta.ts` and the
  GitHub App persistence path named in the plan;
- Change Passport vocabulary and optionality: `lib/change-passport.ts` and
  `docs/github-app-local-setup.md`;
- canonical PR #482 content: the frozen canonical review module above.

No unsupported claim was added and no literal conflicts with canonical product
truth were encountered.

## 4. Agent Change Passport boundary

The canonical PR #482 scene is absent-led and states all three required facts:

- `Change Passport completeness: absent`
- `PR #482 contains no Change Passport.`
- canonical concerns are `observed but undeclared`

The supported vocabulary is shown only in a separately labelled explanatory
example that explicitly says it is not PR #482. It does not fabricate a
Passport or describe producer type as detected. `Unverified` is not presented
as false, wrong or failed. The route states that a Passport is optional and
does not affect readiness, blockers, recommendation or scoring.

## 5. Navigation activation and no-JavaScript correction

`Product` and `How it works` are now `live` primary routes. Desktop navigation
retains Home, Product, How it works and truthful unavailable Trust text.
JavaScript-enabled mobile navigation contains only Home, Product and How it
works.

The authorised shared-shell correction is limited to:

- removing the no-script rule that hid desktop navigation at every width;
- making the mobile desktop-nav copy `display: none` instead of visually hidden,
  so it is not focusable alongside the disclosure;
- restoring `display: none` for the pre-enhancement disclosure button when its
  native `hidden` attribute is present.

Observed no-JavaScript behaviour:

| CSS viewport | Result |
| --- | --- |
| 1440 px | normal desktop navigation; fallback hidden |
| 768 px | normal desktop navigation; fallback hidden |
| 375 px | desktop navigation and disclosure control hidden; plain Home, Product and How it works fallback visible |

No tested state contains duplicate visible or duplicate focusable navigation.
Trust remains unavailable desktop/footer text and is absent from both mobile
navigation forms.

## 6. Home regression boundary

`app/(public)/page.tsx`, `app/(public)/layout.tsx` and
`app/_public-r5-reference-reconstruction/**` remain byte-identical to HEAD.
The frozen Home Hero still renders its accepted H1 and review demonstration,
and the production console is clean. Header geometry sampled immediately after
navigation and after hydration was identical. The only intended Home-facing
change is route activation in navigation plus the corrected no-JavaScript
fallback behaviour.

The whole public shell is deliberately not described as byte-identical because
the two authorised shell source files changed.

## 7. Metadata and indexing

Both route registry entries retain `state: "live"` and now have
`sitemapEligible: true` following final human acceptance. Production metadata
therefore exposes `index, follow` for both routes. No canonical URL is emitted
when a valid production origin is absent, and `sitemap.xml` remains empty in
that state. With a valid HTTPS production origin, the existing origin-gated
metadata and sitemap helpers emit canonical URLs and include Product and How it
works in the sitemap.

## 8. Validation summary

- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed; Next.js 16.2.9 generated both routes as static pages.
- HTTP render: `/product` 200; `/how-it-works` 200.
- Browser console: no warnings, errors or hydration errors on Home, Product or
  How it works.
- Product structure: one H1 and thirteen H2 elements.
- How it works structure: one H1, ten H2 elements, one direct ordered list with
  nine list items, visible 01–09 indexes and exactly one ProductFrame.
- Responsive review: 1440, 1280, 1024, 768, 390, 375, 360 and 320 CSS pixels.
- 200% review: defensible 640 CSS-pixel equivalent for a 1280-wide viewport.
- No horizontal page overflow at the tested widths; no route scene scrolls
  internally.
- Active-route state: exactly one truthful current route on Home, Product and
  How it works.
- Disclosure: opens on both new routes; focus moves to Home; Escape closes and
  restores the toggle; route change, outside pointer and resize close it.
- Navigation targets meet the accepted 44 px mobile target size.
- No image element, external asset URL or new route-only client JavaScript was
  emitted. Product and How it works share the same client script set; Home has
  one additional frozen-Hero chunk.
- Uncompressed local response baseline: Product 109,427 HTML bytes; How it
  works 88,522 HTML bytes; each route references the same nine shared script
  files totalling 647,792 response bytes in the recorded production run.
- The existing reduced-motion and forced-colour CSS contracts remain present;
  route-specific forced-colour rules were added where authored scenes need
  system-colour borders or text.

## 9. Evidence and final human acceptance

The untracked `R5E2D_HUMAN_REVIEW_PACKAGE/` contains genuine browser captures
for Product and How it works at desktop, tablet and mobile widths, both active
route states, both open mobile disclosures, Escape focus restoration,
no-JavaScript desktop/mobile navigation, the 200% equivalent and production
Home regression.

The human owner accepted Product and How it works visually and compositionally,
confirmed their distinct responsibilities, and accepted desktop, tablet,
mobile, 320 px and true 200% zoom. Mobile disclosure, Enter, Space, Tab,
Shift+Tab, focus wrapping, Escape, focus restoration, reduced motion, forced
colours and JavaScript-disabled navigation all pass. Product truth and the
Change Passport absent-led framing are accepted. No correction is required.

All Phase 8D gates are closed. Phase 8D is **ACCEPTED AND COMPLETE**. Phase 8E
Trust is authorised next but has not begun.
