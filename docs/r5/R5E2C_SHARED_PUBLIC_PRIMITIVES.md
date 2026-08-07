# R5E.2C — Shared Public Primitives

**Status: ACCEPTED AND COMPLETE**  
**Date: 7 August 2026**  
**Branch: `r5e2c-shared-public-primitives`**

## 1. Purpose

Phase 8C implements the bounded shared presentation responsibilities required
by the accepted cross-route public-system contract and by at least two genuine
future public routes. It does not build Product, How it works, Trust,
Resources or Documentation, and it does not redesign or refactor production
Home.

## 2. Accepted inputs

Implementation follows the relevant sections of:

1. `R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT.md`;
2. `R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`;
3. `R5E2B_SHARED_PUBLIC_SHELL.md`;
4. `R5E2B1_PRODUCTION_HOMEPAGE_TRANSFER.md`;
5. `R5E1E5F_FINAL_SURFACE_PUBLIC_VISUAL_FREEZE.md`;
6. this directory's README; and
7. the accepted Phase 8B.1 package's `PHASE_8C_HANDOFF.md`.

Preflight verified `59643cd` (`merge: transfer accepted homepage to
production`) at HEAD and `ae4d5e9` as its ancestor. The tracked implementation
was clean, nothing was staged, Phase 8B.1 was present in history, production
`/` was owned by `app/(public)/page.tsx`, and Phase 8D had not begun.

## 3. Primitive ownership

`app/_public/primitives/` owns only cross-route editorial composition,
typographic roles, action hierarchy, metadata relationships, semantic status
presentation, neutral/product framing, technical excerpts, structured records,
relationship groupings and the associated responsive/accessibility rules.

`app/_public/shell/` continues to own the white canvas, Geist Sans and Geist
Mono application, 1300px maximum width, five-tier gutters, section-padding
token, neutral public tokens, focus token, header/footer, skip link, route
registry, metadata policy, reduced-motion base and forced-colour base mapping.
The primitive layer consumes those responsibilities and does not redeclare
them.

## 4. Implemented primitives

| Responsibility | Primitive |
| --- | --- |
| Page and section layout | `PageWrap`, `EditorialSection`, `ResponsiveGroup`, `ProseColumn` |
| Route and section hierarchy | `RouteIntroduction`, `SectionHeading` |
| Supporting and body copy | `Copy` |
| Actions | `ActionGroup`, `Action` with primary, secondary and quiet variants |
| Labels | `Eyebrow`, `TechnicalLabel` |
| Metadata | `MetadataGrid`, `MetadataItem`, `Identifier` |
| Status | `SemanticStatus` with six accepted semantic meanings |
| Presentation surfaces | `NeutralPlate`, `ProductFrame` |
| Technical content | `TechnicalExcerpt`, `StructuredRecord` |
| Relationships and rules | `RelationshipGroup`, `Divider` |
| Accessible explanation | `VisuallyHidden` |

The accepted contract establishes genuine future use across Product and How it
works for every promoted responsibility. Trust and Documentation add further
consumers for metadata, framing and technical excerpts. No future-route
composition or content is included here.

## 5. Deliberately rejected abstractions

Phase 8C does not introduce:

1. a generic card, dashboard, chart, graph, diagram or marketing-panel system;
2. a generic scene orchestrator or client-side scene controller;
3. route-specific Product, How it works, Trust, Resources or Docs content;
4. shared evidence-sequence, missing-proof, readiness or Change Passport scene
   orchestration before the real route compositions exist;
5. animation or motion infrastructure;
6. copy controls, filters, search, tabs, fake disabled controls or placeholders;
7. customer, pricing, logo, testimonial, adoption or commercial-availability
   primitives; or
8. an image, illustration or decorative media abstraction.

Visual similarity alone was not treated as shared ownership.

## 6. Token reuse

The CSS module uses the shell-owned `--pub-*`, `--pub-max`, `--pub-gutter`,
`--section-pad`, `--font-geist` and `--font-geist-mono` values directly.
It does not duplicate shell token declarations. Product-frame CSS uses the
accepted `--prod-*` names with the frozen values as fallbacks because the
accepted shell does not currently expose product tokens. Semantic text uses
the six accepted product meanings and exact frozen values; no seventh meaning
or decorative semantic use was added.

## 7. Homepage protection

Production `/`, `app/(public)/page.tsx`, the accepted reference reconstruction,
its CSS, Hero, scene components, choreography, copy, facts, actions, metadata,
section order and frozen dimension matrix are unchanged.

No homepage extraction was justified: the new responsibilities can be proven
independently in the private laboratory, while the existing Home composition
contains route-specific choreography and accepted geometry. Leaving it intact
avoids creating a second ownership migration without a demonstrated duplicate.

## 8. Private laboratory

`/visual-lab/public-r5-shared-primitives` renders inside the real public shell
and demonstrates the real primitive exports. It identifies itself as a private
design-system laboratory and includes route introduction, heading hierarchy,
three action levels, canonical metadata, identifiers, semantic vocabulary,
neutral plate, opaque product frame, technical excerpt, evidence relationship,
structured manifest and responsive grouping.

It uses `buildPrivateLabMetadata`, so it emits `noindex, nofollow`. It is absent
from the navigation and route registry. The existing curated sitemap contains
only accepted live routes/documents, and the existing robots policy disallows
all `/visual-lab/` paths, so no sitemap or robots change was necessary.

## 9. Responsive behaviour

The primitive CSS preserves the accepted five families. The copy/technical
split uses 360px/remaining width at large desktop, 340px at intermediate
desktop, and collapses copy-first at 1024px and below. Metadata grids reduce
from four or three columns to two and then one without dropping values. Page
actions wrap with a 156px minimum and 44px target at mobile widths. Structured
records and relationship rows become labelled stacks at 767px and below.
Technical excerpts wrap, so they require no internal scrollbar. At below
360px the shell's 16px gutter and 32px section spacing remain authoritative.

## 10. Accessibility and resilience

The laboratory contains one H1 followed by ordered H2 and H3 content. Metadata
and structured records use real `dl` relationships. Product frames,
relationships, plates and excerpts have programmatic names. Statuses expose
visible text plus distinct markers and never depend on colour alone.
Identifiers remain selectable monospace text, with an accessible-name option
for a visibly shortened value. All actions are genuine server-rendered links.
There is no fake interactive control, disclosure, internal scene scroll or
client-only content.

Visible focus uses the shell's accepted ring. Mobile actions meet the 44px
target. The CSS contains a bounded forced-colours treatment, and the document
is static under reduced motion. Server rendering preserves the complete route
without JavaScript. The responsive single-column recomposition is designed for
320px and 200% zoom-equivalent reflow.

## 11. Performance

The implementation adds no dependency, lockfile change, image, font, external
request, animation library, layout-measurement script, model call or client
component. The primitive layer is server-rendered. Source introduced before
build evidence is 9,718 bytes of CSS, 7,432 bytes of primitive TSX and 8,457
bytes of private-lab TSX. Client JavaScript introduced by Phase 8C is zero by
design; final emitted asset evidence is recorded in the review package.

## 12. Protected scope

No future public route, logged-in route, `lib/workspace-v2`, `public/r5/scenes`,
`docs/assets`, root README, dependency, lockfile, launch configuration,
accepted milestone document or historical package was changed. The Phase 8C
review package remains intentionally untracked. Nothing is staged, committed,
pushed or merged.

## 13. Final human acceptance

The human owner records the binding decision **Phase 8C is ACCEPTED AND
COMPLETE** and confirms:

1. the shared primitives are visually restrained and consistent with the
   accepted public direction;
2. production `/` remains visually and interactively unchanged;
3. the primitive system is bounded and introduces no speculative future-route
   content;
4. route introductions and section headings are accepted;
5. primary, secondary and quiet action hierarchy is accepted;
6. metadata, identifier and structured-record presentation is accepted;
7. neutral plates and inset product frames are accepted;
8. technical excerpts and monospace values remain readable;
9. semantic statuses communicate meaning beyond colour;
10. desktop, tablet, mobile and 320px behaviour are accepted;
11. responsive layouts recompose rather than compress;
12. true 200% browser zoom produces no clipping or horizontal overflow;
13. keyboard traversal and visible focus are accepted;
14. draft navigation destinations remain nonfocusable;
15. JavaScript-disabled rendering remains complete and truthful;
16. forced-colours behaviour is accepted;
17. screen-reader heading, definition-list, status and link semantics are
    accepted;
18. the laboratory remains private, noindex and absent from navigation and
    sitemap;
19. no client JavaScript, image, dependency, external request or animation
    infrastructure was introduced;
20. no bounded correction is required;
21. Phase 8D is authorised next; and
22. Phase 8D has not begun.

All Phase 8C human gates are closed.

## 14. Phase 8D handoff

Phase 8D — Product and How it works — is authorised next and has not begun. It
may compose these accepted primitives with genuine route content and
route-local scene families. Phase 8D must not promote a route-local family
until a second genuine route demonstrates the same responsibility, must keep
the dormant mobile-navigation activation gate, and must preserve the frozen
Home without silent extraction or redesign.

## 15. Acceptance status

**ACCEPTED AND COMPLETE.** The bounded shared public primitives, private
laboratory, responsive behaviour, accessibility and special-state behaviour,
production-Home regression result, product-truth boundaries and performance
result are accepted. Phase 8D is authorised next but has not begun.
