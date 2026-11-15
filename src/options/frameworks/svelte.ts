import { HTML } from "better-tailwindcss:options/frameworks/html.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { AttributeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const SVELTE_CLASS_ATTRIBUTE_OBJECT_KEYS = {
  kind: SelectorKind.Attribute,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "^class$"
} satisfies AttributeSelector;

export const SVELTE_CLASS_DIRECTIVE_ATTRIBUTE = {
  kind: SelectorKind.Attribute,
  match: [
    {
      type: MatcherType.String
    }
  ],
  name: "^class:.*$"
} satisfies AttributeSelector;

/** @see https://svelte.dev/docs/svelte/class */
export const SVELTE = [
  ...HTML,
  SVELTE_CLASS_ATTRIBUTE_OBJECT_KEYS,
  SVELTE_CLASS_DIRECTIVE_ATTRIBUTE
] satisfies Selectors;
