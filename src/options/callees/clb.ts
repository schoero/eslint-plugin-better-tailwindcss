import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const CLB_BASE_VALUES = {
  kind: SelectorKind.Callee,
  match: [
    {
      path: "^base$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "clb"
} satisfies CalleeSelector;

export const CLB_VARIANT_VALUES = {
  kind: SelectorKind.Callee,
  match: [
    {
      path: "^variants.*$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "clb"
} satisfies CalleeSelector;

export const CLB_COMPOUND_VARIANTS_CLASSES = {
  kind: SelectorKind.Callee,
  match: [
    {
      path: "^compoundVariants\\[\\d+\\]\\.classes$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "clb"
} satisfies CalleeSelector;

/** @see https://github.com/crswll/clb */
export const CLB = [
  CLB_BASE_VALUES,
  CLB_VARIANT_VALUES,
  CLB_COMPOUND_VARIANTS_CLASSES
  // TODO: add object key matcher: classes
] satisfies Selectors;
