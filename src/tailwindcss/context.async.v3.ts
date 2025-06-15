import defaultConfig from "tailwindcss3/defaultConfig.js";
import * as setupContextUtils from "tailwindcss3/lib/lib/setupContextUtils.js";
import loadConfig from "tailwindcss3/loadConfig.js";
import resolveConfig from "tailwindcss3/resolveConfig.js";

import { withCache } from "../utils/cache.js";


export const createTailwindContext = async (configPath: string) => withCache(configPath, async () => {
  const tailwindConfig = loadTailwindConfig(configPath);
  return setupContextUtils.createContext?.(tailwindConfig) ?? setupContextUtils.default?.createContext?.(tailwindConfig);
});

function loadTailwindConfig(path: string) {
  const config = path === "default"
    ? defaultConfig
    : loadConfig(path);

  return resolveConfig(config);
}
