import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";


export type Shorthands = [classes: string[], shorthand: string[]][][];

export interface GetImportantPositionRequest {
  classes: string[];
  configPath: string;
  position: "legacy" | "recommended";
}

export type GetImportantPositionResponse = { [className: string]: string; };


export function getImportantPosition({ classes, configPath, cwd, position }: { classes: string[]; configPath: string | undefined; cwd: string; position: "legacy" | "recommended"; }) {
  const { path, warning } = getTailwindConfigPath({ configPath, cwd });
  const importantPosition = getImportantPositionSync({ classes, configPath: path, position });

  return { importantPosition, warnings: [warning] };
}

const getImportantPositionSync = createSyncFn<
  Async<GetImportantPositionRequest, GetImportantPositionResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./important-position.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
