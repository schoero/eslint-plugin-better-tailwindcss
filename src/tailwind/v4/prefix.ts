import { findDefaultConfig, findTailwindConfigPath } from "./config.js";
import { createTailwindContextFromEntryPoint } from "./context.js";

import type { GetPrefixRequest, GetPrefixResponse } from "../api/interface.js";


export async function getPrefix({ configPath, cwd }: GetPrefixRequest): Promise<GetPrefixResponse> {
  const config = findTailwindConfigPath(cwd, configPath);
  const defaultConfig = findDefaultConfig(cwd);
  const path = config ?? defaultConfig;

  if(!path){
    throw new Error("Could not find a valid Tailwind CSS configuration");
  }

  const context = await createTailwindContextFromEntryPoint(path);

  const prefix = context.theme.prefix ?? "";

  return [prefix, ""];
}
