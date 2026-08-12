# R6G validation evidence

Status: independently accepted candidate validation record. Independent verdict: **ACCEPT R6G WITH NON-BLOCKING FOLLOW-UPS**. Independent freeze-readiness verdict: **READY TO FREEZE R6G**. The required normal Windows production build has now succeeded against the final hygiene-normalized bytes, so the accepted candidate is ready for controlled freeze. This does not claim that R6G has been committed, merged, or frozen.

## Baseline

- Branch: `r6g-evidence-contextual-inspector`.
- HEAD: `d59164a746aafc55ac4e5c88de8c2f31fc1fdd52`.
- `HEAD...main`: `0 0` at CP0.
- Initial worktree: clean.
- R6F evidence and required production seams: present.

## Commands and outcomes

| Check | Command | Outcome |
| --- | --- | --- |
| Dependency restoration | `npm ci --offline --ignore-scripts` | Passed from the exact lockfile cache; 27 packages installed, 0 vulnerabilities; package files unchanged. |
| R6G deterministic | `node --experimental-strip-types --no-warnings --import ./lib/r6c/__validation__/node-hooks.mjs ./lib/r6g/__validation__/r6g.validation.ts` | `R6G validation: 11/11 passed` |
| R6F deterministic | same Node invocation with `./lib/r6f/__validation__/r6f.validation.ts` | `R6F validation: 14/14 passed` |
| R6E deterministic | same Node invocation with `./lib/r6e/__validation__/r6e.validation.ts` | `R6E validation: 8/8 passed` |
| R6D deterministic | same Node invocation with `./lib/r6d/__validation__/r6d.validation.ts` | `R6D validation: 23/23 passed` |
| R6C deterministic | same Node invocation with `./lib/r6c/__validation__/r6c.validation.ts` | `R6C validation: 36/36 passed` |
| TypeScript | `npx tsc --noEmit --incremental false` | Passed |
| Production build attempt 1 | `npm run build` | Failed only while fetching unchanged Geist, Geist Mono, and Newsreader from Google Fonts. |
| Production build attempt 2 | `npm run build` | Same external font-fetch failure. |
| Production build attempt 3, final source | `npm run build` | Same external font-fetch failure. |
| Native local production build | normal Windows PowerShell `npm run build` against the pre-hygiene accepted candidate | SUCCESS — Next.js 16.2.9 compiled in 4.9s, TypeScript finished in 10.9s, page data collected with 15 workers, static pages generated 47/47, page optimization finalized, exit 0. |
| Post-acceptance EOF-hygiene build | Codex sandbox `npm run build`, followed by normal Windows PowerShell `npm run build` against the same hygiene-normalized bytes | Codex failed only on unchanged Google Fonts network access; final native Windows build SUCCESS — Next.js 16.2.9 compiled in 9.1s, TypeScript finished in 28.0s, static pages generated 47/47, exit 0. |
| Diff check | `git diff --check` | Passed; only repository line-ending conversion notices. |

The earlier Codex build attempts are retained as environment history. The pre-hygiene native success and the final hygiene-normalized native success both confirm that the Codex failures were sandbox/network Google Fonts failures rather than source defects. After the seven excess LF bytes were removed, the required normal Windows `npm run build` was rerun against the final bytes and succeeded with 47/47 static pages and exit code 0.

Independent Opus reruns passed R6G 11/11, R6F 14/14, R6E 8/8, R6D 23/23, and R6C 36/36. TypeScript and `git diff --check` also passed independently.

## POST-ACCEPTANCE EOF HYGIENE

Controlled freeze staging exposed one excess blank EOF line in exactly seven newly introduced R6G files: `ContextualInspector.tsx`, `EvidenceMode.tsx`, `EvidenceRow.tsx`, `evidence.module.css`, `inspector.module.css`, `evidence-register.ts`, and `labels.ts`. Staging was automatically reverted before any commit. Each file was changed only to normalize EOF to one final newline; byte-level verification confirmed that its final content equals its accepted content minus exactly one final LF.

No executable, styling, interaction, state, copy, or domain semantics changed, and no path scope changed. Independent acceptance remains applicable to product behaviour. Opus did not re-review the hygiene correction. Code-level reruns against the normalized bytes passed R6G 11/11, R6F 14/14, R6E 8/8, R6D 23/23, R6C 36/36, and TypeScript. The Codex build attempt remained blocked only by sandbox access to Google Fonts; the subsequent normal Windows build against the final normalized bytes succeeded with 47/47 static pages and exit code 0.

## NATIVE VIDEO EVIDENCE

- Primary artifact: `evidence/r6g/R6G-interaction-walkthrough.mp4`, 28,013,011 bytes, captured as `Lintel — engineering verification for pull requests - Google Chrome 2026-08-11 23-15-59.mp4`.
- Provenance: genuine continuous Google Chrome recording of the real local R6G application, 83.30 seconds.
- Inspection: independently inspected frame-by-frame by Opus after external exercise.
- Demonstrated sequence: real Review and Queue; Evidence mode; grouped register; record selection; bounded inline detail; selection without automatic Inspector opening; explicit Inspector invocation; one contextual right-hand Inspector; unambiguous A-inspected/B-selected divergence at approximately 35.5s; explicit B replacement at approximately 39.5s; Inspector close preserving selection at approximately 43.2s; Review switch after Inspector close with fresh/cleared selection in the newly selected Review; repeated workflow on another real Review; invariant URL across Inspector transitions.
- Interaction result: no observed interaction errors.
- No additional screenshots or extracted frames were created.

The recording does not show an Evidence-to-Overview transition while the Inspector is open, a Review switch while the Inspector is open, DevTools, or a console panel. Those claims are not attributed to the recording.

## OUT-OF-BAND EXTERNAL BROWSER OBSERVATION

No R6G browser-console errors were observed during the external manual Chrome checkpoint. This factual observation is not visually corroborated by the recording. NB-2 is **RESOLVED IN FREEZE RECORD** by this corrected evidence classification.

## Requested dimensions and behavioral manifest

The recording is desktop-sized. It does not prove exact 1100, 1000, or 899 responsive frames, and no such native-video claim is made.

## DETERMINISTIC/SOURCE EVIDENCE

- Inspector-active renderability and layout gating.
- Queue yielding under Inspector pressure.
- Constrained sheet presentation selection.
- Narrow Inspector surface invocation.
- No hidden Inspector pressure while the selected Review is not ready.
- Existing R6D geometry-policy selection.
- Workspace useful-minimum arithmetic.
- Inspector survival across a same-Review mode change.
- Inspector-context preservation across same-Review Back/Forward navigation.
- Review switching while the Inspector is open closes the Inspector and clears selection.
- R6M remains the owner of final responsive geometry.

The open-Inspector mode/Review transition classification is deterministic/source evidence rather than native video evidence. NB-3 is **RESOLVED IN FREEZE RECORD**.

Screenshot manifest: none.

## Real and deterministic provenance

- Pure projections consume the real `CaseDetail.evidence` and `RelationshipState` contracts.
- The production adapter remains unchanged and read-only.
- Action behavior is exercised through the real R6C dispatcher and reconciliation.
- Layout pressure is exercised through the real R6D layout policy.
- Scale/status combinations use constructed copies of the deterministic workspace fixture only in the validation suite.

## NOT PRODUCIBLE HONESTLY

- The available real production route and recording do not produce stale Evidence.
- The available real production route and recording do not produce unverified Evidence.
- The available real production route and recording do not produce confirmed Evidence.
- The available real production route and recording do not produce not-applicable Evidence.
- Live record-level Inspector-unavailable after authoritative disappearance is not available as native video evidence.
- These states remain covered through deterministic/source validation and were not fabricated.

## Landmark, live-region, console, and focus result

Source and deterministic checks prove one `<main>` owner, one `InspectorHost` invocation, no new live region, a registered non-modal Inspector region, Inspector focus effect on open, and R6C focus-return resolution on close. Exactly two inherited live-region sources remain — `WorkstationShell` and `ReviewCollection` — and that count is classified as **SOURCE / INDEPENDENT SOURCE INSPECTION**; the R6G deterministic suite does not directly assert the DOM live-region count. The native Chrome recording supplies primary interaction evidence, but no console-panel, exact responsive, measured landmark, or measured live-region claim is inferred from it.
