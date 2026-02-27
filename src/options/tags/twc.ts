import { SelectorKind } from "better-tailwindcss:types/rule.js";

import type { Selectors, TagSelector } from "better-tailwindcss:types/rule.js";


export const TWC_TAG = {
  kind: SelectorKind.Tag,
  name: "twc(\\.\\w+)?"
} satisfies TagSelector;

/** @see https://github.com/gregberge/twc */
export const TWC = [
  TWC_TAG
] satisfies Selectors;
