# Lintel evaluation results

Lintel is manually evaluated against built-in and public pull request scenarios covering approval restraint, risky backend changes, frontend/API changes, local workspace behavior and raw-diff privacy.

These results describe the current prototype evaluation set, not a guarantee for every pull request.

## Current sample coverage

| Scenario | Expected broad outcome | What it checks |
| --- | --- | --- |
| Clean utility change | APPROVE / LOW / CLEAR | Lintel stays quiet for a small tested change. |
| Provider failure / retry risk | TESTS_REQUIRED / HIGH / ATTENTION | Duplicate side effects, provider failures, API contract, logging/privacy and missing tests. |
| Auth/session change | TESTS_REQUIRED or REVIEW_REQUIRED | Token/session behavior and security review. |
| Database migration | TESTS_REQUIRED or REVIEW_REQUIRED | Migration compatibility, data safety and rollback/recovery concerns. |
| Payment/refund side effect | TESTS_REQUIRED | Repeat-safe payment/refund side effects and idempotency expectations. |
| API contract change | REVIEW_REQUIRED | Tests exist, but client-facing response semantics still need focused review. |
| Logging/privacy risk | REVIEW_REQUIRED | Structured logging near identifiers and token context. |
| Frontend analytics/type change | TESTS_REQUIRED | Frontend/docs/API-consumer review without payment false positives. |

## Key regressions

- Clean APPROVE reports should have no findings, missing tests, suggested tests, merge conditions or generic checklist work.
- Provider retry risk should escalate to TESTS_REQUIRED / HIGH with specific Conditions before merge.
- Frontend analytics/type changes must not show unsupported Payments/domain logic.
- Report quality should pass for supported generated reports.
- Raw diff markers should not appear in generated reports, copied conditions, copied summaries, downloaded Markdown or local history.

## Current limitations

- Evaluation is still manual.
- Scenario count is still small.
- Private repository web import is not supported.
- GitHub App and CI integration are not implemented.
- Line-level diff hunk evidence is not shown.
- Model-assisted quality depends on the configured provider when enabled.

Lintel remains a decision-support tool used alongside human review, CI, security review and tests.
