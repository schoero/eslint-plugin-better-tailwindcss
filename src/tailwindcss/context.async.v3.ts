import { withCache } from "../async-utils/cache.js";

import type { AsyncContext } from "../utils/context.js";


export const createTailwindContext = async (ctx: AsyncContext) => withCache("tailwind-context", ctx.tailwindConfigPath, async () => {
  const { default: defaultConfig } = await import(`${ctx.installation}/defaultConfig.js`);
  const setupContextUtils = await import(`${ctx.installation}/lib/lib/setupContextUtils.js`);
  const { default: loadConfig } = await import(`${ctx.installation}/loadConfig.js`);
  const { default: resolveConfig } = await import(`${ctx.installation}/resolveConfig.js`);

  const config = resolveConfig(
    ctx.tailwindConfigPath === "default"
      ? defaultConfig
      : loadConfig(ctx.tailwindConfigPath)
  );

  return setupContextUtils.createContext?.(config) ?? setupContextUtils.default?.createContext?.(config);
});
