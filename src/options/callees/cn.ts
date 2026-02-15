import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CN_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "cn"
} satisfies CalleeSelector;

export const CN_OBJECT_KEYS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "cn"
} satisfies CalleeSelector;

/** @see https://ui.shadcn.com/docs/installation/manual */
export const CN = [
  CN_STRINGS,
  CN_OBJECT_KEYS
] satisfies Selectors;
