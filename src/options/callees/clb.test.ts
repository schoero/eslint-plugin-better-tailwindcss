import { describe, it } from "vitest";

import {
  CLB_BASE_VALUES,
  CLB_COMPOUND_VARIANTS_CLASSES,
  CLB_VARIANT_VALUES
} from "better-tailwindcss:options/callees/clb.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe("clb", () => {

  it("should lint object values inside the `base` property", () => {

    const dirty = `
      clb({
          base: " lint ",
          " ignore ": " ignore "
        }
      )
    `;
    const clean = `
      clb({
          base: "lint",
          " ignore ": " ignore "
        }
      )
    `;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 2,
          options: [{ callees: [CLB_BASE_VALUES] }]
        }
      ]
    });

  });

  it("should lint object values inside the `variants` property", () => {

    const dirty = `
      clb({
          variants: { " ignore ": " lint " },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;
    const clean = `
      clb({
          variants: { " ignore ": "lint" },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 2,
          options: [{ callees: [CLB_VARIANT_VALUES] }]
        }
      ]
    });

  });

  it("should lint only object values inside the `compoundVariants.classes` property", () => {

    const dirty = `
      clb({
          variants: { " ignore ": " ignore " },
          compoundVariants: [{ 
            " ignore ": " ignore ",
            "classes": " lint "
          }]
        }
      )
    `;
    const clean = `
      clb({
          variants: { " ignore ": " ignore " },
          compoundVariants: [{ 
            " ignore ": " ignore ",
            "classes": "lint"
          }]
        }
      )
    `;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 2,
          options: [{ callees: [CLB_COMPOUND_VARIANTS_CLASSES] }]
        }
      ]
    });

  });

  it("should lint all `clb` variations in combination by default", () => {
    const dirty = `
      clb({
        base: " lint ",
        compoundVariants: [
          {
            " ignore ": " ignore ",
            "classes": " lint "
          }
        ],
        defaultVariants: {
          " ignore ": " ignore "
        },
        variants: {
          " ignore ": {
            " ignore array ": [
              " lint ",
              " lint "
            ],
            " ignore string ": " lint "
          }
        }
      });
    `;

    const clean = `
      clb({
        base: "lint",
        compoundVariants: [
          {
            " ignore ": " ignore ",
            "classes": "lint"
          }
        ],
        defaultVariants: {
          " ignore ": " ignore "
        },
        variants: {
          " ignore ": {
            " ignore array ": [
              "lint",
              "lint"
            ],
            " ignore string ": "lint"
          }
        }
      });
    `;

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 10
        }
      ]
    });

  });

});
