import { describe, it } from "vitest";

import {
  TV_BASE_VALUES,
  TV_COMPOUND_SLOTS_CLASS,
  TV_COMPOUND_VARIANTS_CLASS,
  TV_SLOTS_VALUES,
  TV_STRINGS,
  TV_VARIANT_VALUES
} from "better-tailwindcss:options/callees/tv.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";


describe("tv", () => {

  it("should lint strings in arrays", () => {

    const dirty = `tv(" lint ", [" lint ", " lint "])`;
    const clean = `tv("lint", ["lint", "lint"])`;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 6,
          options: [{ callees: [TV_STRINGS] }]
        }
      ]
    });

  });

  it("should lint object values inside the `variants` property", () => {

    const dirty = `
      tv(" ignore ", {
          variants: { " ignore ": " lint " },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          variants: { " ignore ": "lint" },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 2,
          options: [{ callees: [TV_VARIANT_VALUES] }]
        }
      ]
    });
  });

  it("should lint only object values inside the `compoundVariants.class` and `compoundVariants.className` property", () => {

    const dirty = `
      tv(" ignore ", {
          variants: { " ignore ": " ignore " },
          compoundVariants: [{ 
            " ignore ": " ignore ",
            "class": " lint ",
            "className": " lint "
          }]
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          variants: { " ignore ": " ignore " },
          compoundVariants: [{ 
            " ignore ": " ignore ",
            "class": "lint",
            "className": "lint"
          }]
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 4,
          options: [{ callees: [TV_COMPOUND_VARIANTS_CLASS] }]
        }
      ]
    });

  });

  it("should lint all `tv` variations in combination by default", () => {
    const dirty = `
      tv([" lint ", " lint "], " lint ", {
        base: " lint ",
        slots: {
          " ignore ": " lint "
        },
        compoundVariants: [
          {
            " ignore ": " ignore ",
            "class": " lint "
          }
        ],
        compoundSlots: [
          {
            slots: [" ignore ", " ignore "],
            " ignore ": " ignore ",
            "class": " lint "
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
      tv(["lint", "lint"], "lint", {
        base: "lint",
        slots: {
          " ignore ": "lint"
        },
        compoundVariants: [
          {
            " ignore ": " ignore ",
            "class": "lint"
          }
        ],
        compoundSlots: [
          {
            slots: [" ignore ", " ignore "],
            " ignore ": " ignore ",
            "class": "lint"
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

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 20
        }
      ]
    });

  });

  it("should lint object values inside the `base` property", () => {

    const dirty = `
      tv(" ignore ", {
          base: " lint ",
          variants: { " ignore ": " ignore " },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          base: "lint",
          variants: { " ignore ": " ignore " },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 2,
          options: [{ callees: [TV_BASE_VALUES] }]
        }
      ]
    });
  });

  it("should lint object values inside the `slots` property", () => {

    const dirty = `
      tv(" ignore ", {
          slots: { 
            slotName: " lint ",
            anotherSlot: [" lint ", " lint "]
          },
          variants: { " ignore ": " ignore " }
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          slots: { 
            slotName: "lint",
            anotherSlot: ["lint", "lint"]
          },
          variants: { " ignore ": " ignore " }
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 6,
          options: [{ callees: [TV_SLOTS_VALUES] }]
        }
      ]
    });
  });

  it("should lint only object values inside the `compoundSlots.class` and `compoundSlots.className` property", () => {

    const dirty = `
      tv(" ignore ", {
          slots: { " ignore ": " ignore " },
          compoundSlots: [{ 
            slots: [" ignore ", " ignore "],
            " ignore ": " ignore ",
            "class": " lint ",
            "className": " lint "
          }]
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          slots: { " ignore ": " ignore " },
          compoundSlots: [{ 
            slots: [" ignore ", " ignore "],
            " ignore ": " ignore ",
            "class": "lint",
            "className": "lint"
          }]
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 4,
          options: [{ callees: [TV_COMPOUND_SLOTS_CLASS] }]
        }
      ]
    });

  });


  it("should lint string arrays inside the `compoundVariants.class` and `compoundVariants.className` property", () => {

    const dirty = `
      tv(" ignore ", {
          slots: { " ignore ": " ignore " },
          compoundVariants: [{ 
            " ignore ": " ignore ",
            "class": [" lint ", " lint "],
            "className": [" lint ", " lint ", " lint "]
          }]
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          slots: { " ignore ": " ignore " },
          compoundVariants: [{ 
            " ignore ": " ignore ",
            "class": ["lint", "lint"],
            "className": ["lint", "lint", "lint"]
          }]
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 10,
          options: [{ callees: [TV_COMPOUND_VARIANTS_CLASS] }]
        }
      ]
    });

  });

  it("should lint string arrays inside the `compoundSlots.class` and `compoundSlots.className` property", () => {

    const dirty = `
      tv(" ignore ", {
          slots: { " ignore ": " ignore " },
          compoundSlots: [{ 
            slots: [" ignore ", " ignore "],
            " ignore ": " ignore ",
            "class": [" lint ", " lint "],
            "className": [" lint ", " lint ", " lint "]
          }]
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          slots: { " ignore ": " ignore " },
          compoundSlots: [{ 
            slots: [" ignore ", " ignore "],
            " ignore ": " ignore ",
            "class": ["lint", "lint"],
            "className": ["lint", "lint", "lint"]
          }]
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 10,
          options: [{ callees: [TV_COMPOUND_SLOTS_CLASS] }]
        }
      ]
    });

  });

  it("should lint string arrays inside the `base` property", () => {

    const dirty = `
      tv(" ignore ", {
          base: [" lint ", " lint ", " lint "],
          variants: { " ignore ": " ignore " },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;
    const clean = `
      tv(" ignore ", {
          base: ["lint", "lint", "lint"],
          variants: { " ignore ": " ignore " },
          compoundVariants: { " ignore ": " ignore " }
        }
      )
    `;

    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      invalid: [
        {
          jsx: dirty,
          jsxOutput: clean,
          svelte: `<script>${dirty}</script>`,
          svelteOutput: `<script>${clean}</script>`,
          vue: `<script>${dirty}</script>`,
          vueOutput: `<script>${clean}</script>`,

          errors: 6,
          options: [{ callees: [TV_BASE_VALUES] }]
        }
      ]
    });

  });

});
