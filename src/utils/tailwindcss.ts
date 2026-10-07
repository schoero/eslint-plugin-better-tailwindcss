import { readFileSync } from "node:fs";

import { literal, object, parse, string } from "valibot";

import { Cache } from "better-tailwindcss:utils/cache.js";
import { resolveJson } from "better-tailwindcss:utils/resolvers.js";
import { parseSemanticVersion } from "better-tailwindcss:utils/version.js";


const packageJsonSchema = object({
  name: literal("tailwindcss"),
  version: string()
});

export function getTailwindPackageJsonPath(cwd: string) {
  return Cache.get(
    "tailwind-package-json-path",
    () => {
      return resolveJson("tailwindcss/package.json", cwd);
    },
    { tag: cwd }
  );
}

export function getTailwindVersion(packageJsonPath: string) {
  return Cache.get(
    "tailwind-version",
    () => {
      const packageJson = parse(packageJsonSchema, JSON.parse(readFileSync(packageJsonPath, "utf-8")));
      return parseSemanticVersion(packageJson.version);
    },
    { path: packageJsonPath }
  );
}
