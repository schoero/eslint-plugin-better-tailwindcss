import { runAsWorker } from "synckit";

import type { GetConflictingClassesRequest, GetConflictingClassesResponse } from "./conflicting-classes.js";


runAsWorker(async (_: GetConflictingClassesRequest) => {
  return getConflictingClasses();
});

export async function getConflictingClasses(): Promise<GetConflictingClassesResponse> {
  return {};
}
