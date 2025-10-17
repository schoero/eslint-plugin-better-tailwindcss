import { describe, it } from "vitest";

import { CTL_STRINGS } from "better-tailwindcss:options/callees/ctl.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("ctl", () => {

  it("should lint strings", () => {

    const dirty = `ctl(" lint ")`;
    const clean = `ctl("lint")`;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 2,
          options: [{ callees: [CTL_STRINGS] }]
        }
      ]
    });

  });

});
