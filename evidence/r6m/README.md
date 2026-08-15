# R6M native evidence manifest

Captured in the Codex in-app Chromium browser against the production Next.js server at `http://localhost:3000`.

## Bounded correction evidence

| Evidence | Native measured result |
| --- | --- |
| `1099-inspector-sheet.png` | Queue 0, full 1099 Workspace grid, Inspector sheet 420 and Inspector track 0 |
| `1000-inspector-sheet.png` | Queue 0, full 1000 Workspace grid, Inspector sheet 420 and Inspector track 0 |
| `900-inspector-sheet-queue-clamp.png` | Queue 0, full 900 Workspace grid, Inspector sheet 420 and Inspector track 0 |
| `constrained-sheet-correction.json` | The three corrected sheet states plus native 900 manual-collapse proof: 88 rail, 812 Workspace, sheet track 0 |
| `queue-280-metadata-visible.png` | Queue 280; measured container inline size 247.2; row metadata visible |
| `queue-240-metadata-hidden.png` | Queue 240; measured container inline size 207.2; row metadata suppressed |
| `queue-metadata-measurements.json` | Native values supporting the 220px container threshold |
| `separator-active-drag.png` | Truthful native pointer-drag frame with restrained active boundary |
| `separator-active-state.json` | Active pseudo-element 2px; grid columns still sum to the 1800px workstation; zero separator track |
| `1300-queue-dynamic-aria.png` | Focused Queue separator in the constrained 240-only state |
| `dynamic-resize-bounds.json` | 1300/Inspector 420 Queue min=max=now=240; roomy maximum returns to 400 |
| `focus-inspector-escape.json` | Actual Escape closes Inspector, first and second Escape both retain Focus |
| `pressure-1300-correction-replay.json` | Fresh native 420 to 421 to 420 replay after the shared-bound correction |
| `1512-comparison/README.md` | Indexed P1-P8 C1/C2 reference and exact-1512 production comparison set |

The native sheet captures use the deliberately persisted Inspector preference of 420px. The deterministic default-preference checks separately assert the accepted 384px default at 1099, 1000 and 900.

## Retained accepted geometry and interaction evidence

The prior accepted artifacts remain in this directory for default, collapsed, Focus, pane, Narrow, persistence, pointer, keyboard and exact pressure-boundary coverage. They were not regenerated because their truth did not change. In particular:

- `1600-default.png`, `1600-inspector.png`, `1440-default.png`, `1440-inspector.png`, `1440-collapsed.png`, `1440-collapsed-inspector.png`, `1440-focus.png`, `1440-focus-inspector.png`;
- `1180-inspector-queue-yielded.png`, `1180-inspector-close-queue-return.png`, `899-narrow-sequential-inspector.png`, `390-narrow-inspector.png`, `390-narrow-workspace.png`;
- `900-queue-min.png`, `1440-queue-min-reload.png`, `1440-queue-max-keyboard.png`, `1440-queue-max-reload.png`, `1300-inspector-min.png`, `1300-inspector-max.png`;
- `queue-pointer-drag-900-min.json`, `keyboard-separator-trace.json`, `inspector-keyboard-trace.json`, `viewport-band-crossing.json`, `narrow-collapse-preservation.json`, and `focus-hidden-commands-return.json`.
