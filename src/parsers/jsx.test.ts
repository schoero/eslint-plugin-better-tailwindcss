import { describe, it } from "vitest";

import { enforceConsistentClassOrder } from "better-tailwindcss:rules/enforce-consistent-class-order.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { MatcherType } from "better-tailwindcss:types/rule.js";


describe("jsx", () => {
  it("should match attribute names via regex", () => {
    lint(enforceConsistentClassOrder, {
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

  // #119
  it("should not report inside member expressions", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `<img className={classes[" ignored "]} />`
        }
      ]
    });
  });

  // #211
  it("should still handle object values even when they are immediately index accessed", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: "<img class={{ key: '  a b c  '}['key']} />",
          jsxOutput: "<img class={{ key: 'a b c'}['key']} />",

          errors: 2,
          options: [{
            attributes: [["class", [{ match: MatcherType.ObjectValue }]]]
          }]
        }
      ]
    });
  });

  // #226
  it("should not match index accessed object keys", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: "<img class={{ '  a b c  ': '  d e f '}['  a b c  ']} />",

          options: [{
            attributes: [["class", [{ match: MatcherType.ObjectKey }]]]
          }]
        }
      ]
    });
  });

  // #286
  it("should not match index access string literals", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: "<img class={{ ' a b c ': ' d e f '}[' a b c ']} />",
          jsxOutput: "<img class={{ ' a b c ': 'd e f'}[' a b c ']} />",

          errors: 2,

          options: [{
            attributes: [["class", [{ match: MatcherType.ObjectValue }]]]
          }]
        },
        {
          jsx: "<img class={cx(' a b c ')[' d e f ']} />",
          jsxOutput: "<img class={cx('a b c')[' d e f ']} />",

          errors: 2,

          options: [{
            callees: [["cx", [{ match: MatcherType.String }]]]
          }]
        }
      ]
    });
  });

});

describe("astro (jsx)", () => {
  it("should match astro syntactic sugar", () => {
    lint(enforceConsistentClassOrder, {
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

describe("solid (jsx)", () => {
  it("should match solid classList attribute", () => {
    lint(enforceConsistentClassOrder, {
      invalid: [
        {
          jsx: `<div classList={{ "b a": true }} />`,
          jsxOutput: `<div classList={{ "a b": true }} />`,

          errors: 1,
          options: [{ order: "asc" }]
        }
      ]
    });
  });
});
