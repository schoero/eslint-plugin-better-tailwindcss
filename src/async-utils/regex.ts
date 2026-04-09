const REGEX_CACHE = new Map<string, RegExp>();
const MAX_CACHE_SIZE = 500;


function getRegexCacheKey(pattern: string, flags: string): string {
  return `${flags}\u0000${pattern}`;
}

export function getCachedRegex(regex: RegExp): RegExp;
export function getCachedRegex(pattern: string, flags?: string): RegExp;
export function getCachedRegex(patternOrRegex: RegExp | string, flags?: string): RegExp {
  const regexFlags = typeof patternOrRegex === "string"
    ? flags ?? ""
    : patternOrRegex.flags;

  const regexPattern = typeof patternOrRegex === "string"
    ? patternOrRegex
    : patternOrRegex.source;

  const cacheKey = getRegexCacheKey(regexPattern, regexFlags);

  let regex = REGEX_CACHE.get(cacheKey);

  if(!regex){
    if(REGEX_CACHE.size >= MAX_CACHE_SIZE){
      const firstKey = REGEX_CACHE.keys().next().value;
      if(firstKey !== undefined){
        REGEX_CACHE.delete(firstKey);
      }
    }

    regex = typeof patternOrRegex === "string"
      ? new RegExp(patternOrRegex, flags)
      : patternOrRegex;

    REGEX_CACHE.set(cacheKey, regex);
  }

  if(regex.global || regex.sticky){
    regex.lastIndex = 0;
  }

  return regex;
}
