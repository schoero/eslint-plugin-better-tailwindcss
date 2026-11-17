import { afterEach, describe, expect, it } from "vitest";

import { TestDirectory } from "better-tailwindcss:tests/utils/tmp.js";
import { resolveCss } from "better-tailwindcss:utils/resolvers.js";


describe("resolveCss", () => {
  let directory: TestDirectory;

  afterEach(() => {
    directory.cleanUp();
  });

  it("should return the absolute path of a css file that exists", () => {
    directory = new TestDirectory({ "exists.css": "" });

    expect(resolveCss("./exists.css", directory.directory)).toBe(directory.files["exists.css"].path);
  });

  it("should return undefined for a css file that does not exist", () => {
    directory = new TestDirectory({});

    expect(resolveCss("./missing.css", directory.directory)).toBeUndefined();
  });
});
