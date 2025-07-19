import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { getClassOrder } from "./class-order.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";

import type { GetClassOrderRequest, GetClassOrderResponse } from "./class-order.js";


runAsWorker(async ({ classes, configPath, cwd }: GetClassOrderRequest): Promise<GetClassOrderResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd });
  const context = await createTailwindContext(ctx);

  const classOrder = getClassOrder(context, classes);
  return { classOrder, warnings: [...warnings] };
});
