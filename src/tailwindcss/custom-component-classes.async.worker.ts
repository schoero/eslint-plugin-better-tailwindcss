import { runAsWorker } from "synckit";

import { getTailwindcssVersion } from "../async-utils/version.js";

import type {
  GetCustomComponentClassesRequest,
  GetCustomComponentClassesResponse
} from "./custom-component-classes.js";


runAsWorker(async (request: GetCustomComponentClassesRequest): Promise<GetCustomComponentClassesResponse> => {
  const version = getTailwindcssVersion();
  const { getCustomComponentClasses } = await import(`./custom-component-classes.async.v${version.major}.js`);
  return getCustomComponentClasses(request);
});
