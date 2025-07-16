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


interface CssFile {
  ast: CssNode;
  imports: string[];
}

interface CssFiles {
  [resolvedPath: string]: CssFile;
}

const { findAll, generate, parse } = fork(tailwind4);

export function getCustomComponentClasses({ configPath, cwd }: GetCustomComponentClassesRequest): GetCustomComponentClassesResponse {

  const resolvedPath = resolveCss(cwd, configPath);
  const files = parseCssFilesDeep(resolvedPath);

  const utilities = Object.values(files).reduce<string[]>((customComponentClasses, { ast }) => {
    customComponentClasses.push(...getCustomComponentUtilities(ast));
    return customComponentClasses;
  }, []);

  return utilities;
}

function parseCssFilesDeep(resolvedPath: string): CssFiles {
  const cssFiles: CssFiles = {};

  const cssFile = parseCssFile(resolvedPath);

  if(!cssFile){
    return cssFiles;
  }

  cssFiles[resolvedPath] = cssFile;

  for(const importPath of cssFile.imports){
    const importedFiles = parseCssFilesDeep(importPath);

    for(const importedFile in importedFiles){
      cssFiles[importedFile] = importedFiles[importedFile];
    }
  }
  return cssFiles;
}

const parseCssFile = (resolvedPath: string): CssFile | undefined => withCache(resolvedPath, () => {
  try {
    const content = readFileSync(resolvedPath, "utf-8");
    const ast = parse(content);

    const importNodes = findAll(ast, node => node.type === "Atrule" &&
      node.name === "import" &&
      node.prelude?.type === "AtrulePrelude");

    const imports = importNodes.reduce<string[]>((imports, importNode) => {
      if(importNode.type !== "Atrule" || !importNode.prelude){
        return imports;
      }

      const importStatement = generate(importNode.prelude).match(/["'](?<importPath>[^"']+)["']/);

      if(!importStatement){
        return imports;
      }

      const { importPath } = importStatement.groups || {};

      const cwd = dirname(resolvedPath);
      const resolvedImportPath = resolveCss(cwd, importPath);

      if(resolvedImportPath){
        imports.push(resolvedImportPath);
      }

      return imports;
    }, []);

    return {
      ast,
      imports
    } satisfies CssFile;

  } catch {}
});


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
