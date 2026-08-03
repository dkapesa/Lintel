/* R5E.1E.2A/B — public chrome copy for the reference-led reconstruction.

   Navigation labels and destinations are fixed by the task brief §10 (R5E.1E.2A)
   and extended by R5E.1E.2B §8, which adds Trust now that the Trust section
   exists.

   Hero headline and supporting direction come from the R5E.1E.2A task brief
   §11. The supporting line is refined only for clarity and line length, as §11
   permits: the accepted wording in
   app/_public-r5-recalibrated/prototype-content.ts runs to 34 words and four
   lines in a 400px measure, which neither reference recording ever does. See
   docs/r5/R5E1E2A_REFERENCE_RECONSTRUCTION_LOCK.md §3.

   No canonical product value appears in this file. Product truth lives in
   app/_public-r5-recalibrated/canonical-review.ts and is imported, never
   restated. */

export const SAMPLE_REVIEW_HREF = "/workspace?source=fixture";
export const NEW_REVIEW_HREF = "/new";
export const ROUTE_HREF = "/visual-lab/public-r5-reference-reconstruction";

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Trust", href: "#trust" },
] as const;

export const ACTIONS = {
  primary: "Open the sample review",
  primaryShort: "Open sample",
  secondary: "Start a review",
} as const;

export const HERO = {
  headline: "Know what is ready to merge.",
  supporting:
    "Lintel connects a software change to its findings, evidence, missing proof and requirements, so an engineer can make an accountable decision.",
} as const;

export const HERO_SCENE = {
  label: "Selected review",
  caption:
    "One review, as Lintel presents it: what changed, what Lintel recommends, and what still needs attention.",
} as const;

export const FINDING_SECTION = {
  id: "how-it-works",
  heading: "Trace every finding to the evidence.",
  supporting:
    "Lintel connects an observation to the code, tests, runs and provenance behind it, so a claim can be checked rather than trusted.",
  sceneLabel: "Finding, evidence and provenance",
} as const;

export const MISSING_PROOF_SECTION = {
  id: "missing-proof",
  heading: "See what is still unproven.",
  supporting:
    "Absence of a detected issue is not proof of safety. Lintel names the evidence that is missing or unverified, and the requirement it leaves open.",
  sceneLabel: "Missing proof and the requirement it blocks",
} as const;

/* R5E.1E.2B additions below. Same discipline as the first gate: one message
   per section, and the product scene carries most of the explanation. */

export const READINESS_SECTION = {
  id: "readiness",
  heading: "Readiness remains accountable.",
  supporting:
    "Lintel synthesises the evidence and open requirements into a readiness recommendation. The accountable engineer still makes the decision.",
  sceneLabel: "Readiness and the pending Human Decision",
} as const;

/* The scene's own closing statement — the one sentence R5E1A locks as the
   guided preview's authority line (canonical-review.ts DECISION_DIALOG_COPY),
   restated here as public chrome copy so the scene component does not need to
   import a fifth canonical constant for one sentence it does not otherwise use. */
export const DECISION_AUTHORITY_STATEMENT = "Lintel recommends. The engineer decides.";

/* R5E.1E.2D (task brief §9.9): the previous wording said the outcomes were
   "shown below" — positional language that does not hold as a general
   description of the relationship between this note and the outcome list.
   Replaced with wording that states what is true regardless of layout, and
   compressed to one line at the same time, per the brief's density
   correction. */
export const DECISION_OUTCOMES_NOTE =
  "Seven outcomes are available and unselected. Open the sample review for the complete decision surface.";

export const TRUST_SECTION = {
  id: "trust",
  heading: "Know where every conclusion comes from.",
  supporting:
    "Lintel keeps its boundaries explicit about what is deterministic, what is model assisted, and what this sample does and does not do.",
  records: [
    {
      label: "Baseline",
      detail: "Deterministic analysis provides the recommendation, risk and requirements shown throughout.",
    },
    {
      label: "Model assistance",
      detail:
        "Optional, and always identified through provenance when used — never silent, never the default.",
    },
    {
      label: "This sample",
      detail:
        "Performs no external write and does not create or modify a review. PR #482 stays exactly as shown.",
    },
    {
      label: "Human Decision",
      detail: "Belongs to the accountable engineer, not to Lintel.",
    },
  ],
} as const;

export const HANDOFF = {
  eyebrow: "Still unresolved",
  headline: "This case remains open.",
  supporting:
    "Nothing on this page changed PR #482. Inspect the complete sample for yourself, or begin a separate review with your own change.",
} as const;

export const FOOTER = {
  purpose: "Lintel connects a software change to the record an engineer needs to decide on it.",
  legal: "© Lintel",
  boundary: "Private visual laboratory — not linked from production.",
} as const;
