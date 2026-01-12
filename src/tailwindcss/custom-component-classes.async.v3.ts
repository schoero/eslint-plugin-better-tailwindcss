import { runAsWorker } from "synckit";

import type { Async } from "../types/async.js";
import type { GetCustomComponentClasses } from "./custom-component-classes.js";


runAsWorker<Async<GetCustomComponentClasses>>(async ctx => {
  return { customComponentClasses: [], warnings: ctx.warnings };
});
