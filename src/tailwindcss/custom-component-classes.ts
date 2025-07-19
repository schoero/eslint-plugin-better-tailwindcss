// runner.js


import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async, Warning } from "better-tailwindcss:types/async.js";


export type CustomComponentClasses = string[];

export interface GetCustomComponentClassesRequest {
  configPath: string | undefined;
  cwd: string;
}

export type GetCustomComponentClassesResponse = { customComponentClasses: CustomComponentClasses; warnings: (Warning | undefined)[]; };

export const getCustomComponentClasses = createSyncFn<
  Async<GetCustomComponentClassesRequest, GetCustomComponentClassesResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  return resolve(getCurrentDirectory(), "./custom-component-classes.async.worker.js");
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
