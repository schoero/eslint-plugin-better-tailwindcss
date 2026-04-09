import { createGetDissectedClasses, getDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { createGetVariantOrder, getVariantOrder } from "better-tailwindcss:tailwindcss/variant-order.js";
import { buildClass } from "better-tailwindcss:utils/class.js";
import { async } from "better-tailwindcss:utils/context.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { splitClasses } from "better-tailwindcss:utils/utils.js";


export const enforceConsistentVariantOrder = createRule({
  autofix: true,
  category: "stylistic",
  description: "Enforce a consistent variant order for Tailwind classes.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-variant-order.md",
  name: "enforce-consistent-variant-order",
  recommended: false,

  messages: {
    order: "Incorrect variant order. '{{ className }}' should be '{{ fix }}'."
  },

  initialize: ctx => {
    createGetDissectedClasses(ctx);
    createGetVariantOrder(ctx);
  },

  lintLiterals: (ctx, literals) => {
    if(ctx.version.major <= 3){
      return;
    }

    for(const literal of literals){
      const classes = splitClasses(literal.content);
      const { dissectedClasses, warnings: dissectedWarnings } = getDissectedClasses(async(ctx), classes);
      const { variantOrder, warnings } = getVariantOrder(async(ctx), classes);
      const allWarnings = [...dissectedWarnings, ...warnings];

      lintClasses(ctx, literal, className => {
        const dissectedClass = dissectedClasses[className];

        if(!dissectedClass?.variants || dissectedClass.variants.length <= 1){
          return;
        }

        if(dissectedClass.variants.some(variant => variantOrder[variant] === undefined)){
          return;
        }

        const sortedVariants = dissectedClass.variants.toSorted((variantA, variantB) => {
          return compareVariantOrder(
            variantOrder[variantA],
            variantOrder[variantB]
          );
        });

        if(dissectedClass.variants.every((value, index) => value === sortedVariants[index])){
          return false;
        }


        const fix = buildClass(ctx, {
          ...dissectedClass,
          variants: sortedVariants
        });

        return {
          data: {
            className,
            fix
          },
          fix,
          id: "order",
          warnings: allWarnings
        } as const;
      });
    }
  }
});

function compareVariantOrder(orderA: number | undefined, orderB: number | undefined): number {
  if(orderA === orderB){
    return 0;
  }

  if(orderA === undefined){
    return +1;
  }

  if(orderB === undefined){
    return -1;
  }

  // Match Tailwind language service behavior: variants with higher order index come first.
  return +(orderB - orderA > 0) - +(orderB - orderA < 0);
}
