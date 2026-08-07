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
    state: "draft",
    placement: "supporting",
    sitemapEligible: false,
    description: "Curated public resources.",
  },
  {
    id: "documentation",
    label: "Documentation",
    pathname: "/docs",
    state: "draft",
    placement: "supporting",
    sitemapEligible: false,
    description: "Curated public documentation.",
  },
] as const;

export type CuratedPublicDocument = {
  slug: string;
  title: string;
  description: string;
  audience: string;
  owner: string;
  productTruthReview: string;
  publicationStatus: "published" | "draft" | "internal";
  source: string;
};

/* Phase 8F owns document selection. An empty explicit list is intentional:
   filesystem presence is not publication authority. */
export const CURATED_PUBLIC_DOCUMENTS: readonly CuratedPublicDocument[] = [];

export const PUBLIC_SHELL_LAB_PATH = "/visual-lab/public-r5-shared-shell";

export const primaryPublicRoutes = PUBLIC_ROUTE_REGISTRY.filter(
  (route) => route.placement === "primary",
);

export const livePrimaryPublicRoutes = primaryPublicRoutes.filter(
  (route) => route.state === "live",
);

export const footerPublicRouteGroups = [
  {
    label: "Product",
    routeIds: ["product", "how-it-works"] as const,
  },
  {
    label: "Trust and resources",
    routeIds: ["trust", "resources", "documentation"] as const,
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
  const routes = PUBLIC_ROUTE_REGISTRY.filter(
    (route) => route.state === "live" && route.sitemapEligible,
  ).map((route) => route.pathname);
  const documents = CURATED_PUBLIC_DOCUMENTS.filter(
    (document) => document.publicationStatus === "published",
  ).map((document) => `/docs/${document.slug}`);

  return [...routes, ...documents];
}

export function draftPublicPaths(): string[] {
  return PUBLIC_ROUTE_REGISTRY.filter((route) => route.state === "draft").map(
    (route) => (route.id === "documentation" ? "/docs/" : route.pathname),
  );
}
