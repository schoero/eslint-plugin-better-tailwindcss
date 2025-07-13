import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";


export interface GetDissectedClassRequest {
  classes: string[];
  configPath: string;
}

export interface DissectedClass {
  base: string;
  className: string;
  important: [boolean, boolean];
  negative: boolean;
  prefix: string;
  separator: string;
  variants: string[];
}

export type GetDissectedClassResponse = DissectedClass[];

export function getDissectedClasses({ classes, configPath, cwd }: { classes: string[]; configPath: string | undefined; cwd: string; }) {
  const { path, warning } = getTailwindConfigPath({ configPath, cwd });
  const dissectedClasses = getDissectedClassesSync({ classes, configPath: path });

  return { dissectedClasses, warnings: [warning] };
}

const getDissectedClassesSync = createSyncFn<
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
