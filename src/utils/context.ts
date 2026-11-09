import { hash } from "node:crypto";
import { resolve } from "node:path";

import { cache, cacheKey } from "better-tailwindcss:utils/cache.js";
import { findPathRecursive } from "better-tailwindcss:utils/fs.js";
import { resolveCss } from "better-tailwindcss:utils/resolvers.js";

import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context, Version } from "better-tailwindcss:types/rule.js";


export interface AsyncContext {
  /** Identifies the Tailwind CSS context of the config, results computed from it are cached under this key. */
  contextKey: string;
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
    contextKey: getContextKey(ctx.installation, resolvedTailwindPath, resolvedTSConfigPath),
    cwd: ctx.cwd,
    installation: ctx.installation,
    tailwindConfigPath: resolvedTailwindPath,
    tsconfigPath: resolvedTSConfigPath,
    version: ctx.version,
    warnings: [...tailwindConfigWarnings, ...tsconfigWarnings]
  };
}

// every cached result contains the context key, a short hash instead of the paths keeps the keys small
function getContextKey(installation: string, tailwindConfigPath: string, tsconfigPath: string | undefined) {
  const paths = cacheKey(installation, tailwindConfigPath, tsconfigPath);
  return cache.getOrCreate(cacheKey("context-key", paths), () => `tailwind-context:${hash("sha256", paths, "base64url").slice(0, 16)}`);
}

// resolved again when the configured file is created or deleted
function getTSConfigPath({ configPath, cwd }: {
  configPath: string | undefined;
  cwd: string;
}) {
  return getOrResolveConfigPath(cacheKey("tsconfig-path", cwd, configPath), configPath, cwd, () => {
    const potentialPaths = [
      ...configPath ? [configPath] : [],
      "tsconfig.json",
      "jsconfig.json"
    ];

    const foundConfigPath = findPathRecursive(cwd, cwd, potentialPaths);
    const warning = getConfigPathWarning("tsconfig", configPath, foundConfigPath);

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
  return getOrResolveConfigPath(cacheKey("tailwind-config-path", cwd, configPath, version.major), configPath, cwd, () => {
    if(version.major >= 4){

      const foundConfigPath = configPath && findPathRecursive(cwd, cwd, [configPath]);
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

      const foundConfigPath = configPath && findPathRecursive(cwd, cwd, [configPath]);

      const foundDefaultPath = findPathRecursive(cwd, cwd, defaultPaths);
      const warning = getConfigPathWarning("tailwindConfig", configPath, foundConfigPath);

      return {
        path: foundConfigPath ?? foundDefaultPath ?? "default",
        warnings: [warning]
      };
    }

    throw new Error(`Unsupported Tailwind CSS version: ${version.major}. Please use a version between 3 and 4.`);
  });
}

function getOrResolveConfigPath<Path extends string | undefined>(key: string, configPath: string | undefined, cwd: string, resolveConfigPath: () => { path: Path; warnings: (Warning | undefined)[]; }) {
  const cached = cache.get<ReturnType<typeof resolveConfigPath>>(key);

  if(cached){
    return cached;
  }

  const resolved = resolveConfigPath();

  // the configured file is picked up as soon as it is created, a found file is resolved again when it is deleted
  cache.set(key, resolved, {
    files: [
      ...configPath ? [resolve(cwd, configPath)] : [],
      ...resolved.path && resolved.path !== "default" ? [resolved.path] : []
    ]
  });

  return resolved;
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


function getConfigPathWarning(option: "tailwindConfig" | "tsconfig", configPath: string | undefined, foundConfigPath: string | undefined): Warning | undefined {
  if(!configPath){
    return;
  }

  if(foundConfigPath && resolve(configPath) === resolve(foundConfigPath)){
    return;
  }

  return {
    option,
    title: option === "tsconfig"
      ? `No tsconfig found at \`${configPath}\``
      : `No tailwind config found at \`${configPath}\``
  };
}
