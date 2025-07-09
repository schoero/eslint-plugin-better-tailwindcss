import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";
import { getUnregisteredClasses } from "./unregistered-classes.async.v4.js";

import type { GetUnregisteredClassesRequest } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath }: GetUnregisteredClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getUnregisteredClasses(context, classes);
});
