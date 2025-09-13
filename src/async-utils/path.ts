import { pathToFileURL } from "node:url";

import { isESModule } from "./module.js";
import { isWindows } from "./platform.js";


export function normalize(path: string): string {
  return isWindows() && isESModule() ? pathToFileURL(path).toString() : path;
}
