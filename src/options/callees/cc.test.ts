import { describe, it } from "vitest";

import { CC_OBJECT_KEYS, CC_STRINGS } from "better-tailwindcss:options/callees/cc.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("cc", () => {

  it("should lint strings and strings in arrays", () => {

    const dirty = `cc(" lint ", [" lint ", " lint "])`;
    const clean = `cc("lint", ["lint", "lint"])`;

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
          options: [{ callees: [CC_STRINGS] }]
        }
      ]
    });

  });

  it("should lint object keys", () => {

    const dirty = `
      cc(" ignore ", {
          " lint ": { " lint ": " ignore " },
        }
      )
    `;
    const clean = `
      cc(" ignore ", {
          "lint": { "lint": " ignore " },
        }
      )
    `;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 4,
          options: [{ callees: [CC_OBJECT_KEYS] }]
        }
      ]
    });
  });

});
