# R5E.1E.4B — Finding and Evidence interaction gate

## 1. Purpose

R5E.1E.4B is the first bounded Phase 7 implementation gate. It adds manual
inspection to the accepted Finding and Evidence scene on the private reference
reconstruction only. It does not transfer anything to production and does not
start Hero, Readiness, Missing Proof interaction, or atmospheric work.

## 2. Authoritative contracts

The implementation follows `R5E1E4A_PREMIUM_INTERACTION_ARCHITECTURE_CONTRACT.md`,
`R5E1E4A2_MOTION_CHOREOGRAPHY_CONTRACT.md`, the Phase 7A architecture package,
the Phase 7A.2 motion package, R5E.1E.3 responsive review, and the accepted
R5E.1E.2D reconstruction. Frozen product truth remains the highest authority.

## 3. Implementation scope

Only `app/_public-r5-reference-reconstruction/` changes. The scene gains the
smallest accepted public interaction primitives, two-record inspection,
progressive enhancement, E1–E4 choreography, interruption, responsive and
touch behavior, reduced-motion behavior, and stable shared panel geometry.
There is no provider, global reducer, URL or persistent state, external request,
model call, simulated loading, new route, breakpoint, asset, or dependency.

## 4. Shared primitives

- `PublicSceneViews` owns the local scene state, enhancement boundary, keyboard
  model, manual authority, and the one completion timer.
- `PublicSceneTab` supplies genuine tab semantics and roving tabindex.
- `PublicScenePanel` supplies the shared-grid panel, active/inactive exposure,
  and static-server region semantics.
- `public-interaction-types.ts` fixes the accepted key unions and minimal state
  shape without introducing a provider or reducer.

These primitives are intentionally narrow. Hero and Readiness are typed for the
accepted later gates but are not implemented here.

## 5. Canonical evidence states

The fixed finding is `finding_retry_idempotency`, “Retry behaviour may create
duplicate redemption risk.” The selectable records are exactly:

1. `ev_retry_path` — “Retry path observed in redemption service”; confirmed;
   Rule detected; `app/services/redemption_service.py:118`.
2. `ev_no_idempotency_key` — “No idempotency key present on redemption write”;
   present; Rule detected; `app/clients/partner_code_client.py:64`.

Both support the fixed finding. `ev_retry_path` is the canonical default. All
rendered titles, statements, statuses, provenance, sources, and supports text
come from `PRIMARY_EVIDENCE`, previously verified against frozen case 482.

## 6. Interaction semantics

After enhancement, the two fully visible record surfaces form one vertical
tablist with automatic activation. Up/Down Arrow wrap, Home/End select the
boundary records, pointer/touch activate, and the active tab alone has
`tabindex="0"`. Surface, border, a leading rule, and title weight communicate
selection without relying on color. Re-activating the active tab claims manual
authority without changing the evidence key. No live region or automatic focus
movement is used. The inactive panel is `visibility:hidden`, `aria-hidden`, and
`inert` in the same grid cell.

## 7. Local state

The scene stores only `active`, `authority`, `introductionComplete`,
`hasEnteredViewport`, `reducedMotion`, and `enhanced`. It stores no product
values, dimensions, scroll positions, serialized forms, URL state, or durable
state.

## 8. Manual authority

Any genuine activation immediately sets the newest evidence key, changes
authority to manual, marks the introduction complete, and forces the scene to
its settled motion state. The completion timer is cleaned up and cannot restart
the automatic sequence. State remains local for the mounted page lifetime and
resets only on reload or route reconstruction. Other scenes remain independent.

## 9. Progressive enhancement

The server emits complete static record surfaces, the default `ev_retry_path`
trace, both records’ readable evidence, and no buttons or tab roles. The first
client render uses the same branch. An effect then replaces only the existing
label-area elements with buttons while preserving their box model. Canonical
text is never hidden. No-JavaScript and pre-hydration markup therefore remain
truthful and useful.

## 10. Choreography

The active key remains `ev_retry_path` for the whole automatic introduction.
One existing scene-entry observer starts four local stages: E1 relationship
trace at 760–1,140ms, E2 record region at 1,900–2,200ms, E3 active-record
container at 3,420–3,800ms, and E4 provenance panel at 4,560–4,860ms. Mobile
delays are 570, 1,520, 2,735, and 3,685ms, completing at 3,985ms. Movement is
8px desktop and 4px mobile; meaningful text stays at full opacity. The scene
uses no loop, pulse, glow, height animation, `requestAnimationFrame`, continuous
scroll listener, or second observer.

## 11. Manual interruption

Manual activation settles all E1–E4 targets, updates the semantic active panel
immediately, and applies the accepted local selection/panel transitions. A
manual test during the introduction confirmed unchanged scroll position,
selected-tab focus retention, manual authority, and settled computed panel
transform at the 300ms sampling point. Rapid second/first/second selection ended
on the newest record with one exposed panel and no queued obsolete state.

## 12. Responsive behavior

The required 1920×1080, 1440×900, 1280×800, 1024×768, 834×1112, 768×1024,
430×932, 390×844, 375×812, and 320×568 viewports were exercised against a
production build. Every measured state had zero horizontal overflow, no
internal scrollable descendant, both readable records, one exposed panel, and
identical scene height before/after selection. Existing breakpoints are reused.
Record controls exceed the accepted 44px touch minimum.

## 13. Accessibility

The enhanced scene has one labeled vertical tablist, two tabs, correct
`aria-selected` and `aria-controls`, roving tabindex, two related tab panels,
and only one exposed panel. Keyboard behavior covers Up/Down, wrapping,
Home/End, Enter, Space, and ignores off-axis arrows. Focus remains on the
selected tab. Page checks found one `main`, one H1, visible focus, and no live
region. Static markup contains no non-working controls.

## 14. Reduced motion

`SceneMotion` does not arm when the preference is reduced; local state marks the
introduction complete, the decorative trace is final, and CSS makes remaining
transitions effectively immediate and non-spatial. Interaction and selection
remain available and meaningful text remains at full contrast. Source and
computed-state coverage are recorded; the available in-app browser could not
override its media feature, so a genuine reduced-motion pixel pair remains a
manual evidence item rather than a fabricated artifact.

## 15. No JavaScript

The server response contains zero buttons and zero tab roles in this scene,
both exact record titles, the default trace source, and the supports
relationship. It has no CSS-timed static reveal. The available browser could
not disable JavaScript, so server-response inspection is recorded and a genuine
JavaScript-disabled screenshot remains an explicit manual evidence item.

## 16. Layout stability

Static and enhanced controls share the same CSS box model. Panels overlap in a
single grid area, each trace surface reserves the same minimum height, and no
height is animated. Across all required viewport measurements the scene height
was identical before and after selecting the second record; no selection
produced horizontal overflow or an internal scrollbar.

## 17. Performance

The gate adds one small client boundary, reuses the existing one-shot
`IntersectionObserver`, and schedules at most one completion timeout. CSS
transforms, borders, rules, and surfaces carry motion. There are no dependencies,
images, external requests, model calls, frame loops, scroll handlers, resize
observers, or speculative work. Selection is synchronous local state.

## 18. Product-truth preservation

Selection changes inspection focus only. The finding, recommendation, risk,
requirements, and readiness do not change. Both evidence records are frozen
canonical records and no third record is introduced. No external write,
backend mutation, source loading, or generated evidence exists.

## 19. Meaningful-value proof obligation

The two panels are not repetitions: `ev_retry_path` locates the three-attempt
retry wrapper in `redemption_service.py:118`; `ev_no_idempotency_key` locates
the absent deduplication key at the distinct partner-client write path in
`partner_code_client.py:64`. Together they explain mechanism and missing guard
while supporting the same finding. This is concrete evidence that selection can
improve inspection understanding, but it is not self-acceptance. A human must
decide whether the interaction is clearer than the static relationship; removal
remains the accepted negative outcome.

## 20. Browser evidence

The untracked `R5E1E4B_FINDING_EVIDENCE_REVIEW_PACKAGE/` contains genuine
production-build screenshots for desktop default/selected/focus/automatic
progression/interruption/rapid intent, tablet default/selected, 390px and 320px
default/selected, and a 640×400 responsive equivalent used as a 200% layout
stress check. Structural assertions cover roles, selection, tabindex, panel
exclusion, document landmarks, overflow, internal scroll, and scene height.
True reduced-motion and JavaScript-disabled browser captures and a deliberate
human recording are still required and are marked open.

## 21. Repository validation

`npx tsc --noEmit`, `npm run build`, `git diff --check`, staged-file,
dependency/lockfile, production route, protected private route, frozen product,
asset, launch configuration, and branch checks are the closing validation set.
Generated-file hashes are restored to their exact preflight values after the
final validation run. No file is staged, committed, pushed, or merged.

## 22. Remaining questions

1. Does human review judge the interaction materially clearer than the static
   relationship, or choose the accepted negative outcome?
2. Does a deliberate interaction recording confirm the feel of E1–E4,
   interruption, touch, and rapid intent on real browsers/devices?
3. Do true reduced-motion, JavaScript-disabled, and browser-zoom captures agree
   with the source/structural evidence and responsive equivalent?

## 23. Protected scope

The production homepage, accepted private public routes, frozen R4 product,
workspace/report/new routes, fixtures, public scene assets, dependencies,
lockfiles, launch configuration, Phase 7A contracts, and all prior evidence and
review packages are untouched. The route wrapper has no defect and is unchanged.

## 24. Bounded selected-state visual correction

The initial second-record screenshot exposed a transient visual mismatch: the
active key, `aria-selected`, roving tabindex and exposed panel had already moved
to `ev_no_idempotency_key`, while the outgoing default record could retain its
E3 surface and rail. The cause was CSS transition ownership, not React state.
The settled/manual selector applied the selection transition to every record,
and a delayed E3 transition already scheduled by the browser could survive the
change to manual authority.

The correction is scoped to the Finding/Evidence CSS. Under manual authority,
the old E3 background, border, rail and type-weight transitions are cancelled.
The neutral record receives an immediate neutral surface; the active
`data-selected="true"` record alone receives the selected surface, border,
weight and inset leading rule. The incoming leading rule retains the accepted
140ms selection duration and easing. Focus remains the separate blue
`:focus-visible` outline. No component, state, semantics, canonical data, E1–E4
timing, panel transition, observer or breakpoint changed.

Production-build computed styles and corrected screenshots prove default,
second-without-tab-focus, second-keyboard-focused, keyboard return, rapid
selection, E1 interruption, 390px, 320px and the 640×400 responsive equivalent.
The original affected screenshots remain in the untracked package as the
before-correction evidence and are explicitly superseded by `correction-*`
captures in `SCREENSHOT_MANIFEST.md`.

## Human interaction acceptance and Phase 7B closeout

R5E.1E.4B received human interaction and visual acceptance on 4 August 2026.

The accepted recording was approximately 50.8 seconds at 1920 � 1140 and
demonstrated the complete public route, the Finding and Evidence interaction,
keyboard-visible state changes and the genuine handoff into the sample
Workspace.

The review confirmed:

1. The automatic E1�E4 sequence remains local to the default evidence state.
2. Automatic choreography does not change the selected evidence record.
3. The default retry-path record establishes the retry mechanism and source.
4. The second record exposes the distinct missing safeguard at the partner
   client write boundary.
5. Switching records materially changes provenance, source, supports context
   and inspection implication.
6. The interaction therefore improves understanding and passes the
   meaningful-value proof obligation.
7. Exactly one evidence record owns selected styling at any time.
8. Keyboard focus remains an additive cue rather than the sole selected-state
   indicator.
9. Panel content, ARIA selection, roving tabindex and selected styling remain
   aligned to the same active evidence key.
10. Manual intent cancels unfinished automatic emphasis.
11. Stale default-record styling does not return after manual selection.
12. The interaction remains visually restrained and does not make the public
    scene feel like a second Workspace.
13. The selected review, finding, evidence, recommendation, risk, requirements
    and Human Decision truth remain unchanged.
14. No analysis, loading, repository connection, model call or external write
    is simulated.
15. The genuine sample-review action correctly hands the visitor into the full
    Workspace.
16. Hero and Readiness interaction remain unimplemented and reserved for
    R5E.1E.4C.
17. Missing Proof remains non-interactive and reserved for its accepted
    choreography.
18. Atmospheric surfaces remain outside Phase 7B.

The accepted Finding and Evidence states are:

Default:
ev_retry_path

Second inspection state:
ev_no_idempotency_key

The accepted negative outcome is no longer required. The evidence interaction
has demonstrated sufficient product value to remain part of the public
experience.

Genuine reduced-motion pixels, JavaScript-disabled pixels, browser-controlled
200% zoom, screen-reader review and high-contrast review remain required in the
Phase 7D final interaction gate.

R5E.1E.4B is accepted and closed.
