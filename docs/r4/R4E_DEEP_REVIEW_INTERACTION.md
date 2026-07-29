# R4E — Deep Review Interaction

> **Status:** Accepted by manual human review on 29 July 2026; implemented in canonical `/workspace`; refreshed automated browser capture remains blocked by the in-app browser URL policy.
>
> **Scope:** One contained production milestone that deepens investigation, relationship traversal, comparison, keyboard operation, and context continuity without changing the R4D shell or persistence authority.

## Investigation state model

`ReadyWorkspace` owns the single selected review by canonical `caseId`, the active Workspace mode, and at most one primary selected object. The Inspector is a projection of that state; it does not maintain a competing selection. Selectable object kinds are finding, evidence, derived missing proof, requirement, changed-file context, run, readiness change, decision event, and decision readiness.

Related traversal retains one `OriginContext`: originating selection, mode, Workspace scroll offset, and return label. A second traversal replaces that single return level rather than constructing a navigation stack. The current selected object remains visible in the Investigation trace while its adjacent relationships are exposed as bounded sequential records.

Authoritative reload keeps selection when its stable canonical identifier still resolves in the refreshed `CaseDetail`. If the selected review disappears, the default surviving review is selected and the object/origin state is cleared. If only the selected object disappears, selection and origin are cleared with an assertive announcement. No stale object is relabelled as current.

Per-review/per-mode scroll positions live in a bounded in-memory map keyed by `caseId:mode`. Mode switches remember the current offset and restore the target offset after layout. Selecting another review retains the current mode only when that review already has a remembered position; otherwise it opens Overview.

## Relationship traversal

Relationship rendering preserves four materially different states:

- **Explicit stored relationship:** stored identifiers from canonical findings, evidence, and requirements resolve to a known record.
- **Deterministic derived relationship:** an exact normalized repository path or an inverse of an explicit stored relationship produces a bounded navigation edge.
- **Unavailable relationship:** the source contract cannot establish whether a relationship exists.
- **None recorded:** the source was capable of expressing the relationship and recorded no related identifier.

Stored references that fail to resolve remain an explicit unresolved state. They are not treated as none. Each relationship record exposes its relationship verb, target kind, human label, source detail, and provenance. Arrow keys move within a relationship list. Opening a relation updates the owning mode, selected object, Inspector, trace, and one-level origin context.

## Originating-record return

The Inspector and Investigation trace expose a visible “Back to…” action when a related traversal has an origin. `Escape` returns to that origin after drawer precedence and before clearing the primary selection. The original mode and scroll offset are restored. Mobile returns to the selected-record step so context is not discarded during responsive transformation.

## Next-inspection algorithm

Next inspection is deterministic and bounded. It evaluates the selected review in this order:

1. missing or unverified evidence linked to an open blocking requirement;
2. any remaining missing or unverified evidence;
3. stale evidence;
4. stale open blocking requirement;
5. first deterministically ordered open blocking requirement;
6. recorded Human Decision needing reaffirmation;
7. unavailable run comparison context;
8. explicit unavailable state when no canonical target exists.

The card always explains why its target is next. It never writes task progress, proof, acknowledgement, waiver, or decision state.

## Focused-code context truth

Changed files remain canonical artifacts. A focused region is projected only when a stored finding location contains an exact positive numeric line and its normalized repository-relative path exactly matches the changed file. The view shows that line anchor and the source finding label; it does not reconstruct source text.

The four code-context states remain distinct:

- **Exact line context:** exact stored path and line; the UI shows a line anchor and provenance.
- **File-only relationship:** the changed file is known, but no exact recorded line resolves.
- **Unavailable raw diff:** the current report contract contains no raw diff text; the UI says so in place.
- **Historical context:** comparison changes remain History records and are not presented as current source text.

The code region owns horizontal scrolling. The page does not gain document-level horizontal overflow. Stored Report language/framework metadata is shown only for real reports that recorded it; fixtures do not invent it.

## Requirement capability boundaries

Exact canonical Conditions retain their existing verified persisted clear/reopen capability. A condition action remains guarded by case identity, condition key, and the production persistence adapter, then performs targeted authoritative refresh.

Derived requirements are read-only. Local task progress remains separate from proof. R4E introduces no general acknowledgement, waiver, accepted-risk, or requirement-resolution schema. Accepted risk remains an explicit Human Decision concern.

## Run comparison

The immediately previous applicable run remains the deterministic default. Real browser-local history can expose up to nine compatible stored comparison targets, newest first. Each target is computed by the existing canonical readiness-delta and review-diff functions; incompatible or incomplete run/head identity stays unavailable.

Review Diff rows are selectable records with stable derived identifiers. Selecting one opens its previous/current state and category in the Inspector. Fixture-only readiness summaries remain labelled samples and do not fabricate run identity or historical record collections.

## Decision-readiness model

Decision readiness is inspectable before the Human Decision modal. It includes recommendation, risk, blockers, missing/unverified and stale proof, current run/head, prior decision applicability, accountable owner, handoff state, and the deterministic next inspection. Recorded ledger events are selectable when present.

There remains one primary Human Decision entry point in the readiness bar. Inspector context can return to readiness and condition actions, but it does not add a competing decision action. The seven outcomes remain unselected until the engineer acts. Mutation authority, read-back, duplicate prevention, stale-command behaviour, and focus restoration remain owned by the existing R4D service and dialog.

## Keyboard behaviour

- Queue: `ArrowUp`/`ArrowDown` or unmodified `J`/`K` moves focus; `Enter`/`Space` selects.
- Mode tabs: `ArrowLeft`/`ArrowRight`, `Home`, and `End` move the tab focus; activation remains explicit.
- Record collections and Review Diff: `ArrowUp`/`ArrowDown`, `Home`, and `End` move within the collection.
- Relationship/trace records: arrow keys move between available adjacent records.
- `E`, `R`, `H`, and `D` open Evidence, Requirements, History, and decision readiness.
- `[` and `]` control Queue and Inspector in the current responsive responsibility.
- `Ctrl/Cmd K` opens the command palette when focus is in the Workspace or on the document body.
- `Escape` closes the highest-priority surface, returns to origin, clears selection, or exits Focus mode in that order.

Shortcuts are suppressed while typing and while the decision dialog or command palette owns interaction. Drawers, the palette, and the modal contain focus and restore it to their trigger when closed.

## Command palette

The palette searches current modes, reviews, investigation targets, related records, decision readiness, Human Decision, compatible run targets, Focus mode, panel controls, and technical identifiers. Commands are derived from current canonical state; unavailable comparison is a disabled truth state. The palette does not create hidden records or persistence capability.

## Focus mode

Focus mode keeps the selected review, mode, selected object, origin, scroll context, readiness, and Human Decision state. It temporarily hides the persistent Queue and Inspector while keeping explicit on-demand Queue, Inspector, Commands, and Exit controls. Exiting restores the Queue-collapse and Inspector-open preferences recorded on entry. Wide drawers overlay the focused Workspace rather than changing its selection ownership.

## Responsive transformation

Wide and Normal retain the R4D shell. Narrow converts Queue and Inspector to contained drawers. Tablet and Mobile retain a functional sequence: review list → selected review → selected record. Investigation trace becomes a bounded horizontal sequence; focused code keeps its own horizontal scroll; command and focus controls reduce their labels without removing functionality. No duplicate responsive Workspace is rendered.

## Accessibility

The milestone retains skip links, semantic tablist state, visible focus, button semantics, live polite/assertive announcements, labelled provenance, focus containment for transient surfaces, trigger restoration, and reduced-motion CSS. `aria-pressed` marks selected records and `aria-current` marks the selected Queue review. Unavailable and disabled records remain perceivable rather than disappearing.

## Performance boundaries

Selection changes update shared state rather than reconstructing the shell. Relationship and next-inspection collections are bounded and deterministically derived. Run comparison exposes at most nine targets and 36 visible Review Diff rows. Scroll state uses stable identifiers and no continuous measurement. There is no graph layout, hover-time storage read, decorative animation, duplicated responsive Workspace, or default rendering of unbounded diffs.

## Known limitations

- The production Report contract does not store raw source/diff text, so exact anchors never imply reconstructed code.
- Explicit fixtures contain readiness summaries but no canonical run manifests; their History view truthfully withholds run-pair and selectable Review Diff claims.
- Object-removal continuity requires an authoritative real-data refresh and can be exercised only where a safe mutation or external history update exists.
- The in-app browser accepted the pre-edit production-route inspection but later rejected refreshed localhost access under its URL policy. The R4E human-review package therefore supplies exact uncaptured/manual validation instructions and does not claim successful refreshed screenshots.
- Effective 200% zoom and OS/browser reduced-motion emulation require the manual pass described in the review package.

## Human acceptance

R4E received manual human acceptance on 29 July 2026. The reviewer exercised the core production `/workspace` investigation sequence locally: review selection → finding → evidence → missing or unverified proof → affected context → related requirement → return to the originating record → Next inspection → run comparison → decision readiness → open and cancel Human Decision. No implementation defect was observed during that review.

The Codex browser remained unable to produce refreshed automated captures. No stale screenshot was represented as current evidence, and the 20-image capture package remains uncaptured. This tooling limitation does not invalidate the completed R4E implementation or its manual human acceptance. It also does not constitute automated post-edit browser validation or completion of all 32 manual scenarios.

Full adversarial responsive, 200% zoom, reduced-motion, large-collection, performance, and cross-route validation remains assigned to R4G. No real destructive mutation was performed as part of R4E acceptance.

## R4F and R4G handoff

R4F may propagate the accepted route-family and integration experience without moving review authority out of `/workspace`. It must not reinterpret local owner metadata as authenticated collaboration or upgrade Blueprint/Export-only integrations into current capability.

R4G may take the final cross-route polish, broader browser matrix, and accessibility/performance acceptance pass. It should preserve the R4E state ownership and provenance distinctions, and should recapture the temporary R4E package when the in-app browser URL-policy block is cleared.
