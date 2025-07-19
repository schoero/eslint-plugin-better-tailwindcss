import fs from "node:fs";

import enhancedResolve from "enhanced-resolve";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

import { withCache } from "../async-utils/cache.js";

import type { AsyncContext } from "../async-utils/context.js";


const fileSystem = new enhancedResolve.CachedInputFileSystem(fs, 30_000);

export const getESMResolver = (ctx: AsyncContext | undefined) => withCache(ctx ? `esm-resolver-${ctx.tsconfigPath}` : "esm-resolver", () => enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["node", "import"],
  extensions: [".mjs", ".js"],
  fileSystem,
  mainFields: ["module"],
  plugins: ctx ? [new TsconfigPathsPlugin({ configFile: ctx.tsconfigPath, mainFields: ["module"] })] : [],
  useSyncFileSystemCalls: true
}));

export const getCJSResolver = (ctx: AsyncContext | undefined) => withCache(ctx ? `cjs-resolver-${ctx.tsconfigPath}` : "cjs-resolver", () => enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["node", "require"],
  extensions: [".js", ".cjs"],
  fileSystem,
  mainFields: ["main"],
  plugins: ctx ? [new TsconfigPathsPlugin({ configFile: ctx.tsconfigPath, mainFields: ["main"] })] : [],
  useSyncFileSystemCalls: true
}));

export const getCSSResolver = (ctx: AsyncContext | undefined) => withCache(ctx ? `css-resolver-${ctx.tsconfigPath}` : "css-resolver", () => enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["style"],
  extensions: [".css"],
  fileSystem,
  mainFields: ["style"],
  plugins: ctx ? [new TsconfigPathsPlugin({ configFile: ctx.tsconfigPath, mainFields: ["style"] })] : [],
  useSyncFileSystemCalls: true
}));

export const jsonResolver = enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["json"],
  extensions: [".json"],
  fileSystem,
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

export function resolveJson(path: string, cwd: string): string {
  try {
    return jsonResolver.resolveSync({}, cwd, path) || path;
  } catch {
    return path;
  }
}
