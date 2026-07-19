/* R1B.0 — Production Workspace V2 · adapter boundary.

   This is the seam R1B.1 implements against. A `WorkspaceAdapter` turns a
   request into a serialisable `WorkspaceSnapshot`. R1B.0 ships exactly one
   implementation — the fixture adapter — but the route depends only on this
   contract, so swapping in a real adapter that reads Report, evidence,
   merge-contract, readiness and ledger data is an implementation change, not
   a structural rewrite.

   The method is async so a future real adapter can perform I/O without
   changing the route's call shape; the fixture adapter resolves synchronously.

   The contract deliberately says nothing about data origin. Provenance
   travels inside the snapshot (`WorkspaceProvenance.source`), so the route and
   every plane treat fixture and future real snapshots identically. */

import { type WorkspaceScenario, type WorkspaceSnapshot } from "./view-model";

export type WorkspaceSnapshotRequest = {
  /* Which scaffold shell state to project. Real adapters will extend the
     request (repository / workspace scope, viewer identity) without narrowing
     this contract. Unknown values are normalised by `parseScenario`. */
  scenario: WorkspaceScenario;
};

export interface WorkspaceAdapter {
  loadSnapshot(request: WorkspaceSnapshotRequest): Promise<WorkspaceSnapshot>;
}

const SCENARIOS: readonly WorkspaceScenario[] = [
  "default",
  "empty",
  "unavailable",
  "loading",
];

/* Normalise an untrusted scenario value (e.g. a raw query parameter). Invalid
   values fall back safely to the default workstation rather than a fabricated
   or unavailable state. */
export function parseScenario(value: string | null | undefined): WorkspaceScenario {
  if (value && (SCENARIOS as readonly string[]).includes(value)) {
    return value as WorkspaceScenario;
  }
  return "default";
}
