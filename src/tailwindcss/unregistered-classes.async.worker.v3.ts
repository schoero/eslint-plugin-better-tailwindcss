import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { createTailwindContext } from "./context.async.v3.js";
import { getUnregisteredClasses } from "./unregistered-classes.async.v3.js";

import type { GetUnregisteredClassesRequest, GetUnregisteredClassesResponse } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath, cwd }: GetUnregisteredClassesRequest): Promise<GetUnregisteredClassesResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd });
  const context = await createTailwindContext(ctx);

  const unregisteredClasses = getUnregisteredClasses(context, classes);
  return { unregisteredClasses, warnings: [...warnings] };
});
