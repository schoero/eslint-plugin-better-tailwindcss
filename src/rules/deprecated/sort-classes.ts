import { enforceConsistentClassOrder } from "better-tailwindcss:rules/enforce-consistent-class-order.js";

import type { ESLintRule } from "better-tailwindcss:types/rule.js";


export const sortClasses: ESLintRule = {
  name: "sort-classes" as const,
  rule: {
    ...enforceConsistentClassOrder.rule,
    meta: {
      ...enforceConsistentClassOrder.rule.meta,
      deprecated: {
        availableUntil: "^4.0.0",
        deprecatedSince: "^3.4.0",
        replacedBy: [
          {
            message: "The rule name `sort-classes` is deprecated. Please use `enforce-consistent-class-order` instead.",
            rule: {
              name: "enforce-consistent-class-order"
            }
          }
        ]
      }
    }
  }
};
