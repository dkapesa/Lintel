/* R5E.1B — public chrome copy for the recalibrated prototype.

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

export const HOW_IT_WORKS = {
  headline: "Eight stages structure the review.",
  supporting:
    "A change can produce findings. Canonical evidence supports or weakens them. Missing or unverified evidence is shown as missing proof. Blocking gaps can surface requirements. Requirements and affected context inform readiness. The accountable engineer retains the Human Decision. The live shell above traces this record for one real review.",
};

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
  boundary: "Private prototype — R5E.1B. Not linked from the production site.",
};

export const PROTOTYPE_LABEL = "Prototype — R5E.1B navigation, hero and live shell";
