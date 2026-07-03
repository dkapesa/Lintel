# Lintel

Lintel is a merge-readiness verification prototype for AI-assisted pull requests. It turns a pasted diff or public GitHub pull request into a structured report covering risk, test gaps, operational readiness, reviewer focus, and conditions before merge.

Lintel does not replace human review. Its purpose is to make the review decision more explicit, evidence-grounded, and easier to share.

## The problem

AI can produce code faster than teams can confidently verify it. A plausible diff may still hide missing tests, unsafe retries, unclear API contracts, sensitive logging, migration risk, or weak recovery paths. Generic code-review summaries often describe the code without answering the operational question: **is this change ready to merge?**

Lintel is designed around that decision.

## Core flow

1. Open `/new`.
2. Paste PR metadata and a unified diff, load a built-in sample, or import a public GitHub PR URL.
3. Select **Generate Report**.
4. The server creates a deterministic baseline and optionally asks an AI model to enrich it.
5. The AI response is normalized against deterministic guardrails; failures return the deterministic report.
6. `/report` renders the final result and can copy a concise Markdown summary.

## Key features

- `APPROVE`, `REVIEW_REQUIRED`, and `TESTS_REQUIRED` merge recommendations
- Risk score, derived risk level, confidence, and evidence-backed findings
- Missing-test detection and focused suggested tests
- Security, reliability, and maintainability review states
- Operational readiness: failure modes, detection, observability, recovery, and impact
- Evidence-based reviewer focus without assigning people or teams
- Internal report-quality checks for recommendation and evidence consistency
- Public GitHub PR diff import with strict URL validation and size limits
- Eight built-in evaluation samples covering clean and risky changes
- Browser-local history for the 10 most recent generated reports
- Source visibility for AI output, deterministic fallback, and demo reports
- Copyable Markdown summaries with raw-diff and secret redaction safeguards
- Client-side Markdown downloads with safe, readable filenames

## Architecture

Lintel uses a small Next.js App Router architecture with TypeScript and plain CSS:

```text
/new
  -> optional POST /api/fetch-pr-diff
  -> POST /api/generate-report
       -> deterministic baseline
       -> optional OpenAI request via native fetch
       -> normalization and safety guardrails
       -> report-quality assessment
  -> sessionStorage stores the current { report, source }
  -> localStorage keeps up to 10 raw-diff-free report history entries
  -> /report renders and copies the result
```

There is no database, authentication layer, background worker, or GitHub App.

## AI guardrails and fallback

AI generation is optional. Before any AI call, Lintel creates a deterministic report from changed files and diff signals. The normalizer then:

- preserves submitted metadata and changed files;
- merges concrete baseline findings, tests, and merge conditions;
- clamps risk scores and derives risk levels from the final score;
- prevents unsafe recommendation upgrades and operational downgrades;
- prunes unsupported reviewer-focus areas;
- checks the final report for internal consistency and raw patch markers.

Missing credentials, provider timeouts, non-success responses, malformed JSON, or unsafe output all fall back to the deterministic report.

## Public GitHub PR import

`/new` accepts public URLs in this form:

```text
https://github.com/<owner>/<repository>/pull/<number>
```

The server validates the host and path, reconstructs trusted GitHub URLs, fetches the public `.diff`, and attempts an unauthenticated metadata lookup for the title. Private repositories and authenticated GitHub access are not supported.

## Privacy and storage

- Raw diffs are used for generation but are not stored in `sessionStorage` or returned inside the report.
- Current-session storage contains `{ report, source }` under `lintel.generatedReport.v1`.
- Local history contains generated reports, source/input labels, creation time, and minimal display metadata under `lintel.reportHistory.v1`.
- Neither browser entry stores the submitted raw diff.
- API responses use no-store behavior where appropriate.
- When AI generation is enabled, the submitted diff is sent to the configured model provider for analysis.
- Lintel does not claim that the model provider does not retain submitted data.
- Do not submit secrets, private source code, or sensitive production data to this prototype.

## Current limitations

- Prototype heuristics and AI output can miss or misclassify risk.
- No private repository access, GitHub App, webhooks, or automated PR comments.
- No authentication, teams, server-side or shared report history, billing, or audit log.
- No repository-wide context, dependency graph, test execution, or static-analysis engine.
- Public GitHub imports are subject to unauthenticated rate limits.
- Reports support engineering judgment; they are not a security or compliance guarantee.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/new](http://localhost:3000/new).

AI generation is optional. Copy `.env.example` to `.env.local` and set evaluator-owned values when required:

```text
OPENAI_API_KEY=
OPENAI_MODEL=
```

Leave both values empty to exercise deterministic fallback. Never commit `.env.local` or real credentials.

Useful documentation:

- [Case study](docs/case-study.md)
- [Demo script](docs/demo-script.md)
- [Manual evaluation](docs/manual-evaluation.md)
- [Screenshot checklist](docs/screenshot-checklist.md)
