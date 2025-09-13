import { pathToFileURL } from "node:url";

import { isESModule } from "better-tailwindcss:utils/module.js";
import { isWindows } from "better-tailwindcss:utils/platform.js";


export function normalize(path: string): string {
  return isWindows() && isESModule() ? pathToFileURL(path).toString() : path;
}
