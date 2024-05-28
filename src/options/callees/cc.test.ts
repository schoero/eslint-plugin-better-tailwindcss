import { describe, it } from "node:test";

import { CC_OBJECT_KEYS, CC_STRINGS } from "readable-tailwind:options:callees/cc.js";
import { tailwindNoUnnecessaryWhitespace } from "readable-tailwind:rules:tailwind-no-unnecessary-whitespace.js";
import { lint, TEST_SYNTAXES } from "readable-tailwind:tests:utils.js";


describe("cc", () => {

  it("should lint strings and strings in arrays", () => {

    const dirty = `cc(" lint ", [" lint ", " lint "])`;
    const clean = `cc("lint", ["lint", "lint"])`;

    lint(tailwindNoUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          errors: 3,
          jsx: dirty,
          jsxOutput: clean,
          options: [{ callees: [CC_STRINGS] }],
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`
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

    lint(tailwindNoUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          errors: 2,
          jsx: dirty,
          jsxOutput: clean,
          options: [{ callees: [CC_OBJECT_KEYS] }],
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`
        }
      ]
    });
  });

});
