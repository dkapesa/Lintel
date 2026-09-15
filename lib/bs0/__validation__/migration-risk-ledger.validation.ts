/** BS0.11 / BS0.12-C2: evidence synthesis only. No production imports or behavior discovery.
 * Run: node --import ./lib/r6c/__validation__/node-hooks.mjs ./lib/bs0/__validation__/migration-risk-ledger.validation.ts
 * EXECUTABLE describes prior accepted evidence, not behavior invoked here.
 * Ranking and future-slice exposure are migration judgments, not new product facts.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const corpus = {
  "BS0.2": { file: "lib/bs0/__validation__/bs0.validation.ts", commit: "a71c458cd3e0b40cb3aadc450081696aa1d4b951" },
  "BS0.3": { file: "lib/bs0/__validation__/replay.validation.ts", commit: "3e9dcf2ebab7882f35d733d9c4ac8c6cdc9fbe25" },
  "BS0.4": { file: "lib/bs0/__validation__/temporal.validation.ts", commit: "8b3cc8d97f1c1e5eee5a3a676820c9a8b810ab4e" },
  "BS0.5": { file: "lib/bs0/__validation__/human-decision.validation.ts", commit: "2d773c531f58c0cdeac9a5d3af128f6b1a842e34" },
  "BS0.6": { file: "lib/bs0/__validation__/identity.validation.ts", commit: "09a46ae5439098bcc97aadb933b99ccf3fc56082" },
  "BS0.7": { file: "lib/bs0/__validation__/retention.validation.ts", commit: "9e168ffd0a843ea32df0a65cee36f0e195c62e7e" },
  "BS0.8": { file: "lib/bs0/__validation__/github-app.validation.ts", commit: "5933cfac59dfc4a8d36f60baf7dd4c3d5b4a90b5" },
  "BS0.9": { file: "lib/bs0/__validation__/route-authority.validation.ts", commit: "17f10632c842d781cc1424aa247901a792fc0569" },
  "BS0.10": { file: "lib/bs0/__validation__/failure-state.validation.ts", commit: "68c60dab7e67e1465d11eb211892a0b57fbecb78" },
  "BS0.12-C1": {
    file: "lib/bs0/__validation__/migration-boundary-corrections.validation.ts",
    commit: "ec11aeda95d27c4ab3f7dfb062c4559018e00912",
    blob: "78a102e4122e9130af50e9d6322e134728910b9f",
    requiredTokens: ["riskScore", "legacy improved", "Manifest reproducibility exact", "replay was executed", "complete historical verification-basis reproduction", "production behavior conditional on supplied Storage behavior", "native browser window.localStorage", "structured returned failure", "a C1 pass cannot close IR-F04"],
  },
} as const;
type AcceptedSlice = keyof typeof corpus;
type AcceptedFile = typeof corpus[AcceptedSlice]["file"];
const severities = ["BLOCKER", "MAJOR", "MINOR"] as const;
type Severity = typeof severities[number];
const riskClasses = ["IDENTITY", "HUMAN_AUTHORITY", "TEMPORAL", "PROVENANCE", "PERSISTENCE", "RETENTION", "ROUTE_AUTHORITY", "FAILURE_SEMANTICS", "REPLAY", "GITHUB_APP", "ANALYSIS"] as const;
type RiskClass = typeof riskClasses[number];
type EvidenceType = "EXECUTABLE" | "SOURCE_CONTRACT";
type EvidenceStrength = EvidenceType | "MIXED";
const futureSlices = ["BS1", "BS2", "BS3", "BS4", "BS5", "BS6", "BS7", "BS8", "BS9", "BS10", "BS11", "BS12"] as const;
type FutureSlice = typeof futureSlices[number];
const domains = ["canonical Review identity", "Human Decision authority", "temporal/evidence truth", "GitHub App provenance", "replay", "retention/orphans", "route cutover", "failure semantics", "analysis/model provenance"] as const;
type Domain = typeof domains[number];
const criticalNames = ["distinct-PR Human Decision collision", "App real PR versus Report PR 0", "mixed HEAD_A/HEAD_B completion provenance", "disappearing finding", "replay current-code limitation", "orphan reattachment", "failed does not mean rollback", "destructive Report-history cleanup", "comment publishing/report_generation_failure mismatch", "risk-score polarity under legacy improved", "manifest exact versus replay execution", "replay exact versus complete historical verification basis", "injected Storage evidence is conditional"] as const;
type Critical = typeof criticalNames[number];
type EvidenceRef = { slice: AcceptedSlice; file: AcceptedFile; token: string; evidence: EvidenceType };
type MigrationRisk = {
  id: `MR-${string}`; title: string; severity: Severity; riskClass: RiskClass; evidenceStrength: EvidenceStrength;
  currentBehavior: string; migrationHazard: string; acceptanceConstraint: string;
  evidenceRefs: readonly EvidenceRef[]; affectedSlices: readonly FutureSlice[];
  coverageDomains: readonly Domain[]; criticalEvidence?: readonly Critical[]; relatedRisks?: readonly `MR-${string}`[];
};
function ref(slice: AcceptedSlice, token: string, evidence: EvidenceType): EvidenceRef {
  return { slice, file: corpus[slice].file, token, evidence };
}
const E = "EXECUTABLE";
const S = "SOURCE_CONTRACT";

export const migrationRiskLedger: readonly MigrationRisk[] = [
  {
    id: "MR-01", title: "Distinct PRs can inherit colliding Human Decision authority", severity: "BLOCKER", riskClass: "HUMAN_AUTHORITY", evidenceStrength: E,
    currentBehavior: "Distinct PRs with matching repository/title/input label share the workflow/Human Decision outer key. PR A's decision can surface in PR B while intrinsic ledger and entry ownership remain PR A; retained authority can also surface after history eviction.",
    migrationHazard: "A migration can promote the colliding outer lookup or visible decision into canonical ownership and transfer Human Decision authority between distinct changes.",
    acceptanceConstraint: "Distinct pull requests must not inherit one another's Human Decision authority; outer lookup, visible context and intrinsic ownership must be explicitly distinguished, including retained collisions.",
    evidenceRefs: [ref("BS0.5", "H3 - distinct PRs collide", E), ref("BS0.5", "H4 - outer storage ownership", E), ref("BS0.7", "R5 - surviving Human Decision reattaches to a distinct PR", E)],
    affectedSlices: ["BS2", "BS7", "BS8", "BS11"], coverageDomains: ["Human Decision authority", "retention/orphans"], criticalEvidence: ["distinct-PR Human Decision collision"], relatedRisks: ["MR-02", "MR-14"],
  },
  {
    id: "MR-02", title: "Legacy identity planes cannot be promoted as one canonical Review", severity: "BLOCKER", riskClass: "IDENTITY", evidenceStrength: "MIXED",
    currentBehavior: "No single persistent Review owner spans browser Cases, workflow, Human Decision, drafts, canonical runs and App records. Workflow/outer decisions merge PR-only changes while intrinsic ledger, PR-aware comparison, canonical input/run and App keys split. Title/input-label changes split other planes; default ReviewId follows timestamp-owned Case identity and can merge a PR-only change at equal timestamp. Reviews indexing persists no independent Review; browser and App stores have no established canonical bridge.",
    migrationHazard: "Treating any one current key or route index as universal identity can silently merge distinct changes, split continuity or combine independent browser/App authority.",
    acceptanceConstraint: "Canonical identity acceptance must account for established merge/split dimensions and separate persistence planes; no current key, Case projection or route index alone proves shared Review ownership.",
    evidenceRefs: [ref("BS0.6", "I1 - same repository/title/input label with different PR numbers", E), ref("BS0.6", "I8A: PR number is the only changed context dimension", E), ref("BS0.6", "I12 - deterministic merge/split matrix", E), ref("BS0.6", "I13 - current tracked source has no single persistent Review identity owner", S), ref("BS0.6", "I10 - browser and GitHub App persistence", S), ref("BS0.8", "G14 - GitHub App persistence does not write browser review authorities", S), ref("BS0.9", 'test("RA5"', E), ref("BS0.9", 'test("RA16"', S)],
    affectedSlices: ["BS1", "BS2", "BS3", "BS7", "BS8", "BS11"], coverageDomains: ["canonical Review identity", "GitHub App provenance", "route cutover"], relatedRisks: ["MR-01", "MR-13"],
  },
  {
    id: "MR-03", title: "Head applicability does not establish decision verification basis", severity: "BLOCKER", riskClass: "HUMAN_AUTHORITY", evidenceStrength: E,
    currentBehavior: "Raw ledger applicability is head-oriented: equal known head remains applicable despite changed run/base/configuration/result/evidence/contract basis; missing current or recorded head is permissive there. Workspace separately projects unknown current head or unbound decisions. Unavailable references survive; reaffirmation copies outcome and references to a new head without making unresolved references available. Draft binding checks run/head more strictly than persisted applicability.",
    migrationHazard: "Legacy applicable or reaffirmed labels can be interpreted as support for a complete new verification basis, erasing unbound/unknown status or manufacturing support from unavailable references.",
    acceptanceConstraint: "A decision's head applicability, authored verification basis and reference availability must remain distinguishable. Changed or unknown basis and copied unresolved references must not silently become verified support.",
    evidenceRefs: [ref("BS0.5", "H2 - draft binding is stronger", E), ref("BS0.5", "H5 - ledger applicability", E), ref("BS0.5", "H6 - equal head keeps", E), ref("BS0.5", "H7 - unavailable referenced evidence", E), ref("BS0.5", "H8 - reaffirmation copies authority", E), ref("BS0.5", "H10 - headless recording", E)],
    affectedSlices: ["BS2", "BS7", "BS8", "BS11"], coverageDomains: ["Human Decision authority", "temporal/evidence truth"], relatedRisks: ["MR-15"],
  },
  {
    id: "MR-04", title: "App real PR identity splits from Report PR zero provenance", severity: "BLOCKER", riskClass: "PROVENANCE", evidenceStrength: "MIXED",
    currentBehavior: "App intake retains the real PR number, but its characterized ReportInput path omits pullRequestNumber. Generated Report, evidence, contract and pack carry PR 0 while App run and canonical manifest retain the real PR. Explicit positive ReportInput PR propagates correctly in the accepted derivation baseline.",
    migrationHazard: "Report PR 0 can merge unrelated App changes or be mistaken for complete canonical provenance; replacing it with an external number without accounting for artifact provenance can falsely assert historical identity agreement.",
    acceptanceConstraint: "Real App PR identity and the Report-derived PR 0 sentinel must be explicitly accounted for; sentinel artifacts must neither establish shared change ownership nor imply historical provenance agreement.",
    evidenceRefs: [ref("BS0.2", "D2 - an explicit positive PR number", E), ref("BS0.2", "D3 - GitHub App external PR identity", E), ref("BS0.8", "G6 - App route source omits pullRequestNumber", S), ref("BS0.8", "G7 - App completion preserves external PR identity", E)],
    affectedSlices: ["BS1", "BS2", "BS7", "BS11"], coverageDomains: ["GitHub App provenance", "canonical Review identity"], criticalEvidence: ["App real PR versus Report PR 0"],
  },
  {
    id: "MR-05", title: "App completion can combine incompatible revision provenance", severity: "BLOCKER", riskClass: "PROVENANCE", evidenceStrength: "MIXED",
    currentBehavior: "App completion rereads mutable PR state without an expected-head guard. The accepted HEAD_A/HEAD_B case stores a Report/input repository from HEAD_A analysis beside run/canonical head and base from current HEAD_B and App owner/repository metadata from B. Comment head bookkeeping uses the started envelope head.",
    migrationHazard: "A migrated completed run can be treated as one coherent revision and assign HEAD_A analysis or comment support to HEAD_B.",
    acceptanceConstraint: "A completed label cannot establish coherent revision provenance. Earlier analysis input/Report, current App metadata and started-envelope comment basis must not be silently combined as support for one revision.",
    evidenceRefs: [ref("BS0.8", "G11 - completion after a head update", E), ref("BS0.8", "completion has no expected-head guard", S), ref("BS0.8", "comment completion stores the started delivery envelope head", S)],
    affectedSlices: ["BS1", "BS7", "BS11"], coverageDomains: ["GitHub App provenance", "temporal/evidence truth"], criticalEvidence: ["mixed HEAD_A/HEAD_B completion provenance"],
  },
  {
    id: "MR-06", title: "Temporal clearance and movement can become false resolution claims", severity: "BLOCKER", riskClass: "TEMPORAL", evidenceStrength: E,
    currentBehavior: "Finding or condition disappearance can contribute to cleared/improved output with no independent resolution proof. Equivalent evidence on a changed head gets new IDs and added/stronger-added counts, without proposition continuity. Accepted C1 executable evidence shows the real Workspace projection maps Report.verdict.riskScore 10 -> 20 into readinessScore and returns classification improved, previousScore 10, currentScore 20, scoreChange 10, clearedCount 0 and openedCount 0, with other Report dimensions fixed and no comparison diff rows. Risk is not the only classification contributor; this does not mean every improved result is incorrect. Readiness Delta and Review Diff can disagree on suggested-test movement. Current temporal outputs lack Verification Delta truth fields and retain separate concepts.",
    migrationHazard: "Cleared or stronger-added labels can become proof of resolution or new support, while legacy improved can become verification-improvement truth despite directionally adverse Report risk-score movement. Existing delta/diff/pack evolution can be renamed as future Verification Delta with false certainty.",
    acceptanceConstraint: "Disappearance and revision-sensitive evidence movement must not establish resolution or additional semantic support. Legacy improved must not be promoted as verification-improvement truth unless its contributing dimensions and their polarity are explicitly understood. Existing temporal comparison outputs must not be equated with Verification Delta truth without an explicit semantic boundary.",
    evidenceRefs: [ref("BS0.4", "T3 - disappearance is surfaced as cleared", E), ref("BS0.4", "T4 - Evidence identity changes", E), ref("BS0.4", "T5 - proposition continuity", E), ref("BS0.4", "T8 - Readiness Delta collapses", E), ref("BS0.4", "T10 - current temporal outputs are not a Verification Delta", E), ref("BS0.12-C1", "C1 — IR-F01 risk-score polarity through real Workspace adapter", E)],
    affectedSlices: ["BS1", "BS6", "BS7", "BS11"], coverageDomains: ["temporal/evidence truth"], criticalEvidence: ["disappearing finding", "risk-score polarity under legacy improved"],
  },
  {
    id: "MR-07", title: "Legacy recheck satisfaction can manufacture proposition support", severity: "BLOCKER", riskClass: "TEMPORAL", evidenceStrength: E,
    currentBehavior: "Contract recheck can credit unrelated eligible evidence-class presence despite no supporting clause/condition relationship. Stale evidence is excluded by class-presence checks but can satisfy reference checks; older-head evidence is not automatically stale, and Readiness Delta rebuild does not infer staleness from head change.",
    migrationHazard: "A satisfied/newly-satisfied legacy requirement can become verified support for its proposition or current revision despite unrelated or stale credited evidence.",
    acceptanceConstraint: "Legacy requirement satisfaction must not by itself prove proposition relevance or current-revision applicability; requirement type, credited reference and characterized staleness boundaries must remain explicit.",
    evidenceRefs: [ref("BS0.4", "T6 - contract recheck accepts unrelated", E), ref("BS0.4", "T9 - stale Evidence eligibility", E)],
    affectedSlices: ["BS1", "BS6", "BS7", "BS11"], coverageDomains: ["temporal/evidence truth"], relatedRisks: ["MR-06"],
  },
  {
    id: "MR-08", title: "Report equivalence cannot reconstruct verification provenance", severity: "BLOCKER", riskClass: "ANALYSIS", evidenceStrength: E,
    currentBehavior: "Change Passport does not change generated Report semantics but changes input/run, evidence/assumption, contract and pack identity. Stored Reports do not contain Passport/contract/pack; rebuilding without Passport yields different partial artifacts even with equal Report/result identity. App runs retain full normalized Passport while canonical manifests retain only identity summaries and packs bounded declarations.",
    migrationHazard: "Equal Reports or result fingerprints can be used to deduplicate incompatible verification contexts or relabel newly reconstructed artifacts as the original authoritative evidence/contract/pack.",
    acceptanceConstraint: "Report/result equivalence must not establish equivalence or recoverability of Passport-dependent verification artifacts. Missing declaration context and reconstruction provenance must remain explicit.",
    evidenceRefs: [ref("BS0.2", "D4 - Change Passport affects verification artifacts", E), ref("BS0.2", "D5 - equivalent Reports", E), ref("BS0.2", "D6 - a stored Report", E), ref("BS0.3", "R2 - replay-style Passport omission", E), ref("BS0.8", "G8 - normalized full Change Passport", E)],
    affectedSlices: ["BS1", "BS6", "BS7", "BS11"], coverageDomains: ["analysis/model provenance", "temporal/evidence truth"],
  },
  {
    id: "MR-09", title: "Exact replay is a bounded current-code comparison", severity: "BLOCKER", riskClass: "REPLAY", evidenceStrength: "MIXED",
    currentBehavior: "Accepted C1 executable evidence shows createCanonicalReviewRunManifest can assign generation-time manifest reproducibility exact without executed replay verification. Separately, verify-run starts from an existing run, checks current head and declared configuration fingerprint, invokes current Report/manifest builders, compares Report-result fingerprint and persists a separate verification record. Verify-run calls current builders without archived-version dispatch. Declared configuration fingerprints do not hash implementation/prompt source. Executed replay exact does not establish complete historical verification-basis reproduction or complete input/run/Passport/evidence/contract equality. Persisted replay records retain bounded outcomes rather than reconstructed artifacts; source URL omission changes input identity without changing Report result.",
    migrationHazard: "Generation-time manifest exact can be imported as if successful replay was executed. Executed replay exact can be promoted into proof of historical implementation reproduction or complete verification-basis equivalence that the accepted replay comparisons never establish.",
    acceptanceConstraint: "Manifest exact, executed replay result and historical verification basis must remain separate authorities. Manifest exact must not imply replay was executed. Executed replay exact must remain bounded to its actual comparisons and current-code execution; it cannot establish historical implementation dispatch, complete input identity or downstream verification equivalence.",
    evidenceRefs: [ref("BS0.3", "R3 - source URL contributes only", E), ref("BS0.3", "R5 - configuration fingerprint covers declared configuration", S), ref("BS0.3", "R6 - verify-run invokes current builders", S), ref("BS0.3", "R7 - verify-run compares head applicability", S), ref("BS0.3", "R8 - persisted replay provenance", S), ref("BS0.3", "R9 - current exact replay", S), ref("BS0.12-C1", "C2A — IR-F02 generation-time manifest exact", E), ref("BS0.12-C1", "C2B — IR-F02 separate executed replay authority and bounded comparisons", S)],
    affectedSlices: ["BS1", "BS7", "BS11"], coverageDomains: ["replay", "temporal/evidence truth"], criticalEvidence: ["replay current-code limitation", "manifest exact versus replay execution", "replay exact versus complete historical verification basis"], relatedRisks: ["MR-08"],
  },
  {
    id: "MR-10", title: "Empty defaults can erase unavailable evidence and authority", severity: "BLOCKER", riskClass: "FAILURE_SEMANTICS", evidenceStrength: E,
    currentBehavior: "History/ledger/App readers collapse selected absent, malformed or unreadable states to empty defaults; missing/unreadable App repository configuration defaults enabled. Real adapter restores selected empty/unavailable distinctions, keeps review limitations and decision unavailable, while condition progress defaults uncleared. Ledger helper may use supplied legacy-state fallback; decision integrity gates differ. Draft read can say absent while separate durability says unavailable/quarantined.",
    migrationHazard: "A uniform empty/default import can convert unknown evidence into no concerns or supported authority, erase unreadable decisions/drafts, or treat fallback enablement/legacy state as known canonical intent.",
    acceptanceConstraint: "Unknown, unavailable, quarantined and fallback state must not become supported or known absent solely because a legacy reader returns an empty/default value; layer-specific distinctions must be explicitly accounted for.",
    evidenceRefs: [ref("BS0.10", "FS2 - report-history parsing", E), ref("BS0.10", "FS3 - real adapter unavailable versus empty", E), ref("BS0.10", "FS6 - ledger helper versus decision service", E), ref("BS0.10", "FS7 - draft envelope durability", E), ref("BS0.10", "FS12 - App store safe filesystem failures", E), ref("BS0.7", "R12 - history has no eviction marker", E)],
    affectedSlices: ["BS1", "BS2", "BS7", "BS8", "BS11", "BS12"], coverageDomains: ["failure semantics", "Human Decision authority"], relatedRisks: ["MR-18"],
  },
  {
    id: "MR-11", title: "Reported failure does not determine authoritative persistence", severity: "BLOCKER", riskClass: "PERSISTENCE", evidenceStrength: "MIXED",
    currentBehavior: "Adversarial injected Storage evidence for production workflow/condition and ledger/decision logic is conditional on supplied Storage behavior: ignored writes yield verification mismatch, reject-before-write yields failure with prior bytes preserved, and authoritative write-then-throw can yield reported failure after stored mutation. C1 executes the review-status service/read-back/real-projection case; it does not observe native browser window.localStorage exhibiting those modes or establish any failure frequency. Independently accepted App evidence establishes that the updater returns success only after destination persistence; failed rename can leave serialized temp state with no authoritative destination success or cached success. Saved writes and refresh failure are separately represented on selected browser source-contract paths. Comment-publishing/persistence mismatch is independently established and also retained in MR-19.",
    migrationHazard: "Failure can be assumed to mean rollback and trigger duplicate authority or discard persisted state; conversely local/temp serialization or a successful reload call can be assumed to mean authoritative persistence. Conditional injected-Storage observations can be inflated into observed native-browser behavior or failure frequency.",
    acceptanceConstraint: "Failed does not mean rollback (FAILED != ROLLED BACK), and serialized temp state does not mean authoritative persistence. Reported outcome, attempted mutation, authoritative destination durability, read-back state and refresh/projected state must remain distinguishable without an inferred uniform transaction guarantee. Injected Storage evidence must remain conditional on supplied Storage behavior; it must not establish observed native-browser failure modes or frequency, nor displace independent App, read-back, refresh or publishing evidence.",
    evidenceRefs: [ref("BS0.10", "FS5 - workflow and condition failures", E), ref("BS0.10", "FS6 - ledger helper versus decision service", E), ref("BS0.10", "FS12 - App store safe filesystem failures", E), ref("BS0.10", "FS14 - current browser error/degraded branches", S), ref("BS0.10", "non-authoritative temp files do not establish preservation", S), ref("BS0.10", "FS13 - decision-comment failure transitions", E), ref("BS0.10", "leave publishing plus report_generation_failure if failure persistence succeeds", S), ref("BS0.12-C1", "C3 — IR-F03 injected Storage conditional service behavior", E), ref("BS0.12-C1", "production behavior conditional on supplied Storage behavior", E)],
    affectedSlices: ["BS2", "BS7", "BS8", "BS11", "BS12"], coverageDomains: ["failure semantics", "Human Decision authority", "GitHub App provenance"], criticalEvidence: ["failed does not mean rollback", "injected Storage evidence is conditional"],
  },
  {
    id: "MR-12", title: "Normalized model assistance must not become verification evidence", severity: "BLOCKER", riskClass: "ANALYSIS", evidenceStrength: "MIXED",
    currentBehavior: "Optional model/provider/output failure falls back to deterministic output with characterized deterministic/fallback provenance. Partially malformed model-shaped output can normalize successfully and retain a valid model-provided verdict summary alongside deterministic metadata/files/findings. Normalized success records model/source ai; provider strict schema requests are not a separate full local schema validator.",
    migrationHazard: "Normalized mixed-origin content can be imported as independently established evidence, or fallback/model/deterministic provenance can disappear behind an apparently certain Report.",
    acceptanceConstraint: "Normalization and model success must not manufacture verification support. Retained model semantic content, deterministic baseline fields and provider/output fallback provenance must remain distinguishable at the characterized scope.",
    evidenceRefs: [ref("BS0.10", "valid model-provided semantic summary used beside malformed fields", E), ref("BS0.10", "canonical analysisSource fallback", S), ref("BS0.10", "Provider strict JSON schema request is not a separate local full-schema validator", S)],
    affectedSlices: ["BS1", "BS6", "BS7", "BS11"], coverageDomains: ["analysis/model provenance", "temporal/evidence truth"],
  },
  {
    id: "MR-13", title: "Timestamp recreation can strand drafts while binding changes independently", severity: "MAJOR", riskClass: "IDENTITY", evidenceStrength: E,
    currentBehavior: "Recreating the same logical change at a new history timestamp changes Case/default ReviewId and leaves old drafts owned by the prior ReviewId. The same ReviewId owner can remain while run or head changes stale draft binding; PR-only changes can share the owner while canonical run splits.",
    migrationHazard: "Recreated projection identity can lose meaningful draft continuity, or retained owner identity can be mistaken for permission to reattach a draft across a changed binding basis.",
    acceptanceConstraint: "Draft ownership, recreated Review reachability and run/head binding applicability require explicit migration accounting; neither matching owner nor matching logical change alone establishes reusable draft applicability.",
    evidenceRefs: [ref("BS0.6", "I4 - same logical change at different history timestamps", E), ref("BS0.6", "I8 - draft ReviewId ownership", E), ref("BS0.5", "H2 - draft binding is stronger", E), ref("BS0.7", "R7 - ReviewId-keyed draft survives", E)],
    affectedSlices: ["BS2", "BS3", "BS8", "BS11", "BS12"], coverageDomains: ["canonical Review identity", "retention/orphans"], relatedRisks: ["MR-02", "MR-14"],
  },
  {
    id: "MR-14", title: "Retention separates physical state, reachability and reattachment", severity: "MAJOR", riskClass: "RETENTION", evidenceStrength: "MIXED",
    currentBehavior: "History keeps ten newest insertions rather than greatest timestamps. Eviction/deletion/clear removes normal Case/default Review reachability without uniform cascade to workflow/decisions/progress/drafts. Workflow and matching condition progress can reattach; timestamp-owned drafts remain orphaned. History has no eviction tombstone distinguishing evicted from never-existing lookup. History, ledger, drafts, App runs/verifications and other stores have unequal horizons; full drafts refuse a new owner rather than evicting old drafts.",
    migrationHazard: "Import or cutover can discard physically retained meaningful state, unexpectedly revive matching-key state or assume uniform deletion, ordering, retention or recovery semantics.",
    acceptanceConstraint: "Physical retention, normal reachability, matching-identity reattachment and absent eviction markers must be explicitly distinguished. Unequal retention/refusal horizons cannot be silently treated as one lifecycle policy.",
    evidenceRefs: [ref("BS0.7", "R1 - Report history retains the ten newest insertions", E), ref("BS0.7", "R3 - workflow state survives eviction", E), ref("BS0.7", "R4 - Human Decision ledger survives", E), ref("BS0.7", "R6 - condition progress survives eviction and reattaches", E), ref("BS0.7", "R7 - ReviewId-keyed draft survives", E), ref("BS0.7", "R8 - explicit history deletion", E), ref("BS0.7", "R9 - clearReportHistory", E), ref("BS0.7", "R10 - production limits are exact", E), ref("BS0.7", "GitHub App run retention source contract", S), ref("BS0.7", "R11 - unequal real retention horizons", E), ref("BS0.7", "R12 - history has no eviction marker", E)],
    affectedSlices: ["BS2", "BS7", "BS11", "BS12"], coverageDomains: ["retention/orphans"], criticalEvidence: ["orphan reattachment"], relatedRisks: ["MR-01", "MR-13"],
  },
  {
    id: "MR-15", title: "Shared decision writer does not imply equivalent route gates", severity: "MAJOR", riskClass: "ROUTE_AUTHORITY", evidenceStrength: "MIXED",
    currentBehavior: "Real R4/V2 and Reviews share the decision writer. R4/V2 ephemeral dialogs allow acknowledged headless submission without a canonical-run/persistent-draft prerequisite. Reviews requires applicable subject/case/run/head draft basis and blocks missing selected risk IDs. Only Reviews persists draft interaction; reaffirmation is exposed in all three real paths.",
    migrationHazard: "Consolidating route surfaces can silently bypass stronger pre-writer gates or block submissions that the current acknowledged headless routes permit.",
    acceptanceConstraint: "Writer sharing must not imply route-gate equivalence. Headless acknowledgement, strict draft basis, selected-reference availability and durable draft interaction require an explicit cutover decision.",
    evidenceRefs: [ref("BS0.5", "H11 - reachable Human Decision routes", S), ref("BS0.9", 'test("RA7"', E), ref("BS0.9", "R4/V2 use separate ephemeral dialogs", S), ref("BS0.9", 'test("RA11"', S)],
    affectedSlices: ["BS3", "BS4", "BS5", "BS8", "BS11", "BS12"], coverageDomains: ["route cutover", "Human Decision authority"], relatedRisks: ["MR-03", "MR-16"],
  },
  {
    id: "MR-16", title: "Route cutover can change source selection and mutation authority", severity: "MAJOR", riskClass: "ROUTE_AUTHORITY", evidenceStrength: "MIXED",
    currentBehavior: "/workspace defaults real R4; /workspace-v2 defaults fixture and requires explicit real selection. /report is a read-only durable/session/demo projection. R4 calls conditions/decisions but no workflow status; real V2 calls status/conditions/decisions. Reviews persists Human Decision drafts/decisions but has no workflow/condition callers. Legacy retains scoped real workflow and history deletion/separate decision-history authority. Legacy writes session handoff then navigates bare /report, which selects that handoff only with session=1; explicit reportId takes precedence and session reads do not consume it.",
    migrationHazard: "Route replacement can substitute fixtures for real state, transfer or remove mutation authority, confuse separate decision history with Human Decision, or unexpectedly select a transient handoff as durable Review state.",
    acceptanceConstraint: "Cutover must explicitly account for source defaults, read-only versus actual mutation callers, scoped legacy authority and durable/transient handoff selection; route names and injected services do not confer authority.",
    evidenceRefs: [ref("BS0.9", 'test("RA1"', E), ref("BS0.9", 'test("RA2"', S), ref("BS0.9", 'test("RA3"', S), ref("BS0.9", 'test("RA4"', E), ref("BS0.9", 'test("RA5"', S), ref("BS0.9", 'test("RA6"', S), ref("BS0.9", 'test("RA8"', S), ref("BS0.9", 'test("RA10"', S), ref("BS0.10", "FS4 - generated session handoff source contract", S)],
    affectedSlices: ["BS3", "BS4", "BS5", "BS8", "BS11", "BS12"], coverageDomains: ["route cutover"], relatedRisks: ["MR-15", "MR-18"],
  },
  {
    id: "MR-17", title: "App delivery dedupe, head preflight and stored reuse are distinct", severity: "MAJOR", riskClass: "GITHUB_APP", evidenceStrength: "MIXED",
    currentBehavior: "Delivery idempotency is keyed by delivery ID; delivery records lack explicit head/PR number. Completed-head preflight is separate and processing same-head records are not completions, so distinct deliveries can enter same-head processing before completion. Later same-head completions retain one original stored run/Report even while mutable PR title changes.",
    migrationHazard: "One dedupe notion can replace all three, suppressing legitimate intake/recovery or assuming one admitted analysis and one coherent latest result merely because one run is stored.",
    acceptanceConstraint: "Delivery identity, completed-head admission and stored same-head reuse must remain semantically distinct. A single stored run does not establish a single processing attempt or unchanged mutable PR metadata.",
    evidenceRefs: [ref("BS0.8", "G3 - delivery idempotency", E), ref("BS0.8", "G10 - same-head completion and route preflight", E), ref("BS0.8", "route acknowledges completed same-head delivery", S), ref("BS0.8", "G12 - two same-head analyses can be admitted", E)],
    affectedSlices: ["BS2", "BS7", "BS11", "BS12"], coverageDomains: ["GitHub App provenance", "replay"],
  },
  {
    id: "MR-18", title: "Writable Report-history reads can destroy useful persisted history", severity: "MAJOR", riskClass: "PERSISTENCE", evidenceStrength: "MIXED",
    currentBehavior: "Malformed history removes the key; invalid/pruned arrays can rewrite it. Read failure and normalization/pruning write failure can clean up previously useful persisted bytes and return empty; cleanup removal failure can throw. Same-count metadata normalization does not alone rewrite bytes. New/legacy/Settings use writable direct reads; Report facade and real adapter suppress persistence side effects while projecting validated entries.",
    migrationHazard: "A presumed read-only inventory/import can erase source history or treat destructive cleanup as genuine emptiness; route cutover can introduce or remove read-side persistence authority unexpectedly.",
    acceptanceConstraint: "History read failure and destructive cleanup must not be mistaken for known empty source state. Writable normalization/pruning and guarded projection must be explicitly accounted for during inventory and cutover.",
    evidenceRefs: [ref("BS0.10", "read failure removes previously valid bytes", E), ref("BS0.10", "failed overflow rewrite removes all prior bytes", E), ref("BS0.10", "same-count normalization not rewritten", E), ref("BS0.9", 'test("RA9"', E), ref("BS0.9", "Writable direct New/legacy/Settings reads", S)],
    affectedSlices: ["BS2", "BS3", "BS11", "BS12"], coverageDomains: ["failure semantics", "route cutover", "retention/orphans"], criticalEvidence: ["destructive Report-history cleanup"], relatedRisks: ["MR-10", "MR-14"],
  },
  {
    id: "MR-19", title: "Failure classifications do not identify one coherent lifecycle outcome", severity: "MAJOR", riskClass: "FAILURE_SEMANTICS", evidenceStrength: "MIXED",
    currentBehavior: "App later failed head/state can retain earlier completed history/latest Report. A thrown comment publisher after persisted publishing mark can leave comment publishing while PR/delivery become report_generation_failure, conditional on failure persistence succeeding; returned ok:false instead marks comment failed. Failure persistence itself can throw. Browser helpers/services/drafts, deterministic fallback, API HTTP errors and persisted App categories do not share one failure union; connected read/import exceptions can be classified timeout, public metadata failure can default empty, and failed delivery admission is not automatic retry.",
    migrationHazard: "Uniform failure classification can misattribute stage/head, erase useful completed history, mistake old latest Report for current-head completion, or infer recovery/publication status from an unrelated failure category.",
    acceptanceConstraint: "Current head/state, retained completed artifacts, comment publishing outcome and failure-persistence success must remain distinguishable. Existing browser/API/App categories and retry boundaries require explicit classification/cutover decisions rather than inferred lifecycle equivalence.",
    evidenceRefs: [ref("BS0.10", "FS11 - App analysis failure persists independently of completed history", E), ref("BS0.10", "FS13 - decision-comment failure transitions", E), ref("BS0.10", "leave publishing plus report_generation_failure if failure persistence succeeds", S), ref("BS0.10", "FS9 - generate-report GET/POST error authority source", S), ref("BS0.10", "FS10 - public PR and connected read/import failure source", S), ref("BS0.10", "FS16 - bounded current cross-product failure boundary", S)],
    affectedSlices: ["BS3", "BS5", "BS7", "BS11", "BS12"], coverageDomains: ["failure semantics", "GitHub App provenance"], criticalEvidence: ["comment publishing/report_generation_failure mismatch"], relatedRisks: ["MR-05", "MR-11", "MR-17"],
  },
  {
    id: "MR-20", title: "Fingerprint whitespace normalization is compatibility, not exact text identity", severity: "MINOR", riskClass: "REPLAY", evidenceStrength: E,
    currentBehavior: "Canonical string serialization trims and collapses whitespace before input fingerprinting; distinct title surface strings can therefore produce equal input fingerprints.",
    migrationHazard: "A compatibility fingerprint can be mistaken for byte-for-byte input identity or silently change its whitespace equivalence during migration.",
    acceptanceConstraint: "Whitespace-normalized fingerprint equivalence must remain distinguishable from exact surface-text identity, with any compatibility change explicitly acknowledged.",
    evidenceRefs: [ref("BS0.3", "R4 - canonical string serialization collapses whitespace", E)],
    affectedSlices: ["BS1", "BS2", "BS11"], coverageDomains: ["replay"], relatedRisks: ["MR-09"],
  },
];

function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function equal(actual: unknown, expected: unknown, message: string): void {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}
const tracked = new Set(execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean));
const evidenceText = new Map<AcceptedFile, string>();
const checks: { name: string; run: () => void }[] = [];
function test(name: string, run: () => void): void { checks.push({ name, run }); }
const refs = migrationRiskLedger.flatMap(risk => risk.evidenceRefs);
function covered(domain: Domain, slice: AcceptedSlice, token: string): void {
  assert(migrationRiskLedger.some(risk => risk.coverageDomains.includes(domain) && risk.evidenceRefs.some(item => item.slice === slice && item.token === token)), `${domain} needs bound evidence: ${slice}/${token}`);
}

test("MR1 - Evidence corpus integrity", () => {
  equal(Object.keys(corpus), ["BS0.2", "BS0.3", "BS0.4", "BS0.5", "BS0.6", "BS0.7", "BS0.8", "BS0.9", "BS0.10", "BS0.12-C1"], "historical slices plus separately accepted correction slice");
  equal(new Set(Object.values(corpus).map(item => item.file)).size, 10, "ten distinct accepted evidence files");
  for (const [slice, item] of Object.entries(corpus)) {
    assert(tracked.has(item.file), `${slice} evidence must be tracked: ${item.file}`);
    execFileSync("git", ["cat-file", "-e", `${item.commit}^{commit}`]);
    const bytes = readFileSync(join(process.cwd(), item.file));
    assert(bytes.length > 0, `${slice} evidence must exist and be nonempty`);
    // Git applies repository clean filters/line-ending policy to worktree bytes.
    const actualBlob = execFileSync("git", ["hash-object", "--path", item.file, "--stdin"], { input: bytes, encoding: "utf8" }).trim();
    const acceptedBlob = execFileSync("git", ["rev-parse", `${item.commit}:${item.file}`], { encoding: "utf8" }).trim();
    if ("blob" in item) equal(acceptedBlob, item.blob, `${slice} accepted checkpoint has the reviewed blob`);
    equal(actualBlob, acceptedBlob, `${slice} file equals its accepted checkpoint`);
    equal(execFileSync("git", ["rev-parse", `HEAD:${item.file}`], { encoding: "utf8" }).trim(), acceptedBlob, `${slice} HEAD evidence remains accepted`);
    evidenceText.set(item.file, bytes.toString("utf8"));
    if ("requiredTokens" in item) for (const token of item.requiredTokens) assert(bytes.toString("utf8").toLowerCase().includes(token.toLowerCase()), `${slice} required correction evidence exists: ${token}`);
  }
});

test("MR2 - Ledger structural integrity", () => {
  assert(migrationRiskLedger.length > 0, "ledger nonempty");
  equal(new Set(migrationRiskLedger.map(risk => risk.id)).size, migrationRiskLedger.length, "unique IDs");
  equal(new Set(migrationRiskLedger.map(risk => risk.title.trim().toLowerCase())).size, migrationRiskLedger.length, "unique titles");
  for (const [index, risk] of migrationRiskLedger.entries()) {
    equal(risk.id, `MR-${String(index + 1).padStart(2, "0")}`, "stable sequential IDs in authored consequence order");
    for (const field of ["title", "currentBehavior", "migrationHazard", "acceptanceConstraint"] as const) assert(risk[field].trim().length > 0, `${risk.id}/${field} nonempty`);
    assert(severities.includes(risk.severity) && riskClasses.includes(risk.riskClass), `${risk.id} bounded severity/class`);
    assert([E, S, "MIXED"].includes(risk.evidenceStrength), `${risk.id} bounded evidence strength`);
    assert(risk.evidenceRefs.length > 0 && risk.affectedSlices.length > 0, `${risk.id} evidence and exposure nonempty`);
    equal(new Set(risk.affectedSlices).size, risk.affectedSlices.length, `${risk.id} unique affected slices`);
    assert(risk.affectedSlices.every(slice => futureSlices.includes(slice)), `${risk.id} future slice in BS1-BS12`);
    assert(risk.coverageDomains.length > 0 && risk.coverageDomains.every(domain => domains.includes(domain)), `${risk.id} bounded domain coverage`);
    assert((risk.criticalEvidence ?? []).every(name => criticalNames.includes(name)), `${risk.id} bounded critical coverage`);
    assert((risk.relatedRisks ?? []).every(id => id !== risk.id && migrationRiskLedger.some(other => other.id === id)), `${risk.id} valid related risks`);
    if (risk.severity === "BLOCKER") assert(risk.acceptanceConstraint.trim(), `${risk.id} BLOCKER constraint`);
  }
});

test("MR3 - Evidence binding", () => {
  for (const risk of migrationRiskLedger) {
    const types = new Set<EvidenceType>();
    const bindings = new Set<string>();
    for (const item of risk.evidenceRefs) {
      assert(Object.hasOwn(corpus, item.slice), `${risk.id} accepted evidence slice`);
      equal(item.file, corpus[item.slice].file, `${risk.id} accepted slice/file pairing`);
      assert(tracked.has(item.file) && evidenceText.has(item.file), `${risk.id} tracked accepted file`);
      assert(item.token.trim().length >= 8, `${risk.id} distinctive nonempty test/group/finding token`);
      assert(evidenceText.get(item.file)!.includes(item.token), `${risk.id} evidence token exists: ${item.token}`);
      assert([E, S].includes(item.evidence), `${risk.id} accepted evidence type`);
      const binding = JSON.stringify(item);
      assert(!bindings.has(binding), `${risk.id} no duplicate evidence reference`); bindings.add(binding); types.add(item.evidence);
    }
    equal(risk.evidenceStrength, types.size === 2 ? "MIXED" : [...types][0], `${risk.id} strength follows material evidence types, not ref count`);
  }
});

test("MR4 - Severity ordering", () => {
  let previous = -1;
  for (const risk of migrationRiskLedger) {
    const rank = severities.indexOf(risk.severity);
    assert(rank >= previous, `${risk.id} monotonic BLOCKER -> MAJOR -> MINOR`); previous = rank;
  }
  // Within severity the authored order is by consequence, never title or ref count.
});
test("MR5 - Identity coverage", () => {
  covered("canonical Review identity", "BS0.6", "I13 - current tracked source has no single persistent Review identity owner");
  covered("canonical Review identity", "BS0.6", "I12 - deterministic merge/split matrix");
  covered("canonical Review identity", "BS0.9", 'test("RA5"');
});
test("MR6 - Human Decision coverage", () => {
  covered("Human Decision authority", "BS0.5", "H3 - distinct PRs collide");
  for (const token of ["H5 - ledger applicability", "H6 - equal head keeps", "H7 - unavailable referenced evidence", "H8 - reaffirmation copies authority", "H10 - headless recording"]) covered("Human Decision authority", "BS0.5", token);
  covered("Human Decision authority", "BS0.9", 'test("RA7"');
});
test("MR7 - Temporal/replay coverage", () => {
  for (const token of ["T3 - disappearance is surfaced as cleared", "T4 - Evidence identity changes", "T5 - proposition continuity", "T6 - contract recheck accepts unrelated", "T9 - stale Evidence eligibility", "T10 - current temporal outputs are not a Verification Delta"]) covered("temporal/evidence truth", "BS0.4", token);
  covered("replay", "BS0.3", "R6 - verify-run invokes current builders");
  covered("replay", "BS0.3", "R7 - verify-run compares head applicability");
  covered("replay", "BS0.3", "R9 - current exact replay");
  covered("temporal/evidence truth", "BS0.12-C1", "C1 — IR-F01 risk-score polarity through real Workspace adapter");
  covered("replay", "BS0.12-C1", "C2A — IR-F02 generation-time manifest exact");
  covered("replay", "BS0.12-C1", "C2B — IR-F02 separate executed replay authority and bounded comparisons");
});
test("MR8 - GitHub App/provenance coverage", () => {
  for (const token of ["G7 - App completion preserves external PR identity", "G11 - completion after a head update", "G14 - GitHub App persistence does not write browser review authorities", "G12 - two same-head analyses can be admitted"]) covered("GitHub App provenance", "BS0.8", token);
});
test("MR9 - Retention/orphan coverage", () => {
  for (const token of ["R5 - surviving Human Decision reattaches to a distinct PR", "R6 - condition progress survives eviction and reattaches", "R7 - ReviewId-keyed draft survives", "R10 - production limits are exact", "R11 - unequal real retention horizons", "R12 - history has no eviction marker"]) covered("retention/orphans", "BS0.7", token);
});
test("MR10 - Route/cutover coverage", () => {
  for (const token of ['test("RA1"', 'test("RA2"', 'test("RA3"', 'test("RA4"', 'test("RA5"', 'test("RA6"', 'test("RA7"', 'test("RA8"', 'test("RA9"', 'test("RA10"', 'test("RA11"']) covered("route cutover", "BS0.9", token);
});
test("MR11 - Failure-semantics coverage", () => {
  for (const token of ["FS2 - report-history parsing", "FS3 - real adapter unavailable versus empty", "FS5 - workflow and condition failures", "FS6 - ledger helper versus decision service", "FS7 - draft envelope durability", "FS12 - App store safe filesystem failures", "FS16 - bounded current cross-product failure boundary"]) covered("failure semantics", "BS0.10", token);
  covered("failure semantics", "BS0.12-C1", "C3 — IR-F03 injected Storage conditional service behavior");
});
test("MR12 - Analysis/model provenance coverage", () => {
  covered("analysis/model provenance", "BS0.2", "D5 - equivalent Reports");
  covered("analysis/model provenance", "BS0.2", "D6 - a stored Report");
  covered("analysis/model provenance", "BS0.10", "valid model-provided semantic summary used beside malformed fields");
  covered("analysis/model provenance", "BS0.10", "canonical analysisSource fallback");
});

// Independent requirements bind critical tags to exact accepted evidence and
// semantic wording; tags alone cannot make an over-merged risk pass coverage.
const criticalRequirements: readonly { name: Critical; slice: AcceptedSlice; token: string; behaviorToken: string; constraintToken: string; evidence?: EvidenceType }[] = [
  { name: "distinct-PR Human Decision collision", slice: "BS0.5", token: "H3 - distinct PRs collide", behaviorToken: "intrinsic", constraintToken: "Distinct pull requests" },
  { name: "App real PR versus Report PR 0", slice: "BS0.8", token: "G7 - App completion preserves external PR identity", behaviorToken: "PR 0", constraintToken: "sentinel" },
  { name: "mixed HEAD_A/HEAD_B completion provenance", slice: "BS0.8", token: "G11 - completion after a head update", behaviorToken: "HEAD_A/HEAD_B", constraintToken: "coherent revision" },
  { name: "disappearing finding", slice: "BS0.4", token: "T3 - disappearance is surfaced as cleared", behaviorToken: "no independent resolution proof", constraintToken: "must not establish resolution" },
  { name: "replay current-code limitation", slice: "BS0.3", token: "R6 - verify-run invokes current builders", behaviorToken: "current builders", constraintToken: "current-code execution" },
  { name: "orphan reattachment", slice: "BS0.7", token: "R6 - condition progress survives eviction and reattaches", behaviorToken: "reattach", constraintToken: "reattachment" },
  { name: "failed does not mean rollback", slice: "BS0.10", token: "FS5 - workflow and condition failures", behaviorToken: "authoritative write-then-throw", constraintToken: "Failed does not mean rollback" },
  { name: "destructive Report-history cleanup", slice: "BS0.10", token: "read failure removes previously valid bytes", behaviorToken: "useful persisted bytes", constraintToken: "destructive cleanup" },
  { name: "comment publishing/report_generation_failure mismatch", slice: "BS0.10", token: "leave publishing plus report_generation_failure if failure persistence succeeds", behaviorToken: "conditional on failure persistence succeeding", constraintToken: "comment publishing outcome" },
  { name: "risk-score polarity under legacy improved", slice: "BS0.12-C1", token: "C1 — IR-F01 risk-score polarity through real Workspace adapter", behaviorToken: "Report.verdict.riskScore 10 -> 20", constraintToken: "contributing dimensions and their polarity", evidence: E },
  { name: "manifest exact versus replay execution", slice: "BS0.12-C1", token: "C2A — IR-F02 generation-time manifest exact", behaviorToken: "generation-time manifest reproducibility exact without executed replay verification", constraintToken: "Manifest exact must not imply replay was executed", evidence: E },
  { name: "replay exact versus complete historical verification basis", slice: "BS0.12-C1", token: "C2B — IR-F02 separate executed replay authority and bounded comparisons", behaviorToken: "Executed replay exact does not establish complete historical verification-basis reproduction", constraintToken: "Manifest exact, executed replay result and historical verification basis must remain separate authorities", evidence: S },
  { name: "injected Storage evidence is conditional", slice: "BS0.12-C1", token: "C3 — IR-F03 injected Storage conditional service behavior", behaviorToken: "conditional on supplied Storage behavior", constraintToken: "Injected Storage evidence must remain conditional on supplied Storage behavior", evidence: E },
];
test("MR13 - Critical evidence coverage", () => {
  equal(criticalRequirements.map(item => item.name), criticalNames, "all independently required critical boundaries");
  for (const required of criticalRequirements) assert(migrationRiskLedger.some(risk =>
    risk.criticalEvidence?.includes(required.name) && risk.currentBehavior.includes(required.behaviorToken) && risk.acceptanceConstraint.includes(required.constraintToken) &&
    risk.evidenceRefs.some(item => item.slice === required.slice && item.token === required.token && (required.evidence === undefined || item.evidence === required.evidence))), `critical evidence represented with behavior, constraint and binding: ${required.name}`);
  for (const slice of Object.keys(corpus) as AcceptedSlice[]) assert(refs.some(item => item.slice === slice), `${slice} accepted behavioral slice consumed`);
  for (const domain of domains) assert(migrationRiskLedger.some(risk => risk.coverageDomains.includes(domain)), `${domain} covered`);
});
test("MR14 - No solution-design leakage", () => {
  const deny = [/implement\s+uuids?/i, /\buuidv?7\b/i, /create\s+(?:a\s+)?database\s+table/i, /add\s+(?:a\s+)?review\s+table/i, /use\s+transactions?/i, /rewrite\s+(?:the\s+)?routes?/i, /change\s+(?:the\s+)?key\s+to/i, /\b(?:add|implement|use)\s+(?:a\s+)?new\s+applicability\s+algorithm/i];
  for (const risk of migrationRiskLedger) {
    const text = [risk.title, risk.currentBehavior, risk.migrationHazard, risk.acceptanceConstraint].join("\n");
    assert(deny.every(pattern => !pattern.test(text)), `${risk.id} no bounded solution-language leakage`);
  }
});
test("MR15 - Future-slice mapping sanity", () => {
  // Minimum semantic exposures are independent of the authored mapping. These
  // are boundary judgments using the authorised slice examples, not designs.
  const anchors: readonly { id: string; slices: readonly FutureSlice[] }[] = [
    { id: "MR-01", slices: ["BS2", "BS8"] }, { id: "MR-02", slices: ["BS1", "BS2", "BS3"] },
    { id: "MR-03", slices: ["BS8"] }, { id: "MR-04", slices: ["BS1", "BS7"] }, { id: "MR-05", slices: ["BS7"] },
    { id: "MR-06", slices: ["BS6", "BS7"] }, { id: "MR-07", slices: ["BS6", "BS7"] },
    { id: "MR-08", slices: ["BS1", "BS7"] }, { id: "MR-09", slices: ["BS7"] }, { id: "MR-10", slices: ["BS2", "BS8"] },
    { id: "MR-11", slices: ["BS2", "BS8"] }, { id: "MR-12", slices: ["BS1", "BS6"] }, { id: "MR-13", slices: ["BS2", "BS8"] },
    { id: "MR-14", slices: ["BS2", "BS12"] }, { id: "MR-15", slices: ["BS3", "BS8"] },
    { id: "MR-16", slices: ["BS3", "BS4", "BS5", "BS12"] }, { id: "MR-17", slices: ["BS7", "BS12"] },
    { id: "MR-18", slices: ["BS2", "BS12"] }, { id: "MR-19", slices: ["BS7", "BS12"] }, { id: "MR-20", slices: ["BS1"] },
  ];
  equal(anchors.map(item => item.id), migrationRiskLedger.map(risk => risk.id), "every hazard has an exposure anchor");
  for (const anchor of anchors) {
    const risk = migrationRiskLedger.find(item => item.id === anchor.id)!;
    assert(anchor.slices.every(slice => risk.affectedSlices.includes(slice)), `${risk.id} required semantic exposure`);
    assert(risk.affectedSlices.length < futureSlices.length, `${risk.id} not mechanically attached to every slice`);
  }
  assert(new Set(migrationRiskLedger.map(risk => risk.affectedSlices.join(","))).size > 1, "evidence-specific exposure varies");
});

function counts<T extends string>(values: readonly T[], pick: (risk: MigrationRisk) => T): Record<T, number> {
  return Object.fromEntries(values.map(value => [value, migrationRiskLedger.filter(risk => pick(risk) === value).length])) as Record<T, number>;
}
function summary() {
  return {
    totalRisks: migrationRiskLedger.length,
    severityCounts: counts(severities, risk => risk.severity), riskClassCounts: counts(riskClasses, risk => risk.riskClass),
    evidenceCoverage: Object.fromEntries((Object.keys(corpus) as AcceptedSlice[]).map(slice => [slice, migrationRiskLedger.filter(risk => risk.evidenceRefs.some(item => item.slice === slice)).map(risk => risk.id)])),
    criticalCoverage: Object.fromEntries(criticalNames.map(name => [name, migrationRiskLedger.filter(risk => risk.criticalEvidence?.includes(name)).map(risk => risk.id)])),
    futureSliceExposure: Object.fromEntries(futureSlices.filter(slice => migrationRiskLedger.some(risk => risk.affectedSlices.includes(slice))).map(slice => [slice, migrationRiskLedger.filter(risk => risk.affectedSlices.includes(slice)).map(risk => risk.id)])),
  };
}
function renderLedger(): string {
  const data = summary();
  const lines = ["BS0.11 / BS0.12-C2 Migration-risk ledger (accepted historical and correction evidence synthesis)", `Total risks: ${data.totalRisks}`, `Severity counts: ${JSON.stringify(data.severityCounts)}`, `Risk-class counts: ${JSON.stringify(data.riskClassCounts)}`, ""];
  for (const risk of migrationRiskLedger) {
    lines.push(`${risk.id} | ${risk.severity} | ${risk.riskClass} | ${risk.evidenceStrength} | ${risk.title}`,
      `Current established behavior: ${risk.currentBehavior}`, `Migration hazard: ${risk.migrationHazard}`, `Acceptance constraint: ${risk.acceptanceConstraint}`,
      ...risk.evidenceRefs.map(item => `Evidence: ${item.slice} | ${item.file} | ${item.token} | ${item.evidence}`),
      `Affected slices: ${risk.affectedSlices.join(", ")}`, "");
  }
  lines.push("Top migration boundaries (BLOCKER only)");
  for (const risk of migrationRiskLedger.filter(item => item.severity === "BLOCKER")) lines.push(`${risk.id} | ${risk.title} | ${risk.affectedSlices.join(", ")}`, `Dependent-slice boundary: ${risk.acceptanceConstraint}`);
  lines.push("", "Evidence coverage / critical coverage / future-slice exposure", JSON.stringify(data, null, 2));
  return lines.join("\n") + "\n";
}
test("MR16 - Ledger output / summary integrity", () => {
  const data = summary();
  equal(Object.values(data.severityCounts).reduce((total, count) => total + count, 0), data.totalRisks, "severity count sum");
  equal(Object.values(data.riskClassCounts).reduce((total, count) => total + count, 0), data.totalRisks, "risk-class count sum");
  equal(JSON.parse(JSON.stringify(migrationRiskLedger)), migrationRiskLedger, "machine-readable serializable ledger");
  const output = renderLedger(); const [ranked, top] = output.split("Top migration boundaries (BLOCKER only)\n");
  assert(top, "top boundaries section exists");
  const topEntries = top.split("Evidence coverage / critical coverage / future-slice exposure")[0];
  let offset = -1;
  for (const risk of migrationRiskLedger) {
    const position = ranked.indexOf(`${risk.id} | `);
    assert(position > offset, `${risk.id} output preserves rank`); offset = position;
    for (const text of [risk.currentBehavior, risk.migrationHazard, risk.acceptanceConstraint, risk.affectedSlices.join(", "), ...risk.evidenceRefs.map(item => `${item.slice} | ${item.file} | ${item.token} | ${item.evidence}`)]) assert(ranked.includes(text), `${risk.id} output complete`);
    equal(topEntries.includes(`${risk.id} | `), risk.severity === "BLOCKER", `${risk.id} top section BLOCKER only`);
  }
});

test("MR17 - Correction risk and authority invariants", () => {
  equal(summary().totalRisks, 20, "C2 preserves total risk count");
  equal(summary().severityCounts, { BLOCKER: 12, MAJOR: 7, MINOR: 1 }, "C2 preserves severity counts");
  for (const id of ["MR-06", "MR-09", "MR-11"]) equal(migrationRiskLedger.find(risk => risk.id === id)?.severity, "BLOCKER", `${id} correction keeps severity`);
  equal(migrationRiskLedger.filter(risk => risk.evidenceRefs.some(item => item.slice === "BS0.12-C1")).map(risk => risk.id), ["MR-06", "MR-09", "MR-11"], "correction evidence extends existing adjudicated risks only");
  const correction = evidenceText.get(corpus["BS0.12-C1"].file)!;
  assert(correction.includes("Thrown/rejected failure signals differ from structured returned failure results"), "accepted matrix interpretation distinguishes failure signals and returned results");
  assert(correction.includes("a C1 pass cannot close IR-F04"), "correction acceptance does not close external App execution evidence");
});

let passed = 0;
for (const check of checks) {
  try { check.run(); passed++; process.stdout.write(`PASS ${check.name}\n`); }
  catch (error) { process.stderr.write(`FAIL ${check.name}: ${error instanceof Error ? error.stack : String(error)}\n`); process.exitCode = 1; break; }
}
process.stdout.write(`BS0.11 / BS0.12-C2 migration-risk ledger: ${passed}/${checks.length} grouped checks passed\n`);
if (passed === checks.length) process.stdout.write(renderLedger());
