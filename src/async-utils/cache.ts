import { env } from "node:process";

import { getModifiedDate } from "./fs.js";


interface CacheItem {
  date: Date;
  value: any;
}

const CACHE = new Map<string, CacheItem>();

export function invalidateByModifiedDate(cache: CacheItem, path: string): boolean {
  const modified = getModifiedDate(path);
  return !modified || modified > cache.date;
}

export function withCache<Result>(key: string, callback: () => Result, invalidate?: (cache: CacheItem, cacheKey: string) => boolean): Result;
export function withCache<Result>(key: string, callback: () => Promise<Result>, invalidate?: (cache: CacheItem, cacheKey: string) => boolean): Promise<Result>;
export function withCache<Result>(key: string, callback: () => Promise<Result> | Result, invalidate: (cache: CacheItem, cacheKey: string) => boolean = invalidateByModifiedDate): Promise<Result> | Result {
  const cached = CACHE.get(key);

  if(env.NODE_ENV !== "test" && cached && !invalidate(cached, key)){
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
