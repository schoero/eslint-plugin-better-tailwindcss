import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CTL_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "ctl"
} satisfies CalleeSelector;

/** @see https://github.com/netlify/classnames-template-literals */
export const CTL = [
  CTL_STRINGS
] satisfies Selectors;
