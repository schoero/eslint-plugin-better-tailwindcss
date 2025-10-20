import { describe, it } from "vitest";

import { enforceCanonicalClasses } from "better-tailwindcss:rules/enforce-canonical-classes.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe(enforceCanonicalClasses.name, () => {

  it("should convert unnecessary arbitrary value to canonical class", () => {
    lint(enforceCanonicalClasses, {
      invalid: [
        {
          angular: `<img class="[color:red]/100" />`,
          angularOutput: `<img class="text-[red]" />`,
          html: `<img class="[color:red]/100" />`,
          htmlOutput: `<img class="text-[red]" />`,
          jsx: `() => <img class="[color:red]/100" />`,
          jsxOutput: `() => <img class="text-[red]" />`,
          svelte: `<img class="[color:red]/100" />`,
          svelteOutput: `<img class="text-[red]" />`,
          vue: `<template><img class="[color:red]/100" /></template>`,
          vueOutput: `<template><img class="text-[red]" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should convert multiple unnecessary arbitrary values to canonical classes", () => {
    lint(enforceCanonicalClasses, {
      invalid: [
        {
          angular: `<img class="[@media_print]:flex [color:red]/50" />`,
          angularOutput: `<img class="print:flex text-[red]/50" />`,
          html: `<img class="[@media_print]:flex [color:red]/50" />`,
          htmlOutput: `<img class="print:flex text-[red]/50" />`,
          jsx: `() => <img class="[@media_print]:flex [color:red]/50" />`,
          jsxOutput: `() => <img class="print:flex text-[red]/50" />`,
          svelte: `<img class="[@media_print]:flex [color:red]/50" />`,
          svelteOutput: `<img class="print:flex text-[red]/50" />`,
          vue: `<template><img class="[@media_print]:flex [color:red]/50" /></template>`,
          vueOutput: `<template><img class="print:flex text-[red]/50" /></template>`,

          errors: 2
        }
      ]
    });
  });

});
