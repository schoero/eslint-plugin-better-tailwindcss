import { resolve } from "node:path";

import { withCache } from "better-tailwindcss:utils/cache.js";
import { findFileRecursive } from "better-tailwindcss:utils/fs.js";
import { resolveCss } from "better-tailwindcss:utils/resolvers.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context, Version } from "better-tailwindcss:types/rule.js";


export interface AsyncContext {
  cwd: string;
  installation: string;
  tailwindConfigPath: string;
  tsconfigPath: string | undefined;
  version: Version;
  warnings: (Warning | undefined)[];
}

export function async(ctx: Context): AsyncContext {
  const { path: resolvedTailwindPath, warnings: tailwindConfigWarnings } = getTailwindConfigPath({ configPath: ctx.options.entryPoint ?? ctx.options.tailwindConfig, cwd: ctx.cwd, version: ctx.version });
  const { path: resolvedTSConfigPath, warnings: tsconfigWarnings } = getTSConfigPath({ configPath: ctx.options.tsconfig, cwd: ctx.cwd });

  return {
    cwd: ctx.cwd,
    installation: ctx.installation,
    tailwindConfigPath: resolvedTailwindPath,
    tsconfigPath: resolvedTSConfigPath,
    version: ctx.version,
    warnings: [...tailwindConfigWarnings, ...tsconfigWarnings]
  };
}

function getTSConfigPath({ configPath, cwd }: {
  configPath: string | undefined;
  cwd: string;
}) {
  return withCache("tsconfig-path", configPath, () => {
    const potentialPaths = [
      ...configPath ? [configPath] : [],
      "tsconfig.json",
      "jsconfig.json"
    ];

    const foundConfigPath = findFileRecursive(cwd, potentialPaths);
    const warning = getConfigPathWarning(configPath, foundConfigPath);

    return {
      path: foundConfigPath,
      warnings: [warning]
    };
  });
}

export function getTailwindConfigPath({ configPath, cwd, version }: {
  configPath: string | undefined;
  cwd: string;
  version: Version;
}) {
  return withCache("config-path", configPath, () => {
    if(version.major >= 4){

      const foundConfigPath = configPath && findFileRecursive(cwd, [configPath]);
      const warning = getEntryPointWarning(configPath, foundConfigPath);

      if(foundConfigPath){
        return {
          path: foundConfigPath,
          warnings: [warning]
        };
      }

      const defaultConfigPath = resolveCss("tailwindcss/theme.css", cwd);

      if(!defaultConfigPath){
        throw new Error("No default tailwind config found. Please ensure you have Tailwind CSS installed.");
      }

      return {
        path: defaultConfigPath,
        warnings: [warning]
      };
    }

    if(version.major <= 3){
      const defaultPaths = [
        "tailwind.config.js",
        "tailwind.config.cjs",
        "tailwind.config.mjs",
        "tailwind.config.ts"
      ];

      const foundConfigPath = configPath && findFileRecursive(cwd, [configPath]);

      const foundDefaultPath = findFileRecursive(cwd, defaultPaths);
      const warning = getConfigPathWarning(configPath, foundConfigPath);

      return {
        path: foundConfigPath ?? foundDefaultPath ?? "default",
        warnings: [warning]
      };
    }

    throw new Error(`Unsupported Tailwind CSS version: ${version.major}. Please use a version between 3 and 4.`);
  });
}

function getEntryPointWarning(entryPoint: string | undefined, foundEntryPoint: string | undefined): Warning | undefined {
  if(!!entryPoint && !!foundEntryPoint){
    return;
  }

  return {
    option: "entryPoint",
    title: `No tailwind css entry point found at \`${entryPoint}\``
  };
}


function getConfigPathWarning(configPath: string | undefined, foundConfigPath: string | undefined): Warning | undefined {
  if(!configPath){
    return;
  }

  if(foundConfigPath && resolve(configPath) === resolve(foundConfigPath)){
    return;
  }

  return {
    option: "tsconfig",
    title: `No tsconfig found at \`${configPath}\``
  };
}
