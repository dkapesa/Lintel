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
   snapshot from the adapter and never to fixture content.

   R1B.5 — this bootstrap is also the single place the writable `localStorage` is
   handed to the narrow `WorkspacePersistence` mutation service, and the only
   owner of the authoritative reprojection (`reload`). After a verified write the
   client asks this bootstrap to reload; it re-runs the SAME read-only adapter
   with the SAME `reportId`, so the authoritative adapter remains the one source
   of ready snapshot projection. A reload that throws leaves the last snapshot in
   place (the client surfaces a truthful "saved but not refreshed") rather than
   replacing real data with a fabricated or fixture state. */

import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceV2Client from "./WorkspaceV2Client";
import { createRealWorkspaceAdapter } from "../../lib/workspace-v2/real-adapter";
import {
  createWorkspacePersistence,
  type WorkspacePersistence,
} from "../../lib/workspace-v2/persistence";
import {
  createWorkspaceDecisionService,
  type WorkspaceDecisionService,
} from "../../lib/workspace-v2/decision-mutations";
import {
  type WorkspaceIdentity,
  type WorkspaceProvenance,
  type WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";

/* Outcome of an authoritative reprojection. `ok` is false only when the reload
   itself threw (storage access failure); in that case the previous snapshot is
   deliberately kept so the interface stays recoverable and truthful. */
export type ReloadOutcome = { ok: boolean };

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

  /* The one mutation service for real mode, built once with the writable
     storage. Undefined only in the exceptional case where `localStorage` is
     entirely unavailable; the client then renders read-only, not a fake control. */
  const persistence = useMemo<WorkspacePersistence | null>(() => {
    try {
      return createWorkspacePersistence(window.localStorage);
    } catch {
      return null;
    }
  }, []);

  /* R1B.6 — the one Human Decision mutation service for real mode, built once
     with the writable storage. Null only when `localStorage` is entirely
     unavailable; the client then renders decisions read-only, not a fake
     control. */
  const decisionService = useMemo<WorkspaceDecisionService | null>(() => {
    try {
      return createWorkspaceDecisionService(window.localStorage);
    } catch {
      return null;
    }
  }, []);

  /* Authoritative reprojection through the SAME read-only adapter and reportId.
     On success the fresh snapshot replaces the current one (the client preserves
     selection/focus across the prop change). On a hard failure the current
     snapshot is kept and `ok: false` lets the client tell the truth. */
  const reload = useCallback(async (): Promise<ReloadOutcome> => {
    try {
      const adapter = createRealWorkspaceAdapter(window.localStorage);
      const next = await adapter.loadSnapshot({ scenario: "default", reportId });
      setSnapshot(next);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }, [reportId]);

  return (
    <WorkspaceV2Client
      snapshot={snapshot}
      persistence={persistence}
      decisionService={decisionService}
      reload={reload}
    />
  );
}
