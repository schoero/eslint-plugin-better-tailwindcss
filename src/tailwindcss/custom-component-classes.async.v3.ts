import { runAsWorker } from "synckit";

import type {
  GetCustomComponentClassesRequest,
  GetCustomComponentClassesResponse
} from "./custom-component-classes.js";


runAsWorker(getCustomComponentClasses);

export function getCustomComponentClasses(_: GetCustomComponentClassesRequest): GetCustomComponentClassesResponse {
  return [];
}
