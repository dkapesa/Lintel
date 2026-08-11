"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  REVIEW_POLICY_PROFILES,
  policyGateSummary,
  type PolicyApplicability,
  type PolicyCapability,
  type PolicyCategory,
  type PolicyExecutionType,
  type ReviewPolicyProfile,
} from "../../../lib/review-policies";
import { reviewProfileLabel } from "../../../lib/review-profiles";
import styles from "../../r4f5-governance.module.css";

type CategoryFilter = "all" | PolicyCategory;
type ExecutionFilter = "all" | PolicyExecutionType;
type ApplicabilityFilter = "all" | PolicyApplicability;
type CapabilityFilter = "all" | PolicyCapability;

const CATEGORY_OPTIONS = [...new Set(REVIEW_POLICY_PROFILES.map((policy) => policy.category))].sort();

const EXECUTION_OPTIONS: Array<{ value: ExecutionFilter; label: string }> = [
  { value: "all", label: "All execution types" },
  { value: "Deterministic", label: "Deterministic" },
  { value: "Model-assisted", label: "Model-assisted" },
  { value: "Mixed", label: "Mixed" },
];

const APPLICABILITY_OPTIONS: Array<{ value: ApplicabilityFilter; label: string }> = [
  { value: "all", label: "All applicability" },
  { value: "current-review", label: "Current review" },
  { value: "future-reviews", label: "Future reviews" },
  { value: "repository-scoped", label: "Repository-scoped" },
  { value: "preview-only", label: "Preview only" },
];

const CAPABILITY_OPTIONS: Array<{ value: CapabilityFilter; label: string }> = [
  { value: "all", label: "All capability states" },
  { value: "Available at intake", label: "Available at intake" },
  { value: "Preview only", label: "Preview only" },
  { value: "Unavailable", label: "Unavailable" },
];

function stateToken(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}

function policyMatches(
  policy: ReviewPolicyProfile,
  query: string,
  category: CategoryFilter,
  execution: ExecutionFilter,
  applicability: ApplicabilityFilter,
  capability: CapabilityFilter,
) {
  if (category !== "all" && policy.category !== category) return false;
  if (execution !== "all" && policy.executionType !== execution) return false;
  if (applicability !== "all" && !policy.applicability.includes(applicability)) return false;
  if (capability !== "all" && policy.capability !== capability) return false;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    policy.id,
    policy.label,
    policy.category,
    policy.provenance,
    policy.description,
    policy.bestFor,
    policy.repositoryApplicability,
    ...policy.intakeProfileIds.map(reviewProfileLabel),
  ].some((value) => value.toLowerCase().includes(normalized));
}

function PolicyDetail({ policy, headingRef }: { policy: ReviewPolicyProfile; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const mappedProfiles = policy.intakeProfileIds.map(reviewProfileLabel);
  return (
    <article className={styles.detailPanel} id="policy-detail" aria-labelledby="policy-detail-title">
      <header className={styles.detailHeader}>
        <div className={styles.detailHeaderTop}>
          <span className={styles.eyebrow}>{policy.category} · v{policy.version}</span>
          <span className={styles.stateBadge} data-state={stateToken(policy.capability)}>{policy.capability}</span>
        </div>
        <h2 id="policy-detail-title" ref={headingRef} tabIndex={-1}>{policy.label}</h2>
        <p>{policy.description}</p>
      </header>

      <section className={styles.detailSection} aria-labelledby="definition-title">
        <div className={styles.sectionHeader}>
          <h3 id="definition-title">Exact definition</h3>
          <p>Identity and provenance come from the bundled policy/profile contract; this route does not fetch or generate templates.</p>
        </div>
        <dl className={styles.factList}>
          <div><dt>Stable identifier</dt><dd className={styles.technical}>{policy.id}</dd></div>
          <div><dt>Version</dt><dd className={styles.technical}>{policy.version}</dd></div>
          <div><dt>Provenance</dt><dd>{policy.provenance}</dd></div>
          <div><dt>Category</dt><dd>{policy.category}</dd></div>
          <div><dt>Execution</dt><dd>{policy.executionType}</dd></div>
          <div><dt>Intake mapping</dt><dd>{mappedProfiles.length > 0 ? mappedProfiles.join(" · ") : "No current New Review profile"}</dd></div>
        </dl>
        <div className={styles.explanationBlock}>
          <strong>Policy intent</strong>
          <p>{policy.reviewIntent}</p>
        </div>
      </section>

      <section className={styles.detailSection} aria-labelledby="checks-title">
        <div className={styles.sectionHeader}>
          <h3 id="checks-title">Deterministic checks</h3>
          <p>{policyGateSummary(policy)}. Levels describe review expectation, not repository enforcement.</p>
        </div>
        <ul className={styles.checkList}>
          {policy.gates.map((gate) => (
            <li key={gate.label}>
              <div>
                <strong>{gate.label}</strong>
                <p>{gate.description}</p>
              </div>
              <span className={styles.levelBadge} data-level={gate.level.toLowerCase()}>{gate.level}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.detailSection} aria-labelledby="model-boundary-title">
        <div className={styles.sectionHeader}>
          <h3 id="model-boundary-title">Model-assisted boundary</h3>
        </div>
        <div className={styles.authorityCallout}>
          <strong>{policy.executionType === "Mixed" ? "Mixed does not mean model-controlled" : "No model execution from this template"}</strong>
          <p>{policy.modelAssistedContribution}</p>
        </div>
      </section>

      <section className={styles.detailSection} aria-labelledby="impact-title">
        <div className={styles.sectionHeader}>
          <h3 id="impact-title">Impact preview</h3>
          <p>Explanatory consequences only. No review is run and no state is applied.</p>
        </div>
        <div className={styles.previewGrid}>
          <div><span>Review behaviour</span><strong>Would be checked</strong><p>{policyGateSummary(policy)} across the listed clauses.</p></div>
          <div><span>Expected evidence</span><strong>Evidence remains required</strong><ul>{policy.evidenceExpectations.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><span>Requirements</span><strong>Conditional only</strong><p>{policy.requirementEffect}</p></div>
          <div><span>Merge gates</span><strong>No repository block</strong><p>{policy.mergeGateEffect}</p></div>
          <div><span>Existing records</span><strong>No retroactive effect</strong><p>{policy.currentReviewScope}</p></div>
          <div><span>External systems</span><strong>No external enforcement</strong><p>{policy.enforcementBoundary}</p></div>
        </div>
      </section>

      <section className={styles.detailSection} aria-labelledby="scope-title">
        <div className={styles.sectionHeader}>
          <h3 id="scope-title">Applicability and scope</h3>
        </div>
        <dl className={styles.factList}>
          <div><dt>Repository context</dt><dd>{policy.repositoryApplicability}</dd></div>
          <div><dt>Future reviews</dt><dd>{policy.futureReviewScope}</dd></div>
          <div><dt>Existing review</dt><dd>{policy.currentReviewScope}</dd></div>
          <div><dt>Persistence</dt><dd>{policy.persistenceBoundary}</dd></div>
          <div><dt>Human Decision</dt><dd>{policy.humanDecisionBoundary}</dd></div>
        </dl>
      </section>

      <section className={styles.detailSection} aria-labelledby="unsupported-title">
        <div className={styles.sectionHeader}>
          <h3 id="unsupported-title">Unsupported capabilities</h3>
          <p>These boundaries do not change when this record is inspected or previewed.</p>
        </div>
        <ul className={styles.boundaryList}>
          {policy.unsupportedCapabilities.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className={`${styles.detailSection} ${styles.nextAction}`} aria-labelledby="next-action-title">
        <div>
          <span className={styles.eyebrow}>Truthful next action</span>
          <h3 id="next-action-title">{policy.capability === "Available at intake" ? "Select a mapped review profile at intake" : "Inspection ends here"}</h3>
          <p>{policy.capability === "Available at intake"
            ? `Open New Review and choose ${mappedProfiles.join(" or ")}. This link does not preselect, apply or deploy a policy.`
            : "No Apply or Clone action exists. This template is preview-only and has no current intake mapping or persistence path."}</p>
        </div>
        {policy.capability === "Available at intake" ? <Link className={styles.primaryAction} href="/new">Open New Review</Link> : <span className={styles.neutralBadge}>No supported mutation</span>}
      </section>
    </article>
  );
}

export default function ReviewPoliciesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedPolicyParam = searchParams.get("policy");
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(requestedPolicyParam);
  const selectedPolicy = selectedPolicyId
    ? REVIEW_POLICY_PROFILES.find((policy) => policy.id === selectedPolicyId) ?? null
    : null;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [execution, setExecution] = useState<ExecutionFilter>("all");
  const [applicability, setApplicability] = useState<ApplicabilityFilter>("all");
  const [capability, setCapability] = useState<CapabilityFilter>("all");
  const [selectionAnnouncement, setSelectionAnnouncement] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const policyButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusDetailAfterSelection = useRef(false);
  const restorePolicyFocusId = useRef<string | null>(null);
  const lastPresentationControlRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    setSelectedPolicyId(requestedPolicyParam);
  }, [requestedPolicyParam]);

  const filteredPolicies = useMemo(() => REVIEW_POLICY_PROFILES.filter((policy) => policyMatches(
    policy,
    query,
    category,
    execution,
    applicability,
    capability,
  )), [applicability, capability, category, execution, query]);

  function updatePolicyIdentity(policyId: string | null, replace = false) {
    const params = new URLSearchParams(searchParams.toString());
    if (policyId) params.set("policy", policyId);
    else params.delete("policy");
    const href = `${pathname}${params.size ? `?${params.toString()}` : ""}`;
    setSelectedPolicyId(policyId);
    if (replace) window.history.replaceState(null, "", href);
    else router.push(href, { scroll: false });
  }

  useEffect(() => {
    if (!selectedPolicy || filteredPolicies.some((policy) => policy.id === selectedPolicy.id)) return;
    setSelectionAnnouncement(`${selectedPolicy.label} was cleared because it no longer matches the presentation controls. No replacement policy was selected.`);
    updatePolicyIdentity(null, true);
    const changedControl = lastPresentationControlRef.current;
    window.requestAnimationFrame(() => changedControl?.focus({ preventScroll: true }));
    // The URL update is deliberately presentation-only and leaves the control that changed the result focused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicability, capability, category, execution, query, selectedPolicy]);

  useEffect(() => {
    if (!selectedPolicy || !focusDetailAfterSelection.current) return;
    focusDetailAfterSelection.current = false;
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const frame = window.requestAnimationFrame(() => detailHeadingRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [selectedPolicy]);

  useEffect(() => {
    if (selectedPolicyId || !restorePolicyFocusId.current) return;
    const focusId = restorePolicyFocusId.current;
    restorePolicyFocusId.current = null;
    const frame = window.requestAnimationFrame(() => policyButtonRefs.current.get(focusId)?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [selectedPolicyId]);

  const hasPresentationControls = query !== ""
    || category !== "all"
    || execution !== "all"
    || applicability !== "all"
    || capability !== "all";

  function resetPresentation() {
    setQuery("");
    setCategory("all");
    setExecution("all");
    setApplicability("all");
    setCapability("all");
    setSelectionAnnouncement("Presentation controls reset. Policy capability state was not changed.");
    window.requestAnimationFrame(() => searchRef.current?.focus());
  }

  function selectPolicy(policy: ReviewPolicyProfile) {
    setSelectionAnnouncement(`${policy.label} selected for inspection. No policy was applied.`);
    focusDetailAfterSelection.current = true;
    updatePolicyIdentity(policy.id);
  }

  function backToPolicies() {
    if (!selectedPolicy) return;
    restorePolicyFocusId.current = selectedPolicy.id;
    setSelectionAnnouncement(`Returned to policy records from ${selectedPolicy.label}.`);
    updatePolicyIdentity(null);
  }

  function retainPresentationControl(control: HTMLInputElement | HTMLSelectElement) {
    lastPresentationControlRef.current = control;
    window.requestAnimationFrame(() => control.focus({ preventScroll: true }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.document}>
        <header className={styles.pageHeader}>
          <span className={styles.eyebrow}>Governance inspection</span>
          <h1>Review policies</h1>
          <p>Browse bundled policy/profile definitions, inspect their exact gates and preview bounded consequences without claiming application, deployment or repository authority.</p>
        </header>

        <div className={styles.boundaryBanner} role="note">
          <div>
            <strong>Browse → inspect → preview impact → understand applicability</strong>
            <p>Policy selection is available only through a mapped review profile during New Review. Existing Case Files and Human Decisions are never changed here.</p>
          </div>
          <span className={styles.neutralBadge}>Future reviews only</span>
        </div>

        <section className={styles.filterPanel} aria-labelledby="policy-browse-title">
          <div className={styles.sectionHeader}>
            <h2 id="policy-browse-title">Browse policy records</h2>
            <p>Search and filters change only this presentation. They do not change policy capability, selection at intake or stored reviews.</p>
          </div>
          <div className={styles.filterGrid}>
            <label className={styles.searchField}>
              <span>Search policies</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => {
                  retainPresentationControl(event.currentTarget);
                  setQuery(event.target.value);
                }}
                placeholder="Name, identifier, category or provenance"
              />
            </label>
            <label className={styles.filterField}>
              <span>Category</span>
              <select value={category} onChange={(event) => {
                retainPresentationControl(event.currentTarget);
                setCategory(event.target.value as CategoryFilter);
              }}>
                <option value="all">All categories</option>
                {CATEGORY_OPTIONS.map((option) => <option value={option} key={option}>{option}</option>)}
              </select>
            </label>
            <label className={styles.filterField}>
              <span>Execution</span>
              <select value={execution} onChange={(event) => {
                retainPresentationControl(event.currentTarget);
                setExecution(event.target.value as ExecutionFilter);
              }}>
                {EXECUTION_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className={styles.filterField}>
              <span>Applicability</span>
              <select value={applicability} onChange={(event) => {
                retainPresentationControl(event.currentTarget);
                setApplicability(event.target.value as ApplicabilityFilter);
              }}>
                {APPLICABILITY_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className={styles.filterField}>
              <span>Capability</span>
              <select value={capability} onChange={(event) => {
                retainPresentationControl(event.currentTarget);
                setCapability(event.target.value as CapabilityFilter);
              }}>
                {CAPABILITY_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className={styles.filterStatus}>
            <p>{filteredPolicies.length} of {REVIEW_POLICY_PROFILES.length} represented policy records</p>
            {hasPresentationControls && filteredPolicies.length > 0 ? <button type="button" className={styles.secondaryAction} onClick={resetPresentation}>Reset presentation</button> : null}
          </div>
          <p className={styles.visuallyHidden} aria-live="polite">{filteredPolicies.length} policy {filteredPolicies.length === 1 ? "record" : "records"} match.</p>
          <p className={styles.visuallyHidden} aria-live="polite">{selectionAnnouncement}</p>
        </section>

        <div className={styles.policyLayout} data-mobile-detail={Boolean(selectedPolicyId)}>
          <section className={styles.policyBrowsePane} aria-label="Policy records">
            {filteredPolicies.length > 0 ? (
              <ul className={styles.policyList}>
                {filteredPolicies.map((policy) => (
                  <li key={policy.id}>
                    <button
                      type="button"
                      className={selectedPolicy?.id === policy.id ? `${styles.policyButton} ${styles.policyButtonSelected}` : styles.policyButton}
                      aria-pressed={selectedPolicy?.id === policy.id}
                      aria-controls="policy-detail"
                      ref={(node) => {
                        if (node) policyButtonRefs.current.set(policy.id, node);
                        else policyButtonRefs.current.delete(policy.id);
                      }}
                      onClick={() => selectPolicy(policy)}
                    >
                      <span className={styles.policyIdentity}>
                        <strong>{policy.label}</strong>
                        <span className={styles.technical}>{policy.id} · v{policy.version}</span>
                      </span>
                      <span className={styles.policyMeta}><strong>{policy.category}</strong><span>{policy.executionType}</span></span>
                      <span className={styles.stateBadge} data-state={stateToken(policy.capability)}>{policy.capability}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.eyebrow}>No match</span>
                <h3>No represented policy matches these controls.</h3>
                <p>Search and filters have not changed any policy capability, intake mapping or stored review.</p>
                <button type="button" className={styles.secondaryAction} onClick={resetPresentation}>Reset presentation</button>
              </div>
            )}
          </section>

          <section className={styles.policyDetailPane} aria-label="Selected policy inspection">
            {selectedPolicyId ? <button type="button" className={styles.mobileBack} onClick={backToPolicies}>← Back to policies</button> : null}
            {selectedPolicy ? (
              <PolicyDetail policy={selectedPolicy} headingRef={detailHeadingRef} />
            ) : selectedPolicyId ? (
              <div className={styles.emptyState} id="policy-detail">
                <span className={styles.eyebrow}>Requested identity unavailable</span>
                <h2 tabIndex={-1} ref={detailHeadingRef}>Policy not represented</h2>
                <p>The requested identifier <code>{selectedPolicyId}</code> does not resolve in the bounded bundled record set. No substitute policy was selected.</p>
                <button type="button" className={styles.secondaryAction} onClick={() => updatePolicyIdentity(null)}>Back to policy records</button>
              </div>
            ) : (
              <div className={styles.emptyState} id="policy-detail">
                <span className={styles.eyebrow}>No policy selected</span>
                <h2>Select a record to inspect its definition.</h2>
                <p>Selection is neutral presentation state. It does not apply, clone, persist or enforce a policy.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
