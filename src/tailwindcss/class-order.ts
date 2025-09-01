import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Warning } from "better-tailwindcss:types/async.js";


export type ClassOrder = [className: string, order: bigint | null][];

export interface GetClassOrderRequest {
  classes: string[];
  configPath: string | undefined;
  cwd: string;
  tsconfigPath: string | undefined;
}

export type GetClassOrderResponse = { classOrder: ClassOrder; warnings: (Warning | undefined)[]; };

type GetClassOrder = (req: GetClassOrderRequest) => GetClassOrderResponse;

export let getClassOrder: GetClassOrder;

export function createGetClassOrder(): GetClassOrder {
  if(getClassOrder){
    return getClassOrder;
  }

  const workerPath = getWorkerPath();
  const workerOptions = getWorkerOptions();

  getClassOrder = createSyncFn(workerPath, workerOptions);

  return getClassOrder;
}

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./class-order.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
