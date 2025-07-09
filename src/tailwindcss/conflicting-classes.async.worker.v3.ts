import { runAsWorker } from "synckit";

import { getConflictingClasses } from "./conflicting-classes.async.v3.js";

import type { GetConflictingClassesRequest } from "./conflicting-classes.js";


runAsWorker(async (_: GetConflictingClassesRequest) => getConflictingClasses());
