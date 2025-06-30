import { runAsWorker } from "synckit";
import * as utils from "tailwindcss3/lib/util/splitAtTopLevelOnly.js";

import { createTailwindContext } from "./context.async.v3.js";

import type { GetClassVariantsRequest, GetClassVariantsResponse } from "./class-variants.js";


runAsWorker(async ({ classes, configPath }: GetClassVariantsRequest): Promise<GetClassVariantsResponse> => {
  const context = await createTailwindContext(configPath);
  const separator = context.tailwindConfig.separator ?? ":";

  return classes
    .map(className => {
      const splitChunks = utils.splitAtTopLevelOnly?.(className, separator) ?? utils.default?.splitAtTopLevelOnly?.(className, separator);
      const variants = splitChunks.slice(0, -1);
      return [className, variants];
    });
});
