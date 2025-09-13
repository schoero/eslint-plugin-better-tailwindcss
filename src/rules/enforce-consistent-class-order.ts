import { description, literal, object, optional, pipe, union } from "valibot";

import { createGetClassOrder, getClassOrder } from "better-tailwindcss:tailwindcss/class-order.js";
import { createGetDissectedClasses, getDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { async } from "better-tailwindcss:utils/context.js";
import { escapeNestedQuotes } from "better-tailwindcss:utils/quotes.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { display, splitClasses, splitWhitespaces } from "better-tailwindcss:utils/utils.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";


export const enforceConsistentClassOrder = createRule({
  autofix: true,
  category: "stylistic",
  description: "Enforce a consistent order for tailwind classes.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-class-order.md",
  name: "enforce-consistent-class-order",
  recommended: true,

  messages: {
    order: "Incorrect class order. Expected\n\n{{ notSorted }}\n\nto be\n\n{{ sorted }}"
  },

  schema: object({
    order: optional(
      pipe(
        union([
          literal("asc"),
          literal("desc"),
          literal("official"),
          literal("improved")
        ]),
        description("The algorithm to use when sorting classes.")
      ),
      "improved"
    )
  }),

  initialize: (ctx: Context) => {
    createGetClassOrder(ctx);
    createGetDissectedClasses(ctx);
  },

  lintLiterals: (ctx, literals) => {

    for(const literal of literals){

      const classChunks = splitClasses(literal.content);
      const whitespaceChunks = splitWhitespaces(literal.content);

      const unsortableClasses: [string, string] = ["", ""];

      // remove sticky classes
      if(literal.closingBraces && whitespaceChunks[0] === ""){
        whitespaceChunks.shift();
        unsortableClasses[0] = classChunks.shift() ?? "";
      }
      if(literal.openingBraces && whitespaceChunks[whitespaceChunks.length - 1] === ""){
        whitespaceChunks.pop();
        unsortableClasses[1] = classChunks.pop() ?? "";
      }

      const [sortedClassChunks, warnings] = sortClassNames(ctx, classChunks);

      const classes: string[] = [];

      for(let i = 0; i < Math.max(sortedClassChunks.length, whitespaceChunks.length); i++){
        whitespaceChunks[i] && classes.push(whitespaceChunks[i]);
        sortedClassChunks[i] && classes.push(sortedClassChunks[i]);
      }

      const escapedClasses = escapeNestedQuotes(
        [
          unsortableClasses[0],
          ...classes,
          unsortableClasses[1]
        ].join(""),
        literal.openingQuote ?? literal.closingQuote ?? "`"
      );

      const fixedClasses = [
        literal.openingQuote ?? "",
        literal.type === "TemplateLiteral" && literal.closingBraces ? literal.closingBraces : "",
        escapedClasses,
        literal.type === "TemplateLiteral" && literal.openingBraces ? literal.openingBraces : "",
        literal.closingQuote ?? ""
      ].join("");

      if(literal.raw === fixedClasses){
        continue;
      }

      ctx.report({
        data: {
          notSorted: display(literal.raw),
          sorted: display(fixedClasses)
        },
        fix: fixedClasses,
        id: "order",
        range: literal.range,
        warnings
      });
    }
  }
});


function sortClassNames(ctx: Context<typeof enforceConsistentClassOrder>, classes: string[]): [classes: string[], warnings?: (Warning | undefined)[]] {

  const { order } = ctx.options;

  if(order === "asc"){
    return [classes.toSorted((a, b) => a.localeCompare(b))];
  }

  if(order === "desc"){
    return [classes.toSorted((a, b) => b.localeCompare(a))];
  }

  const { classOrder, warnings } = getClassOrder(async(ctx), classes);
  const { dissectedClasses } = getDissectedClasses(async(ctx), classes);

  const officiallySortedClasses = classOrder
    .toSorted(([, a], [, z]) => {
      if(a === z){ return 0; }
      if(a === null){ return -1; }
      if(z === null){ return +1; }
      return +(a - z > 0n) - +(a - z < 0n);
    })
    .map(([className]) => className);

  if(order === "official"){
    return [officiallySortedClasses, warnings];
  }

  const groupedByVariant = new Map<string, string[]>();

  for(const className of officiallySortedClasses){
    const dissectedClass = dissectedClasses.find(dissectedClass => dissectedClass.className === className);
    const variants = dissectedClass?.variants.join(":") ?? "";
    groupedByVariant.set(variants, [...groupedByVariant.get(variants) ?? [], className]);
  }

  return [Array.from(groupedByVariant.values()).flat(), warnings];

}
