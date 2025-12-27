import { describe, it } from "vitest";

import { enforceCanonicalClasses } from "better-tailwindcss:rules/enforce-canonical-classes.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { css } from "better-tailwindcss:tests/utils/template.js";
import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version.js";


describe.runIf(getTailwindCSSVersion().major >= 4)(enforceCanonicalClasses.name, () => {

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

  it("should collapse multiple utilities into a single utility", () => {
    lint(enforceCanonicalClasses, {
      invalid: [
        {
          angular: `<img class="w-10 h-10 flex" />`,
          angularOutput: `<img class="size-10  flex" />`,
          html: `<img class="w-10 h-10 flex" />`,
          htmlOutput: `<img class="size-10  flex" />`,
          jsx: `() => <img class="w-10 h-10 flex" />`,
          jsxOutput: `() => <img class="size-10  flex" />`,
          svelte: `<img class="w-10 h-10 flex" />`,
          svelteOutput: `<img class="size-10  flex" />`,
          vue: `<template><img class="w-10 h-10 flex" /></template>`,
          vueOutput: `<template><img class="size-10  flex" /></template>`,

          errors: 2,

          options: [{
            collapse: true
          }]
        }
      ]
    });
  });

  it("should convert size correctly", () => {
    lint(enforceCanonicalClasses, {
      invalid: [
        {
          angular: `<img class="w-[20px] h-[20px]" />`,
          angularOutput: `<img class="size-5 " />`,
          html: `<img class="w-[20px] h-[20px]" />`,
          htmlOutput: `<img class="size-5 " />`,
          jsx: `() => <img class="w-[20px] h-[20px]" />`,
          jsxOutput: `() => <img class="size-5 " />`,
          svelte: `<img class="w-[20px] h-[20px]" />`,
          svelteOutput: `<img class="size-5 " />`,
          vue: `<template><img class="w-[20px] h-[20px]" /></template>`,
          vueOutput: `<template><img class="size-5 " /></template>`,

          errors: 2,

          files: {
            "styles.css": css`
              @import "tailwindcss";
            `
          },
          settings: {
            "better-tailwindcss": {
              entryPoint: "styles.css",
              rootFontSize: 16
            }
          }
        }
      ]
    });
  });

  it("should convert to logical properties", () => {
    lint(enforceCanonicalClasses, {
      invalid: [
        {
          angular: `<img class="mr-2 ml-2" />`,
          angularOutput: `<img class="mx-2 " />`,
          html: `<img class="mr-2 ml-2" />`,
          htmlOutput: `<img class="mx-2 " />`,
          jsx: `() => <img class="mr-2 ml-2" />`,
          jsxOutput: `() => <img class="mx-2 " />`,
          svelte: `<img class="mr-2 ml-2" />`,
          svelteOutput: `<img class="mx-2 " />`,
          vue: `<template><img class="mr-2 ml-2" /></template>`,
          vueOutput: `<template><img class="mx-2 " /></template>`,

          errors: 2,

          files: {
            "styles.css": css`
              @import "tailwindcss";
            `
          },
          options: [{
            entryPoint: "styles.css",
            logical: true,
            rootFontSize: 16
          }]
        }
      ]
    });
  });

});
