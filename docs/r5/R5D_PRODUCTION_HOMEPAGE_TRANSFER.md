# R5D — Production Homepage Transfer

Branch: `r5d-production-homepage-transfer`
Route ownership: `/` (production, indexable), `/visual-lab/public-r5` (private, noindex)
Status: implemented.

This document records what R5D did: transferring the accepted R5C private
public visual laboratory onto the production homepage without redesign, the
shared implementation architecture used to do that without duplication, and
what remains for R5E. It does not reopen or restate the R5A direction, the
R5B architecture, or the R5B.1 addendum; those documents remain authoritative
and were not edited. Where this document restates an R5C decision, R5C
(`R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md`) remains the source of record.

---

## 1. Purpose

R5C proved the accepted public homepage direction as working code at a
private, unlinked, noindexed route. R5D is a transfer milestone: it moves
that accepted implementation onto the production homepage (`app/page.tsx`)
without changing its composition, copy, scenes, motion boundary or
responsive behaviour. No redesign, no narrative rewrite, no new section, no
new dependency.

## 2. Root route ownership

`app/page.tsx` is now a thin route wrapper. It imports and renders the
shared `PublicR5Page` component and supplies only route-level concerns:
production (indexable) metadata. It contains no page composition, content,
styling or product-scene logic of its own.

The prior R3E.1 homepage implementation (`./landing/*`,
`./landing-motion.tsx`, `./landing-nav.tsx`, and the five-act composition
that used to live directly in `app/page.tsx`) is superseded. Its files were
left in place; they are simply no longer imported by any route. Deleting
them is unused-legacy cleanup and is explicitly out of this milestone's
scope (see §15). Git history is the record of the prior implementation.

## 3. Private laboratory ownership

`app/visual-lab/public-r5/page.tsx` is also now a thin route wrapper around
the same shared `PublicR5Page` component. It supplies only its own
route-level concern: private (noindex, nofollow) metadata. It follows the
existing precedent set by `app/visual-lab/landing-v3` and
`app/visual-lab/workspace-r4` — unregistered in `app/nav-config.tsx`, not
imported by any production route, not added to a sitemap.

## 4. Shared implementation architecture

A private, non-route folder was created at `app/_public-r5/`. Because its
name begins with an underscore, Next.js's App Router excludes it from route
resolution entirely — it cannot become a URL by accident. This is the single
source of truth for:

```
app/_public-r5/PublicR5Page.tsx          — page composition (new in R5D)
app/_public-r5/sections.tsx              — the eight section components (moved from R5C, unchanged)
app/_public-r5/content.ts                — content and canonical-facts source (moved from R5C, unchanged)
app/_public-r5/public-r5.module.css      — CSS module (moved from R5C, unchanged)
app/_public-r5/components/CropFrame.tsx        (moved from R5C, unchanged)
app/_public-r5/components/PublicR5Header.tsx   (moved from R5C, one line changed — see §4a)
app/_public-r5/components/PublicR5Footer.tsx   (moved from R5C, unchanged)
```

`content.ts`, `sections.tsx`, `public-r5.module.css`, `CropFrame.tsx` and
`PublicR5Footer.tsx` were moved byte-for-byte; their internal relative
imports (`./content`, `./components/CropFrame`, `../public-r5.module.css`,
etc.) were already correct at the new location and needed no edit.

`PublicR5Page.tsx` is new in R5D. It holds exactly the JSX tree that used to
live directly in R5C's `app/visual-lab/public-r5/page.tsx` — the `.page`
wrapper, the skip link, `PublicR5Header`, the eight sections inside `<main
id="main">`, and `PublicR5Footer` — with no metadata export, so it carries
no route identity of its own. Both route files now do nothing but import
this component and attach their own `metadata`.

**a. One intentional change during the move.** `PublicR5Header.tsx`'s brand
link previously pointed to `/visual-lab/public-r5` (correct when the header
only ever rendered inside that one private route). Now that the same header
renders on both `/` and `/visual-lab/public-r5`, the brand link points to
`/` on both routes — the ordinary meaning of a site identity mark linking
home. This is the only behavioural difference introduced by the shared
architecture itself; it does not touch layout, copy, scenes, or any of the
three required navigation anchors, and it does not add a new route or
control (see §6).

No other file under `app/_public-r5` differs from its R5C original.

## 5. Production metadata

`app/page.tsx` exports:

- Title: `Lintel | Engineering verification for pull requests`
- Description: `Lintel connects changes, findings, evidence, missing proof
  and requirements so engineers can understand readiness and record an
  accountable Human Decision.`
- `robots: { index: true, follow: true }`
- Open Graph: title, description, `siteName: "Lintel"`, `type: "website"`
- Twitter: `card: "summary"`, title, description

No Open Graph image is declared, because none exists in the accepted asset
set (`public/r5/scenes` holds product-scene sources only, not a dedicated
social card). Inventing one was out of scope per the milestone brief.

**Canonical URL: deferred, not fabricated.** The repository has no
`next.config.*` canonical/production-origin setting, no `metadataBase`
export anywhere in `app/`, and no production-origin environment variable
(`.env.example` lists only `OPENAI_API_KEY`, `OPENAI_MODEL`, `GITHUB_TOKEN`,
`GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`). Per the
milestone brief's explicit instruction not to invent a production domain,
`app/page.tsx` carries a code comment recording this and no
`alternates.canonical` value is set. This should be added once a real
production origin is configured.

The private laboratory route's metadata is unchanged from R5C: title
`Public R5 visual lab — Lintel`, description unchanged, `robots: { index:
false, follow: false, googleBot: { index: false, follow: false } }`. No
Open Graph promotion, no canonical authority over `/`.

## 6. Indexing behaviour

- `/` — indexable (`index: true, follow: true`), confirmed by reading the
  rendered `<meta name="robots">` tag from the production build (§16).
- `/visual-lab/public-r5` — noindex, nofollow, confirmed the same way.
- `/visual-lab/public-r5` is not in `app/nav-config.tsx`, not linked from
  any production navigation, and not in any sitemap.
- No sitemap or `robots.txt` route exists anywhere in this repository
  (`find app -iname "*sitemap*" -o -iname "*robots*"` returns nothing) and
  R5D did not create one: the brief permits a new sitewide robots/sitemap
  policy only if necessary for the root transfer, and per-route `metadata.robots`
  already fully satisfies this milestone's indexing requirements without
  inventing a production origin a sitemap would need.
- `/workspace?source=fixture` and `/new` are unchanged, real destinations;
  confirmed reachable and unmodified in this pass (§16).
- No route in this transfer claims authentication or hosted collaboration,
  and no external write is introduced or exercised — the transfer only
  reads and renders the existing accepted static content and scene assets.

## 7. Public actions and navigation

Unchanged from R5C, now present on both routes because both render the same
header/footer components:

- Header nav: `Product` → `#investigation-workspace`, `How it works` →
  `#verification-model`, `Security` → `#trust-architecture`.
- Primary action: `Open the sample review` → `/workspace?source=fixture`.
- Secondary action: `Start a review` → `/new`.
- Below the mobile breakpoint (max-width 767px): the three anchor labels are
  hidden (`display: none` on `.nav`), identity and the compact primary
  action remain, no menu drawer is introduced. Verified unchanged at 390×844
  and 320×568 (§16).

No Docs, Changelog, Pricing, Sign in, Contact sales, mobile drawer, disabled
placeholder, or fake destination was added.

## 8. Visual parity

Because `/` and `/visual-lab/public-r5` render the identical
`PublicR5Page` component tree with identical CSS, DOM/CSSOM introspection
of the built production pages shows byte-identical results between the two
routes at every measurement taken: `<main>` bounding rectangle
(1585×8249 at 1600px viewport), `<h1>` bounding rectangle (630×116, text
"Know what is ready to merge."), section id sequence (`hero`, unlabelled,
`verification-model`, `investigation-workspace`, unlabelled, unlabelled,
`trust-architecture`, unlabelled — 8 sections), the two charcoal section ids
and their computed background colour (`rgb(24, 24, 21)` on both), and the
full list of 14 `<img>` `src` values in DOM order. The two routes differ
only in `<title>`, the `<meta name="robots">` value, and the presence/absence
of Open Graph/Twitter tags — exactly the metadata differences this milestone
specifies. See `R5D_HUMAN_REVIEW_PACKAGE/ROUTE_PARITY_MATRIX.md` for the raw
values.

## 9. Product scene integrity

No scene asset under `public/r5/scenes` was read, written, renamed or
otherwise touched by this milestone. `sections.tsx` and `content.ts` moved
without edits; every `src` string, crop rectangle and alt-text string is
identical to its R5C original. Confirmed by diffing the moved files against
their pre-move content and by the zero-broken-image check in §16.

## 10. Responsive behaviour

All six required viewports (1600×1000, 1280×800, 1024×768, 768×1024,
390×844, 320×568) were checked against `document.documentElement.scrollWidth
<= clientWidth` on the production build for `/`, with the two extremes
(1600×1000 and 320×568) cross-checked on `/visual-lab/public-r5`: no
document-level horizontal overflow at any width on either route. The mobile
navigation breakpoint (`.nav` hidden below 767px) and the R5C two-column
architecture breakpoint (1100px, unchanged, inherited from
`public-r5.module.css`) were not modified by this milestone; no transfer
regression was found, so no responsive change was made, per the brief's
instruction not to redesign mobile during this transfer.

## 11. Accessibility

Unchanged from R5C, because the DOM, CSS and semantics are identical: one
`<main>` landmark, one `<h1>`, the skip-to-content link (first Tab stop,
confirmed with a visible focus outline via `outline-style: solid`), native
anchor navigation for the three header links, and the same alt-text,
contrast tokens and focus-visible styling R5C validated. No new
accessibility abstraction was added.

## 12. Static interaction boundary

R5D does not implement the R5E interaction system. The three inert
`data-motion-slot` attributes (`queue-entry`, `evidence-to-requirement`,
`decision-surface-open`) moved unchanged inside `sections.tsx`. No observer,
scroll listener, staged transition, autoplay, scene tab, modal simulation,
client-side storytelling state, parallax, cursor effect or entrance
animation system was added. The page remains fully server-rendered with no
client component and no JavaScript required to read it, on both routes.

## 13. Legacy homepage treatment

The prior R3E.1 homepage's supporting files (`app/landing/*`,
`app/landing-motion.tsx`, `app/landing-nav.tsx`, and the fixtures they
consumed from `lib/landing-theatre-fixtures`) were not deleted. They are
simply unreferenced by any route now that `app/page.tsx` renders
`PublicR5Page` instead. No legacy route was created to keep the old
homepage reachable; git history is the preservation record, per the
milestone brief. Broader cleanup of these now-unused files is deferred to a
later bounded cleanup pass, not this milestone.

## 14. Build and browser validation

- `npx tsc --noEmit` — passes, no errors.
- `npm run build` — passes. Route table confirms `○ /` and
  `○ /visual-lab/public-r5` both build as static pages.
- Production server (`npm run start`) validated in the Browser pane:
  - `/`: title, description, `robots: index, follow`, Open Graph
    title/description/type, Twitter `summary` card all present and correct;
    1 `<main>`, 1 `<h1>` (`Know what is ready to merge.`), 7 `<h2>`, 8
    sections, exactly 2 charcoal sections (`verification-model`,
    `trust-architecture`); all 3 header anchors present with correct
    `href`s; `Open the sample review` → `/workspace?source=fixture`;
    `Start a review` → `/new`; all 14 images resolved through the Next.js
    image optimizer with zero failed fetches; no horizontal overflow at any
    of the six required viewports; skip-link is the first keyboard focus
    stop with a visible outline; no console errors.
  - `/visual-lab/public-r5`: `robots: noindex, nofollow` present; identical
    structural counts and identical image source list to `/` (§8); no
    horizontal overflow at 1600×1000 and 320×568.
  - Regression check, all unmodified: `/workspace?source=fixture` (loads,
    no console errors), `/new` (loads, no console errors),
    `/visual-lab/workspace-r4?source=fixture` (loads, no console errors).
- **Screenshot compositing was unavailable in this session**, the same
  limitation R5C's §12 recorded: `computer` screenshot calls returned "the
  Browser pane is not displayed, so the page is not compositing frames" on
  every attempt, including after an explicit wait and retry. No genuine PNG
  screenshots could be produced. `R5D_HUMAN_REVIEW_PACKAGE/VALIDATION_NOTES.md`
  and `SCREENSHOT_MANIFEST.md` document this explicitly rather than
  fabricating captures; all layout, structure, metadata and parity claims
  above were instead verified through DOM/CSSOM introspection
  (`getBoundingClientRect`, `getComputedStyle`, `document.title`,
  `querySelector` on meta tags) and `fetch()`-based image checks, cross-checked
  between routes.

## 15. Protected R4 scope

`git diff` against every protected path (`app/workspace`, `app/report`,
`app/new`, `app/home`, `app/review-operations`, `app/integrations`,
`app/settings`, `app/review-policies`, `app/team`,
`app/visual-lab/workspace-r4`) returns empty. No dependency was added; `git
diff` against `package.json`, `package-lock.json`, `pnpm-lock.yaml` and
`yarn.lock` returns empty. No product scene byte was touched (§9). Neither
`R5A_VISUAL_CONTEXT_PACKAGE/` nor `R5C_HUMAN_REVIEW_PACKAGE/` was modified;
both remain untracked and untouched.

## 16. Work deferred to R5E

R5E remains: implement the three accepted product-scene transitions and
restrained motion system named in R5B §11 and marked by the
`data-motion-slot` attributes carried through this transfer unchanged —
`queue-entry`, `evidence-to-requirement`, `decision-surface-open`. This is
motion and interaction work attached to an already-transferred, already-live
page; it is not a redesign and not a second visual pass.

Also unresolved, carried forward from R5C's own deferred-work list and
unaffected by this transfer: a dedicated mobile capture for Scene F (Human
Decision), and formal pixel-accepted crop boundaries for Scenes B, E, F and
H (see `R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md` §10, §12).

## 17. Known limitations

- Screenshot compositing was unavailable in this Browser pane session (§14).
  All visual/structural claims rest on DOM/CSSOM introspection and
  `fetch()`/image-load checks, not on pixel comparison of captured images.
- No production origin is configured, so the root route's canonical URL is
  left unset rather than invented (§5). Open Graph/Twitter social preview
  cannot be end-to-end verified against a real crawler without one.
- The single intentional behavioural change from the R5C original — the
  header brand link now pointing to `/` instead of
  `/visual-lab/public-r5` — is recorded in §4a and has not been through a
  separate human-acceptance pass, since it is a direct consequence of
  making the header link home rather than to itself once it is shared
  across two routes.
- Legacy R3E.1 homepage files remain in the tree, unreferenced, per the
  milestone's explicit prohibition on broad legacy deletion (§13).

## Post implementation human visual acceptance

Eight genuine screenshots were captured manually after implementation. They cover the production hero, laboratory parity, Investigation Workspace, architecture overview, architecture handoff, final action, footer, and complete 320px and 390px mobile pages.

The captures confirm that the accepted R5C composition transferred to `/` without redesign. Production and laboratory hero states match visually. No clipping, missing scene, broken action label, or unexpected route divergence was observed in the captured states.

The evidence is stored in `R5D_HUMAN_REVIEW_PACKAGE/screenshots/` and indexed by `R5D_HUMAN_REVIEW_PACKAGE/SCREENSHOT_MANIFEST.md`.
