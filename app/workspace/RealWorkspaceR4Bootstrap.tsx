"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createRealWorkspaceAdapter } from "../../lib/workspace-v2/real-adapter";
import {
  createWorkspacePersistence,
  type WorkspacePersistence,
} from "../../lib/workspace-v2/persistence";
import {
  createWorkspaceDecisionService,
  type WorkspaceDecisionService,
} from "../../lib/workspace-v2/decision-mutations";
import type {
  WorkspaceIdentity,
  WorkspaceProvenance,
  WorkspaceSnapshot,
} from "../../lib/workspace-v2/view-model";
import WorkspaceR4Client from "./WorkspaceR4Client";

export type R4ReloadOutcome = { ok: boolean };

const BOOTSTRAP_IDENTITY: WorkspaceIdentity = {
  workspaceId: "local-report",
  repository: "—",
  label: "Local reports",
};

function liveProvenance(scenario: WorkspaceProvenance["scenario"]): WorkspaceProvenance {
  return { source: "live", isSample: false, label: "Local report", scenario };
}

/* The production R4 bootstrap is the only browser-storage boundary owned by
   /workspace. It uses the existing read adapter and existing mutation
   services, then re-reads through that adapter after every verified write. */
export default function RealWorkspaceR4Bootstrap({ reportId }: { reportId: string | null }) {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(() => ({
    status: "loading",
    identity: BOOTSTRAP_IDENTITY,
    provenance: liveProvenance("loading"),
  }));

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const adapter = createRealWorkspaceAdapter(window.localStorage);
        const next = await adapter.loadSnapshot({ scenario: "default", reportId });
        if (active) setSnapshot(next);
      } catch (error) {
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

  const persistence = useMemo<WorkspacePersistence | null>(() => {
    try {
      return createWorkspacePersistence(window.localStorage);
    } catch {
      return null;
    }
  }, []);

  const decisionService = useMemo<WorkspaceDecisionService | null>(() => {
    try {
      return createWorkspaceDecisionService(window.localStorage);
    } catch {
      return null;
    }
  }, []);

  const reload = useCallback(async (): Promise<R4ReloadOutcome> => {
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
    <WorkspaceR4Client
      snapshot={snapshot}
      persistence={persistence}
      decisionService={decisionService}
      reload={reload}
    />
  );
}
