import type { Prefix } from "./prefix.js";


export function getPrefix(tailwindContext: any): Prefix {
  return tailwindContext.tailwindConfig.prefix ?? "";
}

export function getSuffix(tailwindContext: any): string {
  return "";
}
