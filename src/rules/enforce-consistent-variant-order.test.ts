import { describe, it } from "vitest";

import { enforceConsistentVariantOrder } from "better-tailwindcss:rules/enforce-consistent-variant-order.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version.js";


describe.runIf(getTailwindCSSVersion().major >= 4)(enforceConsistentVariantOrder.name, () => {

  it("should move global variants to the beginning", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="hover:lg:text-red-500" />`,
          angularOutput: `<img class="lg:hover:text-red-500" />`,
          astro: `<img class="hover:lg:text-red-500" />`,
          astroOutput: `<img class="lg:hover:text-red-500" />`,
          html: `<img class="hover:lg:text-red-500" />`,
          htmlOutput: `<img class="lg:hover:text-red-500" />`,
          jsx: `() => <img class="hover:lg:text-red-500" />`,
          jsxOutput: `() => <img class="lg:hover:text-red-500" />`,
          svelte: `<img class="hover:lg:text-red-500" />`,
          svelteOutput: `<img class="lg:hover:text-red-500" />`,
          vue: `<template><img class="hover:lg:text-red-500" /></template>`,
          vueOutput: `<template><img class="lg:hover:text-red-500" /></template>`,

          errors: 1
        },
        {
          angular: `<img class="focus:hover:lg:text-red-500" />`,
          angularOutput: `<img class="lg:focus:hover:text-red-500" />`,
          astro: `<img class="focus:hover:lg:text-red-500" />`,
          astroOutput: `<img class="lg:focus:hover:text-red-500" />`,
          html: `<img class="focus:hover:lg:text-red-500" />`,
          htmlOutput: `<img class="lg:focus:hover:text-red-500" />`,
          jsx: `() => <img class="focus:hover:lg:text-red-500" />`,
          jsxOutput: `() => <img class="lg:focus:hover:text-red-500" />`,
          svelte: `<img class="focus:hover:lg:text-red-500" />`,
          svelteOutput: `<img class="lg:focus:hover:text-red-500" />`,
          vue: `<template><img class="focus:hover:lg:text-red-500" /></template>`,
          vueOutput: `<template><img class="lg:focus:hover:text-red-500" /></template>`,

          errors: 1
        },
        {
          angular: `<img class="hover:lg:dark:text-red-500" />`,
          angularOutput: `<img class="dark:lg:hover:text-red-500" />`,
          astro: `<img class="hover:lg:dark:text-red-500" />`,
          astroOutput: `<img class="dark:lg:hover:text-red-500" />`,
          html: `<img class="hover:lg:dark:text-red-500" />`,
          htmlOutput: `<img class="dark:lg:hover:text-red-500" />`,
          jsx: `() => <img class="hover:lg:dark:text-red-500" />`,
          jsxOutput: `() => <img class="dark:lg:hover:text-red-500" />`,
          svelte: `<img class="hover:lg:dark:text-red-500" />`,
          svelteOutput: `<img class="dark:lg:hover:text-red-500" />`,
          vue: `<template><img class="hover:lg:dark:text-red-500" /></template>`,
          vueOutput: `<template><img class="dark:lg:hover:text-red-500" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should treat media and feature-query variants as global", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="hover:print:text-red-500" />`,
          angularOutput: `<img class="print:hover:text-red-500" />`,
          astro: `<img class="hover:print:text-red-500" />`,
          astroOutput: `<img class="print:hover:text-red-500" />`,
          html: `<img class="hover:print:text-red-500" />`,
          htmlOutput: `<img class="print:hover:text-red-500" />`,
          jsx: `() => <img class="hover:print:text-red-500" />`,
          jsxOutput: `() => <img class="print:hover:text-red-500" />`,
          svelte: `<img class="hover:print:text-red-500" />`,
          svelteOutput: `<img class="print:hover:text-red-500" />`,
          vue: `<template><img class="hover:print:text-red-500" /></template>`,
          vueOutput: `<template><img class="print:hover:text-red-500" /></template>`,

          errors: 1
        },
        {
          angular: `<img class="hover:motion-reduce:text-red-500" />`,
          angularOutput: `<img class="motion-reduce:hover:text-red-500" />`,
          astro: `<img class="hover:motion-reduce:text-red-500" />`,
          astroOutput: `<img class="motion-reduce:hover:text-red-500" />`,
          html: `<img class="hover:motion-reduce:text-red-500" />`,
          htmlOutput: `<img class="motion-reduce:hover:text-red-500" />`,
          jsx: `() => <img class="hover:motion-reduce:text-red-500" />`,
          jsxOutput: `() => <img class="motion-reduce:hover:text-red-500" />`,
          svelte: `<img class="hover:motion-reduce:text-red-500" />`,
          svelteOutput: `<img class="motion-reduce:hover:text-red-500" />`,
          vue: `<template><img class="hover:motion-reduce:text-red-500" /></template>`,
          vueOutput: `<template><img class="motion-reduce:hover:text-red-500" /></template>`,

          errors: 1
        },
        {
          angular: `<img class="hover:forced-colors:text-red-500" />`,
          angularOutput: `<img class="forced-colors:hover:text-red-500" />`,
          astro: `<img class="hover:forced-colors:text-red-500" />`,
          astroOutput: `<img class="forced-colors:hover:text-red-500" />`,
          html: `<img class="hover:forced-colors:text-red-500" />`,
          htmlOutput: `<img class="forced-colors:hover:text-red-500" />`,
          jsx: `() => <img class="hover:forced-colors:text-red-500" />`,
          jsxOutput: `() => <img class="forced-colors:hover:text-red-500" />`,
          svelte: `<img class="hover:forced-colors:text-red-500" />`,
          svelteOutput: `<img class="forced-colors:hover:text-red-500" />`,
          vue: `<template><img class="hover:forced-colors:text-red-500" /></template>`,
          vueOutput: `<template><img class="forced-colors:hover:text-red-500" /></template>`,

          errors: 1
        }
      ],
      valid: [
        {
          angular: `<img class="print:hover:text-red-500" />`,
          astro: `<img class="print:hover:text-red-500" />`,
          html: `<img class="print:hover:text-red-500" />`,
          jsx: `() => <img class="print:hover:text-red-500" />`,
          svelte: `<img class="print:hover:text-red-500" />`,
          vue: `<template><img class="print:hover:text-red-500" /></template>`
        },
        {
          angular: `<img class="motion-reduce:hover:text-red-500" />`,
          astro: `<img class="motion-reduce:hover:text-red-500" />`,
          html: `<img class="motion-reduce:hover:text-red-500" />`,
          jsx: `() => <img class="motion-reduce:hover:text-red-500" />`,
          svelte: `<img class="motion-reduce:hover:text-red-500" />`,
          vue: `<template><img class="motion-reduce:hover:text-red-500" /></template>`
        },
        {
          angular: `<img class="forced-colors:hover:text-red-500" />`,
          astro: `<img class="forced-colors:hover:text-red-500" />`,
          html: `<img class="forced-colors:hover:text-red-500" />`,
          jsx: `() => <img class="forced-colors:hover:text-red-500" />`,
          svelte: `<img class="forced-colors:hover:text-red-500" />`,
          vue: `<template><img class="forced-colors:hover:text-red-500" /></template>`
        }
      ]
    });
  });

  it("should support sorting around arbitrary variants", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="[&.is-dragging]:lg:cursor-grabbing" />`,
          angularOutput: `<img class="lg:[&.is-dragging]:cursor-grabbing" />`,
          astro: `<img class="[&.is-dragging]:lg:cursor-grabbing" />`,
          astroOutput: `<img class="lg:[&.is-dragging]:cursor-grabbing" />`,
          html: `<img class="[&.is-dragging]:lg:cursor-grabbing" />`,
          htmlOutput: `<img class="lg:[&.is-dragging]:cursor-grabbing" />`,
          jsx: `() => <img class="[&.is-dragging]:lg:cursor-grabbing" />`,
          jsxOutput: `() => <img class="lg:[&.is-dragging]:cursor-grabbing" />`,
          svelte: `<img class="[&.is-dragging]:lg:cursor-grabbing" />`,
          svelteOutput: `<img class="lg:[&.is-dragging]:cursor-grabbing" />`,
          vue: `<template><img class="[&.is-dragging]:lg:cursor-grabbing" /></template>`,
          vueOutput: `<template><img class="lg:[&.is-dragging]:cursor-grabbing" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should preserve modifiers when sorting variants", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="group-hover/name:lg:text-red-500" />`,
          angularOutput: `<img class="lg:group-hover/name:text-red-500" />`,
          astro: `<img class="group-hover/name:lg:text-red-500" />`,
          astroOutput: `<img class="lg:group-hover/name:text-red-500" />`,
          html: `<img class="group-hover/name:lg:text-red-500" />`,
          htmlOutput: `<img class="lg:group-hover/name:text-red-500" />`,
          jsx: `() => <img class="group-hover/name:lg:text-red-500" />`,
          jsxOutput: `() => <img class="lg:group-hover/name:text-red-500" />`,
          svelte: `<img class="group-hover/name:lg:text-red-500" />`,
          svelteOutput: `<img class="lg:group-hover/name:text-red-500" />`,
          vue: `<template><img class="group-hover/name:lg:text-red-500" /></template>`,
          vueOutput: `<template><img class="lg:group-hover/name:text-red-500" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should treat child selector variants as non-global", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="*:lg:text-red-500" />`,
          angularOutput: `<img class="lg:*:text-red-500" />`,
          astro: `<img class="*:lg:text-red-500" />`,
          astroOutput: `<img class="lg:*:text-red-500" />`,
          html: `<img class="*:lg:text-red-500" />`,
          htmlOutput: `<img class="lg:*:text-red-500" />`,
          jsx: `() => <img class="*:lg:text-red-500" />`,
          jsxOutput: `() => <img class="lg:*:text-red-500" />`,
          svelte: `<img class="*:lg:text-red-500" />`,
          svelteOutput: `<img class="lg:*:text-red-500" />`,
          vue: `<template><img class="*:lg:text-red-500" /></template>`,
          vueOutput: `<template><img class="lg:*:text-red-500" /></template>`,

          errors: 1
        },
        {
          angular: `<img class="**:lg:text-red-500" />`,
          angularOutput: `<img class="lg:**:text-red-500" />`,
          astro: `<img class="**:lg:text-red-500" />`,
          astroOutput: `<img class="lg:**:text-red-500" />`,
          html: `<img class="**:lg:text-red-500" />`,
          htmlOutput: `<img class="lg:**:text-red-500" />`,
          jsx: `() => <img class="**:lg:text-red-500" />`,
          jsxOutput: `() => <img class="lg:**:text-red-500" />`,
          svelte: `<img class="**:lg:text-red-500" />`,
          svelteOutput: `<img class="lg:**:text-red-500" />`,
          vue: `<template><img class="**:lg:text-red-500" /></template>`,
          vueOutput: `<template><img class="lg:**:text-red-500" /></template>`,

          errors: 1
        },
        {
          angular: `<img class="*:**:lg:text-red-500" />`,
          angularOutput: `<img class="lg:*:**:text-red-500" />`,
          astro: `<img class="*:**:lg:text-red-500" />`,
          astroOutput: `<img class="lg:*:**:text-red-500" />`,
          html: `<img class="*:**:lg:text-red-500" />`,
          htmlOutput: `<img class="lg:*:**:text-red-500" />`,
          jsx: `() => <img class="*:**:lg:text-red-500" />`,
          jsxOutput: `() => <img class="lg:*:**:text-red-500" />`,
          svelte: `<img class="*:**:lg:text-red-500" />`,
          svelteOutput: `<img class="lg:*:**:text-red-500" />`,
          vue: `<template><img class="*:**:lg:text-red-500" /></template>`,
          vueOutput: `<template><img class="lg:*:**:text-red-500" /></template>`,

          errors: 1
        }
      ],
      valid: [
        {
          angular: `<img class="*:hover:text-red-500" />`,
          astro: `<img class="*:hover:text-red-500" />`,
          html: `<img class="*:hover:text-red-500" />`,
          jsx: `() => <img class="*:hover:text-red-500" />`,
          svelte: `<img class="*:hover:text-red-500" />`,
          vue: `<template><img class="*:hover:text-red-500" /></template>`
        },
        {
          angular: `<img class="hover:*:text-red-500" />`,
          astro: `<img class="hover:*:text-red-500" />`,
          html: `<img class="hover:*:text-red-500" />`,
          jsx: `() => <img class="hover:*:text-red-500" />`,
          svelte: `<img class="hover:*:text-red-500" />`,
          vue: `<template><img class="hover:*:text-red-500" /></template>`
        },
        {
          angular: `<img class="**:hover:text-red-500" />`,
          astro: `<img class="**:hover:text-red-500" />`,
          html: `<img class="**:hover:text-red-500" />`,
          jsx: `() => <img class="**:hover:text-red-500" />`,
          svelte: `<img class="**:hover:text-red-500" />`,
          vue: `<template><img class="**:hover:text-red-500" /></template>`
        },
        {
          angular: `<img class="hover:**:text-red-500" />`,
          astro: `<img class="hover:**:text-red-500" />`,
          html: `<img class="hover:**:text-red-500" />`,
          jsx: `() => <img class="hover:**:text-red-500" />`,
          svelte: `<img class="hover:**:text-red-500" />`,
          vue: `<template><img class="hover:**:text-red-500" /></template>`
        }
      ]
    });
  });

  it("should support custom breakpoints", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="hover:desktop:text-white" />`,
          angularOutput: `<img class="desktop:hover:text-white" />`,
          astro: `<img class="hover:desktop:text-white" />`,
          astroOutput: `<img class="desktop:hover:text-white" />`,
          html: `<img class="hover:desktop:text-white" />`,
          htmlOutput: `<img class="desktop:hover:text-white" />`,
          jsx: `() => <img class="hover:desktop:text-white" />`,
          jsxOutput: `() => <img class="desktop:hover:text-white" />`,
          svelte: `<img class="hover:desktop:text-white" />`,
          svelteOutput: `<img class="desktop:hover:text-white" />`,
          vue: `<template><img class="hover:desktop:text-white" /></template>`,
          vueOutput: `<template><img class="desktop:hover:text-white" /></template>`,

          errors: 1,

          files: {
            "styles.css": `
              @import "tailwindcss";

              @theme {
                --breakpoint-desktop: 80rem;
              }
            `
          },

          options: [{ entryPoint: "styles.css" }]
        }
      ]
    });
  });

  it("should ignore unknown variants", () => {
    lint(enforceConsistentVariantOrder, {
      valid: [
        {
          angular: `<img class="hover:unknown-variant:text-red-500" />`,
          astro: `<img class="hover:unknown-variant:text-red-500" />`,
          html: `<img class="hover:unknown-variant:text-red-500" />`,
          jsx: `() => <img class="hover:unknown-variant:text-red-500" />`,
          svelte: `<img class="hover:unknown-variant:text-red-500" />`,
          vue: `<template><img class="hover:unknown-variant:text-red-500" /></template>`
        },
        {
          angular: `<img class="unknown-variant:hover:text-red-500" />`,
          astro: `<img class="unknown-variant:hover:text-red-500" />`,
          html: `<img class="unknown-variant:hover:text-red-500" />`,
          jsx: `() => <img class="unknown-variant:hover:text-red-500" />`,
          svelte: `<img class="unknown-variant:hover:text-red-500" />`,
          vue: `<template><img class="unknown-variant:hover:text-red-500" /></template>`
        }
      ]
    });
  });
});

describe.runIf(getTailwindCSSVersion().major <= 3)(enforceConsistentVariantOrder.name, () => {

  it("should not report anything in Tailwind CSS v3", () => {
    lint(enforceConsistentVariantOrder, {
      valid: [
        {
          angular: `<img class="hover:lg:text-red-500" />`,
          astro: `<img class="hover:lg:text-red-500" />`,
          html: `<img class="hover:lg:text-red-500" />`,
          jsx: `() => <img class="hover:lg:text-red-500" />`,
          svelte: `<img class="hover:lg:text-red-500" />`,
          vue: `<template><img class="hover:lg:text-red-500" /></template>`
        }
      ]
    });
  });
});
