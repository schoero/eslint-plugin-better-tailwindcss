import {
  DEFAULT_ATTRIBUTE_NAMES,
  DEFAULT_CALLEE_NAMES,
  DEFAULT_TAG_NAMES,
  DEFAULT_VARIABLE_NAMES
} from "better-tailwindcss:options/default-options.js";
import {
  ATTRIBUTE_SCHEMA,
  CALLEE_SCHEMA,
  TAG_SCHEMA,
  VARIABLE_SCHEMA
} from "better-tailwindcss:options/descriptions.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import { replacePlaceholders } from "better-tailwindcss:utils/string.js";

import type { Rule } from "eslint";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type {
  AttributeOption,
  CalleeOption,
  ESLintRule,
  TagOption,
  VariableOption
} from "better-tailwindcss:types/rule.js";


export type Options = [
  Partial<
    AttributeOption &
    CalleeOption &
    TagOption &
    VariableOption &
    {
      restrict?: (string | {
        pattern: string;
        fix?: string;
        message?: string;
      })[];
    }
  >
];

const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  restrict: [],
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-restricted-classes.md";

export const noRestrictedClasses: ESLintRule<Options> = {
  name: "no-restricted-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Disallow restricted classes.",
        recommended: false,
        url: DOCUMENTATION_URL
      },
      fixable: "code",
      schema: [
        {
          additionalProperties: false,
          properties: {
            ...CALLEE_SCHEMA,
            ...ATTRIBUTE_SCHEMA,
            ...VARIABLE_SCHEMA,
            ...TAG_SCHEMA,
            restrict: {
              items: {
                anyOf: [
                  {
                    additionalProperties: false,
                    properties: {
                      fix: {
                        description: "A replacement class",
                        type: "string"
                      },
                      message: {
                        default: undefined,
                        description: "The message to report when a class is restricted.",
                        type: "string"
                      },
                      pattern: {
                        description: "The regex pattern to match restricted classes.",
                        type: "string"
                      }
                    },
                    required: ["pattern"],
                    type: "object"
                  },
                  {
                    type: "string"
                  }
                ]
              },
              type: "array"
            }
          },
          type: "object"
        }
      ],
      type: "problem"
    }
  }
};


function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  const { restrict: restrictions } = getOptions(ctx);

  for(const literal of literals){
    lintClasses(ctx, literal, (className, classes) => {

      for(const restriction of restrictions){
        const pattern = typeof restriction === "string"
          ? restriction
          : restriction.pattern;

        const matches = className.match(pattern);

        if(!matches){
          continue;
        }

        const message = typeof restriction === "string" || !restriction.message
          ? `Restricted class: "${className}".`
          : replacePlaceholders(restriction.message, matches);

        if(typeof restriction === "string"){
          return {
            message
          };
        }

        if(restriction.fix !== undefined){
          return {
            fix: replacePlaceholders(restriction.fix, matches),
            message
          };
        }

        return {
          message
        };
      }
    });
  }
}

export function getOptions(ctx: Rule.RuleContext) {

  const options: Options[0] = ctx.options[0] ?? {};

  const common = getCommonOptions(ctx);

  const restrict = options.restrict ?? defaultOptions.restrict;

  return {
    ...common,
    restrict
  };

}
