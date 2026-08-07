# R5E.2F — Resources and curated public documentation

Status: **ACCEPTED AND COMPLETE**

Branch: `r5e2f-resources-curated-docs`
Base: `f669d1b`
Milestone: Phase 8F

## Outcome

`/resources` and `/docs/[slug]` are implemented as a curated public learning
and documentation layer, driven entirely by an explicit typed registry in
`app/_public/routes.ts`. `CURATED_PUBLIC_DOCUMENTS` — previously an empty list
with a binding comment that filesystem presence is not publication authority —
now carries three published documents: `run-lintel-locally`,
`data-boundaries` and `github-app-prototype`. Each passed the six-part
curation gate (`R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md` §5.1): content decision,
audience, owner, product-truth review, publication status and source.

The Phase 8E security-model debt is resolved: `public/docs/security-model.md`
is retired, its claims superseded by the authored `/docs/data-boundaries`, and
a permanent redirect from `/docs/security-model.md` keeps all seven existing
logged-in-route links resolving. `public/docs/evaluation-results.md` is
withdrawn as unreferenced internal content.
`public/docs/cli-github-action-blueprint.md` is retained for the one existing
`/github-action` link and explicitly disallowed in `robots.ts`.

Final human acceptance was recorded, and both routes are promoted:
`resources` and `documentation` moved from `state: "draft"` to
`state: "live"`, `sitemapEligible: true`, in `app/_public/routes.ts`.
`/resources` and all three documents now emit `index, follow` and join
sitemap output once a valid production HTTPS origin is configured.

Two binding human decisions govern this milestone beyond the approved plan:

1. **Footer deviation approved.** No `/docs` index route is built. The footer
   *Trust and resources* group is `Trust`, `Resources`. The `documentation`
   registry entry keeps ownership of the `/docs` namespace, document
   metadata/indexability and prefix behaviour, with no direct footer surface.
2. **Route-count terminology.** The result is described as **five public page
   routes, three curated public documents, and one live documentation
   namespace with no `/docs` index** — never as "six public page routes."

## Preflight

Branch `r5e2f-resources-curated-docs` at `f669d1b` (`merge: add trust route`).
Tracked tree clean; only historical untracked review packages present.
`CURATED_PUBLIC_DOCUMENTS` was an empty typed list. Eight `/docs/*.md` links
were present across seven logged-in routes
(`app/app-shell.tsx`, `app/github-action/page.tsx` ×2,
`app/settings/settings-client.tsx`, `app/slack-handoff/page.tsx` ×2,
`app/workspace-legacy/page.tsx`) before implementation, and remain byte-identical
and unedited after it.

## Exact files changed

Tracked new:

- `app/(public)/resources/page.tsx`
- `app/(public)/resources/resources-content.ts`
- `app/(public)/resources/resources.module.css`
- `app/(public)/docs/[slug]/page.tsx`
- `app/(public)/docs/[slug]/docs.module.css`
- `app/(public)/docs/documents/index.ts`
- `app/(public)/docs/documents/run-lintel-locally.tsx`
- `app/(public)/docs/documents/data-boundaries.tsx`
- `app/(public)/docs/documents/github-app-prototype.tsx`
- `docs/r5/R5E2F_RESOURCES_AND_CURATED_DOCUMENTATION.md`

Tracked modified:

- `app/_public/routes.ts` — extended `CuratedPublicDocument`; populated
  `CURATED_PUBLIC_DOCUMENTS` with three published entries; added
  `LEGACY_DOCUMENT_ALIASES`; fixed a latent sitemap gap in `sitemapPublicPaths`
  (documents were gated only on `publicationStatus`, not on the
  `documentation` route's own live state); changed the footer group to
  `["trust", "resources"]`; **acceptance promotion** — `resources` and
  `documentation` registry records moved `state: "draft"` → `"live"`,
  `sitemapEligible: false` → `true`; `sitemapPublicPaths()` further corrected
  to exclude the `documentation` id from its own generic per-route pathname
  list, so the now-live namespace record never emits a dead `/docs` sitemap
  entry (see Acceptance promotion below)
- `app/_public/metadata.ts` — added `buildPublicDocumentMetadata`
- `app/robots.ts` — added the literal `cli-github-action-blueprint.md` disallow
- `app/(public)/trust/trust-content.ts` — added `TRUST_HANDOFF.secondaryAction`
- `app/(public)/trust/page.tsx` — renders the quiet `/docs/data-boundaries` link

Tracked deleted:

- `public/docs/security-model.md`
- `public/docs/evaluation-results.md`

Untracked new: `R5E2F_HUMAN_REVIEW_PACKAGE/` (this milestone's evidence).

Protected and unchanged: `app/(public)/page.tsx`, `app/(public)/layout.tsx`,
`app/_public-r5-reference-reconstruction/**`, `app/(public)/product/**`,
`app/(public)/how-it-works/**`, `app/_public/primitives/**`,
`app/_public/shell/**` (component structure — only registry data changed),
`app/sitemap.ts`, `lib/**`, every logged-in route, `package.json`, lockfiles,
`.claude/launch.json`, root `README.md`, `docs/**` other than the two deleted
files, `public/docs/cli-github-action-blueprint.md`, `public/r5/**`.

## Curation decisions

Full candidate audit, decisions and per-document curation records are in
`R5E2F_HUMAN_REVIEW_PACKAGE/CURATION_RECORD.md`. Summary:

| Candidate | Decision |
| --- | --- |
| `public/docs/security-model.md` | Retired; superseded by authored `/docs/data-boundaries` |
| README local-setup material | Adapted into `/docs/run-lintel-locally` |
| `docs/github-app-local-setup.md` | Adapted (bounded) into `/docs/github-app-prototype` |
| `public/docs/evaluation-results.md` | Internal — withdrawn, unreferenced |
| `public/docs/cli-github-action-blueprint.md` | Deferred — retained static, robots-disallowed |
| Change Passport authoring format | Deferred — trigger: second genuine authoring question |
| `docs/r4/**`, `docs/r5/**`, every `*_PACKAGE/`/`*_EVIDENCE/` | Internal, permanently excluded |
| `docs/case-study.md`, `docs/evaluation.md`, `docs/manual-evaluation.md`, `docs/public-pilot.md`, `docs/distribution-assets.md`, `docs/demo-script.md`, `docs/screenshot-checklist.md` | Internal — not public audience |

## Resources route

`/resources` is a curated index: route introduction, a *Public routes* group
(Product, How it works, Trust — each description a strict subset of its
`PUBLIC_ROUTE_REGISTRY` entry), a *Documentation* group (the three published
documents, sourced directly from `CURATED_PUBLIC_DOCUMENTS` rather than
duplicated strings), and a closing handoff to the sample review. No kind
filter is built — see Open risks and decisions below.

## Curated documentation architecture

`/docs/[slug]` is data-driven only: `generateStaticParams` returns published
slugs plus legacy alias keys; `dynamicParams = false` makes any other slug a
genuine static 404. `DOCUMENT_BODIES` in `app/(public)/docs/documents/index.ts`
is a static `Record<slug, DocumentBodyModule>` binding each slug to a typed
TSX content module — no markdown parser, no MDX, no `fs`, `readdir`, `glob` or
dynamic import by path anywhere in the system. An in-page contents list renders
only where a document has four or more top-level sections (all three do); it
is persistent but not sticky, and collapses to a plain list above the content
at ≤1024px. Previous/next links are derived from registry `order` and carry
accessible names naming the destination document.

## Run Lintel locally

Sections: Requirements · Install and run · Open the fixed sample · Production
build · Optional model analysis · Optional public GitHub access · Optional
GitHub App prototype · What runs with no configuration at all. Sourced from
`README.md` and `.env.example`, re-verified against `package.json` (no test/lint
script; no declared Node version — stated as such, not invented).

## Data boundaries

Supersedes the retired security-model file. Sections: Where analysis runs ·
What is sent when model assistance is configured · What the browser stores ·
What the GitHub App prototype writes to disk · What is deliberately not
persisted · Bounds and limits · What this document does not claim. Every
numeric bound (200,000-character diff limit, 20 retained runs, 20
verifications per run, 10 browser history entries, 80 Human Decision Ledger
entries, Change Passport field limits) was re-read from `lib/**` at authoring
time, not copied from prose. Explicitly disclaims certification, hosted
infrastructure, encryption-at-rest, access-control, retention-policy, audit-log,
SLA/uptime and provider non-retention claims.

## GitHub App prototype

Sections: What the prototype is · Environment configuration · GitHub App
settings and permissions · What happens on a verified delivery ·
Deduplication · The pull-request comment · Enabling and disabling a repository
· Deterministic-only analysis · Limitations. Adapted from
`docs/github-app-local-setup.md`, re-verified against `lib/github-app-*.ts`:
RS256 JWT with nine-minute expiry, HMAC-SHA256 signature verification before
JSON parsing, delivery and head-SHA deduplication, the exact
`<!-- lintel:merge-readiness -->` comment marker, and deterministic-only
analysis on this path (no model call). Storage claims are not restated; the
document links to `/docs/data-boundaries` instead.

## Security-model retirement and alias

`public/docs/security-model.md` is deleted. `/docs/security-model.md` is a
statically generated alias that issues a `permanentRedirect()` to
`/docs/data-boundaries`. All seven logged-in-route links to
`/docs/security-model.md` continue to resolve, now to an accurate page. The
alias carries `noindex, nofollow` metadata and is absent from the sitemap.

## Retained/deleted public docs

Deleted: `public/docs/security-model.md`, `public/docs/evaluation-results.md`.
Retained: `public/docs/cli-github-action-blueprint.md`, still linked from
`/github-action`, now explicitly disallowed in `robots.ts` at
`/docs/cli-github-action-blueprint.md`.

## Trust/document authority consistency

Every fact in the required-agreement table (`R5E2F_HUMAN_REVIEW_PACKAGE/CLAIM_TRACE.md`,
Cross-document Trust agreement) was checked against its named `/trust` anchor.
No document restates run-provenance, Human-Decision-authority or limitations
detail Trust already owns; each links instead.

## Trust handoff

`TRUST_HANDOFF` gains one quiet secondary action, "Read data boundaries" →
`/docs/data-boundaries`, alongside the existing "Open the sample review"
primary action in the closing handoff section. This discharges the pointer
Phase 8E deliberately withheld while the security document was stale
(`R5E2E_TRUST.md` carried gate 1). No other Trust section, and no Product or
How it works route, was modified.

## Footer and documentation-namespace decision

Human-approved deviation from `R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`
§7's "footer promotion of Resources and Documentation" line: no `/docs` index
route exists, so promoting `documentation` to the footer would point at
nothing. `footerPublicRouteGroups`'s *Trust and resources* group is now
`["trust", "resources"]` only. The `documentation` registry entry is
unchanged in every other respect — it still owns `/docs` prefix matching
(`isPublicRouteActive`), draft-path robots derivation and document
indexability gating.

## Acceptance promotion

Following final human acceptance, `resources` and `documentation` in
`PUBLIC_ROUTE_REGISTRY` moved `state: "draft"` → `"live"`,
`sitemapEligible: false` → `true`.

Promoting `documentation` this way exposed a second, related conflict beyond
the one already fixed during implementation: `sitemapPublicPaths()`'s first
block builds the sitemap's route list generically from every
`state === "live" && sitemapEligible` registry record's own `pathname` — which
would have added `/docs` itself (the `documentation` record's `pathname`) as
a bare sitemap entry with no corresponding page, since there is deliberately
no `/docs` index route. This is exactly the dead-entry conflict the
acceptance instruction named in advance. The fix is narrow and consistent
with the existing pattern: `documentation` was already special-cased in
`isPublicRouteActive` and `draftPublicPaths()` as a namespace id rather than
an ordinary page, and `sitemapPublicPaths()`'s generic route filter now also
excludes `route.id === "documentation"` for the same reason. This does not
create a `/docs` page and does not change the accepted architecture — it
completes a special-casing pattern the file already established, and it was
required for the sitemap to satisfy the accepted invariant at all. The three
curated documents continue to enter the sitemap through the unchanged, already
document-specific branch beneath it.

Verified with a temporary `NEXT_PUBLIC_SITE_URL=https://phase8f-test.example`
build: the sitemap contains exactly `/`, `/product`, `/how-it-works`,
`/trust`, `/resources`, `/docs/run-lintel-locally`, `/docs/data-boundaries`,
`/docs/github-app-prototype` — eight entries, no dead `/docs` entry. The
environment variable was removed and the ordinary unconfigured build was
restored afterward. Full evidence in
`R5E2F_HUMAN_REVIEW_PACKAGE/VALIDATION.md`.

## Metadata/indexing

Post-promotion, `/resources` and all three documents emit
`index, follow`. `robots.ts` no longer disallows `/resources` or `/docs/`;
it retains only `/visual-lab/`, `/lvos/` and the literal
`/docs/cli-github-action-blueprint.md` disallow for the retained uncurated
file. Canonical URLs and sitemap membership remain origin-gated: both are
absent without a configured production HTTPS origin, and both are correct
and complete once one is configured, as verified above. Full validation is in
`R5E2F_HUMAN_REVIEW_PACKAGE/VALIDATION.md`.

## Negative publication checks

No `fs`, `readdir`, `glob`, `require.context` or dynamic path import exists
anywhere in the new code. `dynamicParams = false` on `/docs/[slug]` makes any
slug outside the registry and alias map a genuine static 404. No route,
component or import references `docs/r4/**`, `docs/r5/**`, any
`*_PACKAGE/` or `*_EVIDENCE/` directory. Full detail in
`R5E2F_HUMAN_REVIEW_PACKAGE/VALIDATION.md`.

## Responsive/accessibility review

Both routes recompose at the five accepted tiers; `/docs/[slug]`'s contents
track collapses to a plain list above the content at ≤1024px, single column at
≤767px. One `<h1>` per route; ordered H2/H3 descent; `<dl>` metadata; genuine
`<a>` navigation throughout; visible focus ring; zero horizontal overflow at
every tested width including 320px.

One genuine defect was found and corrected during implementation: the
`/docs/[slug]` contents-list links measured 26.2px tall at 390 CSS px,
under the required 44px mobile target — the ≤767px media query collapsed the
grid but did not set a minimum link height. Corrected in `docs.module.css`
(`.contents a` gains `min-height: 44px` and `display: flex` at ≤767px);
rebuilt and re-verified at zero undersized targets. Full capture matrix and
the before/after evidence are in `R5E2F_HUMAN_REVIEW_PACKAGE/VALIDATION.md`.

## No JavaScript/reduced motion/forced colours

Both routes are fully static server-rendered content with zero client
component and zero motion. No JavaScript changes nothing about either route's
completeness. Reduced motion and forced colours have no active animation to
suppress; forced-colours boundary rules resolve to `ButtonText`.

## Performance

Zero new dependency, zero lockfile change, zero image, zero external request,
zero animation library, zero markdown/MDX runtime. Both routes are
server-rendered with no route-only client script beyond the existing shared
shell scripts (same nine shared script files as Product/How it works/Trust).

| Route | HTML bytes |
| --- | ---: |
| Resources | 33,173 |
| Run Lintel locally | 45,268 |
| Data boundaries | 48,921 |
| GitHub App prototype | 49,123 |

Full measurement detail is in `R5E2F_HUMAN_REVIEW_PACKAGE/VALIDATION.md`.

## Claim trace

`R5E2F_HUMAN_REVIEW_PACKAGE/CLAIM_TRACE.md` maps every rendered factual
sentence across all three documents to its repository source, plus the
cross-document Trust-agreement table.

## Build/route/redirect/404 validation

Full results in `R5E2F_HUMAN_REVIEW_PACKAGE/VALIDATION.md`.

## Review package

`R5E2F_HUMAN_REVIEW_PACKAGE/` contains `README.md`, `CURATION_RECORD.md`,
`CLAIM_TRACE.md`, `VALIDATION.md`, `HUMAN_REVIEW.md` (completed) and
`HUMAN_ACCEPTANCE.md` (final acceptance record, transcribed exactly as
issued).

## Phase 8F → Phase 8G handoff description

The public system is **five public page routes** (`/`, `/product`,
`/how-it-works`, `/trust`, `/resources`), **three curated public documents**
(`/docs/run-lintel-locally`, `/docs/data-boundaries`,
`/docs/github-app-prototype`), and **one live documentation namespace with no
`/docs` index route**. This is the accepted, binding description for Phase 8G
and any later handoff language; "six public page routes" is not an accurate
description of the result and must not be used.

## Open gates carried forward

1. Contract deviation (D3): no kind filter on `/resources`; grouped headings
   instead. Trigger for building the filter: 8 or more curated documents
   across 3 or more genuine kinds.
2. Footer/documentation-namespace deviation: recorded above, requires human
   sign-off at this gate.
3. `public/docs/cli-github-action-blueprint.md` remains a static, uncurated
   file protected only by a robots disallow.
4. Root README Agent Change Passport omission: unresolved, deferred to a later
   recruiter/repository-doc gate (not touched by Phase 8F).
5. Logged-in-route `noindex`: unresolved pre-deployment safety task.
6. Production origin/canonical configuration: unresolved.
7. Missing `/favicon.ico`: unresolved public-identity polish item.

Phase 8F is **ACCEPTED AND COMPLETE**. Final human acceptance closed the
curation, product-truth, composition, responsive, accessibility, keyboard
and special-state gates. `resources` and `documentation` are promoted to
`live`. **Phase 8G is authorised next but has not begun.** No stage, commit,
push or merge action occurred during implementation or this acceptance
closeout.
