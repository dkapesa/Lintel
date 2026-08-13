# R6K Candidate Native Validation Evidence

## Status

This is the final engineering/native validation record for the uncommitted R6K Human Decision candidate. Corrected genuine native evidence, final Claude acceptance, production build, and all engineering freeze gates are complete. R6K is not yet frozen because the freeze commit has not been created.

## Baseline and implementation gates

- Branch: `r6k-human-decision`
- Baseline and retained HEAD: `443cf02f2fc272bccf8540435b3bb0e5bae303d6`
- Required `HEAD...main`: `0 0`
- R6K implementation result: `READY FOR R6K NATIVE EVIDENCE`
- R6K deterministic validation: **24/24 grouped checks PASS**, covering the requested 53 behavioral areas.
- TypeScript implementation gate: **PASS**.
- `git diff --check` implementation gate: **PASS**.

Claude's first formal C5 side-by-side review returned `R6K REQUIRES BOUNDED C5 CONVERGENCE`. The subsequent bounded pass changed only `app/(workstation)/human-decision.module.css` to address VG-K1 scrollbar/content-edge alignment, VG-K2 More outcomes disclosure placement/weight, VG-K4 the textarea resize grip, and VG-K5 header/footer separator consistency. Its validation result was R6K **24/24**, R6F **14/14**, R6H **5/5**, R6I **13/13**, R6J **9/9**, TypeScript **PASS**, and `git diff --check` **PASS**.

Claude directly re-inspected the raw C5 reference and all five final frames and returned `R6K REFERENCE FIDELITY ACCEPTED`. VG-K1, VG-K2, VG-K4, and VG-K5 are closed. VG-K3 remains deferred to R6O, and the Recorded chip remains unchanged/non-blocking.

The complete predecessor matrix below was rerun fresh for the final freeze gate:

- R6J: **9/9**
- R6I: **13/13**
- R6H: **5/5**
- R6G: **11/11**
- R6F: **14/14**
- R6E: **8/8**
- R6D: **23/23**
- R6C: **36/36**

## Formal screenshot set

The formal R6K native set contains exactly these five PNGs and no other PNG or MP4:

| Formal evidence | Dimensions | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `evidence/r6k/R6K-1440-composer-clean.png` | 1440 × 900 | 150,647 | `2484e7c481a5b3e28554967272c87c135765b0196df6fd45cc85ac29a415d782` |
| `evidence/r6k/R6K-1440-more-outcomes.png` | 1440 × 900 | 164,525 | `6ff30a7555c46e9b2848af05d700c2af3cdaf1357d07543d206caef85b6a7382` |
| `evidence/r6k/R6K-1440-consequential-disclosure.png` | 1440 × 900 | 187,938 | `3b227e837072a667017ebe6a085e439e7465ab2dde5e89db0ead8aeda32b09b7` |
| `evidence/r6k/R6K-1440-decision-recorded.png` | 1440 × 900 | 164,102 | `2dbdb82e0a500ea7e08fcdadbd94755ce83c00e189223c97150afda61dbc6bf4` |
| `evidence/r6k/R6K-1440-stale-draft.png` | 1440 × 900 | 202,289 | `3a2532f0c5f6c0342b7b6eb48dca34a025cd6bf5f2b6226f0b4e4013b81cf6e2` |

## What the frames prove

### 1. Clean composer

The pixels show the genuine `vercel/next.js` Review behind the open, 480px-class top-anchored Human Decision modal; no selected decision; the five default outcomes Approve, Tests required, Review required, Request changes, and Blocked; collapsed More outcomes; empty rationale; and disabled Record decision. They also show the corrected thin quiet composer scrollbar without loud stepper arrows, improved body/fixed-chrome alignment, a dark compact More outcomes label with adjacent caret, no textarea resize grip, matching header/footer hairlines, and unchanged option geometry.

### 2. More outcomes

The pixels show More outcomes expanded inside the same flat modal body, without a new card or container. Approve with accepted risk and Defer decision are visible, and the compact label-plus-caret disclosure remains below the revealed rows. The body scrollbar is thin and quiet, and the footer remains fixed and restrained. The clean frame establishes the complete default five. Because the expanded body is scrolled, the top default rows are not simultaneously visible. The still proves disclosure state, not the click interaction.

### 3. Consequential disclosure

The corrected pixels show the amber `Approve with accepted risk` consequence surface and its explicit explanation that the engineer is accepting named residual risks and must select at least one current reference. Genuine Risk references are visible with one selected option. The frame also shows populated rationale, `Draft saved`, an enabled `Replace decision`, one strong primary, a thin quiet composer scrollbar, no typed-confirmation control, and no textarea resize grip.

This is a genuine consequential replacement state after the canonical Review had already advanced. It truthfully substitutes for the earlier unresolved-blocker Record frame rather than pretending to reproduce it. No browser state or localStorage was fabricated or reconstructed. The frame still proves consequential selection, progressive amber disclosure, additional required controls, rationale, and an enabled canonical primary, but it is not byte- or state-equivalent to the pre-correction frame.

### 4. Canonical recorded decision

The pixels show the composer closed after recording, `Human Decision recorded: Tests required.`, Actor `Local reviewer`, timestamp `13 August 2026 at 21:13 UTC`, `Applies to current head`, `Relationship to Lintel: Matches Lintel.`, and the recorded rationale. The separate Lintel Recommendation remains above and Verification standing remains below. No toast, celebratory UI, or draft marker is visible. The actor label is local/device-only truth, not authenticated identity.

### 5. Genuine stale draft

The pixels show Currently recorded `Tests required`, a canonical `Recorded` marker on Tests required, and an independent private draft selection of Approve. They show the stale notice `This draft was formed against an earlier state of this Review.` and only the changed fact `The recorded decision changed.` The ordinary Record/Replace primary is absent; Discard draft and the primary Reconcile action are visible. The corrected thin quiet scrollbar has no loud native arrows, content alignment is improved, and the canonical/private distinction is unchanged. The frame does not prove run, head, or case movement.

## Genuine native workflow

The screenshots came from the real browser-local product flow on `vercel/next.js`, PR #63226, `Fix sendGAEvent function params and type clearly`:

1. open the clean Human Decision composer;
2. inspect More outcomes;
3. select Approve against genuine unresolved blockers;
4. enter genuine rationale;
5. observe conditional consequential disclosure;
6. close and reopen the composer and switch Reviews while the draft persists;
7. change the draft to a truthful canonical decision;
8. record Tests required through the existing canonical Human Decision service;
9. observe workspace reprojection and recorded rationale;
10. create another private draft;
11. move the canonical decision context relative to the private draft;
12. reopen the draft;
13. observe the genuine stale state; and
14. observe R6K block submission and expose Reconcile and Discard draft.

After the bounded C5 correction, four modal frames were recaptured from genuine product state. Because the canonical Review had advanced, the consequential frame truthfully captures an accepted-risk replacement state rather than reconstructing the earlier unresolved-blocker state. No localStorage manipulation or historical-state fabrication was used. This sequence is a native workflow observation. The stills prove rendered states only and do not individually prove every intermediate interaction.

## Screenshot limitations

The stills do not prove keyboard behavior, focus trapping, dismissal behavior, persistence, radio arrow-key behavior, transition timing, disclosure-click behavior, the canonical service call, reprojection timing, or the stale-state creation sequence. Evidence 3 proves an accepted-risk replacement state and must not be described as `Approve with unresolved blockers` or as a `Record decision` frame. Evidence 5 proves only `The recorded decision changed.` and not run, head, or case movement.

## Reconciliation validation

- R6K validation rerun fresh: **24/24 grouped checks PASS**.
- R6J: **9/9 grouped checks PASS**.
- R6I: **13/13 PASS**.
- R6H: **5/5 PASS**.
- R6G: **11/11 PASS**.
- R6F: **14/14 PASS**.
- R6E: **8/8 PASS**.
- R6D: **23/23 PASS**.
- R6C: **36/36 PASS**.
- `.\node_modules\.bin\tsc.cmd --noEmit --incremental false`: **PASS**.
- `git diff --check`: **PASS**; output contains only the repository's normal Windows LF-to-CRLF notices.
- Production/test/CSS byte-integrity comparison: **PASS**; all 19 candidate production/test/CSS paths match their pre-documentation SHA-256 values.
- Corrected `app/(workstation)/human-decision.module.css` remains byte-identical to the bounded-correction candidate at SHA-256 `9edb1c5d9e28849bcc958b47f4a53f5559bbc22d848797e658b7dd7c29ef4062`.
- PNG byte-integrity comparison: **PASS**; all five PNG SHA-256 values remain unchanged.

Production build: **PASS**. The initial restricted Codex-environment attempt could not reach Google Fonts. The unchanged candidate then built successfully in the exact R6K worktree from the user's normal Windows terminal with verified network access: Next.js 16.2.9 compiled successfully and generated static pages **47/47**. No source, package, font, or configuration change occurred between attempts.

## Security and trust

This corrected-evidence reconciliation is documentation-only. It introduces no source retrieval, model call, canonical Human Decision write, localStorage or draft write, recommendation mutation, schema or API change, new storage key, Human Decision ledger mutation, fabricated evidence, historical-state reconstruction, visible internal ID, or fake actor identity. The accepted-risk corrected frame is genuine native state, not a state recreated through localStorage manipulation.

## Current Git state

- Modified tracked paths: **12**.
- New/untracked paths: **15**.
- Total literal candidate paths: **27**.
- Staged paths: **0**.
- Branch: `r6k-human-decision`.
- HEAD remains `443cf02f2fc272bccf8540435b3bb0e5bae303d6`.
- `HEAD...main` remains `0 0`.
- The known Next development-route drift in `next-env.d.ts` was restored to HEAD only; it is absent from the final candidate path set.
- Nothing was staged, committed, pushed, or merged.
- Remote branch absence was not reverified: **NETWORK UNAVAILABLE**.

## Freeze readiness

- Authoritative milestone evidence: `docs/r6/R6K_HUMAN_DECISION_EVIDENCE.md`.
- Final Claude acceptance: **PASS** — `R6K REFERENCE FIDELITY ACCEPTED`.
- Production build: **PASS** in the unchanged exact R6K worktree from the user's normal Windows environment.
- Fresh full validation matrix, TypeScript, diff-check, PNG integrity, candidate scope, and protected integrity: **PASS**.
- R6K is ready for its freeze commit. No freeze SHA is asserted before that commit exists.
