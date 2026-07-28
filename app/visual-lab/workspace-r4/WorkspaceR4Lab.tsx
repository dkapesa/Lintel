"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CommandPalette } from "./components/CommandPalette";
import { ContextualInspector } from "./components/ContextualInspector";
import { HumanDecisionDialog } from "./components/HumanDecisionDialog";
import { LabControls } from "./components/LabControls";
import { ReviewQueue } from "./components/ReviewQueue";
import { WorkspaceSurface } from "./components/WorkspaceSurface";
import {
  CANONICAL_REVIEW,
  FIXTURE_LABEL,
  LAB_STORAGE_KEY,
  REVIEWS,
  labState,
  recordLabel,
} from "./fixtures";
import { Glyph, ShellIcon } from "./icons";
import type {
  DecisionOutcome,
  FixtureVariant,
  LabStateDefinition,
  RequirementRecord,
  ReviewFixture,
  ReviewGroup,
  SelectedObject,
  WorkspaceMode,
} from "./types";
import styles from "./workspace-r4.module.css";

type FocusScope = "queue" | "workspace" | null;
type InspectorPreference = "auto" | "open" | "closed";
type MobileStep = "list" | "review" | "record";

function queryFor(slug: string, capture: boolean, variant?: FixtureVariant) {
  const query = new URLSearchParams();
  query.set("state", slug);
  if (variant && variant !== "canonical") query.set("variant", variant);
  if (capture) query.set("capture", "1");
  return `?${query.toString()}`;
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function visibleControls(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((element) => element.offsetParent !== null && !element.hasAttribute("disabled"));
}

export default function WorkspaceR4Lab({
  initialStateSlug,
  initialVariant,
  capture,
}: {
  initialStateSlug: string;
  initialVariant?: FixtureVariant;
  capture: boolean;
}) {
  const initialDefinition = labState(initialStateSlug);
  const [definition, setDefinition] = useState<LabStateDefinition>(initialDefinition);
  const [variant, setVariant] = useState<FixtureVariant>(initialVariant ?? initialDefinition.variant ?? "canonical");
  const [reviews, setReviews] = useState<ReviewFixture[]>(REVIEWS);
  const [selectedReviewId, setSelectedReviewId] = useState(CANONICAL_REVIEW.id);
  const [mode, setMode] = useState<WorkspaceMode>(initialDefinition.mode ?? "overview");
  const [selected, setSelected] = useState<SelectedObject>(initialDefinition.selected ?? null);
  const [returnToken, setReturnToken] = useState<SelectedObject>(null);
  const [queueCollapsed, setQueueCollapsed] = useState(
    initialDefinition.layout === "queue-collapsed" || initialDefinition.layout === "both-collapsed",
  );
  const [queueOverlayOpen, setQueueOverlayOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<ReviewGroup>>(
    initialDefinition.queueGroupCollapsed ? new Set(["Needs attention"]) : new Set(),
  );
  const [inspectorPreference, setInspectorPreference] = useState<InspectorPreference>(
    initialDefinition.layout === "inspector-collapsed" || initialDefinition.layout === "both-collapsed"
      ? "closed"
      : initialDefinition.inspectorOpen === false
        ? "closed"
        : initialDefinition.inspectorOpen
          ? "open"
          : "auto",
  );
  const [inspectorOpen, setInspectorOpen] = useState(initialDefinition.inspectorOpen !== false);
  const [focusMode, setFocusMode] = useState(initialDefinition.layout === "focus");
  const [mobileStep, setMobileStep] = useState<MobileStep>(
    initialDefinition.layout === "mobile-list" ? "list" : initialDefinition.layout === "mobile-record" ? "record" : "review",
  );
  const [modalOpen, setModalOpen] = useState(Boolean(initialDefinition.modal));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [focusScope, setFocusScope] = useState<FocusScope>(null);
  const [viewportWidth, setViewportWidth] = useState(1600);
  const [removed, setRemoved] = useState(initialDefinition.slug === "selected-object-removed");
  const [requirementStatuses, setRequirementStatuses] = useState<Record<string, RequirementRecord["status"]>>({});
  const [taskStatuses, setTaskStatuses] = useState<Record<string, RequirementRecord["taskStatus"]>>({});
  const [decisionOutcome, setDecisionOutcome] = useState<DecisionOutcome | null>(null);
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");
  const workspaceScrollRef = useRef<HTMLElement | null>(null);
  const scrollPositions = useRef<Record<WorkspaceMode, number>>({ overview: 0, change: 0, evidence: 0, requirements: 0, history: 0 });
  const decisionTriggerRef = useRef<HTMLElement | null>(null);
  const paletteTriggerRef = useRef<HTMLElement | null>(null);
  const drawerTriggerRef = useRef<HTMLElement | null>(null);
  const queueTriggerRef = useRef<HTMLElement | null>(null);

  const review = reviews.find((item) => item.id === selectedReviewId) ?? CANONICAL_REVIEW;
  const narrow = viewportWidth < 1280;
  const mobile = viewportWidth < 640;
  const authorityUnavailable = variant === "unavailable";
  const authorityLoading = definition.slug === "loading";
  const queuePresentationCollapsed = narrow ? !queueOverlayOpen && !(mobile && mobileStep === "list") : queueCollapsed;
  const drawerOpen = narrow && inspectorOpen && Boolean(selected || definition.selected?.kind === "readiness");

  const announce = useCallback((message: string, assertive = false) => {
    if (assertive) {
      setAssertiveMessage("");
      window.requestAnimationFrame(() => setAssertiveMessage(message));
    } else {
      setPoliteMessage("");
      window.requestAnimationFrame(() => setPoliteMessage(message));
    }
  }, []);

  const persistLayout = useCallback((next: { queueCollapsed?: boolean; inspector?: InspectorPreference; focusMode?: boolean }) => {
    if (capture) return;
    try {
      const current = JSON.parse(sessionStorage.getItem(LAB_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
      sessionStorage.setItem(LAB_STORAGE_KEY, JSON.stringify({ ...current, ...next }));
    } catch {
      // The laboratory remains entirely usable in memory when session storage is unavailable.
    }
  }, [capture]);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!capture) return;
    const hideDevelopmentPortal = () => {
      document.querySelectorAll<HTMLElement>("nextjs-portal").forEach((portal) => {
        portal.style.display = "none";
      });
    };
    hideDevelopmentPortal();
    const observer = new MutationObserver(hideDevelopmentPortal);
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
  }, [capture]);

  useEffect(() => {
    if (capture || definition.slug !== "overview") return;
    try {
      const stored = JSON.parse(sessionStorage.getItem(LAB_STORAGE_KEY) ?? "{}") as { queueCollapsed?: boolean; inspector?: InspectorPreference; focusMode?: boolean };
      if (typeof stored.queueCollapsed === "boolean") setQueueCollapsed(stored.queueCollapsed);
      if (stored.inspector) setInspectorPreference(stored.inspector);
      if (typeof stored.focusMode === "boolean") setFocusMode(stored.focusMode);
    } catch {
      // In-memory defaults are authoritative when the lab key cannot be read.
    }
  }, [capture, definition.slug]);

  useEffect(() => {
    if (inspectorPreference === "open") setInspectorOpen(true);
    else if (inspectorPreference === "closed") setInspectorOpen(false);
    else setInspectorOpen(viewportWidth >= 1360);
  }, [inspectorPreference, viewportWidth]);

  useEffect(() => {
    if (!capture || !definition.focusedControl) return;
    let target: HTMLElement | null = null;
    const frame = window.requestAnimationFrame(() => {
      const selector = definition.focusedControl === "queue-selected"
        ? '[data-queue-row][aria-pressed="true"]'
        : definition.focusedControl === "queue-unselected"
          ? '[data-queue-row]:not([aria-pressed="true"])'
          : definition.focusedControl === "mode"
            ? '[role="tab"]:not([aria-selected="true"])'
            : '[data-workspace-record]';
      target = document.querySelector<HTMLElement>(selector);
      target?.focus({ preventScroll: true });
      target?.setAttribute("data-lab-focus", "keyboard");
    });
    return () => {
      window.cancelAnimationFrame(frame);
      target?.removeAttribute("data-lab-focus");
    };
  }, [capture, definition.focusedControl, definition.slug, viewportWidth]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      applyDefinition(labState(params.get("state")), false, params.get("variant") as FixtureVariant | null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // applyDefinition is stable across rendered state by design; the listener reads the URL on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyDefinition(next: LabStateDefinition, updateUrl = true, explicitVariant?: FixtureVariant | null) {
    const nextVariant = explicitVariant ?? next.variant ?? "canonical";
    setDefinition(next);
    setVariant(nextVariant);
    setMode(next.mode ?? "overview");
    setSelected(next.selected ?? null);
    setReturnToken(null);
    setQueueCollapsed(next.layout === "queue-collapsed" || next.layout === "both-collapsed");
    setQueueOverlayOpen(false);
    setCollapsedGroups(next.queueGroupCollapsed ? new Set(["Needs attention"]) : new Set());
    setInspectorPreference(next.layout === "inspector-collapsed" || next.layout === "both-collapsed" || next.inspectorOpen === false ? "closed" : next.inspectorOpen ? "open" : "auto");
    setInspectorOpen(next.layout !== "inspector-collapsed" && next.layout !== "both-collapsed" && next.inspectorOpen !== false);
    setFocusMode(next.layout === "focus");
    setMobileStep(next.layout === "mobile-list" ? "list" : next.layout === "mobile-record" ? "record" : "review");
    setModalOpen(Boolean(next.modal));
    setPaletteOpen(false);
    setRemoved(next.slug === "selected-object-removed");
    setRequirementStatuses({});
    setTaskStatuses({});
    setDecisionOutcome(null);
    if (workspaceScrollRef.current) workspaceScrollRef.current.scrollTop = 0;
    if (updateUrl) window.history.pushState({}, "", queryFor(next.slug, capture, nextVariant));
    announce(`Loaded controlled state: ${next.label}.`);
  }

  function updateVariant(nextVariant: FixtureVariant) {
    setVariant(nextVariant);
    setSelected(null);
    setReturnToken(null);
    window.history.replaceState({}, "", queryFor(definition.slug, capture, nextVariant));
    announce(`Loaded fixture variant: ${nextVariant.replaceAll("-", " ")}.`);
  }

  function resetLaboratory() {
    try { sessionStorage.removeItem(LAB_STORAGE_KEY); } catch { /* in-memory reset still succeeds */ }
    setReviews(REVIEWS);
    setSelectedReviewId(CANONICAL_REVIEW.id);
    applyDefinition(labState("overview"));
    announce("Laboratory reset to the canonical Overview.");
  }

  function selectReview(id: string) {
    const next = reviews.find((item) => item.id === id);
    if (!next) return;
    if (authorityUnavailable) {
      const overview = labState("overview");
      setDefinition(overview);
      setVariant("canonical");
      window.history.pushState({}, "", queryFor(overview.slug, capture, "canonical"));
    }
    setSelectedReviewId(id);
    setSelected(null);
    setReturnToken(null);
    setMode("overview");
    setMobileStep("review");
    setQueueOverlayOpen(false);
    if (narrow) window.requestAnimationFrame(() => document.getElementById("workspace-primary")?.focus());
    announce(`${next.repository}, PR ${next.pr}, ${next.title}. Lintel recommendation ${next.recommendation}.`);
  }

  function switchMode(nextMode: WorkspaceMode) {
    scrollPositions.current[mode] = workspaceScrollRef.current?.scrollTop ?? 0;
    setMode(nextMode);
    const exactSurvives =
      selected &&
      ((nextMode === "evidence" && ["finding", "evidence", "proof"].includes(selected.kind)) ||
        (nextMode === "change" && selected.kind === "change") ||
        (nextMode === "requirements" && selected.kind === "requirement") ||
        (nextMode === "history" && ["run", "diff"].includes(selected.kind)));
    if (!exactSurvives && selected) {
      setReturnToken(selected);
      setSelected(null);
    }
    window.requestAnimationFrame(() => {
      if (workspaceScrollRef.current) workspaceScrollRef.current.scrollTop = scrollPositions.current[nextMode] ?? 0;
      document.getElementById(`workspace-${nextMode}-heading`)?.focus({ preventScroll: true });
    });
    announce(`${nextMode[0].toUpperCase() + nextMode.slice(1)} mode activated.`);
  }

  function modeForSelection(next: NonNullable<SelectedObject>): WorkspaceMode {
    if (["finding", "evidence", "proof"].includes(next.kind)) return "evidence";
    if (next.kind === "change") return "change";
    if (next.kind === "requirement") return "requirements";
    if (["run", "diff"].includes(next.kind)) return "history";
    return mode;
  }

  function selectObject(next: SelectedObject) {
    if (!next) {
      setSelected(null);
      setReturnToken(null);
      return;
    }
    if (selected && selected.id !== next.id) setReturnToken(selected);
    const destination = modeForSelection(next);
    setSelected(next);
    setMode(destination);
    if (mobile) setMobileStep("record");
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-record-id="${CSS.escape(next.id)}"]`)?.focus({ preventScroll: false });
    });
    announce(`${next.kind}, ${recordLabel(next.id)}, ${destination} mode.`);
  }

  function contextualBack() {
    if (!returnToken) return;
    const target = returnToken;
    setSelected(target);
    setReturnToken(null);
    setMode(modeForSelection(target));
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-record-id="${CSS.escape(target.id)}"]`)?.focus());
    announce(`Returned to ${target.kind}, ${recordLabel(target.id)}.`);
  }

  function toggleQueue(trigger?: HTMLElement) {
    if (narrow) {
      const next = !queueOverlayOpen;
      if (next && trigger) queueTriggerRef.current = trigger;
      setQueueOverlayOpen(next);
      announce(next ? "Review queue opened." : "Review queue closed.");
      window.requestAnimationFrame(() => {
        if (next) document.querySelector<HTMLElement>('#review-queue-anchor input[type="search"]')?.focus();
        else queueTriggerRef.current?.focus();
      });
      return;
    }
    setQueueCollapsed((current) => {
      persistLayout({ queueCollapsed: !current });
      announce(!current ? "Review queue collapsed." : "Review queue restored.");
      return !current;
    });
  }

  function toggleInspector(trigger?: HTMLElement) {
    if (trigger) drawerTriggerRef.current = trigger;
    const next = !inspectorOpen;
    setInspectorPreference(next ? "open" : "closed");
    setInspectorOpen(next);
    persistLayout({ inspector: next ? "open" : "closed" });
    announce(next ? "Contextual Inspector restored." : "Contextual Inspector collapsed.");
    if (next && narrow) window.requestAnimationFrame(() => document.querySelector<HTMLElement>('aside[aria-label="Contextual Inspector"]')?.focus());
    if (!next) window.requestAnimationFrame(() => drawerTriggerRef.current?.focus());
  }

  function toggleFocusMode() {
    setFocusMode((current) => {
      persistLayout({ focusMode: !current });
      announce(!current ? "Focus mode entered. Supporting regions are temporarily suppressed." : "Focus mode exited. Supporting-region preferences restored.");
      return !current;
    });
  }

  function showQueueFromFocus(trigger?: HTMLElement) {
    setFocusMode(false);
    persistLayout({ focusMode: false, queueCollapsed: false });
    if (narrow) {
      if (trigger) queueTriggerRef.current = trigger;
      setQueueOverlayOpen(true);
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#review-queue-anchor input[type="search"]')?.focus());
    } else {
      setQueueCollapsed(false);
      window.requestAnimationFrame(() => document.getElementById("review-queue-anchor")?.focus());
    }
    announce("Focus mode exited. Review queue shown.");
  }

  function showInspectorFromFocus(trigger?: HTMLElement) {
    setFocusMode(false);
    persistLayout({ focusMode: false, inspector: "open" });
    if (trigger) drawerTriggerRef.current = trigger;
    setInspectorPreference("open");
    setInspectorOpen(true);
    if (narrow) window.requestAnimationFrame(() => document.querySelector<HTMLElement>('aside[aria-label="Contextual Inspector"]')?.focus());
    announce("Focus mode exited. Contextual Inspector shown.");
  }

  function openReadiness(trigger?: HTMLElement) {
    if (authorityUnavailable || authorityLoading) {
      announce(authorityUnavailable ? "Decision readiness is unavailable because no current review detail exists." : "Decision readiness is withheld while the current projection loads.", true);
      return;
    }
    if (trigger) drawerTriggerRef.current = trigger;
    setSelected({ kind: "readiness", id: "readiness-blocker-01" });
    setInspectorPreference("open");
    setInspectorOpen(true);
    if (mobile) setMobileStep("record");
    announce("Decision readiness opened. Four blockers, two missing proof records, Human Decision pending.");
  }

  function openDecision(trigger?: HTMLElement) {
    if (authorityUnavailable || authorityLoading) {
      announce(authorityUnavailable ? "Human Decision is unavailable because no current review detail exists." : "Human Decision is unavailable until the current projection finishes loading.", true);
      return;
    }
    if (trigger) decisionTriggerRef.current = trigger;
    else decisionTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalOpen(true);
    announce("Human Decision dialog opened. No outcome is selected unless the controlled state requests one.");
  }

  function toggleRequirement(id: string) {
    if (definition.slug === "condition-write-failure") {
      announce("Condition progress was not saved. The previous state remains visible.", true);
      return;
    }
    if (definition.slug === "condition-refresh-failure") {
      announce("Condition progress is stored locally, but the controlled projection did not refresh.", true);
      return;
    }
    const base = REQUIREMENT_STATUS(id, requirementStatuses);
    const next = base === "cleared" ? "open" : "cleared";
    setRequirementStatuses((current) => ({ ...current, [id]: next }));
    announce(`${recordLabel(id)} ${next === "cleared" ? "cleared" : "reopened"}. Condition progress remains separate from proof and Human Decision.`);
  }

  function updateTask(id: string, task: RequirementRecord["taskStatus"]) {
    setTaskStatuses((current) => ({ ...current, [id]: task }));
    announce(`Local task progress for ${recordLabel(id)} changed to ${task}. Requirement and proof state did not change.`);
  }

  function regroupSelected() {
    setReviews((current) => current.map((item) => item.id === selectedReviewId ? { ...item, group: item.group === "Needs attention" ? "In review" : "Needs attention", movement: item.movement === "regressed" ? "mixed" : "regressed" } : item));
    announce(`${review.repository}, PR ${review.pr}, regrouped while stable selection was preserved.`);
  }

  function toggleGroup(group: ReviewGroup) {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  }

  function returnToReviewList() {
    if (mobile) setMobileStep("list");
    if (narrow && !mobile) {
      setQueueOverlayOpen(true);
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#review-queue-anchor input[type="search"]')?.focus());
    } else if (!mobile) {
      setQueueCollapsed(false);
      window.requestAnimationFrame(() => document.getElementById("review-queue-anchor")?.focus());
    }
    announce("Review list opened. No substitute review was selected.");
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isEditable(event.target)) return;
      if (modalOpen || paletteOpen) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        paletteTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setPaletteOpen(true);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (event.key === "Enter" && focusScope) {
        const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (active?.matches(focusScope === "queue" ? "[data-queue-row]" : "[data-workspace-record]")) {
          event.preventDefault();
          active.click();
          return;
        }
      }
      if ((key === "j" || key === "k") && focusScope) {
        const controls = visibleControls(focusScope === "queue" ? "[data-queue-row]" : "[data-workspace-record]");
        if (!controls.length) return;
        event.preventDefault();
        const current = controls.indexOf(document.activeElement as HTMLElement);
        const next = key === "j" ? Math.min(controls.length - 1, current < 0 ? 0 : current + 1) : Math.max(0, current < 0 ? controls.length - 1 : current - 1);
        controls[next]?.focus();
        return;
      }
      if (key === "e") { event.preventDefault(); switchMode("evidence"); }
      else if (key === "r") { event.preventDefault(); switchMode("requirements"); }
      else if (key === "h") { event.preventDefault(); switchMode("history"); }
      else if (key === "d") { event.preventDefault(); openReadiness(); }
      else if (event.key === "[") { event.preventDefault(); toggleQueue(); }
      else if (event.key === "]") { event.preventDefault(); toggleInspector(); }
      else if (event.key === "Escape") {
        if (drawerOpen) { event.preventDefault(); toggleInspector(); }
        else if (queueOverlayOpen) { event.preventDefault(); toggleQueue(); }
        else if (selected) { event.preventDefault(); setSelected(null); setReturnToken(null); announce("Selected object cleared. Decision-readiness guidance restored."); }
        else if (focusMode) { event.preventDefault(); toggleFocusMode(); }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [authorityLoading, authorityUnavailable, drawerOpen, focusMode, focusScope, inspectorOpen, mobile, mode, modalOpen, narrow, paletteOpen, queueOverlayOpen, selected]);

  useEffect(() => {
    if (!drawerOpen) return;
    function contain(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const owner = document.querySelector<HTMLElement>('aside[aria-label="Contextual Inspector"]');
      const controls = Array.from(owner?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []).filter((item) => item.offsetParent !== null);
      if (!controls.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", contain);
    return () => window.removeEventListener("keydown", contain);
  }, [drawerOpen]);

  useEffect(() => {
    if (!queueOverlayOpen) return;
    function containQueue(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const owner = document.getElementById("review-queue-anchor");
      const controls = Array.from(owner?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []).filter((item) => item.offsetParent !== null);
      if (!controls.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", containQueue);
    return () => window.removeEventListener("keydown", containQueue);
  }, [queueOverlayOpen]);

  const rootLayout = focusMode ? "focus" : definition.layout === "focus" ? "default" : definition.layout ?? "default";
  const initialOutcome = definition.outcome;
  const modalTransaction = definition.transaction;
  const productInert = modalOpen || paletteOpen;

  function focusRegion(id: "workspace-primary" | "review-queue-anchor") {
    if (id === "review-queue-anchor" && narrow && !(mobile && mobileStep === "list")) {
      setQueueOverlayOpen(true);
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#review-queue-anchor input[type="search"]')?.focus());
      return;
    }
    const target = document.getElementById(id);
    if (!(target instanceof HTMLElement)) return;
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}#${id}`);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  }

  return (
    <div
      className={styles.labPage}
      data-capture={capture ? "true" : "false"}
      data-layout={rootLayout}
      data-mobile-step={mobileStep}
      data-queue-overlay={queueOverlayOpen ? "open" : "closed"}
      data-inspector-drawer={drawerOpen ? "open" : "closed"}
      data-queue-collapsed={queuePresentationCollapsed ? "true" : "false"}
      data-inspector-open={inspectorOpen ? "true" : "false"}
      data-authority={authorityUnavailable ? "unavailable" : authorityLoading ? "loading" : "current"}
      data-state={definition.slug}
    >
      <a className={styles.skipLink} href="#workspace-primary" onClick={(event) => { event.preventDefault(); focusRegion("workspace-primary"); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); focusRegion("workspace-primary"); } }}>Skip to Workspace</a>
      <a className={styles.skipLinkQueue} href="#review-queue-anchor" onClick={(event) => { event.preventDefault(); focusRegion("review-queue-anchor"); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); focusRegion("review-queue-anchor"); } }}>Skip to review queue</a>
      <div className={styles.fixtureBar} role="status">
        <span className={styles.fixtureMark}>L</span>
        <span>{FIXTURE_LABEL}</span>
        <span className={styles.fixtureState}>{definition.slug}</span>
      </div>

      {!capture && !modalOpen && !paletteOpen ? <LabControls current={definition} variant={variant} onState={(slug) => applyDefinition(labState(slug))} onVariant={updateVariant} onReset={resetLaboratory} /> : null}

      <div className={styles.productShell} inert={productInert ? true : undefined} aria-hidden={modalOpen || paletteOpen ? true : undefined}>
        <nav className={styles.rail} aria-label="Product areas">
          <div className={styles.lintelMark} aria-label="Lintel"><span>L</span></div>
          <div className={styles.railAreas}>
            {[
              ["Reviews", "review"],
              ["Operations", "operations"],
              ["Governance", "governance"],
              ["Integrations", "integrations"],
              ["System", "system"],
            ].map(([label, icon], index) => (
              <button key={label} type="button" className={index === 0 ? styles.railActive : ""} aria-current={index === 0 ? "page" : undefined} aria-label={label} title={index === 3 ? `${label} · planned R4F route, not current production` : label}>
                <ShellIcon name={icon as "review" | "operations" | "governance" | "integrations" | "system"} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button type="button" className={styles.railCommand} aria-label="Open command palette" title="Command palette (Ctrl/Cmd K)" onClick={(event) => { paletteTriggerRef.current = event.currentTarget; setPaletteOpen(true); }}><Glyph name="command" size={18} /></button>
          <button type="button" className={styles.railLocal} aria-label="Local fixture environment" title="Local controlled fixture"><span>LF</span></button>
        </nav>

        <div id="review-queue-anchor" className={styles.queueAnchor} tabIndex={-1}>
          <ReviewQueue
            key={`${definition.slug}-${definition.filtersSelectedOut ? "out" : "in"}`}
            reviews={reviews}
            selectedId={authorityUnavailable ? "" : selectedReviewId}
            collapsed={queuePresentationCollapsed}
            collapsedGroups={collapsedGroups}
            onToggleCollapsed={() => toggleQueue(document.activeElement instanceof HTMLElement ? document.activeElement : undefined)}
            onToggleGroup={toggleGroup}
            onSelect={selectReview}
            onRegroup={regroupSelected}
            onScope={() => setFocusScope("queue")}
            forcedSelectedOut={definition.filtersSelectedOut}
          />
        </div>

        <WorkspaceSurface
          review={review}
          mode={mode}
          selected={selected}
          variant={variant}
          stateSlug={definition.slug}
          focusMode={focusMode}
          inspectorOpen={inspectorOpen}
          removed={removed}
          requirementStatuses={requirementStatuses}
          onMode={switchMode}
          onSelect={selectObject}
          onOpenDecision={() => openDecision()}
          onReadiness={() => openReadiness()}
          onToggleQueue={() => toggleQueue(document.activeElement instanceof HTMLElement ? document.activeElement : undefined)}
          onToggleInspector={() => toggleInspector(document.activeElement instanceof HTMLElement ? document.activeElement : undefined)}
          onToggleFocus={toggleFocusMode}
          onShowQueue={() => showQueueFromFocus(document.activeElement instanceof HTMLElement ? document.activeElement : undefined)}
          onShowInspector={() => showInspectorFromFocus(document.activeElement instanceof HTMLElement ? document.activeElement : undefined)}
          onBackToList={returnToReviewList}
          onRetryUnavailable={() => announce("Retry completed. The requested stored review is still unavailable; no substitute was selected.", true)}
          onScope={() => setFocusScope("workspace")}
          scrollRef={workspaceScrollRef}
          onScroll={() => { scrollPositions.current[mode] = workspaceScrollRef.current?.scrollTop ?? 0; }}
        />

        <ContextualInspector
          open={inspectorOpen}
          selected={selected}
          returnToken={returnToken}
          variant={variant}
          stateSlug={definition.slug}
          requirementStatuses={requirementStatuses}
          taskStatuses={taskStatuses}
          onClose={() => toggleInspector(document.activeElement instanceof HTMLElement ? document.activeElement : undefined)}
          onSelect={selectObject}
          onBack={contextualBack}
          onToggleRequirement={toggleRequirement}
          onTaskStatus={updateTask}
        />
        {drawerOpen ? <button type="button" className={styles.drawerScrim} aria-label="Close Contextual Inspector" onClick={() => toggleInspector()} /> : null}
        {queueOverlayOpen ? <button type="button" className={styles.drawerScrim} aria-label="Close review queue" onClick={() => toggleQueue()} /> : null}
      </div>

      <HumanDecisionDialog
        key={`${definition.slug}-${modalOpen ? "open" : "closed"}`}
        open={modalOpen}
        review={review}
        variant={variant}
        capture={capture}
        initialOutcome={initialOutcome}
        transaction={modalTransaction}
        onClose={() => setModalOpen(false)}
        onSuccess={(outcome) => {
          setDecisionOutcome(outcome);
          setModalOpen(false);
          announce(`Human Decision recorded: ${outcome.replaceAll("-", " ")}. Applicable to the controlled current head.`);
        }}
        onAnnounce={announce}
        returnFocusRef={decisionTriggerRef}
      />

      <CommandPalette
        open={paletteOpen}
        reviews={reviews}
        onClose={() => setPaletteOpen(false)}
        onReview={selectReview}
        onMode={switchMode}
        onQueue={toggleQueue}
        onInspector={() => toggleInspector()}
        onFocus={toggleFocusMode}
        onReadiness={() => openReadiness()}
        returnFocusRef={paletteTriggerRef}
      />

      <div className={styles.livePolite} aria-live="polite" aria-atomic="true">{decisionOutcome ? `Human Decision ${decisionOutcome.replaceAll("-", " ")} recorded in the controlled laboratory.` : politeMessage}</div>
      <div className={styles.liveAssertive} role="alert" aria-atomic="true">{assertiveMessage}</div>
    </div>
  );
}

function REQUIREMENT_STATUS(id: string, overrides: Record<string, RequirementRecord["status"]>): RequirementRecord["status"] {
  return overrides[id] ?? (id === "requirement-fallback-proof" || id === "requirement-observability" ? "open" : "open");
}
