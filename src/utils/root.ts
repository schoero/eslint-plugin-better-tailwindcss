import { dirname, join } from "node:path";

import { findPathRecursive } from "better-tailwindcss:utils/fs.js";

import type { Rule } from "eslint";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";


export function findProjectRoot(ctx: Rule.RuleContext, options: CommonOptions) {
  const { entryPoint, tailwindConfig, tsconfig } = options;

  const rootItems = [
    "package.json",
    "node_modules",
    "tailwind.config.js",
    "tailwind.config.cjs",
    "tailwind.config.mjs",
    "tsconfig.json",
    "jsconfig.json"
  ];

  if(entryPoint || tailwindConfig || tsconfig){
    const root = findPathRecursive(ctx.cwd, dirname(join(ctx.cwd, entryPoint ?? tailwindConfig ?? tsconfig!)), rootItems);
    if(root){
      return dirname(root);
    }
  }
}
