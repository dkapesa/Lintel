# Lintel demo script

## 60-second demo

1. Open `/new`: “Lintel verifies whether an AI-assisted pull request is safe, tested, maintainable, and ready to merge.”
2. Load **Provider failure / retry risk** from the sample picker. Point out that every field remains editable and loading a sample does not submit it.
3. Select **Generate Report**.
4. On `/report`, show `TESTS_REQUIRED`, the risk score, evidence-backed findings, operational readiness, reviewer focus, and report-quality status.
5. Point out **AI generated** or **Local fallback**, then use **Copy summary**.
6. Ask: “Would this help your team review AI-assisted PRs?”

## 2-minute demo

1. On `/new`, show the sample library and optional public GitHub PR URL import.
2. Generate **Clean utility change**. Highlight `APPROVE`, `LOW`, **Ready to merge**, no additional suggested tests, and **Checks passed**.
3. Return to `/new` and generate **Provider failure / retry risk**.
4. Contrast the `TESTS_REQUIRED` result with specific retry, provider, API-contract, logging, and test-gap evidence.
5. Show Operational readiness and explain that Lintel checks detection, recovery, and potential impact without inventing controls or incidents.
6. Show Reviewer focus and explain that unsupported areas are pruned rather than assigned speculatively.
7. Use **Copy summary** and explain that the Markdown is intended for review handoff and validation conversations.
8. Ask the validation and follow-up questions below.

## What to show on `/new`

- Four editable inputs: PR title, repository, language/framework, and diff.
- The eight-scenario **Load sample** picker.
- Optional public GitHub PR import and its compact status feedback.
- Nothing is generated until **Generate Report** is selected.
- The privacy note: the raw diff is analyzed but not stored in session storage or returned inside the report.

## Which sample to use first

Use **Provider failure / retry risk** for a short demo because it exposes the product’s differentiation quickly. For a longer demo, start with **Clean utility change** to show that Lintel does not invent risk, then contrast it with the provider case.

## What to point out on `/report`

- Recommendation, risk score, level, confidence, and matching executive-summary heading.
- AI/local/demo source badge and Sample/GitHub/Pasted diff input source.
- Findings tied to changed files and detected evidence.
- Missing tests, suggested tests, and merge conditions.
- Security, reliability, maintainability, and operational readiness.
- Evidence-supported Reviewer focus.
- Report quality and its internal consistency checks.
- **Copy summary** and raw-diff protections.

## How to explain report sources

- **AI generated:** AI enriched the report and deterministic guardrails normalized the result.
- **Local fallback:** AI was unavailable, timed out, or returned unusable output, so Lintel returned the deterministic baseline.
- **Demo report:** No report exists in the current browser session, so `/report` is showing bundled example data.

## Using Copy summary during validation

Copy the Markdown and paste it into the validation conversation. Ask whether the recommendation is clear, whether the evidence supports it, and what a reviewer would still need before merging. Do not paste proprietary output into public channels.

## What not to claim yet

- Lintel is not production-ready and does not provide complete risk coverage.
- It does not replace human review, security review, or test execution.
- It does not support private repositories, a GitHub App, automated PR comments, team workflows, authentication, billing, or persistent history.
- AI output is not guaranteed to be correct.
- The prototype does not claim that the AI provider does not retain submitted data.

## Validation asks

Primary: “Would this help your team review AI-assisted PRs?”

Follow-up: “Would you be open to sending a public PR or anonymised diff so I can generate a report?”
