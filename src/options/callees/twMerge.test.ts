import { describe, it } from "vitest";

import { TW_MERGE_STRINGS } from "better-tailwindcss:options/callees/twMerge.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("twMerge", () => {

  it("should lint strings and strings in arrays", () => {

    const dirty = `twMerge(" lint ", [" lint ", " lint "])`;
    const clean = `twMerge("lint", ["lint", "lint"])`;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 6,
          options: [{ callees: [TW_MERGE_STRINGS] }]
        }
      ]
    });

  });

});
