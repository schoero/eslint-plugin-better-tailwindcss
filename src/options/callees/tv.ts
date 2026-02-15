import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { CalleeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const TV_STRINGS = {
  kind: SelectorKind.Callee,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "tv"
} satisfies CalleeSelector;

export const TV_VARIANT_VALUES = {
  kind: SelectorKind.Callee,
  match: [
    {
      pathPattern: "^variants.*$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "tv"
} satisfies CalleeSelector;

export const TV_BASE_VALUES = {
  kind: SelectorKind.Callee,
  match: [
    {
      pathPattern: "^base$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "tv"
} satisfies CalleeSelector;

export const TV_SLOTS_VALUES = {
  kind: SelectorKind.Callee,
  match: [
    {
      pathPattern: "^slots.*$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "tv"
} satisfies CalleeSelector;

export const TV_COMPOUND_VARIANTS_CLASS = {
  kind: SelectorKind.Callee,
  match: [
    {
      pathPattern: "^compoundVariants\\[\\d+\\]\\.(?:className|class).*$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "tv"
} satisfies CalleeSelector;

export const TV_COMPOUND_SLOTS_CLASS = {
  kind: SelectorKind.Callee,
  match: [
    {
      pathPattern: "^compoundSlots\\[\\d+\\]\\.(?:className|class).*$",
      type: MatcherType.ObjectValue
    }
  ],
  name: "tv"
} satisfies CalleeSelector;

/** @see https://github.com/nextui-org/tailwind-variants?tab=readme-ov-file */
export const TV = [
  TV_STRINGS,
  TV_VARIANT_VALUES,
  TV_COMPOUND_VARIANTS_CLASS,
  TV_BASE_VALUES,
  TV_SLOTS_VALUES,
  TV_COMPOUND_SLOTS_CLASS
] satisfies Selectors;
