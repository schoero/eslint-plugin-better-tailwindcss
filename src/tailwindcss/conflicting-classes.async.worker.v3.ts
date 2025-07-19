import { runAsWorker } from "synckit";

import type { GetConflictingClassesRequest } from "./conflicting-classes.js";


runAsWorker(async (_: GetConflictingClassesRequest) => {
  return {};
});
