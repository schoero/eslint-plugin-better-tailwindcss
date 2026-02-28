import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors, TagSelector } from "better-tailwindcss:types/rule.js";


export const TWC_TAG = {
  kind: SelectorKind.Tag,
  name: "twc(\\.\\w+)?"
} satisfies TagSelector;

export const TWC_CALLEE_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  path: "^twc\\.\\w+"
} satisfies CalleeSelector;

/** @see https://github.com/gregberge/twc */
export const TWC = [
  TWC_TAG,
  TWC_CALLEE_STRINGS
] satisfies Selectors;
