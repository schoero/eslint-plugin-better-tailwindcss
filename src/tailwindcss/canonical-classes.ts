import { createRunOperation, getOrRunOperation } from "better-tailwindcss:tailwindcss/operation.js";
import { cacheKey } from "better-tailwindcss:utils/cache.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


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
      () => {
        const { context, result } = runOperation("getCanonicalClasses", ctx, classes, options);
        return { context, result: withoutUnchangedClasses(result) };
      }
    ),
    warnings: ctx.warnings
  });

  return getCanonicalClasses;
}

// most classes are already canonical, only changed classes are kept to reduce the size of the cached result
function withoutUnchangedClasses(canonicalClasses: CanonicalClasses): CanonicalClasses {
  const changedClasses: CanonicalClasses = Object.create(null);

  for(const className in canonicalClasses){
    const { input, output } = canonicalClasses[className];

    if(input.length !== 1 || input[0] !== className || output !== className){
      changedClasses[className] = canonicalClasses[className];
    }
  }

  return changedClasses;
}
