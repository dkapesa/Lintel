# LVOS v1.0 current-state audit

**Audit baseline:** LVOS v1.0  
**Repository evidence reviewed:** 15 July 2026  
**Method:** source-led audit of all requested routes and shared visual systems. A representative browser pass was attempted, but the local Next development server could not spawn in the available sandbox; no visual conclusion depends on that unavailable preview.

## 1. Executive summary

The current product is materially aligned with LVOS in semantics and strongest flagship surfaces, but not yet in system-wide composition. E7 established a credible semantic theme, shared shell, Risk Inbox workbench and Case File; W2 established a truthful public narrative. Those are foundations to consolidate, not redesign.

The strongest surfaces are `/report`, `/workspace` and `/`: they expose the verification trace, evidence, requirements, readiness and final human authority using real shared report data. The weakest surfaces are `/review-operations`, `/team`, `/settings`, `/review-policies`, `/github-action` and `/slack-handoff`, where older dashboard, hero-card, preview-card and route-specific grammars remain visible.

The five largest gaps are:

1. The shell is a single 236px/64px collapsible sidebar, not the definitive 56px global rail plus approximately 220px contextual navigation.
2. The application type system still permits 28px page titles and contains route CSS at weights 700–800 plus a 9px control label.
3. `globals.css` contains overlapping E6/V2/V3/V4/V5/E7 generations and compatibility selectors, so later overrides rather than one grammar determine many surfaces.
4. Administrative and operations routes still mix dashboard metrics, hero panels, cards and preview theatre instead of approved record/document compositions.
5. Responsive behaviour is capable but inconsistent: the shell skips the 900–1179px contextual drawer state, the mobile bar drops to 48px, and each route owns different pane/sheet breakpoints.

Preserve the E7 semantic token and theme architecture, E7.2 queue mechanics and accessible inspector, E7.3 Case File structure and human-decision rail, W2 Case File narrative, shared mock-report terminology, and all deterministic/human-authority product semantics.

### Severity summary

| Severity | Count |
| --- | ---: |
| P0: blocks the identity or future safe implementation | 3 |
| P1: major inconsistency requiring the consolidation programme | 9 |
| P2: meaningful refinement | 7 |
| P3: later polish | 1 |
| **Total** | **20** |

## 2. Global-system audit

Each finding has one owner milestone. Route references later in this document point back to these findings rather than creating duplicate ownership.

| ID | Area | Current evidence | LVOS requirement and gap | Severity | Likely source files or style regions | Owner milestone |
| --- | --- | --- | --- | --- | --- | --- |
| AU-01 | Typography contract and proof | `app/layout.tsx` loads Geist, Geist Mono and Newsreader, but no single enforceable core contract, approved proof or route-adoption ledger governs the live cascade. `design-system.css:27-36` still defines 28px/18px/14px application roles; `globals.css` retains 700–800 weights, `.assumption-registry-actions button` at 9px and oversized route titles. | LVOS requires one normative role-based scale, proof across representative surfaces and explicit migration rules. LVOS-1 closes this contract/proof gap; each route milestone applies the contract to its owned surfaces, and LVOS-7 verifies that no violations remain globally. | P0 | `app/layout.tsx`; `app/design-system.css` typography tokens; `app/globals.css` E6/V2–V6/E7 type rules | LVOS-1 |
| AU-02 | Shell and navigation | `app/app-shell.tsx` and `globals.css:1507-1605` implement one expandable 236px sidebar and 64px collapsed rail from one grouped nav list. | LVOS requires two persistent desktop layers: a 56px global icon rail and approximately 220px contextual navigation, with fixed destination ownership. | P0 | `app/app-shell.tsx`; `app/nav-config.tsx`; `.shell*` selectors | LVOS-2 |
| AU-03 | Responsive shell transformation | Compact desktop auto-collapses only at 901–1100px; the drawer starts at 900px; under 680px the top bar is 48px. | At 900–1179px the 56px rail remains and contextual navigation becomes a drawer; below 900px navigation is a 300px drawer and the top bar remains 52px. | P0 | `COMPACT_DESKTOP_QUERY`; `MOBILE_NAV_QUERY`; `.shell*` media rules | LVOS-2 |
| AU-04 | Legacy CSS and dialects | `globals.css` is layered from pre-E7 base through E6.1, V2, V3.2, V4.x, V5.x, V6.x and E7 overrides; `design-system.css` keeps `--app-*`, `--d*`, `--ink` and other aliases. | One shared grammar must replace cascade archaeology. Compatibility rules may remain only until consumers migrate and must then be removed deliberately. | P1 | Entire `app/globals.css`; compatibility-alias block in `app/design-system.css` | LVOS-7 |
| AU-05 | Records, lists and tables | E7.2 and E7.3 use connected rows and hairlines, while team, policy, settings and integration routes still use separate `*-card`, `*-grid` and faux-table grammars. | Aligned records, rule-separated groups and stable identifiers must be the default; no card for every concept. | P1 | `.workspace-row*`, `.team-row*`, `.settings-*`, `.policy-*`, `.action-*`, `.slack-*` | LVOS-4 |
| AU-06 | Workspace command centre | `/workspace` has a compact summary strip, structured queue, selected inspector and accessible compact drawer. Its primary views are rendered as `.workspace-segment` controls inside a bordered segmented container; rows do not yet expose the full LVOS aligned column grammar or micro trace. | Archetype A requires genuine sibling-view tabs, aligned `State / PR / Recommendation / Requirements / Owner / Updated` records and the fixed inspector hierarchy without KPI cards or row action walls. | P1 | `app/workspace/page.tsx`; `globals.css:1021-1214` | LVOS-3 |
| AU-07 | Case File convergence | `/report` implements the 150/760/290–310 dossier grid, fixed reading order, evidence records, Merge Contract and visually heavy human decision. It still carries 25–34px application headings, dense 10–11px copy, residual legacy record/card selectors and overlapping disclosure grammars. | Archetype C is correct; typography, ledger grammar, disclosure and compact transformations must converge without changing report logic. | P1 | `app/report/page.tsx`; `globals.css:2154-2600` plus earlier report generations | LVOS-5 |
| AU-08 | Review operations | `/review-operations` leads with six metric tiles, percentage bars and multiple panels, described in CSS as a “dashboard”. | Operations must use Archetype E only for real chronological/spatial relationships; generic KPI dashboard composition and decorative aggregation are prohibited. | P1 | `app/review-operations/page.tsx`; `.operations-*` selectors | LVOS-4 |
| AU-09 | Team | `/team` mixes a hero, four-metric overview, forms, rows, faux table, ownership records and activity timeline. E7.4B flattens the cards but does not remove the mixed composition. | Team configuration is Archetype D: administrative heading, optional section navigation and aligned rule-separated groups/tables. | P1 | `app/team/page.tsx`; `.team-*` selectors | LVOS-4 |
| AU-10 | Settings and policies | `/settings` uses a two-card overview plus four mode cards; `/review-policies` uses level cards and one card per policy. Both use oversized explanatory headers. | Archetype D forbids hero panels and dashboard cards; settings and policies must read as administrative documents and aligned clauses. | P1 | `app/settings/page.tsx`; `app/review-policies/page.tsx`; `.settings-*`; `.policy-*` | LVOS-4 |
| AU-11 | Website/application continuity | `/` imports the same `mock-report`, evidence hierarchy and Merge Contract as the product and uses shared trace/status terms. The `.lp` scope still owns a separate W2 grammar and selected exhibit treatments rather than consuming a locked final application grammar. | Website and product must share trace semantics, data, terminology, status treatment and theme materials while allowing editorial scale. | P1 | `app/page.tsx`; `app/landing-nav.tsx`; `globals.css:1608-2153` | LVOS-6 |
| AU-12 | Inspectors, drawers and sheets | The shell drawer, Risk Inbox inspector and report verdict sheet each implement focus trapping, Escape, focus return and scroll control. Their widths, breakpoints, backdrops and motion are independently defined. | Preserve accessibility mechanics, but consolidate one inspector/sheet grammar with one inspector per surface and LVOS width transformations. | P1 | `app/app-shell.tsx`; `app/workspace/page.tsx`; `app/report/page.tsx`; associated `.shell-drawer`, `.workspace-inspector`, `.report-verdict-rail` rules | LVOS-7 |
| AU-13 | Theme and materials | E7 provides dark matte and warm-paper light semantic planes and theme persistence. Legacy aliases include `--color-glass`; older panel-shadow tokens and route-specific surface rules remain. | Themes must change material, not hierarchy; ordinary panels stay plane- and hairline-led with shadows only for real overlays. | P2 | `app/theme-provider.tsx`; `app/design-system.css`; E7.4B overrides | LVOS-7 |
| AU-14 | Spacing and density | Shared spacing variables exist, but include 20px and 40px intermediates and route-local gaps/paddings across the large stylesheet; page widths and section rhythm vary by generation. | Use the 4/8/12/16/24/32/48/64/96 scale and fixed row/panel patterns; deliberate exceptions require approval. | P2 | Spacing tokens in `design-system.css`; route blocks throughout `globals.css` | LVOS-7 |
| AU-15 | Semantic colour | E7 roles broadly match LVOS and status labels include text. Some old aliases equate orange/danger, selected-state tinting is duplicated, and status styling is distributed across generations. | Preserve the fixed semantic mapping and centralise it so no route-local interpretation can drift. | P2 | Semantic tokens and aliases; status selectors in `design-system.css` and `globals.css` | LVOS-7 |
| AU-16 | Icons | `nav-config.tsx` defines consistent 16px geometric line SVGs with `currentColor`, but the current grouped sidebar makes them serve both global and contextual destinations. | Preserve the icon drawing language while assigning only the permanent global destinations to the 56px rail. | P2 | `app/nav-config.tsx`; `.shell-nav-item svg` | LVOS-2 |
| AU-17 | Integration/settings-adjacent surfaces | `/github-action` and `/slack-handoff` truthfully label prototypes and preserve no-post/no-send behaviour, but lead with PR-comment and Slack-window preview cards plus explanation cards. | Archetype D should present configuration/export records and code/text evidence without product-theatre hero cards. | P2 | Both route components; `.action-*` and `.slack-*` selectors | LVOS-4 |
| AU-18 | Motion constitution readiness | Motion is currently scattered across theme transitions, drawer/sheet entry, disclosure/selection and skeletons; no reviewed cross-surface verification-state storyboard exists. | Motion must explain verification state, share website/product semantics and establish reduced-motion parity before implementation. | P2 | Theme transition; drawer/sheet keyframes; selection/disclosure transitions | V8A |
| AU-19 | Motion foundation | Existing transitions are selector-specific and do not form named state primitives for evidence attachment, clause clearance, trace progression or decision recording. | Implement only approved motion primitives after the storyboard and after static consolidation. | P2 | `design-system.css` transition tokens; keyframes and transition rules in `globals.css` | V8B |
| AU-20 | Motion tuning | Durations cluster around 130–180ms and reduced-motion rules exist for several surfaces, but cross-theme, compact-sheet and website/product timing has not been tuned as one system. | Tune timing, easing and reduced-motion equivalence only after the foundation is stable. | P3 | Transition tokens; `prefers-reduced-motion` blocks; website and application motion selectors | V8C |

## 3. Route-by-route matrix

| Route | Current archetype | Required LVOS archetype | Compliance status | Strengths to preserve | Structural / visual / typography / responsive gaps | Likely files affected | Roadmap milestone |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | C adapted as a public verification narrative | C — Verification dossier + verdict rail | Substantial | Shared report data; trace; finding/evidence/contract exhibits; three Newsreader moments; truthful human-decision state | W2 styles remain a separate dialect; final shell/product materials and exact status grammar are not yet locked; compact exhibits need final continuity QA (AU-11) | `app/page.tsx`, `app/landing-nav.tsx`, `.lp*` CSS | LVOS-6 |
| `/workspace` | A with a segmented filter | A — Queue + inspector | Substantial but incomplete | Summary strip, queue-first layout, selected inspector, focus-trapped compact drawer, preserved local review mechanics | Convert primary views to sibling tabs; align queue columns; add micro trace and fixed inspector order; reconcile desktop/intermediate/mobile composition (AU-06) | `app/workspace/page.tsx`, `.workspace-*` CSS | LVOS-3 |
| `/new` | B-like source list + selected change detail | B — List + selected detail | Substantial | Source rail, repository/PR selection, editable change brief, data boundaries and all import modes | Integrate with the definitive two-layer shell; apply the LVOS-1 type contract through the LVOS-2 adoption-ledger assignment; preserve three-pane mechanics without inventing a sixth archetype (AU-02–03) | `app/new/page.tsx`, E6.1 `.new-*`, `.workbench-*`, `.wb-*` CSS | LVOS-2 |
| `/report` | C | C — Verification dossier + verdict rail | Strongest application surface | Fixed dossier order; verification trace; evidence/assumption/contract ledgers; compact verdict sheet; human decision visually final | Type scale and dense copy violate the final floor/ceiling; residual card/disclosure dialects and compact transformations need convergence (AU-07) | `app/report/page.tsx`, report CSS generations and E7.3 blocks | LVOS-5 |
| `/review-operations` | Mixed generic dashboard and E | E — Timeline or graph surface | Weak | Truthful local/demo labeling; real report-derived trends; no fabricated customers | Six KPI tiles and percentage bars dominate; cards fragment evidence; hierarchy is dashboard-led rather than relationship-led; mobile merely stacks (AU-08) | Route component and `.operations-*` CSS | LVOS-4 |
| `/team` | Mixed dashboard, D and E | D — Administrative document | Weak | Local/shared boundary is explicit; responsibility metadata and human authority remain honest; real rows/tables/activity | Hero plus KPI overview mixes archetypes; separate form/table/activity grammars; heavy uppercase/700 legacy labels; mobile stacks rather than transforming an administrative document (AU-09) | Route component and `.team-*` CSS | LVOS-4 |
| `/settings` | Card-based administrative concept | D — Administrative document | Partial | Clear deterministic/model boundary, read-only truthfulness and real provider status language | Current-prototype hero card, principle card and mode-card grid; oversized explanatory header; responsive card stacking (AU-10) | Route component and `.settings-*` CSS | LVOS-4 |
| `/review-policies` | Card catalogue | D — Administrative document | Weak | Required/recommended/optional semantics and concrete gate data | One card per policy, repeated nested groups, hero language and uppercase label density; compact mode only stacks cards (AU-10) | Route component and `.policy-*` CSS | LVOS-4 |
| `/github-action` | Preview-card showcase | D — Administrative document | Partial | Honest prototype boundary, real workflow/YAML evidence, no posting behaviour | PR-comment mockup and explanation card create theatre; workflow boxes and pills fragment the record; responsive composition is card stacking (AU-17) | Route component and `.action-*` CSS | LVOS-4 |
| `/slack-handoff` | Preview-card showcase | D — Administrative document | Partial | Export-only semantics, real copy interaction, raw-diff-free handoff and explicit non-integration status | Slack-window simulation, explanation card, tag cluster and one card per variant; should become aligned export records with a selected detail (AU-17) | Route component and `.slack-*` CSS | LVOS-4 |

No current route requires a sixth archetype. `/review-operations` currently mixes a generic dashboard with Archetype E; `/team` mixes dashboard, administrative and timeline patterns. Those are compliance gaps, not evidence for new archetypes.

## 4. Typography audit

- **Loading and variables:** `app/layout.tsx` uses `next/font/google` for Geist, Geist Mono and Newsreader and exposes `--font-geist`, `--font-geist-mono` and `--font-newsreader`. `design-system.css` maps the first two to `--font-sans` and `--font-mono`; `.lp` maps Newsreader to its public serif role.
- **Correct usage:** the public page applies Newsreader to the hero, central thesis and final action. The application does not intentionally use serif. Repositories, hashes, run IDs, paths, record references and timestamps commonly use mono.
- **Mono/uppercase drift:** structural labels such as `.source-rail-label`, `.wb-group h4`, many kickers, policy/status metadata and Case File overlines are frequently uppercase; some are mono even when they are navigational or explanatory rather than technical identifiers.
- **Size and weight violations:** the live design-system tokens declare a 28px page title and 18px section heading; the Case File uses a 25–34px header. Legacy rules include weights 700 and 800, while `.assumption-registry-actions button` is 9px. These are evidence for the missing enforceable contract and must be corrected during each owning route milestone rather than by the isolated LVOS-1 proof itself.
- **Application hierarchy:** E7.2/E7.3 records are close to the target, but older route headers and cards remain louder than the shell and document bodies.
- **Website hierarchy:** Newsreader is correctly scarce and the narrative is editorial; final type roles must be re-proved against the consolidated application so shared data and product exhibits remain visually continuous.
- **Adoption and closure:** LVOS-1 owns and closes AU-01 by approving the core contract, representative proof and an adoption ledger. LVOS-2 through LVOS-6 execute the ledger entries for their owned routes. LVOS-7 verifies zero remaining sub-10px application text, over-600 weights, decorative mono and unapproved application-title sizes.
- **Premium migration readiness:** role variables and `next/font` boundaries make a future controlled family swap feasible; semantic roles, hierarchy and type metrics remain stable while live routes migrate through their owning milestones.
- **Licence boundary:** Geist Sans, Geist Mono and Newsreader are the current open-source implementation. Söhne, Söhne Mono and Tiempos Headline are the long-term licensed target, subject to valid licences. Do not add or distribute commercial font files without those licences.

## 5. Page-archetype map

| Route | Approved archetype | Current mixing or invention |
| --- | --- | --- |
| `/` | C — Verification dossier + verdict rail, adapted to the normative website movements | No sixth archetype; editorial movements narrate the same Case File chain. |
| `/workspace` | A — Queue + inspector | Uses segmented-filter styling where sibling tabs are required. |
| `/new` | B — List + selected detail | Three-pane source/repository/detail workbench is a bounded B composition. |
| `/report` | C — Verification dossier + verdict rail | Correct archetype; residual component dialects remain inside it. |
| `/review-operations` | E — Timeline or graph surface | Currently mixed with a prohibited KPI dashboard. |
| `/team` | D — Administrative document | Currently mixes dashboard summary and timeline patterns. |
| `/settings` | D — Administrative document | Currently expressed as a card-based concept page. |
| `/review-policies` | D — Administrative document | Currently expressed as a policy-card catalogue. |
| `/github-action` | D — Administrative document | Currently mixes administrative evidence with preview-card theatre. |
| `/slack-handoff` | D — Administrative document | Currently mixes administrative export controls with a simulated chat preview. |

## 6. Legacy-debt inventory

| Debt | Evidence | Eventual action | Do not remove prematurely |
| --- | --- | --- | --- |
| Pre-shell application generation | `.sidebar`, `.side-nav`, `.nav-item`, `.topbar`, `.main-content` at the start of `globals.css` coexist with `.shell-*`. | Remove after every authenticated route is verified on the definitive shell. | Route/body selectors still referenced by report-era components. |
| E6.1 workbench dialect | `.new-*`, `.source-*`, `.workbench-*`, `.wb-*`, `.command-*` define many 700-weight labels and route-local dimensions. | Migrate the existing mechanics to approved B records during shell integration/type adoption. | GitHub import, manual diff, sample selection and command dock behaviour. |
| V2/V3 report generations | `.score-card`, `.summary-card`, `.report-tabs`, `.quick-actions-*`, `.finding-detail-panel`, `.report-decision-panel` remain alongside E7.3. | Remove only selectors proved superseded by the final Case File. | Shared report interactions and non-Case-File states still need an ownership check. |
| V4 administrative generations | `.settings-*-card`, `.policy-card`, `.action-*-card`, `.slack-*-card`, `.operations-panel`, `.operations-metric-grid`, `.team-overview`. | Replace with aligned document/record grammar in LVOS-4, then delete the obsolete card rules. | Data rendering, copy/export, tables, forms and truthful prototype boundaries. |
| V5 visual overrides | “internal app visual identity”, “monochrome command-centre” and focused-polish blocks restyle earlier selectors. | Fold still-valid rules into semantic primitives; remove cascade-only patches at LVOS-7. | Semantic status meanings and focus behaviour. |
| Compatibility token aliases | `--app-*`, `--d*`, `--ink`, `--line`, `--soft`, `--green`, `--orange` and `--color-glass` in `design-system.css`. | Migrate consumers to semantic `--color-*` roles, then remove aliases with zero references. | The E7 dark/light semantic values and theme bootstrap. |
| Hard-coded exceptions | `#fff` hover values, old direct text colours, local widths/gaps, 9px/700/800 type rules and selector-specific shadows. | Replace only within the owning milestone; verify both themes and all data states. | Focus rings, overlay shadows and semantic state colours. |
| Pill/gauge/card remnants | `.workspace-segment`, count/status pills, metric tiles, percentage bars, simulated Slack tags and numerous card selectors. | Retain genuine status chips; remove navigation pills, dashboard metrics and card-for-concept patterns. | Toggle tracks, status chips, avatars and technical count alignment where LVOS permits them. |

Shared rules that must survive migration include the semantic theme tokens, theme bootstrap/persistence, global `:focus-visible`, form states, reduced-motion handling, shell route configuration, E7.2 selection and inspector mechanics, and E7.3 dossier/human-decision semantics.

## 7. Preserve unchanged

- **E7 theme architecture:** semantic dark/light roles, system preference, stored preference, pre-hydration theme bootstrap and identical structural hierarchy across themes.
- **E7.3 Case File:** dossier reading order, outline/jump transformation, evidence and uncertainty records, Merge Contract, verdict rail, compact decision sheet and Human Decision Ledger.
- **E7.2 Risk Inbox mechanics:** history grouping, queue selection, local owner/state/note handling, loading and empty states, and focus-trapped compact inspector.
- **Accessible drawer/sheet behaviour:** Escape close, focus trap, focus return, scroll locking and labelled dialog/complementary roles in the shell, workspace and report.
- **W2 Case File narrative:** one persistent change-to-decision story, real sample report data, evidence/contract exhibits, three editorial serif moments and truthful trust statements.
- **Deterministic and human-authority semantics:** baseline-first analysis, explicit provenance, open proof and requirements, human decisions stored separately from recommendations, and no implication that Lintel makes the final call.
- **Product behaviour:** APIs, schemas, local storage, scoring, report generation, imports, copy/export and review interactions remain outside the visual consolidation mandate.

## 8. Audit conclusion

Lintel does not need another visual direction. It needs a controlled convergence onto LVOS v1.0: prove and lock typography, implement the definitive shell, finish the Risk Inbox and Case File within their approved archetypes, convert fragmented support routes into administrative/relationship-led records, align the website to the resulting product, and remove superseded dialects only after migration evidence is complete.
