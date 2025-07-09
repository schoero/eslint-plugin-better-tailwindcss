import { readFileSync } from "node:fs";

import { fork } from "@eslint/css-tree";
import { runAsWorker } from "synckit";
import { tailwind4 } from "tailwind-csstree";

import type { CssNode } from "@eslint/css-tree";

import type {
  GetCustomComponentClassesRequest,
  GetCustomComponentClassesResponse
} from "./custom-component-classes.js";


runAsWorker(getCustomComponentClasses);

const { findAll, generate, parse } = fork(tailwind4);

export function getCustomComponentClasses({ configPath }: GetCustomComponentClassesRequest): GetCustomComponentClassesResponse {
  const entryFile = readFileSync(configPath, "utf-8");
  const ast = parse(entryFile);
  return getCustomComponentUtilities(ast);
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
