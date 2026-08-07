import { CANONICAL_REVIEW } from "../../_public-r5-recalibrated/canonical-review";
import type {
  CanonicalAnalysisSource,
  ReproducibilityClassification,
} from "../../../lib/canonical-review-run";
import type {
  ChangePassportProducerType,
  DeclarationState,
} from "../../../lib/change-passport";
import type {
  HumanDecisionOutcome,
  RecommendationDivergence,
} from "../../../lib/human-decision-ledger";

/* Provenance: README.md:132-180,460-480;
   app/api/generate-report/route.ts:30-49,186-252,311-331;
   app/_public/metadata.ts:21-48. */
export const TRUST_METADATA = {
  title: "Trust",
  description:
    "The deterministic baseline, model provenance, submitted-content boundaries, run records and current limitations behind Lintel.",
} as const;

/* Provenance: README.md:122-128,130-180,460-480;
   app/api/generate-report/route.ts:30-49;
   app/_public/metadata.ts:21-48. */
export const TRUST_INTRODUCTION = {
  eyebrow: "Trust",
  title: "Where each conclusion comes from, and what Lintel cannot do.",
  lead:
    "Trust records Lintel's run mode, boundaries, provenance and limits. Every statement on this page traces to the repository implementation.",
  primaryAction: {
    label: "Open the sample review",
    href: "/workspace?source=fixture",
  },
  secondaryAction: { label: "How it works", href: "/how-it-works" },
} as const;

/* Provenance: README.md:122-128,130-180,460-480;
   app/_public/metadata.ts:21-48;
   app/api/generate-report/route.ts:30-49;
   app/api/github-app/route.ts:1-44. */
export const AVAILABILITY_CONTENT = {
  title: "Availability",
  statement: "Lintel runs locally from this repository.",
  paragraphs: [
    "It is a Next.js application you clone, install and run on your own machine. It is not a hosted service. There is no account, no sign-up, no trial and no commercial plan. Hosted deployment is not claimed.",
    "What you can do today: open the fixed sample review, import a public GitHub pull request, or paste a diff and analyse it locally.",
    "Optional capability is environment-configured. Model-assisted analysis requires a provider key. The GitHub App is a prototype that requires app credentials and a webhook secret, and persists to the local filesystem.",
    "No production origin is configured for this site, so no canonical URL is published.",
  ],
  facts: [
    { label: "Run mode", value: "Local" },
    { label: "Hosted service", value: "Not claimed" },
    { label: "Accounts", value: "None" },
    { label: "Plans and pricing", value: "None" },
  ],
} as const;

/* Provenance: app/api/generate-report/route.ts:30-49,186-252,311-331;
   app/api/fetch-pr-diff/route.ts:5-15,41-70;
   lib/github-app-auth.ts:3-4,71-82,107-134;
   app/api/github-app/webhook/route.ts:145-232;
   app/_public/shell/public-shell.module.css:1-6;
   app/(public)/product/product-content.ts:22-28. */
export const RUN_BOUNDARIES_CONTENT = {
  title: "Where analysis runs",
  lead:
    "Deterministic analysis performs no external request; every external destination below is entered only under a stated configuration.",
  records: [
    {
      title: "Deterministic analysis",
      runs: "Local process",
      destination: "None",
      condition: "Always. No network request is made.",
    },
    {
      title: "Model-assisted analysis",
      runs: "Local process, external call",
      destination: "api.openai.com",
      condition:
        "Only when OPENAI_API_KEY and OPENAI_MODEL are both configured, and the request is not deterministic-only.",
    },
    {
      title: "Public pull request import",
      runs: "Local process, external read",
      destination: "github.com",
      condition: "Only when a visitor submits a public GitHub pull request URL.",
    },
    {
      title: "GitHub App prototype",
      runs: "Local process, external read/write",
      destination: "api.github.com",
      condition:
        "Only when app credentials and a webhook secret are configured, and a verified delivery arrives.",
    },
  ],
  publicSiteBoundary:
    "The public site itself makes zero external requests. It uses no analytics, CDN, third-party script, external font or embedded media.",
  externalWriteBoundary:
    "The only external write in the system is a pull request comment created or updated by the GitHub App prototype. Model-assisted analysis and public pull request import are read-only.",
} as const;

/* Provenance: app/api/generate-report/route.ts:17,25-28,210-237,311-331;
   README.md:132-143,460-480. */
export const DETERMINISTIC_BASELINE_CONTENT = {
  title: "The deterministic baseline",
  body:
    "Deterministic analysis is the baseline and does not require model access. When model configuration is absent, the model call fails, or its output does not validate, Lintel returns the deterministic report rather than failing silently.",
  recommendations: ["APPROVE", "REVIEW_REQUIRED", "TESTS_REQUIRED"],
  vocabulary:
    "The deterministic recommendation vocabulary is APPROVE, REVIEW_REQUIRED and TESTS_REQUIRED.",
  limitation: "The baseline is a floor, not a proof of safety.",
} as const;

/* Provenance: app/api/generate-report/route.ts:17,25-28,186-252,311-331;
   lib/canonical-review-run.ts:13-22,191-202,270-341;
   README.md:132-143,460-480. */
export const MODEL_PROVENANCE_CONTENT = {
  title: "Model-assisted analysis and provenance",
  statements: [
    "Deterministic analysis is the baseline; model assistance is optional.",
    "Availability depends on provider and environment configuration: OPENAI_API_KEY and OPENAI_MODEL must both be set.",
    "Every run records an analysis source of deterministic, model, fallback or demo, with provider and model recorded alongside when present.",
    "When model assistance is configured, submitted content is sent outside the local application to the configured provider.",
    "Model output does not become Human Decision authority. It never suppresses a deterministic finding, clears a missing test or downgrades operational attention.",
    "Exact reproducibility is not claimed for model-assisted output; those runs are classified traceable, not exact.",
  ],
  analysisSources: [
    "deterministic",
    "model",
    "fallback",
    "demo",
  ] satisfies readonly CanonicalAnalysisSource[],
  facts: [
    { label: "Baseline", value: "Deterministic" },
    { label: "Model assistance", value: "Optional" },
    { label: "Provider", value: "Configured externally" },
    { label: "Reproducibility", value: "Traceable, not exact" },
  ],
  statuses: [
    {
      tone: "observed",
      label: "Deterministic",
      detail: "Baseline analysis; model access is not required.",
    },
    {
      tone: "model",
      label: "Model-assisted",
      detail: "Optional, provider-dependent and explicitly identified.",
    },
  ] as const,
} as const;

/* Provenance: lib/canonical-review-run.ts:7-22,24-95,145-185,191-202,270-341;
   app/api/github-app/route.ts:248-380;
   app/_public-r5-recalibrated/canonical-review.ts:26-43. */
export const RUN_PROVENANCE_CONTENT = {
  title: "Run provenance and reproducibility",
  body:
    "The canonical run manifest records input, configuration and result fingerprints, schema and ruleset versions, and a reproducibility classification.",
  canonicalFacts: [
    { label: "Review", value: CANONICAL_REVIEW.pullRequestLabel },
    { label: "Repository", value: CANONICAL_REVIEW.repository },
    { label: "Head", value: CANONICAL_REVIEW.headSha },
    { label: "Human Decision", value: CANONICAL_REVIEW.humanDecision },
  ],
  manifestFields: [
    { label: "Input", value: "inputFingerprint" },
    { label: "Configuration", value: "configurationFingerprint" },
    { label: "Result", value: "resultFingerprint" },
    { label: "Versions", value: "schema · generator · ruleset · report" },
  ],
  classifications: [
    { value: "exact", meaning: "Stored source, configuration and result matched deterministic replay." },
    { value: "traceable", meaning: "Provenance is recorded; exact model replay is not claimed." },
    { value: "source-unavailable", meaning: "The recorded source cannot be read for replay." },
    { value: "configuration-unavailable", meaning: "The recorded configuration cannot be reconstructed." },
    { value: "manual-input-not-retained", meaning: "The manually submitted raw diff was not retained." },
    { value: "historical-schema", meaning: "The run predates complete canonical-run metadata." },
    { value: "drift-detected", meaning: "The source, configuration or result no longer matches the recorded run." },
    { value: "failed", meaning: "The replay or verification attempt did not complete." },
  ] satisfies readonly { value: ReproducibilityClassification; meaning: string }[],
  fingerprintBoundary:
    "A fingerprint identifies a run. It is not a cryptographic integrity guarantee.",
} as const;

/* Provenance: app/api/generate-report/route.ts:13-15,186-252,299-331;
   app/api/fetch-pr-diff/route.ts:5-15,37-80;
   lib/canonical-review-run.ts:191-202,270-341;
   lib/change-passport.ts:82-100;
   lib/human-decision-ledger.ts:145-170;
   lib/github-app-store.ts:113-167,505-506,515-527;
   README.md:158-178,460-480. */
export const SUBMITTED_CONTENT = {
  title: "Submitted content",
  sent: {
    title: "What is sent",
    items: [
      "Model-assisted analysis sends the submitted metadata, deterministic baseline and diff to api.openai.com only when provider configuration is present and the request permits model assistance.",
      "Public pull request import reads metadata and a diff from github.com only after a visitor submits a public pull request URL.",
      "The GitHub App reads pull request metadata and a diff from api.github.com after a verified, enabled delivery.",
    ],
  },
  stored: {
    title: "What is stored",
    items: [
      "GitHub App deliveries, installations, repositories, pull request records and analysis runs are stored in .lintel-data/github-app-store.json, a plain JSON file under the working directory written through a temporary file and rename.",
      "The GitHub App retains 20 analysis runs per pull request and 20 verifications per run.",
      "Review state, report history and condition progress are stored in browser storage on the local machine and are removed when that browser storage is cleared.",
      "The Human Decision Ledger is stored in browser storage under lintel.humanDecisionLedger.v1 and is bounded to 80 entries.",
    ],
  },
  notPersisted: {
    title: "What is deliberately not persisted",
    items: [
      "Raw manually submitted diffs are not retained after report generation; those runs are classified manual-input-not-retained.",
      "Raw diff markers in passport and ledger free text are replaced with [raw diff omitted], and Bearer tokens plus api_key, token, password, secret and credential assignments are redacted by best-effort text replacement, not by a guarantee.",
      "Lintel has no server-side database, shared team store or account record.",
      "Lintel sends store: false with every model request. This request setting is not a claim about provider retention.",
      "API responses carry Cache-Control: no-store, and outbound fetches use cache: no-store.",
    ],
  },
  sizeBoundary:
    "Manually submitted and imported diffs are bounded to 200,000 characters.",
  limitation:
    "The local store is an ordinary JSON file on the machine that runs Lintel. Lintel provides no encryption at rest, access control, retention policy, deletion guarantee or audit logging for that file.",
} as const;

/* Provenance: lib/github-app-auth.ts:3-13,40-62,71-82,107-134;
   lib/github-app-webhook.ts:6,20-30,54-119;
   app/api/github-app/webhook/route.ts:115-238,242-285;
   lib/github-app-store.ts:113-191,247-259,485-506;
   README.md:168-180,460-480. */
export const GITHUB_APP_CONTENT = {
  title: "GitHub App authentication and webhooks",
  lead:
    "The GitHub App is an environment-configured prototype with local filesystem persistence, not a hosted service. Analysis on this path is deterministic only; model-assisted analysis does not run there.",
  records: [
    {
      title: "App authentication",
      statement: "An RS256 JWT is signed with the configured private key and issued per request.",
    },
    {
      title: "Short-lived credentials",
      statement:
        "The JWT expires nine minutes after issue; an installation access token is exchanged per delivery, held only for that request and never written to the store.",
    },
    {
      title: "Webhook verification",
      statement:
        "HMAC-SHA256 is calculated over the raw request body with the configured secret and compared with timingSafeEqual; an unsigned or invalid delivery is rejected with 401 before parsing or storage.",
    },
    {
      title: "Delivery deduplication",
      statement: "A recorded delivery id is answered duplicate and is not reprocessed.",
    },
    {
      title: "Same-commit deduplication",
      statement:
        "A completed analysis for the same head SHA is answered duplicate_head_sha, with no second analysis or comment.",
    },
    {
      title: "Comment idempotency",
      statement:
        "A comment is published only when the stored published head SHA differs, and a stored comment id is updated instead of adding another comment.",
    },
  ],
  allowlist:
    "Accepted events are ping, installation, installation_repositories and pull_request; pull request actions are limited to opened, reopened, synchronize and ready_for_review.",
  enableGate: "Each repository has an enable gate before analysis.",
  diffBound: "The GitHub App diff is bounded to 200,000 characters.",
  errorBoundary:
    "GitHub App authentication uses seven closed safe error categories; raw provider error text is not surfaced.",
  environmentVariables: "GITHUB_APP_ID\nGITHUB_APP_PRIVATE_KEY\nGITHUB_WEBHOOK_SECRET",
} as const;

/* Provenance: app/integrations/page.tsx:8-18,118-148,208-237,275-343. */
export const INTEGRATION_STATUS_CONTENT = {
  title: "Integration status",
  body:
    "Lintel names an integration's current state without turning configuration, non-executing architecture or local export into a connection claim.",
  records: [
    {
      status: "Configured",
      detail: "Used only when current environment status confirms a configured or authenticated path.",
      tone: "observed",
    },
    {
      status: "Unavailable",
      detail: "Used when the current capability check cannot resolve an available path.",
      tone: "blocking",
    },
    {
      status: "Blueprint",
      detail: "Does not install, run, connect or post.",
      tone: "warning",
    },
    {
      status: "Export-only",
      detail: "Copies a local handoff; it does not deliver to an external service.",
      tone: "warning",
    },
  ] as const,
} as const;

/* Provenance: lib/change-passport.ts:5-15,82-100,145-196,235-299;
   lib/canonical-review-run.ts:145-170,270-298;
   app/_public-r5-recalibrated/canonical-review.ts:26-43;
   app/api/generate-report/route.ts:210-237;
   app/(public)/product/product-content.ts:169-205. */
export const CHANGE_PASSPORT_CONTENT = {
  title: "Declared context and the Agent Change Passport",
  statements: [
    "A Change Passport is an optional machine-readable declaration read from a fenced lintel-change-passport block in a pull request description. Absent is a first-class state, and the canonical PR #482 has none.",
    "Producer type is declared as human, agent, mixed or unknown; Lintel does not infer that an agent wrote a change.",
    "Lintel separates what the builder declared from what it independently observed across supported, unverified, observed but undeclared and declared uncertainty states.",
    "Unverified means retained as builder context but not independently matched. It does not mean false.",
    "Parsing is bounded to an 8,000-character block, 900-character fields and 12 items per list; a parse failure yields no passport instead of an error.",
    "Passport identity and fingerprint are carried into the canonical run manifest as provenance.",
    "A passport does not change readiness, blockers, recommendation or scoring.",
  ],
  producerTypes: ["human", "agent", "mixed", "unknown"] satisfies readonly ChangePassportProducerType[],
  relationship: [
    { label: "Builder declaration", value: "Optional context", relation: "compared with" },
    { label: "Lintel observation", value: "Independent structured signals", relation: "kept separate" },
  ],
  states: [
    {
      state: "supported",
      label: "supported",
      detail: "A declaration independently matched by Lintel.",
      tone: "observed",
    },
    {
      state: "unverified",
      label: "unverified",
      detail: "Builder context not independently matched.",
      tone: "review",
    },
    {
      state: "observed but undeclared",
      label: "observed but undeclared",
      detail: "A Lintel observation without a matching declaration.",
      tone: "review",
    },
    {
      state: "declared",
      label: "declared uncertainty",
      detail: "Unresolved uncertainty stated by the builder.",
      tone: "warning",
    },
  ] satisfies readonly {
    state: DeclarationState;
    label: string;
    detail: string;
    tone: "observed" | "review" | "warning";
  }[],
  excerpt: `\`\`\`lintel-change-passport
{
  "producerType": "agent",
  "unresolvedUncertainty": ["A timeout may follow provider acceptance."]
}
\`\`\``,
  excerptLabel: "Declaration format — explanatory example, not PR #482",
} as const;

/* Provenance: README.md:158-166,460-480;
   lib/human-decision-ledger.ts:9-10,21-52,145-170,342-439;
   app/_public-r5-recalibrated/canonical-review.ts:26-43,318-376;
   app/api/generate-report/route.ts:210-237. */
export const HUMAN_DECISION_CONTENT = {
  title: "Human Decision authority",
  statements: [
    "Lintel produces a recommendation: APPROVE, REVIEW_REQUIRED or TESTS_REQUIRED. It does not approve, merge or clear a requirement.",
    "The Human Decision is an explicit engineer action recorded as one of seven outcomes: approve, approve with accepted risk, request changes, tests required, review required, blocked or defer.",
    "The decision ledger records who decided, when, against which head SHA and which canonical run, and supports supersede, reaffirm and withdraw events.",
    "A decision recorded against an earlier commit becomes predates-current-head, and reaffirmation is required. Authority does not silently carry forward.",
    "Divergence between the recommendation and human outcome is recorded as aligned, human-more-conservative, human-accepted-additional-risk or materially-different; Lintel does not correct it.",
    "Model output never becomes decision authority.",
    `In the canonical case the Human Decision stays ${CANONICAL_REVIEW.humanDecision}, and no outcome is selected.`,
  ],
  outcomes: [
    "approve",
    "approve-with-accepted-risk",
    "request-changes",
    "tests-required",
    "review-required",
    "blocked",
    "defer",
  ] satisfies readonly HumanDecisionOutcome[],
  divergence: [
    "aligned",
    "human-more-conservative",
    "human-accepted-additional-risk",
    "materially-different",
  ] satisfies readonly RecommendationDivergence[],
  currentState: CANONICAL_REVIEW.humanDecision,
  storageBoundary:
    "The ledger is local and single-machine. Local reviewer is a default label, not an identity system.",
} as const;

/* Provenance: README.md:460-480;
   app/api/github-app/webhook/route.ts:185-201;
   lib/github-app-store.ts:501-506;
   lib/canonical-review-run.ts:13-22,191-202;
   app/api/generate-report/route.ts:186-252. */
export const LIMITATIONS_CONTENT = {
  title: "Current limitations",
  items: [
    "Lintel can miss or misclassify engineering risk.",
    "Reports support engineering judgment. They do not prove a pull request is safe.",
    "It does not replace tests, continuous integration, static analysis, security review or human code review.",
    "Private repository import is not available through the public web flow.",
    "There is no end-user authentication, team account or hosted shared database.",
    "The GitHub App implementation is a prototype using local filesystem persistence.",
    "No GitHub Actions workflow or command line package is committed.",
    "Lintel does not execute test suites or perform full static analysis.",
    "No automated test and lint script is exposed through package.json.",
    "Model-assisted analysis depends on the configured provider and may send submitted content outside the local application.",
    "Analysis on the GitHub App path is deterministic only; model assistance is not applied there.",
    "A run fingerprint identifies a run. It is not a cryptographic integrity guarantee.",
    "Exact replay is not claimed for model-assisted output, and manually submitted diffs are not retained, so those runs cannot be re-derived from stored input.",
  ],
} as const;

/* Provenance: README.md:122-128;
   app/_public-r5-recalibrated/canonical-review.ts:26-43. */
export const TRUST_HANDOFF = {
  title: "Inspect the record yourself",
  recordTitle: "Fixed sample review",
  items: [
    { label: "Review", value: CANONICAL_REVIEW.pullRequestLabel },
    { label: "Repository", value: CANONICAL_REVIEW.repository },
    { label: "Recommendation", value: CANONICAL_REVIEW.recommendation },
    { label: "Human Decision", value: CANONICAL_REVIEW.humanDecision },
  ],
  boundary: "The sample is read-only. It makes no network request and records no Human Decision.",
  action: { label: "Open the sample review", href: "/workspace?source=fixture" },
  /* Phase 8F: the field-level pointer Phase 8E deliberately withheld while
     public/docs/security-model.md was stale (R5E2E_TRUST.md carried gate 1).
     data-boundaries is the strict field-level detail behind this route's own
     claims; Trust remains canonical for wording and scope. */
  secondaryAction: { label: "Read data boundaries", href: "/docs/data-boundaries" },
} as const;
