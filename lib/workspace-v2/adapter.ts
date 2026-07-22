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
  /* R1B.1 — an optional stable report identifier. The fixture adapter ignores
     it. The real adapter (single-report scope) uses it to select a specific
     stored Report by its stable id; when absent it selects the most recent
     stored Report. An unknown / unmatched id resolves to a truthful empty
     state, never to fixture content. */
  reportId?: string | null;
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

/* --- Source selection (R1B.1) ----------------------------------------- */

/* Which adapter feeds the route. `fixture` is the deterministic sample source
   from R1B.0; `real` is the read-only production Report adapter added in
   R1B.1. The default is deliberately `fixture` — the safe, side-effect-free
   source — so the real data path is opt-in via `?source=real` during this
   migration phase (r1a §16.6, parallel-route posture). */
export type WorkspaceSource = "fixture" | "real";

const SOURCES: readonly WorkspaceSource[] = ["fixture", "real"];

/* Normalise an untrusted `source` value. Any value other than an explicit,
   recognised `real` resolves to `fixture`; an invalid value never triggers a
   real-data read and never yields a fabricated state.

   Retained for the QA/compatibility route's historical `fixture`-defaulting
   contract. The canonical cut-over (R1B.7) uses `resolveWorkspaceSource`, which
   lets each route own its default without changing this function's meaning. */
export function parseSource(value: string | null | undefined): WorkspaceSource {
  if (value && (SOURCES as readonly string[]).includes(value)) {
    return value as WorkspaceSource;
  }
  return "fixture";
}

/* R1B.7 — route-owned source resolution for the shared Workspace entry.

   The cut-over gives one implementation two entry points with different safe
   defaults: canonical `/workspace` defaults to `real` stored history, while the
   QA/compatibility `/workspace-v2` route keeps the `fixture` demonstration
   default. This helper resolves an untrusted `source` value against a route's
   declared default so neither route hard-codes the other's convention:

     • an explicit, recognised `real` or `fixture` is always honoured verbatim;
     • an absent value resolves to the route's `defaultSource`;
     • any other (unsupported) value resolves to the route's `defaultSource` —
       the smallest truthful handling. On canonical `/workspace` that default is
       `real`, so an unsupported `source` never silently shows fixture data; it
       falls to the truthful real path (loading → ready / empty / unavailable).

   This function never fabricates a state and never forces a real read on a
   route whose default is `fixture`. */
export function resolveWorkspaceSource(
  value: string | null | undefined,
  defaultSource: WorkspaceSource,
): WorkspaceSource {
  if (value === "real" || value === "fixture") {
    return value;
  }
  return defaultSource;
}
