import { describe, it } from "vitest";

import { enforceConsistentVariableSyntax } from "better-tailwindcss:rules/enforce-consistent-variable-syntax.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { dedent } from "better-tailwindcss:tests/utils/template.js";
import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version";


describe(enforceConsistentVariableSyntax.name, () => {

  it.runIf(getTailwindCSSVersion().major >= 4)("should not report on the preferred syntax in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        valid: [
          {
            angular: `<img class="bg-(--brand)" />`,
            html: `<img class="bg-(--brand)" />`,
            jsx: `() => <img class="bg-(--brand)" />`,
            svelte: `<img class="bg-(--brand)" />`,
            vue: `<template><img class="bg-(--brand)" /></template>`,

            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="bg-[var(--brand)]" />`,
            html: `<img class="bg-[var(--brand)]" />`,
            jsx: `() => <img class="bg-[var(--brand)]" />`,
            svelte: `<img class="bg-[var(--brand)]" />`,
            vue: `<template><img class="bg-[var(--brand)]" /></template>`,

            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should not report on the preferred syntax in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        valid: [
          {
            angular: `<img class="bg-[--brand]" />`,
            html: `<img class="bg-[--brand]" />`,
            jsx: `() => <img class="bg-[--brand]" />`,
            svelte: `<img class="bg-[--brand]" />`,
            vue: `<template><img class="bg-[--brand]" /></template>`,

            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="bg-[var(--brand)]" />`,
            html: `<img class="bg-[var(--brand)]" />`,
            jsx: `() => <img class="bg-[var(--brand)]" />`,
            svelte: `<img class="bg-[var(--brand)]" />`,
            vue: `<template><img class="bg-[var(--brand)]" /></template>`,

            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it("should convert shorthands to variables", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-(--brand)" />`,
            angularOutput: `<img class="bg-[var(--brand)]" />`,
            html: `<img class="bg-(--brand)" />`,
            htmlOutput: `<img class="bg-[var(--brand)]" />`,
            jsx: `() => <img class="bg-(--brand)" />`,
            jsxOutput: `() => <img class="bg-[var(--brand)]" />`,
            svelte: `<img class="bg-(--brand)" />`,
            svelteOutput: `<img class="bg-[var(--brand)]" />`,
            vue: `<template><img class="bg-(--brand)" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="bg-[--brand]" />`,
            angularOutput: `<img class="bg-[var(--brand)]" />`,
            html: `<img class="bg-[--brand]" />`,
            htmlOutput: `<img class="bg-[var(--brand)]" />`,
            jsx: `() => <img class="bg-[--brand]" />`,
            jsxOutput: `() => <img class="bg-[var(--brand)]" />`,
            svelte: `<img class="bg-[--brand]" />`,
            svelteOutput: `<img class="bg-[var(--brand)]" />`,
            vue: `<template><img class="bg-[--brand]" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should convert variables to parenthesized shorthands in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[var(--brand)]" />`,
            angularOutput: `<img class="bg-(--brand)" />`,
            html: `<img class="bg-[var(--brand)]" />`,
            htmlOutput: `<img class="bg-(--brand)" />`,
            jsx: `() => <img class="bg-[var(--brand)]" />`,
            jsxOutput: `() => <img class="bg-(--brand)" />`,
            svelte: `<img class="bg-[var(--brand)]" />`,
            svelteOutput: `<img class="bg-(--brand)" />`,
            vue: `<template><img class="bg-[var(--brand)]" /></template>`,
            vueOutput: `<template><img class="bg-(--brand)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should convert variables to arbitrary shorthands in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[var(--brand)]" />`,
            angularOutput: `<img class="bg-[--brand]" />`,
            html: `<img class="bg-[var(--brand)]" />`,
            htmlOutput: `<img class="bg-[--brand]" />`,
            jsx: `() => <img class="bg-[var(--brand)]" />`,
            jsxOutput: `() => <img class="bg-[--brand]" />`,
            svelte: `<img class="bg-[var(--brand)]" />`,
            svelteOutput: `<img class="bg-[--brand]" />`,
            vue: `<template><img class="bg-[var(--brand)]" /></template>`,
            vueOutput: `<template><img class="bg-[--brand]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should work when surrounded by underlines in arbitrary syntax in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[__var(--brand)__]" />`,
            angularOutput: `<img class="bg-(--brand)" />`,
            html: `<img class="bg-[__var(--brand)__]" />`,
            htmlOutput: `<img class="bg-(--brand)" />`,
            jsx: `() => <img class="bg-[__var(--brand)__]" />`,
            jsxOutput: `() => <img class="bg-(--brand)" />`,
            svelte: `<img class="bg-[__var(--brand)__]" />`,
            svelteOutput: `<img class="bg-(--brand)" />`,
            vue: `<template><img class="bg-[__var(--brand)__]" /></template>`,
            vueOutput: `<template><img class="bg-(--brand)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should work when surrounded by underlines in arbitrary syntax in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[__var(--brand)__]" />`,
            angularOutput: `<img class="bg-[--brand]" />`,
            html: `<img class="bg-[__var(--brand)__]" />`,
            htmlOutput: `<img class="bg-[--brand]" />`,
            jsx: `() => <img class="bg-[__var(--brand)__]" />`,
            jsxOutput: `() => <img class="bg-[--brand]" />`,
            svelte: `<img class="bg-[__var(--brand)__]" />`,
            svelteOutput: `<img class="bg-[--brand]" />`,
            vue: `<template><img class="bg-[__var(--brand)__]" /></template>`,
            vueOutput: `<template><img class="bg-[--brand]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should work with variants in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="hover:bg-(--brand)" />`,
            angularOutput: `<img class="hover:bg-[var(--brand)]" />`,
            html: `<img class="hover:bg-(--brand)" />`,
            htmlOutput: `<img class="hover:bg-[var(--brand)]" />`,
            jsx: `() => <img class="hover:bg-(--brand)" />`,
            jsxOutput: `() => <img class="hover:bg-[var(--brand)]" />`,
            svelte: `<img class="hover:bg-(--brand)" />`,
            svelteOutput: `<img class="hover:bg-[var(--brand)]" />`,
            vue: `<template><img class="hover:bg-(--brand)" /></template>`,
            vueOutput: `<template><img class="hover:bg-[var(--brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="hover:bg-[var(--brand)]" />`,
            angularOutput: `<img class="hover:bg-(--brand)" />`,
            html: `<img class="hover:bg-[var(--brand)]" />`,
            htmlOutput: `<img class="hover:bg-(--brand)" />`,
            jsx: `() => <img class="hover:bg-[var(--brand)]" />`,
            jsxOutput: `() => <img class="hover:bg-(--brand)" />`,
            svelte: `<img class="hover:bg-[var(--brand)]" />`,
            svelteOutput: `<img class="hover:bg-(--brand)" />`,
            vue: `<template><img class="hover:bg-[var(--brand)]" /></template>`,
            vueOutput: `<template><img class="hover:bg-(--brand)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should work with variants in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="hover:bg-[--brand]" />`,
            angularOutput: `<img class="hover:bg-[var(--brand)]" />`,
            html: `<img class="hover:bg-[--brand]" />`,
            htmlOutput: `<img class="hover:bg-[var(--brand)]" />`,
            jsx: `() => <img class="hover:bg-[--brand]" />`,
            jsxOutput: `() => <img class="hover:bg-[var(--brand)]" />`,
            svelte: `<img class="hover:bg-[--brand]" />`,
            svelteOutput: `<img class="hover:bg-[var(--brand)]" />`,
            vue: `<template><img class="hover:bg-[--brand]" /></template>`,
            vueOutput: `<template><img class="hover:bg-[var(--brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="hover:bg-[var(--brand)]" />`,
            angularOutput: `<img class="hover:bg-[--brand]" />`,
            html: `<img class="hover:bg-[var(--brand)]" />`,
            htmlOutput: `<img class="hover:bg-[--brand]" />`,
            jsx: `() => <img class="hover:bg-[var(--brand)]" />`,
            jsxOutput: `() => <img class="hover:bg-[--brand]" />`,
            svelte: `<img class="hover:bg-[var(--brand)]" />`,
            svelteOutput: `<img class="hover:bg-[--brand]" />`,
            vue: `<template><img class="hover:bg-[var(--brand)]" /></template>`,
            vueOutput: `<template><img class="hover:bg-[--brand]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should work with other classes in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="text-red-500 bg-(--brand)" />`,
            angularOutput: `<img class="text-red-500 bg-[var(--brand)]" />`,
            html: `<img class="text-red-500 bg-(--brand)" />`,
            htmlOutput: `<img class="text-red-500 bg-[var(--brand)]" />`,
            jsx: `() => <img class="text-red-500 bg-(--brand)" />`,
            jsxOutput: `() => <img class="text-red-500 bg-[var(--brand)]" />`,
            svelte: `<img class="text-red-500 bg-(--brand)" />`,
            svelteOutput: `<img class="text-red-500 bg-[var(--brand)]" />`,
            vue: `<template><img class="text-red-500 bg-(--brand)" /></template>`,
            vueOutput: `<template><img class="text-red-500 bg-[var(--brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="text-red-500 bg-[var(--brand)]" />`,
            angularOutput: `<img class="text-red-500 bg-(--brand)" />`,
            html: `<img class="text-red-500 bg-[var(--brand)]" />`,
            htmlOutput: `<img class="text-red-500 bg-(--brand)" />`,
            jsx: `() => <img class="text-red-500 bg-[var(--brand)]" />`,
            jsxOutput: `() => <img class="text-red-500 bg-(--brand)" />`,
            svelte: `<img class="text-red-500 bg-[var(--brand)]" />`,
            svelteOutput: `<img class="text-red-500 bg-(--brand)" />`,
            vue: `<template><img class="text-red-500 bg-[var(--brand)]" /></template>`,
            vueOutput: `<template><img class="text-red-500 bg-(--brand)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should work with other classes <= tailwind 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="text-red-500 bg-[--brand]" />`,
            angularOutput: `<img class="text-red-500 bg-[var(--brand)]" />`,
            html: `<img class="text-red-500 bg-[--brand]" />`,
            htmlOutput: `<img class="text-red-500 bg-[var(--brand)]" />`,
            jsx: `() => <img class="text-red-500 bg-[--brand]" />`,
            jsxOutput: `() => <img class="text-red-500 bg-[var(--brand)]" />`,
            svelte: `<img class="text-red-500 bg-[--brand]" />`,
            svelteOutput: `<img class="text-red-500 bg-[var(--brand)]" />`,
            vue: `<template><img class="text-red-500 bg-[--brand]" /></template>`,
            vueOutput: `<template><img class="text-red-500 bg-[var(--brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="text-red-500 bg-[var(--brand)]" />`,
            angularOutput: `<img class="text-red-500 bg-[--brand]" />`,
            html: `<img class="text-red-500 bg-[var(--brand)]" />`,
            htmlOutput: `<img class="text-red-500 bg-[--brand]" />`,
            jsx: `() => <img class="text-red-500 bg-[var(--brand)]" />`,
            jsxOutput: `() => <img class="text-red-500 bg-[--brand]" />`,
            svelte: `<img class="text-red-500 bg-[var(--brand)]" />`,
            svelteOutput: `<img class="text-red-500 bg-[--brand]" />`,
            vue: `<template><img class="text-red-500 bg-[var(--brand)]" /></template>`,
            vueOutput: `<template><img class="text-red-500 bg-[--brand]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should work with the important modifier in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-(--brand)!" />`,
            angularOutput: `<img class="bg-[var(--brand)]!" />`,
            html: `<img class="bg-(--brand)!" />`,
            htmlOutput: `<img class="bg-[var(--brand)]!" />`,
            jsx: `() => <img class="bg-(--brand)!" />`,
            jsxOutput: `() => <img class="bg-[var(--brand)]!" />`,
            svelte: `<img class="bg-(--brand)!" />`,
            svelteOutput: `<img class="bg-[var(--brand)]!" />`,
            vue: `<template><img class="bg-(--brand)!" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand)]!" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="bg-[var(--brand)]!" />`,
            angularOutput: `<img class="bg-(--brand)!" />`,
            html: `<img class="bg-[var(--brand)]!" />`,
            htmlOutput: `<img class="bg-(--brand)!" />`,
            jsx: `() => <img class="bg-[var(--brand)]!" />`,
            jsxOutput: `() => <img class="bg-(--brand)!" />`,
            svelte: `<img class="bg-[var(--brand)]!" />`,
            svelteOutput: `<img class="bg-(--brand)!" />`,
            vue: `<template><img class="bg-[var(--brand)]!" /></template>`,
            vueOutput: `<template><img class="bg-(--brand)!" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should work with the important modifier in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[--brand]!" />`,
            angularOutput: `<img class="bg-[var(--brand)]!" />`,
            html: `<img class="bg-[--brand]!" />`,
            htmlOutput: `<img class="bg-[var(--brand)]!" />`,
            jsx: `() => <img class="bg-[--brand]!" />`,
            jsxOutput: `() => <img class="bg-[var(--brand)]!" />`,
            svelte: `<img class="bg-[--brand]!" />`,
            svelteOutput: `<img class="bg-[var(--brand)]!" />`,
            vue: `<template><img class="bg-[--brand]!" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand)]!" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="bg-[var(--brand)]!" />`,
            angularOutput: `<img class="bg-[--brand]!" />`,
            html: `<img class="bg-[var(--brand)]!" />`,
            htmlOutput: `<img class="bg-[--brand]!" />`,
            jsx: `() => <img class="bg-[var(--brand)]!" />`,
            jsxOutput: `() => <img class="bg-[--brand]!" />`,
            svelte: `<img class="bg-[var(--brand)]!" />`,
            svelteOutput: `<img class="bg-[--brand]!" />`,
            vue: `<template><img class="bg-[var(--brand)]!" /></template>`,
            vueOutput: `<template><img class="bg-[--brand]!" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should preserve fallback values in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[var(--brand,_#000)]" />`,
            angularOutput: `<img class="bg-(--brand,_#000)" />`,
            html: `<img class="bg-[var(--brand,_#000)]" />`,
            htmlOutput: `<img class="bg-(--brand,_#000)" />`,
            jsx: `() => <img class="bg-[var(--brand,_#000)]" />`,
            jsxOutput: `() => <img class="bg-(--brand,_#000)" />`,
            svelte: `<img class="bg-[var(--brand,_#000)]" />`,
            svelteOutput: `<img class="bg-(--brand,_#000)" />`,
            vue: `<template><img class="bg-[var(--brand,_#000)]" /></template>`,
            vueOutput: `<template><img class="bg-(--brand,_#000)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="bg-(--brand,_#000)" />`,
            angularOutput: `<img class="bg-[var(--brand,_#000)]" />`,
            html: `<img class="bg-(--brand,_#000)" />`,
            htmlOutput: `<img class="bg-[var(--brand,_#000)]" />`,
            jsx: `() => <img class="bg-(--brand,_#000)" />`,
            jsxOutput: `() => <img class="bg-[var(--brand,_#000)]" />`,
            svelte: `<img class="bg-(--brand,_#000)" />`,
            svelteOutput: `<img class="bg-[var(--brand,_#000)]" />`,
            vue: `<template><img class="bg-(--brand,_#000)" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand,_#000)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });


  it.runIf(getTailwindCSSVersion().major <= 3)("should preserve fallback values in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[var(--brand,_#000)]" />`,
            angularOutput: `<img class="bg-[--brand,_#000]" />`,
            html: `<img class="bg-[var(--brand,_#000)]" />`,
            htmlOutput: `<img class="bg-[--brand,_#000]" />`,
            jsx: `() => <img class="bg-[var(--brand,_#000)]" />`,
            jsxOutput: `() => <img class="bg-[--brand,_#000]" />`,
            svelte: `<img class="bg-[var(--brand,_#000)]" />`,
            svelteOutput: `<img class="bg-[--brand,_#000]" />`,
            vue: `<template><img class="bg-[var(--brand,_#000)]" /></template>`,
            vueOutput: `<template><img class="bg-[--brand,_#000]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="bg-[--brand,_#000]" />`,
            angularOutput: `<img class="bg-[var(--brand,_#000)]" />`,
            html: `<img class="bg-[--brand,_#000]" />`,
            htmlOutput: `<img class="bg-[var(--brand,_#000)]" />`,
            jsx: `() => <img class="bg-[--brand,_#000]" />`,
            jsxOutput: `() => <img class="bg-[var(--brand,_#000)]" />`,
            svelte: `<img class="bg-[--brand,_#000]" />`,
            svelteOutput: `<img class="bg-[var(--brand,_#000)]" />`,
            vue: `<template><img class="bg-[--brand,_#000]" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand,_#000)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should preserve css functions in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            angularOutput: `<img class="height-(--header,calc(100%_-_1rem))" />`,
            html: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            htmlOutput: `<img class="height-(--header,calc(100%_-_1rem))" />`,
            jsx: `() => <img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            jsxOutput: `() => <img class="height-(--header,calc(100%_-_1rem))" />`,
            svelte: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            svelteOutput: `<img class="height-(--header,calc(100%_-_1rem))" />`,
            vue: `<template><img class="height-[var(--header,calc(100%_-_1rem))]" /></template>`,
            vueOutput: `<template><img class="height-(--header,calc(100%_-_1rem))" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="height-(--header,calc(100%_-_1rem))" />`,
            angularOutput: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            html: `<img class="height-(--header,calc(100%_-_1rem))" />`,
            htmlOutput: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            jsx: `() => <img class="height-(--header,calc(100%_-_1rem))" />`,
            jsxOutput: `() => <img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            svelte: `<img class="height-(--header,calc(100%_-_1rem))" />`,
            svelteOutput: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            vue: `<template><img class="height-(--header,calc(100%_-_1rem))" /></template>`,
            vueOutput: `<template><img class="height-[var(--header,calc(100%_-_1rem))]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should preserve css functions in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            angularOutput: `<img class="height-[--header,calc(100%_-_1rem)]" />`,
            html: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            htmlOutput: `<img class="height-[--header,calc(100%_-_1rem)]" />`,
            jsx: `() => <img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            jsxOutput: `() => <img class="height-[--header,calc(100%_-_1rem)]" />`,
            svelte: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            svelteOutput: `<img class="height-[--header,calc(100%_-_1rem)]" />`,
            vue: `<template><img class="height-[var(--header,calc(100%_-_1rem))]" /></template>`,
            vueOutput: `<template><img class="height-[--header,calc(100%_-_1rem)]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="height-[--header,calc(100%_-_1rem)]" />`,
            angularOutput: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            html: `<img class="height-[--header,calc(100%_-_1rem)]" />`,
            htmlOutput: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            jsx: `() => <img class="height-[--header,calc(100%_-_1rem)]" />`,
            jsxOutput: `() => <img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            svelte: `<img class="height-[--header,calc(100%_-_1rem)]" />`,
            svelteOutput: `<img class="height-[var(--header,calc(100%_-_1rem))]" />`,
            vue: `<template><img class="height-[--header,calc(100%_-_1rem)]" /></template>`,
            vueOutput: `<template><img class="height-[var(--header,calc(100%_-_1rem))]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should work with nested variables in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            angularOutput: `<img class="bg-(--brand,var(--secondary))" />`,
            html: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            htmlOutput: `<img class="bg-(--brand,var(--secondary))" />`,
            jsx: `() => <img class="bg-[var(--brand,var(--secondary))]" />`,
            jsxOutput: `() => <img class="bg-(--brand,var(--secondary))" />`,
            svelte: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            svelteOutput: `<img class="bg-(--brand,var(--secondary))" />`,
            vue: `<template><img class="bg-[var(--brand,var(--secondary))]" /></template>`,
            vueOutput: `<template><img class="bg-(--brand,var(--secondary))" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="bg-(--brand,var(--secondary))" />`,
            angularOutput: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            html: `<img class="bg-(--brand,var(--secondary))" />`,
            htmlOutput: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            jsx: `() => <img class="bg-(--brand,var(--secondary))" />`,
            jsxOutput: `() => <img class="bg-[var(--brand,var(--secondary))]" />`,
            svelte: `<img class="bg-(--brand,var(--secondary))" />`,
            svelteOutput: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            vue: `<template><img class="bg-(--brand,var(--secondary))" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand,var(--secondary))]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should work with nested variables in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            angularOutput: `<img class="bg-[--brand,var(--secondary)]" />`,
            html: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            htmlOutput: `<img class="bg-[--brand,var(--secondary)]" />`,
            jsx: `() => <img class="bg-[var(--brand,var(--secondary))]" />`,
            jsxOutput: `() => <img class="bg-[--brand,var(--secondary)]" />`,
            svelte: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            svelteOutput: `<img class="bg-[--brand,var(--secondary)]" />`,
            vue: `<template><img class="bg-[var(--brand,var(--secondary))]" /></template>`,
            vueOutput: `<template><img class="bg-[--brand,var(--secondary)]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="bg-[--brand,var(--secondary)]" />`,
            angularOutput: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            html: `<img class="bg-[--brand,var(--secondary)]" />`,
            htmlOutput: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            jsx: `() => <img class="bg-[--brand,var(--secondary)]" />`,
            jsxOutput: `() => <img class="bg-[var(--brand,var(--secondary))]" />`,
            svelte: `<img class="bg-[--brand,var(--secondary)]" />`,
            svelteOutput: `<img class="bg-[var(--brand,var(--secondary))]" />`,
            vue: `<template><img class="bg-[--brand,var(--secondary)]" /></template>`,
            vueOutput: `<template><img class="bg-[var(--brand,var(--secondary))]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should preserve the case sensitivity of the variable name in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-(--Brand)" />`,
            angularOutput: `<img class="bg-[var(--Brand)]" />`,
            html: `<img class="bg-(--Brand)" />`,
            htmlOutput: `<img class="bg-[var(--Brand)]" />`,
            jsx: `() => <img class="bg-(--Brand)" />`,
            jsxOutput: `() => <img class="bg-[var(--Brand)]" />`,
            svelte: `<img class="bg-(--Brand)" />`,
            svelteOutput: `<img class="bg-[var(--Brand)]" />`,
            vue: `<template><img class="bg-(--Brand)" /></template>`,
            vueOutput: `<template><img class="bg-[var(--Brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="bg-[var(--Brand)]" />`,
            angularOutput: `<img class="bg-(--Brand)" />`,
            html: `<img class="bg-[var(--Brand)]" />`,
            htmlOutput: `<img class="bg-(--Brand)" />`,
            jsx: `() => <img class="bg-[var(--Brand)]" />`,
            jsxOutput: `() => <img class="bg-(--Brand)" />`,
            svelte: `<img class="bg-[var(--Brand)]" />`,
            svelteOutput: `<img class="bg-(--Brand)" />`,
            vue: `<template><img class="bg-[var(--Brand)]" /></template>`,
            vueOutput: `<template><img class="bg-(--Brand)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should preserve the case sensitivity of the variable name in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[--Brand]" />`,
            angularOutput: `<img class="bg-[var(--Brand)]" />`,
            html: `<img class="bg-[--Brand]" />`,
            htmlOutput: `<img class="bg-[var(--Brand)]" />`,
            jsx: `() => <img class="bg-[--Brand]" />`,
            jsxOutput: `() => <img class="bg-[var(--Brand)]" />`,
            svelte: `<img class="bg-[--Brand]" />`,
            svelteOutput: `<img class="bg-[var(--Brand)]" />`,
            vue: `<template><img class="bg-[--Brand]" /></template>`,
            vueOutput: `<template><img class="bg-[var(--Brand)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="bg-[var(--Brand)]" />`,
            angularOutput: `<img class="bg-[--Brand]" />`,
            html: `<img class="bg-[var(--Brand)]" />`,
            htmlOutput: `<img class="bg-[--Brand]" />`,
            jsx: `() => <img class="bg-[var(--Brand)]" />`,
            jsxOutput: `() => <img class="bg-[--Brand]" />`,
            svelte: `<img class="bg-[var(--Brand)]" />`,
            svelteOutput: `<img class="bg-[--Brand]" />`,
            vue: `<template><img class="bg-[var(--Brand)]" /></template>`,
            vueOutput: `<template><img class="bg-[--Brand]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should preserve allow special characters in variable names in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-(--special_variable_😏)" />`,
            angularOutput: `<img class="bg-[var(--special_variable_😏)]" />`,
            html: `<img class="bg-(--special_variable_😏)" />`,
            htmlOutput: `<img class="bg-[var(--special_variable_😏)]" />`,
            jsx: `() => <img class="bg-(--special_variable_😏)" />`,
            jsxOutput: `() => <img class="bg-[var(--special_variable_😏)]" />`,
            svelte: `<img class="bg-(--special_variable_😏)" />`,
            svelteOutput: `<img class="bg-[var(--special_variable_😏)]" />`,
            vue: `<template><img class="bg-(--special_variable_😏)" /></template>`,
            vueOutput: `<template><img class="bg-[var(--special_variable_😏)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="bg-[var(--special_variable_😏)]" />`,
            angularOutput: `<img class="bg-(--special_variable_😏)" />`,
            html: `<img class="bg-[var(--special_variable_😏)]" />`,
            htmlOutput: `<img class="bg-(--special_variable_😏)" />`,
            jsx: `() => <img class="bg-[var(--special_variable_😏)]" />`,
            jsxOutput: `() => <img class="bg-(--special_variable_😏)" />`,
            svelte: `<img class="bg-[var(--special_variable_😏)]" />`,
            svelteOutput: `<img class="bg-(--special_variable_😏)" />`,
            vue: `<template><img class="bg-[var(--special_variable_😏)]" /></template>`,
            vueOutput: `<template><img class="bg-(--special_variable_😏)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should preserve allow special characters in variable names in tailwind <= 3", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[--special_variable_😏]" />`,
            angularOutput: `<img class="bg-[var(--special_variable_😏)]" />`,
            html: `<img class="bg-[--special_variable_😏]" />`,
            htmlOutput: `<img class="bg-[var(--special_variable_😏)]" />`,
            jsx: `() => <img class="bg-[--special_variable_😏]" />`,
            jsxOutput: `() => <img class="bg-[var(--special_variable_😏)]" />`,
            svelte: `<img class="bg-[--special_variable_😏]" />`,
            svelteOutput: `<img class="bg-[var(--special_variable_😏)]" />`,
            vue: `<template><img class="bg-[--special_variable_😏]" /></template>`,
            vueOutput: `<template><img class="bg-[var(--special_variable_😏)]" /></template>`,

            errors: 1,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="bg-[var(--special_variable_😏)]" />`,
            angularOutput: `<img class="bg-[--special_variable_😏]" />`,
            html: `<img class="bg-[var(--special_variable_😏)]" />`,
            htmlOutput: `<img class="bg-[--special_variable_😏]" />`,
            jsx: `() => <img class="bg-[var(--special_variable_😏)]" />`,
            jsxOutput: `() => <img class="bg-[--special_variable_😏]" />`,
            svelte: `<img class="bg-[var(--special_variable_😏)]" />`,
            svelteOutput: `<img class="bg-[--special_variable_😏]" />`,
            vue: `<template><img class="bg-[var(--special_variable_😏)]" /></template>`,
            vueOutput: `<template><img class="bg-[--special_variable_😏]" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should work with multiline classes in tailwind >= 4", () => {

    const multilineShorthand = dedent`
      bg-(--primary)
      hover:bg-(--secondary)
    `;
    const multilineArbitrary = dedent`
      bg-[var(--primary)]
      hover:bg-[var(--secondary)]
    `;

    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="${multilineShorthand}" />`,
            angularOutput: `<img class="${multilineArbitrary}" />`,
            html: `<img class="${multilineShorthand}" />`,
            htmlOutput: `<img class="${multilineArbitrary}" />`,
            jsx: `() => <img class={\`${multilineShorthand}\`} />`,
            jsxOutput: `() => <img class={\`${multilineArbitrary}\`} />`,
            svelte: `<img class="${multilineShorthand}" />`,
            svelteOutput: `<img class="${multilineArbitrary}" />`,
            vue: `<template><img class="${multilineShorthand}" /></template>`,
            vueOutput: `<template><img class="${multilineArbitrary}" /></template>`,

            errors: 2,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="${multilineArbitrary}" />`,
            angularOutput: `<img class="${multilineShorthand}" />`,
            html: `<img class="${multilineArbitrary}" />`,
            htmlOutput: `<img class="${multilineShorthand}" />`,
            jsx: `() => <img class={\`${multilineArbitrary}\`} />`,
            jsxOutput: `() => <img class={\`${multilineShorthand}\`} />`,
            svelte: `<img class="${multilineArbitrary}" />`,
            svelteOutput: `<img class="${multilineShorthand}" />`,
            vue: `<template><img class="${multilineArbitrary}" /></template>`,
            vueOutput: `<template><img class="${multilineShorthand}" /></template>`,

            errors: 2,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major <= 3)("should work with multiline classes in tailwind <= 3", () => {

    const multilineShorthand = dedent`
      bg-[--primary]
      hover:bg-[--secondary]
    `;
    const multilineArbitrary = dedent`
      bg-[var(--primary)]
      hover:bg-[var(--secondary)]
    `;

    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="${multilineShorthand}" />`,
            angularOutput: `<img class="${multilineArbitrary}" />`,
            html: `<img class="${multilineShorthand}" />`,
            htmlOutput: `<img class="${multilineArbitrary}" />`,
            jsx: `() => <img class={\`${multilineShorthand}\`} />`,
            jsxOutput: `() => <img class={\`${multilineArbitrary}\`} />`,
            svelte: `<img class="${multilineShorthand}" />`,
            svelteOutput: `<img class="${multilineArbitrary}" />`,
            vue: `<template><img class="${multilineShorthand}" /></template>`,
            vueOutput: `<template><img class="${multilineArbitrary}" /></template>`,

            errors: 2,
            options: [{ syntax: "variable" }]
          },
          {
            angular: `<img class="${multilineArbitrary}" />`,
            angularOutput: `<img class="${multilineShorthand}" />`,
            html: `<img class="${multilineArbitrary}" />`,
            htmlOutput: `<img class="${multilineShorthand}" />`,
            jsx: `() => <img class={\`${multilineArbitrary}\`} />`,
            jsxOutput: `() => <img class={\`${multilineShorthand}\`} />`,
            svelte: `<img class="${multilineArbitrary}" />`,
            svelteOutput: `<img class="${multilineShorthand}" />`,
            vue: `<template><img class="${multilineArbitrary}" /></template>`,
            vueOutput: `<template><img class="${multilineShorthand}" /></template>`,

            errors: 2,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindCSSVersion().major >= 4)("should convert arbitrary shorthands to parenthesized shorthands in tailwind >= 4", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        invalid: [
          {
            angular: `<img class="bg-[--brand]" />`,
            angularOutput: `<img class="bg-(--brand)" />`,
            html: `<img class="bg-[--brand]" />`,
            htmlOutput: `<img class="bg-(--brand)" />`,
            jsx: `() => <img class="bg-[--brand]" />`,
            jsxOutput: `() => <img class="bg-(--brand)" />`,
            svelte: `<img class="bg-[--brand]" />`,
            svelteOutput: `<img class="bg-(--brand)" />`,
            vue: `<template><img class="bg-[--brand]" /></template>`,
            vueOutput: `<template><img class="bg-(--brand)" /></template>`,

            errors: 1,
            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it("should not convert variable definitions", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        valid: [
          {
            angular: `<img class="[--green:#00ff00]" />`,
            html: `<img class="[--green:#00ff00]" />`,
            jsx: `() => <img class="[--green:#00ff00]" />`,
            svelte: `<img class="[--green:#00ff00]" />`,
            vue: `<template><img class="[--green:#00ff00]" /></template>`,

            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="hover:[--green:#00ff00]" />`,
            html: `<img class="hover:[--green:#00ff00]" />`,
            jsx: `() => <img class="hover:[--green:#00ff00]" />`,
            svelte: `<img class="hover:[--green:#00ff00]" />`,
            vue: `<template><img class="hover:[--green:#00ff00]" /></template>`,

            options: [{ syntax: "shorthand" }]
          },
          {
            angular: `<img class="tw:[--green:#00ff00]" />`,
            html: `<img class="tw:[--green:#00ff00]" />`,
            jsx: `() => <img class="tw:[--green:#00ff00]" />`,
            svelte: `<img class="tw:[--green:#00ff00]" />`,
            vue: `<template><img class="tw:[--green:#00ff00]" /></template>`,

            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it("should not convert arbitrary variables in arbitrary classes", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        valid: [
          {
            angular: `<img class="[background-color:var(--secondary)]" />`,
            html: `<img class="[background-color:var(--secondary)]" />`,
            jsx: `() => <img class="[background-color:var(--secondary)]" />`,
            svelte: `<img class="[background-color:var(--secondary)]" />`,
            vue: `<template><img class="[background-color:var(--secondary)]" /></template>`,

            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

  it("should not convert if multiple variables are used in the same class", () => {
    lint(
      enforceConsistentVariableSyntax,
      {
        valid: [
          {
            angular: `<img class="object-[var(--x)_var(--y)]" />`,
            html: `<img class="object-[var(--x)_var(--y)]" />`,
            jsx: `() => <img class="object-[var(--x)_var(--y)]" />`,
            svelte: `<img class="object-[var(--x)_var(--y)]" />`,
            vue: `<template><img class="object-[var(--x)_var(--y)]" /></template>`,

            options: [{ syntax: "shorthand" }]
          }
        ]
      }
    );
  });

});
