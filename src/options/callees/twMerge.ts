import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const TW_MERGE_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "twMerge"
} satisfies CalleeSelector;

/** @see https://github.com/dcastil/tailwind-merge */
export const TW_MERGE = [
  TW_MERGE_STRINGS
] satisfies Selectors;
