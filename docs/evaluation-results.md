# Lintel evaluation results

**Evaluation date:** `YYYY-MM-DD`  
**Evaluator:** `Name or initials`  
**Commit/version:** `Commit hash or release`  
**Environment:** `Browser, operating system, model configuration if applicable`

This document records observed results for the workflow defined in [evaluation.md](evaluation.md). Do not mark a case as passed until it has been generated and inspected through the current application flow.

## Deterministic fallback pass

**Status:** `PENDING`  
**Configuration:** `OPENAI_API_KEY and OPENAI_MODEL unset; Review profile: Standard`  
**Source expected:** `Local fallback`

| Sample | Expected recommendation | Observed recommendation | Expected risk | Observed risk | Operational readiness | Reviewer focus | Report quality | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Clean utility change | `APPROVE` | `Not recorded` | `LOW` | `Not recorded` | Expected `CLEAR`; observed `Not recorded` | Expected none; observed `Not recorded` | Expected `PASS`; observed `Not recorded` | `PENDING` | Confirm no findings, suggested tests or merge conditions. |
| Provider failure / retry risk | `TESTS_REQUIRED` | `Not recorded` | `HIGH` | `Not recorded` | Expected `ATTENTION`; observed `Not recorded` | Backend reliability, API contract, Security/privacy, Payments/domain logic, Platform/observability | Expected `PASS`; observed `Not recorded` | `PENDING` | Confirm specific provider, retry, API, logging and test-gap evidence. |
| Auth/session change | `TESTS_REQUIRED` | `Not recorded` | `MEDIUM` | `Not recorded` | Expected `ATTENTION`; observed `Not recorded` | Backend reliability, Security/privacy, Platform/observability | Expected `PASS`; observed `Not recorded` | `PENDING` | Payments/domain logic must not appear without payment evidence. |
| Database migration | `TESTS_REQUIRED` | `Not recorded` | `MEDIUM` | `Not recorded` | Expected `ATTENTION`; observed `Not recorded` | Backend reliability, Data/migration, Platform/observability | Expected `PASS`; observed `Not recorded` | `PENDING` | Confirm migration compatibility, rollback and recovery themes. |
| Payment/refund side effect | `TESTS_REQUIRED` | `Not recorded` | `MEDIUM` | `Not recorded` | Expected `ATTENTION`; observed `Not recorded` | Backend reliability, Payments/domain logic, Platform/observability | Expected `PASS`; observed `Not recorded` | `PENDING` | Confirm payment/refund repeat-safety and recovery evidence. |
| API contract change | `REVIEW_REQUIRED` | `Not recorded` | `LOW` | `Not recorded` | Expected `ATTENTION`; observed `Not recorded` | API contract, Platform/observability | Expected `PASS`; observed `Not recorded` | `PENDING` | Confirm stable status, response and retry semantics. |
| Logging/privacy risk | `REVIEW_REQUIRED` | `Not recorded` | `MEDIUM` | `Not recorded` | Expected `ATTENTION`; observed `Not recorded` | Security/privacy, Platform/observability | Expected `PASS`; observed `Not recorded` | `PENDING` | Confirm sensitive fields and identifiers are handled precisely. |
| Frontend analytics/type change | `TESTS_REQUIRED` | `Not recorded` | `MEDIUM` | `Not recorded` | Expected `CLEAR`; observed `Not recorded` | Backend reliability, Frontend integration, Docs/API consumer review | Expected `PASS`; observed `Not recorded` | `PENDING` | **Payments/domain logic must not appear.** |

### Deterministic pass summary

- Passed: `0 / 8`
- Failed: `0 / 8`
- Pending: `8 / 8`
- Blocking regressions: `None recorded`
- Raw-diff privacy check: `Not recorded`
- Copy and download parity: `Not recorded`
- Local-history parity: `Not recorded`

## Optional AI comparison pass

**Status:** `NOT RUN`  
**Model:** `OPENAI_MODEL value without credentials`  
**Source expected:** `AI generated`

Repeat the same eight cases after the deterministic pass succeeds. Record recommendation, risk, operational status, reviewer focus, report quality and false-positive differences. AI wording and scores may vary, but deterministic findings, recommendation constraints, profile evidence gates, protected risk floors and privacy rules must remain intact.

| Sample | AI result | Material difference from deterministic | Guardrails preserved | Notes |
| --- | --- | --- | --- | --- |
| Clean utility change | `Not recorded` | `Not recorded` | `PENDING` | |
| Provider failure / retry risk | `Not recorded` | `Not recorded` | `PENDING` | |
| Auth/session change | `Not recorded` | `Not recorded` | `PENDING` | |
| Database migration | `Not recorded` | `Not recorded` | `PENDING` | |
| Payment/refund side effect | `Not recorded` | `Not recorded` | `PENDING` | |
| API contract change | `Not recorded` | `Not recorded` | `PENDING` | |
| Logging/privacy risk | `Not recorded` | `Not recorded` | `PENDING` | |
| Frontend analytics/type change | `Not recorded` | `Not recorded` | `PENDING` | Payments/domain logic remains forbidden without evidence. |

## Dedicated regression notes

### Frontend analytics/type change

- Must not show **Payments/domain logic** on the page, in copied Markdown, or in downloaded Markdown.
- Generic terms such as event, side effect, behavior, domain or execution order are not payment evidence.
- Expected focus: Backend reliability, Frontend integration and Docs/API consumer review.

### Clean utility change

- Must remain `APPROVE` / `LOW` / operational `CLEAR` under the Standard profile.
- Must have no findings, missing tests, suggested tests or merge conditions.
- Report quality must be `PASS`.

### Provider failure / retry risk

- Must remain `TESTS_REQUIRED` / `HIGH` / operational `ATTENTION` under the Standard profile.
- Findings must remain specific to retry/duplicate side effects, provider failures, API contracts, sensitive logging and missing tests.
- Report quality must be `PASS`.

## Known limitations

- This is a manual regression record; results are not generated automatically.
- Built-in samples cover targeted risk themes but not repository-wide context or real CI execution.
- AI output is variable and requires a separate comparison pass.
- The evaluation does not prove complete security, reliability or false-negative coverage.
- Public GitHub behavior can vary because of upstream availability and unauthenticated rate limits.

## Future evaluation improvements

1. Add a dependency-free executable deterministic fixture runner when the TypeScript runtime strategy is settled.
2. Store machine-readable expected outcomes beside sample definitions without duplicating generator logic.
3. Track false positives, false negatives, recommendation agreement and score drift across releases.
4. Add anonymized real-world PR fixtures with reviewer feedback.
5. Add automated checks for copy/download parity, raw-diff absence and history round trips.
6. Compare AI models and prompt versions against the same deterministic baseline.
