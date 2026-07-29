"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  recentOperationalRecords,
  recentlyChangedOperationalRecords,
  recordMatchesOperationalView,
  type OperationalDemoMode,
} from "../../lib/operational-review-projection";
import AppShell from "../app-shell";
import styles from "../operational.module.css";
import {
  CompactReviewList,
  DemoBoundary,
  LocalBoundary,
  OperationalViews,
  ProjectionLimitations,
} from "../operational-ui";
import { useOperationalProjection } from "../use-operational-projection";

function demoModeFromQuery(value: string | null): OperationalDemoMode {
  if (value === "1") return "records";
  if (value === "empty") return "empty";
  return "none";
}

export default function OperationalHomeClient() {
  const searchParams = useSearchParams();
  const demoMode = demoModeFromQuery(searchParams.get("demo"));
  const [retrySignal, setRetrySignal] = useState(0);
  const state = useOperationalProjection(demoMode, retrySignal);
  const demo = demoMode !== "none";

  const content = useMemo(() => {
    if (state.kind !== "resolved" || state.projection.status !== "ready") return null;
    const records = state.projection.records;
    return {
      recent: recentOperationalRecords(records, 5),
      changed: recentlyChangedOperationalRecords(records, 5),
      attention: records
        .filter((record) => recordMatchesOperationalView(record, "needs-attention"))
        .slice(0, 4),
      ready: records
        .filter((record) => recordMatchesOperationalView(record, "ready-for-assessment"))
        .slice(0, 4),
      stale: records
        .filter((record) => recordMatchesOperationalView(record, "stale-decision"))
        .slice(0, 4),
    };
  }, [state]);

  const projection = state.kind === "resolved" ? state.projection : null;
  const recent = content?.recent ?? [];
  const continueRecord =
    projection?.mode === "local" && recent[0]?.workspaceHref ? recent[0] : null;

  return (
    <AppShell>
      <div className={styles.page} data-operational-home>
        <header className={styles.homeHeader}>
          <div>
            <span className={styles.eyebrow}>Operational Home</span>
            <h1>Resume verification work</h1>
            <p>
              Orient across the reviews recorded in this browser, then continue in the exact
              surface that owns the next action.
            </p>
          </div>
          <div className={styles.primaryActions}>
            {continueRecord?.workspaceHref ? (
              <Link className={styles.primaryAction} href={continueRecord.workspaceHref}>
                Continue most recent review
              </Link>
            ) : (
              <Link className={styles.primaryAction} href="/new">New Review</Link>
            )}
            {continueRecord && <Link className={styles.secondaryAction} href="/new">New Review</Link>}
            <Link
              className={styles.secondaryAction}
              href={`/review-operations${demo ? "?demo=1" : ""}`}
            >
              Review Operations
            </Link>
          </div>
        </header>

        {demo && <DemoBoundary empty={demoMode === "empty"} />}

        {state.kind === "loading" && (
          <section className={styles.statePanel} aria-labelledby="home-loading-title">
            <span className={styles.stateKicker}>Browser-local records</span>
            <h2 id="home-loading-title">Reading operational history</h2>
            <p>Counts and review links appear only after the canonical projection resolves.</p>
          </section>
        )}

        {projection?.status === "unavailable" && (
          <section className={styles.statePanel} aria-labelledby="home-unavailable-title">
            <span className={styles.stateKicker}>Storage unavailable</span>
            <h2 id="home-unavailable-title">Browser-local Report history cannot be read</h2>
            <p>{projection.unavailableReason ?? "The current record set is unavailable."}</p>
            <div className={styles.stateActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => setRetrySignal((value) => value + 1)}
              >
                Retry local read
              </button>
              <Link className={styles.primaryAction} href="/new">New Review</Link>
            </div>
          </section>
        )}

        {projection?.status === "empty" && (
          <section className={styles.statePanel} aria-labelledby="home-empty-title">
            <span className={styles.stateKicker}>Browser-local reviews</span>
            <h2 id="home-empty-title">No reviews are stored in this browser</h2>
            <p>
              Complete a durable New Review and it will appear here for operational orientation.
              No examples are loaded into the real record set.
            </p>
          </section>
        )}

        {projection?.status === "ready" && content && (
          <>
            <ProjectionLimitations limitations={projection.limitations} />
            <OperationalViews records={projection.records} demo={demo} compact />

            <div className={styles.homeGrid}>
              {content.attention.length > 0 && (
                <section className={styles.homeSection} aria-labelledby="home-attention-title">
                  <div className={styles.sectionHeading}>
                    <div>
                      <span>Next truthful action</span>
                      <h2 id="home-attention-title">Needs attention</h2>
                    </div>
                    <Link href={`/review-operations?view=needs-attention${demo ? "&demo=1" : ""}`}>
                      Open view
                    </Link>
                  </div>
                  <CompactReviewList records={content.attention} demo={demo} />
                </section>
              )}

              {content.ready.length > 0 && (
                <section className={styles.homeSection} aria-labelledby="home-ready-title">
                  <div className={styles.sectionHeading}>
                    <div>
                      <span>Engineer assessment</span>
                      <h2 id="home-ready-title">Ready for assessment</h2>
                    </div>
                    <Link href={`/review-operations?view=ready-for-assessment${demo ? "&demo=1" : ""}`}>
                      Open view
                    </Link>
                  </div>
                  <CompactReviewList records={content.ready} demo={demo} />
                </section>
              )}
            </div>

            {content.stale.length > 0 && (
              <section className={styles.homeSection} aria-labelledby="home-stale-title">
                <div className={styles.sectionHeading}>
                  <div>
                    <span>Applicability</span>
                    <h2 id="home-stale-title">Stale Human Decisions</h2>
                  </div>
                  <Link href={`/review-operations?view=stale-decision${demo ? "&demo=1" : ""}`}>
                    Open view
                  </Link>
                </div>
                <CompactReviewList records={content.stale} demo={demo} />
              </section>
            )}

            <div className={styles.homeGrid}>
              {content.recent.length > 0 && (
                <section className={styles.homeSection} aria-labelledby="home-recent-title">
                  <div className={styles.sectionHeading}>
                    <div>
                      <span>Bounded to five</span>
                      <h2 id="home-recent-title">Recent reviews</h2>
                    </div>
                    <Link href={`/review-operations${demo ? "?demo=1" : ""}`}>All reviews</Link>
                  </div>
                  <CompactReviewList records={content.recent} demo={demo} />
                </section>
              )}

              {content.changed.length > 0 && (
                <section className={styles.homeSection} aria-labelledby="home-changed-title">
                  <div className={styles.sectionHeading}>
                    <div>
                      <span>Canonical run comparison</span>
                      <h2 id="home-changed-title">Recently changed</h2>
                    </div>
                    <Link href={`/review-operations?view=recently-changed${demo ? "&demo=1" : ""}`}>
                      Open view
                    </Link>
                  </div>
                  <CompactReviewList records={content.changed} demo={demo} changed />
                </section>
              )}
            </div>

            <LocalBoundary projection={projection} />
          </>
        )}
      </div>
    </AppShell>
  );
}
