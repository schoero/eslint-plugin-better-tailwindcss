import { describe, it } from "vitest";

import { enforceConsistentVariantOrder } from "better-tailwindcss:rules/enforce-consistent-variant-order.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version.js";


describe.runIf(getTailwindCSSVersion().major >= 4)(enforceConsistentVariantOrder.name, () => {

  it("should enforce Tailwind's variant order", () => {
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
          angular: `<img class="hover:focus:text-red-500" />`,
          angularOutput: `<img class="focus:hover:text-red-500" />`,
          astro: `<img class="hover:focus:text-red-500" />`,
          astroOutput: `<img class="focus:hover:text-red-500" />`,
          html: `<img class="hover:focus:text-red-500" />`,
          htmlOutput: `<img class="focus:hover:text-red-500" />`,
          jsx: `() => <img class="hover:focus:text-red-500" />`,
          jsxOutput: `() => <img class="focus:hover:text-red-500" />`,
          svelte: `<img class="hover:focus:text-red-500" />`,
          svelteOutput: `<img class="focus:hover:text-red-500" />`,
          vue: `<template><img class="hover:focus:text-red-500" /></template>`,
          vueOutput: `<template><img class="focus:hover:text-red-500" /></template>`,

          errors: 1
        }
      ],
      valid: [
        {
          angular: `<img class="lg:hover:text-red-500" />`,
          astro: `<img class="lg:hover:text-red-500" />`,
          html: `<img class="lg:hover:text-red-500" />`,
          jsx: `() => <img class="lg:hover:text-red-500" />`,
          svelte: `<img class="lg:hover:text-red-500" />`,
          vue: `<template><img class="lg:hover:text-red-500" /></template>`
        },
        {
          angular: `<img class="focus:hover:text-red-500" />`,
          astro: `<img class="focus:hover:text-red-500" />`,
          html: `<img class="focus:hover:text-red-500" />`,
          jsx: `() => <img class="focus:hover:text-red-500" />`,
          svelte: `<img class="focus:hover:text-red-500" />`,
          vue: `<template><img class="focus:hover:text-red-500" /></template>`
        },
        {
          angular: `<img class="text-red-500" />`,
          astro: `<img class="text-red-500" />`,
          html: `<img class="text-red-500" />`,
          jsx: `() => <img class="text-red-500" />`,
          svelte: `<img class="text-red-500" />`,
          vue: `<template><img class="text-red-500" /></template>`
        }
      ]
    });
  });

  it("should support arbitrary variants", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="active:[&.is-dragging]:cursor-grabbing" />`,
          angularOutput: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          astro: `<img class="active:[&.is-dragging]:cursor-grabbing" />`,
          astroOutput: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          html: `<img class="active:[&.is-dragging]:cursor-grabbing" />`,
          htmlOutput: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          jsx: `() => <img class="active:[&.is-dragging]:cursor-grabbing" />`,
          jsxOutput: `() => <img class="[&.is-dragging]:active:cursor-grabbing" />`,
          svelte: `<img class="active:[&.is-dragging]:cursor-grabbing" />`,
          svelteOutput: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          vue: `<template><img class="active:[&.is-dragging]:cursor-grabbing" /></template>`,
          vueOutput: `<template><img class="[&.is-dragging]:active:cursor-grabbing" /></template>`,

          errors: 1
        }
      ],
      valid: [
        {
          angular: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          astro: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          html: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          jsx: `() => <img class="[&.is-dragging]:active:cursor-grabbing" />`,
          svelte: `<img class="[&.is-dragging]:active:cursor-grabbing" />`,
          vue: `<template><img class="[&.is-dragging]:active:cursor-grabbing" /></template>`
        }
      ]
    });
  });

  it("should support compound variants", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="group-[&:focus]:hover:text-red-500" />`,
          angularOutput: `<img class="hover:group-[&:focus]:text-red-500" />`,
          astro: `<img class="group-[&:focus]:hover:text-red-500" />`,
          astroOutput: `<img class="hover:group-[&:focus]:text-red-500" />`,
          html: `<img class="group-[&:focus]:hover:text-red-500" />`,
          htmlOutput: `<img class="hover:group-[&:focus]:text-red-500" />`,
          jsx: `() => <img class="group-[&:focus]:hover:text-red-500" />`,
          jsxOutput: `() => <img class="hover:group-[&:focus]:text-red-500" />`,
          svelte: `<img class="group-[&:focus]:hover:text-red-500" />`,
          svelteOutput: `<img class="hover:group-[&:focus]:text-red-500" />`,
          vue: `<template><img class="group-[&:focus]:hover:text-red-500" /></template>`,
          vueOutput: `<template><img class="hover:group-[&:focus]:text-red-500" /></template>`,

          errors: 1
        }
      ],
      valid: [
        {
          angular: `<img class="hover:group-[&:focus]:text-red-500" />`,
          astro: `<img class="hover:group-[&:focus]:text-red-500" />`,
          html: `<img class="hover:group-[&:focus]:text-red-500" />`,
          jsx: `() => <img class="hover:group-[&:focus]:text-red-500" />`,
          svelte: `<img class="hover:group-[&:focus]:text-red-500" />`,
          vue: `<template><img class="hover:group-[&:focus]:text-red-500" /></template>`
        }
      ]
    });
  });

  it("should support custom variants", () => {
    lint(enforceConsistentVariantOrder, {
      invalid: [
        {
          angular: `<img class="hover:theme-midnight:text-white" />`,
          angularOutput: `<img class="theme-midnight:hover:text-white" />`,
          astro: `<img class="hover:theme-midnight:text-white" />`,
          astroOutput: `<img class="theme-midnight:hover:text-white" />`,
          html: `<img class="hover:theme-midnight:text-white" />`,
          htmlOutput: `<img class="theme-midnight:hover:text-white" />`,
          jsx: `() => <img class="hover:theme-midnight:text-white" />`,
          jsxOutput: `() => <img class="theme-midnight:hover:text-white" />`,
          svelte: `<img class="hover:theme-midnight:text-white" />`,
          svelteOutput: `<img class="theme-midnight:hover:text-white" />`,
          vue: `<template><img class="hover:theme-midnight:text-white" /></template>`,
          vueOutput: `<template><img class="theme-midnight:hover:text-white" /></template>`,

          errors: 1,

          files: {
            "styles.css": `
              @import "tailwindcss";
              @custom-variant theme-midnight (&:where([data-theme="midnight"] *));
            `
          },
          options: [{ entryPoint: "styles.css" }]
        }
      ],
      valid: [
        {
          angular: `<img class="theme-midnight:hover:text-white" />`,
          astro: `<img class="theme-midnight:hover:text-white" />`,
          html: `<img class="theme-midnight:hover:text-white" />`,
          jsx: `() => <img class="theme-midnight:hover:text-white" />`,
          svelte: `<img class="theme-midnight:hover:text-white" />`,
          vue: `<template><img class="theme-midnight:hover:text-white" /></template>`,

          files: {
            "styles.css": `
              @import "tailwindcss";
              @custom-variant theme-midnight (&:where([data-theme="midnight"] *));
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
