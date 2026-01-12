import { runAsWorker } from "synckit";

import type { Async } from "../types/async.js";
import type { GetConflictingClasses } from "./conflicting-classes.js";


runAsWorker<Async<GetConflictingClasses>>(async () => {
  return { conflictingClasses: {}, warnings: [] };
});
