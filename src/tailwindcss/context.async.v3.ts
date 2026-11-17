import { normalize } from "../async-utils/path.js";
import { loadTailwindContext } from "../async-utils/tailwind-context.js";

import type { TrackFile } from "../async-utils/tailwind-context.js";
import type { AsyncContext } from "../utils/context.js";


export const createTailwindContext = async (ctx: AsyncContext) => loadTailwindContext(ctx, buildTailwindContext);

async function buildTailwindContext(ctx: AsyncContext, track: TrackFile) {
  const { default: defaultConfig } = await import(normalize(`${ctx.installation}/defaultConfig.js`));
  const setupContextUtils = await import(normalize(`${ctx.installation}/lib/lib/setupContextUtils.js`));
  const { default: loadConfig } = await import(normalize(`${ctx.installation}/loadConfig.js`));
  const { default: resolveConfig } = await import(normalize(`${ctx.installation}/resolveConfig.js`));

  if(ctx.tailwindConfigPath !== "default"){
    track(ctx.tailwindConfigPath);
  }

  const config = resolveConfig(
    ctx.tailwindConfigPath === "default"
      ? defaultConfig
      : loadConfig(ctx.tailwindConfigPath)
  );

  return setupContextUtils.createContext?.(config) ?? setupContextUtils.default?.createContext?.(config);
}
