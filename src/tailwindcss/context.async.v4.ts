import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import { createJiti } from "jiti";
import postcss from "postcss";
import postcssImport from "postcss-import";

import { withCache } from "../async-utils/cache.js";
import { isESModule } from "../async-utils/module.js";
import { isWindows } from "../async-utils/platform.js";
import { cjsResolver, esmResolver, resolveCss, resolveJs } from "../async-utils/resolvers.js";


export const createTailwindContext = async (entryPoint: string) => withCache(entryPoint, async () => {

  // Create a Jiti instance that can be used to load plugins and config files
  const jiti = createJiti(getCurrentFilename(), {
    fsCache: false,
    moduleCache: false
  });

  const importBasePath = dirname(entryPoint);

  const tailwindPath = (
    isESModule()
      ? esmResolver
      : cjsResolver
  ).resolveSync({}, importBasePath, "tailwindcss");

  if(!tailwindPath){
    throw new Error("Could not find Tailwind CSS");
  }

  const tailwindUrl = isWindows() && isESModule() ? pathToFileURL(tailwindPath).toString() : tailwindPath;

  // eslint-disable-next-line eslint-plugin-typescript/naming-convention
  const { __unstable__loadDesignSystem } = await import(tailwindUrl);

  let css = await readFile(entryPoint, "utf-8");

  // Determine if the v4 API supports resolving `@import`
  let supportsImports = false;
  try {
    await __unstable__loadDesignSystem('@import "./empty";', {
      loadStylesheet: async () => {
        supportsImports = true;
        return {
          base: importBasePath,
          content: ""
        };
      }
    });
  } catch {}

  if(!supportsImports){
    const resolveImports = postcss([postcssImport()]);
    const result = await resolveImports.process(css, { from: entryPoint });
    css = result.css;
  }

  // Load the design system and set up a compatible context object that is
  // usable by the rest of the plugin
  const design = await __unstable__loadDesignSystem(css, {
    base: importBasePath,
    loadModule: createLoader({
      filepath: entryPoint,
      jiti,
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
        const resolved = resolveCss(base, id);

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

function createLoader<T>({
  filepath,
  jiti,
  legacy,
  onError
}: {
  filepath: string;
  jiti: ReturnType<typeof createJiti>;
  legacy: boolean;
  onError: (id: string, error: unknown, resourceType: string) => T;
}) {
  const cacheKey = `${+Date.now()}`;

  async function loadFile(id: string, base: string, resourceType: string) {
    try {
      const resolved = resolveJs(base, id);

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
