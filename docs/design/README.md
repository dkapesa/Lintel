# Lintel design documentation

This directory governs Lintel's visual implementation across the application, public website, design system, responsive behaviour and motion. It preserves one product identity: a high-end engineering verification workstation for senior engineers.

## Authority order

1. [LVOS v1.0](./LVOS_V1.md) — normative visual source of truth.
2. [LVOS implementation checklist](./LVOS_IMPLEMENTATION_CHECKLIST.md) — mandatory prompt and completion controls derived from LVOS.
3. [LVOS current-state audit](./LVOS_CURRENT_STATE_AUDIT.md) — repository-grounded findings derived from LVOS.
4. [LVOS implementation roadmap](./LVOS_IMPLEMENTATION_ROADMAP.md) — fixed migration sequence derived from LVOS and the audit.

Implementation convenience never overrides LVOS. Audits and roadmaps explain current evidence and delivery order; they do not amend the normative specification.

## Implementation artifacts

- [LVOS typography proof](./LVOS_TYPOGRAPHY_PROOF.md) — LVOS-1 role contract, internal proof and approval checklist.
- [LVOS typography adoption ledger](./LVOS_TYPOGRAPHY_ADOPTION_LEDGER.md) — pending ownership map for LVOS-2 through LVOS-7.
- [LVOS shell route map](./LVOS_SHELL_ROUTE_MAP.md) — LVOS-2 route ownership, contextual navigation, command-bar and responsive shell contract.
- [LVOS Workspace Command Centre](./LVOS_WORKSPACE_COMMAND_CENTRE.md) — LVOS-3 Archetype A queue, inspector, responsive and local-state implementation record; pending visual review.

- [LVOS administrative surfaces](./LVOS_ADMINISTRATIVE_SURFACES.md) — LVOS-4A Archetype D settings and review-policy implementation record; pending visual review.

## Use and versioning

- Every Claude or Codex visual implementation prompt must include the [implementation checklist](./LVOS_IMPLEMENTATION_CHECKLIST.md).
- `LVOS_V1.md` changes only through an explicit, recorded, versioned LVOS decision. Derived documents must identify the LVOS version they apply to and be refreshed when that version changes.
- Audit evidence may be updated as the repository changes. Roadmap status may be updated without changing milestone ownership or sequence unless an explicit governance decision approves the change.
- A new visual primitive or sixth page archetype requires explicit approval and a versioned LVOS amendment before implementation. A route may not introduce either locally.

