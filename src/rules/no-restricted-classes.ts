import {
  array,
  description,
  optional,
  pipe,
  strictObject,
  string,
  union
} from "valibot";

import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { replacePlaceholders } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context } from "better-tailwindcss:types/rule.js";


export const noRestrictedClasses = createRule({
  autofix: true,
  category: "correctness",
  description: "Disallow restricted classes.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-restricted-classes.md",
  name: "no-restricted-classes",
  recommended: false,

  schema: strictObject({
    restrict: optional(
      array(
        union([
          strictObject(
            {
              fix: optional(
                pipe(
                  string(),
                  description("A replacement class")
                )
              ),
              message: optional(
                pipe(
                  string(),
                  description("The message to report when a class is restricted.")
                )
              ),
              pattern: pipe(
                string(),
                description("The regex pattern to match restricted classes.")
              )
            }
          ),
          string()
        ])
      ),
      []
    )
  }),

  lintLiterals: (ctx, literals) => lintLiterals(ctx, literals)
});


function lintLiterals(ctx: Context<typeof noRestrictedClasses>, literals: Literal[]) {

  const { restrict: restrictions } = ctx.options;

  for(const literal of literals){
    lintClasses(ctx, literal, (className, classes) => {

      for(const restriction of restrictions){
        const pattern = typeof restriction === "string"
          ? restriction
          : restriction.pattern;

        const matches = className.match(pattern);

        if(!matches){
          continue;
        }

        const message = typeof restriction === "string" || !restriction.message
          ? `Restricted class: "${className}".`
          : replacePlaceholders(restriction.message, matches);

        if(typeof restriction === "string"){
          return {
            message
          } as const;
        }

        if(restriction.fix !== undefined){
          return {
            fix: replacePlaceholders(restriction.fix, matches),
            message
          } as const;
        }

        return {
          message
        } as const;
      }
    });
  }
}
