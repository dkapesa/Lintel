"use client";

/* R1B.1 — Production Workspace V2 · real-data client bootstrap.

   The current production Report source is browser-only, so the real snapshot
   cannot be built in the server route. This narrow client boundary is the only
   place browser storage is touched for real mode: it reads `window.localStorage`
   once, runs the read-only real adapter, and hands the finished, serialisable
   snapshot to `WorkspaceV2Client`. It owns only the async data-loading state
   (loading → ready / empty / unavailable); once the snapshot is ready,
   `WorkspaceV2Client` remains the single owner of interaction state. No writes,
   no persistence, no mutation.

   Presentational components never see `localStorage` — they only ever receive a
   snapshot. A failed real load resolves to a truthful empty / unavailable
   snapshot from the adapter and never to fixture content. */

import { useEffect, useState } from "react";
import WorkspaceV2Client from "./WorkspaceV2Client";
import { createRealWorkspaceAdapter } from "../../lib/workspace-v2/real-adapter";
import {
  type WorkspaceIdentity,
  type WorkspaceProvenance,
  type WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";

const BOOTSTRAP_IDENTITY: WorkspaceIdentity = {
  workspaceId: "local-report",
  repository: "—",
  label: "Local reports",
};

function liveProvenance(scenario: WorkspaceProvenance["scenario"]): WorkspaceProvenance {
  return { source: "live", isSample: false, label: "Local report", scenario };
}

export default function RealWorkspaceBootstrap({ reportId }: { reportId: string | null }) {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(() => ({
    status: "loading",
    identity: BOOTSTRAP_IDENTITY,
    provenance: liveProvenance("loading"),
  }));

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const storage = window.localStorage;
        const adapter = createRealWorkspaceAdapter(storage);
        const next = await adapter.loadSnapshot({ scenario: "default", reportId });
        if (active) setSnapshot(next);
      } catch (error) {
        /* Storage access itself can throw in restricted browser modes. This is
           an unavailable projection, not an empty queue, and never fixtures. */
        if (!active) return;
        setSnapshot({
          status: "unavailable",
          identity: BOOTSTRAP_IDENTITY,
          provenance: liveProvenance("unavailable"),
          reason:
            error instanceof Error
              ? `Local report storage could not be read: ${error.message}`
              : "Local report storage could not be read.",
        });
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [reportId]);

  return <WorkspaceV2Client snapshot={snapshot} />;
}
