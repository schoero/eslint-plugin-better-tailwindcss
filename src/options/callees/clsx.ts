import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CLSX_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "clsx"
} satisfies CalleeSelector;

export const CLSX_OBJECT_KEYS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "clsx"
} satisfies CalleeSelector;

/** @see https://github.com/lukeed/clsx */
export const CLSX = [
  CLSX_STRINGS,
  CLSX_OBJECT_KEYS
] satisfies Selectors;
