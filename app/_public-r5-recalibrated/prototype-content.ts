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

export const TRUST_NOTE = {
  headline: "A read-only sample, honestly labelled.",
  supporting:
    "This is an interactive sample built from one real, unresolved review. Nothing you do here calls a model, creates a review, records a Human Decision or writes anywhere outside this page. Deterministic analysis provides the baseline; model assistance is optional and never selects or records the Human Decision.",
};

export const CLOSEOUT = {
  headline: "Inspect the review for yourself.",
  supporting:
    "The case remains unresolved. Open the read-only sample to follow its evidence, or start a review with your own change.",
  legal: "© Lintel",
  boundary: "Private prototype — R5E.1C. Not linked from the production site.",
};

export const PROTOTYPE_LABEL = "Prototype — R5E.1C verification journey";

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
