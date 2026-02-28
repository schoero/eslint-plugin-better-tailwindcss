import { describe, it } from "vitest";

import { TWC_CALLEE_STRINGS, TWC_TAG } from "better-tailwindcss:options/tags/twc.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("twc", () => {

  it("should lint tagged template literals on member expressions", () => {

    const dirty = `const Root = twc.div\` lint \`;`;
    const clean = `const Root = twc.div\`lint\`;`;

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
          options: [{ selectors: [TWC_TAG] }]
        }
      ]
    });

  });

  it("should lint tagged template literals on call expressions", () => {

    const dirty = `const Root = twc(Card)\` lint \`;`;
    const clean = `const Root = twc(Card)\`lint\`;`;

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
          options: [{ selectors: [TWC_TAG] }]
        }
      ]
    });

  });

  it("should lint strings inside arrow function callbacks", () => {

    const dirty = `const Root = twc.div(({ $active }) => [" lint ", $active && " lint "]);`;
    const clean = `const Root = twc.div(({ $active }) => ["lint", $active && "lint"]);`;

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
          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });

  });

});
