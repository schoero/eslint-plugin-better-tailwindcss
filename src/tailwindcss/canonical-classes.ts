import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


export type CanonicalClasses = {
  [originalClass: string]: {
    input: string[];
    output: string;
  };
};
export type CanonicalClassOptions = { collapse?: boolean; logicalToPhysical?: boolean; rem?: number; };

export type GetCanonicalClasses = (ctx: AsyncContext, classes: string[], options: CanonicalClassOptions) => {
  canonicalClasses: CanonicalClasses;
  warnings: (Warning | undefined)[];
};

export let getCanonicalClasses: GetCanonicalClasses = () => { throw new Error("getCanonicalClasses() called before being initialized"); };

export function createGetCanonicalClasses(ctx: Context): GetCanonicalClasses {
  const workerPath = getWorkerPath(ctx);
  const workerOptions = getWorkerOptions();

  getCanonicalClasses = createSyncFn(workerPath, workerOptions);

  return getCanonicalClasses;
}

function getWorkerPath(ctx: Context) {
  return resolve(getCurrentDirectory(), `./canonical-classes.async.worker.v${ctx.version.major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
