# R6K Human Decision Candidate

## Status

R6K implementation candidate retained as the historical implementation, architecture, and adjudication record. Final Claude C5 acceptance, production build, validation, and evidence gates are complete. The authoritative milestone record is `docs/r6/R6K_HUMAN_DECISION_EVIDENCE.md`; only the freeze commit remains pending.

## Baseline

- Branch: `r6k-human-decision`
- Required and retained HEAD: `443cf02f2fc272bccf8540435b3bb0e5bae303d6`
- Required and retained `HEAD...main`: `0 0`
- Nothing is staged, committed, pushed, or merged by this implementation pass.

## Accepted implementation contracts

The original Claude Opus Extra **R6K Human Decision Architecture and C5 Convergence Contract** was accepted as the implementation architecture.

The Claude Opus Extra **R6K Focused Draft-Lifecycle Reconciliation** was accepted as the final authority for every section it supersedes. The candidate therefore uses a provider-owned per-Review session cache as the session source of truth; a non-evicting 64-slot durable mirror; envelope- and record-level quarantine; non-fatal switch flushing; the reconciled three-state durability vocabulary; and draft clearing immediately after the canonical service returns `persisted`, before workspace reprojection.

The raw **Fifth Cursor Batch.pdf** C5 Settings source was rendered and inspected directly. The implementation follows its top-anchored modal, quiet full-width option rows, More Options disclosure, separator-to-amber consequence sequence, fixed top edge during disclosure growth, and restrained footer/action hierarchy. Cursor branding, settings/privacy language, account-deletion semantics, and typed confirmation were not copied.

## Implemented scope

The candidate adds the R6K draft/storage module, composer-state and command derivation, canonical-label barrel, deterministic validation, Human Decision modal, and modal-local styling. It binds the already-declared `overlay/open` and `overlay/close` actions, adds provider-owned session draft and durability state outside `WorkstationState`, constructs the existing workspace decision service once from writable browser storage, and integrates the persistent selected-Review chrome and existing Overview Human Decision section.

The four implementation-brief predecessor validation paths were advanced from the live production registry count of 11 to 13. Direct execution also showed that R6E and R6G each contain the same exact live-registry assertion; those two validations received the identical mechanical 11-to-13 update so the required predecessor suites remain executable and green. No R6E or R6G behavior changed.

The additive change to `lib/r6f/human-decision-orientation.ts` is necessary because the existing Overview projection did not expose the recorded rationale. It preserves the existing statement and signature semantics and adds only the required read-only rationale detail; the already adapter-populated divergence detail remains authoritative.

The selected-review CSS change is necessary to provide the persistent right-aligned Human Decision chrome action and its quiet standing/durability state. No shell breakpoint, global token, or global stylesheet changed. `FocusRegistry.ts` and `workstation-shell.module.css` were not needed: the invocation element is retained directly for local focus return and the modal is portalled above the existing shell.

## Lifecycle and trust boundaries

- Draft key remains `lintel.r6.humanDecisionDraft.v1`.
- Canonical ledger key and writer remain unchanged; R6K calls only `createWorkspaceDecisionService(storage)`.
- Reaffirmation routes directly to `reaffirmDecision`; R6K does not rely on the protected supersede classification.
- The UI reads adapter-projected decision divergence and never calls the protected ledger divergence stub.
- Human Decision does not mutate recommendation, readiness, requirements, blockers, evidence, or risk score.
- Exactly the seven existing `DECISION_OUTCOMES`, `OUTCOME_LABEL`, and `OUTCOME_MEANING` values are used.
- No draft is evicted, expired, pruned, or silently rebased.
- Only verified `persisted` and explicit engineer discard remove a valid draft.
- Unreadable envelope bytes are never written by R6K; unreadable Review slots are preserved during other writes and can be replaced only by confirmed **Discard unreadable draft**.
- Canonical submission remains independent of draft durability.

## Validation state

- R6K deterministic validation: **24/24 grouped checks passed**.
- R6J: **9/9**.
- R6I: **13/13**.
- R6H: **5/5**.
- R6G: **11/11**.
- R6F: **14/14**.
- R6E: **8/8**.
- R6D: **23/23**.
- R6C: **36/36**.

The R6K suite covers the 53 requested behavioral areas across 24 grouped checks, including durable round trips and restart, Review isolation, each stale basis dimension, indeterminate blocking, explicit reconcile acknowledgement and movement refusal, discard truthfulness, every canonical result's clearing/retry classification, both quarantine levels, capacity refusal and byte preservation, update-at-capacity, failed-flush session survival, mutually exclusive durability results, outcome/rationale/risk authority, command routing, overlay semantics, registry bounds, state separation, accessibility/C5 structure, canonical conflict/idempotency/read-back, recommendation independence, and canonical submission under all durability categories.

The exact requested TypeScript command, `.\node_modules\.bin\tsc.cmd --noEmit --incremental false`, passes. `git diff --check` passes; Git prints only the repository's normal Windows LF-to-CRLF checkout notices.

## Bounded C5 convergence correction

Claude's first formal C5 side-by-side review returned `R6K REQUIRES BOUNDED C5 CONVERGENCE`. The accepted architecture, interaction model, persistence model, Human Decision semantics, and macro modal composition were not reopened. One R6K-local stylesheet correction addressed VG-K1 scrollbar/content-edge alignment, VG-K2 More outcomes placement and weight, VG-K4 the rationale textarea resize grip, and VG-K5 header/footer separator consistency.

Direct inspection of the corrected frames shows `VISIBLE CORRECTION PRESENT` for VG-K1, VG-K2, VG-K4, and VG-K5. These observations record rendered correction presence only; they do not close Claude's final perceptual gate. VG-K3 remains deferred to R6O. The Recorded chip remains unchanged and is a non-blocking R6O harmonisation candidate.

## Formal native evidence set

Exactly five genuine native PNGs now form the R6K candidate evidence set. All five were inspected directly and are exactly 1440 × 900 pixels.

| Formal evidence | Dimensions | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `evidence/r6k/R6K-1440-composer-clean.png` | 1440 × 900 | 150,647 | `2484e7c481a5b3e28554967272c87c135765b0196df6fd45cc85ac29a415d782` |
| `evidence/r6k/R6K-1440-more-outcomes.png` | 1440 × 900 | 164,525 | `6ff30a7555c46e9b2848af05d700c2af3cdaf1357d07543d206caef85b6a7382` |
| `evidence/r6k/R6K-1440-consequential-disclosure.png` | 1440 × 900 | 187,938 | `3b227e837072a667017ebe6a085e439e7465ab2dde5e89db0ead8aeda32b09b7` |
| `evidence/r6k/R6K-1440-decision-recorded.png` | 1440 × 900 | 164,102 | `2dbdb82e0a500ea7e08fcdadbd94755ce83c00e189223c97150afda61dbc6bf4` |
| `evidence/r6k/R6K-1440-stale-draft.png` | 1440 × 900 | 202,289 | `3a2532f0c5f6c0342b7b6eb48dca34a025cd6bf5f2b6226f0b4e4013b81cf6e2` |

There are no other PNGs and no MP4s in `evidence/r6k/`. No diagnostic or superseded evidence is part of the formal set.

## Still-image evidence

### Clean composer

`R6K-1440-composer-clean.png` visibly shows the `vercel/next.js` Review behind the open, 480px-class top-anchored Human Decision modal. No decision is selected. The five default outcomes are visible in order: Approve, Tests required, Review required, Request changes, and Blocked. More outcomes is collapsed and now appears as a dark compact label-plus-adjacent-caret control. The rationale is empty, its textarea has no visible resize grip, and Record decision is disabled. The composer scrollbar is thin and quiet, without the formerly loud Windows track or stepper arrows; body content is visibly aligned with the fixed chrome; and the header/footer hairlines visually match. Option geometry remains unchanged.

### More outcomes

`R6K-1440-more-outcomes.png` visibly shows More outcomes expanded inside the same flat modal body, without an extra card or container around the disclosed rows. Approve with accepted risk and Defer decision are visible, followed by the compact dark More outcomes label and its adjacent up-caret below the revealed rows. The thin quiet body scrollbar is visible and the footer remains fixed and restrained. The clean frame establishes the complete five-outcome default set; because this expanded frame's modal body is scrolled, the top default rows are not simultaneously visible. The frame proves the rendered disclosure state, not the click that produced it.

### Consequential disclosure

`R6K-1440-consequential-disclosure.png` now visibly shows the genuine accepted-risk replacement path, not the pre-correction unresolved-blocker Record state. Its amber `Approve with accepted risk` region explains that the engineer is explicitly accepting named residual risks and must select at least one current reference. The visible Risk references include genuine current options and one selected reference. The frame also shows populated rationale, `Draft saved`, an enabled `Replace decision` primary, one strong primary action, a thin quiet composer scrollbar, no typed-confirmation control, and no visible textarea resize grip.

This semantic-state substitution is deliberate and truthful. The canonical Review had already advanced, so the corrected capture preserves the current genuine product state rather than fabricating, reconstructing, or manipulating localStorage to recreate the earlier unresolved-blocker frame. The final frame still exercises consequential selection, progressive amber disclosure, additional required controls, rationale, and an enabled canonical primary, but it is not byte- or state-equivalent to the earlier screenshot.

### Canonical decision recorded

`R6K-1440-decision-recorded.png` visibly shows the composer closed and `Human Decision recorded: Tests required.` It shows Actor `Local reviewer`, the timestamp `13 August 2026 at 21:13 UTC`, `Applies to current head`, `Relationship to Lintel: Matches Lintel.`, and the recorded rationale. The separate Lintel Recommendation remains visible above and Verification standing remains visible below, preserving the semantic distinction between recommendation and canonical Human Decision. No toast, celebratory treatment, or draft marker is visible. `Local reviewer` is local/device-only actor truth, not proof of an authenticated human identity.

### Genuine stale draft

`R6K-1440-stale-draft.png` visibly shows Currently recorded `Tests required`, with the canonical `Recorded` marker attached to Tests required, while the private draft independently selects Approve. The stale notice says `This draft was formed against an earlier state of this Review.` and gives the single visible reason `The recorded decision changed.` The ordinary Record/Replace primary is absent; `Discard draft` is visible and `Reconcile` is the primary action. The corrected frame shows the thin quiet scrollbar without loud native arrows and improved alignment to the fixed chrome. The canonical/private distinction and option geometry remain unchanged. The still does not establish run, head, or case movement.

## Genuine native workflow observation

The recorded-decision and stale-state history was produced through the real browser-local product flow on `vercel/next.js`, PR #63226, `Fix sendGAEvent function params and type clearly`:

1. open the clean Human Decision composer;
2. inspect More outcomes;
3. select Approve against genuine unresolved blockers;
4. enter genuine rationale;
5. observe the conditional consequential disclosure;
6. close and reopen the composer and switch Reviews while the draft persists;
7. change the draft to a truthful canonical decision;
8. record Tests required through the existing canonical Human Decision service;
9. observe workspace reprojection and the recorded rationale;
10. create another private draft;
11. move the canonical decision context relative to that private draft;
12. reopen the draft;
13. observe the genuine stale state; and
14. observe R6K block submission and expose Reconcile and Discard draft.

After the bounded C5 correction, four composer frames were truthfully recaptured from the genuine state that remained available. The consequential recapture therefore uses an accepted-risk replacement state after the canonical decision had advanced. No historical state was fabricated or reconstructed, and no localStorage manipulation was used to force the earlier composition. This is a native workflow observation; the five still images prove only their rendered states and do not individually prove every intermediate interaction.

## Screenshot truth boundaries

The formal stills do not prove keyboard behavior, focus trapping, dismissal behavior, persistence across close/reopen or Review switching, radio arrow-key behavior, transition timing, the More outcomes click itself, the canonical service call, workspace reprojection timing, or the interaction sequence used to create staleness. Those behaviors remain engineering-validation or native-workflow observations rather than still-image claims.

The consequential frame proves an accepted-risk replacement state and must not be described as `Approve with unresolved blockers` or as a `Record decision` frame. The stale frame proves only the visible changed fact `The recorded decision changed.` and must not be cited as proof of run, head, or case movement. The recorded frame does not establish an authenticated actor identity.

## Remaining gates

- Final Claude verdict: `R6K REFERENCE FIDELITY ACCEPTED`.
- Production build: **PASS** in the exact R6K worktree from the user's normal Windows environment; the earlier restricted Codex attempt failed only because it could not reach Google Fonts, and no source/config/package change occurred between attempts.
- Authoritative final milestone evidence: `docs/r6/R6K_HUMAN_DECISION_EVIDENCE.md`.
- R6K is ready for its freeze commit; no freeze SHA is asserted yet.
