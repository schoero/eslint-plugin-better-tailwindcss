import { runAsWorker } from "synckit";

import { getConflictingClasses } from "./conflicting-classes.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";

import type { GetConflictingClassesRequest } from "./conflicting-classes.js";


runAsWorker(async ({ classes, configPath }: GetConflictingClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getConflictingClasses(context, classes);
});
