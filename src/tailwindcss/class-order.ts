import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

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
  const workerPath = getWorkerPath(ctx);
  const workerOptions = getWorkerOptions();
  const runWorker = createSyncFn(workerPath, workerOptions) as (
    operation: "class-order",
    ctx: AsyncContext,
    classes: string[]
  ) => ReturnType<GetClassOrder>;

  getClassOrder = (asyncCtx, classes) => runWorker("class-order", asyncCtx, classes);

  return getClassOrder;
}

function getWorkerPath(ctx: Context) {
  return resolve(getCurrentDirectory(), `./tailwind.async.worker.v${ctx.version.major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
