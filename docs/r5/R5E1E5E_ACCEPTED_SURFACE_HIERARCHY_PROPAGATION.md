# R5E.1E.5E — Accepted Surface Hierarchy Propagation

**Status: ACCEPTED AND COMPLETE**

**Branch:** `r5e1e5e-accepted-surface-hierarchy-propagation`

## 1. Purpose

Phase 7.1E is the bounded production-propagation milestone for the surface
direction selected and accepted in Phase 7.1D. It makes the accepted private
reference reconstruction the authoritative review implementation of that
direction without changing production `/`, the comparison laboratory, the
logged-in Workspace, page architecture, navigation, content, product truth, or
interaction behaviour.

The governing visual lesson is **Extended Neutral**: premium improvement comes
from generous product staging, deliberate presentation space, and interface
scale, not decorative imagery.

This document records implementation, technical validation, and the binding
human acceptance decision. It does not freeze final dimensions, begin Phase
7.1F, or begin Phase 8.

## 2. Accepted Phase 7.1D decision

The Phase 7.1D human disposition is binding:

1. Extended Neutral is selected for the Hero.
2. Neutral 26 remains a historical control.
3. B2 remains retired, private, diagnostic, and non-shippable.
4. C2 remains retired conditional diagnostic evidence.
5. No image surface, further candidate, responsive derivative, or Readiness
   companion proceeds.
6. Readiness, Finding/Evidence, and Missing Proof/Requirement remain neutral.
7. Trust, handoff, and footer remain on the white editorial canvas.
8. Presentation-band dimensions remain provisional; bounded responsive tuning
   was permitted here and final freezing belongs only to Phase 7.1F.

Cowork's independent decision-support scores were Extended Neutral 72/75,
Neutral 26 63/75, C2 50/75, and B2 46/75. The human disposition remains the
product decision. Candidate selection was not reopened.

## 3. Exact implementation scope

The implementation changes only:

- `app/_public-r5-reference-reconstruction/R5ReferenceReconstruction.tsx`;
- `app/_public-r5-reference-reconstruction/reference-reconstruction.module.css`;
- `app/visual-lab/public-r5-reference-reconstruction/page.tsx`.

The review route is:

`/visual-lab/public-r5-reference-reconstruction`

Production `/` is unchanged. The private surface-comparison laboratory is
unchanged and remains historical evidence. No private laboratory component or
asset is imported by the accepted route.

## 4. Extended-neutral hierarchy

The accepted Hero now expresses exactly three visual layers:

1. the existing white editorial page canvas;
2. one completely opaque extended-neutral presentation band at `#fafaf9`
   (`var(--pub-surface-2)`);
3. the existing opaque white product frame.

The band surrounds only the Hero product scene. Hero copy and actions remain
outside it. It has no image, gradient, texture, glow, glass, transparency,
shadow spectacle, animation, semantic role, or accessibility-tree node. It is
laid out through normal-flow section/caption space and creates no internal
scroll region. The white product frame remains the dominant object.

## 5. Implementation method

The existing `.scenePlate` is the smallest accepted boundary that already owns
the direct `.sceneFrame` child. A route-scoped presentation option adds an
opaque `.scenePlate::before` surface behind the frame and reserves matching
fixed top and bottom space on the existing Hero scene section and caption.

`R5ReferenceReconstruction` defaults to `historical-control`. The thin accepted
route explicitly selects `extended-neutral`. This narrow option is necessary
because the historical private comparison routes reuse the same accepted
component as their Neutral 26 base; changing the component unconditionally
would mutate the laboratory's historical control without changing a laboratory
file.

The product frame remains the same DOM element. Its white surface, border,
radius, width behaviour, content, typography, internal spacing, interaction,
and responsive rules are not rewritten or forked.

## 6. Starting and realised dimension matrix

The Phase 7.1C starting values were used unchanged:

| Viewport width | Top | Left/right | Bottom | Treatment |
| --- | ---: | ---: | ---: | --- |
| ≥1440px | 88px | 56px | 64px | Extended Neutral |
| 1280–1439px | 80px | 48px | 56px | Extended Neutral |
| 1025–1279px | 72px | 40px | 48px | Extended Neutral |
| 768–1024px | 64px | 32px | 40px | Extended Neutral |
| 360–767px | 56px | 20px | 40px | Extended Neutral |
| <360px | 12px | 12px | 12px | accepted compact neutral fallback |

The implementation combines the existing accepted scene-plate inset with an
outward route-scoped delta. At 1440px, for example, the accepted 26px inset
plus 62/30/38px produces 88/56/64px. At 320px the pseudo-surface is disabled
and the accepted 12px neutral scene plate returns.

## 7. Bounded tuning

No tuning was required. Genuine browser evidence found no overflow, clipping,
mobile disproportion, first-viewport collapse, section collision, frame-width
regression, or breakpoint dead space attributable to the laboratory matrix. No
new breakpoint was added. The values remain provisional.

## 8. Hero invariants

The source diff and browser assertions preserve the Hero heading, supporting
copy, actions, repository `example/b2b-redemption-api`, `PR #482`, title
`Add fallback handling for failed discount-code retrieval`, recommendation
`Tests required`, risk `46/100 · MEDIUM`, requirements `4 open · 2 blocking`,
and Human Decision `PENDING`.

Overview/Finding/Readiness, automatic H1–H3, manual-intent authority,
selected-tab reactivation, Arrow keys, Home, End, Enter, Space, focus
visibility, reload reset, scroll-away/return persistence, reduced motion,
no-JavaScript fallback, and forced-colours behaviour remain intact. Automatic
behaviour did not reclaim authority after manual interaction. No duration,
delay, easing, or state transition was edited.

## 9. Downstream neutral invariants

Finding/Evidence, Missing Proof/Requirement, and Readiness/Human Decision retain
their accepted white frames and neutral scene chrome. Trust, the unresolved
handoff, and footer remain on the transparent/white editorial canvas.
Navigation is unchanged. No Readiness companion was created.

At 1440px direct browser sampling reported each downstream section as the same
accepted transparent editorial section with 88px vertical rhythm; its product
scene retained the accepted opaque white bordered frame. Trust, handoff, and
footer remained transparent over the white page canvas.

## 10. Visual comparison

A genuine pre-change 1440×900 capture was made before editing. Post-change
accepted-route and private Extended Neutral views were then captured at equal
viewports and states. After excluding the laboratory's 92px utility strip, the
accepted and laboratory Overview Hero measurements matched exactly:

- frame: x=121.2, y=184.6125, 1182.4 × 633.2 CSS px;
- plate: x=94.4, y=157.8125, 1236 × 686.8 CSS px;
- band top: y=95.8125;
- material: opaque `rgb(250, 250, 249)`, no background image.

Aligned 1296×787 crops differed in only 0.010809% of channels, with RMS
0.06028; geometry and presentation are materially equivalent, with the small
remainder limited to capture/antialiasing noise.

## 11. Responsive results

Production-browser pixels were validated at 1920×1080, 1600×1000, 1440×900,
1280×800, 1024×768, 834×1112, 768×1024, 430×932, 390×844, 375×812, 360×800,
and 320×568.

Every size had no horizontal page overflow, no internal Hero scroll region, no
clipped product content, complete actions/tabs/metadata, stable product-frame
width and height across Overview/Finding/Readiness, no asset request, no
state-dependent frame shift, and no following-section collision. The white
frame remained dominant and the fixed presentation space retained normal
section rhythm. The 320px compact fallback was confirmed.

## 12. Mobile results

The selected 56/20/40px band is realised from 360px through 767px. At 430,
390, 375, and 360px the scene becomes the accepted tall single-column product
layout without an internal scroller. Actions and tabs remain complete and
metadata remains readable. At 320px the 12px compact neutral fallback is used;
no tall/mobile image or derivative exists.

Final aesthetic judgment of mobile proportion remains a human gate.

## 13. Reduced-motion validation

Chrome 150 genuinely emulated `prefers-reduced-motion: reduce`; the query
matched. The route presented the accepted settled Overview state, reported
settled motion, used `transform: none`, and had zero background animations.
All content and controls remained available. The static neutral band neither
requires nor introduces motion.

## 14. No-JavaScript validation

Script execution was disabled before navigation in Chrome 150. The complete
server-rendered Hero, navigation, actions, and canonical facts remained. The
page contained one main and one H1, 14 native links, and zero buttons, tabs,
tablists, tabpanels, fake controls, or live regions. The Extended Neutral CSS
remained opaque and present without an image. There was no horizontal overflow
or layout collapse.

## 15. Forced-colours validation

Chrome 150 genuinely emulated `forced-colors: active`; the query matched. The
decorative band resolved to `Canvas` with a `CanvasText` border. The product
frame retained a distinct system-colour border and opaque surface. Text and
controls remained readable, all product truth remained present, and the
focused Finding tab displayed a 2px solid system Highlight outline. No image
or transparency dependency exists.

## 16. Keyboard validation

Low-level Chrome key dispatch reproduced the accepted 17-stop desktop focus
order. Shift+Tab reversed correctly. The Hero Overview stop displayed the
accepted 2px blue focus outline. ArrowRight selected Finding, Home selected
Overview, End selected Readiness, Space reactivated Readiness, and ArrowLeft
plus Enter selected Finding. Manual authority remained active after a further
4.4 seconds.

Scroll-away/return preserved manual Finding; reload reset to Overview and
automatic authority.

## 17. 200% zoom-equivalent validation

The defensible browser reflow test used a 640×400 CSS-pixel viewport at DPR2,
representing a 1280×800 physical viewport at 200% equivalent reflow. It is not
claimed as direct manipulation of the browser UI zoom setting.

The document width equalled the 625px content viewport after scrollbar
subtraction. The Hero frame was 559px wide; both actions were complete 44px
targets within the content width; all facts remained present; and there was no
horizontal page scroll, product-frame clipping, action clipping, or internal
scene scroll.

## 18. Accessibility

The route retains one main, one H1, and heading order H1, H2, H3, H2, H3, H2,
H3, H4, H2, H2, H2. Three accepted tablists and seven tab-to-panel
relationships remain intact with their existing accessible names and
orientations. Focus order is unchanged. Required mobile/reflow action targets
remain 44px.

The band is a CSS pseudo-element with no role, label, live region, image role,
or accessibility-tree entry. Product text remains on an opaque frame.
Reduced-motion, forced-colours, and no-JavaScript truthfulness are confirmed
above.

## 19. Performance

A cache-disabled production navigation recorded 16 route resources and
327,025 transferred bytes. Surface requests and external requests were both
zero. The repository-normalised CSS module increased by 3,054 bytes.

The change adds zero images, external calls, model calls, runtime transforms,
animation libraries, layout-measurement scripts, background video, production
assets, or hydration dependencies. Browser capture reported zero console
errors, exceptions, hydration warnings, and long-task entries.

## 20. Layout stability

A PerformanceObserver installed before navigation observed no layout-shift
entries in the instrumented load window. This bounded observation is not
presented as a fabricated universal CLS score.

Direct rectangle sampling showed the pre- and post-change 1440px product frame
remained 1182.4 × 633.2 CSS px. The post-change page-height increase was
exactly the 62px top plus 38px bottom normal-flow reservation. Frame geometry
was stable across all three Hero states and every required viewport. The CSS
paint has no resource wait.

## 21. Product truth

All seven required product facts passed browser assertions in normal,
responsive, reduced-motion, JavaScript-disabled, forced-colours, keyboard, and
200% equivalent states. No content, fixture, canonical data, or model-backed
path changed.

## 22. Private-laboratory regression

The private index and `neutral-26`, `neutral-extended`, `b2-diagnostic`, and
`c2-diagnostic` routes all rendered successfully from the production build.
Their labels and purposes remain intact. Neutral 26 remains the compact
historical control; private Extended Neutral remains image-free; B2 and C2
remain private diagnostics. The laboratory has no tracked diff and no runtime
dependency on the accepted-route option.

## 23. Protected scope

Path-specific final diffs confirm no changes to production `/`, earlier public
implementations/labs, the private comparison laboratory, logged-in routes,
Workspace libraries, `public/`, dependencies, lockfiles, `.claude/launch.json`,
frozen R4, accepted Phase 7, accepted Phase 7.1A–D, or previous evidence
packages. Existing untracked historical packages remain untouched.

No external write, model call, stage, commit, push, or merge occurred.

## 24. Review package

The untracked
`R5E1E5E_ACCEPTED_SURFACE_PROPAGATION_PACKAGE/` contains all 28 required
Markdown records, genuine before/after/reference/aligned/special-state
screenshots, raw JSON measurements, and a deliberate 21-frame Chrome
screencast APNG. It remains untracked.

## 25. Human evidence reviewed

The human owner completed the required review of:

1. the accepted route at 1440×900 in Overview, Finding, and Readiness;
2. the direct 1440×900 comparison with the private Extended Neutral route and
   the aligned accepted/reference crops;
3. first-viewport composition and rhythm;
4. tablet and mobile evidence at 1024×768, 768×1024, 430×932, and 390×844;
5. the 320×568 below-360px compact fallback;
6. the deliberate 21-frame interaction recording;
7. reduced-motion, no-JavaScript, forced-colours, keyboard, mobile, and 200%
   equivalent reflow evidence;
8. the downstream neutral hierarchy and protected-scope validation.

The screenshot and recording manifest and the raw measurement records remain
the evidence index for this decision.

## 26. Binding human disposition

**Phase 7.1E is ACCEPTED AND COMPLETE.**

The human owner accepts that the propagated Extended Neutral Hero feels
deliberately staged rather than fitted, remains visually calm, preserves
product-frame dominance, and preserves first-viewport rhythm. The presentation
is proportionate at desktop, tablet, and mobile widths. The correct compact
neutral fallback is used below 360px.

All accepted Hero interaction is preserved. The downstream neutral hierarchy
is preserved. The required reduced-motion, no-JavaScript, forced-colours,
keyboard, mobile, and 200% zoom-equivalent gates pass. No bounded correction is
required before Phase 7.1F.

## 27. Dimensional decision

The current presentation-band matrix proceeds unchanged into Phase 7.1F:

| Viewport width | Top | Left/right | Bottom | Treatment |
| --- | ---: | ---: | ---: | --- |
| ≥1440px | 88px | 56px | 64px | Extended Neutral |
| 1280–1439px | 80px | 48px | 56px | Extended Neutral |
| 1025–1279px | 72px | 40px | 48px | Extended Neutral |
| 768–1024px | 64px | 32px | 40px | Extended Neutral |
| 360–767px | 56px | 20px | 40px | Extended Neutral |
| <360px | 12px | 12px | 12px | compact neutral fallback |

These values remain provisional until Phase 7.1F formally freezes them. Human
acceptance closes Phase 7.1E without prematurely performing that freeze.

## 28. Phase 7.1F handoff

Phase 7.1F is next, but is not begun here. Its handoff is bounded to:

1. formal dimension freeze;
2. final surface hierarchy freeze;
3. neutral colour and border rules;
4. accessibility and fallback rules;
5. zero-image asset policy;
6. downstream neutral hierarchy;
7. reconciliation of earlier image-lock language;
8. final public visual-direction documentation;
9. no new implementation unless a genuine freeze-blocking defect is found;
10. no Phase 8 route-system work.

## 29. Protected scope

No imagery, surface asset, derivative family, additional breakpoint, Readiness
companion, or background animation is authorised. Application code, CSS,
components, routes, responsive values, interaction behaviour, assets,
dependencies, and product content are unchanged by this human-acceptance
closeout. Production `/`, the comparison laboratory, logged-in Workspace,
downstream section hierarchy, accepted interaction, and all earlier frozen or
accepted phases remain protected.

Phase 7.1E closes with zero correction. This record performs no Phase 7.1F or
Phase 8 implementation work.
