# LVOS Case File convergence

**Status:** Approved and complete  
**LVOS baseline:** v1.0  
**Scope:** LVOS-5B responsive convergence for `/report`

## Approved composition

The approved page remains **Archetype C — Verification dossier + verdict rail**. At wide desktop widths the quiet section outline, primary verification document and connected verdict rail remain the approved LVOS-5A composition. This pass does not redesign that composition, report semantics, report generation or the shared shell.

| Width | Dossier transformation | Verdict and decision access |
| --- | --- | --- |
| >=1180px | 150px outline, dominant 680–760px document and 300px verdict rail remain in one grid. | Persistent rail remains the sole level-one bordered plane. |
| 900–1179px | Shell icon rail/context drawer continue under the LVOS-2 contract. The outline becomes the labelled section selector and the document receives the available grid width. | A pinned compact summary gives recommendation, risk, open clauses/missing proof and one `Review decision` action. The rail becomes one right sheet. |
| <900px | The mobile shell retains its 52px command bar; dossier uses viewport width with the selector near the beginning. | Compact summary remains reachable; the same decision sheet is viewport-contained. |
| <=600px | The five-stage trace becomes glyph-led while retaining written stage names and a distinct decision diamond. Ledger records deliberately stack identifiers, states and titles; technical values wrap. | The summary and sheet remain usable without a horizontal technical canvas. |

The compact reading order is: PR/report context, trace, section selector, verification document, then continuously reachable compact verdict access. The full verdict ledger and Human Decision remain after evidence in the document’s semantic reading order and are reachable in the sheet.

## Overlay and accessibility behaviour

The compact `Review decision` control opens the existing verdict rail as the only report dialog. It has a named title and description, an explicit 44px `Close` control, Escape close, a focus trap, focus return to the opening control, and document/body scroll locking. Report-sheet background regions are inert and hidden from assistive technology while it is open. Opening shared shell navigation closes the report sheet without returning focus into a covered report control. The existing backdrop close convention remains; no inspector or other sheet can stack over the verdict sheet.

The selector is labelled, trace stages retain written labels rather than colour-only meaning, disclosures retain their names/expanded state, semantic status text remains written, and the compact implementation uses no new dependency or expressive motion.

## Report-state matrix

| State | Evidence | Result |
| --- | --- | --- |
| TESTS_REQUIRED, medium risk, multiple findings, several missing-proof records, open and satisfied clauses, no Human Decision | Direct browser check: `/report?demo=1` | Rendered at the required 620px and 390px widths in dark and light. Light-theme parity passed. |
| APPROVE, REVIEW_REQUIRED, TESTS_REQUIRED; low, medium and high risk; zero/multiple findings; no/several missing proof; empty/open/satisfied clauses | Source inspection: `lib/report-generator.ts`, `lib/report-normalizer.ts`, `lib/mock-report.ts` and report condition/contract render paths | Supported by the current generator/normalizer and retained unchanged by this pass. No fabricated fixture was added. |
| Accepted-risk/override, stale applicability, and withdrawn/recorded Human Decision states | Source inspection: `app/report/page.tsx`, `lib/human-decision-ledger.ts`, `lib/contract-recheck.ts`, `lib/verification-pack.ts`, `lib/sample-pr-input.ts` | Current ledger and recheck paths retain the states; `payment-refund` documents stale decision/accepted-risk sample behaviour. |
| Demo, historical and current/generated report sources | Direct: demo/historical fallback metadata. Source inspection: `/report` storage loading and `/new` generated-report write path | Demo is directly exercised. Generated/current content remains session-storage backed, with no test data fabricated into the browser. |

## Typography and content handling

`/report` retains the LVOS-1 role contract: application text uses the approved floor and weights, human-readable copy remains sans, mono is limited to technical values, and long identifiers are allowed to wrap rather than shrink. The compact trace, metadata, report title, ledger rows, clause criteria and compact verdict summary all use safe wrapping and `min-width: 0`/overflow rules. Pinned controls reserve document bottom padding so the final record is not obscured. First-open-clause-only expansion is an accepted density interpretation: every clause remains accessible through the existing expansion control.

## Selector outcome

Removed after repository search confirmed no live markup consumer:

- `.report-tabs`, `.report-tab`, `.report-tab--active`, `.report-tab-panel` and the unused `report-tab-in` keyframe.

Deferred to LVOS-7:

- `.score-card`, `.summary-card`, `.finding-detail-panel` and `.report-decision-panel` legacy selector families. They have no current Case File consumer, but their wider historical compatibility ownership needs a dedicated cascade review rather than broad deletion in LVOS-5.

## Functionality preserved

Report schemas, normalisation, recommendation/risk/readiness calculation, generation, storage keys, local review and Human Decision persistence, applicability/staleness/recheck logic, Markdown and Verification Pack generation, copy/download actions, route URLs, section ownership, API routes and shell navigation are unchanged.

## Validation record

| Check | Result |
| --- | --- |
| `git diff --check` | Passed. |
| `npx tsc --noEmit --incremental false` | Passed. |
| `npm run build` | Passed after allowing the existing layout’s Google Font fetches; the sandbox-only attempt failed on those external font requests. |
| In-app browser layout matrix | 620px and 390px passed in dark and light. At 620px, every trace stage name and state label remains visible; at 390px, the existing glyph-led stacked trace remains intact. No page-level horizontal overflow was detected and the pinned decision bar remained usable. |
| Decision sheet and accessibility | Passed: the compact decision control opened the named dialog with its description and visible Close control; Escape closed it and returned focus to `Review decision`. |
| Console | No console warnings or errors were introduced during browser review. |

Direct browser checks confirmed the section selector and compact verdict summary at the required compact widths, the repaired written trace labels at 620px, the stacked glyph-led trace at 390px, title wrapping at 390px, light-theme parity, and no page-level horizontal overflow. The real compact action opened the decision sheet; its named dialog relationships, Close control, Escape close and focus return were verified.

## Closure

- The 601–640px trace boundary defect is corrected: trace stage names and state labels remain written and visible at 620px.
- Light-theme parity, decision-sheet interaction and accessibility, and responsive verification at 620px and 390px all passed.
- LVOS-5 is approved and complete. AU-07 is closed.
