# R5E.2B.1 — Production Homepage Transfer

**Status: ACCEPTED AND COMPLETE**  
**Date: 7 August 2026**  
**Branch: `r5e2b1-production-homepage-transfer`**

## 1. Purpose

Phase 8B.1 moves the accepted Phase 7.1 reference reconstruction onto the
production `/` route and composes it inside the accepted Phase 8B shared public
shell. This is a route-ownership migration and regression milestone, not a
redesign. Phase 8C has not begun.

## 2. Accepted inputs

The binding inputs are the Phase 8A public-system contract, route architecture
and sequence; the accepted Phase 8B shell document and handoff package; and the
accepted Phase 7/7.1 surface freeze, hierarchy propagation and final interaction
review. Their copy, route truth, Hero behaviour, presentation hierarchy and
protected-scope decisions remain authoritative.

## 3. Route ownership migration

Before this phase, `app/page.tsx` alone owned `/` and rendered the superseded
image-led `app/_public-r5/PublicR5Page`. That entry is removed. The single new
owner is `app/(public)/page.tsx`; the route-group segment is pathless, so the URL
remains `/`. The new owner renders the accepted
`R5ReferenceReconstruction` with `heroPresentation="extended-neutral"` and
`shell="shared"`. There is no redirect, hydration switch or second homepage.
The root layout remains the only `html`/`body` owner, and logged-in route trees
remain outside the `(public)` route group and unchanged.

## 4. Shared-shell integration and local chrome removal

The production owner inherits `app/(public)/layout.tsx`, which supplies the one
shared skip link, header, primary navigation, `main#main` and footer. The
reference reconstruction accepts a bounded `shell` composition option. Its
default remains `local`, preserving private-lab behaviour; `shared` suppresses
only its local skip link, header, main landmark ownership and footer, retaining
the complete accepted page body. Production therefore has one banner, one
primary navigation landmark, one main and one content-info landmark, with no
duplicated chrome. A scoped `line-height: normal` integration guard prevents
the shared shell's global line height from changing frozen scene geometry.

## 5. Frozen Hero preservation

Hero copy, actions, repository and pull-request facts, recommendation, risk,
requirements, Human Decision, Overview/Finding/Readiness content, H1–H3
sequence, manual authority, selected-state reactivation, keyboard model,
reload reset, scroll-return persistence, reduced-motion/no-JavaScript/
forced-colours branches, product-frame styling and downstream order are not
rewritten. A same-viewport browser comparison reports identical body text and
identical frame and presentation-plate geometry between production and the
accepted private route.

## 6. Exact frozen dimension matrix

| CSS viewport width | Top | Sides | Bottom |
|---|---:|---:|---:|
| at least 1440 px | 88 px | 56 px | 64 px |
| 1280–1439 px | 80 px | 48 px | 56 px |
| 1025–1279 px | 72 px | 40 px | 48 px |
| 768–1024 px | 64 px | 32 px | 40 px |
| 360–767 px | 56 px | 20 px | 40 px |
| below 360 px | 12 px | 12 px | 12 px |

Browser measurement at every requested viewport confirms the exact CSS tokens.
Rendered edge gaps include the accepted 0.8 px device-scaled hairline border;
the frame remains opaque white with the accepted radius and border.

## 7. Metadata activation

Home already existed in the accepted registry as `live`, indexable and
sitemap-eligible. The production owner now uses `buildPublicMetadata("home")`
with the accepted absolute title and description. With no configured production
origin, `metadataBase` and canonical are absent. With an ephemeral valid HTTPS
test origin, one root canonical is emitted. No hostname is persisted or
invented, and no logged-in metadata is changed.

## 8. Robots and sitemap behaviour

Home remains indexable. Private visual laboratories remain `noindex` and
excluded. Draft Product, How it works, Trust, Resources and Docs destinations
remain disallowed and absent. Without a production origin the sitemap is empty
and robots has no Host/Sitemap line; with the bounded test origin the sitemap
contains only `/`, and robots exposes that sitemap and host.

## 9. Action destinations and product truth

Every “Open the sample review” action resolves to
`/workspace?source=fixture`, whose page identifies the selected read-only sample
and the accepted PR title. Every “Start a review” action resolves to `/new`, the
genuine New Review flow. The copy makes no hosted-account or commercial-
availability claim. No Pricing, Models or stale Security destination is present.
Home alone receives current-page semantics; the private reconstruction retains
`noindex` and no production `aria-current` state.

## 10. Responsive, interaction and accessibility regression

Genuine browser measurements cover 1920×1080, 1600×1000, 1440×900, 1280×800,
1024×768, 834×1112, 768×1024, 430×932, 390×844, 375×812, 360×800 and 320×568,
plus a 640 px CSS-viewport equivalent for 200% zoom. They show no horizontal
overflow, duplicate shell, clipped action, internal Hero scroll, following-
section collision or footer escape. The dormant mobile disclosure stays dormant.

The route has one banner, primary navigation, main, H1 and content-info; no
duplicate IDs; nonfocusable draft destinations; a working skip target and
visible focus; and the accepted Arrow, Home, End, Enter and Space Hero controls.
Manual selection persists through time and scroll return, while reload resets
to automatic Overview. Screen-reader state labels remain tied to the visible
product state.

## 11. Special-state evidence

The JavaScript-disabled production SSR route was captured through an ephemeral
local CSP proxy. It has no interactive Hero controls, preserves all canonical
facts and actions, exposes Overview and Readiness statically, and has no
horizontal overflow. Source-level reduced-motion and forced-colours branches
are preserved byte-for-byte from the accepted implementation. The available
browser runner cannot emulate those two media features, so new genuine
production screenshots and manual validation remain human acceptance gates;
they have not been fabricated. The 200% equivalent CSS viewport reflows without
horizontal overflow; true browser-UI zoom remains a manual confirmation gate.

## 12. Performance and layout stability

The transfer adds no dependency, image asset, external request, animation
library, measurement script, model call or presentation-only hydration.
A cold production HTML inventory records one document plus 18 referenced static
assets: 10 JavaScript responses (664,451 response-body bytes), five CSS responses
(315,459 bytes) and three fonts (110,548 bytes), for 1,189,449 response-body bytes
including the 98,991-byte document. These are uncompressed body measurements,
not wire-compressed transfer sizes. No image request, external request,
`public/r5/scenes/*` request, console error, hydration warning or geometry shift
was observed. Frame geometry stays fixed across accepted Hero states and matches
the private reference at 1440×900.

## 13. Superseded implementation preservation and protected scope

Production `/` no longer imports `app/_public-r5/`. The superseded
`app/_public-r5/`, `app/_public-r5-recalibrated/`, private labs,
`public/r5/scenes/**` and historical packages remain intact as archive-later
candidates. No Product, How it works, Trust, Resources or Docs route was built;
no logged-in route, workspace library, asset, dependency, lockfile, root README,
launch configuration, accepted document or earlier evidence package was changed.

## 14. Validation and human review

`npx tsc --noEmit`, `npm run build` and `git diff --check` pass. Production `/`,
the accepted reconstruction lab, shared-shell lab, existing private public labs,
fixture Workspace, New Review, robots and sitemap respond successfully from the
production server. Normal production navigation has no console or hydration
errors. Nothing is staged.

Final human review confirms visual equivalence, frozen Hero fidelity, shell
integration, both truthful actions, first-viewport composition,
tablet/mobile/320 px behaviour, reduced motion, no JavaScript, forced colours,
complete physical keyboard traversal, screen-reader landmarks and product
truth, and true browser 200% zoom. No bounded correction is required.

## 15. Open gates and Phase 8C handoff

All Phase 8B.1 human gates are closed. The human owner records the binding
decision **ACCEPTED AND COMPLETE**. Production `/` uses the accepted private
reconstruction and shared shell; the frozen Hero and dimension matrix remain
unchanged; and the superseded screenshot-led homepage remains preserved but is
no longer production-facing. Phase 8C — Shared Public Primitives — is
authorised next and has not begun.

## 16. Final human acceptance

The human owner accepts the production/private visual match, single shared
shell, frozen Hero hierarchy and dimensions, composed first viewport, desktop,
tablet, mobile and 320 px layouts, Home current-page semantics, noninteractive
draft destinations, action destinations and product-truth boundaries. Automatic
H1–H3 progression and manual Hero authority remain correct; keyboard controls,
reload reset, scroll-return persistence, reduced motion, no-JavaScript,
forced-colours, physical forward/reverse traversal, screen-reader output and
true 200% zoom are accepted.

Production `/` no longer requests or renders the superseded screenshot-led
homepage. Superseded implementations and assets remain preserved for later
archival. Metadata, canonical-origin gating, robots and sitemap behaviour are
accepted. No bounded correction is required before Phase 8C. Phase 8C is
authorised next but has not begun.
