# Lintel founder-led distribution assets

## Context

Lintel is a merge-readiness system for pull requests.

It helps engineering teams decide whether pull requests are safe, tested, operationally ready and ready to merge.

Core distinction:

- Coding agents help teams create code faster.
- Lintel helps teams decide what is ready to merge.

Current pilot wedge:

> Teams using coding agents are creating PRs faster than senior engineers can review them.

Strongest artifact:

> Conditions before merge pasted into a PR thread.

## Distribution principles

- Lead with merge readiness, not AI.
- Show artifacts, not abstract claims.
- Ask for hard PRs, not generic feedback.
- Run Lintel on public PRs before messaging where possible.
- Use Conditions before merge as the growth loop.
- Talk about review bottlenecks, missing tests and operational risk.
- Protect trust by showing limitations honestly.
- Do not claim Lintel catches all bugs.
- Do not say it replaces code review, CI, tests or security review.
- Do not attack CodeRabbit, Cursor, Claude Code, Copilot or Codex.

## X positioning

X should sound like an engineer building in public: specific, concrete and artifact-led.

Best images:

1. `TESTS_REQUIRED` Decision Gate.
2. `APPROVE` vs `TESTS_REQUIRED` pair.
3. Findings with provenance.
4. Workspace Risk inbox.
5. Evaluation evidence.

The best posts show the merge decision, the missing evidence or the condition that would go into a PR thread.

## X post bank

1. Coding agents changed the bottleneck. Writing code got faster. Deciding what is safe to merge did not. I’m building Lintel for that second problem: merge readiness for pull requests. [link]

2. A useful review artifact is not “here is a summary of the diff.” It is: “before this merges, prove these conditions.” That is the part I’m focusing on with Lintel. [decision gate screenshot]

3. The strongest Lintel output so far is boring and practical: Conditions before merge. If a retry path can duplicate a customer side effect, the report should say exactly what must be proven before approval.

4. Clean changes should stay quiet. If a small utility change has matching tests, the right report is APPROVE, low risk, no findings, no invented work. A tool that only raises flags is not judging readiness. [APPROVE vs TESTS_REQUIRED screenshot]

5. I’m not trying to build another generic code review comment bot. Lintel answers a narrower question: is this PR ready to merge?

6. Coding agents help teams create code faster. Lintel helps teams decide what is ready to merge. That distinction matters more every week.

7. Today’s product test: a provider retry path that could issue duplicate discount codes. Lintel escalated it to TESTS_REQUIRED and produced merge conditions around idempotency, provider failures, API contracts and logging. [decision gate screenshot]

8. A missing test is not always “add more tests.” Sometimes it is: prove retries cannot create duplicate redemptions. That is the level of specificity I want Lintel to reach.

9. Operational readiness belongs before merge, not after the incident. Lintel reports now include failure modes, detection signals, recovery paths and customer/data impact where the diff gives evidence.

10. I added provenance labels to Lintel findings: Rule detected or Model assisted. Reviewers should know whether a finding came from deterministic baseline checks or model-assisted synthesis. [findings screenshot]

11. Lintel is local-first in the current prototype. Reports live in your browser history. Raw diffs are not saved in local report history. That is deliberate while the product is still early.

12. The workspace is now a local Risk inbox: grouped PRs, triage counts, local statuses and copyable conditions. Less “recent reports log”, more “what needs attention before merge.” [workspace screenshot]

13. I’m looking for hard public PRs to run through Lintel. Best fit: retry logic, auth/session changes, API contract changes, provider failures, migrations or anything generated with coding agents. Send me one and I’ll return the report.

14. Evaluation note: clean APPROVE reports must stay quiet. No generic checklist. No invented suggested tests. No fake concerns. Restraint is a feature.

15. The current Lintel regression I care about: frontend/docs/API PRs must not get payment-domain warnings unless payment evidence exists. False positives destroy trust quickly.

16. If your team is using coding agents and one senior engineer has become the review bottleneck, I’d like to show you Lintel. Not a dashboard pitch. Send a hard PR and I’ll return a merge-readiness report.

17. The agency angle is interesting: if you ship client work with coding agents, you need a repeatable way to show review diligence. Lintel turns a PR into a shareable merge-readiness artifact.

18. Lintel’s report quality checks look for internal consistency before export: risk band vs score, approval conflicts, unsupported reviewer focus and raw patch marker leakage.

19. I’m keeping Lintel honest in the docs: no private repos yet, no GitHub App yet, no CI integration yet, no automatic PR comments yet. The current product is public PRs or pasted diffs.

20. The thing I want teams to paste into PRs is not the whole report. It is the conditions: “prove X before merge.” That is the growth loop I’m testing.

21. Building Lintel has made me more convinced that “code review” and “merge readiness” are different product categories. One comments on code. The other decides whether the change is ready.

22. If a report says TESTS_REQUIRED, it should explain exactly what tests are missing. If it says APPROVE, it should not pad the report with generic advice. That is the bar I’m aiming for.

23. Public pilot question: would your team use a merge-readiness report before approving PRs created with Cursor, Claude Code, Codex or Copilot?

24. I’m looking for 10 serious pilot users for Lintel. Best fit: small engineering teams shipping faster with coding agents, but still bottlenecked on senior review. [link]

25. The current Lintel workflow: paste a diff or import a public GitHub PR -> generate report -> review recommendation, risks, tests, operations and reviewer focus -> copy Conditions before merge into the PR thread.

26. If you are a tech lead and your review queue is full of plausible generated PRs, I want to talk. The question Lintel is built around: what is safe to merge?

27. The best feedback is not “cool idea.” It is a hard PR where the report was wrong, too vague or useful enough to paste into the discussion.

28. Lintel is early. It can miss things. It does not replace senior review. The useful question is narrower: can it make merge risk and missing evidence clearer before approval?

29. I’m testing whether a merge-readiness report can become part of the PR conversation. Not every PR needs it. But the hard ones might.

30. Public pilot offer: send me a public PR or anonymised diff. I’ll run Lintel and send back the report. If the Conditions before merge are useful, we can talk pilot.

## X weekly cadence

Post 3-4 times per week:

- 1 artifact post: screenshot of Decision Gate, findings, workspace or evaluation.
- 1 lesson/insight post: what the product revealed about merge readiness.
- 1 ask-for-hard-PR post: request public PRs or anonymised diffs.
- 1 build-in-public progress post: what changed, what broke, what was learned.

Keep the weekly theme narrow. Example: one week on provider retry risk, one week on clean APPROVE restraint, one week on workspace Risk inbox.

## DM templates

### 1. Tech lead who posted about code review fatigue

Hey [name] - saw your post about review load. I’m building Lintel, a merge-readiness tool for PRs created in faster coding workflows.

It does not replace review. It turns a PR into a recommendation, risks, missing tests and Conditions before merge.

If you have a hard public PR, send it over and I’ll return the report same day.

### 2. Staff engineer at small AI-heavy startup

Hey [name] - quick one. I’m looking for staff/lead engineers at small teams using coding agents heavily.

Lintel helps answer: is this PR actually ready to merge?

If you have a real PR with tricky risk, I can run it and send back the merge-readiness report. No call needed first.

### 3. Agency technical director

Hey [name] - I’m testing Lintel with agencies shipping client work using Claude Code, Cursor, Codex or Copilot.

The angle is review diligence: a report with risks, missing tests and Conditions before merge that can be shared with the team/client.

If you have a public PR or anonymised diff, I can send back a report.

### 4. Technical founder

Hey [name] - if you’re using coding agents heavily, I’m looking for founders with real PR review pressure.

Lintel is not a coding agent. It helps decide what is safe, tested and operationally ready to merge.

Want to send me one hard PR? I’ll return the report and you can tell me if it would change your review.

### 5. Someone who liked/replied to a post

Thanks for engaging with the Lintel post. I’m collecting hard PRs to test whether the report is actually useful.

If you have a public PR where the merge risk is non-obvious, send it over. I’ll run it and send back the Conditions before merge.

### 6. Cursor/Claude Code community member

Hey [name] - I noticed you’re using [Cursor/Claude Code] for real work.

I’m building the layer after code generation: deciding whether the PR is ready to merge.

If you have a generated PR that needed careful review, I’d like to run it through Lintel and send the report back.

### 7. Someone with a public GitHub PR

Hey [name] - I saw [PR link]. I’m building Lintel, a merge-readiness report for PRs.

I can run this public PR and send back a short report: recommendation, risks, missing tests and Conditions before merge.

Useful? If yes, I’ll send it over.

### 8. Local UK/Leeds/Manchester agency angle

Hey [name] - I’m based in the UK and testing Lintel with agencies shipping client work faster using coding agents.

The product creates a merge-readiness report for PRs: risks, missing tests, operational readiness and Conditions before merge.

If your team has a public PR or anonymised diff, I’d be happy to run it and share the report.

### 9. Follow-up after no reply

Quick follow-up. The ask is simple: send me one hard public PR or anonymised diff, and I’ll return a merge-readiness report.

If the Conditions before merge are not useful, that is useful feedback too.

### 10. Follow-up after sending a report

Sent the Lintel report for [repo] / [PR link].

The top condition was: [condition]

Two questions:

1. Would you paste any of this into the PR discussion?
2. What did the report get wrong or overstate?

### 11. Conversion from free pilot to paid founding pilot

You’ve now run Lintel on [number] real PRs.

If it is helping with review decisions, I’d like to move you to the Founding Team Pilot: £99/month for 3 months, then £199/month, cancel anytime.

You’d get onboarding, direct feedback loop and roadmap influence while I keep improving the workflow around your use cases.

### 12. Polite close-the-loop

Closing the loop here. I’m going to focus on teams that can run Lintel on real PRs over the next few weeks.

If review bottlenecks become painful or you have a hard PR to test, send it over and I’ll run the report.

No pressure.

## Demo call scripts

### Tech lead 20-minute demo

Opening question:

- “Where does PR review currently slow down: missing tests, senior availability, operational risk, or confidence in generated code?”

What to show:

1. `/new` with sample picker and public GitHub PR import.
2. Risky provider sample.
3. Decision Gate and Conditions before merge.
4. Findings with provenance.
5. Test plan and operational readiness.
6. Workspace Risk inbox.
7. Copy conditions into a mock PR comment.

Where to pause:

- After Conditions before merge: “Would these be enforceable in your PR process?”
- After Test plan: “Are these specific enough, or too generic?”
- After workspace: “Would this help you track what is blocked?”

Feedback ask:

- “What would you ignore?”
- “What is missing before this is useful weekly?”

Closing ask:

- “Can we run this on two real PRs from your team this week?”

Follow-up message:

> Thanks for the call. I’ll send a report for [PR/link] and I’m especially looking for feedback on false positives, missing conditions and whether you would paste the conditions into the PR.

### Agency director 25-minute demo

Opening question:

- “How do you currently show clients that AI-assisted work has been reviewed properly before delivery?”

What to show:

1. TESTS_REQUIRED report.
2. Conditions before merge.
3. Download Markdown.
4. Workspace Risk inbox.
5. Evaluation results.

Where to pause:

- “Would this help show review diligence to a client?”
- “Would the Markdown export be enough for your current workflow?”

Feedback ask:

- “What review profiles would match your client work?”
- “What would need to be private or branded before using this?”

Closing ask:

- “Can we test this on one active or recent client PR?”

Follow-up message:

> I’ll send the report and a Markdown export. The main question is whether it helps your team/client see what must be true before merge.

### Skeptical senior engineer 15-minute demo

Opening question:

- “What would make a tool like this untrustworthy for you?”

What to show:

1. Clean APPROVE report staying quiet.
2. Risky TESTS_REQUIRED report escalating with specific conditions.
3. Provenance labels.
4. Report quality checks.
5. Limitations.

Where to pause:

- “Is this finding evidence enough without line-level hunks?”
- “Which condition would you delete?”

Feedback ask:

- “What false positive would make you stop using this?”
- “What should it never claim?”

Closing ask:

- “Can you send one PR where you expect the report to fail?”

Follow-up message:

> Thanks for pressure-testing it. I’m going to use your feedback to tighten [specific issue]. If you have another hard PR, send it.

### Technical founder 15-minute demo

Opening question:

- “Are coding agents helping you ship faster, or mostly creating more review work?”

What to show:

1. Start from public PR import or sample.
2. Report recommendation.
3. Conditions before merge.
4. Copy summary / Download Markdown.
5. Workspace Risk inbox.

Where to pause:

- “Would this change whether you approve the PR?”
- “Would you pay for this before private repo support?”

Feedback ask:

- “What is the first missing integration?”
- “What would make this worth £99/month?”

Closing ask:

- “Can we run it on five of your real PRs over the next two weeks?”

Follow-up message:

> Good to speak. I’ll set up the free structured pilot around five real PRs and collect feedback on the report, conditions and missing integrations.

## Feedback questions

1. Which Conditions before merge would you enforce?
2. Which condition would you delete?
3. Which finding would you ignore?
4. Which finding feels unsupported?
5. What risk did the report miss?
6. What risk did the report overstate?
7. Would you paste the conditions into a real PR discussion?
8. Would you paste the full Markdown report anywhere?
9. Did the report make the merge decision clearer?
10. Did the risk band match your intuition?
11. Were the suggested tests specific enough?
12. Was operational readiness useful or noisy?
13. Was reviewer focus useful or too broad?
14. Did provenance labels increase trust?
15. What would make this worth paying for?
16. What is missing before using it weekly?
17. What would make a GitHub Action necessary?
18. What private repo support would you require?
19. What false positive would make you stop using it?
20. What false negative would be unacceptable?

## Pilot conversion scripts

### Free structured pilot invitation

I’m offering a 30-day structured pilot for first serious users.

The ask: run Lintel on real PRs, paste Conditions before merge into at least one PR where useful, and do a weekly 20-minute feedback call.

No payment required for this first pilot. The goal is to learn whether it helps with real merge decisions.

### Founding Team Pilot

You’ve got a real review bottleneck and have run enough reports to judge the workflow.

The Founding Team Pilot is £99/month for 3 months, then £199/month, cancel anytime.

It includes onboarding, direct feedback loop and roadmap influence. The goal is to shape Lintel around your real PR process while keeping the price low for early teams.

### Agency Design Partner

For agencies, I’m offering an Agency Design Partner pilot at £249/month.

It includes pilot support, direct feedback and optional custom review-profile input. The goal is to help you demonstrate review diligence on client work shipped with coding agents.

### Conversion after 5+ real PR reports

You’ve now run Lintel on 5+ real PRs.

If the reports have helped clarify merge decisions, the next step is a paid pilot so I can support the workflow properly and prioritise the missing pieces you need.

Would Founding Team Pilot or Agency Design Partner fit better?

### Handling “not ready to pay yet”

That is fine. If it is not clearly useful yet, it should not be a paid pilot.

The best next step is to run it on 2-3 more hard PRs and identify what is missing. If the gap is fixable and the reports start affecting review decisions, we can revisit paid pilot.

## Objection handling

### How is this different from CodeRabbit?

Lintel is focused on merge readiness rather than code comments. It gives a recommendation, risk band, missing tests, operational readiness, reviewer focus and Conditions before merge. Use it alongside code review tools.

### Is this just an LLM wrapper?

No. Lintel starts with deterministic baseline checks, then optionally uses model-assisted analysis. The report is normalized, guarded, quality-checked and falls back to the baseline when provider output fails.

### Why not just prompt Claude?

Prompting Claude can help, but it is not a repeatable workflow. Lintel gives a stable report structure, deterministic fallback, risk-specific conditions, provenance, report quality checks, local history and Markdown export.

### No private repos?

Not yet. The pilot supports public GitHub PRs and pasted diffs. Private repo support likely comes through a GitHub App or GitHub Action after enough pilot feedback.

### Will it slow us down?

It should not add a new ceremony. The workflow is: generate report, review conditions, paste what matters. The goal is to reduce uncertainty on risky PRs, not block every change.

### What if it misses something?

It can miss things. Lintel does not replace human review, tests, CI or security review. It is a structured second pass for merge-readiness risks and missing evidence.

### Why pay while it is early?

Only pay if the reports are already helping with real review decisions. Early paid pilots get roadmap influence, support and pricing certainty.

### We already use Cursor/Copilot/Claude Code.

That is the point. Those tools help create code. Lintel helps decide what is ready to merge after those tools produce a PR.

### We do not want to upload code.

Fair. Current safest options are public PRs or anonymised diffs. Private repo and controlled execution options are roadmap items, not current claims.

### Can it run in GitHub?

Not yet. Current workflow is app-based with public PR import or pasted diffs. A GitHub Action or GitHub App is likely if pilots prove the report is useful.

## First 30-target workflow

Build a simple target list:

- 10 tech leads / staff engineers.
- 10 agencies.
- 5 AI-heavy startup founders.
- 5 technical founders / indie hackers.

Capture in a spreadsheet:

- name;
- role;
- company;
- segment;
- source;
- public PR link if available;
- pain signal;
- message sent;
- response;
- next step;
- notes.

Prioritise people with visible review bottlenecks, public PRs, agency delivery pressure or public usage of coding agents.

## Weekly metrics

Track:

- X posts published;
- DMs sent;
- replies;
- public PR reports generated;
- calls booked;
- free pilots started;
- reports run by pilots;
- conditions copied / Markdown exported where manually known;
- paid pilots;
- top objection of the week;
- product change from feedback.

Manual tracking is enough at this stage.

## 30-day distribution plan

### Week 1: proof and first messages

- Run Lintel on 10 real public PRs.
- Capture the 5 best report examples.
- Publish or refresh evaluation page.
- Prepare public pilot link.
- Build the first 30-target list.
- Send first 5 evidence-first DMs.
- Publish 3 X posts: one artifact, one lesson, one ask-for-hard-PR.

### Week 2: conversations

- Send 10 more DMs.
- Book 5 calls.
- Start free structured pilots.
- Post one report artifact and one learning from conversations.
- Track objections and missing features.

### Week 3: active pilots and feedback loop

- Get 5 active pilots.
- Run weekly feedback calls.
- Ship 2 small feedback-driven improvements.
- Ask each pilot whether they would paste Conditions before merge into a real PR.
- Publish one anonymised learning note.

### Week 4: first paid conversions

- Identify the 1-2 most engaged pilots.
- Offer Founding Team Pilot or Agency Design Partner.
- Publish first-month learning note.
- Decide whether private repo/GitHub Action work is now justified.
- Keep collecting hard PRs.

## Final reminder

Lead with the artifact:

> Here are the Conditions before merge for this PR.

If that is useful, the product has a path. If it is not useful, the right work is product quality, not more positioning.
