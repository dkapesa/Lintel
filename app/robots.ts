import type { MetadataRoute } from "next";
import { canonicalPublicUrl } from "./_public/metadata";
import { draftPublicPaths } from "./_public/routes";

export default function robots(): MetadataRoute.Robots {
  const sitemap = canonicalPublicUrl("/sitemap.xml");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/visual-lab/", "/lvos/", ...draftPublicPaths()],
    },
    sitemap: sitemap?.toString(),
    host: canonicalPublicUrl("/")?.origin,
  };
}
