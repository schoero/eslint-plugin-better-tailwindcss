import { describe, it } from "vitest";

import { enforceShorthandClasses } from "better-tailwindcss:rules/enforce-shorthand-classes.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";


describe(enforceShorthandClasses.name, () => {

  it("should not report on shorthand classes", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="size-4" />`,
            html: `<img class="size-4" />`,
            jsx: `() => <img class="size-4" />`,
            svelte: `<img class="size-4" />`,
            vue: `<template><img class="size-4" /></template>`
          }
        ]
      }
    );
  });

  it("should not report on classes that have no shorthand", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="flex" />`,
            html: `<img class="flex" />`,
            jsx: `() => <img class="flex" />`,
            svelte: `<img class="flex" />`,
            vue: `<template><img class="flex" /></template>`
          }
        ]
      }
    );
  });

  it("should collapse multiple classes into their shorthand", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="w-4 h-4" />`,
            angularOutput: `<img class="size-4" />`,
            html: `<img class="w-4 h-4" />`,
            htmlOutput: `<img class="size-4" />`,
            jsx: `() => <img class="w-4 h-4" />`,
            jsxOutput: `() => <img class="size-4" />`,
            svelte: `<img class="w-4 h-4" />`,
            svelteOutput: `<img class="size-4" />`,
            vue: `<template><img class="w-4 h-4" /></template>`,
            vueOutput: `<template><img class="size-4" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should not collapse classes if they have a different sign", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="w-4 -h-4" />`,
            html: `<img class="w-4 -h-4" />`,
            jsx: `() => <img class="w-4 -h-4" />`,
            svelte: `<img class="w-4 -h-4" />`,
            vue: `<template><img class="w-4 -h-4" /></template>`
          }
        ]
      }
    );
  });

  it("should collapse many classes into their shorthand", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="pt-4 pr-4 pb-4 pl-4" />`,
            angularOutput: `<img class="p-4" />`,
            html: `<img class="pt-4 pr-4 pb-4 pl-4" />`,
            htmlOutput: `<img class="p-4" />`,
            jsx: `() => <img class="pt-4 pr-4 pb-4 pl-4" />`,
            jsxOutput: `() => <img class="p-4" />`,
            svelte: `<img class="pt-4 pr-4 pb-4 pl-4" />`,
            svelteOutput: `<img class="p-4" />`,
            vue: `<template><img class="pt-4 pr-4 pb-4 pl-4" /></template>`,
            vueOutput: `<template><img class="p-4" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should not collapse differing classes into an otherwise valid shorthand", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="pt-4 pr-2 pb-4 pl-4" />`,
            angularOutput: `<img class="py-4 pr-2 pl-4" />`,
            html: `<img class="pt-4 pr-2 pb-4 pl-4" />`,
            htmlOutput: `<img class="py-4 pr-2 pl-4" />`,
            jsx: `() => <img class="pt-4 pr-2 pb-4 pl-4" />`,
            jsxOutput: `() => <img class="py-4 pr-2 pl-4" />`,
            svelte: `<img class="pt-4 pr-2 pb-4 pl-4" />`,
            svelteOutput: `<img class="py-4 pr-2 pl-4" />`,
            vue: `<template><img class="pt-4 pr-2 pb-4 pl-4" /></template>`,
            vueOutput: `<template><img class="py-4 pr-2 pl-4" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should work with variants", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="hover:w-4 hover:h-4" />`,
            angularOutput: `<img class="hover:size-4" />`,
            html: `<img class="hover:w-4 hover:h-4" />`,
            htmlOutput: `<img class="hover:size-4" />`,
            jsx: `() => <img class="hover:w-4 hover:h-4" />`,
            jsxOutput: `() => <img class="hover:size-4" />`,
            svelte: `<img class="hover:w-4 hover:h-4" />`,
            svelteOutput: `<img class="hover:size-4" />`,
            vue: `<template><img class="hover:w-4 hover:h-4" /></template>`,
            vueOutput: `<template><img class="hover:size-4" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should not report when one instance has a variant", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="w-4 hover:h-4" />`,
            html: `<img class="w-4 hover:h-4" />`,
            jsx: `() => <img class="w-4 hover:h-4" />`,
            svelte: `<img class="w-4 hover:h-4" />`,
            vue: `<template><img class="w-4 hover:h-4" /></template>`
          }
        ]
      }
    );
  });

  it("should not report when one instance has a different variant", () => {
    lint(
      enforceShorthandClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="focus:w-4 hover:h-4" />`,
            html: `<img class="focus:w-4 hover:h-4" />`,
            jsx: `() => <img class="focus:w-4 hover:h-4" />`,
            svelte: `<img class="focus:w-4 hover:h-4" />`,
            vue: `<template><img class="focus:w-4 hover:h-4" /></template>`
          }
        ]
      }
    );
  });

});
