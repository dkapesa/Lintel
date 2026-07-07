# Lintel Evaluation Results

Evaluation date: `<add date>`
Evaluation mode: Manual product regression pass
Application version: V2 merge-readiness workspace
Evaluator: `<add evaluator>`

## Summary

Lintel was evaluated as a merge-readiness decision layer. The current validated wedge is:

> Lintel helps engineering teams decide whether a pull request is safe, tested, operationally ready and ready to merge.

The V2 report now leads with recommendation, risk band, executive summary and Conditions before merge. Conditions appear near the top, are deduped, and can be copied from both the report Decision Gate and the workspace Risk inbox. The report also includes provenance labels, consolidated Test plan output, operational readiness, reviewer focus, compact report quality checks and Markdown export aligned to the same hierarchy.

| Metric | Result |
| --- | --- |
| Scenarios evaluated | 4 |
| Passed | 4 |
| Failed | 0 |
| Report quality checks passed | 4 / 4 |
| Raw diff leakage observed | No |
| GitHub import tested | Yes |
| Manual pasted diff tested | Yes |
| Workspace Risk inbox tested | Yes |
| Review profiles tested | Standard, Frontend/API consumer |

## Current product state reflected in this pass

- Homepage positioning leads with **Decide what’s ready to merge.**
- Report hierarchy leads with recommendation, risk band, executive summary and **Conditions before merge**.
- Risk band is visually primary; score detail remains secondary.
- Conditions before merge are deduped and PR-ready.
- **Copy conditions** is available from the Decision Gate and workspace.
- Findings show provenance such as **Rule detected** or **Model assisted**.
- User-facing source labels are **Baseline only** and **Baseline + model-assisted**.
- Clean `APPROVE` reports stay quiet and do not invent generic review work.
- Missing coverage, suggested tests and reviewer checklist are consolidated into **Test plan**.
- Copied and downloaded Markdown follow the V2 report hierarchy.
- `/workspace` acts as a local Risk inbox with grouped PR rows, a triage strip, filters, local statuses and row-level Copy conditions.
- Raw diffs are not saved in local report history and raw diff markers should not appear in UI or exports.

## Scenario results

| ID | Scenario | Input source | Review profile | Expected | Observed | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Clean APPROVE sample | Sample | Standard | APPROVE / LOW / CLEAR | APPROVE / LOW / CLEAR | PASS |
| 2 | Provider retry / discount-code sample | Sample | Standard | TESTS_REQUIRED / HIGH / ATTENTION | TESTS_REQUIRED / HIGH / ATTENTION | PASS |
| 3 | Public GitHub PR import: vercel/next.js PR 63226 | GitHub PR import | Frontend/API consumer | TESTS_REQUIRED / MEDIUM, TypeScript / Next.js, no Payments/domain logic | TESTS_REQUIRED / MEDIUM, TypeScript / Next.js, no Payments/domain logic | PASS |
| 4 | Manual pasted diff clean sample | Pasted diff | Standard | APPROVE / LOW / CLEAR | APPROVE / LOW / CLEAR | PASS |

## Detailed results

### 1. Clean APPROVE sample

**PR:** Format display names consistently  
**Repository:** acme/profile-api  
**Input source:** Sample  
**Review profile:** Standard  
**Stack:** Python / FastAPI

Expected and observed:

- Recommendation: `APPROVE`
- Risk level: `LOW`
- Findings: none
- Missing tests: none
- Suggested tests: none
- Merge conditions: none
- Operational readiness: `CLEAR`
- Test plan: clean empty states
- Report quality: `PASS`

Result: PASS

Notes:

Lintel correctly kept the report quiet for a clean utility change with matching tests. It did not create generic suggested tests, reviewer checklist items, risk findings or merge conditions.

### 2. Provider retry / discount-code sample

**PR:** Add fallback handling for failed discount-code retrieval  
**Repository:** acme/redemption-api  
**Input source:** Sample  
**Review profile:** Standard  
**Stack:** Python / FastAPI

Expected and observed:

- Recommendation: `TESTS_REQUIRED`
- Risk level: `HIGH`
- Operational readiness: `ATTENTION`
- Conditions before merge: specific and deduped
- Missing tests: risk-specific
- Findings include:
  - duplicate redemption / discount-code risk
  - provider failure handling
  - API contract stability
  - logging/privacy review
- Reviewer focus includes:
  - Backend reliability
  - API contract
  - Security/privacy
  - Payments/domain logic
  - Platform/observability
- Provenance labels: `Rule detected` where deterministic rules apply
- Report quality: `PASS`

Expected specific conditions:

- Prove retries cannot create duplicate redemptions or issue duplicate discount codes
- Verify provider handling for 5xx response, timeout, and unavailable
- Confirm the frontend-safe API error contract remains stable
- Confirm identifier logging is intentional, hashed or redacted
- Confirm discount codes are not emitted in logs
- Document a safe recovery or rollback path for the identified operational risks

Result: PASS

Notes:

This remains the strongest risky-path demonstration. Lintel escalates the PR because the merge decision depends on idempotency, provider failure behavior, API contract stability, logging privacy and operational recovery.

### 3. Public GitHub PR import: vercel/next.js PR 63226

**Repository:** vercel/next.js  
**Input source:** GitHub PR import  
**Review profile:** Frontend/API consumer  
**Stack:** TypeScript / Next.js

Expected and observed:

- Import works
- Stack inference: `TypeScript / Next.js`
- Recommendation: `TESTS_REQUIRED`
- Risk level: `MEDIUM`
- Payments/domain logic false positive: absent
- Findings include missing tests and maintainability/scope concern
- Reviewer focus includes frontend, docs and API-consumer concerns
- Report quality: `PASS`

Result: PASS

Known limitation:

Backend reliability may still appear as `PRIMARY` because missing test coverage currently triggers reliability routing. Future refinement should make this more frontend/API-specific when the change is primarily frontend, docs or public API surface.

### 4. Manual pasted diff clean sample

**Repository:** acme/content-service  
**Input source:** Pasted diff  
**Review profile:** Standard  
**Stack:** Python / FastAPI

Expected and observed:

- Recommendation: `APPROVE`
- Risk level: `LOW`
- Operational readiness: `CLEAR`
- Findings: none
- Missing tests: none
- Suggested tests: none
- Merge conditions: none
- Report quality: `PASS`

Result: PASS

Notes:

The manual pasted-diff flow correctly produces the same restrained clean-report behavior as the built-in clean sample.

## V2 regression checklist

| Regression | Expected | Observed | Result |
| --- | --- | --- | --- |
| Clean APPROVE restraint | No findings, missing tests, suggested tests, generic checklist or merge conditions | Clean report stays quiet | PASS |
| Provider retry escalation | TESTS_REQUIRED / HIGH / ATTENTION | TESTS_REQUIRED / HIGH / ATTENTION | PASS |
| No payment false positive for frontend/API PR | Payments/domain logic absent | Payments/domain logic absent | PASS |
| Public GitHub import | Import succeeds for supported public PR URL | Import works | PASS |
| Manual pasted diff | Report generates from pasted diff | Report generates | PASS |
| Stack inference | TypeScript / Next.js inferred for Next.js PR | TypeScript / Next.js inferred | PASS |
| Report quality checks | PASS or explainable warnings | PASS across evaluated scenarios | PASS |
| Provenance labels | Rule detected / Model assisted shown where available | Labels shown | PASS |
| Copy conditions | Deduped conditions copied from report and workspace | Works | PASS |
| Markdown export alignment | Export follows V2 hierarchy | Aligned | PASS |
| Workspace/risk inbox grouping | Duplicate runs grouped by PR identity | Grouped rows shown | PASS |
| Raw diff privacy | No raw diff markers in UI, exports, session storage or local history | No leakage observed | PASS |

## Workspace Risk inbox observations

The workspace now behaves as a local merge-readiness inbox rather than a raw recent-runs log.

Validated behavior:

- duplicate local report runs group into one PR row;
- triage strip counts grouped PRs;
- `TESTS_REQUIRED` and `REVIEW_REQUIRED` reports appear under **Needs attention**;
- `APPROVE` reports appear under **Ready / cleared**;
- local statuses persist in browser storage only;
- row-level Copy conditions uses the same deduped condition formatter as `/report`;
- deleting a grouped row removes that PR group's local report runs;
- raw diffs are not stored in local history.

## Raw-diff privacy checks

Expected and observed:

- Raw diffs are not stored in `lintel.generatedReport.v1`.
- Raw diffs are not stored in `lintel.reportHistory.v1`.
- Raw diff markers such as `diff --git` and `@@` do not appear in report UI, copied conditions, copied summary, downloaded Markdown or workspace rows.
- Changed filenames and concise evidence summaries may appear. That is expected and is not raw-diff storage.

## Current limitations

- Evaluation is still manual.
- Scenario count is still small.
- Private repository import is not supported.
- GitHub App integration is not implemented.
- CI integration is not implemented.
- Automatic PR comments are not implemented.
- Authentication, billing, database storage and team dashboards are not implemented.
- Line-level evidence and diff hunks are not shown.
- Frontend-specific reviewer routing still needs refinement.
- Model-assisted quality depends on the configured provider when enabled.

## Follow-up evaluation work

- Record deterministic-only and model-assisted passes separately.
- Expand public GitHub PR coverage across backend, frontend, auth, data, infrastructure and documentation changes.
- Add repeated evaluation for all eight built-in samples.
- Track false positives and false negatives over time.
- Add automated snapshot-style report checks once the schema and copy stabilize.
- Refine reviewer routing so missing frontend/API tests do not default to backend reliability language.

## Overall conclusion

Lintel is strongest today when a team needs a concise merge-readiness artifact: recommendation, risk band, conditions before merge, risk-specific tests, operational readiness, reviewer focus and report quality.

The product should still be presented as a public-pilot prototype. It does not replace human review, CI, security review or tests, and it does not yet integrate with private repositories or GitHub workflows.
