# Lintel manual evaluation

## Purpose

Lintel helps engineering teams decide whether pull requests are safe, tested, operationally ready and ready to merge. This prototype combines deterministic local rules with an optional server-side model-assisted analysis route and always returns the existing typed report shape.

## Current prototype flow

1. Open `/new` and enter a PR title, repository, language/framework, and unified diff.
2. Select **Generate Report**.
3. The client sends the input to `POST /api/generate-report`.
4. The route creates a deterministic baseline, optionally attempts AI generation, and normalises the result.
5. If AI is unavailable or invalid, the route returns the deterministic report.
6. The client stores the returned report and its `ai` or `deterministic` source under `lintel.generatedReport.v1` in `sessionStorage`, then navigates to `/report`.
7. `/report` renders the generated report or the demo report when no generated report is available.

Run the app with `npm run dev` and use `http://localhost:3000/new`. Use browser developer tools to inspect the API response and session storage. Never paste a real secret into test evidence, screenshots, or this document.

## Report source visibility

- A successful AI response stores `{ report, source: "ai" }` and shows **Baseline + model-assisted**.
- An API or client-side deterministic fallback stores `{ report, source: "deterministic" }` and shows **Baseline only**.
- No generated report shows the bundled demo report with **Demo report**.
- Legacy bare Report objects remain readable and display **Baseline only** because their original source is unknown.
- Malformed storage is removed and the demo report is shown.

## Copy summary

Use **Copy summary** on `/report` to copy a concise Markdown report. Confirm the copied text follows the current report hierarchy: PR metadata, source label, recommendation, risk band before score detail, executive summary, Conditions before merge, findings, Test plan, operational readiness, reviewer focus, report quality and closing summary.

- Finding and test sections show at most five items, followed by `...and N more` when truncated.
- Conditions before merge are deduped and exported in full; they should not be truncated.
- Empty sections show `None detected`.
- The button temporarily shows `Copied` only after the browser clipboard or hidden-textarea fallback succeeds.
- If both copy methods fail, the button shows `Copy failed`.
- Raw diff markers, submitted patch lines and secret values must not appear in the copied Markdown.
- Verify all three source labels: `Baseline + model-assisted`, `Baseline only` and `Demo report`.

## Expected outcome matrix

| Case | Expected source | Recommendation | Expected risk level | Expected finding themes |
| --- | --- | --- | --- | --- |
| Clean change with tests | `deterministic` when AI is disabled | `APPROVE` | `LOW` | None; security, reliability, and maintainability reviews are clear |
| Risky change without tests | `deterministic` when AI is disabled | `TESTS_REQUIRED` | `HIGH` | Missing tests, duplicate side effects, provider failures, API error contract, sensitive logging |
| Risky change with tests | `deterministic` when AI is disabled | `REVIEW_REQUIRED` | `HIGH` | Duplicate side effects, provider failures, API error contract, sensitive logging; no generic missing-test finding |
| Missing API key fallback | `deterministic` | `TESTS_REQUIRED` | `HIGH` | Same themes as the risky change without tests |
| AI source | `ai` | `TESTS_REQUIRED` for the risky change without tests | `HIGH` | Semantically equivalent risk themes; exact wording may vary |

Risk levels are derived from the final score: `LOW` 0–30, `MEDIUM` 31–60, `HIGH` 61–80, and `CRITICAL` 81–100.

AI reports are normalised against the deterministic baseline. Concrete baseline findings, test gaps, suggested tests and merge conditions remain present even when the AI omits them. A baseline `ATTENTION` review cannot be downgraded to `CLEAR`. Untested changes have a minimum `MEDIUM` score, while a `HIGH` baseline with multiple concrete findings remains `HIGH` and can fall by no more than five points.

## Built-in demo scenario pack

Use the sample picker on `/new` for a fast V3.8 regression pass.

| Sample | Expected broad outcome | What it demonstrates |
| --- | --- | --- |
| Clean utility change | `APPROVE` / `LOW` / `CLEAR` | Small tested utility change with no invented work. |
| Provider failure / retry risk | `TESTS_REQUIRED` / `HIGH` / `ATTENTION` | Retry, duplicate side effects, provider failure, API contract and logging/privacy test gaps. |
| Auth/session change | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | Token/session handling and security review. |
| Database migration | `TESTS_REQUIRED` or `REVIEW_REQUIRED` | Migration compatibility, data safety and recovery expectations. |
| Payment/refund side effect | `TESTS_REQUIRED` | Payment/refund idempotency and repeat-safe side effects. |
| API contract change | `REVIEW_REQUIRED` | Tests exist, but client-facing response semantics still need focused review. |
| Logging/privacy risk | `REVIEW_REQUIRED` | Structured logging near identifiers and token context. |
| Frontend analytics/type change | `TESTS_REQUIRED` | Frontend/docs/API-consumer review without Payments/domain false positives. |

## Clean APPROVE test case

Use:

- PR title: `Normalize customer display names`
- Repository: `acme/profile-api`
- Language/framework: `Python / FastAPI`

```diff
diff --git a/app/utils/format_name.py b/app/utils/format_name.py
--- a/app/utils/format_name.py
+++ b/app/utils/format_name.py
@@ -1,2 +1,5 @@
+def format_name(first_name: str, last_name: str) -> str:
+    return f"{first_name.strip()} {last_name.strip()}".strip()

diff --git a/tests/test_format_name.py b/tests/test_format_name.py
--- a/tests/test_format_name.py
+++ b/tests/test_format_name.py
@@ -0,0 +1,5 @@
+from app.utils.format_name import format_name
+
+def test_format_name_trims_whitespace():
+    assert format_name(" Ada ", " Lovelace ") == "Ada Lovelace"
```

Expected:

- Recommendation: `APPROVE`
- Risk level: `LOW` (the deterministic score is 22; a valid AI score may vary within 0–30)
- Findings: none
- Missing tests: none
- Conditions before merge: none
- Review themes: neutral `CLEAR` copy only

## Shared risky discount-code diff

Use this diff for the next cases:

```diff
diff --git a/app/services/redemption_service.py b/app/services/redemption_service.py
--- a/app/services/redemption_service.py
+++ b/app/services/redemption_service.py
@@ -10,3 +10,16 @@
+try:
+    code = self.partner_client.fetch_discount_code(partner_id)
+except TimeoutError:
+    self.logger.warning("partner discount code timeout", extra={
+        "user_id": user_id,
+        "partner_id": partner_id,
+    })
+    code = self.partner_client.fetch_discount_code(partner_id)
+
+return self.repository.create_redemption(
+    user_id=user_id,
+    partner_id=partner_id,
+    code=code,
+)

diff --git a/app/clients/partner_code_client.py b/app/clients/partner_code_client.py
--- a/app/clients/partner_code_client.py
+++ b/app/clients/partner_code_client.py
@@ -8,3 +8,9 @@
+if response.status_code >= 500:
+    raise PartnerProviderError("provider unavailable")
+if response.status_code == 408:
+    raise TimeoutError("provider timeout")
+if not response.json().get("code"):
+    raise PartnerProviderError("empty discount code response")

diff --git a/app/api/redemptions.py b/app/api/redemptions.py
--- a/app/api/redemptions.py
+++ b/app/api/redemptions.py
@@ -20,3 +20,8 @@
+return JSONResponse(
+    status_code=503,
+    content={
+        "error_code": "discount_code_unavailable",
+        "retryable": True,
+    },
+)
```

Use this metadata:

- PR title: `Add fallback handling for failed discount-code retrieval`
- Repository: `acme/redemption-api`
- Language/framework: `Python / FastAPI`

## Risky TESTS_REQUIRED test case

Submit the shared risky diff without adding a test file.

Expected:

- Recommendation: `TESTS_REQUIRED`
- Risk level: `HIGH` (the deterministic score is 78; the current AI guardrail floor is 73)
- Finding themes:
  - Risk-specific tests are missing
  - Retry behaviour may duplicate redemptions or discount codes
  - External provider timeout, 5xx, unavailable, or empty-response handling needs review
  - The client-facing API error contract needs review
  - Structured logging of identifiers or discount-code data needs review
- Conditions include focused tests plus reliability, API-contract, and logging checks

## Risky REVIEW_REQUIRED test case

Append this test-file change to the shared risky diff:

```diff
diff --git a/tests/test_redemption_service.py b/tests/test_redemption_service.py
--- a/tests/test_redemption_service.py
+++ b/tests/test_redemption_service.py
@@ -0,0 +1,4 @@
+def test_provider_timeout_returns_retryable_error():
+    result = redeem_after_provider_timeout()
+    assert result.status_code == 503
+    assert result.body["retryable"] is True
```

Expected:

- Recommendation: `REVIEW_REQUIRED`
- Risk level: `HIGH` (the deterministic score is 64; the current AI guardrail floor is 61)
- Findings remain for duplicate side effects, provider failures, API error contracts, and sensitive logging
- No generic missing-test finding and no missing-tests list
- Conditions require focused human review rather than a generic instruction to add tests
- Production-risk evidence must not list `tests/test_redemption_service.py` as a relevant production file

## Missing API key fallback test

1. Confirm `.env.local` is absent and `OPENAI_API_KEY` and `OPENAI_MODEL` are unset. Do not print environment values.
2. Restart `npm run dev` so the server uses that environment.
3. Submit the shared risky diff without a test file.
4. Inspect the `POST /api/generate-report` response.

Expected:

- HTTP status: `200`
- Response source: `deterministic`
- Source badge: `Baseline only`
- A complete `report` object is returned
- Recommendation: `TESTS_REQUIRED`
- Risk level: `HIGH`
- Finding themes match the risky TESTS_REQUIRED case
- The UI navigates to `/report` and renders the returned report

Deterministic fallback summaries may state that findings were generated using **Lintel's local prototype rules**. This is expected prototype copy.

## AI source test

1. Use an ignored local environment file with evaluator-owned test credentials. Do not commit it or record its values:

   ```text
   OPENAI_API_KEY=<test-key>
   OPENAI_MODEL=<configured-model>
   ```

2. Restart `npm run dev` after setting the environment.
3. Submit the shared risky diff without a test file.
4. Inspect the `POST /api/generate-report` response.

Expected:

- HTTP status: `200`
- Response source: `ai`
- Source badge: `Baseline + model-assisted`
- The result matches the existing Report shape
- Submitted PR metadata and changed files are preserved
- Recommendation: `TESTS_REQUIRED`
- Risk level: `HIGH`
- Findings cover missing tests, duplicate side effects, provider failures, API error contracts, and sensitive logging; wording may differ from the deterministic report
- If the response source is `deterministic`, the AI attempt failed or could not be normalised, so this case has not passed even though fallback worked

Remove the local environment file after testing if it is no longer needed.

## Privacy check

Perform this check once with AI disabled and once with AI enabled:

1. Add a unique harmless comment to the submitted diff, such as `UNIQUE_DIFF_MARKER_<timestamp>`.
2. Submit the form and inspect the `POST /api/generate-report` response body.
3. Confirm the response contains only the report and source metadata, not the raw patch.
4. In browser developer tools, inspect `sessionStorage` key `lintel.generatedReport.v1`.
5. Search the stored JSON for the unique marker, `diff --git`, hunk headers such as `@@`, and exact added code lines.

Expected:

- The unique marker is absent from the API response and session storage
- The raw diff is absent from the API response and session storage
- Only the returned Report and its `ai` or `deterministic` source metadata are stored in `lintel.generatedReport.v1`
- Changed filenames and concise evidence terms may appear in the report; that is expected and is not raw-diff storage
- No raw diff or secret value appears in server or browser logs

## Public GitHub PR URL import

Lintel can import the diff for a public GitHub pull request before report generation. The supported format is:

```text
https://github.com/<owner>/<repository>/pull/<positive-number>
```

`www.github.com` is also accepted. Private repositories, GitHub authentication, query-dependent URLs, fragments, custom ports and additional path segments are not supported.

### Import flow

1. Open `/new`.
2. Paste a supported public pull request URL into **Public GitHub PR URL**.
3. Select **Fetch diff**.
4. Confirm the repository and diff fields are populated.
5. Confirm the title is populated when unauthenticated GitHub metadata is available. Metadata failure must not block a successful diff import.
6. Add or confirm the language/framework and edit any imported field if needed.
7. Select **Generate Report** and confirm the existing report flow works normally.

Fetching a diff must not submit the report, navigate away from `/new`, or call `/api/generate-report`.

### Import privacy and storage expectations

- The server fetches only reconstructed `github.com` and `api.github.com` URLs derived from validated PR coordinates.
- The raw diff is returned to the current form so the user can review and edit it.
- The import response must use `Cache-Control: no-store`.
- Raw diffs and secret values must not be written to server or browser logs.
- Importing alone must not write the raw diff to session storage.
- After generation, `lintel.generatedReport.v1` must still contain only `{ report, source }`, without the raw diff.

### Manual import tests

- Import a valid public PR and confirm repository, diff and available title metadata are populated.
- Confirm all populated fields remain editable.
- Confirm **Fetch diff** has compact loading, success and error states.
- Confirm the built-in sample picker and manual paste still work after importing.
- Generate an imported PR and confirm `/report`, source badges and **Copy summary** still work.
- Confirm an imported diff larger than `MAX_DIFF_CHARS` returns HTTP `413`.
- Confirm an empty or non-diff GitHub response is rejected.
- Confirm keyboard access, mobile layout and no console errors.

### Import failure cases

Expect a safe inline error without clearing existing form values for:

- Non-HTTPS URLs or non-GitHub hosts
- GitHub URLs containing credentials, custom ports, query parameters or fragments
- Malformed PR paths, zero or negative PR numbers, and additional path segments
- Missing, private or inaccessible pull requests
- GitHub rate limits
- Oversized diffs
- Upstream timeout, network failure or invalid diff content

## Operational readiness evaluation

Every newly generated report should include an **Operational readiness** section after Engineering Review. It covers failure modes, detection signals, observability gaps, recovery or rollback, customer or data impact, and owner or reviewer focus.

Operational readiness rules:

- Detection and recovery controls must be tied to evidence in the submitted diff.
- Gaps should appear only when risky behavior exists without a matching control.
- Reports must not invent dashboards, alerts, owners, rollback mechanisms, incidents or customer impact.
- Deterministic `ATTENTION` cannot be downgraded to `CLEAR` by AI output.
- Missing tests continue to produce `TESTS_REQUIRED`.
- Tests present with operational `ATTENTION` produce `REVIEW_REQUIRED`.
- `APPROVE` requires operational readiness to be `CLEAR`.
- Operational rules do not produce `BLOCK`.

### Clean operational readiness test

Generate the **Clean utility change** sample.

Expected:

- Recommendation: `APPROVE`
- Operational readiness: `CLEAR`
- No failure modes, observability gaps, recovery gaps, customer/data impact or additional owner focus
- Neutral empty-state copy is shown for empty operational areas
- The clean change is not penalized for lacking metrics, alerts or rollback controls when no risky operational behavior is detected

### Risky operational readiness test

Generate the **Provider failure / retry risk** sample without a test file.

Expected:

- Recommendation: `TESTS_REQUIRED`
- Operational readiness: `ATTENTION`
- Failure modes cover repeated side effects, provider failure behavior, API error semantics and sensitive logging where detected
- Detection signals include only evidenced logging, structured context, status codes or other controls
- Observability gaps identify missing metrics, alerts, traces or monitoring for the risky behavior
- Recovery or rollback identifies missing idempotency, compensation or rollback evidence without inventing a control
- Customer/data impact is expressed as potential impact, not an incident claim
- Owner or reviewer focus uses roles such as reliability, API or security review and does not invent people or teams

Append the documented test-file change and generate again. The recommendation should become `REVIEW_REQUIRED`; specific operational attention should remain.

### Evidenced controls test

Add harmless diff lines that explicitly introduce a metric or alert plus an idempotency guard, feature flag, rollback, restore or compensation path.

Expected:

- Only the controls present in the diff appear as detection or recovery evidence
- Matching observability or recovery gaps are reduced or removed
- Unrelated dashboards, alerts and rollback mechanisms are not invented

### Operational compatibility and privacy

- Load a legacy bare Report or stored report envelope without `operationalReadiness`; `/report` should render **Not assessed — regenerate this report** without an error.
- Copy summaries for new reports should include a concise Operational readiness section.
- Legacy copied summaries should state that operational readiness was not assessed.
- Copied markdown must not include raw diff markers, patch fragments or secret values.
- `lintel.generatedReport.v1` must continue to contain only `{ report, source }`; the raw diff must remain absent.
- Paste, samples, public GitHub import, source badges and Copy summary should continue to work.

## Reviewer focus evaluation

Every newly generated report should include a **Reviewer focus** section after Operational readiness and before Gaps. Focus items contain an engineering review area, `PRIMARY` or `SECONDARY` priority, and an evidence-based reason. They must not assign or invent people, usernames, owners or teams.

Deterministic review areas:

- Missing tests or risky backend, provider or retry behavior: **Backend reliability**
- API routes, status codes or error contracts: **API contract**
- Identifiers, logging, authentication, permissions or sensitive data: **Security/privacy**
- Database, migration, schema or data-write behavior: **Data/migration**
- Payments, redemptions, billing, refunds or side effects: **Payments/domain logic**
- Metrics, logs, alerts, traces, rollback controls or operational gaps: **Platform/observability**
- Frontend, UI, browser or analytics behavior: **Frontend integration**
- Documentation, OpenAPI, Swagger or public API documentation: **Docs/API consumer review**

### Reviewer focus sample tests

Generate the **Clean utility change** sample.

Expected:

- `reviewerFocus` is present, even when empty
- The UI shows neutral copy when no specialist focus is detected
- No person, owner or team is invented

Generate the **Provider failure / retry risk** sample without tests.

Expected:

- **Backend reliability** is `PRIMARY`
- **API contract** is `PRIMARY`
- **Security/privacy** appears for structured identifier or sensitive-value logging
- **Payments/domain logic** appears for redemption or discount-code side effects
- **Platform/observability** appears for detection, recovery or operational gaps
- Reasons refer to findings, changed behavior or operational readiness rather than generic assignments

Append the documented test file and generate again. Specific focus areas should remain where risks remain, even though the recommendation becomes `REVIEW_REQUIRED`.

### Reviewer focus targeted cases

- Add a database migration or schema change and confirm **Data/migration** appears.
- Add a frontend component, browser integration or analytics change and confirm **Frontend integration** appears.
- Add OpenAPI, Swagger, README or public API documentation changes and confirm **Docs/API consumer review** appears.
- Submit AI reviewer focus with a duplicate area and confirm deterministic and AI items are merged and deduplicated.
- Submit an unknown area or a reason containing an explicit owner, team assignment or username and confirm it is dropped by normalisation.

### Reviewer focus compatibility and copy

- Load a legacy report without `reviewerFocus`; `/report` should show a neutral not-assessed message without crashing.
- Copy summary should include Reviewer focus, capped consistently with other summary sections.
- Empty new-report focus should copy as `None detected`.
- Legacy focus should copy as not assessed.
- Raw diff markers, patch fragments and secrets must remain absent from copied markdown and session storage.

## Built-in sample library

Use the **Load sample** picker on `/new`. Loading a sample must populate all four report fields without submitting, navigating or calling an API. Every field remains editable before **Generate Report** is selected.

| Sample | Expected broad outcome |
| --- | --- |
| Clean utility change | `APPROVE`, `LOW`, operational `CLEAR` |
| Provider failure / retry risk | `TESTS_REQUIRED` or `REVIEW_REQUIRED`, `HIGH`, operational `ATTENTION` |
| Auth/session change | `TESTS_REQUIRED` or `REVIEW_REQUIRED`; security/privacy review expected |
| Database migration | `TESTS_REQUIRED` or `REVIEW_REQUIRED`; data/migration review expected |
| Payment/refund side effect | `TESTS_REQUIRED`; payments/domain and reliability review expected |
| API contract change | `REVIEW_REQUIRED` or `TESTS_REQUIRED`; API contract review expected |
| Logging/privacy risk | `REVIEW_REQUIRED` or `TESTS_REQUIRED`; security/privacy review expected |
| Frontend analytics/type change | `TESTS_REQUIRED` when no test file is present; frontend and docs review expected |

For each sample, confirm the selected input can be edited, generation still stores only `{ report, source }`, and no raw diff appears in session storage or copied markdown. AI wording and exact scores may vary, but the broad recommendation and review themes should remain consistent with the deterministic baseline.

## Report quality evaluation

New deterministic and AI-normalised reports include a **Report quality** section. The overall status is `PASS` only when every check passes; otherwise it is `WARNING` and the UI lists the failed checks. Legacy reports without `reportQuality` show **Not assessed — regenerate this report**.

Checks:

1. Risk level matches the configured score thresholds.
2. `TESTS_REQUIRED` includes missing tests or suggested tests.
3. `APPROVE` has no findings, missing tests, suggested tests or merge conditions.
4. Operational `ATTENTION` does not result in `APPROVE`.
5. Reviewer focus areas are supported by report evidence.
6. Payment, refund, authentication or logging paths do not remain `LOW` risk.
7. Security `CLEAR` does not conflict with security, privacy or sensitive-logging findings.
8. Shareable report fields contain no raw patch markers.

Manual tests:

- Generate **Clean utility change** and expect `PASS` with **Checks passed** and no suggested tests.
- Generate each risky sample and confirm its risk level, recommendation, operational status and reviewer focus remain internally consistent.
- Construct a legacy stored report without `reportQuality` and confirm the neutral not-assessed state renders without crashing.
- Temporarily inspect a malformed report fixture with a mismatched score/level, inconsistent approval, unsupported reviewer focus or sensitive path at `LOW` risk and confirm `WARNING` details identify the conflict.
- Copy a report and confirm markdown includes report quality status and warning items only, never raw diff content.
- Confirm `lintel.generatedReport.v1` still stores only `{ report, source }` and never the submitted raw diff.

## Pilot-ready report polish

- Final recommendation headings use **Ready to merge** for `APPROVE`, **Needs focused review** for `REVIEW_REQUIRED`, and **What needs attention** for `TESTS_REQUIRED`.
- Empty suggested tests render **No additional tests suggested.**
- Empty reviewer checklists render **No reviewer checklist items required.**
- Reports generated from the sample picker show **Sample** as the input source.
- Reports generated after a successful public GitHub PR import show **GitHub PR import** as the input source.
- Manually pasted diffs show **Pasted diff** as the input source.
- Legacy reports retain their existing branch or source text safely.
- Copied markdown includes the clean input-source label and continues to omit raw diff markers and secret values.
- Executive summary headings match the recommendation: **Ready to merge**, **Needs focused review**, or **What needs attention**.
- Unsupported reviewer-focus items are pruned before display and copying; report quality still warns if malformed or legacy data retains one.

Manual tests:

1. Generate the clean sample and confirm **Ready to merge**, **Sample**, and the suggested-tests empty state.
2. Generate a risky sample and confirm **What needs attention** or **Needs focused review** as appropriate.
3. Import a public GitHub PR, generate its report, and confirm **GitHub PR import** in the report and copied markdown.
4. Manually paste a diff and confirm **Pasted diff** in the report and copied markdown.
5. Load a legacy report with a real branch name and confirm the branch remains readable.
6. Confirm an empty reviewer checklist renders its positive empty state without a blank list.
7. Confirm session storage still contains only `{ report, source }` and no raw diff.
8. Generate the frontend analytics sample or import a docs/analytics/type-only PR and confirm **Payments/domain logic** is absent from both the page and copied markdown.

## Local report history

`/new` stores up to 10 recently generated reports under `lintel.reportHistory.v1` in browser `localStorage`. The existing `lintel.generatedReport.v1` session entry remains the source for the report currently shown on `/report`.

Each history entry contains only:

- the generated report;
- `ai` or `deterministic` generation source;
- the derived input label;
- creation time;
- minimal title, repository, recommendation, and risk-score metadata.

Raw diffs are never stored in history. Entries containing raw patch markers are rejected. Malformed local history is removed safely, and persistent-storage failures must not prevent report generation.

Manual tests:

1. Generate 11 reports and confirm only the newest 10 remain.
2. Confirm the newest generated report still opens automatically on `/report`.
3. Return to `/new`, open an older history item, and confirm `/report` renders that report with its original generation source.
4. Delete one entry and confirm the remaining entries persist after reload.
5. Select **Clear all** and confirm the history becomes empty without removing the current session report.
6. Confirm each item shows title, repository, recommendation, risk score, generation source, input label, and created time.
7. Search `localStorage` for a unique raw-diff marker and confirm it is absent.
8. Load a legacy bare current report in `sessionStorage` and confirm `/report` still renders it safely.
9. Corrupt the history JSON and confirm `/new` clears it without crashing.

## Download Markdown

`/report` provides **Download Markdown** beside **Copy summary**. Both actions use the same sanitized report formatter; downloading creates a client-side `.md` file and does not send another request or store new report data.

Expected Markdown sections:

- PR title and repository;
- generation source and input source or legacy branch;
- recommendation, risk band and score detail;
- executive summary;
- deduped Conditions before merge near the top;
- risk findings with available provenance;
- consolidated Test plan with missing coverage, suggested tests and reviewer checklist;
- operational readiness and reviewer focus;
- report quality status and warnings;
- closing summary.

Manual tests:

1. Download clean, risky, AI, deterministic, demo, and history-opened reports.
2. Confirm filenames follow `lintel-report-{repository}-{pr-title}.md` using safe lowercase characters.
3. Confirm the button briefly shows **Downloaded** only after the client-side download action succeeds.
4. Confirm download failure shows **Download failed** without affecting the report.
5. Open the file and verify every expected section and source label.
6. Confirm Conditions before merge are deduped, shown in full and not truncated with `...and N more`.
7. Confirm empty clean-report sections use calm copy, including **No merge conditions detected.**
8. Search the downloaded file for unique diff markers, `diff --git`, `@@`, exact patch lines, credentials, and secrets; none should be present.
9. Confirm keyboard access and narrow-screen topbar spacing.

## Stack and context inference

After a successful public GitHub PR import, Lintel attempts to populate **Language / framework** from changed file paths and diff signals. Inference runs only when that field is empty or has not been manually edited. The inferred value remains fully editable.

Current inference targets:

- `.ts` or `.tsx` plus Next.js configuration, imports, package paths, or app/page route structure → `TypeScript / Next.js`;
- `.tsx` or `.jsx` plus React imports or hooks without Next.js signals → `TypeScript / React`;
- `.py` plus FastAPI, `APIRouter`, API route, or endpoint signals → `Python / FastAPI`;
- TypeScript service, server, worker, job, client, API, Express, Fastify, Node import, or `process.env` signals → `TypeScript / Node.js`;
- SQL, Prisma, migration, or database schema paths and SQL migration statements → `SQL / Database migration`;
- documentation-only paths and Markdown-like files → `Markdown / Documentation`.

Manual tests:

1. Import a public Next.js PR containing TypeScript changes and confirm `TypeScript / Next.js` is populated.
2. Test React-only TSX/JSX, FastAPI Python, Node service, database migration, and docs-only public diffs against the expected values above.
3. Enter a custom technology value before selecting **Fetch diff** and confirm a completed import does not overwrite it.
4. Clear the field before importing and confirm a recognized stack is populated.
5. Start an import, manually edit the field while the request is running, and confirm the late response does not overwrite the edit.
6. Edit an inferred value and confirm report generation preserves the edited text.
7. Confirm failed imports do not change the field.
8. Confirm stack inference does not write the raw diff to session storage, local history, copied Markdown, or downloaded Markdown.

## Review modes

`/new` includes an optional **Review mode** selector. New reports store the selected mode in report metadata and show it in the report header, copied Markdown, downloaded Markdown, merge summary, and local history. Legacy reports without mode metadata safely use the `Standard readiness` label.

Modes:

- **Fast triage** quickly identifies obvious blockers, missing tests and next reviewer action.
- **Standard readiness** preserves the balanced deterministic merge-readiness behavior.
- **Deep review** increases the deterministic score and adds stronger test or operational conditions when missing tests or operational `ATTENTION` already exist.
- **Security-sensitive** strengthens access, permission, session, token, logging, identifier and sensitive-data review only when corresponding evidence exists.
- **Test coverage review** emphasizes missing coverage, risky branches, failure paths and named suggested tests.
- **Operational readiness** emphasizes failure modes, observability, rollback, recovery and production impact when operational evidence exists.
- **AI-generated code review** focuses on hidden assumptions, missing tests and unsafe generated-code patterns when changed behavior or attention signals exist.

Manual tests:

1. Run the eight-sample evaluation suite with **Standard readiness** and confirm existing expectations remain unchanged.
2. Generate **Clean utility change** under every mode and confirm no unsupported finding, reviewer focus, merge condition or risk increase appears.
3. Generate **Provider failure / retry risk** with **Deep review** and confirm the higher score plus stricter test and operational conditions.
4. Generate **Auth/session change** with **Security-sensitive** and confirm focused access, session, token or sensitive-data output.
5. Generate a risky untested change with **Test coverage review** and confirm missing coverage and suggested tests are prominent.
6. Generate **Provider failure / retry risk** with **Operational readiness** and confirm failure modes, detection, rollback or recovery and production impact are prominent.
7. Generate a larger risky change with **AI-generated code review** and confirm generated-code assumptions, missing tests and unsafe patterns are reviewed without claiming a different model was used.
8. Apply each specialist mode to an unrelated clean change and confirm it does not manufacture its domain risk.
9. Confirm model-assisted output uses the selected mode without removing deterministic findings or lowering protected risk floors.
10. Open reports from local history and verify mode labels persist.
11. Confirm Copy summary, Download Markdown and the merge summary contain the mode and no raw diff.
12. Load a legacy report without `reviewProfile` and confirm it renders and copies safely as **Standard readiness**.

## Local Risk inbox

`/workspace` provides a browser-local Risk inbox over the same 10-report history used by `/new`. It does not introduce a server-side workspace, account, database, or additional report storage.

Reports are grouped by PR identity where possible, using repository, title and input source. The latest report in each group is the visible row. Duplicate runs show a run count. The triage strip counts grouped PRs, not raw report runs.

Each grouped row shows PR title, repository, recommendation, risk band and score detail, source/input/profile context, latest run date, local status, run count where applicable, and the top condition or first risk. Opening a row copies only its existing `{ report, source }` envelope into the current session report key before navigating to `/report`.

Local status values are stored only in browser `localStorage`:

- Needs work
- Conditions met
- Merged
- Dismissed

Manual tests:

1. Open `/workspace` with no local history and confirm the empty state links to **Check a pull request** and the demo report.
2. Generate duplicate reports from the same sample and confirm they appear as one grouped PR row with a run count.
3. Generate reports from a sample, pasted diff and public GitHub PR; confirm each appears with expected profile, input and source labels.
4. Confirm `TESTS_REQUIRED` and `REVIEW_REQUIRED` groups appear under **Needs attention**, while `APPROVE` groups appear under **Ready / cleared**.
5. Confirm the triage strip counts grouped PRs for blocked/needs-attention, tests required, ready and tracked PRs.
6. Use the filters: All, Needs attention, Tests required, Review required and Ready.
7. Change a row's local status, reload and confirm it persists locally without calling an API.
8. Use workspace **Copy conditions** and confirm the copied Markdown matches the report Decision Gate.
9. Open a grouped row and confirm `/report` renders the latest report with original source, input label, operational readiness, reviewer focus and report quality.
10. Select **Delete reports** for one group and confirm only that grouped PR is removed. Select **Clear history** and confirm the workspace becomes empty without deleting the current session report.
11. Load legacy history without operational readiness, reviewer focus, report quality or review profile and confirm neutral **Not assessed** or **Standard** values render without crashing.
12. Confirm unsupported reviewer-focus areas are pruned from the workspace summary.
13. Confirm `/report?demo=1` shows the demo report even when a generated report exists in session storage.
14. Inspect local and session storage and confirm no raw diff, diff markers, secrets or patch lines were added.
15. Verify keyboard navigation and the mobile card layout at a narrow viewport.

## V2 merge-readiness report structure

The report prioritises the merge decision over exhaustive review prose. The visible order is recommendation and risk, merge conditions, findings, the combined test plan, operational readiness, reviewer focus, changed files, engineering review, report quality, and a compact final recommendation.

Manual tests:

1. Generate a risky report and confirm merge conditions appear immediately below the recommendation overview.
2. Generate the clean sample and confirm **No merge conditions detected.** appears in a calm positive state.
3. Confirm missing coverage, suggested test names, and present checklist items render inside one **Test plan** section; absent checklist items should not create an empty heading.
4. Confirm report quality renders as a compact check near the bottom and still exposes warning details when present.
5. Load a report containing duplicate operational items and confirm each exact item is rendered and exported once.
6. Load a report with several supported reviewer-focus areas and confirm only the highest-priority area is `PRIMARY`; remaining areas are `SECONDARY`.
7. Confirm legacy reports without operational readiness, reviewer focus, or report quality still render neutral fallback states.
8. Copy and download the report and confirm source, findings, tests, conditions, operations, reviewer focus, and quality remain present.
9. Attempt to load or normalise a report containing `diff --git`, `@@`, or raw patch headers and confirm it is rejected in favour of a safe fallback.
10. Inspect the UI, copied Markdown, downloaded Markdown, session storage, and local history for raw diff markers and confirm none appear.

### Decision polish checks

1. Confirm the overview leads with the risk band, such as **HIGH RISK**, and presents the numeric score as secondary model detail.
2. Confirm exact duplicate merge conditions are removed in both the page and exported Markdown.
3. Confirm broad test, review, or operational conditions are omitted when a more specific equivalent is already present.
4. Confirm Engineering Review keeps all three states while omitting points that exactly repeat finding titles.
5. Confirm the closing summary is one short recommendation statement and does not repeat the Decision Gate conditions.

## V2.1 finding provenance

New findings show a concise provenance label: **Rule detected** for deterministic or preserved baseline findings, and **Model assisted** for additional model findings. Legacy findings without provenance continue to render without failure or an invented source label.

Manual tests:

1. Force deterministic fallback and confirm every new finding shows **Rule detected**.
2. Generate a risky AI report and confirm retained baseline findings show **Rule detected** while genuinely additional findings show **Model assisted**.
3. Confirm finding evidence starts with concise detected-behaviour wording rather than a raw **Matched ...** keyword list.
4. Confirm relevant source file paths remain visible when the report has safe path evidence.
5. Load a legacy report without finding provenance and confirm it renders, copies, and downloads without crashing.
6. Confirm copied and downloaded Markdown includes provenance only when available.
7. Search the report UI, Markdown, session storage, and local history for `diff --git`, `@@`, raw hunks, line-level snippets, or unique diff markers; none should appear.

### Clean APPROVE restraint

Generate the **Clean utility change** sample and confirm it remains `APPROVE`, `LOW`, and operationally `CLEAR`. The Test plan should show `0 gaps · 0 tests`, the two positive empty-test messages, and **No reviewer checklist items required.** Engineering Review should show only short `CLEAR` summaries without generic follow-up advice. Risky samples must retain their focused checklist and review content.

## V2.4 Markdown export alignment

Copy and download clean, risky, AI, deterministic, demo, legacy, and history-opened reports. Confirm the Markdown follows the report hierarchy: metadata, recommendation and risk band, executive summary, merge conditions, risk findings, combined test plan, operational readiness, reviewer focus, report quality, and closing summary.

Checks:

1. Risk band appears before the numeric score detail.
2. APPROVE exports show **No merge conditions detected.** and the three calm Test plan empty states.
3. Risky exports show deduplicated conditions once, near the top.
4. Findings retain severity, category, title, available provenance, evidence, action, and safe file paths.
5. Missing coverage, suggested tests, and reviewer checklist appear under one **Test plan** heading.
6. Report quality remains compact and the closing summary does not repeat conditions.
7. Search copied and downloaded Markdown for `diff --git`, `@@`, raw hunks, unique diff markers, and secrets; none should appear.

## V2.5 public pilot trust polish

Manual tests:

1. Open `/` and confirm the hero shows a compact `TESTS_REQUIRED` / `HIGH RISK` report card on desktop and stacks cleanly on mobile.
2. Generate the risky provider retry sample and confirm **Conditions before merge** prefers specific, provable conditions over broad filler language.
3. Confirm **Copy conditions** copies only `## Conditions before merge` with the displayed conditions, or `No merge conditions detected.` for an `APPROVE` report.
4. Confirm source labels render as **Baseline + model-assisted**, **Baseline only**, and **Demo report** in `/report`, copied/downloaded Markdown, `/new` history, and `/workspace`.
5. Confirm finding provenance labels render as **Rule detected** or **Model assisted**; legacy stored `Baseline preserved` provenance should display/export as **Rule detected**.
6. Search the UI, copied conditions, copied summary, downloaded Markdown, session storage, and local history for `diff --git`, `@@`, raw hunks, unique diff markers, and secrets; none should appear.

## V2.6 local risk inbox

Manual tests:

1. Generate the same sample report more than once and confirm `/workspace` groups it into one PR row with a run count.
2. Confirm the triage strip counts grouped PRs, not raw report runs.
3. Confirm `TESTS_REQUIRED` and `REVIEW_REQUIRED` groups appear under **Needs attention**, while `APPROVE` groups appear under **Ready / cleared**.
4. Use the filters: All, Needs attention, Tests required, Review required, and Ready.
5. Change a row's local status and reload; confirm the status persists locally and is not sent to an API.
6. Use **Copy conditions** from a workspace row and confirm it matches the deduped Decision Gate conditions from `/report`.
7. Confirm **Delete reports** removes only that grouped PR's local report runs, and **Clear history** clears all local history.
8. Open a grouped row and confirm `/report` renders the latest report in that group.
9. Confirm the empty state explains the workflow and links to **Check a pull request** and the demo report.
10. Search the workspace UI, copied conditions, session storage and local history for `diff --git`, `@@`, raw hunks, unique diff markers, and secrets; none should appear.

## V2.7 evaluation documentation refresh

Current strongest validated wedge:

> Lintel helps engineering teams decide whether a pull request is safe, tested, operationally ready and ready to merge.

Current V2 regression checklist:

- Clean `APPROVE` restraint: clean reports stay quiet, with no findings, missing tests, suggested tests, merge conditions or generic reviewer work.
- Provider retry escalation: provider retry / discount-code risk produces `TESTS_REQUIRED`, `HIGH` risk, operational `ATTENTION`, specific Conditions before merge and risk-specific tests.
- No payment false positive for frontend/API PRs: public frontend/docs/type changes must not show **Payments/domain logic** without explicit payment, billing, refund, redemption, discount, checkout, invoice, subscription, order or charge evidence.
- Public GitHub import: supported public PR URLs import, populate repository/diff, infer stack where possible and keep raw diffs out of storage after generation.
- Manual pasted diff: pasted clean diffs can produce `APPROVE`, `LOW`, `CLEAR` without invented work.
- Stack inference: Next.js public PRs infer `TypeScript / Next.js` when the field is empty or untouched.
- Report quality checks: reports show `PASS` or explicit warnings and continue to flag unsupported reviewer focus.
- Provenance labels: findings show **Rule detected** or **Model assisted** where available.
- Copy conditions: Decision Gate and workspace copy the full deduped condition list, or **No merge conditions detected.** for `APPROVE`.
- Markdown export alignment: copied and downloaded Markdown follow the current report hierarchy.
- Workspace/risk inbox grouping: duplicate local runs group into one PR row with triage counts, filters and local statuses.
- Raw diff privacy: raw diffs and patch markers do not appear in UI, copied conditions, copied summary, downloaded Markdown, session storage or local history.

Current limitations to keep visible:

- Evaluation is still manual.
- Scenario count is still small.
- Private repository import is not supported.
- GitHub App integration is not implemented.
- CI integration is not implemented.
- Automatic PR comments are not implemented.
- Authentication, billing, database and team dashboards are not implemented.
- Line-level evidence and raw diff hunks are not shown.
- Frontend-specific reviewer routing still needs refinement.
- Model-assisted quality depends on the configured provider when enabled.

## V2.13 local condition tracking

Manual tests:

1. Generate a `TESTS_REQUIRED` report with Conditions before merge and confirm each condition renders with a checkbox.
2. Generate a `REVIEW_REQUIRED` report with Conditions before merge and confirm each condition renders with a checkbox.
3. Generate a clean `APPROVE` report and confirm it remains quiet: **No merge conditions detected.** and no checkboxes.
4. Check several conditions, refresh `/report`, and confirm the cleared state persists.
5. Confirm the Decision Gate progress text updates, for example `0/6 cleared`, `3/6 cleared`, or **All conditions cleared**.
6. Open `/workspace` and confirm the latest grouped PR row shows condition progress, such as `0/6 conditions cleared`, `2 conditions remaining`, or **All conditions cleared**.
7. Confirm the workspace local status select remains manual and is not forced by checkbox state.
8. Use **Copy conditions** from `/report` and `/workspace`; confirm it still copies the full deduped conditions list.
9. Inspect `localStorage` and confirm condition progress is stored locally on this device without raw diffs, patch hunks, `diff --git`, `@@`, or secret values.
10. Confirm malformed or legacy reports without conditions still render safely.

## V3.0 workspace app shell

Manual tests:

1. Open `/workspace` and confirm the dark left app sidebar renders with clean navigation for **New report**, **Risk inbox**, **Reports** and **Evaluation**.
2. Confirm **Risk inbox** remains the primary workspace title and the header keeps the local-first privacy copy.
3. Confirm **Check a pull request** and **Clear history** remain available from the workspace header when applicable.
4. Confirm grouped PR rows, triage counts, filters, **Needs attention** / **Ready / cleared** sections, local status, condition progress, **Open**, **Copy conditions** and **Delete reports** still work.
5. Check and uncheck report conditions, refresh `/workspace`, and confirm condition progress still persists.
6. Change a row's local status, refresh `/workspace`, and confirm the status still persists locally.
7. Confirm **Delete reports** removes the grouped PR and **Clear history** clears local report history.
8. Resize to a narrow viewport and confirm the sidebar collapses into usable navigation without clipping the workspace rows.
9. Search the workspace UI, copied conditions, copied summary, downloaded Markdown, session storage and local history for `diff --git`, `@@`, raw hunks, unique diff markers and secrets; none should appear.

## V3.1 workspace split-view report preview

Manual tests:

1. Open `/workspace` with mixed local history and confirm the first **Needs attention** row is selected by default; if none exist, confirm the first report is selected.
2. Click different grouped PR rows and confirm the preview panel updates without navigating away from the Risk Inbox.
3. Confirm row actions still behave independently: **Open** navigates to `/report`, **Copy conditions** copies Markdown, **Delete reports** removes the group, and the local status selector does not accidentally change selection.
4. Confirm the preview shows repository, PR title, recommendation, risk band and score detail, review profile, input source, analysis mode, latest timestamp, condition progress, conditions preview, top risk, missing test count, operational readiness, reviewer focus and report quality.
5. Delete the selected report group and confirm the workspace selects the next available visible report or shows the no-selection preview state.
6. Check and uncheck conditions on `/report`, return to `/workspace`, and confirm preview condition progress reflects local state.
7. Use filters and confirm selection remains safe when a selected report is filtered out.
8. Confirm local status still persists after reload.
9. Confirm **Copy conditions** works from both the row and preview panel.
10. Resize to a narrow viewport and confirm the preview stacks with the list without breaking row actions.
11. Search the workspace UI, preview panel, copied conditions, copied summary, downloaded Markdown, session storage and local history for `diff --git`, `@@`, raw hunks, unique diff markers and secrets; none should appear.

## V3.2 report working surface

Manual tests:

1. Open `/report` on a desktop-width viewport and confirm the sticky decision panel renders beside the report content.
2. Resize to tablet/mobile widths and confirm the decision panel stacks above the report without horizontal overflow.
3. Confirm the panel shows recommendation, risk band and score detail, report title, repository, review profile, input source, analysis mode, operational readiness, report quality, reviewer focus and condition progress.
4. Check and uncheck Conditions before merge; confirm the main Decision Gate and sticky panel progress update together.
5. Refresh `/report` and confirm condition progress persists from local storage.
6. Confirm **Copy conditions**, **Copy summary** and **Download Markdown** work from the sticky panel and preserve existing output behaviour.
7. Confirm **Back to workspace** opens `/workspace` and **Check another pull request** opens `/new`.
8. Generate or open a clean `APPROVE` report and confirm it remains quiet: no condition checkboxes, no generic checklist work and **No merge conditions detected.**
9. Confirm findings still show provenance labels such as **Rule detected** or **Model assisted**.
10. Confirm copied/downloaded Markdown still follows the V2 report hierarchy.
11. Search the report UI, decision panel, copied conditions, copied summary, downloaded Markdown, session storage and local history for `diff --git`, `@@`, raw hunks, unique diff markers and secrets; none should appear.

## V3.4 security model documentation

Manual tests:

1. Confirm `docs/security-model.md` exists.
2. Confirm README links to `docs/security-model.md`.
3. Confirm `docs/public-pilot.md` links to `security-model.md`.
4. Confirm current privacy claims match the product: raw diffs are not saved in local report history, copied summaries/conditions and Markdown exports should remain raw-diff-free, and browser storage is local-first.
5. Confirm model-assisted mode is described honestly: provider use depends on configuration and no provider retention guarantees are claimed.
6. Confirm GitHub Action/private repo claims are marked as planned and do not imply current CI, GitHub App or private repo support.
7. Confirm there are no fake enterprise or compliance claims such as SOC 2, SSO, RBAC, audit logs or enterprise admin being available today.
8. Confirm the document says Lintel does not replace human review, CI, tests or security review and does not catch every bug.

## V3.5 engineer experience review and workspace polish

Manual tests:

1. Start at `/` and confirm the landing page clearly says Lintel helps decide what is ready to merge.
2. Confirm landing navigation links to **Risk inbox**, **Security model** and **Check a pull request**.
3. Confirm landing trust cues mention local-first workspace and raw-diff-free history.
4. Open `/workspace` and confirm it reads as a risk inbox, not a generic dashboard.
5. Confirm workspace navigation includes **Security model** and the privacy copy still says raw diffs are not saved in history.
6. Open `/new` and confirm the intro describes a merge-readiness checklist: recommendation, risks, missing tests, reviewer focus and conditions before merge.
7. Confirm `/new` links to the security model and keeps the model-assisted privacy copy honest.
8. Open `/report` and confirm the decision panel makes conditions, missing tests and findings easier to scan at a glance.
9. Confirm report actions still work: Copy conditions, Copy summary, Download Markdown, Back to workspace and Check another pull request.
10. Confirm `/docs/security-model.md` resolves from app links.
11. Search UI, copied output, downloaded Markdown, session storage and local history for `diff --git`, `@@`, raw hunks, unique diff markers and secrets; none should appear.

## V4.12 PR readiness timeline and decision history

Manual tests:

1. Open `/report` and confirm the **Timeline** tab appears in the report working surface.
2. Confirm the timeline summary shows current review state, conditions cleared, open conditions and last local update.
3. Confirm newly opened reports seed local history with **Report generated** and **Recommendation assigned** entries.
4. Change local review state from the report decision panel and confirm a **Local review state changed** entry appears.
5. Change local review state from `/workspace`, open the report, and confirm the same timeline records the change.
6. Check and uncheck Conditions before merge and confirm **Condition cleared** and **Condition reopened** entries appear.
7. Add or clear a local reviewer note, blur the note field, and confirm a **Local reviewer note updated** entry appears without storing the note body in the timeline.
8. Use **Copy PR comment** in the Export tab and confirm a **Merge summary copied** entry appears only after copy succeeds.
9. Refresh `/report` and confirm timeline entries persist locally.
10. Confirm the timeline says it is local-only decision history, not team audit logging.
11. Clear local history from `/workspace` and confirm report history, review state and decision history are cleared together.
12. Search the timeline UI and `localStorage` for `diff --git`, `@@`, raw hunks, unique diff markers and secrets; none should appear.

## V4.13 reviewer assignment and ownership cues

Manual tests:

1. Open `/report` and confirm the sticky decision panel shows an **Owner** field.
2. Confirm the local review state card has an **Owner** selector with: Unassigned, Backend reviewer, Frontend reviewer, Security reviewer, Data/migration reviewer, Platform/operations reviewer, Test owner and Senior reviewer.
3. Change the owner, refresh `/report`, and confirm the selected owner persists locally.
4. Open the **Timeline** tab and confirm an ownership change creates a **Local owner changed** entry.
5. Open the report overview or review routing area and confirm suggested owner cues are shown without implying a real team assignment.
6. Open `/workspace` and confirm report rows show an owner cue and include an owner selector.
7. Change ownership from `/workspace`, open the report, and confirm the owner and timeline event are preserved.
8. Confirm suggested owners follow report signals: missing tests can suggest **Test owner**, security/privacy can suggest **Security reviewer**, data/migration can suggest **Data/migration reviewer**, operational risk can suggest **Platform/operations reviewer**, backend/API can suggest **Backend reviewer**, frontend/client signals can suggest **Frontend reviewer**, and high-risk/focused review can suggest **Senior reviewer**.
9. Copy the PR comment / merge summary and confirm it includes local owner and ownership cue.
10. Open `/slack-handoff` and confirm the concept copy includes owner cues while still saying it is copy/export-only.
11. Confirm ownership remains local-only: no auth, users, notifications, Slack API, GitHub posting or backend collaboration.
12. Search report UI, workspace, copied/exported text and `localStorage` for `diff --git`, `@@`, raw hunks, unique diff markers and secrets; none should appear.

## V4.14 readiness score breakdown

Manual tests:

1. Open `/report` and confirm the Overview tab includes **Why this score looks the way it does**.
2. Confirm the summary shows current score, strongest positive signal, biggest score drag and next readiness action.
3. Confirm the component cards include: Test coverage, Operational readiness, Security/privacy, Blast radius, Merge conditions, Evidence quality and Reviewer confidence.
4. Confirm each component shows a status, explanation, improvement action and related evidence.
5. Generate or open a risky provider/retry report and confirm missing tests, open merge conditions, operational attention and affected surfaces create visible score drags.
6. Generate or open a clean `APPROVE` report and confirm the score breakdown stays calm, with no invented blockers.
7. Change condition progress and owner locally; confirm the Merge conditions and Reviewer confidence components reflect current local state.
8. Confirm the section clearly says the breakdown is heuristic and not production-calibrated.
9. Resize to mobile width and confirm the summary/cards stack cleanly.
10. Search the score breakdown UI for `diff --git`, `@@`, raw hunks, unique diff markers and secrets; none should appear.
