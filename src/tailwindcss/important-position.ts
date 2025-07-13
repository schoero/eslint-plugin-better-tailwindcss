import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { getTailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";
import type { Warning } from "better-tailwindcss:utils/utils.js";


export type Shorthands = [classes: string[], shorthand: string[]][][];

export interface GetImportantPositionRequest {
  classes: string[];
  configPath: string;
  position: "legacy" | "recommended";
}

export type GetImportantPositionResponse = { [className: string]: string; };


export function getImportantPosition({ classes, configPath, cwd, position }: { classes: string[]; configPath: string | undefined; cwd: string; position?: "legacy" | "recommended"; }) {
  const { path, warning } = getTailwindConfigPath({ configPath, cwd });
  const defaultPosition = getDefaultPosition();
  const positionWarning = getPositionWarning(position ?? defaultPosition);
  const importantPosition = getImportantPositionSync({ classes, configPath: path, position: position ?? defaultPosition });

  return { importantPosition, warnings: [positionWarning, warning] };
}

const getImportantPositionSync = createSyncFn<
  Async<GetImportantPositionRequest, GetImportantPositionResponse>
>(getWorkerPath(), getWorkerOptions());

function getPositionWarning(position: "legacy" | "recommended"): Warning | undefined {
  const { major } = getTailwindcssVersion();
  if(major === 3 && position === "recommended"){
    return {
      option: "position",
      title: "The `recommended` position is not supported in Tailwind CSS v3"
    };
  }
}

function getDefaultPosition(): "legacy" | "recommended" {
  const { major } = getTailwindcssVersion();
  return major === 3 ? "legacy" : "recommended";
}

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./important-position.async.worker.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
