# Lintel screenshot checklist

Use sample or public data only. Before capture, hide browser developer tools, notifications, local file paths, environment values, and unrelated tabs. Prefer a consistent desktop viewport and capture one narrow-screen example separately if useful.

Recommended output folder:

```text
outputs/screenshots/
```

## 1. Homepage positioning

- Capture the hero with the headline **Decide what is ready to merge**.
- Include the report artifact card if visible.
- Keep the primary CTA and secondary report CTA in frame.
- Suggested filename: `01-homepage.png`
- Suggested caption: "Agents create code. Lintel decides what is ready to merge."

## 2. Risk inbox workspace

- Show `/workspace` with the dark app shell, triage strip, grouped rows, and selected preview panel.
- Include at least one Needs attention report and one Ready report if local history allows.
- Show local-first/privacy copy if it fits.
- Suggested filename: `02-workspace-risk-inbox.png`
- Suggested caption: "A local merge-readiness inbox for tracking what is blocked, ready, or waiting on review."

## 3. New report working surface

- Show `/new` with the GitHub PR import, sample picker, review profile, and pasted diff area.
- Use public/sample data only.
- Avoid displaying a full raw diff in the screenshot if a compact state is available.
- Suggested filename: `03-new-report.png`
- Suggested caption: "Import a public PR, paste a diff, or load a repeatable sample before generating a report."

## 4. Public GitHub PR import

- Show a public PR URL and the **Fetch diff** action.
- Prefer the compact success state after repository, title, and inferred language/framework populate.
- Ensure the imported repository is public and suitable for portfolio use.
- Suggested filename: `04-github-import.png`
- Suggested caption: "Public GitHub PR import with editable context before analysis."

## 5. Clean APPROVE report

- Generate **Clean utility change**.
- Capture `APPROVE`, `LOW`, **Ready to merge**, source label, and **Checks passed**.
- Include the calm Test plan empty states if they fit naturally.
- Suggested filename: `05-approve-report.png`
- Suggested caption: "Lintel can approve a focused, tested change without manufacturing risk."

## 6. Risky TESTS_REQUIRED report

- Generate **Provider failure / retry risk**.
- Capture `TESTS_REQUIRED`, `HIGH`, **What needs attention**, and the sticky decision panel.
- Include Conditions before merge and at least one specific finding.
- Suggested filename: `06-tests-required-report.png`
- Suggested caption: "Risk-specific conditions and tests required before merge."

## 7. Conditions before merge

- Capture the Decision Gate section.
- Show deduped, specific conditions and local condition progress.
- If possible, show the **Copy conditions** action in its copied state.
- Suggested filename: `07-conditions-before-merge.png`
- Suggested caption: "A PR-ready checklist of what must be proven before merge."

## 8. Operational readiness

- Capture failure modes, detection signals, observability gaps, recovery/rollback, and customer/data impact.
- Use the risky provider sample so `ATTENTION` is visible.
- Avoid a crop containing only generic empty states.
- Suggested filename: `08-operational-readiness.png`
- Suggested caption: "Operational risk is assessed alongside code-level findings."

## 9. Reviewer focus

- Capture evidence-supported areas, such as Backend reliability, API contract, Security/privacy, or Platform/observability.
- Include priority badges and concise reasons.
- Confirm no unsupported Payments/domain focus appears for frontend/docs-only PRs.
- Suggested filename: `09-reviewer-focus.png`
- Suggested caption: "Reviewer attention is routed to the disciplines that matter for the change."

## 10. Report quality checks

- Primary screenshot: a valid report showing **Checks passed**.
- Optional secondary screenshot: a controlled malformed fixture showing a concise warning.
- Never manufacture a warning using private or unsafe content.
- Suggested filename: `10-report-quality.png`
- Suggested caption: "The generated report is checked for consistency before sharing."

## 11. Markdown and summary export

- Show **Copy summary** or **Download Markdown** near the report decision panel.
- Optionally pair it with a cropped Markdown preview in a neutral editor.
- Confirm source, input source, recommendation, risk, operational readiness, reviewer focus, quality status, and conditions are concise.
- Search the copied/downloaded text for raw patch markers and secret-like values before capture.
- Suggested filename: `11-markdown-export.png`
- Suggested caption: "Concise Markdown output for handoff, validation, and review conversations."

## 12. Security model documentation

- Capture `/docs/security-model.md` or the rendered public security model if viewed through the browser.
- Include sections covering local-first storage, raw diff handling, model-assisted mode, or planned GitHub Action direction.
- Suggested filename: `12-security-model.png`
- Suggested caption: "Current privacy boundaries and planned private-repo direction are documented explicitly."

## Narrow-screen QA capture

- Capture either `/workspace` or `/report` on a narrow viewport.
- Confirm no horizontal overflow.
- Confirm long conditions wrap cleanly.
- Confirm decision actions remain reachable.
- Suggested filename: `13-mobile-workspace-or-report.png`

## Final capture QA

- Product name is **Lintel** everywhere visible.
- Positioning clearly communicates merge readiness, not generic AI code review.
- Recommendation heading matches the badge.
- Risk band is visually primary; score detail is secondary.
- Source and input-source labels are accurate.
- Conditions before merge are specific and deduped.
- Clean APPROVE reports do not invent generic review work.
- No empty list, unsupported reviewer focus, raw diff, credential, or personal data is visible.
- Text is readable at portfolio size and browser chrome is consistently cropped.
- Filenames are ordered clearly, for example `01-homepage.png` through `13-mobile-workspace-or-report.png`.
