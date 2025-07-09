import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";

import type { GetClassVariantsRequest, GetClassVariantsResponse } from "./class-variants.js";


runAsWorker(async ({ classes, configPath }: GetClassVariantsRequest) => {
  const context = await createTailwindContext(configPath);
  return getClassVariants(context, classes);
});

export function getClassVariants(context: any, classes: string[]): GetClassVariantsResponse {
  return classes.map(className => {
    const [parsed] = context.parseCandidate(className);

    if(!parsed?.variants){
      return [className, []];
    }

    const variants = parsed.variants.map(variant => context.printVariant(variant)).reverse();
    return [className, variants];
  });
}
