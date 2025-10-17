import { readdirSync } from "node:fs";
import { normalize } from "node:path";

import eslintParserAngular from "@angular-eslint/template-parser";
import eslintParserHTML from "@html-eslint/parser";
import eslintParserAstro from "astro-eslint-parser";
import { RuleTester } from "eslint";
import eslintParserSvelte from "svelte-eslint-parser";
import eslintParserVue from "vue-eslint-parser";

import { createTestFile, resetTestingDirectory } from "better-tailwindcss:tests/utils/tmp.js";

import type { Node as ESNode } from "estree";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";
import type { Context, ESLintRule } from "better-tailwindcss:types/rule.js";


const TEST_SYNTAXES = {
  angular: {
    languageOptions: { parser: eslintParserAngular }
  },
  astro: {
    languageOptions: { parser: eslintParserAstro }
  },
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

type Syntaxes = typeof TEST_SYNTAXES;

export function lint<const Rule extends ESLintRule>(
  eslintRule: Rule,
  tests: {
    invalid?: (
      {
        [Key in keyof Syntaxes]?: string;
      } & {
        [Key in keyof Syntaxes as `${Key & string}Output`]?: string;
      } & {
        errors: { message: string; type?: string; }[] | number;
      } & {
        files?: Record<string, string>;
        options?: [Partial<CommonOptions & Context<Rule>["options"]>];
        settings?: Record<string, Partial<CommonOptions>>;
      }
    )[];
    valid?: (
      {
        [Key in keyof Syntaxes]?: string;
      } & {
        files?: Record<string, string>;
        options?: [Partial<CommonOptions & Context<Rule>["options"]>];
        settings?: Record<string, Partial<CommonOptions>>;
      }
    )[];
  }
) {

  resetTestingDirectory();

  for(const invalid of tests.invalid ?? []){

    for(const file in invalid.files ?? {}){
      invalid.settings ??= { "better-tailwindcss": {} };
      createTestFile(file, invalid.files![file]);
    }

    for(const syntax of Object.keys(TEST_SYNTAXES)){

      const ruleTester = new RuleTester(TEST_SYNTAXES[syntax]);

      if(!invalid[syntax]){
        continue;
      }

      ruleTester.run(eslintRule.name, eslintRule.rule, {
        invalid: [{
          code: invalid[syntax],
          errors: invalid.errors,
          options: invalid.options ?? [],
          output: invalid[`${syntax}Output`] ?? null,
          settings: invalid.settings ?? {}
        }],
        valid: []
      });
    }
  }

  resetTestingDirectory();

  for(const valid of tests.valid ?? []){

    for(const file in valid.files ?? {}){
      valid.settings ??= { "better-tailwindcss": {} };
      createTestFile(file, valid.files![file]);
    }

    for(const syntax of Object.keys(TEST_SYNTAXES)){

      const ruleTester = new RuleTester(TEST_SYNTAXES[syntax]);

      if(!valid[syntax]){
        continue;
      }

      ruleTester.run(eslintRule.name, eslintRule.rule, {
        invalid: [],
        valid: [{
          code: valid[syntax],
          options: valid.options ?? [],
          settings: valid.settings ?? {}
        }]
      });

    }
  }

}

type GuardedType<Type> = Type extends (value: any) => value is infer ResultType ? ResultType : never;

export function findNode<Matcher extends (node: unknown) => node is any>(node: unknown, matcherFunction: Matcher): GuardedType<Matcher> | undefined {
  if(!node || typeof node !== "object"){
    return;
  }

  for(const key in node){
    const value = node[key];

    if(!value || typeof value !== "object" || key === "parent"){
      continue;
    }

    if(matcherFunction(value)){
      return value;
    }

    const foundNode = findNode(value, matcherFunction);

    if(foundNode){
      return foundNode;
    }
  }
}

export function withParentNodeExtension(node: ESNode, parent: ESNode = node) {
  for(const key in node){
    if(typeof node[key] === "object" && key !== "parent"){
      if(Array.isArray(node[key])){
        for(const element of node[key]){
          element.parent = parent;
          withParentNodeExtension(element);
        }
      } else {
        node[key].parent = parent;
        withParentNodeExtension(node[key]);
      }
    }
  }
  return node;
}

export function getFilesInDirectory(importURL: string) {
  const path = normalize(importURL);
  const files = readdirSync(path);

  return files.filter(file => !file.includes(".test.ts"));
}
