import type { Metadata } from "next";
import { getPublicRoute, type PublicRouteId } from "./routes";

export const PUBLIC_SITE_NAME = "Lintel";
export const PUBLIC_SITE_TITLE = "Lintel | Engineering verification for pull requests";
export const PUBLIC_TITLE_TEMPLATE = "%s | Lintel";
export const PUBLIC_SITE_DESCRIPTION =
  "Lintel connects software changes to findings, evidence, missing proof and requirements so engineers can make accountable merge decisions.";

export const INDEXABLE_PUBLIC_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
};

export const PRIVATE_PUBLIC_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

function configuredPublicOrigin(): URL | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return null;

  try {
    const origin = new URL(configured);
    const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);
    if (origin.protocol !== "https:" || localHostnames.has(origin.hostname)) return null;
    origin.pathname = "/";
    origin.search = "";
    origin.hash = "";
    return origin;
  } catch {
    return null;
  }
}

/* The repository has no accepted production origin. Canonicals, host and
   sitemap URLs therefore remain absent until NEXT_PUBLIC_SITE_URL contains a
   real HTTPS origin; localhost and malformed values are deliberately ignored. */
export function getPublicMetadataBase(): URL | undefined {
  return configuredPublicOrigin() ?? undefined;
}

export function canonicalPublicUrl(pathname: string): URL | undefined {
  const base = getPublicMetadataBase();
  return base ? new URL(pathname, base) : undefined;
}

export function publicRobots(indexable: boolean): Metadata["robots"] {
  return indexable ? INDEXABLE_PUBLIC_ROBOTS : PRIVATE_PUBLIC_ROBOTS;
}

export function buildPublicMetadata(
  routeId: PublicRouteId,
  options?: { title?: string; description?: string },
): Metadata {
  const route = getPublicRoute(routeId);
  const indexable = route.state === "live" && route.sitemapEligible;
  const canonical = indexable ? canonicalPublicUrl(route.pathname) : undefined;

  return {
    title: options?.title ?? route.label,
    description: options?.description ?? route.description,
    robots: publicRobots(indexable),
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: options?.title ?? route.label,
      description: options?.description ?? route.description,
      siteName: PUBLIC_SITE_NAME,
      type: "website",
      url: canonical,
    },
  };
}

export function buildPrivateLabMetadata(options: {
  title: string;
  description: string;
}): Metadata {
  return {
    title: options.title,
    description: options.description,
    robots: PRIVATE_PUBLIC_ROBOTS,
    openGraph: undefined,
    twitter: undefined,
  };
}
