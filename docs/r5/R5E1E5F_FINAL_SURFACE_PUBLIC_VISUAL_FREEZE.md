# R5E.1E.5F — Final Surface and Public Visual Freeze

**Status: ACCEPTED AND COMPLETE**

**Branch:** `r5e1e5f-final-surface-public-visual-freeze`

## 1. Purpose

Phase 7.1F records the final freeze of the accepted Phase 7.1 public
surface system. It closes the documentation loop from controlled surface
exploration through Extended Neutral propagation. It does not redesign or
reimplement the page, change navigation, content, interaction, Workspace, or
production `/`, and it does not begin Phase 8.

The human owner has explicitly accepted this freeze. Phase 7.1F is **ACCEPTED
AND COMPLETE**, Phase 7.1 is formally closed, and this record is binding.

## 2. Accepted history

1. Phase 7.1A established the surface hierarchy and authorised controlled
   private experimentation.
2. Phase 7.1B generated and evaluated neutral, atmospheric, and structural
   candidates.
3. Phase 7.1C compared Neutral 26, Extended Neutral, B2, and C2 as live private
   variants.
4. Phase 7.1D combined human judgment with independent Cowork review.
5. Extended Neutral scored 72/75 and was selected; Neutral 26 remained the
   historical control.
6. B2 and C2 were retired as diagnostic evidence and no image treatment
   proceeded.
7. Phase 7.1E propagated Extended Neutral and passed human, responsive,
   interaction, accessibility, fallback, and performance review with zero
   bounded correction required.

No accepted decision is reopened by this freeze.

## 3. Evidence basis

The evidence basis is the accepted Phase 7 and Phase 7.1A–E documentation, the
accepted implementation under `app/_public-r5-reference-reconstruction/`, the
accepted private route `/visual-lab/public-r5-reference-reconstruction`, the
historical private comparison laboratory, and the accepted untracked Phase
7.1E propagation package. Phase 7.1E supplies genuine desktop, tablet, mobile,
compact-fallback, reduced-motion, no-JavaScript, forced-colours, keyboard,
200%-equivalent reflow, accessibility, resource, and layout-stability evidence.
No recording, screenshot, candidate, or asset was regenerated for this phase.

## 4. Frozen Hero hierarchy

The public Hero hierarchy is frozen as:

1. white editorial page canvas;
2. Extended Neutral presentation band;
3. opaque white product frame.

The Hero is the strongest staged product scene. The band surrounds only the
Hero product scene; Hero copy and actions stay on the white editorial canvas.
The product frame remains dominant. Both band and frame are opaque. The band
has no semantic meaning, is neither illustration nor information surface,
does not enter the accessibility tree, uses normal document flow, creates no
internal scroll, does not animate, and requires no runtime asset. It must not
become a generic cross-route decorative container without explicit Phase 8
justification.

## 5. Frozen dimension matrix

Values are the visible space from the product-frame edge to the outer band
edge:

| Viewport width | Top | Left/right | Bottom | Treatment |
| --- | ---: | ---: | ---: | --- |
| At least 1440px | 88px | 56px | 64px | Extended Neutral |
| 1280–1439px | 80px | 48px | 56px | Extended Neutral |
| 1025–1279px | 72px | 40px | 48px | Extended Neutral |
| 768–1024px | 64px | 32px | 40px | Extended Neutral |
| 360–767px | 56px | 20px | 40px | Extended Neutral |
| Below 360px | 12px | 12px | 12px | Compact neutral fallback |

These values are final and no longer provisional. Phase 8 may
reuse the frozen Hero primitive, define separate route-specific product-scene
dimensions, and create other approved presentation primitives. It may not
silently alter this Hero matrix.

## 6. Frozen colour and border rules

The editorial canvas is white. The exact accepted presentation-band selector
is `.extendedNeutralHierarchy .heroSceneSection .scenePlate::before`; its
`background` is `var(--pub-surface-2)`, defined on `.page` as `#fafaf9`. Its
restrained border is `var(--pub-border)`, defined as `#e1e1de`.

The product-frame selector is `.sceneFrame`; its opaque background is
`var(--prod-surface)`, defined as `#ffffff`, and its restrained neutral border
is `1px solid var(--prod-border)`, with `--prod-border: #dededc`. No new token
is introduced by this phase.

## 7. Material and asset policy

The Hero permits no translucent frame, glass, backdrop blur, gradient, glow,
heavy shadow, image, video, grain, procedural texture, decorative noise, or
animated background. The presentation band is opaque CSS paint and the frame
is opaque white. The Hero has zero runtime surface assets.

## 8. Downstream surface hierarchy

Finding and Evidence remains neutral and technical. Missing Proof and
Requirement remains neutral. Readiness and Human Decision remains neutral and
receives no companion image or extended decorative surface. Trust, handoff,
and footer remain on the white editorial canvas. Navigation stays independent
from Hero staging. No full-width coloured or dark section is introduced, and
all public scenes remain in normal document flow. Phase 8 may define
route-specific composition while preserving this accepted homepage hierarchy.

## 9. Interaction freeze

The accepted Hero controls remain Overview / Finding / Readiness. The bounded,
one-shot H1–H3 automatic sequence remains; manual visitor intent becomes and
stays authoritative. Automatic behaviour never reclaims authority after
interaction. Selected-state reactivation, Arrow keys, Home, End, visible
focus, reload reset to the accepted initial state, and scroll-away/return
preservation of manual intent remain required. There is no scroll-controlled
global state, sticky product Workspace, background surface motion, fake
analysis execution, or decorative interaction. Phase 8 may reuse these
principles but may not silently modify the accepted Hero choreography.

## 10. Accessibility freeze

The band stays decorative, absent from the accessibility tree, and never
carries information. The accepted heading structure, tab semantics, truthful
states, focus treatment, readable product content, and opaque frame remain
binding. Any Phase 8 reuse must regress accessibility explicitly, not infer it
from visual similarity.

## 11. No-JavaScript freeze

Without JavaScript the server-rendered Hero, navigation, actions, and canonical
facts remain complete. The static product state remains truthful and exposes
no fake controls. Extended Neutral remains through CSS, with no layout collapse
or missing canonical fact.

## 12. Reduced-motion freeze

Reduced motion presents a settled complete state with no required automatic
motion or content loss. Manual controls remain truthful and the surface stays
static.

## 13. Forced-colours freeze

The presentation band resolves to `Canvas`; boundaries use system colours;
the product frame remains distinguishable; focus remains visible; and content
remains readable. The decorative surface is not load-bearing.

## 14. Keyboard freeze

Logical focus order, visible focus, Tab and reverse-Tab, Arrow keys, Home, End,
and Enter/Space where applicable remain required. Manual authority must be
preserved throughout keyboard use.

## 15. Responsive and compact-fallback freeze

The accepted system permits no horizontal overflow, internal scene scrolling,
clipped product frame or actions, or state-dependent frame movement. Below
360px it uses the 12px compact fallback. At 200% zoom-equivalent reflow the
page remains understandable and complete.

## 16. Performance freeze

The Hero surface budget is: zero image requests; zero external requests; zero
runtime surface transformation; zero background video; zero background
animation library; zero layout-measurement script; zero model call; zero
surface-driven hydration dependency; no product delay caused by presentation;
and no layout shift caused by the neutral band.

Phase 7.1E measured a cache-disabled production navigation in Chrome 150 at 16
route resources and 327,025 transferred bytes, with zero surface and external
requests, and recorded no layout-shift or long-task entry in the bounded
instrumented window. The CSS module increase attributable to propagation was
3,054 bytes. This context is accepted evidence, not a site-wide Phase 8 budget.

## 17. Product-truth boundaries

The freeze preserves repository `example/b2b-redemption-api`, PR `#482`, title
`Add fallback handling for failed discount-code retrieval`, recommendation
`Tests required`, risk `46/100 · MEDIUM`, requirements `4 open · 2 blocking`,
Human Decision `PENDING`, and all seven genuine unselected outcomes. Surface
presentation cannot alter canonical data, infer clearance, fake analysis,
select a human outcome, or modify the logged-in Workspace.

## 18. Image-lock reconciliation

The Phase 7.1F addendum in
`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` preserves the conditional
exploration history while superseding any implication that a Hero image must
eventually ship. B2 remains private, experimental, and non-shippable. C2
remains retired conditional diagnostic evidence. No responsive image family
or Readiness companion proceeds. Cursor remains a compositional-quality
reference for scale, spacing, and product staging, not an asset source.

## 19. Future revision requirements

Any future change to the frozen Hero treatment or matrix requires all of:

1. a scoped visual-system revision;
2. responsive evidence;
3. accessibility regression testing;
4. explicit human acceptance.

Future imagery additionally requires a new explicit image-policy amendment.
Historical candidate authority cannot be reused implicitly.

## 20. Phase 8 handoff

Phase 8 is **Cross-route Public Design-System Contract**. It receives the white
editorial canvas, restrained neutral palette, Extended Neutral Hero staging,
frozen matrix, opaque white product frame, normal document flow, restrained
interaction principles, zero-image Hero policy, accessibility/fallback rules,
product-truth boundaries, Cursor as compositional-quality reference, and
cross-route coherence.

Phase 8 is authorised to begin under this handoff and may define public navigation and footer
contracts; grid and maximum width; typography; spacing and rhythm; buttons and
links; technical metadata; reusable product-scene primitives; route templates
and route-specific composition; motion, accessibility, responsive, performance,
and asset-governance rules; and foundations for Product, How it works, Trust,
Pricing, Resources, and Documentation.

Phase 8 may not redesign the logged-in Workspace, change product truth, add
decorative imagery to the frozen Hero, replace Extended Neutral, change its
matrix without explicit revision, create unrelated public mini-sites, or start
production implementation before the Phase 8 contract is accepted.

## 21. Protected scope

Application code, CSS, routes, navigation, content, interactions, `lib/`,
`public/`, dependencies, lockfiles, `.claude/launch.json`, frozen R4, accepted
Phase 7 and Phase 7.1A–E milestones, previous evidence packages, diagnostic
SVGs, production `/`, the Workspace, and the historical comparison laboratory
remain unchanged. Only this document, the R5 README, the bounded image-lock
addendum, and the new untracked freeze package are in scope.

## 22. Final human freeze acceptance

The human owner records the following binding decision: **Phase 7.1F is
ACCEPTED AND COMPLETE. Phase 7.1 is formally closed.**

The human owner confirms:

1. the frozen hierarchy matches the accepted Phase 7.1E implementation;
2. Extended Neutral is unambiguously the final Hero treatment;
3. the dimension matrix is frozen exactly as documented;
4. B2 and C2 are retired diagnostic evidence;
5. no Hero image, responsive image family, or Readiness companion proceeds;
6. Hero copy and actions remain on the white editorial canvas;
7. Finding and Evidence remains neutral and technical;
8. Missing Proof and Requirement remains neutral;
9. Readiness and Human Decision remains neutral;
10. the accepted interaction system remains frozen;
11. reduced motion, no JavaScript, forced colours, keyboard, responsive, and
    200% reflow requirements are binding;
12. the zero-image and zero-background-animation policy is frozen;
13. the image-lock reconciliation correctly preserves history while
    superseding any implication that imagery must ship;
14. future Hero changes require a scoped revision, responsive evidence,
    accessibility regression testing, and explicit human acceptance;
15. Phase 8 may now begin under the documented handoff; and
16. no Phase 8 implementation has begun.

This acceptance closes the gate without reopening any Phase 7.1A–E decision or
authorising any implementation change in the protected scope.
