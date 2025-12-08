import { dirname } from "node:path";
import { cwd } from "node:process";

import { getTailwindCSSVersion } from "better-tailwindcss:tests/utils/version.js";
import { resolveJson } from "better-tailwindcss:utils/resolvers.js";

import type { Context } from "better-tailwindcss:types/rule.js";


export function createTestContext(): Context {
  return {
    cwd: cwd(),
    installation: dirname(resolveJson("tailwindcss/package.json", cwd())),
    options: {},
    version: getTailwindCSSVersion()
  } as Context;
}
