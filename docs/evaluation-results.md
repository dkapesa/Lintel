# Lintel evaluation results

Evaluation date: `<add date>`
Evaluation mode: Manual product regression pass
Application version: V3.8 demo scenario pack
Evaluator: `<add evaluator>`

## Summary

Lintel was evaluated as a merge-readiness decision layer.

Current positioning:

> Agents create code. Lintel decides what is ready to merge.

The V3 report leads with recommendation, risk band, executive summary and Conditions before merge. It also includes provenance labels, a consolidated Test plan, operational readiness, reviewer focus, compact report quality checks, Markdown export and local Risk inbox tracking.

| Metric | Result |
| --- | --- |
| Built-in samples covered | 8 |
| Primary deterministic pass | `<record pass/fail>` |
| Optional model-assisted comparison | `<record if run>` |
| Raw diff leakage observed | No expected leakage |
| GitHub import regression | Covered separately |
| Workspace Risk inbox regression | Covered separately |

## V3.8 scenario pack

| Sample | Expected recommendation | Expected risk | Operational readiness | Key themes |
| --- | --- | --- | --- | --- |
| Clean utility change | `APPROVE` | `LOW` | `CLEAR` | Small tested utility change; no invented work. |
| Provider failure / retry risk | `TESTS_REQUIRED` | `HIGH` | `ATTENTION` | Duplicate redemption risk, provider failures, API contract, logging/privacy, missing tests. |
| Auth/session change | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | `MEDIUM` | `ATTENTION` | Token/session handling, access boundary, security review. |
| Database migration | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | `MEDIUM` | `ATTENTION` | Migration compatibility, data safety, rollback/recovery expectations. |
| Payment/refund side effect | `TESTS_REQUIRED` | `MEDIUM` or `HIGH` | `ATTENTION` | Repeat-safe refund creation, idempotency, payment side effects. |
| API contract change | `REVIEW_REQUIRED` | `LOW` or `MEDIUM` | `ATTENTION` | Client-facing error semantics with tests present. |
| Logging/privacy risk | `REVIEW_REQUIRED` | `MEDIUM` | `ATTENTION` | Structured logging near identifiers and token context. |
| Frontend analytics/type change | `TESTS_REQUIRED` | `MEDIUM` | `CLEAR` | Frontend/docs/API-consumer routing; no payment false positive. |

## Scenario result table

Use this table during the manual pass.

| Sample | Expected recommendation | Observed recommendation | Expected risk | Observed risk | Operational readiness | Reviewer focus | Report quality | Pass/fail | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Clean utility change | `APPROVE` | `<record>` | `LOW` | `<record>` | `CLEAR` | None required | `PASS` | `<record>` | Should have no findings, missing tests, suggested tests or merge conditions. |
| Provider failure / retry risk | `TESTS_REQUIRED` | `<record>` | `HIGH` | `<record>` | `ATTENTION` | Backend reliability; API contract; Security/privacy; Payments/domain logic; Platform/observability | `PASS` | `<record>` | Strongest risky demo. |
| Auth/session change | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | `<record>` | `MEDIUM` | `<record>` | `ATTENTION` | Security/privacy; Backend reliability; Platform/observability | `PASS` | `<record>` | Should not add Payments/domain logic. |
| Database migration | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | `<record>` | `MEDIUM` | `<record>` | `ATTENTION` | Data/migration; Backend reliability; Platform/observability | `PASS` | `<record>` | Should highlight migration/recovery concerns. |
| Payment/refund side effect | `TESTS_REQUIRED` | `<record>` | `MEDIUM` or `HIGH` | `<record>` | `ATTENTION` | Payments/domain logic; Backend reliability; Platform/observability | `PASS` | `<record>` | Should focus on idempotency/retry side effects. |
| API contract change | `REVIEW_REQUIRED` | `<record>` | `LOW` or `MEDIUM` | `<record>` | `ATTENTION` | API contract; Platform/observability | `PASS` | `<record>` | Tests exist, so should not become generic missing-test output. |
| Logging/privacy risk | `REVIEW_REQUIRED` | `<record>` | `MEDIUM` | `<record>` | `ATTENTION` | Security/privacy; Platform/observability | `PASS` | `<record>` | Should mention identifiers/token context precisely. |
| Frontend analytics/type change | `TESTS_REQUIRED` | `<record>` | `MEDIUM` | `<record>` | `CLEAR` | Backend reliability; Frontend integration; Docs/API consumer review | `PASS` | `<record>` | Must not show Payments/domain logic. |

## Key regression notes

### Clean APPROVE restraint

Clean utility changes should remain calm:

- `APPROVE`
- `LOW`
- operational `CLEAR`
- no findings
- no missing tests
- no suggested tests
- no merge conditions
- no generic reviewer checklist

This confirms Lintel is not a tool that invents something to say about every PR.

### Provider retry escalation

Provider failure / retry risk should remain the strongest demo:

- `TESTS_REQUIRED`
- `HIGH`
- operational `ATTENTION`
- specific Conditions before merge
- risk-specific missing tests
- duplicate redemption or discount-code risk
- provider failure handling
- API contract stability
- logging/privacy review
- reviewer focus across backend reliability, API contract, security/privacy, payments/domain logic and platform/observability

### Frontend payment false-positive regression

Frontend analytics/type change must not show **Payments/domain logic**.

Generic words such as event, side effect, behavior, domain, execution order or changed behavior must not count as payment evidence.

Expected focus areas:

- Backend reliability because missing test coverage still routes to reliability today.
- Frontend integration.
- Docs/API consumer review.

Known limitation: Backend reliability may still appear as `PRIMARY` because missing test coverage currently triggers reliability routing. Future refinement should make this more frontend/API-specific.

## Public GitHub import regression

Keep a separate manual import check for a supported public PR, such as `vercel/next.js` PR 63226 if still public and suitable.

Expected broad result:

- import works;
- stack inference detects `TypeScript / Next.js`;
- report generation succeeds;
- no Payments/domain logic false positive;
- report quality is `PASS`;
- raw diff is not stored in local history.

## Workspace Risk inbox regression

Validate after generating at least three sample reports:

- duplicate local report runs group into one PR row;
- triage strip counts grouped PRs;
- `TESTS_REQUIRED` and `REVIEW_REQUIRED` reports appear under **Needs attention**;
- `APPROVE` reports appear under **Ready / cleared**;
- local statuses persist in browser storage only;
- condition progress persists after refresh;
- row-level Copy conditions uses the same deduped condition formatter as `/report`;
- deleting a grouped row removes that PR group's local report runs;
- raw diffs are not stored in local history.

## Raw-diff privacy checks

Expected:

- raw diffs are not stored in `lintel.generatedReport.v1`;
- raw diffs are not stored in `lintel.reportHistory.v1`;
- raw diff markers such as `diff --git` and `@@` do not appear in report UI, copied conditions, copied summary, downloaded Markdown or workspace rows;
- changed filenames and concise evidence summaries may appear.

## Current limitations

- Evaluation is still manual.
- Scenario count is still small.
- Private repository web import is not supported.
- Hosted GitHub App integration is not implemented.
- CI integration is not implemented.
- Automatic PR comments are not implemented.
- Authentication, billing, database storage and team dashboards are not implemented.
- Line-level evidence and diff hunks are not shown.
- Frontend-specific reviewer routing still needs refinement.
- Model-assisted quality depends on the configured provider when enabled.

## Follow-up evaluation work

- Record deterministic-only and model-assisted passes separately.
- Add public GitHub PR coverage across backend, frontend, auth, data, infrastructure and documentation changes.
- Track false positives and false negatives over time.
- Add automated snapshot-style report checks once the schema and copy stabilize.
- Refine reviewer routing so missing frontend/API tests do not default to backend reliability language.

## Overall conclusion

Lintel is strongest when a team needs a concise merge-readiness artifact: recommendation, risk band, Conditions before merge, risk-specific tests, operational readiness, reviewer focus and report quality.

The product should still be presented as a public-pilot prototype. It does not replace human review, CI, security review or tests, and it does not yet integrate with private repositories or GitHub workflows.
