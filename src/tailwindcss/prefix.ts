import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";


export type Prefix = string;
export type Suffix = string;

export interface GetPrefixRequest {
  configPath: string | undefined;
  cwd: string;
  tsconfigPath: string | undefined;
}

export interface GetPrefixResponse { prefix: Prefix; suffix: Suffix; warnings: (Warning | undefined)[]; }

export function getPrefix(req: GetPrefixRequest): GetPrefixResponse {
  const workerPath = getWorkerPath();
  const workerOptions = getWorkerOptions();

  return createSyncFn(workerPath, workerOptions)(req);
}

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./prefix.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
