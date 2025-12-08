import { runAsWorker } from "synckit";

import type { Async } from "../types/async.js";
import type { GetCanonicalClasses } from "./canonical-classes.js";


runAsWorker<Async<GetCanonicalClasses>>(async (ctx, classes) => {
  return { canonicalClasses: classes, warnings: ctx.warnings };
});
