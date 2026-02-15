import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const TW_JOIN_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "twJoin"
} satisfies CalleeSelector;

/** @see https://github.com/dcastil/tailwind-merge */
export const TW_JOIN = [
  TW_JOIN_STRINGS
] satisfies Selectors;
