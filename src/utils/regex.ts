const REGEX_CACHE = new Map<string, RegExp>();
const MAX_CACHE_SIZE = 500;

function getRegexCacheKey(pattern: string, flags?: string): string {
  return flags ? `${flags}\u0000${pattern}` : pattern;
}

export function getCachedRegex(pattern: string, flags?: string): RegExp {
  const cacheKey = getRegexCacheKey(pattern, flags);
  let regex = REGEX_CACHE.get(cacheKey);

  if(!regex){
    if(REGEX_CACHE.size >= MAX_CACHE_SIZE){
      const firstKey = REGEX_CACHE.keys().next().value;
      if(firstKey !== undefined){
        REGEX_CACHE.delete(firstKey);
      }
    }

    regex = new RegExp(pattern, flags);
    REGEX_CACHE.set(cacheKey, regex);
  }

  if(regex.global || regex.sticky){
    regex.lastIndex = 0;
  }

  return regex;
}
