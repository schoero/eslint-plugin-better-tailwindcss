import { createRunOperation, getOrRunOperation } from "better-tailwindcss:tailwindcss/operation.js";
import { cacheKey } from "better-tailwindcss:utils/cache.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


export type VariantOrder = Record<string, number | undefined>;

export type GetVariantOrder = (ctx: AsyncContext, classes: string[]) => {
  variantOrder: VariantOrder;
  warnings: (Warning | undefined)[];
};

export let getVariantOrder: GetVariantOrder = () => { throw new Error("getVariantOrder() called before being initialized"); };

export function createGetVariantOrder(ctx: Context): GetVariantOrder {
  const runOperation = createRunOperation(ctx);

  getVariantOrder = (ctx, classes) => ({
    variantOrder: getOrRunOperation(ctx, cacheKey("variant-order", ctx.contextKey, ...classes), () => runOperation("getVariantOrder", ctx, classes)),
    warnings: ctx.warnings
  });

  return getVariantOrder;
}
