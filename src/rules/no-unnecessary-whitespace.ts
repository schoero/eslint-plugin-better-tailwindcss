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
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import { getExactClassLocation, splitClasses, splitWhitespaces } from "better-tailwindcss:utils/utils.js";

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
      allowMultiline?: boolean;
    }
  >
];

const defaultOptions = {
  allowMultiline: true,
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unnecessary-whitespace.md";

export const noUnnecessaryWhitespace: ESLintRule<Options> = {
  name: "no-unnecessary-whitespace" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        category: "Stylistic Issues",
        description: "Disallow unnecessary whitespace between Tailwind CSS classes.",
        recommended: true,
        url: DOCUMENTATION_URL
      },
      fixable: "whitespace",
      schema: [
        {
          additionalProperties: false,
          properties: {
            allowMultiline: {
              default: defaultOptions.allowMultiline,
              description: "Allow multi-line class declarations. If this option is disabled, template literal strings will be collapsed into a single line string wherever possible. Must be set to `true` when used in combination with [better-tailwindcss/enforce-consistent-line-wrapping](./enforce-consistent-line-wrapping.md).",
              type: "boolean"
            },
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

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  const { allowMultiline } = getOptions(ctx);

  for(const literal of literals){

    const classChunks = splitClasses(literal.content);
    const whitespaceChunks = splitWhitespaces(literal.content);

    for(let whitespaceIndex = 0, stringIndex = 0; whitespaceIndex < whitespaceChunks.length; whitespaceIndex++){

      const isFirstChunk = whitespaceIndex === 0;
      const isLastChunk = whitespaceIndex === whitespaceChunks.length - 1;

      const startIndex = stringIndex;

      stringIndex += whitespaceChunks[whitespaceIndex].length;

      const endIndex = stringIndex;

      const className = classChunks[whitespaceIndex] ?? "";

      stringIndex += className.length;

      const [literalStart] = literal.range;

      if(classChunks.length === 0 && !literal.closingBraces && !literal.openingBraces){
        ctx.report({
          fix: fixer => fixer.replaceTextRange(
            [
              literalStart + 1 + startIndex,
              literalStart + 1 + endIndex
            ],
            ""
          ),
          loc: getExactClassLocation(literal, startIndex, endIndex),
          message: "Unnecessary whitespace."
        });
        continue;
      }

      if(whitespaceChunks[whitespaceIndex].includes("\n") && allowMultiline === true){
        const whitespaceWithoutLeadingSpaces = whitespaceChunks[whitespaceIndex].replace(/^ +/, "");

        if(whitespaceChunks[whitespaceIndex] === whitespaceWithoutLeadingSpaces){
          continue;
        }

        ctx.report({
          fix: fixer => fixer.replaceTextRange(
            [
              literalStart + 1 + startIndex,
              literalStart + 1 + endIndex
            ],
            whitespaceWithoutLeadingSpaces
          ),
          loc: getExactClassLocation(literal, startIndex, endIndex),
          message: "Unnecessary whitespace."
        });

        continue;
      }

      if(
        !isFirstChunk && !isLastChunk ||
        (
          literal.type === "TemplateLiteral" && literal.closingBraces && isFirstChunk && !isLastChunk ||
          literal.type === "TemplateLiteral" && literal.openingBraces && isLastChunk && !isFirstChunk ||
          literal.type === "TemplateLiteral" && literal.closingBraces && literal.openingBraces
        )
      ){
        if(whitespaceChunks[whitespaceIndex].length <= 1){
          continue;
        }

        ctx.report({
          fix: fixer => fixer.replaceTextRange(
            [
              literalStart + 1 + startIndex,
              literalStart + 1 + endIndex
            ],
            " "
          ),
          loc: getExactClassLocation(literal, startIndex, endIndex),
          message: "Unnecessary whitespace."
        });

        continue;
      }

      if(isFirstChunk || isLastChunk){
        if(whitespaceChunks[whitespaceIndex] === ""){
          continue;
        }

        ctx.report({
          fix: fixer => fixer.replaceTextRange(
            [
              literalStart + 1 + startIndex,
              literalStart + 1 + endIndex
            ],
            ""
          ),
          loc: getExactClassLocation(literal, startIndex, endIndex),
          message: "Unnecessary whitespace."
        });

        continue;
      }
    }

  }

}

function getOptions(ctx: Rule.RuleContext) {

  const options: Options[0] = ctx.options[0] ?? {};

  const common = getCommonOptions(ctx);

  const allowMultiline = options.allowMultiline ?? defaultOptions.allowMultiline;

  return {
    ...common,
    allowMultiline
  };

}
