import { lint, TEST_SYNTAXES } from "tests/utils.js";
import { describe, expect, it } from "vitest";

import { tailwindSortClasses } from "readable-tailwind:rules:tailwind-sort-classes.js";


describe(tailwindSortClasses.name, () => {

  it("should sort simple class names in string literals by the defined order", () => expect(
    void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 1,
            html: "<div class=\"b a\" />",
            htmlOutput: "<div class=\"a b\" />",
            jsx: "const Test = () => <div class=\"b a\" />;",
            jsxOutput: "const Test = () => <div class=\"a b\" />;",
            options: [{ order: "asc" }],
            svelte: "<div class=\"b a\" />",
            svelteOutput: "<div class=\"a b\" />",
            vue: "<template><div class=\"b a\" /></template>",
            vueOutput: "<template><div class=\"a b\" /></template>"
          },
          {
            errors: 1,
            html: "<div class=\"a b\" />",
            htmlOutput: "<div class=\"b a\" />",
            jsx: "const Test = () => <div class=\"a b\" />;",
            jsxOutput: "const Test = () => <div class=\"b a\" />;",
            options: [{ order: "desc" }],
            svelte: "<div class=\"a b\" />",
            svelteOutput: "<div class=\"b a\" />",
            vue: "<template><div class=\"a b\" /></template>",
            vueOutput: "<template><div class=\"b a\" /></template>"
          },
          {
            errors: 1,
            html: "<div class=\"w-full absolute\" />",
            htmlOutput: "<div class=\"absolute w-full\" />",
            jsx: "const Test = () => <div class=\"w-full absolute\" />;",
            jsxOutput: "const Test = () => <div class=\"absolute w-full\" />;",
            options: [{ order: "official" }],
            svelte: "<div class=\"w-full absolute\" />",
            svelteOutput: "<div class=\"absolute w-full\" />",
            vue: "<template><div class=\"w-full absolute\" /></template>",
            vueOutput: "<template><div class=\"absolute w-full\" /></template>"
          }
        ],
        valid: [
          {
            html: "<div class=\"a b\" />",
            jsx: "const Test = () => <div class=\"a b\" />;",
            options: [{ order: "asc" }],
            svelte: "<div class=\"a b\" />",
            vue: "<template><div class=\"a b\" /></template>"
          },
          {
            html: "div class=\"b a\" />",
            jsx: "const Test = () => <div class=\"b a\" />;",
            options: [{ order: "desc" }],
            svelte: "div class=\"b a\" />",
            vue: "<template><div class=\"b a\" /></template>"
          },
          {
            html: "<div class=\"absolute w-full\" />",
            jsx: "const Test = () => <div class=\"absolute w-full\" />;",
            options: [{ order: "official" }],
            svelte: "<div class=\"absolute w-full\" />",
            vue: "<template><div class=\"absolute w-full\" /></template>"
          }
        ]
      }
    )
  ).toBeUndefined());

  it("should improve the sorting by grouping all classes with the same modifier together", () => {
    expect(void lint(tailwindSortClasses, TEST_SYNTAXES, {
      invalid: [
        {
          errors: 1,
          html: "<div class=\"c:a a:a b:a a:b c:b b:b\" />",
          htmlOutput: "<div class=\"a:a a:b b:a b:b c:a c:b\" />",
          jsx: "const Test = () => <div class=\"c:a a:a b:a a:b c:b b:b\" />;",
          jsxOutput: "const Test = () => <div class=\"a:a a:b b:a b:b c:a c:b\" />;",
          options: [{ order: "improved" }],
          svelte: "<div class=\"c:a a:a b:a a:b c:b b:b\" />",
          svelteOutput: "<div class=\"a:a a:b b:a b:b c:a c:b\" />",
          vue: "<template><div class=\"c:a a:a b:a a:b c:b b:b\" /></template>",
          vueOutput: "<template><div class=\"a:a a:b b:a b:b c:a c:b\" /></template>"
        }
      ]
    })).toBeUndefined();
  });

  it("should keep the quotes as they are", () => expect(
    void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 1,
            html: "<div class=\"b a\" />",
            htmlOutput: "<div class=\"a b\" />",
            jsx: "const Test = () => <div class=\"b a\" />;",
            jsxOutput: "const Test = () => <div class=\"a b\" />;",
            options: [{ order: "asc" }],
            svelte: "<div class=\"b a\" />",
            svelteOutput: "<div class=\"a b\" />",
            vue: "<template><div class=\"b a\" /></template>",
            vueOutput: "<template><div class=\"a b\" /></template>"
          },
          {
            errors: 1,
            html: "<div class='b a' />",
            htmlOutput: "<div class='a b' />",
            jsx: "const Test = () => <div class='b a' />;",
            jsxOutput: "const Test = () => <div class='a b' />;",
            options: [{ order: "asc" }],
            svelte: "<div class='b a' />",
            svelteOutput: "<div class='a b' />",
            vue: "<template><div class='b a' /></template>",
            vueOutput: "<template><div class='a b' /></template>"
          },
          {
            errors: 1,
            jsx: "const Test = () => <div class={`b a`} />;",
            jsxOutput: "const Test = () => <div class={`a b`} />;",
            options: [{ order: "asc" }],
            svelte: "<div class={`b a`} />",
            svelteOutput: "<div class={`a b`} />"
          },
          {
            errors: 1,
            jsx: "const Test = () => <div class={\"b a\"} />;",
            jsxOutput: "const Test = () => <div class={\"a b\"} />;",
            options: [{ order: "asc" }]
          },
          {
            errors: 1,
            jsx: "const Test = () => <div class={'b a'} />;",
            jsxOutput: "const Test = () => <div class={'a b'} />;",
            options: [{ order: "asc" }]
          }
        ]
      }
    )
  ).toBeUndefined());

  it("should keep expressions as they are", () => expect(
    void lint(tailwindSortClasses, TEST_SYNTAXES, {
      valid: [
        {
          jsx: "const Test = () => <div class={true ? \"b a\" : \"c b\"} />;",
          svelte: "<div class={true ? \"b a\" : \"c b\"} />"
        }
      ]
    })
  ).toBeUndefined());

  it("should keep expressions where they are", () => expect(
    void lint(tailwindSortClasses, TEST_SYNTAXES, {
      invalid: [
        {
          errors: 2,
          jsx: "const Test = () => <div class={`c a ${true ? 'e' : 'f'} d b `} />;",
          jsxOutput: "const Test = () => <div class={`a c ${true ? 'e' : 'f'} b d `} />;",
          options: [{ order: "asc" }],
          svelte: "<div class={`c a ${true ? 'e' : 'f'} d b `} />",
          svelteOutput: "<div class={`a c ${true ? 'e' : 'f'} b d `} />"
        }
      ],
      valid: [
        {
          jsx: "const Test = () => <div class={`a c ${true ? 'e' : 'f'} b `} />;",
          svelte: "<div class={`a c ${true ? 'e' : 'f'} b `} />"
        }
      ]
    })
  ).toBeUndefined());

  it("should not rip away sticky classes", () => {

    const expression = "${true ? ' true ' : ' false '}";

    const dirty = `c b a${expression}f e d`;
    const clean = `b c a${expression}f d e`;

    expect(void lint(tailwindSortClasses, TEST_SYNTAXES, {
      invalid: [
        {
          errors: 2,
          jsx: `const Test = () => <div class={\`${dirty}\`} />;`,
          jsxOutput: `const Test = () => <div class={\`${clean}\`} />;`,
          options: [{ order: "asc" }],
          svelte: `<div class={\`${dirty}\`} />`,
          svelteOutput: `<div class={\`${clean}\`} />`
        }
      ]
    })).toBeUndefined();

  });

  it("should sort multiline strings but keep the whitespace as it is", () => {
    const unsortedMultilineString = `
      d c
      b a
    `;

    const sortedMultilineString = `
      a b
      c d
    `;

    expect(
      void lint(
        tailwindSortClasses,
        TEST_SYNTAXES,
        {
          invalid: [
            {
              errors: 1,
              html: `<div class="${unsortedMultilineString}" />`,
              htmlOutput: `<div class="${sortedMultilineString}" />`,
              options: [{ order: "asc" }],
              svelte: `<div class="${unsortedMultilineString}" />`,
              svelteOutput: `<div class="${sortedMultilineString}" />`,
              vue: `<template><div class="${unsortedMultilineString}" /></template>`,
              vueOutput: `<template><div class="${sortedMultilineString}" /></template>`
            },
            {
              errors: 1,
              html: `<div class='${unsortedMultilineString}' />`,
              htmlOutput: `<div class='${sortedMultilineString}' />`,
              options: [{ order: "asc" }],
              svelte: `<div class='${unsortedMultilineString}' />`,
              svelteOutput: `<div class='${sortedMultilineString}' />`,
              vue: `<template><div class='${unsortedMultilineString}' /></template>`,
              vueOutput: `<template><div class='${sortedMultilineString}' /></template>`
            },
            {
              errors: 1,
              jsx: `const Test = () => <div class={\`${unsortedMultilineString}\`} />;`,
              jsxOutput: `const Test = () => <div class={\`${sortedMultilineString}\`} />;`,
              options: [{ order: "asc" }],
              svelte: `<div class={\`${unsortedMultilineString}\`} />`,
              svelteOutput: `<div class={\`${sortedMultilineString}\`} />`
            }
          ],
          valid: [
            {
              html: `<div class="${sortedMultilineString}" />`,
              options: [{ order: "asc" }],
              svelte: `<div class="${sortedMultilineString}" />`,
              vue: `<template><div class="${sortedMultilineString}" /></template>`
            },
            {
              html: `<div class='${sortedMultilineString}' />`,
              options: [{ order: "asc" }],
              svelte: `<div class='${sortedMultilineString}' />`,
              vue: `<template><div class='${sortedMultilineString}' /></template>`
            },
            {
              jsx: `const Test = () => <div class={\`${sortedMultilineString}\`} />;`,
              options: [{ order: "asc" }],
              svelte: `<div class={\`${sortedMultilineString}\`} />`
            }
          ]
        }
      )
    ).toBeUndefined();
  });

  it("should sort in string literals in defined call signature arguments", () => {

    const dirtyDefined = "defined('b a d c');";
    const cleanDefined = "defined('a b c d');";
    const dirtyUndefined = "notDefined(\"b a d c\");";

    expect(void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 1,
            jsx: dirtyDefined,
            jsxOutput: cleanDefined,
            options: [{ callees: ["defined"], order: "asc" }],
            svelte: `<script>${dirtyDefined}</script>`,
            svelteOutput: `<script>${cleanDefined}</script>`,
            vue: `<script>${dirtyDefined}</script>`,
            vueOutput: `<script>${cleanDefined}</script>`
          }
        ],
        valid: [
          {
            jsx: dirtyUndefined,
            options: [{ callees: ["defined"], order: "asc" }],
            svelte: `<script>${dirtyUndefined}</script>`,
            vue: `<script>${dirtyUndefined}</script>`
          }
        ]
      }
    )).toBeUndefined();

    expect(void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 1,
            jsx: dirtyDefined,
            jsxOutput: cleanDefined,
            options: [{ callees: ["defined"], order: "asc" }],
            svelte: `<script>${dirtyDefined}</script>`,
            svelteOutput: `<script>${cleanDefined}</script>`,
            vue: `<script>${dirtyDefined}</script>`,
            vueOutput: `<script>${cleanDefined}</script>`
          }
        ],
        valid: [
          {
            jsx: dirtyUndefined,
            options: [{ callees: ["defined"], order: "asc" }],
            svelte: `<script>${dirtyUndefined}</script>`,
            vue: `<script>${dirtyUndefined}</script>`
          }
        ]
      }
    )).toBeUndefined();

  });

  it("should sort in string literals in call signature arguments matched by a regex", () => {

    const dirtyDefined = `defined(
      "b a",
      {
        "nested": {
          "matched": "b a",
        },
        "deeply": {
          "nested": {
            "unmatched": "b a",
            "matched": "b a"
          },
        },
        "multiline": {
          "matched": \`
            d a
            b c
          \`
        }
      }
    );`;

    const cleanDefined = `defined(
      "a b",
      {
        "nested": {
          "matched": "a b",
        },
        "deeply": {
          "nested": {
            "unmatched": "b a",
            "matched": "a b"
          },
        },
        "multiline": {
          "matched": \`
            a b
            c d
          \`
        }
      }
    );`;

    expect(void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 4,
            jsx: dirtyDefined,
            jsxOutput: cleanDefined,
            options: [{
              callees: [
                [
                  "defined\\(([^)]*)\\)",
                  "\"matched\"?:\\s*[\"'`]([^\"'`]+)[\"'`]"
                ],
                [
                  "defined\\(([^)]*)\\)",
                  "^\\s*[\"'`]([^\"'`]+)[\"'`](?!:)"
                ]
              ],
              order: "asc"
            }],
            svelte: `<script>${dirtyDefined}</script>`,
            svelteOutput: `<script>${cleanDefined}</script>`,
            vue: `<script>${dirtyDefined}</script>`,
            vueOutput: `<script>${cleanDefined}</script>`
          }
        ]
      }
    )).toBeUndefined();

  });

  it("should sort in call signature arguments in template literals", () => {

    const dirtyDefined = "${defined('f e')}";
    const cleanDefined = "${defined('e f')}";
    const dirtyUndefined = "${notDefined('f e')}";

    const dirtyDefinedMultiline = `
      b a
      d c ${dirtyDefined} h g
      j i
    `;
    const cleanDefinedMultiline = `
      a b
      c d ${cleanDefined} g h
      i j
    `;
    const dirtyUndefinedMultiline = `
      b a
      d c ${dirtyUndefined} h g
      j i
    `;
    const cleanUndefinedMultiline = `
      a b
      c d ${dirtyUndefined} g h
      i j
    `;

    expect(void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 3,
            jsx: `const Test = () => <div class={\`${dirtyDefinedMultiline}\`} />;`,
            jsxOutput: `const Test = () => <div class={\`${cleanDefinedMultiline}\`} />;`,
            options: [{ callees: ["defined"], order: "asc" }],
            svelte: `<div class={\`${dirtyDefinedMultiline}\`} />`,
            svelteOutput: `<div class={\`${cleanDefinedMultiline}\`} />`
          },
          {
            errors: 2,
            jsx: `const Test = () => <div class={\`${dirtyUndefinedMultiline}\`} />;`,
            jsxOutput: `const Test = () => <div class={\`${cleanUndefinedMultiline}\`} />;`,
            options: [{ callees: ["defined"], order: "asc" }],
            svelte: `<div class={\`${dirtyUndefinedMultiline}\`} />`,
            svelteOutput: `<div class={\`${cleanUndefinedMultiline}\`} />`
          }
        ]
      }
    )).toBeUndefined();

  });

  it("should sort in matching variable declarations", () => {

    const dirtyDefined = "const defined = \"b a\";";
    const cleanDefined = "const defined = \"a b\";";
    const dirtyUndefined = "const notDefined = \"b a\";";

    const dirtyMultiline = `const defined = \`
      b a
      d c
    \`;`;

    const cleanMultiline = `const defined = \`
      a b
      c d
    \`;`;

    expect(void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 1,
            jsx: dirtyDefined,
            jsxOutput: cleanDefined,
            options: [{ order: "asc", variables: ["defined"] }],
            svelte: `<script>${dirtyDefined}</script>`,
            svelteOutput: `<script>${cleanDefined}</script>`,
            vue: `<script>${dirtyDefined}</script>`,
            vueOutput: `<script>${cleanDefined}</script>`
          },
          {
            errors: 1,
            jsx: dirtyMultiline,
            jsxOutput: cleanMultiline,
            options: [{ order: "asc", variables: ["defined"] }],
            svelte: `<script>${dirtyMultiline}</script>`,
            svelteOutput: `<script>${cleanMultiline}</script>`,
            vue: `<script>${dirtyMultiline}</script>`,
            vueOutput: `<script>${cleanMultiline}</script>`
          }
        ],
        valid: [
          {
            jsx: dirtyUndefined,
            options: [{ order: "asc" }],
            svelte: `<script>${dirtyUndefined}</script>`,
            vue: `<script>${dirtyUndefined}</script>`
          }
        ]
      }
    )).toBeUndefined();

  });

  it("should sort in matching variable declarations matched by a regex", () => {

    const dirtyDefined = "const defined = \"b a\";";
    const cleanDefined = "const defined = \"a b\";";
    const dirtyUndefined = "const notDefined = \"b a\";";

    const dirtyObject = `const defined = {
      "matched": "b a",
      "unmatched": "b a",
      "nested": {
        "matched": "b a",
        "unmatched": "b a"
      }
    };`;

    const cleanObject = `const defined = {
      "matched": "a b",
      "unmatched": "b a",
      "nested": {
        "matched": "a b",
        "unmatched": "b a"
      }
    };`;

    const dirtyMultiline = `const defined = \`
      b a
      d c
    \`;`;

    const cleanMultiline = `const defined = \`
      a b
      c d
    \`;`;

    expect(void lint(
      tailwindSortClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            errors: 1,
            jsx: dirtyDefined,
            jsxOutput: cleanDefined,
            options: [{
              order: "asc",
              variables: [
                [
                  "defined = ([\\S\\s]*)",
                  "^\\s*[\"'`]([^\"'`]+)[\"'`]"
                ]
              ]
            }],
            svelte: `<script>${dirtyDefined}</script>`,
            svelteOutput: `<script>${cleanDefined}</script>`,
            vue: `<script>${dirtyDefined}</script>`,
            vueOutput: `<script>${cleanDefined}</script>`
          },
          {
            errors: 2,
            jsx: dirtyObject,
            jsxOutput: cleanObject,
            options: [{
              order: "asc",
              variables: [
                [
                  "defined = ([\\S\\s]*)",
                  "\"matched\"?:\\s*[\"'`]([^\"'`]+)[\"'`]"
                ]
              ]
            }],
            svelte: `<script>${dirtyObject}</script>`,
            svelteOutput: `<script>${cleanObject}</script>`,
            vue: `<script>${dirtyObject}</script>`,
            vueOutput: `<script>${cleanObject}</script>`
          },
          {
            errors: 1,
            jsx: dirtyMultiline,
            jsxOutput: cleanMultiline,
            options: [{
              order: "asc",
              variables: [
                [
                  "defined = ([\\S\\s]*)",
                  "^\\s*['`\"]([^'`]+)['`\"]"
                ]
              ]
            }],
            svelte: `<script>${dirtyMultiline}</script>`,
            svelteOutput: `<script>${cleanMultiline}</script>`,
            vue: `<script>${dirtyMultiline}</script>`,
            vueOutput: `<script>${cleanMultiline}</script>`
          }
        ],
        valid: [
          {
            jsx: dirtyUndefined,
            options: [{ order: "asc" }],
            svelte: `<script>${dirtyUndefined}</script>`,
            vue: `<script>${dirtyUndefined}</script>`
          }
        ]
      }
    )).toBeUndefined();

  });

});
