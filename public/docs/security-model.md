# Lintel security model

Lintel is a merge-readiness system for pull requests. It helps engineering teams decide whether pull requests are safe, tested, operationally ready and ready to merge.

This public copy summarizes the current security model and planned private-repo direction.

## Current model

Lintel currently supports:

- public GitHub PR import;
- pasted diffs;
- generated merge-readiness reports;
- local report history in browser storage;
- local condition progress;
- copied summaries and Conditions before merge;
- Markdown export.

The current app is local-first in the browser. It does not have auth, team accounts, a team database, hosted report sharing or private repository web import.

## Raw diff handling

Raw diffs may be used transiently to generate a report.

Current privacy expectations:

- raw diffs are not saved in local report history;
- raw diffs are not included in exported Markdown;
- raw diffs should not appear in copied summaries or copied Conditions before merge;
- raw diff markers such as `diff --git` and `@@` should not appear in reports, history or exports.

Generated reports may contain file paths, risk summaries, findings, suggested tests, reviewer focus and Conditions before merge. They should not contain raw patch hunks.

## Local-first storage

Browser storage is used for:

- the current report envelope in `sessionStorage`;
- recent report history in `localStorage`;
- condition progress in `localStorage`;
- local workspace status in `localStorage`.

Clearing report history removes local report history from the browser. There is no server-side team database today.

## Model-assisted mode

Lintel creates a deterministic baseline first. Model-assisted analysis may add synthesis when configured.

The deterministic baseline is the safety floor:

- baseline findings should not be suppressed by model output;
- model output should not erase rule-detected findings;
- model output should not remove missing tests or merge conditions found by the baseline.

Findings can show provenance labels such as `Rule detected` and `Model assisted`.

When model-assisted analysis is enabled, the submitted diff is sent to the configured provider for analysis. Do not submit secrets, credentials, private source code or sensitive production data unless allowed by your organization’s policies.

## Planned GitHub Action direction

The planned private-repo path is a GitHub Action that runs inside the customer’s own GitHub Actions runner.

Planned v1 architecture:

```text
shared analysis core -> CLI -> thin GitHub Action wrapper
```

The intended v1 model:

- the Action fetches the PR diff inside the customer runner;
- the CLI generates a Markdown merge-readiness report;
- the Action posts or updates one PR comment;
- no hosted Lintel API receives customer diffs in v1;
- no Lintel server stores customer code in v1.

This is the preferred private-repo path before a GitHub App or hosted private repository import.

For the concise developer-facing workflow, see the [CLI and GitHub Action blueprint](cli-github-action-blueprint.md).

## GitHub permissions

Planned minimal permissions:

```yaml
permissions:
  contents: read
  pull-requests: write
  checks: write
```

`checks: write` is only needed if a neutral check-run is implemented.

The v1 Action should use `pull_request`, not `pull_request_target`, and should treat diffs as data. It should not execute, eval or import code from the PR head.

## Current limitations

Lintel currently has:

- no auth;
- no team accounts;
- no private repo web import;
- no GitHub App;
- no CI integration yet;
- no hosted report sharing;
- no SOC 2;
- no SSO;
- no RBAC;
- no central audit logs;
- no enterprise admin console;
- no line-level diff hunk evidence yet.

Lintel does not catch every bug and does not replace human review, CI, tests or security review.

## FAQ

### Do you store our code?

The current browser app does not save raw diffs in local report history. It stores generated reports and metadata locally in browser storage. If model-assisted analysis is enabled, the submitted diff is sent to the configured provider.

### Can Lintel work with private repos?

The current web app does not import private repositories. The planned private repository path is a GitHub Action that runs inside customer CI.

### What happens without a model key?

Lintel uses deterministic baseline reporting. Deterministic-only mode should remain first-class.

### Does Lintel replace code review?

No. Lintel supports human review by surfacing recommendation, risks, missing tests, operational readiness, reviewer focus and Conditions before merge.
