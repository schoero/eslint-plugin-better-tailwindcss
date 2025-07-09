import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";
import { getShorthandClasses } from "./shorthand-classes.async.v4.js";

import type { GetShorthandClassesRequest } from "./shorthand-classes.js";


runAsWorker(async ({ classes, configPath }: GetShorthandClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getShorthandClasses(context, classes);
});
