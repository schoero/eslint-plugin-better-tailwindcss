import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";
import { getUnknownClasses } from "./unknown-classes.async.v4.js";

import type { Async } from "../types/async.js";
import type { GetUnknownClasses } from "./unknown-classes.js";


runAsWorker<Async<GetUnknownClasses>>(async (ctx, classes) => {
  const context = await createTailwindContext(ctx);
  const unknownClasses = getUnknownClasses(context, classes);

  return { unknownClasses, warnings: ctx.warnings };
});
