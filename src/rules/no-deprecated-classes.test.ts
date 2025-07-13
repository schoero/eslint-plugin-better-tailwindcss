import { describe, it } from "vitest";

import { noDeprecatedClasses } from "better-tailwindcss:rules/no-deprecated-classes.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";
import { css } from "better-tailwindcss:tests/utils/template.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/version.js";


describe.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)(noDeprecatedClasses.name, () => {

  it("should fix replaceable deprecated classes", () => {
    lint(
      noDeprecatedClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="shadow" />`,
            angularOutput: `<img class="shadow-sm" />`,
            html: `<img class="shadow" />`,
            htmlOutput: `<img class="shadow-sm" />`,
            jsx: `() => <img class="shadow" />`,
            jsxOutput: `() => <img class="shadow-sm" />`,
            svelte: `<img class="shadow" />`,
            svelteOutput: `<img class="shadow-sm" />`,
            vue: `<template><img class="shadow" /></template>`,
            vueOutput: `<template><img class="shadow-sm" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should warn for irreplaceable deprecated classes", () => {
    lint(
      noDeprecatedClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="bg-opacity-50" />`,
            html: `<img class="bg-opacity-50" />`,
            jsx: `() => <img class="bg-opacity-50" />`,
            svelte: `<img class="bg-opacity-50" />`,
            vue: `<template><img class="bg-opacity-50" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should work with variants", () => {
    lint(
      noDeprecatedClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="hover:shadow" />`,
            angularOutput: `<img class="hover:shadow-sm" />`,
            html: `<img class="hover:shadow" />`,
            htmlOutput: `<img class="hover:shadow-sm" />`,
            jsx: `() => <img class="hover:shadow" />`,
            jsxOutput: `() => <img class="hover:shadow-sm" />`,
            svelte: `<img class="hover:shadow" />`,
            svelteOutput: `<img class="hover:shadow-sm" />`,
            vue: `<template><img class="hover:shadow" /></template>`,
            vueOutput: `<template><img class="hover:shadow-sm" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should keep the original value", () => {
    lint(
      noDeprecatedClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="flex-shrink-1" />`,
            angularOutput: `<img class="shrink-1" />`,
            html: `<img class="flex-shrink-1" />`,
            htmlOutput: `<img class="shrink-1" />`,
            jsx: `() => <img class="flex-shrink-1" />`,
            jsxOutput: `() => <img class="shrink-1" />`,
            svelte: `<img class="flex-shrink-1" />`,
            svelteOutput: `<img class="shrink-1" />`,
            vue: `<template><img class="flex-shrink-1" /></template>`,
            vueOutput: `<template><img class="shrink-1" /></template>`,

            errors: 1
          },
          {
            angular: `<img class="flex-shrink-[1]" />`,
            angularOutput: `<img class="shrink-[1]" />`,
            html: `<img class="flex-shrink-[1]" />`,
            htmlOutput: `<img class="shrink-[1]" />`,
            jsx: `() => <img class="flex-shrink-[1]" />`,
            jsxOutput: `() => <img class="shrink-[1]" />`,
            svelte: `<img class="flex-shrink-[1]" />`,
            svelteOutput: `<img class="shrink-[1]" />`,
            vue: `<template><img class="flex-shrink-[1]" /></template>`,
            vueOutput: `<template><img class="shrink-[1]" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should keep the important modifier", () => {
    lint(
      noDeprecatedClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="shadow!" />`,
            angularOutput: `<img class="shadow-sm!" />`,
            html: `<img class="shadow!" />`,
            htmlOutput: `<img class="shadow-sm!" />`,
            jsx: `() => <img class="shadow!" />`,
            jsxOutput: `() => <img class="shadow-sm!" />`,
            svelte: `<img class="shadow!" />`,
            svelteOutput: `<img class="shadow-sm!" />`,
            vue: `<template><img class="shadow!" /></template>`,
            vueOutput: `<template><img class="shadow-sm!" /></template>`,

            errors: 1
          },
          {
            angular: `<img class="!shadow" />`,
            angularOutput: `<img class="!shadow-sm" />`,
            html: `<img class="!shadow" />`,
            htmlOutput: `<img class="!shadow-sm" />`,
            jsx: `() => <img class="!shadow" />`,
            jsxOutput: `() => <img class="!shadow-sm" />`,
            svelte: `<img class="!shadow" />`,
            svelteOutput: `<img class="!shadow-sm" />`,
            vue: `<template><img class="!shadow" /></template>`,
            vueOutput: `<template><img class="!shadow-sm" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should keep the tailwindcss prefix", () => {
    lint(
      noDeprecatedClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="tw:shadow" />`,
            angularOutput: `<img class="tw:shadow-sm" />`,
            html: `<img class="tw:shadow" />`,
            htmlOutput: `<img class="tw:shadow-sm" />`,
            jsx: `() => <img class="tw:shadow" />`,
            jsxOutput: `() => <img class="tw:shadow-sm" />`,
            svelte: `<img class="tw:shadow" />`,
            svelteOutput: `<img class="tw:shadow-sm" />`,
            vue: `<template><img class="tw:shadow" /></template>`,
            vueOutput: `<template><img class="tw:shadow-sm" /></template>`,

            errors: 1,
            files: {
              "tailwind.css": css`
                @import "tailwindcss" prefix(tw);
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          },
          {
            angular: `<img class="tw:hover:shadow!" />`,
            angularOutput: `<img class="tw:hover:shadow-sm!" />`,
            html: `<img class="tw:hover:shadow!" />`,
            htmlOutput: `<img class="tw:hover:shadow-sm!" />`,
            jsx: `() => <img class="tw:hover:shadow!" />`,
            jsxOutput: `() => <img class="tw:hover:shadow-sm!" />`,
            svelte: `<img class="tw:hover:shadow!" />`,
            svelteOutput: `<img class="tw:hover:shadow-sm!" />`,
            vue: `<template><img class="tw:hover:shadow!" /></template>`,
            vueOutput: `<template><img class="tw:hover:shadow-sm!" /></template>`,

            errors: 1,
            files: {
              "tailwind.css": css`
                @import "tailwindcss" prefix(tw);
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );

  });

});
