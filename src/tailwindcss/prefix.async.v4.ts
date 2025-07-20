import type { Prefix } from "./prefix.js";


export function getPrefix(context: any): Prefix {
  return context.theme.prefix ?? "";
}

export function getSuffix(context: any): string {
  return !!context.theme.prefix ? ":" : "";
}
