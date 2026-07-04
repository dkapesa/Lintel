# Lintel

**Lintel is a local-first merge-readiness workspace for engineering teams.**

It turns public GitHub pull requests, pasted diffs, and built-in evaluation scenarios into structured reports that help reviewers decide whether a change is safe, tested, operationally ready, and ready to merge.

Lintel does not replace human review, CI, security review, or tests. It makes the merge decision more explicit, evidence-grounded, and easier to share.

## Why Lintel exists

Modern engineering teams can create code faster than they can confidently verify it.

A pull request may look reasonable while still hiding missing tests, unsafe retries, unstable API contracts, sensitive logging, migration risk, poor observability, or unclear recovery paths. Reviewers are often left answering the most important question manually:

> Is this change actually ready to merge?

Lintel is designed around that decision.

Instead of producing a generic code summary, Lintel generates a merge-readiness report covering:

- risk and recommendation
- missing tests
- operational readiness
- reviewer focus
- report quality
- conditions before merge

## What Lintel does

Lintel evaluates a pull request and produces a structured report with:

- `APPROVE`, `REVIEW_REQUIRED`, or `TESTS_REQUIRED` recommendation
- risk score, risk level, confidence, and evidence-backed findings
- missing-test detection and suggested tests
- security, reliability, and maintainability review states
- operational readiness analysis covering failure modes, detection, observability, recovery, rollback, and customer or data impact
- reviewer-focus guidance for areas such as backend reliability, API contracts, security/privacy, data/migrations, frontend integration, platform/observability, and domain logic
- report-quality checks that validate internal consistency before the result is shared
- copyable and downloadable Markdown summaries
- browser-local report history
- a local reports workspace for browsing recent reports

## Product flow

1. Open `/new`.
2. Load a built-in scenario, import a public GitHub PR, or paste a unified diff.
3. Choose a review profile.
4. Generate a report.
5. Review the result on `/report`.
6. Browse previous local reports in `/workspace`.
7. Copy or download the Markdown summary for sharing.

## Core features

### PR input

- Public GitHub PR import with strict URL validation
- Manual pasted diff workflow
- Eight built-in evaluation samples
- Stack/context inference for imported PRs
- Editable PR title, repository, language, framework, and review profile

### Review profiles

Lintel supports lightweight review policy profiles:

- Standard
- High assurance
- Payments/refunds
- Auth/security
- Data/migrations
- Frontend/API consumer

Profiles act as risk lenses. They strengthen relevant checks when supporting evidence exists, without creating unsupported findings.

### Merge-readiness reports

Each report includes:

- final merge recommendation
- risk score and risk level
- executive summary
- changed files
- risk findings
- engineering review states
- operational readiness
- reviewer focus
- report quality checks
- missing tests
- suggested tests
- conditions before merge

### Local workspace

The `/workspace` page provides a local report workspace backed by browser storage.

It shows recent reports with:

- PR title
- repository
- recommendation
- risk
- operational status
- reviewer focus
- report quality
- input source
- review profile
- creation time

Reports can be opened, deleted, or cleared locally.

## Architecture

Lintel is built with Next.js App Router, TypeScript, and plain CSS.

```text
/new
  -> optional POST /api/fetch-pr-diff
  -> POST /api/generate-report
       -> deterministic baseline
       -> optional model-assisted analysis
       -> normalization and guardrails
       -> report-quality assessment
  -> sessionStorage stores the current { report, source }
  -> localStorage stores up to 10 raw-diff-free report history entries
  -> /report renders the selected report
  -> /workspace lists recent local reports
