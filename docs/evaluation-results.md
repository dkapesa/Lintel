# Lintel Evaluation Results

Evaluation date: 2026-07-04  
Evaluation mode: Manual product smoke test  
Application version: V1.8 local reports workspace  
Evaluator: Denis Kapesa

## Summary

Lintel was evaluated against representative pull request scenarios covering clean utility changes, risky provider failure handling, public GitHub PR import, frontend/API consumer changes and manual pasted diffs.

| Metric | Result |
| --- | --- |
| Scenarios evaluated | 4 |
| Passed | 4 |
| Failed | 0 |
| Report quality checks passed | 4 / 4 |
| Raw diff leakage observed | No |
| GitHub import tested | Yes |
| Manual pasted diff tested | Yes |
| Review profiles tested | Standard, Frontend/API consumer |

## Scenario Results

| ID | Scenario | Input source | Review profile | Expected | Observed | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Clean utility change | Sample | Standard | APPROVE / LOW / CLEAR | APPROVE / 22 LOW / CLEAR | PASS |
| 2 | Provider retry and duplicate redemption risk | Sample | Standard | TESTS_REQUIRED / HIGH / ATTENTION | TESTS_REQUIRED / 78 HIGH / ATTENTION | PASS |
| 3 | Next.js sendGAEvent public PR import | GitHub PR import | Frontend/API consumer | No payment false positive, TypeScript / Next.js inferred, test gaps detected | TESTS_REQUIRED / 52 MEDIUM / CLEAR, TypeScript / Next.js inferred, no Payments/domain logic | PASS |
| 4 | Clean manual pasted diff | Pasted diff | Standard | APPROVE / LOW / CLEAR | APPROVE / 22 LOW / CLEAR | PASS |

## Detailed Results

### 1. Clean utility change

**PR:** Format display names consistently  
**Repository:** acme/profile-api  
**Input source:** Sample  
**Review profile:** Standard  
**Stack:** Python / FastAPI  

Observed result:

- Recommendation: APPROVE
- Risk score: 22 / 100
- Risk level: LOW
- Operational readiness: CLEAR
- Findings: 0
- Reviewer focus areas: 0
- Missing tests: none
- Suggested tests: none
- Report quality: PASS

Result: PASS

Notes:

Lintel correctly recognised a low-risk utility change with matching tests. The report did not create unnecessary findings, missing tests, reviewer focus areas or suggested tests.

### 2. Provider retry and duplicate redemption risk

**PR:** Add fallback handling for failed discount-code retrieval  
**Repository:** acme/redemption-api  
**Input source:** Sample  
**Review profile:** Standard  
**Stack:** Python / FastAPI  

Observed result:

- Recommendation: TESTS_REQUIRED
- Risk score: 78 / 100
- Risk level: HIGH
- Operational readiness: ATTENTION
- Findings: 5
- Reviewer focus areas: 5
- Report quality: PASS

Detected focus areas:

- Backend reliability
- API contract
- Security/privacy
- Payments/domain logic
- Platform/observability

Result: PASS

Notes:

Lintel correctly escalated a risky provider and retry change. The report identified missing risk-specific tests, duplicate redemption risk, provider failure handling, API contract stability, logging/privacy concerns and operational readiness gaps.

This is one of the strongest demonstrations of Lintel's core value because it moves beyond code review and evaluates merge readiness, operational risk and conditions before merge.

### 3. GitHub PR import / Next.js sendGAEvent

**PR:** Fix sendGAEvent function params and type clearly  
**Repository:** vercel/next.js  
**Input source:** GitHub PR import  
**Review profile:** Frontend/API consumer  
**Stack:** TypeScript / Next.js  

Observed result:

- Recommendation: TESTS_REQUIRED
- Risk score: 52 / 100
- Risk level: MEDIUM
- Operational readiness: CLEAR
- Findings: 3
- Reviewer focus areas: 3
- Report quality: PASS
- Stack inference: TypeScript / Next.js
- Payments/domain logic: not present

Detected focus areas:

- Backend reliability
- Frontend integration
- Docs/API consumer review

Result: PASS

Notes:

Lintel successfully imported a public GitHub PR and inferred the correct stack context as TypeScript / Next.js. The selected Frontend/API consumer profile correctly surfaced documentation, browser/API consumer and frontend integration concerns.

Dedicated regression passed: the report did not show Payments/domain logic for a frontend analytics/type change.

Follow-up polish:

The Backend reliability reviewer focus appears because missing test coverage triggers reliability review. This is acceptable for the current prototype, but a future reviewer-routing refinement could phrase this as frontend/API test coverage when the change is primarily frontend, documentation or public consumer API related.

### 4. Manual pasted diff

**PR:** Normalize display titles before rendering  
**Repository:** acme/content-service  
**Input source:** Pasted diff  
**Review profile:** Standard  
**Stack:** Python / FastAPI  

Observed result:

- Recommendation: APPROVE
- Risk score: 22 / 100
- Risk level: LOW
- Operational readiness: CLEAR
- Findings: 0
- Reviewer focus areas: 0
- Missing tests: none
- Suggested tests: none
- Report quality: PASS

Result: PASS

Notes:

Lintel correctly handled the manual pasted diff flow. The change was recognised as a safe, well-tested utility update and did not generate unnecessary findings or test suggestions.

## Dedicated Regression Tests

| Regression | Expected | Observed | Result |
| --- | --- | --- | --- |
| Clean utility change remains low risk | APPROVE / LOW / CLEAR | APPROVE / 22 LOW / CLEAR | PASS |
| Clean APPROVE report does not show suggested tests | No suggested tests | No additional tests suggested | PASS |
| Provider failure and retry risk escalates | TESTS_REQUIRED / HIGH / ATTENTION | TESTS_REQUIRED / 78 HIGH / ATTENTION | PASS |
| Provider retry report includes operational readiness concerns | ATTENTION with failure modes, detection, rollback/recovery and customer impact | ATTENTION with detailed operational readiness | PASS |
| Frontend/API consumer GitHub PR does not show Payments/domain logic | Payments/domain logic absent | Payments/domain logic absent | PASS |
| GitHub import infers stack context | TypeScript / Next.js | TypeScript / Next.js | PASS |
| Manual pasted diff flow works | Report generates from pasted diff | APPROVE report generated | PASS |
| Report quality checks remain present | PASS or explainable warnings | PASS across all four scenarios | PASS |
| Raw diff should not appear in generated report UI | No `diff --git` or `@@` markers in report UI | No raw diff markers observed in shown reports | PASS |

## Current Limitations

- Evaluation is currently manual.
- Only four scenarios have been recorded in this pass.
- Private repository import is not supported.
- GitHub App integration is not implemented.
- CI integration is not implemented.
- Automatic PR comments are not implemented.
- Team dashboards, shared reports, authentication and billing are not implemented.
- Model output quality still depends on the configured AI provider when AI mode is enabled.

## Follow-up Evaluation Work

- Record results for all eight built-in sample scenarios.
- Repeat the same scenarios with deterministic fallback only.
- Repeat the same scenarios with AI enabled.
- Add more real public GitHub PR imports across frontend, backend, database, auth, security and infrastructure changes.
- Add regression coverage for review policy profiles:
  - High assurance
  - Payments/refunds
  - Auth/security
  - Data/migrations
  - Frontend/API consumer
- Track false positives and false negatives over time.
- Consider adding automated snapshot-style report checks once the report schema stabilises.

## Overall Conclusion

Lintel successfully generated structured merge-readiness reports across clean, risky, imported and manually pasted pull request scenarios.

The evaluated reports correctly surfaced recommendation, risk, missing tests, operational readiness, reviewer focus, report quality and conditions before merge.

The strongest validated product wedge is:

> Lintel helps engineering teams decide whether a pull request is safe, tested, operationally ready and ready to merge.

This evaluation pass supports Lintel's current positioning as a local-first merge-readiness workspace for engineering teams.
