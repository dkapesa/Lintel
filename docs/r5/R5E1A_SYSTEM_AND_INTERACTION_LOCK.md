# R5E.1A — System and Interaction Lock

Branch: `r5e1a-system-interaction-lock`
Status: documentation only. No React component, CSS rule, route, dependency,
asset or production page was created or modified by this milestone.
Owning phase: R5E.1 — deliberate recalibration of Lintel's public visual
identity, composition and interactive product storytelling.

R5E is accepted, committed, merged and closed
(`docs/r5/R5E_PUBLIC_MOTION_SYSTEM.md`, human visual acceptance recorded
2 August 2026). R5E.1 begins from that closed state.

This document is the top-level authority for R5E.1. Four companion documents
own bounded areas:

| Document | Owns |
|---|---|
| `R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md` | Public navigation, destinations, header/footer contract, future public IA |
| `R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` | The canonical live demonstration, its typed state model, guided/manual coordination |
| `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` | Token registry, surfaces, semantic colour, typography, image policy, reference boundary |
| `R5E1A_IMPLEMENTATION_HANDOFF.md` | R5E.1B–F scope, deliverables, acceptance gates, validation duties |

Where this document and a companion appear to conflict, the companion is
authoritative inside its owned area and this document is authoritative for
everything else.

---

## 1. Central direction

The locked working direction is:

> **Cursor's product-led composition and motion discipline, translated
> through Lintel's verification model and enterprise engineering identity.**

Cursor is the **sole primary visible reference**.

Skybase is **evidence** that committing strongly to one design operating
system produces visual coherence. It is not a visual source. Nothing from
Skybase's environmental imagery, palette or composition enters the page.

Supporting references remain narrowly bounded:

1. **incident.io** may inform enterprise trust, operational clarity and
   public information architecture only.
2. **Attio** may inform structured records, metadata and relationship
   clarity only.
3. Neither may introduce a competing outer visual identity.

The final page must not look like a collage of references. The public
experience should feel as coherent as Cursor while remaining recognisably
and truthfully Lintel.

The reference learn/never-copy boundary and the five originality tests are
held in `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §5–§7.

---

## 2. Source authority

### 2a. Documents read to produce this lock

`docs/r5/README.md`; `R5A_DIRECTION_LOCK.md`;
`R5B_LANDING_PAGE_ARCHITECTURE.md`; `R5B1_SCENE_RESOLUTION_ADDENDUM.md`;
`R5C_PRIVATE_PUBLIC_VISUAL_LABORATORY.md`;
`R5D_PRODUCTION_HOMEPAGE_TRANSFER.md`; `R5E_PUBLIC_MOTION_SYSTEM.md`;
`app/_public-r5/PublicR5Page.tsx`, `sections.tsx`, `content.ts`,
`public-r5.module.css`; the minimum R4 documents needed to confirm product
truth — `docs/r4/R4A_WORKSPACE_SHELL_CONTRACT.md`,
`docs/r4/R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md`,
`docs/r4/R4B_RESPONSIVE_KEYBOARD_FOCUS.md`; the frozen canonical fixture
`lib/workspace-v2/fixture-adapter.ts`; and textual evidence under
`R5E_HUMAN_REVIEW_PACKAGE/`.

No broad repository audit was conducted.

### 2b. Authority order for R5E.1

1. **Frozen R4 product truth** — the shipped product and its fixture data.
2. **This document and its four R5E.1A companions**, for public visual
   identity, composition, navigation and public interaction.
3. `R5B1_SCENE_RESOLUTION_ADDENDUM.md`, for any product-scene source detail
   still in use.
4. `R5A_DIRECTION_LOCK.md`, `R5B_LANDING_PAGE_ARCHITECTURE.md`,
   `R5C/R5D/R5E`, for everything R5E.1A does not supersede.

**Frozen R4 product truth always outranks public visual preference.** Where
a composition idea in this phase would require a value, label, identifier or
state the product does not have, the composition changes — never the
product truth.

Earlier R5 documents remain historical decisions of record. None was edited
to produce R5E.1A, and none may be rewritten by any later R5E.1 subphase.

### 2c. Two product-truth conflicts resolved by this lock

**i. Record identifier grammar.** The R5E.1A brief sketches a public record
grammar of the form `EV-07`, `MP-02`, `REQ-04 · BLOCKING`. The frozen
product does not use that grammar. Its canonical records are
`ev_retry_path`, `ev_no_idempotency_key`, `ev_coverage_gap`,
`ev_error_shape_inferred`, `ev_prior_load_test`, `req_test_idempotency`,
`req_test_provider_failure`, `finding_retry_idempotency`, and the only place
the shipped Workspace renders an identifier in monospace is the derived
missing-proof row's source attribution
(`app/workspace/WorkspaceR4Client.tsx`, missing-or-unverified-proof
section: `status · class · source ev_coverage_gap`).

Locked resolution: the `EV-07 / MP-02 / REQ-04` forms are **illustrative
composition sketches, not shippable identifiers**. The public demonstration
may display only (a) the genuine product stage numbers `01`–`08`, and (b)
metadata the frozen product itself displays — severity, category,
provenance, evidence class, status words (`confirmed`, `present`, `missing`,
`unverified`, `stale`, `blocking · open`, `Derived · not persisted`), file
paths, `Head 9c41af2`, the branch, and the product's own record identifier
in the one place the product shows it. Inventing a sequential public
identifier scheme is prohibited: it would be a public structural invention
capable of being mistaken for product behaviour, which `R5A_DIRECTION_LOCK.md`
§15 and `R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md` both forbid. The
restrained-monospace intent behind the sketch is preserved by (a) and (b);
only the invented codes are dropped.

**ii. Canonical repository and blocking count.**
`docs/r4/R4A_PRODUCT_TRUTH_ACCESSIBILITY_PERFORMANCE.md` §"Screenshot-only
evidence and canonical scenario" names the R4C laboratory case as
`acme/redemption-api` with `4 open, 4 blocking`. The frozen product
(`lib/workspace-v2/fixture-adapter.ts`) carries `example/b2b-redemption-api`
with two `blocking` requirements among four open. R5A §4, R5B §7, R5B.1,
`app/_public-r5/content.ts` and the R5E.1A brief all carry
`example/b2b-redemption-api` and `4 open · 2 blocking`. The frozen product
is authoritative; the R4A planning values are superseded for public use and
must not be reintroduced.

---

## 3. Supersession record

R5E.1A deliberately changes parts of the earlier public visual direction.
Each change is recorded here. Everything not listed remains in force.

| # | Superseded decision | Source | R5E.1 replacement |
|---|---|---|---|
| S1 | Warm neutral page ground (`#f7f4ee`) | R5A §7; R5C §3 | One continuous white canvas, `#FFFFFF` (§4) |
| S2 | Exactly two full-width charcoal sections at positions 3 and 7 | R5A §7; R5B §14 | No full-width charcoal section anywhere; no alternating coloured bands (§4) |
| S3 | Static header that scrolls away and never returns | R5B §3e | Sticky, compact, white header, ~60–64px, quiet active-section indication, no layout movement on state change (Navigation contract §3) |
| S4 | Navigation label `Security` | R5B §3b, §16e | `Trust` (Navigation contract §2) |
| S5 | Cropped static screenshots as the page's primary visual system | R5A §9; R5B §13 | One live, read-only HTML product demonstration is primary; static imagery becomes supporting evidence (§7, Visual system §4) |
| S6 | Exactly three motion moments, whole-scene screenshot entrances | R5A §11; R5B §18; R5E §4, §8 | Motion corresponds to product operations across the demo state model; whole-scene screenshot fades no longer carry the principal product story (§9) |
| S7 | Eight-section page composition | R5B §5, §14 | Five connected movements; the eight sections remain useful semantic source material (§10) |
| S8 | Reference hierarchy Cursor / incident.io / Littlebird, with Attio and Vercel excluded | R5A §13 | Cursor sole primary visible reference; Skybase as evidence; incident.io and Attio bounded supporting references. Attio is explicitly reintroduced under the bound in §1.3. Littlebird is no longer a named reference. Vercel remains excluded. |
| S9 | Public page is fully server-rendered with no client component | R5C §2; R5D §12 | One small client-owned product stage is permitted; the rest of the page stays server-rendered where practical (§12) |
| S10 | Centred desktop hero copy block | R5C §13c | Left-aligned hero and live product stage (§10, movement one) |
| S11 | Prohibition on any persistent public page structure being read as product behaviour | R5A §17.16–17.17 | Narrowed, not lifted (§3a) |

### 3a. How S11 is narrowed

R5A rejected a persistent public page index and a fixed public product
summary band because both were **public inventions** that a visitor could
mistake for product behaviour. That reasoning is preserved. What changes is
that the recalibrated page contains a genuine, honestly-labelled product
surface, so the same visual persistence is no longer an invention.

Permitted under the narrowed rule:

1. A sticky public header carrying identity, three in-page labels and one
   action, with quiet active-section indication. It carries **no**
   recommendation, risk, requirement or Human Decision value.
2. The live demonstration's own persistent Workspace shell, including the
   product's own summary values, because it is the product's own surface
   reproduced truthfully and labelled as a read-only sample.
3. The verification spine, scoped to the demonstration section, bound to
   demo state.

Still prohibited: any page-level index or summary band outside the
demonstration; any public chrome that displays product values; any invented
element that reads as product behaviour.

---

## 4. White canvas lock

The recalibrated public website uses **one continuous white canvas**.

Locked:

1. Public page background: `#FFFFFF`.
2. All major public sections remain white.
3. Public header remains white.
4. Public footer remains white unless a later, formally accepted direction
   explicitly changes it.
5. No full-width charcoal sections.
6. No alternating coloured section bands.
7. No gradients.
8. No atmospheric sky fields.
9. No decorative tinted canvases.
10. No glass or blur-led visual identity.
11. No dark section added merely to create visual contrast.

Neutral product surfaces remain allowed **inside** the live Lintel
demonstration: white primary surfaces; very pale neutral Queue and Inspector
surfaces; quiet selected states; fine grey dividers; dimmed review context
behind Human Decision; black primary actions; sparse semantic colour.

The provisional public token registry and the semantic colour meanings are
held in `R5E1A_VISUAL_SYSTEM_REFERENCE_AND_IMAGE_LOCK.md` §2–§3, which is
the single place token values may be edited. Exact token implementation is
validated during prototype work; the continuous white-canvas direction is
frozen now and is not a prototype question.

---

## 5. Canonical live demonstration

The homepage demonstrates real product behaviour through a controlled,
read-only public implementation. It is **not** a second complete Lintel
application, and it does not replace the real sample at
`/workspace?source=fixture`.

The demo uses one fixed canonical case, unchanged throughout:

| Field | Locked value |
|---|---|
| Repository | `example/b2b-redemption-api` |
| PR | `#482` |
| Title | `Add fallback handling for failed discount-code retrieval` |
| Recommendation | `TESTS REQUIRED` |
| Risk | `46/100 · MEDIUM` |
| Requirements | `4 open · 2 blocking` |
| Human Decision | `PENDING` |

**The visitor changes what they inspect, not the truth of the review.**

Genuine states the demo must support: PR selection, Workspace overview,
finding focus, evidence inspection, missing proof, blocking requirement,
affected context, readiness, Human Decision surface.

The demo must not: call a model; create a review; write to local storage;
record a Human Decision; send GitHub or Slack actions; perform external
writes; imply hosted collaboration; imply that live analysis is running;
change canonical fixture values; or replace the complete sample Workspace.

It must be labelled honestly as an interactive sample or read-only product
demonstration.

Full detail — allowed and prohibited behaviours, the typed state model,
event set, reducer contract, single-fixture rule, no-JavaScript resting
state and decision-surface semantics — is held in
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md`.

---

## 6. Persistent Workspace shell

The central live experience uses one stable Lintel shell, preserving the R4
hierarchy from `docs/r4/R4A_WORKSPACE_SHELL_CONTRACT.md`:

`Global Rail → Review Queue → Verification Workspace → Contextual Inspector`

Provisional desktop public-stage ranges:

| Region | Public-stage range | Frozen R4 application value (not changed) |
|---|---|---|
| Global Rail | ~44–52px | 52px default, 52–56px range |
| Review Queue | ~220–260px | 264px default, 248–276px range |
| Workspace | flexible dominant area | flexible, 640px usable content target |
| Inspector | ~290–340px | 352px default, 320–380px range |

These are **public-demo ranges for a reduced public stage**, not permission
to alter the frozen R4 application shell. The Workspace remains visually
dominant in every state; no region may assume another region's
responsibility.

Across all guided states:

1. PR #482 remains selected.
2. Repository and PR identity remain stable.
3. Recommendation remains `TESTS REQUIRED`.
4. Risk remains `46/100 MEDIUM`.
5. Requirements remain `4 open · 2 blocking`.
6. Human Decision remains pending.
7. The application frame remains stable.
8. Only the active record, Workspace focus and Inspector content change.

**Hero state:** the shell is already present; PR #482 receives precise
selected emphasis; the overview resolves around that selection;
recommendation, risk, open requirements and Human Decision are legible; and
nothing implies a review is being generated.

**Central investigation:** the same shell remains visible; the Queue may
become quieter or more compact; the Workspace remains dominant; the
Inspector follows the active record; the shell must not appear to be a
different product state assembled from another unrelated screenshot.

**Human Decision:** the Workspace remains recognisable; the decision surface
opens as a separate layer; all outcomes remain unselected; the read-only
boundary remains explicit; nothing is submitted or recorded.

---

## 7. Verification spine

The verification spine becomes Lintel's primary public visual mechanism.

Stages, in the product's own order and numbering:

```
01 Change
02 Finding
03 Evidence
04 Missing proof
05 Requirement
06 Affected context
07 Readiness
08 Human Decision
```

The spine is **not** a generic progress stepper. It must support:

1. unresolved states across multiple stages simultaneously;
2. evidence existing while proof remains incomplete;
3. open and blocking requirements;
4. a recommendation that precedes Human Decision;
5. provenance links between records;
6. a pending Human Decision;
7. non-linear evidence relationships where necessary.

Visual rules:

1. Selection blue for active focus.
2. Amber for missing proof or unresolved tests.
3. Red only for genuinely blocking state.
4. Green only for genuinely cleared state.
5. Neutral pending Human Decision.
6. Identifiers and metadata in restrained monospace, subject to the
   identifier constraint in §2c.i.
7. Relationship lines remain structural and quiet.
8. No decorative glowing path.
9. No checkout-style completion ticks by default.

Because the canonical case never resolves, green must not appear against any
stage of the canonical story; stage `08 Human Decision` renders neutral and
pending, never complete.

**Desktop:** the spine remains visible beside or within the central
demonstration. It may be sticky within its own section; it must not become
global page chrome (§3a).

**Mobile:** do not compress all eight labels into a tiny horizontal stepper.
Use a compact state such as:

```
03 of 08
Evidence
```

with accessible previous, next and expandable stage-list behaviour
implemented in R5E.1C. Any per-record identifier shown in the compact state
must satisfy §2c.i.

---

## 8. Guided and manual interaction

The public demo supports both guided scrolling and direct visitor
interaction.

**Guided behaviour.** Scrolling advances through the canonical
investigation:

`PR selection → Finding → Evidence → Missing proof → Requirement →
Affected context → Readiness → Human Decision`

**Manual behaviour.** Visitors can directly activate meaningful controls:
the PR #482 Queue row; verification stages; finding records; evidence
records; missing-proof records; the blocking requirement; affected context;
readiness; Human Decision.

**Frozen precedence rule: manual visitor intent always wins over automated
choreography.**

After a visitor manually selects a state:

1. Guided state changes pause.
2. Their selected record remains active.
3. Nearby scroll movement does not immediately replace the selection.
4. A quiet `Resume guided tour` or `Replay` action may restore the sequence.
5. The page must not fight the visitor.

The guided story must not repeatedly reset while visitors scroll upward and
downward. A full reset may occur only through explicit replay, explicit
reset, or a full page reload.

Prohibited: forced scroll behaviour; scroll-wheel hijacking; trapping the
visitor inside the demonstration; aggressive snapping between stages;
requiring completion before leaving the section; horizontal scroll theatre;
blocking normal touch scrolling.

The state machine that enforces this precedence is specified in
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §4–§6.

---

## 9. Motion choreography

Motion must correspond to product operations. Permitted meanings:

1. selecting PR #482;
2. focusing a finding;
3. opening evidence;
4. following provenance;
5. exposing missing proof;
6. opening a blocking requirement;
7. inspecting readiness;
8. opening Human Decision.

Whole-scene screenshot fades must no longer carry the principal product
story (S6).

Provisional easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`.

| Motion class | Provisional duration |
|---|---|
| Hover and local emphasis | 120–160ms |
| Selection and record changes | 180–240ms |
| Inspector and panel changes | 200–260ms |
| Human Decision surface | 220–280ms |
| Provenance trace | up to 320ms where required for comprehension |

Avoid: bounce; springs; parallax; large zooms; constant loops; decorative
auto-animation; repeated entrance fades; layout-dimension animation;
cumulative layout shift; and any motion implying state creation or
completion.

**Reduced motion:** state changes happen immediately; all content remains
usable; no essential opacity or positional transition exists; verification
state still updates; manual interaction still works; the Human Decision
surface opens without movement.

Motion may open the Human Decision surface. Motion may never complete a
decision, clear a requirement, or change a canonical value.

---

## 10. Page composition

The existing eight sections remain useful semantic source material. The
recalibrated public experience moves to **five connected movements**.

| Movement | Responsibility | Carried forward from |
|---|---|---|
| 1 | Selected review | R5B §5.1 hero |
| 2 | Verification gap | R5B §5.2 problem |
| 3 | Follow the verification record | R5B §5.3–§5.5 model, workspace, missing proof |
| 4 | Accountable decision | R5B §5.6 readiness and Human Decision |
| 5 | Trust and continuation | R5B §5.7–§5.8 architecture and final action |

**Movement one.** Left-aligned hero and live product stage. The hero keeps
its accepted elements — proposition line, short supporting explanation,
primary action, secondary action, quiet trust line — with the live stage
replacing the static hero screenshot. The accepted headline
`Know what is ready to merge.` and the accepted trust line
`Deterministic by default. Model assistance is optional. The engineer decides.`
are unchanged by this milestone.

**Movement two.** Uses the accepted problem statement:

> Changes arrive faster than proof does.

The live shell demonstrates the gap between a code change and sufficient
proof.

**Movement three.** One persistent shell follows
`Finding → Evidence → Missing proof → Requirement → Affected context →
Readiness`.

**Movement four.** Human Decision opens over the same unresolved review.

**Movement five.** A compact trust boundary followed by the unresolved-case
handoff.

The page must no longer rely on repeating
`Eyebrow → Headline → Paragraph → Screenshot`. The experience should feel
like one investigation rather than separate presentation slides.

Production implementation is not part of R5E.1A. Exact copy for each
movement is an R5E.1B–E deliverable, constrained by R5A §16 copy principles
and R5B §15's language system, both of which remain in force.

---

## 11. Responsive contract

Intended behaviour at the six required viewports.

| Viewport | Class | Intended behaviour |
|---|---|---|
| 1600×1000 | Desktop | Stable shell; Queue, Workspace and Inspector all visible; verification spine visible; sticky guided case may be used; normal page scrolling remains available |
| 1280×800 | Desktop | As above; Queue and Inspector may sit at the lower end of their ranges |
| 1024×768 | Large tablet | Stable shell retained where space permits; Inspector may narrow to its minimum before becoming a controlled panel |
| 768×1024 | Narrow tablet | Queue may become compact; Inspector may become a contextual drawer or controlled panel; Workspace remains dominant; stage controls remain accessible |
| 390×844 | Mobile | Deliberate sequential composition; compact current-stage control replaces the eight-stage spine |
| 320×568 | Mobile | As 390×844, with no horizontal document overflow at any point |

Mobile requirements, restated as binding:

1. No compressed desktop shell.
2. The product scene becomes a deliberate sequential composition.
3. A current-stage control replaces the full eight-stage spine.
4. All interactive targets remain reachable.
5. No horizontal document overflow.
6. No scroll trapping.
7. No essential delayed visibility.
8. Manual interaction remains available.
9. Guided transitions may be simplified.
10. Human Decision remains read-only and understandable.

The mobile system must not be merely a scaled-down desktop screenshot.

This public responsive contract does not alter the frozen application
resolver in `docs/r4/R4B_RESPONSIVE_KEYBOARD_FOCUS.md`; the public demo is a
reduced public stage, not the application.

---

## 12. Accessibility

Frozen requirements for all R5E.1 implementation:

1. Semantic buttons and links.
2. Visible focus.
3. Logical tab order.
4. Queue row activatable by keyboard.
5. Verification stages keyboard accessible.
6. Human Decision manually openable and closable.
7. No focus stealing during scroll choreography.
8. No noisy live-region announcements for decorative state changes.
9. No meaning conveyed through motion alone.
10. No meaning conveyed through colour alone.
11. Sufficient contrast.
12. Complete reduced-motion treatment.
13. No global arrow-key hijacking.
14. Arrow-key behaviour only within a clearly focused composite control.
15. The guided Human Decision preview must not trap focus.
16. A manually opened decision dialog must follow proper dialog behaviour.
17. Escape closes manually opened overlays where appropriate.
18. Focus returns to the triggering control.
19. 200% zoom remains usable.
20. Source order remains coherent without visual positioning.

### 12a. The two Human Decision surfaces are different things

This distinction is binding and must be implemented literally.

| | **Guided preview** | **Manually activated dialog** |
|---|---|---|
| How it appears | Reached by scrolling; the demo advances to the `human-decision` state on its own | The visitor activates a control |
| Semantics | Ordinary in-page content within the demonstration. Not `role="dialog"`, not `aria-modal` | Full dialog semantics: `role="dialog"`, `aria-modal="true"`, labelled by its own heading |
| Focus | Never moved by the guided advance. No focus trap. Nothing outside is made inert | Initial focus deliberate; focus contained; Escape closes; focus returns to the triggering control |
| Background | The page remains scrollable and operable | Background may be inert while open |
| Announcement | No assertive announcement; at most one restrained polite status message | Standard dialog announcement |

Rationale: a document-level modal that a visitor never asked for would trap
keyboard and screen-reader users mid-scroll. The guided sequence therefore
*shows* the decision surface; only an explicit activation *opens* a dialog.

Both surfaces render every outcome unselected, keep the read-only boundary
explicit, and record nothing.

---

## 13. Performance and product-truth boundaries

The later public demo must:

1. use one small client-owned product stage;
2. keep the rest of the page server rendered where practical;
3. use one canonical fixture;
4. use one reducer or explicit state machine;
5. avoid animation dependencies unless native tools prove inadequate;
6. avoid continuous scroll listeners where observers suffice;
7. avoid layout measurement loops;
8. avoid canvas, WebGL and video backgrounds;
9. avoid model calls;
10. avoid telemetry;
11. avoid persistence;
12. avoid external writes;
13. avoid hydration-dependent initial visibility;
14. remain understandable without JavaScript;
15. remain complete with reduced motion;
16. preserve route and metadata truth;
17. preserve the production homepage until the private laboratory is
    accepted.

Items 13 and 14 together mean the demonstration's resting state must be
fully server-rendered and truthful on its own: PR #482 selected, the
overview resolved around it, the four canonical values legible, the spine
present, Human Decision pending. Interaction is progressive enhancement over
that state. This is specified in
`R5E1A_LIVE_DEMO_AND_STATE_MODEL_CONTRACT.md` §8.

Planned private route for later prototype work:

```
/visual-lab/public-r5-recalibrated
```

It must be `noindex, nofollow`. **It was not created during R5E.1A.**

The production homepage at `/` and the existing private laboratory at
`/visual-lab/public-r5` remain exactly as R5E left them until R5E.1E is
assembled and R5E.1F formally accepts a transfer.

---

## 14. R5E.1 subphase contract

| Phase | Name | Type | Model | Effort |
|---|---|---|---|---|
| R5E.1A | System and Interaction Lock | Documentation only | Opus 5 | Extra |
| R5E.1B | Navigation, Hero and Live Shell Prototype | Implementation | Sonnet 5 | High |
| R5E.1C | Verification Journey Prototype | Implementation | Sonnet 5 | Extra |
| R5E.1D | Readiness, Human Decision and Handoff | Implementation | Sonnet 5 | High |
| R5E.1E | Full Private Recalibrated Laboratory | Assembly | Sonnet 5 | High |
| R5E.1F | Visual Direction Review and Freeze | Review and freeze | Opus 5 | Extra |

Goals:

- **R5E.1B** — prove the white canvas, final navigation, left-aligned hero,
  persistent shell, PR selection, overview, finding focus and initial spine.
- **R5E.1C** — implement Finding, Evidence, Missing proof, Requirement,
  Affected context, Readiness, guided/manual coordination, the verification
  spine, keyboard behaviour and reduced motion.
- **R5E.1D** — complete readiness, Human Decision, read-only boundaries,
  trust and unresolved-case continuation.
- **R5E.1E** — assemble the accepted prototypes into one complete private
  public experience.
- **R5E.1F** — review and freeze visual identity, navigation, composition,
  live demo, responsive behaviour, motion, accessibility and
  production-transfer boundaries.

Fast mode remains off throughout.

Codex may be used **after** implementation phases only, and only for focused
engineering validation, debugging, accessibility defects, hydration
problems, responsive regressions and performance investigation. Codex must
not independently redesign accepted work.

Per-phase deliverables, boundaries and acceptance gates are in
`R5E1A_IMPLEMENTATION_HANDOFF.md`.

---

## 15. Closed decisions

The following are frozen by R5E.1A and may not be reopened by R5E.1B–F.
Changing any of them requires a new, explicit human decision recorded in a
new document.

1. One continuous white public canvas.
2. Cursor as the sole primary visible reference.
3. The persistent Workspace shell as the central public mechanism.
4. Live product behaviour rather than screenshot storytelling.
5. Manual visitor intent taking precedence over guided choreography.
6. The verification spine and its eight product stages.
7. The read-only canonical PR #482 case and its five locked values.
8. Compact public navigation.
9. No invented dropdowns and no invented destinations.
10. The production homepage remaining untouched until R5E.1F accepts a
    transfer.

---

## 16. R5E.1A acceptance checklist

1. One direction is recorded and no competing direction remains open. ☐
2. Cursor is named as the sole primary visible reference, with Skybase as
   evidence and incident.io and Attio bounded. ☐
3. Every deliberate change to the earlier public visual direction is
   recorded as a numbered supersession with its source. ☐
4. The white canvas is locked, with the eleven prohibitions stated and the
   permitted neutral product surfaces named. ☐
5. The canonical case, its five locked values and the demo's prohibited
   behaviours are stated. ☐
6. The persistent shell preserves the R4 hierarchy and states public-stage
   ranges without altering the frozen application. ☐
7. The verification spine is specified as a record system, not a progress
   stepper, with mobile behaviour named. ☐
8. Manual intent precedence over guided choreography is frozen. ☐
9. Motion meanings, easing, timing ranges, prohibitions and reduced-motion
   behaviour are stated. ☐
10. Five movements are named and mapped to the earlier eight sections. ☐
11. All six viewports have documented intended behaviour. ☐
12. Twenty accessibility requirements are frozen and the guided-preview
    versus dialog distinction is documented. ☐
13. Performance and product-truth boundaries are stated, including the
    no-JavaScript resting state. ☐
14. The six-phase R5E.1 workstream, its models and its effort levels are
    recorded. ☐
15. Product-truth conflicts found during this pass are resolved in favour of
    the frozen product and recorded. ☐
16. No React component, CSS rule, route, dependency, asset or production
    page was created or modified. ☐
17. No earlier R5 or R4 document was edited. ☐

## Human acceptance and closeout

R5E.1A received human acceptance on 2 August 2026.

The milestone freezes the system and interaction direction governing R5E.1B through R5E.1F.

The following decisions are accepted:

1. The public experience uses one continuous white canvas.
2. Cursor is the sole primary visible reference.
3. Lintel's verification model, persistent canonical case and Human Decision authority provide the actual identity.
4. The homepage's primary visual system will be a controlled live HTML demonstration rather than a sequence of animated screenshots.
5. The demonstration preserves one stable Queue, Workspace and Inspector shell.
6. Manual visitor intent overrides guided scroll choreography.
7. The verification spine represents a traceable unresolved record rather than linear completion.
8. The canonical fixture remains read-only and its values do not change during the demonstration.
9. Invented sequential record identifiers must not be presented as implemented product behaviour.
10. The production homepage remains unchanged until the complete private recalibrated experience receives acceptance.
11. R5E.1B is limited to navigation, hero, live shell, PR selection, overview, first finding focus and the initial verification-spine treatment.

The R5E.1A human review package remains local and untracked.

R5E.1A is accepted and closed.
