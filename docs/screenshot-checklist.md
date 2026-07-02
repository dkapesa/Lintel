# Lintel screenshot checklist

Use sample or public data only. Before capture, hide browser developer tools, notifications, local file paths, environment values, and unrelated tabs. Prefer a consistent desktop viewport and capture one narrow-screen example separately if useful.

## 1. `/new` sample picker

- Show the Lintel header, **Load sample** picker, and report fields.
- Open the picker so the scenario library is visible.
- Use a clean crop with no real diff, secret, or private repository data.
- Suggested caption: “Repeatable PR risk scenarios for fast product demos and evaluation.”

## 2. Public GitHub PR import

- Show a public PR URL and the **Fetch diff** action.
- Prefer the compact success state after repository, title, and diff populate.
- Ensure the imported repository is public and suitable for portfolio use.
- Suggested caption: “Strict public GitHub PR import with editable context before analysis.”

## 3. Clean APPROVE report

- Generate **Clean utility change**.
- Capture `APPROVE`, `LOW`, **Ready to merge**, source badge, and **Checks passed**.
- Include the positive empty state for suggested tests if it fits naturally.
- Suggested caption: “Lintel can approve a focused, tested change without manufacturing risk.”

## 4. Risky TESTS_REQUIRED report

- Generate **Provider failure / retry risk**.
- Capture `TESTS_REQUIRED`, `HIGH`, **What needs attention**, and specific findings.
- Include missing tests or conditions before merge.
- Suggested caption: “Risk-specific evidence and tests required before merge.”

## 5. Operational readiness

- Capture failure modes, detection signals, observability gaps, recovery/rollback, and customer/data impact.
- Use the risky provider sample so `ATTENTION` is visible.
- Avoid a crop containing only generic empty states.
- Suggested caption: “Operational risk is assessed alongside code-level findings.”

## 6. Reviewer focus

- Capture at least two evidence-supported areas, such as Backend reliability and API contract.
- Include priority badges and reasons.
- Confirm no person, team, or unsupported Payments/domain area appears.
- Suggested caption: “Evidence routes attention to engineering disciplines without assigning people.”

## 7. Report quality checks

- Primary screenshot: a valid report showing **Checks passed**.
- Optional secondary screenshot: a controlled malformed fixture showing a concise warning.
- Never manufacture a warning using private or unsafe content.
- Suggested caption: “The generated report is checked for consistency before sharing.”

## 8. Copy summary

- Show the **Copy summary** button in its temporary **Copied** state.
- Optionally pair it with a cropped Markdown preview in a neutral editor.
- Confirm source, input source, recommendation, risk, operational readiness, reviewer focus, quality status, and conditions are concise.
- Search the copied text for raw patch markers and secret-like values before capture.
- Suggested caption: “Concise Markdown output for validation, handoff, and review conversations.”

## Final capture QA

- Product name is **Lintel** everywhere visible.
- Recommendation heading matches the badge.
- Source and input-source labels are accurate.
- No empty list, unsupported reviewer focus, raw diff, credential, or personal data is visible.
- Text is readable at portfolio size and the browser chrome is consistently cropped.
- Filenames are ordered clearly, for example `01-new-samples.png` through `08-copy-summary.png`.
