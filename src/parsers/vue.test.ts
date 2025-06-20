import { describe, it } from "vitest";

import { enforceConsistentClassOrder } from "better-tailwindcss:rules/enforce-consistent-class-order.js";
import { enforceConsistentLineWrapping } from "better-tailwindcss:rules/enforce-consistent-line-wrapping.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";
import { dedent } from "better-tailwindcss:tests/utils/template.js";
import { MatcherType } from "better-tailwindcss:types/rule.js";


describe("vue", () => {

  it("should match attribute names via regex", () => {
    lint(enforceConsistentClassOrder, TEST_SYNTAXES, {
      invalid: [
        {
          vue: `<template><img customAttribute="b a" /></template>`,
          vueOutput: `<template><img customAttribute="a b" /></template>`,

          errors: 1,
          options: [{ attributes: [".*Attribute"], order: "asc" }]
        }
      ]
    });
  });

  it("should work in objects in bound classes", () => {
    lint(enforceConsistentClassOrder, TEST_SYNTAXES, {
      invalid: [
        {
          vue: `<template><img v-bind:class="{ 'c b a': condition === 'c b a' }" /></template>`,
          vueOutput: `<template><img v-bind:class="{ 'a b c': condition === 'c b a' }" /></template>`,

          errors: 1,
          options: [{ order: "asc" }]
        },
        {
          vue: `<template><img :class="{ 'c b a': condition === 'c b a' }" /></template>`,
          vueOutput: `<template><img :class="{ 'a b c': condition === 'c b a' }" /></template>`,

          errors: 1,
          options: [{ order: "asc" }]
        }
      ]
    });
  });

  it("should work in arrays in bound classes", () => {
    lint(enforceConsistentClassOrder, TEST_SYNTAXES, {
      invalid: [
        {
          vue: `<template><img v-bind:class="[condition === 'c b a' ? 'c b a' : 'f e d']" /></template>`,
          vueOutput: `<template><img v-bind:class="[condition === 'c b a' ? 'a b c' : 'd e f']" /></template>`,

          errors: 2,
          options: [{ order: "asc" }]
        },
        {
          vue: `<template><img :class="[condition === 'c b a' ? 'c b a' : 'f e d']" /></template>`,
          vueOutput: `<template><img :class="[condition === 'c b a' ? 'a b c' : 'd e f']" /></template>`,

          errors: 2,
          options: [{ order: "asc" }]
        }
      ]
    });
  });

  it("should evaluate bound classes", () => {
    lint(enforceConsistentClassOrder, TEST_SYNTAXES, {
      invalid: [
        {
          vue: `<template><img v-bind:class="defined('c b a')" /></template>`,
          vueOutput: `<template><img v-bind:class="defined('a b c')" /></template>`,

          errors: 1,
          options: [{ callees: ["defined"], order: "asc" }]
        },
        {
          vue: `<template><img :class="defined('c b a')" /></template>`,
          vueOutput: `<template><img :class="defined('a b c')" /></template>`,

          errors: 1,
          options: [{ callees: ["defined"], order: "asc" }]
        }
      ]
    });
  });

  it("should automatically prefix bound classes", () => {
    lint(enforceConsistentClassOrder, TEST_SYNTAXES, {
      invalid: [
        {
          vue: `<template><img v-bind:custom-class="['c b a']" /></template>`,
          vueOutput: `<template><img v-bind:custom-class="['a b c']" /></template>`,

          errors: 1,
          options: [{ attributes: [[":custom-class", [{ match: MatcherType.String }]]], order: "asc" }]
        },
        {
          vue: `<template><img :custom-class="['c b a']" /></template>`,
          vueOutput: `<template><img :custom-class="['a b c']" /></template>`,

          errors: 1,
          options: [{ attributes: [["v-bind:custom-class", [{ match: MatcherType.String }]]], order: "asc" }]
        }
      ]
    });
  });

  it("should match bound classes via regex", () => {
    lint(enforceConsistentClassOrder, TEST_SYNTAXES, {
      invalid: [
        {
          vue: `<template><img v-bind:testStyles="['c b a']" /></template>`,
          vueOutput: `<template><img v-bind:testStyles="['a b c']" /></template>`,

          errors: 1,
          options: [{ attributes: [[":.*Styles$", [{ match: MatcherType.String }]]], order: "asc" }]
        }
      ]
    });
  });

  // #95
  it("should change the quotes in expressions to backticks", () => {
    const singleLine = "a b c d e f";
    const multiLine = dedent`
      a b c
      d e f
    `;

    lint(enforceConsistentLineWrapping, TEST_SYNTAXES, {
      invalid: [
        {
          vue: `<template><img :class="[true ? '${singleLine}' : '${singleLine}']" /></template>`,
          vueOutput: `<template><img :class="[true ? \`${multiLine}\` : \`${multiLine}\`]" /></template>`,

          errors: 2,
          options: [{ classesPerLine: 3 }]
        }
      ]
    });
  });

  // #119
  it("should not report inside member expressions", () => {
    lint(noUnnecessaryWhitespace, TEST_SYNTAXES, {
      valid: [
        {
          vue: `<template><img :class="[ui[' ignored ']]" /></template>`
        }
      ]
    });
  });

});
