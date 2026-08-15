# R6M 1512px reference comparison manifest

Every production capture in this directory was taken at exactly 1512 CSS px in the Codex in-app Chromium browser against the corrected production build. Reference images are rendered source pages from the two supplied Cursor PDFs. Class A compares transferable hierarchy and composition; Class B compares proportion and workstation behaviour without forcing literal C2 Inspector dimensions.

| Pair | Reference | Lintel production | Class | Reassessment |
| --- | --- | --- | --- | --- |
| P1 | `reference-c1-selected-column.png` (C1 page 2) | `production-p1-queue-workspace.png` | A | Supporting Queue plus quiet centred work column converges without copying Cursor chrome. |
| P2 | `reference-c1-sidebar-hidden.png` (C1 page 4) | `production-p2-focus.png` | A | Focus removes SupportingLeft and gives the useful column the complete workstation. |
| P3 | `reference-c1-detail.png` (C1 page 3) | `production-p3-selected-review.png` | A | Selected Review hierarchy remains legible inside a centred useful width. |
| P4 | `reference-c2-supporting-left.png` (C2 page 1) | `production-p4-supporting-left-task.png` | A | Supporting-left and task content retain the reference's clear primary/supporting order. |
| P5 | `reference-c2-three-region.png` (C2 page 2) | `production-p5-three-region-inspector.png` | B | Queue, Workspace and Inspector read as three distinct regions; Lintel keeps its accepted 420px preference rather than copying C2. |
| P6 | `reference-c2-takeover-config.png` (C2 page 3) | `production-p6-focus-contextual-inspector.png` | B | Focus transformation preserves contextual Inspector truthfully while removing only SupportingLeft. |
| P7 | `reference-c1-search.png` (C1 page 6) | `production-p7-commands.png` | A | Commands uses a lightweight searchable layer over retained context. |
| P8 | `reference-c2-takeover-config.png` (C2 page 3) | `production-p8-config-shell.png` | A | Configuration remains a destination-scale shell with the accepted 88px application rail. |

The correction pass improves Constrained composition: an expanded Queue no longer competes with an Inspector sheet, while the deliberate 88px manual rail remains coherent. Queue 280 now carries C1-like row metadata. Separator feedback is visible during drag but adds no gutter, grip, dots or filled surface.
