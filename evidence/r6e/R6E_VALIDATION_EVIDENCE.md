# R6E validation evidence

Browser validation evidence captured against the real browser-local Review
collection on 2026-08-11.

## Compact evidence recovery

- The original `R6E-compact.png` was invalid: it was captured from a stale,
  effectively unstyled runtime and did not prove the Compact presentation.
- A newly started port-3000 dev runtime compiled `/reviews` from the current
  source. The existing browser-local Review rows survived on that origin.
- Source and freshly served CSS both contained the scoped Compact rule for
  `.rowMetadata`; the live Compact row computed it as `display: none`. No
  production source change was required.
- `R6E-compact.png` was replaced with a genuine 1440x900 manual-Compact
  capture. Expanded measured a 300px Queue and 1140px Workspace; Compact
  measured a 232px Queue and 1208px Workspace. Title and textual triage state
  remained visible, repository and recency were absent, and document overflow
  was zero.
- The replacement is byte-distinct from both 1440px references. It differs
  from `R6E-1440-expanded.png` at 214,152 of 1,296,000 pixels (16.524074%) and
  from `R6E-1440-selected-row.png` at 243,108 pixels (18.758333%).

## Browser observations

- 1440px Expanded: Queue rendered restrained native links with title,
  repository, textual triage state and quiet run-date recency; no horizontal
  document overflow.
- Compact: the manual Queue setting retained readable title and triage text;
  repository/recency yielded first.
- Selection: a plain first-row activation navigated once to encoded
  `/reviews/<ReviewId>/overview`; the selected Queue link had
  `aria-current="page"` and surface/inset-rule styling.
- Search/filter: State and case-insensitive trimmed title/repository search
  combined; selection and route remained unchanged when hidden. A bare Queue
  search produced `No reviews match this view.` and a Clear view action.
- Persistence: grouping=None survived reload; an in-memory search did not.
- 899px: bare `/reviews` measured `899.2px 0px`, surface `queue`, and no
  overflow. Row activation measured `0px 899.2px`, surface `workspace`, with
  the selected Review URL and Review Queue return control. Reopening the Queue,
  then selecting the current row again, retained that URL; one browser Back
  returned to `/reviews` and Queue surface.
- Accessibility: Queue remained an `aside[aria-label="Review Queue"]`; rows
  were `ul > li > a`, search had an accessible name, and View options was a
  button with `aria-expanded`/`aria-controls`.

## Scale

The deterministic R6E suite constructs a 500-row production-shaped collection
with long titles/repositories and all four semantic groups. It projects all
500 rows, retains semantic order, and has deterministic substring search.
No production fixture route, virtualization, or pagination was added.

## Files

- `R6E-1440-expanded.png`
- `R6E-1440-selected-row.png`
- `R6E-compact.png`
- `R6E-zero-result.png`
- `R6E-899-narrow-queue.png`
- `R6E-899-selected-workspace.png`

The existing browser-local fixture did not reproduce an adapter limitation. The
partial-history surface is covered by the ready-snapshot rendering branch and
deterministic projection checks; its wording remains a non-blocking follow-up.
