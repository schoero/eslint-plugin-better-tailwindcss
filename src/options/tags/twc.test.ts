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

  it("should lint strings inside arrow function callbacks with block body", () => {

    const dirty = `const Root = twc.div(({ $active }) => { return [" lint ", $active && " lint "]; });`;
    const clean = `const Root = twc.div(({ $active }) => { return ["lint", $active && "lint"]; });`;

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

  it("should lint strings in conditional arrow function returns", () => {

    const dirty = `const Root = twc.div(({ $active }) => $active ? " lint " : " lint2 ");`;
    const clean = `const Root = twc.div(({ $active }) => $active ? "lint" : "lint2");`;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,

          errors: 4,
          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });

  });

  it("should lint strings with multiple return paths in block body", () => {

    const dirty = `const Root = twc.div(({ $active }) => { if($active) { return " lint "; } return " lint2 "; });`;
    const clean = `const Root = twc.div(({ $active }) => { if($active) { return "lint"; } return "lint2"; });`;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,

          errors: 4,
          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });

  });

  it("should not lint strings that are not inside twc member expressions", () => {

    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `const x = other.div(({ $active }) => [" ignore ", $active && " ignore "]);`,
          svelte: `<script>const x = other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,
          vue: `<script>const x = other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,

          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });

  });

});
