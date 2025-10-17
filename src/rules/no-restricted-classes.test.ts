import { describe, it } from "vitest";

import { noRestrictedClasses } from "better-tailwindcss:rules/no-restricted-classes.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { dedent } from "better-tailwindcss:tests/utils/template.js";


describe(noRestrictedClasses.name, () => {

  it("should not report on unrestricted classes", () => {
    lint(noRestrictedClasses, {
      valid: [
        {
          angular: `<img class="font-bold container text-lg" />`,
          html: `<img class="font-bold container text-lg" />`,
          jsx: `() => <img class="font-bold container text-lg" />`,
          svelte: `<img class="font-bold container text-lg" />`,
          vue: `<template><img class="font-bold container text-lg" /></template>`
        }
      ]
    });
  });

  it("should report restricted classes", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold container text-lg" />`,
          html: `<img class="font-bold container text-lg" />`,
          jsx: `() => <img class="font-bold container text-lg" />`,
          svelte: `<img class="font-bold container text-lg" />`,
          vue: `<template><img class="font-bold container text-lg" /></template>`,

          errors: 1,
          options: [{ restrict: ["container"] }]
        }
      ]
    });
  });

  it("should report restricted classes matching a regex", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold container text-lg" />`,
          html: `<img class="font-bold container text-lg" />`,
          jsx: `() => <img class="font-bold container text-lg" />`,
          svelte: `<img class="font-bold container text-lg" />`,
          vue: `<template><img class="font-bold container text-lg" /></template>`,

          errors: 1,
          options: [{ restrict: ["^container$"] }]
        }
      ]
    });
  });

  it("should report restricted classes with variants", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold lg:container lg:text-lg" />`,
          html: `<img class="font-bold lg:container lg:text-lg" />`,
          jsx: `() => <img class="font-bold lg:container lg:text-lg" />`,
          svelte: `<img class="font-bold lg:container lg:text-lg" />`,
          vue: `<template><img class="font-bold lg:container lg:text-lg" /></template>`,

          errors: 2,
          options: [{ restrict: ["^lg:.*"] }]
        }
      ]
    });
  });

  it("should report restricted classes containing reserved regex characters", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold *:container **:text-lg" />`,
          html: `<img class="font-bold *:container **:text-lg" />`,
          jsx: `() => <img class="font-bold *:container **:text-lg" />`,
          svelte: `<img class="font-bold *:container **:text-lg" />`,
          vue: `<template><img class="font-bold *:container **:text-lg" /></template>`,

          errors: 2,
          options: [{ restrict: ["^\\*+:.*"] }]
        }
      ]
    });
  });

  it("should be possible to disallow the important modifier", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold text-lg!" />`,
          html: `<img class="font-bold text-lg!" />`,
          jsx: `() => <img class="font-bold text-lg!" />`,
          svelte: `<img class="font-bold text-lg!" />`,
          vue: `<template><img class="font-bold text-lg!" /></template>`,

          errors: 1,
          options: [{ restrict: ["^.*!$"] }]
        }
      ]
    });
  });

  it("should be possible to provide custom error messages", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold text-green-500 text-lg" />`,
          html: `<img class="font-bold text-green-500 text-lg" />`,
          jsx: `() => <img class="font-bold text-green-500 text-lg" />`,
          svelte: `<img class="font-bold text-green-500 text-lg" />`,
          vue: `<template><img class="font-bold text-green-500 text-lg" /></template>`,

          errors: [
            { message: "Restricted class: Use '*-success' instead." }
          ],
          options: [{ restrict: [{ message: "Restricted class: Use '*-success' instead.", pattern: "^(.*)-green-(.*)$" }] }]
        }
      ]
    });
  });

  it("should be possible to use matched groups in the error messages", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold text-green-500 text-lg" />`,
          html: `<img class="font-bold text-green-500 text-lg" />`,
          jsx: `() => <img class="font-bold text-green-500 text-lg" />`,
          svelte: `<img class="font-bold text-green-500 text-lg" />`,
          vue: `<template><img class="font-bold text-green-500 text-lg" /></template>`,

          errors: [
            { message: "Restricted class: Use 'text-success' instead." }
          ],
          options: [{ restrict: [{ message: "Restricted class: Use '$1-success' instead.", pattern: "^(.*)-green-500$" }] }]
        },
        {
          angular: `<img class="font-bold bg-green-500 text-lg" />`,
          html: `<img class="font-bold bg-green-500 text-lg" />`,
          jsx: `() => <img class="font-bold bg-green-500 text-lg" />`,
          svelte: `<img class="font-bold bg-green-500 text-lg" />`,
          vue: `<template><img class="font-bold bg-green-500 text-lg" /></template>`,

          errors: [
            { message: "Restricted class: Use 'bg-success' instead." }
          ],
          options: [{ restrict: [{ message: "Restricted class: Use '$1-success' instead.", pattern: "^(.*)-green-500$" }] }]
        }
      ]
    });
  });

  it("should fix the classes when a fix is provided", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold bg-green-500 text-green-500 text-lg" />`,
          angularOutput: `<img class="font-bold bg-success text-success text-lg" />`,
          html: `<img class="font-bold bg-green-500 text-green-500 text-lg" />`,
          htmlOutput: `<img class="font-bold bg-success text-success text-lg" />`,
          jsx: `() => <img class="font-bold bg-green-500 text-green-500 text-lg" />`,
          jsxOutput: `() => <img class="font-bold bg-success text-success text-lg" />`,
          svelte: `<img class="font-bold bg-green-500 text-green-500 text-lg" />`,
          svelteOutput: `<img class="font-bold bg-success text-success text-lg" />`,
          vue: `<template><img class="font-bold bg-green-500 text-green-500 text-lg" /></template>`,
          vueOutput: `<template><img class="font-bold bg-success text-success text-lg" /></template>`,

          errors: [
            { message: "Restricted class: Use 'bg-success' instead." },
            { message: "Restricted class: Use 'text-success' instead." }
          ],
          options: [{
            restrict: [{
              fix: "$1-success",
              message: "Restricted class: Use '$1-success' instead.",
              pattern: "^(text|bg)-green-500$"
            }]
          }]
        }
      ]
    });
  });

  it("should fix only the class name when a variant is used", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold lg:text-green-500 text-lg" />`,
          angularOutput: `<img class="font-bold lg:text-success text-lg" />`,
          html: `<img class="font-bold lg:text-green-500 text-lg" />`,
          htmlOutput: `<img class="font-bold lg:text-success text-lg" />`,
          jsx: `() => <img class="font-bold lg:text-green-500 text-lg" />`,
          jsxOutput: `() => <img class="font-bold lg:text-success text-lg" />`,
          svelte: `<img class="font-bold lg:text-green-500 text-lg" />`,
          svelteOutput: `<img class="font-bold lg:text-success text-lg" />`,
          vue: `<template><img class="font-bold lg:text-green-500 text-lg" /></template>`,
          vueOutput: `<template><img class="font-bold lg:text-success text-lg" /></template>`,

          errors: [
            { message: "Restricted class: Use 'lg:text-success' instead." }
          ],
          options: [{
            restrict: [{
              fix: "$1$2-success",
              message: "Restricted class: Use '$1$2-success' instead.",
              pattern: "^([a-zA-Z0-9:/_-]*:)?(text|bg)-green-500$"
            }]
          }]
        }
      ]
    });
  });

  it("should fix classes with multiple variants", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold lg:hover:text-green-500 text-lg" />`,
          angularOutput: `<img class="font-bold lg:hover:text-success text-lg" />`,
          html: `<img class="font-bold lg:hover:text-green-500 text-lg" />`,
          htmlOutput: `<img class="font-bold lg:hover:text-success text-lg" />`,
          jsx: `() => <img class="font-bold lg:hover:text-green-500 text-lg" />`,
          jsxOutput: `() => <img class="font-bold lg:hover:text-success text-lg" />`,
          svelte: `<img class="font-bold lg:hover:text-green-500 text-lg" />`,
          svelteOutput: `<img class="font-bold lg:hover:text-success text-lg" />`,
          vue: `<template><img class="font-bold lg:hover:text-green-500 text-lg" /></template>`,
          vueOutput: `<template><img class="font-bold lg:hover:text-success text-lg" /></template>`,

          errors: [
            { message: "Restricted class: Use 'lg:hover:text-success' instead." }
          ],
          options: [{
            restrict: [{
              fix: "$1$2-success",
              message: "Restricted class: Use '$1$2-success' instead.",
              pattern: "^([a-zA-Z0-9:/_-]*:)?(text|bg)-green-500$"
            }]
          }]
        }
      ]
    });
  });

  it("should match modifiers", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold lg:hover:text-green-500/50 text-lg" />`,
          angularOutput: `<img class="font-bold lg:hover:text-success/50 text-lg" />`,
          html: `<img class="font-bold lg:hover:text-green-500/50 text-lg" />`,
          htmlOutput: `<img class="font-bold lg:hover:text-success/50 text-lg" />`,
          jsx: `() => <img class="font-bold lg:hover:text-green-500/50 text-lg" />`,
          jsxOutput: `() => <img class="font-bold lg:hover:text-success/50 text-lg" />`,
          svelte: `<img class="font-bold lg:hover:text-green-500/50 text-lg" />`,
          svelteOutput: `<img class="font-bold lg:hover:text-success/50 text-lg" />`,
          vue: `<template><img class="font-bold lg:hover:text-green-500/50 text-lg" /></template>`,
          vueOutput: `<template><img class="font-bold lg:hover:text-success/50 text-lg" /></template>`,

          errors: [
            { message: "Restricted class: Use 'lg:hover:text-success/50' instead." }
          ],
          options: [{
            restrict: [{
              fix: "$1$2-success$3",
              message: "Restricted class: Use '$1$2-success$3' instead.",
              pattern: "^([a-zA-Z0-9:/_-]*:)?(text|bg)-green-500(\\/[0-9]{1,3})?$"
            }]
          }]
        }
      ]
    });
  });

  it("should work on multiline literals", () => {
    const dirty = dedent`
      bg-green-500
      hover:text-green-500
    `;

    const clean = dedent`
      bg-success
      hover:text-success
    `;

    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="${dirty}" />`,
          angularOutput: `<img class="${clean}" />`,
          html: `<img class="${dirty}" />`,
          htmlOutput: `<img class="${clean}" />`,
          jsx: `() => <img class="${dirty}" />`,
          jsxOutput: `() => <img class="${clean}" />`,
          svelte: `<img class="${dirty}" />`,
          svelteOutput: `<img class="${clean}" />`,
          vue: `<template><img class="${dirty}" /></template>`,
          vueOutput: `<template><img class="${clean}" /></template>`,

          errors: [
            { message: "Restricted class: Use 'bg-success' instead." },
            { message: "Restricted class: Use 'hover:text-success' instead." }
          ],
          options: [{
            restrict: [{
              fix: "$1$2-success",
              message: "Restricted class: Use '$1$2-success' instead.",
              pattern: "^([a-zA-Z0-9:/_-]*:)?(text|bg)-green-500$"
            }]
          }]
        }
      ]
    });
  });

  it("should not report on classes with the same name but different variants", () => {
    lint(noRestrictedClasses, {
      valid: [
        {
          angular: `<img class="font-bold text-green-500" />`,
          html: `<img class="font-bold text-green-500" />`,
          jsx: `() => <img class="font-bold text-green-500" />`,
          svelte: `<img class="font-bold text-green-500" />`,
          vue: `<template><img class="font-bold text-green-500" /></template>`,

          options: [{
            restrict: [{
              message: "Restricted class: Use 'hover:text-success' instead.",
              pattern: "^hover:text-green-500$"
            }]
          }]
        }
      ]
    });
  });

  it("should be possible to remove classes with a fix", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="font-bold text-green-500" />`,
          angularOutput: `<img class="font-bold " />`,
          html: `<img class="font-bold text-green-500" />`,
          htmlOutput: `<img class="font-bold " />`,
          jsx: `() => <img class="font-bold text-green-500" />`,
          jsxOutput: `() => <img class="font-bold " />`,
          svelte: `<img class="font-bold text-green-500" />`,
          svelteOutput: `<img class="font-bold " />`,
          vue: `<template><img class="font-bold text-green-500" /></template>`,
          vueOutput: `<template><img class="font-bold " /></template>`,

          errors: [
            { message: "Restricted class: text-green-500 is not allowed." }
          ],
          options: [{
            restrict: [{
              fix: "",
              message: "Restricted class: text-green-500 is not allowed.",
              pattern: "^text-green-500$"
            }]
          }]
        }
      ]
    });
  });

  it("should work with mixed string and object restrictions", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="text-green-500 bg-red-500" />`,
          angularOutput: `<img class="text-success bg-red-500" />`,
          html: `<img class="text-green-500 bg-red-500" />`,
          htmlOutput: `<img class="text-success bg-red-500" />`,
          jsx: `() => <img class="text-green-500 bg-red-500" />`,
          jsxOutput: `() => <img class="text-success bg-red-500" />`,
          svelte: `<img class="text-green-500 bg-red-500" />`,
          svelteOutput: `<img class="text-success bg-red-500" />`,
          vue: `<template><img class="text-green-500 bg-red-500" /></template>`,
          vueOutput: `<template><img class="text-success bg-red-500" /></template>`,

          errors: [
            { message: "Custom message for green" },
            { message: "Restricted class: \"bg-red-500\"." }
          ],
          options: [{
            restrict: [
              { fix: "text-success", message: "Custom message for green", pattern: "^text-green-500$" },
              "^bg-red-500$"
            ]
          }]
        }
      ]
    });
  });

  it("should fallback to empty string for invalid capture groups in messages", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="text-green-500" />`,
          html: `<img class="text-green-500" />`,
          jsx: `() => <img class="text-green-500" />`,
          svelte: `<img class="text-green-500" />`,
          vue: `<template><img class="text-green-500" /></template>`,

          errors: [
            { message: "Restricted class: Use '' instead of 'text-green-500'." }
          ],
          options: [{
            restrict: [{
              message: "Restricted class: Use '$10' instead of '$1'.",
              pattern: "^(text-green-500)$"
            }]
          }]
        }
      ]
    });
  });

  it("should fallback to empty string for invalid capture groups in fixes", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="text-green-500" />`,
          angularOutput: `<img class="" />`,
          html: `<img class="text-green-500" />`,
          htmlOutput: `<img class="" />`,
          jsx: `() => <img class="text-green-500" />`,
          jsxOutput: `() => <img class="" />`,
          svelte: `<img class="text-green-500" />`,
          svelteOutput: `<img class="" />`,
          vue: `<template><img class="text-green-500" /></template>`,
          vueOutput: `<template><img class="" /></template>`,

          errors: [
            { message: "Restricted class: \"text-green-500\"." }
          ],
          options: [{
            restrict: [{
              fix: "$10",
              pattern: "^(text-green-500)$"
            }]
          }]
        }
      ]
    });
  });

  it("should report the first matching restrictions", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="text-green-500" />`,
          html: `<img class="text-green-500" />`,
          jsx: `() => <img class="text-green-500" />`,
          svelte: `<img class="text-green-500" />`,
          vue: `<template><img class="text-green-500" /></template>`,

          errors: [
            { message: "Restricted class: Use 'text-success' instead." }
          ],
          options: [{
            restrict: [
              { message: "Restricted class: Use 'text-success' instead.", pattern: "^text-green-500$" },
              { message: "Match any green color class", pattern: ".*green.*" },
              "^text-green-500$"
            ]
          }]
        }
      ]
    });
  });

  it("should work with restriction objects without fix and message", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="text-green-500" />`,
          html: `<img class="text-green-500" />`,
          jsx: `() => <img class="text-green-500" />`,
          svelte: `<img class="text-green-500" />`,
          vue: `<template><img class="text-green-500" /></template>`,

          errors: [
            { message: "Restricted class: \"text-green-500\"." }
          ],
          options: [{
            restrict: [{ pattern: "^text-green-500$" }]
          }]
        }
      ]
    });
  });

  it("should fallback to the default message when empty", () => {
    lint(noRestrictedClasses, {
      invalid: [
        {
          angular: `<img class="text-green-500" />`,
          html: `<img class="text-green-500" />`,
          jsx: `() => <img class="text-green-500" />`,
          svelte: `<img class="text-green-500" />`,
          vue: `<template><img class="text-green-500" /></template>`,

          errors: [
            { message: "Restricted class: \"text-green-500\"." }
          ],
          options: [{
            restrict: [{ message: "", pattern: "^text-green-500$" }]
          }]
        }
      ]
    });
  });

});
