import { resolve } from "node:path";

import { cache } from "./cache.js";

import type { AsyncContext } from "../utils/context.js";
import type { OperationHandlers, OperationResponse, Operations, TailwindContextInfo } from "./operations.js";


// records a file the context is built from. Call it before the file is read.
export type TrackFile = (path: string) => void;

interface CachedTailwindContext<TailwindContext> {
  context: TailwindContext;
  files: Record<string, number>;
}

// the worker handles one operation at a time, this is the context the current operation used
let usedContext: TailwindContextInfo | undefined;

let lastRefreshCount: number | undefined;

// returns the Tailwind CSS context for the config of `ctx`, every config has its own context.
// the context is built again when one of the files it was built from changes.
export async function loadTailwindContext<TailwindContext>(
  ctx: AsyncContext,
  build: (ctx: AsyncContext, track: TrackFile) => Promise<TailwindContext>
): Promise<TailwindContext> {
  let cached = cache.get<CachedTailwindContext<TailwindContext>>(ctx.contextKey);

  if(!cached){
    const files: Record<string, number> = {};

    const track: TrackFile = path => {
      const resolved = resolve(path);
      files[resolved] ??= cache.modified(resolved);
    };

    if(ctx.tsconfigPath){
      track(ctx.tsconfigPath);
    }

    const context = await build(ctx, track);

    cached = { context, files };

    // most rules use the context, counting it against the capacity would only evict it and force a rebuild.
    // it is released instead when the config resolves to a different context, see `releaseTailwindContext()`
    cache.set(ctx.contextKey, cached, { files, weight: 0 });
  }

  usedContext = { files: cached.files, version: cache.version(ctx.contextKey) ?? -1 };

  return cached.context;
}

// drops a context that is no longer used because its config resolves to a different context.
export function releaseTailwindContext(contextKey: string): boolean {
  return cache.delete(contextKey);
}

// runs an operation in the worker and reports the context it used, so that the ESLint thread can cache the result.
export function createOperationRunner(handlers: OperationHandlers) {
  return async <Operation extends keyof Operations>(refreshCount: number, operation: Operation, ...args: Parameters<Operations[Operation]>): Promise<OperationResponse<ReturnType<Operations[Operation]>>> => {
    // the ESLint thread checks the files once per linted file, checking them on every operation would stat every tracked file again
    if(refreshCount !== lastRefreshCount){
      lastRefreshCount = refreshCount;
      cache.refresh();
    }

    usedContext = undefined;

    const result = await (handlers[operation] as (...args: Parameters<Operations[Operation]>) => Promise<ReturnType<Operations[Operation]>>)(...args);

    return { context: usedContext, result };
  };
}
