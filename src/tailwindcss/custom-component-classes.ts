// runner.js


import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


export type CustomComponentClasses = string[];

export type GetCustomComponentClasses = (ctx: AsyncContext) => {
  customComponentClasses: CustomComponentClasses;
  warnings: (Warning | undefined)[];
};

export let getCustomComponentClasses: GetCustomComponentClasses = () => { throw new Error("getCustomComponentClasses() called before being initialized"); };

export function createGetCustomComponentClasses(ctx: Context): GetCustomComponentClasses {
  const workerPath = getWorkerPath(ctx);
  const workerOptions = getWorkerOptions();
  const runWorker = createSyncFn(workerPath, workerOptions);

  getCustomComponentClasses = ctx => runWorker("getCustomComponentClasses", ctx);

  return getCustomComponentClasses;
}

function getWorkerPath(ctx: Context) {
  return resolve(getCurrentDirectory(), `./tailwind.async.worker.v${ctx.version.major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
