/* R0B.2B — Workspace V2 · small shared label/tone helpers used by both the
   route owner and the decision components. Kept separate so the decision
   components do not import from WorkspaceV2Client (which would be circular). */

import styles from "./workspace-v2.module.css";
import type { Recommendation } from "./fixtures";

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  APPROVE: "Approve",
  REVIEW_REQUIRED: "Review required",
  TESTS_REQUIRED: "Tests required",
  BLOCK: "Block",
};

export function recommendationToneClass(value: Recommendation): string {
  if (value === "APPROVE") return styles.toneSuccess;
  if (value === "BLOCK") return styles.toneDanger;
  if (value === "TESTS_REQUIRED") return styles.toneWarning;
  return styles.toneInformation;
}
