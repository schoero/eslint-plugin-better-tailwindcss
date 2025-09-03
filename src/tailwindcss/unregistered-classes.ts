import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";


export type UnregisteredClass = string;

export interface GetUnregisteredClassesRequest {
  classes: string[];
  configPath: string | undefined;
  cwd: string;
  tsconfigPath: string | undefined;
}

export type GetUnregisteredClassesResponse = { unregisteredClasses: UnregisteredClass[]; warnings: (Warning | undefined)[]; };

type GetUnregisteredClasses = (req: GetUnregisteredClassesRequest) => GetUnregisteredClassesResponse;

export let getUnregisteredClasses: GetUnregisteredClasses;

export function createGetUnregisteredClasses(): GetUnregisteredClasses {
  if(getUnregisteredClasses){
    return getUnregisteredClasses;
  }

  const workerPath = getWorkerPath();
  const workerOptions = getWorkerOptions();

  getUnregisteredClasses = createSyncFn(workerPath, workerOptions);

  return getUnregisteredClasses;
}

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./unregistered-classes.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
