import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";
import { getDissectedClasses } from "./dissect-classes.async.v3.js";

import type { GetDissectedClassRequest } from "./dissect-classes.js";


runAsWorker(async ({ classes, configPath }: GetDissectedClassRequest) => {
  const context = await createTailwindContext(configPath);
  return getDissectedClasses(context, classes);
});
