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
import { getDeprecatedClasses } from "better-tailwindcss:tailwindcss/deprecated-classes.js";
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

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-deprecated-classes.md";

export const noDeprecatedClasses: ESLintRule<Options> = {
  name: "no-deprecated-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Disallow the use of deprecated Tailwind CSS classes.",
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

  const { tailwindConfig } = getOptions(ctx);

  for(const literal of literals){

    const classes = splitClasses(literal.content);

    const { deprecatedClasses, warnings } = getDeprecatedClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd });

    lintClasses(ctx, literal, (className, index, after) => {
      if(!(className in deprecatedClasses)){
        return;
      }

      const replacement = deprecatedClasses[className];

      if(!replacement){
        return {
          message: augmentMessageWithWarnings(
            `Class "${className}" is deprecated. Check the tailwindcss documentation for more information: https://tailwindcss.com/docs/upgrade-guide#removed-deprecated-utilities`,
            DOCUMENTATION_URL,
            warnings
          )
        };
      }

      return {
        message: augmentMessageWithWarnings(
          `Deprecated class detected. Replace "${className}" with ${replacement}.`,
          DOCUMENTATION_URL,
          warnings
        ),
        ...replacement && {
          fix: replacement
        }
      };
    });

  }
}

export function getOptions(ctx: Rule.RuleContext) {
  return getCommonOptions(ctx);
}
