import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";

import type { GetClassOrderRequest, GetClassOrderResponse } from "./class-order.js";


runAsWorker(async ({ classes, configPath }: GetClassOrderRequest): Promise<GetClassOrderResponse> => {
  const context = await createTailwindContext(configPath);
  return context.getClassOrder(classes);
});
