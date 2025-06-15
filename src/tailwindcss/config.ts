import { resolve } from "node:path";

import { findTailwindConfigPath as findTailwindConfigPathV3 } from "better-tailwindcss:tailwindcss/config.v3.js";
import {
  findDefaultConfigPath,
  findTailwindConfigPath as findTailwindConfigPathV4
} from "better-tailwindcss:tailwindcss/config.v4.js";
import { withCache } from "better-tailwindcss:utils/cache.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/version.js";

import type { Warning } from "better-tailwindcss:utils/utils.js";


export interface GetConfigRequest {
  configPath: string | undefined;
  cwd: string;
}

export interface GetConfigResponse {
  path: string;
  warning: ConfigWarning | undefined;
}

type ConfigWarning = Omit<Warning, "url"> & Partial<Pick<Warning, "url">>;

export const getTailwindConfigPath = ({ configPath, cwd }: { configPath: string | undefined; cwd: string; }) => withCache<GetConfigResponse>(configPath ?? "default", () => {
  const version = getTailwindcssVersion();

  if(version.major === TailwindcssVersion.V3){
    const foundConfigPath = findTailwindConfigPathV3(cwd, configPath);
    return {
      path: foundConfigPath ?? "default",
      warning: getConfigPathWarning(configPath, foundConfigPath)
    };
  } else {
    const foundConfigPath = findTailwindConfigPathV4(cwd, configPath);
    return {
      path: foundConfigPath ?? findDefaultConfigPath(cwd),
      warning: getEntryPointWarning(configPath, foundConfigPath)
    };
  }
});


function getConfigPathWarning(configPath: string | undefined, foundConfigPath: string | undefined): ConfigWarning | undefined {
  if(!configPath){
    return;
  }

  if(foundConfigPath && resolve(configPath) === resolve(foundConfigPath)){
    return;
  }

  return {
    option: "tailwindConfig",
    title: `No tailwind css config found at \`${configPath}\``
  };
}

function getEntryPointWarning(entryPoint: string | undefined, foundEntryPoint: string | undefined): ConfigWarning | undefined {
  if(!entryPoint){
    return;
  }

  if(foundEntryPoint && resolve(entryPoint) === resolve(foundEntryPoint)){
    return;
  }

  return {
    option: "entryPoint",
    title: `No tailwind css entry point found at \`${entryPoint}\``
  };
}
