# R5E.2E — Trust

Status: **ACCEPTED AND COMPLETE**

Branch: `r5e2e-trust`  
Base: `1da0572`  
Milestone: Phase 8E

## Outcome

`/trust` is implemented as the fourth genuine primary public route and the public source for availability, local/external analysis boundaries, deterministic and model provenance, canonical-run provenance, submitted-content persistence, GitHub App boundaries, integration vocabulary, Agent Change Passport provenance, Human Decision authority and current limitations.

The route is static and server-rendered on the white editorial canvas. It has no client component, image, media, animation, internal scene scrolling, ProductFrame, generic security iconography or shared-layer addition. It remains quieter and more evidentiary than Product through prose-first composition, structured records and two bounded neutral plates.

Final human acceptance closed Phase 8E on 7 August 2026. Phase 8F is authorised next but has not begun.

## Preflight and authority

The binding plan `plan-phase-8e-trust-lovely-hopper.md` was read in full before implementation. Sections 1–23 and the three planning decisions governed implementation. Named repository sources were re-inspected before copy was authored; no plan/repository truth conflict was found.

The three human decisions are preserved:

1. Trust actions are `Open the sample review` → `/workspace?source=fixture` and `How it works` → `/how-it-works`; no `/docs/*` or stale security-model link is present.
2. Product now has both accepted quiet pointers: availability → `/trust` and model provenance → `/trust#model-provenance`.
3. Trust is `live` with `sitemapEligible: true` following final human acceptance. It now emits `index, follow` and joins sitemap output only when a valid production HTTPS origin is configured.

## Trust route

The source order is T0 followed by exactly twelve `<main>` H2 sections:

1. Availability
2. Where analysis runs
3. The deterministic baseline
4. Model-assisted analysis and provenance
5. Run provenance and reproducibility
6. Submitted content
7. GitHub App authentication and webhooks
8. Integration status
9. Declared context and the Agent Change Passport
10. Human Decision authority
11. Current limitations
12. Inspect the record yourself

The shared footer retains its existing two group headings outside `<main>`.

## Product-truth boundaries

### Availability

Trust states that Lintel is a Next.js application cloned, installed and run locally; it is not a hosted service; it has no account, sign-up, trial, commercial plan or published canonical origin. Current usable paths are the fixed sample, public GitHub pull request import and local pasted-diff analysis. Optional model and GitHub App capabilities remain environment-configured.

### Local and external execution

The route names four explicit boundaries:

- deterministic analysis: local, with no network request;
- model-assisted analysis: local process plus a configured request to `api.openai.com`;
- public pull request import: explicit read from `github.com` after URL submission;
- GitHub App prototype: configured reads/writes through `api.github.com` after a verified delivery.

The public route itself loads no external asset or media. The GitHub App pull request comment is the only named external write.

### Deterministic baseline

Deterministic analysis remains the baseline. Missing provider configuration, a failed model call or output that does not normalise returns the deterministic report. The visible vocabulary is `APPROVE`, `REVIEW_REQUIRED` and `TESTS_REQUIRED`. The adjacent limitation says the baseline is a floor, not proof of safety.

### Model provenance

The model section states model assistance is optional and needs both `OPENAI_API_KEY` and `OPENAI_MODEL`; identifies `deterministic`, `model`, `fallback` and `demo` sources; records provider/model provenance; names the external-content boundary; keeps model output outside Human Decision authority; and classifies model-assisted replay as `traceable`, not `exact`.

Violet is used only by the visible Model-assisted provenance label. Lintel may say it sends `store: false`; it does not infer or claim provider non-retention.

### Run provenance

The canonical-run scene presents the real PR #482 context and the manifest field vocabulary for input, configuration and result fingerprints plus schema/generator/ruleset/report versions. All eight reproducibility classifications are visible. The exact adjacent boundary is:

> A fingerprint identifies a run. It is not a cryptographic integrity guarantee.

No cryptographic-attestation language appears.

### Submitted content and persistence

Trust distinguishes what is sent, what is stored and what is deliberately not persisted. It names the plain local JSON GitHub App store, browser-local review data, the 80-entry Human Decision Ledger, 20 retained analysis runs per pull request and 20 verifications per run. It states manual raw diff non-retention, best-effort text redaction, no shared database/account record, `store: false`, no-store response/fetch settings and 200,000-character diff bounds.

No encryption-at-rest, access-control, retention-policy, deletion-guarantee or audit-log claim is made.

### GitHub App

The GitHub App section records RS256 JWT authentication, nine-minute JWT expiry, per-delivery installation tokens, HMAC-SHA256 verification with `timingSafeEqual`, 401 rejection before parsing/storage, delivery-id deduplication, same-head deduplication and comment idempotency. It also names the event/action allowlist, per-repository enable gate, diff bound and seven safe authentication error categories.

The route says explicitly that GitHub App analysis is deterministic only. It does not imply model-assisted analysis runs on this path.

### Integration status

Trust presents four existing integration states as vocabulary rather than inventing live connection claims: Configured, Unavailable, Blueprint and Export-only. No dynamic status check or new client boundary was introduced.

### Change Passport

Trust carries a reduced provenance pointer: optional fenced declaration, declared producer type, separation of builder declaration from independent observation, bounded/failure-isolated parsing, manifest identity/fingerprint and no scoring/readiness authority. `unverified` retains builder context and does not mean false.

Orange appears only on `unverified` and `observed but undeclared`, each with visible text. The root README still omits the Agent Change Passport; every Trust passport statement therefore traces directly to `lib/change-passport.ts`. The root README remains protected and unchanged.

### Human Decision

Recommendation and authority remain separate. Trust names all seven ledger outcomes, head-SHA applicability, reaffirmation, divergence recording and the local single-machine actor boundary. Canonical PR #482 remains `PENDING`; no outcome is selected. Model output never becomes decision authority.

### Limitations

All ten root-README limitations and three Trust-specific additions remain visible as thirteen flat statements. None is collapsed or followed by a mitigating clause.

## Integration changes

### Product pointers

Product's existing Availability pointer is now a quiet link to `/trust`, and its false “not yet available” wording is removed. Product's existing deterministic-analysis section now carries one quiet pointer to `/trust#model-provenance`. No Product section or route-local scene was added or rearranged.

### Navigation

Trust's registry entry is live and, following final human acceptance, is now `sitemapEligible: true`. The unchanged shared shell derives four primary destinations—Home, Product, How it works and Trust—on desktop, in the mobile disclosure and in the `<noscript>` fallback. Trust receives the one truthful current-page state.

Resources and Documentation remain draft.

## Metadata and indexing

`buildPublicMetadata("trust", …)` emits `Trust | Lintel`, a truthful route description and `index, follow` because Trust is live and sitemap eligible. Canonical metadata remains absent until a valid production HTTPS origin is configured. The same origin gate keeps sitemap output empty without that configuration; with a valid production HTTPS origin, `/trust` joins the live eligible route set. Robots does not disallow `/trust` because it is live.

## Validation

- TypeScript: pass.
- Production build: pass; `/trust` emitted static.
- HTTP: 200.
- `<main>`: one H1, twelve H2s, thirteen sections including T0.
- Landmarks: one header, one main, one footer.
- Navigation: four genuine destinations and exactly one current-page link.
- Mobile disclosure: Enter, Space, focus transfer, Tab/Shift+Tab wrap, Escape/focus restoration, outside-pointer closure and route-change closure pass.
- Mobile targets: toggle and four links are 44px high.
- No JavaScript: full route plus four-link fallback pass.
- Responsive: 1440, 1280, 1024, 768, 390, 375, 360, 320 and 640 CSS-px 200% equivalent captured.
- Overflow: none horizontally; no internal scene scroller.
- Reduced motion: matched, zero active animations.
- Forced colours: matched, complete, no overflow.
- Media/external assets: zero.
- Client JavaScript: same nine shared scripts and 647,791 uncompressed bytes as Product and How it works; zero route-only client script.
- HTML response: 116,692 uncompressed bytes in the recorded production run.
- Indexing: Trust emits `index, follow`.
- Sitemap: Trust is eligible; it is absent without a configured production origin and present when a valid production HTTPS origin is supplied.
- Protected files: no diff.

The untracked `R5E2E_HUMAN_REVIEW_PACKAGE/` contains the sentence-level claim trace, detailed validation, review/acceptance records and genuine captures.

## Environment limitation

The in-app browser webview failed to attach on three fresh localhost tabs. Installed local headless Chrome supplied the recorded DOM, keyboard, media-emulation and screenshot evidence. The isolated browser pass recorded no hydration warning or route-runtime exception, but Chrome requested the repository-wide missing `/favicon.ico` and logged its 404. `public/**` is protected Phase 8E scope, so the record does not claim a perfectly empty console and does not modify that asset boundary.

## Exact files

Tracked new:

- `app/(public)/trust/page.tsx`
- `app/(public)/trust/trust-content.ts`
- `app/(public)/trust/trust.module.css`
- `app/(public)/trust/scenes/CanonicalRunProvenanceScene.tsx`
- `app/(public)/trust/scenes/IntegrationStatusScene.tsx`
- `docs/r5/R5E2E_TRUST.md`

Tracked modified:

- `app/_public/routes.ts`
- `app/(public)/product/product-content.ts`
- `app/(public)/product/page.tsx`
- `docs/r5/README.md`

Untracked new:

- `R5E2E_HUMAN_REVIEW_PACKAGE/README.md`
- `R5E2E_HUMAN_REVIEW_PACKAGE/CLAIM_TRACE.md`
- `R5E2E_HUMAN_REVIEW_PACKAGE/VALIDATION.md`
- `R5E2E_HUMAN_REVIEW_PACKAGE/HUMAN_REVIEW.md`
- `R5E2E_HUMAN_REVIEW_PACKAGE/HUMAN_ACCEPTANCE.md`
- twelve genuine PNG evidence captures

## Carried gates

1. `public/docs/security-model.md` correction/publication is explicit Phase 8F curation debt; it is not linked from Trust.
2. The root README Agent Change Passport omission remains unresolved.
3. Logged-in-route noindex remains a pre-deployment gate.
4. Production origin/canonical configuration remains unresolved; sitemap output remains origin-gated.
5. The recorded missing `/favicon.ico` remains a later public identity polish item.

Final human acceptance authorised Phase 8F next. No Phase 8F work, staging, commit, push or merge occurred during this closeout.
