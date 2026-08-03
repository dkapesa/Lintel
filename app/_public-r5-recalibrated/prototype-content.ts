/* R5E.1B/C — public chrome copy for the recalibrated prototype.

   Navigation labels and destinations are frozen by
   docs/r5/R5E1A_NAVIGATION_AND_PUBLIC_IA_CONTRACT.md §2. The hero headline
   and trust line are frozen by
   docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §10 ("unchanged by this
   milestone"). Anchor id values chosen here are an R5E.1B implementation
   decision and, once chosen, are fixed for the remainder of R5E.1 per the
   navigation contract §2. */

export const SAMPLE_REVIEW_HREF = "/workspace?source=fixture";
export const NEW_REVIEW_HREF = "/new";

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Trust", href: "#trust" },
] as const;

export const TRUST_LINE =
  "Deterministic by default. Model assistance is optional. The engineer decides.";

export const HERO = {
  headline: "Know what is ready to merge.",
  supporting:
    "Lintel connects a change to its findings, its evidence, its missing proof and its open requirements, so an engineer can judge readiness and record an accountable decision.",
};

export const ACTIONS = {
  primary: "Open the sample review",
  primaryFull: "Open the sample review",
  secondary: "Start a review",
} as const;

export const CLOSEOUT = {
  headline: "Inspect the review for yourself.",
  supporting:
    "The case remains unresolved. Open the read-only sample to follow its evidence, or start a review with your own change.",
  legal: "© Lintel",
  boundary: "Private visual laboratory — not linked from production.",
};

/* R5E.1C additions. Movement two uses the accepted problem statement
   verbatim (docs/r5/R5E1A_SYSTEM_AND_INTERACTION_LOCK.md §10, "Movement
   two"); movement three's per-stage narrative pulls its facts from
   canonical-review.ts directly in VerificationJourneyNarrative.tsx rather
   than restating them here, so no canonical value is paraphrased in two
   places. */
export const VERIFICATION_GAP = {
  headline: "Changes arrive faster than proof does.",
  supporting:
    "A pull request can look complete before every claim behind it is proven. The live shell above already shows one real, unresolved review — a fix that adds retry behaviour without a confirmed guarantee it cannot issue a duplicate discount code. What follows traces that review's own records, in the product's own order, either by scrolling or by choosing a stage directly.",
};

export const JOURNEY_INTRO = {
  headline: "Follow the verification record.",
  supporting:
    "A change can produce findings. Canonical evidence supports or weakens them. Missing or unverified evidence is shown as missing proof. Blocking gaps surface requirements. Requirements and affected context inform readiness. The accountable engineer retains the Human Decision. The shell above follows this sequence as you scroll — choosing a stage directly, here or in the shell's own verification spine, works the same way and pauses the guided sequence until you resume it.",
};

/* R5E.1D — movement four ("Accountable decision"). Frames the transition
   from Readiness into Human Decision per the task brief §6: the record
   above is complete enough to inspect, unresolved requirements remain,
   readiness stays advisory, the engineer retains authority, and nothing
   here implies an outcome is inevitable or that the surface below submits
   anything. */
export const ACCOUNTABLE_DECISION = {
  headline: "Readiness is advisory. The decision is not automatic.",
  supporting:
    "The record above is complete enough to inspect: the finding, its evidence, what remains missing, the blocking requirement and where it reaches. Two requirements are still open. Lintel has not finished this review on the engineer's behalf — it has assembled the record the engineer decides from. What follows is that decision surface, exactly as it stands in this sample: every outcome unselected, nothing submitted.",
};

/* R5E.1D — movement five, part one: the compact trust boundary. Genuine
   product truths only, per docs/r5/R5E1D task brief §12: deterministic
   analysis is the baseline, model assistance is optional and identified in
   provenance when used, the sample performs no external write and does not
   create or modify a review, and Human Decision belongs to the engineer.
   No compliance claim, no deployment option, no customer logo — detailed
   security/architecture pages remain future R5F work. */
export const TRUST_BOUNDARY = {
  headline: "What this sample does and does not do.",
  supporting:
    "A compact, honest boundary — not a security page. Detailed architecture and data-boundary documentation remain separate, future work.",
  records: [
    {
      label: "Baseline",
      detail: "Deterministic analysis provides the recommendation, risk and requirements shown throughout.",
    },
    {
      label: "Model assistance",
      detail: "Optional, and identified in provenance when used — the inferred error-contract evidence above, for example.",
    },
    {
      label: "External writes",
      detail: "None. This sample never calls a model, creates a review, or writes anywhere outside this page.",
    },
    {
      label: "This review",
      detail: "Never created or modified by anything here. PR #482 stays exactly as shown, in every state.",
    },
    {
      label: "Human Decision",
      detail: "Belongs to the accountable engineer. No outcome is recorded in this demonstration.",
    },
  ],
} as const;

/* R5E.1D — movement five, part two: the unresolved-case handoff. The next
   operation in the same case, not a repeated hero CTA — a compact canonical
   record plus the same two genuine destinations already used in the hero. */
export const UNRESOLVED_HANDOFF = {
  eyebrow: "Still unresolved",
  headline: "This case remains open.",
  supporting:
    "Nothing on this page changed PR #482. Inspect the complete sample for yourself, or begin a separate review with your own change.",
};
