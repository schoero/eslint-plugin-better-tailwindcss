// runner.js
import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";


export interface GetConflictingClassesRequest {
  classes: string[];
  configPath: string;
}

export type GetConflictingClassesResponse = ConflictingClasses;

export type ConflictingClasses = {
  [className: string]: {
    [conflictingClassName: string]: {
      cssPropertyName: string;
      important: boolean;
      cssPropertyValue?: string;
    }[];
  };
};


export function getConflictingClasses({ classes, configPath, cwd }: { classes: string[]; configPath: string | undefined; cwd: string; }) {
  const { path, warning } = getTailwindConfigPath({ configPath, cwd });
  const conflictingClasses = getConflictingClassesSync({ classes, configPath: path });

  return { conflictingClasses, warnings: [warning] };
}

const getConflictingClassesSync = createSyncFn<
  Async<GetConflictingClassesRequest, GetConflictingClassesResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./conflicting-classes.async.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
