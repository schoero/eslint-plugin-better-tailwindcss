import { findTailwindConfig } from "./config.js";
import { createTailwindContextFromConfigFile } from "./context.js";

import type { GetPrefixRequest, GetPrefixResponse } from "../api/interface.js";


export async function getPrefix({ configPath, cwd }: GetPrefixRequest): Promise<GetPrefixResponse> {
  const config = findTailwindConfig(cwd, configPath);
  const context = await createTailwindContextFromConfigFile(config);

  const prefix = context.tailwindConfig.prefix ?? "";

  return [prefix, ""];
}
