import { describe, it } from "vitest";

import { sortClasses } from "better-tailwindcss:rules/sort-classes.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils.js";


describe("html", () => {

  it("should match attribute names via regex", () => {
    lint(sortClasses, TEST_SYNTAXES, {
      invalid: [
        {
          errors: 1,
          html: `<img customAttribute="b a" />`,
          htmlOutput: `<img customAttribute="a b" />`,
          options: [{ attributes: [".*Attribute"], order: "asc" }]
        }
      ]
    });
  });

});
