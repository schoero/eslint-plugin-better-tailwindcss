import { describe, it } from "vitest";

import { noDeprecatedClasses } from "better-tailwindcss:rules/no-deprecated-classes.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { css } from "better-tailwindcss:tests/utils/template.js";
import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version";


const testCases = [
  ["shadow", "shadow-sm"],
  ["inset-shadow", "inset-shadow-sm"],
  ["drop-shadow", "drop-shadow-sm"],
  ["blur", "blur-sm"],
  ["backdrop-blur", "backdrop-blur-sm"],
  ["rounded", "rounded-sm"],

  ["bg-opacity-70", undefined],
  ["text-opacity-70", undefined],
  ["border-opacity-70", undefined],
  ["divide-opacity-70", undefined],
  ["ring-opacity-70", undefined],
  ["placeholder-opacity-70", undefined],

  ["flex-shrink-1", "shrink-1"],
  ["flex-grow-1", "grow-1"],

  ["overflow-ellipsis", "text-ellipsis"],

  ["decoration-slice", "box-decoration-slice"],
  ["decoration-clone", "box-decoration-clone"],

  // 4.1 deprecations
  ["bg-left-top", "bg-top-left"],
  ["bg-left-bottom", "bg-bottom-left"],
  ["bg-right-top", "bg-top-right"],
  ["bg-right-bottom", "bg-bottom-right"],
  ["object-left-top", "object-top-left"],
  ["object-left-bottom", "object-bottom-left"],
  ["object-right-top", "object-top-right"],
  ["object-right-bottom", "object-bottom-right"]
] satisfies [string, string | undefined][];

describe.runIf(getTailwindCSSVersion().major >= 4)(noDeprecatedClasses.name, () => {

  it("should not report valid classes", () => {
    lint(
      noDeprecatedClasses,
      {
        valid: [
          {
            angular: `<img class="shadow-sm font-bold bg-black/50 shrink-1 text-ellipsis" />`,
            html: `<img class="shadow-sm font-bold bg-black/50 shrink-1 text-ellipsis" />`,
            jsx: `() => <img class="shadow-sm font-bold bg-black/50 shrink-1 text-ellipsis" />`,
            svelte: `<img class="shadow-sm font-bold bg-black/50 shrink-1 text-ellipsis" />`,
            vue: `<template><img class="shadow-sm font-bold bg-black/50 shrink-1 text-ellipsis" /></template>`
          }
        ]
      }
    );
  });

  it("should fix replaceable deprecated classes", () => {
    lint(
      noDeprecatedClasses,
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

  it.each(testCases)(`should report "%s"`, (input, output) => {

    const hasFix = output !== undefined;

    if(hasFix){
      lint(
        noDeprecatedClasses,
        {
          invalid: [
            {
              angular: `<img class="${input}" />`,
              angularOutput: `<img class="${output}" />`,
              html: `<img class="${input}" />`,
              htmlOutput: `<img class="${output}" />`,
              jsx: `() => <img class="${input}" />`,
              jsxOutput: `() => <img class="${output}" />`,
              svelte: `<img class="${input}" />`,
              svelteOutput: `<img class="${output}" />`,
              vue: `<template><img class="${input}" /></template>`,
              vueOutput: `<template><img class="${output}" /></template>`,

              errors: 1
            }
          ]
        }
      );
    } else {
      lint(
        noDeprecatedClasses,
        {
          invalid: [
            {
              angular: `<img class="${input}" />`,
              html: `<img class="${input}" />`,
              jsx: `() => <img class="${input}" />`,
              svelte: `<img class="${input}" />`,
              vue: `<template><img class="${input}" /></template>`,

              errors: 1
            }
          ]
        }
      );
    }

  });

});
