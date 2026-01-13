import { boolean, description, optional, pipe, strictObject } from "valibot";

import { createGetCanonicalClasses, getCanonicalClasses } from "better-tailwindcss:tailwindcss/canonical-classes.js";
import { async } from "better-tailwindcss:utils/context.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { deduplicateClasses, splitClasses } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context } from "better-tailwindcss:types/rule.js";


export const enforceCanonicalClasses = createRule({
  autofix: true,
  category: "stylistic",
  description: "Enforce canonical class names.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-canonical-classes.md",
  name: "enforce-canonical-classes",
  recommended: true,

  schema: strictObject({
    collapse: optional(
      pipe(
        boolean(),
        description("Whether to collapse multiple utilities into a single utility if possible.")
      ),
      true
    ),
    logical: optional(
      pipe(
        boolean(),
        description("Whether to convert between logical and physical properties when collapsing utilities.")
      ),
      true
    )
  }),

  messages: {
    multiple: "The classes: \"{{ classNames }}\" can be simplified to \"{{canonicalClass}}\".",
    single: "The class: \"{{ className }}\" can be simplified to \"{{canonicalClass}}\"."
  },

  initialize: ctx => {
    createGetCanonicalClasses(ctx);
  },

  lintLiterals: (ctx, literals) => lintLiterals(ctx, literals)
});


function lintLiterals(ctx: Context<typeof enforceCanonicalClasses>, literals: Literal[]) {
  for(const literal of literals){

    const classes = splitClasses(literal.content);
    const uniqueClasses = deduplicateClasses(classes);

    const { collapse, logical, rootFontSize } = ctx.options;

    const { canonicalClasses, warnings } = getCanonicalClasses(async(ctx), uniqueClasses, {
      collapse,
      logicalToPhysical: logical,
      rem: rootFontSize
    });

    lintClasses(ctx, literal, className => {
      const canonicalClass = canonicalClasses[className];

      if(!canonicalClass){
        return;
      }

      if(canonicalClass.input.length > 1){
        return {
          data: {
            canonicalClass: canonicalClasses[className].output,
            classNames: canonicalClass.input.join(", ")
          },
          fix: className === canonicalClass.input[0]
            ? canonicalClass.output
            : "",
          id: "multiple",
          warnings
        } as const;
      }

      if(canonicalClass.input.length === 1 && canonicalClass.output !== className){
        return {
          data: {
            canonicalClass: canonicalClasses[className].output,
            className: canonicalClass.input[0]
          },
          fix: canonicalClass.output,
          id: "single",
          warnings
        } as const;
      }

    });
  }
}
