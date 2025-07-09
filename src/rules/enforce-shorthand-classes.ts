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
import { getShorthandClasses } from "better-tailwindcss:tailwindcss/shorthand-classes.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { escapeNestedQuotes } from "better-tailwindcss:utils/quotes.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import { augmentMessageWithWarnings, display, splitClasses } from "better-tailwindcss:utils/utils.js";

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

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-shorthand-classes.md";

export const enforceShorthandClasses: ESLintRule<Options> = {
  name: "enforce-shorthand-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Enforce shorthand class names instead of longhand class names.",
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

    const { shorthandClasses, warnings } = getShorthandClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd });

    for(const [longhands, shorthands] of shorthandClasses){
      const finalClasses: string[] = [];

      for(const className of classes){

        if(!longhands.includes(className)){
          finalClasses.push(className);
          continue;
        }

        if(shorthands.some(shorthand => finalClasses.includes(shorthand))){
          continue;
        }

        finalClasses.push(...shorthands);
      }

      const escapedClasses = escapeNestedQuotes(
        finalClasses.join(" "),
        literal.openingQuote ?? literal.closingQuote ?? "`"
      );

      const fixedClasses =
      [
        literal.openingQuote ?? "",
        literal.type === "TemplateLiteral" && literal.closingBraces ? literal.closingBraces : "",
        escapedClasses,
        literal.type === "TemplateLiteral" && literal.openingBraces ? literal.openingBraces : "",
        literal.closingQuote ?? ""
      ].join("");

      if(literal.raw === fixedClasses){
        continue;
      }

      ctx.report({
        data: {
          longhand: display(longhands.join(", ")),
          shorthand: display(shorthands.join(", "))
        },
        fix(fixer) {
          return fixer.replaceTextRange(literal.range, fixedClasses);
        },
        loc: literal.loc,
        message: augmentMessageWithWarnings(
          "Non shorthand class detected. Expected {{ longhand }} to be {{ shorthand }}",
          DOCUMENTATION_URL,
          warnings
        )
      });
    }
  }
}

export function getOptions(ctx: Rule.RuleContext) {
  return getCommonOptions(ctx);
}
