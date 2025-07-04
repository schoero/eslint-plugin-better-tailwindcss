import { enforceConsistentLineWrapping } from "better-tailwindcss:rules/enforce-consistent-line-wrapping.js";

import type { ESLintRule } from "better-tailwindcss:types/rule.js";


export const multiline: ESLintRule = {
  ...enforceConsistentLineWrapping,
  name: "multiline" as const,
  rule: {
    ...enforceConsistentLineWrapping.rule,
    meta: {
      ...enforceConsistentLineWrapping.rule.meta,
      deprecated: {
        availableUntil: "^4.0.0",
        deprecatedSince: "^3.4.0",
        replacedBy: [
          {
            message: "The rule name `multiline` is deprecated. Please use `enforce-consistent-line-wrapping` instead.",
            rule: {
              name: "enforce-consistent-line-wrapping"
            }
          }
        ]
      }
    }
  }
};
