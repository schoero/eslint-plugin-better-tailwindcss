import {
  mkdirSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  utimesSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  getCustomComponentClasses as getCustomComponentClassesFromCss
} from "better-tailwindcss:tailwindcss/custom-component-classes.async.v4.js";
import {
  createGetCustomComponentClasses,
  getCustomComponentClasses
} from "better-tailwindcss:tailwindcss/custom-component-classes.js";
import { createGetPrefix, getPrefix } from "better-tailwindcss:tailwindcss/prefix.js";
import { createGetUnknownClasses, getUnknownClasses } from "better-tailwindcss:tailwindcss/unknown-classes.js";
import { TestDirectory } from "better-tailwindcss:tests/utils/tmp.js";
import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version.js";
import { cache, cacheKey } from "better-tailwindcss:utils/cache.js";
import { async } from "better-tailwindcss:utils/context.js";
import { resolveJson } from "better-tailwindcss:utils/resolvers.js";
import { getTailwindPackage } from "better-tailwindcss:utils/tailwindcss.js";

import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";


const classes = ["utility-a", "utility-b"];
const directories: TestDirectory[] = [];

function createDirectory(files: Record<string, string>) {
  const directory = new TestDirectory(files);
  directories.push(directory);
  return directory;
}

// mirrors the setup in createRule(), which checks the files of cached values again for every linted file
function createContext(directory: TestDirectory, entryPoint: string, options: Record<string, unknown> = {}) {
  cache.refresh();

  const packageJsonPath = resolveJson("tailwindcss/package.json", directory.directory)!;
  const ctx = {
    cwd: directory.directory,
    installation: dirname(packageJsonPath),
    options: { entryPoint, ...options },
    version: getTailwindCSSVersion()
  } as unknown as Context;

  createGetCustomComponentClasses(ctx);
  createGetPrefix(ctx);
  createGetUnknownClasses(ctx);

  return ctx;
}

function isCached(asyncCtx: AsyncContext) {
  return classes.every(className => cache.has(cacheKey("unknown-class", asyncCtx.contextKey, className)));
}

// only uses operations that are cached on the host, the cache is intentionally not cleared between calls
function getUnknown(directory: TestDirectory, entryPoint: string) {
  const asyncCtx = async(createContext(directory, entryPoint));
  const { unknownClasses } = getUnknownClasses(asyncCtx, classes);

  expect(isCached(asyncCtx)).toBe(true);

  return unknownClasses;
}

function changeFile(path: string, content: string) {
  const timestamp = statSync(path).mtimeMs + 5000;
  writeFileSync(path, content);
  utimesSync(path, timestamp / 1000, timestamp / 1000);
}

const utility = (name: string) => `@utility ${name} { color: red; }`;

beforeEach(() => {
  cache.clear();
});

afterEach(() => {
  for(const directory of directories.splice(0).reverse()){
    directory.cleanUp();
  }
});

describe.runIf(getTailwindCSSVersion().major >= 4)("tailwind context invalidation", () => {

  it("should invalidate host cached results when the config file changes", () => {
    const directory = createDirectory({ "tailwind.css": `@import "tailwindcss";\n${utility("utility-a")}` });

    expect(getUnknown(directory, "./tailwind.css")).toEqual(["utility-b"]);

    changeFile(directory.files["tailwind.css"].path, `@import "tailwindcss";\n${utility("utility-a")}\n${utility("utility-b")}`);

    expect(getUnknown(directory, "./tailwind.css")).toEqual([]);
  });

  it("should invalidate host cached results when an imported file changes", () => {
    const directory = createDirectory({
      "imported.css": utility("utility-a"),
      "tailwind.css": `@import "tailwindcss";\n@import "./imported.css";`
    });

    expect(getUnknown(directory, "./tailwind.css")).toEqual(["utility-b"]);

    changeFile(directory.files["imported.css"].path, `${utility("utility-a")}\n${utility("utility-b")}`);

    expect(getUnknown(directory, "./tailwind.css")).toEqual([]);
  });

  it("should invalidate host cached results when a nested import is added or changes", () => {
    const directory = createDirectory({
      "imported.css": "",
      "nested.css": utility("utility-b"),
      "tailwind.css": `@import "tailwindcss";\n@import "./imported.css";\n${utility("utility-a")}`
    });

    expect(getUnknown(directory, "./tailwind.css")).toEqual(["utility-b"]);

    changeFile(directory.files["imported.css"].path, `@import "./nested.css";`);

    expect(getUnknown(directory, "./tailwind.css")).toEqual([]);

    changeFile(directory.files["nested.css"].path, "");

    expect(getUnknown(directory, "./tailwind.css")).toEqual(["utility-b"]);
  });

  it("should invalidate host cached results when a plugin changes", () => {
    const directory = createDirectory({
      "plugin.mjs": "export default () => {};",
      "tailwind.css": `@import "tailwindcss";\n@plugin "./plugin.mjs";`
    });

    const asyncCtx = async(createContext(directory, "./tailwind.css"));
    getUnknownClasses(asyncCtx, classes);

    expect(isCached(asyncCtx)).toBe(true);

    changeFile(directory.files["plugin.mjs"].path, "export default () => {};\n");
    cache.refresh();

    expect(isCached(asyncCtx)).toBe(false);
  });

  it("should keep the results of different configs cached side by side", () => {
    const directory = createDirectory({
      "a.css": `@import "tailwindcss";\n${utility("utility-a")}`,
      "ab.css": `@import "tailwindcss";\n${utility("utility-a")}\n${utility("utility-b")}`
    });

    expect(getUnknown(directory, "./a.css")).toEqual(["utility-b"]);
    expect(getUnknown(directory, "./ab.css")).toEqual([]);

    expect(isCached(async(createContext(directory, "./a.css")))).toBe(true);
    expect(isCached(async(createContext(directory, "./ab.css")))).toBe(true);

    expect(getUnknown(directory, "./a.css")).toEqual(["utility-b"]);
  });

  it("should pick up a configured entry point that is created later", () => {
    const directory = createDirectory({});
    const entryPoint = directory.files["tailwind.css"].path;

    expect(async(createContext(directory, "./tailwind.css")).warnings).toContainEqual(expect.objectContaining({ option: "entryPoint" }));
    expect(getUnknown(directory, "./tailwind.css")).toEqual(["utility-a", "utility-b"]);

    writeFileSync(entryPoint, `@import "tailwindcss";\n${utility("utility-a")}`);

    expect(async(createContext(directory, "./tailwind.css")).warnings).not.toContainEqual(expect.objectContaining({ option: "entryPoint" }));
    expect(getUnknown(directory, "./tailwind.css")).toEqual(["utility-b"]);
  });

  it("should cache the prefix and custom component classes on the host until the config changes", () => {
    const directory = createDirectory({ "tailwind.css": `@import "tailwindcss";\n@layer components { .card { color: red; } }` });

    const read = () => {
      const asyncCtx = async(createContext(directory, "./tailwind.css"));
      return { asyncCtx, components: getCustomComponentClasses(asyncCtx).customComponentClasses, prefix: getPrefix(asyncCtx).prefix };
    };

    const { asyncCtx, ...result } = read();

    expect(result).toEqual({ components: ["card"], prefix: "" });
    expect(cache.has(cacheKey("prefix", asyncCtx.contextKey))).toBe(true);
    expect(cache.has(cacheKey("custom-component-classes", asyncCtx.contextKey))).toBe(true);

    changeFile(directory.files["tailwind.css"].path, `@import "tailwindcss" prefix(tw);\n@layer components { .panel { color: red; } }`);

    const { asyncCtx: _, ...changed } = read();

    expect(changed).toEqual({ components: ["panel"], prefix: "tw" });
  });

  it("should not get stuck on circular imports when collecting custom component classes", () => {
    const directory = createDirectory({
      "a.css": `@import "./b.css";\n@layer components { .card { color: red; } }`,
      "b.css": `@import "./a.css";`
    });

    const asyncCtx = async(createContext(directory, "./a.css"));

    expect(getCustomComponentClassesFromCss(asyncCtx)).toEqual(["card"]);
  });

  it("should invalidate host cached results when the worker rebuilds the context", () => {
    const directory = createDirectory({ "tailwind.css": `@import "tailwindcss";\n${utility("utility-a")}` });
    const asyncCtx = async(createContext(directory, "./tailwind.css"));

    getUnknownClasses(asyncCtx, classes);
    expect(isCached(asyncCtx)).toBe(true);

    changeFile(directory.files["tailwind.css"].path, `@import "tailwindcss";\n${utility("utility-b")}`);

    // the host does not check the files again, only the worker notices the change and rebuilds the context
    getPrefix(asyncCtx);

    expect(isCached(asyncCtx)).toBe(false);
  });

  it("should cache results computed from a context the worker rebuilt after the host checked the files", () => {
    const directory = createDirectory({ "tailwind.css": `@import "tailwindcss";\n${utility("utility-a")}` });
    const asyncCtx = async(createContext(directory, "./tailwind.css"));

    getUnknownClasses(asyncCtx, classes);

    // no cache.refresh(), the host keeps the memoized modification time and only the worker sees the change
    changeFile(directory.files["tailwind.css"].path, `@import "tailwindcss";\n${utility("utility-c")}`);

    expect(getUnknownClasses(asyncCtx, ["utility-c"]).unknownClasses).toEqual([]);
    expect(cache.has(cacheKey("unknown-class", asyncCtx.contextKey, "utility-c"))).toBe(true);
  });

});

describe("config path invalidation", () => {

  it("should pick up a configured tsconfig that is created later", () => {
    const directory = createDirectory({});
    const tsconfig = directory.files["tsconfig.app.json"].path;
    const ctx = createContext(directory, "./tailwind.css", { tsconfig: "./tsconfig.app.json" });

    expect(async(ctx).tsconfigPath).toBeUndefined();
    expect(async(ctx).warnings).toContainEqual(expect.objectContaining({ option: "tsconfig" }));

    writeFileSync(tsconfig, "{}");
    cache.refresh();

    expect(async(ctx).tsconfigPath).toBe(tsconfig);
    expect(async(ctx).warnings).not.toContainEqual(expect.objectContaining({ option: "tsconfig" }));
  });


  it("should resolve a configured tsconfig again when it is deleted", () => {
    const directory = createDirectory({ "tsconfig.app.json": "{}" });
    const tsconfig = directory.files["tsconfig.app.json"].path;
    const ctx = createContext(directory, "./tailwind.css", { tsconfig: "./tsconfig.app.json" });

    expect(async(ctx).tsconfigPath).toBe(tsconfig);

    unlinkSync(tsconfig);
    cache.refresh();

    expect(async(ctx).tsconfigPath).toBeUndefined();
    expect(async(ctx).warnings).toContainEqual(expect.objectContaining({ option: "tsconfig" }));
  });

  it("should read the tailwind version again when tailwind is updated in place", () => {
    const directory = createDirectory({ "node_modules/tailwindcss/package.json": JSON.stringify({ version: "4.0.0" }) });
    const packageJson = directory.files["node_modules/tailwindcss/package.json"].path;

    expect(getTailwindPackage(directory.directory)?.version).toMatchObject({ major: 4, minor: 0 });

    changeFile(packageJson, JSON.stringify({ version: "4.1.0" }));
    cache.refresh();

    expect(getTailwindPackage(directory.directory)?.version).toMatchObject({ major: 4, minor: 1 });
  });

  it("should resolve tailwind again when pnpm replaces the installed version", () => {
    const directory = createDirectory({ "node_modules/.pnpm/tailwindcss@4.0.0/node_modules/tailwindcss/package.json": JSON.stringify({ version: "4.0.0" }) });
    const link = join(directory.directory, "node_modules/tailwindcss");

    symlinkSync(".pnpm/tailwindcss@4.0.0/node_modules/tailwindcss", link, "dir");

    expect(getTailwindPackage(directory.directory)?.version).toMatchObject({ major: 4, minor: 0 });

    const upgraded = join(directory.directory, "node_modules/.pnpm/tailwindcss@4.1.0/node_modules/tailwindcss");

    mkdirSync(upgraded, { recursive: true });
    writeFileSync(join(upgraded, "package.json"), JSON.stringify({ version: "4.1.0" }));
    unlinkSync(link);
    symlinkSync(".pnpm/tailwindcss@4.1.0/node_modules/tailwindcss", link, "dir");
    rmSync(join(directory.directory, "node_modules/.pnpm/tailwindcss@4.0.0"), { recursive: true });
    cache.refresh();

    expect(getTailwindPackage(directory.directory)?.version).toMatchObject({ major: 4, minor: 1 });
  });

  it("should find tailwind when it is installed after it was not found", () => {
    const directory = new TestDirectory({}, true);
    directories.push(directory);

    expect(getTailwindPackage(directory.directory)).toBeUndefined();

    mkdirSync(join(directory.directory, "node_modules/tailwindcss"), { recursive: true });
    writeFileSync(join(directory.directory, "node_modules/tailwindcss/package.json"), JSON.stringify({ version: "4.1.0" }));
    cache.refresh();

    expect(getTailwindPackage(directory.directory)?.version).toMatchObject({ major: 4, minor: 1 });
  });

  it("should resolve tailwind again when it is installed closer to the cwd", () => {
    const directory = createDirectory({ "packages/app/index.ts": "" });
    const cwd = join(directory.directory, "packages/app");

    expect(getTailwindPackage(cwd)?.installation).not.toContain(directory.directory);

    mkdirSync(join(cwd, "node_modules/tailwindcss"), { recursive: true });
    writeFileSync(join(cwd, "node_modules/tailwindcss/package.json"), JSON.stringify({ version: "4.1.0" }));
    cache.refresh();

    expect(getTailwindPackage(cwd)?.installation).toBe(join(cwd, "node_modules/tailwindcss"));
  });

});
