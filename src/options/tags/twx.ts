import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors, TagSelector } from "better-tailwindcss:types/rule.js";


export const TWX_TAG = {
  kind: SelectorKind.Tag,
  name: "twx(\\.\\w+)?"
} satisfies TagSelector;

export const TWX_CALLEE_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  path: "^twx\\.\\w+"
} satisfies CalleeSelector;

/** @see https://github.com/gregberge/twc */
export const TWX = [
  TWX_TAG,
  TWX_CALLEE_STRINGS
] satisfies Selectors;
