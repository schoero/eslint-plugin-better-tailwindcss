// runner.js


import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import {
  getCustomComponentClasses as getCustomComponentClassesV3
} from "better-tailwindcss:tailwindcss/custom-component-classes.v3.js";
import {
  getCustomComponentClasses as getCustomComponentClassesV4
} from "better-tailwindcss:tailwindcss/custom-component-classes.v4.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/version.js";


export interface GetCustomComponentClassesRequest {
  configPath: string;
}

export type GetCustomComponentClassesResponse = string[];

export function getCustomComponentClasses({ configPath, cwd }: { configPath: string | undefined; cwd: string; }) {
  const version = getTailwindcssVersion();
  const { path } = getTailwindConfigPath({ configPath, cwd });

  const customComponentClasses = version.major <= TailwindcssVersion.V3
    ? getCustomComponentClassesV3({ configPath: path })
    : getCustomComponentClassesV4({ configPath: path });

  return customComponentClasses;
}
