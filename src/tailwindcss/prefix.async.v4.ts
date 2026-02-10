import type { Prefix, Suffix } from "./prefix.js";


export function getPrefix(tailwindContext: any): Prefix {
  return tailwindContext.theme.prefix ?? "";
}

export function getSuffix(tailwindContext: any): Suffix {
  return !!tailwindContext.theme.prefix ? ":" : "";
}
