# Lintel Visual Operating System v1.0

**Status:** Normative  
**Direction:** Definitive visual direction  
**Version:** 1.0  
**Applies to:** Application, website, design system, responsive behaviour and motion  
**Authority:** This document is the visual source of truth for Lintel  
**Change policy:** Amend only through an explicit LVOS versioned decision

**Purpose:** Source of truth for all application, website, component and motion work  
**Supersedes:** Route-specific visual directions, milestone-specific styling systems and reference-led reinterpretations

> Lintel is a high-end engineering verification workstation for senior engineers. Its interface combines the operational clarity of a command centre with the evidentiary discipline of a technical ledger. Every change moves through observation, evidence and explicit requirements toward a recorded human decision.

---

## Contents

1. [North star](#1-north-star)
2. [Product personality](#2-product-personality)
3. [Permanent visual identity](#3-permanent-visual-identity)
4. [Global application architecture](#4-global-application-architecture)
5. [Page archetypes](#5-page-archetypes)
6. [Workspace and dashboard vision](#6-workspace-and-dashboard-vision)
7. [Report and Case File vision](#7-report-and-case-file-vision)
8. [Team, policies and settings vision](#8-team-policies-and-settings-vision)
9. [Website vision](#9-website-vision)
10. [Colour system](#10-colour-system)
11. [Typography](#11-typography)
12. [Spacing, borders and radii](#12-spacing-borders-and-radii)
13. [Controls and component grammar](#13-controls-and-component-grammar)
14. [Motion constitution](#14-motion-constitution)
15. [Content and language rules](#15-content-and-language-rules)
16. [Permanent prohibitions](#16-permanent-prohibitions)
17. [Implementation governance](#17-implementation-governance)
18. [Definition of success](#18-definition-of-success)

## 1. North star

> **Lintel is a verification command centre built from ledgers, where evidence moves through explicit requirements toward a recorded human decision.**
>

The application combines two modes:

### Command centre

Used when engineers are operating work:

- triaging changes;
- switching repositories;
- examining active reviews;
- assigning ownership;
- resolving open requirements;
- monitoring team verification activity.

### Verification ledger

Used when engineers are inspecting and recording:

- findings;
- evidence;
- assumptions;
- Merge Contract clauses;
- readiness changes;
- provenance;
- human decisions.

The command centre provides operational clarity. The ledger provides trust, history and accountability.

Lintel is neither a generic dashboard nor a passive document viewer. It is a **working environment for operating verification cases**.

---

## 2. Product personality

Lintel should feel like a senior verification engineer’s workstation.

### The product is

- calm;
- exact;
- structured;
- evidence-led;
- technically credible;
- deeply inspectable;
- active without being noisy;
- authoritative without overruling the engineer.

### The product is not

- an AI chatbot;
- a security operations dashboard;
- a project-management clone;
- a card-based SaaS dashboard;
- a futuristic neon command centre;
- a visualisation playground;
- a feature catalogue;
- an autonomous decision-maker.

### Emotional promise

> **When Lintel is open, the state of a change feels understandable and under control.**
>

### Internal design statement

> One connected workspace.
>
>
> One visible chain from change to decision.
>
> Hierarchy from typography, alignment and rules—not containers.
>
> Colour only when interpretation changes.
>
> The human decision is always the final and heaviest record.
>

Every screen must support that statement.

---

## 3. Permanent visual identity

### 3.1 Material character

Dark Lintel should feel like a matte technical workstation.

Light Lintel should feel like a carefully typeset engineering dossier on warm paper.

Both themes use the same:

- hierarchy;
- page structure;
- spacing;
- density;
- component dimensions;
- interaction behaviour.

The theme changes the material, not the design.

### 3.2 Signature visual language

Lintel has five ownable visual artifacts:

1. **Verification trace**
    
    Change → Observation → Evidence → Requirement → Human decision
    
2. **Verification records**
    
    F1, E1, A1, C1 and related identifiers
    
3. **Merge Contract clauses**
    
    Numbered requirements with explicit states and clearance evidence
    
4. **Readiness movement**
    
    What opened, cleared, changed or became stale between runs
    
5. **Human Decision Ledger**
    
    Outcome, actor, applicable commit, timestamp and written reason
    

These artifacts are Lintel’s visual identity. They replace generic gradients, illustrations, charts and decorative AI imagery.

A screen should remain recognisable as Lintel even when the logo is removed.

---

## 4. Global application architecture

Lintel will use one stable shell across all authenticated product areas.

### 4.1 Desktop shell

At widths of approximately **1180px and above**:

```
┌────────┬──────────────────┬────────────────────────────────────────┐
│ Icon   │ Contextual       │ Top command bar                        │
│ rail   │ navigation       ├────────────────────────────────────────┤
│ 56px   │ 220px            │ Working surface                        │
│        │                  │                                        │
└────────┴──────────────────┴────────────────────────────────────────┘
```

#### Icon rail: 56px

Purpose: highest-level product navigation.

Permanent destinations:

- Workspace
- Reports
- Operations
- Policies
- Team
- Settings

Rules:

- icons are 16px geometric line icons;
- active item occupies a 32×32 selected surface;
- maximum one notification badge;
- no labels in the persistent desktop rail;
- no decorative logo animation;
- account/workspace control sits at the bottom;
- no scrolling unless the product genuinely exceeds the available height.

#### Contextual navigation: 220px

Purpose: navigation within the selected product area.

Examples:

**Workspace**

- Risk Inbox
- New Review
- Assigned to me
- Recent Reviews

**Operations**

- Overview
- Recurring blockers
- Repository activity
- Decision history

**Policies**

- Policy sets
- Repository assignments
- Evaluations
- Change history

**Team**

- Overview
- Members
- Repositories
- Ownership
- Activity

**Settings**

- General
- Analysis
- GitHub
- Notifications
- Data handling

Rules:

- section labels are 10px/600 uppercase;
- navigation rows are 34–36px high;
- active rows use a restrained selected plane, not a bright brand fill;
- counts are right-aligned;
- icons appear only where they improve recognition;
- nesting is limited to two levels;
- no card containers inside navigation.

#### Top command bar: 52px

Permanent structure:

```
Breadcrumb or current context | Command/search | Context actions
```

It may contain:

- workspace or repository context;
- current PR/report identity;
- global command entry;
- theme control;
- contextual primary action;
- notifications or activity when real.

Rules:

- one hairline bottom border;
- no shadow;
- no oversized page titles;
- no marketing copy;
- no glass;
- no duplicate controls already present in the working surface.

### 4.2 Intermediate widths: 900–1179px

- icon rail remains at 56px;
- contextual navigation becomes a dismissible drawer;
- top bar remains 52px;
- working surfaces adapt from three panes to two or one;
- page content must not become artificially narrow to preserve side panels.

### 4.3 Mobile: below 900px

- no persistent left rail;
- 52px mobile top bar;
- navigation opens in a 300px drawer;
- inspectors become right sheets or full-width sheets;
- important decision actions become compact pinned bars;
- the page itself must never horizontally scroll;
- internal tab strips or technical tables may scroll only when explicitly designed to do so.

---

## 5. Page archetypes

Every product route must use one of five approved page archetypes.

No route may invent a sixth composition without updating LVOS.

### Archetype A — Queue + inspector

Used for:

- Risk Inbox;
- assigned reviews;
- operational triage;
- decision queues.

Structure:

```
Page context
Summary strip
View tabs / filter
┌──────────────────────────────┬────────────────────────┐
│ Structured queue             │ Selected-item inspector│
└──────────────────────────────┴────────────────────────┘
```

### Archetype B — List + selected detail

Used for:

- repositories;
- policies;
- report history;
- team members;
- review runs.

Structure:

```
Toolbar
┌──────────────────────────────┬────────────────────────┐
│ Aligned list/table           │ Selected detail        │
└──────────────────────────────┴────────────────────────┘
```

### Archetype C — Verification dossier + verdict rail

Used for:

- the Report Case File;
- future detailed verification records.

Structure:

```
Quiet section outline | Evidence document | Verdict / decision rail
```

### Archetype D — Administrative document

Used for:

- settings;
- team configuration;
- integrations;
- repository configuration;
- policy configuration.

Structure:

```
Page heading
Section tabs when needed
Rule-separated settings groups or tables
```

No dashboard cards. No hero panel.

### Archetype E — Timeline or graph surface

Used only where spatial or chronological relationships are essential:

- cross-PR overlap;
- readiness evolution;
- repository memory;
- organisational verification activity.

This archetype cannot be chosen merely to make a page look advanced.

---

## 6. Workspace and dashboard vision

### 6.1 The operational home

Lintel’s home is not a KPI dashboard.

The default product destination should answer:

> **What needs engineering attention now?**
>

The refined Risk Inbox becomes the principal home surface.

### 6.2 Definitive desktop composition

```
┌──────────────────────────────────────────────────────────────┐
│ Risk Inbox   Repository scope   Search   Check pull request   │
├──────────────────────────────────────────────────────────────┤
│ 6 need attention | 3 waiting for proof | 4 ready | 2 assigned│
├──────────────────────────────────────────────────────────────┤
│ Inbox  Assigned  Awaiting evidence  Ready  Reviewed           │
├──────────────────────────────────────┬───────────────────────┤
│ Verification queue                   │ Selected case          │
│                                      │ inspector              │
│ PR rows                              │                       │
│ PR rows                              │ trace                 │
│ PR rows                              │ recommendation        │
│                                      │ open requirements     │
│                                      │ next action           │
│                                      │ ownership             │
│                                      │ actions               │
└──────────────────────────────────────┴───────────────────────┘
```

### 6.3 Summary strip

Height: approximately 44–48px.

Contains up to five inline summaries:

- Needs attention
- Awaiting evidence
- Blocking contracts
- Ready
- Decisions requiring reaffirmation

Rules:

- no independent metric cards;
- no decorative icons;
- no charts;
- each value links to a filtered view;
- separators are interior hairlines;
- semantic colour appears only when the state matters.

### 6.4 Workspace views

Approved primary tabs:

- Inbox
- Assigned to me
- Awaiting evidence
- Ready
- Reviewed

Tabs are allowed because these are genuine sibling views of the same verification queue.

Tabs must:

- remain on one line where possible;
- use counts;
- have a strong text hierarchy;
- use a bottom rule or selected surface;
- avoid pill-shaped segmented-control styling for primary navigation.

Filters such as risk, repository, owner and age sit in a toolbar, not inside the primary view tabs.

### 6.5 Verification queue

Queue rows are structured records, not cards.

Target row height:

- 52–60px desktop;
- 64–76px compact mobile.

Desktop column grammar:

```
State | PR identity | Recommendation | Requirements | Owner | Updated
```

The PR identity contains:

- repository;
- PR number;
- title;
- branch or source in secondary text.

Rules:

- at most one status chip per row;
- no row-level action button wall;
- selection opens or updates the inspector;
- actions belong in the inspector;
- rows share aligned columns;
- hover uses a plane shift;
- selection uses selected plane + left rule + focus ring;
- risk is written as text and value, not a gauge.

### 6.6 Selected-case inspector

The inspector is a single connected plane, approximately 360–400px wide.

Its fixed hierarchy:

1. PR identity
2. Micro verification trace
3. Recommendation with because-clause
4. Open requirements and missing proof
5. Required next action
6. Review owner and state
7. Progressive details
8. Actions

No nested stat cards.

Information appears as:

- definition rows;
- short record lists;
- disclosure sections;
- hairline-separated blocks.

Primary actions:

- Open Case File
- Copy conditions
- Record or review decision
- Delete only inside an overflow/destructive region

On mobile, this becomes a focus-trapped right sheet.

## 7. Report and Case File vision

The Case File is Lintel’s flagship artifact.

It should feel like a technical dossier inside the command centre.

### 7.1 Desktop composition

At widths above approximately 1100px:

```
┌──────────────┬────────────────────────────────┬──────────────────┐
│ Outline      │ Verification document          │ Verdict rail     │
│ 150–170px    │ 680–760px reading measure      │ 300–320px        │
└──────────────┴────────────────────────────────┴──────────────────┘
```

The document uses the canvas and hairline rules. It is not wrapped in one giant rounded card.

The verdict rail is the only persistent level-one bordered plane.

### 7.2 Fixed report reading order

#### 01 — What changed

- PR identity
- changed files
- affected surfaces
- builder-declared context
- Change Passport disclosure

#### 02 — What Lintel observed

- findings
- inline evidence
- provenance
- operational observations
- required action for each finding

#### 03 — Uncertain or missing

- missing tests
- missing proof
- assumptions
- accepted or invalidated assumptions
- reviewer focus

#### 04 — Merge Contract

- contract identity
- numbered clauses
- blocking/advisory importance
- open/satisfied/accepted-risk states
- related records
- clearance evidence
- re-check movement

#### 05 — Appendix

Collapsed by default:

- canonical run
- fingerprints
- Verification Pack
- Builder–Verifier Boundary
- full readiness history
- exports
- technical provenance

### 7.3 Verification trace

The report header contains the full trace:

```
Change → Observation → Evidence → Requirement → Human decision
```

Node vocabulary:

- filled circle: satisfied;
- half-state circle: partial;
- outlined circle: open or unavailable;
- diamond: human decision;
- filled diamond: applicable recorded human decision.

Rules:

- state must come from real data;
- every node links to its owning section;
- no ambient animation;
- semantic colour appears only when the state is decided;
- unknown is neutral, never red.

### 7.4 Findings

Shared record grammar:

```
F1 | HIGH | Finding title                    RULE DETECTED
           Explanation
           │ E1 supporting evidence
           │ Related requirement C1
           Required action
```

Rules:

- one severity chip;
- provenance visible;
- evidence attached directly beneath the claim;
- references use mono;
- no separate evidence card requiring mental correlation;
- full evidence detail expands in place.

### 7.5 Assumptions and missing proof

Shared row grammar:

```
A1 | ASSUMED | Provider tolerates repeated submission | BLOCKING
M1 | MISSING | No test exercises retry-twice path
```

Unknown or unproven items use neutral outlined states.

Red is reserved for verified harm—not uncertainty.

### 7.6 Merge Contract

The contract looks like a contract.

Collapsed clause row:

```
C1 | Prove retries cannot issue duplicate codes | BLOCKING | OPEN
```

Expanded detail contains:

- related findings;
- related evidence;
- clearance criteria;
- owner cue;
- re-check status;
- override controls.

Only open blocking clauses expand by default.

Satisfied clauses remain compact.

### 7.7 Verdict rail

Fixed order:

1. Lintel recommendation
2. Because-clause
3. Risk record
4. Open requirements
5. Missing proof
6. Next action
7. Human decision
8. Collapsed review state and ledger history
9. Secondary export actions

The recommendation must be written as:

> **TESTS REQUIRED — Held back by two open blocking requirements and one missing retry-path test.**
>

Not as disconnected labels and numbers.

### 7.8 Human decision

The decision is the visual terminus.

Awaiting:

- compact pending block;
- one `Record decision` action;
- full controls disclosed on demand.

Recorded:

- raised plane;
- outcome at 16–18px/600;
- actor;
- timestamp;
- applicable commit;
- reason;
- alignment.

Divergent:

```
Lintel recommended: TESTS REQUIRED
Engineer decided: APPROVED WITH ACCEPTED RISK
Reason: ...
```

The human entry appears last and carries greater visual weight.

No alarm styling. Divergence is recorded respectfully.

### 7.9 Responsive report

At 1100px and below:

- outline becomes a section selector;
- verdict rail becomes a compact bottom bar;
- decision opens in a focus-trapped sheet;
- document uses full available width.

At 600px and below:

- trace becomes glyph-led;
- record columns stack;
- technical identifiers wrap safely;
- decision remains reachable without scrolling to the end of the document

## 8. Team, policies and settings vision

Administrative areas should feel quiet and organised.

They should not compete visually with active verification work.

### 8.1 Page structure

```
Title + concise context + primary action
Section tabs, when genuine siblings exist
Rule-separated groups
```

Examples of valid section tabs:

**Team**

- Overview
- Members
- Repositories
- Ownership
- Activity

**Settings**

- General
- Analysis
- Integrations
- Notifications
- Data handling

### 8.2 Settings groups

Desktop settings may use a two-column grid when the groups are independent and similarly sized.

Example:

```
┌──────────────────────────┬──────────────────────────┐
│ Review defaults          │ Data handling            │
│ Policy profile           │ Retention                │
│ Model assistance         │ Redaction                │
└──────────────────────────┴──────────────────────────┘
```

Rules:

- each group is one bordered plane;
- no glass;
- no shadow plume;
- heading, explanation and controls align consistently;
- rows use 44–52px vertical rhythm;
- switches align to the right;
- descriptions are secondary text;
- save action lives in the top bar or page header;
- destructive actions occupy their own final section.

### 8.3 Team and repository records

Use aligned tables or record rows.

No avatar wall, four-stat overview or floating role cards unless real workflows require them.

Team Overview may contain:

- members;
- connected repositories;
- unresolved ownership;
- recent verification activity.

These appear as one summary strip and structured records—not KPI cards.

---

## 9. Website vision

The public website is the cinematic expression of the same product.

### 9.1 Definitive website thesis

> **An engineering verification case unfolding through an immersive product environment.**
>

The website uses:

- Lintel’s real artifacts;
- one consistent PR case;
- product-led storytelling;
- asymmetric editorial composition;
- a restrained serif voice;
- varied scale;
- real dark/light materials.

It does not use:

- stock engineering imagery;
- mountains or landscapes;
- generic code rain;
- abstract AI networks;
- glowing gradients;
- fabricated metrics;
- fake companies or testimonials.

### 9.2 Long-term homepage architecture

#### Navigation

- Lintel
- Product
- Sample report
- Security
- Documentation
- Check a pull request
- quiet theme control

#### Movement 1 — Immersive hero

The hero occupies approximately 760–900px on wide desktop.

Composition:

- narrative column: 38–42%;
- product environment: 58–62%;
- product may bleed beyond the content grid but never hide meaningful proof.

Headline:

> Agents create code.
>
>
> Lintel verifies what is ready.
>

The visual subject is a large working Case File—not a small screenshot inside a browser card.

The hero must reveal:

- PR identity;
- verification trace;
- recommendation;
- open requirements;
- enough of the report to establish credibility.

#### Movement 2 — The readiness gap

Editorial problem statement followed by the full trace.

Three concrete failure records only.

No generic “benefit” cards.

#### Movement 3 — One persistent verification case

This is the future immersive centrepiece.

As the visitor progresses:

1. a finding becomes selected;
2. evidence attaches;
3. the related clause appears;
4. the requirement remains open;
5. additional proof changes the requirement state;
6. the human decision becomes available.

Narrative copy changes alongside one persistent product surface.

The website should feel like operating Lintel, not browsing screenshots of Lintel.

#### Movement 4 — Quiet thesis

One major serif statement:

> A quiet ledger of evidence, moving toward a human decision.
>

Trust and data-handling facts appear as hairline records.

#### Movement 5 — Human authority

The widest and heaviest product scene.

The recommendation remains visible, but the recorded human decision becomes dominant.

The decision diamond fills only when the recorded state appears.

#### Movement 6 — Security and trust

Only real claims:

- credentials stay server-side;
- diffs are processed transiently where true;
- deterministic analysis remains available;
- provenance is explicit;
- data retention is documented;
- human decisions are recorded.

#### Movement 7 — Final action

Concise:

> Bring the change you’re unsure about.
>

Two actions:

- Check a pull request
- View the sample report

### 9.3 Website visual treatment

- dark-first near-black canvas;
- warm-paper light mode;
- current implementation: Newsreader at exactly three narrative moments, Geist Sans elsewhere and Geist Mono only for real identifiers;
- long-term licensed implementation: Tiempos Headline at those same three narrative moments, Söhne elsewhere and Söhne Mono only for real identifiers;
- family migration does not change the semantic roles, hierarchy or type metrics;
- product frames use app tokens;
- no macOS traffic-light chrome;
- no fake browser windows;
- no decorative glow;
- one intentional shadow only where a product plane genuinely floats;
- asymmetry on hero and alternating product exhibits;
- centered composition reserved for the human-decision climax and final action.

### 9.4 Website and application continuity

A visitor moving from `/` to `/report` must feel that they entered the product shown on the website.

The website may use:

- more whitespace;
- larger typography;
- editorial cropping;
- selective motion.

It may not use:

- a different colour system;
- different status chips;
- different trace semantics;
- different sample data;
- fabricated product states;
- different terminology.

---

## 10. Colour system

The existing E7 semantic theme architecture remains the foundation.

No route-local palette is allowed.

### 10.1 Dark planes

```
Canvas:   #0b0c0e
Sidebar:  #0e1013
Surface:  #121419
Raised:   #171a20
Inset:    deepest neutral well from the E7 layer
```

Structure is created through plane changes and hairline borders—not shadows.

### 10.2 Light planes

```
Canvas:   #f5f3ee
Sidebar:  #eeece6
Surface:  #fbfaf7
Raised:   warm near-white
Inset:    restrained warm grey
```

Light mode must not become a bright white analytics dashboard.

### 10.3 Semantic colours

Semantic colour roles are fixed:

- green: satisfied, ready, cleared;
- amber: tests required, blocking open, caution;
- red: verified harm, regression or destructive action;
- blue: selected, information, direct observation;
- violet: model-assisted provenance only;
- grey: unknown, historical, unavailable, neutral.

Rules:

- green is not a brand colour;
- red is not used for missing proof;
- violet never decorates ordinary AI copy;
- structural surfaces remain neutral;
- every coloured state includes a text label.

## 11. Typography

### 11.1 Application

The current open-source application implementation uses Geist Sans and Geist Mono. The [normative application type scale](#normative-application-type-scale) below governs every application surface and remains stable across a future licensed migration.

Geist Mono is used only for:

Used only for:

- hashes;
- run IDs;
- record references;
- file paths;
- timestamps;
- counts where tabular alignment matters;
- schema or version identifiers.

Not used for:

- navigation;
- buttons;
- marketing eyebrows;
- section headings;
- explanatory text.

The application uses no serif, no text below 10px, no weight above 600 and no decorative mono.

### 11.2 Website

The current open-source website implementation uses Geist Sans, Geist Mono and Newsreader. Newsreader is used only for:

Used only for:

- hero statement;
- central thesis;
- final action.

Weight: approximately 500.

No serif inside the product application.

### Definitive long-term typography direction

For the final premium Lintel identity, I recommend:

#### 1. Application and website sans: **Söhne**

Use Söhne throughout:

- application shell;
- navigation;
- buttons;
- controls;
- queue rows;
- inspectors;
- report body;
- website body copy;
- non-editorial website headings.

Why it fits:

- neutral without feeling generic;
- technical without being cold;
- excellent at small interface sizes;
- confident at medium and large headings;
- less recognisably tied to one established engineering company;
- suitable for both dense workspaces and spacious marketing layouts.

It provides the clean engineering discipline you like without making Lintel look like a Vercel starter or a direct Linear imitation.

#### 2. Technical text: **Söhne Mono**

Use the related mono family for:

- run IDs;
- commit hashes;
- record references such as `F1`, `E3`, `C2`;
- file paths;
- branches;
- timestamps;
- fingerprints;
- schema versions;
- tabular counts where technical alignment matters.

Using a related sans and mono superfamily will make Lintel feel much more intentionally designed than combining unrelated interface and code fonts.

Mono remains a technical instrument—not a brand voice.

#### 3. Website editorial serif: **Tiempos Headline**

Use Tiempos Headline only for:

- homepage hero statement;
- major mid-page thesis;
- final call to action.

Why it fits better than the current treatment:

- editorial without feeling like a fashion brand;
- authoritative and serious;
- strong at large display sizes;
- warmer than the application without disconnecting from it;
- works particularly well with the “technical ledger / engineering dossier” identity.

The website would gain emotional and editorial character while the application remains entirely sans and mono.

#### Final premium family

```
Application UI:       Söhne
Technical records:    Söhne Mono
Website statements:   Tiempos Headline
```

That is the typography system I would place into LVOS as the permanent target.

### Font-licensing boundary

Söhne, Söhne Mono and Tiempos Headline are commercial fonts. They must not be sourced, added, distributed or used in production without valid licences. No font files are included by this specification.

This gives us two stages.

#### Current open-source implementation

Continue temporarily with:

```
Application UI:       Geist Sans
Technical records:    Geist Mono
Website statements:   Newsreader
```

Apply the final semantic roles, hierarchy and type metrics immediately.

#### Long-term licensed target

Once the product is approaching public launch or funding/customer presentation quality:

```
Geist Sans   → Söhne
Geist Mono   → Söhne Mono
Newsreader   → Tiempos Headline
```

Because the semantic roles, hierarchy, type metrics and CSS variables remain stable, this can be a controlled typography migration rather than another redesign.

### Normative application type scale

The application should feel compact, crisp and carefully typeset.

| Role | Size | Line height | Weight |
| --- | ---: | ---: | --- |
| Page title | 20px | 28px | 550 where supported, otherwise 500 |
| Major workspace heading | 16px | 24px | 550 where supported, otherwise 500 |
| Section heading | 14px | 20px | 600 |
| Record title | 13px | 19px | 550 where supported, otherwise 500 |
| Primary body | 13px | 20px | 400 |
| Secondary/support | 12px | 18px | 400 |
| Micro-label | 10px | 14px | 600 |
| Technical metadata | 10–11px | 16px | 400 or 500 |

This is the only authoritative application scale. No application text is below 10px; no application weight is above 600; the application uses no serif and no decorative mono.

#### Navigation

- contextual navigation rows use the record-title role;
- navigation group labels use the micro-label role with `+0.10em` tracking;
- counts and shortcuts use the technical-metadata role only when they are genuine technical values.

Avoid oversized or excessively bold navigation text.

#### Top bar

- breadcrumb and context use the secondary/support role;
- the current object uses the record-title role;
- actions use the secondary/support role and gain emphasis from placement or control treatment, not heavier type.

The top bar should feel more precise than the body, not louder.

#### Weight ceiling

The application should primarily use:

- 400;
- 500;
- 550 where supported;
- 600 for critical headings and labels.

Avoid 700–900 entirely.

Too much bold text makes engineering interfaces feel visually inexpensive and difficult to scan.

### Landing-page typography specification

Website roles use the current open-source families until valid premium licences exist. A licensed migration changes the families, not the roles or metrics.

#### Hero

```
Eyebrow:         Interface sans, 10px / 14px / 600 / +0.14em
Headline:        Editorial serif, 52–68px / 0.98–1.04 / 500
Lede:            Interface sans, 15–17px / 1.6 / 400
CTA:             Interface sans, 13–14px / 500
```

The headline should feel architectural, not merely large.

#### Product-section headings

Use the interface sans rather than the editorial serif:

```
Section heading: 32–44px / 1.08 / 550
Supporting copy: 15px / 1.65 / 400
```

This creates stronger contrast between:

- editorial brand statements;
- explanatory product storytelling;
- actual product UI.

#### Thesis statements

Use the editorial serif only at the three approved moments. Give it space. Do not surround it with many labels, cards or controls.

### Typographic character rules

#### Tracking

- large serif: approximately `-0.02em`;
- large sans headings: approximately `-0.025em`;
- interface text: approximately `-0.005em` to `0`;
- mono identifiers: `0`;
- uppercase micro-labels: `+0.10em` to `+0.14em`.

#### Numerals

Use tabular numerals for:

- risk scores;
- requirement counts;
- timestamps;
- run comparisons;
- table columns;
- operational summaries.

Use proportional numerals in ordinary prose.

#### Line length

- application reading copy: roughly 55–75 characters;
- website narrative: roughly 45–65 characters;
- report document: roughly 65–80 characters;
- inspectors: shorter lines, roughly 35–50 characters.

Many current visual issues that appear to be “font problems” are actually line-length and layout problems.

#### Casing

- sentence case for headings, buttons and navigation;
- uppercase only for scarce micro-labels and status vocabulary;
- mono does not automatically imply uppercase;
- do not use uppercase as a substitute for hierarchy.

### What should change conceptually

The workspace should feel typographically closer to:

> a professional IDE, technical review environment and carefully typeset operations tool
>

rather than:

> a collection of small SaaS cards with headings and captions.
>

The website should feel closer to:

> an editorial engineering publication presenting a serious instrument
>

rather than:

> a dark landing page that happens to contain serif headings.
>

### Normative typography statement

The typography section should state:

> **Lintel uses one disciplined grotesk for all interface and explanatory communication, its related mono for genuine technical identifiers, and one editorial serif for exactly three public narrative moments. Typography establishes hierarchy before borders, colour or containers. The application never uses serif, never drops below 10px, never exceeds weight 600, and never uses mono decoratively.**
>

---

## 12. Spacing, borders and radii

### Spacing scale

```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
```

Default patterns:

- toolbar gap: 8–12px;
- row padding: 12–16px;
- panel padding: 16–20px;
- section separation: 32–48px;
- website movement separation: 80–128px depending on density.

### Borders

- 1px only;
- standard and strong variants;
- interior rules define groups;
- no repeated nested outlines;
- maximum two bordered containment levels.

### Radii

```
4px  — status, small technical controls
6px  — buttons, fields
8px  — rows and compact regions
10px — cards only when a true card is necessary
12px — major working planes and overlays
```

Pill radii are reserved for:

- genuine status chips;
- toggle tracks;
- user/avatar controls where appropriate.

### Shadows

Application:

- menus;
- command palette;
- drawers;
- modal sheets;
- drag layers.

Website:

- restrained product-frame elevation only.

No ordinary application panel receives a large shadow.

---

## 13. Controls and component grammar

### Buttons

- compact: 32px;
- standard: 36–40px;
- mobile or primary touch: at least 44px;
- one filled primary action per region;
- secondary actions use a border or text treatment;
- destructive actions remain visually separate.

### Inputs

- 36–40px desktop;
- 44px mobile;
- labels above or alongside consistently;
- supporting text remains secondary;
- error copy appears beside the failed control.

### Tabs

Use tabs only for genuine sibling views.

Primary tabs:

- text-led;
- compact;
- aligned to a shared rule;
- not large pills.

Segmented controls are reserved for modes or small filters.

### Toolbars

A toolbar may contain:

- search;
- filters;
- view options;

- sorting;
- one primary action.

It may not become a second navigation system.

### Inspectors

- one inspector per surface;
- right anchored on desktop;
- sheet on mobile;
- no modal stacked over an inspector;
- selection context remains visible;
- actions belong here rather than in every row.

## 14. Motion constitution

Motion communicates verification state.

It never exists simply to make the interface feel active.

### Timing

- micro interaction: 100–120ms;
- selection or disclosure: 140–180ms;
- drawer or sheet: 180–240ms;
- meaningful verification state change: 180–260ms.

### Approved motion

- row selection;
- inspector appearance;
- disclosure expansion;
- evidence attachment;
- clause changing state;
- trace segment progressing;
- decision record appearing;
- delta showing what changed;
- drawer and command palette transitions.

### Prohibited motion

- ambient pulsing;
- infinite trace animation;
- glowing borders;
- floating cards;
- background particles;
- parallax without explanatory value;
- idle movement;
- staggered animation on every list row.

### Reduced motion

All essential state changes remain understandable with no animation.

---

## 15. Content and language rules

Application language is terse and declarative.

Use:

> TESTS REQUIRED — Held back by one open retry-path requirement.
>

Avoid:

> What might be preventing this pull request from being completely ready?
>

Use:

> Missing proof
>

Avoid:

> AI confidence gap
>

Use:

> Model assisted
>

Avoid:

> Powered by advanced AI
>

Use:

> Engineer decision pending
>

Avoid:

> Let Lintel make the final call
>

Marketing voice belongs on the website. Product surfaces speak like records and controls.

---

## 16. Permanent prohibitions

From LVOS v1.0 onward:

- no route-specific visual identity;
- no generic KPI dashboard;
- no glass cards;
- no gradient or glow as structure;
- no new colour outside semantic tokens;
- no sub-10px text;
- no font weight over 600;
- no more than two bordered nesting levels;
- no card for every concept;
- no gauges or donuts for readiness;
- no action walls inside queue rows;
- no tabs added merely to hide complexity;
- no product philosophy repeated inside working surfaces;
- no fake metrics, customers or testimonials;
- no decorative AI imagery;
- no website mockup that contradicts the real application;
- no new feature without a defined home in an approved page archetype.

---

## 17. Implementation governance

This is how we prevent Claude and Codex from reinterpreting Lintel.

### Every visual prompt must include

```
Lintel follows LVOS v1.0.

Do not propose or implement an alternative visual direction.

Use only the approved page archetype for this route.

Preserve the global shell, semantic tokens, typography, spacing,
record grammar, inspector rules and responsive transformations.

New visual primitives require explicit approval.
```

### Before implementation, every milestone must state

1. approved page archetype;
2. existing components being reused;
3. exact regions changing;
4. exact regions untouched;
5. desktop composition;
6. mobile transformation;
7. data states displayed;
8. interactions preserved;
9. LVOS rules being applied;
10. acceptance criteria.

### Claude’s role

Claude should be used for:

- critique against LVOS;
- detecting visual inconsistencies;
- proposing bounded corrections;
- storyboard and motion review;
- cross-theme visual QA.

Claude should not be asked to invent a fresh visual identity.

### Codex’s role

Codex should be used for:

- implementing the approved composition;
- consolidating components;
- migrating legacy CSS;
- building responsive behaviour;
- preserving product functionality;
- implementing motion primitives;
- validation and correction.

Codex should not be told to “make it more premium” without exact LVOS requirements.

### Visual review threshold

A milestone is not complete because:

- it builds;
- the controls work;
- it roughly resembles the reference.

It is complete when:

- it uses the correct archetype;
- hierarchy is immediately clear;
- no legacy visual dialect remains;
- dark and light modes both work;
- desktop and mobile transformations are deliberate;
- no feature has created a new component grammar;
- the page belongs unmistakably to the same product.

---

## 18. Definition of success

Lintel’s visual system succeeds when a senior engineer can open any surface and immediately understand:

- where they are;
- what object is selected;
- what Lintel believes;
- what evidence supports it;
- what remains unknown;
- what requirement is open;
- what action comes next;
- who owns it;
- whether a human decision has been recorded.

And visually, the product should feel:

> like one precise engineering workstation—not a sequence of features built at different times.
>

---

### The definitive identity

The final wording to carry into every future plan is:

> **Lintel is a high-end engineering verification workstation for senior engineers. Its interface combines the operational clarity of a command centre with the evidentiary discipline of a technical ledger. Every change moves through observation, evidence and explicit requirements toward a recorded human decision.**
>

This is now the identity. We do not need another visual-direction exercise.
