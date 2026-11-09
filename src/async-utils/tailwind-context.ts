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

// a context uses a few megabytes and grows with the classes it has seen, so only a few of them are kept
// in a monorepo, the contexts of the least recently linted configs are dropped and built again when needed
const CONTEXT_WEIGHT = 2000;

// the worker handles one operation at a time, this is the context the current operation used
let usedContext: TailwindContextInfo | undefined;

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
    cache.set(ctx.contextKey, cached, { files, weight: CONTEXT_WEIGHT });
  }

  usedContext = { files: cached.files, version: cache.version(ctx.contextKey) ?? -1 };

  return cached.context;
}

// runs an operation in the worker and reports the context it used, so that the ESLint thread can cache the result.
export function createOperationRunner(handlers: OperationHandlers) {
  return async <Operation extends keyof Operations>(operation: Operation, ...args: Parameters<Operations[Operation]>): Promise<OperationResponse<ReturnType<Operations[Operation]>>> => {
    // files may have changed since the previous operation
    cache.refresh();
    usedContext = undefined;

    const result = await (handlers[operation] as (...args: Parameters<Operations[Operation]>) => Promise<ReturnType<Operations[Operation]>>)(...args);

    return { context: usedContext, result };
  };
}
