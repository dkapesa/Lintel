# Lintel public pilot package

## Public pilot positioning

Lintel is a merge-readiness system for pull requests.

It helps engineering teams decide whether PRs are safe, tested, operationally ready and ready to merge.

Core distinction:

- Coding agents help teams create code faster.
- Lintel helps teams decide what is ready to merge.

The strongest wedge is simple: teams using coding agents are creating PRs faster than senior engineers can review them.

Lintel is not a replacement for human review, CI, security review or tests. It creates a decision artifact that makes review risk, missing evidence and merge conditions explicit.

## Who the pilot is for

Prioritise:

- tech leads and staff engineers at 3-15 person AI-heavy startups;
- agency technical directors shipping client work with Claude Code, Cursor, Codex or Copilot;
- technical founders using coding agents heavily;
- engineering teams where one senior reviewer is the bottleneck.

Good pilot users have real PR review pressure and can bring real pull requests or anonymised diffs.

## Current pilot capabilities

Current product capabilities:

- public GitHub PR import;
- pasted diff analysis;
- sample reports;
- review policy profiles;
- stack/context inference;
- merge-readiness reports;
- `APPROVE`, `REVIEW_REQUIRED` and `TESTS_REQUIRED` recommendations;
- risk band and score detail;
- Conditions before merge;
- Copy conditions;
- evidence-backed findings;
- provenance labels such as `Rule detected` and `Model assisted`;
- Test plan;
- operational readiness;
- reviewer focus;
- report quality checks;
- Copy summary;
- Download Markdown;
- local workspace/risk inbox;
- local-first report history;
- raw diffs not saved in local report history.

## Current limitations

Be explicit about current scope:

- no auth yet;
- no billing system yet;
- no database yet;
- no private repo import yet;
- no GitHub App yet;
- no CI integration yet;
- no automatic PR comments yet;
- no team dashboard yet;
- line-level diff hunk evidence is not yet shown;
- frontend-specific reviewer routing still needs refinement.

Reports support engineering judgment. They do not catch all bugs, replace senior review or prove a PR is safe.

## Pilot offers

### A. Free structured pilot

- 30 days.
- For first serious users.
- User runs Lintel on real PRs.
- Weekly 20-minute feedback call.
- Optional anonymous feedback or outcome notes.

Best for teams willing to evaluate the product seriously before a paid pilot.

### B. Founding Team Pilot

- £99/month for 3 months, then £199/month.
- For small teams with real review bottlenecks.
- Personal onboarding.
- Roadmap influence.
- Direct feedback loop.
- Cancel anytime.

Best for startups where AI-assisted development has made senior review the bottleneck.

### C. Agency Design Partner

- £249/month.
- For agencies shipping client work with coding agents.
- Includes pilot support and optional custom review-profile input.
- Goal: help agencies show review diligence to clients.

Best for agencies that need a repeatable way to demonstrate risk review before shipping client work.

The £499 High-Velocity tier should not be presented as a current pilot offer. It can return later when deeper team workflow, private repositories, GitHub integration and shared reporting exist.

## What pilot users get

Pilot users get:

- product access;
- onboarding call;
- help running Lintel on their first real PRs;
- direct feedback channel;
- roadmap influence;
- early pricing lock-in if useful;
- option to shape the GitHub Action and private repo roadmap.

## What Lintel needs from pilot users

Pilot users should be willing to:

- run reports on real PRs;
- paste Conditions before merge into at least one real PR discussion where appropriate;
- provide weekly feedback;
- identify false positives and false negatives;
- share what would make the product worth paying for.

## Best proof/screenshots to show

Recommended order:

1. `TESTS_REQUIRED` Decision Gate / Conditions before merge.
2. `APPROVE` vs `TESTS_REQUIRED` pair.
3. Findings with provenance.
4. Workspace Risk inbox.
5. Markdown export.
6. Evaluation results.

This order leads with the merge decision, then shows that the product can be both strict and restrained.

## Founder-led outreach plan

Approach:

- run Lintel on a real public PR before messaging where possible;
- lead with the merge decision, not AI code review;
- ask for a hard PR, not a call first;
- offer to send the report back the same day;
- target 30 named prospects first.

Suggested first message structure:

1. Reference a specific PR or review bottleneck.
2. Say Lintel produced a merge-readiness report.
3. Mention one concrete condition or missing test if available.
4. Ask whether they want the report.
5. If they reply, offer a short call only after they see the artifact.

The goal is not to sell a dashboard first. The goal is to prove the report helps with a real merge decision.

## Weekly metrics

Track weekly:

- real non-sample reports generated;
- distinct users who ran real reports;
- returning users;
- Copy conditions / Markdown export events where manually tracked;
- DMs sent;
- replies;
- calls booked;
- pilots started;
- paid pilots;
- qualitative pilot notes.

Manual tracking is enough for the current stage. Do not add analytics until the product needs it.

## Objection handling

### How is this different from CodeRabbit?

Code review tools focus on comments, suggestions and code-level feedback. Lintel focuses on the merge decision: recommendation, risk band, missing tests, operational readiness, reviewer focus and Conditions before merge. It is intended to sit alongside code review, not replace it.

### Is this just an LLM wrapper?

No. Lintel creates a deterministic baseline first, then optionally uses model-assisted analysis as enrichment. The normalizer preserves baseline risks, dedupes output, applies risk guardrails, checks report quality and falls back to the baseline when model output is missing or invalid.

### Why not just prompt Claude?

You can, but the result is not a repeatable merge-readiness workflow. Lintel gives a consistent report shape, deterministic fallback, Conditions before merge, reviewer focus, operational readiness, provenance labels, report quality checks, local history and Markdown export.

### No private repos?

Not yet. The pilot supports public GitHub PR imports and pasted diffs. Private repo support likely needs a GitHub App or GitHub Action and should be shaped by pilot feedback.

### Will this slow us down?

The intended workflow is lightweight: import or paste a PR, generate a report, copy the conditions that matter. The goal is to shorten review uncertainty, not add another approval process.

### What if it misses something?

It can miss things. Lintel does not replace human review, CI, tests or security review. Its job is to make common merge-readiness risks explicit and give reviewers a structured checklist. Report quality checks and deterministic guardrails reduce some failure modes, but they do not guarantee completeness.

### Why pay while it is early?

Early paid pilots get direct influence over the workflow, onboarding support and pricing certainty. Payment is only appropriate for teams with a real review bottleneck and enough usage to evaluate whether the report saves senior engineering time.

## 30-day pilot plan

### Week 1

- Run Lintel on 10 real public PRs.
- Collect 5 best examples.
- Publish evaluation page.
- Prepare pilot one-pager.
- Build list of 30 targets.
- Send first 5 evidence-first DMs.

### Week 2

- Send 10 more DMs.
- Book 5 calls.
- Start free structured pilots.

### Week 3

- Get 5 active pilots.
- Run weekly feedback calls.
- Ship 2 pieces of feedback.

### Week 4

- Convert 1-2 engaged pilots to Founding Team Pilot or Agency Design Partner.
- Publish first month learning note.

## What not to claim

Do not claim:

- Lintel catches all bugs;
- Lintel replaces human review;
- Lintel replaces CI, tests or security review;
- private repository support exists;
- GitHub App integration exists;
- line-level diff evidence exists;
- model-assisted output cannot be wrong.

The honest claim is stronger: Lintel turns a PR into a focused merge-readiness decision artifact.
