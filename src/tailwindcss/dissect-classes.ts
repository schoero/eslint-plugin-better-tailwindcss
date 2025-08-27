import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";


export interface GetDissectedClassRequest {
  classes: string[];
  configPath: string | undefined;
  cwd: string;
  tsconfigPath: string | undefined;
}

export interface DissectedClass {
  base: string;
  className: string;
  important: [start: boolean, end: boolean];
  negative: boolean;
  prefix: string;
  separator: string;
  variants: string[];
}

export type GetDissectedClassResponse = { dissectedClasses: DissectedClass[]; warnings: (Warning | undefined)[]; };

export function createGetDissectedClasses(): (req: GetDissectedClassRequest) => GetDissectedClassResponse {
  const workerPath = getWorkerPath();
  const workerOptions = getWorkerOptions();

  return createSyncFn(workerPath, workerOptions);
}

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./dissect-classes.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
