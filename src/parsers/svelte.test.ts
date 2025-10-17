import { describe, it } from "vitest";

import { enforceConsistentClassOrder } from "better-tailwindcss:rules/enforce-consistent-class-order.js";
import { enforceConsistentLineWrapping } from "better-tailwindcss:rules/enforce-consistent-line-wrapping.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { dedent } from "better-tailwindcss:tests/utils/template.js";
import { MatcherType } from "better-tailwindcss:types/rule.js";


describe("svelte", () => {

  it("should match attribute names via regex", () => {
    lint(enforceConsistentClassOrder, {
      invalid: [
        {
          svelte: `<img customAttribute="b a" />`,
          svelteOutput: `<img customAttribute="a b" />`,

          errors: 1,
          options: [{ attributes: [".*Attribute"], order: "asc" }]
        }
      ]
    });
  });

  // #42
  it("should work with shorthand attributes", () => {
    lint(enforceConsistentClassOrder, {
      invalid: [
        {
          svelte: `<script>let disabled = true;</script><img class="c b a" {disabled} />`,
          svelteOutput: `<script>let disabled = true;</script><img class="a b c" {disabled} />`,

          errors: 1,
          options: [{ order: "asc" }]
        }
      ]
    });
  });

  it("should change the quotes in expressions to backticks", () => {
    const singleLine = "a b c d e f";
    const multiLine = dedent`
      a b c
      d e f
    `;

    lint(enforceConsistentLineWrapping, {
      invalid: [
        {
          svelte: `<img class={true ? '${singleLine}' : '${singleLine}'} />`,
          svelteOutput: `<img class={true ? \`${multiLine}\` : \`${multiLine}\`} />`,

          errors: 2,
          options: [{ classesPerLine: 3 }]
        }
      ]
    });
  });

  // #119
  it("should not report inside member expressions", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          svelte: `<img class={classes[" ignored "]} />`
        }
      ]
    });
  });

  // #211
  it("should still handle object values even when they are immediately index accessed", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          svelte: "<img class={{ key: '  a b c  '}['key']} />",
          svelteOutput: "<img class={{ key: 'a b c'}['key']} />",

          errors: 2,
          options: [{
            attributes: [["class", [{ match: MatcherType.ObjectValue }]]]
          }]
        }
      ]
    });
  });

  // #226
  it("should not match index accessed object keys", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          svelte: "<img class={{ '  a b c  ': '  d e f '}['  a b c  ']} />",

          options: [{
            attributes: [["class", [{ match: MatcherType.ObjectKey }]]]
          }]
        }
      ]
    });
  });

});
