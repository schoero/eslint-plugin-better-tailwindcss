import { Cache } from "better-tailwindcss:utils/cache.js";

import { normalize } from "../async-utils/path.js";

import type { AsyncContext } from "../utils/context.js";


export const createTailwindContext = async (ctx: AsyncContext) => Cache.get(
  "tailwind-context",
  async () => {
    const { default: defaultConfig } = await import(normalize(`${ctx.installation}/defaultConfig.js`));
    const setupContextUtils = await import(normalize(`${ctx.installation}/lib/lib/setupContextUtils.js`));
    const { default: loadConfig } = await import(normalize(`${ctx.installation}/loadConfig.js`));
    const { default: resolveConfig } = await import(normalize(`${ctx.installation}/resolveConfig.js`));

    const config = resolveConfig(
      ctx.tailwindConfigPath === "default"
        ? defaultConfig
        : loadConfig(ctx.tailwindConfigPath)
    );

    return setupContextUtils.createContext?.(config) ?? setupContextUtils.default?.createContext?.(config);
  },
  { cache: Cache.ISOLATED_CACHE, path: ctx.tailwindConfigPath }
);
