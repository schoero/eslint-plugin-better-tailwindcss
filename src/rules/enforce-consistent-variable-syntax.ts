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
import { createGetDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { buildClass } from "better-tailwindcss:utils/class.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { splitClasses } from "better-tailwindcss:utils/utils.js";

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
    create: ctx => createRuleListener(ctx, initialize, getOptions, lintLiterals),
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

function initialize() {
  createGetDissectedClasses();
}

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  const getDissectedClasses = createGetDissectedClasses();

  const { syntax, tailwindConfig, tsconfig } = getOptions(ctx);
  const { major } = getTailwindcssVersion();

  for(const literal of literals){
    const classes = splitClasses(literal.content);

    const { dissectedClasses } = getDissectedClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

    lintClasses(ctx, literal, className => {
      const dissectedClass = dissectedClasses.find(dissectedClass => dissectedClass.className === className);

      if(!dissectedClass){
        return;
      }

      // skip variable definitions
      if(dissectedClass.base.includes(":")){
        return;
      }

      const {
        after: afterParentheses,
        before: beforeParentheses,
        characters: charactersParentheses
      } = extractBalanced(dissectedClass.base);

      const {
        after: afterSquareBrackets,
        before: beforeSquareBrackets,
        characters: charactersSquareBrackets
      } = extractBalanced(dissectedClass.base, "[", "]");

      if(syntax === "parentheses" || syntax === "shorthand"){

        if(!charactersSquareBrackets){
          return;
        }

        if(isBeginningOfArbitraryVariable(charactersSquareBrackets)){

          const { after, characters } = extractBalanced(charactersSquareBrackets);

          if(trimTailwindWhitespace(after).length > 0){
            return;
          }

          const fixedClass = major >= TailwindcssVersion.V4
            ? buildClass({ ...dissectedClass, base: [...beforeSquareBrackets, `(${characters})`, ...afterSquareBrackets].join("") })
            : buildClass({ ...dissectedClass, base: [...beforeSquareBrackets, `[${characters}]`, ...afterSquareBrackets].join("") });

          return {
            fix: fixedClass,
            message: `Incorrect variable syntax: "${className}".`
          };

        }

        if(isBeginningOfArbitraryShorthand(charactersSquareBrackets)){
          if(major <= TailwindcssVersion.V3){
            return;
          }

          const fixedClass = buildClass({
            ...dissectedClass,
            base: [...beforeSquareBrackets, `(${charactersSquareBrackets})`, ...afterSquareBrackets].join("")
          });

          return {
            fix: fixedClass,
            message: `Incorrect variable syntax: "${className}".`
          };

        }
      }

      if(syntax === "arbitrary" || syntax === "variable"){

        if(charactersSquareBrackets && isBeginningOfArbitraryVariable(charactersSquareBrackets)){
          return;
        }

        if(isBeginningOfArbitraryShorthand(charactersSquareBrackets)){

          const fixedClass = buildClass({
            ...dissectedClass,
            base: [...beforeSquareBrackets, `[var(${charactersSquareBrackets})]`, ...afterSquareBrackets].join("")
          });

          return {
            fix: fixedClass,
            message: `Incorrect variable syntax: "${className}".`
          };
        }

        if(isBeginningOfArbitraryShorthand(charactersParentheses)){

          const fixedClass = buildClass({
            ...dissectedClass,
            base: [
              ...beforeParentheses,
              `[var(${charactersParentheses})]`,
              ...afterParentheses
            ].join("")
          });

          return {
            fix: fixedClass,
            message: `Incorrect variable syntax: "${className}".`
          };

        }
      }

    });
  }
}

function isBeginningOfArbitraryShorthand(base: string): boolean {
  return !!base.match(/^_*--/);
}

function isBeginningOfArbitraryVariable(base: string): boolean {
  return !!base.match(/^_*var\(_*--/);
}

function extractBalanced(className: string, start = "(", end = ")") {
  const before: string[] = [];
  const characters: string[] = [];
  const after: string[] = [];

  for(let i = 0, parenthesesCount = 0, hasStarted: boolean = false, hasEnded: boolean = false; i < className.length; i++){
    if(className[i] === start){
      parenthesesCount++;

      if(!hasStarted){
        hasStarted = true;
        continue;
      }
    }

    if(!hasStarted && !hasEnded){
      before.push(className[i]);
      continue;
    }

    if(className[i] === end){
      parenthesesCount--;

      if(parenthesesCount === 0){
        hasEnded = true;
        continue;
      }
    }

    if(!hasEnded){
      characters.push(className[i]);
      continue;
    } else {
      after.push(className[i]);
    }
  }

  return {
    after: after.join(""),
    before: before.join(""),
    characters: characters.join("")
  };
}

function trimTailwindWhitespace(className: string): string {
  return className.replace(/^_+|_+$/g, "");
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
