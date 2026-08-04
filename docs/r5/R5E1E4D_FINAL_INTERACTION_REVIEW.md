# R5E.1E.4D — Final Responsive, Accessibility and Interaction-System Review

Date: 4 August 2026

Route: `/visual-lab/public-r5-reference-reconstruction`

Branch: `r5e1e4d-final-interaction-review`

## 1. Purpose

This is the final Phase 7 technical and evidence gate over the accepted Hero,
Finding and Evidence, Missing Proof, and Readiness interaction system. It adds
no scene, state, primitive, product value, route, dependency, or atmospheric
surface. Its job is to prove the assembled system responsive, accessible,
truthful, stable, restrained, and complete without motion or JavaScript, and
to make only defects demonstrated by production-browser evidence.

## 2. Accepted interaction baseline

The authoritative baseline is the Phase 7A architecture and choreography
contracts, the accepted Phase 7B and 7C implementation records, the accepted
R5E.1E.3 responsive review, and the accepted reconstruction through
R5E.1E.2D. The inventory remains exactly:

- Hero: Overview / Finding / Readiness.
- Finding and Evidence: `ev_retry_path` / `ev_no_idempotency_key`.
- Missing Proof and Requirement: choreography only.
- Readiness and Human Decision: Readiness / Decision boundary.

The accepted recordings remain in the Phase 7B and 7C review packages. They
were not reanalysed or copied.

## 3. Evidence methodology

Evidence came from an optimized production build served locally and a fresh
Chrome 150 DevTools Protocol session. The session supplied real viewport
reflow, keyboard and touch input, screenshots, accessibility-tree output,
`prefers-reduced-motion`, script disabling, forced-colours emulation,
performance entries, layout-shift observation, and computed styles. Raw JSON,
screenshots, and the human follow-up instructions are in the untracked
`R5E1E4D_FINAL_INTERACTION_REVIEW_PACKAGE`.

The required viewports were captured at 1920×1080, 1600×1000, 1440×900,
1280×800, 1024×768, 834×1112, 768×1024, 430×932, 390×844, 375×812, and
320×568. A 640×400 CSS viewport supplied browser-equivalent 200% reflow for a
1280×800 viewport. Both default and alternate states were inspected at every
width; representative alternate-state pixels and structural state records are
retained.

## 4. Responsive review

Every required width reports `scrollWidth === innerWidth`, no product-scene
scrollable descendant, one `main`, one `h1`, one selected tab per group, and
one exposed panel per group. Hero, both evidence records, Missing Proof,
Readiness/Decision boundary, all seven outcomes, Trust, the unresolved case,
handoff actions, footer, and full page length remain readable. Only the header
is sticky. There is no overlay, control collision, clipped mono text, empty
panel void, or desktop-screenshot treatment on mobile.

Final default document heights range from 5,025px at 1920–1440 desktop,
5,017px at 1280, 5,151px at 1024, 5,248px at 834, 5,330px at 768, 7,147px at
430, 7,641px at 390, 7,773px at 375, to 8,767px at 320. State changes produce
zero document-height delta at every required width after the correction in
§20.

## 5. Mobile page-length review

At 390px the final Hero scene is 1,799.30px and Readiness is 1,277.63px. At
320px they are 2,084.27px and 1,453.63px. These are close to, or shorter than,
the accepted tall-mobile reference measurements. Full-page captures show the
height is occupied by persistent canonical facts, complete panel content, the
seven genuine outcomes, provenance, and readable wrapping rather than blank
reserved space. Hiding or abbreviating that truth would be the larger defect,
so no page-shortening correction was made.

## 6. Keyboard review

The desktop order has exactly 17 sequential stops: skip link; header brand;
three header anchors; header sample-review action; two hero actions; one Hero
tab stop; one Finding/Evidence tab stop; one Readiness tab stop; two handoff
actions; footer brand; and three footer anchors. At widths below 768px it has
14 stops because the three desktop header anchors are intentionally not
displayed; no genuine action was removed from its applicable composition.

Real key input proves horizontal Left/Right and vertical Up/Down operation,
wrapping, Home, End, automatic activation, Enter and Space reactivation,
roving tabindex, forward and reverse traversal, stable focus, and immediate
matching panel exposure. One sequential stop remains in each tab group. A
post-handler event probe proves off-axis ArrowDown and PageDown remain
`defaultPrevented === false`; CDP key dispatch did not itself synthesize native
scroll, so a human browser-scroll check remains in the recording instructions.

## 7. Touch review

Genuine touch events at 390px and 320px activate every tab immediately without
scroll movement, hover dependency, text selection, double activation, or a
queued state. Rapid touch selection ends on the last target with one selected
tab and one exposed panel. Before correction, public action links measured
35px or 41px high. After correction, every visible header, hero, and handoff
action is 44px high at mobile widths; tabs were already at least 44px.

## 8. Reduced-motion review

Chrome genuinely reports `matchMedia('(prefers-reduced-motion: reduce)')` as
true. Interactive scenes start in their settled state; choreography-only
Missing Proof uses its truthful CSS-default final state. No H1–H3, E1–E4,
M1–M4, or R1–R4 movement runs. Controls remain available, selected states and
decorative traces remain visible, and the active panel has no transform.
Panel transitions compute to 0.001ms, with only hidden/inert panels retaining
their irrelevant resting offset.

Changing the preference after hydration immediately applies the forced final
CSS treatments and sets every interactive view's reduced-motion flag. The
passive Missing Proof wrapper may retain an internal `armed` data value, but
all of its choreographed regions compute to the final surface, border, rule,
and transform values and no delayed step remains visible or can hide text.

## 9. No-JavaScript review

Chrome script execution was disabled before navigation. The resulting genuine
page has zero buttons, tabs, tablists, or tabpanels; one `main`; one `h1`; no
horizontal overflow; no internal scrolling; and only native links. Hero
Overview, both evidence labels, default evidence provenance, complete Missing
Proof, default Readiness, PENDING, and all seven outcomes remain visible. The
320px capture is 8,767px high with every public action still 44px. No CSS timed
reveal occurs.

## 10. High-contrast and forced-colours review

Chrome genuinely reports `forced-colors: active`. The initial capture proved
that automatic colour mapping preserved the browser focus outline but mapped
the selected evidence rail and selected borders onto the Canvas colour. The
bounded correction uses the system `Highlight` colour for selected borders,
the horizontal selected rule, and the evidence leading rail only in forced
colours. The recapture proves the selected evidence record has a Highlight
border and visible Highlight rail, its neutral peer has neither, and a focused
selected record additionally has a 2px Highlight outline. PENDING, outcomes,
buttons, chips, and relationship boundaries remain legible.

## 11. Accessibility-tree review

The enhanced tree contains three named tablists, seven named tabs, and exactly
three exposed tabpanels. Labels are `Selected review views`, `Supporting
evidence records`, and `Readiness views`; orientations are horizontal,
vertical, and horizontal. Selection and controls relationships update with the
active key. Every inactive panel has `aria-hidden="true"` and `inert` and is
absent from the exposed tree. There is no `aria-live`, fake button, duplicate
control, focusable outcome, or focusable Missing Proof record. The page has one
`main`, one `h1`, and a sensible H1/H2/H3/H4 progression.

No claim is made for actual NVDA, JAWS, or VoiceOver use.

## 12. Manual screen-reader checklist

The review package supplies a concise NVDA checklist: confirm landmark and
heading navigation; announce each tablist name/orientation; verify selected,
position, and controlled panel names; use arrow, Home, End, Enter, and Space;
confirm only one panel is announced; confirm PENDING and all seven outcomes as
plain content; confirm Missing Proof has no control semantics; and reach the
handoff/footer links without duplicate or live announcements.

## 13. Manual interruption

Early-step and later-step production probes were run for Hero, Finding and
Evidence, and Readiness. In all six cases, manual activation immediately set
`data-motion="settled"`, authority `manual`, introduction complete, the newest
active key, one matching selected visual, and one matching exposed panel.
Waiting beyond the original sequence total never restored the automatic
default. Activating an already-selected tab also claimed manual authority and
kept the same selection.

## 14. State persistence

After all three scenes were manually changed, scrolling to the footer and
back, resizing to 390px and back to 1280px, and revisiting each scene preserved
the three independent manual selections. Reload reset them to Overview,
`ev_retry_path`, and Readiness with automatic authority. Chrome 150 did not
expose `Emulation.setPageVisibilityOverride`; the exact protocol error is
retained, so document-visibility switching remains a manual follow-up rather
than a fabricated pass.

## 15. Scroll-back behaviour

Each scene was allowed to enter and finish, then scrolled away from and back
to. Hero, Finding/Evidence, and Readiness remained settled on their canonical
automatic defaults; Missing Proof remained in its one-shot revealed state.
No meaningful text retained a transform, no sequence replayed, no earlier
selection returned, and scroll position was not changed by state activation.
Four return-state screenshots are retained.

## 16. Layout stability

A `PerformanceObserver` registered before navigation reports CLS 0 and no raw
layout-shift entries. At 1280px all scene tops, all scene heights, and the
5,017px document height are identical across all Hero, Evidence, and Readiness
states. At 320px the Finding/Evidence section remains exactly 1,922.36px and
the document exactly 8,767px across both evidence records. JavaScript-disabled
and enhanced default heights also match. No animated height, scene-plate
resize, control-row shift, hydration shift, or panel clipping remains.

## 17. Contrast

Computed contrast samples are: primary text 17.76:1, secondary text 5.12:1,
metadata 5.58:1, selected text 15.98:1, confirmed status 4.95:1, PENDING
5.33:1, outcomes 5.58:1, primary and secondary buttons 17.76:1, and footer
links 5.12:1. The #2563eb focus colour against the selected #f3f3f1 surface is
4.65:1, exceeding the 3:1 non-text requirement. Meaningful text and text-bearing parents
do not use opacity; decorative opacity remains confined to decorative rules.

## 18. Performance

The interaction TypeScript/TSX footprint is 1,020 lines / 36,872 bytes across
the eight scene, primitive, and motion files. The complete reconstruction is
16 files / 119,224 bytes before build artifacts. There are three
`"use client"` modules: `PublicHeader`, `SceneMotion`, and `PublicSceneViews`.
Using the accepted contract's accounting, there are five client boundary
surfaces: the two existing shared boundaries plus three `PublicSceneViews`
scene instances.

There is no dependency or animation library, global reducer, shared mutable
scene state, requestAnimationFrame, ResizeObserver, layout-measurement loop,
animated height, persistence, telemetry, background media, external request,
model call, or target-route API request. The scene system added no scroll
listener; the accepted pre-Phase-7 `PublicHeader` retains its small passive
hairline/active-section listener. Each scene uses its accepted one-shot
observer and each interactive scene one cleared completion timeout. Production
resource count remained stable after load and no long task was observed.

## 19. Visual and product-quality review

The retained screenshots show a coherent shared grammar: controls are local
and subordinate to the canonical scene, Finding/Evidence continues to reveal
meaningfully different provenance, Missing Proof remains clearer as a passive
relationship, and Readiness remains an authority boundary rather than a
disabled form. Mobile is long but comprehensible and visibly simpler than the
Workspace. This technical review does not self-accept final visual quality;
the review package defines the required deliberate human recording and the
questions the reviewer must answer.

## 20. Corrections made

Three corrections were supported by before/after production evidence:

1. Mobile target size: add `min-height: 44px` to existing `.btn` inside the
   existing `max-width: 767px` tier. It changes no desktop density or action.
2. 320px evidence stability: reserve a 58px three-line subtitle box for the
   second evidence record inside the existing `max-width: 359px` tier. It
   preserves the selected weight and all copy while removing the 20px state
   jump.
3. Forced colours: use system `Highlight` for selected borders and rules only
   under `forced-colors: active`, restoring non-colour-only selection geometry.

No component, state, semantic, timing, easing, distance, sequence, canonical
record, or route changed.

## 21. Product truth

The page still shows repository `example/b2b-redemption-api`, PR `#482`, title
`Add fallback handling for failed discount-code retrieval`, recommendation
`TESTS REQUIRED`, risk `46/100 · MEDIUM`, requirements `4 open · 2 blocking`,
and Human Decision `PENDING`. All seven canonical outcomes are present as
plain, unselected, non-focusable list items. No requirement clears and no
decision is recorded. The reference route makes no API, external, model, or
write request.

## 22. Browser evidence

The untracked package contains final viewport screenshots, 200% reflow,
keyboard focus, touch, reduced-motion, no-JavaScript, forced-colours,
scroll-back, correction before/after, raw DOM/state matrices, accessibility
tree, contrast, CLS, performance, and regression records. Screenshot and raw
evidence manifests distinguish preliminary/before captures from final proof.

## 23. Human recording requirements

Record a deliberate production-build pass at 1440×900 and 390×844. Show the
four one-shot introductions, early and late interruption in all three
interactive scenes, already-active reactivation, rapid keyboard and touch
selection, scroll-away/return persistence, reload reset, visible focus,
reduced motion, forced colours, and JavaScript-disabled truth. The reviewer
must explicitly judge restraint, scene value, mobile length, handoff clarity,
and whether the interaction grammar remains simpler than the Workspace.

## 24. Remaining open gates

- Human final visual/motion/coherence recording and explicit acceptance.
- Manual NVDA pass; no desktop screen reader was available to this session.
- Manual document-visibility switch and native browser page-scroll-key check,
  because the available CDP methods could not genuinely exercise those two
  browser behaviors.

Reduced motion, JavaScript-disabled rendering, forced colours, responsive
geometry, keyboard semantics, touch activation, accessibility-tree structure,
contrast, layout stability, performance, and route regression gates have
genuine technical evidence.

## 25. Protected scope

Only the reference reconstruction CSS, this new milestone document,
`docs/r5/README.md`, and the new untracked Phase 7D package were changed.
Production `/`, accepted private public routes, frozen R4, dependencies,
lockfiles, canonical fixture behavior, public scene assets, Phase 7A–C
documents, and previous review packages remain untouched. Nothing was staged,
committed, pushed, or merged.

## Human acceptance and Phase 7 closeout

R5E.1E.4D received final human visual, interaction, responsive and
accessibility acceptance on 5 August 2026.

The accepted desktop recording was approximately 50.1 seconds at
1920 � 1140 and demonstrated the complete reference-led public route from the
Hero through the unresolved-case handoff.

The human review confirmed:

1. Hero Overview, Finding and Readiness remain distinct, truthful inspection
   views of the same selected PR.
2. Finding and Evidence continues to provide meaningful inspection depth across
   the two genuine evidence records.
3. Missing Proof and Requirement remains clearer as a choreography-only
   relationship.
4. Readiness and Decision boundary remain distinct advisory and authority
   contexts.
5. Human Decision PENDING remains visible and unchanged.
6. All seven genuine decision outcomes remain visible, unselected and
   non-interactive.
7. Automatic choreography remains local to each default state.
8. Automatic choreography never changes an active interaction state.
9. Manual visitor intent remains authoritative.
10. Manual state persists through scroll-back, resize and section navigation.
11. Reload restores each canonical default state.
12. Every scene remains independent.
13. Product-scene dimensions remain stable.
14. Motion remains calm, legible and subordinate to product meaning.
15. The homepage remains visibly simpler than the complete Workspace.
16. The genuine sample-review action remains a clear handoff into the product.
17. The mobile experience remains long but intentional, truthful and
    comprehensible rather than padded with empty reserved space.
18. The mobile header, scene controls and handoff actions provide accepted
    touch-target dimensions.
19. Reduced-motion behaviour renders complete settled states while preserving
    interaction.
20. The JavaScript-disabled experience remains complete and truthful without
    fake controls.
21. Forced-colours treatment preserves selected and focused states.
22. Meaningful text remains at accessible contrast throughout the scene
    lifecycle.
23. No internal product-scene scrolling, horizontal overflow, page overlay or
    pinned product narrative has been introduced.
24. Canonical PR #482 product truth remains unchanged.

The following manual follow-up checks were also completed and accepted:

1. mobile route review;
2. NVDA checklist;
3. document-visibility return behaviour;
4. native browser page-scroll-key behaviour while scene controls are focused.

The final accepted Phase 7 public interaction system is:

Hero:
Overview / Finding / Readiness

Finding and Evidence:
ev_retry_path / ev_no_idempotency_key

Missing Proof and Requirement:
choreography only

Readiness and Human Decision:
Readiness / Decision boundary

Phase 7 is accepted and closed.

The next milestone is R5E.1E.5A: Surface Hierarchy and Visual-Direction
Contract.
