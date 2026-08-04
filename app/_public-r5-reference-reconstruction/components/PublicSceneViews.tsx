"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { SceneInteractionState } from "../public-interaction-types";
import { PublicScenePanel } from "./PublicScenePanel";
import { PublicSceneTab } from "./PublicSceneTab";
import { SceneMotion } from "./SceneMotion";

type PublicSceneView<TStateKey extends string> = {
  key: TStateKey;
  label: string;
  control: ReactNode;
  panel: ReactNode;
};

type PublicSceneClassNames = {
  scene?: string;
  interaction?: string;
  plate?: string;
  frame?: string;
  body?: string;
  controls?: string;
  staticControls?: string;
  tab?: string;
  panelStack?: string;
  panel?: string;
};

export function PublicSceneViews<TStateKey extends string>({
  chrome,
  classNames,
  defaultKey,
  groupLabel,
  idPrefix,
  introductionDuration,
  orientation,
  persistent,
  staticPanelLabel,
  views,
}: {
  chrome: ReactNode;
  classNames: PublicSceneClassNames;
  defaultKey: TStateKey;
  groupLabel: string;
  idPrefix: string;
  introductionDuration: number;
  orientation: "horizontal" | "vertical";
  persistent: ReactNode;
  staticPanelLabel: string;
  views: readonly PublicSceneView<TStateKey>[];
}) {
  const [state, setState] = useState<SceneInteractionState<TStateKey>>({
    active: defaultKey,
    authority: "automatic",
    introductionComplete: false,
    hasEnteredViewport: false,
    reducedMotion: false,
    enhanced: false,
  });
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreference = () => {
      setState((current) => ({
        ...current,
        enhanced: true,
        reducedMotion: media.matches,
        introductionComplete: current.introductionComplete || media.matches,
      }));
    };

    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (
      !state.hasEnteredViewport ||
      state.introductionComplete ||
      state.authority === "manual" ||
      state.reducedMotion
    ) {
      return;
    }

    const completionTimer = window.setTimeout(() => {
      setState((current) =>
        current.authority === "manual"
          ? current
          : { ...current, introductionComplete: true },
      );
    }, introductionDuration);

    return () => window.clearTimeout(completionTimer);
  }, [
    introductionDuration,
    state.authority,
    state.hasEnteredViewport,
    state.introductionComplete,
    state.reducedMotion,
  ]);

  const markEntered = useCallback(() => {
    setState((current) =>
      current.hasEnteredViewport ? current : { ...current, hasEnteredViewport: true },
    );
  }, []);

  const activate = useCallback((key: TStateKey) => {
    setState((current) => ({
      ...current,
      active: key,
      authority: "manual",
      introductionComplete: true,
    }));
  }, []);

  const handleKeyDown = useCallback(
    (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
      const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      let nextIndex: number | null = null;

      if (event.key === previousKey) nextIndex = (index - 1 + views.length) % views.length;
      if (event.key === nextKey) nextIndex = (index + 1) % views.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = views.length - 1;

      if (nextIndex !== null) {
        event.preventDefault();
        activate(views[nextIndex].key);
        tabRefs.current[nextIndex]?.focus();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(views[index].key);
      }
    },
    [activate, orientation, views],
  );

  const forcedSettled =
    state.reducedMotion || state.introductionComplete || state.authority === "manual";

  return (
    <SceneMotion
      className={classNames.scene}
      onEnteredViewport={markEntered}
      settled={forcedSettled}
    >
      <div
        className={classNames.interaction}
        data-active-view={state.active}
        data-enhanced={state.enhanced ? "true" : "false"}
        data-interaction-authority={state.authority}
        data-introduction-complete={state.introductionComplete ? "true" : "false"}
        data-reduced-motion={state.reducedMotion ? "true" : "false"}
      >
        <div className={classNames.plate}>
          <div className={classNames.frame}>
            {chrome}
            <div className={classNames.body}>
              {persistent}

              {state.enhanced ? (
                <div
                  className={classNames.controls}
                  role="tablist"
                  aria-label={groupLabel}
                  aria-orientation={orientation}
                >
                  {views.map((view, index) => (
                    <PublicSceneTab
                      key={view.key}
                      tabRef={(node) => {
                        tabRefs.current[index] = node;
                      }}
                      className={classNames.tab}
                      id={`${idPrefix}-tab-${view.key}`}
                      controlsId={`${idPrefix}-panel-${view.key}`}
                      isSelected={state.active === view.key}
                      label={view.label}
                      onActivate={() => activate(view.key)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                    >
                      {view.control}
                    </PublicSceneTab>
                  ))}
                </div>
              ) : (
                <div className={classNames.staticControls} aria-label={groupLabel}>
                  {views.map((view) => (
                    <div
                      key={view.key}
                      className={classNames.tab}
                      data-selected={view.key === defaultKey ? "true" : "false"}
                    >
                      {view.control}
                    </div>
                  ))}
                </div>
              )}

              <div className={classNames.panelStack}>
                {views.map((view) => (
                  <PublicScenePanel
                    key={view.key}
                    active={state.active === view.key}
                    className={classNames.panel}
                    enhanced={state.enhanced}
                    id={`${idPrefix}-panel-${view.key}`}
                    label={staticPanelLabel}
                    labelledBy={`${idPrefix}-tab-${view.key}`}
                  >
                    {view.panel}
                  </PublicScenePanel>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SceneMotion>
  );
}
