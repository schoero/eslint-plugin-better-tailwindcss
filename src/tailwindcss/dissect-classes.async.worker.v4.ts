import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";
import { getDissectedClasses } from "./dissect-classes.async.v4.js";

import type { Async } from "../types/async.js";
import type { GetDissectedClasses } from "./dissect-classes.js";


runAsWorker<Async<GetDissectedClasses>>(async (ctx, classes) => {
  const tailwindContext = await createTailwindContext(ctx);
  const dissectedClasses = getDissectedClasses(tailwindContext, classes);

  return { dissectedClasses, warnings: ctx.warnings };
});
