// runner.js
import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";


export type ConflictingClasses = {
  [className: string]: {
    [conflictingClassName: string]: {
      cssPropertyName: string;
      important: boolean;
      cssPropertyValue?: string;
    }[];
  };
};

export interface GetConflictingClassesRequest {
  classes: string[];
  configPath: string | undefined;
  cwd: string;
  tsconfigPath: string | undefined;
}

export type GetConflictingClassesResponse = { conflictingClasses: ConflictingClasses; warnings: (Warning | undefined)[]; };

type GetConflictingClasses = (req: GetConflictingClassesRequest) => GetConflictingClassesResponse;

export let getConflictingClasses: GetConflictingClasses;

export function createGetConflictingClasses(): GetConflictingClasses {
  if(getConflictingClasses){
    return getConflictingClasses;
  }

  const workerPath = getWorkerPath();
  const workerOptions = getWorkerOptions();

  getConflictingClasses = createSyncFn(workerPath, workerOptions);

  return getConflictingClasses;
}

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./conflicting-classes.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
