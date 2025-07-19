import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { createTailwindContext } from "./context.async.v4.js";
import { getUnregisteredClasses } from "./unregistered-classes.async.v4.js";

import type { GetUnregisteredClassesRequest, GetUnregisteredClassesResponse } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath, cwd, tsconfigPath }: GetUnregisteredClassesRequest): Promise<GetUnregisteredClassesResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd, tsconfigPath });
  const tailwindContext = await createTailwindContext(ctx);

  const unregisteredClasses = getUnregisteredClasses(tailwindContext, classes);
  return { unregisteredClasses, warnings: [...warnings] };
});
