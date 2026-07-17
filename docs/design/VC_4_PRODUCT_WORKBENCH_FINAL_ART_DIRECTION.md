# VC-4 — Product Workbench Final Art Direction

**Status:** Implemented — validation passed  
**Scope:** VC-4A — Workspace three-pane workbench composition  
**Route:** `/workspace`  
**LVOS baseline:** v1.0, closed and unchanged

## Objective

Make Workspace a connected engineering-verification workbench: a reviewer keeps the verification queue, active case and truthful contextual detail in view at the same time.

## Fixed constraints

LVOS v1.0 and the completed VC-1, VC-2 and VC-3 work remain fixed. The global rail, contextual Workspace navigation, command bar, Workspace views/filters, report generation, canonical data, scoring, recommendations, persistence and human-decision semantics are unchanged. The public landing page and Case File are outside scope.

Geist Sans remains application text; Geist Mono is limited to technical identity and values. The 10px floor, 600 weight ceiling, token-driven dark/light parity and existing semantic colours remain in force. No dependency, motion, fake organisation activity or seeded history was added.

## VC-4A pre-implementation declaration

- **Changing regions:** Workspace queue presentation, the selected-case working surface, contextual inspector presentation, truthful empty state and Workspace-owned CSS.
- **Fixed shell and route behaviour:** App shell ownership, URLs, queue views, local selection, existing right-sheet interaction, full Case File handoff and all local review controls.
- **Three-pane hierarchy:** narrow verification queue → dominant active-verification canvas → narrow contextual inspector, inside one ruled outer workbench.
- **Data truth:** every populated record remains derived from the stored local report and its existing local review state. No artifact selection is claimed where the state model only supports case selection.
- **Typography and colour:** existing compact role tokens only; colour communicates recommendations, elevated risk and real status rather than layout.
- **Responsive implication:** desktop receives the new three-plane hierarchy. Existing compact inspector sheet remains the access boundary below desktop; VC-4D owns a dedicated responsive redesign.
- **Explicit non-goals:** shell architecture, landing page, Case File, report/canonical data, APIs, persistence, decisions, motion, fixtures and dependencies.

## Previous Workspace composition

VC-1's Workspace was a connected two-plane Risk Inbox: a wide six-field queue plus a persistent selected-case inspector. The selected case was accurate but its full summary lived in the right plane, leaving no dominant active working surface between triage and contextual detail.

## Three-pane composition

At desktop the existing summary strip and sibling queue views lead into one shared bordered workbench.

1. **Verification queue:** a narrow ledger of local report groups with visible state, identity, recommendation, requirement signal and next action. Selection remains a left rule, plane shift, focus ring and `aria-selected` state.
2. **Selected-case working canvas:** the dominant active surface. It presents the selected report's identity, written five-stage trace, recommendation/risk, observation-and-evidence ledger, requirements/proof ledger and explicit local decision/next-action summary. Its Case File control preserves the existing handoff rather than duplicating `/report`.
3. **Contextual inspector:** a persistent narrow detail plane. It retains case identity, requirement/proof context, local owner and review-state controls, progressive contract/assumption/provenance detail and existing actions. At this phase it remains case-level; no unsupported finding/evidence artifact selection has been fabricated.

The planes use a shared outer border, interior hairlines, compact plane headers and token surfaces. They are not three floating cards.

## Queue-plane hierarchy

The desktop queue no longer tries to carry a full-width table inside a narrow plane. It preserves the truthful comparison cues that matter for prioritisation, while owner and updated metadata remain available in the selected contextual inspector. Long titles and technical values retain wrapping/clamping safety, and next action is now visible in the compact record.

## Selected-case canvas hierarchy

The centre canvas follows Lintel's required grammar:

`Change → Observation → Evidence → Requirement → Human decision`

It is a working summary and navigation surface, not a second Case File. Findings and requirements are limited to real selected-report fields; missing proof is shown only when captured. The final human-decision state remains local review state and never implies an unrecorded approval or reviewer.

## Inspector hierarchy

The inspector responds to the selected case with compact provenance, open requirement/proof context, owner and local state, progressive contract/assumption/readiness details and appropriate existing actions. The top-level recommendation and next-action summary move to the centre canvas at wide desktop to avoid a duplicated case-file-like inspector. VC-4B/VC-4C may add supported selected-artifact depth only after the state model and interaction boundary are explicitly established.

## Empty and populated-state handling

The empty route is one connected empty workbench, not three empty cards. It truthfully says that browser-local reports populate the queue and links to **New Review** and the canonical **Sample Case File** without seeding local storage.

Populated rendering continues to use real locally stored reports, existing sorting/selection and local review state. The current environment's local Workspace history is not fabricated for validation.

## Reference translation

Cursor contributes persistent queue/work/context relationships and immediate active-case ownership, not IDE tabs, terminals or chat. Giga and Loopr contribute calm planes, tight alignment, compact controls and restrained material changes. Waypoint contributes queue-to-detail operational ownership. Lintel retains its own verification ledger, Merge Contract and human-decision grammar.

## Components and selectors changed

- `app/workspace/page.tsx`: adds `WorkspaceCanvas`, turns the desktop queue header into a plane header, inserts the centre canvas and replaces the standalone empty state with the same connected workbench architecture. Inspector sections gain stable contextual keys for presentation-only hierarchy.
- `app/workspace/workspace.module.css`: adds `workspace-plane-header`, `workspace-canvas*`, connected three-pane desktop tracks, compact queue rules and responsive preservation rules.
- `docs/design/VC_4_PRODUCT_WORKBENCH_FINAL_ART_DIRECTION.md`: this VC-4A design record.

## Deferred work

- **VC-4B / VC-4C:** real selected-artifact state and interactions for a finding, evidence record, missing proof or contract clause; any inspector depth must be data-supported.
- **VC-4D:** full intermediate and mobile visual transformation. VC-4A preserves existing sheet/drawer access and avoids new overflow only.

## Validation matrix

| Check | Result |
| --- | --- |
| `/workspace` 1440px dark | Passed: shared outer boundary with 255px queue, 548px centre canvas and 304px inspector; no page overflow, font-floor or weight-ceiling violations in the truthful empty state. |
| `/workspace` 1440px light | Passed: identical three-pane geometry and warm-paper material; three labelled plane headers remain visible. |
| `/workspace` 1180px dark | Passed: 228px queue, 340px centre canvas and 278px inspector retain the intended hierarchy without overflow. |
| `/workspace` 1024px and 390px regression | Passed: the 1024px queue/canvas transformation and 390px connected vertical sequence retain access to all three regions without page-level horizontal overflow. |
| Queue views, selection, inspector continuity and truthful empty state | Existing view/filter, selection, keyboard and sheet code remains in place; the live local Workspace was empty and was not seeded. The new empty state links to New Review and Sample Case File. |
| `/report?demo=1` and `/review-operations` regression | Passed at 1440px: routes remain available with no page-level horizontal overflow. |
| `git diff --check`, TypeScript and production build | Passed. The build required the existing Google Font network fetch outside the sandbox. |

## Current approval status

**Implemented and validated — ready for visual approval.** No commit or push is part of VC-4A.

## VC-4A bounded composition correction

**Status:** Corrected — validation complete with one environment-limited build check  
**Scope:** Queue label readability and desktop scroll ownership only

### Observed defects

1. The compact desktop queue placed a long recommendation label beside an auto-sized because-clause in the same narrow grid row. In the 228px queue track, the flexible label track could collapse to character-width wrapping for labels such as `REVIEW REQUIRED` and `TESTS REQUIRED`.
2. The workbench had no bounded desktop height. The document owned queue and canvas scrolling while the inspector had its own bounded scroll region, producing competing vertical scroll behaviour.

### Bounded correction

- Queue records keep their existing markup and data but use a single-column compact ledger grammar: state badge, PR identity, recommendation plus supporting reason, requirement/blocker signal, next action, then updated/risk technical metadata. State and recommendation labels are explicitly non-wrapping; intentional wrapping remains limited to titles, explanatory text and technical identifiers.
- At `>=1180px`, the Workspace route body occupies the shell's remaining viewport height. The summary and view tabs stay above a flexed, bounded workbench. The outer workbench clips its frame; queue, centre canvas and inspector each own their internal vertical scrolling. The queue's plane header is sticky within its own scroll region, while canvas and inspector headers remain outside their respective scrolling content.
- The existing `<1179px` sheet/drawer and single-column behaviour remains unchanged.

### Validation to record

| Check | Result |
| --- | --- |
| 1440px dark/light queue labels | Empty-state browser pass: dark/light geometry, three plane headers and no horizontal overflow pass. The current local Workspace contained no stored reports, so populated labels were source-verified (`white-space: nowrap`) rather than fabricated. |
| 1280px and 1180px dark queue labels | Empty-state browser pass: no page-level overflow; the three-pane proportions remain available. Populated rows were not seeded. |
| 1024px / 390px regression | Passed: existing compact drawer/sheet boundary and connected empty-workbench access remain available with no page-level horizontal overflow. |
| Desktop scroll ownership | Passed structurally at 1440px: the document height equals the viewport, the outer populated workbench is bounded and clipped, and queue/canvas/inspector retain their owned scroll containers. The empty workbench deliberately remains content-height. |
| Console / typing / diff | Browser console was clear; `git diff --check` and `npx tsc --noEmit --incremental false` passed. |
| Production build | Sandbox attempt reached the existing Google Font network boundary. Network escalation is disabled by the active approval policy, so this correction pass cannot repeat the previously successful network-enabled build. |

### VC-4A status after correction

**Corrected — ready for approval with the build environment limitation recorded.** VC-4B, VC-4C and VC-4D remain deferred exactly as documented above.

## VC-4A bounded inspector scroll correction

**Status:** Corrected — validation complete with the existing build-network limitation recorded  
**Scope:** Desktop Selected Case inspector height and scroll ownership only

### Inaccessible inspector-depth defect and root cause

After the desktop workbench gained a bounded height, its outer frame correctly clipped overflow. The inspector, however, retained the pre-existing `align-self: start`. It therefore sized itself to content rather than stretching to the bounded grid row. Its body had `overflow-y: auto`, but no definite remaining height in which to scroll; lower details and final actions could be clipped by the workbench frame.

### Final inspector scroll-ownership model

At `>=1180px`, `.workspace-inspector` now stretches to the grid row and uses `grid-template-rows: auto minmax(0, 1fr) auto`.

- The inspector top bar remains visible in the first row.
- `.workspace-inspector-scroll` is the sole inspector scroll region, with its existing `min-height: 0` and `overflow-y: auto`.
- The action footer occupies the final grid row rather than floating over body content; no final action is covered by a sticky footer.
- The bounded outer workbench remains non-scrolling. Queue and canvas retain their independent owned scroll regions.
- Below desktop, the existing fixed right-sheet/full-width sheet, focus trap, Escape, inert-background, scroll-lock and focus-restoration mechanics are untouched.

### Keyboard and pointer verification

The inspector body remains the keyboard-focus scroll owner: normal wheel/trackpad use and scrollbar dragging act within its body, while Page Down and focus movement can reveal below-fold selects, owner cues, progressive details and the Open Case File / Copy conditions / Delete reports actions. Labels and existing focus-visible rules are unchanged.

### Validation to record

| Check | Result |
| --- | --- |
| 1440px dark/light and 1280px / 1180px dark populated inspector | Empty-state browser width/theme passes and desktop CSS-chain review complete. The local Workspace had no reports, so inspector body/final-action reachability was source-verified without fabricating history. |
| 1024px / 390px responsive regression | Passed: no page-level horizontal overflow; desktop grid rules remain isolated to `min-width: 1180px`, preserving the existing detail-sheet boundary. |
| Queue and canvas scroll regression | Source review confirms their existing independent scroll owners are unchanged; the outer workbench remains the non-scrolling frame at desktop. |
| Keyboard, pointer and console | The inspector body is the only desktop scroll/focus track by construction; select labels and existing focus-visible rules remain. Browser console was clear. |

### VC-4A readiness after inspector correction

**Corrected — ready for approval with the existing build-network limitation recorded.** No VC-4B/C interaction scope or VC-4D responsive redesign is included.

## VC-4A final bounded queue scroll-ownership correction

**Status:** Corrected — validation complete with the existing build-network limitation recorded  
**Scope:** Desktop Verification Queue scroll ownership only

### Queue wheel/trackpad failure and root cause

The queue surface combined its fixed plane header and groups in one unconstrained content region. Although an overflow declaration existed on that surface, the desktop grid did not give its record body a constrained `minmax(0, 1fr)` track. Wheel/trackpad and `scrollIntoView()` could therefore resolve against the shared workbench/document path, moving all three planes and allowing the queue header to leave context.

### Final per-pane scroll-ownership model

At `>=1180px`, the outer workbench remains the bounded, `overflow: hidden` frame. Each pane is constrained to the grid row. The queue now uses:

1. a non-scrolling `workspace-queue-header`;
2. a `workspace-queue-scroll` body with `min-height: 0`, `overflow-y: auto`, a visible native scrollbar and contained overscroll;
3. queue groups and rows inside that body.

This makes the queue body the nearest scroll ancestor for selected rows, so the existing `scrollIntoView({ block: "nearest", inline: "nearest" })` keeps keyboard-selected rows visible within the queue instead of displacing the workbench. The centre canvas and corrected inspector keep their independent bodies and fixed headers. No handler intercepts wheel or trackpad input.

### Pointer, keyboard and responsive verification

- Mouse wheel, trackpad, scrollbar and Page Up/Down now target the queue body when it is focused or hovered; the header remains fixed above it.
- Existing ArrowUp/ArrowDown row selection and `aria-selected` semantics are unchanged. Focused rows use the queue body as their nearest scroll region.
- The desktop-only queue grid/body rules do not apply below 1180px, preserving the 1024px sheet/drawer boundary and 390px document flow, focus trap, Escape, inertness and restoration behaviour.

### Validation to record

| Check | Result |
| --- | --- |
| 1440px dark/light; 1280px / 1180px dark genuine queue interaction | Empty-state browser width/theme passes and queue ownership source review complete. The current local Workspace had no reports, so wheel/trackpad/Arrow traversal across genuine rows was not fabricated. |
| 1024px / 390px regression | Passed: normal document flow and existing compact detail-sheet architecture remain with no page-level horizontal overflow. |
| Centre and inspector regression | Source review confirms their established independent body scroll owners are unchanged; wide browser passes retain the three plane headers. |
| Console / accessibility contracts | Browser console was clear. Existing row `aria-selected`, focus-visible treatment, Arrow navigation and `scrollIntoView({ block: "nearest" })` remain, now resolving to the queue body at desktop. |

### VC-4A final readiness after queue correction

## VC-4B — Selected-case working canvas

**Status:** Implemented — validation complete with existing font-network build limitation  
**Scope:** Centre Active Verification canvas only  
**Fixed state:** VC-4A's shell, queue grammar/selection, three-pane proportions, independent pane scrolling, fixed headers, right case-level inspector, full Case File route, local-first state and existing responsive sheet/drawer boundary remain unchanged.

### Previous and final centre composition

The previous centre was one vertically-scrolled working summary: case identity, trace, recommendation/risk, compact finding and requirement ledgers, then local review state. It oriented the reviewer but could not bring a particular finding, proof record or condition into focus.

The final centre remains one dominant plane and one owned body scroll region, but its fixed header now includes four compact working modes:

1. **Overview** — selected change identity, five-stage trace, Lintel recommendation, risk, concise reason, counts, next action, local review state and Case File route.
2. **Findings & evidence** — a finding ledger with attached proof records revealed under the selected finding.
3. **Requirements** — Merge Contract clauses where available, otherwise truthful report merge conditions.
4. **Human decision** — recommendation, canonical recorded decision when present, local review state, open proof/requirements and the next bounded action.

The control uses a complete ARIA tab pattern: roving tab stop, `aria-selected`, `aria-controls`, and ArrowLeft/ArrowRight/Home/End switching. Its active state is written, ruled and keyboard-focusable rather than colour-only.

### Current-focus architecture

`WorkspaceCanvas` owns presentation-only state with this boundary:

```ts
type CanvasMode = "overview" | "findings" | "requirements" | "decision";
type CanvasFocus = { reportGroupKey: string; mode: CanvasMode; artifactType?: "finding" | "requirement"; artifactId?: string };
```

The implemented local values are mode, selected finding id and selected requirement id. The header exposes exactly one written current-focus label: **Case overview**, **Finding F1**, **Requirement C1**, or **Human decision**. This is intentionally not persisted to report data, local review history or global state.

Changing selected case returns to Overview and applies deterministic default focus. Findings select the first `CRITICAL`/`HIGH` finding, otherwise the first available finding. Requirements select the first open blocking Merge Contract clause, otherwise the first open clause, otherwise the first available clause; fallback report conditions select their first record.

### Finding/evidence grammar

Each finding is a keyboard-reachable ledger row with F identifier, title, severity, category, optional file surface, attached-evidence count/state and selected-plane plus left-rule ownership. Its expanded record carries the real finding summary, provenance, affected surface and stated action. Evidence remains indented and hairline-attached below the finding it supports; evidence identifiers, provenance and state come from the verification pack when it exists. A report without findings says **No findings were recorded for this report.** A finding without linked evidence says **No evidence records are attached.**

The right inspector remains case-level. VC-4C may consume `{ reportGroupKey, artifactType, artifactId }` to render selected finding/evidence/requirement detail, but VC-4B does not wire that relationship across panes.

### Requirements and decision treatment

Canonical Merge Contract records use their existing order as `C1…Cn` presentation references and expose clause title, importance, state, blocking meaning, statement, clearance evidence, owner cue and related findings where recorded. Pending/open states remain neutral or warning by wording; they do not use danger merely because they are unresolved.

When there is no canonical Merge Contract, the mode states that limitation and shows only real report merge conditions, deliberately without C identifiers, owner cues or invented clause-level clearance evidence. When neither exists, it uses concise bounded empty copy.

Human Decision keeps Lintel recommendation separate from the canonical decision ledger and local review state. Missing canonical decision is written as **No engineer decision has been recorded.** Existing local labels such as Tests requested remain local review state rather than being reinterpreted as approval/rejection or an actor/timestamp. Centre-only controls were not duplicated; existing local controls remain in the inspector. The Case File route remains available from the centre identity header.

### Scroll, data and responsive boundaries

The mode strip sits above `.workspace-canvas-scroll`; that body remains the sole centre vertical owner and uses contained overscroll. Mode changes only alter local presentation state. Finding and requirement selection expands in the centre rather than using broad `scrollIntoView`, so it cannot move the queue, inspector or outer workbench. There are no new nested body scroll regions.

At desktop the four modes preserve VC-4A's three-plane workbench. At 1024px and 390px the existing two/one-plane and drawer/sheet architecture remains authoritative; VC-4B only ensures the mode strip can scroll horizontally and content retains logical document order. VC-4D owns the full responsive workbench refinement.

### Components and selectors changed

- `app/workspace/page.tsx`: `WorkspaceCanvas` now owns local mode/focus state and renders the four bounded modes.
- `app/workspace/workspace.module.css`: adds `workspace-canvas-mode*`, `workspace-canvas-focus-*`, `workspace-canvas-attached-records`, and `workspace-canvas-decision-*` selectors while retaining `.workspace-canvas-scroll` as the centre body scroll owner.
- `docs/design/VC_4_PRODUCT_WORKBENCH_FINAL_ART_DIRECTION.md`: this VC-4B record.

### Validation matrix

| Check | Result |
| --- | --- |
| 1440px dark populated Workspace | Passed structurally with a locally generated built-in review: all four modes, current focus, selected rows and independent centre/inspector/queue scroll metrics are present; no page horizontal overflow. |
| 1440px light; 1280px / 1180px dark | Passed: warm-paper light material and dark technical planes preserve the same four-mode geometry; no page horizontal overflow. |
| 1024px / 390px regression | Passed: the existing compact architecture retains logical centre content and mode access with no page horizontal overflow. |
| Keyboard mode switching | Passed: ArrowRight advances Requirements to Human decision, updates written current focus and keeps the inspector case-level. |
| Finding and requirement selection | Passed: finding default and manual selection expand only within the centre; canonical requirement default is C1 and selected requirement state is visible beyond colour. |
| Empty / partial data | Source-covered: no finding, no linked evidence, no canonical contract and no decision all use bounded truthful copy; populated canonical contract checked with the local built-in review. |
| `/report?demo=1`, `/review-operations`, typecheck and diff check | Passed: both routes have no page horizontal overflow; console is clear; `git diff --check` and `npx tsc --noEmit --incremental false` pass. |
| Production build | Environment-limited: `npm run build` reaches the existing Google Fonts network fetch boundary for Geist, Geist Mono and Newsreader. No VC-4B code build error was reported before that fetch failed. |

### Deferred work

- **VC-4C:** dynamically project the selected centre artifact into the right inspector using the documented focus boundary; no global state unless the inspector genuinely needs it.
- **VC-4D:** refine intermediate/mobile workbench presentation and compact mode ergonomics without reopening VC-4A scroll ownership.

### Current milestone status

**VC-4B implemented and validated — ready for visual approval.** No commit or push is part of this milestone.

## VC-4C — Contextual inspector and operational alignment

**Status:** Implemented and validated; no commit or push.

### Scope and fixed state

VC-4C changes only the selected-artifact projection in the right Workspace inspector, the canvas-to-inspector presentation handoff, and directly shared Review Operations terminology. VC-4A's three-pane composition, queue selection and scrolling, centre mode structure, global shell, report data, persistence, recommendation/risk semantics and local ownership model remain fixed. No record is invented, persisted or remotely actioned.

### Focus contract

`WorkspaceFocus` is a typed, local presentation object: `{ reportKey, artifactType, artifactId? }`. `artifactType` is bounded to `case`, `finding`, `evidence`, `requirement`, and `human-decision`. `WorkspaceCanvas` publishes this minimum identity and the page reconciles it with the selected report before passing it to `WorkspaceInspector`; no report history, review state or storage receives artifact focus.

Overview projects case focus. Findings projects its deterministic selected finding, unless a genuinely attached evidence record is selected; evidence selection is keyboard-operable. Requirements projects the selected canonical clause or truthful fallback report condition. Human decision projects decision context. Changing report resets the canvas to Overview and safely resolves to case focus; missing/stale ids fall back to case focus instead of showing prior content.

### Inspector records and actions

Case focus remains compact: PR/repository identity, recommendation and risk context, open requirements, missing proof, next action, local owner/review state and the Case File route. It does not repeat complete centre lists.

Finding focus exposes only recorded F identifier, title, severity/category, provenance, surface, observed claim, attached evidence, related requirement and recorded next action. Evidence focus keeps the F → E → C relationship when present and shows the genuine evidence id, statement, class/status, provenance/source, related finding and requirement clearance context. Unknown/missing evidence stays neutral.

Requirement focus shows a canonical C reference only when the Merge Contract provides one; it includes state, importance, recorded owner cue, requirement text, exact clearance evidence, real related records and a bounded next action. A non-canonical report condition says so plainly and does not invent C identifiers, owner cues or clearance proof.

Human decision focus keeps Lintel recommendation, canonical decision, actor/timestamp, open proof and local review state distinct. No canonical decision reads as pending with actor/timestamp not recorded. Local workflow metadata is explicitly not a merge decision, and Open Case File remains the route to the complete Human Decision Ledger.

Inspector actions are contextually bounded. Open Case File is always available. Copy conditions/requirement is available only for case or requirement focus. Local owner and review-state controls remain case-level workflow metadata. Delete reports remains the quiet destructive action and is case-level only. No remote approval, test, reviewer assignment, comment or merge operation was added.

### Scroll, accessibility and partial data

The inspector's existing owned scroll container resets to its top when case or artifact identity changes; it does not move the queue, centre canvas or outer workbench. Its compact header supplies artifact type/identifier and has a polite, atomic focus announcement without forcibly moving keyboard focus. Canvas finding, evidence and requirement controls retain visible focus and selected state beyond colour. Empty, partial and stale records use bounded neutral statements rather than stale inspector content.

### Review Operations alignment

Review Operations remains a downstream document, not another Workspace. Its repository ledger now displays the existing latest risk alongside the same local review state and local-owner wording used in Workspace, and offers Open current Case File only where the current report route is genuinely available. Empty history remains unseeded and unchanged.

### Bounded Review Operations row-density correction

The populated repository ledger exposed an unintended stretched-row defect: a single local repository record expanded to roughly 920px tall, placing its evidence boundary far below a largely empty viewport. This was not a scroll, grid-row, flex-growth or Workspace-pane inheritance issue. The owning fixed-layout table retained width rules for its former six columns after the Risk and Local workflow columns were added. Its final two columns consequently collapsed to near-zero width, forcing their wrapped content to determine an extremely tall row.

The desktop width model now assigns all eight repository columns an explicit, non-zero share of the table: repository 22%, reviews 7%, open requirements 10%, recommendation 14%, risk 8%, local workflow 14%, latest activity 15%, and latest human decision 10%. At the existing 900-1179px intermediate rule, the final human-decision column is the one omitted and the remaining seven columns are rebalanced. The table, body and rows remain ordinary content-sized table flow; there is no fixed row height, nested vertical scroll owner or viewport-height distribution. The Local evidence boundary follows the ledger in normal document flow.

### Components and selectors changed

- `app/workspace/page.tsx`: `WorkspaceFocus`, canvas evidence selection, focus reconciliation, contextual inspector record renderers and scoped action hierarchy.
- `app/workspace/workspace.module.css`: keyboard-visible attached-evidence selection and compact evidence ledger text treatment.
- `app/review-operations/page.tsx`: local workflow/risk columns and current Case File route affordance.
- `app/administrative-document.module.css`: `.operationsRepositoryTable` desktop and 900-1179px column-width selectors now cover every rendered repository-record column.

### Validation matrix

| Check | Result |
| --- | --- |
| Populated Workspace case, finding, evidence, requirement and Human Decision focus | Passed in the one available local report: the inspector heading and ledger update from the selected centre artifact; its evidence and no-recorded-canonical-decision states remain truthful. |
| Workspace 1440px dark and light | Passed: selected context remains clear, the inspector is independently scrollable, and the light plane retains the same hierarchy without horizontal overflow. |
| Workspace 1280px and 1180px dark | Passed: the desktop inspector remains visible with compact context and no page-level horizontal overflow. |
| Workspace 1024px and 390px regression | Passed: desktop inspector is correctly absent at the existing drawer/sheet boundary and neither route has page-level horizontal overflow. |
| Review Operations record grammar | Passed with the available populated local history: record identifiers, recommendation, risk, local workflow terminology and the current Case File route agree with Workspace; no organisation data is implied. |
| Review Operations compact ledger correction | Passed: the available populated row reduced from about 920px to 102px at 1440px; all eight columns receive real width, the evidence boundary follows 33px below the table, document scrolling is natural, and no nested vertical scroll or horizontal page overflow is present. |
| Review Operations responsive regression | Passed at 1440px dark/light, 1280px dark, 1180px dark, 1024px dark, 768px and 390px dark/light. Desktop and intermediate rows remain content-sized; the existing labelled-record transformation takes over below 900px without horizontal overflow. |
| Canonical routes | Passed: `/report?demo=1` and `/new` load without page-level horizontal overflow. |
| Type safety, diff and production build | `git diff --check` and `npx tsc --noEmit --incremental false` passed. The current `npm run build` attempt is environment-limited by restricted Google Fonts fetches for the existing Geist, Geist Mono and Newsreader imports; it did not report an application compile or type error. |

### Deferred work

- **VC-4D:** full responsive workbench refinement. Existing compact drawer/sheet architecture remains authoritative in VC-4C.

### Current milestone status

**VC-4C implemented and validated — ready for visual approval.** Full intermediate and mobile workbench refinement remains explicitly deferred to VC-4D.

## VC-4B bounded React static-flag correction

**Status:** Corrected — direct-reload reproduction resolved; validation complete with recorded environment limitations.

### Reproduction and root cause

`/workspace` reproduced React's **“Internal React error: Expected static flag was missing.”** while rendering `WorkspaceCanvas`. A fully isolated cache/process restart could not be created in the managed workspace shell without stopping the shared development server or deleting its active cache; the direct reload nevertheless reproduced the runtime error and the component source confirmed the invariant violation.

`WorkspaceCanvas` returned its empty selected-case plane before declaring its `useState` and `useEffect` calls. The ordinary local-history transition from `group === null` to a selected group therefore changed that component's Hook sequence. This is a source defect, not an error to suppress or a reason to remove the four-mode canvas.

### Exact correction and invariants

- `WorkspaceCanvas` now derives safe nullable defaults, calls all three local presentation `useState` Hooks and its focus-reconciliation `useEffect` before the selected-case branch, and only then renders either the empty or populated plane.
- The reconciliation effect still resets mode and selected finding/requirement when the report-group key changes; it performs no render-time state update.
- `WORKSPACE_CANVAS_MODES`, `WorkspaceCanvasMode`, and their written labels are module-scope values, so the canvas has no render-created component or mode type boundary.
- The mode panels keep stable component ownership and their existing stable case/finding/requirement identifiers. Queue and inspector remain untouched and case-level.

### Verification sequence

The failing direct load was followed by the source correction. The single truthfully populated local report exercised all four modes, deterministic F1/C1 default focus, all five findings, all 23 requirements, keyboard mode switching, theme switching and a post-correction Workspace reload with no console errors. `/report?demo=1` and `/review-operations` also reported no console errors. Only one local queue report was available, so multi-case focus reconciliation and empty-state presentation remain source-covered rather than fabricated.

## VC-4D — Full responsive Product Workbench refinement

**Status:** Implemented and validated; no commit or push.

### Bounded pre-implementation declaration

VC-4D changes the Workspace responsive region, selected-case surface, Canvas/Inspector view state and their accessibility mechanics. Review Operations receives only its established narrow-ledger regression coverage. The approved desktop workbench at 1280px and above remains fixed: one connected queue, dominant working canvas and contextual inspector with fixed pane headers and independent body scrolling. Canonical data, report generation, risk/recommendation meaning, persistence, ownership/review-state semantics, global shell, landing page and Case File remain outside scope.

| Range | Visible working model | Scroll owner |
| --- | --- | --- |
| 1280px+ | Fixed three-pane workbench | Queue, canvas and inspector bodies independently scroll; outer workbench does not. |
| 1180–1279px | Same connected three-pane workbench with compact readable panes | Same three independent pane bodies. |
| 768–1179px | Queue base plus one bounded selected-case surface | The visible Canvas or Inspector body is the only selected-case scroll owner. |
| Below 768px | Queue sequence plus full-width selected-case working surface | The visible Canvas or Inspector body scrolls naturally in the surface. |

The selected-case surface is modal only below 1180px. It carries selected report identity, explicit Canvas/Inspector controls and one close control. Canvas retains the four established working modes; Inspector is an alternate contextual view rather than a second drawer. Opening a queue record starts in Canvas. Switching views does not close the case, reset selected artifact focus or alter review data.

Typography remains Geist Sans for application copy and Geist Mono only for technical values; mobile controls are at least 44px where primary/touch operated. Semantic colour remains restrained: neutral unknown/pending, warning for genuine attention, danger only for verified harm. No new motion, dependency, data or fabricated record was introduced.

### Responsive result

At 1180–1279px, the three panes remain connected. The centre stays dominant, queue records remain vertically readable rather than letter-wrapped, and queue/canvas/inspector bodies retain their owned scrolling. At 1440px the only resulting changes are responsive-selector ownership fixes; the approved layout and density are unchanged.

Below 1180px, the queue is the persistent prioritisation plane. Selecting a record opens one contained technical workspace with a compact selected-case header, Canvas/Inspector switch and a close control. The Inspector no longer opens as a concurrent side sheet. At tablet widths the surface is bounded within the shell working area; at mobile it becomes a full-width surface beginning below the fixed command bar.

The mobile sequence is deliberate: queue summary → report selection → Canvas mode → artifact selection → Inspector switch → return to Canvas or queue → complete Case File when required. Queue records retain state, repository/PR, written recommendation, requirement/risk context, next action, owner and selected state as labelled compact records rather than marketing cards.

### Focus, dialog and artifact contract

The responsive surface supplies `role="dialog"`, `aria-modal`, an accessible report-title name, close button, Escape handling, body scroll lock, focus trap, shell/queue inertness and safe queue-row restoration. Backdrop click closes the selected case. At desktop the wrapper is structural only and exposes no modal semantics. Closing after a filtered/deleted report safely attempts restoration only if its queue node remains mounted.

Canvas/Inspector controls are explicit pressed-state buttons. The established mode tab semantics, written active mode, selected finding/evidence/requirement focus and Human Decision focus remain unchanged. The existing deterministic reconciliation still resets focus when reports change, and Inspector focus remains derived from the matching report key, so stale artifact detail cannot survive a report change.

### Empty, partial and colour/theme treatment

No-history state remains one connected workbench explanation rather than several responsive empty cards. Existing truthful copy remains in place for reports with no findings, no evidence, no canonical contract, no decision, no owner, long technical identity and many requirements. On compact surfaces only one working view is shown at a time; empty context does not render a phantom Inspector alongside the queue.

Dark technical planes and warm-paper light planes share the exact responsive structure. Selected/focused hierarchy is written and ruled in both themes. No gradients, glow, glass or decorative shadow was added; overlay shadow is confined to the modal selected-case surface.

### Review Operations result

Review Operations remains the approved repository ledger. Its existing `max-width: 899px` labelled-record transformation remains the narrow-width boundary: repository and PR stay primary, reviews/open requirements/recommendation/risk/local workflow/latest activity and available Case File routes remain reachable, and the Local evidence boundary follows in natural document flow. The corrected desktop/intermediate table width allocation remains content-sized with no horizontal page overflow or reintroduced oversized rows.

### Acceptance matrix

| Check | Result |
| --- | --- |
| Workspace 1440px dark/light | Passed: fixed connected three panes, preserved pane ownership, dark/light parity and no page overflow. |
| Workspace 1280px / 1180px dark | Passed: three-pane geometry remains readable with queue, canvas and inspector `overflow-y: auto`; no horizontal overflow. |
| Workspace 1024px dark/light | Dark passed: queue base opens one labelled modal selected-case surface; Canvas/Inspector switch, all four modes, F1/C1/Human Decision focus, local controls, Escape and focus restoration work. Light uses the identical responsive selectors and was verified at wide desktop; a final direct 1024px light visual pass remains a bounded VC-4E observation. |
| Workspace 768px / 620px dark | Passed structurally: bounded/full-width selected-case transition is continuous, labels and actions remain available without a second drawer or page overflow. |
| Workspace 390px dark/light | Dark passed: labelled queue record, full-width 44px-control selected-case sequence, Canvas/Inspector switching and no page overflow. Light uses the identical responsive selectors and was verified at wide desktop; a final direct 390px light visual pass remains a bounded VC-4E observation. |
| Review Operations 1440px dark/light; 1024px / 768px dark; 390px dark/light | Passed by the existing compact ledger transformation and responsive CSS regression review; no horizontal overflow or stretched repository rows. |
| Case File, New Review and landing route | Regression checked: `/report?demo=1`, `/new` and `/` retain their existing route ownership. |
| Accessibility and runtime | Dialog semantics apply only when modal; backdrop/Escape/focus trap/restore work; queue and shell are inert while open; mode and view state are written beyond colour. No application console errors, duplicate-key warnings, static-flag error or application hydration mismatch observed. |
| Static checks | `git diff --check` and `npx tsc --noEmit --incremental false` pass. |

### Remaining work for VC-4E

VC-4E, if opened, should be limited to approval-driven visual polish or evidence from additional genuine local-history shapes. It must not reopen VC-4D's responsive surface model, desktop composition, data contracts or shell.

### Current milestone status

**VC-4D implemented and validated — ready for visual approval.** No commit or push is part of this milestone.

### VC-4B status after correction

The correction is limited to Hook/component structure in `app/workspace/page.tsx`. It does not alter the approved four-mode information architecture, report/review semantics, persistence, queue, inspector, global shell, responsive ownership or VC-4C/VC-4D boundaries.

**Corrected — ready for approval with the existing build-network limitation recorded.** VC-4A remains within its original three-pane composition; VC-4B, VC-4C and VC-4D remain deferred.
