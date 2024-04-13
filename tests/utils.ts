import { RuleTester } from "eslint";
import { createTag } from "proper-tags";
import eslintParserSvelte from "svelte-eslint-parser";
import { afterAll, describe, it } from "vitest";
import eslintParserVue from "vue-eslint-parser";

import eslintParserHTML from "@html-eslint/parser";

import type { ESLintRule } from "readable-tailwind:types:rule.js";


export const TEST_SYNTAXES = {
  html: {
    languageOptions: { parser: eslintParserHTML }
  },
  jsx: {
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } }
  },
  svelte: {
    languageOptions: { parser: eslintParserSvelte }
  },
  vue: {
    languageOptions: { parser: eslintParserVue }
  }
} as const;

export function lint<Rule extends ESLintRule, Syntaxes extends Record<string, unknown>>(
  eslintRule: Rule,
  syntaxes: Syntaxes,
  tests: {
    invalid?: (
      {
        [Key in keyof Syntaxes as `${Key & string}Output`]?: string;
      } & {
        [Key in keyof Syntaxes]?: string;
      } & {
        errors: number;
      } & {
        options?: Rule["options"];
      }
    )[];
    valid?: (
      {
        [Key in keyof Syntaxes]?: string;
      } & {
        options?: Rule["options"];
      }
    )[];
  }
) {

  for(const invalid of tests.invalid ?? []){
    for(const syntax of Object.keys(syntaxes)){

      const ruleTester = createRuleTester(syntaxes[syntax]);

      if(!invalid[syntax] || !invalid[`${syntax}Output`]){
        continue;
      }

      ruleTester.run(eslintRule.name, eslintRule.rule, {
        invalid: [{
          code: invalid[syntax]!,
          errors: invalid.errors,
          options: invalid.options ?? [],
          output: invalid[`${syntax}Output`]!
        }],
        valid: []
      });
    }
  }

  for(const valid of tests.valid ?? []){
    for(const syntax of Object.keys(syntaxes)){

      const ruleTester = createRuleTester(syntaxes[syntax]);

      if(!valid[syntax]){
        continue;
      }

      ruleTester.run(eslintRule.name, eslintRule.rule, {
        invalid: [],
        valid: [{
          code: valid[syntax]!,
          options: valid.options ?? []
        }]
      });
    }
  }

}

export function createTrimTag(count: number) {
  return createTag(customIndentStripTransformer(count));
}

function customIndentStripTransformer(count: number) {
  return {
    onEndResult(endResult: string) {
      return endResult.replace(new RegExp(`^ {${count}}`, "gm"), "");
    }
  };
}

function createRuleTester(options?: any) {
  const ruleTester = new RuleTester(options);

  // @ts-expect-error - types are not up to date yet
  ruleTester.afterAll = afterAll;
  // @ts-expect-error - types are not up to date yet
  ruleTester.describe = describe;
  // @ts-expect-error - types are not up to date yet
  ruleTester.it = it;
  // @ts-expect-error - types are not up to date yet
  ruleTester.itOnly = it.only;

  return ruleTester;
}
