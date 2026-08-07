import type { ReactNode } from "react";
import { DATA_BOUNDARIES_SECTIONS, DataBoundariesBody } from "./data-boundaries";
import { GITHUB_APP_PROTOTYPE_SECTIONS, GitHubAppPrototypeBody } from "./github-app-prototype";
import { RUN_LINTEL_LOCALLY_SECTIONS, RunLintelLocallyBody } from "./run-lintel-locally";

export type DocumentSectionMeta = { id: string; heading: string };

export type DocumentBodyModule = {
  sections: readonly DocumentSectionMeta[];
  Body: () => ReactNode;
};

/* Publication is a registry entry, never a file: this is a static map from
   curated slug to a typed content module. No fs, readdir, glob or dynamic
   import by path — adding a document means adding a key here and to
   CURATED_PUBLIC_DOCUMENTS in app/_public/routes.ts. */
export const DOCUMENT_BODIES: Record<string, DocumentBodyModule> = {
  "run-lintel-locally": { sections: RUN_LINTEL_LOCALLY_SECTIONS, Body: RunLintelLocallyBody },
  "data-boundaries": { sections: DATA_BOUNDARIES_SECTIONS, Body: DataBoundariesBody },
  "github-app-prototype": { sections: GITHUB_APP_PROTOTYPE_SECTIONS, Body: GitHubAppPrototypeBody },
};
