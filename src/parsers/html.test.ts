import { describe, it } from "vitest";

import { enforceConsistentClassOrder } from "better-tailwindcss:rules/enforce-consistent-class-order.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";


describe("html", () => {

  it("should match attribute names via regex", () => {
    lint(enforceConsistentClassOrder, TEST_SYNTAXES, {
      invalid: [
        {
          html: `<img customAttribute="b a" />`,
          htmlOutput: `<img customAttribute="a b" />`,

          errors: 1,
          options: [{ attributes: [".*Attribute"], order: "asc" }]
        }
      ]
    });
  });

});
