# R5E.1E.2B — Reference-Led Public Reconstruction, Completion

Implementation record for completing the private route
`/visual-lab/public-r5-reference-reconstruction`, following human acceptance of
the R5E.1E.2A first composition gate.

Companion documents:
[`R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md)
(composition contract, unchanged authority),
[`R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_FIRST_GATE.md)
(the accepted first gate). This document does not rewrite either.

---

## 1. First-gate acceptance

R5E.1E.2A passed human review. Its accepted elements are preserved unchanged
in this milestone: navigation structure, hero headline, hero supporting
meaning, both hero actions, the hero product-scene concept, the Finding and
Evidence section, the public grid, alternating layouts, the white visual
system, the local scene-motion controller, no-JavaScript truthfulness,
reduced-motion behaviour, normal page scrolling, zero internal scene
scrollbars, zero page overlays, and canonical PR #482. None of these was
redesigned.

## 2. Carried refinements

Two evidence-supported refinements, both specified by the milestone brief and
both resolving open questions the first-gate package raised.

**Hero product scene** (resolves `OPEN_VISUAL_QUESTIONS.md` #6 — keep both
context rows). The selected PR #482 record is unchanged; both quiet context
reviews (PR #489, PR #471) are kept, exactly as before. The working area's
visual dominance is increased by narrowing the review-context column from
268px to 232px (200px at the 1279px breakpoint) and increasing the main
column's own padding from 26×28px to 30×32px. No new hero information was
added; every canonical readiness value remains visible; the scene still has no
internal scrolling.

**Missing Proof and Requirement scene** (resolves `OPEN_VISUAL_QUESTIONS.md`
#7 — simplify to the blocking pair). The scene now renders exactly one
relationship: `ev_coverage_gap` ("Provider failure cases absent from test
suite") is genuinely missing and leaves `req_test_provider_failure`
("Provider failure states covered") blocking and open. The second, advisory,
model-assisted record (`ev_error_shape_inferred`) is no longer rendered in
this public scene. It is **not deleted**: `MISSING_PROOF_RECORDS` in
`app/_public-r5-recalibrated/canonical-review.ts` still holds both records
unchanged, and that file was not modified. Nothing in the scene implies the
dropped record has been resolved — it simply is not this scene's subject. The
scene's minimum height was reduced from 480px to 360px (`.relationBodyCompact`)
for section balance against a copy column that did not shrink.

## 3. Complete page structure

```
Navigation (sticky)
Hero                              — headline, supporting paragraph, two actions
Hero product scene                — #product
Finding and Evidence               — #how-it-works, text left / scene right
Missing Proof and Requirement      — #missing-proof, scene left / text right
Readiness and Human Decision       — #readiness, text left / scene right
Trust                              — #trust
Unresolved-case handoff
Footer
```

Every section is an independent sibling in normal document flow. No section
reads another section's scroll state. Verified at every viewport: exactly one
positioned element, `HEADER -> sticky`; zero scrollable descendants in `<main>`
or `<footer>`; zero page-level overlays.

The alternation now completes three cycles: text-left/scene-right (Finding),
scene-left/text-right (Missing Proof), text-left/scene-right (Readiness) —
resolving `OPEN_VISUAL_QUESTIONS.md` #3, which asked whether the rhythm could
be judged from a single mirror. It repeats once more here and reads as
deliberate pacing rather than coincidence.

## 4. Readiness and Human Decision scene

New component: `components/ReadinessDecisionScene.tsx`.

This is the **authority-boundary demonstration**, not the interactive decision
surface — that remains exclusively in the sample Workspace at
`/workspace?source=fixture`. The scene is read-only in the same sense every
other public scene is: no outcome is selectable, no submission action exists,
nothing here writes anywhere, and no previous guided multi-stage experience is
recreated.

Renders, verbatim from the typed canonical module:

| Element | Source |
|---|---|
| Recommendation / Risk / Requirements fact row | `CANONICAL_REVIEW` |
| `2 blocking · 2 missing or unverified · 1 stale` | `READINESS.blockers/missingOrUnverified/stale` |
| Readiness note ("Two blocking requirements cleared…") | `READINESS.note` |
| Human Decision `PENDING` block | `CANONICAL_REVIEW.humanDecision` |
| "No Human Decision has been recorded for this review." | `DECISION_READINESS.priorDecision` |
| `Head 9c41af2 · fix/discount-code-retrieval-fallback` | `DECISION_READINESS.appliesTo` |
| "Lintel recommends. The engineer decides." | public chrome copy, `DECISION_AUTHORITY_STATEMENT` |
| All seven outcome labels | `DECISION_OUTCOMES` |

No overlay, no modal, no focus trap, no selected outcome, no submission
control, nothing implying a decision has been recorded, no internal
decision-form complexity (no notes field, no risk-acceptance input, no
divergence comparison) — the scene is a summary, not a recreation of
`app/workspace/HumanDecisionDialog.tsx`.

## 5. Human Decision outcome presentation

`DECISION_OUTCOMES` in `app/_public-r5-recalibrated/canonical-review.ts` was
verified against its authoritative source,
`lib/workspace-v2/view-model.ts`'s `OUTCOME_LABEL` and `DECISION_OUTCOMES`
constants, before rendering. The seven labels match exactly: Approve, Approve
with accepted risk, Tests required, Review required, Request changes, Blocked,
Defer decision.

All seven are shown — not a subset. Showing fewer would risk implying the
others do not exist; the brief permits a subset only with an explicit note
that the complete surface is elsewhere, so showing the complete set avoids the
question. Each renders as a plain `<li>` inside an `<ul>` (`.outcomeChipList` /
`.outcomeChip`): no `<button>`, no `<input type="radio">`, no
`<input type="checkbox">`, no `role` attribute, no hover state, no selected
variant anywhere in the stylesheet. Verified programmatically: zero of the
seven outcome elements are focusable or carry an interactive role.

A closing note — "All seven outcomes shown below are available, unselected, in
this sample. The complete decision surface — with its full descriptions and
the decision action itself — is in the sample review." — points to
`/workspace?source=fixture` for the genuine interactive surface, satisfying the
brief's requirement even though a subset was not used.

## 6. Trust boundary

New component: `components/TrustSection.tsx`. Navigation now includes
`Trust → #trust`.

Heading: "Know where every conclusion comes from." One paragraph, then four
compact records covering the six required points (two points combined per
record where natural):

| Record | Covers |
|---|---|
| Baseline | Deterministic analysis provides the baseline |
| Model assistance | Optional; identified through provenance |
| This sample | No external write; does not create or modify a review |
| Human Decision | Belongs to the accountable engineer |

Not a product scene — a plain white section, `.plainSection`, same hairline
top border as every other section boundary. No compliance claim, no SOC 2
claim, no deployment claim, no customer logo, no architecture diagram, no
security-marketing illustration, no roadmap language, no dark background, no
second call to action. Detailed Trust pages remain future work.

## 7. Unresolved-case handoff

New component: `components/HandoffSection.tsx`.

"Still unresolved" / "This case remains open." — new copy, not a repeat of the
hero. A single compact line restates the canonical record
(`example/b2b-redemption-api · PR #482 · Tests required · 46/100 · MEDIUM ·
4 open · 2 blocking · Human Decision PENDING`), then the same two genuine
actions used in the hero (`Open the sample review`, `Start a review`). No
pricing, contact sales, sign-in, demo request, account creation, or new claim.

## 8. Footer

New component: `components/PublicFooter.tsx`. A `<footer>` landmark, sibling
to `<main>`, not inside it.

Identity (wordmark), one purpose statement, three links (`Product`,
`How it works`, `Trust` — all resolving to sections already on this page, no
fake routes), `© Lintel`, and the private-lab boundary note. Does not repeat
the handoff explanation, the primary actions, the hero copy, or a second
conversion panel.

## 9. Local product motion

The Readiness/Human Decision scene adds a fourth motion step to the existing
one-shot `IntersectionObserver` model — no new controller, no change to
`SceneMotion.tsx`.

| Step | Delay | Reveals |
|---|---|---|
| 1 (at rest) | 0ms | Recommendation / Risk / Requirements fact row |
| 2 | 180ms | Blocking/missing/stale counts and the readiness note |
| 3 | 360ms | The Human Decision PENDING block |
| 4 | 540ms | The authority statement and the outcome preview |

Same easing (`cubic-bezier(0.2, 0.8, 0.2, 1)`), same properties (`opacity`,
small `translateY`), same one-shot-then-disconnect trigger
(`threshold: 0, rootMargin: 0px 0px -80px 0px` — carried from the first gate's
own fix for scenes taller than the viewport). Verified at 320×568: scrolling
`#readiness` into view moves its scene from `armed` to `revealed`, and
`[data-step="4"]` reaches `opacity: 1`.

No page scroll control, no pinning, no restart, no fake typing, no loop, no
bounce, no large scale, no layout shift (measured CLS across a full page
scroll: **0.0004** at 1600×1000, **0** at 1280×800), and product truth remains
complete without JavaScript.

## 10. Copy discipline

Each new explanatory block carries one heading and one concise paragraph, no
feature catalogue, no internal roadmap language, no generic AI language, no
unsupported performance claim. The verification model is not repeated in every
section: the Trust section explains provenance once; the handoff restates the
canonical record once, as a single compact line, not as prose. The product
scenes carry the explanation; the copy columns stay short.

## 11. Responsive composition

Measured at all six required viewports plus 200% zoom emulation, against a
production build.

| Viewport | Horizontal overflow | Scrollable descendants | Positioned elements |
|---|---|---|---|
| 1600×1000 | none | 0 | `HEADER -> sticky` |
| 1280×800 | none | 0 | `HEADER -> sticky` |
| 1024×768 | none | 0 | `HEADER -> sticky` |
| 768×1024 | none | 0 | `HEADER -> sticky` |
| 390×844 | none | 0 | `HEADER -> sticky` |
| 320×568 | none | 0 | `HEADER -> sticky` |
| 200% zoom | none | 0 | `HEADER -> sticky` |

**A real defect was found and fixed during validation**: the readiness scene's
three-cell fact row used the four-column `.factRow` grid unmodified, leaving an
empty fourth grid cell that rendered as a visible grey gap. Fixed with a
`.factRowThree` modifier (three equal columns on desktop and tablet, collapsing
to one column below 768px, matching the existing pattern for the four-cell
row).

Desktop: the alternating rhythm is now visible across three cycles; every
scene remains legible; no internal scrolling; no overlay; no sticky product;
one message per section.

Tablet (768×1024): no compressed dashboard — the readiness scene's fact row
holds three equal columns rather than wrapping into an uneven grid; text and
scene stay balanced; no horizontal overflow.

Mobile (390×844, 320×568): compact navigation now carries `Product`,
`How it works` and `Trust` in the same removed-rather-than-hidden pattern; the
hero stays left-aligned; text precedes every scene; the readiness scene's tag
row and seven-chip outcome list wrap naturally with no overlap (verified with
close-up captures); Trust's four records stack to one column; the footer
stacks; no internal scrollbars anywhere; no essential information is hidden;
every action stays reachable and full-width where the first gate already
established that pattern.

## 12. Accessibility

Preserved: one `<main>`, one `<h1>`, native links throughout, visible focus,
no fake controls, no focus stealing, no automatic announcements, reduced-motion
support, no meaning through colour alone, no content dependent on animation,
truthful server-rendered scenes, coherent mobile source order, 200% zoom
usability, no page-level modal.

New heading outline (verified, no forward skip at any point):

```
H1  Know what is ready to merge.
H2  Selected review                              (visually hidden)
  H3  Retry behaviour may create duplicate redemption risk
H2  Trace every finding to the evidence.
  H3  Retry behaviour may create duplicate redemption risk
    H4 H4  (evidence titles)
H2  See what is still unproven.
  H3  Provider failure cases absent from test suite
    H4  Provider failure states covered
H2  Readiness remains accountable.                (no H3/H4 inside — the
                                                     scene uses no headings,
                                                     which does not skip a
                                                     level; H4 -> H2 is a
                                                     decrease, not a skip)
H2  Know where every conclusion comes from.
H2  This case remains open.
```

New landmarks: `<footer>` (a landmark by virtue of being a direct child of the
page root, sibling to `<header>` and `<main>`), with its own
`<nav aria-label="Footer">`.

Outcome chips: zero are focusable, zero carry an interactive role — verified
programmatically. Tab order was walked twelve stops deep and confirmed
correct: skip link, wordmark, Product, How it works, Trust, header action,
hero's two actions, handoff's two actions, footer wordmark, footer's first
link — every stop a native `<a>`, no trap, no skipped control.

## 13. Progressive enhancement

Unchanged mechanism, extended coverage. With JavaScript disabled, every
canonical value across all six sections renders, including the readiness
scene's facts, the Human Decision PENDING state, all seven outcome labels,
the Trust heading, the handoff heading and the footer's copyright line —
verified directly. Under reduced motion, `data-motion` is never set anywhere
on the page and `[data-step="4"]` computes to `opacity: 1` immediately.

## 14. Performance and stability

No dependency added. `package.json` and the lockfile are unchanged. Two client
boundaries as before (`PublicHeader`, `SceneMotion`) — no third was introduced;
`ReadinessDecisionScene` is a server component that reuses the existing
`SceneMotion` wrapper. Zero images, zero external requests, no model call, no
persistence, no telemetry. Cumulative layout shift across a full-page scroll:
0.0004 at 1600×1000, 0 at every other measured viewport.

## 15. Cross-route design continuity (documented, not implemented)

Every genuine future Lintel public route must inherit the system this route
now completes: the same sticky-header-only navigation shell, the same white
canvas and token registry, the same 1300px/40px grid, the same Geist
typography, the same flat product-scene framing (chrome bar plus inset
records, never photographic or atmospheric imagery), the same normal-flow
section architecture with no pinned content, the same restrained
`IntersectionObserver`-driven local motion, the same footer shape, the same
mobile recomposition pattern (text before scene, side-by-side internals
dropped below 768px), and the same truth and originality boundaries recorded
in `R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md` §20.

Future Product, Trust (detailed), Pricing, Resources, Models or other pages
must read as parts of one website rather than independent visual experiments.
No such route is added in this milestone.

## 16. Route and product truth

Route unchanged: `/visual-lab/public-r5-reference-reconstruction`, `noindex`,
`nofollow`, absent from sitemap and production navigation, no analytics, no
external write, no model call, no persistence.

Canonical values verified at every viewport, under reduced motion, and with
JavaScript disabled: `example/b2b-redemption-api`, `PR #482`, "Add fallback
handling for failed discount-code retrieval", `Tests required`,
`46/100 · MEDIUM`, `4 open · 2 blocking`, Human Decision `PENDING`. No selected
outcome, no completed decision, no cleared requirement, no changed
recommendation or risk, no reviewer identity, no customer claim, no external
write, no model execution, no collaboration feature, no enterprise capability.

## 17. Protected scope

Unchanged, verified by `git diff`: `app/page.tsx`, `app/_public-r5`,
`app/_public-r5-recalibrated` (read-only import, as in R5E.1E.2A),
`app/visual-lab/public-r5`, `app/visual-lab/public-r5-recalibrated`,
`app/workspace`, `app/report`, `app/new`, `app/home`,
`app/review-operations`, `app/integrations`, `app/settings`,
`app/review-policies`, `app/team`, `app/visual-lab/workspace-r4`,
`lib/workspace-v2`, `public/r5/scenes`, `.claude/launch.json`, `package.json`,
lockfiles, R4 documentation, previously accepted R5 documentation.

Modified: `app/_public-r5-reference-reconstruction/` (extended),
`docs/r5/README.md` (one new milestone entry).

Created: `docs/r5/R5E1E2B_REFERENCE_RECONSTRUCTION_COMPLETION.md` (this
document), `R5E1E2B_HUMAN_REVIEW_PACKAGE/` (untracked).

## 18. Browser validation

Production build (`next build` + `next start`), headless Chrome.

Confirmed: `noindex, nofollow`; one `<main>`; one `<h1>`; complete page order;
exactly one positioned element (`HEADER -> sticky`) at every viewport; zero
scrollable descendants; no page overlay; all navigation destinations resolve;
all six sections render and reveal; genuine outcome labels verified against
`lib/workspace-v2/view-model.ts`; all seven outcomes present and none carries
an interactive role or selected state; Trust and handoff content correct;
footer content correct; reduced motion never arms; JavaScript-disabled
truthfulness confirmed for every section; no hydration warning; no console
error beyond the pre-existing `favicon.ico` 404; no horizontal overflow at any
viewport; CLS 0–0.0004; no external write; no model call; canonical values
unchanged; all six required viewports plus 200% zoom (emulated) tested.

Regression sweep, all HTTP 200, no page errors: `/`, `/visual-lab/public-r5`,
`/visual-lab/public-r5-recalibrated`, `/workspace?source=fixture`, `/new`.

## 19. Known limitations

1. Visual quality is not self-accepted — this document reports what was built
   and measured.
2. The in-app browser pane could not composite frames in this session (as in
   R5E.1E.2A); all visual validation used headless Chrome driving the
   already-installed local Chrome via `puppeteer-core`, run from the session
   scratchpad.
3. 200% zoom is emulated (640×400 at device-scale-factor 2), not true browser
   zoom.
4. No screen-reader output was captured; structure, landmarks, roles and tab
   order were verified programmatically instead.
5. The originality model-visibility test (`R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md`
   §7a) can now be assessed more completely than at the first gate — Readiness
   and Human Decision are no longer only named, they are shown — but the
   assessment itself belongs to human review, not to this document.

## 20. Final visual-review requirements

The page is now complete end to end. A reviewer should judge:

1. Whether the third alternation cycle (Readiness, text-left/scene-right)
   reads as consistent rhythm rather than repetition.
2. Whether the Human Decision scene reads as an authority boundary rather than
   as a disabled or broken form.
3. Whether seven outcome chips are the right density, or whether a shorter
   restrained summary (with the required pointer to the sample review) would
   read more calmly.
4. Whether Trust's four records feel sufficient without a customer-proof
   element neither reference product can supply here.
5. Whether the handoff and footer, both new, feel like a single quiet closing
   movement or like two separate endings.

## 21. Acceptance evidence

Untracked `R5E1E2B_HUMAN_REVIEW_PACKAGE/` holds 20 documents and 23
screenshots: first viewport and full final state at all six required
viewports, six scrolled section captures (hero, Finding/Evidence, Missing
Proof/Requirement, Readiness/Human Decision, Trust, handoff-and-footer), a
complete 1440×900 walkthrough, two close-up mobile captures of the readiness
scene, a JavaScript-disabled capture, and a 200%-zoom capture.
