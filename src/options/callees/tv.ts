import { MatcherType } from "better-tailwindcss:types/rule.js";

import type { CalleeMatchers, Callees } from "better-tailwindcss:options/schemas/callees.js";


export const TV_STRINGS = [
  "tv",
  [
    {
      match: MatcherType.String
    }
  ]
] satisfies CalleeMatchers;

export const TV_VARIANT_VALUES = [
  "tv",
  [
    {
      match: MatcherType.ObjectValue,
      pathPattern: "^variants.*$"
    }
  ]
] satisfies CalleeMatchers;

export const TV_BASE_VALUES = [
  "tv",
  [
    {
      match: MatcherType.ObjectValue,
      pathPattern: "^base$"
    }
  ]
] satisfies CalleeMatchers;

export const TV_SLOTS_VALUES = [
  "tv",
  [
    {
      match: MatcherType.ObjectValue,
      pathPattern: "^slots.*$"
    }
  ]
] satisfies CalleeMatchers;

export const TV_COMPOUND_VARIANTS_CLASS = [
  "tv",
  [
    {
      match: MatcherType.ObjectValue,
      pathPattern: "^compoundVariants\\[\\d+\\]\\.(?:className|class).*$"
    }
  ]
] satisfies CalleeMatchers;

export const TV_COMPOUND_SLOTS_CLASS = [
  "tv",
  [
    {
      match: MatcherType.ObjectValue,
      pathPattern: "^compoundSlots\\[\\d+\\]\\.(?:className|class).*$"
    }
  ]
] satisfies CalleeMatchers;

/** @see https://github.com/nextui-org/tailwind-variants?tab=readme-ov-file */
export const TV = [
  TV_STRINGS,
  TV_VARIANT_VALUES,
  TV_COMPOUND_VARIANTS_CLASS,
  TV_BASE_VALUES,
  TV_SLOTS_VALUES,
  TV_COMPOUND_SLOTS_CLASS
] satisfies Callees;
