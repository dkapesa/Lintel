# R6F validation evidence

Status: final accepted R6F validation evidence. It records freeze readiness; it does not claim that the Git freeze commit or merge has occurred.

## Baseline

- Branch: `r6f-selected-review-foundation-overview`
- Exact baseline: `aa0ae4a421fb9a3ff7dba406f6336ed64bbeae10`
- Worktree at CP0: clean, tracked and untracked.
- R6E evidence, R6E collection, and `lib/r6e`: present.
- Baseline suites: R6E 8/8, R6D 23/23, R6C 36/36.

## Deterministic coverage

The R6F suite contains 14 substantive grouped tests covering all 28 minimum assertions: five projection states and their distinctions; frozen current-Case resolution; Queue independence; recommendation/decision separation; decision discriminants; exact mode links; Push/noop/unavailable/reselect/stale action semantics and context preservation; next-step precedence; complete pending/recorded states; severe wording; omission of risk score, fabricated run/head data, and R6G+ objects; opaque `github.updatedAt`; analysis basis; standing; and the six-current/four-historical registries.

Final command results:

| Check | Result |
| --- | --- |
| R6F deterministic | `R6F validation: 14/14 passed` |
| R6E deterministic | `R6E validation: 8/8 passed` |
| R6D deterministic | `R6D validation: 23/23 passed` |
| R6C deterministic | `R6C validation: 36/36 passed` |
| TypeScript | `npx tsc --noEmit --incremental false` passed |
| Production build | Independently reviewed candidate: `npm run build` passed after the permitted network retry fetched the unchanged Google Fonts; 47/47 static pages generated. Final freeze-preparation build rerun was attempted twice and could not fetch unchanged Google Fonts (Geist, Geist Mono, and Newsreader). The independently reviewed production candidate had already completed a successful 47-page production build, and no production source changed afterward. No font/config/package/source workaround was attempted. |
| `git diff --check` | Passed; only repository line-ending conversion notices were emitted |

## Browser and history results

- 1440 Expanded Queue: complete production five-section Overview rendered.
- Manual Compact Queue: Overview identity and content were unchanged.
- Recommendation and Human Decision: visibly separate sibling sections.
- Blocking case: verification standing and Requirements-oriented next step visible.
- Fully-ready case: explicit read-only repository fixture used because the real browser-local R6 store had no fully-ready Review. This is disclosed as fixture-backed and is not described as an R6F production-route frame.
- Unknown Review: requested stale route remained intact, Queue remained usable, no mode strip was rendered, and there was no silent replacement.
- Five modes: five separately captured native 1440px browser frames are combined into one labelled composite; the composite explicitly identifies its source as separate frames. Later modes contain only honest unavailable content.
- 899 Narrow: Queue return appears before Workspace content, all five native mode links remain available, and measured document/body/client width was 899/899/899 with no horizontal overflow.
- Resolving: genuine reload transient contains one `h1`, exactly five labels and restrained skeletons, with no fabricated identity or mode strip.
- Legacy `/workspace`: remains operational outside the R6 shell.
- Same-mode activation: URL/history remained unchanged.
- Different-mode activation: canonical URL changed by R6C Push semantics.
- Back/Forward: Evidence → Back to Overview → Forward to Evidence restored URL and current-link state.
- Modified and middle activation: the handler left both events to the browser and the source tab remained unchanged. The in-app browser's auxiliary-tab observation was inconsistent, so no claim is made about a reliably enumerated extra tab.
- Fresh selected-Review audit: one `main`, one main `h1`, two inherited live regions, zero R6F-added live regions, zero horizontal overflow, and zero console entries. The inherited regions are the shell live region and R6E Review Collection feedback live region; R6F removed the duplicate migration-host live region.

`store-unavailable` was independently exercised live during the Opus acceptance review. The reviewer verified its distinct truthful heading, safe snapshot reason, no fabricated Review identity, no mode strip, and no silent replacement. No retained native screenshot was produced. The later freeze-preparation browser prohibited reproducing the storage-denial condition; no workaround or source modification was attempted. The branch remains covered by the pure selected-Review projection, source inspection, deterministic validation, and independent live verification. This is an accepted non-blocking evidence limitation.

The longer development session intermittently emitted `Maximum update depth exceeded` at the unchanged, protected `WorkstationProvider.tsx:308` while several earlier browser tabs remained open. The fresh isolated selected-Review audit above did not reproduce it and no R6F file appeared in the stack. This inherited development-session observation is retained as a non-blocking follow-up rather than hidden or assigned to R6F.

## Screenshot manifest

| File | Truth represented |
| --- | --- |
| `R6F-1440-overview.png` | Production selected Review, Expanded Queue, complete five-section Overview |
| `R6F-1440-overview-compact-queue.png` | Production selected Review with manual Compact Queue |
| `R6F-1440-verdict-distinction.png` | Separate recommendation and Human Decision sections |
| `R6F-1440-blocking.png` | Blocking/not-ready standing and next-step orientation |
| `R6F-1440-ready.png` | Explicit read-only fixture-backed fully-ready source state on legacy `/workspace?source=fixture`; not an R6F production-route frame |
| `R6F-1440-review-unavailable.png` | Preserved stale Review route with usable Queue and no mode strip |
| `R6F-1440-mode-navigation-composite.png` | Labelled composite of five separate native mode frames |
| `R6F-899-narrow-overview.png` | Narrow Workspace-only selected Review with Queue return and no overflow |
| `R6F-1440-resolving.png` | Genuine resolving transient with five labels and no fabricated identity |
| `R6F-1440-workspace-regression.png` | Legacy `/workspace` regression proof |
| `R6F-1440-recorded-human-decision.png` | Native R6F Overview at 1440px, backed by a controlled browser-local test decision recorded through the existing Human Decision UI; separate recommendation and recorded decision, restrained actor/time/applicability, and no rationale, fingerprint, or mutation control |

## Scope and protected-path audit

Only the expected three existing production files are modified. New implementation is confined to `lib/r6f` and the new R6F workstation files. Freeze-preparation changes after independent acceptance are confined to this evidence directory and the final R6F evidence record in `docs/r6`.

Protected files and trees have no diff, including `lib/r6c/**`, `lib/r6d/**`, `lib/workspace-v2/**`, the listed R6E collection modules, `WorkstationProvider`, shell/Queue/focus files, `workstation-shell.module.css`, legacy workspaces, public surfaces, package/config/font files, and canonical domain libraries.

## Final independent acceptance

**ACCEPT R6F WITH NON-BLOCKING FOLLOW-UPS**

**READY TO FREEZE R6F**

Nothing is staged, committed, pushed, or merged by R6F implementation work.
