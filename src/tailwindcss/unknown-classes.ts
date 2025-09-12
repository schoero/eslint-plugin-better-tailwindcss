import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";


export type UnknownClass = string;

export interface GetUnknownClassesRequest {
  classes: string[];
  configPath: string | undefined;
  cwd: string;
  tsconfigPath: string | undefined;
}

export type GetUnknownClassesResponse = { unknownClasses: UnknownClass[]; warnings: (Warning | undefined)[]; };

type GetUnknownClasses = (req: GetUnknownClassesRequest) => GetUnknownClassesResponse;

export let getUnknownClasses: GetUnknownClasses;

export function createGetUnknownClasses(): GetUnknownClasses {
  if(getUnknownClasses){
    return getUnknownClasses;
  }

  const workerPath = getWorkerPath();
  const workerOptions = getWorkerOptions();

  getUnknownClasses = createSyncFn(workerPath, workerOptions);

  return getUnknownClasses;
}

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./unknown-classes.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
