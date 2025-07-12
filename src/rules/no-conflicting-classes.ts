import {
  DEFAULT_ATTRIBUTE_NAMES,
  DEFAULT_CALLEE_NAMES,
  DEFAULT_TAG_NAMES,
  DEFAULT_VARIABLE_NAMES
} from "better-tailwindcss:options/default-options.js";
import {
  ATTRIBUTE_SCHEMA,
  CALLEE_SCHEMA,
  ENTRYPOINT_SCHEMA,
  TAG_SCHEMA,
  TAILWIND_CONFIG_SCHEMA,
  VARIABLE_SCHEMA
} from "better-tailwindcss:options/descriptions.js";
import { getConflictingClasses } from "better-tailwindcss:tailwindcss/conflicting-classes.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import { augmentMessageWithWarnings, splitClasses } from "better-tailwindcss:utils/utils.js";

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
      entryPoint?: string;
      tailwindConfig?: string;
    }
  >
];


const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-conflicting-classes.md";

export const noConflictingClasses: ESLintRule<Options> = {
  name: "no-conflicting-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Disallow classes that produce conflicting styles.",
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
            ...ENTRYPOINT_SCHEMA,
            ...TAILWIND_CONFIG_SCHEMA
          },
          type: "object"
        }
      ],
      type: "problem"
    }
  }
};

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  for(const literal of literals){

    const { tailwindConfig } = getOptions(ctx);

    const classes = splitClasses(literal.content);

    const { conflictingClasses, warnings } = getConflictingClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd });

    if(Object.keys(conflictingClasses).length === 0){
      continue;
    }

    lintClasses(ctx, literal, className => {
      if(!conflictingClasses[className]){
        return;
      }

      const conflicts = Object.entries(conflictingClasses[className]);

      if(conflicts.length === 0){
        return;
      }

      const conflictingClassNames = conflicts.map(([conflictingClassName]) => conflictingClassName);
      const conflictingProperties = conflicts.reduce<string[]>((acc, [, properties]) => {
        for(const property of properties){
          if(!acc.includes(property.cssPropertyName)){
            acc.push(property.cssPropertyName);
          }
        }
        return acc;
      }, []);

      const conflictingClassString = conflictingClassNames.join(", ");
      const conflictingPropertiesString = conflictingProperties.map(conflictingProperty => `"${conflictingProperty}"`).join(", ");

      return {
        message: augmentMessageWithWarnings(
          `Conflicting class detected: "${className}" and "${conflictingClassString}" apply the same CSS properties: ${conflictingPropertiesString}.`,
          DOCUMENTATION_URL,
          warnings
        )

      };

    });

  }
}


export function getOptions(ctx: Rule.RuleContext) {
  return getCommonOptions(ctx);
}
