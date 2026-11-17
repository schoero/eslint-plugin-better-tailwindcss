import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { cache, cacheKey } from "better-tailwindcss:utils/cache.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";
import type {
  OperationResponse,
  RunOperation,
  SendOperation,
  TailwindContextInfo
} from "better-tailwindcss:utils/operations.js";


export function createRunOperation(ctx: Context): RunOperation {
  const workerPath = resolve(import.meta.dirname, `./tailwind.async.worker.v${ctx.version.major}.js`);
  const send = createSyncFn(workerPath, getWorkerOptions()) as SendOperation;

  return (operation, ...args) => send(cache.refreshCount, operation, ...args);
}

export function getOrRunOperation<Result>(ctx: AsyncContext, key: string, run: () => OperationResponse<Result>): Result {
  const cached = cache.get<Result>(key);

  if(cached !== undefined){
    return cached;
  }

  const { context, result } = run();

  storeContext(ctx, context);
  storeResult(ctx, key, result, context);

  return result;
}

// for operations whose result for a class does not depend on the other classes
// every class is cached on its own, so classes that appear in many class lists are stored once and only new classes reach the worker
export function getOrRunOperationPerClass<Value>(
  ctx: AsyncContext,
  name: string,
  classes: string[],
  run: (uncachedClasses: string[]) => OperationResponse<Record<string, Value>>
): Record<string, Value> {
  const values: Record<string, Value> = Object.create(null);
  const uncachedKeys = new Map<string, string>();

  for(const className of classes){
    if(className in values || uncachedKeys.has(className)){
      continue;
    }

    const key = cacheKey(name, ctx.contextKey, className);
    const value = cache.get<Value>(key);

    if(value === undefined){
      uncachedKeys.set(className, key);
    } else {
      values[className] = value;
    }
  }

  if(uncachedKeys.size > 0){
    const { context, result } = run([...uncachedKeys.keys()]);

    storeContext(ctx, context);

    const entries: [key: string, value: Value][] = [];

    for(const [className, key] of uncachedKeys){
      values[className] = result[className];
      entries.push([key, result[className]]);
    }

    cache.setMany(entries, { dependencies: context ? [ctx.contextKey] : [] });
  }

  return values;
}

// records the Tailwind CSS context the worker used together with the files it was built from.
// results computed from it become stale as soon as one of these files changes, without a round trip to the worker.
// a context that the worker built again has a new version, which makes the results computed from the previous one stale.
export function storeContext(ctx: AsyncContext, context: TailwindContextInfo | undefined): void {
  if(!context || cache.get<number>(ctx.contextKey) === context.version){
    return;
  }

  // the worker built the context again because a file changed, so the modification times
  // memoized at the start of the linted file are outdated
  cache.refresh();
  cache.set(ctx.contextKey, context.version, { files: context.files });
}

export function storeResult(ctx: AsyncContext, key: string, result: unknown, context: TailwindContextInfo | undefined): void {
  cache.set(key, result, { dependencies: context ? [ctx.contextKey] : [] });
}
