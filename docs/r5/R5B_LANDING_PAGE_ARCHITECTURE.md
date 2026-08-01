# Lintel R5B Landing Page Architecture

Authoritative narrative and architecture for the Lintel public homepage.

This document composes the homepage inside R5A_DIRECTION_LOCK.md. It does not reopen the visual direction. It inherits Precise Product Editorial, One Continuous Case, the locked hero headline and trust line, Geist Sans and Geist Mono, two charcoal sections, three motion moments and the unresolved canonical case. R5C implements from this document.

R5B authorises no code and no repository changes.

---

## 1. R5B outcome

The homepage is one continuous walk through a single unresolved review. A visitor arrives at a real Workspace holding the change **Add fallback handling for failed discount-code retrieval**, learns why verification is now the bottleneck, sees the eight stage model that structures the review, enters the Investigation Workspace where the finding is examined, watches evidence connect to that finding while missing proof and its requirement become explicit, reaches a readiness summary that stays blocked, reads how the system is built and where its boundaries end, and is invited to open the same review and judge it. The recommendation stays **Tests required**, requirements stay **4 open · 2 blocking**, and **Human Decision pending** is never resolved on the page.

One architecture is specified. No alternative page structure, section order, headline set or scene plan remains open. R5C selects execution values, not narrative.

---

## 2. Visitor understanding target

The visitor is a working engineer or engineering lead who reviews changes and is accountable for what merges.

**a. After the first viewport**

1. This is a verification product for code changes, not a chat assistant and not a linter.
2. There is a real interface here, at readable scale, holding a real review.
3. The product produces a recommendation, a risk figure, an open requirement count and a pending human decision, and those are four separate things.
4. The engineer decides. The product does not approve.

**b. After the first three sections**

1. Verification, not authorship, is the constraint on shipping.
2. Lintel answers readiness by connecting records, not by scoring an opinion.
3. The model uses eight stages to structure the review: change, finding, evidence, missing proof, requirement, affected context, readiness, Human Decision.
4. Missing proof is a first class stage, not an absence.
5. The same review is being followed the whole way down the page.

**c. After the complete page**

1. How a single review moves from arrival to the point where an accountable Human Decision can be made. The case remains unresolved. Human Decision remains pending. No outcome is recorded.
2. That a recommendation is separated from readiness, and readiness is separated from authority.
3. That the review on screen is still unresolved, and why: two blocking requirements, two missing or unverified evidence records, one stale record.
4. That analysis is deterministic by default and model assistance is optional.
5. That reports created through supported browser based review flows may be stored in the current browser, and that the public sample exposes its handoff boundaries explicitly.
6. What to do next: open the sample review, or start a review of your own.

---

## 3. Global page shell

**a. Header responsibility**

Hold identity and the primary action, and nothing else. The header is not a product surface, does not summarise the review, and never displays recommendation, risk, requirement or decision values. That prohibition is what keeps the rejected fixed summary band out of the page.

**b. Navigation labels**

Three labels only, all resolving to positions on this page:

1. Product
2. How it works
3. Security

Product scrolls to section 4, Investigation Workspace. How it works scrolls to section 3, the verification model. Security scrolls to section 7, trust and architecture. Docs and Changelog do not appear. See section 16.

**c. Primary action**

`Open the sample review`. It routes to the existing read-only sample review surface, the same review the page has been describing.

**d. Secondary action**

`Start a review`. It routes to the existing `/new` route. It appears beside the primary action in the hero and in the final action section. `How it works` is not a secondary action. It is one of the three header navigation anchors, an in page anchor to section 3, and it does not appear as a hero action.

**e. Header behaviour while scrolling**

Static at the top of the document, not fixed and not sticky. It scrolls away with the page and does not return. The page has no persistent chrome. This follows the R5A rejection of persistent public structure and removes any element that could be mistaken for product behaviour. On mobile the header is equally static, with identity on the left and the primary action reduced to a compact text action on the right. Below the mobile navigation breakpoint, the three anchor labels are omitted. The header retains identity and the compact primary action only. No menu drawer is introduced.

**f. Broad content width logic**

1. Editorial column: roughly 1200 pixels maximum, with body copy set to a 60 to 70 character measure inside it.
2. Product scenes: permitted to break wider, to roughly 1360 pixels, only where a genuine crop needs the width.
3. Charcoal sections: full bleed background, content held to the editorial column.
4. Outer margins stay wide. Product scenes are never given internal breathing room to look attractive.

**g. Footer responsibility**

Minimal and honest. Identity, a single line restating the trust statement, the same three on page links, and a legal line. No newsletter capture, no social proof, no sitemap of pages that do not exist, no status or uptime claim, no organisation or enterprise language.

No control appears anywhere in the shell for a capability that does not exist. There is no sign in, no account, no pricing, no language switcher and no search.

---

## 4. Homepage narrative sequence

The eight responsibilities are ordered as a single investigation, not as a feature list. Each one inherits the state the previous one left behind.

1. **Hero** establishes the object of study. The review exists, it is real, and it is unresolved. Everything after this is an explanation of what is already on screen.
2. **Verification problem** explains why that unresolved state is the normal condition now. Changes arrive faster than proof does. Without this the visitor reads the hero as a dashboard.
3. **Verification model** answers the immediate objection: how does anything on this page know that. The eight stage sequence is shown before any interface detail, so every later scene is recognisable as a stage rather than a screen. It is charcoal because it is the one moment the page steps out of the case to state a structure.
4. **Investigation Workspace** returns to the case with the model in hand. The visitor now sees stages one through three in a real interface: the change, the primary finding, and the beginning of evidence.
5. **Missing proof and requirements** carries stages four and five. It can only land after evidence exists, because missing proof is defined against canonical evidence. This is where the case becomes genuinely unresolved rather than merely incomplete.
6. **Readiness and Human Decision** carries stages six through eight. It can only land after requirements exist, because readiness is a summary of blockers. The four cell summary grammar from the hero returns here, closing the loop the hero opened.
7. **Trust and architecture** answers the questions the visitor has accumulated by watching the case: what produced this, was a model involved, where does the record live, what leaves this machine. It is charcoal because responsibility shifts from the case to the system. It comes after the decision surface, not before, because the questions only become real once the visitor has seen a decision being asked for.
8. **Final action** returns to the same review, still unresolved, and invites the visitor to inspect it directly, either by opening the read-only sample or by starting a review of their own. The page ends where it began, with the case handed to the visitor rather than concluded.

The case advances by exactly one product stage or one interpretive step per section. No section restates a previous section, and no section introduces a second example.

---

## 5. Section architecture

All copy below is the single working direction. No alternatives are offered. All quoted product text is exact and must not be paraphrased in a scene.

---

### Section 1

**a. Section number:** 01
**b. Responsibility:** Hero
**c. Visitor question answered:** What is this, and what is it looking at right now.
**d. Eyebrow:** `01 · ONE REVIEW`
**e. Working headline:** Know what is ready to merge.
**f. Working supporting copy:** Lintel connects a change to its findings, its evidence, its missing proof and its open requirements, so an engineer can judge readiness and record an accountable decision.
**g. Product scene or visual responsibility:** Scene A. The dominant, near full width Workspace scene. Review Queue rail open, Contextual Inspector closed, the Overview record of PR #482 in the centre. It must be understandable with the copy removed.
**h. Exact canonical facts that must appear:**

- `example/b2b-redemption-api · PR #482`
- `Add fallback handling for failed discount-code retrieval`
- `SELECTED REVIEW · READ-ONLY SAMPLE`
- `SAMPLE FIXTURE DATA · EXPLICIT FIXTURE`
- Four cell band: `LINTEL RECOMMENDATION Tests required` · `RISK 46/100 MEDIUM` · `REQUIREMENTS 4 open · 2 blocking` · `HUMAN DECISION Human Decision pending`
- `NEXT INSPECTION Provider failure cases absent from test suite`
- `01 HIGH · PRIMARY FINDING Retry behaviour may create duplicate redemption risk`
- `PROOF Evidence boundary 5 canonical evidence records. 2 missing or unverified; 1 stale.`
- `CONDITIONS Requirements 4 open · 2 blocking.`
- Bottom bar: `Merge readiness blocked` and `2 blockers · 2 missing/unverified · 1 stale` and `Review decision context · Human Decision pending`

**i. Crop or composition guidance:** Full Workspace frame from the left rail through the bottom readiness bar. Crop the top of the record at the header line and the bottom at the readiness bar, so both the four cell band and the readiness bar are inside one frame. Do not crop away the left icon rail; it establishes that this is an application. The scene sits as a white surface with a fine structural border and restrained optical separation from the page ground, breaking wider than the editorial column. No visible decorative shadow. No browser chrome.
**j. Transition into the next section:** The hero states a readiness answer. Section 2 asks why that answer is hard to produce. The transition is a change of register from instrument to argument, carried by whitespace only.
**k. Desktop behaviour:** Copy block above, centred or left aligned to the editorial column, scene below at up to 1360 pixels. Copy occupies the top third of the viewport, the scene begins inside the first viewport and continues past its lower edge.
**l. Mobile behaviour:** Same six elements in the same order. The scene switches to the genuine mobile queue view, showing PR #482 in `NEEDS ATTENTION` with `TESTS REQUIRED`, `MEDIUM 46`, `2B`, `4 open`, `improved`. The desktop Workspace is never shrunk.
**m. Motion responsibility:** Motion moment one. The Queue row for PR #482 settles into its selected presentation. The row and the centre record are both present, complete and readable without motion.

---

### Section 2

**a. Section number:** 02
**b. Responsibility:** Verification problem
**c. Visitor question answered:** Why is this a problem worth a product.
**d. Eyebrow:** `02 · THE PROBLEM`
**e. Working headline:** Changes arrive faster than proof does.
**f. Working supporting copy:** More changes are produced by more people and more tools, and each still needs someone to establish what is verified and what is not. Reading the change is only the start. The harder work is reconstructing what is known, what is assumed and what still needs proof.
**g. Product scene or visual responsibility:** Scene B. A restrained crop, not a full interface. The `NEXT INSPECTION` banner beside the `PROOF Evidence boundary` cell, presented as two adjacent record fragments.
**h. Exact canonical facts that must appear:**

- `NEXT INSPECTION Provider failure cases absent from test suite`
- `Why This derived missing or unverified proof blocks 1 requirement and is not current verified evidence.`
- `Evidence boundary 5 canonical evidence records. 2 missing or unverified; 1 stale.`

**i. Crop or composition guidance:** Tight. Two small white surfaces at roughly half the editorial column each, or stacked if the measure demands it. Deliberately smaller than the hero scene so the page does not read as two heroes. Fine structural borders, restrained optical separation, no decorative shadow.
**j. Transition into the next section:** The section names an unanswered question. Section 3 answers it structurally. The transition is a hard change of surface into charcoal.
**k. Desktop behaviour:** Text left, two stacked record fragments right, or text above and fragments in a two column pair below. Narrower than the hero by design.
**l. Mobile behaviour:** Text, then the two fragments stacked vertically at full width. Preserved desktop crops, because both fragments are small and already legible at mobile width.
**m. Motion responsibility:** None.

---

### Section 3

**a. Section number:** 03
**b. Responsibility:** Verification model
**c. Visitor question answered:** How does Lintel decide anything, and can I trust the shape of it.
**d. Eyebrow:** `03 · THE VERIFICATION MODEL`
**e. Working headline:** Eight stages structure the review.
**f. Working supporting copy:** A change can produce findings. Canonical evidence supports or weakens them. Missing or unverified evidence is shown as missing proof. Blocking gaps can surface requirements. Requirements and affected context inform readiness. The accountable engineer retains the Human Decision.
**g. Product scene or visual responsibility:** Scene C. The eight stages as an editorial record in charcoal, using The Case Record grammar: monospace stage numbers, hairline rules, one stage per row. Beside or beneath it, one genuine product inset on a white surface showing the real Review Map stage header row from the Case File. The product inset is never recoloured to sit in the dark section. It remains a light surface inside a dark section.
**h. Exact canonical facts that must appear:**

- Stage labels and numbers in product order: `01 Change`, `02 Finding`, `03 Evidence`, `04 Missing proof`, `05 Requirement`, `06 Affected context`, `07 Readiness`, `08 Human Decision`
- `RELATIONSHIP ORIENTATION` and `Review Map`
- `Stage order is orientation only. The active relationship records below are the only asserted edges; no link is inferred from visual proximity.`
- Enough genuine product context surrounding the stage row to establish fidelity to the real Review Map.

**i. Crop or composition guidance:** The editorial record is full editorial column width, one stage per row, aligned on the monospace numbers. The product inset crops the Review Map stage columns only, from the `RELATIONSHIP ORIENTATION` label down to the base of the stage column headers with the first record row visible. Do not crop the orientation caveat away. Do not crop the Case Record index into the frame, because a public page must not appear to offer a persistent index. Prefer a crop that excludes the conflicting captured terminal values `07 Readiness Unavailable` and `08 Human Decision None recorded`; the inset is not required to display them. A replacement capture is needed only if no truthful crop can preserve all eight stage labels and the orientation caveat while excluding those values.
**j. Transition into the next section:** The model has been stated in the abstract. Section 4 returns to the instrument. The transition is charcoal back to the warm neutral ground, with the section 4 scene beginning immediately so the return is carried by the product rather than by empty space.
**k. Desktop behaviour:** Two column. Editorial stage record left at roughly two thirds, product inset right at roughly one third, top aligned. The stage record does not scroll independently.
**l. Mobile behaviour:** Focused vertical record. Eight stages stacked, one per row, full width, monospace numbers in a fixed left gutter. The Review Map inset becomes a horizontally scrollable region with a visible stage index, since the map has no mobile equivalent. Text order unchanged.
**m. Motion responsibility:** None. This section is deliberately still.

---

### Section 4

**a. Section number:** 04
**b. Responsibility:** Investigation Workspace
**c. Visitor question answered:** What does the actual work look like.
**d. Eyebrow:** `04 · THE INVESTIGATION WORKSPACE`
**e. Working headline:** One place to investigate the whole review.
**f. Working supporting copy:** The Workspace holds the change, the findings, the evidence and the requirements as one record. The Contextual Inspector answers the question you are holding without losing the review you are in, so an investigation can be sustained across findings instead of restarted at every tab.
**g. Product scene or visual responsibility:** Scene D. The Workspace in Inspector mode. Review Queue closed, Contextual Inspector open on the right, the record centre. This is the deliberate inverse of the hero, which showed the Queue open and the Inspector closed.
**h. Exact canonical facts that must appear:**

- Record tabs in order: `Overview`, `Change`, `Evidence`, `Requirements`, `History`
- `CONTEXT Inspector`
- `DECISION READINESS · NOT A DECISION`
- The Inspector metadata rows, including `LINTEL RECOMMENDATION`, `OPEN BLOCKERS`, `MISSING/UNVERIFIED PROOF`, `STALE EVIDENCE`, `CURRENT RUN`, `CURRENT HEAD`, `PRIOR HUMAN DECISION`, `WHAT CHANGED`
- Provenance line in monospace: `Run`, `Head 9c41af2`, `Branch fix/discount-code-retrieval-fallback`
- Canonical values only: `Tests required`, blockers `2`, missing or unverified `2`, stale `1`

**i. Crop or composition guidance:** Frame from the record header through the Inspector panel, wide crop up to 1360 pixels. The Inspector must be fully legible; the centre record may be cropped at its right edge by the Inspector, which is how the product behaves. Do not open the Queue in this scene. Do not stack two Workspace images.
**j. Transition into the next section:** This section shows where the work happens. Section 5 shows the one thing the work could not find. The transition narrows from full instrument to a single tab of it.
**k. Desktop behaviour:** Text block in the editorial column, scene below at full scene width. A short product caption sits beneath the scene naming the mode shown.
**l. Mobile behaviour:** Genuine mobile product view. The mobile record view replaces the desktop Workspace, showing `FINDING · HIGH`, the finding title, `CATEGORY Reliability`, `PROVENANCE Rule detected`, `CURRENT APPLICABILITY Current projection · 9c41af2`, `AFFECTED SURFACE app/services/redemption_service.py:118`. Text order unchanged.
**m. Motion responsibility:** None.

---

### Section 5

**a. Section number:** 05
**b. Responsibility:** Missing proof and requirements
**c. Visitor question answered:** What does Lintel do about what it cannot confirm.
**d. Eyebrow:** `05 · MISSING PROOF`
**e. Working headline:** What is not proven is stated, not assumed.
**f. Working supporting copy:** The retry path is observed. The idempotency guard is not. Lintel keeps findings, canonical evidence and derived missing or unverified proof as distinct records, so the gap between what is observed and what is confirmed stays visible. A blocking gap can surface an open requirement.
**g. Product scene or visual responsibility:** Scene E. The Evidence tab of the same review, showing the finding, its supporting canonical evidence, the derived missing or unverified proof block, and the requirement that follows.
**h. Exact canonical facts that must appear:**

- `EVIDENCE What supports or weakens the recommendation?`
- `Findings, canonical evidence and derived missing/unverified proof remain distinct records.`
- `DERIVED PRESENTATION · CANONICAL EVIDENCE STATUS` and `Missing or unverified proof`
- `Retry behaviour may create duplicate redemption risk`, `HIGH · Reliability`
- Supporting evidence: `Retry path observed in redemption service` marked `confirmed`, and `No idempotency key present on redemption write` marked `present`
- `Repeated retry after provider timeout does not issue duplicate discount codes`, `Derived from canonical evidence status: missing`, `Derived · not persisted`
- `Prove merge condition`, `blocking · open`
- `Missing-proof presentation is derived from canonical evidence status; no dedicated stored missing-proof object is claimed.`
- Counts unchanged: `5 canonical evidence records. 2 missing or unverified; 1 stale.` and `4 open · 2 blocking`

**i. Crop or composition guidance:** Three stacked record fragments inside one framed white surface, in stage order: finding, then evidence with the missing proof block, then the requirement. Crop tightly around each fragment. Do not reproduce the repeated stress records from the dense fixture. Do not invent a connector graphic between fragments; relationship is expressed by the product's own labels and by vertical order.
**j. Transition into the next section:** The requirement exists and is open. Section 6 asks what that means for readiness. The transition is a summary step, from one requirement to the whole review.
**k. Desktop behaviour:** Text left in a narrow column, scene right at roughly two thirds, so the section reads as an annotated record rather than another full width instrument.
**l. Mobile behaviour:** Genuine mobile record view, using the mobile finding record with `SUPPORTING EVIDENCE`, `supported by · 2 direct`, `Explicit stored relationship`, then `REQUIREMENTS`. Focused vertical record. Text precedes the scene.
**m. Motion responsibility:** Motion moment two. Evidence connects to the finding, missing proof becomes visible, the related requirement follows.

---

### Section 6

**a. Section number:** 06
**b. Responsibility:** Readiness and Human Decision
**c. Visitor question answered:** Who decides, and does the product decide for me.
**d. Eyebrow:** `06 · READINESS`
**e. Working headline:** Lintel recommends. The accountable engineer decides.
**f. Working supporting copy:** Readiness summarises what still blocks the change. It is not an approval and it is not a score to be overridden quietly. When the engineer opens the decision surface, no outcome is selected from Lintel's recommendation, and a rationale is required before anything is recorded.
**g. Product scene or visual responsibility:** Scene F. Three layers of the same review in one composition: the four cell summary band returning, the bottom readiness bar, and the `Record Human Decision` surface opening above them with no outcome selected.
**h. Exact canonical facts that must appear:**

- Four cell band exactly as in the hero: `Tests required` · `46/100 MEDIUM` · `4 open · 2 blocking` · `Human Decision pending`
- `Merge readiness blocked` and `2 blockers · 2 missing/unverified · 1 stale`
- `Review decision context · Human Decision pending`
- `ACCOUNTABLE ENGINEER ACTION` and `Record Human Decision`
- `Lintel recommends. The accountable engineer decides.`
- `Outcome *` and `No outcome is selected from Lintel's recommendation.`
- All seven outcomes in product order with their descriptions: `Approve`, `Approve with accepted risk`, `Tests required`, `Review required`, `Request changes`, `Blocked`, `Defer decision`
- `Rationale *` with the placeholder `State the engineering judgment, unresolved proof, and why this outcome is accountable.`
- Footer actions `Cancel` and `Record Human Decision`, with `Record Human Decision` in its disabled resting state

**i. Crop or composition guidance:** The modal frame is the focal surface, with the dimmed Workspace behind it cropped just enough to show the four cell band and the readiness bar. Every radio control must be visibly unselected. The disabled state of the submit action must be preserved, not tidied. Do not crop away the required rationale field, because it is part of the accountability claim.
**j. Transition into the next section:** The decision has been asked for and not taken. Section 7 explains what produced the material the decision rests on. The transition is a change of surface into the second charcoal section.
**k. Desktop behaviour:** Text above in the editorial column, scene below at full scene width. The four cell band should sit at roughly the same horizontal position as it did in the hero, so the returning grammar is recognised.
**l. Mobile behaviour:** Focused vertical record. The four cell band becomes four stacked labelled rows from the genuine mobile record surface, followed by the readiness state, followed by the decision surface cropped to the outcome list with no selection. Horizontal scrolling is not used here; readiness must be read in one direction.
**m. Motion responsibility:** Motion moment three. The Human Decision surface opens with no outcome selected. No decision is recorded.

---

### Section 7

**a. Section number:** 07
**b. Responsibility:** Trust and architecture
**c. Visitor question answered:** What produced this, and what leaves my machine.
**d. Eyebrow:** `07 · ARCHITECTURE`
**e. Working headline:** Deterministic first. Model assistance stays optional.
**f. Working supporting copy:** Deterministic analysis provides the baseline through explicit, traceable rules. Model assistance is optional and identified in provenance when used; it does not select or record the Human Decision. Reports created through supported browser based review flows may be stored in the current browser. The public sample performs no external write, and the environment shown states each handoff capability explicitly.
**g. Product scene or visual responsibility:** Scene G. Low density Case Record grammar in charcoal carrying the eight architecture statements, with one light product inset showing the genuine handoff panel from the Contextual Inspector.
**h. Exact canonical facts that must appear:**

- `LOCAL REPORT · STORED ON THIS DEVICE`
- `Browser-local · maximum 10`
- `GitHub App` `NOT CONFIGURED`, with `Implemented capability is not configured for this environment.`
- `GitHub Action` `BLUEPRINT`, with `Does not install, execute, connect or post.`
- `Slack handoff` `EXPORT-ONLY`, with `Copies or downloads; it does not send.`
- `DECISION READINESS · NOT A DECISION`
- `09 Export & handoff` as the product's own named responsibility

**i. Crop or composition guidance:** The charcoal record is the editorial column. The product inset is a narrow white surface cropping the Inspector's integration rows only, from `GitHub App` to the end of the `Slack handoff` description. Lower density than section 3: fewer rows, more space between them, no numbered stage column beyond the statement numbers. The inset stays light.
**j. Transition into the next section:** Architecture is stated and the page returns to the case. The transition back to light is carried by the final action section opening with the same review title the hero opened with.
**k. Desktop behaviour:** Statements in a single column with hairline rules, product inset right aligned beside statements f and h, which are the two it evidences.
**l. Mobile behaviour:** Focused vertical record. Statements stacked full width. The handoff inset stays a preserved desktop crop, since its rows are already narrow and legible.
**m. Motion responsibility:** None.

---

### Section 8

**a. Section number:** 08
**b. Responsibility:** Final action
**c. Visitor question answered:** What do I do now.
**d. Eyebrow:** `08 · CONTINUE`
**e. Working headline:** Inspect the review for yourself.
**f. Working supporting copy:** The case remains unresolved. Open the read only sample to follow its evidence, or start a review with your own change.
**g. Product scene or visual responsibility:** Scene H. A minimal crop only: the review header line and the four cell band, nothing else. The instrument closes to a single line of record.
**h. Exact canonical facts that must appear:**

- `example/b2b-redemption-api · PR #482`
- `Add fallback handling for failed discount-code retrieval`
- `Tests required` · `46/100 MEDIUM` · `4 open · 2 blocking` · `Human Decision pending`
- `SELECTED REVIEW · READ-ONLY SAMPLE`

**i. Crop or composition guidance:** One narrow white surface at editorial column width, holding two rows. It must be visibly smaller than every other scene on the page. Actions sit beneath it, not inside it.
**j. Transition into the next section:** None. The footer follows after generous space.
**k. Desktop behaviour:** Centred within the editorial column. Headline, supporting copy, minimal crop, then primary and secondary actions, then the trust line repeated once at small size.
**l. Mobile behaviour:** Same order at full width. The crop becomes the two mobile queue rows for PR #482 rather than a shrunk desktop band.
**m. Motion responsibility:** None.

---

## 6. Hero contract

The hero contains exactly the six locked elements. The reading order below is the specified composition order and is not open to reinterpretation.

1. Proposition line: **Know what is ready to merge.**
2. Supporting explanation, at most two lines.
3. Primary action.
4. Secondary action.
5. Trust line, small and quiet, beneath the actions.
6. Workspace scene, dominant.

**a. Supporting copy**

Lintel connects a change to its findings, its evidence, its missing proof and its open requirements, so an engineer can judge readiness and record an accountable decision.

**b. Action labels**

Primary: `Open the sample review`. Secondary: `Start a review`, routing to the existing `/new` route.

**c. Product scene resting state**

Review Queue rail open with PR #482 already selected. Contextual Inspector closed. The Overview record of the selected review in the centre. Queue and Inspector are never both fully open. This is one investigation responsibility with focus, not a maximally populated interface.

**d. What must remain legible**

All six preserved scene elements, at real reading scale:

1. The selected review title and provenance, including `SELECTED REVIEW · READ-ONLY SAMPLE` and `example/b2b-redemption-api · PR #482`
2. The four cell summary band: `Tests required`, `46/100 MEDIUM`, `4 open · 2 blocking`, `Human Decision pending`
3. The next inspection context: `Provider failure cases absent from test suite`
4. The primary finding: `01 HIGH · PRIMARY FINDING Retry behaviour may create duplicate redemption risk`
5. Evidence boundary and Requirements: `5 canonical evidence records. 2 missing or unverified; 1 stale.` and `4 open · 2 blocking`
6. The bottom readiness context: `Merge readiness blocked` and `Review decision context · Human Decision pending`

**e. What remains closed or secondary**

The Contextual Inspector is closed. The Commands control, the layout toggles and the fullscreen control are present because they are genuinely present, but they are not focal and are not annotated. The `Preview decision flow` action is visible in the readiness bar and is not emphasised, because the decision surface belongs to section 6. The `MOVEMENT improved since previous run` block may fall below the crop line. No public annotation, callout, arrow or highlight is drawn on the scene.

**f. First motion moment**

The Queue row for PR #482 settles into its selected presentation. Complete state, present without motion: the Queue rail already shows the PR #482 row in `NEEDS ATTENTION`, already in its selected state, alongside its other rows, and the centre record is already fully populated for PR #482. The centre record is never shown active while its Queue row is absent. On trigger, once hydration and motion support are established, the already present row plays its settle into the selected presentation. Opacity and small translation only. The record does not change, reflow or rebuild. All hero content is readable before, during and without motion, and the motion fires once.

**g. Desktop composition**

Copy block at the top of the editorial column, left aligned, occupying roughly the upper third of the first viewport. Actions beneath the copy. Trust line beneath the actions at small size in warm grey. The scene begins below and breaks wider than the editorial column, up to 1360 pixels, and deliberately continues past the lower edge of the viewport so the interface reads as larger than the frame. The product is never placed in a small decorative card.

**h. Mobile composition**

Same six elements, same order, full width. The scene is the genuine mobile queue view showing PR #482 with `TESTS REQUIRED`, `MEDIUM 46`, `2B`, `4 open`. Section spacing compresses to roughly half. No fixed summary band and no persistent index.

**i. Content visible before scrolling**

On standard desktop: headline, supporting copy, both actions, the trust line, and the upper portion of the scene including the review title, provenance and the complete four cell band. On mobile: headline, supporting copy, primary action, and the top of the mobile queue view. The trust line and secondary action may fall just below the fold on small phones. Nothing that is required to understand the product depends on motion.

---

## 7. Canonical case progression

One case, eight sections, no altered values. The table maps where each product stage first becomes visible to the visitor.

| Stage | Locked content | First shown | Reinforced |
|---|---|---|---|
| a. The change | `Add fallback handling for failed discount-code retrieval`, `example/b2b-redemption-api · PR #482`, `Branch fix/discount-code-retrieval-fallback`, `Head 9c41af2` | Section 1, hero scene header | Section 3 stage `01 Change`, section 8 |
| b. The finding | `01 HIGH · PRIMARY FINDING Retry behaviour may create duplicate redemption risk`, category `Reliability`, provenance `Rule detected` | Section 1, hero scene body | Section 3 stage `02 Finding`, section 4 mobile, section 5 |
| c. Observed evidence | `Retry path observed in redemption service` `confirmed`, `No idempotency key present on redemption write` `present`, boundary `5 canonical evidence records` | Section 2, evidence boundary fragment | Section 3 stage `03 Evidence`, section 5 |
| d. Missing proof | `2 missing or unverified; 1 stale`, `Repeated retry after provider timeout does not issue duplicate discount codes`, `Derived from canonical evidence status: missing`, `Derived · not persisted`, `Provider failure cases absent from test suite` | Section 2, next inspection fragment | Section 3 stage `04 Missing proof`, section 5 as the motion focus |
| e. Requirement | `4 open · 2 blocking`, `Prove merge condition`, `blocking · open`, `derived requirements remain read-only` | Section 1, four cell band and Requirements cell | Section 3 stage `05 Requirement`, section 5 conclusion |
| f. Affected context | `app/services/redemption_service.py:118`, `affects · 1 direct`, `Deterministic derived relationship`, `Backend reliability`, `API contract`, `Security/privacy` | Section 3 stage `06 Affected context` | Section 4 mobile record view |
| g. Readiness | `Merge readiness blocked`, `2 blockers · 2 missing/unverified · 1 stale`, `RISK 46/100 MEDIUM`, `CONFIDENCE MEDIUM` | Section 1, bottom readiness bar | Section 3 stage `07 Readiness`, section 6 as the summary focus |
| h. Human Decision authority | `Human Decision pending`, `Lintel recommends. The accountable engineer decides.`, `No outcome is selected from Lintel's recommendation.`, `DECISION READINESS · NOT A DECISION`, `Rationale *` | Section 1, four cell band | Section 3 stage `08 Human Decision`, section 6 as the motion focus, section 7 |

Constants across all eight sections, never altered and never resolved:

1. Recommendation stays `Tests required`.
2. Risk stays `46/100 MEDIUM`. Confidence stays `MEDIUM`.
3. Requirements stay `4 open · 2 blocking`.
4. Evidence stays `5 canonical evidence records. 2 missing or unverified; 1 stale.`
5. Readiness stays `Merge readiness blocked`.
6. `Human Decision pending` is never replaced.
7. No requirement clears anywhere on the page. The `MOVEMENT improved since previous run` block describes requirements cleared before the current head and is a historical product statement, not a page event. It may appear inside a scene and must never be used as a public claim of progress.

---

## 8. Verification model section

**Case Record grammar, bounded to this section**

The Case Record grammar is permitted here and in section 7 only. In this section it is fully expressed:

1. A numbered record structure, one stage per row.
2. Geist Mono for stage numbers only. All stage names and prose remain Geist Sans.
3. Hairline rules as the only structural device. No cards, no boxes, no connector arrows, no flow diagram.
4. Rows sit on a single alignment grid: monospace number in a fixed gutter, stage name, then a one line description.

No persistent index is produced by this treatment. The rows are content within one section and scroll away with it.

**The eight stages, preserved in order**

| No. | Stage | Public one line description |
|---|---|---|
| 01 | Change | What was changed, with its branch, head and files. |
| 02 | Finding | What in that change may matter, with severity and provenance. |
| 03 | Evidence | Canonical records that support or weaken the finding. |
| 04 | Missing proof | Where canonical evidence is missing, unverified or stale. |
| 05 | Requirement | What must be proven before the change can progress. |
| 06 | Affected context | The surfaces and concerns the change reaches. |
| 07 | Readiness | The current blocking state of the review. |
| 08 | Human Decision | The outcome reserved for the accountable engineer. |

**What may be simplified for public legibility**

1. The number of records shown per stage may be reduced. The Review Map inset may show the stage columns with their first record row rather than every record.
2. Per record metadata such as `Stored record` may be omitted from the editorial rows, since it is visible in the product inset.
3. The relationship detail panel with `weakens`, `lacks proof for` and `applies to` may be omitted from this section.
4. The Case Record navigation index from the Case File must be cropped out, not simplified in.

**What must remain exact**

1. All eight stage names, spelled as the product spells them, in product order.
2. Stage numbers `01` through `08` matching the product's own numbering.
3. Missing proof and affected context both present as their own stages. Neither may be merged, folded into a neighbour or dropped.
4. The orientation caveat: `Stage order is orientation only. The active relationship records below are the only asserted edges; no link is inferred from visual proximity.` This must appear in the section, because the editorial row sequence would otherwise imply asserted relationships the product does not assert.
5. The inset is not required to display the captured terminal values `07 Readiness Unavailable` and `08 Human Decision None recorded`. Prefer a crop that excludes them while preserving all eight stage labels and the orientation caveat. The public section must not imply the last two stages are populated with a decided outcome.
6. No relationship is drawn between stages that the product does not assert.

**How charcoal supports meaning**

The dark surface marks the one moment the page stops narrating the case and states the structure underneath it. It is a change of register at a change of responsibility, and it lasts exactly as long as that responsibility. Three consequences follow:

1. The product inset stays light. Charcoal applies to the editorial frame, never to a product surface, because recolouring the product would be a restyle.
2. Semantic colour is largely absent here. This section is about structure, not severity, so ochre, red and green appear only inside the product inset where the product itself uses them.
3. The section is deliberately still. No motion, no accent, no illustration. Its authority comes from alignment and from the fact that it is the only place on the page that looks like this, apart from section 7 at lower density.

---

## 9. Investigation Workspace section

**How the genuine Workspace is framed**

The scene is a real region of the frozen R4 Workspace on a white surface with a fine structural border and restrained optical separation from the page ground, set in a light frame. No browser chrome, no device mockup, no tilt, no floating fragments, no added radius, no decorative shadow, no recoloured state, no invented label. The public page crops and frames. It does not restyle.

**Which mode is shown**

Contextual Inspector open, Review Queue closed. This is the deliberate inverse of the hero, and together the two scenes teach the Workspace's single rule without ever showing both panels open at once. The visitor learns that attention moves between responsibilities rather than accumulating panels.

**What the Inspector contributes**

The Inspector is shown answering a question about the current review without leaving it. The section caption names this and nothing more. The Inspector's own header states `DECISION READINESS · NOT A DECISION`, which does the trust work directly, so the public copy does not need to assert it. The Inspector rows shown carry `LINTEL RECOMMENDATION`, `OPEN BLOCKERS`, `MISSING/UNVERIFIED PROOF`, `STALE EVIDENCE`, `CURRENT RUN`, `CURRENT HEAD`, `PRIOR HUMAN DECISION` and `WHAT CHANGED`, with canonical values only.

**What must remain legible**

1. The five record tabs in order: `Overview`, `Change`, `Evidence`, `Requirements`, `History`.
2. The Inspector header and `DECISION READINESS · NOT A DECISION`.
3. At least four Inspector metadata rows with their values.
4. The monospace provenance line with `Head 9c41af2` and `Branch fix/discount-code-retrieval-fallback`.
5. The review title, so the visitor knows this is still the same case.

**How the visitor understands sustained investigation**

Through three signals, all of them already in the product. First, the tab row shows the review has several dimensions and the visitor is still inside one review. Second, the Inspector answers alongside the record instead of replacing it. Third, the provenance line stays constant against the hero, so the visitor recognises the same run and the same head. No public annotation, arrow, callout or animation is added to make this point. If the crop does not make it, the crop is wrong.

---

## 10. Missing proof and requirements section

**The relationship between the four record types**

The product's own semantics, restated without extension:

1. A **finding** is an assertion about the change that may matter.
2. **Canonical evidence** is a stored record that supports or weakens that finding.
3. **Missing proof** is a derived presentation of canonical evidence status. It is what canonical evidence does not cover, or covers in an unverified or stale form. It is not a separate stored object, and the section must carry the product's own qualifier: `Missing-proof presentation is derived from canonical evidence status; no dedicated stored missing-proof object is claimed.`
4. A **requirement** is what must be proven before progress. Requirements that block are counted as blocking. Derived requirements remain read-only.

The section must show that findings, canonical evidence and derived missing or unverified proof `remain distinct records`. Collapsing them into a single list would misrepresent the product.

**Resting state before motion**

Everything is present and readable. The framed surface shows, top to bottom:

1. The finding: `Retry behaviour may create duplicate redemption risk`, `HIGH · Reliability`.
2. Its supporting canonical evidence: `Retry path observed in redemption service` marked `confirmed`, and `No idempotency key present on redemption write` marked `present`.
3. The derived missing proof block: `DERIVED PRESENTATION · CANONICAL EVIDENCE STATUS`, `Missing or unverified proof`, `Repeated retry after provider timeout does not issue duplicate discount codes`, `Derived from canonical evidence status: missing`, `Derived · not persisted`.
4. The requirement: `Prove merge condition`, `blocking · open`.

The visitor who never triggers motion loses nothing.

**Event sequence, motion moment two**

Three beats, opacity and small translation only, fired once, in this order:

1. **Connect.** The two supporting evidence records take their attached state against the finding. The relationship expressed is the one the product asserts: `supported by · 2 direct`, `Explicit stored relationship`.
2. **Reveal.** The derived missing proof block becomes visible with its `Derived · not persisted` qualifier already attached. The qualifier never arrives after the claim.
3. **Follow.** The requirement `Prove merge condition · blocking · open` appears beneath it.

Nothing moves, recolours or reorders inside the product surface beyond these three appearances. No connector line is drawn between records, because the product does not draw one and `no link is inferred from visual proximity`.

**Final unresolved state**

The requirement is open and blocking. The counts are unchanged: `5 canonical evidence records. 2 missing or unverified; 1 stale.` and `4 open · 2 blocking`. Nothing clears, nothing turns green, no checkmark appears. The motion has made a gap visible. It has not closed one.

---

## 11. Readiness and Human Decision section

**How the four cell summary grammar returns**

The four cell band from the hero reappears here, unchanged in content, order and treatment: `LINTEL RECOMMENDATION Tests required`, `RISK 46/100 MEDIUM`, `REQUIREMENTS 4 open · 2 blocking`, `HUMAN DECISION Human Decision pending`. It is the second and final appearance on the page. It is content inside a section, never a fixed page element, never sticky and never in the header. Its return is what closes the loop the hero opened: the visitor now knows what each of the four cells means because sections 2 through 5 explained them in order.

**How the four concepts remain visibly separate**

| Concept | Where it lives | What it is | What it is not |
|---|---|---|---|
| Recommendation | Cell one, `Tests required` | Lintel's assessment | Not an approval and not an outcome |
| Blockers | Readiness bar, `2 blockers · 2 missing/unverified · 1 stale` | The specific unresolved items | Not a score |
| Readiness | Readiness bar, `Merge readiness blocked` | A summary of blocking state | Not a decision and not permission |
| Human Decision | Cell four and the modal, `Human Decision pending` | The accountable engineer's recorded outcome | Never produced by Lintel |

Separation is enforced structurally, not by copy alone. The four are on three different product surfaces: the summary band, the readiness bar, and the decision modal. The public composition preserves that separation rather than merging them into one panel. The Inspector's own `DECISION READINESS · NOT A DECISION` label is the product stating the boundary in its own words, and it is preferred over any public phrasing of the same idea.

**Motion moment three**

The Human Decision surface opens. Resting state before motion: the four cell band and the readiness bar are readable, and the decision surface is closed. Event: the `Record Human Decision` surface opens over the dimmed record, in one movement, opacity and small translation only.

Final resting state, and the requirements on it:

1. `Outcome *` is present and `No outcome is selected from Lintel's recommendation.` is visible.
2. All seven outcome controls are visibly unselected. `Tests required` is not preselected even though it matches Lintel's recommendation. This is the point of the moment.
3. `Rationale *` is empty, showing its placeholder.
4. The `Record Human Decision` action is in its disabled resting state.
5. No decision is recorded, now or on any later interaction. Motion may open the surface. Motion may never complete a decision.

Under reduced motion the surface is simply present in its open, unselected state from first paint. Nothing is lost.

---

## 12. Trust and architecture section

**Structure**

The second charcoal section, at lower density than section 3. Eight numbered statements in Case Record grammar: monospace statement numbers, hairline rules between rows, one short paragraph each. More vertical space per row than section 3 and fewer rows visible at once, so the two dark sections are not mistaken for a repeating band. One light product inset carries the handoff evidence. No icons, no diagrams, no shields, no badges, no lock imagery.

**Content**

**a. Deterministic analysis.** Deterministic analysis provides the baseline through explicit, traceable rules.

**b. Optional model assistance.** Model assistance is optional and must be identified in provenance when used. It may contribute within the implemented analysis contract. It does not select or record the Human Decision.

**c. Canonical report.** Each supported analysis creates a canonical report record, with its run, head and branch recorded when available. The provenance line stays attached to the record: `Run`, `Head 9c41af2`, `Branch fix/discount-code-retrieval-fallback`.

**d. Evidence and requirements.** Canonical evidence is stored. Missing or unverified proof is derived from canonical evidence status and is marked `Derived · not persisted`. Derived requirements remain read-only. The record does not blur what is stored and what is derived.

**e. Human Decision.** `Lintel recommends. The accountable engineer decides.` No outcome is selected from the recommendation, and a rationale is required before an outcome is recorded.

**f. Explicit handoff.** In the public sample and environment shown, handoff capability is explicit and user initiated. The product states its current integration positions: `GitHub App · NOT CONFIGURED`, `Implemented capability is not configured for this environment.` `GitHub Action · BLUEPRINT`, `Does not install, execute, connect or post.` `Slack handoff · EXPORT-ONLY`, `Copies or downloads; it does not send.`

**g. Sample and browser storage.** The homepage scenario is an explicit read only fixture. It is not itself a browser stored report. Reports created through supported browser based review flows may be stored in the current browser, shown by the product as `LOCAL REPORT · STORED ON THIS DEVICE` and `Browser-local · maximum 10`, subject to that bounded history limit. A stored report is not an organisation account, it is not shared with a team, it does not synchronise between machines, and it is subject to the limits of browser storage.

**h. No external write from the public sample.** The public sample performs no external write. In the environment shown, `GitHub App` is `NOT CONFIGURED`, `GitHub Action` is a `BLUEPRINT`, and `Slack handoff` is `EXPORT-ONLY`. This describes the sample and the environment shown. It is not a claim that every configured integration can never write externally.

**Claim discipline**

The section states what the system does and where it stops. It makes no absolute local, privacy, safety or enterprise claim. Specifically it does not say private, fully local, secure, safe, compliant, enterprise ready, SOC 2, encrypted, never leaves your machine, or zero data collection. It does not describe browser stored data as organisation data. It does not present blueprint or unconfigured capability as available today. Where a boundary is a limitation, it is stated as a limitation.

---

## 13. Product scene map

All scenes derive from the frozen R4 product. Where a captured screenshot shows a different fixture, R5C must re-capture against the canonical PR #482 fixture rather than edit values in an image.

| Scene | a. Source | b. Responsibility | c. Focal content | d. Required readable labels | e. Surrounding context | f. Desktop | g. Mobile | h. Motion | i. Fidelity risk |
|---|---|---|---|---|---|---|---|---|---|
| A. Hero Workspace | `01_workspace_core.png`, re-captured with Queue open and Inspector closed | Establish the product and the case | Review title, four cell band, primary finding | Title, provenance, `Tests required`, `46/100 MEDIUM`, `4 open · 2 blocking`, `Human Decision pending`, `Merge readiness blocked` | Left icon rail, Queue rail, tab row, readiness bar | Wide, up to 1360px, breaks past the fold | Replaced by `05_mobile_queue.png` | Motion 1 | High. Source capture has the Queue collapsed. A new capture is required, not a composite. |
| B. Evidence boundary fragments | `01_workspace_core.png` | Show the gap that makes verification hard | Next inspection banner and Evidence boundary cell | `Provider failure cases absent from test suite`, `Why This derived missing or unverified proof blocks 1 requirement and is not current verified evidence.`, `5 canonical evidence records. 2 missing or unverified; 1 stale.` | Minimal. Fragment edges only | Two half column surfaces | Preserved desktop crop, stacked | Static | Low. Both fragments exist in the canonical capture. |
| C. Review Map stage row | `03_review_map.png`, existing capture permitted only if a safe crop excludes `07 Readiness Unavailable` and `08 Human Decision None recorded`; otherwise re-captured | Evidence the eight stage model | Stage column headers `01` to `08` with first record row | All eight stage names, `RELATIONSHIP ORIENTATION`, `Review Map`, the orientation caveat | Crop excludes the Case Record index, the relationship detail panel, and prefers to exclude the conflicting terminal values | Light inset inside charcoal, one third width | Horizontal stage sequence with visible stage index | Static | Medium. The map is wide. The crop must not clip a stage or the orientation caveat. Stays light inside a dark section. Re-capture required only if no truthful crop preserves all eight labels and the caveat while excluding the conflicting terminal values. |
| D. Workspace with Inspector | `02_evidence_semantics.png` structure, re-captured on the canonical fixture | Show sustained investigation | Inspector panel beside the record | Tab row, `CONTEXT Inspector`, `DECISION READINESS · NOT A DECISION`, at least four metadata rows, `Head 9c41af2` | Record centre, Queue closed | Wide, up to 1360px | Replaced by `06_mobile_record.png` | Static | High. Source capture uses the dense R4G3 fixture with `76/100 HIGH` and `20 open · 19 blocking` and shows Queue and Inspector both open. Re-capture is mandatory. |
| E. Evidence and missing proof | `02_evidence_semantics.png` structure, re-captured on the canonical fixture | Distinguish evidence from missing proof | Finding, two evidence records, missing proof block, requirement | `Findings, canonical evidence and derived missing/unverified proof remain distinct records.`, `DERIVED PRESENTATION · CANONICAL EVIDENCE STATUS`, `Derived · not persisted`, `Prove merge condition`, `blocking · open` | One framed surface holding three fragments in stage order | Two thirds width beside text | `06_mobile_record.png` vertical record | Motion 2 | High. The source shows five repeated `Test evidence unavailable` rows from the dense fixture. These must not be reproduced. |
| F. Readiness and decision | `01_workspace_core.png` plus `04_human_decision.png`, re-captured on the canonical fixture | Separate recommendation, readiness and authority | Decision modal over the four cell band and readiness bar | `ACCOUNTABLE ENGINEER ACTION`, `Record Human Decision`, `Lintel recommends. The accountable engineer decides.`, `No outcome is selected from Lintel's recommendation.`, all seven outcomes, `Rationale *`, disabled submit | Dimmed Workspace behind, cropped to band and readiness bar | Full scene width | Focused vertical record, band as four stacked rows, outcome list unselected | Motion 3 | High. The captured modal shows `36/100 MEDIUM` and `4 open blockers` from a different fixture. It must be re-captured at `46/100 MEDIUM` and `2 blocking`. No image editing. |
| G. Handoff panel | `02_evidence_semantics.png` Inspector region, re-captured on the canonical fixture | Evidence current handoff states and the public sample write boundary | Three integration rows | `GitHub App NOT CONFIGURED`, `GitHub Action BLUEPRINT`, `Slack handoff EXPORT-ONLY` and all three description lines | Inspector panel edge only | Narrow light inset inside charcoal | Preserved desktop crop | Static | Medium. Environment dependent labels. Capture and caption must match the environment being shown. |
| H. Closing record line | `01_workspace_core.png` | Return to the same unresolved review | Title row and four cell band | Title, provenance, all four cells, `SELECTED REVIEW · READ-ONLY SAMPLE` | None | Narrow, editorial column width | Two mobile queue rows for PR #482 | Static | Low. Simple crop of the canonical capture. |

Global scene rules: genuine text and genuine states only, no invented labels, no added radius, no added shadow, no recoloured state, no simplified band, no floating fragments, no tilt, no device mockup, no browser chrome, and no public annotation drawn onto a product surface.

---

## 14. Light and charcoal rhythm

**Exact sequence by surface treatment**

| Section | Responsibility | Surface |
|---|---|---|
| Header | Shell | Warm neutral |
| 01 | Hero | Warm neutral, dominant white product surface |
| 02 | Verification problem | Warm neutral, two small white surfaces |
| 03 | Verification model | **Charcoal**, one light product inset |
| 04 | Investigation Workspace | Warm neutral, dominant white product surface |
| 05 | Missing proof and requirements | Warm neutral, one white surface at two thirds width |
| 06 | Readiness and Human Decision | Warm neutral, dominant white product surface |
| 07 | Trust and architecture | **Charcoal**, one narrow light product inset |
| 08 | Final action | Warm neutral, one small white surface |
| Footer | Shell | Warm neutral |

Two charcoal sections, at positions 3 and 7. No third dark surface anywhere, including the footer.

**How repetitive alternating bands are prevented**

The five consecutive light sections between the two charcoal sections are differentiated by scene scale and composition rather than by background colour:

1. Section 1: full width scene, text above.
2. Section 2: small paired fragments, text beside. The only section with no dominant surface.
3. Section 4: full width scene, text above, caption below.
4. Section 5: two thirds scene, text in a narrow left column. The only annotated record composition.
5. Section 6: full width scene with a modal focal point, text above.
6. Section 8: smallest surface on the page, centred.

Emphasis therefore runs wide, narrow, dark, wide, medium, wide, dark, small. No two adjacent sections share the same composition. The page never produces a light and dark alternation, because charcoal appears at 3 and 7 with four and one light sections between and around them, which is an asymmetric placement rather than a rhythm.

**Returning from charcoal to light**

Both returns are carried by the product rather than by empty space, so the change of surface reads as a change of subject.

1. From section 3 to section 4: the light section opens with its headline and the Workspace scene begins high in the section. The visitor returns to the instrument they were just given a model for.
2. From section 7 to section 8: the light section opens with the same review title the hero opened with, at small scale. The page closes the loop rather than restarting.

The mechanics that keep both transitions from feeling abrupt: charcoal sections carry their own generous top and bottom padding inside the dark surface, so the colour change happens at a distance from any text; the editorial column and left alignment are identical on both sides of the boundary, so nothing shifts horizontally; and the light product inset inside each charcoal section has already introduced light at close range before the full return.

---

## 15. Copy hierarchy and language system

**a. Headline style.** One sentence, sentence case, ending in a full stop. Plain declarative statements about what is true, not slogans, not questions, not imperatives except in section 8. Geist Sans. Hierarchy from optical size and colour, not from many weights. No letterspacing, no italics, no gradient text, no animated headline effects.

**b. Paragraph length.** One paragraph per section, two to four sentences, set at a 60 to 70 character measure. Sentences are short and complete. No paragraph exceeds four sentences anywhere on the page. Section 3 and section 7 use short numbered statements instead of paragraphs.

**c. Eyebrow style.** Uppercase micro label with wide tracking, in Geist Sans, prefixed by a two digit number in Geist Mono. Format `01 · ONE REVIEW`. Two to three words maximum. Warm grey on light sections, muted light grey on charcoal. The eyebrow numbers the page sequence; it does not label a product feature.

**d. Product captions.** One line beneath a scene, Geist Sans, small, warm grey. A caption states what the scene is and nothing more. It never adds a claim the interface does not support, never explains a benefit, and never describes an interaction the visitor cannot take. Monospace appears in a caption only when quoting a run, head, branch or path.

**e. Button language.** Verb led, specific, and truthful about the destination. `Open the sample review` and `Start a review` are the two button actions. `How it works` is a navigation label, not a button. No `Get started`, `Try it free`, `Book a demo`, `Request access` or `Learn more`. No button promises an account, a trial, a price or a conversation.

**f. Use of merge.** Permitted in the hero headline, and inside product scenes where the product uses it itself, such as `Merge readiness blocked` and `Prove merge condition`. It leads no other section headline and appears in no other public sentence.

**g. Use of local.** Never leads. It does not appear in the hero, in any headline or in any button. It appears once, in section 7 statement g, and there it is stated as a boundary rather than as a benefit. The product's own `LOCAL REPORT · STORED ON THIS DEVICE` and `Browser-local · maximum 10` labels carry the point inside the scene.

**h. Use of AI and agent.** `Model assistance` is the preferred phrase and appears in the hero trust line and in section 7 statement b. The word AI does not appear in any headline, eyebrow, button or navigation label. The word agent appears at most once on the page, in section 2 where changes produced by tools are described, and only if the sentence is weaker without it. No section is framed as agentic.

**i. Terminology that must remain product exact.** These are spelled exactly as the product spells them, in public copy and in scenes, with no synonym substituted: Lintel recommendation, Tests required, Risk, Confidence, Requirements, open, blocking, Evidence boundary, canonical evidence, missing or unverified proof, derived, not persisted, stale, Finding, Affected context, Readiness, Merge readiness blocked, Human Decision, Human Decision pending, accountable engineer, Review Queue, Contextual Inspector, Review Map, Case File, Next inspection, Run, Head, Branch.

Copy discipline throughout: clear sentences, clean punctuation, no dash heavy construction, no em dash used as a connector where a full stop works. The copy is confident because it is precise.

---

## 16. Action and route truth

Every public action resolves to something that exists, or it does not appear. Nothing on this page is a control for a capability that does not exist, and nothing is a link that looks live and is not.

| Action | Destination | Status |
|---|---|---|
| **a. Explore a sample review** | Shipped as `Open the sample review`, routing to the existing read-only sample review surface, the same PR #482 record the page describes. The label is changed from `Explore` because the destination is a real read-only review, not an exploration mode. | **Active.** Depends on R5C confirming the exact existing route against the frozen R4 route contract. R5C confirms the route. It does not create one. |
| **b. Start a review** | Shipped as `Start a review`, routing to the existing `/new` route. It is the secondary action in the hero and in the final action section. | **Active.** Present in the hero and section 8. Not present in the header or footer. |
| **c. Product navigation** | In page anchor to section 4, Investigation Workspace. | **Active.** In page only. |
| **d. How it works navigation** | In page anchor to section 3, the verification model. It is a header navigation label only, not a hero action. | **Active.** In page only. |
| **e. Security navigation** | In page anchor to section 7, trust and architecture. | **Active.** In page only. Label is `Security` in the header and the section is titled for architecture; R5C must not retitle the section to match the label. |
| **f. Docs navigation** | No public documentation exists. | **Deferred.** Does not appear in navigation or the footer. Not rendered disabled, not rendered as coming soon. |
| **g. Changelog navigation** | No public changelog exists. | **Deferred.** Does not appear in navigation or the footer. |

Also explicitly absent, because the capability does not exist or is out of scope for this milestone: sign in, sign up, account, pricing, contact sales, book a demo, request access, newsletter, status page, integrations directory, customer stories, careers, search, and any social account not confirmed to exist.

The three navigation labels are all in page anchors. This is stated here so R5C does not implement them as routes to pages that do not exist. If a label cannot be an anchor to a section on this page, it does not ship.

---

## 17. Responsive narrative

The narrative is identical at every width. Only the scene treatment changes. Section order never changes, and no section is dropped on any device.

**a. Wide desktop, roughly 1440 pixels and above.** Editorial column holds at roughly 1200 pixels with wide outer margins. Product scenes break to roughly 1360 pixels. Vertical rhythm at the upper end of 140 to 180 pixels. Scenes do not scale beyond their captured resolution; extra width becomes margin, not enlargement.

**b. Standard desktop, roughly 1024 to 1440 pixels.** Editorial column narrows with the viewport. Product scenes reduce to the container width and stay legible. Two column sections, 3, 5 and 7, hold their two column structure down to roughly 1100 pixels and collapse to stacked below that. Vertical rhythm at the lower end of the range.

**c. Tablet, roughly 768 to 1024 pixels.** All two column sections are stacked, text above scene. Wide product scenes become horizontally scrollable regions with a visible stage or region index rather than being shrunk. Section spacing compresses to roughly seventy percent. The header keeps all three labels.

**d. Mobile, below roughly 768 pixels.** One responsibility at a time, inherited from the product's own rule. Section spacing compresses to roughly half. Text always precedes its scene. No fixed summary band, no persistent index, no sticky header, no menu drawer.

**Per section responsive treatment**

| Section | Preserves a desktop crop | Uses a genuine mobile product view | Becomes a horizontal stage sequence | Becomes a focused vertical record | Changes text and product order |
|---|---|---|---|---|---|
| 01 Hero | No | Yes, `05_mobile_queue.png` | No | No | No. Copy, actions, trust line, then scene, at every width. |
| 02 Verification problem | Yes, both fragments | No | No | Yes, fragments stacked | Yes on desktop only. Side by side becomes stacked, text first. |
| 03 Verification model | No | No | Yes, the Review Map inset only | Yes, the eight stage record | Yes. Two column becomes stage record first, then inset. |
| 04 Investigation Workspace | No | Yes, `06_mobile_record.png` | No | Yes | No. Text, scene, caption at every width. |
| 05 Missing proof and requirements | No | Yes, `06_mobile_record.png` | No | Yes | Yes. Text left of scene becomes text above scene. |
| 06 Readiness and Human Decision | No | Yes, mobile record surface and mobile decision surface | No | Yes. Four cell band becomes four stacked rows | No. Text, then band, then readiness, then decision surface. |
| 07 Trust and architecture | Yes, the handoff inset | No | No | Yes, seven stacked statements | Yes. Inset moves from beside statements f and h to beneath them. |
| 08 Final action | No | Yes, two mobile queue rows | No | Yes | No. |

Mobile scenes are genuine mobile product views wherever one exists. A desktop crop is preserved only where the crop is already narrow and fully legible at mobile width, which is true for the section 2 fragments and the section 7 handoff rows and nothing else. A desktop Workspace is never shrunk into a narrow column at any width.

---

## 18. Motion placement

Three motion moments across the entire page. No fourth. Each names a product event.

Progressive enhancement, as one global rule across all three moments: the complete final state exists and remains readable without animation. Motion may stage visibility only after hydration and motion support have been established. If JavaScript fails, an observer does not fire, or reduced motion is enabled, the complete final state remains visible. The hero must never show the centre record as active while its Queue record is absent. The Queue row may settle into its selected presentation, but no impossible product state may be depicted. In section 5, finding, evidence, missing proof and requirement all remain available without a trigger. The animation reveals their relationship but does not own their availability.

**Moment one. Position: section 1, the hero scene, inside the first viewport.**

- **a. Product event:** The Queue row for PR #482 settles into its selected presentation.
- **b. Complete state, present without motion:** The Queue rail already shows the PR #482 row in `NEEDS ATTENTION`, already selected, alongside its other rows. The centre record is already fully populated for PR #482 and fully readable, including the four cell band. The centre record is never shown active while its Queue row is absent.
- **c. Motion, when it runs:** After hydration and motion support are established, the already present PR #482 row plays its settle into the selected presentation. Nothing else changes.
- **d. Content available without motion:** All of it. The headline, supporting copy, actions, trust line, the Queue row and the entire record are readable before, during and without motion.
- **e. Reduced motion equivalent:** The row is present and selected from first paint, identical to the complete state above.

**Moment two. Position: section 5, inside the framed record surface.**

- **a. Product event:** Evidence connects to the finding, missing proof becomes visible, and the related requirement follows.
- **b. Motion-enabled initial state:** After hydration and motion support are established, the finding remains present and readable while the already available evidence, missing proof and requirement briefly take their staged entrance state. Without enhancement, the complete final state is visible.
- **c. Final resting state:** Evidence attached to the finding, missing proof visible with `Derived · not persisted`, requirement `Prove merge condition · blocking · open` present. Counts unchanged. Nothing cleared.
- **d. Content available without motion:** The section copy, the finding, and the exact canonical facts listed in section 5h are all present in text and in the framed surface regardless of motion.
- **e. Reduced motion equivalent:** All four record fragments present and connected from first paint, in the same final arrangement.

**Moment three. Position: section 6, over the record scene.**

- **a. Product event:** The Human Decision surface opens with no outcome selected.
- **b. Motion-enabled initial state:** After hydration and motion support are established, the four cell band and readiness bar remain readable while the decision surface begins closed. Without enhancement, the complete open and unselected final state is visible.
- **c. Final resting state:** The decision surface open, all seven outcomes visibly unselected, `No outcome is selected from Lintel's recommendation.` visible, `Rationale *` empty, submit disabled. No decision recorded.
- **d. Content available without motion:** Section copy, the four cell band, the readiness bar, and the separation table content in prose. The decision surface content is also present in its open resting state.
- **e. Reduced motion equivalent:** The decision surface is present and open, unselected, from first paint.

Shared constraints, restated from the lock: opacity and small translation only, roughly 180 to 260 milliseconds, ease out, scroll triggers fire once and never on re entry, all content readable before any motion runs, every state legible in its resting form, and the page fully understandable with motion disabled. Motion may open the Human Decision surface. Motion may never complete a decision. No requirement clears in any moment.

Exact easing curves, durations within the stated range, trigger thresholds and implementation belong to R5C.

---

## 19. R5C implementation handoff

R5C builds these in the private visual laboratory. Nothing below requires a narrative or product decision.

**a. Shared public shell**

1. Static page header: identity mark, three anchor labels, one primary action. Not fixed, not sticky, no drawer.
2. Editorial container: roughly 1200 pixels with a 60 to 70 character body measure.
3. Wide scene container: roughly 1360 pixels, used only by scenes A, D and F.
4. Section wrapper with numbered eyebrow, surface variant light or charcoal, and vertical rhythm of 140 to 180 pixels on desktop and roughly half on mobile.
5. Product scene frame: white surface, fine structural border, restrained optical separation from the page ground, no visible decorative shadow, no browser chrome, optional single line caption beneath. R5C decides the exact border tone and optical separation. R5C may not introduce decorative elevation.
6. Footer: identity, one trust line, three anchors, legal line.
7. Type system: Geist Sans and Geist Mono only, with monospace restricted to run, head, branch, paths, stage and section numbers, and identifiers.

**b. Static sections**

Eight section components, in order, each with the eyebrow, headline, supporting copy, scene slot and surface treatment specified in section 5 of this document:

1. Hero, light, wide scene, motion slot one.
2. Verification problem, light, paired small fragments.
3. Verification model, charcoal, eight row stage record plus light inset.
4. Investigation Workspace, light, wide scene, caption.
5. Missing proof and requirements, light, narrow text with two thirds scene, motion slot two.
6. Readiness and Human Decision, light, wide scene with modal focal point, motion slot three.
7. Trust and architecture, charcoal, eight statement record plus narrow light inset.
8. Final action, light, minimal record surface, primary and secondary actions, trust line.

**c. Real product scene framing**

Eight scenes, A through H, per the section 13 map. Required before build:

1. New canonical captures at the PR #482 fixture for scenes A, D, E, F and G. Scene A requires Queue open and Inspector closed. Scene D requires Inspector open and Queue closed. Scene F requires the decision modal at `46/100 MEDIUM` and `4 open · 2 blocking`. No image editing of product values under any circumstance.
2. Existing captures are sufficient for scenes B and H. Scene C may use the existing Review Map capture only if a safe crop removes the conflicting terminal values `07 Readiness Unavailable` and `08 Human Decision None recorded` while preserving all eight stage labels and the orientation caveat. If no such crop exists, scene C also requires a new canonical capture. No image values may be edited.
3. Crop boundaries per section 5i, with a fidelity check of every scene against the frozen R4 product.

**d. Responsive variants**

1. Mobile product captures for the hero queue view, the mobile finding record, and the mobile readiness and decision surfaces.
2. Horizontally scrollable region with a visible stage index, used only by the Review Map inset in section 3 and by wide scenes at tablet width.
3. Stacked variants for sections 2, 3, 5 and 7.
4. Four cell band as four stacked labelled rows for section 6 on mobile.
5. Breakpoint values and column behaviour within the widths described in section 17.

**e. Motion placeholders**

1. Three named, single fire, scroll triggered slots: `queue-entry` in section 1, `evidence-to-requirement` in section 5 with three beats, `decision-surface-open` in section 6.
2. Each slot ships with its reduced motion resting state, which is also the fallback if the trigger never fires.
3. No fourth slot exists in the component API. Adding one is a direction change, not an implementation choice.

**f. Content data**

1. One content source holding all section eyebrows, headlines, supporting copy, captions and action labels exactly as written in this document.
2. One canonical facts source holding every locked product string in section 7 of this document, used for alt text, captions and any text rendered outside a scene image.
3. Alt text for every scene, describing the record state rather than the layout, and never asserting a value the scene does not show.

**g. Protected product surfaces**

R5C frames and crops. It does not restyle. Not to be altered: Workspace anatomy, Review Queue responsibility, Contextual Inspector responsibility, findings, evidence semantics, missing proof semantics, requirements semantics, readiness semantics, Human Decision authority, operational and administrative shell distinctions, route and storage contracts, responsive responsibility transfer, existing keyboard foundations, existing accessibility foundations. No product colour is changed to suit a charcoal section. No product corner radius, shadow, border or label is adjusted. No product value is edited in an image.

---

## 20. Decisions deferred

**a. Deferred to R5C visual execution**

1. Exact type scale values, line heights and optical size steps within Geist Sans and Geist Mono.
2. Exact grid, column and breakpoint numbers within the widths in section 17.
3. Warm neutral ground and charcoal surface colour values, and product scene border tone and optical separation value. R5C may not introduce decorative elevation.
4. Easing curves, durations within 180 to 260 milliseconds, and scroll trigger thresholds.
5. Pixel level crop boundaries within the crop guidance in section 5i.
6. Caption wording for each scene, within the caption rules in section 15d.
7. Horizontal scroll mechanics and stage index treatment on mobile.
8. Accessibility verification of contrast, focus order and keyboard behaviour, and alt text drafting from the canonical facts source.
9. Performance budget and load stability.
10. Confirmation of the exact existing route behind `Open the sample review` and behind `Start a review` (`/new`).

**b. Deferred beyond the initial homepage**

1. Public documentation, changelog, pricing, customer proof, integrations directory and governance pages.
2. Deeper product pages, where The Case Record grammar is additionally permitted.
3. Any second canonical scenario.
4. Onboarding and account creation. `Start a review` itself is shipped, mapped to the existing `/new` route.
5. Search, internationalisation and a public status surface.

**c. Capabilities intentionally absent**

Absent because they do not exist, and therefore represented nowhere in the shell, navigation, footer or copy: hosted organisation accounts, shared team collaboration, cloud synchronisation, repository enforcement, autonomous approval, enterprise controls, existing customer adoption, external writes beyond explicit export, and pricing for undelivered capabilities.

Nothing in this section defers a narrative or section responsibility decision. Section order, section responsibilities, working copy, scene assignment, canonical fact placement, surface treatment, motion placement and action truth are all decided in this document.

---

## 21. R5B acceptance checklist

R5B is accepted when every item below is true of this document.

**a. One architecture only.** One page structure, one section order, one working copy direction per section, one scene per responsibility. No alternative remains open and no headline options are offered. â˜

**b. All eight sections have one responsibility.** Each of the eight sections in section 5 carries exactly one responsibility, one visitor question and one product scene responsibility, and no responsibility is repeated across sections. â˜

**c. The canonical case remains continuous and unresolved.** The discount code retrieval review appears in all eight sections. `Tests required`, `46/100 MEDIUM`, `4 open · 2 blocking`, `Merge readiness blocked` and `Human Decision pending` are unchanged throughout. No requirement clears, no outcome is selected, no decision is recorded, and no second example appears anywhere. The page moves the visitor from arrival to the point where an accountable Human Decision can be made, never to a recorded decision. â˜

**d. Working copy exists.** Every section has an eyebrow, a headline, supporting copy and, where relevant, a caption rule and action labels. The hero headline and trust line are preserved exactly as locked. The hero and final action use `Open the sample review` as primary and `Start a review` as secondary, routing to the existing `/new` route. `How it works` is a header navigation anchor only and is not a hero or final action. â˜

**e. Every scene has a source and mobile treatment.** All eight scenes in section 13 name a source screenshot or product surface, required readable labels, a desktop treatment, a mobile treatment and a fidelity risk. Section 17 states the responsive treatment for all eight sections. Scene C's source is conditional on a crop that excludes the conflicting terminal values while preserving all eight stage labels and the orientation caveat. Below the mobile navigation breakpoint the header omits the three anchor labels, keeping only identity and the compact primary action, with no menu drawer. â˜

**f. Exactly two charcoal sections.** Charcoal appears at section 3 and section 7 only, per the sequence table in section 14. The header, footer and all other sections are light. Product insets inside charcoal sections remain light. â˜

**g. Exactly three motion moments, as progressive enhancement.** Moment one in section 1, moment two in section 5, moment three in section 6. Each names a product event, a complete state that is present and readable without motion, and a reduced motion equivalent. The hero never depicts the centre record as active while its Queue row is absent. No fourth moment exists in the component API. â˜

**h. No unsupported claim or action.** Every action in section 16 is either active with a real destination or explicitly deferred and absent. No disabled or decorative navigation ships. Section 12 makes no absolute local, privacy, safety or enterprise claim, does not claim byte for byte identical output, does not claim the read only sample is itself a durable browser stored report, and scopes its no external write claim to the public sample and the environment shown. Browser stored data is never described as organisation data. â˜

**i. R4 remains protected.** All fourteen protected boundaries are restated in section 19g. Product surfaces are cropped and framed, never restyled, recoloured or edited. Canonical values are re-captured rather than edited. Scene frames use a fine structural border and restrained optical separation from the page ground, with no visible decorative shadow or elevation. Human Decision is never shown as resolved by Lintel, and recommendation and decision remain visibly separate with no outcome preselected. â˜

**j. R5C can implement without making product or narrative decisions.** Section 19 lists the shell, sections, scenes, responsive variants, motion slots, content sources and protected surfaces. Section 20 confines deferred items to execution values and future scope. Every remaining open item is a value, not a decision about what the page says or shows. â˜

Additional constraints confirmed: no persistent public page index, no fixed public product summary band, no feature card grid, no third typeface, monospace restricted to provenance, no public brand accent, no decorative shadow or elevation on scene frames, no code written and no repository edited.

