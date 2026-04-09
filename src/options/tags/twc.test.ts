import { describe, it } from "vitest";

import { TWC_CALLEE_STRINGS, TWC_TAG } from "better-tailwindcss:options/tags/twc.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("twc", () => {

  it("should lint tagged template literals on member expressions", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: "twc.div` lint `;",
          jsxOutput: "twc.div`lint`;",
          svelte: "<script>twc.div` lint `;</script>",
          svelteOutput: "<script>twc.div`lint`;</script>",
          vue: "<script>twc.div` lint `;</script>",
          vueOutput: "<script>twc.div`lint`;</script>",

          errors: 2,
          options: [{ selectors: [TWC_TAG] }]
        }
      ]
    });
  });

  it("should lint tagged template literals on call expressions", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: "twc(Card)` lint `;",
          jsxOutput: "twc(Card)`lint`;",
          svelte: "<script>twc(Card)` lint `;</script>",
          svelteOutput: "<script>twc(Card)`lint`;</script>",
          vue: "<script>twc(Card)` lint `;</script>",
          vueOutput: "<script>twc(Card)`lint`;</script>",

          errors: 2,
          options: [{ selectors: [TWC_TAG] }]
        }
      ]
    });
  });

  it("should lint strings inside arrow function callbacks", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `twc.div(({ $active }) => [" lint ", $active && " lint "]);`,
          jsxOutput: `twc.div(({ $active }) => ["lint", $active && "lint"]);`,
          svelte: `<script>twc.div(({ $active }) => [" lint ", $active && " lint "]);</script>`,
          svelteOutput: `<script>twc.div(({ $active }) => ["lint", $active && "lint"]);</script>`,
          vue: `<script>twc.div(({ $active }) => [" lint ", $active && " lint "]);</script>`,
          vueOutput: `<script>twc.div(({ $active }) => ["lint", $active && "lint"]);</script>`,

          errors: 4,
          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });
  });

  it("should lint strings inside arrow function callbacks with block body", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `twc.div(({ $active }) => { return [" lint ", $active && " lint "]; });`,
          jsxOutput: `twc.div(({ $active }) => { return ["lint", $active && "lint"]; });`,
          svelte: `<script>twc.div(({ $active }) => { return [" lint ", $active && " lint "]; });</script>`,
          svelteOutput: `<script>twc.div(({ $active }) => { return ["lint", $active && "lint"]; });</script>`,
          vue: `<script>twc.div(({ $active }) => { return [" lint ", $active && " lint "]; });</script>`,
          vueOutput: `<script>twc.div(({ $active }) => { return ["lint", $active && "lint"]; });</script>`,

          errors: 4,
          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });
  });

  it("should lint strings in conditional arrow function returns", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `twc.div(({ $active }) => $active ? " lint " : " lint2 ");`,
          jsxOutput: `twc.div(({ $active }) => $active ? "lint" : "lint2");`,
          svelte: `<script>twc.div(({ $active }) => $active ? " lint " : " lint2 ");</script>`,
          svelteOutput: `<script>twc.div(({ $active }) => $active ? "lint" : "lint2");</script>`,
          vue: `<script>twc.div(({ $active }) => $active ? " lint " : " lint2 ");</script>`,
          vueOutput: `<script>twc.div(({ $active }) => $active ? "lint" : "lint2");</script>`,

          errors: 4,
          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });
  });

  it("should lint strings with multiple return paths in block body", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `twc.div(({ $active }) => { if($active) { return " lint "; } return " lint2 "; });`,
          jsxOutput: `twc.div(({ $active }) => { if($active) { return "lint"; } return "lint2"; });`,

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
          jsx: `other.div(({ $active }) => [" ignore ", $active && " ignore "]);`,
          svelte: `<script>other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,
          vue: `<script>other.div(({ $active }) => [" ignore ", $active && " ignore "]);</script>`,

          options: [{ selectors: [TWC_CALLEE_STRINGS] }]
        }
      ]
    });
  });

});
