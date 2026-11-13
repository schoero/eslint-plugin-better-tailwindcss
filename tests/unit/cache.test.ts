import { statSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";

import { afterEach, describe, expect, it } from "vitest";

import { TestDirectory } from "better-tailwindcss:tests/utils/tmp.js";
import { Cache, cacheKey } from "better-tailwindcss:utils/cache.js";


const directories: TestDirectory[] = [];

function createDirectory(files: Record<string, string>) {
  const directory = new TestDirectory(files);
  directories.push(directory);
  return directory;
}

function touch(path: string) {
  const timestamp = (statSync(path).mtimeMs + 5000) / 1000;
  utimesSync(path, timestamp, timestamp);
}

afterEach(() => {
  for(const directory of directories.splice(0).reverse()){
    directory.cleanUp();
  }
});

describe("cache", () => {

  it("should create a value only once", () => {
    const cache = new Cache();
    let calls = 0;

    expect(cache.getOrCreate("key", () => ++calls)).toBe(1);
    expect(cache.getOrCreate("key", () => ++calls)).toBe(1);
    expect(calls).toBe(1);
  });

  it("should cache undefined values", () => {
    const cache = new Cache();
    let calls = 0;

    cache.getOrCreate("key", () => { calls++; });
    cache.getOrCreate("key", () => { calls++; });

    expect(calls).toBe(1);
    expect(cache.has("key")).toBe(true);
  });

  it("should join key parts so that they can not collide", () => {
    expect(cacheKey("a", "b")).not.toBe(cacheKey("a b"));
    expect(cacheKey("a", undefined, true, 1)).toBe("a\0\0true\x001");
  });

  it("should evict the least recently used entry", () => {
    const cache = new Cache(2);

    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a");
    cache.set("c", 3);

    expect(cache.has("a")).toBe(true);
    expect(cache.has("b")).toBe(false);
    expect(cache.has("c")).toBe(true);
  });

  it("should evict entries by their weight", () => {
    const cache = new Cache(10);

    cache.set("light-a", 1);
    cache.set("light-b", 2);
    cache.set("heavy", 3, { weight: 9 });

    expect(cache.has("light-a")).toBe(false);
    expect(cache.has("light-b")).toBe(true);
    expect(cache.has("heavy")).toBe(true);

    cache.set("light-c", 4);

    expect(cache.has("light-b")).toBe(false);
    expect(cache.has("heavy")).toBe(true);
    expect(cache.has("light-c")).toBe(true);
  });

  it("should keep an entry that exceeds the capacity on its own until the next write", () => {
    const cache = new Cache(10);

    cache.set("small", 1);
    cache.set("huge", 2, { weight: 100 });

    expect(cache.has("small")).toBe(false);
    expect(cache.has("huge")).toBe(true);

    cache.set("next", 3);

    expect(cache.has("huge")).toBe(false);
    expect(cache.has("next")).toBe(true);
  });

  it("should release the weight of deleted and replaced entries", () => {
    const cache = new Cache(10);

    cache.set("heavy", 1, { weight: 6 });
    cache.set("heavy", 2, { weight: 6 });
    cache.set("other", 3, { weight: 4 });

    expect(cache.has("heavy")).toBe(true);

    cache.delete("heavy");
    cache.set("another", 4, { weight: 6 });

    expect(cache.has("other")).toBe(true);
    expect(cache.has("another")).toBe(true);
  });

  it("should invalidate entries when a file changes, but only after a refresh", () => {
    const directory = createDirectory({ "file.txt": "" });
    const path = directory.files["file.txt"].path;
    const cache = new Cache();

    cache.set("key", "value", { files: [path] });
    touch(path);

    expect(cache.get("key")).toBe("value");

    cache.refresh();

    expect(cache.get("key")).toBeUndefined();
  });

  it("should invalidate entries when a missing file is created or an existing file is deleted", () => {
    const directory = createDirectory({ "existing.txt": "" });
    const missing = directory.files["missing.txt"].path;
    const existing = directory.files["existing.txt"].path;
    const cache = new Cache();

    cache.set("missing", true, { files: [missing] });
    cache.set("existing", true, { files: [existing] });

    writeFileSync(missing, "");
    unlinkSync(existing);
    cache.refresh();

    expect(cache.has("missing")).toBe(false);
    expect(cache.has("existing")).toBe(false);
  });

  it("should compare files with the modification time they were read with", () => {
    const directory = createDirectory({ "file.txt": "" });
    const path = directory.files["file.txt"].path;
    const cache = new Cache();

    cache.set("outdated", true, { files: { [path]: statSync(path).mtimeMs - 1 } });
    cache.set("current", true, { files: { [path]: statSync(path).mtimeMs } });

    expect(cache.has("outdated")).toBe(false);
    expect(cache.has("current")).toBe(true);
  });

  it("should invalidate dependents when a dependency changes or disappears", () => {
    const cache = new Cache();

    cache.set("dependency", 1);
    cache.set("changed", true, { dependencies: ["dependency"] });

    cache.set("dependency", 2);

    expect(cache.has("changed")).toBe(false);

    cache.set("deleted", true, { dependencies: ["dependency"] });
    cache.delete("dependency");

    expect(cache.has("deleted")).toBe(false);
  });

  it("should invalidate dependents transitively when a file of a dependency changes", () => {
    const directory = createDirectory({ "file.txt": "" });
    const path = directory.files["file.txt"].path;
    const cache = new Cache();

    cache.set("dependency", 1, { files: [path] });
    cache.set("dependent", true, { dependencies: ["dependency"] });

    touch(path);
    cache.refresh();

    expect(cache.has("dependent")).toBe(false);
  });

  it("should keep dependents valid when a dependency is written with an identical value", () => {
    const cache = new Cache();

    cache.set("dependency", 1);
    cache.set("dependent", true, { dependencies: ["dependency"] });

    const version = cache.version("dependency");
    cache.set("dependency", 1);

    expect(cache.version("dependency")).toBe(version);
    expect(cache.has("dependent")).toBe(true);
  });

  it("should not store values whose dependencies are missing", () => {
    const cache = new Cache();

    cache.set("dependent", true, { dependencies: ["missing"] });

    expect(cache.has("dependent")).toBe(false);
  });

  it("should not cache a value whose dependency changed during its creation", () => {
    const cache = new Cache();

    cache.set("dependency", 1);
    cache.getOrCreate("dependent", () => {
      cache.set("dependency", 2);
      return true;
    }, { dependencies: ["dependency"] });

    expect(cache.has("dependent")).toBe(false);
  });

  it("should keep dependencies of recently used entries", () => {
    const cache = new Cache(3);

    cache.set("dependency", 1);
    cache.set("dependent", true, { dependencies: ["dependency"] });
    cache.set("other", true);
    cache.get("dependent");
    cache.set("another", true);

    expect(cache.has("other")).toBe(false);
    expect(cache.has("dependency")).toBe(true);
    expect(cache.has("dependent")).toBe(true);
  });

  it("should invalidate dependents of evicted entries", () => {
    const cache = new Cache(2);

    cache.set("dependency", 1);
    cache.set("dependent", true, { dependencies: ["dependency"] });
    cache.set("other", true);

    expect(cache.has("dependency")).toBe(false);
    expect(cache.has("dependent")).toBe(false);
  });

});
