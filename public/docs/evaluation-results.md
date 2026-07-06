# Lintel evaluation results

Lintel was manually evaluated against four representative pull request scenarios covering approval restraint, provider retry risk, public GitHub PR import, and a clean pasted diff.

| Scenario | Expected | Observed | Result |
| --- | --- | --- | --- |
| Clean utility change | APPROVE / LOW / CLEAR | APPROVE / LOW / CLEAR | PASS |
| Provider retry risk | TESTS_REQUIRED / HIGH / ATTENTION | TESTS_REQUIRED / HIGH / ATTENTION | PASS |
| Frontend public PR | No payment false positive | No payment false positive | PASS |
| Clean pasted diff | APPROVE / LOW / CLEAR | APPROVE / LOW / CLEAR | PASS |

Summary:

- 4/4 evaluation scenarios correct
- 0 invented findings on clean changes
- 0 false payment flags on the frontend scenario
- 0 raw diff markers observed in generated reports

These results describe the current prototype evaluation set, not a guarantee for every pull request. Lintel remains a decision-support tool used alongside human review, CI, security review, and tests.
