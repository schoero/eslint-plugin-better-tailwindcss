import { createRunOperation, getOrRunOperation } from "better-tailwindcss:tailwindcss/operation.js";
import { cacheKey } from "better-tailwindcss:utils/cache.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


// only contains classes that change, a missing class is already canonical
export type CanonicalClasses = {
  [originalClass: string]: {
    input: string[];
    output: string;
  };
};

export type CanonicalClassOptions = {
  collapse: boolean | undefined;
  logicalToPhysical: boolean | undefined;
  rem: number | undefined;
};

export type GetCanonicalClasses = (ctx: AsyncContext, classes: string[], options: CanonicalClassOptions) => {
  canonicalClasses: CanonicalClasses;
  warnings: (Warning | undefined)[];
};

export let getCanonicalClasses: GetCanonicalClasses = () => { throw new Error("getCanonicalClasses() called before being initialized"); };

export function createGetCanonicalClasses(ctx: Context): GetCanonicalClasses {
  const runOperation = createRunOperation(ctx);

  getCanonicalClasses = (ctx, classes, options) => ({
    canonicalClasses: getOrRunOperation(
      ctx,
      cacheKey("canonical-classes", ctx.contextKey, options.collapse, options.logicalToPhysical, options.rem, ...classes),
      () => runOperation("getCanonicalClasses", ctx, classes, options)
    ),
    warnings: ctx.warnings
  });

  return getCanonicalClasses;
}
