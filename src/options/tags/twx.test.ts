import { describe, it } from "vitest";

import { TWX_CALLEE_STRINGS, TWX_TAG } from "better-tailwindcss:options/tags/twx.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("twx", () => {

  it("should lint tagged template literals on member expressions", () => {

    const dirty = `const Root = twx.div\` lint \`;`;
    const clean = `const Root = twx.div\`lint\`;`;

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
          options: [{ selectors: [TWX_TAG] }]
        }
      ]
    });

  });

  it("should lint tagged template literals on call expressions", () => {

    const dirty = `const Root = twx(Card)\` lint \`;`;
    const clean = `const Root = twx(Card)\`lint\`;`;

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
          options: [{ selectors: [TWX_TAG] }]
        }
      ]
    });

  });

  it("should lint strings inside arrow function callbacks", () => {

    const dirty = `const Root = twx.div(({ $active }) => [" lint ", $active && " lint "]);`;
    const clean = `const Root = twx.div(({ $active }) => ["lint", $active && "lint"]);`;

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
          options: [{ selectors: [TWX_CALLEE_STRINGS] }]
        }
      ]
    });

  });

  it("should lint strings inside arrow function callbacks with block body", () => {

    const dirty = `const Root = twx.span(({ $active }) => { return [" lint ", $active && " lint "]; });`;
    const clean = `const Root = twx.span(({ $active }) => { return ["lint", $active && "lint"]; });`;

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
          options: [{ selectors: [TWX_CALLEE_STRINGS] }]
        }
      ]
    });

  });

  it("should not lint strings that are not inside twx member expressions", () => {

    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `const x = other.div(({ $active }) => [" ignore ", $active && " ignore "]);`,
          svelte: `<script>const x = other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,
          vue: `<script>const x = other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,

          options: [{ selectors: [TWX_CALLEE_STRINGS] }]
        }
      ]
    });

  });

});
