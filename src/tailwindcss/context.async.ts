import { getTailwindcssVersion, TailwindcssVersion } from "../utils/version.js";
import { createTailwindContext as createTailwindContextV3 } from "./context.async.v3.js";
import { createTailwindContext as createTailwindContextV4 } from "./context.async.v4.js";


export async function createTailwindContext(configPath: string) {
  const version = getTailwindcssVersion();

  if(version.major === TailwindcssVersion.V3){
    return createTailwindContextV3(configPath);
  } else {
    return createTailwindContextV4(configPath);
  }
}
