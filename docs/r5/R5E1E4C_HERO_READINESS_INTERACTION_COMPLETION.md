# R5E.1E.4C — Hero and Readiness Interaction Completion

Date: 4 August 2026  
Branch: `r5e1e4c-hero-readiness-interaction-completion`  
Status: implementation and technical evidence complete; deliberate human recordings and human visual/motion acceptance remain required.

## 1. Purpose

This bounded Phase 7C gate completes the accepted public interaction set at the private reference-reconstruction route. It adds the locked Hero and Readiness manual views, completes their choreography, and gives the non-interactive Missing Proof scene its accepted relationship choreography. It does not transfer anything to production.

## 2. Authoritative contracts

Implementation follows `R5E1E4A_PREMIUM_INTERACTION_ARCHITECTURE_CONTRACT.md`, `R5E1E4A2_MOTION_CHOREOGRAPHY_CONTRACT.md`, the accepted Phase 7B milestone, the responsive and fidelity reviews, and the named Phase 7A/7A.2 package handoffs. Those contracts remain unchanged.

## 3. Implementation scope

Only `app/_public-r5-reference-reconstruction/` is changed for product code. Hero gains Overview/Finding/Readiness views. Readiness gains Readiness/Decision boundary views. Missing Proof remains static but receives M1–M4 choreography. Finding and Evidence is behaviorally preserved, with only the static-control presentation opt-in needed by the reused primitive.

## 4. Primitive reuse

Phase 7C reuses `PublicSceneViews`, `PublicSceneTab`, `PublicScenePanel`, and `SceneMotion`. No fourth public interaction primitive, provider, reducer, global store, URL state, persistent state, or generic animation abstraction was introduced. `PublicSceneViews` gained two bounded presentation seams: a static-control mode needed to preserve Phase 7B’s two readable server-rendered records, and a trailing region used for Readiness outcomes that must remain visible for both panels.

`PublicScenePanel` keeps inactive panels inert and `aria-hidden`. All panels use `tabIndex=-1`, leaving focus on the activating tab and producing the accepted 17-stop page walk, with each tab group acting as one stop.

## 5. Hero states

The Hero state keys are exactly `overview`, `finding`, and `readiness`, with `overview` as the default. Persistent chrome contains repository, PR, title, branch, head, recommendation, risk, requirements, Human Decision, and inert queue context.

- Overview: canonical next inspection, three reviewer-focus items, and evidence boundary.
- Finding: canonical primary finding, provenance, source, inspection action, related requirement, and one genuine affected-file row.
- Readiness: canonical readiness note, proof counts, staleness, prior decision, and the authority statement.

Switching view changes inspection focus only. It does not change a product value or perform work.

## 6. Hero interaction semantics

The enhanced Hero uses one horizontal tablist with three native buttons, automatic activation, roving tabindex, Left/Right Arrow wrapping, Home/End, Enter/Space reactivation, pointer and touch activation, and additive focus/selection styling. Exactly one tab is selected and exactly one panel is exposed at a time. Focus never moves into a panel.

## 7. Hero progressive enhancement

The server emits a complete Overview scene, a plain `Overview` label, all persistent facts, and no non-working tab controls. The first client render matches that markup. After hydration the label row becomes the tablist without changing the reserved control or panel grid dimensions.

## 8. Hero choreography

H1–H3 use the accepted desktop schedule and total:

| Step | Subject | Start | Duration |
| --- | --- | ---: | ---: |
| H1 | Next inspection container | 760ms | 420ms |
| H2 | Reviewer-focus container | 2,400ms | 300ms |
| H3 | Evidence-boundary container | 3,920ms | 380ms |

Desktop total is 4,300ms. Mobile starts are 570/1,905/3,120ms with the accepted 3,500ms total. Meaningful text stays at opacity 1. Only surfaces, borders, rules, and the accepted 8px/4px local translation participate.

## 9. Hero manual interruption

Any activation, including reactivating the current tab, sets local authority to manual, marks the introduction complete, changes `data-motion` to settled, cancels the completion timer through effect cleanup, and prevents automatic work from returning. The selected view updates immediately; all choreography transitions use the accepted zero-delay 300ms settlement.

## 10. Readiness states

The Readiness keys are exactly `readiness` and `decision-boundary`, with `readiness` as the default. Recommendation, risk, requirements and Human Decision PENDING are persistent. The seven canonical decision outcomes remain visible, ordered, unselected, inert and non-focusable in both views.

- Readiness: the exact 2 blocking / 2 missing or unverified / 1 stale breakdown and canonical explanatory note.
- Decision boundary: the canonical absence of a recorded Human Decision, current head and branch, authority statement, and confirmation that no outcome is selected from the recommendation.

## 11. Readiness interaction semantics

The enhanced scene uses one horizontal two-tab group with the same native-button, roving-tabindex, automatic-activation, wrapping, Home/End, reactivation, pointer, touch, focus, selection, and panel-exclusion rules as Hero. Outcome labels are not controls and do not enter the keyboard order.

## 12. Readiness progressive enhancement

The server renders the complete Readiness state, a plain `Readiness` label, PENDING, persistent canonical facts and all seven outcomes. It emits no fake decision controls. Hydration replaces only the reserved label row with tabs.

## 13. Readiness choreography

R1–R4 use the accepted desktop schedule:

| Step | Subject | Start | Duration |
| --- | --- | ---: | ---: |
| R1 | Readiness-breakdown container | 760ms | 420ms |
| R2 | Readiness-note container | 2,160ms | 300ms |
| R3 | Human Decision container | 3,680ms | 380ms |
| R4 | Outcome-preview container | 5,040ms | 380ms |

Desktop total is 5,420ms. Mobile starts are 570/1,725/2,940/4,055ms with a 4,435ms total. PENDING and outcome text do not move, fade, recolor, or change weight; their containers receive the emphasis.

## 14. Readiness manual interruption

Manual activation immediately changes the semantic panel and local authority, cancels the pending timer, and settles R1–R4 through the accepted 300ms transition. Repeated activation is not queued; the newest state owns selected styling, roving tabindex and the exposed panel. Later timer observation proved that the automatic sequence does not resume.

## 15. Missing Proof choreography

Missing Proof remains non-interactive. M1 establishes the missing-proof record at 760ms, M2 connects it at 2,160ms, M3 establishes the blocking requirement at 3,300ms, and M4 establishes the consequence at 4,440ms, completing at 4,820ms. Mobile uses 570/1,725/2,675/3,625ms and completes at 4,005ms. Canonical text is fully readable from first paint; only the decorative relationship rule may begin absent.

## 16. Shared panel transitions

The semantic active panel changes synchronously. Panels share one CSS grid cell, inactive panels are inert and hidden from accessibility APIs, and no height or whole-scene opacity is animated. Focus remains on the tab. Manual state settles through the existing 300ms local transition; rapid selection has no obsolete transition queue.

## 17. Responsive behaviour

Production-browser assertions covered 1920×1080, 1600×1000, 1440×900, 1280×800, 1024×768, 834×1112, 768×1024, 430×932, 390×844, 375×812, 320×568, and the 640×400 emulated-200%-layout equivalent. Every tested layout had zero horizontal overflow and zero internal scene scroll regions. Hero and Readiness scene heights were identical across their states at every size. At narrow sizes controls become full-width vertical rows without changing tab semantics; measured targets are approximately 44px. The canonical Hero source path wraps inside its card.

## 18. Reduced motion

The accepted `matchMedia('(prefers-reduced-motion: reduce)')` mechanism remains live after hydration. When matched it sets enhancement, reduced-motion and introduction-complete together; `SceneMotion` never arms, and the CSS media query removes spatial/temporal transitions while retaining interaction and full-contrast settled styling. The available in-app browser exposes viewport and visibility controls but no media-emulation control, so an actual preference-on browser capture remains open. A clearly labelled settled interactive equivalent was captured; it is not represented as a genuine media override.

## 19. No-JavaScript behaviour

A production SSR response was captured, all script tags were removed, and that exact markup was served locally with production CSS. It contained zero scripts, zero tabs, zero scene buttons and zero `data-motion` attributes; it retained one main, one H1, the Hero Overview label/state, the accepted Phase 7B static evidence records, the complete Missing Proof relationship, Readiness, PENDING and all seven outcomes. No horizontal overflow was present.

## 20. Accessibility

Production DOM assertions found three tablists with the correct axes, one selected tab and one tabindex-0 tab in each, linked `aria-controls`/`aria-labelledby` panels, inactive panels both inert and `aria-hidden`, no live regions, no focusable outcome descendants, and a 17-element sequential focus set. Meaningful text computed to opacity 1. Keyboard proof covers axis keys, wrapping, Home, End, Enter, Space and latest-intent activation. Focus styling is additive to non-colour-only selected styling.

## 21. Layout stability

Hero and Readiness reserve their control rows and panel grid cells before hydration. Browser measurements showed exact within-viewport equality between every Hero view and between both Readiness views at every matrix size. PENDING and outcome strings are persistent and their choreography does not alter text bounds. No internal scrollbar or large state-change jump was observed.

## 22. Performance

There is one intersection observer per scene, disconnected after entry, one completion timeout per interactive scene, and no requestAnimationFrame, scroll listener, ResizeObserver, keyframe loop, animation library, dependency, global provider, network request, model call, or external write. Motion is CSS-transition based and limited to existing boxes.

## 23. Product truth

All review values are imported from the frozen canonical source. PR #482 remains `Tests required`, 46/100 MEDIUM, 4 open / 2 blocking, and Human Decision PENDING. Views do not clear requirements, pick outcomes, change recommendations, mutate review data, simulate loading, or call a model. The authority statement remains “Lintel recommends. The engineer decides.”

## 24. Browser evidence

The untracked `R5E1E4C_HERO_READINESS_REVIEW_PACKAGE/` contains genuine production-build screenshots and structural assertions for the required Hero, Readiness, Missing Proof, responsive and no-JavaScript states. Console inspection returned no warnings or errors. Screenshots are technical evidence only; they do not self-accept product, visual or motion quality.

## 25. Repository validation

TypeScript and production build passed during implementation. Final validation records the exact command results, protected-scope diffs, branch, staging state, dependency state, generated-file hash restoration, route responses, and server shutdown in the review package.

## 26. Remaining questions

1. A deliberate human Hero interaction/motion recording is still required.
2. A deliberate human Readiness interaction/motion recording is still required.
3. Human visual and motion acceptance remains outside this implementation gate.
4. A genuine browser capture with `prefers-reduced-motion: reduce` remains required because the available browser controller cannot emulate media preferences.

## 27. Protected scope

No production homepage, route wrapper, accepted private route, frozen R4 product, canonical fixture behavior, dependency, lockfile, image asset, Phase 7A contract, Phase 7B milestone, or prior evidence package was modified. No file was staged, committed, pushed or merged.

## Human visual and motion acceptance and Phase 7C closeout

R5E.1E.4C received human visual, interaction and motion acceptance on
4 August 2026.

The accepted recording was approximately 70.7 seconds at 1920 � 1140 and
demonstrated:

1. the Hero Overview default state;
2. Hero Finding and Readiness inspection states;
3. manual Hero state switching;
4. the accepted Finding and Evidence interaction;
5. Missing Proof and Requirement choreography;
6. Readiness and Decision boundary inspection states;
7. manual Readiness state switching;
8. the unresolved-case handoff;
9. the genuine transition into the complete sample review.

The review confirmed:

1. Hero choreography remains within the default Overview state.
2. Automatic motion does not switch Hero views.
3. Overview, Finding and Readiness communicate distinct canonical inspection
   contexts.
4. Manual Hero selection becomes authoritative and automatic behaviour does not
   reclaim the scene.
5. Finding and Evidence retains its accepted Phase 7B interaction and product
   value.
6. Missing Proof and Requirement remains non-interactive and clearly
   communicates one blocking relationship.
7. Readiness choreography remains within the default Readiness state.
8. Automatic motion does not switch to Decision boundary.
9. Readiness and Decision boundary communicate distinct advisory and authority
   contexts.
10. Human Decision PENDING remains persistent.
11. All seven genuine decision outcomes remain visible, unselected and
    non-interactive.
12. Motion remains local, restrained and subordinate to product meaning.
13. No full scene replacement, page pinning, internal scrolling or global
    product state has been introduced.
14. Selection, keyboard focus and exposed panel state remain aligned.
15. No automatic sequence resumes after manual authority is claimed.
16. The public experience remains simpler than the complete Workspace.
17. The genuine sample-review action provides a clear handoff into the complete
    product.
18. Repository, PR, recommendation, risk, requirements and Human Decision truth
    remain unchanged.
19. No analysis execution, model activity, loading, repository connection,
    external write or completed decision is simulated.
20. Atmospheric surface work remains outside Phase 7C.

The accepted interactive public scenes are now:

Hero:
Overview / Finding / Readiness

Finding and Evidence:
ev_retry_path / ev_no_idempotency_key

Readiness and Human Decision:
Readiness / Decision boundary

Missing Proof and Requirement remains choreography-only.

The final responsive, accessibility, reduced-motion, no-JavaScript,
high-contrast and interaction-system review remains R5E.1E.4D.

R5E.1E.4C is accepted and closed.
