import { beforeEach, describe, expect, it } from "vitest";

import { createGetDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { css } from "better-tailwindcss:tests/utils/template.js";
import { createTestFile, resetTestingDirectory } from "better-tailwindcss:tests/utils/tmp.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";


function dissectClass(className: string) {
  const getDissectedClasses = createGetDissectedClasses();
  const { dissectedClasses: classVariants } = getDissectedClasses({ classes: [className], configPath: undefined, cwd: process.cwd(), tsconfigPath: undefined });

  return classVariants[0];
}

describe("getDissectedClass", () => {
  beforeEach(() => {
    resetTestingDirectory();
    createTestFile("global.css", css`@import "tailwindcss";`);
  });

  describe("variants", () => {
    it("should not return any variants for a class without variants", () => {
      expect(dissectClass("text-red-500").variants).toEqual([]);
    });

    it("should return the variant for a class with a variant", () => {
      expect(dissectClass("hover:text-red-500").variants).toEqual(["hover"]);
    });

    it("should return multiple variants for a class with multiple variants", () => {
      expect(dissectClass("lg:hover:text-red-500").variants).toEqual(["lg", "hover"]);
    });

    it("should not return any variants for an arbitrary class", () => {
      expect(dissectClass("[color:red]").variants).toEqual([]);
    });

    it("should return the variant for an arbitrary class with a variant", () => {
      expect(dissectClass("hover:[color:red]").variants).toEqual(["hover"]);
    });

    it("should return the variant for an arbitrary variant", () => {
      expect(dissectClass("[&:hover]:text-red-500").variants).toEqual(["[&:hover]"]);
    });

    it("should return the correct variants for arbitrary variants mixed with normal variants", () => {
      expect(dissectClass("lg:[&:hover]:text-red-500").variants).toEqual(["lg", "[&:hover]"]);
    });

    it("should work with functional variants", () => {
      expect(dissectClass("aria-disabled:text-red-500").variants).toEqual(["aria-disabled"]);
      expect(dissectClass("aria-[disabled]:text-red-500").variants).toEqual(["aria-[disabled]"]);
    });

    it("should work with compound variants", () => {
      expect(dissectClass("has-[&_p]:text-red-500").variants).toEqual(["has-[&_p]"]);
    });

    it("should not crash on unregistered classes", () => {
      expect(dissectClass("unregistered-class").variants).toEqual(expect.any(Array));
      expect(dissectClass("hover:unregistered-class").variants).toEqual(expect.any(Array));
      expect(dissectClass("lg:hover:unregistered-class").variants).toEqual(expect.any(Array));
    });
  });

  describe("important", () => {
    it("should return true for a class with an important modifier", () => {
      expect(dissectClass("text-red-500!").important).toEqual([false, true]);
      expect(dissectClass("!text-red-500").important).toEqual([true, false]);
    });
  });

  describe("base", () => {
    it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should return the base class name in tailwind >= 4", () => {
      expect(dissectClass("text-red-500").base).toBe("text-red-500");
      expect(dissectClass("hover:text-red-500").base).toBe("text-red-500");
      expect(dissectClass("lg:hover:text-red-500").base).toBe("text-red-500");
      expect(dissectClass("lg:hover:text-red-500!").base).toBe("text-red-500");
      expect(dissectClass("lg:hover:text-red-500/50").base).toBe("text-red-500/50");
      expect(dissectClass("lg:hover:text-red-500/50!").base).toBe("text-red-500/50");
    });

    it.runIf(getTailwindcssVersion().major <= TailwindcssVersion.V3)("should return the base class name in tailwind <= 3", () => {
      expect(dissectClass("text-red-500").base).toBe("text-red-500");
      expect(dissectClass("hover:text-red-500").base).toBe("text-red-500");
      expect(dissectClass("lg:hover:text-red-500").base).toBe("text-red-500");
      expect(dissectClass("lg:hover:!text-red-500").base).toBe("text-red-500");
      expect(dissectClass("lg:hover:text-red-500/50").base).toBe("text-red-500/50");
      expect(dissectClass("lg:hover:!text-red-500/50").base).toBe("text-red-500/50");
    });
  });

  describe("negative", () => {
    it("should return true for a class with a negative modifier", () => {
      expect(dissectClass("-top-50").negative).toBe(true);
      expect(dissectClass("hover:-top-50").negative).toBe(true);
      expect(dissectClass("lg:hover:-top-50").negative).toBe(true);
      expect(dissectClass("lg:hover:-top-50!").negative).toBe(true);
    });

    it("should return false for a class without a negative modifier", () => {
      expect(dissectClass("top-50").negative).toBe(false);
      expect(dissectClass("hover:top-50").negative).toBe(false);
      expect(dissectClass("lg:hover:top-50").negative).toBe(false);
      expect(dissectClass("lg:hover:top-50!").negative).toBe(false);
    });
  });

});
