# R4D — Core Workspace Production Upgrade

> **Status:** Production correction implemented and production-build validated; refreshed rendered review is pending  
> **Canonical route:** `/workspace`  
> **Accepted visual authority:** `/visual-lab/workspace-r4`  
> **Data default:** Real validated browser-local Report history; explicit fixture only when requested

## Production architecture

`app/workspace/page.tsx` owns the canonical source boundary. It resolves the pre-existing Workspace source contract with `real` as the default. Real requests render `RealWorkspaceR4Bootstrap`, while the existing fixture adapter is reachable only through explicit `?source=fixture` QA selection.

`RealWorkspaceR4Bootstrap` is the only browser-storage bootstrap owned by R4D. It creates the existing real Workspace adapter, `WorkspacePersistence`, and `WorkspaceDecisionService`; mutations are followed by an authoritative adapter re-read. The stateful `WorkspaceR4Client` owns selected review, mode, selected object, Queue/Inspector/focus state, responsive step, announcements, condition mutation feedback, and the Human Decision dialog. It introduces no storage key and no parallel decision store.

The production-owned surface is:

- `app/workspace/WorkspaceR4Client.tsx`
- `app/workspace/RealWorkspaceR4Bootstrap.tsx`
- `app/workspace/HumanDecisionDialog.tsx`
- `app/workspace/icons.tsx`
- `app/workspace/workspace-r4.module.css`

The canonical adapter remains under `lib/workspace-v2/`. R4D extends its read projection with stored canonical-run identity and comparison output from the existing Readiness Delta and Review Diff helpers. No durable history schema is added.

## Visual transfer boundary

The production route transfers the accepted R4C light workstation anatomy: 52px Rail, 264px Queue, dominant flexible Workspace, and 352px Inspector at wide width. It retains compact Geist typography, strict technical rows, low-contrast borders, restrained semantic colour, independent scroll ownership, the five Workspace modes, and the single persistent readiness/decision bar.

The focused production-correction pass aligns observable R4D styling with that accepted authority. The Rail is neutral charcoal (`#171717`), primary decision actions are neutral near-black, selected rows and outcomes use neutral grey surfaces with a dark edge, and visible keyboard focus uses blue. Green is restricted to truthful approval, cleared, ready, persisted-success, or healthy-connected states; tests/proof warnings remain amber, review attention is orange, blocking/failure is red, provenance is neutral grey, and meaningful model provenance may use violet.

Recommendation, selected-object, loading, unavailable, and Human Decision headings now use compact application-scale type rather than editorial display sizing. Section spacing follows the accepted dense 4px rhythm, while the flexible centre retains visual priority over the Queue and Inspector. The explicit fixture action and modal use `Preview decision flow`, disclose `Read-only sample`, and keep the non-recording footer control neutral and disabled.

Laboratory fixtures, capture chrome, state controls, query presets, lab-local event language, and command-palette behaviour were not transferred. Production copies no R4C component or fixture dependency.

The existing AppShell already excludes `/workspace`, so no shared shell, navigation, global CSS, or route-boundary file changed. The R4 shell is locally scoped by the Workspace CSS module.

## Light theme and future substitution boundary

The accepted R4 production default remains light. Workspace-local custom properties now separate application, primary, secondary, selected and hover surfaces; primary, important, secondary and tertiary text; strong and subtle borders; neutral chrome; primary action; focus; and semantic status roles. These responsibilities are scoped to the R4 Workspace root and do not modify global CSS.

Dark mode is not implemented or accepted in R4D. No theme toggle, media-query switching, second rendered theme, theme persistence, or global theme infrastructure was added. A later milestone may substitute the local surface, text, border and selection values, but it must preserve semantic colour and accessibility rather than mechanically invert the light palette.

## Data, provenance, and history truth

- Real `/workspace` reads validated `lintel.reportHistory.v1` entries through the existing real adapter and never falls back to fixture content.
- Unknown requested records remain unavailable; an empty browser remains truthfully empty.
- The existing maximum of ten local Reports and raw-diff rejection remain owned by `lib/report-history.ts`.
- Run/head/base, source type, analysis source, reproducibility, version, and fingerprint values come from stored canonical run manifests. Missing manifests or heads produce explicit initial/unavailable comparison states.
- The nearest older entry for the same repository and PR is compared unless an exact stored `previousRunId` identifies the predecessor.
- Readiness Delta owns movement; Review Diff owns changed-record inspection. The R4 presentation does not persist either projection.
- Missing/unverified proof is explicitly labelled as a presentation derived from canonical evidence status. No missing-proof object is invented.
- No owner or actor is shown when none is stored.

## Persistence and Human Decision boundary

Exact canonical Conditions before merge continue to use the existing `WorkspacePersistence` clear/reopen mutation. Derived requirements and explicit fixture records remain read-only, and the UI explains that task progress is neither proof nor acknowledgement, waiver, requirement resolution, or accepted risk.

Human Decision uses the existing append-only `HumanDecisionLedger` through `WorkspaceDecisionService`. The production client submits record, supersede, reaffirm, and withdraw commands with the current case/head/effective-entry guards, then relies on the service's idempotency, duplicate prevention, stale-command refusal, append, read-back verification, and failure outcomes. All seven outcomes remain available with no recommendation-derived default, required rationale, canonical references, accepted-risk references, and outcome-specific acknowledgements.

The bottom readiness bar is the only persistent primary Human Decision entry. The Inspector provides readiness and handoff context but no competing decision button. Explicit fixture coverage opens a clearly labelled, non-writing `Preview decision flow`; the dialog identifies a `Read-only sample` and keeps its recording control disabled.

## Capability truth

- GitHub App status is read from the existing environment-gated status endpoint and shown as Connected, Available, or Unavailable.
- GitHub Action remains Blueprint only.
- Slack remains Export-only.
- Human Decision is not presented as published through the automated GitHub analysis comment.

## Responsive and accessibility behaviour

- **Wide (≥1440):** Rail, Queue, Workspace, and Inspector.
- **Normal (1280–1439):** Rail, Queue, and Workspace; Inspector is on demand when width requires it.
- **Narrow (960–1279):** one Queue trigger opens a readable drawer; Inspector is on demand; Workspace owns the width.
- **Tablet (640–959):** selected Workspace with list and contextual-detail transitions.
- **Mobile (<640):** review list → selected review → selected record or Human Decision; no compressed four-panel DOM.

The implementation includes semantic landmarks, headings, native controls, accessible icon names, full values for truncated identifiers, skip links, polite/assertive live regions, visible focus styles, selection distinct from focus, modal focus containment, Escape handling, focus restoration, dirty-draft protection, contained short-height/mobile dialog scrolling, sticky-action clearance, and `prefers-reduced-motion` suppression.

## Validation

- The optimized production build passed on 2026-07-28 with TypeScript and all 23 routes generated or registered. The restricted validation environment used the repository's existing offline Google Fonts response fixture and a temporary worker-thread setting; that setting was removed immediately and is absent from the worktree.
- Initial R4D browser validation used the built production server and the real `/workspace` route. During this focused correction pass, the in-app browser's URL policy blocked the required production-route reload and prohibited an alternate browser workaround. No refreshed screenshot is represented as completed evidence.
- The empty real default was verified without fixture fallback.
- Explicit read-only fixture coverage exercised all five modes, finding/evidence and requirement inspection, readiness, Queue/Inspector collapse, focus mode, loading/unavailable authority boundaries, Human Decision validation states, narrow drawer, tablet/mobile transitions, short height, and an effective 200% CSS viewport.
- Keyboard Escape, pristine focus restoration, and dirty-draft alertdialog were exercised. The production route reported no browser console errors.
- `/workspace-v2`, `/workspace-legacy`, and `/visual-lab/workspace-r4` were loaded after the transfer and remain available.
- No targeted production-logic test script exists in `package.json`; the production build supplied the repository's available TypeScript and route validation.

## Known limitations

- The existing 22 R4D screenshots predate this visual correction. Because the browser URL-policy block prevented safe recapture, the package now labels them as historical pre-correction evidence; refreshed visual acceptance remains required.
- The capture browser contained no real local Reports, so screenshot coverage uses the pre-existing explicit fixture source. The real default empty state was validated separately.
- The fixture comparison screenshot proves the History presentation and labels its sample provenance; real comparisons depend on two compatible stored canonical runs.
- The browser controller could not change Chrome page zoom. Screenshot 22 uses the equivalent 800×500 CSS viewport for a 1600×1000 surface; a human real-browser 200% zoom check remains recommended.
- Reduced-motion CSS was verified in the loaded production stylesheet, but the controller did not expose a media-preference emulator.
- Deep relationship traversal, focused raw-diff interaction, comprehensive keyboard shortcuts, and command palette remain R4E work.

## Preserved routes and deferred ownership

`/workspace-v2`, `/workspace-legacy`, and the accepted R4C laboratory remain intact. No supporting route, landing page, shared AppShell, dependency, package file, or production storage key changed. R4E owns deeper investigation and sustained review interaction; R4F owns app-wide visual propagation and any future primary Integrations route.
