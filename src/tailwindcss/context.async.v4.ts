import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import { createJiti } from "jiti";

import { withCache } from "../async-utils/cache.js";
import { normalize } from "../async-utils/path.js";
import { resolveCss, resolveJs } from "../async-utils/resolvers.js";

import type { AsyncContext } from "../utils/context.js";


export const createTailwindContext = async (ctx: AsyncContext) => withCache("tailwind-context", ctx.tailwindConfigPath, async () => {
  const jiti = createJiti(getCurrentFilename(), {
    fsCache: false,
    moduleCache: false
  });

  const importBasePath = dirname(ctx.tailwindConfigPath);
  const tailwindPath = resolveJs(ctx, "tailwindcss", importBasePath);

  // eslint-disable-next-line eslint-plugin-typescript/naming-convention
  const { __unstable__loadDesignSystem } = await import(normalize(tailwindPath));

  const css = await readFile(ctx.tailwindConfigPath, "utf-8");

  // Load the design system and set up a compatible context object that is
  // usable by the rest of the plugin
  const design = await __unstable__loadDesignSystem(css, {
    base: importBasePath,
    loadModule: createLoader(ctx, jiti, {
      filepath: ctx.tailwindConfigPath,
      legacy: false,
      onError: (id, err, resourceType) => {
        console.error(`Unable to load ${resourceType}: ${id}`, err);

        if(resourceType === "config"){
          return {};
        } else if(resourceType === "plugin"){
          return () => {};
        }
      }
    }),

    loadStylesheet: async (id: string, base: string) => {
      try {
        const resolved = resolveCss(ctx, id, base);

        return {
          base: dirname(resolved),
          content: await readFile(resolved, "utf-8")
        };
      } catch {
        return {
          base: "",
          content: ""
        };
      }
    }
  });

  return design;
});

function createLoader<T>(ctx: AsyncContext, jiti: ReturnType<typeof createJiti>, {
  filepath,
  legacy,
  onError
}: {
  filepath: string;
  legacy: boolean;
  onError: (id: string, error: unknown, resourceType: string) => T;
}) {
  const cacheKey = `${+Date.now()}`;

  async function loadFile(id: string, base: string, resourceType: string) {
    try {
      const resolved = resolveJs(ctx, id, base);

      const url = pathToFileURL(resolved);
      url.searchParams.append("t", cacheKey);

      return await jiti.import(url.href, { default: true });
    } catch (err){
      return onError(id, err, resourceType);
    }
  }

  if(legacy){
    const baseDir = dirname(filepath);
    return async (id: string) => loadFile(id, baseDir, "module");
  }

  return async (id: string, base: string, resourceType: string) => {
    return {
      base,
      module: await loadFile(id, base, resourceType)
    };
  };
}

function getCurrentFilename() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.url;
}
