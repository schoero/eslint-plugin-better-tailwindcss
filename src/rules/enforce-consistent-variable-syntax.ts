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
      syntax?: "arbitrary" | "parentheses";
    }
  >
];


const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  syntax: "parentheses",
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
              default: "parentheses",
              description: "Preferred syntax for CSS variables. 'arbitrary' uses [var(--foo)], 'parentheses' uses (--foo).",
              enum: ["arbitrary", "parentheses"],
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

        if(syntax === "arbitrary"){

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
        }

        if(syntax === "parentheses"){
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

            const fixedVariable = `${className.slice(0, start)}(${balancedVariableContent})${className.slice(end)}`;

            return {
              fix: fixedVariable,
              message: `Incorrect variable syntax: "${balancedArbitraryContent}".`
            };

          }
        }

      }
    });
  }
}

function isBeginningOfParenthesizedVariable(characters: string[]): boolean {
  return characters.slice(-6).join("") !== "var(--" && characters.slice(-3).join("") === "(--";
}

function isBeginningOfArbitraryVariable(characters: string[]): boolean {
  const toBe = "[var(--".split("");

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
      if(expectedChar === "[" && character === "_"){
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
