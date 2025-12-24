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

  messages: {
    canonical: "The class: \"{{ className }}\" can be simplified to \"{{canonicalClass}}\"."
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

    const { canonicalClasses, warnings } = getCanonicalClasses(async(ctx), uniqueClasses);

    lintClasses(ctx, literal, className => {
      const uniqueIndex = uniqueClasses.indexOf(className);
      const canonicalClass = canonicalClasses[uniqueIndex];

      if(!canonicalClass || canonicalClass === className){
        return;
      }

      return {
        data: { canonicalClass, className },
        fix: canonicalClass,
        id: "canonical",
        warnings
      };
    });
  }
}
