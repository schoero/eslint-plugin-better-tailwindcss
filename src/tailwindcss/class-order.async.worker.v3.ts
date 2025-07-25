import { runAsWorker } from "synckit";

import { getAsyncContext } from "../async-utils/context.js";
import { getClassOrder } from "./class-order.async.v3.js";
import { createTailwindContext } from "./context.async.v3.js";

import type { GetClassOrderRequest, GetClassOrderResponse } from "./class-order.js";


runAsWorker(async ({ classes, configPath, cwd, tsconfigPath }: GetClassOrderRequest): Promise<GetClassOrderResponse> => {
  const { ctx, warnings } = await getAsyncContext({ configPath, cwd, tsconfigPath });
  const context = await createTailwindContext(ctx);

  const classOrder = getClassOrder(context, classes);
  return { classOrder, warnings: [...warnings] };
});
