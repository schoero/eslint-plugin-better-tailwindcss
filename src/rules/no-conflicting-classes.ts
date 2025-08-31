import { getConflictingClasses } from "better-tailwindcss:tailwindcss/conflicting-classes.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getOptions } from "better-tailwindcss:utils/options.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { splitClasses } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context } from "better-tailwindcss:types/rule.js";


export const noConflictingClasses = createRule({
  autofix: true,
  category: "correctness",
  description: "Disallow classes that produce conflicting styles.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-conflicting-classes.md",
  name: "no-conflicting-classes",
  recommended: false,

  messages: {
    conflicting: "Conflicting class detected: \"{{className}}\" and \"{{conflictingClassString}}\" apply the same CSS properties: \"{{conflictingPropertiesString}}\"."
  },

  lintLiterals: (ctx, literals) => lintLiterals(ctx, literals)
});

function lintLiterals(ctx: Context<typeof noConflictingClasses>, literals: Literal[]) {

  for(const literal of literals){

    const { entryPoint, tailwindConfig, tsconfig } = getOptions(ctx, noConflictingClasses);

    const classes = splitClasses(literal.content);

    const { conflictingClasses, warnings } = getConflictingClasses({ classes, configPath: entryPoint ?? tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

    if(Object.keys(conflictingClasses).length === 0){
      continue;
    }

    lintClasses(ctx, literal, className => {
      if(!conflictingClasses[className]){
        return;
      }

      const conflicts = Object.entries(conflictingClasses[className]);

      if(conflicts.length === 0){
        return;
      }

      const conflictingClassNames = conflicts.map(([conflictingClassName]) => conflictingClassName);
      const conflictingProperties = conflicts.reduce<string[]>((acc, [, properties]) => {
        for(const property of properties){
          if(!acc.includes(property.cssPropertyName)){
            acc.push(property.cssPropertyName);
          }
        }
        return acc;
      }, []);

      const conflictingClassString = conflictingClassNames.join(", ");
      const conflictingPropertiesString = conflictingProperties.map(conflictingProperty => `"${conflictingProperty}"`).join(", ");

      return {
        data: {
          className,
          conflictingClassString,
          conflictingPropertiesString
        },
        messageId: "conflicting"
      };

    });

  }
}
