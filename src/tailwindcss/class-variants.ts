import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";


export interface GetClassVariantsRequest {
  classes: string[];
  configPath: string;
}

export type GetClassVariantsResponse = [className: string, variants: string[]][];

export function getClassVariants({ classes, configPath, cwd }: { classes: string[]; configPath: string | undefined; cwd: string; }) {
  const { path, warning } = getTailwindConfigPath({ configPath, cwd });
  const classVariants = getClassVariantsSync({ classes, configPath: path });

  return { classVariants, warnings: [warning] };
}

const getClassVariantsSync = createSyncFn<
  Async<GetClassVariantsRequest, GetClassVariantsResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./class-variants.async.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
