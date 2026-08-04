export type InteractionAuthority = "automatic" | "manual";

export type SceneInteractionState<TStateKey extends string> = {
  active: TStateKey;
  authority: InteractionAuthority;
  introductionComplete: boolean;
  hasEnteredViewport: boolean;
  reducedMotion: boolean;
  enhanced: boolean;
};

export type HeroViewKey = "overview" | "finding" | "readiness";
export type EvidenceRecordKey = "ev_retry_path" | "ev_no_idempotency_key";
export type ReadinessViewKey = "readiness" | "decision-boundary";

export type HeroSceneState = SceneInteractionState<HeroViewKey>;
export type EvidenceSceneState = SceneInteractionState<EvidenceRecordKey>;
export type ReadinessSceneState = SceneInteractionState<ReadinessViewKey>;
