import { env } from "node:process";

import { getModifiedDate } from "./fs.js";


const CACHE = new Map<string, { date: Date; value: any; }>();

export function invalidateByModifiedDate(cacheDate: Date, path: string): boolean {
  const modified = getModifiedDate(path);
  return !modified || modified > cacheDate;
}

export function withCache<Result>(key: string, callback: () => Result, invalidate?: (cacheDate: Date, cacheKey: string) => boolean): Result;
export function withCache<Result>(key: string, callback: () => Promise<Result>, invalidate?: (cacheDate: Date, cacheKey: string) => boolean): Promise<Result>;
export function withCache<Result>(key: string, callback: () => Promise<Result> | Result, invalidate: (cacheDate: Date, cacheKey: string) => boolean = invalidateByModifiedDate): Promise<Result> | Result {
  const cached = CACHE.get(key);

  if(env.NODE_ENV !== "test" && cached && !invalidate(cached.date, key)){
    return cached.value;
  }

  const value = callback();

  if(value instanceof Promise){
    return value.then(resolvedValue => {
      CACHE.set(key, { date: new Date(), value: resolvedValue });
      return resolvedValue;
    });
  } else {
    CACHE.set(key, { date: new Date(), value });
    return value;
  }
}
