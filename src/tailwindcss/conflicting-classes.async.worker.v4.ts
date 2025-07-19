import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { getConflictingClasses } from "./conflicting-classes.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";

import type { GetConflictingClassesRequest, GetConflictingClassesResponse } from "./conflicting-classes.js";


runAsWorker(async ({ classes, configPath, cwd }: GetConflictingClassesRequest): Promise<GetConflictingClassesResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd });

  const context = await createTailwindContext(ctx);
  const conflictingClasses = await getConflictingClasses(context, classes);

  return { conflictingClasses, warnings: [...warnings] };
});
