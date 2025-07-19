import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async, Warning } from "better-tailwindcss:types/async.js";


export type UnregisteredClass = string;

export interface GetUnregisteredClassesRequest {
  classes: string[];
  configPath: string | undefined;
  cwd: string;
}

export type GetUnregisteredClassesResponse = { unregisteredClasses: UnregisteredClass[]; warnings: (Warning | undefined)[]; };

export const getUnregisteredClasses = createSyncFn<
  Async<GetUnregisteredClassesRequest, GetUnregisteredClassesResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./unregistered-classes.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
