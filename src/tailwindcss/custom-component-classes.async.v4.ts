import { readFileSync } from "node:fs";
import { dirname } from "node:path";

import { fork } from "@eslint/css-tree";
import { tailwind4 } from "tailwind-csstree";

import { withCache } from "../async-utils/cache.js";
import { resolveCss } from "../async-utils/resolvers.js";

import type { CssNode } from "@eslint/css-tree";

import type {
  GetCustomComponentClassesRequest,
  GetCustomComponentClassesResponse
} from "./custom-component-classes.js";


const { findAll, generate, parse } = fork(tailwind4);

export function getCustomComponentClasses({ configPath, cwd }: GetCustomComponentClassesRequest): GetCustomComponentClassesResponse {
  const files = parseCssFile(cwd, configPath);

  const utilities = Object.values(files).reduce<string[]>((customComponentClasses, ast) => {
    customComponentClasses.push(...getCustomComponentUtilities(ast));
    return customComponentClasses;
  }, []);

  return utilities;
}

export function parseCssFile(cwd: string, filePath: string): { [filePath: string]: CssNode; } {
  const resolvedPath = resolveCss(cwd, filePath);

  return withCache(resolvedPath, () => {
    try {
      const content = readFileSync(resolvedPath, "utf-8");

      const files: { [filePath: string]: CssNode; } = {
        [resolvedPath]: parse(content)
      };

      const importNodes = findAll(files[resolvedPath], node => node.type === "Atrule" &&
        node.name === "import" &&
        node.prelude?.type === "AtrulePrelude");

      for(const importNode of importNodes){
        if(importNode.type !== "Atrule" || !importNode.prelude){
          continue;
        }

        const importStatement = generate(importNode.prelude).match(/["'](?<importPath>[^"']+)["']/);

        if(!importStatement){
          continue;
        }

        const { importPath } = importStatement.groups || {};

        const cwd = dirname(resolvedPath);
        const importFiles = parseCssFile(cwd, importPath);

        for(const importFilePath in importFiles){
          files[importFilePath] = importFiles[importFilePath];
        }
      }

      return files;
    } catch {
      return {};
    }
  });
}

function getCustomComponentUtilities(ast: CssNode) {
  const customComponentUtilities: string[] = [];

  const componentLayers = findAll(ast, node => {
    return node.type === "Atrule" &&
      node.name === "layer" &&
      node.prelude?.type === "AtrulePrelude" &&
      generate(node.prelude).trim() === "components";
  });

  for(const layer of componentLayers){
    const classSelectors = findAll(layer, node => node.type === "ClassSelector");

    for(const classNode of classSelectors){
      if(classNode.type !== "ClassSelector"){
        continue;
      }

      if(customComponentUtilities.includes(classNode.name)){
        continue;
      }

      customComponentUtilities.push(classNode.name);
    }
  }

  return customComponentUtilities;
}
