import { readFileSync } from "node:fs";
import { cwd } from "node:process";

import { resolveJson } from "better-tailwindcss:utils/resolvers.js";
import { parseSemanticVersion } from "better-tailwindcss:utils/version.js";


export function getTailwindCSSVersion() {
  const packageJsonPath = resolveJson("tailwindcss/package.json", cwd());

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  return parseSemanticVersion(packageJson.version);
}
