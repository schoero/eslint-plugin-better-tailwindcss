import { createRunOperation, getOrRunOperationPerClass } from "better-tailwindcss:tailwindcss/operation.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


export type UnknownClass = string;

export type GetUnknownClasses = (ctx: AsyncContext, classes: string[]) => {
  unknownClasses: UnknownClass[];
  warnings: (Warning | undefined)[];
};

export let getUnknownClasses: GetUnknownClasses = () => { throw new Error("getUnknownClasses() called before being initialized"); };

export function createGetUnknownClasses(ctx: Context): GetUnknownClasses {
  const runOperation = createRunOperation(ctx);

  getUnknownClasses = (ctx, classes) => {
    const isUnknown = getOrRunOperationPerClass(ctx, "unknown-class", classes, uncachedClasses => {
      const { context, result } = runOperation("getUnknownClasses", ctx, uncachedClasses);
      const unknownClasses = new Set(result);

      return {
        context,
        result: Object.fromEntries(uncachedClasses.map(className => [className, unknownClasses.has(className)]))
      };
    });

    return {
      unknownClasses: classes.filter(className => isUnknown[className]),
      warnings: ctx.warnings
    };
  };

  return getUnknownClasses;
}
