import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CVA_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "cva"
} satisfies CalleeSelector;

export const CVA_VARIANT_VALUES = {
  kind: SelectorKind.Callee,
  match: [
    {
      pathPattern: "^variants.*$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "cva"
} satisfies CalleeSelector;

export const CVA_COMPOUND_VARIANTS_CLASS = {
  kind: SelectorKind.Callee,
  match: [
    {
      pathPattern: "^compoundVariants\\[\\d+\\]\\.(?:className|class)$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "cva"
} satisfies CalleeSelector;

/** @see https://github.com/joe-bell/cva */
export const CVA = [
  CVA_STRINGS,
  CVA_VARIANT_VALUES,
  CVA_COMPOUND_VARIANTS_CLASS
] satisfies Selectors;
