import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { cache, cacheKey } from "better-tailwindcss:utils/cache.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Context } from "better-tailwindcss:types/rule.js";
import type { AsyncContext } from "better-tailwindcss:utils/context.js";
import type { OperationResponse, RunOperation, TailwindContextInfo } from "better-tailwindcss:utils/operations.js";


export function createRunOperation(ctx: Context): RunOperation {
  const workerPath = resolve(import.meta.dirname, `./tailwind.async.worker.v${ctx.version.major}.js`);
  return createSyncFn(workerPath, getWorkerOptions()) as RunOperation;
}

// returns the cached result of an operation or runs it in the worker.
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
  const uncachedClasses = new Set<string>();

  for(const className of classes){
    if(className in values || uncachedClasses.has(className)){
      continue;
    }

    const value = cache.get<Value>(cacheKey(name, ctx.contextKey, className));

    if(value === undefined){
      uncachedClasses.add(className);
    } else {
      values[className] = value;
    }
  }

  if(uncachedClasses.size > 0){
    const { context, result } = run([...uncachedClasses]);

    storeContext(ctx, context);

    for(const className of uncachedClasses){
      values[className] = result[className];
      storeResult(ctx, cacheKey(name, ctx.contextKey, className), result[className], context);
    }
  }

  return values;
}

// records the Tailwind CSS context the worker used together with the files it was built from.
// results computed from it become stale as soon as one of these files changes, without a round trip to the worker.
// a context that the worker built again has a new version, which makes the results computed from the previous one stale.
export function storeContext(ctx: AsyncContext, context: TailwindContextInfo | undefined): void {
  if(context){
    cache.set(ctx.contextKey, context.version, { files: context.files });
  }
}

export function storeResult(ctx: AsyncContext, key: string, result: unknown, context: TailwindContextInfo | undefined): void {
  cache.set(key, result, { dependencies: context ? [ctx.contextKey] : [] });
}
