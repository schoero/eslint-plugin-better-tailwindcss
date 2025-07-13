import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";
import { getDeprecatedClasses } from "./deprecated-classes.async.v4.js";

import type { GetDeprecatedClassesRequest } from "./deprecated-classes.js";


runAsWorker(async ({ classes, configPath }: GetDeprecatedClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getDeprecatedClasses(context, classes);
});
