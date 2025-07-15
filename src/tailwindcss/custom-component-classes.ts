// runner.js


import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";


export interface GetCustomComponentClassesRequest {
  configPath: string;
  cwd: string;
}

export type GetCustomComponentClassesResponse = string[];

export function getCustomComponentClasses({ configPath, cwd }: { configPath: string | undefined; cwd: string; }) {
  const { path } = getTailwindConfigPath({ configPath, cwd });

  return getCustomComponentClassesSync({ configPath: path, cwd });
}

const getCustomComponentClassesSync = createSyncFn<
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
