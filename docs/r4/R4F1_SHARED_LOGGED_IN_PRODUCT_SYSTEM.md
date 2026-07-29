# R4F.1 — Shared Logged-in Product System

> **Milestone:** R4F.1
> **Status:** Implemented and accepted
> **Authority:** Accepted R4A–R4E contracts and canonical production `/workspace`
> **Boundary:** Shared route families and shell foundations only; route-content maturity remains deferred

## Outcome

R4F.1 gives every existing production logged-in route one explicit family without forcing the accepted verification workstation around unrelated work. `/workspace` remains specialist-owned. Five supporting workflows use the operational shell and three management surfaces use the quieter administrative shell. Public, compatibility, rollback and laboratory routes remain outside the new production shell.

The implementation preserves every public URL and every existing route data source. It adds no dependency, authentication claim, organisation authority, dark mode, theme toggle, or new product capability.

## Route-family matrix

| Route | Current purpose | Family | Shell owner | Primary task and visible identity | Return to Reviews | Authoritative review state | R4F.1 migration | Current limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/workspace` | Sustained verification and investigation | Verification Workspace | `WorkspaceR4Client` specialist shell | Inspect a selected review in **Workspace** | Already Reviews; supporting-route exits capture return context | Yes: validated browser-local report history, with explicit fixture mode | Shared identity metadata and session return integration only; no generic wrapper | Real history remains browser-local and bounded by accepted R4D/R4E contracts |
| `/new` | Prepare one review and generate a Case File | Operational | `SharedProductShell` | **New review** / review intake | Restores valid prior Workspace context, otherwise `/workspace` | No; creates through its existing review path | Shell migrated; content unchanged | Full intake-flow maturity is deferred |
| `/report` | Inspect one stored Case File | Operational | `SharedProductShell` | **Case File** / one review record | Restores valid prior Workspace context, otherwise `/workspace` | It renders authoritative stored report state but does not own Workspace navigation state | Shell migrated; loading/unavailable identity retained; content unchanged | Complete Case File redesign is deferred; absent local IDs remain explicitly unavailable |
| `/review-operations` | Filter and inspect browser-local review records | Operational | `SharedProductShell` | **Review Operations** / browser-local records | Restores valid prior Workspace context, otherwise `/workspace` | No; projects already stored records | Shell migrated; content unchanged | Not organisation analytics, monitoring, ranking or collaboration |
| `/github-action` | Explain and export the existing CI blueprint | Operational | `SharedProductShell` | **GitHub Action blueprint** | Restores valid prior Workspace context, otherwise `/workspace` | No | Shell migrated; content unchanged | Blueprint, not an installed or managed action |
| `/slack-handoff` | Produce the existing handoff export | Operational | `SharedProductShell` | **Slack handoff export** | Restores valid prior Workspace context, otherwise `/workspace` | No | Shell migrated; content unchanged | Export-only; no live Slack delivery or collaboration claim |
| `/team` | Manage browser-local workspace and responsibility metadata | Administrative | `SharedProductShell` administrative branch | **Team boundaries** / current browser | Explicit Back to Reviews; valid context is described and restored | No; ownership remains local responsibility metadata | Shell migrated; title clarified; existing archive action adopts the shared consequential dialog | No accounts, invitations, access control, presence, messaging or cloud sync |
| `/review-policies` | Inspect current review-policy/default boundaries | Administrative | `SharedProductShell` administrative branch | **Review policies** | Explicit Back to Reviews; valid context is described and restored | No | Shell migrated; content unchanged | No policy templates, impact preview or invented enforcement |
| `/settings` | Inspect analysis, provider and browser-local configuration truth | Administrative | `SharedProductShell` administrative branch | **System settings** / read-only prototype | Explicit Back to Reviews; valid context is described and restored | No | Shell migrated; content unchanged | Existing read-only/concept/prototype boundaries remain; no new configuration authority |

Preserved routes are deliberately not migrated: `/workspace-v2` remains the compatibility/QA route, `/workspace-legacy` retains the legacy rollback shell, and `/visual-lab/workspace-r4` remains the accepted R4C visual authority. `/visual-lab/landing-v3`, `/visual-lab/workspace-v2`, and `/lvos/typography-proof` remain contained proof/laboratory routes. `/` is the public landing page, not a logged-in route.

## Shell architecture

`app/app-shell.tsx` now owns two exercised shared production branches:

- `SharedProductShell` renders the operational shell for `/new`, `/report`, `/review-operations`, `/github-action` and `/slack-handoff`.
- The administrative branch of `SharedProductShell` renders `/team`, `/review-policies` and `/settings`.
- `LegacyAppShell` preserves the prior shell only for `/workspace-legacy`.
- `/workspace` does not render `AppShell`; its accepted `WorkspaceR4Client` continues to own the Rail, Queue, Workspace and Inspector directly.

`app/nav-config.tsx` is the route-family and identity registry. Each production supporting route supplies family, visible identity, description, scope and document title from one record. The operational Rail and administrative section navigation consume that metadata; no route group or URL move was needed.

Duplicate shell rendering is prevented at the route boundary: the specialist Workspace never enters `AppShell`, the compatibility and laboratory routes do not use it, and the legacy branch is selected only for the explicit rollback pathname. Migrated pages retain one `main` supplied by the shared shell and do not add a second shell.

## Workspace preservation

The accepted 52px Rail, Review Queue, five modes, dominant verification surface, contextual Inspector, investigation traversal, comparison, command palette, Focus mode and Human Decision flows remain locally owned by `WorkspaceR4Client`. R4F.1 does not change evidence, relationship, persistence, provenance, decision mutation or durable report contracts.

The only Workspace additions are navigation-context capture and validated restoration. Rail links call a bounded capture function before leaving; `pagehide` is a fallback. No continuous layout measurement, generic route header, extra padding or second navigation tree was added.

## Operational shell

The operational shell is `52px Rail → compact route header → route working surface`. It uses durable neutral-black chrome and the accepted light application system. The header exposes area, operational mode, truthful scope, route title, concise task description, optional route context and the existing route action area. It never introduces the Review Queue or Inspector merely for consistency.

At 520px and below the Rail becomes 48px and Back to Reviews becomes a compact icon control. Existing forms, tables, stored-record views and route actions keep their original ownership.

## Administrative shell

The administrative shell is `Back to Reviews → administrative section navigation → quiet content surface`. Wide layouts use a 224px light sidebar. Only actual destinations are present: Team boundaries, Review policies and System settings. The persistent scope note says the surface is browser-local and implies no organisation, account or shared-state authority.

Below 900px the sidebar becomes an explicit modal drawer. The background is inert, focus begins inside the drawer, Tab/Shift+Tab are contained, Escape closes, and focus returns to the menu trigger. The compact route header preserves route identity and Back to Reviews without introducing active-review controls.

## Back to Reviews and context restoration

Navigation context uses the versioned, tab-scoped session key `lintel.r4f.workspaceReturnContext.v1`. The record contains only:

- real-versus-fixture source;
- selected case identifier;
- Workspace mode;
- selected investigation kind and identifier;
- comparison-run identifier;
- Queue collapsed state and collapsed group identifiers;
- Inspector-open state;
- Focus-mode state;
- meaningful Workspace scroll position;
- capture timestamp.

It contains no report body, credential, secret, Human Decision draft or durable review authority. Supporting routes read it only to describe the return behaviour and construct `/workspace?restore=1` (plus explicit `source=fixture` where needed).

On return, Workspace validates the source, selected case, selected object, Queue group identifiers and comparison run against the current authoritative snapshot. A valid review restores mode and compatible navigation state. If the object no longer resolves, the review remains selected but object/Inspector authority is cleared and announced. If the review no longer resolves, the session record is cleared, Workspace uses its current truthful default and announces the invalidation. Focus mode restores only at a sensible viewport width; otherwise the ordinary surface is restored. Direct supporting-route entry without a record always links to plain `/workspace` and says that Reviews will open at the truthful default.

Browser Back retains normal history. The context capture is additive and does not replace or redirect history entries.

## Shared visual roles

The new logged-in shell scope uses the accepted roles: `#f6f6f5` application ground, `#ffffff` primary surface, `#fafaf9` secondary surface, `#eeeeec` ordinary selection, `#1c1c1c` primary text, `#6f6f6f` important secondary text, and `#eaeae8`/`#dededc` borders. Durable chrome is neutral black/charcoal.

Blue remains focus/direct interaction; green is reserved for real success/ready/cleared states; amber for tests/proof required; orange for review attention; red for blocking/failure/invalid; violet for meaningful model provenance. The selected navigation edge is neutral, never generic green. The legacy rollback shell receives a private dark variable scope so the new light tokens do not rewrite it.

## Shared product primitives

Only exercised primitives were added or consolidated:

- shared Lintel identity, compact operational Rail and route header;
- Back/Open Reviews control with return-context explanation;
- administrative section navigation and responsive drawer;
- route identity records and selected-route state;
- route action area using existing command-action behaviour;
- shared consequential-dialog anatomy.

`ConsequentialDialog` provides title, affected scope, current state, proposed state, consequence, unresolved conditions, cancellation, confirmation, error/conflict presentation, focus containment and focus restoration. It is applied only to the existing Team workspace-archive action; no new destructive action is exposed. Cancellation receives initial focus. Failed archive attempts keep the dialog open and expose the returned error.

Existing technical rows, tables, status labels, loading, empty and unavailable surfaces remain route-owned because replacing them would begin content redesign.

## Route identity and transitions

Every migrated route has an explicit operational or administrative label, visible route title, selected navigation state, one main landmark, logical domain heading and stable `… — Lintel` document title. A narrowly scoped head observer protects the route title from late Next metadata streaming without adding a provider.

After navigation the route `h1` receives programmatic focus with a visible blue outline. A main-region observer covers asynchronous loading-to-ready or loading-to-unavailable heading replacement without stealing focus after ordinary updates. Shell widths do not animate, and there is no page-transition library or decorative route transition.

`app/layout.tsx` applies the light logged-in theme during first-paint bootstrap for canonical Workspace and the eight migrated supporting routes. `/workspace-legacy` retains a dark first paint. Public preference behaviour remains separate.

## Responsive and accessibility behaviour

The validated shell breakpoints preserve task responsibility rather than compressing desktop UI:

- 1600 and 1280: operational 52px Rail; administrative 224px sidebar.
- 1024: stable operational Rail and full administrative navigation.
- 768: operational Rail remains; administrative navigation is a contained drawer.
- 390: 48px operational Rail, compact route action, administrative drawer and sequential content.

Each tested state retained one main landmark and no document-level horizontal overflow. Both shells include skip links, accessible icon labels, current-route semantics, visible focus, focus distinct from selection, keyboard-reachable Back to Reviews, Escape handling and focus restoration. Global accepted CSS already reduces transition/animation duration and disables smooth scrolling under `prefers-reduced-motion: reduce`; R4F.1 adds no page animation.

## Performance and CSS boundaries

The implementation adds no package, route-wide measurement loop or large provider. Drawer and return-context state live only in the shell/Workspace clients that exercise them. Route pages retain their existing server/client ownership. The first-paint bootstrap is a small pathname classification in the existing layout script.

New visual overrides are scoped under `.r4-product-shell`/`.app-shell`, while the old dark rollback variables are scoped under `.legacy-app-shell`. Public landing content and laboratory CSS are untouched. Workspace layout calculations and module CSS are unchanged.

## Routes migrated and content deferred

Shell migrated with internal content unchanged: `/new`, `/report`, `/review-operations`, `/github-action`, `/slack-handoff`, `/review-policies`, `/settings`.

Shell migrated with the smallest compatibility adjustment: `/team` receives the more precise shell title **Team boundaries**, and its pre-existing archive operation uses the shared consequential dialog. Its storage and archive service remain unchanged.

Specialist participation only: `/workspace` adds capture/restore navigation context but remains outside the shared shell. No accepted domain interaction was redesigned.

Intentionally deferred:

- the complete New Review flow;
- complete Case File hierarchy/content maturity;
- Review Operations record maturity;
- integration route maturity or a new `/integrations` destination;
- Slack delivery capability;
- policy templates and policy impact preview;
- complete Settings/provider configuration;
- organisation, authentication, collaboration, pricing and plan semantics.

## Validation evidence

`R4F1_HUMAN_REVIEW_PACKAGE/` contains the required 16 PNGs plus the screenshot manifest, validation notes and a dedicated context-restoration record. Browser validation covered the canonical Workspace, all eight migrated routes, public landing, compatibility, rollback and R4C authority routes. It also covered one-main, selected navigation, document title, route focus, Back to Reviews, Browser Back, drawer modality/Escape/restoration, loading/unavailable identity, responsive overflow and console health.

The browser harness does not expose an actual page-zoom factor or reduced-motion emulation. Capture 15 uses the accepted responsive proxy of an 800×500 CSS viewport for a 1600×1000 reference; the administrative shell was also verified at the narrower 768px width. Actual 200% browser zoom on both representative families and an emulated reduced-motion session remain explicit human-review steps, not claimed automation evidence. The final drawer focusable-selector correction passed TypeScript and production build after the browser session had been finalized; one current-code Tab-cycle confirmation is therefore also left to human review.

## Inspection expansion record

The required input set and starting files were read. Inspection expanded only where needed:

- actual route entry files: classify real routes and remove duplicate shell assumptions safely;
- `app/administrative-document.module.css`: confirm the existing shared content boundary used by seven supporting routes;
- `app/workspace/RealWorkspaceR4Bootstrap.tsx`: pass restoration intent through the existing real-data boundary without changing adapters;
- `app/workspace-legacy/layout.tsx`: preserve the rollback shell/theme contract;
- `app/team/page.tsx`: integrate the only existing consequential administrative action;
- `lib/workspace-v2/view-model.ts`: verify Queue-group identifier identity for runtime restoration validation;
- `package.json`: use only supported validation commands and confirm no test script/dependency change.

No broad component, API or library audit was performed.

## R4F.2–R4F.5 handoff

- **R4F.2 — New Review and Case File:** mature the complete New Review intake and durable Case File. Add a compact read-only Review Map derived only from canonical relationships; do not introduce a free-form graph canvas. The StackAI-derived fixed relationship orientation belongs to the R4F.2 Case File.
- **R4F.3 — Operational Home and Review Operations:** provide operational orientation, real saved work views, bounded recent review context and dense cross-review engineering records without duplicating the Workspace Queue. The Tembo-derived operational navigation principles belong to R4F.3.
- **R4F.4 — Integrations, System and Settings:** mature GitHub App, GitHub Action Blueprint, Slack Export-only, provider capability truth, quiet System/settings, truthful usage only where instrumented, and explicit configuration scope.
- **R4F.5 — Governance, Policies and Team Boundaries:** mature policy browsing, impact preview, provenance and applicability, consequential policy changes, and truthful team/collaboration boundaries.

R4F.1 did not implement any of those route-content features. Later passes must not rewrap `/workspace`, convert navigation context into review authority, add unsupported organisation/collaboration claims, or reinterpret semantic colours. R4G retains adversarial product-freeze ownership.
