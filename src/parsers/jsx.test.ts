import { describe, it } from "vitest";

import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { sortClasses } from "better-tailwindcss:rules/sort-classes.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";


describe("jsx", () => {
  it("should match attribute names via regex", () => {
    lint(sortClasses, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: `<img customAttribute="b a" />`,
          jsxOutput: `<img customAttribute="a b" />`,

          errors: 1,
          options: [{ attributes: [".*Attribute"], order: "asc" }]
        }
      ]
    });
  });

  it("should not report inside member expressions", () => {
    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      valid: [
        {
          jsx: `<img className={classes[" ignored "]} />`
        }
      ]
    });
  });
});

describe("astro (jsx)", () => {
  it("should match astro syntactic sugar", () => {
    lint(sortClasses, TEST_SYNTAXES, {
      invalid: [
        {
          astro: `<img class:list="b a" />`,
          astroOutput: `<img class:list="a b" />`,

          errors: 1,
          options: [{ order: "asc" }]
        }
      ]
    });
  });
});
