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
