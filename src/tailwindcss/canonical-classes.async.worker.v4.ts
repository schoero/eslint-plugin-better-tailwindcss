import { runAsWorker } from "synckit";

import { getCanonicalClasses } from "./canonical-classes.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";

import type { Async } from "../types/async.js";
import type { GetCanonicalClasses } from "./canonical-classes.js";


runAsWorker<Async<GetCanonicalClasses>>(async (ctx, classes) => {
  const tailwindContext = await createTailwindContext(ctx);
  const canonicalClasses = getCanonicalClasses(tailwindContext, classes);

  return { canonicalClasses, warnings: ctx.warnings };
});
