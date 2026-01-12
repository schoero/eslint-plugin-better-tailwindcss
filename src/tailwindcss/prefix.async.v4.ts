import type { Prefix, Suffix } from "./prefix.js";


export function getPrefix(context: any): Prefix {
  return context.theme.prefix ?? "";
}

export function getSuffix(context: any): Suffix {
  return !!context.theme.prefix ? ":" : "";
}
