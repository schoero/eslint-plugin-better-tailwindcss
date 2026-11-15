import { array, description, optional, pipe, strictObject, string } from "valibot";

import {
  createGetCustomComponentClasses,
  getCustomComponentClasses
} from "better-tailwindcss:tailwindcss/custom-component-classes.js";
import { createGetDissectedClasses, getDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { createGetPrefix, getPrefix } from "better-tailwindcss:tailwindcss/prefix.js";
import { createGetUnknownClasses, getUnknownClasses } from "better-tailwindcss:tailwindcss/unknown-classes.js";
import { async } from "better-tailwindcss:utils/context.js";
import { escapeForRegex } from "better-tailwindcss:utils/escape.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getCachedRegex } from "better-tailwindcss:utils/regex.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { segment } from "better-tailwindcss:utils/segment.js";
import { isConcatenatedLeft, isConcatenatedRight, splitClasses } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


// arbitrary property that is valid in every configuration, used to check if variants are known
const VARIANT_PROBE = "[color:red]";

export const noUnknownClasses = createRule({
  autofix: false,
  category: "correctness",
  description: "Disallow any css classes that are not registered in tailwindcss.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unknown-classes.md",
  name: "no-unknown-classes",
  recommended: true,

  messages: {
    unknown: "Unknown class detected: {{ className }}"
  },

  schema: strictObject({
    ignore: optional(
      pipe(
        array(
          string()
        ),
        description("A list of regular expression patterns for classes that should be ignored by the rule.")
      ),
      []
    )
  }),

  initialize: ctx => {
    const { detectComponentClasses } = ctx.options;

    createGetDissectedClasses(ctx);
    createGetPrefix(ctx);
    createGetUnknownClasses(ctx);

    if(detectComponentClasses){
      createGetCustomComponentClasses(ctx);
    }
  },

  lintLiterals: (ctx, literals) => lintLiterals(ctx, literals)
});


function lintLiterals(ctx: Context<typeof noUnknownClasses>, literals: Literal[]) {

  const { ignore } = ctx.options;

  const asyncCtx = async(ctx);
  const { prefix, suffix } = getPrefix(asyncCtx);

  const ignoredGroups = getCachedRegex(`^${escapeForRegex(`${prefix}${suffix}`)}group(?:\\/(\\S*))?$`);
  const ignoredPeers = getCachedRegex(`^${escapeForRegex(`${prefix}${suffix}`)}peer(?:\\/(\\S*))?$`);

  const customComponentClassRegexes = getCustomComponentClassRegexes(ctx, asyncCtx);

  for(const literal of literals){
    const classes = splitClasses(literal.content);

    const { unknownClasses, warnings } = getUnknownClasses(asyncCtx, classes);

    if(unknownClasses.length === 0){
      continue;
    }

    const { dissectedClasses } = getDissectedClasses(asyncCtx, unknownClasses);

    lintClasses(ctx, literal, (className, classIndex) => {

      const isFirstClass = classIndex === 0;
      const isLastClass = classIndex === classes.length - 1;

      if(
        isFirstClass && isConcatenatedLeft(literal) ||
        isLastClass && isConcatenatedRight(literal)
      ){
        return;
      }

      if(!unknownClasses.includes(className)){
        return;
      }

      if(
        ignore.some(ignoredClass => getCachedRegex(ignoredClass).test(className)) ||
        isIgnoredWithKnownVariants(asyncCtx, ignore, className, dissectedClasses[className]?.separator) ||
        customComponentClassRegexes?.some(customComponentClassesRegex => customComponentClassesRegex.test(className)) ||
        ignoredGroups.test(className) ||
        ignoredPeers.test(className)
      ){
        return;
      }

      return {
        data: {
          className
        },
        id: "unknown",
        warnings
      } as const;

    });
  }
}

function isIgnoredWithKnownVariants(ctx: AsyncContext, ignore: string[], className: string, separator: string = ":"): boolean {
  const utility = segment(className, separator).at(-1) ?? "";
  const variants = className.slice(0, className.length - utility.length);

  if(variants.length === 0 || !ignore.some(ignoredClass => getCachedRegex(ignoredClass).test(utility))){
    return false;
  }

  return getUnknownClasses(ctx, [`${variants}${VARIANT_PROBE}`]).unknownClasses.length === 0;
}

function getCustomComponentClassRegexes(ctx: Context<typeof noUnknownClasses>, asyncCtx: AsyncContext): RegExp[] | undefined {
  const { detectComponentClasses } = ctx.options;

  if(!detectComponentClasses){
    return;
  }

  const { customComponentClasses } = getCustomComponentClasses(asyncCtx);
  const { prefix, suffix } = getPrefix(asyncCtx);

  return customComponentClasses.map(className => getCachedRegex(`^${escapeForRegex(`${prefix}${suffix}`)}(?:.*:)?${escapeForRegex(className)}$`));
}
