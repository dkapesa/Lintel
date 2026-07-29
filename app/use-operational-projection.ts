"use client";

import { useEffect, useState } from "react";
import {
  readOperationalReviewProjection,
  type OperationalDemoMode,
  type OperationalReviewProjection,
} from "../lib/operational-review-projection";

export type OperationalLoadState =
  | { kind: "loading"; projection: null }
  | { kind: "resolved"; projection: OperationalReviewProjection };

export function useOperationalProjection(
  demoMode: OperationalDemoMode,
  retrySignal = 0,
): OperationalLoadState {
  const [state, setState] = useState<OperationalLoadState>({
    kind: "loading",
    projection: null,
  });

  useEffect(() => {
    let active = true;
    setState({ kind: "loading", projection: null });
    readOperationalReviewProjection(window.localStorage, demoMode)
      .then((projection) => {
        if (active) setState({ kind: "resolved", projection });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          kind: "resolved",
          projection: {
            status: "unavailable",
            mode: demoMode === "none" ? "local" : "demo",
            records: [],
            limitations: [],
            unavailableReason:
              error instanceof Error
                ? `Browser-local Report history could not be read: ${error.message}`
                : "Browser-local Report history could not be read.",
          },
        });
      });
    return () => {
      active = false;
    };
  }, [demoMode, retrySignal]);

  return state;
}

