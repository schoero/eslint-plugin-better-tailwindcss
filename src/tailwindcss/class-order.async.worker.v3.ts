import { runAsWorker } from "synckit";

import { getClassOrder } from "./class-order.async.v3.js";
import { createTailwindContext } from "./context.async.v3.js";

import type { GetClassOrderRequest } from "./class-order.js";


runAsWorker(async ({ classes, configPath }: GetClassOrderRequest) => {
  const context = await createTailwindContext(configPath);
  return getClassOrder(context, classes);
});
