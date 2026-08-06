# R5E.2B — Shared Public Shell

**Status: ACCEPTED AND COMPLETE**

**Branch:** `r5e2b-shared-public-shell`
**Date:** 6 August 2026

## 1. Purpose

Phase 8B implements the shared public shell defined by the accepted Phase 8A
contract: one public route group, header, footer, typed route registry, public
metadata foundation, robots policy, curated sitemap contract and one private
noindex shell laboratory. It does not transfer the accepted homepage
reconstruction onto production `/`; that remains Phase 8B.1.

## 2. Accepted inputs and verified Phase 8A history

The implementation follows the binding records in the accepted
`R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT_PACKAGE/`, the Phase 7.1F
freeze, the R5 README and the explicit accepted decisions in the Phase 8B task.

Repository-history reconciliation verified that Phase 8A commit `62275d5`
(`docs(public): accept cross-route design-system contract`) is an ancestor of
the current Phase 8B branch. The three accepted Phase 8A documents are present:

1. `R5E2A_CROSS_ROUTE_PUBLIC_DESIGN_SYSTEM_CONTRACT.md`;
2. `R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md`; and
3. `R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md`.

The former history discrepancy is resolved. Phase 8B continues to preserve the
accepted Phase 8A package without modification.

## 3. Route-group viability

Selected: `app/(public)/` with `app/(public)/layout.tsx` mounting the shared
shell.

Evidence:

1. Next 16 strips the route-group segment; the build resolves the laboratory
   at `/visual-lab/public-r5-shared-shell`.
2. The root layout remains the sole owner of `html` and `body`.
3. `ThemeProvider` is context-only. `GuidedTour` renders no overlay unless a
   product tour is explicitly active.
4. The shell owns an opaque white canvas and public type application.
5. Protected logged-in routes remain outside `(public)`.
6. `app/page.tsx` stays outside the group and unchanged in Phase 8B.

Rejected: a per-route wrapper. The route group passed the accepted gate, so a
fallback that made every future route mount its own shell was unnecessary.

Consequence: 8B.1 moves the accepted Home entry into `(public)` while
preserving `/`; 8D–8F add their routes there. No third architecture is needed.

## 4. Implementation architecture

`app/_public/` privately owns:

1. `routes.ts` — route activation, footer grouping, curated document contract
   and sitemap selection;
2. `metadata.ts` — identity, title template, metadataBase policy, canonical and
   robots helpers, and metadata builders;
3. `shell/PublicShell.tsx` — skip link, one `main#main`, header and footer;
4. `shell/PublicHeader.tsx` — the only Phase 8B client component;
5. `shell/PublicFooter.tsx` — grouped server-rendered footer; and
6. `shell/public-shell.module.css` — tokens, canvas, width, gutters, type,
   focus, responsive, reduced-motion and forced-colours rules.

The route-group layout mounts the shell once. The private laboratory is
route-local content and defines no second header, main or footer.

## 5. Shell ownership

The shell owns the white canvas, Geist Sans/Mono application, 1300px maximum
width, five-tier gutters and section padding, 62px sticky header, skip link,
brand, primary action, navigation model and active state, mobile disclosure
architecture, footer, route registry and metadata policy.

No product scene, Hero code, frozen Hero token, scene asset or canonical PR
value moved into the shell.

## 6. Navigation and future-route handling

The primary model is Home, Product, How it works and Trust. Resources and
Documentation are supporting destinations. The public action is
`Open the sample review` to `/workspace?source=fixture`; mobile shortens only
the visible label to `Open sample`.

Only Home is live. Draft destinations are read-only `Not available` text on
desktop and in the footer, never controls. They do not enter the mobile menu,
cannot navigate to a 404, are disallowed by robots and remain absent from the
sitemap. One registry state change later activates all consumers.

The private lab is not a primary public destination, so its real navigation
exposes no `aria-current` state. Future implemented public routes derive their
active state directly from the current pathname; active presentation remains a
combination of `aria-current`, weight and an invariant bottom border.

## 7. Mobile navigation

The disclosure is implemented but deliberately not rendered while fewer than
two genuine primary routes are live. When activated it uses a real 44px button,
`aria-expanded`, `aria-controls`, a second header grid row in normal flow,
focus transfer, Tab/Shift+Tab containment, Escape closure, focus restoration,
outside-pointer closure, route-change/resize closure and no scroll lock.

Without JavaScript the hydration-dependent button stays hidden and a plain
`<noscript>` navigation list renders. Runtime interaction evidence remains a
later gate because Phase 8B cannot invent a second route to expose it.

## 8. Footer

The shared footer stays on white and contains identity, one purpose line,
Product and Trust/resources headings, truthful unavailable states, copyright
and `Read-only sample available. No hosted service is claimed.` It contains no
dead link or pricing, sign-in, sales, legal-service, status-service,
hosted-account or adoption implication.

## 9. Metadata architecture

The foundation defines site identity, default title, `%s | Lintel` template,
default description, indexable/private robots helpers, public/private metadata
builders, canonical helper, accepted route registry and curated document list.

`metadataBase` requires an explicit real HTTPS `NEXT_PUBLIC_SITE_URL`.
Missing, malformed, insecure and localhost values are ignored. No accepted
origin exists, so Phase 8B emits no canonical or host assertion.

## 10. Robots and sitemap policy

`app/robots.ts` allows the existing site while disallowing `/visual-lab/`,
`/lvos/` and draft public paths from registry data. It makes no logged-in
noindex change.

`app/sitemap.ts` uses only live sitemap-eligible routes and explicitly
published curated documents. Without an origin it returns a valid empty URL
set. With a real origin it includes Home; drafts and uncurated documents stay
excluded.

## 11. No JavaScript

Production SSR inspection proves the private route contains the skip link,
`main#main`, specimen, footer, Home and sample links; it contains no mobile
button and no draft-route href. There is no fake static control or canonical
content gated by hydration. Final human review confirms that JavaScript-disabled
rendering remains complete and truthful.

## 12. Accessibility

Browser DOM inspection records one header, one primary navigation landmark,
one main, one H1, one footer, ordered H2s and zero duplicate IDs. At current
mobile widths the desktop navigation is visually hidden but remains the one
landmark until disclosure activation. Footer groups are headings and lists,
not a second nav.

Measured focus evidence records a visible 44px skip target and the accepted
blue solid focus outline on skip and Home. Active state uses `aria-current`,
font weight and a border, not colour alone. Final human review accepts skip
navigation, forward and reverse keyboard traversal, focus visibility,
screen-reader landmarks and headings, and truthful unavailable states.

## 13. Responsive results and below-360px decision

The shell was measured at the eleven required viewport targets from
1920×1080 through 320×568. The DPI-scaled in-app surface resolves four targets
within one or two CSS pixels; nominal and measured sizes are both retained.
Every state records no horizontal overflow, an in-viewport action/footer, a
stable 61.99px closed header, one H1, one main and no premature menu.

Genuine 320px evidence adopts the proposed compact values: computed
`--pub-gutter: 16px` and `--section-pad: 32px`, with no overflow or clipped
action.

## 14. 200% zoom

The accepted equivalent-reflow method was tested at a measured 640×900 CSS
viewport. It records no overflow, complete main content, in-viewport action and
full-width footer. Final human review confirms true 200% browser zoom reflows
without clipping or horizontal overflow.

## 15. Reduced motion and forced colours

Reduced-motion CSS removes meaningful transition/animation duration and smooth
scrolling within the shell; the document is already static and complete.
Forced-colours CSS maps canvas, borders, focus, selection and action to system
colours while retaining active-state geometry. Final human review accepts both
reduced-motion and forced-colours behaviour.

## 16. Performance and layout stability

Phase 8B adds no dependency, image, video, external request, animation library,
measurement script or model call. The only new client boundary is
`PublicHeader`, justified by sticky hairline state, active-route enhancement
and future disclosure interaction.

The final production build measured a 10,071-byte shell CSS chunk, a
12,442-byte uncompressed shell client chunk and a 3,704-byte private-lab CSS
chunk. Asset inventory observed zero images, zero video and zero external
URLs. The three font resources are existing
root-owned loads; the shell uses Geist and adds no font.

Header, H1, registry grid and footer rectangles show zero delta over a 700ms
settle sample. Scrolling changes only the already-reserved header border colour;
height stays 61.991 measured pixels. No console error, warning or hydration
warning was recorded.

## 17. Protected scope

Production `/`, `app/page.tsx`, frozen Hero, accepted reconstruction, prior
labs, logged-in routes, `lib/**`, `public/**`, dependencies, lockfiles, root
README, `docs/assets/**`, `.claude/launch.json`, accepted Phase 7/7.1/8A
documents and historical packages remain unchanged. The review package is
intentionally untracked.

## 18. Deferred gates and Phase 8B.1 handoff

Final human acceptance closes every Phase 8B human gate. A real production
origin, logged-in-route noindex safety, any separately authorised global 404,
and later measured performance budgets remain later tasks and do not reopen
this milestone.

The mobile disclosure remains intentionally dormant while only one genuine
primary destination exists. Runtime testing of its open state, focus transfer,
Tab and Shift+Tab containment, Escape and outside-pointer closure, focus
restoration, route-change/resize closure and no-JavaScript navigation becomes a
binding activation gate when a second genuine primary route is introduced.

Phase 8B.1 is authorised next. It may move the accepted reconstruction onto `/`
under `(public)` and must prove the frozen Hero, canonical values, interaction
and production baseline unchanged. Phase 8B.1 has not yet been implemented.

## 19. Final human acceptance

**Binding decision: Phase 8B is ACCEPTED AND COMPLETE.**

On 6 August 2026, the human owner confirmed:

1. the shared public shell is visually calm and coherent;
2. the accepted solid Lintel identity mark is used;
3. the desktop navigation hierarchy is accepted;
4. the private laboratory exposes no false `aria-current` state;
5. draft destinations are truthful nonlinks and are not keyboard-focusable;
6. the sample-review action is clear and opens the correct fixture Workspace;
7. header and footer alignment are accepted;
8. desktop, tablet, mobile and 320px behaviour are accepted;
9. below 360px, the 16px viewport gutter and 32px section padding are accepted;
10. skip navigation, keyboard traversal and reverse traversal work correctly;
11. focus visibility is accepted;
12. JavaScript-disabled rendering remains complete and truthful;
13. reduced-motion and forced-colours behaviour are accepted;
14. true 200% browser zoom reflows without clipping or horizontal overflow;
15. screen-reader landmarks, headings and unavailable states are truthful;
16. the metadata architecture and canonical-origin gating are accepted;
17. private visual-lab `noindex` behaviour is accepted;
18. sitemap exclusion of unfinished routes is accepted;
19. Phase 8A commit `62275d5` is verified as an ancestor;
20. no bounded correction is required before Phase 8B.1;
21. the dormant mobile disclosure remains intentional while only one genuine
    primary destination exists;
22. mobile-disclosure runtime testing becomes a binding activation gate when a
    second genuine primary route is introduced;
23. the accepted architecture, navigation, footer, truthful draft-route
    handling, metadata/indexing foundation and responsive values are frozen as
    the Phase 8B shell baseline;
24. Phase 8B.1 is authorised next and Phase 8C remains blocked until Phase
    8B.1 passes; and
25. Phase 8B.1 has not yet been implemented.

Protected scope remains binding: this acceptance closeout changes
documentation only. It does not modify the shell implementation, production
homepage, frozen Hero or reconstruction, routes, metadata behaviour,
responsive values, dependencies, assets or any other protected scope.
