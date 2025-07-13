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
import { getImportantPosition } from "better-tailwindcss:tailwindcss/important-position.js";
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


export type ImportantPosition = "legacy" | "recommended";

export type Options = [
  Partial<
    AttributeOption &
    CalleeOption &
    TagOption &
    VariableOption &
    {
      entryPoint?: string;
      position?: ImportantPosition;
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

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-important-position.md";

export const enforceConsistentImportantPosition: ESLintRule<Options> = {
  name: "enforce-consistent-important-position" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Enforce consistent important position for classes.",
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
            ...TAILWIND_CONFIG_SCHEMA,

            position: {
              description: "Preferred position for important classes. 'legacy' places the important modifier (!) at the start of the class name, 'recommended' places it at the end.",
              enum: ["legacy", "recommended"],
              type: "string"
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

  const { position, tailwindConfig } = getOptions(ctx);

  for(const literal of literals){

    const classes = splitClasses(literal.content);

    const { importantPosition, warnings } = getImportantPosition({ classes, configPath: tailwindConfig, cwd: ctx.cwd, position });

    lintClasses(ctx, literal, (className, index, after) => {
      if(!(className in importantPosition)){
        return;
      }

      return {
        fix: importantPosition[className],
        message: augmentMessageWithWarnings(
          `Incorrect important position. "${className}" should be "${importantPosition[className]}".`,
          DOCUMENTATION_URL,
          warnings
        )
      };
    });

  }
}

export function getOptions(ctx: Rule.RuleContext) {
  const options: Options[0] = ctx.options[0] ?? {};

  const common = getCommonOptions(ctx);

  const position = options.position;

  return {
    ...common,
    position
  };

}
