# R5E.1E.5B — Candidate Asset Creation, Gate 1

Date: 5 August 2026

Branch: `r5e1e5b-candidate-asset-creation`

Status: **Accepted and closed after Cowork and human Gate 1 visual review; ready for commit after repository validation.**

## 1. Purpose

Gate 1 creates and documents wide candidate seeds for the Hero's outer presentation surface before any family is selected, derived, encoded for production, or implemented. The work tests whether restrained deterministic imagery materially improves the accepted product presentation beyond both the accepted neutral plate and an extended neutral band.

The authoritative untracked evidence is `R5E1E5B_CANDIDATE_ASSET_PACKAGE/`, with `SESSION_CHECKPOINT_2.md` as the resume record and `measurements/summary.json` as the source for quoted figures.

## 2. Phase 7.1A authority

`R5E1E5A_SURFACE_HIERARCHY_VISUAL_DIRECTION_CONTRACT.md` remains the governing accepted contract. Its §32 addendum approves Amendment A1 for bounded decorative outer surfaces, leaves Amendment A2 unapproved, makes Candidate C eligible, permits Candidate B only as a private diagnostic, adds the extended-neutral control, and leaves proposed presentation-band dimensions as laboratory starting values.

Gate 1 did not edit that contract or any earlier accepted milestone. The three inconsistencies encountered while applying it are disclosed rather than silently reconciled.

## 3. Controlled deterministic SVG strategy

Claude Design was not used. Phase 7.1A §25 permits Claude Design, image generation, **or another controlled procedural toolchain**. Deterministic SVG was chosen because these near-white abstract surfaces are defined by exact LCh envelopes, fixed compositional loci, measurable broad transitions, repeatable seeds, and a need to preserve rejected parameter states. An image model was unnecessary and would have weakened byte-level reproducibility and provenance.

The Node toolchain creates 3000 × 1600 resolution-independent SVGs. Every tone is an LCh triple converted arithmetically to sRGB; gradient ramps are deterministic; `feTurbulence` seeds are fixed in source; there is no unrecorded randomness. `build-masters.mjs` reproduces retained and nominal-amplitude masters from explicit profiles.

No remote asset, embedded raster, stock image, copied reference artwork, named-artist style, person, location, text glyph, logo, code diagram, blueprint, AI-network motif, or copyrighted third-party source is present.

## 4. Six wide candidates

| Candidate | Family | Concept and construction | Status |
|---|---|---|---|
| B1 — Layered Slate Depth | B | Broad horizontal cool-slate layers, upper-middle lift, slow lateral washes | **EXPERIMENTAL — PRIVATE — NON-SHIPPABLE** |
| B2 — Diffuse Cool Threshold | B | Oblique threshold and broad rotated cool fields; no procedural grain | **EXPERIMENTAL — PRIVATE — NON-SHIPPABLE** |
| C1 — Structural Span | C | Two warm planes divided by a 2.6° span feathered over ~320 master px | Eligible under Amendment A1; not selected |
| C2 — Load-Bearing Planes | C | Three warm planes with boundaries at columns 900 and 2040, tilted 8°/−6° | Eligible under Amendment A1; not selected |
| C3 — Mineral Threshold | C | Warm diagonal daylight and material at three fixed spatial scales; no planes | Eligible under Amendment A1; not selected |
| C4 — Balanced Support Field | C | Warm overlapping regions, calm centre, no linear transition | Eligible under Amendment A1; not selected |

All six masters are wide seeds only. No tall Hero master or Readiness companion exists.

## 5. Candidate B restriction and Candidate C eligibility

Amendment A2 remains unapproved. B1/B2 are diagnostic evidence only and cannot be accepted, propagated to the reconstruction, production-facing, committed to `public/`, or described as shippable. If a B diagnostic is preferred after evaluation, a separate explicit A2 approval is required before any adoption or derivation. Creating B did not change the accepted image lock.

C1–C4 are eligible under approved Amendment A1. Eligibility is not selection. No Candidate C seed has been implemented, propagated, or committed as a production asset.

## 6. Hero and laboratory geometry

The accepted product frame and laboratory plate geometry are:

| Tier | Product frame CSS px | Laboratory plate CSS px | Band top / sides / bottom | Wide-source cover result |
|---|---:|---:|---:|---|
| Desktop 1440 × 900 | 1181 × 633 | 1293 × 785 | 88 / 56 / 64 | Full height visible; master width visible 87.85% |
| Tablet 768 × 1024 | 681 × 818.5 | 745 × 922.5 | 64 / 32 / 40 | Full height visible; master width visible 43.07% |
| Mobile 390 × 844 | 323 × 1632.5 | 363 × 1728.5 | 56 / 20 / 40 | Full height visible; master width visible 11.2% |

The product frame is never resized or restyled by the evidence composition. It remains an opaque crop from the accepted route with its content, 1 px `#dededc` hairline, 14 px radius, and canonical PR #482 truth intact.

## 7. Mobile-capture correction

Headless Chrome ignored the requested 390 px layout width because its window has an approximately 500 CSS px minimum; the first image was a clipped wider layout. The unmodified route was then loaded in a local 390 CSS px iframe harness. After trimming harness padding, the frame locator extracted a 646 × 3265 DPR 2 crop, equal to 323 × 1632.5 CSS px, with 13 px accepted inset and correct top/bottom radius and border.

The corrected records are:

- `previews/frame/route-capture-390.png`;
- `previews/frame/hero-product-frame-390.png`;
- `previews/frame/hero-product-frame-390.json`;
- `scripts/render/mobile-390-harness.html`.

No route code or CSS was changed to obtain the genuine 390 px evidence.

## 8. Generation scripts and import safety

The package contains fifteen procedural/validation scripts covering colour conversion, master generation, shared geometry, Chrome capture, PNG processing, frame extraction, preview generation, true-scale and production-scale measurement, board generation, summary creation, provenance generation, import-safety proof, and package verification.

An import-side-effect defect was found during measurement work: importing geometry from the first `build-previews.mjs` implementation executed its 44-render loop. Shared constants were extracted into data-only `geometry.mjs`; writes in preview and board builders were moved under guarded `main()` functions. `check-import-safety.mjs` then reported six shared modules and six entry points with no write side effect on import. Five remaining command-line scripts are imported by nothing.

## 9. True-scale and production-scale evidence

Six masters were rendered in Chrome at their true 3000 × 1600 size. Each render has a SHA-256 recorded beside the SVG source hash in its YAML provenance record.

Production measurements use the actual `background-size: cover` plate at desktop 1293 × 785, tablet 745 × 922.5, and mobile 363 × 1728.5 configurations, not the master. The candidate summary is:

| Candidate | Mean/min/max L\* | Mean/max C\* | Hue p5–p95 | Desktop annulus ΔL\* | Local variation D / T / M | Worst hairline |
|---|---|---|---:|---:|---:|---:|
| B1 | 95.17 / 94.31 / 95.85 | 2.050 / 2.495 | 211.1–215.7° | 1.54 | 1.124 / 1.857 / 1.137% | 1.1675:1 |
| B2 | 95.20 / 94.41 / 95.60 | 1.989 / 2.321 | 213.1–235.9° | 1.19 | 1.796 / 1.796 / 1.605% | 1.1704:1 |
| C1 | 95.51 / 93.95 / 96.91 | 2.660 / 3.996 | 68.8–90.7° | 2.71 | 2.307 / 2.503 / 3.218% | 1.1664:1 |
| C2 | 95.67 / 94.45 / 96.41 | 2.562 / 3.330 | 63.5–80.7° | 1.96 | 1.647 / 1.585 / 0.936% | 1.1717:1 |
| C3 | 95.71 / 94.62 / 96.31 | 2.516 / 3.248 | 82.4–87.2° | 1.69 | 1.783 / 1.790 / 1.790% | 1.1769:1 |
| C4 | 95.76 / 94.97 / 96.41 | 2.497 / 3.374 | 67.0–80.7° | 1.44 | 1.655 / 1.918 / 1.653% | 1.1882:1 |

All six meet the measured global palette, luminance, chroma, hue, white-contrast, and written 1.15:1 frame-hairline requirements. Those numerical results do not select a candidate.

## 10. Annulus and responsive crop method

Every desktop annulus uses identical measured Hero geometry. The candidate is rendered as a cover background on the outer plate; the accepted product-frame crop is composited as an opaque PNG, without transparency, filtering, blending, or content alteration. The accepted 26 px neutral control and an extended-neutral no-image control isolate the effect of additional space from the effect of imagery.

Tablet and mobile crops use their measured accepted product frames and the Phase 7.1A laboratory bands. The wide master is deliberately stress-tested through `cover`; at mobile only 11.2% of its width is visible. All six crops remain decorative, retain frame visibility, carry no crop-dependent meaning, and avoid visible noise, stripe, repeated tile, hard edge, or heavy corner. Structural and material distinction degrades unequally, which is a seed-review input rather than an automatic ranking.

No tall source was generated. Tall derivation occurs only after an authorised seed decision and only if responsive evidence justifies it.

## 11. Colour, tone, texture, and quantisation

B1/B2 remain in the permitted cool-slate family; C1–C4 remain in the required warm-neutral family. All means remain below C\* 3, maxima below C\* 5, and contrast against white between 1.04:1 and 1.60:1. Product semantic colours remain on the opaque product surface and are not reused by the decorative field.

The flat `#f6f5f2` control measures 0.000% local variation. One 8-bit code step near L\* 95 contributes approximately 0.924%, so the written 1.5% ceiling spans only approximately 1.62 code steps. B2 contains no procedural grain but measures 1.796% desktop/tablet and 1.605% mobile. C1 mobile measures 3.218%, yet genuine pixels remain visually flat with no noise, stripe, repetition, or hard edge.

The metric therefore includes smooth-gradient dither and quantisation and cannot be used alone as a design-texture pass/fail rule. Visible flat-tone degradation is preserved as the contract's qualitative mobile test, and final AVIF/WebP compression remains later work.

## 12. Three disclosed contract conflicts

### 12.1 Frame-hairline arithmetic

`#dededc` against `#fafaf9` measures 1.2899:1, not approximately 1.09:1. Solving the written 1.15:1 requirement yields a surface floor of L\* 93.72. The note that “darker improves this” is inverted over the retained pale range because moving toward the hairline reduces separation. Retained masters conservatively obey the written minimum, at a real amplitude cost; Phase 7.1A was not amended.

### 12.2 Structure clearance

At desktop, 120 CSS px equals approximately 245 master px. Literal clearance around every frame edge covers the complete visible annulus while another clause requires structure to be legible there. The generator records an edge-locus interpretation: hard or parallel plane boundaries are kept outside the relevant exclusion band; broad feathered or oblique luminance transitions are distinguished from a frame-like edge. No visible duplicate-frame defect is present, but C1/C2 remain direct review cases.

### 12.3 Texture threshold

The no-grain B2 and visually flat C1 mobile controls show that 1.5% is not a standalone texture detector at near-white 8-bit values. Measurements and visible judgment are both retained; the accepted threshold was not rewritten.

Complete disclosure is in the package `documents/CONTRACT_RISK_LOG.md`.

## 13. Provenance and rejected iterations

Each of the six YAML records contains identity, status, conceptual claim, compositional grammar, master/render hashes, dimensions, toolchain, content declarations, licensing/origin, deterministic method, two-entry revision history, palette, true-scale and production measurements, candidate-specific risks, and eligibility. B records repeat the non-shippable notice in full.

The six iteration-one nominal-amplitude SVGs are preserved under `rejected/iteration-01-nominal-amplitude/`. They are readable and visually valid but violate the conservative written hairline floor. Iteration two changes only the tonal profile and grain amplitude scale; geometry, hue, layer stack, and seeds are unchanged. `REJECTION_RECORD.md` preserves the arithmetic caveat and confirms nothing was deleted or manufactured merely to fill a rejection folder.

## 14. Four comparison boards

- `01_equal_scale_all_candidates.png` — six masters at identical scale, 1960 × 2411.
- `02_annulus_all_candidates.png` — accepted neutral, extended neutral, then all six identical-geometry annuli, 1960 × 3386.
- `03_candidate_b_comparison.png` — B1/B2 full and annulus comparison with explicit non-shippable banner, 1960 × 1890.
- `04_candidate_c_comparison.png` — C1–C4 full and annulus comparison, 1960 × 3261.

All were trimmed to content with a 40 px margin and inspected at full resolution. No board declares or implies a winner.

## 15. 95-of-95 verification

The package verifier checked required existence, non-zero size, PNG decodability, and expected dimensions. Its completed result was:

> 95 outputs verified. No missing, zero-length, corrupt or mis-sized output.

This documentation pass relied on that authoritative completed verification and did not rerun visual capture, rendering, preview, board, or measurement generation.

## 16. Gate 1 result and human disposition

Gate 1 evidence assembly and review are complete: six retained masters, six rejected masters, responsive and annulus evidence, four boards, six provenance records, measurements, the package documents, the Cowork review and scorecard, and the human disposition record exist.

The human decision accepts Candidate A with the extended neutral presentation band as the strongest Gate 1 result. Phase 7.1B therefore achieved a valid neutral outcome without forcing imagery into the accepted direction. The accepted 26 px neutral plate is superseded as the leading configuration for later laboratory evaluation, but remains a Phase 7.1C control and does not freeze production band dimensions.

B1 is rejected for failing visual calmness, producing a visible horizontal contour, and reading as atmospheric sky or generic SaaS imagery. B2 is retained only as `EXPERIMENTAL — PRIVATE — NON-SHIPPABLE`, a hue and atmosphere diagnostic with no approval, adoption, or production eligibility.

C1 is rejected for failing visual calmness and for coherent vertical striping that persists across responsive evidence. C2 is retained conditionally as the single eligible Candidate C diagnostic because it has the clearest structural and Lintel-specific grammar and no automatic rejection condition; its left/right annulus asymmetry remains visible, and it does not outperform extended neutral. C3 and C4 are rejected because their intended claims do not remain materially visible in the annulus.

The authoritative closeout is package `documents/HUMAN_GATE_1_DISPOSITION.md`.

## 17. Derivation, Readiness, and stopping condition

No Candidate B or Candidate C seed earns responsive-family derivation. No tall or mobile Hero master, Readiness companion, AVIF or WebP production encode, or production asset path is authorised. Candidate generation is closed, and the Readiness section remains neutral during Phase 7.1C.

Phase 7.1C is a final live-comparison confirmation, not another generation phase. It must compare accepted neutral 26 px, extended neutral, B2 extended with a visible private/non-shippable label, and C2 extended with a visible conditional-diagnostic label. It must use the existing wide B2 and C2 masters without regeneration, preserve genuine tablet/mobile crop and flat-tone degradation, and determine whether live interaction and choreography change the static-board conclusion. Neutral wins whenever B2 or C2 does not materially exceed it.

The Gate 1 stopping condition has been reached at completed evidence, review, disposition, and repository validation, before derivative creation, encoding, implementation, or route creation. Phase 7.1B is accepted and closed.

## 18. Limitations and risks carried forward

- Laboratory band dimensions are not frozen.
- Extended neutral is the leading direction; the 26 px neutral plate remains a comparison control.
- B2's diagnostic usefulness does not change its private, non-shippable governance status.
- C2 is a conditional diagnostic, not a selected or implemented production direction.
- No tall master or Readiness companion exists.
- The frame-hairline arithmetic, literal structure-clearance rule, and local-variation versus coherent-directional-structure/8-bit-quantisation matters remain unresolved for the final surface freeze.
- Future surface evaluation should accompany local variation with high-pass row/column directional-structure measurement against the flat control.
- Final AVIF/WebP settings, performance, banding, production path/naming, and Phase 8 reuse remain open.

## 19. Protected scope and repository validation

This milestone is evidence and documentation only. It makes no application, CSS, route, library, public-asset, dependency, lockfile, interaction, motion, surface, or comparison-route change. Accepted Phase 7 and Phase 7.1A files remain unchanged.

Final validation on branch `r5e1e5b-candidate-asset-creation` confirms no staged files; no diff in `app/`, `lib/`, `public/`, package manifests/lockfiles, or `.claude/launch.json`; and no whitespace-error diff. In tracked scope, only this new milestone document and the bounded `docs/r5/README.md` status entry change. The complete candidate evidence package, including the Cowork records and human disposition, remains untracked. The pre-existing CRLF/EOL working-tree condition was observed and left unchanged: no whole-tree normalisation was staged, and neither `.gitattributes` nor Git configuration was modified. Nothing was staged, committed, pushed, or merged.
