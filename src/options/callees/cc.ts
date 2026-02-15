import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CC_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "cc"
} satisfies CalleeSelector;

export const CC_OBJECT_KEYS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "cc"
} satisfies CalleeSelector;

/** @see https://github.com/jorgebucaran/classcat */
export const CC = [
  CC_STRINGS,
  CC_OBJECT_KEYS
] satisfies Selectors;
