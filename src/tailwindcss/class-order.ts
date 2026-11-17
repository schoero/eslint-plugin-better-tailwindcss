import { createRunOperation, getOrRunOperation } from "better-tailwindcss:tailwindcss/operation.js";
import { cacheKey } from "better-tailwindcss:utils/cache.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


export type ClassOrder = [className: string, order: bigint | null][];

export type GetClassOrder = (ctx: AsyncContext, classes: string[]) => {
  classOrder: ClassOrder;
  warnings: (Warning | undefined)[];
};

export let getClassOrder: GetClassOrder = () => { throw new Error("getClassOrder() called before being initialized"); };

export function createGetClassOrder(ctx: Context): GetClassOrder {
  const runOperation = createRunOperation(ctx);

  getClassOrder = (ctx, classes) => {
    // only the order is cached, the class names are already part of the key and are taken from the input
    const order = getOrRunOperation(ctx, cacheKey("class-order", ctx.contextKey, ...classes), () => {
      const { context, result } = runOperation("getClassOrder", ctx, classes);
      const orderByClass = new Map(result);
      return { context, result: classes.map(className => orderByClass.get(className) ?? null) };
    });

    return {
      classOrder: classes.map((className, index) => [className, order[index]]),
      warnings: ctx.warnings
    };
  };

  return getClassOrder;
}
