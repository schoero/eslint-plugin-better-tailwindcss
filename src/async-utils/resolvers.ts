import fs from "node:fs";

import enhancedResolve from "enhanced-resolve";


const fileSystem = new enhancedResolve.CachedInputFileSystem(fs, 30_000);

export const esmResolver = enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["node", "import"],
  extensions: [".mjs", ".js"],
  fileSystem,
  mainFields: ["module"],
  useSyncFileSystemCalls: true
});

export const cjsResolver = enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["node", "require"],
  extensions: [".js", ".cjs"],
  fileSystem,
  mainFields: ["main"],
  useSyncFileSystemCalls: true
});

export const cssResolver = enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["style"],
  extensions: [".css"],
  fileSystem,
  mainFields: ["style"],
  useSyncFileSystemCalls: true
});

export const jsonResolver = enhancedResolve.ResolverFactory.createResolver({
  conditionNames: ["json"],
  extensions: [".json"],
  fileSystem,
  useSyncFileSystemCalls: true
});


export function resolveJs(base: string, id: string): string {
  try {
    return esmResolver.resolveSync({}, base, id) || id;
  } catch {
    return cjsResolver.resolveSync({}, base, id) || id;
  }
}

export function resolveCss(base: string, id: string): string {
  try {
    return cssResolver.resolveSync({}, base, id) || id;
  } catch {
    return id;
  }
}
