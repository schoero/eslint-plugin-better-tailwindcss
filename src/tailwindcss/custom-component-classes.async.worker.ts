import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";

import type {
  GetCustomComponentClassesRequest,
  GetCustomComponentClassesResponse
} from "./custom-component-classes.js";


runAsWorker(async ({ configPath, cwd, tsconfigPath }: GetCustomComponentClassesRequest): Promise<GetCustomComponentClassesResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd, tsconfigPath });
  const { getCustomComponentClasses } = await import(`./custom-component-classes.async.v${ctx.version.major}.js`);

  const customComponentClasses = await getCustomComponentClasses(ctx);
  return { customComponentClasses, warnings: [...warnings] };
});
