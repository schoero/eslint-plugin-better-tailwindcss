import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

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
  const workerPath = getWorkerPath(ctx);
  const workerOptions = getWorkerOptions();
  const runWorker = createSyncFn(workerPath, workerOptions);

  getUnknownClasses = (ctx, classes) => runWorker("getUnknownClasses", ctx, classes);

  return getUnknownClasses;
}

function getWorkerPath(ctx: Context) {
  return resolve(getCurrentDirectory(), `./tailwind.async.worker.v${ctx.version.major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
