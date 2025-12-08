import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v3.js";
import { getUnknownClasses } from "./unknown-classes.async.v3.js";

import type { Async } from "../types/async.js";
import type { GetUnknownClasses } from "./unknown-classes.js";


runAsWorker<Async<GetUnknownClasses>>(async (ctx, classes) => {
  const tailwindContext = await createTailwindContext(ctx);
  const unknownClasses = await getUnknownClasses(ctx, tailwindContext, classes);

  return { unknownClasses, warnings: ctx.warnings };
});
