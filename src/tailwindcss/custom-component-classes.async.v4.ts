import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { fork } from "@eslint/css-tree";
import { tailwind4 } from "tailwind-csstree";

import type { CssNode } from "@eslint/css-tree";

import type {
  GetCustomComponentClassesRequest,
  GetCustomComponentClassesResponse
} from "./custom-component-classes.js";


const { findAll, generate, parse } = fork(tailwind4);

export function getCustomComponentClasses({ configPath }: GetCustomComponentClassesRequest): GetCustomComponentClassesResponse {
  const files = parseCssFile(configPath);

  const utilities = Object.values(files).reduce<string[]>((customComponentClasses, ast) => {
    customComponentClasses.push(...getCustomComponentUtilities(ast));
    return customComponentClasses;
  }, []);

  return utilities;
}

function parseCssFile(filePath: string): { [filePath: string]: CssNode; } {
  const content = readFileSync(filePath, "utf-8");

  const files: { [filePath: string]: CssNode; } = {
    [filePath]: parse(content)
  };

  const importNodes = findAll(files[filePath], node => node.type === "Atrule" &&
    node.name === "import" &&
    node.prelude?.type === "AtrulePrelude");

  for(const importNode of importNodes){
    if(importNode.type !== "Atrule" || !importNode.prelude){
      continue;
    }

    const importPath = generate(importNode.prelude).trim()
      .replace(/["']/g, "");

    if(!importPath.endsWith(".css")){
      continue;
    }

    const importFiles = parseCssFile(resolve(dirname(filePath), importPath));

    for(const importFilePath in importFiles){
      files[importFilePath] = importFiles[importFilePath];
    }
  }

  return files;
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
