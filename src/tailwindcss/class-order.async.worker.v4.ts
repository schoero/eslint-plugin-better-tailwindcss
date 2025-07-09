import { runAsWorker } from "synckit";

import { getClassOrder } from "./class-order.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";

import type { GetClassOrderRequest } from "./class-order.js";


runAsWorker(async ({ classes, configPath }: GetClassOrderRequest) => {
  const context = await createTailwindContext(configPath);
  return getClassOrder(context, classes);
});
