# V8 Final Experience Audit

**Milestone:** V8D — Motion Tuning, Performance and Final QA  
**Date:** 18 July 2026  
**Status:** Complete; ready for external approval  
**Scope:** `/`, `/workspace`, `/report?demo=1`, `/review-operations` and `/new` on `v8-experience-and-motion`.

## Bounded declaration

V8D tuned only the existing landing ownership controller, Workspace interaction replacement and responsive selected-case surface, and the bounded Case File interaction treatment. The completed cinematic landing, connected three-pane Workspace, document-like Case File, canonical report data, recommendations, evidence, requirements, Human Decision, report generation, persistence and route architecture are fixed. No dependency, feature, motion framework or visual direction was added.

QA targets were predictable ownership, immediate changed-state feedback, interruption safety, authored reduced motion, semantic timing independent of animation, scroll/pointer ownership, no layout-moving animation, theme parity and ordinary-device-appropriate work. The explicit non-goals were redesign, product/data changes, persistence changes, new landing choreography, new Workspace architecture and Case File staging.

## Final token decision

| Class | Final value | Consumers |
| --- | --- | --- |
| Micro | 120ms | Workspace row ownership |
| State | 180ms | Workspace projection and local controls; Case File outline/disclosure feedback |
| Spatial | 240ms | Responsive Workspace selected-case surface; Case File decision sheet |
| Narrative | 360ms | Named landing Case File ownership only |

The existing standard and enter/exit cubic-bezier curves are retained. All transitions name their properties; the V8 selectors contain no `transition: all`, animated dimensions, keyframes, filter/blur, large animated shadow, broad `will-change`, continuous animation loop or per-scroll React state update.

## Reproduced correction

The responsive Workspace selected-case surface has a `240ms` CSS spatial exit, but its close cleanup was scheduled for `180ms`. That objectively cut the visual close phase short. `app/workspace/page.tsx` now uses the matching `240ms` lifecycle value. Responsive-to-desktop reconciliation also clears a pending close timer before synchronously committing the closed state. Reopen already clears the timer and resolves directly to open. No other timing or easing inconsistency was reproduced.

## Experience and interaction result

### Landing

The existing `IntersectionObserver` assigns one nearest central owner, has no scroll handler or queued sequence, and disconnects on cleanup and preference changes. Rapid forward/reverse scrolling derives the final owner from current geometry; the landing document remains complete before hydration and observer fallback reveals every section. PR #482, the readiness gap, F1/E1, C1, Merge Contract, Verification Ledger, Human Authority, unresolved final trace and next action remain intact. The final decision never resolves.

### Workspace

Desktop keeps queue, canvas and inspector in fixed planes with independent scroll owners. Row, mode, focus and keyed inspector replacement move only changed content. Responsive operation retains one selected-case surface, Canvas/Inspector switching, immediate semantic modal state and deterministic focus restoration. The corrected close lifecycle cannot survive a resize or win over a reopen.

### Case File

The Case File remains document-led: active outline, jump location, bounded disclosure feedback and responsive decision-sheet ownership are the only motion-adjacent behaviours. Smooth document navigation remains user-initiated and becomes `auto` in reduced motion. The sheet activates dialog semantics, inertness, focus trap and body lock on open; cleanup releases them on functional close and restores focus independently of the visual transition.

## Reduced motion and accessibility timing

Reduced motion is a separate final state: landing ownership emphasis is removed and all records are immediately opaque/static; Workspace projection, focus, mode replacement, responsive ownership and Canvas/Inspector switching are immediate; Case File navigation and decision controls retain semantics without spatial travel. Theme switching honours the same preference.

Modal semantics do not wait for `transitionend` or visual completion. Workspace close makes the exiting surface pointer-inert immediately; Case File open immediately applies dialog role, background inertness, focus trap and document/body lock. Exit does not leave an invisible interactive layer. No landing ownership change moves focus or announces decorative motion.

## Pointer, scroll and performance findings

The prior Workspace regression remains guarded: desktop shared content is not inert, queue/canvas/inspector retain their own scroll bodies and fixed headers, and the responsive duplicate is hidden/inert outside its active responsive state. There is no page-level lock on landing or ordinary Case File reading.

Source inspection found no V8 requestAnimationFrame loop, Web Animations usage, animation library, per-scroll React render loop, undetached V8 observer/listener, broad `will-change`, layout-property animation or animated off-screen duplicate. Observers and preference/media listeners have cleanup paths. The only V8 correction was the matching spatial close lifecycle; speculative optimisation was not performed.

## Theme, responsive and runtime validation

| Surface | Matrix result |
| --- | --- |
| Landing | 1440, 1280, 1180, 1024, 768, 620 and 390px; dark/light where requested: source and local-browser overflow/state checks passed. One complete readable document, no fixed/sticky motion surface or horizontal overflow observed. |
| Workspace | 1440, 1280, 1180, 1179, 1024, 768, 620 and 390px; dark/light where requested: responsive CSS and live empty-history shell checks passed. The full populated-history interaction matrix remains an external-approval replay item because the local QA browser has no persisted report history. |
| Case File | 1440, 1024, 768 and 390px; dark/light where requested: bounded selector, responsive decision-sheet and no-overflow source checks passed. |
| Regression routes | `/review-operations` and `/new` at 1440 and 390px: no V8 source ownership or layout change; route builds remain covered by the production build. |

The local browser runner did not expose a direct `prefers-reduced-motion` emulation control or a stable populated Workspace history. Reduced-motion correctness is therefore verified from the dedicated controller/CSS branches and must be replayed once in the external approval browser. This is an accepted non-blocking environment observation, not a product defect.

Console/runtime review found no product console error, duplicate-key warning, React static-flag error, hydration mismatch, observer exception, focus-trap error or route navigation failure in the exercised local routes. Browser-extension-injected attributes, if present in an external browser, are environmental unless independently reproduced.

## Final programme status

V8 is ready for final external approval. The recommended next product programme is an explicitly authorised capability track; it should preserve LVOS and V8 as the fixed visual and motion baseline rather than reopen visual direction.

## Final external approval

**Verdict:** APPROVE

The final review found no blocking corrections.

Approved outcomes:

- the landing page presents one persistent and truthful Case File narrative;
- the Product Workbench retains stable planes, independent scrolling and immediate contextual updates;
- the Case File remains a coherent engineering dossier;
- motion corresponds only to real state, focus or spatial-ownership changes;
- reduced motion is an authored operating mode;
- Human Decision remains explicitly human-authoritative;
- no fabricated analysis, activity, evidence, completion or merge authority was introduced;
- no new dependency or motion architecture was added;
- runtime, accessibility, performance and scope checks passed.

Environment limitations during the external review:

- screenshot capture timed out;
- the review harness did not fire IntersectionObserver callbacks;
- the review harness contained no populated Workspace history;
- reduced-motion emulation was unavailable.

These were covered through source inspection, the V8D audit record and normal-browser manual validation.

**Programme status:** V8 Experience and Motion is approved and complete.

V8A, V8B, V8C, V8C.1, V8B.1 and V8D may close.