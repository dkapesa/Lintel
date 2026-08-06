import type { Metadata } from "next";
import {
  PUBLIC_SITE_DESCRIPTION,
  PUBLIC_SITE_TITLE,
  buildPublicMetadata,
} from "../_public/metadata";
import { R5ReferenceReconstruction } from "../_public-r5-reference-reconstruction/R5ReferenceReconstruction";

export const metadata: Metadata = {
  ...buildPublicMetadata("home", {
    title: PUBLIC_SITE_TITLE,
    description: PUBLIC_SITE_DESCRIPTION,
  }),
  title: { absolute: PUBLIC_SITE_TITLE },
};

export default function HomePage() {
  return <R5ReferenceReconstruction heroPresentation="extended-neutral" shell="shared" />;
}
