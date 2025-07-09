import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";
import { getShorthandClasses } from "./shorthand-classes.async.v3.js";

import type { GetShorthandClassesRequest } from "./shorthand-classes.js";


runAsWorker(async ({ classes, configPath }: GetShorthandClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getShorthandClasses(context, classes);
});
