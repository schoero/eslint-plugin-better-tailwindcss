import { createRunOperation, getOrRunOperation } from "better-tailwindcss:tailwindcss/operation.js";
import { cacheKey } from "better-tailwindcss:utils/cache.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


export type ConflictingClasses = {
  [className: string]: {
    [conflictingClassName: string]: {
      cssPropertyName: string;
      important: boolean;
      cssPropertyValue?: string;
    }[];
  };
};

export type GetConflictingClasses = (ctx: AsyncContext, classes: string[]) => {
  conflictingClasses: ConflictingClasses;
  warnings: (Warning | undefined)[];
};

export let getConflictingClasses: GetConflictingClasses = () => { throw new Error("getConflictingClasses() called before being initialized"); };

export function createGetConflictingClasses(ctx: Context): GetConflictingClasses {
  const runOperation = createRunOperation(ctx);

  getConflictingClasses = (ctx, classes) => ({
    conflictingClasses: getOrRunOperation(ctx, cacheKey("conflicting-classes", ctx.contextKey, ...classes), () => runOperation("getConflictingClasses", ctx, classes)),
    warnings: ctx.warnings
  });

  return getConflictingClasses;
}
