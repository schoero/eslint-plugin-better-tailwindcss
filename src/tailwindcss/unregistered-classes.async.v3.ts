import { runAsWorker } from "synckit";
import * as rules from "tailwindcss3/lib/lib/generateRules.js";

import { createTailwindContext } from "./context.async.v3.js";

import type { GetUnregisteredClassesRequest, GetUnregisteredClassesResponse } from "./unregistered-classes.js";


runAsWorker(async ({ classes, configPath }: GetUnregisteredClassesRequest) => {
  const context = await createTailwindContext(configPath);
  return getUnregisteredClasses(context, classes);
});

export function getUnregisteredClasses(context: any, classes: string[]): GetUnregisteredClassesResponse {
  return classes
    .filter(className => {
      const generated = rules.generateRules?.([className], context) ?? rules.default?.generateRules?.([className], context);

      return generated.length === 0;
    });
}
