import fs from "node:fs";

import enhancedResolve from "enhanced-resolve";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

import { cache, cacheKey } from "./cache.js";

import type { AsyncContext } from "../utils/context.js";


type Resolver = ReturnType<typeof enhancedResolve.ResolverFactory.createResolver>;

interface ResolverOptions {
  conditionNames: string[];
  extensions: string[];
  mainFields: string[];
}

// resolved paths are cached by the callers, so the resolvers use the file system directly
// instead of keeping a second cache of their own
function createCachedResolver(name: string, { conditionNames, extensions, mainFields }: ResolverOptions) {
  return (ctx: AsyncContext | undefined): Resolver => {
    const tsconfigPath = ctx?.tsconfigPath;

    return cache.getOrCreate(
      cacheKey("resolver", name, tsconfigPath),
      () => enhancedResolve.ResolverFactory.createResolver({
        conditionNames,
        extensions,
        fileSystem: fs,
        mainFields,
        plugins: tsconfigPath ? [new TsconfigPathsPlugin({ configFile: tsconfigPath, mainFields })] : [],
        useSyncFileSystemCalls: true
      }),
      { files: tsconfigPath ? [tsconfigPath] : [] }
    );
  };
}

const getESMResolver = createCachedResolver("esm", { conditionNames: ["node", "import"], extensions: [".mjs", ".js"], mainFields: ["module"] });
const getCJSResolver = createCachedResolver("cjs", { conditionNames: ["node", "require"], extensions: [".js", ".cjs"], mainFields: ["main"] });
const getCSSResolver = createCachedResolver("css", { conditionNames: ["style"], extensions: [".css"], mainFields: ["style"] });

const jsonResolver = enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["json"],
  extensions: [".json"],
  fileSystem: fs,
  useSyncFileSystemCalls: true
});


export function resolveJs(path: string, cwd: string): string;
export function resolveJs(ctx: AsyncContext, path: string, cwd?: string): string;
export function resolveJs(ctxOrPath: AsyncContext | string | undefined, pathOrCwd: string, cwdOrUndefined?: string): string {
  const ctx = typeof ctxOrPath === "object" ? ctxOrPath : undefined;
  const path = typeof ctxOrPath === "string" ? ctxOrPath : pathOrCwd;
  const cwd = (typeof ctxOrPath === "object" ? cwdOrUndefined : pathOrCwd)!;

  try {
    return getESMResolver(ctx).resolveSync({}, cwd, path) || path;
  } catch {
    return getCJSResolver(ctx).resolveSync({}, cwd, path) || path;
  }
}

export function resolveCss(path: string, cwd: string): string;
export function resolveCss(ctx: AsyncContext, path: string, cwd?: string): string;
export function resolveCss(ctxOrPath: AsyncContext | string | undefined, pathOrCwd: string, cwdOrUndefined?: string): string {
  const ctx = typeof ctxOrPath === "object" ? ctxOrPath : undefined;
  const path = typeof ctxOrPath === "string" ? ctxOrPath : pathOrCwd;
  const cwd = (typeof ctxOrPath === "object" ? cwdOrUndefined : pathOrCwd)!;

  try {
    return getCSSResolver(ctx).resolveSync({}, cwd, path) || path;
  } catch {
    return path;
  }
}

export function resolveJson(path: string, cwd: string): string | undefined {
  try {
    return jsonResolver.resolveSync({}, cwd, path) || undefined;
  } catch {}
}
