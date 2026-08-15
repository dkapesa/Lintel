import type { ApplicationAction } from "../r6c/actions";

export const EXIT_FOCUS_MODE_ACTION = {
  id: "focus/set",
  active: false,
} as const satisfies ApplicationAction;
