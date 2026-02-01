import { describe, it } from "vitest";

import { enforceConsistentLineWrapping } from "better-tailwindcss:rules/enforce-consistent-line-wrapping.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("css", () => {
  it("should lint single classes", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          css: `@utility test { @apply  lint ; }`,
          cssOutput: `@utility test { @apply lint; }`,

          errors: 2
        }
      ]
    });
  });

  it("should lint multiple classes", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          css: `@utility test { @apply  lint  lint ; }`,
          cssOutput: `@utility test { @apply lint lint; }`,

          errors: 3
        }
      ]
    });
  });

  it("should lint multiline class lists", () => {
    lint(enforceConsistentLineWrapping, {
      invalid: [
        {
          css: `
            @utility test {
              @apply lint hover:lint ;
            }
          `,
          cssOutput: `
            @utility test {
              @apply 
                lint
                hover:lint
              ;
            }
          `,

          errors: 1
        }
      ]
    });
  });

  it("should support raw prelude", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          css: `@utility test { @apply  text-[red] ; }`,
          cssOutput: `@utility test { @apply text-[red]; }`,

          errors: 2
        }
      ]
    });
  });

  it("should add a whitespace when collapsing to a single line", () => {
    lint(enforceConsistentLineWrapping, {
      invalid: [
        {
          css: `
            @utility test {
              @apply
                text-red-500
              ;
            }
          `,
          cssOutput: `
            @utility test {
              @apply text-red-500;
            }
          `,

          errors: 1
        }
      ]
    });
  });

});
