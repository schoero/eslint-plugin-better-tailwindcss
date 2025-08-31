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
  TSCONFIG_SCHEMA,
  VARIABLE_SCHEMA
} from "better-tailwindcss:options/descriptions.js";
import { getCustomComponentClasses } from "better-tailwindcss:tailwindcss/custom-component-classes.js";
import { getPrefix } from "better-tailwindcss:tailwindcss/prefix.js";
import { getUnregisteredClasses } from "better-tailwindcss:tailwindcss/unregistered-classes.js";
import { escapeForRegex } from "better-tailwindcss:utils/escape.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import { augmentMessageWithWarnings, splitClasses } from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { AttributeOption, CalleeOption, TagOption, VariableOption } from "better-tailwindcss:types/rule.js";


export type Options = [
  Partial<
    AttributeOption &
    CalleeOption &
    TagOption &
    VariableOption &
    {
      detectComponentClasses?: boolean;
      entryPoint?: string;
      ignore?: string[];
      tailwindConfig?: string;
      tsconfig?: string;
    }
  >
];

export const DEFAULT_IGNORED_UNREGISTERED_CLASSES = [];

const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  detectComponentClasses: false,
  ignore: DEFAULT_IGNORED_UNREGISTERED_CLASSES,
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unregistered-classes.md";

export const noUnregisteredClasses = {
  name: "no-unregistered-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions, lintLiterals),
    meta: {
      docs: {
        description: "Disallow any css classes that are not registered in tailwindcss.",
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
            ...TSCONFIG_SCHEMA,
            detectComponentClasses: {
              default: defaultOptions.detectComponentClasses,
              description: "Whether to automatically detect custom component classes from the tailwindcss config.",
              type: "boolean"
            },
            ignore: {
              description: "A list of classes that should be ignored by the rule.",
              items: {
                type: "string"
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
  const { detectComponentClasses, ignore, tailwindConfig, tsconfig } = getOptions(ctx);

  const { prefix, suffix } = getPrefix({ configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

  const ignoredGroups = new RegExp(`^${escapeForRegex(`${prefix}${suffix}`)}group(?:\\/(\\S*))?$`);
  const ignoredPeers = new RegExp(`^${escapeForRegex(`${prefix}${suffix}`)}peer(?:\\/(\\S*))?$`);

  const { customComponentClasses } = detectComponentClasses
    ? getCustomComponentClasses({ configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig })
    : {};

  for(const literal of literals){

    const classes = splitClasses(literal.content);

    const { unregisteredClasses, warnings } = getUnregisteredClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

    if(unregisteredClasses.length === 0){
      continue;
    }

    lintClasses(ctx, literal, className => {

      if(!unregisteredClasses.includes(className)){
        return;
      }

      if(
        ignore.some(ignoredClass => className.match(ignoredClass)) ||
        customComponentClasses?.includes(className) ||
        className.match(ignoredGroups) ||
        className.match(ignoredPeers)
      ){
        return;
      }

      return {
        message: augmentMessageWithWarnings(
          `Unregistered class detected: ${className}`,
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

  const ignore = options.ignore ?? defaultOptions.ignore;
  const detectComponentClasses = options.detectComponentClasses ?? defaultOptions.detectComponentClasses;

  return {
    ...common,
    detectComponentClasses,
    ignore
  };

}
