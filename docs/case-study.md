# Lintel case study

## Project status

Lintel is a V3.5 local-first merge-readiness workspace for pull requests.

It helps reviewers decide whether a PR is safe, tested, operationally ready, maintainable, and ready to merge.

Lintel is not a generic AI code review chatbot. It is built around one narrower product question:

> What needs to be true before this PR can safely merge?

Core positioning:

> Agents create code. Lintel decides what is ready to merge.

Product principle:

> A checklist, not a lecture.

Lintel does not replace human review, CI, tests, or security review. It creates a decision artifact that helps reviewers focus on risk, missing evidence, and merge conditions.

## Problem

Coding agents increase implementation speed, but review confidence does not automatically scale.

Generated or heavily assisted PRs can look plausible while still hiding:

- missing tests for new behavior;
- retry paths that duplicate customer-facing side effects;
- provider timeout and fallback handling gaps;
- client-facing API contract instability;
- sensitive logging;
- database migration or data-write risk;
- poor observability;
- unclear rollback or recovery paths.

The bottleneck moves from writing code to verifying whether a change is ready to merge. For many small teams, one senior reviewer becomes the constraint.

## Product thesis

Merge readiness is a different product problem from generic code review.

Code review tools often focus on comments, suggestions, style, structure, and line-level changes. Lintel focuses on the merge decision:

1. What is the recommendation?
2. What is the risk band?
3. What evidence supports the findings?
4. What tests or review work are missing?
5. What conditions must be met before merge?
6. Which reviewer focus areas matter for this PR?
7. Is the report internally consistent enough to share?

The strongest wedge is the report artifact itself: Conditions before merge that can be pasted into a PR discussion.

## What I built

Lintel evolved from a static report UI into a local merge-readiness workspace.

Current product capabilities:

- Public GitHub PR import.
- Manual pasted diff analysis.
- Built-in sample reports.
- Deterministic report generation.
- Optional model-assisted analysis.
- Typed report normalization and guardrails.
- Deterministic fallback when model-assisted analysis fails.
- Stack/context inference.
- Review policy profiles.
- `APPROVE`, `REVIEW_REQUIRED`, and `TESTS_REQUIRED` recommendations.
- Risk band and score detail.
- Missing tests and suggested tests.
- Conditions before merge.
- Copy conditions.
- Evidence-backed findings.
- Provenance labels such as `Rule detected` and `Model assisted`.
- Operational readiness checks.
- Reviewer focus guidance.
- Report quality checks.
- Copy summary.
- Download Markdown.
- Local workspace / Risk inbox.
- Local report history without raw diffs.
- Security model documentation.

Current product journey:

1. The homepage explains Lintel as a merge-readiness decision layer.
2. The Risk inbox at `/workspace` shows recent reports grouped by PR readiness state.
3. The new report surface at `/new` supports public PR import, pasted diffs, samples, and review profiles.
4. The report working surface at `/report` shows the decision, conditions, findings, test plan, operational readiness, reviewer focus, and export actions.
5. The security model documentation explains current privacy boundaries and the planned GitHub Action direction.

## Technical approach

Lintel uses a small Next.js App Router architecture with TypeScript and plain CSS.

```text
/new
  -> optional POST /api/fetch-pr-diff
  -> POST /api/generate-report
       -> deterministic baseline
       -> optional model-assisted analysis
       -> normalization and guardrails
       -> report-quality assessment
  -> sessionStorage stores the current { report, source }
  -> localStorage stores raw-diff-free report history and local workflow state
  -> /report renders the selected report
  -> /workspace groups reports into a local Risk inbox
```

Key technical decisions:

- Deterministic baseline first.
- Model-assisted analysis as enrichment, not the safety floor.
- Normalization before rendering.
- Risk level derived from final risk score.
- Missing tests preserve `TESTS_REQUIRED`.
- Operational attention prevents clean approval.
- Unsupported reviewer-focus areas are pruned.
- Report quality checks validate internal consistency.
- Copied/exported reports avoid raw patch markers.
- Provider failures fall back to deterministic reports.

This keeps the prototype useful without adding database, auth, billing, a hosted GitHub App, private repo import, or team accounts before validating demand.

## Report artifact

The report is structured as a decision-first working surface.

Current hierarchy:

1. Recommendation, risk band, and executive summary.
2. Conditions before merge.
3. Risk findings.
4. Test plan.
5. Operational readiness.
6. Reviewer focus.
7. Changed files.
8. Engineering review.
9. Report quality.
10. Closing summary.

Important details:

- Risk band is visually primary; score detail is secondary.
- Conditions before merge are near the top and deduped.
- Condition progress can be tracked locally.
- Copy conditions produces a PR-comment-ready Markdown block.
- Clean `APPROVE` reports stay quiet.
- Findings include provenance labels.
- Missing coverage, suggested tests, and reviewer checklist are consolidated into Test plan.
- Markdown copy/download follows the same report hierarchy.

The report is intentionally a checklist and decision aid, not a long generic critique.

## Workspace / Risk inbox

The workspace started as a recent-report list. It now behaves like a local risk inbox.

Current behavior:

- Groups duplicate runs by PR identity.
- Shows one row per tracked PR.
- Uses the latest report as the visible row.
- Shows a run count.
- Adds a triage strip for blocked, tests required, ready, and tracked PRs.
- Splits reports into Needs attention and Ready / cleared.
- Adds local-only status: Needs work, Conditions met, Merged, and Dismissed.
- Shows condition progress.
- Includes a split-view report preview.
- Supports filters by readiness state.
- Lets users open reports, copy conditions, and delete local report groups.

This makes the workspace feel less like a log and more like a practical review queue.

## Security and privacy model

The prototype is local-first.

- Reports are stored on the user's device through browser storage.
- Raw diffs are not saved in local report history.
- Local condition progress and status are stored locally.
- Copied summaries, copied conditions, and downloaded Markdown are designed to avoid raw diff hunks and patch markers.
- Public GitHub import supports public PRs only.
- Private repository web import is not supported.

When model-assisted analysis is enabled, the submitted diff is sent to the configured provider for analysis. The prototype does not claim that the provider does not retain submitted data.

The planned private-repo direction is a CLI-first GitHub Action that runs inside the customer's GitHub Actions environment, rather than sending proprietary diffs to a hosted Lintel API.

See:

- [Security model](security-model.md)
- [GitHub Action plan](github-action-plan.md)

## Evaluation evidence

Lintel uses manual regression evaluation rather than relying on anecdotal prompt tests.

Current documented scenarios include:

- clean APPROVE sample;
- provider retry / discount-code sample;
- public GitHub import for `vercel/next.js` PR 63226;
- manual pasted clean diff.

Validated outcomes:

- Clean utility changes remain `APPROVE`, `LOW`, operationally `CLEAR`, with no invented work.
- Provider retry / discount-code risk escalates to `TESTS_REQUIRED`, `HIGH`, operational `ATTENTION`.
- Frontend/API public PR imports do not show unsupported Payments/domain logic.
- Stack inference detects `TypeScript / Next.js` for the tested Next.js PR.
- Report quality checks pass across evaluated scenarios.
- Raw diff markers do not appear in UI, copied conditions, copied summaries, downloaded Markdown, session storage, or local history.

Evaluation documents:

- [Evaluation workflow](evaluation.md)
- [Evaluation results](evaluation-results.md)
- [Manual evaluation](manual-evaluation.md)

## Public pilot and distribution

Lintel is being prepared for founder-led public pilot outreach.

The current pilot wedge:

> Teams using coding agents are creating PRs faster than senior engineers can review them.

Target pilot users:

- tech leads and staff engineers at 3-15 person AI-heavy startups;
- agency technical directors shipping client work with Claude Code, Cursor, Codex, or Copilot;
- technical founders using coding agents heavily;
- senior engineers who are review bottlenecks.

The strongest distribution artifact is Conditions before merge pasted into a PR thread.

Pilot and distribution docs:

- [Public pilot package](public-pilot.md)
- [Distribution assets](distribution-assets.md)

## Prototype boundary

Lintel is still a prototype.

Current limitations:

- no auth;
- no billing system;
- no database;
- no private repo web import;
- no hosted GitHub App;
- no CI integration;
- no automatic PR comments;
- no team dashboard;
- no line-level diff hunk evidence;
- no test execution;
- no static-analysis engine;
- frontend-specific reviewer routing still needs refinement;
- model-assisted quality depends on the configured provider when enabled.

Reports support engineering judgment. They do not catch all bugs and do not prove a PR is safe.

## Roadmap

Near-term roadmap:

1. GitHub Action planning.
2. Minimal PR comment workflow.
3. Before/after verification.
4. More real public and anonymized PR evaluations.
5. Frontend/API reviewer-routing refinement.

Later roadmap:

1. Private repository support.
2. Hosted GitHub App.
3. Team workflow.
4. Database-backed report history.
5. Authentication.
6. Billing.
7. Model modes and provider configuration.

Lintel should only expand into heavier SaaS infrastructure after validating that teams use the report artifact during real merge decisions.

## What this project demonstrates

Lintel demonstrates:

- product positioning around a specific engineering decision;
- typed Next.js App Router implementation;
- deterministic report generation;
- model-assisted generation with fallback;
- guardrails and normalization around generated output;
- raw-diff privacy constraints;
- local-first browser storage;
- public GitHub PR import;
- Markdown export workflows;
- report-quality validation;
- evaluation-driven iteration;
- founder-led pilot packaging.

## Conclusion

Lintel started as a static report prototype and evolved into a local-first merge-readiness workspace.

The useful insight is not that every PR needs another reviewer. It is that the hard PRs need a clearer decision artifact:

> What are the risks, what evidence is missing, and what conditions must be met before merge?
