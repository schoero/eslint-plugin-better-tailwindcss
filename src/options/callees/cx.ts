import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CX_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "cx"
} satisfies CalleeSelector;

export const CX_OBJECT_KEYS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "cx"
} satisfies CalleeSelector;

/** @see https://cva.style/docs/api-reference#cx */
export const CX = [
  CX_STRINGS,
  CX_OBJECT_KEYS
] satisfies Selectors;
