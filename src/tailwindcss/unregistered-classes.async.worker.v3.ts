import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";
import { getUnregisteredClasses } from "./unregistered-classes.async.v3.js";

import type { GetUnregisteredClassesRequest } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath }: GetUnregisteredClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getUnregisteredClasses(context, classes);
});
