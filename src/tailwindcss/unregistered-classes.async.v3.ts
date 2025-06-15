import { runAsWorker } from "synckit";
import * as rules from "tailwindcss3/lib/lib/generateRules.js";

import { createTailwindContext } from "./context.async.v3.js";

import type { GetUnregisteredClassesRequest, GetUnregisteredClassesResponse } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath }: GetUnregisteredClassesRequest): Promise<GetUnregisteredClassesResponse> => {
  const context = await createTailwindContext(configPath);

  return classes
    .filter(className => {
      return (rules.generateRules?.([className], context) ?? rules.default?.generateRules?.([className], context)).length === 0;
    });
});
