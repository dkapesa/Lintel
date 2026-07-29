/* R1B.3 — Production Workspace V2 · authoritative relationship assembly.

   Pure, deterministic construction of the four-stage verification graph
   (Change → Observation → Evidence → Requirement) shared by both the real and
   the fixture adapter. It takes source-neutral artifact seeds plus the raw
   canonical relationship references and returns fully-linked view models, with
   every edge represented as an explicit `RelationshipState` rather than an
   ambiguous empty array.

   Truthfulness rules enforced here (r1a §16.10, R1B.3):
     · a link is only ever asserted from an exact, canonical or deterministically
       derivable reference — never from wording similarity or array position;
     · a reference the source recorded but that does not resolve to an in-case
       artifact is surfaced as `unresolved`, never silently dropped;
     · a relationship the report version cannot express is `unavailable` with a
       reason, kept distinct from a genuinely absent (`none`) relationship;
     · both directions of every symmetric edge are inverted from ONE canonical
       source of truth, so finding↔evidence, evidence↔requirement and
       change↔evidence can never disagree with themselves.

   No React, no DOM, no storage, no domain-module imports — only view-model
   types. Everything returned is serialisable across the server → client seam. */

import type {
  ChangedFileView,
  ConditionProgressCapability,
  EvidenceClass,
  EvidenceStatus,
  EvidenceView,
  FindingCategory,
  FindingProvenance,
  FindingSeverity,
  FindingView,
  RelatedArtifact,
  RelationshipState,
  RequirementImportance,
  RequirementStatus,
  RequirementView,
  RiskLevel,
} from "./view-model";

/* --- Seeds ------------------------------------------------------------ */

export type ChangedFileSeed = {
  path: string;
  additions: number | null;
  deletions: number | null;
  risk: RiskLevel | null;
};

export type FindingSeed = {
  findingId: string;
  severity: FindingSeverity;
  title: string;
  statement: string;
  action: string;
  /* Raw recorded location, which may carry a line suffix, or null when the
     finding records no location. Preserved verbatim for display. */
  location: string | null;
  provenance: FindingProvenance;
  category: FindingCategory;
};

export type EvidenceSeed = {
  evidenceId: string;
  title: string;
  statement: string;
  evidenceClass: EvidenceClass;
  status: EvidenceStatus;
  provenance: string;
  source: string;
  observedAt: string;
  stale: boolean;
  /* Raw canonical evidence→finding references, exactly as recorded (may include
     ids that do not resolve in this case). */
  relatedFindingIds: string[];
  /* The changed-file / source path this evidence record canonically identifies,
     or null. Only set when the source explicitly names a changed file (never
     inferred from shared wording). */
  changePath: string | null;
};

export type RequirementSeed = {
  requirementId: string;
  title: string;
  statement: string;
  importance: RequirementImportance;
  status: RequirementStatus;
  evidenceRequired: string;
  stale: boolean;
  /* Raw canonical requirement→evidence references (current supporting evidence),
     exactly as recorded (may include ids that do not resolve in this case). */
  supportingEvidenceIds: string[];
  /* R1B.5 — the persistence capability for this requirement, resolved by the
     adapter (which alone sees Reports and the canonical condition identity).
     The assembler carries it through unchanged; it never derives it. */
  conditionProgress: ConditionProgressCapability;
};

/* Whether finding ↔ requirement is deterministically derivable for this case.
   When derivable, `findingRequirementIds` maps each finding id to the
   requirement ids it opens. When not, the reason is surfaced verbatim and the
   edge renders as `unavailable` in both directions. */
export type RequirementLinkage =
  | { derivable: true; findingRequirementIds: ReadonlyMap<string, readonly string[]> }
  | { derivable: false; reason: string };

export type CaseArtifactSeeds = {
  changedFiles: ChangedFileSeed[];
  findings: FindingSeed[];
  evidence: EvidenceSeed[];
  requirements: RequirementSeed[];
  requirementLinkage: RequirementLinkage;
};

export type CaseArtifacts = {
  changedFiles: ChangedFileView[];
  findings: FindingView[];
  evidence: EvidenceView[];
  requirements: RequirementView[];
};

/* --- Location parsing ------------------------------------------------- */

/* Resolve a recorded finding location to a bare file path for exact matching.
   A trailing `:<line>` or `:<line>:<column>` suffix is stripped ONLY when it is
   unambiguously numeric — never a heuristic. The original location text is
   preserved by the caller; this returns only the path used for exact matching. */
export function locationToPath(location: string | null | undefined): string | null {
  if (typeof location !== "string") return null;
  const trimmed = location.trim();
  if (trimmed.length === 0) return null;
  const withoutColumn = trimmed.replace(/:\d+$/, "");
  const withoutLine = withoutColumn.replace(/:\d+$/, "");
  return withoutLine.length > 0 ? withoutLine : trimmed;
}

function locationToExactLine(location: string | null | undefined): number | null {
  if (typeof location !== "string") return null;
  const path = locationToPath(location);
  if (!path) return null;
  const suffix = location.trim().slice(path.length);
  const match = suffix.match(/^:(\d+)(?::\d+)?$/);
  if (!match) return null;
  const line = Number(match[1]);
  return Number.isSafeInteger(line) && line > 0 ? line : null;
}

/* --- Relationship-state construction ---------------------------------- */

function relationshipFromRefs(
  related: RelatedArtifact[],
  unresolved: string[],
): RelationshipState {
  if (related.length > 0) return { status: "linked", related, unresolved };
  if (unresolved.length > 0) return { status: "unresolved", unresolved };
  return { status: "none" };
}

function pushUnique<T>(list: T[], value: T): void {
  if (!list.includes(value)) list.push(value);
}

/* --- Assembly --------------------------------------------------------- */

export function assembleCaseArtifacts(seeds: CaseArtifactSeeds): CaseArtifacts {
  const { changedFiles, findings, evidence, requirements, requirementLinkage } = seeds;

  /* Changed-file identities and a path → artifact-id index for exact matching.
     First occurrence wins if a path repeats; positional ids never cross domains. */
  const changeIdByPath = new Map<string, string>();
  const changeArtifactById = new Map<string, RelatedArtifact>();
  const changedFileArtifactIds: string[] = [];
  changedFiles.forEach((file, index) => {
    const artifactId = `change-${index}`;
    changedFileArtifactIds.push(artifactId);
    if (!changeIdByPath.has(file.path)) changeIdByPath.set(file.path, artifactId);
    changeArtifactById.set(artifactId, {
      kind: "change",
      id: artifactId,
      label: file.path,
      detail: file.risk ? `${file.risk} risk` : null,
    });
  });

  /* Related-artifact descriptors for the focusable stages, keyed by id. */
  const findingArtifactById = new Map<string, RelatedArtifact>();
  const knownFindingIds = new Set<string>();
  for (const finding of findings) {
    knownFindingIds.add(finding.findingId);
    findingArtifactById.set(finding.findingId, {
      kind: "finding",
      id: finding.findingId,
      label: finding.title,
      detail: finding.severity,
    });
  }

  const evidenceArtifactById = new Map<string, RelatedArtifact>();
  const knownEvidenceIds = new Set<string>();
  for (const record of evidence) {
    knownEvidenceIds.add(record.evidenceId);
    evidenceArtifactById.set(record.evidenceId, {
      kind: "evidence",
      id: record.evidenceId,
      label: record.title,
      detail: record.stale ? `${record.status} · stale` : record.status,
    });
  }

  const requirementArtifactById = new Map<string, RelatedArtifact>();
  const knownRequirementIds = new Set<string>();
  for (const requirement of requirements) {
    knownRequirementIds.add(requirement.requirementId);
    requirementArtifactById.set(requirement.requirementId, {
      kind: "requirement",
      id: requirement.requirementId,
      label: requirement.title,
      detail: requirement.status,
    });
  }

  /* Inverse accumulators, all built from resolved edges only. */
  const findingToEvidence = new Map<string, string[]>();
  const changeIdToFindings = new Map<string, string[]>();
  const evidenceToRequirements = new Map<string, string[]>();
  const changeIdToEvidence = new Map<string, string[]>();

  /* ---- Change → Observation (exact recorded location only) ---- */
  const findingAffectedChange = new Map<string, RelationshipState>();
  for (const finding of findings) {
    const path = locationToPath(finding.location);
    if (path === null) {
      findingAffectedChange.set(finding.findingId, { status: "none" });
      continue;
    }
    const changeId = changeIdByPath.get(path);
    if (changeId === undefined) {
      /* A location was recorded but resolves to no changed file in this case. */
      findingAffectedChange.set(finding.findingId, {
        status: "unresolved",
        unresolved: [finding.location ?? path],
      });
      continue;
    }
    const related = changeArtifactById.get(changeId);
    findingAffectedChange.set(finding.findingId, {
      status: "linked",
      related: related ? [related] : [],
      unresolved: [],
    });
    const list = changeIdToFindings.get(changeId) ?? [];
    pushUnique(list, finding.findingId);
    changeIdToFindings.set(changeId, list);
  }

  /* ---- Observation ↔ Evidence (canonical evidence→finding, both ways) ---- */
  const evidenceSupportsFindings = new Map<string, RelationshipState>();
  for (const record of evidence) {
    const related: RelatedArtifact[] = [];
    const unresolved: string[] = [];
    for (const findingId of record.relatedFindingIds) {
      const artifact = findingArtifactById.get(findingId);
      if (artifact) {
        related.push(artifact);
        const list = findingToEvidence.get(findingId) ?? [];
        pushUnique(list, record.evidenceId);
        findingToEvidence.set(findingId, list);
      } else {
        pushUnique(unresolved, findingId);
      }
    }
    evidenceSupportsFindings.set(record.evidenceId, relationshipFromRefs(related, unresolved));
  }

  /* ---- Evidence ↔ Requirement (canonical current supporting, both ways) ---- */
  const requirementSupportingEvidence = new Map<string, RelationshipState>();
  for (const requirement of requirements) {
    const related: RelatedArtifact[] = [];
    const unresolved: string[] = [];
    for (const evidenceId of requirement.supportingEvidenceIds) {
      const artifact = evidenceArtifactById.get(evidenceId);
      if (artifact) {
        related.push(artifact);
        const list = evidenceToRequirements.get(evidenceId) ?? [];
        pushUnique(list, requirement.requirementId);
        evidenceToRequirements.set(evidenceId, list);
      } else {
        pushUnique(unresolved, evidenceId);
      }
    }
    requirementSupportingEvidence.set(
      requirement.requirementId,
      relationshipFromRefs(related, unresolved),
    );
  }

  /* ---- Change ↔ Evidence (canonical explicit source path, both ways) ---- */
  const evidenceRelatedChanges = new Map<string, RelationshipState>();
  for (const record of evidence) {
    if (record.changePath === null) {
      evidenceRelatedChanges.set(record.evidenceId, { status: "none" });
      continue;
    }
    const changeId = changeIdByPath.get(record.changePath);
    if (changeId === undefined) {
      evidenceRelatedChanges.set(record.evidenceId, {
        status: "unresolved",
        unresolved: [record.changePath],
      });
      continue;
    }
    const related = changeArtifactById.get(changeId);
    evidenceRelatedChanges.set(record.evidenceId, {
      status: "linked",
      related: related ? [related] : [],
      unresolved: [],
    });
    const list = changeIdToEvidence.get(changeId) ?? [];
    pushUnique(list, record.evidenceId);
    changeIdToEvidence.set(changeId, list);
  }

  /* ---- Observation ↔ Requirement (only when deterministically derivable) ---- */
  const findingRelatedRequirements = new Map<string, RelationshipState>();
  const requirementRelatedFindings = new Map<string, RelationshipState>();
  const requirementToFindings = new Map<string, string[]>();
  if (requirementLinkage.derivable) {
    for (const finding of findings) {
      const requirementIds = requirementLinkage.findingRequirementIds.get(finding.findingId) ?? [];
      const related: RelatedArtifact[] = [];
      const unresolved: string[] = [];
      for (const requirementId of requirementIds) {
        const artifact = requirementArtifactById.get(requirementId);
        if (artifact) {
          related.push(artifact);
          const list = requirementToFindings.get(requirementId) ?? [];
          pushUnique(list, finding.findingId);
          requirementToFindings.set(requirementId, list);
        } else {
          pushUnique(unresolved, requirementId);
        }
      }
      findingRelatedRequirements.set(finding.findingId, relationshipFromRefs(related, unresolved));
    }
  }

  /* ---- Materialise views ---- */
  const relatedFrom = (
    lookup: Map<string, RelatedArtifact>,
    ids: string[] | undefined,
  ): RelationshipState => {
    if (!ids || ids.length === 0) return { status: "none" };
    const related = ids.map((id) => lookup.get(id)).filter((a): a is RelatedArtifact => Boolean(a));
    return related.length > 0 ? { status: "linked", related, unresolved: [] } : { status: "none" };
  };

  const unavailableReason = requirementLinkage.derivable ? null : requirementLinkage.reason;

  const changedFileViews: ChangedFileView[] = changedFiles.map((file, index) => {
    const artifactId = changedFileArtifactIds[index];
    const focusedRegions = findings.flatMap((finding) => {
      if (locationToPath(finding.location) !== file.path) return [];
      const line = locationToExactLine(finding.location);
      return line === null
        ? []
        : [{
            startLine: line,
            endLine: line,
            sourceFindingId: finding.findingId,
            sourceLabel: finding.title,
            provenance: "exact-recorded-location" as const,
          }];
    });
    return {
      artifactId,
      path: file.path,
      additions: file.additions,
      deletions: file.deletions,
      risk: file.risk,
      focusedRegions,
      observations: relatedFrom(findingArtifactById, changeIdToFindings.get(artifactId)),
      evidence: relatedFrom(evidenceArtifactById, changeIdToEvidence.get(artifactId)),
    };
  });

  const findingViews: FindingView[] = findings.map((finding) => ({
    findingId: finding.findingId,
    severity: finding.severity,
    title: finding.title,
    statement: finding.statement,
    action: finding.action,
    file: finding.location && finding.location.trim().length > 0
      ? finding.location
      : "Location not recorded",
    provenance: finding.provenance,
    category: finding.category,
    affectedChange: findingAffectedChange.get(finding.findingId) ?? { status: "none" },
    supportingEvidence: relatedFrom(evidenceArtifactById, findingToEvidence.get(finding.findingId)),
    relatedRequirements: unavailableReason
      ? { status: "unavailable", reason: unavailableReason }
      : findingRelatedRequirements.get(finding.findingId) ?? { status: "none" },
  }));

  const evidenceViews: EvidenceView[] = evidence.map((record) => ({
    evidenceId: record.evidenceId,
    title: record.title,
    statement: record.statement,
    evidenceClass: record.evidenceClass,
    status: record.status,
    provenance: record.provenance,
    source: record.source,
    observedAt: record.observedAt,
    stale: record.stale,
    supportsFindings: evidenceSupportsFindings.get(record.evidenceId) ?? { status: "none" },
    supportsRequirements: relatedFrom(
      requirementArtifactById,
      evidenceToRequirements.get(record.evidenceId),
    ),
    relatedChanges: evidenceRelatedChanges.get(record.evidenceId) ?? { status: "none" },
  }));

  for (const requirement of requirements) {
    if (!requirementLinkage.derivable) {
      requirementRelatedFindings.set(requirement.requirementId, {
        status: "unavailable",
        reason: requirementLinkage.reason,
      });
    } else {
      requirementRelatedFindings.set(
        requirement.requirementId,
        relatedFrom(findingArtifactById, requirementToFindings.get(requirement.requirementId)),
      );
    }
  }

  const requirementViews: RequirementView[] = requirements.map((requirement) => ({
    requirementId: requirement.requirementId,
    title: requirement.title,
    statement: requirement.statement,
    importance: requirement.importance,
    status: requirement.status,
    evidenceRequired: requirement.evidenceRequired,
    supportingEvidence:
      requirementSupportingEvidence.get(requirement.requirementId) ?? { status: "none" },
    relatedFindings: requirementRelatedFindings.get(requirement.requirementId) ?? { status: "none" },
    stale: requirement.stale,
    /* Carried verbatim from the seed; the assembler asserts no persistence. */
    conditionProgress: requirement.conditionProgress,
  }));

  return {
    changedFiles: changedFileViews,
    findings: findingViews,
    evidence: evidenceViews,
    requirements: requirementViews,
  };
}
