import { describe, it } from "vitest";

import { TWX_CALLEE_STRINGS, TWX_TAG } from "better-tailwindcss:options/tags/twx.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("twx", () => {

  it("should lint tagged template literals on member expressions", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: "twx.div` lint `;",
          jsxOutput: "twx.div`lint`;",
          svelte: "<script>twx.div` lint `;</script>",
          svelteOutput: "<script>twx.div`lint`;</script>",
          vue: "<script>twx.div` lint `;</script>",
          vueOutput: "<script>twx.div`lint`;</script>",

          errors: 2,
          options: [{ selectors: [TWX_TAG] }]
        }
      ]
    });
  });

  it("should lint tagged template literals on call expressions", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: "twx(Card)` lint `;",
          jsxOutput: "twx(Card)`lint`;",
          svelte: "<script>twx(Card)` lint `;</script>",
          svelteOutput: "<script>twx(Card)`lint`;</script>",
          vue: "<script>twx(Card)` lint `;</script>",
          vueOutput: "<script>twx(Card)`lint`;</script>",

          errors: 2,
          options: [{ selectors: [TWX_TAG] }]
        }
      ]
    });
  });

  it("should lint strings inside arrow function callbacks", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `twx.div(({ $active }) => [" lint ", $active && " lint "]);`,
          jsxOutput: `twx.div(({ $active }) => ["lint", $active && "lint"]);`,
          svelte: `<script>twx.div(({ $active }) => [" lint ", $active && " lint "]);</script>`,
          svelteOutput: `<script>twx.div(({ $active }) => ["lint", $active && "lint"]);</script>`,
          vue: `<script>twx.div(({ $active }) => [" lint ", $active && " lint "]);</script>`,
          vueOutput: `<script>twx.div(({ $active }) => ["lint", $active && "lint"]);</script>`,

          errors: 4,
          options: [{ selectors: [TWX_CALLEE_STRINGS] }]
        }
      ]
    });
  });

  it("should lint strings inside arrow function callbacks with block body", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `twx.span(({ $active }) => { return [" lint ", $active && " lint "]; });`,
          jsxOutput: `twx.span(({ $active }) => { return ["lint", $active && "lint"]; });`,
          svelte: `<script>twx.span(({ $active }) => { return [" lint ", $active && " lint "]; });</script>`,
          svelteOutput: `<script>twx.span(({ $active }) => { return ["lint", $active && "lint"]; });</script>`,
          vue: `<script>twx.span(({ $active }) => { return [" lint ", $active && " lint "]; });</script>`,
          vueOutput: `<script>twx.span(({ $active }) => { return ["lint", $active && "lint"]; });</script>`,

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
          jsx: `other.div(({ $active }) => [" ignore ", $active && " ignore "]);`,
          svelte: `<script>other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,
          vue: `<script>other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,

          options: [{ selectors: [TWX_CALLEE_STRINGS] }]
        }
      ]
    });
  });

});
