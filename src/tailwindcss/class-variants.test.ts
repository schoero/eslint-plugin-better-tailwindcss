import { beforeEach, describe, expect, it } from "vitest";

import { getClassVariants } from "better-tailwindcss:tailwindcss/class-variants.js";
import { css } from "better-tailwindcss:tests/utils/template.js";
import { createTestFile, resetTestingDirectory } from "better-tailwindcss:tests/utils/tmp.js";


function getVariants(className: string) {
  const { classVariants } = getClassVariants({ classes: [className], configPath: undefined, cwd: process.cwd() });

  const [_, variants] = classVariants[0];
  return variants;
}

describe("getClassVariants", () => {
  beforeEach(() => {
    resetTestingDirectory();
    createTestFile("global.css", css`@import "tailwindcss";`);
  });

  it("should not return any variants for a class without variants", () => {
    expect(getVariants("text-red-500")).toEqual([]);
  });

  it("should return the variant for a class with a variant", () => {
    expect(getVariants("hover:text-red-500")).toEqual(["hover"]);
  });

  it("should return multiple variants for a class with multiple variants", () => {
    expect(getVariants("lg:hover:text-red-500")).toEqual(["lg", "hover"]);
  });

  it("should not return any variants for an arbitrary class", () => {
    expect(getVariants("[color:red]")).toEqual([]);
  });

  it("should return the variant for an arbitrary class with a variant", () => {
    expect(getVariants("hover:[color:red]")).toEqual(["hover"]);
  });

  it("should return the variant for an arbitrary variant", () => {
    expect(getVariants("[&:hover]:text-red-500")).toEqual(["[&:hover]"]);
  });

  it("should return the correct variants for arbitrary variants mixed with normal variants", () => {
    expect(getVariants("lg:[&:hover]:text-red-500")).toEqual(["lg", "[&:hover]"]);
  });

  it("should work with functional variants", () => {
    expect(getVariants("aria-disabled:text-red-500")).toEqual(["aria-disabled"]);
    expect(getVariants("aria-[disabled]:text-red-500")).toEqual(["aria-[disabled]"]);
  });

  it("should work with compound variants", () => {
    expect(getVariants("has-[&_p]:text-red-500")).toEqual(["has-[&_p]"]);
  });
});
