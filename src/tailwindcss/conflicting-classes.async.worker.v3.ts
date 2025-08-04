import { runAsWorker } from "synckit";

import type { GetConflictingClassesRequest, GetConflictingClassesResponse } from "./conflicting-classes.js";


runAsWorker(async (_: GetConflictingClassesRequest): Promise<GetConflictingClassesResponse> => {
  return { conflictingClasses: {}, warnings: [] };
});
