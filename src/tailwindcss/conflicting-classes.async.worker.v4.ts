import { runAsWorker } from "synckit";

import { getConflictingClasses } from "./conflicting-classes.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";

import type { Async } from "../types/async.js";
import type { GetConflictingClasses } from "./conflicting-classes.js";


runAsWorker<Async<GetConflictingClasses>>(async (ctx, classes) => {
  const context = await createTailwindContext(ctx);
  const conflictingClasses = await getConflictingClasses(context, classes);

  return { conflictingClasses, warnings: ctx.warnings };
});
