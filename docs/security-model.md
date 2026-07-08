# Lintel security model

Lintel is a merge-readiness system for pull requests.

It helps engineering teams decide whether pull requests are safe, tested, operationally ready and ready to merge.

This document explains the current privacy model, current limitations and planned GitHub Action direction. It is written for technical buyers, staff engineers, CTOs, agency technical directors and pilot users.

## Summary

Lintel currently supports:

- public GitHub PR import;
- pasted diffs;
- generated merge-readiness reports;
- browser-local report history.

The current app is local-first in the browser. It does not have authentication, team accounts, a team database or hosted report sharing.

Lintel does not save raw diffs in local report history. Raw diffs are used transiently to generate a report, then the stored artifact is the generated report and metadata.

The planned private repository path is a GitHub Action that runs inside the customer’s own GitHub Actions runner. The v1 GitHub Action plan avoids hosted diff processing: no hosted Lintel API receives customer diffs, and no Lintel server stores customer code.

## What Lintel handles today

Today, Lintel can handle:

- public GitHub PR URLs;
- pasted diffs;
- generated merge-readiness reports;
- report metadata such as title, repository, risk band, recommendation, source label and review profile;
- browser-local report history;
- browser-local condition progress;
- browser-local workspace status;
- Markdown exports;
- copied summaries and copied Conditions before merge.

The current product is not a private repository integration, hosted review system or enterprise admin product.

## Raw diff handling today

Raw diffs may be used transiently to generate a report.

Current privacy expectations:

- raw diffs are not saved in local report history;
- raw diffs are not included in exported Markdown;
- raw diffs should not appear in copied summaries;
- raw diffs should not appear in copied Conditions before merge;
- raw diff markers such as `diff --git` and `@@` should not appear in reports, local history, copied output or exported Markdown.

The generated report may contain file paths, risk summaries, findings, suggested tests, reviewer focus and Conditions before merge. It should not contain raw patch hunks.

## Local-first storage

Reports are stored on the user’s device through browser storage.

Current browser-local storage includes:

- the current report envelope in `sessionStorage`;
- recent report history in `localStorage`;
- condition progress in `localStorage`;
- local workspace status in `localStorage`.

Clearing report history removes local report history from the browser. It does not create or delete any server-side records because no team database exists yet.

Current non-features:

- no team database;
- no hosted report sharing;
- no server-side workspace;
- no central audit log;
- no cross-user report state.

## Model-assisted mode

Lintel has deterministic baseline behaviour and may use model-assisted synthesis when configured.

The deterministic baseline is the safety floor:

- baseline findings must not be suppressed by model output;
- model output should not downgrade risk in a way that erases concrete rule-detected findings;
- model output should not remove missing tests or merge conditions that the baseline found;
- normalization and report-quality checks are used to keep the final report internally consistent.

Findings can include provenance labels such as:

- `Rule detected`;
- `Model assisted`.

These labels help users understand whether a finding came from deterministic checks or model-assisted synthesis.

Model quality depends on provider availability, provider behaviour and configuration. Lintel does not claim that model-assisted output catches every issue or cannot be wrong.

When model-assisted analysis is enabled in the current web app, the submitted diff is sent to the configured provider for analysis. Do not submit secrets, credentials, private source code or sensitive production data to a provider unless you are allowed to do so under your organization’s policies.

## Planned GitHub Action security model

The intended v1 GitHub Action architecture is:

```text
shared analysis core -> CLI -> thin GitHub Action wrapper
```

Planned behaviour:

1. The GitHub Action runs inside the customer’s GitHub Actions runner.
2. The Action fetches the PR diff inside that runner.
3. The CLI analyses the diff and generates a Markdown merge-readiness report.
4. The Action posts or updates one PR comment.
5. No hosted Lintel API receives customer diffs in v1.
6. No Lintel server stores customer code in v1.

The Action should be a thin wrapper around the CLI, not a separate analysis implementation. This keeps local, CI and web report behaviour closer together and reduces drift.

## Private repo nuance

The current web app does not import private repositories.

A GitHub Action can still run on private repositories because it executes inside the customer’s own GitHub Actions environment using that repository’s token and permissions.

This is the preferred private repository path before building a GitHub App or hosted private repository import. It keeps code inside the customer’s CI environment and avoids requiring Lintel to receive proprietary diffs in v1.

## BYO model key

The planned Action should use the customer’s own model provider key when model-assisted mode is enabled.

Expected key handling:

- the key comes from repository secrets;
- the key is passed as an environment variable, not as a CLI flag;
- keys are never logged;
- no key means deterministic-only mode;
- deterministic-only mode is first-class, not treated as broken or degraded;
- v1 should not offer “use Lintel’s key”;
- v1 should support one provider first rather than complex multi-provider configuration.

## GitHub permissions

The planned Action should request minimal permissions.

Example:

```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
```

Permission intent:

- `contents: read` allows reading repository metadata and PR context as needed.
- `pull-requests: write` allows posting or updating one PR comment.
- `checks: write` is only needed if a neutral check-run is implemented.

No broad permissions should be required in v1.

## `pull_request` guidance

v1 should use `pull_request`.

v1 should not use `pull_request_target`.

`pull_request_target` can expose secrets to fork PR risks if misused. The Action should treat diffs as data. It should not execute, eval or import code from the PR head.

If configuration files are supported later, they should be read from the base branch, not from untrusted PR head content.

## Prompt injection and attacker-controlled diffs

PR diffs can contain attacker-controlled text.

Model-assisted analysis must treat diff content as data, not instructions.

Safety expectations:

- deterministic baseline is the safety floor;
- model output must never suppress rule-detected findings;
- model output should not upgrade or downgrade recommendations beyond deterministic guardrails;
- future evaluations should include prompt-injection attempts inside diffs.

Examples of future evaluation cases:

- a diff comment telling the model to ignore security concerns;
- a test fixture containing prompt-like instructions;
- a README change asking the model to approve the PR regardless of findings.

## Secret leakage protection

Planned Action protections should include:

- do not quote raw diff lines in PR comments by default;
- scrub common secret patterns before anything reaches comments or logs;
- avoid logging raw diffs;
- keep PR comments raw-diff-free;
- keep `diff --git` and `@@` markers out of generated comments;
- fail safely or report partial analysis when diff-size limits are exceeded.

The current web report, copied summaries, copied conditions and Markdown export should also remain raw-diff-free.

## Current limitations

Current limitations are intentional and should be communicated plainly:

- no authentication;
- no team accounts;
- no private repository web import;
- no GitHub App;
- no CI integration yet;
- no hosted report sharing;
- no SOC 2;
- no SSO;
- no RBAC;
- no central audit logs;
- no enterprise admin console;
- no line-level diff hunk evidence yet.

Lintel does not catch every bug. It does not replace human review, CI, tests or security review.

## Security checklist

### Exists today

- Raw diffs are not saved in local report history.
- Current reports are stored locally in browser storage.
- Condition progress is stored locally.
- Local workspace status is stored locally.
- Findings can show provenance labels.
- Markdown exports avoid raw diff markers.
- Copied summaries and copied conditions are intended to be raw-diff-free.
- Clean `APPROVE` reports are restrained and should not invent generic review work.

### Planned for GitHub Action v1

- CLI-first Action.
- Action runs inside the customer’s GitHub Actions runner.
- No hosted diff processing.
- BYO model key through repository secrets.
- Deterministic-only mode without a model key.
- One PR comment only, updated on new commits.
- No `pull_request_target`.
- Minimal GitHub permissions.
- Raw-diff-free PR comment output.

### Later

- GitHub App.
- Team policies.
- Hosted team workspace.
- Private repository SaaS import if justified.
- Enterprise admin controls.
- Formal compliance work.
- Stronger auditability.
- More security review around hosted code processing.

## FAQ

### Do you store our code?

The current browser app does not save raw diffs in local report history. It stores generated reports and metadata locally in browser storage. If model-assisted analysis is enabled, the submitted diff is sent to the configured provider for analysis.

The planned v1 GitHub Action avoids hosted Lintel diff processing: customer diffs stay inside the customer’s GitHub Actions runner unless the customer enables model-assisted analysis with their own provider key.

### Can Lintel work with private repos?

The current web app does not import private repositories.

The planned private repository path is a GitHub Action that runs inside the customer’s CI environment. That can support private repositories before Lintel builds a GitHub App or hosted private import.

### Does Lintel need a model key?

No. Deterministic-only mode should remain first-class.

Model-assisted mode can add synthesis and prioritization when configured, but deterministic baseline checks and guardrails remain central to the product.

### What happens without a model key?

Lintel falls back to deterministic baseline reporting. In the planned Action, no model key should mean deterministic-only mode.

### Does Lintel replace code review?

No. Lintel is a merge-readiness decision artifact. It supports human review by surfacing recommendation, risks, missing tests, operational readiness, reviewer focus and Conditions before merge.

### Will Lintel catch every bug?

No. Lintel can miss things and can classify risk incorrectly. It does not replace tests, CI, security review or senior engineering judgment.

### Can it block merges?

The current product does not block merges. The planned GitHub Action should start by posting or updating one PR comment. Blocking checks should only be opt-in later after a team trusts the report quality.

### Is this enterprise ready?

No. Lintel does not currently have SOC 2, SSO, RBAC, audit logs, enterprise admin, team accounts or a hosted team workspace.

The current stage is pilot preparation and validation of the merge-readiness artifact.
