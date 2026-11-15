import { HTML } from "better-tailwindcss:options/frameworks/html.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { AttributeSelector, Selectors } from "better-tailwindcss:types/rule.js";


export const QWIK_CLASS_ATTRIBUTE_OBJECT_KEYS = {
  kind: SelectorKind.Attribute,
  match: [
    {
      type: MatcherType.ObjectKey
    }
  ],
  name: "^class$"
} satisfies AttributeSelector;

/** @see https://next.qwik.dev/docs/components/rendering/ */
export const QWIK = [
  ...HTML,
  QWIK_CLASS_ATTRIBUTE_OBJECT_KEYS
] satisfies Selectors;
