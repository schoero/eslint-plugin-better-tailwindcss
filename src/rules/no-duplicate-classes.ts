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
import { isClassSticky, splitClasses } from "better-tailwindcss:utils/utils.js";

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
    VariableOption
  >
];

const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-duplicate-classes.md";

export const noDuplicateClasses: ESLintRule<Options> = {
  name: "no-duplicate-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, initialize, getOptions, lintLiterals),
    meta: {
      docs: {
        category: "Stylistic Issues",
        description: "Disallow duplicate class names in tailwind classes.",
        recommended: true,
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
            ...TAG_SCHEMA
          },
          type: "object"
        }
      ],
      type: "layout"
    }
  }
};

function initialize() {}

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {
  for(const literal of literals){

    const parentClasses = literal.priorLiterals
      ? getClassesFromLiteralNodes(literal.priorLiterals)
      : [];

    lintClasses(ctx, literal, (className, index, after) => {

      const duplicateClassIndex = after.findIndex((afterClass, afterIndex) => afterClass === className && afterIndex < index);

      // always keep sticky classes
      if(isClassSticky(literal, index) || isClassSticky(literal, duplicateClassIndex)){
        return;
      }

      if(parentClasses.includes(className) || duplicateClassIndex !== -1){
        return {
          fix: "",
          message: `Duplicate classname: "${className}}".`
        };
      }
    });
  }
}

function getClassesFromLiteralNodes(literals: Literal[]) {
  return literals.reduce<string[]>((combinedClasses, literal) => {
    if(!literal){ return combinedClasses; }

    const classes = literal.content;
    const split = splitClasses(classes);

    for(const className of split){
      if(!combinedClasses.includes(className)){
        combinedClasses.push(className);
      }
    }

    return combinedClasses;

  }, []);
}

function getOptions(ctx: Rule.RuleContext) {
  return getCommonOptions(ctx);
}
