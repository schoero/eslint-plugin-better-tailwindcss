import { runAsWorker } from "synckit";

import { createOperationRunner } from "../async-utils/tailwind-context.js";
import { getCanonicalClasses } from "./canonical-classes.async.v4.js";
import { getClassOrder } from "./class-order.async.v4.js";
import { getConflictingClasses } from "./conflicting-classes.async.v4.js";
import { createTailwindContext } from "./context.async.v4.js";
import { getCustomComponentClasses } from "./custom-component-classes.async.v4.js";
import { getDissectedClasses } from "./dissect-classes.async.v4.js";
import { getPrefix, getSuffix } from "./prefix.async.v4.js";
import { getUnknownClasses } from "./unknown-classes.async.v4.js";
import { getVariantOrder } from "./variant-order.async.v4.js";

import type { OperationHandlers } from "../async-utils/operations.js";


const handlers: OperationHandlers = {
  getCanonicalClasses: async (ctx, classes, options) => {
    const tailwindContext = await createTailwindContext(ctx);
    return getCanonicalClasses(tailwindContext, classes, options);
  },
  getClassOrder: async (ctx, classes) => {
    const tailwindContext = await createTailwindContext(ctx);
    return getClassOrder(tailwindContext, classes);
  },
  getConflictingClasses: async (ctx, classes) => {
    const tailwindContext = await createTailwindContext(ctx);
    return getConflictingClasses(tailwindContext, classes);
  },
  getCustomComponentClasses: async ctx => {
    // the result is derived from the same css files as the context, which tracks them
    await createTailwindContext(ctx);
    return getCustomComponentClasses(ctx);
  },
  getDissectedClasses: async (ctx, classes) => {
    const tailwindContext = await createTailwindContext(ctx);
    return getDissectedClasses(tailwindContext, classes);
  },
  getPrefix: async ctx => {
    const tailwindContext = await createTailwindContext(ctx);
    return { prefix: getPrefix(tailwindContext), suffix: getSuffix(tailwindContext) };
  },
  getUnknownClasses: async (ctx, classes) => {
    const tailwindContext = await createTailwindContext(ctx);
    return getUnknownClasses(tailwindContext, classes);
  },
  getVariantOrder: async (ctx, classes) => {
    const tailwindContext = await createTailwindContext(ctx);
    return getVariantOrder(tailwindContext, classes);
  }
};

runAsWorker(createOperationRunner(handlers));
