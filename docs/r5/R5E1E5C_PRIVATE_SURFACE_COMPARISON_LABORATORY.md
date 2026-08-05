# R5E.1E.5C — Private Surface Comparison Laboratory

Status: **ACCEPTED AND COMPLETE.**

## Purpose and status

Phase 7.1C places the four Gate 1 configurations around the unchanged accepted Hero so that live choreography can be compared without changing product truth, interaction, or any production-facing route. The route family is private, unlinked, and non-production-facing. At the implementation-evidence checkpoint, this record did not yet select or approve a final visual direction; the accepted closeout disposition is recorded below without rewriting that historical implementation evidence.

Gate 1 remains authoritative: extended neutral is the leading result; the accepted 26px neutral plate is the control; B2 is experimental, private and non-shippable; C2 is conditional and not selected; no tall derivative or Readiness companion is authorised; and presentation-band dimensions are not frozen.

The implementation preflight found the complete Phase 7.1B package and its bounded README entry in the working tree, but no Phase 7.1B commit in `git log --all`. The branch then started at `02a1fd8`, the Phase 7.1A merge. Phase 7.1C used the supplied accepted Phase 7.1B disposition and local authoritative package without rewriting history or staging either pre-existing Phase 7.1B file. That historical gate is now resolved: commit `fd5d7a3` (`docs(public): close surface candidate exploration`) is present and is the current branch head at this closeout.

## Four configurations and private routes

The index is `/visual-lab/public-r5-surface-comparison`. Four genuine, isolated routes prevent duplicate tab IDs, duplicate choreography authorities, state coupling, unequal scenes, and an in-scene switching pattern:

- `/visual-lab/public-r5-surface-comparison/neutral-26`
- `/visual-lab/public-r5-surface-comparison/neutral-extended`
- `/visual-lab/public-r5-surface-comparison/b2-diagnostic`
- `/visual-lab/public-r5-surface-comparison/c2-diagnostic`

The index explains status and review order without acting as marketing. No production navigation, accepted visual-lab route, Workspace route, or accepted reconstruction links to this family. Each isolated route has the same normal-flow laboratory strip outside the accepted experience.

## Asset handling

Only the retained wide masters were copied into route-local `assets/`. B2's source and copy are 7,987 bytes with SHA-256 `f248bc96a29883480a54977438a7876e0b1704c98563c57309aa3bc8acab0bba`. C2's source and copy are 7,223 bytes with SHA-256 `2b158d81ea58f220fd02f5b67457501719e98ba79d997ad82191c0ccebeb918b`. Both comparisons are byte-for-byte equal. No rejected master, tall master, Readiness companion, AVIF, WebP, or file under `public/` was added.

## Hero reuse and product truth

`SurfaceComparisonVariant` imports `R5ReferenceReconstruction` as one unchanged component and adds only an external status strip and outer-presentation CSS. There was no extraction and no accepted reconstruction file changed. The Hero copy, actions, repository, PR #482 and title, recommendation, risk, requirements, Human Decision PENDING, Overview/Finding/Readiness controls, H1–H3 choreography, manual authority, keyboard behaviour, reduced-motion branch, no-JavaScript fallback, typography, spacing, opaque white product surface, frame dimensions, radius, and border all remain owned by the accepted implementation.

All four routes retain `example/b2b-redemption-api`, `PR #482`, `Add fallback handling for failed discount-code retrieval`, `Tests required`, `46/100 · MEDIUM`, `4 open · 2 blocking`, and one `PENDING` Human Decision result.

## Presentation-band geometry and surfaces

The extended variants share one geometry and centered `cover` rule. Their laboratory bands are 88/56/64px at ≥1440px, 80/48/56px at 1280–1439px, 72/40/48px at 1025–1279px, 64/32/40px at 768–1024px, and 56/20/40px at 360–767px. The values include the accepted inner inset; CSS extends outward only by the difference. Below 360px, every configuration returns to the accepted S1 neutral plate and makes no diagnostic asset visible. Values remain laboratory-only.

Neutral 26 preserves the existing plate. Extended neutral uses the same `#fafaf9` neutral without an asset. B2 and C2 use the exact private SVGs as static centered backgrounds with `cover`; neither gets a candidate-specific crop or spacing adjustment. All meaningful text stays on opaque white.

## Live interaction and layout

At a genuine 1440×900 CSS viewport every route rendered the same 1182.18×632.59 product frame at x=120.07, y=547.27; the accepted plate remained 1236.02×686.42 at x=93.15, y=520.35; the product section was 972.66px and the document 5,203px. At 390×844 every route rendered the same 306.25×1630.71 frame at x=32.92, y=718.34; the plate was 332.09×1656.56 at x=20, y=705.42; the status strip was 211.99px and the document 8,033px.

Automatic H1–H3 progression settled normally. Reactivating Overview, selecting Finding twice, Arrow Right, Home, End, scrolling away and back, and reload reset preserved automatic/manual authority, roving focus, state persistence, and reset behaviour in all routes. Sampled geometry remained identical across Overview, Finding and Readiness at desktop and mobile. No candidate changes choreography, so live motion adds no candidate-specific behaviour. Human comparison recording remains required.

## Responsive and mobile review

The required matrix was exercised at 1920×1080, 1600×1000, 1440×900, 1280×800, 1024×768, 834×1112, 768×1024, 430×932, 390×844, 375×812, 320×568, and a 640×400 equivalent reflow check. No tested route had horizontal overflow, an internal scene scroller, clipped product content, candidate-specific frame movement, state-driven scene-height change, or clipped product content. A fixed-height normal-flow status strip at compact tiers removed label-wrap differences from comparison geometry.

At 390px the extended band remains contained and proportionate. B2 and C2 honestly crop the 3000×1600 wide masters with the same centered `cover` rule and degrade toward broad, relatively flat colour fields. No tall source or rescue crop was introduced. At 320px all variants use S1 neutral.

## Accessibility, reduced motion, and forced colours

Each isolated route has one `main`, one H1, the unchanged seven accepted tabs, the same focus order and roving tab indices, no live region, and no diagnostic image, SVG, `img`, or `role="img"` node in the accessibility structure. Status links have explicit names and 44px compact targets. Diagnostic surfaces are CSS decoration only.

The accepted reduced-motion implementation is reused; the surface is always static. In forced colours, private CSS removes diagnostic images, uses Canvas for the presentation surface, and retains CanvasText boundaries. The selected in-app Browser exposes neither reduced-motion nor forced-colours emulation, so no special-state screenshot is claimed. Those captures remain open rather than fabricated.

## No JavaScript and missing-asset fallback

Server-rendered HTML retains genuine index links, one main, one H1, canonical content, and the accepted static state. The accepted component owns its no-JavaScript handling; B2/C2 remain CSS decoration. The selected Browser cannot disable JavaScript, so genuine no-JavaScript screenshots remain an open gate.

For a bounded missing-asset test, only the emitted B2 file under `.next` was temporarily moved. A fresh page returned neutral `rgb(250, 250, 249)` paint, no `img` or broken-image node, one main/H1, complete product truth, unchanged geometry, no overflow, and no console log. The emitted asset was restored and re-hashed; source and route-local copies were never modified.

## Performance and stability

| Variant | Resources | Image requests | Total local response bytes | Surface bytes |
| --- | ---: | ---: | ---: | ---: |
| neutral-26 | 15 | 0 | 1,050,669 | 0 |
| neutral-extended | 15 | 0 | 1,050,871 | 0 |
| b2-diagnostic | 16 | 1 | 1,058,812 | 7,987 |
| c2-diagnostic | 16 | 1 | 1,058,042 | 7,223 |

Every resource was same-origin. There is no runtime transformation, video, animation library, product delay, surface-driven measurement, model call, or external write. Console logs contained no error or hydration warning. SVG view boxes are 3000×1600. The Browser did not expose long-task or CLS instrumentation; stability is evidenced by invariant sampled rectangles before/after hydration and through every Hero state, not by a fabricated numeric result.

## Findings, risks, human review, and open gates

The surfaces remain visually distinguishable while product and choreography remain identical. The surface is static, so interaction creates no new B2/C2 behaviour. Mobile degradation remains visible. At the implementation-evidence checkpoint, the evidence produced no interaction-specific reason to overturn the static-board conclusion, but only the later human evaluation could close that question. No final visual winner was recorded at that checkpoint.

Risks carried forward at that checkpoint were: B2 remained barred from shipment without the atmospheric-imagery amendment; C2 remained conditional/not selected; dimensions were unfrozen; Readiness had no companion; no tall source was authorised; special-state screenshots and the desktop/mobile human recording remained open; and the Phase 7.1B history mismatch required separate reconciliation. The disposition below closes or reclassifies those items.

The implementation-stage review method required separate tabs at 1440×900/100%, a reload of each route, completion of H1–H3, one use each of Finding and Readiness, comparison in control → extended neutral → B2 → C2 order, and a repeat at 390×844 without hiding mobile degradation. The human owner, not the laboratory implementation and not Cowork, decided the final direction.

Protected application, accepted reconstruction, accepted visual-lab, Workspace, R4, Phase 7, Phase 7.1A/B, `public/`, dependency, lockfile and launch files were not modified. Nothing is staged, committed, pushed, or merged. Phase 8 has not started. At the implementation-evidence checkpoint the remaining gates were the special-state captures, deliberate recording, human visual/accessibility acceptance, history reconciliation, and any later production freeze/adoption decision.

## Accepted closeout disposition

Phase 7.1C is **ACCEPTED AND COMPLETE** as a laboratory implementation and live-comparison milestone. This acceptance means that the private index and four isolated routes correctly implemented the bounded experiment, preserved the accepted Hero, and produced sufficient genuine evidence for the later human decision. It does not itself propagate a surface to the accepted reconstruction or production homepage.

The four completed live variants were:

1. Neutral 26 — the accepted Phase 7 control, now retained as a historical control only;
2. Extended neutral — the accepted neutral paint at the provisional extended laboratory band;
3. B2 diagnostic — the retained wide cool-slate master, always labelled `EXPERIMENTAL — PRIVATE — NON-SHIPPABLE`;
4. C2 diagnostic — the retained wide warm structural master, shown only as a conditional diagnostic.

Desktop live comparison and the complete responsive comparison were completed. The exercised matrix covered desktop, tablet, mobile and 200% equivalent reflow conditions; it preserved identical product-frame geometry, accepted interaction, H1–H3 choreography, tabs, keyboard behaviour, state persistence, reset behaviour and frame behaviour in every variant. The surface remained static throughout. Live motion did not reverse Gate 1: it supplied no candidate-specific behaviour, meaning or compositional advantage.

The visual winner is **extended neutral**. The decision is based on the full live composition, not on colour preference. Extended neutral creates the strongest hierarchy by giving the accepted product interface generous, deliberate staging while preserving interface dominance and the white editorial canvas. The production lesson taken from Cursor is product staging, spacing and product scale, not literal imagery.

B2 is formally retired and retained only as `EXPERIMENTAL — PRIVATE — NON-SHIPPABLE` diagnostic evidence. C2 is formally retired and retained only as conditional diagnostic evidence. Neither image treatment proceeds. No further surface candidate generation is justified; no tall or mobile image derivative, AVIF/WebP family, or Readiness companion is authorised. Readiness remains neutral.

## Evidence classification and remaining risk

Genuine reduced-motion, no-JavaScript and forced-colours screenshots were not captured, and this record does not claim otherwise. Their absence is non-blocking for the Phase 7.1C private diagnostic decision because the route family is private and unlinked, no candidate image proceeds, the accepted interaction system already passed these states, the laboratory adds no animation, the candidate surfaces are decorative CSS, and Codex validated server-rendered content plus forced-colours neutralisation.

This classification is not a production waiver. Before Phase 7.1E can be accepted, the propagated implementation must pass genuine reduced-motion, no-JavaScript, forced-colours, keyboard, mobile and 200% zoom validation. Current presentation-band dimensions remain provisional. Phase 7.1E may perform only bounded responsive band tuning from the laboratory values; final dimensional freeze belongs to Phase 7.1F.

## Phase 7.1E handoff

The next milestone is **R5E.1E.5E — Accepted Surface Hierarchy Propagation**. Its bounded direction is:

1. propagate extended neutral to the accepted Hero presentation;
2. preserve the white editorial canvas;
3. preserve the opaque white product frame;
4. preserve all accepted Hero content and behaviour;
5. keep Finding and Evidence neutral;
6. keep Missing Proof and Requirement neutral;
7. keep Readiness neutral;
8. add no image asset;
9. add no background animation;
10. add no derivative family;
11. use current laboratory dimensions as starting values only;
12. permit only bounded responsive band tuning;
13. do not begin cross-route Phase 8 work;
14. do not redesign navigation;
15. do not modify frozen Workspace behaviour.

Phase 7.1E is later production propagation, distinct from both Phase 7.1C laboratory implementation acceptance and Phase 7.1D visual winner selection. It is not implemented by this closeout.

## Closeout protected scope

This documentation closeout changes no application code, CSS, route, SVG asset, dependency, interaction behaviour, responsive geometry or accepted product content. It changes no accepted reference reconstruction, production homepage, existing visual-lab route, Workspace route, `lib/`, `public/`, package manifest, lockfile, launch configuration, accepted Phase 7 document, or accepted Phase 7.1A/7.1B document. The Phase 7.1C route implementation and diagnostic SVGs remain unchanged and untracked; the evidence package remains untracked. Nothing is staged, committed, pushed, merged or switched.
