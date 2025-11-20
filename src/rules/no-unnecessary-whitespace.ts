import { boolean, description, object, optional, pipe } from "valibot";

import { createRule } from "better-tailwindcss:utils/rule.js";
import { splitClasses, splitWhitespaces } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context } from "better-tailwindcss:types/rule.js";


export const noUnnecessaryWhitespace = createRule({
  autofix: true,
  category: "stylistic",
  description: "Disallow unnecessary whitespace between Tailwind CSS classes.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unnecessary-whitespace.md",
  name: "no-unnecessary-whitespace",
  recommended: true,

  messages: {
    unnecessary: "Unnecessary whitespace."
  },

  schema: object({
    allowMultiline: optional(pipe(
      boolean(),
      description("Allow multi-line class declarations. If this option is disabled, template literal strings will be collapsed into a single line string wherever possible. Must be set to `true` when used in combination with [better-tailwindcss/enforce-consistent-line-wrapping](./enforce-consistent-line-wrapping.md).")
    ), true)
  }),

  lintLiterals: (ctx, literals) => lintLiterals(ctx, literals)
});

function lintLiterals(ctx: Context<typeof noUnnecessaryWhitespace>, literals: Literal[]) {

  const { allowMultiline } = ctx.options;

  for(const literal of literals){

    const classChunks = splitClasses(literal.content);
    const whitespaceChunks = splitWhitespaces(literal.content);

    for(let whitespaceIndex = 0, stringIndex = 0; whitespaceIndex < whitespaceChunks.length; whitespaceIndex++){

      const isFirstChunk = whitespaceIndex === 0;
      const isLastChunk = whitespaceIndex === whitespaceChunks.length - 1;

      const startIndex = stringIndex;

      const whitespace = whitespaceChunks[whitespaceIndex];

      stringIndex += whitespace.length;

      const endIndex = stringIndex;

      const className = classChunks[whitespaceIndex] ?? "";

      stringIndex += className.length;

      const [literalStart] = literal.range;

      // whitespaces only
      if(classChunks.length === 0 && !literal.closingBraces && !literal.openingBraces){
        if(whitespace === ""){
          continue;
        }

        ctx.report({
          fix: "",
          id: "unnecessary",
          range: [
            literalStart + 1 + startIndex,
            literalStart + 1 + endIndex
          ]
        });
        continue;
      }

      // trailing whitespace before multiline string
      if(whitespace.includes("\n") && allowMultiline === true){
        const whitespaceWithoutLeadingSpaces = whitespace.replace(/^ +/, "");

        if(whitespace === whitespaceWithoutLeadingSpaces){
          continue;
        }

        ctx.report({
          fix: whitespaceWithoutLeadingSpaces,
          id: "unnecessary",
          range: [
            literalStart + 1 + startIndex,
            literalStart + 1 + endIndex
          ]
        });

        continue;
      }

      // whitespace between interpolated literals
      if(
        !isFirstChunk && !isLastChunk ||
        (
          literal.isInterpolated && literal.closingBraces && isFirstChunk && !isLastChunk ||
          literal.isInterpolated && literal.openingBraces && isLastChunk && !isFirstChunk ||
          literal.isInterpolated && literal.closingBraces && literal.openingBraces
        )
      ){
        if(whitespace.length <= 1){
          continue;
        }

        ctx.report({
          fix: " ",
          id: "unnecessary",
          range: [
            literalStart + 1 + startIndex,
            literalStart + 1 + endIndex
          ]
        });

        continue;
      }

      // leading or trailing whitespace
      if(isFirstChunk || isLastChunk){
        if(whitespace === ""){
          continue;
        }

        ctx.report({
          fix: "",
          id: "unnecessary",
          range: [
            literalStart + 1 + startIndex,
            literalStart + 1 + endIndex
          ]
        });

        continue;
      }
    }

  }

}
