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
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/version.js";

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
      syntax?: "arbitrary" | "parentheses" | "shorthand" | "variable";
    }
  >
];


const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  syntax: "shorthand",
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-variable-syntax.md";

export const enforceConsistentVariableSyntax: ESLintRule<Options> = {
  name: "enforce-consistent-variable-syntax" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Enforce consistent syntax for css variables.",
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
            syntax: {
              default: "shorthand",
              description: "Preferred syntax for CSS variables. 'variable' uses [var(--foo)], 'shorthand' uses (--foo) in Tailwind CSS v4 or [--foo] in Tailwind CSS v3.",
              enum: ["arbitrary", "parentheses", "shorthand", "variable"],
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

  const { syntax } = getOptions(ctx);
  const { major } = getTailwindcssVersion();

  for(const literal of literals){

    lintClasses(ctx, literal, className => {

      for(
        let i = 0,
          isInsideVar: boolean = false,
          isInsideBrackets: boolean = false,
          characters: string[] = [];
        i < className.length;
        i++){
        characters.push(className[i]);

        if(syntax === "arbitrary" || syntax === "variable"){

          if(isInsideVar){
            continue;
          }

          if(isBeginningOfParenthesizedVariable(characters)){
            isInsideVar = true;

            const start = i + 1 - 3;

            const [balancedContent] = extractBalanced(className.slice(start), "(", ")");

            if(!balancedContent){
              continue;
            }

            const end = start + balancedContent.length + 2;

            const fixedVariable = `${className.slice(0, start)}[var(${balancedContent})]${className.slice(end)}`;

            return {
              fix: fixedVariable,
              message: `Incorrect variable syntax: "${balancedContent}".`
            };

          }

          if(isBeginningOfArbitraryShorthand(characters)){
            const start = i + 1 - (findOpeningBracketOffset(characters) ?? 0);

            const [balancedArbitraryContent] = extractBalanced(className.slice(start), "[", "]");

            if(!balancedArbitraryContent){
              continue;
            }

            const end = start + balancedArbitraryContent.length + 2;

            const fixedVariable = `${className.slice(0, start)}[var(${balancedArbitraryContent})]${className.slice(end)}`;

            return {
              fix: fixedVariable,
              message: `Incorrect variable syntax: "[${balancedArbitraryContent}]".`
            };

          }
        }

        if(syntax === "parentheses" || syntax === "shorthand"){
          if(isBeginningOfArbitraryVariable(characters)){
            if(isInsideBrackets){
              continue;
            }

            const start = i + 1 - (findOpeningBracketOffset(characters) ?? 0);

            const [balancedArbitraryContent] = extractBalanced(className.slice(start), "[", "]");
            const [balancedVariableContent] = extractBalanced(className.slice(start));

            if(!balancedArbitraryContent || !balancedVariableContent){
              continue;
            }

            const end = start + balancedArbitraryContent.length + 2;

            const fixedVariable = major >= TailwindcssVersion.V4
              ? `${className.slice(0, start)}(${balancedVariableContent})${className.slice(end)}`
              : `${className.slice(0, start)}[${balancedVariableContent}]${className.slice(end)}`;

            return {
              fix: fixedVariable,
              message: `Incorrect variable syntax: "${balancedArbitraryContent}".`
            };

          }

          if(isBeginningOfArbitraryShorthand(characters)){
            if(major <= TailwindcssVersion.V3){
              continue;
            }

            const start = i + 1 - (findOpeningBracketOffset(characters) ?? 0);

            const [balancedArbitraryContent] = extractBalanced(className.slice(start), "[", "]");

            if(!balancedArbitraryContent){
              continue;
            }

            const end = start + balancedArbitraryContent.length + 2;

            const fixedVariable = `${className.slice(0, start)}(${balancedArbitraryContent})${className.slice(end)}`;

            return {
              fix: fixedVariable,
              message: `Incorrect variable syntax: "[${balancedArbitraryContent}]".`
            };

          }

        }
      }
    });
  }
}

function isBeginningOfParenthesizedVariable(characters: string[]): boolean {
  return (
    isBeginningOfArbitrarySyntax(characters, "(--") &&
    !isBeginningOfArbitrarySyntax(characters, "[var(--")
  );
}

function isBeginningOfArbitraryShorthand(characters: string[]): boolean {
  return isBeginningOfArbitrarySyntax(characters, "[--");
}

function isBeginningOfArbitraryVariable(characters: string[]): boolean {
  return isBeginningOfArbitrarySyntax(characters, "[var(--");
}

function isBeginningOfArbitrarySyntax(characters: string[], syntax: string): boolean {
  const toBe = syntax.split("");

  for(let i = characters.length - 1; i >= 0; i--){

    if(toBe.length === 0){
      return true;
    }

    const expectedChar = toBe[toBe.length - 1];
    const character = characters[i];

    if(i < 0){
      return false;
    }

    if(character !== expectedChar){
      if(character === "_"){
        continue;
      }

      return false;
    }

    toBe.pop();
  }

  return false;
}

function findOpeningBracketOffset(characters: string[]) {
  for(let i = characters.length - 1; i >= 0; i--){
    if(characters[i] === "["){
      return characters.length - i;
    }
  }
}

function extractBalanced(className: string, start = "(", end = ")"): string[] {
  const results: string[] = [];
  const characters: string[] = [];

  for(let i = 0, parenthesesCount = 0, hasStarted: boolean = false; i < className.length; i++){
    if(className[i] === start){
      parenthesesCount++;

      if(!hasStarted){
        hasStarted = true;
        continue;
      }
    }

    if(!hasStarted){
      continue;
    }

    if(className[i] === end){
      parenthesesCount--;

      if(parenthesesCount === 0){
        results.push(characters.join(""));
        characters.length = 0;
        hasStarted = false;
        continue;
      }
    }

    characters.push(className[i]);
  }

  return results;
}

export function getOptions(ctx: Rule.RuleContext) {

  const options: Options[0] = ctx.options[0] ?? {};
  const common = getCommonOptions(ctx);

  const syntax = options.syntax ?? defaultOptions.syntax;

  return {
    ...common,
    syntax
  };

}
