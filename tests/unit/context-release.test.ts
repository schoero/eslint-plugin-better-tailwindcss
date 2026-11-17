import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { TestDirectory } from "better-tailwindcss:tests/utils/tmp.js";
import { cache } from "better-tailwindcss:utils/cache.js";
import { async } from "better-tailwindcss:utils/context.js";

import type { Context } from "better-tailwindcss:types/rule.js";


const { createRunOperation } = vi.hoisted(() => ({
  createRunOperation: vi.fn((_ctx: { version: { major: number; }; }) => () => {
    throw new Error("worker timed out");
  })
}));

vi.mock("better-tailwindcss:tailwindcss/operation.js", () => ({ createRunOperation }));

// a configured file that exists is resolved the same way by every tailwind version,
// the default config can only be resolved for the installed one
const directory = new TestDirectory({ "tailwind.css": "" });

function createContext(major: number) {
  return {
    cwd: directory.directory,
    installation: directory.directory,
    options: { entryPoint: "./tailwind.css" },
    version: { major, minor: 0, patch: 0 }
  } as unknown as Context;
}

beforeEach(() => {
  cache.clear();
  createRunOperation.mockClear();
});

afterAll(() => {
  directory.cleanUp();
});

describe("context release", () => {

  it("should not fail when the worker can not release the previous context", () => {
    async(createContext(4));

    expect(() => async(createContext(3))).not.toThrow();
    expect(createRunOperation).toHaveBeenCalledTimes(1);
  });

  it("should release the previous context in the worker of the tailwind version that built it", () => {
    async(createContext(4));
    async(createContext(3));

    expect(createRunOperation).toHaveBeenCalledWith({ version: { major: 4 } });
  });

  it("should not release anything while the context stays the same", () => {
    async(createContext(4));
    async(createContext(4));

    expect(createRunOperation).not.toHaveBeenCalled();
  });

});
