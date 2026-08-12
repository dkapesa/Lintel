# R6G Evidence and Contextual Inspector — Accepted Evidence

## Independent acceptance

- Independent verdict: **ACCEPT R6G WITH NON-BLOCKING FOLLOW-UPS**.
- Freeze readiness: **READY TO FREEZE R6G**.
- Status: independently accepted candidate. The independent `READY TO FREEZE R6G` verdict remains applicable to product behaviour. The required normal Windows production build has now succeeded against the final hygiene-normalized bytes, so R6G is ready for controlled freeze. This record does not claim that R6G is committed, merged, retired, or complete on `main`.
- Independent reruns: R6G 11/11, R6F 14/14, R6E 8/8, R6D 23/23, and R6C 36/36. TypeScript and `git diff --check` passed.

## Post-acceptance EOF hygiene

Controlled freeze staging exposed one excess blank EOF line in exactly seven newly introduced R6G files: `ContextualInspector.tsx`, `EvidenceMode.tsx`, `EvidenceRow.tsx`, `evidence.module.css`, `inspector.module.css`, `evidence-register.ts`, and `labels.ts`. Staging was automatically reverted before any commit. Each file was changed only by removing its final excess LF so it ends with exactly one normal newline; byte-level verification confirmed that each final file equals its accepted bytes minus that one LF.

No executable, styling, interaction, state, copy, or domain semantics changed, and no path scope changed. Independent acceptance remains applicable to product behaviour. Opus did not re-review this hygiene correction. R6G 11/11, R6F 14/14, R6E 8/8, R6D 23/23, R6C 36/36, and TypeScript were rerun successfully against the hygiene-normalized bytes. The Codex production-build rerun was blocked only by sandbox access to Google Fonts; the subsequent normal Windows PowerShell production build against these same final bytes completed successfully with 47/47 static pages and exit code 0.

## Baseline

- Branch: `r6g-evidence-contextual-inspector`.
- Baseline and unchanged HEAD: `d59164a746aafc55ac4e5c88de8c2f31fc1fdd52`.
- Initial worktree: clean.
- Initial suites: R6F 14/14, R6E 8/8, R6D 23/23, R6C 36/36.

## Product boundary

The accepted candidate implements the Evidence Review mode and one contextual Evidence Inspector. It does not add Requirement depth, diff traversal, History, Human Decision controls, relationship traversal, an Inspector trail, object routes, search, filtering, sorting, pagination, or new state.

## Source map

- `CaseDetail.evidence` is resolved through `resolveCurrentCase(reviewIndex, reviewId, cases)`.
- `lib/r6g/labels.ts` owns exhaustive status and Evidence-class labels.
- `lib/r6g/evidence-register.ts` owns grouping, canonical row order, duplicate-identity defense, and internal Evidence context refs.
- `lib/r6g/evidence-context.ts` owns Inspector projection, inert relationship presentation, and effective Inspector renderability helpers.
- R6C remains the sole owner of selection, Inspector context, focus origin, Review transitions, persistence, and reconciliation.

## Four-group register

The first-match order is:

1. Missing proof: `missing` or `unverified`.
2. Stale evidence: not Missing proof, then `stale === true` or status `stale`.
3. Available evidence: not above, then `present` or `confirmed`.
4. Not applicable: status `not-applicable`.

Empty groups are omitted. Rows retain canonical source order. `observedAt` is not parsed, sorted, or presented.

## Exact row contract

Every default row contains title, a single-line statement, canonical status standing, and the Evidence-class label. At most one row also contains `In Inspector`. Opaque Evidence identity is used only for React keys and R6C context refs and is not rendered or included in accessible names.

## Selection and bounded detail

Native row buttons dispatch `selection/set`. Selection changes no route or history, does not open or close the Inspector, and does not move an already open Inspector. The selected row alone expands to the full statement, verbatim Source, and one `Inspect relationships` button.

## Explicit Inspector invocation and divergence

`Inspect relationships` dispatches `inspector/open` for the already selected Evidence context. At Narrow it also selects the existing sequential Inspector surface. If A is inspected and B is selected, A remains in the Inspector while B owns the selected treatment and inline detail. Explicitly inspecting B uses `inspector/open` again and replaces A in place. Neither `inspector/replace-context` nor `inspector/traverse-relationship` is bound.

## Inspector content

The Inspector contains one Evidence heading, full statement, and a standing definition list with exactly Status, Evidence class, Source, and Provenance. It contains exactly three inert relationship blocks: Supports findings, Supports requirements, and Related changed files. Linked labels and safe details are plain text. Partial and fully unresolved states show counts without raw ids. None and unavailable states retain truthful canonical copy.

## Close and unavailable behavior

Close dispatches `inspector/close`, preserves primary Evidence selection and route state, and returns Narrow presentation to Workspace. Focus return uses the captured pre-dispatch origin, then registered origin region, Workspace, and destination fallbacks. A reconciled missing Evidence context renders the specified unavailable message without exposing the ref or selecting a replacement.

## Review and mode restoration

The Inspector is Review-contextual rather than Evidence-mode-scoped. Mode activation and same-Review browser navigation preserve selection and Inspector context. Review switching follows R6C and clears the local selection and Inspector. Valid persisted refs survive R6C reconciliation; invalid refs are discarded or represented as unavailable according to the existing state model.

These open-Inspector transition semantics are deterministic/source evidence. The native recording switches Review only after closing the Inspector; it proves that the newly selected Review has fresh/cleared selection and that the real workflow remains healthy, but it does not prove an Evidence-to-Overview transition with Inspector open or a Review switch with Inspector open.

## Relationship milestone boundary

R6G shows existing Finding labels and severity details, Requirement labels and status details, changed-file labels and risk details, curated unavailable reasons, and unresolved counts. All are inert. Requirement clauses, required-evidence depth, condition progress, file/diff traversal, run comparison, breadcrumbs, graphs, and trails remain outside this candidate.

## Effective Inspector renderability and geometry

One derived semantic, `inspector.open && selected Review projection is ready`, controls Inspector DOM, shell presentation, and the Inspector-open input to effective layout. When false, canonical Inspector state is untouched, Queue pressure is removed, and a hidden Narrow Inspector surface derives Workspace presentation so no blank surface remains.

- Spacious, standard, and compact use the existing pane presentation and 336px provisional Inspector width.
- Compact yields Queue while the Inspector is active.
- Constrained uses the existing non-modal trailing sheet with no scrim.
- Narrow uses one sequential full-width Inspector surface.
- No breakpoint, geometry constant, resize control, or stored width was added.

## Accessibility and focus

The register uses section, heading, list, list-item, and native button semantics. The selected row alone uses `aria-current="true"`. The Inspector is an `aside` labelled `Contextual Inspector`, has `tabIndex={-1}`, and is neither modal nor a dialog. Explicit open focuses the registered Inspector region, including same-context noop re-inspection. Close restores focus through the existing R6C resolution order. Focus-visible and forced-colours treatments are present. No live region, Escape binding, roving tabindex, arrow navigation, or focus trap was added.

## Action registry

The current composed registry moves from six to nine actions by appending `selection/set`, `inspector/open`, and `inspector/close`. The historical R6D registry remains four. Replace and traversal actions remain unbound.

## Prior validation evolution

Exactly three prior assertions changed:

- R6E current registry expectation: six to nine.
- R6F current registry expectation: six to nine; historical R6D remains four.
- R6D Inspector absence assertion: re-scoped to sole main ownership and one `InspectorHost` invocation.

No fourth prior assertion changed. No R6C assertion changed.

## Deterministic validation

The R6G suite has 11 substantive grouped tests covering current-Case resolution; 0, 1, long, duplicate-id, and 120-record shapes; all canonical status and class labels; four groups and first-match precedence; source order without chronology; presentation omission of `observedAt` and opaque ids; selection/open/replacement/close semantics; mode, browser, Review-switch, and reconciliation behavior; all RelationshipState variants; renderability and Queue pressure; exact registries; and Narrow explicit invocation.

Final deterministic results recorded in `evidence/r6g/R6G_VALIDATION_EVIDENCE.md` are R6G 11/11, R6F 14/14, R6E 8/8, R6D 23/23, and R6C 36/36. TypeScript passes.

## Browser evidence and source-proven limitations

### NATIVE VIDEO EVIDENCE

Primary interaction evidence is the genuine continuous Chrome recording captured as `Lintel — engineering verification for pull requests - Google Chrome 2026-08-11 23-15-59.mp4` and retained in the candidate as `evidence/r6g/R6G-interaction-walkthrough.mp4`, approximately 83 seconds long. It was captured from the real local R6G application and independently inspected outside Codex.

Independent frame-by-frame inspection of the 83.30-second recording confirms a real selected Review and Queue, Evidence-mode entry, the grouped Evidence register, record selection, bounded inline detail, selection without automatic Inspector opening, explicit `Inspect relationships`, the contextual right-hand Inspector, unambiguous A-inspected/B-selected divergence at approximately 35.5 seconds, explicit replacement in place at approximately 39.5 seconds, close preserving selection at approximately 43.2 seconds, Review switching after Inspector close, the same workflow on another real Review, an invariant URL across Inspector transitions, and no visible interaction defect.

The recording does not contain DevTools or a console panel. The factual observation that no R6G browser-console errors were observed belongs to the out-of-band external manual Chrome checkpoint and is not visually corroborated by the recording.

### OUT-OF-BAND EXTERNAL BROWSER OBSERVATION

No R6G browser-console errors were observed during the external manual Chrome checkpoint. This observation is retained as an out-of-band browser result; it is not attributed to, or visually corroborated by, the native recording.

### DETERMINISTIC/SOURCE EVIDENCE

The desktop-sized recording does not prove exact 1100, 1000, or 899 responsive frames. Inspector-active layout gating, Queue yield pressure, constrained presentation selection, Narrow Inspector invocation, hidden-Inspector pressure removal, R6D geometry-policy selection, and Workspace useful-minimum arithmetic remain deterministic/source-validated. Deterministic/source validation also proves that the Inspector survives a same-Review mode change, same-Review Back/Forward preserves Inspector context, and switching Review while the Inspector is open closes it and clears selection. R6M remains the owner of final responsive geometry.

Exactly two inherited live-region sources remain: `WorkstationShell` and `ReviewCollection`. This is **SOURCE / INDEPENDENT SOURCE INSPECTION**, not a claim that the R6G deterministic suite directly asserts the DOM live-region count.

### NOT PRODUCIBLE HONESTLY

The available real production route and recording do not produce stale, unverified, confirmed, or not-applicable Evidence, or live record-level Inspector-unavailable behavior after authoritative disappearance. Those states remain deterministically/source validated. No screenshot or frame was manufactured from the recording.

## Production build

SUCCESS — native local build 47/47, exit 0 against the pre-hygiene accepted candidate. A normal Windows PowerShell production build compiled successfully in 4.9 seconds, finished TypeScript in 10.9 seconds, collected page data with 15 workers, generated 47/47 static pages, and finalized page optimization. No production source changed before that successful build or during independent acceptance.

POST-ACCEPTANCE EOF HYGIENE BUILD — the Codex sandbox rerun exited 1 only because it could not fetch unchanged Geist, Geist Mono, and Newsreader resources from Google Fonts. A subsequent normal Windows PowerShell `npm run build` against the same final hygiene-normalized bytes succeeded: Next.js 16.2.9 compiled successfully in 9.1 seconds, TypeScript finished in 28.0 seconds, page data was collected with 15 workers, 47/47 static pages were generated, page optimization finalized successfully, and the process exited 0. No font, Next, package, or build configuration changed. This resolves the final build verification blocker.

## Protected-scope audit

No `lib/r6c/**`, `lib/workspace-v2/**`, canonical Evidence/domain owner, R6E collection UI, protected R6F production module, protected R6D pure module, root layout, legacy Workspace, public route, API route, package manifest, lockfile, TypeScript configuration, font, or Next configuration was changed.

## Final non-blocking follow-up disposition

- **NB-1 — transient Inspector DOM-gate derivation difference: NON-BLOCKING; DEFER.** `InspectorHost` additionally gates on `selectedCase`, while shell/layout pressure uses shared `inspectorActive`. Independent review found a theoretical one-render disagreement during authoritative Case advancement before R6C reconciliation commits. It is not reachable through normal R6G interaction, self-corrects through existing reconciliation, does not defeat the non-ready Inspector-pressure protection, and is not an R6C defect or persistent inconsistency. Production source is unchanged.
- **NB-2 — console evidence classification: RESOLVED IN FREEZE RECORD.** The no-console-error observation is classified as an out-of-band external browser observation and is explicitly not attributed to the recording.
- **NB-3 — Review/mode native-evidence over-attribution: RESOLVED IN FREEZE RECORD.** Native video and deterministic/source claims are now separated precisely.
- **NB-4 — Narrow label-in-name mismatch: NON-BLOCKING; DEFER.** The visible Narrow text is `← {modeLabel}` while the accessible name is `Close Inspector`, creating a potential WCAG 2.5.3 label-in-name concern. Defer to the bounded later responsive/accessibility programme, preferably R6L/R6M. Production source is unchanged.
- **NB-5 — duplicate `projectSelectedReview` computation: NON-BLOCKING; DEFER.** The Provider memoises it while `WorkspaceHost` still computes it. This is a performance/cleanup follow-up with no correctness effect.
- **NB-6 — 28 MB native recording: accepted one-off evidence disposition.** Retain the 28,013,011-byte R6G recording because temporal interaction semantics are the primary acceptance claim for this milestone. This does not establish large MP4s as the default evidence format; future milestones should prefer the smallest truthful evidence form suitable to their claims. The accepted recording was not compressed, replaced, removed, or re-encoded.

Exact responsive browser measurements remain an explicitly bounded evidence limitation under the existing R6D policy and future R6M ownership.
