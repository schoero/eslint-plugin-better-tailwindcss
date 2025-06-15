import { readFileSync } from "node:fs";

import { fork } from "@eslint/css-tree";
import { tailwind4 } from "tailwind-csstree";

import { invalidateByModifiedDate, withCache } from "../utils/cache.js";

import type { CssNode } from "@eslint/css-tree";

import type {
  GetCustomComponentClassesRequest,
  GetCustomComponentClassesResponse
} from "./custom-component-classes.js";


const { findAll, generate, parse } = fork(tailwind4);

export const getCustomComponentClasses = ({ configPath }: GetCustomComponentClassesRequest) => withCache<GetCustomComponentClassesResponse>("ast", () => {
  const entryFile = readFileSync(configPath, "utf-8");
  const ast = parse(entryFile);
  return getCustomComponentUtilities(ast);
}, date => invalidateByModifiedDate(date, configPath));

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
