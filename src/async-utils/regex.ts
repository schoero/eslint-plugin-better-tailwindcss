import { cache, cacheKey } from "./cache.js";


// returns a cached `RegExp` for a pattern that is only known at runtime, for example from options.
// use regex literals for static patterns instead.
export function getCachedRegex(pattern: string, flags: string = ""): RegExp {
  const regex = cache.getOrCreate(cacheKey("regex", flags, pattern), () => new RegExp(pattern, flags));

  if(regex.global || regex.sticky){
    regex.lastIndex = 0;
  }

  return regex;
}
