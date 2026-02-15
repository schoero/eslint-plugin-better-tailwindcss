import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CNB_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "cnb"
} satisfies CalleeSelector;

export const CNB_OBJECT_KEYS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "cnb"
} satisfies CalleeSelector;

/** @see https://github.com/xobotyi/cnbuilder */
export const CNB = [
  CNB_STRINGS,
  CNB_OBJECT_KEYS
] satisfies Selectors;
