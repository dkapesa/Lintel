# Lintel demo script

## 60-second demo

1. Open `/new` and explain that Lintel checks whether an AI-assisted pull request is safe, tested, maintainable, and ready to merge.
2. Select **Risky sample** first. Point out that the PR context and diff remain editable and nothing is submitted until **Generate Report** is selected.
3. Generate the report and show the recommendation, risk score, evidence-backed findings, missing tests, reviewer checklist, and conditions before merge.
4. Point out the source badge and use **Copy summary** to produce concise markdown for sharing.
5. Ask: “Would this help your team review AI-assisted PRs?”

## 2-minute demo

1. On `/new`, briefly show the four inputs: PR title, repository, language/framework, and diff.
2. Load **Clean sample** and generate it to demonstrate an `APPROVE` result with low risk and no blocking conditions.
3. Return to `/new`, load **Risky sample**, and generate it to demonstrate `TESTS_REQUIRED`, specific risk findings, suggested tests, and merge conditions.
4. On `/report`, highlight the source badge, executive summary, changed files, risk evidence, engineering reviews, reviewer checklist, and final recommendation.
5. Use **Copy summary** and explain that the markdown is designed for email, LinkedIn, Notion, or feedback conversations.
6. Ask the validation and follow-up questions below.

## What to show on `/new`

- The small amount of context required to generate a report.
- The **Clean sample** and **Risky sample** controls.
- Sample data remains editable after loading.
- Generation starts only when **Generate Report** is selected.
- The privacy note: Lintel does not store the raw diff in session storage or return it in the generated report.

## Which sample to use first

Use **Risky sample** for a 60-second demo because it shows Lintel's value fastest. For a longer demo, show **Clean sample** first to establish that Lintel can approve a well-tested change, then contrast it with the risky result.

## What to point out on `/report`

- Recommendation, risk score, risk level, and confidence.
- Findings tied to detected evidence and changed files.
- Missing tests and focused suggested tests.
- Security, reliability, and maintainability review states.
- Reviewer checklist and conditions before merge.
- Final recommendation consistency.
- Source badge and **Copy summary** action.

## How to explain report sources

- **AI generated:** The server successfully generated and normalised an AI report, with deterministic guardrails preserving concrete risks and report consistency.
- **Local fallback:** AI was unavailable or its response could not be used safely, so Lintel returned the deterministic prototype report.
- **Demo report:** No generated report exists in the current browser session, so `/report` is showing the built-in example.

## Using Copy summary during validation

Select **Copy summary** on `/report`, then paste the concise markdown into the validation conversation. Use it to ask whether the recommendation is understandable, whether the evidence is useful, and what information a reviewer would still need before merging.

## What not to claim yet

- Do not claim production readiness or complete risk coverage.
- Do not claim that Lintel replaces human code review, security review, or testing.
- Do not claim live GitHub integration, automatic PR comments, team workflows, authentication, billing, or persistent report history.
- Do not claim that AI output is always correct or that all failure modes are detected.
- Do not claim that the AI provider does not retain submitted data.

## Validation asks

Primary ask: “Would this help your team review AI-assisted PRs?”

Follow-up ask: “Would you be open to sending a public PR or anonymised diff so I can generate a report?”
