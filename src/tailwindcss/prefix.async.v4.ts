import type { GetPrefixResponse } from "./prefix.js";


export function getPrefix(context: any): GetPrefixResponse {
  return context.theme.prefix ?? "";
}
