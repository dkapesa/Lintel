import {
  RECOMMENDATION_LABEL,
  type CaseDetail,
} from "../workspace-v2/view-model";

export type RecommendationOrientation = Readonly<{
  statement: string;
  summary: string;
}>;

export function projectRecommendation(detail: CaseDetail): RecommendationOrientation {
  return {
    statement: `Lintel recommends ${RECOMMENDATION_LABEL[detail.recommendation]}.`,
    summary: detail.executiveSummary,
  };
}
