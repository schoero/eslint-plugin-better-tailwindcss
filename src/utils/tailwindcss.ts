import { readFileSync } from "node:fs";
import { dirname } from "node:path";

import { cache, cacheKey } from "better-tailwindcss:utils/cache.js";
import { resolveJson } from "better-tailwindcss:utils/resolvers.js";
import { parseSemanticVersion } from "better-tailwindcss:utils/version.js";


// called for every rule and every linted file
export function getTailwindPackage(cwd: string) {
  const packageJsonPath = cache.getOrCreate(cacheKey("tailwind-package-json", cwd), () => resolveJson("tailwindcss/package.json", cwd));

  if(!packageJsonPath){
    return;
  }

  // read again when tailwind is updated in place
  return cache.getOrCreate(cacheKey("tailwind-package", packageJsonPath), () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    return {
      installation: dirname(packageJsonPath),
      version: parseSemanticVersion(packageJson.version)
    };
  }, { files: [packageJsonPath] });
}
