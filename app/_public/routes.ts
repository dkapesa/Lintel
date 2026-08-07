export type PublicRouteId =
  | "home"
  | "product"
  | "how-it-works"
  | "trust"
  | "resources"
  | "documentation";

export type PublicRouteState = "live" | "draft";
export type PublicRoutePlacement = "primary" | "supporting";

export type PublicRouteRecord = {
  id: PublicRouteId;
  label: string;
  pathname: string;
  state: PublicRouteState;
  placement: PublicRoutePlacement;
  sitemapEligible: boolean;
  description: string;
};

/* Phase 8B owns the route registry even though it activates only routes that
   have completed their own implementation and human-acceptance gate. A route
   changes from draft to live here once; header, footer, robots and sitemap
   then consume the same decision. */
export const PUBLIC_ROUTE_REGISTRY: readonly PublicRouteRecord[] = [
  {
    id: "home",
    label: "Home",
    pathname: "/",
    state: "live",
    placement: "primary",
    sitemapEligible: true,
    description: "Engineering verification for pull requests.",
  },
  {
    id: "product",
    label: "Product",
    pathname: "/product",
    state: "live",
    placement: "primary",
    sitemapEligible: true,
    description:
      "What Lintel presents across a complete verification record: findings with provenance, missing proof, merge requirements, readiness movement and the boundary between a recommendation and a Human Decision.",
  },
  {
    id: "how-it-works",
    label: "How it works",
    pathname: "/how-it-works",
    state: "live",
    placement: "primary",
    sitemapEligible: true,
    description:
      "How a change becomes an accountable merge decision: deterministic analysis, findings connected to evidence, missing proof, requirements, readiness across commits, and the engineer's decision.",
  },
  {
    id: "trust",
    label: "Trust",
    pathname: "/trust",
    state: "live",
    placement: "primary",
    sitemapEligible: true,
    description: "Verification boundaries, models, provenance and availability.",
  },
  {
    id: "resources",
    label: "Resources",
    pathname: "/resources",
    state: "live",
    placement: "supporting",
    sitemapEligible: true,
    description: "Curated public resources.",
  },
  {
    id: "documentation",
    label: "Documentation",
    /* This id owns the /docs namespace, not an index page: there is
       deliberately no /docs route (R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md §5.1.7,
       the Phase 8F human-approved footer deviation). "live" + sitemapEligible
       here means the namespace's curated documents are eligible to publish,
       consumed by sitemapPublicPaths' document branch below — it does not
       mean this record's own pathname belongs in the sitemap, and
       sitemapPublicPaths excludes the "documentation" id from its generic
       per-route pathname list for exactly that reason. */
    pathname: "/docs",
    state: "live",
    placement: "supporting",
    sitemapEligible: true,
    description: "Curated public documentation.",
  },
] as const;

export type DocumentAdaptation = "verbatim" | "adaptation" | "authored";

export type CuratedPublicDocument = {
  slug: string;
  title: string;
  description: string;
  kind: string;
  audience: string;
  purpose: string;
  owner: string;
  productTruthReview: string;
  securityReview: string;
  publicationStatus: "published" | "draft" | "internal";
  source: string;
  adaptation: DocumentAdaptation;
  internalSources: readonly string[];
  staleClaimRisks: string;
  updated: string;
  order: number;
};

/* Phase 8F owns document selection. Every entry below passed the six-part
   curation gate (R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md §5.1): content decision,
   audience, owner, product-truth review, publication status and source. This
   list is the sole publication authority for /docs/[slug] — filesystem
   presence in docs/ or public/docs/ grants no document a route. */
export const CURATED_PUBLIC_DOCUMENTS: readonly CuratedPublicDocument[] = [
  {
    slug: "run-lintel-locally",
    title: "Run Lintel locally",
    description:
      "Install, run the fixed sample, and what each optional environment value enables.",
    kind: "Setup",
    audience: "An engineer who wants to run Lintel from the repository.",
    purpose:
      "Install, run, open the fixed sample, and understand what each optional environment value turns on.",
    owner: "Phase 8F, carried by the public-system owner.",
    productTruthReview:
      "Phase 8F, against README capability tables, package.json scripts and .env.example.",
    securityReview:
      "Phase 8F. States that .env.local, private keys and tokens are never committed, and never prints or implies a real credential.",
    publicationStatus: "published",
    source: "README.md (Run locally, Optional environment configuration, Explore the product)",
    adaptation: "adaptation",
    internalSources: ["README.md", "package.json", ".env.example"],
    staleClaimRisks:
      "No Node version is declared and none is invented here; no test/lint script is claimed; the README's prior 'walkthrough being prepared' placeholder is not repeated.",
    updated: "2026-08-07",
    order: 1,
  },
  {
    slug: "data-boundaries",
    title: "Data boundaries",
    description:
      "What is sent, what is stored, what is deliberately not kept, and the exact limits.",
    kind: "Reference",
    audience:
      "An engineer or engineering lead who has read Trust and wants the field-level detail.",
    purpose:
      "Record concretely what is sent, what is stored where, what is deliberately not persisted, and the exact bounds.",
    owner: "Phase 8F, carried by the public-system owner.",
    productTruthReview:
      "Phase 8F, sentence-by-sentence against lib/** and app/api/**, and checked for agreement with /trust.",
    securityReview:
      "Phase 8F. No certification, hosted-infrastructure, encryption-at-rest, access-control, retention-policy, deletion-guarantee, audit-log, SLA, uptime or provider-non-retention claim.",
    publicationStatus: "published",
    source: "Authored from verified implementation. Supersedes the retired public/docs/security-model.md.",
    adaptation: "authored",
    internalSources: [
      "lib/github-app-store.ts",
      "lib/github-app-auth.ts",
      "lib/github-app-webhook.ts",
      "lib/change-passport.ts",
      "lib/canonical-review-run.ts",
      "lib/human-decision-ledger.ts",
      "lib/report-history.ts",
      "app/api/generate-report/route.ts",
      "app/api/github-app/webhook/route.ts",
      "docs/github-app-local-setup.md",
    ],
    staleClaimRisks:
      "The retired file's 'no GitHub App' and 'no CI integration' claims must not survive in any form; every numeric bound was re-read from code, not copied from prose; store: false is stated as what Lintel sends, never as a provider guarantee.",
    updated: "2026-08-07",
    order: 2,
  },
  {
    slug: "github-app-prototype",
    title: "GitHub App prototype",
    description:
      "What happens on a verified delivery, the permissions requested, and how to configure it.",
    kind: "Reference",
    audience: "An engineer evaluating or configuring the prototype locally.",
    purpose:
      "Describe the verified-delivery path end to end, the permissions requested, and local configuration.",
    owner: "Phase 8F, carried by the public-system owner.",
    productTruthReview:
      "Phase 8F, against lib/github-app-*.ts and app/api/github-app/**, and checked for agreement with /trust#github-app.",
    securityReview:
      "Phase 8F. States analysis on this path is deterministic only; does not imply hosted operation, production readiness or a queue.",
    publicationStatus: "published",
    source: "docs/github-app-local-setup.md, adaptation re-verified against lib/github-app-*.ts",
    adaptation: "adaptation",
    internalSources: [
      "docs/github-app-local-setup.md",
      "lib/github-app-auth.ts",
      "lib/github-app-webhook.ts",
      "lib/github-app-store.ts",
      "lib/github-app-comments.ts",
    ],
    staleClaimRisks:
      "The setup document predates later work; every permission, event, header, marker and bound was re-verified in code. No persistence claim is restated here; each links to data-boundaries instead.",
    updated: "2026-08-07",
    order: 3,
  },
] as const;

/* Legacy public/docs/*.md paths that seven logged-in routes still link to.
   Each resolves with a permanent redirect to its curated replacement so no
   existing link breaks when the stale static file is retired. */
export const LEGACY_DOCUMENT_ALIASES: Record<string, string> = {
  "security-model.md": "data-boundaries",
};

export const PUBLIC_SHELL_LAB_PATH = "/visual-lab/public-r5-shared-shell";

export const primaryPublicRoutes = PUBLIC_ROUTE_REGISTRY.filter(
  (route) => route.placement === "primary",
);

export const livePrimaryPublicRoutes = primaryPublicRoutes.filter(
  (route) => route.state === "live",
);

/* Human-approved Phase 8F deviation from the R5E2A_PUBLIC_SYSTEM_IMPLEMENTATION_SEQUENCE.md
   §7 footer-promotion line: no /docs index route is built, so "documentation"
   carries no footer surface of its own. It remains the registry owner of the
   /docs namespace, document metadata/indexability and prefix behaviour
   (see isPublicRouteActive, sitemapPublicPaths, draftPublicPaths below); every
   curated document is reached from /resources instead. */
export const footerPublicRouteGroups = [
  {
    label: "Product",
    routeIds: ["product", "how-it-works"] as const,
  },
  {
    label: "Trust and resources",
    routeIds: ["trust", "resources"] as const,
  },
] as const;

export function getPublicRoute(id: PublicRouteId): PublicRouteRecord {
  const route = PUBLIC_ROUTE_REGISTRY.find((candidate) => candidate.id === id);
  if (!route) throw new Error(`Unknown public route: ${id}`);
  return route;
}

export function isPublicRouteActive(pathname: string, route: PublicRouteRecord): boolean {
  if (route.id === "home") return pathname === "/";
  if (route.id === "documentation") {
    return pathname === route.pathname || pathname.startsWith(`${route.pathname}/`);
  }
  return pathname === route.pathname;
}

export function sitemapPublicPaths(): string[] {
  /* "documentation" is excluded here even when live and sitemap-eligible: it
     is a namespace id, not an index page — there is deliberately no /docs
     route (R5E2A_PUBLIC_ROUTE_ARCHITECTURE.md §5.1.7). Including its bare
     pathname would emit a dead /docs sitemap entry with no corresponding
     page. Its curated documents are added separately below. */
  const routes = PUBLIC_ROUTE_REGISTRY.filter(
    (route) => route.state === "live" && route.sitemapEligible && route.id !== "documentation",
  ).map((route) => route.pathname);

  /* A published document only enters the sitemap once the documentation
     route itself is live and sitemap-eligible — publicationStatus alone is
     not enough, or a document would leak into the sitemap while /docs/[slug]
     is still draft and noindex. */
  const documentationRoute = getPublicRoute("documentation");
  const documents = documentationRoute.state === "live" && documentationRoute.sitemapEligible
    ? CURATED_PUBLIC_DOCUMENTS.filter(
        (document) => document.publicationStatus === "published",
      ).map((document) => `/docs/${document.slug}`)
    : [];

  return [...routes, ...documents];
}

export function draftPublicPaths(): string[] {
  return PUBLIC_ROUTE_REGISTRY.filter((route) => route.state === "draft").map(
    (route) => (route.id === "documentation" ? "/docs/" : route.pathname),
  );
}
