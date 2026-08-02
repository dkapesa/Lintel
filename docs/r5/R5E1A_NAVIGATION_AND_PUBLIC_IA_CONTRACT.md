# R5E.1A — Navigation and Public Information Architecture Contract

Companion to `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md`. Authoritative for the
public header, footer, navigation labels, destinations, active-state
behaviour, navigation accessibility and future public information
architecture.

Documentation only. No route, component or style was created or modified.

---

## 1. What this supersedes

| Superseded | Source | Replacement |
|---|---|---|
| Navigation label `Security` | `R5B_LANDING_PAGE_ARCHITECTURE.md` §3b, §16e | `Trust` (§2) |
| Static header that scrolls away and never returns | `R5B_LANDING_PAGE_ARCHITECTURE.md` §3e | Sticky, compact, white header (§3) |
| Warm neutral header and footer ground | `R5A_DIRECTION_LOCK.md` §7; `R5C` §3 | White header and footer (§3, §5) |

Everything else in R5B §3 and §16 remains in force, in particular: the
header holds identity and one action and nothing else; the header never
displays recommendation, risk, requirement or Human Decision values; every
public action resolves to something that exists or it does not appear.

---

## 2. Frozen initial navigation

```
Lintel

Product
How it works
Trust

Open the sample review
```

Destinations:

| Item | Destination | Kind | Status |
|---|---|---|---|
| `Lintel` identity | `/` | Route | Active |
| `Product` | the live product-stage anchor | In-page anchor | Active |
| `How it works` | the guided verification-journey anchor | In-page anchor | Active |
| `Trust` | the compact public trust-boundary anchor | In-page anchor | Active |
| `Open the sample review` | `/workspace?source=fixture` | Route | Active |

`Start a review` → `/new` remains an important **hero and final-handoff
secondary action**. It does not need to occupy the primary navigation and
must not be added to it in R5E.1B–F.

The three anchors are in-page anchors to movements of the recalibrated
homepage. If a label cannot resolve to a section that exists on the page, it
does not ship. Anchor `id` values are an R5E.1B implementation decision;
once chosen they are fixed for the remainder of R5E.1 so the header, the
footer and any deep link agree.

Absent, because the capability or page does not exist: Docs, Changelog,
Pricing, Sign in, Sign up, Account, Contact sales, Book a demo, Request
access, Newsletter, Status, Integrations directory, Customer stories,
Careers, Search, and any social account not confirmed to exist. None is
rendered disabled, greyed, or as "coming soon".

---

## 3. Desktop header contract

1. White background.
2. Same grid as the page.
3. Approximately 60–64px high.
4. Compact and precisely aligned.
5. Sticky without becoming a floating capsule.
6. A fine lower border when visually separated from the page.
7. Quiet active-section indication.
8. Visible keyboard focus.
9. A compact black primary action.
10. No invented destinations.
11. No oversized mega-menu.
12. No glass-led navigation styling.
13. No layout movement when the sticky state changes.

Notes that make 5, 7 and 13 implementable:

- **Sticky, not floating.** The header spans the full page width, sits flush
  against the canvas, and keeps the same internal grid as the content below
  it. It never becomes a detached, inset, rounded or shadowed pill.
- **No layout movement.** The header's height, padding, type size, logo size
  and action size are identical in its top state and its scrolled state.
  Only the lower border may change, and it must change without altering any
  box dimension — for example by moving from transparent to a fine grey
  border colour on a border that is always present. Nothing on the page may
  shift vertically when the state flips.
- **Quiet active-section indication.** A restrained indication only: a
  colour step from secondary to primary text, or a fine underline that does
  not change the label's box. No pill, no filled background, no animated
  marker sliding between labels. It reflects the section currently in view
  and must never be the only signal of anything.
- The header carries **no** product values. The demonstration's own summary
  values live inside the demonstration, per
  `R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §3a.

---

## 4. Mobile header contract

1. Show the `Lintel` identity.
2. Show a compact `Open sample` action.
3. Omit the three in-page labels at narrow widths.
4. Do not add a hamburger menu yet.
5. Do not create hidden placeholder destinations.

The mobile header stays sticky under the same no-layout-movement rule. The
compact action's accessible name must remain the full, truthful destination
description even where the visible label is shortened.

---

## 5. Footer contract

The footer remains white (`R5E1A_SYSTEM_AND_INTERACTION_LOCK.md` §4.4) and
keeps its R5B §3g responsibility: identity, a single line restating the
trust statement, the same three in-page links now labelled `Product`,
`How it works` and `Trust`, and a legal line.

No newsletter capture, no social proof, no sitemap of pages that do not
exist, no status or uptime claim, no organisation or enterprise language,
and no control for a capability that does not exist.

---

## 6. Future dropdown rule

A dropdown may be introduced **only when at least two genuine supporting
pages exist beneath it.** Until then the navigation stays flat.

Potential future groups, recorded as information-architecture possibilities
and **not** as routes to implement in R5E.1:

```
Product
  Overview
  Interactive sample
  Review workflow

Trust
  Security
  Architecture
  Data and AI boundaries
```

Creating any of these routes, or a menu that gestures at them, is out of
scope for every R5E.1 subphase.

---

## 7. Navigation accessibility

Binding for all R5E.1 implementation:

1. Visible focus on every navigation control.
2. Logical source and tab order: skip link → identity → the three labels in
   visual order → primary action.
3. No hover-only destinations.
4. Route-aware active state for future public pages, so that when a real
   second public page exists the same component can express "current page"
   as well as "current section".
5. Escape behaviour for any future menu.
6. No disabled or inert links.

Additional requirements that follow from the sticky header:

- A sticky header must not obscure the target of an in-page anchor. Anchor
  targets need scroll offset (for example `scroll-margin-top`) at least
  equal to the header height, at every viewport.
- The skip link must remain the first focusable control and must reach the
  main content, not the header.
- Active-section indication must be exposed to assistive technology through
  something other than colour — for example `aria-current` on the matching
  link — and must not produce an announcement on every scroll tick.
- Focus must never be moved by scroll position. The header may re-render its
  active state; it may not take focus.

---

## 8. Route and action truth

Restated, because the recalibrated page adds interactive behaviour that
could be mistaken for a route:

1. Nothing in the demonstration is a route. Activating a Queue row, a stage,
   a record or the decision surface changes public demo state only and never
   navigates.
2. The only real destinations reachable from the public page are `/`,
   `/workspace?source=fixture` and `/new`.
3. `Open the sample review` must remain distinguishable from the
   demonstration's own controls, so a visitor can tell the difference
   between inspecting the sample in place and leaving for the real
   read-only Workspace.
4. No public control may imply an account, a trial, a price, a conversation,
   a hosted organisation, shared collaboration, or an external write.

---

## 9. Acceptance checklist

1. Navigation is exactly `Lintel` + `Product` / `How it works` / `Trust` +
   `Open the sample review`. ☐
2. `Start a review` appears in the hero and final handoff only, routing to
   `/new`. ☐
3. Every destination exists; nothing is disabled, placeholder or invented. ☐
4. The desktop header meets all thirteen locked properties, including no
   layout movement on sticky state change. ☐
5. The mobile header shows identity and a compact sample action only, with
   no hamburger and no hidden destinations. ☐
6. Header and footer are white. ☐
7. The footer carries identity, one trust line, the three in-page links and
   a legal line, and nothing else. ☐
8. No dropdown exists, and none may be added before two genuine supporting
   pages exist beneath it. ☐
9. All seven navigation accessibility requirements plus the four sticky
   header requirements are satisfied. ☐
10. No demonstration control behaves as, or is styled as, a route. ☐
