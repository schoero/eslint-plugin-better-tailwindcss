import { runAsWorker } from "synckit";

import type { Async } from "../types/async.js";
import type { GetCanonicalClasses } from "./canonical-classes.js";


runAsWorker<Async<GetCanonicalClasses>>(async (ctx, classes) => {
  const canonicalClasses = classes.reduce((acc, className) => {
    acc[className] = {
      input: [className],
      output: className
    };
    return acc;
  }, {});

  return {
    canonicalClasses,
    warnings: ctx.warnings
  };
});
