import { description, literal, object, optional, pipe, union } from "valibot";

import { createGetDissectedClasses, getDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { buildClass } from "better-tailwindcss:utils/class.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { splitClasses } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context } from "better-tailwindcss:types/rule.js";


export const enforceConsistentVariableSyntax = createRule({
  autofix: true,
  category: "stylistic",
  description: "Enforce consistent syntax for css variables.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-variable-syntax.md",
  name: "enforce-consistent-variable-syntax",
  recommended: false,

  messages: {
    incorrect: "Incorrect variable syntax: {{className}}."
  },

  schema: object({
    syntax: optional(
      pipe(
        union([
          literal("shorthand"),
          literal("variable"),

          // TODO: remove in v4
          pipe(literal("arbitrary"), description("@deprecated Use 'variable' instead.")),
          pipe(literal("parentheses"), description("@deprecated Use 'shorthand' instead."))
        ]),
        description("The syntax to enforce for css variables in tailwindcss class strings.")
      ),
      "shorthand"
    )
  }),

  initialize: () => {
    createGetDissectedClasses();
  },

  lintLiterals: (ctx, literals) => lintLiterals(ctx, literals)
});


function lintLiterals(ctx: Context<typeof enforceConsistentVariableSyntax>, literals: Literal[]) {

  const { entryPoint, syntax, tailwindConfig, tsconfig } = ctx.options;
  const { major } = getTailwindcssVersion();

  for(const literal of literals){
    const classes = splitClasses(literal.content);

    const { dissectedClasses } = getDissectedClasses({ classes, configPath: entryPoint ?? tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

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
            data: { className },
            fix: fixedClass,
            id: "incorrect"
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
            data: { className },
            fix: fixedClass,
            id: "incorrect"
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
            data: { className },
            fix: fixedClass,
            id: "incorrect"
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
            data: { className },
            fix: fixedClass,
            id: "incorrect"
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
