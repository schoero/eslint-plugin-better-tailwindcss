import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";

import type { GetClassOrderRequest, GetClassOrderResponse } from "./class-order.js";


runAsWorker(async ({ classes, configPath }: GetClassOrderRequest) => {
  const context = await createTailwindContext(configPath);
  return getClassOrder(context, classes);
});

export async function getClassOrder(context: any, classes: string[]): Promise<GetClassOrderResponse> {
  return context.getClassOrder(classes);
}
