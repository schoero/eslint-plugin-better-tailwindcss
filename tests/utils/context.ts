import { dirname } from "node:path";
import { cwd } from "node:process";

import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version.js";
import { resolveJson } from "better-tailwindcss:utils/resolvers.js";

import type { Context } from "better-tailwindcss:types/rule.js";


export function createTestContext(): Context {
  const installationPath = resolveJson("tailwindcss/package.json", cwd());

  if(!installationPath){
    throw new Error("Tailwind CSS is not installed.");
  }

  return {
    cwd: cwd(),
    installation: dirname(installationPath),
    options: {},
    version: getTailwindCSSVersion()
  } as Context;
}
