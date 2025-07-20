import type { Prefix } from "./prefix.js";


export function getPrefix(context: any): Prefix {
  return context.tailwindConfig.prefix ?? "";
}

export function getSuffix(context: any): string {
  return "";
}
