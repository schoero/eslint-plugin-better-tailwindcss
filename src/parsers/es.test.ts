import { describe, it } from "vitest";

import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";


describe("es", () => {

  it("should match callees names via regex", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" lint ");`,
          jsxOutput: `testStyles("lint");`,
          svelte: `<script>testStyles(" lint ");</script>`,
          svelteOutput: `<script>testStyles("lint");</script>`,
          vue: `<script>testStyles(" lint ");</script>`,
          vueOutput: `<script>testStyles("lint");</script>`,

          errors: 2,
          options: [{
            callees: ["^.*Styles$"]
          }]
        }
      ]
    });
  });

  it("should support callee target last for curried calls", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" keep ")(" lint ");`,
          jsxOutput: `testStyles(" keep ")("lint");`,
          svelte: `<script>testStyles(" keep ")(" lint ");</script>`,
          svelteOutput: `<script>testStyles(" keep ")("lint");</script>`,
          vue: `<script>testStyles(" keep ")(" lint ");</script>`,
          vueOutput: `<script>testStyles(" keep ")("lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                callTarget: "last",
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should support callee target all for curried calls", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" first ")(" second ");`,
          jsxOutput: `testStyles("first")("second");`,
          svelte: `<script>testStyles(" first ")(" second ");</script>`,
          svelteOutput: `<script>testStyles("first")("second");</script>`,
          vue: `<script>testStyles(" first ")(" second ");</script>`,
          vueOutput: `<script>testStyles("first")("second");</script>`,

          errors: 4,
          options: [{
            selectors: [
              {
                callTarget: "all",
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should support numeric and negative callee targets", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" keep ")(" middle ")(" lint ");`,
          jsxOutput: `testStyles(" keep ")(" middle ")("lint");`,
          svelte: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,
          svelteOutput: `<script>testStyles(" keep ")(" middle ")("lint");</script>`,
          vue: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,
          vueOutput: `<script>testStyles(" keep ")(" middle ")("lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                callTarget: -1,
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ],
      valid: [
        {
          jsx: `testStyles(" keep ")(" middle ")(" lint ");`,
          svelte: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,
          vue: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,

          options: [{
            selectors: [
              {
                callTarget: 5,
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should match member expression callee names", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const classes = ["keep"]; classes.push(" lint ");`,
          jsxOutput: `const classes = ["keep"]; classes.push("lint");`,
          svelte: `<script>const classes = ["keep"]; classes.push(" lint ");</script>`,
          svelteOutput: `<script>const classes = ["keep"]; classes.push("lint");</script>`,
          vue: `<script>const classes = ["keep"]; classes.push(" lint ");</script>`,
          vueOutput: `<script>const classes = ["keep"]; classes.push("lint");</script>`,

          errors: 2,
          options: [{
            callees: [[
              "^classes\\.push$",
              [{ match: MatcherType.String }]
            ]]
          }]
        }
      ]
    });
  });

  it("should match nested member expression callee names", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const foo = { bar: { push: (value) => value } }; foo.bar.push(" lint ");`,
          jsxOutput: `const foo = { bar: { push: (value) => value } }; foo.bar.push("lint");`,
          svelte: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push(" lint ");</script>`,
          svelteOutput: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push("lint");</script>`,
          vue: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push(" lint ");</script>`,
          vueOutput: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push("lint");</script>`,

          errors: 2,
          options: [{
            callees: [[
              "^foo\\.bar\\.push$",
              [{ match: MatcherType.String }]
            ]]
          }]
        }
      ]
    });
  });

  it("should match callee selectors via path", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const classes = ["keep"]; classes.push(" lint ");`,
          jsxOutput: `const classes = ["keep"]; classes.push("lint");`,
          svelte: `<script>const classes = ["keep"]; classes.push(" lint ");</script>`,
          svelteOutput: `<script>const classes = ["keep"]; classes.push("lint");</script>`,
          vue: `<script>const classes = ["keep"]; classes.push(" lint ");</script>`,
          vueOutput: `<script>const classes = ["keep"]; classes.push("lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                match: [{ type: MatcherType.String }],
                path: "^classes\\.push$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should match variable names via regex", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const testStyles = " lint ";`,
          jsxOutput: `const testStyles = "lint";`,
          svelte: `<script>const testStyles = " lint ";</script>`,
          svelteOutput: `<script>const testStyles = "lint";</script>`,
          vue: `<script>const testStyles = " lint ";</script>`,
          vueOutput: `<script>const testStyles = "lint";</script>`,

          errors: 2,
          options: [{
            variables: ["^.*Styles$"]
          }]
        }
      ]
    });
  });

  it("should match attributes via regex", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `<img testStyles=" lint " />`,
          jsxOutput: `<img testStyles="lint" />`,
          svelte: `<img testStyles=" lint " />`,
          svelteOutput: `<img testStyles="lint" />`,
          vue: `<template><img testStyles=" lint " /> </template>`,
          vueOutput: `<template><img testStyles="lint" /> </template>`,

          errors: 2,
          options: [{
            attributes: ["^.*Styles$"]
          }]
        }
      ]
    });
  });

  // #234
  it("should ignore literals in binary expressions", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `<img class={{ "bg-primary": category === " members " }} />`,
          svelte: `<img class={{ "bg-primary": category === " members " }} />`,
          vue: `<template><img :class="{ 'bg-primary': category === ' members ' }" /></template>`,

          options: [{
            attributes: [[
              "^v-bind:class$",
              [{ match: MatcherType.ObjectValue }]
            ], [
              "class",
              [{ match: MatcherType.ObjectValue }]
            ]]
          }]
        }
      ]
    });
  });

});
