import type { MetadataRoute } from "next";
import { canonicalPublicUrl } from "./_public/metadata";
import { sitemapPublicPaths } from "./_public/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPublicPaths().flatMap((pathname) => {
    const url = canonicalPublicUrl(pathname);
    return url ? [{ url: url.toString() }] : [];
  });
}
