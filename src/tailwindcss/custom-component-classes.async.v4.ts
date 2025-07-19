import { readFileSync } from "node:fs";
import { dirname } from "node:path";

import { fork } from "@eslint/css-tree";
import { tailwind4 } from "tailwind-csstree";

import { withCache } from "../async-utils/cache.js";
import { resolveCss } from "../async-utils/resolvers.js";

import type { CssNode } from "@eslint/css-tree";

import type { AsyncContext } from "../async-utils/context.js";
import type { CustomComponentClasses } from "./custom-component-classes.js";


interface CssFile {
  ast: CssNode;
  imports: string[];
}

interface CssFiles {
  [resolvedPath: string]: CssFile;
}

const { findAll, generate, parse } = fork(tailwind4);

export async function getCustomComponentClasses(ctx: AsyncContext): Promise<CustomComponentClasses> {

  const resolvedPath = await resolveCss(ctx, ctx.tailwindConfigPath);
  const files = await parseCssFilesDeep(ctx, resolvedPath);

  const utilities = Object.values(files).reduce<string[]>((customComponentClasses, { ast }) => {
    customComponentClasses.push(...getCustomComponentUtilities(ast));
    return customComponentClasses;
  }, []);

  return utilities;
}

async function parseCssFilesDeep(ctx: AsyncContext, resolvedPath: string): Promise<CssFiles> {
  const cssFiles: CssFiles = {};

  const cssFile = await parseCssFile(ctx, resolvedPath);

  if(!cssFile){
    return cssFiles;
  }

  cssFiles[resolvedPath] = cssFile;

  for(const importPath of cssFile.imports){
    const importedFiles = await parseCssFilesDeep(ctx, importPath);

    for(const importedFile in importedFiles){
      cssFiles[importedFile] = importedFiles[importedFile];
    }
  }
  return cssFiles;
}

const parseCssFile = async (ctx: AsyncContext, resolvedPath: string): Promise<CssFile | undefined> => withCache(resolvedPath, async () => {
  try {
    const content = readFileSync(resolvedPath, "utf-8");
    const ast = parse(content);

    const importNodes = findAll(ast, node => node.type === "Atrule" &&
      node.name === "import" &&
      node.prelude?.type === "AtrulePrelude");

    const importPromises = importNodes.reduce<Promise<string>[]>((importPromises, importNode) => {
      if(importNode.type !== "Atrule" || !importNode.prelude){
        return importPromises;
      }

      const importStatement = generate(importNode.prelude).match(/["'](?<importPath>[^"']+)["']/);

      if(!importStatement){
        return importPromises;
      }

      const { importPath } = importStatement.groups || {};

      const cwd = dirname(resolvedPath);
      importPromises.push(resolveCss(ctx, importPath, cwd));

      return importPromises;
    }, []);

    const imports = await Promise.all(importPromises);

    return {
      ast,
      imports: imports.filter(Boolean)
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
