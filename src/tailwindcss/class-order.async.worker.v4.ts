import { runAsWorker } from "synckit";

import { getClassOrder } from "./class-order.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";

import type { Async } from "../types/async.js";
import type { GetClassOrder } from "./class-order.js";


runAsWorker<Async<GetClassOrder>>(async (ctx, classes) => {
  const context = await createTailwindContext(ctx);
  const classOrder = getClassOrder(context, classes);

  return { classOrder, warnings: ctx.warnings };
});
