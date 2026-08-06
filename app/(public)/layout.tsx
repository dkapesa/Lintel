import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  PUBLIC_SITE_DESCRIPTION,
  PUBLIC_SITE_NAME,
  PUBLIC_SITE_TITLE,
  PUBLIC_TITLE_TEMPLATE,
  getPublicMetadataBase,
} from "../_public/metadata";
import { PublicShell } from "../_public/shell/PublicShell";

export const metadata: Metadata = {
  metadataBase: getPublicMetadataBase(),
  applicationName: PUBLIC_SITE_NAME,
  title: {
    default: PUBLIC_SITE_TITLE,
    template: PUBLIC_TITLE_TEMPLATE,
  },
  description: PUBLIC_SITE_DESCRIPTION,
  openGraph: {
    title: PUBLIC_SITE_TITLE,
    description: PUBLIC_SITE_DESCRIPTION,
    siteName: PUBLIC_SITE_NAME,
    type: "website",
  },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
