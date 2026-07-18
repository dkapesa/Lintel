# LVOS v1.0 implementation roadmap

> **Current visual-convergence update — 17 July 2026:** VC-1, VC-2 and VC-3 are APPROVED AND COMPLETE. VC-3 Landing-page Final Art Direction has no blocking corrections remaining. The next programme is VC-4 — Product Workbench Final Art Direction, beginning with VC-4A — Workspace Three-Pane Workbench Composition. This update supersedes the historical sequencing statement below; LVOS v1.0 remains APPROVED AND CLOSED.

> **Current visual-convergence status — 17 July 2026:** LVOS v1.0 remains APPROVED AND CLOSED. VC-1 Workspace and Command-Centre Refinement is APPROVED AND COMPLETE following final VC-1C review. VC-2 — Case File and Cross-Route Refinement is next. Subsequent work remains refinement within LVOS v1.0, not an architectural reset.

**Status:** fixed implementation sequence derived from [LVOS v1.0](./LVOS_V1.md) and the [current-state audit](./LVOS_CURRENT_STATE_AUDIT.md).  
**Rule:** each milestone has exclusive ownership of its listed audit findings and must be implementable, validated, committed and merged independently. Changing ownership or order requires an explicit governance decision.

**Current position:** LVOS-7 — Cross-System Final Audit and Consolidation is complete and APPROVED as of 17 July 2026. The LVOS v1.0 programme is APPROVED AND CLOSED. The next programme is Visual Convergence, beginning with VC-1 Workspace and Command-Centre Refinement; motion refinement remains later work within the approved LVOS v1.0 architecture.

## Phase gating

- Major new Phase 4 and Phase 5 capability expansion pauses during LVOS-1 through LVOS-7.
- Correctness fixes and essential maintenance may continue when they preserve product semantics and do not introduce a new visual primitive or dialect.
- V8 motion work follows the static consolidation and migration lock.
- Advanced feature development resumes only after LVOS-7, unless an explicit approval records the exception, scope and archetype.

## Fixed sequence and audit ownership

| Order | Milestone | Exclusive audit findings |
| ---: | --- | --- |
| 1 | LVOS-1 — Typography Proof and Core Type System | AU-01 |
| 2 | LVOS-2 — Application Shell and Navigation | AU-02, AU-03, AU-16 |
| 3 | LVOS-3 — Workspace Command Centre | AU-06 |
| 4 | LVOS-4 — Administrative Surfaces | AU-05, AU-08, AU-09, AU-10, AU-17 |
| 5 | LVOS-5 — Case File Convergence | AU-07 |
| 6 | LVOS-6 — Website and Product Continuity | AU-11 |
| 7 | LVOS-7 — Cross-System Final Audit and Consolidation | AU-04, AU-12, AU-13, AU-14, AU-15 |
| 8 | V8A — Motion Constitution and Storyboard | AU-18 |
| 9 | V8B — Motion Foundation | AU-19 |
| 10 | V8C — Motion Tuning | AU-20 |

## LVOS-1 — Typography Proof and Core Type System

- **Purpose:** prove the LVOS type roles on representative Lintel content before any repository-wide migration.
- **User-visible outcome:** one reviewable proof demonstrating the approved application and website hierarchy, including the 10px floor, 600 weight ceiling and disciplined mono rules; it does not claim that live routes have already migrated.
- **Approved archetype or layer:** core typography system layer; no route archetype changes.
- **Scope:** an isolated proof containing app shell, queue row, inspector, finding, contract clause, settings row and website hero. Use representative real repository content; do not convert live routes yet.
- **Likely files/style regions:** a temporary or explicitly approved proof surface; typography tokens in `app/design-system.css`; selected proof-only styles. `app/layout.tsx` changes only if role variables require clarification, not to change families.
- **Dependencies:** LVOS-0 approved; current Geist Sans, Geist Mono and Newsreader loading remains intact.
- **Functionality unchanged:** all routes, interactions, data, APIs, storage, scoring and generators.
- **Structural work:** define named type roles, line measures and a proof matrix across dark/light and desktop/compact contexts. Produce a typography-adoption ledger assigning live shell and `/new` migration to LVOS-2, `/workspace` to LVOS-3, administrative and operations routes to LVOS-4, `/report` to LVOS-5 and `/` to LVOS-6; reserve final zero-violation enforcement for LVOS-7.
- **Styling work:** finalise scale, 400/500/550/600 weights, tracking, casing, tabular numerals, mono eligibility and application/website line lengths.
- **Responsive work:** prove hierarchy and wrapping at approximately 1440px, an intermediate width and approximately 390px.
- **Accessibility work:** verify zoom/reflow, legibility, focus labels, contrast and the 10px floor.
- **Validation states:** long/short titles, identifiers, multiline clauses, dense settings copy, empty metadata, both themes and all three widths.
- **Acceptance criteria:** all seven proof specimens pass LVOS; premium target roles are evaluated without adding or distributing commercial font files; current families remain the production implementation; the core contract, migration rules and adoption ledger are explicit and approved. This closes AU-01's contract/proof gap, not the route-level migration work assigned to LVOS-2 through LVOS-6.
- **Explicit non-goals:** repository-wide type replacement, shell restructuring, page restyling, font purchase, font-file addition or product redesign.
- **Model/tool recommendation:** Claude Fable for bounded proof critique; GPT-5.6 Sol for difficult token/structure implementation; browser capture for the proof matrix.
- **Branch strategy:** `codex/lvos-1-typography-proof`, branched from the approved LVOS-0 baseline; no unrelated work.
- **Commit checkpoint:** one proof-system commit after TypeScript, build and visual review pass; do not mix route migration.
- **Exit artifact:** approved type-role specification, proof captures, migration decision record and typography-adoption ledger covering every live route and shared shell surface.

## LVOS-2 — Application Shell and Navigation

- **Purpose:** implement the definitive stable shell without redesigning route bodies.
- **User-visible outcome:** a 56px global icon rail, approximately 220px contextual navigation and 52px command bar with predictable transformations.
- **Approved archetype or layer:** global application shell system layer.
- **Scope:** authenticated shell around `/workspace`, `/new`, `/report`, `/review-operations`, `/team`, `/settings`, `/review-policies`, `/github-action` and `/slack-handoff`; route-body edits only for integration.
- **Likely files/style regions:** `app/app-shell.tsx`, `app/nav-config.tsx`, shell region of `app/globals.css`, shared shell tokens; minimal route wrappers/actions where required.
- **Dependencies:** LVOS-1 type roles approved.
- **Functionality unchanged:** routes, active navigation, workspace switching, theme preference, top-bar actions, local note, account metadata and all route bodies.
- **Structural work:** split global destinations from contextual destinations; centralise context maps and breadcrumb/action slots; preserve one shell instance.
- **Styling work:** exact 56px rail, ~220px contextual navigation, 52px bar, 16px line icons, 32×32 active surface, hairlines and neutral planes.
- **Responsive work:** at 900–1179px retain the rail and move contextual navigation to a dismissible drawer; below 900px remove the persistent rail, use a 300px navigation drawer and retain a 52px mobile bar.
- **Accessibility work:** preserve/verify focus trap, Escape, focus return, scroll lock, landmarks, accessible icon names, current-page state and 44px mobile targets.
- **Validation states:** every route active state; long workspace/repository context; expanded desktop, intermediate drawer, mobile drawer; dark/light/system themes; keyboard-only navigation.
- **Acceptance criteria:** shell dimensions and transformations match LVOS; no duplicate route controls; every route remains reachable and functional; route bodies are unchanged beyond integration; AU-02, AU-03 and AU-16 close.
- **Explicit non-goals:** workspace queue redesign, administrative route conversion, Case File refinement, website changes or new navigation destinations.
- **Model/tool recommendation:** GPT-5.6 Sol for shell structure; GPT-5.6 Terra for controlled route adoption; Claude Fable for bounded cross-width critique.
- **Branch strategy:** `codex/lvos-2-shell`, based on merged LVOS-1.
- **Commit checkpoint:** shell core and route-integration commits may be separate, but the milestone merges only after the complete route matrix passes.
- **Exit artifact:** definitive shell component, route/context map and desktop/intermediate/mobile validation captures.

## LVOS-3 — Workspace Command Centre

- **Purpose:** make Risk Inbox the operational home and complete Archetype A.
- **User-visible outcome:** a summary strip, genuine sibling-view tabs, aligned verification queue and selected-case inspector answering what needs attention now.
- **Approved archetype or layer:** A — Queue + inspector.
- **Scope:** `/workspace` only, including loading, empty, populated, selected and compact-inspector states.
- **Likely files/style regions:** `app/workspace/page.tsx`; E7.2 `.workspace-*` CSS; shared record/inspector primitives only where already approved.
- **Dependencies:** LVOS-2 shell merged.
- **Functionality unchanged:** local report history, grouping, filters, selection, review state/owner/note, deletion, copy conditions and report navigation.
- **Structural work:** preserve the summary strip; make Inbox/Assigned/Awaiting evidence/Ready/Reviewed true sibling views; align `State / PR / Recommendation / Requirements / Owner / Updated`; apply the fixed inspector information order.
- **Styling work:** connected rows, one status chip maximum, micro trace, selected plane plus left rule, semantic risk text and no KPI-card dashboard or row action wall.
- **Responsive work:** desktop queue + 360–400px inspector; intermediate two/one-pane transformation; mobile 64–76px rows and focus-trapped right/full-width sheet with compact pinned decision actions where needed.
- **Accessibility work:** preserve row keyboard selection, visible focus, dialog semantics, focus trap/return, scroll lock and non-colour status labels.
- **Validation states:** no reports, loading, error, multiple grouped runs, each queue view, selected/unselected, long titles, stale/reaffirmation signals, both themes and three widths.
- **Acceptance criteria:** `/workspace` is unmistakably Archetype A; no segmented-pill primary navigation, metric cards, gauges or row action walls; all mechanics remain unchanged; AU-06 closes.
- **Explicit non-goals:** report-body changes, new filters/data, new scoring, new actions or review-operations redesign.
- **Model/tool recommendation:** GPT-5.6 Sol for structural queue/inspector work; GPT-5.6 Terra for controlled visual adoption; Claude Fable for hierarchy QA.
- **Branch strategy:** `codex/lvos-3-workspace`, based on merged LVOS-2.
- **Commit checkpoint:** one structural checkpoint and one polish/QA checkpoint, each buildable; merge only as a complete archetype.
- **Exit artifact:** Archetype A reference implementation and state-by-width capture matrix.

## LVOS-4 — Administrative Surfaces

**Status:** Complete / Closed — 16 July 2026

**Closure:** The six-route dark/light and desktop/intermediate/mobile matrix is approved. AU-05, AU-08, AU-09, AU-10 and AU-17 are closed; the purpose, scope, ownership and acceptance criteria below remain the governing historical milestone record.

- **Purpose:** consolidate administrative, integration-adjacent and supporting operations surfaces into record-led approved compositions.
- **User-visible outcome:** Team, Settings, Policies, integrations and local operations read as one engineering administration system rather than route-specific dashboards or showcases.
- **Approved archetype or layer:** D — Administrative document for `/team`, `/settings`, `/review-policies`, `/github-action` and `/slack-handoff`; E — Timeline or graph surface for `/review-operations` where relationships genuinely require it.
- **Scope:** `/team`, `/settings`, `/review-policies`, `/github-action`, `/slack-handoff`, `/review-operations`.
- **Likely files/style regions:** all six route components; `.team-*`, `.settings-*`, `.policy-*`, `.action-*`, `.slack-*`, `.operations-*`; approved shared record/table rules.
- **Dependencies:** LVOS-3 merged so shared records and inspectors have a stable reference.
- **Functionality unchanged:** team local-storage mechanics, provider/read-only content, policy data, copy/export actions, YAML/text previews, report-derived operations metrics and all truth/limitation language.
- **Structural work:** remove hero-card and dashboard composition; group settings by rules; align team/repository/policy/export records; express operations through real chronological or relational evidence rather than KPI theatre.
- **Styling work:** hairline groups, aligned columns, neutral planes, restrained status labels and no glass, dashboard cards, preview theatre or ornamental shadow.
- **Responsive work:** preserve record meaning through deliberate column collapse, row regrouping and scoped technical overflow; do not merely stack former cards.
- **Accessibility work:** valid table/list semantics, labelled groups, keyboard-accessible disclosures and copy controls, status text, touch targets and readable technical previews.
- **Validation states:** populated/empty team and activity; all policies and gate levels; every settings/provider state; successful/failed copy; long YAML/handoff content; demo/real operations data; both themes and three widths.
- **Acceptance criteria:** each route uses only its declared archetype; shared records replace duplicate card grammars; no fake metrics or product states; all behaviour and data remain unchanged; AU-05, AU-08, AU-09, AU-10 and AU-17 close.
- **Explicit non-goals:** live collaboration, provider configuration, policy enforcement, GitHub posting, Slack OAuth/delivery, new analytics, new APIs or new data models.
- **Model/tool recommendation:** GPT-5.6 Sol for difficult operations/team restructuring; GPT-5.6 Terra for repeated controlled adoption; GPT-5.6 Luna only for isolated mechanical selector cleanup; Claude Fable for bounded cross-route QA.
- **Branch strategy:** `codex/lvos-4-administrative-surfaces`; keep route commits independently reviewable inside one milestone branch.
- **Commit checkpoint:** one buildable checkpoint per route plus a final shared-grammar cleanup; merge only after the six-route matrix passes.
- **Exit artifact:** Archetype D reference set, justified Archetype E operations surface and removed-card inventory.

## LVOS-5 — Case File Convergence

**Status:** Complete / APPROVED — 17 July 2026. The LVOS-7 independent route, interaction and responsive pass closes AU-07; the approved Case File remains the definitive Archetype C reference.

- **Purpose:** refine the flagship report into the definitive Archetype C without changing product logic.
- **User-visible outcome:** one disciplined verification dossier with a clear evidence-to-contract chain and the human decision as the heaviest record.
- **Approved archetype or layer:** C — Verification dossier + verdict rail.
- **Scope:** `/report`, including outline, document, verdict rail, compact decision sheet, disclosures, ledgers, export and all historical/current states.
- **Likely files/style regions:** `app/report/page.tsx`; E7.3 `.case-file-*`, `.dossier-*`, `.verdict-*`; earlier report selectors proven still in use.
- **Dependencies:** LVOS-4 merged; type and shared record grammars stable.
- **Functionality unchanged:** report normalisation, tabs/section jumps, evidence, assumptions, Merge Contract, review actions, re-checks, decisions, local review state, exports and verification packs.
- **Structural work:** preserve fixed reading order and three-column desktop composition; unify finding/evidence/assumption/contract records; place progressive disclosure only after summaries; retain verdict/human-authority hierarchy.
- **Styling work:** apply final type roles, 65–80-character document measure, hairline ledger grammar, maximum two bordered levels and restrained semantic colour.
- **Responsive work:** collapse outline to section jump; convert verdict rail to a compact pinned summary and focus-trapped sheet; preserve readable order and decision access at approximately 390px.
- **Accessibility work:** headings/landmarks, disclosure names, focus order, sheet trap/return, status text, form labels and reduced-motion parity.
- **Validation states:** demo/historical/current reports, all recommendations/risk bands, missing evidence, open/satisfied clauses, no/current/stale/withdrawn human decision, long content, both themes and three widths.
- **Acceptance criteria:** shared ledger grammar is consistent across evidence, assumptions and contracts; human decision remains visually final; desktop and compact transformations are deliberate; no product logic changes; AU-07 closes.
- **Explicit non-goals:** new report sections, scoring changes, generator/schema changes, decision-model changes, motion implementation or website edits.
- **Model/tool recommendation:** GPT-5.6 Sol for structural convergence; GPT-5.6 Terra for careful disclosure/type migration; Claude Fable for dossier and verdict-rail QA.
- **Branch strategy:** `codex/lvos-5-case-file`, based on merged LVOS-4.
- **Commit checkpoint:** structure, ledger convergence and responsive/QA checkpoints; each must build and preserve report fixtures.
- **Exit artifact:** definitive Archetype C reference, state matrix and superseded report-selector list.

## LVOS-6 — Website and Product Continuity

**Status:** Complete / APPROVED — 17 July 2026. AU-11 is closed; no LVOS-6 blocker remains.

- **Purpose:** align the public website with the final static application without turning the milestone into motion work.
- **User-visible outcome:** moving from `/` to `/report` feels like entering the same product shown publicly.
- **Approved archetype or layer:** normative website movements using the same Archetype C verification case and shared system materials.
- **Scope:** `/`, landing navigation/footer and public product exhibits; continuity checks against `/workspace` and `/report`.
- **Likely files/style regions:** `app/page.tsx`, `app/landing-nav.tsx`, `.lp*` CSS, shared semantic/product-record primitives.
- **Dependencies:** LVOS-5 merged so the website can adopt the final product truth.
- **Functionality unchanged:** navigation, theme toggle, shared mock-report data, CTAs and documentation links.
- **Structural work:** retain the seven normative movements and one persistent verification case; ensure product crops expose real trace, evidence, requirements and human decision states.
- **Styling work:** use final theme materials, trace/status grammar and terminology; preserve exactly three Newsreader moments and truthful editorial whitespace.
- **Responsive work:** deliberate exhibit crops and reading order at desktop/intermediate/mobile without hiding proof or introducing horizontal page scroll.
- **Accessibility work:** headings, landmark order, product-exhibit text alternatives, contrast, keyboard navigation and motion-free comprehension.
- **Validation states:** dark/light, desktop/intermediate/mobile, all links, sample data parity with `/report`, long product labels and no-script/static readability where applicable.
- **Acceptance criteria:** shared data, terms, trace, status and materials match the application; no fake metrics, customers, testimonials or product states; AU-11 closes.
- **Explicit non-goals:** V8 motion, new marketing claims, new sample data, browser-chrome mockups, decorative AI imagery or application redesign.
- **Model/tool recommendation:** GPT-5.6 Terra for controlled adoption; Claude Fable for continuity critique and visual QA; GPT-5.6 Sol only if structural exhibit reuse is difficult.
- **Branch strategy:** `codex/lvos-6-website-continuity`, based on merged LVOS-5.
- **Commit checkpoint:** static continuity implementation followed by a separate responsive/QA checkpoint; both production-build clean.
- **Exit artifact:** website/application terminology-and-data parity matrix plus representative captures.

## LVOS-7 — Cross-System Final Audit and Consolidation

**Status:** Complete / APPROVED — 17 July 2026. AU-04, AU-12, AU-13, AU-14 and AU-15 are closed; the LVOS v1.0 static migration lock is complete.

**Closure:** The final dark/light matrix passed across all ten routes at 1440px and the representative five-route set at 1024px and 390px. `/new` typography/family drift, undersized mobile Case File controls and the final landing Merge Contract semantic-colour mismatch were corrected. The semantic-colour gate passed, proven zero-consumer dialects were removed, live compatibility ownership was retained, and no product behaviour or data changed. LVOS-7 and the LVOS v1.0 programme are complete. See [LVOS-7 final system audit](./LVOS_FINAL_SYSTEM_AUDIT.md).

- **Purpose:** verify the complete static system, remove only superseded dialects and lock the migration before feature expansion.
- **User-visible outcome:** every in-scope route belongs unmistakably to one product in dark/light and desktop/mobile states.
- **Approved archetype or layer:** cross-system QA and migration governance layer; no archetype changes.
- **Scope:** all ten routes, shared shell, global/design-system CSS, themes, typography, records, inspectors, drawers and sheets.
- **Likely files/style regions:** `app/design-system.css`, `app/globals.css`, shared shell/theme modules and only route files required to close verified exceptions.
- **Dependencies:** LVOS-1 through LVOS-6 merged.
- **Functionality unchanged:** all product semantics, interactions, data, APIs, schemas, storage, scoring and generators.
- **Structural work:** inventory live selectors/tokens; remove zero-consumer compatibility layers; document intentional exceptions; lock primitive and archetype ownership.
- **Styling work:** eliminate remaining old palettes, card/glass/gauge/pill/shadow dialects, hard-coded type/spacing exceptions and duplicated state rules. Enforce zero remaining sub-10px application text, over-600 weights, decorative mono and unapproved application-title sizes across all live routes.
- **Responsive work:** cross-route verification at approximately 1440px, intermediate width and approximately 390px; confirm no page horizontal scroll and consistent drawers/sheets.
- **Accessibility work:** keyboard-only route pass, focus visibility/traps/return, landmarks, labels, touch targets, contrast, zoom/reflow and reduced-motion parity.
- **Validation states:** every route in dark/light; representative loading, empty, error, populated, selected and overlay states; terminology/data continuity; TypeScript and production build.
- **Acceptance criteria:** every route declares and follows one archetype; no unapproved primitive or superseded dialect remains; the LVOS-1 typography-adoption ledger is complete with zero remaining sub-10px application text, over-600 weights, decorative mono or unapproved application-title sizes; intentional exceptions are documented; AU-04, AU-12, AU-13, AU-14 and AU-15 close; migration lock is recorded.
- **Explicit non-goals:** new features, V8 motion implementation, font-family migration without licences, API/schema changes or speculative polish.
- **Model/tool recommendation:** Claude Fable for bounded cross-surface visual QA; GPT-5.6 Terra for controlled migration; GPT-5.6 Luna only for isolated mechanical removals; GPT-5.6 Sol for any difficult shared-structure correction.
- **Branch strategy:** `codex/lvos-7-migration-lock`; start only from fully merged LVOS-6.
- **Commit checkpoint:** one verified cleanup commit per obsolete dialect family and a final lock/documentation commit; never delete shared rules without consumer evidence.
- **Exit artifact:** final route/theme/width QA matrix, intentional-exception register, zero-consumer removal log and visual migration lock decision.

## V8A — Motion Constitution and Storyboard

**Status:** Active — 18 July 2026, documentation only on `v8-experience-and-motion`. [V8 Motion Constitution](./V8_MOTION_CONSTITUTION.md) and [V8 Experience Storyboard](./V8_EXPERIENCE_STORYBOARD.md) are the governing V8A artifacts. No implementation, CSS, dependency, data or product-semantic change is included.

- **Purpose:** translate LVOS motion rules into a reviewed verification-state storyboard before code.
- **User-visible outcome:** none yet; motion intent becomes explicit and testable.
- **Approved archetype or layer:** motion governance layer across the existing five archetypes and website movements.
- **Scope:** row selection, inspector/sheet entry, disclosure, evidence attachment, clause state, trace progression, decision appearance and readiness delta.
- **Likely files/style regions:** documentation/storyboard artifacts first; references to existing transition tokens and state components, without production implementation.
- **Dependencies:** LVOS-7 migration lock.
- **Functionality unchanged:** all product and visual static behaviour.
- **Structural work:** map trigger, start/end state, information conveyed, duration band, interruption and reduced-motion equivalent for each approved motion.
- **Styling work:** storyboard only; define shared semantics between website and product.
- **Responsive work:** show desktop, intermediate sheet/drawer and mobile equivalents.
- **Accessibility work:** every storyboard includes a no-motion state with identical information and focus order.
- **Validation states:** normal, interrupted, repeated, stale/reaffirmed, reduced motion and low-performance assumptions.
- **Acceptance criteria:** no ambient decoration; every motion explains verification state; website/product semantics match; AU-18 closes.
- **Explicit non-goals:** production animation code, decorative transitions, layout redesign or timing polish.
- **Model/tool recommendation:** Claude Fable for motion storyboard and critique; GPT-5.6 Terra for feasibility review.
- **Branch strategy:** `codex/v8a-motion-storyboard`; documentation/artifact-only until approval.
- **Commit checkpoint:** one approved constitution/storyboard commit.
- **Exit artifact:** signed-off motion constitution, state storyboard and reduced-motion matrix.

## V8B — Landing Product Choreography

- **Purpose:** implement only the approved landing product-story sequences: hero orientation, product-stage ownership, readiness → finding → evidence → requirement continuity, Human Authority/final action and landing reduced motion.
- **Permitted areas:** `/`, its named Case File exhibits and the smallest shared motion tokens required by those sequences.
- **Fixed areas:** application routes, Case File route, landing content and geometry, data, recommendations, trace/decision semantics, dependencies and all un-storyboarded landing regions.
- **Acceptance gates:** normal browser scroll remains authoritative; no fabricated progress; each stage has a static/reduced equivalent; dark/light parity at 1440px, intermediate and 390px; predictable back-scroll and rapid-scroll interruption.

## V8C — Product Workbench Interaction Motion

- **Purpose:** implement approved Workspace selection, mode, artifact-focus, inspector-projection and responsive working-layer motion, plus bounded Case File interactions where the storyboard names them.
- **Permitted areas:** `/workspace` queue/canvas/inspector state presentation, responsive selected-case surface, and `/report?demo=1` active-location, local record focus and decision-sheet ownership.
- **Fixed areas:** VC-4 desktop composition, independent pane scrolling, queue grammar, pane widths, data, persistence, recommendation/risk/decision semantics, landing choreography and route architecture.
- **Acceptance gates:** dark/light at desktop, 1024px, 768/620px and 390px; keyboard and visible-focus paths; repeated selection/mode input; filter/delete reconciliation; modal interruption, inertness and deterministic focus restoration. Unrelated planes remain static.

## V8D — Motion Tuning, Performance and Final QA

- **Purpose:** tune the approved V8B/V8C consumers as one system and give final reduced-motion, performance and interaction approval.
- **Permitted areas:** timing/easing within constitutional bands, parity corrections, observer/listener cleanup and verified implementation defects only.
- **Fixed areas:** storyboard scope, visual architecture, dependencies, product semantics, data contracts and all static regions not named by V8B/V8C.
- **Acceptance gates:** constitution gates pass; dark/light and representative desktop/mobile profiling; no layout shift; no stale state under interruption or rapid input; focus/inertness correct before, during and after motion; reduced-motion static completeness verified.
