import defaultConfig from "tailwindcss3/defaultConfig.js";
import * as setupContextUtils from "tailwindcss3/lib/lib/setupContextUtils.js";
import loadConfig from "tailwindcss3/loadConfig.js";
import resolveConfig from "tailwindcss3/resolveConfig.js";

import { withCache } from "../async-utils/cache.js";

import type { AsyncContext } from "../async-utils/context.js";


export const createTailwindContext = async (ctx: AsyncContext) => withCache(ctx.tailwindConfigPath, async () => {
  const tailwindConfig = loadTailwindConfig(ctx.tailwindConfigPath);
  return setupContextUtils.createContext?.(tailwindConfig) ?? setupContextUtils.default?.createContext?.(tailwindConfig);
});

function loadTailwindConfig(path: string) {
  const config = path === "default"
    ? defaultConfig
    : loadConfig(path);

  return resolveConfig(config);
}
