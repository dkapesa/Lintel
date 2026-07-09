# Lintel demo script

## 60-second demo

1. Open `/new`: "Lintel helps reviewers decide whether a pull request is safe, tested, operationally ready and ready to merge."
2. Load **Provider failure / retry risk** from the sample picker. Point out that every field remains editable and loading a sample does not submit it.
3. Select **Generate Report**.
4. On `/report`, show `TESTS_REQUIRED`, `HIGH`, Conditions before merge, evidence-backed findings, operational readiness, reviewer focus and report quality.
5. Point out **Baseline + model-assisted** or **Baseline only**, then use **Copy conditions** or **Copy summary**.
6. Ask: "Would this help your team decide what is ready to merge?"

## 2-minute demo

1. On `/workspace`, show the Risk inbox and explain that reports stay local and raw diffs are not saved in local history.
2. Open `/new`, show the sample library, review mode selector and optional public GitHub PR URL import.
3. Generate **Clean utility change**. Highlight `APPROVE`, `LOW`, **Ready to merge**, no conditions and a quiet Test plan.
4. Return to `/new` and generate **Provider failure / retry risk**.
5. Contrast the `TESTS_REQUIRED` result with specific retry, provider, API-contract, logging/privacy and test-gap evidence.
6. Show Operational readiness and explain that Lintel checks failure modes, detection, recovery and impact before merge.
7. Show Reviewer focus and explain that it routes attention to the relevant engineering disciplines without assigning people.
8. Use **Copy conditions** to show the strongest PR-thread artifact.
9. Ask the validation and follow-up questions below.

## Demo scenario pack

The built-in samples are designed to show different merge-readiness outcomes:

| Sample | Expected broad outcome | What it demonstrates |
| --- | --- | --- |
| Clean utility change | `APPROVE` / `LOW` | Lintel can stay quiet for a small tested utility change. |
| Provider failure / retry risk | `TESTS_REQUIRED` / `HIGH` | Retry, provider failure, API contract, logging/privacy and missing tests. |
| Auth/session change | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | Session/token handling, access boundaries and security review. |
| Database migration | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | Migration compatibility, data safety and rollback/recovery concerns. |
| Payment/refund side effect | `TESTS_REQUIRED` | Duplicate payment/refund side effects and idempotency expectations. |
| API contract change | `REVIEW_REQUIRED` | Tests exist, but client-facing error semantics still need focused review. |
| Logging/privacy risk | `REVIEW_REQUIRED` | Structured logging near identifiers and token context. |
| Frontend analytics/type change | `TESTS_REQUIRED` | Frontend/docs/API-consumer review without payment false positives. |

## What to show on `/new`

- Four editable inputs: PR title, repository, language/framework and diff.
- The eight-scenario **Load sample** picker.
- Optional public GitHub PR import and its compact status feedback.
- Review mode selector for Fast triage, Standard readiness, Deep review, Security-sensitive, Test coverage review, Operational readiness and AI-generated code review.
- Nothing is generated until **Generate Report** is selected.
- The privacy note: raw diffs are analyzed transiently and are not saved in local report history.

## Which sample to use first

Use **Provider failure / retry risk** for a short demo because it exposes the product's differentiation quickly: Lintel turns a risky change into concrete Conditions before merge.

For a longer demo, start with **Clean utility change** to show restraint, then contrast it with the provider case.

If the audience cares about security or operational risk, use **Logging/privacy risk** after the provider sample.

## What to point out on `/report`

- Recommendation and risk band.
- Sticky decision panel with condition progress and export actions.
- Conditions before merge near the top.
- Findings with concise evidence and provenance labels.
- Test plan: missing coverage, suggested tests and reviewer checklist.
- Operational readiness: failure modes, detection, observability gaps, recovery/rollback and customer/data impact.
- Evidence-supported Reviewer focus.
- Report quality and its internal consistency checks.
- **Copy conditions**, **Copy summary** and **Download Markdown**.

## How to explain report sources

- **Baseline + model-assisted:** Deterministic checks created the safety floor and model-assisted synthesis enriched the report.
- **Baseline only:** Lintel returned the deterministic baseline because model-assisted generation was disabled, unavailable or unusable.
- **Demo report:** No generated report exists in the current browser session, so `/report` is showing bundled example data.

## Using Copy conditions during validation

Copy Conditions before merge and paste them into the validation conversation or PR thread.

Ask whether the conditions are specific enough to enforce, whether any are noise, and what evidence the reviewer would still need before merging.

## Using Copy summary during validation

Copy the Markdown summary when the reviewer needs more context than conditions alone. Use it for email, Notion, LinkedIn DMs or a feedback note.

Do not paste proprietary output into public channels.

## What not to claim yet

- Lintel is not production-ready and does not provide complete risk coverage.
- It does not replace human review, security review, CI or test execution.
- It does not support private repository web import, a hosted GitHub App, automated PR comments, team workflows, authentication, billing or persistent server-side history.
- Model-assisted output is not guaranteed to be correct.
- The prototype does not claim that a model provider does not retain submitted data.

## Validation asks

Primary:

> Would this help your team decide what is ready to merge?

Follow-up:

> Would you be open to sending a public PR or anonymised diff so I can generate a report?
