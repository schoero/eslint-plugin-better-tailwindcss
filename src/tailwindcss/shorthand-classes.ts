import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";


export type Shorthands = [classes: string[], shorthand: string[]][][];

export interface GetShorthandClassesRequest {
  classes: string[];
  configPath: string;
}

export type GetShorthandClassesResponse = [classNames: string[], shorthands: string[]][];


export function getShorthandClasses({ classes, configPath, cwd }: { classes: string[]; configPath: string | undefined; cwd: string; }) {
  const { path, warning } = getTailwindConfigPath({ configPath, cwd });
  const shorthandClasses = getShorthandClassesSync({ classes, configPath: path });

  return { shorthandClasses, warnings: [warning] };
}

const getShorthandClassesSync = createSyncFn<
  Async<GetShorthandClassesRequest, GetShorthandClassesResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./shorthand-classes.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
