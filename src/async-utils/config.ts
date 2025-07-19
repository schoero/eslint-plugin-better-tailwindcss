import { resolve } from "node:path";

import { resolveCss } from "../async-utils/resolvers.js";
import { withCache } from "./cache.js";
import { findFileRecursive } from "./fs.js";
import { TailwindcssVersion } from "./version.js";

import type { Warning } from "../types/async.js";


export interface GetTailwindConfigRequest {
  configPath: string | undefined;
  cwd: string;
  version: { major: number; minor: number; patch: number; };
}

export interface GetTailwindConfigResponse {
  path: string;
  warnings: (Warning | undefined)[];
}

export const getTailwindConfigPath = async ({ configPath, cwd, version }: GetTailwindConfigRequest): Promise<GetTailwindConfigResponse> => withCache(configPath ?? "tailwind-config", async () => {
  const { major } = version;

  if(major >= TailwindcssVersion.V4){
    const potentialPaths = [
      ...configPath ? [configPath] : []
    ];

    const foundConfigPath = findFileRecursive(cwd, potentialPaths);
    const warning = getEntryPointWarning(configPath, foundConfigPath);

    if(foundConfigPath){
      return {
        path: foundConfigPath,
        warnings: [warning]
      };
    }

    const defaultConfigPath = await resolveCss("tailwindcss/theme.css", cwd);

    if(!defaultConfigPath){
      throw new Error("No default tailwind config found. Please ensure you have Tailwind CSS installed.");
    }

    return {
      path: defaultConfigPath,
      warnings: [warning]
    };
  }

  if(major <= TailwindcssVersion.V3){
    const potentialPaths = [
      ...configPath ? [configPath] : [],
      "tailwind.config.js",
      "tailwind.config.cjs",
      "tailwind.config.mjs",
      "tailwind.config.ts"
    ];

    const foundConfigPath = findFileRecursive(cwd, potentialPaths);
    const warning = getConfigPathWarning(configPath, foundConfigPath);

    return {
      path: foundConfigPath ?? "default",
      warnings: [warning]
    };
  }

  throw new Error(`Unsupported Tailwind CSS version: ${major}. Please use a version between 3 and 4.`);
});

function getConfigPathWarning(configPath: string | undefined, foundConfigPath: string | undefined): Warning | undefined {
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

function getEntryPointWarning(entryPoint: string | undefined, foundEntryPoint: string | undefined): Warning | undefined {
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
