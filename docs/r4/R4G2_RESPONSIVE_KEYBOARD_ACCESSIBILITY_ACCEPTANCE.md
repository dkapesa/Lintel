# R4G.2 — Responsive, Keyboard and Accessibility Acceptance

> **Milestone:** R4G.2
> **Date:** 30 July 2026
> **Branch:** `r4g-final-quality-product-freeze`
> **Status:** Bounded implementation and machine acceptance complete; exact viewport, genuine 200% zoom, screen-reader, reduced-motion and touch acceptance remain manual because the attached browser did not expose those capabilities.
> **Predecessor:** `R4G1_CROSS_ROUTE_ADVERSARIAL_ACCEPTANCE.md`
> **Next owning milestone:** R4G.3 performance acceptance. R4G.4 remains the final product freeze.

## 1. Outcome

R4G.2 performed a cross-route responsive, keyboard, focus, semantic and overlay-safety audit over the accepted R4 product. Nine primary routes were inspected in a real browser at the one CSS viewport the harness genuinely exposed. Four bounded defect groups were corrected:

1. modal-drawer background isolation and focus restoration;
2. skip-link focus transfer;
3. dynamic command-palette focus restoration;
4. stable Review Operations search naming.

A hydration race discovered during the final console pass was also removed by focusing the already-server-rendered route main instead of mutating a suspended child H1.

The pass does not claim complete responsive or accessibility acceptance. Exact width/height execution, genuine 200% zoom, screen-reader output, reduced-motion emulation and touch input were unavailable and are explicitly carried to manual validation.

## 2. Governing contracts and scope

The implementation preserves:

- the R4A product-truth, accessibility, performance and Workspace shell contracts;
- R4B responsive responsibility transfer, keyboard/focus order and Escape priority;
- R4D production Workspace authority;
- R4E deep investigation, Focus mode and command behavior;
- R4F.1 route-family shell ownership;
- R4F.2 New Review → Workspace → Case File lifecycle;
- R4F.3 operational projection and URL-owned Review Operations state;
- R4F.4 capability/System truth;
- R4F.5 policy and team-authority boundaries;
- R4G.1 adversarial lifecycle acceptance and its recorded carryovers.

No strategy, product authority, authentication, organisation/collaboration, persistence model, dependency or visual-system redesign was introduced.

## 3. Acceptance-environment truth

The attached browser rejected viewport changes and exposed a genuine CSS viewport of approximately 951–958×794, DPR 1.25 and `visualViewport.scale = 1`. Scrollbars caused captured content widths between 936 and 958 pixels.

A single genuine `Ctrl + +` attempt left scale and CSS viewport unchanged. The harness exposed no media-feature emulation, touch input or screen reader. These limitations are evidence boundaries, not product passes.

Required screenshot filenames were retained as catalogue labels. Their manifest records actual dimensions and marks every viewport proxy or unavailable state. No screenshot filename is used as proof of its encoded dimensions.

## 4. Viewport and responsive acceptance

At the supported viewport:

- all ready primary routes rendered one main landmark and one H1;
- no route produced document-level horizontal overflow;
- dense Review Operations records transferred to structured card presentation while retaining table semantics;
- Workspace transferred to one dominant surface with Queue and Inspector on demand;
- Case File Review Map horizontal overflow remained locally owned;
- Integration, Settings, Policy and Team explanatory copy wrapped without identity loss;
- modal/drawer states remained within the visible viewport.

Source breakpoints were reviewed at Workspace 1439/1359/1199/959/639, Operational 1399/1199/959/639, Administrative 1179/899/639 and Governance 1199/959/639 pixels. Their presence is not treated as runtime proof.

Exact 1600, 1280, 1024, 960, 768, 390 and 320 pixel acceptance remains manual.

## 5. Genuine 200% zoom acceptance

Not completed. The browser’s genuine zoom command produced no zoom change, and no browser-UI or supported zoom capability was available. Workspace, Review Operations and Team proxy images preserve the requested catalogue but are explicitly labelled non-evidence.

Full 200% reflow, focused-control visibility, sticky safety and dialog containment remain manual requirements.

## 6. Operational-route responsive behavior

Operational Home, Review Operations, New Review and Case File were exercised with explicit demo/fixture data where needed.

- Review Operations query debounce retained search focus and updated URL state.
- Filtering to a set that excluded the selected record cleared selection and announced the change.
- Compact Filters opened as a named modal dialog, focused Close, trapped focus, isolated background content, locked page scroll and restored the trigger on Escape.
- New Review invalid Continue focused the diff textarea with `aria-invalid`, `aria-describedby` and an alert.
- Case File retained read-only identity and a locally scrollable Review Map.

The search label was corrected so the input remains named `Search review records` when the distinct Clear button appears.

## 7. Workspace responsive behavior

At the supported threshold, Workspace correctly used the tablet/single-surface responsibility model:

- Queue and Inspector were available as overlays rather than crushed columns;
- Overview/Evidence modes and record selection survived panel changes;
- Focus mode retained review, mode, readiness and selected context;
- readiness remained visible and did not cover active dialogs;
- long review/finding/branch content produced zero document overflow.

Queue and Inspector overlays now receive named modal-dialog semantics, isolate the rest of the application with `inert`, lock body scroll, trap focus and restore the actual invoker with a stable control fallback.

## 8. Administrative-route responsive behavior

Integrations, Settings, Review Policies and Team boundaries retained the accepted administrative shell and browser/environment authority language.

- Integrations kept configured, available, Blueprint, Export-only and not-configured states distinct.
- Filtering out the selected capability cleared selection and announced it.
- Settings truthfully showed no report-history action because the isolated origin held no durable reports; no destructive dialog was fabricated.
- Policy list/detail selection remained presentation-only and created no applied state.
- Team rendered no members, roles, invitations, assignments or organisation analytics.

The administrative drawer already isolated its content frame; body-scroll lock and skip-link isolation were added. Exact narrow drawer execution remains manual because its active threshold was unavailable.

## 9. Keyboard-only flow acceptance

Verified at the supported viewport:

- Review Operations search and filter dialog;
- New Review invalid-focus recovery;
- Workspace `E`, `Ctrl+K`, command-palette focus trap and Escape;
- Workspace Queue/Inspector open, focus containment and Escape;
- Human Decision pristine Escape and exact invoker return;
- Focus mode and visible on-demand controls.

The browser’s native Enter/Space injector was inconsistent for some buttons and anchors. Full hardware-keyboard confirmation of `J/K`, `R`, `H`, `D`, `[`, `]`, tablist arrows, dirty discard and narrow admin navigation remains manual. Visible controls exist for shortcut-owned actions.

## 10. Focus order and restoration

Shared route entry now focuses the programmatically focusable main landmark without changing suspended child markup. Skip links move focus to their owned main region. Workspace Queue’s docked target is also programmatically focusable.

Dynamic restoration was verified for:

- Filters → Filters trigger;
- command palette invoked from a finding → that finding;
- Queue → actual Queue invoker or stable Queue fallback;
- Inspector → actual Inspector invoker or stable Inspector fallback;
- Human Decision → exact Preview decision flow invoker.

## 11. Escape priority

The retained priority is:

`Human Decision / discard → command palette → Queue or Inspector drawer → contextual origin → primary selection → Focus mode`.

Review Operations Filters closes before route state changes. Shared administrative navigation closes before page content receives interaction. Each verified overlay restores focus after inert state is removed.

## 12. Semantic structure and ARIA

Browser accessibility snapshots confirmed:

- unique main/H1 structure after route ready state;
- named landmarks and navigations;
- real table semantics for operational records;
- labelled search/select/form controls;
- tablist/tab semantics for Workspace modes;
- named modal dialogs for filters, palette, Queue, Inspector and Human Decision;
- associated New Review validation errors;
- polite selection/filter updates and assertive errors.

No ARIA role substitutes for a native button, link, label, table or form control where a native element exists.

## 13. Screen-reader validation status

Not run. Accessibility-tree/DOM snapshots are structural evidence only and do not replace NVDA, JAWS or VoiceOver. Announcement timing, landmark navigation, virtual-cursor order and modal isolation remain manual.

## 14. Reduced-motion validation

Runtime emulation was unavailable. Source inspection confirmed reduced-motion rules across the shared shell, Workspace, operational routes, New Review, Case File, administrative routes and governance routes. These rules remove or collapse transitions/animations and disable smooth scrolling.

No runtime pass is claimed.

## 15. Modal, drawer and sticky safety

Filters, Workspace Queue and Workspace Inspector now share the required safety properties:

- named modal dialog at overlay thresholds;
- background isolation;
- operable scrim outside the inert set;
- body-scroll lock/restoration;
- contained tab order;
- Escape and invoker restoration.

Command Palette and Human Decision continue to inert/hide the Workspace shell. Human Decision was contained at the supported height; requested 960×400 and mobile height acceptance remains manual. Sticky readiness and route rails showed no obstruction at the supported viewport.

## 16. Text and identifier stress

Natural fixture data covered long review titles, repository/PR identity, branches, finding statements, file locations, run/head identifiers, capability boundaries and policy slugs. Workspace document overflow measured 0px. Dense maps/scrollers retain local overflow ownership.

Synthetic unbroken-token and exact 320px stress remains manual.

## 17. Touch and pointer validation

Pointer clicks exercised filters, record/capability/policy selection, Queue/Inspector controls, palette, Focus mode and Human Decision. Touch hardware and touch emulation were unavailable. Target comfort, scroll chaining and no-hover operation remain manual.

## 18. Visual consistency audit

The final captures retain:

- neutral specialist Workspace chrome;
- operational shell density and structured-record hierarchy;
- quiet administrative shell and explicit local authority;
- consistent blue focus treatment;
- consistent recommendation/risk/capability truth;
- bounded overlays with clear close affordances.

No visual redesign was required. The only visual-impacting correction is clearer overlay isolation/focus visibility; all other corrections are semantic or behavioral.

## 19. Corrections implemented

Exact production files:

- `app/app-shell.tsx`
- `app/review-operations/review-operations-client.tsx`
- `app/workspace/WorkspaceR4Client.tsx`

Corrections:

1. Shared main landmarks are programmatically focusable; skip links transfer focus safely.
2. Administrative drawer locks/restores body scroll and isolates the skip link.
3. Review Operations search naming is stable when Clear appears.
4. Review Operations compact filters isolate background and restore scroll/focus.
5. Workspace Queue/Inspector overlays expose dialog/modal semantics.
6. Workspace drawers isolate background, lock scroll and restore actual invokers.
7. Command Palette restores the actual keyboard/pointer invoker.
8. Review Queue is a valid programmatic skip target.
9. Route-entry focus no longer mutates suspended H1 markup during hydration.

## 20. Browser and console validation

A fresh-tab browser pass after all source corrections covered Operational Home, Review Operations, New Review, Case File, Workspace, Integrations, Settings, Review Policies and Team. Every route reached one main, one H1, initial main focus and no document-level horizontal overflow. The clean tab recorded zero console warnings and zero console errors.

The earlier same-tab log retained two hydration errors produced before correction; those records directly motivated correction 9 and are not concealed.

## 21. Build and repository validation

Final commands passed:

- `npm run build` — pass; production compilation, TypeScript and 25-page generation completed.
- `npx tsc --noEmit` — pass.
- `git diff --check` — pass; line-ending notices only.

Generated `next-env.d.ts` and `tsconfig.tsbuildinfo` were restored to exact preflight Git content after validation. SHA-256 values match preflight:

- `tsconfig.tsbuildinfo`: `6882F72E36C3A9A6BBCAE2D1C03FA5D303CBEFE23DECFE4CBD5CAB34CA72BE81`
- `next-env.d.ts`: `4E4DA12AA061AAC172FB1BCB48E9B6E4B293080D2F494327925FDBA8F39632AC`

Package and lockfiles are unchanged. The branch remains `r4g-final-quality-product-freeze` at `4e28a123e3b3e3c5307f9b248551014d00980199`; no files are staged.

## 22. Human review package

`R4G2_HUMAN_REVIEW_PACKAGE/` contains 32 normalized PNGs and eleven supporting matrices/notes. The screenshot manifest is authoritative about actual dimensions and unavailable states. The package is intentionally untracked and is not application authority.

## 23. R4G.3 work intentionally deferred

R4G.2 does not perform Lighthouse scoring, performance budgets, bundle-size analysis, route timing, network waterfalls, CPU/memory profiling or production-load measurement. These remain owned by R4G.3.

## 24. Remaining R4 carryovers

- R4G.1 Team storage-read denial injection remains blocked by key-scoped interception limits.
- R4G.1 New Review persistence-failure retry injection remains blocked by the same harness boundary.
- Exact responsive viewport, genuine 200% zoom, screen-reader, reduced-motion and touch acceptance remains manual.
- Settings destructive-dialog responsive proof requires a genuine stored report or a controlled non-authoritative fixture that the current isolated origin did not provide.
- Full hardware-keyboard native activation and dirty-discard flow remains manual.

## 25. Remaining known issues

No known source defect remains within the exercised R4G.2 scope after final validation. The outstanding items above are unexecuted acceptance capabilities, not silently passed behaviors.

## 26. Scope confirmation and unexpected changes

No dependency, package manifest, lockfile, app route/page creation, laboratory, persistence authority, external integration, auth/organisation model or product strategy was changed. No durable review or external write was created.

The pre-existing untracked `R4G1_HUMAN_REVIEW_PACKAGE/` remains untouched. The only unexpected issue was the shared-shell hydration race found during console review; it was corrected within the accepted focus contract.
