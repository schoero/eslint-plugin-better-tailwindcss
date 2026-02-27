import { SelectorKind } from "better-tailwindcss:types/rule.js";

import type { Selectors, TagSelector } from "better-tailwindcss:types/rule.js";


export const TWX_TAG = {
  kind: SelectorKind.Tag,
  name: "twx(\\.\\w+)?"
} satisfies TagSelector;

/** @see https://github.com/gregberge/twc */
export const TWX = [
  TWX_TAG
] satisfies Selectors;
