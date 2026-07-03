# Lintel sample evaluation

This workflow checks Lintel’s built-in samples against stable, broad merge-readiness expectations. It intentionally exercises the real `/new` → `/api/generate-report` → `/report` flow instead of duplicating TypeScript generator rules in a separate script.

## Evaluation mode

Run the primary regression pass with deterministic fallback so results are repeatable:

1. Leave `OPENAI_API_KEY` and `OPENAI_MODEL` unset or empty.
2. Restart the development server with `npm run dev` after environment changes.
3. Open `http://localhost:3000/new`.
4. For each case below, select the sample, choose **Generate Report**, and record the result.
5. Confirm the source badge is **Local fallback** and input source is **Sample**.

An optional second pass may enable AI. AI wording and scores can vary, but normalization must preserve the expected recommendation constraints, important focus areas, report quality, and false-positive exclusions.

## Pass criteria

A case passes when:

- recommendation, risk level, and operational status match the expected deterministic outcome;
- every listed reviewer-focus area is present;
- no forbidden false-positive area appears;
- report quality is `PASS`;
- the report, copied Markdown, downloaded Markdown, session storage, and local history contain no raw diff.

## Expected deterministic outcomes

| Sample | Recommendation | Risk | Operational | Important reviewer focus | Must not appear | Quality |
| --- | --- | --- | --- | --- | --- | --- |
| Clean utility change | `APPROVE` | `LOW` | `CLEAR` | None required | Any unsupported specialist area | `PASS` |
| Provider failure / retry risk | `TESTS_REQUIRED` | `HIGH` | `ATTENTION` | Backend reliability; API contract; Security/privacy; Payments/domain logic; Platform/observability | Data/migration; Frontend integration | `PASS` |
| Auth/session change | `TESTS_REQUIRED` | `MEDIUM` | `ATTENTION` | Backend reliability; Security/privacy; Platform/observability | Payments/domain logic; Data/migration; API contract | `PASS` |
| Database migration | `TESTS_REQUIRED` | `MEDIUM` | `ATTENTION` | Backend reliability; Data/migration; Platform/observability | Payments/domain logic; Security/privacy; API contract | `PASS` |
| Payment/refund side effect | `TESTS_REQUIRED` | `MEDIUM` | `ATTENTION` | Backend reliability; Payments/domain logic; Platform/observability | Security/privacy; Data/migration; API contract | `PASS` |
| API contract change | `REVIEW_REQUIRED` | `LOW` | `ATTENTION` | API contract; Platform/observability | Payments/domain logic; Security/privacy; Data/migration | `PASS` |
| Logging/privacy risk | `REVIEW_REQUIRED` | `MEDIUM` | `ATTENTION` | Security/privacy; Platform/observability | Payments/domain logic; Data/migration; API contract | `PASS` |
| Frontend analytics/type change | `TESTS_REQUIRED` | `MEDIUM` | `CLEAR` | Backend reliability; Frontend integration; Docs/API consumer review | **Payments/domain logic**; Security/privacy; Data/migration | `PASS` |

Risk levels follow the current thresholds: `LOW` 0–30, `MEDIUM` 31–60, `HIGH` 61–80, and `CRITICAL` 81–100.

## Case checklist

For every sample, record:

```text
Sample:
Date:
Source:
Recommendation: expected / actual
Risk level: expected / actual
Operational readiness: expected / actual
Reviewer focus: expected / actual
Forbidden focus present: yes / no
Report quality: expected / actual
Copy/download raw-diff check: pass / fail
Overall: pass / fail
Notes:
```

Also confirm:

- recommendation heading matches the recommendation;
- `APPROVE` has no findings, missing tests, suggested tests, or merge conditions;
- `TESTS_REQUIRED` has concrete missing or suggested tests;
- operational `ATTENTION` never produces `APPROVE`;
- reviewer-focus reasons are evidence-based and assign no person or team;
- opening the report from local history preserves the same source and result;
- Copy summary and Download Markdown omit unsupported reviewer-focus items.

## Critical frontend regression

For **Frontend analytics/type change**:

1. Generate the built-in sample.
2. Confirm **Backend reliability**, **Frontend integration**, and **Docs/API consumer review**.
3. Confirm **Payments/domain logic** is absent from the page.
4. Copy and download the Markdown and confirm it remains absent.
5. Confirm report quality is `PASS`, not a warning masking an unpruned focus item.

This regression fails if generic terms such as event, side effect, behavior, domain, or execution order are treated as payment evidence.

## Optional AI comparison

After the deterministic suite passes:

1. Configure evaluator-owned `OPENAI_API_KEY` and `OPENAI_MODEL` values in ignored local environment configuration.
2. Restart the server.
3. Repeat the eight cases and confirm the source is **AI generated**.
4. Accept wording and score variation only when recommendation consistency, risk floors, operational attention, reviewer-focus evidence, and report quality remain valid.
5. Record any AI-only false positive separately from deterministic behavior.

Never include credentials, private code, or raw production diffs in evaluation notes.
