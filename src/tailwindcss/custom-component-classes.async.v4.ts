import { readFile } from "node:fs/promises";
import { dirname } from "node:path";

import { fork } from "@eslint/css-tree";
import { runAsWorker } from "synckit";
import { tailwind4 } from "tailwind-csstree";

import { withCache } from "../async-utils/cache.js";
import { resolveCss } from "../async-utils/resolvers.js";

import type { CssNode } from "@eslint/css-tree";

import type { AsyncContext } from "../utils/context.js";


interface CssFile {
  ast: CssNode;
  imports: string[];
}

interface CssFiles {
  [resolvedPath: string]: CssFile;
}

const { findAll, generate, parse } = fork(tailwind4);


runAsWorker(async ctx => {
  const resolvedPath = resolveCss(ctx, ctx.tailwindConfigPath);

  const files = await parseCssFilesDeep(ctx, resolvedPath);

  const utilities = Object.values(files).reduce<string[]>((customComponentClasses, { ast }) => {
    customComponentClasses.push(...getCustomComponentUtilities(ast));
    return customComponentClasses;
  }, []);

  return { customComponentClasses: utilities, warnings: ctx.warnings };
});

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

const parseCssFile = async (ctx: AsyncContext, resolvedPath: string): Promise<CssFile | undefined> => withCache("css-file", resolvedPath, async () => {
  try {
    const content = await readFile(resolvedPath, "utf-8");
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
      const resolvedImportPath = resolveCss(ctx, importPath, cwd);

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
