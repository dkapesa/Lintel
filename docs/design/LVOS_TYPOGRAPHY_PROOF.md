# LVOS typography proof

**Status:** Approved  
**Approval date:** 15 July 2026  
**LVOS baseline:** v1.0  
**Milestone:** LVOS-1 — Typography Proof and Core Type System  
**Internal route:** `/lvos/typography-proof`  
**Retention:** keep as a visual-QA reference through LVOS-7 unless an explicit later decision removes it.

## Purpose

This proof evaluates the normative LVOS typography roles on one isolated internal surface. It demonstrates application shell copy, dense queue records, a selected-case inspector, a finding/evidence record, a Merge Contract clause, administrative settings and a public website hero without migrating or restyling any live route.

The semantic role contract is approved unchanged for staged adoption. The proof closes AU-01’s contract-and-proof gap only. Adoption by LVOS-2 through LVOS-6 remains pending, with global zero-violation enforcement pending in LVOS-7.

## Normative role table

### Application roles

| Role | Semantic token prefix | Size | Line height | Weight | Primary use |
| --- | --- | ---: | ---: | ---: | --- |
| Page title | `--type-role-page-title-*` | 20px | 28px | 550; 500 fallback | Current page or major object title |
| Major workspace heading | `--type-role-major-heading-*` | 16px | 24px | 550; 500 fallback | Primary working-region heading |
| Section heading | `--type-role-section-heading-*` | 14px | 20px | 600 | Dossier and administrative sections |
| Record title | `--type-role-record-title-*` | 13px | 19px | 550; 500 fallback | Queue, ledger and navigation records |
| Primary body | `--type-role-body-*` | 13px | 20px | 400 | Explanations and reading copy |
| Secondary/support | `--type-role-support-*` | 12px | 18px | 400 | Supporting descriptions and context |
| Micro-label | `--type-role-micro-label-*` | 10px | 14px | 600 | Scarce group labels and status vocabulary |
| Technical metadata | `--type-role-technical-*` | 11px | 16px | 400 | Genuine identifiers, timestamps and aligned technical values |

Application text never falls below 10px, never exceeds weight 600, never uses serif and never uses mono decoratively. Geist’s variable weight 550 is approved; environments without a usable intermediate weight must use 500 without changing role metrics.

### Website proof roles

| Role | Semantic token prefix | Metrics | Weight | Family |
| --- | --- | --- | ---: | --- |
| Display serif | `--type-role-display-serif-*` | 52–68px / 1.0 | 500 | Newsreader |
| Product-section sans heading | `--type-role-product-heading-*` | 32–44px / 1.08 | 550; 500 fallback | Geist Sans |
| Website lede | `--type-role-website-lede-*` | 15–17px / 1.6 | 400 | Geist Sans |
| Website action text | `--type-role-website-action-*` | 13px / 20px | 500 | Geist Sans |
| Website eyebrow | `--type-role-website-eyebrow-*` | 10px / 14px / +0.14em | 600 | Geist Sans |

## Current open-source families

- Geist Sans is the application and explanatory sans family.
- Geist Mono is the technical identifier family.
- Newsreader is the public editorial family and appears only in the website specimen.
- Existing `next/font` loading and CSS variables remain unchanged.

## Future licensed targets and licence boundary

The long-term targets are Söhne, Söhne Mono and Tiempos Headline. They are documented targets only. No commercial font file may be sourced, generated, copied, committed, distributed or used without valid licences.

The future mapping is controlled:

| Stable semantic family role | Current family | Licensed target |
| --- | --- | --- |
| Application and explanatory sans | Geist Sans | Söhne |
| Genuine technical identifiers | Geist Mono | Söhne Mono |
| Three approved public narrative moments | Newsreader | Tiempos Headline |

Family replacement must not change semantic role names, hierarchy, metrics, casing rules or line measures.

## Tracking rules

- Large serif: approximately `-0.02em`.
- Large sans headings: approximately `-0.025em`.
- Interface text: approximately `-0.005em` to `0`.
- Mono identifiers: `0`.
- Uppercase micro-labels: approximately `+0.10em` to `+0.14em`.
- Positive tracking is not applied to display typography.

## Casing rules

- Navigation, headings, buttons and ordinary labels use sentence case.
- Uppercase is limited to scarce micro-labels and genuine status vocabulary.
- Mono does not imply uppercase.
- Uppercase never substitutes for hierarchy.

## Mono rules

Geist Mono is allowed for hashes, run IDs, record references such as `F1`, `E1`, `A1` and `C1`, paths, branch names, timestamps, fingerprints, schema/version identifiers and tabular technical values where alignment matters.

It is not allowed for navigation, ordinary buttons, marketing eyebrows, explanatory headings, body copy or non-technical settings descriptions.

### Placeholder policy

Technical identifiers remain mono. Human-readable unavailable or empty explanations remain in sans, including phrases such as “owner unavailable”, “Not run · evidence unavailable” and “PR unavailable”. An exact technical null or schema value may remain mono only when it is genuinely presented as data. Mixed values must separate the identifier from the explanatory prose rather than setting the whole line in mono.

## Serif rules

Newsreader appears only in the website specimen’s approved public narrative headline. No application specimen uses serif. The proof does not expand the three public narrative moments defined by LVOS.

## Numeral rules

Tabular numerals are used for risk scores, requirement counts, timestamps, run comparisons and aligned operational counts. Proportional numerals remain the default in prose.

## Line-length rules

- Application reading copy: approximately 55–75 characters.
- Report/document copy: approximately 65–80 characters.
- Inspector copy: approximately 35–50 characters.
- Website narrative: approximately 45–65 characters.

Long content wraps within its role and never forces type below the normative floor.

### Corrected effective measures

CSS `ch` is a control, not a guarantee of rendered character count. The proof therefore uses an effective 56ch dossier/evidence target, calibrated from the reviewed rendered prose to keep ordinary lines within approximately 65–80 characters; the website lede uses 48ch; proof introduction, specimen descriptions, annotations and review notes use restrained measures that render within approximately 55–75 characters. At wide desktop the website headline uses a controlled 16ch maximum so its existing authored sentence break produces exactly two lines when the narrative column permits it. Final manual captures confirm the rendered result.

## Colour-tier rule

- Primary body uses `--color-text-primary`.
- Secondary/support uses `--color-text-secondary`.
- Micro-labels, technical metadata and genuinely tertiary annotations may use `--color-text-muted`.

This creates hierarchy between adjacent explanation and supporting copy without extra bold weight. In light mode the muted token targets at least 4.5:1 for normal text on canvas, inset and selected planes, preferably approximately 4.8–5.5:1, while remaining visibly quieter than the secondary tier.

## Proof specimens

1. Application shell typography: destination, contextual navigation, breadcrumb, current object, command and shortcut roles.
2. Workspace queue record: selected/unselected rows, long and short PR/repository names, one chip, counts, owner and timestamp.
3. Selected-case inspector: fixed information hierarchy in a 390px plane.
4. Finding and evidence record: `F1` claim with attached `E1` evidence, related `C1` and required action.
5. Merge Contract clause: collapsed and expanded presentations of the same open blocking clause.
6. Administrative settings row: deterministic/model-assisted boundaries, retention, unavailable provider state and separated sensitive action.
7. Website hero: approved Lintel statement, public roles and a small application excerpt.

All product terminology and the primary PR case reuse `lib/mock-report.ts`. No customer, company or usage data is fabricated.

## Approval criteria

- The hierarchy feels like a high-end engineering workstation at dense and editorial scales.
- Operational records remain readable without excessive bold text, cards or decorative containers.
- The dossier reads as a controlled technical document rather than a developer prototype.
- Public sans and mono roles extend naturally from the application; serif remains isolated to public narrative.
- Dark and light themes preserve identical hierarchy, dimensions and behaviour.
- Desktop, intermediate and mobile widths recompose deliberately with no document horizontal scroll.
- At approximately 1440px, the website statement renders as the two authored lines “Agents create code.” and “Lintel verifies what is ready.” without a wide-desktop orphan.
- Dossier/evidence prose remains within the validated 65–80-character rendered range; desktop queue rows generally land at 56–60px and the status chip remains inside its State column.
- Application text is at least 10px and application weights do not exceed 600.
- Mono, serif, tracking, casing, numeral and line-length rules pass visual review.
- A future licensed family replacement can preserve all semantic roles and metrics.

## Explicit non-goals

- Repository-wide typography migration.
- AppShell or navigation restructuring.
- Redesign of `/`, `/workspace`, `/new`, `/report`, `/review-operations`, `/team`, `/settings`, `/review-policies`, `/github-action` or `/slack-handoff`.
- Motion, new product workflows, new APIs, new schemas or new dependencies.
- Font purchase, commercial-font installation or font-file distribution.
- New visual primitives or route archetypes.

## Screenshot and capture checklist

Use the full-page internal route with browser UI excluded unless comparison context requires it.

- Dark theme at approximately 1440px viewport width.
- Light theme at approximately 1440px viewport width.
- Dark theme at approximately 1024px viewport width.
- Light theme at approximately 1024px viewport width.
- Dark theme at approximately 768px viewport width.
- Light theme at approximately 768px viewport width.
- Dark theme at approximately 390px viewport width.
- Light theme at approximately 390px viewport width.
- Focus-visible capture of the theme control or first website action.
- Optional 200% zoom/reflow capture at a 1280px viewport.

For every capture confirm all seven specimen identifiers are present, long identifiers wrap, there is no page-level horizontal scroll, the queue hierarchy remains intact, the inspector uses available width, controls are at least 44px below 900px, Newsreader appears only in the website headline, the wide headline retains its two authored lines, the queue status chip fits its column and dark/light geometry matches.

## Migration decision

**Approved — 15 July 2026.**

The semantic role contract is approved for staged adoption. LVOS-2 through LVOS-6 adoption remains pending, as does global zero-violation enforcement in LVOS-7. A later family licensing decision may replace the families only; it must not reopen the approved roles or metrics. Until each owning milestone begins, no live route should adopt these tokens.
