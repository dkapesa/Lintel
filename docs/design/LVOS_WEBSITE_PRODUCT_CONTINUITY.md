# LVOS website and product continuity

**Status:** Approved and closed — 17 July 2026  
**LVOS baseline:** v1.0  
**Scope:** Public website continuity for `/`, landing navigation/footer and public product exhibits.

**Final verdict:** **APPROVED**

## Scope and approved layer

LVOS-6 retains the seven normative website movements and uses the completed **Archetype C verification dossier** as its public product subject. It changes only the public landing page, its navigation/footer, landing-specific CSS and documentation. The `/report` changes already present on this branch are LVOS-5 alignment corrections, not new LVOS-6 scope. LVOS-6 does not alter `/report` functionality, `/workspace`, the authenticated shell, report logic, review state, APIs, schemas or sample-data meaning.

## Shared website and application truth

Every public exhibit is derived from the same shared demo report and its canonical historical run:

| Shared record | Public website usage |
| --- | --- |
| Example B2B redemption API, PR #482 | Hero, decision context and report CTA identity |
| Add fallback handling for failed discount-code retrieval | Persistent change title |
| `TESTS REQUIRED`, 46/100, medium | Recommendation and risk record |
| F1 and E1 | Finding/evidence exhibit |
| C1 and related E1, E3, A2 | Merge Contract exhibit |
| Open blocking clauses and conditions | Requirement/condition state |
| Engineer decision pending | Human Decision Ledger climax |

The public trace remains: Change → Observation → Evidence → Requirement → Human decision. The website does not fabricate an actor, timestamp, decision outcome, readiness change or recommendation divergence.

Final continuity review verified the canonical shared sample data, terminology, relationships, trace states and Human Decision state against `/report?demo=1`. Website/application continuity is approved without introducing new sample data or product meaning.

## Product primitives adopted

- Dark matte and warm-paper theme materials from the shared semantic tokens.
- Archetype C section outline, dossier header, verification trace, status labels, technical identifiers, hairline record separation and verdict/decision terminology.
- Finding/evidence/condition and Merge Contract clause relationship grammar.
- A connected Human Decision Ledger scene, with the pending state written rather than represented only by colour.

## Seven-movement continuity

0. Navigation links directly to the product exhibit, sample Case File, workspace and security model.
1. The hero is a Case File dossier with a compact report outline, PR identity, trace, recommendation and open requirement context.
2. The readiness gap presents three actual failure records followed by the same written trace.
3. Finding F1, evidence E1 and Merge Contract clause C1 retain their shared relationships.
4. The quiet thesis uses the second of the three allowed Newsreader moments and presents real trust records. Movement 6 is intentionally represented within this Movement 4 trust ledger; this is the accepted sequence interpretation.
5. The widest scene remains the Human Decision Ledger, whose truthful pending state is the terminus.
6. Security and trust are intentionally carried within Movement 4 rather than repeated as a separate visual scene; the claims remain the real server-side credentials, transient diff handling, deterministic baseline and provenance statements.
7. The final action uses the third Newsreader moment and returns to the actual review and sample-report routes.

## Responsive transformation and accessibility

| Width | Landing transformation |
| --- | --- |
| 1440px | Editorial copy and wide product dossier/exhibit crops use bounded bleed while keeping primary proof visible. |
| 1180px | The connected hero dossier remains desktop-composed and all three verdict records remain visible and contained. |
| 1024px | Hero/exhibits retain their connected product planes; wide external bleed is reduced. |
| 768px | Movements stack into narrative followed by readable product records; trace becomes vertical. |
| 390px | The Case File outline becomes a wrapped two-column record index; data rows stack and identifier wrapping remains enabled. Buttons are full-width, at least 44px touch targets. |

The page keeps semantic regions and heading order, a skip link, visible focus treatment, labelled navigation, a keyboard-closeable mobile menu and descriptive aria labels for each static product exhibit. Statuses retain text labels. There is no motion, animation or cropping-only essential information.

## Intentional editorial exceptions

The public page may use wider whitespace, asymmetric product-plane bleed and three Newsreader narrative statements: hero, thesis and final action. These are editorial presentation choices, not alternate application primitives. The hero is the only intentionally elevated public product plane; all other exhibits use restrained document planes and hairline separation.

## Superseded landing dialects

- The generic `Case file / verification ledger` hero framing is superseded by a compact Archetype C dossier outline and main document split.
- The non-interactive `Record decision in the sample report` affordance is superseded by a real sample-report link outside the static exhibit.
- Generalized product-frame elevation is superseded by one deliberate hero plane; finding, contract and decision exhibits are document-led.

## Final bounded correction closure

- **B1 — Hero verdict proof clipping:** Resolved. The verdict grid uses shrink-safe tracks and children, and Risk, Requirements and Conditions remain fully contained without internal or page-level horizontal overflow.
- **B2 — Section heading weights:** Resolved. The four product-section headings compute at `550`; no landing text computes below 10px or above weight 600; Newsreader remains limited to the three approved moments.
- **B3 — Light-theme elevation and trace semantics:** Resolved. Finding, contract and decision frames compute with no shadow in light theme, the hero remains the sole elevated product frame, and open or pending trace nodes use neutral outlines with no danger colour or red halo.

Dark/light and responsive verification is complete at 1440px, 1180px, 1024px and 390px. Theme geometry is unchanged, the mobile menu and theme control remain operational, `/report?demo=1` and `/workspace` remain operational, and no new console errors were observed. `git diff --check`, TypeScript and the production build pass.

## Approval status

LVOS-6 remains bounded to the approved public layer. B1, B2 and B3 are resolved; dark/light and responsive verification is complete; website/application continuity, canonical shared sample data and exactly three Newsreader moments are verified. Movement 6 remains intentionally represented within Movement 4 as the accepted sequence interpretation. The `/report` changes on this branch are corrective LVOS-5 alignment changes rather than new LVOS-6 scope.

**Final verdict: APPROVED. No LVOS-6 blockers remain.**
