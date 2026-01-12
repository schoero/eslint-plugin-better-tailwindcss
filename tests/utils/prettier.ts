import { format as prettierFormat } from "prettier";

import type { Options } from "prettier";


export async function prettier(
  content: string,
  options?: Options
): Promise<string> {
  return prettierFormat(content, options);
}
