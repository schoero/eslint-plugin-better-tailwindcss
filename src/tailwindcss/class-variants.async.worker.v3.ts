import { runAsWorker } from "synckit";

import { getClassVariants } from "./class-variants.async.v3.js";
import { createTailwindContext } from "./context.async.v3.js";

import type { GetClassVariantsRequest } from "./class-variants.js";


runAsWorker(async ({ classes, configPath }: GetClassVariantsRequest) => {
  const context = await createTailwindContext(configPath);
  return getClassVariants(context, classes);
});
