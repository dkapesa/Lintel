# R5E.1E.2A — Reference-Led Public Reconstruction, First Composition Gate

Implementation record for the private route
`/visual-lab/public-r5-reference-reconstruction`.

Companion contract: [`R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md`](./R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md).
No earlier milestone document was edited to produce this one.

---

## 1. Purpose

The public architecture built across R5E.1B–E.1 is rejected as the final
direction. It is not corrected here; it is replaced.

Rejected: one persistent sticky Workspace controlling the whole journey,
narrative content moving underneath it, an eight-stage
`IntersectionObserver`-driven page progression, fixed-height application
shells, nested Queue/Workspace/Inspector scrolling, and a homepage that
reproduces the complete application workflow.

This milestone rebuilds the central composition from direct study of two
reference recordings, in normal document flow, and stops after three sections
so the composition can be judged before the rest of the page is built.

`/visual-lab/public-r5-recalibrated` is untouched and remains available for
side-by-side comparison.

## 2. Reference-access gate result

**PASSED.** All three recordings were located as readable local files, probed,
frame-extracted and visually inspected before any repository file was read.

`ffprobe`/`ffmpeg` were absent from this machine. Static binaries were installed
into the session scratchpad only; no repository file, `package.json` or lockfile
was involved.

## 3. Video paths and metadata

| | Cursor | Skybase | Lintel (current) |
|---|---|---|---|
| Path | `C:\Users\dkape\Videos\Captures\Cursor_ AI coding agent - Google Chrome 2026-08-03 14-33-45.mp4` | `…\Skybase _ The single source of truth for your company. - Google Chrome 2026-08-03 14-32-49.mp4` | `…\Public R5 recalibrated visual lab — Lintel - Google Chrome 2026-08-03 14-31-43.mp4` |
| Duration | 45.207 s | 42.074 s | 39.150 s |
| Dimensions | 1920 × 1140 | 1920 × 1140 | 1920 × 1140 |
| Frame rate | 60/1 nominal, 19.815 fps average (VFR) | 60/1 nominal, 20.691 fps average | 60/1 nominal, 17.348 fps average |
| Codec | h264 / yuv420p | h264 / yuv420p | h264 / yuv420p |
| Coded frames | 889 | 869 | 678 |
| Frames extracted (1 fps) | 45 | 42 | 39 |
| Dense frames (8 fps) | 216 | 193 | 189 |
| Full-resolution key frames | 19 | 10 | 8 |

Contact sheets, dense sheets, key frames and the complete observation set are in
the untracked `R5E1E2A_REFERENCE_VIDEO_ANALYSIS/`.

## 4. Timestamped reference findings

The eleven observations that determined the implementation:

1. **Cursor 0.4 s** — left-aligned H1, *no* hero paragraph, two pills; the
   product scene begins at 44 % of the first viewport height.
2. **Cursor 13.4 s** — trust is one centred line plus a rule-separated logo row.
3. **Cursor 16.75–17.9 s** — section transitions are pure scroll; both sections
   are briefly visible; nothing pins.
4. **Cursor 19.0 s vs 27.0 s** — identical scroll-thumb position and identical
   text baseline with a different scene interior. Motion is local to a
   stationary scene; scroll position never maps to product state.
5. **Cursor 18.0–31.5 s** — text column ≈470 px, scene ≈1065 × 897 px, ratio
   ≈69/29.
6. **Cursor 33.5 s** — composition mirrors (scene left, text right) with
   ≈150 px of empty canvas between sections.
7. **Skybase 0.4 s** — the same system on white: left H1, two-line grey
   paragraph, two pills, scene at 51 % viewport height.
8. **Skybase 10.5 s** — text 485 px / scene 1066 × 715 px; a white product card
   inset ≈75 px inside a plate; content clipped by the frame, no scrollbar.
9. **Skybase 16.75–17.4 s** — alternating handoff by ordinary scroll only.
10. **Skybase 19.5 s** — scene interior builds one row at a time, ≈0.4 s apart.
11. **Skybase 27.4 s** — quiet closeout: centred short CTA, two pills, hairline,
    five-column footer.

## 5. Rejected public architecture

Measured from the current-Lintel recording. `dense_t18` (41 frames spanning
18.0–23.0 s) shows the Workspace shell occupying a pixel-identical rectangle in
every frame while only a caption at the bottom edge changes.

| Dimension | Reference | Current Lintel |
|---|---|---|
| Sticky elements | Header only | Header **and** the whole Workspace shell |
| Shell residency | n/a | Pinned ≈30 s of a 39 s recording |
| Narrative position | Beside the scene | Underneath the scene |
| Page progression | Independent sections | Eight-stage scroll-driven state machine |
| Ideas per viewport | One | Four to five |
| Product type size | ≈14–16 px | ≈11–12 px |
| Inter-section whitespace | ≈150–180 px | None |
| Internal scroll regions | None | Queue, Workspace and Inspector |

## 6. Reference operating system, as implemented

| Principle | Implementation |
|---|---|
| Normal flow only | One `position: sticky` in the stylesheet (the header); no `position: fixed` anywhere |
| One message per section | Each section: one `<h2>`, one paragraph ≤4 lines, one scene |
| Scene-dominant proportion | 400 px copy / 736 px scene at 1280 (measured); ≥2:1 at every desktop width |
| Alternating sides | Section 2 text-left, section 3 scene-left, by grid placement not DOM order |
| Whitespace rhythm | 88 px section padding desktop → 176 px between sections |
| Local scene motion | One `IntersectionObserver` per scene, fires once, disconnects |
| Copy restraint | Hero paragraph shortened to 22 words / two lines at a 62 ch measure |
| Readable product type | ≥12 px micro labels, ≥13 px record content |

## 7. Originality boundaries

Nothing branded transfers. No Cursor or Skybase wordmark, mark, asset,
illustration, wording, interface geometry, animation sequence, agent metaphor,
accent colour, product content or customer logo appears.

Both references frame their product on a photographic plate — Cursor a painterly
field, Skybase sky imagery. `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §5
prohibits atmospheric and copied environmental imagery outright, so the plate is
rendered as a flat `--prod-surface-2` band with a hairline border and a 14 px
radius. The "framed, presented product" reading is preserved; the imagery is not.

Transplant test: the hero scene names a repository, a pull request number, a
recommendation, a risk score, a requirement count and a pending Human Decision.
It could not be reused unchanged for an AI editor, a CRM or a knowledge base.

## 8. Route architecture

```
app/_public-r5-reference-reconstruction/
  R5ReferenceReconstruction.tsx          server — page composition
  reconstruction-content.ts              public chrome copy only
  reference-reconstruction.module.css    self-contained stylesheet
  components/
    PublicHeader.tsx                     client — scrolled hairline, aria-current
    SceneMotion.tsx                      client — the only motion controller
    HeroReviewScene.tsx                  server
    FindingEvidenceScene.tsx             server
    MissingProofRequirementScene.tsx     server
app/visual-lab/public-r5-reference-reconstruction/page.tsx
```

`noindex`, `nofollow`, no sitemap entry, not in `app/nav-config.tsx`, not
imported by any production route, no analytics, no external write, no model call,
no persistence.

Canonical data is **imported** from
`app/_public-r5-recalibrated/canonical-review.ts`, which is read and never
modified. Deleting the two new directories leaves every other route
byte-identical.

## 9. Normal-flow composition

The page is a vertical stack of `<section>` elements. No section reads another
section's scroll state. Nothing is pinned but the header. There is no scroll
snapping, wheel interception, scroll-linked transform, page overlay or floating
card. Verified at all six required viewports plus 200 % zoom: exactly one
positioned element, `HEADER → sticky`.

## 10. Navigation

| Label | Destination |
|---|---|
| Lintel | `/visual-lab/public-r5-reference-reconstruction` |
| Product | `#product` |
| How it works | `#how-it-works` |
| Open the sample review | `/workspace?source=fixture` |

No Trust link — the Trust section does not exist in this gate, and a navigation
item that resolves to nothing is worse than its absence. No dropdowns, pricing,
docs, sign-in, contact sales or invented destination. Below 768 px the section
links are removed rather than hidden behind a hamburger with nothing genuine to
reveal, leaving the wordmark and "Open sample". The button's accessible name
stays the full label at every viewport.

## 11. Hero

Headline "Know what is ready to merge." unchanged.

The supporting line was refined for clarity and line length, which §11 of the
task brief permits. The accepted recalibrated wording runs to 34 words and wraps
to four lines; neither reference exceeds two. It now reads: "Lintel connects a
software change to its findings, evidence, missing proof and requirements, so an
engineer can make an accountable decision." — 22 words, two lines at 1280 px.

Left-aligned, no centred presentation, no decorative imagery, two actions
(`/workspace?source=fixture`, `/new`). The third microcopy line the recalibrated
hero carries is dropped: neither reference carries a third element, and the claim
it made now belongs in the Trust section that this gate does not build.

The hero product scene begins **367 px** from page top at 1280 × 800, so
≈370 px of it is above the fold — comparable to Cursor's 44 % and Skybase's 51 %.

## 12. Hero product scene

Purpose-designed, not a reuse of the Workspace shell. A narrow review-context
column and one dominant selected-review area. The Rail, Inspector and
eight-stage spine do not appear.

Renders: `example/b2b-redemption-api`, `PR #482`, the change title, branch and
head, a four-cell fact row (Tests required / 46/100 · MEDIUM / 4 open · 2
blocking / Human Decision **PENDING**), one attention record (HIGH ·
Reliability · Rule detected, "Retry behaviour may create duplicate redemption
risk", `app/services/redemption_service.py:118`), and the next-inspection line.
The two genuine fixture context rows (PR #489, PR #471) render as inert text
under an explicit "Context only — not inspectable here." note.

## 13. Finding and Evidence section

Text left, scene right on desktop; text first on mobile. Heading "Trace every
finding to the evidence."

The scene shows only Finding → Evidence → Provenance: the primary finding with
its statement and source, an edge labelled "Supported by 2 canonical evidence
records", then both `PRIMARY_EVIDENCE` records with status (`confirmed`,
`present`), provenance (`Rule detected`) and source path. No requirements, no
readiness, no Workspace.

## 14. Missing Proof and Requirement section

Scene left, text right on desktop; text first on mobile. Heading "See what is
still unproven."

Both `MISSING_PROOF_RECORDS` render, because they carry the distinction the
section exists to make: `ev_coverage_gap` is *missing* and leaves a **blocking ·
open** requirement ("Provider failure states covered", emphasised in the
blocking token); `ev_error_shape_inferred` is *unverified*, carries violet
model-assisted provenance, and leaves an **advisory · open** requirement.
Showing only one would collapse "no issue detected" and "no proof available"
back into a single idea.

The scene closes on "Merge readiness blocked · 4 open · 2 blocking · Human
Decision PENDING". Nothing is resolved.

## 15. Product-scene motion

One controller, `SceneMotion`. It tells one scene, once, that it has entered the
viewport, then disconnects. It does not pin, read scroll offset, write global
state, or restart.

- Trigger: `IntersectionObserver`, `threshold: 0`, `rootMargin: 0px 0px -80px 0px`.
  A ratio threshold was tried first and **rejected on evidence**: at 320 px a
  scene is ≈1270 px tall in a 568 px viewport, so a 0.25 ratio can never be met
  and the later steps stayed invisible permanently. "Has entered the viewport"
  is the whole contract, so any intersection is the trigger.
- Properties: `opacity`, `transform: translateY(8px)`, plus a 1-px rule that
  scales in on the relationship edge.
- Easing `cubic-bezier(0.2, 0.8, 0.2, 1)`, duration 420 ms, step delays
  0 / 180 / 360 ms. No loop.
- Sequences: hero — selected PR at rest → readiness facts → attention finding.
  Finding/Evidence — finding at rest → evidence relationship → provenance.
  Missing Proof — missing proof at rest → requirement connection → unresolved
  status.

Measured cumulative layout shift while scrolling the whole page: **0**.

## 16. Responsive design

| Viewport | Copy / scene | Result |
|---|---|---|
| 1600 × 1000 | 400 / 756 | Two columns, hero scene above the fold |
| 1280 × 800 | 400 / 736 | Two columns, hero scene above the fold |
| 1024 × 768 | 340 / 560 | Single column, scenes full width |
| 768 × 1024 | 704 / 704 | Single column; scene internals keep two columns; fact row 2 × 2 |
| 390 × 844 | 350 / 350 | Compact nav; text before every scene; scene internals stack; fact row 1-up |
| 320 × 568 | 280 / 280 | As above; actions full width |
| 200 % zoom (640 × 400 @2×) | 600 / 600 | Usable, no overflow |

No horizontal overflow at any viewport. No scene is a shrunken desktop
dashboard: below 768 px each scene drops its side-by-side internals and stacks.
Nothing is hidden at any viewport.

## 17. Accessibility

One `<main>`, one `<h1>`. Heading outline descends H1 → H2 → H3 → H4 with no
skip; the hero scene section carries a visually hidden `<h2>` so the outline
stays intact without adding a visible heading the composition does not want.

Native `<a>` elements throughout — no fake controls, no `role="button"`, no
click handlers on non-interactive elements. Visible focus outline at 2 px with
2 px offset, never removed. Skip link to `#main`. Source order is
copy-then-scene in both alternating sections; the reversed desktop composition
is grid placement only. Selection in the scene carries a text state
("SELECTED") as well as the quiet fill, per the visual lock's §2c.2. Status is
never colour-only — every status token also carries its word. No auto-focus, no
focus stealing, no page-level live region. Usable at 200 % zoom.

Green appears nowhere: verified programmatically at every viewport. This case
does not resolve.

## 18. Progressive enhancement

The stylesheet's default state is the **final** state. The pre-reveal state
exists only while `SceneMotion` has armed it.

- **No JavaScript** — nothing arms; every canonical value renders. Verified with
  JavaScript disabled: repository, PR, title, recommendation, risk,
  requirements, Human Decision, missing proof, requirement and readiness all
  present.
- **Reduced motion** — the observer never arms; the complete scene renders
  immediately. A media-query override is also present so that a preference
  changed after mount still resolves to the final state.

## 19. Performance

No dependency added. Server-rendered composition; two small client boundaries
(header chrome, scene reveal). CSS transitions only — no animation library.
Zero images, zero external requests, no model call, no persistence, no
telemetry. The route is statically prerendered by `next build`.

## 20. Product truth

Rendered exactly, all verified programmatically at every viewport and with
JavaScript disabled: `example/b2b-redemption-api`, `PR #482`, "Add fallback
handling for failed discount-code retrieval", `Tests required`,
`46/100 · MEDIUM`, `4 open · 2 blocking`, Human Decision `PENDING`.

Every finding, evidence record, provenance string, missing-proof record,
requirement and readiness value is imported verbatim from the typed canonical
module. No record identifier, reviewer name, organisation, selected outcome,
completed decision, cleared requirement, customer claim, model execution,
collaboration feature or enterprise capability is invented.

## 21. Protected scope

Unchanged, verified by `git diff`: `app/page.tsx`, `app/_public-r5`,
`app/_public-r5-recalibrated`, `app/visual-lab/public-r5`,
`app/visual-lab/public-r5-recalibrated`, `app/workspace`, `app/report`,
`app/new`, `app/home`, `app/review-operations`, `app/integrations`,
`app/settings`, `app/review-policies`, `app/team`,
`app/visual-lab/workspace-r4`, `lib/workspace-v2`, `public/r5/scenes`,
`.claude/launch.json`, `package.json`, lockfiles, R4 documentation and accepted
R5 documentation.

## 22. Browser validation

Against a production build (`next build` + `next start`), driven headlessly.

Confirmed: `noindex, nofollow`; one `<main>`; one `<h1>`; exactly one positioned
element (`HEADER → sticky`) at every viewport; zero scrollable descendants
inside `<main>`; no horizontal overflow at any of the six required viewports or
at 200 % zoom; correct navigation destinations; hero scene inside the first
viewport at every viewport; all three scene motion sequences reaching full
opacity when scrolled; reduced motion never arming; JavaScript-disabled
truthfulness; no page error; cumulative layout shift 0; canonical values
unchanged.

Regression sweep, all HTTP 200 with no page errors: `/`,
`/visual-lab/public-r5`, `/visual-lab/public-r5-recalibrated`,
`/workspace?source=fixture`, `/new`.

The one console message is `GET /favicon.ico 404`. It is pre-existing and
application-wide (`public/` contains no favicon) and is not introduced here.

## 23. Known limitations

1. **Visual quality is not self-accepted.** This document records what was
   built and measured. Whether the composition is right is the human gate.
2. Screenshots were captured with headless Chrome driving the production build,
   because the in-app browser pane could not composite frames in this session.
   Interactive click-through testing through that pane was therefore unavailable.
3. 200 % zoom is emulated as a 640 × 400 viewport at device-scale-factor 2,
   which reproduces the CSS-pixel consequences but not browser zoom exactly.
4. Full-page screenshots are captured under emulated reduced motion. A full-page
   capture does not scroll, so scenes below the fold would otherwise photograph
   in their pre-reveal state — a property of the capture, not the page. The
   scrolled per-section captures show the live revealed state.
5. The page has no closing composition. It ends after Missing Proof and
   Requirement, followed by a private boundary note. This is the gate.
6. Cursor's content band is ≈1620 px and Skybase's ≈1598 px; this route uses
   1300 px because the task brief fixes 1240–1320 px. The *ratio* transfers, not
   the absolute width.

## 24. First-gate stopping point

Implemented: compact navigation, hero, hero product scene, Finding and Evidence,
Missing Proof and Requirement.

Not implemented, deliberately: Readiness, Human Decision, Trust, the final
unresolved-case handoff, the footer, production transfer, supporting public
pages.

## 25. Later completion plan

After human visual acceptance of this composition:

1. Readiness section, continuing the alternation (text left, scene right).
2. Human Decision section — in its own bounded section in normal flow, never in
   a sticky shell.
3. Trust — restrained, and only then does the Trust navigation link appear.
4. Unresolved-case handoff.
5. Footer, following the quiet closing composition both references use.
6. Re-validation of the whole page, then a separate production-transfer
   milestone.

If the composition is rejected, the route is deleted and nothing else in the
repository is affected.

## 26. Acceptance evidence

Untracked `R5E1E2A_HUMAN_REVIEW_PACKAGE/` holds the review documents and 19
screenshots: first viewport and full final state at all six required viewports,
the three scrolled section captures, a 1440 × 900 walkthrough, reduced-motion,
JavaScript-disabled and 200 %-zoom captures.

Untracked `R5E1E2A_REFERENCE_VIDEO_ANALYSIS/` holds the media metadata, 126
one-second frames, 598 dense frames, 37 key frames, nine contact sheets and
`VIDEO_COMPARISON.md`.
