import { runAsWorker } from "synckit";

import { createTailwindContext } from "./context.async.v4.js";

import type { GetClassVariantsRequest, GetClassVariantsResponse } from "./class-variants.js";


runAsWorker(async ({ classes, configPath }: GetClassVariantsRequest): Promise<GetClassVariantsResponse> => {
  const context = await createTailwindContext(configPath);
  return classes.map(className => {
    const [parsed] = context.parseCandidate(className);
    const variants = parsed.variants.reverse().map(variant => context.printVariant(variant));
    return [className, variants];
  });
});
