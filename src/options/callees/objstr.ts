import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const OBJSTR_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "objstr"
} satisfies CalleeSelector;

export const OBJSTR_OBJECT_KEYS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "objstr"
} satisfies CalleeSelector;

/** @see https://github.com/lukeed/obj-str */
export const OBJSTR = [
  OBJSTR_OBJECT_KEYS
] satisfies Selectors;
