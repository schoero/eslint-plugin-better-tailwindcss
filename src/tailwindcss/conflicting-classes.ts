// runner.js
import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

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
  const workerPath = getWorkerPath(ctx);
  const workerOptions = getWorkerOptions();

  getConflictingClasses = createSyncFn(workerPath, workerOptions);

  return getConflictingClasses;
}

function getWorkerPath(ctx: Context) {
  return resolve(getCurrentDirectory(), `./conflicting-classes.async.worker.v${ctx.version.major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
