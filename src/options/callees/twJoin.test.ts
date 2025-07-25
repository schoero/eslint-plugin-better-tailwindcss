import { describe, it } from "vitest";

import { TW_JOIN_STRINGS } from "better-tailwindcss:options/callees/twJoin.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";


describe("twJoin", () => {

  it("should lint strings and strings in arrays", () => {

    const dirty = `twJoin(" lint ", [" lint ", " lint "])`;
    const clean = `twJoin("lint", ["lint", "lint"])`;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 6,
          options: [{ callees: [TW_JOIN_STRINGS] }]
        }
      ]
    });

  });

});
