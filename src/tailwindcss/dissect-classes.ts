import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async, Warning } from "better-tailwindcss:types/async.js";


export interface GetDissectedClassRequest {
  classes: string[];
  configPath: string | undefined;
  cwd: string;
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

export const getDissectedClasses = createSyncFn<
  Async<GetDissectedClassRequest, GetDissectedClassResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./dissect-classes.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
