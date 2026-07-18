# V8 Experience Storyboard

**Status:** Storyboard proposals approved for implementation planning; not animation code  
**Read with:** [V8 Motion Constitution](./V8_MOTION_CONSTITUTION.md)  
**Fixed baseline:** LVOS v1.0, VC-1, VC-2, VC-3 and VC-4 remain unchanged.

## Reading key

Each proposal names a real trigger, final state and reduced-motion state. “Stable” means no visual movement; its data may still update atomically. No sequence simulates analysis, approval, merge or loading.

## 1. Landing — one persistent Case File

Normal document scrolling remains authoritative. The landing is not a scrolling presentation.

| Sequence | Trigger / changed meaning | Moving elements / direction / class | Final state and static equivalent | Access and boundary / non-goal |
| --- | --- | --- | --- | --- |
| Hero arrival | First paint; product proof becomes legible | At most the Case File proof crop receives restrained opacity emphasis; no page entrance; `narrative` only if implemented | PR #482, trace, recommendation, C1 and pending decision are already readable; reduced mode is the same final frame | No focus move or announcement. V8B landing only; no theatrical hero, loading or reveal cascade. |
| Case File orientation | Hero product stage enters ordinary view | The existing Case File outline and central record receive one-time emphasis, not travel | Visitor can locate PR #482, recommendation, risk and unresolved decision | No sticky trap or auto-scroll; maintain one persistent case rather than rotating mockups. |
| Readiness gap | Readiness section earns view ownership | Selection emphasis transfers from passed CI context to unresolved observation list; local state/colour only, `state` | CI passed remains visible while unresolved observation is the active interpretation | No counter, failure pulse or fabricated evaluation. |
| Finding → evidence | Finding exhibit enters view / F1 becomes the active record | F1 focus gives E1 attached-record emphasis within the same exhibit; short opacity/transform relationship, `narrative` | E1 is visibly attached to F1, never presented as a separate floating card | No live announcement; do not animate an evidence “discovery.” |
| Evidence → requirement | Merge Contract section owns the story / E1 now explains C1 | Relationship emphasis progresses into C1 and its clearance path; `narrative`, downward document direction only | C1 remains OPEN · BLOCKING with required proof and related records | Never visually clear C1 or imply evidence satisfies it. |
| Merge Contract | Contract exhibit becomes active | Expanded C1 receives local disclosure/focus emphasis; no auto-height accordion travel | Open clause is the active record, with clearance path readable immediately | No automated clause expansion based on scroll if it hides content; C2/C3 remain static context. |
| Verification ledger | Ledger section enters / narrative quietens toward authority | Prior emphasis settles; trace/ledger receives subtle opacity hand-off, `narrative` | Requirement and Human decision are adjacent, readable records | No animated trace progression that implies real work occurred. |
| Human Authority | Decision section enters / machine analysis yields to accountable judgment | The decision plane becomes the focal product plane while recommendation de-emphasises; `narrative` | Recommendation remains contextual; pending engineer decision is terminal focus | Do not animate a decision, person, signature or status resolution. |
| Final trace | Final trace enters / sample remains unresolved | No node travel; optional one-time static emphasis on open decision diamond | Open diamond remains open | No success finish or looping trace. |
| Next Case File | User activates final CTA / moves from sample to own review | Ordinary link/pressed feedback only; route navigation owns any transition | User leaves the sample for their review entry point | No faux hand-off, loading or progress sequence. |

### Landing scroll model

**Permitted:** `IntersectionObserver`-owned, one-time section ownership; restrained entrance emphasis; sticky product stage only where normal document scrolling remains intact; clear selected-record changes; responsive product crops that retain essential text.

**Required:** no wheel interception, snapping, trap, continuous scroll-linked animation, hidden essential text, completion-gated content or forced back-scroll replay. Back-scroll restores predictable static section ownership; reduced motion renders final readable states.

**Scene decision:** Hero orientation, F1/E1, C1/clearance path and Human Authority benefit from staged ownership. Readiness should use static local emphasis. The final trace and Next Case File remain static except normal control feedback. The ledger may only receive a quiet one-time hand-off, never a scrolling timeline.

## 2. Workspace — completed VC-4 workbench

| Sequence | Trigger / changed meaning | Moving plane; stable plane and why | Class / final + reduced state | Access and boundary / non-goal |
| --- | --- | --- | --- | --- |
| Queue selection | User selects another report / case ownership changes | Queue selected row gets local emphasis; canvas and inspector project new case. Shell and unrelated rows remain stable to protect orientation | `state`; atomic new case, instant/short-opacity reduced | Retain queue focus. May announce the new selected-case summary only after user action; no whole-workbench slide. |
| Selected-case reconciliation | New group resolves / canvas and inspector must agree | Canvas and inspector content project together; queue remains stable | `state`; both show the same report key, instant/short-opacity reduced | Never show stale inspector details or a loading fiction. |
| Working-mode change | Overview → Findings → Requirements → Human decision / active work lens changes | Centre canvas content changes; queue and inspector frame remain stable | `state`; selected mode and focus agree, instant/short-opacity reduced | No horizontal page/pane sweep; no fake reanalysis. |
| Finding focus | User chooses finding / F becomes active with attached proof | Centre finding record and related inspector block get local emphasis; attached evidence remains visibly connected; other planes stable | `state`; focused F and related evidence clear, instant/short-opacity reduced | No evidence flies between panes; visual relation supplements explicit identifiers. |
| Evidence focus | User chooses E / observed proof becomes active | Centre evidence record and inspector evidence projection agree; queue stable | `state`; E identity/source/provenance clear, instant/short-opacity reduced | Do not imply E clears a requirement. |
| Requirement focus | User chooses C or condition / clearance path becomes active | Centre requirement and inspector clearance/related-record block change together; queue stable | `state`; C status and proof path clear, instant/short-opacity reduced | Do not animate C into satisfied status. |
| Contextual-inspector projection | Artifact type changes / inspector ownership changes from case to F/E/C/decision | Inspector content only; canvas selection marker remains stable | `state`; matching artifact projection without app reload, instant/short-opacity reduced | No spinner, full-app fade or layout resize. |
| Human Decision focus | User enters Human decision / authority plane becomes canonical explanation | Centre decision context and inspector decision explanation project; recommendation remains context, queue stable | `state`; pending/canonical decision record and local-state distinction readable, instant/short-opacity reduced | No autonomous outcome or recommendation-to-decision morph. |
| Responsive selected-case surface | User opens selected case below desktop / ownership moves Queue → working layer → Canvas/Inspector | Intermediate/mobile working layer is the only moving plane; queue remains visibly behind or is semantically inert | `spatial`; bounded/full-width layer owns case, instant replacement reduced | Trap focus and inert background at state start; only one modal layer; close restores triggering queue record. |
| Delete/filter reconciliation | User deletes or changes filter / selected report disappears or remains | No plane travels. Queue replacement and canvas/inspector reconciliation are atomic; unaffected rows stable | `immediate`/`state` only if new valid selection appears; instant reduced | Focus resolves to a deterministic queue target or empty state. No dramatic collapse or stale artifact. |

## 3. Case File — bounded dossier motion

The dossier remains document-like and stable. It is not a scrolling presentation.

| Sequence | Trigger / changed meaning | Movement / final + reduced state | Access and non-goal |
| --- | --- | --- | --- |
| Active outline location | User jump or ordinary section reading / current dossier location changes | Selected outline rule/plane updates; optional existing smooth jump remains bounded; instant scroll under reduced motion | Current section remains textually named. No continuous outline animation. |
| Jump to section | User activates jump / document destination changes | Browser/document scroll, not product choreography; `spatial` at most for explicit user-initiated smooth scroll | Keep focus where user expects unless destination action requires focus. No scroll-jack. |
| Focused record | User opens or selects a finding/evidence record / active inspection context changes | Local `state` emphasis or disclosure only; all dossier geometry remains stable | No record flies to a rail or simulates analysis. |
| Finding/evidence attachment | User focuses a related record / relationship becomes active | F/E relation gets short local emphasis, `state`; reduced is static related-record state | Identifiers and written relation remain sufficient; no live announcement. |
| Merge Contract clause | User expands C1 / clearance context becomes visible | Bounded disclosure using opacity/clip only if it avoids shift; content is immediately available reduced | No auto-expansion, artificial progress or animated height. |
| Decision sheet | User opens/closes compact decision surface / verdict rail transfers ownership to focus-trapped sheet | Sheet alone may enter/exit `spatial`; reduced is instant visible/hidden state | Inertness/trap start immediately; Escape/backdrop close and focus returns deterministically. |
| Responsive pinned decision bar | Viewport is compact / decision access is pinned | Static ownership change at responsive breakpoint; normal pressed/focus only | It must not slide persistently or obscure essential content. |

## 4. Milestone implementation map

| Milestone | Permitted areas | Fixed/static areas | Acceptance gates and required checks |
| --- | --- | --- | --- |
| **V8B — Landing Product Choreography** | `/` hero orientation; product-stage ownership; readiness → F1/E1 → C1 narrative; Human Authority/final CTA; landing reduced motion | Application routes, Case File route, data, landing content/geometry and all non-story scenes | Validate dark/light at 1440, intermediate and 390px; normal/reduced/back-scroll/rapid-scroll. Browser scrolling remains ordinary; no fake progress. |
| **V8C — Product Workbench Interaction Motion** | `/workspace` queue selection, mode switch, artifact focus, contextual inspector projection, responsive working layer; bounded Case File interaction motion | LVOS/VC-4 desktop composition, pane widths/scroll ownership, data and decision semantics; landing choreography | Validate dark/light desktop, 1024, 768/620 and 390px; keyboard, repeated selection/mode input, filter/delete reconciliation, open/close interruption and focus restoration. Unrelated planes remain static. |
| **V8D — Motion Tuning, Performance and Final QA** | Token/easing refinement, reduced-motion verification, dark/light parity, runtime stress and profiling, interruption/rapid-input testing, final approval | No new storyboard item, dependency, visual redesign, product state or data contract | Run all constitution gates; profile representative laptop/mobile; verify no CLS, no leaks, correct inertness/focus before/during/after transitions and static completeness. |

## Deliberately deferred implementation decisions

- Exact transform distance, easing control points and narrative sequence timing inside the constitution’s bands.
- Whether a named landing sequence needs `IntersectionObserver`, CSS only, Web Animations or progressive View Transitions.
- Whether Case File smooth scroll should retain its current duration or become immediate except where a manual test proves navigation benefit.
- Any dependency, visual redesign, new data/state, route transition or global animation primitive.

## V8B — Landing Product Choreography implementation record

**Status:** Implemented and validated; no commit or push.

### Bounded scope and architecture

V8B changes only the landing document (`/`), its landing-owned client controller and landing CSS. The VC-3 editorial hero, authentic PR #482 Case File, readiness gap, exhibits, verification ledger, Human Authority climax, unresolved final trace, CTA, typography, dark/light geometry and responsive reading order remain fixed. Canonical report data, evidence hierarchy, Merge Contract, recommendation/risk meaning, Human Decision semantics, routes, shell, Workspace and Case File are unchanged.

`app/landing-motion.tsx` is the sole narrative controller. After hydration it annotates the already-rendered landing sections with `not-yet-owned`, `active`, or `revealed` state and exposes the active section at the landing root. A single `IntersectionObserver` uses a generous central ownership band; it has no scroll listener, wheel interception, snapping, sticky trap, animation frame loop or React render loop. Entries are reconciled to one nearest owned section, observers and preference listeners are removed on cleanup, and an unavailable observer falls back to the fully revealed static state.

The server response contains the complete final reading state. `data-motion-ready` is applied only after hydration; lower-opacity and small transform starting positions are progressive visual emphasis, never hidden or withheld proof. Reduced motion and missing-observer fallback force every section to its readable final state.

### Implemented landing movements

- **Hero orientation:** the existing Case File frame settles as one restrained plane when Hero owns the view. PR #482, TESTS REQUIRED, risk 46/100, trace, C1 and pending human decision remain present from first paint; actions are never delayed.
- **Readiness:** `CI passed` remains written and visible while the already-recorded observation list gains current interpretation emphasis. No issue is discovered or simulated.
- **F1 → E1:** the F1 record stays present while its directly observed E1 inset gains a brief attached-plane emphasis. Provenance, related condition and required action remain readable throughout.
- **E1 → C1 / Merge Contract:** Contract ownership transfers focus to the existing C1 plane and clearance path. C1 remains explicitly `OPEN · BLOCKING`; E1 and related-record text remain written, and C2/C3 stay static context.
- **Ledger:** accepted low-motion pause: only the bridge to the decision ledger receives a quiet opacity/colour hand-off. The four trust records remain ordinary document reading.
- **Human Authority:** the recommendation plane de-emphasises as the existing Human Decision record becomes focal. The neutral pending diamond is never pulsed, and Actor/Timestamp/Recommendation alignment remain `Not recorded` / `No decision to compare`.
- **Final trace and next case:** no trace node travels or resolves. The open Human Decision remains open; final links retain ordinary button feedback only.

### Responsive, reduced-motion and performance policy

Desktop uses at most 6px of vertical record emphasis. Tablet reduces it to 3px. Mobile keeps the same document order and has no sticky plane, lateral sweep, fixed overlay or animation scaffolding. At `prefers-reduced-motion: reduce`, narrative transforms, transitions and staged ownership are disabled; all records are opaque, static and immediately readable, with existing focus, status and navigation behaviour intact.

V8B uses only opacity, transform and bounded semantic colour/background/border transitions: 180ms local state and 360ms named landing narrative timing. It adds no dependency, keyframe, animated dimension, broad `transition: all`, filter/blur, counter, layout measurement loop or persistent `will-change` usage. Motion is interruptible because current ownership is derived from observer entries rather than queued timelines.

### Changed selectors and components

- `app/page.tsx`: `LandingMotion` wrapper and `data-motion-section` / `data-motion-focus` hooks on Hero, readiness, finding, contract, ledger, decision and final regions.
- `app/landing-motion.tsx`: hydration-safe section ownership controller.
- `app/globals.css`: V8B-scoped `.lp-motion` state selectors and reduced-motion final-state rule.

### Validation matrix

| Check | Result |
| --- | --- |
| Landing DOM and static semantics | Passed: PR #482, F1/E1, C1 OPEN · BLOCKING, recommendation and unresolved Human Decision remain present in the server-rendered document; exactly three `.lp-serif` / Newsreader moments remain. |
| 1440 dark and light; 1180 dark; 1024 dark/light; 768, 620 dark; 390 dark/light | Passed by responsive CSS inspection and runtime geometry checks: no horizontal page overflow, no additional sticky/fixed product plane and mobile retains logical document order. |
| Reduced motion at 1440 dark and 390 dark | Source and fallback passed: dedicated preference rule forces readable final opacity/transform state and the controller marks all sections revealed without staged ownership. The available browser runner cannot emulate `prefers-reduced-motion`, so a direct preference-media visual pass remains a V8D validation item. |
| Ordinary, rapid and reverse scroll | Passed by architecture review: one observer owns a generous band, selects a single closest active section, has no scroll listener or queued animation, and cleans up on unmount/preference change. |
| Theme, resize, keyboard and mobile menu | Passed: choreography changes no focus, logical order, control semantics or menu code; landing theme and menu controls remain outside the observer ownership surface. |
| Runtime regressions | Passed: no landing console errors, duplicate-key warning, hydration mismatch or static-flag error observed; observer-unavailable browser environments now retain a fully revealed static document. |
| Route regressions | `/report?demo=1` and `/workspace` remain untouched by V8B source changes. |
| Static checks | `git diff --check` and `npx tsc --noEmit --incremental false` passed. `npm run build` reached production compilation but is environment-limited by restricted Google Fonts fetches for the existing Geist, Geist Mono and Newsreader imports; it reported no landing source/type failure. |

### Deferred work

- **V8C:** Workspace selection/mode/inspector and bounded Case File interaction motion only; it must not reopen the landing controller.
- **V8D:** performance profiling on representative hardware, full visual approval/timing calibration and cross-browser observer stress testing; it must not add a new motion direction or weaken reduced motion.

## V8C implementation record — Product Workbench interaction motion

**Status:** Implemented; source/build validation is recorded with this milestone. The full populated-history runtime matrix remains a V8D hand-off because the available browser session did not retain a stable multi-report local history. V8C changes only `app/workspace/page.tsx`, `app/workspace/workspace.module.css` and the bounded Case File interaction selectors in `app/globals.css`. It does not change canonical report data, persistence, recommendations, risk, review semantics, the connected desktop composition, landing choreography or Review Operations.

### Architecture and timing

- CSS owns all visual treatment: `120ms` Micro row ownership, `180ms` State replacement/focus treatment and `240ms` Spatial selected-case ownership. It uses only opacity, bounded `translateY`, and semantic background/border/colour transitions with named properties.
- Existing React selection, mode and artifact-focus state remains the sole semantic state. A small responsive-surface visual close phase exists only so inertness and scroll lock can end immediately while the already-inert sheet completes its short visual exit.
- `data-motion-ready` is applied after hydration. Initial DOM is fully opaque and usable; new keyed canvas/inspector projections progressively enhance through `@starting-style`, with the final static state as fallback.

### Implemented sequences

- Queue selection changes only the selected row plane and rule; the queue has no horizontal travel or row-height transition. Canvas and inspector remain spatially fixed and reconcile through their existing deterministic selected group and focus rules.
- Working-mode change replaces only the canvas mode panel. Finding, evidence and requirement focus retain written F/E/C relationships, locally emphasise the selected record, and key the inspector projection so it cannot leave an old artifact interactive or visible.
- Human decision is a normal focus projection: recommendation stays analysis context; canonical decision and local review state remain written and distinct. No pending or decision state pulses, resolves or changes colour through motion.
- Below desktop, the selected-case surface alone enters with a small `translateY(8px)` plus opacity. Open applies dialog semantics, focus trap, inertness and scroll lock before motion; close removes those semantics immediately, completes a short interruptible exit, and then restores the source row focus. Canvas/Inspector stays inside the one surface and switches through State replacement only.
- The Case File remains static except for approved active-outline emphasis, Merge Contract disclosure control feedback, and responsive decision-sheet entry. Document scrolling is untouched; existing reduced-motion jump behaviour remains `auto`.

### Reduced motion, interruption and performance

- `prefers-reduced-motion: reduce` removes all V8C transforms and transitions. Case reconciliation, modes, artifact focus and Canvas/Inspector projection are immediate; responsive close restores focus without a delayed visual lifecycle.
- Rapid queue/mode/focus input resolves from the current React state and keyed projection; no queued timeline, animation library, `requestAnimationFrame` loop, layout measurement or `transition: all` is introduced. Opening during a close clears the pending close timer and returns the surface directly to its final open state.
- Desktop pane widths, headers and independent scroll owners never animate. Inspector resets only its existing own scroll position upon a truthful focus/context change. No width, height, blur, shadow or off-screen looping animation is used.

### Validation matrix and V8D hand-off

V8C source validation covers the stable desktop three-pane workbench, intermediate selected-case surface, mobile Canvas/Inspector switching, reduced-motion override, Case File selector bounds, dark/light token inheritance and rapid-input state ownership. The pending runtime matrix is populated `/workspace` at 1440, 1280, 1180, 1024, 768, 620 and 390px; reduced motion at 1440 and 390px; queue keyboard navigation; all four modes; F/E/C/Human Decision inspector projection; surface close/Escape/focus restoration; and route regression for `/`, `/review-operations` and `/new`.

V8D remains responsible for representative-device profiling, cross-browser visual timing calibration, background/return-tab observation and final acceptance sign-off. It must not expand V8C into a new direction or add a dependency.

### V8C live Workspace correction — inertness and scroll ownership

**Symptom and confirmed browser evidence.** After the initial V8C implementation, the rendered desktop Workspace looked correct but its live canvas, contextual inspector and controls did not receive interaction. Browser inspection found a single `section.workspace-case-surface[inert]`. At desktop this element is `display: contents`: it has no visible box, but it remains the DOM ancestor of the live canvas and inspector. The visible canvas and inspector were not inside a separate hidden responsive duplicate; their complete ancestor chain therefore inherited `inert`. Both intended scroll bodies already had genuine overflow (`.workspace-canvas-scroll` and `.workspace-inspector-scroll` each had `scrollHeight > clientHeight` and `overflow-y: auto`), proving that a missing scroll owner was not the primary cause. The hidden responsive model remains `aria-hidden`, inert, visually hidden and non-interactive while it is closed at responsive widths.

**Exact cause and smallest correction.** V8C had applied `inert={!selectedCaseOpen}` to the shared responsive-surface wrapper at every width. `display: contents` changes box generation, not accessibility or event ancestry, so this suppressed pointer, keyboard and wheel interaction for the desktop descendants. `selectedCaseSurfaceViewport` now gates `aria-hidden` and `inert` to the responsive selected-case viewport only, and only while that surface is closed. A matching `resize` reconciliation backs up the media-query listener and immediately closes the responsive state when desktop ownership resumes. The visible desktop workbench is therefore never inert; the responsive surface becomes non-inert before it is exposed and returns to inert immediately when a close begins. No backdrop, global body/document overflow lock, or transparent overlay was involved.

**Restored live sizing and interaction chain.** The desktop workbench remains bounded with fixed pane headers, a `min-height: 0` content chain and independent queue, canvas and inspector scroll bodies. `.workspace-canvas-modebar` is fixed as a non-shrinking flex child and `.workspace-canvas-scroll` explicitly owns the remaining flexible, `min-height: 0` canvas space. This prevents the live scroll body from covering the lower portion of the mode controls while preserving one scroll owner. Motion replacement wrappers remain inside those bodies and never become a scroll owner, positioned input layer or inert live ancestor.

**Validation result.** On the inspected 1280px desktop view, all four visible mode-button centre hit tests reach their own button, the visible canvas and inspector have `pointer-events: auto`, no inert ancestor, and valid `auto` scroll ownership. Wheel input advanced only the canvas (`155px → 415px`) or inspector (`0px → 154px`) that received it. Both visible `Open Case File` controls reached `/report` and no console error was recorded. At responsive 1024px and 390px, selecting the queue record makes the surface visible and non-inert before focus moves to it; Canvas/Inspector switching leaves exactly one view visible; the surface scroll body has `overflow-y: auto`; close, Escape and backdrop restore the source queue row and release the document/body lock. The inactive responsive surface returns to `aria-hidden`, inert, hidden and `pointer-events: none`.

**Breakpoint and reduced-motion follow-up.** Dark/light runtime geometry was checked at 1440px and 390px, with desktop geometry additionally checked at 1280px and 1180px; static no-horizontal-overflow and correct inactive-surface states were observed at 1179px, 1024px, 768px and 620px. The browser harness updates CSS viewport geometry without dispatching its normal resize/media-query events, so real browser resize-event acceptance remains V8D despite the explicit application reconciliation. The dedicated V8C reduced-motion rule removes the relevant transforms/transitions and the close controller commits semantic state immediately; the available browser runner cannot emulate the preference, so a direct preference-media visual pass remains V8D validation rather than an inferred runtime claim.
