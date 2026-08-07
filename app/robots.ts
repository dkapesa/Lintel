import type { MetadataRoute } from "next";
import { canonicalPublicUrl } from "./_public/metadata";
import { draftPublicPaths } from "./_public/routes";

export default function robots(): MetadataRoute.Robots {
  const sitemap = canonicalPublicUrl("/sitemap.xml");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* public/docs/cli-github-action-blueprint.md is retained as a static
         file for the existing /github-action link but never passed the 8F
         curation gate, so it is explicitly kept out of the index. */
      disallow: [
        "/visual-lab/",
        "/lvos/",
        "/docs/cli-github-action-blueprint.md",
        ...draftPublicPaths(),
      ],
    },
    sitemap: sitemap?.toString(),
    host: canonicalPublicUrl("/")?.origin,
  };
}
